"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Download, ShoppingCart, X, CheckCircle, ShieldCheck, Loader2, Box, Eye, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function CatalogueViewer() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get('t');
  const idsParam = searchParams.get('ids');
  
  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState({ crm_name: 'Catalogue', logo_url: '', theme_color: '#39FF14' });
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [leadForm, setLeadForm] = useState({ name: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    const loadCatalog = async () => {
      if (!tenantId || !idsParam) {
        setIsLoading(false);
        return;
      }
      const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
      
      try {
        const { data: sData } = await supabase.from('crm_settings').select('*').eq('tenant_id', tenantId).maybeSingle();
        if (sData) {
          setSettings({
            crm_name: sData.crm_name || 'Catalogue',
            logo_url: sData.logo_url || '',
            theme_color: sData.theme_color || '#39FF14'
          });
        }

        const { data: pData } = await supabase.from('crm_products').select('*').eq('tenant_id', tenantId).in('id', ids);
        if (pData) setProducts(pData);
        
        // Analytics: Enregistrer une vue du catalogue en ligne
        await supabase.from('catalog_analytics').insert([{ tenant_id: tenantId, event_type: 'view' }]);
        
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadCatalog();
  }, [tenantId, idsParam]);

  const downloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text(settings.crm_name, 14, 20);
      doc.setFontSize(14);
      doc.text("Catalogue Produits", 14, 30);
      
      const tableData = products.map(p => [
        p.name,
        p.category || '-',
        `${(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F CFA`
      ]);
      
      autoTable(doc, {
        startY: 40,
        head: [['Produit', 'Catégorie', 'Prix']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
      });
      
      doc.save(`Catalogue_${settings.crm_name.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let cleanPhone = leadForm.phone.replace(/\s+/g, '');
      if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) cleanPhone = `+221${cleanPhone}`;
      else if (!cleanPhone.startsWith('+')) cleanPhone = `+${cleanPhone}`;

      const payload = {
        tenant_id: tenantId,
        full_name: leadForm.name,
        phone: cleanPhone,
        intent: viewingProduct ? `Intéressé par : ${viewingProduct.name}` : 'Contact depuis le Catalogue',
        message: leadForm.message,
        source: 'Catalogue en ligne',
        status: 'Nouveaux Leads',
        password: 'central2026' // Mot de passe par défaut
      };
      
      const { error } = await supabase.from('crm_leads').insert([payload]);
      if (error) throw error;
      
      if (viewingProduct) {
         await supabase.from('catalog_analytics').insert([{ tenant_id: tenantId, event_type: 'click_whatsapp', product_id: viewingProduct.id }]);
      }

      setLeadSuccess(true);
      setTimeout(() => {
        setLeadSuccess(false);
        setViewingProduct(null);
        setLeadForm({ name: '', phone: '', message: '' });
      }, 3000);
      
    } catch (err: any) {
      alert("Erreur d'envoi : " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const similarProducts = viewingProduct 
    ? products.filter(p => p.id !== viewingProduct.id && p.category === viewingProduct.category).slice(0, 3)
    : [];

  if (isLoading) return <div className="h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950"><Loader2 className="animate-spin text-zinc-500 w-10 h-10"/></div>;

  if (!tenantId || products.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 text-center p-6">
        <Box size={48} className="text-zinc-300 mb-4" />
        <h1 className="text-2xl font-black uppercase text-zinc-800 dark:text-zinc-200">Catalogue indisponible</h1>
        <p className="text-zinc-500 mt-2 font-medium">Le lien est invalide ou les produits ont été retirés.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-black dark:text-white font-sans flex flex-col">
      {/* HEADER */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="h-10 w-auto object-contain rounded-md" />
            ) : (
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center"><Box size={20} className="text-white"/></div>
            )}
            <h1 className="text-lg font-black uppercase tracking-tighter hidden sm:block">{settings.crm_name}</h1>
          </div>
          <button onClick={downloadPDF} disabled={isGeneratingPdf} className="bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition flex items-center gap-2 disabled:opacity-50">
            {isGeneratingPdf ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>} Télécharger PDF
          </button>
        </div>
      </header>

      {/* CATALOG GRID */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="text-center mb-12">
           <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Notre Sélection</h2>
           <p className="text-zinc-500 font-bold text-sm md:text-base">Découvrez nos produits et demandez un devis en un clic.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(p => (
            <div key={p.id} onClick={() => setViewingProduct(p)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden cursor-pointer group hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full">
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                 {p.image_url ? (
                   <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-zinc-300"><Box size={48}/></div>
                 )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{p.category || 'Général'}</p>
                 <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2">{p.name}</h3>
                 <div className="mt-auto pt-3 flex items-center justify-between">
                    <p className="font-black text-lg" style={{ color: settings.theme_color }}>{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors"><Eye size={14}/></div>
                 </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-zinc-100 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 py-12 px-6 mt-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
           {settings.logo_url && <img src={settings.logo_url} alt="Logo" className="h-12 w-auto object-contain mb-6 grayscale opacity-50" />}
           <h3 className="font-black uppercase tracking-widest text-zinc-800 dark:text-zinc-200 mb-4">{settings.crm_name}</h3>
           <p className="text-xs font-bold text-zinc-500 max-w-md mx-auto mb-6 leading-relaxed">
             Merci de votre visite sur notre catalogue digital. N'hésitez pas à nous contacter pour toute demande de devis ou information supplémentaire.
           </p>
           <div className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
             <ShieldCheck size={14}/> Catalogue Sécurisé par OnyxOps
           </div>
        </div>
      </footer>

      {/* MODALE PRODUIT & CROSS-SELL */}
      {viewingProduct && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setViewingProduct(null)} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] max-w-4xl w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 flex flex-col max-h-[95vh] overflow-hidden">
            <button onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors z-20"><X size={16}/></button>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10">
              <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
                {/* Image */}
                <div className="w-full md:w-1/2 shrink-0">
                  <div className="w-full aspect-square rounded-3xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800">
                    {viewingProduct.image_url ? (
                      <img src={viewingProduct.image_url} alt={viewingProduct.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-300"><Box size={64}/></div>
                    )}
                  </div>
                </div>
                
                {/* Details & Form */}
                <div className="w-full md:w-1/2 flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full w-max mb-4">{viewingProduct.category || 'Produit'}</span>
                  <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4 leading-tight">{viewingProduct.name}</h2>
                  <p className="text-3xl font-black mb-6" style={{ color: settings.theme_color }}>{(viewingProduct.unit_price || viewingProduct.price_ttc || 0).toLocaleString('fr-FR')} <span className="text-base text-zinc-500">FCFA</span></p>
                  
                  <div className="prose prose-sm dark:prose-invert mb-8 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap">
                    {viewingProduct.description || "Aucune description détaillée n'est disponible pour ce produit."}
                  </div>

                  {/* LEAD CAPTURE FORM */}
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 mt-auto">
                    <h3 className="font-black uppercase text-sm mb-4">Demander un devis / Commander</h3>
                    {leadSuccess ? (
                       <div className="bg-green-100 text-green-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                         <CheckCircle size={24} />
                         <p className="text-xs font-bold uppercase tracking-widest">Demande envoyée !</p>
                         <p className="text-xs font-medium">Un conseiller va vous recontacter sur WhatsApp très rapidement.</p>
                       </div>
                    ) : (
                      <form onSubmit={submitLead} className="space-y-3">
                        <input type="text" required placeholder="Votre Prénom & Nom *" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-black dark:focus:border-white transition" />
                        <input type="tel" required placeholder="Votre Numéro WhatsApp *" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-black dark:focus:border-white transition" />
                        <textarea placeholder="Une question ? Une quantité spécifique ?" value={leadForm.message} onChange={e => setLeadForm({...leadForm, message: e.target.value})} className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-black dark:focus:border-white transition resize-none h-20"></textarea>
                        <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl font-black uppercase text-xs shadow-md hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2" style={{ backgroundColor: settings.theme_color, color: '#000' }}>
                          {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} {isSubmitting ? 'Envoi...' : 'Envoyer la demande'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              {/* CROSS-SELL: PRODUITS SIMILAIRES */}
              {similarProducts.length > 0 && (
                <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><ShoppingCart size={16}/> Dans la même catégorie</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {similarProducts.map(sp => (
                        <div key={sp.id} onClick={() => { setViewingProduct(sp); setLeadSuccess(false); }} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:border-black dark:hover:border-white transition-colors group">
                           <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-800 overflow-hidden shrink-0">
                             {sp.image_url ? <img src={sp.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <Box size={24} className="m-auto mt-4 text-zinc-300"/>}
                           </div>
                           <div className="min-w-0">
                             <p className="font-bold text-xs truncate leading-tight text-black dark:text-white">{sp.name}</p>
                             <p className="text-xs font-black mt-1" style={{ color: settings.theme_color }}>{(sp.unit_price || sp.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                           </div>
                        </div>
                     ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CataloguePage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-black"><Loader2 className="animate-spin text-[#39FF14] w-10 h-10"/></div>}>
      <CatalogueViewer />
    </Suspense>
  );
}
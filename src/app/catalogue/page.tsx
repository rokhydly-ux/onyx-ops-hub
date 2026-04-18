"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Download, ShoppingCart, X, CheckCircle, ShieldCheck, Loader2, Box, Eye, Send, Minus, Plus, Trash2, Search, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
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
  const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewQty, setViewQty] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [showOnlyPromos, setShowOnlyPromos] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [isRecentModalOpen, setIsRecentModalOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeCategory, sortOrder, showOnlyPromos]);

  useEffect(() => {
    const saved = localStorage.getItem('onyx_catalog_recent');
    if (saved) {
      try { setRecentlyViewed(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const handleViewProduct = (p: any) => {
    setViewingProduct(p);
    setViewQty(1);
    setLeadSuccess(false);
    setRecentlyViewed(prev => {
      const filtered = prev.filter(item => item.id !== p.id);
      const updated = [p, ...filtered].slice(0, 10);
      localStorage.setItem('onyx_catalog_recent', JSON.stringify(updated));
      return updated;
    });
  };

  const addToCart = (product: any, qty: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + qty } : item);
      }
      return [...prev, { product, qty }];
    });
    setViewingProduct(null);
    setIsCartOpen(true);
  };

  const updateCartQty = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => item.product.id === productId ? { ...item, qty: Math.max(1, item.qty + delta) } : item));
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

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

  const buildCatalogPDF = async () => {
    const doc = new jsPDF();
    
    // Cover
    doc.setFillColor(0, 0, 0);
    doc.rect(0, 0, 210, 297, 'F');
    if (settings.logo_url) {
        try {
            const img = new Image();
            img.crossOrigin = "Anonymous";
            img.src = settings.logo_url;
            await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
            doc.addImage(img, 'PNG', 85, 60, 40, 40);
        } catch(e) {}
    }
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text(settings.crm_name.toUpperCase(), 105, 130, { align: 'center' });
    doc.setFontSize(16);
    doc.setTextColor(150, 150, 150);
    doc.text("Catalogue Produits", 105, 145, { align: 'center' });

    // Pages
    const productsPerPage = 6;
    for (let i = 0; i < products.length; i += productsPerPage) {
        doc.addPage();
        doc.setFillColor(255, 255, 255);
        doc.rect(0, 0, 210, 297, 'F');
        
        doc.setFillColor(0, 0, 0);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text(settings.crm_name.toUpperCase(), 14, 16);

        const pageProducts = products.slice(i, i + productsPerPage);
        let startY = 35;
        let startX = 14;
        const colWidth = 85;
        const rowHeight = 80;
        
        for (let j = 0; j < pageProducts.length; j++) {
            const p = pageProducts[j];
            const col = j % 2;
            const row = Math.floor(j / 2);
            const x = startX + col * (colWidth + 10);
            const y = startY + row * rowHeight;
            
            if (p.image_url) {
                try {
                    const img = new Image();
                    img.crossOrigin = "Anonymous";
                    img.src = p.image_url;
                    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
                    doc.addImage(img, 'JPEG', x, y, colWidth, 45);
                } catch(e) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(x, y, colWidth, 45, 'F');
                }
            } else {
                doc.setFillColor(240, 240, 240);
                doc.rect(x, y, colWidth, 45, 'F');
            }
            
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(11);
            doc.setFont("helvetica", "bold");
            const titleLines = doc.splitTextToSize(p.name || 'Produit', colWidth);
            doc.text(titleLines.slice(0, 2), x, y + 52);
            
            doc.setFontSize(9);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100, 100, 100);
            doc.text(`${p.category || ''} ${p.subcategory ? ' - ' + p.subcategory : ''}`, x, y + 60);
            
            if (p.description) {
                doc.setFontSize(8);
                const descLines = doc.splitTextToSize(p.description, colWidth);
                doc.text(descLines.slice(0, 2), x, y + 66);
            }

            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.setTextColor(0, 0, 0); 
            doc.text(`${(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F CFA`, x, y + 74);
        }
    }
    return doc;
  };

  const downloadPDF = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = await buildCatalogPDF();
      doc.save(`Catalogue_${settings.crm_name.replace(/\s+/g, '_')}.pdf`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const sharePDFWhatsApp = async () => {
    setIsGeneratingPdf(true);
    try {
      const doc = await buildCatalogPDF();
      const fileName = `Catalogue_${settings.crm_name.replace(/\s+/g, '_')}.pdf`;
      const pdfBlob = doc.output('blob');
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: settings.crm_name,
          text: `Découvrez notre catalogue : ${settings.crm_name}`
        });
      } else {
        // Fallback pour Desktop (Upload Temporaire Supabase puis lien direct WA)
        const uniqueName = `catalogues/${Date.now()}_${fileName}`;
        const { error } = await supabase.storage.from('tontines').upload(uniqueName, file, { contentType: 'application/pdf' });
        if (error) throw error;
        const { data } = supabase.storage.from('tontines').getPublicUrl(uniqueName);
        const link = data.publicUrl;
        window.open(`https://wa.me/?text=${encodeURIComponent(`Découvrez notre catalogue : ${settings.crm_name}\n\nLien de téléchargement : ${link}`)}`, '_blank');
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors du partage. Assurez-vous d'avoir une bonne connexion.");
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

      const itemsText = cart.map(i => `- ${i.product.name} (x${i.qty})`).join('\n');
      const totalAmount = Math.round(cart.reduce((acc, item) => acc + ((item.product.unit_price || item.product.price_ttc || 0) * item.qty), 0)) || 0;
      const fullMessage = `${leadForm.message ? leadForm.message + '\n\n' : ''}Produits demandés :\n${itemsText}\nTotal estimé : ${totalAmount.toLocaleString('fr-FR')} F`;

      const payload = {
        tenant_id: tenantId,
        full_name: leadForm.name,
        phone: cleanPhone,
        source: 'Catalogue Studio',
        intent: 'Demande de Devis',
        status: 'Nouveaux Leads',
        budget: totalAmount,
        amount: totalAmount
      };
      
      const { data: newLeadData, error } = await supabase.from('crm_leads').insert([payload]).select();
      if (error) throw error;
      
      if (newLeadData && newLeadData.length > 0) {
          try {
              await supabase.from('lead_notes').insert([{
                  lead_id: newLeadData[0].id,
                  user_id: tenantId,
                  note: fullMessage.substring(0, 3000)
              }]);
          } catch(e) { console.error(e); }
      }

      // Optimisation Anti-OOM : on nettoie les objets produits avant de les insérer en JSONB pour éviter un excès de taille
      const cleanCartItems = cart.map(item => ({
          id: item.product.id,
          name: item.product.name,
          qty: item.qty,
          unit_price: item.product.unit_price || item.product.price_ttc || 0,
          image_url: item.product.image_url?.length < 1000 ? item.product.image_url : null
      }));

      try {
          await supabase.from('crm_quotes').insert([{
              tenant_id: tenantId,
              client_name: leadForm.name,
              items: cleanCartItems,
              total_amount: totalAmount
          }]);
      } catch(e) { console.error(e); }

      setLeadSuccess(true);
      setCart([]);
      setLeadForm({ name: '', phone: '', message: '' });
      
      setTimeout(() => {
          const msg = encodeURIComponent(`Bonjour, je souhaite un devis pour ces articles de votre catalogue :\n\n${itemsText}\nTotal : ${totalAmount.toLocaleString('fr-FR')} F\n\nMerci de me recontacter.`);
          window.open(`https://wa.me/?text=${msg}`, '_blank');
      }, 1500);

    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const similarProducts = viewingProduct
    ? products.filter(p => p.id !== viewingProduct.id && p.category === viewingProduct.category).slice(0, 3)
    : [];

  const uniqueCategories = ["Toutes", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const filteredProducts = products.filter(p => {
    const matchSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                        (p.category || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === "Toutes" || p.category === activeCategory;
    const matchPromo = showOnlyPromos ? (Array.isArray(p.tags) && p.tags.includes('En Promo')) : true;
    return matchSearch && matchCat && matchPromo;
  }).sort((a, b) => {
    const priceA = a.unit_price || a.price_ttc || 0;
    const priceB = b.unit_price || b.price_ttc || 0;
    if (sortOrder === 'asc') return priceA - priceB;
    if (sortOrder === 'desc') return priceB - priceA;
    return 0;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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
          <div className="flex items-center gap-2 sm:gap-3">
            <button onClick={() => setIsRecentModalOpen(true)} className="bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white px-3 sm:px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-sm hover:scale-105 transition flex items-center gap-2" title="Récemment consultés">
              <Clock size={16}/> <span className="hidden sm:inline">Historique</span>
            </button>
            <button onClick={sharePDFWhatsApp} disabled={isGeneratingPdf} className="bg-[#25D366] text-white px-3 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition flex items-center gap-2 disabled:opacity-50" title="Partager sur WhatsApp">
              {isGeneratingPdf ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} <span className="hidden sm:inline">Partager WA</span>
            </button>
            <button onClick={downloadPDF} disabled={isGeneratingPdf} className="bg-black dark:bg-white text-white dark:text-black px-3 sm:px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition flex items-center gap-2 disabled:opacity-50" title="Télécharger en PDF">
              {isGeneratingPdf ? <Loader2 size={16} className="animate-spin"/> : <Download size={16}/>} <span className="hidden sm:inline">Télécharger PDF</span>
            </button>
          </div>
        </div>
      </header>

      {/* CATALOG GRID */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="text-center mb-12">
           <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Notre Sélection</h2>
           <p className="text-zinc-500 font-bold text-sm md:text-base">Découvrez nos produits et demandez un devis en un clic.</p>
        </div>

        <div className="flex flex-col items-center gap-4 max-w-2xl mx-auto mb-8">
           <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
              <input 
                 type="text" 
                 placeholder="Rechercher un produit ou une catégorie..." 
                 value={searchTerm} 
                 onChange={(e) => setSearchTerm(e.target.value)} 
                 className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold text-sm outline-none focus:border-[#39FF14] dark:focus:border-[#39FF14] transition-colors shadow-sm"
              />
           </div>

           {uniqueCategories.length > 1 && (
             <div className="flex flex-wrap items-center justify-center gap-2 w-full">
               {uniqueCategories.map((cat: any) => (
                 <button 
                   key={cat} 
                   onClick={() => setActiveCategory(cat)} 
                   className={`px-4 py-2 rounded-full text-xs font-black uppercase transition-all shadow-sm border ${activeCategory === cat ? 'bg-black dark:bg-white text-[#39FF14] dark:text-black border-black dark:border-white scale-105' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white'}`}
                 >
                   {cat}
                 </button>
               ))}
             </div>
           )}
           
           <div className="flex flex-wrap items-center justify-center gap-4 mt-2 w-full">
               <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                  <span className="text-[10px] font-black uppercase text-zinc-400 px-2">Trier par prix :</span>
                  <button onClick={() => setSortOrder(sortOrder === 'asc' ? null : 'asc')} className={`p-2 rounded-lg transition-colors ${sortOrder === 'asc' ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`} title="Prix croissant"><ArrowUp size={14}/></button>
                  <button onClick={() => setSortOrder(sortOrder === 'desc' ? null : 'desc')} className={`p-2 rounded-lg transition-colors ${sortOrder === 'desc' ? 'bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`} title="Prix décroissant"><ArrowDown size={14}/></button>
               </div>
               <button 
                  onClick={() => setShowOnlyPromos(!showOnlyPromos)} 
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all shadow-sm border ${showOnlyPromos ? 'bg-red-500 text-white border-red-500 scale-105' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-red-500 hover:text-red-500'}`}
               >
                  🔥 {showOnlyPromos ? 'Toutes les offres' : 'Uniquement les promos'}
               </button>
           </div>
        </div>

        {filteredProducts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map(p => (
            <div key={p.id} onClick={() => handleViewProduct(p)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden cursor-pointer group hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full">
              <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                 {p.image_url ? (
                   <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-zinc-300"><Box size={48}/></div>
                 )}
                 {Array.isArray(p.tags) && p.tags.includes('En Promo') && (
                   <span className="absolute top-3 left-3 bg-red-500 text-white px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg">En Promo</span>
                 )}
              </div>
              <div className="p-5 flex flex-col flex-1">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{p.category || 'Général'}</p>
                 <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2">{p.name}</h3>
                 <div className="mt-auto pt-3 flex items-center justify-between">
                    <div className="flex flex-col items-start">
                       {Array.isArray(p.tags) && p.tags.includes('En Promo') && (
                          <p className="text-[10px] font-bold text-zinc-400 line-through mb-0.5">
                             {Math.round((p.unit_price || p.price_ttc || 0) * 1.3).toLocaleString('fr-FR')} F
                          </p>
                       )}
                       <p className="font-black text-lg" style={{ color: settings.theme_color }}>{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors"><Eye size={14}/></div>
                 </div>
              </div>
            </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 disabled:opacity-50 text-black dark:text-white transition-colors shadow-sm"><ChevronLeft size={16}/></button>
                <span className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-xl">Page {currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 disabled:opacity-50 text-black dark:text-white transition-colors shadow-sm"><ChevronRight size={16}/></button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-zinc-500 font-bold text-sm bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl">
             Aucun produit ne correspond à votre sélection.
          </div>
        )}
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
                  <div className="mb-6 flex items-end gap-3">
                     <p className="text-3xl font-black" style={{ color: settings.theme_color }}>{(viewingProduct.unit_price || viewingProduct.price_ttc || 0).toLocaleString('fr-FR')} <span className="text-base text-zinc-500">FCFA</span></p>
                     {Array.isArray(viewingProduct.tags) && viewingProduct.tags.includes('En Promo') && (
                        <p className="text-lg font-bold text-zinc-400 line-through mb-1">
                           {Math.round((viewingProduct.unit_price || viewingProduct.price_ttc || 0) * 1.3).toLocaleString('fr-FR')} FCFA
                        </p>
                     )}
                  </div>
                  
                  <div className="prose prose-sm dark:prose-invert mb-8 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed whitespace-pre-wrap flex-1">
                    {viewingProduct.description || "Aucune description détaillée n'est disponible pour ce produit."}
                  </div>
                  
                  <div className="flex items-center justify-between mb-8 mt-auto">
                    <div className="flex flex-col gap-2">
                      <span className="font-bold text-sm">Quantité :</span>
                      <div className="flex items-center gap-3 bg-white dark:bg-zinc-800 px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700">
                          <button onClick={() => setViewQty(Math.max(1, viewQty - 1))} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"><Minus size={16}/></button>
                          <span className="w-8 text-center font-black text-lg">{viewQty}</span>
                          <button onClick={() => setViewQty(viewQty + 1)} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md transition-colors"><Plus size={16}/></button>
                      </div>
                    </div>
                    <button onClick={() => addToCart(viewingProduct, viewQty)} className="w-full py-4 rounded-xl font-black uppercase text-xs shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2" style={{ backgroundColor: settings.theme_color, color: '#000' }}>
                      <ShoppingCart size={16}/> Ajouter au devis
                    </button>
                  </div>
                </div>
              </div>

              {/* CROSS-SELL: PRODUITS SIMILAIRES */}
              {similarProducts.length > 0 && (
                <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
                  <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><ShoppingCart size={16}/> Dans la même catégorie</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {similarProducts.map(sp => (
                        <div key={sp.id} onClick={() => handleViewProduct(sp)} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:border-black dark:hover:border-white transition-colors group">
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

      {/* MODALE RÉCEMMENT CONSULTÉS */}
      {isRecentModalOpen && (
        <div id="recent-overlay" onClick={(e: any) => e.target.id === 'recent-overlay' && setIsRecentModalOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col animate-in zoom-in-95 max-h-[80vh]">
            <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
               <h2 className="text-xl font-black uppercase flex items-center gap-2"><Clock size={20}/> Historique de navigation</h2>
               <button onClick={() => setIsRecentModalOpen(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-full transition"><X size={16}/></button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
               {recentlyViewed.length === 0 ? (
                  <p className="text-center text-zinc-500 font-bold py-10">Aucun produit consulté récemment.</p>
               ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     {recentlyViewed.map(p => (
                        <div key={p.id} onClick={() => { setIsRecentModalOpen(false); handleViewProduct(p); }} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 flex items-center gap-4 cursor-pointer hover:border-black dark:hover:border-white transition-colors group">
                           <div className="w-16 h-16 rounded-xl bg-white dark:bg-zinc-800 overflow-hidden shrink-0">
                             {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform" /> : <Box size={24} className="m-auto mt-4 text-zinc-300"/>}
                           </div>
                           <div className="min-w-0">
                             <p className="font-bold text-xs truncate leading-tight text-black dark:text-white">{p.name}</p>
                             <p className="text-xs font-black mt-1" style={{ color: settings.theme_color }}>{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* FLOATING CART BUTTON */}
      {cart.length > 0 && (
          <button onClick={() => setIsCartOpen(true)} className="fixed bottom-8 right-8 bg-[#39FF14] text-black p-4 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-40">
              <ShoppingCart size={24} />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">{cart.length}</span>
          </button>
      )}

      {/* CART MODAL */}
      {isCartOpen && (
          <div id="cart-overlay" onClick={(e: any) => e.target.id === 'cart-overlay' && setIsCartOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-end p-0 bg-black/60 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white dark:bg-zinc-950 w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                  <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900">
                      <h2 className="text-xl font-black uppercase flex items-center gap-2"><ShoppingCart size={20}/> Mon Devis</h2>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {cart.length === 0 ? (
                          <div className="text-center text-zinc-400 py-10 font-bold">Votre panier est vide.</div>
                      ) : (
                          cart.map(item => (
                              <div key={item.product.id} className="flex gap-4 bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                                  {item.product.image_url ? (
                                      <img src={item.product.image_url} alt="" className="w-16 h-16 rounded-xl object-cover"/>
                                  ) : (
                                      <div className="w-16 h-16 bg-zinc-200 dark:bg-zinc-800 rounded-xl flex items-center justify-center"><Box size={24}/></div>
                                  )}
                                  <div className="flex-1">
                                      <p className="font-bold text-sm line-clamp-1">{item.product.name}</p>
                                      <p className="text-[#39FF14] font-black text-sm mt-1">{(item.product.unit_price || item.product.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                                      <div className="flex items-center justify-between mt-2">
                                          <div className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                                              <button onClick={() => updateCartQty(item.product.id, -1)} className="p-1"><Minus size={12}/></button>
                                              <span className="font-bold text-xs w-4 text-center">{item.qty}</span>
                                              <button onClick={() => updateCartQty(item.product.id, 1)} className="p-1"><Plus size={12}/></button>
                                          </div>
                                          <button onClick={() => removeFromCart(item.product.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                                      </div>
                                  </div>
                              </div>
                          ))
                      )}
                  </div>
                  {cart.length > 0 && (
                      <div className="p-6 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                          <div className="flex justify-between items-center mb-6">
                              <span className="font-black uppercase text-zinc-500 text-sm">Total Estimé</span>
                              <span className="font-black text-2xl">{cart.reduce((acc, item) => acc + ((item.product.unit_price || item.product.price_ttc || 0) * item.qty), 0).toLocaleString('fr-FR')} F</span>
                          </div>
                          {leadSuccess ? (
                             <div className="bg-green-100 text-green-700 p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-2">
                               <CheckCircle size={24} />
                               <p className="text-xs font-bold uppercase tracking-widest">Demande envoyée !</p>
                               <p className="text-xs font-medium">Un conseiller va vous recontacter sur WhatsApp très rapidement.</p>
                             </div>
                          ) : (
                          <form onSubmit={submitLead} className="space-y-3">
                              <input type="text" required placeholder="Votre Prénom & Nom *" value={leadForm.name} onChange={e => setLeadForm({...leadForm, name: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-black dark:focus:border-white transition" />
                              <input type="tel" required placeholder="Votre Numéro WhatsApp *" value={leadForm.phone} onChange={e => setLeadForm({...leadForm, phone: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-black dark:focus:border-white transition" />
                              <textarea placeholder="Une précision ? (Optionnel)" value={leadForm.message} onChange={e => setLeadForm({...leadForm, message: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold outline-none focus:border-black dark:focus:border-white transition resize-none h-20"></textarea>
                              <div className="flex gap-2 sm:gap-3">
                                <button 
                                  type="button" 
                                  onClick={() => {
                                      if (confirm("Voulez-vous vraiment vider votre panier sans rien envoyer ?")) {
                                          setCart([]);
                                          setLeadForm({ name: '', phone: '', message: '' });
                                          setIsCartOpen(false);
                                      }
                                  }} 
                                  className="px-3 sm:px-4 py-4 rounded-xl font-black uppercase text-xs shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-red-500"
                                  title="Vider le panier silencieusement"
                                >
                                  <Trash2 size={16}/>
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                      if (confirm("Voulez-vous annuler et prévenir par WhatsApp ?")) {
                                          const itemsText = cart.map(i => `- ${i.product.name} (x${i.qty})`).join('%0A');
                                          setCart([]);
                                          setLeadForm({ name: '', phone: '', message: '' });
                                          setIsCartOpen(false);
                                          const msg = `Bonjour, j'ai parcouru votre catalogue et j'avais sélectionné ces articles :%0A${itemsText}%0A%0AMais j'ai décidé d'annuler ma demande de devis pour le moment. J'aurais besoin de plus d'informations.`;
                                          window.open(`https://wa.me/?text=${msg}`, '_blank');
                                      }
                                  }} 
                                  className="flex-1 py-4 rounded-xl font-black uppercase text-xs shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2 bg-red-50 text-red-500 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20"
                                >
                                  Annuler WA
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-[2] py-4 rounded-xl font-black uppercase text-xs shadow-md hover:scale-105 transition-transform disabled:opacity-50 flex items-center justify-center gap-2" style={{ backgroundColor: settings.theme_color, color: '#000' }}>
                                    {isSubmitting ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>} Demander
                                </button>
                              </div>
                          </form>
                          )}
                      </div>
                  )}
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
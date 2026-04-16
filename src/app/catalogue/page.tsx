"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, MessageSquare, ShoppingBag, Box, ChevronRight, Share2, Facebook, Link, X, Plus, Minus, ShoppingCart, Send } from 'lucide-react';

export default function PublicCataloguePage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids');
  const tenantId = searchParams.get('t');

  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [selectedQty, setSelectedQty] = useState(1);
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });

  useEffect(() => {
    const loadCatalogue = async () => {
      if (!idsParam || !tenantId) {
        setIsLoading(false);
        return;
      }

      const idsArray = idsParam.split(',').map(id => id.trim()).filter(Boolean);

      try {
        // Fetch Settings (Pour le branding)
        const { data: setts } = await supabase
          .from('crm_settings')
          .select('*')
          .eq('tenant_id', tenantId)
          .maybeSingle();
        
        if (setts) setSettings(setts);

        // Fetch Products
        const { data: prods } = await supabase
          .from('crm_products')
          .select('*')
          .eq('tenant_id', tenantId)
          .in('id', idsArray);
          
        if (prods) setProducts(prods);

        // Tracking : Nouvelle vue enregistrée !
        if (idsParam && tenantId) {
            supabase.from('catalog_analytics').insert([{
                tenant_id: tenantId,
                event_type: 'view',
                catalog_ids: idsParam
            }]).then();
        }

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCatalogue();
  }, [idsParam, tenantId]);

  // Fonction de tracking des Clics WhatsApp
  const trackAndOpenWa = (msg: string, productId?: string) => {
      if (tenantId) {
          supabase.from('catalog_analytics').insert([{
              tenant_id: tenantId,
              event_type: 'click_whatsapp',
              catalog_ids: idsParam,
              product_id: productId || null
          }]).then();
      }
      window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const addToCart = (product: any, qty: number) => {
      setCart(prev => {
          const existing = prev.find(item => item.id === product.id);
          if (existing) {
              return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + qty } : item);
          }
          return [...prev, { ...product, qty }];
      });
      setViewingProduct(null);
      setIsCartOpen(true);
      setSelectedQty(1);
  };

  const sendQuoteRequest = async () => {
      if (!customerInfo.name || !customerInfo.phone) {
          alert("Veuillez saisir votre nom et numéro de téléphone.");
          return;
      }
      const total = cart.reduce((acc, item) => acc + ((item.unit_price || item.price_ttc || 0) * item.qty), 0);
      let message = `Bonjour, je suis ${customerInfo.name}. Je souhaite obtenir un devis pour les articles suivants depuis votre catalogue :\n\n`;
      cart.forEach(item => {
          message += `- ${item.name} (x${item.qty}) : ${((item.unit_price || item.price_ttc || 0) * item.qty).toLocaleString('fr-FR')} FCFA\n`;
      });
      message += `\n*Total estimé : ${total.toLocaleString('fr-FR')} FCFA*`;
      message += `\n\nMerci de me recontacter au ${customerInfo.phone}.`;

      if (tenantId) {
          await supabase.from('leads').insert([{ tenant_id: tenantId, source: 'Catalogue Public', intent: 'Demande de devis (Catalogue)', full_name: customerInfo.name, phone: customerInfo.phone, message: `Demande de devis pour ${cart.length} articles. Total: ${total} FCFA. Articles: ${cart.map(i => `${i.name} (x${i.qty})`).join(', ')}`, status: 'Nouveau' }]);
      }
      
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      setCart([]);
      setIsCartOpen(false);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="w-8 h-8 animate-spin text-black" /></div>;

  if (products.length === 0) return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 p-6 text-center">
          <Box size={48} className="text-zinc-300 mb-4" />
          <h1 className="text-2xl font-black uppercase tracking-tighter">Catalogue introuvable</h1>
          <p className="text-zinc-500 font-bold mt-2">Le lien est invalide ou les produits ont été retirés.</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans pb-24">
      {/* Header Branding */}
      <header className="bg-white border-b border-zinc-200 p-6 sticky top-0 z-50 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
         <div className="flex items-center gap-3">
             {settings?.logo_url ? <img src={settings.logo_url} alt="Logo" className="h-10 w-auto object-contain" /> : <div className="w-10 h-10 bg-black text-[#39FF14] flex items-center justify-center rounded-xl font-black"><ShoppingBag size={20}/></div>}
             <div>
                <h1 className="font-black uppercase tracking-tighter leading-tight text-lg">{settings?.crm_name || 'Catalogue'}</h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Sélection de {products.length} produits</p>
             </div>
         </div>
         <div className="flex items-center gap-2 flex-wrap">
             <button onClick={() => trackAndOpenWa(`Découvrez notre sélection de produits exclusifs : ${window.location.href}`)} className="bg-[#25D366] text-white p-2.5 sm:px-4 sm:py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform shadow-md" title="Partager sur WhatsApp">
                <Share2 size={14}/> <span className="hidden sm:inline">WhatsApp</span>
             </button>
             <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="bg-[#1877F2] text-white p-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform shadow-md" title="Partager sur Facebook">
                <Facebook size={14}/>
             </button>
             <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Lien copié ! Vous pouvez le coller sur TikTok ou Instagram.'); }} className="bg-zinc-100 text-zinc-600 p-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-sm" title="Copier le lien">
                <Link size={14}/>
             </button>
             <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block"></div>
             <button onClick={() => trackAndOpenWa(`Bonjour, je suis intéressé(e) par votre catalogue : ${window.location.href}`)} className="bg-black text-[#39FF14] px-5 py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform shadow-md">
                <MessageSquare size={14}/> Contacter
             </button>
         </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map(p => (
                  <div key={p.id} onClick={() => { setViewingProduct(p); setSelectedQty(1); }} className="cursor-pointer bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-lg transition-all group flex flex-col">
                      <div className="aspect-square bg-zinc-100 relative overflow-hidden">
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><Box size={40}/></div>}
                          {p.category && <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">{p.category}</span>}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-black text-lg leading-tight mb-2 line-clamp-2">{p.name}</h3>
                          <p className="text-zinc-500 text-xs font-medium line-clamp-3 mb-6 flex-1">{p.description}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
                              <p className="font-black text-2xl tracking-tighter">{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} <span className="text-sm font-bold text-zinc-500">FCFA</span></p>
                              <button onClick={(e) => { e.stopPropagation(); setViewingProduct(p); setSelectedQty(1); }} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-black hover:text-[#39FF14] transition-colors">
                                 <ChevronRight size={20}/>
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </main>

      {cart.length > 0 && (
          <button onClick={() => setIsCartOpen(true)} className="fixed bottom-6 right-6 bg-black text-[#39FF14] p-4 rounded-full shadow-2xl hover:scale-105 transition-transform z-40 flex items-center gap-2">
              <ShoppingCart size={24} />
              <span className="font-black">{cart.length}</span>
          </button>
      )}

      {viewingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setViewingProduct(null)}>
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setViewingProduct(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
                  <div className="aspect-video bg-zinc-100 rounded-2xl overflow-hidden mb-6">
                      {viewingProduct.image_url ? <img src={viewingProduct.image_url} alt={viewingProduct.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><Box size={40}/></div>}
                  </div>
                  <h2 className="text-2xl font-black uppercase mb-2">{viewingProduct.name}</h2>
                  <p className="text-3xl font-black text-[#39FF14] mb-4">{(viewingProduct.unit_price || viewingProduct.price_ttc || 0).toLocaleString('fr-FR')} FCFA</p>
                  <p className="text-zinc-500 mb-6 line-clamp-3">{viewingProduct.description || "Aucune description détaillée."}</p>
                  
                  <div className="flex items-center justify-between mb-6 bg-zinc-50 p-4 rounded-2xl">
                      <span className="font-bold text-sm uppercase">Quantité</span>
                      <div className="flex items-center gap-4 bg-white border border-zinc-200 px-2 py-1 rounded-xl">
                          <button onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))} className="p-1 hover:text-red-500"><Minus size={16}/></button>
                          <span className="font-black w-6 text-center">{selectedQty}</span>
                          <button onClick={() => setSelectedQty(selectedQty + 1)} className="p-1 hover:text-green-500"><Plus size={16}/></button>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={() => addToCart(viewingProduct, selectedQty)} className="flex-1 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform"><Plus size={16}/> Ajouter au devis</button>
                      <button onClick={() => trackAndOpenWa(`Bonjour, je suis intéressé par : ${viewingProduct.name}`, viewingProduct.id)} className="flex-1 bg-[#25D366] text-white py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform"><MessageSquare size={16}/> Question</button>
                  </div>
              </div>
          </div>
      )}

      {isCartOpen && (
          <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
              <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
                  <div className="p-6 border-b border-zinc-200 flex justify-between items-center bg-zinc-50">
                      <h2 className="text-xl font-black uppercase flex items-center gap-2"><ShoppingCart className="text-[#39FF14]"/> Mon Devis</h2>
                      <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full"><X size={20}/></button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {cart.map(item => (
                          <div key={item.id} className="flex gap-4 items-center bg-zinc-50 p-3 rounded-2xl border border-zinc-100">
                              {item.image_url ? <img src={item.image_url} className="w-16 h-16 object-cover rounded-xl" /> : <div className="w-16 h-16 bg-zinc-200 rounded-xl flex items-center justify-center"><Box size={20}/></div>}
                              <div className="flex-1">
                                  <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                                  <p className="text-[#39FF14] font-black text-sm">{(item.unit_price || item.price_ttc || 0).toLocaleString('fr-FR')} F</p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                  <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="text-zinc-400 hover:text-red-500"><X size={16}/></button>
                                  <div className="flex items-center gap-2 bg-white border border-zinc-200 px-2 py-0.5 rounded-lg">
                                      <button onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}><Minus size={12}/></button>
                                      <span className="text-xs font-bold">{item.qty}</span>
                                      <button onClick={() => setCart(cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}><Plus size={12}/></button>
                                  </div>
                              </div>
                          </div>
                      ))}
                      {cart.length === 0 && <p className="text-center text-zinc-500 mt-10">Votre demande de devis est vide.</p>}
                  </div>
                  {cart.length > 0 && (
                      <div className="p-6 bg-zinc-50 border-t border-zinc-200">
                          <div className="flex justify-between items-center mb-6">
                              <span className="font-bold text-zinc-500 uppercase text-xs">Total Estimé</span>
                              <span className="text-2xl font-black text-black">{cart.reduce((acc, item) => acc + ((item.unit_price || item.price_ttc || 0) * item.qty), 0).toLocaleString('fr-FR')} F</span>
                          </div>
                          <div className="space-y-3 mb-6">
                              <input type="text" placeholder="Votre Prénom & Nom *" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-sm outline-none focus:border-[#39FF14]" />
                              <input type="tel" placeholder="Votre Numéro WhatsApp *" value={customerInfo.phone} onChange={e => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-white border border-zinc-200 rounded-xl p-3 text-sm outline-none focus:border-[#39FF14]" />
                          </div>
                          <button onClick={sendQuoteRequest} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg"><Send size={18}/> Demander un Devis</button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
}

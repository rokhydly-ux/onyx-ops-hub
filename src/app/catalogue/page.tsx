"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, MessageSquare, ShoppingBag, Box, ChevronRight, Share2, Facebook, Link } from 'lucide-react';

export default function PublicCataloguePage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get('ids');
  const tenantId = searchParams.get('t');

  const [products, setProducts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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

      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCatalogue();
  }, [idsParam, tenantId]);

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
             <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Découvrez notre sélection de produits exclusifs : ${window.location.href}`)}`, '_blank')} className="bg-[#25D366] text-white p-2.5 sm:px-4 sm:py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform shadow-md" title="Partager sur WhatsApp">
                <Share2 size={14}/> <span className="hidden sm:inline">WhatsApp</span>
             </button>
             <button onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')} className="bg-[#1877F2] text-white p-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform shadow-md" title="Partager sur Facebook">
                <Facebook size={14}/>
             </button>
             <button onClick={() => { navigator.clipboard.writeText(window.location.href); alert('Lien copié ! Vous pouvez le coller sur TikTok ou Instagram.'); }} className="bg-zinc-100 text-zinc-600 p-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:bg-zinc-200 transition-colors shadow-sm" title="Copier le lien">
                <Link size={14}/>
             </button>
             <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block"></div>
             <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Bonjour, je suis intéressé(e) par votre catalogue : ${window.location.href}`)}`, '_blank')} className="bg-black text-[#39FF14] px-5 py-2.5 rounded-full text-[10px] font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform shadow-md">
                <MessageSquare size={14}/> Contacter
             </button>
         </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map(p => (
                  <div key={p.id} className="bg-white rounded-3xl overflow-hidden border border-zinc-200 shadow-sm hover:shadow-lg transition-all group flex flex-col">
                      <div className="aspect-square bg-zinc-100 relative overflow-hidden">
                          {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-zinc-300"><Box size={40}/></div>}
                          {p.category && <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">{p.category}</span>}
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                          <h3 className="font-black text-lg leading-tight mb-2 line-clamp-2">{p.name}</h3>
                          <p className="text-zinc-500 text-xs font-medium line-clamp-3 mb-6 flex-1">{p.description}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 mt-auto">
                              <p className="font-black text-2xl tracking-tighter">{(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} <span className="text-sm font-bold text-zinc-500">FCFA</span></p>
                              <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(`Bonjour, je souhaite commander le produit : ${p.name} à ${(p.unit_price || p.price_ttc || 0).toLocaleString('fr-FR')} FCFA.`)}`, '_blank')} className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-black hover:text-[#39FF14] transition-colors">
                                 <ChevronRight size={20}/>
                              </button>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </main>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Store, Search, ExternalLink, ShoppingBag, MapPin } from "lucide-react";
import Link from "next/link";

export default function MarketplacePage() {
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchShops = async () => {
      // On récupère toutes les boutiques enregistrées
      const { data, error } = await supabase.from("shops").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setShops(data);
      }
      setIsLoading(false);
    };
    fetchShops();
  }, []);

  const filteredShops = shops.filter(shop => 
    shop.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    shop.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white font-sans p-6 md:p-12">
      <div className="max-w-7xl mx-auto pt-10">
        <header className="mb-16 text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Onyx <span className="text-[#39FF14]">Market</span>
          </h1>
          <p className="text-zinc-500 font-bold max-w-2xl mx-auto">
            Découvrez toutes les boutiques de nos partenaires et commandez directement sur WhatsApp en toute simplicité.
          </p>
        </header>

        <div className="max-w-xl mx-auto mb-16 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher une boutique..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:border-[#39FF14] focus:ring-4 focus:ring-[#39FF14]/10 transition-all font-bold text-sm shadow-sm"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map(shop => (
              <Link href={`/${shop.slug}`} key={shop.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 hover:shadow-xl hover:border-[#39FF14] hover:-translate-y-1 transition-all group flex flex-col">
                <div className="flex items-center gap-5 mb-6">
                  {shop.logo_url ? (
                    <img src={shop.logo_url} alt={shop.name} className="w-16 h-16 rounded-2xl object-cover bg-zinc-100 shadow-sm" />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-black text-[#39FF14] flex items-center justify-center font-black text-2xl shadow-sm">
                      {shop.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="font-black text-xl uppercase tracking-tight group-hover:text-[#39FF14] transition-colors line-clamp-1">{shop.name}</h2>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1 inline-block">{shop.currency || 'FCFA'}</span>
                  </div>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium line-clamp-2 mb-8 flex-1 leading-relaxed">
                  {shop.description || "Boutique propulsée par OnyxOps."}
                </p>
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 pt-5">
                  <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
                    <ShoppingBag size={14} /> Visiter la boutique
                  </div>
                  <div className="bg-zinc-100 dark:bg-zinc-800 p-3 rounded-full group-hover:bg-[#39FF14] group-hover:text-black transition-colors">
                    <ExternalLink size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!isLoading && filteredShops.length === 0 && (
          <div className="text-center py-20 text-zinc-500">
            <Store size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-black text-xl uppercase tracking-tight text-black dark:text-white mb-2">Aucune boutique</p>
            <p className="text-sm font-medium">Modifiez votre recherche ou attendez que de nouvelles boutiques ouvrent.</p>
          </div>
        )}
      </div>
    </div>
  );
}
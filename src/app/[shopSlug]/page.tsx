"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, ShoppingBag, Store, Filter, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MarketplacePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["Toutes"]);
  const [activeCategory, setActiveCategory] = useState("Toutes");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // 1. Récupérer toutes les boutiques pour avoir leurs noms, logos et slugs
      const { data: shopsData } = await supabase.from("shops").select("*");
      
      // 2. Récupérer tous les produits de toutes les boutiques
      const { data: productsData } = await supabase.from("products").select("*").order("created_at", { ascending: false });

      if (shopsData && productsData) {
        // Lier les produits à leurs boutiques respectives
        const enrichedProducts = productsData
          .map(p => ({
            ...p,
            shop: shopsData.find(s => s.id === p.shop_id)
          }))
          .filter(p => p.shop); // Garder uniquement les produits avec une boutique valide

        setProducts(enrichedProducts);

        // Extraire dynamiquement toutes les catégories uniques
        const uniqueCats = Array.from(new Set(enrichedProducts.map(p => p.category).filter(Boolean))) as string[];
        setCategories(["Toutes", ...uniqueCats]);
      }
      
      setIsLoading(false);
    };
    fetchData();
  }, []);

  // Filtrage combiné (Recherche + Catégorie)
  const filteredProducts = products.filter(p => {
    const matchesCat = activeCategory === "Toutes" || p.category === activeCategory;
    const matchesSearch = 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.shop?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-black dark:text-white font-sans p-6 md:p-12 pb-24 pt-24">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            Onyx <span className="text-[#39FF14]">Market</span>
          </h1>
          <p className="text-zinc-500 font-bold max-w-2xl mx-auto">
            Soutenez le commerce local. Découvrez et achetez les meilleurs produits directement auprès de nos commerçants.
          </p>
        </header>

        {/* BARRE DE RECHERCHE */}
        <div className="max-w-2xl mx-auto mb-10 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un produit, une boutique..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 outline-none focus:border-[#39FF14] transition-all font-bold text-sm shadow-sm"
          />
        </div>

        {/* FILTRES CATÉGORIES */}
        <div className="flex overflow-x-auto gap-3 pb-4 mb-8 custom-scrollbar justify-start md:justify-center">
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-full text-xs font-black uppercase whitespace-nowrap transition-colors ${
                activeCategory === cat 
                  ? "bg-black dark:bg-white text-[#39FF14] dark:text-black shadow-lg" 
                  : "bg-white dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* GRILLE PRODUITS "AMAZON STYLE" */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden flex flex-col group hover:shadow-xl transition-all shadow-sm">
                <div className="relative aspect-[4/5] overflow-hidden bg-zinc-100 dark:bg-zinc-800 cursor-pointer" onClick={() => router.push(`/${product.shop.slug}`)}>
                  <img src={product.image || "https://placehold.co/600"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
                      <span className="text-white font-black text-xs uppercase tracking-widest border-2 border-white px-3 py-1 rounded-lg">Rupture</span>
                    </div>
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-3">
                    {product.shop.logo_url ? <img src={product.shop.logo_url} className="w-5 h-5 rounded-full object-cover" alt="logo"/> : <div className="w-5 h-5 rounded-full bg-black text-[#39FF14] flex items-center justify-center text-[8px] font-black">{product.shop.name.charAt(0)}</div>}
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate hover:text-[#39FF14] cursor-pointer" onClick={() => router.push(`/${product.shop.slug}`)}>{product.shop.name}</span>
                  </div>
                  <h3 className="font-bold text-base leading-tight mb-2 text-black dark:text-white line-clamp-2 cursor-pointer hover:text-[#39FF14]" onClick={() => router.push(`/${product.shop.slug}`)}>{product.name}</h3>
                  
                  <div className="mt-auto flex justify-between items-end pt-4">
                    <p className="text-xl font-black text-[#39FF14]">{Number(product.price).toLocaleString('fr-FR')} {product.shop.currency}</p>
                    {/* 🚀 LE BOUTON MAGIQUE DE L'OPTION 1 */}
                    <button onClick={() => router.push(`/${product.shop.slug}?add_product=${product.id}`)} disabled={product.stock === 0} className="w-10 h-10 rounded-xl bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-[#39FF14] hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            <Filter size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl font-black text-black dark:text-white mb-2">Aucun produit trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}
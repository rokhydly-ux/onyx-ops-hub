"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Box, Search, AlertTriangle, Home, Store, ArrowDown, ArrowUp, RefreshCcw, Download, QrCode } from "lucide-react";
import * as XLSX from 'xlsx';

export default function OnyxStockDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [shopId, setShopId] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "low" | "out">("all");
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let userId = session?.user?.id;
      let userData: any = null;

      // Fallback session
      if (!userId) {
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
            try { 
                userData = JSON.parse(customSession);
                userId = userData.id; 
            } catch (e) {}
        }
      } else {
         const { data } = await supabase.from('clients').select('saas, active_saas').eq('id', userId).maybeSingle();
         userData = data;
      }

      if (!userId) {
          router.push('/');
          return;
      }

      // --- VÉRIFICATION D'ACCÈS SAAS (STOCK) ---
      const activeModules = userData?.active_saas || [];
      const mainSaas = (userData?.saas || '').toLowerCase();
      const hasStockAccess = activeModules.includes('stock') || mainSaas.includes('stock') || mainSaas.includes('trio') || mainSaas.includes('full') || mainSaas.includes('elite') || mainSaas.includes('master');

      if (!hasStockAccess) {
          alert("Accès refusé 🔒\n\nVous n'avez pas souscrit au module Onyx Stock. Redirection vers votre Hub.");
          router.push('/dashboard');
          return;
      }

      const { data: shop } = await supabase.from('shops').select('id, name, currency').eq('owner_id', userId).single();
      if (shop) {
          setShopId(shop.id);
          fetchInventory(shop.id);
      }
      setIsLoading(false);
    };
    verifyAuth();
  }, [router]);

  const fetchInventory = async (id: string) => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, stock, cost_price, price, category, image, barcode')
        .eq('shop_id', id)
        .order('name', { ascending: true });
      
      if (data && !error) setProducts(data);
  };

  // Mises à jour en temps réel (si une vente est faite sur Onyx Jaay, ça baisse ici direct)
  useEffect(() => {
    if (!shopId) return;
    const channel = supabase.channel('stock-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products', filter: `shop_id=eq.${shopId}` }, (payload) => {
         setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, stock: payload.new.stock } : p));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [shopId]);

  const handleUpdateStock = async (id: number, newStock: number) => {
      if (newStock < 0) return;
      setIsUpdating(id);
      
      // Mise à jour optimiste
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: newStock } : p));
      
      // Update BDD
      await supabase.from('products').update({ stock: newStock }).eq('id', id);
      setIsUpdating(null);
  };

  const handleExportStock = () => {
      const exportData = products.map(p => ({
          'Nom du Produit': p.name,
          'Catégorie': p.category || 'Non classé',
          'Code-barre / SKU': p.barcode || 'N/A',
          'Quantité en Stock': p.stock || 0,
          'Coût d\'achat unitaire': p.cost_price || 0,
          'Valeur Stock (Coût)': (p.stock || 0) * (p.cost_price || 0),
          'Prix de vente unitaire': p.price || 0,
          'Valeur Stock (Vente potentielle)': (p.stock || 0) * (p.price || 0)
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventaire");
      XLSX.writeFile(workbook, `onyx_inventaire_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black"><div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>;

  const filteredProducts = products.filter(p => {
      const matchSearch = (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (p.barcode || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      if (filter === 'low') return p.stock > 0 && p.stock <= 5;
      if (filter === 'out') return p.stock === 0;
      return true;
  });

  const totalItems = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const totalValueCost = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.cost_price || 0)), 0);
  const totalValueSales = products.reduce((sum, p) => sum + ((p.stock || 0) * (p.price || 0)), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white font-sans selection:bg-emerald-500/30">
      {/* HEADER */}
      <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-8 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg"><Box size={20}/></div>
              <h1 className="text-2xl font-black tracking-tighter uppercase hidden sm:block">Onyx <span className="text-emerald-500">Stock</span></h1>
          </div>
          <div className="flex items-center gap-4">
              <button onClick={handleExportStock} className="hidden md:flex items-center gap-2 p-2 px-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-xl hover:bg-emerald-100 transition font-bold text-sm shadow-sm">
                  <Download size={16}/> Exporter Inventaire
              </button>
              <button onClick={() => router.push('/vente')} className="hidden sm:flex items-center gap-2 p-2 px-4 bg-zinc-100 dark:bg-zinc-900 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-800 transition font-bold text-sm" title="Onyx Jaay">
                  <Store size={16}/> Onyx Jaay
              </button>
              <button onClick={() => router.push('/dashboard')} className="p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"><Home size={18}/></button>
          </div>
      </header>

      <main className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8">
          
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Articles en rayon</p>
                <p className="text-3xl sm:text-4xl font-black">{totalItems}</p>
             </div>
             <div className="bg-zinc-50 dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">Valeur du Stock (Coût)</p>
                <p className="text-2xl sm:text-3xl font-black text-zinc-700 dark:text-zinc-300">{totalValueCost.toLocaleString()} F</p>
             </div>
             <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-[2rem] border border-emerald-200 dark:border-emerald-800/30 shadow-sm cursor-pointer" onClick={() => setFilter(filter === 'low' ? 'all' : 'low')}>
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Stock Faible (&lt;5)</p>
                <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400">{lowStockCount}</p>
             </div>
             <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-[2rem] border border-red-200 dark:border-red-800/30 shadow-sm cursor-pointer" onClick={() => setFilter(filter === 'out' ? 'all' : 'out')}>
                <p className="text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1"><Box size={12}/> Ruptures (0)</p>
                <p className="text-3xl sm:text-4xl font-black text-red-600 dark:text-red-400">{outOfStockCount}</p>
             </div>
          </div>

          {/* CONTROLS */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
             <div className="relative flex-1 max-w-md">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input 
                    type="text" 
                    placeholder="Rechercher par nom ou scanner code-barre..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/50 transition" 
                 />
                 <QrCode size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400" />
             </div>
             <div className="flex gap-2 bg-zinc-50 dark:bg-zinc-950 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 w-max overflow-x-auto">
                 <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${filter === 'all' ? 'bg-white dark:bg-zinc-800 shadow-md text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Tout</button>
                 <button onClick={() => setFilter('low')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${filter === 'low' ? 'bg-white dark:bg-zinc-800 shadow-md text-emerald-500' : 'text-zinc-500 hover:text-emerald-500'}`}>Faible</button>
                 <button onClick={() => setFilter('out')} className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition ${filter === 'out' ? 'bg-white dark:bg-zinc-800 shadow-md text-red-500' : 'text-zinc-500 hover:text-red-500'}`}>Ruptures</button>
             </div>
          </div>

          {/* TABLEAU INVENTAIRE */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                       <tr>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Produit & Réf</th>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-500">Catégorie</th>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Niveau de Stock</th>
                          <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Ajustement</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                       {filteredProducts.map(p => (
                          <tr key={p.id} className={`hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors ${p.stock === 0 ? 'bg-red-50/30 dark:bg-red-900/10' : ''}`}>
                             <td className="p-5 flex items-center gap-4">
                                <img src={p.image || "https://placehold.co/100"} alt={p.name} className="w-12 h-12 rounded-xl object-cover bg-zinc-100 dark:bg-zinc-800 shrink-0" />
                                <div>
                                   <p className="font-bold text-sm text-black dark:text-white max-w-[250px] truncate">{p.name}</p>
                                   <p className="text-[10px] text-zinc-400 mt-1 font-mono uppercase">{p.barcode || `REF-${p.id}`}</p>
                                </div>
                             </td>
                             <td className="p-5">
                                <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest truncate max-w-[150px] inline-block">{p.category || 'Général'}</span>
                             </td>
                             <td className="p-5 text-center">
                                <span className={`text-xl font-black ${p.stock === 0 ? 'text-red-500' : p.stock <= 5 ? 'text-emerald-500' : 'text-black dark:text-white'}`}>
                                   {p.stock}
                                </span>
                                {p.stock === 0 && <p className="text-[9px] font-black text-red-500 uppercase mt-1 animate-pulse">Rupture</p>}
                             </td>
                             <td className="p-5 text-right">
                                <div className="flex items-center justify-end gap-2">
                                   <button onClick={() => handleUpdateStock(p.id, Math.max(0, p.stock - 1))} disabled={p.stock === 0 || isUpdating === p.id} className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 transition disabled:opacity-50"><ArrowDown size={16}/></button>
                                   <input 
                                      type="number" 
                                      value={p.stock} 
                                      onChange={(e) => handleUpdateStock(p.id, parseInt(e.target.value) || 0)}
                                      className="w-16 h-10 text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-sm outline-none focus:border-emerald-500"
                                   />
                                   <button onClick={() => handleUpdateStock(p.id, p.stock + 1)} disabled={isUpdating === p.id} className="w-10 h-10 rounded-xl bg-black dark:bg-white text-emerald-500 dark:text-black hover:bg-emerald-500 hover:text-black dark:hover:bg-emerald-500 transition flex items-center justify-center"><ArrowUp size={16}/></button>
                                </div>
                             </td>
                          </tr>
                       ))}
                       {filteredProducts.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">Aucun produit trouvé</td></tr>}
                    </tbody>
                 </table>
              </div>
          </div>
      </main>
    </div>
  );
}
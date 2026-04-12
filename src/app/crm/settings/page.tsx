"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Box, Search, CheckCircle, AlertTriangle, XCircle, Edit2, Check, Loader2 } from 'lucide-react';

export default function CatalogView() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setIsLoading(false);
    
    const tenantId = user.user_metadata?.tenant_id || user.id;
    const { data } = await supabase.from('crm_products').select('*').eq('tenant_id', tenantId).order('last_sold_date', { ascending: false });
    if (data) setProducts(data);
    setIsLoading(false);
  };

  const getStockStatus = (lastSoldDate: string) => {
    if (!lastSoldDate) return { label: 'Inconnu', color: 'bg-zinc-100 text-zinc-500', icon: Box };
    const daysDiff = (new Date().getTime() - new Date(lastSoldDate).getTime()) / (1000 * 3600 * 24);
    if (daysDiff <= 15) return { label: 'Actif', color: 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20', icon: CheckCircle };
    if (daysDiff <= 30) return { label: 'Alerte', color: 'bg-orange-500/10 text-orange-500 border border-orange-500/20', icon: AlertTriangle };
    return { label: 'Mort', color: 'bg-red-500/10 text-red-500 border border-red-500/20', icon: XCircle };
  };

  const handleUpdateCategory = async (id: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const tenantId = user.user_metadata?.tenant_id || user.id;
    
    await supabase.from('crm_products').update({ category: editCategory }).eq('id', id).eq('tenant_id', tenantId);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, category: editCategory } : p));
    setEditingId(null);
  };

  const filtered = products.filter(p => (p.name || '').toLowerCase().includes(search.toLowerCase()) || (p.category || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3"><Box className="text-[#39FF14]"/> Catalogue Intelligent</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Analyse des stocks et des performances de vente</p>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input type="text" placeholder="Rechercher un produit..." value={search} onChange={e => setSearch(e.target.value)} className="pl-12 pr-4 py-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none font-bold focus:border-[#39FF14] transition-colors" />
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left">
            <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-5 w-10"><input type="checkbox" onChange={(e) => setSelectedIds(e.target.checked ? filtered.map(p => p.id) : [])} checked={selectedIds.length > 0 && selectedIds.length === filtered.length} className="accent-black dark:accent-[#39FF14]" /></th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Produit & Prix</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Catégorie</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Dernière Vente</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut (Stock)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {isLoading ? (
                <tr><td colSpan={5} className="p-10 text-center"><Loader2 className="animate-spin inline-block text-zinc-400" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-zinc-500 font-bold uppercase tracking-widest text-xs">Aucun produit trouvé.</td></tr>
              ) : filtered.map(p => {
                const status = getStockStatus(p.last_sold_date);
                return (
                  <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                    <td className="p-5"><input type="checkbox" checked={selectedIds.includes(p.id)} onChange={(e) => setSelectedIds(prev => e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id))} className="accent-black dark:accent-[#39FF14]" /></td>
                    <td className="p-5">
                       <p className="font-black text-sm uppercase text-black dark:text-white">{p.name}</p>
                       <p className="text-xs font-black text-[#39FF14] mt-0.5">{(p.price_ttc || 0).toLocaleString()} F</p>
                    </td>
                    <td className="p-5">
                      {editingId === p.id ? (
                        <div className="flex items-center gap-2">
                          <input type="text" value={editCategory} onChange={e => setEditCategory(e.target.value)} className="p-2 border border-zinc-200 dark:border-zinc-700 rounded-lg text-xs font-bold bg-white dark:bg-zinc-950 outline-none focus:border-[#39FF14]" autoFocus />
                          <button onClick={() => handleUpdateCategory(p.id)} className="text-green-500 hover:scale-110 transition p-1.5 bg-green-500/10 rounded-md"><Check size={14}/></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-zinc-500">{p.category || 'Non catégorisé'}</span>
                          <button onClick={() => { setEditingId(p.id); setEditCategory(p.category || ''); }} className="text-zinc-400 hover:text-[#39FF14] opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-100 dark:bg-zinc-800 p-1.5 rounded-md"><Edit2 size={12}/></button>
                        </div>
                      )}
                    </td>
                    <td className="p-5 text-xs font-bold text-zinc-500">{p.last_sold_date ? new Date(p.last_sold_date).toLocaleDateString('fr-FR') : 'Jamais'}</td>
                    <td className="p-5">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max shadow-sm ${status.color}`}>
                        <status.icon size={12} /> {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
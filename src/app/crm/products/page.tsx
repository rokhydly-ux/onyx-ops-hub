"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Package, Box, Search, Edit, Plus, CheckSquare, Layers, Clock, AlertTriangle, AlertCircle } from 'lucide-react';

const ECOSYSTEM_SAAS = [
  { id: "jaay", name: "Onyx Jaay", desc: "Boutique & Catalogue WhatsApp", price: "13 900 F" },
  { id: "tiak", name: "Onyx Tiak", desc: "Logistique & Livreurs", price: "13 900 F" },
  { id: "stock", name: "Onyx Stock", desc: "Gestion d'Inventaire", price: "13 900 F" },
  { id: "menu", name: "Onyx Menu", desc: "Menu QR & Commandes", price: "13 900 F" },
  { id: "booking", name: "Onyx Booking", desc: "Rendez-vous & Acomptes", price: "13 900 F" },
  { id: "staff", name: "Onyx Staff", desc: "Pointage & Paie", price: "13 900 F" },
  { id: "crm", name: "Onyx CRM", desc: "CRM B2B & Devis", price: "39 900 F" },
  { id: "tekki", name: "Pack Tekki", desc: "Pack Vente + Stock + Tiak", price: "22 900 F" },
];

export default function CRMCatalogPage() {
  const [activeTab, setActiveTab] = useState<'saas' | 'products'>('saas');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [tenantId, setTenantId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      const tId = user.user_metadata?.tenant_id || user.id;
      setTenantId(tId);

      const { data, error } = await supabase
        .from('crm_products')
        .select('*')
        .eq('tenant_id', tId)
        .order('created_at', { ascending: false });

      if (data && !error) setProducts(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const handleCategoryChange = async (productId: number, newCategory: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, category: newCategory } : p));
    if (tenantId) {
      await supabase.from('crm_products').update({ category: newCategory }).eq('id', productId).eq('tenant_id', tenantId);
    }
  };

  const toggleSelection = (id: number) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const getStockStatus = (lastSoldDate: string | null) => {
    if (!lastSoldDate) return { label: 'Inconnu', color: 'bg-zinc-100 text-zinc-500' };
    
    const daysSinceSold = Math.floor((new Date().getTime() - new Date(lastSoldDate).getTime()) / (1000 * 3600 * 24));
    
    if (daysSinceSold < 15) return { label: 'Actif', color: 'bg-green-100 text-green-700 border-green-200' };
    if (daysSinceSold <= 30) return { label: 'Alerte', color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'Stock Mort', color: 'bg-red-100 text-red-700 border-red-200' };
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  );

  const uniqueCategories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#39FF14]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Catalogue & Écosystème</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gérez vos offres et votre inventaire</p>
        </div>
      </div>

      <div className="flex gap-2 mb-8 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl w-max overflow-x-auto shadow-sm border border-zinc-200 dark:border-zinc-800">
        <button onClick={() => setActiveTab('saas')} className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'saas' ? 'bg-black text-[#39FF14] shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>
          <Layers size={14}/> SaaS Onyx
        </button>
        <button onClick={() => setActiveTab('products')} className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-black text-[#39FF14] shadow-sm' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>
          <Box size={14}/> Équipements & Stocks
        </button>
      </div>

      {activeTab === 'saas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-in fade-in">
          {ECOSYSTEM_SAAS.map(saas => (
            <div key={saas.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm hover:border-[#39FF14] transition-colors group flex flex-col justify-between min-h-[200px]">
              <div>
                <div className="w-12 h-12 bg-black text-[#39FF14] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Package size={24} />
                </div>
                <h3 className="font-black text-lg uppercase tracking-tighter">{saas.name}</h3>
                <p className="text-xs font-medium text-zinc-500 mt-2">{saas.desc}</p>
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="font-black text-xl text-black dark:text-white">{saas.price}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'products' && (
        <div className="animate-in fade-in space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="relative w-full sm:w-96">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Rechercher un produit..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14] transition-colors text-black dark:text-white"
              />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {selectedIds.size > 0 && (
                <button className="bg-black dark:bg-white text-[#39FF14] dark:text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-md flex items-center gap-2 hover:scale-105 transition-transform">
                  Créer un devis ({selectedIds.size})
                </button>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="p-4 w-12 text-center">
                    <input 
                      type="checkbox" 
                      onChange={e => {
                        if (e.target.checked) setSelectedIds(new Set(filteredProducts.map(p => p.id)));
                        else setSelectedIds(new Set());
                      }}
                      checked={selectedIds.size > 0 && selectedIds.size === filteredProducts.length}
                      className="w-4 h-4 accent-black dark:accent-[#39FF14]"
                    />
                  </th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Produit</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Catégorie</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Prix</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut (Rotation)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                {filteredProducts.map(product => {
                  const status = getStockStatus(product.last_sold_date);
                  return (
                    <tr key={product.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                      <td className="p-4 text-center">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelection(product.id)}
                          className="w-4 h-4 accent-black dark:accent-[#39FF14] cursor-pointer"
                        />
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-sm text-black dark:text-white line-clamp-1">{product.name}</p>
                      </td>
                      <td className="p-4">
                        <select 
                          value={product.category || ''} 
                          onChange={(e) => handleCategoryChange(product.id, e.target.value)}
                          className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold px-3 py-1.5 rounded-lg outline-none focus:border-[#39FF14] text-zinc-700 dark:text-zinc-300 cursor-pointer"
                        >
                          <option value="">Non catégorisé</option>
                          {uniqueCategories.map(cat => (
                            <option key={cat as string} value={cat as string}>{cat as string}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4">
                        <p className="font-black text-sm">{product.unit_price ? product.unit_price.toLocaleString('fr-FR') : (product.price_ttc ? product.price_ttc.toLocaleString('fr-FR') : 0)} F</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-10 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest italic">Aucun produit trouvé.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
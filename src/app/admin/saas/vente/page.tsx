"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Store, Settings, TrendingUp, Users, Search, Power, Trash2, ExternalLink } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function OnyxJaayAdmin() {
  const router = useRouter();
  const [shops, setShops] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchShops = async () => {
      const { data, error } = await supabase.from('shops').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        setShops(data);
      }
      setIsLoading(false);
    };
    fetchShops();
  }, []);

  const handleToggleShopStatus = async (shopId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'Actif' ? 'Suspendu' : 'Actif';
      if (!confirm(`Voulez-vous vraiment passer cette boutique en statut : ${newStatus} ?`)) return;
      
      const { error } = await supabase.from('shops').update({ status: newStatus }).eq('id', shopId);
      if (!error) {
          setShops(prev => prev.map(s => s.id === shopId ? { ...s, status: newStatus } : s));
      }
  };

  const activeShops = shops.filter(s => s.status !== 'Suspendu').length;
  const mrr = activeShops * 9900; // Estimation à 9900F par boutique

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-zinc-950 font-sans text-black dark:text-white selection:bg-[#39FF14]/30">
      {/* Header */}
      <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 h-24 flex items-center justify-between px-8 z-20 sticky top-0">
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/admin')} className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-[#39FF14] transition-all">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
              Onyx Jaay <span className="bg-[#39FF14]/20 text-[#39FF14] text-[10px] px-3 py-1 rounded-full font-bold">V 2.0</span>
            </h1>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Super-Admin Module</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2 hover:scale-105 transition-transform">
             <Settings size={16} /> Configurer l'Offre
          </button>
        </div>
      </header>

      <main className="p-8 max-w-7xl mx-auto space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center"><Store size={32}/></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Boutiques Déployées</p>
              <p className="text-4xl font-black">{shops.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-6 shadow-sm">
            <div className="w-16 h-16 bg-green-50 dark:bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center"><Users size={32}/></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Boutiques Actives</p>
              <p className="text-4xl font-black">{activeShops}</p>
            </div>
          </div>
          <div className="bg-black p-6 rounded-3xl border border-zinc-800 flex items-center gap-6 shadow-2xl">
            <div className="w-16 h-16 bg-[#39FF14]/10 text-[#39FF14] rounded-2xl flex items-center justify-center"><TrendingUp size={32}/></div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">MRR Estimé (9900 F/mois)</p>
              <p className="text-4xl font-black text-[#39FF14]">{mrr.toLocaleString()} F</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-sm overflow-hidden">
           <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h3 className="font-black uppercase text-lg">Instances Onyx Jaay</h3>
              <div className="relative w-64">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input type="text" placeholder="Rechercher une boutique..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm outline-none focus:border-[#39FF14] transition" />
              </div>
           </div>
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                    <tr>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Boutique & Lien</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Création</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">ID Propriétaire</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Statut SaaS</th>
                       <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {isLoading ? (
                       <tr><td colSpan={5} className="p-8 text-center text-zinc-500">Chargement...</td></tr>
                    ) : shops.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase())).map(shop => (
                       <tr key={shop.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="p-4">
                             <p className="font-bold text-sm text-black dark:text-white flex items-center gap-2">
                               {shop.name}
                               <a href={`/${shop.slug}`} target="_blank" className="text-blue-500 hover:scale-110 transition-transform"><ExternalLink size={14}/></a>
                             </p>
                             <p className="text-[10px] text-zinc-500 mt-1">/{shop.slug}</p>
                          </td>
                          <td className="p-4 text-xs font-medium text-zinc-600 dark:text-zinc-400">
                             {new Date(shop.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="p-4 text-xs font-mono text-zinc-500">
                             {shop.owner_id ? shop.owner_id.substring(0, 12) + '...' : 'Non assigné'}
                          </td>
                          <td className="p-4">
                             <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg ${shop.status === 'Suspendu' ? 'bg-red-100 text-red-600' : 'bg-[#39FF14]/20 text-green-700 dark:text-[#39FF14]'}`}>
                                {shop.status || 'Actif'}
                             </span>
                          </td>
                          <td className="p-4 text-right flex items-center justify-end gap-2">
                             <button 
                               onClick={() => handleToggleShopStatus(shop.id, shop.status)}
                               className={`p-2 rounded-xl transition-colors ${shop.status === 'Suspendu' ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'}`} 
                               title={shop.status === 'Suspendu' ? 'Réactiver' : 'Suspendre'}
                             >
                                <Power size={16} />
                             </button>
                             <button className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors" title="Supprimer la boutique">
                                <Trash2 size={16} />
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      </main>
    </div>
  );
}
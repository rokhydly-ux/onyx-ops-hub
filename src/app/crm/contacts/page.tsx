"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, Phone, Tag, TrendingUp, MoreHorizontal, User, Activity, Filter, MapPin } from 'lucide-react';

// Mini graphique Sparkline
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;
  const width = 60;
  const height = 24;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / (range || 1)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible opacity-80">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function CRMContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data, error } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        // Ajout de fausses données Sparkline pour l'historique d'achat
        const enhancedData = data.map(c => ({
            ...c,
            historyData: Array.from({ length: 6 }, () => Math.floor(Math.random() * 500000)),
            totalSpent: Math.floor(Math.random() * 2000000)
        }));
        setContacts(enhancedData);
      }
      setIsLoading(false);
    };
    fetchContacts();
  }, []);

  const filteredContacts = contacts.filter(c => 
    (c.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search) ||
    (c.activity || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full">
      
      {/* BARRE DE RECHERCHE */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0 bg-white dark:bg-zinc-950 p-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Rechercher un contact, une entreprise ou un numéro..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-black dark:text-white outline-none focus:border-[#39FF14] dark:focus:border-[#39FF14] transition-all"
          />
        </div>
        <button className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-black dark:hover:text-white px-6 py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 border border-zinc-200 dark:border-zinc-800 transition-colors">
           <Filter size={16} /> Filtres Avancés
        </button>
      </div>

      {/* TABLEAU / CARTES */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
         {/* VUE MOBILE (Cartes) */}
         <div className="md:hidden space-y-4">
            {filteredContacts.map(c => (
               <div key={c.id} className="bg-white dark:bg-zinc-950 p-5 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-black text-black dark:text-white shrink-0">{c.full_name?.charAt(0) || '?'}</div>
                        <div>
                           <p className="font-black text-sm uppercase text-black dark:text-white">{c.full_name}</p>
                           <p className="text-xs font-bold text-[#39FF14] mt-0.5">{c.phone}</p>
                        </div>
                     </div>
                     <button className="text-zinc-400"><MoreHorizontal size={18} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {c.activity && <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{c.activity}</span>}
                     {(c.active_saas || []).map((saas: string) => <span key={saas} className="bg-[#39FF14]/10 text-[#39FF14] px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-[#39FF14]/20">{saas}</span>)}
                  </div>
                  <div className="flex justify-between items-end pt-3 border-t border-zinc-100 dark:border-zinc-800">
                     <div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Total Généré</p>
                        <p className="font-black text-lg">{c.totalSpent.toLocaleString('fr-FR')} F</p>
                     </div>
                     <Sparkline data={c.historyData} color="#39FF14" />
                  </div>
               </div>
            ))}
         </div>

         {/* VUE DESKTOP (Table) */}
         <div className="hidden md:block bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nom & Contact</th>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Secteur / Intérêts</th>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Valeur & Historique</th>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {filteredContacts.map(c => (
                     <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors group">
                        <td className="p-5">
                           <p className="font-black text-sm uppercase text-black dark:text-white">{c.full_name}</p>
                           <p className="text-xs font-bold text-[#39FF14] mt-1 flex items-center gap-1.5"><Phone size={12} className="text-zinc-500" /> {c.phone}</p>
                        </td>
                        <td className="p-5">
                           <div className="flex flex-wrap gap-2">
                              {c.activity && <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{c.activity}</span>}
                              {(c.active_saas || c.saas ? [c.saas] : []).map((saas: string) => saas && <span key={saas} className="bg-[#39FF14]/10 text-[#39FF14] px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border border-[#39FF14]/20">{saas}</span>)}
                           </div>
                        </td>
                        <td className="p-5 flex items-center gap-6">
                           <div className="min-w-[100px]">
                              <p className="font-black text-base">{c.totalSpent.toLocaleString('fr-FR')} F</p>
                           </div>
                           <Sparkline data={c.historyData} color="#39FF14" />
                        </td>
                        <td className="p-5 text-right">
                           <button className="p-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white rounded-xl transition-colors"><MoreHorizontal size={18} /></button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
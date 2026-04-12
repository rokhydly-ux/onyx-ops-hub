"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, Phone, Download, MoreHorizontal, User, Activity, Filter, MapPin, Trash2, CheckCircle, ChevronLeft, ChevronRight, Loader2, Mail } from 'lucide-react';
import Papa from 'papaparse';

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
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const fetchContacts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      const tenantId = user.user_metadata?.tenant_id || user.id;

      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
        
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

  const filteredContacts = React.useMemo(() => {
      return contacts.filter(c => {
          const matchSearch = (c.full_name || '').toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search) || (c.activity || '').toLowerCase().includes(search.toLowerCase());
          const matchType = typeFilter === 'Tous' || c.type === typeFilter;
          return matchSearch && matchType;
      });
  }, [contacts, search, typeFilter]);

  useEffect(() => {
      setCurrentPage(1);
  }, [search, typeFilter]);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleExportCSV = () => {
    if (selectedIds.size === 0) return alert("Veuillez sélectionner au moins un contact à exporter.");
    const exportData = contacts.filter(c => selectedIds.has(c.id)).map(c => ({
      'Nom Complet': c.full_name,
      'Téléphone': c.phone,
      'Type': c.type || 'N/A',
      'Activité': c.activity || 'N/A',
      'Date d\'ajout': new Date(c.created_at).toLocaleDateString('fr-FR')
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Contacts_CRM_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#39FF14]" /></div>;

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
        <div className="flex gap-3">
           <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-xs font-bold outline-none cursor-pointer appearance-none text-black dark:text-white">
              <option value="Tous">Tous les types</option>
              <option value="Client">Clients</option>
              <option value="Prospect">Prospects</option>
           </select>
           {filteredContacts.length > 0 && (
              <label className="flex items-center gap-2 cursor-pointer bg-zinc-50 dark:bg-zinc-900 px-4 py-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-[#39FF14] transition-colors">
                  <input type="checkbox" checked={selectedIds.size > 0 && selectedIds.size === filteredContacts.length} onChange={e => {
                      if (e.target.checked) setSelectedIds(new Set(filteredContacts.map(c => c.id)));
                      else setSelectedIds(new Set());
                  }} className="w-4 h-4 accent-black dark:accent-[#39FF14] cursor-pointer" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black dark:text-white hidden sm:inline-block">Tout cocher</span>
              </label>
           )}
        </div>
      </div>

      {/* TABLEAU / CARTES */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
         {/* VUE MOBILE (Cartes) */}
         <div className="md:hidden space-y-4">
            {paginatedContacts.map(c => (
               <div key={c.id} className={`bg-white dark:bg-zinc-950 p-5 rounded-[2rem] border shadow-sm space-y-4 transition-colors ${selectedIds.has(c.id) ? 'border-[#39FF14] bg-[#39FF14]/5' : 'border-zinc-200 dark:border-zinc-800'}`}>
                  <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <input 
                           type="checkbox" 
                           checked={selectedIds.has(c.id)}
                           onChange={() => toggleSelection(c.id)}
                           className="w-4 h-4 accent-black dark:accent-[#39FF14]"
                        />
                        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center font-black text-[#39FF14] shrink-0 shadow-md">{c.full_name?.charAt(0) || '?'}</div>
                        <div>
                           <p className="font-black text-sm uppercase text-black dark:text-white">{c.full_name}</p>
                           <p className="text-xs font-bold text-[#39FF14] mt-0.5">{c.phone}</p>
                        </div>
                     </div>
                     <button className="text-zinc-400"><MoreHorizontal size={18} /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {c.activity && <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{c.activity}</span>}
                     <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${c.type === 'Client' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'}`}>{c.type}</span>
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
            {paginatedContacts.length === 0 && (
               <div className="p-10 text-center text-zinc-400 font-bold uppercase text-xs tracking-widest italic bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem]">Aucun contact trouvé.</div>
            )}
         </div>

         {/* VUE DESKTOP (Table) */}
         <div className="hidden md:block bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm overflow-hidden">
            <table className="w-full text-left">
               <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                     <th className="w-12 p-5 text-center"></th>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Contact</th>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Secteur / Intérêts</th>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Valeur & Historique</th>
                     <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                  {paginatedContacts.map(c => (
                     <tr key={c.id} className={`transition-colors group ${selectedIds.has(c.id) ? 'bg-[#39FF14]/5' : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/30'}`}>
                        <td className="p-5 text-center">
                           <input type="checkbox" checked={selectedIds.has(c.id)} onChange={() => toggleSelection(c.id)} className="w-4 h-4 accent-black dark:accent-[#39FF14] cursor-pointer" />
                        </td>
                        <td className="p-5">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-black text-[#39FF14] flex items-center justify-center font-black shadow-md shrink-0">{c.full_name?.charAt(0) || '?'}</div>
                              <div>
                                 <p className="font-black text-sm uppercase text-black dark:text-white">{c.full_name}</p>
                                 <p className="text-xs font-bold text-[#39FF14] mt-1 flex items-center gap-1.5"><Phone size={12} className="text-zinc-500" /> {c.phone}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-5">
                           <div className="flex flex-wrap gap-2">
                              {c.activity && <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">{c.activity}</span>}
                              <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest border ${c.type === 'Client' ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20' : 'bg-orange-500/10 text-orange-500 border-orange-500/20'}`}>{c.type}</span>
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
                  {paginatedContacts.length === 0 && (
                     <tr><td colSpan={5} className="p-10 text-center text-zinc-400 font-bold uppercase text-xs tracking-widest italic">Aucun contact trouvé.</td></tr>
                  )}
               </tbody>
            </table>
         </div>

         {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 disabled:opacity-50 text-black dark:text-white transition-colors shadow-sm"><ChevronLeft size={16}/></button>
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-xl">Page {currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 disabled:opacity-50 text-black dark:text-white transition-colors shadow-sm"><ChevronRight size={16}/></button>
            </div>
         )}
      </div>

      {/* BARRE FLOTTANTE POUR SÉLECTION */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-4 rounded-[2rem] shadow-2xl flex items-center justify-center gap-4 z-50 animate-in slide-in-from-bottom-8 border border-zinc-800 dark:border-zinc-200">
          <div className="flex items-center gap-2 font-black uppercase tracking-widest text-xs">
            <span className="bg-[#39FF14] text-black w-6 h-6 rounded-full flex items-center justify-center">{selectedIds.size}</span> Sélectionnés
          </div>
          <div className="w-px h-6 bg-zinc-800 dark:bg-zinc-200"></div>
          <button onClick={handleExportCSV} className="text-[#39FF14] dark:text-black font-black uppercase text-xs hover:scale-105 transition-transform flex items-center gap-2">
            <Download size={16} /> Exporter CSV
          </button>
        </div>
      )}
    </div>
  );
}
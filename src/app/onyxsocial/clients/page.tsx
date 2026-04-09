"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, Search, Filter, MessageSquare, Plus, 
  ExternalLink, Activity, ArrowRight, Instagram, Facebook 
} from 'lucide-react';

export default function OnyxSocialClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetching clients linked to the user for OnyxSocial
        const { data } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (data) setClients(data);
      }
      setIsLoading(false);
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone || '').includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 max-w-7xl mx-auto">
      {/* --- HEADER --- */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
            <Activity className="text-[#39FF14]" size={28} /> OnyxSocial <span className="text-zinc-500">Clients</span>
          </h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
            Gérez votre audience et vos interactions sociales
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Rechercher un client..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14] transition-colors w-64"
            />
          </div>
          <button className="flex items-center gap-2 bg-black dark:bg-white text-[#39FF14] dark:text-black px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">
            <Plus size={16}/> Importer Audience
          </button>
        </div>
      </div>

      {/* --- STATS BAR --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Audience Totale</span>
          <span className="text-3xl font-black text-black dark:text-white">{clients.length}</span>
        </div>
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Taux d'Engagement</span>
          <span className="text-3xl font-black text-[#39FF14]">24.8%</span>
        </div>
        <div className="bg-gradient-to-br from-pink-500 to-orange-400 p-6 rounded-3xl shadow-sm flex flex-col text-white">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 mb-2 flex items-center gap-2"><Instagram size={14}/> Nouveaux (Insta)</span>
          <span className="text-3xl font-black">+142</span>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-400 p-6 rounded-3xl shadow-sm flex flex-col text-white">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/80 mb-2 flex items-center gap-2"><Facebook size={14}/> Leads (Facebook)</span>
          <span className="text-3xl font-black">+89</span>
        </div>
      </div>

      {/* --- CLIENTS LIST --- */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] overflow-hidden shadow-sm flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Profil</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Contact</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Origine</th>
                <th className="p-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {isLoading ? (
                <tr><td colSpan={4} className="p-10 text-center"><div className="w-6 h-6 border-2 border-[#39FF14] border-t-transparent rounded-full animate-spin mx-auto"></div></td></tr>
              ) : filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors group">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center font-black text-sm uppercase">
                        {client.avatar_url ? (
                           <img src={client.avatar_url} alt="" className="w-full h-full rounded-full object-cover"/>
                        ) : client.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-sm uppercase text-black dark:text-white">{client.full_name}</p>
                        <p className="text-[10px] font-bold text-zinc-500 mt-0.5">{client.type || 'Abonné'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-xs text-[#39FF14]">{client.phone}</p>
                    {client.email && <p className="text-[10px] text-zinc-500 mt-0.5">{client.email}</p>}
                  </td>
                  <td className="p-4">
                    <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-max">
                      {client.source?.toLowerCase().includes('insta') ? <Instagram size={10} className="text-pink-500"/> : <Facebook size={10} className="text-blue-500"/>}
                      {client.source || 'Organique'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 hover:text-black dark:hover:text-white transition-colors" title="Envoyer Message">
                        <MessageSquare size={16}/>
                      </button>
                      <button className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-zinc-500 hover:text-[#39FF14] transition-colors" title="Voir Profil">
                        <ExternalLink size={16}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-16 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-zinc-100 dark:border-zinc-800 m-4 rounded-3xl">
                    Aucun profil trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
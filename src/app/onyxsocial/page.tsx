"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ChevronDown, Plus, Wand2, Battery, Target, AlertTriangle } from 'lucide-react';

export default function OnyxSocialDashboard() {
  const router = useRouter();
  // Les états sont initialisés vides. Il n'y a aucune donnée factice (mock data).
  const [clients, setClients] = useState<any[]>([]);
  const [filter, setFilter] = useState("Tous les dossiers");
  const [agents, setAgents] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          // On cible par exemple les clients qui ont souscrit à l'Add-on CM & Pub pour la gestion Social
          .eq('saas', 'Add-on CM Pub');
        
        if (data && !error) {
          setClients(data);
          const uniqueAgents = Array.from(new Set(data.map(c => c.assigned_to).filter(Boolean))) as string[];
          setAgents(uniqueAgents);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(c => {
    if (filter === "Tous les dossiers") return true;
    return c.assigned_to === filter.replace("Dossiers de ", "");
  });

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto relative z-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
            OnyxSocial : <span className="text-[#39FF14]">Machine d'Acquisition</span>
          </h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-2">
            Terminal de Production & Suivi Publicitaire
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-56">
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-zinc-800 text-white text-xs font-bold uppercase tracking-widest p-3 md:p-4 rounded-xl appearance-none outline-none focus:border-[#39FF14] transition-colors cursor-pointer"
            >
              <option value="Tous les dossiers">Tous les dossiers</option>
              {agents.map(agent => (
                <option key={agent} value={`Dossiers de ${agent}`}>Dossiers de {agent}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
          </div>
          
          <button 
            onClick={() => router.push('/onyxsocial/clients')}
            className="bg-[#39FF14] text-black px-6 py-3 md:py-4 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 hover:bg-white transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)] whitespace-nowrap shrink-0"
          >
            <Plus size={16} /> Ajouter un Client
          </button>
        </div>
      </div>

      {/* GRID CLIENTS */}
      {isLoading ? (
         <div className="flex items-center justify-center py-20">
           <div className="w-10 h-10 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map((client) => {
            // Ces variables viendront plus tard de la base de données
            const budgetRestant = client.ad_budget_remaining || 0;
            const budgetTotal = client.ad_budget_total || 0;
            const progressPct = budgetTotal > 0 ? (budgetRestant / budgetTotal) * 100 : 0;
            
            return (
            <div key={client.id} className="bg-[#0a0a0a] border border-zinc-800/80 p-6 rounded-[2rem] hover:border-[#39FF14]/50 transition-colors shadow-lg flex flex-col group relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-[#39FF14] opacity-50 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-black text-lg text-white uppercase tracking-tight truncate max-w-[180px]">{client.full_name}</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Page : {client.page_name || 'Non liée'}</p>
                </div>
                <div className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 font-black text-sm uppercase border border-zinc-800">
                  {client.full_name?.charAt(0) || 'C'}
                </div>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-black uppercase text-zinc-400 flex items-center gap-1.5"><Target size={12}/> Budget Pub Restant</span>
                  <span className="text-sm font-black text-white">{budgetRestant.toLocaleString('fr-FR')} F</span>
                </div>
                <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-1000 ${progressPct < 20 ? 'bg-red-500' : 'bg-[#39FF14]'}`} style={{ width: `${progressPct}%` }}></div>
                </div>
                {progressPct < 20 && budgetTotal > 0 && (
                  <p className="text-[9px] font-bold text-red-500 mt-2 flex items-center gap-1 uppercase tracking-widest"><AlertTriangle size={10}/> Budget critique</p>
                )}
              </div>

              <button 
                onClick={() => router.push(`/onyxsocial/generator?client=${client.id}`)}
                className="mt-auto w-full bg-zinc-900 border border-zinc-800 text-[#39FF14] py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-all flex items-center justify-center gap-2 group/btn"
              >
                <Wand2 size={14} className="group-hover/btn:animate-pulse" /> Ouvrir le Mixeur IA
              </button>
            </div>
          )})}

          {filteredClients.length === 0 && (
            <div className="col-span-full border-2 border-dashed border-zinc-800/50 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-600 mb-4">
                <Battery size={24} />
              </div>
              <h3 className="text-lg font-black text-white uppercase tracking-tighter mb-2">Aucun dossier actif</h3>
              <p className="text-xs font-bold text-zinc-500 max-w-md">La base de données est actuellement vide pour ce filtre. Ajoutez un nouveau client pour alimenter la machine d'acquisition.</p>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
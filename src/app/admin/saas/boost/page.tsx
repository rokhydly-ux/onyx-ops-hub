"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Rocket, TrendingUp, DollarSign, Target, 
  Search, Filter, Megaphone, Video, MoreVertical, CheckCircle, Clock, AlertTriangle
} from 'lucide-react';

// Mock Data pour les clients High-Ticket Onyx Boost
const MOCK_BOOST_CLIENTS = [
  { id: 1, shop: "Maison de l'Élégance", contact: "77 111 22 33", budget_ads: 150000, spent: 120000, roas: 4.2, task: "A/B Testing Meta", status: "Performant" },
  { id: 2, shop: "Central Équipements", contact: "76 999 88 77", budget_ads: 300000, spent: 50000, roas: 2.1, task: "Setup Vendeuse IA", status: "En démarrage" },
  { id: 3, shop: "Fatou Cosmetics", contact: "78 444 55 66", budget_ads: 100000, spent: 100000, roas: 1.5, task: "Montage Reels (CapCut)", status: "Budget Épuisé" },
  { id: 4, shop: "Tech Store SN", contact: "77 333 11 22", budget_ads: 250000, spent: 180000, roas: 5.8, task: "Scaling Campagnes", status: "Performant" },
];

export default function OnyxBoostAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clients' | 'settings'>('clients');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00E5FF] selection:text-black pb-20">
      
      {/* HEADER NAVBAR */}
      <header className="bg-black/80 backdrop-blur-md border-b border-zinc-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')} 
              className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl flex items-center justify-center">
                <Rocket size={20} className="text-[#00E5FF]" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tighter uppercase flex items-center gap-2">
                  Onyx <span className="text-[#00E5FF]">Boost</span>
                  <span className="flex h-2 w-2 relative ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00E5FF]"></span>
                  </span>
                </h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Agence Croissance & Performance</p>
              </div>
            </div>
          </div>
          
          <div className="flex bg-zinc-900 p-1 rounded-xl hidden sm:flex">
            <button 
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'clients' ? 'bg-black text-[#00E5FF] shadow-md' : 'text-zinc-500 hover:text-white'}`}
            >
              Portefeuille Clients
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-black text-[#00E5FF] shadow-md' : 'text-zinc-500 hover:text-white'}`}
            >
              Stratégie Globale
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* STATS DE PERFORMANCE AGENCE */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Target size={20} className="text-blue-500"/></div>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">Actifs</span>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Clients Boost</p>
            <p className="text-3xl font-black">14</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg"><DollarSign size={20} className="text-purple-500"/></div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Budget Meta Géré</p>
            <p className="text-3xl font-black text-white">2.8M F</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#39FF14]/10 rounded-lg"><TrendingUp size={20} className="text-[#39FF14]"/></div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">ROAS Moyen</p>
            <p className="text-3xl font-black text-[#39FF14]">3.4x</p>
          </div>

          <div className="bg-gradient-to-br from-[#00E5FF] to-blue-600 text-black p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,229,255,0.2)] flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-white/20 blur-2xl rounded-full group-hover:scale-150 transition-transform"></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 relative z-10">Revenu Agence (MRR)</p>
            <p className="text-3xl font-black tracking-tighter relative z-10">2.1M F</p>
            <button className="mt-4 w-full bg-black text-[#00E5FF] py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform relative z-10">
              Voir la trésorerie
            </button>
          </div>
        </div>

        {activeTab === 'clients' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Comptes <span className="text-[#00E5FF]">Gérés</span></h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Rechercher une marque..." 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[#00E5FF] transition"
                  />
                </div>
                <button className="p-2.5 bg-zinc-900 border border-zinc-800 rounded-xl hover:bg-zinc-800 transition">
                  <Filter size={18} className="text-zinc-400" />
                </button>
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-black/50 border-b border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <th className="p-5 whitespace-nowrap">Marque</th>
                      <th className="p-5 whitespace-nowrap">Budget Alloué</th>
                      <th className="p-5 whitespace-nowrap">Dépensé</th>
                      <th className="p-5 text-center whitespace-nowrap">ROAS</th>
                      <th className="p-5 whitespace-nowrap">Action / Tâche en cours</th>
                      <th className="p-5 whitespace-nowrap">Statut</th>
                      <th className="p-5 text-right">Gérer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {MOCK_BOOST_CLIENTS.map((client) => {
                      const spendPercentage = (client.spent / client.budget_ads) * 100;
                      
                      return (
                        <tr key={client.id} className="hover:bg-zinc-800/30 transition-colors">
                          <td className="p-5 font-black text-sm">{client.shop}</td>
                          <td className="p-5 text-sm font-bold text-zinc-300">{client.budget_ads.toLocaleString()} F</td>
                          <td className="p-5">
                            <div className="flex flex-col gap-1 w-24">
                              <span className="text-xs font-bold text-zinc-400">{client.spent.toLocaleString()} F</span>
                              <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${spendPercentage >= 95 ? 'bg-red-500' : 'bg-[#00E5FF]'}`}
                                  style={{ width: `${Math.min(spendPercentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5 text-center">
                            <span className={`font-black px-2 py-1 rounded text-xs ${client.roas >= 3 ? 'bg-[#39FF14]/10 text-[#39FF14]' : client.roas >= 2 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                              {client.roas}x
                            </span>
                          </td>
                          <td className="p-5">
                            <span className="flex items-center gap-2 text-xs font-bold text-zinc-300">
                              {client.task.includes('Meta') || client.task.includes('Scaling') ? <Megaphone size={14} className="text-blue-400"/> : <Video size={14} className="text-purple-400"/>}
                              {client.task}
                            </span>
                          </td>
                          <td className="p-5">
                            <span className={`text-[10px] font-black uppercase flex items-center gap-1 w-max px-2 py-1 rounded-md ${client.status === 'Performant' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : client.status === 'En démarrage' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                              {client.status === 'Performant' ? <CheckCircle size={12}/> : client.status === 'En démarrage' ? <Clock size={12}/> : <AlertTriangle size={12}/>}
                              {client.status}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <button className="text-zinc-500 hover:text-[#00E5FF] p-2 transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 max-w-3xl">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Paramètres <span className="text-[#00E5FF]">Agence</span></h2>
            
            <div className="space-y-6">
              {/* Settings Block 1 */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Megaphone className="text-[#00E5FF]" size={24} />
                  <h3 className="font-black text-lg uppercase">Stratégie d'Acquisition Standard</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Budget Meta Ads Minimum Requis (FCFA)</label>
                    <input type="number" defaultValue="50000" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm font-bold focus:border-[#00E5FF] outline-none transition" />
                    <p className="text-xs text-zinc-500 mt-2">Le commercial sera alerté si le client a un budget inférieur.</p>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">KPI Principal à tracker par défaut</label>
                    <select className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm font-bold focus:border-[#00E5FF] outline-none cursor-pointer">
                      <option>ROAS (Retour sur investissement)</option>
                      <option>CPL (Coût par Lead WhatsApp)</option>
                      <option>CPA (Coût par Acquisition Client)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Settings Block 2 */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Video className="text-purple-400" size={24} />
                  <h3 className="font-black text-lg uppercase">Quotas Community Management</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Posts statiques / mois</label>
                    <input type="number" defaultValue="8" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm font-bold focus:border-purple-400 outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Reels & TikToks / mois</label>
                    <input type="number" defaultValue="4" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm font-bold focus:border-purple-400 outline-none" />
                  </div>
                </div>
                <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <p className="text-xs text-purple-300 font-bold">⚠️ Rappel : Ces quotas définissent la charge de travail du CM Freelance.</p>
                </div>
              </div>

              <button className="bg-[#00E5FF] text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-colors w-full shadow-[0_10px_30px_rgba(0,229,255,0.2)]">
                Sauvegarder les paramètres agence
              </button>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
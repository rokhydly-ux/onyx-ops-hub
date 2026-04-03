"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Megaphone, Image as ImageIcon, Video, 
  Search, Filter, CheckCircle, Clock, AlertTriangle, 
  MoreVertical, Sun, Moon, Users, TrendingUp
} from 'lucide-react';

// Mock Data pour les clients de l'Option CM & Pub (+49.900 F)
const MOCK_CM_CLIENTS = [
  { id: 1, shop: "Boutique Ndeye", contact: "77 123 45 67", posts: 6, reels: 2, ads: 3, status: "En production" },
  { id: 2, shop: "Resto La Fourchette", contact: "76 987 65 43", posts: 8, reels: 4, ads: 3, status: "Quotas Atteints" },
  { id: 3, shop: "Mode SN", contact: "78 555 44 33", posts: 1, reels: 0, ads: 1, status: "Attente Rushs (Client)" },
  { id: 4, shop: "Tech Store", contact: "77 444 11 22", posts: 4, reels: 2, ads: 2, status: "En production" },
];

export default function OnyxCmPubAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clients' | 'production'>('clients');
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Thème dynamique pour le Toggle Dark/Light Mode
  const theme = {
    bg: isDark ? 'bg-[#050505]' : 'bg-zinc-50',
    text: isDark ? 'text-white' : 'text-zinc-900',
    headerBg: isDark ? 'bg-black/80' : 'bg-white/80',
    headerBorder: isDark ? 'border-zinc-900' : 'border-zinc-200',
    cardBg: isDark ? 'bg-zinc-900' : 'bg-white',
    cardBorder: isDark ? 'border-zinc-800' : 'border-zinc-200',
    textMuted: isDark ? 'text-zinc-500' : 'text-zinc-500',
    textSub: isDark ? 'text-zinc-400' : 'text-zinc-600',
    hoverBg: isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-zinc-50',
    inputBg: isDark ? 'bg-zinc-900' : 'bg-white',
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans transition-colors duration-500 selection:bg-[#00E5FF] selection:text-black pb-20`}>
      
      {/* HEADER NAVBAR */}
      <header className={`${theme.headerBg} backdrop-blur-md border-b ${theme.headerBorder} sticky top-0 z-50 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-zinc-900 hover:bg-zinc-800' : 'bg-zinc-100 hover:bg-zinc-200'}`}
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl flex items-center justify-center">
                <Megaphone size={20} className="text-[#00E5FF]" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tighter uppercase flex items-center gap-2">
                  Option <span className="text-[#00E5FF]">CM & Pub</span>
                </h1>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Gestion Production & Agence</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* TOGGLE DARK/LIGHT MODE */}
            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'}`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className={`flex p-1 rounded-xl hidden md:flex ${isDark ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
              <button 
                onClick={() => setActiveTab('clients')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'clients' ? 'bg-black text-[#00E5FF] shadow-md' : `${theme.textMuted} hover:${theme.text}`}`}
              >
                Clients
              </button>
              <button 
                onClick={() => setActiveTab('production')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'production' ? 'bg-black text-[#00E5FF] shadow-md' : `${theme.textMuted} hover:${theme.text}`}`}
              >
                Production (CM)
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* STATS RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg transition-colors`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Users size={20} className="text-blue-500"/></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textMuted}`}>Clients CM Actifs</p>
            <p className="text-3xl font-black">24</p>
          </div>
          
          <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg transition-colors`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#00E5FF]/10 rounded-lg"><ImageIcon size={20} className="text-[#00E5FF]"/></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textMuted}`}>Posts Créés (Ce mois)</p>
            <p className="text-3xl font-black">142 <span className="text-sm text-zinc-500 font-bold">/ 192</span></p>
          </div>

          <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg transition-colors`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg"><Video size={20} className="text-purple-500"/></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textMuted}`}>Reels Créés (Ce mois)</p>
            <p className="text-3xl font-black text-purple-500">68 <span className="text-sm text-zinc-500 font-bold">/ 96</span></p>
          </div>

          <div className="bg-[#00E5FF] text-black p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,229,255,0.2)] flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Revenu Service Mensuel</p>
            <p className="text-3xl font-black tracking-tighter">1.19M F</p>
            <button className="mt-4 w-full bg-black text-[#00E5FF] py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform">
              Payer le CM Freelance
            </button>
          </div>
        </div>

        {activeTab === 'clients' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Suivi des <span className="text-[#00E5FF]">Quotas Clients</span></h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                  <input 
                    type="text" 
                    placeholder="Rechercher un client..." 
                    className={`w-full ${theme.inputBg} border ${theme.cardBorder} rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[#00E5FF] transition-colors`}
                  />
                </div>
                <button className={`p-2.5 ${theme.inputBg} border ${theme.cardBorder} rounded-xl hover:border-[#00E5FF] transition-colors`}>
                  <Filter size={18} className={theme.textSub} />
                </button>
              </div>
            </div>

            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl overflow-hidden shadow-2xl transition-colors`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${isDark ? 'bg-black/50' : 'bg-zinc-100'} border-b ${theme.cardBorder} text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>
                      <th className="p-5 whitespace-nowrap">Entreprise</th>
                      <th className="p-5 whitespace-nowrap w-32">Posts (Max 8)</th>
                      <th className="p-5 whitespace-nowrap w-32">Reels (Max 4)</th>
                      <th className="p-5 whitespace-nowrap">Campagnes Ads</th>
                      <th className="p-5 whitespace-nowrap">Statut Production</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-200'}`}>
                    {MOCK_CM_CLIENTS.map((client) => (
                      <tr key={client.id} className={`${theme.hoverBg} transition-colors`}>
                        <td className="p-5">
                          <p className="font-black text-sm">{client.shop}</p>
                          <p className={`text-[10px] font-bold ${theme.textSub}`}>{client.contact}</p>
                        </td>
                        
                        {/* QUOTA POSTS */}
                        <td className="p-5">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className={theme.textMuted}>{client.posts}/8</span>
                              <span className={client.posts === 8 ? 'text-[#39FF14]' : theme.textMuted}>
                                {Math.round((client.posts / 8) * 100)}%
                              </span>
                            </div>
                            <div className={`h-1.5 w-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} rounded-full overflow-hidden`}>
                              <div 
                                className={`h-full rounded-full ${client.posts === 8 ? 'bg-[#39FF14]' : 'bg-[#00E5FF]'}`}
                                style={{ width: `${(client.posts / 8) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* QUOTA REELS */}
                        <td className="p-5">
                          <div className="flex flex-col gap-1 w-full">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className={theme.textMuted}>{client.reels}/4</span>
                              <span className={client.reels === 4 ? 'text-[#39FF14]' : 'text-purple-500'}>
                                {Math.round((client.reels / 4) * 100)}%
                              </span>
                            </div>
                            <div className={`h-1.5 w-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} rounded-full overflow-hidden`}>
                              <div 
                                className={`h-full rounded-full ${client.reels === 4 ? 'bg-[#39FF14]' : 'bg-purple-500'}`}
                                style={{ width: `${(client.reels / 4) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>

                        {/* ADS */}
                        <td className="p-5">
                          <span className={`flex items-center gap-1 text-xs font-bold ${theme.textSub}`}>
                            <Megaphone size={14} className={client.ads === 3 ? "text-[#39FF14]" : "text-blue-500"}/>
                            {client.ads} / 3 Actives
                          </span>
                        </td>

                        {/* STATUS */}
                        <td className="p-5">
                          <span className={`text-[10px] font-black uppercase flex items-center gap-1 w-max px-2 py-1 rounded-md ${
                            client.status === 'Quotas Atteints' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 
                            client.status === 'En production' ? 'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20' : 
                            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                          }`}>
                            {client.status === 'Quotas Atteints' ? <CheckCircle size={12}/> : client.status === 'Attente Rushs (Client)' ? <AlertTriangle size={12}/> : <Clock size={12}/>}
                            {client.status}
                          </span>
                        </td>

                        <td className="p-5 text-right">
                          <button className={`${theme.textMuted} hover:text-[#00E5FF] p-2 transition-colors`}>
                            <MoreVertical size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Paramètres <span className="text-[#00E5FF]">CM & Agence</span></h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Box 1 : Rappels Clients */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl transition-colors`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl">
                    <AlertTriangle size={24} />
                  </div>
                </div>
                <h3 className="font-black text-lg uppercase mb-2">Relance Matière Première (Rushs)</h3>
                <p className={`text-sm font-medium ${theme.textSub} mb-6`}>
                  Relancer automatiquement sur WhatsApp les clients qui n'ont pas envoyé leurs photos/vidéos brutes pour le montage.
                </p>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Auto-Relance (J+5)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className={`w-11 h-6 ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500`}></div>
                  </label>
                </div>
              </div>

              {/* Box 2 : CM Freelance */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl transition-colors`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-[#00E5FF]/10 text-[#00E5FF] rounded-xl">
                    <Users size={24} />
                  </div>
                </div>
                <h3 className="font-black text-lg uppercase mb-2">Accès CM Freelance</h3>
                <p className={`text-sm font-medium ${theme.textSub} mb-6`}>
                  Permet au Community Manager de se connecter pour cocher les tâches réalisées sans voir vos données financières.
                </p>
                <button className="w-full bg-transparent border-2 border-[#00E5FF] text-[#00E5FF] py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#00E5FF] hover:text-black transition-colors">
                  Générer accès Freelance
                </button>
              </div>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}
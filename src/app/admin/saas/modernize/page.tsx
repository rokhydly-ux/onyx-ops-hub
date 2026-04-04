"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Database, Settings, ShieldCheck, 
  Search, Filter, Users, Server, CheckCircle, 
  Clock, MoreVertical, Activity, Briefcase, 
  Sun, Moon, X
} from 'lucide-react';

// Mock Data pour les chantiers Onyx Modernize
const MOCK_MODERNIZE_CLIENTS = [
  { id: 1, company: "Central Equipements", contact: "77 000 11 22", revenue: 500000, migrationProgress: 80, stage: "Migration Odoo", status: "En cours" },
  { id: 2, company: "Boutique Chez Fatou", contact: "76 123 45 67", revenue: 300000, migrationProgress: 100, stage: "Formation Équipe", status: "Phase Finale" },
  { id: 3, company: "Groupe Immobilier SN", contact: "78 999 00 11", revenue: 750000, migrationProgress: 10, stage: "Audit Initial", status: "Démarrage" },
  { id: 4, company: "Resto La Fourchette", contact: "77 444 55 66", revenue: 350000, migrationProgress: 100, stage: "Terminé", status: "Déployé" },
];

export default function OnyxModernizeAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'deployments' | 'settings'>('deployments');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [editingClient, setEditingClient] = useState<any>(null);

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
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans selection:bg-[#00E5FF] selection:text-black pb-20 transition-colors duration-500`}>
      
      {/* HEADER NAVBAR */}
      <header className={`${theme.headerBg} backdrop-blur-md border-b ${theme.headerBorder} sticky top-0 z-50 transition-colors duration-500`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/admin')} 
              className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#00E5FF]/10 border border-[#00E5FF]/30 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.2)]">
                <Briefcase size={20} className="text-[#00E5FF]" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tighter uppercase flex items-center gap-2">
                  Onyx <span className="text-[#00E5FF]">Modernize</span>
                </h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Intégration VIP & Migration</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDark(!isDark)} 
              className={`p-2 rounded-full transition-colors ${isDark ? 'bg-zinc-800 hover:bg-zinc-700 text-yellow-400' : 'bg-zinc-200 hover:bg-zinc-300 text-zinc-700'}`}
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className={`flex p-1 rounded-xl hidden sm:flex ${isDark ? 'bg-zinc-900' : 'bg-zinc-200'}`}>
              <button 
                onClick={() => setActiveTab('deployments')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'deployments' ? 'bg-black text-[#00E5FF] shadow-md' : `${theme.textMuted} hover:${theme.text}`}`}
              >
                Chantiers en cours
              </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-black text-[#00E5FF] shadow-md' : `${theme.textMuted} hover:${theme.text}`}`}
            >
              Protocoles Setup
            </button>
          </div>
        </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* STATS DE DÉPLOIEMENT */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div onClick={() => alert("Détails chantiers à venir...")} className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg cursor-pointer hover:scale-105 transition-transform`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Activity size={20} className="text-blue-500"/></div>
              <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2 py-1 rounded-full">En cours</span>
            </div>
            <p className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mb-1`}>Chantiers Actifs</p>
            <p className="text-3xl font-black">3</p>
          </div>
          
          <div onClick={() => alert("Stats de migration à venir...")} className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg cursor-pointer hover:scale-105 transition-transform`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg"><Database size={20} className="text-purple-500"/></div>
            </div>
            <p className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mb-1`}>Données Migrées</p>
            <p className="text-3xl font-black">450k+</p>
          </div>

          <div onClick={() => alert("Détails délais à venir...")} className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg cursor-pointer hover:scale-105 transition-transform`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#39FF14]/10 rounded-lg"><CheckCircle size={20} className="text-[#39FF14]"/></div>
            </div>
            <p className={`text-[10px] font-black ${theme.textMuted} uppercase tracking-widest mb-1`}>Délai Moyen</p>
            <p className="text-3xl font-black text-[#39FF14]">8 Jours</p>
          </div>

          <div onClick={() => alert("Facturation Modernize à venir...")} className="bg-gradient-to-br from-blue-900 to-black border border-[#00E5FF]/30 text-white p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,229,255,0.15)] flex flex-col justify-center relative overflow-hidden group cursor-pointer hover:scale-105 transition-transform">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00E5FF]/20 blur-2xl rounded-full group-hover:scale-150 transition-transform"></div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2 relative z-10 text-[#00E5FF]">Revenu Intégration (Total)</p>
            <p className="text-3xl font-black tracking-tighter relative z-10">1.9M F</p>
            <button className="mt-4 w-full bg-[#00E5FF] text-black py-2 rounded-xl text-[10px] font-black uppercase hover:bg-white transition-colors relative z-10">
              Voir la facturation
            </button>
          </div>
        </div>

        {activeTab === 'deployments' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Suivi des <span className="text-[#00E5FF]">Déploiements</span></h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                  <input 
                    type="text" 
                    placeholder="Rechercher une entreprise..." 
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
                      <th className="p-5 whitespace-nowrap">Valeur Contrat</th>
                      <th className="p-5 whitespace-nowrap w-48">Migration Données</th>
                      <th className="p-5 whitespace-nowrap">Étape Actuelle</th>
                      <th className="p-5 whitespace-nowrap">Statut</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-200'}`}>
                    {MOCK_MODERNIZE_CLIENTS.map((client) => {
                      return (
                        <tr key={client.id} onClick={() => setEditingClient(client)} className={`${theme.hoverBg} transition-colors cursor-pointer group`}>
                          <td className="p-5">
                            <p className="font-black text-sm">{client.company}</p>
                            <p className={`text-[10px] font-bold ${theme.textSub}`}>{client.contact}</p>
                          </td>
                          <td className="p-5 text-sm font-bold text-[#00E5FF]">{client.revenue.toLocaleString()} F</td>
                          <td className="p-5">
                            <div className="flex flex-col gap-1 w-full">
                              <div className="flex justify-between items-center text-[10px] font-bold">
                                <span className={theme.textSub}>Progression</span>
                                <span className={client.migrationProgress === 100 ? 'text-[#39FF14]' : 'text-[#00E5FF]'}>
                                  {client.migrationProgress}%
                                </span>
                              </div>
                              <div className={`h-1.5 w-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} rounded-full overflow-hidden`}>
                                <div 
                                  className={`h-full rounded-full ${client.migrationProgress === 100 ? 'bg-[#39FF14]' : 'bg-[#00E5FF]'}`}
                                  style={{ width: `${client.migrationProgress}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="p-5">
                            <span className={`flex items-center gap-2 text-xs font-bold ${theme.textSub}`}>
                              {client.stage.includes('Odoo') ? <Database size={14} className="text-purple-400"/> : 
                               client.stage.includes('Formation') ? <Users size={14} className="text-blue-400"/> : 
                               client.stage.includes('Audit') ? <Search size={14} className="text-yellow-400"/> :
                               <CheckCircle size={14} className="text-[#39FF14]"/>}
                              {client.stage}
                            </span>
                          </td>
                          <td className="p-5">
                            <span className={`text-[10px] font-black uppercase flex items-center gap-1 w-max px-2 py-1 rounded-md ${
                              client.status === 'Déployé' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 
                              client.status === 'Démarrage' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                              'bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20'
                            }`}>
                              {client.status === 'Déployé' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                              {client.status}
                            </span>
                          </td>
                          <td className="p-5 text-right">
                            <button className={`${theme.textMuted} group-hover:text-[#00E5FF] p-2 transition-colors`}>
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
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Protocoles de <span className="text-[#00E5FF]">Setup</span></h2>
            
            <div className="space-y-6">
              {/* Settings Block 1 */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} p-8 rounded-3xl`}>
                <div className="flex items-center gap-3 mb-6">
                  <Database className="text-purple-400" size={24} />
                  <h3 className="font-black text-lg uppercase">Outils de Migration Standards</h3>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <label className={`text-[10px] font-black uppercase ${theme.textMuted} tracking-widest mb-2 block`}>Format d'export privilégié (Client)</label>
                    <select className={`w-full ${theme.inputBg} border ${theme.cardBorder} rounded-xl p-3 text-sm font-bold focus:border-[#00E5FF] outline-none cursor-pointer`}>
                      <option>CSV / Excel Structuré</option>
                      <option>Export direct API Odoo</option>
                      <option>Export Shopify JSON</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Générer logs de sécurité</p>
                      <p className={`text-xs ${theme.textMuted} mt-1`}>Trace chaque ligne de donnée transférée lors de la migration.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className={`w-11 h-6 ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00E5FF]`}></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Settings Block 2 */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} p-8 rounded-3xl`}>
                <div className="flex items-center gap-3 mb-6">
                  <ShieldCheck className="text-[#39FF14]" size={24} />
                  <h3 className="font-black text-lg uppercase">Formation & Accès</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className={`text-[10px] font-black uppercase ${theme.textMuted} tracking-widest mb-2 block`}>Heures de formation (Incluses)</label>
                    <input type="number" defaultValue="4" className={`w-full ${theme.inputBg} border ${theme.cardBorder} rounded-xl p-3 text-sm font-bold focus:border-[#39FF14] outline-none`} />
                  </div>
                  <div>
                    <label className={`text-[10px] font-black uppercase ${theme.textMuted} tracking-widest mb-2 block`}>Suivi post-déploiement (Jours)</label>
                    <input type="number" defaultValue="30" className={`w-full ${theme.inputBg} border ${theme.cardBorder} rounded-xl p-3 text-sm font-bold focus:border-[#39FF14] outline-none`} />
                  </div>
                </div>
                <div className={`mt-4 p-4 ${isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-zinc-100 border-zinc-200'} border rounded-xl`}>
                  <p className={`text-xs ${theme.textSub} font-bold`}>L'équipe d'intégration devra valider la signature électronique du client après la formation pour clôturer le chantier.</p>
                </div>
              </div>

              <button className="bg-[#00E5FF] text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-colors w-full shadow-[0_10px_30px_rgba(0,229,255,0.2)]">
                Mettre à jour les protocoles VIP
              </button>

            </div>
          </div>
        )}
      </main>

      {/* MODALE D'ÉDITION CHANTIER MODERNIZE */}
      {editingClient && (
          <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setEditingClient(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className={`${theme.cardBg} border ${theme.cardBorder} p-8 rounded-3xl w-full max-w-md shadow-2xl relative animate-in zoom-in-95`}>
               <button onClick={() => setEditingClient(null)} className={`absolute top-6 right-6 ${theme.textMuted} hover:${theme.text} transition-colors`}><X size={20}/></button>
               <h3 className="text-xl font-black uppercase mb-6">Chantier : {editingClient.company}</h3>
               <div className="space-y-4">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mettre à jour l'étape</p>
                  <select className={`w-full p-4 rounded-xl border ${theme.cardBorder} ${theme.inputBg} font-bold text-sm outline-none focus:border-[#00E5FF]`}>
                     <option>Audit Initial</option>
                     <option>Migration Odoo</option>
                     <option>Formation Équipe</option>
                     <option>Terminé</option>
                  </select>
                  <button onClick={() => { alert("L'étape du chantier a été mise à jour."); setEditingClient(null); }} className="w-full p-4 bg-[#00E5FF] text-black font-black uppercase text-xs rounded-xl hover:bg-white transition-colors shadow-lg mt-4">Enregistrer & Notifier le client</button>
               </div>
            </div>
          </div>
      )}
    </div>
  );
}
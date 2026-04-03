"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Users, MapPin, DollarSign, Search, 
  Filter, CheckCircle, Clock, MoreVertical, 
  Sun, Moon, ShieldAlert, Briefcase, FileText
} from 'lucide-react';

// Mock Data pour les clients utilisant Onyx Staff
const MOCK_STAFF_CLIENTS = [
  { id: 1, company: "Resto Dakar", contact: "77 123 45 67", staff_count: 12, plan: "Pack Tekki Pro", anomalies: 0, status: "Actif" },
  { id: 2, company: "Boutique Ndeye", contact: "76 987 65 43", staff_count: 3, plan: "Onyx Staff", anomalies: 1, status: "Actif" },
  { id: 3, company: "Agence Immo SN", contact: "78 555 44 33", staff_count: 8, plan: "Pack Onyx Gold", anomalies: 0, status: "En attente" },
  { id: 4, company: "Usine Textile", contact: "77 444 11 22", staff_count: 45, plan: "Pack Tekki Pro", anomalies: 12, status: "Alerte GPS" },
];

export default function OnyxStaffAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clients' | 'settings'>('clients');
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
    <div className={`min-h-screen ${theme.bg} ${theme.text} font-sans transition-colors duration-500 selection:bg-[#39FF14] selection:text-black pb-20`}>
      
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
              <div className="w-10 h-10 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-xl flex items-center justify-center">
                <Briefcase size={20} className="text-[#39FF14]" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tighter uppercase flex items-center gap-2">
                  Onyx <span className="text-[#39FF14]">Staff</span>
                </h1>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Gestion RH & Pointages</p>
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
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'clients' ? 'bg-black text-[#39FF14] shadow-md' : `${theme.textMuted} hover:${theme.text}`}`}
              >
                Entreprises
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-black text-[#39FF14] shadow-md' : `${theme.textMuted} hover:${theme.text}`}`}
              >
                Configuration
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
              <div className="p-2 bg-blue-500/10 rounded-lg"><Briefcase size={20} className="text-blue-500"/></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textMuted}`}>Entreprises Clientes</p>
            <p className="text-3xl font-black">214</p>
          </div>
          
          <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg transition-colors`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#39FF14]/10 rounded-lg"><Users size={20} className="text-[#39FF14]"/></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textMuted}`}>Employés Trackés</p>
            <p className="text-3xl font-black">1,840</p>
          </div>

          <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl shadow-lg transition-colors`}>
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg"><DollarSign size={20} className="text-purple-500"/></div>
            </div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${theme.textMuted}`}>Acomptes Gérés (Mois)</p>
            <p className="text-3xl font-black text-purple-500">12.5M F</p>
          </div>

          <div className="bg-[#39FF14] text-black p-6 rounded-3xl shadow-[0_10px_30px_rgba(57,255,20,0.15)] flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Revenu Module (MRR)</p>
            <p className="text-3xl font-black tracking-tighter">2.9M F</p>
            <button className="mt-4 w-full bg-black text-[#39FF14] py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform">
              Voir la croissance
            </button>
          </div>
        </div>

        {activeTab === 'clients' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Suivi des <span className="text-[#39FF14]">Employeurs</span></h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`} />
                  <input 
                    type="text" 
                    placeholder="Rechercher une entreprise..." 
                    className={`w-full ${theme.inputBg} border ${theme.cardBorder} rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[#39FF14] transition-colors`}
                  />
                </div>
                <button className={`p-2.5 ${theme.inputBg} border ${theme.cardBorder} rounded-xl hover:border-[#39FF14] transition-colors`}>
                  <Filter size={18} className={theme.textSub} />
                </button>
              </div>
            </div>

            <div className={`${theme.cardBg} border ${theme.cardBorder} rounded-3xl overflow-hidden shadow-2xl transition-colors`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={`${isDark ? 'bg-black/50' : 'bg-zinc-100'} border-b ${theme.cardBorder} text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>
                      <th className="p-5 whitespace-nowrap">Employeur / Entreprise</th>
                      <th className="p-5 whitespace-nowrap text-center">Effectif Actif</th>
                      <th className="p-5 whitespace-nowrap">Offre Souscrite</th>
                      <th className="p-5 whitespace-nowrap text-center">Anomalies GPS</th>
                      <th className="p-5 whitespace-nowrap">Statut Global</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-200'}`}>
                    {MOCK_STAFF_CLIENTS.map((client) => (
                      <tr key={client.id} className={`${theme.hoverBg} transition-colors`}>
                        <td className="p-5">
                          <p className="font-black text-sm">{client.company}</p>
                          <p className={`text-[10px] font-bold ${theme.textSub}`}>{client.contact}</p>
                        </td>
                        <td className="p-5 text-center">
                          <span className="font-black text-lg">{client.staff_count}</span>
                        </td>
                        <td className="p-5">
                          <span className={`px-3 py-1 rounded-md text-[10px] font-bold border ${isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-zinc-200 text-black border-zinc-300'}`}>
                            {client.plan}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <span className={`font-black px-2 py-1 rounded text-xs ${client.anomalies === 0 ? 'bg-[#39FF14]/10 text-[#39FF14]' : client.anomalies < 5 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'}`}>
                            {client.anomalies}
                          </span>
                        </td>
                        <td className="p-5">
                          <span className={`text-[10px] font-black uppercase flex items-center gap-1 w-max px-2 py-1 rounded-md ${
                            client.status === 'Actif' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 
                            client.status === 'Alerte GPS' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                            'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'
                          }`}>
                            {client.status === 'Actif' ? <CheckCircle size={12}/> : client.status === 'Alerte GPS' ? <ShieldAlert size={12}/> : <Clock size={12}/>}
                            {client.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button className={`${theme.textMuted} hover:text-[#39FF14] p-2 transition-colors`}>
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
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Paramètres <span className="text-[#39FF14]">RH & Staff</span></h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* Box 1 : Paramètres GPS */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl transition-colors`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                    <MapPin size={24} />
                  </div>
                </div>
                <h3 className="font-black text-lg uppercase mb-2">Tolérance Géolocalisation</h3>
                <p className={`text-sm font-medium ${theme.textSub} mb-6`}>
                  Définit le rayon en mètres autorisé autour de la boutique pour valider un pointage d'arrivée via WhatsApp.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className={`text-[10px] font-black uppercase ${theme.textMuted} tracking-widest mb-2 block`}>Rayon de pointage autorisé (mètres)</label>
                    <select className={`w-full ${theme.inputBg} border ${theme.cardBorder} rounded-xl p-3 text-sm font-bold focus:border-[#39FF14] outline-none cursor-pointer transition-colors`}>
                      <option value="10">Ultra-strict (10m - Boutique seule)</option>
                      <option value="50" selected>Standard (50m - Quartier proche)</option>
                      <option value="200">Flexible (200m - Livreurs en approche)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Box 2 : Génération PDF */}
              <div className={`${theme.cardBg} border ${theme.cardBorder} p-6 rounded-3xl transition-colors`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl">
                    <FileText size={24} />
                  </div>
                </div>
                <h3 className="font-black text-lg uppercase mb-2">Fiches de Paie Auto</h3>
                <p className={`text-sm font-medium ${theme.textSub} mb-6`}>
                  Activation de la génération automatique des fiches de paie PDF à la fin du mois, déduisant les acomptes/avances de Tabaski.
                </p>
                <div className="flex items-center justify-between mt-8">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${theme.textMuted}`}>Génération Auto (J-1)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className={`w-11 h-6 ${isDark ? 'bg-zinc-700' : 'bg-zinc-300'} peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#39FF14]`}></div>
                  </label>
                </div>
              </div>

            </div>

            <div className="mt-6">
               <button className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-colors w-full shadow-[0_10px_30px_rgba(57,255,20,0.2)]">
                Sauvegarder la configuration RH
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
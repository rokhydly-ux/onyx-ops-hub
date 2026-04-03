"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, Calendar, Users, DollarSign, TrendingUp, 
  Search, Filter, Settings, CheckCircle, Clock, MoreVertical, Bell
} from 'lucide-react';

// Mock Data pour les clients utilisant Onyx Booking
const MOCK_BOOKING_CLIENTS = [
  { id: 1, shop: "Salon Bellezza", contact: "77 123 45 67", plan: "Onyx Booking", end_date: "2026-05-15", bookings_month: 142, status: "Actif" },
  { id: 2, shop: "Cabinet Médical Dr. Sy", contact: "76 987 65 43", plan: "Pack Onyx CRM", end_date: "2026-04-10", bookings_month: 85, status: "Actif" },
  { id: 3, shop: "Barber Shop Dakar", contact: "78 555 44 33", plan: "Onyx Booking", end_date: "2026-04-01", bookings_month: 0, status: "En retard" },
  { id: 4, shop: "Spa Détente", contact: "77 444 11 22", plan: "Pack Onyx Gold", end_date: "2026-12-31", bookings_month: 310, status: "Actif" },
];

export default function OnyxBookingAdmin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'clients' | 'settings'>('clients');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#39FF14] selection:text-black pb-20">
      
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
              <div className="w-10 h-10 bg-[#39FF14]/10 border border-[#39FF14]/30 rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-[#39FF14]" />
              </div>
              <div>
                <h1 className="font-black text-xl tracking-tighter uppercase flex items-center gap-2">
                  Onyx <span className="text-[#39FF14]">Booking</span>
                  <span className="flex h-2 w-2 relative ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#39FF14]"></span>
                  </span>
                </h1>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Module de Réservation & Acomptes</p>
              </div>
            </div>
          </div>
          
          <div className="flex bg-zinc-900 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('clients')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'clients' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-white'}`}
            >
              Abonnés
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors ${activeTab === 'settings' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-white'}`}
            >
              Configuration
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* STATS RAPIDES */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg"><Users size={20} className="text-blue-500"/></div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Clients Actifs</p>
            <p className="text-3xl font-black">128</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-[#39FF14]/10 rounded-lg"><Calendar size={20} className="text-[#39FF14]"/></div>
              <span className="text-[10px] font-bold text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded-full">+12%</span>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Rdv ce mois</p>
            <p className="text-3xl font-black">3,450</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg"><DollarSign size={20} className="text-purple-500"/></div>
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Acomptes Sécurisés</p>
            <p className="text-3xl font-black text-purple-400">8.2M F</p>
          </div>

          <div className="bg-[#39FF14] text-black p-6 rounded-3xl shadow-[0_10px_30px_rgba(57,255,20,0.15)] flex flex-col justify-center">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-2">Revenu SaaS Mensuel</p>
            <p className="text-3xl font-black tracking-tighter">1.7M F</p>
            <button className="mt-4 w-full bg-black text-[#39FF14] py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform">
              Voir le rapport
            </button>
          </div>
        </div>

        {activeTab === 'clients' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
              <h2 className="text-2xl font-black uppercase tracking-tight">Liste des <span className="text-[#39FF14]">Abonnés</span></h2>
              <div className="flex gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input 
                    type="text" 
                    placeholder="Rechercher un salon..." 
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-[#39FF14] transition"
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
                      <th className="p-5">Entreprise</th>
                      <th className="p-5">Contact</th>
                      <th className="p-5">Offre Souscrite</th>
                      <th className="p-5 text-center">Rdv (Mois)</th>
                      <th className="p-5">Fin d'Abo</th>
                      <th className="p-5">Statut</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {MOCK_BOOKING_CLIENTS.map((client) => (
                      <tr key={client.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="p-5 font-black text-sm">{client.shop}</td>
                        <td className="p-5 text-sm font-bold text-zinc-400">{client.contact}</td>
                        <td className="p-5">
                          <span className="bg-zinc-800 text-white px-3 py-1 rounded-md text-[10px] font-bold border border-zinc-700">
                            {client.plan}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <span className={`font-black ${client.bookings_month > 100 ? 'text-[#39FF14]' : 'text-zinc-300'}`}>
                            {client.bookings_month}
                          </span>
                        </td>
                        <td className="p-5 text-sm font-bold text-zinc-400">{client.end_date}</td>
                        <td className="p-5">
                          <span className={`text-[10px] font-black uppercase flex items-center gap-1 w-max px-2 py-1 rounded-md ${client.status === 'Actif' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                            {client.status === 'Actif' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                            {client.status}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button className="text-zinc-500 hover:text-white p-2">
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
          <div className="animate-in fade-in slide-in-from-bottom-4 max-w-3xl">
            <h2 className="text-2xl font-black uppercase tracking-tight mb-6">Paramètres <span className="text-[#39FF14]">Globaux</span></h2>
            
            <div className="space-y-6">
              {/* Settings Block 1 */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <Bell className="text-[#39FF14]" size={24} />
                  <h3 className="font-black text-lg uppercase">Notifications & Rappels</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Rappels WhatsApp automatiques</p>
                      <p className="text-xs text-zinc-500 mt-1">Envoyer un rappel aux clients avant le rendez-vous.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#39FF14]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Délai du rappel automatique</label>
                    <select className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm font-bold focus:border-[#39FF14] outline-none">
                      <option>24 heures avant le Rdv</option>
                      <option>12 heures avant le Rdv</option>
                      <option>2 heures avant le Rdv</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Settings Block 2 */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="text-purple-500" size={24} />
                  <h3 className="font-black text-lg uppercase">Paiements & Acomptes</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-sm">Forcer l'acompte par défaut</p>
                      <p className="text-xs text-zinc-500 mt-1">Appliqué à tous les nouveaux clients Booking.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                    </label>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Taux d'acompte suggéré (%)</label>
                    <input type="number" defaultValue="50" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-sm font-bold focus:border-purple-500 outline-none" />
                  </div>
                </div>
              </div>

              <button className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-colors w-full shadow-[0_10px_30px_rgba(57,255,20,0.2)]">
                Enregistrer la configuration
              </button>

            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export {};
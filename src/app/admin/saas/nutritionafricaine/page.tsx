"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  ChevronLeft, Search, Users, HeartPulse, Sparkles,
  TrendingUp, Clock, MessageSquare, AlertTriangle, 
  RefreshCcw, Activity, Utensils
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const spaceGrotesk = { className: "font-sans" };

export default function AdminNutritionPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [calcStats, setCalcStats] = useState<any[]>([]);
  const [totalSimulations, setTotalSimulations] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchNutritionClients = async () => {
    setIsLoading(true);
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*, plan_type, trial_ends_at') // On récupère les nouvelles colonnes
        .is('tenant_id', null)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Filtrer pour ne garder que ceux qui ont OnyxNutrition
        const nutritionClients = data.filter(c => 
          c.saas === 'Nutrition à l\'Africaine' || 
          (c.active_saas && c.active_saas.includes('Nutrition à l\'Africaine'))
        );
        setClients(nutritionClients);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des clients Nutrition :", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchStats = async () => {
    const { data, error } = await supabase
      .from('leads')
      .select('message')
      .eq('source', 'Calculateur Calories')
      .eq('saas', "Nutrition à l'Africaine");

    if (data && !error) {
      setTotalSimulations(data.length);
      const counts: Record<string, number> = {};
      data.forEach(lead => {
        const dishMatch = lead.message?.match(/Plat simulé : (.*)/);
        if (dishMatch && dishMatch[1]) {
          const dishName = dishMatch[1].replace(' (Plat standard)', '');
          counts[dishName] = (counts[dishName] || 0) + 1;
        }
      });
      const chartData = Object.entries(counts).map(([name, count]) => ({ name, count }));
      setCalcStats(chartData.sort((a, b) => b.count - a.count));
    }
  };

  useEffect(() => {
    fetchNutritionClients();
    fetchStats();
  }, []);

  const handleUpgradeToPremium = async (clientId: string) => {
    if (!confirm("Voulez-vous vraiment faire passer ce client en Premium ? Cette action est irréversible.")) return;
    try {
      const { error } = await supabase
        .from('clients')
        .update({ plan_type: 'premium' })
        .eq('id', clientId);
      if (error) throw error;
      alert("Client mis à niveau avec succès !");
      fetchNutritionClients(); // Rafraîchir les données
    } catch (err: any) {
      alert("Erreur lors de la mise à niveau : " + err.message);
    }
  };

  const filteredClients = clients.filter(c => 
    (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone || '').includes(searchTerm)
  );

  // Calcul des KPIs
  const totalClients = clients.length;
  const mrr = totalClients * 2900;
  
  const today = new Date().getTime();
  const expiringSoonCount = clients.filter(c => {
     const expDateStr = c.saas_expiration_dates?.OnyxNutrition || c.saas_expiration_dates?.nutrition || c.expiration_date;
     if (!expDateStr) return false;
     const exp = new Date(expDateStr).getTime();
     const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
     return diffDays >= -5 && diffDays <= 5; // Expire dans les 5 jours ou expiré depuis 5 jours max
  }).length;

  const handleWaRelance = (client: any) => {
    const msg = `Bonjour ${client.full_name},\n\nIci votre conseiller OnyxNutrition ! Comment se passe votre programme de rééquilibrage alimentaire cette semaine ? 🥗`;
    window.open(`https://wa.me/${(client.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Non définie";
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-white font-sans p-6 md:p-12 transition-colors">
      {/* Header & Navigation */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/admin')}
            className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <ChevronLeft size={20} className="text-zinc-600 dark:text-zinc-300" />
          </button>
          <div>
            <h1 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black uppercase tracking-tighter flex items-center gap-3`}>
              <HeartPulse className="text-fuchsia-500" size={32} /> 
              Onyx<span className="text-fuchsia-500">Nutrition</span>
            </h1>
            <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Gestion des abonnements & Suivi des clients
            </p>
          </div>
        </div>
        
        <button onClick={fetchNutritionClients} className={`p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-sm hover:text-fuchsia-500 transition-colors ${isRefreshing ? 'animate-spin text-fuchsia-500' : 'text-zinc-400'}`}>
           <RefreshCcw size={20} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Abonnements Actifs</p>
              <Users size={18} className="text-zinc-400" />
            </div>
            <p className="text-4xl font-black text-black dark:text-white">{totalClients}</p>
          </div>
          
          <div className="bg-fuchsia-500/10 border border-fuchsia-500/30 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-fuchsia-600 dark:text-fuchsia-400">MRR OnyxNutrition</p>
              <TrendingUp size={18} className="text-fuchsia-500" />
            </div>
            <p className="text-4xl font-black text-fuchsia-600 dark:text-fuchsia-400">{mrr.toLocaleString('fr-FR')} F</p>
          </div>

          <div className={`${expiringSoonCount > 0 ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'} border p-6 rounded-3xl shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <p className={`text-[10px] font-black uppercase tracking-widest ${expiringSoonCount > 0 ? 'text-red-500' : 'text-zinc-400'}`}>À Renouveler (J±5)</p>
              <AlertTriangle size={18} className={expiringSoonCount > 0 ? 'text-red-500' : 'text-zinc-400'} />
            </div>
            <p className={`text-4xl font-black ${expiringSoonCount > 0 ? 'text-red-600 dark:text-red-400' : 'text-black dark:text-white'}`}>{expiringSoonCount}</p>
          </div>
        </div>

        {/* Statistiques des simulations de plats */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-fuchsia-500/10 rounded-xl text-fuchsia-500"><Utensils size={24} /></div>
              <div>
                <h3 className="font-black uppercase text-xl text-black dark:text-white">Simulations de Plats (Calculateur)</h3>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{totalSimulations} prospects générés</p>
              </div>
            </div>
          </div>
          
          {calcStats.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calcStats} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => value.substring(0, 15)} />
                  <YAxis stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: 'rgba(217, 70, 239, 0.05)' }} contentStyle={{ borderRadius: '1rem', backgroundColor: '#18181b', border: '1px solid #27272a', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="count" fill="#d946ef" radius={[8, 8, 0, 0]}>
                    {calcStats.map((entry, index) => <Cell key={`cell-${index}`} fill={index === 0 ? '#d946ef' : '#e879f9'} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 w-full flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl"><p className="text-zinc-500 font-bold text-sm">Aucune simulation enregistrée pour le moment.</p></div>
          )}
        </div>

        {/* Barre de recherche */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex items-center shadow-sm">
          <Search className="text-zinc-400 mx-4" size={20} />
          <input 
            type="text" 
            placeholder="Rechercher un client (Nom, Téléphone)..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm font-bold text-black dark:text-white placeholder:text-zinc-400"
          />
        </div>

        {/* Grille des Clients */}
        {isLoading ? (
           <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuchsia-500"></div></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => {
              const expDate = client.trial_ends_at || client.saas_expiration_dates?.OnyxNutrition || client.saas_expiration_dates?.nutrition || client.expiration_date;
              const isPremium = client.plan_type === 'premium';
              
              return (
                <div key={client.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm hover:border-fuchsia-500 dark:hover:border-fuchsia-500 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <h3 className="font-black text-lg uppercase leading-tight truncate">{client.full_name}</h3>
                        <p className="text-sm font-bold text-zinc-500 mt-1">{client.phone}</p>
                     </div>
                     <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${isPremium ? 'bg-fuchsia-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>
                       {client.plan_type || 'TRIAL'}
                     </span>
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700 flex items-center justify-between mb-6">
                     <span className="text-[10px] font-black uppercase text-zinc-500 flex items-center gap-1.5"><Clock size={12}/> Fin du mois</span>
                     <span className="text-xs font-black text-black dark:text-white">{formatDate(expDate)}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleWaRelance(client)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white hover:bg-black hover:text-fuchsia-500 dark:hover:bg-white dark:hover:text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                       <MessageSquare size={16} /> Relancer
                    </button>
                    {!isPremium && (
                      <button onClick={() => handleUpgradeToPremium(client.id)} className="flex-1 bg-fuchsia-500 text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2 hover:bg-fuchsia-600 shadow-lg shadow-fuchsia-500/20">
                         <Sparkles size={16} /> Premium
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {filteredClients.length === 0 && <div className="col-span-full py-12 text-center text-zinc-500 font-bold">Aucun client trouvé pour OnyxNutrition.</div>}
          </div>
        )}
      </div>
    </div>
  );
}
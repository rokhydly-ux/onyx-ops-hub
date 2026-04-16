"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Target, TrendingUp, Users, DollarSign, Loader2, ArrowLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useRouter } from 'next/navigation';

export default function CommercialPerformances() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [performances, setPerformances] = useState<any[]>([]);
  const [totals, setTotals] = useState({ ca: 0, sales: 0, leads: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // 1. Récupérer tous les commerciaux actifs
        const { data: commercials } = await supabase
          .from('commercials')
          .select('*')
          .eq('status', 'Actif');

        if (!commercials) return;

        // 2. Récupérer tous les leads et clients
        const { data: allLeads } = await supabase.from('crm_leads').select('assigned_to, status, amount, budget');
        
        let totalCA = 0;
        let totalSales = 0;
        let totalLeads = 0;

        // 3. Calculer les statistiques par commercial
        const stats = commercials.map(comm => {
          const commLeads = (allLeads || []).filter(l => l.assigned_to === comm.full_name);
          const wonLeads = commLeads.filter(l => ['Gagné', 'Converti'].includes(l.status || ''));
          
          const ca = wonLeads.reduce((acc, curr) => acc + Number(curr.amount || curr.budget || 0), 0);
          const salesCount = wonLeads.length;
          const leadsCount = commLeads.length;
          const conversionRate = leadsCount > 0 ? ((salesCount / leadsCount) * 100).toFixed(1) : 0;

          totalCA += ca;
          totalSales += salesCount;
          totalLeads += leadsCount;

          return {
            id: comm.id,
            name: comm.full_name,
            objective: comm.objective || 20,
            leadsAssigned: leadsCount,
            sales: salesCount,
            ca: ca,
            conversionRate: Number(conversionRate)
          };
        });

        // Trier par Chiffre d'Affaires décroissant
        stats.sort((a, b) => b.ca - a.ca);

        setPerformances(stats);
        setTotals({ ca: totalCA, sales: totalSales, leads: totalLeads });
      } catch (err) {
        console.error("Erreur de récupération des statistiques :", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-black"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] p-6 lg:p-12 font-sans text-black dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        {/* EN-TÊTE */}
        <div className="flex items-center gap-6">
          <button onClick={() => router.back()} className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Performances <span className="text-[#39FF14]">Commerciales</span></h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Classement et Statistiques de l'équipe</p>
          </div>
        </div>

        {/* KPI GLOBAUX */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-black text-[#39FF14] rounded-xl"><DollarSign size={24}/></div><p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">CA Global Généré</p></div>
            <p className="text-4xl font-black text-black dark:text-white tracking-tighter">{totals.ca.toLocaleString('fr-FR')} F</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-black text-[#39FF14] rounded-xl"><Target size={24}/></div><p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Total Ventes Conclues</p></div>
            <p className="text-4xl font-black text-black dark:text-white tracking-tighter">{totals.sales}</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-black text-[#39FF14] rounded-xl"><Users size={24}/></div><p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Leads Traités</p></div>
            <p className="text-4xl font-black text-black dark:text-white tracking-tighter">{totals.leads}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* GRAPHIQUE DES VENTES */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
            <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-3"><TrendingUp className="text-[#39FF14]"/> Ventes par Commercial</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performances} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#18181b', borderRadius: '1rem', border: 'none', color: '#fff' }} />
                  <Bar dataKey="sales" name="Ventes Conclues" fill="#39FF14" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CLASSEMENT (LEADERBOARD) */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-8 rounded-3xl shadow-sm">
            <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-3"><Trophy className="text-yellow-400"/> Classement (Leaderboard)</h3>
            <div className="space-y-4">
              {performances.map((perf, index) => (
                <div key={perf.id} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg ${index === 0 ? 'bg-yellow-400 text-black shadow-[0_0_15px_rgba(250,204,21,0.4)]' : index === 1 ? 'bg-zinc-300 text-black' : index === 2 ? 'bg-orange-400 text-black' : 'bg-black text-white'}`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-black uppercase text-sm text-black dark:text-white">{perf.name}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Taux Conv: {perf.conversionRate}%</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg text-[#39FF14]">{perf.ca.toLocaleString('fr-FR')} F</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{perf.sales} / {perf.objective} Objectif</p>
                  </div>
                </div>
              ))}
              {performances.length === 0 && <p className="text-center text-zinc-500 italic text-sm py-8">Aucune donnée disponible.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Trophy, Target, TrendingUp, Users, DollarSign, Loader2, ArrowLeft, Download, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from 'next/navigation';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';

export default function CRMCommercialPerformances() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [performances, setPerformances] = useState<any[]>([]);
  const [totals, setTotals] = useState({ ca: 0, sales: 0, leads: 0 });
  const [dateFilter, setDateFilter] = useState('this_month');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // 1. Récupération de la session pour obtenir le Tenant ID de l'entreprise
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/login');
          return;
        }
        const tenantId = session.user.user_metadata?.tenant_id || session.user.id;

        // NOUVEAU: Calcul de la date de début en fonction du filtre
        const now = new Date();
        let startDate = new Date(0); // Par défaut, "Tout le temps"
        if (dateFilter === 'this_month') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        } else if (dateFilter === 'this_quarter') {
            const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
            startDate = new Date(now.getFullYear(), quarterStartMonth, 1);
        }

        // 2. Récupérer uniquement les commerciaux de CETTE entreprise
        const { data: commercials } = await supabase
          .from('commercials')
          .select('*')
          .eq('tenant_id', tenantId)
          .eq('status', 'Actif');

        if (!commercials) {
            setIsLoading(false);
            return;
        }

        // 3. Récupérer uniquement les leads de CETTE entreprise ET de la période sélectionnée
        let leadsQuery = supabase
          .from('crm_leads')
          .select('assigned_to, status, amount, budget, created_at')
          .eq('tenant_id', tenantId);

        if (dateFilter !== 'all_time') {
            leadsQuery = leadsQuery.gte('created_at', startDate.toISOString());
        }
        const { data: allLeads } = await leadsQuery;
        
        let totalCA = 0;
        let totalSales = 0;
        let totalLeads = 0;

        // 4. Calculer les statistiques par commercial
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
  }, [router, dateFilter]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const filterLabel = dateFilter === 'this_month' ? 'Ce Mois' : dateFilter === 'this_quarter' ? 'Ce Trimestre' : 'Global';
    doc.setFontSize(18);
    doc.text(`Rapport de Performances - ${filterLabel}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    const tableColumn = ["Classement", "Commercial", "Leads Assignés", "Ventes", "Taux Conv. (%)", "Chiffre d'Affaires (F)"];
    const tableRows: any[] = [];

    performances.forEach((perf, index) => {
      const perfData = [
        index + 1,
        perf.name,
        perf.leadsAssigned,
        perf.sales,
        perf.conversionRate,
        perf.ca.toLocaleString('fr-FR')
      ];
      tableRows.push(perfData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
    });
    
    doc.save(`Rapport_Performances_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportCSV = () => {
    if (performances.length === 0) return alert("Aucune donnée à exporter.");
    const csv = Papa.unparse(performances);
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performances_commerciaux_${dateFilter}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="h-screen flex items-center justify-center bg-[#fafafa] dark:bg-[#050505]"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] p-6 lg:p-12 font-sans text-black dark:text-white">
      <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
        
        {/* EN-TÊTE */}
        <div className="flex items-center gap-6">
          <button onClick={() => router.push('/crm')} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors shadow-sm">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter">Performances <span className="text-[#39FF14]">Équipe</span></h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Vos commerciaux et résultats</p>
          </div>
        </div>

        {/* FILTRES ET EXPORTS */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl">
                <button onClick={() => setDateFilter('this_month')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition ${dateFilter === 'this_month' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Ce Mois</button>
                <button onClick={() => setDateFilter('this_quarter')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition ${dateFilter === 'this_quarter' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Ce Trimestre</button>
                <button onClick={() => setDateFilter('all_time')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition ${dateFilter === 'all_time' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Tout le temps</button>
            </div>
            <div className="flex items-center gap-3">
                <button onClick={handleExportCSV} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#39FF14] hover:text-[#39FF14] transition-colors shadow-sm">
                    <Download size={16}/> Exporter CSV
                </button>
                <button onClick={handleExportPDF} className="flex items-center gap-2 bg-black text-[#39FF14] px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-xl border border-[#39FF14]/30">
                    <FileText size={16} /> Rapport PDF
                </button>
            </div>
        </div>

        {/* KPI GLOBAUX */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-black text-[#39FF14] rounded-xl"><DollarSign size={24}/></div><p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">CA Équipe Généré</p></div>
            <p className="text-4xl font-black tracking-tighter text-[#39FF14]">{totals.ca.toLocaleString('fr-FR')} F</p>
          </div>
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-black text-[#39FF14] rounded-xl"><Target size={24}/></div><p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Ventes Conclues</p></div>
            <p className="text-4xl font-black tracking-tighter">{totals.sales}</p>
          </div>
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 rounded-3xl shadow-sm">
            <div className="flex items-center gap-4 mb-4"><div className="p-3 bg-black text-[#39FF14] rounded-xl"><Users size={24}/></div><p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Leads Assignés</p></div>
            <p className="text-4xl font-black tracking-tighter">{totals.leads}</p>
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
            <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-3"><Trophy className="text-yellow-400"/> Classement Équipe</h3>
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
              {performances.length === 0 && <p className="text-center text-zinc-500 italic text-sm py-8">Aucun commercial trouvé dans votre équipe.</p>}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Users, TrendingUp, Wallet, Zap, UserPlus, Calendar as CalendarIcon, Clock, Target, X, PieChart as PieChartIcon, Activity as ActivityIcon, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function CRMDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [session, setSession] = useState<any>({});
  
  const [realKpis, setRealKpis] = useState({ newLeads: 0, conversionRate: "0%", potentialCA: 0 });
  const [realPerformers, setRealPerformers] = useState<any[]>([]);
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [dateRange, setDateRange] = useState({ label: 'Ce Mois', start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(), end: new Date().toISOString() });
  const [campaignsData, setCampaignsData] = useState<any[]>([]);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [analysisCampaign, setAnalysisCampaign] = useState("Toutes");
  const [analysisPeriod, setAnalysisPeriod] = useState("30j");

  useEffect(() => {
    let mounted = true;

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, sessionAuth) => {
      let currentUser = sessionAuth?.user;
      
      if (!currentUser && mounted) {
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
            try {
                const parsed = JSON.parse(customSession);
                if (parsed.phone) {
                    const authEmail = `${parsed.phone}@clients.onyxcrm.com`;
                    const authPassword = parsed.password_temp || "central2026";
                    await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
                    return; // L'événement sera relancé par le succès du signIn
                }
            } catch(e) {}
        }
      }

      if (!currentUser && mounted) {
          router.replace('/login');
          return;
      }

      if (currentUser && mounted) {
          const role = currentUser.user_metadata?.role || 'admin';
          const tenantId = currentUser.user_metadata?.tenant_id || currentUser.id;
          setSession({ id: tenantId, role: role, full_name: currentUser.user_metadata?.full_name });
          setIsAuthorized(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session: initSession } }) => {
       if (!initSession && mounted && !localStorage.getItem('onyx_custom_session')) {
          router.replace('/login');
       }
    });

    return () => {
       mounted = false;
       authListener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const fetchRealData = async () => {
      if (!session?.id) return;

      let query = supabase
        .from('crm_leads')
        .select('*')
        .eq('tenant_id', session.id);
        
      if (session.role === 'commercial') {
          query = query.eq('assigned_to', session.full_name);
      }

      const { data: leads } = await query.order('created_at', { ascending: false });
      const safeLeads = [...(leads || [])].sort((a,b) => {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
      });
      setAllLeads(safeLeads);

      // Récupération des 5 prochains RDV de l'Agenda
      let apptQuery = supabase
        .from('booking_appointments')
        .select('*')
        .eq('tenant_id', session.id)
        .gte('date_time', new Date(new Date().setHours(0,0,0,0)).toISOString());
        
      if (session.role === 'commercial') {
         // Filtrer l'agenda du commercial si nécessaire
      }
      const { data: appts } = await apptQuery.order('date_time', { ascending: true }).limit(5);
      if (appts) setAppointments(appts || []);
    };

    if (isAuthorized) fetchRealData();
  }, [isAuthorized, session]);

  useEffect(() => {
      if (allLeads.length === 0) return;

      // Application du Filtre Temporel
      const filteredLeads = allLeads.filter((l: any) => {
          if (!dateRange.start || !dateRange.end) return true;
          const d = new Date(l.created_at);
          const start = new Date(dateRange.start); start.setHours(0,0,0,0);
          const end = new Date(dateRange.end); end.setHours(23,59,59,999);
          return d >= start && d <= end;
      });

      const wonLeads = filteredLeads.filter((l: any) => l.status === 'Gagné' || l.status === 'Converti').length;
      const convRate = filteredLeads.length > 0 ? Math.round((wonLeads / filteredLeads.length) * 100) : 0;

      const caPotentiel = filteredLeads
        .filter((l: any) => !['Gagné', 'Converti', 'Perdu'].includes(l.status))
        .reduce((acc: number, l: any) => acc + (Number(l.budget || l.amount || 0)), 0);

      setRealKpis({ newLeads: filteredLeads.length, conversionRate: `${convRate}%`, potentialCA: caPotentiel });

      const perfMap: Record<string, number> = {};
      filteredLeads.forEach((l: any) => {
        if (l.assigned_to) {
          perfMap[l.assigned_to] = (perfMap[l.assigned_to] || 0) + 1;
        }
      });
      const perfArr = Object.entries(perfMap)
        .map(([name, count], i) => ({
          id: i, name, leads: count,
          color: i % 3 === 0 ? "text-[#39FF14]" : i % 3 === 1 ? "text-blue-500" : "text-purple-500",
          dot: i % 3 === 0 ? "bg-[#39FF14]" : i % 3 === 1 ? "bg-blue-500" : "bg-purple-500"
        }))
        .sort((a, b) => b.leads - a.leads)
        .slice(0, 5);
      setRealPerformers(perfArr);

      const recent = filteredLeads.slice(0, 5);
      setRealActivities(recent.map((l: any) => ({
        id: l.id,
        text: `Nouveau lead : ${l.full_name} (${l.intent || 'Contact'})`,
        time: new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        icon: Zap, iconBg: "bg-yellow-500/10", iconColor: "text-yellow-500"
      })));

      // --- CALCUL DU GRAPHIQUE DE CONVERSION (6 Derniers Mois) ---
      const monthsNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const conversionMap = new Map();
      for (let i = 5; i >= 0; i--) {
         const d = new Date(); d.setMonth(d.getMonth() - i);
         conversionMap.set(`${d.getFullYear()}-${d.getMonth()}`, { name: monthsNames[d.getMonth()], total: 0, gagne: 0 });
      }
      filteredLeads.forEach((l: any) => {
         const d = new Date(l.created_at);
         const key = `${d.getFullYear()}-${d.getMonth()}`;
         if (conversionMap.has(key)) {
            conversionMap.get(key).total += 1;
            if (l.status === 'Gagné' || l.status === 'Converti') conversionMap.get(key).gagne += 1;
         }
      });
      setConversionData(Array.from(conversionMap.values()));
      
      // --- TABLEAU ROI DES CAMPAGNES ---
      const campaignStats = filteredLeads.reduce((acc: any, l: any) => {
          // Groupement STRICT par campaign_name
          const rawName = l.campaign_name || 'Organique';
          const cName = String(rawName).trim().toUpperCase();
          
          if (!acc[cName]) {
              acc[cName] = { name: String(rawName).trim(), total: 0, enCours: 0, converted: 0, lost: 0, pipeline: 0, ca: 0 };
          }
          
          const stats = acc[cName];
          stats.total += 1;
          const budget = Number(l.budget || l.amount || 0);
          
          const status = l.status || 'Nouveau Lead';
          const isWon = ['Gagné', 'Signé', 'Converti', 'Clôturé avec succès'].includes(status);
          const isLost = ['Perdu', 'Abandonné'].includes(status);
          
          if (isWon) {
              stats.converted += 1;
              stats.ca += budget;
          } else if (isLost) {
              stats.lost += 1;
          } else {
              stats.enCours += 1;
              stats.pipeline += budget;
          }
          
          return acc;
      }, {});
      setCampaignsData(Object.values(campaignStats).sort((a: any, b: any) => b.ca - a.ca));
  }, [allLeads, dateRange]);

  if (!isAuthorized) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const handleExportPerformancesPDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Rapport de Conversion & Performances", 14, 22);
    doc.setFontSize(11);
    doc.text(`Période : ${dateRange.label}`, 14, 30);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 36);

    // Section 1: Top Performers (Commerciaux)
    doc.setFontSize(14);
    doc.text("Performances des Commerciaux (Leads Actifs)", 14, 48);
    
    const performersData = realPerformers.map(p => [p.name, p.leads.toString()]);
    autoTable(doc, {
      startY: 54,
      head: [["Commercial", "Leads Actifs Gérés"]],
      body: performersData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
    });

    // Section 2: Performances par Campagne
    const finalY1 = (doc as any).lastAutoTable.finalY || 54;
    doc.setFontSize(14);
    doc.text("Performances par Campagne", 14, finalY1 + 15);

    const campaignsExportData = campaignsData.map(c => [
      c.name,
      c.total.toString(),
      c.enCours.toString(),
      c.lost.toString(),
      c.converted.toString(),
      c.total > 0 ? ((c.converted / c.total) * 100).toFixed(1) + '%' : '0%',
      c.ca.toLocaleString('fr-FR') + ' F'
    ]);

    autoTable(doc, {
      startY: finalY1 + 21,
      head: [["Campagne", "Total Leads", "En Cours", "Perdus", "Gagnés", "Taux Conv.", "CA Généré"]],
      body: campaignsExportData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
    });

    // Section 3: Objectifs et Réalisations des Commerciaux
    const finalY2 = (doc as any).lastAutoTable.finalY || finalY1 + 21;
    doc.setFontSize(14);
    doc.text("Objectifs et Réalisations des Commerciaux", 14, finalY2 + 15);

    const { data: team } = await supabase.from('commercials').select('*').eq('tenant_id', session.id);
    
    const objectivesData = (team || []).map((c: any) => {
       const commLeads = allLeads.filter((l: any) => l.assigned_to === c.full_name && (l.status === 'Gagné' || l.status === 'Converti' || l.is_client));
       const realizedSales = commLeads.length;
       const realizedCA = commLeads.reduce((sum: number, l: any) => sum + Number(l.amount || l.budget || 0), 0);

       return [
          c.full_name,
          `${c.objective || 0} ventes / ${c.objective_period || 'Mois'}`,
          realizedSales.toString(),
          `${realizedCA.toLocaleString('fr-FR')} F`
       ];
    });

    if (objectivesData.length === 0) objectivesData.push(["Aucun commercial", "-", "-", "-"]);

    autoTable(doc, {
      startY: finalY2 + 21,
      head: [["Commercial", "Objectif (Ventes)", "Ventes Conclues", "CA Généré"]],
      body: objectivesData,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
    });

    doc.save(`Rapport_Performances_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportCampaignsCSV = () => {
    if (campaignsData.length === 0) return alert("Aucune donnée de campagne à exporter.");
    
    const headers = ['Nom de la Campagne', 'Total Leads', 'En Cours', 'Perdus', 'Gagnés (Convertis)', 'Taux Conv. (%)', 'CA Généré (FCFA)'];
    const csvRows = campaignsData.map(c => [
      `"${c.name}"`,
      c.total,
      c.enCours,
      c.lost,
      c.converted,
      c.total > 0 ? ((c.converted / c.total) * 100).toFixed(1) : '0',
      c.ca
    ].join(','));
    
    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Performances_Campagnes_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const kpis = [
    { title: "Total Leads (Période)", value: realKpis.newLeads.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Taux de Conversion", value: realKpis.conversionRate, icon: TrendingUp, color: "text-[#39FF14]", bg: "bg-[#39FF14]/10", valueColor: "text-[#39FF14]" },
    { title: "CA Potentiel Pipeline", value: `${realKpis.potentialCA.toLocaleString('fr-FR')} F`, icon: Wallet, color: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Tableau de Bord</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Aperçu de vos performances</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            {/* Filtre Temporel Global */}
            <select 
                value={dateRange.label} 
                onChange={(e) => {
                    const val = e.target.value;
                    const today = new Date();
                    if (val === 'Tout le temps') setDateRange({ label: val, start: '', end: '' });
                    else if (val === "Aujourd'hui") setDateRange({ label: val, start: today.toISOString(), end: today.toISOString() });
                    else if (val === 'Cette Semaine') {
                        const start = new Date(today); start.setDate(today.getDate() - today.getDay() + 1);
                        setDateRange({ label: val, start: start.toISOString(), end: today.toISOString() });
                    }
                    else if (val === 'Ce Mois') {
                        const start = new Date(today.getFullYear(), today.getMonth(), 1);
                        setDateRange({ label: val, start: start.toISOString(), end: today.toISOString() });
                    }
                    else if (val === 'Ce Trimestre') {
                        const start = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                        setDateRange({ label: val, start: start.toISOString(), end: today.toISOString() });
                    }
                }}
                className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white px-4 py-3 rounded-xl text-xs font-bold outline-none cursor-pointer focus:border-[#39FF14]"
            >
                <option value="Tout le temps">Tout le temps</option>
                <option value="Aujourd'hui">Aujourd'hui</option>
                <option value="Cette Semaine">Cette Semaine</option>
                <option value="Ce Mois">Ce Mois</option>
                <option value="Ce Trimestre">Ce Trimestre</option>
            </select>
            {session?.role !== 'commercial' && (
              <>
                <button onClick={handleExportPerformancesPDF} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-black dark:text-white px-4 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-sm hover:border-[#39FF14] dark:hover:border-[#39FF14] transition-all flex items-center gap-2 shrink-0">
                   <Download size={16} /> Rapport PDF
                </button>
                <button onClick={() => router.push('/crm/settings?tab=team')} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black hover:text-[#39FF14] transition-all flex items-center gap-2 shrink-0">
                   <UserPlus size={16} /> Ajouter membre équipe
                </button>
              </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {kpis.map((kpi, index) => (
          <div key={index} className="bg-white dark:bg-zinc-950 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-[#39FF14] transition-colors group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{kpi.title}</p>
              <p className={`text-3xl font-black tracking-tighter ${kpi.valueColor || 'text-black dark:text-white'}`}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={`grid grid-cols-1 md:grid-cols-2 ${session?.role !== 'commercial' ? 'lg:grid-cols-3' : ''} gap-8`}>
        {session?.role !== 'commercial' && (
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
             <h3 className="font-black uppercase text-lg mb-6 text-black dark:text-white">Top Performers (Leads gérés)</h3>
             <div className="space-y-4">
               {realPerformers.length > 0 ? realPerformers.map(rep => (
                  <div key={rep.id} className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                     <div className="flex items-center gap-3">
                        <span className={`w-3 h-3 rounded-full ${rep.dot} shadow-sm`}></span>
                        <span className="font-bold text-sm uppercase text-black dark:text-white">{rep.name}</span>
                     </div>
                     <div className="text-right">
                        <p className="font-black text-lg text-black dark:text-white">{rep.leads}</p>
                        <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Leads Actifs</p>
                     </div>
                  </div>
               )) : <p className="text-zinc-500 text-sm font-medium italic">Aucun lead assigné pour le moment.</p>}
             </div>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase text-lg text-black dark:text-white flex items-center gap-2"><CalendarIcon size={20} className="text-[#39FF14]"/> Agenda Global</h3>
              <button onClick={() => router.push('/crm/booking')} className="text-[10px] font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white transition bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">Voir tout le mois</button>
           </div>
           <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {appointments.length > 0 ? appointments.map(appt => (
                  <div key={appt.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-1 flex items-center gap-1.5">
                          <Clock size={12}/> {new Date(appt.date_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {new Date(appt.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="font-bold text-sm text-black dark:text-white uppercase">{appt.title}</p>
                      <p className="text-xs text-zinc-500 mt-1">Avec : <span className="font-bold text-black dark:text-zinc-300">{appt.lead_name}</span></p>
                  </div>
              )) : <p className="text-zinc-500 text-sm font-medium italic">Aucun RDV prévu prochainement.</p>}
           </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm">
           <h3 className="font-black uppercase text-lg mb-6 text-black dark:text-white">Flux d'Activité</h3>
           <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800/60 ml-4 md:ml-6 space-y-8 pb-4 z-10 flex-1 overflow-y-auto custom-scrollbar pr-4">
              {realActivities.length > 0 ? realActivities.map((act) => (
                 <div key={act.id} className="relative pl-8 md:pl-10">
                    <div className={`absolute -left-[17px] md:-left-[19px] top-1 w-8 h-8 rounded-full border-4 border-white dark:border-zinc-950 ${act.iconBg} ${act.iconColor} flex items-center justify-center z-10 shadow-sm`}>
                       <act.icon size={14} />
                    </div>
                    <div>
                       <p className="font-bold text-sm text-black dark:text-white leading-snug">{act.text}</p>
                       <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{act.time}</p>
                    </div>
                 </div>
              )) : <p className="text-zinc-500 text-sm font-medium pl-8 italic">Aucune activité récente détectée.</p>}
           </div>
        </div>
      </div>

      {/* --- NOUVEAU GRAPHIQUE DE CONVERSION GLOBALE --- */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm mt-8">
         <h3 className="font-black uppercase text-lg mb-6 text-black dark:text-white">Conversion Globale (6 derniers mois)</h3>
         <div style={{ width: '100%', height: 300 }}>
           <ResponsiveContainer>
             <BarChart data={conversionData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
               <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
               <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
               <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '1rem', color: '#fff' }} />
               <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold', paddingTop: '10px' }} />
               <Bar dataKey="total" name="Total Leads" fill="#3f3f46" radius={[4, 4, 0, 0]} barSize={20} />
               <Bar dataKey="gagne" name="Leads Gagnés" fill="#39FF14" radius={[4, 4, 0, 0]} barSize={20} />
             </BarChart>
           </ResponsiveContainer>
         </div>
      </div>

      {/* --- TABLEAU ROI DES CAMPAGNES --- */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-sm mt-8 overflow-hidden">
         <div className="p-6 md:p-8 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center group">
             <div className="cursor-pointer" onClick={() => setIsAnalysisModalOpen(true)}>
                 <h3 className="font-black uppercase text-lg text-black dark:text-white flex items-center gap-2"><Target size={20} className="text-[#39FF14]"/> Performances par Campagne</h3>
                 <p className="text-xs text-zinc-500 mt-1">Cliquez pour ouvrir l'analyse détaillée de la direction commerciale.</p>
             </div>
             <div className="flex items-center gap-3">
                 <button onClick={(e) => { e.stopPropagation(); handleExportCampaignsCSV(); }} className="hidden sm:flex bg-white dark:bg-zinc-900 text-black dark:text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:border-[#39FF14] dark:hover:border-[#39FF14] transition-colors border border-zinc-200 dark:border-zinc-800 items-center gap-2 shadow-sm">
                   <Download size={14} /> CSV
                 </button>
                 <button onClick={() => setIsAnalysisModalOpen(true)} className="hidden sm:flex bg-black text-[#39FF14] px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform border border-[#39FF14]/30 items-center gap-2">
                   <PieChartIcon size={14} /> Analyser
                 </button>
             </div>
         </div>
         <div className="overflow-x-auto custom-scrollbar">
             <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-zinc-50 dark:bg-zinc-900/50">
                     <tr>
                         <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nom de la Campagne</th>
                         <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Total Leads</th>
                         <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">En Cours</th>
                         <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Perdus</th>
                         <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Gagnés (Convertis)</th>
                         <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Taux Conv.</th>
                         <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">CA Généré</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                     {campaignsData.map((c, i) => {
                         const rate = c.total > 0 ? (c.converted / c.total) * 100 : 0;
                         const badgeColor = rate >= 15 ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30' : rate >= 5 ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30';
                         return (
                             <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                                 <td className="p-5 font-bold text-sm text-black dark:text-white uppercase">{c.name}</td>
                                 <td className="p-5 text-center font-black text-lg">{c.total}</td>
                                 <td className="p-5 text-center">
                                    <span className="bg-blue-500/10 text-blue-500 border border-blue-500/30 px-3 py-1 rounded-lg text-xs font-black">{c.enCours}</span>
                                 </td>
                                 <td className="p-5 text-center">
                                    <span className="bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1 rounded-lg text-xs font-black">{c.lost}</span>
                                 </td>
                                 <td className="p-5 text-center">
                                    <span className="bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 px-3 py-1 rounded-lg text-xs font-black">{c.converted}</span>
                                 </td>
                                 <td className="p-5 text-center">
                                     <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${badgeColor}`}>
                                         {rate.toFixed(1)}%
                                     </span>
                                 </td>
                                 <td className="p-5 text-right font-black text-[#39FF14] text-lg">{c.ca.toLocaleString('fr-FR')} F</td>
                             </tr>
                         );
                     })}
                     {campaignsData.length === 0 && <tr><td colSpan={5} className="p-10 text-center text-zinc-500 italic font-bold">Aucune donnée disponible pour cette période.</td></tr>}
                 </tbody>
             </table>
         </div>
      </div>

      {/* --- MODALE ANALYSE DE CAMPAGNE (DIRECTION COMMERCIALE) --- */}
      {isAnalysisModalOpen && (() => {
        const periodMs = analysisPeriod === '7j' ? 7*24*3600*1000 : analysisPeriod === '30j' ? 30*24*3600*1000 : Infinity;
        const limitDate = new Date(Date.now() - periodMs);
        
        const campLeads = allLeads.filter((l: any) => {
           const campName = l.campaign_name || l.intent || l.source;
           const matchCamp = analysisCampaign === 'Toutes' || campName === analysisCampaign;
           const matchDate = new Date(l.created_at || 0) >= limitDate;
           return matchCamp && matchDate;
        });

        const total = campLeads.length;
        const enCours = campLeads.filter((l: any) => l.status === 'En Cours').length;
        const convertis = campLeads.filter((l: any) => l.status === 'Converti').length;
        const gagnes = campLeads.filter((l: any) => l.status === 'Gagné').length;
        const perdus = campLeads.filter((l: any) => l.status === 'Perdu').length;
        const nonTraites = total - enCours - convertis - gagnes - perdus; 
        
        const ca = campLeads.filter((l: any) => l.status === 'Gagné' || l.status === 'Converti' || l.is_client).reduce((sum: number, l: any) => sum + Number(l.amount || l.budget || 0), 0);
        const txConv = total > 0 ? (((convertis + gagnes) / total) * 100).toFixed(1) : '0';
        const cpl = total > 0 ? (50000 / total).toFixed(0) : '0'; // Simulation de budget global 50k

        let insight = "Données insuffisantes pour générer une recommandation.";
        if (total > 0) {
           if (Number(txConv) < 10) {
              insight = "⚠️ Volume élevé mais faible conversion : Affinez le ciblage publicitaire ou revoyez le script d'appel de l'équipe de vente.";
           } else if (perdus > total * 0.4) {
              insight = `🔄 La campagne sélectionnée génère trop de leads froids (${perdus} perdus). Envisagez d'ajouter une question qualifiante pour filtrer.`;
           } else if (Number(txConv) >= 20) {
              insight = "🔥 Excellente conversion ! Envisagez d'augmenter le budget publicitaire (Scaling) sur cette campagne spécifique.";
           } else {
              insight = "✅ Campagne saine. Continuez l'optimisation des relances WhatsApp pour gratter quelques pourcents de conversion.";
           }
        }

        const funnelData = [
           { name: 'Total Leads', count: total, fill: '#6b7280' },
           { name: 'Contactés', count: total - nonTraites, fill: '#3b82f6' },
           { name: 'Devis (Convertis)', count: convertis, fill: '#eab308' },
           { name: 'Ventes Conclues', count: gagnes, fill: '#22c55e' }
        ];

        const uniqueCampaigns = Array.from(new Set(allLeads.map((l: any) => l.campaign_name || l.intent || l.source).filter(Boolean)));

        return (
           <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsAnalysisModalOpen(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
              <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] w-full max-w-4xl shadow-2xl relative animate-in zoom-in-95 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex flex-col max-h-[95vh]">
                 <button onClick={() => setIsAnalysisModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white transition z-20"><X size={20}/></button>
                 
                 <div className="p-8 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
                    <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-black dark:text-white mb-6">
                       <Target className="text-[#39FF14]"/> Analyse de Campagne
                    </h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                       <div className="flex-1">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Choisir la Campagne / Formulaire</label>
                          <select value={analysisCampaign} onChange={e => setAnalysisCampaign(e.target.value)} className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14] cursor-pointer appearance-none text-black dark:text-white">
                             <option value="Toutes">Toutes les campagnes confondues</option>
                             {uniqueCampaigns.map((c: any) => <option key={c} value={c}>{c}</option>)}
                          </select>
                       </div>
                       <div className="w-full sm:w-48">
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Période d'analyse</label>
                          <select value={analysisPeriod} onChange={e => setAnalysisPeriod(e.target.value)} className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14] cursor-pointer appearance-none text-black dark:text-white">
                             <option value="7j">7 derniers jours</option>
                             <option value="30j">30 derniers jours</option>
                             <option value="Tout">Depuis le début</option>
                          </select>
                       </div>
                    </div>
                 </div>

                 <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                       <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                          <PieChartIcon className="text-zinc-500 mb-3" size={24}/>
                          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">CPL Estimé</p>
                          <p className="text-2xl font-black text-black dark:text-white">{cpl} F</p>
                       </div>
                       <div className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                          <ActivityIcon className="text-blue-500 mb-3" size={24}/>
                          <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Taux de Conversion</p>
                          <p className="text-2xl font-black text-blue-500">{txConv} %</p>
                       </div>
                       <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 p-6 rounded-2xl flex flex-col items-center text-center shadow-sm">
                          <TrendingUp className="text-[#39FF14] mb-3" size={24}/>
                          <p className="text-[10px] font-black uppercase text-green-800 dark:text-[#39FF14] tracking-widest mb-1">CA Généré</p>
                          <p className="text-2xl font-black text-green-700 dark:text-[#39FF14]">{ca.toLocaleString()} F</p>
                       </div>
                    </div>

                    <div className="mb-8">
                       <h3 className="font-black uppercase text-sm mb-6 text-zinc-800 dark:text-zinc-200">Entonnoir de Conversion</h3>
                       <div className="h-64 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <BarChart layout="vertical" data={funnelData} margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e4e4e7" opacity={0.5} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 11, fontWeight: 'bold' }} width={120} />
                                <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '1rem', border: '1px solid #e4e4e7', backgroundColor: '#18181b', color: '#fff', fontWeight: 'bold' }} />
                                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                                   {funnelData.map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.fill} />
                                   ))}
                                </Bar>
                             </BarChart>
                          </ResponsiveContainer>
                       </div>
                       <div className="flex justify-center gap-6 mt-4 text-[10px] font-bold text-zinc-500">
                          <span>Non Traités: <b className="text-zinc-400">{nonTraites}</b></span>
                          <span>Perdus: <b className="text-red-500">{perdus}</b></span>
                       </div>
                    </div>

                    <div className="bg-black text-white dark:bg-white dark:text-black p-6 rounded-2xl flex items-start gap-4 shadow-xl">
                       <Zap size={24} className="text-[#39FF14] shrink-0 mt-1"/>
                       <div>
                          <h4 className="font-black uppercase text-sm mb-2">Actions Stratégiques (IA)</h4>
                          <p className="text-sm font-medium opacity-90 leading-relaxed">{insight}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        );
      })()}
    </div>
  );
}
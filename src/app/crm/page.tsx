"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Users, TrendingUp, Wallet, Zap, UserPlus, Calendar as CalendarIcon, Clock, Target, X, PieChart as PieChartIcon, Activity as ActivityIcon, Download, Bot, Wand2, Star, AlertTriangle, MessageSquare, ChevronRight, CheckCircle, Send } from 'lucide-react';
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
  
  // --- ÉTATS INTELLIGENCE LIKA ---
  const [products, setProducts] = useState<any[]>([]);
  const [kpiDetailsModal, setKpiDetailsModal] = useState<string | null>(null);
  const [isLikaBrainOpen, setIsLikaBrainOpen] = useState(false);
  const [likaActionModal, setLikaActionModal] = useState<{title: string, msg: string, actionLabel?: string, onAction?: () => void} | null>(null);
  const [kpiSearch, setKpiSearch] = useState("");

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

      // Récupération du catalogue pour Lika
      const { data: prods } = await supabase.from('crm_products').select('*').eq('tenant_id', session.id);
      if (prods) setProducts(prods);

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
          // Groupement STRICT par ad_name
          const rawName = l.ad_name || 'Publicité Inconnue';
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

  // --- CALCULS LIKA STRATEGY (TOP & FLOPS) ---
  const topClients = useMemo(() => {
      const clientsMap = new Map();
      allLeads.filter(l => ['Gagné', 'Converti'].includes(l.status) || l.is_client).forEach(l => {
          const key = l.phone || l.full_name;
          const current = clientsMap.get(key) || { name: l.full_name, ca: 0, phone: l.phone };
          clientsMap.set(key, { ...current, ca: current.ca + Number(l.amount || l.budget || 0) });
      });
      return Array.from(clientsMap.values()).sort((a: any, b: any) => b.ca - a.ca).slice(0, 5);
  }, [allLeads]);

  const { topProducts, flopProducts } = useMemo(() => {
      const sorted = [...products].sort((a, b) => (a.stock || 0) - (b.stock || 0));
      return { topProducts: sorted.slice(0, 5), flopProducts: [...sorted].reverse().slice(0, 5) };
  }, [products]);

  const coldLeads = useMemo(() => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return allLeads.filter(l => 
          !['Gagné', 'Converti', 'Perdu'].includes(l.status) && 
          l.created_at && new Date(l.created_at) < sevenDaysAgo
      );
  }, [allLeads]);

  const handleLikaAction = (type: string, data: any) => {
      let title = `Suggestion pour ${data.name}`;
      let msg = "";
      
      let actionLabel = "";
      let onAction = () => {};

      if (type === 'client') {
          msg = `Lika vous conseille de générer un message WhatsApp pour remercier ${data.name} de sa fidélité (CA total: ${data.ca.toLocaleString()} F) et lui proposer une offre exclusive ou un produit complémentaire VIP.`;
          actionLabel = "Message WhatsApp";
          onAction = () => {
              const waMsg = `Bonjour ${data.name}, pour vous remercier de votre fidélité chez nous, nous avons une offre exclusive à vous proposer !`;
              window.open(`https://wa.me/${(data.phone||'').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMsg)}`, '_blank');
              setLikaActionModal(null);
          };
      }
      else if (type === 'top_product') {
          msg = `Attention, le stock de ${data.name} est critique (${data.stock} restants). Lika suggère de lancer immédiatement une commande de réassort auprès de votre fournisseur pour éviter la rupture de ce best-seller.`;
          actionLabel = "Gérer le Stock";
          onAction = () => { router.push('/crm/products'); setLikaActionModal(null); };
      }
      else if (type === 'flop_product') {
          msg = `Le produit ${data.name} dort en stock (${data.stock} unités). Lika suggère de créer un catalogue Promo Flash sur WhatsApp (par ex: -30%) et de l'envoyer à votre liste de diffusion pour écouler ce stock.`;
          actionLabel = "Créer Promo Flash";
          onAction = () => { router.push('/crm/studio'); setLikaActionModal(null); };
      }
      else if (type === 'cold_lead') {
          title = `Relance suggérée pour ${data.full_name}`;
          msg = `Le prospect ${data.full_name} est inactif depuis plus de 7 jours. Lika suggère de le relancer avec un message de réactivation pour ne pas perdre cette opportunité estimée à ${Number(data.budget || data.amount || 0).toLocaleString()} F.`;
          actionLabel = "Relancer sur WhatsApp";
          onAction = () => {
              const intentText = data.intent ? ` concernant votre intérêt pour ${data.intent}` : '';
              const waMsg = `Bonjour ${data.full_name}, nous n'avons plus de vos nouvelles ! Avez-vous pu avancer sur votre projet${intentText} ? Notre équipe est disponible pour vous accompagner si vous avez des questions.`;
              window.open(`https://wa.me/${(data.phone||'').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waMsg)}`, '_blank');
              setLikaActionModal(null);
          };
      }
      
      setLikaActionModal({ title, msg, actionLabel, onAction });
  };

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
    
    const headers = ['Nom de la Publicité (Ad Name)', 'Total Leads', 'En Cours', 'Perdus', 'Gagnés (Convertis)', 'Taux Conv. (%)', 'CA Généré (FCFA)'];
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
    { id: 'newLeads', title: "Total Leads (Période)", value: realKpis.newLeads.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { id: 'conversionRate', title: "Taux de Conversion", value: realKpis.conversionRate, icon: TrendingUp, color: "text-[#39FF14]", bg: "bg-[#39FF14]/10", valueColor: "text-[#39FF14]" },
    { id: 'potentialCA', title: "CA Potentiel Pipeline", value: `${realKpis.potentialCA.toLocaleString('fr-FR')} F`, icon: Wallet, color: "text-purple-500", bg: "bg-purple-500/10" }
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
          <div key={index} onClick={() => setKpiDetailsModal(kpi.id)} className="bg-white dark:bg-zinc-950 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between hover:border-[#39FF14] hover:shadow-[0_0_20px_rgba(57,255,20,0.1)] cursor-pointer transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={20} />
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">{kpi.title}</p>
              <p className={`text-3xl font-black tracking-tighter ${kpi.valueColor || 'text-black dark:text-white'}`}>{kpi.value}</p>
            </div>
            <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-black uppercase text-zinc-500">
               Détails <ChevronRight size={14}/>
            </div>
          </div>
        ))}
      </div>

      {/* --- NOUVEAU : INTELLIGENCE STRATÉGIQUE LIKA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8 mb-8">
         {/* TOP CLIENTS */}
         <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <Star className="text-yellow-400 fill-yellow-400" size={24}/>
               <h3 className="font-black uppercase text-lg text-black dark:text-white">Top 5 Clients</h3>
            </div>
            <div className="space-y-4 flex-1">
               {topClients.length > 0 ? topClients.map((client: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-yellow-400/50 transition-colors">
                     <div>
                        <p className="font-black text-sm uppercase text-black dark:text-white">{client.name}</p>
                        <p className="text-xs font-bold text-yellow-500">{client.ca.toLocaleString()} F CA</p>
                     </div>
                     <button onClick={() => handleLikaAction('client', client)} className="shrink-0 bg-black dark:bg-white text-[#39FF14] dark:text-black px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 transition-transform shadow-md opacity-100 lg:opacity-0 group-hover:opacity-100">
                        <Wand2 size={12}/> Action Lika
                     </button>
                  </div>
               )) : <p className="text-sm text-zinc-500 italic">Aucun client converti pour le moment.</p>}
            </div>
         </div>

         {/* BEST SELLERS */}
         <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <TrendingUp className="text-[#39FF14]" size={24}/>
               <h3 className="font-black uppercase text-lg text-black dark:text-white">Produits Populaires</h3>
            </div>
            <div className="space-y-4 flex-1">
               {topProducts.length > 0 ? topProducts.map((prod: any, i: number) => (
                  <div key={i} className="flex flex-col gap-2 p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-[#39FF14]/50 transition-colors">
                     <div className="flex justify-between items-start">
                        <p className="font-black text-sm text-black dark:text-white truncate pr-2">{prod.name}</p>
                        <button onClick={() => handleLikaAction('top_product', prod)} className="shrink-0 bg-black dark:bg-white text-[#39FF14] dark:text-black px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1 hover:scale-105 transition-transform shadow-md opacity-100 lg:opacity-0 group-hover:opacity-100">
                           <Wand2 size={10}/> Lika
                        </button>
                     </div>
                     <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                           <div className={`h-full ${prod.stock < 5 ? 'bg-red-500' : 'bg-[#39FF14]'}`} style={{ width: `${Math.min(100, Math.max(5, (prod.stock/50)*100))}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-500">{prod.stock} en stock</span>
                     </div>
                  </div>
               )) : <p className="text-sm text-zinc-500 italic">Aucun produit dans le catalogue.</p>}
            </div>
         </div>

         {/* FLOP PRODUITS (DORMANTS) */}
         <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col">
            <div className="flex items-center gap-3 mb-6">
               <AlertTriangle className="text-orange-500" size={24}/>
               <h3 className="font-black uppercase text-lg text-black dark:text-white">Stocks Dormants</h3>
            </div>
            <div className="space-y-4 flex-1">
               {flopProducts.length > 0 ? flopProducts.map((prod: any, i: number) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-orange-50/50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20 group hover:border-orange-500 transition-colors">
                     <div className="min-w-0">
                        <p className="font-black text-sm text-black dark:text-white truncate">{prod.name}</p>
                        <p className="text-[10px] font-bold text-orange-600 dark:text-orange-400 mt-0.5">{prod.stock} unités bloquées</p>
                     </div>
                     <button onClick={() => handleLikaAction('flop_product', prod)} className="shrink-0 bg-orange-500 text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:scale-105 transition-transform shadow-md opacity-100 lg:opacity-0 group-hover:opacity-100">
                        <Wand2 size={12}/> Promo Flash
                     </button>
                  </div>
               )) : <p className="text-sm text-zinc-500 italic">Aucun stock dormant détecté.</p>}
            </div>
         </div>
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
                         <th className="p-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Nom de la Publicité (Ad Name)</th>
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
           const campName = l.ad_name || 'Publicité Inconnue';
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

        const uniqueCampaigns = Array.from(new Set(allLeads.map((l: any) => l.ad_name || 'Publicité Inconnue')));

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
                          <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Choisir l'Ad Name</label>
                          <select value={analysisCampaign} onChange={e => setAnalysisCampaign(e.target.value)} className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14] cursor-pointer appearance-none text-black dark:text-white">
                             <option value="Toutes">Toutes les publicités confondues</option>
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

      {/* --- MODALE : KPI DETAILS SLIDE-OVER --- */}
      {kpiDetailsModal && (() => {
          let filteredList: any[] = [];
          let modalTitle = "";
          if (kpiDetailsModal === 'newLeads') {
              modalTitle = "Total Leads (Période sélectionnée)";
              filteredList = allLeads.filter((l: any) => {
                  if (!dateRange.start || !dateRange.end) return true;
                  const d = new Date(l.created_at);
                  const start = new Date(dateRange.start); start.setHours(0,0,0,0);
                  const end = new Date(dateRange.end); end.setHours(23,59,59,999);
                  return d >= start && d <= end;
              });
          } else if (kpiDetailsModal === 'conversionRate') {
              modalTitle = "Leads Convertis (Gagnés)";
              filteredList = allLeads.filter(l => ['Gagné', 'Converti'].includes(l.status) || l.is_client);
          } else if (kpiDetailsModal === 'potentialCA') {
              modalTitle = "Pipeline En Cours (CA Potentiel)";
              filteredList = allLeads.filter(l => !['Gagné', 'Converti', 'Perdu'].includes(l.status));
          }

          const searchedList = filteredList.filter(l => l.full_name?.toLowerCase().includes(kpiSearch.toLowerCase()) || l.phone?.includes(kpiSearch));

          return (
            <div className="fixed inset-0 z-[250] flex justify-end">
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in" onClick={() => { setKpiDetailsModal(null); setKpiSearch(''); }}></div>
                <div className="relative w-full max-w-md bg-white dark:bg-zinc-950 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-zinc-200 dark:border-zinc-800">
                    <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50">
                        <h2 className="text-lg font-black uppercase tracking-tighter text-black dark:text-white">{modalTitle}</h2>
                        <button onClick={() => { setKpiDetailsModal(null); setKpiSearch(''); }} className="p-2 bg-zinc-200 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors"><X size={16}/></button>
                    </div>
                    <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
                       <input type="text" placeholder="Rechercher dans cette liste..." value={kpiSearch} onChange={(e) => setKpiSearch(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#39FF14] transition-colors" />
                    </div>
                    <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-3">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">{searchedList.length} résultats</p>
                        {searchedList.map(l => (
                            <div key={l.id} className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-[#39FF14] transition-colors cursor-pointer group">
                                <div className="flex justify-between items-start mb-2">
                                   <p className="font-black uppercase text-sm text-black dark:text-white truncate pr-2 group-hover:text-[#39FF14] transition-colors">{l.full_name}</p>
                                   <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{l.status || 'Nouveau'}</span>
                                </div>
                                <p className="text-xs font-bold text-zinc-500 mb-2">{l.phone}</p>
                                <p className="text-sm font-black text-black dark:text-white text-right">{Number(l.budget || l.amount || 0).toLocaleString()} F</p>
                            </div>
                        ))}
                        {searchedList.length === 0 && <p className="text-center text-sm font-bold text-zinc-500 py-10">Aucun lead trouvé.</p>}
                    </div>
                </div>
            </div>
          );
      })()}

      {/* --- LIKA TO-DO LIST (MODAL) --- */}
      {isLikaBrainOpen && (
        <div id="lika-brain-overlay" onClick={(e: any) => e.target.id === 'lika-brain-overlay' && setIsLikaBrainOpen(false)} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-white dark:bg-zinc-950 rounded-[2.5rem] w-full max-w-2xl shadow-2xl relative animate-in zoom-in-95 border border-zinc-200 dark:border-zinc-800 p-6 md:p-8 flex flex-col max-h-[90vh]">
                <button onClick={() => setIsLikaBrainOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black dark:hover:text-white transition z-20"><X size={20}/></button>
                
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.4)] animate-pulse shrink-0">
                        <Bot size={32} />
                    </div>
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black dark:text-white">Lika Stratégie</h2>
                        <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Votre To-Do List intelligente du Jour</p>
                    </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    {allLeads.filter(l => l.status === 'En Cours').slice(0, 2).map((l, i) => (
                        <div key={`todo1-${i}`} className="bg-blue-50 dark:bg-blue-500/10 p-5 rounded-2xl border border-blue-100 dark:border-blue-500/20 flex flex-col sm:flex-row gap-4">
                            <div className="bg-blue-500/20 text-blue-600 dark:text-blue-400 p-3 rounded-xl shrink-0 h-max w-max"><MessageSquare size={20}/></div>
                            <div>
                                <h4 className="font-black text-sm uppercase mb-2 text-black dark:text-white">Relance Chaude : {l.full_name}</h4>
                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">Ce prospect est "En Cours" et représente un CA potentiel de {Number(l.amount||l.budget||0).toLocaleString()} F. Relancez-le aujourd'hui pour closer l'affaire.</p>
                                <button onClick={() => window.open(`https://wa.me/${(l.phone||'').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${l.full_name}, suite à notre dernier échange...`)}`, '_blank')} className="bg-blue-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform shadow-md w-full sm:w-auto">Générer Message WhatsApp</button>
                            </div>
                        </div>
                    ))}
                    {flopProducts.slice(0, 1).map((p, i) => (
                        <div key={`todo2-${i}`} className="bg-orange-50 dark:bg-orange-500/10 p-5 rounded-2xl border border-orange-100 dark:border-orange-500/20 flex flex-col sm:flex-row gap-4">
                            <div className="bg-orange-500/20 text-orange-600 dark:text-orange-400 p-3 rounded-xl shrink-0 h-max w-max"><Zap size={20}/></div>
                            <div>
                                <h4 className="font-black text-sm uppercase mb-2 text-black dark:text-white">Action Stock : {p.name}</h4>
                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">Ce produit dort en stock ({p.stock} pièces). Créez une campagne Flash Promo à -20% pour votre liste de diffusion pour faire tourner le cash.</p>
                                <button onClick={() => { setIsLikaBrainOpen(false); router.push('/crm/products'); }} className="bg-orange-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform shadow-md w-full sm:w-auto">Créer Promo Flash</button>
                            </div>
                        </div>
                    ))}
                    {topClients.slice(0, 1).map((c, i) => (
                        <div key={`todo3-${i}`} className="bg-green-50 dark:bg-[#39FF14]/10 p-5 rounded-2xl border border-green-100 dark:border-[#39FF14]/20 flex flex-col sm:flex-row gap-4">
                            <div className="bg-[#39FF14]/20 text-green-700 dark:text-[#39FF14] p-3 rounded-xl shrink-0 h-max w-max"><Star size={20}/></div>
                            <div>
                                <h4 className="font-black text-sm uppercase mb-2 text-black dark:text-white">Fidélisation VIP : {c.name}</h4>
                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">Client Top 5 (CA: {c.ca.toLocaleString()} F). Proposez-lui une offre exclusive VIP ou un produit complémentaire pour le remercier de sa fidélité.</p>
                                <button onClick={() => window.open(`https://wa.me/${(c.phone||'').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${c.name}, pour vous remercier de votre fidélité chez nous...`)}`, '_blank')} className="bg-[#39FF14] text-black px-4 py-2.5 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform shadow-md w-full sm:w-auto">Contacter le VIP</button>
                            </div>
                        </div>
                    ))}
                    {coldLeads.slice(0, 2).map((l, i) => (
                        <div key={`todo-cold-${i}`} className="bg-purple-50 dark:bg-purple-500/10 p-5 rounded-2xl border border-purple-100 dark:border-purple-500/20 flex flex-col sm:flex-row gap-4">
                            <div className="bg-purple-500/20 text-purple-600 dark:text-purple-400 p-3 rounded-xl shrink-0 h-max w-max"><Clock size={20}/></div>
                            <div>
                                <h4 className="font-black text-sm uppercase mb-2 text-black dark:text-white">Relance Froid : {l.full_name}</h4>
                                <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">Ce prospect n'a pas donné de nouvelles depuis plus de 7 jours (CA potentiel: {Number(l.amount||l.budget||0).toLocaleString()} F). Lika a préparé un message pour le réactiver.</p>
                                <button onClick={() => handleLikaAction('cold_lead', l)} className="bg-purple-500 text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform shadow-md w-full sm:w-auto">Voir l'action Lika</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* --- LIKA ACTION MODAL (Mini-popup pour suggestion spécifique) --- */}
      {likaActionModal && (
        <div id="lika-action-overlay" onClick={(e: any) => e.target.id === 'lika-action-overlay' && setLikaActionModal(null)} className="fixed inset-0 z-[350] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] max-w-sm w-full shadow-2xl relative border-t-4 border-[#39FF14] animate-in zoom-in-95">
                <button onClick={() => setLikaActionModal(null)} className="absolute top-4 right-4 text-zinc-400 hover:text-black dark:hover:text-white transition"><X size={20}/></button>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-black p-2 rounded-xl"><Wand2 className="text-[#39FF14]" size={20}/></div>
                    <h3 className="font-black uppercase text-lg leading-tight">{likaActionModal.title}</h3>
                </div>
                <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-8 leading-relaxed">
                    {likaActionModal.msg}
                </p>
            <div className="flex gap-3">
                <button onClick={() => setLikaActionModal(null)} className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">Fermer</button>
                {likaActionModal.actionLabel && (
                    <button onClick={likaActionModal.onAction} className="flex-[2] bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">
                        <Send size={16}/> {likaActionModal.actionLabel}
                    </button>
                )}
            </div>
            </div>
        </div>
      )}

      {/* --- BOUTON FLOTTANT LIKA (FAB) --- */}
      <button onClick={() => setIsLikaBrainOpen(true)} className="fixed bottom-6 right-6 bg-black dark:bg-white text-[#39FF14] dark:text-black p-4 rounded-full shadow-[0_10px_30px_rgba(57,255,20,0.4)] hover:scale-110 transition-transform z-50 flex items-center gap-3 border-2 border-[#39FF14]">
          <Bot size={28} className="animate-pulse" />
          <span className="font-black uppercase tracking-widest text-xs pr-2 hidden md:block">Demander à Lika</span>
      </button>

    </div>
  );
}
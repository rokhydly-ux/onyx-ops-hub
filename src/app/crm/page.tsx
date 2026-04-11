"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Users, TrendingUp, Wallet, Zap, UserPlus, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

export default function CRMDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [session, setSession] = useState<any>({});
  
  const [realKpis, setRealKpis] = useState({ newLeads: 0, conversionRate: "0%", potentialCA: 0 });
  const [realPerformers, setRealPerformers] = useState<any[]>([]);
  const [realActivities, setRealActivities] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [conversionData, setConversionData] = useState<any[]>([]);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/login');
      const role = user.user_metadata?.role || 'admin';
      const tenantId = user.user_metadata?.tenant_id || user.id;
      if (role === 'commercial') return router.replace('/crm/leads');
      setSession({ id: tenantId });
      setIsAuthorized(true);
    };
    checkAccess();
  }, [router]);

  useEffect(() => {
    const fetchRealData = async () => {
      if (!session?.id) return;

      const { data: leads } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('tenant_id', session.id)
        .order('created_at', { ascending: false });

      const safeLeads = leads || [];

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const newLeadsCount = safeLeads.filter((l: any) => new Date(l.created_at) > yesterday).length;

      const wonLeads = safeLeads.filter((l: any) => l.status === 'Gagné' || l.status === 'Converti').length;
      const convRate = safeLeads.length > 0 ? Math.round((wonLeads / safeLeads.length) * 100) : 0;

      const caPotentiel = safeLeads
        .filter((l: any) => !['Gagné', 'Converti', 'Perdu'].includes(l.status))
        .reduce((acc: number, l: any) => acc + (Number(l.budget || l.amount || 0)), 0);

      setRealKpis({ newLeads: newLeadsCount, conversionRate: `${convRate}%`, potentialCA: caPotentiel });

      const perfMap: Record<string, number> = {};
      safeLeads.forEach((l: any) => {
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

      const recent = safeLeads.slice(0, 5);
      setRealActivities(recent.map((l: any) => ({
        id: l.id,
        text: `Nouveau lead : ${l.full_name} (${l.intent || 'Contact'})`,
        time: new Date(l.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        icon: Zap, iconBg: "bg-yellow-500/10", iconColor: "text-yellow-500"
      })));

      // Récupération des 5 prochains RDV de l'Agenda
      const { data: appts } = await supabase
        .from('booking_appointments')
        .select('*')
        .eq('tenant_id', session.id)
        .gte('date_time', new Date(new Date().setHours(0,0,0,0)).toISOString())
        .order('date_time', { ascending: true })
        .limit(5);
      if (appts) setAppointments(appts);

      // --- CALCUL DU GRAPHIQUE DE CONVERSION (6 Derniers Mois) ---
      const monthsNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      const conversionMap = new Map();
      for (let i = 5; i >= 0; i--) {
         const d = new Date(); d.setMonth(d.getMonth() - i);
         conversionMap.set(`${d.getFullYear()}-${d.getMonth()}`, { name: monthsNames[d.getMonth()], total: 0, gagne: 0 });
      }
      safeLeads.forEach((l: any) => {
         const d = new Date(l.created_at);
         const key = `${d.getFullYear()}-${d.getMonth()}`;
         if (conversionMap.has(key)) {
            conversionMap.get(key).total += 1;
            if (l.status === 'Gagné' || l.status === 'Converti') conversionMap.get(key).gagne += 1;
         }
      });
      setConversionData(Array.from(conversionMap.values()));
    };

    if (isAuthorized) fetchRealData();
  }, [isAuthorized, session]);

  if (!isAuthorized) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const kpis = [
    { title: "Nouveaux Leads (24h)", value: realKpis.newLeads.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
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
        <button onClick={() => router.push('/crm/settings?tab=team')} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black hover:text-[#39FF14] transition-all flex items-center gap-2 shrink-0">
           <UserPlus size={16} /> Ajouter membre équipe
        </button>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
    </div>
  );
}
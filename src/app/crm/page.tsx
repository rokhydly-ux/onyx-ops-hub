"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  TrendingUp, 
  Users, 
  Wallet, 
  MessageSquare, 
  FileText, 
  Zap, 
  CheckCircle,
  Activity
} from 'lucide-react';

export default function CRMDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata?.role === 'commercial') {
        // Le commercial n'a pas accès au dashboard, redirection immédiate
        router.replace('/crm/leads');
      } else {
        setIsAuthorized(true);
      }
    };
    checkAccess();
  }, [router]);

  if (!isAuthorized) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div></div>;
  }

  // Mock Data - KPIs
  const kpis = [
    { title: "Nouveaux Leads (24h)", value: "12", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Taux de Conversion", value: "34%", icon: TrendingUp, color: "text-[#39FF14]", bg: "bg-[#39FF14]/10", valueColor: "text-[#39FF14]" },
    { title: "CA Potentiel Pipeline", value: "1 500 000 F", icon: Wallet, color: "text-purple-500", bg: "bg-purple-500/10" }
  ];

  // Mock Data - Top Performers
  const topPerformers = [
    { id: 1, name: "Moussa", leads: 8, color: "text-[#39FF14]", dot: "bg-[#39FF14]" },
    { id: 2, name: "Fatou", leads: 6, color: "text-blue-500", dot: "bg-blue-500" },
    { id: 3, name: "Ousmane", leads: 4, color: "text-red-500", dot: "bg-red-500" },
  ];

  // Mock Data - Activity Timeline (Privyr Style)
  const activities = [
    { id: 1, text: "Moussa a envoyé un message de relance à Client X", time: "Il y a 10 min", icon: MessageSquare, iconBg: "bg-[#39FF14]/10", iconColor: "text-[#39FF14]" },
    { id: 2, text: "Fatou a généré un catalogue pour Lead Y", time: "Il y a 1h", icon: FileText, iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
    { id: 3, text: "Nouveau lead assigné à Ousmane via OCR", time: "Il y a 2h", icon: Zap, iconBg: "bg-yellow-500/10", iconColor: "text-yellow-500" },
    { id: 4, text: "Ousmane a clôturé la vente avec Client Z", time: "Il y a 3h", icon: CheckCircle, iconBg: "bg-[#39FF14]/10", iconColor: "text-[#39FF14]" },
    { id: 5, text: "Un lead chaud a été détecté par le système", time: "Il y a 4h", icon: TrendingUp, iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
  ];

  return (
    <div className="flex flex-col gap-8 h-full w-full animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter">
          Bonjour Boss, voici l'état de la <span className="text-[#39FF14]">machine à vendre.</span>
        </h2>
        <p className="text-xs md:text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
          Tableau de bord des performances en temps réel
        </p>
      </div>

      {/* GRID TOP : KPIs + TOP PERFORMERS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* KPIs */}
        {kpis.map((kpi, idx) => (
          <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm flex flex-col justify-between hover:border-black dark:hover:border-zinc-700 transition-all hover:scale-[1.02] group">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${kpi.bg} ${kpi.color}`}>
                <kpi.icon size={24} />
              </div>
              {idx === 1 && <span className="flex h-3 w-3 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#39FF14] opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-[#39FF14]"></span></span>}
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">{kpi.title}</p>
              <p className={`text-3xl md:text-4xl font-black tracking-tighter ${kpi.valueColor || 'text-black dark:text-white'}`}>{kpi.value}</p>
            </div>
          </div>
        ))}

        {/* TOP PERFORMERS */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm hover:border-black dark:hover:border-zinc-700 transition-all hover:scale-[1.02] flex flex-col justify-between">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-3 rounded-2xl bg-orange-500/10 text-orange-500">
                <Activity size={24} />
             </div>
             <h3 className="font-black uppercase tracking-tighter text-lg">Top Équipe</h3>
           </div>
           <div className="space-y-4">
             {topPerformers.map(rep => (
                <div key={rep.id} className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <span className={`w-3 h-3 rounded-full ${rep.dot} shadow-sm`}></span>
                      <span className="font-bold text-sm text-black dark:text-white uppercase">{rep.name}</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <span className="font-black text-lg">{rep.leads}</span>
                      <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Leads</span>
                   </div>
                </div>
             ))}
           </div>
        </div>

      </div>

      {/* ACTIVITY TIMELINE (Privyr Style) */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 md:p-8 shadow-sm flex-1 flex flex-col relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/5 rounded-full blur-3xl pointer-events-none"></div>
         <h3 className="font-black uppercase tracking-tighter text-xl md:text-2xl mb-8 flex items-center gap-3 relative z-10">
           <Activity className="text-[#39FF14]" size={24}/> Flux d'Activité
         </h3>
         
         <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800/60 ml-4 md:ml-6 space-y-8 pb-4 z-10 flex-1 overflow-y-auto custom-scrollbar pr-4">
            {activities.map((act) => (
               <div key={act.id} className="relative pl-8 md:pl-10">
                  <div className={`absolute -left-[17px] md:-left-[19px] top-1 w-8 h-8 rounded-full border-4 border-white dark:border-zinc-950 ${act.iconBg} ${act.iconColor} flex items-center justify-center z-10 shadow-sm`}>
                     <act.icon size={14} />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 bg-zinc-50 dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-[#39FF14]/50 hover:shadow-[0_0_15px_rgba(57,255,20,0.05)] transition-all group">
                     <p className="font-bold text-sm text-black dark:text-zinc-300 group-hover:text-black dark:group-hover:text-white transition-colors">{act.text}</p>
                     <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 whitespace-nowrap bg-zinc-200 dark:bg-zinc-800 px-3 py-1 rounded-lg">{act.time}</span>
                  </div>
               </div>
            ))}
         </div>
      </div>
      
    </div>
  );
}
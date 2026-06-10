"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ChevronLeft, Download, Lock, CheckCircle, 
  Activity, Calendar, Clock, ArrowRight, ShieldAlert, Sparkles, HeartPulse
} from "lucide-react";
import { motion } from "framer-motion";

const spaceGrotesk = { className: "font-sans" };

const WEEKLY_MENUS = [
  {
    week: 1,
    status: "unlocked",
    title: "Semaine 1 : Détox & Découverte",
    desc: "Commencez en douceur avec nos alternatives locales (Fonio, Mil) et nos astuces pour alléger vos plats.",
    meals: ["Lundi : Fonio au poulet (500 kcal)", "Mardi : Salade de Niébé (450 kcal)", "Mercredi : Thieboudienne revisité (600 kcal)"]
  },
  {
    week: 2,
    status: "unlocked",
    title: "Semaine 2 : L'Équilibre Africain",
    desc: "Votre corps s'habitue. On introduit des portions contrôlées pour vos plats familiaux.",
    meals: ["Lundi : Mafé allégé (550 kcal)", "Mardi : Poisson grillé et légumes locaux", "Mercredi : Couscous de mil (Thiéré)"]
  },
  {
    week: 3,
    status: "locked",
    title: "Semaine 3 : Accélération",
    desc: "La perte de poids s'accélère. Des menus spécifiques pour brûler les graisses résistantes.",
    meals: []
  },
  {
    week: 4,
    status: "locked",
    title: "Semaine 4 : Consolidation",
    desc: "Maintenez vos résultats sans effet yoyo et apprenez à stabiliser votre poids.",
    meals: []
  }
];

export default function NutritionDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(14); // Simulation de 14 jours restants

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ ...session.user, full_name: session.user.user_metadata?.full_name || "Membre" });
      } else {
        // Fallback pour localStorage si pas de session Supabase active
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
          setUser(JSON.parse(customSession));
        } else {
          router.push('/login');
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Activity className="animate-spin text-[#39FF14]" size={40} /></div>;
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-black pb-24 font-sans selection:bg-[#39FF14]/30">
      {/* Header */}
      <header className="bg-black text-white px-6 py-8 border-b-4 border-[#39FF14] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/20 blur-[100px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto">
          <button onClick={() => router.push('/hub')} className="flex items-center gap-2 text-zinc-400 hover:text-[#39FF14] transition-colors font-black uppercase text-xs tracking-widest mb-8 bg-zinc-900 w-max px-4 py-2 rounded-xl border border-zinc-800">
            <ChevronLeft size={16}/> Retour au Hub
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
            <div>
              <p className="text-[#39FF14] font-black tracking-widest text-xs uppercase mb-2">Espace Personnel</p>
              <h1 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase tracking-tighter`}>
                Bonjour, <span className="text-white">{user?.full_name?.split(' ')[0] || 'Membre'}</span> ! 👋
              </h1>
            </div>
            
            {/* Bandeau Essai Gratuit */}
            <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="bg-black border border-zinc-700 p-3 rounded-xl">
                 <Clock className="text-[#39FF14]" size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Période d'essai</p>
                 <p className="text-sm font-bold text-white"><strong className="text-[#39FF14]">{daysLeft} jours</strong> restants</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-12">
        
        {/* SECTION 1 : GUIDE PDF */}
        <section>
           <div className="bg-white border border-zinc-200 p-8 md:p-10 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group hover:border-[#39FF14] transition-colors">
             <div className="flex items-center gap-6 relative z-10">
                <div className="bg-[#39FF14]/10 text-[#39FF14] p-5 rounded-2xl border border-[#39FF14]/20 group-hover:scale-110 transition-transform">
                   <Download size={32} />
                </div>
                <div>
                   <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-1`}>Le Guide Complet</h2>
                   <p className="text-zinc-500 font-bold text-sm">Nutrition à l'Africaine : Vos 10 pages d'astuces et recettes.</p>
                </div>
             </div>
             <button className="w-full md:w-auto bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 relative z-10">
                Télécharger mon guide (PDF)
             </button>
           </div>
        </section>

        {/* SECTION 2 : MENUS DE LA SEMAINE */}
        <section>
           <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-[#39FF14] bg-black p-2 rounded-lg" size={36} />
              <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Vos Menus Sur-Mesure</h2>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              {WEEKLY_MENUS.map((menu, idx) => (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: idx * 0.1 }}
                   key={menu.week} 
                   className={`relative border-2 rounded-[2rem] p-8 transition-all overflow-hidden ${menu.status === 'unlocked' ? 'bg-white border-zinc-200 hover:border-black shadow-sm' : 'bg-zinc-100 border-dashed border-zinc-300'}`}
                 >
                    {menu.status === 'locked' && (
                       <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-16 h-16 bg-zinc-200 text-zinc-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                             <Lock size={28} />
                          </div>
                          <h3 className="font-black uppercase text-lg text-black mb-2">Semaine Verrouillée</h3>
                          <p className="text-xs font-bold text-zinc-500 mb-6">Passez au plan Premium pour débloquer la suite de votre programme et l'accès au groupe privé.</p>
                          <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite passer au plan Premium Nutrition pour débloquer toutes les semaines !', '_blank')} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center gap-2">
                             <Sparkles size={14}/> Passer Premium
                          </button>
                       </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-6">
                       <div>
                          <span className={`inline-block px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-3 ${menu.status === 'unlocked' ? 'bg-[#39FF14]/20 text-green-700' : 'bg-zinc-200 text-zinc-500'}`}>
                             Semaine {menu.week}
                          </span>
                          <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase text-black`}>{menu.title}</h3>
                       </div>
                       {menu.status === 'unlocked' && <CheckCircle className="text-[#39FF14]" size={24} />}
                    </div>
                    
                    <p className="text-sm font-medium text-zinc-600 mb-6">{menu.desc}</p>
                    
                    {menu.status === 'unlocked' && (
                       <div className="bg-zinc-50 border border-zinc-100 p-5 rounded-2xl">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3 border-b border-zinc-200 pb-2">Aperçu du menu</p>
                          <ul className="space-y-3">
                             {menu.meals.map((meal, i) => (
                                <li key={i} className="text-xs font-bold text-zinc-700 flex items-start gap-2">
                                   <span className="text-[#39FF14] mt-0.5">●</span> {meal}
                                </li>
                             ))}
                          </ul>
                          <button className="w-full mt-6 bg-black text-white py-3 rounded-xl font-black uppercase text-[10px] hover:bg-zinc-800 transition flex items-center justify-center gap-2">
                             Voir le menu complet <ArrowRight size={14} />
                          </button>
                       </div>
                    )}
                 </motion.div>
              ))}
           </div>
        </section>
      </div>
    </main>
  );
}
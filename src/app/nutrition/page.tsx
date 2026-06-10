"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ChevronLeft, Download, Lock, CheckCircle, 
  Activity, Calendar, Clock, ArrowRight, Sparkles, HeartPulse, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, X
} from "lucide-react";
import { motion } from "framer-motion";

const spaceGrotesk = { className: "font-sans" };

const ALL_MENUS = [
  {
    week: 1,
    title: "Semaine 1 : Détox & Découverte",
    desc: "Commencez en douceur avec nos alternatives locales (Fonio, Mil) et nos astuces pour alléger vos plats.",
    meals: ["Lundi : Fonio au poulet (500 kcal)", "Mardi : Salade de Niébé (450 kcal)", "Mercredi : Thieboudienne revisité (600 kcal)"]
  },
  {
    week: 2,
    title: "Semaine 2 : L'Équilibre Africain",
    desc: "Votre corps s'habitue. On introduit des portions contrôlées pour vos plats familiaux.",
    meals: ["Lundi : Mafé allégé (550 kcal)", "Mardi : Poisson grillé et légumes locaux", "Mercredi : Couscous de mil (Thiéré)"]
  },
  {
    week: 3,
    title: "Semaine 3 : Accélération",
    desc: "La perte de poids s'accélère. Des menus spécifiques pour brûler les graisses résistantes.",
    meals: []
  },
  {
    week: 4,
    title: "Semaine 4 : Consolidation",
    desc: "Maintenez vos résultats sans effet yoyo et apprenez à stabiliser votre poids.",
    meals: []
  }
];

const DAILY_MENU = {
   autopilot: [
      { type: 'Petit-déjeuner', time: '08:00', meal: 'Bouillie de Mil (Lakh) allégée, sans sucre ajouté', cals: 300, proteins: 8 },
      { type: 'Déjeuner', time: '13:30', meal: 'Thieboudienne (1/4 assiette riz brisé, 1/2 légumes, gros morceau de poisson)', cals: 600, proteins: 35 },
      { type: 'Collation', time: '16:00', meal: 'Poignée d\'arachides grillées (sans sel) ou fruits de saison', cals: 150, proteins: 5 },
      { type: 'Dîner', time: '19:30', meal: 'Salade de Niébé aux crudités, vinaigrette légère', cals: 400, proteins: 20 },
   ],
   compass: [
      { type: 'Règle d\'Or', time: 'Toute la journée', meal: 'Limitez les féculents (Riz, Fonio, Mil) à 1/4 de votre assiette max.' },
      { type: 'Protéines', time: 'Repas principaux', meal: 'Assurez-vous d\'avoir une belle portion de poisson, poulet ou viande maigre.' },
      { type: 'Légumes', time: 'Repas principaux', meal: 'Remplissez la moitié de votre assiette avec des légumes locaux (carottes, choux, aubergines).' },
   ]
};

const CircularProgress = ({ value, max, colorClass, label, icon: Icon, unit }: any) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
     <div className="flex flex-col items-center">
        <div className="relative w-24 h-24 mb-2">
           <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={radius} className="stroke-zinc-200" strokeWidth="8" fill="transparent" />
              <motion.circle 
                 cx="50" cy="50" r={radius} 
                 className={colorClass} strokeWidth="8" fill="transparent" 
                 strokeDasharray={circumference} 
                 initial={{ strokeDashoffset: circumference }}
                 animate={{ strokeDashoffset: offset }}
                 transition={{ duration: 1.5, ease: "easeOut" }}
                 strokeLinecap="round"
              />
           </svg>
           <div className="absolute inset-0 flex flex-col items-center justify-center text-black">
              <Icon size={16} className={`mb-1`} />
              <span className="text-sm font-black">{value}</span>
           </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">{label}<br/><span className="text-xs font-bold normal-case text-black">/ {max} {unit}</span></p>
     </div>
  );
};

export default function NutritionDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  
  // Nouveaux états de l'application Nutrition
  const [activeTab, setActiveTab] = useState<'today' | 'week'>('today');
  const [trackingMode, setTrackingMode] = useState<'autopilot' | 'compass'>('autopilot');
  
  // Jauges quotidiennes (Mockées, à lier avec Supabase par la suite)
  const [calories, setCalories] = useState(850);
  const [waterGlasses, setWaterGlasses] = useState(4);
  const [proteins, setProteins] = useState(45);
  
  // Bilan
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [reportData, setReportData] = useState({ followedMenu: false, cravedRice: false, drankWater: false });

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      let finalUser = session?.user;

      if (!finalUser) {
        // Fallback pour localStorage si pas de session Supabase active
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
          finalUser = JSON.parse(customSession);
        } else {
          router.push('/login');
          return;
        }
      }

      setUser({ ...finalUser, full_name: finalUser.user_metadata?.full_name || finalUser.full_name || "Membre" });

      // Récupérer le profil client complet depuis la table 'clients'
      const phoneMatch = finalUser.email?.match(/^(\+?\d+)@clients\.onyxcrm\.com$/);
      const userPhone = phoneMatch ? phoneMatch[1] : finalUser.phone;

      if (userPhone) {
        const { data: profileData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('phone', userPhone)
          .single();

        if (profileData) {
          setClientProfile(profileData);
          const trialEnds = profileData.trial_ends_at ? new Date(profileData.trial_ends_at).getTime() : 0;
          const now = new Date().getTime();
          const diffDays = Math.max(0, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24)));
          setDaysLeft(diffDays);
        }
      }

      setLoading(false);
    };

    verifyAuth();

    // Afficher un message de bienvenue après le diagnostic
    if (searchParams.get('from') === 'diagnostic') {
      alert("Félicitations et bienvenue ! Votre espace personnel est prêt.");
      // Nettoyer l'URL
      router.replace('/nutrition', undefined);
    }

  }, [router, searchParams]);

  const weeklyMenus = ALL_MENUS.map(menu => ({
    ...menu,
    status: clientProfile?.plan_type === 'premium' || menu.week <= 2 ? 'unlocked' : 'locked'
  }));
  
  const submitDailyReport = async () => {
    // Ici, vous ajouteriez l'insertion dans la table `nutrition_daily_logs`
    alert("Bilan de la journée enregistré avec succès ! L'IA adaptera votre menu de demain.");
    setShowDailyReport(false);
  };

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
                 <Clock className={daysLeft > 0 ? "text-[#39FF14]" : "text-red-500"} size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Période d'essai</p>
                 <p className="text-sm font-bold text-white"><strong className={daysLeft > 0 ? "text-[#39FF14]" : "text-red-500"}>{daysLeft > 0 ? `${daysLeft} jours` : 'Expiré'}</strong></p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-12">

        {/* NOUVEAU : SYSTÈME D'ONGLETS */}
        <div className="flex bg-zinc-200/50 p-1.5 rounded-2xl w-max mx-auto md:mx-0">
           <button onClick={() => setActiveTab('today')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'today' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Mon Jour (Dashboard)</button>
           <button onClick={() => setActiveTab('week')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'week' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Programme Semaine</button>
        </div>
        
        {activeTab === 'today' ? (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* SÉLECTEUR DE MODE & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="bg-white border border-zinc-200 p-2 rounded-2xl flex items-center shadow-sm w-full md:w-auto">
                 <button onClick={() => setTrackingMode('autopilot')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'autopilot' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}>
                    <Utensils size={16}/> Mode Autopilote
                 </button>
                 <button onClick={() => setTrackingMode('compass')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'compass' ? 'bg-black text-[#00E5FF] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}>
                    <Compass size={16}/> Mode Boussole
                 </button>
               </div>
               
               <button onClick={() => router.push('/solutions/onyx-nutritionafricaine/diagnostic')} className="bg-zinc-100 text-black border border-zinc-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-2">
                 <RefreshCcw size={14}/> Refaire mon Diagnostic
               </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl text-sm font-medium">
               <p><strong>{trackingMode === 'autopilot' ? 'Mode Autopilote (Strict) :' : 'Mode Boussole (Flexible) :'}</strong> {trackingMode === 'autopilot' ? "Idéal pour les 14 premiers jours. Suivez le menu à la lettre pour des résultats rapides." : "Vous êtes libre de composer vos repas ! Respectez simplement vos jauges de calories et protéines."}</p>
            </div>

            {/* JAUGES DU JOUR */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
               <div className="flex items-center justify-between mb-8">
                 <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3`}><Activity className="text-[#39FF14]"/> Suivi du Jour</h2>
                 <p className="text-xs font-bold text-zinc-500">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
               </div>
               <div className="flex flex-wrap justify-around gap-8">
                  <CircularProgress value={calories} max={1500} colorClass="stroke-orange-500 text-orange-500" label="Énergie" unit="kcal" icon={Flame} />
                  
                  <div className="relative cursor-pointer group" onClick={() => setWaterGlasses(prev => Math.min(prev + 1, 8))}>
                     <CircularProgress value={waterGlasses} max={8} colorClass="stroke-blue-500 text-blue-500" label="Hydratation" unit="verres" icon={Droplet} />
                     <div className="absolute inset-0 bg-black/5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="bg-blue-500 text-white text-[10px] font-black px-2 py-1 rounded-full">+1 Verre</span>
                     </div>
                  </div>
                  
                  <CircularProgress value={proteins} max={80} colorClass="stroke-purple-500 text-purple-500" label="Protéines" unit="g" icon={Target} />
               </div>
            </div>

            {/* MENU DU JOUR */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black mb-6 flex items-center gap-3`}><Utensils className="text-black"/> Mon Menu du Jour</h2>
               
               <div className="space-y-4">
                  {(trackingMode === 'autopilot' ? DAILY_MENU.autopilot : DAILY_MENU.compass).map((item, idx) => (
                     <div key={idx} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#39FF14] transition-colors">
                        <div>
                           <div className="flex items-center gap-3 mb-2">
                              <span className="bg-black text-[#39FF14] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{item.type}</span>
                              <span className="text-xs font-bold text-zinc-500 flex items-center gap-1"><Clock size={12}/> {item.time}</span>
                           </div>
                           <p className="font-bold text-sm text-black">{item.meal}</p>
                        </div>
                        {trackingMode === 'autopilot' && item.cals && (
                           <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-zinc-200 shrink-0">
                              <div className="text-center">
                                 <p className="text-[10px] font-black text-zinc-400 uppercase">Calories</p>
                                 <p className="text-sm font-black text-orange-500">{item.cals}</p>
                              </div>
                              <div className="w-px h-8 bg-zinc-200"></div>
                              <div className="text-center">
                                 <p className="text-[10px] font-black text-zinc-400 uppercase">Protéines</p>
                                 <p className="text-sm font-black text-purple-500">{item.proteins}g</p>
                              </div>
                           </div>
                        )}
                     </div>
                  ))}
               </div>
            </div>

            {/* BOUTON BILAN FIN DE JOURNÉE */}
            <button onClick={() => setShowDailyReport(true)} className="w-full bg-black text-[#39FF14] py-6 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform shadow-2xl flex items-center justify-center gap-3">
               <ListChecks size={24} /> Bilan de fin de journée
            </button>

            {/* MODALE BILAN DE FIN DE JOURNÉE */}
            {showDailyReport && (
               <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowDailyReport(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white p-8 sm:p-10 rounded-3xl max-w-lg w-full relative shadow-2xl border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto">
                     <button onClick={() => setShowDailyReport(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
                     <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter mb-2`}>Bilan Quotidien</h2>
                     <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">Soyez honnête avec vous-même !</p>

                     <div className="space-y-4">
                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${reportData.followedMenu ? 'bg-[#39FF14]/10 border-[#39FF14]' : 'bg-zinc-50 border-zinc-200 hover:border-black'}`}>
                           <div>
                              <p className="font-black text-sm uppercase">J'ai suivi le menu du jour</p>
                              <p className="text-xs text-zinc-500 font-medium mt-1">À 80% ou plus.</p>
                           </div>
                           <input type="checkbox" checked={reportData.followedMenu} onChange={e => setReportData({...reportData, followedMenu: e.target.checked})} className="w-6 h-6 accent-black cursor-pointer" />
                        </label>

                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${reportData.drankWater ? 'bg-blue-50 border-blue-500' : 'bg-zinc-50 border-zinc-200 hover:border-black'}`}>
                           <div>
                              <p className="font-black text-sm uppercase">J'ai bu mon eau</p>
                              <p className="text-xs text-zinc-500 font-medium mt-1">Au moins 6 verres dans la journée.</p>
                           </div>
                           <input type="checkbox" checked={reportData.drankWater} onChange={e => setReportData({...reportData, drankWater: e.target.checked})} className="w-6 h-6 accent-blue-600 cursor-pointer" />
                        </label>

                        <label className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${reportData.cravedRice ? 'bg-red-50 border-red-500' : 'bg-zinc-50 border-zinc-200 hover:border-black'}`}>
                           <div>
                              <p className="font-black text-sm uppercase">J'ai craqué sur le riz/sucre</p>
                              <p className="text-xs text-zinc-500 font-medium mt-1">J'ai dépassé mes portions recommandées.</p>
                           </div>
                           <input type="checkbox" checked={reportData.cravedRice} onChange={e => setReportData({...reportData, cravedRice: e.target.checked})} className="w-6 h-6 accent-red-600 cursor-pointer" />
                        </label>
                     </div>

                     <button onClick={submitDailyReport} className="w-full mt-8 bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                        <CheckCircle size={20} /> Valider ma journée
                     </button>
                  </div>
               </div>
            )}

          </div>
        ) : (
          <div className="space-y-12 animate-in fade-in slide-in-from-right-4">
            
            {/* SECTION GUIDE PDF */}
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

            {/* SECTION MENUS DE LA SEMAINE */}
            <section>
           <div className="flex items-center gap-3 mb-8">
              <Calendar className="text-[#39FF14] bg-black p-2 rounded-lg" size={36} />
              <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Vos Menus Sur-Mesure</h2>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              {weeklyMenus.map((menu, idx) => (
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
        )}
      </div>
    </main>
  );
}
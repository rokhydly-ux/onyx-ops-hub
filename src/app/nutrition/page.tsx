"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ChevronLeft, Download, Lock, CheckCircle, 
  Activity, Calendar, Clock, ArrowRight, Sparkles, HeartPulse, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, X, BarChart, Settings, Save, Award, MessageCircle, AlertCircle
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
      { type: 'Petit-déjeuner', time: '08:00', meal: 'Bouillie de Mil (Lakh) allégée', cals: 300, proteins: 8, carbs: 50, fats: 5, recipe: "Faire bouillir 50g de mil avec de l'eau. Ajouter un filet de lait demi-écrémé et de la noix de muscade." },
      { type: 'Déjeuner', time: '13:30', meal: 'Thieboudienne Diététique', cals: 600, proteins: 35, carbs: 70, fats: 15, recipe: "Utiliser 1/4 d'assiette de riz brisé (ou de fonio). Beaucoup de légumes (chou, carotte). Morceau de poisson de 150g. Limiter l'huile à 1 cuillère à soupe par personne." },
      { type: 'Collation', time: '16:00', meal: 'Poignée d\'arachides', cals: 150, proteins: 5, carbs: 10, fats: 12, recipe: "Une petite poignée de cacahuètes grillées sans sel (environ 20g)." },
      { type: 'Dîner', time: '19:30', meal: 'Salade de Niébé', cals: 400, proteins: 20, carbs: 45, fats: 10, recipe: "Mélanger 100g de niébé cuit avec des tomates, concombres, oignons. Vinaigrette : 1 càc d'huile d'olive, citron, sel, poivre." },
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
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'history' | 'profile'>('today');
  const [trackingMode, setTrackingMode] = useState<'autopilot' | 'compass'>('autopilot');
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  
  // Jauges quotidiennes
  const [calories, setCalories] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  
  // Bilan
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [reportData, setReportData] = useState({ followedMenu: false, cravedRice: false, drankWater: false });
  const [selectedMealModal, setSelectedMealModal] = useState<any>(null);
  
  // Objectifs
  const [calorieGoal, setCalorieGoal] = useState(1500);
  const [proteinGoal, setProteinGoal] = useState(80);
  const [carbsGoal, setCarbsGoal] = useState(150);
  const [fatsGoal, setFatsGoal] = useState(50);
  
  const [profileForm, setProfileForm] = useState({ full_name: "", avatar_url: "", password: "" });
  const [showReminder, setShowReminder] = useState(false);

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
      setProfileForm({
         full_name: finalUser.user_metadata?.full_name || finalUser.full_name || "",
         avatar_url: finalUser.user_metadata?.avatar_url || finalUser.avatar_url || "",
         password: ""
      });

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

          // Récupération de l'historique des logs journaliers
          const { data: logsData } = await supabase
            .from('nutrition_daily_logs')
            .select('*')
            .eq('client_id', profileData.id)
            .order('log_date', { ascending: true });

          if (logsData) {
            setDailyLogs(logsData);
            
            const todayStr = new Date().toISOString().split('T')[0];
            const todayLog = logsData.find(log => log.log_date === todayStr);
            if (todayLog) {
              setCalories(todayLog.calories_consumed || 0);
              setWaterGlasses(todayLog.water_glasses || 0);
              setProteins(todayLog.proteins_consumed || 0);
              setCarbs(todayLog.carbs_consumed || 0);
              setFats(todayLog.fats_consumed || 0);
              if (todayLog.report_data) setReportData(todayLog.report_data);
            }
          }

          // Récupérer le profil nutritionnel (via Supabase ou localStorage)
          const { data: nutritionData } = await supabase
            .from('nutrition_profiles')
            .select('*')
            .eq('phone', userPhone)
            .single();

          if (nutritionData) {
             setCalorieGoal(nutritionData.daily_calorie_goal || 1500);
             setProteinGoal(nutritionData.protein_goal || 80);
             setCarbsGoal(nutritionData.carbs_goal || 150);
             setFatsGoal(nutritionData.fats_goal || 50);
          } else {
             const localGoals = localStorage.getItem('onyx_nutrition_goals');
             if (localGoals) {
                try {
                   const parsed = JSON.parse(localGoals);
                   if (parsed.calories) setCalorieGoal(Math.round(parsed.calories));
                   if (parsed.protein) setProteinGoal(Math.round(parsed.protein));
                   if (parsed.carbs) setCarbsGoal(Math.round(parsed.carbs));
                   if (parsed.fats) setFatsGoal(Math.round(parsed.fats));
                } catch (e) {}
             }
          }
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

  // Système de relance automatique (Notification à 20h00)
  useEffect(() => {
    const checkReminder = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hasLoggedToday = dailyLogs.some(log => log.log_date === todayStr && log.report_data);
      
      if (now.getHours() >= 20 && !hasLoggedToday) {
        setShowReminder(true);
      } else {
        setShowReminder(false);
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000); // Vérification chaque minute
    return () => clearInterval(interval);
  }, [dailyLogs]);

  const weeklyMenus = ALL_MENUS.map(menu => ({
    ...menu,
    status: clientProfile?.plan_type === 'premium' || menu.week <= 2 ? 'unlocked' : 'locked'
  }));

  const handleAddWater = async () => {
    if (!clientProfile) return;
    const newAmount = Math.min(waterGlasses + 1, 8);
    setWaterGlasses(newAmount);
    const todayStr = new Date().toISOString().split('T')[0];
    
    await supabase.from('nutrition_daily_logs').upsert({
      client_id: clientProfile.id,
      log_date: todayStr,
      water_glasses: newAmount,
      calories_consumed: calories,
      proteins_consumed: proteins
    }, { onConflict: 'client_id, log_date' });
    
    setDailyLogs(prev => {
      const filtered = prev.filter(l => l.log_date !== todayStr);
      const existing = prev.find(l => l.log_date === todayStr) || {};
      return [...filtered, { ...existing, client_id: clientProfile.id, log_date: todayStr, water_glasses: newAmount, calories_consumed: calories, proteins_consumed: proteins }];
    });
  };
  
  const handleMealClick = (mealType: string, plannedMeal: any) => {
      setSelectedMealModal({ type: mealType, meal: plannedMeal, mode: trackingMode });
  };

  const confirmMealLog = async (cals: number, prots: number, mealCarbs: number, mealFats: number) => {
      const newCals = calories + cals;
      const newProts = proteins + prots;
      const newCarbs = carbs + mealCarbs;
      const newFats = fats + mealFats;
      
      setCalories(newCals);
      setProteins(newProts);
      setCarbs(newCarbs);
      setFats(newFats);
      
      setSelectedMealModal(null);
      
      if (clientProfile) {
          const todayStr = new Date().toISOString().split('T')[0];
          await supabase.from('nutrition_daily_logs').upsert({
            client_id: clientProfile.id,
            log_date: todayStr,
            calories_consumed: newCals,
            proteins_consumed: newProts,
            carbs_consumed: newCarbs,
            fats_consumed: newFats
          }, { onConflict: 'client_id, log_date' });
      }
  };

  const submitDailyReport = async () => {
    if (!clientProfile) return;
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Valeurs simulées du menu respecté pour l'exemple
    let currentCals = calories;
    let currentProts = proteins;
    if (reportData.followedMenu && currentCals === 0) {
        currentCals = calorieGoal;
        currentProts = proteinGoal;
        setCalories(currentCals);
        setProteins(currentProts);
    }

    const { error } = await supabase.from('nutrition_daily_logs').upsert({
      client_id: clientProfile.id,
      log_date: todayStr,
      report_data: reportData,
      water_glasses: waterGlasses,
      calories_consumed: currentCals,
      proteins_consumed: currentProts
    }, { onConflict: 'client_id, log_date' });

    if (!error) {
       alert("Bilan de la journée enregistré avec succès ! L'IA adaptera votre menu de demain.");
       setShowDailyReport(false);
       const updatedLog = { client_id: clientProfile.id, log_date: todayStr, report_data: reportData, water_glasses: waterGlasses, calories_consumed: currentCals, proteins_consumed: currentProts };
       setDailyLogs(prev => [...prev.filter(l => l.log_date !== todayStr), updatedLog]);
    } else {
       alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      // 1. Mise à jour du mot de passe dans Supabase Auth (si renseigné)
      if (profileForm.password) {
        await supabase.auth.updateUser({ password: profileForm.password });
      }

      // 2. Mise à jour des métadonnées (photo et nom)
      await supabase.auth.updateUser({
        data: { full_name: profileForm.full_name, avatar_url: profileForm.avatar_url }
      });

      // 3. Mise à jour de la table clients
      if (clientProfile) {
        await supabase.from('clients').update({
          full_name: profileForm.full_name,
          avatar_url: profileForm.avatar_url
        }).eq('id', clientProfile.id);
      }

      setUser({ ...user, full_name: profileForm.full_name, avatar_url: profileForm.avatar_url });
      alert("Profil mis à jour avec succès !");
      setProfileForm({ ...profileForm, password: "" });
    } catch (error) {
      console.error("Erreur lors de la mise à jour :", error);
      alert("Une erreur est survenue lors de la mise à jour.");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Activity className="animate-spin text-[#39FF14]" size={40} /></div>;
  }

  const remainingCalories = Math.max(0, calorieGoal - calories);

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
              <div className="flex items-center gap-4">
                <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=" + (user?.full_name || "Membre")} alt="Profil" className="w-16 h-16 rounded-full border-4 border-[#39FF14] object-cover bg-zinc-800" />
                <h1 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase tracking-tighter`}>
                  Bonjour, <span className="text-white">{user?.full_name?.split(' ')[0] || 'Membre'}</span> !
                </h1>
              </div>
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
           <button onClick={() => setActiveTab('history')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'history' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Historique</button>
           <button onClick={() => setActiveTab('profile')} className={`px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'profile' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Profil & Réglages</button>
        </div>
        
        {activeTab === 'today' && (
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
            <div className="bg-black p-8 rounded-[2rem] border border-zinc-800 shadow-2xl text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 blur-[50px] rounded-full"></div>
               
               <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase tracking-tighter text-white flex items-center justify-center gap-3 mb-6`}><Activity className="text-[#39FF14]"/> Synthèse Journalière</h2>
               
               {/* JAUGE CENTRALE (CALORIES) */}
               <div className="relative w-48 h-48 mx-auto mb-8">
                   <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="stroke-zinc-800" strokeWidth="6" fill="transparent" />
                      <motion.circle 
                         cx="50" cy="50" r="40" 
                         className="stroke-[#39FF14] text-[#39FF14]" strokeWidth="6" fill="transparent" 
                         strokeDasharray={2 * Math.PI * 40} 
                         strokeDashoffset={(2 * Math.PI * 40) - (Math.min(remainingCalories / calorieGoal, 1) * (2 * Math.PI * 40))}
                         initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                         animate={{ strokeDashoffset: (2 * Math.PI * 40) - (Math.min(remainingCalories / calorieGoal, 1) * (2 * Math.PI * 40)) }}
                         transition={{ duration: 1.5, ease: "easeOut" }}
                         strokeLinecap="round"
                      />
                   </svg>
                   <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                      <span className="text-4xl font-black">{remainingCalories}</span>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Kcal Restantes</span>
                   </div>
               </div>

               {/* MINI-JAUGES MACROS */}
               <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
                   <div className="text-left">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                         <span className="text-yellow-600">Glucides</span>
                         <span className="text-zinc-400">{carbs} / {carbsGoal}g</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                         <div className="bg-yellow-600 h-full" style={{ width: `${Math.min((carbs/carbsGoal)*100, 100)}%` }}></div>
                      </div>
                   </div>
                   <div className="text-left">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                         <span className="text-[#39FF14]">Protéines</span>
                         <span className="text-zinc-400">{proteins} / {proteinGoal}g</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                         <div className="bg-[#39FF14] h-full" style={{ width: `${Math.min((proteins/proteinGoal)*100, 100)}%` }}></div>
                      </div>
                   </div>
                   <div className="text-left">
                      <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                         <span className="text-zinc-300">Lipides</span>
                         <span className="text-zinc-400">{fats} / {fatsGoal}g</span>
                      </div>
                      <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                         <div className="bg-zinc-300 h-full" style={{ width: `${Math.min((fats/fatsGoal)*100, 100)}%` }}></div>
                      </div>
                   </div>
               </div>
            </div>

            {/* CORPS : LES REPAS */}
            <div className="grid md:grid-cols-2 gap-4">
                {['Petit-déjeuner', 'Déjeuner', 'Collation', 'Dîner'].map((mealType) => {
                    const plannedMeal = DAILY_MENU.autopilot.find(m => m.type === mealType);
                    
                    return (
                       <div key={mealType} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition-colors cursor-pointer" onClick={() => handleMealClick(mealType, plannedMeal)}>
                          <div className="flex justify-between items-center mb-4">
                             <span className="bg-zinc-100 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{mealType}</span>
                             {trackingMode === 'autopilot' && plannedMeal && (
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-1"><Clock size={12}/> {plannedMeal.time}</span>
                             )}
                          </div>
                          
                          {trackingMode === 'autopilot' && plannedMeal ? (
                             <div>
                                <p className="font-black text-lg text-black mb-2">{plannedMeal.meal}</p>
                                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                                   <span className="flex items-center gap-1 text-orange-500"><Flame size={14}/> {plannedMeal.cals} kcal</span>
                                   <span className="flex items-center gap-1 text-[#39FF14]"><Target size={14}/> {plannedMeal.proteins}g prot</span>
                                </div>
                             </div>
                          ) : (
                             <div className="flex flex-col items-center justify-center py-4 border-2 border-dashed border-zinc-200 rounded-xl hover:border-black hover:bg-zinc-50 transition-colors">
                                <span className="text-2xl mb-2 text-zinc-300">+</span>
                                <span className="text-xs font-black uppercase tracking-widest text-zinc-500">Ajouter un aliment</span>
                             </div>
                          )}
                       </div>
                    );
                })}
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

            {/* MODALE REPAS (LOGGING) */}
            {selectedMealModal && (
               <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setSelectedMealModal(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                  <div className="bg-white p-8 sm:p-10 rounded-3xl max-w-md w-full relative shadow-2xl border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto">
                     <button onClick={() => setSelectedMealModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
                     <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter mb-2`}>{selectedMealModal.type}</h2>
                     
                     {selectedMealModal.mode === 'autopilot' && selectedMealModal.meal ? (
                         <>
                             <p className="text-sm font-bold text-zinc-500 mb-6">{selectedMealModal.meal.meal}</p>
                             <div className="bg-zinc-50 p-5 rounded-2xl border border-zinc-200 mb-6">
                                <h4 className="font-black text-xs uppercase tracking-widest text-zinc-400 mb-2">Recette / Consignes</h4>
                                <p className="text-sm font-medium text-zinc-700 leading-relaxed">{selectedMealModal.meal.recipe}</p>
                             </div>
                             <div className="grid grid-cols-4 gap-2 mb-8 text-center">
                                <div className="bg-orange-50 p-2 rounded-xl border border-orange-100"><p className="text-[9px] font-black uppercase text-orange-400">Kcal</p><p className="font-black text-orange-600">{selectedMealModal.meal.cals}</p></div>
                                <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-100"><p className="text-[9px] font-black uppercase text-yellow-500">Gluc</p><p className="font-black text-yellow-700">{selectedMealModal.meal.carbs}g</p></div>
                                <div className="bg-green-50 p-2 rounded-xl border border-green-100"><p className="text-[9px] font-black uppercase text-green-500">Prot</p><p className="font-black text-green-700">{selectedMealModal.meal.proteins}g</p></div>
                                <div className="bg-zinc-100 p-2 rounded-xl border border-zinc-200"><p className="text-[9px] font-black uppercase text-zinc-400">Lip</p><p className="font-black text-zinc-600">{selectedMealModal.meal.fats}g</p></div>
                             </div>
                             <button onClick={() => confirmMealLog(selectedMealModal.meal.cals, selectedMealModal.meal.proteins, selectedMealModal.meal.carbs, selectedMealModal.meal.fats)} className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                                <CheckCircle size={20} /> J'ai mangé ça !
                             </button>
                         </>
                     ) : (
                         <>
                             <p className="text-sm font-bold text-zinc-500 mb-6">Mode Flexible : Entrez les macros de votre repas.</p>
                             <div className="space-y-4 mb-8">
                                <div><label className="text-[10px] font-black uppercase text-zinc-500">Nom du plat</label><input type="text" id="flex_name" className="w-full p-3 bg-zinc-50 border rounded-xl font-bold text-sm" placeholder="Ex: Salade composée"/></div>
                                <div className="grid grid-cols-2 gap-4">
                                   <div><label className="text-[10px] font-black uppercase text-orange-500">Calories (kcal)</label><input type="number" id="flex_cals" defaultValue={300} className="w-full p-3 bg-zinc-50 border rounded-xl font-bold text-sm"/></div>
                                   <div><label className="text-[10px] font-black uppercase text-green-500">Protéines (g)</label><input type="number" id="flex_prots" defaultValue={15} className="w-full p-3 bg-zinc-50 border rounded-xl font-bold text-sm"/></div>
                                   <div><label className="text-[10px] font-black uppercase text-yellow-600">Glucides (g)</label><input type="number" id="flex_carbs" defaultValue={30} className="w-full p-3 bg-zinc-50 border rounded-xl font-bold text-sm"/></div>
                                   <div><label className="text-[10px] font-black uppercase text-zinc-400">Lipides (g)</label><input type="number" id="flex_fats" defaultValue={10} className="w-full p-3 bg-zinc-50 border rounded-xl font-bold text-sm"/></div>
                                </div>
                             </div>
                             <button onClick={() => {
                                 const cals = parseInt((document.getElementById('flex_cals') as HTMLInputElement).value) || 0;
                                 const prots = parseInt((document.getElementById('flex_prots') as HTMLInputElement).value) || 0;
                                 const carbs = parseInt((document.getElementById('flex_carbs') as HTMLInputElement).value) || 0;
                                 const fats = parseInt((document.getElementById('flex_fats') as HTMLInputElement).value) || 0;
                                 confirmMealLog(cals, prots, carbs, fats);
                             }} className="w-full bg-black text-[#00E5FF] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                                <CheckCircle size={20} /> Ajouter au tracker
                             </button>
                         </>
                     )}
                  </div>
               </div>
            )}

          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4">
            
            {/* BADGES ET GAMIFICATION */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
               <div>
                  <h3 className="text-lg font-black uppercase text-black mb-2 flex items-center gap-2"><Award className="text-yellow-500" size={24}/> Badges & Récompenses</h3>
                  <p className="text-sm text-zinc-500 font-medium mb-4">Cumulez des jours parfaits (suivi du menu et hydratation) pour débloquer des trophées.</p>
                  <div className="flex gap-2">
                     {Array.from({length: 7}, (_, i) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - i));
                        const dateStr = d.toISOString().split('T')[0];
                        const log = dailyLogs.find(l => l.log_date === dateStr);
                        const isPerfect = log?.report_data?.followedMenu && log?.water_glasses >= 6;
                        return (
                           <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black uppercase ${isPerfect ? 'bg-[#39FF14] text-black shadow-sm' : 'bg-zinc-100 text-zinc-400'}`}>
                              {d.toLocaleDateString('fr-FR', {weekday:'narrow'})}
                           </div>
                        );
                     })}
                  </div>
               </div>
               <div className="flex gap-4">
                  <div className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center min-w-[120px] transition-all ${dailyLogs.filter(l => l.report_data?.followedMenu && l.water_glasses >= 6).length >= 5 ? 'bg-yellow-50 border-yellow-400 text-yellow-600 shadow-md scale-105' : 'bg-zinc-50 border-zinc-200 text-zinc-400 opacity-60'}`}>
                     <Award size={36} className="mb-2" />
                     <span className="text-[10px] font-black uppercase text-center leading-tight">Semaine<br/>Parfaite</span>
                  </div>
               </div>
            </div>
            
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-8`}>
                  <BarChart className="text-[#39FF14]" /> Évolution sur 7 jours
               </h2>
               
               <div className="grid md:grid-cols-2 gap-8">
                  {/* GRAPHIQUE : Hydratation */}
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                     <h3 className="text-sm font-black uppercase text-zinc-500 mb-6 flex items-center gap-2"><Droplet size={16}/> Hydratation (Verres)</h3>
                     <div className="flex items-end justify-between h-40 gap-2">
                        {Array.from({length: 7}, (_, i) => {
                           const d = new Date();
                           d.setDate(d.getDate() - (6 - i));
                           const dateStr = d.toISOString().split('T')[0];
                           const log = dailyLogs.find(l => l.log_date === dateStr);
                           const count = log?.water_glasses || 0;
                           const heightPct = Math.min((count / 8) * 100, 100);
                           return (
                              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                 <div className="w-full max-w-[30px] bg-blue-500 rounded-t-lg transition-all duration-500 relative group-hover:bg-blue-400" style={{ height: `${heightPct}%`, minHeight: '4px' }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                       {count} verres
                                    </div>
                                 </div>
                                 <span className="mt-3 text-[10px] font-bold text-zinc-400 uppercase">{d.toLocaleDateString('fr-FR', {weekday:'short'})}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* GRAPHIQUE : Calories */}
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                     <h3 className="text-sm font-black uppercase text-zinc-500 mb-6 flex items-center gap-2"><Flame size={16}/> Calories Consommées</h3>
                     <div className="flex items-end justify-between h-40 gap-2">
                        {Array.from({length: 7}, (_, i) => {
                           const d = new Date();
                           d.setDate(d.getDate() - (6 - i));
                           const dateStr = d.toISOString().split('T')[0];
                           const log = dailyLogs.find(l => l.log_date === dateStr);
                           const count = log?.calories_consumed || 0;
                           const target = calorieGoal;
                           const heightPct = count > 0 ? Math.min((count / target) * 100, 100) : 0;
                           return (
                              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                 <div className={`w-full max-w-[30px] rounded-t-lg transition-all duration-500 relative ${count > target ? 'bg-red-500 group-hover:bg-red-400' : 'bg-orange-500 group-hover:bg-orange-400'}`} style={{ height: `${heightPct}%`, minHeight: '4px' }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                       {count} kcal
                                    </div>
                                 </div>
                                 <span className="mt-3 text-[10px] font-bold text-zinc-400 uppercase">{d.toLocaleDateString('fr-FR', {weekday:'short'})}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </div>

            {/* LISTE DES BILANS */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-6`}><ListChecks className="text-black"/> Historique des Bilans</h2>
               <div className="space-y-4">
                  {[...dailyLogs].sort((a,b) => new Date(b.log_date).getTime() - new Date(a.log_date).getTime()).map((log, idx) => (
                     <div key={idx} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                           <p className="font-black text-sm text-black mb-1">{new Date(log.log_date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                           <div className="flex flex-wrap gap-2 mt-2">
                              {log.report_data?.followedMenu ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">Menu suivi</span> : <span className="bg-zinc-200 text-zinc-600 px-2 py-1 rounded text-[10px] font-black uppercase">Non suivi</span>}
                              {log.report_data?.drankWater ? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase">Eau respectée</span> : null}
                              {log.report_data?.cravedRice ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black uppercase">Craquage</span> : null}
                           </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-bold text-zinc-500">
                           <span className="flex items-center gap-1"><Flame size={14}/> {log.calories_consumed || 0} kcal</span>
                           <span className="flex items-center gap-1"><Droplet size={14}/> {log.water_glasses || 0}/8</span>
                        </div>
                     </div>
                  ))}
                  {dailyLogs.length === 0 && (
                     <p className="text-sm text-zinc-500 font-medium italic">Aucun bilan enregistré pour le moment.</p>
                  )}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'week' && (
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

        {activeTab === 'profile' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-8`}><Settings className="text-black"/> Profil & Réglages</h2>
                
                <form onSubmit={handleSaveProfile} className="space-y-6 max-w-xl">
                   <div className="flex items-center gap-6 mb-8">
                      <img src={profileForm.avatar_url || "https://ui-avatars.com/api/?name=" + (profileForm.full_name || "M")} className="w-24 h-24 rounded-full object-cover border-4 border-zinc-100 shadow-sm" />
                      <div className="flex-1">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">URL de la photo de profil</label>
                         <input type="url" value={profileForm.avatar_url} onChange={e => setProfileForm({...profileForm, avatar_url: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" placeholder="https://..." />
                      </div>
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Nom complet</label>
                      <input type="text" value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" required />
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Nouveau mot de passe</label>
                      <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" placeholder="Laissez vide pour ne pas modifier" />
                   </div>

                   <button type="submit" className="bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition shadow-lg flex items-center gap-2">
                      <Save size={16} /> Enregistrer les modifications
                   </button>
                </form>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                   <h3 className="text-lg font-black uppercase text-black mb-4 flex items-center gap-2"><Target className="text-[#39FF14]"/> Mes Objectifs</h3>
                   <div className="space-y-4">
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                         <span className="text-sm font-bold text-zinc-500">Objectif Calories</span>
                         <span className="font-black text-black">{calorieGoal} kcal / jour</span>
                      </div>
                      <div className="flex justify-between items-center border-b border-zinc-100 pb-3">
                         <span className="text-sm font-bold text-zinc-500">Objectif Protéines</span>
                         <span className="font-black text-black">{proteinGoal} g / jour</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-sm font-bold text-zinc-500">Hydratation</span>
                         <span className="font-black text-black">8 verres / jour</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                   <h3 className="text-lg font-black uppercase text-black mb-4 flex items-center gap-2"><MessageCircle className="text-blue-500"/> Échange & Support</h3>
                   <p className="text-sm font-medium text-zinc-600 mb-6">Rejoignez notre communauté bienveillante pour partager vos repas, vos victoires et vos questions avec les coachs.</p>
                   <div className="space-y-3">
                      <button onClick={() => window.open('https://chat.whatsapp.com/', '_blank')} className="w-full bg-[#25D366] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#1ebd58] transition shadow-md flex justify-center items-center gap-2">
                         Communauté WhatsApp
                      </button>
                      <button onClick={() => window.open('https://facebook.com/groups/', '_blank')} className="w-full bg-[#1877F2] text-white py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-[#155fc0] transition shadow-md flex justify-center items-center gap-2">
                         Groupe Facebook Privé
                      </button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* FLOATING REMINDER */}
      {showReminder && (
         <div className="fixed bottom-6 right-6 z-[100] bg-black text-white p-4 rounded-2xl shadow-2xl border-l-4 border-red-500 max-w-sm flex items-start gap-4 animate-in slide-in-from-right-8">
            <AlertCircle className="text-red-500 shrink-0" size={24} />
            <div>
               <h4 className="font-black uppercase text-sm mb-1">Bilan en attente !</h4>
               <p className="text-xs text-zinc-400 font-medium mb-3">Il est plus de 20h00, n'oubliez pas de remplir votre bilan de fin de journée pour adapter votre menu de demain.</p>
               <div className="flex gap-2">
                  <button onClick={() => { setShowReminder(false); setActiveTab('today'); setShowDailyReport(true); }} className="bg-[#39FF14] text-black px-4 py-2 rounded-lg font-black text-[10px] uppercase transition-transform hover:scale-105">Remplir maintenant</button>
                  <button onClick={() => setShowReminder(false)} className="text-zinc-500 hover:text-white px-2 py-2 rounded-lg font-bold text-[10px] uppercase">Plus tard</button>
               </div>
            </div>
         </div>
      )}
    </main>
  );
}
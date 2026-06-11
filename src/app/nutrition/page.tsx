"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ChevronLeft, Download, Lock, CheckCircle, 
  Activity, Calendar, Clock, ArrowRight, Sparkles, HeartPulse, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, X, BarChart, Settings, Save, Award, MessageCircle, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, Image as ImageIcon, Trophy, CreditCard, ScanLine, Loader2
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
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

// ÉTAPE 3 : Base de données JSON (Aliments Locaux & Flags IA)
const FOOD_DATABASE = [
  {
    id: "food_001", nom: "Fonio entier (sec)", categorie: "Céréales & Féculents",
    portion_standard_nom: "1 Bol (cuit)", portion_standard_grammes: 150,
    valeurs_pour_100g: { calories: 345, glucides: 75, lipides: 1.2, proteines: 7, fibres: 3.8, sodium_mg: 5 },
    flags_ia: { is_local_senegal: true, ig_bas: true, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Excellent choix ! Le fonio ne fera pas exploser ton insuline."
  },
  {
    id: "food_002", nom: "Riz brisé local (Non étuvé)", categorie: "Céréales & Féculents",
    portion_standard_nom: "1 Louche", portion_standard_grammes: 80,
    valeurs_pour_100g: { calories: 350, glucides: 78, lipides: 0.6, proteines: 7, fibres: 1, sodium_mg: 2 },
    flags_ia: { is_local_senegal: true, ig_bas: false, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Le riz brisé est digéré très vite. Assure-toi d'avoir beaucoup de légumes (fibres) dans ton assiette pour compenser."
  },
  {
    id: "food_003", nom: "Cube de bouillon (Type Maggi/Jumbo)", categorie: "Condiments & Sauces",
    portion_standard_nom: "1/2 Cube", portion_standard_grammes: 5,
    valeurs_pour_100g: { calories: 170, glucides: 15, lipides: 5, proteines: 10, fibres: 0, sodium_mg: 52000 },
    flags_ia: { is_local_senegal: false, ig_bas: null, high_sodium: true, ultra_transforme: true },
    message_coach_ia: "Alerte ! Ces cubes favorisent la rétention d'eau et gonflent le ventre. Essaie les épices pures ou le Soumbala (Nététou)."
  },
  {
    id: "food_004", nom: "Thiof (Mérou blanc frais)", categorie: "Protéines",
    portion_standard_nom: "1 Tranche moyenne", portion_standard_grammes: 120,
    valeurs_pour_100g: { calories: 92, glucides: 0, lipides: 1, proteines: 20.5, fibres: 0, sodium_mg: 60 },
    flags_ia: { is_local_senegal: true, ig_bas: true, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Une protéine parfaite et ultra-maigre. Idéal pour construire du muscle sans stocker de gras."
  },
  {
    id: "food_005", nom: "Soumbala / Nététou", categorie: "Condiments & Sauces",
    portion_standard_nom: "1 Cuillère à café", portion_standard_grammes: 5,
    valeurs_pour_100g: { calories: 300, glucides: 16, lipides: 18, proteines: 35, fibres: 5, sodium_mg: 150 },
    flags_ia: { is_local_senegal: true, ig_bas: true, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Le secret de nos grands-mères ! Un exhausteur de goût naturel qui protège ton cœur."
  },
  {
    id: "food_006", nom: "Fleurs de Bissap Rouge (Infusion sans sucre)", categorie: "Boissons",
    portion_standard_nom: "1 Grand Verre", portion_standard_grammes: 250,
    valeurs_pour_100g: { calories: 0, glucides: 0, lipides: 0, proteines: 0, fibres: 0, sodium_mg: 2 },
    flags_ia: { is_local_senegal: true, ig_bas: true, high_sodium: false, ultra_transforme: false },
    message_coach_ia: "Excellent diurétique naturel. Parfait pour dégonfler, à condition de ne pas y ajouter de sucre blanc !"
  }
];

// ÉTAPE 4 : Base de Données des Recettes pour le Générateur
const RECIPES_DB = [
  { id: "r1", type: "Petit-déjeuner", nom: "Lakh allégé", calories: 300, is_bol_commun: false, ingredients: [{nom: "Mil", quantite: 50, unite: "g", rayon: "Marché local"}, {nom: "Lait demi-écrémé", quantite: 50, unite: "ml", rayon: "Supermarché"}, {nom: "Noix de muscade", quantite: 1, unite: "pincée", rayon: "Supermarché"}] },
  { id: "r2", type: "Petit-déjeuner", nom: "Flocons d'avoine & Banane", calories: 320, is_bol_commun: false, ingredients: [{nom: "Flocons d'avoine", quantite: 40, unite: "g", rayon: "Supermarché"}, {nom: "Banane", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "r3", type: "Déjeuner", nom: "Thieboudienne (Option Fonio)", calories: 600, is_bol_commun: true, ingredients: [{nom: "Thiof (Poisson)", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 80, unite: "g", rayon: "Marché local"}, {nom: "Chou", quantite: 0.5, unite: "pièce", rayon: "Marché local"}, {nom: "Huile de colza", quantite: 1, unite: "càs", rayon: "Supermarché"}, {nom: "Carotte", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "r4", type: "Déjeuner", nom: "Mafé allégé au Poulet", calories: 550, is_bol_commun: true, ingredients: [{nom: "Blanc de Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Pâte d'arachide", quantite: 30, unite: "g", rayon: "Supermarché"}, {nom: "Riz brisé", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Oignon", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "r5", type: "Déjeuner", nom: "Salade de Fonio au Poulet", calories: 450, is_bol_commun: false, ingredients: [{nom: "Poulet", quantite: 150, unite: "g", rayon: "Boucherie / Pêche"}, {nom: "Fonio", quantite: 60, unite: "g", rayon: "Marché local"}, {nom: "Tomate", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Moutarde", quantite: 1, unite: "càc", rayon: "Supermarché"}] },
  { id: "r6", type: "Dîner", nom: "Salade de Niébé fraîcheur", calories: 400, is_bol_commun: false, ingredients: [{nom: "Niébé (Haricots)", quantite: 100, unite: "g", rayon: "Marché local"}, {nom: "Concombre", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Vinaigre", quantite: 1, unite: "càs", rayon: "Supermarché"}] },
  { id: "r7", type: "Dîner", nom: "Soupe de légumes locaux", calories: 300, is_bol_commun: false, ingredients: [{nom: "Carotte", quantite: 2, unite: "pièce", rayon: "Marché local"}, {nom: "Navet", quantite: 1, unite: "pièce", rayon: "Marché local"}, {nom: "Poireau", quantite: 1, unite: "pièce", rayon: "Marché local"}] },
  { id: "r8", type: "Collation", nom: "Poignée d'Arachides", calories: 150, is_bol_commun: false, ingredients: [{nom: "Arachides grillées", quantite: 30, unite: "g", rayon: "Marché local"}] },
  { id: "r9", type: "Collation", nom: "Fruit de saison", calories: 100, is_bol_commun: false, ingredients: [{nom: "Fruit au choix (Mangue, etc)", quantite: 1, unite: "pièce", rayon: "Marché local"}] }
];

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
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'history' | 'profile' | 'weight' | 'community' | 'favorites' | 'coaching'>('today');
  const [trackingMode, setTrackingMode] = useState<'guided' | 'flexible'>('guided');
  const [dailyLogs, setDailyLogs] = useState<any[]>([]);
  const [showRedoDiagModal, setShowRedoDiagModal] = useState(false);
  const [redoReason, setRedoReason] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  
  // Jauges quotidiennes
  const [calories, setCalories] = useState(0);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [proteins, setProteins] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  
  // Bilan
  const [showDailyReport, setShowDailyReport] = useState(false);
  const [reportData, setReportData] = useState({ followedMenu: false, cravedRice: false, drankWater: false });
  const [consumedMeals, setConsumedMeals] = useState<any[]>([]);
  const [selectedMealModal, setSelectedMealModal] = useState<any>(null);
  
  // Moteur de recherche et portions
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const [selectedFoodDB, setSelectedFoodDB] = useState<any>(null);
  const [foodQuantity, setFoodQuantity] = useState(1);

  // Coach IA "Rokhy"
  const [rokhyMessage, setRokhyMessage] = useState<{title: string, text: string, type: 'warning'|'success'|'info'} | null>(null);

  // --- NOTIFICATIONS PUSH PWA ---
  const sendWaterReminderPush = () => {
    if (typeof window !== 'undefined' && 'Notification' in window && navigator.serviceWorker) {
       Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
             navigator.serviceWorker.ready.then(registration => {
                registration.showNotification("💧 C'est l'heure de s'hydrater !", {
                   body: "N'oublie pas de boire ton verre d'eau pour atteindre ton objectif aujourd'hui. Ton métabolisme te dira merci !",
                   icon: "https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png",
                   badge: "https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png",
                   vibrate: [200, 100, 200]
                });
             });
          }
       });
    }
  };

  // Gamification & Feed Communautaire
  const [jongomaXP, setJongomaXP] = useState(0);
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [currentWeightInput, setCurrentWeightInput] = useState<number>(75);
  const [newPostText, setNewPostText] = useState("");
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [newPostImage, setNewPostImage] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [communityPosts, setCommunityPosts] = useState<any[]>([
     { id: "1", client: "Aïssatou K.", content: "Thieboudienne revisité au Fonio pour ce midi ! L'astuce de la sauce sans huile change tout.", created_at: new Date().toISOString(), reactions: { top: 12, sain: 5, courage: 2 } },
     { id: "2", client: "Fatima B.", content: "J'ai eu du mal à boire mon eau aujourd'hui, mais j'ai fini mon 8ème verre ! On lâche rien les filles 💪", created_at: new Date(Date.now() - 86400000).toISOString(), reactions: { top: 4, sain: 0, courage: 15 } }
  ]);
  const [favoriteMeals, setFavoriteMeals] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Objectifs
  const [calorieGoal, setCalorieGoal] = useState(1500);
  const [proteinGoal, setProteinGoal] = useState(80);
  const [carbsGoal, setCarbsGoal] = useState(150);
  const [fatsGoal, setFatsGoal] = useState(50);
  
  // Smart Planner (Générateur)
  const [weeklyGeneratedMenu, setWeeklyGeneratedMenu] = useState<any[]>([]);
  const [showGroceryList, setShowGroceryList] = useState(false);

  const [profileForm, setProfileForm] = useState({ full_name: "", avatar_url: "", password: "" });
  const [showReminder, setShowReminder] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);

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
          const trialEnds = profileData.trial_ends_at ? new Date(profileData.trial_ends_at).getTime() : (new Date(profileData.created_at || new Date()).getTime() + 14 * 24 * 60 * 60 * 1000);
          const now = new Date().getTime();
          let diffDays = Math.max(0, Math.ceil((trialEnds - now) / (1000 * 60 * 60 * 24)));
          if (profileData.plan_type === 'premium') {
             diffDays = 999;
          }
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
              if (todayLog.report_data?.consumedMeals) setConsumedMeals(todayLog.report_data.consumedMeals);
            }
          }

          // Récupérer le profil nutritionnel (via Supabase ou localStorage)
          const { data: nutritionData } = await supabase
            .from('nutrition_profiles')
            .select('*')
            .eq('client_id', profileData.id)
            .single();

          if (nutritionData) {
             setCalorieGoal(nutritionData.daily_calorie_goal || 1500);
             setProteinGoal(nutritionData.protein_goal || 80);
             setCarbsGoal(nutritionData.carbs_goal || 150);
             setFatsGoal(nutritionData.fats_goal || 50);
             setJongomaXP(nutritionData.jongoma_xp || 0);
             if (nutritionData.weekly_menu && nutritionData.weekly_menu.length > 0) setWeeklyGeneratedMenu(nutritionData.weekly_menu);
          }
          
          // Récupérer le poids
          const { data: wLogs } = await supabase.from('nutrition_weight_logs').select('*').eq('client_id', profileData.id).order('log_date', { ascending: true });
          if (wLogs) {
              setWeightLogs(wLogs);
              if (wLogs.length > 0) setCurrentWeightInput(wLogs[wLogs.length - 1].weight);
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

          const savedFavs = localStorage.getItem('onyx_favorite_meals');
          if (savedFavs) {
             try { setFavoriteMeals(JSON.parse(savedFavs)); } catch(e) {}
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
    
    const welcome = localStorage.getItem('onyx_nutrition_welcome');
    if (welcome) setWelcomeMessage(welcome);

  }, [router, searchParams]);

  // S'assurer que le menu est généré si l'utilisateur vient d'arriver
  useEffect(() => {
      if (clientProfile && weeklyGeneratedMenu.length === 0) {
          generateWeeklyMenu();
      }
  }, [clientProfile, weeklyGeneratedMenu.length]);

  const updateXP = async (amount: number, reason: string) => {
      const newXP = jongomaXP + amount;
      setJongomaXP(newXP);
      if (clientProfile) {
         await supabase.from('nutrition_profiles').update({ jongoma_xp: newXP }).eq('client_id', clientProfile.id);
      }
      alert(`+${amount} XP ! (${reason})`);
  };

  const getJongomaLevel = (xp: number) => {
      if (xp >= 2000) return { name: "Star Nutrition", badge: "🌟", desc: "Code promo boutique débloqué !" };
      if (xp >= 500) return { name: "Adhérente", badge: "💎", desc: "Badge de profil débloqué" };
      return { name: "Novice", badge: "🌱", desc: "En apprentissage" };
  };

  const fetchLeaderboard = async () => {
    const { data } = await supabase
      .from('nutrition_profiles')
      .select('jongoma_xp, client:clients(id, full_name, avatar_url)')
      .order('jongoma_xp', { ascending: false, nullsFirst: false })
      .limit(10);
      
    if (data && data.length > 0) {
        const formattedData = data.map(d => ({
            id: (d.client as any)?.id,
            full_name: (d.client as any)?.full_name || 'Membre',
            avatar_url: (d.client as any)?.avatar_url,
            xp: d.jongoma_xp || 0
        })).filter(d => d.id);
        
        if (clientProfile && !formattedData.some(d => d.id === clientProfile.id)) {
           formattedData.push({
               id: clientProfile.id,
               full_name: user?.full_name || 'Moi',
               avatar_url: user?.avatar_url,
               xp: jongomaXP
           });
           formattedData.sort((a: any, b: any) => b.xp - a.xp);
        }
        setLeaderboardData(formattedData);
    } else {
        const mockData = [
            { id: "1", full_name: "Fatou Diop", xp: 2450 },
            { id: "2", full_name: "Aïcha Sy", xp: 1800 },
            { id: "3", full_name: "Ndeye Ndiaye", xp: 1200 },
        ];
        if (user) mockData.push({ id: user.id || "4", full_name: user.full_name || "Moi", xp: jongomaXP });
        mockData.sort((a, b) => b.xp - a.xp);
        setLeaderboardData(mockData);
    }
  };

  const openLeaderboard = () => {
    fetchLeaderboard();
    setShowLeaderboard(true);
  };

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

  // Hook de relance d'hydratation
  useEffect(() => {
     const waterInterval = setInterval(() => {
        if (waterGlasses >= 0 && waterGlasses < 8) {
           sendWaterReminderPush();
        }
     }, 2 * 60 * 60 * 1000); // Déclenche toutes les 2 heures si la jauge n'est pas remplie
     return () => clearInterval(waterInterval);
  }, [waterGlasses]);

  // --- LOGIQUE SMART PLANNER ---
  const generateWeeklyMenu = async () => {
      let currentRecipes = RECIPES_DB;
      try {
          const { data } = await supabase.from('nutrition_recipes').select('*');
          if (data && data.length > 0) currentRecipes = data;
      } catch(e) {}
      
      let newMenu: any[] = [];
      let bolCommunCount = 0;
      const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
      
      days.forEach(day => {
          const breakfasts = currentRecipes.filter(r => r.type === 'Petit-déjeuner');
          const lunches = currentRecipes.filter(r => r.type === 'Déjeuner');
          const dinners = currentRecipes.filter(r => r.type === 'Dîner');
          const snacks = currentRecipes.filter(r => r.type === 'Collation');

          let lunch;
          // S'assure d'intégrer 2-3 déjeuners "Bol Commun" dans la semaine
          if (bolCommunCount < 3 && Math.random() > 0.4) {
              const bcLunches = lunches.filter(r => r.is_bol_commun);
              lunch = bcLunches.length > 0 ? bcLunches[Math.floor(Math.random() * bcLunches.length)] : lunches[0];
              if (bcLunches.length > 0) bolCommunCount++;
          } else {
              const normalLunches = lunches.filter(r => !r.is_bol_commun);
              lunch = normalLunches.length > 0 ? normalLunches[Math.floor(Math.random() * normalLunches.length)] : lunches[0];
          }

          newMenu.push({
              day,
              meals: {
                  'Petit-déjeuner': breakfasts.length > 0 ? breakfasts[Math.floor(Math.random() * breakfasts.length)] : null,
                  'Déjeuner': lunch || null,
                  'Collation': snacks.length > 0 ? snacks[Math.floor(Math.random() * snacks.length)] : null,
                  'Dîner': dinners.length > 0 ? dinners[Math.floor(Math.random() * dinners.length)] : null
              }
          });
      });
      setWeeklyGeneratedMenu(newMenu);
      if (clientProfile) {
         await supabase.from('nutrition_profiles').update({ weekly_menu: newMenu }).eq('client_id', clientProfile.id);
      }
  };

  const handleSwapMeal = async (dayIndex: number, mealType: string, currentRecipeId: string) => {
      let currentRecipes = RECIPES_DB;
      try {
          const { data } = await supabase.from('nutrition_recipes').select('*');
          if (data && data.length > 0) currentRecipes = data;
      } catch(e) {}
      
      const alternatives = currentRecipes.filter(r => r.type === mealType && r.id !== currentRecipeId);
      if (alternatives.length > 0) {
          const newRecipe = alternatives[Math.floor(Math.random() * alternatives.length)];
          const updatedMenu = [...weeklyGeneratedMenu];
          updatedMenu[dayIndex].meals[mealType] = newRecipe;
          setWeeklyGeneratedMenu(updatedMenu);
          if (clientProfile) {
             await supabase.from('nutrition_profiles').update({ weekly_menu: updatedMenu }).eq('client_id', clientProfile.id);
          }
      } else {
          alert("Aucune alternative disponible pour ce type de repas dans la base de données.");
      }
  };

  const getGroceryList = () => {
      const list: any = { 'Supermarché': {}, 'Marché local': {}, 'Boucherie / Pêche': {} };
      weeklyGeneratedMenu.forEach(dayInfo => {
          Object.values(dayInfo.meals).forEach((recipe: any) => {
              recipe.ingredients.forEach((ing: any) => {
                  const rayon = ing.rayon || 'Supermarché';
                  if (!list[rayon]) list[rayon] = {};
                  if (list[rayon][ing.nom]) {
                      list[rayon][ing.nom].quantite += ing.quantite;
                  } else {
                      list[rayon][ing.nom] = { quantite: ing.quantite, unite: ing.unite };
                  }
              });
          });
      });
      return list;
  };

  const handleAddWater = async () => {
    if (!clientProfile) return;
    const newAmount = Math.min(waterGlasses + 1, 8);
    setWaterGlasses(newAmount);
    
    if (waterGlasses === 7 && newAmount === 8) {
        updateXP(5, "Objectif d'eau quotidien atteint !");
    }

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
      setFoodSearchQuery("");
      setSelectedFoodDB(null);
      setFoodQuantity(1);
      setSelectedMealModal({ type: mealType, meal: plannedMeal, mode: trackingMode });
  };

  const confirmMealLog = async (mealName: string, cals: number, prots: number, mealCarbs: number, mealFats: number, foodObj?: any) => {
      const calsRounded = Math.round(cals);
      const protsRounded = Math.round(prots);
      const carbsRounded = Math.round(mealCarbs);
      const fatsRounded = Math.round(mealFats);

      const newCals = calories + calsRounded;
      const newProts = proteins + protsRounded;
      const newCarbs = carbs + carbsRounded;
      const newFats = fats + fatsRounded;
      
      const newConsumedItem = {
         id: Date.now(),
         type: selectedMealModal.type,
         name: mealName,
         cals: calsRounded,
         prots: protsRounded,
         carbs: carbsRounded,
         fats: fatsRounded,
         time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      const updatedConsumedMeals = [...consumedMeals, newConsumedItem];

      setCalories(newCals);
      setProteins(newProts);
      setCarbs(newCarbs);
      setFats(newFats);
      setConsumedMeals(updatedConsumedMeals);
      
      if (updatedConsumedMeals.length === 3 && consumedMeals.length === 2) {
          updateXP(10, "3 repas logués aujourd'hui !");
      }

      setSelectedMealModal(null);
      
      // --- L'Intervention de l'Avatar IA (Rokhy) ---
      if (foodObj?.flags_ia?.high_sodium) {
         setRokhyMessage({ title: "Attention au sel !", text: foodObj.message_coach_ia, type: 'warning' });
      } else if (newFats > fatsGoal) {
         setRokhyMessage({ title: "Quota de lipides atteint", text: "Attention à l'huile pour le reste de la journée ! Privilégie une cuisson vapeur ou au four ce soir.", type: 'warning' });
      } else if (foodObj?.message_coach_ia) {
         setRokhyMessage({ title: "Bon choix", text: foodObj.message_coach_ia, type: 'success' });
      }

      if (clientProfile) {
          const todayStr = new Date().toISOString().split('T')[0];
          await supabase.from('nutrition_daily_logs').upsert({
            client_id: clientProfile.id,
            log_date: todayStr,
            calories_consumed: newCals,
            proteins_consumed: newProts,
            carbs_consumed: newCarbs,
            fats_consumed: newFats,
            report_data: { ...reportData, consumedMeals: updatedConsumedMeals }
          }, { onConflict: 'client_id, log_date' });
      }
  };

  const deleteMealLog = async (itemToDelete: any) => {
      const updatedConsumedMeals = consumedMeals.filter(m => m.id !== itemToDelete.id);
      
      const newCals = Math.max(0, calories - itemToDelete.cals);
      const newProts = Math.max(0, proteins - itemToDelete.prots);
      const newCarbs = Math.max(0, carbs - itemToDelete.carbs);
      const newFats = Math.max(0, fats - itemToDelete.fats);

      setCalories(newCals);
      setProteins(newProts);
      setCarbs(newCarbs);
      setFats(newFats);
      setConsumedMeals(updatedConsumedMeals);

      if (clientProfile) {
          const todayStr = new Date().toISOString().split('T')[0];
          await supabase.from('nutrition_daily_logs').upsert({
            client_id: clientProfile.id,
            log_date: todayStr,
            calories_consumed: newCals,
            proteins_consumed: newProts,
            carbs_consumed: newCarbs,
            fats_consumed: newFats,
            report_data: { ...reportData, consumedMeals: updatedConsumedMeals }
          }, { onConflict: 'client_id, log_date' });
      }
  };

  const handleProcessPayment = async () => {
     setShowPaymentModal(false);
     if (clientProfile) {
         const newDate = new Date();
         newDate.setDate(newDate.getDate() + 30);
         await supabase.from('clients').update({ trial_ends_at: newDate.toISOString(), plan_type: 'premium' }).eq('id', clientProfile.id);
         setDaysLeft(30);
         setClientProfile({...clientProfile, plan_type: 'premium', trial_ends_at: newDate.toISOString()});
         alert("Paiement validé ! Votre abonnement Premium est prolongé de 30 jours.");
     } else {
         alert("Simulation: Paiement validé.");
     }
  };

  const handleScanProduct = async () => {
     if (!barcodeInput) return;
     try {
        const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeInput}.json`);
        const data = await res.json();
        if (data.status === 1) {
           const product = data.product;
           const nutriments = product.nutriments;
           const newFood = {
              id: product._id,
              nom: product.product_name || "Produit Scanné",
              categorie: "Produit Scanné (API)",
              portion_standard_nom: "100g",
              portion_standard_grammes: 100,
              valeurs_pour_100g: {
                 calories: nutriments['energy-kcal_100g'] || 0,
                 glucides: nutriments.carbohydrates_100g || 0,
                 lipides: nutriments.fat_100g || 0,
                 proteines: nutriments.proteins_100g || 0,
                 fibres: nutriments.fiber_100g || 0,
                 sodium_mg: (nutriments.sodium_100g || 0) * 1000
              },
              flags_ia: { is_local_senegal: false, ig_bas: null, high_sodium: false, ultra_transforme: true },
              message_coach_ia: "Produit industriel scanné via l'API OpenFoodFacts. Ajoutez-le à votre journal."
           };
           setSelectedFoodDB(newFood);
           setFoodSearchQuery(product.product_name);
           setIsScanning(false);
           setBarcodeInput("");
           alert(`Produit trouvé : ${product.product_name}. Confirmez-vous l'ajout ?`);
        } else {
           alert("Produit introuvable dans la base de données OpenFoodFacts.");
        }
     } catch (e) {
        alert("Erreur lors de la recherche du produit via l'API.");
     }
  };

  const handleSaveWeight = async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const lastLog = weightLogs.length > 0 ? weightLogs[weightLogs.length - 1] : null;
      
      if (lastLog) {
          const days = (new Date(todayStr).getTime() - new Date(lastLog.log_date).getTime()) / (1000 * 3600 * 24);
          if (days < 7 && lastLog.log_date !== todayStr) {
              alert(`Vous avez déjà enregistré votre poids cette semaine. On évite l'obsession ! Revenez dans ${Math.ceil(7 - days)} jours.`);
              return;
          }
      }
      
      const newWeight = currentWeightInput;
      const isLoss = lastLog ? newWeight < lastLog.weight : true;
      
      if (isLoss) {
          setRokhyMessage({ title: "Perte validée !", text: "Bravo ! Les efforts payent. On a brûlé la graisse, on continue sur cette lancée !", type: 'success' });
      } else {
          setRokhyMessage({ title: "Ne panique pas.", text: "Stop, ne panique pas. Le poids fluctue à cause de l'eau, du cycle hormonal ou du stress. Reste focus sur ton menu cette semaine, le processus fonctionne.", type: 'warning' });
      }
      
      const newLog = { log_date: todayStr, weight: newWeight };
      const updatedLogs = [...weightLogs.filter(l => l.log_date !== todayStr), newLog].sort((a,b) => new Date(a.log_date).getTime() - new Date(b.log_date).getTime());
      setWeightLogs(updatedLogs);
      
      if (clientProfile) {
          await supabase.from('nutrition_weight_logs').upsert({ client_id: clientProfile.id, log_date: todayStr, weight: newWeight }, { onConflict: 'client_id, log_date' });
      }
  };

  const handlePostCommunity = async () => {
      if (clientProfile?.plan_type !== 'premium' && daysLeft <= 0) return alert("La publication est réservée aux membres Premium pour garantir l'absence de spams.");
      if (!newPostText && !newPostImage) return;
      const newPost = { id: Date.now().toString(), client: user?.full_name || 'Membre', content: newPostText, image_url: newPostImage, reactions: { top: 0, sain: 0, courage: 0 }, created_at: new Date().toISOString() };
      setCommunityPosts([newPost, ...communityPosts]);
      setNewPostText("");
      setNewPostImage(null);
      updateXP(15, "Photo/Plat publié dans le Feed");
      if (clientProfile) await supabase.from('nutrition_community_posts').insert({ client_id: clientProfile.id, content: newPostText, image_url: newPostImage, reactions: { top: 0, sain: 0, courage: 0 } });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
        setUploadingImage(true);
        const ext = file.name.split('.').pop();
        const fileName = `posts/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const { error, data: uploadData } = await supabase.storage.from('avatars').upload(fileName, file);
        if (error) throw error;
        const { data } = supabase.storage.from('avatars').getPublicUrl(fileName);
        setNewPostImage(data.publicUrl);
    } catch (err: any) {
        alert("Erreur d'upload : " + err.message + "\nAssurez-vous que le bucket 'avatars' est public et accepte les uploads.");
    } finally {
        setUploadingImage(false);
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
      report_data: { ...reportData, consumedMeals },
      water_glasses: waterGlasses,
      calories_consumed: currentCals,
      proteins_consumed: currentProts
    }, { onConflict: 'client_id, log_date' });

    if (!error) {
       alert("Bilan de la journée enregistré avec succès ! L'IA adaptera votre menu de demain.");
       setShowDailyReport(false);
       const updatedLog = { client_id: clientProfile.id, log_date: todayStr, report_data: { ...reportData, consumedMeals }, water_glasses: waterGlasses, calories_consumed: currentCals, proteins_consumed: currentProts };
       setDailyLogs(prev => [...prev.filter(l => l.log_date !== todayStr), updatedLog]);
    } else {
       alert("Une erreur est survenue lors de l'enregistrement.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  const currentDayName = new Date().toLocaleDateString('fr-FR', { weekday: 'long' });
  const formattedCurrentDay = currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1);
  const todayPlan = weeklyGeneratedMenu.find(d => d.day === formattedCurrentDay);

  const weeklyMenus = ALL_MENUS.map(menu => {
      let displayMeals = menu.meals;
      if (menu.week === 1 && weeklyGeneratedMenu.length > 0) {
          displayMeals = [
              `Lundi : ${weeklyGeneratedMenu.find(d => d.day === 'Lundi')?.meals['Déjeuner']?.nom || 'Repas'}`,
              `Mardi : ${weeklyGeneratedMenu.find(d => d.day === 'Mardi')?.meals['Déjeuner']?.nom || 'Repas'}`,
              `Mercredi : ${weeklyGeneratedMenu.find(d => d.day === 'Mercredi')?.meals['Déjeuner']?.nom || 'Repas'}`
          ];
      }
      return {
          ...menu,
          status: clientProfile?.plan_type === 'premium' || menu.week <= 2 ? 'unlocked' : 'locked',
          meals: displayMeals
      };
  });

  // --- GESTION ET SAUVEGARDE DU MODE DE SUIVI ---
  const handleTrackingModeChange = async (mode: 'guided' | 'flexible') => {
     setTrackingMode(mode);
     if (clientProfile && clientProfile.phone) {
        await supabase.from('nutrition_profiles').update({ tracking_mode: mode }).eq('phone', clientProfile.phone);
     } else {
        const { data: { user } } = await supabase.auth.getUser();
        const phone = user?.email?.match(/^(\+?\d+)@clients\.onyxcrm\.com$/)?.[1] || user?.phone;
        if (phone) await supabase.from('nutrition_profiles').update({ tracking_mode: mode }).eq('phone', phone);
     }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
  }
  
  const toggleFavorite = (meal: any) => {
      const mealName = meal.meal || meal.nom;
      const exists = favoriteMeals.find(f => (f.meal || f.nom) === mealName);
      let newFavs;
      if (exists) {
          newFavs = favoriteMeals.filter(f => (f.meal || f.nom) !== mealName);
      } else {
          newFavs = [...favoriteMeals, meal];
      }
      setFavoriteMeals(newFavs);
      localStorage.setItem('onyx_favorite_meals', JSON.stringify(newFavs));
  };

  const remainingCalories = Math.max(0, calorieGoal - calories);
  const lvlInfo = getJongomaLevel(jongomaXP);

  const currentHour = new Date().getHours();
  const greetingText = currentHour < 18 ? "Bonjour" : "Bonsoir";
  const greetingSubtext = currentHour < 18 ? "Prête pour ta journée ?" : "Pense à t'hydrater ce soir.";

  // Calcul pour le badge de coaching (3 premiers jours)
  const createdDate = clientProfile?.created_at ? new Date(clientProfile.created_at) : new Date();
  const isNewUser = (new Date().getTime() - createdDate.getTime()) / (1000 * 3600 * 24) <= 3;

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
                <div>
                  <h1 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase tracking-tighter`}>
                    {greetingText}, <span className="text-white">{user?.full_name?.split(' ')[0] || 'Membre'}</span> !
                  </h1>
                  <p className="text-[#39FF14] font-black tracking-widest text-xs uppercase mt-1">{greetingSubtext}</p>
                </div>
              </div>
            </div>
            
            {/* Bandeau Essai Gratuit */}
            <div className="flex items-center gap-4">
               <div className="hidden sm:flex items-center gap-3 bg-zinc-900 p-2 pr-4 rounded-2xl border border-zinc-800 shadow-inner cursor-pointer hover:bg-zinc-800 transition-colors" title={lvlInfo.desc + " - Cliquez pour voir le classement"} onClick={openLeaderboard}>
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-xl shadow-md border border-zinc-700">{lvlInfo.badge}</div>
                  <div>
                     <p className="text-[#39FF14] text-[10px] font-black uppercase tracking-widest">Niveau : {lvlInfo.name}</p>
                     <p className="text-white text-xs font-bold">{jongomaXP} XP</p>
                  </div>
               </div>
               <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center gap-4 shadow-xl">
                 <div className="flex items-center gap-4">
                    <div className="bg-black border border-zinc-700 p-3 rounded-xl">
                       <Clock className={daysLeft > 0 ? "text-[#39FF14]" : "text-red-500"} size={24} />
                    </div>
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1">Abonnement</p>
                       <p className="text-sm font-bold text-white"><strong className={daysLeft > 0 ? "text-[#39FF14]" : "text-red-500"}>{daysLeft > 0 ? `${daysLeft} jours restants` : 'Expiré'}</strong></p>
                    </div>
                 </div>
                 <button onClick={() => setShowPaymentModal(true)} className="w-full sm:w-auto bg-[#39FF14] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors">Renouveler</button>
               </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 mt-12 space-y-12">
        {/* NOUVEAU : SYSTÈME D'ONGLETS */}
        <div className="flex bg-zinc-200/50 p-1.5 rounded-2xl w-max mx-auto md:mx-0 overflow-x-auto max-w-full">
           <button onClick={() => setActiveTab('today')} className={`shrink-0 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'today' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Mon Jour</button>
           <button onClick={() => setActiveTab('weight')} className={`shrink-0 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'weight' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Mon Poids</button>
           <button onClick={() => setActiveTab('community')} className={`shrink-0 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'community' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Communauté</button>
           <button onClick={() => setActiveTab('week')} className={`shrink-0 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'week' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Programme Semaine</button>
           <button onClick={() => setActiveTab('favorites')} className={`shrink-0 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'favorites' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Recettes Enregistrées</button>
           <button onClick={() => setActiveTab('coaching')} className={`shrink-0 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 ${activeTab === 'coaching' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>
              Coaching Personnel
              {isNewUser && (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
              )}
           </button>
           <button onClick={() => setActiveTab('history')} className={`shrink-0 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'history' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Historique</button>
           <button onClick={() => setActiveTab('profile')} className={`shrink-0 px-6 py-3 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'profile' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Réglages</button>
        </div>
        
        {activeTab === 'today' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            
            {/* SÉLECTEUR DE MODE & ACTIONS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="bg-white border border-zinc-200 p-2 rounded-2xl flex items-center shadow-sm w-full md:w-auto">
                 <button onClick={() => handleTrackingModeChange('guided')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'guided' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}>
                    <Utensils size={16}/> Mode Guidé
                 </button>
                 <button onClick={() => handleTrackingModeChange('flexible')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${trackingMode === 'flexible' ? 'bg-black text-[#00E5FF] shadow-md' : 'text-zinc-500 hover:text-black hover:bg-zinc-100'}`}>
                    <Compass size={16}/> Mode Libre
                 </button>
               </div>
               
               <button onClick={() => setShowRedoDiagModal(true)} className="bg-zinc-100 text-black border border-zinc-200 px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-200 transition-colors shadow-sm flex items-center gap-2">
                 <RefreshCcw size={14}/> Refaire mon Diagnostic
               </button>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl text-sm font-medium">
               <p><strong>{trackingMode === 'guided' ? 'Mode Guidé (Menu Strict) :' : 'Mode Libre (Flexible) :'}</strong> {trackingMode === 'guided' ? "Idéal pour les 14 premiers jours. Suivez le menu généré à la lettre pour des résultats rapides." : "Vous êtes libre de composer vos repas ! Ajoutez ce que vous mangez via la barre de recherche."}</p>
            </div>

        {/* MESSAGE D'ONBOARDING */}
        {welcomeMessage && (
           <div className="bg-blue-50 border border-blue-200 p-5 rounded-2xl flex items-start gap-4 shadow-sm relative">
              <button onClick={() => { setWelcomeMessage(null); localStorage.removeItem('onyx_nutrition_welcome'); }} className="absolute top-4 right-4 text-blue-400 hover:text-blue-600"><X size={16}/></button>
              <div className="bg-blue-600 text-white p-2 rounded-full shrink-0"><MessageCircle size={20}/></div>
              <div className="pr-6">
                 <h3 className="font-black text-blue-800 uppercase text-sm mb-1">Message de ton Coach</h3>
                 <p className="text-blue-900 font-medium text-sm leading-relaxed">{welcomeMessage}</p>
              </div>
           </div>
        )}

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
                    const generatedMeal = todayPlan?.meals ? todayPlan.meals[mealType] : null;
                    const plannedMeal = generatedMeal ? {
                        type: mealType,
                        time: mealType === 'Petit-déjeuner' ? '08:00' : mealType === 'Déjeuner' ? '13:30' : mealType === 'Collation' ? '16:00' : '19:30',
                        meal: generatedMeal.nom,
                        cals: generatedMeal.calories,
                        proteins: Math.round((generatedMeal.calories * 0.2) / 4),
                        carbs: Math.round((generatedMeal.calories * 0.5) / 4),
                        fats: Math.round((generatedMeal.calories * 0.3) / 9),
                        recipe: generatedMeal.recipe || `Ingrédients : ${generatedMeal.ingredients?.map((i: any) => `${i.quantite}${i.unite} ${i.nom}`).join(', ') || ''}`
                    } : null;
                    
                    const itemsForThisMeal = consumedMeals.filter(m => m.type === mealType);
                    
                    return (
                       <div key={mealType} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition-colors flex flex-col">
                          <div className="flex justify-between items-center mb-4">
                             <span className="bg-zinc-100 text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{mealType}</span>
                             {trackingMode === 'guided' && plannedMeal && (
                                <span className="text-xs font-bold text-zinc-500 flex items-center gap-1"><Clock size={12}/> {plannedMeal.time}</span>
                             )}
                          </div>
                          
                          <div className="flex-1">
                             {itemsForThisMeal.length > 0 ? (
                                <div className="space-y-3 mb-4">
                                   {itemsForThisMeal.map((item, i) => (
                                      <div key={item.id} className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                                         <div>
                                            <p className="font-bold text-sm text-black">{item.name}</p>
                                            <p className="text-[10px] font-black uppercase text-zinc-500">{item.cals} kcal • {item.prots}g prot</p>
                                         </div>
                                         <button onClick={() => deleteMealLog(item)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                            <Trash2 size={16}/>
                                         </button>
                                      </div>
                                   ))}
                                </div>
                             ) : trackingMode === 'guided' && plannedMeal ? (
                                <div onClick={() => handleMealClick(mealType, plannedMeal)} className="cursor-pointer">
                                   <p className="font-black text-lg text-black mb-2">{plannedMeal.meal}</p>
                                   <div className="flex items-center gap-4 text-xs font-bold text-zinc-500">
                                      <span className="flex items-center gap-1 text-orange-500"><Flame size={14}/> {plannedMeal.cals} kcal</span>
                                      <span className="flex items-center gap-1 text-[#39FF14]"><Target size={14}/> {plannedMeal.proteins}g prot</span>
                                   </div>
                                </div>
                             ) : null}
                          </div>

                          {(trackingMode === 'flexible' || (trackingMode === 'guided' && itemsForThisMeal.length === 0)) && (
                             <div onClick={() => handleMealClick(mealType, plannedMeal)} className="mt-4 flex flex-col items-center justify-center py-4 border-2 border-dashed border-zinc-200 rounded-xl hover:border-black hover:bg-zinc-50 transition-colors cursor-pointer">
                                <span className="text-2xl mb-1 text-zinc-300 leading-none">+</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{itemsForThisMeal.length > 0 ? "Ajouter autre chose" : "Ajouter un aliment"}</span>
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
                     
                     {selectedMealModal.mode === 'guided' && selectedMealModal.meal ? (
                         <>
                             <div className="flex justify-between items-start mb-6">
                                <p className="text-sm font-bold text-zinc-500">{selectedMealModal.meal.meal}</p>
                                <button onClick={() => toggleFavorite(selectedMealModal.meal)} className={`p-2 rounded-full transition-colors ${favoriteMeals.some(f => (f.meal || f.nom) === selectedMealModal.meal.meal) ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-400 hover:text-red-500'}`}>
                                   <HeartPulse size={18} className={favoriteMeals.some(f => (f.meal || f.nom) === selectedMealModal.meal.meal) ? "fill-current" : ""} />
                                </button>
                             </div>
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
                             <button onClick={() => confirmMealLog(selectedMealModal.meal.meal, selectedMealModal.meal.cals, selectedMealModal.meal.proteins, selectedMealModal.meal.carbs, selectedMealModal.meal.fats)} className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2">
                                <CheckCircle size={20} /> J'ai mangé ça !
                             </button>
                         </>
                     ) : (
                         <>
                             <div className="flex gap-2 mb-6">
                                 <div className="relative flex-1">
                                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18}/>
                                     <input 
                                        type="text" 
                                        placeholder="Rechercher (ex: Fonio, Thiof)..." 
                                        value={foodSearchQuery}
                                        onChange={e => { setFoodSearchQuery(e.target.value); setSelectedFoodDB(null); setIsScanning(false); }}
                                        className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black"
                                     />
                                 </div>
                                 <button onClick={() => setIsScanning(!isScanning)} className={`px-5 rounded-2xl flex items-center justify-center transition-colors ${isScanning ? 'bg-[#39FF14] text-black' : 'bg-black text-white hover:bg-zinc-800'}`} title="Scanner un produit">
                                     <ScanLine size={20} />
                                 </button>
                             </div>
                             
                             {isScanning && (
                                 <div className="bg-blue-50 p-5 rounded-2xl border border-blue-200 mb-6 flex flex-col gap-3 animate-in fade-in">
                                     <p className="text-xs font-bold text-blue-800 flex items-center gap-2"><ScanLine size={16}/> Scanner via OpenFoodFacts</p>
                                     <input type="text" placeholder="Entrez le code-barres (ex: 3017620422003)" value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} className="w-full p-3 border border-blue-200 rounded-xl text-sm font-bold outline-none focus:border-blue-500 bg-white"/>
                                     <button onClick={handleScanProduct} className="bg-blue-600 text-white py-3 rounded-xl font-black uppercase text-xs hover:bg-blue-700 transition-colors">Chercher le produit</button>
                                 </div>
                             )}
                             
                             {!selectedFoodDB && foodSearchQuery && (
                                <div className="max-h-60 overflow-y-auto space-y-2 mb-6 border border-zinc-100 rounded-xl p-2">
                                   {FOOD_DATABASE.filter(f => f.nom.toLowerCase().includes(foodSearchQuery.toLowerCase())).map(food => (
                                      <div key={food.id} onClick={() => setSelectedFoodDB(food)} className="p-3 bg-white hover:bg-zinc-50 rounded-lg cursor-pointer flex justify-between items-center transition-colors">
                                         <div>
                                            <p className="font-bold text-sm">{food.nom}</p>
                                            <p className="text-[10px] text-zinc-500 uppercase font-black">{food.categorie}</p>
                                         </div>
                                         <span className="text-xs font-black text-[#39FF14] bg-black px-2 py-1 rounded">+{food.valeurs_pour_100g.calories} kcal/100g</span>
                                      </div>
                                   ))}
                                   {FOOD_DATABASE.filter(f => f.nom.toLowerCase().includes(foodSearchQuery.toLowerCase())).length === 0 && (
                                      <p className="text-xs text-zinc-400 text-center p-4 font-bold">Aucun aliment trouvé. Essayez autre chose.</p>
                                   )}
                                </div>
                             )}

                             {selectedFoodDB && (
                                <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mb-6 animate-in fade-in">
                                   <div className="flex justify-between items-start mb-4">
                                      <h4 className="font-black text-lg">{selectedFoodDB.nom}</h4>
                                      <div className="flex gap-2 items-center">
                                         <button onClick={() => toggleFavorite(selectedFoodDB)} className={`p-2 rounded-full transition-colors ${favoriteMeals.some(f => (f.meal || f.nom) === selectedFoodDB.nom) ? 'bg-red-50 text-red-500' : 'bg-zinc-100 text-zinc-400 hover:text-red-500'}`}>
                                            <HeartPulse size={16} className={favoriteMeals.some(f => (f.meal || f.nom) === selectedFoodDB.nom) ? "fill-current" : ""} />
                                         </button>
                                         <button onClick={() => setSelectedFoodDB(null)} className="text-xs font-bold text-zinc-400 hover:text-black">Changer</button>
                                      </div>
                                   </div>
                                   
                                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Quantité consommée</label>
                                   <div className="flex items-center gap-4 mb-6">
                                      <select value={foodQuantity} onChange={e => setFoodQuantity(parseFloat(e.target.value))} className="w-24 p-3 bg-white border border-zinc-200 rounded-xl font-bold outline-none">
                                         <option value={0.5}>0.5</option>
                                         <option value={1}>1</option>
                                         <option value={1.5}>1.5</option>
                                         <option value={2}>2</option>
                                         <option value={3}>3</option>
                                      </select>
                                      <span className="text-sm font-bold text-zinc-600 flex-1">x {selectedFoodDB.portion_standard_nom} <br/><span className="text-xs text-zinc-400">({selectedFoodDB.portion_standard_grammes * foodQuantity}g)</span></span>
                                   </div>

                                   <div className="grid grid-cols-4 gap-2 text-center">
                                      <div className="bg-orange-50 p-2 rounded-xl border border-orange-100"><p className="text-[9px] font-black uppercase text-orange-400">Kcal</p><p className="font-black text-orange-600">{Math.round((selectedFoodDB.valeurs_pour_100g.calories * selectedFoodDB.portion_standard_grammes * foodQuantity) / 100)}</p></div>
                                      <div className="bg-yellow-50 p-2 rounded-xl border border-yellow-100"><p className="text-[9px] font-black uppercase text-yellow-500">Gluc</p><p className="font-black text-yellow-700">{Math.round((selectedFoodDB.valeurs_pour_100g.glucides * selectedFoodDB.portion_standard_grammes * foodQuantity) / 100)}g</p></div>
                                      <div className="bg-green-50 p-2 rounded-xl border border-green-100"><p className="text-[9px] font-black uppercase text-green-500">Prot</p><p className="font-black text-green-700">{Math.round((selectedFoodDB.valeurs_pour_100g.proteines * selectedFoodDB.portion_standard_grammes * foodQuantity) / 100)}g</p></div>
                                      <div className="bg-zinc-100 p-2 rounded-xl border border-zinc-200"><p className="text-[9px] font-black uppercase text-zinc-400">Lip</p><p className="font-black text-zinc-600">{Math.round((selectedFoodDB.valeurs_pour_100g.lipides * selectedFoodDB.portion_standard_grammes * foodQuantity) / 100)}g</p></div>
                                   </div>
                                </div>
                             )}

                             <button 
                                disabled={!selectedFoodDB}
                                onClick={() => {
                                   if(selectedFoodDB) {
                                      const factor = (selectedFoodDB.portion_standard_grammes * foodQuantity) / 100;
                                      confirmMealLog(
                                         selectedFoodDB.nom,
                                         selectedFoodDB.valeurs_pour_100g.calories * factor,
                                         selectedFoodDB.valeurs_pour_100g.proteines * factor,
                                         selectedFoodDB.valeurs_pour_100g.glucides * factor,
                                         selectedFoodDB.valeurs_pour_100g.lipides * factor,
                                         selectedFoodDB
                                      );
                                   }
                                }} 
                                className={`w-full py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl flex justify-center items-center gap-2 transition-all ${selectedFoodDB ? 'bg-black text-[#00E5FF] hover:scale-[1.02]' : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'}`}
                             >
                                <CheckCircle size={20} /> Ajouter au tracker
                             </button>
                         </>
                     )}
                  </div>
               </div>
            )}

          </div>
        )}

        {/* VUE COACHING */}
        {activeTab === 'coaching' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-4xl mx-auto">
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-6`}><Activity className="text-[#39FF14] bg-black p-2 rounded-xl" size={36}/> Coaching Personnel</h2>
                <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl mb-8">
                   <h3 className="font-black text-lg text-blue-800 mb-2">Besoin d'un accompagnement sur-mesure ?</h3>
                   <p className="text-sm font-medium text-blue-700">Prenez rendez-vous avec l'un de nos experts en nutrition pour adapter votre programme, surmonter un blocage ou poser vos questions.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl flex flex-col justify-between hover:border-black transition-colors">
                      <div>
                         <div className="w-12 h-12 bg-black text-[#39FF14] rounded-full flex items-center justify-center mb-4"><Clock size={20}/></div>
                         <h4 className="font-black uppercase text-sm mb-2">Bilan 15 min (Gratuit)</h4>
                         <p className="text-xs text-zinc-500 font-medium mb-4">Inclus dans votre abonnement Premium. Idéal pour un ajustement rapide de votre plan.</p>
                      </div>
                      <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite réserver mon bilan gratuit de 15min avec un coach.', '_blank')} className="w-full bg-black text-white py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors">Réserver</button>
                   </div>

                   <div className="bg-zinc-50 border border-zinc-100 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden hover:border-[#39FF14] transition-colors">
                      <div className="absolute top-0 right-0 bg-[#39FF14] text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl">Recommandé</div>
                      <div>
                         <div className="w-12 h-12 bg-black text-[#39FF14] rounded-full flex items-center justify-center mb-4"><Target size={20}/></div>
                         <h4 className="font-black uppercase text-sm mb-2">Consultation Complète (45 min)</h4>
                         <p className="text-xs text-zinc-500 font-medium mb-4">Analyse approfondie, refonte du plan alimentaire et stratégies avancées.</p>
                      </div>
                      <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite réserver une consultation complète de 45min (10.000F).', '_blank')} className="w-full bg-[#39FF14] text-black py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">Réserver (10.000 F)</button>
                   </div>
                </div>
             </div>
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
            
            {/* SECTION SMART PLANNER (Générateur) */}
            <section>
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                  <div className="flex items-center gap-3">
                     <Calendar className="text-[#39FF14] bg-black p-2 rounded-lg" size={36} />
                     <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Smart Planner</h2>
                  </div>
                  <div className="flex gap-4">
                     <button onClick={generateWeeklyMenu} className="bg-white border border-zinc-200 text-black px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-50 transition shadow-sm flex items-center gap-2">
                        <RefreshCcw size={14}/> Regénérer
                     </button>
                  </div>
               </div>

               {clientProfile?.plan_type !== 'premium' && daysLeft <= 0 ? (
                  <div className="bg-white border-2 border-dashed border-zinc-300 rounded-[2rem] p-12 text-center relative overflow-hidden">
                     <div className="w-16 h-16 bg-zinc-100 text-zinc-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={28} />
                     </div>
                     <h3 className="font-black uppercase text-xl text-black mb-2">Générateur Verrouillé</h3>
                     <p className="text-sm font-medium text-zinc-500 mb-6 max-w-md mx-auto">Votre période d'essai est terminée. Passez au plan Premium pour réactiver le Smart Planner et votre liste de courses automatique.</p>
                     <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite passer au plan Premium !', '_blank')} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 mx-auto">
                        <Sparkles size={16}/> Passer Premium
                     </button>
                  </div>
               ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                     {weeklyGeneratedMenu.map((dayPlan, dIdx) => (
                        <div key={dIdx} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition-colors group">
                           <h3 className="font-black uppercase tracking-widest text-sm mb-4 border-b border-zinc-100 pb-2 text-zinc-600">{dayPlan.day}</h3>
                           <div className="space-y-3">
                              {Object.entries(dayPlan.meals).map(([mealType, recipe]: any) => (
                                 <div key={mealType} className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 relative pr-10 hover:border-[#39FF14] transition-colors">
                                    <p className="text-[9px] font-black uppercase text-zinc-400 mb-0.5">{mealType}</p>
                                    <p className="text-xs font-bold text-black leading-tight mb-1">{recipe.nom}</p>
                                    <div className="flex gap-2 items-center">
                                       <span className="text-[10px] font-bold text-orange-500">{recipe.calories} kcal</span>
                                       {recipe.is_bol_commun && <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[8px] font-black uppercase">Bol Commun</span>}
                                    </div>
                                    <button onClick={() => handleSwapMeal(dIdx, mealType, recipe.id)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-black transition-colors p-1" title="Changer ce repas">
                                       <RefreshCcw size={14}/>
                                    </button>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </section>

            {/* SECTION MENUS DE LA SEMAINE */}
            <section className="mt-12">
               <div className="flex items-center gap-3 mb-8">
                  <Calendar className="text-[#39FF14] bg-black p-2 rounded-lg" size={36} />
                  <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter text-black`}>Vos Menus Sur-Mesure</h2>
               </div>

               <div className="grid md:grid-cols-2 gap-6">
                  {weeklyMenus.map((menu: any, idx: number) => (
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
                              <p className="text-xs font-bold text-zinc-500 mb-6">Passez au plan Premium pour débloquer la suite de votre programme.</p>
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
                                 {menu.meals.map((meal: string, i: number) => (
                                    <li key={i} className="text-xs font-bold text-zinc-700 flex items-start gap-2">
                                       <span className="text-[#39FF14] mt-0.5">●</span> {meal}
                                    </li>
                                 ))}
                              </ul>
                           </div>
                        )}
                     </motion.div>
                  ))}
               </div>
            </section>

            {/* SECTION GUIDE PDF */}
            <section>
               <div className="bg-white border border-zinc-200 p-8 md:p-10 rounded-[2rem] shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group hover:border-[#39FF14] transition-colors">
                 <div className="flex items-center gap-6 relative z-10">
                    <div className="bg-[#39FF14]/10 text-[#39FF14] p-5 rounded-2xl border border-[#39FF14]/20 group-hover:scale-110 transition-transform">
                       <Download size={32} />
                    </div>
                    <div>
                       <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-1`}>Le Guide Complet</h2>
                       <p className="text-zinc-500 font-bold text-sm">Nutrition à l'Africaine : Vos astuces et recettes de base.</p>
                    </div>
                 </div>
                 <button className="w-full md:w-auto bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2 relative z-10">
                    Télécharger mon guide (PDF)
                 </button>
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

                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Nom complet</label>
                      <input type="text" value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" required />
                   </div>

                   <div>
                      <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1 block">Nouveau mot de passe</label>
                      <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition" placeholder="Laissez vide pour ne pas modifier" />
                   </div>
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

      {/* MODALE LISTE DE COURSES */}
      {showGroceryList && (
         <div id="grocery-overlay" onClick={(e: any) => e.target.id === 'grocery-overlay' && setShowGroceryList(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 sm:p-10 rounded-3xl max-w-2xl w-full relative shadow-2xl border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto max-h-[90vh] overflow-y-auto">
               <button onClick={() => setShowGroceryList(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter mb-2 flex items-center gap-3`}><ShoppingCart size={32} className="text-[#39FF14]" /> Liste de Courses</h2>
               <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">Générée automatiquement d'après votre menu</p>

               <div className="space-y-8">
                  {Object.entries(getGroceryList()).map(([rayon, items]: any) => {
                     if (Object.keys(items).length === 0) return null;
                     return (
                        <div key={rayon}>
                           <h4 className="font-black uppercase text-sm mb-3 text-black bg-zinc-100 p-3 rounded-xl border border-zinc-200">{rayon}</h4>
                           <ul className="grid md:grid-cols-2 gap-x-6 gap-y-3 px-2">
                              {Object.entries(items).map(([nom, data]: any) => (
                                 <li key={nom} className="flex items-center justify-between text-sm font-medium border-b border-zinc-100 pb-2">
                                    <span className="text-zinc-700">{nom}</span>
                                    <span className="font-black text-black">{data.quantite} {data.unite}</span>
                                 </li>
                              ))}
                           </ul>
                        </div>
                     );
                  })}
               </div>
            </div>
         </div>
      )}

        {activeTab === 'favorites' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-4xl mx-auto">
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-6`}><HeartPulse className="text-[#39FF14] bg-black p-2 rounded-xl" size={36}/> Recettes Enregistrées</h2>
                <div className="grid md:grid-cols-2 gap-4">
                   {favoriteMeals.map((fav, i) => {
                       const isDBFood = !!fav.valeurs_pour_100g;
                       const name = fav.meal || fav.nom;
                       const cals = fav.cals || fav.calories || (isDBFood ? fav.valeurs_pour_100g.calories : 0);
                       const prots = fav.proteins || (isDBFood ? fav.valeurs_pour_100g.proteines : 0);
                       return (
                       <div key={i} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col justify-between hover:border-[#39FF14] transition-colors group">
                           <div>
                               <div className="flex justify-between items-start mb-2">
                                   <p className="font-bold text-sm text-black">{name}</p>
                                   <button onClick={() => toggleFavorite(fav)} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={16}/></button>
                               </div>
                               <div className="flex gap-3 text-[10px] font-black uppercase text-zinc-500 mb-4">
                                   <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500"/> {cals} kcal</span>
                                   <span className="flex items-center gap-1"><Target size={12} className="text-[#39FF14]"/> {prots}g prot</span>
                               </div>
                           </div>
                           <button onClick={() => {
                               if(isDBFood) {
                                   setSelectedFoodDB(fav);
                                   setFoodSearchQuery(fav.nom);
                                   setActiveTab('today');
                                   setSelectedMealModal({ type: 'Collation', mode: 'flexible' });
                               } else {
                                   confirmMealLog(name, cals, prots, fav.carbs || 0, fav.fats || 0, fav);
                                   alert("Ajouté au tracker du jour !");
                               }
                           }} className="w-full bg-zinc-200 text-black py-3 rounded-xl text-[10px] font-black uppercase hover:bg-black hover:text-[#39FF14] transition-all flex justify-center items-center gap-2">
                               <CheckCircle size={14}/> Ajouter au menu du jour
                           </button>
                       </div>
                   )})}
                   {favoriteMeals.length === 0 && (
                      <div className="col-span-full py-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl">
                         <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">Aucune recette sauvegardée.</p>
                         <p className="text-zinc-400 text-xs mt-1">Utilisez le bouton "Cœur" sur un plat pour le retrouver ici.</p>
                      </div>
                   )}
                </div>
             </div>
          </div>
        )}

        {/* VUE TRACKER DE POIDS */}
        {activeTab === 'weight' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-left-4 max-w-4xl mx-auto">
             <div className="bg-white p-8 sm:p-12 rounded-[2rem] border border-zinc-200 shadow-sm text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 blur-[50px] rounded-full pointer-events-none"></div>
                <Scale size={48} className="mx-auto mb-6 text-[#39FF14]" />
                <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter text-black mb-2`}>Tracker de Poids</h2>
                <p className="text-zinc-500 font-bold mb-10 max-w-md mx-auto">Une pesée par semaine, pas plus. La constance bat l'obsession. Ajustez le curseur et validez.</p>
                
                <div className="max-w-md mx-auto bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 mb-10 shadow-inner">
                   <p className="text-7xl font-black text-black mb-8 tracking-tighter">{currentWeightInput} <span className="text-2xl text-zinc-400">kg</span></p>
                   <input 
                      type="range" min="40" max="150" step="0.5" 
                      value={currentWeightInput} 
                      onChange={e => setCurrentWeightInput(parseFloat(e.target.value))}
                      className="w-full accent-black h-3 bg-zinc-200 rounded-full appearance-none cursor-pointer mb-8"
                   />
                   <button onClick={handleSaveWeight} className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-xl">
                       Enregistrer ma pesée
                   </button>
                </div>

                {weightLogs.length > 0 && (
                   <div className="h-72 w-full mt-10 pt-8 border-t border-zinc-100">
                     <h3 className="text-left font-black uppercase text-sm text-zinc-400 tracking-widest mb-6">Évolution</h3>
                     <ResponsiveContainer width="100%" height="100%">
                       <LineChart data={weightLogs}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                         <XAxis dataKey="log_date" tickFormatter={(v) => new Date(v).toLocaleDateString('fr-FR', {day:'numeric', month:'short'})} stroke="#a1a1aa" fontSize={10} axisLine={false} tickLine={false} />
                         <YAxis domain={['auto', 'auto']} stroke="#a1a1aa" fontSize={10} axisLine={false} tickLine={false} />
                         <RechartsTooltip contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                         <Line type="monotone" dataKey="weight" stroke="#39FF14" strokeWidth={4} dot={{ r: 6, fill: '#000', stroke: '#39FF14', strokeWidth: 2 }} activeDot={{ r: 8 }} />
                       </LineChart>
                     </ResponsiveContainer>
                   </div>
                )}
             </div>
          </div>
        )}

        {/* VUE COMMUNAUTÉ (FEED) */}
        {activeTab === 'community' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 max-w-3xl mx-auto">
             <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                     <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3`}><Camera className="text-[#39FF14]" /> Le Mur des Assiettes</h2>
                     <p className="text-zinc-500 text-sm font-bold">Partagez vos repas sains avec la communauté Premium Onyx.</p>
                  </div>
                  <button onClick={openLeaderboard} className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-1 shadow-sm border border-yellow-200 shrink-0">
                     <Trophy size={14}/> Classement
                  </button>
                </div>
                
                <div className="bg-zinc-50 border border-zinc-100 p-4 rounded-2xl focus-within:border-black transition-colors">
                   {newPostImage && (
                       <div className="relative w-24 h-24 mb-3 rounded-xl overflow-hidden border border-zinc-200">
                          <img src={newPostImage} className="w-full h-full object-cover" />
                          <button onClick={() => setNewPostImage(null)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full hover:bg-red-500"><X size={12}/></button>
                       </div>
                   )}
                   <textarea value={newPostText} onChange={e => setNewPostText(e.target.value)} placeholder="Qu'y a-t-il dans votre assiette aujourd'hui ?" className="w-full bg-transparent resize-none outline-none font-medium text-sm min-h-[80px]" />
                   <div className="flex justify-between items-center mt-2 pt-2 border-t border-zinc-200">
                      <label className="text-zinc-400 hover:text-black transition-colors p-2 cursor-pointer">
                         <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                         {uploadingImage ? <Activity size={20} className="animate-spin" /> : <ImageIcon size={20}/>}
                      </label>
                      <button onClick={handlePostCommunity} className="bg-black text-[#39FF14] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md">Publier (+15 XP)</button>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                {communityPosts.map((post, idx) => (
                   <div key={post.id || idx} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                      <div className="flex items-center gap-3 mb-4">
                         <div className="w-10 h-10 bg-black text-[#39FF14] rounded-full flex items-center justify-center font-black">{post.client?.charAt(0) || 'M'}</div>
                         <div>
                            <p className="font-bold text-sm text-black">{post.client}</p>
                            <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString('fr-FR', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</p>
                         </div>
                         {post.client === user?.full_name && <span className="ml-auto bg-yellow-100 text-yellow-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">Premium</span>}
                      </div>
                      <p className="text-zinc-700 font-medium text-sm mb-4 leading-relaxed">{post.content}</p>
                      {post.image_url && <img src={post.image_url} alt="Plat" className="w-full h-64 object-cover rounded-2xl mb-4 border border-zinc-100" />}
                      
                      <div className="flex items-center gap-2 pt-4 border-t border-zinc-100">
                         <button className="flex items-center gap-1.5 bg-zinc-50 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 transition-colors">🔥 Top {post.reactions?.top > 0 && `(${post.reactions.top})`}</button>
                         <button className="flex items-center gap-1.5 bg-zinc-50 hover:bg-green-50 hover:text-green-600 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 transition-colors">🥗 Sain {post.reactions?.sain > 0 && `(${post.reactions.sain})`}</button>
                         <button className="flex items-center gap-1.5 bg-zinc-50 hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-500 transition-colors">💪 Courage {post.reactions?.courage > 0 && `(${post.reactions.courage})`}</button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        )}

      {/* MODALE LEADERBOARD */}
      {showLeaderboard && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowLeaderboard(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[3rem] max-w-2xl w-full relative shadow-[0_0_50px_rgba(57,255,20,0.15)] border-t-[8px] border-yellow-400 animate-in zoom-in-95 my-auto max-h-[90vh] flex flex-col overflow-hidden">
            <button onClick={() => setShowLeaderboard(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all text-zinc-500 z-[60]">
              <X size={20} />
            </button>
            <div className="text-center mb-8 shrink-0">
               <Trophy className="mx-auto mb-3 text-yellow-400" size={40} />
               <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter`}>Classement Jongoma XP</h3>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Les membres les plus assidues de ce mois</p>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
               {/* PODIUM TOP 3 */}
               <div className="flex items-end justify-center gap-4 mb-10 pt-4">
                  {leaderboardData.length > 1 && (
                     <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
                        <div className="w-12 h-12 rounded-full border-2 border-zinc-300 overflow-hidden mb-2 relative">
                           <img src={leaderboardData[1].avatar_url || `https://ui-avatars.com/api/?name=${leaderboardData[1].full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover"/>
                           <div className="absolute -bottom-1 -right-1 bg-zinc-400 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">2</div>
                        </div>
                        <div className="bg-zinc-100 w-20 h-24 rounded-t-xl flex flex-col items-center justify-start pt-2 border-t-4 border-zinc-300">
                           <span className="text-[10px] font-bold mt-1 text-zinc-500">{leaderboardData[1].xp} XP</span>
                        </div>
                        <p className="text-[10px] font-black uppercase mt-2 text-zinc-600 truncate max-w-[70px]">{leaderboardData[1].full_name.split(' ')[0]}</p>
                     </div>
                  )}
                  {leaderboardData.length > 0 && (
                     <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
                        <div className="w-16 h-16 rounded-full border-4 border-yellow-400 overflow-hidden mb-2 relative shadow-[0_0_20px_rgba(250,204,21,0.5)]">
                           <img src={leaderboardData[0].avatar_url || `https://ui-avatars.com/api/?name=${leaderboardData[0].full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover"/>
                           <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">1</div>
                        </div>
                        <div className="bg-yellow-50 w-24 h-32 rounded-t-xl flex flex-col items-center justify-start pt-2 border-t-4 border-yellow-400">
                           <span className="text-xs font-black mt-1 text-yellow-600">{leaderboardData[0].xp} XP</span>
                        </div>
                        <p className="text-[11px] font-black uppercase mt-2 text-yellow-600 truncate max-w-[80px]">{leaderboardData[0].full_name.split(' ')[0]}</p>
                     </div>
                  )}
                  {leaderboardData.length > 2 && (
                     <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-200">
                        <div className="w-12 h-12 rounded-full border-2 border-orange-400 overflow-hidden mb-2 relative">
                           <img src={leaderboardData[2].avatar_url || `https://ui-avatars.com/api/?name=${leaderboardData[2].full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover"/>
                           <div className="absolute -bottom-1 -right-1 bg-orange-400 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">3</div>
                        </div>
                        <div className="bg-orange-50 w-20 h-20 rounded-t-xl flex flex-col items-center justify-start pt-2 border-t-4 border-orange-400">
                           <span className="text-[10px] font-bold mt-1 text-orange-600">{leaderboardData[2].xp} XP</span>
                        </div>
                        <p className="text-[10px] font-black uppercase mt-2 text-orange-500 truncate max-w-[70px]">{leaderboardData[2].full_name.split(' ')[0]}</p>
                     </div>
                  )}
               </div>

               {/* LISTE DES AUTRES */}
               <div className="space-y-2">
                  {leaderboardData.slice(3).map((student, idx) => (
                     <div key={student.id || idx} className={`flex items-center justify-between p-3 rounded-xl border ${student.id === clientProfile?.id ? 'bg-[#39FF14]/10 border-[#39FF14]/50' : 'bg-zinc-50 border-zinc-100'}`}>
                        <div className="flex items-center gap-3">
                           <span className="font-black text-zinc-400 w-4 text-xs">{idx + 4}</span>
                           <img src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.full_name}&background=random`} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-200 object-cover" />
                           <p className={`font-bold text-sm ${student.id === clientProfile?.id ? 'text-[#39FF14]' : 'text-black'}`}>{student.full_name} {student.id === clientProfile?.id ? '(Vous)' : ''}</p>
                        </div>
                        <span className="font-black text-zinc-600 text-xs">{student.xp} XP</span>
                     </div>
                  ))}
               </div>
            </div>
            <div className="pt-6 border-t border-zinc-100 shrink-0">
               <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent("Salut ! Je te mets au défi de me battre sur le classement Jongoma XP de OnyxNutrition ! Rejoins-moi et voyons qui aura le plus de points cette semaine 🔥💪\n\nhttps://onyxlinks.com/nutrition")}`, '_blank')} className="w-full bg-[#25D366] text-white py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex justify-center items-center gap-2">
                  <MessageCircle size={18}/> Défier une amie sur WhatsApp
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE REFAIRE LE DIAGNOSTIC (ROKHY) */}
      {showRedoDiagModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowRedoDiagModal(false)} className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[3rem] max-w-md w-full relative shadow-[0_0_50px_rgba(57,255,20,0.3)] border-t-[8px] border-[#39FF14] animate-in zoom-in-95">
            <button onClick={() => setShowRedoDiagModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
            
            <div className="flex items-center gap-4 mb-6 border-b border-zinc-100 pb-6">
              <div className="relative">
                <img src="https://ui-avatars.com/api/?name=Rokhy&background=0D8ABC&color=fff" alt="Rokhy" className="w-16 h-16 rounded-full border-2 border-[#39FF14]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#39FF14] border-2 border-white rounded-full animate-pulse"></div>
              </div>
              <div>
                <h3 className="font-black uppercase text-xl text-black leading-none">Rokhy</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Coach Nutrition</p>
              </div>
            </div>

            <p className="text-sm font-bold text-zinc-700 mb-6 leading-relaxed">
              Salut ! Je vois que tu souhaites refaire ton bilan. Avant de continuer, dis-moi pourquoi ?
            </p>

            <div className="space-y-3 mb-6">
              {["Je stagne dans ma perte de poids", "J'ai atteint mon objectif !", "Mes mensurations ont changé", "Je veux tester un autre mode"].map(reason => (
                <button key={reason} onClick={() => setRedoReason(reason)} className={`w-full text-left p-4 rounded-xl border-2 font-bold text-xs transition-all ${redoReason === reason ? 'bg-black text-[#39FF14] border-black shadow-md' : 'bg-zinc-50 border-zinc-200 hover:border-black'}`}>
                   {reason}
                </button>
              ))}
            </div>

            {redoReason && (
               <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl mb-6 animate-in fade-in slide-in-from-top-2">
                  <p className="text-[10px] font-black uppercase text-orange-600 tracking-widest flex items-center gap-2 mb-1"><AlertTriangle size={14}/> Attention</p>
                  <p className="text-xs font-medium text-orange-800 leading-relaxed">
                     Refaire le diagnostic va <strong>réinitialiser ton plan actuel</strong> et recalculer tes objectifs caloriques. Es-tu sûre de vouloir continuer ?
                  </p>
               </div>
            )}

            <div className="flex gap-3">
               <button onClick={() => setShowRedoDiagModal(false)} className="flex-1 bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all shadow-sm">
                  Retour au Hub
               </button>
               <button disabled={!redoReason} onClick={() => window.location.href = '/solutions/onyx-nutritionafricaine/diagnostic'} className="flex-1 bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  Continuer <ArrowRight size={14} className="inline ml-1"/>
               </button>
            </div>
          </div>
        </div>
      )}
      {/* MODALE DE PAIEMENT WAVE / OM */}
      {showPaymentModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowPaymentModal(false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white p-8 rounded-[3rem] max-w-md w-full relative shadow-[0_0_50px_rgba(57,255,20,0.15)] border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto flex flex-col overflow-hidden">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all text-zinc-500 z-[60]">
              <X size={20} />
            </button>
            <div className="text-center mb-8 shrink-0 mt-4">
               <div className="w-20 h-20 bg-black text-[#39FF14] rounded-[2rem] mx-auto flex items-center justify-center mb-6 shadow-xl"><CreditCard size={32} /></div>
               <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter`}>Renouvellement Premium</h3>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-2">Paiement sécurisé via PayDunya</p>
            </div>
            
            <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-100 mb-8">
               <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-sm">Abonnement Mensuel</span>
                  <span className="font-black text-xl">2 900 F</span>
               </div>
               <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Prolongez votre accès au Smart Planner, au générateur de listes de courses, et au réseau communautaire privé OnyxNutrition.
               </p>
            </div>

            <div className="space-y-3">
               <button onClick={() => {
                   window.open('https://pay.onyxlinks.com/renew-nutrition', '_blank');
                   if(confirm("Simulation: Avez-vous terminé le paiement Wave/OM ?")) { handleProcessPayment(); }
               }} className="w-full bg-[#1b74e4] text-white py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex justify-center items-center gap-2">
                  Payer avec Wave
               </button>
               <button onClick={() => {
                   window.open('https://pay.onyxlinks.com/renew-nutrition', '_blank');
                   if(confirm("Simulation: Avez-vous terminé le paiement Wave/OM ?")) { handleProcessPayment(); }
               }} className="w-full bg-[#ff6600] text-white py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex justify-center items-center gap-2">
                  Payer avec Orange Money
               </button>
            </div>
          </div>
        </div>
      )}

      {/* INTERVENTION AVATAR ROKHY (IA) */}
      {rokhyMessage && (
         <div className="fixed bottom-6 left-6 z-[110] bg-white p-5 rounded-3xl shadow-2xl border border-zinc-100 max-w-sm flex gap-4 animate-in slide-in-from-bottom-8">
            <div className="relative shrink-0">
               <img src="https://ui-avatars.com/api/?name=Rokhy&background=0D8ABC&color=fff&rounded=true" alt="Rokhy Coach IA" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
               <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#39FF14] border-2 border-white rounded-full"></div>
            </div>
            <div>
               <div className="flex justify-between items-start mb-1">
                  <h4 className="font-black text-sm text-black flex items-center gap-2">Rokhy (Coach IA)</h4>
                  <button onClick={() => setRokhyMessage(null)} className="text-zinc-400 hover:text-black"><X size={14}/></button>
               </div>
               <p className={`text-xs font-bold ${rokhyMessage.type === 'warning' ? 'text-orange-600' : 'text-zinc-600'} leading-relaxed`}>{rokhyMessage.text}</p>
            </div>
         </div>
      )}
    </main>
  );
}
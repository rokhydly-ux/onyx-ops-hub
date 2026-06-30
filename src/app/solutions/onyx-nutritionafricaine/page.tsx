"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Activity, HeartPulse, Smartphone, Flame, CheckCircle, Wind, Droplet,
  ArrowRight, ChevronLeft, AlertTriangle, Zap, ChevronDown, ChevronRight,
  Send, X, ArrowUp, BookOpen, Sparkles, Target, Apple, Scale, Download, MessageSquare, Lock, FileText, ShoppingBag, Utensils
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Autoplay from "embla-carousel-autoplay";
import jsPDF from "jspdf";

const spaceGrotesk = { className: "font-sans" };

const TESTIMONIALS = [
  {
    name: "Aïssatou K.",
    role: "35 ans, Mère de famille, Dakar",
    text: "Finie la fatigue de l'après-midi. Je mange avec mes enfants et le suivi WhatsApp me motive tous les jours !",
    image: "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg", // Placeholder, replace with actual image if available
    stats: "-8 kg en 3 mois"
  },
  {
    name: "Penda DIOP",
    role: "56 ans, Retraitée, Saint-Louis",
    text: "Mon médecin m'avait dit de faire attention au diabète et au sel. L'application m'a sauvé la vie en me montrant comment remplacer le cube Maggi par le Nététou brut.",
    image: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781190763/An_authentic_photorealistic_full-body_portrait_202606111507_ukx5d4.jpg",
    stats: "Profil Périménopause"
  },
  {
    name: "Amadou T.",
    role: "62 ans, Cadre, Dakar",
    text: "J'ai éliminé mon ventre de sédentaire en 2 mois au restaurant en apprenant à choisir les bonnes céréales. Ma tension est redevenue stable.",
    image: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781190763/An_authentic_photorealistic_full-body_portrait_202606111512_f3zs3t.jpg",
    stats: "Profil Tension & Ventre Plat"
  }
];

const CalorieGauge = ({ value, maxValue = 1200, colorClass, label }: { value: number, maxValue?: number, colorClass: string, label: string }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / maxValue, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-current text-zinc-200"
            strokeWidth="12"
            fill="transparent"
          />
          {/* Progress circle */}
          <motion.circle
            cx="50"
            cy="50"
            r={radius}
            className={`stroke-current ${colorClass}`}
            strokeWidth="12"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: offset }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "circOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-black ${colorClass}`}>{value}</span>
          <span className="text-xs font-bold text-zinc-500">kcal</span>
        </div>
      </div>
      <p className="text-xs font-black uppercase tracking-widest text-center">{label}</p>
    </div>
  );
};

const INGREDIENTS = [
  { name: "Le Fonio", benefits: "L'alternative n'1 au riz blanc", desc: "Indice glycémique très bas, idéal pour couper la faim des diabétiques. Retrouvez-le au rayon terroir chez Auchan Sénégal.", icon: "🌾" },
  { name: "Le Soumbala (Nététou)", benefits: "Notre bouillon cube naturel", desc: "Donne le goût traditionnel aux sauces tout en aidant à réguler la tension artérielle. Disponible sur tous les marchés locaux.", icon: "🍲" },
  { name: "La Poudre de Bouye (Baobab)", benefits: "6 fois plus riche en vitamine C que l'orange", desc: "Ses fibres se transforment en gel coupe-faim naturel dans l'estomac. Un coupe-faim naturel et délicieux.", icon: "🌳" },
  { name: "Le Riz local étuvé", benefits: "Moins transformé que le riz blanc", desc: "Une option plus saine que le riz blanc classique, avec un indice glycémique légèrement plus bas. Retrouvez-le chez Auchan Sénégal.", icon: "🍚" }
];

const DISH_CALORIES: Record<string, { calories: number; optimizedCalories: number; tip: string }> = {
  "Thieboudienne (Plat standard)": {
    calories: 850,
    optimizedCalories: 550,
    tip: "En réduisant l'huile et en privilégiant le poisson, on peut facilement descendre à 550 kcal tout en gardant le goût !"
  },
  "Mafé (Plat standard)": {
    calories: 950,
    optimizedCalories: 600,
    tip: "Le secret ? Contrôler la quantité de pâte d'arachide et d'huile. Une version rééquilibrée tourne autour de 600 kcal."
  },
  "Yassa Poulet (Plat standard)": {
    calories: 750,
    optimizedCalories: 500,
    tip: "Utiliser du poulet sans la peau et une cuisson avec moins d'huile (ou Air Fryer) peut ramener ce plat à 500 kcal."
  }
};

const FAQ_DATA = [
  {
    question: "Est-ce un régime restrictif ?",
    answer: "Non, pas du tout. 'Nutrition à l'Africaine' est un rééquilibrage alimentaire, pas un régime. Nous n'éliminons aucun groupe d'aliments. Le but est de vous apprendre à manger les bonnes portions de VOS plats, pour des résultats durables sans frustration."
  },
  {
    question: "Dois-je arrêter de manger du Thieboudienne ou du Mafé ?",
    answer: "Absolument pas ! C'est le cœur de notre méthode. Nous vous montrons comment continuer à manger vos plats préférés en ajustant simplement les quantités et la fréquence, pour qu'ils s'intègrent dans votre objectif de perte de poids."
  },
  {
    question: "Comment fonctionne le suivi sur WhatsApp ?",
    answer: "Chaque semaine, vous avez un point avec votre coach nutritionniste directement sur WhatsApp. Vous pouvez poser vos questions, partager vos repas en photo pour des conseils, et recevoir la motivation nécessaire. C'est comme avoir un expert dans votre poche."
  },
  {
    question: "Est-ce que ça coûte cher en courses ?",
    answer: "Non, car notre programme est basé sur les aliments que vous achetez déjà au marché local. Pas de quinoa, de baies de goji ou de produits importés coûteux. On optimise ce qui est déjà dans votre cuisine."
  },
  {
    question: "En combien de temps puis-je voir des résultats ?",
    answer: "La plupart de nos membres ressentent une différence (plus d'énergie, moins de ballonnements) dès la première semaine. La perte de poids visible commence généralement dès le premier mois. Notre objectif est une perte de poids saine et durable, pas un 'choc' pour votre corps."
  }
];

const FAMILY_APPROACH_POINTS_NEW = [
  {
    icon: "🍲",
    title: "Partagez la même sauce",
    text: "Vous mangez le même Yassa savoureux (légumes, poisson, zébu) que vos proches."
  },
  {
    icon: "🔄",
    title: "Le 'Switch' Intelligent",
    text: "Pendant que la famille prend le riz blanc lourd, vous versez votre portion de Fonio précuit ou de Riz local étuvé acheté chez Auchan Sénégal. C'est simple et discret."
  },
  {
    icon: "⚖️",
    title: "Le Contrôle des Portions",
    text: "L'application vous apprend à vous servir la juste quantité dans le bol commun sans frustration."
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Montrez l'exemple",
    text: "En mangeant plus sainement sans vous isoler, vous inspirez positivement vos proches. Le bien-être devient une affaire de famille." // Kept this one as it's still relevant
  }
];

const HERO_SLIDES = [
  {
    image: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781371355/A_cinematic_16_9_split-screen_before-and-after_202606131604_id9wzx.jpg",
    title: "PERDEZ JUSQU'À 8 KG CE MOIS-CI.",
    highlight: "SANS RÉGIME TOUBAB.",
    sub: "Affinez vos bras et retrouvez un ventre plat tout en mangeant du Yassa et du Thieb. Le rééquilibrage 100% sénégalais."
  },
  {
    image: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781361008/A_cinematic_16_9_wide_shot_202606131426_deadb8.jpg",
    title: "ADIEU LE GROS VENTRE.",
    highlight: "BONJOUR L'ÉNERGIE.",
    sub: "Fini les ballonnements de l'après-midi. Apprenez à doser l'huile et remplacez le riz blanc pour une silhouette harmonieuse."
  },
  {
    image: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781361008/remplace_ses_vetements_avec_la_202606131429_l6inum.jpg",
    title: "LA SANTÉ AVANT TOUT.",
    highlight: "UNE LIGNE AFFINÉE.",
    sub: "Régulez votre tension et traversez la ménopause avec légèreté grâce aux super-aliments de nos marchés."
  }
];

export default function NutritionAfricaineLanding() {
  const router = useRouter();
  const waNumber = "221785338417";
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Modale Diagnostic State
  const [showDiagnosticModal, setShowDiagnosticModal] = useState(false);
  const hasAutoOpened = useRef(false);
  const [diagStep, setDiagStep] = useState(1);
  const [isSubmittingDiag, setIsSubmittingDiag] = useState(false);
  const [diagData, setDiagData] = useState({
  gender: "",
  age: "",
  goal: "",
  height: "",
  currentWeight: "",
  targetWeight: "",
  targetDate: "",
  sleepHours: "",
  dailyCommute: "",
  healthProfile: "",
  femaleSpecific: "",
  waterIntake: "",
  pastDiets: "",
  cookingFats: [] as string[],
  mainMealElement: "",
  eveningMeal: "",
  lunchHabit: "",
  cookingHabit: "",
  weeklyBudget: "",
  name: "",
  phone: ""
});
  const [forceTarget, setForceTarget] = useState(false);
  const [tempCredentials, setTempCredentials] = useState({ phone: "", password: "" });

  // Carousel & FAQ State
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showFreeMenuModal, setShowFreeMenuModal] = useState(false);
  const [freeMenuData, setFreeMenuData] = useState({ name: '', contact: '' });
  
  const [recentRecipe, setRecentRecipe] = useState<string | null>(null);

  // Calorie Calculator State
  const [selectedDish, setSelectedDish] = useState<string>("");
  const [dishInfo, setDishInfo] = useState<{ calories: number; optimizedCalories: number; tip: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Lead Capture State for Calculator
  const [calcLeadData, setCalcLeadData] = useState({ name: '', phone: '' });
  const [isCalcLeadCaptured, setIsCalcLeadCaptured] = useState(false);
  const [pendingDish, setPendingDish] = useState<string>("");
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  
  const [emblaStoreRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 3000, stopOnInteraction: false, stopOnMouseEnter: true })]);

  // Nouvelle logique Parallax globale liée au scroll de la page
  const { scrollYProgress } = useScroll(); 
  
  // 1. Fonio (en haut à droite, monte très lentement)
  const yFonio = useTransform(scrollYProgress, [0, 1], [0, -400]);
  // 2. Bissap (milieu gauche, descend légèrement avec très lente rotation)
  const yBissap = useTransform(scrollYProgress, [0, 1], [0, 300]);
  const rotateBissap = useTransform(scrollYProgress, [0, 1], [0, 15]);
  // 3. Moringa (3/4 droite, Y statique, s'éloigne/se réduit)
  const scaleMoringa = useTransform(scrollYProgress, [0, 1], [1, 0.6]);
  // 4. Bouye (en bas à gauche, remonte délicatement en tournant)
  const yBouye = useTransform(scrollYProgress, [0, 1], [0, -800]);
  const rotateBouye = useTransform(scrollYProgress, [0, 1], [0, 90]);

  const [heroSlide, setHeroSlide] = useState(0);
  useEffect(() => {
      const interval = setInterval(() => {
          setHeroSlide(prev => (prev + 1) % HERO_SLIDES.length);
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      const fetchRecentRecipe = async () => {
          const { data } = await supabase.from('nutrition_recipes').select('nom').order('created_at', { ascending: false }).limit(1);
          if (data && data.length > 0) setRecentRecipe(data[0].nom);
      };
      fetchRecentRecipe();
  }, []);

  const nextTestimonial = () => setActiveTestimonial((prev) => (prev + 1) % TESTIMONIALS.length);
  const prevTestimonial = () => setActiveTestimonial((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);

  // FOMO Timer
  const [fomoTime, setFomoTime] = useState(900);
  useEffect(() => {
    const interval = setInterval(() => setFomoTime(prev => prev > 0 ? prev - 1 : 0), 1000);
    return () => clearInterval(interval);
  }, []);
  const formatTime = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    if (fomoTime > 0 && fomoTime <= 10) {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(() => {});
    }
  }, [fomoTime]);

  useEffect(() => {
      const fetchStore = async () => {
          const { data } = await supabase.from('nutrition_products').select('*').limit(6);
          if (data && data.length > 0) setStoreProducts(data);
      };
      fetchStore();
  }, []);

  const triggerResult = async (dishName: string) => {
      if (DISH_CALORIES[dishName]) {
          setDishInfo(DISH_CALORIES[dishName]);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 5000);
          
      // Sauvegarde du choix en arrière-plan pour analyse
      try {
         await supabase.from('leads').insert([{
             full_name: calcLeadData.name || 'Visiteur (Calculateur)',
             phone: calcLeadData.phone,
             message: `Plat simulé : ${dishName}`,
             intent: "Simulation de plat",
             source: "Calculateur Calories",
             status: 'Nouveau',
             saas: "Nutrition à l'Africaine"
         }]);
      } catch (err) {}
      }
  };

  // Calorie Calculator Handler
  const handleDishChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const dishName = e.target.value;
    setSelectedDish(dishName);
    
    if (!dishName) {
      setDishInfo(null);
      setPendingDish("");
      return;
    }

    if (isCalcLeadCaptured) {
      triggerResult(dishName);
    } else {
      setPendingDish(dishName);
      setDishInfo(null);
    }
  };


  const getHealthyDate = (currentW: number, targetW: number) => {
    const weightToLose = currentW - targetW;
    if (weightToLose <= 0) return null;

    // Perte saine = max 1% du poids corporel par semaine.
    // On prend une moyenne plus douce de 0.5kg à 0.8kg par semaine pour être réaliste.
    const weeklyLoss = Math.min(0.8, currentW * 0.01);
    const weeksNeeded = weightToLose / weeklyLoss;
    const daysNeeded = weeksNeeded * 7;

    const healthyDate = new Date();
    healthyDate.setDate(healthyDate.getDate() + daysNeeded);
    return healthyDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

  const calculateDailyCalories = (data: any) => {
    const heightCm = parseFloat(data.height) || 0;
    const currentWeight = parseFloat(data.currentWeight) || 0;
    const targetWInput = parseFloat(data.targetWeight) || 0;
    const age = parseFloat(data.age) || 0;
    const isMale = data.gender === "Homme";

    // 1. Calcul du BMR (Mifflin-St Jeor)
    let bmr = (heightCm > 0 && currentWeight > 0 && age > 0) ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161) : 0;

    // 2. Modificateur Hormonal (SOPK / Ménopause / Hypothyroïdie)
    if (data.gender === "Femme" && (data.femaleSpecific === "SOPK" || data.femaleSpecific === "Périménopause / Ménopause" || data.healthProfile === "Hypothyroïdie")) {
        bmr = bmr * 0.90; // Malus métabolique de -10%
    }

    // 3. Calcul du TDEE via le NAP
    let nap = 1.2;
    if (data.dailyCommute === "Marche/Activité légère") nap = 1.375;
    else if (data.dailyCommute === "Travail physique/Modérée") nap = 1.55;
    else if (data.dailyCommute === "Sport intense/Intense") nap = 1.725;
    let tdee = bmr * nap;

    // 4. Bonus Allaitement / Grossesse
    if (data.gender === "Femme" && (data.femaleSpecific === "Allaitement" || data.femaleSpecific === "Grossesse")) {
        tdee += 400; // Bonus énergétique vital pour la maman
    }

    // 5. Calcul du déficit (selon la date cible)
    let requiredDailyDeficit = 0;
    const userTargetDate = data.targetDate ? new Date(data.targetDate) : new Date();
    const now = new Date();
    const daysToTarget = Math.max(1, Math.ceil((userTargetDate.getTime() - now.getTime()) / (1000 * 3600 * 24)));
    const weightToLose = currentWeight - targetWInput;

    if (data.goal === 'perte_poids' && weightToLose > 0) {
        requiredDailyDeficit = (weightToLose * 7700) / daysToTarget;
    }

    // 6. Plafond du déficit (Max 1000 kcal/jour pour éviter la fonte musculaire)
    if (requiredDailyDeficit > 1000) {
        requiredDailyDeficit = 1000;
    }

    let rawCalories = tdee;
    if (data.goal === 'perte_poids') rawCalories = tdee - requiredDailyDeficit;
    else if (data.goal === 'prise_masse') rawCalories = tdee + 300;
    // Si Maintien, rawCalories = tdee

    // 7. Plancher Médical (Anti-privation : Interdit de descendre sous 1200/1500)
    const floorCalories = isMale ? 1500 : 1200;
    const finalCalories = Math.max(floorCalories, rawCalories);

    return {
        calories: Math.round(finalCalories),
        deficit: Math.round(tdee - finalCalories),
        tdee: Math.round(tdee),
        hitFloor: finalCalories === floorCalories,
        hitCeiling: requiredDailyDeficit === 1000
    };
};




  // Diagnostic Modal Handlers
  const handleDiagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingDiag(true);

    try {
        const cleanPhone = diagData.phone.replace(/\s+/g, '');
        const generatedEmail = `${cleanPhone}@clients.onyxcrm.com`;
        const generatedPassword = cleanPhone.slice(-8).padStart(8, "0");

        let realUserId = null;

        // 1. Tenter la connexion en priorité (si l'utilisateur a déjà essayé avant)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: generatedEmail,
            password: generatedPassword
        });

        if (authData?.user) {
            realUserId = authData.user.id;
        } else {
            // 2. Le compte n'existe pas, on tente de le créer via l'API Onyx
            await fetch('/api/create-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: diagData.name,
                    phone: cleanPhone,
                    password: generatedPassword,
                    role: 'client',
                    saas: "Nutrition à l'Africaine"
                })
            });

            // 3. Et on se connecte immédiatement
            const { data: newAuthData, error: newAuthError } = await supabase.auth.signInWithPassword({
                email: generatedEmail,
                password: generatedPassword
            });

            if (newAuthError) {
                // 4. PLAN B (Sécurité anti-crash) : Inscription native Supabase si l'API a foiré
                const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                    email: generatedEmail,
                    password: generatedPassword,
                    options: { data: { full_name: diagData.name, phone: cleanPhone } }
                });

                if (signUpError) throw new Error("Échec d'authentification : " + signUpError.message);
                realUserId = signUpData.user?.id;
            } else {
                realUserId = newAuthData.user?.id;
            }
        }

        if (!realUserId) throw new Error("Impossible d'identifier l'utilisateur.");

        // 5. FIX CLÉ ÉTRANGÈRE : Upsert OBLIGATOIRE dans la table 'clients'
        const { error: clientErr } = await supabase.from('clients').upsert({
            id: realUserId,
            full_name: diagData.name,
            phone: cleanPhone
        }, { onConflict: 'id' });

        if (clientErr) throw new Error("Erreur synchronisation client : " + clientErr.message);

        // 6. Calcul de l'algorithme métabolique
        const profile = calculateDailyCalories(diagData);

        // 7. Sauvegarde du Profil Nutritionnel
        const payload = {
            client_id: realUserId,
            phone: cleanPhone,
            bmr: profile.bmr || Math.round(profile.tdee / 1.2),
            tdee: profile.tdee,
            daily_calorie_goal: profile.calories,
            carbs_goal: Math.round((profile.calories * 0.4) / 4),
            protein_goal: Math.round((profile.calories * 0.3) / 4),
            fats_goal: Math.round((profile.calories * 0.3) / 9),
            diagnostic_data: diagData,
            tracking_mode: 'guided'
        };

        const { error: profileErr } = await supabase.from('nutrition_profiles').upsert(payload, { onConflict: 'client_id' });
        if (profileErr) throw new Error("Erreur sauvegarde profil : " + profileErr.message);

        // Tracking d'événement
        await supabase.from('leads').insert([{
            full_name: diagData.name,
            phone: cleanPhone,
            source: "Diagnostic Nutrition Landing",
            intent: "A complété son diagnostic (Attente Plan)",
            status: "Nouveau",
            saas: "Nutrition à l'Africaine",
            message: `Objectif: ${profile.calories} kcal | Profil Santé: ${diagData.healthProfile || '-'}`
        }]);

        let welcomeMsg = "";
        if (diagData.femaleSpecific === "Allaitement" || diagData.femaleSpecific === "Grossesse") {
            welcomeMsg = `Bonjour ${diagData.name.split(' ')[0]} 🌸 ! Bienvenue chez Onyx. D'après ton profil de maman allaitante/enceinte, ton corps a besoin d'énergie. J'ai préparé ton plan avec un bonus calorique pour te soutenir en toute sécurité sans bloquer tes objectifs. Prête à commencer ?`;
        } else if (diagData.healthProfile === "Changements hormonaux" || parseFloat(diagData.age) >= 50) {
            welcomeMsg = `Bonjour ${diagData.name.split(' ')[0]} ✨ ! Bienvenue chez Onyx. La périménopause ou l'âge bloque parfois la perte de poids, mais c'est terminé ! Ton plan va réactiver ton métabolisme et protéger tes articulations tout en douceur. Prête à retrouver la forme ?`;
        } else {
            welcomeMsg = `Bonjour ${diagData.name.split(' ')[0]} 🚀 ! Bienvenue chez Onyx. Ton diagnostic est validé ! On va transformer ton corps sans que tu aies besoin d'arrêter de manger nos délicieux plats locaux. Prête à passer à l'action ?`;
        }
        localStorage.setItem('onyx_nutrition_welcome', welcomeMsg);

        // 8. Succès ! -> Affichage du Pop-up final
        setDiagStep(11);

    } catch (err: any) {
        console.error("Erreur d'enregistrement :", err);
        alert(`Une erreur est survenue: ${err.message}`);
    } finally {
        setIsSubmittingDiag(false);
    }
};

  const calculateIMC = () => {
    const h = parseFloat(diagData.height) / 100;
    const w = parseFloat(diagData.currentWeight);
    if (h > 0 && w > 0) return (w / (h * h)).toFixed(1);
    return "0";
  };

   const getIMCCategory = (imcValue: string) => {
      const val = parseFloat(imcValue);
      if (val === 0) return "-";
      if (val < 18.5) return "Insuffisance pondérale";
      if (val < 25) return "Corpulence normale";
      if (val < 30) return "Surpoids";
      if (val < 35) return "Obésité modérée";
      return "Obésité sévère";
   };

  const handleDownloadFreeMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freeMenuData.name || !freeMenuData.contact) return;
    
    try {
      await supabase.from('leads').insert([{
        full_name: freeMenuData.name,
        phone: freeMenuData.contact.includes('@') ? '' : freeMenuData.contact,
        email: freeMenuData.contact.includes('@') ? freeMenuData.contact : '',
        source: "Landing Page - Menu Gratuit",
        intent: "Téléchargement Menu Gratuit PDF",
        status: "Nouveau",
        saas: "Nutrition à l'Africaine",
        message: "A téléchargé le menu type gratuit."
      }]);
    } catch (err) {}

    setShowFreeMenuModal(false);

    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("Menu Type Gratuit - Onyx Nutrition", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Préparé pour : ${freeMenuData.name}`, 20, 30);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Exemple de Journée Type (1500 kcal)", 20, 45);
    doc.setFontSize(12);
    doc.text("• Petit-déjeuner :", 20, 60);
    doc.setFont("helvetica", "normal");
    doc.text("Lakh allégé (Mil + Lait demi-écrémé) - 300 kcal", 30, 70);
    doc.setFont("helvetica", "bold");
    doc.text("• Déjeuner :", 20, 85);
    doc.setFont("helvetica", "normal");
    doc.text("Thieboudienne diététique (Moins d'huile, 1/4 Fonio) - 550 kcal", 30, 95);
    doc.setFont("helvetica", "bold");
    doc.text("• Collation :", 20, 110);
    doc.setFont("helvetica", "normal");
    doc.text("Une poignée d'arachides grillées sans sel - 150 kcal", 30, 120);
    doc.setFont("helvetica", "bold");
    doc.text("• Dîner :", 20, 135);
    doc.setFont("helvetica", "normal");
    doc.text("Salade de Niébé fraîcheur avec vinaigrette légère - 400 kcal", 30, 145);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 160, 190, 160);
    doc.setFont("helvetica", "bold");
    doc.text("Pour obtenir un menu 100% personnalisé sur 30 jours, effectuez", 20, 175);
    doc.text("notre diagnostic en ligne sur onyxlinks.com/nutrition", 20, 185);

    doc.save(`Menu_Gratuit_Onyx_${freeMenuData.name.replace(/\s+/g, '_')}.pdf`);
    alert("Merci ! Le menu type a été téléchargé.");
    setFreeMenuData({ name: '', contact: '' });
  };

  // --- MOTEUR DE CALCUL NUTRITIONNEL (Pour le résultat Choc) ---
  
  
  // --- MOTEUR DE CALCUL NUTRITIONNEL ---


  const heightM = (parseFloat(diagData.height) || 0) / 100;
  const currentW = parseFloat(diagData.currentWeight) || 0;
  const targetWInput = parseFloat(diagData.targetWeight) || 0;
  const idealW = heightM > 0 ? 22 * (heightM * heightM) : 0;
  const diffIdealTarget = Math.abs(targetWInput - idealW);
  const showWarning = targetWInput > 0 && idealW > 0 && diffIdealTarget > 5;
  const finalTargetWeight = targetWInput > 0 ? targetWInput : idealW;
  const weightToLose = currentW - finalTargetWeight;
  const estimatedWeeks = weightToLose > 0 ? Math.ceil(weightToLose / 0.5) : 0;



  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("Bilan Nutritionnel - Onyx", 20, 20);
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date : ${new Date().toLocaleDateString('fr-FR')}`, 150, 20);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 30, 190, 30);
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text("Informations Personnelles", 20, 45);
    doc.setFontSize(12);
    doc.text(`Nom Complet : ${diagData.name}`, 20, 55);
    doc.text(`Sexe : ${diagData.gender}`, 20, 63);
    doc.text(`Âge : ${diagData.age} ans`, 100, 63);
    doc.setFontSize(16);
    doc.text("Mensurations & Objectifs", 20, 80);
    doc.setFontSize(12);
    doc.text(`Taille : ${diagData.height} cm`, 20, 90);
    doc.text(`Poids Actuel : ${diagData.currentWeight} kg`, 20, 98);
    doc.text(`Poids Cible : ${diagData.targetWeight} kg`, 100, 98);
    const imc = calculateIMC();
    const category = getIMCCategory(imc);
    doc.setFontSize(14);
    doc.setTextColor(40, 167, 69);
    doc.text(`IMC Calculé : ${imc} (${category})`, 20, 110);
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("Habitudes de Vie", 20, 130);
    doc.setFontSize(12);
    doc.text(`Niveau d'activité : ${diagData.activityLevel}`, 20, 140);
    doc.text(`Consommation plats en sauce : ${diagData.dietaryHabits}`, 20, 148);
    doc.text(`Allergies : ${diagData.allergies || "Aucune"}`, 20, 156);
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 270, 190, 270);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Diagnostic généré par l'application Onyx Nutrition à l'Africaine.", 20, 280);
    doc.save(`Diagnostic_Nutrition_${diagData.name.replace(/\s+/g, '_')}.pdf`);
    
    // Suivi automatique du téléchargement dans Supabase (Tâche en arrière-plan)
    supabase.from('leads').insert([{
      full_name: diagData.name,
      phone: diagData.phone,
      source: "Diagnostic Nutrition Landing",
      intent: "Téléchargement PDF Bilan IMC",
      status: "Nouveau",
      saas: "Nutrition à l'Africaine"
    }]).then();
  };

  const handleCalcSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!calcLeadData.name || !calcLeadData.phone) return;
    setIsCalcLeadCaptured(true);
    if (pendingDish) {
        triggerResult(pendingDish);
        setPendingDish("");
    }
  };

  // Configuration Bot Fanta
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isBotDismissed, setIsBotDismissed] = useState(false);
  const [userReply, setUserReply] = useState("");
  const [botStep, setBotStep] = useState(0);
  const [botData, setBotData] = useState({ name: '', phone: '', city: '', business: '', question: '' });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botMessages, setBotMessages] = useState<any[]>([
    { sender: 'bot', text: "👋 Nanga def ! Je suis Fanta, ton coach nutrition. Prêt(e) à retrouver un ventre plat et une belle énergie sans arrêter le Thieb ou le Yassa ? 😋", options: ["Comment ça marche ? 🤔", "Combien ça coûte ? 💰", "Je veux mon plan ! 🚀"] }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
      
      // Ouverture auto du diagnostic à 50% du scroll
      if (!hasAutoOpened.current) {
         const scrollPosition = window.scrollY + window.innerHeight;
         const pageHeight = document.documentElement.scrollHeight;
         if (scrollPosition >= pageHeight * 0.5) {
           setShowDiagnosticModal(true);
           hasAutoOpened.current = true;
         }
      }
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setIsBotOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages]);

  const processBotReply = (reply: string) => {
    if(!reply.trim()) return;
    const newMsgs = [...botMessages, { sender: 'client', text: reply }];
    setBotMessages(newMsgs);
    setUserReply("");

    setTimeout(async () => {
        let botResponse = "";
        let botOptions: string[] | undefined = undefined;
        let nextStep = botStep;
        const currentData = { ...botData };

        if (botStep === 0) {
            const lowerReply = reply.toLowerCase();
            if (lowerReply.includes('marche') || lowerReply.includes('comment')) {
                botResponse = "C'est magique et sans frustration ! 🌟 Tu fais ton diagnostic gratuit, on calcule tes besoins, et tu reçois un plan sur-mesure avec tes plats locaux préférés. En plus, on te suit sur WhatsApp chaque semaine. On commence ?";
                botOptions = ["Je veux mon plan ! 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('tarifs') || lowerReply.includes('prix') || lowerReply.includes('combien')) {
                botResponse = "Juste 2.900 F pour le premier mois d'essai ! 🎉 À ce prix, tu as ton plan personnalisé, la liste de courses et le suivi WhatsApp de nos experts. C'est moins cher qu'un fast-food. On s'y met ?";
                botOptions = ["Je veux mon plan ! 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('plan') || lowerReply.includes('inscrire') || lowerReply.includes('lance') || lowerReply.includes('oui')) {
                botResponse = "Génial ! 🚀 Pour préparer ton profil, quel est ton prénom et nom ?";
                nextStep = 1;
            } else {
                botResponse = "Je vois ! (⚠️ Attention, les places pour ce mois se remplissent très vite). Pour t'aider au mieux, quel est ton prénom et nom ?";
                currentData.question = reply;
                nextStep = 1;
            }
        }
        else if (botStep === 1) {
            currentData.name = reply;
            botResponse = `Enchantée ${reply.split(' ')[0]} ! 🌸 Quel est ton numéro WhatsApp (ex: 77 123 45 67) ?`;
            nextStep = 2;
        }
        else if (botStep === 2) {
            currentData.phone = reply;
            botResponse = "Super. Dans quelle ville te trouves-tu ?";
            nextStep = 3;
        }
        else if (botStep === 3) {
            currentData.city = reply;
            botResponse = "Parfait ! J'ai toutes les infos. Je te redirige vers notre équipe sur WhatsApp pour valider ton inscription. Prépare-toi à une belle transformation ! ✨";
            nextStep = 4;
            
            try {
                await supabase.from('leads').insert([{
                    full_name: currentData.name, phone: currentData.phone, city: currentData.city,
                    message: `Note: ${currentData.question || "Veut démarrer Nutrition à l'Africaine"}`,
                    intent: "Je veux démarrer (Nutrition à l'Africaine)", source: "Bot Fanta (Nutrition à l'Africaine)", status: 'Nouveau', saas: "Nutrition à l'Africaine"
                }]);
            } catch (err) {}

            const waMsg = `🚀 *Démarrage Nutrition à l'Africaine*\n\nJe veux commencer mon rééquilibrage !\n\n*Nom:* ${currentData.name}\n*Ville:* ${currentData.city}\n*Numéro:* ${currentData.phone}\n\nComment on procède pour valider mon 1er mois à 2.900 F ?`;
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`, "_blank"); }, 1500);
        }

        setBotData(currentData);
        setBotStep(nextStep);
        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);
    }, 500);
  };

  const handleWaClick = () => {
    const msg = `Bonjour l'équipe Onyx ! Je souhaite démarrer mon programme Nutrition à l'Africaine pour 2.900 F par mois.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 overflow-x-hidden selection:bg-[#39FF14]/30 pb-24 font-sans">
      {/* SHAKE CSS POUR LE FOMO */}
      
      {/* CONTENEUR GLOBAL PARALLAX (Arrière-plan) */}
      <div className="fixed inset-0 w-[100vw] h-[100vh] z-0 pointer-events-none overflow-hidden">
         {/* 1. Grains de Fonio */}
         <motion.img 
            style={{ y: yFonio }}
            src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781360871/6_zj9w38.png"
            className="absolute top-[-5%] right-[-10%] md:right-[-5%] w-64 md:w-96 lg:w-[32rem] blur-[6px] opacity-40"
         />
         {/* 2. Fleurs de Bissap */}
         <motion.img 
            style={{ y: yBissap, rotate: rotateBissap }}
            src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781361433/fleur_bissap_esyz83.png"
            className="absolute top-[40%] left-[-10%] md:left-[-5%] w-32 md:w-48 lg:w-56 blur-[2px] opacity-50"
         />
         {/* 3. Poudre de Moringa */}
         <motion.img 
            style={{ scale: scaleMoringa }}
            src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781360870/8_ofyjyv.png"
            className="absolute top-[75%] right-[-5%] md:right-[-2%] w-24 md:w-36 lg:w-44 blur-[4px] opacity-30"
         />
         {/* 4. Le Bouye */}
         <motion.img 
            style={{ y: yBouye, rotate: rotateBouye }}
            src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781360868/7_lug1gg.png"
            className="absolute bottom-[5%] left-[-10%] md:left-[-5%] w-32 md:w-48 lg:w-56 blur-[3px] opacity-20 brightness-75"
         />
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fomo-shake {
          0%, 100% { transform: translateX(0) scale(1.05); }
          25% { transform: translateX(-4px) scale(1.05); }
          75% { transform: translateX(4px) scale(1.05); }
        }
        .fomo-shake-active {
          animation: fomo-shake 0.4s ease-in-out infinite;
        }
        @keyframes gentle-pulse {
          0%, 100% { opacity: 1; filter: drop-shadow(0 0 15px rgba(57,255,20,0.1)); transform: scale(1); }
          50% { opacity: 0.85; filter: drop-shadow(0 0 25px rgba(57,255,20,0.4)); transform: scale(1.02); }
        }
        .animate-gentle-pulse {
          animation: gentle-pulse 4s ease-in-out infinite;
        }
      `}} />
      
      {/* ANIMATION LUDIQUE DE CONFETTIS */}
      {showConfetti && (
        <div className="fixed inset-0 z-[500] pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute top-[-10%] opacity-0 text-3xl md:text-5xl drop-shadow-lg"
              style={{
                left: `${Math.random() * 100}%`,
                animation: `fall-${i % 2 === 0 ? 'left' : 'right'} ${2 + Math.random() * 3}s ease-in forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            >
              {['🎉', '✨', '🔥', '🥬', '🥗', '🥑'][i % 6]}
            </div>
          ))}
          <style dangerouslySetInnerHTML={{__html: `@keyframes fall-left { 0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; } 100% { transform: translateY(110vh) rotate(360deg) translateX(-50px); opacity: 0; } } @keyframes fall-right { 0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; } 100% { transform: translateY(110vh) rotate(-360deg) translateX(50px); opacity: 0; } }`}} />
        </div>
      )}

      {/* BANNIÈRE PROMO HAUT DE PAGE */}
      <div className={`bg-black text-[#39FF14] text-center py-2.5 px-4 font-black uppercase text-[10px] md:text-xs tracking-widest z-50 relative shadow-md flex items-center justify-center gap-2 ${fomoTime <= 60 ? 'fomo-shake-active' : ''}`}>
          <HeartPulse size={16} className="animate-pulse text-[#39FF14]" /> 
          Offre de lancement : Seulement 2.900 F/mois. Expire dans {formatTime(fomoTime)}
      </div>

      {/* Header Fixe NutriAfro */}
      <nav className="fixed top-0 left-0 w-full p-4 md:p-6 flex justify-between items-center z-50 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm">
          <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="NutriAfro" className="h-8 md:h-12 w-auto object-contain" />

          <div className="flex items-center gap-3 md:gap-4">
              {/* Bouton Connexion */}
              <button onClick={() => router.push('/nutriafro-login')} className="bg-black/50 backdrop-blur-md border border-white/20 text-white px-4 md:px-6 py-2 md:py-2.5 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest hover:border-[#39FF14] hover:text-[#39FF14] transition-all flex items-center gap-2">
                  <Lock size={14} /> <span className="hidden sm:inline">Se Connecter</span>
              </button>

              {/* Bouton Diagnostic */}
              <button onClick={() => {
                  if (!showDiagnosticModal) {
                      setShowDiagnosticModal(true);
                      setDiagStep(1);
                  }
                  setTimeout(() => {
                      document.getElementById('diagnostic-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
              }} className="bg-[#39FF14] text-black px-4 md:px-6 py-2 md:py-2.5 rounded-full font-black uppercase text-[10px] md:text-xs tracking-widest shadow-[0_0_15px_rgba(57,255,20,0.3)] hover:scale-105 transition-transform flex items-center gap-2">
                  <Target size={14} /> <span className="hidden sm:inline">Créer un compte</span>
              </button>
          </div>
      </nav>

      {/* 1. HERO SECTION (NOUVEAU) */}
      <section className="relative w-full min-h-[90vh] md:min-h-[100vh] flex flex-col items-center justify-center overflow-hidden -mt-32 pt-32 z-10">
        <AnimatePresence mode="wait">
           <motion.div
              key={heroSlide}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute inset-0 w-full h-full z-0"
           >
              <img src={HERO_SLIDES[heroSlide].image} alt="Hero Nutrition" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50"></div>
           </motion.div>
        </AnimatePresence>

        {/* Content */}
        <div className="relative z-20 text-center px-6 max-w-5xl mx-auto flex flex-col items-center pt-40 md:pt-48">
           <AnimatePresence mode="wait">
              <motion.div
                 key={heroSlide}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -20 }}
                 transition={{ duration: 0.8 }}
                 className="mb-8"
              >
                 <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl lg:text-[5rem] font-black uppercase tracking-tighter leading-[1.05] mb-4 text-white drop-shadow-2xl`}>
                    {HERO_SLIDES[heroSlide].title} <br/>
                    <span className="text-[#39FF14] drop-shadow-sm">{HERO_SLIDES[heroSlide].highlight}</span>
                 </h1>
                 <p className="text-zinc-200 text-lg md:text-xl lg:text-2xl font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
                    {HERO_SLIDES[heroSlide].sub}
                 </p>
              </motion.div>
           </AnimatePresence>

           {/* Fixed CTAs */}
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-2">
             <button onClick={handleWaClick} className={`bg-[#39FF14] text-black px-8 md:px-12 py-5 md:py-6 rounded-full font-black md:text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3 w-full sm:w-auto ${fomoTime <= 120 ? 'fomo-shake-active' : ''}`}>
                <HeartPulse size={24} className="animate-pulse" /> DÉMARRER À 2.900 F
             </button>
             <button onClick={() => setShowDiagnosticModal(true)} className="bg-black/50 backdrop-blur-md border-2 border-[#39FF14] text-white px-8 md:px-12 py-5 md:py-6 rounded-full font-black md:text-lg uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-all shadow-[0_0_20px_rgba(57,255,20,0.2)] flex items-center justify-center gap-3 w-full sm:w-auto">
                <Activity size={24} /> MON DIAGNOSTIC GRATUIT
             </button>
           </div>
           <button onClick={() => setShowFreeMenuModal(true)} className="mt-8 text-xs font-bold text-zinc-300 hover:text-white uppercase tracking-widest underline decoration-zinc-400 underline-offset-4 transition-colors">
              Ou téléchargez un menu type gratuit (PDF)
           </button>
        </div>
      </section>

      {/* 2. LA RÉASSURANCE "BOL FAMILIAL" (Nouvelle Position Haute) */}
      <section className="py-24 px-6 bg-zinc-100 border-y border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>
              "Et si la famille partage le même bol ?" <span className="text-black border-b-4 border-[#39FF14]">On a pensé à tout.</span>
            </h2>
            <p className="text-zinc-500 font-bold text-lg">Au Sénégal, manger c'est partager. Pas question de cuisiner un plat à part dans votre coin.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {FAMILY_APPROACH_POINTS_NEW.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-zinc-200 p-8 rounded-[2rem] flex items-start gap-6 shadow-sm"
              >
                <div className="text-4xl mt-1">{point.icon}</div>
                <div>
                  <h3 className="font-black text-lg uppercase text-black mb-2">{point.title}</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed">{point.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="relative mx-auto w-full max-w-lg mt-16">
             <img 
               src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781198836/A_high-angle_studio_commercial_shot_202606111513_yehlsx.jpg"
               alt="Famille partageant un bol de riz"
               className="w-full h-auto rounded-[2rem] shadow-xl border border-zinc-200"
             />
          </div>
        </div>
      </section>

      {/* 3. BÉNÉFICES DIRECTS (Original section 2, now section 3) */}
      <section className="py-24 px-6 bg-white">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>Pourquoi ça <span className="text-black border-b-4 border-[#39FF14]">fonctionne enfin ?</span></h2>
               <p className="text-zinc-500 font-bold text-lg">Parce qu'on ne vous demande pas de manger des choses que vous ne trouvez pas au marché.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-zinc-50 border border-zinc-100 p-10 rounded-[2rem] hover:border-[#39FF14] hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><CheckCircle size={32}/></div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-4 text-black`}>100% Adapté aux Plats Locaux</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed">Fini la frustration. On adapte les portions de vos plats quotidiens pour que vous puissiez maigrir sans vous priver des repas en famille.</p>
               </div>

               <div className="bg-zinc-50 border border-zinc-100 p-10 rounded-[2rem] hover:border-[#39FF14] hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Smartphone size={32}/></div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-4 text-black`}>Suivi Personnel WhatsApp</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed">Un doute sur un aliment ? Une baisse de motivation ? Nos experts nutritionnistes vous accompagnent chaque semaine directement dans votre poche.</p>
               </div>

               <div className="bg-zinc-50 border border-zinc-100 p-10 rounded-[2rem] hover:border-[#39FF14] hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Flame size={32}/></div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-4 text-black`}>Résultats Durables</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed">Pas de régime miracle qui ruine votre métabolisme. Nous visons un rééquilibrage de fond pour une perte de poids et un maintien garanti.</p>
               </div>
            </div>
                    
                    {diagData.gender === 'Femme' && (
                      <div className="space-y-4 mt-6">
                         <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Ta situation actuelle *</label>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                              { id: "Allaitement", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781181320/An_authentic_minimalistic_flat-lay_illustration_202606111234_dg6lni.jpg", title: "Allaitement" },
                              { id: "Changements hormonaux", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781181281/cle_ezqyki.jpg", title: "Changements hormonaux (Ménopause / Périménopause)" },
                              { id: "Forme standard", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781181319/A_minimal_sleek_white_modern_202606111234_bpcoy2.jpg", title: "Forme standard" }
                            ].map(profile => (
                               <div key={profile.id} onClick={() => setDiagData({...diagData, healthProfile: profile.id})} className={`cursor-pointer border-4 rounded-2xl overflow-hidden relative transition-all ${diagData.healthProfile === profile.id ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                  <img src={profile.img} className="w-full aspect-square object-cover" alt={profile.title} />
                                  <div className="absolute bottom-0 w-full bg-black/80 text-white text-center py-2 px-1 font-black uppercase tracking-widest text-[9px] backdrop-blur-sm h-12 flex items-center justify-center leading-tight">{profile.title}</div>
                               </div>
                            ))}
                         </div>
                      </div>
                    )}
         </div>
      </section>

      {/* 4. LE MATCH : RÉGIMES OCCIDENTAUX VS NUTRITION À L'AFRICAINE */}
      <section className="py-24 px-6 bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4`}>
              Arrêtez de vous battre contre votre <span className="text-red-500">propre culture.</span>
            </h2>
            <p className="text-zinc-400 font-bold text-lg">Le Match : Régimes de l'Étranger VS Nutrition à l'Africaine</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* AVANT : Régimes Classiques */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] flex flex-col relative opacity-90">
              <span className="bg-red-900/50 text-red-500 font-black uppercase text-xs px-4 py-2 rounded-full mb-6 inline-flex items-center gap-2 w-max border border-red-800">
                <AlertTriangle size={14} /> Les Régimes de l'Étranger (❌)
              </span>
              <ul className="space-y-4 text-zinc-400 font-medium text-lg">
                <li className="flex gap-3 items-start"><span className="text-red-500 mt-1">❌</span><span><strong className="text-white">Adieu le bon riz, bonjour les salades fades.</strong> Devoir chercher du quinoa ou du saumon hors de prix à Dakar.</span></li>
                <li className="flex gap-3 items-start"><span className="text-red-500 mt-1">❌</span><span><strong className="text-white">S'isoler lors des repas de famille :</strong> "Désolé, je ne mange pas avec vous, je suis au régime."</span></li>
                <li className="flex gap-3 items-start"><span className="text-red-500 mt-1">❌</span><span><strong className="text-white">Résultat ? Vous craquez et reprenez tout.</strong> Effet Yoyo garanti.</span></li>
              </ul>
            </div>

            {/* APRÈS : Nutrition à l'Africaine */}
            <div className="bg-black border-2 border-[#39FF14] p-8 rounded-[2rem] flex flex-col relative shadow-[0_0_50px_rgba(57,255,20,0.15)] transform md:scale-105 z-10">
              <span className="bg-[#39FF14] text-black font-black uppercase text-xs px-4 py-2 rounded-full mb-6 inline-flex items-center gap-2 w-max shadow-lg">
                <CheckCircle size={14} /> La Méthode Locale (✅)
              </span>
              <ul className="space-y-4 text-zinc-200 font-medium text-lg">
                <li className="flex gap-3 items-start"><span className="text-[#39FF14] mt-1">✅</span><span><strong className="text-white">Conservez le plaisir de nos sauces</strong> en apprenant à doser l'huile.</span></li>
                <li className="flex gap-3 items-start"><span className="text-[#39FF14] mt-1">✅</span><span><strong className="text-white">Utilisez les super-aliments de nos marchés</strong> (Soumbala, Bouye, Kinkeliba) pour booster votre métabolisme et bloquer le stockage des graisses.</span></li>
                <li className="flex gap-3 items-start"><span className="text-[#39FF14] mt-1">✅</span><span><strong className="text-white">Une méthode économique, durable et 100% validée médicalement.</strong></span></li>
              </ul>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-lg mt-16">
             <img 
               src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781198836/A_split-screen_composition_styled_for_202606111513_ompcjz.jpg"
               alt="Comparaison Régimes"
               className="w-full h-auto rounded-[2rem] shadow-xl border border-zinc-800"
             />
          </div>
        </div>
      </section>

      {/* 5. LA VITRINE DES TERROIRS (Section interactive & Auchan) - FUSION AVEC CALCULATEUR */}
      <section className="py-24 px-6 bg-zinc-100 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
                <BookOpen size={14} /> Le Guide Inclus
            </div>
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-black`}>Nos ingrédients ont des <span className="text-black border-b-4 border-[#39FF14]">super-pouvoirs.</span></h2>
            <p className="text-zinc-600 font-medium text-lg mb-8 leading-relaxed">
              Découvrez les champions de notre guide nutritionnel de 10 pages, tous accessibles sur les marchés locaux ou emballés au rayon terroir chez Auchan Sénégal :
            </p>
            <div className="space-y-6">
              {INGREDIENTS.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="text-3xl shrink-0">{item.icon}</div>
                  <div>
                    <h3 className="font-black text-lg uppercase text-black mb-1">{item.name}</h3>
                    <p className="text-zinc-600 font-medium text-sm">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-sm flex items-center justify-center">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#39FF14] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
             <motion.div
               animate={{ y: [0, -20, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="w-[85%] h-auto z-10 drop-shadow-2xl"
             > 
               <img 
                 src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781201195/Design_sans_titre_avgfad.png"
                 alt="Aperçu du Guide Nutrition à l'Africaine"
                 className="max-w-full max-h-full object-contain"
               />
             </motion.div>
          </div> 
        </div>
      </section>

      {/* NOUVELLE SECTION : CE QUE VOUS ALLEZ APPRENDRE */}
      <section className="py-24 px-6 bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>
              Ce que vous allez apprendre <br/> <span className="text-black border-b-4 border-[#39FF14]">dans ce guide de 10 pages :</span>
            </h2>
            <p className="text-zinc-500 font-bold text-lg">Tout ce dont vous avez besoin pour démarrer votre transformation dès aujourd'hui.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-6">
            {[
              "Pourquoi le riz blanc bloque votre perte de gras (et par quoi le remplacer).",
              "L'astuce 'Bol Familial' pour manger comme tout le monde sans grossir.",
              "Les 5 épices locales qui boostent votre métabolisme naturellement.",
              "Comment doser l'huile dans le Thieb sans perdre le goût.",
              "Le secret du Bissap rouge pour éliminer la rétention d'eau.",
              "Pourquoi vous ne devez jamais sauter le petit-déjeuner.",
              "Liste de courses optimisée chez Auchan ou au marché local.",
              "Comment gérer les sorties au restaurant à Dakar.",
              "L'importance des protéines locales (Niébé, Poisson, Poulet).",
              "La méthode pour stabiliser votre poids après les 30 premiers jours."
            ].map((point, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="bg-[#39FF14] text-black p-1 rounded-full mt-1"><CheckCircle size={16} /></div>
                <p className="text-zinc-700 font-medium leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION : VITRINE BOUTIQUE */}
      <section className="py-24 px-6 bg-[#fafafa]">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <div className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
                  <ShoppingBag size={14}/> Boutique Nutrition
               </div>
               <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>
                  Équipez-vous pour <span className="text-black border-b-4 border-[#39FF14]">votre réussite.</span>
               </h2>
               <p className="text-zinc-500 font-bold text-lg max-w-2xl mx-auto">Nos super-aliments et accessoires exclusifs pour faciliter votre rééquilibrage.</p>
            </div>

            <div className="overflow-hidden mb-8" ref={emblaStoreRef}>
               <div className="flex">
                   {storeProducts.length > 0 ? storeProducts.map((p, idx) => (
                      <div key={idx} className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 px-4">
                          <div className="bg-white border border-zinc-200 rounded-[2.5rem] p-6 hover:border-[#39FF14] transition-all hover:shadow-2xl group flex flex-col h-full">
                              <div className="aspect-square rounded-[2rem] bg-zinc-50 overflow-hidden mb-6 relative">
                                 <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                 <span className="absolute top-4 right-4 bg-black text-[#39FF14] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">{p.badge || 'Nouveau'}</span>
                                 {p.stock <= 10 && <span className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg animate-pulse">Quantité Limitée</span>}
                              </div>
                              <div className="flex-1">
                                 <h3 className="font-black text-xl uppercase tracking-tighter text-black mb-2">{p.nom}</h3>
                                 <div className="flex flex-col gap-1 mb-8">
                                    <p className="text-zinc-400 text-sm font-bold line-through">{p.prix_standard} F (Standard)</p>
                                    <p className="text-2xl font-black text-black">
                                       {p.prix_premium} F <span className="text-[10px] font-bold text-[#39FF14] bg-black px-2 py-0.5 rounded ml-2 uppercase">Premium</span>
                                    </p>
                                 </div>
                              </div>
                              <button onClick={() => window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent("Bonjour ! Je souhaite commander " + p.nom + " sur la boutique Onyx Nutrition.")}`, "_blank")} className="w-full bg-black text-white hover:bg-[#39FF14] hover:text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl flex items-center justify-center gap-2">
                                 Commander via WhatsApp <ArrowRight size={16}/>
                              </button>
                          </div>
                      </div>
                   )) : <p className="text-zinc-500 text-center py-10 w-full">Boutique en cours de mise à jour...</p>}
               </div>
            </div>

            <div className="mt-16 text-center">
               <button onClick={() => router.push('/nutrition')} className="inline-flex items-center gap-3 bg-white text-black border-2 border-black px-10 py-5 rounded-2xl font-black uppercase text-sm hover:bg-black hover:text-white transition-all shadow-lg">
                  Accéder à la boutique complète <ArrowRight size={20}/>
               </button>
            </div>
         </div>
      </section>

      {/* 6. TARIFICATION (Original section 3, now section 6) */}
      <section id="tarifs" className="py-24 px-6 bg-zinc-950 text-white relative mt-10 rounded-[4rem] mx-4">
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-4`}>Choisissez votre <span className="text-[#39FF14]">engagement.</span></h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto items-stretch">
               {/* CARTE 1 MOIS */}
               <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] flex flex-col relative hover:border-zinc-700 transition-colors">
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-2 text-white`}>Essai 1 Mois</h3>
                  <p className="text-zinc-400 text-sm font-medium mb-6">Idéal pour tester la méthode et voir les premiers résultats.</p>
                  <div className="text-4xl font-black mb-6 italic text-white flex items-center">
                     2 900 F <span className="text-sm text-zinc-400 not-italic font-normal ml-2">/ mois</span>
                  </div>
                  <ul className="space-y-3 mb-6 text-zinc-400 text-sm font-bold flex-1">
                     <li className="flex gap-2">✔ Plan alimentaire personnalisé</li>
                     <li className="flex gap-2">✔ Intégration des repas locaux</li>
                     <li className="flex gap-2">✔ Suivi WhatsApp (Hebdo)</li>
                  </ul>
                  <div className="mb-8 p-4 bg-zinc-950 border border-zinc-800 rounded-2xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Plus de 50+ recettes filtrées :</p>
                     <div className="flex flex-wrap gap-2">
                         <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded text-[9px] font-black uppercase border border-zinc-700">📉 Low Carb</span>
                         <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded text-[9px] font-black uppercase border border-zinc-700">💪 Protéinés</span>
                         <span className="bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded text-[9px] font-black uppercase border border-zinc-700">🔥 Peu Calorique</span>
                     </div>
                  </div>
                  <button onClick={handleWaClick} className={`w-full bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase text-xs hover:bg-zinc-700 transition-transform`}>
                     Commencer l'essai
                  </button>
               </div>

               {/* CARTE 3 MOIS (RECOMMANDÉ) */}
               <div className="bg-gradient-to-b from-[#39FF14]/20 to-black border-2 border-[#39FF14] p-8 rounded-[3rem] flex flex-col relative shadow-[0_0_50px_rgba(57,255,20,0.3)] z-10 md:scale-105">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black px-5 py-1.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap shadow-xl flex items-center gap-2">
                     <Sparkles size={14} className="animate-pulse"/> Recommandé
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-2 text-white mt-6`}>Programme 3 Mois</h3>
                  <p className="text-zinc-300 text-sm font-medium mb-6">Pour des résultats visibles, durables et une vraie transformation.</p>
                  <div className="text-4xl font-black mb-1 italic text-[#39FF14] flex items-center gap-3">
                     7 500 F <span className="text-sm text-zinc-400 not-italic font-normal">/ trimestre</span>
                  </div>
                  <p className="text-sm font-bold text-red-400 line-through mb-6">au lieu de 8 700 F</p>
                  <ul className="space-y-3 mb-6 text-zinc-300 text-sm font-bold flex-1">
                     <li className="flex gap-2 text-white">✔ <strong className="text-white">Tout le programme de base</strong></li>
                     <li className="flex gap-2 text-white">✔ <strong className="text-white">Accès au Guide PDF Complet (10 pages)</strong></li>
                     <li className="flex gap-2 text-white">✔ <strong className="text-white">Suivi renforcé pour ancrer les habitudes</strong></li>
                  </ul>
                  <div className="mb-8 p-4 bg-black/50 border border-[#39FF14]/20 rounded-2xl">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-3 flex items-center gap-1"><Sparkles size={12}/> Galerie Recettes VIP :</p>
                     <div className="flex flex-wrap gap-2">
                         <span className="bg-[#39FF14]/10 text-[#39FF14] px-2.5 py-1 rounded text-[9px] font-black uppercase border border-[#39FF14]/30 shadow-sm">📉 Low Carb</span>
                         <span className="bg-[#39FF14]/10 text-[#39FF14] px-2.5 py-1 rounded text-[9px] font-black uppercase border border-[#39FF14]/30 shadow-sm">💪 Protéinés</span>
                         <span className="bg-[#39FF14]/10 text-[#39FF14] px-2.5 py-1 rounded text-[9px] font-black uppercase border border-[#39FF14]/30 shadow-sm">🔥 Peu Calorique</span>
                         <span className="bg-[#39FF14]/10 text-[#39FF14] px-2.5 py-1 rounded text-[9px] font-black uppercase border border-[#39FF14]/30 shadow-sm">🌅 Ndekki</span>
                         <span className="bg-[#39FF14]/10 text-[#39FF14] px-2.5 py-1 rounded text-[9px] font-black uppercase border border-[#39FF14]/30 shadow-sm">⚡ Low Fat</span>
                         {recentRecipe && (
                             <span className="bg-red-500/20 text-red-500 px-2.5 py-1 rounded text-[9px] font-black uppercase border border-red-500/50 shadow-sm animate-pulse">🔥 Nouveau: {recentRecipe}</span>
                         )}
                     </div>
                  </div>
                  <button onClick={handleWaClick} className={`w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(57,255,20,0.3)] flex justify-center items-center gap-2 ${fomoTime <= 120 ? 'fomo-shake-active' : ''}`}>
                     COMMENCER MON PROGRAMME <ArrowRight size={18}/>
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* 7. LES PREUVES SOCIALES & NOUVEAUX PERSONNAGES SENIORS (Original section 5, now section 7) */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>
              Ils ont transformé leur corps <span className="text-black border-b-4 border-[#39FF14]">sans renier leur culture.</span>
            </h2>
            <p className="text-zinc-500 font-bold text-lg">Découvrez les parcours de nos membres.</p>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="overflow-hidden relative min-h-[380px] sm:min-h-[320px]">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTestimonial}
                  initial={{ x: 200, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -200, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                  className="absolute inset-0"
                > 
                  <div className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2rem] flex flex-col items-center text-center h-full shadow-sm">
                    <img src={TESTIMONIALS[activeTestimonial].image} alt={`Photo de ${TESTIMONIALS[activeTestimonial].name}`} className="w-24 h-24 rounded-full object-cover mb-6 border-4 border-white shadow-lg" />
                    <p className="text-zinc-600 font-medium leading-relaxed mb-6 flex-1">"{TESTIMONIALS[activeTestimonial].text}" <br/><span className="text-black font-bold mt-2 block">{TESTIMONIALS[activeTestimonial].stats}</span></p>
                    <div>
                      <h4 className="font-black text-lg uppercase text-black">{TESTIMONIALS[activeTestimonial].name}</h4>
                      <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{TESTIMONIALS[activeTestimonial].role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
            <button onClick={prevTestimonial} className="absolute top-1/2 -translate-y-1/2 -left-4 sm:-left-12 bg-white border border-zinc-200 p-3 rounded-full shadow-md hover:bg-black hover:text-[#39FF14] transition-all z-10"><ChevronLeft size={24}/></button>
            <button onClick={nextTestimonial} className="absolute top-1/2 -translate-y-1/2 -right-4 sm:-right-12 bg-white border border-zinc-200 p-3 rounded-full shadow-md hover:bg-black hover:text-[#39FF14] transition-all z-10"><ChevronRight size={24}/></button>
            
            <div className="flex justify-center gap-2 mt-8">
              {TESTIMONIALS.map((_, index) => (
                <button key={index} onClick={() => setActiveTestimonial(index)} className={`w-3 h-3 rounded-full transition-all ${activeTestimonial === index ? 'bg-black scale-125' : 'bg-zinc-300 hover:bg-zinc-400'}`} />
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* 8. CALCULATEUR DE CALORIES SIMPLIFIÉ (Original section "CALCULATEUR", now section 8) */}
      {/* This section is now combined with the "Trésors de nos Terroirs" concept */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>
            Calculez pour <span className="text-black border-b-4 border-[#39FF14]">Comprendre</span>
          </h2>
          <p className="text-zinc-500 font-bold text-lg mb-8">Estimez les calories de plats courants et voyez comment notre méthode les optimise.</p>
          
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-zinc-200">
            <select 
              value={selectedDish}
              onChange={handleDishChange}
              className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-2xl font-bold text-lg outline-none focus:border-black transition appearance-none text-center cursor-pointer"
            >
              <option value="">-- Choisissez un plat --</option>
              {Object.keys(DISH_CALORIES).map(dish => (
                <option key={dish} value={dish}>{dish}</option>
              ))}
            </select>

            {pendingDish && !dishInfo && !isCalcLeadCaptured && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 bg-zinc-50 border border-zinc-200 p-6 sm:p-8 rounded-[2rem] text-left max-w-lg mx-auto"
              >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-black text-[#39FF14] rounded-xl"><Sparkles size={20}/></div>
                    <h4 className="font-black text-xl uppercase text-black">Presque là !</h4>
                </div>
                <p className="text-zinc-500 mb-6 font-bold text-sm">Entrez vos informations pour découvrir l'impact de notre méthode sur ce plat et recevoir vos résultats.</p>
                <form onSubmit={handleCalcSubmit} className="space-y-4">
                    <input type="text" placeholder="Votre Prénom *" value={calcLeadData.name} onChange={e => setCalcLeadData({...calcLeadData, name: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black transition" required />
                    <input type="tel" placeholder="Numéro WhatsApp * (Ex: 77 123 45 67)" value={calcLeadData.phone} onChange={e => setCalcLeadData({...calcLeadData, phone: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black transition" required />
                    <button type="submit" className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">Découvrir le résultat <ArrowRight size={18}/></button>
                </form>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mt-4 text-center">* Vous pourrez tester d'autres plats ensuite sans remplir ce formulaire.</p>
              </motion.div>
            )}

            {dishInfo && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 mb-8">
                  <CalorieGauge value={dishInfo.calories} colorClass="text-red-500" label="Standard" />
                  <div className="text-4xl font-black text-zinc-300 hidden sm:block">→</div>
                  <CalorieGauge value={dishInfo.optimizedCalories} colorClass="text-green-500" label="Version Optimisée" />
                </div>
                <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-left">
                  <p className="text-sm font-bold text-green-700 uppercase tracking-widest flex items-center gap-2"><Sparkles size={16}/> L'astuce Nutrition à l'Africaine</p>
                  <p className="text-zinc-700 font-medium mt-2">{dishInfo.tip}</p>
                </div>
                <p className="text-xs text-zinc-400 mt-4 text-center italic">Ces valeurs sont des estimations. Le programme vous donne des calculs personnalisés.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* 9. FAQ (Original section 6, now section 9) */}
      <section className="py-24 px-6 bg-zinc-100 border-t border-zinc-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>
              Vos Questions, <span className="text-black border-b-4 border-[#39FF14]">Nos Réponses.</span>
            </h2>
            <p className="text-zinc-500 font-bold text-lg">Toutes les informations pour démarrer sereinement.</p>
          </div>
          <div className="space-y-4">
            {FAQ_DATA.map((item, index) => (
              <div key={index} className={`bg-white border-2 rounded-[2rem] p-6 transition-all duration-300 ${openFaq === index ? 'border-[#39FF14]' : 'border-zinc-200'}`}>
                <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full flex justify-between items-center text-left gap-4">
                  <h3 className="font-black text-lg uppercase tracking-tight text-black">{item.question}</h3>
                  <div className={`p-2 rounded-full transition-transform duration-300 shrink-0 ${openFaq === index ? 'bg-black text-[#39FF14] rotate-180' : 'bg-zinc-200 text-zinc-600'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className="text-zinc-600 font-medium leading-relaxed pr-8">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* BOUTON REMONTER EN HAUT */}
      {showScrollTop && (
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="fixed bottom-24 left-6 z-[90] bg-black text-[#39FF14] p-3 md:p-4 rounded-full shadow-2xl border border-zinc-800 hover:scale-110 transition-all animate-in fade-in slide-in-from-bottom-4"
         >
           <ArrowUp size={24} />
         </button>
      )}
      {/* BOT FANTA */}
      <div className="fixed bottom-24 right-4 md:right-6 z-[100] flex flex-col items-end">
        {isBotOpen && (
          <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-[#39FF14] p-0 mb-4 w-[calc(100vw-2rem)] md:w-[340px] h-[400px] max-h-[70vh] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
             <div className="bg-black p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-[#39FF14] flex items-center justify-center text-xl">👩🏾‍💻</div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#39FF14] rounded-full border border-black animate-pulse"></div>
                   </div>
                   <div><p className="text-[#39FF14] font-black uppercase text-xs">Fanta - Coach Nutrition</p></div>
                </div>
                <button onClick={() => setIsBotOpen(false)} className="text-zinc-400 hover:text-white transition"><X size={18}/></button>
             </div>
             
             <div className="flex-1 bg-zinc-50 p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar">
                {botMessages.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                      <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm' : 'bg-black text-[#39FF14] rounded-tr-none shadow-md'}`}>
                         {msg.text}
                      </div>
                      {msg.options && (
                         <div className="flex flex-wrap gap-2 mt-2 w-full">
                            {msg.options.map((opt: string, idx: number) => (
                               <button key={idx} onClick={() => processBotReply(opt)} className="bg-white border border-zinc-200 text-black text-xs font-bold px-4 py-2 rounded-xl hover:bg-black hover:text-[#39FF14] shadow-sm transition-colors">{opt}</button>
                            ))}
                         </div>
                      )}
                   </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             <div className="p-3 bg-white border-t border-zinc-200 flex gap-2">
                <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && processBotReply(userReply)} placeholder="Poser une question..." className="flex-1 bg-zinc-100 rounded-xl px-4 outline-none text-sm font-bold focus:ring-1 focus:ring-black" />
                <button onClick={() => processBotReply(userReply)} className="bg-black p-3 rounded-xl text-[#39FF14] hover:scale-105 transition"><Send size={18}/></button>
             </div>
          </div>
        )}
        
        {!isBotOpen && !isBotDismissed && (
           <div className="relative group animate-bounce flex items-center justify-center">
             <button 
               onClick={(e) => { e.stopPropagation(); setIsBotDismissed(true); }} 
               className="absolute -top-1 -right-1 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-black p-1 rounded-full z-10 transition-colors shadow-sm"
               aria-label="Fermer l'assistant"
             >
               <X size={14} />
             </button>
             <button onClick={() => setIsBotOpen(true)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#39FF14] hover:scale-110 transition-transform bg-black relative flex items-center justify-center text-2xl">
               👩🏾‍💻
             </button>
           </div>
        )}
      </div>

      {/* MODALE MENU GRATUIT */}
      {showFreeMenuModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={(e: any) => e.target === e.currentTarget && setShowFreeMenuModal(false)}>
          <div className="bg-white border border-zinc-200 rounded-[2rem] shadow-2xl p-8 max-w-md w-full relative animate-in zoom-in-95">
            <button onClick={() => setShowFreeMenuModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
            <div className="text-center mb-6">
               <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-4"><Download size={32}/></div>
               <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter`}>Menu Type <span className="text-[#39FF14]">Gratuit</span></h3>
               <p className="text-sm font-medium text-zinc-500 mt-2">Recevez un exemple de journée type (1500 kcal) avec nos plats locaux pour commencer dès maintenant.</p>
            </div>
            <form onSubmit={handleDownloadFreeMenu} className="space-y-4">
               <div>
                 <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1 block mb-1">Votre Prénom</label>
                 <input type="text" required value={freeMenuData.name} onChange={e => setFreeMenuData({...freeMenuData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition" placeholder="Ex: Aïssatou" />
               </div>
               <div>
                 <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-1 block mb-1">WhatsApp ou Email</label>
                 <input type="text" required value={freeMenuData.contact} onChange={e => setFreeMenuData({...freeMenuData, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black transition" placeholder="Ex: 77 123 45 67 ou email@..." />
               </div>
               <button type="submit" className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg flex justify-center items-center gap-2 mt-2">
                 <Download size={18}/> Télécharger (PDF)
               </button>
            </form>
          </div>
        </div>
      )}

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className="font-black text-sm md:text-base text-black">2 900 F<span className="text-zinc-500 text-xs font-bold">/mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">Suivi WhatsApp & Plats Locaux</p>
             </div>
             <button onClick={handleWaClick} className={`bg-black text-[#39FF14] px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-lg shadow-black/20 ${fomoTime <= 120 ? 'fomo-shake-active' : ''}`}>
                Commencer
             </button>
          </div>
      </div>

      {/* MODALE DIAGNOSTIC */}
      {showDiagnosticModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={(e: any) => e.target === e.currentTarget && setShowDiagnosticModal(false)}>
          <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-[2rem] shadow-2xl flex flex-col relative animate-in zoom-in-95 max-h-[95vh] overflow-hidden">
            <button onClick={() => setShowDiagnosticModal(false)} className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 bg-white/20 text-white rounded-full hover:bg-black hover:text-[#39FF14] transition z-50"><X size={20}/></button>

            <div className="bg-black text-white p-6 sm:p-8 text-center relative rounded-t-[2rem] shrink-0">
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                <div className="h-full bg-[#39FF14] transition-all duration-500" style={{ width: `${(diagStep / 6) * 100}%` }}></div>
              </div>
              <Activity className="text-[#39FF14] mx-auto mb-2" size={28} />
              <h2 className={`${spaceGrotesk.className} text-xl md:text-3xl font-black uppercase tracking-tighter`}>
                {diagStep === 7 ? "Diagnostic Terminé !" : "Bilan Nutritionnel"}
              </h2>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar pb-10">
              {diagStep !== 11 ? (
                <form onSubmit={handleDiagSubmit} className="w-full">

                  {/* ETAPE 1: Sexe & Âge */}
                  {diagStep === 1 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full max-w-lg mx-auto">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 1 : Sexe & Âge</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Quel est votre sexe ?</label>
                        <div className="grid grid-cols-2 gap-4 w-full mb-8">
                          {[
                            { id: 'Homme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_format_1_1_en_202606111044_rjknkg.jpg' },
                            { id: 'Femme', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_1_1_en_gardant_202606111043_unmonc.jpg' }
                          ].map(option => (
                            <div key={option.id} onClick={() => setDiagData({...diagData, gender: option.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 ${diagData.gender === option.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}`}>
                              <img src={option.img} alt={option.id} className="w-full aspect-square object-cover" />
                              <div className="absolute bottom-0 w-full bg-black/80 text-white py-4 font-black uppercase tracking-widest text-sm text-center backdrop-blur-md">{option.id}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Quel âge avez-vous ?</label>
                        <input type="number" required placeholder="Ex: 35" value={diagData.age} onChange={(e) => setDiagData({...diagData, age: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                      </div>
                    </div>
                  )}

                  {/* ETAPE 2: Objectifs physiques */}
                  {diagStep === 2 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full max-w-lg mx-auto">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 2 : Vos objectifs</h2>

                      <div className="w-full text-left mb-6">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Quel est votre objectif principal ?</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
                          {[
                            { id: 'perte_poids', label: 'Perte de poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544253/A_high-end_commercial_photorealistic_full-body_202606151657_cfq5fb.jpg', desc: 'Déficit calorique' },
                            { id: 'maintien', label: 'Maintien du poids', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781542708/A_high-end_commercial_photorealistic_portrait_202606151658_noabp9.jpg', desc: 'Stabiliser sainement' },
                            { id: 'prise_masse', label: 'Prise de masse', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781544091/rajoute_le_logo_sur_la_202606151721_aayo61.jpg', desc: 'Développer le muscle' }
                          ].map(goal => (
                            <div key={goal.id} onClick={() => setDiagData({...diagData, goal: goal.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all duration-300 flex flex-col ${diagData.goal === goal.id ? 'border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.3)] scale-105' : 'border-transparent bg-white shadow-sm hover:shadow-xl hover:scale-105'}`}>
                              <img src={goal.img} alt={goal.label} className="w-full aspect-square object-cover" />
                              <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center backdrop-blur-md">
                                <span className="font-black uppercase tracking-widest text-xs md:text-sm mb-1 text-center">{goal.label}</span>
                                <span className="text-[10px] text-zinc-400 font-bold leading-tight text-center">{goal.desc}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full mb-6">
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Taille (cm)</label>
                          <input type="number" required placeholder="Ex: 170" value={diagData.height} onChange={(e) => setDiagData({...diagData, height: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Poids actuel (kg)</label>
                          <input type="number" required placeholder="Ex: 75" value={diagData.currentWeight} onChange={(e) => setDiagData({...diagData, currentWeight: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 w-full">
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Poids cible (kg)</label>
                          <input type="number" required placeholder="Ex: 65" value={diagData.targetWeight} onChange={(e) => setDiagData({...diagData, targetWeight: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                        <div className="text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Date cible</label>
                          <input type="date" required value={diagData.targetDate} onChange={(e) => setDiagData({...diagData, targetDate: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-sm outline-none focus:border-[#39FF14] transition-colors text-black" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 3: Mode de vie */}
                  {diagStep === 3 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 3 : Mode de vie</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                           <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675093/3_topvyj.png" className="w-8 h-8"/>
                           Combien d'heures de sommeil avez-vous chaque nuit ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          {['Moins de 5h', '6-7h', '8h ou plus'].map(hours => (
                             <div key={hours} onClick={() => setDiagData({...diagData, sleepHours: hours})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.sleepHours === hours ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black">{hours}</span>
                                {diagData.sleepHours === hours && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675092/5_olxege.png" className="w-8 h-8"/>
                            Comment décririez-vous vos déplacements au quotidien ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                          {['Voiture/Sédentaire', 'Marche/Activité légère', 'Travail physique/Modérée', 'Sport intense/Intense'].map(commute => (
                             <div key={commute} onClick={() => setDiagData({...diagData, dailyCommute: commute})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.dailyCommute === commute ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-center text-sm">{commute}</span>
                                {diagData.dailyCommute === commute && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 4: Profil Santé */}
                  {diagStep === 4 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 4 : Profil Santé</h2>

                      <div className="w-full mb-6 text-left">
                          <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Avez-vous des conditions médicales ?</label>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                            {['Diabète', 'Hypertension', 'Aucun problème'].map(condition => {
                                const isSelected = diagData.healthProfile === condition;
                                return (
                                  <div key={condition} onClick={() => setDiagData({...diagData, healthProfile: condition})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${isSelected ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                    <div className="flex flex-col items-center gap-2 text-center"><HeartPulse size={24} className="text-zinc-400 mb-1"/><span className="font-bold text-black text-sm">{condition}</span></div>
                                    {isSelected && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                                  </div>
                                );
                            })}
                          </div>
                      </div>

                      {diagData.gender === 'Femme' && (
                          <div className="w-full text-left animate-in fade-in slide-in-from-top-2">
                              <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Spécificités féminines :</label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                                {['Allaitement', 'Grossesse', 'SOPK', 'Périménopause/Ménopause', 'Aucune'].map(condition => {
                                    const isSelected = diagData.femaleSpecific === condition;
                                    return (
                                      <div key={condition} onClick={() => setDiagData({...diagData, femaleSpecific: condition})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${isSelected ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                        <span className="font-bold text-black">{condition}</span>
                                        {isSelected && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                                      </div>
                                    );
                                })}
                              </div>
                          </div>
                      )}
                    </div>
                  )}

                  {/* ETAPE 5: Nutrition & Hydratation */}
                  {diagStep === 5 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 5 : Nutrition & Hydratation</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                           <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675042/2_maewiy.png" className="w-8 h-8"/>
                           Quelle quantité d'eau consommez-vous ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          {['Moins de 50cl', '1L', 'Plus de 1.5L'].map(vol => (
                             <div key={vol} onClick={() => setDiagData({...diagData, waterIntake: vol})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.waterIntake === vol ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black">{vol}</span>
                                {diagData.waterIntake === vol && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">
                           Avez-vous enchaîné les régimes restrictifs par le passé ?
                        </label>
                        <div className="grid grid-cols-2 gap-4 w-full">
                          {['Oui', 'Non'].map(ans => (
                             <div key={ans} onClick={() => setDiagData({...diagData, pastDiets: ans})} className={`flex-1 cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.pastDiets === ans ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-lg">{ans}</span>
                                {diagData.pastDiets === ans && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675094/4_uk6ui2.png" className="w-8 h-8"/>
                            Quelles matières grasses utilisez-vous principalement pour la cuisson ?
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                          {['Huile de palme/Arachide', 'Huile d\'olive/Tournesol', 'Beurre/Karité', 'Je cuisine sans huile'].map(fat => (
                              <div key={fat} onClick={() => {
                                  const fats = diagData.cookingFats.includes(fat) ? diagData.cookingFats.filter(f => f !== fat) : [...diagData.cookingFats, fat];
                                  setDiagData({...diagData, cookingFats: fats});
                              }} className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all duration-300 ${diagData.cookingFats.includes(fat) ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <div className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 ${diagData.cookingFats.includes(fat) ? 'bg-[#39FF14] border-[#39FF14]' : 'border-zinc-300'}`}>
                                  {diagData.cookingFats.includes(fat) && <CheckCircle size={14} className="text-black"/>}
                                </div>
                                <span className="font-bold text-black text-xs sm:text-sm leading-tight">{fat}</span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 6: Rythme Africain */}
                  {diagStep === 6 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 6 : Rythme Africain</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                           <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675091/sauce_gmyero.png" className="w-8 h-8"/>
                           Quel est l'élément principal de vos repas ?
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                          {['Féculents lourds (Foufou, Tô)', 'Riz/Céréales', 'Sauces riches', 'Protéines/Légumes'].map(element => (
                             <div key={element} onClick={() => setDiagData({...diagData, mainMealElement: element})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.mainMealElement === element ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-center text-sm">{element}</span>
                                {diagData.mainMealElement === element && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 flex items-center gap-2">
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1782675094/4_uk6ui2.png" className="w-8 h-8"/>
                            Le soir à la maison, votre dîner est généralement :
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                          {['Très copieux', 'Léger', 'Je grignote'].map(meal => (
                             <div key={meal} onClick={() => setDiagData({...diagData, eveningMeal: meal})} className={`cursor-pointer border-2 rounded-xl p-4 py-6 flex flex-col items-center justify-center relative transition-all duration-300 ${diagData.eveningMeal === meal ? 'border-[#39FF14] bg-[#39FF14]/5 shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-zinc-200 bg-white hover:border-zinc-400'}`}>
                                <span className="font-bold text-black text-center text-sm">{meal}</span>
                                {diagData.eveningMeal === meal && <CheckCircle size={20} className="text-[#39FF14] absolute top-2 right-2"/>}
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ETAPE 7: Pratique familiale */}
                  {diagStep === 7 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 7 : Pratique Familiale</h2>
                      <div className="space-y-10 w-full max-w-2xl">
                        {/* GRILLE 1 : DÉJEUNER */}
                        <div>
                          <h3 className="text-xl font-black uppercase mb-4 text-black text-left">Comment déjeunez-vous le midi ?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                              { id: 'En solo au bureau', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/La_Gamelle_ywfy3t.jpg', desc: 'Avec ma gamelle / Tupperware' },
                              { id: 'À la maison', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Le_Bol_Commun_hb9fns.jpg', desc: 'Autour du grand bol familial' }
                            ].map(habit => (
                              <div key={habit.id} onClick={() => setDiagData({...diagData, lunchHabit: habit.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all flex flex-col ${diagData.lunchHabit === habit.id ? 'border-[#39FF14] scale-105' : 'border-transparent bg-white shadow-sm hover:scale-105'}`}>
                                <img src={habit.img} className="w-full h-40 object-cover" />
                                <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center">
                                  <span className="font-black uppercase text-sm mb-1 text-center">{habit.id}</span>
                                  <span className="text-[10px] text-zinc-400 text-center">{habit.desc}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GRILLE 2 : POUR QUI JE CUISINE */}
                        <div>
                          <h3 className="text-xl font-black uppercase mb-4 text-black text-left">Pour qui préparez-vous les repas ?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {[
                              { id: 'Je cuisine uniquement pour moi seule', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_moi_seule_mfo6vw.jpg' },
                              { id: 'Je cuisine la marmite pour toute la famille', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781631228/Je_cuisine_pour_la_famille_qzlwke.jpg' }
                            ].map(habit => (
                              <div key={habit.id} onClick={() => setDiagData({...diagData, cookingHabit: habit.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all flex flex-col ${diagData.cookingHabit === habit.id ? 'border-[#39FF14] scale-105' : 'border-transparent bg-white shadow-sm hover:scale-105'}`}>
                                <img src={habit.img} className="w-full h-40 object-cover" />
                                <div className="flex-1 bg-black/90 text-white p-4 flex flex-col justify-center items-center">
                                  <span className="font-black uppercase text-xs text-center leading-tight">{habit.id}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* GRILLE 3 : BUDGET */}
                        <div>
                          <h3 className="text-xl font-black uppercase mb-4 text-black text-left">Budget courses par semaine ?</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[
                              { id: 'Budget Serré', price: '8 000 F / semaine', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630660/A_cute__highly_detailed_3D_202606161723_fcl8jj.jpg' },
                              { id: 'Budget Famille', price: '15 000 F / semaine', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630665/A_cute__highly_detailed_3D_202606161723_1_rx6yry.jpg' },
                              { id: 'Budget Confort', price: '25 000 F / semaine', img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781630664/A_cute__highly_detailed_3D_202606161723_2_xxku54.jpg' }
                            ].map(budget => (
                              <div key={budget.id} onClick={() => setDiagData({...diagData, weeklyBudget: budget.id})} className={`cursor-pointer border-4 rounded-[2rem] overflow-hidden relative transition-all flex flex-col ${diagData.weeklyBudget === budget.id ? 'border-[#39FF14] scale-105' : 'border-transparent bg-white shadow-sm hover:scale-105'}`}>
                                <img src={budget.img} className="w-full h-24 object-cover" />
                                <div className="flex-1 bg-black/90 text-white p-3 flex flex-col justify-center items-center">
                                  <span className="font-black uppercase text-[10px] mb-1">{budget.id}</span>
                                  <span className="text-[#39FF14] font-bold text-[9px]">{budget.price}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* ETAPE 8: Identification (Landing Page Uniquement) */}
                  {diagStep === 8 && (
                    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8">
                      <h2 className="text-2xl md:text-3xl font-black uppercase mb-8 text-black">Étape 8 : À qui avons-nous l'honneur ?</h2>

                      <div className="w-full mb-6 text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Votre Prénom</label>
                        <input type="text" required placeholder="Ex: Aminata" value={diagData.name} onChange={(e) => setDiagData({...diagData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                      </div>

                      <div className="w-full text-left">
                        <label className="font-bold text-sm uppercase text-zinc-500 mb-2 block">Numéro WhatsApp</label>
                        <input type="tel" required placeholder="+221..." value={diagData.phone} onChange={(e) => setDiagData({...diagData, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border-2 border-zinc-200 rounded-xl font-bold text-center text-xl outline-none focus:border-[#39FF14] transition-colors text-black" />
                      </div>
                    </div>
                  )}

                  <button type="submit" id="hidden-submit-btn" style={{display:"none"}}></button>

                  {diagStep < 10 && (
                    <div className="flex gap-4 pt-6 mt-8 border-t border-zinc-100">
                        {diagStep > 1 && (
                            <button type="button" onClick={() => setDiagStep(s => s - 1)} className="px-8 py-4 bg-zinc-100 rounded-xl font-bold text-sm text-black hover:bg-zinc-200 transition">
                                Retour
                            </button>
                        )}
                        <button 
                            type="button" 
                            onClick={() => setDiagStep(s => s === 8 ? 10 : s + 1)}
                            disabled={
                                (diagStep === 1 && (!diagData.gender || !diagData.age)) ||
                                (diagStep === 2 && (!diagData.goal || !diagData.height || !diagData.currentWeight || !diagData.targetWeight || !diagData.targetDate)) ||
                                (diagStep === 3 && (!diagData.sleepHours || !diagData.dailyCommute)) ||
                                (diagStep === 4 && (!diagData.healthProfile || (diagData.gender === 'Femme' && !diagData.femaleSpecific))) ||
                                (diagStep === 5 && (!diagData.waterIntake || !diagData.pastDiets || diagData.cookingFats.length === 0)) ||
                                (diagStep === 6 && (!diagData.mainMealElement || !diagData.eveningMeal)) ||
                                (diagStep === 7 && (!diagData.lunchHabit || !diagData.cookingHabit || !diagData.weeklyBudget)) ||
                                (diagStep === 8 && (!diagData.name || !diagData.phone))
                            }
                            className="flex-1 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase flex justify-center items-center gap-2 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Suivant <ChevronRight size={18}/>
                        </button>
                    </div>
                  )}

{/* ETAPE 10: BILAN VISUEL */}
                  {diagStep === 10 && (
    <div className="flex flex-col items-center text-center animate-in slide-in-from-right-8 w-full bg-white p-6 md:p-8 rounded-[2rem] shadow-xl">
        {(() => {
            const profile = calculateDailyCalories(diagData);
            const currentW = parseFloat(diagData.currentWeight) || 0;
            const targetW = parseFloat(diagData.targetWeight) || 0;
            const weightToLose = currentW - targetW;

            // Calcul de l'IMC
            const hM = (parseFloat(diagData.height) || 0) / 100;
            const imcVal = hM > 0 ? currentW / (hM * hM) : 0;
            const imc = imcVal.toFixed(1);

            let imcBadge = "bg-green-100 text-green-700";
            let imcText = "Normal";
            if (imcVal < 18.5) { imcBadge = "bg-blue-100 text-blue-600"; imcText = "Maigreur"; }
            else if (imcVal >= 25 && imcVal < 30) { imcBadge = "bg-orange-100 text-orange-600"; imcText = "Surpoids"; }
            else if (imcVal >= 30) { imcBadge = "bg-red-100 text-red-600"; imcText = "Obésité"; }

            // Calcul de l'angle de l'aiguille (Min IMC 15 = 0°, Max IMC 40 = 180°)
            const clampedImc = Math.max(15, Math.min(imcVal, 40));
            const needleRotation = ((clampedImc - 15) / 25) * 180;

            return (
                <div className="w-full">
                    <h2 className="text-2xl md:text-3xl font-black uppercase mb-2 text-black">Vos Objectifs Validés</h2>
                    <p className="text-sm font-medium text-zinc-500 mb-8 max-w-lg mx-auto">Voici l'analyse complète de votre profil de départ.</p>

                    {/* Grille Principale à 4 Colonnes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                        {/* Carte 1 : Jauge IMC Demi-Cercle (Speedometer) */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Indice de Masse Corporelle</p>

                            <div className="relative w-32 h-16 mt-2 overflow-visible">
                                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                                    {/* Arc de cercle avec dégradé fonctionnel */}
                                    <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="url(#speedometerGradient)" strokeWidth="12" strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="speedometerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="35%" stopColor="#22c55e" />
                                            <stop offset="70%" stopColor="#eab308" />
                                            <stop offset="100%" stopColor="#ef4444" />
                                        </linearGradient>
                                    </defs>
                                    {/* Aiguille rotative pivotant sur l'axe central inférieur (50,50) */}
                                    <g style={{ transform: `rotate(${needleRotation}deg)`, transformOrigin: '50px 50px', transition: 'transform 1.5s ease-out' }}>
                                        <polygon points="48,50 50,12 52,50" fill="#18181b" />
                                        <circle cx="50" cy="50" r="5" fill="#18181b" />
                                    </g>
                                </svg>
                            </div>

                            <div className="text-center mt-2">
                                <p className="text-2xl font-black text-black">{imc}</p>
                                <span className={`inline-block text-[9px] font-black uppercase px-2 py-0.5 rounded-md mt-1 ${imcBadge}`}>{imcText}</span>
                            </div>
                        </div>

                        {/* Carte 2 : Calories Cibles */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Apport Énergétique</p>
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781443964/A_cute__highly_detailed_3D_202606141332_ggiubt.jpg" className="w-12 h-12 rounded-full object-cover" alt="Calories" />
                            <div className="text-center">
                                <p className="text-3xl font-black text-black">{profile.calories} <span className="text-sm font-bold text-zinc-500">kcal</span></p>
                                {profile.hitFloor && <span className="text-red-600 font-bold text-[8px] uppercase tracking-wider block mt-1">Plancher de sécurité activé</span>}
                            </div>
                        </div>

                        {/* Carte 3 : Objectif Poids */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Poids Cible</p>
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781458367/A_cute__highly_detailed_3D_202606141732_kn3ujk.jpg" className="w-12 h-12 rounded-full object-cover" alt="Poids" />
                            <div className="text-center">
                                <p className="text-3xl font-black text-black">{targetW} <span className="text-sm font-bold text-zinc-500">kg</span></p>
                                {weightToLose > 0 && <p className="text-[10px] font-bold text-zinc-500 mt-1">-{weightToLose.toFixed(1)} kg à éliminer</p>}
                            </div>
                        </div>

                        {/* Carte 4 : Date Cible */}
                        <div className="bg-zinc-50 border border-zinc-200 p-6 rounded-[2rem] flex flex-col items-center justify-between min-h-[220px]">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Date Prévue</p>
                            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781535959/A_cute__highly_detailed_3D_202606151505_1_uvgqf0.jpg" className="w-12 h-12 rounded-full object-cover" alt="Date" />
                            <p className="text-xl font-black text-black capitalize leading-tight">
                                {diagData.targetDate ? new Date(diagData.targetDate).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : '-'}
                            </p>
                        </div>
                    </div>

                    <button onClick={handleDiagSubmit} disabled={isSubmittingDiag} className="w-full bg-black text-[#39FF14] py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-xl hover:scale-[1.01] transition-transform">
                        {isSubmittingDiag ? "Enregistrement en cours..." : "Valider mes objectifs"}
                    </button>
                </div>
            );
        })()}
    </div>
)}
                </form>
              ) : null}

              {diagStep === 11 && (
    <div className="flex flex-col items-center text-center animate-in zoom-in w-full bg-white border-t-[8px] border-[#39FF14] p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
        {/* Lueur en arrière-plan */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#39FF14] opacity-20 blur-[50px] pointer-events-none"></div>

        <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781224243/logo_dore_um5fsr.png" alt="Nutrition à l'Africaine" className="h-16 w-auto mx-auto mb-6 object-contain relative z-10" />

        <h2 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase text-black mb-3 leading-tight relative z-10`}>
            Bienvenue dans la famille,<br/> <span className="text-[#39FF14] bg-black px-3 py-1 rounded-xl inline-block mt-2">{diagData.name.split(' ')[0]} ! 🎉</span>
        </h2>

        <p className="text-sm font-medium text-zinc-600 mb-6 leading-relaxed relative z-10">
            Ton plan nutritionnel sur-mesure est prêt. Garde précieusement ces accès temporaires pour te reconnecter à tout moment à ton espace de suivi.
        </p>

        {/* Encadré Identifiants Design Premium */}
        <div className="bg-black border border-zinc-800 p-6 rounded-2xl w-full text-left space-y-4 mb-6 shadow-[0_10px_30px_rgba(0,0,0,0.15)] relative z-10">
            <p className="font-black text-[#39FF14] text-xs uppercase tracking-widest border-b border-zinc-800 pb-3 mb-3 flex items-center gap-2">
                <Lock size={14}/> Tes identifiants :
            </p>
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Numéro WhatsApp</span>
                <span className="font-black text-white">{diagData.phone}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Mot de passe provisoire</span>
                <span className="font-black text-black bg-[#39FF14] px-2 py-1 rounded-md tracking-wider">
                    {diagData.phone.replace(/\s+/g, '').slice(-8).padStart(8, "0")}
                </span>
            </div>
        </div>

        <p className="text-[10px] font-bold text-zinc-500 mb-8 flex items-center justify-center gap-2 relative z-10">
            Tu pourras modifier ce mot de passe dans tes paramètres
            <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781536233/A_cute__highly_detailed_3D_202606151510_uj9z5c.jpg" className="w-6 h-6 rounded-full shadow-sm" alt="Réglages" />
        </p>

        <button onClick={() => window.location.href = '/nutrition?from=diagnostic'} className="w-full bg-[#39FF14] text-black py-5 rounded-[1.5rem] font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(57,255,20,0.3)] hover:scale-105 transition-transform flex justify-center items-center gap-2 relative z-10">
            Accéder à mon Sama Menu <ArrowRight size={18}/>
        </button>
    </div>
)}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
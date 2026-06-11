"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Activity, HeartPulse, Smartphone, Flame, CheckCircle, 
  ArrowRight, ChevronLeft, AlertTriangle, Zap, ChevronDown, ChevronRight,
  Send, X, ArrowUp, BookOpen, Sparkles, Target, Apple, Scale, Download
} from "lucide-react";
import jsPDF from "jspdf";

const spaceGrotesk = { className: "font-sans" };

const TESTIMONIALS = [
  {
    name: "Aïssatou K.",
    role: "Mère de famille, Dakar",
    text: "J'ai perdu 8 kg en 3 mois sans arrêter de manger mon mafé ! Le suivi WhatsApp est incroyable, on ne se sent jamais seule. C'est la première fois qu'un programme s'adapte à moi, et pas l'inverse.",
    image: "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg"
  },
  {
    name: "Mamadou D.",
    role: "Cadre dynamique, Thiès",
    text: "Avec mon travail, je n'avais pas le temps de cuisiner des plats compliqués. OnyxNutrition m'a montré comment équilibrer mes repas au restaurant. J'ai plus d'énergie et mon ventre a disparu.",
    image: "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg"
  },
  {
    name: "Fatima B.",
    role: "Étudiante, Saint-Louis",
    text: "Je pensais que manger sainement coûtait cher. Le guide m'a ouvert les yeux sur les alternatives locales. J'ai appris à mieux manger avec mon budget d'étudiante. Merci l'équipe !",
    image: "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg"
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
  { name: "Fonio", benefits: "Sans Gluten, Riche en Fer & Magnésium, Indice Glycémique Bas", desc: "Le Fonio est un grain ancien parfait pour remplacer le riz. Il est léger, facile à digérer et aide à contrôler la glycémie, ce qui est essentiel pour la perte de poids.", icon: "🌾" },
  { name: "Mil", benefits: "Riche en Protéines & Fibres, Énergisant, Bon pour le cœur", desc: "Le Mil est une céréale robuste qui vous garde rassasié plus longtemps grâce à ses fibres. C'est une excellente source d'énergie durable pour éviter les fringales.", icon: "🌽" },
  { name: "Sorgho", benefits: "Antioxydant, Améliore la digestion, Contrôle le cholestérol", desc: "Le Sorgho est un allié puissant pour votre santé digestive. Ses antioxydants combattent l'inflammation, un facteur clé dans la prise de poids.", icon: "🌱" },
  { name: "Niébé", benefits: "Source de Protéines Végétales, Riche en Folate, Faible en gras", desc: "L'haricot local (Niébé) est une alternative incroyable à la viande. Il construit du muscle, vous cale et stabilise votre énergie sans les graisses saturées.", icon: "🫘" }
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

const TRANSFORMATIONS = [
  {
    name: "Ndeye S.",
    stats: "-12kg en 4 mois",
    beforeImg: "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg",
    afterImg: "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg",
    story: "Ndeye voulait retrouver sa silhouette d'avant grossesse sans sacrifier les repas en famille. Mission accomplie !"
  },
  {
    name: "Ousmane T.",
    stats: "Ventre plat en 2 mois",
    beforeImg: "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg",
    afterImg: "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg",
    story: "Ousmane a dit adieu à son ventre de 'cadre sédentaire' en apprenant à mieux choisir ses plats au restaurant."
  }
];

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

const FAMILY_APPROACH_POINTS = [
  {
    icon: "🍲",
    title: "Partagez la même sauce",
    text: "Pas besoin de cuisiner deux repas ! Vous mangez la même sauce savoureuse (légumes, viandes, poissons) que toute la famille."
  },
  {
    icon: "🔄",
    title: "Le 'Switch' Intelligent",
    text: "Pendant que la famille prend du riz blanc, vous prenez votre portion de fonio, mil ou céréales complètes. C'est simple et discret."
  },
  {
    icon: "⚖️",
    title: "Le Contrôle des Portions",
    text: "Vous voulez manger le riz familial ? Pas de problème. Le guide vous apprend à prendre la juste portion qui respecte vos objectifs."
  },
  {
    icon: "👨‍👩‍👧‍👦",
    title: "Montrez l'exemple",
    text: "En mangeant plus sainement sans vous isoler, vous inspirez positivement vos proches. Le bien-être devient une affaire de famille."
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
    name: "",
    phone: "",
    pin: "",
    gender: "",
    age: "",
    height: "",
    currentWeight: "",
    dailySteps: "",
    weightLossPace: "Normalement",
    healthProfile: "",
    mainChallenge: "",
    dietaryHabits: "",
    allergies: ""
  });

  // Carousel & FAQ State
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Calorie Calculator State
  const [selectedDish, setSelectedDish] = useState<string>("");
  const [dishInfo, setDishInfo] = useState<{ calories: number; optimizedCalories: number; tip: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  
  // Lead Capture State for Calculator
  const [calcLeadData, setCalcLeadData] = useState({ name: '', phone: '' });
  const [isCalcLeadCaptured, setIsCalcLeadCaptured] = useState(false);
  const [pendingDish, setPendingDish] = useState<string>("");

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

  // Diagnostic Modal Handlers
  const handleDiagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (diagStep < 4) {
      setDiagStep(diagStep + 1);
      return;
    }

    setIsSubmittingDiag(true);
    try {
      const trialEnds = new Date();
      trialEnds.setDate(trialEnds.getDate() + 14);

      const { data: clientData } = await supabase.from('clients').upsert({
        full_name: diagData.name,
        phone: diagData.phone,
        password_temp: diagData.pin || "0000",
        type: "Client",
        saas: "Nutrition à l'Africaine",
        status: "Essai",
        trial_ends_at: trialEnds.toISOString(),
      }, { onConflict: 'phone' }).select().single();

      if (clientData) {
        localStorage.setItem('onyx_custom_session', JSON.stringify(clientData));
        setTimeout(() => router.push('/nutrition?from=diagnostic'), 3000);
      }

          const heightCm = parseFloat(diagData.height) || 0;
          const currentWeight = parseFloat(diagData.currentWeight) || 0;
          const age = parseFloat(diagData.age) || 0;
          const isMale = diagData.gender === "Homme";
          const idealWeight = heightCm > 0 ? (isMale ? (heightCm - 100 - ((heightCm - 150) / 4)) : (heightCm - 100 - ((heightCm - 150) / 2.5))) : 0;
          let deficit = 500;
          if (diagData.weightLossPace === 'Progressivement') deficit = 300;
          else if (diagData.weightLossPace === 'Rapidement') deficit = 700;
          const weightToLose = currentWeight - idealWeight;
          const bmr = (heightCm > 0 && currentWeight > 0 && age > 0) ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161) : 0;
          let nap = 1.2;
          if (diagData.dailySteps === "5 000 à 7 499 pas/jour (Légèrement actif)") nap = 1.375;
          else if (diagData.dailySteps === "7 500 à 9 999 pas/jour (Actif)") nap = 1.55;
          else if (diagData.dailySteps === "10 000+ pas/jour (Très actif)") nap = 1.725;
          const tdee = bmr * nap;
          let rawCalories = weightToLose > 0 ? tdee - deficit : (weightToLose < 0 ? tdee + 300 : tdee);
          const dailyCalories = Math.max(isMale ? 1500 : 1200, rawCalories || 0);

          const carbs = (dailyCalories * 0.40) / 4;
          const protein = (dailyCalories * 0.30) / 4;
          const fats = (dailyCalories * 0.30) / 9;

          localStorage.setItem('onyx_nutrition_goals', JSON.stringify({
             calories: dailyCalories, carbs, protein, fats
          }));

          await supabase.from('nutrition_profiles').upsert({
             phone: diagData.phone,
             client_id: clientData?.id || null,
             bmr: Math.round(bmr),
             tdee: Math.round(tdee),
             daily_calorie_goal: Math.round(dailyCalories),
             carbs_goal: Math.round(carbs),
             protein_goal: Math.round(protein),
             fats_goal: Math.round(fats),
             diagnostic_data: diagData,
             weekly_menu: [] 
          }, { onConflict: 'client_id' });

          await supabase.from('leads').insert([{
        full_name: diagData.name,
        phone: diagData.phone,
        source: "Diagnostic Nutrition Landing",
        intent: "A complété son diagnostic (Attente Plan)",
        status: "Nouveau",
        saas: "Nutrition à l'Africaine",
            message: `BMR: ${Math.round(bmr)} | Objectif: ${Math.round(dailyCalories)} kcal | Poids cible: ${idealWeight.toFixed(1)}kg | Profil Santé: ${diagData.healthProfile || '-'}`
      }]);
      
      setDiagStep(5);
    } catch (err) {
      alert("Une erreur est survenue.");
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

  // --- MOTEUR DE CALCUL NUTRITIONNEL (Pour le résultat Choc) ---
  const heightCm = parseFloat(diagData.height) || 0;
  const currentWeight = parseFloat(diagData.currentWeight) || 0;
  const age = parseFloat(diagData.age) || 0;
  const isMale = diagData.gender === "Homme";
  const idealWeight = heightCm > 0 ? (isMale ? (heightCm - 100 - ((heightCm - 150) / 4)) : (heightCm - 100 - ((heightCm - 150) / 2.5))) : 0;
  const weightToLose = currentWeight - idealWeight;
  const estimatedWeeks = weightToLose > 0 ? Math.ceil(weightToLose / 0.5) : 0; 
  const bmr = (heightCm > 0 && currentWeight > 0 && age > 0) ? (10 * currentWeight) + (6.25 * heightCm) - (5 * age) + (isMale ? 5 : -161) : 0;
  let nap = 1.2;
  if (diagData.dailySteps === "5 000 à 7 499 pas/jour (Légèrement actif)") nap = 1.375;
  else if (diagData.dailySteps === "7 500 à 9 999 pas/jour (Actif)") nap = 1.55;
  else if (diagData.dailySteps === "10 000+ pas/jour (Très actif)") nap = 1.725;
  const tdee = bmr * nap;
  let rawCalories = weightToLose > 0 ? tdee - 500 : (weightToLose < 0 ? tdee + 300 : tdee);
  const dailyCalories = Math.max(isMale ? 1500 : 1200, rawCalories || 0);

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
    { sender: 'bot', text: "👋 Bonjour ! Je suis Fanta. Prêt(e) à transformer votre corps tout en mangeant nos plats locaux ? Que voulez-vous savoir ?", options: ["Comment ça marche ?", "C'est quoi les tarifs ?", "Je veux m'inscrire 🚀"] }
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
        let currentData = { ...botData };

        if (botStep === 0) {
            const lowerReply = reply.toLowerCase();
            if (lowerReply.includes('marche') || lowerReply.includes('comment')) {
                botResponse = "C'est simple : on analyse votre profil et vous recevez un plan alimentaire incluant nos plats locaux (Thieb, Mafé...). Ensuite, on vous suit chaque semaine sur WhatsApp ! Prêt(e) à tester ?";
                botOptions = ["Je veux m'inscrire 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('tarifs') || lowerReply.includes('prix') || lowerReply.includes('combien')) {
                botResponse = "Le programme coûte seulement 2 900 F / mois ! À ce prix, vous avez le plan complet et le suivi WhatsApp de nos experts. On se lance ?";
                botOptions = ["Je veux m'inscrire 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('inscrire') || lowerReply.includes('lance') || lowerReply.includes('oui')) {
                botResponse = "Génial ! 🚀 Pour préparer votre profil, quel est votre prénom et nom ?";
                nextStep = 1;
            } else {
                botResponse = "Je vois ! (⚠️ Attention, les places pour ce mois se remplissent vite). Pour vous aider au mieux, quel est votre prénom et nom ?";
                currentData.question = reply;
                nextStep = 1;
            }
        }
        else if (botStep === 1) {
            currentData.name = reply;
            botResponse = `Enchantée ${reply.split(' ')[0]} ! Quel est votre numéro WhatsApp (ex: 77 123 45 67) ?`;
            nextStep = 2;
        }
        else if (botStep === 2) {
            currentData.phone = reply;
            botResponse = "Super. Dans quelle ville vous trouvez-vous ?";
            nextStep = 3;
        }
        else if (botStep === 3) {
            currentData.city = reply;
            botResponse = "Parfait ! J'ai toutes les infos. Je vous redirige vers notre équipe sur WhatsApp pour démarrer votre programme ! 🚀";
            nextStep = 4;
            
            try {
                await supabase.from('leads').insert([{
                    full_name: currentData.name, phone: currentData.phone, city: currentData.city,
                    message: `Note: ${currentData.question || "Veut démarrer Nutrition à l'Africaine"}`,
                    intent: "Je veux démarrer (Nutrition à l'Africaine)", source: "Bot Fanta (Nutrition à l'Africaine)", status: 'Nouveau', saas: "Nutrition à l'Africaine"
                }]);
            } catch (err) {}

            const waMsg = `🚀 *Démarrage Nutrition à l'Africaine*\n\nJe veux commencer mon rééquilibrage !\n\n*Nom:* ${currentData.name}\n*Ville:* ${currentData.city}\n\nComment on procède pour le paiement de 2.900 F ?`;
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
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fomo-shake {
          0%, 100% { transform: translateX(0) scale(1.05); }
          25% { transform: translateX(-4px) scale(1.05); }
          75% { transform: translateX(4px) scale(1.05); }
        }
        .fomo-shake-active {
          animation: fomo-shake 0.4s ease-in-out infinite;
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

      {/* NAVBAR */}
      <nav className="p-6 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => window.location.href = '/'} className={`${spaceGrotesk.className} text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-black hover:scale-105 transition-transform`}>
            NUTRITION <span className="text-black drop-shadow-sm border-b-4 border-[#39FF14]">À L'AFRICAINE</span>
         </button>
         
         <div className="flex items-center gap-4">
             <div className="relative" ref={dropdownRef}>
                 <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-black flex items-center gap-1 transition-colors">
                    Autres Solutions <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`absolute top-full right-0 mt-2 bg-white border border-zinc-200 shadow-2xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <button onClick={() => window.location.href = '/'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🏠 Accueil Onyx</button>
                 </div>
             </div>
             <button onClick={() => window.location.href = '/'} className="bg-white border border-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-black hover:text-[#39FF14] transition-colors flex items-center gap-1 shadow-sm">
                 <ChevronLeft size={14}/> Accueil
             </button>
         </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-24 px-6 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 text-green-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
             <Activity size={14} /> Santé & Bien-être
         </div>
         <h1 className={`${spaceGrotesk.className} text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.05] mb-6 text-black`}>
            MANGEZ LOCAL ET PERDEZ <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-[#2bd40d] drop-shadow-sm">JUSQU'À 8 KG / MOIS*</span>
         </h1>
         <p className="text-zinc-600 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-4 leading-relaxed">
            Oubliez les mythes sur le thé brûle-graisse. Thieb, Mafé, Yassa : on rééquilibre votre alimentation selon <strong className="text-black">NOS réalités africaines</strong>, avec un suivi direct sur WhatsApp.
         </p>
         <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-12">* Les résultats varient selon votre métabolisme et votre point de départ.</p>
         
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6">
           <button onClick={handleWaClick} className={`bg-black text-[#39FF14] px-8 md:px-12 py-5 md:py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 relative overflow-hidden group w-full sm:w-auto ${fomoTime <= 120 ? 'fomo-shake-active' : ''}`}>
              <HeartPulse size={24} className="relative z-10" /> <span className="relative z-10">Démarrer à 2.900 F</span>
           </button>
           <button onClick={() => setShowDiagnosticModal(true)} className="bg-white text-black border-2 border-black px-8 py-5 md:py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-lg flex items-center justify-center gap-3 w-full sm:w-auto">
              Diagnostic Gratuit <Activity size={20} />
           </button>
         </div>
      </section>

      {/* 2. BÉNÉFICES DIRECTS */}
      <section className="py-24 px-6 border-t border-zinc-200 bg-white">
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

      {/* SECTION : COMPARAISON */}
      <section className="py-24 px-6 bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4`}>
              Le Match : Régimes Classiques <span className="text-red-500">VS</span> Nutrition à l'Africaine
            </h2>
            <p className="text-zinc-400 font-bold text-lg">Arrêtez de vous battre contre votre culture.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* AVANT : Régimes Classiques */}
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] flex flex-col relative opacity-90">
              <span className="bg-red-900/50 text-red-500 font-black uppercase text-xs px-4 py-2 rounded-full mb-6 inline-flex items-center gap-2 w-max border border-red-800">
                <AlertTriangle size={14} /> Régimes Occidentaux
              </span>
              <ul className="space-y-4 text-zinc-400 font-medium text-lg">
                <li className="flex gap-3 items-start"><span className="text-red-500 mt-1">❌</span><span><strong className="text-white">Restriction & Frustration :</strong> Adieu Thieb, bonjour salade sans goût.</span></li>
                <li className="flex gap-3 items-start"><span className="text-red-500 mt-1">❌</span><span><strong className="text-white">Effet Yoyo Garanti :</strong> Vous perdez 10kg, vous en reprenez 15 dès que vous arrêtez.</span></li>
                <li className="flex gap-3 items-start"><span className="text-red-500 mt-1">❌</span><span><strong className="text-white">Coûteux & Compliqué :</strong> Trouver du quinoa et des baies de goji à Dakar ? Bonne chance.</span></li>
                <li className="flex gap-3 items-start"><span className="text-red-500 mt-1">❌</span><span><strong className="text-white">Isolement Social :</strong> "Désolé je ne peux pas manger avec vous, je suis au régime."</span></li>
              </ul>
            </div>

            {/* APRÈS : Nutrition à l'Africaine */}
            <div className="bg-black border-2 border-[#39FF14] p-8 rounded-[2rem] flex flex-col relative shadow-[0_0_50px_rgba(57,255,20,0.15)] transform md:scale-105 z-10">
              <span className="bg-[#39FF14] text-black font-black uppercase text-xs px-4 py-2 rounded-full mb-6 inline-flex items-center gap-2 w-max shadow-lg">
                <CheckCircle size={14} /> Nutrition à l'Africaine (La Méthode)
              </span>
              <ul className="space-y-4 text-zinc-200 font-medium text-lg">
                <li className="flex gap-3 items-start"><span className="text-[#39FF14] mt-1">✅</span><span><strong className="text-white">Plaisir & Culture :</strong> Mangez votre Mafé en ajustant les quantités (Pilier 1), ou remplacez le riz par du fonio pour accélérer les résultats (Pilier 2). C'est vous qui choisissez.</span></li>
                <li className="flex gap-3 items-start"><span className="text-[#39FF14] mt-1">✅</span><span><strong className="text-white">Rééquilibrage Durable :</strong> On ne vous met pas au régime, on vous apprend à manger pour la vie.</span></li>
                <li className="flex gap-3 items-start"><span className="text-[#39FF14] mt-1">✅</span><span><strong className="text-white">Économique & Accessible :</strong> Les ingrédients sont déjà dans votre cuisine et au marché du coin.</span></li>
                <li className="flex gap-3 items-start"><span className="text-[#39FF14] mt-1">✅</span><span><strong className="text-white">Vie Sociale Préservée :</strong> Continuez à partager les repas en famille, sans culpabilité.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* NOUVEAU : SECTION GUIDE */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="text-left">
            <div className="inline-flex items-center gap-2 bg-zinc-100 border border-zinc-200 text-zinc-700 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
                <BookOpen size={14} /> Le Guide Inclus
            </div>
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-6 text-black`}>Le Guide qui <span className="text-black border-b-4 border-[#39FF14]">change tout.</span></h2>
            <p className="text-zinc-600 font-medium text-lg mb-8 leading-relaxed">
              Découvrez les secrets de la nutrition adaptée à nos réalités. Ce guide de 10 pages déconstruit les mythes, vous présente les céréales locales qui remplacent le riz blanc, et vous prouve que manger sainement ne coûte pas plus cher.
            </p>
            <button onClick={handleWaClick} className="bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">
              Obtenir mon Guide <ArrowRight size={18}/>
            </button>
          </div>
          <div className="relative mx-auto w-full max-w-sm flex items-center justify-center">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#39FF14] rounded-full blur-[80px] opacity-20 pointer-events-none"></div>
             <motion.div
               animate={{ y: [0, -20, 0] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="w-[85%] h-auto z-10 drop-shadow-2xl"
             >
               <img 
                 src="https://i.ibb.co/Yy62b03/mockup-guide-nutrition.png"
                 alt="Aperçu du Guide Nutrition à l'Africaine"
                 className="max-w-full max-h-full object-contain"
               />
             </motion.div>
          </div>
        </div>
      </section>

      {/* 3. TARIFICATION */}
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
                  <ul className="space-y-3 mb-10 text-zinc-400 text-sm font-bold flex-1">
                     <li className="flex gap-2">✔ Plan alimentaire personnalisé</li>
                     <li className="flex gap-2">✔ Intégration des repas locaux</li>
                     <li className="flex gap-2">✔ Suivi WhatsApp (Hebdo)</li>
                  </ul>
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
                  <ul className="space-y-3 mb-10 text-zinc-300 text-sm font-bold flex-1">
                     <li className="flex gap-2 text-white">✔ <strong className="text-white">Tout le programme de base</strong></li>
                     <li className="flex gap-2 text-white">✔ <strong className="text-white">Accès au Guide PDF Complet (10 pages)</strong></li>
                     <li className="flex gap-2 text-white">✔ <strong className="text-white">Suivi renforcé pour ancrer les habitudes</strong></li>
                  </ul>
                  <button onClick={handleWaClick} className={`w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(57,255,20,0.3)] flex justify-center items-center gap-2 ${fomoTime <= 120 ? 'fomo-shake-active' : ''}`}>
                     COMMENCER MON PROGRAMME <ArrowRight size={18}/>
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* SECTION 5 : TÉMOIGNAGES */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>
              Ils ont transformé leur vie, <span className="text-black border-b-4 border-[#39FF14]">pas leur culture.</span>
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
                    <p className="text-zinc-600 font-medium leading-relaxed mb-6 flex-1">"{TESTIMONIALS[activeTestimonial].text}"</p>
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

      {/* SECTION 5.5 : AVANT/APRÈS */}
      <section className="py-24 px-6 bg-zinc-950 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4`}>
              Des résultats <span className="text-[#39FF14]">visibles</span>, pas des promesses.
            </h2>
            <p className="text-zinc-400 font-bold text-lg">Ils ont fait confiance à la méthode. Leurs corps ont changé.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {TRANSFORMATIONS.map((trans, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-black border border-zinc-800 p-6 rounded-[2rem] shadow-2xl"
              >
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <img src={trans.beforeImg} alt={`Avant - ${trans.name}`} className="w-full h-full object-cover rounded-xl aspect-[3/4] grayscale" />
                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded">Avant</span>
                  </div>
                  <div className="relative">
                    <img src={trans.afterImg} alt={`Après - ${trans.name}`} className="w-full h-full object-cover rounded-xl aspect-[3/4]" />
                    <span className="absolute top-2 left-2 bg-[#39FF14] text-black text-[10px] font-black uppercase px-2 py-1 rounded">Après</span>
                  </div>
                </div>
                <div className="text-center">
                  <h4 className="font-black text-xl uppercase text-white">{trans.name}</h4>
                  <p className="font-bold text-lg text-[#39FF14] mb-2">{trans.stats}</p>
                  <p className="text-sm text-zinc-400 font-medium">{trans.story}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION : APPROCHE FAMILIALE */}
      <section className="py-24 px-6 bg-zinc-100 border-y border-zinc-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>
              "Et si ma famille mange du riz ?"
            </h2>
            <p className="text-zinc-500 font-bold text-lg">On a pensé à tout. Voici comment le programme s'intègre <span className="text-black border-b-4 border-[#39FF14]">sans perturber vos repas familiaux.</span></p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {FAMILY_APPROACH_POINTS.map((point, index) => (
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
        </div>
      </section>

      {/* SECTION : LES TRÉSORS DE NOS TERROIRS */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>
              Les Trésors de <span className="text-black border-b-4 border-[#39FF14]">Nos Terroirs</span>
            </h2>
            <p className="text-zinc-500 font-bold text-lg">Découvrez les super-pouvoirs des ingrédients que nous mettons en avant.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {INGREDIENTS.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-zinc-50 border border-zinc-100 p-8 rounded-[2rem] text-center flex flex-col"
              >
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="font-black text-xl uppercase text-black mb-2">{item.name}</h3>
                <p className="text-xs font-bold text-[#39FF14] bg-black px-3 py-1 rounded-full mb-4 w-max mx-auto">{item.benefits}</p>
                <p className="text-zinc-600 font-medium leading-relaxed flex-1">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION : CALCULATEUR DE CALORIES SIMPLIFIÉ */}
      <section className="py-24 px-6 bg-zinc-100 border-t border-zinc-200">
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

      {/* SECTION 6 : FAQ */}
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
                   <div><p className="text-[#39FF14] font-black uppercase text-xs">Fanta - Conseillère</p></div>
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
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto" onClick={(e: any) => e.target === e.currentTarget && setShowDiagnosticModal(false)}>
          <div className="w-full max-w-2xl bg-white border border-zinc-200 rounded-[2rem] shadow-2xl flex flex-col my-8 relative animate-in zoom-in-95">
            <button onClick={() => setShowDiagnosticModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-20"><X size={20}/></button>

            <div className="bg-black text-white p-6 sm:p-8 text-center relative rounded-t-[2rem]">
              <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
                <div className="h-full bg-[#39FF14] transition-all duration-500" style={{ width: `${(diagStep / 4) * 100}%` }}></div>
              </div>
              <Activity className="text-[#39FF14] mx-auto mb-2" size={28} />
              <h2 className={`${spaceGrotesk.className} text-xl md:text-3xl font-black uppercase tracking-tighter`}>
                {diagStep === 5 ? "Diagnostic Terminé !" : "Bilan Nutritionnel"}
              </h2>
            </div>

            <div className="p-6 sm:p-8">
              {diagStep !== 5 ? (
                <form onSubmit={handleDiagSubmit} className="space-y-6">
                  {diagStep === 1 && (
                    <div className="space-y-4 animate-in slide-in-from-right-8">
                      <div className="flex items-center gap-3 mb-4"><Scale className="text-[#39FF14]" /><h3 className="text-lg font-black uppercase text-black">Informations de base</h3></div>
                      <input type="text" name="name" required placeholder="Votre Prénom et Nom *" value={diagData.name} onChange={(e) => setDiagData({...diagData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black text-black" />
                      <input type="tel" name="phone" required placeholder="Numéro WhatsApp *" value={diagData.phone} onChange={(e) => setDiagData({...diagData, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black text-black" />
                      <input type="password" name="pin" maxLength={4} required placeholder="Créez un code PIN (4 chiffres) *" value={diagData.pin} onChange={(e) => setDiagData({...diagData, pin: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black text-black" />
                      <div className="space-y-2 mt-4">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Votre sexe *</label>
                        <div className="grid grid-cols-2 gap-4">
                           <div onClick={() => setDiagData({...diagData, gender: 'Femme'})} className={`cursor-pointer border-4 rounded-2xl overflow-hidden relative transition-all ${diagData.gender === 'Femme' ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                              <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_1_1_en_gardant_202606111043_unmonc.jpg" className="w-full aspect-square object-cover" alt="Femme" />
                              <div className="absolute bottom-0 w-full bg-black/80 text-white text-center py-3 font-black uppercase tracking-widest text-sm backdrop-blur-sm">Femme</div>
                           </div>
                           <div onClick={() => setDiagData({...diagData, gender: 'Homme'})} className={`cursor-pointer border-4 rounded-2xl overflow-hidden relative transition-all ${diagData.gender === 'Homme' ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                              <img src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1781174715/redimensionner_format_1_1_en_202606111044_rjknkg.jpg" className="w-full aspect-square object-cover" alt="Homme" />
                              <div className="absolute bottom-0 w-full bg-black/80 text-white text-center py-3 font-black uppercase tracking-widest text-sm backdrop-blur-sm">Homme</div>
                           </div>
                        </div>
                      </div>
                      <input type="number" required placeholder="Votre Âge *" value={diagData.age} onChange={(e) => setDiagData({...diagData, age: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black text-black" />
                    </div>
                  )}
                  
                  {diagStep === 2 && (
                    <div className="space-y-4 animate-in slide-in-from-right-8">
                      <div className="flex items-center gap-3 mb-4"><Target className="text-[#39FF14]" /><h3 className="text-lg font-black uppercase text-black">Vos Objectifs</h3></div>
                      <div className="flex gap-4">
                        <input type="number" required placeholder="Taille (cm) *" value={diagData.height} onChange={(e) => setDiagData({...diagData, height: e.target.value})} className="w-1/2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-black" />
                        <input type="number" required placeholder="Poids (kg) *" value={diagData.currentWeight} onChange={(e) => setDiagData({...diagData, currentWeight: e.target.value})} className="w-1/2 p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-black" />
                      </div>
                      <div className="space-y-2 mt-6">
                         <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Combien de pas faites-vous par jour ? *</label>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {["< 5 000 pas/jour (Sédentaire)", "5 000 à 7 499 pas/jour (Légèrement actif)", "7 500 à 9 999 pas/jour (Actif)", "10 000+ pas/jour (Très actif)"].map(steps => (
                               <button type="button" key={steps} onClick={() => setDiagData({...diagData, dailySteps: steps})} className={`p-4 rounded-2xl border-2 text-left font-bold text-xs transition-all ${diagData.dailySteps === steps ? 'bg-black text-[#39FF14] border-black shadow-lg' : 'bg-zinc-50 border-zinc-200 hover:border-black text-black'}`}>
                                  {steps}
                               </button>
                            ))}
                         </div>
                      </div>
                      
                      <div className="space-y-2 mt-6 bg-zinc-50 p-6 rounded-3xl border border-zinc-200">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4 block">Rythme de perte de poids souhaité *</label>
                        <div className="relative pt-4 pb-2 px-2">
                           <input 
                              type="range" 
                              min="1" max="3" step="1" 
                              value={diagData.weightLossPace === 'Progressivement' ? 1 : diagData.weightLossPace === 'Normalement' ? 2 : 3}
                              onChange={(e) => {
                                 const val = e.target.value;
                                 setDiagData({...diagData, weightLossPace: val === '1' ? 'Progressivement' : val === '2' ? 'Normalement' : 'Rapidement'});
                              }}
                              className="w-full accent-black h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                           />
                           <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400 mt-4">
                              <span className={`w-1/3 text-left ${diagData.weightLossPace === 'Progressivement' ? 'text-[#39FF14] drop-shadow-md' : ''}`}>Progressif<br/>(-0.3kg/sem)</span>
                              <span className={`w-1/3 text-center ${diagData.weightLossPace === 'Normalement' ? 'text-black' : ''}`}>Normal<br/>(-0.5kg/sem)</span>
                              <span className={`w-1/3 text-right ${diagData.weightLossPace === 'Rapidement' ? 'text-red-500' : ''}`}>Rapide<br/>(-0.7kg/sem)</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {diagStep === 3 && (
                    <div className="space-y-4 animate-in slide-in-from-right-8">
                      <div className="flex items-center gap-3 mb-4"><Apple className="text-[#39FF14]" /><h3 className="text-lg font-black uppercase text-black">Habitudes Alimentaires</h3></div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Consommation de riz/plats en sauce ? *</label>
                         <div className="grid grid-cols-1 gap-2">
                            {["Tous les jours", "3-4 fois par semaine", "Rarement"].map(habit => (
                               <button type="button" key={habit} onClick={() => setDiagData({...diagData, dietaryHabits: habit})} className={`p-4 rounded-2xl border-2 text-left font-bold text-sm transition-all ${diagData.dietaryHabits === habit ? 'bg-black text-[#39FF14] border-black shadow-md' : 'bg-zinc-50 border-zinc-200 hover:border-black text-black'}`}>
                                  {habit}
                               </button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-4 mt-6">
                        <label className="text-xs font-black uppercase tracking-widest text-zinc-500">Quel est ton défi principal au quotidien ? *</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                           {[
                             { id: "Le Sel & la Tension", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781177365/A_studio_minimalist_close-up_shot_202606111128_iln7to.jpg", title: "Le Sel & la Tension" },
                             { id: "Le Sucre & l'Attaya", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781177365/A_minimalist_close-up_shot_of_202606111128_cn0uom.jpg", title: "Le Sucre & l'Attaya" },
                             { id: "Le Bol Familial", img: "https://res.cloudinary.com/dtr2wtoty/image/upload/v1781177435/A_high-angle_studio_shot_of_202606111129_rmwlo7.jpg", title: "Le Bol Familial" }
                           ].map(challenge => (
                              <div key={challenge.id} onClick={() => setDiagData({...diagData, mainChallenge: challenge.id})} className={`cursor-pointer border-4 rounded-2xl overflow-hidden relative transition-all ${diagData.mainChallenge === challenge.id ? 'border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.2)]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                                 <img src={challenge.img} className="w-full aspect-square object-cover" alt={challenge.title} />
                                 <div className="absolute bottom-0 w-full bg-black/80 text-white text-center py-3 font-black uppercase tracking-widest text-[10px] backdrop-blur-sm">{challenge.title}</div>
                              </div>
                           ))}
                        </div>
                      </div>
                      <input type="text" placeholder="Allergies (Ex: Arachide...)" value={diagData.allergies} onChange={(e) => setDiagData({...diagData, allergies: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-black" />
                    </div>
                  )}

                  {diagStep === 4 && (
                    <div className="text-center py-6 animate-in zoom-in">
                      <CheckCircle className="text-[#39FF14] w-16 h-16 mx-auto mb-4" />
                      <h3 className="text-xl font-black uppercase mb-2 text-black">Analyse en cours...</h3>
                      <p className="text-zinc-600 font-medium mb-6">Validez pour générer vos recommandations sur-mesure.</p>
                      <button type="submit" disabled={isSubmittingDiag} className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase hover:scale-105 transition-transform flex justify-center items-center gap-2">
                        {isSubmittingDiag ? "Traitement..." : "Voir mon résultat"} <ArrowRight size={18}/>
                      </button>
                    </div>
                  )}

                  {diagStep < 4 && (
                    <div className="flex gap-4 pt-4 border-t border-zinc-100">
                      {diagStep > 1 && <button type="button" onClick={() => setDiagStep(diagStep - 1)} className="px-6 py-4 bg-zinc-100 rounded-xl font-bold text-sm text-black">Retour</button>}
                      <button type="submit" className="flex-1 bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase flex justify-center items-center gap-2 hover:bg-zinc-800">Suivant <ChevronRight size={18}/></button>
                    </div>
                  )}
                </form>
              ) : (
                <div className="text-center py-6 animate-in zoom-in">
                  <h3 className="text-2xl font-black uppercase mb-6 text-black">Analyse Terminée !</h3>
                  
                  <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 mb-8 text-left shadow-sm">
                     <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-4">
                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Votre IMC</span>
                        <span className="font-black text-3xl text-black">{calculateIMC()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Catégorie</span>
                        <span className="font-black text-sm md:text-base text-black bg-[#39FF14] px-4 py-1.5 rounded-xl text-center shadow-sm">{getIMCCategory(calculateIMC())}</span>
                     </div>
                  </div>

                  <p className="text-zinc-600 font-medium mb-8">Téléchargez votre bilan complet au format PDF pour le conserver, ou envoyez-le à votre coach pour obtenir votre premier menu.</p>
                  
                  <div className="flex flex-col gap-4">
                    <button onClick={() => router.push('/nutrition?from=diagnostic')} type="button" className="w-full bg-black text-[#39FF14] py-5 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-800 transition-colors shadow-lg flex justify-center items-center gap-2">
                      Accéder à mon espace personnel <ArrowRight size={18}/>
                    </button>
                    <button onClick={handleDownloadPDF} type="button" className="w-full bg-zinc-100 text-black py-4 rounded-xl font-black uppercase tracking-widest hover:bg-zinc-200 transition-colors shadow-sm flex justify-center items-center gap-2 border border-zinc-200">
                      <Download size={18}/> Télécharger mon bilan PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
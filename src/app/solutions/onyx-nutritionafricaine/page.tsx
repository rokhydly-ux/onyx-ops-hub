"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { 
  Activity, HeartPulse, Smartphone, Flame, CheckCircle, 
  ArrowRight, ChevronLeft, AlertTriangle, Zap, ChevronDown, ChevronRight,
  Send, X, ArrowUp, BookOpen, Sparkles
} from "lucide-react";

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

export default function NutritionAfricaineLanding() {
  const waNumber = "221785338417";
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Carousel & FAQ State
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
         <h1 className={`${spaceGrotesk.className} text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.05] mb-8 text-black`}>
            FINI LES RÉGIMES IMPOSSIBLES. <br/>
            <span className="text-zinc-400">MANGEZ LOCAL ET</span> <span className="underline decoration-[#39FF14] decoration-8 underline-offset-8">PERDEZ DU POIDS.</span>
         </h1>
         <p className="text-zinc-600 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            Oubliez les mythes sur le thé brûle-graisse et le stress qui fait gonfler. Thieb, Mafé, Yassa : on rééquilibre votre alimentation selon <strong className="text-black">NOS réalités africaines</strong>, avec un suivi direct sur WhatsApp pour des résultats durables.
         </p>
         
         <button onClick={handleWaClick} className={`bg-black text-[#39FF14] px-8 md:px-12 py-5 md:py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] flex items-center justify-center gap-3 mx-auto relative overflow-hidden group ${fomoTime <= 120 ? 'fomo-shake-active' : ''}`}>
            <HeartPulse size={24} className="relative z-10" /> <span className="relative z-10">Démarrer pour 2.900 F / mois</span>
         </button>
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
                <CheckCircle size={14} /> Nutrition à l'Africaine
              </span>
              <ul className="space-y-4 text-zinc-200 font-medium text-lg">
                <li className="flex gap-3 items-start"><span className="text-[#39FF14] mt-1">✅</span><span><strong className="text-white">Plaisir & Culture :</strong> Perdez du poids en mangeant votre Mafé. On ajuste juste les quantités.</span></li>
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
    </main>
  );
}
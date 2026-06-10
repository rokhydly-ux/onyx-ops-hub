"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { 
  Activity, HeartPulse, Smartphone, Flame, CheckCircle, 
  ArrowRight, ChevronLeft, AlertTriangle, Zap, ChevronDown,
  Send, X, ArrowUp, BookOpen, Sparkles
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function OnyxNutritionLanding() {
  const waNumber = "221785338417";
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

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
                    message: `Note: ${currentData.question || 'Veut démarrer OnyxNutrition'}`,
                    intent: 'Je veux démarrer (OnyxNutrition)', source: 'Bot Fanta (OnyxNutrition)', status: 'Nouveau', saas: 'OnyxNutrition'
                }]);
            } catch (err) {}

            const waMsg = `🚀 *Démarrage OnyxNutrition*\n\nJe veux commencer mon rééquilibrage !\n\n*Nom:* ${currentData.name}\n*Ville:* ${currentData.city}\n\nComment on procède pour le paiement de 2.900 F ?`;
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`, "_blank"); }, 1500);
        }

        setBotData(currentData);
        setBotStep(nextStep);
        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);
    }, 500);
  };

  const handleWaClick = () => {
    const msg = `Bonjour l'équipe Onyx ! Je souhaite démarrer mon programme OnyxNutrition pour 2.900 F par mois.`;
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
                 alt="Mockup du Guide Nutrition à l'Africaine"
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
               <div className="bg-zinc-900 border-2 border-[#39FF14] p-8 rounded-[3rem] flex flex-col relative shadow-[0_0_50px_rgba(57,255,20,0.2)] z-10 md:scale-105">
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
"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Wallet, ShieldCheck, Users, MessageSquare, Sparkles, 
  ChevronLeft, AlertTriangle, CheckCircle, ChevronDown,
  Send, X, ArrowUp, Sun, Moon, ArrowRight
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function OnyxTontineLanding() {
  const waNumber = "221785338417";
  
  const [refId, setRefId] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // Theme state par défaut sur 'light'

  // Navigation & UI
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Carrousel Etapes
  const [currentStep, setCurrentStep] = useState(0);

  // Configuration Bot Fanta
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isBotDismissed, setIsBotDismissed] = useState(false);
  const [userReply, setUserReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botMessages, setBotMessages] = useState<any[]>([
    { sender: 'bot', text: "👋 Nanga def ! Je suis Fanta. Avez-vous des questions sur Onyx Tontine, notre outil pour gérer votre Natt en toute tranquillité ?", options: ["Oui", "Non"] }
  ]);

  const steps = [
    {
      title: "1. Zéro Mot de Passe",
      desc: "Connexion ultra-sécurisée et simple : pas de mot de passe compliqué à retenir. Juste votre numéro de téléphone et un code PIN secret à 4 chiffres, exactement comme sur Wave ou Orange Money.",
      img: "https://i.ibb.co/6Rh4wY1j/W1.png",
      icon: <Users size={32} className="text-[#FACC15] mb-4"/>
    },
    {
      title: "2. Relances WhatsApp",
      desc: "L'application se charge du mauvais rôle. Elle envoie des notifications WhatsApp automatiques et amicales aux retardataires pour réclamer les cotisations. Fini les disputes !",
      img: "https://i.ibb.co/YTWMH9vd/W2.png",
      icon: <MessageSquare size={32} className="text-[#39FF14] mb-4"/>
    },
    {
      title: "3. Tirage 100% Transparent",
      desc: "Ramenez de la confiance ! Le tirage au sort est digital, infalsifiable et les résultats sont instantanément partagés avec tout le groupe. Chaque mois, c'est la fête.",
      img: "https://i.ibb.co/gL4wxzTr/W3.png",
      icon: <Sparkles size={32} className="text-[#00E5FF] mb-4"/>
    }
  ];

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('ref') || localStorage.getItem('onyx_ambassador_ref');
    if (ref) {
      setRefId(ref);
      localStorage.setItem('onyx_ambassador_ref', ref);
    }
    const timer = setTimeout(() => setIsBotOpen(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [botMessages]);

  const processBotReply = (reply: string) => {
    if(!reply.trim()) return;
    const newMsgs = [...botMessages, { sender: 'client', text: reply }];
    setBotMessages(newMsgs);
    setUserReply("");

    setTimeout(async () => {
        const lowerReply = reply.toLowerCase();
        let botResponse = "";
        let botOptions: string[] | undefined = undefined;

        if (lowerReply === "oui") {
            botResponse = "Je vous écoute ! Vous pouvez me poser vos questions sur le prix, les relances, ou la sécurité.";
        } else if (lowerReply === "non" || lowerReply === "non merci") {
            botResponse = "Très bien ! Profitez bien de votre premier mois OFFERT en cliquant sur le bouton en bas de page.";
        } else if (lowerReply === "oui, parler à un conseiller" || lowerReply.includes("conseiller") || lowerReply.includes("humain") || lowerReply.includes("whatsapp")) {
            botResponse = "Je vous redirige vers notre expert sur WhatsApp ! À tout de suite 🚀";
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent("Bonjour l'équipe Onyx ! Je suis sur la page Onyx Tontine et j'aimerais profiter du premier mois gratuit.")}`, '_blank'); }, 1000);
        } else if (lowerReply.includes("prix") || lowerReply.includes("coût") || lowerReply.includes("tarif") || lowerReply.includes("combien")) {
            botResponse = "Le premier mois est 100% OFFERT ! Ensuite, c'est seulement 6 900 F/mois pour toute l'association. C'est le prix du Dalal ak Xel !";
        } else {
            botResponse = "C'est noté ! Voulez-vous que je vous mette en relation avec un conseiller humain sur WhatsApp pour en discuter ?";
            botOptions = ["Oui, parler à un conseiller", "Non merci"];
        }

        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);

        try {
            await supabase.from('leads').insert([{ full_name: 'Visiteur Tontine', intent: 'Question Bot', source: 'Bot Fanta', message: reply, status: 'Nouveau', ambassador_id: refId || undefined }]);
        } catch (err) {}
    }, 1000);
  };

  const handleWaClick = () => {
    const msg = `Bonjour l'équipe Onyx ! Je veux profiter de l'offre PREMIER MOIS OFFERT pour créer ma Tontine.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  // Couleurs dynamiques selon le thème
  const bgMain = theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900';
  const bgCard = theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';
  const textMuted = theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500';

  return (
    <main className={`min-h-screen ${bgMain} overflow-x-hidden selection:bg-[#FACC15]/30 pb-24 font-sans transition-colors duration-300`}>
      {/* NAVBAR */}
      <nav className="p-6 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => window.location.href = '/'} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform`}>
            ONYX<span className="text-[#FACC15] drop-shadow-sm">TONTINE</span>
         </button>
         
         <div className="flex items-center gap-4">
             <button 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
                className={`p-2 rounded-full border ${bgCard} hover:scale-110 transition-transform`}
             >
                {theme === 'light' ? <Moon size={18} className="text-zinc-900"/> : <Sun size={18} className="text-white"/>}
             </button>

             <div className="relative" ref={dropdownRef}>
                 <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`text-xs font-bold ${textMuted} uppercase tracking-widest hover:text-[#FACC15] flex items-center gap-1 transition-colors`}>
                    Autres Solutions <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`absolute top-full right-0 mt-2 ${bgCard} border shadow-2xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <button onClick={() => window.location.href = '/'} className={`text-left px-4 py-2 text-xs font-bold ${textMuted} hover:bg-zinc-100 dark:hover:bg-black hover:text-[#FACC15] rounded-xl transition`}>🏠 Accueil Onyx</button>
                 </div>
             </div>
             <button onClick={() => window.location.href = '/'} className={`${theme === 'dark' ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'} px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors flex items-center gap-1`}>
             <ChevronLeft size={14}/> Accueil
         </button>
         </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-20 px-6 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="inline-flex items-center gap-2 bg-[#FACC15]/20 border border-[#FACC15]/50 text-[#FACC15] px-6 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_30px_rgba(250,204,21,0.3)] animate-pulse">
             🎁 1er Mois 100% Offert - Sans Engagement
         </div>
         <h1 className={`${spaceGrotesk.className} text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.95] mb-8`}>
            BUL SONN CI CAHIER YI. <br/> GÉREZ VOTRE NATT EN <span className="text-[#FACC15] underline decoration-[#FACC15]/30 underline-offset-8">TOUTE SÉRÉNITÉ.</span>
         </h1>
         <p className={`${textMuted} text-lg md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed`}>
            Importez vos membres, laissez l'application réclamer les cotisations sur WhatsApp à votre place. <strong className={theme === 'dark' ? 'text-white' : 'text-black'}>Une gestion transparente, pensée pour le Sénégal.</strong>
         </p>
         
         <button onClick={handleWaClick} className="bg-[#FACC15] text-black px-8 md:px-12 py-5 md:py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(250,204,21,0.4)] flex items-center justify-center gap-3 mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <Wallet size={24} className="relative z-10" /> <span className="relative z-10">Créer ma Tontine (Mois Gratuit)</span>
         </button>
      </section>

      {/* 2. AVANT / APRÈS ONYX TONTINE */}
      <section className={`py-24 px-6 border-y ${theme === 'dark' ? 'border-zinc-900 bg-black' : 'border-zinc-200 bg-zinc-100'}`}>
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4`}>Passez à la vitesse <span className="text-[#FACC15]">supérieure.</span></h2>
               <p className={`${textMuted} font-medium`}>Ne laissez plus les retards et les doutes briser vos relations.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
               {/* AVANT */}
               <div className={`${theme === 'dark' ? 'bg-red-950/20 border-red-900/50' : 'bg-red-50 border-red-200'} border p-6 rounded-[2rem] flex flex-col relative overflow-hidden opacity-90 grayscale-[30%]`}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full"></div>
                  <span className="bg-red-500/20 text-red-600 dark:text-red-500 font-black uppercase text-xs px-4 py-2 rounded-full mb-6 inline-flex items-center gap-2 w-max border border-red-500/20">
                      <AlertTriangle size={14} /> AVANT : Le Cauchemar
                  </span>
                  <div className="rounded-xl overflow-hidden mb-6 shadow-lg border border-red-500/20">
                     <img src="https://i.ibb.co/HLNXYGJN/A1.png" alt="Gestion classique difficile" className="w-full h-auto object-cover" />
                  </div>
                  <p className={`font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>Cahiers perdus, retards non suivis, et relances manuelles gênantes qui créent des tensions dans le groupe.</p>
               </div>

               {/* APRÈS */}
               <div className={`${bgCard} border-2 border-[#FACC15] p-6 rounded-[2rem] flex flex-col relative shadow-[0_0_50px_rgba(250,204,21,0.15)] transform md:scale-105 z-10`}>
                  <div className="absolute top-0 right-0 w-48 h-48 bg-[#FACC15]/10 blur-3xl rounded-full"></div>
                  <span className="bg-[#FACC15] text-black font-black uppercase text-xs px-4 py-2 rounded-full mb-6 inline-flex items-center gap-2 w-max shadow-lg">
                      <CheckCircle size={14} /> APRÈS : Dalal sa Xel ak Onyx
                  </span>
                  <div className="rounded-xl overflow-hidden mb-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
                     <img src="https://i.ibb.co/rRBM6bmV/T1.png" alt="Dashboard Onyx Tontine" className="w-full h-auto object-cover" />
                  </div>
                  <p className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>Tableau de bord clair, historique ineffaçable, et relances 100% automatiques sur WhatsApp. Vous encaissez, on s'occupe du reste.</p>
               </div>
            </div>
         </div>
      </section>

      {/* 3. FONCTIONNALITÉS KILLERS (CARROUSEL) */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
         <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4`}>Un outil puissant, <span className="text-[#FACC15]">simple comme Wave.</span></h2>
            <p className={`${textMuted} font-medium max-w-2xl mx-auto`}>Vos membres n'ont rien à installer. L'expérience est fluide, rapide et sécurisée.</p>
         </div>
         
         <div className={`${bgCard} border rounded-[2rem] p-6 md:p-12 shadow-2xl relative`}>
            {/* Contenu de l'étape active */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
               <div className="flex-1 text-left">
                  {steps[currentStep].icon}
                  <h3 className="text-2xl font-black uppercase mb-4">{steps[currentStep].title}</h3>
                  <p className={`${textMuted} font-medium text-lg leading-relaxed mb-8`}>{steps[currentStep].desc}</p>
                  
                  {/* Contrôles du Carrousel */}
                  <div className="flex items-center gap-4">
                     <button 
                        onClick={() => setCurrentStep(prev => prev === 0 ? steps.length - 1 : prev - 1)}
                        className={`p-3 rounded-full ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'} transition-colors`}
                     >
                        <ChevronLeft size={20} />
                     </button>
                     <span className="font-bold text-sm">Étape {currentStep + 1} / {steps.length}</span>
                     <button 
                        onClick={() => setCurrentStep(prev => prev === steps.length - 1 ? 0 : prev + 1)}
                        className={`p-3 rounded-full ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-zinc-100 hover:bg-zinc-200'} transition-colors`}
                     >
                        <ArrowRight size={20} />
                     </button>
                  </div>
               </div>
               
               <div className="flex-1 w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#FACC15]/20 to-transparent blur-2xl rounded-[2rem]"></div>
                  <img 
                     src={steps[currentStep].img} 
                     alt={steps[currentStep].title} 
                     className="w-full h-auto rounded-[2rem] relative z-10 border border-zinc-200 dark:border-zinc-800 shadow-xl object-cover aspect-square md:aspect-auto"
                  />
               </div>
            </div>
         </div>
      </section>

      {/* 4. TARIFICATION AGRESSIVE */}
      <section className={`py-24 px-6 ${theme === 'dark' ? 'bg-black' : 'bg-zinc-100'} relative`}>
         <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4`}>Ne prenez <span className="text-[#FACC15]">aucun risque.</span></h2>
            </div>
            
            <div className={`${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'} border p-8 md:p-12 rounded-[3rem] flex flex-col md:flex-row items-center gap-12 hover:border-[#FACC15]/50 transition-colors shadow-2xl relative overflow-hidden`}>
               <div className="absolute top-0 left-0 w-full h-2 bg-[#FACC15]"></div>
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15]/10 blur-3xl rounded-full"></div>
               
               <div className="flex-1 text-left relative z-10">
                  <span className="bg-red-500 text-white font-black uppercase text-xs px-3 py-1 rounded-full mb-4 inline-block animate-pulse">Offre Limitée</span>
                  <h3 className={`${spaceGrotesk.className} text-4xl font-black uppercase mb-4`}>Onyx Tontine</h3>
                  <p className={`${textMuted} font-medium mb-6`}>Créez des tontines illimitées, invitez tous vos membres, et automatisez vos finances sans rien payer aujourd'hui.</p>
                  <ul className={`space-y-4 mb-8 text-sm font-bold ${theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'}`}>
                     <li className="flex gap-3"><CheckCircle size={18} className="text-[#FACC15]"/> 1er Mois 100% OFFERT</li>
                     <li className="flex gap-3"><CheckCircle size={18} className="text-[#FACC15]"/> Relances WhatsApp Automatiques</li>
                     <li className="flex gap-3"><CheckCircle size={18} className="text-[#FACC15]"/> Tirage au sort digital sécurisé</li>
                  </ul>
               </div>
               
               <div className={`${theme === 'dark' ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border p-8 rounded-[2rem] w-full md:w-auto text-center relative z-10 shadow-xl`}>
                  <div className="text-lg font-black text-red-500 line-through mb-1">6 900 F</div>
                  <div className="text-6xl font-black mb-2 text-[#FACC15]">0 F</div>
                  <div className={`text-sm ${textMuted} font-bold uppercase tracking-widest mb-8`}>Le premier mois</div>
                  <button onClick={handleWaClick} className="w-full bg-[#FACC15] text-black py-4 px-8 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(250,204,21,0.2)]">
                     Profiter de l'offre
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* BOUTON REMONTER EN HAUT */}
      {showScrollTop && (
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className={`fixed bottom-24 left-6 z-[90] ${theme === 'dark' ? 'bg-zinc-900 text-white border-zinc-800' : 'bg-white text-black border-zinc-200'} p-3 md:p-4 rounded-full shadow-2xl border hover:scale-110 hover:border-[#FACC15] transition-all animate-in fade-in`}
         >
           <ArrowUp size={24} />
         </button>
      )}

      {/* BOT FANTA FAQ */}
      <div className="fixed bottom-24 right-6 z-[90] flex flex-col items-end">
        {isBotOpen && (
          <div className={`rounded-[2rem] shadow-2xl border-2 border-[#39FF14] p-0 mb-4 w-[340px] h-[400px] flex flex-col animate-in zoom-in duration-300 overflow-hidden ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
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
             
             <div className={`flex-1 p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar ${theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-50'}`}>
                {botMessages.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                      <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? (theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-white border text-zinc-800') + ' rounded-tl-none shadow-sm' : 'bg-black text-[#39FF14] rounded-tr-none shadow-md'}`}>
                         {msg.text}
                      </div>
                      {msg.options && (
                         <div className="flex flex-wrap gap-2 mt-2 w-full">
                            {msg.options.map((opt: string, idx: number) => (
                               <button key={idx} onClick={() => processBotReply(opt)} className={`border text-xs font-bold px-4 py-2 rounded-xl hover:bg-black hover:text-[#39FF14] transition-colors ${theme === 'dark' ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-white border-zinc-200 text-black'}`}>{opt}</button>
                            ))}
                         </div>
                      )}
                   </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             <div className={`p-3 border-t flex gap-2 ${theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'}`}>
                <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && processBotReply(userReply)} placeholder="Poser une question..." className={`flex-1 rounded-xl px-4 outline-none text-sm font-bold focus:ring-1 focus:ring-[#39FF14] ${theme === 'dark' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-black'}`} />
                <button onClick={() => processBotReply(userReply)} className="bg-[#39FF14] p-3 rounded-xl text-black hover:scale-105 transition"><Send size={18}/></button>
             </div>
          </div>
        )}
        
        {!isBotOpen && !isBotDismissed && (
           <div className="relative group animate-bounce flex items-center justify-center">
             <button 
               onClick={(e) => { e.stopPropagation(); setIsBotDismissed(true); }} 
               className="absolute -top-1 -right-1 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-black p-1 rounded-full z-10 transition-colors shadow-sm"
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
      <div className={`fixed bottom-0 left-0 right-0 border-t p-4 z-40 shadow-[0_-20px_40px_rgba(0,0,0,0.3)] animate-in slide-in-from-bottom-full ${theme === 'dark' ? 'bg-zinc-950 border-zinc-800' : 'bg-white border-zinc-200'}`}>
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className={`font-black text-sm md:text-base ${theme === 'dark' ? 'text-white' : 'text-black'}`}>1er MOIS <span className="text-[#FACC15] text-lg font-black">OFFERT</span></p>
                <p className={`text-[10px] md:text-xs font-bold ${textMuted} uppercase tracking-widest hidden sm:block`}>Sans carte bancaire. Annulez quand vous voulez.</p>
             </div>
             <button onClick={handleWaClick} className="bg-[#FACC15] text-black px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                Tester Gratuitement
             </button>
          </div>
      </div>
    </main>
  );
}
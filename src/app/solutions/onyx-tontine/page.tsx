"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Wallet, ShieldCheck, Users, MessageSquare, Sparkles, 
  ArrowRight, ChevronLeft, AlertTriangle, CheckCircle, Zap, ChevronDown,
  Send, X, ArrowUp
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function OnyxTontineLanding() {
  const waNumber = "221785338417";
  
  const [refId, setRefId] = useState<string | null>(null);

  // Navigation & UI
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Configuration Bot Fanta
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isBotDismissed, setIsBotDismissed] = useState(false);
  const [userReply, setUserReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botMessages, setBotMessages] = useState<any[]>([
    { sender: 'bot', text: "👋 Nanga def ! Je suis Fanta. Avez-vous des questions sur Onyx Tontine, notre outil de gestion financière transparente ?", options: ["Oui", "Non"] }
  ]);

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
            botResponse = "Très bien ! N'hésitez pas à cliquer sur 'Démarrer l'essai' en bas de la page.";
        } else if (lowerReply === "oui, parler à un conseiller" || lowerReply.includes("conseiller") || lowerReply.includes("humain") || lowerReply.includes("whatsapp")) {
            botResponse = "Je vous redirige vers notre expert sur WhatsApp ! À tout de suite 🚀";
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent("Bonjour l'équipe Onyx ! Je suis sur la page Onyx Tontine et j'aimerais parler à un conseiller.")}`, '_blank'); }, 1000);
        } else if (lowerReply.includes("prix") || lowerReply.includes("coût") || lowerReply.includes("tarif") || lowerReply.includes("combien")) {
            botResponse = "Onyx Tontine coûte seulement 6 900 F/mois. C'est le prix de la tranquillité d'esprit pour gérer les cotisations !";
        } else if (lowerReply.includes("relance") || lowerReply.includes("retard") || lowerReply.includes("whatsapp") || lowerReply.includes("comment")) {
            botResponse = "L'application envoie automatiquement des rappels de paiement sur WhatsApp aux membres en retard. Vous n'avez plus à faire la police !";
        } else if (lowerReply.includes("sécurité") || lowerReply.includes("argent") || lowerReply.includes("vol") || lowerReply.includes("perte")) {
            botResponse = "Toutes les transactions sont tracées. Le tableau de bord est transparent et chaque membre reçoit un reçu digital certifié sur WhatsApp.";
        } else {
            botResponse = "C'est noté ! Voulez-vous que je vous mette en relation avec un conseiller humain sur WhatsApp pour en discuter ?";
            botOptions = ["Oui, parler à un conseiller", "Non merci"];
        }

        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);

        try {
            await supabase.from('leads').insert([{ full_name: 'Visiteur Tontine', intent: 'Question Bot Tontine', source: 'Bot Fanta FAQ', message: reply, status: 'Nouveau', ambassador_id: refId || undefined }]);
        } catch (err) {}
    }, 1000);
  };

  const handleWaClick = (pack: string) => {
    const msg = `Bonjour l'équipe Onyx ! Je suis intéressé(e) par la solution ${pack} pour gérer ma Tontine.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-[#FACC15]/30 pb-24 font-sans">
      {/* NAVBAR */}
      <nav className="p-6 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => window.location.href = '/'} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-white hover:scale-105 transition-transform`}>
            ONYX<span className="text-[#FACC15] drop-shadow-sm">TONTINE</span>
         </button>
         
         <div className="flex items-center gap-4">
             <div className="relative" ref={dropdownRef}>
                 <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white flex items-center gap-1 transition-colors">
                    Autres Solutions <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <button onClick={() => window.location.href = '/'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#FACC15] rounded-xl transition">🏠 Accueil Onyx</button>
                    <button onClick={() => window.location.href = '/jaay'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#FACC15] rounded-xl transition">🛍️ Onyx Jaay</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-tiak'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#FACC15] rounded-xl transition">🚚 Onyx Tiak</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-menu'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#FACC15] rounded-xl transition">🍽️ Onyx Menu</button>
                 </div>
             </div>
             <button onClick={() => window.location.href = '/'} className="bg-zinc-900 text-white border border-zinc-800 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1">
             <ChevronLeft size={14}/> Accueil
         </button>
         </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-24 px-6 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 border border-[#FACC15]/30 text-[#FACC15] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
             <ShieldCheck size={14} /> Finance & Transparence
         </div>
         <h1 className={`${spaceGrotesk.className} text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.95] mb-8`}>
            FINI LES CAHIERS PERDUS. <br/> GÉREZ VOTRE TONTINE EN <span className="text-[#FACC15] underline decoration-[#FACC15]/30 underline-offset-8">TOUTE TRANSPARENCE.</span>
         </h1>
         <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            Importez vos membres, laissez WhatsApp réclamer les cotisations à votre place, et animez vos tirages au sort. <strong className="text-white">La confiance retrouvée pour votre association ou groupe d'amis.</strong>
         </p>
         
         <button onClick={() => handleWaClick("Onyx Tontine (Essai Gratuit)")} className="bg-[#FACC15] text-black px-8 md:px-12 py-5 md:py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(250,204,21,0.3)] flex items-center justify-center gap-3 mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <Wallet size={24} className="relative z-10" /> <span className="relative z-10">Créer ma Tontine (Essai Gratuit)</span>
         </button>

         {/* HERO IMAGE PLACEHOLDER */}
         <div className="mt-20 relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-[#FACC15] opacity-[0.05] blur-[100px] rounded-full"></div>
            <div className="w-full aspect-video bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl relative z-10 flex items-center justify-center overflow-hidden group">
               <div className="text-center p-8">
                 <Wallet size={64} className="mx-auto text-[#FACC15] mb-6 opacity-80 group-hover:scale-110 transition-transform duration-500" />
                 <p className="font-bold text-zinc-500 uppercase tracking-widest">Interface Tontine Sécurisée</p>
               </div>
            </div>
         </div>
      </section>

      {/* 2. PROBLÈME VS SOLUTION */}
      <section className="py-24 px-6 border-t border-zinc-900 bg-black">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="bg-red-950/20 border border-red-900/50 p-8 md:p-12 rounded-[3rem] relative flex flex-col justify-center">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full"></div>
               <span className="bg-red-900/30 text-red-500 font-black uppercase text-[10px] px-4 py-2 rounded-full mb-8 inline-flex items-center gap-2 tracking-widest w-max border border-red-500/20">
                   <AlertTriangle size={14} /> Le Cauchemar du Trésorier
               </span>
               <ul className="space-y-6">
                  <li className="flex gap-4 items-start font-bold text-zinc-400"><span className="text-red-500 text-xl font-black leading-none">×</span> Relancer manuellement chaque membre pour les cotisations en retard.</li>
                  <li className="flex gap-4 items-start font-bold text-zinc-400"><span className="text-red-500 text-xl font-black leading-none">×</span> Tenir les comptes sur un cahier qui finit toujours par se perdre.</li>
                  <li className="flex gap-4 items-start font-bold text-zinc-400"><span className="text-red-500 text-xl font-black leading-none">×</span> Les disputes et suspicions lors des tirages au sort ("C'est truqué !").</li>
               </ul>
            </div>

            <div className="bg-zinc-900 border-2 border-[#FACC15] p-8 md:p-12 rounded-[3rem] relative shadow-[0_0_50px_rgba(250,204,21,0.1)] flex flex-col justify-center transform md:scale-105 z-10">
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#FACC15]/10 blur-3xl rounded-full"></div>
               <span className="bg-[#FACC15] text-black font-black uppercase text-[10px] px-4 py-2 rounded-full mb-8 inline-flex items-center gap-2 tracking-widest w-max shadow-lg">
                   <CheckCircle size={14} /> La Sérénité Onyx
               </span>
               <ul className="space-y-6">
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#FACC15] mt-0.5" size={20}/> Relances WhatsApp automatiques et polies.</li>
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#FACC15] mt-0.5" size={20}/> Tableau de bord digital clair avec historiques ineffaçables.</li>
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#FACC15] mt-0.5" size={20}/> Tirage au sort digital, public et 100% transparent.</li>
               </ul>
           </div>
        </div>
      </section>

      {/* 3. BÉNÉFICES */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
         <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4`}>Un outil <span className="text-[#FACC15]">sécurisé et social.</span></h2>
         </div>
         <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#FACC15]/50 transition-colors">
               <Users size={40} className="text-[#FACC15] mb-6"/>
               <h3 className="text-xl font-black uppercase mb-3">Zéro Mot de Passe</h3>
               <p className="text-zinc-400 font-medium text-sm leading-relaxed">Importez vos membres en 1 clic. Ils n'ont pas besoin d'installer d'application ni de retenir un mot de passe, tout passe par leur numéro WhatsApp.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#39FF14]/50 transition-colors">
               <MessageSquare size={40} className="text-[#39FF14] mb-6"/>
               <h3 className="text-xl font-black uppercase mb-3">Relances WhatsApp</h3>
               <p className="text-zinc-400 font-medium text-sm leading-relaxed">L'application se charge du mauvais rôle. Elle envoie des notifications automatiques amicales aux retardataires pour réclamer les cotisations.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#00E5FF]/50 transition-colors">
               <Sparkles size={40} className="text-[#00E5FF] mb-6"/>
               <h3 className="text-xl font-black uppercase mb-3">Tirage au Sort Animé</h3>
               <p className="text-zinc-400 font-medium text-sm leading-relaxed">Ramenez de l'excitation ! L'algorithme sélectionne le gagnant du mois de manière transparente, partageable avec tous les membres.</p>
           </div>
        </div>
      </section>

      {/* 4. TARIFICATION */}
      <section id="tarifs" className="py-24 px-6 bg-black relative">
         <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-4`}>Commencez à structurer <span className="text-[#FACC15]">vos finances.</span></h2>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-12 rounded-[3rem] flex flex-col md:flex-row items-center gap-12 hover:border-[#FACC15]/30 transition-colors shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-[#FACC15]/5 blur-3xl rounded-full"></div>
               
               <div className="flex-1 text-left relative z-10">
                  <p className="text-[10px] font-black tracking-widest text-[#FACC15] uppercase mb-4 bg-[#FACC15]/10 px-3 py-1 rounded-full w-max border border-[#FACC15]/20">Abonnement Unique</p>
                  <h3 className={`${spaceGrotesk.className} text-4xl font-black uppercase mb-4 text-white`}>Onyx Tontine</h3>
                  <p className="text-zinc-400 font-medium mb-6">Toutes les fonctionnalités débloquées. Créez des tontines illimitées avec autant de membres que vous le souhaitez.</p>
                  <ul className="space-y-4 mb-8 text-zinc-300 text-sm font-bold">
                     <li className="flex gap-3"><CheckCircle size={18} className="text-[#FACC15]"/> Tontines et Membres Illimités</li>
                     <li className="flex gap-3"><CheckCircle size={18} className="text-[#FACC15]"/> Relances WhatsApp Automatiques</li>
                     <li className="flex gap-3"><CheckCircle size={18} className="text-[#FACC15]"/> Tableau de bord Trésorier</li>
                  </ul>
               </div>
               
               <div className="bg-black border border-zinc-800 p-8 rounded-[2rem] w-full md:w-auto text-center relative z-10 shadow-xl">
                  <div className="text-5xl font-black mb-2 italic text-white">6 900 F</div>
                  <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-8">Par Mois</div>
                  <button onClick={() => handleWaClick("Onyx Tontine à 6900 F")} className="w-full bg-[#FACC15] text-black py-4 px-8 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(250,204,21,0.2)]">
                     Démarrer l'essai
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* BOUTON REMONTER EN HAUT */}
      {showScrollTop && (
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="fixed bottom-24 left-6 z-[90] bg-zinc-900 text-white p-3 md:p-4 rounded-full shadow-2xl border border-zinc-800 hover:scale-110 hover:border-[#FACC15] transition-all animate-in fade-in slide-in-from-bottom-4"
         >
           <ArrowUp size={24} />
         </button>
      )}

      {/* BOT FANTA FAQ ONYX TONTINE */}
      <div className="fixed bottom-24 right-6 z-[90] flex flex-col items-end">
        {isBotOpen && (
          <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-[#39FF14] p-0 mb-4 w-[340px] h-[400px] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
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
                <button onClick={() => processBotReply(userReply)} className="bg-[#39FF14] p-3 rounded-xl text-black hover:scale-105 transition"><Send size={18}/></button>
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
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 z-40 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-full">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className="font-black text-sm md:text-base text-white">6 900 F<span className="text-zinc-500 text-xs font-bold">/mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">Onyx Tontine. <span className="text-black bg-[#FACC15] px-1.5 py-0.5 rounded shadow-sm">1er MOIS GRATUIT</span></p>
             </div>
             <button onClick={() => handleWaClick("Onyx Tontine (6900F)")} className="bg-[#FACC15] text-black px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(250,204,21,0.3)]">
                Démarrer l'essai
             </button>
          </div>
      </div>
    </main>
  );
}
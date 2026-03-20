"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  TrendingUp, Crosshair, PenTool, BarChart, 
  ArrowRight, ChevronLeft, AlertTriangle, CheckCircle, Zap,
  Send, X, ChevronDown, MonitorPlay, Target
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function OnyxFormationLanding() {
  const waNumber = "221785338417";
  
  // Navigation & UI
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Configuration Bot Fanta
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [userReply, setUserReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botMessages, setBotMessages] = useState<any[]>([
    { sender: 'bot', text: "👋 Nanga def ! Je suis Fanta. Vous voulez arrêter de perdre de l'argent dans des boosts inutiles ?", options: ["Oui, aide-moi !", "Non ça va"] }
  ]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
        const lowerReply = reply.toLowerCase();
        let botResponse = "";
        let botOptions: string[] | undefined = undefined;

        if (lowerReply.includes("oui")) {
            botResponse = "Super ! Vous pouvez me poser vos questions sur le contenu (Canva, Facebook Ads, TikTok Ads) ou sur le prix.";
        } else if (lowerReply.includes("non")) {
            botResponse = "Pas de souci ! N'hésitez pas à jeter un œil au programme ci-dessous.";
        } else if (lowerReply === "oui, parler à un conseiller" || lowerReply.includes("conseiller") || lowerReply.includes("humain") || lowerReply.includes("whatsapp")) {
            botResponse = "Je vous redirige vers notre expert sur WhatsApp ! À tout de suite 🚀";
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent("Bonjour l'équipe Onyx ! Je m'intéresse à Onyx Formation.")}`, '_blank'); }, 1000);
        } else if (lowerReply.includes("prix") || lowerReply.includes("coût") || lowerReply.includes("tarif")) {
            botResponse = "La formation seule est à 29 900 F (Paiement Unique). Mais l'offre la plus intelligente, c'est OnyxTekki Pro à 27 900 F/mois : vous avez la formation ET tous nos logiciels de vente inclus !";
        } else if (lowerReply.includes("contenu") || lowerReply.includes("programme") || lowerReply.includes("apprendre") || lowerReply.includes("canva") || lowerReply.includes("facebook")) {
            botResponse = "Vous allez apprendre à créer des visuels pros sur Canva, rédiger des textes qui vendent, et lancer des campagnes publicitaires Facebook & TikTok ultra-rentables.";
        } else {
            botResponse = "C'est noté ! Voulez-vous que je vous mette en relation avec un expert marketing sur WhatsApp pour en discuter ?";
            botOptions = ["Oui, parler à un conseiller", "Non merci"];
        }

        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);

        try {
            await supabase.from('leads').insert([{ full_name: 'Visiteur Formation', intent: 'Question Bot Formation', source: 'Bot Fanta FAQ', message: reply, status: 'Nouveau' }]);
        } catch (err) {}
    }, 1000);
  };

  const handleWaClick = (pack: string) => {
    const msg = `Bonjour l'équipe Onyx ! Je veux exploser mes ventes en ligne grâce à ${pack}.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-[#D946EF]/30 pb-24 font-sans">
      {/* NAVBAR */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto relative z-50">
         <button onClick={() => window.location.href = '/'} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-white hover:scale-105 transition-transform`}>
            ONYX<span className="text-[#D946EF] drop-shadow-sm">FORMATION</span>
         </button>
         
         <div className="flex items-center gap-4">
             <div className="relative" ref={dropdownRef}>
                 <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white flex items-center gap-1 transition-colors">
                    Autres Solutions <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <button onClick={() => window.location.href = '/'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#D946EF] rounded-xl transition">🏠 Accueil Onyx</button>
                    <button onClick={() => window.location.href = '/jaay'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#D946EF] rounded-xl transition">🛍️ Onyx Jaay</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-menu'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#D946EF] rounded-xl transition">🍽️ Onyx Menu</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-tiak'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#D946EF] rounded-xl transition">🚚 Onyx Tiak</button>
                 </div>
             </div>
             <button onClick={() => window.location.href = '/'} className="bg-zinc-900 text-white border border-zinc-800 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1">
                 <ChevronLeft size={14}/> Accueil
             </button>
         </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-24 px-6 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="inline-flex items-center gap-2 bg-[#D946EF]/10 border border-[#D946EF]/30 text-[#D946EF] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(217,70,239,0.2)]">
             <Target size={14} /> Marketing de Domination
         </div>
         <h1 className={`${spaceGrotesk.className} text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.95] mb-8`}>
            ARRÊTEZ DE PAYER DES BOOSTS QUI NE <span className="text-[#D946EF] underline decoration-[#D946EF]/30 underline-offset-8">RAPPORTENT RIEN.</span>
         </h1>
         <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            Maîtrisez la publicité Facebook/TikTok, créez des visuels professionnels sur Canva et rédigez des textes qui vendent. <strong className="text-white">Le marketing digital pensé pour le marché africain.</strong>
         </p>
         
         <button onClick={() => handleWaClick("Onyx Formation")} className="bg-[#D946EF] text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(217,70,239,0.3)] flex items-center justify-center gap-3 mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <MonitorPlay size={24} className="relative z-10" /> <span className="relative z-10">Rejoindre la Formation</span>
         </button>
      </section>

      {/* 2. PROBLÈME VS SOLUTION */}
      <section className="py-24 px-6 border-t border-zinc-900 bg-black">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            <div className="bg-red-950/20 border border-red-900/50 p-8 md:p-12 rounded-[3rem] relative flex flex-col justify-center">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full"></div>
               <span className="bg-red-900/30 text-red-500 font-black uppercase text-[10px] px-4 py-2 rounded-full mb-8 inline-flex items-center gap-2 tracking-widest w-max border border-red-500/20">
                   <AlertTriangle size={14} /> Le Bricolage (Avant)
               </span>
               <ul className="space-y-6">
                  <li className="flex gap-4 items-start font-bold text-zinc-400"><span className="text-red-500 text-xl font-black leading-none">×</span> Vous cliquez sur "Booster la publication" et perdez de l'argent.</li>
                  <li className="flex gap-4 items-start font-bold text-zinc-400"><span className="text-red-500 text-xl font-black leading-none">×</span> Vos visuels ressemblent à ceux de tous vos concurrents.</li>
                  <li className="flex gap-4 items-start font-bold text-zinc-400"><span className="text-red-500 text-xl font-black leading-none">×</span> Beaucoup de "C'est combien ?" mais très peu de ventes.</li>
               </ul>
            </div>

            <div className="bg-zinc-900 border-2 border-[#D946EF] p-8 md:p-12 rounded-[3rem] relative shadow-[0_0_50px_rgba(217,70,239,0.1)] flex flex-col justify-center transform md:scale-105 z-10">
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#D946EF]/10 blur-3xl rounded-full"></div>
               <span className="bg-[#D946EF] text-white font-black uppercase text-[10px] px-4 py-2 rounded-full mb-8 inline-flex items-center gap-2 tracking-widest w-max shadow-lg">
                   <CheckCircle size={14} /> La Méthode Onyx
               </span>
               <ul className="space-y-6">
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#D946EF] mt-0.5" size={20}/> Ciblage laser : touchez uniquement les clients prêts à payer.</li>
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#D946EF] mt-0.5" size={20}/> Design Premium : donnez une image haut de gamme à vos produits.</li>
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#D946EF] mt-0.5" size={20}/> Copywriting agressif : des textes qui convertissent immédiatement.</li>
               </ul>
            </div>
         </div>
      </section>

      {/* 3. LE PROGRAMME */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
         <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4`}>Devenez un <span className="text-[#D946EF]">Sniper</span> des ventes.</h2>
         </div>
         <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#D946EF]/50 transition-colors">
               <Target size={40} className="text-[#D946EF] mb-6"/>
               <h3 className="text-xl font-black uppercase mb-3">Facebook & TikTok Ads</h3>
               <p className="text-zinc-400 font-medium text-sm leading-relaxed">Arrêtez le bouton "Booster". Maîtrisez le Business Manager pour diviser vos coûts publicitaires par 3.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#D946EF]/50 transition-colors">
               <PenTool size={40} className="text-[#D946EF] mb-6"/>
               <h3 className="text-xl font-black uppercase mb-3">Maîtrise de Canva</h3>
               <p className="text-zinc-400 font-medium text-sm leading-relaxed">Apprenez à créer des flyers et vidéos qui captent l'attention en moins de 3 secondes, sans être designer.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#D946EF]/50 transition-colors">
               <TrendingUp size={40} className="text-[#D946EF] mb-6"/>
               <h3 className="text-xl font-black uppercase mb-3">Copywriting</h3>
               <p className="text-zinc-400 font-medium text-sm leading-relaxed">Les formules exactes pour rédiger vos annonces et transformer un "Je regarde" en "Je commande".</p>
            </div>
         </div>
      </section>

      {/* 4. TARIFICATION BUNDLE */}
      <section id="tarifs" className="py-24 px-6 bg-black relative">
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-4`}>Un investissement, <span className="text-[#D946EF]">pas une dépense.</span></h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
               {/* CARTE LEURRE (Solo) */}
               <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-[3rem] flex flex-col">
                  <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-2">Théorie pure</p>
                  <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6`}>Onyx Formation</h3>
                  <div className="text-4xl font-black mb-6 italic">29 900 F <span className="text-sm text-zinc-500 not-italic font-normal">(Unique)</span></div>
                  <ul className="space-y-4 mb-10 text-zinc-400 text-sm font-bold flex-1">
                     <li className="flex gap-2">✔ Accès à vie aux modules vidéo</li>
                     <li className="flex gap-2">✔ Stratégies de vente WhatsApp</li>
                     <li className="flex gap-2">✔ Uniquement la formation</li>
                  </ul>
                  <button onClick={() => handleWaClick("Onyx Formation Classique")} className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-zinc-700 transition">
                     Acheter la Formation
                  </button>
               </div>

               {/* CARTE BUNDLE (OnyxTekki Pro - Recommandée) */}
               <div className="bg-gradient-to-b from-[#D946EF]/20 to-black border-4 border-[#D946EF] p-8 md:p-10 rounded-[3rem] flex flex-col relative md:scale-110 shadow-[0_0_50px_rgba(217,70,239,0.2)] z-10">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black px-5 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase whitespace-nowrap animate-pulse shadow-xl flex items-center gap-2">
                     <Zap size={14}/> LE CHOIX DES LEADERS
                  </div>
                  <div className="flex items-center gap-2 mb-2 mt-4">
                     <p className="text-[10px] font-black tracking-[0.3em] text-[#D946EF] uppercase">Logiciels + Formation</p>
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6 text-white`}>OnyxTekki <span className="text-[#D946EF] text-xl">PRO</span></h3>
                  <div className="text-4xl font-black mb-6 italic text-white flex items-center">
                     27 900 F <span className="text-sm text-zinc-400 not-italic font-normal ml-2">/ mois</span>
                  </div>
                  <div className="bg-black/50 border border-[#D946EF]/30 p-4 rounded-2xl mb-8 text-xs text-[#D946EF] font-bold leading-relaxed">
                     Moins cher que la formation seule ! Vous obtenez la formation ET la suite complète d'outils Onyx pour appliquer vos stratégies immédiatement.
                  </div>
                  <ul className="space-y-4 mb-10 text-zinc-300 text-sm font-bold flex-1">
                     <li className="flex gap-2">✔ <strong className="text-white">Onyx Formation</strong> (Inclus)</li>
                     <li className="flex gap-2">✔ <strong className="text-white">Onyx Jaay</strong> (Vente WhatsApp)</li>
                     <li className="flex gap-2">✔ <strong className="text-white">Onyx Stock & Tiak</strong></li>
                     <li className="flex gap-2 text-[#D946EF]">✔ La machine ultime</li>
                  </ul>
                  <button onClick={() => handleWaClick("OnyxTekki Pro")} className="w-full bg-[#D946EF] text-white py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(217,70,239,0.3)] flex justify-center items-center gap-2 animate-pulse hover:animate-none">
                     LANCER ONYXTEKKI PRO <ArrowRight size={18}/>
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* BOT FANTA FAQ ONYX FORMATION */}
      <div className="fixed bottom-24 right-6 z-[90] flex flex-col items-end">
        {isBotOpen && (
          <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-[#D946EF] p-0 mb-4 w-[340px] h-[400px] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
             <div className="bg-black p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-[#D946EF] flex items-center justify-center text-xl">👩🏾‍💻</div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#D946EF] rounded-full border border-black animate-pulse"></div>
                   </div>
                   <div><p className="text-[#D946EF] font-black uppercase text-xs">Fanta - Conseillère</p></div>
                </div>
                <button onClick={() => setIsBotOpen(false)} className="text-zinc-400 hover:text-white transition"><X size={18}/></button>
             </div>
             
             <div className="flex-1 bg-zinc-50 p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar">
                {botMessages.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                      <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm' : 'bg-black text-[#D946EF] rounded-tr-none shadow-md'}`}>
                         {msg.text}
                      </div>
                      {msg.options && (
                         <div className="flex flex-wrap gap-2 mt-2 w-full">
                            {msg.options.map((opt: string, idx: number) => (
                               <button key={idx} onClick={() => processBotReply(opt)} className="bg-white border border-zinc-200 text-black text-xs font-bold px-4 py-2 rounded-xl hover:bg-black hover:text-[#D946EF] shadow-sm transition-colors">{opt}</button>
                            ))}
                         </div>
                      )}
                   </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             <div className="p-3 bg-white border-t border-zinc-200 flex gap-2">
                <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && processBotReply(userReply)} placeholder="Poser une question..." className="flex-1 bg-zinc-100 rounded-xl px-4 outline-none text-sm font-bold focus:ring-1 focus:ring-black" />
                <button onClick={() => processBotReply(userReply)} className="bg-[#D946EF] p-3 rounded-xl text-white hover:scale-105 transition"><Send size={18}/></button>
             </div>
          </div>
        )}
        
        {!isBotOpen && (
           <button onClick={() => setIsBotOpen(true)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#D946EF] hover:scale-110 transition-transform bg-black relative group animate-bounce flex items-center justify-center text-2xl">
             👩🏾‍💻
           </button>
        )}
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 z-40 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-full">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className="font-black text-sm md:text-base text-white">27 900 F<span className="text-zinc-500 text-xs font-bold">/mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">OnyxTekki PRO : La Totale</p>
             </div>
             <button onClick={() => handleWaClick("OnyxTekki Pro")} className="bg-[#D946EF] text-white px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(217,70,239,0.3)]">
                Démarrer l'essai Pro
             </button>
          </div>
      </div>
    </main>
  );
}
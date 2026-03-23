"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Truck, MapPin, ShieldCheck, AlertTriangle, CheckCircle, 
  Smartphone, TrendingUp, ArrowRight, ChevronLeft, PackageCheck, Zap, Crosshair, ChevronDown,
  Send, X, ArrowUp
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function OnyxTiakLanding() {
  const waNumber = "221785338417";
  
  // Navigation & UI
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Configuration Bot Fanta
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [userReply, setUserReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botMessages, setBotMessages] = useState<any[]>([
    { sender: 'bot', text: "👋 Nanga def ! Je suis Fanta. Avez-vous des questions sur Onyx Tiak, notre outil pour gérer vos livreurs ?", options: ["Oui", "Non"] }
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
        const lowerReply = reply.toLowerCase();
        let botResponse = "";
        let botOptions: string[] | undefined = undefined;

        if (lowerReply === "oui") {
            botResponse = "Je vous écoute ! Vous pouvez me poser vos questions sur le prix, le suivi GPS, ou la gestion de la caisse.";
        } else if (lowerReply === "non" || lowerReply === "non merci") {
            botResponse = "Très bien ! N'hésitez pas à cliquer sur 'Démarrer l'essai' en bas de la page pour commencer votre mois gratuit.";
        } else if (lowerReply === "oui, parler à un conseiller" || lowerReply.includes("conseiller") || lowerReply.includes("humain") || lowerReply.includes("whatsapp")) {
            botResponse = "Je vous redirige vers notre expert sur WhatsApp ! À tout de suite 🚀";
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent("Bonjour l'équipe Onyx ! Je suis sur la page Onyx Tiak et j'aimerais parler à un conseiller.")}`, '_blank'); }, 1000);
        } else if (lowerReply.includes("prix") || lowerReply.includes("coût") || lowerReply.includes("tarif") || lowerReply.includes("combien")) {
            botResponse = "Onyx Tiak coûte seulement 13 000 F/mois. Mais nous recommandons fortement le Pack Trio (Vente + Stock + Tiak) à 22 900 F pour tout sécuriser !";
        } else if (lowerReply.includes("livreur") || lowerReply.includes("suivi") || lowerReply.includes("gps") || lowerReply.includes("comment")) {
            botResponse = "Vous assignez les courses en 1 clic. Le livreur valide sur son WhatsApp, et vous suivez sa position et le statut de la course en temps réel.";
        } else if (lowerReply.includes("caisse") || lowerReply.includes("argent") || lowerReply.includes("vol") || lowerReply.includes("perte")) {
            botResponse = "Fini les écarts de caisse ! Le système calcule exactement ce que le livreur doit vous verser à la fin de la journée (Cash, Wave, OM).";
        } else {
            botResponse = "C'est noté ! Voulez-vous que je vous mette en relation avec un conseiller humain sur WhatsApp pour en discuter ?";
            botOptions = ["Oui, parler à un conseiller", "Non merci"];
        }

        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);

        try {
            await supabase.from('leads').insert([{ full_name: 'Visiteur Tiak', intent: 'Question Bot Tiak', source: 'Bot Fanta FAQ', message: reply, status: 'Nouveau' }]);
        } catch (err) {}
    }, 1000);
  };

  const handleWaClick = (pack: string) => {
    const msg = `Bonjour l'équipe Onyx ! Je suis intéressé(e) par la solution logistique ${pack} pour sécuriser mes livraisons.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white overflow-x-hidden selection:bg-[#39FF14]/30 pb-24">
      {/* NAVBAR */}
      <nav className="p-6 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => window.location.href = '/'} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-white hover:scale-105 transition-transform`}>
            ONYX<span className="text-[#39FF14] drop-shadow-sm">TIAK</span>
         </button>
         
         <div className="flex items-center gap-4">
             <div className="relative" ref={dropdownRef}>
                 <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white flex items-center gap-1 transition-colors">
                    Autres Solutions <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`absolute top-full right-0 mt-2 bg-zinc-900 border border-zinc-800 shadow-2xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <button onClick={() => window.location.href = '/'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#39FF14] rounded-xl transition">🏠 Accueil Onyx</button>
                    <button onClick={() => window.location.href = '/jaay'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#39FF14] rounded-xl transition">🛍️ Onyx Jaay</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-tontine'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#39FF14] rounded-xl transition">💰 Onyx Tontine</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-menu'} className="text-left px-4 py-2 text-xs font-bold text-zinc-400 hover:bg-black hover:text-[#39FF14] rounded-xl transition">🍽️ Onyx Menu</button>
                 </div>
             </div>
             <button onClick={() => window.location.href = '/'} className="bg-zinc-900 text-white border border-zinc-800 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1">
                 <ChevronLeft size={14}/> Accueil
             </button>
         </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-24 px-6 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="inline-flex items-center gap-2 bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(57,255,20,0.2)]">
             <Crosshair size={14} /> Logistique & Sécurité CFA
         </div>
         <h1 className={`${spaceGrotesk.className} text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.95] mb-8`}>
            VOS LIVREURS NE VOUS VOLERONT PLUS JAMAIS <span className="text-[#FACC15]">VOTRE TEMPS</span> NI <span className="text-[#39FF14] underline decoration-[#39FF14]/30 underline-offset-8">VOTRE ARGENT.</span>
         </h1>
         <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
            Suivez vos colis en temps réel, sécurisez vos encaissements et informez vos clients sur WhatsApp. <strong className="text-white">Le contrôle total de votre flotte logistique au Sénégal.</strong>
         </p>
         
         <button onClick={() => handleWaClick("Onyx Tiak (Essai Gratuit)")} className="bg-[#39FF14] text-black px-8 md:px-12 py-5 md:py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3 mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <ShieldCheck size={24} className="relative z-10" /> <span className="relative z-10">Sécuriser ma logistique (Essai Gratuit)</span>
         </button>

         {/* HERO IMAGE PLACEHOLDER */}
         <div className="mt-20 relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-[#39FF14] opacity-[0.05] blur-[100px] rounded-full"></div>
            <div className="w-full aspect-video bg-zinc-900 border border-zinc-800 rounded-[2rem] shadow-2xl relative z-10 flex items-center justify-center overflow-hidden group">
               <img src="https://i.ibb.co/Gv1ZR1BF/Sans-titre-1024-x-768-px-Pr-sentation.png" alt="Illustration Onyx Tiak" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
         </div>
      </section>

      {/* 2. PROBLÈME VS SOLUTION */}
      <section className="py-24 px-6 border-t border-zinc-900 bg-black">
         <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* La Réalité sans Tiak */}
            <div className="bg-red-950/20 border border-red-900/50 p-8 md:p-12 rounded-[3rem] relative flex flex-col justify-center">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-3xl rounded-full"></div>
               <span className="bg-red-900/30 text-red-500 font-black uppercase text-[10px] px-4 py-2 rounded-full mb-8 inline-flex items-center gap-2 tracking-widest w-max border border-red-500/20">
                   <AlertTriangle size={14} /> La Réalité Sans Tiak
               </span>
               <ul className="space-y-6">
                  <li className="flex gap-4 items-start font-bold text-zinc-400"><span className="text-red-500 text-xl font-black leading-none">×</span> Livreur injoignable, client qui annule car "c'est trop long".</li>
                  <li className="flex gap-4 items-start font-bold text-zinc-400"><span className="text-red-500 text-xl font-black leading-none">×</span> Encaissements qui ne correspondent jamais en fin de journée.</li>
                  <li className="flex gap-4 items-start font-bold text-zinc-400"><span className="text-red-500 text-xl font-black leading-none">×</span> Disputes constantes "Le client dit qu'il a payé, le livreur dit que non".</li>
               </ul>
            </div>

            {/* La Maîtrise Onyx Tiak */}
            <div className="bg-zinc-900 border-2 border-[#39FF14] p-8 md:p-12 rounded-[3rem] relative shadow-[0_0_50px_rgba(57,255,20,0.1)] flex flex-col justify-center transform md:scale-105 z-10">
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#39FF14]/10 blur-3xl rounded-full"></div>
               <span className="bg-[#39FF14] text-black font-black uppercase text-[10px] px-4 py-2 rounded-full mb-8 inline-flex items-center gap-2 tracking-widest w-max shadow-lg">
                   <CheckCircle size={14} /> La Maîtrise Onyx Tiak
               </span>
               <ul className="space-y-6">
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#39FF14] mt-0.5" size={20}/> Tracking GPS & Assignation intelligente.</li>
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#39FF14] mt-0.5" size={20}/> Notification WhatsApp auto au client : "Votre livreur arrive".</li>
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#39FF14] mt-0.5" size={20}/> Réconciliation de caisse en 1 clic (Wave, OM, Cash).</li>
               </ul>
            </div>
         </div>
      </section>

      {/* 3. BÉNÉFICES (ORIENTÉ CFA) */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
         <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4`}>Arrêtez l'hémorragie <span className="text-[#FACC15]">financière</span>.</h2>
         </div>
         <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#39FF14]/50 transition-colors">
               <PackageCheck size={40} className="text-[#39FF14] mb-6"/>
               <h3 className="text-xl font-black uppercase mb-3">Zéro Colis Perdu</h3>
               <p className="text-zinc-400 font-medium text-sm leading-relaxed">Traçabilité totale de l'entrepôt jusqu'aux mains du client. Chaque étape est horodatée.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#FACC15]/50 transition-colors">
               <ShieldCheck size={40} className="text-[#FACC15] mb-6"/>
               <h3 className="text-xl font-black uppercase mb-3">Encaissements Sécurisés</h3>
               <p className="text-zinc-400 font-medium text-sm leading-relaxed">Fini les "j'ai perdu la monnaie" ou les écarts de caisse. Le système calcule exactement ce que le livreur doit vous verser.</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] hover:border-[#39FF14]/50 transition-colors">
               <TrendingUp size={40} className="text-[#39FF14] mb-6"/>
               <h3 className="text-xl font-black uppercase mb-3">Clients Fidélisés</h3>
               <p className="text-zinc-400 font-medium text-sm leading-relaxed">Un service pro, une communication claire sur WhatsApp, des clients rassurés qui recommandent chez vous.</p>
            </div>
         </div>
      </section>

      {/* 4. TARIFICATION */}
      <section id="tarifs" className="py-24 px-6 bg-black relative">
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-4`}>Prenez le contrôle <span className="text-[#39FF14]">dès aujourd'hui.</span></h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
               {/* CARTE LEURRE (Solo) */}
               <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-[3rem] flex flex-col">
                  <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-2">L'essentiel</p>
                  <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6`}>Onyx Tiak</h3>
                  <div className="text-4xl font-black mb-6 italic">13 000 F <span className="text-sm text-zinc-500 not-italic font-normal">/ mois</span></div>
                  <ul className="space-y-4 mb-10 text-zinc-400 text-sm font-bold flex-1">
                     <li className="flex gap-2">✔ Suivi GPS des livreurs</li>
                     <li className="flex gap-2">✔ Alertes WhatsApp clients</li>
                     <li className="flex gap-2">✔ Bilan de caisse journalier</li>
                  </ul>
                  <button onClick={() => handleWaClick("Onyx Tiak Solo")} className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-zinc-700 transition">
                     Démarrer Tiak
                  </button>
               </div>

               {/* CARTE BUNDLE (OnyxTekki - Recommandée) */}
               <div className="bg-gradient-to-b from-[#39FF14]/20 to-black border-4 border-[#39FF14] p-8 md:p-10 rounded-[3rem] flex flex-col relative md:scale-110 shadow-[0_0_50px_rgba(57,255,20,0.2)] z-10">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-600 border-2 border-red-400 text-white px-5 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase whitespace-nowrap animate-pulse shadow-lg flex items-center gap-2">
                     <Zap size={14}/> PREMIER MOIS OFFERT !
                  </div>
                  <div className="flex items-center gap-2 mb-2 mt-4">
                     <p className="text-[10px] font-black tracking-[0.3em] text-[#39FF14] uppercase">Le Choix Évident</p>
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6 text-white`}>OnyxTekki <span className="text-[#39FF14] text-xl">(Trio)</span></h3>
                  <div className="text-4xl font-black mb-6 italic text-white flex items-center">
                     22 900 F <span className="text-sm text-zinc-400 not-italic font-normal ml-2">/ mois</span>
                  </div>
                  <div className="bg-black/50 border border-[#39FF14]/30 p-4 rounded-2xl mb-8 text-xs text-[#39FF14] font-bold leading-relaxed">
                     Pourquoi payer 13 000 F juste pour la logistique, quand 22 900 F sécurisent TOUT votre business ?
                  </div>
                  <ul className="space-y-4 mb-10 text-zinc-300 text-sm font-bold flex-1">
                     <li className="flex gap-2">✔ <strong className="text-white">Onyx Tiak</strong> (Logistique)</li>
                     <li className="flex gap-2">✔ <strong className="text-white">Onyx Jaay</strong> (Vente WhatsApp)</li>
                     <li className="flex gap-2">✔ <strong className="text-white">Onyx Stock</strong> (Inventaire Auto)</li>
                     <li className="flex gap-2">✔ Zéro rupture, zéro perte</li>
                  </ul>
                  <button onClick={() => handleWaClick("OnyxTekki Trio")} className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(57,255,20,0.3)] flex justify-center items-center gap-2 animate-pulse hover:animate-none">
                     LANCER MON COMMERCE <ArrowRight size={18}/>
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* BOUTON REMONTER EN HAUT */}
      {showScrollTop && (
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="fixed bottom-24 left-6 z-[90] bg-zinc-900 text-white p-3 md:p-4 rounded-full shadow-2xl border border-zinc-800 hover:scale-110 hover:border-[#39FF14] transition-all animate-in fade-in slide-in-from-bottom-4"
         >
           <ArrowUp size={24} />
         </button>
      )}

      {/* BOT FANTA FAQ ONYX TIAK */}
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
        
        {!isBotOpen && (
           <button onClick={() => setIsBotOpen(true)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#39FF14] hover:scale-110 transition-transform bg-black relative group animate-bounce flex items-center justify-center text-2xl">
             👩🏾‍💻
           </button>
        )}
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-800 p-4 z-40 shadow-[0_-20px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom-full">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className="font-black text-sm md:text-base text-white">22 900 F<span className="text-zinc-500 text-xs font-bold">/mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">Le Pack Trio Complet. <span className="text-black bg-[#39FF14] px-1.5 py-0.5 rounded shadow-sm">1er MOIS GRATUIT</span></p>
             </div>
             <button onClick={() => handleWaClick("OnyxTekki Trio")} className="bg-[#39FF14] text-black px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                Démarrer l'essai
             </button>
          </div>
      </div>
    </main>
  );
}
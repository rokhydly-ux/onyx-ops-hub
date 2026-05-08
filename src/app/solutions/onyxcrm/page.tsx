"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  LineChart, Columns, Bot, FileText, Database, 
  ArrowRight, ChevronLeft, CheckCircle, Zap, ChevronDown, Target,
  Send, X, ArrowUp, Activity, Crosshair, Users
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function OnyxCRMLanding() {
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
  const [botStep, setBotStep] = useState(0);
  const [botData, setBotData] = useState({ name: '', phone: '', city: '', business: '', question: '' });
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botMessages, setBotMessages] = useState<any[]>([
    { sender: 'bot', text: "👋 Bonjour ! Je suis Fanta, experte CRM. Prêt à structurer vos ventes B2B ? Que voulez-vous savoir ?", options: ["Comment ça marche ?", "C'est quoi les tarifs ?", "Je veux mon CRM 🚀"] }
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
        let botResponse = "";
        let botOptions: string[] | undefined = undefined;
        let nextStep = botStep;
        let currentData = { ...botData };

        if (botStep === 0) {
            const lowerReply = reply.toLowerCase();
            if (lowerReply.includes('marche') || lowerReply.includes('comment') || lowerReply.includes('odoo')) {
                botResponse = "Notre module d'import universel permet de connecter votre base de données existante (Odoo, Excel) sans friction. Vous suivez vos marges et générez des devis en un clic. Prêt à tester ?";
                botOptions = ["Je veux mon CRM 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('tarifs') || lowerReply.includes('prix') || lowerReply.includes('combien')) {
                botResponse = "OnyxCRM est à 39 900 F / mois, mais pour vous prouver sa valeur, le 1er mois est à 2.900 F (-92%) ! On se lance ?";
                botOptions = ["Je veux mon CRM 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('crm') || lowerReply.includes('lance') || lowerReply.includes('oui')) {
                botResponse = "Génial ! 🚀 Pour configurer votre espace B2B, quel est votre prénom et nom ?";
                nextStep = 1;
            } else {
                botResponse = "Je vois ! Pour vous aider au mieux, quel est votre prénom et nom ?";
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
            botResponse = "Super. Dans quelle ville se trouve votre entreprise ?";
            nextStep = 3;
        }
        else if (botStep === 3) {
            currentData.city = reply;
            botResponse = "Dernière question : quel est le nom de votre entreprise ou agence ?";
            nextStep = 4;
        }
        else if (botStep === 4) {
            currentData.business = reply;
            botResponse = "Parfait ! J'ai toutes les infos. Je vous redirige vers notre équipe d'experts sur WhatsApp pour activer votre CRM ! 🚀";
            nextStep = 5;
            
            try {
                await supabase.from('leads').insert([{
                    full_name: currentData.name, phone: currentData.phone, city: currentData.city,
                    message: `Entreprise: ${currentData.business} | Note: ${currentData.question || 'Veut son CRM'}`,
                    intent: 'Je veux mon CRM (Onyx CRM)', source: 'Bot Fanta (Onyx CRM)', status: 'Nouveau', saas: 'Onyx CRM', ambassador_id: refId || undefined
                }]);
            } catch (err) {}

            const waMsg = `🚀 *Création Onyx CRM*\n\nJe veux structurer mes ventes !\n\n*Nom:* ${currentData.name}\n*Entreprise:* ${currentData.business}\n*Ville:* ${currentData.city}\n\nComment on procède pour l'activation ?`;
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`, "_blank"); }, 1500);
        }

        setBotData(currentData);
        setBotStep(nextStep);
        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);
    }, 1000);
  };

  const handleWaClick = (pack: string) => {
    const msg = `Bonjour l'équipe Onyx ! Je suis intéressé(e) par ${pack} pour structurer mes ventes B2B.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-900 overflow-x-hidden selection:bg-[#00E5FF]/30 pb-24 font-sans">
      {/* NAVBAR */}
      <nav className="p-6 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => window.location.href = '/'} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-zinc-900 hover:scale-105 transition-transform`}>
            ONYX<span className="text-[#00E5FF] drop-shadow-sm">CRM</span>
         </button>
         
         <div className="flex items-center gap-4">
             <div className="relative" ref={dropdownRef}>
                 <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-zinc-900 flex items-center gap-1 transition-colors">
                    Écosystème Onyx <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`absolute top-full right-0 mt-2 bg-white border border-zinc-200 shadow-2xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <button onClick={() => window.location.href = '/'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[#00E5FF] rounded-xl transition">🏠 Accueil Onyx</button>
                    <button onClick={() => window.location.href = '/jaay'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[#00E5FF] rounded-xl transition">🛍️ Onyx Jaay</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-tontine'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[#00E5FF] rounded-xl transition">💰 Onyx Tontine</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-tiak'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[#00E5FF] rounded-xl transition">🚚 Onyx Tiak</button>
                 </div>
             </div>
             <button onClick={() => window.location.href = '/'} className="bg-white text-zinc-900 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-zinc-100 transition-colors flex items-center gap-1 shadow-sm">
                 <ChevronLeft size={14}/> Accueil
             </button>
         </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-20 pb-24 px-6 text-center max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#00E5FF] rounded-full blur-[150px] opacity-20 pointer-events-none"></div>
         
         <div className="inline-flex items-center gap-2 bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-[0_0_20px_rgba(0,229,255,0.2)] relative z-10">
             <Activity size={14} /> Le Cerveau Financier B2B
         </div>
         
         <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.95] mb-8 relative z-10 text-zinc-900`}>
            Trackez chaque lead. <br/>
            <span className="text-zinc-400">Sécurisez</span> <span className="text-[#00E5FF] underline decoration-[#00E5FF]/30 underline-offset-8">chaque marge.</span><br/>
            Depuis votre téléphone.
         </h1>
         
         <p className="text-zinc-600 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed relative z-10">
            Bien plus qu'un simple pipeline commercial. OnyxCRM est la seule machine de vente qui centralise vos leads WhatsApp, génère vos devis et sécurise vos marges nettes en temps réel.
         </p>
         
         <button onClick={() => handleWaClick("OnyxCRM (Essai Gratuit)")} className="bg-[#00E5FF] text-white px-10 md:px-14 py-5 md:py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:bg-black hover:text-[#00E5FF] hover:scale-105 transition-all shadow-[0_20px_40px_rgba(0,229,255,0.3)] flex items-center justify-center gap-3 mx-auto relative z-10">
            Déployer OnyxCRM <ArrowRight size={24} />
         </button>
      </section>

      {/* 2. LES 5 SUPER-POUVOIRS (BENTO GRID) */}
      <section className="py-24 px-6 border-t border-zinc-200 relative z-10 bg-white">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-zinc-900`}>
                  Vos Nouveaux <span className="text-[#00E5FF]">Super-Pouvoirs</span>.
               </h2>
               <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">Réactivité mobile & Contrôle total.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
               
               {/* CARTE 1 (Large - 2 colonnes sur grand écran) */}
               <div className="lg:col-span-2 bg-zinc-50 border border-zinc-200 p-6 md:p-12 rounded-[2rem] hover:border-[#00E5FF]/50 transition-all relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-[#00E5FF]/5 blur-3xl rounded-full group-hover:bg-[#00E5FF]/10 transition-colors"></div>
                  <div className="w-16 h-16 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-6 border border-[#00E5FF]/20 relative z-10">
                     <LineChart size={32} />
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase mb-4 text-zinc-900 relative z-10`}>Dashboard Financier Intégré</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed max-w-xl relative z-10 text-sm md:text-lg">
                     Fixez vos prix d'achat HT et vente TTC. Suivez votre CA réalisé, votre CA potentiel bloqué dans le pipeline, et visualisez votre <strong>marge nette</strong> sur un seul écran. Ne naviguez plus jamais à l'aveugle.
                  </p>
               </div>

               {/* CARTE 2 */}
               <div className="bg-zinc-50 border border-zinc-200 p-6 md:p-10 rounded-[2rem] hover:border-[#00E5FF]/50 transition-all relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 blur-3xl rounded-full"></div>
                  <div className="w-16 h-16 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-6 border border-[#00E5FF]/20 relative z-10">
                     <Columns size={32} />
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-xl md:text-2xl font-black uppercase mb-4 text-zinc-900 relative z-10`}>Le Pipeline Kanban Actif</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed relative z-10 text-sm md:text-base">
                     Glissez-déposez vos leads à travers vos étapes de vente. Plus fluide que les CRM classiques, plus visuel qu'Excel. Chaque mouvement met à jour vos probabilités de closing.
                  </p>
               </div>

               {/* CARTE 3 */}
               <div className="bg-zinc-50 border border-zinc-200 p-6 md:p-10 rounded-[2rem] hover:border-[#00E5FF]/50 transition-all relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 blur-3xl rounded-full"></div>
                  <div className="w-16 h-16 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-6 border border-[#00E5FF]/20 relative z-10">
                     <Bot size={32} />
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-xl md:text-2xl font-black uppercase mb-4 text-zinc-900 relative z-10`}>Fidélisation par l'IA</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed relative z-10 text-sm md:text-base">
                     Génération de messages WhatsApp hyper-ciblés. L'IA analyse le comportement d'achat de vos clients et suggère le texte parfait pour les relancer au bon moment.
                  </p>
               </div>

               {/* CARTE 4 */}
               <div className="bg-zinc-50 border border-zinc-200 p-6 md:p-10 rounded-[2rem] hover:border-[#00E5FF]/50 transition-all relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 blur-3xl rounded-full"></div>
                  <div className="w-16 h-16 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-6 border border-[#00E5FF]/20 relative z-10">
                     <FileText size={32} />
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-xl md:text-2xl font-black uppercase mb-4 text-zinc-900 relative z-10`}>Devis, Factures & Catalogues</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed relative z-10 text-sm md:text-base">
                     Ne faites plus patienter vos clients. Générez des devis PDF professionnels, des factures conformes, et des mini-catalogues ciblés en quelques secondes.
                  </p>
               </div>

               {/* CARTE 5 */}
               <div className="bg-zinc-50 border border-zinc-200 p-6 md:p-10 rounded-[2rem] hover:border-[#00E5FF]/50 transition-all relative overflow-hidden group shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF]/5 blur-3xl rounded-full"></div>
                  <div className="w-16 h-16 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-6 border border-[#00E5FF]/20 relative z-10">
                     <Database size={32} />
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-xl md:text-2xl font-black uppercase mb-4 text-zinc-900 relative z-10`}>L'Import Universel</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed relative z-10 text-sm md:text-base">
                     Connectez votre système Odoo existant ou importez vos vieilles bases de données Excel sans aucune friction. Ne perdez jamais votre historique de vente.
                  </p>
               </div>

            </div>
         </div>
      </section>

      {/* 3. TARIFICATION UNIQUE */}
      <section id="tarifs" className="py-24 px-6 relative z-10">
         <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-4 text-zinc-900`}>Un outil B2B. <span className="text-[#00E5FF]">Un prix unique.</span></h2>
               <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Pas de frais cachés par module.</p>
            </div>
            
            <div className="bg-gradient-to-br from-[#00E5FF]/10 to-white border-2 border-[#00E5FF]/50 p-8 md:p-14 rounded-[3rem] shadow-[0_0_80px_rgba(0,229,255,0.15)] flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00E5FF]/20 blur-[120px] rounded-full pointer-events-none"></div>
               
               <div className="flex-1 text-left relative z-10">
                  <span className="bg-[#00E5FF] text-white font-black uppercase text-[10px] px-4 py-2 rounded-full mb-6 inline-flex items-center gap-2 tracking-widest w-max shadow-lg">
                      <Target size={14} /> Recommandé B2B
                  </span>
                  <h3 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase mb-4 text-zinc-900 leading-tight`}>Onyx CRM</h3>
                  <p className="text-zinc-600 font-medium mb-8 text-lg">
                     Toute la puissance de la Data au bout des doigts pour dominer votre secteur. 
                  </p>
                  <ul className="space-y-4 mb-8 text-zinc-800 text-sm font-bold">
                     <li className="flex gap-3"><CheckCircle size={20} className="text-[#00E5FF] shrink-0"/> <span className="bg-[#00E5FF]/10 text-zinc-900 px-2 rounded border border-[#00E5FF]/30">Jusqu'à 3 utilisateurs inclus</span></li>
                     <li className="flex gap-3"><CheckCircle size={20} className="text-[#00E5FF] shrink-0"/> <span className="text-zinc-700">Pipeline Kanban & Gestion Marges</span></li>
                     <li className="flex gap-3"><CheckCircle size={20} className="text-[#00E5FF] shrink-0"/> <span className="text-zinc-700">Générateur Devis & Factures PDF</span></li>
                     <li className="flex gap-3"><CheckCircle size={20} className="text-[#00E5FF] shrink-0"/> <span className="text-zinc-700">Import Odoo & Excel en illimité</span></li>
                  </ul>
               </div>
               
               <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] w-full md:w-auto text-center relative z-10 shadow-2xl flex flex-col items-center justify-center min-w-[280px]">
                  <div className="text-5xl font-black mb-2 italic text-white flex flex-col items-center">
                     <div className="flex items-center gap-2">
                        <span className="line-through text-red-500 text-2xl mr-1">39 900 F</span>
                        <span className="text-[#00E5FF]">2 900 F</span>
                     </div>
                  </div>
                  <div className="text-sm text-zinc-500 font-bold uppercase tracking-widest mb-8">Le premier mois</div>
                  <button onClick={() => handleWaClick("OnyxCRM (Essai 2.900F)")} className="w-full bg-[#00E5FF] text-white py-5 px-8 rounded-xl font-black uppercase text-sm hover:bg-black hover:text-[#00E5FF] hover:scale-105 transition-all shadow-[0_10px_30px_rgba(0,229,255,0.4)]">
                     Je teste pour 2.900 F
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* BOUTON REMONTER EN HAUT */}
      {showScrollTop && (
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="fixed bottom-24 left-6 z-[90] bg-white text-zinc-900 p-3 md:p-4 rounded-full shadow-2xl border border-zinc-200 hover:scale-110 hover:border-[#00E5FF] transition-all animate-in fade-in slide-in-from-bottom-4"
         >
           <ArrowUp size={24} />
         </button>
      )}

      {/* BOT FANTA FAQ ONYXCRM */}
      <div className="fixed bottom-24 right-6 z-[90] flex flex-col items-end">
        {isBotOpen && (
          <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-[#00E5FF] p-0 mb-4 w-[340px] h-[400px] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
             <div className="bg-white p-4 flex justify-between items-center border-b border-zinc-200">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 border border-[#00E5FF] flex items-center justify-center text-xl">👩🏾‍💻</div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#00E5FF] rounded-full border border-black animate-pulse"></div>
                   </div>
                   <div><p className="text-[#00E5FF] font-black uppercase text-xs tracking-wider">Fanta - Expert CRM</p></div>
                </div>
                <button onClick={() => setIsBotOpen(false)} className="text-zinc-400 hover:text-black transition"><X size={18}/></button>
             </div>
             
             <div className="flex-1 bg-zinc-50 p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar">
                {botMessages.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                      <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm' : 'bg-[#00E5FF] text-white rounded-tr-none shadow-md'}`}>
                         {msg.text}
                      </div>
                      {msg.options && (
                         <div className="flex flex-wrap gap-2 mt-2 w-full">
                            {msg.options.map((opt: string, idx: number) => (
                               <button key={idx} onClick={() => processBotReply(opt)} className="bg-white border border-zinc-200 text-zinc-800 text-xs font-bold px-4 py-2 rounded-xl hover:bg-black hover:text-[#00E5FF] shadow-sm transition-colors">{opt}</button>
                            ))}
                         </div>
                      )}
                   </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             <div className="p-3 bg-white border-t border-zinc-200 flex gap-2">
                <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && processBotReply(userReply)} placeholder="Poser une question..." className="flex-1 bg-zinc-100 rounded-xl px-4 outline-none text-sm font-bold focus:ring-1 focus:ring-black" />
                <button onClick={() => processBotReply(userReply)} className="bg-[#00E5FF] p-3 rounded-xl text-white hover:scale-105 transition"><Send size={18}/></button>
             </div>
          </div>
        )}
        
        {!isBotOpen && !isBotDismissed && (
           <div className="relative group animate-bounce flex items-center justify-center">
             <button 
               onClick={(e) => { e.stopPropagation(); setIsBotDismissed(true); }} 
               className="absolute -top-1 -right-1 bg-white border border-zinc-200 text-zinc-400 hover:text-black hover:bg-zinc-100 p-1 rounded-full z-10 transition-colors shadow-sm"
               aria-label="Fermer l'assistant"
             >
               <X size={14} />
             </button>
             <button onClick={() => setIsBotOpen(true)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#00E5FF] hover:scale-110 transition-transform bg-white relative flex items-center justify-center text-2xl">
               👩🏾‍💻
             </button>
           </div>
        )}
      </div>

      {/* STICKY BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-40 shadow-[0_-20px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-full">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className="font-black text-sm md:text-base text-zinc-900"><span className="line-through text-red-500 text-xs mr-2">39 900F</span><span className="text-[#00E5FF]">2 900 F</span><span className="text-zinc-500 text-xs font-bold">/1er mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">OnyxCRM <span className="text-black bg-[#00E5FF] px-1.5 py-0.5 rounded shadow-sm">1ER MOIS À 2.900 F (-92%)</span></p>
             </div>
             <button onClick={() => handleWaClick("OnyxCRM (Essai 2.900F)")} className="bg-[#00E5FF] text-white px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,229,255,0.4)]">
                Je teste pour 2.900 F
             </button>
          </div>
      </div>
    </main>
  );
}
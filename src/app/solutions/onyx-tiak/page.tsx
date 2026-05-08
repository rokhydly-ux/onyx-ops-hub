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
    { sender: 'bot', text: "👋 Nanga def ! Je suis Fanta. Prêt à sécuriser vos livraisons ? Que voulez-vous savoir ?", options: ["Comment ça marche ?", "C'est quoi les tarifs ?", "Je veux gérer mes livreurs 🚀"] }
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
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('ref');
    if (ref) {
      setRefId(ref);
      localStorage.setItem('onyx_ambassador_ref', ref);
    } else {
      const storedRef = localStorage.getItem('onyx_ambassador_ref');
      if (storedRef) setRefId(storedRef);
    }

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
                botResponse = "Vous assignez les courses en 1 clic. Le livreur valide sur son WhatsApp, et vous suivez sa position en temps réel. Prêt à tester ?";
                botOptions = ["Je veux gérer mes livreurs 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('tarifs') || lowerReply.includes('prix') || lowerReply.includes('combien')) {
                botResponse = "Onyx Tiak seul coûte 13 900 F/mois. Mais le Pack Trio (Vente + Stock + Tiak) à 22 900 F est le plus recommandé ! On y va ?";
                botOptions = ["Je veux gérer mes livreurs 🚀", "J'ai une autre question"];
            } else if (lowerReply.includes('livreur') || lowerReply.includes('lance') || lowerReply.includes('oui') || lowerReply.includes('gérer')) {
                botResponse = "Génial ! 🚀 Pour configurer votre espace logistique, quel est votre prénom et nom ?";
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
            botResponse = "Super. Dans quelle ville vous trouvez-vous ?";
            nextStep = 3;
        }
        else if (botStep === 3) {
            currentData.city = reply;
            botResponse = "Dernière question : quel est le nom de votre business / entreprise ?";
            nextStep = 4;
        }
        else if (botStep === 4) {
            currentData.business = reply;
            botResponse = "Parfait ! J'ai toutes les infos. Je vous redirige vers notre équipe sur WhatsApp pour activer votre espace ! 🚀";
            nextStep = 5;
            
            try {
                await supabase.from('leads').insert([{
                    full_name: currentData.name, phone: currentData.phone, city: currentData.city,
                    message: `Business: ${currentData.business} | Note: ${currentData.question || 'Veut gérer ses livreurs'}`,
                    intent: 'Je veux gérer mes livreurs (Onyx Tiak)', source: 'Bot Fanta (Onyx Tiak)', status: 'Nouveau', saas: 'Onyx Tiak', ambassador_id: refId || undefined
                }]);
            } catch (err) {}

            const waMsg = `🚀 *Création Onyx Tiak*\n\nJe veux gérer mes livreurs !\n\n*Nom:* ${currentData.name}\n*Business:* ${currentData.business}\n*Ville:* ${currentData.city}\n\nComment on procède pour l'activation ?`;
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMsg)}`, "_blank"); }, 1500);
        }

        setBotData(currentData);
        setBotStep(nextStep);
        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);
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
           <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 hover:scale-105 transition-transform">
              <img src="https://i.ibb.co/1Gssqd2p/LOGO-SITE.png" alt="Onyx Logo" className="h-[60px] w-auto object-contain" />
           </button>
        </nav>

        {/* 1. HERO SECTION */}
        <section className="pt-20 pb-20 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
           <div className="text-left animate-in slide-in-from-bottom-8 fade-in duration-1000">
              <div className="inline-flex flex-wrap items-center gap-3 mb-6">
                 <div className="inline-flex items-center gap-2 bg-[#39FF14]/10 text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#39FF14]/20">
                    <Truck size={14} /> La logistique simplifiée
                 </div>
                 <div className="inline-flex items-center gap-2 bg-[#39FF14]/20 text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#39FF14]/30">
                    Machine à 2.900 F
                 </div>
              </div>
              <h1 className={`${spaceGrotesk.className} text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[1.05] mb-6`}>
                 Ne perdez plus <br/> la trace de vos <span className="text-[#39FF14] underline decoration-[#39FF14]/30 decoration-8 underline-offset-8">livraisons.</span>
              </h1>
              <p className="text-zinc-400 text-lg md:text-xl font-medium mb-8 leading-relaxed">
                 Assignez vos courses, suivez vos livreurs en temps réel, notifiez vos clients sur WhatsApp et contrôlez votre caisse sans erreurs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                 <button onClick={() => handleWaClick("Onyx Tiak")} className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition shadow-[0_0_30px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2">
                    Démarrer l'essai gratuit <ArrowRight size={18}/>
                 </button>
              </div>
           </div>
           <div className="relative animate-in slide-in-from-right-8 fade-in duration-1000 delay-200">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#39FF14] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
              <div className="border border-zinc-800 rounded-[2rem] shadow-2xl relative z-10 flex items-center justify-center overflow-hidden group">
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
                  <div className="text-4xl font-black mb-6 italic flex items-center">
                     <span className="line-through text-red-500 text-xl mr-2">13 900 F</span><span className="text-[#39FF14]">2 900 F</span> <span className="text-sm text-zinc-500 not-italic font-normal ml-2">/ 1er mois</span>
                  </div>
                  <ul className="space-y-4 mb-10 text-zinc-400 text-sm font-bold flex-1">
                     <li className="flex gap-2">✔ Suivi GPS des livreurs</li>
                     <li className="flex gap-2">✔ Alertes WhatsApp clients</li>
                     <li className="flex gap-2">✔ Bilan de caisse journalier</li>
                  </ul>
                  <button onClick={() => handleWaClick("Onyx Tiak Solo")} className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-zinc-700 transition">
                     Je teste pour 2.900 F
                  </button>
               </div>

               {/* CARTE BUNDLE (OnyxTekki - Recommandée) */}
               <div className="bg-gradient-to-b from-[#39FF14]/20 to-black border-4 border-[#39FF14] p-8 md:p-10 rounded-[3rem] flex flex-col relative md:scale-110 shadow-[0_0_50px_rgba(57,255,20,0.2)] z-10">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-[#39FF14] border-2 border-zinc-200 px-5 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase whitespace-nowrap animate-pulse shadow-xl flex items-center gap-2">
                     <Zap size={14}/> 1ER MOIS À 2.900 F !
                  </div>
                  <div className="flex items-center gap-2 mb-2 mt-4">
                     <p className="text-[10px] font-black tracking-[0.3em] text-[#39FF14] uppercase">Le Choix Évident</p>
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6 text-white`}>OnyxTekki <span className="text-[#39FF14] text-xl">(Trio)</span></h3>
                  <div className="text-4xl font-black mb-6 italic text-white flex items-center">
                     <span className="line-through text-red-500 text-xl mr-2">22 900 F</span><span className="text-[#39FF14]">2 900 F</span> <span className="text-sm text-zinc-400 not-italic font-normal ml-2">/ 1er mois</span>
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
                     JE TESTE POUR 2.900 F <ArrowRight size={18}/>
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
                <p className="font-black text-sm md:text-base text-white"><span className="line-through text-red-500 text-xs mr-2">22 900F</span><span className="text-[#39FF14]">2 900 F</span><span className="text-zinc-500 text-xs font-bold">/1er mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest hidden sm:block">Le Pack Trio Complet. <span className="text-black bg-[#39FF14] px-1.5 py-0.5 rounded shadow-sm">1ER MOIS À 2.900 F</span></p>
             </div>
             <button onClick={() => handleWaClick("OnyxTekki Trio")} className="bg-[#39FF14] text-black px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(57,255,20,0.3)]">
                Je teste pour 2.900 F
             </button>
          </div>
      </div>
    </main>
  );
}
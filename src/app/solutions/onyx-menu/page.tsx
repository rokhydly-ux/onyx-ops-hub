"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Utensils, QrCode, Smartphone, TrendingUp, CheckCircle, 
  ArrowRight, ChevronLeft, Printer, AlertTriangle, Zap, ChevronDown,
  Send, X, ArrowUp
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function OnyxMenuLanding() {
  const waNumber = "221785338417";
  
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
    { sender: 'bot', text: "👋 Nanga def ! Je suis Fanta. Avez-vous des questions sur Onyx Menu, le menu QR pour votre restaurant ?", options: ["Oui", "Non"] }
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
            botResponse = "Je vous écoute ! Vous pouvez me poser vos questions sur le prix, le QR code, ou la réception des commandes.";
        } else if (lowerReply === "non" || lowerReply === "non merci") {
            botResponse = "Très bien ! N'hésitez pas à cliquer sur le bouton 'Créer mon Menu' pour commencer votre essai gratuit.";
        } else if (lowerReply === "oui, parler à un conseiller" || lowerReply.includes("conseiller") || lowerReply.includes("humain") || lowerReply.includes("whatsapp")) {
            botResponse = "Je vous redirige vers notre expert sur WhatsApp ! À tout de suite 🚀";
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent("Bonjour l'équipe Onyx ! Je suis sur la page Onyx Menu et j'aimerais parler à un conseiller.")}`, '_blank'); }, 1000);
        } else if (lowerReply.includes("prix") || lowerReply.includes("coût") || lowerReply.includes("tarif") || lowerReply.includes("combien")) {
            botResponse = "Onyx Menu coûte 13 000 F/mois. Pour un Resto complet, nous avons l'offre OnyxTekki (Menu + Stock Ingrédients + Caisse) à 22 900 F !";
        } else if (lowerReply.includes("qr") || lowerReply.includes("scan") || lowerReply.includes("imprimer") || lowerReply.includes("comment")) {
            botResponse = "C'est magique : vous téléchargez votre QR code depuis l'appli, vous le placez sur vos tables, et les clients scannent pour voir vos plats en HD.";
        } else if (lowerReply.includes("commande") || lowerReply.includes("reception") || lowerReply.includes("cuisine") || lowerReply.includes("whatsapp")) {
            botResponse = "Le client valide son choix sur son téléphone, et la commande arrive parfaitement détaillée directement sur le WhatsApp de votre caisse ou de la cuisine !";
        } else {
            botResponse = "C'est noté ! Voulez-vous que je vous mette en relation avec un conseiller humain sur WhatsApp pour en discuter ?";
            botOptions = ["Oui, parler à un conseiller", "Non merci"];
        }

        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);

        try {
            await supabase.from('leads').insert([{ full_name: 'Visiteur Menu', intent: 'Question Bot Menu', source: 'Bot Fanta FAQ', message: reply, status: 'Nouveau' }]);
        } catch (err) {}
    }, 1000);
  };

  const handleWaClick = (pack: string) => {
    const msg = `Bonjour l'équipe Onyx ! Je veux moderniser mon restaurant avec ${pack}.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-zinc-900 overflow-x-hidden selection:bg-[#FF5722]/30 pb-24 font-sans">
      {/* NAVBAR */}
      <nav className="p-6 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => window.location.href = '/'} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-black hover:scale-105 transition-transform`}>
            ONYX<span className="text-[#FF5722] drop-shadow-sm">MENU</span>
         </button>
         
         <div className="flex items-center gap-4">
             <div className="relative" ref={dropdownRef}>
                 <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-black flex items-center gap-1 transition-colors">
                    Autres Solutions <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`absolute top-full right-0 mt-2 bg-white border border-zinc-200 shadow-xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <button onClick={() => window.location.href = '/'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[#FF5722] rounded-xl transition">🏠 Accueil Onyx</button>
                    <button onClick={() => window.location.href = '/jaay'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[#FF5722] rounded-xl transition">🛍️ Onyx Jaay</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-tontine'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[#FF5722] rounded-xl transition">💰 Onyx Tontine</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-tiak'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-[#FF5722] rounded-xl transition">🚚 Onyx Tiak</button>
                 </div>
             </div>
             <button onClick={() => window.location.href = '/'} className="bg-white border border-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-black hover:text-white transition-colors flex items-center gap-1 shadow-sm">
                 <ChevronLeft size={14}/> Accueil
             </button>
         </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-24 px-6 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="inline-flex items-center gap-2 bg-[#FF5722]/10 border border-[#FF5722]/20 text-[#FF5722] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm">
             <Utensils size={14} /> Restauration 2.0
         </div>
         <h1 className={`${spaceGrotesk.className} text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter leading-[0.95] mb-8 text-black`}>
            JETEZ VOS MENUS PAPIER. <br/>FAITES EXPLOSER VOTRE <span className="text-[#FF5722] underline decoration-black decoration-8 underline-offset-8">PANIER MOYEN.</span>
         </h1>
         <p className="text-zinc-600 text-lg md:text-xl font-bold max-w-3xl mx-auto mb-12 leading-relaxed">
            Un menu digital interactif qui donne faim. Vos clients scannent, salivent devant des photos HD et commandent directement sur WhatsApp en <strong className="text-black">10 secondes chrono.</strong>
         </p>
         
         <button onClick={() => handleWaClick("Onyx Menu (Essai Gratuit)")} className="bg-[#FF5722] text-white px-8 md:px-12 py-5 md:py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_20px_40px_rgba(255,87,34,0.3)] flex items-center justify-center gap-3 mx-auto relative overflow-hidden group">
            <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            <QrCode size={24} className="relative z-10" /> <span className="relative z-10">Créer mon menu digital (Essai Gratuit)</span>
         </button>

         {/* HERO IMAGE PLACEHOLDER */}
         <div className="mt-20 relative max-w-4xl mx-auto">
            <div className="absolute inset-0 bg-[#FF5722] opacity-[0.05] blur-[100px] rounded-full"></div>
            <div className="w-full aspect-video bg-white border border-zinc-200 rounded-[2rem] shadow-2xl relative z-10 flex items-center justify-center overflow-hidden group">
               <img src="https://i.ibb.co/tT5Zq8kX/Sans-titre-1024-x-768-px-1.png" alt="Illustration Menu Téléphone" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
         </div>
      </section>

      {/* 2. BÉNÉFICES DIRECTS */}
      <section className="py-24 px-6 border-t border-zinc-200 bg-white">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>La fin des <span className="text-[#FF5722]">pertes bêtes.</span></h2>
               <p className="text-zinc-500 font-bold text-lg">Pourquoi les menus classiques tuent votre rentabilité.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
               <div className="bg-zinc-50 border border-zinc-100 p-10 rounded-[2rem] hover:border-[#FF5722] hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 bg-black text-[#FF5722] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><TrendingUp size={32}/></div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-4 text-black`}>+30% sur le Panier Moyen</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed">Les gens mangent avec les yeux. Les photos HD font vendre les suppléments "Frites & Boisson" et les desserts sans qu'un serveur n'ait à le demander.</p>
               </div>

               <div className="bg-zinc-50 border border-zinc-100 p-10 rounded-[2rem] hover:border-[#FF5722] hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 bg-black text-[#FF5722] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><Printer size={32}/></div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-4 text-black`}>Zéro Frais d'Impression</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed">Un plat en rupture ? Un prix qui change ? Modifiez-le en 1 clic depuis votre téléphone. Ne repoussez plus jamais un menu complet chez l'imprimeur.</p>
               </div>

               <div className="bg-zinc-50 border border-zinc-100 p-10 rounded-[2rem] hover:border-[#FF5722] hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 bg-black text-[#FF5722] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"><CheckCircle size={32}/></div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-4 text-black`}>Commandes Zéro Erreur</h3>
                  <p className="text-zinc-600 font-medium leading-relaxed">Fini les serveurs qui oublient le "sans oignons". Le client valide son choix et la commande tombe parfaitement formatée sur votre WhatsApp de caisse.</p>
               </div>
            </div>
         </div>
      </section>

      {/* 3. TARIFICATION BUNDLE RESTO */}
      <section id="tarifs" className="py-24 px-6 bg-zinc-950 text-white relative mt-10 rounded-[4rem] mx-4">
         <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-4`}>Un système qui <span className="text-[#FF5722]">rapporte plus.</span></h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">
               {/* CARTE LEURRE (Solo) */}
               <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-[3rem] flex flex-col">
                  <p className="text-[10px] font-black tracking-widest text-zinc-500 uppercase mb-2">Idéal Food-Truck</p>
                  <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6`}>Onyx Menu</h3>
                  <div className="text-4xl font-black mb-6 italic">13 000 F <span className="text-sm text-zinc-500 not-italic font-normal">/ mois</span></div>
                  <ul className="space-y-4 mb-10 text-zinc-400 text-sm font-bold flex-1">
                     <li className="flex gap-2">✔ Menu Digital QR Code</li>
                     <li className="flex gap-2">✔ Photos HD illimitées</li>
                     <li className="flex gap-2">✔ Commandes WhatsApp Formatées</li>
                  </ul>
                  <button onClick={() => handleWaClick("Onyx Menu Solo")} className="w-full bg-zinc-800 text-white py-4 rounded-2xl font-black uppercase text-sm hover:bg-zinc-700 transition">
                     Créer mon Menu
                  </button>
               </div>

               {/* CARTE BUNDLE (OnyxTekki Resto - Recommandée) */}
               <div className="bg-gradient-to-b from-[#FF5722]/20 to-black border-4 border-[#FF5722] p-8 md:p-10 rounded-[3rem] flex flex-col relative md:scale-110 shadow-[0_0_50px_rgba(255,87,34,0.2)] z-10">
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white text-[#FF5722] border-2 border-zinc-200 px-5 py-2 rounded-full text-[10px] sm:text-xs font-black uppercase whitespace-nowrap animate-pulse shadow-xl flex items-center gap-2">
                     <Zap size={14}/> PREMIER MOIS OFFERT !
                  </div>
                  <div className="flex items-center gap-2 mb-2 mt-4">
                     <p className="text-[10px] font-black tracking-[0.3em] text-[#FF5722] uppercase">La Machine Ultime</p>
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6 text-white`}>OnyxTekki <span className="text-[#FF5722] text-xl">(Resto)</span></h3>
                  <div className="text-4xl font-black mb-6 italic text-white flex items-center">
                     22 900 F <span className="text-sm text-zinc-400 not-italic font-normal ml-2">/ mois</span>
                  </div>
                  <div className="bg-black/50 border border-[#FF5722]/30 p-4 rounded-2xl mb-8 text-xs text-white font-bold leading-relaxed">
                     Sécurisez la caisse, le stock d'ingrédients et pilotez vos propres livreurs avec la suite complète.
                  </div>
                  <ul className="space-y-4 mb-10 text-zinc-300 text-sm font-bold flex-1">
                     <li className="flex gap-2">✔ <strong className="text-white">Onyx Menu</strong> (QR & Commandes)</li>
                     <li className="flex gap-2">✔ <strong className="text-white">Onyx Stock</strong> (Matières premières)</li>
                     <li className="flex gap-2">✔ <strong className="text-white">Onyx Tiak</strong> (Suivi Livreurs)</li>
                     <li className="flex gap-2 text-[#FF5722]">✔ Marge sous contrôle</li>
                  </ul>
                  <button onClick={() => handleWaClick("OnyxTekki Resto")} className="w-full bg-[#FF5722] text-white py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(255,87,34,0.3)] flex justify-center items-center gap-2 animate-pulse hover:animate-none">
                     INSTALLER MON RESTO 2.0 <ArrowRight size={18}/>
                  </button>
               </div>
            </div>
         </div>
      </section>

      {/* BOUTON REMONTER EN HAUT */}
      {showScrollTop && (
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="fixed bottom-24 left-6 z-[90] bg-white text-black p-3 md:p-4 rounded-full shadow-2xl border border-zinc-200 hover:scale-110 hover:border-black transition-all animate-in fade-in slide-in-from-bottom-4"
         >
           <ArrowUp size={24} />
         </button>
      )}

      {/* BOT FANTA FAQ ONYX MENU */}
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
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className="font-black text-sm md:text-base text-black">22 900 F<span className="text-zinc-500 text-xs font-bold">/mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">Pack Resto Complet. <span className="text-white bg-[#FF5722] px-1.5 py-0.5 rounded shadow-sm">1er MOIS GRATUIT</span></p>
             </div>
             <button onClick={() => handleWaClick("OnyxTekki Resto")} className="bg-[#FF5722] text-white px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-lg shadow-[#FF5722]/20">
                Démarrer l'essai
             </button>
          </div>
      </div>
    </main>
  );
}
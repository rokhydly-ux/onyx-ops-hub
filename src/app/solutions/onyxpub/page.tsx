"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ArrowRight, Sparkles, CheckCircle, Zap, Camera, X, Send, MessageSquare, ChevronDown, PlayCircle, Sun, Moon } from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

const FAQ_DATA = [
  { question: "Le budget pub est-il vraiment inclus chaque mois ?", answer: "Oui ! Par exemple, avec l'offre standard à 39 900F, nous réinvestissons directement 10 000 FCFA sur Meta Ads (Facebook/Instagram) pour lancer vos campagnes publicitaires." },
  { question: "Comment se passe la génération de visuels par l'IA ?", answer: "Prenez simplement vos produits en photo avec votre smartphone (de préférence sur un fond neutre). Envoyez-les sur notre WhatsApp, et notre intelligence artificielle s'occupe de les transformer en véritables affiches publicitaires haut de gamme pour l'e-commerce." },
  { question: "Combien de temps avant de voir les premiers résultats ?", answer: "La mise en place initiale de la machine prend environ 48h. Dès que vos publicités sont validées par Meta, les premiers messages et interactions de clients arrivent directement sur votre numéro WhatsApp." },
  { question: "Dois-je m'engager sur plusieurs mois ?", answer: "Non. Les abonnements OnyxPub sont mensuels et sans engagement de durée. Notre seul but est que la rentabilité immédiate générée vous convainque de continuer mois après mois." },
  { question: "Que fait le Bot WhatsApp exactement ?", answer: "Le Bot agit comme votre vendeur 24h/24. Il accueille instantanément les prospects venant des publicités, répond aux questions fréquentes, qualifie le besoin, et vous aide à conclure la vente." }
];

const galleryImages = [
  "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563498/A_moody__high-end_luxury_promotional_202604301516_zoftg0.jpg",
  "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563489/A_luxurious_corporate_promotional_poster._202604301529_docu21.jpg",
  "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563486/A_high-end_modern_cosmetic_promotional_202604301537_qqhvht.jpg",
  "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563485/A_futuristic_and_modern_graphic_202604301528_kon2vz.jpg",
  "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563485/A_clean__high-end_beauty_brand_202604301536_oke06i.jpg",
  "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563481/A_vibrant_and_appetizing_food_202604301533_dmp5uw.jpg",
  "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563472/A_high-end_modern_promotional_poster_202604301536_c7cpzr.jpg",
  "https://res.cloudinary.com/dtr2wtoty/image/upload/v1777563486/A_high-end_modern_cosmetic_promotional_202604301537_qqhvht.jpg"
];

export default function OnyxPubLanding() {
  const router = useRouter();
  const waNumber = "221785338417";

  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isGenerated, setIsGenerated] = useState(false);
  
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const imageKeys = ["face", "dos", "bas", "ouvert"];
  const images: Record<string, string> = { face: "https://i.ibb.co/BVKC5TDN/sac.png", dos: "https://i.ibb.co/hRqbm8vY/DOS-SAC.png", bas: "https://i.ibb.co/NnjPZzng/BAS-SAC.png", ouvert: "https://i.ibb.co/Kx2b19xV/SAC-OUVERT.png" };

  // Lika Chat states
  const [isLikaChatOpen, setIsLikaChatOpen] = useState(false);
  const [userReply, setUserReply] = useState("");
  const [likaMessages, setLikaMessages] = useState<{sender: 'bot'|'client', text: string}[]>([
    { sender: 'bot', text: "Salut ! Je suis Lika, experte en publicité. Prête à transformer tes photos en machine à cash ?" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [likaMessages, isLikaChatOpen]);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLikaSend = () => {
    if (!userReply.trim()) return;
    setLikaMessages(prev => [...prev, { sender: 'client', text: userReply }]);
    const currentReply = userReply;
    setUserReply("");

    setTimeout(() => {
       let botResponse = "C'est une excellente question ! Avec OnyxPub, on génère des visuels pros et on gère les pubs pour toi. Tu as une question sur le budget ou la méthode ?";
       const lowerReply = currentReply.toLowerCase();
       if (lowerReply.includes('prix') || lowerReply.includes('tarif') || lowerReply.includes('combien')) botResponse = "L'offre standard est à 39 900 F/mois (budget pub inclus !), et l'offre Pro à 59 900 F/mois avec un shooting terrain.";
       else if (lowerReply.includes('photo') || lowerReply.includes('whatsapp') || lowerReply.includes('comment')) botResponse = "Tu nous envoies juste des photos simples sur WhatsApp, et notre IA s'occupe de créer les versions Luxe, Lifestyle, etc.";
       else if (lowerReply.includes('budget') || lowerReply.includes('pub') || lowerReply.includes('facebook')) botResponse = "L'offre de départ est à 2.900 F pour tester 1 créative IA. Si ça te plaît, les forfaits standards gèrent tout avec le budget pub Facebook/Insta inclus !";

       setLikaMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

  const handleWaClick = (plan: string) => {
    const msg = `Bonjour l'équipe Onyx ! Je souhaite lancer ma machine à cash avec l'offre ${plan}.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className={`min-h-screen ${mounted && theme === 'light' ? 'bg-zinc-50 text-black' : 'bg-[#0a0a0a] text-white'} selection:bg-[#39FF14]/30 pb-24 font-sans overflow-x-hidden transition-colors duration-300`}>
      {/* STYLES GLITCH HOVER */}
      <style dangerouslySetInnerHTML={{__html: `
        .glitch-hover:hover {
          animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
        }
        .glitch-hover:hover .glitch-text {
          animation: glitch-anim 0.2s linear infinite;
        }
        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          20% { transform: skew(-10deg); }
          40% { transform: skew(10deg); }
          60% { transform: skew(-5deg); }
          80% { transform: skew(5deg); }
          100% { transform: skew(0deg); }
        }
        @keyframes glitch-anim {
          0% { text-shadow: 2px 0 #23a9dc, -2px 0 #ff00ff; }
          25% { text-shadow: -2px 0 #23a9dc, 2px 0 #ff00ff; }
          50% { text-shadow: 2px 0 #ff00ff, -2px 0 #23a9dc; }
          75% { text-shadow: -2px 0 #ff00ff, 2px 0 #23a9dc; }
          100% { text-shadow: 2px 0 #23a9dc, -2px 0 #ff00ff; }
        }
        @keyframes neon-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(35,169,220,0.2); border-color: rgba(35,169,220,0.4); }
          50% { box-shadow: 0 0 50px rgba(35,169,220,0.8), inset 0 0 10px rgba(35,169,220,0.3); border-color: #23a9dc; }
        }
        .neon-border {
          animation: neon-pulse 3s ease-in-out infinite;
        }
      `}} />

      {/* NAVBAR */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => router.push('/')} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 hover:scale-105 transition-transform ${mounted && theme === 'light' ? 'text-black' : 'text-white'}`}>
            ONYX<span className="text-[#39FF14] drop-shadow-sm">PUB</span>
         </button>
         
         <div className="flex items-center gap-4">
             <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className={`p-2 rounded-full border hover:scale-110 transition-transform ${mounted && theme === 'light' ? 'border-zinc-200 text-black' : 'border-zinc-800 text-white'}`} aria-label="Toggle Dark Mode">
                {mounted && theme === 'light' ? <Moon size={18}/> : <Sun size={18}/>}
             </button>
             <div className="relative hidden sm:block" ref={dropdownRef}>
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className={`text-xs font-bold uppercase tracking-widest hover:text-[#39FF14] flex items-center gap-1 transition-colors ${mounted && theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                   Autres Solutions <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute top-full right-0 mt-2 border shadow-2xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${mounted && theme === 'light' ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'} ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                   <button onClick={() => router.push('/jaay')} className={`text-left px-4 py-2 text-xs font-bold rounded-xl transition ${mounted && theme === 'light' ? 'text-zinc-800 hover:bg-zinc-100 hover:text-[#39FF14]' : 'text-zinc-400 hover:bg-black hover:text-[#39FF14]'}`}>🛒 Onyx Jaay</button>
                   <button onClick={() => router.push('/solutions/onyx-tekki')} className={`text-left px-4 py-2 text-xs font-bold rounded-xl transition ${mounted && theme === 'light' ? 'text-zinc-800 hover:bg-zinc-100 hover:text-[#39FF14]' : 'text-zinc-400 hover:bg-black hover:text-[#39FF14]'}`}>📦 Onyx Tekki</button>
                   <button onClick={() => router.push('/solutions/onyx-tekki-pro')} className={`text-left px-4 py-2 text-xs font-bold rounded-xl transition ${mounted && theme === 'light' ? 'text-zinc-800 hover:bg-zinc-100 hover:text-[#39FF14]' : 'text-zinc-400 hover:bg-black hover:text-[#39FF14]'}`}>🚀 Onyx Tekki Pro</button>
                   <button onClick={() => router.push('/solutions/onyx-menu')} className={`text-left px-4 py-2 text-xs font-bold rounded-xl transition ${mounted && theme === 'light' ? 'text-zinc-800 hover:bg-zinc-100 hover:text-[#39FF14]' : 'text-zinc-400 hover:bg-black hover:text-[#39FF14]'}`}>🍽️ Onyx Menu</button>
                   <button onClick={() => router.push('/solutions/onyx-booking')} className={`text-left px-4 py-2 text-xs font-bold rounded-xl transition ${mounted && theme === 'light' ? 'text-zinc-800 hover:bg-zinc-100 hover:text-[#39FF14]' : 'text-zinc-400 hover:bg-black hover:text-[#39FF14]'}`}>📅 Onyx Booking</button>
                   <button onClick={() => router.push('/solutions/onyxcrm')} className={`text-left px-4 py-2 text-xs font-bold rounded-xl transition ${mounted && theme === 'light' ? 'text-zinc-800 hover:bg-zinc-100 hover:text-[#39FF14]' : 'text-zinc-400 hover:bg-black hover:text-[#39FF14]'}`}>🤝 Onyx CRM</button>
                </div>
             </div>
             <button onClick={() => router.push('/')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors flex items-center gap-1 shadow-sm ${mounted && theme === 'light' ? 'bg-zinc-100 text-black hover:bg-black hover:text-[#39FF14]' : 'bg-zinc-900 border border-zinc-800 text-white hover:bg-white hover:text-black'}`}>
                 <ChevronLeft size={14}/> Accueil
             </button>
         </div>
      </nav>

      {/* SECTION 1 : HERO INTERACTIF */}
      <section className="pt-24 pb-16 px-6 text-center max-w-6xl mx-auto relative z-10">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-[#39FF14] rounded-full blur-[100px] md:blur-[150px] opacity-20 pointer-events-none"></div>
         
         <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-[1.05] mb-12 relative z-10 ${mounted && theme === 'light' ? 'text-black' : 'text-white'}`}>
            Transformez une simple photo WhatsApp en <br className="hidden md:block"/>
            <span className="text-[#39FF14] drop-shadow-lg">machine à cash en 48h.</span>
         </h2>

         {/* 360 BAG & EXPLOSION */}
         <div className="relative w-full max-w-4xl mx-auto h-[400px] md:h-[550px] flex items-center justify-center mt-10 mb-12 perspective-1000">
            <motion.div
               animate={{ y: [-15, 15, -15] }}
               transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
               className="relative z-30 flex flex-col items-center"
            >
               <motion.div 
                  layout
                  whileHover={{ rotateY: 15, rotateX: -10, scale: isGenerated ? 0.65 : 1.05 }}
                  animate={{ scale: isGenerated ? 0.5 : 1, y: isGenerated ? (typeof window !== 'undefined' && window.innerWidth < 768 ? -50 : 0) : 0 }}
                  transition={{ type: "spring", bounce: 0.3 }}
                  className="cursor-grab active:cursor-grabbing flex flex-col items-center relative"
                  onPointerDown={(e: any) => { setIsDragging(true); setStartX(e.clientX); }}
                  onPointerMove={(e: any) => {
                    if (!isDragging) return;
                    const deltaX = e.clientX - startX;
                    if (Math.abs(deltaX) > 40) {
                      if (deltaX > 0) setActiveImgIndex(p => (p - 1 + imageKeys.length) % imageKeys.length);
                      else setActiveImgIndex(p => (p + 1) % imageKeys.length);
                      setStartX(e.clientX);
                    }
                  }}
                  onPointerUp={() => setIsDragging(false)}
                  onPointerLeave={() => setIsDragging(false)}
               >
                  <img src={images[imageKeys[activeImgIndex]]} alt="Sac 360" className="w-64 h-64 md:w-96 md:h-96 object-contain drop-shadow-2xl pointer-events-none select-none" />
                  {!isGenerated && (
                    <div className="mt-6 bg-black/90 text-[#39FF14] text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full border border-[#39FF14]/30 shadow-[0_0_20px_rgba(57,255,20,0.3)] pointer-events-none animate-pulse">
                      Survolez ou Glissez 👆
                    </div>
                  )}
               </motion.div>
            </motion.div>

            <AnimatePresence>
               {isGenerated && (
                 <>
                    {/* Variation 1: Top Left */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
                      animate={{ opacity: 1, scale: 1, left: "20%", top: "20%", x: "-50%", y: "-50%" }}
                      exit={{ opacity: 0, scale: 0, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
                      transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
                      className="absolute z-20 w-32 md:w-48"
                    >
                       <motion.div animate={{ y: [-10, 10, -10] }} transition={{ repeat: Infinity, duration: 3.2, ease: "easeInOut" }} className="bg-black/90 backdrop-blur-md border border-[#23a9dc]/50 p-2 rounded-2xl shadow-[0_0_30px_rgba(35,169,220,0.3)] flex flex-col items-center">
                          <img src="https://i.ibb.co/Kx2b19xV/SAC-OUVERT.png" className="w-full aspect-square object-cover rounded-xl" />
                          <p className="text-[9px] md:text-[10px] font-bold text-center mt-2 text-[#23a9dc] uppercase tracking-widest leading-tight mb-1">Angle Prestige & Détails</p>
                       </motion.div>
                    </motion.div>

                    {/* Variation 2: Top Right */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
                      animate={{ opacity: 1, scale: 1, left: "80%", top: "20%", x: "-50%", y: "-50%" }}
                      exit={{ opacity: 0, scale: 0, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
                      transition={{ duration: 0.6, type: "spring", bounce: 0.5, delay: 0.1 }}
                      className="absolute z-20 w-32 md:w-48"
                    >
                       <motion.div animate={{ y: [-15, 15, -15] }} transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }} className="bg-black/90 backdrop-blur-md border border-[#39FF14]/50 p-2 rounded-2xl shadow-[0_0_30px_rgba(57,255,20,0.3)] flex flex-col items-center">
                          <img src="https://i.ibb.co/hRqbm8vY/DOS-SAC.png" className="w-full aspect-square object-cover rounded-xl" />
                          <p className="text-[9px] md:text-[10px] font-bold text-center mt-2 text-[#39FF14] uppercase tracking-widest leading-tight mb-1">Angle Lifestyle Local</p>
                       </motion.div>
                    </motion.div>

                    {/* Variation 3: Bottom Center */}
                    <motion.div 
                      initial={{ opacity: 0, scale: 0, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
                      animate={{ opacity: 1, scale: 1, left: "50%", top: "85%", x: "-50%", y: "-50%" }}
                      exit={{ opacity: 0, scale: 0, left: "50%", top: "50%", x: "-50%", y: "-50%" }}
                      transition={{ duration: 0.6, type: "spring", bounce: 0.5, delay: 0.2 }}
                      className="absolute z-20 w-48 md:w-72"
                    >
                       <motion.div animate={{ y: [-8, 8, -8] }} transition={{ repeat: Infinity, duration: 3.8, ease: "easeInOut" }} className="bg-black/90 backdrop-blur-md border border-red-500/50 p-2 rounded-2xl shadow-[0_0_30px_rgba(239,68,68,0.3)] flex flex-col items-center">
                          <video src="https://res.cloudinary.com/dtr2wtoty/video/upload/v1777478457/DEMO_SAC_MARRON_emxajn.mp4" autoPlay loop muted playsInline className="w-full aspect-video object-cover rounded-xl" />
                          <p className="text-[9px] md:text-[10px] font-bold text-center mt-2 text-red-500 uppercase tracking-widest leading-tight mb-1">Angle Urgence & Offre</p>
                       </motion.div>
                    </motion.div>
                 </>
               )}
            </AnimatePresence>
         </div>

         <div className="relative z-20 mt-8 min-h-[120px] flex flex-col items-center justify-start gap-4">
            <button onClick={() => setIsGenerated(!isGenerated)} className={`text-[#39FF14] text-sm md:text-lg font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-transform w-full ${!isGenerated && 'animate-pulse'}`}>
               {isGenerated ? "Ranger les variations 🪄" : "Cliquez ici pour tester la magie 🪄"}
            </button>
            
            <AnimatePresence>
               {isGenerated && (
                  <motion.button 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, scale: 0.9 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => handleWaClick("OnyxPub")}
                    className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3 mx-auto w-full max-w-lg animate-pulse"
                  >
                     Je veux ces résultats pour mon business <ArrowRight size={20} />
                  </motion.button>
               )}
            </AnimatePresence>
         </div>
      </section>

      {/* SECTION 2 : COPYWRITING */}
      <section className={`py-24 px-6 border-y relative z-10 transition-colors ${mounted && theme === 'light' ? 'bg-white border-zinc-200' : 'bg-black border-zinc-900'}`}>
         <div className="max-w-4xl mx-auto">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-10 leading-[1.1] ${mounted && theme === 'light' ? 'text-black' : 'text-white'}`}>
               Le secret des agences ? <br className="hidden md:block"/>
               <span className="text-[#39FF14]">Le ciblage est mort. Place au Volume Créatif.</span>
            </h2>
            
            <p className={`text-lg md:text-xl font-medium leading-relaxed mb-12 ${mounted && theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>
               L'algorithme Meta a changé : c'est devenu un moteur de matching visuel. Si vous boostez la même photo toute la semaine, vos ventes s'étouffent. La solution ? Le volume. Mais produire 20 visuels par semaine coûte cher, et les IA génériques pondent des "pubs de toubab" qui ne parlent pas à vos clients. OnyxPub change les règles.
            </p>

            <div className="space-y-6">
               <div className="flex items-start gap-4">
                  <div className="bg-[#39FF14]/10 p-2 rounded-full mt-1 shrink-0"><CheckCircle className="text-[#39FF14]" size={24}/></div>
                  <p className={`text-lg font-bold leading-relaxed ${mounted && theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}><span className="text-[#39FF14] font-black uppercase">Ancrage 100% Local :</span> Des créatives adaptées aux réalités africaines. Fini le décalage.</p>
               </div>
               <div className="flex items-start gap-4">
                  <div className="bg-[#39FF14]/10 p-2 rounded-full mt-1 shrink-0"><CheckCircle className="text-[#39FF14]" size={24}/></div>
                  <p className={`text-lg font-bold leading-relaxed ${mounted && theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}><span className="text-[#39FF14] font-black uppercase">Variété Infinie :</span> Preuve sociale, humour, urgence, prestige... on teste tous les angles.</p>
               </div>
               <div className="flex items-start gap-4">
                  <div className="bg-[#39FF14]/10 p-2 rounded-full mt-1 shrink-0"><CheckCircle className="text-[#39FF14]" size={24}/></div>
                  <p className={`text-lg font-bold leading-relaxed ${mounted && theme === 'light' ? 'text-zinc-800' : 'text-zinc-200'}`}><span className="text-[#39FF14] font-black uppercase">Volume x10 :</span> Multipliez vos publicités par 10 sans embaucher ni payer de shooting.</p>
               </div>
            </div>
         </div>
      </section>

      {/* SECTION 3 : LA GALERIE IMMERSIVE */}
      <section className="w-full overflow-hidden bg-black py-16 relative border-b border-zinc-900 z-10">
         {/* Overlays */}
         <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-32 bg-gradient-to-r from-black to-transparent z-20"></div>
         <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-32 bg-gradient-to-l from-black to-transparent z-20"></div>
         
         <div className="mb-10 text-center relative z-20">
            <h2 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase tracking-tighter text-white`}>Nos Visuels qui <span className="text-[#39FF14]">Vendent</span></h2>
         </div>

         <div className="flex w-max">
            <motion.div 
               animate={{ x: ["0%", "-50%"] }} 
               transition={{ repeat: Infinity, ease: "linear", duration: 30 }} 
               className="flex"
            >
               {/* 16 images (8 x 2 pour loop infinie) */}
               {[...galleryImages, ...galleryImages].map((src, i) => (
                  <img 
                     key={i} 
                     src={src} 
                     alt={`Visuel généré IA ${i + 1}`} 
                     loading="lazy"
                     className="aspect-[9/16] w-64 md:w-80 rounded-2xl object-cover flex-shrink-0 mx-4 border border-zinc-800 shadow-lg" 
                  />
               ))}
            </motion.div>
         </div>
      </section>

      {/* SECTION 4 : PRICING */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
           <div className="text-center mb-16">
              <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter ${mounted && theme === 'light' ? 'text-black' : 'text-white'} mb-4`}>
                 Un investissement <span className="text-[#39FF14]">instantanément rentable.</span>
              </h2>
              <p className="text-zinc-500 font-bold text-lg">Zéro blabla, que des résultats.</p>
           </div>

           <div className="grid lg:grid-cols-3 gap-6 items-center">
              {/* Carte 0 : Starter IA */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-[3rem] hover:border-[#39FF14] transition-all flex flex-col h-full">
                 <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-max">
                    Offre de Départ
                 </div>
                 <h3 className={`${spaceGrotesk.className} text-4xl font-black text-white mb-2 uppercase`}>Starter IA</h3>
                 <p className="text-zinc-400 font-medium text-sm mb-6 h-12">Le prix d'un poulet pour tester notre algorithme et recevoir un visuel de qualité agence.</p>
                 <div className="text-4xl md:text-5xl font-black text-white mb-8 italic">
                    2 900 F <span className="text-sm text-zinc-500 font-normal not-italic">/ test</span>
                 </div>
                 
                 <ul className="space-y-4 mb-10 flex-1 text-sm font-bold">
                    <li className="flex items-start gap-3 text-white">
                       <Zap size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                       <span>1 Visuel ou Vidéo Haute Conversion généré par IA</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Copywriting inclus (Texte de vente)</span>
                    </li>
                 </ul>

                 <button onClick={() => handleWaClick("Starter IA à 2900F")} className="w-full bg-[#39FF14] text-black hover:bg-white py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-[0_10px_20px_rgba(57,255,20,0.2)]">
                    Je teste pour 2.900F
                 </button>
              </div>

              {/* Carte 1 : OnyxPub */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-[3rem] hover:border-zinc-700 transition-all flex flex-col h-full">
                 <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-max">
                    L'Agence 100% IA
                 </div>
                 <h3 className={`${spaceGrotesk.className} text-4xl font-black text-white mb-2 uppercase`}>OnyxPub</h3>
                 <p className="text-zinc-400 font-medium text-sm mb-6 h-12">Pour le prix d'un gardien de nuit, vous avez une agence marketing et un vendeur 24h/24.</p>
                 <div className="text-4xl md:text-5xl font-black text-white mb-8 italic">
                    39 900 F <span className="text-sm text-zinc-500 font-normal not-italic">/ mois</span>
                 </div>
                 
                 <ul className="space-y-4 mb-10 flex-1 text-sm font-bold">
                    <li className="flex items-start gap-3 text-white">
                       <Zap size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                       <span className="flex items-center flex-wrap gap-2 text-black bg-[#39FF14] px-3 py-1 rounded-md font-black uppercase shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                          10 000 FCFA de budget pub INCLUS
                          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLfm0ooWZDodEBD2zlKPK3xt37ot4lUZHIBw&s" alt="Meta Ads" className="h-4 w-auto rounded-[2px] object-contain inline-block bg-white" />
                       </span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>8 vidéos/images IA par mois</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Traitement depuis vos photos WhatsApp</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Bot WhatsApp avancé (relance panier)</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Gestion Meta Ads</span>
                    </li>
                 </ul>

                 <button onClick={() => handleWaClick("OnyxPub")} className="w-full bg-zinc-800 text-white hover:bg-zinc-700 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all">
                    Sélectionner OnyxPub
                 </button>
              </div>

              {/* Carte 2 : OnyxPub Pro */}
              <div className="bg-black border-[3px] border-[#23a9dc] p-8 md:p-10 rounded-[3rem] transform md:scale-105 transition-all flex flex-col h-full relative z-10 neon-border">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#23a9dc] text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                    <Sparkles size={14}/> Recommandé
                 </div>
                 <div className="inline-flex items-center gap-2 bg-[#23a9dc]/10 text-[#23a9dc] border border-[#23a9dc]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-max mt-2">
                    Le VIP Hybride
                 </div>
                 <h3 className={`${spaceGrotesk.className} text-4xl font-black text-white mb-2 uppercase`}>OnyxPub <span className="text-[#23a9dc]">Pro</span></h3>
                 <p className="text-zinc-400 font-medium text-sm mb-6 h-12">L'écosystème complet. Du tournage terrain à la vente automatisée.</p>
                 <div className="text-4xl md:text-5xl font-black text-white mb-8 italic">
                    59 900 F <span className="text-sm text-zinc-500 font-normal not-italic">/ mois</span>
                 </div>
                 
                 <ul className="space-y-4 mb-10 flex-1 text-sm font-bold">
                    <li className="flex items-start gap-3 text-white">
                       <Zap size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                       <span className="flex items-center flex-wrap gap-2 text-black bg-[#39FF14] px-3 py-1 rounded-md font-black uppercase shadow-[0_0_15px_rgba(57,255,20,0.5)]">
                          15 000 FCFA de budget pub INCLUS
                          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLfm0ooWZDodEBD2zlKPK3xt37ot4lUZHIBw&s" alt="Meta Ads" className="h-4 w-auto rounded-[2px] object-contain inline-block bg-white" />
                       </span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-200">
                       <Camera size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>1 déplacement/mois (pour 5 vidéos réelles)</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-200">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>10 créas IA pour l'A/B testing</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-200">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Bot WhatsApp Premium</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-200">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Gestion Meta Ads experte</span>
                    </li>
                 </ul>

                 <button onClick={() => handleWaClick("OnyxPub Pro")} className="w-full bg-[#23a9dc] text-black hover:bg-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg flex justify-center items-center gap-2">
                    Passer au niveau Pro <ArrowRight size={18}/>
                 </button>
              </div>
           </div>
        </div>
      </section>

      {/* SECTION 5 : FAQ */}
      <section className="py-24 px-6 bg-black relative z-10 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4`}>Questions <span className="text-[#23a9dc]">Fréquentes</span></h2>
            <p className="text-zinc-500 font-bold max-w-2xl mx-auto text-lg">Tout ce que vous devez savoir avant de lancer votre machine à cash.</p>
          </div>
          <div className="space-y-4">
            {FAQ_DATA.map((item, index) => (
              <div key={index} className={`bg-zinc-900/50 border rounded-[2rem] p-6 transition-all duration-300 ${openFaq === index ? 'border-[#23a9dc]' : 'border-zinc-800'}`}>
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <h3 className="font-black text-lg uppercase tracking-tight text-white">{item.question}</h3>
                  <div className={`p-2 rounded-full transition-transform duration-300 shrink-0 ${openFaq === index ? 'bg-[#23a9dc] text-black rotate-180' : 'bg-zinc-800 text-zinc-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className={`text-zinc-400 font-medium leading-relaxed pr-8 transition-transform duration-500 ${openFaq === index ? 'translate-y-0' : '-translate-y-3'}`}>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOATING LIKA MASCOT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in slide-in-from-right-8">
         <style dangerouslySetInnerHTML={{__html: `
            @keyframes float-lika {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
              100% { transform: translateY(0px); }
            }
            .lika-float {
              animation: float-lika 3.5s ease-in-out infinite;
            }
         `}} />
         
         {isLikaChatOpen ? (
            <div className="bg-black rounded-[2rem] shadow-[0_0_40px_rgba(35,169,220,0.3)] border-2 border-[#23a9dc] p-0 mb-4 w-[340px] h-[450px] flex flex-col animate-in zoom-in duration-300 overflow-hidden pointer-events-auto">
               <div className="bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <img src="/lika-avatar.png" alt="Lika" onError={(e: any) => e.target.src = 'https://i.ibb.co/B5HhnTjw/La-mascotte-LIKA-202604121725.jpg'} className="w-10 h-10 rounded-full object-cover border border-[#23a9dc]" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#23a9dc] rounded-full border border-black animate-pulse"></div>
                     </div>
                     <div><p className="text-[#23a9dc] font-black uppercase text-xs">Lika - Experte Ads</p></div>
                  </div>
                  <button onClick={() => setIsLikaChatOpen(false)} className="text-zinc-400 hover:text-white transition"><X size={18}/></button>
               </div>
               
               <div className="flex-1 bg-black p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar">
                  {likaMessages.map((msg, i) => (
                     <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                        <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? 'bg-zinc-800 text-white border border-zinc-700 rounded-tl-none shadow-sm' : 'bg-[#23a9dc] text-black rounded-tr-none shadow-md'}`}>
                           {msg.text}
                        </div>
                     </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>

               <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
                  <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLikaSend()} placeholder="Poser une question..." className="flex-1 bg-black border border-zinc-800 text-white rounded-xl px-4 outline-none text-sm font-bold focus:border-[#23a9dc] transition-colors" />
                  <button onClick={handleLikaSend} className="bg-[#23a9dc] p-3 rounded-xl text-black hover:scale-105 transition"><Send size={18}/></button>
               </div>
            </div>
         ) : (
            <div className="bg-zinc-900 text-white p-4 rounded-2xl rounded-br-none shadow-2xl mb-4 max-w-xs relative border border-[#23a9dc]/50 pointer-events-none">
               <p className="text-xs font-black leading-relaxed">Salut ! Moi c'est Lika. Une question sur l'offre OnyxPub ?</p>
               <div className="absolute -bottom-2 right-4 w-4 h-4 bg-zinc-900 border-b border-r border-[#23a9dc]/50 transform rotate-45"></div>
            </div>
         )}
         
         {!isLikaChatOpen && (
           <button onClick={() => setIsLikaChatOpen(true)} className="lika-float relative group pointer-events-auto cursor-pointer focus:outline-none">
             <img src="/lika-avatar.png" alt="Lika" onError={(e: any) => e.target.src = 'https://i.ibb.co/B5HhnTjw/La-mascotte-LIKA-202604121725.jpg'} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#23a9dc] shadow-[0_0_25px_rgba(35,169,220,0.5)] object-cover group-hover:scale-110 transition-transform bg-zinc-900" />
             <div className="absolute top-1 right-1 bg-red-500 w-5 h-5 rounded-full border-2 border-black animate-pulse shadow-md flex items-center justify-center">
                <MessageSquare size={10} className="text-white" />
             </div>
           </button>
         )}
      </div>

    </main>
  );
}
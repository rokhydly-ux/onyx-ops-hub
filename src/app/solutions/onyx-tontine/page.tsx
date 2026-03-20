"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, Smartphone, Users, Sparkles, X, ShieldCheck, PlayCircle, BookX, CheckCircle, ChevronRight, ChevronLeft, Send, ChevronDown, Star, ArrowUp, MessageSquare } from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

const URL_IMAGE_ETAPE_1 = "https://i.ibb.co/Y79tQ2yH/W1.png";
const URL_IMAGE_ETAPE_2 = "https://i.ibb.co/YTWMH9vd/W2.png";
const URL_IMAGE_ETAPE_3 = "https://i.ibb.co/gL4wxzTr/W3.png";
const URL_IMAGE_AVANT = "https://i.ibb.co/5XY2vs7Y/A1.png";
const URL_IMAGE_APRES = "https://i.ibb.co/rRBM6bmV/T1.png"; // Image de la section "Avec Onyx Tontine"
const URL_AUDIO_VOICE_NOTE = "https://www.w3schools.com/html/horse.ogg"; // ⚠️ Remplace par ta vraie note vocale (.mp3 ou .ogg)
const URL_IMAGE_BOT_RESPONSE = "URL_IMAGE_BOT_RESPONSE"; // Remplace par l'URL de ton image explicative
const URL_VIDEO_EXPLICATIVE = "https://www.youtube.com/embed/acFsObjm2E0"; // ⚠️ Remplace par ton vrai lien YouTube (format embed)

const TONTINE_REVIEWS = [
  { name: "Aïssatou Diop", role: "Présidente de Mutuelle", text: "Depuis qu'on utilise Onyx Tontine, il n'y a plus aucune dispute. Tout le monde reçoit le rappel et paie par Wave. Un soulagement total !", rating: 5, img: "https://ui-avatars.com/api/?name=Aissatou+D&background=000&color=39FF14" },
  { name: "Fatou Ndiaye", role: "Gérante de Tontine Familiale", text: "Le tirage au sort animé est génial ! Je l'envoie dans le groupe WhatsApp et tout le monde voit que c'est 100% transparent. Fini les suspicions.", rating: 5, img: "https://ui-avatars.com/api/?name=Fatou+N&background=000&color=39FF14" },
  { name: "Ousmane Fall", role: "Membre d'un groupe", text: "Je n'ai même pas eu besoin de télécharger d'application. Je reçois mon message le 5 du mois, je clique, je paie. Super simple.", rating: 5, img: "https://ui-avatars.com/api/?name=Ousmane+F&background=000&color=39FF14" },
  { name: "Mariama Sy", role: "Secrétaire de Tontine", text: "Avant je courais derrière les retardataires. Maintenant Fanta (le bot) s'occupe des relances, c'est la paix !", rating: 5, img: "https://ui-avatars.com/api/?name=Mariama+S&background=000&color=39FF14" },
  { name: "Cheikh Tidiane", role: "Gérant", text: "Les paiements par Wave s'enregistrent tout seuls. Le premier mois gratuit m'a convaincu et depuis on ne le quitte plus.", rating: 5, img: "https://ui-avatars.com/api/?name=Cheikh+T&background=000&color=39FF14" }
];

const WORKFLOW_STEPS = [
  {
    id: 0,
    title: "Importez vos membres",
    tag: "Zéro mot de passe",
    desc: "📲 Ajoute juste les numéros de tes membres.\n👵🏾 Tes tantes et amis n'ont RIEN à télécharger.\n⚡ Le groupe de tontine est créé en 1 minute chrono.",
    icon: Users,
    img: URL_IMAGE_ETAPE_1
  },
  {
    id: 1,
    title: "Relances Automatiques",
    tag: "Le 5 du mois",
    desc: "🤖 L'appli envoie un rappel WhatsApp poli et automatique.\n💸 Fini la honte de devoir réclamer ton argent (Faye ma sama xaliss).\n💳 Paiement direct par Wave en un clic depuis le message.",
    icon: MessageSquare,
    img: URL_IMAGE_ETAPE_2
  },
  {
    id: 2,
    title: "Tirage au sort animé",
    tag: "Transparent (Leer nañ)",
    desc: "🎲 Un tirage au sort automatique et impartial.\n🎥 Une petite vidéo est envoyée dans le groupe WhatsApp.\n✅ Tout le monde voit qui gagne : zéro triche, confiance totale.",
    icon: Sparkles,
    img: URL_IMAGE_ETAPE_3
  }
];

export default function OnyxTontineLanding() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Navigation & UI
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Configuration Bot Fanta (FAQ Auto)
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [userReply, setUserReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botMessages, setBotMessages] = useState<any[]>([
    { 
      sender: 'bot', 
      text: "👋 Nanga def ! Je suis Fanta. Avez-vous des questions sur Onyx Tontine ? (ex: prix, sécurité, fonctionnement...)",
      options: ["Oui", "Non"],
      audioUrl: URL_AUDIO_VOICE_NOTE
    }
  ]);

  // Rotation Témoignages
  const [reviewIndex, setReviewIndex] = useState(0);

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
    const timer = setTimeout(() => {
      setIsBotOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Rotation Testimonials automatique
  useEffect(() => {
    const reviewInterval = setInterval(() => {
      setReviewIndex((prev) => (prev + 1) % TONTINE_REVIEWS.length);
    }, 4500);
    return () => clearInterval(reviewInterval);
  }, []);

  useEffect(() => {
    if (showLeadModal || selectedStep !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showLeadModal, selectedStep]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages]);

  const processBotReply = (reply: string) => {
    if(!reply.trim()) return;
    const newMsgs = [...botMessages, { sender: 'client', text: reply }];
    setBotMessages(newMsgs);
    setUserReply("");

    // Détection FAQ
    setTimeout(async () => {
        const lowerReply = reply.toLowerCase();
        let botResponse = "";
        let botAudio = "";
        let botImage = "";
        let botPaymentUrl = "";
        let botVideoUrl = "";
        let botOptions: string[] | undefined = undefined;

        if (lowerReply === "oui") {
            botResponse = "Je vous écoute ! Vous pouvez me poser vos questions sur le prix, la sécurité, ou le fonctionnement de l'application.";
        } else if (lowerReply === "non") {
            botResponse = "Très bien ! N'hésitez pas à cliquer sur le bouton 'Digitaliser ma Tontine' au milieu de la page pour commencer votre essai gratuit.";
        } else if (lowerReply === "non merci") {
            botResponse = "D'accord, je reste à votre disposition si vous avez d'autres questions !";
        } else if (lowerReply === "oui, parler à un conseiller" || lowerReply.includes("conseiller") || lowerReply.includes("humain") || lowerReply.includes("whatsapp")) {
            botResponse = "Je vous redirige vers notre expert sur WhatsApp ! À tout de suite 🚀";
            setTimeout(() => {
                window.open(`https://wa.me/221785338417?text=${encodeURIComponent("Bonjour l'équipe Onyx ! Je suis sur la page Onyx Tontine et j'aimerais parler à un conseiller.")}`, '_blank');
            }, 1000);
        } else if (lowerReply.includes("prix") || lowerReply.includes("coût") || lowerReply.includes("tarif") || lowerReply.includes("combien")) {
            botResponse = "Onyx Tontine coûte seulement 6 900 F/mois pour tout le groupe, peu importe le nombre de membres. C'est sans engagement !";
        } else if (lowerReply.includes("sécurité") || lowerReply.includes("confiance") || lowerReply.includes("vol") || lowerReply.includes("arnaque")) {
            botResponse = "La sécurité est notre priorité absolue. L'argent est tracé, les paiements se font par Wave, et notre système de tirage au sort animé est 100% transparent.";
        } else if (lowerReply.includes("compte") || lowerReply.includes("télécharger") || lowerReply.includes("application") || lowerReply.includes("comment")) {
            botResponse = "C'est très simple : ajoutez vos membres avec leur numéro WhatsApp. Ils n'ont rien à télécharger ni de mot de passe à créer ! Le système les relance automatiquement le 5 du mois.";
        } else if (lowerReply.includes("paiement") || lowerReply.includes("payer") || lowerReply.includes("wave") || lowerReply.includes("orange money") || lowerReply.includes("moyen")) {
            botResponse = "Les membres de votre tontine paient très facilement via Wave ou Orange Money en un clic. Un lien sécurisé est directement intégré dans leur message de relance WhatsApp !";
        } else if (lowerReply.includes("vocal") || lowerReply.includes("audio") || lowerReply.includes("voix")) {
            botResponse = "Voici une petite note vocale pour tout vous expliquer 🎤 :";
            botAudio = URL_AUDIO_VOICE_NOTE;
        } else if (lowerReply.includes("image") || lowerReply.includes("photo") || lowerReply.includes("capture") || lowerReply.includes("exemple")) {
            botResponse = "Voici une image pour vous donner une idée plus claire 📸 :";
            botImage = URL_IMAGE_BOT_RESPONSE;
        } else if (lowerReply.includes("vidéo") || lowerReply.includes("video") || lowerReply.includes("youtube") || lowerReply.includes("démo") || lowerReply.includes("demo")) {
            botResponse = "Voici une courte vidéo de démonstration pour tout vous expliquer en images 🎥 :";
            botVideoUrl = URL_VIDEO_EXPLICATIVE;
        } else if (lowerReply.includes("lien") || lowerReply.includes("payer maintenant") || lowerReply.includes("abonnement") || lowerReply.includes("souscrire")) {
            botResponse = "Parfait ! Voici votre lien pour valider votre espace Tontine. Cliquez ci-dessous pour payer votre accès via Wave :";
            botPaymentUrl = "https://pay.wave.com/m/onyxops"; // À remplacer par ton vrai lien marchand Wave
        } else {
            botResponse = "C'est noté ! Voulez-vous que je vous mette en relation avec un conseiller humain sur WhatsApp pour en discuter ?";
            botOptions = ["Oui, parler à un conseiller", "Non merci"];
        }

        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, audioUrl: botAudio || undefined, imageUrl: botImage || undefined, paymentUrl: botPaymentUrl || undefined, videoUrl: botVideoUrl || undefined, options: botOptions }]);

        // Enregistrement silencieux de la question dans Supabase
        try {
            await supabase.from('leads').insert([{
                full_name: 'Visiteur Tontine',
                intent: 'Question Bot Tontine',
                source: 'Bot Fanta FAQ',
                message: reply,
                status: 'Nouveau'
            }]);
        } catch (err) {
            console.error("Erreur enregistrement question:", err);
        }
    }, 1000);
  };

  const saveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert([{
        full_name: leadData.name,
        phone: leadData.phone,
        intent: 'Création Onyx Tontine',
        source: 'Landing Page Tontine (Light)',
        status: 'Nouveau',
        password: 'central2026'
      }]);
      
      if (error) console.error(error);
      
      // FB Pixel Track Lead : Informe Facebook qu'un prospect a été capturé
      if (typeof window !== 'undefined' && (window as any).fbq) {
         (window as any).fbq('track', 'Lead');
      }
      
      const msg = `Bonjour l'équipe Onyx ! Je suis ${leadData.name}. Je veux digitaliser mon groupe de Tontine pour arrêter de courir après l'argent.`;
      window.open(`https://wa.me/221785338417?text=${encodeURIComponent(msg)}`, '_blank');
      
      setShowLeadModal(false);
      setSelectedStep(null);
      setLeadData({ name: "", phone: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => setSelectedStep(prev => prev !== null && prev < WORKFLOW_STEPS.length - 1 ? prev + 1 : prev);
  const handlePrev = () => setSelectedStep(prev => prev !== null && prev > 0 ? prev - 1 : prev);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-[#39FF14]/30 pb-24">

      {/* CSS Animation Glitch Button */}
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
          0% { text-shadow: 2px 0 #39FF14, -2px 0 #ff00ff; }
          25% { text-shadow: -2px 0 #39FF14, 2px 0 #ff00ff; }
          50% { text-shadow: 2px 0 #ff00ff, -2px 0 #39FF14; }
          75% { text-shadow: -2px 0 #ff00ff, 2px 0 #39FF14; }
          100% { text-shadow: 2px 0 #39FF14, -2px 0 #ff00ff; }
        }
        @keyframes float-neon {
          0% { transform: translateY(0px); box-shadow: 0 0 30px rgba(57,255,20,0.4); }
          50% { transform: translateY(-12px); box-shadow: 0 0 70px rgba(57,255,20,0.8); }
          100% { transform: translateY(0px); box-shadow: 0 0 30px rgba(57,255,20,0.4); }
        }
        .animate-float-neon {
          animation: float-neon 4s ease-in-out infinite;
        }
      `}} />

      {/* BANNIÈRE PROMO HAUT DE PAGE */}
      <div className="bg-[#39FF14] text-black text-center py-2.5 px-4 font-black uppercase text-[10px] md:text-xs tracking-widest z-50 relative shadow-md">
          🎁 Créez votre groupe aujourd'hui : Le 1er mois d'utilisation est 100% Gratuit !
      </div>

      {/* Navbar */}
      <nav className="p-6 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => window.location.href = '/'} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-black hover:scale-105 transition-transform`}>
            ONYX<span className="text-[#39FF14] drop-shadow-sm">TONTINE</span>
         </button>
         
         <div className="flex items-center gap-4">
             <div className="relative" ref={dropdownRef}>
                 <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-black flex items-center gap-1 transition-colors">
                    Autres Solutions <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`absolute top-full right-0 mt-2 bg-white border border-zinc-200 shadow-xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <button onClick={() => window.location.href = '/'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🏠 Accueil Onyx</button>
                    <button onClick={() => window.location.href = '/jaay'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🛍️ Onyx Jaay</button>
                    <button onClick={() => window.location.href = '/tiak'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🚚 Onyx Tiak</button>
                    <button onClick={() => window.location.href = '/menu'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🍽️ Onyx Menu</button>
                 </div>
             </div>
             <button onClick={() => window.location.href = '/'} className="bg-zinc-100 text-black px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-black hover:text-[#39FF14] transition-colors flex items-center gap-1">
                 <ChevronLeft size={14}/> Accueil
             </button>
         </div>
      </nav>

      {/* Section A : Hero */}
      <section className="pt-16 pb-20 px-6 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 text-zinc-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></span> Fini les relances gênantes sur WhatsApp (Faye ma sama xaliss)
         </div>
         <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.05] mb-6 text-black`}>
            Jetez votre cahier. <br/>
            Onyx encaisse et relance <br/>
            <span className="text-[#39FF14] drop-shadow-sm">votre Tontine</span> pour vous.
         </h1>
         <p className="text-zinc-600 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Gagnez du temps, sécurisez l'argent et ramenez la confiance dans votre groupe. Xaliss bi dafay leer ! 100% digital, zéro mot de passe.
         </p>
         <button onClick={() => setShowLeadModal(true)} className="glitch-hover bg-[#39FF14] text-black px-10 py-5 rounded-[2rem] font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_15px_30px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3 mx-auto border-2 border-black/5">
            <span className="glitch-text">Digitaliser ma Tontine</span> <ArrowRight size={24}/>
         </button>
         <p className="mt-6 text-xs md:text-sm font-black uppercase tracking-widest text-zinc-500">
            🎁 Le premier mois est <span className="text-[#39FF14] bg-black px-2 py-1 rounded-md shadow-sm">100% Gratuit</span>
         </p>
      </section>

      {/* Section B : Problème/Solution (Avant/Après) */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
         <div className="grid md:grid-cols-2 gap-8">
            {/* AVANT */}
            <div className="bg-white border border-red-100 rounded-[3rem] p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>
               <div className="w-full aspect-video bg-zinc-100 rounded-2xl mb-6 overflow-hidden border border-zinc-200">
                  <img src={URL_IMAGE_AVANT} alt="Le problème (Avant)" className="w-full h-full object-cover" />
               </div>
               <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 text-black`}>Le Cahier (Avant)</h3>
               <ul className="space-y-4 text-zinc-600 font-bold w-full text-left">
                  <li className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl"><X className="text-red-500 shrink-0" /> Vous courez après l'argent (Faye ma sama xaliss)</li>
                  <li className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl"><X className="text-red-500 shrink-0" /> Disputes constantes sur les retards</li>
                  <li className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl"><X className="text-red-500 shrink-0" /> Cahier perdu ou calculs compliqués</li>
               </ul>
            </div>

            {/* APRÈS */}
            <div className="bg-black border-2 border-[#39FF14] rounded-[3rem] p-8 flex flex-col items-center text-center relative overflow-hidden animate-float-neon md:-translate-y-4 shadow-[0_0_50px_rgba(57,255,20,0.4)]">
               <div className="absolute top-0 left-0 right-0 h-2 bg-[#39FF14]"></div>
               <div className="absolute inset-0 bg-gradient-to-br from-[#39FF14]/20 to-transparent pointer-events-none"></div>
               <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#39FF14] opacity-30 blur-[60px] rounded-full animate-pulse"></div>
               <div className="w-full aspect-video bg-zinc-800 rounded-2xl mb-6 overflow-hidden relative z-10 border border-[#39FF14]/30">
                  <img src={URL_IMAGE_APRES} alt="La solution (Après)" className="w-full h-full object-cover" />
               </div>
               <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 text-white relative z-10`}>Avec Onyx Tontine</h3>
               <ul className="space-y-4 text-white font-bold w-full text-left relative z-10">
                  <li className="flex items-center gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800"><CheckCircle className="text-[#39FF14] shrink-0" /> L'appli relance sur WhatsApp</li>
                  <li className="flex items-center gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800"><CheckCircle className="text-[#39FF14] shrink-0" /> Les membres paient par Wave en 1 clic</li>
                  <li className="flex items-center gap-3 bg-zinc-900 p-4 rounded-2xl border border-zinc-800"><CheckCircle className="text-[#39FF14] shrink-0" /> Tirage au sort animé et transparent</li>
               </ul>
            </div>
         </div>
      </section>

      {/* Section C : Workflow (Les 3 Étapes) */}
      <section className="py-24 px-6 overflow-hidden max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>Le workflow <span className="text-[#39FF14] drop-shadow-sm">parfait</span>.</h2>
            <p className="text-zinc-600 font-bold">Un processus fluide conçu pour la confiance.</p>
         </div>

         {/* Conteneur scrollable / swipeable sur mobile */}
         <div className="flex overflow-x-auto snap-x custom-scrollbar gap-6 pb-8 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3">
            {WORKFLOW_STEPS.map((step) => (
               <div 
                  key={step.id} 
                  onClick={() => setSelectedStep(step.id)} 
                  className="snap-center shrink-0 w-[85%] md:w-auto bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-[#39FF14] transition-all cursor-pointer group flex flex-col"
               >
                  <div className="bg-zinc-100 w-full aspect-[4/5] rounded-[1.5rem] mb-6 overflow-hidden relative">
                     {/* IMAGE PLACEHOLDER - L'image IA viendra ici */}
                     <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-white text-black px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                           Voir en détail
                        </div>
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col text-center">
                     <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase leading-tight mb-2 text-black`}>{step.title}</h3>
                     <p className="text-zinc-500 font-black text-[10px] uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full mx-auto w-max">{step.tag}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* Section C2 : Avis Clients */}
      <section className="py-20 bg-white border-t border-zinc-200">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>Ils ont digitalisé <span className="text-[#39FF14] drop-shadow-sm">leur groupe</span></h2>
               <p className="text-zinc-600 font-bold">Fini les disputes, place à la confiance totale.</p>
            </div>
            <div className="flex justify-center min-h-[280px]">
               <div key={`testimony-${reviewIndex}`} className="bg-zinc-50 border border-zinc-200 p-8 md:p-10 rounded-[3rem] shadow-xl max-w-3xl w-full animate-in slide-in-from-right-8 duration-500 flex flex-col">
                  <div className="flex justify-center gap-1 mb-6">
                     {[...Array(TONTINE_REVIEWS[reviewIndex].rating)].map((_, i) => <Star key={i} size={24} className="text-[#39FF14] fill-[#39FF14]" />)}
                  </div>
                  <p className="text-zinc-800 text-lg md:text-2xl italic font-black mb-8 leading-relaxed text-center flex-1">"{TONTINE_REVIEWS[reviewIndex].text}"</p>
                  <div className="flex flex-col items-center gap-3">
                     <img src={TONTINE_REVIEWS[reviewIndex].img} alt="Avatar" className="w-14 h-14 rounded-full border-4 border-[#39FF14] shadow-md" />
                     <div className="text-center">
                        <p className="font-black uppercase text-base text-black">{TONTINE_REVIEWS[reviewIndex].name}</p>
                        <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">{TONTINE_REVIEWS[reviewIndex].role}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* SECTION D : MODALE DE DÉTAILS WORKFLOW */}
      {selectedStep !== null && (
        <div id="modal-overlay" className="fixed inset-0 z-[200] bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={(e) => { if ((e.target as any).id === "modal-overlay") setSelectedStep(null); }}>
          <div className="bg-white rounded-[3rem] w-full max-w-md p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedStep(null)} className="absolute top-4 right-4 bg-zinc-100 p-2 rounded-full hover:bg-black hover:text-white transition z-10"><X size={20}/></button>
            
            <div className="w-full aspect-video bg-zinc-100 rounded-[2rem] overflow-hidden mb-6 shrink-0 relative mt-4">
               <img src={WORKFLOW_STEPS[selectedStep].img} alt={WORKFLOW_STEPS[selectedStep].title} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 mb-6 text-center">
               <span className="text-[#39FF14] bg-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 inline-block">{WORKFLOW_STEPS[selectedStep].tag}</span>
               <h3 className={`${spaceGrotesk.className} text-xl md:text-2xl font-black uppercase mb-6 text-black flex items-center justify-center gap-3`}>
                   <div className="bg-black text-[#39FF14] p-2 rounded-xl shadow-md">
                      {React.createElement(WORKFLOW_STEPS[selectedStep].icon, { size: 24 })}
                   </div>
                   {WORKFLOW_STEPS[selectedStep].title}
               </h3>
               <div className="text-zinc-700 font-bold leading-relaxed bg-zinc-50 p-5 rounded-2xl border border-zinc-200 text-sm md:text-base text-left flex flex-col gap-3">
                   {WORKFLOW_STEPS[selectedStep].desc.split('\n').map((line, idx) => (
                       <p key={idx} className="flex items-start gap-2">{line}</p>
                   ))}
               </div>
            </div>
            
            <div className="flex items-center justify-between gap-4 mt-auto pt-2">
               <button onClick={handlePrev} disabled={selectedStep === 0} className="p-4 bg-zinc-100 rounded-2xl hover:bg-zinc-200 disabled:opacity-50 transition shrink-0"><ChevronLeft size={20}/></button>
               <button onClick={() => { setSelectedStep(null); setShowLeadModal(true); }} className="flex-1 bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs hover:scale-105 transition shadow-xl truncate px-2">
                  Ouvrir ma Tontine
               </button>
               <button onClick={handleNext} disabled={selectedStep === WORKFLOW_STEPS.length - 1} className="p-4 bg-zinc-100 rounded-2xl hover:bg-zinc-200 disabled:opacity-50 transition shrink-0"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
      )}

      {/* BOT FANTA FAQ */}
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
                         {msg.audioUrl && (
                            <div className="mt-3 w-full max-w-[220px] rounded-[2rem] shadow-[0_0_15px_rgba(57,255,20,0.6)] animate-pulse border-2 border-[#39FF14] p-1 bg-black/50">
                               <audio controls className="w-full h-10">
                                  <source src={msg.audioUrl} type="audio/mpeg" />
                               </audio>
                            </div>
                         )}
                         {msg.imageUrl && (
                            <div className="mt-3 w-full rounded-xl overflow-hidden border border-zinc-200 shadow-sm">
                               <img src={msg.imageUrl} alt="Illustration Fanta" className="w-full h-auto object-cover" />
                            </div>
                         )}
                         {msg.videoUrl && (
                            <div className="mt-3 w-full aspect-video rounded-xl overflow-hidden border border-zinc-200 shadow-sm bg-black">
                               <iframe 
                                 src={msg.videoUrl} 
                                 title="Vidéo YouTube"
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                 allowFullScreen
                                 className="w-full h-full border-0"
                               ></iframe>
                            </div>
                         )}
                         {msg.paymentUrl && (
                            <a href={msg.paymentUrl} target="_blank" rel="noopener noreferrer" className="mt-3 w-full bg-[#1eb2e8] text-white px-4 py-3 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 shadow-md hover:scale-105 transition-transform">
                               <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm9rYPURKIok7K0ZF22oqFgMbzIHgNCauVQA&s" alt="Wave" className="h-4 rounded-sm object-contain" />
                               Payer avec Wave (6 900 F)
                            </a>
                         )}
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

      {/* Section E : Modal Lead Capture (CRM Integration) */}
      {showLeadModal && (
        <div id="modal-overlay" className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md animate-in fade-in" onClick={(e) => { if ((e.target as any).id === "modal-overlay") setShowLeadModal(false); }}>
          <div className="bg-white border border-zinc-200 p-8 md:p-12 rounded-[3rem] w-full max-w-md relative shadow-2xl animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowLeadModal(false)} className="absolute top-6 right-6 text-zinc-400 bg-zinc-100 p-2 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
            
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-[#39FF14] mb-6 shadow-lg">
               <ShieldCheck size={32} />
            </div>
            
            <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-2 text-black`}>Créer ma tontine</h3>
            <p className="text-sm text-zinc-500 font-medium mb-8">Laissez-nous vos coordonnées, notre équipe va configurer votre espace avec vous directement sur WhatsApp.</p>
            
            <form onSubmit={saveLead} className="space-y-4">
               <input type="text" required placeholder="Votre Prénom *" value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-black outline-none focus:border-black transition font-bold" />
               <input type="tel" required placeholder="Numéro WhatsApp *" value={leadData.phone} onChange={e => setLeadData({...leadData, phone: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-black outline-none focus:border-black transition font-bold" />
               <button disabled={isSubmitting} type="submit" className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-sm mt-4 hover:bg-black hover:text-[#39FF14] transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                  {isSubmitting ? '...' : 'Valider & Continuer sur WhatsApp'}
               </button>
            </form>
          </div>
        </div>
      )}

      {/* BOUTON REMONTER EN HAUT */}
      {showScrollTop && (
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="fixed bottom-24 left-6 z-[90] bg-white text-black p-3 md:p-4 rounded-full shadow-2xl border border-zinc-200 hover:scale-110 hover:border-black transition-all animate-in fade-in slide-in-from-bottom-4"
         >
           <ArrowUp size={24} />
         </button>
      )}

      {/* Section F : Appel à l'action final (Sticky bottom bar) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className="font-black text-sm md:text-base text-black">6 900 F<span className="text-zinc-500 text-xs font-bold">/mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">Pour tout le groupe. <span className="text-black bg-[#39FF14] px-1.5 py-0.5 rounded shadow-sm">1er MOIS GRATUIT</span></p>
             </div>
             <button onClick={() => setShowLeadModal(true)} className="bg-black text-[#39FF14] px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-lg shadow-black/20">
                Créer ma Tontine
             </button>
          </div>
      </div>
    </div>
  );
}
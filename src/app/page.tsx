"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Space_Grotesk, Inter } from "next/font/google";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, ShieldCheck, TrendingUp, Users, Target, 
  Zap, CheckCircle2, AlertCircle, Lock, Handshake, Package, Info, X,
  MapPin, Clock, Mail, LifeBuoy, Menu, ChevronRight, Star, MessageSquare, Flame, PlayCircle, Share2, LayoutDashboard, Link, Copy, Download, Wallet, Check, Send
} from "lucide-react";

type PlanKey = "solo" | "trio" | "full" | "premium";

const PLAN_DETAILS: Record<PlanKey, { title: string; desc: string; benefits: string[]; why: string; cible: string; avantage: string; chiffreCle: string }> = {
  solo: {
    title: "Onyx Solo : L'essentiel WhatsApp",
    desc: "Digitalisez votre boutique en 24h. Idéal pour transformer vos discussions WhatsApp en commandes réelles et devis professionnels sans effort manuel.",
    benefits: ["Catalogue interactif & Devis en un clic", "Lien de commande unique", "Fidélisation client automatique"],
    why: "Choisissez Solo pour gagner 2h par jour et ne plus jamais rater une vente parce que vous étiez 'occupé'.",
    cible: "Vendeurs Instagram / WhatsApp & Prestataires",
    avantage: "Fini les envois manuels de photos et devis raturés.",
    chiffreCle: "+15% de ventes via catalogue pro.",
  },
  trio: {
    title: "Pack Trio : Le Contrôle Total",
    desc: "Le combo gagnant : Vente + Stock + Logistique (Tiak). Connectez vos opérations pour éviter les fuites de cash et les pertes de produits.",
    benefits: ["Inventaire en temps réel", "Catalogue, Devis & Facturation pro", "Suivi logistique des livreurs"],
    why: "C'est le pack 'Sérénité'. Vous savez exactement ce qui sort de votre boutique, ce qui est en livraison et ce qui entre en caisse.",
    cible: "Boutiques, Grossistes et Prestataires",
    avantage: "Maîtrise totale du stock, des ventes et livraisons.",
    chiffreCle: "0 rupture de stock, 100% traçabilité.",
  },
  full: {
    title: "Pack Full : L'Ecosystème Complet",
    desc: "Les 6 SaaS Onyx travaillent ensemble pour votre succès. Une gestion digne d'une multinationale sur votre simple smartphone.",
    benefits: ["RH, Paie & Logistique intégrés", "Menu QR & Réservations avec acompte", "Rapports de performance hebdomadaires"],
    why: "Pour l'entrepreneur qui veut scaler. Automatisez tout et concentrez-vous sur votre stratégie de croissance.",
    cible: "PME, Agences & Restaurants",
    avantage: "Digitalisation complète 360°.",
    chiffreCle: "Gagnez 10h/semaine de gestion.",
  },
  premium: {
    title: "Onyx Premium : L'Elite Business",
    desc: "Puissance maximale. Intégrez l'Intelligence Artificielle et le marketing de données pour doubler votre chiffre d'affaires.",
    benefits: ["Studio Créatif IA (Visuels & Textes)", "CRM & Relance Client automatique", "Conseiller stratégique dédié"],
    why: "Le choix des leaders. Ne vous contentez pas de gérer, dominez votre secteur avec les meilleurs outils du monde.",
    cible: "PME & Franchises",
    avantage: "IA et CRM pour dominer le marché.",
    chiffreCle: "Croissance X2 avec le marketing data.",
  },
};

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

const SOLUTIONS = [
  { id: "Onyx Vente", icon: Smartphone, pain: "Photos WhatsApp interminables et devis gribouillés sur papier.", solution: "Catalogue digital interactif et générateur de devis PDF pro en 60s.", upsellPack: "trio", upsellName: "Pack Trio", upsellPrice: "17.500F", upsellBenefit: "Associez vos ventes à votre stock en temps réel pour 0 rupture." },
  { id: "Onyx Tiak", icon: Truck, pain: "Le gérant ne sait jamais où est son cash ou son livreur.", solution: "Suivi logistique et sécurisation des encaissements en temps réel.", upsellPack: "trio", upsellName: "Pack Trio", upsellPrice: "17.500F", upsellBenefit: "Gérez livreurs, stocks et ventes dans une seule application unifiée." },
  { id: "Onyx Stock", icon: Box, pain: "Rupture de stock fatale ou vols d'inventaire non détectés.", solution: "Inventaire par scan et alertes WhatsApp avant la rupture.", upsellPack: "trio", upsellName: "Pack Trio", upsellPrice: "17.500F", upsellBenefit: "Sécurisez la caisse : tout ce qui sort du stock doit être facturé." },
  { id: "Onyx Menu", icon: Utensils, pain: "Menus sales, chers à imprimer et erreurs de commande en salle.", solution: "QR Menu interactif : le client scanne et commande proprement.", upsellPack: "full", upsellName: "Pack Full", upsellPrice: "30.000F", upsellBenefit: "Digitalisez tout le resto : Menu, Réservations, Logistique et Employés." },
  { id: "Onyx Booking", icon: Calendar, pain: "Rendez-vous manqués (No-shows) et planning brouillon.", solution: "Réservations en ligne avec paiement d'acompte sécurisé.", upsellPack: "full", upsellName: "Pack Full", upsellPrice: "30.000F", upsellBenefit: "Le Full inclut la gestion de votre staff et de vos ventes en plus." },
  { id: "Onyx Staff", icon: Users, pain: "Casse-tête des avances Tabaski, fiches de paie et pointages frauduleux.", solution: "Pointage GPS WhatsApp, fiches de paie par QR Code et gestion lissée des avances.", upsellPack: "full", upsellName: "Pack Full", upsellPrice: "30.000F", upsellBenefit: "Gérez vos employés ET les finances de votre entreprise de A à Z." },
];

const PACKS: Array<{ id: PlanKey; name: string; price: number; label: string; rating: string; avis: number }> = [
  { id: "solo", name: "Solo", price: 7500, label: "Onyx Solo", rating: "4.9/5", avis: 142 },
  { id: "trio", name: "Pack Trio", price: 17500, label: "Pack Trio", rating: "5.0/5", avis: 89 },
  { id: "full", name: "Pack Full", price: 30000, label: "Pack Full", rating: "4.9/5", avis: 215 },
  { id: "premium", name: "Premium", price: 75000, label: "Onyx Premium", rating: "5.0/5", avis: 34 },
];

// GÉNÉRATEURS ALÉATOIRES INFINIS
const NAMES = ["Fatou B.", "Moussa D.", "Awa N.", "Ousmane F.", "Aminata L.", "Seydou K.", "Alioune M.", "Khadija T.", "Cheikh S.", "Mamadou N.", "Mariama D.", "Ibrahima C."];
const BUSINESSES = ["(Boutique)", "(Restaurant)", "(Cosmétiques)", "(Entreprise BTP)", "(Institut)", "(Fast-Food)", "(Matériel)", "(Agence)"];
const ACTIONS = ["vient de générer un devis via Onyx Vente", "a activé le Menu QR", "a enregistré son 1er paiement YAS", "vient de valider le pointage GPS de ses ouvriers", "a reçu 3 réservations d'acompte", "a choisi le Pack Full", "a reçu 14 commandes via Onyx", "vient de faire son inventaire par scan"];
const TIMES = ["à l'instant", "il y a 2 min", "il y a 5 min", "il y a 8 min", "il y a 12 min", "il y a 15 min"];
const PAYOUTS = ["45.000F", "12.500F", "150.000F", "8.000F", "37.500F", "22.000F", "90.000F", "210.000F"];

const getRandomItem = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];

const generateRandomProof = () => ({
  name: `${getRandomItem(NAMES)} ${getRandomItem(BUSINESSES)}`,
  action: getRandomItem(ACTIONS),
  time: getRandomItem(TIMES)
});

const generateRandomPayout = () => ({
  name: getRandomItem(NAMES),
  amount: getRandomItem(PAYOUTS),
  time: getRandomItem(TIMES)
});

const RANDOM_SCENARIOS = [
  { avant: { phone: "+221 77 000 00 00", text: "C'est quoi l'avance Tabaski de Modou déjà ? Et il a pointé hier au chantier ?", tag: "RH", issue: "Pertes d'argent" }, apres: { tag: "Pointage OK", title: "Ressources Humaines", text: "Modou S. a partagé sa localisation en direct.", sub: "Avance Tabaski déduite : -25.000F" } },
  { avant: { phone: "+221 76 111 11 11", text: "Tu as la taille 42 en stock ? Tu peux me refaire le devis j'ai perdu la feuille !", tag: "Vente", issue: "Temps perdu" }, apres: { tag: "Devis OK", title: "Vente & Stock", text: "Devis #1042 accepté & payé en ligne.", sub: "Stock mis à jour automatiquement." } },
  { avant: { phone: "+221 78 222 22 22", text: "J'attends ma commande depuis 2h, le livreur ne répond pas 😡", tag: "Logistique", issue: "Clients fâchés" }, apres: { tag: "En route", title: "Logistique Tiak", text: "Commande #402 localisée en temps réel.", sub: "Le client suit le livreur sur WhatsApp." } },
  { avant: { phone: "+221 70 333 33 33", text: "Je voulais annuler ma table pour ce soir finalement...", tag: "No-Show", issue: "Table vide" }, apres: { tag: "Acompte Payé", title: "Réservation Onyx", text: "Réservation de 4 places confirmée.", sub: "Acompte de 10.000F sécurisé par Wave." } }
];

export default function OnyxOpsElite() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'home' | 'about' | 'blog' | 'dashboard'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [packCounts, setPackCounts] = useState({ solo: 0, trio: 0, full: 0, premium: 0 });
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  
  // MODALES & SAAS
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);
  const [saasMetier, setSaasMetier] = useState("");
  
  // LOGIQUE USER CONNECTÉ
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // QUIZ & TUNNEL
  const [activeProfiles, setActiveProfiles] = useState<string[]>([]);
  const [premiumStep, setPremiumStep] = useState(0);
  const [premiumScore, setPremiumScore] = useState(0);
  
  // WIDGETS & AUTRES
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [scenarioIndex, setScenarioIndex] = useState(0);

  // BLOG DYNAMIQUE SUPABASE
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  // BOT WHATSAPP
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [chatSimulated, setChatSimulated] = useState(false); 
  const [chatMessages, setChatMessages] = useState([{ sender: 'bot', text: "Bonjour ! Je suis conseiller Onyx. Comment puis-je vous aider pour votre business ?" }]);
  const [userReply, setUserReply] = useState("");

  // WIDGETS PREUVE SOCIALE
  const [currentProof, setCurrentProof] = useState(generateRandomProof());
  const [showProof, setShowProof] = useState(false);
  const [currentPayout, setCurrentPayout] = useState(generateRandomPayout());
  const [showPayout, setShowPayout] = useState(false);

  // WORKFLOW PARTENAIRE
  const [partnerStep, setPartnerStep] = useState<'landing' | 'form' | 'success' | 'dashboard'>('landing');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const waNumber = "221768102039";
  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const openAuthModal = (mode: 'login' | 'signup') => { setAuthMode(mode); setIsAuthModalOpen(true); };
  const openPlanModal = (plan: PlanKey) => (e: React.MouseEvent) => { e.stopPropagation(); setSelectedPlan(plan); };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // FETCH INIT & ARTICLES
  useEffect(() => {
    const initData = async () => {
      // 1. Auth Status
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setCurrentUser({ ...user, ...data });
        if (data?.role === 'admin') setIsAdmin(true);
      }
      
      // 2. Fetch Blog Articles from Supabase
      const { data: dbArticles, error } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (dbArticles && dbArticles.length > 0) {
         setArticles(dbArticles);
      } else {
         console.error("Supabase Articles fetch err:", error);
         setArticles([
            { id: 1, title: "Comment doubler vos ventes WhatsApp en 2026", content: "Au Sénégal, 90% des ventes se font sur WhatsApp...", category: "Social Selling", pack_focus: "Onyx Solo" },
            { id: 2, title: "La fin des fraudes sur les chantiers", content: "Gérer le pointage est un cauchemar...", category: "Gestion d'Équipe", pack_focus: "Pack Full" }
         ]);
      }
    };
    initData();
  }, []);

  // ESC KEY LISTENER
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { 
      if (e.key === "Escape") { setSelectedPlan(null); setSelectedSaaS(null); setIsAuthModalOpen(false); setSelectedArticle(null); setIsBotOpen(false); }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // BODY OVERFLOW FIX
  useEffect(() => {
    if (selectedPlan || selectedSaaS || isMobileMenuOpen || isAuthModalOpen || selectedArticle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [selectedPlan, selectedSaaS, isMobileMenuOpen, isAuthModalOpen, selectedArticle]);

  // SOCIAL PROOF & PAYOUT TIMERS
  useEffect(() => {
    const proofInterval = setInterval(() => {
      setShowProof(false);
      setTimeout(() => { setCurrentProof(generateRandomProof()); setShowProof(true); }, 1000);
    }, 12000);

    const payoutInterval = setInterval(() => {
      setShowPayout(false);
      setTimeout(() => { setCurrentPayout(generateRandomPayout()); setShowPayout(true); }, 1000);
    }, 15000);

    setTimeout(() => setShowProof(true), 4000);
    setTimeout(() => setShowPayout(true), 6000);

    return () => { clearInterval(proofInterval); clearInterval(payoutInterval); };
  }, []);

  // RANDOM SCENARIOS TIMER
  useEffect(() => {
    const interval = setInterval(() => { setScenarioIndex((prev) => (prev + 1) % RANDOM_SCENARIOS.length); }, 4000);
    return () => clearInterval(interval);
  }, []);

  // ROUTAGE INTELLIGENT BOT & ENREGISTREMENT DB
  const handleBotAction = async (msg: string, intent: string) => {
    const currentHour = new Date().getHours();
    const isWorkHour = currentHour >= 9 && currentHour < 18;

    try {
       await supabase.from('leads').insert({ 
         source: isWorkHour ? 'Bot Site (Live)' : 'Bot Site (Hors ligne)', 
         intent: intent,
         status: 'Nouveau'
       });
    } catch(e) { console.error("Erreur insertion lead:", e) }

    if (isWorkHour) {
      setChatSimulated(true);
    } else {
      window.open(getWaLink(msg), "_blank");
      setIsBotOpen(false);
    }
  };

  const sendLiveChat = async () => {
     if(!userReply.trim()) return;
     const newMsg = userReply;
     setChatMessages([...chatMessages, { sender: 'client', text: newMsg }]);
     setUserReply("");
     
     // Sauvegarde dans Supabase si c'est un contact ou lead
     try {
       await supabase.from('leads').insert({ 
         source: 'Live Chat', 
         intent: 'Message Chat',
         contact: newMsg,
         status: 'Interaction'
       });
     } catch(e) {}

     setTimeout(() => {
        setChatMessages(prev => [...prev, { sender: 'bot', text: "Un agent traite votre demande. En attendant, merci de nous laisser votre numéro WhatsApp :" }]);
     }, 2000);
  }

  // SIMULATEUR CALCULS
  const commissionM1 = Math.round(packCounts.solo * 7500 * 0.30 + packCounts.trio * 17500 * 0.30 + packCounts.full * 30000 * 0.30 + packCounts.premium * 75000 * 0.30);
  const recurrentPerMonth = Math.round(packCounts.solo * 7500 * 0.10 + packCounts.trio * 17500 * 0.10 + packCounts.full * 30000 * 0.10 + packCounts.premium * 75000 * 0.10);
  const commissionM6 = commissionM1 + recurrentPerMonth * 5;

  let conseillerText = '"Sélectionnez votre profil à droite, je vous dirai exactement ce qu\'il vous faut pour exploser vos ventes."';
  if (activeProfiles.includes('Premium')) conseillerText = '"Passons aux choses sérieuses. Répondez à ces 3 questions pour voir si vous êtes prêt pour la puissance de l\'IA."';
  else if (activeProfiles.includes('Entreprise / RH')) conseillerText = '"Fini les fiches de paie manuelles et les pointages frauduleux. Sécurisons votre gestion d\'équipe et vos avances Tabaski."';
  else if (activeProfiles.includes('Restaurant')) conseillerText = '"De la commande à la table jusqu\'au livreur, on va structurer tout votre resto. Concentrez-vous sur vos clients."';
  else if (activeProfiles.includes('WhatsApp') && activeProfiles.includes('Boutique')) conseillerText = '"Le combo parfait : on digitalise vos ventes en ligne et on sécurise votre stock physique."';
  else if (activeProfiles.includes('WhatsApp')) conseillerText = '"Fini de scroller pour envoyer des photos. Votre catalogue et vos devis vont vendre pendant que vous dormez."';
  else if (activeProfiles.includes('Boutique')) conseillerText = '"Fini le cahier de brouillon. On va sécuriser votre stock et professionnaliser votre caisse."';

  const navigateTo = (view: 'home' | 'about' | 'blog' | 'dashboard', scrollId?: string) => {
    setIsMobileMenuOpen(false);
    setActiveView(view);
    if (view === 'dashboard' && partnerStep === 'landing') setPartnerStep('landing'); 
    if (scrollId) {
      setTimeout(() => { const element = document.getElementById(scrollId); if (element) element.scrollIntoView({ behavior: 'smooth' }); }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const PaymentMethods = () => (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
      <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Wave_Mobile_Money_logo.png" alt="Wave" className="h-6 md:h-8 object-contain" />
      <img src="https://www.rapyd.net/wp-content/uploads/2025/04/Orange-Money-logo-500x336-1.png" alt="Orange Money" className="h-6 md:h-8 object-contain" />
      <div className="h-6 md:h-8 px-4 bg-black text-white rounded-lg flex items-center justify-center font-black italic text-[10px] md:text-xs tracking-widest shadow-md">
        <span className="text-[#39FF14]">YAS</span> MONEY
      </div>
    </div>
  );

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none print:hidden overflow-x-hidden pt-20 relative`}>
      <style jsx global>{`
        body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        @media print { body { display: none; } }
      `}</style>

      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none bg-zinc-50" style={{ backgroundImage: `url('https://i.ibb.co/chCcXT7p/back-site.png')`, backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

      <div className="relative z-10">
        <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center w-full z-50 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" width={150} height={50} className="h-[40px] w-auto object-contain" unoptimized />
            <span className={`${spaceGrotesk.className} font-bold tracking-tighter text-2xl hidden sm:block`}>ONYX OPS</span>
          </div>
          
          <div className="hidden lg:flex gap-8 font-semibold text-sm uppercase items-center">
            <button onClick={() => navigateTo('home', 'solutions')} className="hover:text-[#39FF14] transition">Solutions</button>
            <button onClick={() => navigateTo('home', 'tarifs')} className="hover:text-[#39FF14] transition">Tarifs</button>
            <button onClick={() => navigateTo('dashboard')} className={`${activeView === 'dashboard' ? 'text-[#39FF14] border-b-2 border-[#39FF14]' : ''} hover:text-[#39FF14] transition py-1`}>Partenaires</button>
            <button onClick={() => navigateTo('blog')} className={`${activeView === 'blog' ? 'text-[#39FF14] border-b-2 border-[#39FF14]' : ''} hover:text-[#39FF14] transition py-1`}>Blog</button>
            <button onClick={() => navigateTo('about')} className={`${activeView === 'about' ? 'text-[#39FF14] border-b-2 border-[#39FF14]' : ''} hover:text-[#39FF14] transition py-1`}>À Propos</button>
            
            {/* LOGIQUE HEADER CONNECTÉ / ADMIN REDIRECT STRICT */}
            {currentUser ? (
               <div 
                 onClick={() => {
                   if(isAdmin) window.location.href = '/admin'; // Ou ton URL absolue https://onyx-ops-hub.vercel.app/admin
                   else router.push('/dashboard');
                 }}
                 className="flex items-center gap-3 cursor-pointer bg-zinc-100 hover:bg-zinc-200 p-1.5 pr-4 rounded-full transition-colors shadow-sm"
               >
                 <img src={currentUser.avatar_url || "https://ui-avatars.com/api/?name=User"} alt="" className="w-8 h-8 rounded-full object-cover" />
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase leading-none">{currentUser.full_name || "Membre Onyx"}</p>
                    <p className="text-[8px] font-bold text-[#39FF14] uppercase">{isAdmin ? 'Accès Admin (Strict)' : 'Accès Hub'}</p>
                 </div>
               </div>
            ) : (
               <button onClick={() => openAuthModal('login')} className="bg-black text-[#39FF14] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition duration-300 shadow-md">
                 Accès Hub
               </button>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-4">
             {currentUser ? (
                <div onClick={() => {
                   if(isAdmin) window.location.href = '/admin';
                   else router.push('/dashboard');
                }} className="flex items-center cursor-pointer">
                   <img src={currentUser.avatar_url || "https://ui-avatars.com/api/?name=User"} alt="" className="w-8 h-8 rounded-full object-cover shadow-sm border border-[#39FF14]" />
                </div>
             ) : (
                <button onClick={() => openAuthModal('login')} className="bg-black text-[#39FF14] px-4 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest">Hub</button>
             )}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2.5 bg-zinc-100 rounded-full text-black">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 lg:hidden animate-in fade-in zoom-in duration-300">
            <button onClick={() => navigateTo('home', 'solutions')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest`}>Solutions</button>
            <button onClick={() => navigateTo('home', 'tarifs')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest`}>Tarifs</button>
            <button onClick={() => navigateTo('dashboard')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest ${activeView === 'dashboard' ? 'text-[#39FF14]' : ''}`}>Partenaires</button>
            <button onClick={() => navigateTo('blog')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest ${activeView === 'blog' ? 'text-[#39FF14]' : ''}`}>Blog</button>
            <button onClick={() => navigateTo('about')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest ${activeView === 'about' ? 'text-[#39FF14]' : ''}`}>À Propos</button>
            {!currentUser && (
               <button onClick={() => { setIsMobileMenuOpen(false); openAuthModal('login'); }} className="mt-8 bg-[#39FF14] text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl">Se Connecter</button>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VUE : PAGE D'ACCUEIL                                               */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'home' && (
          <div className="animate-in fade-in duration-500">
            <header className="pt-20 pb-12 px-6 text-center max-w-5xl mx-auto">
              <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] mb-8`}>
                <Zap className="w-3 h-3 text-[#39FF14] fill-[#39FF14]" /> DAKAR BUSINESS ECOSYSTEM
              </div>
              <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-bold leading-[1] tracking-tighter mb-6`}>
                DIGITALISEZ VOTRE <br/> <span className="text-[#39FF14] italic">PROPRE EMPIRE.</span>
              </h1>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium mb-10">
                La suite complète d'outils pour les entreprises, PME et commerces du Sénégal. Gérez vos ventes, stocks, employés, devis et livraisons via Whatsapp. 0 Engagement 0 coûts cachés.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-10">
                <button onClick={() => navigateTo('dashboard')} className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#39FF14] hover:text-black transition duration-300 shadow-[0_10px_30px_rgba(57,255,20,0.2)]">
                  <Handshake className="w-5 h-5" /> Devenir Partenaire
                </button>
                <button onClick={() => navigateTo('home', 'solutions')} className="inline-flex items-center gap-2 border-2 border-black text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-black hover:text-[#39FF14] transition duration-300">
                  <Package className="w-5 h-5" /> Découvrir les Solutions
                </button>
              </div>

              <div className="pt-6 border-t border-zinc-200/60 max-w-md mx-auto">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Paiements Locaux Intégrés</p>
                <PaymentMethods />
              </div>
            </header>

            <section className="py-16 px-6 max-w-6xl mx-auto mb-10">
              <div className="text-center mb-12">
                <h2 className={`${spaceGrotesk.className} text-3xl font-bold uppercase`}>Fini le Bricolage. <span className="text-[#39FF14]">Passez au niveau supérieur.</span></h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center h-full">
                <div className="bg-red-50/50 border border-red-100 rounded-[3rem] p-8 h-[350px] flex flex-col relative overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest">Avant Onyx</div>
                  <h3 className="font-black text-red-800 text-xl mb-6">Le Chaos sur WhatsApp</h3>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-red-100 text-sm text-zinc-600 shadow-sm max-w-[85%] animate-in slide-in-from-left-4 fade-in duration-500" key={`avant-${scenarioIndex}`}>
                      <p className="font-bold text-xs text-red-500 mb-2">{RANDOM_SCENARIOS[scenarioIndex].avant.phone}</p>
                      {RANDOM_SCENARIOS[scenarioIndex].avant.text}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-red-200 pt-4 text-xs font-bold text-red-600 uppercase">
                    <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {RANDOM_SCENARIOS[scenarioIndex].avant.issue}</span>
                    <span>Stress : Maximum</span>
                  </div>
                </div>

                <div className="bg-black rounded-[3rem] p-8 h-[350px] flex flex-col relative shadow-[0_15px_40px_rgba(57,255,20,0.15)] border border-[#39FF14]/30 transition-all duration-500">
                  <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest">Avec OnyxOps</div>
                  <h3 className="font-black text-white text-xl mb-6 flex items-center gap-2"><CheckCircle2 className="text-[#39FF14] w-6 h-6"/> L'Automatisation Parfaite</h3>
                  
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl animate-in slide-in-from-right-4 fade-in duration-500 delay-150" key={`apres-${scenarioIndex}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">{RANDOM_SCENARIOS[scenarioIndex].apres.title}</span>
                        <span className="bg-[#39FF14]/20 text-[#39FF14] text-[10px] px-2 py-0.5 rounded-full font-black">{RANDOM_SCENARIOS[scenarioIndex].apres.tag}</span>
                      </div>
                      <p className="text-white text-sm leading-relaxed">{RANDOM_SCENARIOS[scenarioIndex].apres.text}</p>
                      <p className="text-zinc-500 font-medium text-xs mt-2 italic">{RANDOM_SCENARIOS[scenarioIndex].apres.sub}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4 text-xs font-bold text-[#39FF14] uppercase">
                    <span className="flex items-center gap-1"><Zap className="w-4 h-4 fill-[#39FF14]" /> Business sous contrôle</span>
                    <span>Gain de temps : 100%</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="solutions" className="py-20 px-6 max-w-7xl mx-auto">
              <h2 className={`${spaceGrotesk.className} text-3xl font-bold mb-4 text-center`}>NOS 6 SOLUTIONS <span className="text-[#39FF14]">RADICALES</span></h2>
              <p className="text-center text-zinc-500 font-bold text-xs uppercase tracking-widest mb-12">Cliquez sur un outil pour voir s'il est fait pour vous.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SOLUTIONS.map((s, i) => (
                  <div 
                    key={i} 
                    onClick={() => { setSelectedSaaS(s); setSaasMetier(""); }}
                    className="group bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-xl hover:border-[#39FF14] transition-all relative overflow-hidden cursor-pointer active:scale-95"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition">
                      <s.icon className="w-24 h-24" />
                    </div>
                    <div className="bg-black text-[#39FF14] w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                      <s.icon className="w-6 h-6" />
                    </div>
                    <h3 className={`${spaceGrotesk.className} text-xl font-bold mb-4 italic uppercase flex justify-between items-center relative z-10`}>
                      {s.id} 
                      <span className="bg-zinc-100 text-black text-[9px] px-3 py-1 rounded-full not-italic tracking-widest">+ Infos</span>
                    </h3>
                    <div className="space-y-4 relative z-10">
                      <div className="bg-red-50 p-4 rounded-2xl border-l-4 border-red-500">
                        <p className="text-[10px] font-bold text-red-600 uppercase mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> La Douleur</p>
                        <p className="text-xs font-semibold text-zinc-700">{s.pain}</p>
                      </div>
                      <div className="bg-[#39FF14]/5 p-4 rounded-2xl border-l-4 border-[#39FF14]">
                        <p className="text-[10px] font-bold text-[#39FF14] uppercase mb-1 flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Solution Onyx</p>
                        <p className="text-xs font-semibold text-zinc-800">{s.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="tarifs" className="py-20 bg-black text-white rounded-[4rem] mx-4 px-6 relative overflow-hidden">
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-10">
                  <h2 className={`${spaceGrotesk.className} text-4xl font-bold mb-4`}>OFFRES <span className="text-[#39FF14]">NO-LIMIT.</span></h2>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">Pas d'abonnement caché.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {PACKS.map((pack) => {
                    const planDetails = PLAN_DETAILS[pack.id];
                    const packBenefits = planDetails?.benefits || [];
                    
                    return (
                      <div 
                        key={pack.id}
                        className={`${pack.id === 'trio' ? 'bg-gradient-to-br from-[#39FF14]/20 to-black border-2 border-[#39FF14] scale-105 lg:scale-110 shadow-[0_0_50px_rgba(57,255,20,0.2)]' : 'bg-zinc-900/50 border border-white/10 hover:border-zinc-700'} p-8 rounded-[3rem] transition relative group flex flex-col`}
                      >
                        <button type="button" onClick={openPlanModal(pack.id)} className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white text-black flex items-center gap-1.5 hover:bg-zinc-100 transition text-[10px] font-bold uppercase tracking-wider z-20">
                          <Info className="w-3 h-3" /> Infos
                        </button>
                        
                        <p className={`text-[10px] font-black tracking-[0.3em] ${pack.id === 'trio' ? 'text-[#39FF14]' : 'text-zinc-500'} mb-1 uppercase`}>{pack.label}</p>
                        
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                             <Star key={i} className={`w-3 h-3 ${pack.rating.startsWith('5') || i < 4 ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400/30 fill-yellow-400/30'}`} />
                          ))}
                          <span className="text-[9px] text-zinc-400 font-bold ml-1">{pack.rating} ({pack.avis} avis)</span>
                        </div>

                        <div className={`text-3xl lg:text-4xl font-bold mb-6 italic ${pack.id === 'premium' ? 'text-red-500' : 'text-white'}`}>
                          {pack.price.toLocaleString()}F <span className="text-xs text-zinc-500 font-normal">/ mois</span>
                        </div>
                        
                        <ul className={`text-xs space-y-3 mb-8 flex-1 ${pack.id === 'trio' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {packBenefits.map((ben, i) => (
                            <li key={i} className="flex gap-2">✔ {ben}</li>
                          ))}
                        </ul>

                        <button onClick={() => navigateTo('home', 'quiz-section')} className="w-full text-center border border-zinc-700 text-zinc-400 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:border-[#39FF14] hover:text-[#39FF14] transition mb-3 flex items-center justify-center gap-2">
                          <Target className="w-3 h-3"/> Est-ce fait pour moi ?
                        </button>
                        
                        <a href={getWaLink(`Bonjour Onyx, je veux COMMENCER avec l'offre ${pack.label} à ${pack.price.toLocaleString()}F.`)} target="_blank" rel="noopener noreferrer" className={`block text-center py-4 rounded-2xl font-black text-sm transition uppercase tracking-tighter ${pack.id === 'trio' ? 'bg-[#39FF14] text-black hover:bg-white' : pack.id === 'premium' ? 'border-2 border-white/20 text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-[#39FF14]'}`}>
                          {pack.id === 'premium' ? 'Contacter' : 'Commencer'}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section id="quiz-section" className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-100">
              <div className="bg-zinc-50 rounded-[4rem] p-8 md:p-12 grid lg:grid-cols-2 gap-12 items-center shadow-inner border border-zinc-200">
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-200 order-2 lg:order-1">
                  <img src="https://i.ibb.co/bRdvjrhV/ONYX-LOGOS-2.png" alt="Conseillère OnyxOps" className="object-cover w-full h-full" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-3xl border-2 border-[#39FF14] shadow-xl">
                    <p className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-2">
                      <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></span> Conseillère Onyx
                    </p>
                    <p className="text-sm font-bold text-zinc-800 italic">
                      {conseillerText}
                    </p>
                  </div>
                </div>
                
                <div className="order-1 lg:order-2">
                  <h2 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-bold mb-8 uppercase leading-[0.9] tracking-tighter`}>
                    QUELLE OFFRE <br/><span className="text-[#39FF14] italic">POUR VOTRE BUSINESS ?</span>
                  </h2>
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6">Sélectionnez votre profil (Plusieurs choix possibles) :</p>
                  
                  <div className="flex flex-wrap gap-3 mb-10">
                    {[
                      { id: 'WhatsApp', label: 'Vendeur WhatsApp / Insta' },
                      { id: 'Boutique', label: 'Boutique Physique' },
                      { id: 'Restaurant', label: 'Restaurant / PME' },
                      { id: 'Entreprise / RH', label: 'Entreprise (BTP, Agence, Nettoyage)' },
                      { id: 'Premium', label: 'Business à Grande Échelle' }
                    ].map(p => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          if (p.id === 'Premium' || p.id === 'Restaurant' || p.id === 'Entreprise / RH') {
                            setActiveProfiles([p.id]); 
                            setPremiumStep(p.id === 'Premium' ? 1 : 0);
                            setPremiumScore(0);
                          } else {
                            let newP = activeProfiles.filter(x => x !== 'Premium' && x !== 'Restaurant' && x !== 'Entreprise / RH');
                            if (newP.includes(p.id)) newP = newP.filter(x => x !== p.id);
                            else newP.push(p.id);
                            setActiveProfiles(newP);
                            setPremiumStep(0);
                          }
                        }}
                        className={`px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 ${activeProfiles.includes(p.id) ? 'bg-black text-[#39FF14] border-black shadow-lg' : 'bg-white text-zinc-600 border-zinc-200 hover:border-[#39FF14]'}`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-zinc-100 min-h-[250px] flex flex-col justify-center">
                    {activeProfiles.length === 0 && (
                      <div className="text-center text-zinc-400 font-bold text-sm uppercase italic">En attente de votre sélection...</div>
                    )}

                    {activeProfiles.includes('Premium') && premiumStep > 0 && premiumStep < 4 && (
                      <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex gap-1 mb-6">
                          {[1,2,3].map(step => <div key={step} className={`h-1.5 flex-1 rounded-full ${premiumStep >= step ? 'bg-[#39FF14]' : 'bg-zinc-200'}`} />)}
                        </div>
                        <h4 className="font-black text-lg mb-6 leading-tight">
                          {premiumStep === 1 && "Gérez-vous une base clients complexe nécessitant des relances automatisées ?"}
                          {premiumStep === 2 && "Avez-vous besoin de créer du contenu (visuels/textes) massivement pour vos réseaux ?"}
                          {premiumStep === 3 && "Avez-vous plusieurs équipes (Vente, Marketing, Support) à coordonner ?"}
                        </h4>
                        <div className="flex gap-4">
                          <button onClick={() => { setPremiumScore(s => s + 1); setPremiumStep(s => s + 1); }} className="flex-1 bg-black text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-[#39FF14] hover:text-black transition">Oui, absolument</button>
                          <button onClick={() => setPremiumStep(s => s + 1)} className="flex-1 bg-zinc-100 text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 transition">Pas pour l'instant</button>
                        </div>
                      </div>
                    )}

                    {activeProfiles.includes('Premium') && premiumStep === 4 && (
                      <div className="animate-in zoom-in duration-300">
                        <h4 className="font-black text-xl mb-2">{premiumScore >= 2 ? "🎯 Onyx Premium (75.000F)" : "💡 Pack Full (30.000F)"}</h4>
                        <p className="text-sm text-zinc-600 mb-6 font-medium">
                          {premiumScore >= 2 
                            ? "Votre structure exige des outils avancés. Le CRM intégré, le Studio Créatif IA et l'accompagnement dédié du pack Premium vont automatiser votre croissance." 
                            : "Le Pack Premium serait superflu pour l'instant. Le Pack Full (Les 6 SaaS) est parfait pour structurer vos opérations avant de passer à l'IA."}
                        </p>
                        <a href={getWaLink(`Recommandation interactive : Je veux sécuriser le pack ${premiumScore >= 2 ? 'Premium (75k)' : 'Full (30k)'}.`)} target="_blank" rel="noopener noreferrer" className="block text-center bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs shadow-xl hover:scale-105 transition">Verrouiller cette offre sur WhatsApp</a>
                      </div>
                    )}

                    {!activeProfiles.includes('Premium') && activeProfiles.length > 0 && (
                      <div className="animate-in zoom-in duration-300">
                        <h4 className="font-black text-2xl mb-2 flex items-center gap-2">
                          <CheckCircle2 className="text-[#39FF14]"/> 
                          {activeProfiles.includes('Restaurant') || activeProfiles.includes('Entreprise / RH') ? 'Pack Full (30.000F)' : 
                           activeProfiles.length === 2 ? 'Pack Trio (17.500F)' : 
                           activeProfiles.includes('Boutique') ? 'Pack Trio (17.500F)' : 
                           'Onyx Solo : Onyx Vente (7.500F)'}
                        </h4>
                        <p className="text-sm text-zinc-600 mb-6 font-medium leading-relaxed">
                          {activeProfiles.includes('Restaurant') ? "Il vous faut la totale. QR Menu sur les tables, Tiak pour vos livraisons, et Stock pour les ingrédients. Le Pack Full est votre directeur des opérations." : 
                           activeProfiles.includes('Entreprise / RH') ? "OnyxStaff va transformer votre gestion. Pointage GPS WhatsApp pour vos chantiers, Fiches de paie par QR Code et gestion native des avances Tabaski." : 
                           activeProfiles.length === 2 ? "Vous êtes sur tous les fronts. Le Pack Trio lie votre e-commerce WhatsApp à votre gestion de stock physique. Vendez en ligne, déstockez en boutique." : 
                           activeProfiles.includes('Boutique') ? "Sécurisez vos caisses. Le Pack Trio avec OnyxStock et OnyxVente vous garantit zéro perte d'inventaire et des factures pro pour vos clients." : 
                           "Ne payez que pour ce dont vous avez besoin. Onyx Vente transforme votre WhatsApp en machine à vendre et à facturer. Lien direct, devis PDF, commande. Simple et radical."}
                        </p>
                        <a href={getWaLink(`Recommandation : Je prends l'offre ${activeProfiles.includes('Restaurant') || activeProfiles.includes('Entreprise / RH') ? 'Full (30k)' : activeProfiles.length === 2 || activeProfiles.includes('Boutique') ? 'Trio (17.5k)' : 'Solo Vente (7.5k)'}.`)} target="_blank" rel="noopener noreferrer" className="block text-center bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl">
                          Commander cette solution (WhatsApp)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VUE : WORKFLOW PARTENAIRE (ONBOARDING & DASHBOARD & SIMULATEUR)    */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'dashboard' && (
          <div className="py-20 px-6 max-w-6xl mx-auto animate-in fade-in duration-500 min-h-[80vh]">
            
            {partnerStep === 'landing' && (
              <div className="text-center max-w-4xl mx-auto">
                <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-6 uppercase`}>Programme Ambassadeur Élite</div>
                <h1 className={`${spaceGrotesk.className} text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6`}>Générez une <span className="text-[#39FF14] italic">Rente Passive</span> au Sénégal.</h1>
                <p className="text-zinc-500 font-medium mb-10 text-lg">Gagnez 30% en cash immédiat sur chaque vente, 10% de récurrent à vie, et 5% sur les ventes des affiliés que vous recrutez. Le système d'affiliation le plus puissant du pays.</p>
                <button onClick={() => setPartnerStep('form')} className="bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-[0_15px_40px_rgba(57,255,20,0.3)] hover:scale-105 mb-16">
                  Postuler au Programme
                </button>

                {/* SIMULATEUR RESTAURÉ */}
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-zinc-100 text-left mb-20 animate-in slide-in-from-bottom-8">
                  <h3 className={`${spaceGrotesk.className} font-black text-3xl mb-8 uppercase flex items-center gap-3`}><Target className="text-[#39FF14] w-8 h-8"/> Simulateur de Gains</h3>
                  
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      {[
                        { id: 'solo', label: 'Pack Solo (7.500F)', max: 50 },
                        { id: 'trio', label: 'Pack Trio (17.500F)', max: 30 },
                        { id: 'full', label: 'Pack Full (30.000F)', max: 20 },
                        { id: 'premium', label: 'Premium (75.000F)', max: 10 }
                      ].map(pack => (
                        <div key={pack.id}>
                          <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-widest">{pack.label}</label>
                            <span className="font-black text-[#39FF14] bg-black px-2 py-0.5 rounded-md text-xs">{packCounts[pack.id as PlanKey]} ventes</span>
                          </div>
                          <input type="range" min="0" max={pack.max} value={packCounts[pack.id as PlanKey]} onChange={(e) => setPackCounts({...packCounts, [pack.id]: parseInt(e.target.value)})} className="w-full accent-black h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      ))}
                    </div>

                    <div className="bg-black text-white p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/20 blur-3xl rounded-full"></div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Gain Immédiat (Ce mois)</p>
                      <p className={`${spaceGrotesk.className} text-4xl font-black text-[#39FF14] mb-6`}>{commissionM1.toLocaleString()} F</p>
                      
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Rente Passive (Tous les mois)</p>
                      <p className={`${spaceGrotesk.className} text-2xl font-black text-white mb-6`}>+ {recurrentPerMonth.toLocaleString()} F / mois</p>

                      <div className="pt-6 border-t border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Projection sur 6 mois</p>
                        <p className={`${spaceGrotesk.className} text-3xl font-black text-white`}>{commissionM6.toLocaleString()} F</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-left bg-zinc-50 p-8 rounded-[3rem] border border-zinc-200 shadow-inner">
                  <h3 className="font-black text-xl mb-6 uppercase">La Règle des 5% (Le Système Multi-Niveaux)</h3>
                  <div className="flex gap-4 items-start">
                    <div className="bg-white p-4 rounded-2xl border-2 border-black flex-1"><p className="text-xs font-bold text-zinc-500 mb-2">1. Vous recrutez</p><p className="font-black">Mamadou rejoint Onyx grâce à votre lien recruteur.</p></div>
                    <ArrowRight className="w-6 h-6 self-center text-zinc-400" />
                    <div className="bg-white p-4 rounded-2xl border-2 border-black flex-1"><p className="text-xs font-bold text-zinc-500 mb-2">2. Il vend</p><p className="font-black">Mamadou vend un Pack Full (30.000F).</p></div>
                    <ArrowRight className="w-6 h-6 self-center text-zinc-400" />
                    <div className="bg-[#39FF14]/20 p-4 rounded-2xl border-2 border-[#39FF14] flex-1"><p className="text-xs font-bold text-[#39FF14] mb-2 uppercase tracking-widest">3. Vous encaissez</p><p className="font-black">Vous gagnez 5% (1.500F) sans rien faire, prélevés sur NOTRE marge.</p></div>
                  </div>
                </div>
              </div>
            )}

            {partnerStep === 'form' && (
              <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-zinc-100 animate-in zoom-in duration-300">
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase`}>Candidature</h2>
                  <button onClick={() => setPartnerStep('landing')} className="text-xs font-bold text-zinc-400 hover:text-black underline underline-offset-4">Retour</button>
                </div>
                
                <div className="space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase text-[#39FF14] bg-black inline-block px-3 py-1 rounded-full tracking-widest">1. Identité & Contact</h3>
                    <input type="text" placeholder="Nom Complet" className="w-full bg-zinc-100 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
                    <input type="tel" placeholder="Numéro WhatsApp (Obligatoire)" className="w-full bg-zinc-100 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
                    <input type="text" placeholder="Ville / Quartier (ex: Dakar, Médina)" className="w-full bg-zinc-100 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 pt-8">
                    <h3 className="text-xs font-black uppercase text-[#39FF14] bg-black inline-block px-3 py-1 rounded-full tracking-widest">2. Profil & Expérience</h3>
                    <select className="w-full bg-zinc-100 p-4 rounded-xl text-sm font-bold outline-none cursor-pointer">
                      <option value="" disabled selected>Activité principale actuelle...</option><option>Étudiant</option><option>Commercial indépendant</option><option>Gérant de boutique</option><option>Agent de livraison</option><option>Autre</option>
                    </select>
                    <select className="w-full bg-zinc-100 p-4 rounded-xl text-sm font-bold outline-none cursor-pointer">
                      <option value="" disabled selected>Avez-vous déjà vendu des services ?</option><option>Oui, j'ai de l'expérience</option><option>Non, je débute</option>
                    </select>
                    <select className="w-full bg-zinc-100 p-4 rounded-xl text-sm font-bold outline-none cursor-pointer">
                      <option value="" disabled selected>Maîtrise outils digitaux (1 à 5)</option><option>5 - Expert (WhatsApp Biz, Réseaux, etc.)</option><option>4 - Très bon</option><option>3 - Bon</option><option>2 - Moyen</option><option>1 - Débutant</option>
                    </select>
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 pt-8">
                    <h3 className="text-xs font-black uppercase text-[#39FF14] bg-black inline-block px-3 py-1 rounded-full tracking-widest">3. Stratégie Commando</h3>
                    <select className="w-full bg-zinc-100 p-4 rounded-xl text-sm font-bold outline-none cursor-pointer">
                      <option value="" disabled selected>Comment allez-vous trouver vos clients ?</option><option>Prospection de terrain / Boutiques physiques</option><option>Réseaux sociaux (Facebook, TikTok, Insta)</option><option>Mon propre réseau professionnel</option><option>Publicité payante (Ads)</option>
                    </select>
                    <select className="w-full bg-zinc-100 p-4 rounded-xl text-sm font-bold outline-none cursor-pointer">
                      <option value="" disabled selected>Combien d'abonnements visés / mois ?</option><option>Entre 1 et 5</option><option>Entre 5 et 10</option><option>Plus de 10 (Mode Machine)</option>
                    </select>
                  </div>

                  <div className="space-y-4 border-t border-zinc-100 pt-8">
                    <h3 className="text-xs font-black uppercase text-[#39FF14] bg-black inline-block px-3 py-1 rounded-full tracking-widest">4. Parrainage (Optionnel)</h3>
                    <input type="text" placeholder="Code parrain ou Numéro du parrain" className="w-full bg-zinc-100 p-4 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-[#39FF14]" />
                  </div>

                  <div className="border-t border-zinc-100 pt-8">
                    <label className="flex items-start gap-3 cursor-pointer mb-6">
                      <input type="checkbox" className="mt-1 w-4 h-4 accent-black" />
                      <span className="text-xs font-medium text-zinc-600">Je certifie avoir lu le Guide de Survie et je m'engage à représenter OnyxOps avec professionnalisme.</span>
                    </label>
                    <button onClick={() => setPartnerStep('success')} className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl flex justify-center items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> Activer mon compte Ambassadeur
                    </button>
                  </div>
                </div>
              </div>
            )}

            {partnerStep === 'success' && (
              <div className="text-center max-w-lg mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border-2 border-[#39FF14] animate-in zoom-in duration-300">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6"><Check className="w-10 h-10 text-[#39FF14]" /></div>
                <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-4`}>Bienvenue dans l'Élite.</h2>
                <p className="text-zinc-600 mb-8 font-medium">Ton compte a été pré-approuvé. Ton espace partenaire est prêt et tes liens de parrainage sont générés.</p>
                <button onClick={() => setPartnerStep('dashboard')} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition mb-4">
                  Accéder à mon Dashboard
                </button>
                <a href={getWaLink("Bonjour Onyx, je viens de finaliser mon inscription Ambassadeur. Je veux rejoindre le groupe privé.")} target="_blank" rel="noopener noreferrer" className="block w-full border-2 border-black text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black hover:text-white transition">
                  Rejoindre le Groupe WhatsApp VIP
                </a>
              </div>
            )}

            {partnerStep === 'dashboard' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-10">
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-1 flex items-center gap-2">🟢 En ligne - Ambassadeur Vérifié</p>
                    <h1 className={`${spaceGrotesk.className} text-4xl font-bold uppercase tracking-tighter`}>Espace <span className="text-[#39FF14]">Partenaire</span></h1>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-16 h-16"/></div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Solde Disponible (M1)</p>
                    <p className={`${spaceGrotesk.className} text-4xl font-bold text-[#39FF14]`}>142.500 F</p>
                    <button className="mt-4 bg-[#39FF14] text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white transition flex items-center gap-1">
                      <Wallet className="w-3 h-3"/> Demander un retrait Wave
                    </button>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-[2rem]">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Revenu Récurrent (10%)</p>
                    <p className={`${spaceGrotesk.className} text-4xl font-bold text-black`}>21.500 F <span className="text-sm text-zinc-500 font-normal">/mois</span></p>
                    <p className="text-xs text-zinc-400 mt-2 font-medium">Généré par vos 9 clients actifs</p>
                  </div>
                  <div className="bg-[#39FF14]/10 border-2 border-[#39FF14] p-8 rounded-[2rem]">
                    <p className="text-[10px] font-bold text-[#39FF14] uppercase tracking-widest mb-2">Bonus Réseau Filleuls (5%)</p>
                    <p className={`${spaceGrotesk.className} text-4xl font-bold text-black`}>8.000 F</p>
                    <p className="text-xs text-zinc-600 mt-2 font-medium">3 filleuls inscrits sous vous</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-10">
                  <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm">
                    <h3 className="font-black text-lg mb-6 uppercase flex items-center gap-2"><Link className="w-5 h-5 text-black"/> Centre de Liens</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Lien de Vente Client</p>
                        <div className="bg-zinc-100 p-3 rounded-xl flex justify-between items-center">
                          <span className="text-xs font-bold text-zinc-500 truncate mr-2">https://onyxops.com/ref/s/88291</span>
                          <button onClick={() => handleCopy("https://onyxops.com/ref/s/88291", "vente")} className="bg-black text-[#39FF14] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition">
                            {copiedLink === 'vente' ? 'Copié!' : 'Copier'}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Lien pour recruter un Filleul</p>
                        <div className="bg-zinc-100 p-3 rounded-xl flex justify-between items-center border border-dashed border-zinc-300">
                          <span className="text-xs font-bold text-zinc-500 truncate mr-2">https://onyxops.com/ref/r/88291</span>
                          <button onClick={() => handleCopy("https://onyxops.com/ref/r/88291", "recrute")} className="bg-white border border-black text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition">
                            {copiedLink === 'recrute' ? 'Copié!' : 'Copier'}
                          </button>
                        </div>
                      </div>

                      <a href={`https://wa.me/?text=${encodeURIComponent("J'ai découvert une dinguerie pour gérer ma boutique et mon stock direct sur WhatsApp. Check ce lien, c'est gratuit pendant 7 jours : https://onyxops.com/ref/s/88291")}`} target="_blank" rel="noopener noreferrer" className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black text-[10px] md:text-xs uppercase tracking-widest hover:bg-black hover:text-[#39FF14] transition shadow-lg flex items-center justify-center gap-2 mt-4">
                        <Share2 className="w-4 h-4"/> Partager mon lien sur mon Statut WhatsApp
                      </a>
                    </div>
                  </div>

                  <div className="bg-zinc-900 text-white p-8 rounded-[3rem] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><MessageSquare className="w-24 h-24"/></div>
                    <h3 className="font-black text-lg mb-6 uppercase flex items-center gap-2"><Smartphone className="w-5 h-5 text-[#39FF14]"/> Alertes "Dopamine" (Simulation)</h3>
                    <p className="text-xs text-zinc-400 mb-6">Voici le type de messages WhatsApp que vous recevrez en automatique à chaque succès.</p>
                    
                    <div className="space-y-4 relative z-10">
                      <div className="bg-zinc-800 p-4 rounded-2xl border-l-4 border-[#39FF14] shadow-md">
                        <p className="text-xs font-black text-[#39FF14] mb-1">🔥 BOOM ! Nouvelle Commission</p>
                        <p className="text-xs text-zinc-300">Félicitations ! Une vente vient d'être validée grâce à ton lien.<br/><br/><span className="font-bold text-white">💰 Gain Immédiat : 5.250 FCFA</span><br/>🔄 Récurrent : 1.750 FCFA / mois</p>
                      </div>
                      <div className="bg-zinc-800 p-4 rounded-2xl border-l-4 border-yellow-400 shadow-md">
                        <p className="text-xs font-black text-yellow-400 mb-1">💸 Argent Passif encaissé</p>
                        <p className="text-xs text-zinc-300">Ton filleul Moussa vient de réaliser une vente Pack Full.<br/><br/><span className="font-bold text-white">🎁 Ton Bonus (5%) : 1.500 FCFA</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-[3rem] mb-10">
                  <h3 className="font-black text-lg mb-6 uppercase">Kit de Vente & Ressources</h3>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <button className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-black transition flex flex-col items-center justify-center gap-2 text-center group">
                      <Download className="w-6 h-6 text-zinc-400 group-hover:text-black transition" />
                      <span className="text-xs font-bold uppercase tracking-widest">Le Guide de Survie (PDF)</span>
                    </button>
                    <button className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-black transition flex flex-col items-center justify-center gap-2 text-center group">
                      <Download className="w-6 h-6 text-zinc-400 group-hover:text-black transition" />
                      <span className="text-xs font-bold uppercase tracking-widest">Visuels WhatsApp</span>
                    </button>
                    <button className="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-black transition flex flex-col items-center justify-center gap-2 text-center group">
                      <Download className="w-6 h-6 text-zinc-400 group-hover:text-black transition" />
                      <span className="text-xs font-bold uppercase tracking-widest">Scripts de Prospection</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VUE : PAGE BLOG EXPERTISE                                          */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'blog' && (
          <div className="py-20 px-6 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-[80vh]">
             <div className="text-center mb-16">
              <h1 className={`${spaceGrotesk.className} text-5xl md:text-6xl font-bold mb-4 uppercase tracking-tighter`}>
                BLOG & <span className="text-[#39FF14] italic">EXPERTISE.</span>
              </h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Stratégies concrètes pour scaler votre entreprise au Sénégal.</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 mb-16">
              {articles.map((article) => (
                <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-zinc-50 rounded-[3rem] p-8 md:p-10 border border-zinc-200 hover:border-[#39FF14] transition cursor-pointer group flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{article.category}</span>
                    <span className="text-xs font-bold text-zinc-400 border border-zinc-200 px-3 py-1 rounded-full">{article.packFocus || article.pack_focus}</span>
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-bold mb-4 leading-tight group-hover:text-[#39FF14] transition flex-1`}>{article.title}</h3>
                  <p className="text-zinc-600 text-sm font-medium line-clamp-3 mb-6">{article.content}</p>
                  <p className="text-xs font-bold text-black uppercase tracking-widest flex items-center gap-2 mt-auto">Lire l'article <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" /></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VUE : PAGE À PROPOS                                                */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'about' && (
          <div className="py-20 px-6 max-w-6xl mx-auto animate-in fade-in duration-500 min-h-[80vh]">
            <div className="text-center mb-16">
              <h1 className={`${spaceGrotesk.className} text-5xl md:text-6xl font-bold mb-4 uppercase tracking-tighter`}>
                NOTRE <span className="text-[#39FF14] italic">VISION.</span>
              </h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Data Driven Methodologie RevOps pour les Entreprises Africaines</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative aspect-square md:aspect-[4/5] bg-zinc-100 rounded-[3rem] overflow-hidden shadow-xl border border-zinc-200 group">
                <img src="https://i.ibb.co/Kcr9Jbms/1772397975062-37ba89eb-1a9a-4ac7-b555-20749059995f.png" alt="Maimouna Traoré" className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition duration-700" />
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-3xl border-2 border-[#39FF14] shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="font-black text-sm uppercase tracking-widest text-black mb-1">Maimouna Traoré</p>
                  <p className="text-xs font-bold text-zinc-500 mb-3">Digital Marketing Manager</p>
                  <p className="text-sm font-bold text-black italic border-l-4 border-[#39FF14] pl-3">"Parce que les Vues ne paient pas les factures."</p>
                </div>
              </div>

              <div>
                <h3 className={`${spaceGrotesk.className} text-3xl font-bold mb-6 uppercase leading-tight`}>L'Efficacité avant <br/>l'Esthétique.</h3>
                <div className="space-y-4 text-zinc-600 font-medium mb-10 leading-relaxed">
                  <p>Trop d'entreprises au Sénégal se concentrent sur les "likes" et les belles photos sur Instagram, en oubliant l'essentiel : <span className="text-black font-bold">la conversion et l'encaissement direct.</span></p>
                  <p className="p-4 bg-zinc-50 border-l-4 border-black text-sm italic rounded-r-2xl">"L'idée d'OnyxOps est née d'un constat brutal sur le terrain : nos commerçants jonglent entre des cahiers raturés, des commandes perdues sur WhatsApp et des livreurs Tiak-Tiak injoignables. Il nous fallait une solution unifiée."</p>
                </div>

                <div className="bg-zinc-50 p-6 md:p-8 rounded-[2.5rem] border border-zinc-200 space-y-4 mb-10">
                  <div className="flex items-start gap-4 p-2">
                    <div className="bg-black text-[#39FF14] p-3 rounded-full"><Clock className="w-5 h-5" /></div>
                    <div>
                      <p className="font-black text-xs uppercase tracking-widest text-zinc-500 mb-1">Horaires</p>
                      <p className="font-bold text-sm text-black">09h à 19h</p>
                      <p className="text-xs font-medium text-zinc-500">Du Lundi au Samedi</p>
                    </div>
                  </div>
                  <a href="mailto:contact@onyxops.com" className="flex items-start gap-4 group p-2 rounded-2xl hover:bg-white hover:shadow-md transition">
                    <div className="bg-black text-[#39FF14] p-3 rounded-full group-hover:scale-110 transition-transform"><Mail className="w-5 h-5" /></div>
                    <div>
                      <p className="font-black text-xs uppercase tracking-widest text-zinc-500 mb-1">Email</p>
                      <p className="font-bold text-sm text-black group-hover:text-[#39FF14] transition">contact@onyxops.com</p>
                    </div>
                  </a>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={() => navigateTo('home')} className="flex-1 bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl text-center">Retour aux Solutions</button>
                  <a href={getWaLink("Bonjour Maimouna, je vous contacte depuis la page À Propos du site OnyxOps.")} target="_blank" rel="noopener noreferrer" className="flex-1 border-2 border-black text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black hover:text-[#39FF14] transition text-center">Contacter via WhatsApp</a>
                </div>
              </div>
            </div>

            <div className="py-16 border-t border-zinc-100">
              <div className="text-center mb-12">
                <h3 className={`${spaceGrotesk.className} text-3xl font-bold uppercase`}>La Machine Derrière <span className="text-[#39FF14]">Onyx</span></h3>
                <p className="text-zinc-500 text-sm font-bold mt-2">Ceux qui transforment le code en revenus réels.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  { name: "Amadou Ndiaye", role: "Lead Dev Fullstack", desc: "L'architecte réseau. Il s'assure que vos SaaS ne plantent jamais.", img: "https://i.ibb.co/PZjk9yR7/1772397350226-1b3277d4-0aed-4cd0-b2ad-c814095eacad.png" },
                  { name: "Fatou Diop", role: "Head of Customer Success", desc: "La voix de la sagesse. Elle accompagne chaque gérant vers la rentabilité.", img: "https://i.ibb.co/5gndLXj5/FATOU-DIOP.png" },
                  { name: "Cheikh Fall", role: "Product Designer UX/UI", desc: "L'œil du design. Il rend chaque interface aussi simple qu'un message WhatsApp.", img: "https://i.ibb.co/35HdJNNS/cheikh-fall.png" }
                ].map((member, idx) => (
                  <div key={idx} className="bg-zinc-50 rounded-[2rem] p-8 text-center border border-zinc-200 hover:border-[#39FF14] transition group">
                    {member.img ? (
                      <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden border-2 border-transparent group-hover:border-[#39FF14] transition-all">
                        <img src={member.img} alt={member.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition duration-500" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-black text-[#39FF14] rounded-full mx-auto mb-4 flex items-center justify-center font-black text-2xl uppercase tracking-tighter group-hover:scale-110 transition-transform">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    )}
                    <h4 className="font-black text-lg mb-1">{member.name}</h4>
                    <p className="text-[10px] font-bold text-[#39FF14] bg-black inline-block px-3 py-1 rounded-full uppercase tracking-widest mb-4">{member.role}</p>
                    <p className="text-sm text-zinc-500 font-medium">{member.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <footer className="py-12 border-t border-zinc-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" width={72} height={24} className="h-6 w-auto object-contain grayscale opacity-50" unoptimized />
              <p className="text-zinc-300 font-black text-[10px] tracking-[0.5em] uppercase">OnyxOps 2026 • Dakar Tech • Security Active</p>
            </div>
            <div className="flex gap-6 items-center flex-wrap justify-center">
               <Lock className="w-3 h-3 text-zinc-200" />
               <a href="tel:+221768102039" className="text-zinc-400 font-bold text-xs hover:text-[#39FF14] transition underline decoration-[#39FF14]">Support : (+221) 76 810 20 39</a>
            </div>
          </div>
        </footer>

        {/* WIDGET PREUVE SOCIALE */}
        <div className={`fixed bottom-6 left-6 z-[80] bg-white text-black p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-l-4 border-[#39FF14] transition-all duration-1000 transform ${showProof ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} max-w-[280px] pointer-events-none hidden md:block`}>
          <div className="flex items-start gap-3">
             <div className="bg-[#39FF14]/20 p-2 rounded-full mt-1"><Star className="w-4 h-4 text-[#39FF14] fill-[#39FF14]" /></div>
             <div>
               <p className="text-[11px] font-black uppercase text-zinc-800 tracking-tighter">{currentProof.name}</p>
               <p className="text-[10px] text-zinc-500 font-medium leading-tight mt-0.5">{currentProof.action}</p>
               <p className="text-[9px] font-black text-[#39FF14] mt-1 tracking-widest">{currentProof.time}</p>
             </div>
          </div>
        </div>

        {/* WIDGET PREUVE SOCIALE PARTENAIRES */}
        {activeView === 'dashboard' && (
          <div className={`fixed bottom-28 left-6 z-[80] bg-black text-white p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border-l-4 border-yellow-400 transition-all duration-1000 transform ${showPayout ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} max-w-[280px] pointer-events-none hidden md:block`}>
            <div className="flex items-start gap-3">
               <div className="bg-yellow-400/20 p-2 rounded-full mt-1"><Wallet className="w-4 h-4 text-yellow-400" /></div>
               <div>
                 <p className="text-[11px] font-black uppercase text-white tracking-tighter">{currentPayout.name}</p>
                 <p className="text-[10px] text-zinc-400 font-medium leading-tight mt-0.5">vient de retirer <span className="text-yellow-400 font-bold">{currentPayout.amount}</span> de commissions.</p>
                 <p className="text-[9px] font-black text-yellow-400 mt-1 tracking-widest">via Wave Business</p>
               </div>
            </div>
          </div>
        )}

        {/* BOT ICON (PHOTO PERSONNAGE) & ROUTING INTELLIGENT */}
        <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end">
          {isBotOpen && !chatSimulated && (
            <div className="bg-white rounded-[2rem] shadow-2xl border border-zinc-200 p-6 mb-4 w-[300px] animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></div>
                  <span className="font-black text-xs uppercase tracking-widest text-black">Conseiller Onyx</span>
                </div>
                <button onClick={() => setIsBotOpen(false)} className="text-zinc-400 hover:text-black transition"><X className="w-4 h-4"/></button>
              </div>
              <p className="text-sm font-medium text-zinc-600 mb-4">Besoin d'aide pour choisir votre outil de gestion ?</p>
              <div className="space-y-2">
                <button onClick={() => handleBotAction("Bonjour, c'est quoi le Pack Solo ?", "Demande Info Solo")} className="block w-full text-left bg-zinc-100 hover:bg-zinc-200 text-xs font-bold p-3 rounded-xl transition">🤖 C'est quoi le Pack Solo ?</button>
                <button onClick={() => handleBotAction("Bonjour, comment marche le pointage GPS ?", "Demande Info RH")} className="block w-full text-left bg-zinc-100 hover:bg-zinc-200 text-xs font-bold p-3 rounded-xl transition">🤖 Le pointage GPS, comment ça marche ?</button>
                <button onClick={() => handleBotAction("Bonjour, je veux parler à un humain pour mon business.", "Contact Humain")} className="block w-full text-center bg-black text-[#39FF14] text-xs font-black p-3 rounded-xl transition mt-4 uppercase tracking-widest shadow-lg">🗣️ Parler à un conseiller</button>
              </div>
            </div>
          )}

          {/* FENÊTRE LIVE CHAT SIMULÉE AVEC SAUVEGARDE DB */}
          {chatSimulated && (
            <div className="bg-white rounded-[2rem] shadow-2xl border border-[#39FF14] p-0 mb-4 w-[320px] h-[400px] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
               <div className="bg-black p-4 flex justify-between items-center">
                  <div>
                     <p className="text-[#39FF14] font-black uppercase text-xs">Un conseiller est en ligne</p>
                     <p className="text-white text-[10px]">Temps de réponse : - de 2 min</p>
                  </div>
                  <button onClick={() => {setChatSimulated(false); setIsBotOpen(false);}} className="text-white"><X size={16}/></button>
               </div>
               <div className="flex-1 bg-zinc-50 p-4 overflow-y-auto flex flex-col space-y-4">
                  {chatMessages.map((msg, i) => (
                     <div key={i} className={`p-3 rounded-2xl max-w-[85%] text-sm ${msg.sender === 'bot' ? 'bg-zinc-200 self-start rounded-tl-none' : 'bg-black text-[#39FF14] self-end rounded-tr-none'}`}>
                        {msg.text}
                     </div>
                  ))}
               </div>
               <div className="p-3 bg-white border-t border-zinc-200 flex gap-2">
                  <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendLiveChat()} placeholder="Écrire..." className="flex-1 bg-zinc-100 rounded-xl px-3 outline-none text-sm" />
                  <button onClick={sendLiveChat} className="bg-[#39FF14] p-2 rounded-xl text-black"><Send size={16}/></button>
               </div>
            </div>
          )}

          <button onClick={() => setIsBotOpen(!isBotOpen)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#39FF14] hover:scale-110 transition-transform bg-black relative">
            <img src="https://i.ibb.co/bRdvjrhV/ONYX-LOGOS-2.png" alt="Conseillère" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
            <div className="absolute top-1 right-1 w-3 h-3 bg-[#39FF14] border-2 border-black rounded-full animate-pulse"></div>
          </button>
        </div>

        {/* MODALE ARTICLE BLOG (LECTURE) */}
        {selectedArticle && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedArticle(null)}>
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white rounded-[3rem] max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in duration-300">
              <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-black hover:text-[#39FF14]"><X className="w-5 h-5" /></button>
              <h2 className={`${spaceGrotesk.className} text-3xl font-bold mb-8 mt-4`}>{selectedArticle.title}</h2>
              <div className="text-zinc-700 leading-relaxed space-y-4 mb-10 text-sm whitespace-pre-wrap">{selectedArticle.content}</div>
            </div>
          </div>
        )}

        {/* MODALE DE QUALIFICATION & UPSELL RÉPARÉE */}
        {selectedSaaS && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-10 rounded-[3.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in duration-300">
              <button className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition" onClick={() => setSelectedSaaS(null)}>
                <X size={20}/>
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-black text-[#39FF14] p-3 rounded-2xl">
                  <selectedSaaS.icon size={24} />
                </div>
                <h3 className="text-2xl font-black uppercase italic">{selectedSaaS.id}</h3>
              </div>
        
              <div className="space-y-6">
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Quelle est votre activité ?</p>
                
                <div className="grid grid-cols-1 gap-3">
                  {["Boutique / Prêt-à-porter", "Restaurant / Fast-Food", "E-commerce / Instagram", "BTP / Agence de Services"].map((metier) => (
                    <button 
                      key={metier}
                      onClick={() => setSaasMetier(metier)}
                      className={`text-left p-4 rounded-2xl text-xs font-black uppercase transition-all border-2 ${saasMetier === metier ? 'bg-black text-[#39FF14] border-black' : 'bg-zinc-50 border-transparent hover:border-zinc-200'}`}
                    >
                      {metier}
                    </button>
                  ))}
                </div>
        
                {saasMetier && (
                  <div className="pt-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-[#39FF14]/10 p-6 rounded-[2rem] border-2 border-[#39FF14] relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Flame size={40}/></div>
                      <p className="text-[10px] font-black uppercase text-[#39FF14] mb-2 flex items-center gap-1"><Zap size={12}/> Bundle d'urgence conseillé</p>
                      <p className="text-xs font-bold text-zinc-800 leading-relaxed mb-4">
                        En tant que <span className="underline">{saasMetier}</span>, si vous vendez mais ne suivez pas vos livreurs (Tiak), vous perdez 20% de votre cash. 
                      </p>
                      <button 
                        onClick={() => window.open(getWaLink(`Bonjour, je suis en activité ${saasMetier}. Je veux passer au ${selectedSaaS.upsellName} pour sécuriser mon cash.`))}
                        className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition"
                      >
                        Passer au {selectedSaaS.upsellName} (+{selectedSaaS.upsellPrice})
                      </button>
                    </div>
                    <button 
                      onClick={() => window.open(getWaLink(`Bonjour, je veux rester sur ${selectedSaaS.id} pour mon activité ${saasMetier}.`))}
                      className="w-full text-center mt-4 text-[9px] font-black uppercase text-zinc-400 hover:text-black transition underline underline-offset-4"
                    >
                      Garder uniquement {selectedSaaS.id}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
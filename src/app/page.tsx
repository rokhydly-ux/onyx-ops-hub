"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Space_Grotesk, Inter } from "next/font/google";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { 
  Smartphone, Truck, Box, Utensils, Calendar, 
  ArrowRight, Users, Target, 
  Zap, CheckCircle, AlertCircle, Lock, Handshake, Package, X,
  Clock, Mail, Menu, Star, MessageSquare, Flame, Share2, Link, Wallet, Check, Send, TrendingUp, PlayCircle, LogIn, UserPlus
} from "lucide-react";

type PlanKey = "solo" | "trio" | "full" | "premium";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

// --- DATA ---
const ECOSYSTEM_SAAS = [
  { id: "vente", name: "Onyx Vente", type: "Catalogue & Devis WhatsApp" },
  { id: "tiak", name: "Onyx Tiak", type: "Logistique & Livreurs" },
  { id: "stock", name: "Onyx Stock", type: "Gestion d'Inventaire" },
  { id: "menu", name: "Onyx Menu", type: "Menu QR & Commandes" },
  { id: "booking", name: "Onyx Booking", type: "Réservations & Acomptes" },
  { id: "staff", name: "Onyx Staff", type: "Pointage & Paie" },
  { id: "trio", name: "Pack Trio", type: "Vente + Stock + Tiak" },
  { id: "full", name: "Pack Full", type: "Ecosystème Complet" },
];

const PLAN_DETAILS: Record<PlanKey, { title: string; desc: string; benefits: string[]; why: string; cible: string; avantage: string; chiffreCle: string }> = {
  solo: { title: "Onyx Solo", desc: "Digitalisez votre boutique en 24h.", benefits: ["Catalogue interactif & Devis", "Lien de commande unique", "Fidélisation automatique"], why: "Gagner 2h par jour.", cible: "Vendeurs WhatsApp", avantage: "Fini les devis raturés.", chiffreCle: "+15% de ventes" },
  trio: { title: "Pack Trio", desc: "Vente + Stock + Logistique (Tiak).", benefits: ["Inventaire temps réel", "Facturation pro", "Suivi livreurs"], why: "Contrôle total du cash.", cible: "Boutiques, Grossistes", avantage: "Maîtrise du stock.", chiffreCle: "0 rupture" },
  full: { title: "Pack Full", desc: "Les 6 SaaS Onyx ensemble.", benefits: ["RH, Paie & Logistique", "Menu QR & Réservations", "Rapports hebdo"], why: "Pour scaler rapidement.", cible: "PME & Agences", avantage: "Digitalisation 360°.", chiffreCle: "Gain de 10h/sem" },
  premium: { title: "Onyx Premium", desc: "IA et Marketing.", benefits: ["Studio Créatif IA", "CRM & Relance auto", "Conseiller dédié"], why: "Pour dominer le marché.", cible: "Franchises", avantage: "IA intégrée.", chiffreCle: "Croissance X2" },
};

const SOLUTIONS = [
  { id: "Onyx Vente", icon: Smartphone, pain: "Photos WhatsApp interminables et devis gribouillés.", solution: "Catalogue digital interactif et générateur de devis PDF pro en 60s.", upsellPack: "trio", upsellName: "Pack Trio" },
  { id: "Onyx Tiak", icon: Truck, pain: "Le gérant ne sait jamais où est son cash ou son livreur.", solution: "Suivi logistique et sécurisation des encaissements en temps réel.", upsellPack: "trio", upsellName: "Pack Trio" },
  { id: "Onyx Stock", icon: Box, pain: "Rupture de stock fatale ou vols d'inventaire non détectés.", solution: "Inventaire par scan et alertes WhatsApp avant la rupture.", upsellPack: "trio", upsellName: "Pack Trio" },
  { id: "Onyx Menu", icon: Utensils, pain: "Menus sales, chers à imprimer et erreurs de commande.", solution: "QR Menu interactif : le client scanne et commande proprement.", upsellPack: "full", upsellName: "Pack Full" },
  { id: "Onyx Booking", icon: Calendar, pain: "Rendez-vous manqués (No-shows) et planning brouillon.", solution: "Réservations en ligne avec paiement d'acompte sécurisé.", upsellPack: "full", upsellName: "Pack Full" },
  { id: "Onyx Staff", icon: Users, pain: "Casse-tête des avances Tabaski, fiches de paie manuelles.", solution: "Pointage GPS WhatsApp, fiches de paie par QR Code.", upsellPack: "full", upsellName: "Pack Full" },
];

const PACKS: Array<{ id: PlanKey; name: string; price: number; label: string; rating: string; avis: number }> = [
  { id: "solo", name: "Solo", price: 7500, label: "Onyx Solo", rating: "4.9/5", avis: 142 },
  { id: "trio", name: "Pack Trio", price: 17500, label: "Pack Trio", rating: "5.0/5", avis: 89 },
  { id: "full", name: "Pack Full", price: 30000, label: "Pack Full", rating: "4.9/5", avis: 215 },
  { id: "premium", name: "Premium", price: 75000, label: "Onyx Premium", rating: "5.0/5", avis: 34 },
];

const AMBASSADOR_TESTIMONIALS = [
  { name: "Moussa D.", role: "Étudiant", img: "https://ui-avatars.com/api/?name=Moussa+D&background=000&color=39FF14", text: "Fini les fins de mois difficiles. Je paie mon loyer juste avec mes commissions de renouvellement." },
  { name: "Fatou B.", role: "Commerciale", img: "https://ui-avatars.com/api/?name=Fatou+B&background=000&color=39FF14", text: "Je propose Onyx aux boutiques que je visite. L'argumentaire est si fort que ça se vend tout seul." },
  { name: "Cheikh N.", role: "Freelance", img: "https://ui-avatars.com/api/?name=Cheikh+N&background=000&color=39FF14", text: "La rente passive c'est du sérieux. J'ai 15 clients réguliers, l'argent tombe chaque mois sans rien faire." }
];

const RANDOM_SCENARIOS = [
  { avant: { phone: "+221 77 000 00 00", text: "C'est quoi l'avance Tabaski de Modou déjà ?", tag: "RH", issue: "Pertes d'argent" }, apres: { tag: "Pointage OK", title: "Ressources Humaines", text: "Modou S. a partagé sa localisation.", sub: "Avance Tabaski déduite : -25.000F" } },
  { avant: { phone: "+221 76 111 11 11", text: "Tu peux me refaire le devis j'ai perdu la feuille !", tag: "Vente", issue: "Temps perdu" }, apres: { tag: "Devis OK", title: "Vente & Stock", text: "Devis #1042 accepté & payé en ligne.", sub: "Stock mis à jour automatiquement." } },
  { avant: { phone: "+221 78 222 22 22", text: "Le livreur ne répond pas 😡", tag: "Logistique", issue: "Clients fâchés" }, apres: { tag: "En route", title: "Logistique Tiak", text: "Commande #402 localisée en temps réel.", sub: "Le client suit le livreur sur WhatsApp." } }
];

export default function OnyxOpsElite() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'home' | 'about' | 'blog' | 'dashboard'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // MODALES
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);
  const [saasMetier, setSaasMetier] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authSelectedSaas, setAuthSelectedSaas] = useState("vente");
  
  // USER
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // QUIZ
  const [activeProfiles, setActiveProfiles] = useState<string[]>([]);

  // BOT WHATSAPP "FANTA" & LEADS
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState<any[]>([]);
  const [botStep, setBotStep] = useState(0);
  const [botUserData, setBotUserData] = useState({ name: "", phone: "", sector: "", product: "" });
  const [userReply, setUserReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // PREUVES SOCIALES
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // WORKFLOW PARTENAIRE
  const [partnerStep, setPartnerStep] = useState<'landing' | 'form' | 'success' | 'dashboard'>('landing');
  const [packCounts, setPackCounts] = useState({ solo: 2, trio: 1, full: 0, premium: 0 });
  const [partnerForm, setPartnerForm] = useState({ full_name: "", contact: "", city: "", status: "", sales_exp: "", objective: "", strategy: "" });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);

  const waNumber = "221768102039";
  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // INIT
  useEffect(() => {
    const initData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
          setCurrentUser({ ...user, ...data });
        }
        const { data: dbArticles } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
        if (dbArticles && dbArticles.length > 0) setArticles(dbArticles);
        else setArticles([{ id: 1, title: "Comment doubler vos ventes WhatsApp", content: "L'automatisation est reine...", category: "Social Selling", pack_focus: "Pack Trio" }]);
      } catch (err) { console.warn(err); }
    };
    initData();

    // Auto-open Bot Fanta after 3 seconds
    setTimeout(() => {
      setIsBotOpen(true);
      setBotMessages([{ sender: 'bot', text: "👋 Bonjour ! Je suis Fanta, conseillère clientèle OnyxOps. J'aimerais vous aider à trouver la meilleure solution pour votre business.\n\nPour commencer, quel est votre prénom et numéro WhatsApp ? (Ex: Amadou 771234567)" }]);
    }, 3000);

    const scenarioInterval = setInterval(() => setScenarioIndex((prev) => (prev + 1) % RANDOM_SCENARIOS.length), 4000);
    const testimonialInterval = setInterval(() => setTestimonialIndex((prev) => (prev + 1) % AMBASSADOR_TESTIMONIALS.length), 6000);
    
    return () => { clearInterval(scenarioInterval); clearInterval(testimonialInterval); };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages]);

  useEffect(() => {
    if (selectedSaaS || isMobileMenuOpen || selectedArticle || showAuthModal) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedSaaS, isMobileMenuOpen, selectedArticle, showAuthModal]);

  // --- CAPTURE LEADS GLOBALE ---
  const saveLead = async (data: { source: string; intent: string; contact?: string; message?: string, full_name?: string }) => {
    try {
      await supabase.from('leads').insert({
        source: data.source, intent: data.intent, status: 'Nouveau', contact: data.contact || '', message: data.message || '', full_name: data.full_name || 'Visiteur Web'
      });
    } catch (e) {}
  };

  const handleWaClick = async (intent: string, msg: string) => {
    saveLead({ source: 'Bouton Site', intent, message: msg });
    window.open(getWaLink(msg), "_blank");
  };

  // --- BOT FANTA LOGIC ---
  const processBotReply = async (reply: string) => {
    if(!reply.trim()) return;
    const newMsgs = [...botMessages, { sender: 'client', text: reply }];
    setBotMessages(newMsgs);
    setUserReply("");

    let currentData = { ...botUserData };

    if (botStep === 0) {
      // Catch Name & Phone
      currentData.name = reply;
      setBotUserData(currentData);
      saveLead({ source: 'Bot Fanta', intent: 'Démarrage Bot', contact: reply, full_name: reply });
      
      setTimeout(() => {
        setBotMessages(prev => [...prev, { sender: 'bot', text: `Enchantée ${reply.split(' ')[0]} ! Quel est votre secteur d'activité actuel ?`, options: ["Boutique / Vente en ligne", "Restaurant / Fast Food", "Prestataire de services", "Autre"] }]);
        setBotStep(1);
      }, 1000);
    } 
    else if (botStep === 1) {
      // Catch Sector
      currentData.sector = reply;
      setBotUserData(currentData);
      saveLead({ source: 'Bot Fanta', intent: `Secteur: ${reply}`, contact: currentData.name, full_name: currentData.name });

      setTimeout(() => {
        let msg = "";
        if(reply.includes("Boutique")) msg = "Excellent. Pour une boutique, voici nos 3 solutions phares :\n1. Onyx Vente (Catalogue)\n2. Onyx Stock (Inventaire)\n3. Pack Trio (Le tout combiné)\n\nTapez le numéro qui vous intéresse le plus :";
        else if(reply.includes("Restaurant")) msg = "Parfait. Pour la restauration :\n1. Onyx Menu (Menu QR)\n2. Onyx Staff (Paie & Pointage)\n3. Pack Full\n\nTapez le numéro de votre choix :";
        else msg = "D'accord. La solution idéale pour vous est souvent le Pack Full ou Onyx Vente.\n1. Onyx Vente\n2. Pack Full\n\nTapez 1 ou 2 :";
        
        setBotMessages(prev => [...prev, { sender: 'bot', text: msg }]);
        setBotStep(2);
      }, 1000);
    }
    else if (botStep === 2) {
      currentData.product = reply;
      setBotUserData(currentData);
      saveLead({ source: 'Bot Fanta', intent: `Intéressé par l'option ${reply} (${currentData.sector})`, contact: currentData.name, full_name: currentData.name });

      setTimeout(() => {
        setBotMessages(prev => [...prev, { 
          sender: 'bot', 
          text: "Très bon choix ! Cette solution digitalise entièrement votre gestion via WhatsApp et sécurise vos encaissements.\n\nAvez-vous une question précise ou souhaitez-vous en discuter directement avec moi sur WhatsApp ?",
          options: ["Parler à Fanta (WhatsApp)"] 
        }]);
        setBotStep(3);
      }, 1500);
    }
    else if (botStep === 3) {
      if(reply === "Parler à Fanta (WhatsApp)") {
        saveLead({ source: 'Bot Fanta', intent: `Redirection WhatsApp`, contact: currentData.name, full_name: currentData.name });
        window.open(getWaLink(`Bonjour Fanta, je m'appelle ${currentData.name}. Je suis dans le secteur ${currentData.sector} et l'option ${currentData.product} m'intéresse.`), "_blank");
      } else {
        saveLead({ source: 'Bot Fanta', intent: `Question Bot: ${reply}`, contact: currentData.name, full_name: currentData.name, message: reply });
        setTimeout(() => {
          setBotMessages(prev => [...prev, { sender: 'bot', text: "Message bien reçu dans notre système ! Un expert va analyser votre demande. Je vous invite à cliquer sur 'Parler à Fanta' pour finaliser sur WhatsApp.", options: ["Parler à Fanta (WhatsApp)"] }]);
        }, 1000);
      }
    }
  };

  // --- PARTENAIRES ---
  const submitPartnerForm = async () => {
     if(!partnerForm.full_name || !partnerForm.contact || !partnerForm.status) return alert("Veuillez remplir les champs obligatoires.");
     try {
        const { error } = await supabase.from('partners').insert({
           full_name: partnerForm.full_name, contact: partnerForm.contact, city: partnerForm.city, 
           activity: partnerForm.status, objective: partnerForm.objective, prospection: partnerForm.strategy, status: 'En attente'
        });
        if(error) alert("Erreur : " + error.message);
        else {
          saveLead({ source: 'Formulaire Ambassadeur', intent: 'Candidature Partenaire', contact: partnerForm.contact, full_name: partnerForm.full_name });
          setPartnerStep('success');
          // Auto redirect to demo dashboard
          setTimeout(() => setPartnerStep('dashboard'), 4000);
        }
     } catch(e) {}
  };

  const commissionM1 = Math.round(packCounts.solo * 7500 * 0.30 + packCounts.trio * 17500 * 0.30 + packCounts.full * 30000 * 0.30 + packCounts.premium * 75000 * 0.30);
  const recurrentPerMonth = Math.round(packCounts.solo * 7500 * 0.10 + packCounts.trio * 17500 * 0.10 + packCounts.full * 30000 * 0.10 + packCounts.premium * 75000 * 0.10);
  const commissionM6 = commissionM1 + recurrentPerMonth * 5;

  const navigateTo = (view: any, scrollId?: string) => {
    setIsMobileMenuOpen(false); setActiveView(view);
    if (view === 'dashboard' && partnerStep === 'success') setPartnerStep('dashboard');
    else if (view === 'dashboard' && partnerStep !== 'dashboard') setPartnerStep('landing'); 
    if (scrollId) { setTimeout(() => document.getElementById(scrollId)?.scrollIntoView({ behavior: 'smooth' }), 100); } 
    else { window.scrollTo({ top: 0, behavior: 'smooth' }); }
  };

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black overflow-x-hidden pt-20 relative`}>
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none bg-zinc-50" style={{ backgroundImage: `url('https://i.ibb.co/chCcXT7p/back-site.png')`, backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

      <div className="relative z-10">
        <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center w-full z-50 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" width={150} height={50} className="h-[40px] w-auto object-contain" unoptimized />
            <span className={`${spaceGrotesk.className} font-black tracking-tighter text-2xl hidden sm:block`}>ONYX OPS</span>
          </div>
          
          <div className="hidden lg:flex gap-8 font-bold text-sm uppercase items-center">
            <button onClick={() => navigateTo('home', 'solutions')} className="hover:text-[#39FF14] transition">Solutions</button>
            <button onClick={() => navigateTo('home', 'tarifs')} className="hover:text-[#39FF14] transition">Tarifs</button>
            <button onClick={() => navigateTo('dashboard')} className={`${activeView === 'dashboard' ? 'text-[#39FF14] border-b-2 border-[#39FF14]' : ''} hover:text-[#39FF14] transition py-1`}>Partenaires</button>
            <button onClick={() => navigateTo('blog')} className={`${activeView === 'blog' ? 'text-[#39FF14] border-b-2 border-[#39FF14]' : ''} hover:text-[#39FF14] transition py-1`}>Blog</button>
            
            {currentUser ? (
               <div onClick={() => window.location.href = '/admin'} className="flex items-center gap-3 cursor-pointer bg-zinc-100 p-1.5 pr-4 rounded-full transition-colors shadow-sm">
                 <img src={currentUser.avatar_url || "https://ui-avatars.com/api/?name=User"} alt="" className="w-8 h-8 rounded-full" />
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase leading-none">{currentUser.full_name}</p>
                    <p className="text-[8px] font-bold text-[#39FF14] uppercase">Accès Admin</p>
                 </div>
               </div>
            ) : (
               <button onClick={() => setShowAuthModal(true)} className="bg-black text-[#39FF14] px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-md flex items-center gap-2">
                 <Lock size={14}/> Accès Hub
               </button>
            )}
          </div>

          <div className="flex lg:hidden items-center gap-4">
             {!currentUser && <button onClick={() => setShowAuthModal(true)} className="bg-black text-[#39FF14] px-4 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest">Hub</button>}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2.5 bg-zinc-100 rounded-full text-black">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 lg:hidden animate-in fade-in">
            <button onClick={() => navigateTo('home', 'solutions')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase`}>Solutions</button>
            <button onClick={() => navigateTo('home', 'tarifs')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase`}>Tarifs</button>
            <button onClick={() => navigateTo('dashboard')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase`}>Partenaires</button>
            <button onClick={() => navigateTo('blog')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase`}>Blog</button>
          </div>
        )}

        {/* ================================================================== */}
        {/* VUE : ACCUEIL                                                      */}
        {/* ================================================================== */}
        {activeView === 'home' && (
          <div className="animate-in fade-in duration-500">
            <header className="pt-20 pb-12 px-6 text-center max-w-5xl mx-auto">
              <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] mb-8`}>
                <Zap className="w-3 h-3 text-[#39FF14] fill-[#39FF14]" /> DAKAR BUSINESS ECOSYSTEM
              </div>
              <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-black leading-[1] tracking-tighter mb-6`}>
                DIGITALISEZ VOTRE <br/> <span className="text-[#39FF14] italic">PROPRE EMPIRE.</span>
              </h1>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium mb-10">
                La suite complète d'outils pour les entreprises, PME et commerces du Sénégal. Gérez vos ventes, stocks, employés, devis et livraisons via Whatsapp. 0 Engagement 0 coûts cachés.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-10">
                <button onClick={() => navigateTo('dashboard')} className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-8 py-4 rounded-full font-black text-sm uppercase tracking-wider hover:bg-[#39FF14] hover:text-black transition duration-300 shadow-xl">
                  <Handshake className="w-5 h-5" /> Devenir Partenaire
                </button>
                <button onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})} className="inline-flex items-center gap-2 border-2 border-black text-black px-8 py-4 rounded-full font-black text-sm uppercase hover:bg-black hover:text-[#39FF14] transition">
                  <Package className="w-5 h-5" /> Découvrir les Solutions
                </button>
              </div>

              <div className="pt-6 border-t border-zinc-200/60 max-w-md mx-auto">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Paiements Locaux Intégrés</p>
                <PaymentMethods />
              </div>
            </header>

            <section className="py-16 px-6 max-w-6xl mx-auto mb-10">
              <div className="grid md:grid-cols-2 gap-8 items-center h-full">
                <div className="bg-red-50/50 border border-red-100 rounded-[3rem] p-8 h-[350px] flex flex-col relative overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase">Avant Onyx</div>
                  <h3 className="font-black text-red-800 text-xl mb-6">Le Chaos sur WhatsApp</h3>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-red-100 shadow-sm max-w-[85%] text-sm text-zinc-600 animate-in slide-in-from-left-4" key={`avant-${scenarioIndex}`}>
                      <p className="font-bold text-xs text-red-500 mb-2">{RANDOM_SCENARIOS[scenarioIndex].avant.phone}</p>
                      {RANDOM_SCENARIOS[scenarioIndex].avant.text}
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-red-200 pt-4 text-xs font-bold text-red-600 uppercase">
                    <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {RANDOM_SCENARIOS[scenarioIndex].avant.issue}</span>
                  </div>
                </div>

                <div className="bg-black rounded-[3rem] p-8 h-[350px] flex flex-col relative shadow-[0_15px_40px_rgba(57,255,20,0.15)] border border-[#39FF14]/30">
                  <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase">Avec OnyxOps</div>
                  <h3 className="font-black text-white text-xl mb-6 flex items-center gap-2"><CheckCircle className="text-[#39FF14] w-6 h-6"/> Automatisation Parfaite</h3>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl animate-in slide-in-from-right-4" key={`apres-${scenarioIndex}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-zinc-400 font-bold uppercase">{RANDOM_SCENARIOS[scenarioIndex].apres.title}</span>
                        <span className="bg-[#39FF14]/20 text-[#39FF14] text-[10px] px-2 py-0.5 rounded-full font-black">{RANDOM_SCENARIOS[scenarioIndex].apres.tag}</span>
                      </div>
                      <p className="text-white text-sm">{RANDOM_SCENARIOS[scenarioIndex].apres.text}</p>
                      <p className="text-zinc-500 font-medium text-xs mt-2 italic">{RANDOM_SCENARIOS[scenarioIndex].apres.sub}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4 text-xs font-bold text-[#39FF14] uppercase">
                    <span className="flex items-center gap-1"><Zap className="w-4 h-4 fill-[#39FF14]" /> Business sous contrôle</span>
                  </div>
                </div>
              </div>
            </section>

            <section id="solutions" className="py-20 px-6 max-w-7xl mx-auto border-t border-zinc-100">
              <h2 className={`${spaceGrotesk.className} text-3xl font-black mb-12 text-center uppercase tracking-tighter`}>NOS 6 SOLUTIONS <span className="text-[#39FF14]">RADICALES</span></h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SOLUTIONS.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} onClick={() => { setSelectedSaaS(s); saveLead({ source: 'Site Web', intent: `Découverte Solution: ${s.id}` }); }} className="group relative overflow-hidden bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm hover:border-[#39FF14]/50 hover:shadow-xl transition-all cursor-pointer">
                      <div className="absolute right-0 top-0 w-28 h-28 opacity-[0.05] pointer-events-none"><Icon className="w-full h-full text-black" /></div>
                      <div className="bg-black text-[#39FF14] w-12 h-12 rounded-2xl flex items-center justify-center mb-6"><Icon className="w-6 h-6" /></div>
                      <h3 className={`${spaceGrotesk.className} text-xl font-black mb-4 italic uppercase flex justify-between items-center`}>{s.id} <span className="bg-zinc-100 text-black text-[9px] px-3 py-1 rounded-full not-italic group-hover:bg-[#39FF14] transition">+ Infos</span></h3>
                      <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-xl mb-4 line-clamp-2 border border-red-100">{s.pain}</p>
                      <div className="bg-[#39FF14]/10 p-4 rounded-2xl border-l-4 border-[#39FF14]">
                        <p className="text-[10px] font-black text-[#39FF14] uppercase mb-1">Solution Onyx</p>
                        <p className="text-xs font-bold text-black">{s.solution}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="tarifs" className="py-20 bg-black text-white rounded-[4rem] mx-4 px-6 relative overflow-hidden">
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-10">
                  <h2 className={`${spaceGrotesk.className} text-4xl font-black mb-4 uppercase`}>OFFRES <span className="text-[#39FF14]">NO-LIMIT.</span></h2>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">Pas d'abonnement caché.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {PACKS.map((pack) => {
                    const planDetails = PLAN_DETAILS[pack.id];
                    return (
                      <div key={pack.id} className={`${pack.id === 'trio' ? 'bg-gradient-to-br from-[#39FF14]/20 to-black border-2 border-[#39FF14] scale-105 shadow-2xl' : 'bg-zinc-900/50 border border-white/10 hover:border-zinc-700'} p-8 rounded-[3rem] transition flex flex-col`}>
                        <p className={`text-[10px] font-black tracking-[0.3em] ${pack.id === 'trio' ? 'text-[#39FF14]' : 'text-zinc-500'} mb-1 uppercase`}>{pack.label}</p>
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < 4 || pack.rating.startsWith('5') ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400/30 fill-yellow-400/30'}`} />))}
                          <span className="text-[9px] text-zinc-400 font-bold ml-1">{pack.rating} ({pack.avis})</span>
                        </div>
                        <div className={`text-3xl font-bold mb-6 italic ${pack.id === 'premium' ? 'text-red-500' : 'text-white'}`}>{pack.price.toLocaleString()}F <span className="text-xs text-zinc-500 font-normal">/ mois</span></div>
                        <ul className={`text-xs space-y-3 mb-8 flex-1 ${pack.id === 'trio' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {planDetails.benefits.map((ben, i) => <li key={i} className="flex gap-2">✔ {ben}</li>)}
                        </ul>
                        <button onClick={() => handleWaClick("Achat Tarif", `Bonjour, je veux COMMENCER l'offre ${pack.label} à ${pack.price}F.`)} className={`w-full block text-center py-4 rounded-2xl font-black text-sm uppercase ${pack.id === 'trio' ? 'bg-[#39FF14] text-black hover:bg-white' : 'bg-white text-black hover:bg-[#39FF14]'}`}>
                          Commencer
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section id="quiz-section" className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-100">
              <div className="bg-zinc-50 rounded-[4rem] p-8 md:p-12 grid lg:grid-cols-2 gap-12 items-center shadow-inner border border-zinc-200">
                <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-200 order-2 lg:order-1">
                  <img src="https://i.ibb.co/bRdvjrhV/ONYX-LOGOS-2.png" alt="Conseillère" className="object-cover w-full h-full" />
                  <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-3xl border-2 border-[#39FF14]">
                    <p className="font-black text-xs uppercase tracking-widest flex items-center gap-2 mb-2"><span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></span> Conseillère Onyx</p>
                    <p className="text-sm font-bold text-zinc-800 italic">"Sélectionnez votre profil à droite, je vous dirai exactement ce qu'il vous faut."</p>
                  </div>
                </div>
                <div className="order-1 lg:order-2">
                  <h2 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black mb-8 uppercase leading-[0.9] tracking-tighter`}>QUELLE OFFRE <br/><span className="text-[#39FF14] italic">POUR VOTRE BUSINESS ?</span></h2>
                  <div className="flex flex-wrap gap-3 mb-10">
                    {[{ id: 'WhatsApp', label: 'Vendeur WhatsApp' }, { id: 'Boutique', label: 'Boutique Physique' }, { id: 'Restaurant', label: 'Restaurant / PME' }, { id: 'Premium', label: 'Grande Échelle' }].map(p => (
                      <button key={p.id} onClick={() => setActiveProfiles(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} className={`px-5 py-3 rounded-2xl font-black text-xs uppercase transition-all border-2 ${activeProfiles.includes(p.id) ? 'bg-black text-[#39FF14] border-black shadow-lg' : 'bg-white text-zinc-600 border-zinc-200'}`}>
                        {p.label}
                      </button>
                    ))}
                  </div>
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-zinc-100 min-h-[200px] flex flex-col justify-center">
                    {activeProfiles.length === 0 && <div className="text-center text-zinc-400 font-bold text-sm uppercase italic">En attente de sélection...</div>}
                    {activeProfiles.length > 0 && (
                      <div className="animate-in zoom-in">
                        <h4 className="font-black text-2xl mb-2 flex items-center gap-2"><CheckCircle className="text-[#39FF14]"/> {activeProfiles.includes('Premium') ? 'Onyx Premium' : activeProfiles.includes('Restaurant') ? 'Pack Full' : activeProfiles.includes('Boutique') ? 'Pack Trio' : 'Onyx Solo'}</h4>
                        <p className="text-sm text-zinc-600 mb-6 font-medium">Digitalisez vos opérations dès maintenant.</p>
                        <button onClick={() => handleWaClick("Lead Quiz Profil", "Je veux verrouiller mon offre basée sur mon profil.")} className="w-full bg-black text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-[#39FF14] hover:text-black transition shadow-xl">Commander cette solution</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ================================================================== */}
        {/* VUE : WORKFLOW PARTENAIRE (TUNNEL OPTIMISÉ)                        */}
        {/* ================================================================== */}
        {activeView === 'dashboard' && (
          <div className="py-20 px-6 max-w-6xl mx-auto animate-in fade-in duration-500 min-h-[80vh]">
            {partnerStep === 'landing' && (
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-6 uppercase`}>Programme Ambassadeur Élite</div>
                  <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6`}>Générez une <span className="text-[#39FF14] italic">Rente Passive</span> au Sénégal.</h1>
                  <p className="text-zinc-600 font-bold mb-10 text-xl max-w-3xl mx-auto">Gagnez 30% en cash immédiat sur chaque vente de logiciel, et 10% de récurrent à vie. Fini les fins de mois difficiles et les business en ligne douteux.</p>
                  
                  <button onClick={() => setPartnerStep('form')} className="bg-black text-[#39FF14] px-12 py-6 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 transition shadow-[0_15px_40px_rgba(57,255,20,0.3)] animate-bounce">
                    Rejoindre le Mouvement
                  </button>
                </div>

                {/* VIDEO PLACEHOLDER */}
                <div className="bg-black rounded-[3rem] aspect-video relative overflow-hidden flex items-center justify-center border-4 border-[#39FF14]/30 mb-20 shadow-2xl group cursor-pointer">
                  <div className="absolute inset-0 bg-[url('https://i.ibb.co/chCcXT7p/back-site.png')] opacity-20"></div>
                  <div className="text-center relative z-10 group-hover:scale-110 transition-transform">
                     <PlayCircle className="w-24 h-24 text-[#39FF14] mx-auto mb-4" />
                     <p className="text-white font-black uppercase tracking-widest text-lg">Découvrez le programme (Vidéo)</p>
                  </div>
                </div>

                {/* SIMULATEUR PERSISTANT */}
                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-2 border-zinc-100 text-left mb-20">
                  <h3 className={`${spaceGrotesk.className} font-black text-3xl mb-8 uppercase flex items-center gap-3`}><Target className="text-[#39FF14] w-8 h-8"/> Simulez vos futurs revenus</h3>
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      {[
                        { id: 'solo', label: 'Pack Solo (Vendus/mois)', max: 50 },
                        { id: 'trio', label: 'Pack Trio (Vendus/mois)', max: 30 },
                        { id: 'full', label: 'Pack Full (Vendus/mois)', max: 20 },
                      ].map(pack => (
                        <div key={pack.id}>
                          <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-600">{pack.label}</label>
                            <span className="font-black text-[#39FF14] bg-black px-3 py-1 rounded-md text-xs">{packCounts[pack.id as PlanKey]}</span>
                          </div>
                          <input type="range" min="0" max={pack.max} value={packCounts[pack.id as PlanKey]} onChange={(e) => setPackCounts({...packCounts, [pack.id]: parseInt(e.target.value)})} className="w-full accent-black h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      ))}
                    </div>
                    <div className="bg-black text-white p-8 rounded-[2rem] relative shadow-2xl">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Gain Immédiat (Ce mois)</p>
                      <p className={`${spaceGrotesk.className} text-4xl font-black text-[#39FF14] mb-6`}>{commissionM1.toLocaleString()} F</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Rente Passive Mensuelle</p>
                      <p className={`${spaceGrotesk.className} text-2xl font-black text-white mb-6`}>+ {recurrentPerMonth.toLocaleString()} F / mois</p>
                      <div className="pt-6 border-t border-zinc-800">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#39FF14] mb-1">Projection à 6 mois (Sans rien faire)</p>
                        <p className={`${spaceGrotesk.className} text-3xl font-black text-white`}>{commissionM6.toLocaleString()} F</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TEMOIGNAGES ALEATOIRES */}
                <div className="bg-zinc-50 p-10 rounded-[3rem] border border-zinc-200 text-center mb-10">
                   <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Ils ont changé leur quotidien</p>
                   <div className="flex flex-col items-center justify-center min-h-[150px] animate-in slide-in-from-right-8 fade-in duration-500" key={testimonialIndex}>
                      <img src={AMBASSADOR_TESTIMONIALS[testimonialIndex].img} className="w-16 h-16 rounded-full mb-4 shadow-md border-2 border-[#39FF14]" alt="" />
                      <p className="text-lg font-bold italic text-zinc-800 max-w-2xl">"{AMBASSADOR_TESTIMONIALS[testimonialIndex].text}"</p>
                      <p className="mt-4 font-black uppercase text-xs">{AMBASSADOR_TESTIMONIALS[testimonialIndex].name} - <span className="text-[#39FF14]">{AMBASSADOR_TESTIMONIALS[testimonialIndex].role}</span></p>
                   </div>
                </div>
              </div>
            )}

            {partnerStep === 'form' && (
              <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-zinc-100 animate-in zoom-in">
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>Candidature Ambassadeur</h2>
                  <button onClick={() => setPartnerStep('landing')} className="text-xs font-bold text-zinc-400 hover:text-black"><X size={24}/></button>
                </div>
                
                <div className="space-y-4">
                  <input type="text" placeholder="Nom Complet *" value={partnerForm.full_name} onChange={e => setPartnerForm({...partnerForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black" />
                  <input type="tel" placeholder="Numéro WhatsApp *" value={partnerForm.contact} onChange={e => setPartnerForm({...partnerForm, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black" />
                  <input type="text" placeholder="Ville / Quartier" value={partnerForm.city} onChange={e => setPartnerForm({...partnerForm, city: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none" />
                  
                  <select value={partnerForm.status} onChange={e => setPartnerForm({...partnerForm, status: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none cursor-pointer">
                    <option value="" disabled>Votre Statut Actuel *</option>
                    <option>Salarié (Recherche revenu complémentaire)</option><option>Freelance / Indépendant</option><option>Sans emploi</option><option>Étudiant</option>
                  </select>

                  <select value={partnerForm.sales_exp} onChange={e => setPartnerForm({...partnerForm, sales_exp: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none cursor-pointer">
                    <option value="" disabled>Expérience Commerciale *</option>
                    <option>Débutant (J'ai la motivation)</option><option>J'ai déjà vendu sur les réseaux</option><option>Expert Commercial</option>
                  </select>

                  <input type="text" placeholder="Objectif de contrats / mois (Ex: 10 ventes)" value={partnerForm.objective} onChange={e => setPartnerForm({...partnerForm, objective: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none" />
                  <textarea placeholder="Comment comptez-vous prospecter ? (WhatsApp, Terrain, Facebook...)" value={partnerForm.strategy} onChange={e => setPartnerForm({...partnerForm, strategy: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none min-h-[100px]" />
                  
                  <button onClick={submitPartnerForm} className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition shadow-xl mt-4">
                    Soumettre Candidature (Validation &lt; 24h)
                  </button>
                </div>
              </div>
            )}

            {partnerStep === 'success' && (
               <div className="text-center max-w-lg mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border-2 border-[#39FF14] animate-in zoom-in">
                  <CheckCircle className="w-20 h-20 text-[#39FF14] mx-auto mb-6" />
                  <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-4`}>Félicitations !</h2>
                  <p className="text-zinc-600 mb-6 font-medium text-sm leading-relaxed">Votre profil a été enregistré avec succès. Nos équipes vont valider votre accès en moins de 24h et vous recevrez vos séquences de démarrage sur WhatsApp.</p>
                  <p className="text-xs font-black text-black uppercase bg-zinc-100 p-3 rounded-xl mb-8 animate-pulse">Redirection vers votre Hub de Démo...</p>
               </div>
            )}

            {partnerStep === 'dashboard' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <p className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-1 flex items-center gap-2">🟢 DÉMO - Ambassadeur Vérifié</p>
                    <h1 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter`}>Espace <span className="text-[#39FF14]">Partenaire</span></h1>
                  </div>
                  <button onClick={() => setPartnerStep('landing')} className="text-xs font-bold text-zinc-400 hover:text-black flex items-center gap-1"><X size={14}/> Quitter</button>
                </div>

                {/* BANNIÈRE AVANTAGE AMBASSADEUR */}
                <div className="bg-[#39FF14]/10 border border-[#39FF14] p-6 rounded-[2rem] mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
                   <div className="flex items-center gap-4">
                      <div className="bg-[#39FF14] text-black p-3 rounded-xl"><Sparkles size={24}/></div>
                      <div>
                         <p className="font-black uppercase text-sm">Avantage Exclusif Ambassadeur</p>
                         <p className="text-xs font-bold text-zinc-600">Bénéficiez de -20% sur l'achat de vos propres licences OnyxOps (Non déduit de votre marge).</p>
                      </div>
                   </div>
                   <button onClick={() => handleWaClick("Achat Licence Ambassadeur", "Bonjour, je suis ambassadeur et je veux acheter une licence avec ma remise de -20%.")} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition whitespace-nowrap">
                      Activer ma remise
                   </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group cursor-pointer hover:scale-105 transition">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition"><Wallet className="w-16 h-16"/></div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Solde Disponible (M1)</p>
                    <p className={`${spaceGrotesk.className} text-4xl font-black text-[#39FF14]`}>142.500 F</p>
                    <button className="mt-4 bg-[#39FF14] text-black px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-white transition flex items-center gap-1"><Wallet className="w-3 h-3"/> Retrait Wave</button>
                  </div>
                  <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-[2rem] hover:border-black transition cursor-pointer">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Revenu Récurrent</p>
                    <p className={`${spaceGrotesk.className} text-4xl font-black text-black`}>21.500 F <span className="text-sm text-zinc-500 font-normal">/mois</span></p>
                  </div>
                  <div className="bg-[#39FF14]/10 border border-[#39FF14] p-8 rounded-[2rem] hover:bg-[#39FF14]/20 transition cursor-pointer">
                    <p className="text-[10px] font-bold text-black uppercase tracking-widest mb-2">Ventes Actives</p>
                    <p className={`${spaceGrotesk.className} text-4xl font-black text-black`}>14 <span className="text-sm font-normal">Clients</span></p>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm mb-10">
                  <h3 className="font-black text-lg mb-6 uppercase flex items-center gap-2"><Link className="w-5 h-5 text-black"/> Votre Centre de Liens</h3>
                  <div className="bg-zinc-100 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
                    <span className="text-sm font-bold text-zinc-500 truncate w-full md:w-auto">https://onyxops.com/ref/s/Moussa882</span>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button onClick={() => handleCopy("https://onyxops.com/ref/s/Moussa882", "vente")} className="w-full md:w-auto bg-black text-[#39FF14] px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-800 transition">
                        {copiedLink === 'vente' ? 'Copié!' : 'Copier'}
                      </button>
                      <button onClick={() => handleWaClick("Partage Statut Ambassadeur", "J'ai découvert un outil incroyable pour gérer ma boutique. Voici mon lien : https://onyxops.com/ref/s/Moussa882")} className="w-full md:w-auto bg-[#39FF14] text-black px-6 py-3 rounded-xl text-[10px] font-black uppercase flex items-center justify-center gap-2 shadow-md hover:scale-105 transition">
                        <Share2 size={14}/> Partager WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================== */}
        {/* VUE : PAGE BLOG EXPERTISE                                          */}
        {/* ================================================================== */}
        {activeView === 'blog' && (
          <div className="py-20 px-6 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-[80vh]">
             <div className="text-center mb-16">
              <h1 className={`${spaceGrotesk.className} text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter`}>
                BLOG & <span className="text-[#39FF14] italic">EXPERTISE.</span>
              </h1>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {articles.map((article) => (
                <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-zinc-50 rounded-[3rem] p-8 border border-zinc-200 hover:border-[#39FF14] transition cursor-pointer flex flex-col">
                  <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-max mb-4">{article.category}</span>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black mb-4 leading-tight`}>{article.title}</h3>
                  <p className="text-xs font-black text-black uppercase tracking-widest flex items-center gap-2 mt-auto">Lire l'article <ArrowRight className="w-4 h-4" /></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= MODALES COMMUNES ================= */}

        {/* MODALE : ACCÈS HUB (Connexion / Inscription par SaaS) */}
        {showAuthModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-10 rounded-[3.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in">
              <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
              
              <div className="flex justify-center gap-4 mb-8 bg-zinc-100 p-1.5 rounded-2xl">
                 <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition ${authMode === 'login' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Se connecter</button>
                 <button onClick={() => setAuthMode('register')} className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition ${authMode === 'register' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Créer un compte</button>
              </div>

              <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-6 text-center`}>
                {authMode === 'login' ? 'Accéder à votre Instance' : 'Démarrer votre Essai'}
              </h2>

              <div className="space-y-4">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Sélectionnez le logiciel :</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {ECOSYSTEM_SAAS.map(s => (
                    <button key={s.id} onClick={() => setAuthSelectedSaas(s.id)} className={`p-3 text-[10px] font-black uppercase rounded-xl border-2 transition ${authSelectedSaas === s.id ? 'border-black bg-black text-[#39FF14]' : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-[#39FF14]'}`}>
                      {s.name}
                    </button>
                  ))}
                </div>

                {authMode === 'login' ? (
                   <button onClick={() => window.open(`https://${authSelectedSaas}.onyxops.com/login`, '_blank')} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black text-xs uppercase shadow-xl hover:scale-105 transition flex justify-center items-center gap-2">
                     <LogIn size={16}/> Ouvrir {ECOSYSTEM_SAAS.find(s=>s.id === authSelectedSaas)?.name}
                   </button>
                ) : (
                   <button onClick={() => handleWaClick("Création Compte Hub", `Bonjour, je souhaite activer mon instance gratuite pour ${ECOSYSTEM_SAAS.find(s=>s.id === authSelectedSaas)?.name}.`)} className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl hover:bg-[#39FF14] hover:text-black transition flex justify-center items-center gap-2">
                     <UserPlus size={16}/> Activer Essai Gratuit
                   </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MODALE : LECTURE D'ARTICLE DE BLOG */}
        {selectedArticle && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={() => setSelectedArticle(null)}>
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white rounded-[3rem] max-w-2xl w-full p-8 md:p-12 shadow-2xl animate-in zoom-in max-h-[90vh] overflow-y-auto">
              <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-black hover:text-white"><X className="w-5 h-5" /></button>
              <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 inline-block">{selectedArticle.category}</span>
              <h2 className={`${spaceGrotesk.className} text-3xl font-black mb-8 leading-tight tracking-tighter`}>{selectedArticle.title}</h2>
              <div className="text-zinc-700 font-medium leading-relaxed space-y-4 mb-10 text-sm whitespace-pre-wrap">{selectedArticle.content}</div>
              <button onClick={() => handleWaClick("Lead Blog Expert", `Bonjour Onyx, j'ai lu l'article "${selectedArticle.title}" et j'aimerais échanger avec un expert.`)} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition">
                Discuter avec un expert
              </button>
            </div>
          </div>
        )}

        {/* MODALE SAAS DETAILS (DEPUIS L'ACCUEIL) */}
        {selectedSaaS && (() => {
          const SaasIcon = selectedSaaS.icon;
          return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white p-10 rounded-[3.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in">
                <button className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition" onClick={() => setSelectedSaaS(null)}><X size={20}/></button>
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-black text-[#39FF14] p-3 rounded-2xl"><SaasIcon size={24} /></div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase italic tracking-tighter`}>{selectedSaaS.id}</h3>
                </div>
                <div className="space-y-6">
                  <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Quelle est votre activité ?</p>
                  <div className="grid grid-cols-1 gap-3">
                    {["Boutique / Prêt-à-porter", "Restaurant / Fast-Food", "E-commerce", "Agence de Services"].map((metier) => (
                      <button key={metier} onClick={() => { setSaasMetier(metier); saveLead({ source: 'Site Web', intent: `Choix Métier SaaS: ${selectedSaaS.id} | ${metier}` }); }} className={`text-left p-4 rounded-2xl text-xs font-black uppercase transition-all border-2 ${saasMetier === metier ? 'bg-black text-[#39FF14] border-black' : 'bg-zinc-50 border-transparent hover:border-zinc-200'}`}>
                        {metier}
                      </button>
                    ))}
                  </div>
                  {saasMetier && (
                    <div className="pt-6 animate-in slide-in-from-bottom-4 space-y-4">
                      <div className="bg-zinc-50 p-5 rounded-[2rem] border-2 border-zinc-200 hover:border-black transition">
                        <p className="text-[10px] font-black uppercase text-zinc-600 mb-1">Solution seule</p>
                        <p className="text-sm font-bold text-zinc-800 mb-4">J'achète <span className="text-[#39FF14]">{selectedSaaS.id}</span> uniquement.</p>
                        <button onClick={() => handleWaClick("Achat Individuel", `Bonjour, je suis en activité ${saasMetier}. Je veux acheter ${selectedSaaS.id} uniquement.`)} className="w-full bg-black text-white py-4 rounded-xl font-black text-[10px] uppercase shadow-lg hover:bg-[#39FF14] hover:text-black transition">Acheter {selectedSaaS.id}</button>
                      </div>
                      <div className="bg-[#39FF14]/10 p-6 rounded-[2rem] border-2 border-[#39FF14] relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20"><Flame size={40} className="text-[#39FF14]" /></div>
                        <p className="text-[10px] font-black uppercase text-[#39FF14] mb-2 flex items-center gap-1"><Zap size={12}/> Bundle conseillé</p>
                        <p className="text-xs font-bold text-zinc-800 mb-4">Passez au {selectedSaaS.upsellName}.</p>
                        <button onClick={() => handleWaClick("Achat Upsell", `Bonjour, je suis en activité ${saasMetier}. Je veux passer au ${selectedSaaS.upsellName}.`)} className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition">Passer au {selectedSaaS.upsellName}</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* --- BOT FLOTTANT INTELLIGENT "FANTA" --- */}
        <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end">
          {isBotOpen && (
            <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-[#39FF14] p-0 mb-4 w-[340px] h-[450px] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
               <div className="bg-black p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <img src="https://i.ibb.co/bRdvjrhV/ONYX-LOGOS-2.png" alt="Fanta" className="w-10 h-10 rounded-full object-cover border border-[#39FF14]" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#39FF14] rounded-full border border-black animate-pulse"></div>
                     </div>
                     <div>
                        <p className="text-[#39FF14] font-black uppercase text-xs">Fanta - Conseillère</p>
                        <p className="text-white text-[9px] uppercase tracking-widest">En ligne</p>
                     </div>
                  </div>
                  <button onClick={() => setIsBotOpen(false)} className="text-zinc-400 hover:text-white transition"><X size={18}/></button>
               </div>
               
               <div className="flex-1 bg-zinc-50 p-4 overflow-y-auto flex flex-col space-y-4">
                  {botMessages.map((msg, i) => (
                     <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                        <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm' : 'bg-black text-[#39FF14] rounded-tr-none shadow-md'}`}>
                           {msg.text}
                        </div>
                        {msg.options && (
                           <div className="flex flex-col gap-2 mt-2 w-full pl-2">
                              {msg.options.map((opt: string, idx: number) => (
                                 <button key={idx} onClick={() => processBotReply(opt)} className="bg-zinc-100 border border-zinc-200 text-black text-xs font-bold p-2.5 rounded-xl hover:bg-black hover:text-[#39FF14] transition text-left">
                                    {opt}
                                 </button>
                              ))}
                           </div>
                        )}
                     </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>

               <div className="p-3 bg-white border-t border-zinc-200 flex gap-2">
                  <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && processBotReply(userReply)} placeholder="Écrire votre réponse..." className="flex-1 bg-zinc-100 rounded-xl px-4 outline-none text-sm font-bold focus:ring-1 focus:ring-black" />
                  <button onClick={() => processBotReply(userReply)} className="bg-[#39FF14] p-3 rounded-xl text-black hover:scale-105 transition"><Send size={18}/></button>
               </div>
            </div>
          )}

          {!isBotOpen && (
             <button onClick={() => setIsBotOpen(true)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#39FF14] hover:scale-110 transition-transform bg-black relative group animate-bounce">
               <img src="https://i.ibb.co/bRdvjrhV/ONYX-LOGOS-2.png" alt="Conseillère Fanta" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
               <div className="absolute top-1 right-1 w-3 h-3 bg-[#39FF14] border-2 border-black rounded-full animate-pulse"></div>
             </button>
          )}
        </div>

      </div>
    </div>
  );
}
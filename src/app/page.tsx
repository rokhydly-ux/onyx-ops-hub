"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

import { 
  Smartphone, Truck, Box, Utensils, Calendar, 
  ArrowRight, Users, Target, 
  Zap, CheckCircle, AlertCircle, Lock, Handshake, Package, X,
  Clock, Mail, Menu, Star, MessageSquare, Flame, Share2, Link, Wallet, Check, Send, TrendingUp, PlayCircle, LogIn, UserPlus, Sparkles, Bell ,FileText, ChevronRight, Search,
  ChevronDown
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };
const inter = { className: "" };

type PlanKey = "solo" | "duo" | "trio" | "full" | "premium" | "master" | "elite";

// --- DATA ---
const ECOSYSTEM_SAAS = [
  { id: "vente", name: "Onyx Jaay", type: "Catalogue & Devis WhatsApp" },
  { id: "tiak", name: "Onyx Tiak", type: "Logistique & Livreurs" },
  { id: "stock", name: "Onyx Stock", type: "Gestion d'Inventaire" },
  { id: "menu", name: "Onyx Menu", type: "Menu QR & Commandes" },
  { id: "booking", name: "Onyx Booking", type: "Réservations & Acomptes" },
  { id: "staff", name: "Onyx Staff", type: "Pointage & Paie" },
  { id: "formation", name: "Onyx Formation", type: "Marketing & Ads" },
  { id: "fit", name: "Onyx Fit", type: "Rééquilibrage Alimentaire" },
  { id: "tontine", name: "Onyx Tontine", type: "Finance & Tontine" },
  { id: "duo", name: "Pack Duo", type: "Vente + Stock" },
  { id: "trio", name: "Pack Trio", type: "Vente + Stock + Tiak" },
  { id: "master", name: "Onyx Master", type: "Formation + SaaS" },
];

const ONBOARDING_CATEGORIES = [
  "Restauration / Fast-Food",
  "Boutique / Prêt-à-porter",
  "E-commerce / Vente en ligne",
  "Prestation de services",
  "Autre"
];

const PLAN_DETAILS: Record<PlanKey, { title: string; desc: string; benefits: string[]; why: string; cible: string; avantage: string; chiffreCle: string }> = {
  solo: { title: "Onyx Solo", desc: "La porte d'entrée pour digitaliser.", benefits: ["Catalogue interactif & Devis", "Lien de commande unique", "Fidélisation automatique"], why: "Gagner 2h par jour.", cible: "Vendeurs WhatsApp", avantage: "Fini les devis raturés.", chiffreCle: "+15% de ventes" },
  duo: { title: "Pack Duo", desc: "Vente + Stock automatisé (Phydigital).", benefits: ["Catalogue pro interactif", "Inventaire mis à jour", "Alertes WhatsApp ruptures"], why: "Sécuriser vos ventes.", cible: "Boutiques physiques", avantage: "Stop aux vols et oublis.", chiffreCle: "Marge +20%" },
  trio: { title: "Pack Trio", desc: "Vente + Stock + Logistique (Tiak).", benefits: ["Inventaire temps réel", "Facturation pro", "Suivi livreurs"], why: "Contrôle total du cash.", cible: "E-commerçants", avantage: "Maîtrise complète.", chiffreCle: "0 rupture" },
  full: { title: "Pack Full", desc: "Les 6 SaaS Onyx ensemble.", benefits: ["RH, Paie & Logistique", "Menu QR & Réservations", "Rapports hebdo"], why: "Pour scaler rapidement.", cible: "PME & Agences", avantage: "Digitalisation 360°.", chiffreCle: "Gain de 10h/sem" },
  premium: { title: "Onyx Premium", desc: "IA et Marketing.", benefits: ["Studio Créatif IA", "CRM & Relance auto", "Conseiller dédié"], why: "Pour dominer le marché.", cible: "Franchises", avantage: "IA intégrée.", chiffreCle: "Croissance X2" },
  master: { title: "Onyx Master", desc: "Formation + 1 Mois Solo Offert.", benefits: ["Formation complète", "1 mois d'Onyx Solo offert", "Support prioritaire"], why: "Pour partir de zéro.", cible: "Débutants & Nouveaux", avantage: "L'offre ultime.", chiffreCle: "Lancement réussi" },
  elite: { title: "Onyx Elite", desc: "Pack Sans Limit avec CRM + Studio Créatif.", benefits: ["CRM complet", "Studio Créatif IA", "Accès illimité aux 9 SaaS", "Conseiller dédié"], why: "Pour dominer le marché.", cible: "Franchises & Grandes structures", avantage: "Tout inclus.", chiffreCle: "Sans limite" },
};

const SOLUTIONS = [
  { id: "Onyx Jaay", icon: Smartphone, category: "Vente & Boutique", price: 9900, pain: "Photos WhatsApp interminables et devis gribouillés.", solution: "Catalogue digital interactif et générateur de devis PDF pro en 60s.", upsellPack: "duo", upsellName: "Pack Duo (Jaay + Stock)" },
  { id: "Onyx Tiak", icon: Truck, category: "Logistique", price: 9900, pain: "Le gérant ne sait jamais où est son cash ou son livreur.", solution: "Suivi logistique et sécurisation des encaissements en temps réel.", upsellPack: "trio", upsellName: "Pack Trio (Logistique incluse)" },
  { id: "Onyx Stock", icon: Box, category: "Vente & Boutique", price: 9900, pain: "Rupture de stock fatale ou vols d'inventaire non détectés.", solution: "Inventaire par scan et alertes WhatsApp avant la rupture.", upsellPack: "duo", upsellName: "Pack Duo (Vente + Stock)" },
  { id: "Onyx Menu", icon: Utensils, category: "Restauration", price: 9900, pain: "Menus sales, chers à imprimer et erreurs de commande.", solution: "QR Menu interactif : le client scanne et commande proprement.", upsellPack: "trio", upsellName: "Pack Trio (Encaissements)" },
  { id: "Onyx Booking", icon: Calendar, category: "Services", price: 9900, pain: "Rendez-vous manqués (No-shows) et planning brouillon.", solution: "Réservations en ligne avec paiement d'acompte sécurisé.", upsellPack: "full", upsellName: "Pack Full" },
  { id: "Onyx Staff", icon: Users, category: "Gestion & RH", price: 9900, pain: "Casse-tête des avances Tabaski, fiches de paie manuelles.", solution: "Pointage GPS WhatsApp, fiches de paie par QR Code.", upsellPack: "full", upsellName: "Pack Full" },
  { id: "Onyx Formation", icon: TrendingUp, category: "Marketing", price: 29900, pain: "Manque de visibilité et publicités inefficaces qui ruinent le budget.", solution: "Maîtrisez le marketing digital, la pub Facebook/TikTok et le design Canva.", upsellPack: "master", upsellName: "Onyx Master (Formation + SaaS)" },
  { id: "Onyx Fit", icon: Flame, category: "Services", price: 6000, pain: "Suivi diététique brouillon et perte de motivation des clientes.", solution: "Rééquilibrage alimentaire à l'africaine avec la coach Amina, suivi interactif et relances auto.", upsellPack: "full", upsellName: "Pack Full" },
  { id: "Onyx Tontine", icon: Wallet, category: "Finance", price: 6000, pain: "Cahiers perdus et cotisations non suivies avec risques de fraude.", solution: "Gestion de tontine automatisée et transparente avec reçus WhatsApp.", upsellPack: "full", upsellName: "Pack Full" },
];

const PACKS: Array<{ id: PlanKey | "elite"; name: string; price: number | string; label: string; rating: string; avis: number; isUnique?: boolean }> = [
  { id: "solo", name: "Solo", price: 9900, label: "Onyx Solo", rating: "4.9/5", avis: 142 },
  { id: "duo", name: "Pack Duo", price: 17500, label: "Pack Duo", rating: "4.8/5", avis: 95 },
  { id: "trio", name: "Pack Trio", price: 24900, label: "Pack Trio", rating: "5.0/5", avis: 89 },
  { id: "elite", name: "Onyx Elite", price: 78900, label: "Onyx Elite", rating: "5.0/5", avis: 89, isUnique: true },
  { id: "master", name: "Onyx Master", price: 39900, label: "Bundle Master", rating: "5.0/5", avis: 215, isUnique: true },
];

const AMBASSADOR_TESTIMONIALS = [
  { name: "Moussa D.", role: "Étudiant", img: "https://ui-avatars.com/api/?name=Moussa+D&background=000&color=39FF14", text: "Fini les fins de mois difficiles. Je paie mon loyer juste avec mes commissions de renouvellement." },
  { name: "Fatou B.", role: "Commerciale", img: "https://ui-avatars.com/api/?name=Fatou+B&background=000&color=39FF14", text: "Je propose Onyx aux boutiques que je visite. L'argumentaire est si fort que ça se vend tout seul." },
  { name: "Cheikh N.", role: "Freelance", img: "https://ui-avatars.com/api/?name=Cheikh+N&background=000&color=39FF14", text: "La rente passive cest du sérieux. J'ai 15 clients réguliers, l'argent tombe chaque mois sans rien faire." },
  { name: "Awa C.", role: "Gérante Boutique", img: "https://ui-avatars.com/api/?name=Awa+C&background=000&color=39FF14", text: "J'utilise Onyx et j'en ai parlé à 3 amies commerçantes. Leurs abonnements me rapportent de l'argent tous les mois !" },
  { name: "Ibrahima Fall", role: "Consultant Digital", img: "https://ui-avatars.com/api/?name=Ibrahima+F&background=000&color=39FF14", text: "Le meilleur programme d'affiliation au Sénégal. Transparence totale et paiements toujours à l'heure via Wave." }
];

const FAQ_DATA = [
  {
    question: "Qu'est-ce que OnyxOps exactement ?",
    answer: "OnyxOps est une suite d'outils digitaux (SaaS) conçue pour les entreprises sénégalaises. Nous automatisons vos opérations via WhatsApp : gestion des ventes, inventaire, logistique, ressources humaines, et bien plus, pour vous faire gagner du temps et de l'argent."
  },
  {
    question: "Dois-je m'engager sur une longue durée ?",
    answer: "Non, il n'y a aucun engagement de durée. Nos abonnements sont mensuels et vous pouvez arrêter à tout moment. Nous sommes convaincus que la valeur de nos outils vous fidélisera naturellement."
  },
  {
    question: "Est-ce que c'est compliqué à utiliser ?",
    answer: "Pas du tout ! Nos outils sont pensés pour être utilisés directement sur WhatsApp, un environnement que vous et vos équipes maîtrisez déjà. La prise en main est quasi-instantanée et nous offrons un support complet pour vous accompagner."
  },
  {
    question: "Quels sont les moyens de paiement acceptés ?",
    answer: "Nous acceptons les principaux moyens de paiement mobile au Sénégal, notamment Wave, Orange Money, et Free Money, pour une flexibilité maximale pour vous et vos clients."
  },
  {
    question: "Le programme ambassadeur, comment ça marche ?",
    answer: "C'est simple : vous recommandez nos solutions à votre réseau. Pour chaque client qui s'abonne grâce à vous, vous touchez une commission de 30% sur le premier paiement, puis une rente de 10% sur tous les renouvellements, à vie."
  },
  {
    question: "Proposez-vous une période d'essai ?",
    answer: "Oui, vous pouvez tester nos solutions gratuitement. Discutez simplement avec notre assistant WhatsApp ou créez un compte pour activer votre période d'essai sans engagement."
  }
];

const RANDOM_SCENARIOS = [
  { avant: { phone: "+221 77 000 00 00", text: "C'est quoi l'avance Tabaski de Modou déjà ?", tag: "RH", issue: "Pertes d'argent" }, apres: { tag: "Pointage OK", title: "Ressources Humaines", text: "Modou S. a partagé sa localisation.", sub: "Avance Tabaski déduite : -25.000F" } },
  { avant: { phone: "+221 76 111 11 11", text: "Tu peux me refaire le devis j'ai perdu la feuille !", tag: "Vente", issue: "Temps perdu" }, apres: { tag: "Devis OK", title: "Vente & Stock", text: "Devis #1042 accepté & payé en ligne.", sub: "Stock mis à jour automatiquement." } },
  { avant: { phone: "+221 78 222 22 22", text: "Le livreur ne répond pas 😡", tag: "Logistique", issue: "Clients fâchés" }, apres: { tag: "En route", title: "Logistique Tiak", text: "Commande #402 localisée en temps réel.", sub: "Le client suit le livreur sur WhatsApp." } },
  { avant: { phone: "+221 77 333 33 33", text: "Il reste combien de robes rouges ?", tag: "Stock", issue: "Rupture surprise" }, apres: { tag: "Alerte Stock", title: "Gestion d'inventaire", text: "Alerte : Robe Rouge niveau critique (2).", sub: "Commande fournisseur générée." } },
  { avant: { phone: "+221 76 444 44 44", text: "Je voudrais commander mais le menu est flou...", tag: "Menu", issue: "Ventes ratées" }, apres: { tag: "Commande Reçue", title: "Menu Digital", text: "Nouvelle commande #55 via le Menu QR.", sub: "Payé via Orange Money." } }
];

const RECENT_NOTIFICATIONS = [
  { name: "Aïcha S.", action: "vient de souscrire au", product: "Pack Trio", time: "à l'instant", icon: Package },
  { name: "Resto Dakar", action: "a activé", product: "Onyx Menu", time: "il y a 2 min", icon: Utensils },
  { name: "Mamadou Fall", action: "a démarré son essai", product: "Onyx Jaay", time: "il y a 5 min", icon: Smartphone },
  { name: "Boutique Fanta", action: "a généré 45 devis avec", product: "Pack Solo", time: "il y a 12 min", icon: FileText },
  { name: "Ousmane D.", action: "est devenu partenaire", product: "Ambassadeur", time: "il y a 20 min", icon: Handshake },
  { name: "Agence Digital", action: "a acheté le", product: "Pack Full", time: "il y a 35 min", icon: Star },
];

const PaymentMethods = () => (
  <div className="flex flex-wrap items-center justify-center gap-6 mt-6">
    <img src="https://upload.wikimedia.org/wikipedia/commons/8/87/Wave_Mobile_Money_logo.png" alt="Wave" className="h-6 md:h-8 object-contain" />
    <img src="https://www.rapyd.net/wp-content/uploads/2025/04/Orange-Money-logo-500x336-1.png" alt="Orange Money" className="h-6 md:h-8 object-contain" />
    <div className="h-6 md:h-8 px-4 bg-black text-white rounded-lg flex items-center justify-center font-black italic text-[10px] md:text-xs tracking-widest shadow-md">
      <span className="text-[#39FF14]">YAS</span> MONEY
    </div>
  </div>
);

export default function OnyxOpsElite() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'home' | 'about' | 'blog' | 'dashboard'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // MODALES & FILTRES
  const [showSaasChoice, setShowSaasChoice] = useState<any>(null);
  const [fomoTime, setFomoTime] = useState(900); // 15 mins for Upsell timer
  const [saasFilter, setSaasFilter] = useState("Tout");
  const saasCategories = ["Tout", "Vente & Boutique", "Restauration", "Logistique", "Gestion & RH", "Services", "Finance", "Marketing"];
  const filteredSolutions = saasFilter === "Tout" ? SOLUTIONS : SOLUTIONS.filter(s => s.category.includes(saasFilter));

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authSelectedSaas, setAuthSelectedSaas] = useState("vente");

  // QUIZ INTERACTIF
  const [quizAnswers, setQuizAnswers] = useState({ size: '', sector: '', customSector: '', marketing: '' });
  const [quizStep, setQuizStep] = useState(0);
  const [quizResult, setQuizResult] = useState<{packId: string, message: string} | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ONBOARDING (Maimouna Modal & Exit Intent)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [leadData, setLeadData] = useState({ name: '', phone: '', email: '', category: '', customCategory: '', saas: '' });
  const [countryCode, setCountryCode] = useState("+221"); // NOUVEAU: Dropdown pays
  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasTriggeredExitIntent, setHasTriggeredExitIntent] = useState(false);

  // NOUVEAU: Fonction de validation stricte du téléphone
  const validatePhone = (code: string, number: string) => {
    const cleanNumber = number.replace(/\s+/g, '');
    if (code === '+221') {
      const regexSenegal = /^(7[05678]\d{7})$/; // Commence par 70, 75, 76, 77 ou 78 suivi de 7 chiffres
      return regexSenegal.test(cleanNumber);
    }
    return cleanNumber.length >= 6; // Minimum syndical pour l'international
  };
  
  // USER
  const [currentUser, setCurrentUser] = useState<any>(null);

  // BOT WHATSAPP "FANTA" & LEADS
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botMessages, setBotMessages] = useState<any[]>([]);
  const [botStep, setBotStep] = useState(0);
  const [botUserData, setBotUserData] = useState({ name: "", phone: "", sector: "", product: "" });
  const [userReply, setUserReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // PREUVES SOCIALES & SCENARIOS
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [notificationIndex, setNotificationIndex] = useState(0);
  const [showNotification, setShowNotification] = useState(true);

  // WORKFLOW PARTENAIRE
  const [partnerStep, setPartnerStep] = useState<'landing' | 'form' | 'success' | 'dashboard'>('landing');
  const [packCounts, setPackCounts] = useState<Record<PlanKey, number>>({ solo: 2, duo: 1, trio: 1, full: 0, premium: 0, master: 0, elite: 0 });
  const [partnerForm, setPartnerForm] = useState({ full_name: "", contact: "", city: "", address: "", country: "", status: "", sales_exp: "", objective: "", strategy: "" });
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [blogEmail, setBlogEmail] = useState("");

  const waNumber = "221785338417";
  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleOutsideClick = (setter: any) => (e: any) => {
    if (e.target.id === "modal-overlay") setter(false);
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
      } catch (err) { console.warn(err); }
    };
    initData();

    // Fetch articles from DB
    const fetchArticles = async () => {
      const { data } = await supabase.from('marketing_articles').select('*').order('created_at', { ascending: false });
      if (data && data.length > 0) {
        setArticles(data);
      } else {
        // Fallback default articles if DB is empty
        setArticles([
           { id: 1, title: "Comment doubler vos ventes WhatsApp en 2026", desc: "L'automatisation est reine pour les PME.", category: "Vente & Marketing", readTime: "4 min" },
           { id: 2, title: "Finis les vols de stocks dans votre boutique", desc: "Les méthodes modernes pour tout tracer.", category: "Gestion", readTime: "6 min" },
           { id: 3, title: "Pourquoi les menus papiers tuent votre restaurant", desc: "Le digital au service du Fast Food sénégalais.", category: "Restauration", readTime: "3 min" }
        ]);
      }
    };
    fetchArticles();

    setTimeout(() => {
      setIsBotOpen(true);
      setBotMessages([{ 
        sender: 'bot', 
        text: "👋 Bonjour ! Je suis Fanta, conseillère clientèle OnyxOps. J'aimerais vous aider à trouver la meilleure solution pour votre business.\n\nPour commencer, quel est votre prénom ? (Ex: Amadou)" 
      }]);
    }, 3000);

    const scenarioInterval = setInterval(() => setScenarioIndex((prev) => (prev + 1) % RANDOM_SCENARIOS.length), 4000);
    const testimonialInterval = setInterval(() => setTestimonialIndex((prev) => (prev + 1) % AMBASSADOR_TESTIMONIALS.length), 5000);
    
    const notifInterval = setInterval(() => {
       setShowNotification(false);
       setTimeout(() => {
          setNotificationIndex((prev) => (prev + 1) % RECENT_NOTIFICATIONS.length);
          setShowNotification(true);
       }, 500);
    }, 8000);

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggeredExitIntent) {
        setShowExitIntent(true);
        setHasTriggeredExitIntent(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    
    return () => { 
      clearInterval(scenarioInterval); 
      clearInterval(testimonialInterval); 
      clearInterval(notifInterval);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [hasTriggeredExitIntent]);

  // FOMO Timer Logic pour l'upsell
  useEffect(() => {
      if (showSaasChoice) {
          setFomoTime(900);
          const interval = setInterval(() => setFomoTime(prev => prev > 0 ? prev - 1 : 0), 1000);
          return () => clearInterval(interval);
      }
  }, [showSaasChoice]);
  const formatTime = (secs: number) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages]);

  useEffect(() => {
    if (showSaasChoice || isMobileMenuOpen || selectedArticle || showAuthModal || showOnboarding || showExitIntent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showSaasChoice, isMobileMenuOpen, selectedArticle, showAuthModal, showOnboarding, showExitIntent]);

  const saveLead = async (data: { source: string; intent: string; contact?: string; message?: string; full_name?: string; name?: string; address?: string; country?: string; [key: string]: any }) => {
    try {
      const extra = { city: data.city, address: data.address, country: data.country, status: data.status, sales_exp: data.sales_exp, objective: data.objective, strategy: data.strategy };
      
      const finalName = data.full_name || data.name || 'Visiteur Web';

      const payload: Record<string, any> = {
        source: data.source || 'Site Web',
        intent: data.intent || 'Contact',
        phone: data.contact || '',
        message: typeof data.message === 'string' ? data.message : JSON.stringify({ ...extra, ...data }) || '',
        full_name: finalName,
        status: 'Nouveau',
        password: 'central2026' // Mot de passe par défaut pour permettre le login
      };
      
      if (data.address) payload.address = data.address;
      if (data.country) payload.country = data.country;
      if (data.email) payload.email = data.email;
      
      const { error } = await supabase.from('leads').insert([payload]);
      if (error) {
        console.error("ERREUR SUPABASE (Leads) :", error.message);
      }
    } catch (e) { 
      console.error("ERREUR CATCH (Leads) :", e); 
    }
  };

  const handleWaClick = async (intent: string, msg: string) => {
    await saveLead({ source: 'Bouton Site', intent, message: msg });
    window.open(getWaLink(msg), "_blank");
  };

  const handleQuizSubmit = (field: string, value: string) => {
    const newAns = { ...quizAnswers, [field]: value };
    setQuizAnswers(newAns);

    if (field === 'size') {
        setQuizStep(1);
    } else if (field === 'sector') {
        if (value === 'Autre') return; 
        setQuizStep(2);
    } else if (field === 'customSector') {
        setQuizStep(2);
    } else if (field === 'marketing') {
        let packId = 'solo';
        let msg = '';
        
        if (value === 'Oui') { 
           packId = 'master'; 
           msg = "En fonction de vos réponses, Onyx Master avec notre formation complète est la clé absolue de votre croissance (+100% de prospects visés)."; 
        }
        else if (newAns.sector === 'Restauration') { 
           packId = 'trio'; 
           msg = "Pour un établissement de restauration, l'automatisation de vos encaissements et livraisons est vitale. Le Pack Trio est parfait."; 
        }
        else if (newAns.size !== 'Petit commerçant (1-3 employés)') { 
           packId = 'trio'; 
           msg = "En tant que PME structurée, la centralisation des stocks et de la logistique est obligatoire pour scaler sans stress."; 
        }
        else { 
           packId = 'duo'; 
           msg = "Pour démarrer efficacement, contrôler vos ventes et votre stock est la priorité absolue. Le Pack Duo réduit vos ruptures à 0."; 
        }

        setQuizResult({ packId, message: msg });
        setQuizStep(3);
        setTimeout(() => document.getElementById('tarifs')?.scrollIntoView({ behavior: 'smooth' }), 500);
    }
  };

  const submitLeadForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(countryCode, leadData.phone)) {
      alert(countryCode === '+221' ? "Format invalide pour le Sénégal (ex: 77 123 45 67)" : "Numéro de téléphone invalide.");
      return;
    }

    const finalPhone = `${countryCode} ${leadData.phone.replace(/\s+/g, '')}`;
    const finalCategory = leadData.category === 'Autre' ? leadData.customCategory : leadData.category;
    const msg = `🚀 *NOUVEAU LEAD (Via Site)*\n\n*Nom:* ${leadData.name}\n*Téléphone:* ${finalPhone}\n*Email:* ${leadData.email || 'Non renseigné'}\n*Activité:* ${finalCategory}\n*SaaS ciblé:* ${leadData.saas || 'Pack Trio'}\n\n_Le client souhaite créer son compte._`;

    await saveLead({
       source: 'Onboarding Site',
       intent: `Création Compte (${leadData.saas || 'Pack Trio'})`,
       contact: finalPhone,
       full_name: leadData.name,
       message: `Activité: ${finalCategory} | Email: ${leadData.email}`
    });

    setShowOnboarding(false);
    setShowSaasChoice(null);
    setShowExitIntent(false);

    alert(`Merci ${leadData.name} ! Vos informations sont enregistrées.\nVous allez être redirigé vers notre équipe WhatsApp pour l'activation immédiate de votre espace.`);
    window.open(getWaLink(msg), "_blank");
  };

  const submitExitIntentLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhone(countryCode, leadData.phone)) {
      alert(countryCode === '+221' ? "Format invalide pour le Sénégal (ex: 77 123 45 67)" : "Numéro de téléphone invalide.");
      return;
    }

    const finalPhone = `${countryCode} ${leadData.phone.replace(/\s+/g, '')}`;
    const msg = `🚀 *NOUVEAU LEAD (Exit Intent)*\n\n*Nom:* ${leadData.name || 'Visiteur'}\n*Téléphone:* ${finalPhone}\n*Email:* ${leadData.email || 'Non renseigné'}\n\n_Le client souhaite un diagnostic gratuit._`;

    await saveLead({
       source: 'Exit Intent',
       intent: `Diagnostic Gratuit`,
       contact: finalPhone,
       full_name: leadData.name || 'Visiteur',
       message: `Demande de diagnostic gratuit | Email: ${leadData.email}`
    });

    setShowExitIntent(false);
    alert(`Merci ! Votre demande est enregistrée.\nNous allons vous rediriger vers notre équipe WhatsApp pour votre diagnostic gratuit.`);
    window.open(getWaLink(msg), "_blank");
  };

  const processBotReply = async (reply: string) => {
    if(!reply.trim()) return;
    const newMsgs = [...botMessages, { sender: 'client', text: reply }];
    setBotMessages(newMsgs);
    setUserReply("");

    let currentData = { ...botUserData };

    if (botStep === 0) {
      currentData.name = reply;
      setBotUserData(currentData);
      setTimeout(() => {
        setBotMessages(prev => [...prev, { 
          sender: 'bot', 
          text: `Enchantée ${reply.split(' ')[0]} ! Pourrions-nous avoir votre numéro WhatsApp pour vous recontacter si besoin ? (Ex: 77 123 45 67)` 
        }]);
        setBotStep(1);
      }, 1000);
    } 
    else if (botStep === 1) {
      currentData.phone = reply;
      setBotUserData(currentData);
      saveLead({ source: 'Bot Fanta', intent: 'Démarrage Bot', contact: currentData.phone, full_name: currentData.name });

      setTimeout(() => {
        setBotMessages(prev => [...prev, { 
          sender: 'bot', 
          text: `Merci ! Quel est votre secteur d'activité actuel ?`, 
          options: ["Boutique / Vente en ligne", "Restaurant / Fast Food", "Prestataire de services", "Autre (Précisez)"] 
        }]);
        setBotStep(2);
      }, 1000);
    }
    else if (botStep === 2) {
      currentData.sector = reply;
      setBotUserData(currentData);
      saveLead({ source: 'Bot Fanta', intent: `Secteur: ${reply}`, contact: currentData.phone, full_name: currentData.name });

      setTimeout(() => {
        let msg = "";
        let options: string[] = [];
        if(reply.includes("Boutique")) {
           msg = "Excellent. Pour une boutique, voici mes recommandations :\n⭐ Le Meilleur : Pack Trio (Vente + Stock + Tiak)\n💰 L'Essentiel moins cher : Onyx Jaay (Catalogue)\n\nTapez 1 ou 2, ou cliquez ci-dessous :";
           options = ["1. Pack Trio", "2. Onyx Jaay"];
        }
        else if(reply.includes("Restaurant")) {
           msg = "Parfait. Pour la restauration :\n⭐ Le Meilleur : Pack Trio (Encaissement & Stock)\n💰 L'Essentiel moins cher : Onyx Menu (Menu QR)\n\nTapez 1 ou 2, ou cliquez ci-dessous :";
           options = ["1. Pack Trio", "2. Onyx Menu"];
        }
        else if(reply.includes("Autre")) {
           msg = "Je vois ! Expliquez-moi brièvement ce que vous faites et ce que vous aimeriez améliorer, je vais analyser ça pour vous proposer l'outil parfait.";
           setBotMessages(prev => [...prev, { sender: 'bot', text: msg }]);
           setBotStep(2.5);
           return;
        }
        else {
           msg = "D'accord. La solution idéale pour vous :\n⭐ Le Meilleur : Pack Trio\n💰 L'Essentiel moins cher : Onyx Jaay\n\nQue choisissez-vous ?";
           options = ["1. Pack Trio", "2. Onyx Jaay"];
        }
        
        setBotMessages(prev => [...prev, { sender: 'bot', text: msg, options }]);
        setBotStep(3);
      }, 1000);
    }
    else if (botStep === 2.5) {
       saveLead({ source: 'Bot Fanta', intent: `Besoins spécifiques: ${reply}`, contact: currentData.phone, full_name: currentData.name });
       setTimeout(() => {
          setBotMessages(prev => [...prev, { 
             sender: 'bot', 
             text: `D'après ce que vous me dites, je vous recommande vivement le **Pack Duo**. Il s'adapte à 100% à votre activité.\n\nSouhaitez-vous en discuter avec moi sur WhatsApp pour une démo ?`,
             options: ["Parler à Fanta (WhatsApp)"] 
          }]);
          setBotUserData({...currentData, product: 'Pack Duo'});
          setBotStep(4);
       }, 1500);
    }
    else if (botStep === 3) {
      const selected = reply.includes("1") || reply.includes("Trio") || reply.includes("Full") ? (reply.includes("Full") ? "Pack Full" : "Pack Trio") : (reply.includes("Menu") ? "Onyx Menu" : "Onyx Jaay");
      currentData.product = selected;
      setBotUserData(currentData);
      saveLead({ source: 'Bot Fanta', intent: `Choix Produit: ${selected} (${currentData.sector})`, contact: currentData.phone, full_name: currentData.name });

      setTimeout(() => {
        setBotMessages(prev => [...prev, { 
          sender: 'bot', 
          text: `Très bon choix ! **${selected}** digitalise entièrement votre gestion via WhatsApp.\n\nAvez-vous une question précise ou souhaitez-vous finaliser ça directement avec moi sur WhatsApp ?`,
          options: ["Parler à Fanta (WhatsApp)"] 
        }]);
        setBotStep(4);
      }, 1500);
    }
    else if (botStep === 4) {
      if(reply === "Parler à Fanta (WhatsApp)") {
        saveLead({ source: 'Bot Fanta', intent: `Redirection WhatsApp`, contact: currentData.phone, full_name: currentData.name });
        window.open(getWaLink(`Bonjour Fanta, je m'appelle ${currentData.name} (${currentData.phone}). Je suis dans le secteur "${currentData.sector}" et je choisis l'option : ${currentData.product}.`), "_blank");
      } else {
        saveLead({ source: 'Bot Fanta', intent: `Question Bot: ${reply}`, contact: currentData.phone, full_name: currentData.name, message: reply });
        setTimeout(() => {
          setBotMessages(prev => [...prev, { 
            sender: 'bot', 
            text: "Message bien reçu ! Un expert va analyser votre demande. Je vous invite à cliquer sur 'Parler à Fanta' pour finaliser sur WhatsApp.", 
            options: ["Parler à Fanta (WhatsApp)"] 
          }]);
        }, 1000);
      }
    }
  };

  const submitPartnerForm = async () => {
    if(!partnerForm.full_name || !partnerForm.contact || !partnerForm.status || !partnerForm.country) {
      return alert("Veuillez remplir les champs obligatoires (*) : Nom, Téléphone, Statut, Pays.");
    }
    
    try {
       // 1. On prépare l'objet pour la table 'ambassadors' avec les clés exactes
       const ambassadorPayload = {
          full_name: partnerForm.full_name,
          contact: partnerForm.contact,
          phone: partnerForm.contact, // Redondance pour robustesse
          city: partnerForm.city,
          address: partnerForm.address,
          country: partnerForm.country,
          activity: partnerForm.status,
          status: 'En attente'
       };

       console.log("PAYLOAD ENVOYÉ:", ambassadorPayload); // Log de débogage
       
       const { data: ambData, error: ambError } = await supabase
         .from('ambassadors')
         .insert([ambassadorPayload])
         .select();

       if (ambError) {
         console.error("ERREUR TABLE AMBASSADORS :", ambError.message);
         throw new Error(`Erreur Supabase: ${ambError.message}`);
       }

       // 2. On crée AUSSI le lead pour qu'il apparaisse dans le CRM
       await saveLead({ 
          source: 'Formulaire Ambassadeur', 
          intent: 'Candidature Ambassadeur',
          contact: partnerForm.contact, 
          full_name: partnerForm.full_name,
          message: `Objectif de revenu: ${partnerForm.objective} | Statut pro: ${partnerForm.status} | Expérience: ${partnerForm.sales_exp} | Stratégie: ${partnerForm.strategy}`,
          status: 'Nouveau'
       });
       
       setPartnerStep('success');
       setTimeout(() => setPartnerStep('dashboard'), 4000);
      } catch (e: any) {
        console.error("ERREUR GLOBALE :", e);
        alert("Erreur lors de l'enregistrement : " + (e.message || "Erreur inconnue"));
     }
};

  // Mises à jour des tarifs sur la simulation des commissions
  const commissionM1 = Math.round(packCounts.solo * 9900 * 0.30 + packCounts.duo * 17500 * 0.30 + packCounts.trio * 24900 * 0.30 + packCounts.full * 30000 * 0.30 + packCounts.premium * 39900 * 0.30);
  const recurrentPerMonth = Math.round(packCounts.solo * 9900 * 0.10 + packCounts.duo * 17500 * 0.10 + packCounts.trio * 24900 * 0.10 + packCounts.full * 30000 * 0.10 + packCounts.premium * 39900 * 0.10);

  const navigateTo = (view: any, scrollId?: string) => {
    setIsMobileMenuOpen(false); 
    setActiveView(view);
    
    if (view === 'dashboard' && partnerStep === 'success') {
      setPartnerStep('dashboard');
    }
    else if (view === 'dashboard' && partnerStep !== 'dashboard') {
      setPartnerStep('landing'); 
    }
    
    if (scrollId) { 
      setTimeout(() => document.getElementById(scrollId)?.scrollIntoView({ behavior: 'smooth' }), 100); 
    } else { 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
    }
  };

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black overflow-x-hidden pt-20 relative`}>
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none bg-zinc-50" style={{ backgroundImage: `url('https://i.ibb.co/chCcXT7p/back-site.png')`, backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

      {/* MODULE DE NOTIFICATIONS FLOTTANT */}
      <div className={`fixed bottom-28 md:bottom-8 left-6 z-[100] transition-all duration-500 transform ${showNotification ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}`}>
         <div className="bg-white p-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.15)] border-l-4 border-[#39FF14] flex items-center gap-4 max-w-[320px] cursor-pointer hover:scale-105 transition" onClick={() => navigateTo('home', 'tarifs')}>
            <div className="bg-black text-[#39FF14] p-3 rounded-xl flex-shrink-0">
               {React.createElement(RECENT_NOTIFICATIONS[notificationIndex].icon, { size: 24 })}
            </div>
            <div>
               <p className="text-sm text-zinc-800 leading-tight">
                  <span className="font-black">{RECENT_NOTIFICATIONS[notificationIndex].name}</span> {RECENT_NOTIFICATIONS[notificationIndex].action} <span className="font-bold text-black">{RECENT_NOTIFICATIONS[notificationIndex].product}</span>
               </p>
               <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-wider">{RECENT_NOTIFICATIONS[notificationIndex].time}</p>
            </div>
         </div>
      </div>

      <div className="relative z-10">
        
        {/* --- NAVIGATION --- */}
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
               <div onClick={() => window.location.href = '/admin'} className="flex items-center gap-3 cursor-pointer bg-zinc-100 p-1.5 pr-4 rounded-full transition-colors shadow-sm hover:scale-105">
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
             {!currentUser && (
               <button onClick={() => setShowAuthModal(true)} className="bg-black text-[#39FF14] px-4 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest">
                 Hub
               </button>
             )}
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

        {/* --- VUE ACCUEIL --- */}
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

            {/* --- SECTION FINI LE BRICOLAGE --- */}
            <section className="py-16 px-6 max-w-6xl mx-auto mb-10">
              <div className="text-center mb-12">
                <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>Fini le Bricolage. <span className="text-[#39FF14]">Passez au niveau supérieur.</span></h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center h-full">
                {/* CARTE : AVANT ONYX (CHAOS) */}
                <div className="bg-red-50/50 border border-red-100 rounded-[3rem] p-8 h-auto min-h-[500px] flex flex-col relative overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase z-10">Avant Onyx</div>
                  <h3 className="font-black text-red-800 text-xl mb-6 z-10 relative">Le Chaos sur WhatsApp</h3>
                  
                  {/* VIDEO YOUTUBE AVANT */}
                  <div className="w-full aspect-video mb-6 relative overflow-hidden rounded-2xl border-2 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] z-10 bg-black">
                     <iframe 
                       src="https://www.youtube.com/embed/h-vsWYxskvU?autoplay=1&mute=1&loop=1&playlist=h-vsWYxskvU&controls=0&rel=0&modestbranding=1&playsinline=1" 
                       title="Le Chaos Avant Onyx"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                       allowFullScreen
                       className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                     ></iframe>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-end relative z-10">
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-red-100 shadow-sm max-w-[90%] text-sm text-zinc-600 animate-in slide-in-from-left-4" key={`avant-${scenarioIndex}`}>
                      <p className="font-bold text-xs text-red-500 mb-2">{RANDOM_SCENARIOS[scenarioIndex].avant.phone}</p>
                      {RANDOM_SCENARIOS[scenarioIndex].avant.text}
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-red-200 pt-4 text-xs font-bold text-red-600 uppercase relative z-10">
                    <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4" /> {RANDOM_SCENARIOS[scenarioIndex].avant.issue}</span>
                  </div>
                </div>

                {/* CARTE : AVEC ONYX (SÉRÉNITÉ) */}
                <div className="bg-black rounded-[3rem] p-8 h-auto min-h-[500px] flex flex-col relative shadow-[0_15px_40px_rgba(57,255,20,0.15)] border border-[#39FF14]/30">
                  <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase z-10">Avec OnyxOps</div>
                  <h3 className="font-black text-white text-xl mb-6 flex items-center gap-2 z-10 relative"><CheckCircle className="text-[#39FF14] w-6 h-6"/> Automatisation Parfaite</h3>
                  
                  {/* VIDEO YOUTUBE APRES */}
                  <div className="w-full aspect-video mb-6 relative overflow-hidden rounded-2xl border-2 border-[#39FF14] shadow-[0_0_20px_rgba(57,255,20,0.5)] z-10 bg-black">
                     <iframe 
                       src="https://www.youtube.com/embed/acFsObjm2E0?autoplay=1&mute=1&loop=1&playlist=acFsObjm2E0&controls=0&rel=0&modestbranding=1&playsinline=1" 
                       title="La Solution Onyx"
                       allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                       allowFullScreen
                       className="absolute top-0 left-0 w-full h-full object-cover pointer-events-none"
                     ></iframe>
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-end relative z-10">
                    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl animate-in slide-in-from-right-4" key={`apres-${scenarioIndex}`}>
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs text-zinc-400 font-bold uppercase">{RANDOM_SCENARIOS[scenarioIndex].apres.title}</span>
                        <span className="bg-[#39FF14]/20 text-[#39FF14] text-[10px] px-2 py-0.5 rounded-full font-black">{RANDOM_SCENARIOS[scenarioIndex].apres.tag}</span>
                      </div>
                      <p className="text-white text-sm">{RANDOM_SCENARIOS[scenarioIndex].apres.text}</p>
                      <p className="text-zinc-500 font-medium text-xs mt-2 italic">{RANDOM_SCENARIOS[scenarioIndex].apres.sub}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4 text-xs font-bold text-[#39FF14] uppercase relative z-10">
                    <span className="flex items-center gap-1"><Zap className="w-4 h-4 fill-[#39FF14]" /> Business sous contrôle</span>
                  </div>
                </div>

              </div>
            </section>

            {/* --- SECTION : NOS SOLUTIONS RADICALES --- */}
            <section id="solutions" className="py-20 px-6 max-w-7xl mx-auto border-t border-zinc-100">
              <div className="text-center mb-10">
                 <h2 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4`}>NOS <span className="text-[#39FF14]">SOLUTIONS RADICALES</span></h2>
                 <p className="text-zinc-600 font-bold max-w-2xl mx-auto mb-8">Découvrez nos outils sur-mesure pour automatiser chaque aspect de votre business. Filtrez par catégorie pour trouver votre solution idéale.</p>
                 
                 <div className="flex flex-wrap justify-center gap-3">
                    {saasCategories.map(cat => (
                       <button 
                         key={cat} 
                         onClick={() => setSaasFilter(cat)} 
                         className={`px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all shadow-sm border ${saasFilter === cat ? 'bg-black text-[#39FF14] border-black scale-105' : 'bg-white text-zinc-600 border-zinc-200 hover:border-black hover:text-black'}`}
                       >
                         {cat}
                       </button>
                    ))}
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                {filteredSolutions.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <div key={i} onClick={() => { setShowSaasChoice(s); saveLead({ source: 'Site Web', intent: `Découverte Solution: ${s.id}` }); }} className="group relative overflow-hidden bg-white border border-zinc-200 p-8 rounded-[2.5rem] shadow-sm hover:border-[#39FF14]/50 hover:shadow-xl transition-all cursor-pointer flex flex-col h-full">
                      <div className="absolute right-0 top-0 w-28 h-28 opacity-[0.05] pointer-events-none"><Icon className="w-full h-full text-black" /></div>
                      <div className="bg-black text-[#39FF14] w-12 h-12 rounded-2xl flex items-center justify-center mb-6"><Icon className="w-6 h-6" /></div>
                      <h3 className={`${spaceGrotesk.className} text-xl font-black mb-4 italic uppercase flex justify-between items-center`}>
                        {s.id} 
                        <span className="bg-zinc-100 text-black text-[9px] px-3 py-1 rounded-full not-italic group-hover:bg-[#39FF14] transition">+ Infos</span>
                      </h3>
                      <p className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-2 rounded-xl mb-4 line-clamp-2 border border-red-100 flex-1">{s.pain}</p>
                      <div className="bg-[#39FF14]/10 p-4 rounded-2xl border-l-4 border-[#39FF14]">
                        <p className="text-[10px] font-black text-[#39FF14] uppercase mb-1">Solution Onyx</p>
                        <p className="text-xs font-bold text-black">{s.solution}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* --- SECTION QUIZ INTERACTIF --- */}
            <section id="quiz-section" className="py-24 bg-zinc-50 border-t border-zinc-200 mt-10">
               <div className="max-w-4xl mx-auto px-6 text-center">
                  <h2 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase mb-4`}>Vous ne savez pas par où commencer ?</h2>
                  <p className="text-zinc-600 font-bold text-lg mb-12">Laissez-nous vous guider vers la configuration parfaite en fonction de vos besoins réels.</p>
                  
                  <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-zinc-200 max-w-2xl mx-auto relative overflow-hidden transition-all duration-300">
                     {quizStep === 0 && (
                        <div className="animate-in slide-in-from-right-8">
                           <span className="bg-black text-[#39FF14] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Étape 1/3</span>
                           <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6`}>Quelle est la taille de votre entreprise ?</h3>
                           <div className="space-y-3">
                              {["Petit commerçant (1-3 employés)", "Moyenne PME (4-10 employés)", "Grosse PME/Entreprise (+10 employés)"].map(size => (
                                 <button key={size} onClick={() => handleQuizSubmit('size', size)} className="w-full bg-zinc-50 border-2 border-zinc-200 text-black p-4 rounded-2xl font-bold text-sm hover:border-black hover:bg-black hover:text-[#39FF14] transition text-left">
                                    {size}
                                 </button>
                              ))}
                           </div>
                        </div>
                     )}

                     {quizStep === 1 && (
                        <div className="animate-in slide-in-from-right-8">
                           <span className="bg-black text-[#39FF14] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Étape 2/3</span>
                           <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6`}>Quel est votre secteur d'activité ?</h3>
                           <div className="space-y-3">
                              {["Boutique/Retail", "Restauration", "Prestation de services", "Autre"].map(sector => (
                                 <button key={sector} onClick={() => handleQuizSubmit('sector', sector)} className={`w-full border-2 text-left p-4 rounded-2xl font-bold text-sm transition ${quizAnswers.sector === sector ? 'bg-black text-[#39FF14] border-black' : 'bg-zinc-50 border-zinc-200 hover:border-black text-black'}`}>
                                    {sector}
                                 </button>
                              ))}
                           </div>
                           {quizAnswers.sector === 'Autre' && (
                              <div className="mt-4 flex gap-2 animate-in fade-in">
                                 <input type="text" placeholder="Précisez votre activité..." value={quizAnswers.customSector} onChange={e => setQuizAnswers({...quizAnswers, customSector: e.target.value})} className="flex-1 p-4 bg-zinc-50 border-2 border-black rounded-2xl font-bold outline-none text-sm" />
                                 <button disabled={!quizAnswers.customSector} onClick={() => handleQuizSubmit('customSector', quizAnswers.customSector)} className="bg-[#39FF14] text-black px-6 rounded-2xl font-black uppercase text-xs hover:scale-105 transition disabled:opacity-50"><ArrowRight size={20}/></button>
                              </div>
                           )}
                        </div>
                     )}

                     {quizStep === 2 && (
                        <div className="animate-in slide-in-from-right-8">
                           <span className="bg-black text-[#39FF14] px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Étape 3/3</span>
                           <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6`}>Avez-vous besoin de formations en marketing digital, pub payante ou design ?</h3>
                           <div className="grid grid-cols-2 gap-4">
                              <button onClick={() => handleQuizSubmit('marketing', 'Oui')} className="bg-zinc-50 border-2 border-zinc-200 text-black p-6 rounded-2xl font-black uppercase text-lg hover:border-black hover:bg-black hover:text-[#39FF14] transition">Oui</button>
                              <button onClick={() => handleQuizSubmit('marketing', 'Non')} className="bg-zinc-50 border-2 border-zinc-200 text-black p-6 rounded-2xl font-black uppercase text-lg hover:border-black hover:bg-black hover:text-[#39FF14] transition">Non</button>
                           </div>
                        </div>
                     )}

                     {quizStep === 3 && (
                        <div className="animate-in zoom-in py-6">
                           <div className="w-20 h-20 bg-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                              <CheckCircle className="text-black w-10 h-10" />
                           </div>
                           <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-4`}>Analyse Terminée !</h3>
                           <p className="text-zinc-600 font-bold mb-6">Nous avons généré votre recommandation sur-mesure.</p>
                           <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] bg-black px-4 py-2 rounded-xl inline-block animate-pulse">Redirection vers l'offre...</p>
                        </div>
                     )}
                  </div>
               </div>
            </section>

            {/* --- SECTION TARIFS --- */}
            <section id="tarifs" className="py-20 bg-black text-white rounded-[4rem] mx-4 px-6 relative overflow-hidden">
              <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-10">
                  <h2 className={`${spaceGrotesk.className} text-4xl font-black mb-4 uppercase`}>OFFRES <span className="text-[#39FF14]">NO-LIMIT.</span></h2>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">Pas d'abonnement caché.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                  {PACKS.map((pack) => {
                    const planDetails = PLAN_DETAILS[pack.id];
                    const isRecommended = quizResult && quizResult.packId === pack.id;

                    return (
                      <div key={pack.id} className={`${pack.id === 'trio' || isRecommended ? 'bg-gradient-to-br from-[#39FF14]/20 to-black border-2 border-[#39FF14] scale-105 shadow-[0_0_40px_rgba(57,255,20,0.3)] z-20' : 'bg-zinc-900/50 border border-white/10 hover:border-zinc-700'} p-8 rounded-[3rem] transition flex flex-col relative`}>
                        
                        {/* BADGE NÉON RECOMMANDÉ */}
                        {isRecommended && (
                           <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap animate-pulse shadow-lg z-30 flex items-center gap-1">
                              <Sparkles size={12}/> Choix Idéal
                           </div>
                        )}

                        <p className={`text-[10px] font-black tracking-[0.3em] ${pack.id === 'trio' || isRecommended ? 'text-[#39FF14]' : 'text-zinc-500'} mb-1 uppercase`}>{pack.label}</p>
                        <div className="flex items-center gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < 4 || pack.rating.startsWith('5') ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400/30 fill-yellow-400/30'}`} />))}
                          <span className="text-[9px] text-zinc-400 font-bold ml-1">{pack.rating} ({pack.avis})</span>
                        </div>
                        <div className={`text-2xl font-bold mb-6 italic ${pack.id === 'master' ? 'text-red-500' : 'text-white'}`}>{pack.price.toLocaleString()}F <span className="text-xs text-zinc-500 font-normal">{pack.isUnique ? ' (Unique)' : '/ mois'}</span></div>
                        
                        {/* TEXTE DYNAMIQUE DU QUIZ */}
                        {isRecommended && (
                           <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 p-4 rounded-2xl mb-6 text-xs text-[#39FF14] font-bold leading-relaxed shadow-inner">
                              {quizResult.message}
                           </div>
                        )}

                        <ul className={`text-xs space-y-3 mb-8 flex-1 ${pack.id === 'trio' || isRecommended ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {planDetails.benefits.map((ben, i) => <li key={i} className="flex gap-2">✔ {ben}</li>)}
                        </ul>
                        <button 
  onClick={() => { 
    setLeadData(prev => ({ ...prev, saas: pack.label })); 
    setShowOnboarding(true); 
  }} 
  className={`w-full block text-center py-4 rounded-2xl font-black text-sm uppercase ${pack.id === 'trio' || isRecommended ? 'bg-[#39FF14] text-black hover:bg-white' : 'bg-white text-black hover:bg-[#39FF14]'}`}
>
  Commencer
</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* SECTION TEMOIGNAGES ALEATOIRES INFINIS */}
            <section className="py-20 bg-zinc-50 border-t border-zinc-200 mt-10">
               <div className="max-w-7xl mx-auto px-6">
                  <div className="text-center mb-16">
                     <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-4`}>Ils réussissent avec <span className="text-[#39FF14]">Onyx</span></h2>
                     <p className="text-zinc-600 font-bold">Découvrez les retours de nos partenaires et clients au Sénégal.</p>
                  </div>
                  
                  <div className="flex justify-center mb-10 min-h-[250px]">
                     <div key={`testimony-${testimonialIndex}`} className="bg-white p-10 rounded-[3rem] shadow-xl border border-zinc-100 max-w-2xl w-full animate-in slide-in-from-right-8 duration-500">
                        <div className="flex justify-center gap-1 mb-6">
                           {[1,2,3,4,5].map(star => <Star key={star} className="w-5 h-5 text-[#39FF14] fill-[#39FF14]"/>)}
                        </div>
                        <p className="text-zinc-800 text-lg md:text-xl italic font-black mb-8 leading-relaxed text-center">"{AMBASSADOR_TESTIMONIALS[testimonialIndex].text}"</p>
                        <div className="flex flex-col items-center gap-3">
                           <img src={AMBASSADOR_TESTIMONIALS[testimonialIndex].img} alt="Avatar" className="w-16 h-16 rounded-full border-4 border-[#39FF14]" />
                           <div className="text-center">
                              <p className="font-black uppercase text-base">{AMBASSADOR_TESTIMONIALS[testimonialIndex].name}</p>
                              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">{AMBASSADOR_TESTIMONIALS[testimonialIndex].role}</p>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="text-center mt-12">
                     <button onClick={() => navigateTo('dashboard')} className="inline-flex justify-center items-center gap-2 bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-wider hover:scale-105 transition shadow-2xl">
                        Rejoindre le programme Partenaire <ArrowRight size={18}/>
                     </button>
                  </div>
               </div>
            </section>

            {/* --- NOUVEAU : SECTION FAQ --- */}
            <section id="faq" className="py-24 bg-white">
              <div className="max-w-4xl mx-auto px-6">
                <div className="text-center mb-16">
                  <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-4`}>Questions <span className="text-[#39FF14]">Fréquentes</span></h2>
                  <p className="text-zinc-600 font-bold max-w-2xl mx-auto">Toutes les réponses à vos interrogations sur notre écosystème.</p>
                </div>
                <div className="space-y-4">
                  {FAQ_DATA.map((item, index) => (
                    <div key={index} className={`bg-zinc-50 border-2 rounded-[2rem] p-6 transition-all duration-300 ${openFaq === index ? 'border-[#39FF14]' : 'border-zinc-100'}`}>
                      <button 
                        onClick={() => setOpenFaq(openFaq === index ? null : index)}
                        className="w-full flex justify-between items-center text-left"
                      >
                        <h3 className="font-black text-lg uppercase tracking-tight">{item.question}</h3>
                        <div className={`p-2 rounded-full transition-transform duration-300 ${openFaq === index ? 'bg-black text-red-500 rotate-180' : 'bg-zinc-200 text-zinc-600'}`}>
                          <ChevronDown size={20} />
                        </div>
                      </button>
                      <div className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                        <div className="overflow-hidden">
                          <p className={`text-zinc-600 font-medium leading-relaxed pr-8 transition-transform duration-500 ${openFaq === index ? 'translate-y-0' : '-translate-y-3'}`}>{item.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* --- VUE BLOG --- */}
        {activeView === 'blog' && (
          <div className="py-20 px-6 max-w-6xl mx-auto animate-in fade-in duration-500 min-h-[80vh]">
            <div className="text-center mb-16">
               <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4`}>LE <span className="text-[#39FF14] italic">BLOG</span> OPÉRATIONNEL</h1>
               <p className="text-zinc-600 font-bold mb-10 text-xl max-w-3xl mx-auto">Stratégies, astuces et méthodes pour dominer votre marché grâce au digital au Sénégal.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {articles.map((article) => (
                  <div key={article.id} onClick={() => { setSelectedArticle(article); setBlogEmail(""); }} className="bg-white border border-zinc-200 rounded-[3rem] p-8 shadow-sm hover:shadow-xl hover:border-black transition cursor-pointer flex flex-col h-full">
                     <div className="flex gap-2 mb-6">
                        <span className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase">{article.category}</span>
                        <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Clock size={10}/> {article.readTime || '5 min'}</span>
                     </div>
                     <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-4 leading-tight`}>{article.title}</h2>
                     <p className="text-zinc-500 text-sm font-medium mb-8 flex-1">{article.desc || article.content}</p>
                     <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black group">
                        LIRE L'ARTICLE <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform"/>
                     </div>
                  </div>
               ))}
            </div>

            {selectedArticle && (
               <div id="modal-overlay" onClick={handleOutsideClick(setSelectedArticle)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
                 <div className="bg-white p-10 md:p-16 rounded-[3.5rem] max-w-3xl w-full relative shadow-2xl animate-in zoom-in my-8">
                   <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-10"><X size={20}/></button>
                   <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase mb-6 inline-block">{selectedArticle.category}</span>
                   <h2 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase mb-6 leading-tight`}>{selectedArticle.title}</h2>
                   <div className="prose prose-zinc max-w-none font-medium">
                      <p className="text-lg text-zinc-600 mb-6">{selectedArticle.desc || selectedArticle.content}</p>
                      <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 mb-6">
                         <h3 className="font-black text-xl mb-4">L'ère de l'automatisation est là.</h3>
                         <p>Vous avez un restaurant, une boutique ou un prestataire sur le marché, ignorer WhatsApp comme canal de vente automatisé en 2026 est une erreur stratégique majeure. L'utilisation d'outils comme OnyxOps permet de centraliser la prise de commande, l'inventaire et la livraison sans effort humain supplémentaire.</p>
                      </div>

                      <div className="mb-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1 mb-2 block">Votre Email (Optionnel)</label>
                        <input 
                          type="email" 
                          placeholder="ex: contact@monbusiness.com" 
                          value={blogEmail} 
                          onChange={(e) => setBlogEmail(e.target.value)} 
                          className="w-full p-3 bg-white border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition"
                        />
                      </div>

                      <button onClick={async () => {
                        const message = `Hello la team Onyx ! J'ai lu votre article "${selectedArticle.title}" et je souhaite discuter pour mon business.`;
                        
                        if (blogEmail) {
                           await saveLead({ source: 'Blog Article', intent: 'Lecture & Contact', email: blogEmail, full_name: 'Lecteur Blog', message: `Article lu : ${selectedArticle.title}` });
                        }

                        window.open(getWaLink(message), '_blank');
                      }} className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm mt-8 shadow-xl hover:scale-105 transition">Discuter sur WhatsApp</button>
                   </div>
                 </div>
               </div>
            )}
          </div>
        )}

        {/* --- WORKFLOW PARTENAIRE (DASHBOARD) --- */}
        {activeView === 'dashboard' && (
          <div className="py-20 px-6 max-w-6xl mx-auto animate-in fade-in duration-500 min-h-[80vh]">
            
            {partnerStep === 'landing' && (
              <div className="max-w-5xl mx-auto">
                <div className="text-center mb-16">
                  <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-6 uppercase`}>Programme Ambassadeur Élite</div>
                  <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6`}>Générez une <span className="text-[#39FF14] italic">Rente Passive</span> au Sénégal.</h1>
                  <p className="text-zinc-600 font-bold mb-10 text-xl max-w-3xl mx-auto">Gagnez 30% en cash immédiat sur chaque vente de logiciel, et 10% de récurrent à vie. Fini les fins de mois difficiles et les business en ligne douteux.</p>
                  <button onClick={() => setPartnerStep('form')} className="bg-black text-[#39FF14] px-12 py-6 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 transition shadow-[0_15px_40px_rgba(57,255,20,0.3)] animate-bounce">Rejoindre le Mouvement</button>
                </div>

                <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border-2 border-zinc-100 text-left mb-20">
                  <h3 className={`${spaceGrotesk.className} font-black text-3xl mb-8 uppercase flex items-center gap-3`}><Target className="text-[#39FF14] w-8 h-8"/> Simulez vos futurs revenus</h3>
                  <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                      {[
                        { id: 'solo', label: 'Pack Solo (Vendus/mois)', max: 50 },
                        { id: 'duo', label: 'Pack Duo (Vendus/mois)', max: 40 },
                        { id: 'trio', label: 'Pack Trio (Vendus/mois)', max: 30 },
                        { id: 'master', label: 'Onyx Master (Vendus/mois)', max: 20 },
                      ].map(pack => (
                        <div key={pack.id}>
                          <div className="flex justify-between mb-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-zinc-600">{pack.label}</label>
                            <span className="font-black text-[#39FF14] bg-black px-3 py-1 rounded-md text-xs">{packCounts[pack.id as PlanKey] || 0}</span>
                          </div>
                          <input type="range" min="0" max={pack.max} value={packCounts[pack.id as PlanKey] || 0} onChange={(e) => setPackCounts({...packCounts, [pack.id]: parseInt(e.target.value)})} className="w-full accent-black h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer" />
                        </div>
                      ))}
                    </div>
                    <div className="bg-black text-white p-8 rounded-[2rem] relative shadow-2xl">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Gain Immédiat (Ce mois)</p>
                      <p className={`${spaceGrotesk.className} text-4xl font-black text-[#39FF14] mb-6`}>{commissionM1.toLocaleString()} F</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Rente Passive Mensuelle</p>
                      <p className={`${spaceGrotesk.className} text-2xl font-black text-white mb-6`}>+ {recurrentPerMonth.toLocaleString()} F / mois</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {partnerStep === 'form' && (
              <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-zinc-100 animate-in zoom-in">
                <div className="flex justify-between items-center mb-8">
                  <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>Candidature Ambassadeur</h2>
                  <button onClick={() => setPartnerStep('landing')} className="text-xs font-bold text-zinc-400 hover:text-black"><X size={24}/></button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                     <input type="text" placeholder="Nom Complet *" value={partnerForm.full_name} onChange={e => setPartnerForm({...partnerForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black" />
                     <input type="tel" placeholder="Numéro WhatsApp *" value={partnerForm.contact} onChange={e => setPartnerForm({...partnerForm, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black" />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                     <input type="text" placeholder="Ville" value={partnerForm.city} onChange={e => setPartnerForm({...partnerForm, city: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black" />
                     <select value={partnerForm.country} onChange={e => setPartnerForm({...partnerForm, country: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none cursor-pointer focus:border-black">
                       <option value="" disabled>Pays *</option>
                       <option value="Sénégal">Sénégal</option>
                       <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                       <option value="Mali">Mali</option>
                       <option value="Guinée">Guinée</option>
                     </select>
                  </div>
                  <div>
                     <input type="text" placeholder="Quartier / Adresse *" value={partnerForm.address} onChange={e => setPartnerForm({...partnerForm, address: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none focus:border-black" />
                  </div>
                  <div>
                     <select value={partnerForm.status} onChange={e => setPartnerForm({...partnerForm, status: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold outline-none cursor-pointer focus:border-black">
                       <option value="" disabled>Votre Statut Actuel *</option>
                       <option>Salarié (Recherche revenu complémentaire)</option>
                       <option>Freelance / Indépendant</option>
                       <option>Sans emploi</option>
                       <option>Étudiant</option>
                     </select>
                  </div>

                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200 mt-6 space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Informations Avancées</p>
                     <select value={partnerForm.sales_exp} onChange={e => setPartnerForm({...partnerForm, sales_exp: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold outline-none cursor-pointer text-sm">
                       <option value="" disabled>Avez-vous de l'expérience en vente B2B ?</option>
                       <option>Oui, beaucoup (Plusieurs années)</option>
                       <option>Un peu (Vente informelle)</option>
                       <option>Non, aucune expérience</option>
                     </select>
                     <select value={partnerForm.objective} onChange={e => setPartnerForm({...partnerForm, objective: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold outline-none cursor-pointer text-sm">
                       <option value="" disabled>Quel est votre objectif de revenu mensuel ?</option>
                       <option>50.000 F - 150.000 F (Complément)</option>
                       <option>150.000 F - 500.000 F (Revenu principal)</option>
                       <option>+ 500.000 F (Développer une agence)</option>
                     </select>
                     <textarea placeholder="Quelle sera votre stratégie pour trouver des clients ? (ex: Porte-à-porte, Réseaux sociaux...)" value={partnerForm.strategy} onChange={e => setPartnerForm({...partnerForm, strategy: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold outline-none min-h-[100px] resize-none text-sm"></textarea>
                  </div>

                  <button onClick={submitPartnerForm} className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition shadow-xl mt-6 flex justify-center items-center gap-2">
                     <Send size={18}/> Soumettre la Candidature
                  </button>
                </div>
              </div>
            )}

            {partnerStep === 'success' && (
               <div className="text-center max-w-lg mx-auto bg-white p-12 rounded-[3rem] shadow-2xl border-2 border-[#39FF14] animate-in zoom-in">
                  <CheckCircle className="w-20 h-20 text-[#39FF14] mx-auto mb-6" />
                  <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-4`}>Félicitations !</h2>
                  <p className="text-xs font-bold text-zinc-500 mb-8">Votre candidature a été reçue et est en cours d'analyse par un administrateur.</p>
                  <p className="text-[10px] font-black text-black uppercase bg-zinc-100 p-3 rounded-xl animate-pulse inline-block">Redirection vers votre Hub de Démo...</p>
               </div>
            )}

            {partnerStep === 'dashboard' && (
              <div className="animate-in fade-in duration-500">
                <div className="flex justify-between items-end mb-8">
                  <div>
                    <h1 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter`}>Espace <span className="text-[#39FF14]">Partenaire</span></h1>
                  </div>
                  <button onClick={() => setPartnerStep('landing')} className="text-xs font-bold text-zinc-400 hover:text-black flex items-center gap-1"><X size={14}/> Quitter</button>
                </div>

                <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-zinc-200 mb-8">
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Votre Lien de Parrainage</p>
                   <div className="bg-zinc-100 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-4 border border-zinc-200 hover:border-black transition">
                      <span className="text-sm font-bold text-zinc-600 truncate flex-1">https://onyxops.com/ref/ambassadeur-demo</span>
                      <button onClick={() => handleCopy('https://onyxops.com/ref/ambassadeur-demo', 'link')} className="w-full md:w-auto bg-black text-[#39FF14] px-6 py-3 rounded-xl text-xs font-black uppercase hover:scale-105 transition flex justify-center items-center gap-2">
                        {copiedLink === 'link' ? <><Check size={16}/> Copié</> : <><Link size={16}/> Copier le lien</>}
                      </button>
                   </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 mb-10">
                  <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group hover:scale-105 transition cursor-pointer">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Solde Disponible (M1)</p>
                    <p className={`${spaceGrotesk.className} text-4xl font-black text-[#39FF14]`}>142.500 F</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200 cursor-pointer hover:border-[#39FF14] transition">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Ventes Réalisées</p>
                    <p className={`${spaceGrotesk.className} text-4xl font-black text-black`}>12</p>
                  </div>
                  <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200 cursor-pointer hover:border-[#39FF14] transition">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Statut du compte</p>
                    <p className={`${spaceGrotesk.className} text-3xl font-black text-yellow-500`}>EN ATTENTE</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- MODALES COMMUNES --- */}
        {showAuthModal && (
          <div id="modal-overlay" onClick={handleOutsideClick(setShowAuthModal)} className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
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
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {ECOSYSTEM_SAAS.map(s => (
                    <button key={s.id} onClick={() => setAuthSelectedSaas(s.id)} className={`p-3 text-[10px] font-black uppercase rounded-xl border-2 transition ${authSelectedSaas === s.id ? 'border-black bg-black text-[#39FF14]' : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-[#39FF14]'}`}>
                      {s.name}
                    </button>
                  ))}
                </div>
                {authMode === 'login' ? (
                   <button onClick={() => { const url = authSelectedSaas === 'vente' ? '/vente' : authSelectedSaas === 'formation' ? '/formation' : `https://${authSelectedSaas}.onyxops.com/login`; window.open(url, url.startsWith('/') ? '_self' : '_blank'); }} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black text-xs uppercase shadow-xl hover:scale-105 transition flex justify-center items-center gap-2">
                     <LogIn size={16}/> Ouvrir
                   </button>
                ) : (
                   <button onClick={() => { setShowAuthModal(false); setLeadData(prev => ({ ...prev, saas: authSelectedSaas })); setShowOnboarding(true); }} className="w-full bg-black text-white py-4 rounded-xl font-black text-xs uppercase shadow-xl hover:bg-[#39FF14] hover:text-black transition flex justify-center items-center gap-2">
                     <UserPlus size={16}/> Activer Essai Gratuit
                   </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- NOUVELLE MODALE : STRATÉGIE D'UPSELL AVEC FOMO --- */}
        {showSaasChoice && (() => {
          const SaasIcon = showSaasChoice.icon || Star;
          
          let upsellNormalPrice = 17500; // Duo calculation
          let upsellDiscountPrice = 17500;
          if (showSaasChoice.upsellName.includes("Trio")) { upsellNormalPrice = 24900; upsellDiscountPrice = 24900; }
          else if (showSaasChoice.upsellName.includes("Full")) { upsellNormalPrice = 30000; upsellDiscountPrice = 30000; }
          else if (showSaasChoice.upsellName.includes("Master")) { upsellNormalPrice = 39900; upsellDiscountPrice = 39900; }

          return (
            <div id="modal-overlay" onClick={handleOutsideClick(setShowSaasChoice)} className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="bg-white p-8 md:p-10 rounded-[3.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in text-center border-t-4 border-[#39FF14]">
                <button className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-50" onClick={() => setShowSaasChoice(null)}><X size={20}/></button>
                
                <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full text-zinc-500 mb-4 inline-block">Étape 1/2 : Sélection de l'offre</span>

                <div className="bg-black text-[#39FF14] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <SaasIcon size={32} />
                </div>
                <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2`}>{showSaasChoice.id}</h2>
                <p className="text-sm font-bold text-zinc-500 mb-8 px-4">{showSaasChoice.solution}</p>

                <div className="grid md:grid-cols-2 gap-6">
                   {/* OPTION BASIQUE */}
                   <div className="w-full bg-zinc-50 text-black border-2 border-zinc-200 py-6 px-4 rounded-3xl flex flex-col items-center justify-between relative group">
                      <div className="flex flex-col items-center w-full">
                         <span className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Offre Basique</span>
                         <span className="text-2xl font-black mb-4">{showSaasChoice.price.toLocaleString()} F</span>
                      </div>
                      <div className="w-full flex flex-col gap-2 mt-2 z-10">
                         <button onClick={() => { setShowSaasChoice(null); setLeadData(prev => ({...prev, saas: showSaasChoice.id})); setShowOnboarding(true); }} className="w-full bg-black text-[#39FF14] py-3 rounded-xl font-black text-[10px] uppercase hover:bg-zinc-800 transition shadow-md flex items-center justify-center">
                            Créer mon compte
                         </button>
                         <button onClick={() => { handleWaClick("Essai Basique", `Bonjour, je souhaite démarrer un essai pour ${showSaasChoice.id} à ${showSaasChoice.price.toLocaleString()}F.`); setShowSaasChoice(null); }} className="w-full bg-white text-black py-3 rounded-xl font-black text-[10px] uppercase hover:bg-zinc-100 transition border border-zinc-200 shadow-sm flex items-center justify-center gap-2">
                            <MessageSquare size={14}/> Essai via WhatsApp
                         </button>
                      </div>
                   </div>
                   
                   {/* OPTION UPSELL AVEC FOMO */}
                   <div className="w-full bg-black text-[#39FF14] py-6 px-4 rounded-3xl shadow-[0_15px_30px_rgba(57,255,20,0.2)] flex flex-col items-center justify-between border-2 border-[#39FF14] relative overflow-hidden">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase animate-pulse w-max z-20 flex items-center gap-1 shadow-lg">
                         🔥 Offre Flash : {formatTime(fomoTime)}
                      </div>
                      
                      <div className="flex flex-col items-center w-full mt-4">
                         <span className="text-[10px] font-black uppercase text-white tracking-widest mb-1">Offre Complète</span>
                         <span className="text-lg font-black leading-tight mb-2 text-white">Passer au <br/> {showSaasChoice.upsellName}</span>
                         <div className="flex flex-col items-center bg-[#39FF14]/10 w-full rounded-2xl py-3 border border-[#39FF14]/20 mb-4">
                            <span className="text-3xl font-black text-[#39FF14]">{upsellDiscountPrice.toLocaleString()} F</span>
                         </div>
                      </div>
                      
                      <div className="w-full flex flex-col gap-2 mt-auto z-10">
                         <button onClick={() => { setShowSaasChoice(null); setLeadData(prev => ({...prev, saas: showSaasChoice.upsellName})); setShowOnboarding(true); }} className="w-full bg-[#39FF14] text-black py-3 rounded-xl font-black text-[10px] uppercase hover:bg-white transition shadow-xl flex items-center justify-center gap-1">
                            Profiter de l'offre <ArrowRight size={14}/>
                         </button>
                         <button onClick={() => { handleWaClick("Essai Upsell Flash", `Bonjour, je veux profiter de l'offre flash pour le ${showSaasChoice.upsellName} à ${upsellDiscountPrice.toLocaleString()}F !`); setShowSaasChoice(null); }} className="w-full bg-zinc-800 text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-zinc-700 transition flex items-center justify-center gap-2">
                            <MessageSquare size={14}/> Essai via WhatsApp
                         </button>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* --- MODALE : ONBOARDING CAPTURE LEAD (MAIMOUNA) --- */}
        {showOnboarding && (
          <div id="modal-overlay" onClick={handleOutsideClick(setShowOnboarding)} className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
            <div className="bg-white rounded-[3rem] w-full max-w-4xl relative overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(57,255,20,0.15)] animate-in zoom-in min-h-[500px]">
              <button onClick={() => setShowOnboarding(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-20"><X size={20}/></button>

              {/* Colonne Gauche : Image Conseillère */}
              <div className="w-full md:w-2/5 bg-zinc-900 relative hidden md:block">
                 <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&h=800&fit=crop" alt="Maïmouna" className="w-full h-full object-cover opacity-80" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex flex-col justify-end p-8">
                    <span className="bg-[#39FF14] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full w-max mb-2">Conseillère Experte</span>
                    <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase text-white mb-2`}>Maïmouna</h3>
                    <p className="text-zinc-300 text-sm font-medium">"Je vais vous aider à configurer votre espace pour maximiser vos ventes."</p>
                 </div>
              </div>

              {/* Colonne Droite : Formulaire */}
              <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
                 {onboardingStep === 1 && (
                   <div className="space-y-6 animate-in slide-in-from-right-8">
                     <div className="mb-8">
                        <span className="text-[#39FF14] font-black text-xs uppercase tracking-widest bg-black px-3 py-1 rounded-lg">Étape Finale 1/2</span>
                        <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mt-4`}>Quelle est votre <span className="text-[#39FF14] bg-black px-2 py-0.5 rounded-lg">activité</span> ?</h2>
                     </div>

                     <div className="space-y-3">
                       {ONBOARDING_CATEGORIES.map(cat => (
                         <button
                           key={cat}
                           onClick={() => { setLeadData({...leadData, category: cat}); if(cat !== 'Autre') setOnboardingStep(2); }}
                           className={`w-full text-left p-4 rounded-2xl border-2 font-bold text-sm transition-all ${leadData.category === cat ? 'border-black bg-black text-[#39FF14]' : 'border-zinc-200 hover:border-black bg-zinc-50 text-zinc-700'}`}
                         >
                           {cat}
                         </button>
                       ))}
                     </div>

                     {leadData.category === 'Autre' && (
                        <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                           <input
                             type="text"
                             placeholder="Ex: Agence immobilière, VTC..."
                             value={leadData.customCategory}
                             onChange={e => setLeadData({...leadData, customCategory: e.target.value})}
                             className="w-full p-4 bg-zinc-50 border-2 border-black rounded-2xl font-bold outline-none mb-4"
                           />
                           <button disabled={!leadData.customCategory} onClick={() => setOnboardingStep(2)} className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition disabled:opacity-50">Continuer <ArrowRight size={14} className="inline ml-1"/></button>
                        </div>
                     )}
                   </div>
                 )}

                 {onboardingStep === 2 && (
                   <form onSubmit={submitLeadForm} className="space-y-6 animate-in slide-in-from-right-8">
                     <div className="mb-8">
                        <span className="text-[#39FF14] font-black text-xs uppercase tracking-widest bg-black px-3 py-1 rounded-lg">Étape Finale 2/2</span>
                        <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mt-4`}>Activation de votre <span className="text-[#39FF14] bg-black px-2 py-0.5 rounded-lg">compte</span></h2>
                     </div>

                     <div className="space-y-4">
                       <div>
                         <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Nom ou Nom de la structure *</label>
                         <input type="text" required value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition" placeholder="Ex: Boutique Fatou" />
                       </div>
                       
                       <div>
                         <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Numéro WhatsApp *</label>
                         <div className="flex gap-2">
                           <select 
                             value={countryCode} 
                             onChange={(e) => setCountryCode(e.target.value)}
                             className="bg-zinc-50 text-black border border-zinc-200 rounded-2xl px-3 py-4 font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition w-28 sm:w-32 cursor-pointer"
                           >
                             <option value="+221">🇸🇳 +221</option>
                             <option value="+223">🇲🇱 +223</option>
                             <option value="+225">🇨🇮 +225</option>
                             <option value="+224">🇬🇳 +224</option>
                             <option value="+241">🇬🇦 +241</option>
                             <option value="+33">🇫🇷 +33</option>
                           </select>
                           <input 
                             type="tel" 
                             required 
                             value={leadData.phone} 
                             onChange={e => setLeadData({...leadData, phone: e.target.value})} 
                             className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition" 
                             placeholder={countryCode === "+221" ? "77 123 45 67" : "Numéro sans indicatif"} 
                           />
                         </div>
                       </div>

                       <div>
                         <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Adresse Email <span className="text-zinc-400 font-medium">(Optionnel)</span></label>
                         <input type="email" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition" placeholder="contact@monbusiness.com" />
                       </div>
                     </div>

                     <div className="flex gap-4 pt-4">
                       <button type="button" onClick={() => setOnboardingStep(1)} className="bg-zinc-100 text-black px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-zinc-200 transition">Retour</button>
                       <button type="submit" className="flex-1 bg-black text-[#39FF14] py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition flex items-center justify-center gap-2">
                         <CheckCircle size={16}/> Terminer & Activer
                       </button>
                     </div>
                   </form>
                 )}
              </div>
            </div>
          </div>
        )}

        {/* --- MODALE EXIT INTENT REVISITÉE AVEC FORMULAIRE & BÉNÉFICES CHIFFRÉS --- */}
        {showExitIntent && (
          <div id="modal-overlay" onClick={handleOutsideClick(setShowExitIntent)} className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-white p-10 md:p-12 rounded-[4rem] max-w-lg w-full relative shadow-[0_0_100px_rgba(57,255,20,0.2)] animate-in zoom-in text-center border-t-8 border-black">
              <button onClick={() => setShowExitIntent(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
              
              <div className="w-20 h-20 bg-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
                 <Zap className="text-black w-10 h-10" />
              </div>
              
              <h2 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4`}>Vous partez déjà ?</h2>
              <p className="text-zinc-600 font-medium mb-6 text-sm">Ne laissez pas vos concurrents vous dépasser. Obtenez un <span className="font-black text-black">diagnostic gratuit 100% personnalisé</span>.</p>

              <div className="text-left bg-zinc-50 p-6 rounded-3xl border border-zinc-200 mb-6 space-y-3">
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Sans engagement, découvrez comment :</p>
                 <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={16} className="text-[#39FF14] flex-shrink-0"/> <span>Gagner <span className="bg-[#39FF14]/20 px-2 py-0.5 rounded">10h/semaine</span> d'automatisation</span></div>
                 <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={16} className="text-[#39FF14] flex-shrink-0"/> <span>Réduire vos pertes de stock de <span className="bg-[#39FF14]/20 px-2 py-0.5 rounded">-30%</span></span></div>
                 <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={16} className="text-[#39FF14] flex-shrink-0"/> <span>Augmenter vos commandes de <span className="bg-[#39FF14]/20 px-2 py-0.5 rounded">+50%</span></span></div>
              </div>

              <form onSubmit={submitExitIntentLead} className="space-y-4">
                 <input type="text" placeholder="Votre Prénom *" required value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
                 
                 <div className="flex gap-2">
                   <select 
                     value={countryCode} 
                     onChange={(e) => setCountryCode(e.target.value)}
                     className="bg-zinc-50 text-black border border-zinc-200 rounded-2xl px-3 py-4 font-bold outline-none focus:border-black transition w-28 sm:w-32 cursor-pointer"
                   >
                     <option value="+221">🇸🇳 +221</option>
                     <option value="+223">🇲🇱 +223</option>
                     <option value="+225">🇨🇮 +225</option>
                     <option value="+224">🇬🇳 +224</option>
                     <option value="+241">🇬🇦 +241</option>
                     <option value="+33">🇫🇷 +33</option>
                   </select>
                   <input 
                     type="tel" 
                     placeholder={countryCode === "+221" ? "77 123 45 67 *" : "Numéro *"} 
                     required 
                     value={leadData.phone} 
                     onChange={e => setLeadData({...leadData, phone: e.target.value})} 
                     className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" 
                   />
                 </div>

                 <input type="email" placeholder="Email (Optionnel)" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />

                 <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition flex justify-center items-center gap-2">
                   Recevoir mon diagnostic <ArrowRight size={18}/>
                 </button>
              </form>

              <button onClick={() => setShowExitIntent(false)} className="mt-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition">Non merci, je préfère tout faire manuellement</button>
            </div>
          </div>
        )}

        {/* --- BOT FLOTTANT --- */}
        <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end">
          {isBotOpen && (
            <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-[#39FF14] p-0 mb-4 w-[340px] h-[450px] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
               <div className="bg-black p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <img src="https://i.ibb.co/bRdvjrhV/ONYX-LOGOS-2.png" alt="Fanta" className="w-10 h-10 rounded-full object-cover border border-[#39FF14]" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#39FF14] rounded-full border border-black animate-pulse"></div>
                     </div>
                     <div><p className="text-[#39FF14] font-black uppercase text-xs">Fanta - Conseillère</p></div>
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
                  <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && processBotReply(userReply)} placeholder="Écrire..." className="flex-1 bg-zinc-100 rounded-xl px-4 outline-none text-sm font-bold focus:ring-1 focus:ring-black" />
                  <button onClick={() => processBotReply(userReply)} className="bg-[#39FF14] p-3 rounded-xl text-black hover:scale-105 transition"><Send size={18}/></button>
               </div>
            </div>
          )}
          
          {!isBotOpen && (
             <button onClick={() => setIsBotOpen(true)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#39FF14] hover:scale-110 transition-transform bg-black relative group animate-bounce">
               <img src="https://i.ibb.co/bRdvjrhV/ONYX-LOGOS-2.png" alt="Conseillère Fanta" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
             </button>
          )}
        </div>

        {/* --- FOOTER RESTAURÉ --- */}
        <footer className="bg-black text-white py-16 border-t border-zinc-900 mt-20 relative z-10">
           <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                 <div className="flex items-center gap-3 mb-6">
                    <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" width={150} height={50} className="h-[40px] w-auto object-contain grayscale opacity-80" unoptimized />
                    <span className={`${spaceGrotesk.className} font-black tracking-tighter text-2xl text-white`}>ONYX OPS</span>
                 </div>
                 <p className="text-zinc-500 text-sm max-w-sm mb-6">
                    Le premier écosystème digital tout-en-un pour les entreprises au Sénégal. Gagnez du temps, augmentez vos ventes et dominez votre marché grâce à l'automatisation WhatsApp.
                 </p>
                 <div className="flex items-center gap-4">
                    <button onClick={() => handleWaClick("Contact Support", "Bonjour l'équipe OnyxOps, je souhaite vous contacter.")} className="text-zinc-400 hover:text-[#39FF14] transition"><MessageSquare size={20}/></button>
                    <button onClick={() => window.open('mailto:contact@onyxops.com')} className="text-zinc-400 hover:text-[#39FF14] transition"><Mail size={20}/></button>
                 </div>
              </div>
              
             <div>
                 <h4 className="font-black uppercase text-sm tracking-widest text-zinc-300 mb-6">Solutions</h4>
                 <ul className="space-y-4 text-sm text-zinc-500 font-bold">
                    <li><button onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})} className="hover:text-[#39FF14] transition">Onyx Jaay</button></li>
                    <li><button onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})} className="hover:text-[#39FF14] transition">Onyx Tiak</button></li>
                    <li><button onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})} className="hover:text-[#39FF14] transition">Onyx Menu</button></li>
                    <li><button onClick={() => document.getElementById('solutions')?.scrollIntoView({behavior:'smooth'})} className="hover:text-[#39FF14] transition">Pack Trio</button></li>
                 </ul>
              </div>

              <div>
                 <h4 className="font-black uppercase text-sm tracking-widest text-zinc-300 mb-6">Entreprise</h4>
                 <ul className="space-y-4 text-sm text-zinc-500 font-bold">
                    <li><button onClick={() => navigateTo('tarifs')} className="hover:text-[#39FF14] transition">Tarifs</button></li>
                    <li><button onClick={() => navigateTo('dashboard')} className="hover:text-[#39FF14] transition">Programme Ambassadeur</button></li>
                    <li><button onClick={() => navigateTo('blog')} className="hover:text-[#39FF14] transition">Le Blog</button></li>
                    <li><button onClick={() => setShowAuthModal(true)} className="hover:text-[#39FF14] transition">Connexion Hub</button></li>
                    <li><button onClick={() => navigateTo('home', 'faq')} className="hover:text-[#39FF14] transition">FAQ</button></li>
                 </ul>
              </div>
           </div>
           
           <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-zinc-600 font-bold">© 2026 OnyxOps Elite. Tous droits réservés. Dakar, Sénégal.</p>
              <div className="flex gap-4 text-xs font-bold text-zinc-600">
                 <button className="hover:text-white transition">CGV</button>
                 <button className="hover:text-white transition">Confidentialités</button>
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}

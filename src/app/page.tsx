"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, ShieldCheck, TrendingUp, Users, Target, 
  Zap, CheckCircle2, AlertCircle, Lock, Handshake, Package, Info, X,
  MapPin, Clock, Mail, LifeBuoy, Menu, ChevronRight, Star, MessageSquare, Flame
} from "lucide-react";

// TYPE SÉCURISÉ POUR PLAN_DETAILS
type PlanKey = "solo" | "trio" | "full" | "premium";

const PLAN_DETAILS: Record<PlanKey, { title: string; desc: string; benefits: string[]; why: string; cible: string; avantage: string; chiffreCle: string }> = {
  solo: {
    title: "Onyx Solo : L'essentiel WhatsApp",
    desc: "Digitalisez votre boutique en 24h. Idéal pour transformer vos discussions WhatsApp en commandes réelles sans effort manuel.",
    benefits: ["Catalogue interactif (Fini les 50 photos/jour)", "Lien de commande unique", "Fidélisation client automatique"],
    why: "Choisissez Solo pour gagner 2h par jour et ne plus jamais rater une vente parce que vous étiez 'occupé'.",
    cible: "Vendeurs Instagram / WhatsApp",
    avantage: "Fini les envois manuels de photos.",
    chiffreCle: "+15% de ventes via catalogue pro.",
  },
  trio: {
    title: "Pack Trio : Le Contrôle Total",
    desc: "Le combo gagnant : Vente + Stock + Devis. Connectez vos opérations pour éviter les fuites de cash et les pertes de produits.",
    benefits: ["Inventaire en temps réel", "Facturation pro instantanée", "Gestion des encaissements sécurisée"],
    why: "C'est le pack 'Sérénité'. Vous savez exactement ce qui sort de votre boutique et ce qui entre en caisse.",
    cible: "Boutiques et Prestataires",
    avantage: "Maîtrise totale du stock et du cash.",
    chiffreCle: "0 rupture de stock, 100% traçabilité.",
  },
  full: {
    title: "Pack Full : L'Ecosystème Complet",
    desc: "Les 6 SaaS Onyx travaillent ensemble pour votre succès. Une gestion digne d'une multinationale sur votre simple smartphone.",
    benefits: ["RH, Paie & Logistique intégrés", "Menu QR & Réservations avec acompte", "Rapports de performance hebdomadaires"],
    why: "Pour l'entrepreneur qui veut scaler. Automatisez tout et concentrez-vous sur votre stratégie de croissance.",
    cible: "PME & Restaurants",
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

// 💡 MISE À JOUR : Fusion Menu+Booking en "Onyx Resto", et ajout de "Onyx Staff"
const SOLUTIONS = [
  { id: "Onyx Catalog", icon: Smartphone, pain: "Perte de temps infinie sur WhatsApp avec les envois de photos.", solution: "Catalogue digital pro avec lien direct pour commander en un clic." },
  { id: "Onyx Devis", icon: Receipt, pain: "Devis gribouillés sur papier qui font perdre des clients sérieux.", solution: "Générateur de PDF pro en 60s pour sécuriser vos deals." },
  { id: "Onyx Tiak", icon: Truck, pain: "Le gérant ne sait jamais où est son cash ou son livreur.", solution: "Suivi logistique et sécurisation des encaissements en temps réel." },
  { id: "Onyx Stock", icon: Box, pain: "Rupture de stock fatale ou vols d'inventaire non détectés.", solution: "Inventaire par scan et alertes WhatsApp avant la rupture." },
  { id: "Onyx Resto", icon: Utensils, pain: "Menus chers à imprimer et réservations brouillonnes (No-shows).", solution: "Menu QR interactif et réservations en ligne avec paiement d'acompte." },
  { id: "Onyx Staff", icon: Users, pain: "Casse-tête des avances Tabaski, fiches de paies et pointage des employés sur le terrain.", solution: "Pointage GPS WhatsApp, fiches de paie par QR Code et gestion lissée des avances." },
];

const PACKS: Array<{ id: PlanKey; name: string; price: number; label: string; rating: string; avis: number }> = [
  { id: "solo", name: "Solo", price: 7500, label: "Onyx Solo", rating: "4.9/5", avis: 142 },
  { id: "trio", name: "Pack Trio", price: 17500, label: "Pack Trio", rating: "5.0/5", avis: 89 },
  { id: "full", name: "Pack Full", price: 30000, label: "Pack Full", rating: "4.9/5", avis: 215 },
  { id: "premium", name: "Premium", price: 75000, label: "Onyx Premium", rating: "5.0/5", avis: 34 },
];

const SOCIAL_PROOF_MESSAGES = [
  { name: "Fatou B. (Boutique)", action: "vient de créer son catalogue", time: "il y a 5 min" },
  { name: "Moussa D. (Restaurant)", action: "a activé le Menu QR Resto", time: "il y a 12 min" },
  { name: "Awa N. (Cosmétiques)", action: "a enregistré son 1er paiement YAS", time: "il y a 2 min" },
  { name: "Entreprise BTP", action: "vient de valider le pointage GPS de ses ouvriers", time: "à l'instant" },
  { name: "Khadija T. (Services)", action: "a généré un devis PDF en 60s", time: "il y a 8 min" },
  { name: "Ousmane F. (Boutique)", action: "a choisi le Pack Full", time: "il y a 15 min" },
  { name: "Aminata L. (Fast-Food)", action: "a reçu 14 commandes via Onyx", time: "il y a 3 min" },
  { name: "Seydou K. (Matériel)", action: "vient de faire son inventaire", time: "il y a 20 min" },
  { name: "Cabinet Médical", action: "a généré 12 fiches de paie QR Code", time: "il y a 7 min" },
  { name: "Alioune M. (Vendeur)", action: "a activé son essai 7 jours", time: "à l'instant" },
];

const FAQS = [
  { q: "Est-ce que je dois installer une application compliquée ?", a: "Non, absolument pas. Tout passe par des liens simples que vous envoyez sur WhatsApp ou que vous consultez via votre navigateur." },
  { q: "Comment je reçois mon argent ?", a: "Directement sur votre mobile ! Nous intégrons Wave, Orange Money et YAS. Zéro délai d'attente." },
  { q: "Comment fonctionne le pointage GPS OnyxStaff ?", a: "L'employé vous envoie simplement sa position en direct via WhatsApp. OnyxStaff vérifie s'il est bien sur le site de travail et valide son heure d'arrivée automatiquement." },
  { q: "Y a-t-il des frais cachés ou des commissions ?", a: "0% de commission sur vos ventes. Vous ne payez que l'abonnement de votre pack. Tout ce que vous gagnez est 100% à vous." }
];

export default function OnyxOpsElite() {
  const [activeView, setActiveView] = useState<'home' | 'about'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [packCounts, setPackCounts] = useState({ solo: 0, trio: 0, full: 0, premium: 0 });
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  
  // VARIABLES D'ÉTAT POUR LE TUNNEL ET LES MODALES
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);
  const [saasMetier, setSaasMetier] = useState("");
  const [activeProfiles, setActiveProfiles] = useState<string[]>([]);
  const [premiumStep, setPremiumStep] = useState(0);
  const [premiumScore, setPremiumScore] = useState(0);
  
  // VARIABLES POUR L'AUTHENTIFICATION & LE HUB
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // VARIABLE POUR LE TICKET INCIDENT
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  // WIDGET PREUVE SOCIALE
  const [proofIndex, setProofIndex] = useState(0);
  const [showProof, setShowProof] = useState(false);

  const waNumber = "221768102039";
  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const openPlanModal = (plan: PlanKey) => (e: React.MouseEvent) => { e.stopPropagation(); setSelectedPlan(plan); };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { 
      if (e.key === "Escape") { 
        setSelectedPlan(null); 
        setSelectedSaaS(null); 
        setShowIncidentModal(false);
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (selectedPlan || selectedSaaS || showIncidentModal || isMobileMenuOpen || isAuthModalOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedPlan, selectedSaaS, showIncidentModal, isMobileMenuOpen, isAuthModalOpen]);

  // EFFET POUR LE WIDGET PREUVE SOCIALE
  useEffect(() => {
    const initialDelay = setTimeout(() => setShowProof(true), 3000);

    const interval = setInterval(() => {
      setShowProof(false);
      setTimeout(() => {
        setProofIndex((prev) => (prev + 1) % SOCIAL_PROOF_MESSAGES.length);
        setShowProof(true);
      }, 500);
    }, 6000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  // Calculs du simulateur
  const commissionM1 = Math.round(
    packCounts.solo * 7500 * 0.30 + packCounts.trio * 17500 * 0.30 +
    packCounts.full * 30000 * 0.30 + packCounts.premium * 75000 * 0.30
  );
  const recurrentPerMonth = Math.round(
    packCounts.solo * 7500 * 0.10 + packCounts.trio * 17500 * 0.10 +
    packCounts.full * 30000 * 0.10 + packCounts.premium * 75000 * 0.10
  );
  const commissionM6 = commissionM1 + recurrentPerMonth * 5;

  let conseillerText = '"Sélectionnez votre profil à droite, je vous dirai exactement ce qu\'il vous faut pour exploser vos ventes."';
  if (activeProfiles.includes('Premium')) conseillerText = '"Passons aux choses sérieuses. Répondez à ces 3 questions pour voir si vous êtes prêt pour la puissance de l\'IA."';
  else if (activeProfiles.includes('Entreprise / RH')) conseillerText = '"Fini les fiches de paie manuelles et les pointages frauduleux. Sécurisons votre gestion d\'équipe et vos avances Tabaski."';
  else if (activeProfiles.includes('Restaurant')) conseillerText = '"De la commande à la table jusqu\'au livreur, on va structurer tout votre resto. Concentrez-vous sur vos clients."';
  else if (activeProfiles.includes('WhatsApp') && activeProfiles.includes('Boutique')) conseillerText = '"Le combo parfait : on digitalise vos ventes en ligne et on sécurise votre stock physique."';
  else if (activeProfiles.includes('WhatsApp')) conseillerText = '"Fini de scroller pour envoyer des photos. Votre catalogue va vendre pendant que vous dormez."';
  else if (activeProfiles.includes('Boutique')) conseillerText = '"Fini le cahier de brouillon. On va sécuriser votre stock et professionnaliser votre caisse."';

  const navigateTo = (view: 'home' | 'about', scrollId?: string) => {
    setIsMobileMenuOpen(false);
    setActiveView(view);
    if (scrollId) {
      setTimeout(() => {
        const element = document.getElementById(scrollId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
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

  const FreeTrialBadge = () => (
    <div className="bg-gradient-to-r from-[#39FF14]/10 to-zinc-50 border-2 border-[#39FF14] rounded-3xl p-6 md:p-8 max-w-4xl mx-auto my-12 text-center shadow-[0_10px_30px_rgba(57,255,20,0.1)] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5"><Target className="w-24 h-24" /></div>
      <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-4 uppercase shadow-lg animate-pulse">
        <Flame className="w-3 h-3" /> Offre Limitée : Plus que 12 places
      </div>
      <h3 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-bold mb-3 uppercase tracking-tighter`}>
        Testez <span className="text-[#39FF14]">Gratuitement</span> pendant 7 jours !
      </h3>
      <p className="text-zinc-600 font-medium mb-6 max-w-xl mx-auto text-sm">
        Connectez votre WhatsApp, gérez vos stocks ou facturez vos clients sans aucun risque. L'essai est 100% gratuit, sans engagement. <br/>
        <span className="font-bold italic text-black mt-2 inline-block">Offre réservée aux 50 premiers inscrits ce mois-ci.</span>
      </p>
      <button onClick={() => openAuthModal('signup')} className="inline-block bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl">
        Réclamer ma place maintenant
      </button>
    </div>
  );

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none print:hidden overflow-x-hidden`}>
      <style jsx global>{`
        body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        @media print { body { display: none; } }
      `}</style>

      <div 
        className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none bg-zinc-50"
        style={{ backgroundImage: `url('https://i.ibb.co/chCcXT7p/back-site.png')`, backgroundRepeat: 'repeat', backgroundSize: '400px' }}
      />

      <div className="relative z-10">
        <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl shadow-sm z-50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" width={150} height={50} className="h-[50px] w-auto object-contain" unoptimized />
            <span className={`${spaceGrotesk.className} font-bold tracking-tighter text-2xl hidden sm:block`}>ONYX OPS</span>
          </div>
          
          <div className="hidden md:flex gap-8 font-semibold text-sm uppercase items-center">
            <button onClick={() => navigateTo('home', 'solutions')} className="hover:text-[#39FF14] transition">Solutions</button>
            <button onClick={() => navigateTo('home', 'tarifs')} className="hover:text-[#39FF14] transition">Tarifs</button>
            <button onClick={() => navigateTo('home', 'partenaires')} className="hover:text-[#39FF14] transition">Partenaires</button>
            <button onClick={() => navigateTo('about')} className={`${activeView === 'about' ? 'text-[#39FF14] border-b-2 border-[#39FF14]' : ''} hover:text-[#39FF14] transition py-1`}>À Propos</button>
            <button onClick={() => openAuthModal('login')} className="bg-black text-[#39FF14] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition duration-300 shadow-md">
              Accès Hub
            </button>
          </div>

          <div className="flex md:hidden items-center gap-4">
            <button onClick={() => openAuthModal('login')} className="bg-black text-[#39FF14] px-4 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest">
              Hub
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2.5 bg-zinc-100 rounded-full text-black">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 md:hidden animate-in fade-in zoom-in duration-300">
            <button onClick={() => navigateTo('home', 'solutions')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest`}>Solutions</button>
            <button onClick={() => navigateTo('home', 'tarifs')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest`}>Tarifs</button>
            <button onClick={() => navigateTo('home', 'partenaires')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest`}>Partenaires</button>
            <button onClick={() => navigateTo('about')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest ${activeView === 'about' ? 'text-[#39FF14]' : ''}`}>À Propos</button>
            <button onClick={() => { setIsMobileMenuOpen(false); openAuthModal('login'); }} className="mt-8 bg-[#39FF14] text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl">
              Se Connecter
            </button>
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
                <button onClick={() => navigateTo('home', 'partenaires')} className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#39FF14] hover:text-black transition duration-300">
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

            <div className="px-6">
              <FreeTrialBadge />
            </div>

            <section className="py-16 px-6 max-w-6xl mx-auto mb-10">
              <div className="text-center mb-12">
                <h2 className={`${spaceGrotesk.className} text-3xl font-bold uppercase`}>Fini le Bricolage. <span className="text-[#39FF14]">Passez au niveau supérieur.</span></h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="bg-red-50/50 border border-red-100 rounded-[3rem] p-8 h-full flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest">Avant Onyx</div>
                  <h3 className="font-black text-red-800 text-xl mb-6">Le Chaos sur WhatsApp</h3>
                  
                  <div className="space-y-4 flex-1">
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-red-100 text-sm text-zinc-600 shadow-sm max-w-[80%]">
                      <p className="font-bold text-xs text-red-500 mb-1">+221 77 000 00 00</p>
                      C'est quoi l'avance Tabaski de Modou déjà ? Et il a pointé hier au chantier ?
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-red-100 text-sm text-zinc-600 shadow-sm max-w-[80%]">
                      <p className="font-bold text-xs text-red-500 mb-1">+221 76 111 11 11</p>
                      Tu as la taille 42 en stock ? Tu livres à Almadies aujourd'hui ??
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-red-100 text-sm text-zinc-600 shadow-sm max-w-[80%]">
                      <p className="font-bold text-xs text-red-500 mb-1">+221 78 222 22 22</p>
                      J'attends ma commande depuis 2h, le livreur ne répond pas 😡
                    </div>
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-red-200 pt-4 text-xs font-bold text-red-600 uppercase">
                    <span className="flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Pertes d'argent</span>
                    <span>Stress : Maximum</span>
                  </div>
                </div>

                <div className="bg-black rounded-[3rem] p-8 h-full flex flex-col relative shadow-[0_15px_40px_rgba(57,255,20,0.15)] border border-[#39FF14]/30">
                  <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-4 py-1 rounded-bl-2xl font-black text-[10px] uppercase tracking-widest">Avec OnyxOps</div>
                  <h3 className="font-black text-white text-xl mb-6 flex items-center gap-2"><CheckCircle2 className="text-[#39FF14] w-6 h-6"/> L'Automatisation Parfaite</h3>
                  
                  <div className="space-y-4 flex-1">
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-zinc-400 font-bold uppercase">Ressources Humaines</span>
                        <span className="bg-[#39FF14]/20 text-[#39FF14] text-[10px] px-2 py-0.5 rounded-full font-black">Pointage OK</span>
                      </div>
                      <p className="text-white text-sm">Modou S. (Chantier Diamniadio) a partagé sa localisation en direct.</p>
                      <p className="text-zinc-500 font-medium text-xs mt-1">Avance Tabaski déduite : -25.000F</p>
                    </div>
                    
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                       <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-zinc-400 font-bold uppercase">Logistique Tiak-Tiak</span>
                        <span className="bg-yellow-500/20 text-yellow-500 text-[10px] px-2 py-0.5 rounded-full font-black">En route</span>
                      </div>
                      <p className="text-white text-sm">Nouvelle Commande #1042 payée. Livreur assigné auto.</p>
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
                    className="group bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-xl hover:border-[#39FF14] transition-all relative overflow-hidden cursor-pointer"
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

            <section id="tarifs" className="py-20 bg-black text-white rounded-[4rem] mx-4 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
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
                        onClick={() => setSelectedPlan(pack.id)} 
                        className={`${pack.id === 'trio' ? 'bg-gradient-to-br from-[#39FF14]/20 to-black border-2 border-[#39FF14] scale-105 lg:scale-110 shadow-[0_0_50px_rgba(57,255,20,0.2)]' : 'bg-zinc-900/50 border border-white/10 hover:scale-105'} p-8 rounded-[3rem] transition cursor-pointer relative group flex flex-col`}
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
                        
                        <ul className={`text-xs space-y-3 mb-10 flex-1 ${pack.id === 'trio' ? 'text-zinc-300' : 'text-zinc-400'}`}>
                          {packBenefits.map((ben, i) => (
                            <li key={i} className="flex gap-2">✔ {ben}</li>
                          ))}
                        </ul>
                        
                        <a href={getWaLink(`Bonjour Onyx, je veux COMMENCER avec l'offre ${pack.label} à ${pack.price.toLocaleString()}F.`)} onClick={(e) => e.stopPropagation()} className={`block text-center py-4 rounded-2xl font-black text-sm transition uppercase tracking-tighter ${pack.id === 'trio' ? 'bg-[#39FF14] text-black hover:bg-white' : pack.id === 'premium' ? 'border-2 border-white/20 text-white hover:bg-white hover:text-black' : 'bg-white text-black hover:bg-[#39FF14]'}`}>
                          {pack.id === 'premium' ? 'Contacter' : 'Commencer'}
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-100">
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
                        <a href={getWaLink(`Recommandation interactive : Je veux sécuriser le pack ${premiumScore >= 2 ? 'Premium (75k)' : 'Full (30k)'}.`)} className="block text-center bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs shadow-xl hover:scale-105 transition">Verrouiller cette offre sur WhatsApp</a>
                      </div>
                    )}

                    {!activeProfiles.includes('Premium') && activeProfiles.length > 0 && (
                      <div className="animate-in zoom-in duration-300">
                        <h4 className="font-black text-2xl mb-2 flex items-center gap-2">
                          <CheckCircle2 className="text-[#39FF14]"/> 
                          {activeProfiles.includes('Restaurant') || activeProfiles.includes('Entreprise / RH') ? 'Pack Full (30.000F)' : 
                           activeProfiles.length === 2 ? 'Pack Trio (17.500F)' : 
                           activeProfiles.includes('Boutique') ? 'Pack Trio (17.500F)' : 
                           'Onyx Solo : OnyxCatalog (7.500F)'}
                        </h4>
                        <p className="text-sm text-zinc-600 mb-6 font-medium leading-relaxed">
                          {activeProfiles.includes('Restaurant') ? "Il vous faut la totale. QR Menu sur les tables, Tiak pour vos livraisons, et Stock pour les ingrédients. Le Pack Full est votre directeur des opérations." : 
                           activeProfiles.includes('Entreprise / RH') ? "OnyxStaff va transformer votre gestion. Pointage GPS WhatsApp pour vos chantiers, Fiches de paie par QR Code et gestion native des avances Tabaski." : 
                           activeProfiles.length === 2 ? "Vous êtes sur tous les fronts. Le Pack Trio lie votre e-commerce WhatsApp à votre gestion de stock physique. Vendez en ligne, déstockez en boutique." : 
                           activeProfiles.includes('Boutique') ? "Sécurisez vos caisses. Le Pack Trio avec OnyxStock et OnyxDevis vous garantit zéro perte d'inventaire et des factures pro pour vos clients." : 
                           "Ne payez que pour ce dont vous avez besoin. OnyxCatalog transforme votre WhatsApp en machine à vendre. Lien direct, panier, commande. Simple et radical."}
                        </p>
                        <a href={getWaLink(`Recommandation : Je prends l'offre ${activeProfiles.includes('Restaurant') || activeProfiles.includes('Entreprise / RH') ? 'Full (30k)' : activeProfiles.length === 2 || activeProfiles.includes('Boutique') ? 'Trio (17.5k)' : 'Solo Catalog (7.5k)'}.`)} className="block text-center bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl">
                          Commander cette solution (WhatsApp)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-100">
              <div className="text-center mb-16">
                <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-4 uppercase`}>
                  Spécial Marché Sénégalais 🇸🇳
                </div>
                <h2 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-bold mb-4 uppercase leading-[0.9] tracking-tighter`}>
                  WAKH DEUG : ONYX VS <span className="text-zinc-400 italic line-through">LES AUTRES</span>
                </h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic max-w-2xl mx-auto">
                  Pourquoi payer des logiciels étrangers hors de prix quand vous avez plus d'options, plus de puissance, et un prix imbattable conçu pour nos réalités ?
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
                <div className="bg-zinc-50 border-2 border-zinc-200 p-8 md:p-12 rounded-[3rem] opacity-80">
                  <h3 className={`${spaceGrotesk.className} text-2xl font-bold text-zinc-400 mb-8 uppercase text-center`}>Les Logiciels Classiques</h3>
                  <ul className="space-y-6">
                    {[
                      { text: "Abonnements en Euros / Dollars très chers", icon: <X className="text-red-500 w-5 h-5" /> },
                      { text: "Usines à gaz conçues pour l'Europe sans pointage adapté", icon: <X className="text-red-500 w-5 h-5" /> },
                      { text: "Nécessite souvent un ordinateur fixe", icon: <X className="text-red-500 w-5 h-5" /> },
                      { text: "Aucune gestion locale des avances (Tabaski/Korité)", icon: <X className="text-red-500 w-5 h-5" /> },
                      { text: "Aucune intégration avec nos livreurs Tiak-Tiak", icon: <X className="text-red-500 w-5 h-5" /> }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm font-semibold text-zinc-500">
                        <div className="mt-0.5 bg-red-100 p-1 rounded-full flex-shrink-0">{item.icon}</div>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-black border-2 border-[#39FF14] p-8 md:p-12 rounded-[3rem] shadow-[0_0_40px_rgba(57,255,20,0.15)] relative scale-105 z-10">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#39FF14] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg whitespace-nowrap">
                    Le Choix des Boss 🚀
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-3xl font-bold text-white mb-8 uppercase text-center flex items-center justify-center gap-3`}>
                    OnyxOps <Zap className="text-[#39FF14] w-6 h-6 fill-[#39FF14]" />
                  </h3>
                  <ul className="space-y-6">
                    {[
                      { text: "Prix imbattable en FCFA (dès 7.500F/mois)", icon: <CheckCircle2 className="text-black w-5 h-5" /> },
                      { text: "Pointage GPS WhatsApp et Paie par QR Code", icon: <CheckCircle2 className="text-black w-5 h-5" /> },
                      { text: "Tout se gère tranquillement depuis votre smartphone", icon: <CheckCircle2 className="text-black w-5 h-5" /> },
                      { text: "Support VIP & Local sur WhatsApp 7j/7", icon: <CheckCircle2 className="text-black w-5 h-5" /> },
                      { text: "Gestion native des livraisons, paiements mobiles et stocks", icon: <CheckCircle2 className="text-black w-5 h-5" /> }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm font-bold text-white leading-relaxed">
                        <div className="mt-0.5 bg-[#39FF14] p-1 rounded-full flex-shrink-0">{item.icon}</div>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-10 pt-8 border-t border-zinc-800 text-center">
                    <p className="text-xs text-zinc-400 font-medium italic mb-4">"Arrêtez de payer plus pour des outils qui en font moins."</p>
                    <button onClick={() => navigateTo('home', 'tarifs')} className="inline-block bg-[#39FF14] text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition">Voir nos tarifs</button>
                  </div>
                </div>
              </div>
            </section>

            <section className="py-20 px-6 max-w-5xl mx-auto border-t border-zinc-100">
              <div className="text-center mb-16">
                <h2 className={`${spaceGrotesk.className} text-4xl font-bold mb-4 uppercase tracking-tighter`}>Vos Questions, <span className="text-[#39FF14]">Nos Réponses.</span></h2>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Tout ce que vous devez savoir avant de commencer.</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                {FAQS.map((faq, idx) => (
                  <div key={idx} className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 hover:border-[#39FF14] transition duration-300">
                    <div className="bg-black text-[#39FF14] w-10 h-10 rounded-xl flex items-center justify-center mb-4 font-black text-lg">?</div>
                    <h4 className="font-bold text-lg text-black mb-3">{faq.q}</h4>
                    <p className="text-zinc-600 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
              <div className="mt-12 text-center">
                <p className="text-sm font-bold text-zinc-500 mb-4">Une autre question ?</p>
                <a href={getWaLink("Bonjour l'équipe OnyxOps, j'ai une question avant de m'inscrire :")} className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl">
                  <MessageSquare className="w-4 h-4" /> Discuter avec nous
                </a>
              </div>
            </section>

            <section id="partenaires" className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-100">
              <div className="grid md:grid-cols-2 gap-16 items-center">
                <div>
                  <h2 className={`${spaceGrotesk.className} text-5xl font-black mb-6 uppercase leading-none`}>VOTRE <span className="text-[#39FF14]">RENTE</span> SÉNÉGALAISE.</h2>
                  <p className="text-zinc-600 mb-10 font-bold leading-relaxed">
                    Rejoignez notre réseau. Vendez OnyxOps à vos contacts et construisez votre indépendance financière.
                  </p>
                  <div className="space-y-6">
                    <div className="flex gap-4 items-center">
                      <div className="bg-[#39FF14] text-black p-3 rounded-full"><TrendingUp /></div>
                      <div><p className="font-black text-lg">30% CASH IMMÉDIAT</p><p className="text-xs text-zinc-400 uppercase font-bold">Sur chaque premier mois de pack signé.</p></div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="bg-black text-[#39FF14] p-3 rounded-full"><Zap /></div>
                      <div><p className="font-black text-lg">10% RÉCURRENT À VIE</p><p className="text-xs text-zinc-400 uppercase font-bold">Tant que votre client paie son SaaS.</p></div>
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="bg-white border-2 border-black text-black p-3 rounded-full"><Users /></div>
                      <div><p className="font-black text-lg">5% RÉSEAU AFFILIÉ</p><p className="text-xs text-zinc-400 uppercase font-bold">Commission sur toutes les ventes de votre équipe.</p></div>
                    </div>
                  </div>
                  <div className="mt-8 p-6 bg-[#39FF14]/10 border-2 border-[#39FF14] rounded-3xl">
                    <p className="text-[10px] font-black text-[#39FF14] uppercase tracking-wider mb-2">6 Mini-SaaS</p>
                    <p className="font-bold text-lg text-black">7 500F par mois</p>
                    <p className="text-sm text-zinc-600 font-semibold">30% Commission</p>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-10 rounded-[4rem] shadow-2xl relative">
                  <div className="absolute top-0 right-0 p-6 opacity-20"><Target className="w-12 h-12" /></div>
                  <h3 className={`${spaceGrotesk.className} text-xl font-bold mb-6 uppercase italic`}>Simulateur de Gains</h3>
                  <p className="text-xs text-zinc-500 mb-6">Simulez vos revenus selon les packs vendus (30% M1 + 10% récurrent/mois).</p>
                  
                  <div className="space-y-5 mb-8">
                    {PACKS.map((p) => (
                      <div key={p.id} className="flex items-center justify-between gap-4">
                        <span className="text-xs font-bold uppercase min-w-[100px]">{p.label}</span>
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="range"
                            min="0"
                            max="25"
                            value={packCounts[p.id]}
                            onChange={(e) => setPackCounts((prev) => ({ ...prev, [p.id]: parseInt(e.target.value, 10) }))}
                            className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
                          />
                          <span className="text-[#39FF14] bg-black px-3 py-1 rounded-full text-xs font-bold w-12 text-center">{packCounts[p.id]}</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 w-16">{p.price.toLocaleString()}F/unit</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black p-6 rounded-3xl text-white">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2 italic">Gain Immédiat (M1)</p>
                      <p className={`${spaceGrotesk.className} text-2xl font-bold text-[#39FF14]`}>{commissionM1.toLocaleString()} F</p>
                    </div>
                    <div className="bg-white border-2 border-black p-6 rounded-3xl">
                      <p className="text-[10px] font-bold text-zinc-400 uppercase mb-2 italic">Cumul sur 6 mois</p>
                      <p className={`${spaceGrotesk.className} text-2xl font-bold text-black`}>{commissionM6.toLocaleString()} F</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-3">Récurrent/mois : {recurrentPerMonth.toLocaleString()} F</p>
                  
                  <a href={getWaLink(
                    "Bonjour Onyx, je veux devenir PARTENAIRE." +
                    (Object.entries(packCounts).some(([, v]) => v > 0)
                      ? " Je vise " + Object.entries(packCounts).filter(([, v]) => v > 0).map(([k, v]) => `${v} ${PACKS.find(x => x.id === k)?.label}`).join(" + ") + " par mois."
                      : "")
                  )} className="mt-8 block text-center bg-[#39FF14] text-black py-5 rounded-[2rem] font-black uppercase text-sm shadow-[0_15px_40px_rgba(57,255,20,0.3)] hover:scale-105 transition">Devenir Partenaire</a>
                </div>
              </div>
            </section>
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

            <FreeTrialBadge />

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              <div className="relative aspect-square md:aspect-[4/5] bg-zinc-100 rounded-[3rem] overflow-hidden shadow-xl border border-zinc-200 group">
                <img 
                  src="https://i.ibb.co/Kcr9Jbms/1772397975062-37ba89eb-1a9a-4ac7-b555-20749059995f.png" 
                  alt="Maimouna Traoré - Directrice Marketing" 
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition duration-700" 
                />
                
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-3xl border-2 border-[#39FF14] shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="font-black text-sm uppercase tracking-widest text-black mb-1">Maimouna Traoré</p>
                  <p className="text-xs font-bold text-zinc-500 mb-3">Digital Marketing Manager</p>
                  <p className="text-sm font-bold text-black italic border-l-4 border-[#39FF14] pl-3">
                    "Parce que les Vues ne paient pas les factures."
                  </p>
                </div>
              </div>

              <div>
                <h3 className={`${spaceGrotesk.className} text-3xl font-bold mb-6 uppercase leading-tight`}>
                  L'Efficacité avant <br/>l'Esthétique.
                </h3>
                <div className="space-y-4 text-zinc-600 font-medium mb-10 leading-relaxed">
                  <p>Trop d'entreprises au Sénégal se concentrent sur les "likes" et les belles photos sur Instagram, en oubliant l'essentiel : <span className="text-black font-bold">la conversion et l'encaissement direct.</span></p>
                  <p className="p-4 bg-zinc-50 border-l-4 border-black text-sm italic rounded-r-2xl">
                    "L'idée d'OnyxOps est née d'un constat brutal sur le terrain : nos commerçants jonglent entre des cahiers raturés, des commandes perdues sur WhatsApp et des livreurs Tiak-Tiak injoignables. Il nous fallait une solution unifiée."
                  </p>
                  <p>Chez OnyxOps, nous implémentons la méthodologie <span className="text-black font-bold">RevOps (Revenue Operations)</span> adaptée aux réalités africaines. Nous alignons vos ventes, votre marketing et votre service client.</p>
                </div>

                <div className="bg-zinc-50 p-6 md:p-8 rounded-[2.5rem] border border-zinc-200 space-y-4 mb-10">
                  <a href="https://maps.google.com/?q=Place+de+l'Indépendance,+Dakar,+Senegal" target="_blank" rel="noreferrer" className="flex items-start gap-4 group p-2 rounded-2xl hover:bg-white hover:shadow-md transition">
                    <div className="bg-black text-[#39FF14] p-3 rounded-full group-hover:scale-110 transition-transform"><MapPin className="w-5 h-5" /></div>
                    <div>
                      <p className="font-black text-xs uppercase tracking-widest text-zinc-500 mb-1">Adresse</p>
                      <p className="font-bold text-sm text-black">Dakar Centre Ville</p>
                      <p className="text-xs font-medium text-zinc-500">Près de la place de l'indépendance</p>
                    </div>
                  </a>
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
                  <button onClick={() => navigateTo('home')} className="flex-1 bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl text-center">
                    Retour aux Solutions
                  </button>
                  <a href={getWaLink("Bonjour Maimouna, je vous contacte depuis la page À Propos du site OnyxOps.")} className="flex-1 border-2 border-black text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-black hover:text-[#39FF14] transition text-center">
                    Contacter via WhatsApp
                  </a>
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
                  { name: "Amadou Ndiaye", role: "Lead Dev Fullstack", desc: "L'architecte réseau. Il s'assure que vos SaaS ne plantent jamais.", img: null },
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

            <div className="py-10 text-center">
              <p className="font-bold text-sm text-zinc-400 uppercase tracking-widest mb-6">Nous acceptons les paiements via</p>
              <PaymentMethods />
            </div>

            <div className="bg-black text-white p-10 md:p-14 rounded-[3rem] text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden mt-12">
              <div className="absolute top-0 right-0 p-8 opacity-10"><LifeBuoy className="w-32 h-32" /></div>
              <LifeBuoy className="w-10 h-10 text-[#39FF14] mx-auto mb-6" />
              <h3 className={`${spaceGrotesk.className} text-3xl font-bold mb-4 uppercase`}>Besoin d'assistance technique ?</h3>
              <p className="text-zinc-400 font-medium mb-8 max-w-lg mx-auto">
                Vous rencontrez un bug ou avez besoin d'aide sur l'un de nos SaaS ? Notre équipe de support technique est prête à intervenir.
              </p>
              <button onClick={() => setShowIncidentModal(true)} className="inline-block bg-[#39FF14] text-black px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition shadow-[0_15px_40px_rgba(57,255,20,0.3)]">
                Ouvrir un ticket incident
              </button>
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
        <div 
          className={`fixed bottom-6 left-6 z-[90] bg-white text-black p-4 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.15)] border-l-4 border-[#39FF14] transition-all duration-500 transform ${showProof ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'} max-w-[280px] pointer-events-none hidden md:block`}
        >
          <div className="flex items-start gap-3">
             <div className="bg-[#39FF14]/20 p-2 rounded-full mt-1"><Star className="w-4 h-4 text-[#39FF14] fill-[#39FF14]" /></div>
             <div>
               <p className="text-[11px] font-black uppercase text-zinc-800 tracking-tighter">{SOCIAL_PROOF_MESSAGES[proofIndex].name}</p>
               <p className="text-[10px] text-zinc-500 font-medium leading-tight mt-0.5">{SOCIAL_PROOF_MESSAGES[proofIndex].action}</p>
               <p className="text-[9px] font-black text-[#39FF14] mt-1 tracking-widest">{SOCIAL_PROOF_MESSAGES[proofIndex].time}</p>
             </div>
          </div>
        </div>

        {/* ----------------- MODALES ----------------- */}
        
        {/* 0. AUTHENTIFICATION */}
        {isAuthModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4" onClick={() => setIsAuthModalOpen(false)}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" aria-hidden="true" />
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white text-black rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
              <button type="button" onClick={() => setIsAuthModalOpen(false)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-100 text-black flex items-center justify-center hover:bg-black hover:text-[#39FF14] transition">
                <X className="w-5 h-5" />
              </button>
              
              <div className="text-center mb-8 mt-2">
                <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2`}>
                  {authMode === 'login' ? 'Content de vous revoir' : 'Créez votre Empire'}
                </h3>
                <p className="text-sm font-medium text-zinc-500">
                  {authMode === 'login' ? 'Accédez à votre Hub OnyxOps' : 'Démarrez votre essai gratuit de 7 jours.'}
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Email / Numéro de téléphone</label>
                  <input type="text" className="w-full bg-zinc-100 border-none p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#39FF14] transition" placeholder="contact@entreprise.com" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Mot de passe</label>
                  <input type="password" className="w-full bg-zinc-100 border-none p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#39FF14] transition" placeholder="••••••••" />
                </div>
                
                {authMode === 'signup' && (
                  <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Secteur d'activité</label>
                    <select className="w-full bg-zinc-100 border-none p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[#39FF14] transition cursor-pointer" defaultValue="">
                      <option value="" disabled>Choisissez votre secteur...</option>
                      <option value="boutique">Boutique / Prêt-à-porter</option>
                      <option value="resto">Restauration / Food</option>
                      <option value="services">Prestataire de Services</option>
                      <option value="grossiste">Grossiste / Stockage</option>
                      <option value="rh">Entreprises / RH (Onyx Staff)</option>
                    </select>
                  </div>
                )}
              </div>

              <button className="w-full bg-black text-[#39FF14] py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#39FF14] hover:text-black transition flex items-center justify-center gap-2 group">
                {authMode === 'login' ? 'Connexion au Hub' : 'Créer mon compte'} 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
                  className="text-xs font-bold text-zinc-500 hover:text-black underline underline-offset-4 transition"
                >
                  {authMode === 'login' ? "Pas encore de compte ? Démarrer l'essai." : "Déjà un compte ? Connectez-vous."}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. DETAILS PACK */}
        {selectedPlan && PLAN_DETAILS[selectedPlan] && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedPlan(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white text-black rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
              <button type="button" onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-100 text-black flex items-center justify-center hover:bg-black hover:text-[#39FF14] transition">
                <X className="w-5 h-5" />
              </button>
              <div className="bg-black text-[#39FF14] inline-block px-4 py-1.5 rounded-full text-[10px] font-black mb-6 uppercase tracking-widest shadow-lg">Détails de l'offre</div>
              <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-3`}>{PLAN_DETAILS[selectedPlan].title}</h3>
              <p className="text-sm text-zinc-600 mb-6 leading-relaxed font-medium">{PLAN_DETAILS[selectedPlan].desc}</p>
              
              <div className="space-y-3 mb-6 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                <p className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-[#39FF14]"/> Inclus dans ce pack :</p>
                {(PLAN_DETAILS[selectedPlan]?.benefits || []).map((b, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <div className="w-1.5 h-1.5 bg-black rounded-full flex-shrink-0 mt-1.5" />
                    <span className="font-semibold text-zinc-700">{b}</span>
                  </div>
                ))}
              </div>
              
              <div className="p-5 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14] mb-6">
                <p className="text-[10px] font-black text-[#39FF14] uppercase mb-1 tracking-widest">Chiffre clé</p>
                <p className="text-base font-black text-black">{PLAN_DETAILS[selectedPlan].chiffreCle}</p>
              </div>
              
              <div className="mb-8">
                <p className="text-[10px] font-black text-zinc-400 uppercase mb-2 tracking-widest">Pourquoi choisir ?</p>
                <p className="text-zinc-800 italic text-sm font-medium border-l-4 border-black pl-3">{PLAN_DETAILS[selectedPlan].why}</p>
              </div>

              <button onClick={() => { setSelectedPlan(null); openAuthModal('signup'); }} className="w-full text-center bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition">
                Démarrer l'essai pour ce pack
              </button>
            </div>
          </div>
        )}

        {/* 2. CHOIX SAAS */}
        {selectedSaaS && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedSaaS(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white rounded-[3rem] max-w-xl w-full p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
              <button type="button" onClick={() => setSelectedSaaS(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-zinc-100 text-black flex items-center justify-center hover:bg-black hover:text-[#39FF14] transition">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="bg-black text-[#39FF14] p-4 rounded-2xl">
                  <selectedSaaS.icon className="w-8 h-8" />
                </div>
                <div>
                  <h3 className={`${spaceGrotesk.className} text-3xl font-bold uppercase italic`}>{selectedSaaS.id}</h3>
                </div>
              </div>
              
              {!saasMetier ? (
                <>
                  <p className="font-black uppercase text-xs tracking-widest text-zinc-500 mb-6">Quel est votre secteur d'activité ?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {['Prêt-à-porter / Beauté', 'Restauration / Food', 'Entreprise / BTP / RH', 'Grossiste / Quincaillerie'].map(m => (
                      <button key={m} onClick={() => setSaasMetier(m)} className="p-4 border-2 border-zinc-100 rounded-2xl text-xs font-bold text-zinc-700 hover:border-[#39FF14] hover:bg-[#39FF14]/5 transition text-left">
                        {m}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-[#39FF14]/10 border-2 border-[#39FF14] p-6 rounded-3xl mb-8">
                    <p className="font-black text-sm mb-3 flex items-center gap-2 uppercase tracking-widest">
                      <CheckCircle2 className="text-[#39FF14] w-5 h-5"/> Verdict pour : <span className="text-black">{saasMetier}</span>
                    </p>
                    <p className="text-sm font-semibold text-zinc-800 leading-relaxed">
                      {selectedSaaS.id === 'Onyx Resto' && saasMetier.includes('Restauration') ? "C'est l'outil PARFAIT pour vous. Fini les menus papiers sales et les no-shows." :
                       selectedSaaS.id === 'Onyx Staff' && saasMetier.includes('Entreprise') ? "Fini le casse-tête de la paie et des avances Tabaski. Le pointage GPS WhatsApp va sécuriser vos chantiers." :
                       selectedSaaS.id === 'Onyx Catalog' && saasMetier.includes('Prêt-à-porter') ? "Indispensable ! Vos clients vont acheter sans attendre vos réponses." :
                       selectedSaaS.id === 'Onyx Stock' && saasMetier.includes('Grossiste') ? "Vital pour votre business. Suivez vos entrées/sorties par scan." :
                       `Oui, ${selectedSaaS.id} est très utile en ${saasMetier}. Mais couplé à d'autres outils, il sera encore plus puissant.`}
                    </p>
                  </div>
                  <button onClick={() => { setSelectedSaaS(null); openAuthModal('signup'); }} className="w-full text-center bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#39FF14] hover:text-black transition">
                    Activer {selectedSaaS.id} gratuitement
                  </button>
                  <button onClick={() => setSaasMetier("")} className="mt-4 w-full text-center text-xs font-bold text-zinc-400 hover:text-black underline underline-offset-4">Refaire le test</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. TICKET INCIDENT */}
        {showIncidentModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setShowIncidentModal(false)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white rounded-[3rem] max-w-lg w-full p-8 md:p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
              <button type="button" onClick={() => setShowIncidentModal(false)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-zinc-100 text-black flex items-center justify-center hover:bg-black hover:text-[#39FF14] transition">
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-red-100 text-red-500 p-3 rounded-2xl">
                  <LifeBuoy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-bold uppercase tracking-tighter`}>Nouveau Ticket</h3>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 p-4 rounded-2xl mb-6 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-orange-800 font-medium">
                  <span className="font-bold block mb-1 uppercase tracking-widest">Connexion Requise</span>
                  Vous devez être connecté(e) à votre espace client OnyxOps pour soumettre ce formulaire.
                </p>
              </div>

              <div className="space-y-4 opacity-50 pointer-events-none mb-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Produit concerné</label>
                  <select className="w-full bg-zinc-100 border-none p-4 rounded-xl text-sm font-medium outline-none">
                    <option>Sélectionner un SaaS...</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Description</label>
                  <textarea rows={3} className="w-full bg-zinc-100 border-none p-4 rounded-xl text-sm font-medium outline-none" placeholder="Détaillez le problème..."></textarea>
                </div>
              </div>

              <button disabled className="w-full bg-zinc-200 text-zinc-400 py-4 rounded-xl font-black uppercase text-xs tracking-widest cursor-not-allowed">
                Envoyer le ticket
              </button>

              <p className="text-center mt-4">
                <a href={getWaLink("Bonjour le support OnyxOps, j'ai une urgence technique.")} className="text-xs font-bold text-black underline underline-offset-4 hover:text-[#39FF14] transition">
                  Urgence critique ? Contactez-nous ici.
                </a>
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
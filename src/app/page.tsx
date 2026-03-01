"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, ShieldCheck, TrendingUp, Users, Target, 
  Zap, CheckCircle2, AlertCircle, Lock, Handshake, Package, Info, X,
  MapPin, Clock, Mail, LifeBuoy, Menu
} from "lucide-react";

const PLAN_DETAILS: Record<string, { title: string; desc: string; benefits: string[]; why: string; cible: string; avantage: string; chiffreCle: string }> = {
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
    benefits: ["Logistique & Livreurs intégrés", "Menu QR & Réservations", "Rapports de performance hebdomadaires"],
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

const SOLUTIONS = [
  { id: "Onyx Catalog", icon: Smartphone, pain: "Perte de temps infinie sur WhatsApp avec les envois de photos.", solution: "Catalogue digital pro avec lien direct pour commander en un clic." },
  { id: "Onyx Devis", icon: Receipt, pain: "Devis gribouillés sur papier qui font perdre des clients sérieux.", solution: "Générateur de PDF pro en 60s pour sécuriser vos deals." },
  { id: "Onyx Tiak", icon: Truck, pain: "Le gérant ne sait jamais où est son cash ou son livreur.", solution: "Suivi logistique et sécurisation des encaissements en temps réel." },
  { id: "Onyx Stock", icon: Box, pain: "Rupture de stock fatale ou vols d'inventaire non détectés.", solution: "Inventaire par scan et alertes WhatsApp avant la rupture." },
  { id: "Onyx Menu", icon: Utensils, pain: "Menus sales, chers à imprimer et erreurs de commande.", solution: "QR Menu interactif : le client scanne et commande proprement." },
  { id: "Onyx Booking", icon: Calendar, pain: "Rendez-vous manqués (No-shows) et planning brouillon.", solution: "Réservations en ligne avec paiement d'acompte sécurisé." },
];

const PACKS = [
  { id: "solo", name: "Solo", price: 7500, label: "Onyx Solo" },
  { id: "pack3", name: "Pack Trio", price: 17500, label: "Pack Trio" },
  { id: "full", name: "Pack Full", price: 30000, label: "Pack Full" },
  { id: "premium", name: "Premium", price: 75000, label: "Onyx Premium" },
] as const;

export default function OnyxOpsElite() {
  const [activeView, setActiveView] = useState<'home' | 'about'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [packCounts, setPackCounts] = useState({ solo: 0, pack3: 0, full: 0, premium: 0 });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  // VARIABLES D'ÉTAT POUR LE TUNNEL ET LES MODALES
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);
  const [saasMetier, setSaasMetier] = useState("");
  const [activeProfiles, setActiveProfiles] = useState<string[]>([]);
  const [premiumStep, setPremiumStep] = useState(0);
  const [premiumScore, setPremiumScore] = useState(0);
  
  // VARIABLE POUR LE TICKET INCIDENT
  const [showIncidentModal, setShowIncidentModal] = useState(false);

  const waNumber = "221768102039";
  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const openPlanModal = (plan: string) => (e: React.MouseEvent) => { e.stopPropagation(); setSelectedPlan(plan); };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { 
      if (e.key === "Escape") { setSelectedPlan(null); setSelectedSaaS(null); setShowIncidentModal(false); }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = (selectedPlan || selectedSaaS || showIncidentModal || isMobileMenuOpen) ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedPlan, selectedSaaS, showIncidentModal, isMobileMenuOpen]);

  // Calculs du simulateur : 30% M1 + 10% récurrent/mois
  const commissionM1 = Math.round(
    packCounts.solo * 7500 * 0.30 + packCounts.pack3 * 17500 * 0.30 +
    packCounts.full * 30000 * 0.30 + packCounts.premium * 75000 * 0.30
  );
  const recurrentPerMonth = Math.round(
    packCounts.solo * 7500 * 0.10 + packCounts.pack3 * 17500 * 0.10 +
    packCounts.full * 30000 * 0.10 + packCounts.premium * 75000 * 0.10
  );
  const commissionM6 = commissionM1 + recurrentPerMonth * 5; // M2 à M6

  // Génération du texte de la conseillère
  let conseillerText = '"Sélectionnez votre profil à droite, je vous dirai exactement ce qu\'il vous faut pour exploser vos ventes."';
  if (activeProfiles.includes('Premium')) conseillerText = '"Passons aux choses sérieuses. Répondez à ces 3 questions pour voir si vous êtes prêt pour la puissance de l\'IA."';
  else if (activeProfiles.includes('Restaurant')) conseillerText = '"De la commande à la table jusqu\'au livreur, on va structurer tout votre resto. Concentrez-vous sur vos clients."';
  else if (activeProfiles.includes('WhatsApp') && activeProfiles.includes('Boutique')) conseillerText = '"Le combo parfait : on digitalise vos ventes en ligne et on sécurise votre stock physique. Zéro fuite de cash !"';
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
      <div className="h-6 md:h-8 px-4 bg-black text-white rounded flex items-center justify-center font-black italic text-xs md:text-sm tracking-wider">
        YAS MONEY
      </div>
    </div>
  );

  const FreeTrialBadge = () => (
    <div className="bg-gradient-to-r from-[#39FF14]/10 to-zinc-50 border-2 border-[#39FF14] rounded-3xl p-6 md:p-8 max-w-4xl mx-auto my-12 text-center shadow-[0_10px_30px_rgba(57,255,20,0.1)] relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-5"><Target className="w-24 h-24" /></div>
      <div className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-4 uppercase">
        Offre Découverte
      </div>
      <h3 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-bold mb-3 uppercase tracking-tighter`}>
        Testez <span className="text-[#39FF14]">Gratuitement</span> pendant 1 semaine !
      </h3>
      <p className="text-zinc-600 font-medium mb-6 max-w-xl mx-auto text-sm">
        Connectez votre WhatsApp, gérez vos stocks ou facturez vos clients sans aucun risque. L'essai est 100% gratuit, sans engagement. <span className="font-bold italic">(Valable sur tous les packs, sauf Premium).</span>
      </p>
      <a href={getWaLink("Bonjour Onyx, je veux activer mon ESSAI GRATUIT de 1 semaine.")} className="inline-block bg-black text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl">
        Démarrer mon essai
      </a>
    </div>
  );

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none print:hidden`}>
      {/* SECURITY OVERLAY (Anti-Screenshot/Selection) */}
      <style jsx global>{`
        body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        @media print { body { display: none; } }
      `}</style>

      {/* BACKGROUND PATTERN */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none bg-zinc-50"
        style={{ backgroundImage: `url('https://i.ibb.co/chCcXT7p/back-site.png')`, backgroundRepeat: 'repeat', backgroundSize: '400px' }}
      />

      <div className="relative z-10">
        {/* NAV BAR */}
        <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl shadow-sm z-50">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" width={120} height={40} className="h-10 w-auto object-contain" unoptimized />
            <span className={`${spaceGrotesk.className} font-bold tracking-tighter text-xl hidden sm:block`}>ONYX OPS</span>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 font-semibold text-sm uppercase items-center">
            <button onClick={() => navigateTo('home', 'solutions')} className="hover:text-[#39FF14] transition">Solutions</button>
            <button onClick={() => navigateTo('home', 'tarifs')} className="hover:text-[#39FF14] transition">Tarifs</button>
            <button onClick={() => navigateTo('home', 'partenaires')} className="hover:text-[#39FF14] transition">Partenaires</button>
            <button onClick={() => navigateTo('about')} className={`${activeView === 'about' ? 'text-[#39FF14] border-b-2 border-[#39FF14]' : ''} hover:text-[#39FF14] transition py-1`}>À Propos</button>
            <button className="bg-black text-[#39FF14] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition duration-300">
              Accès Hub
            </button>
          </div>

          {/* Mobile Nav Toggle */}
          <div className="flex md:hidden items-center gap-4">
            <button className="bg-black text-[#39FF14] px-4 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest">
              Hub
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 bg-zinc-100 rounded-full text-black">
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 md:hidden animate-in fade-in zoom-in duration-300">
            <button onClick={() => navigateTo('home', 'solutions')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest`}>Solutions</button>
            <button onClick={() => navigateTo('home', 'tarifs')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest`}>Tarifs</button>
            <button onClick={() => navigateTo('home', 'partenaires')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest`}>Partenaires</button>
            <button onClick={() => navigateTo('about')} className={`${spaceGrotesk.className} text-3xl font-bold uppercase tracking-widest ${activeView === 'about' ? 'text-[#39FF14]' : ''}`}>À Propos</button>
            <a href={getWaLink("Bonjour, j'ai besoin d'aide avec mon accès OnyxOps.")} className="mt-8 bg-[#39FF14] text-black px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest shadow-xl">
              Support WhatsApp
            </a>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* VUE : PAGE D'ACCUEIL                                               */}
        {/* ------------------------------------------------------------------ */}
        {activeView === 'home' && (
          <div className="animate-in fade-in duration-500">
            {/* HERO SECTION */}
            <header className="pt-20 pb-12 px-6 text-center max-w-5xl mx-auto">
              <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] mb-8`}>
                <Zap className="w-3 h-3 text-[#39FF14] fill-[#39FF14]" /> DAKAR BUSINESS ECOSYSTEM
              </div>
              <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-bold leading-[1] tracking-tighter mb-6`}>
                DIGITALISEZ VOTRE <br/> <span className="text-[#39FF14] italic">PROPRE EMPIRE.</span>
              </h1>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium mb-10">
                La suite complète d&apos;outils pour les commerces de proximité, les PME et PMI sénégalaises. Gérez vos ventes, stocks, devis et livraisons directement depuis votre téléphone et via Whatsapp. 0 Engagement 0 coûts cachés.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-10">
                <button onClick={() => navigateTo('home', 'partenaires')} className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#39FF14] hover:text-black transition duration-300">
                  <Handshake className="w-5 h-5" /> Devenir Partenaire
                </button>
                <button onClick={() => navigateTo('home', 'solutions')} className="inline-flex items-center gap-2 border-2 border-black text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-black hover:text-[#39FF14] transition duration-300">
                  <Package className="w-5 h-5" /> Découvrir les Solutions
                </button>
              </div>

              {/* Moyens de Paiement Hero */}
              <div className="pt-6 border-t border-zinc-200/60 max-w-md mx-auto">
                <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Paiements Locaux Intégrés</p>
                <PaymentMethods />
              </div>
            </header>

            <div className="px-6">
              <FreeTrialBadge />
            </div>

            {/* SOLUTIONS SECTION - INTERACTIVE */}
            <section id="solutions" className="py-20 px-6 max-w-7xl mx-auto">
              <h2 className={`${spaceGrotesk.className} text-3xl font-bold mb-4 text-center`}>NOS 6 SOLUTIONS <span className="text-[#39FF14]">RADICALES</span></h2>
              <p className="text-center text-zinc-500 font-bold text-xs uppercase tracking-widest mb-12">Cliquez sur un outil pour voir s&apos;il est fait pour vous.</p>
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

            {/* PRICING SECTION */}
            <section id="tarifs" className="py-20 bg-black text-white rounded-[4rem] mx-4 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <h2 className={`${spaceGrotesk.className} text-4xl font-bold mb-4`}>OFFRES <span className="text-[#39FF14]">NO-LIMIT.</span></h2>
                  <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs italic">Pas d&apos;abonnement caché. Que du cashflow.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* SOLO */}
                  <div onClick={() => setSelectedPlan("solo")} className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] hover:scale-105 transition cursor-pointer relative group">
                    <button type="button" onClick={openPlanModal("solo")} className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white text-black flex items-center gap-1.5 hover:bg-zinc-100 transition text-[10px] font-bold uppercase tracking-wider">
                      <Info className="w-3 h-3" /> Infos
                    </button>
                    <p className="text-[10px] font-black tracking-[0.3em] text-zinc-500 mb-4 uppercase">Onyx Solo</p>
                    <div className="text-4xl font-bold mb-6 italic">7.500F <span className="text-xs text-zinc-500 font-normal">/ mois</span></div>
                    <ul className="text-xs space-y-3 mb-10 text-zinc-400">
                      <li className="flex gap-2">✔ 1 Micro-SaaS au choix</li>
                      <li className="flex gap-2">✔ Support WhatsApp 24/7</li>
                    </ul>
                    <a href={getWaLink("Bonjour Onyx, je veux COMMENCER avec l'offre Solo à 7.500F.")} onClick={(e) => e.stopPropagation()} className="block text-center bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-[#39FF14] transition uppercase tracking-tighter">Commencer</a>
                  </div>

                  {/* TRIO */}
                  <div onClick={() => setSelectedPlan("trio")} className="bg-gradient-to-br from-[#39FF14]/20 to-black border-2 border-[#39FF14] p-8 rounded-[3rem] scale-110 shadow-[0_0_50px_rgba(57,255,20,0.2)] cursor-pointer relative">
                    <button type="button" onClick={openPlanModal("trio")} className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white text-black flex items-center gap-1.5 hover:bg-zinc-100 transition text-[10px] font-bold uppercase tracking-wider">
                      <Info className="w-3 h-3" /> Infos
                    </button>
                    <p className="text-[10px] font-black tracking-[0.3em] text-[#39FF14] mb-4 uppercase">Pack Trio</p>
                    <div className="text-4xl font-bold mb-6 italic text-white">17.500F <span className="text-xs text-zinc-500 font-normal">/ mois</span></div>
                    <ul className="text-xs space-y-3 mb-10 text-zinc-300">
                      <li className="flex gap-2">✔ 3 Micro-SaaS Connectés</li>
                      <li className="flex gap-2">✔ Formation Gérant incluse</li>
                      <li className="flex gap-2">✔ Dashboard de revenus</li>
                    </ul>
                    <a href={getWaLink("Bonjour Onyx, je veux CHOISIR CE PACK Trio à 17.500F.")} onClick={(e) => e.stopPropagation()} className="block text-center bg-[#39FF14] text-black py-4 rounded-2xl font-black text-sm hover:scale-105 transition uppercase tracking-tighter">Choisir ce pack</a>
                  </div>

                  {/* FULL */}
                  <div onClick={() => setSelectedPlan("full")} className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] hover:scale-105 transition cursor-pointer relative">
                    <button type="button" onClick={openPlanModal("full")} className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white text-black flex items-center gap-1.5 hover:bg-zinc-100 transition text-[10px] font-bold uppercase tracking-wider">
                      <Info className="w-3 h-3" /> Infos
                    </button>
                    <p className="text-[10px] font-black tracking-[0.3em] text-zinc-500 mb-4 uppercase">Pack Full</p>
                    <div className="text-4xl font-bold mb-6 italic">30.000F <span className="text-xs text-zinc-500 font-normal">/ mois</span></div>
                    <ul className="text-xs space-y-3 mb-10 text-zinc-400">
                      <li className="flex gap-2">✔ Les 6 Solutions Onyx</li>
                      <li className="flex gap-2">✔ Multi-boutiques</li>
                      <li className="flex gap-2">✔ Rapports PDF Automatiques</li>
                    </ul>
                    <a href={getWaLink("Bonjour Onyx, je veux TOUT CHOISIR avec le pack Full à 30.000F.")} onClick={(e) => e.stopPropagation()} className="block text-center bg-white text-black py-4 rounded-2xl font-black text-sm hover:bg-[#39FF14] transition uppercase tracking-tighter">Tout choisir</a>
                  </div>

                  {/* PREMIUM */}
                  <div onClick={() => setSelectedPlan("premium")} className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] hover:scale-105 transition cursor-pointer relative">
                    <button type="button" onClick={openPlanModal("premium")} className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-white text-black flex items-center gap-1.5 hover:bg-zinc-100 transition text-[10px] font-bold uppercase tracking-wider">
                      <Info className="w-3 h-3" /> Infos
                    </button>
                    <p className="text-[10px] font-black tracking-[0.3em] text-zinc-500 mb-4 uppercase">Onyx Premium</p>
                    <div className="text-4xl font-bold mb-6 italic text-red-500">75.000F <span className="text-xs text-zinc-500 font-normal">/ mois</span></div>
                    <ul className="text-xs space-y-3 mb-10 text-zinc-400">
                      <li className="flex gap-2">✔ Studio Créatif IA</li>
                      <li className="flex gap-2">✔ CRM Expert + Blog</li>
                      <li className="flex gap-2">✔ Account Manager Dédié</li>
                    </ul>
                    <a href={getWaLink("Bonjour Onyx, je souhaite CONTACTER l'équipe pour l'offre Premium à 75.000F.")} onClick={(e) => e.stopPropagation()} className="block text-center border-2 border-white/20 text-white py-4 rounded-2xl font-black text-sm hover:bg-white hover:text-black transition uppercase tracking-tighter">Contacter</a>
                  </div>
                </div>
              </div>
            </section>

            {/* TUNNEL : QUELLE OFFRE CHOISIR */}
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
                      { id: 'Premium', label: 'Business à Grande Échelle' }
                    ].map(p => (
                      <button 
                        key={p.id}
                        onClick={() => {
                          if (p.id === 'Premium' || p.id === 'Restaurant') {
                            setActiveProfiles([p.id]); 
                            setPremiumStep(p.id === 'Premium' ? 1 : 0);
                            setPremiumScore(0);
                          } else {
                            let newP = activeProfiles.filter(x => x !== 'Premium' && x !== 'Restaurant');
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

                  {/* RÉSULTATS DYNAMIQUES */}
                  <div className="bg-white p-8 rounded-[2.5rem] shadow-lg border border-zinc-100 min-h-[250px] flex flex-col justify-center">
                    {activeProfiles.length === 0 && (
                      <div className="text-center text-zinc-400 font-bold text-sm uppercase italic">En attente de votre sélection...</div>
                    )}

                    {/* LOGIQUE PREMIUM (QUESTIONS) */}
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
                          <button onClick={() => setPremiumStep(s => s + 1)} className="flex-1 bg-zinc-100 text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-zinc-200 transition">Pas pour l&apos;instant</button>
                        </div>
                      </div>
                    )}

                    {/* RÉSULTAT PREMIUM */}
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

                    {/* RÉSULTATS CLASSIQUES */}
                    {!activeProfiles.includes('Premium') && activeProfiles.length > 0 && (
                      <div className="animate-in zoom-in duration-300">
                        <h4 className="font-black text-2xl mb-2 flex items-center gap-2">
                          <CheckCircle2 className="text-[#39FF14]"/> 
                          {activeProfiles.includes('Restaurant') ? 'Pack Full (30.000F)' : 
                           activeProfiles.length === 2 ? 'Pack Trio (17.500F)' : 
                           activeProfiles.includes('Boutique') ? 'Pack Trio (17.500F)' : 
                           'Onyx Solo : OnyxCatalog (7.500F)'}
                        </h4>
                        <p className="text-sm text-zinc-600 mb-6 font-medium leading-relaxed">
                          {activeProfiles.includes('Restaurant') ? "Il vous faut la totale. QR Menu sur les tables, Tiak pour vos livraisons, et Stock pour les ingrédients. Le Pack Full est votre directeur des opérations." : 
                           activeProfiles.length === 2 ? "Vous êtes sur tous les fronts. Le Pack Trio lie votre e-commerce WhatsApp à votre gestion de stock physique. Vendez en ligne, déstockez en boutique." : 
                           activeProfiles.includes('Boutique') ? "Sécurisez vos caisses. Le Pack Trio avec OnyxStock et OnyxDevis vous garantit zéro perte d'inventaire et des factures pro pour vos clients." : 
                           "Ne payez que pour ce dont vous avez besoin. OnyxCatalog transforme votre WhatsApp en machine à vendre. Lien direct, panier, commande. Simple et radical."}
                        </p>
                        <a href={getWaLink(`Recommandation : Je prends l'offre ${activeProfiles.includes('Restaurant') ? 'Full (30k)' : activeProfiles.length === 2 || activeProfiles.includes('Boutique') ? 'Trio (17.5k)' : 'Solo Catalog (7.5k)'}.`)} className="block text-center bg-black text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl">
                          Commander cette solution (WhatsApp)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION COMPARATIF - WAKH DEUG (SPÉCIAL SÉNÉGAL) */}
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
                {/* Les Autres */}
                <div className="bg-zinc-50 border-2 border-zinc-200 p-8 md:p-12 rounded-[3rem] opacity-80">
                  <h3 className={`${spaceGrotesk.className} text-2xl font-bold text-zinc-400 mb-8 uppercase text-center`}>Les Logiciels Classiques</h3>
                  <ul className="space-y-6">
                    {[
                      { text: "Abonnements en Euros / Dollars très chers", icon: <X className="text-red-500 w-5 h-5" /> },
                      { text: "Usines à gaz conçues pour l'Europe", icon: <X className="text-red-500 w-5 h-5" /> },
                      { text: "Nécessite souvent un ordinateur fixe", icon: <X className="text-red-500 w-5 h-5" /> },
                      { text: "Assistance par email (réponse en 48h)", icon: <X className="text-red-500 w-5 h-5" /> },
                      { text: "Aucune intégration avec nos Tiak-Tiak", icon: <X className="text-red-500 w-5 h-5" /> }
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm font-semibold text-zinc-500">
                        <div className="mt-0.5 bg-red-100 p-1 rounded-full flex-shrink-0">{item.icon}</div>
                        <span>{item.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* OnyxOps */}
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
                      { text: "Outils 100% pensés pour WhatsApp et le Sénégal", icon: <CheckCircle2 className="text-black w-5 h-5" /> },
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
                    <p className="text-xs text-zinc-400 font-medium italic mb-4">&quot;Arrêtez de payer plus pour des outils qui en font moins.&quot;</p>
                    <button onClick={() => navigateTo('home', 'tarifs')} className="inline-block bg-[#39FF14] text-black px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition">Voir nos tarifs</button>
                  </div>
                </div>
              </div>
            </section>

            {/* SIMULATEUR & PARTENAIRES */}
            <section id="partenaires" className="py-24 px-6 max-w-7xl mx-auto">
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

                {/* SIMULATEUR INTERACTIF */}
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
                            value={packCounts[p.id as keyof typeof packCounts]}
                            onChange={(e) => setPackCounts((prev) => ({ ...prev, [p.id]: parseInt(e.target.value, 10) }))}
                            className="flex-1 h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer accent-[#39FF14]"
                          />
                          <span className="text-[#39FF14] bg-black px-3 py-1 rounded-full text-xs font-bold w-12 text-center">{packCounts[p.id as keyof typeof packCounts]}</span>
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

            {/* INTÉGRATION ESSAI GRATUIT SUR PAGE A PROPOS */}
            <FreeTrialBadge />

            <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
              {/* Image Fondatrice Placeholder */}
              <div className="relative aspect-square md:aspect-[4/5] bg-zinc-100 rounded-[3rem] overflow-hidden shadow-xl border border-zinc-200 group">
                <div className="absolute inset-0 flex items-center justify-center text-zinc-300 font-bold text-xl uppercase tracking-widest">
                  Photo Maimouna
                </div>
                {/* <Image src="/founder-maimouna.jpg" alt="Maimouna Traoré" fill className="object-cover" /> */}
                
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-md p-5 rounded-3xl border-2 border-[#39FF14] shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <p className="font-black text-sm uppercase tracking-widest text-black mb-1">Maimouna Traoré</p>
                  <p className="text-xs font-bold text-zinc-500 mb-3">Digital Marketing Manager</p>
                  <p className="text-sm font-bold text-black italic border-l-4 border-[#39FF14] pl-3">
                    &quot;Parce que les Vues ne paient pas les factures.&quot;
                  </p>
                </div>
              </div>

              {/* Texte Méthodologie & Contact */}
              <div>
                <h3 className={`${spaceGrotesk.className} text-3xl font-bold mb-6 uppercase leading-tight`}>
                  L&apos;Efficacité avant <br/>l&apos;Esthétique.
                </h3>
                <div className="space-y-4 text-zinc-600 font-medium mb-10 leading-relaxed">
                  <p>Trop d&apos;entreprises au Sénégal se concentrent sur les "likes" et les belles photos sur Instagram, en oubliant l&apos;essentiel : <span className="text-black font-bold">la conversion et la gestion du cashflow.</span></p>
                  <p className="p-4 bg-zinc-50 border-l-4 border-black text-sm italic rounded-r-2xl">
                    "L'idée d'OnyxOps est née d'un constat brutal sur le terrain : nos commerçants jonglent entre des cahiers raturés, des commandes perdues sur WhatsApp et des livreurs Tiak-Tiak injoignables. Il nous fallait une solution unifiée, non pas pensée pour l'Europe, mais développée par des locaux, pour les réalités locales."
                  </p>
                  <p>Chez OnyxOps, nous implémentons la méthodologie <span className="text-black font-bold">RevOps (Revenue Operations)</span> adaptée aux réalités africaines. Nous alignons vos ventes, votre marketing et votre service client via des outils technologiques simples.</p>
                </div>

                <div className="bg-zinc-50 p-6 md:p-8 rounded-[2.5rem] border border-zinc-200 space-y-4 mb-10">
                  <a href="https://maps.google.com/?q=Place+de+l'Indépendance,+Dakar,+Senegal" target="_blank" rel="noreferrer" className="flex items-start gap-4 group p-2 rounded-2xl hover:bg-white hover:shadow-md transition">
                    <div className="bg-black text-[#39FF14] p-3 rounded-full group-hover:scale-110 transition-transform"><MapPin className="w-5 h-5" /></div>
                    <div>
                      <p className="font-black text-xs uppercase tracking-widest text-zinc-500 mb-1">Adresse</p>
                      <p className="font-bold text-sm text-black">Dakar Centre Ville</p>
                      <p className="text-xs font-medium text-zinc-500">Près de la place de l&apos;indépendance</p>
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

            {/* L'ÉQUIPE SECTION */}
            <div className="py-16 border-t border-zinc-100">
              <div className="text-center mb-12">
                <h3 className={`${spaceGrotesk.className} text-3xl font-bold uppercase`}>La Machine Derrière <span className="text-[#39FF14]">Onyx</span></h3>
                <p className="text-zinc-500 text-sm font-bold mt-2">Ceux qui transforment le code en cashflow.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {[
                  { name: "Amadou Ndiaye", role: "Lead Dev Fullstack", desc: "L'architecte réseau. Il s'assure que vos SaaS ne plantent jamais." },
                  { name: "Fatou Diop", role: "Head of Customer Success", desc: "La voix de la sagesse. Elle accompagne chaque gérant vers la rentabilité." },
                  { name: "Cheikh Fall", role: "Product Designer UX/UI", desc: "L'œil du design. Il rend chaque interface aussi simple qu'un message WhatsApp." }
                ].map((member, idx) => (
                  <div key={idx} className="bg-zinc-50 rounded-[2rem] p-8 text-center border border-zinc-200 hover:border-[#39FF14] transition group">
                    <div className="w-20 h-20 bg-black text-[#39FF14] rounded-full mx-auto mb-4 flex items-center justify-center font-black text-2xl uppercase tracking-tighter group-hover:scale-110 transition-transform">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <h4 className="font-black text-lg mb-1">{member.name}</h4>
                    <p className="text-[10px] font-bold text-[#39FF14] bg-black inline-block px-3 py-1 rounded-full uppercase tracking-widest mb-4">{member.role}</p>
                    <p className="text-sm text-zinc-500 font-medium">{member.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* MOYENS DE PAIEMENT ABOUT */}
            <div className="py-10 text-center">
              <p className="font-bold text-sm text-zinc-400 uppercase tracking-widest mb-6">Nous acceptons les paiements via</p>
              <PaymentMethods />
            </div>

            {/* Support Client Block */}
            <div className="bg-black text-white p-10 md:p-14 rounded-[3rem] text-center max-w-4xl mx-auto shadow-2xl relative overflow-hidden mt-12">
              <div className="absolute top-0 right-0 p-8 opacity-10"><LifeBuoy className="w-32 h-32" /></div>
              <LifeBuoy className="w-10 h-10 text-[#39FF14] mx-auto mb-6" />
              <h3 className={`${spaceGrotesk.className} text-3xl font-bold mb-4 uppercase`}>Besoin d&apos;assistance technique ?</h3>
              <p className="text-zinc-400 font-medium mb-8 max-w-lg mx-auto">
                Vous rencontrez un bug ou avez besoin d&apos;aide sur l&apos;un de nos SaaS ? Notre équipe de support technique est prête à intervenir.
              </p>
              <button onClick={() => setShowIncidentModal(true)} className="inline-block bg-[#39FF14] text-black px-10 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition shadow-[0_15px_40px_rgba(57,255,20,0.3)]">
                Ouvrir un ticket incident
              </button>
            </div>

          </div>
        )}

        {/* FOOTER GENERAL */}
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

        {/* ------------------------------------------------------------------ */}
        {/* MODALES PLACÉES À LA FIN POUR ÉVITER LES PROBLÈMES DE Z-INDEX      */}
        {/* ------------------------------------------------------------------ */}
        
        {/* 1. MODALE DETAILS DU PACK */}
        {selectedPlan && PLAN_DETAILS[selectedPlan] && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelectedPlan(null)}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white text-black rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
              <button type="button" onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-zinc-100 text-black flex items-center justify-center hover:bg-black hover:text-[#39FF14] transition">
                <X className="w-5 h-5" />
              </button>
              <div className="bg-black text-[#39FF14] inline-block px-4 py-1.5 rounded-full text-[10px] font-black mb-6 uppercase tracking-widest shadow-lg">Détails de l&apos;offre</div>
              <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-3`}>{PLAN_DETAILS[selectedPlan].title}</h3>
              <p className="text-sm text-zinc-600 mb-6 leading-relaxed font-medium">{PLAN_DETAILS[selectedPlan].desc}</p>
              
              <div className="space-y-3 mb-6 bg-zinc-50 p-5 rounded-2xl border border-zinc-100">
                <p className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2 mb-2"><CheckCircle2 className="w-4 h-4 text-[#39FF14]"/> Inclus dans ce pack :</p>
                {PLAN_DETAILS[selectedPlan].benefits.map((b, i) => (
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

              <a href={getWaLink(`Salut Onyx, je veux verrouiller le pack ${PLAN_DETAILS[selectedPlan].title}.`)} className="block text-center bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs tracking-widest shadow-xl hover:scale-105 transition">
                Commander sur WhatsApp
              </a>
            </div>
          </div>
        )}

        {/* 2. MODALE "CE SAAS EST-IL FAIT POUR MOI ?" */}
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
                  <p className="font-black uppercase text-xs tracking-widest text-zinc-500 mb-6">Quel est votre secteur d&apos;activité ?</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    {['Prêt-à-porter / Beauté', 'Restauration / Food', 'Services / Freelance', 'Grossiste / Quincaillerie'].map(m => (
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
                      {selectedSaaS.id === 'Onyx Menu' && saasMetier.includes('Restauration') ? "C'est l'outil PARFAIT pour vous. Fini les menus papiers sales et les erreurs de commande en salle." :
                       selectedSaaS.id === 'Onyx Catalog' && saasMetier.includes('Prêt-à-porter') ? "Indispensable ! Vos clients Instagram vont pouvoir acheter directement sans attendre vos réponses WhatsApp." :
                       selectedSaaS.id === 'Onyx Stock' && saasMetier.includes('Grossiste') ? "Vital pour votre business. Suivez vos entrées/sorties par scan et évitez les vols d'inventaire." :
                       `Oui, ${selectedSaaS.id} est très utile en ${saasMetier}. Mais attention, couplé à d'autres outils dans le Pack Trio, il révèlera tout son potentiel de rentabilité.`}
                    </p>
                  </div>
                  <a href={getWaLink(`Salut, je suis dans le secteur (${saasMetier}) et je veux l'outil ${selectedSaaS.id} (Offre Solo 7.5k).`)} className="block text-center bg-black text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl hover:bg-[#39FF14] hover:text-black transition">
                    Activer {selectedSaaS.id} maintenant
                  </a>
                  <button onClick={() => setSaasMetier("")} className="mt-4 w-full text-center text-xs font-bold text-zinc-400 hover:text-black underline underline-offset-4">Refaire le test avec un autre métier</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. MODALE FORMULAIRE INCIDENT */}
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
                  Vous devez être connecté(e) à votre espace client OnyxOps pour soumettre et suivre ce formulaire d&apos;incident de manière sécurisée.
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
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-1">Description du problème</label>
                  <textarea rows={3} className="w-full bg-zinc-100 border-none p-4 rounded-xl text-sm font-medium outline-none" placeholder="Détaillez le problème rencontré..."></textarea>
                </div>
              </div>

              <button disabled className="w-full bg-zinc-200 text-zinc-400 py-4 rounded-xl font-black uppercase text-xs tracking-widest cursor-not-allowed">
                Envoyer le ticket
              </button>

              <p className="text-center mt-4">
                <a href={getWaLink("Bonjour le support OnyxOps, j'ai une urgence technique et je n'arrive pas à me connecter.")} className="text-xs font-bold text-black underline underline-offset-4 hover:text-[#39FF14] transition">
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
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, ShieldCheck, TrendingUp, Users, Target, 
  Zap, CheckCircle2, AlertCircle, Lock, Handshake, Package, Info, X,
  MapPin, Clock, Mail, LifeBuoy, Menu, ChevronRight, Star, MessageSquare, Flame, PlayCircle, Share2, LayoutDashboard, Link, Copy, Download, Wallet, Check, LogOut, Gift
} from "lucide-react";

// TYPE SÉCURISÉ
type PlanKey = "solo" | "trio" | "full" | "premium";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

const PLAN_DETAILS: Record<PlanKey, { title: string; price: number; desc: string; benefits: string[]; upsell: string; alternative: string; reason: string; savings: string }> = {
  solo: {
    title: "Onyx Solo", price: 7500, desc: "L'essentiel pour vendre.", benefits: ["Catalogue WhatsApp", "Devis PDF", "1 Micro-SaaS"],
    upsell: "Pack Trio", alternative: "trio", reason: "Si vous livrez vos produits, le Solo ne suit pas vos livreurs.", savings: "10.000F"
  },
  trio: {
    title: "Pack Trio", price: 17500, desc: "Vente + Stock + Tiak.", benefits: ["Suivi livreurs", "Gestion stock scan", "3 Micro-SaaS"],
    upsell: "Pack Full", alternative: "full", reason: "Le Trio gère vos colis, mais pas vos employés.", savings: "12.500F"
  },
  full: {
    title: "Pack Full", price: 30000, desc: "L'écosystème 360°.", benefits: ["Onyx Staff (RH)", "Onyx Resto/Booking", "Les 6 SaaS"],
    upsell: "Onyx Premium", alternative: "premium", reason: "Pour dominer, l'IA est obligatoire.", savings: "45.000F"
  },
  premium: {
    title: "Onyx Premium", price: 75000, desc: "IA + Stratégie RevOps.", benefits: ["Studio Créatif IA", "CRM Automatisé", "Conseiller Dédié"],
    upsell: "Offre Trimestre", alternative: "premium", reason: "Prenez l'offre Sérénité.", savings: "75.000F"
  }
};

const SOLUTIONS = [
  { id: "Onyx Vente", icon: Smartphone, pain: "Photos WhatsApp interminables.", solution: "Catalogue digital & Devis PDF pro." },
  { id: "Onyx Tiak", icon: Truck, pain: "Livreurs injoignables, cash perdu.", solution: "Tracking temps réel & encaissement." },
  { id: "Onyx Stock", icon: Box, pain: "Vols et ruptures d'inventaire.", solution: "Gestion par scan & alertes." },
  { id: "Onyx Menu", icon: Utensils, pain: "Menus chers et sales.", solution: "QR Menu interactif." },
  { id: "Onyx Booking", icon: Calendar, pain: "No-shows (RDV manqués).", solution: "Acompte obligatoire." },
  { id: "Onyx Staff", icon: Users, pain: "Avances Tabaski & pointages faux.", solution: "Pointage GPS & Paie QR Code." },
];

const RANDOM_SCENARIOS = [
  { avant: { phone: "+221 77 000 00 00", text: "C'est quoi l'avance Tabaski de Modou déjà ? Et il a pointé hier ?", issue: "Pertes d'argent" }, apres: { title: "Ressources Humaines", text: "Modou S. a pointé via GPS.", sub: "Avance Tabaski déduite auto." } },
  { avant: { phone: "+221 76 111 11 11", text: "Tu as la taille 42 ? Tu peux me refaire le devis j'ai perdu le papier !", issue: "Temps perdu" }, apres: { title: "Vente & Stock", text: "Devis #1042 payé en ligne.", sub: "Lien de suivi envoyé au client." } }
];

const ARTICLES = [
  { id: 1, category: "Social Selling", title: "Doubler vos ventes WhatsApp en 2026", content: "Au Sénégal, 90% des ventes se concluent sur WhatsApp. Onyx Vente transforme vos photos en un catalogue pro qui encaisse via Wave.", video: "https://youtube.com/..." },
  { id: 2, category: "Ressources Humaines", title: "Gérer les avances Tabaski sans stress", content: "Onyx Staff automatise les acomptes et fiches de paie par QR code. Indispensable pour les PME dakarois.", video: "https://youtube.com/..." }
];

export default function OnyxOpsElite() {
  const [activeView, setActiveView] = useState<'home' | 'about' | 'blog' | 'dashboard'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [packCounts, setPackCounts] = useState({ solo: 0, trio: 0, full: 0, premium: 0 });
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  const [eligibilityModal, setEligibilityModal] = useState<PlanKey | null>(null);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [partnerStep, setPartnerStep] = useState<'landing' | 'form' | 'success' | 'dashboard'>('landing');
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);
  const [saasMetier, setSaasMetier] = useState("");
  const [customMetier, setCustomMetier] = useState("");

  const waNumber = "221768102039";
  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  // EXIT INTENT
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 0 && !sessionStorage.getItem('exitShown')) {
        setShowExitPopup(true);
        sessionStorage.setItem('exitShown', 'true');
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []);

  // SCENARIO TIMER
  useEffect(() => {
    const interval = setInterval(() => setScenarioIndex(prev => (prev + 1) % RANDOM_SCENARIOS.length), 4000);
    return () => clearInterval(interval);
  }, []);

  const openAuthModal = (mode: 'login' | 'signup') => { setActiveView('dashboard'); setPartnerStep('form'); };
  const openPlanModal = (plan: PlanKey) => (e: React.MouseEvent) => { e.stopPropagation(); setSelectedPlan(plan); };

  const navigateTo = (view: 'home' | 'about' | 'blog' | 'dashboard', scrollId?: string) => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    if (scrollId) {
      setTimeout(() => { document.getElementById(scrollId)?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    } else {
      window.scrollTo(0,0);
    }
  };

  // CALCULS SIMULATEUR
  const m1Gain = packCounts.solo * 7500 * 0.3 + packCounts.trio * 17500 * 0.3 + packCounts.full * 30000 * 0.3 + packCounts.premium * 75000 * 0.3;
  const recurringGain = packCounts.solo * 7500 * 0.1 + packCounts.trio * 17500 * 0.1 + packCounts.full * 30000 * 0.1 + packCounts.premium * 75000 * 0.1;

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black pt-20`}>
      {/* HEADER PERSISTANT */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 z-[100] px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
          <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx" width={150} height={50} className="h-10 w-auto" unoptimized />
          <span className={`${spaceGrotesk.className} font-bold text-xl tracking-tighter`}>ONYX OPS</span>
        </div>
        <div className="hidden lg:flex gap-8 font-black uppercase text-[10px] tracking-widest">
          <button onClick={() => navigateTo('home', 'solutions')} className="hover:text-[#39FF14]">Solutions</button>
          <button onClick={() => navigateTo('home', 'tarifs')} className="hover:text-[#39FF14]">Tarifs</button>
          <button onClick={() => navigateTo('dashboard')} className="hover:text-[#39FF14]">Ambassadeurs</button>
          <button onClick={() => navigateTo('blog')} className="hover:text-[#39FF14]">Blog</button>
          <button onClick={() => openAuthModal('login')} className="bg-black text-[#39FF14] px-6 py-2 rounded-full">Accès Hub</button>
        </div>
        <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
      </nav>

      {/* VUE ACCUEIL */}
      {activeView === 'home' && (
        <div className="animate-in fade-in duration-500">
          <header className="py-20 text-center px-6">
            <div className="bg-black text-white px-4 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-2 mb-8 uppercase tracking-widest">
              <Zap className="w-3 h-3 text-[#39FF14]" /> Dakar Business Infrastructure
            </div>
            <h1 className={`${spaceGrotesk.className} text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8`}>Digitalisez votre <br/><span className="text-[#39FF14] italic">Propre Empire.</span></h1>
            <p className="max-w-2xl mx-auto text-zinc-500 font-medium text-lg mb-12">La suite d'outils n°1 au Sénégal pour éradiquer le bricolage. Tout se gère sur WhatsApp, Wave et Orange Money.</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={() => navigateTo('dashboard')} className="bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-xl">Devenir Partenaire</button>
              <button onClick={() => navigateTo('home', 'tarifs')} className="border-2 border-black px-10 py-5 rounded-2xl font-black uppercase text-xs">Essai Gratuit 7j</button>
            </div>
            <div className="mt-12 opacity-50 flex justify-center gap-8 grayscale">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQY23m5wibqb2iC0swZaN4SRbdyyBqU8Ga6_w&s" alt="Wave" className="h-6" />
              <img src="https://www.rapyd.net/wp-content/uploads/2025/04/Orange-Money-logo-500x336-1.png" alt="OM" className="h-6" />
            </div>
          </header>

          <FreeTrialBadge openAuth={() => openAuthModal('signup')} />

          {/* AVANT / APRES ALÉATOIRE */}
          <section className="py-20 px-6 max-w-6xl mx-auto">
             <div className="grid md:grid-cols-2 gap-8 h-[400px]">
                <div className="bg-red-50 p-10 rounded-[3rem] border border-red-100 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase">Le Bricolage</div>
                  <div className="h-full flex flex-col justify-center animate-in slide-in-from-left duration-500" key={scenarioIndex}>
                    <p className="text-red-500 font-bold text-xs mb-2">{RANDOM_SCENARIOS[scenarioIndex].avant.phone}</p>
                    <p className="text-zinc-700 font-medium italic">"{RANDOM_SCENARIOS[scenarioIndex].avant.text}"</p>
                    <p className="mt-6 text-[10px] font-black uppercase text-red-400">Impact : {RANDOM_SCENARIOS[scenarioIndex].avant.issue}</p>
                  </div>
                </div>
                <div className="bg-black p-10 rounded-[3rem] border border-[#39FF14]/30 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase">OnyxOps Elite</div>
                  <div className="h-full flex flex-col justify-center animate-in slide-in-from-right duration-500" key={`apres-${scenarioIndex}`}>
                    <h4 className="text-[#39FF14] font-black uppercase text-xs mb-2">{RANDOM_SCENARIOS[scenarioIndex].apres.title}</h4>
                    <p className="text-white font-bold text-lg leading-tight">{RANDOM_SCENARIOS[scenarioIndex].apres.text}</p>
                    <p className="text-zinc-500 text-sm mt-2">{RANDOM_SCENARIOS[scenarioIndex].apres.sub}</p>
                  </div>
                </div>
             </div>
          </section>

          {/* SOLUTIONS */}
          <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {SOLUTIONS.map(s => (
              <div key={s.id} onClick={() => setSelectedSaaS(s)} className="bg-zinc-50 p-10 rounded-[3rem] hover:border-[#39FF14] border border-transparent transition-all cursor-pointer group shadow-sm">
                <div className="bg-black text-[#39FF14] w-12 h-12 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition"><s.icon /></div>
                <h3 className="text-2xl font-black uppercase italic mb-4">{s.id}</h3>
                <div className="bg-white p-4 rounded-2xl border-l-4 border-red-500 mb-4"><p className="text-[10px] font-black uppercase text-red-500">Douleur</p><p className="text-xs font-bold text-zinc-600">{s.pain}</p></div>
                <div className="bg-[#39FF14]/5 p-4 rounded-2xl border-l-4 border-[#39FF14]"><p className="text-[10px] font-black uppercase text-[#39FF14]">Solution</p><p className="text-xs font-bold text-zinc-800">{s.solution}</p></div>
              </div>
            ))}
          </section>

          {/* TARIFS AVEC ANALYSE */}
          <section id="tarifs" className="py-24 bg-black text-white rounded-[4rem] mx-4 px-6">
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
              {(Object.keys(PLAN_DETAILS) as PlanKey[]).map(key => (
                <div key={key} className="bg-zinc-900/50 p-8 rounded-[3rem] border border-white/10 flex flex-col group relative">
                  <button onClick={() => setEligibilityModal(key)} className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-[#39FF14] hover:text-black transition"><Info className="w-4 h-4"/></button>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{PLAN_DETAILS[key].title}</p>
                  <div className="flex items-center gap-1 mb-4"><Star className="w-3 h-3 text-[#39FF14] fill-[#39FF14]"/><Star className="w-3 h-3 text-[#39FF14] fill-[#39FF14]"/><Star className="w-3 h-3 text-[#39FF14] fill-[#39FF14]"/><Star className="w-3 h-3 text-[#39FF14] fill-[#39FF14]"/><Star className="w-3 h-3 text-[#39FF14] fill-[#39FF14]"/></div>
                  <h3 className="text-3xl font-black italic mb-8">{PLAN_DETAILS[key].price.toLocaleString()}F<span className="text-xs text-zinc-500 font-normal">/m</span></h3>
                  <ul className="space-y-3 mb-10 flex-1">
                    {PLAN_DETAILS[key].benefits.map(b => <li key={b} className="text-xs font-bold flex items-center gap-2">✔ {b}</li>)}
                  </ul>
                  <button onClick={() => setEligibilityModal(key)} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-[10px] shadow-lg">Est-ce pour moi ?</button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* DASHBOARD AMBASSADEUR */}
      {activeView === 'dashboard' && (
        <div className="py-20 px-6 max-w-6xl mx-auto animate-in fade-in duration-500">
           {partnerStep !== 'dashboard' ? (
             <div className="text-center">
                <h1 className={`${spaceGrotesk.className} text-5xl md:text-6xl font-black uppercase mb-12`}>Rejoignez <span className="text-[#39FF14]">l'Élite</span></h1>
                <div className="grid md:grid-cols-2 gap-12 mb-12 items-center">
                   <div className="bg-zinc-50 p-10 rounded-[3rem] border-2 border-zinc-200">
                      <h3 className="font-black uppercase mb-6">Simulateur de Rente</h3>
                      <div className="space-y-6 mb-10">
                        {Object.keys(PLAN_DETAILS).map(k => (
                          <div key={k} className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase">{k}</span>
                            <input type="range" min="0" max="30" value={packCounts[k as PlanKey]} onChange={e => setPackCounts({...packCounts, [k]: parseInt(e.target.value)})} className="flex-1 mx-4 accent-black" />
                            <span className="bg-black text-[#39FF14] px-3 py-1 rounded-lg text-xs font-black">{packCounts[k as PlanKey]}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-black text-white p-6 rounded-2xl text-center">
                        <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Gain Immédiat (M1)</p>
                        <p className="text-3xl font-black text-[#39FF14]">{m1Gain.toLocaleString()}F</p>
                      </div>
                   </div>
                   <div className="text-left space-y-6">
                      <div className="flex gap-4 items-start"><CheckCircle2 className="text-[#39FF14]"/><p className="text-sm font-bold">30% Cash Immédiat : L'argent tombe dès la signature du client.</p></div>
                      <div className="flex gap-4 items-start"><CheckCircle2 className="text-[#39FF14]"/><p className="text-sm font-bold">10% Récurrent : Tant que le client paie, vous gagnez.</p></div>
                      <div className="flex gap-4 items-start"><CheckCircle2 className="text-[#39FF14]"/><p className="text-sm font-bold">5% Réseau : Recrutez d'autres lions et gagnez sur leurs ventes.</p></div>
                      <button onClick={() => setPartnerStep('dashboard')} className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black uppercase text-sm shadow-xl mt-4">Postuler au Programme</button>
                   </div>
                </div>
             </div>
           ) : (
             <div>
                <div className="flex justify-between items-center mb-12">
                  <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase`}>Mon Hub <span className="text-[#39FF14]">Ambassadeur</span></h2>
                  <button onClick={() => setPartnerStep('landing')} className="flex items-center gap-2 text-red-500 font-black uppercase text-xs"><LogOut className="w-4 h-4"/> Déconnexion</button>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                   <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl">
                      <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Solde Cash (30%)</p>
                      <p className="text-4xl font-black text-[#39FF14]">84.000F</p>
                      <button className="mt-4 bg-[#39FF14] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2"><Wallet className="w-4 h-4"/> Retrait Wave</button>
                   </div>
                   <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-[2rem]">
                      <p className="text-[10px] font-black text-zinc-400 uppercase mb-2">MRR Récurrent (10%)</p>
                      <p className="text-4xl font-black">22.500F <span className="text-xs text-zinc-400 not-italic">/m</span></p>
                   </div>
                   <div className="bg-[#39FF14]/10 border-2 border-[#39FF14] p-8 rounded-[2rem]">
                      <p className="text-[10px] font-black text-[#39FF14] uppercase mb-2">Bonus Réseau (5%)</p>
                      <p className="text-4xl font-black">4.500F</p>
                   </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                   <div className="bg-white border-2 border-black p-8 rounded-[3rem]">
                      <h3 className="font-black uppercase mb-6 flex items-center gap-2"><Link className="w-4 h-4 text-[#39FF14]"/> Mes Liens de Prospection</h3>
                      <div className="space-y-4">
                         <div className="bg-zinc-100 p-4 rounded-xl flex justify-between items-center"><span className="text-xs font-bold truncate">onyxops.com/ref/v/moussa_221</span><Copy className="w-4 h-4 cursor-pointer"/></div>
                         <a href={getWaLink("J'ai découvert une solution pour digitaliser ton stock et tes livreurs sur WhatsApp. Regarde ici : onyxops.com/ref/v/moussa_221")} target="_blank" className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs flex justify-center items-center gap-2"><Share2 className="w-4 h-4"/> Partager en Statut</a>
                      </div>
                   </div>
                   <div className="bg-zinc-900 text-white p-8 rounded-[3rem]">
                      <h3 className="font-black uppercase mb-6 text-[#39FF14]">Le Kit "Coup de Grâce"</h3>
                      <p className="text-sm font-medium text-zinc-400 mb-6">Après 3 mois d'activité, nous envoyons un autocollant QR physique à vos clients. Une fois collé sur leur comptoir, ils ne résilient plus jamais.</p>
                      <button className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase text-xs">Suivre mes envois</button>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* BOT WHATSAPP */}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end">
        {isBotOpen && (
          <div className="bg-white rounded-[2rem] shadow-2xl border border-zinc-200 p-6 mb-4 w-[300px] animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4"><span className="font-black text-[10px] uppercase tracking-widest text-[#39FF14] bg-black px-3 py-1 rounded-full">Bot OnyxOps</span><button onClick={() => setIsBotOpen(false)}><X className="w-4 h-4"/></button></div>
            <p className="text-sm font-medium text-zinc-600 mb-4">Besoin d'aide ? Je connais tout sur Onyx.</p>
            <div className="space-y-2">
              <a href={getWaLink("C'est quoi exactement Onyx Staff ?")} target="_blank" className="block w-full text-left bg-zinc-100 p-3 rounded-xl text-xs font-bold hover:bg-[#39FF14]/10 transition">🤖 C'est quoi Onyx Staff ?</a>
              <a href={getWaLink("Comment je reçois mon Khaalis ?")} target="_blank" className="block w-full text-left bg-zinc-100 p-3 rounded-xl text-xs font-bold hover:bg-[#39FF14]/10 transition">🤖 Paiement Wave/Orange Money ?</a>
              <a href={getWaLink("Je veux parler à Maimouna svp.")} target="_blank" className="block w-full text-center bg-black text-[#39FF14] p-3 rounded-xl text-xs font-black uppercase mt-4">🗣️ Parler à un humain</a>
            </div>
          </div>
        )}
        <button onClick={() => setIsBotOpen(!isBotOpen)} className="w-16 h-16 rounded-full shadow-2xl border-4 border-[#39FF14] overflow-hidden hover:scale-110 transition transform bg-white">
          <img src="https://i.ibb.co/vxNQ39jJ/call.png" alt="Bot" className="w-full h-full object-cover" />
        </button>
      </div>

      {/* EXIT POPUP */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-500">
           <div className="bg-[#39FF14] text-black p-12 rounded-[4rem] max-w-xl text-center relative shadow-[0_0_100px_rgba(57,255,20,0.4)]">
              <button className="absolute top-8 right-8" onClick={() => setShowExitPopup(false)}><X /></button>
              <h2 className={`${spaceGrotesk.className} text-5xl font-black uppercase italic leading-none mb-6`}>Attends, Boss !</h2>
              <p className="font-bold text-lg mb-8 leading-tight">Ne repars pas les mains vides. Reçois le guide : <br/> <span className="underline decoration-black">"10 astuces pour doubler tes ventes WhatsApp"</span>.</p>
              <input type="email" placeholder="Ton adresse email..." className="w-full p-5 rounded-2xl border-2 border-black bg-white mb-4 outline-none font-bold" />
              <button className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm shadow-2xl hover:scale-105 transition">Envoyez-moi le guide (Gratuit)</button>
           </div>
        </div>
      )}

      {/* MODALE ELIGIBILITE */}
      {eligibilityModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300">
           <div className="bg-white p-10 rounded-[3.5rem] max-w-md w-full relative">
              <button className="absolute top-6 right-6" onClick={() => setEligibilityModal(null)}><X /></button>
              <EligibilityContent plan={eligibilityModal} />
           </div>
        </div>
      )}

      {/* FOOTER VIRAL */}
      <footer className="py-10 text-center border-t border-zinc-100 mt-20">
         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Propulsé par OnyxOps - Digitalisez votre business ici</p>
      </footer>
    </div>
  );
}

const FreeTrialBadge = ({ openAuth }: { openAuth: () => void }) => (
  <div className="bg-gradient-to-r from-[#39FF14]/10 to-zinc-50 border-2 border-[#39FF14] rounded-3xl p-8 max-w-4xl mx-auto my-12 text-center shadow-xl relative overflow-hidden">
    <div className="absolute top-0 right-0 p-4 opacity-5"><Target className="w-24 h-24" /></div>
    <div className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-4 uppercase shadow-lg animate-pulse">
      Offre Limitée : Plus que 12 places
    </div>
    <h3 className={`${spaceGrotesk.className} text-3xl font-bold mb-3 uppercase tracking-tighter`}>Testez <span className="text-[#39FF14]">Gratuitement</span> pendant 7 jours !</h3>
    <button onClick={openAuth} className="mt-4 bg-black text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-xl">Réclamer ma place maintenant</button>
  </div>
);

const EligibilityContent = ({ plan }: { plan: PlanKey }) => {
  const data = PLAN_DETAILS[plan];
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black uppercase italic">Analyse pour {data.title}</h3>
      <p className="text-sm font-bold text-zinc-500">Répondez honnêtement : Perdez-vous plus de 30 min par jour à chercher vos stocks ou relancer des livreurs ?</p>
      <div className="space-y-3">
        <button onClick={() => window.open(`https://wa.me/221768102039?text=Je+souhaite+activer+le+${data.title}`)} className="w-full bg-black text-[#39FF14] p-5 rounded-2xl font-black text-xs uppercase flex justify-between items-center group">Activer l'essai {data.title} <ArrowRight className="group-hover:translate-x-1 transition"/></button>
        <div className="p-5 bg-zinc-50 rounded-2xl border-2 border-dashed border-zinc-200">
           <p className="text-[10px] font-black text-zinc-400 uppercase mb-2">Conseil Expert Onyx</p>
           <p className="text-xs font-bold leading-tight mb-4">{data.upsell}</p>
           <button onClick={() => window.open(`https://wa.me/221768102039?text=L'argument+m'a+convaincu,+je+veux+le+${data.upsell}`)} className="text-[10px] font-black uppercase text-[#39FF14] bg-black px-4 py-2 rounded-lg">Passer au {data.upsell} (Gagner {data.savings})</button>
        </div>
      </div>
    </div>
  );
};
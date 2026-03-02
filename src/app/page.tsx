"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, ShieldCheck, TrendingUp, Users, Target, 
  Zap, CheckCircle2, AlertCircle, Lock, Handshake, Package, Info, X,
  MapPin, Clock, Mail, LifeBuoy, Menu, ChevronRight, Star, MessageSquare, 
  Flame, PlayCircle, Share2, LayoutDashboard, Link, Copy, Download, Wallet, Check, LogOut, Gift
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

type PlanKey = "solo" | "trio" | "full" | "premium";

// --- DATA CONSTANTS ---

const PLAN_DETAILS: Record<PlanKey, { title: string; price: number; desc: string; benefits: string[]; upsellMsg: string; targetPack: string; savings: string }> = {
  solo: {
    title: "Onyx Solo", price: 7500, desc: "L'essentiel pour vendre sur WhatsApp.",
    benefits: ["Catalogue interactif", "Devis PDF pro", "Lien unique"],
    upsellMsg: "Si tu vends mais que tu ne suis pas tes livreurs, tu perds 20% de ton cash. Passe au Trio pour 10.000F de plus seulement.",
    targetPack: "Pack Trio", savings: "10.000F"
  },
  trio: {
    title: "Pack Trio", price: 17500, desc: "Vente + Stock + Logistique (Tiak).",
    benefits: ["Inventaire scan", "Suivi livreurs", "Sécurisation cash"],
    upsellMsg: "Le contrôle c'est bien, mais l'automatisation RH et Menu QR libère 10h de ta semaine.",
    targetPack: "Pack Full", savings: "12.500F"
  },
  full: {
    title: "Pack Full", price: 30000, desc: "L'écosystème digital 360°.",
    benefits: ["RH & Paie QR", "Menu/Booking QR", "Rapports Hebdo"],
    upsellMsg: "Passe à l'IA pour doubler tes ventes sans recruter de commercial supplémentaire.",
    targetPack: "Onyx Premium", savings: "45.000F"
  },
  premium: {
    title: "Onyx Premium", price: 75000, desc: "L'Elite Business avec IA.",
    benefits: ["Studio Créatif IA", "CRM Automatisé", "Conseiller Dédié"],
    upsellMsg: "Offre 2+1 : Payez 2 mois, le 3ème est offert pour stabiliser votre croissance.",
    targetPack: "Offre Trimestre", savings: "75.000F"
  }
};

const SOLUTIONS = [
  { id: "Onyx Vente", icon: Smartphone, pain: "Photos WhatsApp interminables.", solution: "Catalogue digital & Devis PDF pro.", sector: "Commerce" },
  { id: "Onyx Tiak", icon: Truck, pain: "Livreurs injoignables, cash perdu.", solution: "Tracking temps réel & encaissement.", sector: "Logistique" },
  { id: "Onyx Stock", icon: Box, pain: "Vols et ruptures d'inventaire.", solution: "Gestion par scan & alertes.", sector: "Gestion" },
  { id: "Onyx Menu", icon: Utensils, pain: "Menus chers et sales.", solution: "QR Menu interactif.", sector: "Restauration" },
  { id: "Onyx Booking", icon: Calendar, pain: "No-shows (RDV manqués).", solution: "Acompte obligatoire.", sector: "Services" },
  { id: "Onyx Staff", icon: Users, pain: "Avances Tabaski & pointages faux.", solution: "Pointage GPS & Paie QR Code.", sector: "RH" },
];

const RANDOM_SCENARIOS = [
  { avant: { phone: "+221 77 000 XX XX", text: "C'est quoi l'avance Tabaski de Modou ? Et il a pointé hier ?", issue: "Pertes d'argent" }, apres: { title: "Ressources Humaines", text: "Modou S. a pointé via GPS WhatsApp.", sub: "Avance Tabaski déduite auto." } },
  { avant: { phone: "+221 76 111 XX XX", text: "Tu as la taille 42 ? Refais-moi le devis j'ai perdu le papier !", issue: "Temps perdu" }, apres: { title: "Vente & Stock", text: "Devis #1042 payé en ligne via lien.", sub: "Lien de suivi envoyé au client." } }
];

const ARTICLES = [
  { id: 1, category: "Social Selling", title: "Doubler vos ventes WhatsApp en 2026", content: "Au Sénégal, 90% des ventes se concluent sur WhatsApp. Onyx Vente transforme vos photos en un catalogue pro." },
  { id: 2, category: "Ressources Humaines", title: "Gérer les avances Tabaski sans stress", content: "Onyx Staff automatise les acomptes et fiches de paie par QR code." }
];

// --- MAIN COMPONENT ---

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

  const waNumber = "221768102039";
  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  // EXIT INTENT LOGIC
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
    const interval = setInterval(() => setScenarioIndex(prev => (prev + 1) % RANDOM_SCENARIOS.length), 5000);
    return () => clearInterval(interval);
  }, []);

  const navigateTo = (view: 'home' | 'about' | 'blog' | 'dashboard') => {
    setActiveView(view);
    setIsMobileMenuOpen(false);
    window.scrollTo(0,0);
  };

  const m1Gain = packCounts.solo * 7500 * 0.3 + packCounts.trio * 17500 * 0.3 + packCounts.full * 30000 * 0.3 + packCounts.premium * 75000 * 0.3;
  const recurringGain = packCounts.solo * 7500 * 0.1 + packCounts.trio * 17500 * 0.1 + packCounts.full * 30000 * 0.1 + packCounts.premium * 75000 * 0.1;

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black pt-16`}>
      {/* HEADER PERSISTANT */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-b border-zinc-100 z-[100] px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('home')}>
          <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx" width={120} height={40} className="h-9 w-auto" unoptimized />
          <span className={`${spaceGrotesk.className} font-bold text-xl tracking-tighter`}>ONYX OPS</span>
        </div>
        <div className="hidden lg:flex gap-8 font-black uppercase text-[10px] tracking-widest">
          <button onClick={() => navigateTo('home')} className="hover:text-[#39FF14]">Solutions</button>
          <button onClick={() => navigateTo('dashboard')} className="hover:text-[#39FF14]">Partenaires</button>
          <button onClick={() => navigateTo('blog')} className="hover:text-[#39FF14]">Blog</button>
          <button className="bg-black text-[#39FF14] px-6 py-2 rounded-full">Accès Hub</button>
        </div>
        <button className="lg:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}><Menu /></button>
      </nav>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-white flex flex-col items-center justify-center gap-8 animate-in fade-in">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6"><X size={32}/></button>
          <button onClick={() => navigateTo('home')} className="text-2xl font-black uppercase">Solutions</button>
          <button onClick={() => navigateTo('dashboard')} className="text-2xl font-black uppercase">Partenaires</button>
          <button onClick={() => navigateTo('blog')} className="text-2xl font-black uppercase">Blog</button>
        </div>
      )}

      {/* VUE ACCUEIL */}
      {activeView === 'home' && (
        <main className="animate-in fade-in duration-700">
          <header className="py-20 text-center px-6 max-w-5xl mx-auto">
            <h1 className={`${spaceGrotesk.className} text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-8`}>
              Digitalisez votre <br/><span className="text-[#39FF14] italic">Propre Empire.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-500 font-medium text-lg mb-12">L'infrastructure de vente n°1 au Sénégal. Propulsé par WhatsApp, sécurisé par Onyx.</p>
            <div className="flex justify-center gap-4 flex-wrap">
              <button onClick={() => navigateTo('dashboard')} className="bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black uppercase text-xs shadow-2xl">Devenir Partenaire</button>
              <button onClick={() => navigateTo('home')} className="border-2 border-black px-10 py-5 rounded-2xl font-black uppercase text-xs">Essai Gratuit 7j</button>
            </div>
          </header>

          {/* AVANT / APRES */}
          <section className="py-12 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-8 h-[350px]">
            <div className="bg-red-50 p-8 rounded-[3rem] border border-red-100 relative">
              <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase">Le Chaos</div>
              <div className="h-full flex flex-col justify-center" key={scenarioIndex}>
                <p className="text-red-500 font-bold text-xs mb-2">{RANDOM_SCENARIOS[scenarioIndex].avant.phone}</p>
                <p className="text-zinc-700 font-medium italic">"{RANDOM_SCENARIOS[scenarioIndex].avant.text}"</p>
              </div>
            </div>
            <div className="bg-black p-8 rounded-[3rem] border border-[#39FF14]/30 relative shadow-2xl">
              <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-4 py-1 rounded-bl-2xl text-[10px] font-black uppercase">OnyxOps</div>
              <div className="h-full flex flex-col justify-center">
                <h4 className="text-[#39FF14] font-black uppercase text-xs mb-2">{RANDOM_SCENARIOS[scenarioIndex].apres.title}</h4>
                <p className="text-white font-bold text-lg">{RANDOM_SCENARIOS[scenarioIndex].apres.text}</p>
                <p className="text-zinc-500 text-sm mt-2">{RANDOM_SCENARIOS[scenarioIndex].apres.sub}</p>
              </div>
            </div>
          </section>

          {/* SOLUTIONS */}
          <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
            {SOLUTIONS.map(s => (
              <div key={s.id} onClick={() => setEligibilityModal("solo")} className="bg-zinc-50 p-10 rounded-[3rem] hover:border-[#39FF14] border border-transparent transition-all cursor-pointer group shadow-sm">
                <div className="bg-black text-[#39FF14] w-12 h-12 rounded-2xl flex items-center justify-center mb-8"><s.icon /></div>
                <h3 className="text-2xl font-black uppercase italic mb-4">{s.id}</h3>
                <div className="bg-white p-4 rounded-2xl border-l-4 border-red-500 mb-4"><p className="text-xs font-bold text-zinc-600">{s.pain}</p></div>
                <div className="bg-[#39FF14]/5 p-4 rounded-2xl border-l-4 border-[#39FF14]"><p className="text-xs font-bold text-zinc-800">{s.solution}</p></div>
              </div>
            ))}
          </section>

          {/* TARIFS (NO LIMIT OFFERS) */}
          <section id="tarifs" className="py-24 bg-black text-white rounded-[4rem] mx-4 px-6">
            <div className="text-center mb-16">
              <h2 className={`${spaceGrotesk.className} text-4xl font-bold mb-4 uppercase`}>Offres <span className="text-[#39FF14]">No-Limits.</span></h2>
              <p className="text-zinc-500 font-black text-xs uppercase italic">Le business ne s'arrête jamais, nos outils non plus.</p>
            </div>
            <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-6">
              {(Object.keys(PLAN_DETAILS) as PlanKey[]).map(key => (
                <div key={key} className="bg-zinc-900/50 p-8 rounded-[3rem] border border-white/10 flex flex-col group relative">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2">{PLAN_DETAILS[key].title}</p>
                  <h3 className="text-3xl font-black italic mb-8">{PLAN_DETAILS[key].price.toLocaleString()}F<span className="text-xs text-zinc-500 font-normal">/m</span></h3>
                  <ul className="space-y-3 mb-10 flex-1">
                    {PLAN_DETAILS[key].benefits.map(b => <li key={b} className="text-xs font-bold flex items-center gap-2">✔ {b}</li>)}
                  </ul>
                  <button onClick={() => setEligibilityModal(key)} className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] mb-3 hover:bg-[#39FF14] transition">Est-ce pour moi ?</button>
                  <a href={getWaLink(`Je veux le pack ${key}`)} target="_blank" className="w-full bg-zinc-800 text-white py-4 rounded-xl font-black uppercase text-center text-[10px]">Commencer</a>
                </div>
              ))}
            </div>
          </section>

          {/* RÉTENTION 3 MOIS */}
          <section className="py-24 px-6 max-w-4xl mx-auto text-center">
             <div className="bg-[#39FF14]/10 border-2 border-[#39FF14] p-12 rounded-[4rem] relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Gift size={80}/></div>
                <h2 className="text-3xl font-black uppercase mb-4">Le Mois de la Sérénité (2+1)</h2>
                <p className="font-bold text-lg mb-8">Payez 2 mois d'avance pour votre lancement, le <span className="underline">3ème mois est 100% OFFERT</span>. Psychologiquement, vous ne payez pas pour un an, vous payez pour un trimestre de succès.</p>
                <button className="bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black uppercase text-xs">Sécuriser mon trimestre</button>
             </div>
          </section>
        </main>
      )}

      {/* DASHBOARD PARTENAIRE (SIMULATEUR + HUB) */}
      {activeView === 'dashboard' && (
        <div className="py-20 px-6 max-w-6xl mx-auto animate-in fade-in">
           {partnerStep !== 'dashboard' ? (
             <div className="text-center">
                <h1 className={`${spaceGrotesk.className} text-5xl font-black uppercase mb-12`}>Simulateur de <span className="text-[#39FF14]">Richesse</span></h1>
                <div className="grid md:grid-cols-2 gap-12 items-center mb-12">
                   <div className="bg-zinc-50 p-10 rounded-[3rem] border-2 border-zinc-200">
                      <h3 className="font-black uppercase mb-8">Vos Objectifs Mensuels</h3>
                      <div className="space-y-6 mb-10 text-left">
                        {(Object.keys(PLAN_DETAILS) as PlanKey[]).map(k => (
                          <div key={k} className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase w-20">{k}</span>
                            <input type="range" min="0" max="50" value={packCounts[k]} onChange={e => setPackCounts({...packCounts, [k]: parseInt(e.target.value)})} className="flex-1 mx-4 accent-black" />
                            <span className="bg-black text-[#39FF14] px-3 py-1 rounded-lg text-xs font-black">{packCounts[k]}</span>
                          </div>
                        ))}
                      </div>
                      <div className="bg-black text-white p-6 rounded-2xl text-center shadow-xl">
                        <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Gain Immédiat (M1)</p>
                        <p className="text-3xl font-black text-[#39FF14]">{m1Gain.toLocaleString()}F</p>
                        <p className="text-[10px] font-black uppercase text-zinc-500 mt-4 mb-1">Rente Récurrente Mensuelle</p>
                        <p className="text-xl font-black">{recurringGain.toLocaleString()}F</p>
                      </div>
                   </div>
                   <div className="text-left space-y-6">
                      <div className="flex gap-4 items-start"><CheckCircle2 className="text-[#39FF14]"/><p className="text-sm font-bold">30% Cash Immédiat : L'argent tombe dès l'abonnement du client.</p></div>
                      <div className="flex gap-4 items-start"><CheckCircle2 className="text-[#39FF14]"/><p className="text-sm font-bold">10% Récurrent à vie : Tant que votre client reste, vous gagnez.</p></div>
                      <div className="flex gap-4 items-start"><CheckCircle2 className="text-[#39FF14]"/><p className="text-sm font-bold">5% Réseau : Gagnez sur les ventes des ambassadeurs que vous recrutez.</p></div>
                      <button onClick={() => setPartnerStep('dashboard')} className="w-full bg-[#39FF14] text-black py-5 rounded-2xl font-black uppercase text-sm shadow-xl mt-4">Activer mon Dashboard</button>
                   </div>
                </div>
             </div>
           ) : (
             <div className="animate-in slide-in-from-bottom-6">
                <div className="flex justify-between items-center mb-12">
                  <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase`}>Espace <span className="text-[#39FF14]">Ambassadeur</span></h2>
                  <button onClick={() => setPartnerStep('landing')} className="flex items-center gap-2 text-red-500 font-black uppercase text-xs hover:bg-red-50 px-4 py-2 rounded-xl transition"><LogOut size={16}/> Déconnexion</button>
                </div>
                <div className="grid md:grid-cols-3 gap-6 mb-12">
                   <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet className="w-16 h-16" /></div>
                      <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Solde Cash</p>
                      <p className="text-4xl font-black text-[#39FF14]">142.500F</p>
                      <button className="mt-6 bg-[#39FF14] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase">Retrait Wave</button>
                   </div>
                   <div className="bg-zinc-50 border border-zinc-200 p-8 rounded-[2rem]">
                      <p className="text-[10px] font-black text-zinc-400 uppercase mb-2">Revenu Récurrent</p>
                      <p className="text-4xl font-black">22.500F <span className="text-xs text-zinc-400 not-italic">/m</span></p>
                   </div>
                   <div className="bg-[#39FF14]/10 border-2 border-[#39FF14] p-8 rounded-[2rem]">
                      <p className="text-[10px] font-black text-[#39FF14] uppercase mb-2">Bonus Filleuls (5%)</p>
                      <p className="text-4xl font-black">8.000F</p>
                   </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-8 mb-20">
                   <div className="bg-white border-2 border-black p-10 rounded-[3rem]">
                      <h3 className="font-black uppercase mb-8 flex items-center gap-2"><Link className="w-4 h-4 text-[#39FF14]"/> Liens de Parrainage</h3>
                      <div className="space-y-4">
                         <div className="bg-zinc-100 p-4 rounded-xl flex justify-between items-center"><span className="text-xs font-bold truncate">onyxops.com/ref/s/user_102</span><Copy size={16} className="cursor-pointer"/></div>
                         <div className="bg-zinc-100 p-4 rounded-xl flex justify-between items-center"><span className="text-xs font-bold truncate">onyxops.com/ref/r/user_102</span><Copy size={16} className="cursor-pointer"/></div>
                         <a href={getWaLink("J'ai découvert un outil pour digitaliser ta boutique...")} target="_blank" className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs text-center block">Partager en Statut WhatsApp</a>
                      </div>
                   </div>
                   <div className="bg-zinc-900 text-white p-10 rounded-[3rem]">
                      <h3 className="font-black uppercase mb-6 text-[#39FF14]">Le Kit physique Offert</h3>
                      <p className="text-sm font-medium text-zinc-400 mb-8">Après 3 mois de Full, vos clients reçoivent un autocollant QR Code Onyx plastifié pour leur boutique. Une fois collé, ils ne résilient plus jamais.</p>
                      <button className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase text-xs">Suivre mes envois</button>
                   </div>
                </div>
             </div>
           )}
        </div>
      )}

      {/* FOOTER VIRAL */}
      <footer className="py-12 border-t border-zinc-100 text-center mt-20">
         <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Propulsé par OnyxOps — Digitalisez votre business ici</p>
      </footer>

      {/* MODALE ELIGIBILITE (UPSELL D'URGENCE) */}
      {eligibilityModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in zoom-in duration-300">
           <div className="bg-white p-10 rounded-[3.5rem] max-w-md w-full relative">
              <button className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full" onClick={() => setEligibilityModal(null)}><X size={20}/></button>
              <h3 className="text-2xl font-black uppercase italic mb-4">Analyse de Besoin</h3>
              <p className="text-sm font-bold text-zinc-500 mb-6 italic">"Réponds honnêtement : Perds-tu plus de 30 min par jour à chercher tes stocks ou à relancer tes livreurs ?"</p>
              <div className="space-y-4">
                 <button onClick={() => window.open(getWaLink(`Je veux le pack ${eligibilityModal}`))} className="w-full bg-black text-[#39FF14] p-5 rounded-2xl font-black text-xs uppercase flex justify-between items-center group">
                    Oui, c'est mon cas <ArrowRight className="group-hover:translate-x-1 transition"/>
                 </button>
                 <div className="p-6 bg-[#39FF14]/10 rounded-2xl border-2 border-[#39FF14]">
                    <p className="text-[10px] font-black text-zinc-400 uppercase mb-2">Conseil Expert (Upsell)</p>
                    <p className="text-xs font-bold leading-tight mb-4">{PLAN_DETAILS[eligibilityModal].upsellMsg}</p>
                    <button onClick={() => window.open(getWaLink(`Je veux le ${PLAN_DETAILS[eligibilityModal].targetPack}`))} className="text-[10px] font-black uppercase text-white bg-black px-4 py-2 rounded-lg">Passer au {PLAN_DETAILS[eligibilityModal].targetPack} (Gain {PLAN_DETAILS[eligibilityModal].savings})</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* EXIT POPUP */}
      {showExitPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl animate-in fade-in">
           <div className="bg-[#39FF14] text-black p-12 rounded-[4rem] max-w-xl text-center relative shadow-[0_0_100px_rgba(57,255,20,0.5)]">
              <button className="absolute top-8 right-8" onClick={() => setShowExitPopup(false)}><X /></button>
              <h2 className={`${spaceGrotesk.className} text-5xl font-black uppercase italic leading-none mb-6`}>Attends, Boss !</h2>
              <p className="font-bold text-lg mb-10 leading-tight">Pas prêt à digitaliser ? Reçois notre guide exclusif : <br/> <span className="underline decoration-4">"10 astuces pour doubler tes ventes WhatsApp"</span>.</p>
              <input type="email" placeholder="Ton adresse email..." className="w-full p-5 rounded-2xl border-4 border-black bg-white mb-4 outline-none font-bold" />
              <button className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm shadow-2xl">Recevoir mon Guide Gratuit</button>
           </div>
        </div>
      )}

      {/* BOT WHATSAPP FLOTTANT */}
      <div className="fixed bottom-6 right-6 z-[120] flex flex-col items-end">
        {isBotOpen && (
          <div className="bg-white rounded-[2rem] shadow-2xl border border-zinc-200 p-6 mb-4 w-[300px] animate-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-4"><span className="font-black text-[10px] uppercase tracking-widest text-[#39FF14] bg-black px-3 py-1 rounded-full">Bot OnyxOps</span><button onClick={() => setIsBotOpen(false)}><X size={16}/></button></div>
            <p className="text-sm font-medium text-zinc-600 mb-4">Besoin d'aide ? Je connais tout sur Onyx.</p>
            <div className="space-y-2">
              <a href={getWaLink("C'est quoi Onyx Solo ?")} target="_blank" className="block w-full text-left bg-zinc-100 p-3 rounded-xl text-xs font-bold hover:bg-[#39FF14]/10 transition">🤖 C'est quoi Onyx Solo ?</a>
              <a href={getWaLink("Je veux parler à un humain.")} target="_blank" className="block w-full text-center bg-black text-[#39FF14] p-3 rounded-xl text-xs font-black uppercase mt-4">🗣️ Parler à un humain</a>
            </div>
          </div>
        )}
        <button onClick={() => setIsBotOpen(!isBotOpen)} className="w-16 h-16 rounded-full shadow-2xl border-4 border-[#39FF14] overflow-hidden hover:scale-110 transition transform bg-white">
          <img src="https://i.ibb.co/vxNQ39jJ/call.png" alt="Bot" className="w-full h-full object-cover" />
        </button>
      </div>
    </div>
  );
}
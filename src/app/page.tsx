"use client";

import React, { useState, useMemo } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, TrendingUp, Users, Zap, CheckCircle2, 
  AlertCircle, Lock, briefcase, LayoutGrid
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

const SOLUTIONS = [
  { id: "Onyx Catalog", icon: Smartphone, pain: "Perte de temps infinie sur WhatsApp avec les envois de photos.", solution: "Catalogue digital pro avec lien direct pour commander en un clic." },
  { id: "Onyx Devis", icon: Receipt, pain: "Devis gribouillés sur papier qui font perdre des clients sérieux.", solution: "Générateur de PDF pro en 60s pour sécuriser vos deals." },
  { id: "Onyx Tiak", icon: Truck, pain: "Le gérant ne sait jamais où est son cash ou son livreur.", solution: "Suivi logistique et sécurisation des encaissements en temps réel." },
  { id: "Onyx Stock", icon: Box, pain: "Rupture de stock fatale ou vols d'inventaire non détectés.", solution: "Inventaire par scan et alertes WhatsApp avant la rupture." },
  { id: "Onyx Menu", icon: Utensils, pain: "Menus sales, chers à imprimer et erreurs de commande.", solution: "QR Menu interactif : le client scanne et commande proprement." },
  { id: "Onyx Booking", icon: Calendar, pain: "Rendez-vous manqués (No-shows) et planning brouillon.", solution: "Réservations en ligne avec paiement d'acompte sécurisé." },
];

export default function OnyxOpsEliteV2() {
  // État du simulateur pour chaque pack
  const [qty, setQty] = useState({ solo: 0, trio: 0, full: 10, premium: 0 });
  const waNumber = "221768102039";

  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  // Calcul du simulateur (Modèle cumulé sur 6 mois demandé)
  const stats = useMemo(() => {
    const prices = { solo: 7500, trio: 17500, full: 30000, premium: 75000 };
    
    // Gain Immédiat M1 (30% du CA total généré le premier mois)
    const m1Sales = (qty.solo * prices.solo) + (qty.trio * prices.trio) + (qty.full * prices.full) + (qty.premium * prices.premium);
    const gainM1 = m1Sales * 0.30;

    // Gain Récurrent mensuel (10% du CA total)
    const recurringMensuel = m1Sales * 0.10;

    // Total cumulé sur 6 mois (M1 + M2 + M3 + M4 + M5 + M6) 
    // Si l'utilisateur vend la même quantité CHAQUE mois :
    // Total = Σ(n=1 to 6) [ (Qty * Price * 0.3) + ((n-1) * Qty * Price * 0.1) ]
    let total6Months = 0;
    for (let i = 1; i <= 6; i++) {
      total6Months += (m1Sales * 0.3) + ((i - 1) * m1Sales * 0.1);
    }

    return { gainM1, recurringMensuel, total6Months };
  }, [qty]);

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none`}>
      {/* BACKGROUND PATTERN FIX */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{ 
          backgroundImage: `url('https://i.ibb.co/chCcXT7p/back-site.png')`, 
          backgroundRepeat: 'repeat', 
          backgroundSize: '300px' 
        }}
      />

      <div className="relative z-10">
        {/* NAV BAR */}
        <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" className="h-10 w-auto" />
            <span className={`${spaceGrotesk.className} font-bold tracking-tighter text-2xl`}>ONYX OPS</span>
          </div>
          <div className="hidden md:flex gap-8 font-bold text-xs uppercase tracking-widest">
            <a href="#solutions" className="hover:text-[#39FF14] transition">Solutions</a>
            <a href="#tarifs" className="hover:text-[#39FF14] transition">Tarifs</a>
            <a href="#partenaires" className="hover:text-[#39FF14] transition">Partenaires</a>
          </div>
          <button className="bg-black text-[#39FF14] px-6 py-2 rounded-full font-bold text-xs uppercase">Accès Hub</button>
        </nav>

        {/* HERO SECTION UPDATED */}
        <header className="pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="bg-zinc-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-[#39FF14] fill-[#39FF14]" /> 6 Mini-SaaS
            </span>
            <span className="bg-zinc-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#39FF14]" /> Dès 7.500F / mois
            </span>
            <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              30% Commission
            </span>
          </div>

          <h1 className={`${spaceGrotesk.className} text-5xl md:text-8xl font-bold leading-[0.95] tracking-tighter mb-8`}>
            DIGITALISEZ VOTRE <br/> <span className="text-[#39FF14] italic underline decoration-black underline-offset-8">PROPRE EMPIRE.</span>
          </h1>

          <p className="text-zinc-600 text-lg md:text-xl max-w-3xl mx-auto font-medium mb-12 leading-relaxed">
            La suite complète d'outils pour les commerces de proximité, les PME et PMI sénégalaises. 
            Gérez vos ventes, stocks, devis et livraisons directement depuis votre téléphone et via Whatsapp. 
            <span className="block mt-2 font-bold text-black italic text-sm">0 engagement • 0 coût caché.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#partenaires" className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(57,255,20,0.4)] hover:scale-105 transition">
              <Users className="w-5 h-5" /> Devenir Partenaire
            </a>
            <a href="#solutions" className="bg-black text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-800 transition">
              <LayoutGrid className="w-5 h-5 text-[#39FF14]" /> Découvrir les Solutions
            </a>
          </div>
        </header>

        {/* SOLUTIONS SECTION */}
        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLUTIONS.map((s, i) => (
              <div key={i} className="bg-white border-2 border-zinc-100 p-10 rounded-[3rem] shadow-sm hover:border-[#39FF14] transition-all">
                <div className="bg-black text-[#39FF14] w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                  <s.icon className="w-7 h-7" />
                </div>
                <h3 className={`${spaceGrotesk.className} text-2xl font-bold mb-6 uppercase`}>{s.id}</h3>
                <div className="space-y-4">
                  <div className="bg-red-50 p-5 rounded-2xl border-l-4 border-red-500">
                    <p className="text-[10px] font-black text-red-600 uppercase mb-2 flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Douleur</p>
                    <p className="text-sm font-semibold leading-relaxed text-zinc-700">{s.pain}</p>
                  </div>
                  <div className="bg-zinc-50 p-5 rounded-2xl border-l-4 border-black">
                    <p className="text-[10px] font-black text-black uppercase mb-2 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-[#39FF14]"/> Solution Onyx</p>
                    <p className="text-sm font-semibold leading-relaxed text-zinc-800">{s.solution}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRICING SECTION UPDATED BUTTONS */}
        <section id="tarifs" className="py-24 bg-black text-white rounded-[5rem] mx-4 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className={`${spaceGrotesk.className} text-5xl font-bold mb-4 uppercase`}>CHOISISSEZ <span className="text-[#39FF14]">VOTRE ARME.</span></h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* SOLO */}
              <div className="bg-zinc-900 border border-white/10 p-10 rounded-[3.5rem] flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 mb-6 uppercase tracking-[0.3em]">Onyx Solo</p>
                  <div className={`${spaceGrotesk.className} text-5xl font-bold mb-8 italic`}>7.500F</div>
                  <ul className
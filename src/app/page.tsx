"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, ShieldCheck, TrendingUp, Users, Target, 
  Zap, CheckCircle2, AlertCircle, Lock, Handshake, Package, Info, X
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
  const [packCounts, setPackCounts] = useState({ solo: 0, pack3: 0, full: 0, premium: 0 });
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const waNumber = "221768102039";

  const openPlanModal = (plan: string) => (e: React.MouseEvent) => { e.stopPropagation(); setSelectedPlan(plan); };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") setSelectedPlan(null); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedPlan ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selectedPlan]);

  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

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
        <nav className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" width={120} height={40} className="h-10 w-auto object-contain" unoptimized />
            <span className={`${spaceGrotesk.className} font-bold tracking-tighter text-xl`}>ONYX OPS</span>
          </div>
          <div className="hidden md:flex gap-8 font-semibold text-sm uppercase">
            <a href="#solutions" className="hover:text-[#39FF14] transition">Solutions</a>
            <a href="#tarifs" className="hover:text-[#39FF14] transition">Tarifs</a>
            <a href="#partenaires" className="hover:text-[#39FF14] transition">Partenaires</a>
          </div>
          <button className="bg-black text-[#39FF14] px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition duration-300">
            Accès Hub
          </button>
        </nav>

        {/* HERO SECTION */}
        <header className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
          <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] mb-8`}>
            <Zap className="w-3 h-3 text-[#39FF14] fill-[#39FF14]" /> DAKAR BUSINESS ECOSYSTEM
          </div>
          <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-bold leading-[1] tracking-tighter mb-6`}>
            DIGITALISEZ VOTRE <br/> <span className="text-[#39FF14] italic">PROPRE EMPIRE.</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium mb-10">
            La suite complète d&apos;outils pour les commerces de proximité, les PME et PMI sénégalaises. Gérez vos ventes, stocks, devis et livraisons directement depuis votre téléphone et via Whatsapp. 0 Engagement 0 coûts cachés.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#partenaires" className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-[#39FF14] hover:text-black transition duration-300">
              <Handshake className="w-5 h-5" /> Devenir Partenaire
            </a>
            <a href="#solutions" className="inline-flex items-center gap-2 border-2 border-black text-black px-8 py-4 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-black hover:text-[#39FF14] transition duration-300">
              <Package className="w-5 h-5" /> Découvrir les Solutions
            </a>
          </div>
        </header>

        {/* SOLUTIONS SECTION */}
        <section id="solutions" className="py-20 px-6 max-w-7xl mx-auto">
          <h2 className={`${spaceGrotesk.className} text-3xl font-bold mb-12 text-center`}>NOS 6 SOLUTIONS <span className="text-[#39FF14]">RADICALES</span></h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SOLUTIONS.map((s, i) => (
              <div key={i} className="group bg-white border border-zinc-100 p-8 rounded-[2.5rem] shadow-xl hover:border-[#39FF14] transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition">
                  <s.icon className="w-24 h-24" />
                </div>
                <div className="bg-black text-[#39FF14] w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
                  <s.icon className="w-6 h-6" />
                </div>
                <h3 className={`${spaceGrotesk.className} text-2xl font-bold mb-4 italic uppercase`}>{s.id}</h3>
                <div className="space-y-4">
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
              <div onClick={() => setSelectedPlan("solo")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSelectedPlan("solo")} className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] hover:scale-105 transition cursor-pointer relative group">
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

              {/* TRIO (Best Seller) */}
              <div onClick={() => setSelectedPlan("trio")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSelectedPlan("trio")} className="bg-gradient-to-br from-[#39FF14]/20 to-black border-2 border-[#39FF14] p-8 rounded-[3rem] scale-110 shadow-[0_0_50px_rgba(57,255,20,0.2)] cursor-pointer relative">
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
              <div onClick={() => setSelectedPlan("full")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSelectedPlan("full")} className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] hover:scale-105 transition cursor-pointer relative">
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
              <div onClick={() => setSelectedPlan("premium")} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSelectedPlan("premium")} className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] hover:scale-105 transition cursor-pointer relative">
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

            {/* MODAL */}
            {selectedPlan && PLAN_DETAILS[selectedPlan] && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setSelectedPlan(null)}>
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />
                <div onClick={(e) => e.stopPropagation()} className="relative bg-white text-black rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
                  <button type="button" onClick={() => setSelectedPlan(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-zinc-800 transition">
                    <X className="w-4 h-4" />
                  </button>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-3`}>{PLAN_DETAILS[selectedPlan].title}</h3>
                  <p className="text-sm text-zinc-600 mb-6">{PLAN_DETAILS[selectedPlan].desc}</p>
                  <div className="space-y-2 mb-6">
                    {PLAN_DETAILS[selectedPlan].benefits.map((b, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#39FF14] flex-shrink-0 mt-0.5" />
                        <span className="font-medium text-zinc-800">{b}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-2xl bg-[#39FF14]/10 border border-[#39FF14]/30 mb-4">
                    <p className="text-[10px] font-bold text-[#39FF14] uppercase mb-1">Chiffre clé</p>
                    <p className="text-sm font-black text-black">{PLAN_DETAILS[selectedPlan].chiffreCle}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase mb-1">Pourquoi choisir</p>
                    <p className="text-zinc-700 italic text-sm">{PLAN_DETAILS[selectedPlan].why}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* GUIDE DE CHOIX */}
        <section className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-100">
          <div className="bg-zinc-50 rounded-[4rem] p-12 grid md:grid-cols-2 gap-12 items-center">
            <div className="relative aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-200 order-2 md:order-1">
              <Image src="/egerie-onyx.png" alt="Conseillère OnyxOps" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur p-4 rounded-2xl border border-[#39FF14]">
                <p className="font-black text-xs uppercase tracking-widest">Conseillère OnyxOps</p>
                <p className="text-[10px] font-bold text-zinc-500 italic">&quot;Je vous accompagne vers le succès.&quot;</p>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <h2 className={`${spaceGrotesk.className} text-5xl font-bold mb-8 uppercase leading-[0.9] tracking-tighter`}>
                QUELLE OFFRE <br/><span className="text-[#39FF14]">POUR VOTRE BUSINESS ?</span>
              </h2>
              <div className="space-y-6">
                {[
                  { t: "Vendeur WhatsApp", p: "Solo", d: "Digitalisez votre catalogue pour vendre pendant que vous dormez." },
                  { t: "Boutique Physique", p: "Trio", d: "Sécurisez votre stock et professionnalisez vos factures cash." },
                  { t: "Restaurant / PME", p: "Full", d: "Gérez vos menus, réservations et livreurs sans une seule erreur." },
                  { t: "Marque / Leader", p: "Premium", d: "Utilisez l'IA pour multiplier vos clients et votre impact." },
                ].map((item, i) => (
                  <div key={i} className="group cursor-default border-b border-zinc-200 pb-4">
                    <h4 className="font-black text-sm uppercase flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full" /> {item.t}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1 font-medium italic">Conseil : Orientez-vous vers le <span className="text-black font-bold">Pack {item.p}</span>. {item.d}</p>
                  </div>
                ))}
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

            {/* SIMULATEUR INTERACTIF - Par type de pack vendu */}
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

        {/* FOOTER */}
        <footer className="py-12 border-t border-zinc-100 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" width={72} height={24} className="h-6 w-auto object-contain grayscale opacity-50" unoptimized />
              <p className="text-zinc-300 font-black text-[10px] tracking-[0.5em] uppercase">OnyxOps 2026 • Dakar Tech • Security Active</p>
            </div>
            <div className="flex gap-6 items-center">
               <Lock className="w-3 h-3 text-zinc-200" />
               <a href="tel:+221768102039" className="text-zinc-400 font-bold text-xs hover:text-[#39FF14] transition underline decoration-[#39FF14]">Support : (+221) 76 810 20 39</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
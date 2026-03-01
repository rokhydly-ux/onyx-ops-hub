"use client";

import React, { useState, useMemo } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, TrendingUp, Users, Zap, CheckCircle2, 
  AlertCircle, Lock, LayoutGrid, Briefcase
} from "lucide-react";

// Initialisation des polices
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

export default function OnyxOpsEliteFinal() {
  // Simulateur Multi-Packs
  const [qty, setQty] = useState({ solo: 0, trio: 0, full: 10, premium: 0 });
  const waNumber = "221768102039";

  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  // Calcul mathématique précis (Rente cumulée sur 6 mois)
  const stats = useMemo(() => {
    const prices = { solo: 7500, trio: 17500, full: 30000, premium: 75000 };
    const m1Sales = (qty.solo * prices.solo) + (qty.trio * prices.trio) + (qty.full * prices.full) + (qty.premium * prices.premium);
    
    const gainM1 = m1Sales * 0.30;
    let total6Months = 0;
    // Formule : Chaque mois on touche 30% des nouvelles ventes + 10% de toutes les ventes cumulées passées
    for (let i = 1; i <= 6; i++) {
      total6Months += (m1Sales * 0.3) + ((i - 1) * m1Sales * 0.1);
    }

    return { gainM1, total6Months };
  }, [qty]);

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none`}>
      {/* SÉCURITÉ ANTI-SCREENSHOT & TEXT SELECTION */}
      <style jsx global>{`
        body { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
        @media print { body { display: none !important; } }
      `}</style>

      {/* BACKGROUND PATTERN FIXE (15% OPACITY) */}
      <div 
        className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none"
        style={{ 
          backgroundImage: "url('https://i.ibb.co/chCcXT7p/back-site.png')", 
          backgroundRepeat: 'repeat', 
          backgroundSize: '400px' 
        }}
      />

      <div className="relative z-10">
        {/* NAV BAR */}
        <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" className="h-10 w-auto" />
            <span className={`${spaceGrotesk.className} font-bold tracking-tighter text-2xl`}>ONYX OPS</span>
          </div>
          <div className="hidden md:flex gap-8 font-bold text-[10px] uppercase tracking-[0.2em] text-zinc-400">
            <a href="#solutions" className="hover:text-black transition">Solutions</a>
            <a href="#tarifs" className="hover:text-black transition">Tarifs</a>
            <a href="#partenaires" className="hover:text-black transition">Partenaires</a>
          </div>
          <button className="bg-black text-[#39FF14] px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition">Accès Hub</button>
        </nav>

        {/* HERO SECTION - REVISITÉE */}
        <header className="pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <span className="bg-zinc-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-3 h-3 text-[#39FF14] fill-[#39FF14]" /> 6 Mini-SaaS
            </span>
            <span className="bg-zinc-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <CheckCircle2 className="w-3 h-3 text-[#39FF14]" /> 7.500F par mois
            </span>
            <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
              30% Commission
            </span>
          </div>

          <h1 className={`${spaceGrotesk.className} text-5xl md:text-[5.5rem] font-bold leading-[0.9] tracking-tighter mb-8`}>
            VOTRE BUSINESS EN <br/> <span className="text-[#39FF14] italic underline decoration-black underline-offset-8">MODE ÉLITE.</span>
          </h1>

          <p className="text-zinc-600 text-lg md:text-xl max-w-4xl mx-auto font-medium mb-12 leading-relaxed">
            La suite complète d&apos;outils pour les commerces de proximité, les PME et PMI sénégalaises. 
            Gérez vos ventes, stocks, devis et livraisons directement depuis votre téléphone et via Whatsapp. 
            <span className="block mt-4 font-black text-black italic text-sm">0 engagement • 0 coût caché.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a href="#partenaires" className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-[0_20px_60px_rgba(57,255,20,0.4)] hover:scale-105 transition">
              <Briefcase className="w-5 h-5" /> Devenir Partenaire
            </a>
            <a href="#solutions" className="bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-zinc-800 transition shadow-xl">
              <LayoutGrid className="w-5 h-5 text-[#39FF14]" /> Découvrir les Solutions
            </a>
          </div>
        </header>

        {/* SOLUTIONS SECTION */}
        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SOLUTIONS.map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={i} className="bg-white/80 backdrop-blur-sm border-2 border-zinc-50 p-10 rounded-[3rem] shadow-sm hover:border-[#39FF14] transition-all">
                  <div className="bg-black text-[#39FF14] w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-bold mb-6 uppercase tracking-tight italic`}>{s.id}</h3>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-5 rounded-2xl border-l-4 border-red-500">
                      <p className="text-[10px] font-black text-red-600 uppercase mb-2">🚫 Douleur</p>
                      <p className="text-sm font-semibold leading-relaxed text-zinc-700">{s.pain}</p>
                    </div>
                    <div className="bg-zinc-50 p-5 rounded-2xl border-l-4 border-black">
                      <p className="text-[10px] font-black text-black uppercase mb-2">✅ Solution Onyx</p>
                      <p className="text-sm font-semibold leading-relaxed text-zinc-800">{s.solution}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* PRICING SECTION - BOUTONS SPÉCIFIQUES */}
        <section id="tarifs" className="py-24 bg-black text-white rounded-[5rem] mx-4 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <h2 className={`${spaceGrotesk.className} text-5xl font-bold mb-20 text-center uppercase`}>SÉLECTIONNEZ VOTRE <span className="text-[#39FF14]">OFFRE.</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* SOLO */}
              <div className="bg-zinc-900/50 border border-white/10 p-10 rounded-[3.5rem] flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 mb-6 uppercase tracking-[0.3em]">Onyx Solo</p>
                  <div className={`${spaceGrotesk.className} text-5xl font-bold mb-8`}>7.500F</div>
                  <ul className="text-sm space-y-4 mb-12 text-zinc-400 font-medium">
                    <li>✔ 1 Micro-SaaS au choix</li>
                    <li>✔ Support WhatsApp 24/7</li>
                    <li>✔ Formation Initiale</li>
                  </ul>
                </div>
                <a href={getWaLink("Bonjour Onyx, je veux COMMENCER avec l'offre Solo à 7.500F/mois.")} className="block text-center bg-white text-black py-5 rounded-2xl font-black text-xs uppercase hover:bg-[#39FF14] transition">Commencer</a>
              </div>

              {/* TRIO */}
              <div className="bg-zinc-800 border-2 border-[#39FF14] p-10 rounded-[3.5rem] shadow-[0_0_60px_rgba(57,255,20,0.2)] flex flex-col justify-between scale-105">
                <div>
                  <p className="text-[10px] font-black text-[#39FF14] mb-6 uppercase tracking-[0.3em]">Pack Trio</p>
                  <div className={`${spaceGrotesk.className} text-5xl font-bold mb-8 text-white`}>17.500F</div>
                  <ul className="text-sm space-y-4 mb-12 text-zinc-300 font-medium">
                    <li>✔ 3 Micro-SaaS Connectés</li>
                    <li>✔ Gérant Formé & Certifié</li>
                    <li>✔ Dashboard de revenus</li>
                  </ul>
                </div>
                <a href={getWaLink("Bonjour Onyx, je souhaite CHOISIR CE PACK Trio à 17.500F/mois.")} className="block text-center bg-[#39FF14] text-black py-5 rounded-2xl font-black text-xs uppercase hover:scale-105 transition">Choisir ce pack</a>
              </div>

              {/* FULL */}
              <div className="bg-zinc-900/50 border border-white/10 p-10 rounded-[3.5rem] flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 mb-6 uppercase tracking-[0.3em]">Pack Full</p>
                  <div className={`${spaceGrotesk.className} text-5xl font-bold mb-8`}>30.000F</div>
                  <ul className="text-sm space-y-4 mb-12 text-zinc-400 font-medium">
                    <li>✔ Les 6 Solutions Onyx</li>
                    <li>✔ Multi-utilisateurs</li>
                    <li>✔ Support Prioritaire</li>
                  </ul>
                </div>
                <a href={getWaLink("Bonjour Onyx, je veux TOUT CHOISIR avec le pack Full à 30.000F/mois.")} className="block text-center bg-white text-black py-5 rounded-2xl font-black text-xs uppercase hover:bg-[#39FF14] transition">Tout choisir</a>
              </div>

              {/* PREMIUM */}
              <div className="bg-zinc-900/50 border border-white/10 p-10 rounded-[3.5rem] flex flex-col justify-between">
                <div>
                  <p className="text-[10px] font-black text-zinc-500 mb-6 uppercase tracking-[0.3em]">Premium Hub</p>
                  <div className={`${spaceGrotesk.className} text-5xl font-bold mb-8 text-red-500`}>75.000F</div>
                  <ul className="text-sm space-y-4 mb-12 text-zinc-400 font-medium">
                    <li>✔ Studio IA Créatif</li>
                    <li>✔ CRM & Blog Expert</li>
                    <li>✔ Manager Dédié</li>
                  </ul>
                </div>
                <a href={getWaLink("Bonjour Onyx, je souhaite vous CONTACTER pour l'offre Premium à 75.000F/mois.")} className="block text-center border-2 border-white/20 text-white py-5 rounded-2xl font-black text-xs uppercase hover:bg-white hover:text-black transition">Contacter</a>
              </div>
            </div>
          </div>
        </section>

        {/* PARTENAIRES & SIMULATEUR MULTI-SLIDER */}
        <section id="partenaires" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className={`${spaceGrotesk.className} text-6xl font-black mb-10 leading-[1] uppercase`}>DEVENEZ <span className="text-[#39FF14]">LIBRE</span> FINANCIÈREMENT.</h2>
              <div className="space-y-10">
                <div className="flex gap-6 items-start">
                  <div className="bg-[#39FF14] p-4 rounded-2xl shadow-xl"><TrendingUp className="text-black" /></div>
                  <div><p className="font-black text-2xl uppercase">30% Commission M1</p><p className="text-zinc-500 font-medium">Encaissez un gros montant dès la signature de votre client.</p></div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="bg-black p-4 rounded-2xl shadow-xl"><Zap className="text-[#39FF14]" /></div>
                  <div><p className="font-black text-2xl uppercase">10% Rente Récurrente</p><p className="text-zinc-500 font-medium">Un revenu automatique chaque mois tant que le client utilise Onyx.</p></div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="bg-zinc-100 p-4 rounded-2xl shadow-xl"><Users className="text-black" /></div>
                  <div><p className="font-black text-2xl uppercase">5% Réseau d&apos;Équipe</p><p className="text-zinc-500 font-medium">Recrutez vos propres partenaires et touchez un bonus sur leurs ventes.</p></div>
                </div>
              </div>
            </div>

            {/* SIMULATEUR DE REVENUS CUMULÉS */}
            <div className="bg-white border-4 border-black p-10 rounded-[4rem] shadow-2xl">
              <h3 className={`${spaceGrotesk.className} text-2xl font-bold mb-10 text-center uppercase italic`}>Simulateur de Gains</h3>
              
              <div className="space-y-8 mb-12">
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-3"><span>Solo (7.5k)</span><span className="text-black bg-zinc-100 px-3 py-1 rounded-full font-bold">{qty.solo}</span></div>
                  <input type="range" min="0" max="30" value={qty.solo} onChange={(e) => setQty({...qty, solo: parseInt(e.target.value)})} className="w-full accent-black" />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-3"><span>Pack Trio (17.5k)</span><span className="text-black bg-zinc-100 px-3 py-1 rounded-full font-bold">{qty.trio}</span></div>
                  <input type="range" min="0" max="30" value={qty.trio} onChange={(e) => setQty({...qty, trio: parseInt(e.target.value)})} className="w-full accent-black" />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-[#39FF14]"><span>Pack Full (30k)</span><span className="text-black bg-[#39FF14] px-3 py-1 rounded-full font-bold">{qty.full}</span></div>
                  <input type="range" min="0" max="30" value={qty.full} onChange={(e) => setQty({...qty, full: parseInt(e.target.value)})} className="w-full accent-[#39FF14]" />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] font-black uppercase mb-3 text-red-500"><span>Premium (75k)</span><span className="text-white bg-red-500 px-3 py-1 rounded-full font-bold">{qty.premium}</span></div>
                  <input type="range" min="0" max="30" value={qty.premium} onChange={(e) => setQty({...qty, premium: parseInt(e.target.value)})} className="w-full accent-red-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="bg-black p-6 rounded-3xl text-white shadow-xl">
                  <p className="text-[10px] font-black text-zinc-500 uppercase mb-2">Gain Immédiat (M1)</p>
                  <p className={`${spaceGrotesk.className} text-2xl font-bold text-[#39FF14]`}>{stats.gainM1.toLocaleString()} F</p>
                </div>
                <div className="bg-[#39FF14] p-6 rounded-3xl text-black border-2 border-black shadow-xl">
                  <p className="text-[10px] font-black text-black/50 uppercase mb-2">Total 6 Mois 💰</p>
                  <p className={`${spaceGrotesk.className} text-2xl font-bold`}>{stats.total6Months.toLocaleString()} F</p>
                </div>
              </div>

              <p className="mt-6 text-[10px] font-bold text-zinc-400 text-center uppercase italic">Estimations basées sur un volume constant chaque mois.</p>
              
              <a href={getWaLink("Bonjour Onyx, je souhaite devenir Partenaire. Mes prévisions : Solo("+qty.solo+"), Trio("+qty.trio+"), Full("+qty.full+"), Premium("+qty.premium+").")} className="mt-8 block text-center bg-black text-white py-6 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-[#39FF14] hover:text-black transition">Postuler Maintenant</a>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-zinc-100 bg-white/80">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" className="h-6 w-auto" />
              <p className="text-zinc-300 font-black text-[10px] tracking-[0.5em] uppercase">OnyxOps 2026 • Dakar Tech Ecosystem</p>
            </div>
            <div className="flex gap-6 items-center">
               <Lock className="w-4 h-4 text-zinc-200" />
               <a href="tel:+221768102039" className="text-zinc-500 font-black text-xs hover:text-[#39FF14] transition underline decoration-[#39FF14] underline-offset-4 tracking-tighter">(+221) 76 810 20 39</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
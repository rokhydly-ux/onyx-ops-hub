C'est exactement ce que je craignais : le code est tellement long qu'il a été coupé (tronqué) au moment du copier-coller ou de la génération. L'erreur Expected '</', got '<eof>' signifie que le fichier s'arrête brutalement à la ligne 150 alors qu'une balise est encore ouverte.

Voici le code complet et vérifié. Pour éviter que cela ne recoupe, je l'ai optimisé pour être un peu plus compact tout en gardant 100% de tes fonctionnalités (Simulateur exact, Logo, Background, Polices, WhatsApp).

⚠️ IMPORTANT : Procédure de nettoyage
Dans Cursor, fais Ctrl + A puis Supprimer pour avoir un fichier totalement vide.

Copie le bloc ci-dessous en vérifiant bien que tu as copié jusqu'à la toute dernière accolade } à la fin.

TypeScript
"use client";

import React, { useState, useMemo } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, TrendingUp, Users, Zap, CheckCircle2, 
  AlertCircle, Lock, LayoutGrid, Briefcase
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

const SOLUTIONS = [
  { id: "Onyx Catalog", icon: Smartphone, pain: "Perte de temps sur WhatsApp (envois photos).", solution: "Catalogue digital pro avec lien direct pour commander." },
  { id: "Onyx Devis", icon: Receipt, pain: "Devis manuels lents qui font fuir les clients.", solution: "Générateur de PDF pro en 60s pour sécuriser vos deals." },
  { id: "Onyx Tiak", icon: Truck, pain: "Zéro visibilité sur le cash et les livreurs.", solution: "Suivi logistique et sécurisation des encaissements live." },
  { id: "Onyx Stock", icon: Box, pain: "Ruptures surprises ou vols d'inventaire.", solution: "Scan intelligent & alertes WhatsApp avant la rupture." },
  { id: "Onyx Menu", icon: Utensils, pain: "Menus sales et erreurs de commande en salle.", solution: "QR Menu interactif : scannez et commandez proprement." },
  { id: "Onyx Booking", icon: Calendar, pain: "Rendez-vous manqués (No-shows) fréquents.", solution: "Réservations en ligne avec paiement d'acompte." },
];

export default function OnyxOpsEliteFinal() {
  const [qty, setQty] = useState({ solo: 0, trio: 0, full: 10, premium: 0 });
  const waNumber = "221768102039";
  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const stats = useMemo(() => {
    const prices = { solo: 7500, trio: 17500, full: 30000, premium: 75000 };
    const m1Sales = (qty.solo * prices.solo) + (qty.trio * prices.trio) + (qty.full * prices.full) + (qty.premium * prices.premium);
    const gainM1 = m1Sales * 0.30;
    let total6Months = 0;
    for (let i = 1; i <= 6; i++) { total6Months += (m1Sales * 0.3) + ((i - 1) * m1Sales * 0.1); }
    return { gainM1, total6Months };
  }, [qty]);

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none relative overflow-x-hidden`}>
      <style jsx global>{`body { -webkit-user-select: none; user-select: none; } @media print { body { display: none !important; } }`}</style>

      {/* BACKGROUND PATTERN */}
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: "url('https://i.ibb.co/chCcXT7p/back-site.png')", backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

      <div className="relative z-10">
        <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" className="h-10 w-auto" />
            <span className={`${spaceGrotesk.className} font-bold tracking-tighter text-2xl`}>ONYX OPS</span>
          </div>
          <button className="bg-black text-[#39FF14] px-6 py-2 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition">Accès Hub</button>
        </nav>

        <header className="pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <span className="bg-zinc-100 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 text-[#39FF14]" /> 6 Mini-SaaS</span>
            <span className="bg-zinc-100 px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#39FF14]" /> 7.500F / mois</span>
            <span className="bg-black text-[#39FF14] px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">30% Commission</span>
          </div>
          <h1 className={`${spaceGrotesk.className} text-5xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-8`}>VOTRE BUSINESS EN <br/><span className="text-[#39FF14] italic underline decoration-black underline-offset-8">MODE ÉLITE.</span></h1>
          <p className="text-zinc-600 text-lg md:text-xl max-w-4xl mx-auto font-medium mb-12">La suite complète d'outils pour les commerces, PME et PMI sénégalaises. Gérez ventes, stocks et livraisons sur WhatsApp. <span className="block mt-4 font-black text-black italic text-sm uppercase">0 engagement • 0 coût caché.</span></p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <a href="#partenaires" className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition"><Briefcase className="w-5 h-5" /> Devenir Partenaire</a>
            <a href="#solutions" className="bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-800 transition"><LayoutGrid className="w-5 h-5 text-[#39FF14]" /> Découvrir Solutions</a>
          </div>
        </header>

        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SOLUTIONS.map((s, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm border-2 border-zinc-50 p-10 rounded-[3rem] hover:border-[#39FF14] transition-all">
              <div className="bg-black text-[#39FF14] w-12 h-12 rounded-xl flex items-center justify-center mb-8"><s.icon className="w-6 h-6" /></div>
              <h3 className={`${spaceGrotesk.className} text-xl font-bold mb-6 uppercase italic`}>{s.id}</h3>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-xl border-l-4 border-red-500"><p className="text-[9px] font-black text-red-600 uppercase mb-1">🚫 Douleur</p><p className="text-xs font-semibold text-zinc-700">{s.pain}</p></div>
                <div className="bg-zinc-50 p-4 rounded-xl border-l-4 border-black"><p className="text-[9px] font-black text-black uppercase mb-1">✅ Solution Onyx</p><p className="text-xs font-semibold text-zinc-800">{s.solution}</p></div>
              </div>
            </div>
          ))}
        </section>

        <section id="tarifs" className="py-24 bg-black text-white rounded-[4rem] mx-4 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className={`${spaceGrotesk.className} text-4xl font-bold mb-16 text-center uppercase tracking-tighter`}>SÉLECTIONNEZ VOTRE <span className="text-[#39FF14]">OFFRE.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] flex flex-col justify-between">
                <div><p className="text-[9px] font-black text-zinc-500 mb-6 uppercase">Onyx Solo</p><div className={`${spaceGrotesk.className} text-4xl font-bold mb-8 italic`}>7.500F</div><ul className="text-xs space-y-3 mb-10 text-zinc-400 font-medium"><li>✔ 1 Micro-SaaS</li><li>✔ Support WhatsApp</li></ul></div>
                <a href={getWaLink("Je veux COMMENCER avec l'offre Solo (7.500F).")} className="bg-white text-black py-4 rounded-xl font-black text-[10px] text-center uppercase hover:bg-[#39FF14] transition">Commencer</a>
              </div>
              <div className="bg-zinc-800 border-2 border-[#39FF14] p-8 rounded-[3rem] flex flex-col justify-between scale-105 shadow-2xl">
                <div><p className="text-[9px] font-black text-[#39FF14] mb-6 uppercase">Pack Trio</p><div className={`${spaceGrotesk.className} text-4xl font-bold mb-8 italic`}>17.500F</div><ul className="text-xs space-y-3 mb-10 text-zinc-300 font-medium"><li>✔ 3 Micro-SaaS</li><li>✔ Formation Gérant</li></ul></div>
                <a href={getWaLink("Je veux CHOISIR CE PACK Trio (17.500F).")} className="bg-[#39FF14] text-black py-4 rounded-xl font-black text-[10px] text-center uppercase transition">Choisir ce pack</a>
              </div>
              <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] flex flex-col justify-between">
                <div><p className="text-[9px] font-black text-zinc-500 mb-6 uppercase">Pack Full</p><div className={`${spaceGrotesk.className} text-4xl font-bold mb-8 italic`}>30.000F</div><ul className="text-xs space-y-3 mb-10 text-zinc-400 font-medium"><li>✔ Les 6 SaaS</li><li>✔ Multi-boutiques</li></ul></div>
                <a href={getWaLink("Je veux TOUT CHOISIR avec le pack Full (30.000F).")} className="bg-white text-black py-4 rounded-xl font-black text-[10px] text-center uppercase hover:bg-[#39FF14] transition">Tout choisir</a>
              </div>
              <div className="bg-zinc-900/50 border border-white/10 p-8 rounded-[3rem] flex flex-col justify-between">
                <div><p className="text-[9px] font-black text-zinc-500 mb-6 uppercase">Premium</p><div className={`${spaceGrotesk.className} text-4xl font-bold mb-8 text-red-500 italic`}>75.000F</div><ul className="text-xs space-y-3 mb-10 text-zinc-400 font-medium"><li>✔ Studio IA</li><li>✔ Manager Dédié</li></ul></div>
                <a href={getWaLink("Je veux CONTACTER pour l'offre Premium (75.000F).")} className="border border-white/20 text-white py-4 rounded-xl font-black text-[10px] text-center uppercase hover:bg-white hover:text-black transition">Contacter</a>
              </div>
            </div>
          </div>
        </section>

        <section id="partenaires" className="py-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className={`${spaceGrotesk.className} text-5xl font-black mb-10 uppercase italic`}>VOTRE <span className="text-[#39FF14]">RENTE</span> 221.</h2>
            <div className="space-y-8">
              <div className="flex gap-4"><TrendingUp className="text-[#39FF14]" /><div><p className="font-black text-xl">30% COMMISSION M1</p><p className="text-sm text-zinc-500">Cash immédiat sur chaque signature.</p></div></div>
              <div className="flex gap-4"><Zap className="text-[#39FF14]" /><div><p className="font-black text-xl">10% RÉCURRENT À VIE</p><p className="text-sm text-zinc-500">Revenu mensuel automatique par client.</p></div></div>
              <div className="flex gap-4"><Users className="text-[#39FF14]" /><div><p className="font-black text-xl">5% RÉSEAU AFFILIÉ</p><p className="text-sm text-zinc-500">Bonus sur les ventes de votre équipe.</p></div></div>
            </div>
          </div>
          <div className="bg-white border-4 border-black p-8 rounded-[3.5rem] shadow-2xl">
            <h3 className={`${spaceGrotesk.className} text-xl font-bold mb-8 text-center uppercase`}>Simulateur de Gains</h3>
            <div className="space-y-6 mb-10">
              {['solo', 'trio', 'full', 'premium'].map((p) => (
                <div key={p} className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] font-black uppercase"><span>{p}</span><span className="bg-black text-[#39FF14] px-2 rounded">{qty[p as keyof typeof qty]}</span></div>
                  <input type="range" min="0" max="30" value={qty[p as keyof typeof qty]} onChange={(e) => setQty({...qty, [p]: parseInt(e.target.value)})} className="w-full accent-[#39FF14]" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black p-5 rounded-2xl text-white"><p className="text-[9px] font-bold text-zinc-500 uppercase italic">Gain M1</p><p className={`${spaceGrotesk.className} text-xl font-bold text-[#39FF14]`}>{stats.gainM1.toLocaleString()} F</p></div>
              <div className="bg-[#39FF14] p-5 rounded-2xl text-black border-2 border-black"><p className="text-[9px] font-bold text-black/50 uppercase italic text-center">Total 6 Mois 💰</p><p className={`${spaceGrotesk.className} text-xl font-bold text-center`}>{stats.total6Months.toLocaleString()} F</p></div>
            </div>
            <a href={getWaLink(`Partenaire : Solo(${qty.solo}), Trio(${qty.trio}), Full(${qty.full}), Premium(${qty.premium}).`)} className="mt-8 block text-center bg-black text-white py-5 rounded-2xl font-black uppercase text-xs hover:bg-[#39FF14] hover:text-black transition">Postuler Maintenant</a>
          </div>
        </section>

        <footer className="py-12 border-t border-zinc-100 bg-white text-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3"><img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" className="h-6 w-auto" /><p className="text-zinc-300 font-black text-[9px] uppercase tracking-widest italic">OnyxOps 2026 • Dakar Tech</p></div>
            <div className="flex gap-4 items-center"><Lock className="w-4 h-4 text-zinc-200" /><a href="tel:+221768102039" className="text-zinc-400 font-bold text-xs hover:text-[#39FF14] transition underline underline-offset-4">(+221) 76 810 20 39</a></div>
          </div>
        </footer>
      </div>
    </div>
  );
}
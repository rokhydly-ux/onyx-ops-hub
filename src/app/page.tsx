"use client";

import React, { useState, useMemo } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, TrendingUp, Users, Zap, CheckCircle2, 
  AlertCircle, Lock, LayoutGrid, Briefcase, Target
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

export default function OnyxOpsEliteV3() {
  const [qty, setQty] = useState({ solo: 0, trio: 0, full: 10, premium: 0 });
  const waNumber = "221768102039";

  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const stats = useMemo(() => {
    const p = { solo: 7500, trio: 17500, full: 30000, premium: 75000 };
    const monthlyNewCA = (qty.solo * p.solo) + (qty.trio * p.trio) + (qty.full * p.full) + (qty.premium * p.premium);
    
    // Gain M1 = 30% des nouvelles ventes
    const gainM1 = monthlyNewCA * 0.30;
    
    // Total 6 mois (Cumul mensuel : 30% nouvelles ventes + 10% récurrent cumulé)
    // Pour 10 Full : (90k * 6) + (30k * 15) = 540k + 450k = 990,000F
    let total6Months = (gainM1 * 6) + (monthlyNewCA * 0.1 * 15);

    return { gainM1, total6Months };
  }, [qty]);

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none relative`}>
      <style jsx global>{`body{user-select:none;-webkit-user-select:none;}@media print{body{display:none!important;}}`}</style>
      
      {/* BACKGROUND PATTERN */}
      <div className="fixed inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: "url('https://i.ibb.co/chCcXT7p/back-site.png')", backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

      <div className="relative z-10">
        <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" className="h-10 w-auto" />
            <span className={`${spaceGrotesk.className} font-bold tracking-tighter text-2xl`}>ONYX OPS</span>
          </div>
          <div className="hidden md:flex gap-8 font-bold text-[10px] uppercase tracking-widest text-zinc-400">
            <a href="#solutions" className="hover:text-black transition">Solutions</a>
            <a href="#tarifs" className="hover:text-black transition">Tarifs</a>
            <a href="#partenaires" className="hover:text-black transition">Partenaires</a>
          </div>
          <button className="bg-black text-[#39FF14] px-6 py-2 rounded-full font-bold text-xs">Accès Hub</button>
        </nav>

        {/* HERO SECTION UPDATED */}
        <header className="pt-20 pb-16 px-6 text-center max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <span className="bg-zinc-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Zap className="w-3 h-3 text-[#39FF14]" /> 6 Mini-SaaS</span>
            <span className="bg-zinc-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-[#39FF14]" /> 7500F par mois</span>
            <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">30% Commission</span>
          </div>

          <h1 className={`${spaceGrotesk.className} text-5xl md:text-8xl font-bold leading-[0.95] tracking-tighter mb-8`}>
            DIGITALISEZ VOTRE <br/> <span className="text-[#39FF14] italic underline decoration-black underline-offset-8">PROPRE EMPIRE.</span>
          </h1>

          <p className="text-zinc-600 text-lg md:text-xl max-w-4xl mx-auto font-medium mb-12">
            La suite complète d'outils pour les commerces de proximité, les PME et PMI sénégalaises. 
            Gérez vos ventes, stocks, devis et livraisons directement depuis votre téléphone et via Whatsapp. 
            <span className="block mt-4 font-black text-black italic text-sm">0 engagement • 0 coût caché.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#partenaires" className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:scale-105 transition">
              <Briefcase className="w-5 h-5" /> Devenir Partenaire
            </a>
            <a href="#solutions" className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-zinc-800 transition">
              <LayoutGrid className="w-5 h-5 text-[#39FF14]" /> Découvrir les Solutions
            </a>
          </div>
        </header>

        {/* SOLUTIONS SECTION */}
        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SOLUTIONS.map((s, i) => (
            <div key={i} className="bg-white/80 border-2 border-zinc-50 p-10 rounded-[3rem] shadow-sm hover:border-[#39FF14] transition-all">
              <div className="bg-black text-[#39FF14] w-12 h-12 rounded-2xl flex items-center justify-center mb-8"><s.icon className="w-6 h-6" /></div>
              <h3 className={`${spaceGrotesk.className} text-2xl font-bold mb-6 uppercase italic`}>{s.id}</h3>
              <div className="space-y-4">
                <div className="bg-red-50 p-5 rounded-2xl border-l-4 border-red-500"><p className="text-[10px] font-black text-red-600 uppercase mb-2 italic">Douleur</p><p className="text-sm font-semibold text-zinc-700">{s.pain}</p></div>
                <div className="bg-zinc-50 p-5 rounded-2xl border-l-4 border-black"><p className="text-[10px] font-black text-black uppercase mb-2 italic text-[#39FF14]">Solution</p><p className="text-sm font-semibold text-zinc-800">{s.solution}</p></div>
              </div>
            </div>
          ))}
        </section>

        {/* PRICING SECTION - GRADIENTS & BUTTONS */}
        <section id="tarifs" className="py-24 bg-black text-white rounded-[5rem] mx-4 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className={`${spaceGrotesk.className} text-5xl font-bold mb-20 uppercase italic`}>CHOISISSEZ VOTRE <span className="text-[#39FF14]">ARME.</span></h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-zinc-900/50 p-10 rounded-[3.5rem] border border-white/5 flex flex-col justify-between">
                <div><p className="text-[10px] font-black text-zinc-500 mb-6 uppercase italic tracking-widest">Solo</p><div className={`${spaceGrotesk.className} text-5xl font-bold mb-10`}>7.500F</div><ul className="text-xs space-y-4 mb-12 text-zinc-400 font-medium"><li>✔ 1 Micro-SaaS</li><li>✔ Support WhatsApp</li></ul></div>
                <a href={getWaLink("Bonjour Onyx, je veux Commencer avec l'offre Solo (7.5k).")} className="bg-white text-black py-5 rounded-2xl font-black text-xs uppercase hover:bg-[#39FF14] transition">Commencer</a>
              </div>
              <div className="bg-zinc-800 p-10 rounded-[3.5rem] border-2 border-[#39FF14] scale-105 flex flex-col justify-between shadow-2xl">
                <div><p className="text-[10px] font-black text-[#39FF14] mb-6 uppercase italic tracking-widest">Trio</p><div className={`${spaceGrotesk.className} text-5xl font-bold mb-10 text-white`}>17.500F</div><ul className="text-xs space-y-4 mb-12 text-zinc-200 font-medium"><li>✔ 3 Micro-SaaS</li><li>✔ Formation Gérant</li></ul></div>
                <a href={getWaLink("Bonjour Onyx, je souhaite Choisir ce pack Trio (17.5k).")} className="bg-[#39FF14] text-black py-5 rounded-2xl font-black text-xs uppercase transition">Choisir ce pack</a>
              </div>
              <div className="bg-zinc-900/50 p-10 rounded-[3.5rem] border border-white/5 flex flex-col justify-between">
                <div><p className="text-[10px] font-black text-zinc-500 mb-6 uppercase italic tracking-widest">Full</p><div className={`${spaceGrotesk.className} text-5xl font-bold mb-10`}>30.000F</div><ul className="text-xs space-y-4 mb-12 text-zinc-400 font-medium"><li>✔ Les 6 SaaS</li><li>✔ Multi-boutiques</li></ul></div>
                <a href={getWaLink("Bonjour Onyx, je veux Tout choisir avec le pack Full (30k).")} className="bg-white text-black py-5 rounded-2xl font-black text-xs uppercase hover:bg-[#39FF14] transition">Tout choisir</a>
              </div>
              <div className="bg-zinc-900/50 p-10 rounded-[3.5rem] border border-white/5 flex flex-col justify-between">
                <div><p className="text-[10px] font-black text-zinc-500 mb-6 uppercase italic tracking-widest">Premium</p><div className={`${spaceGrotesk.className} text-5xl font-bold mb-10 text-red-500`}>75.000F</div><ul className="text-xs space-y-4 mb-12 text-zinc-400 font-medium"><li>✔ Studio IA</li><li>✔ Manager Dédié</li></ul></div>
                <a href={getWaLink("Bonjour Onyx, je veux Contacter pour l'offre Premium (75k).")} className="border border-white/20 text-white py-5 rounded-2xl font-black text-xs uppercase hover:bg-white hover:text-black transition">Contacter</a>
              </div>
            </div>
          </div>
        </section>

        {/* PARTENAIRES & SIMULATEUR MULTI-PACKS */}
        <section id="partenaires" className="py-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className={`${spaceGrotesk.className} text-6xl font-black mb-10 uppercase italic leading-none`}>VOTRE <span className="text-[#39FF14]">RENTE</span> 221.</h2>
            <div className="space-y-8">
              <div className="flex gap-5"><TrendingUp className="text-[#39FF14]"/><p className="font-black text-lg">30% COMMISSION M1 <span className="block text-zinc-400 text-sm font-medium">Cash immédiat sur chaque nouvelle signature.</span></p></div>
              <div className="flex gap-5"><Zap className="text-[#39FF14]"/><p className="font-black text-lg">10% RÉCURRENT À VIE <span className="block text-zinc-400 text-sm font-medium">Revenu mensuel automatique par client actif.</span></p></div>
              <div className="flex gap-5"><Users className="text-[#39FF14]"/><p className="font-black text-lg">5% RÉSEAU AFFILIÉ <span className="block text-zinc-400 text-sm font-medium">Gagnez sur toutes les ventes de votre équipe.</span></p></div>
            </div>
          </div>

          <div className="bg-white border-4 border-black p-10 rounded-[4rem] shadow-2xl">
            <h3 className={`${spaceGrotesk.className} text-2xl font-bold mb-10 text-center uppercase italic`}>Simulateur de Gains</h3>
            <div className="space-y-6 mb-12">
              {['solo', 'trio', 'full', 'premium'].map((p) => (
                <div key={p} className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] font-black uppercase"><span>Ventes {p}</span><span className="bg-black text-[#39FF14] px-3 py-0.5 rounded-full font-bold">{qty[p as keyof typeof qty]}</span></div>
                  <input type="range" min="0" max="30" value={qty[p as keyof typeof qty]} onChange={(e) => setQty({...qty, [p]: parseInt(e.target.value)})} className="w-full h-2 bg-zinc-100 rounded-lg appearance-none cursor-pointer accent-[#39FF14]" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black p-6 rounded-3xl text-white text-center"><p className="text-[10px] font-bold text-zinc-500 uppercase mb-2 italic">Gain Immédiat (M1)</p><p className={`${spaceGrotesk.className} text-2xl font-bold text-[#39FF14]`}>{stats.gainM1.toLocaleString()} F</p></div>
              <div className="bg-[#39FF14] p-6 rounded-3xl border-2 border-black text-center text-black shadow-xl"><p className="text-[10px] font-bold opacity-50 uppercase mb-2 italic">Total 6 Mois 💰</p><p className={`${spaceGrotesk.className} text-2xl font-bold`}>{stats.total6Months.toLocaleString()} F</p></div>
            </div>
            <a href={getWaLink(`Partenaire Onyx. Objectif: S(${qty.solo}) T(${qty.trio}) F(${qty.full}) P(${qty.premium}).`)} className="mt-8 block text-center bg-black text-white py-5 rounded-2xl font-black uppercase text-xs hover:bg-[#39FF14] hover:text-black transition">Postuler Maintenant</a>
          </div>
        </section>

        <footer className="py-12 border-t border-zinc-100 bg-white/80 text-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3"><img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" className="h-8 w-auto" /><p className="text-zinc-300 font-black text-[10px] uppercase tracking-widest italic">OnyxOps 2026 • Dakar Tech</p></div>
            <div className="flex gap-4 items-center font-bold text-xs text-zinc-500"><Lock className="w-4 h-4 text-zinc-200" /><a href="tel:+221768102039" className="hover:text-[#39FF14] transition underline decoration-[#39FF14] underline-offset-4 tracking-tighter">(+221) 76 810 20 39</a></div>
          </div>
        </footer>
      </div>
    </div>
  );
}
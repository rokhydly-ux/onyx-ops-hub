"use client";

import React, { useState, useMemo } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Smartphone, Receipt, Truck, Box, Utensils, Calendar, 
  ArrowRight, TrendingUp, Users, Zap, CheckCircle2, 
  AlertCircle, Lock, LayoutGrid, Briefcase 
} from "lucide-react";

const space = Space_Grotesk({ subsets: ["latin"], weight: ["300", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

// --- DONNÉES ---
const SOLUTIONS = [
  { id: "Onyx Catalog", icon: Smartphone, p: "Perte de temps sur WhatsApp.", s: "Catalogue digital avec lien de commande." },
  { id: "Onyx Devis", icon: Receipt, p: "Devis manuels trop lents.", s: "PDF pro généré en 60 secondes chrono." },
  { id: "Onyx Tiak", icon: Truck, p: "Zéro visibilité sur le cash livreur.", s: "Suivi logistique et encaissement live." },
  { id: "Onyx Stock", icon: Box, p: "Ruptures de stock surprises.", s: "Scan intelligent & alertes WhatsApp." },
  { id: "Onyx Menu", icon: Utensils, p: "Menus sales et erreurs de service.", s: "QR Menu interactif scannable." },
  { id: "Onyx Booking", icon: Calendar, p: "Rendez-vous oubliés (No-shows).", s: "Réservations avec paiement d'acompte." },
];

export default function OnyxElite() {
  const [q, setQ] = useState({ solo: 0, trio: 0, full: 10, premium: 0 });
  const wa = "221768102039";
  const link = (m: string) => `https://wa.me/${wa}?text=${encodeURIComponent(m)}`;

  const stats = useMemo(() => {
    const pr = { solo: 7500, trio: 17500, full: 30000, premium: 75000 };
    const m1 = (q.solo * pr.solo) + (q.trio * pr.trio) + (q.full * pr.full) + (q.premium * pr.premium);
    let total = 0;
    for (let i = 1; i <= 6; i++) { total += (m1 * 0.3) + ((i - 1) * m1 * 0.1); }
    return { m1: m1 * 0.3, total };
  }, [q]);

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none relative`}>
      <style jsx global>{`body{user-select:none;-webkit-user-select:none;}@media print{body{display:none!important;}}`}</style>
      
      {/* BACKGROUND PATTERN */}
      <div className="fixed inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: "url('https://i.ibb.co/chCcXT7p/back-site.png')", backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

      <div className="relative z-10">
        {/* NAV */}
        <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl">
          <div className="flex items-center gap-3">
            <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Logo" className="h-10 w-auto" />
            <span className={`${space.className} font-bold text-2xl tracking-tighter`}>ONYX OPS</span>
          </div>
          <button className="bg-black text-[#39FF14] px-6 py-2 rounded-full font-bold text-[10px] uppercase">Accès Hub</button>
        </nav>

        {/* HERO */}
        <header className="pt-20 pb-12 px-6 text-center max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-8 uppercase font-black text-[9px] tracking-widest">
            <span className="bg-zinc-100 px-3 py-1 rounded-full flex items-center gap-1"><Zap className="w-3 h-3 text-[#39FF14]"/> 6 SaaS</span>
            <span className="bg-zinc-100 px-3 py-1 rounded-full">7.500F/MOIS</span>
            <span className="bg-black text-[#39FF14] px-3 py-1 rounded-full">30% Commission</span>
          </div>
          <h1 className={`${space.className} text-5xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-8 uppercase`}>
            VOTRE BUSINESS EN <br/><span className="text-[#39FF14] italic underline decoration-black">MODE ÉLITE.</span>
          </h1>
          <p className="text-zinc-500 text-lg mb-10 max-w-3xl mx-auto">La suite complète d'outils pour PME sénégalaises. Gérez ventes, stocks et devis sur WhatsApp. <span className="block font-black text-black mt-2 text-sm uppercase italic">0 Engagement • 0 Coût Caché</span></p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#partenaires" className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl hover:scale-105 transition flex items-center gap-2 justify-center"><Briefcase className="w-4 h-4"/> Devenir Partenaire</a>
            <a href="#solutions" className="bg-black text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 justify-center hover:bg-zinc-800 transition"><LayoutGrid className="w-4 h-4 text-[#39FF14]"/> Découvrir Solutions</a>
          </div>
        </header>

        {/* SOLUTIONS */}
        <section id="solutions" className="py-20 px-6 max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SOLUTIONS.map((s, i) => (
            <div key={i} className="bg-white/80 border-2 border-zinc-50 p-8 rounded-[2.5rem] hover:border-[#39FF14] transition-all">
              <div className="bg-black text-[#39FF14] w-10 h-10 rounded-xl flex items-center justify-center mb-6"><s.icon className="w-5 h-5" /></div>
              <h3 className={`${space.className} text-xl font-bold mb-4 uppercase italic`}>{s.id}</h3>
              <p className="text-red-500 text-[10px] font-black uppercase mb-1">🚫 Douleur : {s.p}</p>
              <p className="text-zinc-800 text-sm font-semibold">✅ Solution : {s.s}</p>
            </div>
          ))}
        </section>

        {/* PRICING */}
        <section id="tarifs" className="py-20 bg-black text-white rounded-[4rem] mx-4 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className={`${space.className} text-4xl font-bold mb-16 uppercase italic`}>CHOISISSEZ VOTRE <span className="text-[#39FF14]">ARME.</span></h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-zinc-900/50 p-8 rounded-[3rem] border border-white/5 flex flex-col justify-between">
                <div><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase">Solo</p><div className={`${space.className} text-4xl font-bold mb-8 italic`}>7.500F</div><ul className="text-[11px] text-zinc-400 space-y-2 mb-8"><li>✔ 1 SaaS</li><li>✔ Support WhatsApp</li></ul></div>
                <a href={link("Bonjour, je veux COMMENCER (Solo 7.5k).")} className="bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase hover:bg-[#39FF14]">Commencer</a>
              </div>
              <div className="bg-zinc-800 p-8 rounded-[3rem] border-2 border-[#39FF14] scale-105 flex flex-col justify-between shadow-2xl">
                <div><p className="text-[10px] font-black text-[#39FF14] mb-4 uppercase">Pack Trio</p><div className={`${space.className} text-4xl font-bold mb-8 italic`}>17.500F</div><ul className="text-[11px] text-zinc-200 space-y-2 mb-8"><li>✔ 3 SaaS</li><li>✔ Gérant Formé</li></ul></div>
                <a href={link("Bonjour, je veux CHOISIR CE PACK (Trio 17.5k).")} className="bg-[#39FF14] text-black py-4 rounded-xl font-black text-[10px] uppercase">Choisir ce pack</a>
              </div>
              <div className="bg-zinc-900/50 p-8 rounded-[3rem] border border-white/5 flex flex-col justify-between">
                <div><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase">Pack Full</p><div className={`${space.className} text-4xl font-bold mb-8 italic`}>30.000F</div><ul className="text-[11px] text-zinc-400 space-y-2 mb-8"><li>✔ Les 6 SaaS</li><li>✔ Multi-boutiques</li></ul></div>
                <a href={link("Bonjour, je veux TOUT CHOISIR (Full 30k).")} className="bg-white text-black py-4 rounded-xl font-black text-[10px] uppercase hover:bg-[#39FF14]">Tout choisir</a>
              </div>
              <div className="bg-zinc-900/50 p-8 rounded-[3rem] border border-white/5 flex flex-col justify-between">
                <div><p className="text-[10px] font-black text-zinc-500 mb-4 uppercase">Premium</p><div className={`${space.className} text-4xl font-bold mb-8 text-red-500 italic`}>75.000F</div><ul className="text-[11px] text-zinc-400 space-y-2 mb-8"><li>✔ Studio IA</li><li>✔ Manager Dédié</li></ul></div>
                <a href={link("Bonjour, je veux CONTACTER pour l'offre Premium (75k).")} className="border border-white/20 text-white py-4 rounded-xl font-black text-[10px] uppercase hover:bg-white hover:text-black">Contacter</a>
              </div>
            </div>
          </div>
        </section>

        {/* PARTENAIRES & SIMULATEUR */}
        <section id="partenaires" className="py-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className={`${space.className} text-5xl font-black mb-8 uppercase italic leading-none`}>VOTRE <span className="text-[#39FF14]">RENTE</span> SÉNÉGALAISE.</h2>
            <div className="space-y-6">
              <div className="flex gap-4"><TrendingUp className="text-[#39FF14]"/><p className="font-black">30% COMMISSION M1 <span className="block text-zinc-400 text-xs font-medium">Cash immédiat à la signature.</span></p></div>
              <div className="flex gap-4"><Zap className="text-[#39FF14]"/><p className="font-black">10% RÉCURRENT À VIE <span className="block text-zinc-400 text-xs font-medium">Revenu mensuel par client actif.</span></p></div>
              <div className="flex gap-4"><Users className="text-[#39FF14]"/><p className="font-black">5% RÉSEAU AFFILIÉ <span className="block text-zinc-400 text-xs font-medium">Bonus sur les ventes de votre équipe.</span></p></div>
            </div>
          </div>
          <div className="bg-white border-4 border-black p-8 rounded-[3rem] shadow-2xl">
            <h3 className="font-black text-center uppercase mb-8 italic">Simulateur de Gains</h3>
            <div className="space-y-6 mb-10">
              {['solo', 'trio', 'full', 'premium'].map((p) => (
                <div key={p} className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] font-black uppercase"><span>{p}</span><span className="bg-[#39FF14] text-black px-2 rounded">{q[p as keyof typeof q]}</span></div>
                  <input type="range" min="0" max="30" value={q[p as keyof typeof q]} onChange={(e)=>setQ({...q, [p]:parseInt(e.target.value)})} className="w-full accent-black" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black p-4 rounded-2xl text-white text-center"><p className="text-[9px] font-bold text-zinc-500 uppercase">Gain M1</p><p className={`${space.className} text-lg font-bold text-[#39FF14]`}>{stats.m1.toLocaleString()} F</p></div>
              <div className="bg-[#39FF14] p-4 rounded-2xl border-2 border-black text-center text-black"><p className="text-[9px] font-bold opacity-50 uppercase">Total 6 Mois 💰</p><p className={`${space.className} text-lg font-bold`}>{stats.total.toLocaleString()} F</p></div>
            </div>
            <a href={link(`Partenaire Volume: S(${q.solo}) T(${q.trio}) F(${q.full}) P(${q.premium}).`)} className="mt-8 block text-center bg-black text-white py-4 rounded-xl font-black uppercase text-xs hover:bg-[#39FF14] hover:text-black transition">Postuler Maintenant</a>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-12 border-t border-zinc-100 bg-white/80 text-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3"><img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Logo" className="h-6 w-auto" /><p className="text-zinc-300 font-black text-[9px] uppercase tracking-widest italic">OnyxOps 2026 • Dakar Tech</p></div>
            <div className="flex gap-4 items-center font-bold text-xs text-zinc-500"><Lock className="w-4 h-4 text-zinc-200" /><a href="tel:+221768102039" className="hover:text-[#39FF14] underline underline-offset-4">(+221) 76 810 20 39</a></div>
          </div>
        </footer>
      </div>
    </div>
  );
}
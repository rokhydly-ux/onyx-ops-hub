"use client";
import React, { useState, useMemo } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { Smartphone, Receipt, Truck, Box, Utensils, Calendar, ArrowRight, TrendingUp, Users, Zap, CheckCircle2, AlertCircle, Lock, LayoutGrid, Briefcase } from "lucide-react";

const space = Space_Grotesk({ subsets: ["latin"], weight: ["300", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

export default function OnyxOpsElite() {
  const [qty, setQty] = useState({ solo: 0, trio: 0, full: 10, premium: 0 });
  const wa = "221768102039";
  const link = (m: string) => `https://wa.me/${wa}?text=${encodeURIComponent(m)}`;

  const stats = useMemo(() => {
    const p = { solo: 7500, trio: 17500, full: 30000, premium: 75000 };
    const m1Sales = (qty.solo * p.solo) + (qty.trio * p.trio) + (qty.full * p.full) + (qty.premium * p.premium);
    return { m1: m1Sales * 0.3, total: (m1Sales * 0.3 * 6) + (m1Sales * 0.1 * 15) };
  }, [qty]);

  const plans = [
    { n: "Solo", p: "7.500F", f: ["1 Micro-SaaS", "Support WhatsApp"], b: "Commencer", m: "Je veux Commencer (Solo 7.5k)", c: "bg-white text-black" },
    { n: "Trio", p: "17.500F", f: ["3 Micro-SaaS", "Formation Gérant"], b: "Choisir ce pack", m: "Je veux Choisir ce pack Trio (17.5k)", c: "bg-[#39FF14] text-black scale-105 border-2 border-[#39FF14]", pop: true },
    { n: "Full", p: "30.000F", f: ["Les 6 SaaS", "Multi-boutiques"], b: "Tout choisir", m: "Je veux Tout choisir avec le pack Full (30k)", c: "bg-white text-black" },
    { n: "Premium", p: "75.000F", f: ["Studio IA", "Manager Dédié"], b: "Contacter", m: "Je veux Contacter pour le Premium (75k)", c: "border border-white/20 text-white", pr: "text-red-500" }
  ];

  const solutions = [
    { id: "Onyx Catalog", i: Smartphone, d: "Perte de temps WhatsApp", s: "Catalogue digital pro" },
    { id: "Onyx Devis", i: Receipt, d: "Devis manuels lents", s: "PDF pro en 60s" },
    { id: "Onyx Tiak", i: Truck, d: "Zéro visibilité cash", s: "Suivi logistique live" },
    { id: "Onyx Stock", i: Box, d: "Ruptures surprises", s: "Scan & Alertes WhatsApp" },
    { id: "Onyx Menu", i: Utensils, d: "Menus sales / erreurs", s: "QR Menu interactif" },
    { id: "Onyx Booking", i: Calendar, d: "No-shows fréquents", s: "Réservations + Acomptes" }
  ];

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none relative overflow-x-hidden`}>
      <style jsx global>{`body{user-select:none;-webkit-user-select:none;}@media print{body{display:none!important;}}`}</style>
      <div className="fixed inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: "url('https://i.ibb.co/chCcXT7p/back-site.png')", backgroundRepeat: 'repeat', backgroundSize: '400px' }} />
      
      <div className="relative z-10">
        <nav className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto rounded-b-3xl">
          <div className="flex items-center gap-3"><img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx" className="h-10 w-auto" /><span className={`${space.className} font-bold text-2xl tracking-tighter`}>ONYX OPS</span></div>
          <button className="bg-black text-[#39FF14] px-6 py-2 rounded-full font-bold text-[10px] uppercase">Accès Hub</button>
        </nav>

        <header className="pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-10 text-[9px] font-black uppercase tracking-widest">
            <span className="bg-zinc-100 px-3 py-1 rounded-full flex items-center gap-1"><Zap className="w-3 h-3 text-[#39FF14]"/> 6 SaaS</span>
            <span className="bg-zinc-100 px-3 py-1 rounded-full">7500F/MOIS</span>
            <span className="bg-black text-[#39FF14] px-3 py-1 rounded-full shadow-lg">30% Commission</span>
          </div>
          <h1 className={`${space.className} text-5xl md:text-8xl font-bold leading-[0.9] tracking-tighter mb-8`}>DIGITALISEZ VOTRE <br/><span className="text-[#39FF14] italic underline decoration-black">PROPRE EMPIRE.</span></h1>
          <p className="text-zinc-600 text-lg md:text-xl max-w-4xl mx-auto mb-12">La suite complète d&apos;outils pour les commerces, PME et PMI sénégalaises. Gérez ventes, stocks et livraisons sur WhatsApp. <span className="block font-black text-black mt-4 text-sm uppercase italic text-center">0 engagement • 0 coût caché.</span></p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#partenaires" className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-2 justify-center"><Briefcase className="w-5 h-5"/> Devenir Partenaire</a>
            <a href="#solutions" className="bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 justify-center"><LayoutGrid className="w-5 h-5 text-[#39FF14]"/> Découvrir Solutions</a>
          </div>
        </header>

        <section id="solutions" className="py-24 px-6 max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((s, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm border-2 border-zinc-50 p-10 rounded-[3rem] hover:border-[#39FF14] transition-all">
              <div className="bg-black text-[#39FF14] w-12 h-12 rounded-2xl flex items-center justify-center mb-8"><s.i className="w-6 h-6" /></div>
              <h3 className={`${space.className} text-2xl font-bold mb-6 uppercase italic`}>{s.id}</h3>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-2xl border-l-4 border-red-500"><p className="text-[9px] font-black text-red-600 uppercase mb-1">Douleur</p><p className="text-xs font-semibold text-zinc-700">{s.d}</p></div>
                <div className="bg-zinc-50 p-4 rounded-2xl border-l-4 border-black"><p className="text-[9px] font-black text-black uppercase mb-1 text-[#39FF14]">Solution</p><p className="text-xs font-semibold text-zinc-800">{s.s}</p></div>
              </div>
            </div>
          ))}
        </section>

        <section id="tarifs" className="py-24 bg-black text-white rounded-[4rem] mx-4 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className={`${space.className} text-5xl font-bold mb-20 uppercase italic`}>VOTRE <span className="text-[#39FF14]">ARME.</span></h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {plans.map((p) => (
                <div key={p.n} className={`bg-zinc-900/50 p-10 rounded-[3rem] border border-white/5 flex flex-col justify-between ${p.pop ? 'bg-zinc-800 shadow-2xl' : ''}`}>
                  <div><p className="text-[10px] font-black text-zinc-500 mb-6 uppercase tracking-widest">{p.n}</p><div className={`${space.className} text-5xl font-bold mb-8 ${p.pr || ''}`}>{p.p}</div><ul className="text-xs space-y-3 mb-12 text-zinc-400">
                    {p.f.map(f => <li key={f}>✔ {f}</li>)}</ul></div>
                  <a href={link(p.m)} className={`py-5 rounded-2xl font-black text-[10px] uppercase transition ${p.c}`}>{p.b}</a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="partenaires" className="py-24 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className={`${space.className} text-6xl font-black mb-10 uppercase italic leading-none`}>VOTRE <span className="text-[#39FF14]">RENTE</span> 221.</h2>
            <div className="space-y-10">
              <div className="flex gap-6 items-start"><TrendingUp className="text-[#39FF14] shadow-lg"/><p className="font-black text-2xl uppercase">30% CASH M1<span className="block text-zinc-500 text-sm font-medium">Commission immédiate à la signature.</span></p></div>
              <div className="flex gap-6 items-start"><Zap className="text-[#39FF14]"/><p className="font-black text-2xl uppercase">10% RÉCURRENT<span className="block text-zinc-500 text-sm font-medium">Revenu automatique tant que le client paie.</span></p></div>
              <div className="flex gap-6 items-start"><Users className="text-[#39FF14]"/><p className="font-black text-2xl uppercase">5% RÉSEAU<span className="block text-zinc-500 text-sm font-medium">Bonus sur toutes les ventes de votre équipe.</span></p></div>
            </div>
          </div>
          <div className="bg-white border-4 border-black p-12 rounded-[4rem] shadow-2xl">
            <h3 className={`${space.className} text-2xl font-bold mb-10 text-center uppercase italic`}>Simulateur de Gains</h3>
            <div className="space-y-8 mb-12">
              {['solo', 'trio', 'full', 'premium'].map((k) => (
                <div key={k} className="flex flex-col gap-2">
                  <div className="flex justify-between text-[10px] font-black uppercase"><span>{k}</span><span className="bg-black text-[#39FF14] px-3 py-0.5 rounded-full">{qty[k as keyof typeof qty]}</span></div>
                  <input type="range" min="0" max="30" value={qty[k as keyof typeof qty]} onChange={(e)=>setQty({...qty,[k]:parseInt(e.target.value)})} className="w-full accent-[#39FF14]" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black p-6 rounded-[2rem] text-white text-center"><p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Gain M1</p><p className={`${space.className} text-2xl font-bold text-[#39FF14]`}>{stats.m1.toLocaleString()} F</p></div>
              <div className="bg-[#39FF14] p-6 rounded-[2rem] border-2 border-black text-center text-black shadow-xl"><p className="text-[10px] font-bold opacity-50 uppercase mb-2">Total 6 Mois 💰</p><p className={`${space.className} text-2xl font-bold`}>{stats.total.toLocaleString()} F</p></div>
            </div>
            <a href={link(`Objectif Partenaire: S(${qty.solo}) T(${qty.trio}) F(${qty.full}) P(${qty.premium})`)} className="mt-8 block text-center bg-black text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest hover:bg-[#39FF14] hover:text-black transition">Postuler Maintenant</a>
          </div>
        </section>

        <footer className="py-12 border-t border-zinc-100 bg-white/80 text-center">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-300">
            <div className="flex items-center gap-3"><img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx" className="h-6 w-auto" /><p className="font-black text-[9px] uppercase tracking-widest italic">OnyxOps 2026 • Dakar Tech</p></div>
            <div className="flex gap-4 items-center text-xs font-bold"><Lock className="w-4 h-4 text-zinc-100" /><a href="tel:+221768102039" className="hover:text-[#39FF14] underline underline-offset-4">(+221) 76 810 20 39</a></div>
          </div>
        </footer>
      </div>
    </div>
  );
}
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight, Activity, Target, Bot } from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function OnyxBoostLanding() {
  const router = useRouter();
  const waNumber = "221785338417";

  const handleWaClick = () => {
    const msg = "Bonjour l'équipe Onyx ! Je souhaite un audit gratuit de ma marque pour l'offre High-Ticket Onyx Boost.";
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#00E5FF]/30 pb-24 font-sans overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => router.push('/')} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-white hover:scale-105 transition-transform`}>
            ONYX<span className="text-[#00E5FF] drop-shadow-sm">BOOST</span>
         </button>
         
         <button onClick={() => router.push('/')} className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1 shadow-sm">
             <ChevronLeft size={14}/> Accueil
         </button>
      </nav>

      {/* 1. HERO SECTION & DIAGNOSTIC */}
      <section className="pt-20 pb-24 px-6 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00E5FF] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
         
         <div className="inline-flex items-center gap-2 bg-[#00E5FF]/10 border border-[#00E5FF]/20 text-[#00E5FF] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm relative z-10">
             <Target size={14} /> Agence Growth High-Ticket
         </div>
         
         <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.95] mb-8 text-white relative z-10`}>
            Vos produits méritent mieux qu'un compte <br/>
            <span className="text-zinc-600">Instagram mort.</span>
         </h1>
         
         <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed relative z-10">
            Passez de la gestion artisanale à la domination de votre marché. Un accompagnement premium pour les marques ambitieuses (Dès 150 000 F/Mois).
         </p>
         
         <button onClick={handleWaClick} className="bg-[#00E5FF] text-black px-10 py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(0,229,255,0.2)] flex items-center justify-center gap-3 mx-auto relative z-10">
            Faire auditer ma marque (Gratuit) <ArrowRight size={20} />
         </button>
      </section>

      {/* DOULEURS */}
      <section className="py-20 px-6 bg-black border-y border-zinc-900 relative z-10">
        <div className="max-w-6xl mx-auto">
           <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2rem] hover:border-[#00E5FF]/50 transition-all">
                 <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase mb-4 text-white`}>Vendre sur WhatsApp vous épuise</h3>
                 <p className="text-zinc-500 font-medium leading-relaxed">Vous répondez manuellement aux mêmes questions "C'est combien ?" à 3h du matin. Votre temps est phagocyté par le service client au lieu de la stratégie.</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2rem] hover:border-[#00E5FF]/50 transition-all">
                 <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase mb-4 text-white`}>Un joli site web ne suffit plus</h3>
                 <p className="text-zinc-500 font-medium leading-relaxed">Vous avez investi dans une boutique e-commerce. Beaucoup de visites, mais 0 panier validé. L'expérience d'achat n'est pas optimisée pour le client sénégalais.</p>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 p-10 rounded-[2rem] hover:border-[#00E5FF]/50 transition-all">
                 <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase mb-4 text-white`}>La visibilité n'est pas la rentabilité</h3>
                 <p className="text-zinc-500 font-medium leading-relaxed">Beaucoup de likes, beaucoup de partages, mais peu de cash en fin de mois. Vos campagnes publicitaires ne sont pas connectées à un vrai système de vente.</p>
              </div>
           </div>
        </div>
      </section>

      {/* 2. L'ANTI-AGENCE */}
      <section className="py-32 px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
           <h2 className={`${spaceGrotesk.className} text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 text-white`}>
              Nous sommes <br/><span className="text-[#00E5FF]">L'Anti-Agence.</span>
           </h2>
           <p className="text-zinc-400 text-lg md:text-xl font-medium leading-relaxed mb-12">
              Nous ne sommes pas des théoriciens du marketing. Nous sommes l'équipe derrière l'écosystème <strong className="text-white">Onyx Hub</strong>. Contrairement aux agences classiques qui vous livrent un site Shopify nu et vous souhaitent bonne chance, nous connectons vos publicités Meta/TikTok <strong className="text-[#00E5FF]">directement à votre écosystème de vente, de stock et de livraison.</strong>
           </p>
        </div>
      </section>

      {/* 3. CE QU'ON CONSTRUIT */}
      <section className="py-24 px-6 bg-zinc-950 border-t border-zinc-900 relative z-10">
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-20">
              <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter text-white`}>
                 Ce que nous <span className="text-[#00E5FF]">construisons</span> pour vous.
              </h2>
           </div>

           <div className="grid md:grid-cols-2 gap-12">
              <div className="bg-black border border-zinc-800 p-10 md:p-14 rounded-[3rem] relative overflow-hidden group hover:border-[#00E5FF]/50 transition-all">
                 <div className="w-16 h-16 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-8 border border-[#00E5FF]/20 group-hover:scale-110 transition-transform">
                    <Bot size={32} />
                 </div>
                 <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6 text-white`}>La Vendeuse IA Onyx</h3>
                 <p className="text-zinc-400 font-medium leading-relaxed mb-6">
                    Une intelligence artificielle hyper-personnalisée qui segmente vos prospects et les relance 24h/24 et 7j/7 sur WhatsApp. Elle qualifie les leads, réponds aux objections et pousse vers la vente sans que vous n'ayez à lever le petit doigt.
                 </p>
              </div>

              <div className="bg-black border border-zinc-800 p-10 md:p-14 rounded-[3rem] relative overflow-hidden group hover:border-[#00E5FF]/50 transition-all">
                 <div className="w-16 h-16 bg-[#00E5FF]/10 text-[#00E5FF] rounded-2xl flex items-center justify-center mb-8 border border-[#00E5FF]/20 group-hover:scale-110 transition-transform">
                    <Activity size={32} />
                 </div>
                 <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-6 text-white`}>Écosystème de Rentabilité</h3>
                 <p className="text-zinc-400 font-medium leading-relaxed mb-6">
                    Pas juste de la pub Meta/TikTok. Un suivi strict de votre <strong className="text-white">Marge Nette</strong>. Nous intégrons Onyx Jaay et Onyx Tiak à vos tunnels de vente pour que chaque CFA dépensé en publicité se transforme en colis livré et encaissé de manière mesurable.
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-32 px-6 text-center relative z-10">
         <div className="max-w-3xl mx-auto">
            <h2 className={`${spaceGrotesk.className} text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 text-white`}>
               Prêt à dominer <br/>votre marché ?
            </h2>
            <p className="text-zinc-500 font-bold mb-10 text-lg uppercase tracking-widest">
               Accompagnement Premium • À partir de 150 000 F / Mois
            </p>
            <button onClick={handleWaClick} className="bg-[#00E5FF] text-black px-12 py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(0,229,255,0.2)]">
               Faire auditer ma marque (Gratuit)
            </button>
         </div>
      </section>
    </main>
  );
}
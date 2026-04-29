"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight, Sparkles, CheckCircle, Zap, Image as ImageIcon, Camera, Wand2 } from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function OnyxPubLanding() {
  const router = useRouter();
  const waNumber = "221785338417";

  const handleWaClick = (plan: string) => {
    const msg = `Bonjour l'équipe Onyx ! Je souhaite lancer ma machine à cash avec l'offre ${plan}.`;
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#23a9dc]/30 pb-24 font-sans overflow-x-hidden">
      {/* STYLES GLITCH HOVER */}
      <style dangerouslySetInnerHTML={{__html: `
        .glitch-hover:hover {
          animation: glitch-skew 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both infinite;
        }
        .glitch-hover:hover .glitch-text {
          animation: glitch-anim 0.2s linear infinite;
        }
        @keyframes glitch-skew {
          0% { transform: skew(0deg); }
          20% { transform: skew(-10deg); }
          40% { transform: skew(10deg); }
          60% { transform: skew(-5deg); }
          80% { transform: skew(5deg); }
          100% { transform: skew(0deg); }
        }
        @keyframes glitch-anim {
          0% { text-shadow: 2px 0 #23a9dc, -2px 0 #ff00ff; }
          25% { text-shadow: -2px 0 #23a9dc, 2px 0 #ff00ff; }
          50% { text-shadow: 2px 0 #ff00ff, -2px 0 #23a9dc; }
          75% { text-shadow: -2px 0 #ff00ff, 2px 0 #23a9dc; }
          100% { text-shadow: 2px 0 #23a9dc, -2px 0 #ff00ff; }
        }
      `}} />

      {/* NAVBAR */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => router.push('/')} className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-white hover:scale-105 transition-transform`}>
            ONYX<span className="text-[#23a9dc] drop-shadow-sm">PUB</span>
         </button>
         
         <button onClick={() => router.push('/')} className="bg-zinc-900 border border-zinc-800 text-white px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-white hover:text-black transition-colors flex items-center gap-1 shadow-sm">
             <ChevronLeft size={14}/> Accueil
         </button>
      </nav>

      {/* SECTION 1 : HERO SECTION */}
      <section className="pt-20 pb-24 px-6 text-center max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 relative">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#23a9dc] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
         
         <div className="inline-flex items-center gap-2 bg-[#23a9dc]/10 border border-[#23a9dc]/20 text-[#23a9dc] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm relative z-10">
             <Sparkles size={14} /> La promesse OnyxPub
         </div>
         
         <h1 className={`${spaceGrotesk.className} glitch-hover text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.95] mb-8 text-white relative z-10`}>
            <span className="glitch-text inline-block">
               Transformez une simple photo WhatsApp en <br className="hidden md:block"/>
               <span className="text-[#23a9dc]">machine à cash en 48h.</span>
            </span>
         </h1>
         
         <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-3xl mx-auto mb-12 leading-relaxed relative z-10">
            Envoyez-nous les photos brutes de vos produits. Nous générons les visuels, configurons le Bot WhatsApp vendeur, et lançons vos publicités. <span className="text-[#39FF14] font-black drop-shadow-sm">Budget pub inclus.</span>
         </p>
         
         <button onClick={() => handleWaClick("OnyxPub")} className="bg-[#23a9dc] text-black px-10 py-6 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(35,169,220,0.2)] flex items-center justify-center gap-3 mx-auto relative z-10">
            Lancer ma machine <ArrowRight size={20} />
         </button>
      </section>

      {/* SECTION 2 : DÉMO VISUELLE */}
      <section className="py-24 px-6 bg-black border-y border-zinc-900 relative z-10">
         <div className="max-w-6xl mx-auto text-center">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-16`}>
               1 Photo Brute. <br className="md:hidden" /><span className="text-[#23a9dc]">Des variations infinies pour l'algorithme.</span>
            </h2>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-16">
               {/* GAUCHE : Photo originale */}
               <div className="flex flex-col items-center w-full lg:w-1/3">
                  <div className="w-full aspect-square bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-3xl p-4 flex items-center justify-center relative shadow-lg">
                     <img src="https://i.ibb.co/BVKC5TDN/sac.png" alt="Sac photo originale" className="w-3/4 h-3/4 object-contain opacity-90 drop-shadow-2xl" />
                  </div>
                  <p className="mt-4 text-zinc-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                     <ImageIcon size={16} /> Votre photo WhatsApp
                  </p>
               </div>

               {/* CENTRE : Flèche/Sparkles */}
               <div className="flex justify-center items-center">
                  <div className="w-16 h-16 bg-[#23a9dc]/20 text-[#23a9dc] rounded-full flex items-center justify-center border border-[#23a9dc]/30 shadow-[0_0_30px_rgba(35,169,220,0.4)] animate-pulse">
                     <Sparkles size={32} className="animate-[spin_4s_linear_infinite]" />
                  </div>
               </div>

               {/* DROITE : Variations */}
               <div className="w-full lg:w-1/2 flex flex-col sm:flex-row gap-4">
                  {/* Variation 1 */}
                  <div className="flex-1 flex flex-col items-center">
                     <div className="w-full aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#23a9dc]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img src="https://i.ibb.co/BVKC5TDN/sac.png" alt="Angle Luxe" className="w-2/3 h-2/3 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] grayscale-[20%] brightness-110" />
                     </div>
                     <p className="mt-4 text-zinc-300 font-bold text-xs uppercase tracking-wider">Angle Luxe</p>
                  </div>
                  {/* Variation 2 */}
                  <div className="flex-1 flex flex-col items-center">
                     <div className="w-full aspect-square bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#39FF14]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img src="https://i.ibb.co/BVKC5TDN/sac.png" alt="Angle Lifestyle" className="w-2/3 h-2/3 object-contain drop-shadow-xl saturate-150 contrast-125" />
                     </div>
                     <p className="mt-4 text-zinc-300 font-bold text-xs uppercase tracking-wider">Angle Lifestyle</p>
                  </div>
                  {/* Variation 3 */}
                  <div className="flex-1 flex flex-col items-center">
                     <div className="w-full aspect-square bg-gradient-to-bl from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img src="https://i.ibb.co/BVKC5TDN/sac.png" alt="Angle Urgence" className="w-3/4 h-3/4 object-contain drop-shadow-2xl sepia-[30%]" />
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase animate-bounce">-50%</div>
                     </div>
                     <p className="mt-4 text-zinc-300 font-bold text-xs uppercase tracking-wider">Angle Urgence</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* SECTION 3 : PRICING */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
           <div className="text-center mb-16">
              <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4`}>
                 Un investissement <span className="text-[#39FF14]">instantanément rentable.</span>
              </h2>
              <p className="text-zinc-500 font-bold text-lg">Zéro blabla, que des résultats.</p>
           </div>

           <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Carte 1 : OnyxPub */}
              <div className="bg-zinc-900 border border-zinc-800 p-8 md:p-10 rounded-[3rem] hover:border-zinc-700 transition-all flex flex-col h-full">
                 <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-300 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-max">
                    L'Agence 100% IA
                 </div>
                 <h3 className={`${spaceGrotesk.className} text-4xl font-black text-white mb-2 uppercase`}>OnyxPub</h3>
                 <p className="text-zinc-400 font-medium text-sm mb-6 h-12">Pour le prix d'un gardien de nuit, vous avez une agence marketing et un vendeur 24h/24.</p>
                 <div className="text-4xl md:text-5xl font-black text-white mb-8 italic">
                    39 900 F <span className="text-sm text-zinc-500 font-normal not-italic">/ mois</span>
                 </div>
                 
                 <ul className="space-y-4 mb-10 flex-1 text-sm font-bold">
                    <li className="flex items-start gap-3 text-white">
                       <Zap size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                       <span><span className="text-[#39FF14]">10 000 FCFA de budget pub INCLUS</span></span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>8 vidéos/images IA par mois</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Traitement depuis vos photos WhatsApp</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Bot WhatsApp avancé (relance panier)</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-300">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Gestion Meta Ads</span>
                    </li>
                 </ul>

                 <button onClick={() => handleWaClick("OnyxPub")} className="w-full bg-zinc-800 text-white hover:bg-zinc-700 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all">
                    Sélectionner OnyxPub
                 </button>
              </div>

              {/* Carte 2 : OnyxPub Pro */}
              <div className="bg-black border-[3px] border-[#23a9dc] shadow-[0_0_40px_rgba(35,169,220,0.25)] p-8 md:p-10 rounded-[3rem] transform md:scale-105 transition-all flex flex-col h-full relative z-10">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#23a9dc] text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                    <Sparkles size={14}/> Recommandé
                 </div>
                 <div className="inline-flex items-center gap-2 bg-[#23a9dc]/10 text-[#23a9dc] border border-[#23a9dc]/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 w-max mt-2">
                    Le VIP Hybride
                 </div>
                 <h3 className={`${spaceGrotesk.className} text-4xl font-black text-white mb-2 uppercase`}>OnyxPub <span className="text-[#23a9dc]">Pro</span></h3>
                 <p className="text-zinc-400 font-medium text-sm mb-6 h-12">L'écosystème complet. Du tournage terrain à la vente automatisée.</p>
                 <div className="text-4xl md:text-5xl font-black text-white mb-8 italic">
                    59 900 F <span className="text-sm text-zinc-500 font-normal not-italic">/ mois</span>
                 </div>
                 
                 <ul className="space-y-4 mb-10 flex-1 text-sm font-bold">
                    <li className="flex items-start gap-3 text-white">
                       <Zap size={18} className="text-[#39FF14] shrink-0 mt-0.5" />
                       <span><span className="text-[#39FF14]">15 000 FCFA de budget pub INCLUS</span></span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-200">
                       <Camera size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>1 déplacement/mois (pour 5 vidéos réelles)</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-200">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>10 créas IA pour l'A/B testing</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-200">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Bot WhatsApp Premium</span>
                    </li>
                    <li className="flex items-start gap-3 text-zinc-200">
                       <CheckCircle size={18} className="text-[#23a9dc] shrink-0 mt-0.5" />
                       <span>Gestion Meta Ads experte</span>
                    </li>
                 </ul>

                 <button onClick={() => handleWaClick("OnyxPub Pro")} className="w-full bg-[#23a9dc] text-black hover:bg-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg flex justify-center items-center gap-2">
                    Passer au niveau Pro <ArrowRight size={18}/>
                 </button>
              </div>
           </div>
        </div>
      </section>
    </main>
  );
}
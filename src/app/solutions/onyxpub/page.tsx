"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ArrowRight, Sparkles, CheckCircle, Zap, Image as ImageIcon, Camera, Wand2, X, Send, MessageSquare, ChevronDown } from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

const FAQ_DATA = [
  { question: "Le budget pub est-il vraiment inclus chaque mois ?", answer: "Oui ! Par exemple, avec l'offre standard à 39 900F, nous réinvestissons directement 10 000 FCFA sur Meta Ads (Facebook/Instagram) pour lancer vos campagnes publicitaires." },
  { question: "Comment se passe la génération de visuels par l'IA ?", answer: "Prenez simplement vos produits en photo avec votre smartphone (de préférence sur un fond neutre). Envoyez-les sur notre WhatsApp, et notre intelligence artificielle s'occupe de les transformer en véritables affiches publicitaires haut de gamme pour l'e-commerce." },
  { question: "Combien de temps avant de voir les premiers résultats ?", answer: "La mise en place initiale de la machine prend environ 48h. Dès que vos publicités sont validées par Meta, les premiers messages et interactions de clients arrivent directement sur votre numéro WhatsApp." },
  { question: "Dois-je m'engager sur plusieurs mois ?", answer: "Non. Les abonnements OnyxPub sont mensuels et sans engagement de durée. Notre seul but est que la rentabilité immédiate générée vous convainque de continuer mois après mois." },
  { question: "Que fait le Bot WhatsApp exactement ?", answer: "Le Bot agit comme votre vendeur 24h/24. Il accueille instantanément les prospects venant des publicités, répond aux questions fréquentes, qualifie le besoin, et vous aide à conclure la vente." }
];

export default function OnyxPubLanding() {
  const router = useRouter();
  const waNumber = "221785338417";

  // Lika Chat states
  const [isLikaChatOpen, setIsLikaChatOpen] = useState(false);
  const [userReply, setUserReply] = useState("");
  const [likaMessages, setLikaMessages] = useState<{sender: 'bot'|'client', text: string}[]>([
    { sender: 'bot', text: "Salut ! Je suis Lika, experte en publicité. Prête à transformer tes photos en machine à cash ?" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // FAQ states
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [likaMessages, isLikaChatOpen]);

  const handleLikaSend = () => {
    if (!userReply.trim()) return;
    setLikaMessages(prev => [...prev, { sender: 'client', text: userReply }]);
    const currentReply = userReply;
    setUserReply("");

    setTimeout(() => {
       let botResponse = "C'est une excellente question ! Avec OnyxPub, on génère des visuels pros et on gère les pubs pour toi. Tu as une question sur le budget ou la méthode ?";
       const lowerReply = currentReply.toLowerCase();
       if (lowerReply.includes('prix') || lowerReply.includes('tarif') || lowerReply.includes('combien')) botResponse = "L'offre standard est à 39 900 F/mois (budget pub inclus !), et l'offre Pro à 59 900 F/mois avec un shooting terrain.";
       else if (lowerReply.includes('photo') || lowerReply.includes('whatsapp') || lowerReply.includes('comment')) botResponse = "Tu nous envoies juste des photos simples sur WhatsApp, et notre IA s'occupe de créer les versions Luxe, Lifestyle, etc.";
       else if (lowerReply.includes('budget') || lowerReply.includes('pub') || lowerReply.includes('facebook')) botResponse = "On inclut directement le budget de la publicité Facebook/Insta dans nos abonnements ! C'est 100% clé en main.";

       setLikaMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    }, 1000);
  };

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
        @keyframes neon-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(35,169,220,0.2); border-color: rgba(35,169,220,0.4); }
          50% { box-shadow: 0 0 50px rgba(35,169,220,0.8), inset 0 0 10px rgba(35,169,220,0.3); border-color: #23a9dc; }
        }
        .neon-border {
          animation: neon-pulse 3s ease-in-out infinite;
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
         
         {/* NOUVEAU: MAIN VIDEO DEMO */}
         <div className="relative mx-auto w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(35,169,220,0.3)] mb-12 z-10 border-[4px] border-zinc-800 bg-zinc-900">
            <video 
               src="https://res.cloudinary.com/dtr2wtoty/video/upload/v1777478457/DEMO_SAC_MARRON_emxajn.mp4" 
               autoPlay loop muted playsInline 
               className="w-full h-full object-cover"
            ></video>
         </div>
         
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
               1 Photo Brute. <br className="md:hidden" /><span className="text-[#23a9dc]">Variations infinies pour l'algorithme.</span>
            </h2>

            <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mb-12">
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
               <div className="flex justify-center items-center shrink-0">
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
                        <img src="https://i.ibb.co/Kx2b19xV/SAC-OUVERT.png" alt="Angle Luxe" className="w-full h-full object-cover" />
                     </div>
                     <p className="mt-4 text-zinc-300 font-bold text-[10px] sm:text-xs text-center uppercase tracking-wider">Angle Luxe (Détail Ouvert)</p>
                  </div>
                  {/* Variation 2 */}
                  <div className="flex-1 flex flex-col items-center">
                     <div className="w-full aspect-square bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-[#39FF14]/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img src="https://i.ibb.co/hRqbm8vY/DOS-SAC.png" alt="Angle Lifestyle" className="w-full h-full object-cover" />
                     </div>
                     <p className="mt-4 text-zinc-300 font-bold text-[10px] sm:text-xs text-center uppercase tracking-wider">Angle Lifestyle (Vue de Dos)</p>
                  </div>
                  {/* Variation 3 */}
                  <div className="flex-1 flex flex-col items-center">
                     <div className="w-full aspect-square bg-gradient-to-bl from-zinc-800 to-zinc-900 border border-zinc-700 rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group">
                        <div className="absolute inset-0 bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <img src="https://i.ibb.co/NnjPZzng/BAS-SAC.png" alt="Angle Urgence" className="w-full h-full object-cover" />
                        <div className="absolute top-2 right-2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded uppercase animate-pulse shadow-md">STOCK LIMITÉ</div>
                     </div>
                     <p className="mt-4 text-zinc-300 font-bold text-[10px] sm:text-xs text-center uppercase tracking-wider">Angle Urgence (Structure Base)</p>
                  </div>
               </div>
            </div>

            <div className="mt-12 text-zinc-400 font-medium text-lg max-w-3xl mx-auto bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-inner">
               Nourrir l'algorithme Meta avec des angles psychologiques différents (Luxe, Urgence, Lifestyle) pour trouver instantanément celui qui fait cliquer vos clients.
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
                       <span className="flex items-center flex-wrap gap-2 text-[#39FF14]">
                          10 000 FCFA de budget pub INCLUS
                          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLfm0ooWZDodEBD2zlKPK3xt37ot4lUZHIBw&s" alt="Meta Ads" className="h-4 w-auto rounded-[2px] object-contain inline-block bg-white" />
                       </span>
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
              <div className="bg-black border-[3px] border-[#23a9dc] p-8 md:p-10 rounded-[3rem] transform md:scale-105 transition-all flex flex-col h-full relative z-10 neon-border">
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
                       <span className="flex items-center flex-wrap gap-2 text-[#39FF14]">
                          15 000 FCFA de budget pub INCLUS
                          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLfm0ooWZDodEBD2zlKPK3xt37ot4lUZHIBw&s" alt="Meta Ads" className="h-4 w-auto rounded-[2px] object-contain inline-block bg-white" />
                       </span>
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

      {/* SECTION 4 : FAQ */}
      <section className="py-24 px-6 bg-black relative z-10 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4`}>Questions <span className="text-[#23a9dc]">Fréquentes</span></h2>
            <p className="text-zinc-500 font-bold max-w-2xl mx-auto text-lg">Tout ce que vous devez savoir avant de lancer votre machine à cash.</p>
          </div>
          <div className="space-y-4">
            {FAQ_DATA.map((item, index) => (
              <div key={index} className={`bg-zinc-900/50 border rounded-[2rem] p-6 transition-all duration-300 ${openFaq === index ? 'border-[#23a9dc]' : 'border-zinc-800'}`}>
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <h3 className="font-black text-lg uppercase tracking-tight text-white">{item.question}</h3>
                  <div className={`p-2 rounded-full transition-transform duration-300 shrink-0 ${openFaq === index ? 'bg-[#23a9dc] text-black rotate-180' : 'bg-zinc-800 text-zinc-400'}`}>
                    <ChevronDown size={20} />
                  </div>
                </button>
                <div className={`grid transition-all duration-300 ease-in-out ${openFaq === index ? 'grid-rows-[1fr] opacity-100 pt-4' : 'grid-rows-[0fr] opacity-0'}`}>
                  <div className="overflow-hidden">
                    <p className={`text-zinc-400 font-medium leading-relaxed pr-8 transition-transform duration-500 ${openFaq === index ? 'translate-y-0' : '-translate-y-3'}`}>{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOATING LIKA MASCOT */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end animate-in slide-in-from-right-8">
         <style dangerouslySetInnerHTML={{__html: `
            @keyframes float-lika {
              0% { transform: translateY(0px); }
              50% { transform: translateY(-12px); }
              100% { transform: translateY(0px); }
            }
            .lika-float {
              animation: float-lika 3.5s ease-in-out infinite;
            }
         `}} />
         
         {isLikaChatOpen ? (
            <div className="bg-black rounded-[2rem] shadow-[0_0_40px_rgba(35,169,220,0.3)] border-2 border-[#23a9dc] p-0 mb-4 w-[340px] h-[450px] flex flex-col animate-in zoom-in duration-300 overflow-hidden pointer-events-auto">
               <div className="bg-zinc-900 p-4 flex justify-between items-center border-b border-zinc-800">
                  <div className="flex items-center gap-3">
                     <div className="relative">
                        <img src="/lika-avatar.png" alt="Lika" onError={(e: any) => e.target.src = 'https://i.ibb.co/B5HhnTjw/La-mascotte-LIKA-202604121725.jpg'} className="w-10 h-10 rounded-full object-cover border border-[#23a9dc]" />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#23a9dc] rounded-full border border-black animate-pulse"></div>
                     </div>
                     <div><p className="text-[#23a9dc] font-black uppercase text-xs">Lika - Experte Ads</p></div>
                  </div>
                  <button onClick={() => setIsLikaChatOpen(false)} className="text-zinc-400 hover:text-white transition"><X size={18}/></button>
               </div>
               
               <div className="flex-1 bg-black p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar">
                  {likaMessages.map((msg, i) => (
                     <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                        <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? 'bg-zinc-800 text-white border border-zinc-700 rounded-tl-none shadow-sm' : 'bg-[#23a9dc] text-black rounded-tr-none shadow-md'}`}>
                           {msg.text}
                        </div>
                     </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>

               <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex gap-2">
                  <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLikaSend()} placeholder="Poser une question..." className="flex-1 bg-black border border-zinc-800 text-white rounded-xl px-4 outline-none text-sm font-bold focus:border-[#23a9dc] transition-colors" />
                  <button onClick={handleLikaSend} className="bg-[#23a9dc] p-3 rounded-xl text-black hover:scale-105 transition"><Send size={18}/></button>
               </div>
            </div>
         ) : (
            <div className="bg-zinc-900 text-white p-4 rounded-2xl rounded-br-none shadow-2xl mb-4 max-w-xs relative border border-[#23a9dc]/50 pointer-events-none">
               <p className="text-xs font-black leading-relaxed">Salut ! Moi c'est Lika. Une question sur l'offre OnyxPub ?</p>
               <div className="absolute -bottom-2 right-4 w-4 h-4 bg-zinc-900 border-b border-r border-[#23a9dc]/50 transform rotate-45"></div>
            </div>
         )}
         
         {!isLikaChatOpen && (
           <button onClick={() => setIsLikaChatOpen(true)} className="lika-float relative group pointer-events-auto cursor-pointer focus:outline-none">
             <img src="/lika-avatar.png" alt="Lika" onError={(e: any) => e.target.src = 'https://i.ibb.co/B5HhnTjw/La-mascotte-LIKA-202604121725.jpg'} className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#23a9dc] shadow-[0_0_25px_rgba(35,169,220,0.5)] object-cover group-hover:scale-110 transition-transform bg-zinc-900" />
             <div className="absolute top-1 right-1 bg-red-500 w-5 h-5 rounded-full border-2 border-black animate-pulse shadow-md flex items-center justify-center">
                <MessageSquare size={10} className="text-white" />
             </div>
           </button>
         )}
      </div>

    </main>
  );
}
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Target, Zap, Briefcase, TrendingUp, Mic, ArrowRight, MapPin, CheckCircle, LogIn } from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

const spaceGrotesk = { className: "font-sans" };

export default function CommercialRecruitmentPage() {
  const router = useRouter();
  const waNumber = "221762230000";

  const handleApplyClick = () => {
    const msg = "Bonjour OnyxHub ! Voici ma candidature pour le poste de Développeur Commercial Terrain. Je vous envoie mon CV et ma note vocale tout de suite ! 🚀";
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-[#39FF14]/30 font-sans overflow-x-hidden pb-24 relative">
      <InteractiveParticles themeColor="#39FF14" />
      
      {/* HEADER AVEC BOUTON LOGIN POUR LES AGENTS ACTIFS */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-50 max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#39FF14] text-black font-black flex items-center justify-center rounded-xl text-xl">O</div>
          <span className={`${spaceGrotesk.className} font-black text-xl tracking-tighter uppercase hidden sm:block`}>Onyx Hub</span>
        </div>
        <button onClick={() => router.push('/login')} className="bg-zinc-900 border border-zinc-800 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors flex items-center gap-2 shadow-lg">
          <LogIn size={14}/> Déjà membre ? Connexion
        </button>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="inline-flex items-center gap-2 bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></span>
          Recrutement Ouvert
        </div>
        
        <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.95] mb-6 text-white`}>
          Devenez <span className="text-[#39FF14]">Closer Terrain</span>. <br/>Évoluez Manager.
        </h1>
        
        <p className="text-zinc-400 text-lg md:text-xl font-medium mb-10 leading-relaxed">
          Onyx Hub est le nouveau Système d'Exploitation du commerce africain. Rejoignez l'élite de la vente B2B/B2C à Dakar et construisez votre plan de carrière.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
           <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 px-5 py-3 rounded-2xl flex items-center gap-3">
              <MapPin className="text-[#39FF14]" size={20}/>
              <div className="text-left"><p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Zone</p><p className="text-sm font-black uppercase">Dakar (QG Grand Yoff)</p></div>
           </div>
           <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 px-5 py-3 rounded-2xl flex items-center gap-3">
              <Briefcase className="text-[#39FF14]" size={20}/>
              <div className="text-left"><p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Contrat</p><p className="text-sm font-black uppercase">Freelance ➔ CDI/CDD</p></div>
           </div>
        </div>

        <button onClick={handleApplyClick} className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black md:text-base uppercase tracking-widest hover:bg-white hover:scale-105 transition-all shadow-[0_20px_40px_rgba(57,255,20,0.2)] flex items-center justify-center gap-3 mx-auto">
          Postuler Maintenant <Mic size={20} className="animate-pulse" />
        </button>
      </section>

      <div className="max-w-5xl mx-auto px-6 relative z-10 space-y-6">
        
        {/* VOTRE MISSION */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-8 md:p-12 rounded-[3rem] hover:border-zinc-700 transition-colors">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-black rounded-xl text-[#39FF14]"><Target size={24}/></div>
              <h2 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase`}>Votre Mission</h2>
           </div>
           <p className="text-zinc-400 font-medium text-lg mb-6 leading-relaxed">
              Vous n'êtes pas là pour vendre un "gadget technologique", vous vendez de la croissance.
           </p>
           <ul className="space-y-4">
              <li className="flex gap-4 items-start"><CheckCircle className="text-[#39FF14] shrink-0 mt-1" size={20} /> <span className="text-zinc-300 font-medium">Démarcher physiquement les boutiques, marchés, salons et restaurants de Dakar.</span></li>
              <li className="flex gap-4 items-start"><CheckCircle className="text-[#39FF14] shrink-0 mt-1" size={20} /> <span className="text-zinc-300 font-medium">Faire comprendre aux commerçants que le statut WhatsApp limite leurs revenus.</span></li>
              <li className="flex gap-4 items-start"><CheckCircle className="text-[#39FF14] shrink-0 mt-1" size={20} /> <span className="text-zinc-300 font-medium">Leur vendre la méthode Onyx (La Visibilité via nos formations + La Conversion via notre outil).</span></li>
              <li className="flex gap-4 items-start"><CheckCircle className="text-[#39FF14] shrink-0 mt-1" size={20} /> <span className="text-zinc-300 font-medium">Installer leur "1er Mois Offert" sur place et assurer le suivi pour le Mois 2.</span></li>
           </ul>
        </div>

        {/* PROFIL RECHERCHÉ */}
        <div className="bg-zinc-900/50 backdrop-blur-md border border-zinc-800 p-8 md:p-12 rounded-[3rem] hover:border-zinc-700 transition-colors">
           <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-black rounded-xl text-[#39FF14]"><Zap size={24}/></div>
              <h2 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase`}>Profil & Mindset</h2>
           </div>
           <div className="grid md:grid-cols-2 gap-8">
              <div>
                 <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Formation & Expérience</h3>
                 <p className="text-zinc-400 font-medium leading-relaxed">Bac+2/3 en Commerce ou Vente. 1 à 3 ans d'expérience confirmée dans la vente terrain, prospection directe B2B ou services digitaux au Sénégal.</p>
              </div>
              <div>
                 <h3 className="text-white font-black uppercase tracking-widest text-sm mb-2">Compétences</h3>
                 <p className="text-zinc-400 font-medium leading-relaxed">Excellente présentation. Maîtrise parfaite du Français et du Wolof pour négocier. Vous comprenez les réseaux sociaux et le e-commerce.</p>
              </div>
              <div className="md:col-span-2 bg-black border border-zinc-800 p-6 rounded-2xl">
                 <h3 className="text-[#39FF14] font-black uppercase tracking-widest text-sm mb-2">Mindset de Closer</h3>
                 <p className="text-zinc-300 font-medium leading-relaxed">Vous êtes un "Hustler". Prendre 10 refus ne vous fait pas peur, car vous savez que le 11ème est le bon.</p>
              </div>
           </div>
        </div>

        {/* RÉMUNÉRATION & ÉVOLUTION */}
        <div className="bg-black border border-[#39FF14]/30 p-8 md:p-12 rounded-[3rem] shadow-[0_0_50px_rgba(57,255,20,0.1)] relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14] opacity-[0.05] rounded-full blur-3xl pointer-events-none"></div>
           <div className="flex items-center gap-4 mb-8 relative z-10">
              <div className="p-3 bg-[#39FF14]/10 rounded-xl text-[#39FF14]"><TrendingUp size={24}/></div>
              <h2 className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black uppercase`}>Rémunération & Carrière</h2>
           </div>
           
           <div className="space-y-6 relative z-10">
              <div className="border-l-2 border-[#39FF14] pl-6">
                 <h3 className="text-white font-black uppercase text-lg mb-2">1. Phase de Lancement (Mois 1 à 3)</h3>
                 <p className="text-zinc-400 font-medium leading-relaxed mb-2">
                    Prime de déplacement garantie de <strong className="text-[#39FF14]">75 000 FCFA/mois</strong> + Commissions agressives (<strong className="text-white">30%</strong> du 1er mois + <strong className="text-white">10%</strong> sur tous les réabonnements à vie).
                 </p>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Objectif : 20 activations / mois</p>
              </div>
              <div className="border-l-2 border-zinc-700 pl-6">
                 <h3 className="text-white font-black uppercase text-lg mb-2">2. Phase de Titularisation (Mois 4+)</h3>
                 <p className="text-zinc-400 font-medium leading-relaxed">Si vos objectifs sont atteints, vous signez un contrat fixe (CDI/CDD). Vous intégrez physiquement notre QG à Grand Yoff.</p>
              </div>
              <div className="border-l-2 border-zinc-700 pl-6">
                 <h3 className="text-white font-black uppercase text-lg mb-2">3. Évolution (Manager)</h3>
                 <p className="text-zinc-400 font-medium leading-relaxed">Vous devenez notre relais officiel "Chef des Ventes", chargé de superviser et recruter notre réseau d'Ambassadeurs digitaux.</p>
              </div>
           </div>
        </div>

        {/* CTA FINAL */}
        <div className="py-12 text-center relative z-10">
           <h2 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4 text-white`}>Prêt à relever le défi ?</h2>
           <p className="text-zinc-400 font-medium mb-8">Envoyez votre CV et un <strong className="text-white">court message vocal</strong> nous vendant "un stylo" ou "un abonnement internet" sur WhatsApp.</p>
           <button onClick={handleApplyClick} className="bg-white text-black px-10 py-5 rounded-2xl font-black md:text-lg uppercase tracking-widest hover:bg-[#39FF14] hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-3 mx-auto">
              Postuler sur WhatsApp <ArrowRight size={20} />
           </button>
           <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-6">Numéro de recrutement : +221 76 223 00 00</p>
        </div>

      </div>
    </main>
  );
}
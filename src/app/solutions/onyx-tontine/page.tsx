"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, Smartphone, Users, Sparkles, X, ShieldCheck, PlayCircle, BookX, CheckCircle, ChevronRight, ChevronLeft } from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

const WORKFLOW_STEPS = [
  {
    id: 0,
    title: "Importez vos membres",
    tag: "Zéro mot de passe",
    desc: "Tapez simplement le numéro WhatsApp de vos membres. L'outil génère leur profil sans qu'ils n'aient à télécharger d'application ou créer de compte.",
    img: "https://placehold.co/600x800/f8fafc/94a3b8?text=Image+IA+Import+Membres"
  },
  {
    id: 1,
    title: "Relances Automatiques",
    tag: "Le 5 du mois",
    desc: "Le système envoie un message WhatsApp bienveillant mais ferme à tous les membres pour réclamer l'argent. Fini la gêne de devoir réclamer vous-même.",
    img: "https://placehold.co/600x800/f8fafc/94a3b8?text=Image+IA+Relance+Auto"
  },
  {
    id: 2,
    title: "Tirage au sort animé",
    tag: "100% Transparent",
    desc: "À chaque fin de mois, l'outil génère une animation de tirage au sort certifiée. Partagez la vidéo dans votre groupe : la confiance est absolue.",
    img: "https://placehold.co/600x800/f8fafc/94a3b8?text=Image+IA+Tirage+Animé"
  }
];

export default function OnyxTontineLanding() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (showLeadModal || selectedStep !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showLeadModal, selectedStep]);

  const saveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert([{
        full_name: leadData.name,
        phone: leadData.phone,
        intent: 'Création Onyx Tontine',
        source: 'Landing Page Tontine (Light)',
        status: 'Nouveau',
        password: 'central2026'
      }]);
      
      if (error) console.error(error);
      
      const msg = `Bonjour l'équipe Onyx ! Je suis ${leadData.name}. Je veux digitaliser mon groupe de Tontine pour arrêter de courir après l'argent.`;
      window.open(`https://wa.me/221785338417?text=${encodeURIComponent(msg)}`, '_blank');
      
      setShowLeadModal(false);
      setSelectedStep(null);
      setLeadData({ name: "", phone: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => setSelectedStep(prev => prev !== null && prev < WORKFLOW_STEPS.length - 1 ? prev + 1 : prev);
  const handlePrev = () => setSelectedStep(prev => prev !== null && prev > 0 ? prev - 1 : prev);

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-[#39FF14]/30 pb-24">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
         <div className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-2 text-black`}>
            ONYX<span className="text-[#39FF14] drop-shadow-sm">TONTINE</span>
         </div>
      </nav>

      {/* Section A : Hero */}
      <section className="pt-16 pb-20 px-6 text-center max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="inline-flex items-center gap-2 bg-white border border-zinc-200 text-zinc-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></span> Fini les relances gênantes sur WhatsApp
         </div>
         <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.05] mb-6 text-black`}>
            Jetez votre cahier. <br/>
            Onyx encaisse et relance <br/>
            <span className="text-[#39FF14] drop-shadow-sm">votre Tontine</span> pour vous.
         </h1>
         <p className="text-zinc-600 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Gagnez du temps, sécurisez l'argent et ramenez la confiance dans votre groupe. 100% digital, zéro mot de passe pour vos membres.
         </p>
         <button onClick={() => setShowLeadModal(true)} className="bg-[#39FF14] text-black px-10 py-5 rounded-[2rem] font-black text-lg uppercase tracking-widest hover:scale-105 transition-all shadow-[0_15px_30px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3 mx-auto border-2 border-black/5">
            Digitaliser ma Tontine <ArrowRight size={24}/>
         </button>
      </section>

      {/* Section B : Problème/Solution (Avant/Après) */}
      <section className="py-16 px-6 max-w-5xl mx-auto">
         <div className="grid md:grid-cols-2 gap-8">
            {/* AVANT */}
            <div className="bg-white border border-red-100 rounded-[3rem] p-8 shadow-sm flex flex-col items-center text-center relative overflow-hidden">
               <div className="absolute top-0 left-0 right-0 h-2 bg-red-500"></div>
               <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                  <BookX size={40} strokeWidth={1.5} />
               </div>
               <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 text-black`}>Le Cahier (Avant)</h3>
               <ul className="space-y-4 text-zinc-600 font-bold w-full text-left">
                  <li className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl"><X className="text-red-500 shrink-0" /> Vous courez après l'argent</li>
                  <li className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl"><X className="text-red-500 shrink-0" /> Disputes constantes sur les retards</li>
                  <li className="flex items-center gap-3 bg-zinc-50 p-4 rounded-2xl"><X className="text-red-500 shrink-0" /> Cahier perdu ou calculs compliqués</li>
               </ul>
            </div>

            {/* APRÈS */}
            <div className="bg-black border border-black rounded-[3rem] p-8 shadow-2xl flex flex-col items-center text-center relative overflow-hidden transform md:-translate-y-4">
               <div className="absolute top-0 left-0 right-0 h-2 bg-[#39FF14]"></div>
               <div className="w-20 h-20 bg-[#39FF14]/20 rounded-full flex items-center justify-center text-[#39FF14] mb-6">
                  <Smartphone size={40} strokeWidth={1.5} />
               </div>
               <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 text-white`}>Avec Onyx Tontine</h3>
               <ul className="space-y-4 text-white font-bold w-full text-left">
                  <li className="flex items-center gap-3 bg-zinc-900 p-4 rounded-2xl"><CheckCircle className="text-[#39FF14] shrink-0" /> L'appli relance sur WhatsApp</li>
                  <li className="flex items-center gap-3 bg-zinc-900 p-4 rounded-2xl"><CheckCircle className="text-[#39FF14] shrink-0" /> Les membres paient par Wave en 1 clic</li>
                  <li className="flex items-center gap-3 bg-zinc-900 p-4 rounded-2xl"><CheckCircle className="text-[#39FF14] shrink-0" /> Tirage au sort animé et transparent</li>
               </ul>
            </div>
         </div>
      </section>

      {/* Section C : Workflow (Les 3 Étapes) */}
      <section className="py-24 px-6 overflow-hidden max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <h2 className={`${spaceGrotesk.className} text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 text-black`}>Le workflow <span className="text-[#39FF14] drop-shadow-sm">parfait</span>.</h2>
            <p className="text-zinc-600 font-bold">Un processus fluide conçu pour la confiance.</p>
         </div>

         {/* Conteneur scrollable / swipeable sur mobile */}
         <div className="flex overflow-x-auto snap-x custom-scrollbar gap-6 pb-8 -mx-6 px-6 md:mx-0 md:px-0 md:grid md:grid-cols-3">
            {WORKFLOW_STEPS.map((step) => (
               <div 
                  key={step.id} 
                  onClick={() => setSelectedStep(step.id)} 
                  className="snap-center shrink-0 w-[85%] md:w-auto bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-[#39FF14] transition-all cursor-pointer group flex flex-col"
               >
                  <div className="bg-zinc-100 w-full aspect-[4/5] rounded-[1.5rem] mb-6 overflow-hidden relative">
                     {/* IMAGE PLACEHOLDER - L'image IA viendra ici */}
                     <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 bg-white text-black px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all">
                           Voir en détail
                        </div>
                     </div>
                  </div>
                  <div className="flex-1 flex flex-col text-center">
                     <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase leading-tight mb-2 text-black`}>{step.title}</h3>
                     <p className="text-zinc-500 font-black text-[10px] uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full mx-auto w-max">{step.tag}</p>
                  </div>
               </div>
            ))}
         </div>
      </section>

      {/* SECTION D : MODALE DE DÉTAILS WORKFLOW */}
      {selectedStep !== null && (
        <div id="modal-overlay" className="fixed inset-0 z-[200] bg-zinc-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in" onClick={(e) => { if ((e.target as any).id === "modal-overlay") setSelectedStep(null); }}>
          <div className="bg-white rounded-[3rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedStep(null)} className="absolute top-4 right-4 bg-zinc-100 p-2 rounded-full hover:bg-black hover:text-white transition z-10"><X size={20}/></button>
            
            <div className="w-full aspect-square bg-zinc-100 rounded-[2rem] overflow-hidden mb-6 shrink-0 relative">
               <img src={WORKFLOW_STEPS[selectedStep].img} alt={WORKFLOW_STEPS[selectedStep].title} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex-1 overflow-y-auto mb-6 text-center px-2">
               <span className="text-[#39FF14] bg-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-3 inline-block">{WORKFLOW_STEPS[selectedStep].tag}</span>
               <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-4 text-black`}>{WORKFLOW_STEPS[selectedStep].title}</h3>
               <p className="text-zinc-600 font-medium leading-relaxed">{WORKFLOW_STEPS[selectedStep].desc}</p>
            </div>
            
            <div className="flex items-center justify-between gap-4 mt-auto">
               <button onClick={handlePrev} disabled={selectedStep === 0} className="p-4 bg-zinc-100 rounded-2xl hover:bg-zinc-200 disabled:opacity-50 transition"><ChevronLeft size={20}/></button>
               <button onClick={() => { setSelectedStep(null); setShowLeadModal(true); }} className="flex-1 bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs hover:scale-105 transition shadow-xl">
                  Ouvrir ma Tontine
               </button>
               <button onClick={handleNext} disabled={selectedStep === WORKFLOW_STEPS.length - 1} className="p-4 bg-zinc-100 rounded-2xl hover:bg-zinc-200 disabled:opacity-50 transition"><ChevronRight size={20}/></button>
            </div>
          </div>
        </div>
      )}

      {/* Section E : Modal Lead Capture (CRM Integration) */}
      {showLeadModal && (
        <div id="modal-overlay" className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-md animate-in fade-in" onClick={(e) => { if ((e.target as any).id === "modal-overlay") setShowLeadModal(false); }}>
          <div className="bg-white border border-zinc-200 p-8 md:p-12 rounded-[3rem] w-full max-w-md relative shadow-2xl animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowLeadModal(false)} className="absolute top-6 right-6 text-zinc-400 bg-zinc-100 p-2 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
            
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-[#39FF14] mb-6 shadow-lg">
               <ShieldCheck size={32} />
            </div>
            
            <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-2 text-black`}>Créer ma tontine</h3>
            <p className="text-sm text-zinc-500 font-medium mb-8">Laissez-nous vos coordonnées, notre équipe va configurer votre espace avec vous directement sur WhatsApp.</p>
            
            <form onSubmit={saveLead} className="space-y-4">
               <input type="text" required placeholder="Votre Prénom *" value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-black outline-none focus:border-black transition font-bold" />
               <input type="tel" required placeholder="Numéro WhatsApp *" value={leadData.phone} onChange={e => setLeadData({...leadData, phone: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-black outline-none focus:border-black transition font-bold" />
               <button disabled={isSubmitting} type="submit" className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-sm mt-4 hover:bg-black hover:text-[#39FF14] transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
                  {isSubmitting ? '...' : 'Valider & Continuer sur WhatsApp'}
               </button>
            </form>
          </div>
        </div>
      )}

      {/* Section F : Appel à l'action final (Sticky bottom bar) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className="font-black text-sm md:text-base text-black">9 900 F<span className="text-zinc-500 text-xs font-bold">/mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">Pour tout le groupe, sans engagement.</p>
             </div>
             <button onClick={() => setShowLeadModal(true)} className="bg-black text-[#39FF14] px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-lg shadow-black/20">
                Créer ma Tontine
             </button>
          </div>
      </div>
    </div>
  );
}
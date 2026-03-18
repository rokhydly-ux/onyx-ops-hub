"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ArrowRight, Smartphone, Users, Sparkles, X, ShieldCheck } from "lucide-react";

export default function OnyxTontineLanding() {
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadData, setLeadData] = useState({ name: "", phone: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const saveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('leads').insert([{
        full_name: leadData.name,
        phone: leadData.phone,
        intent: 'Découverte Onyx Tontine',
        source: 'Landing Page Tontine',
        status: 'Nouveau',
        password: 'central2026'
      }]);
      
      if (error) console.error(error);
      
      const msg = `Bonjour, je suis ${leadData.name}. J'aimerais tester Onyx Tontine pour gérer mes cotisations facilement !`;
      window.open(`https://wa.me/221785338417?text=${encodeURIComponent(msg)}`, '_blank');
      
      setShowLeadModal(false);
      setLeadData({ name: "", phone: "" });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-[#39FF14]/30">
      {/* Navbar */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
         <div className="text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
            ONYX<span className="text-[#39FF14]">TONTINE</span>
         </div>
         <button onClick={() => setShowLeadModal(true)} className="bg-[#39FF14] text-black px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 transition shadow-[0_0_20px_rgba(57,255,20,0.3)]">
            Essai Gratuit
         </button>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
         <div className="inline-flex items-center gap-2 bg-[#39FF14]/10 border border-[#39FF14]/20 text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-8">
            Lancement 2026
         </div>
         <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[1.1] mb-8">
            Jetez votre cahier. <br/>
            <span className="text-[#39FF14]">Gérer une tontine</span> <br/>
            n'a jamais été aussi simple.
         </h1>
         <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
            Plus de retards, plus de contestations. Automatisez vos cotisations, relancez les membres sur WhatsApp et sécurisez votre caisse sans effort.
         </p>
         <button onClick={() => setShowLeadModal(true)} className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:scale-105 transition shadow-[0_15px_40px_rgba(57,255,20,0.4)] flex items-center justify-center gap-3 mx-auto">
            Créer ma Tontine <ArrowRight size={24}/>
         </button>
      </section>

      {/* Bénéfices Visuels (9:16) */}
      <section className="py-24 bg-zinc-950 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
               <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">Le workflow <span className="text-[#39FF14]">parfait</span>.</h2>
               <p className="text-zinc-400 font-bold">Trois étapes pour une gestion 100% transparente.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               {/* Carte 1 */}
               <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 flex flex-col items-center text-center aspect-[9/16] max-h-[600px] hover:border-[#39FF14]/50 transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14] opacity-[0.03] rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                  <div className="w-16 h-16 bg-black border border-zinc-800 rounded-2xl flex items-center justify-center text-[#39FF14] mb-8 shadow-2xl">
                     <span className="font-black text-2xl">1</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center w-full relative">
                     <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800 mb-8 backdrop-blur-sm">
                        <Users size={48} className="text-zinc-500 mx-auto mb-4" />
                        <p className="font-black text-sm text-zinc-300">Ajout par numéro de téléphone. Aucun compte à créer pour eux.</p>
                     </div>
                  </div>
                  <h3 className="text-2xl font-black uppercase leading-tight mb-2">Importez vos membres</h3>
                  <p className="text-[#39FF14] font-black text-[10px] uppercase tracking-widest">(Zéro mot de passe)</p>
               </div>

               {/* Carte 2 */}
               <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 flex flex-col items-center text-center aspect-[9/16] max-h-[600px] hover:border-[#39FF14]/50 transition-colors group relative overflow-hidden md:-translate-y-8">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14] opacity-[0.03] rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                  <div className="w-16 h-16 bg-black border border-zinc-800 rounded-2xl flex items-center justify-center text-[#39FF14] mb-8 shadow-2xl">
                     <span className="font-black text-2xl">2</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center w-full relative">
                     <div className="bg-[#25D366]/10 p-6 rounded-3xl border border-[#25D366]/20 mb-8 backdrop-blur-sm relative">
                        <div className="absolute -right-2 -top-2 bg-red-500 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">1</div>
                        <Smartphone size={48} className="text-[#25D366] mx-auto mb-4" />
                        <p className="font-black text-sm text-[#25D366]">"Rappel : Votre cotisation de 10.000F est attendue aujourd'hui."</p>
                     </div>
                  </div>
                  <h3 className="text-2xl font-black uppercase leading-tight mb-2">Relances Automatiques</h3>
                  <p className="text-[#39FF14] font-black text-[10px] uppercase tracking-widest">(Directement sur WhatsApp)</p>
               </div>

               {/* Carte 3 */}
               <div className="bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 flex flex-col items-center text-center aspect-[9/16] max-h-[600px] hover:border-[#39FF14]/50 transition-colors group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14] opacity-[0.03] rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
                  <div className="w-16 h-16 bg-black border border-zinc-800 rounded-2xl flex items-center justify-center text-[#39FF14] mb-8 shadow-2xl">
                     <span className="font-black text-2xl">3</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center w-full relative">
                     <div className="bg-black/50 p-6 rounded-3xl border border-zinc-800 mb-8 backdrop-blur-sm">
                        <Sparkles size={48} className="text-yellow-500 mx-auto mb-4 animate-pulse" />
                        <p className="font-black text-sm text-yellow-500">Le gagnant de ce mois est... 🎉</p>
                     </div>
                  </div>
                  <h3 className="text-2xl font-black uppercase leading-tight mb-2">Tirage au sort animé</h3>
                  <p className="text-[#39FF14] font-black text-[10px] uppercase tracking-widest">(100% Transparent)</p>
               </div>
            </div>
         </div>
      </section>

      {/* Modal Lead Capture (CRM Integration) */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-zinc-900 border-2 border-zinc-800 p-8 md:p-12 rounded-[3rem] w-full max-w-md relative shadow-2xl animate-in zoom-in">
            <button onClick={() => setShowLeadModal(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white transition"><X size={24}/></button>
            
            <div className="w-16 h-16 bg-[#39FF14]/10 rounded-2xl flex items-center justify-center text-[#39FF14] mb-6">
               <ShieldCheck size={32} />
            </div>
            
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-2">Créer ma tontine</h3>
            <p className="text-sm text-zinc-400 font-medium mb-8">Laissez-nous vos coordonnées, un conseiller va configurer votre espace avec vous sur WhatsApp.</p>
            
            <form onSubmit={saveLead} className="space-y-4">
               <input type="text" required placeholder="Votre Prénom *" value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-[#39FF14] transition font-bold" />
               <input type="tel" required placeholder="Numéro WhatsApp *" value={leadData.phone} onChange={e => setLeadData({...leadData, phone: e.target.value})} className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white outline-none focus:border-[#39FF14] transition font-bold" />
               <button disabled={isSubmitting} type="submit" className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm mt-4 hover:bg-white transition flex items-center justify-center gap-2">
                  {isSubmitting ? '...' : 'Valider & Continuer sur WhatsApp'}
               </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
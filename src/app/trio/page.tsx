"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Truck, ChevronLeft, Package, Smartphone, Box, 
  ArrowRight, Zap, CheckCircle, ShieldCheck, X
} from "lucide-react";

export default function PackTrioLanding() {
  const router = useRouter();

  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadData, setLeadData] = useState({ name: '', phone: '', email: '' });
  const waNumber = "221785338417";

  const saveLead = async (data: any) => {
    try {
      const payload: Record<string, any> = {
        source: data.source || 'Landing Page Pack Trio',
        intent: data.intent || 'Contact',
        phone: data.contact || '',
        full_name: data.full_name || 'Visiteur Anonyme',
        message: data.message || '',
        status: 'Nouveau',
        password: 'central2026'
      };
      if (data.email) payload.email = data.email;
      
      const { error } = await supabase.from('leads').insert([payload]);
      if (error) console.error("ERREUR SUPABASE (Leads) :", error.message);
    } catch (e) { 
      console.error("ERREUR CATCH (Leads) :", e); 
    }
  };

  const handleDirectWaClick = async (intent: string, msg: string) => {
    await saveLead({ source: 'Bouton Site Pack Trio', intent, message: msg, contact: '' });
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const submitLeadForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadData.name || !leadData.phone) return alert("Veuillez remplir les champs obligatoires.");
    const msg = `🚀 *Nouveau Lead (Pack Trio)*\n\n*Nom:* ${leadData.name}\n*Téléphone:* ${leadData.phone}\n*Email:* ${leadData.email || 'Non renseigné'}\n\n_Le client souhaite démarrer avec le Pack Trio._`;
    await saveLead({ source: 'Landing Page Pack Trio', intent: 'Démarrage Pack Trio', contact: leadData.phone, full_name: leadData.name, message: `Email: ${leadData.email}`, email: leadData.email });
    setShowLeadModal(false);
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-black overflow-x-hidden selection:bg-[#39FF14]/30 pb-0">
      
      {/* Navigation minimale */}
      <nav className="fixed top-0 left-0 right-0 p-6 z-50 flex items-center justify-between pointer-events-none">
         <button onClick={() => router.push('/')} className="pointer-events-auto bg-white/80 backdrop-blur-md p-3 rounded-full border border-zinc-200 hover:bg-black hover:text-white transition-colors shadow-sm">
            <ChevronLeft size={20} />
         </button>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-32 pb-20 px-6 max-w-5xl mx-auto text-center">
         <div className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 shadow-[0_10px_20px_rgba(57,255,20,0.2)]">
             <Zap size={14} className="fill-[#39FF14]" /> L'Arme Ultime pour les E-commerçants
         </div>
         <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-8 leading-[0.95]">
             Le Contrôle <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-zinc-500">Absolu.</span> <br/>
             <span className="text-[#39FF14] underline decoration-black decoration-8 underline-offset-8">Zéro Perte.</span>
         </h1>
         <p className="text-zinc-600 text-lg md:text-xl font-bold max-w-3xl mx-auto mb-12 leading-relaxed">
             Le <span className="text-black font-black uppercase tracking-widest bg-[#39FF14]/20 px-2 py-0.5 rounded">Pack Trio</span> combine la puissance d'Onyx Jaay (Vente), Onyx Stock et Onyx Tiak (Logistique). Suivez vos livreurs, maîtrisez vos encaissements et ne tombez plus jamais en rupture de stock.
         </p>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button onClick={() => setShowLeadModal(true)} className="w-full sm:w-auto bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-2">
                 Démarrer l'essai (24 900 F/mois) <ArrowRight size={18} />
             </button>
         </div>
      </section>

      {/* 2. LES 3 PILIERS */}
      <section className="py-24 px-6 max-w-7xl mx-auto border-t border-zinc-200">
         <div className="text-center mb-16">
            <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-6">Les 3 Piliers de votre <span className="text-[#39FF14] bg-black px-4 py-1 rounded-xl">Empire</span></h2>
            <p className="text-zinc-500 font-bold max-w-2xl mx-auto text-lg">Centralisez toute votre activité sur une seule plateforme pensée pour WhatsApp.</p>
         </div>

         <div className="grid md:grid-cols-3 gap-6">
            {/* Pilier 1 : Vente */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-zinc-200 shadow-sm hover:border-black hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><Smartphone size={28}/></div>
               <h3 className="font-sans text-2xl font-black uppercase mb-4 tracking-tighter">1. Onyx Jaay (Vente)</h3>
               <ul className="space-y-3 text-sm font-semibold text-zinc-600">
                  <li className="flex items-start gap-2"><CheckCircle className="text-[#39FF14] shrink-0" size={18}/> Catalogue WhatsApp Pro interactif</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-[#39FF14] shrink-0" size={18}/> Prise de commande 100% autonome</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-[#39FF14] shrink-0" size={18}/> Relance auto des paniers abandonnés</li>
               </ul>
            </div>

            {/* Pilier 2 : Stock */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-zinc-200 shadow-sm hover:border-black hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><Box size={28}/></div>
               <h3 className="font-sans text-2xl font-black uppercase mb-4 tracking-tighter">2. Onyx Stock</h3>
               <ul className="space-y-3 text-sm font-semibold text-zinc-600">
                  <li className="flex items-start gap-2"><CheckCircle className="text-[#39FF14] shrink-0" size={18}/> Déduction automatique à chaque vente</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-[#39FF14] shrink-0" size={18}/> Alerte WhatsApp de rupture de stock</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-[#39FF14] shrink-0" size={18}/> Gestion multi-variantes (Tailles/Couleurs)</li>
               </ul>
            </div>

            {/* Pilier 3 : Logistique */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-zinc-200 shadow-sm hover:border-[#39FF14] hover:shadow-[0_10px_30px_rgba(57,255,20,0.15)] transition-all group">
               <div className="w-14 h-14 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><Truck size={28}/></div>
               <h3 className="font-sans text-2xl font-black uppercase mb-4 tracking-tighter">3. Onyx Tiak (Logistique)</h3>
               <ul className="space-y-3 text-sm font-semibold text-zinc-600">
                  <li className="flex items-start gap-2"><CheckCircle className="text-[#39FF14] shrink-0" size={18}/> Envoi des courses au livreur en 1 clic</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-[#39FF14] shrink-0" size={18}/> Suivi des statuts (En route, Livré, Annulé)</li>
                  <li className="flex items-start gap-2"><CheckCircle className="text-[#39FF14] shrink-0" size={18}/> Contrôle de la caisse du livreur en temps réel</li>
               </ul>
            </div>
         </div>
      </section>

      {/* 3. PROBLEME VS SOLUTION */}
      <section className="py-20 px-6 max-w-5xl mx-auto">
         <div className="bg-black border-4 border-[#39FF14] p-10 md:p-16 rounded-[3.5rem] relative overflow-hidden shadow-[0_30px_60px_rgba(57,255,20,0.15)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14] opacity-[0.05] blur-3xl pointer-events-none rounded-full"></div>
            <ShieldCheck size={56} className="text-[#39FF14] mb-8" />
            <h2 className="font-sans text-3xl md:text-5xl font-black uppercase text-white tracking-tighter mb-6 leading-tight">Sécurisez votre Cash-Flow</h2>
            <p className="text-zinc-400 font-medium text-lg mb-10 leading-relaxed max-w-2xl">
               Combien d'argent perdez-vous chaque mois à cause des erreurs de calcul, des livreurs qui ne rendent pas la bonne monnaie, ou des produits "disparus" de votre stock ? Le <span className="text-white font-bold bg-[#39FF14]/20 px-2 py-1 rounded">Pack Trio</span> trace chaque franc CFA, du clic du client jusqu'à votre poche.
            </p>
            <ul className="space-y-4 text-white font-bold mb-10">
               <li className="flex items-center gap-3"><Zap className="text-[#39FF14]" size={20}/> Fini les vols d'inventaire</li>
               <li className="flex items-center gap-3"><Zap className="text-[#39FF14]" size={20}/> Fini les livreurs injoignables</li>
               <li className="flex items-center gap-3"><Zap className="text-[#39FF14]" size={20}/> Fini les clients frustrés par des ruptures non signalées</li>
            </ul>
         </div>
      </section>

      {/* 4. FOOTER CTA */}
      <section className="bg-zinc-900 text-white pt-24 pb-32 px-6 rounded-t-[4rem] text-center relative overflow-hidden mt-10">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#39FF14] rounded-full blur-[150px] opacity-[0.1] pointer-events-none"></div>
         <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-[0.95]">Prêt à structurer votre entreprise ?</h2>
            <p className="text-zinc-400 font-bold text-lg md:text-xl mb-12">Passez au niveau supérieur. Le Pack Trio est tout ce dont vous avez besoin pour scaler au Sénégal.</p>
            <button onClick={() => setShowLeadModal(true)} className="bg-[#39FF14] text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-base hover:scale-105 hover:bg-white transition-all shadow-[0_20px_50px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3 mx-auto">
               <Package size={24} /> Obtenir le Pack Trio
            </button>
         </div>
      </section>

      {/* MODALE DE CAPTURE DE LEAD */}
      {showLeadModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-8 md:p-10 rounded-[3rem] max-w-md w-full relative shadow-2xl animate-in zoom-in">
            <button onClick={() => setShowLeadModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition">
              <X size={20} />
            </button>
            <h2 className="font-sans text-2xl font-black uppercase tracking-tighter mb-6 text-center">Démarrer avec le Pack Trio</h2>
            <form onSubmit={submitLeadForm} className="space-y-4">
              <div>
                <input type="text" placeholder="Votre Nom *" required value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
              </div>
              <div>
                <input type="tel" placeholder="Numéro WhatsApp *" required value={leadData.phone} onChange={e => setLeadData({...leadData, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
              </div>
              <div>
                <input type="email" placeholder="Email (Optionnel)" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
              </div>
              <button type="submit" className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition flex justify-center items-center gap-2 mt-4">
                Valider & Continuer vers WhatsApp <ArrowRight size={16} />
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

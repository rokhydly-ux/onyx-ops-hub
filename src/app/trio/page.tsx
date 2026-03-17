"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Truck, ChevronLeft, Package, Smartphone, Box, 
  ArrowRight, Zap, CheckCircle, ShieldCheck, X,
  UserPlus, MessageSquare
} from "lucide-react";

const ONBOARDING_CATEGORIES = [
  "Restauration / Fast-Food",
  "Boutique / Prêt-à-porter",
  "E-commerce / Vente en ligne",
  "Prestation de services",
  "Autre"
];

export default function PackTrioLanding() {
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [leadData, setLeadData] = useState({ name: '', phone: '', email: '', category: '', customCategory: '', saas: 'Pack Trio' });
  const [countryCode, setCountryCode] = useState("+221");
  const waNumber = "221785338417";

  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasTriggeredExitIntent, setHasTriggeredExitIntent] = useState(false);

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasTriggeredExitIntent) {
        setShowExitIntent(true);
        setHasTriggeredExitIntent(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasTriggeredExitIntent]);

  useEffect(() => {
    document.body.style.overflow = (showOnboarding || showExitIntent) ? "hidden" : "";
  }, [showOnboarding, showExitIntent]);

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
    await saveLead({ source: 'Bouton Site Pack Trio', intent, message: msg, contact: leadData.phone || '', full_name: leadData.name || 'Visiteur Anonyme' });
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const submitLeadForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanNumber = leadData.phone.replace(/\s+/g, '');
    const isValidPhone = countryCode === '+221' ? /^(?:\+221)?(7[05678]\d{7})$/.test(cleanNumber) : cleanNumber.length >= 6;
    
    if (!isValidPhone) {
      alert(countryCode === '+221' ? "Format invalide pour le Sénégal (ex: 77 123 45 67)" : "Numéro de téléphone invalide.");
      return;
    }

    const finalPhone = cleanNumber.startsWith('+221') ? cleanNumber : `${countryCode}${cleanNumber}`;
    const finalCategory = leadData.category === 'Autre' ? leadData.customCategory : leadData.category;
    const msg = `🚀 *NOUVEAU LEAD (Pack Trio)*\n\n*Nom:* ${leadData.name}\n*Téléphone:* ${finalPhone}\n*Email:* ${leadData.email || 'Non renseigné'}\n*Activité:* ${finalCategory}\n\n_Le client a créé son compte lui-même via le formulaire complet._`;

    await saveLead({ source: 'Landing Page Pack Trio', intent: 'Création Compte Pack Trio', contact: finalPhone, full_name: leadData.name, message: `Activité: ${finalCategory} | Email: ${leadData.email}`, email: leadData.email });
    
    setShowOnboarding(false);
    alert(`Merci ${leadData.name} ! Vos informations sont enregistrées.\nVous allez être redirigé vers notre équipe WhatsApp pour l'activation immédiate de votre espace.`);
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const submitExitIntentLead = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanNumber = leadData.phone.replace(/\s+/g, '');
    const isValidPhone = countryCode === '+221' ? /^(?:\+221)?(7[05678]\d{7})$/.test(cleanNumber) : cleanNumber.length >= 6;
    
    if (!isValidPhone) {
      alert(countryCode === '+221' ? "Format invalide pour le Sénégal (ex: 77 123 45 67)" : "Numéro de téléphone invalide.");
      return;
    }

    const finalPhone = cleanNumber.startsWith('+221') ? cleanNumber : `${countryCode}${cleanNumber}`;
    const finalCategory = leadData.category === 'Autre' ? leadData.customCategory : leadData.category;
    const msg = `🚀 *NOUVEAU LEAD (Exit Intent)*\n\n*Nom:* ${leadData.name || 'Visiteur'}\n*Téléphone:* ${finalPhone}\n*Email:* ${leadData.email || 'Non renseigné'}\n*Activité:* ${finalCategory || 'Non renseignée'}\n\n_Le client souhaite un diagnostic gratuit._`;

    await saveLead({
       source: 'Exit Intent Pack Trio',
       intent: `Diagnostic Gratuit`,
       contact: finalPhone,
       full_name: leadData.name || 'Visiteur',
       message: `Demande de diagnostic gratuit | Activité: ${finalCategory || 'Non renseignée'} | Email: ${leadData.email}`
    });

    setShowExitIntent(false);
    alert(`Merci ! Votre demande est enregistrée.\nNous allons vous rediriger vers notre équipe WhatsApp pour votre diagnostic gratuit.`);
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleOutsideClick = (setter: any) => (e: any) => {
    if (e.target.id === "modal-overlay") setter(false);
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
             <button onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }} className="w-full sm:w-auto bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-2">
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
            <button onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }} className="bg-[#39FF14] text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-base hover:scale-105 hover:bg-white transition-all shadow-[0_20px_50px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3 mx-auto">
               <Package size={24} /> Obtenir le Pack Trio
            </button>
         </div>
      </section>

      {/* MODALE : ONBOARDING CAPTURE LEAD (MAIMOUNA) */}
      {showOnboarding && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowOnboarding)} className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-4xl relative overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(57,255,20,0.15)] animate-in zoom-in min-h-[500px]">
            <button onClick={() => setShowOnboarding(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-20"><X size={20}/></button>

            {/* Colonne Gauche : Image Conseillère */}
            <div className="w-full md:w-2/5 bg-zinc-900 relative hidden md:block">
               <img src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=600&h=800&fit=crop" alt="Maïmouna" className="w-full h-full object-cover opacity-80" />
               <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent flex flex-col justify-end p-8">
                  <span className="bg-[#39FF14] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full w-max mb-2">Conseillère Experte</span>
                  <h3 className="font-sans text-2xl font-black uppercase text-white mb-2">Maïmouna</h3>
                  <p className="text-zinc-300 text-sm font-medium">"Je vais vous aider à configurer votre espace pour maximiser vos ventes."</p>
               </div>
            </div>

            {/* Colonne Droite : Formulaire */}
            <div className="flex-1 p-8 sm:p-12 flex flex-col justify-center">
               {onboardingStep === 0 && (
                 <div className="space-y-6 animate-in slide-in-from-right-8">
                   <div className="mb-8">
                      <h2 className="font-sans text-3xl font-black uppercase mt-4">Comment souhaitez-vous <span className="text-[#39FF14] bg-black px-2 py-0.5 rounded-lg">démarrer</span> ?</h2>
                      <p className="text-zinc-500 font-bold mt-4">Saisissez vos informations et choisissez l'option qui vous convient.</p>
                   </div>

                   <div className="space-y-3">
                      <input type="text" placeholder="Votre Prénom *" value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition" />
                      <input type="tel" placeholder="Votre Numéro WhatsApp *" value={leadData.phone} onChange={e => setLeadData({...leadData, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition" />
                   </div>

                   <div className="space-y-4">
                      <button onClick={() => { 
                          if(!leadData.name || !leadData.phone) return alert('Veuillez saisir votre prénom et numéro WhatsApp.'); 
                          saveLead({ 
                            source: 'Onboarding Pack Trio', 
                            intent: 'Lead Partiel (Abandon Étape 1)', 
                            contact: leadData.phone, 
                            full_name: leadData.name 
                          });
                          setOnboardingStep(1); 
                      }} className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-105 transition flex items-center justify-center gap-3">
                         <UserPlus size={20} /> Créer mon compte moi-même
                      </button>
                      <button onClick={() => { if(!leadData.name || !leadData.phone) return alert('Veuillez saisir votre prénom et numéro WhatsApp.'); handleDirectWaClick('Démarrage Pack Trio', `Bonjour, je m'appelle ${leadData.name} et je souhaite démarrer un essai pour le Pack Trio.`); }} className="w-full bg-zinc-100 text-black py-5 rounded-[2rem] font-black uppercase text-sm shadow-sm hover:bg-zinc-200 transition flex items-center justify-center gap-3">
                         <MessageSquare size={20} /> Démarrer via WhatsApp
                      </button>
                   </div>
                 </div>
               )}

               {onboardingStep === 1 && (
                 <div className="space-y-6 animate-in slide-in-from-right-8">
                   <div className="mb-8">
                      <span className="text-[#39FF14] font-black text-xs uppercase tracking-widest bg-black px-3 py-1 rounded-lg">Étape Finale 1/2</span>
                      <h2 className="font-sans text-3xl font-black uppercase mt-4">Quelle est votre <span className="text-[#39FF14] bg-black px-2 py-0.5 rounded-lg">activité</span> ?</h2>
                   </div>

                   <div className="space-y-3">
                     {ONBOARDING_CATEGORIES.map(cat => (
                       <button
                         key={cat}
                         onClick={() => { setLeadData({...leadData, category: cat}); if(cat !== 'Autre') setOnboardingStep(2); }}
                         className={`w-full text-left p-4 rounded-2xl border-2 font-bold text-sm transition-all ${leadData.category === cat ? 'border-black bg-black text-[#39FF14]' : 'border-zinc-200 hover:border-black bg-zinc-50 text-zinc-700'}`}
                       >
                         {cat}
                       </button>
                     ))}
                   </div>

                   {leadData.category === 'Autre' && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                         <input
                           type="text"
                           placeholder="Ex: Agence immobilière, VTC..."
                           value={leadData.customCategory}
                           onChange={e => setLeadData({...leadData, customCategory: e.target.value})}
                           className="w-full p-4 bg-zinc-50 border-2 border-black rounded-2xl font-bold outline-none mb-4"
                         />
                         <button disabled={!leadData.customCategory} onClick={() => setOnboardingStep(2)} className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition disabled:opacity-50">Continuer <ArrowRight size={14} className="inline ml-1"/></button>
                      </div>
                   )}
                 </div>
               )}

               {onboardingStep === 2 && (
                 <form onSubmit={submitLeadForm} className="space-y-6 animate-in slide-in-from-right-8">
                   <div className="mb-8">
                      <span className="text-[#39FF14] font-black text-xs uppercase tracking-widest bg-black px-3 py-1 rounded-lg">Étape Finale 2/2</span>
                      <h2 className="font-sans text-3xl font-black uppercase mt-4">Activation de votre <span className="text-[#39FF14] bg-black px-2 py-0.5 rounded-lg">compte</span></h2>
                   </div>

                   <div className="space-y-4">
                     <div>
                       <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Nom ou Nom de la structure *</label>
                       <input type="text" required value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition" placeholder="Ex: Boutique Fatou" />
                     </div>
                     
                     <div>
                       <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Numéro WhatsApp *</label>
                       <div className="flex gap-2">
                         <select 
                           value={countryCode} 
                           onChange={(e) => setCountryCode(e.target.value)}
                           className="bg-zinc-50 text-black border border-zinc-200 rounded-2xl px-3 py-4 font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition w-28 sm:w-32 cursor-pointer"
                         >
                           <option value="+221">🇸🇳 +221</option>
                           <option value="+223">🇲🇱 +223</option>
                           <option value="+225">🇨🇮 +225</option>
                           <option value="+224">🇬🇳 +224</option>
                           <option value="+241">🇬🇦 +241</option>
                           <option value="+33">🇫🇷 +33</option>
                         </select>
                         <input 
                           type="tel" 
                           required 
                           value={leadData.phone} 
                           onChange={e => setLeadData({...leadData, phone: e.target.value})} 
                           className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition" 
                           placeholder={countryCode === "+221" ? "77 123 45 67" : "Numéro sans indicatif"} 
                         />
                       </div>
                     </div>

                     <div>
                       <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Adresse Email <span className="text-zinc-400 font-medium">(Optionnel)</span></label>
                       <input type="email" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition" placeholder="contact@monbusiness.com" />
                     </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                     <button type="button" onClick={() => setOnboardingStep(1)} className="bg-zinc-100 text-black px-6 py-4 rounded-2xl font-black text-xs uppercase hover:bg-zinc-200 transition">Retour</button>
                     <button type="submit" className="flex-1 bg-black text-[#39FF14] py-4 rounded-2xl font-black text-xs uppercase shadow-xl hover:scale-105 transition flex items-center justify-center gap-2">
                       <CheckCircle size={16}/> Terminer & Activer
                     </button>
                   </div>
                 </form>
               )}
            </div>
          </div>
        </div>
      )}

      {/* MODALE EXIT INTENT */}
      {showExitIntent && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowExitIntent)} className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-white p-10 md:p-12 rounded-[4rem] max-w-lg w-full relative shadow-[0_0_100px_rgba(57,255,20,0.2)] animate-in zoom-in text-center border-t-8 border-black">
            <button onClick={() => setShowExitIntent(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
            
            <div className="w-20 h-20 bg-[#39FF14] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
               <Zap className="text-black w-10 h-10" />
            </div>
            
            <h2 className="font-sans text-3xl md:text-4xl font-black uppercase tracking-tighter mb-4">Vous partez déjà ?</h2>
            <p className="text-zinc-600 font-medium mb-6 text-sm">Ne laissez pas vos concurrents vous dépasser. Obtenez un <span className="font-black text-black">diagnostic gratuit 100% personnalisé</span>.</p>

            <div className="text-left bg-zinc-50 p-6 rounded-3xl border border-zinc-200 mb-6 space-y-3">
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Sans engagement, découvrez comment :</p>
               <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={16} className="text-[#39FF14] flex-shrink-0"/> <span>Gagner <span className="bg-[#39FF14]/20 px-2 py-0.5 rounded">10h/semaine</span> d'automatisation</span></div>
               <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={16} className="text-[#39FF14] flex-shrink-0"/> <span>Réduire vos pertes de stock de <span className="bg-[#39FF14]/20 px-2 py-0.5 rounded">-30%</span></span></div>
               <div className="flex items-center gap-3 text-sm font-bold"><CheckCircle size={16} className="text-[#39FF14] flex-shrink-0"/> <span>Augmenter vos commandes de <span className="bg-[#39FF14]/20 px-2 py-0.5 rounded">+50%</span></span></div>
            </div>

            <form onSubmit={submitExitIntentLead} className="space-y-4">
               <input type="text" placeholder="Votre Prénom *" required value={leadData.name} onChange={e => setLeadData({...leadData, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
               
               <div className="flex gap-2">
                 <select 
                   value={countryCode} 
                   onChange={(e) => setCountryCode(e.target.value)}
                   className="bg-zinc-50 text-black border border-zinc-200 rounded-2xl px-3 py-4 font-bold outline-none focus:border-black transition w-28 sm:w-32 cursor-pointer"
                 >
                   <option value="+221">🇸🇳 +221</option>
                   <option value="+223">🇲🇱 +223</option>
                   <option value="+225">🇨🇮 +225</option>
                   <option value="+224">🇬🇳 +224</option>
                   <option value="+241">🇬🇦 +241</option>
                   <option value="+33">🇫🇷 +33</option>
                 </select>
                 <input 
                   type="tel" 
                   placeholder={countryCode === "+221" ? "77 123 45 67 *" : "Numéro *"} 
                   required 
                   value={leadData.phone} 
                   onChange={e => setLeadData({...leadData, phone: e.target.value})} 
                   className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" 
                 />
               </div>

               <select 
                 value={leadData.category} 
                 onChange={e => setLeadData({...leadData, category: e.target.value})}
                 required
                 className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition cursor-pointer"
               >
                 <option value="" disabled>Votre secteur d'activité *</option>
                 {ONBOARDING_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
               </select>
               {leadData.category === 'Autre' && <input type="text" placeholder="Précisez votre activité *" required value={leadData.customCategory} onChange={e => setLeadData({...leadData, customCategory: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />}

               <input type="email" placeholder="Email (Optionnel)" value={leadData.email} onChange={e => setLeadData({...leadData, email: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />

               <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition flex justify-center items-center gap-2">
                 Recevoir mon diagnostic <ArrowRight size={18}/>
               </button>
            </form>

            <button onClick={() => setShowExitIntent(false)} className="mt-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition">Non merci, je préfère tout faire manuellement</button>
          </div>
        </div>
      )}
    </main>
  );
}

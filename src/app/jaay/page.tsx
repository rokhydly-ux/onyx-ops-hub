"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { 
  Zap, AlertCircle, CheckCircle, Smartphone, 
  Calculator, Gift, Bot, 
  Truck, ArrowRight, ShoppingCart, ChevronLeft,
  Sparkles, LayoutDashboard, QrCode, PlayCircle
} from "lucide-react";

export default function OnyxJaayLanding() {
  const router = useRouter();

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
             <Zap size={14} className="fill-[#39FF14]" /> Fini le bricolage sur WhatsApp
         </div>
         <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter mb-8 leading-[0.95]">
             Ne vendez plus un simple produit. <br/>
             <span className="text-zinc-400">Vendez une expérience qui</span> <span className="text-[#39FF14] underline decoration-black decoration-8 underline-offset-8">encaisse 24h/24.</span>
         </h1>
         <p className="text-zinc-600 text-lg md:text-xl font-bold max-w-3xl mx-auto mb-12 leading-relaxed">
             Onyx Jaay est le 1er catalogue phygital au Sénégal pensé 100% pour WhatsApp. Transformez vos discussions interminables en commandes fermes, gérez votre stock en auto, et sachez exactement quel <span className="text-black font-black uppercase tracking-widest bg-[#39FF14]/20 px-2 py-0.5 rounded">xaliss</span> (marge nette) vous gagnez.
         </p>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button onClick={() => window.open('https://wa.me/221785338417', '_blank')} className="w-full sm:w-auto bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-2">
                 Démarrer l'essai (9 900 F/mois) <ArrowRight size={18} />
             </button>
             <button onClick={() => window.open('/keur-yaay', '_blank')} className="w-full sm:w-auto bg-transparent border-2 border-black text-black px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2">
                 <PlayCircle size={18} /> Voir une démo
             </button>
         </div>
      </section>

      {/* 2. LA RÉALITÉ VS LA MACHINE ONYX */}
      <section className="py-20 px-6 max-w-6xl mx-auto border-t border-zinc-200">
         <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Avant */}
            <div className="bg-white border-2 border-red-100 p-8 md:p-12 rounded-[3rem] shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-5 rounded-full blur-3xl"></div>
               <span className="bg-red-50 text-red-600 font-black uppercase text-[10px] px-4 py-2 rounded-full mb-8 inline-flex items-center gap-2 tracking-widest border border-red-200">
                   <AlertCircle size={14} /> La Réalité (Avant)
               </span>
               <ul className="space-y-6">
                  <li className="flex gap-4 items-start font-bold text-zinc-700"><span className="text-red-500 text-xl font-black">×</span> Spams de photos en statut WhatsApp tous les jours.</li>
                  <li className="flex gap-4 items-start font-bold text-zinc-700"><span className="text-red-500 text-xl font-black">×</span> Clients qui demandent "C'est combien ?" 20 fois.</li>
                  <li className="flex gap-4 items-start font-bold text-zinc-700"><span className="text-red-500 text-xl font-black">×</span> Calculs de marge à la main, erreurs d'inventaire.</li>
                  <li className="flex gap-4 items-start font-bold text-zinc-700"><span className="text-red-500 text-xl font-black">×</span> Livreurs perdus, aucun suivi des courses.</li>
               </ul>
            </div>

            {/* Après Onyx */}
            <div className="bg-black border-2 border-[#39FF14]/30 p-8 md:p-12 rounded-[3rem] relative overflow-hidden shadow-[0_20px_50px_rgba(57,255,20,0.15)] transform lg:scale-105 z-10">
               <div className="absolute top-0 right-0 w-48 h-48 bg-[#39FF14] opacity-[0.08] rounded-full blur-3xl"></div>
               <span className="bg-[#39FF14] text-black font-black uppercase text-[10px] px-4 py-2 rounded-full mb-8 inline-flex items-center gap-2 tracking-widest shadow-lg">
                   <CheckCircle size={14} /> La Machine Onyx
               </span>
               <ul className="space-y-6">
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#39FF14]" size={20}/> Lien pro (onyxlinks.com/boutique) instantané.</li>
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#39FF14]" size={20}/> Le client commande seul, son panier arrive tout prêt.</li>
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#39FF14]" size={20}/> Simulateur de rentabilité intégré (Marge nette auto).</li>
                  <li className="flex gap-4 items-start font-bold text-white"><CheckCircle className="shrink-0 text-[#39FF14]" size={20}/> Feuille de route Tiak-Tiak envoyée en un clic.</li>
               </ul>
            </div>
         </div>
      </section>

      {/* 3. L'ARSENAL DU COMMERÇANT */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
         <div className="text-center mb-16">
            <h2 className="font-sans text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-6">L'Arsenal du <span className="text-[#39FF14] bg-black px-4 py-1 rounded-xl">Commerçant</span></h2>
            <p className="text-zinc-500 font-bold max-w-2xl mx-auto text-lg">Organisez, vendez et fidélisez sans aucun effort technique. Voici vos nouvelles armes :</p>
         </div>

         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Carte 1 */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-zinc-200 shadow-sm hover:border-black hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><Smartphone size={28}/></div>
               <h3 className="font-sans text-2xl font-black uppercase mb-4 tracking-tighter">Expérience Client (Front)</h3>
               <ul className="space-y-3 text-sm font-semibold text-zinc-600">
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Catalogue PWA ultra-rapide</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Vidéos YouTube/TikTok intégrées sur les fiches produits</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Panier WhatsApp structuré</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Système d'avis certifiés</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Suivi de commande public</li>
               </ul>
            </div>

            {/* Carte 2 */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-zinc-200 shadow-sm hover:border-black hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><LayoutDashboard size={28}/></div>
               <h3 className="font-sans text-2xl font-black uppercase mb-4 tracking-tighter">Gestion & Back-Office</h3>
               <ul className="space-y-3 text-sm font-semibold text-zinc-600">
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Éditeur de page sans code (Drag & Drop)</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> IA de rédaction de descriptions</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Générateur de QR Code par produit pour boutique physique</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Import/Export Excel massif</li>
               </ul>
            </div>

            {/* Carte 3 */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-zinc-200 shadow-sm hover:border-[#39FF14] hover:shadow-[0_10px_30px_rgba(57,255,20,0.15)] transition-all group">
               <div className="w-14 h-14 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><Calculator size={28}/></div>
               <h3 className="font-sans text-2xl font-black uppercase mb-4 tracking-tighter">Rentabilité & Stocks</h3>
               <ul className="space-y-3 text-sm font-semibold text-zinc-600">
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Simulateur de Rentabilité (Marge nette après frais Wave/OM, TVA, Pub)</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Déduction automatique des stocks</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Badges d'urgence publics ('Nouveau', 'Épuisé')</li>
               </ul>
            </div>

            {/* Carte 4 */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-zinc-200 shadow-sm hover:border-black hover:shadow-xl transition-all group">
               <div className="w-14 h-14 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><Gift size={28}/></div>
               <h3 className="font-sans text-2xl font-black uppercase mb-4 tracking-tighter">Fidélisation (CRM)</h3>
               <ul className="space-y-3 text-sm font-semibold text-zinc-600">
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Récupération auto des paniers abandonnés via WhatsApp</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Programme de fidélité par points</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Générateur de Codes Promos paramétrables</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Base de données clients 100% à vous</li>
               </ul>
            </div>

            {/* Carte 5 */}
            <div className="bg-white p-8 md:p-10 rounded-[3rem] border border-zinc-200 shadow-sm hover:border-black hover:shadow-xl transition-all group lg:col-span-2">
               <div className="w-14 h-14 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform"><Bot size={28}/></div>
               <h3 className="font-sans text-2xl font-black uppercase mb-4 tracking-tighter">IA & Logistique</h3>
               <ul className="space-y-3 text-sm font-semibold text-zinc-600 grid sm:grid-cols-2">
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Scanner IA de rétention (suggère des promos pour les inactifs)</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Calculateur auto des frais de livraison par zones (Dakar & Banlieue)</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Assignation des livreurs</li>
                  <li className="flex items-start gap-2"><span className="text-[#39FF14] font-black">»</span> Factures et Devis PDF professionnels générés en 1 clic</li>
               </ul>
            </div>
         </div>
      </section>

      {/* 4. CROSS-SELLING (UPSELL) */}
      <section className="py-20 px-6">
         <div className="max-w-5xl mx-auto bg-zinc-900 border-4 border-[#39FF14] p-10 md:p-16 rounded-[3.5rem] text-center shadow-[0_30px_60px_rgba(57,255,20,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14] opacity-[0.05] blur-3xl pointer-events-none rounded-full"></div>
            <Truck size={56} className="mx-auto text-[#39FF14] mb-8 animate-bounce" />
            <h2 className="font-sans text-3xl md:text-5xl font-black uppercase text-white tracking-tighter mb-6 leading-tight">Vous gérez des livreurs <br/> et un gros stock ?</h2>
            <p className="text-zinc-400 font-medium text-lg max-w-2xl mx-auto mb-10 leading-relaxed">Passez au <span className="text-white font-bold bg-[#39FF14]/20 px-2 py-1 rounded">Pack Trio à 24 900 FCFA</span>. Ne tombez jamais en rupture et contrôlez tout le cash encaissé par vos livreurs en temps réel.</p>
            <button onClick={() => window.open('https://wa.me/221785338417', '_blank')} className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white hover:scale-105 transition-all shadow-2xl relative z-10 flex items-center justify-center gap-2 mx-auto">
               Découvrir le Pack Trio <ArrowRight size={18} />
            </button>
         </div>
      </section>

      {/* 5. ARGUMENT D'AUTORITÉ */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
         <Sparkles size={48} className="mx-auto text-zinc-300 mb-10" />
         <blockquote className="font-sans text-2xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-tight italic text-zinc-800">
            "Vous ne vendez pas un site internet. Un site internet c'est mort, c'est dur à gérer. Vous vous offrez un assistant digital sur-mesure qui travaille 24h/24, gère les calculs mentaux et multiplie les ventes sans effort technique."
         </blockquote>
      </section>

      {/* 6. FOOTER CTA */}
      <section className="bg-black text-white pt-24 pb-32 px-6 rounded-t-[4rem] text-center relative overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#39FF14] rounded-full blur-[150px] opacity-[0.15] pointer-events-none"></div>
         <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="font-sans text-4xl md:text-6xl font-black uppercase tracking-tighter mb-8 leading-[0.95]">Arrêtez de perdre de l'argent dans vos DM WhatsApp.</h2>
            <p className="text-zinc-400 font-bold text-lg md:text-xl mb-12">Laissez la machine Onyx faire le travail difficile. Encaisser devient un jeu d'enfant.</p>
            <button onClick={() => window.open('https://wa.me/221785338417', '_blank')} className="bg-[#39FF14] text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-base hover:scale-105 hover:bg-white transition-all shadow-[0_20px_50px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3 mx-auto">
               <ShoppingCart size={24} /> Créer ma machine à cash
            </button>
         </div>
      </section>
    </main>
  );
}

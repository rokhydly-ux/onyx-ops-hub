"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  Zap, AlertCircle, CheckCircle, Smartphone, 
  Calculator, Gift, Bot, 
  Truck, ArrowRight, ShoppingCart, ChevronLeft,
  Sparkles, LayoutDashboard, QrCode, PlayCircle, X,
  UserPlus, MessageSquare, ArrowUp, ChevronDown, Send
} from "lucide-react";

const ONBOARDING_CATEGORIES = [
  "Restauration / Fast-Food",
  "Boutique / Prêt-à-porter",
  "E-commerce / Vente en ligne",
  "Prestation de services",
  "Autre"
];

const REGIONS_SENEGAL = ["Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", "Kolda", "Louga", "Matam", "Saint-Louis", "Sédhiou", "Tambacounda", "Thiès", "Ziguinchor"];

export default function OnyxJaayLanding() {
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [leadData, setLeadData] = useState({ name: '', phone: '', email: '', category: '', customCategory: '', saas: 'Onyx Jaay', region: '', address: '' });
  const [countryCode, setCountryCode] = useState("+221");
  const waNumber = "221785338417";

  const [refId, setRefId] = useState<string | null>(null);

  const [showExitIntent, setShowExitIntent] = useState(false);
  const [hasTriggeredExitIntent, setHasTriggeredExitIntent] = useState(false);

  const [showScrollTop, setShowScrollTop] = useState(false);

  // Navigation Menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Configuration Bot Fanta (FAQ Auto - Onyx Jaay)
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [isBotDismissed, setIsBotDismissed] = useState(false);
  const [userReply, setUserReply] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [botMessages, setBotMessages] = useState<any[]>([
    { sender: 'bot', text: "👋 Nanga def ! Je suis Fanta. Avez-vous des questions sur Onyx Jaay, notre catalogue digital pour WhatsApp ?", options: ["Oui", "Non"] }
  ]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const ref = searchParams.get('ref');
    if (ref) {
      setRefId(ref);
      localStorage.setItem('onyx_ambassador_ref', ref);
    } else {
      const storedRef = localStorage.getItem('onyx_ambassador_ref');
      if (storedRef) setRefId(storedRef);
    }

    const timer = setTimeout(() => {
      setIsBotOpen(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [botMessages]);

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
        source: data.source || 'Landing Page Onyx Jaay',
        intent: data.intent || 'Contact',
        phone: data.contact || '',
        full_name: data.full_name || 'Visiteur Anonyme',
        city: data.city || data.region || leadData.region || '',
        address: data.address || leadData.address || '',
        message: data.message || '',
        status: 'Nouveau',
        password: 'central2026'
      };
      if (data.email) payload.email = data.email;
      if (refId) payload.ambassador_id = refId;
      
      const { error } = await supabase.from('leads').insert([payload]);
      if (error) console.error("ERREUR SUPABASE (Leads) :", error.message);
    } catch (e) { 
      console.error("ERREUR CATCH (Leads) :", e); 
    }
  };

  const handleDirectWaClick = async (intent: string, msg: string) => {
    await saveLead({ source: 'Bouton Site Onyx Jaay', intent, message: msg, contact: leadData.phone || '', full_name: leadData.name || 'Visiteur Anonyme' });
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
    const msg = `🚀 *NOUVEAU LEAD (Onyx Jaay)*\n\n*Nom:* ${leadData.name}\n*Téléphone:* ${finalPhone}\n*Email:* ${leadData.email || 'Non renseigné'}\n*Région:* ${leadData.region || 'Non renseignée'}\n*Activité:* ${finalCategory}\n\n_Le client a créé son compte lui-même via le formulaire complet._`;

    await saveLead({ source: 'Landing Page Onyx Jaay', intent: 'Création Compte Onyx Jaay', contact: finalPhone, full_name: leadData.name, city: leadData.region, address: leadData.address, message: `Activité: ${finalCategory} | Email: ${leadData.email}`, email: leadData.email });
    
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
    const msg = `🚀 *NOUVEAU LEAD (Exit Intent)*\n\n*Nom:* ${leadData.name || 'Visiteur'}\n*Téléphone:* ${finalPhone}\n*Email:* ${leadData.email || 'Non renseigné'}\n*Région:* ${leadData.region || 'Non renseignée'}\n*Activité:* ${finalCategory || 'Non renseignée'}\n\n_Le client souhaite un diagnostic gratuit._`;

    await saveLead({
       source: 'Exit Intent Onyx Jaay',
       intent: `Diagnostic Gratuit`,
       contact: finalPhone,
       full_name: leadData.name || 'Visiteur',
       city: leadData.region,
       address: leadData.address,
       message: `Demande de diagnostic gratuit | Activité: ${finalCategory || 'Non renseignée'} | Email: ${leadData.email}`
    });

    setShowExitIntent(false);
    alert(`Merci ! Votre demande est enregistrée.\nNous allons vous rediriger vers notre équipe WhatsApp pour votre diagnostic gratuit.`);
    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const processBotReply = (reply: string) => {
    if(!reply.trim()) return;
    const newMsgs = [...botMessages, { sender: 'client', text: reply }];
    setBotMessages(newMsgs);
    setUserReply("");

    setTimeout(async () => {
        const lowerReply = reply.toLowerCase();
        let botResponse = "";
        let botOptions: string[] | undefined = undefined;

        if (lowerReply === "oui") {
            botResponse = "Je vous écoute ! Vous pouvez me poser vos questions sur le prix, la création du catalogue, ou la livraison.";
        } else if (lowerReply === "non" || lowerReply === "non merci") {
            botResponse = "Très bien ! N'hésitez pas à cliquer sur le bouton en bas de la page pour commencer votre mois d'essai à 2.900 F.";
        } else if (lowerReply === "oui, parler à un conseiller" || lowerReply.includes("conseiller") || lowerReply.includes("humain") || lowerReply.includes("whatsapp")) {
            botResponse = "Je vous redirige vers notre expert sur WhatsApp ! À tout de suite 🚀";
            setTimeout(() => { window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent("Bonjour l'équipe Onyx ! Je suis sur la page Onyx Jaay et j'aimerais parler à un conseiller.")}`, '_blank'); }, 1000);
        } else if (lowerReply.includes("prix") || lowerReply.includes("coût") || lowerReply.includes("tarif") || lowerReply.includes("combien")) {
            botResponse = "Onyx Jaay coûte 13 900 F/mois, mais pour te prouver que ça marche, le 1er mois est à 2.900 F (-79%) !";
        } else if (lowerReply.includes("catalogue") || lowerReply.includes("produit") || lowerReply.includes("ajouter") || lowerReply.includes("comment")) {
            botResponse = "C'est super simple : vous ajoutez vos photos et prix depuis votre téléphone. Vos clients auront un beau lien pour commander directement sans vous poser 20 fois la même question !";
        } else if (lowerReply.includes("livraison") || lowerReply.includes("tiak") || lowerReply.includes("livreur")) {
            botResponse = "Onyx Jaay calcule automatiquement les frais de livraison selon la zone de votre client. (Si vous voulez aussi suivre vos livreurs en temps réel, regardez notre Pack Trio !)";
        } else if (lowerReply.includes("paiement") || lowerReply.includes("payer") || lowerReply.includes("wave") || lowerReply.includes("orange money")) {
            botResponse = "Le client valide son panier sur WhatsApp avec le montant total exact (produits + livraison). Vous pouvez encaisser par Wave, Orange Money ou à la livraison en toute simplicité.";
        } else {
            botResponse = "C'est noté ! Voulez-vous que je vous mette en relation avec un conseiller humain sur WhatsApp pour voir comment adapter ça à votre boutique ?";
            botOptions = ["Oui, parler à un conseiller", "Non merci"];
        }

        setBotMessages(prev => [...prev, { sender: 'bot', text: botResponse, options: botOptions }]);

        try {
            await supabase.from('leads').insert([{
                full_name: 'Visiteur Jaay', intent: 'Question Bot Jaay', source: 'Bot Fanta FAQ', message: reply, status: 'Nouveau', ambassador_id: refId || undefined
            }]);
        } catch (err) {}
    }, 1000);
  };

  const handleOutsideClick = (setter: any) => (e: any) => {
    if (e.target.id === "modal-overlay") setter(false);
  };

  return (
    <main className="min-h-screen bg-zinc-50 text-black overflow-x-hidden selection:bg-[#39FF14]/30 pb-24">
      
      {/* BANNIÈRE PROMO HAUT DE PAGE */}

      <div className="bg-[#39FF14] text-black text-center py-2.5 px-4 font-black uppercase text-[10px] md:text-xs tracking-widest z-50 relative shadow-md">
          🎁 Normalement 13.900F. Ce mois-ci 2.900F (prix d’un poulet) pour tester. Si ça ne te fait pas gagner 1h/jour, on te rembourse !
      </div>

      {/* Navbar */}
      <nav className="p-6 flex flex-col sm:flex-row justify-between items-center max-w-7xl mx-auto gap-4 relative z-50">
         <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 hover:scale-105 transition-transform">
            <img src="https://i.ibb.co/1Gssqd2p/LOGO-SITE.png" alt="Onyx Logo" width="350" height="250" className="h-[60px] w-auto object-contain" />
         </button>
         
         <div className="flex items-center gap-4">
             <div className="relative" ref={dropdownRef}>
                 <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="text-xs font-bold text-zinc-500 uppercase tracking-widest hover:text-black flex items-center gap-1 transition-colors">
                    Autres Solutions <ChevronDown size={14} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                 </button>
                 <div className={`absolute top-full right-0 mt-2 bg-white border border-zinc-200 shadow-xl rounded-2xl p-2 w-48 flex flex-col z-50 transition-all origin-top-right ${isDropdownOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                    <button onClick={() => window.location.href = '/'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🏠 Accueil Onyx</button>
                   <button onClick={() => window.location.href = '/solutions/onyx-tekki'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">📦 Onyx Tekki</button>
                   <button onClick={() => window.location.href = '/solutions/onyx-tekki-pro'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🚀 Onyx Tekki Pro</button>
                   <button onClick={() => window.location.href = '/solutions/onyxpub'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🎯 OnyxPub</button>
                   <button onClick={() => window.location.href = '/solutions/onyxcrm'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🤝 Onyx CRM</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-tontine'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">💰 Onyx Tontine</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-tiak'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🚚 Onyx Tiak</button>
                    <button onClick={() => window.location.href = '/solutions/onyx-menu'} className="text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition">🍽️ Onyx Menu</button>
                 </div>

             </div>
             <button onClick={() => window.location.href = '/'} className="bg-zinc-100 text-black px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-black hover:text-[#39FF14] transition-colors flex items-center gap-1">
                 <ChevronLeft size={14}/> Accueil
             </button>
         </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="pt-10 pb-20 px-6 max-w-5xl mx-auto text-center">
         <div className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 shadow-[0_10px_20px_rgba(57,255,20,0.2)]">
             <Zap size={14} className="fill-[#39FF14]" /> Fini le bricolage sur WhatsApp
         </div>
         <h1 className={`${spaceGrotesk.className} text-5xl md:text-6xl lg:text-7xl font-black uppercase tracking-tighter mb-8 leading-[0.95]`}>
             Arrêtez de perdre du temps à <br/>
             <span className="text-[#39FF14] underline decoration-black decoration-8 underline-offset-8">calculer vos marges.</span>
         </h1>
         <p className="text-zinc-600 text-lg md:text-xl font-bold max-w-3xl mx-auto mb-12 leading-relaxed">
             <strong className="text-black bg-[#39FF14]/20 px-2 py-0.5 rounded">Normalement 13.900F. Ce mois-ci 2.900F (prix d’un poulet) pour tester. Si ça te fait pas gagner 1h/jour, je te rembourse.</strong><br/><br/>Onyx Jaay est le 1er catalogue phygital pensé 100% pour WhatsApp. Transformez vos discussions en commandes fermes, et gérez votre stock en auto.
         </p>
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <button onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }} className="w-full sm:w-auto bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 transition-all shadow-2xl flex items-center justify-center gap-2">
                 Je teste pour 2.900F → Paiement Wave/OM <ArrowRight size={18} />
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
            <button onClick={() => router.push('/trio')} className="bg-[#39FF14] text-black px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-white hover:scale-105 transition-all shadow-2xl relative z-10 flex items-center justify-center gap-2 mx-auto">
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
            <button onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }} className="bg-[#39FF14] text-black px-12 py-6 rounded-[2rem] font-black uppercase tracking-widest text-base hover:scale-105 hover:bg-white transition-all shadow-[0_20px_50px_rgba(57,255,20,0.3)] flex items-center justify-center gap-3 mx-auto">
               <ShoppingCart size={24} /> Créer ma machine à cash
            </button>
         </div>
      </section>

      {/* MODALE : ONBOARDING CAPTURE LEAD (MAIMOUNA) */}
      {showOnboarding && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowOnboarding)} className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-4xl relative overflow-hidden flex flex-col md:flex-row shadow-[0_0_50px_rgba(57,255,20,0.15)] animate-in zoom-in min-h-[500px]">
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
            <div className="flex-1 p-6 sm:p-10 flex flex-col justify-center">
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
                            source: 'Onboarding Onyx Jaay', 
                            intent: 'Lead Partiel (Abandon Étape 1)', 
                            contact: leadData.phone, 
                            full_name: leadData.name 
                          });
                          setOnboardingStep(1); 
                      }} className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-sm shadow-xl hover:scale-105 transition flex items-center justify-center gap-3">
                         <UserPlus size={20} /> Créer mon compte moi-même
                      </button>
                      <button onClick={() => { if(!leadData.name || !leadData.phone) return alert('Veuillez saisir votre prénom et numéro WhatsApp.'); handleDirectWaClick('Démarrage Onyx Jaay', `Bonjour, je m'appelle ${leadData.name} et je souhaite démarrer un essai pour Onyx Jaay.`); }} className="w-full bg-zinc-100 text-black py-5 rounded-[2rem] font-black uppercase text-sm shadow-sm hover:bg-zinc-200 transition flex items-center justify-center gap-3">
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
                       <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Région *</label>
                       <select required value={leadData.region} onChange={e => setLeadData({...leadData, region: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition cursor-pointer appearance-none">
                         <option value="" disabled>Sélectionner votre région</option>
                         {REGIONS_SENEGAL.map(r => <option key={r} value={r}>{r}</option>)}
                       </select>
                     </div>

                     <div>
                       <label className="text-xs font-black uppercase tracking-widest text-zinc-500 ml-2 mb-1 block">Adresse / Quartier *</label>
                       <input type="text" required value={leadData.address} onChange={e => setLeadData({...leadData, address: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black focus:ring-2 focus:ring-[#39FF14]/30 transition" placeholder="Votre adresse complète" />
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
          <div className="bg-white p-6 sm:p-10 rounded-3xl max-w-lg w-full relative shadow-[0_0_100px_rgba(57,255,20,0.2)] animate-in zoom-in text-center border-t-8 border-black">
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

               <select value={leadData.region} onChange={e => setLeadData({...leadData, region: e.target.value})} required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition cursor-pointer appearance-none">
                 <option value="" disabled>Votre région *</option>
                 {REGIONS_SENEGAL.map(r => <option key={r} value={r}>{r}</option>)}
               </select>
               
               <input type="text" placeholder="Quartier / Adresse *" required value={leadData.address} onChange={e => setLeadData({...leadData, address: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />

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

      {/* BOUTON REMONTER EN HAUT */}
      {showScrollTop && (
         <button 
           onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
           className="fixed bottom-24 left-6 z-[90] bg-white text-black p-3 md:p-4 rounded-full shadow-2xl border border-zinc-200 hover:scale-110 hover:border-black transition-all animate-in fade-in slide-in-from-bottom-4"
         >
           <ArrowUp size={24} />
         </button>
      )}

      {/* BOT FANTA FAQ ONYX JAAY */}
      <div className="fixed bottom-24 right-6 z-[90] flex flex-col items-end">
        {isBotOpen && (
          <div className="bg-white rounded-[2rem] shadow-2xl border-2 border-[#39FF14] p-0 mb-4 w-[340px] h-[400px] flex flex-col animate-in zoom-in duration-300 overflow-hidden">
             <div className="bg-black p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-[#39FF14] flex items-center justify-center text-xl">👩🏾‍💻</div>
                      <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#39FF14] rounded-full border border-black animate-pulse"></div>
                   </div>
                   <div><p className="text-[#39FF14] font-black uppercase text-xs">Fanta - Conseillère</p></div>
                </div>
                <button onClick={() => setIsBotOpen(false)} className="text-zinc-400 hover:text-white transition"><X size={18}/></button>
             </div>
             
             <div className="flex-1 bg-zinc-50 p-4 overflow-y-auto flex flex-col space-y-4 custom-scrollbar">
                {botMessages.map((msg, i) => (
                   <div key={i} className={`flex flex-col ${msg.sender === 'bot' ? 'items-start' : 'items-end'}`}>
                      <div className={`p-3 rounded-2xl max-w-[90%] text-sm font-medium whitespace-pre-wrap ${msg.sender === 'bot' ? 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-sm' : 'bg-black text-[#39FF14] rounded-tr-none shadow-md'}`}>
                         {msg.text}
                      </div>
                      {msg.options && (
                         <div className="flex flex-wrap gap-2 mt-2 w-full">
                            {msg.options.map((opt: string, idx: number) => (
                               <button key={idx} onClick={() => processBotReply(opt)} className="bg-white border border-zinc-200 text-black text-xs font-bold px-4 py-2 rounded-xl hover:bg-black hover:text-[#39FF14] shadow-sm transition-colors">{opt}</button>
                            ))}
                         </div>
                      )}
                   </div>
                ))}
                <div ref={chatEndRef} />
             </div>

             <div className="p-3 bg-white border-t border-zinc-200 flex gap-2">
                <input type="text" value={userReply} onChange={e => setUserReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && processBotReply(userReply)} placeholder="Poser une question..." className="flex-1 bg-zinc-100 rounded-xl px-4 outline-none text-sm font-bold focus:ring-1 focus:ring-black" />
                <button onClick={() => processBotReply(userReply)} className="bg-[#39FF14] p-3 rounded-xl text-black hover:scale-105 transition"><Send size={18}/></button>
             </div>
          </div>
        )}
        
        {!isBotOpen && !isBotDismissed && (
           <div className="relative group animate-bounce flex items-center justify-center">
             <button 
               onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsBotDismissed(true); }} 
               className="absolute -top-1 -right-1 bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-white hover:bg-black p-1 rounded-full z-10 transition-colors shadow-sm"
             >
               <X size={14} />
             </button>
             <button onClick={() => setIsBotOpen(true)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#39FF14] hover:scale-110 transition-transform bg-black relative flex items-center justify-center text-2xl">
               👩🏾‍💻
             </button>
           </div>
        )}
      </div>

      {/* STICKY BOTTOM BAR (Offre Gratuite) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-full">
          <div className="max-w-4xl mx-auto flex justify-between items-center px-2">
             <div>
                <p className="font-black text-sm md:text-base text-black"><span className="line-through text-red-500 text-xs mr-2">13 900F</span><span className="text-[#39FF14]">2 900 F</span><span className="text-zinc-500 text-xs font-bold">/1er mois</span></p>
                <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">Sans engagement. <span className="text-black bg-[#39FF14] px-1.5 py-0.5 rounded shadow-sm">SATISFAIT OU REMBOURSÉ</span></p>
             </div>
             <button onClick={() => { setShowOnboarding(true); setOnboardingStep(0); }} className="bg-black text-[#39FF14] px-6 md:px-8 py-3 rounded-xl md:rounded-2xl font-black uppercase text-xs md:text-sm hover:scale-105 transition-transform shadow-[0_0_20px_rgba(57,255,20,0.4)]">
                Je teste pour 2.900F → Wave/OM
             </button>
          </div>
      </div>

    </main>
  );
}

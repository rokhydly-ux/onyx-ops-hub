"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Space_Grotesk, Inter } from "next/font/google";
import { supabase } from "../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Smartphone, Truck, Box, Utensils, Calendar, 
  ArrowRight, Users, Target, Zap, CheckCircle2, AlertCircle, 
  Lock, Handshake, Package, Info, X, Clock, Mail, Menu, 
  ChevronRight, Star, MessageSquare, Flame, PlayCircle, Share2, 
  Link, Download, Wallet, Check, Send
} from "lucide-react";

type PlanKey = "solo" | "trio" | "full" | "premium";

const PLAN_DETAILS: Record<PlanKey, any> = {
  solo: { title: "Onyx Solo : L'essentiel WhatsApp", desc: "Digitalisez votre boutique en 24h.", benefits: ["Catalogue interactif", "Lien unique"], why: "Gain de temps.", cible: "Vendeurs", avantage: "Fini le manuel.", chiffreCle: "+15% de ventes." },
  trio: { title: "Pack Trio : Le Contrôle Total", desc: "Vente + Stock + Tiak.", benefits: ["Inventaire", "Facturation", "Suivi logistique"], why: "Sérénité.", cible: "Boutiques", avantage: "Maîtrise totale.", chiffreCle: "0 rupture." },
  full: { title: "Pack Full : L'Ecosystème", desc: "Les 6 SaaS travaillent ensemble.", benefits: ["RH, Paie", "Menu QR"], why: "Pour scaler.", cible: "PME", avantage: "Digital 360°.", chiffreCle: "Gain de 10h/sem." },
  premium: { title: "Onyx Premium : L'Elite", desc: "Intégrez l'IA.", benefits: ["Studio IA", "CRM"], why: "Domination.", cible: "Franchises", avantage: "IA marketing.", chiffreCle: "Croissance X2." },
};

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600"] });

const SOLUTIONS = [
  { id: "Onyx Vente", icon: Smartphone, pain: "Photos interminables.", solution: "Catalogue digital.", upsellName: "Pack Trio", upsellPrice: "17.500F" },
  { id: "Onyx Tiak", icon: Truck, pain: "Livreurs perdus.", solution: "Suivi temps réel.", upsellName: "Pack Trio", upsellPrice: "17.500F" },
  { id: "Onyx Stock", icon: Box, pain: "Ruptures fatales.", solution: "Inventaire par scan.", upsellName: "Pack Trio", upsellPrice: "17.500F" },
  { id: "Onyx Menu", icon: Utensils, pain: "Menus sales.", solution: "QR Menu interactif.", upsellName: "Pack Full", upsellPrice: "30.000F" },
  { id: "Onyx Booking", icon: Calendar, pain: "No-shows.", solution: "Réservations en ligne.", upsellName: "Pack Full", upsellPrice: "30.000F" },
  { id: "Onyx Staff", icon: Users, pain: "Pointages frauduleux.", solution: "Pointage GPS WhatsApp.", upsellName: "Pack Full", upsellPrice: "30.000F" },
];

const PACKS: Array<any> = [
  { id: "solo", name: "Solo", price: 7500, label: "Onyx Solo", rating: "4.9/5", avis: 142 },
  { id: "trio", name: "Pack Trio", price: 17500, label: "Pack Trio", rating: "5.0/5", avis: 89 },
  { id: "full", name: "Pack Full", price: 30000, label: "Pack Full", rating: "4.9/5", avis: 215 },
  { id: "premium", name: "Premium", price: 75000, label: "Onyx Premium", rating: "5.0/5", avis: 34 },
];

const MOCK_SCENARIOS = [
  { avant: { phone: "+221 77 000 00 00", text: "Pointage chantier ?", tag: "RH", issue: "Pertes" }, apres: { tag: "OK", title: "RH", text: "Modou a pointé.", sub: "Avance déduite." } },
  { avant: { phone: "+221 76 111 11 11", text: "Tu as la taille 42 ?", tag: "Vente", issue: "Temps" }, apres: { tag: "Payé", title: "Vente", text: "Devis payé.", sub: "Stock à jour." } }
];

export default function OnyxOpsElite() {
  const router = useRouter();
  const [activeView, setActiveView] = useState<'home' | 'about' | 'blog' | 'dashboard'>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey | null>(null);
  
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);
  const [saasMetier, setSaasMetier] = useState("");
  
  const [activeProfiles, setActiveProfiles] = useState<string[]>([]);
  const [premiumStep, setPremiumStep] = useState(0);
  const [premiumScore, setPremiumScore] = useState(0);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [isBotOpen, setIsBotOpen] = useState(false);
  
  // DONNÉES DYNAMIQUES
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  
  const waNumber = "221768102039";
  const getWaLink = (msg: string) => `https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`;

  const openAuthModal = (mode: 'login' | 'signup') => { setAuthMode(mode); setIsAuthModalOpen(true); };

  // ================= INIT DB (FETCH ARTICLES) =================
  useEffect(() => {
    const initData = async () => {
      // User auth
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setCurrentUser({ ...user, ...data });
        if (data?.role === 'admin') setIsAdmin(true);
      }
      
      // Fetch Articles from Supabase
      const { data: dbArticles } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
      if (dbArticles && dbArticles.length > 0) {
         setArticles(dbArticles);
      } else {
         // Fallback if empty
         setArticles([{ id: 1, title: "Articles de démonstration", content: "Les articles réels ajoutés depuis l'espace admin apparaîtront ici.", category: "Infos", pack_focus: "Tous" }]);
      }
    };
    initData();
  }, []);

  // ================= ROUTAGE INTELLIGENT BOT & LEAD CAPTURE =================
  const handleBotAction = async (msg: string, intent: string) => {
    // 1. Enregistrement Silencieux du Lead dans Supabase
    try {
      await supabase.from('leads').insert({ 
        source: 'Bot Site Public', 
        intent: intent,
        status: 'Nouveau (Redirigé WA)'
      });
    } catch(e) { console.error("Lead capture failed", e) }

    // 2. Redirection vers WhatsApp
    window.open(getWaLink(msg), "_blank");
    setIsBotOpen(false);
  };

  const navigateTo = (view: 'home' | 'about' | 'blog' | 'dashboard', scrollId?: string) => {
    setIsMobileMenuOpen(false);
    setActiveView(view);
    if (scrollId) {
      setTimeout(() => { const element = document.getElementById(scrollId); if (element) element.scrollIntoView({ behavior: 'smooth' }); }, 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className={`${inter.className} min-h-screen bg-white text-black select-none print:hidden overflow-x-hidden pt-20 relative`}>
      <div className="fixed inset-0 z-0 opacity-[0.15] pointer-events-none bg-zinc-50" style={{ backgroundImage: `url('https://i.ibb.co/chCcXT7p/back-site.png')`, backgroundRepeat: 'repeat', backgroundSize: '400px' }} />

      <div className="relative z-10">
        {/* HEADER */}
        <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex justify-between items-center w-full z-50 shadow-sm transition-all duration-300">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('home')}>
            <span className={`${spaceGrotesk.className} font-bold tracking-tighter text-2xl`}>ONYX <span className="text-[#39FF14]">OPS</span></span>
          </div>
          
          <div className="hidden lg:flex gap-8 font-semibold text-sm uppercase items-center">
            <button onClick={() => navigateTo('home', 'solutions')} className="hover:text-[#39FF14] transition">Solutions</button>
            <button onClick={() => navigateTo('home', 'tarifs')} className="hover:text-[#39FF14] transition">Tarifs</button>
            <button onClick={() => navigateTo('dashboard')} className={`${activeView === 'dashboard' ? 'text-[#39FF14]' : ''} hover:text-[#39FF14] transition`}>Partenaires</button>
            <button onClick={() => navigateTo('blog')} className={`${activeView === 'blog' ? 'text-[#39FF14]' : ''} hover:text-[#39FF14] transition`}>Blog</button>
            
            {/* ROUTAGE STRICT ADMIN */}
            {currentUser ? (
               <div 
                 onClick={() => {
                    if(isAdmin) window.location.href = 'https://onyx-ops-hub.vercel.app/admin';
                    else router.push('/dashboard');
                 }}
                 className="flex items-center gap-3 cursor-pointer bg-zinc-100 hover:bg-zinc-200 p-1.5 pr-4 rounded-full transition-colors shadow-sm"
               >
                 <img src={currentUser.avatar_url || "https://ui-avatars.com/api/?name=User"} alt="" className="w-8 h-8 rounded-full object-cover" />
                 <div className="text-left">
                    <p className="text-[10px] font-black uppercase leading-none">{currentUser.full_name || "Membre Onyx"}</p>
                    <p className="text-[8px] font-bold text-[#39FF14] uppercase">{isAdmin ? 'Accès Admin (Strict)' : 'Accès Hub'}</p>
                 </div>
               </div>
            ) : (
               <button onClick={() => openAuthModal('login')} className="bg-black text-[#39FF14] px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition shadow-md">
                 Accès Hub
               </button>
            )}
          </div>
        </nav>

        {/* ACCUEIL */}
        {activeView === 'home' && (
          <div className="animate-in fade-in duration-500">
            <header className="pt-20 pb-12 px-6 text-center max-w-5xl mx-auto">
              <h1 className={`${spaceGrotesk.className} text-5xl md:text-7xl font-bold leading-[1] tracking-tighter mb-6`}>
                DIGITALISEZ VOTRE <br/> <span className="text-[#39FF14] italic">PROPRE EMPIRE.</span>
              </h1>
              <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium mb-10">La suite complète d'outils pour les entreprises. Gérez vos ventes, stocks, et livraisons via Whatsapp.</p>
              
              <div className="flex flex-wrap gap-4 justify-center mb-10">
                <button onClick={() => navigateTo('dashboard')} className="inline-flex items-center gap-2 bg-black text-[#39FF14] px-8 py-4 rounded-full font-bold text-sm uppercase shadow-lg">Devenir Partenaire</button>
              </div>
            </header>

            <section id="solutions" className="py-20 px-6 max-w-7xl mx-auto">
              <h2 className={`${spaceGrotesk.className} text-3xl font-bold mb-12 text-center`}>NOS 6 SOLUTIONS</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {SOLUTIONS.map((s, i) => (
                  <div key={i} onClick={() => setSelectedSaaS(s)} className="bg-white border p-8 rounded-[2.5rem] shadow-xl hover:border-[#39FF14] cursor-pointer">
                    <s.icon className="w-8 h-8 text-[#39FF14] mb-4" />
                    <h3 className="text-xl font-bold uppercase">{s.id}</h3>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* BLOG SYNCHRONISÉ */}
        {activeView === 'blog' && (
          <div className="py-20 px-6 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-[80vh]">
             <div className="text-center mb-16">
              <h1 className={`${spaceGrotesk.className} text-5xl md:text-6xl font-bold mb-4 uppercase tracking-tighter`}>BLOG & <span className="text-[#39FF14] italic">EXPERTISE.</span></h1>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {articles.map((article) => (
                <div key={article.id} onClick={() => setSelectedArticle(article)} className="bg-zinc-50 rounded-[3rem] p-8 border border-zinc-200 hover:border-[#39FF14] transition cursor-pointer group flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{article.category}</span>
                  </div>
                  <h3 className={`${spaceGrotesk.className} text-2xl font-bold mb-4 group-hover:text-[#39FF14] transition`}>{article.title}</h3>
                  <p className="text-zinc-600 text-sm line-clamp-3 mb-6">{article.content}</p>
                  <p className="text-xs font-bold text-black uppercase tracking-widest flex items-center gap-2 mt-auto">Lire l'article <ArrowRight className="w-4 h-4" /></p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOT ICON (PHOTO PERSONNAGE) & ROUTING INTELLIGENT */}
        <div className="fixed bottom-6 right-6 z-[90] flex flex-col items-end">
          {isBotOpen && (
            <div className="bg-white rounded-[2rem] shadow-2xl border border-zinc-200 p-6 mb-4 w-[300px] animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></div>
                  <span className="font-black text-xs uppercase text-black">Conseiller Onyx</span>
                </div>
                <button onClick={() => setIsBotOpen(false)} className="text-zinc-400 hover:text-black transition"><X className="w-4 h-4"/></button>
              </div>
              <p className="text-sm font-medium text-zinc-600 mb-4">Besoin d'aide pour choisir votre outil de gestion ?</p>
              <div className="space-y-2">
                <button onClick={() => handleBotAction("Bonjour, c'est quoi le Pack Solo ?", "Demande Info Solo")} className="block w-full text-left bg-zinc-100 hover:bg-zinc-200 text-xs font-bold p-3 rounded-xl transition">🤖 C'est quoi le Pack Solo ?</button>
                <button onClick={() => handleBotAction("Bonjour, comment marche le pointage GPS ?", "Demande Info RH")} className="block w-full text-left bg-zinc-100 hover:bg-zinc-200 text-xs font-bold p-3 rounded-xl transition">🤖 Le pointage GPS, comment ça marche ?</button>
                <button onClick={() => handleBotAction("Bonjour, je veux parler à un humain pour mon business.", "Contact Humain")} className="block w-full text-center bg-black text-[#39FF14] text-xs font-black p-3 rounded-xl transition mt-4 uppercase shadow-lg">🗣️ Parler sur WhatsApp</button>
              </div>
            </div>
          )}

          <button onClick={() => setIsBotOpen(!isBotOpen)} className="w-16 h-16 rounded-full shadow-2xl overflow-hidden border-2 border-[#39FF14] hover:scale-110 transition-transform bg-black relative">
            <img src="https://i.ibb.co/bRdvjrhV/ONYX-LOGOS-2.png" alt="Conseillère" className="w-full h-full object-cover opacity-90 hover:opacity-100" />
            <div className="absolute top-1 right-1 w-3 h-3 bg-[#39FF14] border-2 border-black rounded-full animate-pulse"></div>
          </button>
        </div>

        {/* MODALE ARTICLE BLOG (LECTURE) */}
        {selectedArticle && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setSelectedArticle(null)}>
            <div onClick={(e) => e.stopPropagation()} className="relative bg-white rounded-[3rem] max-w-2xl w-full p-8 shadow-2xl animate-in zoom-in duration-300">
              <button onClick={() => setSelectedArticle(null)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-black hover:text-[#39FF14]"><X className="w-5 h-5" /></button>
              <h2 className={`${spaceGrotesk.className} text-3xl font-bold mb-8 mt-4`}>{selectedArticle.title}</h2>
              <div className="text-zinc-700 leading-relaxed space-y-4 mb-10 text-sm whitespace-pre-wrap">{selectedArticle.content}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
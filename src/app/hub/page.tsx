"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  Smartphone, Truck, Utensils, Box, Lock, LogOut, 
  User, GraduationCap, ArrowRight, ShieldCheck, Wallet, AlertTriangle, HelpCircle, X,
  Search, CheckCircle, ExternalLink, Calendar, Users, MessageSquare, Mail, Package, Sparkles
} from "lucide-react";
import AccountModal from "@/components/AccountModal";
import { supabase } from "@/lib/supabaseClient";

const spaceGrotesk = { className: "font-sans" };

const APPS = [
  { id: "vente", name: "Onyx Jaay", icon: Smartphone, color: "bg-green-500", route: "/vente", desc: "Catalogue & Boutique", price: "13 900 F" },
  { id: "stock", name: "Onyx Stock", icon: Box, color: "bg-emerald-600", route: "/stock", desc: "Gestion d'Inventaire", price: "13 900 F" },
  { id: "tiak", name: "Onyx Tiak", icon: Truck, color: "bg-teal-500", route: "/tiak", desc: "Logistique & Livraisons", price: "13 900 F" },
  { id: "menu", name: "Onyx Menu", icon: Utensils, color: "bg-rose-500", route: "/menu", desc: "Menu QR & Commandes", price: "13 900 F" },
  { id: "booking", name: "Onyx Booking", icon: Calendar, color: "bg-indigo-500", route: "/booking", desc: "Rendez-vous en ligne", price: "13 900 F" },
  { id: "formation", name: "Onyx Formation", icon: GraduationCap, color: "bg-yellow-500", route: "/formation", desc: "Académie Marketing", price: "13 900 F" },
  { id: "tontine", name: "Onyx Tontine", icon: Wallet, color: "bg-pink-500", route: "/tontine/admin", desc: "Finance & Tontine", price: "6 900 F" },
  { id: "staff", name: "Onyx Staff", icon: Users, color: "bg-cyan-500", route: "/staff", desc: "RH & Plannings", price: "13 900 F" },
  { id: "crm", name: "Onyx CRM", icon: ShieldCheck, color: "bg-[#39FF14]", route: "/crm", desc: "CRM B2B HT", price: "39 900 F" },
];

const PACK_CONTENTS: Record<string, string[]> = {
  "pack tekki": ["vente", "stock", "tiak"],
  "pack tekki (boutique)": ["vente", "stock", "tiak"],
  "onyxtekki (resto)": ["menu", "stock", "tiak"],
  "pack tekki pro": ["vente", "stock", "tiak", "formation", "staff"],
  "onyx crm": ["crm", "booking"],
  "pack onyx crm": ["crm", "booking"],
  "pack onyx gold": ["vente", "stock", "tiak", "formation", "staff", "crm", "booking", "menu", "tontine"],
  "onyx gold": ["vente", "stock", "tiak", "formation", "staff", "crm", "booking", "menu", "tontine"]
};

export default function OnyxHubPortal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        let role = 'CLIENT';
        let profileData: any = null;
        const { data: userData } = await supabase.from('users').select('*').eq('id', session.user.id).maybeSingle();
        if (userData) {
          role = userData.role;
          profileData = userData;
        } else {
          const { data: clientData } = await supabase.from('clients').select('*').eq('id', session.user.id).maybeSingle();
          if (clientData) profileData = clientData;
        }
        setUser(profileData ? { ...session.user, ...(profileData as any), role } : { ...session.user, role });

      } else {
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
          try {
            const parsedSession = JSON.parse(customSession);
          
            // Authentification silencieuse pour passer le RLS
            if (parsedSession.phone) {
               const authEmail = `${parsedSession.phone}@clients.onyxcrm.com`;
               const authPassword = parsedSession.password_temp || "central2026";
               await supabase.auth.signInWithPassword({ email: authEmail, password: authPassword });
            }
          
            const { data } = await supabase.from('clients').select('*').eq('id', parsedSession.id).maybeSingle();
            if (data) {
                setUser({ ...data, role: 'CLIENT' });
                localStorage.setItem('onyx_custom_session', JSON.stringify(data));
            } else {
                setUser({ ...parsedSession, role: parsedSession.role || 'CLIENT' });
            }
          } catch(e) {}
        } else {
          window.location.href = '/login';
          return;
        }
      }
      setLoading(false);
    };
    verifyAuth();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('onyx_custom_session');
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkAccess = (appId: string, user: any) => {
     if (!user) return false;
     if (user.role === 'SUPER_ADMIN') return true;
     const activeSaas = user.active_saas || [];
     const allSaas = [user.saas || '', ...activeSaas].map((s: string) => (s || '').toLowerCase());
     
     if (allSaas.some((s: string) => s === appId.toLowerCase() || s.includes(appId.toLowerCase()))) return true;
     
     for (const saas of allSaas) {
         for (const [packName, modules] of Object.entries(PACK_CONTENTS)) {
             if (saas.includes(packName) && modules.includes(appId)) {
                 return true;
             }
         }
     }
     return false;
  };

  const getIncludedPack = (appId: string, user: any) => {
     if (!user) return null;
     const activeSaas = user.active_saas || [];
     const allSaas = [user.saas || '', ...activeSaas];
     
     for (const saas of allSaas) {
         if (!saas) continue;
         if (saas.toLowerCase() === appId.toLowerCase() || saas.toLowerCase().includes(appId.toLowerCase())) continue;

         for (const [packName, modules] of Object.entries(PACK_CONTENTS)) {
             if (saas.toLowerCase().includes(packName) && modules.includes(appId)) {
                 return saas;
             }
         }
     }
     return null;
  };

  const getAppExpiryDate = (appId: string, user: any) => {
      if (user?.saas_expiration_dates) {
          const match = Object.keys(user.saas_expiration_dates).find(k => k.toLowerCase().includes(appId) || (appId === 'vente' && k.toLowerCase().includes('jaay')));
          if (match) return user.saas_expiration_dates[match];
      }
      return user?.expiration_date || user?.expiry_date;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const expiryStatus = (() => {
    let expDate;
    if (user?.expiration_date) expDate = new Date(user.expiration_date);
    else if (user?.expiry_date) expDate = new Date(user.expiry_date);
    else if (user?.created_at) {
        expDate = new Date(user.created_at);
        expDate.setDate(expDate.getDate() + 7);
    } else return null;

    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { expired: true, days: Math.abs(diffDays) };
    if (diffDays <= 5) return { expired: false, days: diffDays };
    return null;
  })();

  const filteredApps = APPS.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()) || app.desc.toLowerCase().includes(searchQuery.toLowerCase()));

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950 text-white">
        Chargement de votre espace...
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#f4f5f7] font-sans">
        
        <header className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md z-40 sticky top-0">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-[#39FF14] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.5)]">
               <span className="font-black text-black text-xs">OX</span>
            </div>
            <h1 className="text-lg font-black uppercase tracking-tighter hidden sm:block">OnyxOps Workspace</h1>
          </div>
          
          <div className="relative" ref={profileMenuRef}>
            <div className="flex items-center gap-3">
              {user?.email === 'rokhydly@gmail.com' && (
                 <div className="hidden sm:flex items-center gap-2 bg-zinc-900 p-1.5 pr-4 rounded-full border border-zinc-800 shadow-sm mr-2">
                    <img src={user.user_metadata?.avatar_url || "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg"} alt="Super Admin" className="w-7 h-7 rounded-full object-cover border border-[#39FF14]" />
                    <span className="text-[10px] font-black uppercase text-[#39FF14]">Super Admin</span>
                 </div>
              )}
              <button onClick={() => setShowHelpModal(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors text-xs font-bold mr-2">
                 <HelpCircle size={14} /> <span className="hidden sm:inline">Aide</span>
              </button>
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 hover:border-[#39FF14] transition-colors">
               <img src={user?.avatar_url || (user?.email === 'rokhydly@gmail.com' ? "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg" : 'https://ui-avatars.com/api/?name=' + user?.full_name)} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-[#39FF14]" />
               <span className="text-xs font-bold uppercase">{user?.full_name || 'Utilisateur'}</span>
            </button>
            </div>
            
            {isProfileMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-zinc-200 py-1 animate-in fade-in zoom-in-95 z-50">
                <button onClick={() => { setIsAccountModalOpen(true); setIsProfileMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">
                  <User size={16}/> Mon Compte
                </button>
                <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                  <LogOut size={16}/> Déconnexion
                </button>
              </div>
            )}
          </div>
        </header>
  
        <main className="max-w-6xl mx-auto p-8 pt-12 animate-in fade-in">
          {expiryStatus && (
            <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 sm:p-6 rounded-r-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl text-red-500 shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <p className="font-black text-red-800 text-sm sm:text-base uppercase tracking-tight mb-1">
                    {expiryStatus.expired ? "Votre accès a expiré" : `Attention, votre accès expire dans ${expiryStatus.days} jour${expiryStatus.days > 1 ? 's' : ''}`}
                  </p>
                  <p className="text-xs sm:text-sm text-red-600 font-medium">
                    {expiryStatus.expired ? "Veuillez renouveler votre abonnement pour continuer à utiliser vos outils sans interruption." : "Pensez à prolonger votre abonnement rapidement pour éviter toute coupure de vos services."}
                  </p>
                </div>
              </div>
              <button onClick={() => window.open(`https://wa.me/221785338417?text=${encodeURIComponent(`Bonjour, je souhaite ${expiryStatus.expired ? 'renouveler' : 'prolonger'} mon accès aux outils OnyxOps.`)}`, '_blank')} className="w-full sm:w-auto bg-red-500 text-white px-6 py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase hover:bg-red-600 transition-colors shadow-lg shrink-0">
                 {expiryStatus.expired ? "Renouveler l'accès" : "Prolonger maintenant"}
              </button>
            </div>
          )}

          <div className="mb-12 text-center sm:text-left flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
             <h2 className="text-3xl sm:text-4xl font-black uppercase text-zinc-900 tracking-tighter mb-2">
               Bonjour, {user?.full_name?.split(' ')[0] || 'Gérant'} !
             </h2>
             <p className="text-zinc-500 font-medium">Sélectionnez une application pour commencer à travailler.</p>
             {(user?.expiration_date || user?.expiry_date || user?.role === 'SUPER_ADMIN') && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white border border-zinc-200 shadow-sm text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-full">
                <ShieldCheck size={16} className={user?.role === 'SUPER_ADMIN' ? 'text-purple-500' : user.type === 'Client' ? 'text-green-500' : 'text-yellow-500'} />
                <span className="text-zinc-600">Statut :</span> 
                <span className={user?.role === 'SUPER_ADMIN' ? 'text-purple-600' : user.type === 'Client' ? 'text-green-600' : 'text-yellow-600'}>{user?.role === 'SUPER_ADMIN' ? 'Super Admin' : (user.type || 'Essai')}</span>
                {user?.role !== 'SUPER_ADMIN' && (
                  <>
                    <span className="text-zinc-400 mx-1">|</span>
                    <span className="text-zinc-600">Fin globale :</span> 
                    <span className="text-zinc-800">{formatDate(user.expiration_date || user.expiry_date)}</span>
                  </>
                )}
              </div>
             )}
            </div>
            
            {/* BARRE DE RECHERCHE */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
              <input 
                type="text" 
                placeholder="Rechercher une application..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-full py-3 pl-12 pr-4 text-sm font-bold outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/20 transition-all shadow-sm"
              />
            </div>
          </div>
  
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-8">
            {filteredApps.map((app) => {
              const hasAccess = checkAccess(app.id, user);
              const includedPack = getIncludedPack(app.id, user);
              const actualAppIdOrPack = includedPack || app.id;
              const expDateStr = getAppExpiryDate(actualAppIdOrPack, user);
              const isExpired = user?.role !== 'SUPER_ADMIN' && expDateStr ? new Date(expDateStr).setHours(23,59,59,999) < new Date().getTime() : false;
              const isUnlocked = hasAccess && !isExpired;

              const AppIcon = app.icon;
              
              return (
                  <div key={app.id} className={`flex flex-col bg-white rounded-3xl p-6 border transition-all duration-300 ${isUnlocked ? 'border-[#39FF14]/50 shadow-[0_10px_30px_rgba(57,255,20,0.15)] hover:-translate-y-2 hover:scale-105' : 'border-zinc-200 shadow-sm opacity-50 grayscale hover:grayscale-0'}`}>
                      <div className="flex justify-between items-start mb-6">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${isUnlocked ? app.color + ' text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                              <AppIcon size={28} />
                          </div>
                          {isUnlocked ? (
                              <span className="bg-[#39FF14]/10 text-green-700 border border-[#39FF14]/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                  <CheckCircle size={12}/> Actif
                              </span>
                          ) : (
                              <span className="bg-zinc-100 text-zinc-500 border border-zinc-200 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                                  <Lock size={12}/> Verrouillé
                              </span>
                          )}
                      </div>
                      
                      <div className="flex-1">
                          <h3 className="font-black text-2xl text-zinc-900 uppercase tracking-tighter mb-1">{app.name}</h3>
                          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">{app.desc}</p>
                          
                          {includedPack && isUnlocked && (
                              <div className="mb-4">
                                  <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm w-max">
                                      <Package size={14} /> Inclus dans {includedPack}
                                  </span>
                              </div>
                          )}

                          {isUnlocked && expDateStr && (
                              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 mb-6 flex justify-between items-center">
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Fin d'abonnement</p>
                                  <p className="text-xs font-black text-zinc-800 bg-white px-2 py-1 rounded-lg border border-zinc-200">{formatDate(expDateStr)}</p>
                              </div>
                          )}
                          {!isUnlocked && (
                              <div className="mb-6">
                                <p className="text-sm font-black text-black bg-[#39FF14] px-4 py-2 rounded-xl w-max shadow-sm">{app.price} <span className="text-[10px] font-bold text-black/60 uppercase">/ mois</span></p>
                              </div>
                          )}
                      </div>

                      <div className="mt-auto pt-5 border-t border-zinc-100">
                          {isUnlocked ? (
                              <button onClick={() => window.location.href = app.route} className="w-full bg-black text-[#39FF14] py-3.5 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                                  Ouvrir l'application <ArrowRight size={16}/>
                              </button>
                          ) : (
                              <button onClick={() => window.open(`https://wa.me/221785338417?text=${encodeURIComponent(`Bonjour, je souhaite activer le module ${app.name} (${app.price}/mois) sur mon espace OnyxOps.`)}`, '_blank')} className="w-full bg-zinc-100 text-black py-3.5 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-black hover:text-[#39FF14] transition-colors flex items-center justify-center gap-2 border border-zinc-200 shadow-sm">
                                  Activer ce module <ExternalLink size={14}/>
                              </button>
                          )}
                      </div>
                  </div>
              );
            })}

            {/* CARTE EXCLUSIVE SUPER ADMIN */}
            {user?.role === 'SUPER_ADMIN' && (
              <div className="flex flex-col bg-white rounded-3xl p-6 border border-purple-500/50 shadow-[0_10px_30px_rgba(168,85,247,0.15)] hover:-translate-y-2 hover:scale-105 transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg bg-purple-500 text-white">
                          <Sparkles size={28} />
                      </div>
                      <span className="bg-purple-500/10 text-purple-700 border border-purple-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                          <CheckCircle size={12}/> God Mode
                      </span>
                  </div>
                  
                  <div className="flex-1">
                      <h3 className="font-black text-2xl text-zinc-900 uppercase tracking-tighter mb-1">OnyxSocial</h3>
                      <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">Usine IA</p>
                      
                      <div className="mb-4">
                          <span className="bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm w-max">
                              <ShieldCheck size={14} /> Exclusif Admin
                          </span>
                      </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-zinc-100">
                      <a href="/onyxsocial" target="_blank" className="w-full bg-black text-[#39FF14] py-3.5 rounded-xl font-black uppercase text-[11px] tracking-widest hover:bg-[#39FF14] hover:text-black transition-colors flex items-center justify-center gap-2 shadow-lg">
                          Ouvrir l'application <ArrowRight size={16}/>
                      </a>
                  </div>
              </div>
            )}
          </div>
        </main>

        {/* --- FOOTER RESTAURÉ --- */}
        <footer className="bg-black text-white py-16 border-t border-zinc-900 mt-20 relative z-10">
           <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                 <div className="flex items-center gap-3 mb-6">
                    <Image src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" width={150} height={50} className="h-[40px] w-auto object-contain grayscale opacity-80" unoptimized />
                    <span className={`${spaceGrotesk.className} font-black tracking-tighter text-2xl text-white`}>ONYX OPS</span>
                 </div>
                 <p className="text-zinc-500 text-sm max-w-sm mb-6">
                    Le premier écosystème digital tout-en-un pour les entreprises au Sénégal. Gagnez du temps, augmentez vos ventes et dominez votre marché grâce à l'automatisation WhatsApp.
                 </p>
                 <div className="flex items-center gap-4">
                    <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite vous contacter.', '_blank')} className="text-zinc-400 hover:text-[#39FF14] transition"><MessageSquare size={20}/></button>
                    <button onClick={() => window.open('mailto:contact@onyxops.com')} className="text-zinc-400 hover:text-[#39FF14] transition"><Mail size={20}/></button>
                 </div>
              </div>
              
             <div>
                 <h4 className="font-black uppercase text-sm tracking-widest text-zinc-300 mb-6">Solutions</h4>
                 <ul className="space-y-4 text-sm text-zinc-500 font-bold">
                    <li><button onClick={() => router.push('/jaay')} className="hover:text-[#39FF14] transition">Onyx Jaay</button></li>
                    <li><button onClick={() => router.push('/tiak')} className="hover:text-[#39FF14] transition">Onyx Tiak</button></li>
                    <li><button onClick={() => router.push('/menu')} className="hover:text-[#39FF14] transition">Onyx Menu</button></li>
                    <li><button onClick={() => router.push('/trio')} className="hover:text-[#39FF14] transition">Pack Trio</button></li>
                 </ul>
              </div>

              <div>
                 <h4 className="font-black uppercase text-sm tracking-widest text-zinc-300 mb-6">Entreprise</h4>
                 <ul className="space-y-4 text-sm text-zinc-500 font-bold">
                    <li><button onClick={() => router.push('/')} className="hover:text-[#39FF14] transition">Accueil</button></li>
                    <li><button onClick={() => router.push('/ambassadeurs/login')} className="hover:text-[#39FF14] transition">Programme Ambassadeur</button></li>
                    <li><button onClick={() => router.push('/login')} className="hover:text-[#39FF14] transition">Connexion Hub</button></li>
                 </ul>
              </div>
           </div>
           
           <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-xs text-zinc-600 font-bold">© {new Date().getFullYear()} OnyxOps Elite. Tous droits réservés. Dakar, Sénégal.</p>
              <div className="flex gap-4 text-xs font-bold text-zinc-600">
                 <button className="hover:text-white transition">CGV</button>
                 <button className="hover:text-white transition">Confidentialités</button>
              </div>
           </div>
        </footer>
      </div>

      {isAccountModalOpen && user && (
        <AccountModal 
          onClose={() => setIsAccountModalOpen(false)} 
          user={user}
          onUpdate={(updatedUser) => setUser(updatedUser)}
        />
      )}

      {/* --- MODALE D'AIDE ET TUTORIEL --- */}
      {showHelpModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in" onClick={(e: any) => e.target === e.currentTarget && setShowHelpModal(false)}>
           <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] max-w-lg w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14]">
              <button onClick={() => setShowHelpModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
              
              <h2 className="text-2xl font-black uppercase tracking-tighter mb-2 text-black">Comment utiliser le Hub ?</h2>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-6">Guide de démarrage rapide</p>

              <div className="space-y-4 mb-8">
                 <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-black text-xs shrink-0">1</div>
                    <p className="text-sm text-zinc-600 font-medium">Sélectionnez une application active dans la grille principale pour y accéder.</p>
                 </div>
                 <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-black text-xs shrink-0">2</div>
                    <p className="text-sm text-zinc-600 font-medium">Si une application est grisée, c'est que vous n'y avez pas encore accès. Cliquez dessus pour demander son activation.</p>
                 </div>
                 <div className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-black text-xs shrink-0">3</div>
                    <p className="text-sm text-zinc-600 font-medium">Gérez votre profil et vos mots de passe depuis le menu en haut à droite.</p>
                 </div>
              </div>

              <button onClick={() => window.open('https://wa.me/221785338417', '_blank')} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black text-xs uppercase hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg">
                 Contacter un expert sur WhatsApp
              </button>
           </div>
        </div>
      )}
    </>
  );
}
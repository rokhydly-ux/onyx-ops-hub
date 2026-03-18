"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Smartphone, Truck, Utensils, Box, Lock, LogOut, 
  User, GraduationCap, ArrowRight, ShieldCheck 
} from "lucide-react";
import AccountModal from "@/components/AccountModal"; // Import de la modale
import { supabase } from "@/lib/supabaseClient";

const APPS = [
  { id: "vente", name: "Onyx Jaay", icon: Smartphone, color: "bg-blue-600", route: "/vente", desc: "Catalogue & Devis" },
  { id: "stock", name: "Onyx Stock", icon: Box, color: "bg-emerald-600", route: "/stock", desc: "Gestion d'Inventaire" },
  { id: "tiak", name: "Onyx Tiak", icon: Truck, color: "bg-orange-600", route: "/tiak", desc: "Logistique & Livraisons" },
  { id: "menu", name: "Onyx Menu", icon: Utensils, color: "bg-red-600", route: "/menu", desc: "Menu QR & Commandes" },
  { id: "formation", name: "Onyx Formation", icon: GraduationCap, color: "bg-purple-600", route: "/formation", desc: "Académie Marketing" },
];

export default function OnyxHubPortal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase.from('clients').select('*').eq('id', session.user.id).maybeSingle();
        setUser(data ? { ...session.user, ...data } : session.user);
      } else {
        // Vérification de la session personnalisée CRM
        const customSession = localStorage.getItem('onyx_custom_session');
        if (customSession) {
          try {
            const parsedSession = JSON.parse(customSession);
            const { data } = await supabase.from('clients').select('*').eq('id', parsedSession.id).maybeSingle();
            if (data) {
                setUser(data);
                localStorage.setItem('onyx_custom_session', JSON.stringify(data));
            } else {
                setUser(parsedSession);
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

  const openApp = (appId: string, route: string) => {
    if (user?.active_saas?.includes(appId)) {
      router.push(route);
    } else {
      alert("Vous n'avez pas encore souscrit à cette application. Contactez le support sur WhatsApp pour l'activer !");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

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
            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 hover:border-[#39FF14] transition-colors">
               <img src={user?.avatar_url || 'https://ui-avatars.com/api/?name=' + user?.full_name} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-[#39FF14]" />
               <span className="text-xs font-bold uppercase">{user?.full_name || 'Utilisateur'}</span>
            </button>
            
            {isProfileMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-zinc-200 py-1 animate-in fade-in zoom-in-95">
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
          <div className="mb-12 text-center sm:text-left">
             <h2 className="text-3xl sm:text-4xl font-black uppercase text-zinc-900 tracking-tighter mb-2">
               Bonjour, {user?.full_name?.split(' ')[0] || 'Gérant'} !
             </h2>
             <p className="text-zinc-500 font-medium">Sélectionnez une application pour commencer à travailler.</p>
             <p className="text-sm text-gray-600 mt-2">
                Fin d'accès : {formatDate(user?.expiry_date)}
              </p>
             {user?.expiry_date && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white border border-zinc-200 shadow-sm text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-full">
                <ShieldCheck size={16} className={user.type === 'Client' ? 'text-green-500' : 'text-yellow-500'} />
                <span className="text-zinc-600">Statut :</span> 
                <span className={user.type === 'Client' ? 'text-green-600' : 'text-yellow-600'}>{user.type || 'Essai'}</span>
                <span className="text-zinc-400 mx-1">|</span>
                <span className="text-zinc-600">Valide jusqu'au :</span> 
                <span className="text-zinc-800">{formatDate(user.expiry_date)}</span>
              </div>
             )}
          </div>
  
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
            {APPS.map((app) => {
              let expDate = null;
              if (user?.saas_expiration_dates && user.saas_expiration_dates[app.id]) {
                  expDate = new Date(user.saas_expiration_dates[app.id]);
              } else if (user?.expiration_date) {
                  expDate = new Date(user.expiration_date);
              }
              const isExpired = expDate ? new Date(expDate).setHours(23,59,59,999) < new Date().getTime() : false;
              
              const saasNameLower = (user?.saas || '').toLowerCase();
              
              let isPackAccess = false;
              if (saasNameLower.includes('trio') && ['vente', 'tiak', 'stock'].includes(app.id)) isPackAccess = true;
              else if (saasNameLower.includes('duo') && ['vente', 'tiak'].includes(app.id)) isPackAccess = true;
              else if (saasNameLower.includes('solo') && ['vente'].includes(app.id)) isPackAccess = true;

              const hasAccess = user?.active_saas?.includes(app.id) || saasNameLower.includes(app.id.toLowerCase()) || isPackAccess;
              
              const isUnlocked = hasAccess && !isExpired;

              const AppIcon = app.icon;
              
              const cardContent = (
                <div 
                  className={`flex flex-col items-center gap-4 group transition-all duration-300 ${isUnlocked ? 'cursor-pointer hover:-translate-y-2' : 'opacity-50 grayscale'}`}
                >
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-3xl flex items-center justify-center relative shadow-xl transition-all duration-300 ${isUnlocked ? `${app.color} text-white group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)]` : 'bg-zinc-200 text-zinc-400 border-2 border-zinc-300'}`}>
                     <AppIcon size={40} className={`transition-transform duration-300 ${isUnlocked ? 'group-hover:scale-110' : ''}`} />
                     
                     {!isUnlocked && (
                       <div className="absolute -top-2 -right-2 bg-black text-white p-1.5 rounded-full shadow-lg">
                         <Lock size={14} />
                       </div>
                     )}
                  </div>
                  
                  <div className="text-center">
                     <h3 className="font-black text-sm uppercase text-zinc-800 tracking-tight">{app.name}</h3>
                     <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{app.desc}</p>
                     {hasAccess && isExpired && <p className="text-[10px] font-black text-red-500 uppercase mt-1 border border-red-500 rounded-md px-1 inline-block">Expiré</p>}
                  </div>
                </div>
              );

              if (isUnlocked) {
                return (
                  <Link href={app.route} key={app.id}>
                    {cardContent}
                  </Link>
                )
              }
  
              return (
                <div key={app.id} onClick={() => alert(hasAccess && isExpired ? `Votre abonnement pour ${app.name} a expiré. Veuillez contacter le support pour le renouveler.` : "Vous n'avez pas encore souscrit à cette application. Contactez le support sur WhatsApp pour l'activer !")}>
                  {cardContent}
                </div>
              );
            })}
          </div>
  
          <div className="mt-20 bg-black text-white rounded-[3rem] p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14] opacity-[0.05] rounded-full blur-3xl pointer-events-none"></div>
             <div className="relative z-10">
                <span className="bg-[#39FF14] text-black text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest mb-4 inline-block">Mise à jour</span>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">Onyx Tiak est disponible !</h3>
                <p className="text-zinc-400 text-sm max-w-md">Connectez vos livreurs en temps réel à vos commandes WhatsApp et sécurisez vos encaissements.</p>
             </div>
             <button onClick={() => window.open('https://wa.me/221785338417?text=Bonjour, je souhaite activer Onyx Tiak', '_blank')} className="relative z-10 whitespace-nowrap bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-white transition-all shadow-lg flex items-center gap-2">
               Activer maintenant <ArrowRight size={16}/>
             </button>
          </div>
        </main>
      </div>

      {isAccountModalOpen && user && (
        <AccountModal 
          user={user}
          onClose={() => setIsAccountModalOpen(false)}
          onUpdate={setUser}
        />
      )}
    </>
  );
}
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  Smartphone, Truck, Utensils, Box, Lock, LogOut, 
  Settings, GraduationCap, ArrowRight, ShieldCheck 
} from "lucide-react";

// Initialisation Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const APPS = [
  { id: "vente", name: "Onyx Jaay", icon: Smartphone, color: "bg-blue-600", route: "/vente", desc: "Catalogue & Devis" },
  { id: "stock", name: "Onyx Stock", icon: Box, color: "bg-emerald-600", route: "/stock", desc: "Gestion d'Inventaire" },
  { id: "tiak", name: "Onyx Tiak", icon: Truck, color: "bg-orange-600", route: "/tiak", desc: "Logistique & Livraisons" },
  { id: "menu", name: "Onyx Menu", icon: Utensils, color: "bg-red-600", route: "/menu", desc: "Menu QR & Commandes" },
  { id: "formation", name: "Onyx Formation", icon: GraduationCap, color: "bg-purple-600", route: "/formation", desc: "Académie Marketing" },
];

export default function OnyxHubPortal() {
  const router = useRouter();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const checkUserAccess = async () => {
      setIsMounted(true);
      const savedSession =
        typeof window !== "undefined"
          ? localStorage.getItem("onyx_client_session") ||
            sessionStorage.getItem("onyx_client_session")
          : null;
      if (!savedSession) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(savedSession);
        
        // Fetch the most up-to-date client data from Supabase
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', parsedUser.id)
          .single();

        if (error) throw error;
        
        setClientData(data);
      } catch (err) {
        console.error("Erreur de récupération des données client :", err);
        // If data fetching fails, log out the user to avoid inconsistent state
        await handleLogout();
      } finally {
        setLoading(false);
      }
    };

    checkUserAccess();
  }, [router]);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("onyx_client_session");
      sessionStorage.removeItem("onyx_client_session");
    }
    await supabase.auth.signOut();
    router.push("/");
  };

  const openApp = (appId: string, route: string) => {
    if (clientData?.active_saas?.includes(appId)) {
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

    if (!isMounted || loading) {

      return (

        <div className="min-h-screen bg-zinc-100 flex items-center justify-center">

          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />

        </div>

      );

    }

  

    return (

      <div className="min-h-screen bg-[#f4f5f7] font-sans">

        

        <header className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md z-50 sticky top-0">

          <div className="flex items-center gap-4">

            <div className="w-8 h-8 bg-[#39FF14] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.5)]">

               <span className="font-black text-black text-xs">OX</span>

            </div>

            <h1 className="text-lg font-black uppercase tracking-tighter hidden sm:block">OnyxOps Workspace</h1>

          </div>

          

          <div className="relative" ref={profileMenuRef}>

            <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800 hover:border-[#39FF14] transition-colors">

               <img src={clientData?.avatar_url || 'https://ui-avatars.com/api/?name=' + clientData?.full_name} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-[#39FF14]" />

               <span className="text-xs font-bold uppercase">{clientData?.full_name || 'Utilisateur'}</span>

            </button>

            

            {isProfileMenuOpen && (

              <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-2xl border border-zinc-200 py-1 animate-in fade-in zoom-in-95">

                <button className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-100">

                  <Settings size={16}/> Paramètres

                </button>

                <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50">

                  <LogOut size={16}/> Déconnexion

                </button>

              </div>

            )}

          </div>

        </header>

  

        {/* ZONE D'ACCUEIL */}

        <main className="max-w-6xl mx-auto p-8 pt-12 animate-in fade-in">

          <div className="mb-12 text-center sm:text-left">

             <h2 className="text-3xl sm:text-4xl font-black uppercase text-zinc-900 tracking-tighter mb-2">

               Bonjour, {clientData?.full_name?.split(' ')[0] || 'Gérant'} !

             </h2>

             <p className="text-zinc-500 font-medium">Sélectionnez une application pour commencer à travailler.</p>

             {/* NOUVEAU : Badge de statut */}

             {clientData?.expiry_date && (

              <div className="mt-4 inline-flex items-center gap-2 bg-white border border-zinc-200 shadow-sm text-xs font-bold uppercase tracking-wider py-2 px-4 rounded-full">

                <ShieldCheck size={16} className={clientData.type === 'Client' ? 'text-green-500' : 'text-yellow-500'} />

                <span className="text-zinc-600">Statut :</span> 

                <span className={clientData.type === 'Client' ? 'text-green-600' : 'text-yellow-600'}>{clientData.type || 'Essai'}</span>

                <span className="text-zinc-400 mx-1">|</span>

                <span className="text-zinc-600">Valide jusqu'au :</span> 

                <span className="text-zinc-800">{formatDate(clientData.expiry_date)}</span>

              </div>

             )}

          </div>

  

          {/* GRILLE D'APPLICATIONS (DYNAMIQUE) */}

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">

            {APPS.map((app) => {

              const isUnlocked = clientData?.active_saas?.includes(app.id);

              const AppIcon = app.icon;

  

              return (

                <div 

                  key={app.id} 

                  onClick={() => openApp(app.id, app.route)}

                  className={`flex flex-col items-center gap-4 group transition-all duration-300 ${isUnlocked ? 'cursor-pointer hover:-translate-y-2' : 'opacity-60 grayscale'}`}

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

                  </div>

                </div>

              );

            })}

          </div>

  

          {/* WIDGET UPSALES / ANNONCES */}

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

    );

  }
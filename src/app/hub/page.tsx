"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { 
  Smartphone, Truck, Utensils, Box, Lock, LogOut, 
  Settings, GraduationCap, ArrowRight 
} from "lucide-react";

// Initialisation Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const APPS = [
  { id: "vente", name: "Onyx Vente", icon: Smartphone, color: "bg-blue-600", route: "/vente", desc: "Catalogue & Devis" },
  { id: "stock", name: "Onyx Stock", icon: Box, color: "bg-emerald-600", route: "/stock", desc: "Gestion d'Inventaire" },
  { id: "tiak", name: "Onyx Tiak", icon: Truck, color: "bg-orange-600", route: "/tiak", desc: "Logistique & Livraisons" },
  { id: "menu", name: "Onyx Menu", icon: Utensils, color: "bg-red-600", route: "/menu", desc: "Menu QR & Commandes" },
  { id: "formation", name: "Onyx Formation", icon: GraduationCap, color: "bg-purple-600", route: "/formation", desc: "Académie Marketing" },
];

export default function OnyxHubPortal() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [unlockedApps, setUnlockedApps] = useState<string[]>([]);

  useEffect(() => {
    const checkUserAccess = async () => {
      const saved = localStorage.getItem("onyx_client_session");
      if (!saved) {
        router.push("/"); // 👈 On désactive le renvoi temporairement
        return;
      }

      const parsedUser = JSON.parse(saved);
      setUser(parsedUser);

      // 🚀 Requête en temps réel vers Supabase pour récupérer les accès à jour
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('active_saas')
          .eq('id', parsedUser.id)
          .single();

        if (error) throw error;
        
        // On met à jour le state avec le tableau provenant de la BDD
        setUnlockedApps(data?.active_saas || []);
      } catch (err) {
        console.error("Erreur de récupération des accès :", err);
      } finally {
        setLoading(false);
      }
    };

    checkUserAccess();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("onyx_client_session");
    router.push("/");
  };

  const openApp = (appId: string, route: string) => {
    if (unlockedApps.includes(appId)) {
      router.push(route);
    } else {
      alert("Vous n'avez pas encore souscrit à cette application. Contactez le support sur WhatsApp pour l'activer !");
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-100 flex items-center justify-center"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#f4f5f7] font-sans">
      
      {/* HEADER TYPE ODOO/OS */}
      <header className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md z-50 sticky top-0">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-[#39FF14] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.5)]">
             <span className="font-black text-black text-xs">OX</span>
          </div>
          <h1 className="text-lg font-black uppercase tracking-tighter hidden sm:block">OnyxOps Workspace</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
             <img src={user?.avatar_url || 'https://via.placeholder.com/150'} alt="Avatar" className="w-6 h-6 rounded-full object-cover border border-[#39FF14]" />
             <span className="text-xs font-bold uppercase">{user?.full_name || 'Utilisateur'}</span>
          </div>
          <button className="text-zinc-400 hover:text-white transition"><Settings size={18}/></button>
          <button onClick={handleLogout} className="text-zinc-400 hover:text-red-500 transition"><LogOut size={18}/></button>
        </div>
      </header>

      {/* ZONE D'ACCUEIL */}
      <main className="max-w-6xl mx-auto p-8 pt-12 animate-in fade-in">
        <div className="mb-12 text-center sm:text-left">
           <h2 className="text-3xl sm:text-4xl font-black uppercase text-zinc-900 tracking-tighter mb-2">
             Bonjour, {user?.full_name?.split(' ')[0] || 'Gérant'} !
           </h2>
           <p className="text-zinc-500 font-medium">Sélectionnez une application pour commencer à travailler.</p>
        </div>

        {/* GRILLE D'APPLICATIONS (STYLE ODOO) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8">
          {APPS.map((app) => {
            const isUnlocked = unlockedApps.includes(app.id);
            const AppIcon = app.icon;

            return (
              <div 
                key={app.id} 
                onClick={() => openApp(app.id, app.route)}
                className={`flex flex-col items-center gap-4 group cursor-pointer transition-all duration-300 ${isUnlocked ? 'hover:-translate-y-2' : 'opacity-60 grayscale hover:grayscale-0'}`}
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
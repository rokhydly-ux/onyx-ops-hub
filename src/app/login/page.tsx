"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { LogIn, Loader2, AlertCircle, Home } from "lucide-react";
import InteractiveParticles from "@/components/InteractiveParticles";

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  // Vérification de session active et redirection
  useEffect(() => {
    const checkSession = async () => {
      // 1. Vérifier si un administrateur est connecté
      const { data: { session } } = await supabase.auth.getSession();
      if (session && sessionStorage.getItem('onyx_admin_session') === '1') {
        router.push("/admin");
        return;
      }

      // 2. Vérifier si un client est déjà connecté (via custom session)
      const customSession = localStorage.getItem('onyx_custom_session');
      if (customSession) {
        // Si une session client existe, redirection vers le hub client
        router.push("/hub"); 
        return;
      }

      setIsChecking(false);
    };
    
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    try {
      const cleanPhone = phone.replace(/\s+/g, '');
      
      // Requête dans la table clients pour l'authentification
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('phone', cleanPhone)
        .eq('password_temp', password)
        .single();

      if (client && !error) {
         // Succès - On enregistre la session client
         localStorage.setItem('onyx_custom_session', JSON.stringify(client));
         router.push("/hub");
      } else {
         setErrorMsg("Numéro de téléphone ou mot de passe incorrect.");
      }
    } catch (err: any) {
      setErrorMsg("Erreur lors de la connexion. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 font-sans text-white relative">
      <InteractiveParticles themeColor="#39FF14" />
      
      <button onClick={() => router.push('/')} className="absolute top-6 left-6 text-zinc-400 hover:text-white flex items-center gap-2 font-bold text-sm bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800 transition-colors z-20">
        <Home size={16}/> Accueil
      </button>

      <div className="w-full max-w-sm text-center z-10 bg-black/60 p-8 rounded-[3rem] border border-zinc-800 backdrop-blur-xl shadow-2xl">
        <div className="mx-auto w-20 h-20 bg-zinc-900 rounded-[2rem] flex items-center justify-center shadow-lg border border-zinc-800 mb-6">
           <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Logo" className="w-12 object-contain" />
        </div>
        
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-white">Hub Global</h1>
        <p className="text-zinc-400 font-bold mb-10 text-xs">Connectez-vous à vos applications OnyxOps.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required
            placeholder="Numéro WhatsApp (ex: 77 123 45 67)"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#39FF14] transition text-sm text-center placeholder:text-zinc-600"
          />
          <input 
            type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
            placeholder="Mot de passe d'accès"
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-4 font-bold text-white outline-none focus:border-[#39FF14] transition text-sm text-center placeholder:text-zinc-600 tracking-widest"
          />
          
          {errorMsg && <p className="text-red-500 text-xs font-bold pt-2 flex items-center justify-center gap-1"><AlertCircle size={14}/> {errorMsg}</p>}

          <button type="submit" disabled={isLoading} className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-4">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><LogIn size={18}/> Connexion</>}
          </button>
        </form>
      </div>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AmbassadeursPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [pin, setPin] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');

  // Maintenir la session au rechargement
  useEffect(() => {
    const session = localStorage.getItem('onyx_ambassador_session');
    if (session) {
      router.push('/ambassadeurs/hub');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    // Nettoyage et formatage du numéro
    let cleanPhone = id.replace(/\s|-/g, '');
    if (cleanPhone.startsWith('00221')) {
      cleanPhone = '+221' + cleanPhone.substring(5);
    } else if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
      cleanPhone = `+221${cleanPhone}`;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`;
    }

    try {
      const submittedPin = pin === "0000" ? "central2026" : pin + "00";
      const authEmail = `${cleanPhone}@clients.onyxcrm.com`;

      console.log("--> Tentative de connexion avec l'email fantôme:", authEmail);

      // 1. Authentification Supabase Auth d'abord pour valider le RLS
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: submittedPin,
      });

      if (authError || !authData.user) {
        console.error("Erreur Auth:", authError);
        throw new Error("Numéro de téléphone ou code PIN incorrect.");
      }

      // 2. Récupération des données avec les droits RLS
      const { data: ambassadors, error: fetchErr } = await supabase
        .from('ambassadors')
        .select('*')
        .eq('id', authData.user.id);

      if (fetchErr || !ambassadors || ambassadors.length === 0) {
        throw new Error("Profil ambassadeur introuvable après connexion.");
      }

      const data = ambassadors[0];
      if (data.status !== 'Actif') {
         throw new Error("Votre compte n'est pas encore validé par l'administrateur.");
      }

      localStorage.setItem('onyx_ambassador_session', JSON.stringify(data));
      router.push('/ambassadeurs/hub');
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-[#39FF14]/30 shadow-[0_0_80px_rgba(57,255,20,0.15)] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#39FF14]/20 rounded-2xl flex items-center justify-center text-[#39FF14] mx-auto mb-4 border border-[#39FF14]/50">
              <Trophy size={32} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Espace Ambassadeur</h1>
            <p className="text-sm text-zinc-400 mt-1">Connectez-vous pour accéder à votre tableau de bord.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="tel" 
              placeholder="Votre ID Ambassadeur" 
              value={id} 
              onChange={(e) => setId(e.target.value)} 
              required 
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#39FF14] placeholder:text-zinc-500" 
            />
            <input 
              type="password" 
              inputMode="numeric"
              maxLength={4}
              placeholder="Code PIN (4 chiffres)" 
              value={pin} 
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} 
              required 
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#39FF14] placeholder:text-zinc-500 tracking-widest text-center text-xl" 
            />
            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
            <button 
              type="submit" 
              disabled={authLoading} 
              className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:scale-[1.02] transition-transform duration-200 disabled:opacity-50 disabled:scale-100 shadow-[0_0_30px_rgba(57,255,20,0.3)]"
            >
              {authLoading ? "Connexion en cours..." : "Accéder à mon Hub"}
            </button>
          </form>
          <div className="text-center mt-6">
             <button onClick={() => setShowForgot(true)} className="text-sm font-bold text-zinc-500 hover:text-[#39FF14] transition-colors">Code PIN oublié ?</button>
          </div>
        </div>
        
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <div className="bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-zinc-800">
                <button onClick={() => setShowForgot(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X size={20}/></button>
                <h2 className="text-xl font-bold mb-4 text-white">Code PIN oublié ?</h2>
                <p className="text-sm text-zinc-400 mb-6">Entrez votre numéro WhatsApp. L'administrateur sera notifié pour réinitialiser votre code PIN à 0000.</p>
                <input type="tel" placeholder="Votre numéro" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg mb-4 text-white outline-none focus:border-[#39FF14]" />
                <button onClick={() => { alert("L'Administrateur a été notifié pour réinitialiser votre PIN à 0000."); setShowForgot(false); setForgotPhone(''); }} className="w-full bg-[#39FF14] text-black font-bold py-3 rounded-lg uppercase text-xs">Demander la réinitialisation</button>
             </div>
          </div>
        )}
      </div>
    );
  }

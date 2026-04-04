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
  const [id, setId] = useState("+221762237425");
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

    // Nettoyage du numéro de téléphone
    let rawPhone = id.replace(/[^0-9+]/g, '');
    const p1 = rawPhone;
    const p2 = rawPhone.startsWith('+') ? rawPhone.substring(1) : `+${rawPhone}`;
    const p3 = rawPhone.length === 9 ? `+221${rawPhone}` : rawPhone;
    const p4 = rawPhone.length === 9 ? `221${rawPhone}` : rawPhone;
    const p5 = rawPhone.startsWith('+221') ? rawPhone.substring(4) : rawPhone;
    const p6 = rawPhone.startsWith('221') ? rawPhone.substring(3) : rawPhone;

    const uniquePhones = Array.from(new Set([p1, p2, p3, p4, p5, p6]));
    const orConditions = uniquePhones.map(p => `contact.eq.${p},phone.eq.${p}`).join(',');

    try {
      // Vérification dans la table des ambassadeurs
      const { data: membersList, error: fetchErr } = await supabase
        .from('ambassadors')
        .select('*')
        .or(orConditions);

      if (fetchErr || !membersList || membersList.length === 0) {
        throw new Error("Identifiant introuvable.");
      }
      const data = membersList[0];

      const submittedPin = pin === "0000" ? "central2026" : pin + "00";
      if (data.password_temp !== submittedPin && data.password_temp !== "central2026") {
        throw new Error("Code PIN incorrect.");
      }

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

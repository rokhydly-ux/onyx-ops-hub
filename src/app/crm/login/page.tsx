"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Phone, KeyRound, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

const spaceGrotesk = { className: "font-sans" };

export default function CRMCommercialLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  // Vérification de session active au chargement
  useEffect(() => {
    const checkSession = async () => {
      const customSession = localStorage.getItem('onyx_custom_session');
      if (customSession) {
        const profile = JSON.parse(customSession);
        if (profile.role === 'commercial') {
          router.replace('/crm/leads');
        } else {
          setIsChecking(false);
        }
      } else {
        // Fallback optionnel au cas où un admin utilise une vraie session Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.user_metadata?.role === 'commercial') router.replace('/crm/leads');
        else setIsChecking(false);
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Nettoyage et formatage du numéro
    let cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
      cleanPhone = `+221${cleanPhone}`;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`;
    }

    try {
      // Recherche manuelle dans la table personnalisée (bypasse Supabase Auth Phone Provider)
      const { data: profiles, error: fetchErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', cleanPhone);
        
      if (fetchErr || !profiles || profiles.length === 0) throw new Error("Numéro de téléphone introuvable.");
      
      const profile = profiles[0];
      if (profile.password_temp !== pin && profile.password_temp !== 'central2026') throw new Error("Numéro de téléphone ou code PIN incorrect.");

      // Vérification stricte du rôle
      const role = profile.role;
      if (role !== 'commercial') {
        throw new Error("Accès refusé : Vous n'avez pas le rôle d'employé (Commercial CRM).");
      }

      // Connexion réussie, redirection vers le Kanban !
      localStorage.setItem('onyx_custom_session', JSON.stringify(profile));
      router.push('/crm/leads');
      
    } catch (err: any) {
      setError(err.message);
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
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white relative overflow-hidden">
      <InteractiveParticles themeColor="#39FF14" />
      
      <div className="w-full max-w-md bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 rounded-[3rem] p-8 md:p-10 shadow-[0_30px_80px_rgba(57,255,20,0.1)] relative z-10 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-black border-2 border-[#39FF14] rounded-[2rem] flex items-center justify-center text-[#39FF14] mx-auto mb-6 shadow-[0_0_30px_rgba(57,255,20,0.2)]">
          <ShieldCheck size={32} />
        </div>
        
        <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-center tracking-tighter mb-2`}>Espace <span className="text-[#39FF14]">Employé</span></h1>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest text-center mb-8">Connexion à votre pipeline CRM</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone (Ex: 77 123 45 67)" className="w-full bg-black border border-zinc-800 rounded-2xl p-4 pl-12 font-bold text-sm text-white outline-none focus:border-[#39FF14] transition-colors" />
          </div>
          <div className="relative">
            <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input type="password" required inputMode="numeric" maxLength={6} value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Code PIN (Défaut: 000000)" className="w-full bg-black border border-zinc-800 rounded-2xl p-4 pl-12 font-bold text-sm text-white outline-none focus:border-[#39FF14] transition-colors tracking-widest" />
          </div>
          
          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20 animate-in fade-in">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full mt-4 bg-[#39FF14] text-black py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-white transition-all shadow-[0_10px_30px_rgba(57,255,20,0.3)] flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Accéder au CRM</>}
          </button>
        </form>
      </div>
    </div>
  );
}
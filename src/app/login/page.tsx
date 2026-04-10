"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Phone, KeyRound, ArrowRight, Loader2, User } from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

const spaceGrotesk = { className: "font-sans" };

export default function ClientLogin() {
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
        router.replace('/hub');
      } else {
        // Fallback optionnel au cas où un admin utilise une vraie session Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (user) router.replace('/hub');
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
      const authEmail = `${cleanPhone}@https://www.google.com/url?sa=E&source=gmail&q=clients.onyxcrm.com`;
      const submittedPassword = pin === "0000" ? "central2026" : (pin.length === 4 ? pin + "00" : pin);
      const { data, error: fetchErr } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: submittedPassword,
      });
        
      if (fetchErr || !data.user) {
        throw new Error("Numéro de téléphone ou mot de passe incorrect.");
      }
      
      // Enregistrement de la session locale pour maintenir l'utilisateur connecté
      localStorage.setItem('onyx_custom_session', JSON.stringify(data.user));
      
      router.push('/hub');
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (isChecking) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-black relative overflow-hidden">
      <InteractiveParticles themeColor="#39FF14" />
      <div className="w-full max-w-md bg-white/90 backdrop-blur-xl border border-zinc-200 rounded-[3rem] p-8 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.1)] relative z-10 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-black rounded-[2rem] flex items-center justify-center text-[#39FF14] mx-auto mb-6 shadow-[0_10px_30px_rgba(57,255,20,0.3)]"><User size={32} /></div>
        <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-center tracking-tighter mb-2`}>Espace <span className="text-[#39FF14] bg-black px-2 py-0.5 rounded-lg">Client</span></h1>
        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center mb-8">Accès à votre Hub & Produits Onyx</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative"><Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" /><input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone (Ex: 77 123 45 67)" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 pl-12 font-bold text-sm text-black outline-none focus:border-black transition-colors" /></div>
          <div className="relative"><KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" /><input type="password" required value={pin} onChange={(e) => setPin(e.target.value)} placeholder="Code PIN ou Mot de passe" className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 pl-12 font-bold text-sm text-black outline-none focus:border-black transition-colors tracking-widest" /></div>
          {error && <p className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg border border-red-200 animate-in fade-in">{error}</p>}
          <button type="submit" disabled={isLoading} className="w-full mt-4 bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-[#39FF14] hover:text-black transition-all shadow-[0_10px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-2 disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <><ArrowRight size={18} /> Accéder au Hub</>}
          </button>
        </form>
      </div>
    </div>
  );
}
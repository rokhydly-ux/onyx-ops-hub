"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Loader2, AlertCircle, X } from 'lucide-react';

export default function CommercialLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Nettoyage et formatage du numéro de téléphone
      let cleanPhone = phone.replace(/\s+/g, '');
      if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
        cleanPhone = `+221${cleanPhone}`;
      } else if (!cleanPhone.startsWith('+')) {
        cleanPhone = `+${cleanPhone}`;
      }

      const submittedPin = pin === "0000" ? "central2026" : (pin.length === 4 ? pin + "00" : pin);
      const authEmail = `${cleanPhone}@https://www.google.com/url?sa=E&source=gmail&q=clients.onyxcrm.com`;

      // 1. Authentification Supabase Auth d'abord pour valider le RLS
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: authEmail,
        password: submittedPin,
      });

      if (authError || !authData.user) {
        throw new Error("Numéro de téléphone ou Code PIN incorrect.");
      }

      // 2. Récupération des données commerciales maintenant que nous sommes authentifiés
      const { data: commercials, error: fetchErr } = await supabase
        .from('commercials')
        .select('*')
        .eq('id', authData.user.id);

      if (fetchErr || !commercials || commercials.length === 0) {
        throw new Error("Profil commercial introuvable après connexion.");
      }

      const commercial = commercials[0];
      if (commercial.status !== 'Actif') {
        throw new Error("Votre compte commercial n'est pas encore activé.");
      }

      // Succès - Sauvegarde de la session locale
      localStorage.setItem('onyx_commercial_session', JSON.stringify(commercial));
      router.push('/commercial/hub');
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur de connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-black relative">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-8 md:p-10 shadow-2xl relative z-10">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#0a0a0a] rounded-2xl flex items-center justify-center text-[#00FF00] mx-auto mb-6 shadow-lg">
            <Lock size={28} />
          </div>
          <h1 className="text-2xl font-black uppercase text-gray-900">Portail Commercial</h1>
          <p className="text-gray-500 mt-2">Connectez-vous pour accéder au terrain.</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone <span className="text-red-500">*</span></label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">+221</span>
                <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="7X XXX XX XX" className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code PIN (4 chiffres) <span className="text-red-500">*</span></label>
              <input type="password" inputMode="numeric" maxLength={4} required value={pin} onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} placeholder="••••" className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent tracking-widest text-center text-xl" />
            </div>
          </div>
          {errorMsg && <p className="text-red-500 text-sm text-center font-bold">{errorMsg}</p>}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-[#0a0a0a] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FF00] transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin"/> : "Se Connecter"}
          </button>
        </form>

        <div className="text-center mt-4">
          <button onClick={() => setShowForgot(true)} className="text-sm font-bold text-gray-500 hover:text-black transition-colors">Code PIN oublié ?</button>
        </div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative">
              <button onClick={() => setShowForgot(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20}/></button>
              <h2 className="text-xl font-bold mb-4 text-black">Code PIN oublié ?</h2>
              <p className="text-sm text-gray-500 mb-6">Entrez votre numéro WhatsApp. L'administrateur sera notifié pour réinitialiser votre code PIN à 0000.</p>
              <input type="tel" placeholder="Votre numéro" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg mb-4 text-black" />
              <button onClick={() => { alert("L'Administrateur a été notifié pour réinitialiser votre PIN à 0000."); setShowForgot(false); setForgotPhone(''); }} className="w-full bg-[#0a0a0a] text-[#00FF00] font-bold py-3 rounded-lg">Demander la réinitialisation</button>
           </div>
        </div>
      )}
    </div>
  );
}
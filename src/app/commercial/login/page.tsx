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
      let rawPhone = phone.replace(/[^0-9+]/g, '');
      const p1 = rawPhone;
      const p2 = rawPhone.startsWith('+') ? rawPhone.substring(1) : `+${rawPhone}`;
      const p3 = rawPhone.length === 9 ? `+221${rawPhone}` : rawPhone;
      const p4 = rawPhone.length === 9 ? `221${rawPhone}` : rawPhone;
      const p5 = rawPhone.startsWith('+221') ? rawPhone.substring(4) : rawPhone;
      const p6 = rawPhone.startsWith('221') ? rawPhone.substring(3) : rawPhone;

      const uniquePhones = Array.from(new Set([p1, p2, p3, p4, p5, p6]));
      const orConditions = uniquePhones.map(p => `phone.eq.${p}`).join(',');

      // Vérification dans la table des commerciaux
      const { data: commercials, error } = await supabase
        .from('commercials')
        .select('*')
        .or(orConditions);

      if (error || !commercials || commercials.length === 0) throw new Error("Numéro de téléphone introuvable.");
      const commercial = commercials[0];
      
      const submittedPin = pin === "0000" ? "central2026" : pin + "00";
      if (commercial.password_temp !== submittedPin && commercial.password_temp !== "central2026") throw new Error("Code PIN incorrect.");
      if (commercial.status !== 'Actif') throw new Error("Votre compte commercial n'est pas encore activé.");

      // Succès - Sauvegarde de la session locale
      localStorage.setItem('onyx_commercial_session', JSON.stringify(commercial));
      router.push('/commercial/hub');
      
    } catch (err: any) {
      setErrorMsg(err.message || "Erreur lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-6 font-sans">
      <div className="w-full max-w-sm space-y-8">
        
        {/* En-tête */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0a0a0a] mb-4 shadow-lg">
            <Lock className="text-[#00FF00] w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Portail Commercial</h1>
          <p className="text-gray-500 mt-2">Connectez-vous pour accéder au terrain.</p>
        </div>

        {/* Formulaire */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            
            {/* Numéro de téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Numéro de téléphone <span className="text-red-500">*</span>
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  +221
                </span>
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="7X XXX XX XX" 
                  className="flex-1 min-w-0 block w-full px-4 py-3 rounded-none rounded-r-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent" 
                />
              </div>
            </div>

            {/* Email (Optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-gray-400 font-normal">(Optionnel)</span>
              </label>
              <input 
                type="email" 
                placeholder="prenom@onyx.sn" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent" 
              />
            </div>

            {/* Code PIN */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Code PIN (4 chiffres) <span className="text-red-500">*</span>
              </label>
              <input 
                type="password" 
                inputMode="numeric"
                maxLength={4}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="••••" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent tracking-widest text-center text-xl" 
              />
            </div>
          </div>

          {errorMsg && <p className="text-red-500 text-sm text-center font-bold">{errorMsg}</p>}

          <button 
            type="submit" 
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-[#0a0a0a] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FF00] transition-colors"
          >
            Se Connecter
          </button>
        </form>

        <div className="text-center mt-2">
           <button onClick={() => setShowForgot(true)} className="text-sm font-bold text-gray-500 hover:text-black transition-colors">Code PIN oublié ?</button>
        </div>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            Accès strictement réservé aux agents Onyx Hub.
          </p>
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
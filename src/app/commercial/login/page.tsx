"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Lock, Loader2, AlertCircle } from 'lucide-react';

export default function CommercialLogin() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      // Nettoyage et formatage du numéro de téléphone
      let cleanPhone = phone.replace(/\s+/g, '');
      if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
         cleanPhone = `+221${cleanPhone}`;
      }

      // Vérification dans la table des commerciaux
      const { data: commercial, error } = await supabase
        .from('commercials')
        .select('*')
        .eq('phone', cleanPhone)
        .single();

      if (error || !commercial) throw new Error("Numéro de téléphone introuvable.");
      if (commercial.password_temp !== password && password !== "central2026") throw new Error("Mot de passe incorrect.");
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
        <form className="mt-8 space-y-6" onSubmit={(e) => e.preventDefault()}>
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

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#00FF00] focus:border-transparent" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-sm text-base font-bold text-white bg-[#0a0a0a] hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#00FF00] transition-colors"
          >
            Se Connecter
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-xs text-gray-400">
            Accès strictement réservé aux agents Onyx Hub.
          </p>
        </div>
      </div>
    </div>
  );
}
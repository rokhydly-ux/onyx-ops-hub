"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User, Lock, LogIn, Loader2, AlertTriangle, Wallet, CheckCircle, Clock, Gift, ShieldCheck, LogOut, Home } from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

const spaceGrotesk = { className: "font-sans" };

type Member = {
  id: string;
  prenom_nom: string;
  telephone: string;
  a_gagne: boolean;
  mois_victoire: number | null;
  photo_url?: string;
  is_admin?: boolean;
  code_secret?: string;
  tontine_id: string;
};

type Tontine = {
  id: string;
  nom: string;
  theme_color: string;
  logo_url?: string;
  montant_mensuel: number;
};

export default function TontineMemberPage() {
  const [inputPhone, setInputPhone] = useState('');
  const [inputPin, setInputPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const [member, setMember] = useState<Member | null>(null);
  const [tontine, setTontine] = useState<Tontine | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      // 1. On récupère l'ID de la tontine depuis l'URL
      const searchParams = new URLSearchParams(window.location.search);
      const tontineId = searchParams.get('tontine_id') || searchParams.get('id');
      
      if (!tontineId) throw new Error("Lien de tontine invalide.");

      // 2. Nettoyage NUCLÉAIRE des inputs
      let cleanPhone = inputPhone.replace(/[^0-9]/g, '');
      if (cleanPhone.startsWith('221')) cleanPhone = cleanPhone.slice(3);
      if (cleanPhone.startsWith('00221')) cleanPhone = cleanPhone.slice(5);
      
      const cleanPin = inputPin.trim();

      if (!cleanPhone || !cleanPin) throw new Error("Veuillez remplir tous les champs (Numéro et Code PIN).");

      // 3. Requête Supabase : On demande tous les membres de cette tontine pour filtrer en local
      // C'est plus sûr car on peut nettoyer les numéros de la BDD à la volée
      const { data: members, error: fetchErr } = await supabase
        .from('tontine_members')
        .select('*')
        .eq('tontine_id', tontineId);

      if (fetchErr) throw fetchErr;

      let debugDbPhone = "Aucun";
      let debugDbPin = "Aucun";

      // 4. Recherche du membre correspondant
      const matchedMember = members?.find(m => {
        let rawPhone = String(m.telephone || '').split('.')[0]; 
        let dbPhone = rawPhone.replace(/[^0-9]/g, '');
        if (dbPhone.startsWith('221')) dbPhone = dbPhone.slice(3);
        if (dbPhone.startsWith('00221')) dbPhone = dbPhone.slice(5);
        
        let rawPin = String(m.code_secret || '').trim();
        let dbPin = (rawPin === '' || rawPin.toLowerCase() === 'null' || rawPin.toLowerCase() === 'undefined') ? '0000' : rawPin;
        
        if (dbPhone === cleanPhone || dbPhone.includes(cleanPhone)) {
           debugDbPhone = dbPhone;
           debugDbPin = rawPin === '' || rawPin.toLowerCase() === 'null' ? 'VIDE (Auto-remplacé par 0000)' : dbPin;
        }

        return dbPhone === cleanPhone && dbPin === cleanPin;
      });

      if (!matchedMember) {
        if (process.env.NODE_ENV === 'development' && debugDbPhone !== "Aucun") {
            throw new Error(`RAYON X 🔍 -> Numéro BDD: "${debugDbPhone}", PIN BDD: "${debugDbPin}". Tu as tapé PIN: "${cleanPin}"`);
        } else {
            throw new Error("Numéro de téléphone ou code PIN incorrect.");
        }
      }

      // 5. Succès !
      setMember(matchedMember);
      localStorage.setItem(`tontine_member_session_${tontineId}`, matchedMember.id);
      
    } catch (err: any) {
      console.error("Erreur Connexion:", err.message);
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const tontineId = searchParams.get('id');
    if (tontineId) {
        localStorage.removeItem(`tontine_member_session_${tontineId}`);
    }
    setMember(null);
    setInputPhone('');
    setInputPin('');
    setErrorMsg('');
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      const searchParams = new URLSearchParams(window.location.search);
      const tontineId = searchParams.get('id');

      if (!tontineId) {
        setErrorMsg("Lien de tontine invalide ou manquant.");
        setIsLoading(false);
        return;
      }

      // Charger les infos de la tontine
      const { data: tontineData, error: tontineError } = await supabase
        .from('tontines')
        .select('id, nom, theme_color, logo_url, montant_mensuel')
        .eq('id', tontineId)
        .single();

      if (tontineError || !tontineData) {
        setErrorMsg("Tontine introuvable.");
        setIsLoading(false);
        return;
      }
      setTontine(tontineData);

      // Vérifier la session membre
      const memberId = localStorage.getItem(`tontine_member_session_${tontineId}`);
      if (memberId) {
        const { data: memberData, error: memberError } = await supabase
          .from('tontine_members')
          .select('*')
          .eq('id', memberId)
          .single();
        
        if (memberData && !memberError) {
          setMember(memberData);
        } else {
          localStorage.removeItem(`tontine_member_session_${tontineId}`);
        }
      }
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-10">
         <Loader2 className="w-12 h-12 animate-spin text-white mb-4" />
         <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Chargement...</p>
      </div>
    );
  }

  if (errorMsg && !member) {
     // Special case for invalid link, show a more permanent error
     if (errorMsg.includes("invalide") || errorMsg.includes("introuvable")) {
        return (
          <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-10 text-center">
             <div className="w-20 h-20 bg-red-500/20 rounded-[2rem] flex items-center justify-center text-red-500 mb-6"><AlertTriangle size={32}/></div>
             <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-4 text-white`}>Lien Incorrect</h2>
             <p className="text-sm font-bold text-zinc-400 max-w-sm mb-8">{errorMsg}</p>
             <button onClick={() => window.location.href = '/hub'} className="bg-white text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex items-center gap-2">
               <Home size={16}/> Retourner au Hub
             </button>
          </div>
        )
     }
  }

  return (
    <div className="min-h-screen bg-zinc-900 text-white font-sans flex flex-col items-center justify-center p-4 selection:bg-[#39FF14]/30">
      <InteractiveParticles themeColor={tontine?.theme_color || '#009FDF'} />
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          {tontine?.logo_url && <img src={tontine.logo_url} alt="Logo" className="w-24 h-24 mx-auto rounded-3xl mb-4 shadow-2xl border-4 border-zinc-800" />}
          <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`} style={{ color: tontine?.theme_color || '#FFFFFF' }}>
            {tontine?.nom || "Espace Membre"}
          </h1>
          <p className="text-sm text-zinc-400 font-bold">Suivez la progression de votre tontine.</p>
        </div>

        {!member ? (
          // --- FORMULAIRE DE CONNEXION ---
          <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700 p-8 rounded-[3rem] animate-in fade-in zoom-in-95">
            <h2 className="font-black text-lg uppercase text-center mb-6">Connexion Membre</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 mb-1 block tracking-widest">Numéro de téléphone</label>
                <div className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="tel"
                    value={inputPhone}
                    onChange={(e) => setInputPhone(e.target.value)}
                    className="w-full p-4 pl-10 bg-zinc-900 border border-zinc-700 rounded-2xl font-bold text-sm outline-none focus:border-[#39FF14] transition"
                    placeholder="Votre numéro"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 mb-1 block tracking-widest">Code PIN</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input 
                    type="password"
                    maxLength={4}
                    value={inputPin}
                    onChange={(e) => setInputPin(e.target.value)}
                    className="w-full p-4 pl-10 bg-zinc-900 border border-zinc-700 rounded-2xl font-bold text-sm outline-none focus:border-[#39FF14] transition tracking-[0.5em]"
                    placeholder="••••"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="flex items-center gap-2 text-red-400 text-xs font-bold p-2">
                  <AlertTriangle size={14} />
                  <p>{errorMsg}</p>
                </div>
              )}

              <button type="submit" disabled={isLoading} className="w-full text-black py-4 rounded-2xl font-black uppercase text-sm mt-4 hover:scale-105 transition shadow-xl flex justify-center items-center gap-2 disabled:opacity-50" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}>
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                {isLoading ? 'Vérification...' : 'Se Connecter'}
              </button>
            </form>
          </div>
        ) : (
          // --- TABLEAU DE BORD MEMBRE ---
          <div className="bg-zinc-800/50 backdrop-blur-xl border border-zinc-700 p-8 rounded-[3rem] animate-in fade-in zoom-in-95 w-full">
            <div className="text-center border-b border-zinc-700 pb-6 mb-6">
              <p className="text-sm text-zinc-400">Bienvenue</p>
              <h2 className="text-2xl font-black uppercase">{member.prenom_nom}</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-zinc-900/70 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2"><Wallet size={14} /> Cotisation</span>
                <span className="text-sm font-black">{tontine?.montant_mensuel.toLocaleString()} F</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/70 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2"><Clock size={14} /> Statut Paiement</span>
                <span className="text-sm font-black text-green-400">À jour</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-900/70 p-4 rounded-xl">
                <span className="text-xs font-bold uppercase text-zinc-400 flex items-center gap-2"><Gift size={14} /> Statut Tirage</span>
                {member.a_gagne ? (
                  <span className="text-sm font-black text-yellow-400">Déjà Gagné (Mois {member.mois_victoire})</span>
                ) : (
                  <span className="text-sm font-black text-zinc-300">En attente</span>
                )}
              </div>
            </div>

            <button onClick={handleLogout} className="w-full bg-red-500/20 text-red-400 hover:bg-red-500/30 py-3 rounded-2xl font-black uppercase text-xs mt-8 transition flex justify-center items-center gap-2">
              <LogOut size={14} /> Se déconnecter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
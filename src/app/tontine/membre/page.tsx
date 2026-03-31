"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  CheckCircle, AlertCircle, Wallet, Calendar, 
  History, Users, X, ChevronRight, ShieldCheck, 
  ArrowRight, Lock, Bell, LogOut, Shuffle, Trophy, Medal,
  Camera, Save, Loader2, Phone, KeyRound
} from "lucide-react";
import InteractiveParticles from '@/components/InteractiveParticles';

const spaceGrotesk = { className: "font-sans" };

// This is a wrapper to use useSearchParams on a client component
function TontineMembrePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>}>
      <TontineMembreDashboard />
    </Suspense>
  );
}

function TontineMembreDashboard() {
  const searchParams = useSearchParams();
  const tontineId = searchParams.get('id') || searchParams.get('tontine_id');

  // --- ETATS DE CONNEXION & SESSION ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // --- ETATS DE DONNEES BDD ---
  const [tontine, setTontine] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [cotisations, setCotisations] = useState<any[]>([]);
  
  // --- ETATS UI ---
  const [activeTab, setActiveTab] = useState<'historique' | 'attente'>('historique');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinName, setSpinName] = useState("");
  const [revealed, setRevealed] = useState(false);

  // --- ETATS PROFIL MEMBRE ---
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editDateNaissance, setEditDateNaissance] = useState("");
  const [editPin, setEditPin] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  
  // --- CHARGEMENT INITIAL & GESTION DE SESSION ---
  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      if (!tontineId) {
        setIsCheckingSession(false);
        return;
      }

      // 1. Fetch Tontine info first
      const { data: tData, error: tError } = await supabase
        .from('tontines')
        .select('*')
        .eq('id', tontineId)
        .single();

      if (tError || !tData) {
        console.error("Tontine not found:", tError);
        setTontine(null); // To show invalid link
        setIsCheckingSession(false);
        return;
      }
      setTontine(tData);

      // 2. Check for a persisted session in localStorage
      const savedMemberId = localStorage.getItem(`tontine_session_${tontineId}`);
      if (savedMemberId) {
        const { data: memberData, error: memberError } = await supabase
          .from('tontine_members') // CORRECTION ICI
          .select('*')
          .eq('id', savedMemberId)
          .single();
        
        if (memberData && !memberError) {
          await fetchDashboardData(memberData, tData);
        } else {
          // Clear invalid session
          localStorage.removeItem(`tontine_session_${tontineId}`);
          setCurrentUser(null);
        }
      }
      setIsCheckingSession(false);
    };

    checkSessionAndFetchData();
  }, [tontineId]);

  // --- FONCTION POUR CHARGER LES DONNÉES DU DASHBOARD ---
  const fetchDashboardData = async (member: any, tontineData: any) => {
    setCurrentUser(member);
    setEditPhotoUrl(member.photo_url || '');
    setEditDateNaissance(member.date_naissance || '');

    // CORRECTION ICI
    const { data: allMembersData } = await supabase.from('tontine_members').select('*').eq('tontine_id', tontineData.id);
    const { data: allCotisationsData } = await supabase.from('cotisations').select('*');
    
    setMembers(allMembersData || []);
    setCotisations(allCotisationsData || []);
  };

  // --- LOGIQUE DE CONNEXION ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      if (!tontineId) throw new Error("Lien de tontine invalide.");

      // 1. Nettoyage NUCLÉAIRE utilisateur (On ne garde QUE les chiffres)
      let cleanPhoneUser = phone.replace(/[^0-9]/g, '');
      if (cleanPhoneUser.startsWith('221')) cleanPhoneUser = cleanPhoneUser.slice(3);
      if (cleanPhoneUser.startsWith('00221')) cleanPhoneUser = cleanPhoneUser.slice(5);
      
      const cleanPinUser = pin.trim();
      
      if (!cleanPhoneUser || !cleanPinUser) throw new Error("Veuillez remplir tous les champs (Numéro et Code PIN).");
      
      // 2. Requête Supabase
      const { data: membersList, error: fetchErr } = await supabase
        .from('tontine_members') 
        .select('*')
        .eq('tontine_id', tontineId);
      
      if (fetchErr) throw fetchErr;
      
      if (!membersList || membersList.length === 0) {
          throw new Error("Aucun membre trouvé dans cette tontine.");
      }

      // 3. Recherche du membre
      let debugDbPhone = "Aucun";
      let debugDbPin = "Aucun";

      const matchedMember = membersList.find(m => {
        // Nettoyage NUCLÉAIRE BDD (Gère même les bugs ".0" d'Excel)
        let rawPhone = String(m.telephone || '').split('.')[0]; 
        let dbPhone = rawPhone.replace(/[^0-9]/g, '');
        
        if (dbPhone.startsWith('221')) dbPhone = dbPhone.slice(3);
        if (dbPhone.startsWith('00221')) dbPhone = dbPhone.slice(5);
        
        let rawPin = String(m.code_secret || '').trim();
        let dbPin = (rawPin === '' || rawPin.toLowerCase() === 'null' || rawPin.toLowerCase() === 'undefined') ? '0000' : rawPin;
        
        // MOUCHARD : Si le numéro correspond un peu, on sauvegarde ses vraies infos pour l'erreur
        if (dbPhone === cleanPhoneUser || dbPhone.includes(cleanPhoneUser)) {
           debugDbPhone = dbPhone;
           debugDbPin = rawPin === '' || rawPin.toLowerCase() === 'null' ? 'VIDE (Auto-remplacé par 0000)' : dbPin;
        }

        return dbPhone === cleanPhoneUser && dbPin === cleanPinUser;
      });
      
      if (!matchedMember) {
        // LE FAMEUX RAYON X ! (Forcé en production pour aider au debug Excel)
        if (debugDbPhone !== "Aucun") {
            throw new Error(`RAYON X 🔍 -> Numéro BDD: "${debugDbPhone}", PIN BDD: "${debugDbPin}". Tu as tapé PIN: "${cleanPinUser}"`);
        } else {
            throw new Error("Numéro de téléphone ou code PIN incorrect.");
        }
      }
      
      // 4. Succès !
      localStorage.setItem(`tontine_session_${tontineId}`, matchedMember.id);
      await fetchDashboardData(matchedMember, tontine);
      
    } catch (err: any) {
      console.error("Erreur Connexion:", err.message);
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // --- LOGIQUE DE DÉCONNEXION ---
  const handleLogout = () => {
    if (tontineId) {
      localStorage.removeItem(`tontine_session_${tontineId}`);
    }
    setCurrentUser(null);
    setPhone("");
    setPin("");
    setLoginError(null);
  };

  // --- CALCULS GLOBAUX ---
  const totalMembres = members.length;
  const totalGagnantsMois = tontine?.gagnants_par_mois || 2;
  const moisEcoules = Math.floor(members.filter(m => m.a_gagne).length / totalGagnantsMois);
  const currentMonth = moisEcoules + 1;
  const dateTirage = `05 du mois`;
  
  let endDateText: string | null = null;
  let remainingMonths: number | null = null;
  if (tontine?.date_debut && tontine?.duree_mois) {
    const startDate = new Date(tontine.date_debut);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + tontine.duree_mois);
    endDateText = endDate.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' });
    remainingMonths = tontine.duree_mois - moisEcoules;
  }
  
  const caisseMensuelle = members.reduce((sum, m) => sum + (m.cotisation_individuelle || tontine?.montant_mensuel || 20000), 0);
  const cotisationsCeMois = cotisations.filter(c => c.mois_numero === currentMonth && c.statut === 'Payé');
  const actuelCaisse = cotisationsCeMois.reduce((acc, c) => acc + c.montant, 0);
  
  const progressPercentage = caisseMensuelle > 0 ? (actuelCaisse / caisseMensuelle) * 100 : 0;
  
  const isUserUpToDate = cotisationsCeMois.some(c => c.membre_id === currentUser?.id);

  // HISTORIQUE GAGNANTS
  const winnersHistoryRaw = members.filter(m => m.a_gagne).reduce((acc: any, m: any) => {
    const mois = m.mois_victoire;
    if (!acc[mois]) acc[mois] = [];
    acc[mois].push({ nom: m.prenom_nom, photo: m.photo_url, is_admin: m.is_admin });
    return acc;
  }, {});
  
  const winnersHistory = Object.keys(winnersHistoryRaw).map(mois => ({
    mois: Number(mois),
    date: `Mois ${mois}`,
    winners: winnersHistoryRaw[mois],
    amount: caisseMensuelle
  })).sort((a, b) => b.mois - a.mois);

  // FILE D'ATTENTE
  const waitingList = members.filter(m => !m.a_gagne);

  const maxMoisVictoire = Math.max(0, ...members.map(m => m.mois_victoire || 0));
  const recentWinners = members.filter(m => m.a_gagne && m.mois_victoire === maxMoisVictoire);
  const montantParGagnant = tontine?.gagnants_par_mois ? caisseMensuelle / tontine.gagnants_par_mois : caisseMensuelle / 2;

  // --- AUTRES FONCTIONS ---
  const handleReveal = () => {
    setIsSpinning(true);
    const eligible = members.length > 0 ? members : [{ prenom_nom: "Mélange..." }];
    const spinInterval = setInterval(() => {
      const random = eligible[Math.floor(Math.random() * eligible.length)].prenom_nom;
      setSpinName(random);
    }, 100);
    
    setTimeout(() => {
      clearInterval(spinInterval);
      setIsSpinning(false);
      setRevealed(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
      audio.volume = 0.4;
      audio.play().catch(()=>{});
    }, 2500);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
        const payload: any = {};
        if (editPhotoUrl !== (currentUser.photo_url || '')) {
            payload.photo_url = editPhotoUrl;
        }
        if (editDateNaissance !== (currentUser.date_naissance || '')) {
            payload.date_naissance = editDateNaissance;
            payload.date_naissance_modifiee = true;
        }
        if (editPin.trim().length > 0) {
            if (editPin.trim().length < 4) throw new Error("Le code PIN doit contenir exactement 4 chiffres.");
            payload.code_secret = editPin.trim();
        }

        if (Object.keys(payload).length > 0) {
            // CORRECTION ICI
            const { data, error } = await supabase.from('tontine_members').update(payload).eq('id', currentUser.id).select();
            if (error) throw error;
            if (!data || data.length === 0) throw new Error("Sécurité Supabase : Enregistrement bloqué.");
            
            setCurrentUser({...currentUser, ...payload});
            setEditPin("");
            
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
            audio.volume = 0.4;
            audio.play().catch(() => {});
        }
    } catch (e: any) {
        alert(e.message || "Erreur lors de la mise à jour.");
    } finally {
        setIsSavingProfile(false);
    }
  };

  // --- RENDERING ---

  if (isCheckingSession) {
    return <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6"><Loader2 className="w-10 h-10 animate-spin text-black" /></div>;
  }

  if (!tontineId || !tontine) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-6"><X size={40}/></div>
        <h1 className={`${spaceGrotesk.className} text-2xl font-black uppercase text-red-600`}>Lien Invalide</h1>
        <p className="text-zinc-600 mt-2">L'identifiant de la tontine est manquant ou incorrect.</p>
      </div>
    );
  }

  // ECRAN DE CONNEXION
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 font-sans text-white">
        <InteractiveParticles themeColor={tontine?.theme_color || '#39FF14'} />
        <div className="w-full max-w-sm text-center z-10">
          <div className="mx-auto w-20 h-20 bg-black rounded-3xl flex items-center justify-center shadow-lg border-2 border-zinc-800 mb-8">
            {tontine.logo_url ? 
              <img src={tontine.logo_url} alt="Logo" className="w-full h-full object-cover rounded-[1.4rem]" /> : 
              <Users size={32} style={{ color: tontine.theme_color }} />
            }
          </div>
          <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-2`} style={{ color: tontine.theme_color }}>{tontine.nom}</h1>
          <p className="text-zinc-400 font-bold mb-10">Accédez à votre espace membre.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Phone size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Votre numéro de téléphone"
                className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-2xl p-4 pl-12 font-bold text-white outline-none focus:border-white transition"
              />
            </div>
            <div className="relative">
              <KeyRound size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Code PIN (défaut: 0000)"
                className="w-full bg-zinc-800 border-2 border-zinc-700 rounded-2xl p-4 pl-12 font-bold text-white outline-none focus:border-white transition"
              />
            </div>
            
            {loginError && <p className="text-red-400 text-xs font-bold pt-2">{loginError}</p>}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-5 rounded-2xl font-black uppercase text-sm shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
              style={{ backgroundColor: tontine.theme_color, color: '#000' }}
            >
              {isLoggingIn ? <Loader2 size={20} className="animate-spin" /> : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // DASHBOARD MEMBRE
  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans pb-28">
      <InteractiveParticles themeColor={tontine?.theme_color || '#009FDF'} />
      
      {/* --- ANIMATION DE CONFETTIS (GAGNANT) --- */}
      {showConfetti && (
        <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              className="absolute top-[-10%] opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 6}px`,
                height: `${Math.random() * 10 + 6}px`,
                backgroundColor: i % 3 === 0 ? '#ffffff' : (tontine?.theme_color || '#39FF14'),
                animation: `confetti-fall ${2 + Math.random() * 3}s linear forwards`,
                animationDelay: `${Math.random() * 1.5}s`,
                clipPath: i % 2 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none', 
              }}
            />
          ))}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes confetti-fall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
            }
          `}} />
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md font-black overflow-hidden" style={{ color: tontine.theme_color }}>
                {tontine.logo_url ? <img src={tontine.logo_url} alt="Logo Tontine" className="w-full h-full object-cover" /> : <Users size={20}/>}
             </div>
             <div>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">{tontine.nom}</p>
               <p className={`${spaceGrotesk.className} text-base font-black uppercase tracking-tighter leading-none`}>Espace Membre</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center shadow-sm font-black text-sm uppercase overflow-hidden text-black border-2 border-white">
                {currentUser.photo_url ? <img src={currentUser.photo_url} alt="Avatar" className="w-full h-full object-cover" /> : currentUser.prenom_nom.substring(0, 2)}
             </div>
             <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors bg-zinc-100 hover:bg-red-50 rounded-full" title="Se déconnecter">
               <LogOut size={16} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-28">
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* --- COLONNE GAUCHE : PROFIL MEMBRE --- */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-black flex items-center justify-center text-3xl font-black text-white overflow-hidden relative group shadow-lg mb-4" style={{ color: tontine.theme_color }}>
                    {currentUser.photo_url ? (
                        <img src={currentUser.photo_url} alt="Avatar" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        currentUser.prenom_nom.charAt(0)
                    )}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                         <button onClick={() => setShowPhotoInput(!showPhotoInput)} className="text-white bg-black/50 p-2 rounded-full hover:scale-110 transition-transform"><Camera size={16}/></button>
                    </div>
                </div>
                
                {showPhotoInput && (
                    <div className="w-full mb-4 animate-in fade-in slide-in-from-top-2">
                        <input type="url" placeholder="URL de la nouvelle photo" value={editPhotoUrl} onChange={e => setEditPhotoUrl(e.target.value)} className="w-full text-xs font-bold p-3 rounded-xl border border-zinc-200 focus:border-black outline-none bg-zinc-50 transition-colors" />
                    </div>
                )}

                <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase tracking-tighter text-center leading-tight`}>{currentUser.prenom_nom}</h2>
                {currentUser.poste && (
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-3 py-1 rounded-full mt-3">
                        {currentUser.poste}
                    </p>
                )}
                <p className="text-xs font-bold text-zinc-400 mt-2">{currentUser.telephone}</p>

                <div className="w-full mt-6">
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Date de Naissance</label>
                    {currentUser.date_naissance_modifiee ? (
                        <div>
                            <div className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 opacity-80">
                                <Lock size={16} className="text-zinc-400" />
                                <input type="date" disabled value={currentUser.date_naissance || ''} className="bg-transparent w-full text-sm font-bold text-zinc-500 outline-none cursor-not-allowed" />
                            </div>
                            <p className="text-[9px] text-zinc-400 mt-2 font-bold flex items-start gap-1.5 leading-tight"><AlertCircle size={12} className="shrink-0 text-red-400"/> Date verrouillée (Anti-Triche). Contactez l'admin pour modifier.</p>
                        </div>
                    ) : (
                        <input type="date" value={editDateNaissance} onChange={e => setEditDateNaissance(e.target.value)} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black transition" />
                    )}
                </div>

            <div className="w-full mt-4">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block">Code PIN Secret</label>
                <div className="relative">
                    <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                        type="password" 
                        inputMode="numeric" 
                        maxLength={4} 
                        value={editPin} 
                        onChange={e => setEditPin(e.target.value.replace(/[^0-9]/g, ''))} 
                        placeholder={(!currentUser.code_secret || currentUser.code_secret === '0000') ? "⚠️ Non sécurisé (0000) - Changez-le !" : "•••• (Laissez vide pour garder)"} 
                        className={`w-full p-3 pl-10 bg-zinc-50 border rounded-xl text-sm font-bold outline-none focus:border-black transition ${(!currentUser.code_secret || currentUser.code_secret === '0000') ? 'border-orange-300 placeholder:text-orange-500' : 'border-zinc-200'}`} 
                    />
                </div>
                {(!currentUser.code_secret || currentUser.code_secret === '0000') && (
                    <p className="text-[9px] text-orange-500 font-bold mt-1.5 flex items-center gap-1"><AlertCircle size={10}/> Votre code est 0000, veuillez le changer pour sécuriser votre compte.</p>
                )}
            </div>

            <button onClick={handleSaveProfile} disabled={isSavingProfile || (editDateNaissance === (currentUser.date_naissance || '') && editPhotoUrl === (currentUser.photo_url || '') && editPin === '')} className="w-full mt-6 py-4 rounded-xl font-black uppercase text-xs shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2" style={{ backgroundColor: tontine.theme_color, color: '#000' }}>
                    {isSavingProfile ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                    Mettre à jour le profil
                </button>
            </div>
            
            <section className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h2 className="text-lg font-black uppercase tracking-tighter">Votre Statut</h2>
                     <p className="text-xs text-zinc-500 font-medium mt-1">
                        Durée : {tontine.duree_mois} Mois
                        {endDateText && ` (Fin: ${endDateText})`}
                     </p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                     {currentUser.a_gagne && (
                        <div className="flex flex-col items-end gap-1">
                           <span className="bg-yellow-400 text-black border border-yellow-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1 animate-bounce">
                              🎉 A DÉJÀ GAGNÉ
                           </span>
                           <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                              Mois {currentUser.mois_victoire} • {montantParGagnant.toLocaleString()} F CFA
                           </span>
                        </div>
                     )}
                     {isUserUpToDate ? (
                        <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                           <CheckCircle size={12}/> À JOUR
                        </span>
                     ) : (
                        <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                           <AlertCircle size={12}/> À PAYER
                        </span>
                     )}
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Cotisation</p>
                     <p className="text-xl font-black tracking-tighter">{(currentUser.cotisation_individuelle || tontine.montant_mensuel).toLocaleString()} <span className="text-sm text-zinc-400">F</span></p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Mois Restants</p>
                     <p className="text-xl font-black tracking-tighter">{remainingMonths ?? tontine.duree_mois} <span className="text-sm text-zinc-400">/ {tontine.duree_mois}</span></p>
                  </div>
               </div>
            </section>
          </div>
        
          {/* --- COLONNE DROITE : DASHBOARD TONTINE --- */}
          <div className="md:col-span-8 space-y-6">
            
            {/* --- 2. SITUATION CAISSE GLOBALE --- */}
            <section className="bg-black p-6 md:p-8 rounded-[2rem] border-2 shadow-2xl relative overflow-hidden" style={{ borderColor: tontine.theme_color }}>
               <div className="absolute top-0 right-0 w-48 h-48 opacity-[0.05] blur-3xl rounded-full" style={{ backgroundColor: tontine.theme_color }}></div>
               
               <div className="flex justify-between items-end mb-6 relative z-10">
                  <div>
                     <p className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-2">
                        <Wallet size={14} style={{ color: tontine.theme_color }} /> Niveau de cotisation (Mois {currentMonth})
                     </p>
                     <p className="text-4xl font-black text-white tracking-tighter">{actuelCaisse.toLocaleString()} <span className="text-xl text-zinc-500 font-medium">/ {caisseMensuelle.toLocaleString()} F</span></p>
                  </div>
               </div>

               {/* Jauge de progression */}
               <div className="w-full bg-zinc-800 rounded-full h-4 mb-4 relative z-10 overflow-hidden shadow-inner">
                  <div 
                    className="h-full rounded-full transition-all duration-1000 ease-out" 
                    style={{ width: `${progressPercentage}%`, backgroundColor: tontine.theme_color, boxShadow: `0 0 15px ${tontine.theme_color}` }}
                  ></div>
               </div>
               
               <div className="flex justify-between items-center relative z-10">
                  <p className="text-sm text-zinc-400 font-bold">{cotisationsCeMois.length} membres sur {totalMembres} ont payé</p>
                  <p className="text-xs font-black uppercase tracking-widest text-black px-3 py-1.5 rounded shadow-md flex items-center gap-2" style={{ backgroundColor: tontine.theme_color }}>
                    <Calendar size={14} /> {dateTirage}
                  </p>
               </div>
            </section>

            {/* --- 3. MOTEUR DE TIRAGE (RÉVÉLATION GAGNANTS) --- */}
            <section className="bg-black rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center border-t-[8px]" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.15] blur-[100px] rounded-full pointer-events-none" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}></div>
               
               <div className="relative z-10 w-full">
                  <p className="font-black uppercase tracking-[0.3em] text-xs mb-6 flex items-center justify-center gap-2" style={{ color: tontine?.theme_color || '#39FF14' }}>
                     <Shuffle size={14}/> Tirage du Mois {maxMoisVictoire > 0 ? maxMoisVictoire : 1}
                  </p>
                  
                  {maxMoisVictoire === 0 ? (
                     <div className="py-8">
                       <h2 className={`${spaceGrotesk.className} text-3xl font-black text-white uppercase mb-4`}>Aucun tirage pour le moment</h2>
                       <p className="text-base font-medium text-zinc-400">Le premier tirage n'a pas encore été effectué par l'administrateur.</p>
                     </div>
                  ) : !revealed ? (
                     isSpinning ? (
                        <div className="flex flex-col items-center py-8">
                           <div className="w-24 h-24 rounded-full border-4 border-t-transparent animate-spin mb-8" style={{ borderColor: `${tontine?.theme_color || '#39FF14'}40`, borderTopColor: tontine?.theme_color || '#39FF14' }}></div>
                           <p className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest animate-pulse drop-shadow-lg">{spinName || "Mélange..."}</p>
                           <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-6">Découverte des gagnants...</p>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center py-8 gap-6">
                           <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black text-white uppercase mb-4 leading-tight`}>Les gagnants ont été tirés !</h2>
                           <button onClick={handleReveal} className="px-10 py-5 rounded-[2.5rem] font-black text-base uppercase tracking-widest transition-all shadow-xl hover:scale-105 flex items-center gap-3 animate-bounce" style={{ backgroundColor: tontine?.theme_color || '#39FF14', color: '#000' }}>
                              <Trophy size={24}/> Découvrir les gagnants
                           </button>
                        </div>
                     )
                  ) : (
                     <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 w-full">
                        <h2 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black text-white uppercase mb-8`}>Félicitations !</h2>
                        <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                           {recentWinners.map((winner: any) => (
                              <div key={winner.id} className="bg-zinc-900 border-2 p-5 md:p-6 rounded-3xl flex items-center gap-5 text-left shadow-lg" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
                                 <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0"><Medal size={28} style={{ color: tontine?.theme_color || '#39FF14' }}/></div>
                                 <div className="flex-1 min-w-0">
                                    <p className="font-black text-white uppercase text-lg leading-tight truncate">{winner.prenom_nom}</p>
                                    <p className="font-black text-sm mt-1" style={{ color: tontine?.theme_color || '#39FF14' }}>{montantParGagnant.toLocaleString()} F CFA</p>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}
               </div>
            </section>

            {/* --- 4. TRANSPARENCE (TIRAGES & ATTENTE) --- */}
            <section>
               <div className="flex gap-2 p-2 bg-zinc-100 rounded-[1.5rem] mb-6">
                  <button 
                    onClick={() => setActiveTab('historique')} 
                    className={`flex-1 py-4 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'historique' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                  >
                    Historique Gagnants
                  </button>
                  <button 
                    onClick={() => setActiveTab('attente')} 
                    className={`flex-1 py-4 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'attente' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}
                  >
                    En Attente ({waitingList.length})
                  </button>
               </div>

               {activeTab === 'historique' ? (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                     <div className="bg-zinc-100 border border-zinc-200 p-6 rounded-[2rem] flex items-start gap-4">
                        <div className="bg-black p-3 rounded-2xl mt-1 shadow-md" style={{ color: tontine.theme_color }}><ShieldCheck size={24}/></div>
                        <div>
                           <p className="text-base font-black text-black">Zéro Magouille garantie.</p>
                           <p className="text-sm text-zinc-600 font-medium mt-1 leading-relaxed">Les tirages sont effectués automatiquement par le système et enregistrés en toute transparence.</p>
                        </div>
                     </div>
                     
                     {winnersHistory.map((h: any, i: number) => (
                        <div key={i} className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm flex items-center justify-between hover:border-black transition-colors">
                           <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 px-3 py-1 rounded mb-3 inline-block">Mois {h.mois} • {h.date}</span>
                              <div className="flex flex-wrap items-center gap-2 mt-1">
                                 {h.winners.map((w: any, wIdx: number) => (
                                    <div key={wIdx} className="flex items-center gap-2">
                                       <div className="flex items-center gap-2.5 bg-zinc-50 pl-1.5 pr-4 py-1.5 rounded-full border border-zinc-200 shadow-sm hover:border-black transition-colors">
                                          <div className="w-8 h-8 rounded-full bg-black overflow-hidden flex items-center justify-center text-[10px] font-black text-white shrink-0">
                                             {w.photo ? <img src={w.photo} alt={w.nom} className="w-full h-full object-cover" /> : w.nom.substring(0, 2).toUpperCase()}
                                          </div>
                                          <span className="font-black text-black uppercase text-sm flex items-center gap-1">
                                             {w.nom} {w.is_admin && <span title="Gérant"><ShieldCheck size={14} className="text-yellow-500" /></span>}
                                          </span>
                                       </div>
                                       {wIdx < h.winners.length - 1 && <span className="text-zinc-300 font-black text-lg">&</span>}
                                    </div>
                                 ))}
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-black text-green-600">{h.amount.toLocaleString()} F</p>
                              <p className="text-[10px] font-bold text-zinc-500 uppercase mt-1 tracking-widest">Distribués</p>
                           </div>
                        </div>
                     ))}
                  </div>
               ) : (
                  <div className="bg-white border border-zinc-200 p-8 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-bottom-4">
                     <p className="text-sm text-zinc-500 font-bold mb-6">Ces membres (y compris vous) participeront aux prochains tirages au sort mensuels.</p>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {waitingList.map((m: any, i: number) => (
                           <div key={i} className={`flex items-center gap-3 p-4 rounded-2xl border ${m.id === currentUser.id ? 'bg-black text-white border-black shadow-lg' : 'bg-zinc-50 text-zinc-700 border-zinc-100 hover:border-zinc-300'}`}>
                              <Lock size={16} style={{ color: m.id === currentUser.id ? tontine.theme_color : '#a1a1aa' }} />
                              <span className="text-sm font-black uppercase truncate flex items-center gap-1.5">
                                 {m.prenom_nom.split(' ')[0]} {m.id === currentUser.id && "(Vous)"}
                                 {m.is_admin && <span title="Gérant"><ShieldCheck size={14} className="text-yellow-500" /></span>}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
               )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

export default TontineMembrePage;
"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  CheckCircle, AlertCircle, Wallet, Calendar, 
  History, Users, X, ChevronRight, ShieldCheck, 
  ArrowRight, Lock, Bell, LogOut, Shuffle, Trophy, Medal,
  Camera, Save, Loader2
} from "lucide-react";
import InteractiveParticles from '@/components/InteractiveParticles';

const spaceGrotesk = { className: "font-sans" };

export default function TontineMembreDashboard() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'historique' | 'attente'>('historique');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'wave' | 'om' | null>(null);
  
  // --- ETATS DE DONNEES BDD ---
  const [tontine, setTontine] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [cotisations, setCotisations] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinName, setSpinName] = useState("");
  const [revealed, setRevealed] = useState(false);

  // --- ETATS PROFIL MEMBRE ---
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editDateNaissance, setEditDateNaissance] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  
  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const tontineId = urlParams.get('id') || urlParams.get('tontine_id');
      const membreId = urlParams.get('membre_id');
      
      if (!tontineId || tontineId === 'null' || tontineId === 'undefined') {
        window.location.href = '/';
        return;
      }
      
      // Utilisation de maybeSingle() pour éviter l'erreur de crash PostgreSQL (PGRST116)
      const { data: tData, error } = await supabase.from('tontines').select('*').eq('id', tontineId).maybeSingle();
      
      if (error || !tData) {
        window.location.href = '/';
        return;
      }
      
      setTontine(tData);
      const { data: mData } = await supabase.from('membres').select('*').eq('tontine_id', tData.id);
      setMembers(mData || []);
      
      if (membreId && mData) {
          const user = mData.find(m => m.id === membreId);
          if (user) {
              setCurrentUser(user);
              setEditPhotoUrl(user.photo_url || '');
              setEditDateNaissance(user.date_naissance || '');
          }
      }

      const { data: cData } = await supabase.from('cotisations').select('*');
      setCotisations(cData || []);
    } catch (err) {
      console.error("Erreur Fetch Membre:", err);
      window.location.href = '/';
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- CALCULS GLOBAUX ---
  const totalMembres = members.length;
  const totalGagnantsMois = tontine?.gagnants_par_mois || 2;
  const moisEcoules = Math.floor(members.filter(m => m.a_gagne).length / totalGagnantsMois);
  const currentMonth = moisEcoules + 1;
  const dateTirage = `05 du mois`;
  
  const caisseMensuelle = totalMembres * (tontine?.montant_mensuel || 20000);
  const cotisationsCeMois = cotisations.filter(c => c.mois_numero === currentMonth && c.statut === 'Payé');
  const actuelCaisse = cotisationsCeMois.reduce((acc, c) => acc + c.montant, 0);
  
  const progressPercentage = (actuelCaisse / caisseMensuelle) * 100;
  
  const isUserUpToDate = cotisationsCeMois.some(c => c.membre_id === currentUser?.id);

  // HISTORIQUE GAGNANTS
  const winnersHistoryRaw = members.filter(m => m.a_gagne).reduce((acc: any, m: any) => {
    const mois = m.mois_victoire;
    if (!acc[mois]) acc[mois] = [];
    acc[mois].push({ nom: m.prenom_nom, photo: m.photo_url
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

  // --- GESTION PROFIL ---
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

        if (Object.keys(payload).length > 0) {
            const { error } = await supabase.from('membres').update(payload).eq('id', currentUser.id);
            if (error) throw error;
            setCurrentUser({...currentUser, ...payload});
        }
    } catch (e) {
        alert("Erreur lors de la mise à jour.");
    } finally {
        setIsSavingProfile(false);
    }
  };

  // --- GESTION DU PAIEMENT ---
  const handlePayment = async () => {
    if (!paymentMethod) return alert("Veuillez sélectionner un moyen de paiement.");
    setIsPaying(true);
    
    // Simulation paiement puis insertion BDD
    setTimeout(async () => {
      await supabase.from('cotisations').insert({
        membre_id: currentUser?.id,
        mois_numero: currentMonth,
        montant: tontine?.montant_mensuel || 20000,
        statut: 'Payé',
        date_paiement: new Date().toISOString()
      });
      
      fetchData(); // Rafraîchir
      setIsPaying(false);
      setShowPaymentModal(false);
      alert(`Paiement de ${(tontine?.montant_mensuel || 20000).toLocaleString()} F via ${paymentMethod.toUpperCase()} enregistré avec succès !`);
    }, 1500);
  };

  if (!tontine) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6"><div className="w-10 h-10 border-4 border-t-black rounded-full animate-spin"></div></div>;

  // ECRAN DE CONNEXION SIMULÉE
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
         <div className="bg-white p-8 rounded-[2.5rem] shadow-xl w-full max-w-md border-t-[8px]" style={{ borderColor: tontine.theme_color || '#39FF14' }}>
            <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 text-center leading-none`} style={{ color: tontine.theme_color || '#39FF14' }}>{tontine.nom}</h2>
            <p className="text-xs text-zinc-500 font-bold uppercase text-center mb-8 tracking-widest">Simuler une connexion membre</p>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
              {members.map((m: any) => (
                <button 
                  key={m.id} 
                  onClick={() => { 
                     setCurrentUser(m);
                     setEditPhotoUrl(m.photo_url || '');
                     setEditDateNaissance(m.date_naissance || '');
                     if(m.a_gagne) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 8000); } 
                  }} 
                  className="w-full text-left p-4 bg-zinc-50 hover:bg-zinc-100 hover:border-black rounded-xl font-black uppercase text-sm border border-zinc-200 transition"
                >
                  {m.prenom_nom}
                </button>
              ))}
              {members.length === 0 && <p className="text-center text-zinc-400 text-xs font-bold uppercase">Aucun membre dans cette tontine.</p>}
            </div>
         </div>
      </div>
    );
  }

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
                clipPath: i % 2 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none', // Alterne carrés et triangles
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
        <div className="max-w-2xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
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
             <button onClick={() => setCurrentUser(null)} className="p-2 text-zinc-400 hover:text-red-500 transition-colors bg-zinc-100 hover:bg-red-50 rounded-full" title="Se déconnecter">
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

                <button onClick={handleSaveProfile} disabled={isSavingProfile || (editDateNaissance === (currentUser.date_naissance || '') && editPhotoUrl === (currentUser.photo_url || ''))} className="w-full mt-6 py-4 rounded-xl font-black uppercase text-xs shadow-md hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2" style={{ backgroundColor: tontine.theme_color, color: '#000' }}>
                    {isSavingProfile ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                    Mettre à jour le profil
                </button>
            </div>
            
            <section className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
               <div className="flex justify-between items-start mb-6">
                  <div>
                     <h2 className="text-lg font-black uppercase tracking-tighter">Votre Statut</h2>
                     <p className="text-xs text-zinc-500 font-medium mt-1">Durée : {tontine.duree_mois} Mois</p>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                     {currentUser.a_gagne && (
                        <span className="bg-yellow-400 text-black border border-yellow-500 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1 animate-bounce">
                           🎉 A DÉJÀ GAGNÉ
                        </span>
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
                     <p className="text-xl font-black tracking-tighter">{tontine.montant_mensuel.toLocaleString()} <span className="text-sm text-zinc-400">F</span></p>
                  </div>
                  <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Historique</p>
                     <p className="text-xl font-black tracking-tighter">{cotisations.filter(c => c.membre_id === currentUser.id && c.statut === 'Payé').length} <span className="text-sm text-zinc-400">/ {tontine.duree_mois}</span></p>
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
                                             {w.nom} {w.is_admin && <ShieldCheck size={14} classNt 
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

      {/* --- BOUTON D'ACTION FIXE (MOBILE BOTTOM BAR) --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:hidden">
          <div className="max-w-2xl mx-auto">
             {isUserUpToDate ? (
               <button disabled className="w-full bg-zinc-100 text-zinc-400 py-4 rounded-2xl font-black uppercase text-sm flex justify-center items-center gap-2 cursor-not-allowed border border-zinc-200">
                  <CheckCircle size={18} /> Cotisation Mois {currentMonth} payée
               </button>
             ) : (
               <button 
                 onClick={() => setShowPaymentModal(true)} 
                 className="w-full bg-black py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-transform flex justify-center items-center gap-2"
                 style={{ color: tontine.theme_color }}
               >
                  Payer ma cotisation ({tontine.montant_mensuel.toLocaleString()} F)
               </button>
             )}
          </div>
      </div>

      {/* --- MODALE DE PAIEMENT SIMULÉE --- */}
      {showPaymentModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowPaymentModal(false)} className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 relative">
              <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 rounded-full text-zinc-500 hover:text-black hover:bg-zinc-200 transition-colors"><X size={20}/></button>
              
              <div className="text-center mb-8 mt-2">
                 <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-1`}>Régler ma cotisation</h3>
                 <p className="text-zinc-500 text-sm font-bold">Mois {currentMonth}</p>
                 <p className="text-4xl font-black tracking-tighter mt-4 text-black">{tontine.montant_mensuel.toLocaleString()} F</p>
              </div>

              <div className="space-y-3 mb-8">
                 <label 
                   className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'wave' ? 'border-[#1eb2e8] bg-[#1eb2e8]/5' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                 >
                    <div className="flex items-center gap-4">
                       <input 
                         type="radio" 
                         name="payment" 
                         value="wave" 
                         checked={paymentMethod === 'wave'} 
                         onChange={() => setPaymentMethod('wave')}
                         className="w-5 h-5 accent-[#1eb2e8]" 
                       />
                       <span className="font-black text-lg uppercase tracking-tighter">Wave</span>
                    </div>
                    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQm9rYPURKIok7K0ZF22oqFgMbzIHgNCauVQA&s" alt="Wave" className="h-6 rounded object-contain" />
                 </label>

                 <label 
                   className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === 'om' ? 'border-[#ff6600] bg-[#ff6600]/5' : 'border-zinc-200 bg-white hover:border-zinc-300'}`}
                 >
                    <div className="flex items-center gap-4">
                       <input 
                         type="radio" 
                         name="payment" 
                         value="om" 
                         checked={paymentMethod === 'om'} 
                         onChange={() => setPaymentMethod('om')}
                         className="w-5 h-5 accent-[#ff6600]" 
                       />
                       <span className="font-black text-lg uppercase tracking-tighter">Orange Money</span>
                    </div>
                    <img src="https://www.rapyd.net/wp-content/uploads/2025/04/Orange-Money-logo-500x336-1.png" alt="OM" className="h-6 object-contain" />
                 </label>
              </div>

              <button 
                onClick={handlePayment} 
                disabled={isPaying}
                className="w-full bg-black py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ color: tontine.theme_color }}
              >
                 {isPaying ? 'Traitement en cours...' : 'Confirmer le paiement'} <ArrowRight size={18}/>
              </button>
              <p className="text-center text-[10px] text-zinc-400 font-bold uppercase mt-4 tracking-widest flex items-center justify-center gap-1"><Lock size={10}/> Paiement 100% sécurisé</p>
           </div>
        </div>
      )}
    </div>
  );
}
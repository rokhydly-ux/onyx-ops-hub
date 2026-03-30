"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Wallet, Trophy, Shuffle, ShieldCheck, Home, Loader2, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Copy, Link as LinkIcon } from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';

const spaceGrotesk = { className: "font-sans" };

export default function TontineAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tontine, setTontine] = useState<any>(null);
  const [membres, setMembres] = useState<any[]>([]);
  const [cotisations, setCotisations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // --- ÉTATS MODALE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<any>(null);
  const [memberForm, setMemberForm] = useState({ prenom_nom: '', telephone: '', code_secret: '0000', a_gagne: false, photo_url: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- ÉTATS TIRAGE ---
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinName, setSpinName] = useState("");
  const [spinAvatar, setSpinAvatar] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const checkAuthAndLoad = async () => {
      try {
        console.log("🔍 1. DÉMARRAGE VÉRIFICATION ADMIN...");
        
        // 1. Vérification de la session Supabase (getUser est plus fiable)
        const { data: { user }, error: sessionErr } = await supabase.auth.getUser();
        
        if (sessionErr) {
          console.warn("⚠️ Session Supabase introuvable ou expirée :", sessionErr.message);
        }

        let finalUser: any = user;

        // 1.5. RÉCUPÉRATION DE SECOURS (Si connecté via le Hub personnalisé Onyx)
        if (!finalUser) {
          const customSession = localStorage.getItem('onyx_custom_session');
          if (customSession) {
              try { 
                  finalUser = JSON.parse(customSession);
              } catch (e) {}
          }
        }

        if (!finalUser) {
           console.log("❌ 2. AUCUNE SESSION TROUVÉE. Le navigateur a oublié la connexion. Redirection accès restreint.");
           if (isMounted) setIsLoading(false);
           return;
        }

        console.log("✅ 2. SESSION TROUVÉE ! Utilisateur connecté :", finalUser.email || finalUser.full_name, "| ID:", finalUser.id);
        if (isMounted) setCurrentUser(finalUser);

        // 2. Recherche de la tontine
        console.log("🔍 3. Recherche de la tontine pour owner_id...");
        const { data: tontines, error: fetchErr } = await supabase
          .from('tontines')
          .select('*')
          .eq('owner_id', finalUser.id);

        if (fetchErr) {
          console.error("❌ ERREUR SQL (Recherche Tontine) :", fetchErr.message);
          throw fetchErr;
        }

        console.log("✅ 4. Tontines trouvées :", tontines?.length);

        let targetTontine = tontines && tontines.length > 0 ? tontines[0] : null;

        // 3. Création automatique de sécurité
        if (!targetTontine) {
           console.log("⚠️ Aucune tontine existante. Création d'une nouvelle tontine de secours...");
           const { data: newT, error: insErr } = await supabase
             .from('tontines')
             .insert([{ 
                nom: 'Les Queens (Secours)', 
                theme_color: '#39FF14', 
                montant_mensuel: 20000, 
                gagnants_par_mois: 2, 
                duree_mois: 10, 
                owner_id: finalUser.id 
             }])
             .select('*');
             
           if (insErr) {
             console.error("❌ ERREUR SQL (Création Tontine) :", insErr.message);
             throw insErr;
           }
           targetTontine = newT?.[0];
        }

        // 4. Application finale
        if (isMounted && targetTontine) {
           setTontine(targetTontine);
           console.log("✅ 5. SUCCÈS TOTAL ! Tontine chargée :", targetTontine.nom);
           
           const { data: members } = await supabase
             .from('tontine_members')
             .select('*')
             .eq('tontine_id', targetTontine.id);
             
           if (isMounted) setMembres(members || []);

           // 5. On charge les cotisations
           const { data: cots, error: cotsErr } = await supabase
             .from('cotisations')
             .select('*');
           if (cotsErr) console.warn("Erreur chargement cotisations:", cotsErr.message);
           if (isMounted) setCotisations(cots || []);
        }

      } catch (error) {
        console.error("❌ CRASH GLOBALE ADMIN :", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Lancement au chargement de la page
    checkAuthAndLoad();

    // Écouteur en cas de reconnexion
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted && session?.user && !currentUser) {
         console.log("🔄 Changement de session détecté ! Rechargement...");
         checkAuthAndLoad();
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // --- FONCTIONS CRUD MEMBRES ---
  const openAddModal = () => {
    setEditingMember(null);
    setMemberForm({ prenom_nom: '', telephone: '', code_secret: '0000', a_gagne: false, photo_url: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (m: any) => {
    setEditingMember(m);
    setMemberForm({ prenom_nom: m.prenom_nom || '', telephone: m.telephone || '', code_secret: m.code_secret || '0000', a_gagne: !!m.a_gagne, photo_url: m.photo_url || '' });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!tontine) throw new Error("Tontine non chargée.");
      const payload = { tontine_id: tontine.id, prenom_nom: memberForm.prenom_nom, telephone: memberForm.telephone, code_secret: memberForm.code_secret, a_gagne: memberForm.a_gagne, photo_url: memberForm.photo_url };

      if (editingMember) {
        const { error } = await supabase.from('tontine_members').update(payload).eq('id', editingMember.id);
        if (error) throw error;
        setMembres(membres.map(m => m.id === editingMember.id ? { ...m, ...payload } : m));
      } else {
        const { data, error } = await supabase.from('tontine_members').insert([payload]).select();
        if (error) throw error;
        if (data) setMembres([...membres, data[0]]);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert("Erreur de sauvegarde: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce membre de la tontine ?")) return;
    const { error } = await supabase.from('tontine_members').delete().eq('id', id);
    if (error) alert("Erreur de suppression: " + error.message);
    else setMembres(membres.filter(m => m.id !== id));
  };

  const handleCopyLink = () => {
    if (!tontine) return;
    const url = window.location.origin + '/tontine/membre?id=' + tontine.id;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTirage = async () => {
    const eligibles = membres.filter(m => !m.a_gagne);
    if (eligibles.length === 0) {
      alert("Aucun membre éligible pour le tirage !");
      return;
    }

    setIsSpinning(true);
    setRecentWinners([]);
    setShowConfetti(false);

    const interval = setInterval(() => {
      const randomMember = eligibles[Math.floor(Math.random() * eligibles.length)];
      setSpinName(randomMember.prenom_nom);
      setSpinAvatar(randomMember.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(randomMember.prenom_nom)}&background=000&color=${tontine?.theme_color?.replace('#','') || '39FF14'}`);
    }, 100);

    setTimeout(async () => {
      clearInterval(interval);
      
      const nbGagnants = tontine?.gagnants_par_mois || 1;
      const currentMonthCalc = Math.floor(membres.filter(m => m.a_gagne).length / nbGagnants) + 1;
      
      const shuffled = [...eligibles].sort(() => 0.5 - Math.random());
      const selectedWinners = shuffled.slice(0, nbGagnants);
      
      try {
        const winnerIds = selectedWinners.map(w => w.id);
        const { error } = await supabase
          .from('tontine_members')
          .update({ a_gagne: true, mois_victoire: currentMonthCalc })
          .in('id', winnerIds);

        if (error) throw error;

        setMembres(membres.map(m => 
          winnerIds.includes(m.id) ? { ...m, a_gagne: true, mois_victoire: currentMonthCalc } : m
        ));
        setRecentWinners(selectedWinners);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 8000);

        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
        audio.volume = 0.5;
        audio.play().catch(()=>{});
      } catch (err: any) {
        alert("Erreur lors du tirage : " + err.message);
      } finally {
        setIsSpinning(false);
      }
    }, 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin" style={{ color: tontine?.theme_color || '#39FF14' }} />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <ShieldCheck size={64} className="text-red-500 mb-6" />
        <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-4`}>Accès Restreint</h1>
        <p className="text-zinc-400 mb-8">Veuillez vous connecter depuis le Hub Administrateur pour accéder à ce tableau de bord.</p>
        <button onClick={() => window.location.href = '/hub'} className="text-black px-8 py-4 rounded-xl font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}>
          <Home size={20} /> Retourner au Hub
        </button>
      </div>
    );
  }

  if (currentUser && !tontine) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <ShieldCheck size={64} className="text-orange-500 mb-6" />
        <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-4`}>Problème de configuration (RLS)</h1>
        <p className="text-zinc-400 mb-4 max-w-md">Vous êtes bien connecté(e), mais la base de données bloque la lecture ou la création de votre Tontine.</p>
        <p className="text-sm text-zinc-500 mb-8 max-w-md border border-zinc-800 p-4 rounded-xl bg-zinc-800/50">
           <b>Solution :</b> Allez dans Supabase &gt; Authentication &gt; Policies (RLS) et assurez-vous que les règles d'insertion et de lecture sont activées pour la table <b>tontines</b>.
        </p>
        <button onClick={() => window.location.reload()} className="bg-orange-500 text-black px-8 py-4 rounded-xl font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform">
           Réessayer
        </button>
      </div>
    );
  }

  // --- CALCULS DU MOIS EN COURS ET DE LA CAISSE ---
  const totalGagnantsMois = tontine?.gagnants_par_mois || 1;
  const moisEcoules = Math.floor(membres.filter(m => m.a_gagne).length / totalGagnantsMois);
  const currentMonth = moisEcoules + 1;

  const caisseMensuelle = membres.length * (tontine?.montant_mensuel || 0);
  const cotisationsCeMois = cotisations.filter(c => c.mois_numero === currentMonth && c.statut === 'Payé' && membres.some(m => m.id === c.membre_id));
  const actuelCaisse = cotisationsCeMois.reduce((acc, c) => acc + (c.montant || tontine?.montant_mensuel || 0), 0);
  const progressPercentage = caisseMensuelle > 0 ? (actuelCaisse / caisseMensuelle) * 100 : 0;

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-24 text-black relative">
      <InteractiveParticles themeColor={tontine?.theme_color || '#39FF14'} />
      
      {showConfetti && (
        <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
          {[...Array(100)].map((_, i) => (
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

      <header className="bg-black text-white py-6 px-8 flex justify-between items-center shadow-lg relative z-10">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}>
               <ShieldCheck size={24} className="text-black" />
            </div>
            <div>
               <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Onyx Tontine</h1>
               <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tontine?.theme_color || '#39FF14' }}>Espace Administrateur</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
             <button onClick={handleCopyLink} className="text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all" style={{ backgroundColor: copied ? (tontine?.theme_color || '#39FF14') : '#fff' }}>
                 {copied ? <CheckCircle size={16} /> : <LinkIcon size={16} />}
                 {copied ? "Lien copié !" : "Lien Membres"}
             </button>
             <button onClick={() => window.location.href = '/hub'} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold bg-zinc-800 px-4 py-2 rounded-full">
               <Home size={16} /> Hub
             </button>
         </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-8 relative z-10">
         <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
            <div>
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-2`}>{tontine?.nom || "Ma Tontine"}</h2>
               <p className="text-sm text-zinc-500 font-bold flex items-center gap-2">
                 <Wallet size={16}/> Montant mensuel : {(tontine?.montant_mensuel || 0).toLocaleString()} F CFA
               </p>
            </div>
         </div>

         <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}></div>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Users size={14}/> Membres Actifs</p>
               <p className={`${spaceGrotesk.className} text-4xl font-black`} style={{ color: tontine?.theme_color || '#39FF14' }}>{membres.length}</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Wallet size={14}/> Caisse Mensuelle</p>
               <p className={`${spaceGrotesk.className} text-4xl font-black`}>{caisseMensuelle.toLocaleString()} F</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Trophy size={14}/> Gagnants par mois</p>
               <p className={`${spaceGrotesk.className} text-4xl font-black`}>{tontine?.gagnants_par_mois || 1}</p>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200 flex flex-col justify-center">
            <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg mb-6`}>Progression du mois</h3>
            <div className="flex justify-between items-center text-sm font-bold text-zinc-500 mb-2">
               <span>Cotisations (Mois {currentMonth})</span>
               <span className="text-black">{actuelCaisse.toLocaleString()} / {caisseMensuelle.toLocaleString()} F</span>
            </div>
            <div className="w-full h-6 bg-zinc-100 rounded-full overflow-hidden mb-2 shadow-inner">
               <div className="h-full bg-black rounded-full relative transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }}>
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"></div>
               </div>
            </div>
            <div className="text-right text-xs font-black text-zinc-400">{Math.round(progressPercentage)}%</div>
         </div>

         <section className="bg-black rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center border-t-[8px]" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.15] blur-[100px] rounded-full pointer-events-none" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}></div>
            
            <div className="relative z-10 w-full">
               <p className="font-black uppercase tracking-[0.3em] text-xs mb-6 flex items-center justify-center gap-2" style={{ color: tontine?.theme_color || '#39FF14' }}>
                  <Shuffle size={14}/> Tirage du Mois {currentMonth}
               </p>
               
               {isSpinning ? (
                  <div className="flex flex-col items-center py-8">
                     <div className="relative mb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-t-transparent animate-spin absolute inset-0" style={{ borderColor: `${tontine?.theme_color || '#39FF14'}40`, borderTopColor: tontine?.theme_color || '#39FF14' }}></div>
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black z-10 relative">
                          <img src={spinAvatar || `https://ui-avatars.com/api/?name=Onyx&background=000&color=${tontine?.theme_color?.replace('#','') || '39FF14'}`} alt="Avatar" className="w-full h-full object-cover" />
                        </div>
                     </div>
                     <p className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest animate-pulse drop-shadow-lg">{spinName || "Mélange..."}</p>
                     <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-6">Découverte des gagnants...</p>
                  </div>
               ) : recentWinners.length > 0 ? (
                  <div className="animate-in slide-in-from-bottom-8 fade-in duration-500 w-full">
                     <h2 className={`${spaceGrotesk.className} text-3xl md:text-4xl font-black text-white uppercase mb-8`}>Félicitations !</h2>
                     <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {recentWinners.map((winner: any) => (
                           <div key={winner.id} className="bg-zinc-900 border-2 p-5 md:p-6 rounded-3xl flex items-center gap-5 text-left shadow-lg" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
                              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border-2" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
                                <img src={winner.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(winner.prenom_nom)}&background=000&color=${tontine?.theme_color?.replace('#','') || '39FF14'}`} alt="Winner" className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                 <p className="font-black text-white uppercase text-lg leading-tight truncate">{winner.prenom_nom}</p>
                                 <p className="font-black text-sm mt-1" style={{ color: tontine?.theme_color || '#39FF14' }}>{tontine?.montant_mensuel ? (caisseMensuelle / (tontine?.gagnants_par_mois || 1)).toLocaleString() : 0} F CFA</p>
                              </div>
                           </div>
                        ))}
                     </div>
                     <button onClick={() => setRecentWinners([])} className="mt-8 bg-zinc-800 text-white px-6 py-3 rounded-full text-xs font-bold uppercase hover:bg-zinc-700 transition">Terminer le tirage</button>
                  </div>
               ) : (
                  <div className="flex flex-col items-center py-8 gap-6">
                     <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black text-white uppercase mb-4 leading-tight`}>Lancer la sélection</h2>
                     <button onClick={handleTirage} className="px-10 py-5 rounded-[2.5rem] font-black text-base uppercase tracking-widest transition-all shadow-xl hover:scale-105 flex items-center gap-3 animate-bounce mx-auto" style={{ backgroundColor: tontine?.theme_color || '#39FF14', color: '#000' }}>
                        <Shuffle size={24}/> Démarrer le tirage
                     </button>
                     <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-6">Zéro triche, 100% transparent.</p>
                  </div>
               )}
            </div>
         </section>

         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl`}>Liste des Membres</h3>
               <button onClick={openAddModal} className="bg-black px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform shadow-md" style={{ color: tontine?.theme_color || '#39FF14' }}>
                 <Plus size={16}/> Ajouter un membre
               </button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-zinc-200">
                        <th className="py-4 text-xs font-black uppercase text-zinc-500 tracking-widest">Membre</th>
                        <th className="py-4 text-xs font-black uppercase text-zinc-500 tracking-widest">Téléphone</th>
                        <th className="py-4 text-xs font-black uppercase text-zinc-500 tracking-widest">Tirage</th>
                        <th className="py-4 text-xs font-black uppercase text-zinc-500 tracking-widest">Paiement M{currentMonth}</th>
                        <th className="py-4 text-xs font-black uppercase text-zinc-500 tracking-widest text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {membres.map((m) => {
                        const hasPaid = cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
                        return (
                        <tr key={m.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                           <td className="py-4 font-bold flex items-center gap-3">
                              <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.prenom_nom)}&background=000&color=${tontine?.theme_color?.replace('#','') || '39FF14'}`} alt="Avatar" className="w-8 h-8 rounded-full border border-zinc-200" />
                              {m.prenom_nom}
                           </td>
                           <td className="py-4 font-mono text-sm">{m.telephone}</td>
                           <td className="py-4">
                              {m.a_gagne ? (
                                 <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">A Gagné</span>
                              ) : (
                                 <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">En Attente</span>
                              )}
                           </td>
                           <td className="py-4">
                              {hasPaid ? (
                                 <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1"><CheckCircle size={12}/> Payé</span>
                              ) : (
                                 <span className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1"><AlertCircle size={12}/> À Payer</span>
                              )}
                           </td>
                           <td className="py-4 text-right">
                              <div className="flex justify-end gap-2">
                                 <button onClick={() => openEditModal(m)} className="p-2 bg-zinc-100 text-black rounded-lg hover:bg-zinc-200 transition" title="Modifier"><Edit size={14}/></button>
                                 <button onClick={() => handleDeleteMember(m.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title="Supprimer"><Trash2 size={14}/></button>
                              </div>
                           </td>
                        </tr>
                     )})}
                     {membres.length === 0 && (
                        <tr>
                           <td colSpan={5} className="py-8 text-center text-zinc-500 font-bold">Aucun membre pour le moment.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </main>

      {/* --- MODALE AJOUT / ÉDITION --- */}
      {isModalOpen && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"><X size={20}/></button>
            
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 text-black`}>
               {editingMember ? "Modifier le Membre" : "Nouveau Membre"}
            </h2>
            
            <form onSubmit={handleSaveMember} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Prénom & Nom</label>
                <input type="text" required value={memberForm.prenom_nom} onChange={e => setMemberForm({...memberForm, prenom_nom: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="Ex: Moussa Ndiaye" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Numéro de Téléphone</label>
                <input type="tel" required value={memberForm.telephone} onChange={e => setMemberForm({...memberForm, telephone: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="Ex: 77 123 45 67" />
              </div>
              <div className="col-span-full">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">URL Photo de Profil (Optionnel)</label>
                <input type="url" value={memberForm.photo_url} onChange={e => setMemberForm({...memberForm, photo_url: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="https://lien-vers-la-photo.com/image.jpg" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 col-span-full">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Code PIN Secret</label>
                    <input type="text" maxLength={4} value={memberForm.code_secret} onChange={e => setMemberForm({...memberForm, code_secret: e.target.value.replace(/\D/g, '')})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black tracking-widest" placeholder="0000" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Statut Tirage</label>
                    <select value={memberForm.a_gagne ? 'oui' : 'non'} onChange={e => setMemberForm({...memberForm, a_gagne: e.target.value === 'oui'})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition appearance-none cursor-pointer text-black">
                      <option value="non">En Attente</option>
                      <option value="oui">A Déja Gagné</option>
                    </select>
                  </div>
              </div>
              
              <button type="submit" disabled={isSaving} className="w-full mt-6 bg-black py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ color: tontine?.theme_color || '#39FF14' }}>
                {isSaving ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>}
                {isSaving ? "Sauvegarde..." : "Enregistrer la fiche"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
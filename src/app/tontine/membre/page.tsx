"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams } from "next/navigation";
import { 
  CheckCircle, AlertCircle, Wallet, Calendar, 
  History, Users, X, ChevronRight, ShieldCheck, 
  ArrowRight, Lock, Bell, LogOut
} from "lucide-react";

const spaceGrotesk = { className: "font-sans" };

export default function TontineMembreDashboard() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6"><div className="w-10 h-10 border-4 border-t-black rounded-full animate-spin"></div></div>}>
      <TontineMembreContent />
    </React.Suspense>
  );
}

function TontineMembreContent() {
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
  const [invalidLink, setInvalidLink] = useState(false);
  
  const searchParams = useSearchParams();

  // --- CHARGEMENT DES DONNÉES ---
  const fetchData = async () => {
    try {
      const tontineId = searchParams.get('id');
      
      if (!tontineId || tontineId === 'null') {
        setInvalidLink(true);
        return;
      }
      
      // Utilisation de maybeSingle() pour éviter l'erreur de crash PostgreSQL (PGRST116)
      const { data: tData, error } = await supabase.from('tontines').select('*').eq('id', tontineId).maybeSingle();
      
      if (error || !tData) {
        setInvalidLink(true);
        return;
      }
      
      setTontine(tData);
      const { data: mData } = await supabase.from('membres').select('*').eq('tontine_id', tData.id);
      setMembers(mData || []);
      
      const { data: cData } = await supabase.from('cotisations').select('*');
      setCotisations(cData || []);
    } catch (err) {
      console.error("Erreur Fetch Membre:", err);
      setInvalidLink(true);
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
    acc[mois].push(m.prenom_nom);
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

  if (invalidLink) {
     return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 text-center font-sans">
           <div className="bg-white p-10 rounded-[3rem] shadow-xl max-w-md w-full border-t-[8px] border-red-500">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-6"/>
              <h1 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-4 text-black`}>Lien Invalide</h1>
              <p className="text-zinc-500 font-bold text-sm">Le lien de cette tontine est introuvable ou a été désactivé. Veuillez demander le lien correct à votre administrateur.</p>
           </div>
        </div>
     );
  }

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
                backgroundColor: ['#39FF14', '#FF5722', '#00E5FF', '#FACC15', '#B026FF', '#ffffff'][i % 6],
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
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shadow-md font-black text-lg" style={{ color: tontine.theme_color }}>
                {currentUser.prenom_nom.charAt(0)}
             </div>
             <div>
               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest leading-none mb-1">{tontine.nom}</p>
               <h1 className={`${spaceGrotesk.className} text-base font-black uppercase tracking-tighter leading-none`}>{currentUser.prenom_nom}</h1>
             </div>
          </div>
          <button onClick={() => setCurrentUser(null)} className="relative p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Se déconnecter">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* --- 1. VUE D'ENSEMBLE PERSONNELLE --- */}
        <section className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
           <div className="flex justify-between items-start mb-6">
              <div>
                 <h2 className="text-xl font-black uppercase tracking-tighter">Votre Statut</h2>
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
                 <p className="text-xl font-black tracking-tighter">{cotisations.filter(c => c.membre_id === currentUser.id && c.statut === 'Payé').length} <span className="text-sm text-zinc-400">/ {tontine.duree_mois} mois</span></p>
              </div>
           </div>
        </section>

        {/* --- 2. SITUATION CAISSE GLOBALE --- */}
        <section className="bg-black p-6 rounded-[2rem] border-2 shadow-2xl relative overflow-hidden" style={{ borderColor: tontine.theme_color }}>
           <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.05] blur-2xl rounded-full" style={{ backgroundColor: tontine.theme_color }}></div>
           
           <div className="flex justify-between items-end mb-4 relative z-10">
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2 mb-1">
                    <Wallet size={12} style={{ color: tontine.theme_color }} /> Caisse Mois {currentMonth}
                 </p>
                 <p className="text-3xl font-black text-white tracking-tighter">{actuelCaisse.toLocaleString()} <span className="text-lg text-zinc-500 font-medium">/ {caisseMensuelle.toLocaleString()} F</span></p>
              </div>
           </div>

           {/* Jauge de progression */}
           <div className="w-full bg-zinc-800 rounded-full h-3 mb-3 relative z-10 overflow-hidden">
              <div 
                className="h-3 rounded-full transition-all duration-1000" 
                style={{ width: `${progressPercentage}%`, backgroundColor: tontine.theme_color, boxShadow: `0 0 10px ${tontine.theme_color}` }}
              ></div>
           </div>
           
           <div className="flex justify-between items-center relative z-10">
              <p className="text-xs text-zinc-400 font-bold">{cotisationsCeMois.length} membres sur {totalMembres} ont payé</p>
              <p className="text-[10px] font-black uppercase tracking-widest text-black px-2 py-1 rounded shadow-md flex items-center gap-1" style={{ backgroundColor: tontine.theme_color }}>
                <Calendar size={10} /> {dateTirage}
              </p>
           </div>
        </section>

        {/* --- 3. TRANSPARENCE (TIRAGES & ATTENTE) --- */}
        <section>
           <div className="flex gap-2 p-1.5 bg-zinc-100 rounded-2xl mb-4">
              <button 
                onClick={() => setActiveTab('historique')} 
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'historique' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}
              >
                Historique Gagnants
              </button>
              <button 
                onClick={() => setActiveTab('attente')} 
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'attente' ? 'bg-white text-black shadow-sm' : 'text-zinc-500'}`}
              >
                En Attente ({waitingList.length})
              </button>
           </div>

           {activeTab === 'historique' ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                 <div className="bg-zinc-100 border border-zinc-200 p-4 rounded-[1.5rem] flex items-start gap-4">
                    <div className="bg-black p-2.5 rounded-xl mt-1" style={{ color: tontine.theme_color }}><ShieldCheck size={18}/></div>
                    <div>
                       <p className="text-sm font-black text-black">Zéro Magouille garantie.</p>
                       <p className="text-xs text-zinc-600 font-medium mt-1 leading-relaxed">Les tirages sont effectués automatiquement par le système et envoyés en vidéo dans le groupe.</p>
                    </div>
                 </div>
                 
                 {winnersHistory.map((h: any, i: number) => (
                    <div key={i} className="bg-white border border-zinc-200 p-5 rounded-[1.5rem] shadow-sm flex items-center justify-between">
                       <div>
                          <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded mb-2 inline-block">Mois {h.mois} • {h.date}</span>
                          <p className="font-black text-black uppercase line-clamp-1">{h.winners.join(" & ")}</p>
                       </div>
                       <div className="text-right">
                          <p className="text-sm font-black text-green-600">{h.amount.toLocaleString()} F</p>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase mt-0.5">Distribués</p>
                       </div>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="bg-white border border-zinc-200 p-6 rounded-[1.5rem] shadow-sm animate-in fade-in slide-in-from-bottom-4">
                 <p className="text-xs text-zinc-500 font-bold mb-4">Ces membres (y compris vous) participeront aux prochains tirages au sort mensuels.</p>
                 <div className="grid grid-cols-2 gap-3">
                    {waitingList.map((m: any, i: number) => (
                       <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${m.id === currentUser.id ? 'bg-black text-white border-black' : 'bg-zinc-50 text-zinc-700 border-zinc-100'}`}>
                          <Lock size={14} style={{ color: m.id === currentUser.id ? tontine.theme_color : '#a1a1aa' }} />
                          <span className="text-xs font-black uppercase truncate">{m.prenom_nom.split(' ')[0]} {m.id === currentUser.id && "(Vous)"}</span>
                       </div>
                    ))}
                 </div>
              </div>
           )}
        </section>
      </main>

      {/* --- BOUTON D'ACTION FIXE (MOBILE BOTTOM BAR) --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 p-4 z-40 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
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
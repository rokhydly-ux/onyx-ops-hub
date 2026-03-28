"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Wallet, Trophy, Shuffle, ShieldCheck, Home, Loader2 } from 'lucide-react';

const spaceGrotesk = { className: "font-sans" };

export default function TontineAdminPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tontine, setTontine] = useState<any>(null);
  const [membres, setMembres] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadAdminDashboard = async (user: any) => {
      try {
        setCurrentUser(user);
        
        // 1. On cherche LA tontine de cet administrateur (owner_id)
        const { data: tontines, error: fetchErr } = await supabase
          .from('tontines')
          .select('*')
          .eq('owner_id', user.id);

        if (fetchErr) throw fetchErr;

        let targetTontine = tontines && tontines.length > 0 ? tontines[0] : null;

        // 2. Sécurité : S'il n'en a pas, on lui en crée une silencieusement
        if (!targetTontine) {
          const { data: newTontineData, error: insertErr } = await supabase
            .from('tontines')
            .insert([{ 
              nom: 'Ma Tontine', 
              theme_color: '#39FF14', 
              montant_mensuel: 20000, 
              gagnants_par_mois: 2, 
              duree_mois: 10, 
              owner_id: user.id 
            }])
            .select('*');

          if (!insertErr && newTontineData && newTontineData.length > 0) {
            targetTontine = newTontineData[0];
          }
        }

        if (!targetTontine) throw new Error("Impossible de charger la tontine.");

        // 3. On applique la tontine et on charge SES membres
        if (isMounted) {
          setTontine(targetTontine);
          const { data: members } = await supabase
            .from('tontine_members')
            .select('*')
            .eq('tontine_id', targetTontine.id);
            
          setMembres(members || []);
        }

      } catch (err: any) {
        console.error("Erreur d'accès Admin :", err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Écouteur de session Auth direct (Celui du Hub)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        if (session?.user) {
          loadAdminDashboard(session.user);
        } else {
          setIsLoading(false); // Redirigera vers l'écran "Accès Restreint" classique
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted && session?.user && !currentUser) {
        setIsLoading(true);
        loadAdminDashboard(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-center text-white">
        <ShieldCheck size={64} className="text-red-500 mb-6" />
        <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-4`}>Accès Restreint</h1>
        <p className="text-zinc-400 mb-8">Veuillez vous connecter depuis le Hub Administrateur pour accéder à ce tableau de bord.</p>
        <button onClick={() => window.location.href = '/admin'} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform">
          <Home size={20} /> Retourner au Hub
        </button>
      </div>
    );
  }

  const caisseMensuelle = membres.length * (tontine?.montant_mensuel || 0);

  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-24 text-black">
      <header className="bg-black text-white py-6 px-8 flex justify-between items-center shadow-lg">
         <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#39FF14] rounded-xl flex items-center justify-center">
               <ShieldCheck size={24} className="text-black" />
            </div>
            <div>
               <h1 className="text-xl font-black uppercase tracking-tighter leading-none">Onyx Tontine</h1>
               <p className="text-[10px] text-[#39FF14] font-bold uppercase tracking-widest">Espace Administrateur</p>
            </div>
         </div>
         <button onClick={() => window.location.href = '/admin'} className="text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold bg-zinc-800 px-4 py-2 rounded-full">
           <Home size={16} /> Hub
         </button>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-10 space-y-8">
         <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
            <div>
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-2`}>{tontine?.nom || "Ma Tontine"}</h2>
               <p className="text-sm text-zinc-500 font-bold flex items-center gap-2">
                 <Wallet size={16}/> Montant mensuel : {tontine?.montant_mensuel?.toLocaleString()} F CFA
               </p>
            </div>
         </div>

         <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14] opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
               <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2"><Users size={14}/> Membres Actifs</p>
               <p className={`${spaceGrotesk.className} text-4xl font-black text-[#39FF14]`}>{membres.length}</p>
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

         <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200 flex flex-col justify-center">
               <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg mb-6`}>Progression du mois</h3>
               <div className="w-full h-6 bg-zinc-100 rounded-full overflow-hidden mb-4 shadow-inner">
                  <div className="h-full bg-black w-3/4 rounded-full relative">
                     <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"></div>
                  </div>
               </div>
               <div className="flex justify-between items-center text-sm font-bold text-zinc-500">
                  <span>Cotisations estimées en cours</span>
                  <span className="text-black">100%</span>
               </div>
            </div>

            <div className="bg-[#39FF14] p-8 rounded-[2rem] shadow-lg flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 bg-black text-[#39FF14] rounded-2xl flex items-center justify-center mb-4 shadow-xl">
                  <Shuffle size={32} />
               </div>
               <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl mb-2 text-black`}>Tirage au sort</h3>
               <p className="text-sm font-bold text-zinc-800 mb-6">Sélectionnez le gagnant de ce mois de manière transparente.</p>
               <button className="bg-black text-[#39FF14] px-8 py-4 rounded-xl font-black uppercase text-sm w-full hover:scale-105 transition-transform shadow-xl">
                  Lancer le tirage
               </button>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
            <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl mb-6`}>Liste des Membres</h3>
            <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="border-b border-zinc-200">
                        <th className="py-4 text-xs font-black uppercase text-zinc-500 tracking-widest">Membre</th>
                        <th className="py-4 text-xs font-black uppercase text-zinc-500 tracking-widest">Téléphone</th>
                        <th className="py-4 text-xs font-black uppercase text-zinc-500 tracking-widest">Statut</th>
                     </tr>
                  </thead>
                  <tbody>
                     {membres.map((m) => (
                        <tr key={m.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                           <td className="py-4 font-bold">{m.prenom_nom}</td>
                           <td className="py-4 font-mono text-sm">{m.telephone}</td>
                           <td className="py-4">
                              {m.a_gagne ? (
                                 <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">A Gagné</span>
                              ) : (
                                 <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">En Attente</span>
                              )}
                           </td>
                        </tr>
                     ))}
                     {membres.length === 0 && (
                        <tr>
                           <td colSpan={3} className="py-8 text-center text-zinc-500 font-bold">Aucun membre pour le moment.</td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </main>
    </div>
  );
}
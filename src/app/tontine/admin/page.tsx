"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Users, Trophy, AlertCircle, CheckCircle, Search, Copy, 
  Upload, Settings, LogOut, Link as LinkIcon, Download, 
  Play, Medal, Cake, Briefcase, Phone, MessageCircle, ShieldCheck, Home
} from 'lucide-react';
import * as XLSX from 'xlsx';
import InteractiveParticles from '@/components/InteractiveParticles';
import { useRouter } from 'next/navigation';

const spaceGrotesk = { className: "font-sans" };

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data States
  const [tontine, setTontine] = useState<any>(null);
  const [membres, setMembres] = useState<any[]>([]);
  const [cotisations, setCotisations] = useState<any[]>([]);
  
  // UI States
  const [searchTerm, setSearchTerm] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Animation States
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinName, setSpinName] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);

  // Refs pour le scroll
  const sectionMembresRef = useRef<HTMLElement>(null);
  const sectionTirageRef = useRef<HTMLElement>(null);

  // 1. AUTHENTIFICATION ANTI-CRASH (La VRAIE version blindée)
  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        // ⏳ LA PAUSE MAGIQUE : On force l'attente pour Vercel
        await new Promise(resolve => setTimeout(resolve, 500));

        const { data, error } = await supabase.auth.getSession();

        if (error && error.name !== 'AuthSessionMissingError' && !error.message.includes('missing')) {
            throw error;
        }

        if (!data?.session?.user) {
           if (isMounted) setIsLoading(false);
           return;
        }

        const user = data.session.user;
        if (isMounted) setCurrentUser(user);

        // Recherche de la tontine
        const { data: tontines } = await supabase
          .from('tontines')
          .select('*')
          .eq('owner_id', user.id);

        let currentTontine = tontines && tontines.length > 0 ? tontines[0] : null;

        // Création de secours si vide
        if (!currentTontine) {
           const { data: newT } = await supabase
             .from('tontines')
             .insert([{ 
                nom: 'Les Queens', 
                owner_id: user.id, 
                theme_color: '#39FF14',
                montant_mensuel: 20000,
                gagnants_par_mois: 2,
                duree_mois: 10
             }])
             .select('*');
           currentTontine = newT?.[0];
        }

        if (isMounted && currentTontine) {
           setTontine(currentTontine);
           fetchMembersAndCotisations(currentTontine.id);
        }
      } catch (err) {
         console.log("🛡️ Crash ignoré :", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();

    // 🕸️ LE FILET DE SÉCURITÉ : Si la session arrive en retard, on la rattrape !
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted && session?.user && !currentUser) {
         loadDashboard();
      }
    });

    return () => { 
      isMounted = false; 
      subscription.unsubscribe();
    };
  }, [currentUser]);

  const fetchMembersAndCotisations = async (tontineId: string) => {
    const { data: members } = await supabase.from('tontine_members').select('*').eq('tontine_id', tontineId);
    const { data: cots } = await supabase.from('cotisations').select('*');
    setMembres(members || []);
    setCotisations(cots || []);
  };

  // 2. FONCTIONS AVANCÉES
  const handleCopyLink = () => {
    const link = `${window.location.origin}/tontine/membre?id=${tontine?.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !tontine) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const formattedMembers = data.map((row: any) => {
        let rawPhone = String(row['Téléphone'] || row['Telephone'] || '').split('.')[0];
        let phone = rawPhone.replace(/[^0-9]/g, '');
        if (phone.startsWith('221')) phone = phone.slice(3);
        if (phone.startsWith('00221')) phone = phone.slice(5);

        return {
          tontine_id: tontine.id,
          prenom_nom: row['Nom Complet'] || row['Nom'] || 'Inconnu',
          telephone: phone,
          poste: row['Poste'] || row['Métier'] || '',
          code_secret: '0000' // PIN par défaut
        };
      }).filter(m => m.telephone.length >= 7);

      if (formattedMembers.length > 0) {
        await supabase.from('tontine_members').insert(formattedMembers);
        fetchMembersAndCotisations(tontine.id);
        alert(`${formattedMembers.length} membres importés avec succès !`);
      }
    };
    reader.readAsBinaryString(file);
  };

  const toggleAdmin = async (member: any) => {
    const newStatus = !member.is_admin;
    await supabase.from('tontine_members').update({ is_admin: newStatus }).eq('id', member.id);
    fetchMembersAndCotisations(tontine.id);
  };

  // 3. LE MOTEUR DE TIRAGE
  const handleTirage = () => {
    const eligibles = membres.filter(m => !m.a_gagne);
    if (eligibles.length === 0) return alert("Tout le monde a déjà gagné !");

    setIsSpinning(true);
    setRecentWinners([]);

    // Animation Roulette
    const spinInterval = setInterval(() => {
      const random = eligibles[Math.floor(Math.random() * eligibles.length)].prenom_nom;
      setSpinName(random);
    }, 100);

    setTimeout(async () => {
      clearInterval(spinInterval);
      
      // Sélection des gagnants
      const shuffled = [...eligibles].sort(() => 0.5 - Math.random());
      const winners = shuffled.slice(0, tontine.gagnants_par_mois || 2);
      
      const maxMois = Math.max(0, ...membres.map(m => m.mois_victoire || 0));
      const newMois = maxMois + 1;

      // Mise à jour BDD
      for (const w of winners) {
        await supabase.from('tontine_members').update({ a_gagne: true, mois_victoire: newMois }).eq('id', w.id);
      }

      setRecentWinners(winners);
      setIsSpinning(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
      fetchMembersAndCotisations(tontine.id);
      
      // Son
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(()=>{});

    }, 3000);
  };

  const scrollToSection = (ref: React.RefObject<HTMLElement | null>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // CALCULS
  const totalMembres = membres.length;
  const caisseMensuelle = membres.reduce((sum, m) => sum + (m.cotisation_individuelle || tontine?.montant_mensuel || 20000), 0);
  
  const currentMonth = Math.floor(membres.filter(m => m.a_gagne).length / (tontine?.gagnants_par_mois || 2)) + 1;
  const payeursCeMois = cotisations.filter(c => c.mois_numero === currentMonth && c.statut === 'Payé').length;
  const actuelCaisse = payeursCeMois * (tontine?.montant_mensuel || 20000);
  const progressPercentage = caisseMensuelle > 0 ? (actuelCaisse / caisseMensuelle) * 100 : 0;

  // RENDU ACCÈS RESTREINT
  if (!isLoading && !currentUser) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center p-6 text-white text-center">
        <AlertCircle size={64} className="text-red-500 mb-4" />
        <h1 className="text-3xl font-black mb-2">ACCÈS RESTREINT</h1>
        <p className="text-zinc-400 mb-8">Veuillez vous connecter depuis le Hub.</p>
        <button onClick={() => router.push('/hub')} className="bg-green-500 text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2">
          <Home size={20}/> RETOURNER AU HUB
        </button>
      </div>
    );
  }

  if (isLoading || !tontine) return <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-white">Chargement...</div>;

  const theme = tontine.theme_color || '#39FF14';

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans pb-28">
      <InteractiveParticles themeColor={theme} />

      {/* CONFETTIS */}
      {showConfetti && (
        <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
          {[...Array(100)].map((_, i) => (
            <div key={i} className="absolute top-[-10%] opacity-0"
              style={{
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 15 + 5}px`, height: `${Math.random() * 15 + 5}px`,
                backgroundColor: i % 2 === 0 ? theme : '#FFF',
                animation: `confetti-fall ${2 + Math.random() * 3}s linear forwards`,
                animationDelay: `${Math.random() * 1}s`,
              }}
            />
          ))}
          <style dangerouslySetInnerHTML={{__html: `@keyframes confetti-fall { 0% { transform: translateY(0) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: 0; } }`}} />
        </div>
      )}

      {/* HEADER */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-md overflow-hidden" style={{ color: theme }}>
                {tontine.logo_url ? <img src={tontine.logo_url} className="w-full h-full object-cover" /> : <ShieldCheck size={24}/>}
             </div>
             <div>
               <p className={`${spaceGrotesk.className} text-xl font-black uppercase tracking-tighter leading-none`}>{tontine.nom}</p>
               <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Espace Administrateur</p>
             </div>
          </div>
          
          <div className="flex items-center gap-3">
             <button onClick={handleCopyLink} className="flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 text-black px-4 py-2 rounded-xl text-xs font-black uppercase transition-colors">
               {copied ? <CheckCircle size={16} className="text-green-500"/> : <LinkIcon size={16}/>}
               {copied ? 'Lien Copié !' : 'Lien Membres'}
             </button>
             <button onClick={() => router.push('/hub')} className="bg-black text-white px-4 py-2 rounded-xl text-xs font-black uppercase flex items-center gap-2">
               <Home size={16}/> Hub
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* RADAR ANNIVERSAIRE */}
        {membres.some(m => {
            if(!m.date_naissance) return false;
            const month = new Date(m.date_naissance).getMonth();
            return month === new Date().getMonth();
        }) && (
            <div className="bg-purple-100 border border-purple-200 text-purple-800 p-4 rounded-2xl flex items-center gap-4 shadow-sm animate-pulse">
                <div className="bg-purple-200 p-3 rounded-full"><Cake size={24} className="text-purple-600"/></div>
                <div>
                    <h3 className="font-black uppercase text-sm">Radar Anniversaire Actif</h3>
                    <p className="text-xs font-medium">Certains membres fêtent leur anniversaire ce mois-ci !</p>
                </div>
            </div>
        )}

        {/* KPIS CLIQUABLES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div onClick={() => scrollToSection(sectionMembresRef)} className="bg-black text-white p-6 rounded-[2rem] shadow-xl cursor-pointer hover:scale-105 transition-transform">
            <p className="text-xs font-black uppercase text-zinc-400 mb-2 flex items-center gap-2"><Users size={14}/> Membres Actifs</p>
            <p className="text-4xl font-black" style={{ color: theme }}>{totalMembres}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
            <p className="text-xs font-black uppercase text-zinc-500 mb-2">Caisse Mensuelle</p>
            <p className="text-3xl font-black">{caisseMensuelle.toLocaleString()} F</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
            <p className="text-xs font-black uppercase text-zinc-500 mb-2">Gagnants / Mois</p>
            <p className="text-3xl font-black">{tontine.gagnants_par_mois}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
            <p className="text-xs font-black uppercase text-zinc-500 mb-2">Durée</p>
            <p className="text-3xl font-black">{tontine.duree_mois} Mois</p>
          </div>
        </div>

        {/* JAUGE PROGRESSION */}
        <section className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-end mb-4 relative z-10">
                <div>
                    <h2 className="text-lg font-black uppercase tracking-tighter">Progression (Mois {currentMonth})</h2>
                    <p className="text-sm text-zinc-500 font-bold mt-1">Cotisations collectées ce mois-ci</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-black">{actuelCaisse.toLocaleString()} <span className="text-lg text-zinc-400">/ {caisseMensuelle.toLocaleString()} F</span></p>
                </div>
            </div>
            <div className="w-full bg-zinc-100 rounded-full h-6 relative z-10 overflow-hidden shadow-inner">
                <div className="h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2" 
                    style={{ width: `${Math.max(progressPercentage, 5)}%`, backgroundColor: theme }}>
                    <span className="text-[10px] font-black text-black">{progressPercentage.toFixed(0)}%</span>
                </div>
            </div>
        </section>

        {/* TIRAGE AU SORT INTERACTIF */}
        <section ref={sectionTirageRef} className="bg-black rounded-[3rem] p-10 shadow-2xl relative overflow-hidden text-center border-t-[8px]" style={{ borderColor: theme }}>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] opacity-[0.1] blur-[80px] rounded-full" style={{ backgroundColor: theme }}></div>
            
            <div className="relative z-10">
                <h2 className={`${spaceGrotesk.className} text-4xl font-black text-white uppercase mb-2`}>Le Tirage</h2>
                <p className="text-zinc-400 font-medium mb-10">Mois {currentMonth} • Transparence absolue</p>

                {isSpinning ? (
                    <div className="py-10">
                        <div className="w-20 h-20 rounded-full border-4 border-t-transparent animate-spin mx-auto mb-6" style={{ borderColor: `${theme}40`, borderTopColor: theme }}></div>
                        <p className="text-4xl md:text-6xl font-black text-white uppercase tracking-widest animate-pulse">{spinName}</p>
                    </div>
                ) : recentWinners.length > 0 ? (
                    <div className="animate-in zoom-in duration-500">
                        <h3 className="text-2xl font-black text-white uppercase mb-6">👑 Nouveaux Gagnants !</h3>
                        <div className="flex flex-wrap justify-center gap-4">
                            {recentWinners.map(w => (
                                <div key={w.id} className="bg-zinc-900 border-2 px-8 py-6 rounded-3xl flex items-center gap-4" style={{ borderColor: theme }}>
                                    <Trophy size={32} style={{ color: theme }}/>
                                    <span className="text-2xl font-black text-white uppercase">{w.prenom_nom}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setRecentWinners([])} className="mt-8 text-zinc-400 hover:text-white text-sm font-bold underline">Faire un autre tirage</button>
                    </div>
                ) : (
                    <button onClick={handleTirage} className="px-12 py-6 rounded-[3rem] font-black text-lg uppercase tracking-widest hover:scale-105 transition-transform flex items-center gap-3 mx-auto shadow-xl" style={{ backgroundColor: theme, color: '#000' }}>
                        <Play fill="black" size={24}/> Lancer le tirage
                    </button>
                )}
            </div>
        </section>

        {/* GESTION MEMBRES & EXCEL */}
        <section ref={sectionMembresRef} className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
            <div className="flex flex-wrap justify-between items-end mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter">Annuaire des Reines</h2>
                    <p className="text-sm text-zinc-500 mt-1">Gérez vos {totalMembres} membres et leurs cotisations</p>
                </div>
                <div className="flex gap-3">
                    <label className="cursor-pointer bg-zinc-100 hover:bg-zinc-200 text-black px-4 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 transition-colors">
                        <Upload size={16}/> Import Excel
                        <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="hidden" />
                    </label>
                </div>
            </div>

            <div className="relative mb-6">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"/>
                <input 
                    type="text" 
                    placeholder="Chercher une reine..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 pl-12 rounded-2xl font-bold text-sm outline-none focus:border-black transition"
                />
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b-2 border-zinc-100">
                            <th className="p-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Membre</th>
                            <th className="p-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Poste</th>
                            <th className="p-4 text-xs font-black text-zinc-400 uppercase tracking-widest">Téléphone</th>
                            <th className="p-4 text-xs font-black text-zinc-400 uppercase tracking-widest text-center">Admin</th>
                            <th className="p-4 text-xs font-black text-zinc-400 uppercase tracking-widest text-center">Statut (Mois {currentMonth})</th>
                            <th className="p-4 text-xs font-black text-zinc-400 uppercase tracking-widest text-right">Relance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {membres.filter(m => m.prenom_nom.toLowerCase().includes(searchTerm.toLowerCase())).map(m => {
                            const isAnniversaire = m.date_naissance && new Date(m.date_naissance).getMonth() === new Date().getMonth();
                            // Logique fictive pour l'affichage du statut, remplace par ton vrai 'togglePayment' si besoin
                            const aPaye = cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
                            
                            return (
                                <tr key={m.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                                    <td className="p-4 flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-black text-xs shrink-0 relative">
                                            {m.prenom_nom.substring(0,2).toUpperCase()}
                                            {m.a_gagne && <Medal size={14} className="absolute -top-1 -right-1 text-yellow-400"/>}
                                        </div>
                                        <div>
                                            <p className="font-black text-sm uppercase flex items-center gap-2">
                                                {m.prenom_nom} 
                                                {isAnniversaire && <Cake size={14} className="text-purple-500"/>}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-3 py-1 rounded flex items-center gap-1 w-max">
                                            <Briefcase size={12}/> {m.poste || 'Membre'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm font-bold text-zinc-600">{m.telephone}</td>
                                    <td className="p-4 text-center">
                                        <button onClick={() => toggleAdmin(m)} className={`p-2 rounded-lg transition-colors ${m.is_admin ? 'bg-yellow-100 text-yellow-600' : 'bg-zinc-100 text-zinc-400 hover:text-black'}`}>
                                            <ShieldCheck size={18} />
                                        </button>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1 w-max mx-auto ${aPaye ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                                            {aPaye ? <CheckCircle size={12}/> : <AlertCircle size={12}/>}
                                            {aPaye ? 'À JOUR' : 'À PAYER'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <a href={`https://wa.me/221${m.telephone}?text=Coucou reine, c'est l'heure de la cotisation !`} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-50 text-green-600 hover:bg-green-500 hover:text-white transition-colors">
                                            <MessageCircle size={14}/>
                                        </a>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </section>

      </main>
    </div>
  );
}
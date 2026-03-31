"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Wallet, Trophy, Shuffle, ShieldCheck, Home, Loader2, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Copy, Link as LinkIcon, Upload, Briefcase, MessageCircle, Cake, RotateCcw, Settings, FileText } from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  const [memberForm, setMemberForm] = useState({ prenom_nom: '', telephone: '', code_secret: '0000', a_gagne: false, photo_url: '', poste: '', is_admin: false, has_paid: false });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ nom: '', theme_color: '#39FF14', logo_url: '', duree_mois: 10, montant_mensuel: 0, date_debut: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const sectionMembresRef = useRef<HTMLDivElement>(null);
  const sectionTirageRef = useRef<HTMLElement>(null);

  // --- ÉTATS TIRAGE ---
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinName, setSpinName] = useState("");
  const [spinAvatar, setSpinAvatar] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);

  // --- CALCULS DU MOIS EN COURS ---
  const totalGagnantsMois = tontine?.gagnants_par_mois || 1;
  const moisEcoules = Math.floor(membres.filter(m => m.a_gagne).length / totalGagnantsMois);
  const currentMonth = moisEcoules + 1;

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
    setMemberForm({ prenom_nom: '', telephone: '', code_secret: '0000', a_gagne: false, photo_url: '', poste: '', is_admin: false, has_paid: false });
    setIsModalOpen(true);
  };

  const openEditModal = (m: any) => {
    const hasPaid = cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
    setEditingMember(m);
    setMemberForm({ prenom_nom: m.prenom_nom || '', telephone: m.telephone || '', code_secret: m.code_secret || '0000', a_gagne: !!m.a_gagne, photo_url: m.photo_url || '', poste: m.poste || '', is_admin: !!m.is_admin, has_paid: hasPaid });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!tontine) throw new Error("Tontine non chargée.");
      const payload = { tontine_id: tontine.id, prenom_nom: memberForm.prenom_nom, telephone: memberForm.telephone, code_secret: memberForm.code_secret, a_gagne: memberForm.a_gagne, photo_url: memberForm.photo_url, poste: memberForm.poste, is_admin: memberForm.is_admin };

      if (memberForm.is_admin) {
        await supabase.from('tontine_members').update({ is_admin: false }).eq('tontine_id', tontine.id);
      }

      let updatedMembers = membres;
      if (memberForm.is_admin) {
         updatedMembers = updatedMembers.map(m => ({ ...m, is_admin: false }));
      }

      let memberId = editingMember?.id;
      if (editingMember) {
        const { error } = await supabase.from('tontine_members').update(payload).eq('id', editingMember.id);
        if (error) throw error;
        setMembres(updatedMembers.map(m => m.id === editingMember.id ? { ...m, ...payload } : m));
      } else {
        const { data, error } = await supabase.from('tontine_members').insert([payload]).select();
        if (error) throw error;
        if (data) {
           setMembres([...updatedMembers, data[0]]);
           memberId = data[0].id;
        }
      }

      // --- GESTION DU PAIEMENT ---
      if (memberId) {
         const currentlyPaid = cotisations.some(c => c.membre_id === memberId && c.mois_numero === currentMonth && c.statut === 'Payé');
         if (memberForm.has_paid && !currentlyPaid) {
            const payloadCotisation = { tontine_id: tontine.id, membre_id: memberId, mois_numero: currentMonth, montant: tontine.montant_mensuel || 0, statut: 'Payé' };
            const { data: newCot, error: errCot } = await supabase.from('cotisations').insert([payloadCotisation]).select();
            if (!errCot && newCot) setCotisations(prev => [...prev, newCot[0]]);
         } else if (!memberForm.has_paid && currentlyPaid) {
            const { error: errCot } = await supabase.from('cotisations').delete().match({ membre_id: memberId, mois_numero: currentMonth, statut: 'Payé' });
            if (!errCot) setCotisations(prev => prev.filter(c => !(c.membre_id === memberId && c.mois_numero === currentMonth && c.statut === 'Payé')));
         }
      }

      setIsModalOpen(false);
    } catch (err: any) {
      alert("Erreur de sauvegarde: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const openSettingsModal = () => {
    setSettingsForm({ 
      nom: tontine?.nom || '', 
      theme_color: tontine?.theme_color || '#39FF14',
      logo_url: tontine?.logo_url || '',
      duree_mois: tontine?.duree_mois || 10,
      montant_mensuel: tontine?.montant_mensuel || 0,
      date_debut: tontine?.date_debut ? new Date(tontine.date_debut).toISOString().split('T')[0] : ''
    });
    setIsSettingsModalOpen(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
       const { error } = await supabase.from('tontines').update(settingsForm).eq('id', tontine.id);
       if (error) throw error;
       setTontine({ ...tontine, ...settingsForm });
       setIsSettingsModalOpen(false);
    } catch(err: any) {
       alert("Erreur lors de la sauvegarde : " + err.message);
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

  const scrollToSection = (ref: React.RefObject<any>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const togglePaymentStatus = async (m: any, hasPaid: boolean) => {
    try {
      setIsSaving(true);
      if (hasPaid) {
        const { error } = await supabase.from('cotisations').delete().match({ membre_id: m.id, mois_numero: currentMonth, statut: 'Payé' });
        if (error) throw error;
        setCotisations(prev => prev.filter(c => !(c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé')));
      } else {
        const payload = { tontine_id: tontine.id, membre_id: m.id, mois_numero: currentMonth, montant: tontine?.montant_mensuel || 0, statut: 'Payé' };
        const { data, error } = await supabase.from('cotisations').insert([payload]).select();
        if (error) throw error;
        if (data) setCotisations(prev => [...prev, data[0]]);
      }
    } catch (err: any) {
      alert("Erreur lors de la modification du paiement: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        setIsSaving(true);
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);
        const newMembers = data.map((row: any) => {
          let phone = String(row.telephone || row.Telephone || row.TELEPHONE || '').replace(/\s+/g, '');
          if (phone.startsWith('+221')) phone = phone.slice(4);
          if (phone.startsWith('221')) phone = phone.slice(3);
          return {
            tontine_id: tontine.id,
            prenom_nom: row.prenom_nom || row.Prenom || row.Nom || 'Inconnu',
            telephone: phone,
            poste: row.poste || row.Poste || '',
            code_secret: '0000',
            a_gagne: false
          };
        }).filter(m => m.telephone.length >= 7);
        if (newMembers.length === 0) throw new Error("Aucun membre valide trouvé.");
        const { data: insertedData, error } = await supabase.from('tontine_members').insert(newMembers).select();
        if (error) throw error;
        if (insertedData) setMembres([...membres, ...insertedData]);
        alert(`${newMembers.length} membres importés avec succès !`);
      } catch (err: any) {
        alert("Erreur lors de l'import: " + err.message);
      } finally {
        setIsSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const toggleAdmin = async (m: any) => {
    try {
      const newStatus = !m.is_admin;
      if (newStatus) {
         await supabase.from('tontine_members').update({ is_admin: false }).eq('tontine_id', tontine.id);
         await supabase.from('tontine_members').update({ is_admin: true }).eq('id', m.id);
         setMembres(membres.map(member => member.id === m.id ? { ...member, is_admin: true } : { ...member, is_admin: false }));
      } else {
         await supabase.from('tontine_members').update({ is_admin: false }).eq('id', m.id);
         setMembres(membres.map(member => member.id === m.id ? { ...member, is_admin: false } : member));
      }
    } catch (err: any) {
      alert("Erreur de modification du rôle: " + err.message);
    }
  };

  const handleResetTontine = async () => {
    if (!confirm("⚠️ ATTENTION : Voulez-vous réinitialiser la tontine ? (Gagnants remis à zéro, membres conservés).")) return;
    try {
      setIsSaving(true);
      const { error } = await supabase.from('tontine_members').update({ a_gagne: false, mois_victoire: null }).eq('tontine_id', tontine.id);
      if (error) throw error;
      setMembres(membres.map(m => ({ ...m, a_gagne: false, mois_victoire: null })));
      alert("Tontine réinitialisée avec succès.");
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setIsSaving(false);
    }
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

  const handleGroupReminder = () => {
    if (!tontine || membres.length === 0) return;

    const totalGagnantsMois = tontine?.gagnants_par_mois || 1;
    const moisEcoules = Math.floor(membres.filter(m => m.a_gagne).length / totalGagnantsMois);
    const currentMonth = moisEcoules + 1;

    const lateMembers = membres.filter(m => 
        !cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé')
    );

    if (lateMembers.length === 0) {
        alert("Félicitations ! Tous les membres sont à jour pour ce mois.");
        return;
    }

    const memberNames = lateMembers.map(m => `- ${m.prenom_nom}`).join('\n');
    const message = `RAPPEL COTISATION - Sauf erreur de notre part, nous attendons toujours la cotisation de :\n\n${memberNames}\n\n🙏 Merci de régulariser au plus vite pour le bon déroulement du tirage de ce mois !`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Liste des membres - ${tontine?.nom || 'Tontine'}`, 14, 16);

    const tableColumn = ["Nom & Prénom", "Téléphone", "Poste", "Statut Tirage", "Paiement Mois Actuel"];
    const tableRows: any[] = [];

    filteredMembres.forEach(m => {
      const hasPaid = cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
      const isLate = !hasPaid && today.getDate() > dueDate;

      const memberData = [
        m.prenom_nom,
        m.telephone,
        m.poste || '-',
        m.a_gagne ? 'A gagné' : 'En attente',
        hasPaid ? 'Payé' : `À Payer ${isLate ? `(+${amende}F)` : ''}`
      ];
      tableRows.push(memberData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 24,
    });
    doc.save(`membres_${tontine?.nom?.replace(/\s+/g, '_') || 'tontine'}.pdf`);
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

  const caisseMensuelle = membres.length * (tontine?.montant_mensuel || 0);
  const cotisationsCeMois = cotisations.filter(c => c.mois_numero === currentMonth && c.statut === 'Payé' && membres.some(m => m.id === c.membre_id));
  const actuelCaisse = cotisationsCeMois.reduce((acc, c) => acc + (c.montant || tontine?.montant_mensuel || 0), 0);
  const progressPercentage = caisseMensuelle > 0 ? (actuelCaisse / caisseMensuelle) * 100 : 0;

  const currentRealMonth = new Date().getMonth() + 1;
  const birthdayMembers = membres.filter(m => m.date_naissance && parseInt(m.date_naissance.split('-')[1], 10) === currentRealMonth);
  const hasBirthdays = birthdayMembers.length > 0;

  const gagnantsCount = membres.filter(m => m.a_gagne).length;
  const enAttenteCount = membres.length - gagnantsCount;

  const filteredMembres = membres.filter(m => {
    const nameMatch = m.prenom_nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeFilter === 'tous') {
      return nameMatch;
    }
    if (activeFilter === 'gagnants') {
      return nameMatch && m.a_gagne;
    }
    if (activeFilter === 'attente') {
      return nameMatch && !m.a_gagne;
    }
    return false;
  });

  const dueDate = 5; // Date limite de paiement
  const amende = 500; // Montant de l'amende
  const today = new Date();

  const chartData = Array.from({ length: tontine?.duree_mois || 0 }, (_, i) => {
    const mois = i + 1;
    const caisse = cotisations
      .filter(c => c.mois_numero === mois && c.statut === 'Payé')
      .reduce((acc, c) => acc + (c.montant || 0), 0);
    return {
      name: `Mois ${mois}`,
      caisse: caisse,
    };
  });

  const yAxisFormatter = (value: number) => `${(value / 1000)}k`;



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
            <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}>
               {tontine?.logo_url ? <img src={tontine.logo_url} alt="Logo" className="w-full h-full object-cover" /> : <ShieldCheck size={24} className="text-black" />}
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
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-2 flex items-center gap-3`}>
                  {tontine?.nom || "Ma Tontine"}
                  <button onClick={openSettingsModal} className="p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors text-zinc-500">
                    <Settings size={18} />
                  </button>
               </h2>
               <p className="text-sm text-zinc-500 font-bold flex items-center gap-2">
                 <Wallet size={16}/> Montant mensuel : {(tontine?.montant_mensuel || 0).toLocaleString()} F CFA
               </p>
            </div>
         </div>

         <section ref={sectionTirageRef} className="bg-black rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center border-t-[8px]" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
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
                  progressPercentage < 100 ? (
                     <div className="flex flex-col items-center py-8 gap-6">
                        <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black text-white uppercase mb-4 leading-tight`}>Cotisations en cours</h2>
                        <p className="text-base font-medium text-zinc-400">Le tirage sera disponible une fois toutes les cotisations du mois réglées.</p>
                        <button disabled className="mt-4 px-10 py-5 rounded-[2.5rem] font-black text-base uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 opacity-50 cursor-not-allowed" style={{ backgroundColor: tontine?.theme_color || '#39FF14', color: '#000' }}>
                           <Shuffle size={24}/> Démarrer le tirage
                        </button>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center py-8 gap-6">
                        <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black text-white uppercase mb-4 leading-tight`}>Lancer la sélection</h2>
                        <button onClick={handleTirage} className="px-10 py-5 rounded-[2.5rem] font-black text-base uppercase tracking-widest transition-all shadow-xl hover:scale-105 flex items-center gap-3 animate-bounce mx-auto" style={{ backgroundColor: tontine?.theme_color || '#39FF14', color: '#000' }}>
                           <Shuffle size={24}/> Démarrer le tirage
                        </button>
                        <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-6">Zéro triche, 100% transparent.</p>
                     </div>
                  )
               )}
            </div>
         </section>

         {hasBirthdays && (
            <div className="bg-purple-100 border border-purple-200 text-purple-700 p-5 rounded-2xl flex items-center gap-4 shadow-sm animate-in slide-in-from-top-4">
               <div className="bg-purple-200 p-3 rounded-xl"><Cake size={24} className="text-purple-600 animate-bounce" /></div>
               <div>
                  <p className="font-black uppercase text-sm tracking-tighter">C'est le mois des anniversaires ! 🎂</p>
                  <p className="text-xs font-bold text-purple-600/80 mt-1">Joyeux anniversaire à : {birthdayMembers.map(m => m.prenom_nom).join(', ')}</p>
               </div>
            </div>
         )}

         <div className="grid md:grid-cols-3 gap-6" ref={sectionMembresRef}>
            <div onClick={() => setActiveFilter('tous')} className={`p-8 rounded-[2rem] shadow-sm relative overflow-hidden group cursor-pointer hover:scale-105 transition-all ${activeFilter === 'tous' ? 'bg-black text-white' : 'bg-white text-black border border-zinc-200'}`}>
               <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${activeFilter === 'tous' ? 'text-zinc-400' : 'text-zinc-500'}`}><Users size={14}/> Tous les membres</p>
               <p className={`${spaceGrotesk.className} text-4xl font-black`} style={{ color: activeFilter === 'tous' ? (tontine?.theme_color || '#39FF14') : '#000' }}>{membres.length}</p>
            </div>
            <div onClick={() => setActiveFilter('gagnants')} className={`p-8 rounded-[2rem] shadow-sm relative overflow-hidden group cursor-pointer hover:scale-105 transition-all ${activeFilter === 'gagnants' ? 'bg-black text-white' : 'bg-white text-black border border-zinc-200'}`}>
               <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${activeFilter === 'gagnants' ? 'text-zinc-400' : 'text-zinc-500'}`}><Trophy size={14}/> Gagnants</p>
               <p className={`${spaceGrotesk.className} text-4xl font-black`} style={{ color: activeFilter === 'gagnants' ? (tontine?.theme_color || '#39FF14') : '#000' }}>{gagnantsCount}</p>
            </div>
            <div onClick={() => setActiveFilter('attente')} className={`p-8 rounded-[2rem] shadow-sm relative overflow-hidden group cursor-pointer hover:scale-105 transition-all ${activeFilter === 'attente' ? 'bg-black text-white' : 'bg-white text-black border border-zinc-200'}`}>
               <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-2 ${activeFilter === 'attente' ? 'text-zinc-400' : 'text-zinc-500'}`}><Shuffle size={14}/> En attente</p>
               <p className={`${spaceGrotesk.className} text-4xl font-black`} style={{ color: activeFilter === 'attente' ? (tontine?.theme_color || '#39FF14') : '#000' }}>{enAttenteCount}</p>
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

         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
            <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg mb-6`}>Évolution de la caisse</h3>
            <div style={{ width: '100%', height: 300 }}>
               <ResponsiveContainer>
                  <BarChart
                     data={chartData}
                     margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                  >
                     <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                     <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                     <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={yAxisFormatter} />
                     <Tooltip
                        contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '1rem', color: '#fff' }}
                        labelStyle={{ fontWeight: 'bold', color: tontine?.theme_color || '#39FF14' }}
                        formatter={(value) => {
                          if (typeof value === 'number') {
                            return [`${value.toLocaleString()} F`, 'Caisse du mois']
                          }
                          return [value, 'Caisse du mois']
                        }}
                     />
                     <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                     <Bar dataKey="caisse" fill={tontine?.theme_color || '#39FF14'} name="Caisse du mois" radius={[8, 8, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <div>
                  <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl`}>Liste des Membres</h3>
                  <input 
                     type="text"
                     placeholder="Rechercher un membre..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="mt-2 w-full sm:w-64 p-2 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition"
                  />
               </div>
               <div className="flex flex-wrap gap-2">
                 <button onClick={handleGroupReminder} className="bg-green-50 text-green-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-green-100 transition-colors border border-green-200">
                    <MessageCircle size={16}/> Rappel Groupe
                 </button>
                 <button onClick={handleResetTontine} className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-red-100 transition-colors border border-red-200">
                    <RotateCcw size={16}/> Réinitialiser
                 </button>
                 <button onClick={handleExportPDF} className="bg-zinc-100 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-zinc-200 transition-colors border border-zinc-200">
                    <FileText size={16}/> Export PDF
                 </button>
                 <input type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                 <button onClick={() => fileInputRef.current?.click()} className="bg-zinc-100 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-zinc-200 transition-colors border border-zinc-200">
                    <Upload size={16}/> Import Excel
                 </button>
                 <button onClick={openAddModal} className="bg-black px-5 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:scale-105 transition-transform shadow-md" style={{ color: tontine?.theme_color || '#39FF14' }}>
                   <Plus size={16}/> Ajouter un membre
                 </button>
               </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
               {filteredMembres.map((m) => {
                  const hasPaid = cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
                  const memberCotisations = cotisations.filter(c => c.membre_id === m.id && c.statut === 'Payé');
                  const lastPayment = memberCotisations.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
                  const lastPaymentDate = lastPayment?.created_at ? new Date(lastPayment.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '-';
                  
                  const isLate = !hasPaid && today.getDate() > dueDate;
                  const totalAPayer = (tontine?.montant_mensuel || 0) + (isLate ? amende : 0);
                  const waMessage = isLate 
                      ? `Bonjour ${m.prenom_nom}, rappel pour la tontine "${tontine?.nom}". Votre cotisation de ${(tontine?.montant_mensuel || 0).toLocaleString()} F est en retard. Une amende de ${amende} F a été appliquée. Total à payer : ${totalAPayer.toLocaleString()} F. Merci de régulariser.`
                      : `Bonjour ${m.prenom_nom}, c'est le moment de la cotisation pour la tontine "${tontine?.nom}". Merci de régulariser via ce lien sécurisé !`;

                  return (
                     <div key={m.id} className="bg-white border border-zinc-200 rounded-3xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-black transition-all group">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                           <div className="flex items-center gap-3 flex-1 min-w-0">
                              <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.prenom_nom)}&background=000&color=${tontine?.theme_color?.replace('#','') || '39FF14'}`} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-white shadow-md shrink-0" />
                              <div className="flex-1 min-w-0">
                                 <p className="font-bold text-sm flex items-center gap-1.5 truncate">
                                    <span className="truncate">{m.prenom_nom}</span>
                                    {m.date_naissance && parseInt(m.date_naissance.split('-')[1], 10) === currentRealMonth && (
                                       <span title="Anniversaire ce mois-ci !"><Cake size={14} className="text-purple-500 animate-pulse" /></span>
                                    )}
                                 </p>
                                 <p className="text-xs font-mono text-zinc-500 truncate">{m.telephone}</p>
                              </div>
                           </div>
                           <button onClick={() => toggleAdmin(m)} title={m.is_admin ? "Retirer les droits de Gérant" : "Nommer Gérant"} className={`p-1.5 rounded-full transition-colors ${m.is_admin ? 'bg-yellow-100 text-yellow-600' : 'bg-zinc-100 text-zinc-400 group-hover:text-black'}`}>
                              <ShieldCheck size={14}/>
                           </button>
                        </div>

                        {/* Poste */}
                        {m.poste && (
                           <p className="text-xs font-bold text-zinc-600 bg-zinc-100 px-2 py-1 rounded-md flex items-center gap-1.5 w-fit"><Briefcase size={12}/> {m.poste}</p>
                        )}

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                           <div className="bg-zinc-50 p-2 rounded-lg">
                              <p className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Tirage</p>
                              {m.a_gagne ? (
                                 <span className="font-black text-yellow-700">A Gagné</span>
                              ) : (
                                 <span className="font-black text-zinc-600">En Attente</span>
                              )}
                           </div>
                           <div className="bg-zinc-50 p-2 rounded-lg">
                              <p className="font-bold text-zinc-400 uppercase tracking-wider text-[9px]">Dernier Paiement</p>
                              <p className="font-black text-zinc-600">{lastPaymentDate}</p>
                           </div>
                        </div>

                        {/* Payment Status */}
                        <div className="bg-zinc-50 p-3 rounded-lg">
                           <p className="font-bold text-zinc-400 uppercase tracking-wider text-[9px] mb-1">Paiement Mois {currentMonth}</p>
                           <div className="flex items-center gap-2">
                              {hasPaid ? (
                                 <button onClick={() => togglePaymentStatus(m, hasPaid)} disabled={isSaving} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 hover:bg-green-200 transition disabled:opacity-50" title="Marquer comme Non Payé"><CheckCircle size={12}/> Payé</button>
                              ) : (
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex flex-col items-start">
                                       <button onClick={() => togglePaymentStatus(m, hasPaid)} disabled={isSaving} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 hover:bg-red-100 transition disabled:opacity-50" title="Marquer comme Payé"><AlertCircle size={12}/> À Payer</button>
                                       {isLate && (
                                             <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">+ {amende} F (Retard)</span>
                                       )}
                                    </div>
                                    <a href={`https://wa.me/221${m.telephone}?text=${encodeURIComponent(waMessage)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition" title="Relancer sur WhatsApp">
                                       <MessageCircle size={14}/>
                                    </a>
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-2 border-t border-zinc-100 pt-3 mt-auto">
                           <button onClick={() => openEditModal(m)} className="p-2 bg-zinc-100 text-black rounded-lg hover:bg-zinc-200 transition" title="Modifier"><Edit size={14}/></button>
                           <button onClick={() => handleDeleteMember(m.id)} className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition" title="Supprimer"><Trash2 size={14}/></button>
                        </div>
                     </div>
                  )
               })}
               {filteredMembres.length === 0 && (
                  <div className="col-span-full py-8 text-center text-zinc-500 font-bold">
                     {searchTerm ? `Aucun membre ne correspond à "${searchTerm}"` : "Aucun membre dans cette catégorie."}
                  </div>
               )}
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
              <div className="col-span-full">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Poste / Rôle (Optionnel)</label>
                <div className="relative">
                   <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                   <input type="text" value={memberForm.poste} onChange={e => setMemberForm({...memberForm, poste: e.target.value})} className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="Ex: Trésorier, Comptable, Grande Sœur..." />
                </div>
              </div>
              
              <div className="col-span-full bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex items-center justify-between">
                 <div>
                    <p className="text-xs font-black uppercase text-black">Co-Gérant</p>
                    <p className="text-[10px] font-bold text-zinc-500">Donner les droits d'administration (Un seul possible)</p>
                 </div>
                 <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={memberForm.is_admin} onChange={e => setMemberForm({...memberForm, is_admin: e.target.checked})} className="sr-only peer" />
                    <div className="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                 </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 col-span-full">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Code PIN Secret</label>
                    <input type="text" maxLength={4} value={memberForm.code_secret} onChange={e => setMemberForm({...memberForm, code_secret: e.target.value.replace(/\D/g, '')})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black tracking-widest" placeholder="0000" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Statut Tirage</label>
                    <select value={memberForm.a_gagne ? 'oui' : 'non'} onChange={e => setMemberForm({...memberForm, a_gagne: e.target.value === 'oui'})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition appearance-none cursor-pointer text-black">
                      <option value="non">En Attente</option>
                      <option value="oui">A Déjà Gagné</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Paiement M{currentMonth}</label>
                    <select value={memberForm.has_paid ? 'oui' : 'non'} onChange={e => setMemberForm({...memberForm, has_paid: e.target.value === 'oui'})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition appearance-none cursor-pointer text-black">
                      <option value="non">À Payer (En attente)</option>
                      <option value="oui">A Payé</option>
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

      {/* --- MODALE PARAMÈTRES TONTINE --- */}
      {isSettingsModalOpen && (
        (() => {
          const startDate = settingsForm.date_debut ? new Date(settingsForm.date_debut + 'T00:00:00') : null;
          let endDate = 'N/A';
          if (startDate) {
            const end = new Date(startDate);
            end.setMonth(end.getMonth() + (settingsForm.duree_mois || 0));
            endDate = end.toLocaleDateString('fr-FR');
          }
          return (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsSettingsModalOpen(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 relative shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setIsSettingsModalOpen(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"><X size={20}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 text-black flex items-center gap-2`}>
              <Settings size={24} /> Paramètres
            </h2>
            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Nom de la Tontine</label>
                <input type="text" required value={settingsForm.nom} onChange={e => setSettingsForm({...settingsForm, nom: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Couleur du Thème</label>
                <div className="flex gap-3 items-center">
                   <input type="color" required value={settingsForm.theme_color} onChange={e => setSettingsForm({...settingsForm, theme_color: e.target.value})} className="w-14 h-14 rounded-2xl cursor-pointer border-0 p-0" />
                   <input type="text" required value={settingsForm.theme_color} onChange={e => setSettingsForm({...settingsForm, theme_color: e.target.value})} className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black uppercase" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">URL du Logo (Optionnel)</label>
                <input type="url" value={settingsForm.logo_url} onChange={e => setSettingsForm({...settingsForm, logo_url: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Cotisation par membre</label>
                  <input type="number" required value={settingsForm.montant_mensuel} onChange={e => setSettingsForm({...settingsForm, montant_mensuel: parseInt(e.target.value)})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Durée (mois)</label>
                  <input type="number" required value={settingsForm.duree_mois} onChange={e => setSettingsForm({...settingsForm, duree_mois: parseInt(e.target.value)})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Date de début</label>
                  <input type="date" value={settingsForm.date_debut} onChange={e => setSettingsForm({...settingsForm, date_debut: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Date de fin (calculée)</label>
                  <input type="text" disabled value={endDate} className="w-full p-4 bg-zinc-100 border border-zinc-200 rounded-2xl font-bold text-sm outline-none text-zinc-500" />
                </div>
              </div>
              <button type="submit" disabled={isSaving} className="w-full mt-6 bg-black py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ color: settingsForm.theme_color || '#39FF14' }}>
                {isSaving ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>}
                Enregistrer
              </button>
            </form>
          </div>
        </div>
          )
        })()
      )}
    </div>
  );
}
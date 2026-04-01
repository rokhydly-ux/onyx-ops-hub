"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  CheckCircle, AlertCircle, Wallet, Calendar, 
  History, Users, X, ChevronRight, ShieldCheck, 
  ArrowRight, Lock, Bell, LogOut, Shuffle, Trophy, Medal, MessageCircle,
  Camera, Save, Loader2, Phone, KeyRound, AlertTriangle, Eye, Upload, Download, Send, Archive, FileText
} from "lucide-react";
import InteractiveParticles from '@/components/InteractiveParticles';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const spaceGrotesk = { className: "font-sans" };

function SlugPageContent({ slug }: { slug: string }) {
  const router = useRouter();
  
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
  const [activeTab, setActiveTab] = useState<'historique' | 'attente' | 'gerance'>('historique');
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
  
  // --- ETAT POUR LA GERANCE ---
  const [togglingPaymentFor, setTogglingPaymentFor] = useState<string | null>(null);
  
  // --- ETATS UPLOAD & REÇUS ---
  const [uploadingImage, setUploadingImage] = useState(false);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      if (!slug) return;

      // 1. Fetch Tontine info directly by SLUG
      const { data: tData, error: tError } = await supabase
        .from('tontines')
        .select('*')
        .eq('slug', slug)
        .single();

      if (tError || !tData) {
        console.error("Tontine not found:", tError);
        setTontine(null); // Utilisé pour afficher l'erreur "Lien Invalide"
        setIsCheckingSession(false);
        return;
      }
      setTontine(tData);

      // 2. Check for a persisted session in localStorage using the found ID
      const savedMemberId = localStorage.getItem(`tontine_session_${tData.id}`);
      if (savedMemberId) {
        const { data: memberData, error: memberError } = await supabase
          .from('tontine_members')
          .select('*')
          .eq('id', savedMemberId)
          .single();
        
        if (memberData && !memberError) {
          await fetchDashboardData(memberData, tData);
        } else {
          localStorage.removeItem(`tontine_session_${tData.id}`);
          setCurrentUser(null);
        }
      }
      setIsCheckingSession(false);
    };

    checkSessionAndFetchData();
  }, [slug]);

  const fetchDashboardData = async (member: any, tontineData: any) => {
    setEditPhotoUrl(member.photo_url || '');
    setEditDateNaissance(member.date_naissance || '');

    const { data: allMembersData, error: membersError } = await supabase.from('tontine_members').select('*').eq('tontine_id', tontineData.id);
    const { data: allCotisationsData } = await supabase.from('cotisations').select('*');
    
    if (membersError) {
      console.error("Erreur de chargement des membres:", membersError);
      setMembers([]);
    } else {
      const freshCurrentUser = allMembersData?.find(m => m.id === member.id);
      setCurrentUser(freshCurrentUser || member);
      setMembers(allMembersData || []);
    }
    setCotisations(allCotisationsData || []);
  };

  const uploadFileToSupabase = async (file: File, folder: string) => {
    if (file.size > 1 * 1024 * 1024) throw new Error("Le fichier dépasse 1 Mo.");
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from('tontines').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('tontines').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      if (!tontine?.id) throw new Error("Lien de tontine invalide.");

      let cleanPhoneUser = phone.replace(/[^0-9]/g, '');
      if (cleanPhoneUser.startsWith('221')) cleanPhoneUser = cleanPhoneUser.slice(3);
      if (cleanPhoneUser.startsWith('00221')) cleanPhoneUser = cleanPhoneUser.slice(5);
      
      const cleanPinUser = pin.trim();
      
      if (!cleanPhoneUser || !cleanPinUser) throw new Error("Veuillez remplir tous les champs (Numéro et Code PIN).");
      
      const { data: membersList, error: fetchErr } = await supabase
        .from('tontine_members') 
        .select('*')
        .eq('tontine_id', tontine.id);
      
      if (fetchErr) throw fetchErr;
      if (!membersList || membersList.length === 0) throw new Error("Aucun membre trouvé dans cette tontine.");

      let debugDbPhone = "Aucun";
      let debugDbPin = "Aucun";

      const matchedMember = membersList.find(m => {
        let rawPhone = String(m.telephone || '').split('.')[0]; 
        let dbPhone = rawPhone.replace(/[^0-9]/g, '');
        if (dbPhone.startsWith('221')) dbPhone = dbPhone.slice(3);
        if (dbPhone.startsWith('00221')) dbPhone = dbPhone.slice(5);
        
        let rawPin = String(m.code_secret || '').trim();
        let dbPin = (rawPin === '' || rawPin.toLowerCase() === 'null' || rawPin.toLowerCase() === 'undefined') ? '0000' : rawPin;
        
        if (dbPhone === cleanPhoneUser || dbPhone.includes(cleanPhoneUser)) {
           debugDbPhone = dbPhone;
           debugDbPin = rawPin === '' || rawPin.toLowerCase() === 'null' ? 'VIDE (Auto-remplacé par 0000)' : dbPin;
        }
        return dbPhone === cleanPhoneUser && dbPin === cleanPinUser;
      });
      
      if (!matchedMember) {
        if (debugDbPhone !== "Aucun") {
            throw new Error(`RAYON X 🔍 -> Numéro BDD: "${debugDbPhone}", PIN BDD: "${debugDbPin}". Tu as tapé PIN: "${cleanPinUser}"`);
        } else {
            throw new Error("Numéro de téléphone ou code PIN incorrect.");
        }
      }
      
      localStorage.setItem(`tontine_session_${tontine.id}`, matchedMember.id);
      await fetchDashboardData(matchedMember, tontine);
      
    } catch (err: any) {
      console.error("Erreur Connexion:", err.message);
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (tontine?.id) {
      localStorage.removeItem(`tontine_session_${tontine.id}`);
    }
    setCurrentUser(null);
    setPhone("");
    setPin("");
    setLoginError(null);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
        const payload: any = {};
        if (editPhotoUrl !== (currentUser.photo_url || '')) payload.photo_url = editPhotoUrl;
        if (editDateNaissance !== (currentUser.date_naissance || '')) {
            payload.date_naissance = editDateNaissance;
            payload.date_naissance_modifiee = true;
        }
        if (editPin.trim().length > 0) {
            if (editPin.trim().length < 4) throw new Error("Le code PIN doit contenir exactement 4 chiffres.");
            payload.code_secret = editPin.trim();
        }
        if (Object.keys(payload).length > 0) {
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

  const handleTogglePaiement = async (membreId: string, moisEnCours: number) => {
    if (!tontine) return;
    try {
      const { data: existingCotisation, error: searchErr } = await supabase.from('cotisations').select('id').eq('membre_id', membreId).eq('mois_numero', moisEnCours).eq('statut', 'Payé').single();
      if (searchErr && searchErr.code !== 'PGRST116') throw searchErr;

      if (existingCotisation) {
        if (!window.confirm("Êtes-vous sûr de vouloir annuler ce paiement ? Cette action est irréversible.")) return;
        setTogglingPaymentFor(membreId);
        const { error: deleteErr } = await supabase.from('cotisations').delete().eq('id', existingCotisation.id);
        if (deleteErr) throw deleteErr;
        const { data: freshCots } = await supabase.from('cotisations').select('*').eq('tontine_id', tontine.id);
        setCotisations(freshCots || []);
        setTogglingPaymentFor(null);
      } else {
        setPaymentModal({ membreId, moisEnCours });
        setReceiptFile(null);
      }
    } catch (error: any) {
        alert("Impossible d'enregistrer le paiement : " + error.message);
    }
  };

  const confirmPayment = async () => {
     if (!paymentModal || !tontine) return;
     setTogglingPaymentFor(paymentModal.membreId);
     try {
         let recu_url = null;
         if (receiptFile) {
             recu_url = await uploadFileToSupabase(receiptFile, 'recus');
         }
         const { error: insertErr } = await supabase.from('cotisations').insert([{
             tontine_id: tontine.id,
             membre_id: paymentModal.membreId,
             mois_numero: paymentModal.moisEnCours,
             montant: tontine.montant_mensuel || 0,
             statut: 'Payé',
             recu_url
         }]);
         if (insertErr) throw insertErr;
         
         const { data: freshCots } = await supabase.from('cotisations').select('*').eq('tontine_id', tontine.id);
         setCotisations(freshCots || []);
         setPaymentModal(null);
     } catch(e:any) { alert("Erreur d'enregistrement : " + e.message); } finally { setTogglingPaymentFor(null); }
  };

  const createReceiptPDF = async (member: any, cotisation: any) => {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
    
    // --- AJOUT DU FILIGRANE ---
    if (tontine?.logo_url) {
       try {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.src = tontine.logo_url;
          await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; });
          
          const GState = (doc as any).GState;
          if (GState) doc.setGState(new GState({ opacity: 0.1 }));
          doc.addImage(img, 'PNG', 65, 34, 80, 80);
          if (GState) doc.setGState(new GState({ opacity: 1.0 }));
       } catch (e) {
          console.warn("Impossible de charger le filigrane", e);
       }
    }

    doc.setFontSize(22);
    doc.setTextColor(0, 0, 0);
    doc.text("REÇU DE PAIEMENT", 20, 30);
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`Tontine : ${tontine?.nom || 'Onyx Tontine'}`, 20, 45);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Date : ${cotisation?.created_at ? new Date(cotisation.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR')}`, 150, 30);
    doc.text(`N° Reçu : REC-${cotisation?.id?.substring(0,6) || Math.floor(Math.random()*10000)}`, 150, 40);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 55, 190, 55);
    
    doc.setFontSize(14);
    doc.text("Reçu de :", 20, 70);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(member.prenom_nom, 50, 70);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Montant :", 20, 90);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(`${(cotisation?.montant || tontine?.montant_mensuel || 0).toLocaleString()} F CFA`, 50, 90);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("Pour le mois de :", 20, 110);
    doc.setFont("helvetica", "bold");
    doc.text(`Mois ${cotisation?.mois_numero || currentMonth}`, 65, 110);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 125, 190, 125);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Généré de manière sécurisée par Onyx Tontine", 20, 140);
    return doc;
  };

  const handleDownloadReceipt = async (member: any) => {
    const cot = cotisations.find(c => c.membre_id === member.id && c.mois_numero === currentMonth && c.statut === 'Payé');
    if (!cot) return;
    const doc = await createReceiptPDF(member, cot);
    doc.save(`Recu_${member.prenom_nom.replace(/\s+/g, '_')}_Mois_${currentMonth}.pdf`);
  };

  const handleDownloadHistory = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Historique des Transactions`, 14, 22);
    doc.setFontSize(14);
    doc.text(`Membre : ${currentUser.prenom_nom}`, 14, 30);
    doc.setFontSize(11);
    doc.text(`Tontine : ${tontine.nom}`, 14, 38);

    const tableColumn = ["Mois", "Montant", "Statut", "Date de paiement"];
    const tableRows: any[] = [];

    for (let i = 1; i <= currentMonth; i++) {
      const cot = cotisations.find(c => c.membre_id === currentUser.id && c.mois_numero === i && c.statut === 'Payé');
      tableRows.push([
        `Mois ${i}`,
        `${(currentUser.cotisation_individuelle || tontine.montant_mensuel || 0).toLocaleString()} F CFA`,
        cot ? "Payé" : "À Payer",
        cot && cot.created_at ? new Date(cot.created_at).toLocaleDateString('fr-FR') : "-"
      ]);
    }

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 45,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] }
    });

    doc.save(`Historique_${currentUser.prenom_nom.replace(/\s+/g, '_')}.pdf`);
  };

  const handleShareReceiptWhatsApp = async (member: any, cot: any) => {
     if (!cot) return;
     try {
        const doc = await createReceiptPDF(member, cot);
        const fileName = `Recu_${member.prenom_nom.replace(/\s+/g, '_')}_Mois_${currentMonth}.pdf`;
        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        const message = `Bonjour ${member.prenom_nom}, voici votre reçu de paiement pour la tontine "${tontine?.nom}" (Mois ${currentMonth}).`;

        if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Reçu de paiement',
                text: message
            });
        } else {
            doc.save(fileName);
            window.open(`https://wa.me/221${member.telephone}?text=${encodeURIComponent(message)}`, '_blank');
        }
     } catch (e) {
        console.log("Erreur lors du partage :", e);
     }
  };

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

  if (isCheckingSession) {
    return <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-6"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
  }

  if (!tontine) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6 border border-red-500/30 shadow-lg"><AlertTriangle size={40}/></div>
        <h1 className={`${spaceGrotesk.className} text-2xl font-black uppercase text-red-500 tracking-widest mb-2`}>Lien Invalide</h1>
        <p className="text-zinc-400 mb-8 max-w-sm">Cette tontine n'existe pas ou le lien est expiré.</p>
        <button onClick={() => window.location.href = '/'} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition shadow-[0_0_15px_rgba(57,255,20,0.3)]">Retour à l'accueil</button>
      </div>
    );
  }

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

  const waitingList = members.filter(m => !m.a_gagne);
  const maxMoisVictoire = Math.max(0, ...members.map(m => m.mois_victoire || 0));
  const recentWinners = members.filter(m => m.a_gagne && m.mois_victoire === maxMoisVictoire);
  const montantParGagnant = tontine?.gagnants_par_mois ? caisseMensuelle / tontine.gagnants_par_mois : caisseMensuelle / 2;

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans pb-28">
      <InteractiveParticles themeColor={tontine?.theme_color || '#009FDF'} />
      
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
                    <div className="w-full mb-4 animate-in fade-in slide-in-from-top-2 flex gap-2">
                        <input type="url" placeholder="URL photo..." value={editPhotoUrl} onChange={e => setEditPhotoUrl(e.target.value)} className="flex-1 text-xs font-bold p-3 rounded-xl border border-zinc-200 focus:border-black outline-none bg-zinc-50 transition-colors" />
                        <label className="bg-zinc-100 p-3 rounded-xl cursor-pointer hover:bg-zinc-200 transition flex items-center justify-center">
                           {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                           <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                 setUploadingImage(true);
                                 const url = await uploadFileToSupabase(file, 'avatars');
                                 setEditPhotoUrl(url);
                              } catch (err: any) { alert(err.message); } finally { setUploadingImage(false); }
                           }} />
                        </label>
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
                        <div className="flex flex-col items-end gap-2">
                           <span className="bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                              <CheckCircle size={12}/> À JOUR
                           </span>
                           <button onClick={() => handleDownloadReceipt(currentUser)} className="text-[10px] font-bold text-zinc-500 hover:text-black flex items-center gap-1 transition-colors">
                              <Download size={12}/> Télécharger mon reçu
                           </button>
                           <button onClick={() => handleShareReceiptWhatsApp(currentUser, cotisationsCeMois.find(c => c.membre_id === currentUser.id))} className="text-[10px] font-bold text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors mt-1">
                              <Send size={12}/> Partager sur WhatsApp
                           </button>
                        </div>
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

            <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm mt-6 animate-in slide-in-from-bottom-4">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-black uppercase tracking-tighter">Historique</h2>
               </div>
               <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 mb-4 custom-scrollbar">
                  {Array.from({ length: currentMonth }, (_, i) => {
                     const mois = currentMonth - i; // Ordre décroissant
                     const cot = cotisations.find(c => c.membre_id === currentUser.id && c.mois_numero === mois && c.statut === 'Payé');
                     return (
                        <div key={mois} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                           <div>
                              <p className="font-bold text-sm">Mois {mois}</p>
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{cot && cot.created_at ? new Date(cot.created_at).toLocaleDateString('fr-FR') : 'En attente'}</p>
                           </div>
                           {cot ? (
                              <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle size={12}/> Payé</span>
                           ) : (
                              <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1"><AlertCircle size={12}/> À Payer</span>
                           )}
                        </div>
                     )
                  })}
               </div>
               <button onClick={handleDownloadHistory} className="w-full py-3 rounded-xl font-black uppercase text-xs border-2 border-black text-black hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2">
                  <FileText size={16}/> Télécharger PDF détaillé
               </button>
            </div>
          </div>
        
          <div className="md:col-span-8 space-y-6">
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

            <section>
               <div className="flex gap-2 p-2 bg-zinc-100 rounded-[1.5rem] mb-6 max-w-lg mx-auto">
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
                  {currentUser.is_admin && (
                    <button onClick={() => setActiveTab('gerance')} className={`flex-1 py-4 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest transition-all ${activeTab === 'gerance' ? 'bg-white text-black shadow-sm' : 'text-zinc-500 hover:text-black'}`}>
                      Gérance 👑
                    </button>
                  )}
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
               ) : activeTab === 'gerance' ? (
                  (() => {
                    const paidCount = members.filter(m => cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé')).length;
                    const toPayCount = members.length - paidCount;
                    return (
                    <div className="bg-white border border-zinc-200 p-6 md:p-8 rounded-[2rem] shadow-sm animate-in fade-in slide-in-from-bottom-4">
                      <div className="flex items-center gap-3 mb-6">
                          <div className="p-3 bg-black rounded-2xl mt-1 shadow-md" style={{ color: tontine.theme_color }}><Wallet size={24}/></div>
                          <div>
                              <p className="text-base font-black text-black">Pointage des Cotisations (Mois {currentMonth})</p>
                              <p className="text-sm text-zinc-600 font-medium mt-1 leading-relaxed">Cochez les membres qui ont payé leur cotisation pour ce mois.</p>
                          </div>
                      </div>
                      <div className="flex gap-4 mb-6 bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                          <div className="flex-1 text-center">
                              <p className="text-2xl font-black text-green-600">{paidCount}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">À Jour</p>
                          </div>
                          <div className="w-px bg-zinc-200"></div>
                          <div className="flex-1 text-center">
                              <p className="text-2xl font-black text-red-600">{toPayCount}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">À Payer</p>
                          </div>
                      </div>
                      <div className="space-y-3">
                          {members.map((m: any) => {
                              const currentCotisation = cotisations.find(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
                              const hasPaid = !!currentCotisation;
                              const isToggling = togglingPaymentFor === m.id;
                              const relanceMessage = `Bonjour ${m.prenom_nom}, petit rappel pour la cotisation de la tontine "${tontine?.nom}" de ce mois. Merci de régulariser au plus vite !`;

                              return (
                                  <div key={m.id} className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${hasPaid ? 'bg-green-50 border-green-200' : 'bg-zinc-50 border-zinc-100'}`}>
                                      <div className="flex items-center gap-4">
                                          <div className={`w-10 h-10 rounded-full overflow-hidden shrink-0 ${hasPaid ? 'grayscale-0' : 'grayscale'}`}>
                                              <img src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.prenom_nom)}&background=random`} alt={m.prenom_nom} className="w-full h-full object-cover" />
                                          </div>
                                          <div>
                                              <p className="font-black text-sm uppercase text-black">{m.prenom_nom}</p>
                                              <p className="text-xs font-mono text-zinc-500">{m.telephone}</p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-3 self-end sm:self-center">
                                          {currentCotisation?.recu_url && (
                                             <a href={currentCotisation.recu_url} target="_blank" rel="noopener noreferrer" className="p-2 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition" title="Voir le reçu">
                                                <Eye size={16} />
                                             </a>
                                          )}
                                          {hasPaid && (
                                             <>
                                               <button onClick={() => handleDownloadReceipt(m)} className="p-2 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-blue-100 hover:text-blue-600 transition" title="Télécharger le reçu PDF">
                                                  <Download size={16} />
                                               </button>
                                               <button onClick={() => handleShareReceiptWhatsApp(m, currentCotisation)} className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition" title="Partager sur WhatsApp">
                                                  <Send size={16} />
                                               </button>
                                             </>
                                          )}
                                          {!hasPaid && (
                                              <a href={`https://wa.me/221${m.telephone}?text=${encodeURIComponent(relanceMessage)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition" title="Relancer sur WhatsApp">
                                                  <MessageCircle size={16} />
                                              </a>
                                          )}
                                          <button 
                                              onClick={() => handleTogglePaiement(m.id, currentMonth)} 
                                              disabled={isToggling}
                                              className={`w-28 h-11 flex items-center justify-center rounded-xl text-xs font-black uppercase transition-all ${
                                                  hasPaid ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                                              } disabled:opacity-50`}
                                          >
                                              {isToggling ? <Loader2 size={16} className="animate-spin" /> : hasPaid ? <><CheckCircle size={14} className="mr-1.5"/> Payé</> : 'Pointer'}
                                          </button>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                    </div>
                  )})()
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

      {/* --- MODALE VALIDATION PAIEMENT --- */}
      {paymentModal && (
        <div id="payment-modal-overlay" onClick={(e: any) => e.target.id === 'payment-modal-overlay' && setPaymentModal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setPaymentModal(null)} className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"><X size={20}/></button>
            <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase mb-4 text-black`}>Valider le paiement</h2>
            
            <div className="mb-6">
               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-2 block">Joindre un reçu (Optionnel - Max 1Mo)</label>
               <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold" />
               {receiptFile && <p className="text-[10px] text-green-600 font-bold mt-2 ml-2 flex items-center gap-1"><CheckCircle size={12}/> Fichier sélectionné : {receiptFile.name}</p>}
            </div>

            <button onClick={confirmPayment} disabled={togglingPaymentFor !== null} className="w-full bg-black py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ color: tontine?.theme_color || '#39FF14' }}>
               {togglingPaymentFor !== null ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>}
               {togglingPaymentFor !== null ? "Validation..." : "Confirmer le paiement"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Page({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
    const [slug, setSlug] = useState<string | null>(null);
    
    useEffect(() => {
        // Permet de gérer la compatibilité entre Next.js 14 (params normaux) et Next.js 15 (params asynchrones)
        Promise.resolve(params).then((resolvedParams) => {
            setSlug(resolvedParams.slug);
        });
    }, [params]);

    if (!slug) {
        return <div className="min-h-screen bg-zinc-900 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" /></div>;
    }

    return (
        <Suspense fallback={<div className="min-h-screen bg-zinc-900 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-white" /></div>}>
            <SlugPageContent slug={slug} />
        </Suspense>
    );
}

"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  CheckCircle, AlertCircle, Wallet, Calendar, 
  History, Users, X, ChevronRight, ShieldCheck, 
  ArrowRight, Lock, Bell, LogOut, Shuffle, Trophy, Medal, MessageCircle,
  Camera, Save, Loader2, Phone, KeyRound, AlertTriangle, Eye, Upload, Download, Send, Archive, FileText, Wand2, PartyPopper, Clock
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

  // --- NOUVEAU : ETAT TOUR DE ROLE ---
  const [currentDrawConfig, setCurrentDrawConfig] = useState<any>(null);
  const [countdownText, setCountdownText] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isSignalingPayment, setIsSignalingPayment] = useState(false);

  useEffect(() => {
    const target = currentDrawConfig?.date_tirage_prevue 
        ? new Date(currentDrawConfig.date_tirage_prevue)
        : new Date();
    
    if (!currentDrawConfig?.date_tirage_prevue) {
        const limitDay = tontine?.date_limite_paiement || 5;
        if (target.getDate() >= limitDay) {
            target.setMonth(target.getMonth() + 1);
        }
        target.setDate(limitDay);
    }

    target.setHours(23, 59, 59); // Fin de journée
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const distance = target.getTime() - now;
      if (distance < 0) {
        setCountdownText("Tirage imminent !");
        setIsUrgent(true);
        return;
      }
      setIsUrgent(distance < 24 * 60 * 60 * 1000);
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      setCountdownText(`${days}j ${hours}h ${minutes}m`);
    };
    
    updateCountdown();
    // Mise à jour chaque minute pour éviter les re-rendus excessifs (les secondes ne sont pas affichées)
    const interval = setInterval(updateCountdown, 1000 * 60);
    return () => clearInterval(interval);
  }, [currentDrawConfig, tontine]);

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

    const { data: drawData, error: drawErr } = await supabase.from('configuration_tirage').select('*').eq('tontine_id', tontineData.id).single();
    if (!drawErr) setCurrentDrawConfig(drawData);
    else setCurrentDrawConfig(null);

    
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

  const handleSignalerPaiement = async () => {
    setIsSignalingPayment(true);
    try {
        const { data: existing } = await supabase.from('cotisations').select('id').eq('tontine_id', tontine.id).eq('membre_id', currentUser.id).eq('mois_numero', currentMonth).single();
        
        let res;
        if (existing) {
            res = await supabase.from('cotisations').update({
                a_signale_paiement: true,
                date_signalement: new Date().toISOString()
            }).eq('id', existing.id).select();
        } else {
            res = await supabase.from('cotisations').insert([{
                tontine_id: tontine.id,
                membre_id: currentUser.id,
                mois_numero: currentMonth,
                montant: currentUser.cotisation_individuelle || tontine?.montant_mensuel || 0,
                statut: 'Non Payé',
                a_signale_paiement: true,
                date_signalement: new Date().toISOString()
            }]).select();
        }

        if (res.error) throw res.error;
        if (res.data && res.data.length > 0) {
            setCotisations(prev => {
                const filtered = prev.filter(c => c.id !== res.data[0].id);
                return [...filtered, res.data[0]];
            });
        }
    } catch (err: any) {
        alert("Erreur lors du signalement : " + err.message);
    } finally {
        setIsSignalingPayment(false);
    }
  };

  const executeMemberDraw = async () => {
    if (!currentDrawConfig || currentDrawConfig.membre_id !== currentUser.id) {
        alert("Vous n'êtes pas autorisé à lancer ce tirage.");
        return;
    }

    const eligibles = members.filter(m => {
      if (m.a_gagne) return false;
      if (m.mois_exclus) {
        const excludedMonths = m.mois_exclus.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
        if (excludedMonths.includes(currentMonth)) return false;
      }
      return true;
    });

    if (eligibles.length === 0) return alert("Aucun membre éligible.");

    setIsSpinning(true);
    const spinInterval = setInterval(() => {
      const random = eligibles[Math.floor(Math.random() * eligibles.length)].prenom_nom;
      setSpinName(random);
    }, 100);

    setTimeout(async () => {
      clearInterval(spinInterval);
      
      const nbGagnants = tontine?.gagnants_par_mois || 1;
      const shuffled = [...eligibles].sort(() => 0.5 - Math.random());
      const selectedWinners = shuffled.slice(0, nbGagnants);
      const winnerIds = selectedWinners.map(w => w.id);
      
      try {
        const { error } = await supabase.from('tontine_members').update({ a_gagne: true, mois_victoire: currentMonth }).in('id', winnerIds);
        if (error) throw error;
        
        setMembers(members.map(m => winnerIds.includes(m.id) ? { ...m, a_gagne: true, mois_victoire: currentMonth } : m));
        setSpinName(selectedWinners.map(w => w.prenom_nom).join(" & "));
        setRevealed(true);
        setShowConfetti(true);
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
        audio.volume = 0.5;
        audio.play().catch(()=>{});

        const remainingEligibles = members.filter(m => !winnerIds.includes(m.id) && !m.a_gagne);
        if (remainingEligibles.length > 0) {
            const nextMember = remainingEligibles[0];
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextDate.setDate(tontine.date_limite_paiement || 5);
            
            const payload = { tontine_id: tontine.id, membre_id: nextMember.id, date_tirage_prevue: nextDate.toISOString().split('T')[0] };
            if (currentDrawConfig?.id) await supabase.from('configuration_tirage').update(payload).eq('id', currentDrawConfig.id);
            else await supabase.from('configuration_tirage').insert([payload]);
            
            setTimeout(() => {
                if (confirm(`Le tirage est terminé ! ${nextMember.prenom_nom} a été désigné(e) pour le mois suivant. Voulez-vous le notifier sur WhatsApp ?`)) {
                    const message = `Bonjour ${nextMember.prenom_nom}, vous avez été automatiquement désigné(e) pour lancer le prochain tirage de la tontine "${tontine.nom}" le mois prochain. Félicitations ! 🎉`;
                    window.open(`https://wa.me/221${nextMember.telephone}?text=${encodeURIComponent(message)}`, '_blank');
                }
            }, 500);
        }

        await fetchDashboardData(currentUser, tontine); // Re-fetch all data
      } catch (err: any) {
        alert("Erreur lors du tirage : " + err.message);
      } finally {
        setIsSpinning(false);
      }
    }, 3000);
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
         const { data: existing } = await supabase.from('cotisations').select('id').eq('tontine_id', tontine.id).eq('membre_id', paymentModal.membreId).eq('mois_numero', paymentModal.moisEnCours).single();
         
         let insertErr;
         if (existing) {
             const { error } = await supabase.from('cotisations').update({ statut: 'Payé', recu_url }).eq('id', existing.id);
             insertErr = error;
         } else {
             const { error } = await supabase.from('cotisations').insert([{
                 tontine_id: tontine.id,
                 membre_id: paymentModal.membreId,
                 mois_numero: paymentModal.moisEnCours,
                 montant: tontine.montant_mensuel || 0,
                 statut: 'Payé',
                 recu_url
             }]);
             insertErr = error;
         }
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

  const handleDownloadSpecificReceipt = async (member: any, cot: any) => {
    if (!cot) return;
    const doc = await createReceiptPDF(member, cot);
    doc.save(`Recu_${member.prenom_nom.replace(/\s+/g, '_')}_Mois_${cot.mois_numero}.pdf`);
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
  const isUserPending = cotisations.some(c => c.membre_id === currentUser?.id && c.mois_numero === currentMonth && c.a_signale_paiement === true && c.statut !== 'Payé');

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
      
      {/* --- ANIMATION DE BILLETS (GAGNANT) --- */}
      {showConfetti && (
        <div className="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => {
            const isLeft = i % 2 === 0;
            return (
              <div
                key={i}
                className="absolute top-[-10%] opacity-0 text-3xl md:text-5xl drop-shadow-lg"
                style={{
                  left: `${Math.random() * 100}%`,
                  animation: `bill-fall-${isLeft ? 'left' : 'right'} ${2 + Math.random() * 2}s ease-in forwards`,
                  animationDelay: `${Math.random() * 1.5}s`,
                }}
              >
                {i % 3 === 0 ? '💸' : '💵'}
              </div>
            );
          })}
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes bill-fall-left {
              0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
              25% { transform: translateY(25vh) rotate(90deg) translateX(-20px); opacity: 1; }
              50% { transform: translateY(50vh) rotate(180deg) translateX(20px); opacity: 1; }
              75% { transform: translateY(75vh) rotate(270deg) translateX(-20px); opacity: 1; }
              100% { transform: translateY(110vh) rotate(360deg) translateX(0); opacity: 0; }
            }
            @keyframes bill-fall-right {
              0% { transform: translateY(0) rotate(0deg) translateX(0); opacity: 1; }
              25% { transform: translateY(25vh) rotate(-90deg) translateX(20px); opacity: 1; }
              50% { transform: translateY(50vh) rotate(-180deg) translateX(-20px); opacity: 1; }
              75% { transform: translateY(75vh) rotate(-270deg) translateX(20px); opacity: 1; }
              100% { transform: translateY(110vh) rotate(-360deg) translateX(0); opacity: 0; }
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

            <section className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm mt-6">
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
                     ) : isUserPending ? (
                        <div className="flex flex-col items-end gap-1.5 text-right">
                           <span className="bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1 animate-pulse">
                              ⏳ PAIEMENT SIGNALÉ
                           </span>
                           <p className="text-[9px] font-bold text-blue-600 max-w-[150px] leading-tight">Paiement signalé, en attente de validation par l'admin.</p>
                        </div>
                     ) : (
                        <div className="flex flex-col items-end gap-1.5 text-right">
                           <span className="bg-red-50 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm flex items-center gap-1">
                              <AlertCircle size={12}/> À PAYER
                           </span>
                           <button onClick={handleSignalerPaiement} disabled={isSignalingPayment} className="bg-black text-white px-3 py-2 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 hover:scale-105 transition-transform disabled:opacity-50 mt-1 shadow-md">
                              {isSignalingPayment ? <Loader2 size={12} className="animate-spin text-white"/> : <Wallet size={12} style={{ color: tontine?.theme_color || '#39FF14' }}/>}
                              💳 Signaler ma cotisation au gérant
                           </button>
                        </div>
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
               <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 mb-4 custom-scrollbar">
                  {Array.from({ length: currentMonth }, (_, i) => {
                     const mois = currentMonth - i; // Ordre décroissant
                     const cot = cotisations.find(c => c.membre_id === currentUser.id && c.mois_numero === mois && c.statut === 'Payé');
                     return (
                        <div key={mois} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4 bg-zinc-50 rounded-xl border border-zinc-100 gap-3">
                           <div className="flex justify-between items-center w-full sm:w-auto">
                              <div>
                                 <p className="font-bold text-sm">Mois {mois}</p>
                                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{cot && cot.created_at ? new Date(cot.created_at).toLocaleDateString('fr-FR') : 'En attente'}</p>
                              </div>
                              <div className="sm:hidden">
                                 {cot ? (
                                    <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle size={12}/> Payé</span>
                                 ) : (
                                    <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1"><AlertCircle size={12}/> À Payer</span>
                                 )}
                              </div>
                           </div>
                           <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t border-zinc-200 sm:border-0">
                              <div className="hidden sm:block mr-2">
                                 {cot ? (
                                    <span className="text-xs font-black text-green-600 bg-green-100 px-2 py-1 rounded-md flex items-center gap-1"><CheckCircle size={12}/> Payé</span>
                                 ) : (
                                    <span className="text-xs font-black text-red-600 bg-red-50 px-2 py-1 rounded-md flex items-center gap-1"><AlertCircle size={12}/> À Payer</span>
                                 )}
                              </div>
                              {cot && (
                                 <div className="flex gap-2 w-full sm:w-auto">
                                    {cot.recu_url && (
                                       <a href={cot.recu_url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none p-2 bg-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-300 transition flex items-center justify-center gap-1 text-[10px] font-black uppercase">
                                          <Eye size={14}/> Photo
                                       </a>
                                    )}
                                    <button onClick={() => handleDownloadSpecificReceipt(currentUser, cot)} className="flex-1 sm:flex-none p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-1 text-[10px] font-black uppercase">
                                       <Download size={14}/> PDF
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>
                     );
                  })}
               </div>
               <button onClick={handleDownloadHistory} className="w-full py-3 rounded-xl font-black uppercase text-xs border-2 border-black text-black hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2">
                  <FileText size={16}/> Télécharger PDF détaillé
               </button>
            </div>
          </div>

          {/* === COLONNE DROITE (Jauge, Tirage, Listes) === */}
          <div className="md:col-span-8 space-y-6">
            
            {/* 1. JAUGE DE PROGRESSION */}
            <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-zinc-50 to-zinc-200 rounded-bl-full opacity-50 pointer-events-none -z-0"></div>
               <div className="relative z-10">
                   <div className="flex justify-between items-start mb-4">
                       <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase tracking-tighter`}>Cagnotte • Mois {currentMonth}</h2>
                       <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full">
                           {progressPercentage >= 100 ? "Objectif Atteint 🎉" : "En cours"}
                       </span>
                   </div>
                   
                   <div className="flex items-baseline gap-2 mb-3">
                       <span className="text-4xl font-black tracking-tighter" style={{ color: tontine.theme_color }}>
                           {actuelCaisse.toLocaleString()}
                       </span>
                       <span className="text-lg font-bold text-zinc-400">/ {caisseMensuelle.toLocaleString()} F CFA</span>
                   </div>

                   <div className="w-full bg-zinc-100 h-6 rounded-full overflow-hidden shadow-inner p-1">
                       <div 
                           className="h-full rounded-full transition-all duration-1000 ease-out relative flex items-center justify-end pr-2"
                           style={{ 
                               width: `${Math.max(5, Math.min(100, progressPercentage))}%`, 
                               backgroundColor: tontine.theme_color,
                               boxShadow: progressPercentage > 0 ? `0 0 15px ${tontine.theme_color}60` : 'none'
                           }}
                       >
                           {progressPercentage >= 20 && (
                               <span className="text-[10px] font-black text-black/60">{Math.round(progressPercentage)}%</span>
                           )}
                           <div className="absolute inset-0 bg-white/20 w-1/2 skew-x-[-20deg] animate-pulse"></div>
                       </div>
                   </div>
               </div>
            </section>

            {/* 2.5. TRANSPARENCE TOUR DE RÔLE */}
            <section className="bg-zinc-900 border border-zinc-800 p-6 md:p-8 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-bl-full pointer-events-none" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}></div>
                
                <div className="flex-1 w-full relative z-10">
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-sm mb-4 flex items-center gap-2 text-white`}>
                        <Wand2 size={18} style={{ color: tontine?.theme_color || '#39FF14' }} />
                        100% Transparence : Le Tour de Rôle
                    </h3>
                    {currentDrawConfig ? (() => {
                        const designatedMember = members.find(m => m.id === currentDrawConfig.membre_id);
                        return (
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="w-20 h-20 rounded-full border-2 p-1 shrink-0" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
                                    <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl font-black overflow-hidden" style={{ color: tontine?.theme_color || '#39FF14' }}>
                                        {designatedMember?.avatar_url || designatedMember?.photo_url ? (
                                            <img src={designatedMember.avatar_url || designatedMember.photo_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            designatedMember?.prenom_nom?.substring(0, 2) || "??"
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-400 uppercase tracking-widest font-bold mb-1">Maître du jeu ce mois-ci</p>
                                    <p className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-tight`}>
                                        {designatedMember?.prenom_nom || "Inconnu"}
                                    </p>
                                    <p className="text-xs text-zinc-500 italic mt-2 max-w-sm">A le pouvoir unique de lancer le tirage en un clic. (Une seule fois historiquement).</p>
                                </div>
                            </div>
                        );
                    })() : (
                        <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50 text-zinc-400 italic text-sm font-medium">
                            L'administrateur n'a pas encore désigné de membre pour le tirage de ce mois. L'automatisation prendra le relais dès le premier tirage effectué.
                        </div>
                    )}
                </div>

                    <div className="bg-black/50 p-5 rounded-3xl border border-zinc-800 text-center shrink-0 min-w-[200px] relative z-10 shadow-inner">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2">Tirage prévu dans</p>
                        <p className={`${spaceGrotesk.className} text-2xl md:text-3xl font-black animate-pulse`} style={{ color: isUrgent ? '#EF4444' : (tontine?.theme_color || '#39FF14') }}>
                            {countdownText || "Calcul..."}
                        </p>
                    </div>
            </section>

            {/* 2. MOTEUR DE TIRAGE AU SORT */}
            <section className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm relative overflow-hidden group">
               <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-2`}>
                   <Trophy size={24} style={{ color: tontine.theme_color }} /> 
                   Tirage au Sort
               </h2>
               
               <div className="bg-zinc-900 rounded-[1.5rem] p-8 text-center shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden border-4 border-zinc-800 transition-all duration-500 hover:border-zinc-700">
                   <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at center, #ffffff 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }}></div>
                   
                   {!revealed ? (
                     progressPercentage < 100 ? (
                        <div className="py-8">
                          <h2 className={`${spaceGrotesk.className} text-3xl font-black text-white uppercase mb-4`}>Cotisations en cours</h2>
                          <p className="text-base font-medium text-zinc-400">Le tirage sera disponible une fois toutes les cotisations du mois réglées.</p>
                        </div>
                     ) : isSpinning ? (
                        <div className="flex flex-col items-center py-8">
                           <div className="w-24 h-24 rounded-full border-4 border-t-transparent animate-spin mb-8" style={{ borderColor: `${tontine?.theme_color || '#39FF14'}40`, borderTopColor: tontine?.theme_color || '#39FF14' }}></div>
                           <p className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest animate-pulse drop-shadow-lg">{spinName || "Mélange..."}</p>
                           <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-6">Tirage en cours...</p>
                        </div>
                     ) : (
                        <div className="flex flex-col items-center py-8 gap-6">
                           {currentDrawConfig?.membre_id === currentUser.id ? (
                               <>
                                   <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black text-white uppercase mb-4 leading-tight`}>C'est à vous de jouer !</h2>
                                   <button onClick={executeMemberDraw} className="px-10 py-5 rounded-[2.5rem] font-black text-base uppercase tracking-widest transition-all shadow-xl hover:scale-105 flex items-center gap-3 animate-bounce" style={{ backgroundColor: tontine?.theme_color || '#39FF14', color: '#000' }}>
                                      <Wand2 size={24}/> Lancer le tirage
                                   </button>
                               </>
                           ) : (
                               <>
                                   <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black text-white uppercase mb-4 leading-tight`}>Tirage en attente</h2>
                                   <div className="mt-4 bg-zinc-800/50 border border-zinc-700 p-4 rounded-xl max-w-sm mx-auto">
                                       <p className="text-sm font-bold text-zinc-300">Le tirage est en cours d'organisation par <span className="text-white">{members.find(m => m.id === currentDrawConfig?.membre_id)?.prenom_nom || 'la personne désignée'}</span>. Vous serez informés dès qu'il sera effectué !</p>
                                   </div>
                               </>
                           )}
                        </div>
                     )
                   ) : (
                       <div className="relative z-10 py-6 animate-in zoom-in duration-500">
                           <div className="w-24 h-24 mx-auto mb-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.6)] border-4 border-white animate-bounce">
                               <Medal size={48} className="text-white drop-shadow-lg" />
                           </div>
                           <h3 className="text-yellow-400 font-black uppercase tracking-widest text-[10px] mb-2 animate-pulse">Félicitations</h3>
                           <p className="text-3xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-2xl mb-2">{spinName}</p>
                           <p className="text-zinc-400 font-bold text-sm">Remporte la cagnotte de <span className="text-white text-lg">{montantParGagnant.toLocaleString()} F CFA</span></p>
                           <button onClick={() => setRevealed(false)} className="mt-8 text-[10px] text-zinc-500 hover:text-white font-black uppercase tracking-widest underline decoration-zinc-700 underline-offset-4 transition-colors">Réinitialiser l'écran</button>
                       </div>
                   )}
               </div>
            </section>

            {/* 3. TABS : HISTORIQUE, ATTENTE, GERANCE */}
            <section className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
               <div className="flex border-b border-zinc-200 bg-zinc-50/50 p-2 gap-2 overflow-x-auto custom-scrollbar">
                   <button onClick={() => setActiveTab('historique')} className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'historique' ? 'bg-white shadow-sm border border-zinc-200 text-black' : 'text-zinc-400 hover:bg-zinc-100'}`}>
                      <History size={14}/> Gagnants
                   </button>
                   <button onClick={() => setActiveTab('attente')} className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'attente' ? 'bg-white shadow-sm border border-zinc-200 text-black' : 'text-zinc-400 hover:bg-zinc-100'}`}>
                      <Users size={14}/> En attente
                   </button>
                   {(currentUser.is_admin || currentUser.poste === 'Trésorier' || currentUser.poste === 'Président') && (
                       <button onClick={() => setActiveTab('gerance')} className={`flex-1 min-w-[120px] py-3 px-4 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'gerance' ? 'bg-black text-white shadow-sm' : 'text-zinc-400 hover:bg-zinc-100'}`} style={activeTab === 'gerance' ? { backgroundColor: tontine.theme_color, color: '#000' } : {}}>
                          <ShieldCheck size={14}/> Gérance
                       </button>
                   )}
               </div>
               
               <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                  {/* TAB: HISTORIQUE */}
                  {activeTab === 'historique' && (
                      <div className="space-y-6">
                          {winnersHistory.length === 0 ? (
                              <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-12">
                                 <History size={32} className="mb-4 opacity-20"/>
                                 <p className="text-sm font-bold text-center">Aucun gagnant pour le moment.</p>
                              </div>
                          ) : (
                              winnersHistory.map((hist, idx) => (
                                  <div key={idx} className="relative pl-6 border-l-2 border-zinc-100 pb-2">
                                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-zinc-200"></div>
                                      <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3">{hist.date}</p>
                                      <div className="grid sm:grid-cols-2 gap-3">
                                          {hist.winners.map((w: any, i: number) => (
                                              <div key={i} className="flex items-center gap-3 bg-zinc-50 p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-colors">
                                                  <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center font-black text-xs text-zinc-500">
                                                  {w.photo ? <img src={w.photo} className="w-full h-full object-cover"/> : w.nom?.substring(0,2)}
                                                  </div>
                                                  <div>
                                                  <p className="font-bold text-sm leading-tight text-black">{w.nom || "Inconnu"}</p>
                                                      <p className="text-[10px] text-zinc-500 font-bold mt-0.5">{montantParGagnant.toLocaleString()} F CFA</p>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  )}

                  {/* TAB: ATTENTE */}
                  {activeTab === 'attente' && (
                      <div className="grid sm:grid-cols-2 gap-3">
                          {waitingList.length === 0 ? (
                              <div className="sm:col-span-2 flex flex-col items-center justify-center text-zinc-400 py-12">
                                 <Users size={32} className="mb-4 opacity-20"/>
                                 <p className="text-sm font-bold text-center">Tous les membres ont déjà gagné !</p>
                              </div>
                          ) : (
                              waitingList.map(m => (
                                  <div key={m.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                      <div className="w-10 h-10 rounded-full bg-zinc-100 border-2 border-zinc-50 flex items-center justify-center text-zinc-400 font-black text-xs overflow-hidden">
                                      {m.photo_url ? <img src={m.photo_url} className="w-full h-full object-cover"/> : m.prenom_nom?.substring(0,2)}
                                      </div>
                                      <div>
                                      <p className="font-bold text-sm leading-tight text-black">{m.prenom_nom || "Inconnu"}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                             <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">En lice</p>
                                             {currentDrawConfig?.membre_id === m.id && <span title="Désigné pour le tirage ce mois" className="bg-black text-white px-2 py-0.5 rounded-md inline-flex items-center gap-1 text-[8px]" style={{ color: tontine.theme_color }}><PartyPopper size={10} /> Désigné</span>}
                                          </div>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  )}

                  {/* TAB: GERANCE */}
                  {activeTab === 'gerance' && (currentUser.is_admin || currentUser.poste === 'Trésorier' || currentUser.poste === 'Président') && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                          <div className="bg-orange-50 text-orange-800 p-4 rounded-2xl text-xs font-bold flex gap-3 mb-6 border border-orange-200">
                              <AlertCircle size={20} className="shrink-0 mt-0.5"/>
                              <div>
                                 <p className="uppercase font-black text-[10px] tracking-widest mb-1 opacity-80">Mode Gérance Sécurisé</p>
                                 <p>Validez ou annulez les paiements du mois en cours <span className="font-black">(Mois {currentMonth})</span>. Cette action mettra à jour la jauge et l'historique de chaque membre instantanément.</p>
                              </div>
                          </div>
                          
                          {members.map(m => {
                              const hasPaid = cotisationsCeMois.some(c => c.membre_id === m.id);
                              return (
                                  <div key={m.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-zinc-50 rounded-xl border border-zinc-100 gap-3 hover:bg-white hover:border-zinc-200 transition-colors shadow-sm">
                                      <div className="flex items-center gap-3">
                                          <div className="w-10 h-10 rounded-full bg-zinc-200 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black overflow-hidden text-zinc-500">
                                          {m.photo_url ? <img src={m.photo_url} className="w-full h-full object-cover"/> : m.prenom_nom?.substring(0,2)}
                                          </div>
                                          <div>
                                          <p className="font-bold text-sm text-black">{m.prenom_nom || "Inconnu"}</p>
                                              <p className="text-[10px] font-bold text-zinc-400">{m.telephone}</p>
                                          </div>
                                      </div>
                                      <button 
                                          onClick={() => handleTogglePaiement(m.id, currentMonth)}
                                          disabled={togglingPaymentFor === m.id}
                                          className={`px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 w-full sm:w-auto min-w-[150px] ${hasPaid ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' : 'bg-black text-white shadow-md hover:scale-105'}`}
                                          style={!hasPaid ? { backgroundColor: tontine.theme_color, color: '#000' } : {}}
                                      >
                                          {togglingPaymentFor === m.id ? <Loader2 size={16} className="animate-spin"/> : (hasPaid ? <X size={16}/> : <CheckCircle size={16}/>)}
                                          {togglingPaymentFor === m.id ? 'Traitement...' : (hasPaid ? 'Annuler' : 'Valider Paiement')}
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  )}
               </div>
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

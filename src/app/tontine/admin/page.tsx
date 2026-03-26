"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, Wallet, Calendar, Trophy, 
  Plus, Edit, Trash2, CheckCircle, 
  AlertCircle, X, Shuffle, ArrowRight,
  Medal, Search, Download, Copy, Check, Clock,
  RotateCcw, LogOut, Home, Settings, Loader2, MessageCircle, AlertTriangle,
  Camera, FileSpreadsheet, UserPlus, ArrowUpDown, PiggyBank,
  Lock, FileText, History 
} from "lucide-react";
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
import InteractiveParticles from '@/components/InteractiveParticles';

const spaceGrotesk = { className: "font-sans" }; // Remplacement par ta police Space Grotesk si configurée globalement

// --- TYPES ---
type Member = {
  id: string;
  prenom_nom: string;
  telephone: string;
  a_gagne: boolean;
  mois_victoire: number | null;
  statutPaiement?: 'À jour' | 'En retard';
  date_paiement?: string;
};

export default function TontineAdminDashboard() {
  // --- 1. ETATS OBLIGATOIRES & FONDAMENTAUX ---
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [tontine, setTontine] = useState<any>(null);
  const [membres, setMembres] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- ETATS SECONDAIRES (UI & LOGIQUE) ---
  const [currentMonth, setCurrentMonth] = useState<number>(1);
  const [isDrawing, setIsDrawing] = useState(false);
  const [latestWinners, setLatestWinners] = useState<Member[] | null>(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<Partial<Member> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [kpiFilter, setKpiFilter] = useState<'all' | 'gagnants' | 'attente' | 'retard'>('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [isSavingMember, setIsSavingMember] = useState(false);
  
  const [isImporting, setIsImporting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showOcrPreview, setShowOcrPreview] = useState(false);
  const [scannedMembers, setScannedMembers] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const ocrInputRef = useRef<HTMLInputElement>(null);
  const [sortAlphabetically, setSortAlphabetically] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [spinningName, setSpinningName] = useState("");

  // --- 2. LOGIQUE D'INITIALISATION ---
  useEffect(() => {
    let isMounted = true;

    const loadTontineData = async (user: any) => {
      try {
        setCurrentUser(user);
        console.log("Utilisateur détecté :", user.email || user.full_name);

        // 1. Recherche Tontine
        const { data: tontines, error: fetchErr } = await supabase
          .from('tontines')
          .select('*')
          .eq('owner_id', user.id);

        if (fetchErr) throw fetchErr;

        let targetTontine = tontines && tontines.length > 0 ? tontines[0] : null;

        // 2. Création si inexistante
        if (!targetTontine) {
          const { data: createdTontines, error: insertErr } = await supabase
            .from('tontines')
            .insert([{ 
              nom: 'Nouvelle Tontine', 
              theme_color: '#009FDF', 
              montant_mensuel: 20000, 
              gagnants_par_mois: 2, 
              duree_mois: 10, 
              logo_url: 'https://i.ibb.co/XkKJb43F/LES-QUEENS-2.png',
              owner_id: user.id 
            }])
            .select('*');

          if (insertErr) throw insertErr;
          if (createdTontines && createdTontines.length > 0) {
            targetTontine = createdTontines[0];
          }
        }

        if (!targetTontine?.id) throw new Error("ID introuvable après création.");

        // 3. Application au State
        if (isMounted) setTontine(targetTontine);

        // 4. Fetch Membres & Cotisations
        const { data: members } = await supabase
          .from('membres')
          .select('*')
          .eq('tontine_id', targetTontine.id);

        const { data: cData } = await supabase.from('cotisations').select('*');
        const totalGagnants = targetTontine.gagnants_par_mois || 2;
        const gagnantsCount = (members || []).filter((m: any) => m.a_gagne).length;
        const cMonth = Math.floor(gagnantsCount / totalGagnants) + 1;
        
        if (isMounted) {
          setCurrentMonth(cMonth);
          const fetchedMembers = (members || []).map((m: any) => {
              const cotis = (cData || []).find((c: any) => c.membre_id === m.id && c.mois_numero === cMonth && c.statut === 'Payé');
              return { ...m, statutPaiement: cotis ? 'À jour' : 'En retard', date_paiement: cotis ? cotis.date_paiement : undefined };
          });
          setMembres(fetchedMembers);
          if (fetchedMembers.some((m: any) => m.statutPaiement === 'En retard')) setKpiFilter('retard');
        }

      } catch (err: any) {
        console.error("Erreur chargement données:", err.message);
        if (isMounted) setErrorMessage(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Étape 1 : Vérification immédiate
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (isMounted) {
        if (session?.user) {
          loadTontineData(session.user);
        } else {
           // Fallback pour la session de test local (depuis Onyx CRM)
           const customSession = localStorage.getItem('onyx_custom_session');
           if (customSession) { 
               try { 
                  const user = JSON.parse(customSession); 
                  loadTontineData(user);
                  return;
               } catch(e) {} 
           }
           setIsLoading(false); // Affiche l'écran d'accès restreint
        }
      }
    });

    // Étape 2 : Écouteur actif (Attrape la session si elle arrive en retard après l'hydratation)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted && session?.user && !currentUser) {
        setIsLoading(true);
        loadTontineData(session.user);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe(); // Nettoyage
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshMembers = async () => {
    if (!tontine || !tontine.id) return;
    const { data: mData } = await supabase.from('membres').select('*').eq('tontine_id', tontine.id).order('created_at', { ascending: true });
    const { data: cData } = await supabase.from('cotisations').select('*');
    
    const totalGagnants = tontine.gagnants_par_mois || 2;
    const cMonth = Math.floor((mData || []).filter(m => m.a_gagne).length / totalGagnants) + 1;
    setCurrentMonth(cMonth);

    const fetchedMembers = (mData || []).map(m => {
        const cotis = (cData || []).find(c => c.membre_id === m.id && c.mois_numero === cMonth && c.statut === 'Payé');
        return { ...m, statutPaiement: cotis ? 'À jour' : 'En retard', date_paiement: cotis ? cotis.date_paiement : undefined };
    });
    
    setMembres(fetchedMembers);
    if (fetchedMembers.some(m => m.statutPaiement === 'En retard')) setKpiFilter('retard');
  };

  // --- KPIs DYNAMIQUES ---
  const totalMembres = membres.length;
  const caisseMensuelle = totalMembres * (tontine?.montant_mensuel || 20000);
  const aJourCount = membres.filter(m => m.statutPaiement === 'À jour').length;
  const actuelCaisse = aJourCount * (tontine?.montant_mensuel || 20000);
  const progressPercentage = caisseMensuelle > 0 ? (actuelCaisse / caisseMensuelle) * 100 : 0;
  const montantParGagnant = tontine?.gagnants_par_mois ? caisseMensuelle / tontine.gagnants_par_mois : caisseMensuelle / 2;
  const dureeTotale = tontine?.duree_mois || 10;
  const totalGagnants = membres.filter(m => m.a_gagne).length;
  const moisEcoules = Math.floor(totalGagnants / (tontine?.gagnants_par_mois || 2));
  const progressionPourcentage = Math.min((moisEcoules / dureeTotale) * 100, 100);

  // --- HISTORIQUE DES GAGNANTS ---
  const winnersHistoryRaw = membres.filter(m => m.a_gagne).reduce((acc: any, m: Member) => {
    const mois = m.mois_victoire;
    if (!mois) return acc;
    if (!acc[mois]) acc[mois] = [];
    acc[mois].push(m.prenom_nom);
    return acc;
  }, {});
  const pastMonthsList = Object.keys(winnersHistoryRaw).map(Number).sort((a, b) => b - a);

  // Synchro du mois actuel avec le nombre de gagnants
  useEffect(() => {
    const expectedMonth = moisEcoules + 1;
    if (expectedMonth <= dureeTotale) {
      setCurrentMonth(expectedMonth);
    } else {
      setCurrentMonth(dureeTotale);
    }
  }, [moisEcoules, dureeTotale]);

  // --- LOGIQUE DE TIRAGE AU SORT ---
  const lancerTirage = async () => {
    if (progressPercentage < 100) {
      alert("Action refusée : La caisse mensuelle n'est pas encore pleine.");
      return;
    }

    const eligibleMembers = membres.filter(m => !m.a_gagne && m.statutPaiement === 'À jour');
    
    if (eligibleMembers.length < (tontine?.gagnants_par_mois || 2)) {
      alert(`Impossible de lancer le tirage : Il faut au moins ${tontine?.gagnants_par_mois || 2} membres éligibles.`);
      return;
    }

    setIsDrawing(true);
    setLatestWinners(null);

    // Animation de Roulette
    const spinInterval = setInterval(() => {
      const randomMember = eligibleMembers[Math.floor(Math.random() * eligibleMembers.length)];
      setSpinningName(randomMember.prenom_nom);
    }, 100);

    // Simulation d'animation de tirage (suspense et roulette)
    setTimeout(async () => {
      clearInterval(spinInterval);
      
      // Mélange aléatoire du tableau (Fisher-Yates shuffle)
      const shuffled = [...eligibleMembers].sort(() => 0.5 - Math.random());
      
      // Sélection des 2 premiers
      const winners = shuffled.slice(0, tontine?.gagnants_par_mois || 2);

      // Mise à jour SUPABASE
      const { error } = await supabase
        .from('membres')
        .update({ a_gagne: true, mois_victoire: currentMonth })
        .in('id', winners.map(w => w.id));

      if (!error) {
         refreshMembers();
         setLatestWinners(winners);
         setShowConfetti(true);
         setTimeout(() => setShowConfetti(false), 8000);
         
         // Petit son de victoire
         const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
         audio.volume = 0.4;
         audio.play().catch(() => {});
      } else {
         alert("Erreur lors de l'enregistrement du tirage.");
      }
      
      setIsDrawing(false);

    }, 2500);
  };

  // --- LOGIQUE CRUD ---
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember?.prenom_nom || !editingMember?.telephone) return alert("Veuillez remplir le nom et le téléphone.");

    setIsSavingMember(true);
    try {
      let memberId = editingMember.id;
      if (memberId) {
        await supabase.from('membres').update({ prenom_nom: editingMember.prenom_nom, telephone: editingMember.telephone, a_gagne: editingMember.a_gagne, mois_victoire: editingMember.mois_victoire }).eq('id', memberId);
      } else {
        const { data: newM } = await supabase.from('membres').insert({
          tontine_id: tontine.id,
          prenom_nom: editingMember.prenom_nom,
          telephone: editingMember.telephone,
        }).select().single();
        if (newM) memberId = newM.id;
      }

      // Gestion intelligente du paiement (Table cotisations)
      if (memberId) {
         if (editingMember.statutPaiement === 'À jour') {
             const { data: existing } = await supabase.from('cotisations').select('*').eq('membre_id', memberId).eq('mois_numero', currentMonth).eq('statut', 'Payé').maybeSingle();
             
             let paymentDate = new Date().toISOString();
             if (editingMember.date_paiement) paymentDate = new Date(editingMember.date_paiement).toISOString();

             if (!existing) {
                 await supabase.from('cotisations').insert({ membre_id: memberId, mois_numero: currentMonth, montant: tontine.montant_mensuel, statut: 'Payé', date_paiement: paymentDate });
             } else {
                 await supabase.from('cotisations').update({ date_paiement: paymentDate }).eq('id', existing.id);
             }
         } else {
             await supabase.from('cotisations').delete().eq('membre_id', memberId).eq('mois_numero', currentMonth);
         }
      }
    } catch (err: any) {
      alert("Erreur d'enregistrement : " + err.message);
    }
    
    await refreshMembers();
    setIsSavingMember(false);
    setShowMemberModal(false);
    setEditingMember(null);
  };

  // --- 3. SAUVEGARDE DES PARAMÈTRES ROBUSTE ---
  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    try {
      if (!tontine || !tontine.id) throw new Error("ID de la tontine introuvable.");
      
      // On force les noms exacts des colonnes de la BDD
      const payload: any = {
        nom: tontine.nom,
        logo_url: tontine.logo_url,
        theme_color: tontine.theme_color,
        duree_mois: tontine.duree_mois,
        montant_mensuel: tontine.montant_mensuel,
        gagnants_par_mois: tontine.gagnants_par_mois
      };

      if (tontine.start_date) payload.start_date = tontine.start_date;
      
      const { data, error } = await supabase
        .from('tontines')
        .update(payload)
        .eq('id', tontine.id)
        .select(); // Le .select() force Supabase à renvoyer la ligne modifiée

      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Aucune ligne modifiée. Vérifiez l'ID.");

      alert('Sauvegardé avec succès !');
      setShowSettingsModal(false);
    } catch (err: any) {
      alert("Erreur lors de la sauvegarde : " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- IMPORT EXCEL ---
  const handleExcelImport = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !tontine?.id) return alert('Erreur: Tontine non initialisée');
    setIsImporting(true);

    const reader = new FileReader();
    reader.onload = async (event: any) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json: any[] = XLSX.utils.sheet_to_json(worksheet);

        // Formatage pour Supabase
        const formattedMembers = json.map((row) => ({
          tontine_id: tontine.id,
          prenom_nom: row.PRENOM || row['PRÉNOM'] || 'Nom Inconnu',
          telephone: String(row.NUMERO || row['NUMÉRO'] || ''),
          a_gagne: false
        }));

        const { error } = await supabase.from('membres').insert(formattedMembers);
        if (error) throw error;

        alert(`${formattedMembers.length} membres importés avec succès !`);
        
        // Recharger la liste des membres
        const { data: newMembers } = await supabase.from('membres').select('*').eq('tontine_id', tontine.id);
        setMembres(newMembers || []);

      } catch (err: any) {
        console.error("Erreur Import Excel:", err);
        alert("Erreur lors de l'import : " + err.message);
      } finally {
        setIsImporting(false);
        e.target.value = null; // Reset l'input file
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- IMPORT OCR (TESSERACT) ---
  const handleOcrImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const result = await Tesseract.recognize(file, 'fra');
      const text = result.data.text;
      const lines = text.split('\n');
      
      const extractedMembers: any[] = [];
      
      // Regex pour détecter un numéro sénégalais (commençant par 77, 76, 78, 70, 75)
      const phoneRegex = /(?:(?:\+|00)221)?\s*([7][05678]\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d\s*\d)/;

      lines.forEach(line => {
        const match = line.match(phoneRegex);
        if (match) {
          const rawPhone = match[0];
          const cleanPhone = match[1].replace(/\s+/g, '');
          
          // Le nom est ce qui précède le numéro
          const namePart = line.replace(rawPhone, '').trim().replace(/^[^a-zA-Z]+/, '').replace(/[^a-zA-Z\s]+$/, '');
          const finalName = namePart || 'Membre Scanner';

          extractedMembers.push({
            prenom_nom: finalName,
            telephone: cleanPhone
          });
        }
      });

      if (extractedMembers.length === 0) {
         alert("Aucun numéro de téléphone détecté. Assurez-vous que l'image est nette.");
      } else {
         setScannedMembers(extractedMembers);
         setShowOcrPreview(true);
      }
    } catch (error: any) {
      console.error("Erreur OCR:", error);
      alert("Erreur lors de l'analyse de l'image.");
    } finally {
      setIsScanning(false);
      if (ocrInputRef.current) ocrInputRef.current.value = '';
    }
  };

  const confirmOcrImport = async () => {
     if (!tontine || scannedMembers.length === 0) return;
     setIsImporting(true); 
     try {
        const membersToInsert = scannedMembers.map(m => ({
           tontine_id: tontine.id,
           prenom_nom: m.prenom_nom,
           telephone: m.telephone,
           a_gagne: false,
           statut_paiement: 'À jour'
        }));

        const { error } = await supabase.from('membres').insert(membersToInsert);
        if (error) throw error;

        alert(`${membersToInsert.length} membres scannés ajoutés avec succès !`);
        setShowOcrPreview(false);
        setScannedMembers([]);
        refreshMembers();
     } catch (error: any) {
        console.error("Erreur insertion OCR:", error);
        alert("Erreur lors de l'enregistrement : " + error.message);
     } finally {
        setIsImporting(false);
     }
  };

  // --- LOGIQUE RÉINITIALISATION TONTINE ---
  const handleResetTontine = async () => {
    if (confirm("Voulez-vous vraiment réinitialiser TOUS les tirages de cette tontine ? Cela annulera les victoires de tout le monde (Remise à zéro).")) {
      const { error } = await supabase.from('membres').update({ a_gagne: false, mois_victoire: null }).eq('tontine_id', tontine.id);
      if (error) alert("Erreur : " + error.message);
      else {
        alert("Tontine réinitialisée avec succès !");
        refreshMembers();
      }
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce membre de la tontine ?")) {
      await supabase.from('membres').delete().eq('id', id);
      refreshMembers();
    }
  };

  const sendLateReminder = (m: Member) => {
    const msg = `🚨 Bonjour ${m.prenom_nom}, sauf erreur de notre part, nous n'avons pas encore reçu votre cotisation de ${(tontine?.montant_mensuel || 20000).toLocaleString()} F pour la tontine "${tontine?.nom}". Merci de régulariser au plus vite 🙏`;
    let phone = m.telephone.replace(/\s+/g, '');
    if (phone.length === 9) phone = `221${phone}`;
    window.open(`https://wa.me/${phone.startsWith('221') ? phone : phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- FILTRES ---
  const filteredMembers = membres.filter(m => {
    const matchSearch = m.prenom_nom.toLowerCase().includes(searchTerm.toLowerCase()) || m.telephone.includes(searchTerm);
    if (!matchSearch) return false;
    if (kpiFilter === 'gagnants' && !m.a_gagne) return false;
    if (kpiFilter === 'attente' && m.a_gagne) return false;
    if (kpiFilter === 'retard' && m.statutPaiement !== 'En retard') return false;
    return true;
  });

  const displayedMembers = sortAlphabetically 
    ? [...filteredMembers].sort((a, b) => a.prenom_nom.localeCompare(b.prenom_nom))
    : filteredMembers;

  // --- EXPORT EXCEL (CSV) ---
  const exportToCSV = () => {
    const headers = ["Nom Complet", "Téléphone", "Cotisation (F CFA)", "A Déjà Gagné ?", "Mois de Victoire", "Statut Paiement"];
    const csvRows = membres.map(m => [
      `"${m.prenom_nom}"`,
      `"${m.telephone}"`,
      tontine?.montant_mensuel || 20000,
      m.a_gagne ? 'Oui' : 'Non',
      m.mois_victoire || 'N/A',
      `"${m.statutPaiement}"`
    ].join(","));
    
    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); // \uFEFF force l'UTF-8 pour Excel (accents)
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `OnyxTontine_Membres_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- COPIER LE LIEN MEMBRE ---
  const handleCopyLink = () => {
    if (!tontine) return;
    const url = `${window.location.origin}/tontine/membre?id=${tontine.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLogout = async () => {
    localStorage.removeItem('onyx_custom_session');
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  // --- PARTAGE WHATSAPP GAGNANTS ---
  const handleNotifyGroup = () => {
    if (!latestWinners) return;
    const names = latestWinners.map(w => w.prenom_nom).join(" et ");
    const msg = `🎉 *TIRAGE ONYX TONTINE - MOIS ${currentMonth}* 🎉\n\nFélicitations à *${names}* qui remportent chacun *${montantParGagnant.toLocaleString()} F CFA* !\n\nL'argent sera transféré sous peu. Merci à tous pour votre confiance !`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- PARTAGE BILAN MENSUEL ---
  const handleSendBilan = () => {
    if (!tontine) return;
    const aJourCount = membres.filter(m => m.statutPaiement === 'À jour').length;
    const retardCount = membres.filter(m => m.statutPaiement === 'En retard').length;
    const montantCollecte = aJourCount * (tontine.montant_mensuel || 20000);
    
    const msg = `📊 *BILAN ONYX TONTINE - MOIS ${currentMonth}* 📊\n\n👥 Total membres : ${totalMembres}\n✅ Cotisations à jour : ${aJourCount}\n🚨 En retard : ${retardCount}\n💰 Caisse actuelle : ${montantCollecte.toLocaleString()} F / ${caisseMensuelle.toLocaleString()} F\n\n🙏 Merci à tous ceux qui sont à jour. Nous invitons les retardataires à régulariser rapidement pour le bon déroulement du tirage !`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-black font-sans flex flex-col selection:bg-[#39FF14]/30">
      <InteractiveParticles themeColor={tontine?.theme_color || '#009FDF'} />
      
      {/* ANIMATION DE CONFETTIS */}
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
      
      {/* CSS Anim */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-ring {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(57, 255, 20, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(57, 255, 20, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(57, 255, 20, 0); }
        }
        .animate-ring { animation: pulse-ring 2s infinite; }
      `}} />

      {/* HEADER FIXE (Toujours Visible) */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-40 shrink-0">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-[#39FF14] shadow-md">
                {tontine?.logo_url ? <img src={tontine.logo_url} alt="Logo" className="w-full h-full object-cover rounded-xl" /> : <Users size={20} />}
             </div>
             <div>
               <h1 className={`${spaceGrotesk.className} text-xl font-black uppercase tracking-tighter leading-none`} style={{ color: tontine?.theme_color || '#39FF14' }}>
                  {tontine?.nom || "Les Queens"}
               </h1>
               <div className="flex items-center gap-3 mt-1.5">
                 <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Terminal Admin</p>
                 {tontine && (
                   <button onClick={handleCopyLink} className="flex items-center gap-1 text-[9px] font-black uppercase bg-zinc-100 hover:bg-zinc-200 px-2 py-0.5 rounded transition-colors text-zinc-600 hover:text-black shadow-sm">
                     {copiedLink ? <Check size={10} className="text-green-500"/> : <Copy size={10}/>} {copiedLink ? 'Lien copié !' : 'Lien Membres'}
                   </button>
                 )}
               </div>
             </div>
          </div>
          <div className="flex items-center gap-3 relative" ref={profileMenuRef}>
             <span className="bg-zinc-100 text-zinc-600 px-3 py-1.5 rounded-lg text-xs font-black uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></span> Mode Live
             </span>
             {!currentUser ? (
                <div className="w-10 h-10 border-2 border-zinc-200 border-t-black rounded-full animate-spin"></div>
             ) : (
               <>
                 <button onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} className="w-10 h-10 bg-zinc-900 text-white rounded-full border-2 border-white shadow-sm flex items-center justify-center font-black text-sm hover:scale-105 transition-transform uppercase">
                    {currentUser.email?.substring(0, 2).toUpperCase() || currentUser.full_name?.substring(0, 2).toUpperCase() || 'AD'}
                 </button>
                 {isProfileMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-zinc-200 shadow-2xl rounded-2xl p-2 z-50 animate-in fade-in zoom-in-95 flex flex-col">
                       <div className="px-4 py-3 border-b border-zinc-100 mb-2">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Connecté en tant que</p>
                          <p className="text-sm font-black text-black truncate">{currentUser.email || currentUser.full_name || 'Utilisateur'}</p>
                       </div>
                       <button onClick={() => window.location.href = '/hub'} className="w-full text-left px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-50 hover:text-black rounded-xl transition flex items-center gap-2">
                          <Home size={14} /> Retour au Hub
                       </button>
                       <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition flex items-center gap-2">
                          <LogOut size={14} /> Se déconnecter
                       </button>
                    </div>
                 )}
               </>
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative w-full">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-[60vh]">
             <Loader2 className="w-12 h-12 animate-spin text-black mb-4" />
             <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Initialisation du Terminal...</p>
          </div>
        ) : !currentUser ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-[60vh]">
             <div className="w-20 h-20 bg-zinc-100 rounded-[2rem] flex items-center justify-center text-zinc-400 mb-6 shadow-sm"><Lock size={32}/></div>
             <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-4 text-black`}>Accès Restreint</h2>
             <p className="text-sm font-bold text-zinc-500 text-center max-w-sm mb-8">Veuillez vous connecter depuis le Hub pour accéder à votre espace Tontine.</p>
             <button onClick={() => window.location.href = '/hub'} className="bg-black text-[#39FF14] px-8 py-4 rounded-2xl font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex items-center gap-2">
               <Home size={16}/> Retourner au Hub
             </button>
          </div>
        ) : !tontine ? (
          <div className="flex-1 flex flex-col items-center justify-center p-10 min-h-[60vh]">
             <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
             <p className="text-sm font-bold text-red-500 uppercase tracking-widest">Erreur de chargement Tontine</p>
             {errorMessage && (
                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl max-w-lg">
                   <p className="text-xs font-mono text-red-600 text-center">{errorMessage}</p>
                </div>
             )}
             <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-zinc-100 hover:bg-zinc-200 text-black text-xs font-bold uppercase rounded-xl transition">
                Réessayer
             </button>
          </div>
        ) : (
          <div className="max-w-7xl w-full mx-auto px-6 pt-10 pb-24">
        
        {/* NOUVEAU KPI PRINCIPAL : MOTEUR FINANCIER */}
        <div className="w-full rounded-3xl p-6 md:p-8 mb-6 flex flex-col md:flex-row items-center justify-between shadow-[0_0_40px_rgba(0,0,0,0.08)] relative overflow-hidden transition-all group"
             style={{
                 background: `linear-gradient(135deg, ${tontine?.theme_color || '#39FF14'}15 0%, ${tontine?.theme_color || '#39FF14'}05 100%)`,
                 borderColor: `${tontine?.theme_color || '#39FF14'}40`,
                 borderWidth: '1px',
                 boxShadow: `0 0 20px ${tontine?.theme_color || '#39FF14'}20, inset 0 0 20px ${tontine?.theme_color || '#39FF14'}10`
             }}>
           <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}></div>

           <div className="flex items-center gap-5 mb-4 md:mb-0 z-10">
              <div className="p-4 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm text-black group-hover:scale-110 transition-transform">
                 <PiggyBank size={32} style={{ color: tontine?.theme_color || '#39FF14' }} />
              </div>
              <div>
                 <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-1">Total Mensuel Collecté</p>
                 <div className="flex items-baseline gap-2">
                    <p className="text-4xl md:text-5xl font-black tracking-tighter text-black leading-none">
                       {actuelCaisse.toLocaleString('fr-FR')} <span className="text-xl text-zinc-400">F CFA</span>
                    </p>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-3 bg-white/80 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/50 shadow-sm z-10">
              <Calendar size={20} className="text-zinc-500"/>
              <p className="text-sm font-black uppercase tracking-widest text-zinc-700">Le 06 du mois</p>
           </div>
        </div>

        {/* LA GRILLE DES 4 KPIs SECONDAIRES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
           {/* Carte 1 : Progression */}
           <button onClick={() => { setKpiFilter('all'); document.getElementById('history-section')?.scrollIntoView({behavior: 'smooth'}) }} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between text-left cursor-pointer hover:scale-105 hover:shadow-xl transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-black opacity-[0.02] rounded-bl-[100%] transition-transform group-hover:scale-110"></div>
              <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-[#39FF14] transition-colors"><CheckCircle size={24}/></div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Progression</p>
              <div className="w-full">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-2xl md:text-3xl font-black tracking-tighter text-black leading-none">{moisEcoules}/{dureeTotale}</span>
                  <span className="text-[10px] font-bold text-zinc-500 mb-1">Mois</span>
                </div>
                <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressionPourcentage}%`, backgroundColor: tontine?.theme_color || '#39FF14' }}></div>
                </div>
              </div>
           </button>

           {/* Carte 2 : Tirage du Mois */}
           <button onClick={() => { setKpiFilter('all'); document.getElementById('draw-section')?.scrollIntoView({behavior: 'smooth'}) }} className="bg-black p-6 rounded-[2rem] border-2 shadow-xl flex flex-col justify-between text-left cursor-pointer hover:scale-105 hover:shadow-2xl transition-all group relative overflow-hidden" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
              <div className="absolute -right-4 -top-4 w-24 h-24 opacity-20 rounded-full blur-2xl group-hover:opacity-40 transition-opacity" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}></div>
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ color: tontine?.theme_color || '#39FF14' }}><Shuffle size={24}/></div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 relative z-10">Tirage du mois</p>
              <p className="text-3xl font-black tracking-tighter text-white relative z-10">Mois {currentMonth}</p>
           </button>

           {/* Carte 3 : Gagnants */}
           <button onClick={() => { setKpiFilter('gagnants'); document.getElementById('members-section')?.scrollIntoView({behavior: 'smooth'}) }} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between text-left cursor-pointer hover:scale-105 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-yellow-400 transition-colors relative z-10"><Trophy size={24}/></div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 relative z-10">Gagnants (Total)</p>
              <p className="text-3xl font-black tracking-tighter text-black leading-none relative z-10">{totalGagnants} <span className="text-sm font-bold text-zinc-400">Membres</span></p>
           </button>

           {/* Carte 4 : Durée Cycle */}
           <button onClick={() => { setKpiFilter('all'); document.getElementById('history-section')?.scrollIntoView({behavior: 'smooth'}) }} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between text-left cursor-pointer hover:scale-105 hover:shadow-xl transition-all group relative overflow-hidden">
              <div className="w-12 h-12 bg-zinc-100 text-zinc-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-black group-hover:text-[#00E5FF] transition-colors relative z-10"><Calendar size={24}/></div>
              <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 relative z-10">Durée Cycle</p>
              <p className="text-3xl font-black tracking-tighter text-black leading-none relative z-10">{dureeTotale} <span className="text-sm font-bold text-zinc-400">Mois</span></p>
           </button>
        </div>

        {/* MOTEUR DE TIRAGE (LA FEATURE CENTRALE) */}
        <div id="draw-section" className="bg-black rounded-[3rem] p-8 md:p-12 shadow-2xl mb-12 relative overflow-hidden flex flex-col items-center justify-center text-center border-t-[8px]" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.15] blur-[100px] rounded-full pointer-events-none" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}></div>
           
           <div className="relative z-10 w-full max-w-2xl mx-auto">
              <p className="font-black uppercase tracking-[0.3em] text-xs mb-4 flex items-center justify-center gap-2" style={{ color: tontine?.theme_color || '#39FF14' }}>
                 <Shuffle size={14}/> Tirage du Mois {currentMonth}
              </p>
              <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black text-white uppercase mb-8 leading-tight`}>
                 Déterminez les {tontine?.gagnants_par_mois || 2} gagnants <br className="hidden md:block"/> de ce mois.
              </h2>
              
              {moisEcoules >= dureeTotale ? (
                 <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl text-zinc-400 font-black uppercase tracking-widest">
                    🎉 Tontine Terminée (Tous les membres ont gagné)
                 </div>
              ) : (
                 isDrawing ? (
                    <div className="flex flex-col items-center py-8">
                       <div className="w-24 h-24 rounded-full border-4 border-t-transparent animate-spin mb-6" style={{ borderColor: `${tontine?.theme_color || '#39FF14'}40`, borderTopColor: tontine?.theme_color || '#39FF14' }}></div>
                       <p className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest animate-pulse drop-shadow-lg">{spinningName || "Mélange..."}</p>
                       <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest mt-4">Tirage en cours...</p>
                    </div>
                 ) : (
                    <div className="flex flex-col items-center gap-4">
                       <button 
                         onClick={lancerTirage} 
                         disabled={progressPercentage < 100}
                         className={`w-full md:w-auto px-10 py-6 rounded-[2rem] font-black text-lg md:text-xl uppercase tracking-widest transition-all flex items-center justify-center gap-3 mx-auto ${progressPercentage < 100 ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed scale-95' : 'text-black hover:scale-105 animate-ring'}`}
                         style={progressPercentage >= 100 ? { backgroundColor: tontine?.theme_color || '#39FF14' } : {}}
                       >
                          <Trophy size={24}/> Lancer le Tirage ({tontine?.gagnants_par_mois || 2} personnes)
                       </button>
                       {progressPercentage < 100 && (
                          <p className="text-red-500 text-xs font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                             <AlertTriangle size={14}/> La caisse n'est pas encore pleine
                          </p>
                       )}
                    </div>
                 )
              )}

              {/* AFFICHAGE DES GAGNANTS (ANIMATION) */}
              {latestWinners && !isDrawing && (
                 <div className="mt-10 animate-in slide-in-from-bottom-8 fade-in duration-500">
                    <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest mb-4">Résultats du tirage</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                       {latestWinners.map(winner => (
                          <div key={winner.id} className="bg-zinc-900 border-2 p-5 rounded-3xl flex items-center gap-4 text-left" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
                             <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                                <Medal size={28} style={{ color: tontine?.theme_color || '#39FF14' }}/>
                             </div>
                             <div>
                                <p className="font-black text-white uppercase text-lg leading-none">{winner.prenom_nom}</p>
                                <p className="font-black text-xs mt-1" style={{ color: tontine?.theme_color || '#39FF14' }}>Gagne {montantParGagnant.toLocaleString()} F</p>
                             </div>
                          </div>
                       ))}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                       <button onClick={handleNotifyGroup} className="flex-1 text-black px-6 py-3 rounded-xl text-xs font-black uppercase hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}>
                          <MessageCircle size={16}/> Partager dans le groupe WhatsApp
                       </button>
                       <button onClick={() => setLatestWinners(null)} className="flex-1 sm:flex-none text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors">
                          Fermer
                       </button>
                    </div>
                 </div>
              )}
           </div>
        </div>

        {/* HISTORIQUE DES TIRAGES (BILANS PASSÉS) */}
        {pastMonthsList.length > 0 && (
           <div id="history-section" className="mb-12">
              <div className="flex items-center justify-between mb-6 px-2">
                 <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter flex items-center gap-3 text-black`}>
                    <div className="p-2 bg-black text-[#39FF14] rounded-xl shadow-md"><History size={20} /></div>
                    Historique des Bilans
                 </h3>
                 <button onClick={() => setShowHistory(!showHistory)} className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-black transition-colors bg-zinc-100 hover:bg-zinc-200 px-4 py-2 rounded-xl">
                    {showHistory ? 'Masquer' : 'Voir tout'}
                 </button>
              </div>
              {showHistory && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-4">
                    {pastMonthsList.map(mois => (
                       <div key={mois} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col justify-between hover:border-black transition-colors group">
                          <div className="flex justify-between items-start mb-4">
                             <span className="bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-black group-hover:text-[#39FF14] transition-colors">
                                Mois {mois}
                             </span>
                             <span className="text-xs font-black text-black">{((winnersHistoryRaw[mois]?.length || 0) * montantParGagnant).toLocaleString()} F</span>
                          </div>
                          <div>
                             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Gagnants</p>
                             <p className="font-black uppercase text-sm leading-tight text-black">{winnersHistoryRaw[mois].join(" & ")}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
        )}

        {/* GESTION DES MEMBRES (CRUD) */}
        <div id="members-section" className="bg-white border border-zinc-200 rounded-[3rem] p-6 md:p-10 shadow-sm">
           <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 mb-8">
              <div>
                 <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter`}>Liste des Membres</h3>
                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Total: {membres.length} participants</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap justify-end">
                 <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Rechercher un nom..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full sm:w-64 pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black transition"
                    />
                 </div>
                 <button
                   onClick={() => setSortAlphabetically(!sortAlphabetically)}
                   className={`px-4 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 transition shadow-sm shrink-0 border ${sortAlphabetically ? 'bg-black text-[#39FF14] border-black' : 'bg-white border-zinc-200 text-black hover:bg-zinc-50'}`}
                 >
                    <ArrowUpDown size={16}/> {sortAlphabetically ? 'Tri par défaut' : 'Tri A-Z'}
                 </button>
                 <button 
                   onClick={() => setShowSettingsModal(true)}
                   className="bg-white border border-zinc-200 text-black px-4 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-zinc-50 transition shadow-sm shrink-0"
                 >
                    <Settings size={16}/> Paramètres
                 </button>
                 <button 
                   onClick={handleResetTontine}
                   className="bg-white border border-zinc-200 text-red-500 px-4 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-red-50 transition shadow-sm shrink-0"
                 >
                    <RotateCcw size={16}/> Réinitialiser
                 </button>
                 <button 
                   onClick={handleSendBilan}
                   className="bg-black text-[#39FF14] px-4 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:scale-105 transition shadow-sm shrink-0"
                 >
                    <FileText size={16}/> Bilan Mensuel
                 </button>
                 <button 
                   onClick={exportToCSV}
                   className="bg-white border border-zinc-200 text-black px-4 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-zinc-50 transition shadow-sm shrink-0"
                 >
                    <Download size={16}/> Exporter CSV
                 </button>
                 
                 <button 
                   onClick={() => document.getElementById('excel-upload')?.click()}
                   disabled={isImporting}
                   className="bg-zinc-800 text-white border border-zinc-700 px-4 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-zinc-700 transition shadow-sm shrink-0 disabled:opacity-50"
                 >
                    {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16}/>} Importer Excel
                 </button>
                 <input type="file" id="excel-upload" accept=".xlsx, .xls, .csv" className="hidden" onChange={handleExcelImport} />
                 <button 
                   onClick={() => ocrInputRef.current?.click()}
                   disabled={isScanning}
                   className="bg-zinc-800 text-white border border-zinc-700 px-4 py-3 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 hover:bg-zinc-700 transition shadow-sm shrink-0 disabled:opacity-50"
                 >
                    {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16}/>} Scanner Cahier (OCR)
                 </button>
                 <input type="file" accept="image/*" capture="environment" className="hidden" ref={ocrInputRef} onChange={handleOcrImport} />

                 <button 
                   onClick={() => { setEditingMember({ statutPaiement: 'À jour' }); setShowMemberModal(true); }}
                   className="px-6 py-3 rounded-xl font-black text-black uppercase text-xs flex items-center justify-center gap-2 hover:scale-105 transition shadow-lg shrink-0"
                   style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}
                 >
                    <UserPlus size={16}/> Ajouter Manuellement
                 </button>
              </div>
           </div>

           <div className="overflow-x-auto custom-scrollbar pb-4">
              <table className="w-full text-left min-w-[800px]">
                 <thead className="bg-zinc-50/80 border-b border-zinc-100">
                    <tr>
                       <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Membre & Contact</th>
                       <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Cotisation</th>
                       <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Statut Tirage</th>
                       <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Paiement</th>
                       <th className="p-5 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-50">
                    {membres.length === 0 ? (
                       <tr>
                          <td colSpan={5} className="p-16 text-center border-0">
                             <p className="text-zinc-500 font-bold mb-6">Aucun membre dans cette tontine. Ajoutez vos participants.</p>
                             <button 
                               onClick={() => { setEditingMember({ statutPaiement: 'À jour' }); setShowMemberModal(true); }}
                               className="px-6 py-3 rounded-xl font-black text-black uppercase text-xs inline-flex items-center justify-center gap-2 hover:scale-105 transition shadow-lg mx-auto"
                               style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}
                             >
                                <Plus size={16}/> Ajouter le premier membre
                             </button>
                          </td>
                       </tr>
                    ) : displayedMembers.map((m, idx) => (
                       <tr key={m.id} className="hover:bg-zinc-50/50 transition-colors group">
                          <td className="p-5">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center font-black text-black text-xs shadow-sm">
                                   {idx + 1}
                                </div>
                                <div>
                                   <p className="font-black text-sm uppercase text-black">{m.prenom_nom}</p>
                                   <p className="text-[10px] font-bold text-zinc-500 mt-0.5">{m.telephone || "Non renseigné"}</p>
                                </div>
                             </div>
                          </td>
                          <td className="p-5">
                             <p className="font-black text-black">{(tontine?.montant_mensuel || 20000).toLocaleString()} F</p>
                          </td>
                          <td className="p-5">
                             {m.a_gagne ? (
                                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                                   <CheckCircle size={12}/> A déjà bouffé (M{m.mois_victoire})
                                </span>
                             ) : (
                                <span className="inline-flex items-center gap-1 bg-zinc-100 text-zinc-500 border border-zinc-200 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                   <Clock size={12}/> En attente
                                </span>
                             )}
                          </td>
                          <td className="p-5">
                             {m.statutPaiement === 'À jour' ? (
                                <div className="flex flex-col items-start gap-1">
                                   <span className="text-[10px] font-black uppercase text-black bg-zinc-100 px-2 py-1 rounded-md">À Jour</span>
                                   {m.date_paiement && <span className="text-[9px] font-bold text-zinc-500 uppercase">{new Date(m.date_paiement).toLocaleDateString('fr-FR')}</span>}
                                </div>
                             ) : (
                                <span className="text-[10px] font-black uppercase text-white bg-red-500 px-2 py-1 rounded-md flex items-center gap-1 w-max">
                                   <AlertCircle size={10}/> En retard
                                </span>
                             )}
                          </td>
                          <td className="p-5 text-right space-x-2">
                             {m.statutPaiement === 'En retard' && (
                               <button onClick={() => sendLateReminder(m)} className="p-2.5 text-zinc-400 hover:text-green-500 hover:bg-green-50 rounded-xl transition" title="Relancer sur WhatsApp">
                                  <MessageCircle size={16}/>
                               </button>
                             )}
                             <button 
                               onClick={() => { setEditingMember(m); setShowMemberModal(true); }}
                               className="p-2.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-xl transition"
                             >
                                <Edit size={16}/>
                             </button>
                             <button 
                               onClick={() => handleDeleteMember(m.id)}
                               className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
                             >
                                <Trash2 size={16}/>
                             </button>
                          </td>
                       </tr>
                    ))}
                    {membres.length > 0 && displayedMembers.length === 0 && (
                       <tr>
                          <td colSpan={5} className="p-16 text-center text-zinc-400 font-bold uppercase text-xs tracking-widest">Aucun membre trouvé pour cette recherche.</td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
        </div>
        )}
      </main>

      {/* MODALE AJOUT/MODIFICATION MEMBRE */}
      {showMemberModal && editingMember && (
         <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowMemberModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] w-full max-w-md relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-black">
               <button onClick={() => setShowMemberModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
               
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-8`}>
                  {editingMember.id ? 'Modifier le Membre' : 'Nouveau Membre'}
               </h2>

               <form onSubmit={handleSaveMember} className="space-y-4">
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Nom Complet *</label>
                     <input 
                       type="text" 
                       required
                       value={editingMember.prenom_nom || ''} 
                       onChange={(e) => setEditingMember({...editingMember, prenom_nom: e.target.value})} 
                       className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition uppercase"
                       placeholder="Ex: Awa Seck"
                     />
                  </div>
                  
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Numéro WhatsApp *</label>
                     <input 
                       type="tel" 
                       required
                       value={editingMember.telephone || ''} 
                       onChange={(e) => setEditingMember({...editingMember, telephone: e.target.value})} 
                       className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition"
                       placeholder="77 xxx xx xx"
                     />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Statut Paiement</label>
                        <select 
                          value={editingMember.statutPaiement || 'À jour'} 
                          onChange={(e) => setEditingMember({...editingMember, statutPaiement: e.target.value as any})}
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition cursor-pointer"
                        >
                           <option value="À jour">À jour</option>
                           <option value="En retard">En retard</option>
                        </select>
                     </div>
                     {editingMember.statutPaiement === 'À jour' && (
                        <div className="animate-in fade-in">
                           <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Date de paiement</label>
                           <input 
                             type="date"
                             value={editingMember.date_paiement ? editingMember.date_paiement.split('T')[0] : new Date().toISOString().split('T')[0]}
                             onChange={(e) => setEditingMember({...editingMember, date_paiement: e.target.value})}
                             className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition cursor-pointer"
                           />
                        </div>
                     )}
                  </div>

                  {/* Option Avancée Admin */}
                  {editingMember.id && (
                     <div className="pt-4 mt-2 border-t border-zinc-100 flex items-center justify-between">
                        <label className="text-xs font-bold text-zinc-600 cursor-pointer flex items-center gap-2">
                           <input 
                             type="checkbox" 
                             checked={editingMember.a_gagne || false} 
                             onChange={(e) => setEditingMember({...editingMember, a_gagne: e.target.checked, mois_victoire: e.target.checked ? (editingMember.mois_victoire || currentMonth) : null})}
                             className="w-4 h-4 accent-black"
                           />
                           A déjà gagné le tirage
                        </label>
                     </div>
                  )}

                  <button type="submit" disabled={isSavingMember} className="w-full text-black py-5 rounded-2xl font-black uppercase text-xs mt-6 hover:scale-105 transition shadow-xl flex justify-center items-center gap-2 disabled:opacity-50"
                    style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}>
                     {isSavingMember ? <span className="animate-spin"><Loader2 size={16}/></span> : <CheckCircle size={16}/>} 
                     {isSavingMember ? 'Enregistrement...' : 'Enregistrer le membre'}
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* MODALE PARAMÈTRES TONTINE */}
      {showSettingsModal && (
         <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowSettingsModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] w-full max-w-md relative shadow-2xl animate-in zoom-in-95 border-t-[8px]" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
               <button onClick={() => setShowSettingsModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
               
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-8`}>
                  Paramètres
               </h2>

               <form onSubmit={handleSaveSettings} className="space-y-4">
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Nom de la Tontine</label>
                     <input 
                       type="text" 
                       required
                       value={tontine?.nom || ''} 
                       onChange={(e) => setTontine({...tontine, nom: e.target.value})} 
                       className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition uppercase"
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Logo (URL)</label>
                     <input 
                       type="url" 
                       value={tontine?.logo_url || ''} 
                       onChange={(e) => setTontine({...tontine, logo_url: e.target.value})} 
                       className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition"
                       placeholder="https://..."
                     />
                  </div>
                  <div>
                     <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Couleur du Thème</label>
                     <input 
                       type="color" 
                       value={tontine?.theme_color || '#39FF14'} 
                       onChange={(e) => setTontine({...tontine, theme_color: e.target.value})} 
                       className="w-full h-14 p-2 bg-zinc-50 border border-zinc-200 rounded-2xl cursor-pointer"
                     />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Date de début</label>
                        <input 
                          type="date" 
                          value={tontine?.start_date || ''} 
                          onChange={(e) => setTontine({...tontine, start_date: e.target.value})} 
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Durée (Mois)</label>
                        <input 
                          type="number" 
                          required
                          value={tontine?.duree_mois || 10} 
                          onChange={(e) => setTontine({...tontine, duree_mois: Number(e.target.value)})} 
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition"
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Cotisation (F)</label>
                        <input 
                          type="number" 
                          required
                          value={tontine?.montant_mensuel || 20000} 
                          onChange={(e) => setTontine({...tontine, montant_mensuel: Number(e.target.value)})} 
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition"
                        />
                     </div>
                     <div>
                        <label className="text-[10px] font-black uppercase text-zinc-500 ml-2 mb-1 block tracking-widest">Gagnants / mois</label>
                        <input 
                          type="number" 
                          required
                          value={tontine?.gagnants_par_mois || 2} 
                          onChange={(e) => setTontine({...tontine, gagnants_par_mois: Number(e.target.value)})} 
                          className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition"
                        />
                     </div>
                  </div>

                  <div className="p-4 bg-zinc-100 rounded-2xl flex flex-col gap-1 border border-zinc-200">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Lien Public (Espace Membre)</p>
                     <div className="flex gap-2 items-center mt-1">
                        <code className="flex-1 text-[10px] font-mono text-black truncate bg-white p-2 rounded-lg border border-zinc-200">
                           {typeof window !== 'undefined' ? `${window.location.origin}/tontine/membre?id=${tontine?.id}` : ''}
                        </code>
                        <button type="button" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/tontine/membre?id=${tontine?.id}`); alert("Lien copié !"); }} className="p-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition">
                           <Copy size={14}/>
                        </button>
                     </div>
                  </div>

                  <button type="button" disabled={isSaving} onClick={handleSaveSettings} className="w-full text-black py-5 rounded-2xl font-black uppercase text-xs mt-6 hover:scale-105 transition shadow-xl flex justify-center items-center gap-2 disabled:opacity-50" style={{ backgroundColor: tontine?.theme_color || '#39FF14' }}>
                     {isSaving ? <span className="animate-spin"><Loader2 size={16} /></span> : <CheckCircle size={16}/>}
                     {isSaving ? 'Enregistrement...' : 'Sauvegarder les modifications'}
                  </button>
               </form>
            </div>
         </div>
      )}

      {/* MODALE PRÉVISUALISATION OCR */}
      {showOcrPreview && (
         <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowOcrPreview(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white p-8 md:p-10 rounded-[3rem] w-full max-w-lg relative shadow-2xl animate-in zoom-in-95 border-t-[8px]" style={{ borderColor: tontine?.theme_color || '#39FF14' }}>
               <button onClick={() => setShowOcrPreview(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
               
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter mb-2`}>
                  Membres Détectés
               </h2>
               <p className="text-zinc-500 text-sm font-bold mb-6">Voici les {scannedMembers.length} membres lus depuis l'image. Validez-vous ?</p>

               <div className="max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar mb-6 space-y-2">
                  {scannedMembers.map((m, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                      <span className="font-bold text-sm uppercase text-black">{m.prenom_nom}</span>
                      <span className="font-black text-[#39FF14] bg-black px-3 py-1 rounded-lg text-xs">{m.telephone}</span>
                    </div>
                  ))}
               </div>

               <div className="flex gap-3">
                 <button onClick={() => setShowOcrPreview(false)} className="flex-1 bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-zinc-200 transition">
                    Annuler
                 </button>
                 <button onClick={confirmOcrImport} disabled={isImporting} className="flex-1 bg-black py-4 rounded-2xl font-black uppercase text-xs hover:scale-105 transition shadow-xl flex justify-center items-center gap-2 disabled:opacity-50 text-[#39FF14]" style={{ color: tontine?.theme_color || '#39FF14' }}>
                    {isImporting ? <span className="animate-spin"><Loader2 size={16}/></span> : <CheckCircle size={16}/>}
                    {isImporting ? 'Enregistrement...' : 'Valider & Importer'}
                 </button>
               </div>
            </div>
         </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Users, Wallet, Trophy, Shuffle, ShieldCheck, Home, Loader2, Plus, Edit, Trash2, X, CheckCircle, AlertCircle, Copy, Link as LinkIcon, Upload, Briefcase, MessageCircle, Cake, RotateCcw, Settings, FileText, Pencil, ClipboardList, Eye, Download, Archive, Send, History, Sparkles, Calendar, Wand2, Clock, Share2 } from 'lucide-react';
import InteractiveParticles from '@/components/InteractiveParticles';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  const [memberForm, setMemberForm] = useState({ prenom_nom: '', telephone: '', code_secret: '0000', a_gagne: false, photo_url: '', poste: '', is_admin: false, has_paid: false, mois_exclus: '' });
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsForm, setSettingsForm] = useState({ nom: '', theme_color: '#39FF14', logo_url: '', duree_mois: 10, montant_mensuel: 0, date_debut: '', date_limite_paiement: 5, slug: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState('tous');
  const [searchTerm, setSearchTerm] = useState('');
  const sectionMembresRef = useRef<HTMLDivElement>(null);
  const sectionTirageRef = useRef<HTMLElement>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");

  // --- ÉTATS GESTION FICHIERS & PAIEMENT ---
  const [uploadingImage, setUploadingImage] = useState(false);
  const [paymentModal, setPaymentModal] = useState<any>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  // --- ÉTATS TIRAGE ---
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinName, setSpinName] = useState("");
  const [spinAvatar, setSpinAvatar] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);
  const [recentWinners, setRecentWinners] = useState<any[]>([]);

  // --- ÉTATS COMMUNICATION VISUELLE ---
  const [showPromoModal, setShowPromoModal] = useState<'gagnantes' | 'prochain' | null>(null);
  const [promoDateTirage, setPromoDateTirage] = useState("");
  const [promoLieuTirage, setPromoLieuTirage] = useState("En ligne (WhatsApp)");
  const [promoCopied, setPromoCopied] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // --- CALCULS DU MOIS EN COURS ---
  const totalGagnantsMois = tontine?.gagnants_par_mois || 1;
  const moisEcoules = Math.floor(membres.filter(m => m.a_gagne).length / totalGagnantsMois);
  const currentMonth = moisEcoules + 1;

  // --- ÉTATS TOUR DE RÔLE ---
  const [currentDrawConfig, setCurrentDrawConfig] = useState<any>(null);
  const [designatedMemberId, setDesignatedMemberId] = useState<string>('');

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

  const handleCancelDesignation = async () => {
    if (!currentDrawConfig?.id) return;
    if (!confirm("Voulez-vous vraiment annuler la désignation de ce membre ?")) return;
    setIsSaving(true);
    try {
      await supabase.from('configuration_tirage').delete().eq('id', currentDrawConfig.id);
      setCurrentDrawConfig(null);
      setDesignatedMemberId('');
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDrawDate = async (newDate: string) => {
    if (!currentDrawConfig?.id) return;
    try {
      const { data, error } = await supabase.from('configuration_tirage').update({ date_tirage_prevue: newDate }).eq('id', currentDrawConfig.id).select().single();
      if (error) throw error;
      setCurrentDrawConfig(data);
    } catch (err: any) {
      alert("Erreur maj date: " + err.message);
    }
  };

  const fetchDrawConfig = async () => {
    if (!tontine?.id) return;
    try {
      const { data, error } = await supabase
        .from('configuration_tirage')
        .select('*')
        .eq('tontine_id', tontine.id)
        .single();
      if (!error && data) {
        setCurrentDrawConfig(data);
      } else {
        setCurrentDrawConfig(null);
      }
    } catch (err) {
      console.error("Erreur fetchDrawConfig:", err);
    }
  };

  // --- CALCULS MEILLEURS PAYEURS ---
  const paidCotisationsThisMonth = cotisations
    .filter(c => c.mois_numero === currentMonth && c.statut === 'Payé')
    .sort((a, b) => {
       const dateA = new Date(a.date_signalement || a.created_at || 0).getTime();
       const dateB = new Date(b.date_signalement || b.created_at || 0).getTime();
       return dateA - dateB;
    });

  const topPayers = paidCotisationsThisMonth
    .map(c => {
       const member = membres.find(m => m.id === c.membre_id);
       return member ? { ...member, paymentDate: c.date_signalement || c.created_at } : null;
    })
    .filter(Boolean)
    .slice(0, 3);

  const handleFeliciterPodium = () => {
    if (!tontine || topPayers.length === 0) return;

    const medals = ['🥇', '🥈', '🥉'];
    const podiumText = topPayers.map((payer: any, idx: number) => 
       `${medals[idx]} *${payer.prenom_nom}* - payé le ${new Date(payer.paymentDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}`
    ).join('\n');

    const message = `🏆 *TABLEAU D'HONNEUR - MOIS ${currentMonth}* 🏆\n\nTontine: *${tontine.nom}*\n-----------------------------------\nFélicitations à nos meilleurs payeurs de ce mois (les plus rapides) :\n\n${podiumText}\n\n🙏 Merci pour votre ponctualité qui fait avancer la tontine !\n-----------------------------------\n_Onyx Tontine_`;

    if (navigator.share) {
      navigator.share({ title: `Tableau d'Honneur - ${tontine.nom}`, text: message }).catch(console.error);
    } else {
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
  };

  useEffect(() => {
    if (tontine?.id) {
      fetchDrawConfig();
    }
  }, [tontine?.id]);

  const uploadFileToSupabase = async (file: File, folder: string) => {
    if (file.size > 1 * 1024 * 1024) throw new Error("Le fichier dépasse 1 Mo.");
    const ext = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
    const { error } = await supabase.storage.from('tontines').upload(fileName, file);
    if (error) throw error;
    const { data } = supabase.storage.from('tontines').getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleCopyPromo = (text: string) => {
    navigator.clipboard.writeText(text);
    setPromoCopied(true);
    setTimeout(() => setPromoCopied(false), 3000);
  };

  const handleGenerateImage = async (promptText: string) => {
    setIsGeneratingImage(true);
    setGeneratedImageUrl(null);
    try {
      // Appel vers l'API Next.js (DALL-E 3)
      const res = await fetch('/api/tontine/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText })
      });
      if (!res.ok) throw new Error("L'API a retourné une erreur");
      const data = await res.json();
      if (data.imageUrl) setGeneratedImageUrl(data.imageUrl);
      else throw new Error("Pas d'URL d'image reçue");
    } catch (error) {
      console.error(error);
      alert("Génération échouée. Vérifiez que la route /api/tontine/admin est bien configurée avec votre clé OpenAI.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // --- FONCTIONS CRUD MEMBRES ---
  const openAddModal = () => {
    setEditingMember(null);
    setMemberForm({ prenom_nom: '', telephone: '', code_secret: '0000', a_gagne: false, photo_url: '', poste: '', is_admin: false, has_paid: false, mois_exclus: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (m: any) => {
    const hasPaid = cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
    setEditingMember(m);
    setMemberForm({ prenom_nom: m.prenom_nom || '', telephone: m.telephone || '', code_secret: m.code_secret || '0000', a_gagne: !!m.a_gagne, photo_url: m.photo_url || '', poste: m.poste || '', is_admin: !!m.is_admin, has_paid: hasPaid, mois_exclus: m.mois_exclus || '' });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (!tontine) throw new Error("Tontine non chargée.");
      
      let isChangingToAdmin = memberForm.is_admin && (!editingMember || !editingMember.is_admin);
      if (isChangingToAdmin) {
         const currentAdmins = membres.filter(member => member.is_admin && member.id !== editingMember?.id);
         if (currentAdmins.length >= 2) {
             throw new Error("Vous ne pouvez pas avoir plus de 2 co-gérants.");
         }
      }

      const payload = { tontine_id: tontine.id, prenom_nom: memberForm.prenom_nom, telephone: memberForm.telephone, code_secret: memberForm.code_secret, a_gagne: memberForm.a_gagne, photo_url: memberForm.photo_url, poste: memberForm.poste, is_admin: memberForm.is_admin, mois_exclus: memberForm.mois_exclus };

      let updatedMembers = membres;

      let memberId = editingMember?.id;
      if (editingMember) {
        const wasWinner = editingMember.a_gagne;
        const { error } = await supabase.from('tontine_members').update(payload).eq('id', editingMember.id);
        if (error) throw error;
        setMembres(updatedMembers.map(m => m.id === editingMember.id ? { ...m, ...payload } : m));

        // Déclencher un message si le membre devient un gagnant manuellement
        if (payload.a_gagne && !wasWinner) {
            if (confirm(`Voulez-vous envoyer un message de félicitations à ${payload.prenom_nom} sur WhatsApp ?`)) {
                const prizeAmount = (caisseMensuelle / (tontine?.gagnants_par_mois || 1)).toLocaleString();
                const message = `Félicitations ${payload.prenom_nom} ! Vous avez été désigné(e) comme gagnant(e) pour la tontine "${tontine.nom}" (Mois ${currentMonth}). Vous remportez la somme de ${prizeAmount} F CFA ! 💰`;
                const encodedMessage = encodeURIComponent(message);
                window.open(`https://wa.me/221${payload.telephone}?text=${encodedMessage}`, '_blank');
            }
        }
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
            if (!errCot && newCot) {
               setCotisations(prev => [...prev, newCot[0]]);
               const dueDate = tontine?.date_limite_paiement || 5;
               if (new Date().getDate() > dueDate) {
                  setShowConfetti(true);
                  setTimeout(() => setShowConfetti(false), 8000);
                  const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
                  audio.volume = 0.5;
                  audio.play().catch(()=>{});
               }
            }
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
      date_debut: tontine?.date_debut ? new Date(tontine.date_debut).toISOString().split('T')[0] : '',
      date_limite_paiement: tontine?.date_limite_paiement || 5,
      slug: tontine?.slug || ''
    });
    setIsSettingsModalOpen(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
       const payload: any = { ...settingsForm };
       // Empêcher le crash Postgres si la date est vide
       if (!payload.date_debut || payload.date_debut.trim() === '') payload.date_debut = null;
       if (!payload.slug || payload.slug.trim() === '') payload.slug = null;

       const { data, error } = await supabase.from('tontines').update(payload).eq('id', tontine.id).select();
       if (error) throw error;
       
       if (data && data.length > 0) {
           setTontine(data[0]);
           
           // Copie automatique si le slug a changé
           if (tontine.slug !== data[0].slug && data[0].slug) {
               const newLink = `${window.location.origin}/tontine/${data[0].slug}`;
               navigator.clipboard.writeText(newLink);
               setCopied(true);
               setTimeout(() => setCopied(false), 3000);
           }
       } else {
           throw new Error("Modification bloquée (RLS). Activez la politique UPDATE sur la table 'tontines' dans Supabase.");
       }
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
    const customSlug = tontine?.slug || tontine?.nom.toLowerCase().replace(/\s+/g, '-');
    const link = `${window.location.origin}/tontine/${customSlug}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const scrollToSection = (ref: React.RefObject<any>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const togglePaymentStatus = async (m: any, hasPaid: boolean) => {
    try {
      if (hasPaid) {
        if (!confirm("Voulez-vous annuler ce paiement ?")) return;
        setIsSaving(true);
        const { error } = await supabase.from('cotisations').delete().match({ membre_id: m.id, mois_numero: currentMonth, statut: 'Payé' });
        if (error) throw error;
        setCotisations(prev => prev.filter(c => !(c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé')));
        setIsSaving(false);
      } else {
        setPaymentModal({ member: m });
        setReceiptFile(null);
      }
    } catch (err: any) {
      alert("Erreur lors de la modification du paiement: " + err.message);
      setIsSaving(false);
    } finally {
    }
  };

  const confirmPayment = async () => {
     if (!paymentModal) return;
     try {
         setIsSaving(true);
         let recu_url: string | null = null;
         if (receiptFile) {
             recu_url = await uploadFileToSupabase(receiptFile, 'recus');
         }
         const payload = { tontine_id: tontine.id, membre_id: paymentModal.member.id, mois_numero: currentMonth, montant: tontine?.montant_mensuel || 0, statut: 'Payé' as any };
         if (recu_url) (payload as any).recu_url = recu_url;

         const { data: existing } = await supabase.from('cotisations').select('id').eq('tontine_id', tontine.id).eq('membre_id', paymentModal.member.id).eq('mois_numero', currentMonth).single();
         
         let res;
         if (existing) {
             res = await supabase.from('cotisations').update({ statut: 'Payé', recu_url: recu_url || null }).eq('id', existing.id).select();
         } else {
             res = await supabase.from('cotisations').insert([payload]).select();
         }

         if (res.error) throw res.error;
         if (res.data && res.data.length > 0) {
             setCotisations(prev => {
                 const filtered = prev.filter(c => c.id !== res.data[0].id && !(c.membre_id === paymentModal.member.id && c.mois_numero === currentMonth));
                 return [...filtered, res.data[0]];
             });
             const dueDate = tontine?.date_limite_paiement || 5;
             if (new Date().getDate() > dueDate) {
                setShowConfetti(true);
                setTimeout(() => setShowConfetti(false), 8000);
                const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
                audio.volume = 0.5;
                audio.play().catch(()=>{});
             }
         }
         setPaymentModal(null);
     } catch(e:any) { alert(e.message); } finally { setIsSaving(false); }
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
         const currentAdmins = membres.filter(member => member.is_admin);
         if (currentAdmins.length >= 2) {
             alert("Vous ne pouvez pas avoir plus de 2 co-gérants.");
             return;
         }
         await supabase.from('tontine_members').update({ is_admin: true }).eq('id', m.id);
         setMembres(membres.map(member => member.id === m.id ? { ...member, is_admin: true } : member));
      } else {
         await supabase.from('tontine_members').update({ is_admin: false }).eq('id', m.id);
         setMembres(membres.map(member => member.id === m.id ? { ...member, is_admin: false } : member));
      }
    } catch (err: any) {
      alert("Erreur de modification du rôle: " + err.message);
    }
  };

  const handleUpdateTontineName = async () => {
    if (!editNameValue.trim() || !tontine) return;
    setIsSaving(true);
    try {
      const { data, error } = await supabase.from('tontines').update({ nom: editNameValue }).eq('id', tontine.id).select();
      if (error) throw error;
      if (data && data.length > 0) {
          setTontine(data[0]);
      } else {
          throw new Error("Modification bloquée (RLS). Activez la politique UPDATE sur la table 'tontines' dans Supabase.");
      }
      setIsEditingName(false);
    } catch (err: any) {
      alert("Erreur lors de la modification du nom: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDesignateMember = async (memberId: string) => {
    if (!tontine) return;
    setIsSaving(true);
    try {
      const member = membres.find(m => m.id === memberId);
      if (!member || member.a_gagne) throw new Error("Ce membre n'est pas éligible.");

      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(tontine.date_limite_paiement || 5);

      const payload = { tontine_id: tontine.id, membre_id: memberId, date_tirage_prevue: nextDate.toISOString().split('T')[0] };

      console.log("Payload envoyée (depuis carte):", { tontine_id: tontine.id, membre_id: memberId });

      let res;
      if (currentDrawConfig?.id) {
        res = await supabase.from('configuration_tirage').update(payload).eq('id', currentDrawConfig.id).select();
      } else {
        res = await supabase.from('configuration_tirage').insert([payload]).select();
      }
      if (res.error) throw res.error;
      
      fetchDrawConfig();

      if (confirm(`Membre désigné avec succès !\nVoulez-vous notifier ${member.prenom_nom} sur WhatsApp ?`)) {
        const message = `Bonjour ${member.prenom_nom}, vous avez été désigné(e) pour lancer le prochain tirage de la tontine "${tontine.nom}". Préparez-vous ! 🎉`;
        window.open(`https://wa.me/221${member.telephone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    } catch (err: any) { alert("Erreur: " + err.message); } finally { setIsSaving(false); }
  };

  const handleDesignateNextDrawPerson = async () => {
    if (!designatedMemberId) return alert("Veuillez sélectionner un membre.");
    if (!tontine) return;
    
    setIsSaving(true);
    try {
      const member = membres.find(m => m.id === designatedMemberId);
      if (!member || member.a_gagne) {
        throw new Error("Ce membre n'est pas éligible.");
      }

      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);
      nextDate.setDate(tontine.date_limite_paiement || 5);

      const payload = {
        tontine_id: tontine.id,
        membre_id: designatedMemberId,
        date_tirage_prevue: nextDate.toISOString().split('T')[0]
      };

      console.log("Payload envoyée (depuis select):", { tontine_id: tontine.id, membre_id: designatedMemberId });

      let res;
      if (currentDrawConfig?.id) {
        res = await supabase.from('configuration_tirage').update(payload).eq('id', currentDrawConfig.id).select();
      } else {
        res = await supabase.from('configuration_tirage').insert([payload]).select();
      }

      if (res.error) throw res.error;
      
      alert("Membre désigné avec succès pour le prochain tour !");
      fetchDrawConfig();

      if (confirm(`Voulez-vous notifier ${member.prenom_nom} sur WhatsApp de sa désignation ?`)) {
        const message = `Bonjour ${member.prenom_nom}, vous avez été désigné(e) pour lancer le prochain tirage de la tontine "${tontine.nom}". Préparez-vous ! 🎉`;
        window.open(`https://wa.me/221${member.telephone}?text=${encodeURIComponent(message)}`, '_blank');
      }
    } catch (err: any) {
      alert("Erreur: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopySummary = () => {
    if (!tontine) return;

    const paidMembers = membres.filter(m => 
      cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé')
    );
    const unpaidMembers = membres.filter(m => 
      !cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé')
    );

    const formatMember = (m: any) => m.poste ? `- ${m.prenom_nom} (${m.poste})` : `- ${m.prenom_nom}`;

    const summary = `
*RÉCAPITULATIF TONTINE - ${tontine.nom}*
*Mois en cours :* ${currentMonth}
-----------------------------------
*CAISSE ACTUELLE :*
${actuelCaisse.toLocaleString()} / ${caisseMensuelle.toLocaleString()} F CFA (${Math.round(progressPercentage)}%)

*✅ ONT PAYÉ (${paidMembers.length}) :*
${paidMembers.map(formatMember).join('\n') || 'Personne'}

*❌ RESTENT À PAYER (${unpaidMembers.length}) :*
${unpaidMembers.map(formatMember).join('\n') || 'Personne'}
-----------------------------------
Généré par Onyx Tontine
    `.trim().replace(/^\s+/gm, ''); // Trim and remove leading spaces from each line

    const encodedMessage = encodeURIComponent(summary);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
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
    const eligibles = membres.filter(m => {
      if (m.a_gagne) return false;
      if (m.mois_exclus) {
        const excludedMonths = m.mois_exclus.split(',').map((s: string) => parseInt(s.trim())).filter((n: number) => !isNaN(n));
        if (excludedMonths.includes(currentMonth)) return false;
      }
      return true;
    });
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

        // --- Automatisation : Désigner le membre suivant ---
        const remainingEligibles = membres.filter(m => !winnerIds.includes(m.id) && !m.a_gagne);
        if (remainingEligibles.length > 0) {
            const nextMember = remainingEligibles[0];
            const nextDate = new Date();
            nextDate.setMonth(nextDate.getMonth() + 1);
            nextDate.setDate(tontine.date_limite_paiement || 5);
            
            const payload = {
                tontine_id: tontine.id,
                membre_id: nextMember.id,
                date_tirage_prevue: nextDate.toISOString().split('T')[0]
            };
            
            if (currentDrawConfig?.id) {
                await supabase.from('configuration_tirage').update(payload).eq('id', currentDrawConfig.id);
            } else {
                await supabase.from('configuration_tirage').insert([payload]);
            }
            alert(`Le tirage est terminé ! ${nextMember.prenom_nom} a été automatiquement désigné(e) pour le mois suivant.`);
            fetchDrawConfig();
            if (confirm(`Voulez-vous notifier ${nextMember.prenom_nom} sur WhatsApp de sa désignation automatique ?`)) {
                const message = `Bonjour ${nextMember.prenom_nom}, vous avez été automatiquement désigné(e) pour lancer le prochain tirage de la tontine "${tontine.nom}" le mois prochain. Félicitations ! 🎉`;
                window.open(`https://wa.me/221${nextMember.telephone}?text=${encodeURIComponent(message)}`, '_blank');
            }
        } else {
            alert("Le tirage est terminé ! Il n'y a plus de membres éligibles pour le prochain mois.");
        }
      } catch (err: any) {
        alert("Erreur lors du tirage : " + err.message);
      } finally {
        setIsSpinning(false);
      }
    }, 3000);
  };

  const handleNotifyWinners = () => {
    if (!tontine || recentWinners.length === 0) return;

    const prizeAmount = (caisseMensuelle / (tontine?.gagnants_par_mois || 1)).toLocaleString();
    const winnerNames = recentWinners.map(w => `- *${w.prenom_nom}*`).join('\n');

    const message = `
🎉 *FÉLICITATIONS AUX GAGNANTS !* 🎉

Tontine: *${tontine.nom}*
Mois: *${currentMonth}*
-----------------------------------
Les gagnants du tirage sont :
${winnerNames}

Chacun remporte la somme de *${prizeAmount} F CFA* ! 💰
    `.trim().replace(/^\s+/gm, '');

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleShareDrawGroup = () => {
    if (!tontine || recentWinners.length === 0) return;

    const prizeAmount = (caisseMensuelle / (tontine?.gagnants_par_mois || 1)).toLocaleString();
    const winnerNames = recentWinners.map(w => `✅ *${w.prenom_nom}*`).join('\n');

    const text = `💸 *RÉSULTATS DU TIRAGE - MOIS ${currentMonth}* 💸\n\nTontine : *${tontine.nom}*\n-----------------------------------\n🎯 *Les heureux gagnants sont :*\n${winnerNames}\n\n💰 Montant remporté : *${prizeAmount} F CFA* (chacun)\n-----------------------------------\nFélicitations aux gagnants ! 🎉\nTirage effectué en toute transparence via Onyx Tontine.`;

    // Utilisation du partage natif (excellent sur mobile pour partager direct dans un groupe)
    if (navigator.share) {
      navigator.share({
        title: `Résultats Tirage - ${tontine.nom}`,
        text: text
      }).catch(console.error);
    } else {
      const encodedMessage = encodeURIComponent(text);
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
    }
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
    const message = `⏳ *RAPPEL COTISATION*\n\nBonjour ! Les cotisations du mois sont en cours. Nous attendons la participation de :\n\n${memberNames}\n\n🙏 Merci de régulariser au plus vite pour qu'on puisse lancer le tirage !`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const handleMarkAllPaid = async () => {
    if (!tontine) return;
    const unpaidMembers = membres.filter(m => 
        !cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé')
    );
    
    if (unpaidMembers.length === 0) return;
    
    if (!confirm(`Voulez-vous vraiment marquer les ${unpaidMembers.length} membres restants comme payés pour le mois ${currentMonth} ?`)) return;

    setIsSaving(true);
    try {
        for (const m of unpaidMembers) {
            const existing = cotisations.find(c => c.membre_id === m.id && c.mois_numero === currentMonth);
            if (existing) {
                await supabase.from('cotisations').update({ statut: 'Payé' }).eq('id', existing.id);
            } else {
                await supabase.from('cotisations').insert([{ tontine_id: tontine.id, membre_id: m.id, mois_numero: currentMonth, montant: tontine?.montant_mensuel || 0, statut: 'Payé' }]);
            }
        }
        
        const { data: freshCots } = await supabase.from('cotisations').select('*').eq('tontine_id', tontine.id);
        if (freshCots) setCotisations(freshCots);
        
        setShowConfetti(true);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 8000);
            const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
            audio.volume = 0.5;
            audio.play().catch(()=>{});
    } catch (err: any) {
        alert("Erreur lors de la validation: " + err.message);
    } finally {
        setIsSaving(false);
    }
  };

  // --- GÉNÉRATION DE REÇUS (PDF & ZIP) ---
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
          doc.addImage(img, 'PNG', 65, 34, 80, 80); // Centré en fond
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
    
    const nextMonthNumber = currentMonth < (tontine?.duree_mois || 10) ? currentMonth + 1 : null;
    if (nextMonthNumber) {
       doc.setFontSize(12);
       doc.setFont("helvetica", "bold");
       doc.setTextColor(220, 38, 38);
       doc.text(`⚠️ PROCHAINE COTISATION : Avant le ${tontine?.date_limite_paiement || 5} du Mois ${nextMonthNumber}`, 20, 135);
    }
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(150, 150, 150);
    doc.text("Généré de manière sécurisée par Onyx Tontine", 20, nextMonthNumber ? 145 : 140);
    return doc;
  };

  const handleDownloadReceipt = async (member: any) => {
    const cot = cotisations.find(c => c.membre_id === member.id && c.mois_numero === currentMonth && c.statut === 'Payé');
    if (!cot) return;
    const doc = await createReceiptPDF(member, cot);
    doc.save(`Recu_${member.prenom_nom.replace(/\s+/g, '_')}_Mois_${currentMonth}.pdf`);
  };

  const handleDownloadMemberHistory = (member: any) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`Historique des Transactions`, 14, 22);
    doc.setFontSize(14);
    doc.text(`Membre : ${member.prenom_nom}`, 14, 30);
    doc.setFontSize(11);
    doc.text(`Tontine : ${tontine?.nom}`, 14, 38);

    const tableColumn = ["Mois", "Montant", "Statut", "Date de paiement"];
    const tableRows: any[] = [];

    for (let i = 1; i <= currentMonth; i++) {
      const cot = cotisations.find(c => c.membre_id === member.id && c.mois_numero === i && c.statut === 'Payé');
      tableRows.push([
        `Mois ${i}`,
        `${tontine?.montant_mensuel || 0} F CFA`,
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

    doc.save(`Historique_${member.prenom_nom.replace(/\s+/g, '_')}.pdf`);
  };

  const handleShareReceiptWhatsApp = async (member: any, cot: any) => {
     if (!cot) return;
     try {
        const doc = await createReceiptPDF(member, cot);
        const fileName = `Recu_${member.prenom_nom.replace(/\s+/g, '_')}_Mois_${currentMonth}.pdf`;
        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        
        const message = `Bonjour ${member.prenom_nom}, voici votre reçu de paiement pour la tontine "${tontine?.nom}" (Mois ${currentMonth}).`;

        // Sur Mobile : Partage natif direct vers WhatsApp avec la pièce jointe
        if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
                files: [file],
                title: 'Reçu de paiement',
                text: message
            });
        } else {
            // Sur PC : Téléchargement du fichier + Ouverture de Web WhatsApp
            doc.save(fileName);
            window.open(`https://wa.me/221${member.telephone}?text=${encodeURIComponent(message)}`, '_blank');
        }
     } catch (e) {
        console.log("Erreur lors du partage :", e);
     }
  };

  const handleDownloadAllReceiptsZIP = async () => {
    const paidMembers = membres.filter(m => cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé'));
    if (paidMembers.length === 0) return alert("Aucun paiement enregistré pour ce mois.");
    
    try {
        const JSZipModule = await import('jszip');
        const JSZip = JSZipModule.default || JSZipModule;
        const zip = new JSZip();
        
        for (const m of paidMembers) {
             const cot = cotisations.find(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
             if (cot) {
                 const doc = await createReceiptPDF(m, cot);
                 zip.file(`Recu_${m.prenom_nom.replace(/\s+/g, '_')}_Mois_${currentMonth}.pdf`, doc.output('blob'));
             }
        }
        
        const content = await zip.generateAsync({ type: 'blob' });
        const url = window.URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Recus_Tontine_${tontine?.nom?.replace(/\s+/g, '_')}_Mois_${currentMonth}.zip`;
        a.click();
        window.URL.revokeObjectURL(url);
    } catch (err) {
        alert("Erreur lors de la génération du ZIP. Avez-vous exécuté 'npm install jszip' ?");
    }
  };

  const handleExportPDF = async () => {
    const doc = new jsPDF();

    // Titre du document
    doc.setFontSize(20);
    doc.text(`Liste des Membres - ${tontine?.nom || 'Tontine'}`, 14, 22);

    doc.setFontSize(11);
    doc.text(`Mois en cours : ${currentMonth} | Caisse : ${actuelCaisse} / ${caisseMensuelle} F CFA`, 14, 30);

    // Préparation des données pour le tableau
    const tableColumn = ["Nom & Prénom", "Téléphone", "Statut Tirage", "Paiement (Mois " + currentMonth + ")"];
    const tableRows = membres.map(m => {
      const hasPaid = cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
      return [
        m.prenom_nom,
        m.telephone,
        m.a_gagne ? "A gagné" : "En attente",
        hasPaid ? "Payé" : "À Payer"
      ];
    });

    // Génération du tableau
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    const fileName = `Tontine_${tontine?.nom?.replace(/\s+/g, '_')}_Mois_${currentMonth}.pdf`;

    // Tentative de partage direct (très efficace sur mobile pour WhatsApp)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        const pdfBlob = doc.output('blob');
        const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: `Bilan Tontine - Mois ${currentMonth}`,
            text: `📊 *Bilan du mois ${currentMonth}* pour la tontine "${tontine?.nom}".\nVoici le fichier PDF avec l'état des cotisations :`
          });
          return; // Si le partage réussit, on arrête la fonction ici
        }
      } catch (err) {
        console.log("Partage direct ignoré ou annulé", err);
      }
    }

    // Téléchargement automatique classique (sur PC ou si le partage échoue)
    doc.save(fileName);
  };

  const handleExportExcel = () => {
    if (!tontine || cotisations.length === 0) {
      alert("Aucune transaction à exporter pour le moment.");
      return;
    }

    // Préparation des données formatées pour Excel
    const dataToExport = cotisations
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .map(cot => {
        const member = membres.find(m => m.id === cot.membre_id);
        return {
          "N° Reçu": `REC-${cot.id.substring(0, 6)}`,
          "Date de Paiement": cot.created_at ? new Date(cot.created_at).toLocaleString('fr-FR') : '-',
          "Membre (Prénom & Nom)": member?.prenom_nom || "Inconnu",
          "Téléphone": member?.telephone || "-",
          "Mois Concerné": `Mois ${cot.mois_numero}`,
          "Montant (F CFA)": cot.montant || tontine.montant_mensuel || 0,
          "Statut": cot.statut
        };
      });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Comptabilité Tontine");
    XLSX.writeFile(workbook, `Comptabilite_${tontine?.nom?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
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
  }).sort((a, b) => {
    const aSignaled = cotisations.some(c => c.membre_id === a.id && c.mois_numero === currentMonth && c.a_signale_paiement && c.statut !== 'Payé') ? 1 : 0;
    const bSignaled = cotisations.some(c => c.membre_id === b.id && c.mois_numero === currentMonth && c.a_signale_paiement && c.statut !== 'Payé') ? 1 : 0;
    return bSignaled - aSignaled; // Les signalés apparaissent en premier
  });

  const dueDate = tontine?.date_limite_paiement || 5; // Date limite de paiement dynamique
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

  const hasRetardataires = membres.some(m => !cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé'));

  const yAxisFormatter = (value: number) => `${(value / 1000)}k`;
  
  const lastWinners = membres.filter(m => m.a_gagne).sort((a, b) => (b.mois_victoire || 0) - (a.mois_victoire || 0)).slice(0, 2);
  const winnerNames = lastWinners.map(w => w.prenom_nom).join(" et ") || "les heureuses gagnantes";
  const promoGagnantesPrompt = `Affiche verticale format 9:16, style luxueux, moderne et néon cyberpunk. Fond noir profond avec des accents vert néon (code #39FF14). Texte principal en 3D brillant au centre : "FÉLICITATIONS". En dessous, texte plus petit mais très lisible : "${winnerNames}". Date : "${new Date().toLocaleDateString('fr-FR')}". Atmosphère festive avec des particules dorées et vertes flottantes, quelques billets de banque stylisés ou pièces d'or subtiles. Éclairage dramatique, qualité photoréaliste, 8k.`;
  
  const promoProchainPrompt = `Affiche verticale format 9:16, style mystérieux, élégant et high-tech. Fond noir onyx texturé avec des halos de lumière vert néon (#39FF14). Au centre, une urne ou une boîte de tirage lumineuse stylisée. Texte principal 3D massif et percutant : "PROCHAIN TIRAGE". En dessous, un texte clair : "Date : ${promoDateTirage || '[Date]'} | Lieu : ${promoLieuTirage || '[Lieu]'}". Ambiance de suspense, étincelles lumineuses, reflets premium, qualité photoréaliste, 8k.`;



  return (
    <div className="min-h-screen bg-zinc-50 font-sans pb-24 text-black relative">
      <InteractiveParticles themeColor={tontine?.theme_color || '#39FF14'} />
      
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
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-2 flex flex-wrap items-center gap-3`}>
                  {isEditingName ? (
                      <div className="flex items-center gap-2">
                          <input 
                              type="text" 
                              value={editNameValue} 
                              onChange={(e) => setEditNameValue(e.target.value)} 
                              className="bg-zinc-100 border border-zinc-300 rounded-lg px-3 py-1 text-2xl font-black uppercase outline-none focus:border-black"
                              autoFocus
                          />
                          <button onClick={handleUpdateTontineName} disabled={isSaving} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition">
                              <CheckCircle size={18} />
                          </button>
                          <button onClick={() => setIsEditingName(false)} disabled={isSaving} className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition">
                              <X size={18} />
                          </button>
                      </div>
                  ) : (
                      <>
                          {tontine?.nom || "Ma Tontine"}
                          <button onClick={() => { setEditNameValue(tontine?.nom || ""); setIsEditingName(true); }} className="p-1.5 text-zinc-400 hover:text-black transition-colors rounded-full hover:bg-zinc-100">
                              <Pencil size={18} />
                          </button>
                      </>
                  )}
                  {!isEditingName && (
                    <button onClick={openSettingsModal} className="p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-colors text-zinc-500">
                        <Settings size={18} />
                    </button>
                  )}
               </h2>
               <p className="text-sm text-zinc-500 font-bold flex items-center gap-2">
                 <Wallet size={16}/> Montant mensuel : {(tontine?.montant_mensuel || 0).toLocaleString()} F CFA
               </p>
            </div>
         </div>

         {/* CONFIGURATION DU TOUR DE RÔLE */}
         <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200">
            <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl mb-6 flex items-center gap-3`}>
                <Wand2 size={20} style={{ color: tontine?.theme_color || '#39FF14' }} /> 
                Configuration du Tour de Rôle
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <p className="text-sm font-bold text-zinc-500 uppercase mb-2">Membre actuellement désigné</p>
                    {currentDrawConfig ? (
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 relative">
                            <button onClick={handleCancelDesignation} className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors" title="Annuler la désignation">
                                <X size={20} />
                            </button>
                            <p className="font-black text-lg pr-8">{membres.find(m => m.id === currentDrawConfig.membre_id)?.prenom_nom || "Inconnu"}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="text-xs font-bold text-zinc-500">Date prévue :</span>
                                <input 
                                    type="date" 
                                    value={currentDrawConfig.date_tirage_prevue} 
                                    onChange={(e) => handleUpdateDrawDate(e.target.value)}
                                    className="text-xs font-bold p-1.5 border border-zinc-200 rounded bg-white outline-none cursor-pointer hover:border-black transition-colors"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-zinc-500 italic text-sm">
                            Aucune personne désignée pour le moment.
                        </div>
                    )}
                </div>
                
                <div>
                    <p className="text-sm font-bold text-zinc-500 uppercase mb-2">Sélectionner la personne du mois prochain</p>
                    <div className="flex flex-col gap-3">
                        <select 
                            value={designatedMemberId} 
                            onChange={(e) => setDesignatedMemberId(e.target.value)}
                            className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl font-bold text-sm outline-none transition cursor-pointer appearance-none"
                        >
                            <option value="">-- Choisir un membre éligible --</option>
                            {membres.filter(m => !m.a_gagne).map(m => (
                                <option key={m.id} value={m.id}>{m.prenom_nom}</option>
                            ))}
                        </select>
                        <button 
                            onClick={handleDesignateNextDrawPerson}
                            disabled={isSaving || !designatedMemberId}
                            className="px-6 py-4 rounded-xl font-black uppercase text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ backgroundColor: tontine?.theme_color || '#39FF14', color: '#000' }}
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle size={16}/>}
                            Désigner
                        </button>
                    </div>
                </div>
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
                     <div className="flex flex-wrap justify-center gap-4 mt-8">
                        <button onClick={() => setRecentWinners([])} className="bg-zinc-800 text-white px-6 py-3 rounded-full text-xs font-bold uppercase hover:bg-zinc-700 transition">Fermer</button>
                        <button onClick={handleShareDrawGroup} className="bg-[#39FF14] text-black px-6 py-3 rounded-full text-xs font-black uppercase hover:scale-105 transition flex items-center gap-2 shadow-[0_0_15px_rgba(57,255,20,0.4)]"><Share2 size={16}/> Partager dans le groupe</button>
                     </div>
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

         <div className="grid md:grid-cols-2 gap-6">
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
               <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{membres.length - cotisationsCeMois.length} membre(s) restant(s)</span>
                  <span className="text-xs font-black text-zinc-400">{Math.round(progressPercentage)}%</span>
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-200 flex flex-col justify-center">
               <div className="flex items-center gap-3 mb-6">
                   <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl"><Trophy size={20}/></div>
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg`}>Meilleurs Payeurs (Mois {currentMonth})</h3>
               </div>
               {topPayers.length > 0 ? (
                  <>
                     <div className="space-y-3">
                     {topPayers.map((payer: any, idx: number) => (
                        <div key={payer.id} className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-100">
                           <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-sm ${idx === 0 ? 'bg-yellow-400 text-white border-2 border-yellow-200' : idx === 1 ? 'bg-zinc-300 text-zinc-700 border-2 border-zinc-200' : 'bg-orange-300 text-white border-2 border-orange-200'}`}>
                                 #{idx + 1}
                              </div>
                              <div>
                                 <p className="font-bold text-sm text-black">{payer.prenom_nom}</p>
                                 <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{new Date(payer.paymentDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                           </div>
                           <div className="px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shadow-sm" style={{ backgroundColor: tontine?.theme_color || '#39FF14', color: '#000' }}>
                              Payé
                           </div>
                        </div>
                     ))}
                     </div>
                     <button onClick={handleFeliciterPodium} className="w-full mt-4 bg-yellow-100 text-yellow-700 py-3 rounded-xl font-black uppercase text-xs hover:bg-yellow-400 hover:text-black transition shadow-sm flex items-center justify-center gap-2">
                        <Share2 size={16}/> Féliciter dans le groupe
                     </button>
                  </>
               ) : (
                  <div className="flex flex-col items-center justify-center py-4 opacity-50">
                      <Trophy size={32} className="text-zinc-300 mb-2"/>
                      <p className="text-sm font-bold text-zinc-500 text-center">Aucun paiement enregistré pour ce mois.</p>
                  </div>
               )}
            </div>
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
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-black rounded-xl text-[#39FF14]"><Sparkles size={20}/></div>
                <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl`}>Communication Visuelle (IA)</h3>
            </div>
            <p className="text-sm font-bold text-zinc-500 mb-6">Générez des prompts optimisés pour Midjourney ou DALL-E afin de créer vos affiches de tontine.</p>
            <div className="grid md:grid-cols-2 gap-6">
                <button onClick={() => setShowPromoModal('gagnantes')} className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-[#39FF14] transition-all hover:shadow-[0_0_30px_rgba(57,255,20,0.15)]">
                   <Trophy size={40} className="text-[#39FF14] mb-4 group-hover:scale-110 transition-transform"/>
                   <span className="font-black text-white uppercase tracking-widest">Affiche Gagnantes</span>
                   <span className="text-[10px] font-bold text-zinc-400 mt-2 uppercase">Générer le prompt</span>
                </button>
                <button onClick={() => setShowPromoModal('prochain')} className="bg-zinc-900 border-2 border-zinc-800 p-8 rounded-3xl flex flex-col items-center justify-center text-center group hover:border-[#39FF14] transition-all hover:shadow-[0_0_30px_rgba(57,255,20,0.15)]">
                   <Calendar size={40} className="text-[#39FF14] mb-4 group-hover:scale-110 transition-transform"/>
                   <span className="font-black text-white uppercase tracking-widest">Prochain Tirage</span>
                   <span className="text-[10px] font-bold text-zinc-400 mt-2 uppercase">Générer le prompt</span>
                </button>
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
                 {hasRetardataires && (
                   <>
                     <button onClick={handleGroupReminder} className="bg-green-50 text-green-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-green-100 transition-colors border border-green-200">
                        <MessageCircle size={16}/> Rappel Groupe
                     </button>
                     <button onClick={handleMarkAllPaid} disabled={isSaving} className="bg-green-100 text-green-700 px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-green-200 transition-colors border border-green-300 disabled:opacity-50">
                        <CheckCircle size={16}/> Tous Payés
                     </button>
                   </>
                 )}
                 <button onClick={handleCopySummary} className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-blue-100 transition-colors border border-blue-200">
                    <ClipboardList size={16}/> Copier Récap'
                 </button>
                 <button onClick={handleResetTontine} className="bg-red-50 text-red-600 px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-red-100 transition-colors border border-red-200">
                    <RotateCcw size={16}/> Réinitialiser
                 </button>
                 <button onClick={handleExportPDF} className="bg-zinc-100 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-zinc-200 transition-colors border border-zinc-200">
                    <FileText size={16}/> Export PDF
                 </button>
                 <button onClick={handleExportExcel} className="bg-zinc-100 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-zinc-200 transition-colors border border-zinc-200">
                    <Download size={16}/> Export Excel
                 </button>
                 <button onClick={handleDownloadAllReceiptsZIP} className="bg-zinc-100 text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase flex items-center gap-2 hover:bg-zinc-200 transition-colors border border-zinc-200">
                    <Archive size={16}/> Reçus (ZIP)
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
                  const currentCotisation = cotisations.find(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === 'Payé');
                  const hasPaid = !!currentCotisation;
                  const hasSignaled = !hasPaid && cotisations.some(c => c.membre_id === m.id && c.mois_numero === currentMonth && c.a_signale_paiement && c.statut !== 'Payé');
                  const memberCotisations = cotisations.filter(c => c.membre_id === m.id && c.statut === 'Payé');
                  const lastPayment = memberCotisations.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())[0];
                  const lastPaymentDate = lastPayment?.created_at ? new Date(lastPayment.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) : '-';
                  
                  const isLate = !hasPaid && today.getDate() > dueDate;
                  const waMessage = isLate 
                      ? `Bonjour ${m.prenom_nom}, rappel pour la tontine "${tontine?.nom}". Votre cotisation de ${(tontine?.montant_mensuel || 0).toLocaleString()} F est en retard. Merci de régulariser dès que possible.`
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
                              ) : m.mois_exclus && m.mois_exclus.split(',').map((s: string) => parseInt(s.trim())).includes(currentMonth) ? (
                                 <span className="font-black text-red-600">Exclu (Mois {currentMonth})</span>
                              ) : (
                                 <div className="flex items-center gap-1.5">
                                    <span className="font-black text-zinc-600">En Attente</span>
                                    {currentDrawConfig?.membre_id === m.id && (
                                       <span title="Désigné pour le tirage" className="bg-black text-[#39FF14] p-1 rounded-md"><Wand2 size={10} /></span>
                                    )}
                                 </div>
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
                                 <div className="flex items-center gap-2">
                                   <button onClick={() => togglePaymentStatus(m, hasPaid)} disabled={isSaving} className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 hover:bg-green-200 transition disabled:opacity-50" title="Marquer comme Non Payé"><CheckCircle size={12}/> Payé</button>
                                   {currentCotisation?.recu_url && (
                                     <a href={currentCotisation.recu_url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-zinc-100 text-zinc-600 rounded-full hover:bg-zinc-200 transition" title="Voir le reçu">
                                       <Eye size={12} />
                                     </a>
                                   )}
                                               <button onClick={() => handleDownloadReceipt(m)} className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition" title="Télécharger le reçu PDF">
                                     <Download size={12} />
                                   </button>
                                   <button onClick={() => handleShareReceiptWhatsApp(m, currentCotisation)} className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition" title="Envoyer par WhatsApp">
                                     <Send size={12} />
                                   </button>
                                 </div>
                              ) : hasSignaled ? (
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex flex-col items-start">
                                       <button onClick={() => togglePaymentStatus(m, hasPaid)} disabled={isSaving} className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 hover:bg-blue-100 transition disabled:opacity-50 shadow-sm" title="Valider le paiement signalé"><Clock size={12} className="animate-pulse"/> Signalé</button>
                                       {isLate && <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">(En retard)</span>}
                                    </div>
                                    <a href={`https://wa.me/221${m.telephone}?text=${encodeURIComponent(waMessage)}`} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition" title="Contacter sur WhatsApp">
                                       <MessageCircle size={14}/>
                                    </a>
                                 </div>
                              ) : (
                                 <div className="flex items-center justify-between w-full">
                                    <div className="flex flex-col items-start">
                                       <button onClick={() => togglePaymentStatus(m, hasPaid)} disabled={isSaving} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 hover:bg-red-100 transition disabled:opacity-50" title="Marquer comme Payé"><AlertCircle size={12}/> À Payer</button>
                                       {isLate && (
                                             <span className="text-[10px] font-bold text-red-500 mt-1 ml-1">(En retard)</span>
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
                           {!m.a_gagne && currentDrawConfig?.membre_id !== m.id && (
                              <button onClick={() => handleDesignateMember(m.id)} className="px-3 py-2 bg-zinc-100 text-black rounded-lg hover:bg-black hover:text-[#39FF14] transition flex items-center gap-1 text-[10px] font-black uppercase" title="Désigner pour le tirage"><Wand2 size={14}/> Désigner</button>
                           )}
                           {currentDrawConfig?.membre_id === m.id && (
                              <button onClick={handleCancelDesignation} className="px-3 py-2 bg-black text-[#39FF14] rounded-lg hover:bg-red-500 hover:text-white transition flex items-center gap-1 text-[10px] font-black uppercase shadow-lg" title="Annuler la désignation"><X size={14}/> Annuler</button>
                           )}
                           <button onClick={() => handleDownloadMemberHistory(m)} className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition" title="Télécharger l'historique"><History size={14}/></button>
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
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Photo de Profil (URL ou Fichier Max 1Mo)</label>
                <div className="flex gap-2 items-center">
                  <input type="url" value={memberForm.photo_url} onChange={e => setMemberForm({...memberForm, photo_url: e.target.value})} className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="https://..." />
                  <span className="text-xs font-bold text-zinc-400">OU</span>
                  <label className="bg-zinc-100 p-4 rounded-2xl cursor-pointer hover:bg-zinc-200 transition flex items-center justify-center gap-2">
                     {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                     <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                           setUploadingImage(true);
                           const url = await uploadFileToSupabase(file, 'avatars');
                           setMemberForm({...memberForm, photo_url: url});
                        } catch (err: any) { alert(err.message); } finally { setUploadingImage(false); }
                     }} />
                  </label>
                </div>
              </div>
              <div className="col-span-full">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Poste / Rôle (Optionnel)</label>
                <div className="relative">
                   <Briefcase size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                   <input type="text" value={memberForm.poste} onChange={e => setMemberForm({...memberForm, poste: e.target.value})} className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="Ex: Trésorier, Comptable, Grande Sœur..." />
                </div>
              </div>
              <div className="col-span-full">
                 <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Exclure des tirages (Mois spécifiques - Optionnel)</label>
                 <div className="relative">
                    <Shuffle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input type="text" value={memberForm.mois_exclus} onChange={e => setMemberForm({...memberForm, mois_exclus: e.target.value})} className="w-full p-4 pl-12 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="Ex: 1, 3, 5 (Laissez vide sinon)" />
                 </div>
                 <p className="text-[9px] font-bold text-zinc-400 mt-1 ml-2">Séparez les mois par des virgules pour empêcher ce membre d'être tiré au sort ces mois-là.</p>
              </div>
              
              <div className="col-span-full bg-zinc-50 p-4 rounded-2xl border border-zinc-200 flex items-center justify-between">
                 <div>
                    <p className="text-xs font-black uppercase text-black">Co-Gérant</p>
                    <p className="text-[10px] font-bold text-zinc-500">Donner les droits d'administration (Max 2 co-gérants)</p>
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
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">URL personnalisée de la tontine</label>
                <div className="flex items-center bg-zinc-50 border border-zinc-200 rounded-2xl overflow-hidden focus-within:border-black transition">
                  <span className="bg-zinc-100 text-zinc-500 px-4 py-4 font-bold text-sm border-r border-zinc-200 hidden sm:block">onyxlinks.com/tontine/</span>
                  <input type="text" required value={settingsForm.slug} onChange={e => setSettingsForm({...settingsForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full p-4 bg-transparent font-bold text-sm outline-none text-black" />
                </div>
                <p className="text-[9px] font-bold text-orange-500 mt-1.5 ml-2">⚠️ Attention : changer ce lien rendra l'ancien lien WhatsApp invalide.</p>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Couleur du Thème</label>
                <div className="flex gap-3 items-center">
                   <input type="color" required value={settingsForm.theme_color} onChange={e => setSettingsForm({...settingsForm, theme_color: e.target.value})} className="w-14 h-14 rounded-2xl cursor-pointer border-0 p-0" />
                   <input type="text" required value={settingsForm.theme_color} onChange={e => setSettingsForm({...settingsForm, theme_color: e.target.value})} className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black uppercase" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Logo de la Tontine (URL ou Fichier Max 1Mo)</label>
                <div className="flex gap-2 items-center">
                  <input type="url" value={settingsForm.logo_url} onChange={e => setSettingsForm({...settingsForm, logo_url: e.target.value})} className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="https://..." />
                  <label className="bg-zinc-100 p-4 rounded-2xl cursor-pointer hover:bg-zinc-200 transition flex items-center justify-center gap-2">
                     {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                     <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                           setUploadingImage(true);
                           const url = await uploadFileToSupabase(file, 'logos');
                           setSettingsForm({...settingsForm, logo_url: url});
                        } catch (err: any) { alert(err.message); } finally { setUploadingImage(false); }
                     }} />
                  </label>
                </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Début</label>
                  <input type="date" value={settingsForm.date_debut} onChange={e => setSettingsForm({...settingsForm, date_debut: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Fin (calculée)</label>
                  <input type="text" disabled value={endDate} className="w-full p-4 bg-zinc-100 border border-zinc-200 rounded-2xl font-bold text-sm outline-none text-zinc-500" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Jour Limite</label>
                  <input type="number" min="1" max="31" required value={settingsForm.date_limite_paiement} onChange={e => setSettingsForm({...settingsForm, date_limite_paiement: parseInt(e.target.value)})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="Ex: 5" />
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

      {/* --- MODALE VALIDATION PAIEMENT --- */}
      {paymentModal && (
        <div id="payment-modal-overlay" onClick={(e: any) => e.target.id === 'payment-modal-overlay' && setPaymentModal(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-8 relative shadow-2xl animate-in zoom-in-95">
            <button onClick={() => setPaymentModal(null)} className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"><X size={20}/></button>
            <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase mb-2 text-black`}>Valider le paiement</h2>
            <p className="text-sm font-bold text-zinc-500 mb-6">Membre : <span className="text-black">{paymentModal.member.prenom_nom}</span></p>
            
            <div className="mb-6">
               <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-2 block">Joindre un reçu (Optionnel - Max 1Mo)</label>
               <input type="file" accept="image/*,application/pdf" onChange={(e) => setReceiptFile(e.target.files?.[0] || null)} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-xs font-bold" />
               {receiptFile && <p className="text-[10px] text-green-600 font-bold mt-2 ml-2 flex items-center gap-1"><CheckCircle size={12}/> Fichier sélectionné : {receiptFile.name}</p>}
            </div>

            <button onClick={confirmPayment} disabled={isSaving} className="w-full bg-black py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50" style={{ color: tontine?.theme_color || '#39FF14' }}>
               {isSaving ? <Loader2 size={18} className="animate-spin"/> : <CheckCircle size={18}/>}
               {isSaving ? "Validation..." : "Confirmer le paiement"}
            </button>
          </div>
        </div>
      )}

      {/* --- MODALE PROMPT IA --- */}
      {showPromoModal && (
        <div id="promo-modal-overlay" onClick={(e: any) => { if (e.target.id === 'promo-modal-overlay') { setShowPromoModal(null); setGeneratedImageUrl(null); } }} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-8 relative shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={() => { setShowPromoModal(null); setGeneratedImageUrl(null); }} className="absolute top-6 right-6 text-zinc-400 hover:text-black transition-colors"><X size={20}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-2 text-black flex items-center gap-2`}>
              <Wand2 size={24} className="text-[#39FF14] bg-black p-1.5 rounded-xl" /> 
              {showPromoModal === 'gagnantes' ? 'Affiche Gagnantes' : 'Prochain Tirage'}
            </h2>
            <p className="text-sm font-bold text-zinc-500 mb-6">Copiez ce prompt dans Midjourney, DALL-E ou Canva pour générer votre visuel.</p>

            {showPromoModal === 'prochain' && (
               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Date & Heure</label>
                    <input type="text" value={promoDateTirage} onChange={e => setPromoDateTirage(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="Ex: 5 Novembre à 20h" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-1 block">Lieu</label>
                    <input type="text" value={promoLieuTirage} onChange={e => setPromoLieuTirage(e.target.value)} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none focus:border-black transition text-black" placeholder="Ex: Groupe WhatsApp" />
                  </div>
               </div>
            )}

            <div className="relative mb-4">
               <textarea 
                  readOnly 
                  value={showPromoModal === 'gagnantes' ? promoGagnantesPrompt : promoProchainPrompt} 
                  className="w-full h-40 p-4 bg-zinc-900 text-[#39FF14] border border-zinc-800 rounded-2xl font-mono text-sm outline-none resize-none leading-relaxed custom-scrollbar"
               />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
               <button onClick={() => handleCopyPromo(showPromoModal === 'gagnantes' ? promoGagnantesPrompt : promoProchainPrompt)} className={`flex-1 py-3 rounded-xl text-xs font-black uppercase transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${promoCopied ? 'bg-green-500 text-white scale-105 shadow-green-500/20' : 'bg-[#39FF14] text-black hover:scale-105 shadow-[#39FF14]/20'}`}>
                  {promoCopied ? <CheckCircle size={16} className="animate-bounce" /> : <Copy size={16}/>}
                  {promoCopied ? 'Prompt Copié !' : 'Copier le Prompt'}
               </button>
               <button onClick={() => handleGenerateImage(showPromoModal === 'gagnantes' ? promoGagnantesPrompt : promoProchainPrompt)} disabled={isGeneratingImage} className="flex-1 bg-black text-[#39FF14] py-3 rounded-xl text-xs font-black uppercase hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:hover:scale-100">
                  {isGeneratingImage ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16}/>}
                  {isGeneratingImage ? 'Génération...' : 'Générer (DALL-E 3)'}
               </button>
            </div>

            {generatedImageUrl && (
               <div className="mt-6 border border-zinc-200 rounded-2xl p-2 bg-zinc-50 animate-in zoom-in-95 duration-500">
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-2 mb-2">Résultat IA</p>
                  <img src={generatedImageUrl} alt="Affiche Générée" className="w-full h-auto rounded-xl shadow-sm mb-2" />
                  <a href={generatedImageUrl} download target="_blank" rel="noopener noreferrer" className="w-full bg-zinc-200 text-black py-3 rounded-xl text-xs font-black uppercase hover:bg-zinc-300 transition-all flex items-center justify-center gap-2">
                     <Download size={14}/> Télécharger l'Affiche
                  </a>
               </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
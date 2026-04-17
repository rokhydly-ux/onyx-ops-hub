"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { 
  ArrowLeft, 
  Phone, 
  MessageSquare, 
  Mail, 
  FileText, 
  Activity, 
  PhoneCall, 
  Zap, 
  CheckCircle,
  Wallet,
  Tag,
  Calendar,
  Loader2,
  Trophy,
  Send,
  UserCheck,
  Download
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function LeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteText, setNoteText] = useState("");
  const [tenantId, setTenantId] = useState<string>("");
  const [localNotes, setLocalNotes] = useState<any[]>([]);
  const [commercials, setCommercials] = useState<any[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    const fetchLeadAndNotes = async () => {
      if (!leadId) return;
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const tId = user.user_metadata?.tenant_id || user.id;
      setTenantId(tId);

      const { data: leadData, error: leadError } = await supabase
        .from('crm_leads')
        .select('*')
        .eq('id', leadId)
        .eq('tenant_id', tId)
        .single();
        
      if (leadData && !leadError) {
        setLead(leadData);
        setSelectedAssignee(leadData.assigned_to || "");
      }

      const { data: notesData } = await supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (notesData) {
        setLocalNotes(notesData);
      }

      const { data: commsData } = await supabase
        .from('commercials')
        .select('*')
        .eq('tenant_id', tId)
        .eq('status', 'Actif');
      if (commsData) {
        setCommercials(commsData);
      }

      setIsLoading(false);
    };

    fetchLeadAndNotes();
  }, [leadId]);

  // --- CONVERSION EN CLIENT (GAGNÉ) ---
  const handleWinLead = async () => {
    if (!confirm("Félicitations ! Voulez-vous transformer ce Lead en Client officiel ?")) return;
    
    try {
      // 1. Mettre à jour le statut du lead
      await supabase.from('crm_leads').update({ status: 'Gagné' }).eq('id', leadId).eq('tenant_id', tenantId);
      
      // 2. Insérer dans la table des clients
      await supabase.from('crm_contacts').insert([{
        tenant_id: tenantId,
        full_name: lead.full_name,
        phone: lead.phone,
        type: 'Client',
        status: 'Converti depuis le CRM',
        source: lead.source || 'CRM',
        activity: lead.intent,
        assigned_to: lead.assigned_to
      }]);
      
      alert("Lead converti avec succès ! Il est maintenant dans votre base Clients.");
      setLead({ ...lead, status: 'Gagné' });
      
    } catch (error: any) {
      alert("Erreur lors de la conversion : " + error.message);
    }
  };

  // --- UPDATE CLOUD TEMPS RÉEL ---
  const handleUpdateField = async (field: string, value: any) => {
     setLead((prev: any) => ({ ...prev, [field]: value }));
     if (tenantId) {
         await supabase.from('crm_leads').update({ [field]: value }).eq('id', leadId).eq('tenant_id', tenantId);
     }
  };

  // --- IA : GÉNÉRATION PROCHAINE ACTION ---
  const generateNextAction = () => {
     const obs = (lead.observation || '').toLowerCase();
     const score = lead.lead_score || 'Froid';
     let action = "💬 Envoyer un message de relance classique";

     if (score === 'Chaud' && (obs.includes('visite') || obs.includes('rdv') || obs.includes('rencontre') || obs.includes('voir'))) {
        action = "📅 Programmer un RDV physique";
     } else if (score === 'Chaud' && obs.includes('devis')) {
        action = "📄 Préparer et envoyer le devis final";
     } else if (score === 'Tiède' && (obs.includes('réfléchit') || obs.includes('plus tard'))) {
        action = "⏳ Programmer une relance à J+7";
     } else if (score === 'Froid') {
        action = "❄️ Ajouter à la campagne de Nurturing (Emailing)";
     }
     handleUpdateField('next_action', action);
  };

  // --- GESTION DES NOTES MANUELLES ---
  const handleAddNote = async () => {
    if (!noteText.trim() || !tenantId) return;
    
    // On s'assure d'utiliser le bon ID utilisateur pour la base de données
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase.from('lead_notes').insert([{
        lead_id: leadId,
        user_id: user?.id || tenantId,
        note: noteText.trim()
    }]).select();

    // On récupère le premier élément du tableau renvoyé
    if (!error && data && data.length > 0) {
        setLocalNotes([data[0], ...localNotes]);
        setNoteText("");
    } else {
        alert("Erreur lors de l'ajout de la note : " + (error?.message || "Vérifiez vos droits."));
    }
  };

  const handleWaAction = (msg: string) => {
    if (!lead?.phone) return alert("Numéro de téléphone introuvable.");
    const cleanPhone = lead.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // --- GESTION DES COULEURS DES AVATARS ---
  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-pink-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
    const index = (name || 'A').charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#39FF14]" />
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="flex flex-col h-full items-center justify-center gap-4 text-zinc-500">
        <Activity size={48} className="opacity-20" />
        <p className="font-bold">Lead introuvable ou supprimé.</p>
        <button onClick={() => router.push('/crm/leads')} className="text-[#39FF14] hover:underline">Retour au Kanban</button>
      </div>
    );
  }

  const avatarColor = getAvatarColor(lead.assigned_to || lead.full_name);

  const fullTimeline = localNotes.map((n: any) => {
      const isAssign = n.note.includes('assigné à');
      const isMove = n.note.includes('Déplacé de');
      return {
          id: n.id,
          type: 'note',
          title: isAssign ? 'Assignation' : isMove ? 'Changement de statut' : `Note par ${lead.assigned_to || 'Agent'}`,
          date: new Date(n.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          icon: isAssign ? UserCheck : isMove ? Activity : FileText,
          color: isAssign ? 'text-blue-500 dark:text-blue-400' : isMove ? 'text-[#39FF14]' : 'text-yellow-500',
          bg: isAssign ? 'bg-blue-500/10' : isMove ? 'bg-[#39FF14]/10' : 'bg-yellow-500/10',
          content: n.note
      };
  });

  const handleExportTimelinePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Dossier Prospect : ${lead.full_name}`, 14, 22);
    doc.setFontSize(11);
    doc.text(`Contact : ${lead.phone}`, 14, 30);
    doc.text(`Statut : ${lead.status}`, 14, 36);
    doc.text(`Score IA : ${lead.lead_score || 'Non défini'}`, 14, 42);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 48);

    doc.setFontSize(14);
    doc.text("Historique d'Activité", 14, 60);

    const tableRows = fullTimeline.map(item => [
      item.date,
      item.title,
      item.content || "Détail capturé lors de l'échange."
    ]);

    autoTable(doc, {
      head: [['Date', 'Action', 'Détails']],
      body: tableRows,
      startY: 65,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
    });

    doc.save(`Historique_${lead.full_name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleEmailTimelinePDF = async () => {
    const email = prompt("Veuillez entrer l'adresse e-mail du destinataire :");
    if (!email) return;

    setIsSendingEmail(true);
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text(`Dossier Prospect : ${lead.full_name}`, 14, 22);
      doc.setFontSize(11);
      doc.text(`Contact : ${lead.phone}`, 14, 30);
      doc.text(`Statut : ${lead.status}`, 14, 36);
      doc.text(`Score IA : ${lead.lead_score || 'Non défini'}`, 14, 42);
      doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 48);

      doc.setFontSize(14);
      doc.text("Historique d'Activité", 14, 60);

      const tableRows = fullTimeline.map((item: any) => [
        item.date,
        item.title,
        item.content || "Détail capturé lors de l'échange."
      ]);

      autoTable(doc, {
        head: [['Date', 'Action', 'Détails']],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
      });

      const pdfBlob = doc.output('blob');
      const fileName = `timeline_${lead.id}_${Date.now()}.pdf`;
      
      const { error: uploadError } = await supabase.storage.from('tontines').upload(fileName, pdfBlob, { contentType: 'application/pdf' });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('tontines').getPublicUrl(fileName);
      const fileUrl = urlData.publicUrl;

      const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              to: email,
              subject: `Historique du prospect : ${lead.full_name}`,
              text: `Bonjour, veuillez trouver ci-joint l'historique du prospect ${lead.full_name}. Lien: ${fileUrl}`,
              html: `<p>Bonjour,</p><p>Voici l'historique et la timeline d'activités pour le prospect <b>${lead.full_name}</b>.</p><p><a href="${fileUrl}" target="_blank"><b>Cliquez ici pour consulter le document PDF</b></a></p>`
          })
      });

      if (response.ok) alert("E-mail envoyé avec succès !");
      else alert("Erreur lors de l'envoi via l'API.");
    } catch (error: any) {
      alert("Erreur : " + error.message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      
      {/* --- EN-TÊTE --- */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.push('/crm/leads')} 
          className="p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Centre d'Engagement</h2>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Dossier Prospect : {lead.id.split('-')[0]}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        
        {/* ================= SECTION 1 : INFOS & ACTIONS RAPIDES ================= */}
        <div className="w-full lg:w-[400px] xl:w-[450px] shrink-0 space-y-6">
          
          {/* CARTE D'IDENTITÉ DU LEAD */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#39FF14]"></div>
            
            <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm text-black dark:text-white">
                    {lead.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                     <h3 className="font-black text-xl uppercase leading-tight line-clamp-1">{lead.full_name}</h3>
                     <p className="text-[#39FF14] font-black text-sm mt-1">{lead.phone}</p>
                  </div>
               </div>
               <div 
                 className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs shadow-sm border-2 border-white dark:border-zinc-950 ${avatarColor}`}
                 title={`Responsable: ${lead.assigned_to}`}
               >
                 {(lead.assigned_to || '?').charAt(0)}
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
               <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 flex items-center gap-1.5"><Activity size={12}/> Score IA</p>
                  <select value={lead.lead_score || 'Froid'} onChange={(e) => handleUpdateField('lead_score', e.target.value)} className={`w-full bg-transparent font-black text-sm outline-none cursor-pointer ${lead.lead_score === 'Chaud' ? 'text-red-500' : lead.lead_score === 'Tiède' ? 'text-orange-500' : 'text-blue-500'}`}>
                     <option value="Chaud" className="text-red-500">🔥 Chaud</option>
                     <option value="Tiède" className="text-orange-500">⚡ Tiède</option>
                     <option value="Froid" className="text-blue-500">❄️ Froid</option>
                  </select>
               </div>
               <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                  <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1 flex items-center gap-1.5"><Wallet size={12}/> Potentiel</p>
                  <div className="flex items-center">
                     <input type="number" placeholder="0" value={lead.budget || lead.amount || ''} onChange={(e) => handleUpdateField('budget', e.target.value)} onBlur={(e) => handleUpdateField('budget', e.target.value)} className="w-full bg-transparent font-black text-lg text-[#39FF14] outline-none placeholder:text-zinc-500" />
                     <span className="text-[10px] text-zinc-500 uppercase font-black">F</span>
                  </div>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
               <span className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl border ${
                 lead.status === 'Gagné' ? 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/20' : 
                 lead.status === 'Perdu' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border-transparent'
               }`}>
                 Statut: {lead.status}
               </span>
               <span className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest rounded-xl bg-zinc-50 dark:bg-zinc-900 truncate">
                 {lead.source || 'Site Web'}
               </span>
               {lead.status !== 'Gagné' && (
                 <button onClick={handleWinLead} className="ml-auto bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-[#39FF14]/30">
                   <Trophy size={14} /> Passer en Gagné
                 </button>
               )}
            </div>
          </div>

        {/* ASSIGNATION LEAD */}
        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm mt-6">
           <h3 className="font-black text-lg uppercase tracking-tighter mb-4 flex items-center gap-2">
              <UserCheck size={18} className="text-[#39FF14]"/> Assignation
           </h3>
           <div className="space-y-3">
              <select 
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl font-medium text-sm outline-none focus:border-[#39FF14] transition-colors cursor-pointer appearance-none"
              >
                 <option value="">-- Non assigné --</option>
                 {commercials.map(c => <option key={c.id} value={c.full_name}>{c.full_name}</option>)}
              </select>
              <button onClick={async () => {
                  if (tenantId) {
                      const { error } = await supabase.from('crm_leads').update({ assigned_to: selectedAssignee }).eq('id', leadId).eq('tenant_id', tenantId);
                      if (error) {
                          alert("Erreur de sauvegarde: " + error.message);
                      } else {
                          await supabase.from('lead_notes').insert([{ lead_id: leadId, user_id: tenantId, note: `Lead assigné à ${selectedAssignee || 'Personne'}` }]);
                          const { data: newNotes } = await supabase.from('lead_notes').select('*').eq('lead_id', leadId).order('created_at', { ascending: false });
                          if (newNotes) setLocalNotes(newNotes);
                          setLead(prev => ({...prev, assigned_to: selectedAssignee}));
                          alert("Assignation enregistrée avec succès !");
                      }
                  }
              }} className="w-full bg-black text-[#39FF14] py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-md hover:scale-[1.02] transition-transform flex items-center justify-center gap-2">
                 <CheckCircle size={16}/> Enregistrer l'assignation
              </button>
           </div>
        </div>

          {/* DOSSIER & INTELLIGENCE */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm">
             <h3 className="font-black text-lg uppercase tracking-tighter mb-4 flex items-center gap-2">
                <Activity size={18} className="text-[#39FF14]"/> Analyse Commerciale
             </h3>
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Observation / Réponse client</label>
                   <textarea value={lead.observation || ''} onChange={(e) => handleUpdateField('observation', e.target.value)} onBlur={(e) => handleUpdateField('observation', e.target.value)} placeholder="Le client souhaite visiter demain..." className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl font-medium text-sm outline-none focus:border-[#39FF14] transition-colors resize-none min-h-[80px]" />
                </div>
                <button onClick={generateNextAction} className="w-full bg-black text-[#39FF14] py-3 rounded-xl font-black uppercase text-[10px] tracking-widest shadow-md hover:scale-105 transition-transform flex items-center justify-center gap-2">
                   <Zap size={14}/> Générer l'action suivante (IA)
                </button>
                {lead.next_action && <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 p-3 rounded-xl text-xs font-bold text-black dark:text-white animate-in fade-in slide-in-from-top-2">{lead.next_action}</div>}
             </div>
          </div>

          {/* SÉQUENCE DE RELANCE (Plan d'Engagement) */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-6 shadow-sm">
             <h3 className="font-black text-lg uppercase tracking-tighter mb-2 flex items-center gap-2">
                <Zap size={18} className="text-[#39FF14]"/> Séquence de Relance
             </h3>
             <p className="text-xs font-bold text-zinc-500 mb-6">Actions rapides recommandées pour closer ce prospect.</p>

             <div className="space-y-3">
                <button 
                  onClick={() => handleWaAction(`Bonjour ${lead.full_name}, suite à votre demande concernant [${lead.intent}], voici notre offre détaillée : `)}
                  className="w-full bg-[#39FF14]/10 hover:bg-[#39FF14]/20 border border-[#39FF14]/30 text-[#39FF14] p-4 rounded-2xl flex flex-col items-start transition-colors group relative overflow-hidden"
                >
                   <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-[#39FF14] text-black rounded-xl group-hover:scale-110 transition-transform"><MessageSquare size={18}/></div>
                      <div className="text-left flex-1">
                         <p className="font-black text-sm uppercase text-black dark:text-white">J0 - Offre Initiale</p>
                         <p className="text-[10px] font-bold opacity-80 mt-0.5">Envoyer le premier contact structuré</p>
                      </div>
                   </div>
                </button>

                <button 
                  onClick={() => handleWaAction(`Bonjour ${lead.full_name}, je reviens vers vous. Avez-vous pu consulter notre catalogue PDF ? Avez-vous des questions ?`)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#39FF14] dark:hover:border-[#39FF14] p-4 rounded-2xl flex flex-col items-start transition-colors group"
                >
                   <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl group-hover:text-[#39FF14] transition-colors"><FileText size={18}/></div>
                      <div className="text-left flex-1">
                         <p className="font-black text-sm uppercase text-black dark:text-white">J+2 - Relance Catalogue</p>
                         <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Demander du feedback sur l'offre</p>
                      </div>
                   </div>
                </button>

                <button 
                  onClick={() => handleWaAction(`Bonjour ${lead.full_name}, notre offre expire bientôt. Souhaitez-vous en profiter avec une remise exceptionnelle aujourd'hui ?`)}
                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-[#39FF14] dark:hover:border-[#39FF14] p-4 rounded-2xl flex flex-col items-start transition-colors group"
                >
                   <div className="flex items-center gap-3 w-full">
                      <div className="p-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded-xl group-hover:text-[#39FF14] transition-colors"><Mail size={18}/></div>
                      <div className="text-left flex-1">
                         <p className="font-black text-sm uppercase text-black dark:text-white">J+7 - Dernière Relance (Promo)</p>
                         <p className="text-[10px] font-bold text-zinc-500 mt-0.5">Créer l'urgence pour clôturer</p>
                      </div>
                   </div>
                </button>
             </div>
          </div>

        </div>

        {/* ================= SECTION 2 : ACTIVITY TIMELINE ================= */}
        <div className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 md:p-10 shadow-sm w-full relative min-h-[600px]">
           <div className="flex items-center justify-between mb-8">
              <h3 className="font-black text-xl md:text-2xl uppercase tracking-tighter">Historique d'Activité</h3>
              <div className="flex items-center gap-3">
                 <button className="text-[10px] font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white transition flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <Calendar size={12}/> {fullTimeline.length} Actions
                 </button>
                 <button onClick={handleExportTimelinePDF} className="text-[10px] font-black uppercase text-black bg-[#39FF14] hover:scale-105 transition-transform flex items-center gap-1.5 px-4 py-2 rounded-lg shadow-md border border-[#39FF14]/50">
                    <Download size={14}/> Exporter PDF
                 </button>
                 <button onClick={handleEmailTimelinePDF} disabled={isSendingEmail} className="text-[10px] font-black uppercase text-white bg-blue-500 hover:scale-105 transition-transform flex items-center gap-1.5 px-4 py-2 rounded-lg shadow-md border border-blue-500/50 disabled:opacity-50">
                    {isSendingEmail ? <Loader2 size={14} className="animate-spin"/> : <Mail size={14}/>} Envoyer E-mail
                 </button>
              </div>
           </div>

           {/* ENCART AJOUT DE NOTE */}
           <div className="mb-10 bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col gap-3">
              <textarea 
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Consignez un appel, un détail ou une information importante sur ce lead..."
                className="w-full bg-transparent border-none outline-none resize-none text-sm font-medium text-black dark:text-white placeholder:text-zinc-400 min-h-[60px]"
              />
              <div className="flex justify-end border-t border-zinc-200 dark:border-zinc-800 pt-3">
                 <button onClick={handleAddNote} disabled={!noteText.trim()} className="bg-black text-white dark:bg-white dark:text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black dark:hover:bg-[#39FF14] dark:hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                   <Send size={14} /> Enregistrer Note
                 </button>
              </div>
           </div>

           <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800/80 ml-6 space-y-10 pb-6">
              {fullTimeline.map((item, index) => (
                 <div key={item.id} className="relative pl-10 group">
                    {/* Icône de la Timeline absolue sur la bordure */}
                    <div className={`absolute -left-[21px] top-1 w-10 h-10 rounded-full border-4 border-white dark:border-zinc-950 ${item.bg} ${item.color} flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform`}>
                       <item.icon size={16} />
                    </div>
                    
                    <div className="flex flex-col bg-zinc-50 dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800/60 hover:border-black dark:hover:border-zinc-700 transition-colors shadow-sm">
                       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                          <p className="font-bold text-sm text-black dark:text-white leading-snug">{item.title}</p>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md whitespace-nowrap shadow-sm">
                            {item.date}
                          </span>
                       </div>
                       {(item.type === 'note' && item.content) ? (
                         <p className="text-sm text-black dark:text-zinc-300 font-medium mt-2 border-l-2 border-yellow-500/50 pl-3">{item.content}</p>
                       ) : item.type === 'note' && (
                         <p className="text-xs text-zinc-500 font-medium italic mt-2 border-l-2 border-yellow-500/30 pl-3">Détail capturé lors de l'échange.</p>
                       )}
                    </div>
                 </div>
              ))}
               {fullTimeline.length === 0 && (
                  <div className="bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center -ml-6">
                     <p className="text-zinc-500 font-bold text-sm uppercase tracking-widest">Aucune activité enregistrée</p>
                  </div>
               )}
           </div>
        </div>

      </div>
    </div>
  );
}
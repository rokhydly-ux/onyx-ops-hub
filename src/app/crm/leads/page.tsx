"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Plus, Search, Phone, MessageSquare, Mail, 
  UploadCloud, Facebook, Activity, CheckCircle, Wallet, AlertTriangle,
  X, ShieldCheck, Zap, UserCheck, Edit, Trash2, Calendar
} from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter, useDraggable, useDroppable } from '@dnd-kit/core';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import Papa from 'papaparse';

const KANBAN_COLS = ['Nouveaux Leads', 'En Cours', 'Converti', 'Perdu'];

// --- COMPOSANTS DND-KIT (KANBAN) ---
function KanbanColumn({ col, leads, onCardClick, onScheduleClick, onMessageClick }: { col: string, leads: any[], onCardClick: (lead: any) => void, onScheduleClick: (lead: any) => void, onMessageClick: (lead: any) => void }) {
  const { isOver, setNodeRef } = useDroppable({ id: col });
  return (
    <div 
      ref={setNodeRef} 
      className={`bg-zinc-100/50 dark:bg-zinc-900/50 border ${isOver ? 'border-[#39FF14]' : 'border-zinc-200 dark:border-zinc-800'} rounded-[2rem] p-4 w-[320px] shrink-0 flex flex-col max-h-[75vh] transition-colors`}
    >
      <div className="flex justify-between items-center mb-4 px-2">
        <h3 className="font-black uppercase text-sm tracking-tight">{col}</h3>
        <span className="bg-black dark:bg-white text-[#39FF14] dark:text-black text-[10px] font-black px-2.5 py-1 rounded-lg">{leads.length}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
        {leads.map(lead => (
          <KanbanCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} onScheduleClick={() => onScheduleClick(lead)} onMessageClick={() => onMessageClick(lead)} />
        ))}
        
        {leads.length === 0 && (
          <div className="p-6 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Glisser ici</div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ lead, onClick, onScheduleClick, onMessageClick }: { lead: any, onClick: () => void, onScheduleClick: () => void, onMessageClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { status: lead.status || 'Nouveaux Leads' }
  });
  
  const isStagnant = (lead.status === 'Nouveaux Leads' || !lead.status) && lead.created_at && new Date(lead.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
  } : undefined;

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onPointerUp={onClick}
      className={`bg-white dark:bg-zinc-950 p-5 rounded-2xl shadow-sm border ${isStagnant ? 'border-red-500 hover:border-red-600 shadow-red-500/10' : 'border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-500'} transition-colors cursor-grab active:cursor-grabbing group relative`}
    >
      {lead.is_client && (
        <div className="absolute -top-2 -right-2 bg-[#39FF14] text-black text-[9px] font-black px-2 py-1 rounded-lg shadow-md flex items-center gap-1 z-10">
          <ShieldCheck size={10}/> CLIENT
        </div>
      )}
      
      {lead.source === 'Facebook Ads' && (
        <div className="absolute -top-2 -right-2 bg-[#1877F2] text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md flex items-center gap-1 z-10">
          <Facebook size={10}/> FB LEAD
        </div>
      )}

      {isStagnant && (
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md flex items-center gap-1 z-10 animate-pulse">
          <AlertTriangle size={10}/> +7 JOURS
        </div>
      )}

      <p className="font-black text-sm uppercase truncate pr-4">{lead.full_name}</p>
      <p className="text-[#39FF14] font-black text-xs mt-1">{lead.phone}</p>
      
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-md">{lead.intent || 'Contact'}</span>
          {lead.lead_score && (
            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md shadow-sm ${
              lead.lead_score === 'Chaud' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
              lead.lead_score === 'Tiède' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
              'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {lead.lead_score === 'Chaud' ? '🔥' : lead.lead_score === 'Tiède' ? '⚡' : '❄️'} {lead.lead_score}
            </span>
          )}
          {lead.assigned_to && (
            <span className="text-[9px] font-black text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md truncate max-w-[75px]" title={`Assigné à ${lead.assigned_to}`}>
              👤 {lead.assigned_to.split(' ')[0]}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onScheduleClick(); }} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-500 hover:text-[#39FF14]" title="📅 Planifier RDV"><Calendar size={12}/></button>
          <button onClick={(e) => { e.stopPropagation(); onMessageClick(); }} className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-500 hover:text-blue-500" title="💬 Message Perso"><MessageSquare size={12}/></button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsKanbanPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [commercials, setCommercials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [commercialId, setCommercialId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('admin');
  const [userName, setUserName] = useState<string>('');

  // Modal "Quick Entry"
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadNotes, setLeadNotes] = useState<any[]>([]);

  // Odoo Sync State
  const [odooOrders, setOdooOrders] = useState<any[]>([]);
  const [isSyncingOdoo, setIsSyncingOdoo] = useState(false);

  // Notes Edit State
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteText, setEditNoteText] = useState("");
  
  // Modale "Observation Obligatoire" (dnd-kit)
  const [pendingMove, setPendingMove] = useState<{leadId: string, newStatus: string, oldStatus: string} | null>(null);
  const [observation, setObservation] = useState("");

  // Scheduling Modal State
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleLead, setScheduleLead] = useState<any>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch notes when a lead is selected
  useEffect(() => {
    if (selectedLead) {
      supabase
        .from('lead_notes')
        .select('*')
        .eq('lead_id', selectedLead.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { if (data) setLeadNotes(data); });
        
      // Synchronisation avec l'ERP Odoo
      setIsSyncingOdoo(true);
      setOdooOrders([]);
      fetch('/api/crm/sync-odoo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: selectedLead.phone })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) setOdooOrders(data.orders);
      })
      .catch(console.error)
      .finally(() => setIsSyncingOdoo(false));
    }
  }, [selectedLead]);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = user.user_metadata?.role || 'admin';
        const name = user.user_metadata?.full_name || '';
        const tenantId = user.user_metadata?.tenant_id || user.id;
        
        setUserId(tenantId);
        setCommercialId(user.id);
        setUserRole(role);
        setUserName(name);
        fetchLeads(tenantId, role, name);
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const fetchLeads = async (uid: string, role: string, name: string) => {
    setIsLoading(true);
    
    let query = supabase
      .from('crm_leads')
      .select('*');

    if (role === 'commercial') {
      query = query.eq('assigned_to', name).eq('tenant_id', uid);
    } else {
      query = query.eq('tenant_id', uid);
      const { data: team } = await supabase.from('commercials').select('*').eq('tenant_id', uid).eq('status', 'Actif');
      if (team) setCommercials(team);
    }
    
    const { data } = await query
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
    setIsLoading(false);
  };

  // --- GESTION DU DRAG & DROP (dnd-kit) ---
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    const leadId = active.id as string;
    const newStatus = over.id as string;
    const oldStatus = active.data.current?.status as string;

    if (oldStatus !== newStatus) {
      setPendingMove({ leadId, newStatus, oldStatus });
    }
  };

  const confirmMove = async () => {
    if (!pendingMove || !observation.trim() || !userId) return;
    const { leadId, newStatus } = pendingMove;

    // 1. Sauvegarde de la note d'observation obligatoire
    await supabase.from('lead_notes').insert([{ lead_id: leadId, user_id: userId, note: observation.trim() }]);

    // 2. Mise à jour de l'état Kanban dans la DB et localement
    await supabase.from('crm_leads').update({ status: newStatus }).eq('id', leadId).eq('tenant_id', userId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    setPendingMove(null);
    setObservation("");
  };

  // --- GESTION DES NOTES ---
  const handleDeleteNote = async (id: string) => {
    if (!confirm("Voulez-vous supprimer cette note ?")) return;
    const res = await fetch(`/api/crm/lead_notes?id=${id}`, { method: 'DELETE' });
    if (res.ok) setLeadNotes(prev => prev.filter(n => n.id !== id));
  };

  const handleUpdateNote = async () => {
    if (!editingNoteId || !editNoteText.trim()) return;
    const res = await fetch(`/api/crm/lead_notes`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note_id: editingNoteId, new_note: editNoteText.trim() })
    });
    if (res.ok) {
      setLeadNotes(prev => prev.map(n => n.id === editingNoteId ? { ...n, note: editNoteText.trim() } : n));
      setEditingNoteId(null);
      setEditNoteText("");
    }
  };

  // --- IMPORTATION CSV INTELLIGENTE FACEBOOK ---
  const handleSmartImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!userId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    
    Papa.parse(file, {
       header: true,
       skipEmptyLines: true,
       complete: async (results) => {
          const newLeads = results.data.map((row: any) => {
             // Normalisation des clés en minuscules
             const r: any = {};
             Object.keys(row).forEach(k => r[k.toLowerCase()] = row[k]);
             
             const name = r['full_name'] || r['name'] || r['nom'] || 'Lead Facebook';
             const phone = r['whatsapp_number'] || r['phone'] || r['téléphone'] || r['numero'] || '';
             const campaign = r['campaign_name'] || r['campagne'] || '';
             const form = r['form_name'] || r['formulaire'] || '';
             
             // SCORING IA AUTOMATIQUE
             let score = 'Froid';
             let timeframe = 'Se renseigne';
             const stateKey = Object.keys(r).find(k => k.includes('projet') || k.includes('état') || k.includes('etat'));
             
             if (stateKey) {
                const val = String(r[stateKey]).toLowerCase();
                if (val.includes('concret') || val.includes('maintenant') || val.includes('immédiat')) {
                   score = 'Chaud'; timeframe = 'Immédiat';
                } else if (val.includes('mois')) {
                   score = 'Tiède'; timeframe = '0-3 mois';
                } else if (val.includes('renseigne') || val.includes('curiosité')) {
                   score = 'Froid'; timeframe = 'Se renseigne';
                }
             }
             
             return {
                tenant_id: userId,
                full_name: name,
                phone: phone,
                campaign_name: campaign,
                form_name: form,
                lead_score: score,
                timeframe: timeframe,
                status: 'Nouveaux Leads',
                source: 'Facebook Ads',
                intent: form || campaign || 'Campagne FB',
             };
          }).filter(l => l.phone); // Exclut les lignes sans numéro
          
          const { data, error } = await supabase.from('crm_leads').insert(newLeads).select();
          if (!error && data) {
             setLeads(prev => [...data, ...prev]);
             alert(`${data.length} leads importés et scorés par l'IA avec succès !`);
          } else {
             alert("Erreur lors de l'importation : " + error?.message);
          }
          if (fileInputRef.current) fileInputRef.current.value = '';
       }
    });
  };

  // --- WEBHOOK FACEBOOK (SIMULATION PRIVYR) ---
  const simulateFBWebhook = async () => {
    if (!userId) return;
    const newLead = {
      tenant_id: userId,
      full_name: "Nouveau Lead FB " + Math.floor(Math.random() * 1000),
      phone: "+22170" + Math.floor(1000000 + Math.random() * 9000000),
      status: "Nouveaux Leads",
      source: "Facebook Ads",
      intent: "Campagne Promo",
      is_client: false
    };

    const { data } = await supabase.from('crm_leads').insert([newLead]).select().single();
    if (data) {
      setLeads(prev => [data, ...prev]);
      // Petit effet sonore ou alerte pour mimer l'instantanéité
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
      audio.volume = 0.5;
      audio.play().catch(()=>{});
    }
  };

  // --- ACTIONS QUICK ENTRY ---
  const handleQuickAction = async (actionType: string) => {
    if (!selectedLead) return;
    
    // Détermination de la prochaine étape Kanban
    let nextStatus = selectedLead.status;
    if (selectedLead.status === 'Nouveaux Leads') nextStatus = 'En Cours';
    else if (selectedLead.status === 'En Cours' && actionType === 'whatsapp') nextStatus = 'Converti'; // Exemple de règle métier

    // Mise à jour BDD (On pourrait aussi loguer l'action dans une table `activities`)
    await supabase.from('crm_leads').update({ status: nextStatus }).eq('id', selectedLead.id).eq('tenant_id', userId);
    
    setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, status: nextStatus } : l));
    
    // Exécution de l'action réelle
    if (actionType === 'whatsapp') {
      window.open(`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`, '_blank');
    } else if (actionType === 'call') {
      window.open(`tel:${selectedLead.phone}`, '_self');
    } else if (actionType === 'email') {
      window.open(`mailto:?subject=Suite à votre demande`, '_blank');
    }

    setSelectedLead(null);
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !scheduleLead || !scheduleDate || !scheduleTime) return;

    const payload = {
      tenant_id: userId,
      commercial_id: commercialId || userId,
      lead_id: scheduleLead.id,
      lead_name: scheduleLead.full_name,
      title: scheduleTitle || `RDV avec ${scheduleLead.full_name}`,
      date_time: `${scheduleDate}T${scheduleTime}:00`,
      status: 'Planifié'
    };

    const { error } = await supabase.from('booking_appointments').insert([payload]);
    if (error) {
      alert("Erreur lors de la planification: " + error.message);
    } else {
      alert("Rendez-vous planifié avec succès !");
      setScheduleModalOpen(false);
      setScheduleLead(null);
      setScheduleDate("");
      setScheduleTime("");
      setScheduleTitle("");
    }
  };

  const handleMessageClick = (lead: any) => {
    let text = '';
    if (lead.status === 'Nouveaux Leads') text = `Bonjour ${lead.full_name}, suite à votre demande, nous aimerions échanger avec vous pour mieux comprendre votre besoin.`;
    else if (lead.status === 'En Cours') text = `Bonjour ${lead.full_name}, comment avance votre réflexion suite à notre dernier échange ? Avez-vous pu consulter notre proposition ?`;
    else if (lead.status === 'Converti') text = `Bonjour ${lead.full_name}, ravi de vous compter parmi nos clients ! Je reste à votre entière disposition.`;
    else if (lead.status === 'Perdu') text = `Bonjour ${lead.full_name}, j'espère que vous allez bien. Avez-vous de nouveaux projets sur lesquels nous pourrions vous accompagner en ce moment ?`;
    else text = `Bonjour ${lead.full_name},`;
    
    const cleanPhone = (lead.phone || '').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // --- SUPPRESSION DES LEADS PERDUS ---
  const handleClearLostLeads = async () => {
    if (!userId) return;
    const lostLeadsCount = leads.filter(l => l.status === 'Perdu').length;
    if (lostLeadsCount === 0) {
      return alert("Aucun lead en statut 'Perdu' à supprimer.");
    }
    if (!confirm(`Voulez-vous vraiment supprimer définitivement les ${lostLeadsCount} leads perdus ? Cette action est irréversible.`)) return;

    let query = supabase.from('crm_leads').delete().eq('status', 'Perdu').eq('tenant_id', userId);
    
    if (userRole === 'commercial') {
      query = query.eq('assigned_to', userName);
    }

    const { error } = await query;
    if (error) {
      alert("Erreur lors de la suppression : " + error.message);
    } else {
      setLeads(prev => prev.filter(l => l.status !== 'Perdu'));
      alert(`${lostLeadsCount} leads perdus ont été supprimés avec succès.`);
    }
  };

  const filteredLeads = leads.filter(l => 
    (l.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.phone || '').includes(searchTerm)
  );

  const stagnantLeadsCount = leads.filter(l => (l.status === 'Nouveaux Leads' || !l.status) && l.created_at && new Date(l.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;
  const activePipelineValue = leads.filter(l => ['En Cours', 'Audit en cours', 'Nouveaux Leads'].includes(l.status)).reduce((acc, l) => acc + (Number(l.budget || l.amount || 0)), 0);

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* --- HEADER DES ACTIONS --- */}
      <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Pipeline Commercial</h1>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Gérez vos opportunités</p>
             <span className="bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30 px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <Wallet size={12}/> Pipeline Actif : {activePipelineValue.toLocaleString()} F
             </span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14] transition-colors"
            />
          </div>
          {userRole !== 'commercial' && (
            <>
              <input type="file" accept=".csv" className="hidden" ref={fileInputRef} onChange={handleSmartImport} />
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#39FF14] transition-colors shadow-sm">
                <UploadCloud size={16} className="text-zinc-500"/> Import IA (FB CSV)
              </button>
              <button onClick={simulateFBWebhook} className="flex items-center gap-2 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/30 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1877F2] hover:text-white transition-colors shadow-sm">
                <Facebook size={16}/> Simuler Lead FB
              </button>
            </>
          )}
          <button onClick={handleClearLostLeads} className="flex items-center gap-2 bg-red-500/10 text-red-500 border border-red-500/30 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-colors shadow-sm">
            <Trash2 size={16}/> Vider Perdus
          </button>
        </div>
      </div>

      {/* --- ALERTE LEADS STAGNANTS --- */}
      {stagnantLeadsCount > 0 && (
        <div className="mb-6 bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-2xl flex items-center justify-between shadow-sm animate-in slide-in-from-top-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <div>
              <p className="font-black text-red-700 dark:text-red-400 uppercase text-sm tracking-tight">Leads en souffrance détectés</p>
              <p className="text-xs text-red-600 dark:text-red-500 font-bold mt-0.5">Vous avez {stagnantLeadsCount} prospect(s) dans "Nouveaux Leads" depuis plus de 7 jours. Relancez-les avant qu'ils ne refroidissent !</p>
            </div>
          </div>
        </div>
      )}

      {/* --- KANBAN BOARD (dnd-kit) --- */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-6 custom-scrollbar items-start">
          {KANBAN_COLS.map(col => {
            const colLeads = filteredLeads.filter(l => l.status === col || (col === 'Nouveaux Leads' && !l.status));
            return <KanbanColumn 
                      key={col} 
                      col={col} 
                      leads={colLeads} 
                      onCardClick={setSelectedLead} 
                      onScheduleClick={(l) => { setScheduleLead(l); setScheduleModalOpen(true); }} 
                      onMessageClick={handleMessageClick} 
                   />;
          })}
        </div>
      </DndContext>

      {/* --- QUICK ENTRY MODAL --- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 my-auto max-h-[90vh] flex flex-col">
            <button onClick={() => setSelectedLead(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-xl font-black text-black dark:text-white mb-4 shrink-0">
              {selectedLead.full_name?.charAt(0)}
            </div>
            
            <div className="shrink-0">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-1">{selectedLead.full_name}</h3>
              <p className="text-[#39FF14] font-black text-sm mb-6">{selectedLead.phone}</p>

              <div className="mb-6">
                {selectedLead.is_client && (
                   <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 text-black dark:text-white p-3 rounded-xl mb-3 flex items-center gap-3 text-xs font-bold">
                      <UserCheck size={16} className="text-[#39FF14]"/> Base fidélité.
                   </div>
                )}
                {isSyncingOdoo ? (
                  <p className="text-[10px] text-zinc-500 italic animate-pulse">Synchronisation Odoo en cours...</p>
                ) : odooOrders.length > 0 ? (
                  <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400">
                    <div className="flex items-center gap-2 mb-2"><Activity size={14}/> {odooOrders.length} Commande(s) Odoo</div>
                    <div className="space-y-1">
                      {odooOrders.map((o: any) => (
                         <div key={o.id} className="flex justify-between border-t border-blue-500/10 pt-1">
                           <span className="truncate pr-2">{o.name}</span>
                           <span className="whitespace-nowrap">{o.amount_total.toLocaleString('fr-FR')} F</span>
                         </div>
                      ))}
                    </div>
                    <div className="flex justify-between border-t border-blue-500/30 mt-2 pt-2 text-sm text-black dark:text-white">
                      <span>Valeur Réelle Générée :</span>
                      <span className="text-[#39FF14]">{odooOrders.reduce((sum, o) => sum + o.amount_total, 0).toLocaleString('fr-FR')} F</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-zinc-500 italic">Aucune donnée Odoo liée à ce numéro.</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
              {/* --- NOUVEAU: ASSIGNATION INTELLIGENTE --- */}
              {userRole !== 'commercial' && (
                <div className="bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 mb-2">
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2"><UserCheck size={14}/> Assignation Gérant</p>
                  
                  <select 
                    value={selectedLead.assigned_to || ""}
                    onChange={async (e) => {
                      const newAssignee = e.target.value;
                      await supabase.from('crm_leads').update({ assigned_to: newAssignee }).eq('id', selectedLead.id).eq('tenant_id', userId);
                      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, assigned_to: newAssignee } : l));
                      setSelectedLead({ ...selectedLead, assigned_to: newAssignee });
                      
                      if (newAssignee) {
                          const commercial = commercials.find(c => c.full_name === newAssignee);
                          if (commercial && commercial.phone) {
                              if (confirm(`Voulez-vous notifier ${commercial.full_name} par WhatsApp de cette nouvelle assignation ?`)) {
                                  const msg = `Salut ${commercial.full_name}, un nouveau prospect vient de t'être assigné dans le CRM OnyxOps !\n\n👤 Prospect : ${selectedLead.full_name}\n📞 Contact : ${selectedLead.phone}\n🎯 Intérêt : ${selectedLead.intent || 'Non spécifié'}\n\nConnecte-toi sur ton espace pour le traiter au plus vite.`;
                                  window.open(`https://wa.me/${commercial.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                              }
                          }
                      }
                    }}
                    className="w-full p-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none focus:border-[#39FF14] cursor-pointer appearance-none"
                  >
                    <option value="">-- Non assigné --</option>
                    {[...commercials].sort((a, b) => {
                       const wlA = leads.filter(l => l.assigned_to === a.full_name && !['Converti', 'Perdu', 'Gagné'].includes(l.status)).length;
                       const wlB = leads.filter(l => l.assigned_to === b.full_name && !['Converti', 'Perdu', 'Gagné'].includes(l.status)).length;
                       return wlA - wlB;
                    }).map(c => {
                      const wl = leads.filter(l => l.assigned_to === c.full_name && !['Converti', 'Perdu', 'Gagné'].includes(l.status)).length;
                      const isAvailable = wl < 15; // Quota idéal B2B
                      return <option key={c.id} value={c.full_name}>{c.full_name} ({wl}/15 actifs) {isAvailable ? '🟢' : '🔴 Surchargé'}</option>
                    })}
                  </select>

                  {/* Suggestion IA */}
                  {commercials.length > 0 && !selectedLead.assigned_to && (() => {
                    const sorted = [...commercials].sort((a,b) => (leads.filter(l => l.assigned_to === a.full_name && !['Converti', 'Perdu', 'Gagné'].includes(l.status)).length) - (leads.filter(l => l.assigned_to === b.full_name && !['Converti', 'Perdu', 'Gagné'].includes(l.status)).length));
                    const best = sorted[0];
                    if (leads.filter(l => l.assigned_to === best.full_name && !['Converti', 'Perdu', 'Gagné'].includes(l.status)).length < 15) {
                      return (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-bold">Suggestion :</span>
                          <button onClick={async () => { 
                             await supabase.from('crm_leads').update({ assigned_to: best.full_name }).eq('id', selectedLead.id).eq('tenant_id', userId); 
                             setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, assigned_to: best.full_name } : l)); 
                             setSelectedLead({ ...selectedLead, assigned_to: best.full_name }); 
                             if (best && best.phone) {
                                 if (confirm(`Voulez-vous notifier ${best.full_name} par WhatsApp de cette nouvelle assignation ?`)) {
                                     const msg = `Salut ${best.full_name}, un nouveau prospect vient de t'être assigné dans le CRM OnyxOps !\n\n👤 Prospect : ${selectedLead.full_name}\n📞 Contact : ${selectedLead.phone}\n🎯 Intérêt : ${selectedLead.intent || 'Non spécifié'}\n\nConnecte-toi sur ton espace pour le traiter au plus vite.`;
                                     window.open(`https://wa.me/${best.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
                                 }
                             }
                          }} className="bg-[#39FF14]/20 text-green-700 dark:text-[#39FF14] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-[#39FF14] hover:text-black transition-colors shadow-sm flex items-center gap-1"><Zap size={12}/> Assigner à {best.full_name}</button>
                        </div>
                      );
                    } else return <div className="mt-3 text-[10px] text-red-500 font-bold bg-red-500/10 px-3 py-1.5 rounded-lg">⚠️ L'équipe est saturée (+15 leads chacun).</div>;
                  })()}
                </div>
              )}

              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Actions Rapides</p>
                <div className="space-y-3">
              <button 
                onClick={() => handleQuickAction('whatsapp')}
                className="w-full bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-xs hover:bg-[#25D366] hover:text-white transition-colors"
              >
                <MessageSquare size={16}/> Message WhatsApp
              </button>
              <button 
                onClick={() => handleQuickAction('call')}
                className="w-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-xs hover:border-black dark:hover:border-zinc-700 transition-colors"
              >
                <Phone size={16}/> Appel Téléphonique
              </button>
              <button 
                onClick={() => handleQuickAction('email')}
                className="w-full bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white border border-zinc-200 dark:border-zinc-800 py-4 rounded-xl flex items-center justify-center gap-3 font-black uppercase text-xs hover:border-black dark:hover:border-zinc-700 transition-colors"
              >
                <Mail size={16}/> Envoyer un Email
              </button>
                </div>
              </div>
              
              <div>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Activity size={12}/> Historique & Notes</p>
                <div className="space-y-2">
                  {leadNotes.length > 0 ? leadNotes.map((note) => (
                    <div key={note.id} className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-left group">
                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <textarea 
                             value={editNoteText} 
                             onChange={(e) => setEditNoteText(e.target.value)}
                             className="w-full bg-white dark:bg-zinc-950 p-2 text-xs rounded border border-zinc-200 dark:border-zinc-700 outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={handleUpdateNote} className="text-[10px] bg-[#39FF14] text-black px-3 py-1.5 rounded font-bold">Enregistrer</button>
                            <button onClick={() => setEditingNoteId(null)} className="text-[10px] bg-zinc-200 dark:bg-zinc-800 text-black dark:text-white px-3 py-1.5 rounded font-bold">Annuler</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-xs font-medium text-black dark:text-white leading-snug">{note.note}</p>
                          <div className="flex items-center justify-between mt-1.5">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase">{formatDistanceToNow(new Date(note.created_at), { addSuffix: true, locale: fr })}</p>
                            {userRole !== 'commercial' && (
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button onClick={() => { setEditingNoteId(note.id); setEditNoteText(note.note); }} className="text-blue-500 hover:text-blue-400"><Edit size={12} /></button>
                                 <button onClick={() => handleDeleteNote(note.id)} className="text-red-500 hover:text-red-400"><Trash2 size={12} /></button>
                               </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )) : <p className="text-xs font-medium text-zinc-500 italic">Aucune note pour le moment.</p>}
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between shrink-0">
               <button onClick={() => { window.location.href = `/crm/leads/${selectedLead.id}`; }} className="text-[10px] font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
                 <Activity size={14}/> Voir Dossier Complet
               </button>
            </div>
          </div>
        </div>
      )}
      
      {/* --- OBSERVATION MODAL (MANDATORY) --- */}
      {pendingMove && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <h3 className="text-xl font-black uppercase mb-2">Note de suivi obligatoire</h3>
            <p className="text-xs font-bold text-zinc-500 mb-6">
              Veuillez indiquer pourquoi ce lead passe de <span className="text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{pendingMove.oldStatus}</span> à <span className="text-black dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{pendingMove.newStatus}</span>.
            </p>
            <textarea
              value={observation}
              onChange={(e) => setObservation(e.target.value)}
              placeholder="Observation, compte-rendu d'appel ou raison du déplacement..."
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14] min-h-[120px] mb-6 custom-scrollbar resize-none"
              autoFocus
            />
            <div className="flex gap-4">
              <button onClick={() => { setPendingMove(null); setObservation(""); }} className="flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:text-black dark:hover:text-white transition-colors">Annuler</button>
              <button onClick={confirmMove} disabled={!observation.trim()} className="flex-1 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest text-black bg-[#39FF14] hover:bg-black hover:text-[#39FF14] transition-colors shadow-lg disabled:opacity-50">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* --- SCHEDULE MODAL --- */}
      {scheduleModalOpen && scheduleLead && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <button onClick={() => setScheduleModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><Calendar size={20} className="text-[#39FF14]"/> Planifier RDV</h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Titre (Optionnel)</label>
                <input type="text" placeholder={`RDV avec ${scheduleLead.full_name}`} value={scheduleTitle} onChange={e => setScheduleTitle(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Date *</label>
                  <input type="date" required value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14]" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Heure *</label>
                  <input type="time" required value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14]" />
                </div>
              </div>
              <button type="submit" className="w-full mt-4 bg-black dark:bg-white text-[#39FF14] dark:text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform shadow-lg flex justify-center items-center gap-2">
                <CheckCircle size={16}/> Enregistrer le RDV
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
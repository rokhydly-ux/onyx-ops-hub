"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Plus, Search, Phone, MessageSquare, Mail, 
  UploadCloud, Facebook, Activity, CheckCircle, 
  X, ShieldCheck, Zap, UserCheck, Edit, Trash2
} from 'lucide-react';
import { DndContext, DragEndEvent, closestCenter, useDraggable, useDroppable } from '@dnd-kit/core';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const KANBAN_COLS = ['Nouveaux Leads', 'En Cours', 'Converti', 'Perdu'];

// --- COMPOSANTS DND-KIT (KANBAN) ---
function KanbanColumn({ col, leads, onCardClick }: { col: string, leads: any[], onCardClick: (lead: any) => void }) {
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
          <KanbanCard key={lead.id} lead={lead} onClick={() => onCardClick(lead)} />
        ))}
        
        {leads.length === 0 && (
          <div className="p-6 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Glisser ici</div>
        )}
      </div>
    </div>
  );
}

function KanbanCard({ lead, onClick }: { lead: any, onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { status: lead.status || 'Nouveaux Leads' }
  });
  
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
      className="bg-white dark:bg-zinc-950 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-500 transition-colors cursor-grab active:cursor-grabbing group relative"
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

      <p className="font-black text-sm uppercase truncate pr-4">{lead.full_name}</p>
      <p className="text-[#39FF14] font-black text-xs mt-1">{lead.phone}</p>
      
      <div className="flex items-center justify-between mt-4">
        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-md">{lead.intent || 'Contact'}</span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-500 hover:text-black dark:hover:text-white"><MessageSquare size={12}/></button>
          <button className="p-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-md text-zinc-500 hover:text-black dark:hover:text-white"><Phone size={12}/></button>
        </div>
      </div>
    </div>
  );
}

export default function LeadsKanbanPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
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
      // 1. Vérification de la session locale (Employé CRM)
      const customSession = localStorage.getItem('onyx_custom_session');
      if (customSession) {
        try {
          const profile = JSON.parse(customSession);
          setUserId(profile.id);
          setUserRole(profile.role || 'commercial');
          setUserName(profile.full_name || '');
          fetchLeads(profile.id, profile.role || 'commercial', profile.full_name || '');
          return; // On arrête l'exécution si la session locale existe
        } catch (e) {}
      }

      // 2. Fallback sur la session Supabase (Administrateur)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const role = user.user_metadata?.role || 'admin';
        const name = user.user_metadata?.full_name || '';
        setUserRole(role);
        setUserName(name);
        fetchLeads(user.id, role, name);
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const fetchLeads = async (uid: string, role: string, name: string) => {
    setIsLoading(true);
    
    let query = supabase
      .from('leads')
      .select('*');

    if (role === 'commercial') {
      query = query.eq('assigned_to', name);
    } else {
      query = query.eq('user_id', uid);
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
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
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

  // --- IMPORTATION INTELLIGENTE (SIMULATION ODOO / EXCEL) ---
  const handleSmartImport = async () => {
    if (!userId) return;
    // Simulation d'un parsing de fichier (Ex: CSV où certains ont acheté dans le passé)
    const mockImport = [
      { full_name: "Fatou Sow", phone: "+221771234567", status: "Nouveaux Leads", intent: "Catalogue", history: "Achat 2025" },
      { full_name: "Ousmane Fall", phone: "+221768889900", status: "Nouveaux Leads", intent: "Devis", history: null }
    ];

    const newLeads = mockImport.map(item => {
      // Auto-Classification IA : Si historique d'achat détecté -> Tag 'Client'
      const isClient = item.history !== null;
      return {
        user_id: userId,
        full_name: item.full_name,
        phone: item.phone,
        status: item.status,
        intent: item.intent,
        is_client: isClient, // Champ booléen pour pastille
        source: "Import Excel"
      };
    });

    const { data, error } = await supabase.from('leads').insert(newLeads).select();
    if (!error && data) {
      setLeads(prev => [...data, ...prev]);
      alert("Importation réussie ! L'IA a automatiquement classifié les anciens acheteurs en 'CLIENT'.");
    }
  };

  // --- WEBHOOK FACEBOOK (SIMULATION PRIVYR) ---
  const simulateFBWebhook = async () => {
    if (!userId) return;
    const newLead = {
      user_id: userId,
      full_name: "Nouveau Lead FB " + Math.floor(Math.random() * 1000),
      phone: "+22170" + Math.floor(1000000 + Math.random() * 9000000),
      status: "Nouveaux Leads",
      source: "Facebook Ads",
      intent: "Campagne Promo",
      is_client: false
    };

    const { data } = await supabase.from('leads').insert([newLead]).select().single();
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
    await supabase.from('leads').update({ status: nextStatus }).eq('id', selectedLead.id);
    
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

  const filteredLeads = leads.filter(l => 
    (l.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (l.phone || '').includes(searchTerm)
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      
      {/* --- HEADER DES ACTIONS --- */}
      <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">Pipeline Commercial</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gérez vos opportunités par glisser-déposer</p>
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
              <button onClick={handleSmartImport} className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#39FF14] transition-colors shadow-sm">
                <UploadCloud size={16} className="text-zinc-500"/> Import IA (Excel)
              </button>
              <button onClick={simulateFBWebhook} className="flex items-center gap-2 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/30 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1877F2] hover:text-white transition-colors shadow-sm">
                <Facebook size={16}/> Simuler Lead FB
              </button>
            </>
          )}
        </div>
      </div>

      {/* --- KANBAN BOARD (dnd-kit) --- */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-6 custom-scrollbar items-start">
          {KANBAN_COLS.map(col => {
            const colLeads = filteredLeads.filter(l => l.status === col || (col === 'Nouveaux Leads' && !l.status));
            return <KanbanColumn key={col} col={col} leads={colLeads} onCardClick={setSelectedLead} />;
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
    </div>
  );
}
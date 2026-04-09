"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  Plus, Search, Phone, MessageSquare, Mail, 
  UploadCloud, Facebook, Activity, CheckCircle, 
  X, ShieldCheck, Zap, UserCheck
} from 'lucide-react';

const KANBAN_COLS = ['Nouveaux Leads', 'En Cours', 'Converti', 'Perdu'];

export default function LeadsKanbanPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  // Modal "Quick Entry"
  const [selectedLead, setSelectedLead] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchLeads(user.id);
      }
    };
    init();
  }, []);

  const fetchLeads = async (uid: string) => {
    setIsLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    if (data) setLeads(data);
    setIsLoading(false);
  };

  // --- GESTION DU DRAG & DROP ---
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('leadId', leadId);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('leadId');
    if (!leadId) return;

    // Mise à jour optimiste
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    // Mise à jour BDD
    await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
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
          <button onClick={handleSmartImport} className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#39FF14] transition-colors shadow-sm">
            <UploadCloud size={16} className="text-zinc-500"/> Import IA (Excel)
          </button>
          <button onClick={simulateFBWebhook} className="flex items-center gap-2 bg-[#1877F2]/10 text-[#1877F2] border border-[#1877F2]/30 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1877F2] hover:text-white transition-colors shadow-sm">
            <Facebook size={16}/> Simuler Lead FB
          </button>
        </div>
      </div>

      {/* --- KANBAN BOARD --- */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-6 custom-scrollbar items-start">
        {KANBAN_COLS.map(col => {
          const colLeads = filteredLeads.filter(l => l.status === col || (col === 'Nouveaux Leads' && !l.status));
          
          return (
            <div 
              key={col} 
              className="bg-zinc-100/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-4 w-[320px] shrink-0 flex flex-col max-h-[75vh]"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => handleDrop(e, col)}
            >
              <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="font-black uppercase text-sm tracking-tight">{col}</h3>
                <span className="bg-black dark:bg-white text-[#39FF14] dark:text-black text-[10px] font-black px-2.5 py-1 rounded-lg">{colLeads.length}</span>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                {colLeads.map(lead => (
                  <div 
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onClick={() => setSelectedLead(lead)}
                    className="bg-white dark:bg-zinc-950 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-black dark:hover:border-zinc-500 transition-colors cursor-grab active:cursor-grabbing group relative"
                  >
                    {/* Pastille Auto-Classification IA */}
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
                ))}
                
                {colLeads.length === 0 && (
                  <div className="p-6 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Glisser ici</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* --- QUICK ENTRY MODAL --- */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <button onClick={() => setSelectedLead(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            
            <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-xl font-black text-black dark:text-white mb-4">
              {selectedLead.full_name?.charAt(0)}
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-tighter mb-1">{selectedLead.full_name}</h3>
            <p className="text-[#39FF14] font-black text-sm mb-6">{selectedLead.phone}</p>

            {selectedLead.is_client && (
               <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 text-black dark:text-white p-3 rounded-xl mb-6 flex items-center gap-3 text-xs font-bold">
                  <UserCheck size={16} className="text-[#39FF14]"/> Ce prospect fait partie de votre base fidélité.
               </div>
            )}

            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Action Rapide (Auto-avance le lead)</p>
            
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
            
            <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between">
               <button onClick={() => { window.location.href = `/crm/leads/${selectedLead.id}`; }} className="text-[10px] font-black uppercase text-zinc-500 hover:text-black dark:hover:text-white transition-colors flex items-center gap-1">
                 <Activity size={14}/> Voir Dossier Complet
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
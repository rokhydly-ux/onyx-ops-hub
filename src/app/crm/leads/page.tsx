"use client";

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  Tag, 
  LayoutGrid
} from 'lucide-react';
import { 
  DndContext, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  closestCenter, 
  DragEndEvent,
  useDraggable,
  useDroppable
} from '@dnd-kit/core';
import { supabase } from '@/lib/supabaseClient';

const COLUMNS = ['Nouveau', 'Contacté', 'Négociation', 'Gagné', 'Perdu'];

// --- COMPOSANTS DRAG & DROP ---
function DroppableColumn({ id, title, count, children }: { id: string, title: string, count: number, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  
  return (
    <div 
      ref={setNodeRef} 
      className={`w-[85vw] sm:w-[320px] shrink-0 rounded-2xl p-4 flex flex-col h-full border transition-colors duration-200 ${
        isOver 
          ? 'bg-[#39FF14]/5 border-[#39FF14]/30' 
          : 'bg-zinc-100 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <div className="flex justify-between items-center mb-4 px-1 shrink-0">
        <h3 className="font-black uppercase text-sm tracking-tighter text-black dark:text-white flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${title === 'Nouveau' ? 'bg-blue-500' : title === 'Gagné' ? 'bg-[#39FF14]' : title === 'Perdu' ? 'bg-red-500' : 'bg-yellow-500'}`}></div>
          {title}
        </h3>
        <span className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">
          {count}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 pb-4">
        <div className="space-y-3 min-h-[50px]">
          {children}
        </div>
      </div>
    </div>
  );
}

function DraggableCard({ lead }: { lead: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: lead.id, 
    data: lead 
  });
  
  const style = transform ? { 
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 50 : 1,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes} 
      className={`bg-white dark:bg-zinc-950 p-4 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing group ${
        isDragging 
          ? 'border-[#39FF14] shadow-[0_10px_30px_rgba(57,255,20,0.15)] opacity-90 scale-105 rotate-2' 
          : 'border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-black dark:hover:border-zinc-700 hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 rounded-md border border-zinc-200 dark:border-zinc-800">
          {lead.category}
        </span>
      </div>
      
      <p className="font-black text-sm uppercase text-black dark:text-white mb-4 line-clamp-2 leading-tight group-hover:text-[#39FF14] transition-colors">
        {lead.name}
      </p>
      
      <div className="flex justify-between items-end mt-auto pt-3 border-t border-zinc-100 dark:border-zinc-800/50">
        <div>
          <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Potentiel</p>
          <p className="text-lg font-black text-[#39FF14] leading-none">
            {lead.amount.toLocaleString('fr-FR')} <span className="text-[10px] text-zinc-500 uppercase">F</span>
          </p>
        </div>
        <div 
          className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-[10px] shadow-sm border-2 border-white dark:border-zinc-950 ${lead.avatarColor}`} 
          title={`Responsable: ${lead.assignee}`}
        >
          {lead.assignee.charAt(0)}
        </div>
      </div>
    </div>
  );
}

export default function LeadsKanban() {
  const [mounted, setMounted] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('Tous');
  const [categoryFilter, setCategoryFilter] = useState('Toutes');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  useEffect(() => { 
    setMounted(true); 
    fetchLeads();
  }, []);

  const getAvatarColor = (name: string) => {
    const colors = ['bg-blue-500', 'bg-pink-500', 'bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500'];
    const index = (name || 'A').charCodeAt(0) % colors.length;
    return colors[index];
  };

  const fetchLeads = async () => {
    const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data && !error) {
      const formattedLeads = data.map((l: any) => ({
        id: l.id,
        name: l.full_name || 'Inconnu',
        amount: Number(l.amount) || Number(l.budget) || 0,
        status: l.status || 'Nouveau',
        category: l.intent || l.category || 'Non défini',
        assignee: l.assigned_to || 'Non assigné',
        avatarColor: getAvatarColor(l.assigned_to || l.full_name)
      }));
      setLeads(formattedLeads);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const leadId = active.id;
    const newStatus = over.id as string;
    
    // Mise à jour de l'UI (optimiste)
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    // Mise à jour dans la base de données
    const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', leadId);
    if (error) {
      console.error("Erreur de mise à jour:", error);
      fetchLeads(); // On annule et on recharge si ça plante
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchSearch = l.name.toLowerCase().includes(search.toLowerCase());
    const matchAssignee = assigneeFilter === 'Tous' || l.assignee === assigneeFilter;
    const matchCategory = categoryFilter === 'Toutes' || l.category === categoryFilter;
    return matchSearch && matchAssignee && matchCategory;
  });

  const uniqueAssignees = Array.from(new Set(leads.map(l => l.assignee)));
  const uniqueCategories = Array.from(new Set(leads.map(l => l.category)));

  if (!mounted) return null;

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in duration-500 max-w-[1800px] mx-auto">
      
      {/* --- BARRE DE FILTRES --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Rechercher un lead..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-bold text-black dark:text-white outline-none focus:border-[#39FF14] dark:focus:border-[#39FF14] transition-all"
          />
        </div>
        <div className="flex gap-4">
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className="flex-1 md:w-48 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-widest outline-none cursor-pointer text-zinc-600 dark:text-zinc-300 focus:border-[#39FF14] transition-all">
            <option value="Tous">👤 Tous les agents</option>
            {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="flex-1 md:w-48 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold uppercase tracking-widest outline-none cursor-pointer text-zinc-600 dark:text-zinc-300 focus:border-[#39FF14] transition-all">
            <option value="Toutes">🏷️ Toutes catégories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* --- KANBAN BOARD --- */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 custom-scrollbar items-start snap-x snap-mandatory sm:snap-none">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            {COLUMNS.map(col => (
              <div key={col} className="snap-start sm:snap-align-none h-full">
                <DroppableColumn id={col} title={col} count={filteredLeads.filter(l => l.status === col).length}>
                  {filteredLeads.filter(l => l.status === col).map(lead => (
                    <DraggableCard key={lead.id} lead={lead} />
                  ))}
                </DroppableColumn>
              </div>
            ))}
          </DndContext>
        </div>
      </div>

    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Calendar as CalendarIcon, Clock, AlertTriangle, CheckCircle, X, Plus, Phone, MessageSquare, ChevronLeft, ChevronRight, LayoutList, CalendarDays } from 'lucide-react';

export default function BookingModulePage() {
  const [session, setSession] = useState<any>({});
  const [leads, setLeads] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWeekDate, setCurrentWeekDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({
    lead_id: '',
    date: '',
    time: '',
    title: ''
  });

  useEffect(() => {
    const initData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const role = user.user_metadata?.role || 'admin';
      const fullName = user.user_metadata?.full_name || '';
      const tenantId = user.user_metadata?.tenant_id || user.id;
      
      setSession({ id: tenantId, role, full_name: fullName, user_id: user.id });

      // Fetch Leads assigned to this user
      let leadsQuery = supabase.from('crm_leads').select('*').eq('tenant_id', tenantId);
      if (role === 'commercial' && fullName) {
        leadsQuery = leadsQuery.eq('assigned_to', fullName);
      }
      const { data: leadsData } = await leadsQuery.order('created_at', { ascending: false });
      if (leadsData) setLeads(leadsData);

      // Fetch Appointments
      const { data: apptData } = await supabase
        .from('booking_appointments')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('date_time', { ascending: true });
      if (apptData) setAppointments(apptData);

      setIsLoading(false);
    };

    initData();
  }, []);

  const handleSaveAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.lead_id || !formState.date || !formState.time) return;

    const selectedLead = leads.find(l => String(l.id) === String(formState.lead_id));
    
    const payload = {
      tenant_id: session.id,
      commercial_id: session.user_id || session.id,
      lead_id: formState.lead_id,
      lead_name: selectedLead?.full_name || 'Lead Inconnu',
      title: formState.title || `Rendez-vous avec ${selectedLead?.full_name}`,
      date_time: `${formState.date}T${formState.time}:00`,
      status: 'Planifié'
    };

    const { data, error } = await supabase.from('booking_appointments').insert([payload]).select();
    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    } else if (data) {
      setAppointments(prev => [...prev, ...data].sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime()));
      setIsModalOpen(false);
      setFormState({ lead_id: '', date: '', time: '', title: '' });
      alert("Rendez-vous planifié avec succès !");
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await supabase.from('booking_appointments').update({ status: newStatus }).eq('id', id).eq('tenant_id', session.id);
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  if (isLoading) return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div></div>;

  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todayEnd = new Date();
  todayEnd.setHours(23,59,59,999);

  const rdvDuJour = appointments.filter(a => new Date(a.date_time) >= todayStart && new Date(a.date_time) <= todayEnd && a.status === 'Planifié');
  const rdvManques = appointments.filter(a => new Date(a.date_time) < todayStart && a.status === 'Planifié');

  // --- LOGIQUE DU CALENDRIER (MOIS) ---
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const startDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1; // Lundi = 0, Dimanche = 6
  const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const handlePrevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const openModalForDate = (day: number) => {
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setFormState({ ...formState, date: formattedDate });
      setIsModalOpen(true);
  };

  // --- LOGIQUE DU CALENDRIER (SEMAINE) ---
  const getWeekDays = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      const days: Date[] = [];
      for (let i = 0; i < 7; i++) {
          const nextDay = new Date(monday);
          nextDay.setDate(monday.getDate() + i);
          days.push(nextDay);
      }
      return days;
  };
  const weekDays = getWeekDays(currentWeekDate);
  const hours = Array.from({ length: 13 }, (_, i) => i + 8); // de 8h à 20h

  const handleDragStart = (e: React.DragEvent, id: string) => {
      e.dataTransfer.setData('text/plain', id);
  };

  const handleDrop = async (e: React.DragEvent, dateStr: string, hourStr?: string) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('text/plain');
      if (!id) return;
      
      const appt = appointments.find(a => a.id === id);
      if (!appt) return;

      const oldDateTime = new Date(appt.date_time);
      const timeString = hourStr ? `${hourStr}:00:00` : `${String(oldDateTime.getHours()).padStart(2, '0')}:${String(oldDateTime.getMinutes()).padStart(2, '0')}:00`;
      const newDateTime = `${dateStr}T${timeString}`;

      setAppointments(prev => prev.map(a => a.id === id ? { ...a, date_time: newDateTime } : a));

      const { error } = await supabase.from('booking_appointments').update({ date_time: newDateTime }).eq('id', id).eq('tenant_id', session.id);
      if (error) alert("Erreur lors du déplacement : " + error.message);
  };

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500">
      {/* EN-TÊTE ET ALERTES */}
      <div className="mb-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 flex items-center gap-3">
          <CalendarIcon className="text-[#39FF14]" size={28} /> Agenda & RDV
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-orange-50 dark:bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-2xl flex items-center justify-between">
             <div>
               <p className="font-black text-orange-600 dark:text-orange-400 flex items-center gap-2"><Clock size={16}/> RDV du Jour</p>
               <p className="text-xs text-orange-500 mt-1">Vous avez {rdvDuJour.length} rendez-vous prévu(s) aujourd'hui.</p>
             </div>
             <span className="text-2xl font-black text-orange-500">{rdvDuJour.length}</span>
          </div>
          <div className="bg-red-50 dark:bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-2xl flex items-center justify-between">
             <div>
               <p className="font-black text-red-600 dark:text-red-400 flex items-center gap-2"><AlertTriangle size={16}/> RDV Manqués (Retard)</p>
               <p className="text-xs text-red-500 mt-1">{rdvManques.length} rendez-vous n'ont pas été traités à temps.</p>
             </div>
             <span className="text-2xl font-black text-red-500">{rdvManques.length}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
        {/* COLONNE GAUCHE: LEADS À RELANCER */}
        <div className="md:col-span-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-5 sm:p-6 shadow-sm">
           <h3 className="font-black uppercase text-lg mb-4 flex items-center justify-between">
             Mes Leads à relancer
             <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-500 text-[10px] px-2 py-1 rounded-lg">{leads.length}</span>
           </h3>
           <div className="space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
             {leads.length === 0 ? (
               <p className="text-sm text-zinc-400 italic">Aucun lead assigné pour le moment.</p>
             ) : (
               leads.map(lead => (
                 <div key={lead.id} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 group hover:border-[#39FF14] transition-colors">
                   <p className="font-bold text-sm uppercase text-black dark:text-white truncate">{lead.full_name}</p>
                   <p className="text-xs text-[#39FF14] font-black mt-1 mb-3">{lead.phone}</p>
                   <div className="flex gap-2">
                     <button onClick={() => { setFormState({ ...formState, lead_id: lead.id }); setIsModalOpen(true); }} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#39FF14] dark:hover:bg-[#39FF14] transition-colors">Planifier</button>
                     <a href={`https://wa.me/${(lead.phone || '').replace(/[^0-9]/g, '')}?text=Bonjour ${encodeURIComponent(lead.full_name)},`} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#25D366]/10 text-[#25D366] rounded-xl hover:bg-[#25D366] hover:text-white transition-colors"><MessageSquare size={16}/></a>
                   </div>
                 </div>
               ))
             )}
           </div>
        </div>

        {/* COLONNE DROITE: AGENDA */}
        <div className="md:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-5 sm:p-6 shadow-sm">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 border-b border-zinc-100 dark:border-zinc-800 pb-4 gap-4">
             <div className="flex items-center gap-4">
               <h3 className="font-black uppercase text-xl text-black dark:text-white">Calendrier des RDV</h3>
               <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1">
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><LayoutList size={16}/></button>
                  <button onClick={() => setViewMode('calendar')} className={`p-1.5 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><CalendarDays size={16}/></button>
                  <button onClick={() => setViewMode('week')} className={`p-1.5 rounded-md transition-all ${viewMode === 'week' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Clock size={16}/></button>
               </div>
             </div>
             <div className="flex items-center gap-3">
               {viewMode === 'calendar' && (
                 <div className="flex items-center gap-2 mr-2 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <button onClick={handlePrevMonth} className="p-1 hover:text-[#39FF14] transition-colors"><ChevronLeft size={16}/></button>
                    <span className="font-black uppercase text-xs w-24 text-center">{monthNames[month]} {year}</span>
                    <button onClick={handleNextMonth} className="p-1 hover:text-[#39FF14] transition-colors"><ChevronRight size={16}/></button>
                 </div>
               )}
               {viewMode === 'week' && (
                 <div className="flex items-center gap-2 mr-2 bg-zinc-50 dark:bg-zinc-900 px-2 py-1 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => { const d = new Date(currentWeekDate); d.setDate(d.getDate() - 7); setCurrentWeekDate(d); }} className="p-1 hover:text-[#39FF14] transition-colors"><ChevronLeft size={16}/></button>
                    <span className="font-black uppercase text-[10px] w-32 text-center truncate">Semaine du {weekDays[0].getDate()} {monthNames[weekDays[0].getMonth()].substring(0,3)}</span>
                    <button onClick={() => { const d = new Date(currentWeekDate); d.setDate(d.getDate() + 7); setCurrentWeekDate(d); }} className="p-1 hover:text-[#39FF14] transition-colors"><ChevronRight size={16}/></button>
                 </div>
               )}
               <button onClick={() => setIsModalOpen(true)} className="bg-[#39FF14] text-black px-4 py-2.5 rounded-xl text-xs font-black uppercase shadow-md hover:scale-105 transition-transform flex items-center gap-2">
                  <Plus size={16}/> Nouveau
               </button>
             </div>
           </div>
           
           {viewMode === 'list' ? (
           <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
             {appointments.length === 0 ? (
                <div className="text-center py-10 text-zinc-400">
                   <CalendarIcon size={48} className="mx-auto mb-4 opacity-20" />
                   <p className="font-bold">Aucun rendez-vous planifié.</p>
                </div>
             ) : (
                appointments.map(appt => (
                  <div key={appt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                     <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-1">
                         {new Date(appt.date_time).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {new Date(appt.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                       </p>
                       <p className="font-bold text-sm text-black dark:text-white uppercase">{appt.title}</p>
                       <p className="text-xs text-zinc-500 mt-1">Client: {appt.lead_name}</p>
                     </div>
                     <div className="flex items-center gap-3">
                        <select 
                           value={appt.status} 
                           onChange={(e) => updateStatus(appt.id, e.target.value)}
                           className={`text-xs font-black uppercase px-3 py-1.5 rounded-lg outline-none cursor-pointer border ${
                             appt.status === 'Effectué' ? 'bg-green-100 text-green-700 border-green-200' :
                             appt.status === 'Annulé' || appt.status === 'Manqué' ? 'bg-red-100 text-red-700 border-red-200' :
                             appt.status === 'Reporté' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                             'bg-zinc-200 text-black border-zinc-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-700'
                           }`}
                        >
                           <option value="Planifié">Planifié</option>
                           <option value="Effectué">Effectué</option>
                           <option value="Reporté">Reporté</option>
                           <option value="Manqué">Manqué</option>
                           <option value="Annulé">Annulé</option>
                        </select>
                     </div>
                  </div>
                ))
             )}
           </div>
           ) : viewMode === 'calendar' ? (
             <div className="animate-in fade-in flex flex-col h-[60vh] min-h-[500px]">
                {/* Jours de la semaine */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(day => (
                    <div key={day} className="text-center text-[10px] font-black uppercase tracking-widest text-zinc-500">{day}</div>
                  ))}
                </div>
                {/* Grille du calendrier */}
                <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
                  {Array.from({ length: startDay }).map((_, i) => (
                     <div key={`empty-${i}`} className="bg-zinc-50/50 dark:bg-zinc-900/20 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800/50 p-2 opacity-50"></div>
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                     const day = i + 1;
                     const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                     
                     const dayAppts = appointments.filter(a => {
                        const aDate = new Date(a.date_time);
                        return aDate.getFullYear() === year && aDate.getMonth() === month && aDate.getDate() === day;
                     });
                     
                     const isToday = todayStart.getFullYear() === year && todayStart.getMonth() === month && todayStart.getDate() === day;
                     
                     return (
                       <div 
                         key={day} 
                         onClick={() => openModalForDate(day)}
                         onDragOver={(e) => e.preventDefault()}
                         onDrop={(e) => { e.stopPropagation(); handleDrop(e, dateStr); }}
                         className={`rounded-xl border p-1.5 sm:p-2 flex flex-col gap-1 cursor-pointer hover:border-[#39FF14] transition-colors overflow-hidden ${isToday ? 'bg-[#39FF14]/5 border-[#39FF14]/50' : 'bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800'}`}
                       >
                          <div className={`text-xs font-black w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#39FF14] text-black' : 'text-zinc-400'}`}>
                            {day}
                          </div>
                          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
                            {dayAppts.map(a => (
                              <div 
                                key={a.id} 
                                draggable
                                onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, a.id); }}
                                title={`${a.title} - ${a.lead_name}`}
                                className={`cursor-move text-[9px] font-bold px-1.5 py-0.5 rounded truncate ${a.status === 'Effectué' ? 'bg-green-100 text-green-700' : a.status === 'Manqué' || a.status === 'Annulé' ? 'bg-red-100 text-red-700' : 'bg-black text-[#39FF14] dark:bg-white dark:text-black'}`}
                              >
                                {new Date(a.date_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} {a.title || a.lead_name}
                              </div>
                            ))}
                          </div>
                       </div>
                     );
                  })}
                </div>
             </div>
           ) : (
             <div className="animate-in fade-in flex flex-col h-[60vh] min-h-[500px] overflow-y-auto custom-scrollbar relative">
                <div className="grid grid-cols-8 gap-1 mb-2 sticky top-0 bg-white dark:bg-zinc-950 z-10 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                   <div className="text-center text-[10px] font-black uppercase text-zinc-400">Heures</div>
                   {weekDays.map(day => {
                      const isToday = todayStart.toDateString() === day.toDateString();
                      return (
                         <div key={day.toISOString()} className={`text-center text-[10px] font-black uppercase tracking-widest ${isToday ? 'text-[#39FF14]' : 'text-zinc-500'}`}>
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'][day.getDay() === 0 ? 6 : day.getDay() - 1]} {day.getDate()}
                         </div>
                      );
                   })}
                </div>
                
                <div className="flex flex-col gap-1">
                   {hours.map(hour => (
                      <div key={hour} className="grid grid-cols-8 gap-1 min-h-[60px]">
                         <div className="text-right pr-2 text-[10px] font-black text-zinc-400 border-r border-zinc-100 dark:border-zinc-800 flex items-center justify-end">{hour}h00</div>
                         {weekDays.map(day => {
                            const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`;
                            const hourStr = String(hour).padStart(2, '0');
                            
                            const slotAppts = appointments.filter(a => {
                               const aDate = new Date(a.date_time);
                               return aDate.toDateString() === day.toDateString() && aDate.getHours() === hour;
                            });

                            return (
                               <div 
                                 key={`${dateStr}-${hourStr}`} 
                                 onDragOver={(e) => e.preventDefault()}
                                 onDrop={(e) => { e.stopPropagation(); handleDrop(e, dateStr, hourStr); }}
                                 onClick={() => { setFormState({ ...formState, date: dateStr, time: `${hourStr}:00` }); setIsModalOpen(true); }}
                                 className="border border-dashed border-zinc-200 dark:border-zinc-800/50 rounded-lg p-1 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors cursor-pointer flex flex-col gap-1"
                               >
                                  {slotAppts.map(a => (
                                     <div key={a.id} draggable onDragStart={(e) => { e.stopPropagation(); handleDragStart(e, a.id); }} className={`cursor-move text-[9px] font-bold px-1.5 py-1 rounded shadow-sm truncate ${a.status === 'Effectué' ? 'bg-green-100 text-green-700' : 'bg-black text-[#39FF14] dark:bg-white dark:text-black'}`}>
                                        {a.title || a.lead_name}
                                     </div>
                                  ))}
                               </div>
                            );
                         })}
                      </div>
                   ))}
                </div>
             </div>
           )}
        </div>
      </div>

      {/* MODALE CRÉATION RDV */}
      {isModalOpen && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setIsModalOpen(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-zinc-950 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
            <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2"><CalendarIcon size={20} className="text-[#39FF14]"/> Planifier un RDV</h3>
            
            <form onSubmit={handleSaveAppointment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Sélectionner un Lead *</label>
                <select required value={formState.lead_id} onChange={e => setFormState({...formState, lead_id: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14] cursor-pointer appearance-none">
                  <option value="">-- Choisir un lead --</option>
                  {leads.map(l => <option key={l.id} value={l.id}>{l.full_name} ({l.phone})</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Titre du RDV (Optionnel)</label>
                <input type="text" placeholder="Ex: Appel de qualification" value={formState.title} onChange={e => setFormState({...formState, title: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Date *</label>
                  <input type="date" required value={formState.date} onChange={e => setFormState({...formState, date: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14]" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Heure *</label>
                  <input type="time" required value={formState.time} onChange={e => setFormState({...formState, time: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm font-medium outline-none focus:border-[#39FF14]" />
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

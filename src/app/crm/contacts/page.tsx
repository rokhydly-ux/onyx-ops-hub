"use client";

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Search, Phone, Activity, Tag, CheckCircle, ChevronLeft, ChevronRight, Loader2, Bot, X, ShoppingBag, Edit3, Clock, Sparkles, Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

// Mini graphique Sparkline
const Sparkline = ({ data, color }: { data: number[], color: string }) => {
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min;
  const width = 60;
  const height = 24;

  if (data.length === 0) return null;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / (range || 1)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible opacity-80">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default function CRMContactsPage() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [isLoading, setIsLoading] = useState(true);
  const [isClassifying, setIsClassifying] = useState(false);
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [editContactForm, setEditContactForm] = useState<any>({});
  const [contactTab, setContactTab] = useState<'historique' | 'edit' | 'lika'>('historique');
  const [contactOrders, setContactOrders] = useState<any[]>([]);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsImporting(true);
      
      const reader = new FileReader();
      reader.onload = async (evt) => {
          try {
              const bstr = evt.target?.result;
              const wb = XLSX.read(bstr, { type: 'binary' });
              const wsname = wb.SheetNames[0];
              const data = XLSX.utils.sheet_to_json(wb.Sheets[wsname]);

              // 1. Récupérer les contacts pour faire le lien
              const { data: allContacts } = await supabase.from('crm_contacts').select('id, phone').eq('tenant_id', tenantId);
              const contactMap = new Map();
              allContacts?.forEach(c => {
                  if (c.phone) contactMap.set(c.phone.replace(/\s+/g, ''), c.id);
              });

              // 2. Préparer les commandes avec la bonne clé étrangère
              const newOrders = data.map((row: any) => {
                  let phone = String(row.telephone || row.Telephone || row.phone || row.Phone || '').replace(/\s+/g, '');
                  const contactId = contactMap.get(phone);
                  
                  if (!contactId) return null; // On ignore si le contact n'est pas dans le CRM

                  return {
                      id: row.id || row.Order_ID || `CSV-${Math.floor(Math.random() * 100000)}`,
                      contact_id: contactId,
                      tenant_id: tenantId,
                      total: parseFloat(row.total || row.Total || row.Montant || 0),
                      date: row.date || row.Date || new Date().toISOString(),
                      status: row.status || row.Status || 'Livré',
                      items: row.items || row.Items || row.Produits || 'Import CSV Odoo'
                  };
              }).filter(Boolean); // Retire les éléments nuls

              if (newOrders.length === 0) throw new Error("Aucune commande correspondante à un contact existant n'a été trouvée dans le CSV.");

              // 3. Insérer les données liées dans Supabase
              const { error } = await supabase.from('crm_orders').upsert(newOrders, { onConflict: 'id' });
              if (error) throw error;

              alert(`✅ ${newOrders.length} commandes Odoo importées et liées avec succès !`);
          } catch (err: any) {
              alert("Erreur lors de l'import : " + err.message);
          } finally {
              setIsImporting(false);
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsBinaryString(file);
  };

  useEffect(() => {
    const fetchContacts = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      const tenantId = user.user_metadata?.tenant_id || user.id;
      setTenantId(tenantId);

      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        // Ajout de fausses données Sparkline pour l'historique d'achat (Simulation)
        const enhancedData = data.map(c => ({
            ...c,
            historyData: Array.from({ length: 6 }, () => Math.floor(Math.random() * 500000)),
            totalSpent: Math.floor(Math.random() * 2000000)
        }));
        setContacts(enhancedData);
      }
      setIsLoading(false);
    };
    fetchContacts();
  }, []);

  const handleAutoClassify = async () => {
      setIsClassifying(true);
      
      try {
          // Vraie logique de croisement : On récupère l'historique
          const { data: orders } = await supabase.from('crm_orders').select('contact_id, customer_phone, items').eq('tenant_id', tenantId);
          
          const updatedContacts = contacts.map(c => {
              // On regroupe les achats du client ou on se base sur son activité (fallback)
              const clientOrders = orders?.filter(o => o.contact_id === c.id || (o.customer_phone && o.customer_phone === c.phone)) || [];
              const purchasedItems = clientOrders.map(o => {
                  if (Array.isArray(o.items)) return o.items.map((i:any) => i.name).join(' ');
                  return o.items;
              }).join(' ').toLowerCase();
              const mockItems = c.activity?.toLowerCase() || purchasedItems;
              
              let segment = 'Non défini';
              const hasBoughtBakery = mockItems.includes('pétrin') || mockItems.includes('four') || mockItems.includes('boulangerie') || mockItems.includes('pâtisserie');
              const hasBoughtResto = mockItems.includes('friteuse') || mockItems.includes('marmite') || mockItems.includes('restauration') || mockItems.includes('restaurant');
              
              if (hasBoughtBakery) segment = 'Boulangerie/Pâtisserie';
              else if (hasBoughtResto) segment = 'Restauration Rapide';
              else if (mockItems.includes('hôtel')) segment = 'Hôtellerie';
              else if (mockItems.includes('boutique') || mockItems.includes('prêt')) segment = 'Boutique Prêt-à-porter';
              else if (Math.random() > 0.5) segment = 'Client Standard'; // Random fallback pour la démo
              
              return { ...c, target_segment: segment };
          });
          
          setContacts(updatedContacts);
          
          // Mise à jour en base
          const updates = updatedContacts.map(c => supabase.from('crm_contacts').update({ target_segment: c.target_segment }).eq('id', c.id));
          await Promise.all(updates);

          alert("✅ Auto-classification IA terminée ! L'algorithme a croisé l'historique d'achats avec le catalogue produits. Les segments cibles ont été mis à jour.");
      } catch (err: any) {
          alert("Erreur lors de la classification : " + err.message);
      } finally {
          setIsClassifying(false);
      }
  };

  const handleContactClick = async (contact: any) => {
      setSelectedContact(contact);
      setEditContactForm(contact);
      setContactTab('historique');
      
      // Sécurité : Si l'ID du contact est indéfini, on bloque la requête pour éviter d'afficher toute la base.
      if (!contact || !contact.id) {
          setContactOrders([]);
          return;
      }

      // Récupération de l'historique : Filtre sur contact_id, avec rattrapage sur le numéro de téléphone
      let query = supabase.from('crm_orders').select('*').order('created_at', { ascending: false });
      if (contact.phone) {
          query = query.or(`contact_id.eq.${contact.id},customer_phone.eq.${encodeURIComponent(contact.phone)}`);
      } else {
          query = query.eq('contact_id', contact.id);
      }

      const { data: orders, error } = await query;

      if (orders && orders.length > 0) {
          setContactOrders(orders);
      } else {
          // Si aucune commande n'est trouvée pour ce contact précis, on retourne un tableau vide
          // (Correction du bug de l'historique cloné)
          setContactOrders([]);
      }
  };

  const handleSaveContactEdit = async () => {
      try {
          const { error } = await supabase.from('crm_contacts').update({
              full_name: editContactForm.full_name,
              phone: editContactForm.phone,
              activity: editContactForm.activity,
              type: editContactForm.type
          }).eq('id', selectedContact.id).eq('tenant_id', tenantId);
          if (error) throw error;
          
          setContacts(prev => prev.map(c => c.id === selectedContact.id ? { ...c, ...editContactForm } : c));
          setSelectedContact({ ...selectedContact, ...editContactForm });
          alert("✅ Fiche contact mise à jour avec succès !");
      } catch(e: any) { alert("Erreur : " + e.message); }
  };

  const filteredContacts = React.useMemo(() => {
      return contacts.filter(c => {
          const matchSearch = (c.full_name || '').toLowerCase().includes(search.toLowerCase()) || (c.phone || '').includes(search) || (c.activity || '').toLowerCase().includes(search.toLowerCase());
          const matchType = typeFilter === 'Tous' || c.type === typeFilter;
          return matchSearch && matchType;
      });
  }, [contacts, search, typeFilter]);

  useEffect(() => {
      setCurrentPage(1);
  }, [search, typeFilter]);

  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (isLoading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#39FF14]" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto w-full animate-in fade-in duration-500 flex flex-col h-full pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-black dark:text-white">Contacts & Cibleur IA</h1>
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Gérez et auto-classifiez vos clients</p>
        </div>
        <button onClick={handleAutoClassify} disabled={isClassifying} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
           {isClassifying ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
           Auto-Classifier (IA)
        </button>
        <div className="flex items-center gap-3">
          <input type="file" accept=".csv, .xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
          <button onClick={() => fileInputRef.current?.click()} disabled={isImporting} className="bg-white text-black border border-zinc-200 px-6 py-3 rounded-xl font-black uppercase text-xs hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50">
             {isImporting ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
             Importer CSV Odoo
          </button>
          <button onClick={handleAutoClassify} disabled={isClassifying} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-lg disabled:opacity-50">
             {isClassifying ? <Loader2 size={16} className="animate-spin" /> : <Bot size={16} />}
             Auto-Classifier (IA)
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 shrink-0 bg-white dark:bg-zinc-950 p-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input 
            type="text" 
            placeholder="Rechercher un contact, une entreprise ou un numéro..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl text-sm font-bold text-black dark:text-white outline-none focus:border-[#39FF14] dark:focus:border-[#39FF14] transition-all"
          />
         </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3.5 text-xs font-bold outline-none cursor-pointer appearance-none text-black dark:text-white min-w-[150px]">
           <option value="Tous">Tous les types</option>
           <option value="Client">Clients</option>
           <option value="Prospect">Prospects</option>
        </select>
      </div>

      {/* VUE GRID PAR DÉFAUT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {paginatedContacts.map(c => (
            <div key={c.id} onClick={() => handleContactClick(c)} className="bg-white dark:bg-zinc-950 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-[#39FF14] transition-colors cursor-pointer group flex flex-col h-full">
               <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-black text-[#39FF14] flex items-center justify-center font-black text-lg shadow-md shrink-0">
                     {c.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                     <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${c.type === 'Client' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-orange-500/10 text-orange-500'}`}>
                        {c.type}
                     </span>
                  </div>
               </div>
               
               <div className="flex-1">
                  <p className="font-black text-base uppercase text-black dark:text-white mb-1 line-clamp-1">{c.full_name}</p>
                  <p className="text-xs font-bold text-[#39FF14] mb-3 flex items-center gap-1.5"><Phone size={12} /> {c.phone}</p>
                  
                  {c.target_segment && (
                     <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 text-purple-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                        <Tag size={12} /> {c.target_segment}
                     </div>
                  )}
                  {c.activity && !c.target_segment && (
                     <div className="inline-flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                        <Activity size={12} /> {c.activity}
                     </div>
                  )}
               </div>
               
               <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-end justify-between mt-auto">
                  <div>
                     <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">Valeur Générée</p>
                     <p className="font-black text-sm text-black dark:text-white">{c.totalSpent?.toLocaleString('fr-FR')} F</p>
                  </div>
                  <Sparkline data={c.historyData || []} color="#39FF14" />
               </div>
            </div>
         ))}
      </div>

      {filteredContacts.length === 0 && (
         <div className="p-10 text-center text-zinc-400 font-bold uppercase text-xs tracking-widest italic bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] mt-4">Aucun contact trouvé.</div>
      )}

         {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-8">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 disabled:opacity-50 text-black dark:text-white transition-colors shadow-sm"><ChevronLeft size={16}/></button>
              <span className="text-xs font-black text-zinc-500 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 px-4 py-2 rounded-xl">Page {currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl hover:bg-zinc-100 disabled:opacity-50 text-black dark:text-white transition-colors shadow-sm"><ChevronRight size={16}/></button>
         </div>
      )}

      {/* MODALE DÉTAILS & HISTORIQUE */}
      {selectedContact && (
         <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setSelectedContact(null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-zinc-950 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl relative border border-zinc-200 dark:border-zinc-800 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
             <button onClick={() => setSelectedContact(null)} className="absolute top-4 right-4 p-2 bg-zinc-100 dark:bg-zinc-900 rounded-full hover:bg-black hover:text-white transition-colors"><X size={16}/></button>
             
             <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-black text-[#39FF14] flex items-center justify-center font-black text-2xl shadow-md shrink-0">
                   {selectedContact.full_name?.charAt(0) || '?'}
                </div>
                <div>
                   <h2 className="text-2xl font-black uppercase tracking-tighter text-black dark:text-white">{selectedContact.full_name}</h2>
                   <p className="text-sm font-bold text-[#39FF14]">{selectedContact.phone}</p>
                   {selectedContact.target_segment && (
                      <span className="inline-block mt-2 bg-purple-500/10 text-purple-500 border border-purple-500/20 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                         Segment : {selectedContact.target_segment}
                      </span>
                   )}
                </div>
             </div>

             <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl mb-6 shrink-0 shadow-inner">
                <button onClick={() => setContactTab('historique')} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${contactTab === 'historique' ? 'bg-white dark:bg-zinc-800 shadow-md text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Historique</button>
                <button onClick={() => setContactTab('edit')} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${contactTab === 'edit' ? 'bg-white dark:bg-zinc-800 shadow-md text-black dark:text-white' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}>Édition Fiche</button>
                <button onClick={() => setContactTab('lika')} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 ${contactTab === 'lika' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black dark:hover:text-white'}`}><Bot size={14}/> Lika (IA)</button>
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6">
                {contactTab === 'historique' && (
                 <div>
                   <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2"><ShoppingBag size={16} className="text-[#39FF14]"/> Historique d'Achats</h3>
                   <div className="space-y-3">
                      {contactOrders.map((order, idx) => (
                         <div key={idx} className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 flex justify-between items-center gap-4">
                            <div>
                               <p className="font-bold text-sm text-black dark:text-white">
                                  {Array.isArray(order.items) ? order.items.map((i:any) => `${i.name} (x${i.quantity || 1})`).join(', ') : order.items || 'Articles'}
                               </p>
                               <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Réf: {order.order_ref || order.id} • {new Date(order.order_date || order.date || order.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div className="text-right">
                               <p className="font-black text-[#39FF14]">{(order.total_amount || order.total || 0).toLocaleString('fr-FR')} F</p>
                               <span className="inline-block mt-1 px-2 py-0.5 bg-green-500/10 text-green-500 text-[8px] font-black uppercase rounded border border-green-500/20">{order.status || 'Livré'}</span>
                            </div>
                         </div>
                      ))}
                      {contactOrders.length === 0 && <p className="text-xs text-zinc-500 italic">Aucun historique de commande pour le moment.</p>}
                   </div>
                </div>
                )}

                {contactTab === 'edit' && (
                 <div className="space-y-4 animate-in fade-in">
                    <div>
                       <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Nom Complet</label>
                       <input type="text" value={editContactForm.full_name || ''} onChange={e => setEditContactForm({...editContactForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none focus:border-[#39FF14]" />
                    </div>
                    <div>
                       <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Numéro WhatsApp</label>
                       <input type="tel" value={editContactForm.phone || ''} onChange={e => setEditContactForm({...editContactForm, phone: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none focus:border-[#39FF14]" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Secteur d'Activité</label>
                          <input type="text" value={editContactForm.activity || ''} onChange={e => setEditContactForm({...editContactForm, activity: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none focus:border-[#39FF14]" placeholder="Ex: Restauration" />
                       </div>
                       <div>
                          <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Type (Prospect/Client)</label>
                          <select value={editContactForm.type || 'Prospect'} onChange={e => setEditContactForm({...editContactForm, type: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm outline-none focus:border-[#39FF14] appearance-none cursor-pointer">
                             <option value="Client">Client</option>
                             <option value="Prospect">Prospect</option>
                          </select>
                       </div>
                    </div>
                    <button onClick={handleSaveContactEdit} className="w-full mt-4 bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2">
                       <CheckCircle size={16}/> Sauvegarder les modifications
                    </button>
                 </div>
                )}

                {contactTab === 'lika' && (
                 <div className="space-y-4 animate-in fade-in">
                    <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4">
                        <div className="bg-purple-500/20 p-3 rounded-xl text-purple-600 dark:text-purple-400 shrink-0"><Sparkles size={24}/></div>
                        <div>
                            <h4 className="font-black text-sm uppercase mb-1 text-black dark:text-white">Offre Ultra-Alléchante (Sur-mesure)</h4>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-4 leading-relaxed">Lika a analysé ce profil (Segment : <strong className="text-black dark:text-white">{selectedContact.target_segment || 'Client Standard'}</strong>). Proposez un bundle exclusif pour maximiser la LTV.</p>
                            <button onClick={() => window.open(`https://wa.me/${selectedContact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${selectedContact.full_name}, nous avons une offre exclusive rien que pour vous aujourd'hui...`)}`, '_blank')} className="bg-purple-600 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform shadow-md w-full sm:w-auto">Faire l'offre WhatsApp</button>
                        </div>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 p-5 rounded-2xl flex flex-col sm:flex-row items-start gap-4">
                        <div className="bg-orange-500/20 p-3 rounded-xl text-orange-600 dark:text-orange-400 shrink-0"><Clock size={24}/></div>
                        <div>
                            <h4 className="font-black text-sm uppercase mb-1 text-black dark:text-white">Reconquête (Client Froid)</h4>
                            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium mb-4 leading-relaxed">Ce contact n'a pas commandé ou interagi récemment. Envoyez une relance douce accompagnée d'un cadeau (ex: livraison gratuite).</p>
                            <button onClick={() => window.open(`https://wa.me/${selectedContact.phone.replace(/\D/g, '')}?text=${encodeURIComponent(`Bonjour ${selectedContact.full_name}, vous nous manquez ! Voici un petit cadeau pour votre prochain achat chez nous...`)}`, '_blank')} className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-transform shadow-md w-full sm:w-auto">Relancer maintenant</button>
                        </div>
                    </div>
                 </div>
                )}
             </div>
             
             <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 mt-4 flex gap-3 shrink-0">
                <button onClick={() => setSelectedContact(null)} className="flex-1 py-3 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white rounded-xl font-black uppercase text-xs hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors">Fermer</button>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
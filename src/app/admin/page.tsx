"use client";

import React, { useState, useEffect } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, Users, Box, Wallet, Handshake, Megaphone, 
  Settings, LogOut, TrendingUp, Search, Plus, Filter, Calendar, 
  CheckCircle, Clock, AlertCircle, X, Sparkles, Phone, Mail, FileText, ChevronRight, BarChart3, CreditCard, PlayCircle, Star
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

// --- TYPES ---
type ViewType = 'dashboard' | 'crm' | 'ecosystem' | 'finance' | 'partners' | 'marketing';
type IAAction = { id: string; module: string; title: string; desc: string; date: string; status: 'Planifié' | 'En cours' | 'Fait' };

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // --- STATES GLOBALES ---
  const [globalFilterDate, setGlobalFilterDate] = useState('Ce Mois');
  const [actionsIA, setActionsIA] = useState<IAAction[]>([
    { id: '1', module: 'CRM', title: 'Relance Essai - Boutique Fatou', desc: 'Essai Onyx Vente expire demain.', date: 'Aujourd\'hui', status: 'Planifié' },
    { id: '2', module: 'Partenaires', title: 'Booster Moussa D.', desc: 'Aucune vente depuis 15 jours. Lui envoyer le script de vente promo.', date: 'Demain', status: 'Planifié' }
  ]);

  // --- STATES CRM ---
  const [contacts, setContacts] = useState<any[]>([]);
  const [crmSearch, setCrmSearch] = useState("");
  const [crmTypeFilter, setCrmTypeFilter] = useState("Tous");
  const [showContactModal, setShowContactModal] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [showRapportIA, setShowRapportIA] = useState(false);
  const [crmCardFilter, setCrmCardFilter] = useState<string | null>(null);

  // --- STATES PARTENAIRES ---
  const [partners, setPartners] = useState<any[]>([]);
  const [partnerCardFilter, setPartnerCardFilter] = useState<string | null>(null);
  const [showPartnerIAScan, setShowPartnerIAScan] = useState(false);

  // --- INIT DATA ---
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Simulation de récupération pour démo, remplace par tes requêtes Supabase réelles
    setContacts([
      { id: '1', full_name: 'Magatte Fall', phone: '77 123 45 67', type: 'Prospect', saas: 'Onyx Vente', trial_end: '2026-03-05', sub_end: null, status: 'En essai (J-7)', created_at: '2026-03-01' },
      { id: '2', full_name: 'Boutique Fatou', phone: '76 987 65 43', type: 'Client', saas: 'Pack Trio', trial_end: null, sub_end: '2026-03-04', status: 'Actif', created_at: '2025-12-01' },
      { id: '3', full_name: 'Resto Dakar', phone: '78 555 44 33', type: 'Client', saas: 'Onyx Menu', trial_end: null, sub_end: '2026-04-10', status: 'Actif', created_at: '2026-01-15' },
    ]);
    setPartners([
      { id: '1', full_name: 'Moussa D.', contact: '77 000 00 00', activity: 'Étudiant', objective: '10/mois', sales: 12, status: 'Actif', created_at: '2026-02-28' },
      { id: '2', full_name: 'Cheikh N.', contact: '76 111 22 33', activity: 'Freelance', objective: '20/mois', sales: 45, status: 'Top Performer', created_at: '2025-11-10' },
      { id: '3', full_name: 'Awa C.', contact: '78 999 88 77', activity: 'Commerçante', objective: '5/mois', sales: 0, status: 'Inactif', created_at: '2026-03-01' },
    ]);
  };

  // --- LOGIC CRM : SAUVEGARDE & CONVERSION ---
  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    // Optimistic UI Update
    if(editingContact.id) {
      setContacts(contacts.map(c => c.id === editingContact.id ? editingContact : c));
    } else {
      setContacts([{ ...editingContact, id: Date.now().toString(), created_at: new Date().toISOString().split('T')[0] }, ...contacts]);
    }
    setShowContactModal(false);
    
    // Logique Supabase réelle à décommenter
    /* try {
      if(editingContact.id) {
        await supabase.from('leads').update(editingContact).eq('id', editingContact.id);
      } else {
        await supabase.from('leads').insert([editingContact]);
      }
    } catch(err) { console.error(err); }
    */
  };

  // --- SCANS IA ---
  const runCrmScan = () => {
    setShowRapportIA(true);
    setTimeout(() => {
      setActionsIA(prev => [{ id: Date.now().toString(), module: 'CRM', title: 'Relance Expiration', desc: 'Boutique Fatou expire demain.', date: 'Aujourd\'hui', status: 'Planifié' }, ...prev]);
    }, 1500);
  };

  const runPartnerScan = () => {
    setShowPartnerIAScan(true);
    setTimeout(() => {
      setActionsIA(prev => [{ id: Date.now().toString(), module: 'Partenaires', title: 'Coaching Awa C.', desc: 'Nouveau partenaire à former sur l\'argumentaire Pack Trio.', date: 'Demain', status: 'Planifié' }, ...prev]);
      setShowPartnerIAScan(false);
      alert("Scan Partenaires terminé. Nouvelles actions ajoutées au planning.");
    }, 2000);
  };

  // --- RENDERERS ---
  return (
    <div className={`flex h-screen bg-zinc-50 ${inter.className} text-black overflow-hidden`}>
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col z-20 shadow-sm hidden md:flex">
        <div className="p-6">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black tracking-tighter uppercase`}>ONYX<span className="text-[#39FF14]">OPS</span></h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 pl-2">Menu Principal</p>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'crm', icon: Users, label: 'Membres & CRM' },
                { id: 'ecosystem', icon: Box, label: 'Écosystème (9 SaaS)' },
                { id: 'finance', icon: Wallet, label: 'Finances' },
                { id: 'partners', icon: Handshake, label: 'Partenaires' },
              ].map(item => (
                <button key={item.id} onClick={() => setActiveView(item.id as ViewType)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === item.id ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'}`}>
                  <item.icon size={18} /> {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 pl-2">Marketing & Ventes</p>
            <button onClick={() => setActiveView('marketing')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'marketing' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'}`}>
              <Megaphone size={18} /> Marketing & Blog
            </button>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* TOPBAR */}
        <header className="bg-white border-b border-zinc-200 h-20 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>
            {activeView === 'dashboard' ? 'Terminal' : activeView === 'crm' ? 'CRM & Contacts' : activeView === 'partners' ? 'Ambassadeurs' : activeView}
          </h2>
          <div className="flex items-center gap-6">
            {activeView === 'dashboard' && (
              <div className="flex items-center bg-zinc-100 p-1 rounded-xl">
                {['Aujourd\'hui', 'Ce Mois', 'Année'].map(filter => (
                   <button key={filter} onClick={() => setGlobalFilterDate(filter)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase transition ${globalFilterDate === filter ? 'bg-white shadow-sm text-black' : 'text-zinc-500 hover:text-black'}`}>
                     {filter}
                   </button>
                ))}
              </div>
            )}
            <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-1.5 pr-4 rounded-full cursor-pointer hover:bg-zinc-100 transition">
              <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=39FF14" className="w-8 h-8 rounded-full" alt="Admin" />
              <div className="text-left hidden sm:block">
                <p className="text-[10px] font-black uppercase leading-none text-black">ADMINISTRATEUR</p>
                <p className="text-[8px] font-bold text-zinc-500 uppercase">Profil & Réglages</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU DYNAMIQUE */}
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* ========================================================= */}
          {/* VUE : DASHBOARD ACCUEIL (Avec Histogramme et Top 3)       */}
          {/* ========================================================= */}
          {activeView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto">
              {/* KPI GLOBALES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={64}/></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Chiffre d'Affaires ({globalFilterDate})</p>
                  <p className={`${spaceGrotesk.className} text-4xl font-black text-[#39FF14]`}>1.245.000 F</p>
                  <p className="text-xs font-bold text-zinc-400 mt-2 flex items-center gap-1"><TrendingUp size={14} className="text-[#39FF14]"/> +15% vs période préc.</p>
                </div>
                <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Leads & Nouveaux Contacts</p>
                  <p className={`${spaceGrotesk.className} text-4xl font-black`}>142</p>
                  <p className="text-xs font-bold text-zinc-500 mt-2">En attente de traitement : 12</p>
                </div>
                <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-2 flex items-center gap-2"><Sparkles size={12}/> Vues Articles Blog</p>
                  <p className={`${spaceGrotesk.className} text-4xl font-black`}>8.405</p>
                  <p className="text-xs font-bold text-zinc-600 mt-2">Meilleur : "Digitalisation 2026"</p>
                </div>
              </div>

              {/* HISTOGRAMME : VENTES PAR JOUR */}
              <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm">
                 <h3 className="font-black uppercase text-sm mb-8 flex items-center gap-2"><BarChart3 className="text-[#39FF14]"/> VENTES PAR JOUR (7 DERNIERS JOURS)</h3>
                 <div className="h-48 flex items-end justify-between gap-4">
                    {[40, 60, 45, 80, 95, 70, 85].map((val, i) => (
                       <div key={i} className="flex-1 bg-zinc-100 rounded-t-xl relative group h-full flex items-end">
                          <div style={{ height: `${val}%` }} className="w-full bg-[#39FF14] rounded-t-xl transition-all duration-500 group-hover:bg-black"></div>
                          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-zinc-400">J-{6-i}</span>
                       </div>
                    ))}
                 </div>
              </div>

              {/* TOP 3 & TRANSACTIONS (RESTAURÉ SOUS L'HISTOGRAMME) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm flex flex-col justify-center">
                    <h3 className="font-black uppercase text-sm mb-6 flex items-center gap-2"><TrendingUp className="text-[#39FF14]"/> TOP 3 PRODUITS</h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center font-black text-sm"><span className="text-zinc-500">#1 Pack Trio</span><span>89 ventes</span></div>
                       <div className="flex justify-between items-center font-black text-sm"><span className="text-zinc-500">#2 Onyx Solo</span><span>142 ventes</span></div>
                       <div className="flex justify-between items-center font-black text-sm"><span className="text-zinc-500">#3 Pack Full</span><span>45 ventes</span></div>
                    </div>
                    <button className="mt-8 text-[10px] font-black uppercase text-zinc-400 hover:text-black transition tracking-widest text-left">CLIQUEZ POUR VOIR L'ÉCOSYSTÈME</button>
                 </div>
                 <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm min-h-[250px]">
                    <h3 className="font-black uppercase text-sm mb-6 flex items-center gap-2"><CreditCard className="text-[#39FF14]"/> DERNIÈRES TRANSACTIONS</h3>
                    <div className="text-zinc-400 font-bold text-sm">
                       Aucune transaction récente.
                    </div>
                 </div>
              </div>

              {/* ACTIONS PLANIFIÉES IA (NOUVEAU) */}
              <div className="bg-zinc-900 text-white border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black uppercase text-sm flex items-center gap-2"><Sparkles className="text-[#39FF14]"/> ACTIONS PLANIFIÉES DEPUIS LE SCAN IA</h3>
                    <span className="bg-[#39FF14] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">{actionsIA.length} en attente</span>
                 </div>
                 <div className="space-y-3">
                    {actionsIA.map(action => (
                       <div key={action.id} className="bg-zinc-800 p-4 rounded-2xl flex justify-between items-center group hover:bg-black hover:border-[#39FF14] border border-transparent transition cursor-pointer">
                          <div>
                             <p className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest mb-1">{action.module} • {action.date}</p>
                             <p className="font-bold text-sm">{action.title}</p>
                             <p className="text-xs text-zinc-400 truncate max-w-md">{action.desc}</p>
                          </div>
                          <button className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase opacity-0 group-hover:opacity-100 transition">Exécuter</button>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VUE : CRM & CONTACTS (Filtres Avancés & Conversion)       */}
          {/* ========================================================= */}
          {activeView === 'crm' && (
            <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
              
              {/* CARTES CLIQUABLES (NOUVEAU) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 {[
                    { id: 'new_clients', label: 'Nouveaux Clients', val: 12, icon: CheckCircle, color: 'text-black bg-white border-zinc-200' },
                    { id: 'new_prospects', label: 'Nouveaux Prospects', val: 45, icon: Users, color: 'text-black bg-white border-zinc-200' },
                    { id: 'exp_trials', label: 'Essais Expirants', val: 8, icon: Clock, color: 'text-[#39FF14] bg-black border-black shadow-lg' },
                    { id: 'exp_subs', label: 'Abonnements Expirants', val: 3, icon: AlertCircle, color: 'text-red-500 bg-red-50 border-red-100' },
                 ].map(card => (
                    <div key={card.id} onClick={() => setCrmCardFilter(crmCardFilter === card.id ? null : card.id)} className={`p-5 rounded-[2rem] border cursor-pointer hover:scale-105 transition-all ${card.color} ${crmCardFilter === card.id ? 'ring-4 ring-[#39FF14]/50' : ''}`}>
                       <card.icon size={20} className="mb-3" />
                       <p className={`${spaceGrotesk.className} text-3xl font-black mb-1`}>{card.val}</p>
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{card.label}</p>
                    </div>
                 ))}
              </div>

              {/* BARRE D'OUTILS & RECHERCHE AVANCÉE */}
              <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                  <input type="text" placeholder="Rechercher par nom, téléphone, SaaS..." value={crmSearch} onChange={(e) => setCrmSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#39FF14]/50 transition" />
                </div>
                <select value={crmTypeFilter} onChange={(e) => setCrmTypeFilter(e.target.value)} className="px-4 py-3 bg-zinc-50 rounded-2xl font-bold text-sm outline-none border-none cursor-pointer w-full md:w-auto">
                  <option>Tous</option><option>Client</option><option>Prospect</option><option>Partenaire</option>
                </select>
                <div className="flex gap-2 w-full md:w-auto">
                   <button onClick={runCrmScan} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-xs hover:scale-105 transition shadow-lg">
                     <Sparkles size={16} /> Scan IA
                   </button>
                   <button onClick={() => { setEditingContact({ full_name: '', phone: '', type: 'Prospect', saas: '' }); setShowContactModal(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#39FF14] text-black px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg">
                     <Plus size={16} /> Nouveau
                   </button>
                </div>
              </div>

              {/* MODALE RAPPORT IA CRM */}
              {showRapportIA && (
                 <div className="bg-white border-2 border-[#39FF14] rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in">
                    <button onClick={() => setShowRapportIA(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black"><X size={20}/></button>
                    <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 flex items-center gap-2`}><Sparkles className="text-[#39FF14]"/> Rapport IA CRM</h3>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-6">Analyse effectuée sur les expirations et prospects chauds.</p>
                    
                    <div className="space-y-4">
                       <div className="border border-zinc-200 p-6 rounded-[2rem] flex justify-between items-center bg-zinc-50">
                          <div>
                             <p className="font-black text-lg uppercase">Boutique Fatou</p>
                             <p className="text-xs font-bold text-zinc-500 italic">Essai expire demain. Fort usage catalogue.</p>
                          </div>
                          <button className="bg-black text-[#39FF14] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition shadow-md">Offrir Promo (WhatsApp)</button>
                       </div>
                       <div className="border border-zinc-200 p-6 rounded-[2rem] flex justify-between items-center bg-zinc-50">
                          <div>
                             <p className="font-black text-lg uppercase">Resto Dakar</p>
                             <p className="text-xs font-bold text-zinc-500 italic">Client Menu depuis 6 mois. Pas de logiciel RH.</p>
                          </div>
                          <button className="bg-black text-[#39FF14] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition shadow-md">Upsell Onyx Staff</button>
                       </div>
                    </div>
                 </div>
              )}

              {/* TABLEAU DES CONTACTS */}
              <div className="bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Statut / Type</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Produit SaaS</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.filter(c => 
                       (crmTypeFilter === 'Tous' || c.type === crmTypeFilter) &&
                       (c.full_name.toLowerCase().includes(crmSearch.toLowerCase()) || c.saas.toLowerCase().includes(crmSearch.toLowerCase()) || c.phone.includes(crmSearch))
                    ).map((c, i) => (
                      <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50 transition group">
                        <td className="p-6">
                          <p className="font-black text-sm uppercase">{c.full_name}</p>
                          <p className="text-xs text-zinc-500 font-bold">{c.phone}</p>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${c.type === 'Client' ? 'bg-[#39FF14]/20 text-black' : c.type === 'Partenaire' ? 'bg-black text-[#39FF14]' : 'bg-zinc-200 text-zinc-600'}`}>{c.type}</span>
                          <p className="text-[10px] font-bold text-zinc-400 mt-2">{c.status}</p>
                        </td>
                        <td className="p-6 font-bold text-sm">{c.saas || '-'}</td>
                        <td className="p-6 text-right">
                          <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-[10px] font-black uppercase bg-white border border-zinc-200 px-4 py-2 rounded-lg hover:border-black transition">Éditer Fiche</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* VUE : PARTENAIRES & AMBASSADEURS (Avec IA & 3 Cartes)     */}
          {/* ========================================================= */}
          {activeView === 'partners' && (
             <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
               
               {/* CARTES CLIQUABLES (NOUVEAU) */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div onClick={() => setPartnerCardFilter('last')} className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm cursor-pointer hover:border-[#39FF14] transition group">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Les 4 Derniers Inscrits</p>
                     <div className="flex items-center gap-4">
                        <div className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center"><UserPlus size={20}/></div>
                        <p className={`${spaceGrotesk.className} text-4xl font-black`}>12 <span className="text-sm font-normal text-zinc-500">ce mois</span></p>
                     </div>
                  </div>
                  <div onClick={() => setPartnerCardFilter('inactive')} className="bg-red-50 border border-red-100 p-8 rounded-[3rem] shadow-sm cursor-pointer hover:border-red-500 transition group">
                     <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Les 4 Moins Actifs (À Relancer)</p>
                     <div className="flex items-center gap-4">
                        <div className="bg-red-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center"><AlertCircle size={20}/></div>
                        <p className={`${spaceGrotesk.className} text-4xl font-black text-red-600`}>Awa & co.</p>
                     </div>
                  </div>
                  <div onClick={() => setPartnerCardFilter('top')} className="bg-black border border-[#39FF14]/30 shadow-[0_10px_30px_rgba(57,255,20,0.15)] p-8 rounded-[3rem] cursor-pointer hover:scale-105 transition group">
                     <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-2">Les 4 Plus Productifs</p>
                     <div className="flex items-center gap-4">
                        <div className="bg-[#39FF14] text-black w-12 h-12 rounded-2xl flex items-center justify-center"><Star size={20}/></div>
                        <p className={`${spaceGrotesk.className} text-4xl font-black text-white`}>Cheikh N.</p>
                     </div>
                  </div>
               </div>

               {/* BARRE D'OUTILS IA */}
               <div className="bg-[#39FF14]/10 border border-[#39FF14] p-6 rounded-[2rem] flex justify-between items-center mb-8">
                  <div>
                     <h3 className="font-black uppercase text-sm flex items-center gap-2"><Sparkles size={16}/> Gestion IA Ambassadeurs</h3>
                     <p className="text-xs font-bold text-zinc-600">L'IA analyse vos 3 cartes (Nouveaux, Inactifs, Top) et génère des actions personnalisées.</p>
                  </div>
                  <button onClick={runPartnerScan} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition shadow-md whitespace-nowrap">
                     Lancer le Scan Global IA
                  </button>
               </div>

               {/* TABLEAU AMBASSADEURS */}
               <div className="bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                   <thead className="bg-zinc-50 border-b border-zinc-200">
                     <tr>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Ambassadeur</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Activité / Statut</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Ventes Réalisées</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {partners.map((p, i) => (
                       <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50 transition">
                         <td className="p-6">
                           <p className="font-black text-sm uppercase">{p.full_name}</p>
                           <p className="text-xs text-zinc-500 font-bold">{p.contact}</p>
                         </td>
                         <td className="p-6">
                           <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-zinc-200 text-black">{p.activity}</span>
                           <p className={`text-[10px] font-black uppercase mt-2 ${p.status === 'Top Performer' ? 'text-[#39FF14]' : p.status === 'Inactif' ? 'text-red-500' : 'text-zinc-500'}`}>{p.status}</p>
                         </td>
                         <td className="p-6 text-center font-black text-xl">{p.sales}</td>
                         <td className="p-6 text-right">
                           <button className="text-[10px] font-black uppercase bg-black text-white px-4 py-2 rounded-lg hover:bg-[#39FF14] hover:text-black transition">Détails</button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {/* ========================================================= */}
          {/* VUE : Ecosystème, Finance, Marketing (Restent basiques pour démo) */}
          {/* ========================================================= */}
          {(activeView === 'ecosystem' || activeView === 'finance' || activeView === 'marketing') && (
             <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-in zoom-in">
                <LayoutDashboard size={64} className="text-zinc-200 mb-6" />
                <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-4`}>Module en construction</h2>
                <p className="text-zinc-500 font-bold max-w-md">L'intégration complète de ce module est en cours de développement pour la V2 de l'interface admin.</p>
             </div>
          )}

        </div>
      </main>

      {/* ================= MODALE : EDITION FICHE CLIENT AVANCÉE ================= */}
      {showContactModal && editingContact && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-lg w-full relative shadow-2xl animate-in zoom-in">
            <button onClick={() => setShowContactModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
            
            <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-8`}>
              {editingContact.id ? 'Éditer Fiche' : 'Nouveau Contact'}
            </h2>

            <form onSubmit={handleSaveContact} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-2">Nom Complet</label>
                <input type="text" required value={editingContact.full_name} onChange={e => setEditingContact({...editingContact, full_name: e.target.value})} className="w-full mt-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-2">Téléphone WhatsApp</label>
                <input type="tel" required value={editingContact.phone} onChange={e => setEditingContact({...editingContact, phone: e.target.value})} className="w-full mt-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-2">Type (Conversion)</label>
                   <select value={editingContact.type} onChange={e => setEditingContact({...editingContact, type: e.target.value})} className="w-full mt-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none cursor-pointer">
                     <option value="Prospect">Prospect</option>
                     <option value="Client">Client</option>
                     <option value="Partenaire">Partenaire</option>
                   </select>
                 </div>
                 <div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-2">Produit d'intérêt / Actif</label>
                   <input type="text" value={editingContact.saas} onChange={e => setEditingContact({...editingContact, saas: e.target.value})} className="w-full mt-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" placeholder="Ex: Onyx Vente" />
                 </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 pl-2">Statut / Notes</label>
                <input type="text" value={editingContact.status || ''} onChange={e => setEditingContact({...editingContact, status: e.target.value})} className="w-full mt-1 p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" placeholder="Ex: À relancer, Actif..." />
              </div>

              <div className="pt-6">
                <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm hover:scale-105 transition shadow-xl flex justify-center items-center gap-2">
                  <CheckCircle size={18}/> Enregistrer la fiche
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
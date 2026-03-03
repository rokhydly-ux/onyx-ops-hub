"use client";

import React, { useState, useEffect } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, Users, Box, Wallet, Handshake, Megaphone, 
  Settings, LogOut, TrendingUp, Search, Plus, Filter, Calendar, 
  CheckCircle, Clock, AlertCircle, X, Sparkles, Phone, Mail, FileText, ChevronRight, BarChart3, CreditCard, PlayCircle, Star, UserPlus, ExternalLink, MessageSquare, Save, LogIn
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type ViewType = 'dashboard' | 'crm' | 'leads' | 'ecosystem' | 'finance' | 'partners' | 'marketing';
type IAAction = { id: string; module: string; title: string; desc: string; date: string; status: 'En attente' | 'En cours' | 'Réalisé' | 'Annulé'; phone: string; msg: string };

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [globalFilterDate, setGlobalFilterDate] = useState('Ce Mois');
  
  // Modales UI
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRapportIA, setShowRapportIA] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showSaasLogin, setShowSaasLogin] = useState<any>(null);
  
  // Data States
  const [editingContact, setEditingContact] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [contacts, setContacts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  
  // Filtres
  const [crmSearch, setCrmSearch] = useState("");
  const [crmTypeFilter, setCrmTypeFilter] = useState("Tous");
  const [crmCardFilter, setCrmCardFilter] = useState<string | null>(null);
  const [partnerCardFilter, setPartnerCardFilter] = useState<string | null>(null);
  const [partnerSearch, setPartnerSearch] = useState("");

  const [actionsIA, setActionsIA] = useState<IAAction[]>([
    { id: '1', module: 'CRM', title: 'Relance Essai - Boutique Fatou', desc: 'Essai Onyx Vente expire demain.', date: 'Aujourd\'hui', status: 'En attente', phone: '221769876543', msg: 'Bonjour Boutique Fatou, votre essai Onyx Vente expire demain. Souhaitez-vous le prolonger avec notre code promo de -20% ?' },
    { id: '2', module: 'Partenaires', title: 'Booster Moussa D.', desc: 'Aucune vente depuis 15 jours. Lui envoyer le script.', date: 'Demain', status: 'En attente', phone: '221770000000', msg: 'Salut Moussa, voici un nouveau script de vente qui marche très bien en ce moment pour vendre le Pack Trio.' }
  ]);

  const ECOSYSTEM_SAAS = [
    { id: "vente", name: "Onyx Vente", desc: "Catalogue & Devis WhatsApp", color: "bg-blue-500" },
    { id: "tiak", name: "Onyx Tiak", desc: "Logistique & Livreurs", color: "bg-orange-500" },
    { id: "stock", name: "Onyx Stock", desc: "Gestion d'Inventaire", color: "bg-purple-500" },
    { id: "menu", name: "Onyx Menu", desc: "Menu QR & Commandes", color: "bg-red-500" },
    { id: "booking", name: "Onyx Booking", desc: "Réservations & Acomptes", color: "bg-pink-500" },
    { id: "staff", name: "Onyx Staff", desc: "Pointage & Paie", color: "bg-cyan-500" },
    { id: "trio", name: "Pack Trio", desc: "Vente + Stock + Tiak", color: "bg-emerald-500" },
    { id: "full", name: "Pack Full", desc: "Écosystème Complet", color: "bg-black" },
    { id: "premium", name: "Onyx Premium", desc: "IA & CRM Intégré", color: "bg-indigo-500" },
  ];

  useEffect(() => {
    setContacts([
      { id: '1', full_name: 'Magatte Fall', phone: '77 123 45 67', type: 'Prospect', saas: 'Onyx Vente', status: 'En essai (J-7)' },
      { id: '2', full_name: 'Boutique Fatou', phone: '76 987 65 43', type: 'Client', saas: 'Pack Trio', status: 'Actif' },
    ]);
    setPartners([
      { id: '1', full_name: 'Moussa D.', contact: '77 000 00 00', activity: 'Étudiant', sales: 12, status: 'Actif', revenue: '85.000F' },
      { id: '2', full_name: 'Awa C.', contact: '78 999 88 77', activity: 'Commerçante', sales: 0, status: 'En attente', revenue: '0F' },
      { id: '3', full_name: 'Cheikh N.', contact: '76 111 22 33', activity: 'Freelance', sales: 45, status: 'Top Performer', revenue: '450.000F' },
    ]);
    setLeads([
      { id: '1', full_name: 'Modou S.', source: 'Bot Fanta', intent: 'Pack Full', message: 'Je veux digitaliser mon resto', date: '03/03/2026', status: 'Nouveau' }
    ]);
  }, []);

  const handleOutsideClick = (setter: any) => (e: any) => {
    if (e.target.id === "modal-overlay") setter(false);
  };

  const executeWA = (phone: string, msg: string, idIA?: string) => {
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
    if (idIA) {
      setActionsIA(prev => prev.map(a => a.id === idIA ? { ...a, status: 'Réalisé' } : a));
    }
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if(editingContact.id) setContacts(contacts.map(c => c.id === editingContact.id ? editingContact : c));
    else setContacts([{ ...editingContact, id: Date.now().toString() }, ...contacts]);
    setShowContactModal(false);
  };

  const approvePartner = (id: string) => {
    setPartners(partners.map(p => p.id === id ? { ...p, status: 'Actif' } : p));
  };

  return (
    <div className={`flex h-screen bg-zinc-50 ${inter.className} text-black overflow-hidden`}>
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col z-20 shadow-sm hidden md:flex">
        <div className="p-6">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black tracking-tighter uppercase`}>ONYX<span className="text-[#39FF14]">OPS</span></h1>
        </div>
        <div className="flex-1 overflow-y-auto px-4 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 pl-2">Menu Principal</p>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard Accueil' },
                { id: 'leads', icon: MessageSquare, label: 'Leads & Bot Fanta' },
                { id: 'crm', icon: Users, label: 'Membres & CRM' },
                { id: 'ecosystem', icon: Box, label: 'Écosystème (9 SaaS)' },
                { id: 'finance', icon: Wallet, label: 'Finances' },
                { id: 'partners', icon: Handshake, label: 'Ambassadeurs' },
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

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* HEADER */}
        <header className="bg-white border-b border-zinc-200 h-20 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>
            {activeView === 'dashboard' ? 'Terminal' : activeView === 'crm' ? 'CRM & Contacts' : activeView === 'partners' ? 'Ambassadeurs' : activeView}
          </h2>
          <div className="flex items-center gap-6">
            <button onClick={() => window.location.href = '/'} className="hidden md:flex items-center gap-2 text-xs font-black uppercase text-zinc-400 hover:text-black transition"><ExternalLink size={14}/> Retour au site</button>
            <div onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-1.5 pr-4 rounded-full cursor-pointer hover:bg-zinc-100 transition shadow-sm hover:scale-105">
              <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=39FF14" className="w-8 h-8 rounded-full" alt="Admin" />
              <div className="text-left hidden sm:block">
                <p className="text-[10px] font-black uppercase leading-none text-black">ADMINISTRATEUR</p>
                <p className="text-[8px] font-bold text-zinc-500 uppercase">Profil & Réglages</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          
          {/* ================= DASHBOARD ================= */}
          {activeView === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto">
              <div className="flex items-center bg-white p-1 rounded-xl w-max shadow-sm border border-zinc-200">
                {['Aujourd\'hui', 'Ce Mois', 'Année'].map(filter => (
                   <button key={filter} onClick={() => setGlobalFilterDate(filter)} className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition ${globalFilterDate === filter ? 'bg-black text-[#39FF14]' : 'text-zinc-500 hover:text-black'}`}>{filter}</button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-black text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Wallet size={64}/></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Chiffre d'Affaires ({globalFilterDate})</p>
                  <p className={`${spaceGrotesk.className} text-4xl font-black text-[#39FF14]`}>1.245.000 F</p>
                </div>
                <div className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Nouveaux Leads</p>
                  <p className={`${spaceGrotesk.className} text-4xl font-black`}>142</p>
                </div>
                <div className="bg-[#39FF14]/10 border border-[#39FF14]/30 p-6 rounded-[2rem]">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-2">Vues Blog</p>
                  <p className={`${spaceGrotesk.className} text-4xl font-black`}>8.405</p>
                </div>
              </div>

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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm flex flex-col justify-center">
                    <h3 className="font-black uppercase text-sm mb-6 flex items-center gap-2"><TrendingUp className="text-[#39FF14]"/> TOP 3 PRODUITS</h3>
                    <div className="space-y-4">
                       <div className="flex justify-between items-center font-black text-sm"><span className="text-zinc-500">#1 Pack Trio</span><span>89 ventes</span></div>
                       <div className="flex justify-between items-center font-black text-sm"><span className="text-zinc-500">#2 Onyx Solo</span><span>142 ventes</span></div>
                       <div className="flex justify-between items-center font-black text-sm"><span className="text-zinc-500">#3 Pack Full</span><span>45 ventes</span></div>
                    </div>
                 </div>
                 <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm min-h-[250px]">
                    <h3 className="font-black uppercase text-sm mb-6 flex items-center gap-2"><CreditCard className="text-[#39FF14]"/> DERNIÈRES TRANSACTIONS</h3>
                    <div className="text-zinc-400 font-bold text-sm">Aucune transaction récente.</div>
                 </div>
              </div>

              {/* ACTIONS IA CLIQUABLES */}
              <div className="bg-zinc-900 text-white border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
                 <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black uppercase text-sm flex items-center gap-2"><Sparkles className="text-[#39FF14]"/> ACTIONS PLANIFIÉES DEPUIS LE SCAN IA</h3>
                 </div>
                 <div className="space-y-3">
                    {actionsIA.map(action => (
                       <div key={action.id} className="bg-zinc-800 p-4 rounded-2xl flex justify-between items-center">
                          <div>
                             <p className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest mb-1">{action.module} • {action.date}</p>
                             <p className="font-bold text-sm">{action.title}</p>
                             <p className="text-xs text-zinc-400 truncate max-w-md">{action.desc}</p>
                          </div>
                          <div className="flex items-center gap-3">
                             <select value={action.status} onChange={e => setActionsIA(prev => prev.map(a => a.id === action.id ? {...a, status: e.target.value as any} : a))} className="bg-zinc-900 text-[10px] font-black uppercase text-white p-2 rounded-lg border border-zinc-700 outline-none cursor-pointer">
                                <option>En attente</option><option>En cours</option><option>Réalisé</option><option>Annulé</option>
                             </select>
                             <button onClick={() => executeWA(action.phone, action.msg, action.id)} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#39FF14] transition">Exécuter via WA</button>
                             <button onClick={() => setActionsIA(prev => prev.filter(a => a.id !== action.id))} className="text-zinc-500 hover:text-red-500"><X size={16}/></button>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            </div>
          )}

          {/* ================= LEADS & BOT ================= */}
          {activeView === 'leads' && (
            <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
              <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-8`}><MessageSquare className="inline text-[#39FF14] mr-2"/> Leads Capturés</h2>
              <div className="bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nom & Date</th><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Source / Produit</th><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Message</th><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action</th></tr>
                  </thead>
                  <tbody>
                    {leads.map((l, i) => (
                      <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="p-6"><p className="font-black text-sm uppercase">{l.full_name}</p><p className="text-xs text-zinc-500">{l.date}</p></td>
                        <td className="p-6"><p className="font-bold text-xs">{l.source}</p><p className="text-[10px] font-black uppercase text-[#39FF14] bg-black px-2 py-0.5 rounded-full inline-block mt-1">{l.intent}</p></td>
                        <td className="p-6 text-xs text-zinc-600 font-medium">{l.message}</td>
                        <td className="p-6 text-right"><button className="text-[10px] font-black uppercase bg-[#39FF14] text-black px-4 py-2 rounded-lg">Traiter</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= CRM ================= */}
          {activeView === 'crm' && (
            <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                  <input type="text" placeholder="Rechercher global (Nom, Tel, Produit)..." value={crmSearch} onChange={(e) => setCrmSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#39FF14]/50 transition" />
                </div>
                <select value={crmTypeFilter} onChange={(e) => setCrmTypeFilter(e.target.value)} className="px-4 py-3 bg-zinc-50 rounded-2xl font-bold text-sm outline-none border-none cursor-pointer w-full md:w-auto">
                  <option>Tous</option><option>Client</option><option>Prospect</option>
                </select>
                <div className="flex gap-2 w-full md:w-auto">
                   <button onClick={() => setShowRapportIA(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-xs hover:scale-105 transition shadow-lg"><Sparkles size={16} /> Scan IA CRM</button>
                   <button onClick={() => { setEditingContact({ full_name: '', phone: '', type: 'Prospect', saas: '' }); setShowContactModal(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#39FF14] text-black px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg"><Plus size={16} /> Nouveau</button>
                </div>
              </div>

              {showRapportIA && (
                 <div className="bg-white border-2 border-[#39FF14] rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in">
                    <button onClick={() => setShowRapportIA(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black"><X size={20}/></button>
                    <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 flex items-center gap-2`}><Sparkles className="text-[#39FF14]"/> Rapport IA CRM</h3>
                    <div className="space-y-4 mt-6">
                       <div className="border border-zinc-200 p-6 rounded-[2rem] flex justify-between items-center bg-zinc-50">
                          <div><p className="font-black text-lg uppercase">Boutique Fatou</p><p className="text-xs font-bold text-zinc-500 italic">Essai expire demain. Fort usage catalogue.</p></div>
                          <button onClick={() => executeWA("221769876543", "Bonjour Boutique Fatou, votre essai expire demain ! Voici un code promo -20% pour continuer.")} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition shadow-md">Offrir Promo (WA)</button>
                       </div>
                    </div>
                 </div>
              )}

              <div className="bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Contact</th><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Statut / Type</th><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Produit SaaS</th><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th></tr>
                  </thead>
                  <tbody>
                    {contacts.filter(c => (crmTypeFilter === 'Tous' || c.type === crmTypeFilter) && (c.full_name.toLowerCase().includes(crmSearch.toLowerCase()) || c.saas.toLowerCase().includes(crmSearch.toLowerCase()))).map((c, i) => (
                      <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="p-6"><p className="font-black text-sm uppercase">{c.full_name}</p><p className="text-xs text-zinc-500 font-bold">{c.phone}</p></td>
                        <td className="p-6"><span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${c.type === 'Client' ? 'bg-[#39FF14]/20 text-black' : 'bg-zinc-200 text-zinc-600'}`}>{c.type}</span><p className="text-[10px] font-bold text-zinc-400 mt-2">{c.status}</p></td>
                        <td className="p-6 font-bold text-sm">{c.saas || '-'}</td>
                        <td className="p-6 text-right"><button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-[10px] font-black uppercase bg-white border border-zinc-200 px-4 py-2 rounded-lg hover:border-black transition">Éditer Fiche</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= PARTENAIRES ================= */}
          {activeView === 'partners' && (
             <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
               <div className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm mb-8">
                 <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                    <input type="text" placeholder="Rechercher un ambassadeur..." value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#39FF14]/50" />
                 </div>
               </div>

               {/* Section Candidatures en Attente */}
               {partners.filter(p => p.status === 'En attente').length > 0 && (
                 <div className="bg-red-50 border border-red-200 p-6 rounded-[3rem] mb-8 shadow-sm">
                    <h3 className="font-black uppercase text-sm mb-4 text-red-600 flex items-center gap-2"><AlertCircle/> Candidatures à Approuver</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {partners.filter(p => p.status === 'En attente').map(p => (
                          <div key={p.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                             <div><p className="font-black text-sm uppercase">{p.full_name}</p><p className="text-xs font-bold text-zinc-500">{p.contact} • {p.activity}</p></div>
                             <button onClick={() => approvePartner(p.id)} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition">Approuver</button>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm cursor-pointer hover:border-[#39FF14] transition group"><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Les 4 Derniers Inscrits</p><div className="flex items-center gap-4"><div className="bg-black text-white w-12 h-12 rounded-2xl flex items-center justify-center"><UserPlus size={20}/></div><p className={`${spaceGrotesk.className} text-4xl font-black`}>12</p></div></div>
                  <div className="bg-red-50 border border-red-100 p-8 rounded-[3rem] shadow-sm cursor-pointer hover:border-red-500 transition group"><p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Les 4 Moins Actifs</p><div className="flex items-center gap-4"><div className="bg-red-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center"><AlertCircle size={20}/></div><p className={`${spaceGrotesk.className} text-4xl font-black text-red-600`}>Awa & co.</p></div></div>
                  <div className="bg-black border border-[#39FF14]/30 shadow-2xl p-8 rounded-[3rem] cursor-pointer hover:scale-105 transition group"><p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-2">Les 4 Plus Productifs</p><div className="flex items-center gap-4"><div className="bg-[#39FF14] text-black w-12 h-12 rounded-2xl flex items-center justify-center"><Star size={20}/></div><p className={`${spaceGrotesk.className} text-4xl font-black text-white`}>Cheikh N.</p></div></div>
               </div>

               <div className="bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                   <thead className="bg-zinc-50 border-b border-zinc-200">
                     <tr><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Ambassadeur</th><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Activité / Statut</th><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Ventes</th><th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th></tr>
                   </thead>
                   <tbody>
                     {partners.filter(p => p.full_name.toLowerCase().includes(partnerSearch.toLowerCase()) && p.status !== 'En attente').map((p, i) => (
                       <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50">
                         <td className="p-6"><p className="font-black text-sm uppercase">{p.full_name}</p><p className="text-xs text-zinc-500 font-bold">{p.contact}</p></td>
                         <td className="p-6"><span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-zinc-200 text-black">{p.activity}</span><p className="text-[10px] font-black uppercase mt-2 text-[#39FF14]">{p.status}</p></td>
                         <td className="p-6 text-center font-black text-xl">{p.sales}</td>
                         <td className="p-6 text-right"><button onClick={() => { setSelectedPartner(p); setShowPartnerModal(true); }} className="text-[10px] font-black uppercase bg-black text-white px-4 py-2 rounded-lg hover:bg-[#39FF14] hover:text-black transition">Détails Complets</button></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             </div>
          )}

          {/* ================= ECOSYSTEME (9 SAAS) ================= */}
          {activeView === 'ecosystem' && (
             <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
               <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-8`}>Écosystème <span className="text-[#39FF14]">OnyxOps</span></h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {ECOSYSTEM_SAAS.map(saas => (
                    <div key={saas.id} className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm hover:border-black transition group flex flex-col justify-between min-h-[250px]">
                       <div>
                          <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center text-white ${saas.color}`}><Box size={24}/></div>
                          <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase`}>{saas.name}</h3>
                          <p className="text-sm font-bold text-zinc-500 mt-2">{saas.desc}</p>
                       </div>
                       <div className="mt-8 flex gap-2">
                          <button onClick={() => setShowSaasLogin(saas)} className="flex-1 bg-black text-[#39FF14] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition shadow-lg">Login / Demo</button>
                       </div>
                    </div>
                 ))}
               </div>
             </div>
          )}

          {/* ================= MARKETING & BLOG ================= */}
          {activeView === 'marketing' && (
             <div className="space-y-8 animate-in fade-in max-w-5xl mx-auto">
                <div className="flex justify-between items-center bg-white p-6 rounded-[3rem] border border-zinc-200 shadow-sm">
                   <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>ARTICLES & CIBLAGE (BLOG)</h2>
                   <div className="flex gap-4">
                      <button className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2"><Sparkles size={16}/> Auto-Suggestion IA</button>
                      <button className="bg-zinc-100 text-black px-6 py-3 rounded-2xl font-black uppercase text-xs">Rédiger Manuel</button>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex-1">
                         <div className="flex gap-2 mb-4">
                            <span className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase">Social Selling</span>
                            <span className="bg-zinc-100 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">Cible : Pack Full</span>
                         </div>
                         <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-2`}>DIGITALISATION 2026 : POURQUOI DAKAR EXPLOSE</h3>
                         <p className="text-zinc-500 font-medium text-sm">L'intelligence artificielle transforme le commerce...</p>
                      </div>
                      <div className="flex flex-col gap-3 w-full md:w-auto">
                         <button className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg flex justify-center items-center gap-2"><Send size={16}/> Diffuser au segment</button>
                         <button className="bg-zinc-100 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-zinc-200 transition flex justify-center items-center gap-2">Éditer</button>
                      </div>
                   </div>

                   <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                      <div className="flex-1">
                         <div className="flex gap-2 mb-4">
                            <span className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase">Restauration</span>
                            <span className="bg-zinc-100 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">Cible : Pack Full</span>
                         </div>
                         <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-2`}>COMMENT LE DIGITAL TRANSFORME LES RESTAURANTS</h3>
                         <p className="text-zinc-500 font-medium text-sm">Réduire les pertes de 30% grâce aux menus digitaux...</p>
                      </div>
                      <div className="flex flex-col gap-3 w-full md:w-auto">
                         <button className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg flex justify-center items-center gap-2"><Send size={16}/> Diffuser au segment</button>
                         <button className="bg-zinc-100 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-zinc-200 transition flex justify-center items-center gap-2">Éditer</button>
                      </div>
                   </div>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* ================= MODALES GLOBALES (Refermables au clic externe) ================= */}

      {/* MODALE PROFIL (Restaurée et centrée) */}
      {showProfileModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowProfileModal)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in text-center">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-10"><X size={20}/></button>
            <img src="https://ui-avatars.com/api/?name=Admin&background=000&color=39FF14" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-black" alt="" />
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-1`}>ADMINISTRATEUR</h2>
            <p className="text-xs font-bold text-zinc-400 mb-8">contact@onyxops.com</p>

            <div className="space-y-4 text-left">
               <input type="text" placeholder="Nom affiché" defaultValue="Administrateur" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
               <input type="text" placeholder="URL Image" defaultValue="https://i.ibb.co/.../admin.png" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none text-xs" />
               <button className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition mb-6">Enregistrer le profil</button>
               
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-6 mb-2">Modifier le mot de passe</p>
               <input type="password" placeholder="Mot de passe actuel (optionnel)" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
               <input type="password" placeholder="Nouveau mot de passe" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
               <input type="password" placeholder="Confirmer le mot de passe" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
               <button className="w-full bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-white transition mt-2">Changer le mot de passe</button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DÉTAILS PARTENAIRE (Complète) */}
      {showPartnerModal && selectedPartner && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowPartnerModal)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in">
             <button onClick={() => setShowPartnerModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-10"><X size={20}/></button>
             <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2`}>{selectedPartner.full_name}</h2>
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2"><span className="w-2 h-2 bg-[#39FF14] rounded-full"></span> Statut : {selectedPartner.status}</p>
             
             <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200"><p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Gains Générés</p><p className={`${spaceGrotesk.className} text-3xl font-black text-[#39FF14]`}>{selectedPartner.revenue}</p></div>
                <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200"><p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Ventes Réussies</p><p className={`${spaceGrotesk.className} text-3xl font-black`}>{selectedPartner.sales}</p></div>
             </div>
             
             <div className="space-y-4">
                <button className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition flex justify-center items-center gap-2"><Settings size={16}/> Éditer le compte Ambassadeur</button>
                <button className="w-full bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-zinc-200 transition flex justify-center items-center gap-2"><UserPlus size={16}/> Convertir en Client (Conserver statut Amb.)</button>
             </div>
          </div>
        </div>
      )}

      {/* MODALE SAAS LOGIN / DEMO */}
      {showSaasLogin && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowSaasLogin)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-white p-12 rounded-[4rem] max-w-md w-full relative shadow-[0_0_60px_rgba(57,255,20,0.15)] animate-in zoom-in text-center border-t-4 border-[#39FF14]">
               <button onClick={() => setShowSaasLogin(null)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-black transition"><X size={20}/></button>
               <div className="mb-8 flex justify-center">
                  <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white ${showSaasLogin.color} shadow-lg`}><Box size={40}/></div>
               </div>
               <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2`}>{showSaasLogin.name}</h2>
               <p className="text-xs font-bold text-zinc-500 mb-10">Accès sécurisé à votre instance.</p>
               
               <div className="space-y-4">
                  <input type="email" placeholder="Adresse Email" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-[#39FF14] transition" />
                  <input type="password" placeholder="Mot de passe" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-[#39FF14] transition" />
                  <button className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition mt-4">Connexion</button>
                  <p className="text-[10px] font-bold text-zinc-400 mt-6 cursor-pointer hover:text-black transition">Créer un compte d'essai 14 jours</p>
               </div>
            </div>
         </div>
      )}

      {/* MODALE EDITION CRM */}
      {showContactModal && editingContact && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowContactModal)} className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-lg w-full relative shadow-2xl animate-in zoom-in">
            <button onClick={() => setShowContactModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
            <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-8`}>{editingContact.id ? 'Éditer Fiche' : 'Nouveau Contact'}</h2>
            <form onSubmit={handleSaveContact} className="space-y-4">
              <input type="text" required placeholder="Nom Complet" value={editingContact.full_name} onChange={e => setEditingContact({...editingContact, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
              <input type="tel" required placeholder="Téléphone WhatsApp" value={editingContact.phone} onChange={e => setEditingContact({...editingContact, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
              <div className="grid grid-cols-2 gap-4">
                 <select value={editingContact.type} onChange={e => setEditingContact({...editingContact, type: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none cursor-pointer"><option>Prospect</option><option>Client</option></select>
                 <input type="text" placeholder="Produit SaaS" value={editingContact.saas} onChange={e => setEditingContact({...editingContact, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
              </div>
              <input type="text" placeholder="Statut / Notes" value={editingContact.status || ''} onChange={e => setEditingContact({...editingContact, status: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
              <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm mt-4 shadow-xl"><CheckCircle size={18} className="inline mr-2"/> Enregistrer</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
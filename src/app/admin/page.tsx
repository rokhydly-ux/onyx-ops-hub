"use client";

import React, { useState, useEffect } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  LayoutDashboard, Users, Box, Wallet, Handshake, Megaphone, 
  Search, Plus, CheckCircle, Clock, AlertCircle, X, Sparkles, 
  ExternalLink, MessageSquare, LogIn, Send, Download, Edit3, UserPlus,
  BarChart2, MapPin, Calendar, Lock, ChevronDown, List
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

type ViewType = 'dashboard' | 'crm' | 'leads' | 'ecosystem' | 'finance' | 'partners' | 'marketing';
type ActionModule = 'CRM' | 'Partenaires' | 'Marketing';
type IAAction = { id: string; module: ActionModule; title: string; desc: string; date: string; status: 'En attente' | 'En cours' | 'Réalisé' | 'Annulé'; phone?: string; msg?: string; };

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [todayStr, setTodayStr] = useState('');

  // --- NAVIGATION & FILTRES GLOBAUX ---
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [globalFilterDate, setGlobalFilterDate] = useState('Ce Mois');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [isRefreshing, setIsRefreshing] = useState(false); // Pour animer le changement de filtre
  
  // --- MODALES UI ---
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showRapportIA, setShowRapportIA] = useState(false);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showSaasLogin, setShowSaasLogin] = useState<any>(null);
  const [showDiffusionModal, setShowDiffusionModal] = useState<any>(null);
  const [saasModalMode, setSaasModalMode] = useState<'login' | 'create'>('login');
  const [saasCreateType, setSaasCreateType] = useState<'prospect' | 'manual'>('prospect');
  const [saasCreateForm, setSaasCreateForm] = useState({ prospectId: '', name: '', phone: '', password: '' });
  
  // --- DATA STATES ---
  const [editingContact, setEditingContact] = useState<any>(null);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  const [editPartnerForm, setEditPartnerForm] = useState<any>(null);
  const [selectedContactsForDiffusion, setSelectedContactsForDiffusion] = useState<string[]>([]);

  // Profil Admin
  const [adminProfile, setAdminProfile] = useState({ name: 'Administrateur', avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=39FF14' });
  const [tempAdminProfile, setTempAdminProfile] = useState({ ...adminProfile });

  // Mocks Données Principales
  const [contacts, setContacts] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [marketingArticles, setMarketingArticles] = useState<any[]>([]);
  const [actionsIA, setActionsIA] = useState<IAAction[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);

  // --- FILTRES SPECIFIQUES ---
  const [actionTabFilter, setActionTabFilter] = useState<'All' | 'IA' | 'Marketing'>('All');
  const [actionSearchFilter, setActionSearchFilter] = useState("");
  const [crmSearch, setCrmSearch] = useState("");
  const [crmTypeFilter, setCrmTypeFilter] = useState("Tous");
  const [crmCardFilter, setCrmCardFilter] = useState<string | null>(null);
  const [partnerCardFilter, setPartnerCardFilter] = useState<string | null>(null);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [financeSearch, setFinanceSearch] = useState("");
  const [financeTypeFilter, setFinanceTypeFilter] = useState("Tous");
  const [financeCardFilter, setFinanceCardFilter] = useState<string | null>(null);

  // --- DONNÉES HISTOGRAMME DASHBOARD ---
  const [histogramData, setHistogramData] = useState([
    { day: 'Lun', ca: 150000, date: '02 Mar', active: false },
    { day: 'Mar', ca: 300000, date: '03 Mar', active: false },
    { day: 'Mer', ca: 850000, date: '04 Mar', active: true }, // Aujourd'hui Pikine
    { day: 'Jeu', ca: 0, date: '05 Mar', active: false },
    { day: 'Ven', ca: 0, date: '06 Mar', active: false },
    { day: 'Sam', ca: 0, date: '07 Mar', active: false },
    { day: 'Dim', ca: 0, date: '08 Mar', active: false },
  ]);
  const maxCa = Math.max(...histogramData.map(d => d.ca)) || 1;

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
    setMounted(true);
    const currentDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    setTodayStr(currentDate);

    setActionsIA([
       { id: 'a1', module: 'CRM', title: 'Relance Essai - Boutique Fatou', desc: 'Essai Onyx Vente expire demain.', date: currentDate, status: 'En attente', phone: '221769876543', msg: 'Bonjour Boutique Fatou, votre essai Onyx Vente expire demain. Souhaitez-vous le prolonger ?' },
       { id: 'a2', module: 'Partenaires', title: 'Booster Moussa D.', desc: 'Aucune vente depuis 15 jours. Lui envoyer le script.', date: currentDate, status: 'En attente', phone: '221770000000', msg: 'Salut Moussa, voici un nouveau script de vente qui marche très bien en ce moment pour vendre le Pack Trio.' },
       { id: 'a3', module: 'Marketing', title: 'Newsletter : L\'ère du Digital', desc: 'Diffusion automatique programmée pour les prospects Restauration.', date: 'Demain', status: 'En attente' }
    ]);

    setContacts([
      { id: 'c1', full_name: 'Magatte Fall', phone: '221771234567', type: 'Prospect', saas: 'Onyx Vente', status: 'En essai (J-7)', isExpiringTrial: true, isExpiringSub: false },
      { id: 'c2', full_name: 'Boutique Fatou', phone: '221769876543', type: 'Client', saas: 'Pack Trio', status: 'Actif', isExpiringTrial: false, isExpiringSub: false },
      { id: 'c3', full_name: 'Resto Dakar', phone: '221785554433', type: 'Client', saas: 'Onyx Menu', status: 'Expire bientôt', isExpiringTrial: false, isExpiringSub: true },
      { id: 'c4', full_name: 'Modou S.', phone: '221774445566', type: 'Prospect', saas: 'Pack Full', status: 'Nouveau', isExpiringTrial: false, isExpiringSub: false },
    ]);

    setPartners([
      { id: 'p1', full_name: 'Moussa D.', contact: '221770000000', activity: 'Étudiant', sales: 12, status: 'Actif', revenue: '85.000F' },
      { id: 'p2', full_name: 'Awa C.', contact: '221789998877', activity: 'Commerçante', sales: 0, status: 'En attente', revenue: '0F' },
      { id: 'p3', full_name: 'Cheikh N.', contact: '221761112233', activity: 'Freelance', sales: 45, status: 'Top Performer', revenue: '450.000F' },
    ]);

    setLeads([
      { id: 'l1', full_name: 'Alioune G.', phone: '221781112233', source: 'Bot Fanta', intent: 'Pack Full', message: 'Je veux digitaliser mon resto', date: currentDate, status: 'Nouveau' },
      { id: 'l2', full_name: 'Seydou B.', phone: '221764445566', source: 'Formulaire Site', intent: 'Onyx Menu', message: 'Quels sont vos tarifs exacts ?', date: 'Hier', status: 'Nouveau' }
    ]);

    setTransactions([
      { id: 'tr1', date: currentDate, client: 'Boutique Fatou', amount: 17500, type: 'Abonnement Trio', status: 'Payé', ref: 'WAVE-10293' },
      { id: 'tr2', date: 'Hier', client: 'Resto Dakar', amount: 30000, type: 'Pack Full', status: 'En attente', ref: 'OM-99212' },
      { id: 'tr3', date: '01 Mar 2026', client: 'Cheikh N.', amount: -45000, type: 'Commission Ambassadeur', status: 'Versé', ref: 'PAY-4412' },
    ]);

    setMarketingArticles([
       { id: 'm1', title: 'DIGITALISATION 2026 : POURQUOI DAKAR EXPLOSE', desc: 'L\'intelligence artificielle transforme le commerce...', category: 'Social Selling', cible: 'Pack Full' },
       { id: 'm2', title: 'COMMENT LE DIGITAL TRANSFORME LES RESTAURANTS', desc: 'Réduire les pertes de 30% grâce aux menus digitaux...', category: 'Restauration', cible: 'Onyx Menu' }
    ]);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex h-screen w-full bg-zinc-50 items-center justify-center ${inter.className}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Initialisation de l'espace Admin...</p>
        </div>
      </div>
    );
  }

  const triggerFilterAnimation = (filterValue: string) => {
    setGlobalFilterDate(filterValue);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleOutsideClick = (setter: any, secondaryAction?: () => void) => (e: any) => {
    if (e.target.id === "modal-overlay") { setter(false); if(secondaryAction) secondaryAction(); }
  };

  const executeWA = (phone: string | undefined, msg: string | undefined, idIA?: string) => {
    if(phone && msg) window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    if (idIA) setActionsIA(prev => (prev || []).map(a => a.id === idIA ? { ...a, status: 'Réalisé' } : a));
  };

  const replyToLead = (lead: any) => {
     const msg = `Bonjour ${lead.full_name}, je suis l'administrateur d'OnyxOps. J'ai bien reçu votre message : "${lead.message}". Comment puis-je vous aider ?`;
     window.open(`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const planifyCrmAction = (title: string, desc: string, phone: string, msg: string) => {
     const newAction: IAAction = { id: Date.now().toString(), module: 'CRM', title: title || "", desc: desc || "", date: todayStr || "", status: 'En attente', phone: phone || "", msg: msg || "" };
     setActionsIA([newAction, ...(actionsIA || [])]);
     alert("L'action a bien été planifiée sur votre Dashboard !");
     setShowRapportIA(false);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if(editingContact?.id) setContacts((contacts || []).map(c => c.id === editingContact.id ? editingContact : c));
    else setContacts([{ ...editingContact, id: Date.now().toString(), status: 'Nouveau' }, ...(contacts || [])]);
    setShowContactModal(false);
  };

  const approvePartner = (id: string) => setPartners((partners || []).map(p => p.id === id ? { ...p, status: 'Actif' } : p));

  const handleSavePartner = () => {
     if(!editPartnerForm) return;
     setPartners((partners || []).map(p => p.id === editPartnerForm.id ? editPartnerForm : p));
     setSelectedPartner(editPartnerForm);
     setIsEditingPartner(false);
  };

  const handleConvertPartnerToClient = () => {
     if(!selectedPartner) return;
     const newContact = { id: Date.now().toString(), full_name: selectedPartner.full_name || "Nouveau", phone: selectedPartner.contact || "", type: 'Client', saas: 'À définir', status: 'Converti depuis Ambassadeur', isExpiringTrial: false, isExpiringSub: false };
     setContacts([newContact, ...(contacts || [])]);
     alert(`${selectedPartner.full_name} a été ajouté en tant que Client dans le CRM ! Son statut Ambassadeur est conservé.`);
  };

  const scheduleMarketingDiffusion = () => {
     if(!selectedContactsForDiffusion || selectedContactsForDiffusion.length === 0) return alert("Veuillez sélectionner au moins un contact.");
     const newAction: IAAction = { id: Date.now().toString(), module: 'Marketing', title: `Diffusion : ${showDiffusionModal?.title || "Article"}`, desc: `Envoi programmé à ${selectedContactsForDiffusion.length} contacts sélectionnés.`, date: todayStr, status: 'En attente' };
     setActionsIA([newAction, ...(actionsIA || [])]);
     setShowDiffusionModal(null); setSelectedContactsForDiffusion([]);
     alert("La diffusion a bien été planifiée sur le Dashboard !");
  };

  const handleCreateSaasAccount = () => {
     if (saasCreateType === 'manual' && (!saasCreateForm.name || !saasCreateForm.phone || !saasCreateForm.password)) {
        return alert("Veuillez remplir tous les champs manuels.");
     }
     if (saasCreateType === 'prospect' && (!saasCreateForm.prospectId || !saasCreateForm.password)) {
        return alert("Veuillez sélectionner un prospect et définir un mot de passe.");
     }
     alert(`Compte ${showSaasLogin.name} créé avec succès !\nUn message contenant les accès va être envoyé via WhatsApp.`);
     
     let targetPhone = saasCreateForm.phone;
     let targetName = saasCreateForm.name;
     
     if (saasCreateType === 'prospect') {
        const p = contacts.find(c => c.id === saasCreateForm.prospectId);
        if(p) { targetPhone = p.phone; targetName = p.full_name; }
     }
     
     const msg = `Félicitations ${targetName} ! Votre espace ${showSaasLogin.name} a été créé.\nLien : https://${showSaasLogin.id}.onyxops.com\nMot de passe : ${saasCreateForm.password}`;
     setShowSaasLogin(null);
     setSaasCreateForm({ prospectId: '', name: '', phone: '', password: '' });
     window.open(`https://wa.me/${targetPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const filteredActions = (actionsIA || []).filter(a => {
     if(actionTabFilter === 'IA' && a.module === 'Marketing') return false;
     if(actionTabFilter === 'Marketing' && a.module !== 'Marketing') return false;
     const search = actionSearchFilter?.toLowerCase() || "";
     if(search && !(a.title?.toLowerCase() || "").includes(search) && !(a.desc?.toLowerCase() || "").includes(search)) return false;
     return true;
  });
  
  const displayedActions = (actionTabFilter === 'All' && !actionSearchFilter) ? filteredActions.slice(0, 5) : filteredActions;

  return (
    <div className={`flex h-screen bg-zinc-50 ${inter.className} text-black overflow-hidden`}>
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col z-20 shadow-sm hidden md:flex">
        <div className="p-6">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black tracking-tighter uppercase cursor-pointer`} onClick={() => window.location.href = '/'}>
            ONYX<span className="text-[#39FF14]">OPS</span>
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 pl-2">Menu Principal</p>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard Accueil' },
                { id: 'leads', icon: MessageSquare, label: 'Leads & Messages' },
                { id: 'crm', icon: Users, label: 'Membres & CRM' },
                { id: 'ecosystem', icon: Box, label: 'Écosystème (9 SaaS)' },
                { id: 'finance', icon: Wallet, label: 'Finances' },
                { id: 'partners', icon: Handshake, label: 'Ambassadeurs' },
              ].map(item => {
                const Icon = item.icon; 
                return (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveView(item.id as ViewType)} 
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === item.id ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'}`}
                  >
                    <Icon size={18} /> {item.label}
                  </button>
                )
              })}
            </nav>
          </div>
          
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3 pl-2">Marketing & Ventes</p>
            <button 
              onClick={() => setActiveView('marketing')} 
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeView === 'marketing' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-600 hover:bg-zinc-100 hover:text-black'}`}
            >
              <Megaphone size={18} /> Marketing & Blog
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* HEADER */}
        <header className="bg-white border-b border-zinc-200 h-20 flex items-center justify-between px-8 shrink-0 z-10">
          <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>
            {activeView === 'dashboard' ? 'Terminal Central' : activeView === 'crm' ? 'CRM & Contacts' : activeView === 'partners' ? 'Ambassadeurs' : activeView}
          </h2>
          
          <div className="flex items-center gap-6">
            <button onClick={() => window.location.href = '/'} className="hidden md:flex items-center gap-2 text-xs font-black uppercase text-zinc-400 hover:text-black transition">
              <ExternalLink size={14}/> Retour au site
            </button>
            
            <div onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 p-1.5 pr-4 rounded-full cursor-pointer hover:bg-zinc-100 transition shadow-sm hover:scale-105">
              <img src={adminProfile?.avatar} className="w-8 h-8 rounded-full object-cover" alt="Admin" />
              <div className="text-left hidden sm:block">
                <p className="text-[10px] font-black uppercase leading-none text-black">{adminProfile?.name}</p>
                <p className="text-[8px] font-bold text-zinc-500 uppercase">Profil & Réglages</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 relative">
          
          {/* ================= DASHBOARD ================= */}
          {activeView === 'dashboard' && (
            <div className={`space-y-8 max-w-7xl mx-auto transition-opacity duration-300 ${isRefreshing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
              
              {/* FILTRES GLOBAUX DASHBOARD */}
              <div className="flex flex-col md:flex-row items-center gap-4 bg-white p-2 rounded-2xl w-max shadow-sm border border-zinc-200">
                <div className="flex gap-1 bg-zinc-100 p-1 rounded-xl">
                   {['Aujourd\'hui', 'Ce Mois', 'Année', 'Personnalisé'].map(filter => (
                      <button 
                        key={filter} 
                        onClick={() => triggerFilterAnimation(filter)} 
                        className={`px-6 py-2 rounded-lg text-xs font-black uppercase transition ${globalFilterDate === filter ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}
                      >
                        {filter}
                      </button>
                   ))}
                </div>
                {globalFilterDate === 'Personnalisé' && (
                   <div className="flex items-center gap-2 px-2 animate-in fade-in slide-in-from-left-4">
                      <input type="date" value={customDateRange.start} onChange={e=>setCustomDateRange({...customDateRange, start: e.target.value})} className="bg-zinc-100 border border-zinc-200 text-xs font-bold p-2 rounded-lg outline-none" />
                      <span className="text-zinc-400 font-bold">-</span>
                      <input type="date" value={customDateRange.end} onChange={e=>setCustomDateRange({...customDateRange, end: e.target.value})} className="bg-zinc-100 border border-zinc-200 text-xs font-bold p-2 rounded-lg outline-none" />
                      <button className="bg-[#39FF14] text-black px-3 py-2 rounded-lg text-xs font-black uppercase hover:bg-black hover:text-[#39FF14] transition"><Search size={14}/></button>
                   </div>
                )}
              </div>

              {/* 3 CARTES CLIQUABLES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => setActiveView('finance')} className="bg-black text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform group">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 group-hover:opacity-20 transition"><Wallet size={64}/></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Chiffre d'Affaires ({globalFilterDate})</p>
                  <p className={`${spaceGrotesk.className} text-4xl font-black text-[#39FF14]`}>1.245.000 F</p>
                </div>
                <div onClick={() => setActiveView('leads')} className="bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm cursor-pointer hover:border-black hover:scale-[1.02] transition-all group">
                  <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition text-black"><MessageSquare size={64}/></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Nouveaux Leads</p>
                  <p className={`${spaceGrotesk.className} text-4xl font-black`}>142</p>
                </div>
                <div onClick={() => setActiveView('marketing')} className="bg-[#39FF14]/10 border border-[#39FF14]/30 p-6 rounded-[2rem] cursor-pointer hover:border-[#39FF14] hover:scale-[1.02] transition-all group">
                  <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition text-[#39FF14]"><Megaphone size={64}/></div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-2">Vues Blog / Clics</p>
                  <p className={`${spaceGrotesk.className} text-4xl font-black`}>8.405</p>
                </div>
              </div>

              {/* HISTOGRAMME ET CARTE */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 {/* HISTOGRAMME VERT */}
                 <div className="lg:col-span-2 bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                       <h3 className="font-black uppercase text-sm flex items-center gap-2"><BarChart2 className="text-[#39FF14]"/> Évolution des Revenus</h3>
                       <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-100 px-3 py-1 rounded-full text-zinc-500">Mars 2026</span>
                    </div>
                    
                    <div className="flex items-end justify-between h-48 gap-2 relative">
                       {/* Lignes de repère */}
                       <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                          <div className="border-t border-zinc-300 w-full"></div>
                          <div className="border-t border-zinc-300 w-full"></div>
                          <div className="border-t border-zinc-300 w-full"></div>
                       </div>
                       
                       {histogramData.map((d, i) => {
                          const heightPct = Math.max((d.ca / maxCa) * 100, 5); // 5% minimum height for empty days
                          return (
                             <div 
                               key={i} 
                               onClick={() => setHistogramData(histogramData.map((data, idx) => ({ ...data, active: idx === i })))}
                               className="relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer"
                             >
                                <div className={`w-full max-w-[40px] rounded-t-xl transition-all duration-300 ${d.active || d.ca > 0 ? 'bg-black hover:bg-[#39FF14]' : 'bg-zinc-200 hover:bg-zinc-300'} ${d.active ? 'ring-2 ring-[#39FF14] ring-offset-2' : ''}`} style={{ height: `${heightPct}%` }}></div>
                                
                                {/* Tooltip Hover/Active */}
                                <div className={`absolute bottom-[calc(100%+10px)] bg-black text-white p-2 rounded-xl text-[10px] font-black uppercase whitespace-nowrap z-10 transition-opacity ${d.active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} pointer-events-none shadow-xl before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-t-black`}>
                                   {d.date} : <span className="text-[#39FF14]">{d.ca.toLocaleString()} F</span>
                                </div>
                                
                                <span className={`mt-3 text-[10px] font-black uppercase ${d.active ? 'text-black' : 'text-zinc-400'}`}>{d.day}</span>
                             </div>
                          )
                       })}
                    </div>
                 </div>

                 {/* CARTE DAKAR / CONNEXIONS */}
                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] shadow-xl relative overflow-hidden flex flex-col">
                    <h3 className="font-black uppercase text-sm text-white mb-2 flex items-center gap-2 relative z-10"><MapPin className="text-[#39FF14]"/> Carte d'Activité</h3>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 relative z-10">Localisation: Pikine & Alentours</p>
                    
                    <div className="flex-1 relative rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-800/50 flex items-center justify-center">
                       {/* Fausse Carte Stylisée Vectorielle SVG avec points clignotants */}
                       <svg viewBox="0 0 100 100" className="w-full h-full opacity-30 absolute inset-0 text-zinc-600 stroke-current" fill="none" strokeWidth="0.5">
                          <path d="M10,20 Q30,10 50,30 T90,20 M10,40 Q30,50 50,40 T90,60 M10,70 Q40,90 60,60 T90,80" />
                          <circle cx="30" cy="25" r="2" fill="currentColor"/>
                          <circle cx="70" cy="45" r="3" fill="currentColor"/>
                          <circle cx="45" cy="75" r="2" fill="currentColor"/>
                       </svg>
                       {/* Points Actifs (Néon) */}
                       <div className="absolute top-[25%] left-[30%] w-3 h-3 bg-[#39FF14] rounded-full shadow-[0_0_15px_rgba(57,255,20,0.8)] animate-pulse"></div>
                       <div className="absolute top-[45%] left-[70%] w-2 h-2 bg-yellow-400 rounded-full shadow-[0_0_10px_rgba(250,204,21,0.8)] animate-ping"></div>
                       <div className="absolute top-[75%] left-[45%] w-4 h-4 bg-[#39FF14] rounded-full shadow-[0_0_20px_rgba(57,255,20,1)] animate-pulse"></div>
                       
                       <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-sm p-2 rounded-lg text-[9px] font-black uppercase text-white border border-zinc-700">
                          <span className="text-[#39FF14]">+12 Hubs</span> actifs
                       </div>
                    </div>
                 </div>
              </div>

              {/* LISTES: NOUVEAUX CLIENTS & DERNIERS AMBASSADEURS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Nouveaux Clients */}
                 <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-black uppercase text-sm flex items-center gap-2"><CheckCircle className="text-[#39FF14]"/> Nouveaux Clients</h3>
                       <button onClick={() => setActiveView('crm')} className="text-[10px] font-black uppercase text-zinc-400 hover:text-black transition">Voir Tout</button>
                    </div>
                    <div className="space-y-3">
                       {(contacts || []).filter(c => c.type === 'Client').slice(0, 4).map(c => (
                          <div key={c.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                             <div>
                                <p className="font-bold text-sm uppercase">{c.full_name}</p>
                                <p className="text-[10px] font-bold text-zinc-500">{c.saas}</p>
                             </div>
                             <span className="bg-[#39FF14]/20 text-black text-[9px] font-black uppercase px-2 py-1 rounded-md">Actif</span>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* Derniers Ambassadeurs */}
                 <div className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                       <h3 className="font-black uppercase text-sm flex items-center gap-2"><Handshake className="text-[#39FF14]"/> Derniers Ambassadeurs</h3>
                       <button onClick={() => setActiveView('partners')} className="text-[10px] font-black uppercase text-zinc-400 hover:text-black transition">Voir Tout</button>
                    </div>
                    <div className="space-y-3">
                       {(partners || []).slice(0, 4).map(p => (
                          <div key={p.id} className="flex justify-between items-center p-3 bg-zinc-50 rounded-2xl border border-zinc-100">
                             <div>
                                <p className="font-bold text-sm uppercase">{p.full_name}</p>
                                <p className="text-[10px] font-bold text-zinc-500">{p.activity}</p>
                             </div>
                             <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${p.status === 'En attente' ? 'bg-red-100 text-red-600' : 'bg-zinc-200 text-black'}`}>{p.status}</span>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>

              {/* ACTIONS PLANIFIÉES (GARDÉES ET SÉCURISÉES) */}
              <div className="bg-zinc-900 text-white border border-zinc-800 p-8 rounded-[3rem] shadow-2xl">
                 <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h3 className="font-black uppercase text-sm flex items-center gap-2"><Sparkles className="text-[#39FF14]"/> PLANIFICATEUR D'ACTIONS</h3>
                    <div className="flex gap-2 bg-zinc-800 p-1 rounded-xl">
                       <button onClick={() => setActionTabFilter('All')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${actionTabFilter === 'All' ? 'bg-[#39FF14] text-black' : 'text-zinc-400 hover:text-white'}`}>Tout ({actionsIA?.length || 0})</button>
                       <button onClick={() => setActionTabFilter('IA')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${actionTabFilter === 'IA' ? 'bg-[#39FF14] text-black' : 'text-zinc-400 hover:text-white'}`}>Actions IA</button>
                       <button onClick={() => setActionTabFilter('Marketing')} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition ${actionTabFilter === 'Marketing' ? 'bg-[#39FF14] text-black' : 'text-zinc-400 hover:text-white'}`}>Marketing</button>
                    </div>
                 </div>

                 <div className="mb-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                    <input type="text" placeholder="Rechercher une action..." value={actionSearchFilter} onChange={e => setActionSearchFilter(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-2xl outline-none font-bold text-sm text-white focus:border-[#39FF14] transition" />
                 </div>

                 <div className="space-y-3">
                    {displayedActions.map(action => (
                       <div key={action.id} className="bg-zinc-800 p-4 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4">
                          <div>
                             <p className="text-[10px] font-black text-[#39FF14] uppercase tracking-widest mb-1">{action.module} • Date : {action.date}</p>
                             <p className="font-bold text-sm">{action.title}</p>
                             <p className="text-xs text-zinc-400 truncate max-w-md">{action.desc}</p>
                          </div>
                          <div className="flex items-center gap-3">
                             <select value={action.status || 'En attente'} onChange={e => setActionsIA(prev => (prev || []).map(a => a.id === action.id ? {...a, status: e.target.value as any} : a))} className="bg-zinc-900 text-[10px] font-black uppercase text-white p-2 rounded-lg border border-zinc-700 outline-none cursor-pointer">
                                <option value="En attente">En attente</option><option value="En cours">En cours</option><option value="Réalisé">Réalisé</option><option value="Annulé">Annulé</option>
                             </select>
                             {action.phone && <button onClick={() => executeWA(action.phone, action.msg, action.id)} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#39FF14] transition">Exécuter via WA</button>}
                             {!action.phone && <button onClick={() => setActionsIA(prev => (prev || []).map(a => a.id === action.id ? { ...a, status: 'Réalisé' } : a))} className="bg-white text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-[#39FF14] transition"><CheckCircle size={14} className="inline mr-1"/> Valider</button>}
                             <button onClick={() => setActionsIA(prev => (prev || []).filter(a => a.id !== action.id))} className="text-zinc-500 hover:text-red-500 transition"><X size={16}/></button>
                          </div>
                       </div>
                    ))}
                    {displayedActions.length === 0 && <p className="text-sm text-zinc-500 italic">Aucune action trouvée.</p>}
                 </div>
              </div>
            </div>
          )}

          {/* ================= LEADS & MESSAGES ================= */}
          {activeView === 'leads' && (
            <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
                 <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>
                   <MessageSquare className="inline text-[#39FF14] mr-2"/> Leads & Messages
                 </h2>
                 <div className="bg-zinc-100 border border-zinc-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-pulse"></span>
                    N° Réception Actif : <span className="font-black">78 533 84 17</span>
                 </div>
              </div>
              
              <div className="bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50 border-b border-zinc-200">
                    <tr>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Nom & Date</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Source / Produit</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Message</th>
                      <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Action (Répondre)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(leads || []).map((l) => (
                      <tr key={l.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="p-6">
                          <p className="font-black text-sm uppercase">{l.full_name}</p>
                          <p className="text-xs text-zinc-500">{l.date} • <span className="font-bold">{l.phone}</span></p>
                        </td>
                        <td className="p-6">
                          <p className="font-bold text-xs">{l.source}</p>
                          <p className="text-[10px] font-black uppercase text-[#39FF14] bg-black px-2 py-0.5 rounded-full inline-block mt-1">{l.intent}</p>
                        </td>
                        <td className="p-6 text-xs text-zinc-600 font-medium">{l.message}</td>
                        <td className="p-6 text-right">
                          <button onClick={() => replyToLead(l)} className="text-[10px] font-black uppercase bg-[#39FF14] text-black px-4 py-3 rounded-xl hover:bg-black hover:text-[#39FF14] transition shadow-md flex items-center justify-end gap-2 ml-auto">
                            <Send size={14}/> Traiter sur WA
                          </button>
                        </td>
                      </tr>
                    ))}
                    {(!leads || leads.length === 0) && (
                      <tr><td colSpan={4} className="p-6 text-center text-zinc-500 text-sm italic">Aucun lead pour le moment.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= CRM ================= */}
          {activeView === 'crm' && (
            <div className="space-y-6 animate-in fade-in max-w-7xl mx-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                 {[
                    { id: 'new_clients', label: 'Nouveaux Clients', val: (contacts || []).filter(c=>c?.type==='Client').length, icon: CheckCircle, color: 'text-black bg-white border-zinc-200' },
                    { id: 'new_prospects', label: 'Nouveaux Prospects', val: (contacts || []).filter(c=>c?.type==='Prospect').length, icon: Users, color: 'text-black bg-white border-zinc-200' },
                    { id: 'exp_trials', label: 'Essais Expirants', val: (contacts || []).filter(c=>c?.isExpiringTrial).length, icon: Clock, color: 'text-[#39FF14] bg-black border-black shadow-lg' },
                    { id: 'exp_subs', label: 'Abonnements Expirants', val: (contacts || []).filter(c=>c?.isExpiringSub).length, icon: AlertCircle, color: 'text-red-500 bg-red-50 border-red-100' },
                 ].map(card => {
                    const CardIcon = card.icon; 
                    return (
                      <div 
                        key={card.id} 
                        onClick={() => setCrmCardFilter(crmCardFilter === card.id ? null : card.id)} 
                        className={`p-5 rounded-[2rem] border cursor-pointer hover:scale-105 transition-all ${card.color} ${crmCardFilter === card.id ? 'ring-4 ring-[#39FF14]/50' : ''}`}
                      >
                         <CardIcon size={20} className="mb-3" />
                         <p className={`${spaceGrotesk.className} text-3xl font-black mb-1`}>{card.val}</p>
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{card.label}</p>
                      </div>
                    )
                 })}
              </div>

              <div className="flex flex-col md:flex-row justify-between gap-4 items-center bg-white p-4 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                  <input type="text" placeholder="Rechercher global..." value={crmSearch} onChange={(e) => setCrmSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-zinc-50 border-none rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-[#39FF14]/50 transition" />
                </div>
                
                <select value={crmTypeFilter} onChange={(e) => setCrmTypeFilter(e.target.value)} className="px-4 py-3 bg-zinc-50 rounded-2xl font-bold text-sm outline-none border-none cursor-pointer w-full md:w-auto">
                  <option value="Tous">Tous</option><option value="Client">Client</option><option value="Prospect">Prospect</option>
                </select>
                
                <div className="flex gap-2 w-full md:w-auto">
                   <button onClick={() => setShowRapportIA(true)} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-xs hover:scale-105 transition shadow-lg"><Sparkles size={16} /> Scan IA CRM</button>
                   <button onClick={() => { setEditingContact({ full_name: '', phone: '', type: 'Prospect', saas: '' }); setShowContactModal(true); }} className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#39FF14] text-black px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg"><Plus size={16} /> Nouveau</button>
                </div>
              </div>

              {/* RAPPORT IA CRM */}
              {showRapportIA && (
                 <div className="bg-white border-2 border-[#39FF14] rounded-[3rem] p-8 shadow-2xl relative animate-in zoom-in mb-6">
                    <button onClick={() => setShowRapportIA(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-black transition"><X size={20}/></button>
                    <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 flex items-center gap-2`}><Sparkles className="text-[#39FF14]"/> Rapport IA CRM</h3>
                    <p className="text-xs font-bold text-zinc-500 mb-6">Suggestions intelligentes basées sur les essais en cours et expirations.</p>
                    <div className="space-y-4">
                       <div className="border border-zinc-200 p-6 rounded-[2rem] flex flex-col md:flex-row justify-between md:items-center bg-zinc-50 gap-4">
                          <div>
                             <p className="font-black text-lg uppercase">Magatte Fall</p>
                             <p className="text-xs font-bold text-zinc-500 italic">Son essai Onyx Vente expire dans 7 jours.</p>
                          </div>
                          <button onClick={() => planifyCrmAction("Relance Magatte Fall", "Proposer conversion avant fin d'essai.", "221771234567", "Bonjour Magatte, comment se passe votre essai sur Onyx Vente ?")} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition shadow-md">Planifier l'Action</button>
                       </div>
                    </div>
                 </div>
              )}

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
                    {(contacts || []).filter(c => {
                       if (crmTypeFilter !== 'Tous' && c.type !== crmTypeFilter) return false;
                       const search = crmSearch?.toLowerCase() || "";
                       if (search && !(c.full_name?.toLowerCase() || "").includes(search) && !(c.saas?.toLowerCase() || "").includes(search)) return false;
                       if (crmCardFilter === 'new_clients' && c.type !== 'Client') return false;
                       if (crmCardFilter === 'new_prospects' && c.type !== 'Prospect') return false;
                       if (crmCardFilter === 'exp_trials' && !c.isExpiringTrial) return false;
                       if (crmCardFilter === 'exp_subs' && !c.isExpiringSub) return false;
                       return true;
                    }).map((c) => (
                      <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                        <td className="p-6">
                          <p className="font-black text-sm uppercase">{c.full_name}</p>
                          <p className="text-xs text-zinc-500 font-bold">{c.phone}</p>
                        </td>
                        <td className="p-6">
                          <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full ${c.type === 'Client' ? 'bg-[#39FF14]/20 text-black' : 'bg-zinc-200 text-zinc-600'}`}>{c.type}</span>
                          <p className="text-[10px] font-bold text-zinc-400 mt-2">{c.status}</p>
                        </td>
                        <td className="p-6 font-bold text-sm">{c.saas || '-'}</td>
                        <td className="p-6 text-right">
                          <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-[10px] font-black uppercase bg-white border border-zinc-200 px-4 py-2 rounded-lg hover:border-black transition">Éditer</button>
                        </td>
                      </tr>
                    ))}
                    {(!contacts || contacts.length === 0) && (<tr><td colSpan={4} className="p-6 text-center text-zinc-500 text-sm italic">Aucun contact trouvé.</td></tr>)}
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

               {(partners || []).filter(p => p.status === 'En attente').length > 0 && (
                 <div className="bg-red-50 border border-red-200 p-6 rounded-[3rem] mb-8 shadow-sm">
                    <h3 className="font-black uppercase text-sm mb-4 text-red-600 flex items-center gap-2"><AlertCircle/> Candidatures à Approuver</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {(partners || []).filter(p => p.status === 'En attente').map(p => (
                          <div key={p.id} className="bg-white p-4 rounded-2xl flex justify-between items-center shadow-sm">
                             <div>
                               <p className="font-black text-sm uppercase">{p.full_name}</p>
                               <p className="text-xs font-bold text-zinc-500">{p.contact} • {p.activity}</p>
                             </div>
                             <button onClick={() => approvePartner(p.id)} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition">Approuver</button>
                          </div>
                       ))}
                    </div>
                 </div>
               )}

               <div className="bg-white border border-zinc-200 rounded-[3rem] overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                   <thead className="bg-zinc-50 border-b border-zinc-200">
                     <tr>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Ambassadeur</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Activité / Statut</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Ventes</th>
                       <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {(partners || []).filter(p => {
                       const search = partnerSearch?.toLowerCase() || "";
                       return (p.full_name?.toLowerCase() || "").includes(search) && p.status !== 'En attente';
                     }).map((p) => (
                       <tr key={p.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                         <td className="p-6">
                           <p className="font-black text-sm uppercase">{p.full_name}</p>
                           <p className="text-xs text-zinc-500 font-bold">{p.contact}</p>
                         </td>
                         <td className="p-6">
                           <span className="px-3 py-1 text-[10px] font-black uppercase rounded-full bg-zinc-200 text-black">{p.activity}</span>
                           <p className="text-[10px] font-black uppercase mt-2 text-[#39FF14]">{p.status}</p>
                         </td>
                         <td className="p-6 text-center font-black text-xl">{p.sales}</td>
                         <td className="p-6 text-right">
                           <button onClick={() => { setSelectedPartner(p); setIsEditingPartner(false); setShowPartnerModal(true); }} className="text-[10px] font-black uppercase bg-black text-white px-4 py-2 rounded-lg hover:bg-[#39FF14] hover:text-black transition">Détails</button>
                         </td>
                       </tr>
                     ))}
                     {(!partners || partners.length === 0) && (<tr><td colSpan={4} className="p-6 text-center text-zinc-500 text-sm italic">Aucun partenaire trouvé.</td></tr>)}
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
                 {(ECOSYSTEM_SAAS || []).map(saas => (
                    <div key={saas.id} className="bg-white border border-zinc-200 p-8 rounded-[3rem] shadow-sm hover:border-black transition group flex flex-col justify-between min-h-[250px]">
                       <div>
                          <div className={`w-12 h-12 rounded-2xl mb-6 flex items-center justify-center text-white ${saas.color}`}><Box size={24}/></div>
                          <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase`}>{saas.name}</h3>
                          <p className="text-sm font-bold text-zinc-500 mt-2">{saas.desc}</p>
                       </div>
                       <div className="mt-8 flex gap-2">
                          <button onClick={() => { setShowSaasLogin(saas); setSaasModalMode('login'); }} className="flex-1 bg-black text-[#39FF14] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition shadow-lg">Login / Demo</button>
                          <button onClick={() => { setShowSaasLogin(saas); setSaasModalMode('create'); }} className="flex-1 bg-zinc-100 text-black py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition">Créer Accès</button>
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
                   <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>ARTICLES & CIBLAGE</h2>
                   <div className="flex gap-4">
                      <button onClick={runIAArticleSuggestion} className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:scale-105 transition"><Sparkles size={16}/> Auto-Suggestion IA</button>
                      <button onClick={() => alert("Ouverture de l'éditeur manuel...")} className="bg-zinc-100 text-black px-6 py-3 rounded-2xl font-black uppercase text-xs hover:bg-zinc-200 transition">Rédiger Manuel</button>
                   </div>
                </div>

                <div className="space-y-6">
                   {(marketingArticles || []).map(article => (
                      <div key={article.id} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                         <div className="flex-1">
                            <div className="flex gap-2 mb-4">
                               <span className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase">{article.category}</span>
                               <span className="bg-zinc-100 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase">Cible : {article.cible}</span>
                            </div>
                            <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-2`}>{article.title}</h3>
                            <p className="text-zinc-500 font-medium text-sm">{article.desc}</p>
                         </div>
                         <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button onClick={() => { setShowDiffusionModal(article); setSelectedContactsForDiffusion([]); }} className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg flex justify-center items-center gap-2"><Send size={16}/> Diffuser au segment</button>
                            <button onClick={() => alert("Édition en cours...")} className="bg-zinc-100 text-black px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-zinc-200 transition flex justify-center items-center gap-2">Éditer</button>
                         </div>
                      </div>
                   ))}
                   {(!marketingArticles || marketingArticles.length === 0) && (<p className="text-center text-zinc-500 italic">Aucun article disponible.</p>)}
                </div>
             </div>
          )}

          {/* ================= FINANCES ================= */}
          {activeView === 'finance' && (
             <div className="space-y-8 animate-in fade-in max-w-7xl mx-auto">
                <div className="flex justify-between items-center bg-white p-6 rounded-[3rem] border border-zinc-200 shadow-sm">
                   <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}><Wallet className="inline mr-2 text-[#39FF14]"/> HUB FINANCIER</h2>
                   <button onClick={() => alert("Exportation PDF/CSV en cours...")} className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black uppercase text-xs flex items-center gap-2 hover:scale-105 transition"><Download size={16}/> Exporter Rapport</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                   <div onClick={() => setFinanceCardFilter(financeCardFilter === 'revenus' ? null : 'revenus')} className={`bg-black text-white p-6 rounded-[2rem] shadow-xl relative overflow-hidden cursor-pointer hover:scale-105 transition ${financeCardFilter === 'revenus' ? 'ring-4 ring-[#39FF14]' : ''}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Revenus Globaux</p>
                     <p className={`${spaceGrotesk.className} text-3xl font-black text-[#39FF14]`}>4.850.000 F</p>
                   </div>
                   <div onClick={() => setFinanceCardFilter(financeCardFilter === 'mrr' ? null : 'mrr')} className={`bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm cursor-pointer hover:scale-105 transition ${financeCardFilter === 'mrr' ? 'ring-4 ring-[#39FF14]' : ''}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">MRR (Récurrent)</p>
                     <p className={`${spaceGrotesk.className} text-3xl font-black`}>1.200.000 F</p>
                   </div>
                   <div onClick={() => setFinanceCardFilter(financeCardFilter === 'com' ? null : 'com')} className={`bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-sm cursor-pointer hover:scale-105 transition ${financeCardFilter === 'com' ? 'ring-4 ring-[#39FF14]' : ''}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Commissions Partenaires</p>
                     <p className={`${spaceGrotesk.className} text-3xl font-black`}>450.000 F</p>
                   </div>
                   <div onClick={() => setFinanceCardFilter(financeCardFilter === 'dep' ? null : 'dep')} className={`bg-red-50 border border-red-100 p-6 rounded-[2rem] shadow-sm cursor-pointer hover:scale-105 transition ${financeCardFilter === 'dep' ? 'ring-4 ring-red-500' : ''}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">Dépenses</p>
                     <p className={`${spaceGrotesk.className} text-3xl font-black text-red-600`}>120.000 F</p>
                   </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[3rem] p-8 shadow-sm">
                   <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 flex items-center gap-2`}><List className="text-[#39FF14]"/> Registre des Transactions</h3>
                   
                   <div className="flex flex-col md:flex-row gap-4 mb-6">
                      <div className="flex-1 relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5" />
                         <input type="text" placeholder="Recherche par Client, Réf, Montant..." value={financeSearch} onChange={e => setFinanceSearch(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl outline-none font-bold text-sm focus:border-black transition" />
                      </div>
                      <select value={financeTypeFilter} onChange={e => setFinanceTypeFilter(e.target.value)} className="px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold text-sm outline-none cursor-pointer">
                         <option value="Tous">Tous les types</option><option value="Entrée">Entrées d'argent</option><option value="Sortie">Sorties d'argent</option>
                      </select>
                   </div>

                   <table className="w-full text-left border-collapse">
                      <thead className="bg-zinc-50 border-b border-zinc-200">
                         <tr>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Date & Réf</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Client / Motif</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Montant</th>
                            <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Statut</th>
                         </tr>
                      </thead>
                      <tbody>
                         {(transactions || []).filter(t => {
                            const search = financeSearch?.toLowerCase() || "";
                            if (search && !(t.client?.toLowerCase() || "").includes(search) && !(t.ref?.toLowerCase() || "").includes(search) && !t.amount.toString().includes(search)) return false;
                            if (financeTypeFilter === 'Entrée' && t.amount <= 0) return false;
                            if (financeTypeFilter === 'Sortie' && t.amount > 0) return false;
                            return true;
                         }).map(t => (
                            <tr key={t.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition">
                               <td className="p-4">
                                  <p className="font-bold text-sm">{t.date}</p>
                                  <p className="text-[10px] font-black text-zinc-400">{t.ref}</p>
                               </td>
                               <td className="p-4">
                                  <p className="font-black text-sm uppercase">{t.client}</p>
                                  <p className="text-xs font-bold text-zinc-500">{t.type}</p>
                               </td>
                               <td className="p-4">
                                  <p className={`font-black text-lg ${t.amount > 0 ? 'text-[#39FF14] bg-black px-3 py-1 rounded-lg inline-block' : 'text-red-500 bg-red-50 px-3 py-1 rounded-lg inline-block'}`}>
                                     {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} F
                                  </p>
                               </td>
                               <td className="p-4 text-right">
                                  <span className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-md ${t.status === 'Payé' ? 'bg-[#39FF14]/20 text-black' : t.status === 'En attente' ? 'bg-yellow-100 text-yellow-700' : 'bg-zinc-200 text-black'}`}>{t.status}</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

        </div>
      </main>

      {/* ================= MODALES GLOBALES ================= */}

      {/* MODALE DIFFUSION MARKETING */}
      {showDiffusionModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowDiffusionModal, () => setSelectedContactsForDiffusion([]))} className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in max-h-[90vh] flex flex-col">
            <button onClick={() => { setShowDiffusionModal(null); setSelectedContactsForDiffusion([]); }} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-10"><X size={20}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-2`}>Planifier la diffusion</h2>
            <p className="text-xs font-bold text-zinc-500 mb-6">Article cible : <span className="text-black">{showDiffusionModal?.title || ""}</span></p>

            <div className="flex-1 overflow-y-auto mb-6 border border-zinc-200 rounded-3xl p-4 bg-zinc-50">
               <div className="flex justify-between items-center mb-4 pb-2 border-b border-zinc-200">
                  <p className="text-[10px] font-black uppercase tracking-widest">Sélectionner les contacts CRM</p>
                  <button onClick={() => setSelectedContactsForDiffusion((contacts || []).map(c=>c.id))} className="text-[10px] font-bold text-[#39FF14] bg-black px-3 py-1 rounded-full">Tout Sélectionner</button>
               </div>
               <div className="space-y-2">
                  {(contacts || []).map(c => (
                     <label key={c.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-200 cursor-pointer hover:border-black">
                        <input type="checkbox" checked={(selectedContactsForDiffusion || []).includes(c.id)} onChange={(e) => {
                           if(e.target.checked) setSelectedContactsForDiffusion([...(selectedContactsForDiffusion || []), c.id]);
                           else setSelectedContactsForDiffusion((selectedContactsForDiffusion || []).filter(id => id !== c.id));
                        }} className="w-5 h-5 accent-black" />
                        <div>
                           <p className="font-bold text-sm uppercase">{c.full_name}</p>
                           <p className="text-[10px] font-bold text-zinc-500 uppercase">{c.type} • {c.saas}</p>
                        </div>
                     </label>
                  ))}
               </div>
            </div>

            <button onClick={scheduleMarketingDiffusion} className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition flex justify-center items-center gap-2">
               <Send size={16}/> Planifier l'envoi ({(selectedContactsForDiffusion || []).length} sélectionnés)
            </button>
          </div>
        </div>
      )}

      {/* MODALE DÉTAILS / EDITION PARTENAIRE */}
      {showPartnerModal && selectedPartner && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowPartnerModal)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in max-h-[90vh] overflow-y-auto">
             <button onClick={() => setShowPartnerModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-10"><X size={20}/></button>
             
             {!isEditingPartner ? (
                <>
                   <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2`}>{selectedPartner.full_name}</h2>
                   <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8 flex items-center gap-2"><span className="w-2 h-2 bg-[#39FF14] rounded-full"></span> Statut : {selectedPartner.status}</p>
                   
                   <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200">
                        <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Gains Générés</p>
                        <p className={`${spaceGrotesk.className} text-3xl font-black text-[#39FF14]`}>{selectedPartner.revenue}</p>
                      </div>
                      <div className="bg-zinc-50 p-6 rounded-3xl border border-zinc-200">
                        <p className="text-[10px] font-black uppercase text-zinc-500 mb-2">Ventes Réussies</p>
                        <p className={`${spaceGrotesk.className} text-3xl font-black`}>{selectedPartner.sales}</p>
                      </div>
                   </div>
                   
                   <div className="space-y-4">
                      <button onClick={() => { setEditPartnerForm(selectedPartner); setIsEditingPartner(true); }} className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition flex justify-center items-center gap-2">
                        <Edit3 size={16}/> Éditer le compte Ambassadeur
                      </button>
                      <button onClick={handleConvertPartnerToClient} className="w-full bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-zinc-200 transition flex justify-center items-center gap-2">
                        <UserPlus size={16}/> Convertir en Client (Conserver statut Amb.)
                      </button>
                   </div>
                </>
             ) : (
                <>
                   <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-8`}>Édition Partenaire</h2>
                   <div className="space-y-4 mb-8">
                      <input type="text" placeholder="Nom Complet" value={editPartnerForm?.full_name || ""} onChange={e => setEditPartnerForm({...editPartnerForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
                      <input type="text" placeholder="Contact" value={editPartnerForm?.contact || ""} onChange={e => setEditPartnerForm({...editPartnerForm, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
                      <input type="text" placeholder="Activité" value={editPartnerForm?.activity || ""} onChange={e => setEditPartnerForm({...editPartnerForm, activity: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
                      <div className="grid grid-cols-2 gap-4">
                         <input type="number" placeholder="Ventes" value={editPartnerForm?.sales || 0} onChange={e => setEditPartnerForm({...editPartnerForm, sales: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
                         <input type="text" placeholder="Revenus" value={editPartnerForm?.revenue || ""} onChange={e => setEditPartnerForm({...editPartnerForm, revenue: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
                      </div>
                      <select value={editPartnerForm?.status || 'En attente'} onChange={e => setEditPartnerForm({...editPartnerForm, status: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none cursor-pointer">
                         <option value="Actif">Actif</option><option value="Top Performer">Top Performer</option><option value="En attente">En attente</option><option value="Inactif">Inactif</option>
                      </select>
                   </div>
                   <div className="flex gap-4">
                      <button onClick={() => setIsEditingPartner(false)} className="flex-1 bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-zinc-200 transition">Annuler</button>
                      <button onClick={handleSavePartner} className="flex-1 bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg">Enregistrer</button>
                   </div>
                </>
             )}
          </div>
        </div>
      )}

      {/* MODALE SAAS: LOGIN & CREATION (Combiné) */}
      {showSaasLogin && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowSaasLogin)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="bg-white p-10 rounded-[4rem] max-w-lg w-full relative shadow-[0_0_60px_rgba(57,255,20,0.15)] animate-in zoom-in border-t-4 border-[#39FF14] max-h-[90vh] overflow-y-auto">
               <button onClick={() => setShowSaasLogin(null)} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-black transition z-10"><X size={20}/></button>
               
               <div className="flex justify-center gap-2 mb-8 bg-zinc-100 p-1.5 rounded-2xl w-max mx-auto">
                  <button onClick={() => setSaasModalMode('login')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition ${saasModalMode === 'login' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Se Connecter</button>
                  <button onClick={() => setSaasModalMode('create')} className={`px-4 py-2 text-[10px] font-black uppercase rounded-xl transition ${saasModalMode === 'create' ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:text-black'}`}>Créer un Accès</button>
               </div>

               <div className="text-center mb-8">
                  <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center text-white ${showSaasLogin?.color || 'bg-black'} shadow-lg mx-auto mb-4`}><Box size={32}/></div>
                  <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase`}>{showSaasLogin?.name || "SaaS"}</h2>
                  <p className="text-xs font-bold text-zinc-500 mt-1">{saasModalMode === 'login' ? 'Connexion à votre espace d\'administration.' : 'Générer un accès client pour cet outil.'}</p>
               </div>
               
               {saasModalMode === 'login' ? (
                  <div className="space-y-4">
                     <input type="email" placeholder="Adresse Email" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
                     <input type="password" placeholder="Mot de passe" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
                     <button onClick={() => alert("Connexion réussie ! Redirection en cours...")} className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:scale-105 transition mt-4 flex items-center justify-center gap-2"><LogIn size={16}/> Connexion</button>
                  </div>
               ) : (
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                           <input type="radio" name="createType" checked={saasCreateType === 'prospect'} onChange={() => setSaasCreateType('prospect')} className="accent-black" /> Depuis CRM (Prospect)
                        </label>
                        <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                           <input type="radio" name="createType" checked={saasCreateType === 'manual'} onChange={() => setSaasCreateType('manual')} className="accent-black" /> Saisie Manuelle
                        </label>
                     </div>

                     {saasCreateType === 'prospect' ? (
                        <select value={saasCreateForm.prospectId} onChange={e => setSaasCreateForm({...saasCreateForm, prospectId: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none cursor-pointer">
                           <option value="" disabled>-- Sélectionner un Prospect CRM --</option>
                           {(contacts || []).filter(c => c.type === 'Prospect').map(c => (
                              <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>
                           ))}
                        </select>
                     ) : (
                        <div className="space-y-4">
                           <input type="text" placeholder="Nom complet du client" value={saasCreateForm.name} onChange={e => setSaasCreateForm({...saasCreateForm, name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
                           <input type="tel" placeholder="Numéro WhatsApp (ex: 2217...)" value={saasCreateForm.phone} onChange={e => setSaasCreateForm({...saasCreateForm, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
                        </div>
                     )}

                     <div className="relative">
                        <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input type="text" placeholder="Générer un mot de passe d'accès" value={saasCreateForm.password} onChange={e => setSaasCreateForm({...saasCreateForm, password: e.target.value})} className="w-full pl-10 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
                     </div>

                     <button onClick={handleCreateSaasAccount} className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-xs shadow-xl hover:bg-black hover:text-[#39FF14] transition flex items-center justify-center gap-2">
                        <UserPlus size={16}/> Créer & Notifier par WhatsApp
                     </button>
                  </div>
               )}
            </div>
         </div>
      )}

      {/* MODALE EDITION CRM */}
      {showContactModal && editingContact && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowContactModal)} className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-lg w-full relative shadow-2xl animate-in zoom-in">
            <button onClick={() => setShowContactModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={20}/></button>
            <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter mb-8`}>{editingContact?.id ? 'Éditer Fiche' : 'Nouveau Contact'}</h2>
            <form onSubmit={handleSaveContact} className="space-y-4">
              <input type="text" required placeholder="Nom Complet" value={editingContact?.full_name || ""} onChange={e => setEditingContact({...editingContact, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
              <input type="tel" required placeholder="Téléphone WhatsApp" value={editingContact?.phone || ""} onChange={e => setEditingContact({...editingContact, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
              <div className="grid grid-cols-2 gap-4">
                 <select value={editingContact?.type || 'Prospect'} onChange={e => setEditingContact({...editingContact, type: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none cursor-pointer">
                   <option value="Prospect">Prospect</option>
                   <option value="Client">Client</option>
                 </select>
                 <input type="text" placeholder="Produit SaaS" value={editingContact?.saas || ""} onChange={e => setEditingContact({...editingContact, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
              </div>
              <input type="text" placeholder="Statut / Notes" value={editingContact?.status || ''} onChange={e => setEditingContact({...editingContact, status: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
              <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-2xl font-black uppercase text-sm mt-4 shadow-xl hover:scale-105 transition">
                <CheckCircle size={18} className="inline mr-2"/> Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE PROFIL ADMIN */}
      {showProfileModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowProfileModal)} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white p-10 rounded-[3.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in text-center">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition z-10"><X size={20}/></button>
            
            <img src={tempAdminProfile?.avatar} className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-black object-cover" alt="" />
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-1`}>ADMINISTRATEUR</h2>
            <p className="text-xs font-bold text-zinc-400 mb-8">contact@onyxops.com</p>

            <div className="space-y-4 text-left">
               <input 
                 type="text" 
                 placeholder="Nom affiché" 
                 value={tempAdminProfile?.name || ""} 
                 onChange={e => setTempAdminProfile({...tempAdminProfile, name: e.target.value})} 
                 className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" 
               />
               <input 
                 type="text" 
                 placeholder="URL Image" 
                 value={tempAdminProfile?.avatar || ""} 
                 onChange={e => setTempAdminProfile({...tempAdminProfile, avatar: e.target.value})} 
                 className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none text-xs" 
               />
               
               <button onClick={saveAdminProfile} className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs shadow-lg hover:scale-105 transition mb-6">
                 Enregistrer le profil
               </button>
               
               <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-6 mb-2">Modifier le mot de passe</p>
               <input type="password" placeholder="Mot de passe actuel (optionnel)" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
               <input type="password" placeholder="Nouveau mot de passe" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
               <input type="password" placeholder="Confirmer le mot de passe" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none" />
               <button onClick={() => { alert('Mot de passe mis à jour !'); setShowProfileModal(false); }} className="w-full bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase text-xs hover:bg-black hover:text-white transition mt-2">
                 Changer le mot de passe
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
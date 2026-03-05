"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { createClient } from "@supabase/supabase-js";
import { 
  LayoutDashboard, Users, Box, Wallet, Handshake, Megaphone, 
  Search, Plus, CheckCircle, Clock, AlertCircle, X, Sparkles, 
  ExternalLink, MessageSquare, LogIn, Send, Download, Edit3, UserPlus,
  BarChart, MapPin, Calendar, Lock, ChevronDown, List, Trash2, Filter, 
  RefreshCcw, FileText, Activity, TrendingUp, Layers, ArrowUpRight,
  Settings, Bell, LogOut, Share2, Target, Zap
} from "lucide-react";

// --- CONFIGURATION SUPABASE SÉCURISÉE POUR LE BUILD ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// On n'appelle createClient que si les variables existent pour éviter l'erreur de build
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

// --- TYPES & INTERFACES ---
type ViewType = 'dashboard' | 'crm' | 'leads' | 'ecosystem' | 'finance' | 'partners' | 'marketing';
type ActionModule = 'CRM' | 'Partenaires' | 'Marketing' | 'SaaS';

type IAAction = { 
  id: string; 
  module: ActionModule; 
  title: string; 
  desc: string; 
  date: string; 
  status: 'En attente' | 'En cours' | 'Réalisé' | 'Annulé'; 
  phone?: string; 
  msg?: string; 
};

// --- COMPOSANT PRINCIPAL ---
export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [todayStr, setTodayStr] = useState('');
  const [loading, setLoading] = useState(true);

  // --- NAVIGATION & FILTRES GLOBAUX ---
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [globalFilterDate, setGlobalFilterDate] = useState('Ce Mois');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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
  const [adminProfile, setAdminProfile] = useState({ name: 'Onyx Administrator', avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=39FF14&bold=true' });
  const [tempAdminProfile, setTempAdminProfile] = useState({ ...adminProfile });

  // Données
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
  const [partnerSearch, setPartnerSearch] = useState("");
  const [financeSearch, setFinanceSearch] = useState("");
  const [financeTypeFilter, setFinanceTypeFilter] = useState("Tous");
  const [financeCardFilter, setFinanceCardFilter] = useState<string | null>(null);

  // --- DASHBOARD CONSTANTS & DESIGN ---
  const [histogramData, setHistogramData] = useState([
    { day: 'Lun', ca: 150000, date: '02 Mar', active: false },
    { day: 'Mar', ca: 300000, date: '03 Mar', active: false },
    { day: 'Mer', ca: 850000, date: '04 Mar', active: true },
    { day: 'Jeu', ca: 120000, date: '05 Mar', active: false },
    { day: 'Ven', ca: 450000, date: '06 Mar', active: false },
    { day: 'Sam', ca: 900000, date: '07 Mar', active: false },
    { day: 'Dim', ca: 200000, date: '08 Mar', active: false },
  ]);
  const maxCa = useMemo(() => Math.max(...histogramData.map(d => d.ca)) || 1, [histogramData]);

  const ECOSYSTEM_SAAS = [
    { id: "vente", name: "Onyx Vente", desc: "Catalogue & Devis WhatsApp", color: "bg-blue-500", url: "https://vente.onyxops.com" },
    { id: "tiak", name: "Onyx Tiak", desc: "Logistique & Livreurs", color: "bg-orange-500", url: "https://tiak.onyxops.com" },
    { id: "stock", name: "Onyx Stock", desc: "Gestion d'Inventaire", color: "bg-purple-500", url: "https://stock.onyxops.com" },
    { id: "menu", name: "Onyx Menu", desc: "Menu QR & Commandes", color: "bg-red-500", url: "https://menu.onyxops.com" },
    { id: "booking", name: "Onyx Booking", desc: "Réservations & Acomptes", color: "bg-pink-500", url: "https://booking.onyxops.com" },
    { id: "staff", name: "Onyx Staff", desc: "Pointage & Paie", color: "bg-cyan-500", url: "https://staff.onyxops.com" },
    { id: "trio", name: "Pack Trio", desc: "Vente + Stock + Tiak", color: "bg-emerald-500", url: "https://trio.onyxops.com" },
    { id: "full", name: "Pack Full", desc: "Écosystème Complet", color: "bg-black", url: "https://full.onyxops.com" },
    { id: "premium", name: "Onyx Premium", desc: "IA & CRM Intégré", color: "bg-indigo-500", url: "https://premium.onyxops.com" },
  ];

// --- INITIALISATION & DATA FETCHING ---
  const fetchSupabaseData = async () => {
  // Sécurité indispensable pour le build Next.js
  if (!supabase) return;

    setIsRefreshing(true);
    setLoading(true);

    try {
      const [clientsRes, leadsRes, partnersRes, articlesRes] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('leads').select('*'),
        supabase.from('partners').select('*'),
        supabase.from('articles').select('*')
      ]);

      if (clientsRes?.data) setContacts(clientsRes.data.reverse());
      if (leadsRes?.data) setLeads(leadsRes.data.reverse());
      if (partnersRes?.data) setPartners(partnersRes.data.reverse());
      if (articlesRes?.data) setMarketingArticles(articlesRes.data.reverse());
    
    } catch (err) {
      console.error("Erreur de synchronisation terminal:", err);
    } finally {
      setLoading(false);
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  useEffect(() => {
    setMounted(true);
    const currentDate = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    setTodayStr(currentDate);
    fetchSupabaseData();

    // Simulation d'Actions IA dynamiques
    setActionsIA([
       { id: 'a1', module: 'CRM', title: 'Relance Essai - Boutique Fatou', desc: 'Essai Onyx Vente expire demain.', date: currentDate, status: 'En attente', phone: '221769876543', msg: 'Bonjour Boutique Fatou, votre essai Onyx Vente expire demain. Souhaitez-vous le prolonger ?' },
       { id: 'a2', module: 'Partenaires', title: 'Booster Moussa D.', desc: 'Aucune vente depuis 15 jours. Lui envoyer le script.', date: currentDate, status: 'En attente', phone: '221770000000', msg: 'Salut Moussa, voici un nouveau script de vente qui marche très bien en ce moment pour vendre le Pack Trio.' },
       { id: 'a3', module: 'Marketing', title: 'Newsletter : L\'ère du Digital', desc: 'Diffusion automatique programmée pour les prospects Restauration.', date: 'Demain', status: 'En attente' },
       { id: 'a4', module: 'SaaS', title: 'Maintenance Stock', desc: 'Optimisation de la base de données pour Onyx Stock.', date: 'Ce soir', status: 'En cours' }
    ]);

    setTransactions([
      { id: 'tr1', date: currentDate, client: 'Boutique Fatou', amount: 17500, type: 'Abonnement Trio', status: 'Payé', ref: 'WAVE-10293' },
      { id: 'tr2', date: 'Hier', client: 'Resto Dakar', amount: 30000, type: 'Pack Full', status: 'En attente', ref: 'OM-99212' },
      { id: 'tr3', date: '01 Mar 2026', client: 'Cheikh N.', amount: -45000, type: 'Commission Ambassadeur', status: 'Versé', ref: 'PAY-4412' },
      { id: 'tr4', date: '02 Mar 2026', client: 'Auto-Ecole Plus', amount: 50000, type: 'Pack Full', status: 'Payé', ref: 'WAVE-8821' },
      { id: 'tr5', date: '03 Mar 2026', client: 'Boutique Z', amount: 10000, type: 'Onyx Vente', status: 'Payé', ref: 'OM-1102' },
    ]);
  }, []);

  if (!mounted) {
    return (
      <div className={`flex h-screen w-full bg-black items-center justify-center ${inter.className}`}>
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-t-4 border-l-4 border-[#39FF14] rounded-full animate-spin shadow-[0_0_20px_#39FF14]"></div>
          <div className="text-center">
            <h1 className={`${spaceGrotesk.className} text-2xl font-black text-white uppercase tracking-[0.5em]`}>OnyxOps</h1>
            <p className="text-[10px] font-bold text-[#39FF14] uppercase tracking-widest mt-2 animate-pulse">Initialisation du Terminal de Contrôle...</p>
          </div>
        </div>
      </div>
    );
  }

  // --- LOGIQUE METIER & ACTIONS ---
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
    if (idIA) setActionsIA(prev => prev.map(a => a.id === idIA ? { ...a, status: 'Réalisé' } : a));
  };

  const replyToLead = (lead: any) => {
     const msg = `Bonjour ${lead.full_name}, je suis l'administrateur d'OnyxOps. J'ai bien reçu votre demande concernant "${lead.intent}". Comment puis-je vous aider ?`;
     window.open(`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const planifyCrmAction = (title: string, desc: string, phone: string, msg: string) => {
     const newAction: IAAction = { id: Date.now().toString(), module: 'CRM', title, desc, date: todayStr, status: 'En attente', phone, msg };
     setActionsIA([newAction, ...actionsIA]);
     alert("Action planifiée sur le dashboard !");
     setShowRapportIA(false);
  };

  const handleDeleteItem = async (table: string, id: string) => {
    if (!supabase) return; // AJOUTER CETTE LIGNE
    if(!confirm("⚠️ Attention : Suppression irréversible. Confirmer ?")) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if(error) alert("Erreur terminal : " + error.message);
    else fetchSupabaseData();
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return; // AJOUTER CETTE LIGNE
    const payload = { ...editingContact };
    const isNew = !payload.id;
    if (isNew) delete payload.id;
    
    const { error } = await supabase.from('clients').upsert(payload);
    if (error) { alert(`Erreur base de données : ${error.message}`); return; }
    fetchSupabaseData();
    setShowContactModal(false);
  };

  const approvePartner = async (id: string) => {
    const { error } = await supabase.from('partners').update({ status: 'Actif' }).eq('id', id);
    if (error) alert("Erreur terminal : " + error.message);
    else fetchSupabaseData();
  };

  const handleSavePartner = async () => {
     if(!editPartnerForm) return;
     const { error } = await supabase.from('partners').update(editPartnerForm).eq('id', editPartnerForm.id);
     if (error) alert("Erreur terminal : " + error.message);
     else { fetchSupabaseData(); setIsEditingPartner(false); setShowPartnerModal(false); }
  };

  const handleConvertPartnerToClient = async () => {
      if(!selectedPartner) return;
      const { error } = await supabase.from('clients').insert({
        full_name: selectedPartner.full_name,
        phone: selectedPartner.contact,
        type: 'Client',
        status: 'Converti Ambassadeur'
      });
      if(error) alert(error.message);
      else { alert("Ambassadeur ajouté au CRM Clients !"); fetchSupabaseData(); }
  };

  const handleCreateSaasAccount = async () => {
     if (saasCreateType === 'manual' && (!saasCreateForm.name || !saasCreateForm.phone || !saasCreateForm.password)) return alert("Veuillez remplir tous les champs.");
     
     let targetPhone = saasCreateForm.phone;
     let targetName = saasCreateForm.name;
     if (saasCreateType === 'prospect') {
        const p = contacts.find(c => c.id === saasCreateForm.prospectId);
        if(p) { targetPhone = p.phone; targetName = p.full_name; }
     }
     
     const msg = `Félicitations ${targetName} ! Votre espace ${showSaasLogin.name} est actif.\nLien : https://${showSaasLogin.id}.onyxops.com\nIdentifiant : ${targetPhone}\nMot de passe : ${saasCreateForm.password}`;
     
     // Logique d'insertion Supabase pour le nouveau client SaaS
     await supabase.from('clients').upsert({
        full_name: targetName,
        phone: targetPhone,
        type: 'Client',
        saas: showSaasLogin.name,
        status: 'Compte Créé'
     }, { onConflict: 'phone' });

     alert(`Compte ${showSaasLogin.name} créé et enregistré !`);
     setShowSaasLogin(null);
     fetchSupabaseData();
     window.open(`https://wa.me/${targetPhone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const saveAdminProfile = () => {
     setAdminProfile(tempAdminProfile);
     alert("Profil synchronisé !");
     setShowProfileModal(false);
  };

  const runIAArticleSuggestion = () => {
      const newArt = { id: Date.now().toString(), title: 'BOOSTER SES VENTES WHATSAPP AVEC L\'IA', desc: 'Scripts de vente générés par IA pour augmenter vos taux de conversion.', category: 'Stratégie', cible: 'Tous' };
      setMarketingArticles([newArt, ...marketingArticles]);
      alert("IA : Nouvel article suggéré et ajouté.");
  };

  const scheduleMarketingDiffusion = () => {
      if(selectedContactsForDiffusion.length === 0) return alert("Sélectionnez au moins un contact.");
      const newAction: IAAction = { id: Date.now().toString(), module: 'Marketing', title: `Diffusion : ${showDiffusionModal?.title}`, desc: `Envoi à ${selectedContactsForDiffusion.length} contacts.`, date: todayStr, status: 'En attente' };
      setActionsIA([newAction, ...actionsIA]);
      setShowDiffusionModal(null);
      alert("Diffusion planifiée.");
  };

  // --- LOGIQUE DE FILTRES ---
  const filteredContacts = (contacts || []).filter(c => {
    if (crmTypeFilter !== 'Tous' && c.type !== crmTypeFilter) return false;
    const search = crmSearch.toLowerCase();
    if (search && !c.full_name?.toLowerCase().includes(search) && !c.phone?.includes(search)) return false;
    if (crmCardFilter === 'new_clients' && c.type !== 'Client') return false;
    return true;
  });

  const filteredTransactions = (transactions || []).filter(t => {
     const search = financeSearch.toLowerCase();
     if (search && !t.client?.toLowerCase().includes(search) && !t.ref?.toLowerCase().includes(search)) return false;
     if (financeTypeFilter === 'Entrée' && t.amount <= 0) return false;
     if (financeTypeFilter === 'Sortie' && t.amount > 0) return false;
     return true;
  });

  const filteredActionsIA = (actionsIA || []).filter(a => {
      if (actionTabFilter === 'IA' && a.module === 'Marketing') return false;
      if (actionTabFilter === 'Marketing' && a.module !== 'Marketing') return false;
      const search = actionSearchFilter.toLowerCase();
      return a.title.toLowerCase().includes(search) || a.desc.toLowerCase().includes(search);
  });

  // --- STRUCTURE DU DASHBOARD ---
  return (
    <div className={`flex h-screen bg-[#fafafa] ${inter.className} text-black overflow-hidden relative selection:bg-[#39FF14]/30`}>
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-white border-r border-zinc-200 flex flex-col z-30 shadow-sm hidden md:flex transition-all">
        <div className="p-10">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black tracking-tighter uppercase cursor-pointer group`} onClick={() => setActiveView('dashboard')}>
            ONYX<span className="text-[#39FF14] group-hover:drop-shadow-[0_0_8px_rgba(57,255,20,0.6)] transition-all">OPS</span>
          </h1>
          <div className="mt-2 flex items-center gap-2">
             <div className="w-1.5 h-1.5 bg-[#39FF14] rounded-full animate-pulse"></div>
             <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Admin Hub 2026</p>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-6 space-y-10">
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] mb-4 pl-4">Terminal Principal</p>
            <nav className="space-y-1">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
                { id: 'leads', icon: MessageSquare, label: 'Leads & Flux' },
                { id: 'crm', icon: Users, label: 'CRM & Membres' },
                { id: 'ecosystem', icon: Box, label: '9 SaaS Onyx' },
                { id: 'finance', icon: Wallet, label: 'Finances' },
                { id: 'partners', icon: Handshake, label: 'Ambassadeurs' },
              ].map(item => (
                <button 
                  key={item.id} 
                  onClick={() => setActiveView(item.id as ViewType)} 
                  className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === item.id ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}
                >
                  <item.icon size={20} className={activeView === item.id ? 'text-[#39FF14]' : ''} /> 
                  {item.label}
                  {item.id === 'leads' && leads.length > 0 && (
                     <span className="ml-auto bg-[#39FF14] text-black text-[10px] font-black px-2 py-0.5 rounded-full">{leads.length}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
          
          <div>
            <p className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] mb-4 pl-4">Stratégie & Ventes</p>
            <nav className="space-y-1">
               <button onClick={() => setActiveView('marketing')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === 'marketing' ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}>
                 <Megaphone size={20} /> Marketing & Blog
               </button>
               <button onClick={() => setShowRapportIA(true)} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-black transition-all">
                 <Sparkles size={20} className="text-[#39FF14]" /> Scan Intelligence
               </button>
            </nav>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-100">
           <div className="bg-black rounded-2xl p-4 flex items-center gap-4 border border-zinc-800">
              <div className="w-10 h-10 bg-[#39FF14]/10 rounded-xl flex items-center justify-center text-[#39FF14]"><Activity size={20}/></div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Status Serveur</p>
                 <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1">Dakar Hub : Optimsé</p>
              </div>
           </div>
        </div>
      </aside>

      {/* ================= MAIN AREA ================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafafa]">
        
        {/* HEADER GÉANT */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 h-28 flex items-center justify-between px-12 shrink-0 z-20">
          <div className="flex flex-col">
            <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter text-black`}>
               {activeView === 'dashboard' ? 'Terminal Central' : activeView.replace('-', ' ')}
            </h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{todayStr}</span>
               <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
               <span className="text-[10px] font-black text-[#39FF14] uppercase bg-black px-2 py-0.5 rounded-md">Live Session</span>
            </div>
          </div>
          
          <div className="flex items-center gap-10">
            <div className="hidden lg:flex items-center gap-8 pr-10 border-r border-zinc-200">
               <button onClick={fetchSupabaseData} className={`text-zinc-400 hover:text-black transition-all ${isRefreshing ? 'animate-spin text-[#39FF14]' : ''}`}>
                  <RefreshCcw size={22}/>
               </button>
               <div className="relative cursor-pointer group">
                  <Bell size={22} className="text-zinc-400 group-hover:text-black transition-colors"/>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">3</span>
               </div>
            </div>
            
            <div onClick={() => setShowProfileModal(true)} className="flex items-center gap-5 bg-white border border-zinc-200 p-2.5 pr-8 rounded-full cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1 group active:scale-95">
              <div className="relative">
                <img src={adminProfile?.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-zinc-50" alt="Admin" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#39FF14] border-[3px] border-white rounded-full"></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-black uppercase leading-none text-black group-hover:text-[#39FF14] transition-colors">{adminProfile?.name}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-widest">Contrôleur Onyx</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU DYNAMIQUE */}
        <div className="flex-1 overflow-y-auto p-12 scroll-smooth">
          
          {/* ================= VUE DASHBOARD ================= */}
          {activeView === 'dashboard' && (
            <div className={`space-y-12 max-w-[1600px] mx-auto transition-all duration-700 ${isRefreshing ? 'opacity-30 scale-[0.98] grayscale' : 'opacity-100 scale-100 grayscale-0'}`}>
              
              {/* STATS PRINCIPALES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div onClick={() => setActiveView('finance')} className="bg-black p-10 rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden cursor-pointer hover:scale-[1.03] transition-all group border border-zinc-800">
                  <div className="absolute -top-12 -right-12 p-12 opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 text-[#39FF14]"><Wallet size={200}/></div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Chiffre d'Affaires Mensuel</p>
                  <div className="flex items-end gap-4">
                    <p className={`${spaceGrotesk.className} text-6xl font-black text-[#39FF14] tracking-tighter`}>1.245.000 <span className="text-2xl opacity-50 font-medium">F</span></p>
                    <div className="flex flex-col mb-2">
                       <span className="text-[10px] font-black text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded-lg flex items-center gap-1"><ArrowUpRight size={12}/> +12.4%</span>
                    </div>
                  </div>
                </div>

                <div onClick={() => setActiveView('leads')} className="bg-white border border-zinc-200 p-10 rounded-[4rem] shadow-sm cursor-pointer hover:border-black hover:shadow-2xl transition-all group relative overflow-hidden">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Flux de Leads (24h)</p>
                  <p className={`${spaceGrotesk.className} text-6xl font-black text-black tracking-tighter`}>{leads.length}</p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="flex -space-x-4">
                      {leads.slice(0, 5).map((l, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white bg-zinc-100 overflow-hidden shadow-sm">
                          <img src={`https://ui-avatars.com/api/?name=${l.full_name}&background=random&color=000&bold=true`} alt="" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">+{leads.length > 5 ? leads.length - 5 : 0} nouveaux</span>
                  </div>
                </div>

                <div onClick={() => setActiveView('marketing')} className="bg-[#39FF14] p-10 rounded-[4rem] shadow-xl cursor-pointer hover:scale-[1.03] transition-all group relative overflow-hidden border border-[#32E612]">
                   <div className="absolute -bottom-10 -right-10 opacity-10 text-black group-hover:rotate-[-15deg] transition-all duration-700"><Megaphone size={180}/></div>
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 mb-4">Portée Marketing Blog</p>
                   <p className={`${spaceGrotesk.className} text-6xl font-black text-black tracking-tighter`}>8.405</p>
                   <div className="mt-6 flex items-center gap-2">
                      <div className="px-3 py-1 bg-black text-[#39FF14] rounded-full text-[10px] font-black uppercase">Live Analytics</div>
                   </div>
                </div>
              </div>

              {/* GRAPHIQUES ET MAP */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* HISTOGRAMME NÉON */}
                <div className="lg:col-span-2 bg-white border border-zinc-200 p-12 rounded-[4.5rem] shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-center mb-12">
                  <div className="flex items-center gap-5">
   {/* CHANGE BarChart2 par BarChart ci-dessous */}
   <div className="p-4 bg-zinc-100 rounded-[1.5rem] text-black"><BarChart size={24}/></div>
   <div>
      <h3 className="font-black uppercase text-base tracking-tighter text-black">Flux de Revenus Hebdomadaire</h3>
      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mars 2026 • Terminal Dakar</p>
   </div>
</div>
                    <div className="flex gap-3 bg-zinc-50 p-2 rounded-[1.5rem]">
                       <button className="px-6 py-2.5 bg-white border border-zinc-100 rounded-xl text-[11px] font-black uppercase text-zinc-400 shadow-sm">Semaine</button>
                       <button className="px-6 py-2.5 bg-black rounded-xl text-[11px] font-black uppercase text-[#39FF14] shadow-xl">Mois</button>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between h-72 gap-6 relative pt-10">
                    {/* Grille de fond */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] pt-14 pb-12">
                      {[1,2,3,4,5].map(line => <div key={line} className="border-t-2 border-black w-full"></div>)}
                    </div>
                    {histogramData.map((d, i) => (
                      <div key={i} className="relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer" onClick={() => setHistogramData(histogramData.map((data, idx) => ({ ...data, active: idx === i })))}>
                        <div className={`w-full max-w-[55px] rounded-[1.25rem] transition-all duration-700 relative z-10 ${d.active ? 'bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]' : 'bg-[#39FF14] hover:bg-black hover:scale-110 active:scale-95'}`} style={{ height: `${(d.ca / maxCa) * 100}%` }}>
                           {d.active && <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-[#39FF14] px-4 py-2 rounded-xl text-xs font-black shadow-2xl whitespace-nowrap animate-in slide-in-from-bottom-2">{d.ca.toLocaleString()} F</div>}
                        </div>
                        <span className={`mt-6 text-[11px] font-black uppercase tracking-tighter ${d.active ? 'text-black' : 'text-zinc-400'}`}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTIVITY MAP SENEGAL */}
                <div className="bg-zinc-900 p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden flex flex-col border border-zinc-800 group">
                  <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="p-3 bg-[#39FF14]/10 rounded-2xl"><MapPin className="text-[#39FF14]" size={22}/></div>
                    <h3 className="font-black uppercase text-base text-white tracking-tighter">Zones de Capture</h3>
                  </div>
                  <div className="flex-1 relative rounded-[3rem] overflow-hidden border border-zinc-800 bg-zinc-800/30">
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-10 absolute inset-0 text-[#39FF14] stroke-current group-hover:opacity-20 transition-all duration-700" fill="none" strokeWidth="0.8">
                      <path d="M20,30 Q40,20 60,40 T90,30 M15,50 Q40,60 60,50 T95,70 M10,80 Q50,95 70,70 T90,90" />
                      <circle cx="35" cy="35" r="1.5" fill="currentColor"/>
                      <circle cx="65" cy="55" r="1.5" fill="currentColor"/>
                      <circle cx="45" cy="75" r="1.5" fill="currentColor"/>
                    </svg>
                    {/* Points Live */}
                    <div className="absolute top-[35%] left-[35%] w-5 h-5 bg-[#39FF14] rounded-full shadow-[0_0_30px_#39FF14] animate-pulse"></div>
                    <div className="absolute top-[55%] left-[65%] w-4 h-4 bg-[#39FF14] rounded-full shadow-[0_0_20px_#39FF14] animate-ping"></div>
                    <div className="absolute top-[75%] left-[45%] w-3 h-3 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse"></div>
                    
                    <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-xl p-6 rounded-[2rem] border border-zinc-800/50 shadow-2xl transform group-hover:translate-y-[-5px] transition-transform">
                       <p className="text-[11px] font-black uppercase text-[#39FF14] mb-1 tracking-widest flex items-center gap-2"><Layers size={12}/> Focus : Dakar Plateaux</p>
                       <p className="text-[10px] font-bold text-zinc-500 uppercase leading-relaxed">Forte densité de conversion (82%) • Peak : 18h00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* LISTES DE DONNÉES DASHBOARD */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* DERNIERS MEMBRES CRM */}
                 <div className="bg-white border border-zinc-200 p-12 rounded-[4.5rem] shadow-sm group hover:shadow-xl transition-all">
                    <div className="flex justify-between items-center mb-10">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-zinc-100 rounded-[1.75rem] flex items-center justify-center text-black group-hover:bg-black group-hover:text-[#39FF14] transition-all"><TrendingUp size={28}/></div>
                          <div>
                            <h3 className="font-black uppercase text-base tracking-tighter">Nouveaux Membres CRM</h3>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Derniers enregistrements base</p>
                          </div>
                       </div>
                       <button onClick={() => setActiveView('crm')} className="text-[11px] font-black uppercase text-[#39FF14] bg-black px-6 py-3 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">Gérer le CRM</button>
                    </div>
                    <div className="space-y-5">
                       {contacts.filter(c => c.type === 'Client').slice(0, 4).map(c => (
                          <div key={c.id} className="flex justify-between items-center p-6 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 group/item hover:border-[#39FF14] hover:bg-white transition-all">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-black text-[#39FF14] flex items-center justify-center font-black text-sm shadow-lg">{c.full_name?.charAt(0)}</div>
                                <div>
                                   <p className="font-black text-sm uppercase text-black">{c.full_name}</p>
                                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{c.saas || 'Solution Active'}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4">
                                <span className="bg-[#39FF14]/10 text-black text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border border-[#39FF14]/20">Activé</span>
                                <button className="text-zinc-300 hover:text-black transition-colors"><ChevronDown size={18}/></button>
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 {/* ACTIONS IA INTELLIGENTES */}
                 <div className="bg-zinc-900 p-12 rounded-[4.5rem] shadow-2xl border border-zinc-800 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[#39FF14] pointer-events-none"><Sparkles size={120}/></div>
                    <div className="flex justify-between items-center mb-10 relative z-10">
                       <h3 className="font-black uppercase text-base text-white tracking-tighter flex items-center gap-4"><Sparkles className="text-[#39FF14] shadow-[0_0_10px_#39FF14]"/> Planificateur IA</h3>
                       <span className="text-[11px] font-black text-zinc-500 uppercase bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-700">{actionsIA.length} tâches actives</span>
                    </div>
                    <div className="space-y-4 relative z-10">
                       {actionsIA.slice(0, 4).map(action => (
                          <div key={action.id} className="bg-zinc-800/40 backdrop-blur-md p-6 rounded-[2.5rem] border border-zinc-800 flex flex-col md:flex-row justify-between md:items-center gap-6 group hover:bg-zinc-800 hover:border-zinc-700 transition-all">
                             <div>
                                <p className="text-[10px] font-black text-[#39FF14] uppercase mb-1.5 tracking-[0.2em] flex items-center gap-2">
                                   <div className={`w-1.5 h-1.5 rounded-full ${action.status === 'En attente' ? 'bg-[#39FF14]' : 'bg-yellow-400 animate-pulse'}`}></div>
                                   {action.module} • {action.date}
                                </p>
                                <p className="font-bold text-sm text-white uppercase tracking-tight">{action.title}</p>
                                <p className="text-[11px] text-zinc-500 mt-1.5 font-medium italic opacity-70">{action.desc}</p>
                             </div>
                             <div className="flex items-center gap-3">
                                {action.phone ? (
                                   <button onClick={() => executeWA(action.phone, action.msg, action.id)} className="bg-white text-black px-6 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase hover:bg-[#39FF14] transition-all shadow-xl active:scale-95">Exécuter WA</button>
                                ) : (
                                   <button className="bg-zinc-700 text-white px-6 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase hover:bg-zinc-600 transition-all border border-zinc-600">Détails</button>
                                )}
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* ================= VUE LEADS (FLUX RÉEL) ================= */}
          {activeView === 'leads' && (
             <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-8 bg-white p-10 rounded-[4rem] border border-zinc-200 shadow-sm">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-black rounded-[1.75rem] flex items-center justify-center text-[#39FF14] shadow-2xl animate-pulse"><MessageSquare size={32}/></div>
                      <div>
                         <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter`}>Flux de Leads</h2>
                         <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Capture en temps réel • Hub WhatsApp : 78 533 84 17</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="bg-zinc-50 border border-zinc-100 px-6 py-4 rounded-2xl flex items-center gap-3">
                         <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-ping"></span>
                         <span className="text-[11px] font-black uppercase text-zinc-500">Flux Connecté</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[4.5rem] overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Origine & Contact</th>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Intention / Produit</th>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Message Reçu</th>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Traitement</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                         {leads.map(l => (
                            <tr key={l.id} className="hover:bg-zinc-50/50 transition-all group">
                               <td className="p-8">
                                  <p className="font-black text-sm uppercase text-black">{l.full_name}</p>
                                  <p className="text-xs text-[#39FF14] font-black mt-1">{l.phone}</p>
                                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1 opacity-60">Source : {l.source || 'Site Web'}</p>
                               </td>
                               <td className="p-8">
                                  <div className="flex flex-col gap-2">
                                     <span className="bg-black text-[#39FF14] text-[10px] font-black px-3 py-1.5 rounded-xl uppercase inline-block shadow-lg w-max tracking-widest">{l.intent}</span>
                                     <p className="text-[10px] font-bold text-zinc-400 uppercase ml-2">{l.created_at ? new Date(l.created_at).toLocaleDateString() : todayStr}</p>
                                  </div>
                               </td>
                               <td className="p-8">
                                  <p className="text-xs text-zinc-600 font-medium italic max-w-xs leading-relaxed opacity-80">"{l.message}"</p>
                               </td>
                               <td className="p-8 text-right space-x-4">
                                  <button onClick={() => replyToLead(l)} className="bg-[#39FF14] text-black px-6 py-3.5 rounded-[1.25rem] text-[11px] font-black uppercase shadow-xl hover:bg-black hover:text-[#39FF14] transition-all active:scale-95 flex items-center justify-end gap-2 ml-auto">
                                     <Send size={16}/> Répondre
                                  </button>
                               </td>
                            </tr>
                         ))}
                         {leads.length === 0 && (
                            <tr><td colSpan={4} className="p-32 text-center text-zinc-300 font-black uppercase text-sm tracking-widest italic opacity-50">Aucun lead actif dans le flux pour le moment.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* ================= VUE CRM & MEMBRES ================= */}
          {activeView === 'crm' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 max-w-[1600px] mx-auto">
              {/* CARTES STATS CRM */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { id: 'all', label: 'Membres CRM', val: contacts.length, icon: Users, color: 'bg-white border-zinc-200' },
                    { id: 'new_clients', label: 'Clients Actifs', val: contacts.filter(c=>c.type==='Client').length, icon: CheckCircle, color: 'bg-black text-[#39FF14] shadow-2xl' },
                    { id: 'new_prospects', label: 'Prospects Froids', val: contacts.filter(c=>c.type==='Prospect').length, icon: Clock, color: 'bg-white border-zinc-200' },
                    { id: 'trials', label: 'Essais Onyx', val: 5, icon: Zap, color: 'bg-[#39FF14] text-black shadow-lg border-[#32E612]' },
                  ].map(card => (
                    <div 
                      key={card.id} 
                      onClick={() => setCrmCardFilter(crmCardFilter === card.id ? null : card.id)} 
                      className={`p-10 rounded-[3.5rem] border cursor-pointer hover:scale-[1.04] transition-all ${card.color} ${crmCardFilter === card.id ? 'ring-[6px] ring-[#39FF14]/30 scale-105' : ''}`}
                    >
                       <card.icon size={26} className="mb-6 opacity-80" />
                       <p className={`${spaceGrotesk.className} text-5xl font-black mb-1 tracking-tighter`}>{card.val}</p>
                       <p className="text-[11px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{card.label}</p>
                    </div>
                  ))}
              </div>

              {/* BARRE DE RECHERCHE CRM */}
              <div className="flex flex-col md:flex-row justify-between gap-8 items-center bg-white p-8 rounded-[4rem] border border-zinc-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#39FF14] opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-400 w-6 h-6 transition-all group-focus-within:text-[#39FF14]" />
                  <input 
                    type="text" 
                    placeholder="Filtrer par nom, téléphone, statut ou service..." 
                    value={crmSearch} 
                    onChange={(e) => setCrmSearch(e.target.value)} 
                    className="w-full pl-20 pr-8 py-5 bg-zinc-50 border-none rounded-[2rem] outline-none font-black text-sm text-black focus:ring-[6px] focus:ring-[#39FF14]/10 transition-all uppercase placeholder:text-zinc-300" 
                  />
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                   <select 
                     value={crmTypeFilter} 
                     onChange={(e) => setCrmTypeFilter(e.target.value)} 
                     className="px-8 py-5 bg-zinc-50 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.15em] outline-none border-none cursor-pointer appearance-none text-zinc-500 hover:text-black transition-colors"
                   >
                      <option value="Tous">Base Complète</option>
                      <option value="Client">Clients Officiels</option>
                      <option value="Prospect">Prospects Leads</option>
                   </select>
                   <button 
                     onClick={() => { setEditingContact({ full_name: '', phone: '', type: 'Prospect', saas: '' }); setShowContactModal(true); }} 
                     className="flex items-center justify-center gap-4 bg-[#39FF14] text-black px-12 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-black hover:text-[#39FF14] transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
                   >
                      <Plus size={20} /> Ajouter Nouveau
                   </button>
                </div>
              </div>

              {/* TABLEAU CRM */}
              <div className="bg-white border border-zinc-200 rounded-[5rem] overflow-hidden shadow-sm relative">
                <table className="w-full text-left">
                  <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                      <th className="p-10 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Identité & WhatsApp</th>
                      <th className="p-10 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Segment Terminal</th>
                      <th className="p-10 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Services Actifs</th>
                      <th className="p-10 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Contrôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filteredContacts.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50/50 transition-all group">
                        <td className="p-10">
                          <div className="flex items-center gap-6">
                             <div className="w-16 h-16 bg-zinc-100 rounded-[1.75rem] flex items-center justify-center font-black text-lg text-black group-hover:bg-black group-hover:text-[#39FF14] transition-all uppercase shadow-sm">{c.full_name?.charAt(0)}</div>
                             <div>
                                <p className="font-black text-base uppercase text-black tracking-tight">{c.full_name}</p>
                                <p className="text-xs text-[#39FF14] font-black mt-1">{c.phone}</p>
                             </div>
                          </div>
                        </td>
                        <td className="p-10">
                          <div className="flex flex-col gap-2">
                             <span className={`px-4 py-2 text-[10px] font-black uppercase rounded-2xl w-max tracking-widest ${c.type === 'Client' ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20' : 'bg-zinc-100 text-zinc-400'}`}>{c.type}</span>
                             <p className="text-[10px] font-bold text-zinc-300 mt-1 uppercase ml-2">{c.status || 'Non catégorisé'}</p>
                          </div>
                        </td>
                        <td className="p-10">
                           <div className="flex items-center gap-4">
                              <div className={`w-3 h-3 rounded-full ${c.saas ? 'bg-[#39FF14] shadow-[0_0_10px_#39FF14]' : 'bg-zinc-200'}`}></div>
                              <p className="font-black text-sm text-black uppercase tracking-tighter">{c.saas || 'À définir'}</p>
                           </div>
                        </td>
                        <td className="p-10 text-right space-x-4">
                          <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="p-4 text-zinc-300 hover:text-black hover:bg-zinc-100 rounded-2xl transition-all shadow-sm"><Edit3 size={20}/></button>
                          <button onClick={() => handleDeleteItem('clients', c.id)} className="p-4 text-zinc-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"><Trash2 size={20}/></button>
                        </td>
                      </tr>
                    ))}
                    {filteredContacts.length === 0 && (
                      <tr><td colSpan={4} className="p-32 text-center text-zinc-300 font-black uppercase text-sm tracking-[0.3em] opacity-50">Base CRM filtrée : Aucun résultat trouvé</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VUE FINANCES (FULL) ================= */}
          {activeView === 'finance' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-6 max-w-[1500px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[4.5rem] border border-zinc-200 shadow-sm gap-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-zinc-50 opacity-40 translate-x-20 -translate-y-20 rounded-full"></div>
                   <div className="flex items-center gap-8 relative z-10">
                      <div className="p-6 bg-black rounded-[2rem] text-[#39FF14] shadow-2xl shadow-[#39FF14]/10"><Wallet size={40}/></div>
                      <div>
                         <h2 className={`${spaceGrotesk.className} text-5xl font-black uppercase tracking-tighter`}>Hub Financier</h2>
                         <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Registre des Revenus & Commissions 2026</p>
                      </div>
                   </div>
                   <div className="flex gap-4 relative z-10">
                      <button onClick={() => alert("Génération registre PDF...")} className="bg-black text-[#39FF14] px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest flex items-center gap-3 hover:scale-105 transition-all shadow-2xl active:scale-95">
                         <Download size={18}/> Exporter Rapport
                      </button>
                   </div>
                </div>
                
                {/* GRID FINANCIÈRE */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                   {[
                      { label: 'Revenus Globaux', val: '4.850.000 F', color: 'bg-black text-[#39FF14]', icon: TrendingUp },
                      { label: 'MRR (Récurrent)', val: '1.200.000 F', color: 'bg-white text-black', icon: RefreshCcw },
                      { label: 'Commissions Dues', val: '450.000 F', color: 'bg-white text-black', icon: Handshake },
                      { label: 'Sorties Opé', val: '120.000 F', color: 'bg-red-50 text-red-600 border-red-100', icon: TrendingUp },
                   ].map((card, i) => (
                      <div key={i} className={`p-10 rounded-[3.5rem] shadow-sm flex flex-col justify-between h-56 border border-zinc-100 transition-all hover:translate-y-[-5px] ${card.color}`}>
                         <card.icon size={24} className="opacity-40" />
                         <div>
                            <p className="text-[11px] font-black uppercase tracking-widest opacity-60 mb-3">{card.label}</p>
                            <p className={`${spaceGrotesk.className} text-4xl font-black tracking-tighter`}>{card.val}</p>
                         </div>
                      </div>
                   ))}
                </div>

                {/* TABLEAU TRANSACTIONS */}
                <div className="bg-white border border-zinc-200 rounded-[5rem] p-12 shadow-sm">
                   <div className="flex flex-col md:flex-row gap-8 mb-12">
                      <div className="flex-1 relative">
                         <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-400 w-6 h-6" />
                         <input 
                           type="text" 
                           placeholder="Recherche transactionnelle : Client, Réf, Montant..." 
                           value={financeSearch} 
                           onChange={e => setFinanceSearch(e.target.value)} 
                           className="w-full pl-20 pr-8 py-5 bg-zinc-50 border-none rounded-[2rem] outline-none font-black text-sm uppercase transition-all focus:ring-[6px] focus:ring-[#39FF14]/5" 
                         />
                      </div>
                      <select value={financeTypeFilter} onChange={e => setFinanceTypeFilter(e.target.value)} className="px-8 py-5 bg-zinc-50 border-none rounded-[2rem] font-black text-[11px] uppercase tracking-widest cursor-pointer appearance-none text-zinc-500 hover:text-black">
                         <option value="Tous">Base Transactions</option>
                         <option value="Entrée">Entrées (+) </option>
                         <option value="Sortie">Sorties (-) </option>
                      </select>
                   </div>

                   <table className="w-full text-left">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Date & Référence</th>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Désignation</th>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Flux Monétaire</th>
                            <th className="p-8 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Statut Terminal</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                         {filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-zinc-50 transition-all group">
                               <td className="p-8">
                                  <p className="font-black text-sm text-black">{t.date}</p>
                                  <p className="text-[10px] font-black text-zinc-400 tracking-[0.15em] uppercase mt-1">{t.ref}</p>
                               </td>
                               <td className="p-8">
                                  <p className="font-black text-base uppercase text-black tracking-tighter">{t.client}</p>
                                  <p className="text-[11px] font-bold text-zinc-400 mt-1">{t.type}</p>
                               </td>
                               <td className="p-8">
                                  <div className={`flex items-center gap-3 font-black text-2xl tracking-tighter ${t.amount > 0 ? 'text-[#39FF14]' : 'text-red-500'}`}>
                                     {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} <span className="text-[10px] uppercase opacity-60">F CFA</span>
                                  </div>
                               </td>
                               <td className="p-8 text-right">
                                  <span className={`text-[10px] font-black uppercase px-5 py-2.5 rounded-2xl shadow-sm ${t.status === 'Payé' ? 'bg-[#39FF14]/10 text-black border border-[#39FF14]/20' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>{t.status}</span>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* ================= VUE ECOSYSTEME (9 SAAS) ================= */}
          {activeView === 'ecosystem' && (
             <div className="space-y-16 animate-in fade-in slide-in-from-right-6 max-w-[1500px] mx-auto pt-10">
                <div className="text-center space-y-6 max-w-4xl mx-auto">
                   <div className="inline-block px-4 py-1.5 bg-black text-[#39FF14] rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-2xl shadow-[#39FF14]/20">Terminal Écosystème</div>
                   <h2 className={`${spaceGrotesk.className} text-7xl font-black uppercase tracking-tighter text-black leading-none`}>Onyx <span className="text-[#39FF14]">Ecosystem</span></h2>
                   <p className="text-sm font-bold text-zinc-400 uppercase tracking-[0.4em] leading-relaxed">Déploiement & Gouvernance du Catalogue SaaS • 9 Solutions Prêtes</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                   {ECOSYSTEM_SAAS.map(saas => (
                      <div key={saas.id} className="bg-white border border-zinc-200 p-12 rounded-[5rem] shadow-sm hover:border-black hover:shadow-2xl transition-all group flex flex-col justify-between min-h-[420px] relative overflow-hidden">
                         <div className={`absolute top-0 right-0 w-48 h-48 ${saas.color} opacity-[0.03] translate-x-20 -translate-y-20 rounded-full group-hover:scale-150 transition-transform duration-1000`}></div>
                         <div className="relative z-10">
                            <div className={`w-20 h-20 rounded-[2.25rem] mb-10 flex items-center justify-center text-white shadow-2xl ${saas.color} group-hover:rotate-12 transition-transform duration-500`}><Box size={40}/></div>
                            <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter`}>{saas.name}</h3>
                            <p className="text-base font-bold text-zinc-400 mt-4 leading-relaxed group-hover:text-zinc-600 transition-colors">{saas.desc}</p>
                         </div>
                         <div className="mt-14 flex flex-col gap-4 relative z-10">
                            <button onClick={() => window.open(saas.url, '_blank')} className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.03] transition-all shadow-2xl flex items-center justify-center gap-3 group/btn active:scale-95">
                               Accéder à la Démo <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                            </button>
                            <button onClick={() => { setShowSaasLogin(saas); setSaasModalMode('create'); }} className="w-full bg-zinc-100 text-black py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95">Générer Accès Client</button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* ================= VUE AMBASSADEURS ================= */}
          {activeView === 'partners' && (
             <div className="space-y-12 animate-in fade-in max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-10 bg-white p-10 rounded-[4.5rem] border border-zinc-200 shadow-sm relative overflow-hidden">
                   <div className="flex items-center gap-8 relative z-10">
                      <div className="w-20 h-20 bg-black rounded-[2.25rem] flex items-center justify-center text-[#39FF14] shadow-2xl"><Handshake size={38}/></div>
                      <div>
                         <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter`}>Ambassadeurs Onyx</h2>
                         <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Génération de Revenus & Croissance Réseau</p>
                      </div>
                   </div>
                   <div className="bg-[#39FF14]/10 border border-[#39FF14]/20 px-8 py-5 rounded-[2rem] flex flex-col items-center">
                      <p className="text-[10px] font-black uppercase text-black tracking-widest opacity-60">Total Commissions</p>
                      <p className={`${spaceGrotesk.className} text-3xl font-black text-black`}>1.820.000 F</p>
                   </div>
                </div>

                {/* CANDIDATURES EN ATTENTE */}
                {partners.filter(p => p.status === 'En attente').length > 0 && (
                   <div className="bg-red-50 border-2 border-red-100 p-10 rounded-[4rem] animate-pulse">
                      <h3 className="font-black uppercase text-xs text-red-600 mb-6 flex items-center gap-3 tracking-[0.2em]"><AlertCircle size={18}/> Dossiers en attente de validation</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         {partners.filter(p => p.status === 'En attente').map(p => (
                            <div key={p.id} className="bg-white p-6 rounded-[2.25rem] flex justify-between items-center shadow-sm border border-red-100 group">
                               <div>
                                  <p className="font-black text-sm uppercase text-black">{p.full_name}</p>
                                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{p.contact} • {p.activity}</p>
                               </div>
                               <button onClick={() => approvePartner(p.id)} className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:scale-105 transition-all shadow-xl">Valider</button>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                <div className="bg-white border border-zinc-200 rounded-[5rem] overflow-hidden shadow-sm">
                   <table className="w-full text-left">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-10 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Ambassadeur & Contact</th>
                            <th className="p-10 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Secteur / Statut</th>
                            <th className="p-10 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Volume Ventes</th>
                            <th className="p-10 text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Contrôle</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                         {partners.filter(p => p.status !== 'En attente').map(p => (
                            <tr key={p.id} className="hover:bg-zinc-50 transition-all">
                               <td className="p-10">
                                  <p className="font-black text-base uppercase text-black tracking-tighter">{p.full_name}</p>
                                  <p className="text-xs text-[#39FF14] font-black mt-1">{p.contact}</p>
                               </td>
                               <td className="p-10">
                                  <div className="flex flex-col gap-2">
                                     <span className="bg-zinc-100 text-black px-4 py-1.5 rounded-xl text-[10px] font-black uppercase w-max tracking-widest">{p.activity}</span>
                                     <p className="text-[10px] font-black text-[#39FF14] uppercase ml-2">{p.status}</p>
                                  </div>
                               </td>
                               <td className="p-10 text-center">
                                  <p className={`${spaceGrotesk.className} text-4xl font-black text-black tracking-tighter`}>{p.sales || 0}</p>
                                  <p className="text-[10px] font-bold text-zinc-300 uppercase mt-1">Ventes Clôturées</p>
                               </td>
                               <td className="p-10 text-right">
                                  <button onClick={() => { setSelectedPartner(p); setShowPartnerModal(true); }} className="bg-black text-white px-8 py-4 rounded-[1.5rem] text-[11px] font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-all shadow-xl active:scale-95">Console Détails</button>
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* ================= VUE MARKETING ================= */}
          {activeView === 'marketing' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-6 max-w-[1200px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center bg-white p-10 rounded-[4.5rem] border border-zinc-200 shadow-sm relative overflow-hidden group">
                   <div className="flex items-center gap-8 relative z-10">
                      <div className="w-20 h-20 bg-black rounded-[2.25rem] flex items-center justify-center text-[#39FF14] shadow-2xl group-hover:rotate-12 transition-all"><Megaphone size={36}/></div>
                      <div>
                         <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter`}>Hub Marketing</h2>
                         <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Articles de Blog & Stratégies de Capture IA</p>
                      </div>
                   </div>
                   <button onClick={runIAArticleSuggestion} className="bg-black text-[#39FF14] px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-all relative z-10">
                      <Sparkles size={18}/> Suggestion IA Article
                   </button>
                </div>

                <div className="space-y-8">
                   {marketingArticles.map(article => (
                      <div key={article.id} className="bg-white p-12 rounded-[5rem] border border-zinc-200 shadow-sm flex flex-col lg:flex-row justify-between items-center gap-10 hover:border-black transition-all group">
                         <div className="flex-1">
                            <div className="flex gap-4 mb-6">
                               <span className="bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{article.category || 'Stratégie'}</span>
                               <span className="bg-zinc-100 text-zinc-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">Cible : {article.cible || 'Tous'}</span>
                            </div>
                            <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter mb-4 group-hover:text-[#39FF14] transition-colors`}>{article.title}</h3>
                            <p className="text-zinc-500 font-medium text-base leading-relaxed max-w-2xl opacity-80">{article.desc}</p>
                         </div>
                         <div className="flex flex-col gap-4 w-full lg:w-max">
                            <button onClick={() => { setShowDiffusionModal(article); setSelectedContactsForDiffusion([]); }} className="bg-[#39FF14] text-black px-10 py-5 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-black hover:text-[#39FF14] transition-all shadow-xl flex items-center justify-center gap-3 active:scale-95">
                               <Send size={18}/> Diffuser Segment
                            </button>
                            <button onClick={() => handleDeleteItem('articles', article.id)} className="bg-zinc-50 text-red-500 py-4 rounded-[2rem] text-[10px] font-black uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2">
                               <Trash2 size={16}/> Supprimer l'article
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

        </div>
      </main>

      {/* ================= MODALES TERMINAL ================= */}

      {/* MODALE SAAS: ACTIVATION & WhatsApp */}
      {showSaasLogin && saasModalMode === 'create' && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowSaasLogin)} className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500">
            <div className="bg-white p-16 rounded-[5.5rem] max-w-xl w-full relative shadow-[0_0_120px_rgba(57,255,20,0.15)] animate-in zoom-in-95 duration-500 border-t-[12px] border-[#39FF14]">
               <button onClick={() => setShowSaasLogin(null)} className="absolute top-12 right-12 p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all active:scale-90"><X size={26}/></button>
               
               <div className="text-center mb-14">
                  <div className={`w-24 h-24 rounded-[2.75rem] flex items-center justify-center text-white ${showSaasLogin?.color} shadow-2xl mx-auto mb-8 animate-bounce-slow`}><Box size={48}/></div>
                  <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase text-black tracking-tighter leading-none`}>Activer {showSaasLogin?.name}</h2>
                  <p className="text-xs font-bold text-zinc-400 mt-3 uppercase tracking-[0.3em]">Générateur d'Accès Terminal SaaS</p>
               </div>
               
               <div className="space-y-10">
                  <div className="flex gap-4 p-2 bg-zinc-100 rounded-[2.25rem]">
                     <button onClick={() => setSaasCreateType('prospect')} className={`flex-1 py-4 text-[11px] font-black uppercase rounded-[1.75rem] transition-all ${saasCreateType === 'prospect' ? 'bg-black text-[#39FF14] shadow-2xl' : 'text-zinc-400'}`}>Sélection CRM</button>
                     <button onClick={() => setSaasCreateType('manual')} className={`flex-1 py-4 text-[11px] font-black uppercase rounded-[1.75rem] transition-all ${saasCreateType === 'manual' ? 'bg-black text-[#39FF14] shadow-2xl' : 'text-zinc-400'}`}>Saisie Manuelle</button>
                  </div>

                  {saasCreateType === 'prospect' ? (
                     <div className="space-y-3">
                        <label className="text-[11px] font-black uppercase text-zinc-400 ml-6 tracking-widest">Prospect Identifié</label>
                        <select value={saasCreateForm.prospectId} onChange={e => setSaasCreateForm({...saasCreateForm, prospectId: e.target.value})} className="w-full p-6 bg-zinc-50 border-none rounded-[2.25rem] font-black text-sm uppercase outline-none focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all appearance-none cursor-pointer">
                           <option value="">-- Sélectionner un Prospect --</option>
                           {contacts.filter(c => c.type === 'Prospect').map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
                        </select>
                     </div>
                  ) : (
                     <div className="space-y-5">
                        <input type="text" placeholder="NOM COMPLET CLIENT" value={saasCreateForm.name} onChange={e => setSaasCreateForm({...saasCreateForm, name: e.target.value})} className="w-full p-6 bg-zinc-50 border-none rounded-[2.25rem] font-black text-sm uppercase outline-none focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all" />
                        <input type="tel" placeholder="NUMÉRO WHATSAPP (EX: 22177...)" value={saasCreateForm.phone} onChange={e => setSaasCreateForm({...saasCreateForm, phone: e.target.value})} className="w-full p-6 bg-zinc-50 border-none rounded-[2.25rem] font-black text-sm outline-none focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all" />
                     </div>
                  )}

                  <div className="relative group">
                     <Lock size={20} className="absolute left-8 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#39FF14] transition-colors" />
                     <input type="text" placeholder="MOT DE PASSE D'ACCÈS" value={saasCreateForm.password} onChange={e => setSaasCreateForm({...saasCreateForm, password: e.target.value})} className="w-full pl-20 pr-8 py-6 bg-zinc-50 border-none rounded-[2.25rem] font-black text-sm outline-none focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all tracking-[0.1em]" />
                  </div>

                  <button onClick={handleCreateSaasAccount} className="w-full bg-[#39FF14] text-black py-7 rounded-[2.5rem] font-black uppercase text-sm shadow-[0_30px_60px_-15px_rgba(57,255,20,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group">
                     <UserPlus size={24} className="group-hover:rotate-12 transition-transform"/> Activer & Notifier Client (WhatsApp)
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* MODALE CRM EDIT / NEW */}
      {showContactModal && editingContact && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowContactModal)} className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white p-16 rounded-[5.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 duration-500 border-t-[12px] border-black">
            <button onClick={() => setShowContactModal(false)} className="absolute top-12 right-12 p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all active:scale-90"><X size={24}/></button>
            
            <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter mb-14 text-black`}>{editingContact?.id ? 'Modifier Fiche' : 'Nouveau Membre CRM'}</h2>
            
            <form onSubmit={handleSaveContact} className="space-y-8">
              <div className="space-y-2">
                 <label className="text-[11px] font-black uppercase text-zinc-400 ml-6 tracking-widest">Désignation Membre</label>
                 <input type="text" required value={editingContact?.full_name || ""} onChange={e => setEditingContact({...editingContact, full_name: e.target.value})} className="w-full p-6 bg-zinc-50 border-none rounded-[2.25rem] font-black text-sm uppercase outline-none focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="NOM COMPLET / ENTREPRISE" />
              </div>
              
              <div className="space-y-2">
                 <label className="text-[11px] font-black uppercase text-zinc-400 ml-6 tracking-widest">Terminal Mobile (WhatsApp)</label>
                 <input type="tel" required value={editingContact?.phone || ""} onChange={e => setEditingContact({...editingContact, phone: e.target.value})} className="w-full p-6 bg-zinc-50 border-none rounded-[2.25rem] font-black text-sm outline-none focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="+221 ..." />
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 ml-6 tracking-widest">Catégorie</label>
                    <select value={editingContact?.type || 'Prospect'} onChange={e => setEditingContact({...editingContact, type: e.target.value})} className="w-full p-6 bg-zinc-50 border-none rounded-[2.25rem] font-black text-xs uppercase outline-none cursor-pointer appearance-none transition-all focus:ring-[8px] focus:ring-[#39FF14]/10">
                      <option value="Prospect">Prospect Lead</option>
                      <option value="Client">Client Actif</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 ml-6 tracking-widest">Logiciel Déployé</label>
                    <select value={editingContact?.saas || ""} onChange={e => setEditingContact({...editingContact, saas: e.target.value})} className="w-full p-6 bg-zinc-50 border-none rounded-[2.25rem] font-black text-xs uppercase outline-none cursor-pointer appearance-none transition-all focus:ring-[8px] focus:ring-[#39FF14]/10">
                      <option value="" disabled>Choisir un SaaS</option>
                      <option value="À définir">À définir</option>
                      {ECOSYSTEM_SAAS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[11px] font-black uppercase text-zinc-400 ml-6 tracking-widest">Notes de Suivi</label>
                 <input type="text" value={editingContact?.status || ''} onChange={e => setEditingContact({...editingContact, status: e.target.value})} className="w-full p-6 bg-zinc-50 border-none rounded-[2.25rem] font-black text-sm uppercase outline-none focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all" placeholder="EX: EN TEST JUSQU'AU 15/03" />
              </div>

              <button type="submit" className="w-full bg-black text-[#39FF14] py-7 rounded-[2.5rem] font-black uppercase text-sm mt-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-4 active:scale-95">
                <CheckCircle size={24} className="text-[#39FF14]"/> Synchroniser la base CRM
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DIFFUSION MARKETING */}
      {showDiffusionModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowDiffusionModal)} className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white p-16 rounded-[5.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col border-t-[12px] border-[#39FF14]">
              <button onClick={() => setShowDiffusionModal(null)} className="absolute top-10 right-10 p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all active:scale-90"><X size={24}/></button>
              <div className="mb-10">
                 <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter`}>Planifier la Diffusion</h2>
                 <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-2 italic">"{showDiffusionModal?.title}"</p>
              </div>

              <div className="flex-1 overflow-y-auto mb-10 pr-4 space-y-4 custom-scrollbar">
                 <div className="flex justify-between items-center mb-6 pb-4 border-b border-zinc-100 sticky top-0 bg-white z-10">
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">SÉLECTION DES DESTINATAIRES</p>
                    <button onClick={() => setSelectedContactsForDiffusion(contacts.map(c=>c.id))} className="text-[10px] font-black uppercase text-[#39FF14] bg-black px-4 py-2 rounded-xl shadow-lg">Tout Sélectionner</button>
                 </div>
                 <div className="grid grid-cols-1 gap-3">
                    {contacts.map(c => (
                       <label key={c.id} className={`flex items-center gap-5 p-5 rounded-[1.75rem] border cursor-pointer transition-all ${selectedContactsForDiffusion.includes(c.id) ? 'bg-[#39FF14]/5 border-[#39FF14] shadow-md shadow-[#39FF14]/5' : 'bg-zinc-50 border-zinc-100 hover:border-black'}`}>
                          <input 
                            type="checkbox" 
                            checked={selectedContactsForDiffusion.includes(c.id)} 
                            onChange={() => {
                               if(selectedContactsForDiffusion.includes(c.id)) setSelectedContactsForDiffusion(selectedContactsForDiffusion.filter(id => id !== c.id));
                               else setSelectedContactsForDiffusion([...selectedContactsForDiffusion, c.id]);
                            }} 
                            className="w-6 h-6 accent-black rounded-lg" 
                          />
                          <div className="flex-1">
                             <p className="font-black text-sm uppercase text-black tracking-tighter">{c.full_name}</p>
                             <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{c.phone} • {c.type}</p>
                          </div>
                       </label>
                    ))}
                 </div>
              </div>

              <button onClick={scheduleMarketingDiffusion} className="w-full bg-black text-[#39FF14] py-7 rounded-[2.25rem] font-black uppercase text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
                 <Zap size={22}/> Lancer la Campagne ({selectedContactsForDiffusion.length} membres)
              </button>
           </div>
        </div>
      )}

      {/* MODALE DÉTAILS PARTENAIRE */}
      {showPartnerModal && selectedPartner && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowPartnerModal)} className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="bg-white p-16 rounded-[5.5rem] max-w-3xl w-full relative shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto border-t-[12px] border-black">
               <button onClick={() => setShowPartnerModal(false)} className="absolute top-10 right-10 p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all"><X size={24}/></button>
               
               <div className="mb-14 text-center">
                  <div className="w-24 h-24 bg-zinc-100 rounded-[2.75rem] mx-auto mb-8 flex items-center justify-center font-black text-3xl shadow-xl">{selectedPartner?.full_name?.charAt(0)}</div>
                  <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase text-black tracking-tighter leading-none`}>{selectedPartner?.full_name}</h2>
                  <p className="text-xs font-bold text-[#39FF14] bg-black px-4 py-1.5 rounded-full inline-block mt-4 uppercase tracking-[0.3em] shadow-lg">Console Ambassadeur Officiel</p>
               </div>

               <div className="grid grid-cols-2 gap-8 mb-14">
                  <div className="bg-zinc-50 p-10 rounded-[3rem] border border-zinc-100 flex flex-col items-center">
                     <p className="text-[11px] font-black uppercase text-zinc-400 tracking-widest mb-3">Ventes Actives</p>
                     <p className={`${spaceGrotesk.className} text-6xl font-black text-black tracking-tighter`}>{selectedPartner?.sales || 0}</p>
                  </div>
                  <div className="bg-[#39FF14]/5 p-10 rounded-[3rem] border border-[#39FF14]/10 flex flex-col items-center">
                     <p className="text-[11px] font-black uppercase text-zinc-400 tracking-widest mb-3">Gains (Commissions)</p>
                     <p className={`${spaceGrotesk.className} text-5xl font-black text-black tracking-tighter`}>{selectedPartner?.revenue || '0 F'}</p>
                  </div>
               </div>

               <div className="space-y-4">
                  <button onClick={() => alert("Edition partenaire...")} className="w-full bg-black text-white py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest shadow-xl hover:bg-[#39FF14] hover:text-black transition-all active:scale-95 flex items-center justify-center gap-4">
                     <Edit3 size={18}/> Modifier les informations
                  </button>
                  <button onClick={handleConvertPartnerToClient} className="w-full bg-zinc-100 text-black py-6 rounded-[2rem] font-black uppercase text-[11px] tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-4 active:scale-95">
                     <UserPlus size={18}/> Enregistrer en tant que Client
                  </button>
                  <button onClick={() => handleDeleteItem('partners', selectedPartner.id)} className="w-full text-red-500 font-black uppercase text-[10px] tracking-widest pt-4 opacity-50 hover:opacity-100 transition-opacity">Révoquer le statut Ambassadeur</button>
               </div>
            </div>
         </div>
      )}

      {/* MODALE PROFIL TERMINAL */}
      {showProfileModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowProfileModal)} className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white p-16 rounded-[5.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in-95 text-center border-t-[12px] border-[#39FF14]">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-10 right-10 p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={24}/></button>
            
            <div className="relative w-40 h-40 mx-auto mb-10">
               <img src={tempAdminProfile?.avatar} className="w-full h-full rounded-full object-cover border-[6px] border-black p-1.5 shadow-2xl" alt="" />
               <div className="absolute bottom-2 right-2 bg-[#39FF14] p-3 rounded-full border-[6px] border-white shadow-2xl shadow-[#39FF14]/50 group cursor-pointer hover:scale-110 transition-transform"><Edit3 size={18} className="text-black"/></div>
            </div>
            
            <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter leading-none`}>Admin Profile</h2>
            <p className="text-[11px] font-bold text-zinc-400 mb-12 uppercase tracking-[0.3em]">Console Maître Dakar Hub</p>

            <div className="space-y-6 text-left">
               <div className="space-y-2 ml-6">
                  <label className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">Identifiant Terminal</label>
                  <input type="text" value={tempAdminProfile?.name || ""} onChange={e => setTempAdminProfile({...tempAdminProfile, name: e.target.value})} className="w-full p-5 bg-zinc-50 border-none rounded-[2rem] font-black text-sm uppercase outline-none focus:ring-4 focus:ring-[#39FF14]/10 transition-all" />
               </div>
               
               <button onClick={saveAdminProfile} className="w-full bg-black text-[#39FF14] py-6 rounded-[2.25rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] hover:scale-[1.03] transition-all active:scale-95 mb-10">
                  Sauvegarder les Changements
               </button>
               
               <div className="pt-10 border-t border-zinc-100 space-y-6">
                  <button onClick={() => { alert('Session terminée.'); window.location.href='/'; }} className="w-full flex items-center justify-center gap-4 text-red-500 py-4 bg-red-50 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-sm">
                     <LogOut size={18}/> Quitter le Terminal
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE RAPPORT IA (SCAN INTELLIGENCE) */}
      {showRapportIA && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowRapportIA)} className="fixed inset-0 z-[100] flex items-center justify-center p-10 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500">
            <div className="bg-white p-16 rounded-[6rem] max-w-2xl w-full relative shadow-[0_0_150px_rgba(57,255,20,0.2)] animate-in zoom-in-95 duration-700 border-t-[14px] border-[#39FF14]">
               <button onClick={() => setShowRapportIA(false)} className="absolute top-12 right-12 p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all active:scale-90"><X size={24}/></button>
               
               <div className="flex items-center gap-6 mb-14">
                  <div className="w-20 h-20 bg-black rounded-[2.5rem] flex items-center justify-center text-[#39FF14] shadow-2xl"><Sparkles size={38} className="animate-pulse"/></div>
                  <div>
                     <h3 className={`${spaceGrotesk.className} text-4xl font-black uppercase text-black tracking-tighter leading-none`}>Scan IA CRM</h3>
                     <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Analyse Prédictive des Opportunités</p>
                  </div>
               </div>

               <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
                  {contacts.filter(c => c.type === 'Prospect').slice(0, 3).map((c, i) => (
                    <div key={i} className="p-8 bg-zinc-50 rounded-[3rem] border border-zinc-100 flex flex-col md:flex-row justify-between items-center group hover:border-[#39FF14] hover:bg-white transition-all gap-8">
                       <div className="flex-1">
                          <p className="font-black text-xl uppercase text-black tracking-tighter leading-none mb-2">{c.full_name}</p>
                          <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">Score de Conversion : <span className="text-[#39FF14]">85%</span></p>
                          <p className="text-[11px] text-zinc-500 mt-4 leading-relaxed italic opacity-80">"L'IA suggère de proposer le Pack Trio basé sur l'activité de ce prospect et ses récents clics sur le blog."</p>
                       </div>
                       <button onClick={() => planifyCrmAction(`Conversion : ${c.full_name}`, "Démonstration Pack Trio à domicile.", c.phone, `Bonjour ${c.full_name}, nous avons une offre spéciale Trio...`)} className="bg-black text-[#39FF14] px-8 py-4 rounded-[2rem] text-[11px] font-black uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all w-full md:w-max">Planifier Conversion</button>
                    </div>
                  ))}
               </div>

               <div className="mt-14 pt-10 border-t border-zinc-100 text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.3em]">Algorithme Onyx-Scan v2.4 (Mars 2026)</p>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
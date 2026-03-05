"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Space_Grotesk, Inter } from "next/font/google";
import { createClient } from "@supabase/supabase-js";
import { 
  LayoutDashboard, Users, Box, Wallet, Handshake, Megaphone, 
  Search, Plus, CheckCircle, Clock, AlertCircle, X, Sparkles, 
  ExternalLink, MessageSquare, LogIn, Send, Download, Edit3, UserPlus,
  BarChart, MapPin, Lock, ChevronDown, Trash2, 
  RefreshCcw, Activity, TrendingUp, Layers, ArrowUpRight,
  Bell, LogOut, Zap
} from "lucide-react";

// --- CONFIGURATION SUPABASE SÉCURISÉE POUR LE BUILD ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

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
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [showSaasLogin, setShowSaasLogin] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [showDiffusionModal, setShowDiffusionModal] = useState<any>(null);
  const [saasModalMode, setSaasModalMode] = useState<'login' | 'create'>('login');
  const [saasCreateType, setSaasCreateType] = useState<'prospect' | 'manual'>('prospect');
  const [saasCreateForm, setSaasCreateForm] = useState({ prospectId: '', name: '', phone: '', password: '' });
  
  // --- DATA STATES ---
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editingContact, setEditingContact] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isEditingPartner, setIsEditingPartner] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [editPartnerForm, setEditPartnerForm] = useState<any>(null);
  const [selectedContactsForDiffusion, setSelectedContactsForDiffusion] = useState<string[]>([]);

  const [adminProfile, setAdminProfile] = useState({ 
    name: 'Onyx Administrator', 
    avatar: 'https://ui-avatars.com/api/?name=Admin&background=000&color=39FF14&bold=true' 
  });
  const [tempAdminProfile, setTempAdminProfile] = useState({ ...adminProfile });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [contacts, setContacts] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [leads, setLeads] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [partners, setPartners] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [marketingArticles, setMarketingArticles] = useState<any[]>([]);
  const [actionsIA, setActionsIA] = useState<IAAction[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [transactions, setTransactions] = useState<any[]>([]);

  const [actionTabFilter, setActionTabFilter] = useState<'All' | 'IA' | 'Marketing'>('All');
  const [actionSearchFilter, setActionSearchFilter] = useState("");
  const [crmSearch, setCrmSearch] = useState("");
  const [crmTypeFilter, setCrmTypeFilter] = useState("Tous");
  const [crmCardFilter, setCrmCardFilter] = useState<string | null>(null);
  const [partnerSearch, setPartnerSearch] = useState("");
  const [financeSearch, setFinanceSearch] = useState("");
  const [financeTypeFilter, setFinanceTypeFilter] = useState("Tous");
  const [financeCardFilter, setFinanceCardFilter] = useState<string | null>(null);

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

  const fetchSupabaseData = async () => {
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

    setActionsIA([
       { id: 'a1', module: 'CRM', title: 'Relance Essai - Boutique Fatou', desc: 'Essai Onyx Vente expire demain.', date: currentDate, status: 'En attente', phone: '221769876543', msg: 'Bonjour Boutique Fatou, votre essai Onyx Vente expire demain. Souhaitez-vous le prolonger ?' },
       { id: 'a2', module: 'Partenaires', title: 'Booster Moussa D.', desc: 'Aucune vente depuis 15 jours. Lui envoyer le script.', date: currentDate, status: 'En attente', phone: '221770000000', msg: 'Salut Moussa, voici un nouveau script de vente qui marche très bien en ce moment pour vendre le Pack Trio.' },
       { id: 'a3', module: 'Marketing', title: 'Newsletter : L\'ère du Digital', desc: 'Diffusion automatique programmée pour les prospects Restauration.', date: 'Demain', status: 'En attente' },
       { id: 'a4', module: 'SaaS', title: 'Maintenance Stock', desc: 'Optimisation de la base de données pour Onyx Stock.', date: 'Ce soir', status: 'En cours' },
       { id: 'a5', module: 'CRM', title: 'Féliciter Nouveaux Clients', desc: 'Message de bienvenue pour les conversions du jour.', date: currentDate, status: 'Réalisé' }
    ]);

    setTransactions([
      { id: 'tr1', date: currentDate, client: 'Boutique Fatou', amount: 17500, type: 'Abonnement Trio', status: 'Payé', ref: 'WAVE-10293' },
      { id: 'tr2', date: 'Hier', client: 'Resto Dakar', amount: 30000, type: 'Pack Full', status: 'En attente', ref: 'OM-99212' },
      { id: 'tr3', date: '01 Mar 2026', client: 'Cheikh N.', amount: -45000, type: 'Commission Ambassadeur', status: 'Versé', ref: 'PAY-4412' },
      { id: 'tr4', date: '02 Mar 2026', client: 'Auto-Ecole Plus', amount: 50000, type: 'Pack Full', status: 'Payé', ref: 'WAVE-8821' },
      { id: 'tr5', date: '03 Mar 2026', client: 'Boutique Z', amount: 10000, type: 'Onyx Vente', status: 'Payé', ref: 'OM-1102' },
      { id: 'tr6', date: '04 Mar 2026', client: 'Fatou Diop', amount: 8900, type: 'Formation Onyx', status: 'Payé', ref: 'WAVE-7721' },
      { id: 'tr7', date: '04 Mar 2026', client: 'Alioune S.', amount: 15000, type: 'Onyx Tiak Pro', status: 'Payé', ref: 'WAVE-6651' },
      { id: 'tr8', date: '05 Mar 2026', client: 'Maison de la Beauté', amount: -15000, type: 'Remboursement', status: 'Versé', ref: 'REFUND-001' },
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

  const triggerFilterAnimation = (filterValue: string) => {
    setGlobalFilterDate(filterValue);
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleOutsideClick = (setter: any, secondaryAction?: () => void) => (e: any) => {
    if (e.target.id === "modal-overlay") { setter(false); if(secondaryAction) secondaryAction(); }
  };

  const executeWA = (phone: string | undefined, msg: string | undefined, idIA?: string) => {
    if(phone && msg) window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    if (idIA) setActionsIA(prev => prev.map(a => a.id === idIA ? { ...a, status: 'Réalisé' } : a));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    if (!supabase) return; 
    if(!confirm("⚠️ Attention : Suppression irréversible. Confirmer ?")) return;
    const { error } = await supabase.from(table).delete().eq('id', id);
    if(error) alert("Erreur terminal : " + error.message);
    else fetchSupabaseData();
  };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return; 
    const payload = { ...editingContact };
    const isNew = !payload.id;
    if (isNew) delete payload.id;
    
    const { error } = await supabase.from('clients').upsert(payload);
    if (error) { alert(`Erreur base de données : ${error.message}`); return; }
    fetchSupabaseData();
    setShowContactModal(false);
  };

  const approvePartner = async (id: string) => {
    if (!supabase) return; 
    const { error } = await supabase.from('partners').update({ status: 'Actif' }).eq('id', id);
    if (error) alert("Erreur terminal : " + error.message);
    else fetchSupabaseData();
  };

  const handleSavePartner = async () => {
     if(!editPartnerForm || !supabase) return;
     const { error } = await supabase.from('partners').update(editPartnerForm).eq('id', editPartnerForm.id);
     if (error) alert("Erreur terminal : " + error.message);
     else { fetchSupabaseData(); setIsEditingPartner(false); setShowPartnerModal(false); }
  };

  const handleConvertPartnerToClient = async () => {
      if(!selectedPartner || !supabase) return;
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
     if (!supabase) return; 
     if (saasCreateType === 'manual' && (!saasCreateForm.name || !saasCreateForm.phone || !saasCreateForm.password)) return alert("Veuillez remplir tous les champs.");
     
     let targetPhone = saasCreateForm.phone;
     let targetName = saasCreateForm.name;
     if (saasCreateType === 'prospect') {
        const p = contacts.find(c => c.id === saasCreateForm.prospectId);
        if(p) { targetPhone = p.phone; targetName = p.full_name; }
     }
     
     const msg = `Félicitations ${targetName} ! Votre espace ${showSaasLogin.name} est actif.\nLien : https://${showSaasLogin.id}.onyxops.com\nIdentifiant : ${targetPhone}\nMot de passe : ${saasCreateForm.password}`;
     
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
     alert("Profil synchronisé avec succès dans le terminal !");
     setShowProfileModal(false);
  };

  const runIAArticleSuggestion = () => {
      const newArt = { id: Date.now().toString(), title: 'BOOSTER SES VENTES WHATSAPP AVEC L\'IA', desc: 'Scripts de vente générés par IA pour augmenter vos taux de conversion en Afrique francophone.', category: 'Stratégie', cible: 'Tous' };
      setMarketingArticles([newArt, ...marketingArticles]);
      alert("Intelligence Artificielle : Nouvel article suggéré et ajouté au pipeline.");
  };

  const scheduleMarketingDiffusion = () => {
      if(selectedContactsForDiffusion.length === 0) return alert("Sélectionnez au moins un contact pour la diffusion.");
      const newAction: IAAction = { id: Date.now().toString(), module: 'Marketing', title: `Diffusion : ${showDiffusionModal?.title}`, desc: `Envoi programmé à ${selectedContactsForDiffusion.length} contacts via le canal WhatsApp.`, date: todayStr, status: 'En attente' };
      setActionsIA([newAction, ...actionsIA]);
      setShowDiffusionModal(null);
      alert(`Diffusion planifiée avec succès pour ${selectedContactsForDiffusion.length} membres.`);
  };

  const filteredContacts = (contacts || []).filter(c => {
    if (crmTypeFilter !== 'Tous' && c.type !== crmTypeFilter) return false;
    const search = crmSearch.toLowerCase();
    if (search && !c.full_name?.toLowerCase().includes(search) && !c.phone?.includes(search)) return false;
    if (crmCardFilter === 'new_clients' && c.type !== 'Client') return false;
    if (crmCardFilter === 'new_prospects' && c.type !== 'Prospect') return false;
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

  return (
    <div className={`flex h-screen bg-[#fafafa] ${inter.className} text-black overflow-hidden relative selection:bg-[#39FF14]/30`}>
      
      {/* ================= SIDEBAR GAUCHE ================= */}
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
        
        <div className="flex-1 overflow-y-auto px-6 space-y-10 custom-scrollbar">
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
           <div className="bg-black rounded-2xl p-4 flex items-center gap-4 border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-[#39FF14]/10 rounded-xl flex items-center justify-center text-[#39FF14]"><Activity size={20}/></div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Status Serveur</p>
                 <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1">Dakar Hub : Optimisé</p>
              </div>
           </div>
        </div>
      </aside>

      {/* ================= MAIN AREA (Zone Principale) ================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#fafafa] relative">
        
        {/* HEADER GÉANT */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-zinc-200 h-28 flex items-center justify-between px-8 lg:px-12 shrink-0 z-20">
          <div className="flex flex-col">
            <h2 className={`${spaceGrotesk.className} text-3xl lg:text-4xl font-black uppercase tracking-tighter text-black`}>
               {activeView === 'dashboard' ? 'Terminal Central' : activeView.replace('-', ' ')}
            </h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{todayStr}</span>
               <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
               <span className="text-[10px] font-black text-[#39FF14] uppercase bg-black px-2 py-0.5 rounded-md">Live Session</span>
            </div>
          </div>
          
          <div className="flex items-center gap-6 lg:gap-10">
            <div className="hidden lg:flex items-center gap-8 pr-10 border-r border-zinc-200">
               <button onClick={fetchSupabaseData} className={`text-zinc-400 hover:text-black transition-all ${isRefreshing ? 'animate-spin text-[#39FF14]' : ''}`} title="Rafraîchir les données">
                  <RefreshCcw size={22}/>
               </button>
               <div className="relative cursor-pointer group" title="Notifications">
                  <Bell size={22} className="text-zinc-400 group-hover:text-black transition-colors"/>
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">3</span>
               </div>
            </div>
            
            <div onClick={() => setShowProfileModal(true)} className="flex items-center gap-5 bg-white border border-zinc-200 p-2.5 pr-8 rounded-full cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1 group active:scale-95">
              <div className="relative">
                <img src={adminProfile?.avatar} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md ring-2 ring-zinc-50" alt="Admin" />
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-[#39FF14] border-[3px] border-white rounded-full"></div>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-black uppercase leading-none text-black group-hover:text-[#39FF14] transition-colors">{adminProfile?.name}</p>
                <p className="text-[10px] font-bold text-zinc-400 uppercase mt-1 tracking-widest">Contrôleur Onyx</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU DYNAMIQUE SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth custom-scrollbar">
          
          {/* ================= VUE DASHBOARD ================= */}
          {activeView === 'dashboard' && (
            <div className={`space-y-12 max-w-[1600px] mx-auto transition-all duration-700 ${isRefreshing ? 'opacity-30 scale-[0.98] grayscale' : 'opacity-100 scale-100 grayscale-0'}`}>
              
              {/* STATS PRINCIPALES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div onClick={() => setActiveView('finance')} className="bg-black p-10 rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden cursor-pointer hover:scale-[1.03] transition-all group border border-zinc-800">
                  <div className="absolute -top-12 -right-12 p-12 opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 text-[#39FF14]"><Wallet size={200}/></div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Chiffre d&apos;Affaires Mensuel</p>
                  <div className="flex items-end gap-4">
                    <p className={`${spaceGrotesk.className} text-5xl lg:text-6xl font-black text-[#39FF14] tracking-tighter`}>1.245.000 <span className="text-2xl opacity-50 font-medium">F</span></p>
                    <div className="flex flex-col mb-2">
                       <span className="text-[10px] font-black text-[#39FF14] bg-[#39FF14]/10 px-2 py-1 rounded-lg flex items-center gap-1"><ArrowUpRight size={12}/> +12.4%</span>
                    </div>
                  </div>
                </div>

                <div onClick={() => setActiveView('leads')} className="bg-white border border-zinc-200 p-10 rounded-[4rem] shadow-sm cursor-pointer hover:border-black hover:shadow-2xl transition-all group relative overflow-hidden">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Flux de Leads (24h)</p>
                  <p className={`${spaceGrotesk.className} text-5xl lg:text-6xl font-black text-black tracking-tighter`}>{leads.length}</p>
                  <div className="flex items-center gap-3 mt-6">
                    <div className="flex -space-x-4">
                      {leads.slice(0, 5).map((l, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-[3px] border-white bg-zinc-100 overflow-hidden shadow-sm">
                          <img src={`https://ui-avatars.com/api/?name=${l.full_name}&background=random&color=000&bold=true`} alt="Avatar Lead" />
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">+{(leads.length || 0) > 5 ? leads.length - 5 : 0} nouveaux</span>
                  </div>
                </div>

                <div onClick={() => setActiveView('marketing')} className="bg-[#39FF14] p-10 rounded-[4rem] shadow-xl cursor-pointer hover:scale-[1.03] transition-all group relative overflow-hidden border border-[#32E612]">
                   <div className="absolute -bottom-10 -right-10 opacity-10 text-black group-hover:rotate-[-15deg] transition-all duration-700"><Megaphone size={180}/></div>
                   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 mb-4">Portée Marketing Blog</p>
                   <p className={`${spaceGrotesk.className} text-5xl lg:text-6xl font-black text-black tracking-tighter`}>8.405</p>
                   <div className="mt-6 flex items-center gap-2">
                      <div className="px-3 py-1 bg-black text-[#39FF14] rounded-full text-[10px] font-black uppercase shadow-lg">Live Analytics</div>
                   </div>
                </div>
              </div>

              {/* GRAPHIQUES ET MAP */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* HISTOGRAMME NÉON */}
                <div className="lg:col-span-2 bg-white border border-zinc-200 p-8 lg:p-12 rounded-[4.5rem] shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-12">
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-zinc-100 rounded-[1.5rem] text-black"><BarChart size={24}/></div>
                       <div>
                          <h3 className="font-black uppercase text-base tracking-tighter text-black">Flux de Revenus Hebdomadaire</h3>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mars 2026 • Terminal Dakar</p>
                       </div>
                    </div>
                    <div className="flex gap-3 bg-zinc-50 p-2 rounded-[1.5rem] w-max">
                       <button className="px-6 py-2.5 bg-white border border-zinc-100 rounded-xl text-[11px] font-black uppercase text-zinc-400 shadow-sm hover:text-black transition-colors">Semaine</button>
                       <button className="px-6 py-2.5 bg-black rounded-xl text-[11px] font-black uppercase text-[#39FF14] shadow-xl">Mois</button>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between h-72 gap-4 sm:gap-6 relative pt-10">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] pt-14 pb-12">
                      {[1,2,3,4,5].map(line => <div key={line} className="border-t-2 border-black w-full"></div>)}
                    </div>
                    {histogramData.map((d, i) => (
                      <div key={i} className="relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer" onClick={() => setHistogramData(histogramData.map((data, idx) => ({ ...data, active: idx === i })))}>
                        <div className={`w-full max-w-[55px] rounded-[1.25rem] transition-all duration-700 relative z-10 ${d.active ? 'bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]' : 'bg-[#39FF14] hover:bg-black hover:scale-110 active:scale-95'}`} style={{ height: `${(d.ca / maxCa) * 100}%` }}>
                           {d.active && <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-[#39FF14] px-4 py-2 rounded-xl text-xs font-black shadow-2xl whitespace-nowrap animate-in slide-in-from-bottom-2 z-20">{d.ca.toLocaleString()} F</div>}
                        </div>
                        <span className={`mt-6 text-[10px] sm:text-[11px] font-black uppercase tracking-tighter ${d.active ? 'text-black' : 'text-zinc-400'}`}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTIVITY MAP SENEGAL */}
                <div className="bg-zinc-900 p-8 lg:p-12 rounded-[4.5rem] shadow-2xl relative overflow-hidden flex flex-col border border-zinc-800 group min-h-[400px]">
                  <div className="flex items-center gap-4 mb-10 relative z-10">
                    <div className="p-3 bg-[#39FF14]/10 rounded-2xl"><MapPin className="text-[#39FF14]" size={22}/></div>
                    <h3 className="font-black uppercase text-base text-white tracking-tighter">Zones de Capture</h3>
                  </div>
                  <div className="flex-1 relative rounded-[3rem] overflow-hidden border border-zinc-800 bg-zinc-800/30 w-full h-full">
                    <svg viewBox="0 0 100 100" className="w-full h-full opacity-10 absolute inset-0 text-[#39FF14] stroke-current group-hover:opacity-20 transition-all duration-700" fill="none" strokeWidth="0.8">
                      <path d="M20,30 Q40,20 60,40 T90,30 M15,50 Q40,60 60,50 T95,70 M10,80 Q50,95 70,70 T90,90" />
                      <circle cx="35" cy="35" r="1.5" fill="currentColor"/>
                      <circle cx="65" cy="55" r="1.5" fill="currentColor"/>
                      <circle cx="45" cy="75" r="1.5" fill="currentColor"/>
                    </svg>
                    <div className="absolute top-[35%] left-[35%] w-4 lg:w-5 h-4 lg:h-5 bg-[#39FF14] rounded-full shadow-[0_0_30px_#39FF14] animate-pulse"></div>
                    <div className="absolute top-[55%] left-[65%] w-3 lg:w-4 h-3 lg:h-4 bg-[#39FF14] rounded-full shadow-[0_0_20px_#39FF14] animate-ping"></div>
                    <div className="absolute top-[75%] left-[45%] w-2 lg:w-3 h-2 lg:h-3 bg-yellow-400 rounded-full shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-pulse"></div>
                    
                    <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl p-5 rounded-[2rem] border border-zinc-800/50 shadow-2xl transform group-hover:translate-y-[-5px] transition-transform">
                       <p className="text-[10px] font-black uppercase text-[#39FF14] mb-1 tracking-widest flex items-center gap-2"><Layers size={12}/> Focus : Dakar Plateaux</p>
                       <p className="text-[9px] font-bold text-zinc-400 uppercase leading-relaxed">Forte densité de conversion (82%) • Peak : 18h00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* LISTES DE DONNÉES DASHBOARD (CRM Récent & IA Actions) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* DERNIERS MEMBRES CRM */}
                 <div className="bg-white border border-zinc-200 p-8 lg:p-12 rounded-[4.5rem] shadow-sm group hover:shadow-xl transition-all">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10">
                       <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-zinc-100 rounded-[1.75rem] flex items-center justify-center text-black group-hover:bg-black group-hover:text-[#39FF14] transition-all"><TrendingUp size={28}/></div>
                          <div>
                            <h3 className="font-black uppercase text-base tracking-tighter">Nouveaux Membres CRM</h3>
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Derniers enregistrements base</p>
                          </div>
                       </div>
                       <button onClick={() => setActiveView('crm')} className="text-[10px] font-black uppercase text-[#39FF14] bg-black px-6 py-3.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all w-max">Gérer le CRM</button>
                    </div>
                    <div className="space-y-4">
                       {contacts.filter(c => c.type === 'Client').slice(0, 4).map(c => (
                          <div key={c.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 lg:p-6 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 group/item hover:border-[#39FF14] hover:bg-white transition-all gap-4">
                             <div className="flex items-center gap-4 lg:gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-black text-[#39FF14] flex items-center justify-center font-black text-sm shadow-lg shrink-0">{c.full_name?.charAt(0)}</div>
                                <div>
                                   <p className="font-black text-sm uppercase text-black">{c.full_name}</p>
                                   <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">{c.saas || 'Solution Active'}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-4 self-end sm:self-auto">
                                <span className="bg-[#39FF14]/10 text-black text-[9px] font-black uppercase px-3 py-1.5 rounded-xl border border-[#39FF14]/20">Activé</span>
                                <button className="text-zinc-300 hover:text-black transition-colors"><ChevronDown size={18}/></button>
                             </div>
                          </div>
                       ))}
                       {contacts.filter(c => c.type === 'Client').length === 0 && (
                          <div className="p-10 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-zinc-100 rounded-[2rem]">Aucun client récent</div>
                       )}
                    </div>
                 </div>

                 {/* ACTIONS IA INTELLIGENTES */}
                 <div className="bg-zinc-900 p-8 lg:p-12 rounded-[4.5rem] shadow-2xl border border-zinc-800 relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[#39FF14] pointer-events-none"><Sparkles size={120}/></div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10 relative z-10">
                       <h3 className="font-black uppercase text-base text-white tracking-tighter flex items-center gap-4"><Sparkles className="text-[#39FF14] shadow-[0_0_10px_#39FF14]"/> Planificateur IA</h3>
                       <span className="text-[10px] font-black text-zinc-400 uppercase bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-700 w-max">{actionsIA.filter(a => a.status === 'En attente' || a.status === 'En cours').length} tâches actives</span>
                    </div>
                    <div className="space-y-4 relative z-10 flex-1">
                       {actionsIA.slice(0, 4).map(action => (
                          <div key={action.id} className="bg-zinc-800/40 backdrop-blur-md p-5 lg:p-6 rounded-[2.5rem] border border-zinc-800 flex flex-col xl:flex-row justify-between xl:items-center gap-6 group hover:bg-zinc-800 hover:border-zinc-700 transition-all">
                             <div>
                                <p className="text-[9px] font-black text-[#39FF14] uppercase mb-1.5 tracking-[0.2em] flex items-center gap-2">
                                   <span className={`w-1.5 h-1.5 rounded-full ${action.status === 'En attente' ? 'bg-[#39FF14]' : action.status === 'En cours' ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                                   {action.module} • {action.date}
                                </p>
                                <p className={`font-bold text-sm uppercase tracking-tight ${action.status === 'Réalisé' ? 'text-zinc-500 line-through' : 'text-white'}`}>{action.title}</p>
                                <p className="text-[10px] text-zinc-400 mt-1 font-medium italic opacity-80">{action.desc}</p>
                             </div>
                             <div className="flex items-center gap-3 self-end xl:self-auto shrink-0">
                                {action.phone && action.status !== 'Réalisé' ? (
                                   <button onClick={() => executeWA(action.phone, action.msg, action.id)} className="bg-white text-black px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase hover:bg-[#39FF14] transition-all shadow-xl active:scale-95">Exécuter WA</button>
                                ) : action.status === 'Réalisé' ? (
                                   <button className="bg-zinc-800 text-zinc-500 px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase border border-zinc-700 cursor-default">Terminé</button>
                                ) : (
                                   <button className="bg-zinc-700 text-white px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase hover:bg-zinc-600 transition-all border border-zinc-600 active:scale-95">Détails</button>
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
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-8 bg-white p-8 lg:p-10 rounded-[4rem] border border-zinc-200 shadow-sm">
                   <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-black rounded-[1.75rem] flex items-center justify-center text-[#39FF14] shadow-2xl animate-pulse"><MessageSquare size={32}/></div>
                      <div>
                         <h2 className={`${spaceGrotesk.className} text-3xl lg:text-4xl font-black uppercase tracking-tighter`}>Flux de Leads</h2>
                         <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Capture en temps réel • Hub WhatsApp : 78 533 84 17</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="bg-zinc-50 border border-zinc-100 px-6 py-4 rounded-2xl flex items-center gap-3">
                         <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-ping"></span>
                         <span className="text-[10px] lg:text-[11px] font-black uppercase text-zinc-500">Flux Connecté</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[3rem] lg:rounded-[4.5rem] overflow-hidden shadow-sm overflow-x-auto">
                   <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-6 lg:p-8 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Origine & Contact</th>
                            <th className="p-6 lg:p-8 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Intention / Produit</th>
                            <th className="p-6 lg:p-8 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Message Reçu</th>
                            <th className="p-6 lg:p-8 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Traitement</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                         {leads.map(l => (
                            <tr key={l.id} className="hover:bg-zinc-50/50 transition-all group">
                               <td className="p-6 lg:p-8">
                                  <p className="font-black text-sm uppercase text-black">{l.full_name}</p>
                                  <p className="text-xs text-[#39FF14] font-black mt-1">{l.phone}</p>
                                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1.5 opacity-80">Source : {l.source || 'Site Web'}</p>
                               </td>
                               <td className="p-6 lg:p-8">
                                  <div className="flex flex-col gap-2">
                                     <span className="bg-black text-[#39FF14] text-[9px] lg:text-[10px] font-black px-3 py-1.5 rounded-xl uppercase inline-block shadow-lg w-max tracking-widest">{l.intent}</span>
                                     <p className="text-[9px] font-bold text-zinc-400 uppercase ml-2 mt-1">{l.created_at ? new Date(l.created_at).toLocaleDateString() : todayStr}</p>
                                  </div>
                               </td>
                               <td className="p-6 lg:p-8">
                                  <p className="text-xs text-zinc-600 font-medium italic max-w-xs leading-relaxed opacity-80 border-l-2 border-zinc-200 pl-4 py-1">&quot;{l.message}&quot;</p>
                               </td>
                               <td className="p-6 lg:p-8 text-right space-x-4">
                                  <button onClick={() => replyToLead(l)} className="bg-[#39FF14] text-black px-5 py-3 rounded-[1.25rem] text-[10px] font-black uppercase shadow-xl hover:bg-black hover:text-[#39FF14] transition-all active:scale-95 flex items-center justify-end gap-2 ml-auto">
                                     <Send size={16}/> Répondre
                                  </button>
                               </td>
                            </tr>
                         ))}
                         {leads.length === 0 && (
                            <tr><td colSpan={4} className="p-20 lg:p-32 text-center text-zinc-300 font-black uppercase text-xs lg:text-sm tracking-widest italic opacity-50">Aucun lead actif dans le flux pour le moment.</td></tr>
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                 {[
                    { id: 'all', label: 'Membres CRM', val: contacts.length, icon: Users, color: 'bg-white border-zinc-200' },
                    { id: 'new_clients', label: 'Clients Actifs', val: contacts.filter(c=>c.type==='Client').length, icon: CheckCircle, color: 'bg-black text-[#39FF14] shadow-2xl border-black' },
                    { id: 'new_prospects', label: 'Prospects Froids', val: contacts.filter(c=>c.type==='Prospect').length, icon: Clock, color: 'bg-white border-zinc-200' },
                    { id: 'trials', label: 'Essais Onyx', val: 5, icon: Zap, color: 'bg-[#39FF14] text-black shadow-lg border-[#32E612]' },
                 ].map(card => (
                    <div 
                      key={card.id} 
                      onClick={() => setCrmCardFilter(crmCardFilter === card.id ? null : card.id)} 
                      className={`p-8 lg:p-10 rounded-[3rem] lg:rounded-[3.5rem] border cursor-pointer hover:scale-[1.04] transition-all flex flex-col justify-between min-h-[180px] ${card.color} ${crmCardFilter === card.id ? 'ring-[6px] ring-[#39FF14]/30 scale-[1.02]' : ''}`}
                    >
                       <card.icon size={26} className="mb-4 opacity-80" />
                       <div>
                         <p className={`${spaceGrotesk.className} text-4xl lg:text-5xl font-black mb-1 tracking-tighter`}>{card.val}</p>
                         <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{card.label}</p>
                       </div>
                    </div>
                 ))}
              </div>

              {/* BARRE DE RECHERCHE CRM */}
              <div className="flex flex-col xl:flex-row justify-between gap-6 xl:gap-8 items-center bg-white p-6 lg:p-8 rounded-[3rem] lg:rounded-[4rem] border border-zinc-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#39FF14] opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 lg:w-6 lg:h-6 transition-all group-focus-within:text-[#39FF14]" />
                  <input 
                    type="text" 
                    placeholder="Filtrer par nom, téléphone, statut..." 
                    value={crmSearch} 
                    onChange={(e) => setCrmSearch(e.target.value)} 
                    className="w-full pl-16 lg:pl-20 pr-6 lg:pr-8 py-4 lg:py-5 bg-zinc-50 border-none rounded-[2rem] outline-none font-black text-xs lg:text-sm text-black focus:ring-[6px] focus:ring-[#39FF14]/10 transition-all uppercase placeholder:text-zinc-300" 
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                   <select 
                     value={crmTypeFilter} 
                     onChange={(e) => setCrmTypeFilter(e.target.value)} 
                     className="px-6 lg:px-8 py-4 lg:py-5 bg-zinc-50 rounded-[2rem] font-black text-[10px] lg:text-[11px] uppercase tracking-[0.15em] outline-none border-none cursor-pointer appearance-none text-zinc-500 hover:text-black transition-colors"
                   >
                      <option value="Tous">Base Complète</option>
                      <option value="Client">Clients Officiels</option>
                      <option value="Prospect">Prospects Leads</option>
                   </select>
                   <button 
                     onClick={() => { setEditingContact({ full_name: '', phone: '', type: 'Prospect', saas: '' }); setShowContactModal(true); }} 
                     className="flex items-center justify-center gap-3 bg-[#39FF14] text-black px-8 lg:px-12 py-4 lg:py-5 rounded-[2rem] font-black uppercase text-[10px] lg:text-[11px] tracking-widest hover:bg-black hover:text-[#39FF14] transition-all shadow-2xl hover:-translate-y-1 active:scale-95"
                   >
                      <Plus size={18} /> Ajouter Nouveau
                   </button>
                </div>
              </div>

              {/* TABLEAU CRM */}
              <div className="bg-white border border-zinc-200 rounded-[3rem] lg:rounded-[5rem] overflow-hidden shadow-sm relative overflow-x-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-zinc-50/50 border-b border-zinc-100">
                    <tr>
                      <th className="p-8 lg:p-10 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Identité & WhatsApp</th>
                      <th className="p-8 lg:p-10 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Segment Terminal</th>
                      <th className="p-8 lg:p-10 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Services Actifs</th>
                      <th className="p-8 lg:p-10 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Contrôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {filteredContacts.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50/50 transition-all group">
                        <td className="p-8 lg:p-10">
                          <div className="flex items-center gap-4 lg:gap-6">
                             <div className="w-14 lg:w-16 h-14 lg:h-16 bg-zinc-100 rounded-[1.5rem] lg:rounded-[1.75rem] flex items-center justify-center font-black text-lg text-black group-hover:bg-black group-hover:text-[#39FF14] transition-all uppercase shadow-sm shrink-0">{c.full_name?.charAt(0)}</div>
                             <div>
                                <p className="font-black text-sm lg:text-base uppercase text-black tracking-tight leading-tight">{c.full_name}</p>
                                <p className="text-xs lg:text-sm text-[#39FF14] font-black mt-1">{c.phone}</p>
                             </div>
                          </div>
                        </td>
                        <td className="p-8 lg:p-10">
                          <div className="flex flex-col gap-2">
                             <span className={`px-4 py-2 text-[9px] lg:text-[10px] font-black uppercase rounded-2xl w-max tracking-widest ${c.type === 'Client' ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20' : 'bg-zinc-100 text-zinc-500'}`}>{c.type}</span>
                             <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 mt-1.5 uppercase ml-2">{c.status || 'Non catégorisé'}</p>
                          </div>
                        </td>
                        <td className="p-8 lg:p-10">
                           <div className="flex items-center gap-3 lg:gap-4">
                              <div className={`w-2.5 lg:w-3 h-2.5 lg:h-3 rounded-full shrink-0 ${c.saas ? 'bg-[#39FF14] shadow-[0_0_10px_#39FF14]' : 'bg-zinc-200'}`}></div>
                              <p className="font-black text-xs lg:text-sm text-black uppercase tracking-tighter">{c.saas || 'À définir'}</p>
                           </div>
                        </td>
                        <td className="p-8 lg:p-10 text-right space-x-2 lg:space-x-4">
                          <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="p-3 lg:p-4 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-xl lg:rounded-2xl transition-all shadow-sm"><Edit3 size={18} className="lg:w-5 lg:h-5"/></button>
                          <button onClick={() => handleDeleteItem('clients', c.id)} className="p-3 lg:p-4 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl lg:rounded-2xl transition-all"><Trash2 size={18} className="lg:w-5 lg:h-5"/></button>
                        </td>
                      </tr>
                    ))}
                    {filteredContacts.length === 0 && (
                      <tr><td colSpan={4} className="p-20 lg:p-32 text-center text-zinc-300 font-black uppercase text-xs lg:text-sm tracking-[0.3em] opacity-50">Base CRM filtrée : Aucun résultat trouvé</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= VUE FINANCES (FULL) ================= */}
          {activeView === 'finance' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-6 max-w-[1500px] mx-auto">
                {/* HEADER FINANCE */}
                <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-8 lg:p-10 rounded-[3rem] lg:rounded-[4.5rem] border border-zinc-200 shadow-sm gap-8 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-zinc-50 opacity-40 translate-x-20 -translate-y-20 rounded-full"></div>
                   <div className="flex items-center gap-6 lg:gap-8 relative z-10">
                      <div className="p-5 lg:p-6 bg-black rounded-[1.5rem] lg:rounded-[2rem] text-[#39FF14] shadow-2xl shadow-[#39FF14]/10"><Wallet size={32} className="lg:w-10 lg:h-10"/></div>
                      <div>
                         <h2 className={`${spaceGrotesk.className} text-3xl lg:text-5xl font-black uppercase tracking-tighter`}>Hub Financier</h2>
                         <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Registre des Revenus & Commissions 2026</p>
                      </div>
                   </div>
                   <div className="flex gap-4 relative z-10">
                      <button onClick={() => alert("Génération registre PDF...")} className="w-full md:w-auto bg-black text-[#39FF14] px-8 lg:px-10 py-4 lg:py-5 rounded-[2rem] font-black uppercase text-[10px] lg:text-[11px] tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-2xl active:scale-95">
                         <Download size={18}/> Exporter Rapport
                      </button>
                   </div>
                </div>
                
                {/* GRID FINANCIÈRE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                   {[
                      { label: 'Revenus Globaux', val: '4.850.000 F', color: 'bg-black text-[#39FF14]', icon: TrendingUp },
                      { label: 'MRR (Récurrent)', val: '1.200.000 F', color: 'bg-white text-black border-zinc-200', icon: RefreshCcw },
                      { label: 'Commissions Dues', val: '450.000 F', color: 'bg-white text-black border-zinc-200', icon: Handshake },
                      { label: 'Sorties Opé', val: '120.000 F', color: 'bg-red-50 text-red-600 border-red-100', icon: TrendingUp },
                   ].map((card, i) => (
                      <div key={i} className={`p-8 lg:p-10 rounded-[3rem] lg:rounded-[3.5rem] shadow-sm flex flex-col justify-between h-48 lg:h-56 border transition-all hover:translate-y-[-5px] ${card.color}`}>
                         <card.icon size={24} className="opacity-40" />
                         <div>
                            <p className="text-[10px] lg:text-[11px] font-black uppercase tracking-widest opacity-60 mb-2 lg:mb-3">{card.label}</p>
                            <p className={`${spaceGrotesk.className} text-3xl lg:text-4xl font-black tracking-tighter`}>{card.val}</p>
                         </div>
                      </div>
                   ))}
                </div>

                {/* TABLEAU TRANSACTIONS */}
                <div className="bg-white border border-zinc-200 rounded-[3rem] lg:rounded-[5rem] p-8 lg:p-12 shadow-sm overflow-x-auto">
                   <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mb-10 lg:mb-12">
                      <div className="flex-1 relative min-w-[300px]">
                         <Search className="absolute left-6 lg:left-8 top-1/2 -translate-y-1/2 text-zinc-400 w-5 h-5 lg:w-6 lg:h-6" />
                         <input 
                           type="text" 
                           placeholder="Recherche : Client, Réf, Montant..." 
                           value={financeSearch} 
                           onChange={e => setFinanceSearch(e.target.value)} 
                           className="w-full pl-16 lg:pl-20 pr-6 lg:pr-8 py-4 lg:py-5 bg-zinc-50 border-none rounded-[2rem] outline-none font-black text-xs lg:text-sm uppercase transition-all focus:ring-[6px] focus:ring-[#39FF14]/5 placeholder:text-zinc-300" 
                         />
                      </div>
                      <select value={financeTypeFilter} onChange={e => setFinanceTypeFilter(e.target.value)} className="px-6 lg:px-8 py-4 lg:py-5 bg-zinc-50 border-none rounded-[2rem] font-black text-[10px] lg:text-[11px] uppercase tracking-widest cursor-pointer appearance-none text-zinc-500 hover:text-black outline-none focus:ring-4 focus:ring-zinc-100">
                         <option value="Tous">Base Transactions</option>
                         <option value="Entrée">Entrées (+) </option>
                         <option value="Sortie">Sorties (-) </option>
                      </select>
                   </div>

                   <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-6 lg:p-8 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Date & Référence</th>
                            <th className="p-6 lg:p-8 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Désignation</th>
                            <th className="p-6 lg:p-8 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Flux Monétaire</th>
                            <th className="p-6 lg:p-8 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Statut Terminal</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                         {filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-zinc-50 transition-all group">
                               <td className="p-6 lg:p-8">
                                  <p className="font-black text-xs lg:text-sm text-black">{t.date}</p>
                                  <p className="text-[9px] lg:text-[10px] font-black text-zinc-400 tracking-[0.15em] uppercase mt-1">{t.ref}</p>
                               </td>
                               <td className="p-6 lg:p-8">
                                  <p className="font-black text-sm lg:text-base uppercase text-black tracking-tighter">{t.client}</p>
                                  <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 mt-1">{t.type}</p>
                               </td>
                               <td className="p-6 lg:p-8">
                                  <div className={`flex items-baseline gap-2 font-black text-xl lg:text-2xl tracking-tighter ${t.amount > 0 ? 'text-[#39FF14]' : 'text-red-500'}`}>
                                     {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} <span className="text-[9px] lg:text-[10px] uppercase opacity-60">F CFA</span>
                                  </div>
                               </td>
                               <td className="p-6 lg:p-8 text-right">
                                  <span className={`text-[9px] lg:text-[10px] font-black uppercase px-4 lg:px-5 py-2 lg:py-2.5 rounded-2xl shadow-sm ${t.status === 'Payé' || t.status === 'Versé' ? 'bg-[#39FF14]/10 text-black border border-[#39FF14]/20' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>{t.status}</span>
                               </td>
                            </tr>
                         ))}
                         {filteredTransactions.length === 0 && (
                            <tr><td colSpan={4} className="p-20 lg:p-32 text-center text-zinc-300 font-black uppercase text-xs lg:text-sm tracking-[0.3em] opacity-50">Aucune transaction trouvée</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* ================= VUE ECOSYSTEME (9 SAAS) ================= */}
          {activeView === 'ecosystem' && (
             <div className="space-y-16 animate-in fade-in slide-in-from-right-6 max-w-[1500px] mx-auto pt-6 lg:pt-10">
                <div className="text-center space-y-4 lg:space-y-6 max-w-4xl mx-auto px-4">
                   <div className="inline-block px-4 py-1.5 bg-black text-[#39FF14] rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] mb-2 lg:mb-4 shadow-2xl shadow-[#39FF14]/20">Terminal Écosystème</div>
                   <h2 className={`${spaceGrotesk.className} text-5xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-black leading-none`}>Onyx <span className="text-[#39FF14]">Ecosystem</span></h2>
                   <p className="text-xs lg:text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] lg:tracking-[0.4em] leading-relaxed">Déploiement & Gouvernance du Catalogue SaaS • 9 Solutions Prêtes</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 lg:gap-10">
                   {ECOSYSTEM_SAAS.map(saas => (
                      <div key={saas.id} className="bg-white border border-zinc-200 p-10 lg:p-12 rounded-[4rem] lg:rounded-[5rem] shadow-sm hover:border-black hover:shadow-2xl transition-all group flex flex-col justify-between min-h-[380px] lg:min-h-[420px] relative overflow-hidden">
                         <div className={`absolute top-0 right-0 w-40 lg:w-48 h-40 lg:h-48 ${saas.color} opacity-[0.03] translate-x-16 lg:translate-x-20 -translate-y-16 lg:-translate-y-20 rounded-full group-hover:scale-150 transition-transform duration-1000`}></div>
                         <div className="relative z-10">
                            <div className={`w-16 lg:w-20 h-16 lg:h-20 rounded-[1.75rem] lg:rounded-[2.25rem] mb-8 lg:mb-10 flex items-center justify-center text-white shadow-2xl ${saas.color} group-hover:rotate-12 transition-transform duration-500`}><Box size={32} className="lg:w-10 lg:h-10"/></div>
                            <h3 className={`${spaceGrotesk.className} text-2xl lg:text-3xl font-black uppercase text-black tracking-tighter`}>{saas.name}</h3>
                            <p className="text-sm lg:text-base font-bold text-zinc-400 mt-3 lg:mt-4 leading-relaxed group-hover:text-zinc-600 transition-colors">{saas.desc}</p>
                         </div>
                         <div className="mt-10 lg:mt-14 flex flex-col gap-3 lg:gap-4 relative z-10">
                            <button onClick={() => window.open(saas.url, '_blank')} className="w-full bg-black text-[#39FF14] py-4 lg:py-5 rounded-[1.75rem] lg:rounded-[2rem] text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.03] transition-all shadow-2xl flex items-center justify-center gap-2 lg:gap-3 group/btn active:scale-95">
                               Accéder à la Démo <ExternalLink size={16} className="group-hover/btn:translate-x-1 transition-transform"/>
                            </button>
                            <button onClick={() => { setShowSaasLogin(saas); setSaasModalMode('create'); }} className="w-full bg-zinc-100 text-black py-4 lg:py-5 rounded-[1.75rem] lg:rounded-[2rem] text-[10px] lg:text-[11px] font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all active:scale-95">Générer Accès Client</button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* ================= VUE AMBASSADEURS ================= */}
          {activeView === 'partners' && (
             <div className="space-y-12 animate-in fade-in max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-8 lg:gap-10 bg-white p-8 lg:p-10 rounded-[3.5rem] lg:rounded-[4.5rem] border border-zinc-200 shadow-sm relative overflow-hidden">
                   <div className="flex items-center gap-6 lg:gap-8 relative z-10">
                      <div className="w-16 lg:w-20 h-16 lg:h-20 bg-black rounded-[1.75rem] lg:rounded-[2.25rem] flex items-center justify-center text-[#39FF14] shadow-2xl shrink-0"><Handshake size={32} className="lg:w-[38px] lg:h-[38px]"/></div>
                      <div>
                         <h2 className={`${spaceGrotesk.className} text-3xl lg:text-4xl font-black uppercase tracking-tighter`}>Ambassadeurs Onyx</h2>
                         <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Génération de Revenus & Croissance Réseau</p>
                      </div>
                   </div>
                   <div className="bg-[#39FF14]/10 border border-[#39FF14]/20 px-6 lg:px-8 py-4 lg:py-5 rounded-[1.5rem] lg:rounded-[2rem] flex flex-col items-center w-full md:w-auto">
                      <p className="text-[9px] lg:text-[10px] font-black uppercase text-black tracking-widest opacity-60">Total Commissions</p>
                      <p className={`${spaceGrotesk.className} text-2xl lg:text-3xl font-black text-black mt-1`}>1.820.000 F</p>
                   </div>
                </div>

                {/* CANDIDATURES EN ATTENTE */}
                {partners.filter(p => p.status === 'En attente').length > 0 && (
                   <div className="bg-red-50 border-2 border-red-100 p-8 lg:p-10 rounded-[3.5rem] lg:rounded-[4rem] animate-pulse">
                      <h3 className="font-black uppercase text-xs lg:text-sm text-red-600 mb-6 flex items-center gap-3 tracking-[0.2em]"><AlertCircle size={18} className="lg:w-5 lg:h-5"/> Dossiers en attente de validation</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                         {partners.filter(p => p.status === 'En attente').map(p => (
                            <div key={p.id} className="bg-white p-5 lg:p-6 rounded-[2rem] lg:rounded-[2.25rem] flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm border border-red-100 group">
                               <div>
                                  <p className="font-black text-xs lg:text-sm uppercase text-black">{p.full_name}</p>
                                  <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{p.contact} • {p.activity}</p>
                               </div>
                               <button onClick={() => approvePartner(p.id)} className="bg-black text-[#39FF14] px-6 lg:px-8 py-3 lg:py-4 rounded-xl lg:rounded-2xl text-[9px] lg:text-[10px] font-black uppercase hover:scale-105 transition-all shadow-xl active:scale-95 w-full sm:w-auto">Valider</button>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                <div className="bg-white border border-zinc-200 rounded-[3.5rem] lg:rounded-[5rem] overflow-hidden shadow-sm overflow-x-auto">
                   <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-8 lg:p-10 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Ambassadeur & Contact</th>
                            <th className="p-8 lg:p-10 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Secteur / Statut</th>
                            <th className="p-8 lg:p-10 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Volume Ventes</th>
                            <th className="p-8 lg:p-10 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Contrôle</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                         {partners.filter(p => p.status !== 'En attente').map(p => (
                            <tr key={p.id} className="hover:bg-zinc-50 transition-all">
                               <td className="p-8 lg:p-10">
                                  <p className="font-black text-sm lg:text-base uppercase text-black tracking-tighter leading-tight">{p.full_name}</p>
                                  <p className="text-xs text-[#39FF14] font-black mt-1">{p.contact}</p>
                               </td>
                               <td className="p-8 lg:p-10">
                                  <div className="flex flex-col gap-2">
                                     <span className="bg-zinc-100 text-black px-4 py-1.5 rounded-xl text-[9px] lg:text-[10px] font-black uppercase w-max tracking-widest">{p.activity}</span>
                                     <p className="text-[9px] lg:text-[10px] font-black text-[#39FF14] uppercase ml-2 mt-1">{p.status}</p>
                                  </div>
                               </td>
                               <td className="p-8 lg:p-10 text-center">
                                  <p className={`${spaceGrotesk.className} text-3xl lg:text-4xl font-black text-black tracking-tighter`}>{p.sales || 0}</p>
                                  <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase mt-1">Ventes Clôturées</p>
                               </td>
                               <td className="p-8 lg:p-10 text-right">
                                  <button onClick={() => { setSelectedPartner(p); setShowPartnerModal(true); }} className="bg-black text-white px-6 lg:px-8 py-3 lg:py-4 rounded-[1.25rem] lg:rounded-[1.5rem] text-[9px] lg:text-[11px] font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-all shadow-xl active:scale-95">Console Détails</button>
                               </td>
                            </tr>
                         ))}
                         {partners.filter(p => p.status !== 'En attente').length === 0 && (
                            <tr><td colSpan={4} className="p-20 lg:p-32 text-center text-zinc-300 font-black uppercase text-xs lg:text-sm tracking-[0.3em] opacity-50">Aucun ambassadeur actif trouvé</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* ================= VUE MARKETING ================= */}
          {activeView === 'marketing' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-6 max-w-[1200px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-8 lg:p-10 rounded-[3.5rem] lg:rounded-[4.5rem] border border-zinc-200 shadow-sm relative overflow-hidden group gap-6">
                   <div className="flex items-center gap-6 lg:gap-8 relative z-10">
                      <div className="w-16 lg:w-20 h-16 lg:h-20 bg-black rounded-[1.75rem] lg:rounded-[2.25rem] flex items-center justify-center text-[#39FF14] shadow-2xl group-hover:rotate-12 transition-all shrink-0"><Megaphone size={32} className="lg:w-[36px] lg:h-[36px]"/></div>
                      <div>
                         <h2 className={`${spaceGrotesk.className} text-3xl lg:text-4xl font-black uppercase tracking-tighter`}>Hub Marketing</h2>
                         <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Articles de Blog & Stratégies de Capture IA</p>
                      </div>
                   </div>
                   <button onClick={runIAArticleSuggestion} className="w-full md:w-auto bg-black text-[#39FF14] px-8 lg:px-10 py-4 lg:py-5 rounded-[1.75rem] lg:rounded-[2rem] font-black uppercase text-[10px] lg:text-[11px] tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:scale-105 transition-all relative z-10 active:scale-95">
                      <Sparkles size={16} className="lg:w-[18px] lg:h-[18px]"/> Suggestion IA Article
                   </button>
                </div>

                <div className="space-y-6 lg:space-y-8">
                   {marketingArticles.map(article => (
                      <div key={article.id} className="bg-white p-8 lg:p-12 rounded-[3.5rem] lg:rounded-[5rem] border border-zinc-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 lg:gap-10 hover:border-black transition-all group">
                         <div className="flex-1 w-full">
                            <div className="flex flex-wrap gap-3 lg:gap-4 mb-4 lg:mb-6">
                               <span className="bg-black text-[#39FF14] px-3 lg:px-4 py-1.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">{article.category || 'Stratégie'}</span>
                               <span className="bg-zinc-100 text-zinc-500 px-3 lg:px-4 py-1.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">Cible : {article.cible || 'Tous'}</span>
                            </div>
                            <h3 className={`${spaceGrotesk.className} text-2xl lg:text-3xl font-black uppercase text-black tracking-tighter mb-3 lg:mb-4 group-hover:text-[#39FF14] transition-colors leading-tight`}>{article.title}</h3>
                            <p className="text-zinc-500 font-medium text-sm lg:text-base leading-relaxed max-w-2xl opacity-80">{article.desc}</p>
                         </div>
                         <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:gap-4 w-full lg:w-max">
                            <button onClick={() => { setShowDiffusionModal(article); setSelectedContactsForDiffusion([]); }} className="flex-1 lg:flex-none bg-[#39FF14] text-black px-6 lg:px-10 py-4 lg:py-5 rounded-[1.75rem] lg:rounded-[2rem] font-black uppercase text-[10px] lg:text-[11px] tracking-widest hover:bg-black hover:text-[#39FF14] transition-all shadow-xl flex items-center justify-center gap-2 lg:gap-3 active:scale-95">
                               <Send size={16} className="lg:w-[18px] lg:h-[18px]"/> Diffuser Segment
                            </button>
                            <button onClick={() => handleDeleteItem('articles', article.id)} className="flex-1 lg:flex-none bg-zinc-50 text-red-500 py-3 lg:py-4 rounded-[1.75rem] lg:rounded-[2rem] text-[9px] lg:text-[10px] font-black uppercase hover:bg-red-50 transition-all flex items-center justify-center gap-2 active:scale-95 border border-transparent hover:border-red-100">
                               <Trash2 size={14} className="lg:w-4 lg:h-4"/> Supprimer l&apos;article
                            </button>
                         </div>
                      </div>
                   ))}
                   {marketingArticles.length === 0 && (
                      <div className="p-20 text-center text-zinc-400 font-black uppercase text-sm tracking-widest border-2 border-dashed border-zinc-200 rounded-[3rem]">Aucun article marketing trouvé</div>
                   )}
                </div>
             </div>
          )}

        </div>
      </main>

      {/* ================= MODALES TERMINAL ================= */}

      {/* MODALE SAAS: ACTIVATION & WhatsApp */}
      {showSaasLogin && saasModalMode === 'create' && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowSaasLogin)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white p-8 sm:p-16 rounded-[3.5rem] sm:rounded-[5.5rem] max-w-xl w-full relative shadow-[0_0_120px_rgba(57,255,20,0.15)] animate-in zoom-in-95 duration-500 border-t-[8px] sm:border-t-[12px] border-[#39FF14] my-auto">
               <button onClick={() => setShowSaasLogin(null)} className="absolute top-6 sm:top-12 right-6 sm:right-12 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all active:scale-90"><X size={20} className="sm:w-[26px] sm:h-[26px]"/></button>
               
               <div className="text-center mb-10 sm:mb-14 mt-4 sm:mt-0">
                  <div className={`w-20 sm:w-24 h-20 sm:h-24 rounded-[2rem] sm:rounded-[2.75rem] flex items-center justify-center text-white ${showSaasLogin?.color} shadow-2xl mx-auto mb-6 sm:mb-8 animate-bounce-slow`}><Box size={40} className="sm:w-12 sm:h-12"/></div>
                  <h2 className={`${spaceGrotesk.className} text-3xl sm:text-4xl font-black uppercase text-black tracking-tighter leading-none`}>Activer {showSaasLogin?.name}</h2>
                  <p className="text-[10px] sm:text-xs font-bold text-zinc-400 mt-2 sm:mt-3 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Générateur d&apos;Accès Terminal SaaS</p>
               </div>
               
               <div className="space-y-8 sm:space-y-10">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-2 bg-zinc-100 rounded-[1.75rem] sm:rounded-[2.25rem]">
                     <button onClick={() => setSaasCreateType('prospect')} className={`flex-1 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black uppercase rounded-[1.5rem] sm:rounded-[1.75rem] transition-all ${saasCreateType === 'prospect' ? 'bg-black text-[#39FF14] shadow-2xl' : 'text-zinc-400'}`}>Sélection CRM</button>
                     <button onClick={() => setSaasCreateType('manual')} className={`flex-1 py-3 sm:py-4 text-[10px] sm:text-[11px] font-black uppercase rounded-[1.5rem] sm:rounded-[1.75rem] transition-all ${saasCreateType === 'manual' ? 'bg-black text-[#39FF14] shadow-2xl' : 'text-zinc-400'}`}>Saisie Manuelle</button>
                  </div>

                  {saasCreateType === 'prospect' ? (
                     <div className="space-y-3">
                        <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Prospect Identifié</label>
                        <select value={saasCreateForm.prospectId} onChange={e => setSaasCreateForm({...saasCreateForm, prospectId: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all appearance-none cursor-pointer">
                           <option value="">-- Sélectionner un Prospect --</option>
                           {contacts.filter(c => c.type === 'Prospect').map(c => <option key={c.id} value={c.id}>{c.full_name} ({c.phone})</option>)}
                        </select>
                     </div>
                  ) : (
                     <div className="space-y-4 sm:space-y-5">
                        <input type="text" placeholder="NOM COMPLET CLIENT" value={saasCreateForm.name} onChange={e => setSaasCreateForm({...saasCreateForm, name: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all" />
                        <input type="tel" placeholder="NUMÉRO WHATSAPP (EX: 22177...)" value={saasCreateForm.phone} onChange={e => setSaasCreateForm({...saasCreateForm, phone: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all" />
                     </div>
                  )}

                  <div className="relative group">
                     <Lock size={18} className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#39FF14] transition-colors sm:w-5 sm:h-5" />
                     <input type="text" placeholder="MOT DE PASSE D'ACCÈS" value={saasCreateForm.password} onChange={e => setSaasCreateForm({...saasCreateForm, password: e.target.value})} className="w-full pl-16 sm:pl-20 pr-6 sm:pr-8 py-5 sm:py-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all tracking-[0.1em]" />
                  </div>

                  <button onClick={handleCreateSaasAccount} className="w-full bg-[#39FF14] text-black py-5 sm:py-7 rounded-[2rem] sm:rounded-[2.5rem] font-black uppercase text-xs sm:text-sm shadow-[0_20px_40px_-10px_rgba(57,255,20,0.4)] sm:shadow-[0_30px_60px_-15px_rgba(57,255,20,0.4)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 sm:gap-4 group">
                     <UserPlus size={20} className="group-hover:rotate-12 transition-transform sm:w-6 sm:h-6"/> Activer & Notifier Client
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* MODALE CRM EDIT / NEW */}
      {showContactModal && editingContact && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowContactModal)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white p-8 sm:p-16 rounded-[3.5rem] sm:rounded-[5.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 duration-500 border-t-[8px] sm:border-t-[12px] border-black my-auto">
            <button onClick={() => setShowContactModal(false)} className="absolute top-6 sm:top-12 right-6 sm:right-12 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all active:scale-90"><X size={20} className="sm:w-6 sm:h-6"/></button>
            
            <h2 className={`${spaceGrotesk.className} text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-10 sm:mb-14 text-black mt-2 sm:mt-0`}>{editingContact?.id ? 'Modifier Fiche' : 'Nouveau Membre CRM'}</h2>
            
            <form onSubmit={handleSaveContact} className="space-y-6 sm:space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Désignation Membre</label>
                 <input type="text" required value={editingContact?.full_name || ""} onChange={e => setEditingContact({...editingContact, full_name: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="NOM COMPLET / ENTREPRISE" />
              </div>
              
              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Terminal Mobile (WhatsApp)</label>
                 <input type="tel" required value={editingContact?.phone || ""} onChange={e => setEditingContact({...editingContact, phone: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="+221 ..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Catégorie</label>
                    <select value={editingContact?.type || 'Prospect'} onChange={e => setEditingContact({...editingContact, type: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-[11px] sm:text-xs uppercase outline-none cursor-pointer appearance-none transition-all focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10">
                      <option value="Prospect">Prospect Lead</option>
                      <option value="Client">Client Actif</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Logiciel Déployé</label>
                    <select value={editingContact?.saas || ""} onChange={e => setEditingContact({...editingContact, saas: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-[11px] sm:text-xs uppercase outline-none cursor-pointer appearance-none transition-all focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10">
                      <option value="" disabled>Choisir un SaaS</option>
                      <option value="À définir">À définir</option>
                      {ECOSYSTEM_SAAS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Notes de Suivi</label>
                 <input type="text" value={editingContact?.status || ''} onChange={e => setEditingContact({...editingContact, status: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="EX: EN TEST JUSQU'AU 15/03" />
              </div>

              <button type="submit" className="w-full bg-black text-[#39FF14] py-5 sm:py-7 rounded-[2rem] sm:rounded-[2.5rem] font-black uppercase text-xs sm:text-sm mt-6 sm:mt-8 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.4)] sm:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3 sm:gap-4 active:scale-95">
                <CheckCircle size={20} className="text-[#39FF14] sm:w-6 sm:h-6"/> Synchroniser la base CRM
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DIFFUSION MARKETING */}
      {showDiffusionModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowDiffusionModal)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
           <div className="bg-white p-8 sm:p-16 rounded-[3.5rem] sm:rounded-[5.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 max-h-[85vh] sm:max-h-[85vh] flex flex-col border-t-[8px] sm:border-t-[12px] border-[#39FF14] my-auto">
              <button onClick={() => setShowDiffusionModal(null)} className="absolute top-6 sm:top-10 right-6 sm:right-10 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all active:scale-90"><X size={20} className="sm:w-6 sm:h-6"/></button>
              <div className="mb-8 sm:mb-10 mt-2 sm:mt-0">
                 <h2 className={`${spaceGrotesk.className} text-2xl sm:text-3xl font-black uppercase text-black tracking-tighter`}>Planifier la Diffusion</h2>
                 <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1 sm:mt-2 italic line-clamp-2">&quot;{showDiffusionModal?.title}&quot;</p>
              </div>

              <div className="flex-1 overflow-y-auto mb-8 sm:mb-10 pr-2 sm:pr-4 space-y-3 sm:space-y-4 custom-scrollbar">
                 <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4 sm:mb-6 pb-4 border-b border-zinc-100 sticky top-0 bg-white z-10 pt-2">
                    <p className="text-[9px] sm:text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em]">SÉLECTION DES DESTINATAIRES</p>
                    <button onClick={() => setSelectedContactsForDiffusion(contacts.map(c=>c.id))} className="text-[9px] sm:text-[10px] font-black uppercase text-[#39FF14] bg-black px-4 py-2 rounded-xl shadow-lg w-max">Tout Sélectionner</button>
                 </div>
                 <div className="grid grid-cols-1 gap-2 sm:gap-3">
                    {contacts.map(c => (
                       <label key={c.id} className={`flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[1.75rem] border cursor-pointer transition-all ${selectedContactsForDiffusion.includes(c.id) ? 'bg-[#39FF14]/5 border-[#39FF14] shadow-md shadow-[#39FF14]/5' : 'bg-zinc-50 border-zinc-100 hover:border-black'}`}>
                          <input 
                            type="checkbox" 
                            checked={selectedContactsForDiffusion.includes(c.id)} 
                            onChange={() => {
                               if(selectedContactsForDiffusion.includes(c.id)) setSelectedContactsForDiffusion(selectedContactsForDiffusion.filter(id => id !== c.id));
                               else setSelectedContactsForDiffusion([...selectedContactsForDiffusion, c.id]);
                            }} 
                            className="w-5 h-5 sm:w-6 sm:h-6 accent-black rounded-lg shrink-0" 
                          />
                          <div className="flex-1 overflow-hidden">
                             <p className="font-black text-xs sm:text-sm uppercase text-black tracking-tighter truncate">{c.full_name}</p>
                             <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5 sm:mt-1 truncate">{c.phone} • {c.type}</p>
                          </div>
                       </label>
                    ))}
                 </div>
              </div>

              <button onClick={scheduleMarketingDiffusion} className="w-full bg-black text-[#39FF14] py-5 sm:py-7 rounded-[2rem] sm:rounded-[2.25rem] font-black uppercase text-xs sm:text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 sm:gap-4 shrink-0">
                 <Zap size={18} className="sm:w-[22px] sm:h-[22px]"/> Lancer la Campagne ({selectedContactsForDiffusion.length})
              </button>
           </div>
        </div>
      )}

      {/* MODALE DÉTAILS PARTENAIRE */}
      {showPartnerModal && selectedPartner && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowPartnerModal)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white p-8 sm:p-16 rounded-[3.5rem] sm:rounded-[5.5rem] max-w-3xl w-full relative shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto border-t-[8px] sm:border-t-[12px] border-black custom-scrollbar my-auto">
               <button onClick={() => setShowPartnerModal(false)} className="absolute top-6 sm:top-10 right-6 sm:right-10 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all"><X size={20} className="sm:w-6 sm:h-6"/></button>
               
               <div className="mb-10 sm:mb-14 text-center mt-4 sm:mt-0">
                  <div className="w-20 sm:w-24 h-20 sm:h-24 bg-zinc-100 rounded-[2rem] sm:rounded-[2.75rem] mx-auto mb-6 sm:mb-8 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl text-black">{selectedPartner?.full_name?.charAt(0)}</div>
                  <h2 className={`${spaceGrotesk.className} text-3xl sm:text-4xl font-black uppercase text-black tracking-tighter leading-none`}>{selectedPartner?.full_name}</h2>
                  <p className="text-[10px] sm:text-xs font-bold text-[#39FF14] bg-black px-4 py-1.5 rounded-full inline-block mt-3 sm:mt-4 uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-lg">Console Ambassadeur Officiel</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 mb-10 sm:mb-14">
                  <div className="bg-zinc-50 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-zinc-100 flex flex-col items-center">
                     <p className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 tracking-widest mb-2 sm:mb-3">Ventes Actives</p>
                     <p className={`${spaceGrotesk.className} text-5xl sm:text-6xl font-black text-black tracking-tighter`}>{selectedPartner?.sales || 0}</p>
                  </div>
                  <div className="bg-[#39FF14]/5 p-6 sm:p-10 rounded-[2.5rem] sm:rounded-[3rem] border border-[#39FF14]/10 flex flex-col items-center">
                     <p className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 tracking-widest mb-2 sm:mb-3">Gains (Commissions)</p>
                     <p className={`${spaceGrotesk.className} text-4xl sm:text-5xl font-black text-black tracking-tighter`}>{selectedPartner?.revenue || '0 F'}</p>
                  </div>
               </div>

               <div className="space-y-3 sm:space-y-4">
                  <button onClick={() => alert("Edition partenaire bientôt disponible")} className="w-full bg-black text-white py-5 sm:py-6 rounded-[1.75rem] sm:rounded-[2rem] font-black uppercase text-[10px] sm:text-[11px] tracking-widest shadow-xl hover:bg-[#39FF14] hover:text-black transition-all active:scale-95 flex items-center justify-center gap-3 sm:gap-4">
                     <Edit3 size={16} className="sm:w-[18px] sm:h-[18px]"/> Modifier les informations
                  </button>
                  <button onClick={handleConvertPartnerToClient} className="w-full bg-zinc-100 text-black py-5 sm:py-6 rounded-[1.75rem] sm:rounded-[2rem] font-black uppercase text-[10px] sm:text-[11px] tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-3 sm:gap-4 active:scale-95">
                     <UserPlus size={16} className="sm:w-[18px] sm:h-[18px]"/> Enregistrer en tant que Client
                  </button>
                  <button onClick={() => { setShowPartnerModal(false); handleDeleteItem('partners', selectedPartner.id); }} className="w-full text-red-500 font-black uppercase text-[9px] sm:text-[10px] tracking-widest pt-4 sm:pt-6 pb-2 opacity-60 hover:opacity-100 transition-opacity flex justify-center items-center gap-2">
                     <Trash2 size={14}/> Révoquer le statut Ambassadeur
                  </button>
               </div>
            </div>
         </div>
      )}

      {/* MODALE PROFIL TERMINAL */}
      {showProfileModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowProfileModal)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white p-8 sm:p-16 rounded-[3.5rem] sm:rounded-[5.5rem] max-w-md w-full relative shadow-2xl animate-in zoom-in-95 text-center border-t-[8px] sm:border-t-[12px] border-[#39FF14] my-auto">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 sm:top-10 right-6 sm:right-10 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20} className="sm:w-6 sm:h-6"/></button>
            
            <div className="relative w-32 sm:w-40 h-32 sm:h-40 mx-auto mb-8 sm:mb-10 mt-4 sm:mt-0">
               <img src={tempAdminProfile?.avatar} className="w-full h-full rounded-full object-cover border-[4px] sm:border-[6px] border-black p-1 sm:p-1.5 shadow-2xl" alt="Profil Administrateur" />
               <div className="absolute bottom-1 sm:bottom-2 right-1 sm:right-2 bg-[#39FF14] p-2.5 sm:p-3 rounded-full border-[4px] sm:border-[6px] border-white shadow-2xl shadow-[#39FF14]/50 group cursor-pointer hover:scale-110 transition-transform"><Edit3 size={16} className="text-black sm:w-[18px] sm:h-[18px]"/></div>
            </div>
            
            <h2 className={`${spaceGrotesk.className} text-2xl sm:text-3xl font-black uppercase text-black tracking-tighter leading-none`}>Admin Profile</h2>
            <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 mb-8 sm:mb-12 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2">Console Maître Dakar Hub</p>

            <div className="space-y-6 text-left">
               <div className="space-y-2 ml-4 sm:ml-6">
                  <label className="text-[10px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-widest">Identifiant Terminal</label>
                  <input type="text" value={tempAdminProfile?.name || ""} onChange={e => setTempAdminProfile({...tempAdminProfile, name: e.target.value})} className="w-full p-4 sm:p-5 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-4 focus:ring-[#39FF14]/10 transition-all" />
               </div>
               
               <button onClick={saveAdminProfile} className="w-full bg-black text-[#39FF14] py-5 sm:py-6 rounded-[2rem] sm:rounded-[2.25rem] font-black uppercase text-[10px] sm:text-[11px] tracking-[0.15em] sm:tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] sm:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] hover:scale-[1.03] transition-all active:scale-95 mb-8 sm:mb-10">
                 Sauvegarder
               </button>
               
               <div className="pt-8 sm:pt-10 border-t border-zinc-100 space-y-4 sm:space-y-6">
                  <button onClick={() => { alert('Session terminée. Redirection...'); window.location.href='/'; }} className="w-full flex items-center justify-center gap-3 sm:gap-4 text-red-500 py-3 sm:py-4 bg-red-50 rounded-[1.75rem] sm:rounded-[2rem] font-black uppercase text-[9px] sm:text-[10px] tracking-[0.2em] hover:bg-red-500 hover:text-white transition-all shadow-sm">
                     <LogOut size={16} className="sm:w-[18px] sm:h-[18px]"/> Quitter le Terminal
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* MODALE RAPPORT IA (SCAN INTELLIGENCE) */}
      {showRapportIA && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowRapportIA)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white p-8 sm:p-16 rounded-[4rem] sm:rounded-[6rem] max-w-2xl w-full relative shadow-[0_0_100px_rgba(57,255,20,0.2)] sm:shadow-[0_0_150px_rgba(57,255,20,0.2)] animate-in zoom-in-95 duration-700 border-t-[10px] sm:border-t-[14px] border-[#39FF14] my-auto">
               <button onClick={() => setShowRapportIA(false)} className="absolute top-6 sm:top-12 right-6 sm:right-12 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all active:scale-90"><X size={20} className="sm:w-6 sm:h-6"/></button>
               
               <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4 sm:gap-6 mb-10 sm:mb-14 mt-4 sm:mt-0">
                  <div className="w-16 sm:w-20 h-16 sm:h-20 bg-black rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center text-[#39FF14] shadow-2xl shrink-0"><Sparkles size={32} className="animate-pulse sm:w-[38px] sm:h-[38px]"/></div>
                  <div>
                     <h3 className={`${spaceGrotesk.className} text-3xl sm:text-4xl font-black uppercase text-black tracking-tighter leading-none`}>Scan IA CRM</h3>
                     <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Analyse Prédictive des Opportunités</p>
                  </div>
               </div>

               <div className="space-y-4 sm:space-y-6 max-h-[50vh] overflow-y-auto pr-2 sm:pr-4 custom-scrollbar">
                  {contacts.filter(c => c.type === 'Prospect').slice(0, 3).map((c, i) => (
                    <div key={i} className="p-6 sm:p-8 bg-zinc-50 rounded-[2.5rem] sm:rounded-[3rem] border border-zinc-100 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-[#39FF14] hover:bg-white transition-all gap-6 sm:gap-8">
                       <div className="flex-1 w-full">
                          <p className="font-black text-lg sm:text-xl uppercase text-black tracking-tighter leading-none mb-2">{c.full_name}</p>
                          <p className="text-[10px] sm:text-xs text-zinc-400 font-bold uppercase tracking-widest">Score de Conversion : <span className="text-[#39FF14]">85%</span></p>
                          <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-3 sm:mt-4 leading-relaxed italic opacity-80">&quot;L&apos;IA suggère de proposer le Pack Trio basé sur l&apos;activité de ce prospect et ses récents clics sur le blog.&quot;</p>
                       </div>
                       <button onClick={() => planifyCrmAction(`Conversion : ${c.full_name}`, "Démonstration Pack Trio à domicile.", c.phone, `Bonjour ${c.full_name}, nous avons une offre spéciale Trio...`)} className="bg-black text-[#39FF14] px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.75rem] sm:rounded-[2rem] text-[10px] sm:text-[11px] font-black uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all w-full md:w-max shrink-0">Planifier</button>
                    </div>
                  ))}
                  {contacts.filter(c => c.type === 'Prospect').length === 0 && (
                     <div className="p-10 text-center text-zinc-400 font-bold uppercase text-xs tracking-widest border border-dashed border-zinc-200 rounded-[2rem]">Aucune opportunité détectée</div>
                  )}
               </div>

               <div className="mt-10 sm:mt-14 pt-8 sm:pt-10 border-t border-zinc-100 text-center">
                  <p className="text-[9px] sm:text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] sm:tracking-[0.3em]">Algorithme Onyx-Scan v2.4 (Mars 2026)</p>
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
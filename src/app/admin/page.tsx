"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutDashboard, Users, Handshake, Settings, LogOut, 
  Search, Plus, MoreHorizontal, Trash2, 
  ArrowDownRight, CheckCircle, BarChart as BarChartIcon,
  Clock, FileText, Zap, MapPin, 
  MessageSquare, MessageCircle, Box, Wallet, Megaphone, Sparkles, Activity, RefreshCcw, Bell,
  TrendingUp, ChevronDown, ChevronLeft, ChevronRight, Send, Download, Layers, ExternalLink, DollarSign,
  AlertCircle, AlertTriangle, UserPlus, X, Edit3, Lock as LockIcon, Menu, Calendar, XCircle, HelpCircle, PlayCircle, Sun, Moon, Truck, Minus, ClipboardList, Mail, Briefcase,
  Crosshair
} from "lucide-react";

import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- 1. HACK ANTI-CRASH POLICES ---
const spaceGrotesk = { className: "font-sans" };
const inter = { className: "" };

// --- 3. MISE À JOUR DU TYPE CONTACT (Ajout Adresse & Pays & SaaS) ---
type Contact = {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
  city?: string; // Utilisé pour Région
  country?: string;
  status: string;
  type: string;
  source: string;
  created_at: string;
  expiration_date?: string | null;
  active_saas?: string[] | null;
  saas_expiration_dates?: Record<string, string>;
  saas?: string;
  avatar_url?: string;
  password_temp?: string | null;
  assigned_to?: string;
  commercial_id?: string;
  activity?: string;
  budget?: string;
  pending_prorata?: number;
  previous_saas?: string | null;
  prorata_history?: any[];
};

type ViewType = "dashboard" | "leads" | "crm" | "ecosystem" | "logistics" | "finance" | "partners" | "team" | "marketing" | "hubs" | "journal-ia" | "planning-marketing" | "help" | "bi" | "kanban-ht" | "withdrawals";
type IAAction = { id: string; module: string; title: string; desc: string; date: string; status: string; phone?: string; msg?: string; contactId?: string };

const AVAILABLE_MODULES = [
  { id: 'vente', name: 'Onyx Jaay' },
  { id: 'stock', name: 'Onyx Stock' },
  { id: 'tiak', name: 'Onyx Tiak' },
  { id: 'menu', name: 'Onyx Menu' },
  { id: 'formation', name: 'Onyx Formation' },
  { id: 'tontine', name: 'Onyx Tontine' },
  { id: 'cmpub', name: 'Add-on CM & Pub (+49.9k)' }
];

const ECOSYSTEM_SAAS = [
  { id: "jaay", name: "Onyx Jaay", desc: "Boutique & Catalogue", price: "13 900 F", link: "/admin/saas/vente", color: "bg-green-500" },
  { id: "staff", name: "Onyx Staff", desc: "RH & Plannings", price: "13 900 F", link: "/admin/saas/staff", color: "bg-cyan-500" },
  { id: "tekki", name: "Pack Tekki", desc: "Jaay + Stock + Tiak", price: "22 900 F", link: "/admin/saas/onyx-tekki", color: "bg-emerald-600" },
  { id: "tekkipro", name: "Pack Tekki Pro", desc: "Tekki + Staff + Formation", price: "27 900 F", link: "/admin/saas/onyx-tekki-pro", color: "bg-emerald-500" },
  { id: "crm", name: "Onyx CRM", desc: "CRM B2B + Booking", price: "39 900 F", link: "/admin/saas/onyx-crm", color: "bg-green-400" },
  { id: "tiak", name: "Onyx Tiak", desc: "Logistique & Livreurs", price: "13 900 F", link: "/admin/saas/tiak", color: "bg-teal-500" },
  { id: "booking", name: "Onyx Booking", desc: "Rendez-vous", price: "13 900 F", link: "/admin/saas/booking", color: "bg-indigo-500" },
  { id: "tontine", name: "Onyx Tontine", desc: "Finance", price: "6 900 F", link: "/admin/saas/tontine", color: "bg-pink-500" },
  { id: "formation", name: "Onyx Formation", desc: "Académie", price: "13 900 F", link: "/admin/saas/formation", color: "bg-yellow-500" },
  { id: "menu", name: "Onyx Menu", desc: "Resto", price: "13 900 F", link: "/admin/saas/menu", color: "bg-rose-500" },
  { id: "gold", name: "Pack Onyx Gold", desc: "L'Arsenal Complet VIP", price: "59 900 F", link: "/admin/saas/onyx-gold", color: "bg-lime-400" },
  { id: "cmpub", name: "Add-on CM Pub", desc: "Création de contenu", price: "49 900 F", link: "/admin/saas/cm-pub", color: "bg-purple-500" },
  { id: "boost", name: "Onyx Boost", desc: "Stratégie Digitale", price: "Sur Devis", link: "/admin/saas/boost", color: "bg-blue-500" },
  { id: "modernize", name: "Onyx Modernize", desc: "Implémentation VIP", price: "Sur Devis", link: "/admin/saas/modernize", color: "bg-orange-500" }
];

const getSaasPrice = (saasName: string) => {
   if (!saasName) return 0;
   if (saasName.includes('Gold')) return 59900;
   if (saasName.includes('CRM')) return 39900;
   if (saasName.includes('Tekki Pro')) return 27900;
   if (saasName.includes('Tekki')) return 22900;
   if (saasName.includes('Tontine')) return 6900;
   if (saasName.includes('Jaay') || saasName.includes('Solo')) return 13900;
   if (saasName.includes('Menu') || saasName.includes('Booking') || saasName.includes('Staff') || saasName.includes('Stock') || saasName.includes('Tiak')) return 13900;
   if (saasName.includes('Add-on CM Pub')) return 49900;
   if (saasName.includes('Boost')) return 150000;
   if (saasName.includes('Modernize')) return 300000;
   return 0;
};

export default function AdminDashboard() {
   const router = useRouter();
 
   // --- 4. ÉTATS DE NAVIGATION ET RECHERCHE ---
   const [activeView, setActiveView] = useState("dashboard");
   const [searchTerm, setSearchTerm] = useState("");
   const [isLoading, setIsLoading] = useState(true);
   const [mounted, setMounted] = useState(false);
   const [todayStr, setTodayStr] = useState("");
  const [adminUser, setAdminUser] = useState<any>(null);
  const [adminEmail, setAdminEmail] = useState("rokhydly@gmail.com");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminAuthLoading, setAdminAuthLoading] = useState(false);
  const [isAutomating, setIsAutomating] = useState(false);
  const [iaSuggestions, setIaSuggestions] = useState<any[]>([]);

  // 👇 AJOUTE CES DEUX LIGNES JUSTE ICI 👇
  const [editingArticle, setEditingArticle] = useState<any>(null);
  
  const [scannedLeadIds, setScannedLeadIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('onyx_scanned_leads');
        return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [plannedEvents, setPlannedEvents] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('onyx_planned_events');
        return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  useEffect(() => {
    localStorage.setItem('onyx_planned_events', JSON.stringify(plannedEvents));
  }, [plannedEvents]);
  // 👆 ================================= 👆
 
   // --- 5. SUPPRESSION DES DONNÉES FICTIVES (On part de zéro) ---
   const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [commercials, setCommercials] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, activeClients: 0, pendingLeads: 0, newPartners: 0, currentMonthRevenue: 0, prevMonthRevenue: 0, isRevenueDown: false });

  // --- 6. ÉTATS DES MODALES ---
  const [showProductModal, setShowProductModal] = useState<{lead: any, type: string} | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [quoteModal, setQuoteModal] = useState<{lead: any, designation: string, price: number} | null>(null);
  const [editingContact, setEditingContact] = useState<Partial<Contact>>({});
  const [prorataMsg, setProrataMsg] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [adminProfile, setAdminProfile] = useState({ 
    name: "Cruella Ly", 
    email: "rokhydly@gmail.com", 
    avatar: "https://i.ibb.co/tpLcRY30/639970592-10237151082048963-3571335441411123882-n.jpg" 
  });
  
  // Nouveaux états pour le mot de passe dans le profil
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // NOUVEAU : État pour la modale de la carte des Hubs
  const [selectedHub, setSelectedHub] = useState<string | null>(null);
  const [actionsIA, setActionsIA] = useState<IAAction[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [showRapportIA, setShowRapportIA] = useState(false);
  const [showSaasLogin, setShowSaasLogin] = useState<{ id: string; name: string; color: string } | null>(null);
  const [saasModalMode, setSaasModalMode] = useState<"create" | "login">("create");
  const [saasCreateType, setSaasCreateType] = useState<"manual" | "prospect">("manual");
  const [saasCreateForm, setSaasCreateForm] = useState<{ name: string; phone: string; password: string; prospectId?: string }>({ name: "", phone: "", password: "" });
  const [crmTypeFilter, setCrmTypeFilter] = useState("Tous");
  const [crmActivityFilter, setCrmActivityFilter] = useState("Tous");
  const [crmViewMode, setCrmViewMode] = useState<'list' | 'grid'>('list');
  const [advFilterSaas, setAdvFilterSaas] = useState("Tous");
  const [advFilterExp, setAdvFilterExp] = useState<'all'|'30j'|'expired'>('all');
  
  // --- ÉTATS POUR OBJECTIFS BUSINESS INTELLIGENCE ---
  const [mrrGoal, setMrrGoal] = useState<number>(500000);
  const [saasGoal, setSaasGoal] = useState<number>(15);
  const [cmGoal, setCmGoal] = useState<number>(3);
  const [editingBiGoal, setEditingBiGoal] = useState<'mrr' | 'saas' | 'cm' | null>(null);
  const [biGoalInputValue, setBiGoalInputValue] = useState<number>(0);

  const [crmSearch, setCrmSearch] = useState("");
  const [crmCardFilter, setCrmCardFilter] = useState<string | null>(null);
  const [financeSearch, setFinanceSearch] = useState("");
  const [financeTypeFilter, setFinanceTypeFilter] = useState("Tous");
  const [actionTabFilter, setActionTabFilter] = useState("IA");
  const [actionSearchFilter, setActionSearchFilter] = useState("");
  const [marketingArticles, setMarketingArticles] = useState<any[]>([]);
  const [editingMaterial, setEditingMaterial] = useState<any>(null);
  const [showDiffusionModal, setShowDiffusionModal] = useState<any>(null);
  const [selectedContactsForDiffusion, setSelectedContactsForDiffusion] = useState<string[]>([]);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  // NOUVEAU : États pour l'ajout manuel d'un ambassadeur
  const [showAddPartnerModal, setShowAddPartnerModal] = useState(false);
  const [newPartnerForm, setNewPartnerForm] = useState<any>({ full_name: '', phone: '', contact: '', city: 'Dakar', country: 'Sénégal', address: '', profession: '', experience: '', revenue_goal: '', strategy: '', status: '', activity: '' });
  const [showEditPartnerModal, setShowEditPartnerModal] = useState(false);
  const [editPartnerForm, setEditPartnerForm] = useState<any>({});
  const [tempAdminProfile, setTempAdminProfile] = useState(adminProfile);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [histogramActiveIdx, setHistogramActiveIdx] = useState<number | null>(null);
  
  const [chartFilter, setChartFilter] = useState<'week'|'month'|'year'>('week');
  const histogramData = (() => {
    const today = new Date();
    const arr: { day: string; ca: number; active: boolean }[] = [];
    
    if (chartFilter === 'week') {
      const jours = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(d.getDate() - i);
        const count = leads.filter(l => l.created_at && new Date(l.created_at).toDateString() === d.toDateString()).length;
        arr.push({ day: jours[d.getDay()], ca: count * 13900, active: histogramActiveIdx === arr.length });
      }
    } else if (chartFilter === 'month') {
      for (let i = 3; i >= 0; i--) {
        const dStart = new Date(today); dStart.setDate(dStart.getDate() - (i * 7 + 7));
        const dEnd = new Date(today); dEnd.setDate(dEnd.getDate() - (i * 7));
        const count = leads.filter(l => l.created_at && new Date(l.created_at) >= dStart && new Date(l.created_at) < dEnd).length;
        arr.push({ day: `S${4-i}`, ca: count * 13900, active: histogramActiveIdx === arr.length });
      }
    } else if (chartFilter === 'year') {
      const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const count = leads.filter(l => l.created_at && new Date(l.created_at).getMonth() === d.getMonth() && new Date(l.created_at).getFullYear() === d.getFullYear()).length;
        arr.push({ day: mois[d.getMonth()], ca: count * 13900, active: histogramActiveIdx === arr.length });
      }
    }
    return arr;
  })();
  const maxCa = Math.max(...histogramData.map(d => d.ca), 1);
  const [showHubsMap, setShowHubsMap] = useState(false);
  const [leadSearch, setLeadSearch] = useState("");
  const [leadFilter, setLeadFilter] = useState("Tous");
  const [partnerSearch, setPartnerSearch] = useState("");
  const [partnerActivityFilter, setPartnerActivityFilter] = useState("Tous");
  const [showAddCommercialModal, setShowAddCommercialModal] = useState(false);
  const [showEditCommercialModal, setShowEditCommercialModal] = useState(false);
  const [editCommercialForm, setEditCommercialForm] = useState<any>({});
  const [newCommercialForm, setNewCommercialForm] = useState({ full_name: '', phone: '', objective: 20 });
  const [viewCommercialClients, setViewCommercialClients] = useState<any>(null);
  const [commercialHistoryFilter, setCommercialHistoryFilter] = useState('all');
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [commissionModal, setCommissionModal] = useState<any>(null);
  const [commissionAmount, setCommissionAmount] = useState<string>('');
  const [viewingAvatarUrl, setViewingAvatarUrl] = useState<string | null>(null);

  const activeSalesTeam = [
      { name: 'Admin Onyx', avatar: 'https://ui-avatars.com/api/?name=AO&background=000&color=39FF14' },
      ...commercials.map(c => ({
          name: c.full_name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.full_name)}&background=random`
      }))
  ];

  const [globalSearch, setGlobalSearch] = useState("");
  
  // --- NOUVEAUX ÉTATS POUR LES RETRAITS ---
  const [withdrawalFilter, setWithdrawalFilter] = useState("Tous");
  const [validateWithdrawalModal, setValidateWithdrawalModal] = useState<any>(null);
  const [kanbanFilter, setKanbanFilter] = useState('Tous');
  const [withdrawalProof, setWithdrawalProof] = useState("");

  const [leadActionsOpen, setLeadActionsOpen] = useState<string | null>(null);
  const [partnerKpiFilter, setPartnerKpiFilter] = useState<'all' | 'nouveaux' | 'top' | 'moins' | 'gains'>('all');
  const [marketingMaterials, setMarketingMaterials] = useState<any[]>([]);
  const [newMaterial, setNewMaterial] = useState({ title: '', type: 'Canva', url: '' });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const [showAddHardwareModal, setShowAddHardwareModal] = useState(false);
  const [newHardwareForm, setNewHardwareForm] = useState({ name: '', min: 5, type: 'Matériel' });
  const [hardwareStock, setHardwareStock] = useState<any[]>([
    { id: 1, name: 'Terminal de Paiement (TPE Onyx)', qty: 45, min: 10, type: 'Matériel' },
    { id: 2, name: 'Imprimantes Thermiques (Bluetooth)', qty: 12, min: 15, type: 'Accessoire' },
    { id: 3, name: 'Cartes NFC / QR Onyx', qty: 150, min: 50, type: 'Consommable' },
    { id: 4, name: "Kits d'installation Onyx Modernize", qty: 8, min: 5, type: 'Kit' },
  ]);
  const updateHardwareStock = async (id: any, delta: number) => {
    const item = hardwareStock.find(i => i.id === id);
    if (!item) return;
    
    const newQty = Math.max(0, item.qty + delta);
    setHardwareStock(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i));

    try {
       await supabase.from('hardware_stock').update({ qty: newQty }).eq('id', id);
    } catch (e) {}

    if (newQty <= item.min && item.qty > item.min) {
       if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Alerte Stock Critique', { body: `Le stock de ${item.name} est descendu à ${newQty} (Min: ${item.min}).` });
       }
       try {
          await fetch('/api/send-email', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({
                subject: `🚨 ALERTE STOCK : ${item.name}`,
                text: `Le stock de ${item.name} est critique (${newQty} restants).`,
                html: `<h2>Alerte Stock Critique</h2><p>L'article <b>${item.name}</b> a atteint son seuil d'alerte.</p><p>Quantité restante : <b style="color:red">${newQty}</b> (Minimum requis : ${item.min})</p>`
             })
          });
       } catch (e) {}
    }
  };

  const handleAddHardware = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newHardwareForm.name) return;
      try {
          const payload = {
              name: newHardwareForm.name,
              qty: 0,
              min: newHardwareForm.min,
              type: newHardwareForm.type
          };
          const { data, error } = await supabase.from('hardware_stock').insert([payload]).select().single();
          if (error) throw error;
          
          setHardwareStock(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
          setShowAddHardwareModal(false);
          setNewHardwareForm({ name: '', min: 5, type: 'Matériel' });
          alert("Nouveau matériel ajouté avec succès !");
      } catch (err: any) {
          alert("Erreur lors de l'ajout : " + err.message);
      }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem('onyx_admin_theme') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('onyx_admin_theme', newTheme);
  };

  // --- CHARGEMENT DES DONNÉES (Supabase uniquement) ---
  const fetchSupabaseData = async () => {
   setIsLoading(true);
   setIsRefreshing(true);
   try {
     const { data: { session } } = await supabase.auth.getSession();
     
     // Utilisation de l'API Service Role pour bypasser le RLS
     const res = await fetch('/api/admin/data', {
       headers: { 'Authorization': `Bearer ${session?.access_token || ''}` }
     });
     
     const result = await res.json();
     if (!res.ok) throw new Error(result.error || "Erreur de chargement depuis l'API");

     const {
       clients: contactsData, leads: leadsData, ambassadors: partnersData,
       marketing_materials: materialsData, withdrawals: withdrawalsData,
       commercials: commercialsData, hardware_stock: hardwareData,
       admin_settings: adminSettings, actions_ia: actionsData, marketing_articles: articlesData
     } = result.data;
     
     if (contactsData) setContacts(contactsData);
     if (leadsData) {
       const normalizePhone = (p: string) => (p || '').replace(/\s+/g, '').replace(/^\+?221/, '');
       const activeLeads = leadsData.filter((lead: any) => {
           const isPendingOrNew = ['En attente', 'Nouveau', 'Nouveau Lead'].includes(lead.status) || !lead.status;
           const notInContacts = !contactsData?.some((c: any) => normalizePhone(c.phone) === normalizePhone(lead.phone));
           const notInPartners = !partnersData?.some((p: any) => normalizePhone(p.contact || p.phone) === normalizePhone(lead.phone));
           return isPendingOrNew && notInContacts && notInPartners;
       });
       setLeads(activeLeads);
     }
     if (partnersData) setPartners(partnersData);
     if (materialsData) setMarketingMaterials(materialsData);
     if (withdrawalsData) setWithdrawals(withdrawalsData);
     if (commercialsData) setCommercials(commercialsData);
     if (hardwareData && hardwareData.length > 0) setHardwareStock(hardwareData);
     if (adminSettings) {
       setMrrGoal(adminSettings.mrr_goal || 500000);
       setSaasGoal(adminSettings.saas_goal || 15);
       setCmGoal(adminSettings.cm_goal || 3);
     }
     if (actionsData) setActionsIA(actionsData);
     if (articlesData) setMarketingArticles(articlesData);
     
     // Nouveau calcul précis du revenu MRR
     const realRevenue = contactsData?.reduce((acc: number, c: any) => {
        if (c.type !== 'Client') return acc;
        
        const foundSaas = ECOSYSTEM_SAAS.find(s => s.name === c.saas);
        if (foundSaas) return acc + parseInt(foundSaas.price.replace(/\D/g, ''), 10);
        
        if (c.saas === 'Pack Onyx Gold' || c.saas === 'Onyx Gold') return acc + 59900;
        if (c.saas === 'Pack Onyx CRM' || c.saas === 'Onyx CRM') return acc + 39900;
        if (c.saas === 'Pack Tekki Pro' || c.saas === 'OnyxTekki Pro') return acc + 27900;
        if (c.saas === 'Pack Tekki' || c.saas === 'OnyxTekki' || c.saas === 'Pack Trio') return acc + 22900;
        if (c.saas === 'Onyx Jaay' || c.saas === 'Onyx Solo') return acc + 13900;
        if (c.saas === 'Onyx Tontine') return acc + 6900;
        return acc + 13900; // Plan individuel par défaut
     }, 0) || 0;
     
     const now = new Date();
     const currentMonth = now.getMonth();
     const currentYear = now.getFullYear();
     const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
     const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

     const currentMonthRevenue = contactsData?.filter((c: any) => c.type === 'Client' && c.created_at && new Date(c.created_at).getMonth() === currentMonth && new Date(c.created_at).getFullYear() === currentYear).reduce((acc: number, c: any) => acc + getSaasPrice(c.saas || ''), 0) || 0;
     const prevMonthRevenue = contactsData?.filter((c: any) => c.type === 'Client' && c.created_at && new Date(c.created_at).getMonth() === prevMonth && new Date(c.created_at).getFullYear() === prevYear).reduce((acc: number, c: any) => acc + getSaasPrice(c.saas || ''), 0) || 0;
     const isRevenueDown = prevMonthRevenue > 0 && currentMonthRevenue < prevMonthRevenue;

     setStats({
       revenue: realRevenue,
       activeClients: contactsData?.filter((c: any) => c.type === 'Client').length || 0,
       pendingLeads: leadsData?.length || 0,
       newPartners: partnersData?.length || 0,
       currentMonthRevenue,
       prevMonthRevenue,
       isRevenueDown
     });
   } catch (error: any) {
     console.error("Erreur de chargement:", error);
     alert("Erreur de chargement des données : " + error.message);
   } finally {
     setIsLoading(false);
     setIsRefreshing(false);
   }
 };

  useEffect(() => {
    setMounted(true);
    setTodayStr(new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }));

    // Demander la permission pour les notifications push au chargement
    if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    const initAdmin = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        const hasSessionFlag = typeof window !== 'undefined' && sessionStorage.getItem('onyx_admin_session') === '1';
            if (!error && data?.user && hasSessionFlag && data.user.email === 'rokhydly@gmail.com') {
          setAdminUser(data.user);
          fetchSupabaseData();
        } else {
              if (!error && data?.user && (!hasSessionFlag || data.user.email !== 'rokhydly@gmail.com')) {
            await supabase.auth.signOut();
          }
          setIsLoading(false);
        }
      } catch {
        setIsLoading(false);
      }
    };

    initAdmin();
  }, []);

  // --- ÉCOUTE TEMPS RÉEL & NOTIFICATIONS PUSH NAVIGATEUR ---
  useEffect(() => {
    if (!adminUser) return;
    
    const channel = supabase
      .channel('realtime-leads-admin')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'leads' }, (payload) => {
        const newLead = payload.new;
        setLeads(prev => {
          if (prev.some(l => l.id === newLead.id)) return prev;
          return [newLead, ...prev];
        });
        
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          const notif = new Notification('🚨 Nouveau Lead OnyxOps !', {
            body: `${newLead.full_name} vient de soumettre une demande.\nContact: ${newLead.phone}`,
            icon: 'https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png'
          });
          notif.onclick = () => { window.focus(); setActiveView('leads'); };
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [adminUser]);

  const deleteActionIA = async (id: string) => {
    await supabase.from('actions_ia').delete().eq('id', id);
    setActionsIA(prev => prev.filter(a => a.id !== id));
  };

  // --- LOGIQUE DE CRÉATION DE COMPTE MODIFIÉE (J+7, Identifiants de test Ambassadeur) ---
  const handleCreateAccount = async (lead: any, type: 'client' | 'ambassadeur', saasName?: string) => {
   const tempPass = "central2026"; // Mot de passe fixe demandé
   
   // On utilise le VRAI numéro du prospect pour qu'il puisse se connecter (Clients et Ambassadeurs)
   const phone = (lead.phone || '').replace(/\s+/g, '');

   try {
     const res = await fetch('/api/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            phone: phone,
            fullName: lead.full_name || 'Nouveau Membre',
            role: type,
            password: tempPass,
            saas: saasName
        })
     });
     const result = await res.json();
     if (!res.ok) throw new Error(result.error || "Erreur de création du compte.");

     // NOUVEAU : On supprime TOUS les leads (partiels ou complets) liés à ce numéro pour éviter les doublons
     await supabase.from('leads').delete().eq('phone', lead.phone);

     const portal = type === 'client' ? 'https://onyxlinks.com/login' : 'https://onyxlinks.com/ambassadeurs/login';
     const welcomeMsg = `Félicitations ! Ton compte est prêt.\n🔗 Accès : ${portal}\n📱 ID : ${phone}\n🔑 Code PIN : 0000`;

     window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(welcomeMsg)}`, '_blank');
     fetchSupabaseData();
   } catch (err: any) {
     alert("Erreur : " + err.message);
   }
  };

  const runIaScan = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const suggestions: any[] = [];
    const plannedContactIds = new Set(actionsIA.map(a => a.contactId));

    contacts.forEach(contact => {
        if (plannedContactIds.has(contact.id)) return;
        if (contact.type !== 'Client') return;

        const totalSpent = (contact as any).totalSpent || 0;
        const ordersCount = (contact as any).ordersCount || 0;
        const lastOrder = (contact as any).lastOrder ? new Date((contact as any).lastOrder) : null;

        if (totalSpent > 150000 || ordersCount > 5) {
            suggestions.push({
                id: `ia-vip-${contact.id}`,
                contactId: contact.id,
                clientName: contact.full_name,
                clientPhone: contact.phone,
                type: 'vip',
                title: `Action VIP pour ${contact.full_name}`,
                description: 'Client fidèle. Proposer une offre exclusive ou un accès anticipé.',
                msg: `⭐ Bonjour ${contact.full_name}, en tant que client VIP, nous vous offrons un accès anticipé à notre nouvelle collection ! Soyez le premier à la découvrir.`
            });
        } else if (lastOrder && lastOrder < thirtyDaysAgo) {
            suggestions.push({
                id: `ia-inactive-${contact.id}`,
                contactId: contact.id,
                clientName: contact.full_name,
                clientPhone: contact.phone,
                type: 'inactive',
                title: `Réactivation de ${contact.full_name}`,
                description: 'Client inactif depuis plus de 30 jours.',
                msg: `😢 Bonjour ${contact.full_name}, vous nous manquez ! Profitez d'un bon d'achat de 5000F sur votre prochaine commande. Offre limitée !`
            });
        }
        
        if (contact.saas === 'Onyx Jaay' || contact.saas === 'Onyx Solo') {
            suggestions.push({
                id: `ia-upsell-tekki-${contact.id}`,
                contactId: contact.id,
                clientName: contact.full_name,
                clientPhone: contact.phone,
                type: 'upsell',
                title: `Upsell Pack Tekki : ${contact.full_name}`,
                description: 'Le client utilise Onyx Jaay. Proposez le Pack Tekki pour la gestion de stock et livreurs.',
                msg: `Bonjour ${contact.full_name}, votre boutique tourne bien avec Onyx Jaay ! Saviez-vous qu'avec le Pack Tekki, vous pouvez aussi gérer votre stock et vos livreurs automatiquement ?`
            });
        } else if (contact.activity?.toLowerCase().includes('resto') && contact.saas !== 'Onyx Menu' && !contact.active_saas?.includes('menu')) {
            suggestions.push({
                id: `ia-upsell-menu-${contact.id}`,
                contactId: contact.id,
                clientName: contact.full_name,
                clientPhone: contact.phone,
                type: 'upsell',
                title: `Proposer Onyx Menu : ${contact.full_name}`,
                description: 'Client dans la restauration sans le module Onyx Menu.',
                msg: `Bonjour ${contact.full_name}, pour votre restaurant, découvrez Onyx Menu : un menu QR interactif pour vos clients !`
            });
        } else if (contact.saas === 'Pack Tekki' && !contact.active_saas?.includes('formation')) {
            suggestions.push({
                id: `ia-upsell-tekkipro-${contact.id}`,
                contactId: contact.id,
                clientName: contact.full_name,
                clientPhone: contact.phone,
                type: 'upsell',
                title: `Upsell Tekki Pro : ${contact.full_name}`,
                description: 'Le client utilise Pack Tekki. Proposez Tekki Pro pour inclure la formation marketing.',
                msg: `Bonjour ${contact.full_name}, pour passer à la vitesse supérieure, le Pack Tekki Pro inclut notre académie marketing complète !`
            });
        } else if (contact.activity?.toLowerCase().includes('coiffure') || contact.activity?.toLowerCase().includes('beauté') || contact.activity?.toLowerCase().includes('salon')) {
           if (contact.saas !== 'Onyx Booking' && !contact.active_saas?.includes('booking')) {
              suggestions.push({
                  id: `ia-upsell-booking-${contact.id}`,
                  contactId: contact.id,
                  clientName: contact.full_name,
                  clientPhone: contact.phone,
                  type: 'upsell',
                  title: `Proposer Onyx Booking : ${contact.full_name}`,
                  description: 'Client dans les services sans le module Booking.',
                  msg: `Bonjour ${contact.full_name}, gagnez du temps en permettant à vos clients de prendre RDV en ligne avec paiement d'acompte grâce à Onyx Booking !`
              });
           }
        }
    });

    setIaSuggestions(suggestions);
    if (suggestions.length > 0) {
      setActiveView('planning-marketing');
      alert(`${suggestions.length} opportunité(s) générée(s) par l'IA. Veuillez les consulter dans le Planificateur.`);
    } else {
      alert("Scan IA terminé. Aucune nouvelle opportunité marketing détectée pour le moment.");
    }
  };

  const handleRelanceProspectsFroids = async () => {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const coldProspects = contacts.filter(c => 
        c.type === 'Prospect' && 
        new Date(c.created_at || new Date()) < fourteenDaysAgo
    );

    if (coldProspects.length === 0) return alert("Aucun prospect froid détecté (inactif depuis plus de 14 jours).");

    const newActions: IAAction[] = coldProspects.map(p => ({
        id: `ia-cold-${p.id}-${Date.now()}`,
        module: 'CRM',
        title: `Relance Prospect Froid : ${p.full_name}`,
        desc: `Prospect inactif depuis plus de 14 jours.`,
        date: todayStr,
        status: 'En attente',
        phone: p.phone,
        msg: `Bonjour ${p.full_name}, nous n'avons plus de vos nouvelles ! Avez-vous pu avancer sur votre projet de digitalisation ? Notre équipe OnyxOps est disponible pour vous accompagner si vous avez des questions.`
    }));

    await supabase.from('actions_ia').insert(newActions);
    setActionsIA(prev => [...newActions, ...prev]);

    alert(`${coldProspects.length} prospect(s) froid(s) détecté(s). Les actions de relance ont été ajoutées au Journal IA !`);
    setActiveView('journal-ia');
  };

  useEffect(() => {
    const close = (e: MouseEvent) => { if (leadActionsOpen && !(e.target as HTMLElement).closest('.lead-actions-wrap')) setLeadActionsOpen(null); };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [leadActionsOpen]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: adminEmail.trim(),
        password: adminPasswordInput,
      });
      if (error || !data.user) {
        alert("Identifiants administrateur incorrects.");
        setAdminUser(null);
      } else {
            if (data.user.email !== 'rokhydly@gmail.com') {
              alert("Accès refusé : vous n'avez pas les droits de Super-Administrateur.");
              await supabase.auth.signOut();
              setAdminUser(null);
              return;
            }
        setAdminUser(data.user);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('onyx_admin_session', '1');
        }
        fetchSupabaseData();
      }
    } catch (err: any) {
      alert("Erreur d'authentification : " + (err?.message || err));
    } finally {
      setAdminAuthLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div className={`flex h-screen w-full bg-black items-center justify-center font-sans`}>
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-t-4 border-l-4 border-[#39FF14] rounded-full animate-spin shadow-[0_0_20px_#39FF14]"></div>
          <div className="text-center">
            <img src="https://i.ibb.co/1Gssqd2p/LOGO-SITE.png" alt="Onyx Logo" width="350" height="250" className="w-[150px] h-auto object-contain mx-auto mb-2" />
            <p className="text-[10px] font-bold text-[#39FF14] uppercase tracking-widest mt-2 animate-pulse">Initialisation du Terminal de Contrôle...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black font-sans">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[3rem] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
          <h1 className="text-2xl font-black uppercase text-white tracking-tighter mb-2 text-center">
            Accès Administrateur
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em] text-center mb-8">
            Console Maître OnyxOps
          </p>
          <form onSubmit={handleAdminLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">
                Email
              </label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-xs text-white outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">
                Mot de passe
              </label>
              <input
                type="password"
                value={adminPasswordInput}
                onChange={(e) => setAdminPasswordInput(e.target.value)}
                required
                className="w-full p-4 bg-black border border-zinc-800 rounded-2xl font-bold text-xs text-white outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/40"
              />
            </div>
            <button
              type="submit"
              disabled={adminAuthLoading}
              className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {adminAuthLoading ? "Vérification..." : "Entrer dans le Terminal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleOutsideClick = (setter: any, val: any = false) => (e: any) => {
    if (e.target.id === "modal-overlay") { setter(val); }
  };

  const executeWA = async (phone: string | undefined, msg: string | undefined, idIA?: string) => {
    if(phone && msg) window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    if (idIA) {
      await supabase.from('actions_ia').update({ status: 'Réalisé' }).eq('id', idIA);
      setActionsIA(prev => prev.map(a => a.id === idIA ? { ...a, status: 'Réalisé' } : a));
    }
  };

  const executeAllWA = async () => {
    const pendingActions = actionsIA.filter(a => a.status === 'En attente' && a.phone);
    if (pendingActions.length === 0) return alert("Aucune action en attente avec un numéro valide.");
    if (!confirm(`Voulez-vous exécuter automatiquement ${pendingActions.length} actions ?\n\n(Remarque : Autorisez les pop-ups sur votre navigateur pour que toutes les fenêtres WhatsApp puissent s'ouvrir).`)) return;

    const ids = pendingActions.map(a => a.id);
    await supabase.from('actions_ia').update({ status: 'Réalisé' }).in('id', ids);
    setActionsIA(prev => prev.map(a => ids.includes(a.id) ? { ...a, status: 'Réalisé' } : a));

    pendingActions.forEach((a, i) => {
       setTimeout(() => {
          window.open(`https://wa.me/${a.phone!.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(a.msg!)}`, '_blank');
       }, i * 1500); // Délai de 1.5s entre chaque ouverture pour éviter le blocage strict du navigateur
    });
  };

  const replyToLead = (lead: any) => {
     const msg = `Bonjour ${lead.full_name}, je suis l'administrateur d'OnyxOps. J'ai bien reçu votre demande concernant "${lead.intent}". Comment puis-je vous aider ?`;
     window.open(`https://wa.me/${lead.phone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const runAbandonedCartsScan = async () => {
     const partials = leads.filter(l => (l.intent || '').toLowerCase().includes('partiel'));
     const completedLeads = leads.filter(l => !(l.intent || '').toLowerCase().includes('partiel'));

     // Vérification : Le prospect a-t-il finalement terminé son inscription ou est-il déjà client ?
     const trueAbandoned = partials.filter(p => {
        const isClient = contacts.some(c => c.phone === p.phone);
        const isCompletedLead = completedLeads.some(cl => cl.phone === p.phone && new Date(cl.created_at) >= new Date(p.created_at));
        return !isClient && !isCompletedLead;
     });

     // Nettoyage automatique silencieux des "faux abandons" (ceux qui ont fusionné)
     const falseAbandoned = partials.filter(p => !trueAbandoned.includes(p));
     if (falseAbandoned.length > 0) {
         for (const fa of falseAbandoned) {
             await supabase.from('leads').delete().eq('id', fa.id);
         }
         fetchSupabaseData(); // On met à jour l'affichage
     }

     if (trueAbandoned.length === 0) return alert("Aucun panier abandonné réel détecté. Les leads partiels convertis ont été automatiquement nettoyés.");
     
     const newActions: IAAction[] = trueAbandoned.map(p => ({
        id: `ia-abandon-${p.id}-${Date.now()}`,
        module: 'Relance Lead',
        title: `Panier Abandonné : ${p.full_name}`,
        desc: `Le prospect a commencé l'inscription sans la terminer. Intention : ${p.intent}`,
        date: todayStr,
        status: 'En attente',
        phone: p.phone,
        msg: `Bonjour ${p.full_name}, c'est Maïmouna d'OnyxOps. J'ai vu que vous aviez commencé votre inscription sans aller au bout, puis-je vous aider à la finaliser ?`
     }));
     
     await supabase.from('actions_ia').insert(newActions);
     setActionsIA(prev => [...newActions, ...prev]);
     
     alert(`${trueAbandoned.length} relance(s) de paniers abandonnés générée(s) et ajoutée(s) au Planificateur IA !`);
     setActiveView('journal-ia');
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Supprimer ce lead ?")) return;
    const { error } = await supabase.from('leads').delete().eq('id', id);
    if (error) alert("Erreur : " + error.message);
    else { fetchSupabaseData(); setLeadActionsOpen(null); }
  };

  const updateKanbanStatus = async (id: string, newStatus: string) => {
     const { error } = await supabase.from('clients').update({ status: newStatus }).eq('id', id);
     if (error) {
         alert(error.message);
     } else {
         const contact = contacts.find(c => c.id === id);
         
         if (newStatus === 'Signé' && contact) {
             // --- DÉCRÉMENTATION AUTO STOCK MATÉRIEL ---
             if (contact.saas === 'Onyx Modernize') {
                 const kitItem = hardwareStock.find(h => h.type === 'Kit' || h.name.includes('Modernize'));
                 if (kitItem && kitItem.qty > 0) {
                     await updateHardwareStock(kitItem.id, -1);
                     alert(`🎉 Félicitations ! Contrat Onyx Modernize signé pour ${contact.full_name}.\n📦 1 ${kitItem.name} a été automatiquement déduit de votre stock logistique.`);
                 } else if (kitItem && kitItem.qty <= 0) {
                     alert(`⚠️ Contrat signé pour ${contact.full_name}, mais attention : votre stock de Kits d'installation est à 0 !`);
                 }
             }

             // --- ACTION IA AUTO : CM & PUB ---
             if (contact.saas === 'Add-on CM Pub' || (contact.active_saas && contact.active_saas.includes('cmpub'))) {
                 const newAction: IAAction = {
                     id: `ia-cmpub-${contact.id}-${Date.now()}`,
                     module: 'Marketing',
                     title: `Onboarding CM & Pub : ${contact.full_name}`,
                     desc: `Le client a signé. Créer le groupe WhatsApp, demander les accès Meta Business et programmer l'appel de stratégie.`,
                     date: todayStr,
                     status: 'En attente',
                     phone: contact.phone,
                     msg: `Bonjour ${contact.full_name} ! L'équipe Marketing Onyx prend le relais. Nous venons de créer votre espace. Quand seriez-vous disponible pour notre appel de lancement (stratégie éditoriale) ?`
                 };
                 await supabase.from('actions_ia').insert([newAction]);
                 setActionsIA(prev => [newAction, ...prev]);
                 alert(`🎯 Action "Onboarding CM & Pub" automatiquement ajoutée au Journal IA pour ${contact.full_name}.`);
             }
         }
         fetchSupabaseData();
     }
  };

  const generateAcompte = (lead: any) => {
    const montant = lead.saas === 'Onyx Modernize' ? '150 000' : lead.saas === 'Onyx Boost' ? '75 000' : '25 000';
    const totalStr = montant + ' F CFA';
    
    const invoiceWindow = window.open("", "_blank");
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Facture Acompte - ${lead.full_name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #111; }
              .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; }
              .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .info-box h3 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 5px; }
              .info-box p { margin: 4px 0; font-size: 14px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { background-color: #000; color: #fff; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
              td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
              .totals { width: 50%; float: right; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #000; }
              .footer { clear: both; text-align: center; padding-top: 40px; font-size: 12px; color: #aaa; }
              @media print { body { padding: 0; margin: 0; -webkit-print-color-adjust: exact; } .invoice-box { box-shadow: none; border: none; width: 100%; max-width: 100%; padding: 15px; } }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="header">
                    <div style="display: flex; align-items: center; gap: 15px;">
                      <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="OnyxOps Logo" style="height: 40px; width: auto;" />
                      <div>
                        <h1>FACTURE D'ACOMPTE</h1>
                        <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #39FF14;">ONYX OPS</p>
                      </div>
                    </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                  <p style="margin: 0; font-size: 14px;"><strong>Réf:</strong> AC-${Date.now().toString().slice(-6)}</p>
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-box">
                  <h3>Facturé à</h3>
                  <p>${lead.full_name}</p>
                  <p>${lead.phone}</p>
                  ${lead.city ? `<p>${lead.city}</p>` : ''}
                </div>
                <div class="info-box" style="text-align: right;">
                  <h3>Informations de paiement</h3>
                <p>Lien sécurisé : pay.onyxlinks.com/acompte</p>
                  <p>Wave / Orange Money</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th style="text-align: center;">Qté</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Acompte Démarrage - ${lead.saas || 'Offre Onyx'}</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">${totalStr}</td>
                  </tr>
                </tbody>
              </table>

              <div class="totals">
                <div class="total-row">
                  <span>NET À PAYER</span>
                  <span>${totalStr}</span>
                </div>
              </div>
              
              <div class="footer">
                <p>Merci pour votre confiance !</p>
                <p>Ceci est un document généré électroniquement par OnyxOps.</p>
              </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }

    setTimeout(() => {
      const msg = `Bonjour ${lead.full_name},\n\nVoici votre facture d'acompte (${montant} F CFA) pour le démarrage de l'offre ${lead.saas || 'Onyx'}.\n\nLien de paiement sécurisé (Wave/OM) : https://pay.onyxlinks.com/acompte\n\nMerci de votre confiance !`;
      window.open(`https://wa.me/${(lead.phone||'').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 500);
  };

  const handleOpenQuoteModal = (lead: any) => {
    const saasPriceMap: any = {
       'Onyx Jaay': 13900, 'Pack Tekki': 22900, 'Pack Tekki Pro': 27900, 'Onyx CRM': 39900,
       'Pack Onyx CRM': 39900, 'Pack Onyx Gold': 59900, 'Add-on CM Pub': 49900,
       'Onyx Boost': 150000, 'Onyx Modernize': 300000
    };
    const monthly = saasPriceMap[lead.saas] || 13900;
    const isOneShot = lead.saas === 'Onyx Modernize' || lead.saas === 'Onyx Boost';
    const total = isOneShot ? monthly : (monthly * 12);
    const designation = isOneShot ? `Prestation Globale - ${lead.saas}` : `Abonnement Annuel (12 mois) - ${lead.saas || 'Offre Onyx'}`;
    
    setQuoteModal({ lead, designation, price: total });
  };

  const generateDevis = (lead: any, customDesignation?: string, customPrice?: number) => {
    const saasPriceMap: any = {
       'Onyx Jaay': 13900,
       'Pack Tekki': 22900,
       'Pack Tekki Pro': 27900,
       'Onyx CRM': 39900,
       'Pack Onyx CRM': 39900,
       'Pack Onyx Gold': 59900,
       'Add-on CM Pub': 49900,
       'Onyx Boost': 150000,
       'Onyx Modernize': 300000
    };
    
    const monthly = saasPriceMap[lead.saas] || 13900;
    const isOneShot = lead.saas === 'Onyx Modernize' || lead.saas === 'Onyx Boost';
    
    const total = customPrice !== undefined ? customPrice : (isOneShot ? monthly : (monthly * 12));
    const designation = customDesignation || (isOneShot ? `Prestation Globale - ${lead.saas}` : `Abonnement Annuel (12 mois) - ${lead.saas || 'Offre Onyx'}`);
    const totalStr = total.toLocaleString('fr-FR') + ' F CFA';

    const invoiceWindow = window.open("", "_blank");
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Devis Global - ${lead.full_name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #111; }
              .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; }
              .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .info-box h3 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 5px; }
              .info-box p { margin: 4px 0; font-size: 14px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { background-color: #000; color: #fff; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
              td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
              .totals { width: 50%; float: right; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #000; }
              .footer { clear: both; text-align: center; padding-top: 40px; font-size: 12px; color: #aaa; }
              @media print { body { padding: 0; margin: 0; -webkit-print-color-adjust: exact; } .invoice-box { box-shadow: none; border: none; width: 100%; max-width: 100%; padding: 15px; } }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="header">
                <div style="display: flex; align-items: center; gap: 15px;">
                  <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="OnyxOps Logo" style="height: 40px; width: auto;" />
                  <div>
                    <h1>DEVIS GLOBAL</h1>
                    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #39FF14;">ONYX OPS</p>
                  </div>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                  <p style="margin: 0; font-size: 14px;"><strong>Réf:</strong> DEV-${Date.now().toString().slice(-6)}</p>
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-box">
                  <h3>Adressé à</h3>
                  <p>${lead.full_name}</p>
                  <p>${lead.phone}</p>
                  ${lead.city ? `<p>${lead.city}</p>` : ''}
                </div>
                <div class="info-box" style="text-align: right;">
                  <h3>Informations de paiement</h3>
                  <p>Validité du devis : 30 jours</p>
                  <p>Wave / OM / Virement Bancaire</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th style="text-align: center;">Qté</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>${designation}</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">${totalStr}</td>
                  </tr>
                </tbody>
              </table>

              <div class="totals">
                <div class="total-row">
                  <span>NET À PAYER</span>
                  <span>${totalStr}</span>
                </div>
              </div>
              
              <div class="footer">
                <p>Merci pour votre confiance !</p>
                <p>Ceci est un document généré électroniquement par OnyxOps.</p>
              </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }

    setTimeout(() => {
      const msg = `Bonjour ${lead.full_name},\n\nVoici votre devis global pour l'offre ${lead.saas || 'Onyx'} (Montant total : ${totalStr}).\n\nN'hésitez pas si vous avez des questions pour valider votre déploiement !\n\nL'équipe OnyxOps.`;
      window.open(`https://wa.me/${(lead.phone||'').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 500);
  };

  const generateFactureFinale = (lead: any) => {
    const saasPriceMap: any = {
       'Onyx Jaay': 13900, 'Pack Tekki': 22900, 'Pack Tekki Pro': 27900, 'Onyx CRM': 39900,
       'Pack Onyx Gold': 59900, 'Add-on CM Pub': 49900, 'Onyx Boost': 150000, 'Onyx Modernize': 300000,
       'Onyx Tiak': 13900, 'Onyx Stock': 13900, 'Onyx Menu': 13900, 'Onyx Booking': 13900, 'Onyx Staff': 13900, 'Onyx Tontine': 6900
    };
    const activeSaasList = lead.active_saas && lead.active_saas.length > 0 ? lead.active_saas : (lead.saas ? [lead.saas] : []);
    let total = 0;
    const itemsHtml = activeSaasList.map((s: string) => {
       const price = saasPriceMap[s] || 13900;
       total += price;
       return `<tr><td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 14px;">Abonnement - ${s}</td><td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center; font-size: 14px;">1</td><td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">${price.toLocaleString('fr-FR')} F CFA</td></tr>`;
    }).join('');
    
    const totalStr = total.toLocaleString('fr-FR') + ' F CFA';

    const invoiceWindow = window.open("", "_blank");
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Facture Finale - ${lead.full_name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #111; }
              .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; }
              .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .info-box h3 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 5px; }
              .info-box p { margin: 4px 0; font-size: 14px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { background-color: #000; color: #fff; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
              .totals { width: 50%; float: right; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #000; }
              @media print { body { padding: 0; margin: 0; -webkit-print-color-adjust: exact; } .invoice-box { box-shadow: none; border: none; width: 100%; max-width: 100%; padding: 15px; } }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="header">
                <div style="display: flex; align-items: center; gap: 15px;">
                  <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="OnyxOps Logo" style="height: 40px; width: auto;" />
                  <div>
                    <h1>FACTURE</h1>
                    <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #39FF14;">ONYX OPS</p>
                  </div>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                  <p style="margin: 0; font-size: 14px;"><strong>Réf:</strong> FAC-${Date.now().toString().slice(-6)}</p>
                </div>
              </div>
              <div class="info-section">
                <div class="info-box">
                  <h3>Facturé à</h3><p>${lead.full_name}</p><p>${lead.phone}</p>
                  ${lead.city ? `<p>${lead.city}</p>` : ''}
                </div>
              </div>
              <table><thead><tr><th>Désignation</th><th style="text-align: center;">Qté</th><th style="text-align: right;">Total</th></tr></thead>
              <tbody>${itemsHtml || `<tr><td colspan="3" style="text-align:center; padding: 12px;">Aucun abonnement actif</td></tr>`}</tbody>
              </table>
              <div class="totals"><div class="total-row"><span>NET À PAYER</span><span>${totalStr}</span></div></div>
              <div style="clear: both; text-align: center; padding-top: 40px; font-size: 12px; color: #aaa;">
                <p>Merci pour votre confiance !</p><p>Document généré électroniquement par OnyxOps.</p>
              </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }
  };

  const generateProrataInvoice = (lead: any) => {
    const montant = lead.pending_prorata || 0;
    const totalStr = montant.toLocaleString('fr-FR') + ' F CFA';
    
    const invoiceWindow = window.open("", "_blank");
    if (invoiceWindow) {
      invoiceWindow.document.write(`
        <html>
          <head>
            <title>Facture Prorata - ${lead.full_name}</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px; color: #111; }
              .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
              .header h1 { font-size: 32px; font-weight: 900; margin: 0; text-transform: uppercase; }
              .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .info-box h3 { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 5px; }
              .info-box p { margin: 4px 0; font-size: 14px; font-weight: bold; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { background-color: #000; color: #fff; padding: 12px; text-align: left; font-size: 12px; text-transform: uppercase; }
              td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
              .totals { width: 50%; float: right; background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .total-row { display: flex; justify-content: space-between; font-size: 16px; font-weight: 900; color: #000; }
              .footer { clear: both; text-align: center; padding-top: 40px; font-size: 12px; color: #aaa; }
              @media print { body { padding: 0; margin: 0; -webkit-print-color-adjust: exact; } .invoice-box { box-shadow: none; border: none; width: 100%; max-width: 100%; padding: 15px; } }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              <div class="header">
                    <div style="display: flex; align-items: center; gap: 15px;">
                      <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="OnyxOps Logo" style="height: 40px; width: auto;" />
                      <div>
                        <h1>FACTURE RÉGULARISATION</h1>
                        <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold; color: #39FF14;">ONYX OPS</p>
                      </div>
                    </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-size: 14px;"><strong>Date:</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
                  <p style="margin: 0; font-size: 14px;"><strong>Réf:</strong> PR-${Date.now().toString().slice(-6)}</p>
                </div>
              </div>
              
              <div class="info-section">
                <div class="info-box">
                  <h3>Facturé à</h3>
                  <p>${lead.full_name}</p>
                  <p>${lead.phone}</p>
                  ${lead.city ? `<p>${lead.city}</p>` : ''}
                </div>
                <div class="info-box" style="text-align: right;">
                  <h3>Informations de paiement</h3>
              <p>Lien sécurisé : pay.onyxlinks.com/prorata</p>
                  <p>Wave / Orange Money</p>
                </div>
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Désignation</th>
                    <th style="text-align: center;">Qté</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Upgrade vers ${lead.saas} - Prorata mois en cours</td>
                    <td style="text-align: center;">1</td>
                    <td style="text-align: right;">${totalStr}</td>
                  </tr>
                </tbody>
              </table>

              <div class="totals">
                <div class="total-row">
                  <span>NET À PAYER</span>
                  <span>${totalStr}</span>
                </div>
              </div>
              
              <div class="footer">
                <p>Merci pour votre confiance !</p>
                <p>Ceci est un document généré électroniquement par OnyxOps.</p>
              </div>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      invoiceWindow.document.close();
    }

    setTimeout(() => {
      const msg = `Bonjour ${lead.full_name},\n\nSuite à l'évolution de votre abonnement vers l'offre ${lead.saas}, voici votre facture de régularisation au prorata d'un montant de ${totalStr}.\n\nLien de paiement sécurisé (Wave/OM) : https://pay.onyxlinks.com/prorata\n\nMerci de votre confiance !`;
      window.open(`https://wa.me/${(lead.phone||'').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    }, 500);
  };

  const markProrataPaid = async (client: any) => {
    if (!confirm(`Confirmez-vous le paiement du prorata de ${client.pending_prorata?.toLocaleString('fr-FR')} F pour ${client.full_name} ?`)) return;
    
    // Les colonnes pending_prorata, prorata_history, previous_saas ne sont pas dans le cache du schéma
    // Nous les traitons uniquement en état local pour éviter l'erreur Supabase.
    setContacts(prev => prev.map(c => c.id === client.id ? { ...c, pending_prorata: 0 } : c));
    alert("Paiement validé avec succès !");
  };

  const cancelProrata = async (client: any) => {
    if (!confirm(`Voulez-vous annuler l'upgrade vers ${client.saas} pour ${client.full_name} et le ramener à son ancienne offre (${client.previous_saas || 'Aucune'}) ?`)) return;
    const revertSaas = client.previous_saas || '';
    const { error } = await supabase.from('clients').update({ saas: revertSaas }).eq('id', client.id);
    if (error) alert("Erreur lors de l'annulation : " + error.message);
    else { 
      alert("Prorata annulé et offre restaurée avec succès !"); 
      setContacts(prev => prev.map(c => c.id === client.id ? { ...c, pending_prorata: 0, saas: revertSaas } : c));
      fetchSupabaseData(); 
    }
  };

  const handleExportCrmPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Liste des Membres CRM - OnyxOps", 14, 22);
    doc.setFontSize(11);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    const tableColumn = ["Nom & Prénom", "Téléphone", "Statut / Type", "SaaS Actif"];
    const tableRows = filteredContacts.map(c => [
      c.full_name || 'N/A',
      c.phone || 'N/A',
      c.type || 'N/A',
      c.saas || 'Aucun'
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
    });

    doc.save(`Onyx_CRM_Membres_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // --- EXPORTS ÉQUIPE COMMERCIALE ---
  const handleExportCommercialsPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Performances Équipe Commerciale - OnyxOps", 14, 22);
    doc.setFontSize(11);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    const tableColumn = ["Commercial", "Contact", "Clics", "Ventes", "Taux Conv.", "CA Généré", "Dernière Vente", "Statut"];
    const tableRows = commercials.map(comm => {
        const commClients = contacts.filter(c => ((c.commercial_id && String(c.commercial_id) === String(comm.id)) || c.assigned_to === comm.full_name) && c.type?.trim().toLowerCase() === 'client');
        const repSales = commClients.length;
        const caTotal = commClients.reduce((acc, c) => acc + getSaasPrice(c.saas || ''), 0);
        const lastSaleDate = repSales > 0 ? new Date(Math.max(...commClients.map(c => new Date(c.created_at || 0).getTime()))).toLocaleDateString('fr-FR') : '-';
        const convRate = (comm.clicks || 0) > 0 ? ((repSales / comm.clicks) * 100).toFixed(1) + '%' : '0%';
        return [comm.full_name, comm.phone, (comm.clicks || 0).toString(), repSales.toString(), convRate, `${caTotal.toLocaleString('fr-FR')} F`, lastSaleDate, comm.status || 'Actif'];
    });

    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 40, theme: 'grid', headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] } });
    doc.save(`Onyx_Commerciaux_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportCommercialsExcel = () => {
    if (commercials.length === 0) return alert("Aucun commercial à exporter.");
    const exportData = commercials.map(comm => {
        const commClients = contacts.filter(c => ((c.commercial_id && String(c.commercial_id) === String(comm.id)) || c.assigned_to === comm.full_name) && c.type?.trim().toLowerCase() === 'client');
        const repSales = commClients.length;
        const caTotal = commClients.reduce((acc, c) => acc + getSaasPrice(c.saas || ''), 0);
        const lastSaleDate = repSales > 0 ? new Date(Math.max(...commClients.map(c => new Date(c.created_at || 0).getTime()))).toLocaleDateString('fr-FR') : '-';
        const convRate = (comm.clicks || 0) > 0 ? ((repSales / comm.clicks) * 100).toFixed(1) + '%' : '0%';
        return { 
            'Nom Complet': comm.full_name, 'Téléphone': comm.phone, 'Objectif (Ventes)': comm.objective || 20, 
            'Clics Générés': comm.clicks || 0,
            'Ventes Validées': repSales, 'Taux de Conversion': convRate, 'CA Généré (F CFA)': caTotal, 'Dernière Vente': lastSaleDate, 'Statut': comm.status || 'Actif' 
        };
    });
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Équipe Commerciale");
    XLSX.writeFile(workbook, `Onyx_Commerciaux_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const updateLeadAssignee = async (id: string, assignee: string) => {
    const { error } = await supabase.from('clients').update({ assigned_to: assignee }).eq('id', id);
    if (error) {
        alert("Erreur lors de l'assignation : " + error.message);
    } else {
        fetchSupabaseData(); // Refresh data to show the change
    }
  };

  const updateLeadBudget = async (id: string, budget: string) => {
    const { error } = await supabase.from('clients').update({ budget }).eq('id', id);
    if (error) {
        alert("Erreur lors de la mise à jour du budget : " + error.message);
    } else {
        fetchSupabaseData(); // Rafraîchit silencieusement pour ne pas perturber l'utilisateur
    }
  };

  const handleUpdateWithdrawalStatus = async (id: string, newStatus: string, proof?: string) => {
      if (newStatus === 'Rejeté') {
         if (!confirm(`Confirmez-vous le rejet de cette demande ?`)) return;
      }
      try {
        const updatePayload: any = { status: newStatus };
        if (proof) updatePayload.proof = proof;
        
        const { error } = await supabase.from('withdrawals').update(updatePayload).eq('id', id);
        if (error) throw error;
        setWithdrawals(prev => prev.map(w => w.id === id ? { ...w, status: newStatus, proof: proof || w.proof } : w));
        
        // --- NOTIFICATION WHATSAPP ---
        const withdrawal = withdrawals.find(w => w.id === id);
        if (withdrawal && withdrawal.phone) {
           const msg = newStatus === 'Payé'
              ? `Bonjour ${withdrawal.ambassador_name || ''} 🎉\n\nVotre demande de retrait de ${withdrawal.amount?.toLocaleString()} F via ${withdrawal.method} a été VALIDÉE et le transfert a été effectué.\n${proof ? `Preuve / Réf : ${proof}\n\n` : '\n'}Merci pour votre excellent travail !\nL'équipe OnyxOps.`
              : `Bonjour ${withdrawal.ambassador_name || ''},\n\nVotre demande de retrait de ${withdrawal.amount?.toLocaleString()} F via ${withdrawal.method} a été REJETÉE.\n\nVeuillez nous contacter ou vérifier vos informations de paiement.\nL'équipe OnyxOps.`;

           if (confirm(`Statut mis à jour.\nVoulez-vous envoyer une notification WhatsApp à l'ambassadeur ?`)) {
              const cleanPhone = withdrawal.phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
              const phoneWithPrefix = cleanPhone.startsWith('221') ? cleanPhone : `221${cleanPhone}`;
              window.open(`https://wa.me/${phoneWithPrefix}?text=${encodeURIComponent(msg)}`, '_blank');
           }
        }
      } catch (err: any) {
        alert("Erreur: " + err.message);
      }
  };

  const handleExportWithdrawals = () => {
      const paidWithdrawals = withdrawals.filter(w => w.status === 'Payé');
      if (paidWithdrawals.length === 0) return alert("Aucun retrait payé à exporter.");

      const dataToExport = paidWithdrawals.map(w => ({
        "Date": new Date(w.created_at).toLocaleString('fr-FR'),
        "Ambassadeur": w.ambassador_name || "Inconnu",
        "Méthode": w.method,
        "Numéro": w.phone,
        "Montant (F CFA)": w.amount,
        "Preuve/Réf": w.proof || "N/A"
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Retraits Payés");
      XLSX.writeFile(workbook, `Retraits_Payes_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const getLeadPriorityActions = (lead: any) => {
   const actions = {
     client: { label: "Créer Compte Client", fn: () => setShowProductModal({ lead, type: 'client' }) },
     ambassador: { label: "Créer Compte Ambassadeur", fn: () => handleCreateAccount(lead, 'ambassadeur') },
     reply: { label: "Répondre (Simple)", fn: () => replyToLead(lead) },
     invite: { label: "Lien d'invitation auto", fn: () => {
        const url = `https://onyxlinks.com/?invite_name=${encodeURIComponent(lead.full_name || '')}&invite_phone=${encodeURIComponent(lead.phone || '')}&invite_pack=${encodeURIComponent(lead.saas || '')}`;
        navigator.clipboard.writeText(url);
        alert("Lien d'invitation pré-rempli copié ! Envoyez-le au prospect.");
     }}
   };

   const intent = (lead.intent || '').toLowerCase();
   if (intent.includes('ambassadeur') || intent.includes('partenaire')) {
     return [actions.ambassador, actions.reply, actions.client];
   }
   return [actions.client, actions.reply, actions.invite, actions.ambassador];
  };

  const planifyCrmAction = async (title: string, desc: string, phone: string, msg: string) => {
   const newAction: IAAction = { id: Date.now().toString(), module: 'CRM', title, desc, date: todayStr, status: 'En attente', phone, msg };
   
   await supabase.from('actions_ia').insert([newAction]);
   setActionsIA(prev => [newAction, ...prev]);
   
   alert("Action planifiée avec succès dans le Journal IA !");
};

  const handleAddSaasToContact = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSaas = e.target.value;
      if (!newSaas) return;
      let currentActive = editingContact?.active_saas || [];
      if (currentActive.includes(newSaas)) return;
      const newExpDate = new Date();
      newExpDate.setMonth(newExpDate.getMonth() + 1);
      const expDateStr = newExpDate.toISOString().split('T')[0];
      let msg = "";
      let saasToRemove: string[] = [];
      
      if (newSaas === 'OnyxTekki (Resto)' && currentActive.includes('Onyx Menu')) {
          saasToRemove.push('Onyx Menu');
          msg = `Upgrade détecté. L'abonnement Onyx Menu a été absorbé par le pack OnyxTekki (Resto). Facturation au prorata requise.`;
      } else if ((newSaas.includes('Pack') || newSaas.includes('OnyxTekki')) && currentActive.some(s => s.includes('Onyx Jaay') || s.includes('Solo'))) {
          msg = `Upgrade détecté vers ${newSaas}. Calcul du prorata sur les jours restants de l'offre actuelle.`;
      } else {
          msg = `Nouvelle offre ajoutée : ${newSaas}. Fin prévue le ${newExpDate.toLocaleDateString('fr-FR')}.`;
      }
      
      currentActive = currentActive.filter(s => !saasToRemove.includes(s));
      const newDates = { ...(editingContact?.saas_expiration_dates || {}) };
      saasToRemove.forEach(s => delete newDates[s]);
      newDates[newSaas] = expDateStr;

      setEditingContact(prev => ({
          ...prev, active_saas: [...currentActive, newSaas], saas_expiration_dates: newDates
      }));
      setProrataMsg(msg);
  };

  const handleRemoveSaasFromContact = (saasToRemove: string) => {
      setEditingContact(prev => {
          const newActive = (prev.active_saas || []).filter(s => s !== saasToRemove);
          const newDates = { ...(prev.saas_expiration_dates || {}) };
          delete newDates[saasToRemove];
          return { ...prev, active_saas: newActive, saas_expiration_dates: newDates };
      });
      setProrataMsg(`Offre ${saasToRemove} retirée.`);
  };

  const handleSaasDateChange = (saas: string, date: string) => {
      setEditingContact(prev => ({
          ...prev, saas_expiration_dates: { ...(prev.saas_expiration_dates || {}), [saas]: date }
      }));
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
  if (!editingContact.full_name || !editingContact.phone) return alert("Nom et Téléphone requis");
  
  let phoneClean = (editingContact.phone || "").replace(/\s+/g, "");
  if (phoneClean.length === 9 && /^(7[05678]\d{7})$/.test(phoneClean)) {
      phoneClean = `+221${phoneClean}`;
  }

  let finalExpDate = editingContact.expiration_date;
  if (!finalExpDate) {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      finalExpDate = d.toISOString().split('T')[0];
  }

  const payload: any = {
    full_name: editingContact.full_name,
    phone: phoneClean,
    password_temp: editingContact.password_temp || 'central2026',
    type: editingContact.type || 'Client',
    status: editingContact.status || 'Client',
    saas: editingContact.saas || '',
    active_saas: editingContact.active_saas || [],
    saas_expiration_dates: editingContact.saas_expiration_dates || {},
    address: editingContact.address || '',
    city: editingContact.city || '',
    activity: editingContact.activity || '',
    avatar_url: editingContact.avatar_url || '',
    expiration_date: finalExpDate,
    source: editingContact.source || 'Admin',
    updated_at: new Date().toISOString()
  };

  // Si c'est une modification, on garde l'ID pour mettre à jour
  try {
    if (editingContact.id) {
      payload.id = editingContact.id;
      const { error } = await supabase.from('clients').upsert(payload);
      if (error) throw error;
    } else {
      // Nouveau client => Passage par l'API pour créer l'authentification
      const res = await fetch('/api/create-user', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
             phone: phoneClean,
             fullName: editingContact.full_name,
             role: 'client',
             password: editingContact.password_temp || 'central2026',
             saas: editingContact.saas
         })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erreur lors de la création d'accès Supabase");
      
      // Mise à jour de la table clients avec tous les champs supplémentaires
      await supabase.from('clients').update(payload).eq('id', result.user.id);
    }

  // SUPPRIMER LE LEAD ASSOCIÉ POUR NETTOYER L'INBOX
  if (phoneClean) {
    await supabase.from('leads').delete().eq('phone', phoneClean);
  }

  setShowContactModal(false);
  fetchSupabaseData(); // Rafraîchit l'affichage
  alert("Fiche CRM enregistrée avec succès !");
  } catch (err: any) {
     alert("Erreur: " + err.message);
  }
};

  const approveAmbassador = async (id: string) => {
    try {
      const amb = partners.find(p => p.id === id);
      const { error } = await supabase
        .from('ambassadors')
        .update({ status: 'Actif', password_temp: 'central2026' })
        .eq('id', id);
        
      if (error) throw error;
      
      // Mise à jour de l'interface en temps réel
      setPartners(prev => prev.map(amb => amb.id === id ? { ...amb, status: 'Actif' } : amb));

      // Notifications Push Navigateur
      if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
              new Notification('Ambassadeur Validé', { body: `${amb?.full_name} a été validé et est maintenant actif !` });
          } else if (Notification.permission !== 'denied') {
              Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                      new Notification('Ambassadeur Validé', { body: `${amb?.full_name} a été validé et est maintenant actif !` });
                  }
              });
          }
      }

      alert("Ambassadeur validé avec succès !");

      if (amb && confirm(`Voulez-vous envoyer une notification WhatsApp à ${amb.full_name} pour confirmer son activation ?`)) {
          const msg = `Félicitations ${amb.full_name} ! 🎉\n\nVotre candidature Ambassadeur Onyx a été validée avec succès.\nVous pouvez maintenant vous connecter à votre Hub partenaire pour récupérer votre lien d'affiliation et commencer à générer des revenus.\n\n🔗 *Lien de connexion :* https://onyxlinks.com/ambassadeurs/login\n📱 *Identifiant :* ${amb.contact}\n🔑 *Code PIN :* 0000`;
          window.open(`https://wa.me/${(amb.contact || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
      }
    } catch (error: any) {
      console.error("Erreur validation:", error);
      alert("Erreur lors de la validation.");
    }
  };

  const handleAddCommercial = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCommercialForm.full_name || !newCommercialForm.phone) return;
      setIsCreatingUser(true);
      try {
          let cleanPhone = newCommercialForm.phone.replace(/\s+/g, '');
          if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
              cleanPhone = `+221${cleanPhone}`;
          } else if (!cleanPhone.startsWith('+')) {
              cleanPhone = `+${cleanPhone}`;
          }

          // Appel de l'API sécurisée pour créer l'utilisateur Auth + le profil
          const res = await fetch('/api/create-user', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  phone: cleanPhone,
                  fullName: newCommercialForm.full_name,
                  role: 'commercial',
                  objective: newCommercialForm.objective || 20
              })
          });
          
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || "Erreur lors de la création du compte.");
          
          alert(`Commercial ${newCommercialForm.full_name} créé ! Il peut se connecter avec le PIN 0000.`);
          setShowAddCommercialModal(false);
          setNewCommercialForm({ full_name: '', phone: '', objective: 20 });
          fetchSupabaseData();
      } catch (err: any) {
          alert(err.message);
      } finally {
          setIsCreatingUser(false);
      }
  };

  const handleUpdateCommercial = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          let cleanPhone = editCommercialForm.phone.replace(/\s+/g, '');
          if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
              cleanPhone = `+221${cleanPhone}`;
          } else if (!cleanPhone.startsWith('+')) {
              cleanPhone = `+${cleanPhone}`;
          }

          const { error } = await supabase.from('commercials').update({
              full_name: editCommercialForm.full_name,
              phone: cleanPhone,
              status: editCommercialForm.status,
              password_temp: editCommercialForm.password_temp,
              objective: editCommercialForm.objective || 20
          }).eq('id', editCommercialForm.id);

          if (error) throw error;
          
          alert("Commercial mis à jour avec succès !");
          setShowEditCommercialModal(false);
          fetchSupabaseData();
      } catch (err: any) {
          alert("Erreur : " + err.message);
      }
  };

  const handleAddManualCommission = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
          const amount = parseInt(commissionAmount);
          if (isNaN(amount) || amount <= 0) throw new Error("Veuillez entrer un montant valide.");
          
          const currentCommission = commissionModal.manual_commission || 0;
          const { error } = await supabase.from('commercials').update({ manual_commission: currentCommission + amount }).eq('id', commissionModal.id);
          
          if (error) throw error;
          
          alert(`Prime de ${amount.toLocaleString('fr-FR')} F attribuée avec succès à ${commissionModal.full_name} !`);
          setCommissionModal(null);
          setCommissionAmount('');
          fetchSupabaseData();
      } catch (err: any) {
          alert("Erreur : " + err.message);
      }
  };

  const handleResetCommercialPin = () => {
      setEditCommercialForm({ ...editCommercialForm, password_temp: 'central2026' });
      alert("Le PIN a été réinitialisé à 0000 (central2026). Cliquez sur Enregistrer pour valider.");
  };

  const handleConvertPartnerToClient = async () => {
      if(!selectedPartner || !supabase) return;
      const { error } = await supabase.from('clients').insert({
        full_name: selectedPartner.full_name,
        phone: selectedPartner.contact,
        type: 'Client',
        status: 'Converti Ambassadeur',
        activity: selectedPartner.activity || ''
      });
      if(error) alert(error.message);
      else { alert("Ambassadeur ajouté au CRM Clients !"); fetchSupabaseData(); }
  };

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title || !newMaterial.url) {
        alert("Le titre et l'URL sont requis.");
        return;
    }
    const { error } = await supabase.from('marketing_materials').insert([newMaterial]);
    if (error) {
        alert("Erreur lors de l'ajout de la ressource: " + error.message);
    } else {
        setNewMaterial({ title: '', type: 'Canva', url: '' });
        fetchSupabaseData();
        alert("Ressource ajoutée avec succès !");
    }
  };

  const handleUpdateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial.title || !editingMaterial.url) return;
    const { error } = await supabase.from('marketing_materials').update({
        title: editingMaterial.title, type: editingMaterial.type, url: editingMaterial.url
    }).eq('id', editingMaterial.id);
    if (error) alert("Erreur: " + error.message);
    else {
        setEditingMaterial(null);
        fetchSupabaseData();
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette ressource ?")) return;
    const { error } = await supabase.from('marketing_materials').delete().eq('id', id);
    if (error) {
        alert("Erreur lors de la suppression: " + error.message);
    } else {
        fetchSupabaseData();
    }
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!supabase) return;
    const { error } = await supabase.from('ambassadors').update({
        full_name: editPartnerForm.full_name,
        contact: editPartnerForm.contact,
        city: editPartnerForm.city,
        country: editPartnerForm.country,
        address: editPartnerForm.address,
        status: editPartnerForm.status,
        current_status: editPartnerForm.current_status,
        sales_experience: editPartnerForm.sales_experience,
        revenue_objective: editPartnerForm.revenue_objective,
        account_status: editPartnerForm.status
    }).eq('id', editPartnerForm.id);
    
    if (error) alert("Erreur : " + error.message);
    else {
        setShowEditPartnerModal(false);
        fetchSupabaseData();
        alert("Ambassadeur mis à jour !");
    }
  };

  // NOUVEAU : Fonction pour ajouter un ambassadeur manuellement (Étape B)
  const handleAddPartner = async (e: React.FormEvent) => {
   e.preventDefault();
   if(!supabase) return;
   
   // On prépare la donnée pour correspondre exactement à ta table Supabase
   const payload = { 
       full_name: newPartnerForm.full_name, 
       phone: newPartnerForm.phone, 
       city: newPartnerForm.city,
       country: newPartnerForm.country,
       address: newPartnerForm.address,
       profession: newPartnerForm.profession,
       experience: newPartnerForm.experience,
       revenue_goal: newPartnerForm.revenue_goal,
       strategy: newPartnerForm.strategy,
       status: 'Actif', 
       sales: 0,
       revenue: '0 F',
       password_temp: 'central2026'
   };

   // ATTENTION: On pointe bien vers la table "ambassadors" et plus "partners"
   const { error } = await supabase.from('ambassadors').insert([payload]);
   
   if (error) alert("Erreur lors de l'enregistrement : " + error.message);
   else {
       setShowAddPartnerModal(false);
       // On reset le formulaire
       setNewPartnerForm({ full_name: '', phone: '', city: 'Dakar', country: 'Sénégal', address: '', profession: '', experience: '', revenue_goal: '', strategy: '' });
       fetchSupabaseData(); // Recharge la liste
       alert("Ambassadeur activé et enregistré dans la base !");
   }
};
  const handleCreateSaasAccount = async () => {
     if (!supabase || !showSaasLogin) return; 
     if (saasCreateType === 'manual' && (!saasCreateForm.name || !saasCreateForm.phone || !saasCreateForm.password)) return alert("Veuillez remplir tous les champs.");
     
     let targetPhone = saasCreateForm.phone;
     let targetName = saasCreateForm.name;
     if (saasCreateType === 'prospect') {
        const p = contacts.find(c => c.id === saasCreateForm.prospectId);
        if(p) { targetPhone = p.phone; targetName = p.full_name; }
     }

     let cleanPhone = targetPhone.replace(/\s+/g, '');
     if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
         cleanPhone = `+221${cleanPhone}`;
     } else if (!cleanPhone.startsWith('+')) {
         cleanPhone = `+${cleanPhone}`;
     }
     
     const msg = `Félicitations ${targetName} ! Votre espace ${showSaasLogin.name} est actif.\nLien : https://${showSaasLogin.id}.onyxops.com\nIdentifiant : ${targetPhone}\nMot de passe : ${saasCreateForm.password}`;
     
     try {
       const res = await fetch('/api/create-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              phone: cleanPhone,
              fullName: targetName,
              role: 'client',
              password: saasCreateForm.password,
              saas: showSaasLogin.name
          })
       });
       const result = await res.json();
       if (!res.ok) throw new Error(result.error || "Erreur de création d'accès.");

     alert(`Compte ${showSaasLogin.name} créé et enregistré !`);
     setShowSaasLogin(null);
     fetchSupabaseData();
     window.open(`https://wa.me/${targetPhone?.replace(/[^0-9]/g, '') || ''}?text=${encodeURIComponent(msg)}`, '_blank');
     } catch(err:any) {
         alert("Erreur: " + err.message);
     }
  };

  const handleFixMissingExpiryDates = async () => {
    if (!confirm("Voulez-vous attribuer une date d'expiration (1 mois après création) à tous les clients qui n'en ont pas ?")) return;
    
    let updatedCount = 0;
    for (const client of contacts) {
       if (client.type === 'Client' && !client.expiration_date) {
           const creationDate = client.created_at ? new Date(client.created_at) : new Date();
           creationDate.setMonth(creationDate.getMonth() + 1);
           await supabase.from('clients').update({ expiration_date: creationDate.toISOString().split('T')[0] }).eq('id', client.id);
           updatedCount++;
       }
    }
    alert(`${updatedCount} clients mis à jour avec succès !`);
    fetchSupabaseData();
  };

  const saveAdminProfile = async () => {
     if (newPassword && newPassword !== confirmPassword) {
       alert("Les mots de passe ne correspondent pas.");
       return;
     }
     if (newPassword && newPassword.length < 6) {
       alert("Le mot de passe doit contenir au moins 6 caractères.");
       return;
     }
     try {
       if (newPassword) {
         const { error } = await supabase.auth.updateUser({ password: newPassword });
         if (error) throw error;
         setNewPassword("");
         setConfirmPassword("");
       }
       setAdminProfile({ ...tempAdminProfile });
       alert("Profil synchronisé avec succès dans le terminal !");
       setShowProfileModal(false);
     } catch (err: any) {
       alert("Erreur : " + (err?.message || err));
     }
  };

  const runIAArticleSuggestion = async () => {
   const suggestions = [
     { title: 'BOOSTER SES VENTES WHATSAPP AVEC L\'IA', desc: 'Scripts de vente générés par IA pour augmenter vos taux de conversion.', category: 'Stratégie', cible: 'Tous' },
     { title: 'CRÉER L\'URGENCE SUR SES OFFRES (FOMO)', desc: 'Comment formuler des messages qui poussent à l\'achat immédiat.', category: 'Copywriting', cible: 'E-commerce' },
     { title: 'RELANCER UN PROSPECT FROID', desc: 'Le modèle exact en 3 messages pour réactiver un contact inactif.', category: 'Relance', cible: 'Services' },
     { title: 'AUTOMATISER SON SERVICE CLIENT', desc: 'Les 5 réponses automatiques pour gagner 2h par jour sur WhatsApp.', category: 'Automatisation', cible: 'SaaS' }
   ];
   
   const randomIdea = suggestions[Math.floor(Math.random() * suggestions.length)];
   const newArt = { id: Date.now().toString(), ...randomIdea };
   
   await supabase.from('marketing_articles').insert([newArt]);
   setMarketingArticles(prev => [newArt, ...prev]);
   alert("Intelligence Artificielle : Nouvel article suggéré et ajouté au pipeline.");
};

  const scheduleMarketingDiffusion = async () => {
      if(selectedContactsForDiffusion.length === 0) return alert("Sélectionnez au moins un contact pour la diffusion.");
      const newAction: IAAction = { id: Date.now().toString(), module: 'Marketing', title: `Diffusion : ${showDiffusionModal?.title}`, desc: `Envoi programmé à ${selectedContactsForDiffusion.length} contacts via le canal WhatsApp.`, date: todayStr, status: 'En attente' };
      await supabase.from('actions_ia').insert([newAction]);
      setActionsIA(prev => [newAction, ...prev]);
      setShowDiffusionModal(null);
      alert(`Diffusion planifiée avec succès pour ${selectedContactsForDiffusion.length} membres.`);
  };

  // NOUVELLE FONCTION: Ouvre la modale pour un nouveau client avec date +7j par défaut
  const openNewClientModal = () => {
    const trialEndDate = new Date();
    trialEndDate.setMonth(trialEndDate.getMonth() + 1); // 1 mois
    
    setEditingContact({
      full_name: "",
      phone: "",
      password_temp: "",
      active_saas: [],
      saas_expiration_dates: {},
      expiration_date: trialEndDate.toISOString().split('T')[0],
      type: "Prospect",
      saas: "",
      activity: "",
      source: "Admin",
    });
    setShowContactModal(true);
    setProrataMsg("");
  };

  const runAutomatedFollowUps = async () => {
    setIsAutomating(true);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newActions: IAAction[] = [];

    for (const contact of contacts) {
        if (!contact.expiration_date) continue;
        const expirationDate = new Date(contact.expiration_date);
        expirationDate.setHours(0, 0, 0, 0);

        const diffTime = expirationDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let message = '';
        let subject = '';
        let step = '';

        if (contact.type === 'Prospect' || contact.type === 'Essai') {
            if (diffDays === 2) {
                step = 'Étape 1 (Essai J-2)';
                subject = `[OnyxOps] Votre essai gratuit expire bientôt`;
                message = `Bonjour ${contact.full_name}, votre essai gratuit expire dans 48h. Prêt à passer à la vitesse supérieure ?`;
            } else if (diffDays === 0) {
                step = 'Étape 2 (Essai J-0)';
                subject = `[OnyxOps] Dernière chance pour votre essai`;
                message = `Dernière chance ! Votre accès OnyxOps se termine ce soir.`;
            }
        } else if (contact.type === 'Client') {
            if (diffDays === 2) {
                step = 'Étape 3 (Client J-2)';
                const renewalDate = new Date(expirationDate);
                renewalDate.setDate(renewalDate.getDate() + 1); 
                subject = `[OnyxOps] Rappel de renouvellement`;
                message = `Rappel : Votre abonnement se renouvelle automatiquement le ${renewalDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })}.`;
            }
        }
        
        if (message) {
            const newAction: IAAction = {
                id: `ia-${Date.now()}-${contact.id}`,
                module: 'IA-SCAN',
                title: `${step}: ${contact.full_name}`,
                desc: message,
                date: todayStr,
                status: 'Auto-généré',
                phone: contact.phone,
                msg: message,
            };
            newActions.push(newAction);

            try {
                await fetch('/api/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subject: subject,
                        text: message,
                        html: `<p><b>Action IA:</b> ${step}</p><p><b>Client:</b> ${contact.full_name}</p><p><b>Message:</b> ${message}</p>`,
                    }),
                });
            } catch (error) {
                console.error(`Failed to send email for ${contact.full_name}:`, error);
            }
        }
    }

    if (newActions.length > 0) {
        await supabase.from('actions_ia').insert(newActions);
        setActionsIA(prev => [...newActions, ...prev]);
        alert(`${newActions.length} relance(s) automatique(s) scannée(s) et ajoutée(s) au Journal IA. Une copie a été envoyée sur rokhydly@gmail.com.`);
    } else {
        alert('Scan IA terminé. Aucun lead ne correspondait aux critères de relance (J-2, J-0).');
    }
    
    setShowRapportIA(false);
    setIsAutomating(false);
  };

  // --- CALCULS POUR LA VUE STATISTIQUES ---
  const conversionRate = (stats.activeClients + stats.pendingLeads) > 0 ? (stats.activeClients / (stats.activeClients + stats.pendingLeads)) * 100 : 0;

  const saasCounts = contacts
    .filter(c => c.type === 'Client' && c.saas)
    .reduce((acc, c) => {
      const saasName = c.saas || 'Non défini';
      acc[saasName] = (acc[saasName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

  const popularSaas = Object.keys(saasCounts).length > 0 ? Object.entries(saasCounts).sort((a, b) => b[1] - a[1])[0][0] : 'N/A';

  const topAmbassador = partners.length > 0 ? [...partners].sort((a, b) => (b.sales || 0) - (a.sales || 0))[0] : null;

  const avgRevenuePerClient = stats.activeClients > 0 ? stats.revenue / stats.activeClients : 0;

  const newClientsByMonth = contacts
    .filter(c => c.type === 'Client' && c.created_at)
    .reduce((acc, c) => {
      const date = new Date(c.created_at);
      if (!isNaN(date.getTime())) {
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthLabel = date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' });
        if (!acc[monthKey]) {
          acc[monthKey] = { label: monthLabel, clients: 0 };
        }
        acc[monthKey].clients++;
      }
      return acc;
    }, {} as Record<string, { label: string, clients: number }>);

  const newClientsByMonthChartData = Object.keys(newClientsByMonth)
    .sort()
    .map(key => ({
      name: newClientsByMonth[key].label,
      clients: newClientsByMonth[key].clients
    }));

  const saasDistributionChartData = Object.entries(saasCounts)
    .map(([name, value]) => ({ name, value }));

  const COLORS = ['#39FF14', '#000000', '#8884d8', '#ffbb28', '#ff8042', '#00C49F', '#FFBB28', '#FF8042'];

  const revenueBySaasChartData = Object.entries(contacts
    .filter(c => c.type === 'Client' && c.saas)
    .reduce((acc, c) => {
      const saasName = c.saas || 'Non défini';
      const foundSaas = ECOSYSTEM_SAAS.find(s => s.name === saasName);
      let price = 13900;
      if (foundSaas) price = parseInt(foundSaas.price.replace(/\D/g, ''), 10);
      else if (saasName.includes('Gold')) price = 59900;
      else if (saasName.includes('CRM')) price = 39900;
      else if (saasName.includes('Tekki Pro')) price = 27900;
      else if (saasName.includes('Tekki')) price = 22900;
      else if (saasName.includes('Tontine')) price = 6900;
      acc[saasName] = (acc[saasName] || 0) + price;
      return acc;
    }, {} as Record<string, number>))
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
    
  const leadSourceChartData = Object.entries(leads.reduce((acc, lead) => {
    const source = lead.source || 'Inconnue';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>)).map(([name, value]) => ({ name, value }));

  // --- WIDGET EXPIRATIONS / RENOUVELLEMENTS CLIENTS ---
  const expiringClients = (contacts || []).filter((client) => {
    if (client.type !== 'Client') return false;
    if (!client.expiration_date) return false;
    const expDate = new Date(client.expiration_date);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 5 && diffDays >= -3; // Entre J-5 et J+3
  });

  const sendRenewalReminder = (client: any) => {
    if (!client.expiration_date || !client.phone) return;
    const expDate = new Date(client.expiration_date);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    let message = "";
    if (diffDays > 0) {
      message = `Bonjour ${client.full_name}, nous espérons que vous appréciez vos outils OnyxOps ! 🚀\n\nVotre période d'essai (ou abonnement) prend fin dans *${diffDays} jours* (le ${expDate.toLocaleDateString('fr-FR')}). Souhaitez-vous valider votre compte pour éviter toute interruption ?`;
    } else if (diffDays === 0) {
      message = `🚨 Bonjour ${client.full_name}, c'est le grand jour ! Votre accès OnyxOps expire *aujourd'hui* à minuit. Contactez-nous pour renouveler et conserver votre accès au Hub.`;
    } else {
      message = `Bonjour ${client.full_name}, votre accès OnyxOps est suspendu depuis ${Math.abs(diffDays)} jours. 🔒\nVos données sont conservées en sécurité. Envoyez-nous un message pour réactiver vos applications instantanément !`;
    }
    
    const rawPhone = String(client.phone).replace(/\s+/g, '').replace(/[^0-9]/g, '');
    const phoneWithPrefix = rawPhone.startsWith('221') ? rawPhone : `221${rawPhone}`;
    window.open(`https://wa.me/${phoneWithPrefix}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const filteredContacts = (contacts || []).filter(c => {
    if (crmTypeFilter !== 'Tous' && c.type !== crmTypeFilter) return false;
    if (crmActivityFilter !== 'Tous' && (c.activity || 'Non défini') !== crmActivityFilter) return false;
    if (advFilterSaas !== 'Tous' && !((c.active_saas || []).includes(advFilterSaas) || c.saas === advFilterSaas)) return false;

    if (advFilterExp !== 'all') {
       let hasMatch = false;
       const today = new Date().getTime();
       const thirtyDays = 30 * 24 * 60 * 60 * 1000;
       const datesToCheck: number[] = [];
       if (c.expiration_date) datesToCheck.push(new Date(c.expiration_date).getTime());
       if (c.saas_expiration_dates) {
           Object.values(c.saas_expiration_dates).forEach(d => datesToCheck.push(new Date(d).getTime()));
       }
       if (datesToCheck.length === 0) return false;
       if (advFilterExp === 'expired') hasMatch = datesToCheck.some(d => d < today);
       else if (advFilterExp === '30j') hasMatch = datesToCheck.some(d => d >= today && d <= today + thirtyDays);
       if (!hasMatch) return false;
    }

    const search = (globalSearch || crmSearch).toLowerCase();
    if (search && !(c.full_name || '').toLowerCase().includes(search) && !(c.phone || '').includes(search) && !(c.saas || '').toLowerCase().includes(search)) return false;
    if (crmCardFilter === 'new_clients' && c.type !== 'Client') return false;
    if (crmCardFilter === 'new_prospects' && c.type !== 'Prospect') return false;
    return true;
  });

  const filteredTransactions = (transactions || []).filter(t => {
     const search = financeSearch.toLowerCase();
     if (search && !(t.client || '').toLowerCase().includes(search) && !(t.ref || '').toLowerCase().includes(search)) return false;
     if (financeTypeFilter === 'Entrée' && t.amount <= 0) return false;
     if (financeTypeFilter === 'Sortie' && t.amount > 0) return false;
     return true;
  });

  const filteredActionsIA = (actionsIA || []).filter(a => {
      if (actionTabFilter === 'IA' && a.module === 'Marketing') return false;
      if (actionTabFilter === 'Marketing' && a.module !== 'Marketing') return false;
      const search = actionSearchFilter.toLowerCase();
      return (a.title || '').toLowerCase().includes(search) || (a.desc || '').toLowerCase().includes(search);
  });

  // Composant dynamique pour afficher les multi-abonnements dans le CRM
  const renderSaas = (c: Contact) => {
      const activeSaasList = c.active_saas && c.active_saas.length > 0 ? c.active_saas : (c.saas ? [c.saas] : []);
      if (activeSaasList.length === 0) return <span className="text-zinc-400 text-[10px] italic">Aucun abonnement</span>;
      return (
          <div className="flex flex-col gap-1.5 w-full">
              {activeSaasList.map(s => {
                  const expDateRaw = c.saas_expiration_dates?.[s] || c.expiration_date;
                  const expStr = expDateRaw ? new Date(expDateRaw).toLocaleDateString('fr-FR', {day: '2-digit', month: '2-digit', year: '2-digit'}) : 'N/A';
                  return (
                      <div key={s} className="flex items-center justify-between gap-2 bg-zinc-100 dark:bg-zinc-800 px-2 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700">
                          <span className="font-bold text-[10px] uppercase text-black dark:text-white truncate" title={s}>{s}</span>
                          <span className="text-[9px] font-black text-zinc-500 whitespace-nowrap">Exp: {expStr}</span>
                      </div>
                  );
              })}
          </div>
      );
  };

  const exportFinanceReport = () => {
    const reportWindow = window.open("", "_blank");
    if (reportWindow) {
      const tableRows = filteredTransactions
        .map(
          (t: any) => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 15px;">${t.date}</td>
          <td style="padding: 12px 15px;">${t.client}</td>
          <td style="padding: 12px 15px;">${t.type}</td>
          <td style="padding: 12px 15px; text-align: right; font-weight: bold; color: ${
            t.amount > 0 ? "#2ecc71" : "#e74c3c"
          };">${t.amount.toLocaleString("fr-FR")} F</td>
          <td style="padding: 12px 15px;">
            <span style="background-color: #ecf0f1; color: #7f8c8d; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold;">
              ${t.status}
            </span>
          </td>
        </tr>
      `
        )
        .join("");

      reportWindow.document.write(`
        <html>
          <head>
            <title>Registre Financier - OnyxOps</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: #f9fafb; color: #1f2937; }
              .container { max-width: 1024px; margin: 0 auto; padding: 40px; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 40px; }
              .header h1 { font-size: 36px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1.5px; }
              .header p { margin: 0; color: #6b7280; font-size: 14px; }
              .header img { height: 50px; }
              table { width: 100%; border-collapse: collapse; background-color: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 12px; overflow: hidden; }
              th, td { text-align: left; padding: 16px 20px; }
              thead { background-color: #f3f4f6; }
              th { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; }
              tbody tr:nth-child(even) { background-color: #f9fafb; }
              .footer { margin-top: 40px; padding: 30px; background-color: #000; color: white; border-radius: 12px; text-align: center; }
              .footer h2 { margin: 0; font-size: 18px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 1px; }
              .footer p { margin: 8px 0 0; font-size: 48px; font-weight: 900; color: #39FF14; letter-spacing: -2px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div>
                  <h1>Registre Financier</h1>
                  <p>${todayStr}</p>
                </div>
                <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" />
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Type</th>
                    <th style="text-align: right;">Montant</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
              <div class="footer">
                <h2>Chiffre d'Affaires Global</h2>
                <p>${stats.revenue.toLocaleString("fr-FR")} F</p>
              </div>
            </div>
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
  };
  
  const handleExportFinanceExcel = () => {
    if (filteredTransactions.length === 0) return alert("Aucune transaction à exporter.");

    const dataToExport = filteredTransactions.map((t: any) => ({
      "Date": t.date,
      "Référence": t.ref,
      "Client": t.client,
      "Activité": contacts.find(c => c.full_name === t.client)?.activity || t.activity || "N/A",
      "Type": t.type,
      "Montant (F CFA)": t.amount,
      "Statut": t.status
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Finances");
    XLSX.writeFile(workbook, `Transactions_Finances_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportBIPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Rapport Business Intelligence - OnyxOps", 14, 22);
    doc.setFontSize(11);
    doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 30);

    // Calculs actuels pour le rapport
    const saasCount = contacts.filter(c => c.type === 'Client' && c.saas && !['Add-on CM Pub', 'Onyx Boost', 'Onyx Modernize'].includes(c.saas)).length;
    const cmCount = contacts.filter(c => c.type === 'Client' && (c.saas === 'Add-on CM Pub' || (c.active_saas && c.active_saas.includes('cmpub')))).length;

    const tableColumn = ["Indicateur", "Valeur Actuelle", "Objectif Fixé", "Taux d'accomplissement"];
    const tableRows = [
      ["Revenu Mensuel Récurrent (MRR)", `${stats.revenue.toLocaleString('fr-FR')} F`, `${mrrGoal.toLocaleString('fr-FR')} F`, `${Math.round((stats.revenue / mrrGoal) * 100)}%`],
      ["Ventes SaaS (Logiciels)", `${saasCount}`, `${saasGoal}`, `${Math.round((saasCount / saasGoal) * 100)}%`],
      ["Ventes Options (CM & Pub)", `${cmCount}`, `${cmGoal}`, `${Math.round((cmCount / cmGoal) * 100)}%`]
    ];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [0, 0, 0], textColor: [57, 255, 20] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 80;
    doc.setFontSize(14);
    doc.text("Performances Globales de Conversion", 14, finalY + 15);
    doc.setFontSize(10);
    doc.text(`• Taux de conversion global (Leads vers Clients) : ${conversionRate.toFixed(1)}%`, 14, finalY + 25);
    doc.text(`• Panier moyen par client actif : ${Math.round(avgRevenuePerClient).toLocaleString('fr-FR')} F CFA`, 14, finalY + 32);

    doc.save(`Onyx_Rapport_BI_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleExportIAPdf = () => {
    const reportWindow = window.open("", "_blank");
    if (reportWindow) {
      const tableRows = actionsIA.map(a => `
        <tr style="border-bottom: 1px solid #eee;">
          <td style="padding: 12px 15px;">${a.date}</td>
          <td style="padding: 12px 15px; font-weight:bold;">${a.module}</td>
          <td style="padding: 12px 15px;"><strong>${a.title}</strong><br/><span style="color:#7f8c8d; font-size:12px;">${a.desc}</span></td>
          <td style="padding: 12px 15px;">
            <span style="background-color: ${a.status === 'Réalisé' ? '#ecf0f1' : '#e8f5e9'}; color: ${a.status === 'Réalisé' ? '#7f8c8d' : '#27ae60'}; padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold;">
              ${a.status}
            </span>
          </td>
        </tr>
      `).join("");

      reportWindow.document.write(`
        <html>
          <head>
            <title>Journal IA - OnyxOps</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; background-color: #f9fafb; color: #1f2937; }
              .container { max-width: 1024px; margin: 0 auto; padding: 40px; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; margin-bottom: 40px; }
              .header h1 { font-size: 36px; font-weight: 900; margin: 0; text-transform: uppercase; letter-spacing: -1.5px; }
              table { width: 100%; border-collapse: collapse; background-color: white; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); border-radius: 12px; overflow: hidden; }
              th, td { text-align: left; padding: 16px 20px; }
              thead { background-color: #000; color: #39FF14; }
              th { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <div>
                  <h1>Journal des Actions IA</h1>
                  <p>Export du ${todayStr}</p>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Module</th>
                    <th>Action & Description</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                </tbody>
              </table>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      reportWindow.document.close();
    }
  };

  return (
    <div className={`flex h-screen bg-[#fafafa] dark:bg-[#050505] font-sans text-black dark:text-white overflow-hidden relative selection:bg-[#39FF14]/30 transition-colors`}>
      
      {/* ================= SIDEBAR GAUCHE ================= */}
      <aside className="w-72 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col z-30 shadow-sm hidden md:flex transition-all">
        <div className="p-6">
          <img src="https://i.ibb.co/1Gssqd2p/LOGO-SITE.png" alt="Onyx Logo" width="350" height="250" className="w-[150px] h-auto object-contain cursor-pointer" onClick={() => setActiveView('dashboard')} />
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
                { id: 'ecosystem', icon: Box, label: 'Gestion des SaaS' },
                { id: 'logistics', icon: Truck, label: 'Logistique & Stock' },
                { id: 'finance', icon: Wallet, label: 'Finances' },
                { id: 'partners', icon: Handshake, label: 'Ambassadeurs' },
                { id: 'team', icon: Briefcase, label: 'Équipe Commerciale' },
                { id: 'withdrawals', icon: DollarSign, label: 'Retraits Partenaires' },
                { id: 'planning-marketing', icon: Megaphone, label: 'Planning Marketing' },
                { id: 'statistiques', icon: BarChartIcon, label: 'Statistiques' },
                { id: 'help', icon: HelpCircle, label: 'Aide & Tutoriels' },
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
               <button onClick={() => setActiveView('bi')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === 'bi' ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}><Activity size={20} /> Business Intelligence</button>
               <button onClick={() => setActiveView('kanban-ht')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === 'kanban-ht' ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}><Layers size={20} /> Kanban High-Ticket</button>
            <button onClick={() => setActiveView('marketing')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === 'marketing' ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}>
              <Megaphone size={20} /> Marketing & Blog
</button>
               <button onClick={() => setShowRapportIA(true)} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-black transition-all">
                 <Sparkles size={20} className="text-[#39FF14]" /> Scan Intelligence
               </button>
               {/* NOUVEL ONGLET JOURNAL IA */}
               <button onClick={() => setActiveView('journal-ia' as ViewType)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === 'journal-ia' ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}>
                 <FileText size={20} /> Journal & Actions IA
               </button>
               <button onClick={() => setShowHubsMap(true)} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-black transition-all">
                 <MapPin size={20} className="text-[#39FF14]" /> Carte des Hubs
               </button>
            </nav>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-100">
           <div onClick={() => alert("Tous les systèmes du Dakar Hub sont opérationnels et optimisés. Latence : 12ms.")} className="bg-black rounded-2xl p-4 flex items-center gap-4 border border-zinc-800 hover:bg-zinc-900 transition-colors cursor-pointer active:scale-95">
              <div className="w-10 h-10 bg-[#39FF14]/10 rounded-xl flex items-center justify-center text-[#39FF14]"><Activity size={20}/></div>
              <div>
                 <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Status Serveur</p>
                 <p className="text-[9px] font-bold text-zinc-500 uppercase mt-1">Dakar Hub : Optimisé</p>
              </div>
           </div>
        </div>
      </aside>

      {/* ================= MAIN AREA (Zone Principale) ================= */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#fafafa] dark:bg-[#050505] relative">
        
        {/* MOBILE SIDEBAR OVERLAY */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
            <div className="relative bg-white dark:bg-zinc-950 dark:text-white w-72 h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
                <div className="p-6 flex justify-between items-center border-b border-zinc-100">
                  <img src="https://i.ibb.co/1Gssqd2p/LOGO-SITE.png" alt="Onyx Logo" width="350" height="250" className="w-[120px] h-auto object-contain" />
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200"><X size={20}/></button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] mb-4 pl-4">Terminal Principal</p>
                    <nav className="space-y-1">
                      {[
                        { id: 'dashboard', icon: LayoutDashboard, label: 'Tableau de Bord' },
                        { id: 'leads', icon: MessageSquare, label: 'Leads & Flux' },
                        { id: 'crm', icon: Users, label: 'CRM & Membres' },
                        { id: 'ecosystem', icon: Box, label: 'Gestion des SaaS' },
                        { id: 'logistics', icon: Truck, label: 'Logistique & Stock' },
                        { id: 'finance', icon: Wallet, label: 'Finances' },
                        { id: 'partners', icon: Handshake, label: 'Ambassadeurs' },
                        { id: 'team', icon: Briefcase, label: 'Équipe Commerciale' },
                        { id: 'withdrawals', icon: DollarSign, label: 'Retraits Partenaires' },
                        { id: 'planning-marketing', icon: Megaphone, label: 'Planning Marketing' },
                        { id: 'statistiques', icon: BarChartIcon, label: 'Statistiques' },
                        { id: 'help', icon: HelpCircle, label: 'Aide & Tutoriels' },
                      ].map(item => (
                        <button key={item.id} onClick={() => { setActiveView(item.id as ViewType); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === item.id ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}>
                          <item.icon size={20} className={activeView === item.id ? 'text-[#39FF14]' : ''} /> {item.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] mb-4 pl-4">Stratégie & Ventes</p>
                    <nav className="space-y-1">
                      <button onClick={() => { setActiveView('bi'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === 'bi' ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}><Activity size={20} /> Business Intelligence</button>
                      <button onClick={() => { setActiveView('kanban-ht'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === 'kanban-ht' ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}><Layers size={20} /> Kanban High-Ticket</button>
                      <button onClick={() => { setActiveView('marketing'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === 'marketing' ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}><Megaphone size={20} /> Marketing & Blog</button>
                      <button onClick={() => { setShowRapportIA(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-black transition-all"><Sparkles size={20} className="text-[#39FF14]" /> Scan Intelligence</button>
                      <button onClick={() => { setActiveView('journal-ia' as ViewType); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold transition-all ${activeView === 'journal-ia' ? 'bg-black text-[#39FF14] shadow-2xl translate-x-1' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}><FileText size={20} /> Journal & Actions IA</button>
                      <button onClick={() => { setShowHubsMap(true); setIsMobileMenuOpen(false); }} className="w-full flex items-center gap-4 px-5 py-4 rounded-[1.25rem] text-sm font-bold text-zinc-500 hover:bg-zinc-100 hover:text-black transition-all"><MapPin size={20} className="text-[#39FF14]" /> Carte des Hubs</button>
                    </nav>
                  </div>
                </div>
            </div>
          </div>
        )}

        {/* HEADER GÉANT */}
        <header className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 h-28 flex items-center justify-between px-4 sm:px-8 shrink-0 z-20 transition-colors">
          <div className="flex flex-col">
            <div className="flex items-center gap-4 md:hidden mb-1">
               <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 bg-zinc-100 rounded-full text-black"><Menu size={24}/></button>
               <img src="https://i.ibb.co/1Gssqd2p/LOGO-SITE.png" alt="Onyx Logo" width="350" height="250" className="w-[100px] h-auto object-contain" />
            </div>
            <h2 className={`font-sans text-2xl lg:text-3xl font-black uppercase tracking-tighter text-black dark:text-white`}>
               {activeView === 'dashboard' ? 'Terminal Central' : activeView.replace('-', ' ')}
            </h2>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em]">{todayStr}</span>
               <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="hidden lg:flex flex-1 max-w-[250px] xl:max-w-[400px] relative">
               <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
               <input type="search" placeholder="Recherche globale (leads, CRM, ambassadeurs…)" value={globalSearch} onChange={e => setGlobalSearch(e.target.value)} className="w-full pl-12 pr-5 py-3 rounded-2xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14]" />
            </div>
            <div className="hidden lg:flex items-center gap-5 pr-10 border-r border-zinc-200">
               <button onClick={fetchSupabaseData} className={`text-zinc-400 hover:text-black transition-all ${isRefreshing ? 'animate-spin text-[#39FF14]' : ''}`} title="Rafraîchir les données">
                  <RefreshCcw size={22}/>
               </button>
               <button
                 onClick={() => { setTempAdminProfile({ ...adminProfile }); setShowProfileModal(true); }}
                 className="flex items-center gap-2 text-[11px] font-black uppercase text-zinc-500 hover:text-black"
               >
                 <Settings size={18} /> Paramètres
               </button>
               <button
                 onClick={async () => {
                   if (typeof window !== 'undefined') {
                     sessionStorage.removeItem('onyx_admin_session');
                   }
                   await supabase.auth.signOut();
                   setAdminUser(null);
                 }}
                 className="text-[11px] font-black uppercase text-red-500 hover:text-red-700"
               >
                 Forcer la déconnexion
               </button>
               <div className="relative cursor-pointer group">
                  <div onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative">
                    <Bell size={22} className={`${leads.length + partners.filter(p => p.status === 'En attente').length + withdrawals.filter(w => w.status === 'En attente').length > 0 ? 'text-[#39FF14] animate-bounce' : 'text-zinc-400'}`}/>
                    {leads.length + partners.filter(p => p.status === 'En attente').length + withdrawals.filter(w => w.status === 'En attente').length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border-2 border-white">
                        {leads.length + partners.filter(p => p.status === 'En attente').length + withdrawals.filter(w => w.status === 'En attente').length}
                      </span>
                    )}
                  </div>
                  {isNotificationsOpen && (
                    <div className="absolute top-full right-0 mt-4 w-80 bg-white border border-zinc-200 rounded-3xl shadow-2xl p-5 z-50 cursor-default animate-in slide-in-from-top-2">
                        <h4 className="font-black uppercase text-xs mb-4 flex items-center justify-between text-black"><span>Notifications</span> <span className="bg-black text-[#39FF14] px-2 py-0.5 rounded-full">{leads.length + partners.filter(p => p.status === 'En attente').length + withdrawals.filter(w => w.status === 'En attente').length}</span></h4>
                        <div className="space-y-3 max-h-72 overflow-y-auto custom-scrollbar pr-2">
                            {leads.length > 0 && leads.slice(0, 5).map(l => (
                                <div key={`lead-${l.id}`} onClick={() => { setActiveView('leads'); setIsNotificationsOpen(false); }} className="p-4 bg-zinc-50 rounded-2xl hover:bg-zinc-100 transition cursor-pointer border border-zinc-100">
                                    <p className="text-[10px] font-black text-[#39FF14] uppercase mb-1 flex items-center gap-1.5"><MessageSquare size={12}/> Nouveau Lead</p>
                                    <p className="text-sm font-bold text-black truncate">{l.full_name}</p>
                                    <p className="text-[10px] font-medium text-zinc-500 truncate mt-1">{l.intent}</p>
                                </div>
                            ))}
                            {partners.filter(p => p.status === 'En attente').length > 0 && partners.filter(p => p.status === 'En attente').slice(0, 5).map(p => (
                                <div key={`part-${p.id}`} onClick={() => { setActiveView('partners'); setIsNotificationsOpen(false); }} className="p-4 bg-orange-50 rounded-2xl hover:bg-orange-100 transition cursor-pointer border border-orange-100">
                                    <p className="text-[10px] font-black text-orange-500 uppercase mb-1 flex items-center gap-1.5"><Handshake size={12}/> Ambassadeur en attente</p>
                                    <p className="text-sm font-bold text-black truncate">{p.full_name}</p>
                                    <p className="text-[10px] font-medium text-zinc-500 truncate mt-1">{p.contact}</p>
                                </div>
                            ))}
                            {withdrawals.filter(w => w.status === 'En attente').length > 0 && withdrawals.filter(w => w.status === 'En attente').slice(0, 5).map(w => (
                                <div key={`with-${w.id}`} onClick={() => { setActiveView('withdrawals'); setIsNotificationsOpen(false); }} className="p-4 bg-green-50 rounded-2xl hover:bg-green-100 transition cursor-pointer border border-green-100">
                                    <p className="text-[10px] font-black text-green-600 uppercase mb-1 flex items-center gap-1.5"><DollarSign size={12}/> Demande de retrait</p>
                                    <p className="text-sm font-bold text-black truncate">{w.ambassador_name}</p>
                                    <p className="text-[10px] font-medium text-zinc-500 truncate mt-1">{w.amount?.toLocaleString()} F - {w.method}</p>
                                </div>
                            ))}
                            {(leads.length + partners.filter(p => p.status === 'En attente').length + withdrawals.filter(w => w.status === 'En attente').length) === 0 && <p className="text-xs text-zinc-400 text-center py-6 font-bold">Aucune nouvelle notification.</p>}
                        </div>
                    </div>
                  )}
               </div>
            </div>
            
            <div onClick={() => { setTempAdminProfile({ ...adminProfile }); setShowProfileModal(true); }} className="flex items-center gap-5 bg-white border border-zinc-200 p-2.5 pr-8 rounded-full cursor-pointer hover:shadow-2xl transition-all hover:-translate-y-1 group active:scale-95">
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
        <div className="flex-1 flex flex-col overflow-y-auto scroll-smooth custom-scrollbar">
          <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col">
          
          {/* ================= VUE DASHBOARD ================= */}
          {activeView === 'dashboard' && (
            <div className={`space-y-12 max-w-[1600px] mx-auto transition-all duration-700 ${isRefreshing ? 'opacity-30 scale-[0.98] grayscale' : 'opacity-100 scale-100 grayscale-0'}`}>
              
              {/* STATS PRINCIPALES */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div onClick={() => setActiveView('finance')} className="bg-black p-6 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] relative overflow-hidden cursor-pointer hover:scale-[1.03] transition-all group border border-zinc-800">
                  <div className="absolute -top-12 -right-12 p-12 opacity-[0.05] group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 text-[#39FF14]"><Wallet size={200}/></div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-4">Chiffre d&apos;Affaires Mensuel</p>
                  <p className={`font-sans text-3xl lg:text-4xl font-black text-[#39FF14] tracking-tighter`}>{stats.revenue.toLocaleString('fr-FR')} <span className="text-xl opacity-50 font-medium">F</span></p>
                </div>

                <div onClick={() => setActiveView('team')} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] cursor-pointer hover:border-[#00E5FF]/50 transition-all group relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -bottom-6 -right-6 p-6 opacity-[0.05] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 text-[#00E5FF]"><Users size={120}/></div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 relative z-10">Acquisition Terrain</p>
                  <div className="relative z-10">
                     <p className={`font-sans text-3xl lg:text-4xl font-black text-[#00E5FF] tracking-tighter`}>{contacts.filter(c => c.source?.includes('Commercial') || c.commercial_id).length}</p>
                     <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">Comptes Créés</p>
                  </div>
                </div>

                <div onClick={() => setActiveView('leads')} className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm cursor-pointer hover:border-black hover:shadow-2xl transition-all group relative overflow-hidden">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Flux de Leads (24h)</p>
                  <p className={`font-sans text-3xl lg:text-4xl font-black text-black tracking-tighter`}>{leads.length}</p>
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

                <div onClick={() => setActiveView('crm')} className="bg-[#39FF14] p-6 rounded-3xl shadow-xl cursor-pointer hover:scale-[1.03] transition-all group relative overflow-hidden border border-[#32E612]">
   <div className="absolute -bottom-10 -right-10 opacity-10 text-black group-hover:rotate-[-15deg] transition-all duration-700"><Megaphone size={180}/></div>
   <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/40 mb-4">Contacts CRM & Leads</p>
   <p className={`font-sans text-3xl lg:text-4xl font-black text-black tracking-tighter`}>{contacts.length + leads.length}</p>
   <div className="mt-6 flex items-center gap-2">
      <div className="px-3 py-1 bg-black text-[#39FF14] rounded-full text-[10px] font-black uppercase shadow-lg">Live</div>
   </div>
</div>
              </div>

              {/* BANNIÈRE BAISSE CA */}
              {stats.isRevenueDown && (
                 <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-6 rounded-3xl shadow-sm animate-in fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                       <div className="bg-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-2xl"><ArrowDownRight size={24} /></div>
                       <div>
                          <h2 className="text-lg font-black uppercase text-red-600 dark:text-red-400 tracking-tighter">Alerte : Baisse des ventes détectée</h2>
                          <p className="text-xs text-red-500 dark:text-red-300 font-bold mt-1">Nouveaux revenus ce mois-ci ({stats.currentMonthRevenue.toLocaleString('fr-FR')} F) vs mois précédent ({stats.prevMonthRevenue.toLocaleString('fr-FR')} F).</p>
                       </div>
                    </div>
                    <button onClick={() => setActiveView('marketing')} className="bg-red-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-all w-full sm:w-auto shadow-lg">Lancer une campagne</button>
                 </div>
              )}

              {/* ALERTE PRORATAS EN ATTENTE */}
              {(() => {
                  const pendingProratas = contacts.filter(c => c.pending_prorata && c.pending_prorata > 0);
                  if (pendingProratas.length === 0) return null;
                  return (
                      <div className="bg-orange-50 border border-orange-200 p-6 sm:p-8 rounded-3xl shadow-sm animate-in fade-in">
                          <div className="flex items-center gap-3 mb-6">
                              <div className="bg-orange-500/20 text-orange-500 p-2 rounded-xl"><AlertTriangle size={20} /></div>
                              <h2 className="text-lg sm:text-xl font-black uppercase text-orange-600 tracking-tighter">Proratas en attente de paiement</h2>
                              <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingProratas.length}</span>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {pendingProratas.map((client) => (
                                  <div key={client.id} className="bg-white border border-orange-100 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                                      <div>
                                          <div className="flex justify-between items-start mb-2">
                                              <h3 className="font-bold text-black text-sm uppercase">{client.full_name}</h3>
                                              <span className="text-[10px] font-black px-2 py-1 rounded-md uppercase bg-orange-100 text-orange-600 whitespace-nowrap">
                                                  {client.pending_prorata?.toLocaleString('fr-FR')} F
                                              </span>
                                          </div>
                                          <p className="text-xs text-zinc-500 font-medium mb-4 flex items-center gap-1">
                                              <Zap size={12} className="text-yellow-500"/> Upgrade vers {client.saas}
                                          </p>
                                      </div>
                                      <div className="flex gap-2">
                                      <button onClick={() => generateProrataInvoice(client)} className="flex-1 bg-zinc-100 text-black py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-zinc-200 transition-all flex justify-center items-center gap-1.5" title="Facture">
                                          <FileText size={14}/>
                                          </button>
                                      <button onClick={() => cancelProrata(client)} className="flex-1 bg-red-50 text-red-500 py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-red-100 transition-all flex justify-center items-center gap-1.5" title="Annuler l'upgrade">
                                          <X size={14}/>
                                      </button>
                                      <button onClick={() => markProrataPaid(client)} className="flex-[2] bg-black text-[#39FF14] py-2.5 rounded-xl font-black text-[10px] uppercase hover:scale-105 transition-all flex justify-center items-center gap-1.5 shadow-lg">
                                              <CheckCircle size={14}/> Payé
                                          </button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  );
              })()}

              {/* ALERTE DEMANDES DE RETRAIT EN ATTENTE */}
              {(() => {
                  const pendingWithdrawals = withdrawals.filter(w => w.status === 'En attente');
                  if (pendingWithdrawals.length === 0) return null;
                  return (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-6 sm:p-8 rounded-3xl shadow-sm animate-in fade-in">
                          <div className="flex items-center justify-between mb-6">
                              <div className="flex items-center gap-3">
                                  <div className="bg-green-500/20 text-green-600 dark:text-green-400 p-2 rounded-xl"><DollarSign size={20} /></div>
                                  <h2 className="text-lg sm:text-xl font-black uppercase text-green-700 dark:text-green-400 tracking-tighter">Retraits Partenaires en attente</h2>
                                  <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingWithdrawals.length}</span>
                              </div>
                              <button onClick={() => setActiveView('withdrawals')} className="text-[10px] font-black uppercase text-green-700 dark:text-green-400 bg-green-500/10 px-4 py-2 rounded-xl hover:bg-green-500/20 transition-all hidden sm:block">Gérer les retraits</button>
                          </div>
                          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                              {pendingWithdrawals.slice(0, 3).map((w) => (
                                  <div key={w.id} onClick={() => setActiveView('withdrawals')} className="bg-white dark:bg-zinc-900 border border-green-100 dark:border-green-800/50 rounded-2xl p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-all cursor-pointer hover:border-green-300 dark:hover:border-green-700 group">
                                      <div>
                                          <div className="flex justify-between items-start mb-2">
                                              <h3 className="font-bold text-black dark:text-white text-sm uppercase truncate pr-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">{w.ambassador_name}</h3>
                                              <span className="text-[10px] font-black px-2 py-1 rounded-md uppercase bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 whitespace-nowrap">
                                                  {w.amount?.toLocaleString('fr-FR')} F
                                              </span>
                                          </div>
                                          <p className="text-xs text-zinc-500 font-medium flex items-center gap-1">
                                              Via {w.method} • {w.phone}
                                          </p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                          {pendingWithdrawals.length > 3 && (
                             <button onClick={() => setActiveView('withdrawals')} className="w-full mt-4 py-3 bg-green-500/10 text-green-700 dark:text-green-400 rounded-xl text-xs font-black uppercase hover:bg-green-500/20 transition-colors">Voir les {pendingWithdrawals.length - 3} autres demandes</button>
                          )}
                      </div>
                  );
              })()}

              {/* GRAPHIQUES ET MAP */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* HISTOGRAMME NÉON */}
                <div className="lg:col-span-2 bg-white border border-zinc-200 p-5 lg:p-12 rounded-3xl shadow-sm relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-12">
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-zinc-100 rounded-[1.5rem] text-black"><BarChartIcon size={24}/></div>
                       <div>
                          <h3 className="font-black uppercase text-base tracking-tighter text-black">Flux de Revenus Hebdomadaire</h3>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Mars 2026 • Terminal Dakar</p>
                       </div>
                    </div>
                    <div className="flex gap-3 bg-zinc-50 p-2 rounded-[1.5rem] w-max">
                       <button onClick={() => setChartFilter('week')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase transition-colors ${chartFilter === 'week' ? 'bg-black text-[#39FF14] shadow-xl' : 'bg-white border border-zinc-100 text-zinc-400 hover:text-black'}`}>Semaine</button>
                       <button onClick={() => setChartFilter('month')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase transition-colors ${chartFilter === 'month' ? 'bg-black text-[#39FF14] shadow-xl' : 'bg-white border border-zinc-100 text-zinc-400 hover:text-black'}`}>Mois</button>
                       <button onClick={() => setChartFilter('year')} className={`px-6 py-2.5 rounded-xl text-[11px] font-black uppercase transition-colors ${chartFilter === 'year' ? 'bg-black text-[#39FF14] shadow-xl' : 'bg-white border border-zinc-100 text-zinc-400 hover:text-black'}`}>Année</button>
                    </div>
                  </div>
                  
                  <div className="flex items-end justify-between h-72 gap-4 sm:gap-6 relative pt-10">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03] pt-14 pb-12">
                      {[1,2,3,4,5].map(line => <div key={line} className="border-t-2 border-black w-full"></div>)}
                    </div>
                    {histogramData.map((d, i) => (
                      <div key={i} className="relative flex flex-col items-center flex-1 h-full justify-end group cursor-pointer" onClick={() => setHistogramActiveIdx(histogramActiveIdx === i ? null : i)}>
                        <div className={`w-full max-w-[55px] rounded-[1.25rem] transition-all duration-700 relative z-10 ${d.active ? 'bg-black shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]' : 'bg-[#39FF14] hover:bg-black hover:scale-110 active:scale-95'}`} style={{ height: `${(d.ca / maxCa) * 100}%` }}>
                           {d.active && <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-[#39FF14] px-4 py-2 rounded-xl text-xs font-black shadow-2xl whitespace-nowrap animate-in slide-in-from-bottom-2 z-20">{d.ca.toLocaleString()} F</div>}
                        </div>
                        <span className={`mt-6 text-[10px] sm:text-[11px] font-black uppercase tracking-tighter ${d.active ? 'text-black' : 'text-zinc-400'}`}>{d.day}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ACTIVITY MAP SENEGAL — cliquable → Carte des Hubs */}
                <div onClick={() => setShowHubsMap(true)} className="bg-zinc-900 p-5 lg:p-12 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col border border-zinc-800 group min-h-[400px] cursor-pointer hover:border-[#39FF14]/50 transition-all">
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
                       <p className="text-[10px] font-black uppercase text-[#39FF14] mb-1 tracking-widest flex items-center gap-2"><Layers size={12}/> Carte des Hubs Sénégal</p>
                       <p className="text-[9px] font-bold text-zinc-400 uppercase leading-relaxed">Cliquez pour voir les contacts par zone</p>
                    </div>
                  </div>
                </div>

                <div onClick={() => setActiveView('team')} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] cursor-pointer hover:border-[#00E5FF]/50 transition-all group relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -bottom-6 -right-6 p-6 opacity-[0.05] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 text-[#00E5FF]"><Users size={120}/></div>
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 relative z-10">Acquisition Terrain</p>
                  <div className="relative z-10">
                     <p className={`font-sans text-3xl lg:text-4xl font-black text-[#00E5FF] tracking-tighter`}>{contacts.filter(c => c.source?.includes('Commercial') || c.commercial_id).length}</p>
                     <p className="text-xs font-bold text-zinc-500 mt-1 uppercase tracking-widest">Comptes Créés</p>
                  </div>
                </div>
              </div>

              {/* LISTES DE DONNÉES DASHBOARD (CRM Récent & IA Actions) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* DERNIERS MEMBRES CRM */}
                 <div className="bg-white border border-zinc-200 p-5 lg:p-12 rounded-3xl shadow-sm group hover:shadow-xl transition-all">
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
                          <div key={c.id} onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="flex flex-col sm:flex-row justify-between sm:items-center p-5 lg:p-6 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 group/item hover:border-[#39FF14] hover:bg-white transition-all gap-4 cursor-pointer">
                             <div className="flex items-center gap-4 lg:gap-5">
                                <div className="w-12 h-12 rounded-2xl bg-black text-[#39FF14] flex items-center justify-center font-black text-sm shadow-lg shrink-0">{c.full_name?.charAt(0)}</div>
                                <div>
                                   <p className="font-black text-sm uppercase text-black group-hover/item:text-[#39FF14] transition-colors">{c.full_name}</p>
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
                          <div className="p-6 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-zinc-100 rounded-[2rem]">Aucun client récent</div>
                       )}
                    </div>
                 </div>

                 {/* ACTIONS IA INTELLIGENTES */}
                 <div className="bg-zinc-900 p-5 lg:p-12 rounded-3xl shadow-2xl border border-zinc-800 relative overflow-hidden flex flex-col h-full">
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[#39FF14] pointer-events-none"><Sparkles size={120}/></div>
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6 mb-10 relative z-10">
                       <h3 className="font-black uppercase text-base text-white tracking-tighter flex items-center gap-4"><Calendar className="text-[#39FF14] shadow-[0_0_10px_#39FF14]"/> Actions Planifiées</h3>
                       <span className="text-[10px] font-black text-zinc-400 uppercase bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-700 w-max">{actionsIA.filter(a => a.status === 'En attente' || a.status === 'En cours').length} tâches actives</span>
                    </div>
                    <div className="space-y-4 relative z-10 flex-1">
                       {actionsIA.filter(a => a.status !== 'Réalisé').slice(0, 8).map(action => (
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
                                   <button onClick={() => executeWA(action.phone, action.msg, action.id)} className="bg-white text-black px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase hover:bg-[#39FF14] transition-all shadow-xl active:scale-95">Exécuter</button>
                                ) : action.status === 'Réalisé' ? (
                                   <button className="bg-zinc-800 text-zinc-500 px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase border border-zinc-700 cursor-default">Terminé</button>
                                ) : (
                                   <button className="bg-zinc-700 text-white px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase hover:bg-zinc-600 transition-all border border-zinc-600 active:scale-95">Détails</button>
                                )}
                                {/* BOUTON SUPPRIMER IA */}
                                <button onClick={() => deleteActionIA(action.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                             </div>
                          </div>
                       ))}
                       {actionsIA.length === 0 && (
                          <div className="p-6 text-center text-zinc-500 text-xs font-bold uppercase tracking-widest">Planificateur vierge</div>
                       )}
                       <button onClick={() => setActiveView('journal-ia' as ViewType)} className="w-full text-center mt-4 text-[10px] text-zinc-400 uppercase font-black tracking-widest hover:text-white transition-colors">Voir tout le planning IA</button>
                    </div>
                 </div>
              </div>

            </div>
          )}

          {/* ================= VUE STATISTIQUES ================= */}
          {activeView === 'statistiques' && (
            <div className="space-y-12 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Taux de Conversion</p>
                  <p className={`font-sans text-3xl font-black text-black tracking-tighter`}>{conversionRate.toFixed(1)}%</p>
                  <p className="text-xs font-bold text-zinc-500 mt-2">Leads → Clients</p>
                </div>
                <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Produit Populaire</p>
                  <p className={`font-sans text-2xl font-black text-black tracking-tighter`}>{popularSaas}</p>
                  <p className="text-xs font-bold text-zinc-500 mt-2">SaaS le plus vendu</p>
                </div>
                <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Top Ambassadeur</p>
                  <p className={`font-sans text-2xl font-black text-black tracking-tighter truncate`}>{topAmbassador?.full_name || 'N/A'}</p>
                  <p className="text-xs font-bold text-zinc-500 mt-2">{topAmbassador?.sales || 0} ventes</p>
                </div>
                <div className="bg-white border border-zinc-200 p-6 rounded-3xl shadow-sm">
                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">Panier Moyen Client</p>
                  <p className={`font-sans text-3xl font-black text-black tracking-tighter`}>{Math.round(avgRevenuePerClient).toLocaleString('fr-FR')}</p>
                  <p className="text-xs font-bold text-zinc-500 mt-2">Revenu / Client</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                  <h3 className="font-black uppercase text-lg mb-6">Acquisition Nouveaux Clients</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <LineChart data={newClientsByMonthChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis dataKey="name" stroke="#71717a" fontSize={12} />
                        <YAxis stroke="#71717a" fontSize={12} />
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '1rem', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                        <Line type="monotone" dataKey="clients" name="Nouveaux Clients" stroke="#39FF14" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                  <h3 className="font-black uppercase text-lg mb-6">Répartition des Ventes SaaS</h3>
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={saasDistributionChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                        >
                          {saasDistributionChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '1rem', color: '#fff' }}/>
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                  <h3 className="font-black uppercase text-lg mb-6">Revenus par Offre SaaS (MRR)</h3>
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <BarChart data={revenueBySaasChartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                        <XAxis type="number" stroke="#71717a" fontSize={12} tickFormatter={(value) => new Intl.NumberFormat('fr-FR').format(value as number)}/>
                        <YAxis dataKey="name" type="category" width={120} tick={{fontSize: 11, fill: '#3f3f46'}}/>
                        <Tooltip formatter={(value: any) => typeof value === 'number' ? `${value.toLocaleString('fr-FR')} F` : value} contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '1rem', color: '#fff' }} />
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
                        <Bar dataKey="revenue" name="Revenu Mensuel" fill="#39FF14" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                  <h3 className="font-black uppercase text-lg mb-6">Origine des Leads</h3>
                  <div style={{ width: '100%', height: 350 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={leadSourceChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} fill="#8884d8" label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}>
                          {leadSourceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#18181b', border: 'none', borderRadius: '1rem', color: '#fff' }}/>
                        <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= VUE LEADS (FLUX RÉEL) ================= */}
          {activeView === 'leads' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 lg:p-5 rounded-2xl border border-zinc-200 shadow-sm">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-black rounded-xl flex items-center justify-center text-[#39FF14] shadow-2xl animate-pulse"><MessageSquare size={24}/></div>
                      <div>
                         <h2 className={`font-sans text-2xl lg:text-3xl font-black uppercase tracking-tighter`}>Flux de Leads</h2>
                         <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Capture en temps réel • Hub WhatsApp : 78 533 84 17</p>
                      </div>
                   </div>
                  <div className="flex flex-wrap items-center gap-4">
                     <select value={leadFilter} onChange={e => setLeadFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] bg-white cursor-pointer">
                       <option value="Tous">Tous les leads</option>
                       <option value="Partiel">Paniers Abandonnés</option>
                     </select>
                     <input type="search" placeholder="Rechercher un lead…" value={leadSearch} onChange={e => setLeadSearch(e.target.value)} className="px-4 py-2.5 rounded-xl border border-zinc-200 text-xs font-medium w-40 md:w-56 focus:outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14]" />
                     <button onClick={runAbandonedCartsScan} className="bg-black text-[#39FF14] px-4 py-2.5 rounded-xl font-black uppercase text-[10px] hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center gap-2 shrink-0">
                       <Sparkles size={16}/> Relancer Abandons
                     </button>
                      <div className="bg-zinc-50 border border-zinc-100 px-4 py-2.5 rounded-xl flex items-center gap-2">
                         <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-ping"></span>
                         <span className="text-[9px] lg:text-[10px] font-black uppercase text-zinc-500">Flux Connecté</span>
                      </div>
                   </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2rem] lg:rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                   <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Origine & Contact</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Intention / Produit</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Message Reçu</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 text-right">Traitement</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {leads.filter(l => {
                           if (leadFilter === 'Partiel' && !(l.intent || '').toLowerCase().includes('partiel')) return false;
                           const search = (globalSearch || leadSearch).toLowerCase();
                           if (search && ![l.full_name, l.phone, l.intent, l.message].some(v => String(v||'').toLowerCase().includes(search))) return false;
                           return true;
                        }).map(l => {
                           const isPartial = (l.intent || '').toLowerCase().includes('partiel');
                           return (
                           <tr key={l.id} className={`hover:bg-zinc-50/50 transition-all group ${isPartial ? 'bg-orange-50/30' : ''}`}>
                               <td className="p-3 lg:p-4">
                                  <p className="font-black text-sm uppercase text-black">{l.full_name}</p>
                                  <p className="text-xs text-[#39FF14] font-black mt-1">{l.phone}</p>
                                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1.5 opacity-80">Source : {l.source || 'Site Web'}</p>
                               </td>
                               <td className="p-3 lg:p-4">
                                  <div className="flex flex-col gap-2">
                                    <span className={`text-[9px] lg:text-[10px] font-black px-3 py-1.5 rounded-xl uppercase inline-block shadow-lg w-max tracking-widest ${isPartial ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-black text-[#39FF14]'}`}>{l.intent}</span>
                                     <p className="text-[9px] font-bold text-zinc-400 uppercase ml-2 mt-1">{l.created_at ? new Date(l.created_at).toLocaleDateString() : todayStr}</p>
                                  </div>
                               </td>
                               <td className="p-3 lg:p-4">
                                  <p className="text-xs text-zinc-600 font-medium italic max-w-xs leading-relaxed opacity-80 border-l-2 border-zinc-200 pl-4 py-1">&quot;{l.message}&quot;</p>
                               </td>
                               <td className="p-3 lg:p-4 text-right">
                                  <div className="flex flex-wrap items-center justify-end gap-2">
                                     <div className="relative lead-actions-wrap">
                                        <button onClick={(e) => { e.stopPropagation(); setLeadActionsOpen(leadActionsOpen === l.id ? null : l.id); }} className="bg-[#39FF14] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-black hover:text-[#39FF14] transition-all active:scale-95 flex items-center gap-2">
                                           <MoreHorizontal size={16}/> Actions
                                        </button>
                                        {leadActionsOpen === l.id && (
                                           <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-zinc-200 rounded-xl shadow-2xl z-50 py-2">
                                              {getLeadPriorityActions(l).map((a, idx) => (
                                                 <button key={idx} onClick={() => { a.fn(); setLeadActionsOpen(null); }} className="w-full text-left px-4 py-2 text-[9px] font-black uppercase hover:bg-zinc-50 transition-colors flex items-center gap-2">
                                                    {idx === 0 && <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse"></span>}
                                                    {a.label}
                                                 </button>
                                              ))}
                                           </div>
                                        )}
                                     </div>
                                     <button onClick={() => handleDeleteLead(l.id)} className="bg-red-500/10 text-red-600 px-3 py-2 rounded-lg text-[9px] font-black uppercase hover:bg-red-500/20 transition-all" title="Supprimer">Supprimer</button>
                                  </div>
                               </td>
                            </tr>
                           );
                        })}
                        {leads.filter(l => {
                           if (leadFilter === 'Partiel' && !(l.intent || '').toLowerCase().includes('partiel')) return false;
                           const search = (globalSearch || leadSearch).toLowerCase();
                           if (search && ![l.full_name, l.phone, l.intent, l.message].some(v => String(v||'').toLowerCase().includes(search))) return false;
                           return true;
                        }).length === 0 && (
                            <tr><td colSpan={4} className="p-10 lg:p-16 text-center text-zinc-300 font-black uppercase text-xs tracking-widest italic opacity-50">Aucun lead actif dans le flux pour le moment.</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* ================= VUE CRM & MEMBRES ================= */}
          {activeView === 'crm' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 max-w-[1600px] mx-auto">
              
              {/* CARTES STATS CRM */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 {[
                    { id: 'all', label: 'Membres CRM', val: contacts.length, icon: Users, color: 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-white' },
                    { id: 'new_clients', label: 'Clients Actifs', val: contacts.filter(c=>c.type==='Client').length, icon: CheckCircle, color: 'bg-black text-[#39FF14] shadow-2xl border-black dark:border-zinc-800' },
                    { id: 'new_prospects', label: 'Prospects Froids', val: contacts.filter(c=>c.type==='Prospect').length, icon: Clock, color: 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-black dark:text-white' },
                    { id: 'trials', label: 'Essais Onyx', val: contacts.filter(c => c.saas && c.type === 'Prospect').length || 0, icon: Zap, color: 'bg-[#39FF14] text-black shadow-lg border-[#32E612] dark:border-zinc-800' },
                 ].map(card => (
                    <div 
                      key={card.id} 
                      onClick={() => setCrmCardFilter(crmCardFilter === card.id ? null : card.id)} 
                      className={`p-4 lg:p-5 rounded-[2rem] lg:rounded-2xl border cursor-pointer hover:scale-[1.04] transition-all flex flex-col justify-between min-h-[140px] lg:min-h-[160px] ${card.color} ${crmCardFilter === card.id ? 'ring-[4px] ring-[#39FF14]/30 scale-[1.02]' : ''}`}
                    >
                       <card.icon size={22} className="mb-3 opacity-80" />
                       <div>
                         <p className={`font-sans text-xl lg:text-2xl font-black mb-1 tracking-tighter`}>{card.val}</p>
                         <p className="text-[9px] lg:text-[11px] font-black uppercase tracking-[0.2em] opacity-60 leading-none">{card.label}</p>
                       </div>
                    </div>
                 ))}
              </div>

              {/* BARRE DE RECHERCHE CRM */}
              <div className="flex flex-col bg-white dark:bg-zinc-900 p-4 lg:p-5 rounded-[1.5rem] lg:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                <div className="flex flex-col xl:flex-row justify-between gap-4 items-center w-full">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#39FF14] opacity-0 group-hover:opacity-100 transition-all"></div>
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 lg:w-5 lg:h-5 transition-all group-focus-within:text-[#39FF14]" />
                  <input 
                    type="text" 
                    placeholder="Filtrer par nom, téléphone, statut..." 
                    value={crmSearch} 
                    onChange={(e) => setCrmSearch(e.target.value)} 
                    className="w-full pl-12 pr-4 py-2.5 bg-zinc-50 border-none rounded-xl outline-none font-black text-xs text-black focus:ring-2 focus:ring-[#39FF14]/10 transition-all uppercase placeholder:text-zinc-300" 
                  />
                </div>
                
                <div className="flex flex-wrap items-center justify-start xl:justify-end gap-3 w-full xl:w-auto mt-4 xl:mt-0">
                   <select 
                     value={crmTypeFilter} 
                     onChange={(e) => setCrmTypeFilter(e.target.value)} 
                     className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg font-black text-[10px] uppercase tracking-widest outline-none border-none cursor-pointer appearance-none text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                   >
                      <option value="Tous">Base Complète</option>
                      <option value="Client">Clients Officiels</option>
                      <option value="Prospect">Prospects Leads</option>
                   </select>
                   <select 
                     value={crmActivityFilter} 
                     onChange={(e) => setCrmActivityFilter(e.target.value)} 
                     className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg font-black text-[10px] uppercase tracking-widest outline-none border-none cursor-pointer appearance-none text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                   >
                      <option value="Tous">Tous Secteurs</option>
                      {Array.from(new Set(contacts.map(c => c.activity).filter((a): a is string => Boolean(a)))).map(act => <option key={act} value={act}>{act}</option>)}
                      <option value="Non défini">Non défini</option>
                   </select>
                   <button onClick={handleFixMissingExpiryDates} className="flex items-center justify-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all shadow-sm active:scale-95">
                      <Clock size={14} /> Régulariser Dates
                   </button>
                   <button onClick={handleRelanceProspectsFroids} className="flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm border border-zinc-200 dark:border-zinc-800 active:scale-95">
                      <MessageCircle size={14} /> Relance Froids
                   </button>
                   <button onClick={runIaScan} className="flex items-center justify-center gap-2 bg-zinc-800 text-white px-3 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-sm active:scale-95">
                      <Sparkles size={14} /> Scan IA
                   </button>
                   <button onClick={handleExportCrmPdf} className="flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm border border-zinc-200 dark:border-zinc-800 active:scale-95">
                      <FileText size={14} /> Export PDF
                   </button>
                   <button 
                     onClick={openNewClientModal} 
                     className="flex items-center justify-center gap-2 bg-[#39FF14] text-black px-4 py-2 rounded-lg font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-[#39FF14] transition-all shadow-sm active:scale-95"
                   >
                      <Plus size={14} /> Ajouter Nouveau
                   </button>
                </div>
              </div>
              
              {/* LIGNE DE FILTRES AVANCÉS & VUE (GRILLE/LISTE) */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center mt-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
                 <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    <span className="text-[10px] font-black uppercase text-zinc-400">Filtres Avancés :</span>
                    <select value={advFilterSaas} onChange={e => setAdvFilterSaas(e.target.value)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase outline-none cursor-pointer">
                       <option value="Tous">Tous les SaaS</option>
                       {ECOSYSTEM_SAAS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                    <select value={advFilterExp} onChange={e => setAdvFilterExp(e.target.value as any)} className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg text-[10px] font-bold uppercase outline-none cursor-pointer">
                       <option value="all">Toutes expirations</option>
                       <option value="30j">Expire dans &lt; 30j</option>
                       <option value="expired">Déjà Expiré</option>
                    </select>
                 </div>
                 <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl shrink-0">
                    <button onClick={() => setCrmViewMode('list')} className={`p-2 rounded-lg transition-colors ${crmViewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400'}`}><Menu size={16}/></button>
                    <button onClick={() => setCrmViewMode('grid')} className={`p-2 rounded-lg transition-colors ${crmViewMode === 'grid' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400'}`}><LayoutDashboard size={16}/></button>
                 </div>
              </div>
              </div>

              {/* WIDGET EXPIRATIONS / RENOUVELLEMENTS */}
              {expiringClients.length > 0 && (
                <div className="mb-8 bg-black rounded-[2rem] p-6 sm:p-8 shadow-xl border border-zinc-800 animate-in fade-in">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-yellow-500/20 text-yellow-500 p-2 rounded-xl">
                      <AlertTriangle size={20} />
                    </div>
                    <h2 className="text-xl font-black uppercase text-white">Renouvellements & Expirations</h2>
                    <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      {expiringClients.length}
                    </span>
                    <button 
                       onClick={async () => {
                           if (!confirm("Voulez-vous vraiment prolonger ces clients de 30 jours et remettre cette liste à 0 ?")) return;
                           const updates = expiringClients.map(c => {
                               const next = new Date(); next.setDate(next.getDate() + 30);
                               return supabase.from('clients').update({ expiration_date: next.toISOString().split('T')[0] }).eq('id', c.id);
                           });
                           await Promise.all(updates); fetchSupabaseData(); alert("Renouvellements remis à 0 avec succès !");
                       }} 
                       className="ml-auto bg-zinc-800 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-zinc-700 transition"
                    >
                       Remettre à 0
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {expiringClients.map((client) => {
                      const expDate = new Date(client.expiration_date as string);
                      const diffDays = Math.ceil(
                        (expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                      );
                      const isGracePeriod = diffDays < 0 && diffDays >= -3;

                      return (
                        <div
                          key={client.id}
                          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-bold text-white text-sm uppercase">
                                {client.full_name}
                              </h3>
                              <span
                                className={`text-[10px] font-black px-2 py-1 rounded-md uppercase ${
                                  isGracePeriod
                                    ? "bg-red-500/20 text-red-500"
                                    : "bg-yellow-500/20 text-yellow-500"
                                }`}
                              >
                                {isGracePeriod
                                  ? `Expiré (J${diffDays})`
                                  : `Dans ${diffDays}j`}
                              </span>
                            </div>
                            <p className="text-xs text-zinc-400 font-medium mb-4 flex items-center gap-1">
                              <Clock size={12} /> Fin :{" "}
                              {expDate.toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          <button
                            onClick={() => sendRenewalReminder(client)}
                            className="w-full bg-white text-black py-2.5 rounded-xl font-black text-[10px] uppercase hover:bg-[#39FF14] transition-all flex justify-center items-center gap-2"
                          >
                            <MessageCircle size={14} /> Relancer via WhatsApp
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TABLEAU CRM */}
              {crmViewMode === 'grid' ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                     {filteredContacts.map(c => (
                        <div key={c.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm hover:border-[#39FF14] transition-all flex flex-col group">
                           <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                                 {c.avatar_url ? <img onClick={(e) => { e.stopPropagation(); setViewingAvatarUrl(c.avatar_url!); }} src={c.avatar_url} className="w-12 h-12 rounded-2xl object-cover shadow-sm cursor-zoom-in hover:scale-105 transition-transform" title="Agrandir l'image" /> : <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">{c.full_name?.charAt(0)}</div>}
                                 <div>
                                    <p className="font-black text-sm uppercase leading-tight truncate max-w-[150px]">{c.full_name}</p>
                                    <p className="text-xs text-[#39FF14] font-black mt-0.5">{c.phone}</p>
                                 </div>
                              </div>
                              <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-zinc-400 hover:text-black dark:hover:text-white"><Edit3 size={18}/></button>
                           </div>
                           <div className="mb-4">
                              <span className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg tracking-widest ${c.type === 'Client' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-zinc-100 text-zinc-500'}`}>{c.type}</span>
                              {c.activity && <span className="ml-2 text-[9px] font-black bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2 py-1 rounded-lg uppercase">{c.activity}</span>}
                              {c.source && (
                                  <span className={`ml-2 text-[9px] font-black px-2 py-1 rounded-lg uppercase ${c.source.includes('Commercial') ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : c.source.includes('Ambassadeur') ? 'bg-yellow-500/10 text-yellow-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                     <Crosshair size={10} className="inline mr-1"/> {c.source}
                                  </span>
                              )}
                           </div>
                           <div className="flex-1">
                              {renderSaas(c)}
                           </div>
                           <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
                              <button onClick={() => {
                                  const url = `https://onyxlinks.com/?invite_name=${encodeURIComponent(c.full_name || '')}&invite_phone=${encodeURIComponent(c.phone || '')}&invite_pack=${encodeURIComponent(c.saas || '')}`;
                                  navigator.clipboard.writeText(url);
                                  alert("Lien d'invitation copié !");
                              }} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-[#39FF14] hover:text-black transition" title="Lien Onboarding"><ExternalLink size={14}/></button>
                              <button onClick={() => handleDeleteItem('clients', c.id)} className="p-2 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 size={14}/></button>
                           </div>
                        </div>
                     ))}
                     {filteredContacts.length === 0 && <div className="col-span-full p-10 text-center text-zinc-300 font-black uppercase text-xs tracking-widest opacity-50">Aucun résultat trouvé</div>}
                 </div>
              ) : (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] lg:rounded-2xl overflow-hidden shadow-sm relative overflow-x-auto mt-4">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                    <tr>
                      <th className="p-3 lg:p-4 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Identité & WhatsApp</th>
                      <th className="p-3 lg:p-4 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Segment Terminal</th>
                      <th className="p-3 lg:p-4 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400">Abonnements & Expirations</th>
                      <th className="p-3 lg:p-4 text-[10px] lg:text-[11px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Contrôle</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {filteredContacts.map((c) => (
                      <tr key={c.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-all group">
                        <td className="p-3 lg:p-4">
                          <div className="flex items-center gap-4 lg:gap-6">
                             {c.avatar_url ? <img onClick={(e) => { e.stopPropagation(); setViewingAvatarUrl(c.avatar_url!); }} src={c.avatar_url} alt="" className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl object-cover shadow-sm shrink-0 cursor-zoom-in hover:scale-105 transition-transform" title="Agrandir l'image" /> : <div className="w-10 h-10 lg:w-12 lg:h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl lg:rounded-2xl flex items-center justify-center font-black text-sm lg:text-base text-black dark:text-white group-hover:bg-black group-hover:text-[#39FF14] transition-all uppercase shadow-sm shrink-0">{c.full_name?.charAt(0)}</div>}
                             <div>
                                <p className="font-black text-sm lg:text-base uppercase text-black dark:text-white tracking-tight leading-tight">{c.full_name}</p>
                                <p className="text-xs lg:text-sm text-[#39FF14] font-black mt-1">{c.phone}</p>
                             </div>
                          </div>
                        </td>
                        <td className="p-3 lg:p-4">
                          <div className="flex flex-col gap-2">
                             <span className={`px-4 py-2 text-[9px] lg:text-[10px] font-black uppercase rounded-2xl w-max tracking-widest ${c.type === 'Client' ? 'bg-[#39FF14] text-black shadow-lg shadow-[#39FF14]/20' : 'bg-zinc-100 text-zinc-500'}`}>{c.type}</span>
                             {c.activity && <span className="text-[9px] lg:text-[10px] font-black bg-zinc-200 text-black px-2 py-0.5 rounded-lg uppercase w-max ml-2">{c.activity}</span>}
                             {c.source && (
                                 <span className={`text-[9px] lg:text-[10px] font-black px-2 py-0.5 rounded-lg uppercase w-max ml-2 ${c.source.includes('Commercial') ? 'bg-[#00E5FF]/10 text-[#00E5FF]' : c.source.includes('Ambassadeur') ? 'bg-yellow-500/10 text-yellow-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                    {c.source}
                                 </span>
                             )}
                             <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 mt-1.5 uppercase ml-2">{c.status || 'Non catégorisé'}</p>
                          </div>
                        </td>
                        <td className="p-3 lg:p-4">
                           {renderSaas(c)}
                        </td>
                        <td className="p-3 lg:p-4 text-right space-x-2 lg:space-x-3">
                          <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="p-2 lg:p-3 text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm"><Edit3 size={18} className="lg:w-4 lg:h-4"/></button>
                          <button onClick={() => {
                             const url = `https://onyxlinks.com/?invite_name=${encodeURIComponent(c.full_name || '')}&invite_phone=${encodeURIComponent(c.phone || '')}&invite_pack=${encodeURIComponent(c.saas || '')}`;
                             navigator.clipboard.writeText(url);
                             alert("Lien d'onboarding copié !");
                          }} className="p-2 lg:p-3 text-zinc-400 hover:text-[#39FF14] hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm" title="Copier lien d'invitation"><ExternalLink size={18} className="lg:w-4 lg:h-4"/></button>
                          <button onClick={() => handleDeleteItem('clients', c.id)} className="p-2 lg:p-3 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} className="lg:w-4 lg:h-4"/></button>
                        </td>
                      </tr>
                    ))}
                    {filteredContacts.length === 0 && (
                      <tr><td colSpan={4} className="p-10 lg:p-16 text-center text-zinc-300 font-black uppercase text-xs tracking-[0.3em] opacity-50">Base CRM filtrée : Aucun résultat trouvé</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
              )}
            </div>
          )}

          {/* ================= VUE BUSINESS INTELLIGENCE ================= */}
          {activeView === 'bi' && (() => {
             const saasCount = contacts.filter(c => c.type === 'Client' && c.saas && !['Add-on CM Pub', 'Onyx Boost', 'Onyx Modernize'].includes(c.saas)).length;
             const cmCount = contacts.filter(c => c.type === 'Client' && (c.saas === 'Add-on CM Pub' || (c.active_saas && c.active_saas.includes('cmpub')))).length;
             const saasData = [{ name: 'Vendus', value: saasCount, fill: '#39FF14' }, { name: 'Restant', value: Math.max(saasGoal - saasCount, 0), fill: '#27272a' }];
             const cmData = [{ name: 'Vendus', value: cmCount, fill: '#00E5FF' }, { name: 'Restant', value: Math.max(cmGoal - cmCount, 0), fill: '#27272a' }];
             
             return (
               <div className="space-y-12 animate-in fade-in slide-in-from-right-6 max-w-[1200px] mx-auto">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
                     <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-[#39FF14] shadow-lg shrink-0"><Activity size={32}/></div>
                        <div>
                           <h2 className={`font-sans text-3xl font-black uppercase tracking-tighter`}>Business Intelligence</h2>
                           <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Objectifs & Prévisions (Année 1)</p>
                        </div>
                     </div>
                     <div className="flex flex-wrap items-center gap-3">
                        <button onClick={handleExportBIPdf} className="flex items-center gap-2 bg-black text-[#39FF14] px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg w-max">
                           <Download size={14} /> Exporter PDF
                        </button>
                        <button onClick={async () => { setMrrGoal(500000); setSaasGoal(15); setCmGoal(3); await supabase.from('admin_settings').upsert({ id: 1, mrr_goal: 500000, saas_goal: 15, cm_goal: 3 }); }} className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-black dark:hover:text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors w-max">
                           <RefreshCcw size={14} /> Réinitialiser
                        </button>
                     </div>
                  </div>
  
                  <div className="grid md:grid-cols-2 gap-8">
                     <div onClick={() => { setEditingBiGoal('saas'); setBiGoalInputValue(saasGoal); }} className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center cursor-pointer hover:ring-2 hover:ring-black/20 dark:hover:ring-white/50 transition-all">
                        <h3 className="font-black uppercase text-lg mb-6">Objectif Ventes SaaS</h3>
                        <div className="h-48 w-full relative">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie data={saasData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270} stroke="none" />
                                 <Tooltip contentStyle={{ backgroundColor: '#000', borderRadius: '10px', border: 'none', color: '#fff' }} />
                              </PieChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-3xl font-black">{saasCount}/{saasGoal}</span>
                           </div>
                        </div>
                     </div>
  
                     <div onClick={() => { setEditingBiGoal('cm'); setBiGoalInputValue(cmGoal); }} className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col items-center cursor-pointer hover:ring-2 hover:ring-black/20 dark:hover:ring-white/50 transition-all">
                        <h3 className="font-black uppercase text-lg mb-6">Objectif Options CM & Pub</h3>
                        <div className="h-48 w-full relative">
                           <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                 <Pie data={cmData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} dataKey="value" startAngle={90} endAngle={-270} stroke="none" />
                                 <Tooltip contentStyle={{ backgroundColor: '#000', borderRadius: '10px', border: 'none', color: '#fff' }} />
                              </PieChart>
                           </ResponsiveContainer>
                           <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <span className="text-3xl font-black">{cmCount}/{cmGoal}</span>
                           </div>
                        </div>
                     </div>
                  </div>
  
                  <div onClick={() => { setEditingBiGoal('mrr'); setBiGoalInputValue(mrrGoal); }} className="bg-white dark:bg-zinc-900 p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm cursor-pointer hover:ring-2 hover:ring-black/20 dark:hover:ring-white/50 transition-all">
                     <h3 className="font-black uppercase text-lg mb-6">MRR Tracker (Revenu Mensuel Récurrent)</h3>
                     <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700 flex-1 text-center w-full">
                           <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">MRR Actuel</p>
                           <p className="text-4xl font-black text-[#39FF14]">{stats.revenue.toLocaleString()} F</p>
                        </div>
                        <div className="bg-zinc-50 dark:bg-zinc-800 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-700 flex-1 text-center w-full">
                           <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-2">Objectif Mensuel</p>
                           <p className="text-4xl font-black text-black dark:text-white">{mrrGoal.toLocaleString()} F</p>
                        </div>
                     </div>
                     <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-6 rounded-full overflow-hidden relative shadow-inner">
                        <div className="h-full bg-black dark:bg-[#39FF14] transition-all duration-1000" style={{ width: `${Math.min((stats.revenue / mrrGoal) * 100, 100)}%` }}></div>
                     </div>
                     <p className="text-right text-xs font-bold text-zinc-400 mt-2">{Math.round((stats.revenue / mrrGoal) * 100)}% atteint</p>
                  </div>

                  {/* --- ANALYTICS CM & PUB --- */}
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-sm mt-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E5FF] opacity-[0.05] rounded-full blur-2xl pointer-events-none"></div>
                     <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="p-3 bg-[#00E5FF]/10 rounded-xl text-[#00E5FF]"><Megaphone size={24}/></div>
                        <h3 className="font-black uppercase text-xl text-white">Performances CM & Pub</h3>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Comptes Actifs</p>
                           <p className="text-4xl font-black text-white">{cmCount}</p>
                        </div>
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">MRR Généré (49.9k)</p>
                           <p className="text-4xl font-black text-[#00E5FF]">{(cmCount * 49900).toLocaleString()} F</p>
                        </div>
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Rétention Client</p>
                           <p className="text-4xl font-black text-green-400">100%</p>
                        </div>
                     </div>
                  </div>

                  {/* --- ANALYTICS AMBASSADEURS --- */}
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-sm mt-8 relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500 opacity-[0.05] rounded-full blur-2xl pointer-events-none"></div>
                     <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500"><Handshake size={24}/></div>
                        <h3 className="font-black uppercase text-xl text-white">Performances Programme Ambassadeur</h3>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Partenaires Actifs</p>
                           <p className="text-4xl font-black text-white">{partners.filter(p => p.status !== 'En attente').length}</p>
                        </div>
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Ventes Générées</p>
                           <p className="text-4xl font-black text-yellow-500">{partners.reduce((sum, p) => sum + (p.sales || 0), 0)}</p>
                        </div>
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">CA Estimé (Généré)</p>
                           <p className="text-4xl font-black text-[#39FF14]">{(partners.reduce((sum, p) => sum + (p.sales || 0), 0) * 13900).toLocaleString()} F</p>
                        </div>
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Commissions Payées</p>
                           <p className="text-4xl font-black text-white">{withdrawals.filter(w => w.status === 'Payé').reduce((sum, w) => sum + (Number(w.amount) || 0), 0).toLocaleString()} F</p>
                        </div>
                     </div>
                  </div>

                  {/* --- ANALYTICS CAMPAGNES E-MAILING --- */}
                  <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-sm mt-8 relative overflow-hidden mb-8">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500 opacity-[0.05] rounded-full blur-2xl pointer-events-none"></div>
                     <div className="flex items-center gap-4 mb-6 relative z-10">
                        <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500"><Mail size={24}/></div>
                        <h3 className="font-black uppercase text-xl text-white">Performances E-Mailing</h3>
                     </div>
                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Emails Envoyés (Mois)</p>
                           <p className="text-4xl font-black text-white">12 450</p>
                        </div>
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Taux d'Ouverture</p>
                           <p className="text-4xl font-black text-purple-400">42.8%</p>
                        </div>
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Taux de Clic (CTR)</p>
                           <p className="text-4xl font-black text-[#39FF14]">18.5%</p>
                        </div>
                        <div className="bg-black border border-zinc-800 p-6 rounded-2xl flex flex-col justify-center">
                           <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Désabonnements</p>
                           <p className="text-4xl font-black text-red-400">0.2%</p>
                        </div>
                     </div>
                  </div>
               </div>
             );
          })()}

          {/* ================= VUE KANBAN HIGH-TICKET ================= */}
          {activeView === 'kanban-ht' && (() => {
             const KANBAN_COLS = ['Nouveau Lead', 'Audit en cours', 'Contrat Envoyé', 'Signé'];
             const htContacts = contacts.filter(c => 
                (['Onyx Boost', 'Onyx Modernize', 'Add-on CM Pub'].includes(c.saas || '') || (c.active_saas && c.active_saas.includes('cmpub'))) &&
                (kanbanFilter === 'Tous' || c.saas === kanbanFilter)
             );
             
             return (
               <div className="space-y-8 animate-in fade-in slide-in-from-right-6 max-w-[1600px] mx-auto h-full flex flex-col">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm shrink-0">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-[#00E5FF] shadow-lg shrink-0"><Layers size={24}/></div>
                        <div>
                           <h2 className={`font-sans text-xl lg:text-2xl font-black uppercase tracking-tighter`}>Pipeline High-Ticket</h2>
                           <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Onyx Boost & Onyx Modernize</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-lg">
                           <button onClick={() => setKanbanFilter('Tous')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${kanbanFilter === 'Tous' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`}>Tous</button>
                           <button onClick={() => setKanbanFilter('Onyx Modernize')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${kanbanFilter === 'Onyx Modernize' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`}>Modernize</button>
                           <button onClick={() => setKanbanFilter('Onyx Boost')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${kanbanFilter === 'Onyx Boost' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`}>Boost</button>
                           <button onClick={() => setKanbanFilter('Add-on CM Pub')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${kanbanFilter === 'Add-on CM Pub' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`}>CM & Pub</button>
                        </div>
                     <button 
                        onClick={() => {
                            const trialEndDate = new Date();
                            trialEndDate.setDate(trialEndDate.getDate() + 7);
                            setEditingContact({
                              full_name: "",
                              phone: "",
                              password_temp: "central2026",
                              active_saas: [],
                              saas_expiration_dates: {},
                              expiration_date: trialEndDate.toISOString().split('T')[0],
                              type: "Prospect",
                              saas: "Onyx Modernize",
                              activity: "",
                              status: "Nouveau Lead",
                              source: "Admin Kanban"
                            });
                            setShowContactModal(true);
                            setProrataMsg("");
                        }}
                        className="bg-[#00E5FF] text-black px-6 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-[#00E5FF] transition-all shadow-lg active:scale-95 flex items-center gap-2 shrink-0"
                     >
                        <Plus size={16}/> Créer un dossier
                     </button>
                  </div>
                  </div>
  
                  <div className="flex gap-6 overflow-x-auto pb-6 flex-1 items-start custom-scrollbar">
                     {KANBAN_COLS.map(col => {
                        const colContacts = htContacts.filter(c => (c.status === col) || (col === 'Nouveau Lead' && !KANBAN_COLS.includes(c.status || '')));
                        return (
                           <div key={col} 
                                className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-4 w-80 shrink-0 flex flex-col max-h-[70vh]"
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    const id = e.dataTransfer.getData('contactId');
                                    if (id) updateKanbanStatus(id, col);
                                }}
                           >
                              <div className="flex justify-between items-center mb-4 px-2">
                                 <h3 className="font-black uppercase text-sm">{col}</h3>
                                 <span className="bg-black dark:bg-zinc-800 text-[#39FF14] text-[10px] font-black px-2 py-1 rounded-lg">{colContacts.length}</span>
                              </div>
                              <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar pr-1">
                                 {colContacts.map(c => {
                                    const isNew = c.created_at && (new Date().getTime() - new Date(c.created_at).getTime() < 24 * 60 * 60 * 1000);
                                    return (
                                    <div key={c.id} 
                                         draggable
                                         onDragStart={(e) => e.dataTransfer.setData('contactId', c.id)}
                                         className="bg-white dark:bg-black p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:border-black transition-colors group cursor-grab active:cursor-grabbing">
                                       <div className="flex justify-between items-start mb-2 gap-2">
                                          <div className="flex flex-wrap items-center gap-1.5">
                                             <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${c.saas === 'Onyx Modernize' ? 'bg-orange-100 text-orange-600' : c.saas === 'Onyx Boost' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>{c.saas}</span>
                                             {isNew && <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-red-500 text-white animate-pulse shadow-sm">Nouveau</span>}
                                          </div>
                                          <button onClick={() => { setEditingContact(c); setShowContactModal(true); }} className="text-zinc-300 hover:text-black dark:hover:text-white shrink-0 p-1"><Edit3 size={14}/></button>
                                       </div>
                                       <p className="font-black text-sm uppercase truncate mb-1">{c.full_name}</p>
                                       <p className="text-[10px] font-bold text-zinc-500 mb-2">{c.phone}</p>
                                       
                                       <div className="flex items-center gap-2 mb-3 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-800 focus-within:border-black dark:focus-within:border-white transition-colors">
                                          <DollarSign size={12} className="text-zinc-400 shrink-0" />
                                          <input 
                                            type="text"
                                            placeholder="Budget estimé..."
                                            defaultValue={c.budget || ''}
                                            onBlur={(e) => { if(e.target.value !== c.budget) updateLeadBudget(c.id, e.target.value); }}
                                            className="bg-transparent outline-none text-[10px] font-bold text-black dark:text-white placeholder:text-zinc-400 w-full"
                                          />
                                       </div>

                                       <select 
                                         value={c.status || 'Nouveau Lead'}
                                         onChange={(e) => updateKanbanStatus(c.id, e.target.value)}
                                         className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-bold p-2 rounded-xl outline-none focus:border-black dark:focus:border-white cursor-pointer"
                                       >
                                          {KANBAN_COLS.map(kCol => <option key={kCol} value={kCol}>{kCol}</option>)}
                                       </select>
                                       <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                                          <select 
                                            value={c.assigned_to || ''}
                                            onChange={(e) => updateLeadAssignee(c.id, e.target.value)}
                                            className="bg-transparent text-[10px] font-bold text-zinc-500 outline-none cursor-pointer"
                                          >
                                             <option value="">Non assigné</option>
                                       {activeSalesTeam.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                                          </select>
                                          {c.assigned_to && (
                                             <img 
                                          src={activeSalesTeam.find(s => s.name === c.assigned_to)?.avatar || `https://ui-avatars.com/api/?name=${c.assigned_to}`} 
                                                alt={c.assigned_to} 
                                                className="w-6 h-6 rounded-full border-2 border-white dark:border-black"
                                                title={`Assigné à ${c.assigned_to}`}
                                             />
                                          )}
                                       </div>
                                       <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex gap-2">
                                          <button onClick={() => generateAcompte(c)} className="flex-1 text-[10px] font-black uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5" title="Générer Acompte">
                                             <FileText size={12}/> Acompte
                                          </button>
                                          <button onClick={() => handleOpenQuoteModal(c)} className="flex-1 text-[10px] font-black uppercase text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:text-black dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-700 py-2 rounded-xl transition-colors flex items-center justify-center gap-1.5" title="Générer Devis">
                                             <ClipboardList size={12}/> Devis
                                          </button>
                                       </div>
                                    </div>
                                 );
                                 })}
                                 {colContacts.length === 0 && (
                                    <div className="p-4 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Vide</div>
                                 )}
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
             );
          })()}

          {/* ================= VUE FINANCES (FULL) ================= */}
          {activeView === 'finance' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-6 max-w-[1500px] mx-auto">
                {/* HEADER FINANCE */}
                <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-4 lg:p-5 rounded-[2rem] lg:rounded-2xl border border-zinc-200 shadow-sm gap-4 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-zinc-50 opacity-40 translate-x-20 -translate-y-20 rounded-full"></div>
                   <div className="flex items-center gap-4 lg:gap-5 relative z-10">
                      <div className="p-3 lg:p-4 bg-black rounded-xl text-[#39FF14] shadow-2xl shadow-[#39FF14]/10"><Wallet size={24} className="lg:w-8 lg:h-8"/></div>
                      <div>
                         <h2 className={`font-sans text-xl lg:text-2xl font-black uppercase tracking-tighter`}>Hub Financier</h2>
                         <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Registre des Revenus & Commissions 2026</p>
                      </div>
                   </div>
                   <div className="flex gap-4 relative z-10">
                      <button onClick={exportFinanceReport} className="w-full md:w-auto bg-black text-[#39FF14] px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl font-black uppercase text-[9px] lg:text-[10px] tracking-widest flex items-center justify-center gap-2 hover:scale-105 transition-all shadow-2xl active:scale-95">
                         <Download size={18}/> Exporter Rapport
                      </button>
                      <button onClick={handleExportFinanceExcel} className="hidden md:flex w-full md:w-auto bg-white text-black border border-zinc-200 px-5 lg:px-6 py-2.5 lg:py-3 rounded-xl font-black uppercase text-[9px] lg:text-[10px] tracking-widest items-center justify-center gap-2 hover:scale-105 transition-all shadow-sm active:scale-95">
                         <FileText size={18}/> Export Excel
                      </button>
                   </div>
                </div>
                
                {/* GRID FINANCIÈRE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                   {[
                      { label: 'Revenus Globaux', val: `${stats.revenue.toLocaleString('fr-FR')} F`, color: 'bg-black text-[#39FF14]', icon: TrendingUp },
                      { label: 'MRR (Clients actifs)', val: `${stats.revenue.toLocaleString('fr-FR')} F`, color: 'bg-white text-black border-zinc-200', icon: RefreshCcw },
                      { label: 'Commissions Dues', val: `${partners.filter(p => p.status !== 'En attente').reduce((s, p) => s + ((p.sales ?? 0) * 5000), 0).toLocaleString('fr-FR')} F`, color: 'bg-white text-black border-zinc-200', icon: Handshake },
                      { label: 'Clients Actifs', val: String(stats.activeClients), color: 'bg-red-50 text-red-600 border-red-100', icon: TrendingUp },
                   ].map((card, i) => (
                      <div key={i} className={`p-4 lg:p-5 rounded-[2rem] lg:rounded-2xl shadow-sm flex flex-col justify-between h-32 lg:h-40 border transition-all hover:translate-y-[-5px] ${card.color}`}>
                         <card.icon size={24} className="opacity-40" />
                         <div>
                            <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-60 mb-1 lg:mb-2">{card.label}</p>
                            <p className={`font-sans text-xl lg:text-2xl font-black tracking-tighter`}>{card.val}</p>
                         </div>
                      </div>
                   ))}
                </div>

                {/* TABLEAU TRANSACTIONS */}
                <div className="bg-white border border-zinc-200 rounded-[2rem] lg:rounded-2xl p-4 lg:p-6 shadow-sm overflow-x-auto">
                   <div className="flex flex-col lg:flex-row gap-4 mb-6 lg:mb-8">
                      <div className="flex-1 relative min-w-[300px]">
                         <Search className="absolute left-4 lg:left-5 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4 lg:w-5 lg:h-5" />
                         <input 
                           type="text" 
                           placeholder="Recherche : Client, Réf, Montant..." 
                           value={financeSearch} 
                           onChange={e => setFinanceSearch(e.target.value)} 
                           className="w-full pl-12 lg:pl-14 pr-4 lg:pr-5 py-2.5 lg:py-3 bg-zinc-50 border-none rounded-xl outline-none font-black text-[10px] lg:text-xs uppercase transition-all focus:ring-2 focus:ring-[#39FF14]/10 placeholder:text-zinc-300" 
                         />
                      </div>
                      <select value={financeTypeFilter} onChange={e => setFinanceTypeFilter(e.target.value)} className="px-4 lg:px-5 py-2.5 lg:py-3 bg-zinc-50 border-none rounded-xl font-black text-[9px] lg:text-[10px] uppercase tracking-widest cursor-pointer appearance-none text-zinc-500 hover:text-black outline-none focus:ring-2 focus:ring-zinc-100">
                         <option value="Tous">Base Transactions</option>
                         <option value="Entrée">Entrées (+) </option>
                         <option value="Sortie">Sorties (-) </option>
                      </select>
                   </div>

                   <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Date & Référence</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Désignation</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Flux Monétaire</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Statut Terminal</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                         {filteredTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-zinc-50 transition-all group">
                               <td className="p-3 lg:p-4">
                                  <p className="font-black text-[10px] lg:text-xs text-black">{t.date}</p>
                                  <p className="text-[9px] lg:text-[10px] font-black text-zinc-400 tracking-[0.15em] uppercase mt-1">{t.ref}</p>
                               </td>
                               <td className="p-3 lg:p-4">
                                  <p className="font-black text-xs lg:text-sm uppercase text-black tracking-tighter">{t.client}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                     <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400">{t.type}</p>
                                     {(contacts.find(c => c.full_name === t.client)?.activity || t.activity) && <span className="text-[8px] lg:text-[9px] font-black bg-zinc-200 text-black px-2 py-0.5 rounded-md uppercase">{contacts.find(c => c.full_name === t.client)?.activity || t.activity}</span>}
                                  </div>
                               </td>
                               <td className="p-3 lg:p-4">
                                  <div className={`flex items-baseline gap-2 font-black text-lg lg:text-xl tracking-tighter ${t.amount > 0 ? 'text-[#39FF14]' : 'text-red-500'}`}>
                                     {t.amount > 0 ? '+' : ''}{t.amount.toLocaleString()} <span className="text-[9px] lg:text-[10px] uppercase opacity-60">F CFA</span>
                                  </div>
                               </td>
                               <td className="p-3 lg:p-4 text-right">
                                  <span className={`text-[9px] lg:text-[10px] font-black uppercase px-3 lg:px-4 py-1.5 lg:py-2 rounded-xl shadow-sm ${t.status === 'Payé' || t.status === 'Versé' ? 'bg-[#39FF14]/10 text-black border border-[#39FF14]/20' : 'bg-yellow-50 text-yellow-600 border border-yellow-100'}`}>{t.status}</span>
                               </td>
                            </tr>
                         ))}
                         {filteredTransactions.length === 0 && (
                            <tr><td colSpan={4} className="p-10 lg:p-16 text-center text-zinc-300 font-black uppercase text-xs tracking-[0.3em] opacity-50">Aucune transaction trouvée</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* ================= VUE DEMANDES DE RETRAIT ================= */}
          {activeView === 'withdrawals' && (
             <div className="space-y-6 animate-in fade-in slide-in-from-right-6 max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 lg:p-5 rounded-[2rem] lg:rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
                   <div className="flex items-center gap-6 lg:gap-5 relative z-10">
                      <div className="w-14 lg:w-16 h-14 lg:h-16 bg-black rounded-[1.25rem] lg:rounded-[1.5rem] flex items-center justify-center text-[#39FF14] shadow-2xl shrink-0"><DollarSign size={24}/></div>
                      <div>
                         <h2 className={`font-sans text-xl lg:text-2xl font-black uppercase tracking-tighter`}>Retraits Ambassadeurs</h2>
                         <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Validation des commissions</p>
                      </div>
                   </div>
                  <div className="flex items-center gap-4 relative z-10">
                     <button onClick={handleExportWithdrawals} className="bg-black text-[#39FF14] px-4 py-2 rounded-lg font-black uppercase text-[10px] hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center gap-2">
                        <Download size={16}/> Export Payés
                     </button>
                     <select value={withdrawalFilter} onChange={e => setWithdrawalFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-zinc-200 text-[10px] font-bold focus:outline-none focus:border-[#39FF14] bg-zinc-50 dark:bg-zinc-900 cursor-pointer outline-none transition-colors">
                        <option value="Tous">Tous les retraits</option>
                        <option value="En attente">En attente</option>
                        <option value="Payé">Payés</option>
                        <option value="Rejeté">Rejetés</option>
                     </select>
                     <div className="flex flex-col items-end bg-zinc-50 dark:bg-zinc-900 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
                         <p className="text-[9px] font-black uppercase text-zinc-400 tracking-widest mb-1">Total en attente</p>
                         <p className="text-xl font-black text-orange-500">{withdrawals.filter(w => w.status === 'En attente').reduce((sum, w) => sum + (Number(w.amount) || 0), 0).toLocaleString()} F</p>
                     </div>
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2rem] lg:rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                   <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Date & Partenaire</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Méthode & Numéro</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Montant Demandé</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Action / Statut</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                        {withdrawals.filter(w => withdrawalFilter === 'Tous' || w.status === withdrawalFilter).map(w => (
                            <tr key={w.id} className="hover:bg-zinc-50 transition-all">
                               <td className="p-3 lg:p-4">
                                  <p className="font-black text-xs lg:text-sm uppercase text-black tracking-tighter leading-tight">{w.ambassador_name || "Inconnu"}</p>
                                  <p className="text-[10px] text-zinc-500 font-bold mt-1">{new Date(w.created_at).toLocaleString('fr-FR')}</p>
                               </td>
                               <td className="p-3 lg:p-4">
                                  <div className="flex flex-col gap-1">
                                     <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase w-max tracking-widest ${w.method === 'Wave' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>{w.method}</span>
                                     <p className="text-[10px] font-black text-black ml-1">{w.phone}</p>
                                  </div>
                               </td>
                               <td className="p-3 lg:p-4 text-center">
                                  <p className={`font-sans text-lg lg:text-xl font-black text-[#39FF14] tracking-tighter`}>{w.amount?.toLocaleString()} F</p>
                               </td>
                               <td className="p-3 lg:p-4 text-right">
                                  {w.status === 'En attente' ? (
                                    <div className="flex justify-end gap-2">
                                       <button onClick={() => { setValidateWithdrawalModal(w); setWithdrawalProof(''); }} className="bg-black text-[#39FF14] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center gap-1"><CheckCircle size={12}/> Valider</button>
                                        <button onClick={() => handleUpdateWithdrawalStatus(w.id, 'Rejeté')} className="bg-red-50 text-red-500 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase hover:bg-red-100 transition-all flex items-center gap-1"><X size={12}/> Rejeter</button>
                                    </div>
                                  ) : (
                                   <div className="flex flex-col items-end gap-1">
                                      <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${w.status === 'Payé' ? 'bg-[#39FF14]/20 text-[#39FF14]' : 'bg-red-500/20 text-red-500'}`}>
                                         {w.status}
                                      </span>
                                      {w.proof && <span className="text-[9px] text-zinc-400 font-bold truncate max-w-[150px]" title={w.proof}>Réf: {w.proof}</span>}
                                   </div>
                                  )}
                               </td>
                            </tr>
                         ))}
                         {withdrawals.length === 0 && (
                            <tr><td colSpan={4} className="p-10 lg:p-16 text-center text-zinc-300 font-black uppercase text-xs lg:text-sm tracking-[0.3em] opacity-50">Aucune demande de retrait</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>
             </div>
          )}

          {/* ================= VUE ECOSYSTEME (CATALOGUE SAAS) ================= */}
          {activeView === 'ecosystem' && (
             <div className="space-y-10 lg:space-y-16 animate-in fade-in slide-in-from-right-6 max-w-[1500px] mx-auto pt-6 lg:pt-10">
                <div className="text-center space-y-4 lg:space-y-6 max-w-4xl mx-auto px-4">
                   <div className="inline-block px-4 py-1.5 bg-black text-[#39FF14] rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.3em] mb-2 lg:mb-4 shadow-2xl shadow-[#39FF14]/20">Terminal Écosystème</div>
                   <h2 className={`font-sans text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter text-black dark:text-white leading-none`}>Onyx <span className="text-[#39FF14]">Ecosystem</span></h2>
                   <p className="text-xs lg:text-sm font-bold text-zinc-400 uppercase tracking-[0.2em] lg:tracking-[0.4em] leading-relaxed">Déploiement & Gouvernance du Catalogue SaaS</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-5">
                   {ECOSYSTEM_SAAS.filter(saas => saas.name.toLowerCase().includes(globalSearch.toLowerCase()) || saas.desc.toLowerCase().includes(globalSearch.toLowerCase())).map(saas => (
                      <div key={saas.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 lg:p-6 rounded-2xl shadow-sm hover:border-black dark:hover:border-zinc-600 hover:shadow-2xl transition-all group flex flex-col justify-between min-h-[250px] lg:min-h-[280px] relative overflow-hidden">
                         <div className={`absolute top-0 right-0 w-20 lg:w-24 h-20 lg:h-24 ${saas.color} opacity-[0.05] translate-x-8 lg:translate-x-10 -translate-y-8 lg:-translate-y-10 rounded-full group-hover:scale-150 transition-transform duration-1000`}></div>
                         <div className="relative z-10">
                            <div className={`w-10 h-10 rounded-xl mb-4 lg:mb-5 flex items-center justify-center text-white shadow-lg ${saas.color} group-hover:rotate-12 transition-transform duration-500`}><Box size={20} className="lg:w-5 lg:h-5"/></div>
                            <h3 className={`font-sans text-base lg:text-lg font-black uppercase text-black dark:text-white tracking-tighter leading-tight`}>{saas.name}</h3>
                            <p className="text-[10px] lg:text-xs font-bold text-zinc-400 mt-1.5 lg:mt-2 leading-relaxed group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">{saas.desc}</p>
                            <p className="text-[10px] font-black text-[#39FF14] mt-2">{saas.price} {saas.price !== 'Sur Devis' ? '/ mois' : ''}</p>
                         </div>
                         <div className="mt-6 flex flex-col gap-2 relative z-10">
                            <button onClick={() => router.push(saas.link)} className="w-full bg-black text-[#39FF14] py-2 lg:py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] hover:scale-[1.03] transition-all shadow-md flex items-center justify-center gap-1.5 group/btn active:scale-95">
                               Config. Admin <ExternalLink size={12} className="group-hover/btn:translate-x-1 transition-transform"/>
                            </button>
                            <button onClick={() => { setShowSaasLogin(saas); setSaasModalMode('create'); }} className="w-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white py-2 lg:py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase tracking-[0.1em] hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95">
                               Créer Accès
                            </button>
                         </div>
                      </div>
                   ))}
                   {ECOSYSTEM_SAAS.filter(saas => saas.name.toLowerCase().includes(globalSearch.toLowerCase()) || saas.desc.toLowerCase().includes(globalSearch.toLowerCase())).length === 0 && (
                      <div className="col-span-full py-12 text-center text-zinc-400 font-bold text-sm border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                         Aucun module SaaS ne correspond à votre recherche.
                      </div>
                   )}
                </div>
             </div>
          )}

          {/* ================= VUE LOGISTIQUE & STOCK ================= */}
          {activeView === 'logistics' && (
            <div className="space-y-8 animate-in fade-in max-w-[1400px] mx-auto pt-6 lg:pt-10">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200">
                  <div className="flex items-center gap-5">
                     <div className="p-4 bg-black text-[#39FF14] rounded-2xl"><Truck size={32}/></div>
                     <div>
                        <h2 className="text-2xl font-black uppercase">Logistique & Stock</h2>
                        <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Matériel, TPE & Terminaux</p>
                     </div>
                  </div>
                  <button onClick={() => setShowAddHardwareModal(true)} className="flex items-center justify-center gap-2 bg-black text-[#39FF14] px-5 py-3 rounded-2xl font-black uppercase text-[10px] hover:scale-105 transition-all shadow-xl active:scale-95 shrink-0">
                     <Plus size={16}/> Ajouter Article
                  </button>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {hardwareStock.map(item => (
                      <div key={item.id} className={`p-6 rounded-[2rem] border transition-all ${item.qty <= item.min ? 'bg-red-50 border-red-200' : 'bg-white border-zinc-200'}`}>
                          <div className="flex justify-between items-start mb-4">
                              <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-zinc-100 text-zinc-500">{item.type}</span>
                              {item.qty <= item.min && <AlertTriangle size={18} className="text-red-500 animate-pulse"/>}
                          </div>
                          <p className="font-bold text-sm mb-4 h-10">{item.name}</p>
                          <div className="flex justify-between items-end">
                              <p className={`text-3xl font-black ${item.qty <= item.min ? 'text-red-500' : 'text-black'}`}>{item.qty}</p>
                              <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl">
                                  <button onClick={() => updateHardwareStock(item.id, -1)} className="p-2 hover:bg-white rounded-lg transition-colors"><Minus size={14}/></button>
                                  <button onClick={() => updateHardwareStock(item.id, 1)} className="p-2 hover:bg-white rounded-lg transition-colors"><Plus size={14}/></button>
                              </div>
                          </div>
                      </div>
                  ))}
               </div>
            </div>
          )}

          {/* ================= VUE AMBASSADEURS ================= */}
          {activeView === 'partners' && (
             <div className="space-y-6 animate-in fade-in max-w-[1400px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 lg:p-5 rounded-[2rem] lg:rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden">
   <div className="flex items-center gap-4 relative z-10">
      <div className="w-14 lg:w-16 h-14 lg:h-16 bg-black rounded-[1.25rem] lg:rounded-[1.5rem] flex items-center justify-center text-[#39FF14] shadow-2xl shrink-0"><Handshake size={28} className="lg:w-[32px] lg:h-[32px]"/></div>
      <div>
         <h2 className={`font-sans text-xl lg:text-2xl font-black uppercase tracking-tighter`}>Ambassadeurs Onyx</h2>
         <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Génération de Revenus & Croissance Réseau</p>
      </div>
   </div>
   <div className="flex items-center gap-4 relative z-10">
      <select value={partnerActivityFilter} onChange={e => setPartnerActivityFilter(e.target.value)} className="hidden sm:block px-4 py-3 rounded-2xl border border-zinc-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14] cursor-pointer appearance-none bg-white">
         <option value="Tous">Tous secteurs</option>
         {Array.from(new Set(partners.map(p => p.activity).filter(Boolean))).map(act => <option key={act as string} value={act as string}>{act as string}</option>)}
      </select>
      <input type="search" placeholder="Rechercher..." value={partnerSearch} onChange={e => setPartnerSearch(e.target.value)} className="px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium w-40 focus:outline-none focus:ring-2 focus:ring-[#39FF14]/30 focus:border-[#39FF14]" />
      <button onClick={() => setShowAddPartnerModal(true)} className="flex items-center justify-center gap-2 bg-black text-[#39FF14] px-4 py-2 rounded-xl font-black uppercase text-[9px] hover:scale-105 transition-all shadow-xl active:scale-95 shrink-0">
         <Plus size={16}/> Ajouter
      </button>
   </div>
</div>

                {/* KPIs cliquables */}
                {(() => {
                  const actifs = partners.filter(p => p.status !== 'En attente');
                  const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                  const nouveaux = actifs.filter(p => p.created_at && new Date(p.created_at) >= thirtyDaysAgo);
                  const bySales = [...actifs].sort((a, b) => ((b.sales ?? 0) - (a.sales ?? 0)));
                  const top = bySales.slice(0, 5);
                  const moins = bySales.slice(-5).reverse();
                  const gainsAReverser = actifs.reduce((s, p) => s + ((p.sales ?? 0) * 5000), 0);
                  return (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <button onClick={() => setPartnerKpiFilter(partnerKpiFilter === 'nouveaux' ? 'all' : 'nouveaux')} className={`p-4 rounded-[1.5rem] lg:rounded-2xl border-2 transition-all text-left ${partnerKpiFilter === 'nouveaux' ? 'bg-black text-[#39FF14] border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.2)]' : 'bg-white border-zinc-200 hover:border-[#39FF14]/50'}`}>
                        <UserPlus size={20} className="mb-2"/>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Nouveaux ambassadeurs</p>
                        <p className={`font-sans text-lg lg:text-xl font-black mt-1`}>{nouveaux.length}</p>
                      </button>
                      <button onClick={() => setPartnerKpiFilter(partnerKpiFilter === 'top' ? 'all' : 'top')} className={`p-4 rounded-[1.5rem] lg:rounded-2xl border-2 transition-all text-left ${partnerKpiFilter === 'top' ? 'bg-black text-[#39FF14] border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.2)]' : 'bg-white border-zinc-200 hover:border-[#39FF14]/50'}`}>
                        <TrendingUp size={20} className="mb-2"/>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Top performers</p>
                        <p className={`font-sans text-lg lg:text-xl font-black mt-1`}>{top.length}</p>
                      </button>
                      <button onClick={() => setPartnerKpiFilter(partnerKpiFilter === 'moins' ? 'all' : 'moins')} className={`p-4 rounded-[1.5rem] lg:rounded-2xl border-2 transition-all text-left ${partnerKpiFilter === 'moins' ? 'bg-black text-[#39FF14] border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.2)]' : 'bg-white border-zinc-200 hover:border-[#39FF14]/50'}`}>
                        <ArrowDownRight size={20} className="mb-2"/>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Moins performants</p>
                        <p className={`font-sans text-lg lg:text-xl font-black mt-1`}>{moins.length}</p>
                      </button>
                      <button onClick={() => setPartnerKpiFilter(partnerKpiFilter === 'gains' ? 'all' : 'gains')} className={`p-4 rounded-[1.5rem] lg:rounded-2xl border-2 transition-all text-left ${partnerKpiFilter === 'gains' ? 'bg-black text-[#39FF14] border-[#39FF14] shadow-[0_0_30px_rgba(57,255,20,0.2)]' : 'bg-white border-zinc-200 hover:border-[#39FF14]/50'}`}>
                        <Wallet size={20} className="mb-2"/>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-70">Gains à reverser</p>
                        <p className={`font-sans text-lg lg:text-xl font-black mt-1`}>{gainsAReverser.toLocaleString()} F</p>
                      </button>
                    </div>
                  );
                })()}

                {/* CANDIDATURES EN ATTENTE */}
                {partners.filter(p => p.status === 'En attente').length > 0 && (
                   <div className="bg-red-50 border-2 border-red-100 p-4 lg:p-5 rounded-[2rem] lg:rounded-2xl animate-pulse">
                      <h3 className="font-black uppercase text-xs text-red-600 mb-4 flex items-center gap-2 tracking-[0.2em]"><AlertCircle size={16}/> Dossiers en attente de validation</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                         {partners.filter(p => p.status === 'En attente').map(ambassador => (
                            <div key={ambassador.id} className="bg-white p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-3 shadow-sm border border-red-100 group">
                               <div>
                                  <p className="font-black text-xs uppercase text-black">{ambassador.full_name}</p>
                                  <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">{ambassador.contact} • {ambassador.activity}</p>
                               </div>
                               <button onClick={() => approveAmbassador(ambassador.id)} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[9px] font-black uppercase hover:scale-105 transition-all shadow-xl active:scale-95 w-full sm:w-auto">Valider</button>
                            </div>
                         ))}
                      </div>
                   </div>
                )}

                <div className="bg-white border border-zinc-200 rounded-[2rem] lg:rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
                   <table className="w-full text-left min-w-[800px]">
                      <thead className="bg-zinc-50/50 border-b border-zinc-100">
                         <tr>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Ambassadeur & Contact</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Secteur / Statut</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Volume Ventes</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Contrôle</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50">
                         {(() => {
                           const actifs = partners.filter(p => p.status !== 'En attente');
                           const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                           const bySales = [...actifs].sort((a, b) => ((b.sales ?? 0) - (a.sales ?? 0)));
                           let list = actifs;
                           if (partnerKpiFilter === 'nouveaux') list = actifs.filter(p => p.created_at && new Date(p.created_at) >= thirtyDaysAgo);
                           else if (partnerKpiFilter === 'top') list = bySales.slice(0, 5);
                           else if (partnerKpiFilter === 'moins') list = bySales.slice(-5).reverse();
                           else if (partnerKpiFilter === 'gains') list = actifs.filter(p => (p.sales ?? 0) > 0);
                           if (partnerActivityFilter !== 'Tous') list = list.filter(p => (p.activity || 'Non défini') === partnerActivityFilter);
                           if (partnerSearch || globalSearch) list = list.filter(p => [p.full_name, p.contact, p.activity].some(v => String(v||'').toLowerCase().includes((globalSearch || partnerSearch).toLowerCase())));
                           return list;
                         })().map(p => (
                            <tr key={p.id} className="hover:bg-zinc-50 transition-all">
                               <td className="p-3 lg:p-4">
                                  <p className="font-black text-xs lg:text-sm uppercase text-black tracking-tighter leading-tight">{p.full_name}</p>
                                  <p className="text-xs text-[#39FF14] font-black mt-1">{p.contact}</p>
                               </td>
                               <td className="p-3 lg:p-4">
                                  <div className="flex flex-col gap-2">
                                     <span className="bg-zinc-100 text-black px-3 py-1 rounded-xl text-[9px] font-black uppercase w-max tracking-widest">{p.activity}</span>
                                     <p className="text-[9px] font-black text-[#39FF14] uppercase ml-2 mt-1">{p.status}</p>
                                  </div>
                               </td>
                               <td className="p-3 lg:p-4 text-center">
                                  <p className={`font-sans text-xl lg:text-2xl font-black text-black tracking-tighter`}>{p.sales || 0}</p>
                                  <p className="text-[9px] lg:text-[10px] font-bold text-zinc-400 uppercase mt-1">Ventes Clôturées</p>
                               </td>
                               <td className="p-3 lg:p-4 text-right">
                                  <button onClick={() => { setSelectedPartner(p); setShowPartnerModal(true); }} className="bg-black text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#39FF14] hover:text-black transition-all shadow-xl active:scale-95">Console Détails</button>
                               </td>
                            </tr>
                         ))}
                         {(() => {
                           const actifs = partners.filter(p => p.status !== 'En attente');
                           const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                           const bySales = [...actifs].sort((a, b) => ((b.sales ?? 0) - (a.sales ?? 0)));
                           let list = actifs;
                           if (partnerKpiFilter === 'nouveaux') list = actifs.filter(p => p.created_at && new Date(p.created_at) >= thirtyDaysAgo);
                           else if (partnerKpiFilter === 'top') list = bySales.slice(0, 5);
                           else if (partnerKpiFilter === 'moins') list = bySales.slice(-5).reverse();
                           else if (partnerKpiFilter === 'gains') list = actifs.filter(p => (p.sales ?? 0) > 0);
                           if (partnerActivityFilter !== 'Tous') list = list.filter(p => (p.activity || 'Non défini') === partnerActivityFilter);
                           if (partnerSearch || globalSearch) list = list.filter(p => [p.full_name, p.contact, p.activity].some(v => String(v||'').toLowerCase().includes((globalSearch || partnerSearch).toLowerCase())));
                           return list.length === 0;
                         })() && (
                            <tr><td colSpan={4} className="p-20 lg:p-32 text-center text-zinc-300 font-black uppercase text-xs lg:text-sm tracking-[0.3em] opacity-50">Aucun ambassadeur trouvé</td></tr>
                         )}
                      </tbody>
                   </table>
                </div>

                {/* MATÉRIEL MARKETING */}
                <div className="mt-6 bg-white border border-zinc-200 rounded-[2rem] lg:rounded-2xl shadow-sm p-5 lg:p-8">
                  <h3 className="text-xl font-black uppercase text-black mb-6">Matériel Marketing (Ambassadeurs & Commerciaux)</h3>
                  
                  {/* Formulaire d'ajout */}
                  {editingMaterial ? (
                    <form onSubmit={handleUpdateMaterial} className="mb-8 p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                      <div className="flex justify-between items-center mb-2">
                         <h4 className="font-black uppercase">Modifier la ressource</h4>
                         <button type="button" onClick={() => setEditingMaterial(null)}><X size={16}/></button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input type="text" placeholder="Titre" value={editingMaterial.title} onChange={e => setEditingMaterial({...editingMaterial, title: e.target.value})} className="w-full p-3 bg-white border border-zinc-200 rounded-xl font-medium text-sm focus:outline-none" />
                        <select value={editingMaterial.type} onChange={e => setEditingMaterial({...editingMaterial, type: e.target.value})} className="w-full p-3 bg-white border border-zinc-200 rounded-xl font-medium text-sm focus:outline-none">
                          <option>Canva</option>
                          <option>PDF</option>
                          <option>Vidéo</option>
                          <option>Image</option>
                        </select>
                        <input type="url" placeholder="URL" value={editingMaterial.url} onChange={e => setEditingMaterial({...editingMaterial, url: e.target.value})} className="w-full p-3 bg-white border border-zinc-200 rounded-xl font-medium text-sm focus:outline-none" />
                      </div>
                      <button type="submit" className="w-full md:w-auto bg-black text-[#39FF14] px-8 py-3 rounded-xl text-xs font-black uppercase hover:bg-zinc-800 transition-all">
                        Enregistrer les modifications
                      </button>
                    </form>
                  ) : (
                  <form onSubmit={handleAddMaterial} className="mb-8 p-6 bg-zinc-50 rounded-3xl border border-zinc-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input 
                        type="text"
                        placeholder="Titre de la ressource"
                        value={newMaterial.title}
                        onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                        className="w-full p-3 bg-white border border-zinc-200 rounded-xl font-medium text-sm focus:outline-none focus:border-black"
                      />
                      <select 
                        value={newMaterial.type}
                        onChange={e => setNewMaterial({...newMaterial, type: e.target.value})}
                        className="w-full p-3 bg-white border border-zinc-200 rounded-xl font-medium text-sm focus:outline-none focus:border-black"
                      >
                        <option>Canva</option>
                        <option>PDF</option>
                        <option>Vidéo</option>
                        <option>Image</option>
                      </select>
                      <input 
                        type="url"
                        placeholder="URL du lien"
                        value={newMaterial.url}
                        onChange={e => setNewMaterial({...newMaterial, url: e.target.value})}
                        className="w-full p-3 bg-white border border-zinc-200 rounded-xl font-medium text-sm focus:outline-none focus:border-black"
                      />
                    </div>
                    <button type="submit" className="w-full md:w-auto bg-black text-white px-8 py-3 rounded-xl text-xs font-black uppercase hover:bg-zinc-800 transition-all">
                      Ajouter la ressource
                    </button>
                  </form>
                  )}

                  {/* Liste des ressources */}
                  {(() => {
                     const videos = marketingMaterials.filter(m => m.type === 'Vidéo');
                     const photos = marketingMaterials.filter(m => m.type !== 'Vidéo');

                     return (
                        <div className="space-y-8">
                           {videos.length > 0 && (
                             <div>
                                <h4 className="font-black text-sm uppercase mb-4 flex items-center gap-2 text-black"><PlayCircle size={18} className="text-[#39FF14]"/> Vidéos de Démo</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                   {videos.map(material => (
                                     <div key={material.id} className="bg-zinc-50 rounded-2xl border border-zinc-100 p-4 flex flex-col justify-between hover:border-black transition-colors group overflow-hidden">
                                        <div>
                                           <div className="w-full h-32 mb-3 bg-zinc-800 rounded-xl overflow-hidden relative">
                                              <img src={`https://img.youtube.com/vi/${material.url.split('v=')[1]?.split('&')[0]}/hqdefault.jpg`} alt={material.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e:any) => e.target.src = 'https://placehold.co/600x400/111/39FF14?text=Vidéo'} />
                                              <span className="absolute top-2 left-2 px-2 py-1 text-[9px] font-black uppercase rounded-lg bg-black text-[#39FF14] tracking-widest">{material.type}</span>
                                           </div>
                                           <div className="flex justify-between items-start mb-2">
                                              <p className="font-bold text-sm text-black line-clamp-2 pr-2">{material.title}</p>
                                              <div className="flex gap-1 shrink-0">
                                                 <button onClick={() => setEditingMaterial(material)} className="p-1.5 text-zinc-400 hover:text-blue-600 bg-white rounded-lg shadow-sm transition-colors"><Edit3 size={14}/></button>
                                                 <button onClick={() => handleDeleteMaterial(material.id)} className="p-1.5 text-zinc-400 hover:text-red-600 bg-white rounded-lg shadow-sm transition-colors"><Trash2 size={14}/></button>
                                              </div>
                                           </div>
                                           <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-500 hover:underline truncate block">{material.url}</a>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           )}

                           {photos.length > 0 && (
                             <div>
                                <h4 className="font-black text-sm uppercase mb-4 flex items-center gap-2 text-black"><FileText size={18} className="text-purple-500"/> Visuels & Documents</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                   {photos.map(material => (
                                     <div key={material.id} className="bg-zinc-50 rounded-2xl border border-zinc-100 p-4 flex flex-col justify-between hover:border-black transition-colors group overflow-hidden">
                                        <div>
                                           {material.type === 'Image' && (
                                              <div className="w-full h-32 mb-3 bg-zinc-200 rounded-xl overflow-hidden relative">
                                                 <img src={material.url} alt={material.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" onError={(e:any) => e.target.style.display = 'none'} />
                                                 <span className="absolute top-2 left-2 px-2 py-1 text-[9px] font-black uppercase rounded-lg tracking-widest bg-blue-100 text-blue-700">{material.type}</span>
                                              </div>
                                           )}
                                           <div className="flex justify-between items-start mb-2">
                                              <div>
                                                 {material.type !== 'Image' && (
                                                    <span className={`inline-block mb-2 px-2 py-1 text-[9px] font-black uppercase rounded-lg tracking-widest ${material.type === 'Canva' ? 'bg-purple-100 text-purple-700' : material.type === 'PDF' ? 'bg-red-100 text-red-700' : 'bg-zinc-200 text-zinc-700'}`}>{material.type}</span>
                                                 )}
                                                 <p className="font-bold text-sm text-black line-clamp-2 pr-2">{material.title}</p>
                                              </div>
                                              <div className="flex gap-1 shrink-0">
                                                 <button onClick={() => setEditingMaterial(material)} className="p-1.5 text-zinc-400 hover:text-blue-600 bg-white rounded-lg shadow-sm transition-colors"><Edit3 size={14}/></button>
                                                 <button onClick={() => handleDeleteMaterial(material.id)} className="p-1.5 text-zinc-400 hover:text-red-600 bg-white rounded-lg shadow-sm transition-colors"><Trash2 size={14}/></button>
                                              </div>
                                           </div>
                                           <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-500 hover:underline truncate block">{material.url}</a>
                                        </div>
                                     </div>
                                   ))}
                                </div>
                             </div>
                           )}

                           {marketingMaterials.length === 0 && (
                             <div className="p-10 text-center text-zinc-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-zinc-100 rounded-[2rem]">
                               Aucun matériel marketing ajouté.
                             </div>
                           )}
                        </div>
                     );
                  })()}
                </div>
             </div>
          )}

      {/* ================= VUE ÉQUIPE COMMERCIALE ================= */}
      {activeView === 'team' && (
         <div className="space-y-6 animate-in fade-in max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white dark:bg-zinc-900 p-4 lg:p-5 rounded-[2rem] lg:rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden">
               <div className="flex items-center gap-6 lg:gap-5 relative z-10">
                  <div className="w-12 lg:w-16 h-12 lg:h-16 bg-black rounded-xl lg:rounded-2xl flex items-center justify-center text-[#39FF14] shadow-2xl shrink-0"><Briefcase size={24} className="lg:w-[28px] lg:h-[28px]"/></div>
                  <div>
                     <h2 className={`font-sans text-xl lg:text-2xl font-black uppercase tracking-tighter`}>Équipe Commerciale</h2>
                     <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Agents Onyx Hub</p>
                  </div>
               </div>
               <div className="flex flex-wrap items-center justify-end gap-3 relative z-10 w-full md:w-auto mt-4 md:mt-0">
                  <button onClick={handleExportCommercialsExcel} className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white px-4 py-2 rounded-lg font-black uppercase text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm active:scale-95 shrink-0">
                     <Download size={14}/> Excel
                  </button>
                  <button onClick={handleExportCommercialsPDF} className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-black dark:text-white px-4 py-2 rounded-lg font-black uppercase text-xs hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all shadow-sm active:scale-95 shrink-0">
                     <FileText size={14}/> PDF
                  </button>
                  <button onClick={() => setShowAddCommercialModal(true)} className="flex items-center justify-center gap-2 bg-black text-[#39FF14] px-4 py-2 rounded-lg font-black uppercase text-[10px] hover:scale-105 transition-all shadow-xl active:scale-95 shrink-0">
                     <UserPlus size={16}/> Nouveau Commercial
                  </button>
               </div>
            </div>

            {/* PODIUM GAMIFICATION */}
            {(() => {
                const sortedComms = [...commercials].map(c => {
                    const commClients = contacts.filter(cont => ((cont.commercial_id && String(cont.commercial_id) === String(c.id)) || cont.assigned_to === c.full_name) && cont.type?.trim().toLowerCase() === 'client');
                    const sales = commClients.length;
                    const caTotal = commClients.reduce((acc, cont) => acc + getSaasPrice(cont.saas || ''), 0);
                    return { ...c, sales, caTotal };
                }).sort((a, b) => b.sales - a.sales);
                
                if (sortedComms.length === 0) return null;
                
                return (
                    <div className="flex items-end justify-center gap-4 mb-6 mt-4 px-2">
                        {sortedComms.length > 1 && (
                            <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-100">
                                <div className="w-12 h-12 rounded-full bg-zinc-300 flex items-center justify-center font-black text-xl mb-2">{sortedComms[1].full_name.charAt(0)}</div>
                                <div className="bg-zinc-200 dark:bg-zinc-800 w-24 sm:w-32 h-32 rounded-t-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-zinc-400">
                                    <span className="text-2xl font-black text-zinc-500">2</span>
                                    <span className="text-xs font-bold mt-2">{sortedComms[1].sales} ventes</span>
                                    <span className="text-[9px] font-black text-zinc-500 mt-1">{sortedComms[1].caTotal.toLocaleString()} F</span>
                                </div>
                                <p className="text-xs font-black uppercase mt-3">{sortedComms[1].full_name.split(' ')[0]}</p>
                            </div>
                        )}
                        <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700">
                            <div className="w-16 h-16 rounded-full bg-yellow-400 flex items-center justify-center font-black text-2xl mb-2 border-4 border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,0.4)]">{sortedComms[0].full_name.charAt(0)}</div>
                            <div className="bg-gradient-to-t from-yellow-500/20 to-yellow-400 w-28 sm:w-36 h-40 rounded-t-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-yellow-300 shadow-2xl">
                                <span className="text-3xl font-black text-yellow-900">1</span>
                                <span className="text-sm font-black mt-2 text-yellow-800">{sortedComms[0].sales} ventes</span>
                                <span className="text-[10px] font-black text-yellow-700 mt-1">{sortedComms[0].caTotal.toLocaleString()} F</span>
                            </div>
                            <p className="text-sm font-black uppercase mt-3 text-yellow-500">{sortedComms[0].full_name.split(' ')[0]}</p>
                        </div>
                        {sortedComms.length > 2 && (
                            <div className="flex flex-col items-center animate-in slide-in-from-bottom-8 duration-700 delay-200">
                                <div className="w-12 h-12 rounded-full bg-orange-400 flex items-center justify-center font-black text-xl mb-2">{sortedComms[2].full_name.charAt(0)}</div>
                                <div className="bg-orange-100 dark:bg-orange-900/50 w-24 sm:w-32 h-24 rounded-t-2xl flex flex-col items-center justify-start pt-4 border-t-4 border-orange-500">
                                    <span className="text-2xl font-black text-orange-600">3</span>
                                    <span className="text-xs font-bold mt-2 text-orange-500">{sortedComms[2].sales} ventes</span>
                                    <span className="text-[9px] font-black text-orange-500 mt-1">{sortedComms[2].caTotal.toLocaleString()} F</span>
                                </div>
                                <p className="text-xs font-black uppercase mt-3">{sortedComms[2].full_name.split(' ')[0]}</p>
                            </div>
                        )}
                    </div>
                );
            })()}

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] lg:rounded-2xl overflow-hidden shadow-sm overflow-x-auto mt-4">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-zinc-50/50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                        <tr>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Commercial</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Contact</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Clics</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Ventes Validées</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Taux Conv.</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">CA Généré</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Dernière Vente</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-center">Statut</th>
                            <th className="p-3 lg:p-4 text-[9px] lg:text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                        {commercials.map(comm => {
                            const commClients = contacts.filter(c => ((c.commercial_id && String(c.commercial_id) === String(comm.id)) || c.assigned_to === comm.full_name) && c.type?.trim().toLowerCase() === 'client');
                            const repSales = commClients.length;
                            const caTotal = commClients.reduce((acc, c) => acc + getSaasPrice(c.saas || ''), 0);
                            const rawConvRate = (comm.clicks || 0) > 0 ? (repSales / comm.clicks) * 100 : 0;
                            const convRate = rawConvRate > 0 ? rawConvRate.toFixed(1) + '%' : '0%';
                            const lastSaleDate = repSales > 0 
                               ? new Date(Math.max(...commClients.map(c => new Date(c.created_at || 0).getTime()))).toLocaleDateString('fr-FR')
                               : '-';
                            return (
                                <tr key={comm.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-3 lg:p-4 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white dark:border-zinc-800 shadow-sm shrink-0">
                                            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(comm.full_name)}&background=random`} alt={comm.full_name} className="w-full h-full object-cover" />
                                        </div>
                                        <p className="font-black text-sm uppercase text-black dark:text-white">{comm.full_name}</p>
                                    </td>
                                    <td className="p-3 lg:p-4">
                                        <p className="text-xs font-bold text-zinc-500">{comm.phone}</p>
                                    </td>
                                    <td className="p-3 lg:p-4 text-center">
                                        <span className="text-sm font-black text-zinc-500 dark:text-zinc-400">{comm.clicks || 0}</span>
                                    </td>
                                    <td className="p-3 lg:p-4 text-center">
                                        <span className="text-xl font-black text-[#39FF14]">{repSales}</span>
                                    </td>
                                    <td className="p-3 lg:p-4 text-center">
                                        <span className={`text-sm font-black ${rawConvRate >= 15 ? 'bg-[#39FF14]/10 text-[#39FF14] px-3 py-1.5 rounded-lg border border-[#39FF14]/30 shadow-sm' : 'text-zinc-500 dark:text-zinc-400'}`}>{convRate}</span>
                                    </td>
                                    <td className="p-3 lg:p-4 text-center">
                                        <span className="text-[10px] font-black text-black dark:text-white uppercase tracking-widest">{caTotal.toLocaleString('fr-FR')} F</span>
                                    </td>
                                    <td className="p-3 lg:p-4 text-center">
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{lastSaleDate}</span>
                                    </td>
                                    <td className="p-3 lg:p-4 text-center">
                                        <span className={`px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest ${comm.status === 'Actif' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>{comm.status}</span>
                                    </td>
                                    <td className="p-3 lg:p-4 text-right space-x-2">
                                        <button onClick={() => { setCommissionModal(comm); setCommissionAmount(''); }} className="p-2 bg-green-50 dark:bg-green-900/30 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors" title="Attribuer Prime Manuelle">
                                            <DollarSign size={16}/>
                                        </button>
                                        <button onClick={() => { setViewCommercialClients(comm); setCommercialHistoryFilter('all'); }} className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-500 hover:bg-purple-500 hover:text-white rounded-lg transition-colors" title="Historique d'Acquisition">
                                            <Users size={16}/>
                                        </button>
                                        <button onClick={() => {
                                            setEditCommercialForm({
                                                id: comm.id,
                                                full_name: comm.full_name,
                                                phone: comm.phone,
                                                status: comm.status || 'Actif',
                                                password_temp: comm.password_temp || 'central2026',
                                                objective: comm.objective || 20
                                            });
                                            setShowEditCommercialModal(true);
                                        }} className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg transition-colors" title="Modifier">
                                            <Edit3 size={16}/>
                                        </button>
                                        <button onClick={() => handleDeleteItem('commercials', comm.id)} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-500 hover:bg-red-500 hover:text-white rounded-lg transition-colors" title="Supprimer">
                                            <Trash2 size={16}/>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {commercials.length === 0 && (
                            <tr>
                                <td colSpan={5} className="p-8 text-center text-zinc-500 font-bold uppercase text-xs tracking-widest italic opacity-50">Aucun commercial trouvé</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
         </div>
      )}

          {/* ================= VUE MARKETING ================= */}
          {activeView === 'marketing' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-6 max-w-[1200px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-4 lg:p-5 rounded-[2rem] lg:rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group gap-4">
                   <div className="flex items-center gap-4 lg:gap-5 relative z-10">
                      <div className="w-14 lg:w-16 h-14 lg:h-16 bg-black rounded-[1.25rem] lg:rounded-[1.5rem] flex items-center justify-center text-[#39FF14] shadow-2xl group-hover:rotate-12 transition-all shrink-0"><Megaphone size={28} className="lg:w-[32px] lg:h-[32px]"/></div>
                      <div>
                         <h2 className={`font-sans text-2xl lg:text-3xl font-black uppercase tracking-tighter`}>Hub Marketing</h2>
                         <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Articles de Blog & Stratégies de Capture IA</p>
                      </div>
                   </div>
                   <button onClick={runIAArticleSuggestion} className="w-full md:w-auto bg-black text-[#39FF14] px-6 lg:px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-2xl hover:scale-105 transition-all relative z-10 active:scale-95">
                      <Sparkles size={16} className="lg:w-[18px] lg:h-[18px]"/> Suggestion IA Article
                   </button>
                </div>

                <div className="space-y-6 lg:space-y-8">
                   {marketingArticles.map((article: any) => (
                      <div key={article.id} className="bg-white p-5 lg:p-8 rounded-[2rem] lg:rounded-2xl border border-zinc-200 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 lg:gap-6 hover:border-black transition-all group">
                         <div className="flex-1 w-full">
                            <div className="flex flex-wrap gap-3 lg:gap-4 mb-4 lg:mb-6">
                               <span className="bg-black text-[#39FF14] px-3 lg:px-4 py-1.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">{article.category || 'Stratégie'}</span>
                               <span className="bg-zinc-100 text-zinc-500 px-3 lg:px-4 py-1.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-[0.2em]">Cible : {article.cible || 'Tous'}</span>
                            </div>
                            <h3 className={`font-sans text-xl lg:text-2xl font-black uppercase text-black tracking-tighter mb-3 lg:mb-4 group-hover:text-[#39FF14] transition-colors leading-tight`}>{article.title}</h3>
                            <p className="text-zinc-500 font-medium text-sm lg:text-base leading-relaxed max-w-2xl opacity-80">{article.desc}</p>
                         </div>
                         <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:gap-4 w-full lg:w-max">
                            <button onClick={() => { setShowDiffusionModal(article); setSelectedContactsForDiffusion([]); }} className="flex-1 lg:flex-none bg-[#39FF14] text-black px-4 lg:px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-black hover:text-[#39FF14] transition-all shadow-xl flex items-center justify-center gap-2 active:scale-95">
                               <Send size={16} className="lg:w-[18px] lg:h-[18px]"/> Diffuser Segment
                            </button>
                            
                            <div className="flex gap-2">
                               <button onClick={() => setEditingArticle(article)} className="flex-1 bg-zinc-100 text-black py-2 lg:py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                                  <Edit3 size={14}/> Modifier
                               </button>
                               <button onClick={async () => {
                                   await supabase.from('marketing_articles').delete().eq('id', article.id);
                                   setMarketingArticles(prev => prev.filter((a: any) => a.id !== article.id));
                               }} className="flex-1 bg-red-50 text-red-500 py-2 lg:py-3 rounded-xl text-[9px] lg:text-[10px] font-black uppercase hover:bg-red-100 transition-all flex items-center justify-center gap-2">
                                  <Trash2 size={14}/> Supprimer
                               </button>
                            </div>
                         </div>
                      </div>
                   ))}
                   {marketingArticles.length === 0 && (
                      <div className="p-20 text-center text-zinc-400 font-black uppercase text-sm tracking-widest border-2 border-dashed border-zinc-200 rounded-[3rem]">Aucun article marketing trouvé</div>
                   )}
                </div>
             </div>
          )}

          {/* ================= VUE PLANNING MARKETING ================= */}
          {activeView === 'planning-marketing' && (
             <div className="space-y-12 animate-in fade-in max-w-[1200px] mx-auto">
                <div className="bg-white dark:bg-zinc-900 p-5 lg:p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <h2 className="text-xl md:text-2xl font-black uppercase mb-6 flex items-center gap-3 text-black dark:text-white"><Sparkles className="text-[#39FF14]"/> Suggestions IA ({iaSuggestions.length})</h2>
                    <div className="space-y-4">
                        {iaSuggestions.map(s => (
                            <div key={s.id} className="bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-700 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                <div>
                                    <p className="font-bold text-sm uppercase text-black dark:text-white">{s.title}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{s.description}</p>
                                </div>
                                <button onClick={async () => {
                                    const newAction: IAAction = {
                                        id: s.id, module: 'Marketing', title: s.title, desc: s.description, date: todayStr, status: 'En attente', phone: s.clientPhone, msg: s.msg, contactId: s.contactId
                                    };
                                    await supabase.from('actions_ia').insert([newAction]);
                                    setActionsIA(prev => [newAction, ...prev]);
                                    setIaSuggestions(prev => prev.filter(item => item.id !== s.id));
                                }} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition shadow-md whitespace-nowrap">
                                    Planifier
                                </button>
                            </div>
                        ))}
                        {iaSuggestions.length === 0 && (
                            <p className="text-sm text-zinc-500 italic py-8 text-center">Aucune suggestion pour le moment. Lancez un scan depuis le CRM.</p>
                        )}
                    </div>
                </div>
             </div>
          )}

          {/* ================= VUE JOURNAL IA ================= */}
          {activeView === 'journal-ia' && (
             <div className="space-y-12 animate-in fade-in slide-in-from-right-6 max-w-[1200px] mx-auto">
                <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-4 lg:p-5 rounded-[2rem] lg:rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden group gap-4">
                   <div className="flex items-center gap-4 relative z-10">
                      <div className="w-14 lg:w-16 h-14 lg:h-16 bg-black rounded-[1.25rem] lg:rounded-[1.5rem] flex items-center justify-center text-[#39FF14] shadow-2xl shrink-0"><FileText size={28}/></div>
                      <div>
                         <h2 className={`font-sans text-2xl lg:text-3xl font-black uppercase tracking-tighter`}>Journal & Actions IA</h2>
                         <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Registre complet des tâches planifiées</p>
                      </div>
                   </div>
                   <button onClick={() => setShowRapportIA(true)} className="w-full md:w-auto bg-[#39FF14] text-black px-6 lg:px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 shadow-xl hover:bg-black hover:text-[#39FF14] transition-all relative z-10 active:scale-95">
                      <Sparkles size={16}/> Lancer Scan CRM
                   </button>
                </div>

                <div className="bg-white border border-zinc-200 rounded-[2rem] lg:rounded-2xl p-4 lg:p-6 shadow-sm">
                   <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 border-b border-zinc-100 pb-6">
                      <h3 className="font-black uppercase text-lg text-black">Historique & Tâches ({actionsIA.length})</h3>
                      <div className="flex gap-3">
                         <button onClick={handleExportIAPdf} className="bg-zinc-100 text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2">
                            <Download size={16}/> Export PDF
                         </button>
                         {actionsIA.filter(a => a.status === 'En attente' && a.phone).length > 0 && (
                            <button onClick={executeAllWA} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2">
                               <Send size={16}/> Exécuter Tout
                            </button>
                         )}
                      </div>
                   </div>
                   <div className="space-y-4">
                      {actionsIA.map(action => (
                         <div key={action.id} className="bg-zinc-50 p-5 lg:p-6 rounded-[2.5rem] border border-zinc-100 flex flex-col xl:flex-row justify-between xl:items-center gap-6 hover:border-black transition-all">
                            <div>
                               <p className="text-[9px] font-black text-zinc-500 uppercase mb-1.5 tracking-[0.2em] flex items-center gap-2">
                                  <span className={`w-1.5 h-1.5 rounded-full ${action.status === 'En attente' ? 'bg-[#39FF14]' : action.status === 'En cours' ? 'bg-yellow-400 animate-pulse' : 'bg-zinc-500'}`}></span>
                                  {action.module} • {action.date}
                               </p>
                               <p className={`font-bold text-sm uppercase tracking-tight ${action.status === 'Réalisé' ? 'text-zinc-400 line-through' : 'text-black'}`}>{action.title}</p>
                               <p className="text-[10px] text-zinc-500 mt-1 font-medium italic">{action.desc}</p>
                            </div>
                            <div className="flex items-center gap-3 self-end xl:self-auto shrink-0">
                               {action.phone && action.status !== 'Réalisé' ? (
                                  <button onClick={() => executeWA(action.phone, action.msg, action.id)} className="bg-black text-[#39FF14] px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase hover:scale-105 transition-all shadow-xl active:scale-95">Exécuter WA</button>
                               ) : action.status === 'Réalisé' ? (
                                  <button className="bg-zinc-200 text-zinc-500 px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase border border-transparent cursor-default">Terminé</button>
                               ) : (
                                  <button className="bg-zinc-200 text-black px-6 py-3 rounded-[1.25rem] text-[10px] font-black uppercase hover:bg-zinc-300 transition-all active:scale-95">Détails</button>
                               )}
                               <button onClick={() => deleteActionIA(action.id)} className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16}/></button>
                            </div>
                         </div>
                      ))}
                      {actionsIA.length === 0 && (
                         <div className="p-12 text-center text-zinc-400 font-bold uppercase text-xs tracking-widest border-2 border-dashed border-zinc-100 rounded-[2rem]">
                            Le journal des actions IA est vide
                         </div>
                      )}
                   </div>
                </div>
             </div>
          )}

          {/* ================= VUE AIDE & TUTORIELS ================= */}
          {activeView === 'help' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 max-w-[1200px] mx-auto">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-white p-4 lg:p-5 rounded-[2rem] lg:rounded-2xl border border-zinc-200 shadow-sm relative overflow-hidden">
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-14 lg:w-16 h-14 lg:h-16 bg-black rounded-[1.25rem] lg:rounded-[1.5rem] flex items-center justify-center text-[#39FF14] shadow-2xl shrink-0"><HelpCircle size={28}/></div>
                    <div>
                       <h2 className={`font-sans text-2xl lg:text-3xl font-black uppercase tracking-tighter`}>Aide & Tutoriels</h2>
                       <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Maîtrisez votre Hub OnyxOps</p>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                     { title: "Gérer le CRM & Leads", desc: "Comment convertir vos leads en clients actifs et gérer les statuts.", icon: Users },
                     { title: "Planificateur Marketing IA", desc: "Utiliser l'intelligence artificielle pour relancer vos clients inactifs.", icon: Sparkles },
                     { title: "Finance & Commissions", desc: "Suivre vos revenus, votre marge nette et les commissions des ambassadeurs.", icon: Wallet },
                     { title: "Écosystème SaaS", desc: "Comment déployer Onyx Jaay, Onyx Menu, etc. pour un client.", icon: Box },
                     { title: "Configuration Boutique", desc: "Paramétrer les zones de livraison et l'assistant WhatsApp sur Onyx Jaay.", icon: Settings },
                     { title: "Cartographie des Hubs", desc: "Analyser la répartition géographique de vos clients et partenaires.", icon: MapPin },
                  ].map((tuto, i) => (
                     <div key={i} onClick={() => alert("Ce tutoriel vidéo sera bientôt disponible.")} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-black transition-all group cursor-pointer">
                        <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-black mb-6 group-hover:bg-black group-hover:text-[#39FF14] transition-colors"><tuto.icon size={20}/></div>
                        <h3 className="font-black text-lg uppercase mb-2 leading-tight">{tuto.title}</h3>
                        <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-6">{tuto.desc}</p>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#39FF14] bg-black px-4 py-2.5 rounded-xl w-max hover:scale-105 transition-transform"><PlayCircle size={14}/> Voir la vidéo</button>
                     </div>
                  ))}
              </div>
              
              <div className="bg-black text-white p-6 sm:p-8 rounded-3xl shadow-2xl border border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-6 mt-8">
                  <div><h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-2 text-[#39FF14]">Besoin d'aide supplémentaire ?</h3><p className="text-sm font-medium text-zinc-400">Notre équipe de support technique est disponible sur WhatsApp pour répondre à vos questions.</p></div>
                  <button onClick={() => window.open('https://wa.me/221785338417', '_blank')} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black text-xs uppercase hover:bg-white transition-colors shrink-0 whitespace-nowrap">Contacter le Support</button>
              </div>
            </div>
          )}

            </main>
            
            <footer className="mt-auto py-6 border-t border-zinc-200 dark:border-zinc-800 text-center text-[10px] font-black uppercase tracking-widest text-zinc-500 shrink-0">
               © 2026 ONYX OPS - QG CENTRAL SÉNÉGAL • DÉVELOPPÉ POUR LA CROISSANCE.
            </footer>
          </div>
        </div>

      {/* ================= MODALES TERMINAL ================= */}

      {/* MODALE SAAS: ACTIVATION & WhatsApp */}
      {showSaasLogin && saasModalMode === 'create' && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowSaasLogin, null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2rem] max-w-xl w-full relative shadow-[0_0_120px_rgba(57,255,20,0.15)] animate-in zoom-in-95 duration-500 border-t-[8px] border-[#39FF14] my-auto">
               <button onClick={() => setShowSaasLogin(null)} className="absolute top-6 sm:top-12 right-6 sm:right-12 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all active:scale-90"><X size={20} className="sm:w-[26px] sm:h-[26px]"/></button>
               
               <div className="text-center mb-10 sm:mb-14 mt-4 sm:mt-0">
                  <div className={`w-20 sm:w-24 h-20 sm:h-24 rounded-[2rem] sm:rounded-[2.75rem] flex items-center justify-center text-white ${showSaasLogin?.color} shadow-2xl mx-auto mb-6 sm:mb-8 animate-bounce-slow`}><Box size={40} className="sm:w-12 sm:h-12"/></div>
                  <h2 className={`font-sans text-3xl sm:text-4xl font-black uppercase text-black tracking-tighter leading-none`}>Activer {showSaasLogin?.name}</h2>
                  <p className="text-[10px] sm:text-xs font-bold text-zinc-400 mt-2 sm:mt-3 uppercase tracking-[0.2em] sm:tracking-[0.3em]">Générateur d'Accès Terminal SaaS</p>
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
                        <input type="tel" placeholder="NUMÉRO WHATSAPP (EX: +22177...)" value={saasCreateForm.phone} onChange={e => setSaasCreateForm({...saasCreateForm, phone: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all" />
                     </div>
                  )}

                  <div className="relative group">
                     <LockIcon size={18} className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-[#39FF14] transition-colors sm:w-5 sm:h-5" />
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
        <div id="modal-overlay" onClick={handleOutsideClick(setShowContactModal, false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 duration-500 border-t-[8px] border-black my-auto">
            <button onClick={() => setShowContactModal(false)} className="absolute top-6 sm:top-12 right-6 sm:right-12 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all active:scale-90"><X size={20} className="sm:w-6 sm:h-6"/></button>
            
            <h2 className={`font-sans text-3xl sm:text-4xl font-black uppercase tracking-tighter mb-10 sm:mb-14 text-black mt-2 sm:mt-0`}>{editingContact?.id ? 'Modifier Fiche' : 'Nouveau Membre CRM'}</h2>
            
            <form onSubmit={handleSaveContact} className="space-y-6 sm:space-y-8">
              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Désignation Membre</label>
                 <input type="text" required value={editingContact?.full_name || ""} onChange={e => setEditingContact({...editingContact, full_name: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="NOM COMPLET / ENTREPRISE" />
              </div>
              
              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Terminal Mobile (WhatsApp)</label>
                 <input type="tel" required value={editingContact?.phone || ""} onChange={e => setEditingContact({...editingContact, phone: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="+221 7x xxx xx xx" />
              </div>

              {/* GESTION MULTI-ABONNEMENTS */}
              <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4 sm:ml-6 block">
                   Abonnements Actifs
                </label>
                
                <div className="space-y-3">
                   {(() => {
                      const activeSaasList = (editingContact?.active_saas?.length ?? 0) > 0 
                         ? editingContact.active_saas 
                         : (editingContact?.saas ? [editingContact.saas] : []);
                      
                      if (!activeSaasList || activeSaasList.length === 0) {
                         return <p className="text-xs text-zinc-400 italic ml-4 sm:ml-6">Aucun abonnement actif.</p>;
                      }
                      
                      return activeSaasList.map((saas: string, idx: number) => (
                         <div key={idx} className="bg-zinc-50 dark:bg-zinc-900/50 p-4 sm:p-5 rounded-[1.75rem] border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#39FF14]">
                            <div>
                               <p className="font-black text-sm uppercase text-black dark:text-white">{saas}</p>
                               <p className="text-[10px] font-bold text-[#39FF14] uppercase tracking-widest mt-1">{getSaasPrice(saas).toLocaleString('fr-FR')} F/mois</p>
                            </div>
                            <div className="flex items-center gap-3">
                               <input 
                                  type="date"
                                  value={editingContact?.saas_expiration_dates?.[saas] || editingContact?.expiration_date || ''}
                                  onChange={e => handleSaasDateChange(saas, e.target.value)}
                                  className="p-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl font-bold text-xs outline-none focus:border-[#39FF14] transition-all text-black dark:text-white"
                                  title="Date de fin"
                               />
                               <button type="button" onClick={() => handleRemoveSaasFromContact(saas)} className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-colors" title="Retirer/Résilier">
                                  <Trash2 size={16} />
                               </button>
                            </div>
                         </div>
                      ));
                   })()}
                </div>

                <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                   <select 
                      onChange={handleAddSaasToContact} 
                      value=""
                      className="w-full p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl font-black text-[11px] sm:text-xs uppercase outline-none cursor-pointer appearance-none focus:border-[#39FF14] transition-all text-black dark:text-white"
                   >
                      <option value="" disabled>+ Ajouter un produit...</option>
                      <optgroup label="📦 PACKS SAAS">
                         <option value="Pack Tekki">Pack Tekki (22.900 F)</option>
                         <option value="OnyxTekki (Resto)">OnyxTekki (Resto) (22.900 F)</option>
                         <option value="Pack Tekki Pro">Pack Tekki Pro (27.900 F)</option>
                         <option value="Onyx CRM">Onyx CRM (39.900 F)</option>
                         <option value="Pack Onyx Gold">Pack Onyx Gold (59.900 F)</option>
                      </optgroup>
                      <optgroup label="🧩 MODULES INDIVIDUELS">
                         <option value="Onyx Jaay">Onyx Jaay (13.900 F)</option>
                         <option value="Onyx Menu">Onyx Menu (13.900 F)</option>
                         <option value="Onyx Booking">Onyx Booking (13.900 F)</option>
                         <option value="Onyx Staff">Onyx Staff (13.900 F)</option>
                         <option value="Onyx Stock">Onyx Stock (13.900 F)</option>
                         <option value="Onyx Tiak">Onyx Tiak (13.900 F)</option>
                         <option value="Onyx Tontine">Onyx Tontine (6.900 F)</option>
                      </optgroup>
                      <optgroup label="🚀 HIGH-TICKET">
                         <option value="Onyx Boost">Onyx Boost (150.000 F)</option>
                         <option value="Onyx Modernize">Onyx Modernize (300.000 F)</option>
                         <option value="Add-on CM Pub">Add-on CM Pub (49.900 F)</option>
                      </optgroup>
                   </select>
                </div>
                
                {prorataMsg && <p className="text-xs text-black font-bold bg-[#39FF14] p-3 rounded-xl animate-in fade-in">{prorataMsg}</p>}
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Région</label>
                 <select value={editingContact?.city || ""} onChange={e => setEditingContact({...editingContact, city: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all cursor-pointer appearance-none">
                    <option value="">Sélectionner une région...</option>
                    {["Dakar", "Diourbel", "Fatick", "Kaffrine", "Kaolack", "Kédougou", "Kolda", "Louga", "Matam", "Saint-Louis", "Sédhiou", "Tambacounda", "Thiès", "Ziguinchor"].map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Quartier / Adresse</label>
                 <input type="text" value={editingContact?.address || ""} onChange={e => setEditingContact({...editingContact, address: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="Quartier ou adresse postale" />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Secteur d'Activité</label>
                 <input type="text" value={editingContact?.activity || ""} onChange={e => setEditingContact({...editingContact, activity: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="Ex: E-commerce, Restauration..." />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Photo de profil (URL ou Fichier)</label>
                 <div className="flex flex-col sm:flex-row items-center gap-4 ml-4 sm:ml-6 mb-2">
                     {editingContact?.avatar_url ? (
                         <img onClick={() => setViewingAvatarUrl(editingContact.avatar_url!)} src={editingContact.avatar_url} alt="Avatar" className="w-16 h-16 rounded-2xl object-cover border-2 border-[#39FF14] shadow-sm shrink-0 cursor-zoom-in hover:scale-105 transition-transform" title="Agrandir l'image" />
                     ) : (
                         <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-xl text-black dark:text-white shadow-sm shrink-0">{editingContact?.full_name?.charAt(0) || '?'}</div>
                     )}
                     <div className="flex-1 flex flex-col gap-2 w-full pr-4 sm:pr-6">
                         <input type="url" value={editingContact?.avatar_url || ""} onChange={e => setEditingContact({...editingContact, avatar_url: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl font-bold text-xs sm:text-sm outline-none focus:ring-[2px] focus:ring-[#39FF14]/10 transition-all text-black dark:text-white placeholder:text-zinc-400" placeholder="URL de l'image (https://...)" />
                         <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) { const reader = new FileReader(); reader.onloadend = () => setEditingContact({...editingContact, avatar_url: reader.result as string}); reader.readAsDataURL(file); } }} className="w-full text-xs text-zinc-500 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:font-bold file:bg-zinc-200 dark:file:bg-zinc-700 file:text-black dark:file:text-white hover:file:bg-[#39FF14] hover:file:text-black transition cursor-pointer" />
                     </div>
                 </div>
              </div>

              <div>
                 <div className="space-y-2">
                    <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Catégorie</label>
                    <select value={editingContact?.type || 'Prospect'} onChange={e => setEditingContact({...editingContact, type: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-[11px] sm:text-xs uppercase outline-none cursor-pointer appearance-none transition-all focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10">
                      <option value="Prospect">Prospect Lead</option>
                      <option value="Client">Client Actif</option>
                    </select>
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Notes de Suivi</label>
                 <input type="text" value={editingContact?.status || ''} onChange={e => setEditingContact({...editingContact, status: e.target.value})} className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300" placeholder="EX: EN TEST JUSQU'AU 15/03" />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Mot de passe temporaire (client)</label>
                 <input
                   type="text"
                   value={editingContact?.password_temp || ''}
                   onChange={e => setEditingContact({ ...editingContact, password_temp: e.target.value })}
                   className="w-full p-5 sm:p-6 bg-zinc-50 border-none rounded-[1.75rem] sm:rounded-[2.25rem] font-black text-xs sm:text-sm uppercase outline-none focus:ring-[6px] sm:focus:ring-[8px] focus:ring-[#39FF14]/10 transition-all placeholder:text-zinc-300"
                   placeholder="Mot de passe communiqué au client"
                 />
              </div>

          {editingContact?.prorata_history && editingContact.prorata_history.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-zinc-100">
                 <label className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 ml-4 sm:ml-6 tracking-widest">Historique Proratas / Upgrades</label>
                 <div className="space-y-2">
                    {editingContact.prorata_history.map((hist: any, i: number) => (
                       <div key={i} className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                          <div>
                             <p className="font-bold text-sm uppercase text-black">{hist.saas}</p>
                             <p className="text-[10px] font-bold text-zinc-400">{new Date(hist.date).toLocaleDateString('fr-FR')}</p>
                          </div>
                          <span className="bg-black text-[#39FF14] px-3 py-1.5 rounded-lg text-xs font-black">+{hist.amount.toLocaleString('fr-FR')} F</span>
                       </div>
                    ))}
                 </div>
              </div>
          )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
                 <button type="button" onClick={() => generateAcompte(editingContact)} className="bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center justify-center gap-2 shadow-sm"><FileText size={14}/> Facture Acompte</button>
                 <button type="button" onClick={() => handleOpenQuoteModal(editingContact)} className="bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white py-3 rounded-xl font-black text-[10px] uppercase hover:bg-zinc-200 dark:hover:bg-zinc-700 transition flex items-center justify-center gap-2 shadow-sm"><ClipboardList size={14}/> Devis Global</button>
                 <button type="button" onClick={() => generateFactureFinale(editingContact)} className="bg-[#39FF14]/10 text-black dark:text-[#39FF14] py-3 rounded-xl font-black text-[10px] uppercase hover:bg-[#39FF14] hover:text-black transition flex items-center justify-center gap-2 shadow-sm border border-[#39FF14]/30"><Download size={14}/> Exporter Facture</button>
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
        <div id="modal-overlay" onClick={handleOutsideClick(setShowDiffusionModal, null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
           <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 max-h-[85vh] flex flex-col border-t-[8px] border-[#39FF14] my-auto">
              <button onClick={() => setShowDiffusionModal(null)} className="absolute top-6 sm:top-6 right-6 sm:right-10 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all active:scale-90"><X size={20} className="sm:w-6 sm:h-6"/></button>
              <div className="mb-8 sm:mb-10 mt-2 sm:mt-0">
                 <h2 className={`font-sans text-2xl sm:text-3xl font-black uppercase text-black tracking-tighter`}>Planifier la Diffusion</h2>
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
         <div id="modal-overlay" onClick={handleOutsideClick(setShowPartnerModal, false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto border-t-[8px] border-black custom-scrollbar my-auto">
               <button onClick={() => setShowPartnerModal(false)} className="absolute top-6 sm:top-6 right-6 sm:right-10 p-3 sm:p-4 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all"><X size={20} className="sm:w-6 sm:h-6"/></button>
               
               <div className="mb-10 sm:mb-14 text-center mt-4 sm:mt-0">
                  <div className="w-20 sm:w-24 h-20 sm:h-24 bg-zinc-100 rounded-[2rem] sm:rounded-[2.75rem] mx-auto mb-6 sm:mb-8 flex items-center justify-center font-black text-2xl sm:text-3xl shadow-xl text-black">{selectedPartner?.full_name?.charAt(0)}</div>
                  <h2 className={`font-sans text-3xl sm:text-4xl font-black uppercase text-black tracking-tighter leading-none`}>{selectedPartner?.full_name}</h2>
                  <p className="text-[10px] sm:text-xs font-bold text-[#39FF14] bg-black px-4 py-1.5 rounded-full inline-block mt-3 sm:mt-4 uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-lg">Console Ambassadeur Officiel</p>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-10 sm:mb-14">
                  <div className="bg-zinc-50 p-6 sm:p-6 rounded-[2.5rem] sm:rounded-[3rem] border border-zinc-100 flex flex-col items-center">
                     <p className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 tracking-widest mb-2 sm:mb-3">Ventes Actives</p>
                     <p className={`font-sans text-5xl sm:text-6xl font-black text-black tracking-tighter`}>{selectedPartner?.sales || 0}</p>
                  </div>
                  <div className="bg-[#39FF14]/5 p-6 sm:p-6 rounded-[2.5rem] sm:rounded-[3rem] border border-[#39FF14]/10 flex flex-col items-center">
                     <p className="text-[10px] sm:text-[11px] font-black uppercase text-zinc-400 tracking-widest mb-2 sm:mb-3">Gains (Commissions)</p>
                     <p className={`font-sans text-4xl sm:text-5xl font-black text-black tracking-tighter`}>{selectedPartner?.revenue || '0 F'}</p>
                  </div>
               </div>

               <div className="space-y-3 sm:space-y-4">
                  <button onClick={() => {
                      setEditPartnerForm({
                          id: selectedPartner.id,
                          full_name: selectedPartner.full_name || '',
                          contact: selectedPartner.contact || selectedPartner.phone || '',
                          city: selectedPartner.city || '',
                          country: selectedPartner.country || '',
                          address: selectedPartner.address || '',
                          current_status: selectedPartner.current_status || selectedPartner.profession || selectedPartner.activity || '',
                          sales_experience: selectedPartner.sales_experience || selectedPartner.experience || '',
                          revenue_objective: selectedPartner.revenue_objective || selectedPartner.revenue_goal || '',
                          strategy: selectedPartner.strategy || '',
                          status: selectedPartner.status || 'En attente'
                      });
                      setShowPartnerModal(false);
                      setShowEditPartnerModal(true);
                  }} className="w-full bg-black text-white py-5 sm:py-6 rounded-[1.75rem] sm:rounded-[2rem] font-black uppercase text-[10px] sm:text-[11px] tracking-widest shadow-xl hover:bg-[#39FF14] hover:text-black transition-all active:scale-95 flex items-center justify-center gap-3 sm:gap-4">
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

      {/* MODALE ÉDITION PARTENAIRE */}
      {showEditPartnerModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowEditPartnerModal, false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-2xl w-full relative shadow-2xl border-t-[8px] border-black my-auto">
                <button onClick={() => setShowEditPartnerModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all"><X size={20}/></button>
                <h2 className={`font-sans text-3xl font-black uppercase tracking-tighter mb-8 text-black`}>Éditer Ambassadeur</h2>
                <form onSubmit={handleUpdatePartner} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Nom Complet</label>
                            <input type="text" required value={editPartnerForm.full_name} onChange={e => setEditPartnerForm({...editPartnerForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Téléphone</label>
                            <input type="tel" required value={editPartnerForm.contact} onChange={e => setEditPartnerForm({...editPartnerForm, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Ville</label>
                            <input type="text" value={editPartnerForm.city} onChange={e => setEditPartnerForm({...editPartnerForm, city: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Pays</label>
                            <input type="text" value={editPartnerForm.country} onChange={e => setEditPartnerForm({...editPartnerForm, country: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Adresse / Quartier</label>
                        <input type="text" value={editPartnerForm.address} onChange={e => setEditPartnerForm({...editPartnerForm, address: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black" />
                    </div>
                    
                    <div className="p-4 bg-zinc-50 rounded-[1.5rem] space-y-4 border border-zinc-100 mt-4">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Profil du Candidat</p>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Statut Actuel</label>
                            <input type="text" value={editPartnerForm.current_status} onChange={e => setEditPartnerForm({...editPartnerForm, current_status: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Expérience Vente B2B</label>
                            <input type="text" value={editPartnerForm.sales_experience} onChange={e => setEditPartnerForm({...editPartnerForm, sales_experience: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Objectif Revenu</label>
                            <input type="text" value={editPartnerForm.revenue_objective} onChange={e => setEditPartnerForm({...editPartnerForm, revenue_objective: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Stratégie (Lecture seule)</label>
                            <textarea readOnly value={editPartnerForm.strategy} className="w-full p-4 bg-zinc-100 border border-zinc-200 rounded-xl font-bold text-sm outline-none resize-none h-24 text-zinc-600 cursor-not-allowed"></textarea>
                        </div>
                    </div>

                    <div className="space-y-1 mt-4">
                        <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Statut du Compte</label>
                        <select value={editPartnerForm.status} onChange={e => setEditPartnerForm({...editPartnerForm, status: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black">
                            <option value="En attente">En attente</option>
                            <option value="Actif">Actif</option>
                            <option value="Suspendu/Rejeté">Suspendu/Rejeté</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-[#39FF14] text-black py-5 rounded-[2rem] font-black uppercase text-xs mt-6 shadow-2xl hover:bg-black hover:text-[#39FF14] transition-all flex justify-center items-center gap-2">
                        <CheckCircle size={18}/> Enregistrer les modifications
                    </button>
                </form>
            </div>
        </div>
      )}

      {/* --- MODALE PROFIL TERMINAL --- */}
      {showProfileModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowProfileModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full relative shadow-2xl animate-in zoom-in-95 text-center border-t-[8px] border-[#39FF14] my-auto">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
            
            <div className="relative w-32 h-32 mx-auto mb-6">
               <img src={tempAdminProfile.avatar || ""} className="w-full h-full rounded-full object-cover border-[6px] border-black p-1.5 shadow-2xl" alt="Profil" />
            </div>
            
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase text-black tracking-tighter`}>Admin Profile</h2>
            <p className="text-[10px] font-bold text-zinc-400 mb-6 uppercase tracking-widest mt-2">Console Maître Dakar Hub</p>

            <div className="space-y-5 text-left">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">URL de la photo</label>
                  <input type="url" value={tempAdminProfile.avatar || ""} onChange={e => setTempAdminProfile({...tempAdminProfile, avatar: e.target.value})} className="w-full p-4 bg-zinc-50 border-none rounded-[1.75rem] font-black text-xs outline-none focus:ring-4 focus:ring-[#39FF14]/10" placeholder="https://..." />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Identifiant Terminal</label>
                  <input type="text" value={tempAdminProfile.name} onChange={e => setTempAdminProfile({...tempAdminProfile, name: e.target.value})} className="w-full p-4 bg-zinc-50 border-none rounded-[1.75rem] font-black text-xs uppercase outline-none focus:ring-4 focus:ring-[#39FF14]/10" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Nouveau mot de passe</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-4 bg-zinc-50 border-none rounded-[1.75rem] font-black text-xs outline-none focus:ring-4 focus:ring-[#39FF14]/10" placeholder="••••••••" />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Confirmer mot de passe</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-4 bg-zinc-50 border-none rounded-[1.75rem] font-black text-xs outline-none focus:ring-4 focus:ring-[#39FF14]/10" placeholder="••••••••" />
               </div>
               
               <button onClick={saveAdminProfile} className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest hover:scale-[1.03] transition-all">
                 Sauvegarder
               </button>
               
               <div className="pt-6 border-t border-zinc-100">
                  <button onClick={() => window.location.href='/'} className="w-full flex items-center justify-center gap-3 text-red-500 py-3 bg-red-50 rounded-[1.75rem] font-black uppercase text-[9px] tracking-widest hover:bg-red-500 hover:text-white transition-all">
                     <LogOut size={16}/> Quitter le Terminal
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE RAPPORT IA --- */}
      {showRapportIA && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowRapportIA(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-3xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white p-6 sm:p-10 rounded-3xl max-w-2xl w-full relative shadow-[0_0_100px_rgba(57,255,20,0.2)] animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto">
            <button onClick={() => setShowRapportIA(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
            
            <div className="flex items-center gap-6 mb-10">
              <div className="w-16 h-16 bg-black rounded-[2rem] flex items-center justify-center text-[#39FF14] shadow-2xl shrink-0"><Sparkles size={32} className="animate-pulse"/></div>
              <div>
                <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase text-black tracking-tighter`}>Scan IA Relances</h3>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2">Détection des Expirations J-2 & J-0</p>
              </div>
            </div>

            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar text-center">
               <p className="text-sm text-zinc-600 font-medium">
                 Le Scan IA va analyser la base de données CRM pour détecter les essais et abonnements arrivant à expiration (J-2 et J-0).
                 <br/><br/>
                 Pour chaque contact trouvé, une action sera automatiquement créée dans le <strong>Journal IA</strong> et une copie de la relance sera envoyée par email à <strong>rokhydly@gmail.com</strong>.
               </p>
            </div>

            <div className="mt-10 pt-8 border-t border-zinc-100 text-center">
              <button
                onClick={runAutomatedFollowUps}
                disabled={isAutomating}
                className="w-full bg-[#39FF14] text-black py-5 rounded-[2rem] font-black uppercase text-xs hover:scale-[1.03] transition-all active:scale-95 shadow-[0_20px_40px_rgba(57,255,20,0.15)] flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
              >
                {isAutomating ? 'Analyse en cours...' : 'Lancer le Scan & Envoyer les Relances'}
              </button>
              <p className="text-[9px] font-black uppercase text-zinc-300 tracking-[0.3em] mt-4">Algorithme Onyx-Scan v2.5 (Mars 2026)</p>
            </div>
          </div>
        </div>
      )}

      {/* --- MODALE CARTE DES HUBS --- */}
      {showHubsMap && (() => {
        const HUBS_ZONES = [
          { id: "dakar", label: "Dakar", x: 18, y: 48 },
          { id: "Thiès", label: "Thiès", x: 28, y: 48 },
          { id: "Diourbel", label: "Diourbel", x: 35, y: 48 },
          { id: "Fatick", label: "Fatick", x: 35, y: 55 },
          { id: "Kaolack", label: "Kaolack", x: 40, y: 55 },
          { id: "Kaffrine", label: "Kaffrine", x: 50, y: 55 },
          { id: "Louga", label: "Louga", x: 40, y: 35 },
          { id: "Saint-Louis", label: "Saint-Louis", x: 35, y: 20 },
          { id: "Matam", label: "Matam", x: 70, y: 30 },
          { id: "Tambacounda", label: "Tambacounda", x: 75, y: 60 },
          { id: "Kédougou", label: "Kédougou", x: 80, y: 80 },
          { id: "Kolda", label: "Kolda", x: 55, y: 80 },
          { id: "Sédhiou", label: "Sédhiou", x: 45, y: 80 },
          { id: "Ziguinchor", label: "Ziguinchor", x: 35, y: 80 },
          { id: "international", label: "Hub International", x: 92, y: 50 },
        ];
        const INTERNATIONAL_COUNTRIES = ['mali', 'côte d\'ivoire', 'cote d\'ivoire', 'côte d’ivoire', 'cote d’ivoire', 'guinée', 'guinee', 'mauritanie', 'gambie'];
        const isInternational = (c: any) => !!(c.country && INTERNATIONAL_COUNTRIES.some(ic => String(c.country).toLowerCase().includes(ic)));
        const getContactsForZone = (zoneId: string) => {
          if (zoneId === "international")
            return contacts.filter(c => isInternational(c));
          const zone = HUBS_ZONES.find(z => z.id === zoneId);
          if (!zone) return [];
          const label = zone.label.toLowerCase();
          const labels = [label, label.replace(/-/g, ' '), label.replace(/ /g, '-')];
          return contacts.filter(c => {
            const city = (c.city || '').toLowerCase();
            const addr = (c.address || '').toLowerCase();
            const country = (c.country || '').toLowerCase();
            return labels.some(l => city.includes(l) || addr.includes(l) || country.includes(l));
          });
        };
        const zoneContacts = selectedHub ? getContactsForZone(selectedHub) : [];
        const zoneRevenue = zoneContacts.reduce((sum, c) => sum + getSaasPrice(c.saas || ''), 0);
        const currentZone = HUBS_ZONES.find(z => z.id === selectedHub);
        const internationalCount = contacts.filter(c => isInternational(c)).length;
        const senegalPath = "M12,18 L45,12 L55,28 L52,50 L48,72 L40,90 L25,92 L10,78 L5,55 L8,35 Z";
        return (
          <div id="modal-overlay" onClick={(e: any) => (e.target as HTMLElement).id === "modal-overlay" && (setShowHubsMap(false), setSelectedHub(null))} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
            <div className="bg-white dark:bg-zinc-950 dark:text-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl border-t-4 border-[#39FF14] my-auto flex flex-col">
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#39FF14]/10 rounded-2xl"><MapPin className="text-[#39FF14]" size={24}/></div>
                  <div>
                    <h2 className="font-sans text-2xl font-black uppercase text-black tracking-tighter">Carte des Hubs</h2>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Sénégal • Points cliquables</p>
                  </div>
                </div>
                <button onClick={() => { setShowHubsMap(false); setSelectedHub(null); }} className="p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
              </div>
              <div className="flex-1 flex flex-col sm:flex-row min-h-0 overflow-y-auto sm:overflow-hidden">
                <div className="w-full sm:flex-1 relative p-4 sm:p-6 min-h-[300px] sm:min-h-[320px] bg-zinc-900 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full absolute inset-0 p-4" preserveAspectRatio="xMidYMid meet">
                    <path d={senegalPath} fill="none" stroke="#39FF14" strokeWidth="0.8" opacity="0.25" className="transition-opacity duration-300" />
                  </svg>
                  {HUBS_ZONES.map(zone => (
                    <button
                      key={zone.id}
                      onClick={(e) => { e.stopPropagation(); setSelectedHub(selectedHub === zone.id ? null : zone.id); }}
                      className={`absolute rounded-full cursor-pointer transition-all duration-300 border-2 border-white z-10 ${selectedHub === zone.id ? 'w-6 h-6 shadow-[0_0_40px_#39FF14] scale-125' : 'w-4 h-4 hover:scale-125 hover:shadow-[0_0_35px_#39FF14]'} ${zone.id === 'international' ? 'bg-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.8)]' : 'bg-[#39FF14] shadow-[0_0_25px_#39FF14]'}`}
                      style={{ left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -50%)' }}
                      title={zone.label + (zone.id === 'international' ? ` (${internationalCount})` : '')}
                    />
                  ))}
                </div>
                <div className="w-full sm:w-80 border-t sm:border-t-0 sm:border-l border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 flex flex-col bg-zinc-50 dark:bg-zinc-900 shrink-0">
                  <h3 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-3">
                    {currentZone ? `Contacts • ${currentZone.label}` : "Cliquez sur un point (Dakar, Thiès…)"}
                  </h3>
                  {currentZone && (
                     <div className="mb-4 bg-[#39FF14]/10 border border-[#39FF14]/20 p-3 rounded-xl flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-zinc-500 dark:text-zinc-400 tracking-widest">CA Régional</span>
                        <span className="text-sm font-black text-[#39FF14]">{zoneRevenue.toLocaleString('fr-FR')} F</span>
                     </div>
                  )}
                  {internationalCount > 0 && !selectedHub && (
                    <button onClick={() => setSelectedHub('international')} className="mb-3 px-4 py-2 rounded-xl bg-amber-500/20 text-amber-700 border border-amber-400/40 text-[10px] font-black uppercase hover:bg-amber-500/30 transition-all flex items-center gap-2 w-max">
                      <Layers size={14}/> Hub International ({internationalCount})
                    </button>
                  )}
                  <div className="flex-1 overflow-y-auto space-y-2 min-h-[120px]">
                    {currentZone && zoneContacts.length === 0 && (
                      <p className="text-xs font-bold text-zinc-400 uppercase">Aucun contact pour cette zone</p>
                    )}
                    {currentZone && zoneContacts.map(c => (
                      <div key={c.id} className="p-3 bg-white dark:bg-zinc-950 rounded-xl border border-zinc-100 dark:border-zinc-800 group">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-black text-sm uppercase text-black dark:text-white truncate">{c.full_name}</p>
                            <p className="text-[10px] text-[#39FF14] font-bold mt-0.5">{c.phone}</p>
                            {c.address && <p className="text-[9px] text-zinc-400 truncate mt-0.5">{c.address}</p>}
                            {c.country && <p className="text-[9px] text-zinc-500 mt-0.5">{c.country}</p>}
                          </div>
                          {isInternational(c) && (
                            <button onClick={() => setSelectedHub('international')} className="shrink-0 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-700 text-[8px] font-black uppercase border border-amber-400/40 hover:bg-amber-500/30 transition-all">
                              Hub International
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* --- MODALE SÉLECTION PRODUIT (CRÉATION CLIENT) --- */}
      {showProductModal && (
        <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setShowProductModal(null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white dark:bg-zinc-950 dark:text-white p-6 sm:p-8 rounded-3xl max-w-md w-full relative shadow-2xl border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto">
            <button onClick={() => setShowProductModal(null)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
            
            <h3 className="text-2xl font-black uppercase text-black dark:text-white tracking-tighter mb-2">Assigner un SaaS</h3>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-8">Pour : {showProductModal.lead?.full_name}</p>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-4">Sélectionner l'outil principal</label>
              <select id="saas-select" className="w-full p-5 bg-zinc-50 dark:bg-zinc-900 border-none rounded-[1.75rem] font-black text-xs uppercase outline-none focus:ring-4 focus:ring-[#39FF14]/10 cursor-pointer appearance-none">
                <option value="">-- Aucun / À définir --</option>
                {ECOSYSTEM_SAAS.map(s => (
                  <option key={s.id} value={s.name}>{s.name} ({s.price})</option>
                ))}
              </select>
            </div>

            <button 
              onClick={() => {
                const selectEl = document.getElementById('saas-select') as HTMLSelectElement;
                handleCreateAccount(showProductModal.lead, 'client', selectEl ? selectEl.value : undefined);
                setShowProductModal(null);
              }}
              className="w-full mt-8 bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-xs hover:scale-[1.03] transition-all active:scale-95 shadow-[0_20px_40px_rgba(57,255,20,0.15)] flex justify-center items-center gap-2"
            >
              <CheckCircle size={18}/> Confirmer & Envoyer Accès
            </button>
          </div>
        </div>
      )}

      {/* --- MODALE AJOUT AMBASSADEUR MANUEL (COMPLÈTE) --- */}
      {showAddPartnerModal && (
         <div id="modal-overlay" onClick={handleOutsideClick(setShowAddPartnerModal, false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
           <div className="bg-white dark:bg-zinc-950 dark:text-white p-6 sm:p-8 rounded-3xl max-w-2xl w-full relative shadow-2xl border-t-[8px] border-black dark:border-zinc-800 my-auto">
             <button onClick={() => setShowAddPartnerModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition-all"><X size={20}/></button>
             <h2 className={`font-sans text-3xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white`}>Candidature Ambassadeur</h2>
             
             <form onSubmit={handleAddPartner} className="space-y-4">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Nom Complet</label>
                    <input type="text" required value={newPartnerForm.full_name} onChange={e => setNewPartnerForm({...newPartnerForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black" placeholder="Ex: Daba" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Téléphone</label>
                    <input type="tel" required value={newPartnerForm.phone} onChange={e => setNewPartnerForm({...newPartnerForm, phone: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black" placeholder="768103647" />
                 </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Ville</label>
                    <input type="text" value={newPartnerForm.city} onChange={e => setNewPartnerForm({...newPartnerForm, city: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black" placeholder="DAKAR" />
                 </div>
                 <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Pays</label>
                    <select value={newPartnerForm.country} onChange={e => setNewPartnerForm({...newPartnerForm, country: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black appearance-none">
                       <option value="Sénégal">Sénégal</option>
                       <option value="Mali">Mali</option>
                       <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                    </select>
                 </div>
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Adresse / Quartier</label>
                  <input type="text" value={newPartnerForm.address} onChange={e => setNewPartnerForm({...newPartnerForm, address: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black" placeholder="PARCELLES UNITE 26" />
               </div>

               <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Statut Pro</label>
                  <select value={newPartnerForm.profession} onChange={e => setNewPartnerForm({...newPartnerForm, profession: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black appearance-none">
                     <option value="">Sélectionner...</option>
                     <option value="Salarié (Recherche revenu complémentaire)">Salarié (Recherche revenu complémentaire)</option>
                     <option value="Étudiant">Étudiants</option>
                     <option value="Indépendant">Indépendant / Entrepreneur</option>
                  </select>
               </div>

               <div className="p-4 bg-zinc-50 rounded-[1.5rem] space-y-4 border border-zinc-100 mt-4">
                 <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Informations Avancées</p>
                 <select value={newPartnerForm.experience} onChange={e => setNewPartnerForm({...newPartnerForm, experience: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black appearance-none">
                    <option value="">Expérience en vente ?</option>
                    <option value="Oui, beaucoup (Plusieurs années)">Oui, beaucoup (Plusieurs années)</option>
                    <option value="Un peu">Un peu</option>
                    <option value="Débutant">Débutant</option>
                 </select>
                 <select value={newPartnerForm.revenue_goal} onChange={e => setNewPartnerForm({...newPartnerForm, revenue_goal: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black appearance-none">
                    <option value=""> Objectif de revenus mensuels ?</option>
                    <option value="+ 0 et 50.000 F (Complément de revenu)">+ 50000 F (Complément de revenu)</option>
                    <option value="+ 500.000 F (Développer une agence)">+ 500.000 F (Développer une agence)</option>
                    <option value="Entre 100.000 F et 300.000 F">Entre 100.000 F et 300.000 F</option>
                 </select>
                 <textarea value={newPartnerForm.strategy} onChange={e => setNewPartnerForm({...newPartnerForm, strategy: e.target.value})} className="w-full p-4 bg-white border border-zinc-200 rounded-xl font-bold text-sm outline-none focus:border-black resize-none h-24" placeholder="Quelle sera votre stratégie pour trouver des clients ? (ex: Porte-à-porte, Réseaux sociaux...)"></textarea>
               </div>

               <button type="submit" className="w-full bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-xs mt-6 shadow-2xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2">
                 <CheckCircle size={18}/> Enregistrer l'Ambassadeur
               </button>
             </form>
           </div>
         </div>
      )}

  {/* --- MODALE HISTORIQUE CLIENTS DU COMMERCIAL --- */}
  {viewCommercialClients && (
    <div id="modal-overlay" onClick={handleOutsideClick(setViewCommercialClients, null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-950 dark:text-white p-6 sm:p-8 rounded-3xl max-w-2xl w-full relative shadow-2xl border-t-[8px] border-[#00E5FF] my-auto">
         <button onClick={() => setViewCommercialClients(null)} className="absolute top-6 right-6 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-white transition-all"><X size={20}/></button>
         <h2 className={`font-sans text-2xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white`}>Historique d'Acquisition</h2>
         
         <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Commercial : {viewCommercialClients.full_name}</p>
            <select 
                value={commercialHistoryFilter} 
                onChange={(e) => setCommercialHistoryFilter(e.target.value)} 
                className="p-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs font-bold outline-none cursor-pointer"
            >
                <option value="all">Tout le temps</option>
                <option value="month">Ce mois-ci</option>
                <option value="year">Cette année</option>
            </select>
         </div>

         <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {(() => {
               const commClients = contacts
                   .filter(c => (c.commercial_id && String(c.commercial_id) === String(viewCommercialClients.id)) || c.assigned_to === viewCommercialClients.full_name)
                   .filter(c => {
                       if (commercialHistoryFilter === 'all') return true;
                       const d = new Date(c.created_at || 0);
                       const now = new Date();
                       if (commercialHistoryFilter === 'month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                       if (commercialHistoryFilter === 'year') return d.getFullYear() === now.getFullYear();
                       return true;
                   })
                   .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
               if (commClients.length === 0) return <p className="text-zinc-500 text-sm italic text-center py-10">Aucun compte créé par ce commercial pour le moment.</p>;
               
               const totalSales = commClients.filter(c => c.type?.trim().toLowerCase() === 'client').length;
               const totalRevenue = commClients.filter(c => c.type?.trim().toLowerCase() === 'client').reduce((acc, c) => acc + getSaasPrice(c.saas || ''), 0);
               const totalCommissions = totalSales * 5000;

               return (
                   <>
                   <div className="flex justify-between bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 mb-4 shadow-sm">
                      <div className="text-center"><p className="text-[10px] font-black uppercase text-zinc-400">Total Ventes</p><p className="text-lg font-black text-black dark:text-white">{totalSales}</p></div>
                      <div className="text-center"><p className="text-[10px] font-black uppercase text-zinc-400">CA Généré</p><p className="text-lg font-black text-[#00E5FF]">{totalRevenue.toLocaleString()} F</p></div>
                      <div className="text-center"><p className="text-[10px] font-black uppercase text-zinc-400">Commissions</p><p className="text-lg font-black text-[#39FF14]">{totalCommissions.toLocaleString()} F</p></div>
                   </div>
                   {commClients.map(c => {
                       const price = getSaasPrice(c.saas || '');
                       const commission = c.type?.trim().toLowerCase() === 'client' ? 5000 : 0;
                       return (
                       <div key={c.id} className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex justify-between items-center hover:border-[#00E5FF]/50 transition-colors">
                           <div>
                              <p className="font-bold text-sm text-black dark:text-white">{c.full_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-zinc-500">{c.phone}</span>
                                  <span className="text-[10px] bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded text-black dark:text-white font-bold">{c.saas || 'Aucun produit'}</span>
                              </div>
                              <p className="text-[10px] font-bold text-zinc-400 mt-1.5">{new Date(c.created_at).toLocaleDateString('fr-FR')} à {new Date(c.created_at).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}</p>
                           </div>
                           <div className="text-right flex flex-col items-end">
                              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg mb-1.5 ${c.type?.trim().toLowerCase() === 'client' ? 'bg-[#39FF14]/10 text-[#39FF14]' : 'bg-orange-500/10 text-orange-500'}`}>{c.type}</span>
                              <p className="text-xs font-black text-black dark:text-white">{price.toLocaleString()} F</p>
                              {commission > 0 && <p className="text-[10px] font-black text-[#39FF14] mt-0.5">+ {commission.toLocaleString()} F comm.</p>}
                           </div>
                       </div>
                       );
                   })}
                   </>
               );
            })()}
         </div>
      </div>
    </div>
  )}

  {/* --- MODALE COMMISSION MANUELLE --- */}
  {commissionModal && (
     <div id="modal-overlay" onClick={handleOutsideClick(setCommissionModal, null)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
       <div className="bg-white dark:bg-zinc-950 dark:text-white p-6 sm:p-8 rounded-3xl max-w-md w-full relative shadow-2xl border-t-[8px] border-green-500 my-auto">
         <button onClick={() => setCommissionModal(null)} className="absolute top-6 right-6 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-white transition-all"><X size={20}/></button>
         <h2 className={`font-sans text-2xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white`}>Attribuer Prime</h2>
         <p className="text-xs font-bold text-zinc-500 mb-8 uppercase tracking-widest">Commercial : {commissionModal.full_name}</p>
         
         <form onSubmit={handleAddManualCommission} className="space-y-4">
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Montant de la prime (F CFA)</label>
              <input type="number" required value={commissionAmount} onChange={e => setCommissionAmount(e.target.value)} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-lg outline-none focus:border-green-500" placeholder="Ex: 15000" />
           </div>
           
           <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800/50 p-4 rounded-2xl mt-4">
              <p className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase tracking-widest mb-1">Primes cumulées</p>
              <p className="text-lg font-black text-green-700 dark:text-green-300">{(commissionModal.manual_commission || 0).toLocaleString('fr-FR')} F</p>
           </div>

           <button type="submit" className="w-full bg-green-500 text-white py-4 rounded-[1.5rem] font-black uppercase text-xs mt-4 shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2">
             <CheckCircle size={18}/> Confirmer l'attribution
           </button>
         </form>
       </div>
     </div>
  )}

  {/* --- MODALE AJOUT COMMERCIAL MANUEL --- */}
  {showAddCommercialModal && (
     <div id="modal-overlay" onClick={handleOutsideClick(setShowAddCommercialModal, false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
       <div className="bg-white dark:bg-zinc-950 dark:text-white p-6 sm:p-8 rounded-3xl max-w-md w-full relative shadow-2xl border-t-[8px] border-[#39FF14] my-auto">
         <button onClick={() => setShowAddCommercialModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-white transition-all"><X size={20}/></button>
         <h2 className={`font-sans text-2xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white`}>Nouveau Commercial</h2>
         
         <form onSubmit={handleAddCommercial} className="space-y-4">
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Nom Complet</label>
              <input type="text" required value={newCommercialForm.full_name} onChange={e => setNewCommercialForm({...newCommercialForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-sm outline-none focus:border-[#39FF14]" placeholder="Ex: Moussa Diop" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Téléphone</label>
              <input type="tel" required value={newCommercialForm.phone} onChange={e => setNewCommercialForm({...newCommercialForm, phone: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-sm outline-none focus:border-[#39FF14]" placeholder="77 000 00 00" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Objectif (Ventes/Mois)</label>
              <input type="number" required value={newCommercialForm.objective} onChange={e => setNewCommercialForm({...newCommercialForm, objective: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-sm outline-none focus:border-[#39FF14]" placeholder="20" />
           </div>

           <button type="submit" disabled={isCreatingUser} className="w-full bg-[#39FF14] text-black py-4 rounded-[1.5rem] font-black uppercase text-xs mt-6 shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center gap-2">
             {isCreatingUser ? 'Création en cours...' : <><UserPlus size={18}/> Créer l'accès</>}
           </button>
           <p className="text-[10px] text-zinc-500 font-bold text-center mt-4">Le code PIN "0000" sera attribué par défaut.</p>
         </form>
       </div>
     </div>
  )}

  {/* --- MODALE ÉDITION COMMERCIAL MANUEL --- */}
  {showEditCommercialModal && (
     <div id="modal-overlay" onClick={handleOutsideClick(setShowEditCommercialModal, false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
       <div className="bg-white dark:bg-zinc-950 dark:text-white p-6 sm:p-8 rounded-3xl max-w-md w-full relative shadow-2xl border-t-[8px] border-[#39FF14] my-auto">
         <button onClick={() => setShowEditCommercialModal(false)} className="absolute top-6 right-6 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-white transition-all"><X size={20}/></button>
         <h2 className={`font-sans text-2xl font-black uppercase tracking-tighter mb-8 text-black dark:text-white`}>Modifier Commercial</h2>
         
         <form onSubmit={handleUpdateCommercial} className="space-y-4">
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Nom Complet</label>
              <input type="text" required value={editCommercialForm.full_name} onChange={e => setEditCommercialForm({...editCommercialForm, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-sm outline-none focus:border-[#39FF14]" placeholder="Ex: Moussa Diop" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Objectif (Ventes/Mois)</label>
              <input type="number" required value={editCommercialForm.objective || 20} onChange={e => setEditCommercialForm({...editCommercialForm, objective: Number(e.target.value)})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-sm outline-none focus:border-[#39FF14]" placeholder="20" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Téléphone</label>
              <input type="tel" required value={editCommercialForm.phone} onChange={e => setEditCommercialForm({...editCommercialForm, phone: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-sm outline-none focus:border-[#39FF14]" placeholder="77 000 00 00" />
           </div>
           <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-zinc-400 ml-4 tracking-widest">Statut</label>
              <select value={editCommercialForm.status} onChange={e => setEditCommercialForm({...editCommercialForm, status: e.target.value})} className="w-full p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-sm outline-none focus:border-[#39FF14]">
                  <option value="Actif">Actif</option>
                  <option value="Suspendu">Suspendu</option>
              </select>
           </div>
           
           <div className="pt-4 mt-2 border-t border-zinc-100 dark:border-zinc-800">
              <button type="button" onClick={handleResetCommercialPin} className="w-full bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400 py-3 rounded-xl font-black uppercase text-[10px] hover:bg-orange-100 dark:hover:bg-orange-500/20 transition-all flex justify-center items-center gap-2 border border-orange-200 dark:border-orange-500/20">
                  <RefreshCcw size={14}/> Réinitialiser PIN (0000)
              </button>
           </div>

           <button type="submit" className="w-full bg-[#39FF14] text-black py-4 rounded-[1.5rem] font-black uppercase text-xs mt-4 shadow-xl hover:scale-[1.02] transition-all flex justify-center items-center gap-2">
             <CheckCircle size={18}/> Enregistrer
           </button>
         </form>
       </div>
     </div>
  )}

  {/* --- MODALE AFFICHAGE AVATAR GRAND FORMAT --- */}
  {viewingAvatarUrl && (
    <div id="modal-overlay" onClick={handleOutsideClick(setViewingAvatarUrl, null)} className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
       <div className="relative max-w-md md:max-w-2xl w-full flex items-center justify-center animate-in zoom-in-95 duration-300">
          <button onClick={() => setViewingAvatarUrl(null)} className="absolute -top-12 right-0 sm:-right-12 p-3 bg-zinc-100/10 hover:bg-zinc-100/20 text-white rounded-full transition-all"><X size={24}/></button>
          <img src={viewingAvatarUrl} alt="Avatar en grand" className="w-full max-h-[80vh] object-contain rounded-3xl shadow-[0_0_50px_rgba(57,255,20,0.15)] border border-zinc-800" />
       </div>
    </div>
  )}

{/* MODALE ÉDITION ARTICLE IA */}
{editingArticle && (
        <div id="modal-overlay" onClick={handleOutsideClick(setEditingArticle, null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-white dark:bg-zinc-950 dark:text-white p-6 sm:p-8 rounded-3xl max-w-2xl w-full relative shadow-2xl border-t-[8px] border-[#39FF14] animate-in zoom-in-95 my-auto">
            <button onClick={() => setEditingArticle(null)} className="absolute top-6 right-6 p-3 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
            
            <h3 className="text-2xl font-black uppercase text-black dark:text-white tracking-tighter mb-6">Éditer l'Article</h3>
            
            <div className="space-y-4">
              <input 
                type="text" 
                value={editingArticle.title} 
                onChange={e => setEditingArticle({...editingArticle, title: e.target.value})} 
                className="w-full p-5 bg-zinc-50 border border-zinc-200 rounded-[1.75rem] font-black text-sm outline-none focus:border-black" 
              />
              <textarea 
                value={editingArticle.desc} 
                onChange={e => setEditingArticle({...editingArticle, desc: e.target.value})} 
                className="w-full p-5 bg-zinc-50 border border-zinc-200 rounded-[1.75rem] font-bold text-sm outline-none focus:border-black min-h-[200px]"
              />
            </div>

            <button 
              onClick={async () => {
                await supabase.from('marketing_articles').update(editingArticle).eq('id', editingArticle.id);
                setMarketingArticles(prev => prev.map(a => a.id === editingArticle.id ? editingArticle : a));
                setEditingArticle(null);
              }}
              className="w-full mt-6 bg-black text-[#39FF14] py-5 rounded-[2rem] font-black uppercase text-xs hover:scale-[1.03] transition-all shadow-[0_20px_40px_rgba(57,255,20,0.15)] flex justify-center items-center gap-2"
            >
              <CheckCircle size={18}/> Sauvegarder
            </button>
          </div>
        </div>
      )}

      {/* MODALE VALIDATION RETRAIT (PREUVE) */}
      {validateWithdrawalModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setValidateWithdrawalModal, null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white dark:bg-zinc-950 dark:text-white p-8 rounded-[2rem] max-w-md w-full relative shadow-2xl border-t-[8px] border-[#39FF14] my-auto animate-in zoom-in-95">
              <button onClick={() => setValidateWithdrawalModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
              <h2 className={`font-sans text-2xl font-black uppercase tracking-tighter mb-2 text-black dark:text-white`}>Valider le Retrait</h2>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Ambassadeur : {validateWithdrawalModal.ambassador_name}</p>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Preuve de paiement (Optionnel)</label>
                    <input type="text" placeholder="ID de transaction, Référence Wave/OM, ou lien..." value={withdrawalProof} onChange={e => setWithdrawalProof(e.target.value)} className="w-full p-4 mt-1 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black text-black" />
                    <p className="text-[9px] text-zinc-400 font-bold mt-2 ml-2">La référence sera sauvegardée et transmise à l'ambassadeur via WhatsApp.</p>
                 </div>
              </div>

              <button onClick={() => {
                 handleUpdateWithdrawalStatus(validateWithdrawalModal.id, 'Payé', withdrawalProof);
                 setValidateWithdrawalModal(null);
              }} className="w-full mt-8 bg-black text-[#39FF14] py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2">
                 <CheckCircle size={18}/> Confirmer le paiement
              </button>
           </div>
        </div>
      )}

      {/* MODALE AJOUT HARDWARE */}
      {showAddHardwareModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setShowAddHardwareModal, false)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
           <div className="bg-white dark:bg-zinc-950 dark:text-white p-8 rounded-[2rem] max-w-md w-full relative shadow-2xl border-t-[8px] border-[#39FF14] my-auto animate-in zoom-in-95">
              <button onClick={() => setShowAddHardwareModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
              <h2 className={`font-sans text-2xl font-black uppercase tracking-tighter mb-6 text-black dark:text-white`}>Ajouter un article</h2>
              
              <form onSubmit={handleAddHardware} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Nom de l'article</label>
                    <input type="text" required value={newHardwareForm.name} onChange={e => setNewHardwareForm({...newHardwareForm, name: e.target.value})} className="w-full p-4 mt-1 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black text-black" placeholder="Ex: TPE Onyx v2" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Type / Catégorie</label>
                    <select value={newHardwareForm.type} onChange={e => setNewHardwareForm({...newHardwareForm, type: e.target.value})} className="w-full p-4 mt-1 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black text-black">
                        <option value="Matériel">Matériel</option>
                        <option value="Accessoire">Accessoire</option>
                        <option value="Consommable">Consommable</option>
                        <option value="Kit">Kit</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Seuil d'alerte (Min)</label>
                    <input type="number" min="0" required value={newHardwareForm.min} onChange={e => setNewHardwareForm({...newHardwareForm, min: parseInt(e.target.value) || 0})} className="w-full p-4 mt-1 bg-zinc-50 border border-zinc-100 rounded-[1.25rem] font-bold text-sm outline-none focus:border-black text-black" />
                    <p className="text-[9px] text-zinc-400 font-bold mt-2 ml-2">Une alerte sera déclenchée si le stock passe sous ce seuil.</p>
                 </div>

                 <button type="submit" className="w-full mt-8 bg-black text-[#39FF14] py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl active:scale-95 flex justify-center items-center gap-2">
                    <CheckCircle size={18}/> Enregistrer l'article
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* --- MODALE D'ÉDITION DE DEVIS --- */}
      {quoteModal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setQuoteModal, null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 dark:text-white p-8 rounded-[2rem] max-w-md w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto">
             <button onClick={() => setQuoteModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
             <h2 className="font-sans text-2xl font-black uppercase tracking-tighter mb-2">Éditer le Devis</h2>
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">Pour : {quoteModal.lead.full_name}</p>

             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Désignation du service</label>
                   <input type="text" value={quoteModal.designation} onChange={e => setQuoteModal({...quoteModal, designation: e.target.value})} className="w-full p-4 mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-sm outline-none focus:border-[#39FF14]" />
                </div>
                <div>
                   <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Montant Total (F CFA)</label>
                   <input type="number" value={quoteModal.price} onChange={e => setQuoteModal({...quoteModal, price: Number(e.target.value)})} className="w-full p-4 mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-sm outline-none focus:border-[#39FF14]" />
                </div>
             </div>

             <button onClick={() => { generateDevis(quoteModal.lead, quoteModal.designation, quoteModal.price); setQuoteModal(null); }} className="w-full mt-8 bg-black text-[#39FF14] py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex justify-center items-center gap-2">
                 Générer & Envoyer
             </button>
          </div>
        </div>
      )}

      {/* --- MODALE D'ÉDITION BI GOAL --- */}
      {editingBiGoal && (
        <div id="modal-overlay" onClick={handleOutsideClick(setEditingBiGoal, null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-500 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-950 dark:text-white p-8 rounded-[2rem] max-w-md w-full relative shadow-2xl animate-in zoom-in-95 border-t-[8px] border-[#39FF14] my-auto">
             <button onClick={() => setEditingBiGoal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full hover:bg-black hover:text-[#39FF14] transition-all"><X size={20}/></button>
             <h2 className="font-sans text-2xl font-black uppercase tracking-tighter mb-2">Ajuster l'Objectif</h2>
             <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
               {editingBiGoal === 'mrr' ? 'Revenu Mensuel Récurrent (MRR)' : editingBiGoal === 'saas' ? 'Objectif Ventes SaaS' : 'Objectif Options CM & Pub'}
             </p>

             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black uppercase text-zinc-400 ml-2 tracking-widest">Nouvel Objectif</label>
                   <input 
                      type="number" 
                      value={biGoalInputValue} 
                      onChange={e => setBiGoalInputValue(Number(e.target.value))} 
                      className="w-full p-4 mt-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[1.25rem] font-bold text-xl outline-none focus:border-[#39FF14] transition-colors" 
                   />
                </div>
             </div>

             <button onClick={async () => {
                 const payload: any = {};
                 if (editingBiGoal === 'mrr') { setMrrGoal(biGoalInputValue); payload.mrr_goal = biGoalInputValue; }
                 else if (editingBiGoal === 'saas') { setSaasGoal(biGoalInputValue); payload.saas_goal = biGoalInputValue; }
                 else if (editingBiGoal === 'cm') { setCmGoal(biGoalInputValue); payload.cm_goal = biGoalInputValue; }
                 
                 await supabase.from('admin_settings').upsert({ id: 1, ...payload });
                 setEditingBiGoal(null);
             }} className="w-full mt-8 bg-black text-[#39FF14] py-4 rounded-[1.5rem] font-black uppercase text-xs hover:scale-105 transition-all shadow-xl flex justify-center items-center gap-2">
                 <CheckCircle size={16}/> Mettre à jour l'objectif
             </button>
          </div>
        </div>
      )}
      
    </div>
  );
}

function MarketingPlanner({ suggestions, plannedEvents, setPlannedEvents }: any) {
    const [editingEvent, setEditingEvent] = useState<any>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
    const [calendarDate, setCalendarDate] = useState(new Date());

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        let day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Lundi = 0
    };

    const daysInMonth = getDaysInMonth(calendarDate.getFullYear(), calendarDate.getMonth());
    const firstDay = getFirstDayOfMonth(calendarDate.getFullYear(), calendarDate.getMonth());
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    const plannedCount = plannedEvents.filter((e: any) => e.status === 'Planifié').length;
    const executedCount = plannedEvents.filter((e: any) => e.status === 'Exécuté').length;
    const cancelledCount = plannedEvents.filter((e: any) => e.status === 'Annulé').length;

    const planAction = (suggestion: any) => {
        const newEvent = { ...suggestion, status: 'Planifié', planDate: new Date().toISOString() };
        setPlannedEvents((prev: any) => [newEvent, ...prev]);
    };

    const executePlannedAction = (event: any) => {
        window.open(`https://wa.me/${event.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(event.msg)}`, '_blank');
        setPlannedEvents((prev: any[]) => prev.map(e => e.id === event.id ? { ...e, status: 'Exécuté', executionDate: new Date().toISOString() } : e));
        setToastMessage("Action exécutée avec succès !");
        setTimeout(() => setToastMessage(null), 3000);
    };

    const cancelPlannedAction = (id: string) => {
        if (confirm("Voulez-vous vraiment supprimer cette action planifiée ?")) {
            setPlannedEvents((prev: any[]) => prev.map(e => e.id === id ? { ...e, status: 'Annulé', cancellationDate: new Date().toISOString() } : e));
        }
    };

    const suggestionsToShow = suggestions.filter((s: any) => !plannedEvents.some((p: any) => p.id === s.id));

    const clearFinishedActions = () => {
        if (confirm("Voulez-vous vraiment effacer toutes les actions terminées (Exécutées et Annulées) de l'historique ?")) {
            setPlannedEvents((prev: any[]) => prev.filter(e => e.status === 'Planifié'));
        }
    };

    const sortedEvents = [...plannedEvents].sort((a: any, b: any) => {
        const dateA = new Date(a.planDate || new Date()).getTime();
        const dateB = new Date(b.planDate || new Date()).getTime();
        return dateA - dateB; // Trie par date (les plus proches en premier)
    });

    const isOverdue = (dateString: string) => {
        const d = new Date(dateString);
        d.setHours(0,0,0,0);
        const today = new Date();
        today.setHours(0,0,0,0);
        return d.getTime() < today.getTime();
    };

    return (
        <>
            <div className="space-y-12 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between md:items-center bg-white p-5 lg:p-6 rounded-[3.5rem] lg:rounded-3xl border border-zinc-200 shadow-sm relative overflow-hidden group gap-6">
                <div className="flex items-center gap-6 lg:gap-5 relative z-10">
                    <div className="w-16 lg:w-20 h-16 lg:h-20 bg-black rounded-[1.75rem] lg:rounded-[2.25rem] flex items-center justify-center text-[#39FF14] shadow-2xl shrink-0"><Megaphone size={32}/></div>
                    <div>
                        <h2 className={`font-sans text-3xl lg:text-4xl font-black uppercase tracking-tighter`}>Planning Marketing</h2>
                        <p className="text-[10px] lg:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Suggestions IA & Calendrier d'actions</p>
                    </div>
                </div>
                <div className="flex gap-3 relative z-10 w-full md:w-auto">
                    <div className="flex-1 md:flex-none bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex flex-col items-center justify-center min-w-[110px]">
                        <span className="text-3xl font-black text-black leading-none">{plannedCount}</span>
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mt-2">Planifiées</span>
                    </div>
                    <div className="flex-1 md:flex-none bg-[#39FF14]/10 p-4 rounded-2xl border border-[#39FF14]/20 flex flex-col items-center justify-center min-w-[110px]">
                        <span className="text-3xl font-black text-[#39FF14] leading-none">{executedCount}</span>
                        <span className="text-[9px] font-black text-[#39FF14] uppercase tracking-widest mt-2">Exécutées</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                    <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-3"><Sparkles size={18} className="text-[#39FF14]"/> Suggestions de l'IA</h3>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                        {suggestionsToShow.length > 0 ? suggestionsToShow.map((s: any) => (
                            <div key={s.id} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                <p className="font-bold text-sm uppercase">{s.title}</p>
                                <p className="text-xs text-zinc-500 mt-1">{s.description}</p>
                                <button onClick={() => planAction(s)} className="mt-3 bg-black text-white text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-[#39FF14] hover:text-black transition flex items-center gap-2"><Plus size={14}/> Planifier</button>
                            </div>
                        )) : <p className="text-sm text-zinc-400 italic text-center py-10">Aucune nouvelle suggestion. Lancez un Scan IA depuis le CRM.</p>}
                    </div>
                </div>
                <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="flex flex-col xl:flex-row justify-between xl:items-center mb-6 gap-4">
                    <h3 className="font-black uppercase text-lg flex items-center gap-3"><Calendar size={18}/> Actions Planifiées</h3>
                    <div className="flex gap-2 items-center">
                        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
                            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`}>Liste</button>
                            <button onClick={() => setViewMode('calendar')} className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase transition-all ${viewMode === 'calendar' ? 'bg-white dark:bg-zinc-700 shadow text-black dark:text-white' : 'text-zinc-400 hover:text-black dark:hover:text-white'}`}>Calendrier</button>
                        </div>
                        {(executedCount > 0 || cancelledCount > 0) && (
                            <button onClick={clearFinishedActions} className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-500 hover:text-white transition flex items-center gap-1">
                                <Trash2 size={12}/> Nettoyer
                            </button>
                        )}
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                        {sortedEvents.map((e: any) => (
                            <div key={e.id} className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                <p className={`font-bold text-sm uppercase flex items-center gap-2 ${e.status === 'Annulé' ? 'line-through text-zinc-500' : ''}`}>
                                    {e.status === 'Annulé' && <XCircle size={16} className="text-red-500"/>}
                                    {e.title}
                                </p>
                                <p className="text-xs text-zinc-500 mt-1.5 flex items-center gap-2">
                                    {e.status === 'Exécuté' && e.executionDate ? (
                                        <><CheckCircle size={12} className="text-green-500"/> Exécuté le: {new Date(e.executionDate).toLocaleDateString('fr-FR')}</>
                                    ) : e.status === 'Annulé' && e.cancellationDate ? (
                                        <>Annulé le: {new Date(e.cancellationDate).toLocaleDateString('fr-FR')}</>
                                    ) : (
                                        <>
                                            Planifié le: {new Date(e.planDate).toLocaleDateString('fr-FR')}
                                            {e.status === 'Planifié' && isOverdue(e.planDate) && <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-red-200">En retard</span>}
                                        </>
                                    )}
                                </p>
                                <div className="flex gap-2 mt-3">
                                    <button disabled={e.status !== 'Planifié'} onClick={() => executePlannedAction(e)} className="bg-green-500 text-white text-[10px] font-bold px-4 py-2 rounded-xl flex items-center gap-2 disabled:bg-zinc-300 disabled:cursor-not-allowed"><Send size={14}/> {e.status === 'Exécuté' ? 'Envoyé' : 'Exécuter'}</button>
                                    <button disabled={e.status !== 'Planifié'} onClick={() => setEditingEvent(e)} className="bg-zinc-100 text-black text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed"><Edit3 size={14}/></button>
                                    <button disabled={e.status !== 'Planifié'} onClick={() => cancelPlannedAction(e.id)} className="bg-red-100 text-red-600 text-[10px] font-bold px-4 py-2 rounded-xl hover:bg-red-500 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"><X size={14}/></button>
                                </div>
                            </div>
                        ))}
                        {plannedEvents.length === 0 && <p className="text-sm text-zinc-400 italic text-center py-10">Aucune action planifiée.</p>}
                    </div>
                ) : (
                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} className="p-2 hover:bg-zinc-100 dark:bg-zinc-800 rounded-full transition-colors"><ChevronLeft size={16}/></button>
                            <h4 className="font-black uppercase text-sm">{monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</h4>
                            <button onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))} className="p-2 hover:bg-zinc-100 dark:bg-zinc-800 rounded-full transition-colors"><ChevronRight size={16}/></button>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map(d => <div key={d} className="text-center text-[10px] font-black text-zinc-400 uppercase">{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`blank-${i}`} className="aspect-square p-1"></div>)}
                            {Array.from({ length: daysInMonth }).map((_, i) => {
                                const day = i + 1;
                                const currentDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
                                const isToday = new Date().toDateString() === currentDate.toDateString();
                                const dayEvents = plannedEvents.filter((e: any) => e.planDate && new Date(e.planDate).toDateString() === currentDate.toDateString());
                                
                                return (
                                    <div key={day} className={`aspect-square p-1.5 rounded-lg border flex flex-col items-center justify-start ${isToday ? 'border-[#39FF14] bg-[#39FF14]/5' : 'border-zinc-100 dark:border-zinc-800'} overflow-hidden relative`}>
                                        <span className={`text-[10px] font-bold mb-1 ${isToday ? 'text-[#39FF14]' : 'text-zinc-500'}`}>{day}</span>
                                        <div className="w-full flex flex-col gap-0.5 items-center">
                                            {dayEvents.slice(0, 3).map((e: any) => (
                                                <div key={e.id} className={`w-full h-1.5 rounded-full ${e.status === 'Exécuté' ? 'bg-green-500' : e.status === 'Annulé' ? 'bg-red-500' : 'bg-black dark:bg-white'}`} title={e.title}></div>
                                            ))}
                                            {dayEvents.length > 3 && <div className="text-[8px] text-zinc-400 text-center font-bold">+{dayEvents.length - 3}</div>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
                </div>
                </div>
            </div>

            {toastMessage && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-[#39FF14] px-6 py-3 rounded-full font-bold text-xs shadow-2xl flex items-center gap-2 z-[300] animate-in slide-in-from-bottom-5">
                    <CheckCircle size={16}/> {toastMessage}
                </div>
            )}

            {editingEvent && (
                <div id="modal-overlay" onClick={(e: any) => e.target.id === 'modal-overlay' && setEditingEvent(null)} className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white p-8 rounded-3xl w-full max-w-lg relative shadow-2xl animate-in zoom-in-95">
                        <button onClick={() => setEditingEvent(null)} className="absolute top-6 right-6 text-zinc-400 hover:text-black transition"><X size={20}/></button>
                        <h3 className="text-xl font-black uppercase mb-6 text-black">Modifier l'action</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Date planifiée</label>
                                <input type="date" value={editingEvent.planDate ? new Date(editingEvent.planDate).toISOString().split('T')[0] : ''} onChange={e => {
                                    if(e.target.value) setEditingEvent({...editingEvent, planDate: new Date(e.target.value).toISOString()})
                                }} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#39FF14] text-sm font-bold text-black" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Message WhatsApp</label>
                                <textarea value={editingEvent.msg} onChange={e => setEditingEvent({...editingEvent, msg: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-[#39FF14] min-h-[150px] resize-none text-sm text-black" />
                            </div>
                        </div>
                        <button onClick={() => {
                            setPlannedEvents((prev: any[]) => prev.map(e => e.id === editingEvent.id ? editingEvent : e));
                            setEditingEvent(null);
                        }} className="w-full mt-6 bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-xs hover:bg-black hover:text-[#39FF14] transition shadow-lg">
                            Enregistrer
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Users, Wallet, LayoutDashboard, LogOut, TrendingUp, CheckCircle, 
  MessageSquare, UserPlus, X, Send, Edit3, Home, Target, Globe, Box, Sparkles,
  BarChart3, CreditCard, CalendarClock, PhoneCall, Key, ChevronLeft, ShieldCheck, Mail
} from "lucide-react";

// CORRECTION DU CRASH BUILD : On garde strictement les poids supportés par Google Fonts
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

// --- LES 9 SAAS DE L'ÉCOSYSTÈME ---
const ECOSYSTEM_SAAS = [
  { id: "vente", name: "Onyx Vente", price: "15.000 F", type: "Social Selling", users: 142, icon: "🛍️", color: "bg-blue-100 text-blue-600" },
  { id: "tiak", name: "Onyx Tiak", price: "10.000 F", type: "Logistique", users: 89, icon: "🛵", color: "bg-orange-100 text-orange-600" },
  { id: "stock", name: "Onyx Stock", price: "15.000 F", type: "Inventaire", users: 112, icon: "📦", color: "bg-purple-100 text-purple-600" },
  { id: "menu", name: "Onyx Menu", price: "12.500 F", type: "Restauration", users: 45, icon: "🍔", color: "bg-red-100 text-red-600" },
  { id: "booking", name: "Onyx Booking", price: "15.000 F", type: "Réservation", users: 28, icon: "📅", color: "bg-teal-100 text-teal-600" },
  { id: "staff", name: "Onyx Staff", price: "20.000 F", type: "RH & Paie", users: 34, icon: "👥", color: "bg-yellow-100 text-yellow-600" },
  { id: "crm", name: "Onyx CRM", price: "25.000 F", type: "Fidélisation", users: 56, icon: "🤝", color: "bg-indigo-100 text-indigo-600" },
  { id: "ia", name: "Onyx IA", price: "30.000 F", type: "Marketing Auto", users: 19, icon: "🧠", color: "bg-[#39FF14]/20 text-green-700" },
  { id: "link", name: "Onyx Link", price: "5.000 F", type: "Bio & Catalogue", users: 210, icon: "🔗", color: "bg-pink-100 text-pink-600" },
];

export default function AdminBentoTerminal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // ================= DONNÉES =================
  const [usersList, setUsersList] = useState<any[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  // ================= FILTRES & NAVIGATION =================
  const [caPeriodFilter, setCaPeriodFilter] = useState<"month" | "lastMonth" | "quarter">("month");
  const [crmFilter, setCrmFilter] = useState("all");
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);

  // ================= MODALES =================
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState<any>(null); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  // ================= FORMULAIRES =================
  const [newClient, setNewClient] = useState({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)", is_partner: false, avatar_url: "" });
  const [articleForm, setArticleForm] = useState({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" });
  const [profileEdit, setProfileEdit] = useState({ full_name: "", avatar_url: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchInitData();
  }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser || { full_name: "Admin Demo", email: "admin@onyx.com", role: "admin", avatar_url: "" });

    try {
      const [clientsRes, articlesRes, leadsRes, partnersRes, subsRes, txRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('created_at', { ascending: false }),
        supabase.from('subscriptions').select('*').order('end_date', { ascending: true }).limit(50),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100)
      ]);

      if (clientsRes.data) setUsersList(clientsRes.data);
      if (articlesRes.data) setArticlesList(articlesRes.data);
      if (leadsRes.data) setLeadsList(leadsRes.data);
      if (partnersRes.data) setPartnersList(partnersRes.data);
      if (subsRes.data) setSubscriptionsList(subsRes.data);
      if (txRes.data) setTransactionsList(txRes.data);
    } catch (e) { console.error("Erreur de chargement", e); }

    setLoading(false);
  }

  // ================= DÉRIVÉES DASHBOARD =================
  const caCurrent = 3850000;
  const caLastMonth = 3420000;
  const caComparisonPercent = caLastMonth ? Math.round(((caCurrent - caLastMonth) / caLastMonth) * 100) : 0;
  const histogramSales = [1200, 1900, 1500, 2100, 2400, 1800, 2200];
  const top3Products = [
    { name: "Pack Trio", count: 89, revenue: 1557500 },
    { name: "Onyx Solo", count: 142, revenue: 1065000 },
    { name: "Pack Full", count: 45, revenue: 1350000 }
  ];
  const expiringSoon = subscriptionsList.filter((s: any) => {
    const end = s.end_date ? new Date(s.end_date) : null;
    if (!end) return false;
    const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 && daysLeft >= 0;
  }).slice(0, 10);
  const contactsToRelance = usersList.filter((u: any) => u.role === "prospect" || (u.expire && String(u.expire).includes("J-"))).slice(0, 10);

  // ================= ACTIONS PROFIL & AUTH =================
  const handleUpdatePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) { alert("Les mots de passe ne correspondent pas."); return; }
    if (passwordForm.new.length < 6) { alert("6 caractères minimum."); return; }
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    setIsUpdatingPassword(false);
    if (error) alert("Erreur: " + error.message);
    else { alert("Mot de passe mis à jour."); setPasswordForm({ current: "", new: "", confirm: "" }); }
  };

  const handleSaveProfile = async () => {
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: profileEdit.full_name, avatar_url: profileEdit.avatar_url } });
    if (error) alert("Erreur: " + error.message);
    else { if (data?.user) setUser(data.user); alert("Profil mis à jour."); setShowProfileModal(false); }
  };

  // ================= SAUVEGARDE DB (FIX UUID) =================
  const saveClient = async () => {
    if(!newClient.full_name) return;
    const avatar_url = newClient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(newClient.full_name)}`;
    const clientData = { ...newClient, avatar_url };

    if (newClient.id && newClient.id.trim() !== "") {
      const { error } = await supabase.from('clients').update(clientData).eq('id', newClient.id);
      if(!error) setUsersList(usersList.map(u => u.id === newClient.id ? { ...u, ...clientData } : u));
    } else {
      delete clientData.id; // FIX STRICT DE L'ERREUR UUID
      const { data, error } = await supabase.from('clients').insert(clientData).select().single();
      if(!error && data) setUsersList([data, ...usersList]);
    }
    setShowAddClientModal(false);
  };

  const saveArticle = async () => {
    if (!articleForm.title) return;
    const dataToSave = { ...articleForm };
    
    if (dataToSave.id && dataToSave.id.trim() !== "") {
      const { error } = await supabase.from('articles').update(dataToSave).eq('id', dataToSave.id);
      if(!error) setArticlesList(articlesList.map(a => a.id === dataToSave.id ? { ...a, ...dataToSave } : a));
    } else {
      delete dataToSave.id; // FIX STRICT
      const { data, error } = await supabase.from('articles').insert(dataToSave).select().single();
      if(!error && data) setArticlesList([data, ...articlesList]);
    }
    setShowArticleModal(null);
  };

  const approvePartner = async (id: string) => {
     const { error } = await supabase.from('partners').update({ status: 'Approuvé' }).eq('id', id);
     if(!error) setPartnersList(partnersList.map(p => p.id === id ? {...p, status: 'Approuvé'} : p));
  };

  const generateArticleAI = () => {
     setIsGenerating(true);
     setTimeout(() => {
        setArticleForm({
           id: "", title: "Comment le Digital transforme les Restaurants à Dakar en 2026", category: "Restauration", pack_focus: "Pack Full", content: "L'intelligence artificielle permet de réduire les pertes de 30%..."
        });
        setIsGenerating(false);
        setShowArticleModal({});
     }, 1500);
  };

  // ================= ACTIONS CRM (MOT DE PASSE, PARTENAIRE) =================
  const generatePassword = (client: any) => {
    const pwd = Math.random().toString(36).slice(-8).toUpperCase() + "!";
    alert(`Mot de passe généré pour ${client.full_name} : ${pwd}\n\nLien : https://${client.saas.toLowerCase().replace(' ', '')}.onyxops.com/login`);
  };

  const convertToPartner = async (client: any) => {
    if(confirm(`Convertir ${client.full_name} en Partenaire ? Il aura -30% sur ses propres achats et un lien d'affiliation.`)) {
       const { error } = await supabase.from('clients').update({ is_partner: true }).eq('id', client.id);
       if(!error) setUsersList(usersList.map(u => u.id === client.id ? { ...u, is_partner: true } : u));
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (crmFilter === 'all') return true;
    if (crmFilter === 'top') return u.saas === 'Onyx IA' || u.is_partner;
    if (crmFilter === 'dormant') return u.role === 'dormant';
    if (crmFilter === 'relance') return u.expire?.includes('Expiré');
    if (crmFilter === 'expire') return u.expire?.includes('J-');
    return true;
  });

  if (loading) return <div className={`${spaceGrotesk.className} min-h-screen flex items-center justify-center bg-white font-black uppercase text-3xl animate-pulse`}>Chargement du Terminal...</div>;

  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FA] text-black flex overflow-hidden`}>
      
      {/* SIDEBAR NOIRE/VERTE */}
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between hidden lg:flex shadow-sm z-10">
        <div>
          <div className="mb-12 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <span className={`${spaceGrotesk.className} font-black text-4xl tracking-tighter uppercase`}>ONYX<span className="text-[#39FF14]">OPS</span></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 ml-2">Menu Principal</p>
          <div className="space-y-2">
            <NavBtn icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setSelectedSaaS(null);}} />
            <NavBtn icon={<Users size={20}/>} label="Membres & CRM" active={activeTab === 'users'} onClick={() => {setActiveTab('users'); setSelectedSaaS(null);}} />
            <NavBtn icon={<Box size={20}/>} label="Écosystème (9 SaaS)" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
            <NavBtn icon={<Wallet size={20}/>} label="Finances" active={activeTab === 'finances'} onClick={() => {setActiveTab('finances'); setSelectedSaaS(null);}} />
            <NavBtn icon={<Target size={20}/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => {setActiveTab('partners'); setSelectedSaaS(null);}} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-8 mb-4 ml-2">Marketing & Ventes</p>
            <NavBtn icon={<Globe size={20}/>} label="Marketing & Blog" active={activeTab === 'marketing'} onClick={() => {setActiveTab('marketing'); setSelectedSaaS(null);}} />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER ADMIN */}
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-8 flex justify-between items-center z-10 shadow-sm">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>{selectedSaaS ? selectedSaaS.name : (activeTab === 'overview' ? 'Terminal' : activeTab)}</h1>
          <div className="flex items-center gap-6">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors"><Home size={16}/> Voir le site</button>
            
            <div onClick={() => { setProfileEdit({ full_name: user?.user_metadata?.full_name || user?.full_name || "", avatar_url: user?.user_metadata?.avatar_url || user?.avatar_url || "" }); setShowProfileModal(true); }} className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 bg-zinc-50 rounded-full hover:bg-zinc-100 transition border border-transparent hover:border-zinc-200">
              <div className="text-right ml-2">
                <p className="text-[10px] font-black uppercase leading-none">{user?.user_metadata?.full_name || user?.full_name || "Admin"}</p>
                <p className="text-[8px] font-bold text-[#39FF14] uppercase">Profil & Réglages</p>
              </div>
              {user?.user_metadata?.avatar_url || user?.avatar_url ? (
                <img src={user.user_metadata?.avatar_url || user.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full object-cover border-2 border-zinc-200 shadow-sm" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-200 border border-zinc-300 flex items-center justify-center font-black text-sm text-zinc-600 shadow-sm">
                  {user?.full_name ? String(user.full_name).substring(0,2).toUpperCase() : "AD"}
                </div>
              )}
            </div>
            
            <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="text-zinc-400 hover:text-red-500"><LogOut size={20}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth flex flex-col">
          <div className="flex-1">
            
            {/* ================= 1. DASHBOARD (TERMINAL/EMPIRE) ================= */}
            {activeTab === 'overview' && !selectedSaaS && (
              <div className="space-y-8 animate-in fade-in">
                <div className="text-center mb-10">
                   <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-4 uppercase`}>Onyx Intelligence V3.5</div>
                   <h2 className={`${spaceGrotesk.className} text-7xl md:text-8xl font-black uppercase tracking-tighter italic`}>EMPIRE</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div onClick={() => setActiveTab('finances')} className="p-8 rounded-[3rem] border border-zinc-200 bg-black text-white shadow-2xl cursor-pointer hover:scale-105 transition-transform">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">Chiffre d&apos;affaires</p>
                       <select value={caPeriodFilter} onChange={(e) => { e.stopPropagation(); setCaPeriodFilter(e.target.value as any); }} onClick={(e) => e.stopPropagation()} className="bg-zinc-800 text-white text-[10px] font-bold uppercase px-2 py-1 rounded border border-zinc-600 outline-none">
                         <option value="month">Ce mois</option>
                         <option value="lastMonth">Mois dernier</option>
                         <option value="quarter">3 derniers mois</option>
                       </select>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className={`${spaceGrotesk.className} text-5xl md:text-6xl font-black tracking-tighter italic`}>
                        {caPeriodFilter === "month" ? "3.850.000" : caPeriodFilter === "lastMonth" ? "3.420.000" : "10.120.000"}
                      </p>
                      <span className="text-[#39FF14] text-sm font-black">F</span>
                    </div>
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mt-1">Revenu {caPeriodFilter === "month" ? "mensuel" : "global"}</p>
                    <p className="text-[10px] font-black uppercase text-[#39FF14] mt-2">+{caComparisonPercent}% vs mois dernier</p>
                  </div>
                  <div onClick={() => setActiveTab('users')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-black transition-colors flex flex-col justify-center text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Essais Actifs / Leads</p>
                     <p className={`${spaceGrotesk.className} text-6xl font-black tracking-tighter italic text-black`}>{leadsList.length || 142}</p>
                     <p className="text-xs font-bold text-zinc-500 mt-2">Prêts à convertir</p>
                  </div>
                  <div onClick={() => setActiveTab('marketing')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-[#39FF14] transition-colors flex flex-col justify-center text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Articles Publiés</p>
                     <p className={`${spaceGrotesk.className} text-6xl font-black tracking-tighter italic text-black`}>{articlesList.length}</p>
                     <p className="text-xs font-bold text-zinc-500 mt-2">Impact Social / SEO</p>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-6 h-6 text-[#39FF14]" />
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl tracking-tighter`}>Ventes par jour (7 derniers jours)</h3>
                  </div>
                  <div className="flex items-end justify-between gap-2 h-44">
                    {histogramSales.map((val, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full h-32 flex items-end rounded-t-lg overflow-hidden bg-zinc-100">
                          <div className="w-full bg-[#39FF14] rounded-t-lg min-h-[4px]" style={{ height: `${Math.max(8, (val / 2500) * 100)}%` }} />
                        </div>
                        <span className="text-[10px] font-black uppercase text-zinc-400">J-{6 - i}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div onClick={() => setActiveTab('ecosystem')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-[#39FF14] transition-colors">
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg tracking-tighter mb-4 flex items-center gap-2`}><TrendingUp size={20} className="text-[#39FF14]" /> Top 3 produits</h3>
                    <ul className="space-y-3">
                      {top3Products.map((p, i) => (
                        <li key={i} className="flex justify-between items-center text-sm font-bold">
                          <span className="text-zinc-600">#{i + 1} {p.name}</span>
                          <span className="text-black">{p.count} ventes</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] font-black uppercase text-zinc-400 mt-4">Cliquez pour voir l'écosystème</p>
                  </div>
                  <div className="lg:col-span-2 bg-white rounded-[3rem] border border-zinc-200 shadow-sm overflow-hidden">
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg tracking-tighter p-6 pb-0 flex items-center gap-2`}><CreditCard size={20} className="text-[#39FF14]" /> Dernières transactions</h3>
                    <div className="overflow-y-auto max-h-64 p-6">
                      {transactionsList.length === 0 ? (
                        <p className="text-zinc-400 text-sm font-bold">Aucune transaction.</p>
                      ) : (
                        <ul className="space-y-3">
                          {transactionsList.slice(0, 15).map((tx: any) => (
                            <li key={tx.id} className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0 text-sm">
                              <span className="font-bold">{tx.description || tx.plan_name || "Paiement"}</span>
                              <span className="text-[#39FF14] font-black">+{tx.amount ?? 0} F</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={() => setActiveTab('users')} className="bg-white p-8 rounded-[3rem] border-2 border-amber-200 shadow-sm cursor-pointer hover:border-amber-400 transition-colors">
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg tracking-tighter mb-4 flex items-center gap-2`}><CalendarClock size={20} className="text-amber-500" /> Abonnements expirants</h3>
                    {expiringSoon.length === 0 ? (
                      <p className="text-zinc-400 text-sm font-bold">Aucun abonnement à renouveler dans les 30 jours.</p>
                    ) : (
                      <ul className="space-y-2">
                        {expiringSoon.map((s: any) => (
                          <li key={s.id} className="text-sm font-bold flex justify-between">
                            <span>{s.plan_name || "Abonnement"}</span>
                            <span className="text-amber-600">{s.end_date ? new Date(s.end_date).toLocaleDateString("fr-FR") : "-"}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div onClick={() => setActiveTab('users')} className="bg-white p-8 rounded-[3rem] border-2 border-blue-200 shadow-sm cursor-pointer hover:border-blue-400 transition-colors">
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg tracking-tighter mb-4 flex items-center gap-2`}><PhoneCall size={20} className="text-blue-500" /> Contacts à relancer</h3>
                    {contactsToRelance.length === 0 ? (
                      <p className="text-zinc-400 text-sm font-bold">Aucun contact à relancer.</p>
                    ) : (
                      <ul className="space-y-2">
                        {contactsToRelance.map((u: any) => (
                          <li key={u.id} className="text-sm font-bold flex justify-between">
                            <span>{u.full_name}</span>
                            <span className="text-blue-600 text-[10px]">{u.expire || u.role}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 2. ÉCOSYSTÈME (LES 9 SAAS) ================= */}
            {activeTab === 'ecosystem' && !selectedSaaS && (
               <div className="animate-in fade-in">
                  <h3 className={`${spaceGrotesk.className} font-black uppercase text-3xl tracking-tighter mb-8`}>La Suite OnyxOps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {ECOSYSTEM_SAAS.map(saas => (
                        <div key={saas.id} onClick={() => setSelectedSaaS(saas)} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:border-black transition cursor-pointer group">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${saas.color}`}>
                              {saas.icon}
                           </div>
                           <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase mb-1 group-hover:text-[#39FF14] transition`}>{saas.name}</h4>
                           <p className="text-xs font-bold text-zinc-500 mb-4">{saas.type}</p>
                           <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{saas.users} Clients</span>
                              <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black">{saas.price}/m</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {selectedSaaS && (
               <div className="animate-in slide-in-from-right-8 duration-300">
                  <button onClick={() => setSelectedSaaS(null)} className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition">
                     <ChevronLeft size={16}/> Retour à l'écosystème
                  </button>
                  
                  <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl mb-8 relative overflow-hidden">
                     <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-8xl opacity-10">{selectedSaaS.icon}</div>
                     <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${selectedSaaS.color}`}>{selectedSaaS.icon}</div>
                        <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter`}>{selectedSaaS.name}</h2>
                     </div>
                     <p className="text-zinc-400 font-bold max-w-lg relative z-10 mb-8">Base de données isolée et gestion des clients pour {selectedSaaS.name}.</p>
                     
                     <div className="flex gap-4 relative z-10">
                        <button onClick={() => alert(`Lien de connexion pour les clients : https://${selectedSaaS.id}.onyxops.com/login`)} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                           <Key size={16}/> URL Login Client
                        </button>
                        <button className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition">
                           Générer un accès Test
                        </button>
                     </div>
                  </div>

                  <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200">
                     <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl mb-6`}>Clients actifs sur {selectedSaaS.name} ({selectedSaaS.users})</h3>
                     <div className="text-center p-12 text-zinc-400 font-bold uppercase text-sm border-2 border-dashed border-zinc-200 rounded-3xl">
                        [Simulation Base de données isolée] <br/><br/>
                        Ici s'afficheront uniquement les données des utilisateurs ayant souscrit à {selectedSaaS.name}.
                     </div>
                  </div>
               </div>
            )}

            {/* ================= 3. CRM & MEMBRES (AVEC KPIs ET SCANNER) ================= */}
            {activeTab === 'users' && !selectedSaaS && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200 mb-6">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter flex items-center gap-3`}><Users className="text-[#39FF14]"/> CRM Hub</h3>
                   <div className="flex gap-4">
                     <button onClick={() => setShowScannerModal(true)} className="bg-black text-[#39FF14] px-6 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition flex items-center gap-2 tracking-widest">
                        <Sparkles size={16}/> Scanner la base (IA)
                     </button>
                     <button onClick={() => { setNewClient({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)", is_partner: false, avatar_url: "" }); setShowAddClientModal(true); }} className="bg-zinc-100 border border-zinc-200 text-black px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition flex items-center gap-2">
                        <UserPlus size={16}/> Ajouter Contact
                     </button>
                   </div>
                </div>

                {/* LES KPI FILTRES */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div onClick={() => setCrmFilter('top')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'top' ? 'bg-black text-[#39FF14] border-black shadow-lg' : 'bg-white border-zinc-200 hover:border-black'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={14}/> Top Clients VIP</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>{usersList.filter(u => u.saas === 'Onyx IA' || u.is_partner).length || 14}</p>
                  </div>
                  <div onClick={() => setCrmFilter('dormant')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'dormant' ? 'bg-zinc-800 text-white border-zinc-600 shadow-lg' : 'bg-white border-zinc-200 hover:border-zinc-800'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><MessageSquare size={14}/> Clients Dormants</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>{usersList.filter(u => u.role === 'dormant').length || 28}</p>
                  </div>
                  <div onClick={() => setCrmFilter('expire')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'expire' ? 'bg-red-50 text-red-600 border-red-200 shadow-lg' : 'bg-white border-zinc-200 hover:border-red-400'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><CalendarClock size={14}/> Expirations (J-7)</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>{usersList.filter(u => u.expire?.includes('J-')).length || 12}</p>
                  </div>
                  <div onClick={() => setCrmFilter('relance')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'relance' ? 'bg-[#39FF14]/20 text-green-800 border-[#39FF14] shadow-lg' : 'bg-white border-zinc-200 hover:border-[#39FF14]'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><PhoneCall size={14}/> À Relancer</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>{usersList.filter(u => u.expire?.includes('Expiré')).length || 8}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.length === 0 && <p className="text-zinc-500 font-bold col-span-full">Aucun client pour ce filtre. Essayez un autre KPI.</p>}
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:border-black transition flex flex-col justify-between group relative overflow-hidden">
                      {u.is_partner && <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl"><ShieldCheck size={10} className="inline mr-1"/> Partenaire</div>}
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.full_name}`} className="w-14 h-14 rounded-full object-cover border-2 border-zinc-100" alt="" />
                          <div className="flex gap-2">
                            <button onClick={() => generatePassword(u)} className="text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-lg hover:bg-black hover:text-white transition flex items-center gap-1">
                               <Key size={10}/> Accès
                            </button>
                            <button onClick={() => { setNewClient(u); setShowAddClientModal(true); }} className="p-1.5 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-black hover:text-white transition opacity-0 group-hover:opacity-100"><Edit3 size={14}/></button>
                          </div>
                        </div>
                        <p className="font-black text-xl mb-1 uppercase tracking-tight">{u.full_name}</p>
                        <p className="text-xs font-bold text-zinc-400 mb-4 flex items-center gap-1"><Mail size={12}/> {u.contact}</p>
                        
                        <div className="bg-zinc-50 p-4 rounded-2xl mb-4 border border-zinc-100">
                          <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black uppercase text-zinc-500">SaaS Actif</span><span className="text-[10px] font-black">{u.saas}</span></div>
                          <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-zinc-500">Statut</span><span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${u.expire?.includes('Expire') ? 'bg-red-100 text-red-600' : 'bg-[#39FF14]/20 text-green-700'}`}>{u.expire}</span></div>
                        </div>
                      </div>

                      {!u.is_partner && (
                         <button onClick={() => convertToPartner(u)} className="w-full text-center py-2 mt-2 border border-dashed border-zinc-300 text-zinc-400 rounded-xl text-[10px] font-black uppercase hover:border-[#39FF14] hover:text-[#39FF14] transition">
                            Convertir en Partenaire
                         </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= 4. MARKETING / SÉQUENCES / BLOG ================= */}
            {activeTab === 'marketing' && !selectedSaaS && (
              <div className="space-y-8 animate-in fade-in">
                 {/* SÉQUENCES AUTO */}
                 <div className="bg-black text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
                   <div className="absolute right-0 top-0 p-10 opacity-5"><CalendarClock size={200}/></div>
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-3xl tracking-tighter mb-8 relative z-10 flex items-center gap-3`}><Sparkles className="text-[#39FF14]"/> Séquences Automatiques (Essais Gratuits)</h3>
                   <div className="grid md:grid-cols-3 gap-6 relative z-10">
                      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                         <span className="bg-white text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">J0 - Inscription</span>
                         <p className="font-bold text-sm mb-2">Message Bienvenue + Tuto Vidéo</p>
                         <p className="text-xs text-zinc-400">Pousse l'utilisateur à configurer son catalogue immédiatement pour créer l'effet "Wahou".</p>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative">
                         <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">J+7 - Milieu Essai</span>
                         <p className="font-bold text-sm mb-2">Relance "Comment ça se passe ?"</p>
                         <p className="text-xs text-zinc-400">Demande si le client a des blocages. Propose un appel gratuit de 10 min avec un expert.</p>
                      </div>
                      <div className="bg-[#39FF14]/10 border border-[#39FF14] p-6 rounded-2xl relative">
                         <span className="bg-[#39FF14] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">J-1 - Expiration</span>
                         <p className="font-bold text-sm mb-2 text-white">Offre Irrésistible (-20%)</p>
                         <p className="text-xs text-zinc-300">"Votre essai expire demain. Ne perdez pas vos données de vente, voici un code promo..."</p>
                      </div>
                   </div>
                </div>

                {/* BLOG IA */}
                <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200 mb-8">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter`}>Articles & Ciblage (Blog)</h3>
                   <div className="flex gap-4">
                     <button onClick={generateArticleAI} disabled={isGenerating} className="bg-black text-[#39FF14] px-6 py-4 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition flex items-center gap-2">
                        {isGenerating ? "Génération..." : <><Sparkles size={16}/> Auto-suggestion IA</>}
                     </button>
                     <button onClick={() => { setArticleForm({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" }); setShowArticleModal({}); }} className="bg-zinc-100 border border-zinc-200 text-black px-6 py-4 rounded-xl font-black text-xs uppercase hover:bg-black hover:text-white transition">
                        Rédiger Manuel
                     </button>
                   </div>
                </div>

                <div className="grid gap-6">
                   {articlesList.length === 0 && <div className="text-center p-12 bg-white rounded-[3rem] font-bold uppercase text-zinc-400 border border-dashed border-zinc-300">Aucun article publié. Créez-en un ou utilisez l'IA.</div>}
                   {articlesList.map(article => (
                      <div key={article.id} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm hover:border-black transition flex flex-col md:flex-row justify-between items-center gap-6 group">
                         <div className="flex-1">
                            <div className="flex gap-2 mb-4">
                               <span className="text-[10px] font-black uppercase bg-black text-[#39FF14] px-3 py-1.5 rounded-md">{article.category}</span>
                               <span className="text-[10px] font-black uppercase bg-zinc-100 px-3 py-1.5 rounded-md border border-zinc-200">Cible : {article.pack_focus || "Tous"}</span>
                            </div>
                            <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase tracking-tighter mb-2 group-hover:text-[#39FF14] transition`}>{article.title}</h4>
                            <p className="text-sm font-medium text-zinc-500 line-clamp-2">{article.content}</p>
                         </div>
                         <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button onClick={() => alert(`Article envoyé à la cible (${article.pack_focus}) via WhatsApp et Email.`)} className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-[#39FF14] text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:scale-105 transition shadow-md">
                               <Send size={14}/> Diffuser au Segment
                            </button>
                            <button onClick={() => { setArticleForm(article); setShowArticleModal(article); }} className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-zinc-100 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition">
                               <Edit3 size={14}/> Éditer
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
              </div>
            )}

            {/* ================= 5. PARTENAIRES (APPROBATION) ================= */}
            {activeTab === 'partners' && !selectedSaaS && (
              <div className="space-y-6 animate-in fade-in">
                 <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200 mb-8">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter`}>Validation Partenaires (Ambassadeurs)</h3>
                 </div>
                 
                 <div className="grid gap-6">
                   {partnersList.length === 0 && <p className="text-zinc-500 font-bold uppercase text-sm">Aucun formulaire de partenariat reçu.</p>}
                   {partnersList.map(partner => (
                      <div key={partner.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                               <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase`}>{partner.full_name}</h4>
                               <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{partner.activity}</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-500 mb-4 flex gap-4">
                               <span>📞 {partner.contact}</span> <span>📍 {partner.city || "Non précisé"}</span>
                            </p>
                            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs">
                               <p className="font-bold text-black mb-1">Objectif : <span className="font-medium text-zinc-600">{partner.objective || "Non précisé"}</span></p>
                               <p className="font-bold text-black">Prospection : <span className="font-medium text-zinc-600">{partner.prospection || "Non précisé"}</span></p>
                            </div>
                         </div>
                         <div className="flex flex-col gap-3 w-full md:w-auto">
                            {partner.status === 'En attente' ? (
                               <button onClick={() => approvePartner(partner.id)} className="bg-black text-[#39FF14] px-8 py-4 rounded-xl text-xs font-black uppercase hover:scale-105 transition shadow-xl">Approuver & Créer Accès</button>
                            ) : (
                               <span className="text-green-700 bg-green-50 px-6 py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 border border-green-200"><ShieldCheck size={16}/> Compte Actif</span>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
              </div>
            )}

            {/* ================= 6. INBOX / LEADS ================= */}
            {activeTab === 'chat' && !selectedSaaS && (
               <div className="space-y-6 flex h-full animate-in fade-in">
                  <div className="w-1/3 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
                     <div className="p-6 border-b border-zinc-100">
                        <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl`}>Leads Entrants</h3>
                     </div>
                     <div className="overflow-y-auto flex-1 p-4 space-y-2">
                        {leadsList.length === 0 && <p className="text-zinc-500 font-bold text-xs uppercase p-4">Aucun lead capturé.</p>}
                        {leadsList.map(lead => (
                           <div key={lead.id} className="p-4 rounded-2xl cursor-pointer border border-zinc-100 hover:border-black transition bg-zinc-50 hover:bg-black hover:text-white group">
                              <div className="flex justify-between items-center mb-2">
                                 <span className="font-black text-sm">Lead Bot</span>
                                 <span className="text-[9px] bg-[#39FF14] text-black px-2 py-0.5 rounded-full font-black uppercase">{lead.source}</span>
                              </div>
                              <p className="text-xs font-medium text-zinc-500 group-hover:text-zinc-300 truncate">{lead.intent || lead.contact}</p>
                           </div>
                        ))}
                     </div>
                  </div>
                  
                  <div className="flex-1 bg-white rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col items-center justify-center text-zinc-400">
                     <MessageSquare size={48} className="mb-4 opacity-20"/>
                     <p className="font-bold uppercase text-sm">Sélectionnez un lead pour ouvrir la discussion</p>
                  </div>
               </div>
            )}

            {/* Finances - En attente Supabase */}
            {activeTab === 'finances' && !selectedSaaS && (
               <div className="flex items-center justify-center h-[60vh] text-zinc-400 font-black uppercase text-2xl animate-pulse">
                  Section Finances complète en synchronisation...
               </div>
            )}

          </div>

          <footer className="mt-8 pt-6 border-t border-zinc-200 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
             <p>OnyxOps Admin Hub © 2026</p>
             <p>Connexion Sécurisée - Dakar</p>
          </footer>
        </div>
      </main>

      {/* ================= MODALES ADMIN ================= */}
      
      {/* MODALE : SCANNER IA */}
      {showScannerModal && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
             <button onClick={() => setShowScannerModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
             <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 tracking-tighter flex items-center gap-2`}><Sparkles className="text-[#39FF14]"/> Rapport IA CRM</h2>
             <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">L'IA a scanné votre base et trouvé 3 opportunités cachées.</p>
             
             <div className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex justify-between items-center">
                   <div>
                      <p className="font-black uppercase text-sm">Boutique Chez Fatou</p>
                      <p className="text-xs text-zinc-500 font-medium">L'essai Onyx Vente expire dans 24h. Fort usage du catalogue.</p>
                   </div>
                   <button className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition">Proposer -20% (WhatsApp)</button>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex justify-between items-center">
                   <div>
                      <p className="font-black uppercase text-sm">Restaurant Le Dakar</p>
                      <p className="text-xs text-zinc-500 font-medium">Utilise Onyx Menu depuis 6 mois. N'a pas de logiciel RH.</p>
                   </div>
                   <button className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition">Upsell Onyx Staff</button>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex justify-between items-center">
                   <div>
                      <p className="font-black uppercase text-sm">Awa Cosmétiques</p>
                      <p className="text-xs text-zinc-500 font-medium">Très active. Profil parfait pour le programme Partenaire.</p>
                   </div>
                   <button className="bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-zinc-700 hover:bg-zinc-800 transition">Invitation Ambassadeur</button>
                </div>
             </div>
           </div>
         </div>
      )}

      {/* MODALE : PROFIL & MOT DE PASSE */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative text-center animate-in zoom-in">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            {profileEdit.avatar_url ? (
              <img src={profileEdit.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-zinc-100 mx-auto mb-4 object-cover shadow-sm" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-zinc-200 border-4 border-zinc-100 mx-auto mb-4 flex items-center justify-center font-black text-3xl text-zinc-600 shadow-sm">
                {user?.full_name ? String(user.full_name).substring(0,2).toUpperCase() : "AD"}
              </div>
            )}
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-1 tracking-tighter`}>{profileEdit.full_name || user?.full_name || "Administrateur"}</h2>
            <p className="text-xs font-bold text-zinc-500 mb-6">{user?.email}</p>
            <div className="space-y-4 text-left">
               <input type="text" value={profileEdit.full_name} onChange={e => setProfileEdit(p => ({ ...p, full_name: e.target.value }))} placeholder="Nom affiché" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
               <input type="url" value={profileEdit.avatar_url} onChange={e => setProfileEdit(p => ({ ...p, avatar_url: e.target.value }))} placeholder="URL de la photo de profil" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
               <button onClick={handleSaveProfile} className="w-full py-3 bg-black text-[#39FF14] font-black text-xs uppercase rounded-xl hover:bg-[#39FF14] hover:text-black transition shadow-xl">Enregistrer le profil</button>
            </div>
            <div className="mt-8 pt-6 border-t border-zinc-200 text-left">
              <p className="text-[10px] font-black uppercase text-zinc-500 mb-3">Modifier le mot de passe</p>
              <input type="password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} placeholder="Mot de passe actuel (optionnel)" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black mb-2" />
              <input type="password" value={passwordForm.new} onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))} placeholder="Nouveau mot de passe" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black mb-2" />
              <input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} placeholder="Confirmer le mot de passe" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black mb-3" />
              <button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="w-full py-3 bg-zinc-100 text-black font-black text-xs uppercase rounded-xl hover:bg-zinc-200 transition">
                {isUpdatingPassword ? "Mise à jour..." : "Changer le mot de passe"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE : AJOUT CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowAddClientModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 tracking-tighter`}>{newClient.id ? 'Modifier Contact' : 'Ajouter Contact'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nom Complet" value={newClient.full_name} onChange={e => setNewClient({...newClient, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <input type="text" placeholder="Numéro WhatsApp ou Email" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <select value={newClient.saas} onChange={e => setNewClient({...newClient, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
                 {ECOSYSTEM_SAAS.map(e => <option key={e.name} value={e.name}>SaaS : {e.name}</option>)}
              </select>
            </div>
            <button onClick={saveClient} className="w-full py-4 bg-[#39FF14] text-black font-black text-xs uppercase rounded-xl mt-8 shadow-xl hover:scale-105 transition">Enregistrer</button>
          </div>
        </div>
      )}

      {/* MODALE : ARTICLE BLOG */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowArticleModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 tracking-tighter`}>{articleForm.id ? 'Modifier Article' : 'Nouvel Article'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Titre de l'article" value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <div className="flex gap-4">
                 <select value={articleForm.category} onChange={e => setArticleForm({...articleForm, category: e.target.value})} className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
                    <option>Social Selling</option><option>Gestion d'Équipe</option><option>Restauration</option><option>Logistique</option>
                 </select>
                 <select value={articleForm.pack_focus} onChange={e => setArticleForm({...articleForm, pack_focus: e.target.value})} className="flex-1 p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
                    <option>Pack Solo</option><option>Pack Trio</option><option>Pack Full</option><option>Onyx Premium</option>
                 </select>
              </div>
              <textarea placeholder="Contenu de l'article..." rows={6} value={articleForm.content} onChange={e => setArticleForm({...articleForm, content: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:border-black resize-none" />
            </div>
            <button onClick={saveArticle} className="w-full py-4 bg-black text-[#39FF14] font-black text-xs uppercase rounded-xl mt-8 shadow-xl hover:scale-105 transition">Publier l'Article</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 mx-2 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}>
      <div className={`${active ? 'text-[#39FF14]' : 'text-zinc-400'}`}>{icon}</div>{label}
    </button>
  );
}
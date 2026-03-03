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

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

// --- LES 9 SAAS DE L'ÉCOSYSTÈME (PRIX HARMONISÉS) ---
const ECOSYSTEM_SAAS = [
  { id: "vente", name: "Onyx Vente", price: "8.900 F", type: "Social Selling", users: 142, icon: "🛍️", color: "bg-blue-100 text-blue-600" },
  { id: "tiak", name: "Onyx Tiak", price: "8.900 F", type: "Logistique", users: 89, icon: "🛵", color: "bg-orange-100 text-orange-600" },
  { id: "stock", name: "Onyx Stock", price: "8.900 F", type: "Inventaire", users: 112, icon: "📦", color: "bg-purple-100 text-purple-600" },
  { id: "menu", name: "Onyx Menu", price: "8.900 F", type: "Restauration", users: 45, icon: "🍔", color: "bg-red-100 text-red-600" },
  { id: "booking", name: "Onyx Booking", price: "8.900 F", type: "Réservation", users: 28, icon: "📅", color: "bg-teal-100 text-teal-600" },
  { id: "staff", name: "Onyx Staff", price: "8.900 F", type: "RH & Paie", users: 34, icon: "👥", color: "bg-yellow-100 text-yellow-600" },
  { id: "fit", name: "Onyx Fit", price: "5.900 F", type: "Coaching Sport", users: 56, icon: "💪", color: "bg-indigo-100 text-indigo-600" },
  { id: "tontine", name: "Onyx Tontine", price: "5.900 F", type: "Finance", users: 19, icon: "💰", color: "bg-[#39FF14]/20 text-green-700" },
  { id: "academy", name: "Onyx Academy", price: "5.900 F", type: "E-learning", users: 210, icon: "🎓", color: "bg-pink-100 text-pink-600" },
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

  // ================= SAUVEGARDE DB (FIX SUPABASE ID) =================
  const saveClient = async () => {
    if(!newClient.full_name) return;
    const avatar_url = newClient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(newClient.full_name)}`;
    const clientData = { ...newClient, avatar_url };

    if (newClient.id && newClient.id.trim() !== "") {
      const { error } = await supabase.from('clients').update(clientData).eq('id', newClient.id);
      if(!error) setUsersList(usersList.map(u => u.id === newClient.id ? { ...u, ...clientData } : u));
    } else {
      const { id, ...insertData } = clientData;
      // Ajout de crypto.randomUUID() pour éviter l'erreur de colonne ID nulle
      const { data, error } = await supabase.from('clients').insert({ ...insertData, id: crypto.randomUUID() }).select().single();
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
      const { id, ...insertData } = dataToSave;
      // Ajout de crypto.randomUUID()
      const { data, error } = await supabase.from('articles').insert({ ...insertData, id: crypto.randomUUID() }).select().single();
      if(!error && data) setArticlesList([data, ...articlesList]);
    }
    setShowArticleModal(null);
  };

  // ================= ACTIVATION PARTENAIRE (WA + HUB) =================
  const handleApprovePartner = async (partner: any) => {
    const { error } = await supabase.from('partners').update({ status: 'Approuvé' }).eq('id', partner.id);
    if(error) return alert(error.message);

    // Génération mot de passe complexe
    const generatedPwd = Math.random().toString(36).slice(-8).toUpperCase() + "!";
    
    // Message WhatsApp avec accès HUB
    const message = `Félicitations ${partner.full_name} ! Votre demande de partenariat OnyxOps est ACTIVÉE. ✅\n\nIdentifiants Access Hub :\nLien : https://onyxops.com/login\nContact : ${partner.contact}\nMot de passe : ${generatedPwd}\n\nVous pouvez désormais gérer vos gains, copier votre lien parrain et accéder à vos outils dans votre dashboard Hub. Bienvenue !`;
    
    setPartnersList(partnersList.map(p => p.id === partner.id ? {...p, status: 'Approuvé'} : p));
    
    // Ouverture WhatsApp
    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${partner.contact.replace(/\s/g, '')}?text=${encodedMsg}`, '_blank');
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

  // ================= ACTIONS CRM =================
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
    if (crmFilter === 'top') return u.is_partner;
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
            
            {/* ================= 1. DASHBOARD ================= */}
            {activeTab === 'overview' && !selectedSaaS && (
              <div className="space-y-8 animate-in fade-in">
                <div className="text-center mb-10">
                   <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-4 uppercase`}>Onyx Intelligence V3.5</div>
                   {/* Empire supprimé ici */}
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
                  {/* Histogramme rendu non cliquable par pointer-events-none sur le conteneur des barres */}
                  <div className="flex items-end justify-between gap-2 h-44 pointer-events-none">
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
              </div>
            )}

            {/* ================= 2. ÉCOSYSTÈME ================= */}
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

            {/* ================= 3. CRM & MEMBRES ================= */}
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

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div onClick={() => setCrmFilter('top')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'top' ? 'bg-black text-[#39FF14] border-black shadow-lg' : 'bg-white border-zinc-200 hover:border-black'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={14}/> Top Clients VIP</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>{usersList.filter(u => u.is_partner).length || 0}</p>
                  </div>
                  <div onClick={() => setCrmFilter('expire')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'expire' ? 'bg-red-50 text-red-600 border-red-200 shadow-lg' : 'bg-white border-zinc-200 hover:border-red-400'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><CalendarClock size={14}/> Expirations (J-7)</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>{usersList.filter(u => u.expire?.includes('J-')).length || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <p className="font-black text-xl mb-1 uppercase tracking-tight italic">{u.full_name}</p>
                        <p className="text-xs font-bold text-zinc-400 mb-4 flex items-center gap-1"><Mail size={12}/> {u.contact}</p>
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

            {/* ================= 5. PARTENAIRES (APPROBATION ENRICHIE) ================= */}
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
                               <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase italic`}>{partner.full_name}</h4>
                               <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{partner.activity}</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-500 mb-4 flex gap-4">
                               <span>📞 {partner.contact}</span> <span>📍 {partner.city || "Non précisé"}</span>
                            </p>
                            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                 <p className="font-black text-black mb-1 uppercase text-[10px]">Objectif Anti-Touriste :</p>
                                 <p className="font-medium text-zinc-600 italic">"{partner.objective || "Non précisé"}"</p>
                               </div>
                               <div>
                                 <p className="font-black text-black mb-1 uppercase text-[10px]">YouTube / Réseaux :</p>
                                 <p className="font-bold text-blue-600 truncate">{partner.youtube_link || partner.prospection || "Non précisé"}</p>
                               </div>
                            </div>
                         </div>
                         <div className="flex flex-col gap-3 w-full md:w-auto">
                            {partner.status === 'En attente' ? (
                               <button onClick={() => handleApprovePartner(partner)} className="bg-black text-[#39FF14] px-8 py-4 rounded-xl text-xs font-black uppercase hover:scale-105 transition shadow-xl">Activer & WA</button>
                            ) : (
                               <span className="text-green-700 bg-green-50 px-6 py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 border border-green-200"><ShieldCheck size={16}/> Compte Actif</span>
                            )}
                         </div>
                      </div>
                   ))}
                 </div>
              </div>
            )}

            {/* MARKETING */}
            {activeTab === 'marketing' && !selectedSaaS && (
              <div className="space-y-8 animate-in fade-in">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200 mb-8">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter`}>Articles & Ciblage (Blog)</h3>
                   <div className="flex gap-4">
                     <button onClick={generateArticleAI} disabled={isGenerating} className="bg-black text-[#39FF14] px-6 py-4 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition flex items-center gap-2">
                        {isGenerating ? "Génération..." : <><Sparkles size={16}/> Auto-suggestion IA</>}
                     </button>
                   </div>
                </div>
                <div className="grid gap-6">
                   {articlesList.map(article => (
                      <div key={article.id} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group">
                         <div className="flex-1">
                            <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase tracking-tighter mb-2 group-hover:text-[#39FF14] transition`}>{article.title}</h4>
                            <p className="text-sm font-medium text-zinc-500 line-clamp-2">{article.content}</p>
                         </div>
                         <button onClick={() => { setArticleForm(article); setShowArticleModal(article); }} className="px-6 py-3 bg-zinc-100 text-black font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-black hover:text-white transition">Éditer</button>
                      </div>
                   ))}
                </div>
              </div>
            )}

          </div>

          <footer className="mt-8 pt-6 border-t border-zinc-200 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
             <p>OnyxOps Admin Hub © 2026</p>
             <p>Connexion Sécurisée - Dakar</p>
          </footer>
        </div>
      </main>

      {/* ================= MODALES ================= */}
      
      {/* SCANNER IA (Résultats non cliquables) */}
      {showScannerModal && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
             <button onClick={() => setShowScannerModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
             <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 tracking-tighter flex items-center gap-2`}><Sparkles className="text-[#39FF14]"/> Rapport IA CRM</h2>
             <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">L'IA a scanné votre base et trouvé 3 opportunités.</p>
             <div className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex justify-between items-center cursor-default">
                    <div>
                       <p className="font-black uppercase text-sm">Boutique Chez Fatou</p>
                       <p className="text-xs text-zinc-500 font-medium">L'essai Onyx Vente expire dans 24h. Fort usage du catalogue.</p>
                    </div>
                    <span className="text-[10px] font-black uppercase text-zinc-400">À traiter</span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex justify-between items-center cursor-default">
                    <div>
                       <p className="font-black uppercase text-sm">Restaurant Le Dakar</p>
                       <p className="text-xs text-zinc-500 font-medium">Utilise Onyx Menu depuis 6 mois. N'a pas de logiciel RH.</p>
                    </div>
                    <span className="text-[10px] font-black uppercase text-zinc-400">À traiter</span>
                </div>
             </div>
           </div>
         </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative text-center animate-in zoom-in">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <div className="w-20 h-20 rounded-full bg-zinc-200 mx-auto mb-4 flex items-center justify-center font-black text-2xl italic">AD</div>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-1`}>{user?.full_name}</h2>
            <div className="space-y-4 text-left mt-8">
               <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} placeholder="Nouveau mot de passe" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
               <button onClick={handleUpdatePassword} className="w-full py-3 bg-black text-[#39FF14] font-black text-xs uppercase rounded-xl shadow-xl">Mettre à jour</button>
            </div>
          </div>
        </div>
      )}

      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowAddClientModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 tracking-tighter`}>{newClient.id ? 'Modifier Contact' : 'Ajouter Contact'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nom Complet" value={newClient.full_name} onChange={e => setNewClient({...newClient, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <input type="text" placeholder="WhatsApp" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <select value={newClient.saas} onChange={e => setNewClient({...newClient, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
                 {ECOSYSTEM_SAAS.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
              </select>
            </div>
            <button onClick={saveClient} className="w-full py-4 bg-[#39FF14] text-black font-black text-xs uppercase rounded-xl mt-8 shadow-xl hover:scale-105 transition">Enregistrer</button>
          </div>
        </div>
      )}

      {showArticleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowArticleModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 tracking-tighter`}>Édition Article IA</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Titre" value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <textarea placeholder="Contenu..." rows={6} value={articleForm.content} onChange={e => setArticleForm({...articleForm, content: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium outline-none focus:border-black resize-none" />
            </div>
            <button onClick={saveArticle} className="w-full py-4 bg-black text-[#39FF14] font-black text-xs uppercase rounded-xl mt-8 shadow-xl">Publier</button>
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
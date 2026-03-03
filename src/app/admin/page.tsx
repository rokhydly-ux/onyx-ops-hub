"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Users, Wallet, LayoutDashboard, LogOut, TrendingUp, CheckCircle, 
  MessageSquare, FileText, UserPlus, Download, CheckSquare, AlertCircle, 
  X, Bell, Megaphone, Send, Edit3, Trash2, Home, Search, Target, Globe, Box, Plus, Sparkles,
  BarChart3, CreditCard, CalendarClock, PhoneCall
} from "lucide-react";

// POLICES EXACTEMENT COMME LE SITE PUBLIC POUR LE DESIGN "EMPIRE/TERMINAL"
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

export default function AdminBentoTerminal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // DONNÉES
  const [usersList, setUsersList] = useState<any[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  // FILTRE PÉRIODE CA
  const [caPeriodFilter, setCaPeriodFilter] = useState<"month" | "lastMonth" | "quarter">("month");

  // MODALES
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState<any>(null); 
  const [showProfileModal, setShowProfileModal] = useState(false);

  // FORMULAIRES
  const [newClient, setNewClient] = useState({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)", avatar_url: "" });
  const [articleForm, setArticleForm] = useState({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" });
  const [isGenerating, setIsGenerating] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ full_name: "", avatar_url: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const ecosystemData = [
    { name: "Onyx Vente", price: "15.000 F", type: "Vente Flash", users: 142 },
    { name: "Onyx Tiak", price: "10.000 F", type: "Logistique", users: 89 },
    { name: "Onyx Stock", price: "15.000 F", type: "Inventaire", users: 112 },
    { name: "Onyx Menu", price: "12.500 F", type: "Restauration", users: 45 },
    { name: "Onyx Booking", price: "15.000 F", type: "Réservation", users: 28 },
    { name: "Onyx Staff", price: "20.000 F", type: "RH & Paie", users: 34 },
  ];

  useEffect(() => {
    fetchInitData();
  }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser || { full_name: "Admin Demo", email: "admin@onyx.com", role: "admin", avatar_url: "" });

    const [clientsRes, articlesRes, leadsRes, partnersRes] = await Promise.all([
      supabase.from('clients').select('*').order('created_at', { ascending: false }),
      supabase.from('articles').select('*').order('created_at', { ascending: false }),
      supabase.from('leads').select('*').order('created_at', { ascending: false }),
      supabase.from('partners').select('*').order('created_at', { ascending: false })
    ]);

    if (clientsRes.data) setUsersList(clientsRes.data);
    if (articlesRes.data) setArticlesList(articlesRes.data);
    if (leadsRes.data) setLeadsList(leadsRes.data);
    if (partnersRes.data) setPartnersList(partnersRes.data);

    const subsRes = await supabase.from('subscriptions').select('*').order('end_date', { ascending: true }).limit(50);
    const txRes = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(100);
    if (subsRes.data) setSubscriptionsList(subsRes.data);
    if (txRes.data) setTransactionsList(txRes.data);

    setLoading(false);
  }

  // Données dérivées pour le dashboard
  const caCurrent = 3850000;
  const caLastMonth = 3420000;
  const caComparisonPercent = caLastMonth ? Math.round(((caCurrent - caLastMonth) / caLastMonth) * 100) : 0;
  const histogramSales = [1200, 1900, 1500, 2100, 2400, 1800, 2200];
  const top3Products = [
    { name: "Pack Trio", count: 89, revenue: 1557500 },
    { name: "Onyx Solo", count: 142, revenue: 1065000 },
    { name: "Pack Full", count: 45, revenue: 1350000 }
  ];
  const expiringSoon = subscriptionsList.length > 0
    ? subscriptionsList.filter((s: any) => {
        const end = s.end_date ? new Date(s.end_date) : null;
        if (!end) return false;
        const daysLeft = Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysLeft <= 30 && daysLeft >= 0;
      }).slice(0, 10)
    : [];
  const contactsToRelance = usersList.filter((u: any) => u.role === "prospect" || (u.expire && String(u.expire).includes("J-"))).slice(0, 10);

  const handleUpdatePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert("Les deux mots de passe ne correspondent pas.");
      return;
    }
    if (passwordForm.new.length < 6) {
      alert("Le mot de passe doit faire au moins 6 caractères.");
      return;
    }
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    setIsUpdatingPassword(false);
    if (error) alert("Erreur: " + error.message);
    else {
      alert("Mot de passe mis à jour.");
      setPasswordForm({ current: "", new: "", confirm: "" });
    }
  };

  const handleSaveProfile = async () => {
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: profileEdit.full_name, avatar_url: profileEdit.avatar_url } });
    if (error) alert("Erreur: " + error.message);
    else {
      if (data?.user) setUser(data.user);
      alert("Profil mis à jour.");
    }
  };

  // SAUVEGARDE DB : ne jamais envoyer id vide (UUID invalide) à Postgres
  const saveClient = async () => {
    if(!newClient.full_name) return;
    const avatar_url = newClient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(newClient.full_name)}`;
    const clientData = { ...newClient, avatar_url };

    if (newClient.id && newClient.id.trim() !== "") {
      const { error } = await supabase.from('clients').update(clientData).eq('id', newClient.id);
      if(error) alert("Erreur Update Client: " + error.message);
      else setUsersList(usersList.map(u => u.id === newClient.id ? { ...u, ...clientData } : u));
    } else {
      const { id: _id, ...insertData } = clientData;
      const { data, error } = await supabase.from('clients').insert(insertData).select().single();
      if(error) alert("Erreur Création Client (Vérifiez la RLS de Supabase) : " + error.message);
      else if(data) setUsersList([data, ...usersList]);
    }
    setShowAddClientModal(false);
  };

  const saveArticle = async () => {
    if (!articleForm.title) return;
    if (articleForm.id && articleForm.id.trim() !== "") {
      const { error } = await supabase.from('articles').update(articleForm).eq('id', articleForm.id);
      if(error) alert("Erreur Update Article: " + error.message);
      else setArticlesList(articlesList.map(a => a.id === articleForm.id ? { ...a, ...articleForm } : a));
    } else {
      const { id: _id, ...insertData } = articleForm;
      const { data, error } = await supabase.from('articles').insert(insertData).select().single();
      if(error) alert("Erreur Création Article (Vérifiez la RLS de Supabase) : " + error.message);
      else if(data) setArticlesList([data, ...articlesList]);
    }
    setShowArticleModal(null);
  };

  const approvePartner = async (id: string) => {
     const { error } = await supabase.from('partners').update({ status: 'Approuvé' }).eq('id', id);
     if(error) alert(error.message);
     else setPartnersList(partnersList.map(p => p.id === id ? {...p, status: 'Approuvé'} : p));
  };

  // IA GENERATION SIMULÉE
  const generateArticleAI = () => {
     setIsGenerating(true);
     setTimeout(() => {
        setArticleForm({
           id: "",
           title: "Comment le Digital transforme les Restaurants à Dakar en 2026",
           category: "Restauration",
           pack_focus: "Pack Full",
           content: "L'intelligence artificielle et la centralisation des commandes permettent aujourd'hui aux restaurateurs de réduire leurs pertes de 30%..."
        });
        setIsGenerating(false);
        setShowArticleModal({});
     }, 1500);
  };

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
            <NavBtn icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavBtn icon={<MessageSquare size={20}/>} label="Inbox & Leads" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
            <NavBtn icon={<Users size={20}/>} label="Membres & CRM" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <NavBtn icon={<Wallet size={20}/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
            <NavBtn icon={<Target size={20}/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
            <NavBtn icon={<Box size={20}/>} label="Écosystème SaaS" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-8 mb-4 ml-2">Marketing & Ventes</p>
            <NavBtn icon={<Globe size={20}/>} label="Marketing & Blog" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER ADMIN AVEC PROFIL 'AD' */}
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-8 flex justify-between items-center z-10 shadow-sm">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>{activeTab === 'overview' ? 'Terminal' : activeTab}</h1>
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
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in">
                <div className="text-center mb-10">
                   <div className={`${spaceGrotesk.className} inline-flex items-center gap-2 bg-black text-[#39FF14] px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.2em] mb-4 uppercase`}>Onyx Intelligence V3.5</div>
                   <h2 className={`${spaceGrotesk.className} text-7xl md:text-8xl font-black uppercase tracking-tighter italic`}>EMPIRE</h2>
                </div>

                {/* Ligne 1 : CA (cliquable + filtre + comparaison), Leads, Articles */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div onClick={() => setActiveTab('finances')} className="p-8 rounded-[3rem] border border-zinc-200 bg-black text-white shadow-2xl cursor-pointer hover:scale-105 transition-transform">
                    <div className="flex justify-between items-start mb-2">
                       <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14]">Chiffre d&apos;affaires</p>
                       <select
                         value={caPeriodFilter}
                         onChange={(e) => { e.stopPropagation(); setCaPeriodFilter(e.target.value as any); }}
                         onClick={(e) => e.stopPropagation()}
                         className="bg-zinc-800 text-white text-[10px] font-bold uppercase px-2 py-1 rounded border border-zinc-600"
                       >
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
                    <p className="text-[10px] font-bold uppercase text-zinc-500 mt-1">Revenu {caPeriodFilter === "month" ? "mensuel" : caPeriodFilter === "lastMonth" ? "mois dernier" : "trimestre"}</p>
                    <p className="text-[10px] font-black uppercase text-[#39FF14] mt-2">+{caComparisonPercent}% vs mois dernier</p>
                  </div>
                  <div onClick={() => setActiveTab('chat')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-black transition-colors flex flex-col justify-center text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Essais Actifs / Leads</p>
                     <p className={`${spaceGrotesk.className} text-6xl font-black tracking-tighter italic text-black`}>{leadsList.length}</p>
                     <p className="text-xs font-bold text-zinc-500 mt-2">Prêts à convertir</p>
                  </div>
                  <div onClick={() => setActiveTab('marketing')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-[#39FF14] transition-colors flex flex-col justify-center text-center">
                     <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Articles Publiés</p>
                     <p className={`${spaceGrotesk.className} text-6xl font-black tracking-tighter italic text-black`}>{articlesList.length}</p>
                     <p className="text-xs font-bold text-zinc-500 mt-2">Impact Social / SEO</p>
                  </div>
                </div>

                {/* Histogramme des ventes */}
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

                {/* Top 3 produits (cliquable) + Liste des transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div onClick={() => setActiveTab('finances')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-[#39FF14] transition-colors">
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg tracking-tighter mb-4 flex items-center gap-2`}><TrendingUp size={20} className="text-[#39FF14]" /> Top 3 produits vendus</h3>
                    <ul className="space-y-3">
                      {top3Products.map((p, i) => (
                        <li key={i} className="flex justify-between items-center text-sm font-bold">
                          <span className="text-zinc-600">#{i + 1} {p.name}</span>
                          <span className="text-black">{p.count} ventes</span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-[10px] font-black uppercase text-zinc-400 mt-4">Cliquez pour voir les détails</p>
                  </div>
                  <div className="lg:col-span-2 bg-white rounded-[3rem] border border-zinc-200 shadow-sm overflow-hidden">
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg tracking-tighter p-6 pb-0 flex items-center gap-2`}><CreditCard size={20} className="text-[#39FF14]" /> Dernières transactions</h3>
                    <div className="overflow-y-auto max-h-64 p-6">
                      {transactionsList.length === 0 ? (
                        <p className="text-zinc-400 text-sm font-bold">Aucune transaction. Connectez la table &quot;transactions&quot; dans Supabase.</p>
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

                {/* Cartes Abonnements qui expirent + Contacts à relancer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div onClick={() => setActiveTab('finances')} className="bg-white p-8 rounded-[3rem] border-2 border-amber-200 shadow-sm cursor-pointer hover:border-amber-400 transition-colors">
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg tracking-tighter mb-4 flex items-center gap-2`}><CalendarClock size={20} className="text-amber-500" /> Abonnements qui expirent bientôt</h3>
                    {expiringSoon.length === 0 ? (
                      <p className="text-zinc-400 text-sm font-bold">Aucun abonnement à renouveler dans les 30 prochains jours.</p>
                    ) : (
                      <ul className="space-y-2">
                        {expiringSoon.slice(0, 5).map((s: any) => (
                          <li key={s.id} className="text-sm font-bold flex justify-between">
                            <span>{s.plan_name || "Abonnement"}</span>
                            <span className="text-amber-600">{s.end_date ? new Date(s.end_date).toLocaleDateString("fr-FR") : "-"}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-[10px] font-black uppercase text-zinc-400 mt-4">Cliquez pour gérer les abonnements</p>
                  </div>
                  <div onClick={() => setActiveTab('users')} className="bg-white p-8 rounded-[3rem] border-2 border-blue-200 shadow-sm cursor-pointer hover:border-blue-400 transition-colors">
                    <h3 className={`${spaceGrotesk.className} font-black uppercase text-lg tracking-tighter mb-4 flex items-center gap-2`}><PhoneCall size={20} className="text-blue-500" /> Contacts à relancer</h3>
                    {contactsToRelance.length === 0 ? (
                      <p className="text-zinc-400 text-sm font-bold">Aucun contact à relancer.</p>
                    ) : (
                      <ul className="space-y-2">
                        {contactsToRelance.slice(0, 5).map((u: any) => (
                          <li key={u.id} className="text-sm font-bold flex justify-between">
                            <span>{u.full_name}</span>
                            <span className="text-blue-600 text-[10px]">{u.expire || u.role}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-[10px] font-black uppercase text-zinc-400 mt-4">Cliquez pour ouvrir le CRM</p>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 2. CLIENTS / CRM ================= */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200 mb-8">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter`}>CRM & Base Clients</h3>
                   <button onClick={() => { setNewClient({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)", avatar_url: "" }); setShowAddClientModal(true); }} className="bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition flex items-center gap-2">
                      <UserPlus size={18}/> Ajouter Contact
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {usersList.map((u) => (
                    <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:border-black transition flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start mb-6">
                          <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.full_name}`} className="w-16 h-16 rounded-full object-cover border-2 border-zinc-100" alt="" />
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setNewClient(u); setShowAddClientModal(true); }} className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-black hover:text-white transition"><Edit3 size={16}/></button>
                          </div>
                        </div>
                        <p className="font-black text-xl mb-1 uppercase tracking-tight">{u.full_name}</p>
                        <p className="text-xs font-bold text-zinc-400 mb-6">{u.contact}</p>
                        
                        <div className="bg-zinc-50 p-4 rounded-2xl mb-4 border border-zinc-100">
                          <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black uppercase text-zinc-500">SaaS Actif</span><span className="text-[10px] font-black">{u.saas}</span></div>
                          <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-zinc-500">Expiration</span><span className={`text-[10px] font-black ${u.expire?.includes('Expire') ? 'text-red-500' : 'text-[#39FF14]'}`}>{u.expire}</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= 4. MARKETING / BLOG (AVEC IA) ================= */}
            {activeTab === 'marketing' && (
              <div className="space-y-6 animate-in fade-in">
                 <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200 mb-8">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter`}>Marketing & Blog</h3>
                   <div className="flex gap-4">
                     <button onClick={generateArticleAI} disabled={isGenerating} className="bg-black text-[#39FF14] px-6 py-4 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition flex items-center gap-2">
                        {isGenerating ? "Génération..." : <><Sparkles size={16}/> Auto-suggestion IA</>}
                     </button>
                     <button onClick={() => { setArticleForm({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" }); setShowArticleModal({}); }} className="bg-white border-2 border-black text-black px-6 py-4 rounded-xl font-black text-xs uppercase hover:bg-black hover:text-[#39FF14] transition">
                        Rédiger un Article
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
                               <span className="text-[10px] font-black uppercase bg-zinc-100 px-3 py-1.5 rounded-md">{article.pack_focus || article.pack_focus}</span>
                            </div>
                            <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase tracking-tighter mb-2 group-hover:text-[#39FF14] transition`}>{article.title}</h4>
                            <p className="text-sm font-medium text-zinc-500 line-clamp-2">{article.content}</p>
                         </div>
                         <div className="flex flex-col gap-3 w-full md:w-auto">
                            <button onClick={() => alert(`Article envoyé aux prospects (Cible : ${article.category}) via Email et WhatsApp.`)} className="w-full flex justify-center items-center gap-2 px-6 py-3 bg-[#39FF14]/10 text-green-700 font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-[#39FF14] hover:text-black transition">
                               <Send size={14}/> Envoyer aux Cibles
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
            {activeTab === 'partners' && (
              <div className="space-y-6 animate-in fade-in">
                 <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200 mb-8">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter`}>Réseau Partenaires</h3>
                 </div>
                 
                 <div className="grid gap-4">
                    {partnersList.length === 0 && <p className="text-zinc-500 font-bold uppercase text-sm">Aucun partenaire enregistré.</p>}
                    {partnersList.map(partner => (
                       <div key={partner.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 flex justify-between items-center">
                          <div>
                             <p className="font-black text-lg uppercase">{partner.full_name}</p>
                             <p className="text-xs font-bold text-zinc-500">{partner.contact} • {partner.city} • {partner.activity}</p>
                          </div>
                          <div>
                             {partner.status === 'En attente' ? (
                                <button onClick={() => approvePartner(partner.id)} className="bg-black text-[#39FF14] px-6 py-2 rounded-xl text-xs font-black uppercase hover:scale-105 transition shadow-lg">Approuver le compte</button>
                             ) : (
                                <span className="text-[#39FF14] font-black uppercase text-xs flex items-center gap-1"><CheckCircle size={16}/> Actif</span>
                             )}
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
            )}

            {/* ================= 6. INBOX / LEADS ================= */}
            {activeTab === 'chat' && (
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
            
            {/* Autres vues (Finances, Ecosystème) - Structure conservée similaire */}
            {(activeTab === 'finances' || activeTab === 'ecosystem') && (
               <div className="flex items-center justify-center h-[60vh] text-zinc-400 font-black uppercase text-2xl animate-pulse">
                  Section {activeTab} en synchronisation Supabase...
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

      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowAddClientModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 tracking-tighter`}>{newClient.id ? 'Modifier Contact' : 'Ajouter Contact'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nom Complet" value={newClient.full_name} onChange={e => setNewClient({...newClient, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <input type="text" placeholder="Numéro WhatsApp ou Email" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <select value={newClient.saas} onChange={e => setNewClient({...newClient, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
                 {ecosystemData.map(e => <option key={e.name} value={e.name}>SaaS : {e.name}</option>)}
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
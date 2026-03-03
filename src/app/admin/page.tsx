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

// --- HARMONISATION DES PRIX (8.900 F / 5.900 F) ---
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
  
  const [usersList, setUsersList] = useState<any[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [subscriptionsList, setSubscriptionsList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  const [caPeriodFilter, setCaPeriodFilter] = useState<"month" | "lastMonth" | "quarter">("month");
  const [crmFilter, setCrmFilter] = useState("all");
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);

  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState<any>(null); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const [newClient, setNewClient] = useState({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)", is_partner: false, avatar_url: "" });
  const [articleForm, setArticleForm] = useState({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" });
  const [profileEdit, setProfileEdit] = useState({ full_name: "", avatar_url: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => { fetchInitData(); }, []);

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
    } catch (e) { console.error("Erreur", e); }
    setLoading(false);
  }

  const caCurrent = 3850000;
  const caComparisonPercent = 12;
  const histogramSales = [1200, 1900, 1500, 2100, 2400, 1800, 2200];
  const top3Products = [
    { name: "Pack Trio", count: 89, revenue: 1557500 },
    { name: "Onyx Solo", count: 142, revenue: 1065000 },
    { name: "Pack Full", count: 45, revenue: 1350000 }
  ];
  const expiringSoon = subscriptionsList.slice(0, 10);
  const contactsToRelance = usersList.slice(0, 10);

  const handleUpdatePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) return alert("Erreur de confirmation.");
    setIsUpdatingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new });
    setIsUpdatingPassword(false);
    if (!error) { alert("Mot de passe mis à jour."); setPasswordForm({ current: "", new: "", confirm: "" }); }
  };

  const handleSaveProfile = async () => {
    const { data, error } = await supabase.auth.updateUser({ data: { full_name: profileEdit.full_name, avatar_url: profileEdit.avatar_url } });
    if (!error && data?.user) { setUser(data.user); alert("Profil mis à jour."); setShowProfileModal(false); }
  };

  // ================= CORRECTIF SUPABASE ID =================
  const saveClient = async () => {
    if(!newClient.full_name) return;
    const clientData = { ...newClient, avatar_url: newClient.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(newClient.full_name)}` };
    if (newClient.id) {
      const { error } = await supabase.from('clients').update(clientData).eq('id', newClient.id);
      if(!error) setUsersList(usersList.map(u => u.id === newClient.id ? { ...u, ...clientData } : u));
    } else {
      const { id, ...insertData } = clientData;
      const { data, error } = await supabase.from('clients').insert({ ...insertData, id: crypto.randomUUID() }).select().single();
      if(!error && data) setUsersList([data, ...usersList]);
    }
    setShowAddClientModal(false);
  };

  const saveArticle = async () => {
    if (!articleForm.title) return;
    if (articleForm.id) {
      const { error } = await supabase.from('articles').update(articleForm).eq('id', articleForm.id);
      if(!error) setArticlesList(articlesList.map(a => a.id === articleForm.id ? { ...a, ...articleForm } : a));
    } else {
      const { id, ...insertData } = articleForm;
      const { data, error } = await supabase.from('articles').insert({ ...insertData, id: crypto.randomUUID() }).select().single();
      if(!error && data) setArticlesList([data, ...articlesList]);
    }
    setShowArticleModal(null);
  };

  // ================= VALIDATION PARTENAIRE (WHATSAPP) =================
  const approvePartner = async (partner: any) => {
    const { error } = await supabase.from('partners').update({ status: 'Approuvé' }).eq('id', partner.id);
    if(error) return alert(error.message);
    const pwd = Math.random().toString(36).slice(-8).toUpperCase() + "!";
    const message = `Bonjour ${partner.full_name} ! Votre compte Partenaire OnyxOps est désormais ACTIF. ✅\n\nIdentifiants de connexion :\nLien : https://onyxops.com/login\nContact : ${partner.contact}\nMot de passe : ${pwd}\n\nAccédez à votre Hub pour gérer vos commissions et votre lien parrain. Bienvenue !`;
    setPartnersList(partnersList.map(p => p.id === partner.id ? {...p, status: 'Approuvé'} : p));
    window.open(`https://wa.me/${partner.contact.replace(/\s/g, '')}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const generateArticleAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setArticleForm({ id: "", title: "Comment le Digital transforme Dakar en 2026", category: "Restauration", pack_focus: "Pack Full", content: "L'IA réduit les pertes..." });
      setIsGenerating(false);
      setShowArticleModal({});
    }, 1500);
  };

  const generatePassword = (client: any) => {
    const pwd = Math.random().toString(36).slice(-8).toUpperCase() + "!";
    alert(`Mot de passe : ${pwd}`);
  };

  const convertToPartner = async (client: any) => {
    if(confirm(`Convertir ${client.full_name} en Partenaire ?`)) {
       const { error } = await supabase.from('clients').update({ is_partner: true }).eq('id', client.id);
       if(!error) setUsersList(usersList.map(u => u.id === client.id ? { ...u, is_partner: true } : u));
    }
  };

  const filteredUsers = usersList.filter(u => {
    if (crmFilter === 'all') return true;
    if (crmFilter === 'top') return u.is_partner;
    if (crmFilter === 'expire') return u.expire?.includes('J-');
    return true;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white font-black text-3xl">Lancement...</div>;

  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FA] text-black flex overflow-hidden`}>
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between hidden lg:flex shadow-sm z-10">
        <div>
          <div className="mb-12 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <span className={`${spaceGrotesk.className} font-black text-4xl tracking-tighter uppercase`}>ONYX<span className="text-[#39FF14]">OPS</span></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 ml-2">Menu Principal</p>
          <div className="space-y-2">
            <NavBtn icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavBtn icon={<Users size={20}/>} label="Membres & CRM" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <NavBtn icon={<Box size={20}/>} label="Écosystème" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
            <NavBtn icon={<Wallet size={20}/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
            <NavBtn icon={<Target size={20}/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-8 mb-4 ml-2">Marketing</p>
            <NavBtn icon={<Globe size={20}/>} label="Marketing & Blog" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-zinc-200 px-8 flex justify-between items-center z-10 shadow-sm">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>{activeTab}</h1>
          <div className="flex items-center gap-6">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors"><Home size={16}/> Voir site</button>
            <div onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 cursor-pointer p-1.5 pr-4 bg-zinc-50 rounded-full border border-zinc-200">
              <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-black text-sm italic">AD</div>
              <p className="text-[10px] font-black uppercase">Admin Hub</p>
            </div>
            <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="text-zinc-400 hover:text-red-500"><LogOut size={20}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth flex flex-col">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[3rem] border border-zinc-200 bg-black text-white shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-2">CA Mensuel</p>
                    <p className={`${spaceGrotesk.className} text-5xl font-black italic tracking-tighter`}>3.850.000 F</p>
                </div>
                <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col justify-center text-center">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Leads / Essais</p>
                    <p className={`${spaceGrotesk.className} text-5xl font-black text-black italic tracking-tighter`}>{leadsList.length || 142}</p>
                </div>
                <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col justify-center text-center">
                    <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Articles IA</p>
                    <p className={`${spaceGrotesk.className} text-5xl font-black text-black italic tracking-tighter`}>{articlesList.length}</p>
                </div>
              </div>

              {/* HISTOGRAMME NON CLIQUABLE */}
              <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-6 h-6 text-[#39FF14]" />
                  <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl tracking-tighter`}>Performances Écosystème (7j)</h3>
                </div>
                <div className="flex items-end justify-between gap-2 h-44 cursor-default">
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
            </div>
          )}

          {activeTab === 'users' && (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:border-black transition flex flex-col justify-between group relative overflow-hidden">
                    {u.is_partner && <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl">Partenaire</div>}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.full_name}`} className="w-14 h-14 rounded-full border-2 border-zinc-100" alt="" />
                        <button onClick={() => generatePassword(u)} className="text-[9px] font-black uppercase tracking-widest bg-zinc-100 px-3 py-1.5 rounded-lg hover:bg-black hover:text-white transition">Accès</button>
                      </div>
                      <p className="font-black text-xl mb-1 uppercase italic tracking-tighter">{u.full_name}</p>
                      <p className="text-xs font-bold text-zinc-400 mb-4">{u.contact}</p>
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                        <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black uppercase text-zinc-500">SaaS Actif</span><span className="text-[10px] font-black">{u.saas}</span></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'ecosystem' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
               {ECOSYSTEM_SAAS.map(saas => (
                  <div key={saas.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:border-black transition cursor-pointer group">
                     <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${saas.color}`}>{saas.icon}</div>
                     <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase mb-1`}>{saas.name}</h4>
                     <p className="text-xs font-bold text-zinc-500 mb-4">{saas.type}</p>
                     <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                        <span className="text-[10px] font-black text-zinc-400 uppercase">{saas.users} Clients</span>
                        <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black">{saas.price}</span>
                     </div>
                  </div>
               ))}
            </div>
          )}

          {/* PARTENAIRES AVEC CHAMPS ENRICHIS */}
          {activeTab === 'partners' && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter mb-8`}>Validation Ambassadeurs</h3>
              <div className="grid gap-6">
                {partnersList.length === 0 && <p className="text-zinc-500 font-bold uppercase italic text-sm">Aucune demande.</p>}
                {partnersList.map(partner => (
                  <div key={partner.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase italic`}>{partner.full_name}</h4>
                        <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{partner.activity}</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-400 mb-4 italic">📞 {partner.contact} | 📍 {partner.city}</p>
                      
                      {/* CHAMPS ENRICHIS : Motivation et YouTube */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                           <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Motivation (Anti-Touriste)</p>
                           <p className="text-xs font-medium text-zinc-700">{partner.objective || "Non précisé"}</p>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                           <p className="text-[10px] font-black uppercase text-zinc-400 mb-1">Stratégie Prospection / YouTube</p>
                           <p className="text-xs font-bold text-blue-600 truncate">{partner.youtube_link || partner.prospection || "Non précisé"}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      {partner.status === 'En attente' ? (
                        <button onClick={() => approvePartner(partner)} className="bg-black text-[#39FF14] px-8 py-4 rounded-xl text-xs font-black uppercase hover:scale-105 transition shadow-xl">Activer & WA</button>
                      ) : (
                        <span className="text-green-700 bg-green-50 px-6 py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 border border-green-200"><ShieldCheck size={16}/> Compte Actif</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <footer className="mt-8 pt-6 border-t border-zinc-200 flex justify-between items-center px-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white">
          <p>OnyxOps Admin Hub © 2026</p>
          <p>Connexion Sécurisée - Dakar</p>
        </footer>
      </main>

      {/* MODALE SCANNER IA (NON CLIQUABLE) */}
      {showScannerModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
              <button onClick={() => setShowScannerModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full"><X size={16}/></button>
              <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 tracking-tighter flex items-center gap-2`}><Sparkles className="text-[#39FF14]"/> Rapport IA CRM</h2>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">Opportunités détectées par l'Intelligence Onyx.</p>
              <div className="space-y-4">
                 {[1,2,3].map(i => (
                    <div key={i} className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex justify-between items-center cursor-default opacity-80">
                       <div>
                          <p className="font-black uppercase text-sm">Opportunité #{i}</p>
                          <p className="text-xs text-zinc-500">Usage intensif détecté sur Onyx Vente.</p>
                       </div>
                       <span className="bg-zinc-200 text-zinc-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">En attente</span>
                    </div>
                 ))}
              </div>
            </div>
          </div>
      )}

      {/* AUTRES MODALES (PROFIL / CLIENT / ARTICLE) */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowAddClientModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full"><X size={16}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 tracking-tighter`}>{newClient.id ? 'Modifier Contact' : 'Ajouter Contact'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nom Complet" value={newClient.full_name} onChange={e => setNewClient({...newClient, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <input type="text" placeholder="WhatsApp / Email" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <select value={newClient.saas} onChange={e => setNewClient({...newClient, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
                 {ECOSYSTEM_SAAS.map(e => <option key={e.name} value={e.name}>{e.name}</option>)}
              </select>
            </div>
            <button onClick={saveClient} className="w-full py-4 bg-[#39FF14] text-black font-black text-xs uppercase rounded-xl mt-8 shadow-xl hover:scale-105 transition">Enregistrer</button>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in text-center">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full"><X size={16}/></button>
            <div className="w-20 h-20 rounded-full bg-zinc-100 mx-auto mb-4 flex items-center justify-center font-black text-2xl italic border-2 border-zinc-200">AD</div>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8`}>Réglages Admin</h2>
            <div className="space-y-4">
               <input type="password" value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})} placeholder="Nouveau mot de passe" className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
               <button onClick={handleUpdatePassword} disabled={isUpdatingPassword} className="w-full py-3 bg-black text-[#39FF14] font-black text-xs uppercase rounded-xl shadow-xl">Mettre à jour</button>
            </div>
          </div>
        </div>
      )}

      {showArticleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowArticleModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full"><X size={16}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 tracking-tighter`}>Édition Blog IA</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Titre" value={articleForm.title} onChange={e => setArticleForm({...articleForm, title: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <textarea placeholder="Contenu..." rows={6} value={articleForm.content} onChange={e => setArticleForm({...articleForm, content: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium resize-none" />
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
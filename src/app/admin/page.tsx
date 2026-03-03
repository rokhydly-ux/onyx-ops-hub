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

// --- ALIGNEMENT DES 9 SAAS & PRIX DEMANDÉS ---
const ECOSYSTEM_SAAS = [
  { id: "vente", name: "Onyx Vente", price: "8.900 F", type: "Social Selling", users: 142, icon: "🛍️", color: "bg-blue-100 text-blue-600" },
  { id: "tiak", name: "Onyx Tiak", price: "8.900 F", type: "Logistique", users: 89, icon: "🛵", color: "bg-orange-100 text-orange-600" },
  { id: "stock", name: "Onyx Stock", price: "8.900 F", type: "Inventaire", users: 112, icon: "📦", color: "bg-purple-100 text-purple-600" },
  { id: "booking", name: "Onyx Booking", price: "8.900 F", type: "Réservation", users: 28, icon: "📅", color: "bg-teal-100 text-teal-600" },
  { id: "menu", name: "Onyx Menu", price: "8.900 F", type: "Restauration", users: 45, icon: "🍔", color: "bg-red-100 text-red-600" },
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
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { fetchInitData(); }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser || { full_name: "Admin", email: "admin@onyx.com", role: "admin" });
    try {
      const [clientsRes, articlesRes, leadsRes, partnersRes, txRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50)
      ]);
      if (clientsRes.data) setUsersList(clientsRes.data);
      if (articlesRes.data) setArticlesList(articlesRes.data);
      if (leadsRes.data) setLeadsList(leadsRes.data);
      if (partnersRes.data) setPartnersList(partnersRes.data);
      if (txRes.data) setTransactionsList(txRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  const approvePartner = async (partner: any) => {
    const { error } = await supabase.from('partners').update({ status: 'Approuvé' }).eq('id', partner.id);
    if(error) return alert(error.message);
    
    // Génération mot de passe et préparation lien
    const pwd = Math.random().toString(36).slice(-8).toUpperCase() + "!";
    const loginUrl = "https://onyxops.com/login";
    const msg = `Félicitations ${partner.full_name} ! Votre compte partenaire OnyxOps est actif.\n\nAccès Dashboard : ${loginUrl}\nIdentifiant : ${partner.contact}\nMot de passe : ${pwd}\n\nUne fois connecté, vous aurez accès à votre lien parrain et vos commissions.`;
    
    setPartnersList(partnersList.map(p => p.id === partner.id ? {...p, status: 'Approuvé'} : p));
    window.open(`https://wa.me/${partner.contact.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const saveClient = async () => {
    if(!newClient.full_name) return;
    const { id, ...insertData } = newClient;
    if (id) {
      const { error } = await supabase.from('clients').update(insertData).eq('id', id);
      if(!error) setUsersList(usersList.map(u => u.id === id ? { ...u, ...insertData } : u));
    } else {
      const { data, error } = await supabase.from('clients').insert(insertData).select().single();
      if(!error && data) setUsersList([data, ...usersList]);
    }
    setShowAddClientModal(false);
  };

  const saveArticle = async () => {
    if (!articleForm.title) return;
    const { id, ...insertData } = articleForm;
    if (id) {
      const { error } = await supabase.from('articles').update(insertData).eq('id', id);
      if(!error) setArticlesList(articlesList.map(a => a.id === id ? { ...a, ...articleForm } : a));
    } else {
      const { data, error } = await supabase.from('articles').insert(insertData).select().single();
      if(!error && data) setArticlesList([data, ...articlesList]);
    }
    setShowArticleModal(null);
  };

  const filteredUsers = usersList.filter(u => {
    if (crmFilter === 'all') return true;
    if (crmFilter === 'top') return u.is_partner;
    if (crmFilter === 'expire') return u.expire?.includes('J-');
    return true;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white font-black text-3xl">Lancement du Terminal...</div>;

  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FA] text-black flex overflow-hidden`}>
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col hidden lg:flex shadow-sm z-10">
        <div className="mb-12 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <span className={`${spaceGrotesk.className} font-black text-4xl tracking-tighter uppercase`}>ONYX<span className="text-[#39FF14]">OPS</span></span>
        </div>
        <div className="space-y-2">
          <NavBtn icon={<LayoutDashboard size={20}/>} label="Empire" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavBtn icon={<Users size={20}/>} label="Membres CRM" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
          <NavBtn icon={<Box size={20}/>} label="9 SaaS" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
          <NavBtn icon={<Target size={20}/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
          <NavBtn icon={<Globe size={20}/>} label="Blog & Marketing" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-zinc-200 px-8 flex justify-between items-center z-10 shadow-sm">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>{activeTab}</h1>
          <div className="flex items-center gap-6">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors"><Home size={16}/> Voir Site</button>
            <div className="flex items-center gap-3 p-1.5 pr-4 bg-zinc-50 rounded-full border border-zinc-200">
               <div className="w-8 h-8 rounded-full bg-black text-[#39FF14] flex items-center justify-center font-black text-xs">AD</div>
               <p className="text-[10px] font-black uppercase">Admin Terminal</p>
            </div>
            <button onClick={() => supabase.auth.signOut()} className="text-zinc-400 hover:text-red-500"><LogOut size={20}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 rounded-[3rem] border border-zinc-200 bg-black text-white shadow-xl">
                  <p className="text-[10px] font-black uppercase text-[#39FF14] mb-2">CA Mensuel</p>
                  <p className={`${spaceGrotesk.className} text-5xl font-black italic tracking-tighter`}>3.850.000 F</p>
                </div>
                <div className="p-8 rounded-[3rem] border border-zinc-200 bg-white shadow-sm flex flex-col justify-center text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Leads Capturés</p>
                  <p className={`${spaceGrotesk.className} text-5xl font-black italic tracking-tighter`}>{leadsList.length}</p>
                </div>
                <div className="p-8 rounded-[3rem] border border-zinc-200 bg-white shadow-sm flex flex-col justify-center text-center">
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Partenaires</p>
                  <p className={`${spaceGrotesk.className} text-5xl font-black italic tracking-tighter`}>{partnersList.length}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ecosystem' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in">
               {ECOSYSTEM_SAAS.map(saas => (
                 <div key={saas.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:border-black transition cursor-pointer">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${saas.color}`}>{saas.icon}</div>
                    <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase`}>{saas.name}</h4>
                    <p className="text-xs font-bold text-zinc-400 mb-6">{saas.type}</p>
                    <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                      <span className="text-[10px] font-black uppercase text-zinc-400">{saas.users} Clients</span>
                      <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black">{saas.price}</span>
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'partners' && (
            <div className="space-y-6 animate-in fade-in">
              <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter`}>Candidatures Partenaires</h3>
              <div className="grid gap-6">
                {partnersList.length === 0 && <p className="text-zinc-500 font-bold italic">Aucune demande.</p>}
                {partnersList.map(p => (
                  <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm flex justify-between items-center group">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-black text-2xl uppercase tracking-tighter">{p.full_name}</h4>
                        <span className="bg-zinc-100 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{p.activity}</span>
                      </div>
                      <p className="text-xs font-bold text-zinc-500 mb-4 italic">WhatsApp : {p.contact} | Ville : {p.city}</p>
                      <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs text-zinc-700 space-y-2">
                        <p><strong>Motivation :</strong> {p.objective || "Non précisé"}</p>
                        <p><strong>Prospection :</strong> {p.prospection || "Non précisé"}</p>
                      </div>
                    </div>
                    <div className="ml-8">
                       {p.status === 'En attente' ? (
                         <button onClick={() => approvePartner(p)} className="bg-black text-[#39FF14] px-8 py-4 rounded-xl text-xs font-black uppercase hover:scale-105 transition shadow-lg">Activer Partenaire</button>
                       ) : (
                         <span className="text-green-600 bg-green-50 px-6 py-4 rounded-xl font-black uppercase text-xs flex items-center gap-2 border border-green-200"><ShieldCheck size={16}/> Compte Actif</span>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}>
      {icon}{label}
    </button>
  );
}
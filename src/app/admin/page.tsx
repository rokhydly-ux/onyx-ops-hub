"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Users, Wallet, LayoutDashboard, LogOut, TrendingUp, TrendingDown, CheckCircle, 
  MessageSquare, FileText, UserPlus, Zap, Calendar, Globe, Rocket, 
  ShieldCheck, CreditCard, Star, Search, Home, Edit3, Trash2, Send,
  Megaphone, Download, Filter, BarChart3, Handshake, AlertCircle, Award, Target, X, Bell
} from "lucide-react";

export default function AdminBentoTerminal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // ================= DONNÉES FICTIVES (MOCK DATA) =================

  const [usersList, setUsersList] = useState<any[]>([
    { id: '1', full_name: 'Aissatou Diallo', contact: 'aissa@mail.com', role: 'prospect', avatar_url: 'https://i.pravatar.cc/150?u=aissa', saas: 'Onyx Fit', expire: 'En essai (J-2)' },
    { id: '2', full_name: 'Mamadou Ndiaye', contact: '+221 77 123 45 67', role: 'client', avatar_url: 'https://i.pravatar.cc/150?u=mamadou', saas: 'Onyx Vente', expire: '12 Avril 2026' },
    { id: '3', full_name: 'Cheikh Fall', contact: 'cheikh@mail.com', role: 'prospect', avatar_url: 'https://i.pravatar.cc/150?u=cheikh', saas: 'Onyx Tontine', expire: 'En essai (J-6)' },
    { id: '4', full_name: 'Sophie Kane', contact: '+221 76 987 65 43', role: 'client', avatar_url: 'https://i.pravatar.cc/150?u=sophie', saas: 'Onyx Fit', expire: 'Expire dans 3 jours' },
    { id: '5', full_name: 'Ibrahima Sow', contact: 'ibra@mail.com', role: 'client', avatar_url: 'https://i.pravatar.cc/150?u=ibra', saas: 'SaaS Builder', expire: 'Expire demain' },
  ]);

  const ecosystemData = [
    { name: "Onyx Vente", price: "15.000 F/mois", type: "Vente Flash", icon: <CreditCard className="text-[#39FF14]"/> },
    { name: "Onyx Tiak", price: "10.000 F/mois", type: "Logistique", icon: <Truck/> },
    { name: "Onyx Stock", price: "15.000 F/mois", type: "Inventaire", icon: <Box/> },
    { name: "Onyx Menu", price: "12.500 F/mois", type: "Restauration", icon: <Utensils/> },
    { name: "Onyx Booking", price: "15.000 F/mois", type: "Réservation", icon: <Calendar/> },
    { name: "Onyx Staff", price: "20.000 F/mois", type: "RH & Paie", icon: <Users/> },
    { name: "Onyx Fit", price: "7.500 F/mois", type: "Micro SaaS", icon: <ShieldCheck className="text-[#39FF14]"/> },
    { name: "Onyx Tontine", price: "Gratuit (2%)", type: "Micro SaaS", icon: <Wallet className="text-[#39FF14]"/> },
    { name: "Onyx CRM", price: "25.000 F/mois", type: "Core SaaS", icon: <Target/> },
    { name: "Pack Trio", price: "17.500 F", type: "Bundle", icon: <Star/> },
    { name: "Pack Full", price: "30.000 F", type: "Bundle", icon: <Award/> },
    { name: "Pack Premium", price: "75.000 F", type: "Bundle IA", icon: <Rocket/> },
  ];

  const [chats, setChats] = useState<any[]>([
    { id: 1, name: 'Abdoulaye Ndiaye', source: 'Bot Site', status: 'Online', unread: true, messages: [{ sender: 'client', text: 'Quels sont les tarifs pour Onyx Fit ?' }] },
    { id: 2, name: 'Amina Sy', source: 'WhatsApp', status: 'Offline', unread: false, messages: [{ sender: 'client', text: 'Je veux parler à un humain.' }, { sender: 'admin', text: 'Bonjour Amina, je suis là pour vous aider !' }, { sender: 'client', text: 'Comment payer par Wave ?' }] },
    { id: 3, name: 'Lead #1042', source: 'Bot Site', status: 'Online', unread: true, messages: [{ sender: 'client', text: 'Votre CRM m\'intéresse.' }] }
  ]);
  const [activeChatId, setActiveChatId] = useState<number>(1);
  const [replyText, setReplyText] = useState("");

  // MODALES
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showFinanceActionModal, setShowFinanceActionModal] = useState<any>(null);
  
  // FORMULAIRE AJOUT CLIENT
  const [newClient, setNewClient] = useState({ full_name: "", contact: "", saas: "Onyx Vente" });

  // ================= INIT =================

  useEffect(() => {
    fetchInitData();
  }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
      setUser({ ...authUser, ...profile });
    } else {
      setUser({ full_name: "Admin Demo", role: "admin", avatar_url: "https://i.pravatar.cc/150?u=admin" });
    }
    setLoading(false);
  }

  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  // ================= ACTIONS =================
  
  const handleSendReply = () => {
    if(!replyText.trim()) return;
    setChats(chats.map(c => c.id === activeChatId ? { ...c, messages: [...c.messages, { sender: 'admin', text: replyText }] } : c));
    setReplyText("");
  };

  const deleteClient = (id: string) => {
    if(confirm("Supprimer ce membre de l'Empire ?")) {
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  const changeRole = (id: string, newRole: string) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, role: newRole } : u));
    if(newRole === 'client') alert("Client activé ! Le schéma de paiement Wave/Orange a été généré sur son espace.");
  };

  const handleAddClient = () => {
    if(!newClient.full_name || !newClient.contact) return alert("Remplissez les champs !");
    const client = {
      id: Math.random().toString(),
      full_name: newClient.full_name,
      contact: newClient.contact,
      role: 'prospect',
      avatar_url: `https://i.pravatar.cc/150?u=${Math.random()}`,
      saas: newClient.saas,
      expire: 'En essai (J-7)'
    };
    setUsersList([client, ...usersList]);
    setShowAddClientModal(false);
    setNewClient({ full_name: "", contact: "", saas: "Onyx Vente" });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-inter font-black uppercase text-xl animate-pulse">Chargement de l'Empire...</div>;

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-inter flex overflow-hidden">
      
      {/* ================= SIDEBAR ================= */}
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div>
          <div className="mb-12 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="font-inter font-black text-3xl tracking-tighter uppercase">ONYX<span className="text-[#39FF14]">OPS</span></span>
          </div>
          
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 ml-4">Menu Principal</p>
          <div className="space-y-1">
            <NavBtn icon={<LayoutDashboard/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavBtn icon={<MessageSquare/>} label="Inbox & Leads" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
            <NavBtn icon={<Users/>} label="Membres & CRM" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <NavBtn icon={<Wallet/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
            <NavBtn icon={<Star/>} label="Écosystème" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
          </div>

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-8 mb-4 ml-4">Marketing & Ventes</p>
          <div className="space-y-1">
            <NavBtn icon={<FileText/>} label="Social Selling" active={activeTab === 'blog'} onClick={() => setActiveTab('blog')} />
          </div>
        </div>
      </nav>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-8 flex justify-between items-center z-10">
          <h1 className="text-xl font-black uppercase tracking-tight">{activeTab === 'overview' ? 'Empire Overview' : activeTab.toUpperCase()}</h1>
          
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors">
              <Home size={16}/> Voir le site
            </button>
            <div className="w-px h-6 bg-zinc-200"></div>
            <div className="flex items-center gap-3 cursor-pointer hover:bg-zinc-50 p-2 rounded-xl transition-colors">
              <div className="text-right">
                <p className="text-sm font-black uppercase leading-none">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] font-bold text-[#39FF14] uppercase">ADMIN</p>
              </div>
              <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=Admin"} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-200 object-cover" />
            </div>
            <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
          </div>
        </header>

        {/* SCROLLABLE AREA */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          
          {/* ================= 1. DASHBOARD ================= */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard label="Cashflow Total" value="3.850.000" unit="FCFA" icon={<TrendingUp/>} neon onClick={() => setActiveTab('finances')} />
                <KpiCard label="Essais Actifs" value="142" unit="Users" icon={<Zap/>} onClick={() => setActiveTab('users')} />
                <KpiCard label="Taux Conv." value="24" unit="%" icon={<CheckCircle/>} onClick={() => setActiveTab('users')} />
              </div>
            </div>
          )}

          {/* ================= 2. CLIENTS / CRM (Grid 3x3 + Actions) ================= */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black uppercase text-xl">Base de données Clients</h3>
                 <button onClick={() => setShowAddClientModal(true)} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-lg hover:scale-105 transition-all">
                    <UserPlus size={16}/> Ajouter Manuellement
                 </button>
              </div>

              {/* GRID 3x3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usersList.map((u) => (
                  <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition-all flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <img src={u.avatar_url} className="w-12 h-12 rounded-full border border-zinc-200 object-cover" alt="" />
                        <div className="flex gap-2">
                          <button className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-black hover:text-white transition-colors"><Edit3 size={14}/></button>
                          <button onClick={() => deleteClient(u.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={14}/></button>
                        </div>
                      </div>
                      <p className="font-black text-lg mb-1">{u.full_name}</p>
                      <p className="text-xs font-bold text-zinc-400 mb-4">{u.contact}</p>
                      
                      <div className="bg-zinc-50 p-3 rounded-xl mb-4 border border-zinc-100">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black uppercase text-zinc-500">SaaS Actif</span>
                          <span className="text-[10px] font-black text-black">{u.saas}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-zinc-500">Expiration</span>
                          <span className={`text-[10px] font-black ${u.expire.includes('Expire') ? 'text-red-500' : 'text-[#39FF14]'}`}>{u.expire}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <select 
                        value={u.role} 
                        onChange={(e) => changeRole(u.id, e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-black uppercase outline-none cursor-pointer text-center ${u.role === 'partner' ? 'bg-[#39FF14] text-black' : u.role === 'client' ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-600'}`}
                      >
                        <option value="prospect">Statut : Prospect</option>
                        <option value="client">Statut : Client (Payant)</option>
                        <option value="partner">Statut : Partenaire</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 3. FINANCES (Graphique Dynamique + Actions Modales) ================= */}
          {activeTab === 'finances' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                  <div className="flex gap-4 items-center">
                     <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
                        <input type="text" placeholder="Rechercher..." className="pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none" />
                     </div>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold uppercase hover:bg-[#39FF14] hover:text-black"><Download size={16}/> Exporter PDF</button>
               </div>

               {/* Graphique Dynamique CSS */}
               <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                  <h3 className="font-black uppercase text-sm mb-6 flex items-center gap-2"><BarChart3 size={18}/> Tendances de Ventes (6 Derniers Mois)</h3>
                  <div className="flex items-end gap-4 h-48 mt-4">
                    {[40, 65, 45, 80, 55, 95].map((height, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                        <div className="w-full bg-zinc-100 rounded-t-xl relative h-full flex items-end">
                           <div className="w-full bg-black group-hover:bg-[#39FF14] transition-all rounded-t-xl" style={{ height: `${height}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold uppercase text-zinc-400">Mois {i+1}</span>
                      </div>
                    ))}
                  </div>
               </div>

               <h3 className="font-black uppercase text-lg mt-8 mb-4">Paiements Récents & Actions</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {usersList.filter(u => u.role !== 'prospect').map(client => (
                     <div key={client.id} onClick={() => setShowFinanceActionModal(client)} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition-all cursor-pointer group">
                        <div className="flex items-center gap-4 mb-4">
                           <img src={client.avatar_url} className="w-12 h-12 rounded-full object-cover" alt=""/>
                           <div>
                              <p className="font-bold text-sm">{client.full_name}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase">{client.saas}</p>
                           </div>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-xl mb-4 text-center">
                           <p className="text-[10px] font-bold text-zinc-400 uppercase">Expiration du pack</p>
                           <p className={`font-black text-sm ${client.expire.includes('Expire') ? 'text-red-500' : ''}`}>{client.expire}</p>
                        </div>
                        <p className="text-[10px] text-center font-black uppercase tracking-widest text-zinc-400 group-hover:text-black">Cliquez pour agir</p>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* ================= 4. ECOSYSTEME (Les 9 SaaS + Packs) ================= */}
          {activeTab === 'ecosystem' && (
            <div className="space-y-6">
               <h3 className="font-black uppercase text-2xl mb-6">L'Empire Onyx (9 SaaS & 3 Packs)</h3>
               <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {ecosystemData.map((item, i) => (
                     <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition-all group cursor-pointer flex flex-col justify-between">
                        <div className="flex justify-between items-start mb-6">
                           <div className="p-3 bg-zinc-50 rounded-xl group-hover:bg-[#39FF14]/10 transition-colors">{item.icon}</div>
                           <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${item.type.includes('Bundle') ? 'bg-black text-[#39FF14]' : 'bg-zinc-100 text-zinc-500'}`}>{item.type}</span>
                        </div>
                        <div>
                          <h4 className="font-black text-lg leading-tight mb-1">{item.name}</h4>
                          <p className="text-xs font-bold text-zinc-500">{item.price}</p>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* ================= 5. CHAT & INBOX (Interactif) ================= */}
          {activeTab === 'chat' && (
            <div className="h-[600px] flex bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
               {/* Liste Threads */}
               <div className="w-1/3 border-r border-zinc-100 flex flex-col bg-zinc-50">
                  <div className="p-4 border-b border-zinc-200 bg-white font-black uppercase text-sm">Leads entrants</div>
                  <div className="flex-1 overflow-y-auto">
                     {chats.map(chat => (
                        <div 
                           key={chat.id} 
                           onClick={() => setActiveChatId(chat.id)}
                           className={`p-4 border-b border-zinc-100 cursor-pointer transition-colors ${activeChatId === chat.id ? 'bg-black text-white' : 'hover:bg-white'}`}
                        >
                           <div className="flex justify-between items-center mb-1">
                              <p className="font-bold text-sm">{chat.name}</p>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${chat.source === 'WhatsApp' ? 'bg-[#25D366] text-white' : 'bg-[#39FF14] text-black'}`}>{chat.source}</span>
                           </div>
                           <p className={`text-xs line-clamp-1 ${activeChatId === chat.id ? 'text-zinc-400' : 'text-zinc-500'}`}>{chat.messages[chat.messages.length - 1].text}</p>
                        </div>
                     ))}
                  </div>
               </div>
               {/* Fenêtre de discussion */}
               <div className="flex-1 flex flex-col bg-white relative">
                  <div className="p-4 border-b border-zinc-200 flex justify-between items-center">
                     <p className="font-black uppercase text-lg">{activeChat?.name}</p>
                     <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${activeChat?.status === 'Online' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                        {activeChat?.status}
                     </span>
                  </div>
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto flex flex-col bg-zinc-50/50">
                     {activeChat?.messages.map((msg: any, i: number) => (
                        <div key={i} className={`p-4 rounded-2xl max-w-[75%] text-sm shadow-sm ${msg.sender === 'admin' ? 'bg-black text-white self-end rounded-tr-none' : 'bg-white border border-zinc-200 self-start rounded-tl-none'}`}>
                           {msg.text}
                        </div>
                     ))}
                  </div>
                  <div className="p-4 bg-white border-t border-zinc-200 flex gap-4 items-center">
                     <input 
                        type="text" 
                        value={replyText} 
                        onChange={e => setReplyText(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && handleSendReply()} 
                        placeholder="Tapez votre réponse ici..." 
                        className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black transition-colors" 
                     />
                     <button onClick={handleSendReply} className="bg-[#39FF14] text-black p-3 rounded-xl hover:bg-black hover:text-[#39FF14] transition-colors shadow-sm"><Send size={20}/></button>
                  </div>
               </div>
            </div>
          )}

        </div>
      </main>

      {/* ================= MODALES ================= */}
      
      {/* MODAL : AJOUTER CLIENT (TEL OU EMAIL) */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowAddClientModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <h2 className="text-xl font-black uppercase mb-6 border-b border-zinc-100 pb-4">Ajouter un Client</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nom Complet" value={newClient.full_name} onChange={e => setNewClient({...newClient, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <input type="text" placeholder="Numéro de Téléphone ou Email" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <select value={newClient.saas} onChange={e => setNewClient({...newClient, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black cursor-pointer">
                 {ecosystemData.map(e => <option key={e.name} value={e.name}>Associer à : {e.name}</option>)}
              </select>
            </div>
            <button onClick={handleAddClient} className="w-full py-4 bg-[#39FF14] text-black font-black text-xs uppercase rounded-xl mt-6 shadow-lg hover:scale-105 transition">Créer & Activer</button>
          </div>
        </div>
      )}

      {/* MODAL : ACTIONS FINANCES */}
      {showFinanceActionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowFinanceActionModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <div className="flex items-center gap-4 mb-6 border-b border-zinc-100 pb-4">
               <img src={showFinanceActionModal.avatar_url} className="w-12 h-12 rounded-full" alt="" />
               <div>
                  <h2 className="text-lg font-black uppercase leading-tight">{showFinanceActionModal.full_name}</h2>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">{showFinanceActionModal.saas} • {showFinanceActionModal.expire}</p>
               </div>
            </div>
            
            <div className="space-y-3">
               <button onClick={() => { alert("Alerte envoyée !"); setShowFinanceActionModal(null); }} className="w-full flex items-center justify-between p-4 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition">
                  <span className="flex items-center gap-2"><Bell size={16}/> Alerter Expiration</span> <Send size={14}/>
               </button>
               <button onClick={() => { alert("Promo envoyée !"); setShowFinanceActionModal(null); }} className="w-full flex items-center justify-between p-4 bg-black text-[#39FF14] rounded-xl font-black text-xs uppercase hover:bg-zinc-800 transition">
                  <span className="flex items-center gap-2"><Megaphone size={16}/> Offre Promo (-20%)</span> <Send size={14}/>
               </button>
               <button onClick={() => { alert("Demande envoyée !"); setShowFinanceActionModal(null); }} className="w-full flex items-center justify-between p-4 bg-zinc-100 text-black rounded-xl font-black text-xs uppercase hover:bg-[#39FF14] transition">
                  <span className="flex items-center gap-2"><Handshake size={16}/> Proposer Partenariat</span> <Send size={14}/>
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 mx-2 rounded-xl transition-all font-bold text-sm ${active ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}>
      <div className={`${active ? 'text-[#39FF14]' : 'text-zinc-400'}`}>{icon}</div>{label}
    </button>
  );
}

function KpiCard({ label, value, unit, icon, neon, onClick }: any) {
  return (
    <div onClick={onClick} className={`p-6 rounded-[2rem] border border-zinc-200 relative group cursor-pointer hover:-translate-y-1 transition-all duration-300 ${neon ? 'bg-black text-white shadow-xl shadow-black/20' : 'bg-white hover:shadow-lg hover:border-black'}`}>
      <div className="flex justify-between items-start mb-4">
         <p className={`text-[10px] font-bold uppercase tracking-widest ${neon ? 'text-[#39FF14]' : 'text-zinc-500'}`}>{label}</p>
         <div className={`p-2 rounded-lg ${neon ? 'bg-white/10 text-[#39FF14]' : 'bg-zinc-50 text-black'}`}>{icon}</div>
      </div>
      <div className="flex items-baseline gap-2"><p className="text-4xl font-black tracking-tight">{value}</p><span className="text-[10px] font-bold uppercase text-zinc-400">{unit}</span></div>
    </div>
  );
}
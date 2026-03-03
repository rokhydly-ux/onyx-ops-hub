"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Users, Wallet, LayoutDashboard, LogOut, TrendingUp, CheckCircle, 
  MessageSquare, FileText, UserPlus, Download, CheckSquare, AlertCircle, 
  X, Bell, Megaphone, Send, Edit3, Trash2, Home, Search, Target, Globe, Box, Plus
} from "lucide-react";

export default function AdminBentoTerminal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  
  // ================= ETATS & DONNÉES =================
  const [usersList, setUsersList] = useState<any[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [dashboardDate, setDashboardDate] = useState("Ce mois-ci");

  // MODALES
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showFinanceActionModal, setShowFinanceActionModal] = useState<any>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState<any>(null); 
  const [showProfileModal, setShowProfileModal] = useState(false);

  // FORMULAIRES
  const [newClient, setNewClient] = useState({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)" });
  const [articleForm, setArticleForm] = useState({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" });

  const ecosystemData = [
    { name: "Onyx Vente", price: "15.000 F", type: "Vente Flash", users: 142 },
    { name: "Onyx Tiak", price: "10.000 F", type: "Logistique", users: 89 },
    { name: "Onyx Stock", price: "15.000 F", type: "Inventaire", users: 112 },
    { name: "Onyx Menu", price: "12.500 F", type: "Restauration", users: 45 },
    { name: "Onyx Booking", price: "15.000 F", type: "Réservation", users: 28 },
    { name: "Onyx Staff", price: "20.000 F", type: "RH & Paie", users: 34 },
  ];

  // ================= INIT =================
  useEffect(() => {
    fetchInitData();
  }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser || { full_name: "Admin Demo", email: "admin@onyx.com", role: "admin", avatar_url: "https://i.pravatar.cc/150?u=admin" });

    const { data: clients } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (clients) setUsersList(clients);
    
    const { data: articles } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (articles) setArticlesList(articles);

    const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (leads) setLeadsList(leads);

    const { data: partners } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
    if (partners) setPartnersList(partners);

    setLoading(false);
  }

  // ================= ACTIONS DB =================
  const saveClient = async () => {
    if(!newClient.full_name) return;
    const clientData = { ...newClient, avatar_url: `https://ui-avatars.com/api/?name=${newClient.full_name}` };

    if (newClient.id) {
      await supabase.from('clients').update(clientData).eq('id', newClient.id);
      setUsersList(usersList.map(u => u.id === newClient.id ? { ...u, ...clientData } : u));
    } else {
      const { data } = await supabase.from('clients').insert(clientData).select().single();
      if(data) setUsersList([data, ...usersList]);
    }
    setShowAddClientModal(false);
  };

  const deleteClient = async (id: string) => {
    if(confirm("Supprimer ?")) {
      await supabase.from('clients').delete().eq('id', id);
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  const saveArticle = async () => {
    if (!articleForm.title) return;
    if (articleForm.id) {
      await supabase.from('articles').update(articleForm).eq('id', articleForm.id);
      setArticlesList(articlesList.map(a => a.id === articleForm.id ? { ...a, ...articleForm } : a));
    } else {
      const { data } = await supabase.from('articles').insert(articleForm).select().single();
      if(data) setArticlesList([data, ...articlesList]);
    }
    setShowArticleModal(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-black uppercase text-xl animate-pulse">Chargement de l'Empire...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-inter flex overflow-hidden">
      
      {/* SIDEBAR */}
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between hidden lg:flex shadow-sm z-10">
        <div>
          <div className="mb-12 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <span className="font-black text-3xl tracking-tighter uppercase">ONYX<span className="text-[#39FF14]">OPS</span></span>
          </div>
          <div className="space-y-1">
            <NavBtn icon={<LayoutDashboard/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavBtn icon={<MessageSquare/>} label="Inbox & Leads" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
            <NavBtn icon={<Users/>} label="Membres & CRM" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <NavBtn icon={<Wallet/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
            <NavBtn icon={<Target/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
            <NavBtn icon={<Box/>} label="Ecosystème SaaS" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
            <NavBtn icon={<Globe/>} label="Marketing & Blog" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-8 flex justify-between items-center z-10">
          <h1 className="text-xl font-black uppercase tracking-tight">{activeTab}</h1>
          <div className="flex items-center gap-6">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors"><Home size={16}/> Voir le site</button>
            
            <div onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 cursor-pointer p-2 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition border border-transparent hover:border-zinc-200">
              <div className="text-right">
                <p className="text-sm font-black uppercase leading-none">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] font-bold text-[#39FF14] uppercase">Profil & Réglages</p>
              </div>
              <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=Admin"} alt="Profil" className="w-10 h-10 rounded-full border border-zinc-200 shadow-sm" />
            </div>
            
            <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="text-zinc-400 hover:text-red-500"><LogOut size={20}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth flex flex-col">
          <div className="flex-1">
            {/* ================= 1. DASHBOARD ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-zinc-200 shadow-sm">
                   <p className="font-bold text-sm uppercase">Période :</p>
                   <select value={dashboardDate} onChange={e => setDashboardDate(e.target.value)} className="bg-zinc-100 px-4 py-2 rounded-xl text-sm font-bold outline-none cursor-pointer">
                      <option>Aujourd'hui</option><option>Cette semaine</option><option>Ce mois-ci</option><option>Cette année</option>
                   </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-[2rem] border border-zinc-200 bg-black text-white shadow-xl shadow-black/20">
                    <div className="flex justify-between items-start mb-4">
                       <p className="text-[10px] font-bold uppercase tracking-widest text-[#39FF14]">CA Total</p>
                       <TrendingUp className="text-[#39FF14] w-5 h-5" />
                    </div>
                    <div className="flex items-baseline gap-2"><p className="text-4xl font-black tracking-tight">3.850.000</p><span className="text-[10px] font-bold uppercase text-zinc-400">FCFA</span></div>
                    <div className="mt-4 pt-4 border-t border-zinc-800 flex justify-between items-center text-xs">
                       <span className="text-zinc-500 font-bold uppercase">Mois Précédent</span>
                       <span className="text-white font-black">2.100.000 FCFA <span className="text-[#39FF14] ml-1">(+83%)</span></span>
                    </div>
                  </div>
                  <KpiCard label="Nouveaux Leads (Bot)" value={leadsList.length.toString()} unit="Leads" icon={<MessageSquare/>} />
                  <KpiCard label="Taux de Conversion" value="24" unit="%" icon={<CheckCircle/>} />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                   <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                      <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2"><AlertCircle className="text-red-500 w-5 h-5"/> Expirent cette semaine</h3>
                      <div className="space-y-3">
                         {usersList.filter(u => u.expire && u.expire.toLowerCase().includes('expire')).slice(0,4).map(u => (
                            <div key={u.id} onClick={() => { setNewClient(u); setShowAddClientModal(true); }} className="flex justify-between items-center p-3 bg-red-50 hover:bg-red-100 transition rounded-xl cursor-pointer">
                               <div><p className="font-bold text-sm">{u.full_name}</p><p className="text-[10px] text-zinc-500 uppercase font-black">{u.saas}</p></div>
                               <span className="text-xs font-black text-red-600 bg-white px-2 py-1 rounded-md shadow-sm">Modifier</span>
                            </div>
                         ))}
                         {usersList.filter(u => u.expire && u.expire.toLowerCase().includes('expire')).length === 0 && <p className="text-xs text-zinc-500 font-bold uppercase">Aucune expiration imminente.</p>}
                      </div>
                   </div>

                   <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                      <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2"><Wallet className="w-5 h-5"/> Transactions Récentes</h3>
                      <div className="space-y-3">
                         {[
                           { name: "Moussa Sarr", amount: "30.000", status: "Payé", pack: "Pack Full" },
                           { name: "Fatou Bintou", amount: "17.500", status: "Payé", pack: "Pack Trio" },
                         ].map((t, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-zinc-50 rounded-xl">
                               <div><p className="font-bold text-sm">{t.name}</p><p className="text-[10px] text-zinc-500 uppercase font-black">{t.pack}</p></div>
                               <div className="text-right"><p className="font-black text-sm">{t.amount} F</p><p className="text-[10px] text-[#39FF14] uppercase font-black">{t.status}</p></div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* ================= 2. CLIENTS / CRM ================= */}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black uppercase text-xl">CRM & Base Clients</h3>
                   <button onClick={() => { setNewClient({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)" }); setShowAddClientModal(true); }} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition">
                      <UserPlus size={16} className="inline mr-2"/> Ajouter Contact
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {usersList.map((u) => (
                    <div key={u.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.full_name}`} className="w-12 h-12 rounded-full object-cover" alt="" />
                          <div className="flex gap-2">
                            <button onClick={() => { setNewClient(u); setShowAddClientModal(true); }} className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-black hover:text-white transition"><Edit3 size={14}/></button>
                            <button onClick={() => deleteClient(u.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition"><Trash2 size={14}/></button>
                          </div>
                        </div>
                        <p className="font-black text-lg mb-1">{u.full_name}</p>
                        <p className="text-xs font-bold text-zinc-400 mb-4">{u.contact}</p>
                        
                        <div className="bg-zinc-50 p-3 rounded-xl mb-4 border border-zinc-100">
                          <div className="flex justify-between items-center mb-1"><span className="text-[10px] font-black uppercase text-zinc-500">SaaS Actif</span><span className="text-[10px] font-black">{u.saas}</span></div>
                          <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-zinc-500">Expiration</span><span className={`text-[10px] font-black ${u.expire?.includes('Expire') ? 'text-red-500' : 'text-[#39FF14]'}`}>{u.expire}</span></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= 3. FINANCES ================= */}
            {activeTab === 'finances' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                    <h3 className="font-black uppercase text-xl">Rapports Financiers</h3>
                    <button onClick={() => setShowExportModal(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl text-sm font-bold uppercase hover:bg-[#39FF14] hover:text-black transition shadow-lg"><Download size={16}/> Exporter Rapport</button>
                 </div>

                 <h3 className="font-black uppercase text-lg mt-8 mb-4">Clients Actifs (Actions Rapides)</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {usersList.map(client => (
                       <div key={client.id} onClick={() => setShowFinanceActionModal(client)} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition cursor-pointer group">
                          <div className="flex items-center gap-4 mb-4">
                             <img src={client.avatar_url || `https://ui-avatars.com/api/?name=${client.full_name}`} className="w-12 h-12 rounded-full object-cover" alt=""/>
                             <div><p className="font-bold text-sm">{client.full_name}</p><p className="text-[10px] text-zinc-500 font-bold uppercase">{client.saas}</p></div>
                          </div>
                          <p className="text-[10px] text-center font-black uppercase tracking-widest text-zinc-400 group-hover:text-black">Cliquez pour agir</p>
                       </div>
                    ))}
                 </div>
              </div>
            )}

            {/* ================= 4. MARKETING / BLOG ================= */}
            {activeTab === 'marketing' && (
              <div className="space-y-6">
                 <div className="flex justify-between items-center mb-6">
                   <h3 className="font-black uppercase text-xl">Articles & Social Selling</h3>
                   <button onClick={() => { setArticleForm({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" }); setShowArticleModal({}); }} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-[#39FF14] hover:text-black transition">
                      <Plus size={16} className="inline mr-2"/> Rédiger un Article
                   </button>
                </div>

                <div className="grid gap-6">
                   {articlesList.length === 0 && <div className="text-center p-12 bg-white rounded-[2rem] font-bold uppercase text-zinc-400 border border-dashed border-zinc-300">Aucun article publié. Créez-en un pour alimenter le blog.</div>}
                   {articlesList.map(article => (
                      <div key={article.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition flex justify-between items-center group">
                         <div className="flex-1">
                            <div className="flex gap-2 mb-2">
                               <span className="text-[10px] font-black uppercase bg-zinc-100 px-2 py-1 rounded-md">{article.category}</span>
                               <span className="text-[10px] font-black uppercase bg-[#39FF14]/20 text-green-800 px-2 py-1 rounded-md">{article.pack_focus}</span>
                            </div>
                            <h4 className="font-black text-lg group-hover:text-[#39FF14] transition">{article.title}</h4>
                            <p className="text-xs text-zinc-500 line-clamp-1 mt-1">{article.content}</p>
                         </div>
                         <div className="flex gap-2 ml-4">
                            <button onClick={() => { setArticleForm(article); setShowArticleModal(article); }} className="p-3 bg-zinc-100 rounded-xl hover:bg-black hover:text-white transition"><Edit3 size={16}/></button>
                         </div>
                      </div>
                   ))}
                </div>
              </div>
            )}

            {/* ================= 5. ECOSYSTEME ================= */}
            {activeTab === 'ecosystem' && (
               <div className="space-y-6">
                  <h3 className="font-black uppercase text-xl mb-6">Ecosystème des SaaS Actifs</h3>
                  <div className="grid md:grid-cols-3 gap-6">
                     {ecosystemData.map((s, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                           <div className="flex justify-between items-start mb-4">
                              <div className="bg-black text-[#39FF14] p-3 rounded-xl"><Box size={20}/></div>
                              <span className="text-[10px] font-black uppercase bg-zinc-100 px-2 py-1 rounded-md">{s.type}</span>
                           </div>
                           <h4 className="font-black text-lg mb-1">{s.name}</h4>
                           <p className="text-sm font-bold text-zinc-500 mb-4">{s.price} / mois</p>
                           <div className="bg-zinc-50 p-3 rounded-xl flex justify-between items-center text-xs font-bold border border-zinc-100">
                              <span className="text-zinc-500 uppercase">Utilisateurs</span>
                              <span className="text-black">{s.users} actifs</span>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* ================= 6. INBOX / LEADS ================= */}
            {activeTab === 'chat' && (
               <div className="space-y-6">
                  <h3 className="font-black uppercase text-xl mb-6">Leads Capturés (Bot & Hub)</h3>
                  <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm p-6 space-y-4">
                     {leadsList.length === 0 && <p className="text-zinc-500 font-bold text-sm uppercase">Aucun lead enregistré pour le moment.</p>}
                     {leadsList.map(lead => (
                        <div key={lead.id} className="flex justify-between items-center p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                           <div>
                              <p className="font-black text-sm uppercase">{lead.source} <span className="text-[10px] bg-black text-[#39FF14] px-2 py-1 rounded-full ml-2">{lead.intent}</span></p>
                              <p className="text-xs text-zinc-500 font-bold mt-1">Contact/Info: {lead.contact || 'Clic Bot Rapide'} • {new Date(lead.created_at).toLocaleString()}</p>
                           </div>
                           {lead.contact && (
                              <button onClick={() => window.open(`https://wa.me/221${lead.contact.replace(/\D/g,'')}`, '_blank')} className="bg-[#25D366] text-white px-4 py-2 rounded-lg font-black text-xs uppercase shadow-md">Relancer sur WA</button>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            )}
          </div>

          {/* FOOTER ADMIN RESTAURÉ */}
          <footer className="mt-8 pt-6 border-t border-zinc-200 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
             <p>OnyxOps Admin Hub © 2026</p>
             <p>Connexion Sécurisée - Dakar</p>
          </footer>
        </div>
      </main>

      {/* ================= MODALES ================= */}
      
      {/* MODAL : PROFIL ADMIN */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative text-center">
            <button onClick={() => setShowProfileModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=Admin"} alt="Profil" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-zinc-100" />
            <h2 className="text-xl font-black uppercase mb-1">{user?.full_name || 'Administrateur'}</h2>
            <p className="text-xs font-bold text-zinc-500 mb-6">{user?.email}</p>
            <div className="space-y-3 text-left">
               <input type="text" defaultValue={user?.full_name} placeholder="Nom" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
               <input type="text" defaultValue={user?.avatar_url} placeholder="URL de la photo" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
               <button onClick={() => { alert("Profil mis à jour !"); setShowProfileModal(false); }} className="w-full py-3 bg-black text-[#39FF14] font-black text-xs uppercase rounded-xl hover:bg-[#39FF14] hover:text-black transition">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : AJOUT/EDIT CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowAddClientModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <h2 className="text-xl font-black uppercase mb-6">{newClient.id ? 'Modifier Contact' : 'Ajouter Contact'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nom Complet" value={newClient.full_name} onChange={e => setNewClient({...newClient, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <input type="text" placeholder="Numéro WhatsApp ou Email" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none focus:border-black" />
              <select value={newClient.saas} onChange={e => setNewClient({...newClient, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none cursor-pointer">
                 {ecosystemData.map(e => <option key={e.name} value={e.name}>SaaS : {e.name}</option>)}
              </select>
            </div>
            <button onClick={saveClient} className="w-full py-4 bg-[#39FF14] text-black font-black text-xs uppercase rounded-xl mt-6 shadow-lg hover:scale-105 transition">Enregistrer</button>
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
                  <p className="text-[10px] font-bold text-zinc-500 uppercase">{showFinanceActionModal.saas}</p>
               </div>
            </div>
            <div className="space-y-3">
               <button onClick={() => { alert("Alerte envoyée !"); setShowFinanceActionModal(null); }} className="w-full flex justify-between p-4 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition">
                  <span className="flex items-center gap-2"><Bell size={16}/> Alerter Expiration</span> <Send size={14}/>
               </button>
               <button onClick={() => { alert("Promo envoyée !"); setShowFinanceActionModal(null); }} className="w-full flex justify-between p-4 bg-black text-[#39FF14] rounded-xl font-black text-xs uppercase hover:bg-zinc-800 transition">
                  <span className="flex items-center gap-2"><Megaphone size={16}/> Offre Promo (-20%)</span> <Send size={14}/>
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : EXPORT PDF / XLS */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowExportModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <h2 className="text-xl font-black uppercase mb-6 border-b border-zinc-100 pb-4">Export Financier</h2>
            <div className="space-y-4 mb-8">
               <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Date de début</label><input type="date" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
               <div><label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Date de fin</label><input type="date" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" /></div>
            </div>
            <div className="flex gap-4">
               <button onClick={() => setShowExportModal(false)} className="flex-1 py-4 bg-zinc-100 text-black font-black text-xs uppercase rounded-xl hover:bg-zinc-200 transition">Format XLS</button>
               <button onClick={() => setShowExportModal(false)} className="flex-1 py-4 bg-black text-white font-black text-xs uppercase rounded-xl shadow-lg hover:bg-[#39FF14] hover:text-black transition">Format PDF</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : REDIGER ARTICLE */}
      {showArticleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl relative">
            <button onClick={() => setShowArticleModal(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
            <h2 className="text-xl font-black uppercase mb-6">{articleForm.id ? 'Modifier Article' : 'Nouvel Article'}</h2>
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
            <button onClick={saveArticle} className="w-full py-4 bg-[#39FF14] text-black font-black text-xs uppercase rounded-xl mt-6 shadow-lg hover:scale-105 transition">Publier l'Article</button>
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

function KpiCard({ label, value, unit, icon }: any) {
  return (
    <div className="p-6 rounded-[2rem] border border-zinc-200 bg-white hover:shadow-lg hover:border-black transition-all">
      <div className="flex justify-between items-start mb-4">
         <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
         <div className="p-2 rounded-lg bg-zinc-50 text-black">{icon}</div>
      </div>
      <div className="flex items-baseline gap-2"><p className="text-4xl font-black tracking-tight">{value}</p><span className="text-[10px] font-bold uppercase text-zinc-400">{unit}</span></div>
    </div>
  );
}
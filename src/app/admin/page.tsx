"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Users, Wallet, LayoutDashboard, LogOut, TrendingUp, TrendingDown, CheckCircle, 
  MessageSquare, FileText, UserPlus, Zap, Calendar, Globe, Rocket, 
  ShieldCheck, CreditCard, Star, Search, Home, Edit3, Trash2, Send,
  Megaphone, Download, Filter, BarChart3, Handshake, AlertCircle, Award, Target, X, Bell,
  Truck, Box, Utensils, Plus, CheckSquare
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
  const [showArticleModal, setShowArticleModal] = useState<any>(null); // null = fermé, {} = nouveau, {id...} = edit
  const [clientToEdit, setClientToEdit] = useState<any>(null);
  
  // FORMULAIRES
  const [newClient, setNewClient] = useState({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)" });
  const [articleForm, setArticleForm] = useState({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" });

  const ecosystemData = [
    { name: "Onyx Vente", price: "15.000 F", type: "Vente Flash" },
    { name: "Onyx Tiak", price: "10.000 F", type: "Logistique" },
    { name: "Onyx Stock", price: "15.000 F", type: "Inventaire" },
    { name: "Onyx Menu", price: "12.500 F", type: "Restauration" },
    { name: "Onyx Booking", price: "15.000 F", type: "Réservation" },
    { name: "Onyx Staff", price: "20.000 F", type: "RH & Paie" },
    { name: "Onyx Fit", price: "7.500 F", type: "Micro SaaS" },
    { name: "Onyx Tontine", price: "Gratuit", type: "Micro SaaS" },
    { name: "Pack Full", price: "30.000 F", type: "Bundle" },
  ];

  // ================= INIT =================
  useEffect(() => {
    fetchInitData();
  }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser || { full_name: "Admin Demo", role: "admin", avatar_url: "https://i.pravatar.cc/150?u=admin" });

    // Fetch CRM
    const { data: clients } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
    if (clients && clients.length > 0) setUsersList(clients);
    else setUsersList([ // Fallback Mock
      { id: '1', full_name: 'Aissatou Diallo', contact: 'aissa@mail.com', role: 'prospect', avatar_url: 'https://i.pravatar.cc/150?u=aissa', saas: 'Onyx Fit', expire: 'En essai (J-2)' },
      { id: '2', full_name: 'Mamadou Ndiaye', contact: '+221 77 123 45 67', role: 'client', avatar_url: 'https://i.pravatar.cc/150?u=mamadou', saas: 'Onyx Vente', expire: 'Expire dans 3 jours' },
    ]);

    // Fetch Articles
    const { data: articles } = await supabase.from('articles').select('*').order('created_at', { ascending: false });
    if (articles) setArticlesList(articles);

    // Fetch Leads (Bot)
    const { data: leads } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (leads) setLeadsList(leads);

    // Fetch Partners
    const { data: partners } = await supabase.from('partners').select('*').order('created_at', { ascending: false });
    if (partners) setPartnersList(partners);

    setLoading(false);
  }

  // ================= CRM ACTIONS (AVEC SUPABASE) =================
  const saveClient = async () => {
    if(!newClient.full_name || !newClient.contact) return alert("Remplissez les champs !");
    
    const clientData = {
      full_name: newClient.full_name,
      contact: newClient.contact,
      role: newClient.role,
      saas: newClient.saas,
      expire: newClient.expire,
      avatar_url: `https://i.pravatar.cc/150?u=${newClient.full_name}`
    };

    if (newClient.id) {
      // Update
      await supabase.from('clients').update(clientData).eq('id', newClient.id);
      setUsersList(usersList.map(u => u.id === newClient.id ? { ...u, ...clientData } : u));
    } else {
      // Insert
      const { data } = await supabase.from('clients').insert(clientData).select().single();
      if(data) setUsersList([data, ...usersList]);
    }
    setShowAddClientModal(false);
    setNewClient({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)" });
  };

  const deleteClient = async (id: string) => {
    if(confirm("Supprimer ce contact définitivement ?")) {
      await supabase.from('clients').delete().eq('id', id);
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  const updateClientRole = async (id: string, newRole: string) => {
    await supabase.from('clients').update({ role: newRole }).eq('id', id);
    setUsersList(usersList.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  // ================= BLOG ACTIONS (SOCIAL SELLING) =================
  const saveArticle = async () => {
    if (!articleForm.title || !articleForm.content) return alert("Titre et contenu requis.");
    if (articleForm.id) {
      await supabase.from('articles').update({ title: articleForm.title, category: articleForm.category, pack_focus: articleForm.pack_focus, content: articleForm.content }).eq('id', articleForm.id);
      setArticlesList(articlesList.map(a => a.id === articleForm.id ? { ...a, ...articleForm } : a));
    } else {
      const { data } = await supabase.from('articles').insert({ title: articleForm.title, category: articleForm.category, pack_focus: articleForm.pack_focus, content: articleForm.content }).select().single();
      if(data) setArticlesList([data, ...articlesList]);
    }
    setShowArticleModal(null);
  };

  const deleteArticle = async (id: string) => {
    if(confirm("Supprimer cet article ?")) {
      await supabase.from('articles').delete().eq('id', id);
      setArticlesList(articlesList.filter(a => a.id !== id));
    }
  };

  // ================= PARTNERS ACTIONS =================
  const approvePartner = async (id: string, name: string) => {
    const ref_link = `https://onyxops.com/ref/${name.substring(0,3).toLowerCase()}${Math.floor(Math.random()*1000)}`;
    await supabase.from('partners').update({ status: 'approved', ref_link }).eq('id', id);
    setPartnersList(partnersList.map(p => p.id === id ? { ...p, status: 'approved', ref_link } : p));
  };

  // ================= EXPORT ACTIONS =================
  const handleExport = (type: 'pdf' | 'xls') => {
    alert(`Exportation ${type.toUpperCase()} générée avec succès pour la période sélectionnée.`);
    setShowExportModal(false);
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
            <NavBtn icon={<Handshake/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
            <NavBtn icon={<FileText/>} label="Social Selling" active={activeTab === 'blog'} onClick={() => setActiveTab('blog')} />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-8 flex justify-between items-center z-10">
          <h1 className="text-xl font-black uppercase tracking-tight">{activeTab}</h1>
          <div className="flex items-center gap-6">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors"><Home size={16}/> Voir le site</button>
            <div className="flex items-center gap-3 cursor-pointer p-2 bg-zinc-50 rounded-xl">
              <div className="text-right">
                <p className="text-sm font-black uppercase leading-none">{user?.full_name || 'Admin'}</p>
                <p className="text-[10px] font-bold text-[#39FF14] uppercase">ADMIN</p>
              </div>
            </div>
            <button onClick={() => { supabase.auth.signOut(); router.push('/login'); }} className="text-zinc-400 hover:text-red-500"><LogOut size={20}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          
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
                 {/* SaaS Expirant */}
                 <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                    <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2"><AlertCircle className="text-red-500 w-5 h-5"/> Expirent cette semaine</h3>
                    <div className="space-y-3">
                       {usersList.filter(u => u.expire && u.expire.toLowerCase().includes('expire')).slice(0,4).map(u => (
                          <div key={u.id} onClick={() => { setClientToEdit(u); setNewClient(u); setShowAddClientModal(true); }} className="flex justify-between items-center p-3 bg-red-50 hover:bg-red-100 transition rounded-xl cursor-pointer">
                             <div>
                                <p className="font-bold text-sm">{u.full_name}</p>
                                <p className="text-[10px] text-zinc-500 uppercase font-black">{u.saas}</p>
                             </div>
                             <span className="text-xs font-black text-red-600 bg-white px-2 py-1 rounded-md shadow-sm">Modifier</span>
                          </div>
                       ))}
                       {usersList.filter(u => u.expire && u.expire.toLowerCase().includes('expire')).length === 0 && <p className="text-xs text-zinc-500 font-bold uppercase">Aucune expiration imminente.</p>}
                    </div>
                 </div>

                 {/* Transactions Récentes */}
                 <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                    <h3 className="font-black uppercase text-sm mb-4 flex items-center gap-2"><Wallet className="w-5 h-5"/> Transactions Récentes</h3>
                    <div className="space-y-3">
                       {[
                         { name: "Moussa Sarr", amount: "30.000", status: "Payé", pack: "Pack Full" },
                         { name: "Fatou Bintou", amount: "17.500", status: "Payé", pack: "Pack Trio" },
                         { name: "Alioune Ndoye", amount: "7.500", status: "Payé", pack: "Onyx Vente" },
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
                    <select value={u.role} onChange={(e) => updateClientRole(u.id, e.target.value)} className={`w-full px-3 py-2 rounded-xl text-xs font-black uppercase outline-none cursor-pointer text-center ${u.role === 'client' ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-600'}`}>
                      <option value="prospect">Statut : Prospect</option><option value="client">Statut : Client Payant</option>
                    </select>
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
                           <img src={client.avatar_url} className="w-12 h-12 rounded-full object-cover" alt=""/>
                           <div><p className="font-bold text-sm">{client.full_name}</p><p className="text-[10px] text-zinc-500 font-bold uppercase">{client.saas}</p></div>
                        </div>
                        <p className="text-[10px] text-center font-black uppercase tracking-widest text-zinc-400 group-hover:text-black">Cliquez pour agir (Alerte/Promo)</p>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* ================= 4. SOCIAL SELLING (BLOG) ================= */}
          {activeTab === 'blog' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black uppercase text-xl">Articles & Social Selling</h3>
                 <button onClick={() => { setArticleForm({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" }); setShowArticleModal({}); }} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black text-xs uppercase shadow-lg hover:bg-[#39FF14] hover:text-black transition">
                    <Plus size={16} className="inline mr-2"/> Rédiger un Article
                 </button>
              </div>

              <div className="grid gap-6">
                 {articlesList.length === 0 && <div className="text-center p-12 bg-white rounded-[2rem] font-bold uppercase text-zinc-400 border border-dashed border-zinc-300">Aucun article publié. Créez-en un pour alimenter le blog de la page d'accueil.</div>}
                 
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
                          <button onClick={() => deleteArticle(article.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition"><Trash2 size={16}/></button>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {/* ================= 5. PARTENAIRES ================= */}
          {activeTab === 'partners' && (
            <div className="space-y-6">
               <h3 className="font-black uppercase text-xl mb-6">Demandes de Partenariat</h3>
               
               <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-zinc-100 bg-zinc-50 font-black uppercase text-sm flex gap-4">
                     <span className="w-1/3">Candidat</span>
                     <span className="w-1/3">Contact</span>
                     <span className="w-1/3 text-right">Action / Lien</span>
                  </div>
                  {partnersList.length === 0 && <div className="p-8 text-center text-sm font-bold text-zinc-400 uppercase">Aucune demande en attente.</div>}
                  {partnersList.map(p => (
                     <div key={p.id} className="p-6 border-b border-zinc-100 flex items-center gap-4 hover:bg-zinc-50 transition">
                        <div className="w-1/3 font-bold text-sm">{p.full_name}</div>
                        <div className="w-1/3 text-xs text-zinc-500 font-bold">{p.contact}</div>
                        <div className="w-1/3 text-right flex justify-end">
                           {p.status === 'pending' ? (
                              <button onClick={() => approvePartner(p.id, p.full_name)} className="bg-black text-[#39FF14] px-4 py-2 rounded-lg text-xs font-black uppercase shadow-md hover:scale-105 transition flex items-center gap-2">
                                 Approuver <CheckSquare size={14}/>
                              </button>
                           ) : (
                              <div className="text-left bg-[#39FF14]/10 p-2 rounded-lg border border-[#39FF14] text-[10px] font-black text-black">
                                 Lien : {p.ref_link}
                              </div>
                           )}
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
                            <p className="text-xs text-zinc-500 font-bold mt-1">Contact: {lead.contact || 'Non spécifié'} • {new Date(lead.created_at).toLocaleString()}</p>
                         </div>
                         <button onClick={() => window.open(`https://wa.me/221${lead.contact?.replace(/\D/g,'')}`, '_blank')} className="bg-[#25D366] text-white px-4 py-2 rounded-lg font-black text-xs uppercase shadow-md">Relancer sur WA</button>
                      </div>
                   ))}
                </div>
             </div>
          )}

        </div>
      </main>

      {/* ================= MODALES ================= */}
      
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
               <button onClick={() => { alert("Alerte d'expiration envoyée !"); setShowFinanceActionModal(null); }} className="w-full flex justify-between p-4 bg-red-50 text-red-600 rounded-xl font-black text-xs uppercase hover:bg-red-600 hover:text-white transition">
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
               <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Date de début</label>
                  <input type="date" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-1 block">Date de fin</label>
                  <input type="date" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold outline-none" />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-zinc-500 mb-2 block">KPIs à inclure</label>
                  <div className="flex gap-4">
                     <label className="flex items-center gap-2 text-xs font-bold cursor-pointer"><input type="checkbox" defaultChecked /> CA Total</label>
                     <label className="flex items-center gap-2 text-xs font-bold cursor-pointer"><input type="checkbox" defaultChecked /> Transactions</label>
                     <label className="flex items-center gap-2 text-xs font-bold cursor-pointer"><input type="checkbox" /> Expirations</label>
                  </div>
               </div>
            </div>
            
            <div className="flex gap-4">
               <button onClick={() => handleExport('xls')} className="flex-1 py-4 bg-zinc-100 text-black font-black text-xs uppercase rounded-xl hover:bg-zinc-200 transition">Format XLS (CSV)</button>
               <button onClick={() => handleExport('pdf')} className="flex-1 py-4 bg-black text-white font-black text-xs uppercase rounded-xl shadow-lg hover:bg-[#39FF14] hover:text-black transition">Format PDF</button>
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
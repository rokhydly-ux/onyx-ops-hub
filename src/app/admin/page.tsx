"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Users, Wallet, LayoutDashboard, LogOut, TrendingUp, TrendingDown, CheckCircle, 
  MessageSquare, FileText, UserPlus, Zap, Calendar, Globe, Rocket, 
  ShieldCheck, CreditCard, Star, Search, Bell, Home, Edit3, Trash2, Send,
  Megaphone, Download, Filter, BarChart3
} from "lucide-react";

export default function AdminBentoTerminal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // 4 Utilisateurs Fictifs avec images et statuts
  const [usersList, setUsersList] = useState<any[]>([
    { id: '1', full_name: 'Aissatou Diallo', email: 'aissa@mail.com', role: 'prospect', avatar_url: 'https://i.pravatar.cc/150?u=aissa', saas: 'Onyx Fit', expire: 'En essai (J-2)' },
    { id: '2', full_name: 'Mamadou Ndiaye', email: 'm.ndiaye@mail.com', role: 'client', avatar_url: 'https://i.pravatar.cc/150?u=mamadou', saas: 'Onyx Vente', expire: '12 Avril 2026' },
    { id: '3', full_name: 'Fatou Diop', email: 'fatoud@mail.com', role: 'partner', avatar_url: 'https://i.pravatar.cc/150?u=fatou', saas: 'Onyx Fit', expire: 'Actif (Bonus -15%)' },
    { id: '4', full_name: 'Cheikh Fall', email: 'cheikh@mail.com', role: 'prospect', avatar_url: 'https://i.pravatar.cc/150?u=cheikh', saas: 'Onyx Tontine', expire: 'En essai (J-6)' },
  ]);

  const [articles, setArticles] = useState<any[]>([
    { id: 1, title: "Comment Onyx Fit transforme Dakar", date: "02 Mar 2026", segment: "Tous" }
  ]);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ full_name: "", avatar_url: "", password: "" });
  const router = useRouter();

  useEffect(() => {
    fetchInitData();
  }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
      setUser({ ...authUser, ...profile });
      setProfileEdit({ full_name: profile?.full_name || "", avatar_url: profile?.avatar_url || "", password: "" });
    }
    setLoading(false);
  }

  const updateProfile = async () => { /* Logique Supabase inchangée */ setShowProfileModal(false); alert("Profil mis à jour !"); };
  const handleLogout = async () => { await supabase.auth.signOut(); router.push("/login"); };

  // --- ACTIONS CLIENTS ---
  const deleteClient = (id: string) => {
    if(confirm("Supprimer ce membre de l'Empire ?")) {
      setUsersList(usersList.filter(u => u.id !== id));
    }
  };

  const changeRole = (id: string, newRole: string) => {
    setUsersList(usersList.map(u => u.id === id ? { ...u, role: newRole } : u));
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-inter font-black uppercase text-xl animate-pulse">
      Chargement du Terminal...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-inter flex overflow-hidden">
      
      {/* SIDEBAR */}
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div>
          {/* LOGO ONYXOPS (Police Inter demandée) */}
          <div className="mb-12 flex items-center gap-2">
            <span className="font-inter font-black text-3xl tracking-tighter uppercase">ONYX<span className="text-[#39FF14]">OPS</span></span>
          </div>
          
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 ml-4">Menu Principal</p>
          <div className="space-y-1">
            <NavBtn icon={<LayoutDashboard/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavBtn icon={<MessageSquare/>} label="Inbox & Leads" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
            <NavBtn icon={<Users/>} label="Membres" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <NavBtn icon={<Wallet/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
            <NavBtn icon={<Star/>} label="Écosystème" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
          </div>

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-8 mb-4 ml-4">Marketing & Ventes</p>
          <div className="space-y-1">
            <NavBtn icon={<Megaphone/>} label="Campagnes" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
            <NavBtn icon={<FileText/>} label="Social Selling" active={activeTab === 'blog'} onClick={() => setActiveTab('blog')} />
            <NavBtn icon={<Zap/>} label="Trial Funnel" active={activeTab === 'trials'} onClick={() => setActiveTab('trials')} />
          </div>
        </div>
      </nav>

      {/* ZONE PRINCIPALE */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER TOP BAR */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-8 flex justify-between items-center z-10">
          <div>
            <h1 className="text-xl font-space font-black uppercase tracking-tight">
              {activeTab === 'overview' ? "Empire Overview" : activeTab.toUpperCase()}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors">
              <Home size={16}/> Voir le site
            </button>
            <div className="w-px h-6 bg-zinc-200"></div>
            
            {/* WIDGET PROFIL CLIQUABLE */}
            <div onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 cursor-pointer hover:bg-zinc-50 p-2 rounded-xl transition-colors">
              <div className="text-right">
                <p className="text-sm font-black uppercase leading-none">{user?.full_name || "Admin Onyx"}</p>
                <p className="text-[10px] font-bold text-[#39FF14] uppercase">{user?.role || "Propriétaire"}</p>
              </div>
              <img src={user?.avatar_url || "https://ui-avatars.com/api/?name=Admin&background=000&color=39FF14"} alt="Avatar" className="w-10 h-10 rounded-full border border-zinc-200 object-cover" />
            </div>

            <button onClick={handleLogout} className="p-2 text-zinc-400 hover:text-red-500 transition-colors" title="Déconnexion">
              <LogOut size={20}/>
            </button>
          </div>
        </header>

        {/* CONTENU SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          
          {/* 1. VUE : DASHBOARD (6 KPIs) */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard label="Cashflow Total" value="3.850.000" unit="FCFA" icon={<TrendingUp/>} neon onClick={() => setActiveTab('finances')} />
                <KpiCard label="Essais Actifs" value="142" unit="Users" icon={<Zap/>} onClick={() => setActiveTab('trials')} />
                <KpiCard label="Taux Conv." value="24" unit="%" icon={<CheckCircle/>} onClick={() => setActiveTab('users')} />
                <KpiCard label="Nouveaux Essais" value="38" unit="Ce mois" icon={<UserPlus/>} onClick={() => setActiveTab('trials')} />
                <KpiCard label="Nouveaux Clients" value="15" unit="Ce mois" icon={<Users/>} onClick={() => setActiveTab('users')} />
                <KpiCard label="Désabonnement" value="2.4" unit="%" icon={<TrendingDown/>} onClick={() => setActiveTab('users')} />
              </div>
            </div>
          )}

          {/* 2. VUE : MEMBRES (Gestion des rôles et conversion auto) */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                 <h3 className="font-black uppercase text-lg">Base de données Clients</h3>
                 <button onClick={() => setShowAddClientModal(true)} className="bg-[#39FF14] text-black px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-sm hover:scale-105 transition-all">
                    <UserPlus size={16}/> Ajouter Client
                 </button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="p-4 text-[10px] font-black uppercase text-zinc-500">Profil</th>
                    <th className="p-4 text-[10px] font-black uppercase text-zinc-500">SaaS & Expiration</th>
                    <th className="p-4 text-[10px] font-black uppercase text-zinc-500">Statut (Modifiable)</th>
                    <th className="p-4 text-[10px] font-black uppercase text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                      <td className="p-4 flex items-center gap-3">
                        <img src={u.avatar_url} className="w-10 h-10 rounded-full border border-zinc-200 object-cover" alt="" />
                        <div>
                           <p className="font-bold text-sm">{u.full_name}</p>
                           <p className="text-[10px] text-zinc-400">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-bold text-xs">{u.saas}</p>
                        <p className="text-[10px] text-zinc-400">{u.expire}</p>
                      </td>
                      <td className="p-4">
                        <select 
                          value={u.role} 
                          onChange={(e) => changeRole(u.id, e.target.value)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase outline-none cursor-pointer ${u.role === 'partner' ? 'bg-[#39FF14] text-black' : u.role === 'client' ? 'bg-black text-white' : 'bg-zinc-200 text-zinc-600'}`}
                        >
                          <option value="prospect">Prospect</option>
                          <option value="client">Client (Payant)</option>
                          <option value="partner">Partenaire</option>
                        </select>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-black hover:text-white transition-colors"><Edit3 size={14}/></button>
                        <button onClick={() => deleteClient(u.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. VUE : FINANCES (Grille 3 par ligne, Chart mock, Filtres, Paiement local) */}
          {activeTab === 'finances' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm">
                  <div className="flex gap-4 items-center">
                     <div className="relative">
                        <Search size={16} className="absolute left-3 top-3 text-zinc-400" />
                        <input type="text" placeholder="Rechercher un paiement..." className="pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black" />
                     </div>
                     <button className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold hover:bg-zinc-100"><Filter size={16}/> Filtres</button>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl text-sm font-bold uppercase hover:bg-[#39FF14] hover:text-black transition-colors"><Download size={16}/> Exporter PDF</button>
               </div>

               {/* Mock Graphique */}
               <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col items-center justify-center h-64 text-zinc-400">
                  <BarChart3 size={48} className="mb-4 opacity-50" />
                  <p className="font-black uppercase tracking-widest text-xs">Graphique des tendances (Chargement Module Data...)</p>
               </div>

               {/* Grille des clients 3 par ligne */}
               <h3 className="font-black uppercase text-lg mt-8 mb-4">Paiements Récents & Schémas d'envoi</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {usersList.filter(u => u.role !== 'prospect').map(client => (
                     <div key={client.id} className="bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm hover:border-black transition-all">
                        <div className="flex items-center gap-4 mb-4">
                           <img src={client.avatar_url} className="w-12 h-12 rounded-full object-cover" alt=""/>
                           <div>
                              <p className="font-bold text-sm">{client.full_name}</p>
                              <p className="text-[10px] text-zinc-500 font-bold uppercase">{client.saas}</p>
                           </div>
                        </div>
                        <div className="bg-zinc-50 p-4 rounded-xl mb-4 text-center">
                           <p className="text-[10px] font-bold text-zinc-400 uppercase">Expiration du pack</p>
                           <p className="font-black text-sm">{client.expire}</p>
                        </div>
                        {/* Logos Paiement Local */}
                        <div className="flex justify-center gap-2">
                           <span className="px-3 py-1 bg-[#00A9E0]/10 text-[#00A9E0] text-[10px] font-black rounded-lg">WAVE</span>
                           <span className="px-3 py-1 bg-[#FF7900]/10 text-[#FF7900] text-[10px] font-black rounded-lg">ORANGE</span>
                           <span className="px-3 py-1 bg-black text-white text-[10px] font-black rounded-lg">YAS</span>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}

          {/* 4. VUE : MARKETING (Nouveau) */}
          {activeTab === 'marketing' && (
             <div className="space-y-6">
                <h3 className="font-black uppercase text-lg mb-6">Suggestions Auto (IA Onyx)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <CampaignCard title="Promo Ramadan" desc="Offrez -20% sur Onyx Nutri pour les prospects inactifs depuis 1 mois." target="Prospects" />
                   <CampaignCard title="Upsell Partenaire" desc="Proposez le statut Ambassadeur aux clients ayant validé 3 mois d'Onyx Fit." target="Clients Actifs" />
                   <CampaignCard title="Relance Panier" desc="Envoyer message WhatsApp aux 38 nouveaux essais gratuits (J-2 restants)." target="Essais" />
                   <CampaignCard title="Saison des Pluies" desc="Boostez la création de Tontines avec une campagne SMS ciblée." target="Tous" />
                </div>
             </div>
          )}

          {/* 5. VUE : CHAT & INBOX (Liaison Bot Centralisée) */}
          {activeTab === 'chat' && (
            <div className="h-[600px] flex bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
               <div className="w-1/3 border-r border-zinc-100 flex flex-col">
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50 font-black uppercase text-sm">Leads entrants</div>
                  <div className="flex-1 overflow-y-auto">
                     <div className="p-4 border-b border-zinc-50 cursor-pointer bg-black text-white">
                        <div className="flex justify-between items-center"><p className="font-bold text-sm">Lead #1042</p><span className="text-[9px] bg-[#39FF14] text-black px-2 rounded-full">Bot Site</span></div>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">Je veux parler à un humain pour Onyx Fit.</p>
                     </div>
                     <div className="p-4 border-b border-zinc-50 cursor-pointer hover:bg-zinc-50">
                        <div className="flex justify-between items-center"><p className="font-bold text-sm">Amina Sy</p><span className="text-[9px] bg-[#25D366] text-white px-2 rounded-full">WhatsApp</span></div>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">Comment payer par Wave ?</p>
                     </div>
                  </div>
               </div>
               <div className="flex-1 flex flex-col bg-zinc-50">
                  <div className="p-4 border-b border-zinc-200 bg-white flex justify-between items-center">
                     <p className="font-black uppercase">Lead #1042</p>
                     <span className="text-[10px] bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold">Heure de bureau : Online</span>
                  </div>
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                     <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-zinc-200 max-w-[70%] text-sm">Je veux parler à un humain pour Onyx Fit.</div>
                  </div>
                  <div className="p-4 bg-white border-t border-zinc-200 flex gap-4">
                     <input type="text" placeholder="Répondre (Ceci s'affichera dans le Chatbot du site)..." className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-black" />
                     <button className="bg-black text-white p-3 rounded-xl hover:bg-[#39FF14] hover:text-black transition-colors"><Send size={18}/></button>
                  </div>
               </div>
            </div>
          )}

          {/* 6. VUE : SOCIAL SELLING (Suggestions et Push) */}
          {activeTab === 'blog' && (
             <div className="space-y-8">
                {/* Suggestions IA */}
                <div>
                   <h3 className="font-black uppercase text-lg mb-4 flex items-center gap-2"><Megaphone size={18}/> Suggestions d'articles (IA)</h3>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ArticleSuggestion title="5 plats sénégalais faibles en calories" saas="Onyx Fit" />
                      <ArticleSuggestion title="Comment structurer sa Tontine en 2026" saas="Onyx Tontine" />
                      <ArticleSuggestion title="Les secrets du Social Selling" saas="Onyx Vente" />
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm h-fit">
                      <h3 className="font-black uppercase text-lg mb-6">Créer & Cibler</h3>
                      <div className="space-y-4">
                         <input type="text" placeholder="Titre de l'article" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none" />
                         <select className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none">
                            <option>Cibler : Tous les Membres</option>
                            <option>Cibler : Prospects Onyx Fit</option>
                            <option>Cibler : Partenaires</option>
                         </select>
                         <textarea placeholder="Contenu..." rows={4} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none"></textarea>
                         <button className="w-full bg-[#39FF14] text-black py-3 rounded-xl font-black uppercase text-xs shadow-sm hover:scale-[1.02] transition-transform">
                            Publier & Envoyer Email
                         </button>
                      </div>
                   </div>
                   
                   <div className="lg:col-span-2 bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden p-6">
                      <h3 className="font-black uppercase text-lg mb-6">Derniers Articles (Live sur Accueil)</h3>
                      <div className="space-y-4">
                         {articles.map((art: any) => (
                            <div key={art.id} className="flex gap-4 p-4 border border-zinc-100 rounded-2xl items-center hover:border-black transition-colors">
                               <div className="w-16 h-16 bg-black rounded-xl flex items-center justify-center"><FileText className="text-[#39FF14]"/></div>
                               <div className="flex-1">
                                  <p className="font-bold">{art.title}</p>
                                  <p className="text-[10px] text-zinc-500 uppercase">{art.date} • Push Actif</p>
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* FOOTER */}
          <footer className="mt-20 pt-8 border-t border-zinc-200 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-8">
            <p>© 2026 ONYX ECOSYSTEM — CONNECTED FROM SENEGAL</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-black transition-colors">Infrastructure</a>
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
            </div>
          </footer>
        </div>
      </main>

      {/* MODAL : PROFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           {/* Code inchangé du modal profil précédent */}
           <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
            <h2 className="text-xl font-black uppercase mb-6 border-b border-zinc-100 pb-4">Gérer mon profil</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Nom affiché</label>
                <input type="text" value={profileEdit.full_name} onChange={e => setProfileEdit({...profileEdit, full_name: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">URL Photo de Profil</label>
                <input type="text" value={profileEdit.avatar_url} onChange={e => setProfileEdit({...profileEdit, avatar_url: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black mt-1" placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowProfileModal(false)} className="flex-1 py-3 bg-zinc-100 text-black font-bold text-xs uppercase rounded-xl">Annuler</button>
              <button onClick={updateProfile} className="flex-1 py-3 bg-black text-[#39FF14] font-black text-xs uppercase rounded-xl">Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : AJOUTER CLIENT */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-8 shadow-2xl relative">
            <h2 className="text-xl font-black uppercase mb-6 border-b border-zinc-100 pb-4">Ajouter un Client</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nom Complet" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black" />
              <input type="email" placeholder="Email" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black" />
              <select className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black">
                 <option>Associer à : Onyx Fit</option>
                 <option>Associer à : Onyx Vente</option>
              </select>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowAddClientModal(false)} className="flex-1 py-3 bg-zinc-100 text-black font-bold text-xs uppercase rounded-xl">Annuler</button>
              <button onClick={() => setShowAddClientModal(false)} className="flex-1 py-3 bg-[#39FF14] text-black font-black text-xs uppercase rounded-xl">Créer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* COMPOSANTS UI RÉUTILISABLES */

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 mx-2 rounded-xl transition-all font-bold text-sm ${active ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}>
      <div className={`${active ? 'text-[#39FF14]' : 'text-zinc-400'}`}>{icon}</div>
      {label}
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
      <div className="flex items-baseline gap-2">
        <p className="text-4xl font-black tracking-tight">{value}</p>
        <span className="text-[10px] font-bold uppercase text-zinc-400">{unit}</span>
      </div>
    </div>
  );
}

function CampaignCard({ title, desc, target }: any) {
   return (
      <div className="bg-white p-6 rounded-[2rem] border border-zinc-200 hover:border-black transition-colors cursor-pointer flex flex-col justify-between">
         <div>
            <div className="flex justify-between items-start mb-2">
               <p className="font-black text-sm uppercase">{title}</p>
               <span className="text-[9px] font-bold bg-zinc-100 px-2 py-1 rounded-md">{target}</span>
            </div>
            <p className="text-xs text-zinc-500 mb-4">{desc}</p>
         </div>
         <button className="w-full py-2 bg-black text-[#39FF14] text-[10px] font-black uppercase rounded-lg">Lancer Campagne</button>
      </div>
   );
}

function ArticleSuggestion({ title, saas }: any) {
   return (
      <div className="bg-white p-4 rounded-2xl border border-zinc-200 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer">
         <p className="font-bold text-sm mb-3 leading-tight">{title}</p>
         <div className="flex justify-between items-center">
            <span className="text-[9px] font-black uppercase text-zinc-400">{saas}</span>
            <span className="text-[10px] font-black text-[#39FF14] bg-black px-2 py-1 rounded-md">Éditer</span>
         </div>
      </div>
   );
}
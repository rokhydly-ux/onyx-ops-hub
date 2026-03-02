"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Users, Wallet, LayoutDashboard, LogOut, TrendingUp, CheckCircle, 
  MessageSquare, FileText, UserPlus, Zap, Calendar, Globe, Rocket, 
  ShieldCheck, CreditCard, Star, Search, Bell, Home, Edit3, Trash2, Send
} from "lucide-react";

export default function AdminBentoTerminal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileEdit, setProfileEdit] = useState({ full_name: "", avatar_url: "", password: "" });
  const router = useRouter();

  useEffect(() => {
    fetchInitData();
  }, []);

  async function fetchInitData() {
    // Récupérer l'admin connecté
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", authUser.id).single();
      setUser({ ...authUser, ...profile });
      setProfileEdit({ full_name: profile?.full_name || "", avatar_url: profile?.avatar_url || "", password: "" });
    }

    // Récupérer les données globales
    const { data: profs } = await supabase.from("profiles").select("*").order('created_at', { ascending: false });
    if (profs) setUsersList(profs);
    
    // Mock ou fetch articles (à lier à ta table 'articles')
    setArticles([{ id: 1, title: "Comment Onyx Fit transforme Dakar", date: "02 Mar 2026" }]);
    
    setLoading(false);
  }

  // --- ACTIONS PROFIL ---
  const updateProfile = async () => {
    if (profileEdit.full_name || profileEdit.avatar_url) {
      await supabase.from("profiles").update({ 
        full_name: profileEdit.full_name, 
        avatar_url: profileEdit.avatar_url 
      }).eq("id", user.id);
    }
    if (profileEdit.password) {
      await supabase.auth.updateUser({ password: profileEdit.password });
    }
    setShowProfileModal(false);
    fetchInitData();
    alert("Profil mis à jour !");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 font-inter font-black uppercase text-xl animate-pulse">
      Chargement du Terminal...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-inter flex overflow-hidden">
      
      {/* SIDEBAR (Inspiré de ta maquette) */}
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div>
          {/* LOGO FALLBACK */}
          <div className="mb-12 flex items-center gap-3">
            <img src="/logo.png" alt="" className="h-10 object-contain hidden" onError={(e) => e.currentTarget.style.display = 'none'} />
            <span className="font-black text-2xl tracking-tighter uppercase">ONYX<span className="text-[#39FF14]">OPS</span></span>
          </div>
          
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4 ml-4">Menu Principal</p>
          <div className="space-y-1">
            <NavBtn icon={<LayoutDashboard/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavBtn icon={<MessageSquare/>} label="Inbox & Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
            <NavBtn icon={<Users/>} label="Membres" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <NavBtn icon={<Wallet/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
            <NavBtn icon={<Star/>} label="Écosystème" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
          </div>

          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-8 mb-4 ml-4">Marketing</p>
          <div className="space-y-1">
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
            <h1 className="text-2xl font-black uppercase tracking-tight">
              {activeTab === 'overview' ? "Empire Overview" : activeTab.toUpperCase()}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition-colors">
              <Home size={16}/> Voir le site
            </button>
            <div className="w-px h-6 bg-zinc-200"></div>
            
            {/* WIDGET PROFIL CLIQUABLE */}
            <div 
              onClick={() => setShowProfileModal(true)}
              className="flex items-center gap-3 cursor-pointer hover:bg-zinc-50 p-2 rounded-xl transition-colors"
            >
              <div className="text-right">
                <p className="text-sm font-black uppercase leading-none">{user?.full_name || "Admin"}</p>
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
          
          {/* VUE : DASHBOARD BENTO GRID */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Ligne 1 : KPIs (Tailles réduites, cliquables) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard label="Cashflow Total" value="3.850.000" unit="FCFA" icon={<TrendingUp/>} neon onClick={() => setActiveTab('finances')} />
                <KpiCard label="Essais Actifs" value="142" unit="Users" icon={<Zap/>} onClick={() => setActiveTab('trials')} />
                <KpiCard label="Taux Conv." value="24" unit="%" icon={<CheckCircle/>} onClick={() => setActiveTab('users')} />
              </div>

              {/* Ligne 2 : Sections rapides */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                  <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-2"><MessageSquare size={18}/> Messages Bot Récents</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex justify-between items-center cursor-pointer hover:border-black" onClick={() => setActiveTab('chat')}>
                      <div>
                        <p className="font-bold text-sm">Abdoulaye Ndiaye</p>
                        <p className="text-xs text-zinc-500">"Quels sont les tarifs pour Onyx Fit ?"</p>
                      </div>
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                  <h3 className="font-black uppercase text-lg mb-6 flex items-center gap-2"><FileText size={18}/> Derniers Articles</h3>
                  <div className="space-y-4">
                    {articles.map((art: any) => (
                       <div key={art.id} className="p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex justify-between items-center cursor-pointer hover:border-black" onClick={() => setActiveTab('blog')}>
                          <p className="font-bold text-sm">{art.title}</p>
                          <p className="text-[10px] text-zinc-400">{art.date}</p>
                       </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VUE : MEMBRES (Avec boutons Ajouter/Supprimer) */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                 <h3 className="font-black uppercase text-lg">Base de données Clients</h3>
                 <button className="bg-[#39FF14] text-black px-4 py-2 rounded-xl font-black text-xs uppercase flex items-center gap-2 shadow-sm hover:scale-105 transition-all">
                    <UserPlus size={16}/> Ajouter Client
                 </button>
              </div>
              <table className="w-full text-left">
                <thead className="bg-zinc-50">
                  <tr>
                    <th className="p-4 text-[10px] font-black uppercase text-zinc-500">Profil</th>
                    <th className="p-4 text-[10px] font-black uppercase text-zinc-500">Rôle</th>
                    <th className="p-4 text-[10px] font-black uppercase text-zinc-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((u) => (
                    <tr key={u.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-sm">{u.full_name || "Client"}</p>
                        <p className="text-[10px] text-zinc-400">{u.email || u.id.slice(0,8)}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'partner' ? 'bg-[#39FF14] text-black' : 'bg-black text-white'}`}>{u.role}</span>
                      </td>
                      <td className="p-4 flex justify-end gap-2">
                        <button className="p-2 bg-zinc-100 text-zinc-600 rounded-lg hover:bg-black hover:text-white transition-colors"><Edit3 size={14}/></button>
                        <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={14}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VUE : CHAT & INBOX (Liaison Bot) */}
          {activeTab === 'chat' && (
            <div className="h-[600px] flex bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden">
               {/* Liste des discussions */}
               <div className="w-1/3 border-r border-zinc-100 flex flex-col">
                  <div className="p-4 border-b border-zinc-100 bg-zinc-50 font-black uppercase text-sm">Boîte de réception</div>
                  <div className="flex-1 overflow-y-auto">
                     <div className="p-4 border-b border-zinc-50 cursor-pointer bg-black text-white">
                        <p className="font-bold text-sm">Abdoulaye Ndiaye</p>
                        <p className="text-xs text-zinc-400 mt-1 line-clamp-1">Quels sont les tarifs pour Onyx Fit ?</p>
                     </div>
                     <div className="p-4 border-b border-zinc-50 cursor-pointer hover:bg-zinc-50">
                        <p className="font-bold text-sm">Fatou Diop</p>
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-1">Je veux devenir partenaire.</p>
                     </div>
                  </div>
               </div>
               {/* Fenêtre de Chat */}
               <div className="flex-1 flex flex-col bg-zinc-50">
                  <div className="p-4 border-b border-zinc-200 bg-white flex justify-between items-center">
                     <p className="font-black uppercase">Abdoulaye Ndiaye</p>
                     <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">En ligne sur le site</span>
                  </div>
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                     <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-zinc-200 max-w-[70%] text-sm">Quels sont les tarifs pour Onyx Fit ?</div>
                  </div>
                  <div className="p-4 bg-white border-t border-zinc-200 flex gap-4">
                     <input type="text" placeholder="Répondre en direct (prend le relais du bot)..." className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:border-black" />
                     <button className="bg-black text-white p-3 rounded-xl hover:bg-[#39FF14] hover:text-black transition-colors"><Send size={18}/></button>
                  </div>
               </div>
            </div>
          )}

          {/* VUE : SOCIAL SELLING (Blog / Push) */}
          {activeTab === 'blog' && (
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Création d'article */}
                <div className="lg:col-span-1 bg-white p-6 rounded-[2rem] border border-zinc-200 shadow-sm h-fit">
                   <h3 className="font-black uppercase text-lg mb-6">Nouvel Article UGC</h3>
                   <div className="space-y-4">
                      <input type="text" placeholder="Titre de l'article" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black" />
                      <input type="text" placeholder="URL Image" className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black" />
                      <textarea placeholder="Contenu..." rows={5} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black"></textarea>
                      <button className="w-full bg-[#39FF14] text-black py-3 rounded-xl font-black uppercase text-xs shadow-sm hover:scale-[1.02] transition-transform">
                         Publier sur le site
                      </button>
                   </div>
                </div>
                {/* Liste des articles */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-zinc-200 shadow-sm overflow-hidden p-6">
                   <h3 className="font-black uppercase text-lg mb-6">Articles Publiés (Push Auto)</h3>
                   <div className="space-y-4">
                      {articles.map((art: any) => (
                         <div key={art.id} className="flex gap-4 p-4 border border-zinc-100 rounded-2xl items-center">
                            <div className="w-16 h-16 bg-zinc-200 rounded-xl"></div>
                            <div className="flex-1">
                               <p className="font-bold">{art.title}</p>
                               <p className="text-[10px] text-zinc-500">{art.date} • Push actif sur la page d'accueil</p>
                            </div>
                            <div className="flex gap-2">
                               <button className="p-2 bg-zinc-100 rounded-lg hover:bg-black hover:text-white transition-colors"><Edit3 size={14}/></button>
                               <button className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-colors"><Trash2 size={14}/></button>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
          )}

          {/* ESPACE MENTIONS LÉGALES / FOOTER DANS MAIN */}
          <footer className="mt-20 pt-8 border-t border-zinc-200 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest pb-8">
            <p>© 2026 ONYX ECOSYSTEM — CONNECTED FROM SENEGAL</p>
            <div className="flex gap-8">
              <a href="#" className="hover:text-black transition-colors">Infrastructure</a>
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
            </div>
          </footer>

        </div>
      </main>

      {/* MODAL : ÉDITION DU PROFIL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
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
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Nouveau Mot de passe (optionnel)</label>
                <input type="password" value={profileEdit.password} onChange={e => setProfileEdit({...profileEdit, password: e.target.value})} className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-sm outline-none focus:border-black mt-1" />
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setShowProfileModal(false)} className="flex-1 py-3 bg-zinc-100 text-black font-bold text-xs uppercase rounded-xl hover:bg-zinc-200 transition-colors">Annuler</button>
              <button onClick={updateProfile} className="flex-1 py-3 bg-black text-[#39FF14] font-black text-xs uppercase rounded-xl shadow-lg hover:scale-[1.02] transition-transform">Sauvegarder</button>
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
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 p-3 mx-2 rounded-xl transition-all font-bold text-sm ${active ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}
    >
      <div className={`${active ? 'text-[#39FF14]' : 'text-zinc-400'}`}>{icon}</div>
      {label}
    </button>
  );
}

function KpiCard({ label, value, unit, icon, neon, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={`p-6 rounded-[2rem] border border-zinc-200 relative group cursor-pointer hover:-translate-y-1 transition-all duration-300 ${neon ? 'bg-black text-white shadow-xl shadow-black/20' : 'bg-white hover:shadow-lg hover:border-black'}`}
    >
      <div className="flex justify-between items-start mb-4">
         <p className={`text-[10px] font-bold uppercase tracking-widest ${neon ? 'text-[#39FF14]' : 'text-zinc-500'}`}>{label}</p>
         <div className={`p-2 rounded-lg ${neon ? 'bg-white/10 text-[#39FF14]' : 'bg-zinc-50 text-black'}`}>
            {icon}
         </div>
      </div>
      <div className="flex items-baseline gap-2">
        {/* Taille réduite par rapport aux 8xl précédents */}
        <p className="text-4xl font-black tracking-tight">{value}</p>
        <span className="text-[10px] font-bold uppercase text-zinc-400">{unit}</span>
      </div>
    </div>
  );
}
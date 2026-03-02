"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { supabaseAdmin } from "../../lib/supabaseAdmin";
import { useRouter } from "next/navigation";
import { 
  Users, Handshake, Wallet, LayoutGrid, 
  LogOut, TrendingUp, CheckCircle, Search, 
  ArrowUpRight, CreditCard
} from "lucide-react";

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [finances, setFinances] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalRevenue: 0, totalUsers: 0, activeSaaS: 0 });
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
    fetchAdminData();
  }, []);

  // Vérification stricte du rôle Admin
  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/login");
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== 'admin') router.push("/dashboard");
  };

  const fetchAdminData = async () => {
    setLoading(true);
    // Récupération des utilisateurs
    const { data: profs } = await supabaseAdmin.from("profiles").select("*").order('created_at', { ascending: false });
    // Récupération fictive des finances (à lier à ta table subscriptions)
    const { data: subs } = await supabaseAdmin.from("subscriptions").select("*");
    
    if (profs) setUsers(profs);
    if (subs) {
      setFinances(subs);
      const revenue = subs.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
      setStats({ totalRevenue: revenue, totalUsers: profs?.length || 0, activeSaaS: 3 });
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-['Space_Grotesk'] font-black uppercase italic animate-pulse text-4xl">
      Syncing Onyx Systems...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-['Inter'] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        
        {/* BARRE LATÉRALE (SIDEBAR) */}
        <nav className="w-80 border-r border-zinc-100 p-8 flex flex-col justify-between hidden md:flex bg-white">
          <div className="space-y-10">
            {/* LOGO 350x250 */}
            <div className="flex justify-center mb-10">
              <img src="/logo-onyx.png" alt="Onyx Logo" width={350} height={250} className="object-contain" />
            </div>

            <div className="space-y-2">
              <NavButton icon={<LayoutGrid size={20}/>} label="Vue d'ensemble" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <NavButton icon={<Users size={20}/>} label="Utilisateurs" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
              <NavButton icon={<Wallet size={20}/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
              <NavButton icon={<Handshake size={20}/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
            </div>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-4 p-5 rounded-[2rem] bg-zinc-50 hover:bg-black hover:text-[#39FF14] transition-all font-black uppercase text-[10px] tracking-widest">
            <LogOut size={18} /> Déconnexion
          </button>
        </nav>

        {/* CONTENU PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-8 md:p-16">
          
          {/* HEADER DYNAMIQUE */}
          <header className="flex justify-between items-end mb-16">
            <div>
              <h1 className="text-6xl font-['Space_Grotesk'] font-black uppercase leading-none tracking-tighter">
                {activeTab === 'overview' && "Console"}
                {activeTab === 'users' && "Membres"}
                {activeTab === 'finances' && "Cashflow"}
                {activeTab === 'partners' && "Ambassadeurs"}
              </h1>
              <p className="mt-4 text-[#39FF14] bg-black inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                Onyx Ops Terminal v2.0
              </p>
            </div>
          </header>

          {/* VUE : OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Chiffre d'Affaires" value={`${stats.totalRevenue}€`} sub="+12% ce mois" icon={<TrendingUp size={24}/>} color="#39FF14" />
                <StatCard label="Membres Totaux" value={stats.totalUsers} sub="Utilisateurs actifs" icon={<Users size={24}/>} color="black" />
                <StatCard label="SaaS Opérationnels" value={stats.activeSaaS} sub="Fit / Vente / Tontine" icon={<CheckCircle size={24}/>} color="black" />
              </div>

              {/* SECTION DERNIERS PAIEMENTS */}
              <div className="bg-zinc-50 p-12 rounded-[3rem]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-['Space_Grotesk'] font-black uppercase text-xl">Flux Financiers Récents</h3>
                  <button onClick={() => setActiveTab('finances')} className="text-[10px] font-black uppercase border-b-2 border-black pb-1">Voir tout</button>
                </div>
                <div className="space-y-4">
                  {finances.slice(0, 3).map((sub: any) => (
                    <div key={sub.id} className="flex justify-between items-center p-6 bg-white rounded-3xl border border-zinc-100 hover:border-black transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center"><CreditCard size={20}/></div>
                         <div>
                            <p className="font-black text-sm uppercase">{sub.plan_name || "Pack Onyx"}</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase">{new Date(sub.created_at).toLocaleDateString()}</p>
                         </div>
                      </div>
                      <p className="font-black text-xl">+{sub.amount}€</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VUE : USERS TABLE */}
          {(activeTab === 'users' || activeTab === 'partners') && (
            <div className="bg-white rounded-[3rem] border-2 border-zinc-100 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-zinc-50">
                  <tr className="border-b border-zinc-100">
                    <th className="p-8 font-black uppercase text-[10px] text-zinc-400">Identité</th>
                    <th className="p-8 font-black uppercase text-[10px] text-zinc-400">Rôle Actuel</th>
                    <th className="p-8 font-black uppercase text-[10px] text-zinc-400 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-all">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <img src={u.avatar_url} className="w-12 h-12 rounded-full border border-zinc-200" alt="" />
                          <div>
                            <p className="font-black text-sm uppercase">{u.full_name || "Anonyme"}</p>
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tighter italic">{u.id.slice(0,12)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                         <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-black text-[#39FF14]' : 'bg-zinc-200'}`}>
                           {u.role}
                         </span>
                      </td>
                      <td className="p-8 text-right">
                        {u.role === 'user' && (
                          <button className="bg-black text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase hover:bg-[#39FF14] hover:text-black transition-all">
                            Désigner Ambassadeur
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="p-8 border-t border-zinc-100 bg-white flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
        <div>© 2026 Onyx Ecosystem — Tous droits réservés</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-black">Privacy</a>
          <a href="#" className="hover:text-black">Security</a>
        </div>
      </footer>
    </div>
  );
}

// COMPOSANTS UI
function NavButton({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all font-black uppercase text-[11px] tracking-wider ${active ? 'bg-black text-[#39FF14]' : 'hover:bg-zinc-100 text-zinc-400'}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, sub, icon, color }: any) {
  return (
    <div className="p-10 bg-zinc-50 rounded-[3rem] border border-zinc-100 relative group hover:border-black transition-all">
      <div className="absolute top-10 right-10" style={{ color }}>{icon}</div>
      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">{label}</p>
      <p className="text-6xl font-['Space_Grotesk'] font-black tracking-tighter leading-none mb-4">{value}</p>
      <p className="text-[10px] font-bold text-zinc-400 uppercase italic">{sub}</p>
    </div>
  );
}
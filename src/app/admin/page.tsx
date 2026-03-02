"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Users, Wallet, LayoutGrid, LogOut, 
  TrendingUp, CheckCircle, CreditCard, 
  Handshake, ArrowUpRight, ShieldCheck 
} from "lucide-react";

export default function AdminConsole() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({ revenue: 0, members: 0, partners: 0 });
  const router = useRouter();

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    setLoading(true);
    // 1. Récupération des membres
    const { data: profiles } = await supabase.from("profiles").select("*").order('created_at', { ascending: false });
    
    // 2. Récupération des paiements (table subscriptions)
    const { data: subs } = await supabase.from("subscriptions").select("*").order('created_at', { ascending: false });

    if (profiles) {
      setUsers(profiles);
      const partners = profiles.filter(p => p.role === 'partner').length;
      setStats(prev => ({ ...prev, members: profiles.length, partners }));
    }

    if (subs) {
      setPayments(subs);
      const total = subs.reduce((acc, curr) => acc + (curr.amount || 0), 0);
      setStats(prev => ({ ...prev, revenue: total }));
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-['var(--font-space)'] font-black uppercase italic animate-pulse text-2xl">
      Initialisation du Terminal Onyx...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-['var(--font-inter)'] flex flex-col">
      
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <nav className="w-80 border-r border-zinc-100 p-8 flex flex-col justify-between hidden lg:flex">
          <div className="space-y-12">
            {/* LOGO 350x250 */}
            <div className="flex justify-center">
              <img src="/logo.png" alt="Onyx Logo" width={350} height={250} className="object-contain" />
            </div>

            <div className="space-y-2">
              <MenuBtn icon={<LayoutGrid size={20}/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <MenuBtn icon={<Users size={20}/>} label="Membres" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
              <MenuBtn icon={<Wallet size={20}/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
              <MenuBtn icon={<Handshake size={20}/>} label="Ambassadeurs" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
            </div>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-4 p-5 rounded-[2rem] bg-zinc-50 hover:bg-black hover:text-[#39FF14] transition-all font-black uppercase text-[10px] tracking-widest group">
            <LogOut size={18} className="group-hover:rotate-180 transition-transform" /> Quitter le système
          </button>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 md:p-16">
          
          {/* HEADER */}
          <header className="flex justify-between items-end mb-16">
            <div>
              <h1 className="text-7xl font-['var(--font-space)'] font-black uppercase leading-none tracking-tighter">
                {activeTab === 'overview' && "Onyx Hub"}
                {activeTab === 'users' && "Community"}
                {activeTab === 'finances' && "Revenue"}
                {activeTab === 'partners' && "Partners"}
              </h1>
              <div className="mt-4 flex items-center gap-3">
                <span className="w-2 h-2 bg-[#39FF14] rounded-full animate-ping"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Admin Session Active</p>
              </div>
            </div>
          </header>

          {/* VUE : OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <CardStat label="Revenu Total" value={`${stats.revenue}€`} sub="Flux SaaS combinés" icon={<TrendingUp size={24}/>} neon />
                <CardStat label="Total Membres" value={stats.members} sub="Inscriptions Onyx" icon={<Users size={24}/>} />
                <CardStat label="Ambassadeurs" value={stats.partners} sub="Codes actifs" icon={<ShieldCheck size={24}/>} />
              </div>

              {/* FINANCES RAPIDES */}
              <div className="bg-zinc-50 p-12 rounded-[3rem] border border-zinc-100">
                <h3 className="font-['var(--font-space)'] font-black uppercase text-2xl mb-8">Flux de Trésorerie</h3>
                <div className="space-y-4">
                  {payments.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex justify-between items-center p-6 bg-white rounded-3xl border border-zinc-50 shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-black text-[#39FF14] rounded-full flex items-center justify-center"><CreditCard size={20}/></div>
                        <p className="font-black text-sm uppercase italic">{p.plan_name || "Pack Elite"}</p>
                      </div>
                      <p className="font-['var(--font-space)'] font-black text-xl">+{p.amount}€</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VUE : USERS / PARTNERS */}
          {(activeTab === 'users' || activeTab === 'partners') && (
            <div className="bg-white rounded-[3rem] border-2 border-zinc-100 overflow-hidden shadow-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-100">
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">Profil</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">Statut Rôle</th>
                    <th className="p-8 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Gestion</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => activeTab === 'partners' ? u.role === 'partner' : true).map((u) => (
                    <tr key={u.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-all group">
                      <td className="p-8">
                        <div className="flex items-center gap-4">
                          <img src={u.avatar_url} className="w-14 h-14 rounded-full border-2 border-zinc-100 group-hover:border-black transition-all" alt="" />
                          <div>
                            <p className="font-black text-sm uppercase">{u.full_name || "Membre Onyx"}</p>
                            <p className="text-[10px] text-zinc-400 font-bold tracking-tighter italic">UID: {u.id.slice(0,12)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase ${u.role === 'admin' ? 'bg-black text-[#39FF14]' : 'bg-zinc-200'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-8 text-right">
                        <button className="p-3 bg-zinc-50 rounded-2xl hover:bg-black hover:text-white transition-all">
                          <ArrowUpRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* VUE : FINANCES COMPLÈTES */}
          {activeTab === 'finances' && (
             <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="p-12 bg-black rounded-[3rem] text-white">
                      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#39FF14] mb-4">Balance Totale</p>
                      <h2 className="text-7xl font-['var(--font-space)'] font-black leading-none">{stats.revenue}€</h2>
                   </div>
                </div>
                {/* Liste détaillée des transactions */}
                <div className="space-y-4">
                   {payments.map(p => (
                      <div key={p.id} className="p-8 border-2 border-zinc-100 rounded-[2.5rem] flex justify-between items-center">
                         <div>
                            <p className="font-black uppercase text-lg italic">{p.plan_name}</p>
                            <p className="text-xs font-bold text-zinc-400 uppercase">{new Date(p.created_at).toLocaleDateString('fr-FR')}</p>
                         </div>
                         <div className="text-right">
                            <p className="font-black text-2xl">+{p.amount}€</p>
                            <p className="text-[10px] font-black uppercase text-[#39FF14] bg-black px-3 py-1 rounded-full mt-2">Succès</p>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="p-10 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 bg-white">
        <p>© 2026 ONYX OPS — CONNECTED ECOSYSTEM</p>
        <div className="flex gap-12">
          <a href="#" className="hover:text-black transition-colors">Infrastructure</a>
          <a href="#" className="hover:text-black transition-colors">Security</a>
          <a href="#" className="hover:text-black transition-colors">Legal</a>
        </div>
      </footer>
    </div>
  );
}

/* COMPOSANTS UI RÉUTILISABLES */

function MenuBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all font-black uppercase text-[11px] tracking-widest ${active ? 'bg-black text-[#39FF14] shadow-xl' : 'text-zinc-400 hover:bg-zinc-50 hover:text-black'}`}>
      {icon} {label}
    </button>
  );
}

function CardStat({ label, value, sub, icon, neon }: any) {
  return (
    <div className={`p-10 rounded-[3rem] border border-zinc-100 relative group transition-all hover:scale-[1.02] ${neon ? 'bg-black text-white' : 'bg-zinc-50'}`}>
      <div className={`absolute top-10 right-10 ${neon ? 'text-[#39FF14]' : 'text-zinc-300'}`}>{icon}</div>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${neon ? 'text-[#39FF14]' : 'text-zinc-400'}`}>{label}</p>
      <p className="text-6xl font-['var(--font-space)'] font-black tracking-tighter leading-none mb-4">{value}</p>
      <p className="text-[10px] font-bold uppercase italic opacity-50">{sub}</p>
    </div>
  );
}
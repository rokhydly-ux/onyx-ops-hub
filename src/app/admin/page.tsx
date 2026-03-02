"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Users, Wallet, LayoutGrid, LogOut, TrendingUp, CheckCircle, 
  MessageSquare, FileText, UserPlus, Zap, Gift, Calendar, 
  Globe, Rocket, ShieldCheck, CreditCard, ChevronRight, Star
} from "lucide-react";

export default function AdminFinalTerminal() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const router = useRouter();

  // ÉCOSYSTÈME COMPLET (9 SERVICES)
  const ecosystem = [
    { name: "Staff Booking", icon: <Calendar size={22}/>, status: "Live" },
    { name: "Onyx Agency", icon: <Globe size={22}/>, status: "Live" },
    { name: "SaaS Builder", icon: <Rocket size={22}/>, status: "Ready" },
    { name: "Social Selling", icon: <FileText size={22}/>, status: "Live" },
    { name: "Onyx Ads", icon: <TrendingUp size={22}/>, status: "Live" },
    { name: "Onyx CRM", icon: <Users size={22}/>, status: "Live" },
    { name: "Onyx Fit", icon: <ShieldCheck size={22} className="text-[#39FF14]"/>, status: "New" },
    { name: "Onyx Vente", icon: <CreditCard size={22} className="text-[#39FF14]"/>, status: "New" },
    { name: "Onyx Tontine", icon: <Wallet size={22} className="text-[#39FF14]"/>, status: "New" },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const { data } = await supabase.from("profiles").select("*").order('created_at', { ascending: false });
    if (data) setUsers(data);
    setLoading(false);
  }

  // LOGIQUE : Transformer Client en Partenaire avec Remises
  const togglePartner = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'partner' ? 'user' : 'partner';
    await supabase.from("profiles").update({ role: newRole }).eq("id", userId);
    fetchUsers();
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-space font-black uppercase italic animate-pulse text-5xl tracking-tighter">
      ONYX_CORE_SYNCING...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-inter flex overflow-hidden">
      
      {/* SIDEBAR ULTRA-MODERNE */}
      <nav className="w-80 border-r border-zinc-100 p-8 flex flex-col justify-between hidden lg:flex bg-white">
        <div className="space-y-12">
          <img src="/logo.png" alt="Onyx" width={350} height={250} className="object-contain" />
          
          <div className="space-y-1">
            <NavBtn icon={<LayoutGrid/>} label="Vue Globale" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
            <NavBtn icon={<Zap/>} label="Trial Funnel" active={activeTab === 'trials'} onClick={() => setActiveTab('trials')} />
            <NavBtn icon={<Users/>} label="Membres" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
            <NavBtn icon={<Wallet/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
            <NavBtn icon={<Star/>} label="Écosystème" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
          </div>
        </div>

        <button onClick={() => { supabase.auth.signOut(); router.push("/login"); }} className="flex items-center gap-4 p-5 rounded-[2.5rem] bg-zinc-50 hover:bg-black hover:text-[#39FF14] transition-all font-black uppercase text-[10px] tracking-[0.3em]">
          <LogOut size={18} /> Déconnexion
        </button>
      </nav>

      {/* CONTENU PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8 md:p-20">
        
        <header className="flex justify-between items-end mb-20">
          <div>
            <h1 className="text-9xl font-space font-black uppercase leading-[0.8] tracking-tighter italic">
              {activeTab === 'overview' ? "Empire" : activeTab.toUpperCase()}
            </h1>
            <p className="mt-6 text-[#39FF14] bg-black inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
              Onyx Admin Terminal 2026
            </p>
          </div>
        </header>

        {/* VUE : VUE GLOBALE (BENTO GRID) */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard label="Cashflow Total" value="3.850.000" unit="FCFA" neon colSpan="md:col-span-2" />
            <StatCard label="Essais Actifs" value="142" unit="Users" />
            <StatCard label="Taux Conv." value="24" unit="%" />
            
            {/* LES 9 SAAS - MINI CARDS */}
            <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mt-12">
              {ecosystem.map((s) => (
                <div key={s.name} className="p-6 border border-zinc-100 rounded-[2.5rem] bg-zinc-50 hover:border-black transition-all">
                  <div className="mb-4">{s.icon}</div>
                  <p className="font-black uppercase text-[10px] tracking-tight">{s.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VUE : TRIAL FUNNEL (AUTOMATISATIONS) */}
        {activeTab === 'trials' && (
          <div className="space-y-8">
            <h2 className="text-3xl font-space font-black uppercase italic">Séquences d'Essai (7 Jours Gratuit)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AutomationCard day="Jour 0" title="Bienvenue Empire" msg="L'aventure commence. Votre accès Onyx est validé pour 7 jours." />
              <AutomationCard day="Jour 4" title="Mi-Parcours" msg="Vous avez déjà exploré 50% de l'écosystème. Ne ralentissez pas." />
              <AutomationCard day="Jour 7" title="Conversion Elite" msg="L'essai expire. Profitez de -40% (Pack Partner) pour 3 mois !" highlight />
            </div>
          </div>
        )}

        {/* VUE : GESTION MEMBRES & PARTENAIRES */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[3rem] border-2 border-zinc-100 overflow-hidden shadow-2xl">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-100">
                  <th className="p-8 text-[10px] font-black uppercase text-zinc-400">Identité</th>
                  <th className="p-8 text-[10px] font-black uppercase text-zinc-400">Statut</th>
                  <th className="p-8 text-[10px] font-black uppercase text-zinc-400">Pack</th>
                  <th className="p-8 text-[10px] font-black uppercase text-zinc-400 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-zinc-50 hover:bg-zinc-50 transition-all">
                    <td className="p-8">
                      <p className="font-black uppercase text-sm">{u.full_name || "Agent Inconnu"}</p>
                      <p className="text-[9px] font-bold text-zinc-400 italic tracking-tighter">{u.id}</p>
                    </td>
                    <td className="p-8">
                      <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase ${u.role === 'partner' ? 'bg-[#39FF14] text-black' : 'bg-zinc-100'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-8">
                       <p className="text-[10px] font-black uppercase italic">
                         {u.role === 'partner' ? "Pack Elite (-15%)" : "Standard"}
                       </p>
                    </td>
                    <td className="p-8 text-right">
                      <button 
                        onClick={() => togglePartner(u.id, u.role)}
                        className="bg-black text-white px-6 py-2 rounded-2xl text-[9px] font-black uppercase hover:bg-[#39FF14] hover:text-black transition-all">
                        {u.role === 'partner' ? "Rétrograder" : "Promouvoir Partenaire"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}

/* COMPOSANTS UI RÉUTILISABLES */

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 p-5 rounded-[2.2rem] transition-all font-black uppercase text-[11px] tracking-[0.15em] ${active ? 'bg-black text-[#39FF14] shadow-2xl' : 'text-zinc-400 hover:text-black'}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, unit, neon, colSpan = "" }: any) {
  return (
    <div className={`p-12 rounded-[3.5rem] border border-zinc-100 relative group transition-all ${colSpan} ${neon ? 'bg-black text-white shadow-3xl shadow-[#39FF14]/15' : 'bg-zinc-50'}`}>
      <p className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 ${neon ? 'text-[#39FF14]' : 'text-zinc-400'}`}>{label}</p>
      <div className="flex items-baseline gap-3">
        <p className="text-8xl font-space font-black tracking-tighter leading-none italic">{value}</p>
        <span className="text-xs font-black italic uppercase opacity-50">{unit}</span>
      </div>
    </div>
  );
}

function AutomationCard({ day, title, msg, highlight }: any) {
  return (
    <div className={`p-10 rounded-[3rem] border-2 transition-all ${highlight ? 'border-[#39FF14] bg-zinc-50 shadow-lg' : 'border-zinc-100'}`}>
       <p className="font-black text-[#39FF14] bg-black inline-block px-3 py-1 rounded-full text-[9px] uppercase mb-6">{day}</p>
       <h4 className="font-space font-black uppercase text-xl mb-4 italic leading-none">{title}</h4>
       <p className="text-xs text-zinc-500 font-bold leading-relaxed">{msg}</p>
    </div>
  );
}
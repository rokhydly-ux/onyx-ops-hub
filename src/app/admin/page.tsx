"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  Users, Wallet, LayoutGrid, LogOut, TrendingUp, CheckCircle, 
  CreditCard, Handshake, MessageCircle, FileText, Plus, Trash2, 
  UserPlus, Settings, ChevronRight, X 
} from "lucide-react";

export default function AdminFullConsole() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    setLoading(true);
    const { data: profs } = await supabase.from("profiles").select("*").order('created_at', { ascending: false });
    const { data: arts } = await supabase.from("articles").select("*").order('created_at', { ascending: false });
    const { data: wapp } = await supabase.from("whatsapp_leads").select("*").order('created_at', { ascending: false });
    const { data: subs } = await supabase.from("subscriptions").select("*").order('created_at', { ascending: false });

    if (profs) setUsers(profs);
    if (arts) setArticles(arts);
    if (wapp) setLeads(wapp);
    if (subs) setPayments(subs);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-['var(--font-space)'] font-black uppercase italic animate-pulse text-3xl">
      ONYX_SYSTEM_BOOTING...
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black font-['var(--font-inter)'] flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <nav className="w-80 border-r border-zinc-100 p-8 flex flex-col justify-between hidden lg:flex bg-white">
          <div className="space-y-12">
            <div className="flex justify-center">
              <img src="/logo.png" alt="Onyx Logo" width={350} height={250} className="object-contain" />
            </div>

            <div className="space-y-1">
              <NavBtn icon={<LayoutGrid size={20}/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
              <NavBtn icon={<Users size={20}/>} label="Utilisateurs" active={activeTab === 'users'} onClick={() => setActiveTab('users')} />
              <NavBtn icon={<Wallet size={20}/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
              <NavBtn icon={<FileText size={20}/>} label="Social Selling" active={activeTab === 'blog'} onClick={() => setActiveTab('blog')} />
              <NavBtn icon={<MessageCircle size={20}/>} label="Leads WhatsApp" active={activeTab === 'whatsapp'} onClick={() => setActiveTab('whatsapp')} />
              <NavBtn icon={<Settings size={20}/>} label="Paramètres" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
            </div>
          </div>

          <button onClick={handleLogout} className="flex items-center gap-4 p-5 rounded-[2rem] bg-zinc-50 hover:bg-black hover:text-[#39FF14] transition-all font-black uppercase text-[10px] tracking-[0.3em]">
            <LogOut size={18} /> Déconnexion
          </button>
        </nav>

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 md:p-16">
          
          <header className="flex justify-between items-end mb-16">
            <div>
              <h1 className="text-7xl font-['var(--font-space)'] font-black uppercase leading-none tracking-tighter">
                {activeTab === 'overview' && "Terminal"}
                {activeTab === 'users' && "Community"}
                {activeTab === 'finances' && "Cashflow"}
                {activeTab === 'blog' && "Social Sell"}
                {activeTab === 'whatsapp' && "Leads"}
                {activeTab === 'settings' && "Advanced"}
              </h1>
              <p className="mt-4 text-[#39FF14] bg-black inline-block px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em]">
                Onyx Intelligence v3.5
              </p>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-[#39FF14] text-black px-8 py-4 rounded-full font-black uppercase text-[10px] flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-[#39FF14]/20">
              <UserPlus size={18}/> Créer Client
            </button>
          </header>

          {/* VUE : OVERVIEW (STATS EN FCFA) */}
          {activeTab === 'overview' && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard label="Chiffre d'Affaires" value="1.250.000" unit="FCFA" sub="Revenu mensuel" icon={<TrendingUp size={24}/>} neon />
                <StatCard label="Prospects Chauds" value={leads.length} unit="WhatsApp" sub="Prêts à convertir" icon={<MessageCircle size={24}/>} />
                <StatCard label="Articles Publiés" value={articles.length} unit="UGC" sub="Impact social" icon={<FileText size={24}/>} />
              </div>
            </div>
          )}

          {/* VUE : SOCIAL SELLING (BLOG) */}
          {activeTab === 'blog' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-['var(--font-space)'] font-black uppercase italic">Gestion du Contenu</h2>
                <button className="bg-black text-[#39FF14] px-6 py-3 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2">
                   <Plus size={16}/> Nouvel Article
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map(art => (
                  <div key={art.id} className="p-8 border-2 border-zinc-100 rounded-[2.5rem] flex justify-between items-start group hover:border-black transition-all">
                    <div>
                      <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">{art.category || "UGC TIPS"}</p>
                      <h4 className="font-black uppercase text-xl leading-tight mb-4">{art.title}</h4>
                      <div className="flex gap-4">
                        <button className="text-[10px] font-black uppercase border-b border-black">Modifier</button>
                        <button className="text-[10px] font-black uppercase text-red-500">Supprimer</button>
                      </div>
                    </div>
                    <img src={art.image_url} className="w-24 h-24 rounded-3xl object-cover grayscale group-hover:grayscale-0 transition-all" alt="" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VUE : LEADS WHATSAPP & CONVERSION */}
          {activeTab === 'whatsapp' && (
            <div className="bg-zinc-50 rounded-[3rem] p-12 border border-zinc-100">
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-zinc-400 border-b border-zinc-200">
                      <th className="pb-6">Contact</th>
                      <th className="pb-6">Produit Souhaité</th>
                      <th className="pb-6">Offre Spéciale</th>
                      <th className="pb-6 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map(lead => (
                      <tr key={lead.id} className="border-b border-zinc-200">
                        <td className="py-8 font-black uppercase text-sm">{lead.customer_name}</td>
                        <td className="py-8">
                           <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black uppercase italic">{lead.product_name}</span>
                        </td>
                        <td className="py-8 text-[10px] font-bold text-zinc-500 uppercase">
                          Appliquer -15% (3 mois+)
                        </td>
                        <td className="py-8 text-right">
                          <button className="bg-[#39FF14] text-black px-6 py-2 rounded-xl text-[10px] font-black uppercase hover:scale-105 transition-all">
                             Convertir en Client
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

      {/* FOOTER */}
      <footer className="p-10 border-t border-zinc-100 bg-white flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">
        <p>© 2026 ONYX HUB — PIKINE DAKAR SENEGAL</p>
        <div className="flex gap-12 italic">
          <a href="#" className="hover:text-black">Terms of Power</a>
          <a href="#" className="hover:text-black">Privacy Protocol</a>
        </div>
      </footer>

      {/* MODAL CRÉATION CLIENT DIRECTE */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-12 relative">
              <button onClick={() => setShowCreateModal(false)} className="absolute top-8 right-8 text-zinc-400 hover:text-black"><X/></button>
              <h2 className="text-4xl font-['var(--font-space)'] font-black uppercase mb-8 italic">Injecter un Client</h2>
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-6">
                    <input type="text" placeholder="NOM COMPLET" className="w-full p-5 bg-zinc-50 border-2 border-zinc-100 rounded-3xl font-black uppercase text-xs focus:border-black outline-none" />
                    <input type="email" placeholder="EMAIL" className="w-full p-5 bg-zinc-50 border-2 border-zinc-100 rounded-3xl font-black uppercase text-xs focus:border-black outline-none" />
                 </div>
                 <select className="w-full p-5 bg-zinc-50 border-2 border-zinc-100 rounded-3xl font-black uppercase text-xs outline-none">
                    <option>SÉLECTIONNER LE PACK</option>
                    <option>ONYX FIT ELITE</option>
                    <option>ONYX VENTE PRO</option>
                    <option>ONYX TONTINE</option>
                 </select>
                 <div className="flex items-center gap-4 bg-zinc-100 p-6 rounded-3xl">
                    <p className="text-[10px] font-black uppercase">Durée :</p>
                    <button className="px-4 py-2 bg-black text-white rounded-xl text-[10px] font-black">2 MOIS</button>
                    <button className="px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black border border-zinc-200">3 MOIS (-20%)</button>
                    <button className="px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black border border-zinc-200">6 MOIS (-30%)</button>
                 </div>
                 <button className="w-full bg-[#39FF14] text-black p-6 rounded-[2rem] font-black uppercase text-sm hover:scale-105 transition-all shadow-xl shadow-[#39FF14]/20">
                    Valider l'Inscription Directe
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

/* COMPOSANTS UI */

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-5 p-5 rounded-[2rem] transition-all font-black uppercase text-[11px] tracking-widest ${active ? 'bg-black text-[#39FF14]' : 'text-zinc-400 hover:bg-zinc-50 hover:text-black'}`}>
      {icon} {label}
    </button>
  );
}

function StatCard({ label, value, unit, sub, icon, neon }: any) {
  return (
    <div className={`p-10 rounded-[3rem] border border-zinc-100 relative group transition-all hover:scale-[1.02] ${neon ? 'bg-black text-white shadow-2xl shadow-[#39FF14]/10' : 'bg-zinc-50'}`}>
      <div className={`absolute top-10 right-10 ${neon ? 'text-[#39FF14]' : 'text-zinc-300'}`}>{icon}</div>
      <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${neon ? 'text-[#39FF14]' : 'text-zinc-400'}`}>{label}</p>
      <div className="flex items-baseline gap-2 mb-4">
        <p className="text-6xl font-['var(--font-space)'] font-black tracking-tighter leading-none">{value}</p>
        <span className="text-xs font-black italic">{unit}</span>
      </div>
      <p className="text-[10px] font-bold uppercase italic opacity-50">{sub}</p>
    </div>
  );
}
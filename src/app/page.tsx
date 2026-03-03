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

const ECOSYSTEM_SAAS = [
  { id: "vente", name: "Onyx Vente", price: "8.900 F", type: "Social Selling", users: 142, icon: "🛍️", color: "bg-blue-100 text-blue-600" },
  { id: "tiak", name: "Onyx Tiak", price: "8.900 F", type: "Logistique", users: 89, icon: "🛵", color: "bg-orange-100 text-orange-600" },
  { id: "stock", name: "Onyx Stock", price: "8.900 F", type: "Inventaire", users: 112, icon: "📦", color: "bg-purple-100 text-purple-600" },
  { id: "menu", name: "Onyx Menu", price: "8.900 F", type: "Restauration", users: 45, icon: "🍔", color: "bg-red-100 text-red-600" },
  { id: "booking", name: "Onyx Booking", price: "8.900 F", type: "Réservation", users: 28, icon: "📅", color: "bg-teal-100 text-teal-600" },
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
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);

  // DONNÉES
  const [usersList, setUsersList] = useState<any[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  // MODALES
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState<any>(null); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showPartnerConfirm, setShowPartnerConfirm] = useState<any>(null);

  // FORMULAIRES
  const [newClient, setNewClient] = useState({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)", is_partner: false });
  const [articleForm, setArticleForm] = useState({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" });
  
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => { fetchInitData(); }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser || { full_name: "Admin Hub", email: "admin@onyx.com" });
    try {
      const [clientsRes, articlesRes, leadsRes, partnersRes, txRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ]);
      if (clientsRes.data) setUsersList(clientsRes.data);
      if (articlesRes.data) setArticlesList(articlesRes.data);
      if (leadsRes.data) setLeadsList(leadsRes.data);
      if (partnersRes.data) setPartnersList(partnersRes.data);
      if (txRes.data) setTransactionsList(txRes.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  // --- ACTIONS ---
  const saveClient = async () => {
    if(!newClient.full_name) return;
    const { id, ...data } = newClient;
    if (id) {
      const { error } = await supabase.from('clients').update(data).eq('id', id);
      if(!error) setUsersList(usersList.map(u => u.id === id ? { ...u, ...data } : u));
    } else {
      const newUUID = crypto.randomUUID();
      const { data: res, error } = await supabase.from('clients').insert([{ ...data, id: newUUID }]).select().single();
      if(!error && res) setUsersList([res, ...usersList]);
    }
    setShowAddClientModal(false);
  };

  const approvePartner = async (partner: any) => {
    const { error } = await supabase.from('partners').update({ status: 'Approuvé' }).eq('id', partner.id);
    if(!error) {
      const pwd = Math.random().toString(36).slice(-8).toUpperCase() + "!";
      const msg = `Félicitations ${partner.full_name} ! Votre accès Hub Partenaire est actif.\n\nLien : https://onyxops.com/login\nPass : ${pwd}\n\nAccédez à votre espace Dopamine pour voir vos commissions.`;
      setPartnersList(partnersList.map(p => p.id === partner.id ? {...p, status: 'Approuvé'} : p));
      window.open(`https://wa.me/${partner.contact.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const generateArticleAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const suggestions = [
        { id: crypto.randomUUID(), title: "Étude de Cas : ROI de 200% pour ce restaurant à Dakar", category: "Restauration", pack_focus: "Pack Full", content: "L'intelligence Onyx a permis de centraliser..." },
        { id: crypto.randomUUID(), title: "Infographie : La logistique de Sandaga en 2026", category: "Logistique", pack_focus: "Pack Trio", content: "Les flux tendus au Sénégal nécessitent Onyx Tiak..." },
        { id: crypto.randomUUID(), title: "Stratégie Social Selling : Vendre sans forcer", category: "Social Selling", pack_focus: "Pack Solo", content: "Nos experts recommandent l'usage du catalogue Onyx Vente..." }
      ];
      setArticlesList([...suggestions, ...articlesList]);
      setIsGenerating(false);
    }, 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black uppercase text-3xl italic animate-pulse">Chargement Onyx...</div>;

  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FA] text-black flex overflow-hidden`}>
      
      {/* SIDEBAR */}
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col hidden lg:flex shadow-sm z-10">
        <div className="mb-12 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
          <span className={`${spaceGrotesk.className} font-black text-4xl tracking-tighter uppercase`}>ONYX<span className="text-[#39FF14]">OPS</span></span>
        </div>
        <div className="space-y-2">
          <NavBtn icon={<LayoutDashboard size={20}/>} label="Terminal" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavBtn icon={<Users size={20}/>} label="CRM & Leads" active={activeTab === 'users' || activeTab === 'chat'} onClick={() => setActiveTab('users')} />
          <NavBtn icon={<Box size={20}/>} label="9 SaaS" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
          <NavBtn icon={<Wallet size={20}/>} label="Finances" active={activeTab === 'finances'} onClick={() => setActiveTab('finances')} />
          <NavBtn icon={<Target size={20}/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => setActiveTab('partners')} />
          <NavBtn icon={<Globe size={20}/>} label="Marketing" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
        </div>
        <button onClick={() => { supabase.auth.signOut(); router.push('/'); }} className="mt-auto flex items-center gap-4 p-4 text-zinc-400 hover:text-red-500 font-bold transition-colors">
          <LogOut size={20}/> Déconnexion
        </button>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white border-b border-zinc-200 px-8 flex justify-between items-center z-10">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter italic`}>{activeTab}</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => window.location.href = '/'} className="text-xs font-bold text-zinc-400 hover:text-black flex items-center gap-2"><Home size={16}/> Voir site</button>
            <div onClick={() => setShowProfileModal(true)} className="flex items-center gap-3 cursor-pointer p-1.5 px-4 bg-zinc-50 rounded-full border border-zinc-200">
              <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center font-black text-xs italic">AD</div>
              <p className="text-[10px] font-black uppercase tracking-widest">Admin Hub</p>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col">
          
          {/* 1. DASHBOARD */}
          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => setActiveTab('finances')} className="p-8 rounded-[3rem] border border-zinc-200 bg-black text-white shadow-2xl cursor-pointer hover:scale-105 transition">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-2">CA Mensuel</p>
                  <p className={`${spaceGrotesk.className} text-6xl font-black italic tracking-tighter`}>3.850K<span className="text-[#39FF14] text-xl">F</span></p>
                </div>
                <div onClick={() => setActiveTab('chat')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col justify-center text-center cursor-pointer hover:border-black transition">
                  <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Leads WhatsApp</p>
                  <p className={`${spaceGrotesk.className} text-6xl font-black italic tracking-tighter`}>{leadsList.length}</p>
                </div>
                <div onClick={() => setActiveTab('marketing')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col justify-center text-center cursor-pointer hover:border-[#39FF14] transition">
                   <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Impact Blog IA</p>
                   <p className={`${spaceGrotesk.className} text-6xl font-black italic tracking-tighter`}>{articlesList.length}</p>
                </div>
              </div>

              {/* Histogramme Interactif */}
              <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6"><BarChart3 className="text-[#39FF14]"/><h3 className={`${spaceGrotesk.className} font-black uppercase text-xl italic`}>Performances 7j</h3></div>
                <div className="flex items-end justify-between gap-2 h-44">
                  {[1200, 1900, 1500, 2100, 2400, 1800, 2200].map((val, i) => (
                    <div key={i} className="flex-1 group cursor-pointer" onClick={() => setActiveTab('finances')}>
                      <div className="bg-zinc-100 rounded-t-xl overflow-hidden h-32 flex items-end">
                        <div className="w-full bg-[#39FF14] group-hover:brightness-110 transition-all" style={{ height: `${(val/2500)*100}%` }} />
                      </div>
                      <p className="text-[9px] font-black uppercase text-zinc-400 mt-2 text-center group-hover:text-black">J-{6-i}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. CRM & CHAT */}
          {activeTab === 'users' && (
             <div className="flex gap-6 h-[75vh] animate-in fade-in">
                <div className="w-1/3 bg-white rounded-[3rem] border border-zinc-200 flex flex-col overflow-hidden">
                   <div className="p-6 border-b font-black uppercase text-xs italic bg-zinc-50 flex justify-between items-center">
                     Inbox CRM <button onClick={() => setShowScannerModal(true)}><Sparkles size={16} className="text-[#39FF14]"/></button>
                   </div>
                   <div className="flex-1 overflow-y-auto p-4 space-y-2">
                      {leadsList.map(lead => (
                        <div key={lead.id} onClick={() => setSelectedLead(lead)} className={`p-5 rounded-[2rem] border cursor-pointer transition ${selectedLead?.id === lead.id ? 'bg-black text-white border-black' : 'bg-zinc-50 border-zinc-100'}`}>
                           <p className="text-[8px] font-black uppercase mb-1 opacity-50">{lead.source}</p>
                           <p className="font-black text-sm uppercase truncate">{lead.full_name || lead.contact}</p>
                           <p className="text-[10px] italic opacity-70 line-clamp-1">{lead.intent}</p>
                        </div>
                      ))}
                   </div>
                   <button onClick={() => setShowAddClientModal(true)} className="m-4 p-4 bg-zinc-100 rounded-2xl font-black text-[10px] uppercase hover:bg-black hover:text-white transition flex items-center justify-center gap-2"><UserPlus size={16}/> Nouveau Client</button>
                </div>
                <div className="flex-1 bg-white rounded-[3rem] border border-zinc-200 flex flex-col relative overflow-hidden">
                   {selectedLead ? (
                     <>
                        <div className="p-6 border-b flex justify-between items-center bg-zinc-50">
                           <p className="font-black uppercase italic">{selectedLead.full_name}</p>
                           <button onClick={() => window.open(`https://wa.me/${selectedLead.contact.replace(/\s/g, '')}`, '_blank')} className="bg-[#39FF14] text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase flex items-center gap-2"><PhoneCall size={14}/> Appeler WhatsApp</button>
                        </div>
                        <div className="flex-1 p-8 space-y-4 overflow-y-auto">
                           <div className="bg-zinc-100 p-4 rounded-2xl rounded-tl-none max-w-sm">
                              <p className="text-[9px] font-black uppercase text-[#39FF14] mb-1 italic">Message Reçu</p>
                              <p className="text-sm font-medium italic">"{selectedLead.intent}"</p>
                           </div>
                           <div className="bg-black text-white p-4 rounded-2xl rounded-tr-none max-w-sm ml-auto">
                              <p className="text-sm font-medium italic">"Bonjour ! Un expert Onyx a reçu votre demande. Comment pouvons-nous vous aider ?"</p>
                           </div>
                        </div>
                        <div className="p-6 border-t flex gap-4 bg-white">
                           <input type="text" placeholder="Répondre..." className="flex-1 bg-zinc-50 border-none rounded-2xl px-6 font-bold text-sm focus:ring-2 focus:ring-[#39FF14] outline-none" />
                           <button className="bg-black text-[#39FF14] p-4 rounded-2xl hover:scale-105 transition"><Send size={20}/></button>
                        </div>
                     </>
                   ) : (
                     <div className="h-full flex flex-col items-center justify-center text-zinc-300">
                        <MessageSquare size={60} className="mb-4 opacity-20"/>
                        <p className="font-black uppercase text-xs italic tracking-widest">Sélectionnez un Lead</p>
                     </div>
                   )}
                </div>
             </div>
          )}

          {/* 3. MARKETING & SÉQUENCES */}
          {activeTab === 'marketing' && (
            <div className="space-y-12 animate-in fade-in">
               <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden border-b-8 border-b-[#39FF14]">
                  <div className="absolute right-[-20px] top-[-20px] opacity-10"><CalendarClock size={250}/></div>
                  <h3 className={`${spaceGrotesk.className} text-4xl font-black uppercase italic mb-8 relative z-10`}>Séquences de Vente</h3>
                  <div className="grid md:grid-cols-3 gap-6 relative z-10">
                     <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                        <span className="bg-white text-black px-3 py-1 rounded-full text-[9px] font-black uppercase mb-4 inline-block italic">Jour 0</span>
                        <p className="font-black text-sm uppercase">Bienvenue & Tuto</p>
                        <p className="text-[10px] text-zinc-400 mt-2">Activation du catalogue immédiate pour effet "Wahou".</p>
                     </div>
                     <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
                        <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[9px] font-black uppercase mb-4 inline-block italic">Jour 7</span>
                        <p className="font-black text-sm uppercase">Relance Expert</p>
                        <p className="text-[10px] text-zinc-400 mt-2">Appel stratégique de 10 min offert par un expert.</p>
                     </div>
                     <div className="bg-[#39FF14]/10 p-6 rounded-3xl border border-[#39FF14]">
                        <span className="bg-[#39FF14] text-black px-3 py-1 rounded-full text-[9px] font-black uppercase mb-4 inline-block italic">Jour 13</span>
                        <p className="font-black text-sm uppercase text-white">Offre Irrésistible</p>
                        <p className="text-[10px] text-zinc-300 mt-2">Code promo -20% pour ne pas perdre ses données.</p>
                     </div>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase italic`}>Blog IA Stratégique</h3>
                    <button onClick={generateArticleAI} disabled={isGenerating} className="bg-black text-[#39FF14] px-6 py-4 rounded-2xl font-black text-xs uppercase flex items-center gap-3 hover:scale-105 transition">
                       {isGenerating ? "Génération en cours..." : <><Sparkles size={18}/> Suggerer 3 Articles</>}
                    </button>
                  </div>
                  <div className="grid gap-6">
                    {articlesList.map(a => (
                      <div key={a.id} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group">
                         <div className="flex-1">
                            <div className="flex gap-2 mb-2"><span className="text-[8px] font-black bg-black text-[#39FF14] px-2 py-1 rounded-md uppercase italic">Expert Onyx</span></div>
                            <h4 className={`${spaceGrotesk.className} text-2xl font-black uppercase italic mb-2 group-hover:text-[#39FF14] transition`}>{a.title}</h4>
                            <p className="text-sm font-medium text-zinc-500 line-clamp-2 italic">"{a.content}"</p>
                         </div>
                         <div className="flex flex-col gap-2">
                            <button className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-md hover:scale-105 transition flex items-center gap-2"><Send size={14}/> Diffuser</button>
                            <button className="bg-zinc-100 text-zinc-500 px-6 py-3 rounded-xl font-black text-[10px] uppercase hover:bg-black hover:text-white transition">Éditer</button>
                         </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}

          {/* 4. FINANCES */}
          {activeTab === 'finances' && (
            <div className="space-y-8 animate-in fade-in">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-10 rounded-[3rem] border border-zinc-200 shadow-sm">
                     <h3 className={`${spaceGrotesk.className} text-2xl font-black uppercase italic mb-6 flex items-center gap-3`}><CreditCard className="text-orange-500"/> Validations Cash</h3>
                     <div className="space-y-4">
                        {transactionsList.length === 0 ? <p className="opacity-30 font-black text-xs italic">Aucune validation en attente.</p> : 
                          transactionsList.map(tx => (
                            <div key={tx.id} className="p-5 bg-zinc-50 rounded-[2rem] border border-zinc-100 flex justify-between items-center">
                               <div><p className="font-black text-sm uppercase">{tx.client_name}</p><p className="text-[10px] font-bold text-zinc-400 uppercase">{tx.method} • {tx.amount} F</p></div>
                               <button className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase shadow-md">Valider</button>
                            </div>
                          ))
                        }
                     </div>
                  </div>
                  <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center">
                     <TrendingUp className="absolute right-[-20px] bottom-[-20px] opacity-10 text-[#39FF14]" size={200}/>
                     <h3 className={`${spaceGrotesk.className} text-xl font-black uppercase italic mb-2 opacity-60`}>Taux de Rétention</h3>
                     <p className="text-[100px] font-black italic tracking-tighter text-[#39FF14] leading-none">82%</p>
                     <p className="text-xs font-black uppercase italic text-zinc-500 mt-4 tracking-[0.3em]">Excellence CRM 2026</p>
                  </div>
               </div>
            </div>
          )}

          {/* 5. ÉCOSYSTÈME (Mini-Landing Pages) */}
          {activeTab === 'ecosystem' && (
             <div className="animate-in fade-in">
                {!selectedSaaS ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {ECOSYSTEM_SAAS.map(s => (
                      <div key={s.id} onClick={() => setSelectedSaaS(s)} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:border-black cursor-pointer transition group">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${s.color}`}>{s.icon}</div>
                         <h4 className="font-black text-2xl uppercase italic mb-1">{s.name}</h4>
                         <p className="text-[10px] font-bold text-zinc-400 uppercase mb-6">{s.type}</p>
                         <div className="flex justify-between items-center pt-4 border-t border-zinc-50">
                            <span className="text-[9px] font-black uppercase text-zinc-300">{s.users} Clients</span>
                            <span className="bg-black text-white px-3 py-1 rounded-full text-[9px] font-black italic">{s.price}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="animate-in slide-in-from-right-8 duration-300">
                    <button onClick={() => setSelectedSaaS(null)} className="mb-8 flex items-center gap-2 text-xs font-black uppercase italic text-zinc-400 hover:text-black transition"><ChevronLeft size={16}/> Retour</button>
                    <div className="bg-black text-white p-12 rounded-[4rem] shadow-2xl relative overflow-hidden mb-8">
                       <div className="absolute right-10 top-1/2 -translate-y-1/2 text-[200px] opacity-5">{selectedSaaS.icon}</div>
                       <h2 className={`${spaceGrotesk.className} text-6xl font-black uppercase italic mb-4 relative z-10`}>{selectedSaaS.name}</h2>
                       <p className="text-zinc-500 font-bold max-w-lg mb-8 relative z-10 italic">Module de croissance autonome. Configurez les accès et l'activation des nouveaux essais.</p>
                       <div className="flex gap-4 relative z-10">
                          <button onClick={() => window.open(`https://${selectedSaaS.id}.onyxops.com/login`, '_blank')} className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase shadow-xl flex items-center gap-3"><Key size={18}/> Login Instance</button>
                          <button onClick={() => { setNewClient({...newClient, saas: selectedSaaS.name}); setShowAddClientModal(true); }} className="bg-zinc-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase border border-zinc-700 hover:bg-white hover:text-black transition">Activer un Essai</button>
                       </div>
                    </div>
                  </div>
                )}
             </div>
          )}

          {/* 6. PARTENAIRES (Validation WA) */}
          {activeTab === 'partners' && (
            <div className="space-y-8 animate-in fade-in">
               <h3 className={`${spaceGrotesk.className} text-3xl font-black uppercase italic`}>Validation Ambassadeurs</h3>
               <div className="grid gap-6">
                 {partnersList.map(p => (
                    <div key={p.id} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
                       <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                             <h4 className="font-black text-3xl uppercase italic">{p.full_name}</h4>
                             <span className="bg-zinc-100 px-3 py-1 rounded-full text-[9px] font-black uppercase">{p.activity}</span>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                             <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                <p className="text-[8px] font-black uppercase text-zinc-400 mb-1">Stratégie Anti-Touriste</p>
                                <p className="text-xs font-medium italic">"{p.objective || "Non précisé"}"</p>
                             </div>
                             <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                <p className="text-[8px] font-black uppercase text-zinc-400 mb-1">YouTube / Réseaux</p>
                                <p className="text-xs font-bold text-blue-600 truncate">{p.youtube_link || p.prospection || "Direct"}</p>
                             </div>
                          </div>
                       </div>
                       <div>
                          {p.status === 'En attente' ? (
                            <button onClick={() => approvePartner(p)} className="bg-black text-[#39FF14] px-10 py-5 rounded-2xl font-black text-xs uppercase shadow-2xl hover:scale-105 transition">Activer & Message WA</button>
                          ) : (
                            <span className="bg-green-50 text-green-600 px-10 py-5 rounded-2xl font-black text-xs uppercase border border-green-100 flex items-center gap-2"><ShieldCheck size={18}/> Partenaire Actif</span>
                          )}
                       </div>
                    </div>
                 ))}
               </div>
            </div>
          )}

        </div>

        <footer className="h-16 bg-white border-t border-zinc-200 px-8 flex justify-between items-center text-[9px] font-black uppercase tracking-[0.3em] text-zinc-300">
           <p>OnyxOps Terminal © 2026</p>
           <p>Sécurité Chiffrée • Dakar, Sénégal</p>
        </footer>
      </main>

      {/* --- MODALES --- */}

      {/* MODALE : SCANNER IA (Cliquable) */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[4rem] p-12 shadow-2xl relative">
              <button onClick={() => setShowScannerModal(false)} className="absolute top-8 right-8 text-zinc-400 hover:text-black"><X size={24}/></button>
              <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase italic mb-2 tracking-tighter`}><Sparkles className="text-[#39FF14] inline mr-2"/> Rapport IA CRM</h2>
              <p className="text-xs font-bold text-zinc-400 uppercase italic mb-8">Opportunités de croissance détectées par l'Intelligence Onyx.</p>
              <div className="space-y-4">
                 {[
                   { name: "Boutique Chez Fatou", target: "Onyx Staff", text: "Ventes en hausse (+40%), recommandation pack RH.", action: "Upsell" },
                   { name: "Saly Food Services", target: "Onyx Stock", text: "Alertes ruptures fréquentes, besoin gestion inventaire.", action: "Activer" }
                 ].map((rec, i) => (
                    <div key={i} className="bg-zinc-50 border border-zinc-100 p-6 rounded-[2.5rem] flex justify-between items-center hover:border-black transition cursor-pointer group">
                       <div className="flex-1">
                          <p className="font-black text-lg uppercase italic">{rec.name}</p>
                          <p className="text-xs text-zinc-500 font-medium italic mt-1">{rec.text}</p>
                       </div>
                       <button className="bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black text-[10px] uppercase group-hover:scale-110 transition">{rec.action} {rec.target}</button>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {/* MODALE : AJOUT CLIENT (UUID Fix) */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl relative">
            <button onClick={() => setShowAddClientModal(false)} className="absolute top-8 right-8 text-zinc-400"><X size={20}/></button>
            <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase italic mb-8 tracking-tighter`}>{newClient.id ? 'Modifier' : 'Nouveau'} Contact</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nom Complet" value={newClient.full_name} onChange={e => setNewClient({...newClient, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold outline-none focus:border-black" />
              <input type="text" placeholder="WhatsApp / Email" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold outline-none focus:border-black" />
              <select value={newClient.saas} onChange={e => setNewClient({...newClient, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm font-bold outline-none cursor-pointer">
                 {ECOSYSTEM_SAAS.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
              </select>
            </div>
            <button onClick={saveClient} className="w-full py-5 bg-[#39FF14] text-black font-black text-xs uppercase rounded-2xl mt-8 shadow-xl hover:scale-105 transition tracking-widest">Enregistrer</button>
          </div>
        </div>
      )}

    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 mx-2 rounded-2xl transition-all font-black text-xs uppercase tracking-widest ${active ? 'bg-black text-[#39FF14] shadow-xl' : 'text-zinc-400 hover:bg-zinc-50 hover:text-black'}`}>
      <div className={`${active ? 'text-[#39FF14]' : 'text-zinc-400'}`}>{icon}</div>{label}
    </button>
  );
}
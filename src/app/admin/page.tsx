"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Users, Wallet, LayoutDashboard, LogOut, TrendingUp, CheckCircle, 
  MessageSquare, UserPlus, X, Send, Edit3, Home, Target, Globe, Box, Sparkles,
  BarChart3, CreditCard, CalendarClock, PhoneCall, Key, ChevronLeft, ShieldCheck, Mail, Zap, Flame, Smartphone
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700"] });

// --- LES 9 SAAS DE L'ÉCOSYSTÈME (PRIX HARMONISÉS) ---
const ECOSYSTEM_SAAS = [
  { id: "vente", name: "Onyx Vente", price: "8.900 F", type: "Social Selling", users: 142, icon: "🛍️", color: "bg-blue-100 text-blue-600", desc: "Digitalisation des ventes et devis PDF via WhatsApp." },
  { id: "tiak", name: "Onyx Tiak", price: "8.900 F", type: "Logistique", users: 89, icon: "🛵", color: "bg-orange-100 text-orange-600", desc: "Suivi des livreurs et sécurisation des encaissements." },
  { id: "stock", name: "Onyx Stock", price: "8.900 F", type: "Inventaire", users: 112, icon: "📦", color: "bg-purple-100 text-purple-600", desc: "Gestion des stocks par scan et alertes ruptures." },
  { id: "menu", name: "Onyx Menu", price: "8.900 F", type: "Restauration", users: 45, icon: "🍔", color: "bg-red-100 text-red-600", desc: "Menu QR interactif et prise de commande directe." },
  { id: "booking", name: "Onyx Booking", price: "8.900 F", type: "Réservation", users: 28, icon: "📅", color: "bg-teal-100 text-teal-600", desc: "Planning et acompte pour services et prestataires." },
  { id: "staff", name: "Onyx Staff", price: "8.900 F", type: "RH & Paie", users: 34, icon: "👥", color: "bg-yellow-100 text-yellow-600", desc: "Pointage GPS et gestion automatisée de la paie." },
  { id: "fit", name: "Onyx Fit", price: "5.900 F", type: "Coaching", users: 56, icon: "💪", color: "bg-indigo-100 text-indigo-600", desc: "Suivi client et programmes sportifs personnalisés." },
  { id: "tontine", name: "Onyx Tontine", price: "5.900 F", type: "Finance", users: 19, icon: "💰", color: "bg-[#39FF14]/20 text-green-700", desc: "Gestion sécurisée des épargnes et cotisations." },
  { id: "academy", name: "Onyx Academy", price: "5.900 F", type: "E-learning", users: 210, icon: "🎓", color: "bg-pink-100 text-pink-600", desc: "Plateforme de formation et vente de cours en ligne." },
];

export default function AdminBentoTerminal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // DATA STATES
  const [usersList, setUsersList] = useState<any[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  const [leadsList, setLeadsList] = useState<any[]>([]);
  const [transactionsList, setTransactionsList] = useState<any[]>([]);

  // NAVIGATION & MODALS
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showPartnerConfirm, setShowPartnerConfirm] = useState<any>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showArticleModal, setShowArticleModal] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // FORMS
  const [newClient, setNewClient] = useState({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)", is_partner: false });
  const [articleForm, setArticleForm] = useState({ id: "", title: "", category: "Social Selling", pack_focus: "Pack Full", content: "" });

  useEffect(() => { fetchInitData(); }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser || { full_name: "Admin Onyx", email: "admin@onyxops.com" });
    try {
      const [c, a, l, p, tx] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
        supabase.from('leads').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions').select('*').order('created_at', { ascending: false })
      ]);
      if (c.data) setUsersList(c.data);
      if (a.data) setArticlesList(a.data);
      if (l.data) setLeadsList(l.data);
      if (p.data) setPartnersList(p.data);
      if (tx.data) setTransactionsList(tx.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  // --- LOGIQUE CAPTURE LEADS & ACTIONS ---
  const saveClient = async () => {
    if (!newClient.full_name) return;
    const { id, ...data } = newClient;
    if (id) {
      const { error } = await supabase.from('clients').update(data).eq('id', id);
      if (!error) setUsersList(usersList.map(u => u.id === id ? { ...u, ...data } : u));
    } else {
      const newId = crypto.randomUUID();
      const { data: res, error } = await supabase.from('clients').insert([{ ...data, id: newId }]).select().single();
      if (!error && res) setUsersList([res, ...usersList]);
    }
    setShowAddClientModal(false);
  };

  const approvePartner = async (partner: any) => {
    const pwd = Math.random().toString(36).slice(-8).toUpperCase() + "!";
    const msg = `Bonjour ${partner.full_name}, votre compte Partenaire OnyxOps est actif ! ✅\n\nIdentifiants :\nLien : https://onyxops.com/login\nContact : ${partner.contact}\nMot de passe : ${pwd}\n\nAccédez au Hub pour gérer vos commissions et votre lien parrain.`;
    const { error } = await supabase.from('partners').update({ status: 'Approuvé' }).eq('id', partner.id);
    if (!error) {
      setPartnersList(partnersList.map(p => p.id === partner.id ? { ...p, status: 'Approuvé' } : p));
      window.open(`https://wa.me/${partner.contact.replace(/\s/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  const confirmPartnerTransition = async (client: any) => {
    const { error } = await supabase.from('clients').update({ is_partner: true }).eq('id', client.id);
    if (!error) {
      setUsersList(usersList.map(u => u.id === client.id ? { ...u, is_partner: true } : u));
      setShowPartnerConfirm(null);
    }
  };

  const generateArticleAI = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const expertArticles = [
        { id: "ia1", title: "ROI : Pourquoi digitaliser votre boutique à Dakar en 2026 ?", category: "Social Selling", pack_focus: "Onyx Solo", content: "L'analyse du marché sénégalais montre que la vente directe via catalogue WhatsApp réduit le temps de négociation de 40%... (Expert Onyx)" },
        { id: "ia2", title: "Étude de Cas : Doubler ses ventes via le Social Selling", category: "Marketing", pack_focus: "Pack Trio", content: "Comment une boutique de cosmétiques a automatisé ses devis et ses relances pour augmenter son ROI de 25%..." },
        { id: "ia3", title: "Infographie : Le coût réel d'un stock mal géré", category: "Gestion", pack_focus: "Pack Full", content: "Les pertes liées aux ruptures de stock non détectées représentent 15% du CA des PME. Onyx Stock résout cela via le scan QR." }
      ];
      setArticlesList([...expertArticles, ...articlesList]);
      setIsGenerating(false);
    }, 1500);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white font-black text-3xl italic animate-pulse">TERMINAL ONYX...</div>;

  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FA] text-black flex overflow-hidden`}>
      {/* SIDEBAR */}
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between hidden lg:flex shadow-sm z-10">
        <div>
          <div className="mb-12 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <span className={`${spaceGrotesk.className} font-black text-4xl tracking-tighter uppercase`}>ONYX<span className="text-[#39FF14]">OPS</span></span>
          </div>
          <div className="space-y-2">
            <NavBtn icon={<LayoutDashboard size={20}/>} label="Terminal" active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setSelectedSaaS(null);}} />
            <NavBtn icon={<Users size={20}/>} label="CRM Hub" active={activeTab === 'users'} onClick={() => {setActiveTab('users'); setSelectedSaaS(null);}} />
            <NavBtn icon={<Box size={20}/>} label="Écosystème" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
            <NavBtn icon={<Wallet size={20}/>} label="Finances" active={activeTab === 'finances'} onClick={() => {setActiveTab('finances'); setSelectedSaaS(null);}} />
            <NavBtn icon={<MessageSquare size={20}/>} label="Inbox Leads" active={activeTab === 'chat'} onClick={() => {setActiveTab('chat'); setSelectedSaaS(null);}} />
            <NavBtn icon={<Target size={20}/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => {setActiveTab('partners'); setSelectedSaaS(null);}} />
            <NavBtn icon={<Globe size={20}/>} label="Marketing" active={activeTab === 'marketing'} onClick={() => {setActiveTab('marketing'); setSelectedSaaS(null);}} />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 bg-white border-b border-zinc-200 px-8 flex justify-between items-center z-10">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter italic`}>{selectedSaaS ? selectedSaaS.name : activeTab}</h1>
          <div className="flex items-center gap-6">
            <button onClick={() => window.location.href = '/'} className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-black transition"><Home size={16}/> Voir site</button>
            <div className="flex items-center gap-3 p-1.5 pr-4 bg-zinc-50 rounded-full border border-zinc-200 cursor-pointer" onClick={() => setActiveTab('overview')}>
              <div className="w-8 h-8 rounded-full bg-black text-[#39FF14] flex items-center justify-center font-black text-xs italic">AD</div>
              <p className="text-[10px] font-black uppercase">Admin Hub</p>
            </div>
            <button onClick={() => router.push('/')} className="text-zinc-400 hover:text-red-500 transition"><LogOut size={20}/></button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          {/* ================= 1. DASHBOARD (TERMINAL) ================= */}
          {activeTab === 'overview' && !selectedSaaS && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div onClick={() => setActiveTab('finances')} className="p-8 rounded-[3rem] border border-zinc-200 bg-black text-white shadow-2xl cursor-pointer hover:scale-105 transition-transform">
                  <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-2">Chiffre d&apos;affaires</p>
                  <p className={`${spaceGrotesk.className} text-5xl font-black tracking-tighter italic`}>3.850.000 F</p>
                  <p className="text-[10px] font-black uppercase text-[#39FF14] mt-4 flex items-center gap-1"><TrendingUp size={12}/> +12% vs mois dernier</p>
                </div>
                <div onClick={() => setActiveTab('chat')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-black transition flex flex-col justify-center text-center">
                   <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Leads Capturés</p>
                   <p className={`${spaceGrotesk.className} text-6xl font-black tracking-tighter italic`}>{leadsList.length}</p>
                </div>
                <div onClick={() => setActiveTab('marketing')} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-[#39FF14] transition flex flex-col justify-center text-center">
                   <p className="text-[10px] font-black uppercase text-zinc-400 mb-2">Blog Impact</p>
                   <p className={`${spaceGrotesk.className} text-6xl font-black tracking-tighter italic`}>{articlesList.length}</p>
                </div>
              </div>

              {/* HISTOGRAMME INTERACTIF */}
              <div className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm">
                <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl mb-6 flex items-center gap-2`}><BarChart3 className="text-[#39FF14]"/> Ventes par jour (7j)</h3>
                <div className="flex items-end justify-between gap-4 h-48">
                  {[1200, 1900, 1500, 2100, 2400, 1800, 2200].map((val, i) => (
                    <div key={i} onClick={() => setActiveTab('finances')} className="flex-1 flex flex-col items-center gap-3 cursor-pointer group">
                      <div className="w-full bg-zinc-100 rounded-t-2xl relative overflow-hidden h-32 flex items-end">
                        <div className="w-full bg-[#39FF14] rounded-t-2xl group-hover:brightness-110 transition-all" style={{ height: `${(val / 2500) * 100}%` }} />
                        <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity" />
                      </div>
                      <span className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-black transition-colors">J-{6 - i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 2. ÉCOSYSTÈME (LES 9 SAAS) ================= */}
          {activeTab === 'ecosystem' && !selectedSaaS && (
             <div className="animate-in fade-in">
                <h3 className={`${spaceGrotesk.className} font-black uppercase text-3xl mb-8`}>La Suite OnyxOps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {ECOSYSTEM_SAAS.map(saas => (
                      <div key={saas.id} onClick={() => setSelectedSaaS(saas)} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:border-black transition cursor-pointer group">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${saas.color}`}>{saas.icon}</div>
                         <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase mb-1 group-hover:text-[#39FF14] transition`}>{saas.name}</h4>
                         <p className="text-xs font-bold text-zinc-400 mb-6">{saas.type}</p>
                         <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                            <span className="text-[10px] font-black uppercase text-zinc-400">{saas.users} Clients</span>
                            <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black italic">{saas.price}/m</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* PAGE INDIVIDUELLE SAAS */}
          {selectedSaaS && (
            <div className="animate-in slide-in-from-right-8">
              <button onClick={() => setSelectedSaaS(null)} className="mb-6 flex items-center gap-2 text-xs font-black uppercase text-zinc-400 hover:text-black transition"><ChevronLeft size={16}/> Retour</button>
              <div className="bg-black text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden mb-12">
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-[10rem] opacity-5">{selectedSaaS.icon}</div>
                <div className="relative z-10">
                  <h2 className={`${spaceGrotesk.className} text-5xl font-black uppercase italic mb-4 tracking-tighter`}>{selectedSaaS.name}</h2>
                  <p className="text-zinc-400 font-bold max-w-lg mb-10 italic">{selectedSaaS.desc}</p>
                  <div className="flex gap-4">
                    <button onClick={() => window.open(`https://${selectedSaaS.id}.onyxops.com/login`, '_blank')} className="bg-[#39FF14] text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition shadow-lg"><Key size={18}/> Login Client</button>
                    <button onClick={() => { setNewClient({ ...newClient, saas: selectedSaaS.name, role: 'prospect', expire: 'En essai (J-7)' }); setShowAddClientModal(true); }} className="bg-zinc-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition">Activer Essai Gratuit</button>
                  </div>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[3rem] border border-zinc-200">
                <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl mb-6 italic`}>Base Clients {selectedSaaS.name}</h3>
                <div className="text-center p-12 bg-zinc-50 rounded-[2rem] border-2 border-dashed border-zinc-100 font-bold uppercase text-zinc-400 italic">
                  Instance Database : {usersList.filter(u => u.saas === selectedSaaS.name).length} utilisateurs connectés
                </div>
              </div>
            </div>
          )}

          {/* ================= 3. CRM HUB & SCANNER ================= */}
          {activeTab === 'users' && !selectedSaaS && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200">
                 <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter flex items-center gap-3`}><Users className="text-[#39FF14]"/> CRM Hub</h3>
                 <div className="flex gap-4">
                   <button onClick={() => setShowScannerModal(true)} className="bg-black text-[#39FF14] px-6 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition flex items-center gap-2"><Sparkles size={16}/> Scanner IA</button>
                   <button onClick={() => { setNewClient({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)", is_partner: false }); setShowAddClientModal(true); }} className="bg-zinc-100 text-black px-6 py-4 rounded-xl font-black text-[10px] uppercase border border-zinc-200 hover:bg-black hover:text-white transition flex items-center gap-2"><UserPlus size={16}/> Ajouter</button>
                 </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usersList.map((u) => (
                  <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:border-black transition flex flex-col justify-between group relative overflow-hidden">
                    {u.is_partner && <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-3 py-1 text-[9px] font-black uppercase italic rounded-bl-xl">Partenaire</div>}
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <img src={`https://ui-avatars.com/api/?name=${u.full_name}&background=random`} className="w-12 h-12 rounded-full border-2 border-zinc-100 shadow-sm" alt="" />
                        <button onClick={() => { setNewClient(u); setShowAddClientModal(true); }} className="p-2 bg-zinc-50 rounded-lg hover:bg-black hover:text-white transition opacity-0 group-hover:opacity-100"><Edit3 size={14}/></button>
                      </div>
                      <p className="font-black text-xl mb-1 uppercase tracking-tighter italic">{u.full_name}</p>
                      <p className="text-xs font-bold text-zinc-400 mb-6">{u.contact}</p>
                      <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100 mb-4">
                        <div className="flex justify-between items-center text-[10px] font-black"><span className="text-zinc-400 uppercase">SaaS Actif</span><span className="uppercase">{u.saas}</span></div>
                      </div>
                    </div>
                    {!u.is_partner && (
                      <button onClick={() => setShowPartnerConfirm(u)} className="w-full text-center py-2 border border-dashed border-zinc-200 text-zinc-400 rounded-xl text-[10px] font-black uppercase hover:border-[#39FF14] hover:text-[#39FF14] transition">Convertir Partenaire</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= 4. FINANCES (VALIDATION PAIEMENTS) ================= */}
          {activeTab === 'finances' && !selectedSaaS && (
            <div className="space-y-8 animate-in fade-in">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[3rem] border border-zinc-200 shadow-sm">
                  <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl mb-8 flex items-center gap-2`}><Wallet className="text-orange-500"/> En attente de validation</h3>
                  <div className="space-y-4">
                    {transactionsList.filter(t => t.status !== 'success').map(tx => (
                      <div key={tx.id} className="p-5 bg-zinc-50 rounded-2xl border border-zinc-100 flex justify-between items-center">
                        <div>
                          <p className="font-black text-sm uppercase">{tx.client_name || "Client Onyx"}</p>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase italic">Wave/OM • {tx.amount ?? 8900} F</p>
                        </div>
                        <button onClick={() => alert('Paiement Validé - Abonnement activé.')} className="bg-[#39FF14] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-md hover:scale-105 transition">Valider</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                  <TrendingUp className="absolute right-[-20px] bottom-[-20px] text-[#39FF14] opacity-5" size={200} />
                  <p className="text-[10px] font-black uppercase text-[#39FF14] tracking-widest mb-2">Objectif Cash M1</p>
                  <p className={`${spaceGrotesk.className} text-[60px] font-black italic text-white tracking-tighter`}>77%</p>
                  <div className="mt-8 space-y-4 relative z-10">
                    <div className="flex justify-between border-b border-zinc-800 pb-2 text-xs font-bold uppercase"><span className="text-zinc-500">Moyenne/Client</span><span>8.900 F</span></div>
                    <div className="flex justify-between border-b border-zinc-800 pb-2 text-xs font-bold uppercase"><span className="text-zinc-500">Retrait Partenaires</span><span className="text-red-500">- 420.000 F</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= 5. INBOX LEADS (CAPTURE WHATSAPP/BOT) ================= */}
          {activeTab === 'chat' && !selectedSaaS && (
            <div className="flex gap-6 h-[78vh] animate-in fade-in">
              <div className="w-1/3 bg-white rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-6 border-b bg-zinc-50/50"><h3 className="font-black uppercase text-sm italic">Capture Leads Directs</h3></div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {leadsList.map(lead => (
                    <div key={lead.id} className="p-5 rounded-[2rem] border border-zinc-50 bg-zinc-50 hover:border-black cursor-pointer transition-all">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] bg-[#39FF14] text-black px-2 py-0.5 rounded-full font-black uppercase tracking-widest">{lead.source}</span>
                        <span className="text-[8px] font-black text-zinc-400">J-0</span>
                      </div>
                      <p className="font-black text-sm uppercase">{lead.full_name || "Prospect Web"}</p>
                      <p className="text-[10px] font-bold text-zinc-500 italic truncate">"{lead.intent}"</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 bg-white rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
                 <div className="p-8 flex flex-col items-center justify-center flex-1 opacity-20">
                   <MessageSquare size={64} className="mb-4" />
                   <p className={`${spaceGrotesk.className} font-black uppercase text-xl italic`}>CRM Messagerie</p>
                   <p className="text-xs font-bold uppercase">Sélectionnez un lead pour répondre</p>
                 </div>
                 <div className="p-6 border-t border-zinc-100 flex gap-4">
                    <input type="text" placeholder="Répondre via WhatsApp CRM..." className="flex-1 bg-zinc-50 border-none rounded-2xl px-6 text-sm font-bold focus:ring-0 outline-none" />
                    <button className="bg-black text-[#39FF14] p-4 rounded-2xl shadow-xl hover:scale-110 transition"><Send size={20}/></button>
                 </div>
              </div>
            </div>
          )}

          {/* ================= 6. MARKETING (SÉQUENCES & BLOG) ================= */}
          {activeTab === 'marketing' && !selectedSaaS && (
            <div className="space-y-12 animate-in fade-in">
              {/* SÉQUENCES AUTOMATIQUES */}
              <div className="bg-black text-white p-10 rounded-[3.5rem] shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 p-10 opacity-5"><CalendarClock size={200}/></div>
                <h3 className={`${spaceGrotesk.className} font-black uppercase text-3xl mb-8 relative z-10 flex items-center gap-3`}><Sparkles className="text-[#39FF14]"/> Séquences Automatisation</h3>
                <div className="grid md:grid-cols-3 gap-6 relative z-10">
                  <div className="bg-zinc-900 border-l-4 border-white p-6 rounded-2xl">
                    <span className="bg-white text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">J0 - Inscription</span>
                    <p className="font-bold text-sm mb-2 italic">Bienvenue + Tuto Vidéo</p>
                    <p className="text-xs text-zinc-400">Pousse l'utilisateur à configurer son catalogue immédiatement.</p>
                  </div>
                  <div className="bg-zinc-900 border-l-4 border-yellow-400 p-6 rounded-2xl">
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">J+7 - Milieu Essai</span>
                    <p className="font-bold text-sm mb-2 italic">Relance "Expert Call"</p>
                    <p className="text-xs text-zinc-400">Propose un diagnostic gratuit de 10 min pour convertir l'essai.</p>
                  </div>
                  <div className="bg-[#39FF14]/10 border border-[#39FF14] border-l-4 p-6 rounded-2xl">
                    <span className="bg-[#39FF14] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">J-1 - Expiration</span>
                    <p className="font-bold text-sm mb-2 text-white italic">Offre Irrésistible (-20%)</p>
                    <p className="text-xs text-zinc-300">Dernière chance avant fermeture de l'instance et perte des données.</p>
                  </div>
                </div>
              </div>

              {/* BLOG EXPERT */}
              <div className="bg-white p-8 rounded-[3rem] border border-zinc-200">
                <div className="flex justify-between items-center mb-8">
                  <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl italic tracking-tighter`}>Blog Expertise ROI</h3>
                  <button onClick={generateArticleAI} disabled={isGenerating} className="bg-black text-[#39FF14] px-6 py-4 rounded-xl font-black text-xs uppercase shadow-lg hover:scale-105 transition flex items-center gap-2">
                    {isGenerating ? "Génération Stratégique..." : <><Sparkles size={16}/> Auto-suggestion IA (3)</>}
                  </button>
                </div>
                <div className="grid gap-6">
                  {articlesList.map(article => (
                    <div key={article.id} className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6 hover:border-black transition group">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-4">
                          <span className="text-[9px] font-black uppercase bg-black text-[#39FF14] px-3 py-1 rounded-md italic">Expert Onyx</span>
                          <span className="text-[9px] font-black uppercase bg-zinc-100 border border-zinc-200 px-3 py-1 rounded-md text-zinc-500">{article.category}</span>
                        </div>
                        <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase italic group-hover:text-[#39FF14] transition`}>{article.title}</h4>
                        <p className="text-xs font-medium text-zinc-500 line-clamp-2 italic">"{article.content}"</p>
                      </div>
                      <div className="flex flex-col gap-3 w-full md:w-auto">
                        <button onClick={() => alert('Diffusé via WhatsApp & Mail.')} className="w-full px-6 py-3 bg-[#39FF14] text-black font-black text-[10px] uppercase rounded-xl hover:scale-105 transition shadow-md flex items-center justify-center gap-2"><Send size={14}/> Diffuser</button>
                        <button onClick={() => { setArticleForm(article); setShowArticleModal(article); }} className="w-full px-6 py-3 bg-white text-black font-black text-[10px] uppercase border border-zinc-200 rounded-xl hover:bg-black hover:text-white transition flex items-center justify-center gap-2"><Edit3 size={14}/> Éditer</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= 7. PARTENAIRES ================= */}
          {activeTab === 'partners' && !selectedSaaS && (
             <div className="space-y-6 animate-in fade-in">
               <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter mb-8 italic`}>Validation Ambassadeurs Hub</h3>
               <div className="grid gap-6">
                 {partnersList.map(partner => (
                    <div key={partner.id} className="bg-white p-8 rounded-[3rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                             <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase italic`}>{partner.full_name}</h4>
                             <span className="bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest">{partner.activity}</span>
                          </div>
                          <p className="text-xs font-bold text-zinc-400 mb-6 italic">📞 {partner.contact} | 📍 {partner.city}</p>
                          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 grid md:grid-cols-2 gap-6">
                             <div><p className="text-[9px] font-black text-zinc-400 uppercase mb-1">Objectif Anti-Touriste :</p><p className="text-xs font-bold italic text-zinc-700">"{partner.objective || "Non précisé"}"</p></div>
                             <div><p className="text-[9px] font-black text-zinc-400 uppercase mb-1">YouTube / Réseaux :</p><p className="text-xs font-bold text-blue-600 truncate">{partner.youtube_link || partner.prospection || "Non précisé"}</p></div>
                          </div>
                       </div>
                       <div>
                          {partner.status === 'En attente' ? (
                             <button onClick={() => approvePartner(partner)} className="bg-black text-[#39FF14] px-8 py-4 rounded-2xl text-xs font-black uppercase hover:scale-105 transition shadow-2xl">Activer Hub & WA</button>
                          ) : (
                             <span className="text-green-600 bg-green-50 px-6 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 border border-green-200"><ShieldCheck size={18}/> Hub Actif</span>
                          )}
                       </div>
                    </div>
                 ))}
               </div>
             </div>
          )}
        </div>

        <footer className="mt-8 pt-6 border-t border-zinc-200 flex justify-between items-center px-8 text-[10px] font-black uppercase tracking-widest text-zinc-300">
           <p>OnyxOps Admin Hub © 2026</p>
           <p>Security Active - Dakar Center</p>
        </footer>
      </main>

      {/* ================= MODALES ================= */}
      
      {/* SCANNER IA */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowScannerModal(false)} className="absolute top-8 right-8 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={18}/></button>
            <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 italic tracking-tighter flex items-center gap-2`}><Sparkles className="text-[#39FF14]"/> Rapport IA CRM</h2>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8">Scan effectué sur {usersList.length} clients</p>
            <div className="space-y-4">
               {[
                 { n: "Boutique Fatou", i: "Essai expire (J-1). Fort usage catalogue.", a: "Offrir Promo (WhatsApp)" },
                 { n: "Resto Dakar", i: "Client Menu depuis 6 mois. Pas de logiciel RH.", a: "Upsell Onyx Staff" }
               ].map((o, idx) => (
                  <div key={idx} className="bg-zinc-50 border border-zinc-200 p-5 rounded-3xl flex justify-between items-center hover:border-black transition cursor-default">
                    <div><p className="font-black uppercase text-sm">{o.n}</p><p className="text-xs font-medium text-zinc-500 italic mt-0.5">{o.i}</p></div>
                    <button onClick={() => alert('Action lancée.')} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition">{o.a}</button>
                  </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION AVANTAGES PARTENAIRE */}
      {showPartnerConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in text-center">
            <div className="w-20 h-20 bg-[#39FF14]/10 rounded-full flex items-center justify-center mx-auto mb-6"><ShieldCheck size={40} className="text-[#39FF14]" /></div>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 italic`}>Activer statut Partenaire ?</h2>
            <div className="space-y-4 text-left mb-8">
               <div className="flex gap-3 text-xs font-bold text-zinc-600 uppercase italic"><Check size={16} className="text-[#39FF14]"/> -30% immédiat sur ses abonnements.</div>
               <div className="flex gap-3 text-xs font-bold text-zinc-600 uppercase italic"><Check size={16} className="text-[#39FF14]"/> Lien d'affiliation actif dans son Hub.</div>
               <div className="flex gap-3 text-xs font-bold text-zinc-600 uppercase italic"><Check size={16} className="text-[#39FF14]"/> 20% de commission par vente validée.</div>
            </div>
            <button onClick={() => confirmPartnerTransition(showPartnerConfirm)} className="w-full py-4 bg-black text-[#39FF14] font-black text-xs uppercase rounded-xl shadow-xl hover:scale-105 transition">Confirmer & Activer Hub</button>
            <button onClick={() => setShowPartnerConfirm(null)} className="w-full mt-2 py-2 text-zinc-400 font-black text-[10px] uppercase hover:text-black transition">Annuler</button>
          </div>
        </div>
      )}

      {/* MODALE AJOUT CLIENT / ESSAI */}
      {showAddClientModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-12 shadow-2xl relative animate-in zoom-in">
            <button onClick={() => setShowAddClientModal(false)} className="absolute top-8 right-8 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={18}/></button>
            <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-8 italic tracking-tighter`}>{newClient.id ? 'Modifier' : 'Ajouter / Essai Gratuit'}</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nom Complet" value={newClient.full_name} onChange={e => setNewClient({...newClient, full_name: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
              <input type="text" placeholder="WhatsApp / Email" value={newClient.contact} onChange={e => setNewClient({...newClient, contact: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition" />
              <select value={newClient.saas} onChange={e => setNewClient({...newClient, saas: e.target.value})} className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none cursor-pointer">
                 {ECOSYSTEM_SAAS.map(e => <option key={e.id} value={e.name}>{e.name}</option>)}
              </select>
            </div>
            <button onClick={saveClient} className="w-full py-5 bg-[#39FF14] text-black font-black text-sm uppercase rounded-2xl mt-8 shadow-xl hover:scale-105 transition">Enregistrer</button>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 mx-2 rounded-2xl transition-all font-bold text-sm italic ${active ? 'bg-black text-[#39FF14] shadow-xl translate-x-1' : 'text-zinc-400 hover:bg-zinc-100 hover:text-black'}`}>
      <div className={`${active ? 'text-[#39FF14]' : 'text-zinc-300'}`}>{icon}</div>{label}
    </button>
  );
}
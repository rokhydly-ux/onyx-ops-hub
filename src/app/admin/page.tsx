"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { Space_Grotesk, Inter } from "next/font/google";
import { 
  Users, Wallet, LayoutDashboard, LogOut, TrendingUp, CheckCircle, 
  MessageSquare, UserPlus, X, Send, Edit3, Home, Search, Target, Globe, Box, Plus, Sparkles,
  BarChart3, CreditCard, CalendarClock, PhoneCall, Key, ChevronLeft, PlayCircle, ShieldCheck, Mail
} from "lucide-react";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["300", "500", "700", "900"] });
const inter = Inter({ subsets: ["latin"], weight: ["400", "600", "700", "900"] });

// LES 9 SAAS DE L'ÉCOSYSTÈME ONYX
const ECOSYSTEM_SAAS = [
  { id: "vente", name: "Onyx Vente", price: "15.000 F", type: "Social Selling", users: 142, icon: "🛍️", color: "bg-blue-100 text-blue-600" },
  { id: "tiak", name: "Onyx Tiak", price: "10.000 F", type: "Logistique", users: 89, icon: "🛵", color: "bg-orange-100 text-orange-600" },
  { id: "stock", name: "Onyx Stock", price: "15.000 F", type: "Inventaire", users: 112, icon: "📦", color: "bg-purple-100 text-purple-600" },
  { id: "menu", name: "Onyx Menu", price: "12.500 F", type: "Restauration", users: 45, icon: "🍔", color: "bg-red-100 text-red-600" },
  { id: "booking", name: "Onyx Booking", price: "15.000 F", type: "Réservation", users: 28, icon: "📅", color: "bg-teal-100 text-teal-600" },
  { id: "staff", name: "Onyx Staff", price: "20.000 F", type: "RH & Paie", users: 34, icon: "👥", color: "bg-yellow-100 text-yellow-600" },
  { id: "crm", name: "Onyx CRM", price: "25.000 F", type: "Fidélisation", users: 56, icon: "🤝", color: "bg-indigo-100 text-indigo-600" },
  { id: "ia", name: "Onyx IA", price: "30.000 F", type: "Marketing Auto", users: 19, icon: "🧠", color: "bg-[#39FF14]/20 text-green-700" },
  { id: "link", name: "Onyx Link", price: "5.000 F", type: "Bio & Catalogue", users: 210, icon: "🔗", color: "bg-pink-100 text-pink-600" },
];

export default function AdminBentoTerminal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  
  // DONNÉES DE BASE
  const [usersList, setUsersList] = useState<any[]>([]);
  const [articlesList, setArticlesList] = useState<any[]>([]);
  const [partnersList, setPartnersList] = useState<any[]>([]);
  
  // ÉTATS DE NAVIGATION INTERNE
  const [crmFilter, setCrmFilter] = useState("all");
  const [selectedSaaS, setSelectedSaaS] = useState<any>(null);

  // MODALES
  const [showAddClientModal, setShowAddClientModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  
  // FORMULAIRES
  const [newClient, setNewClient] = useState({ id: "", full_name: "", contact: "", saas: "Onyx Vente", role: "prospect", expire: "En essai (J-7)", is_partner: false });

  useEffect(() => { fetchInitData(); }, []);

  async function fetchInitData() {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    setUser(authUser || { full_name: "Admin" });

    // Récupération sécurisée avec gestion d'erreurs
    try {
      const [clientsRes, articlesRes, partnersRes] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('articles').select('*').order('created_at', { ascending: false }),
        supabase.from('partners').select('*').order('created_at', { ascending: false })
      ]);
      if (clientsRes.data) setUsersList(clientsRes.data);
      if (articlesRes.data) setArticlesList(articlesRes.data);
      if (partnersRes.data) setPartnersList(partnersRes.data);
    } catch (error) { console.log("Init error", error); }
    
    setLoading(false);
  }

  // --- SAUVEGARDE CLIENT (FIX UUID) ---
  const saveClient = async () => {
    if(!newClient.full_name) return;
    const clientData = { ...newClient };
    
    // FIX UUID: Ne jamais envoyer un ID vide
    if (!clientData.id || clientData.id === "") delete clientData.id;

    if (newClient.id) {
      const { error } = await supabase.from('clients').update(clientData).eq('id', newClient.id);
      if(!error) setUsersList(usersList.map(u => u.id === newClient.id ? { ...u, ...clientData } : u));
    } else {
      const { data, error } = await supabase.from('clients').insert(clientData).select().single();
      if(!error && data) setUsersList([data, ...usersList]);
    }
    setShowAddClientModal(false);
  };

  // --- ACTIONS CRM (MOT DE PASSE, PARTENAIRE) ---
  const generatePassword = (client: any) => {
    const pwd = Math.random().toString(36).slice(-8).toUpperCase() + "!";
    alert(`Mot de passe généré pour ${client.full_name} : ${pwd}\n\nLien de connexion : https://${client.saas.toLowerCase().replace(' ', '')}.onyxops.com/login`);
  };

  const convertToPartner = (client: any) => {
    if(confirm(`Convertir ${client.full_name} en Partenaire ? Il aura -30% sur ses propres achats et un lien d'affiliation.`)) {
       // Logique de mise à jour Supabase ici...
       alert(`${client.full_name} est maintenant partenaire !`);
    }
  };

  // --- FILTRES CRM ---
  const filteredUsers = usersList.filter(u => {
    if (crmFilter === 'all') return true;
    if (crmFilter === 'top') return u.saas === 'Onyx IA' || u.is_partner;
    if (crmFilter === 'dormant') return u.role === 'dormant';
    if (crmFilter === 'relance') return u.expire?.includes('Expiré');
    if (crmFilter === 'expire') return u.expire?.includes('J-');
    return true;
  });

  if (loading) return <div className={`${spaceGrotesk.className} min-h-screen flex items-center justify-center bg-white font-black uppercase text-3xl animate-pulse`}>Chargement OnyxOps...</div>;

  return (
    <div className={`${inter.className} min-h-screen bg-[#F8F9FA] text-black flex overflow-hidden`}>
      
      {/* SIDEBAR */}
      <nav className="w-64 bg-white border-r border-zinc-200 p-6 flex flex-col justify-between hidden lg:flex shadow-sm z-10">
        <div>
          <div className="mb-12 flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <span className={`${spaceGrotesk.className} font-black text-4xl tracking-tighter uppercase`}>ONYX<span className="text-[#39FF14]">OPS</span></span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 ml-2">Menu Principal</p>
          <div className="space-y-2">
            <NavBtn icon={<LayoutDashboard size={20}/>} label="Dashboard" active={activeTab === 'overview'} onClick={() => {setActiveTab('overview'); setSelectedSaaS(null);}} />
            <NavBtn icon={<Users size={20}/>} label="Membres & CRM" active={activeTab === 'users'} onClick={() => {setActiveTab('users'); setSelectedSaaS(null);}} />
            <NavBtn icon={<Box size={20}/>} label="Écosystème (9 SaaS)" active={activeTab === 'ecosystem'} onClick={() => setActiveTab('ecosystem')} />
            <NavBtn icon={<Target size={20}/>} label="Partenaires" active={activeTab === 'partners'} onClick={() => {setActiveTab('partners'); setSelectedSaaS(null);}} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-8 mb-4 ml-2">Automatisations</p>
            <NavBtn icon={<CalendarClock size={20}/>} label="Séquences & IA" active={activeTab === 'marketing'} onClick={() => setActiveTab('marketing')} />
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="h-20 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-8 flex justify-between items-center z-10 shadow-sm">
          <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase tracking-tighter`}>
            {selectedSaaS ? selectedSaaS.name : activeTab}
          </h1>
          <button onClick={() => supabase.auth.signOut()} className="text-zinc-400 hover:text-red-500"><LogOut size={20}/></button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 scroll-smooth flex flex-col">
          
          {/* ================= 1. DASHBOARD PRINCIPAL ================= */}
          {activeTab === 'overview' && !selectedSaaS && (
             <div className="animate-in fade-in">
                <div className="mb-10">
                   <h2 className={`${spaceGrotesk.className} text-6xl font-black uppercase tracking-tighter italic mb-4`}>COCKPIT <span className="text-[#39FF14]">EMPIRE</span></h2>
                   <p className="text-sm font-bold text-zinc-500">Vue globale sur vos 9 applications et vos revenus.</p>
                </div>
                {/* Résumé Rapide */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                   <div className="bg-black text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/20 rounded-full blur-3xl"></div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#39FF14] mb-2">Revenu Mensuel</p>
                      <p className={`${spaceGrotesk.className} text-5xl font-black tracking-tighter`}>4.250.000 F</p>
                   </div>
                   <div onClick={() => setActiveTab('users')} className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-black transition">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Utilisateurs Actifs</p>
                      <p className={`${spaceGrotesk.className} text-5xl font-black tracking-tighter`}>719</p>
                   </div>
                   <div onClick={() => setActiveTab('ecosystem')} className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm cursor-pointer hover:border-[#39FF14] transition">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">SaaS Déployés</p>
                      <p className={`${spaceGrotesk.className} text-5xl font-black tracking-tighter`}>9/9</p>
                   </div>
                </div>
             </div>
          )}

          {/* ================= 2. ÉCOSYSTÈME (LES 9 SAAS) ================= */}
          {activeTab === 'ecosystem' && !selectedSaaS && (
             <div className="animate-in fade-in">
                <h3 className={`${spaceGrotesk.className} font-black uppercase text-3xl tracking-tighter mb-8`}>La Suite OnyxOps</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {ECOSYSTEM_SAAS.map(saas => (
                      <div key={saas.id} onClick={() => setSelectedSaaS(saas)} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:border-black transition cursor-pointer group">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 ${saas.color}`}>
                            {saas.icon}
                         </div>
                         <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase mb-1 group-hover:text-[#39FF14] transition`}>{saas.name}</h4>
                         <p className="text-xs font-bold text-zinc-500 mb-4">{saas.type}</p>
                         <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{saas.users} Clients</span>
                            <span className="bg-black text-white px-3 py-1 rounded-full text-[10px] font-black">{saas.price}/m</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {/* VUE DÉTAILLÉE D'UN SAAS SÉLECTIONNÉ */}
          {selectedSaaS && (
             <div className="animate-in slide-in-from-right-8 duration-300">
                <button onClick={() => setSelectedSaaS(null)} className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-black transition">
                   <ChevronLeft size={16}/> Retour à l'écosystème
                </button>
                
                <div className="bg-black text-white p-10 rounded-[3rem] shadow-2xl mb-8 relative overflow-hidden">
                   <div className="absolute right-10 top-1/2 transform -translate-y-1/2 text-8xl opacity-10">{selectedSaaS.icon}</div>
                   <div className="flex items-center gap-4 mb-4 relative z-10">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${selectedSaaS.color}`}>{selectedSaaS.icon}</div>
                      <h2 className={`${spaceGrotesk.className} text-4xl font-black uppercase tracking-tighter`}>{selectedSaaS.name}</h2>
                   </div>
                   <p className="text-zinc-400 font-bold max-w-lg relative z-10 mb-8">Base de données isolée et gestion des clients pour {selectedSaaS.name}.</p>
                   
                   <div className="flex gap-4 relative z-10">
                      <button className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2">
                         <Key size={16}/> URL Login Client
                      </button>
                      <button className="bg-zinc-800 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white hover:text-black transition">
                         Générer un accès Test
                      </button>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-xl mb-6`}>Clients actifs sur {selectedSaaS.name} ({selectedSaaS.users})</h3>
                   <div className="text-center p-12 text-zinc-400 font-bold uppercase text-sm border-2 border-dashed border-zinc-200 rounded-3xl">
                      [Simulation Base de données {selectedSaaS.id}] <br/><br/>
                      Ici s'afficheront uniquement les données des utilisateurs ayant souscrit à {selectedSaaS.name}.
                   </div>
                </div>
             </div>
          )}

          {/* ================= 3. CRM & MEMBRES ================= */}
          {activeTab === 'users' && !selectedSaaS && (
             <div className="animate-in fade-in">
                {/* HEADER CRM + BOUTON SCANNER */}
                <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200 mb-6">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter flex items-center gap-3`}><Users className="text-[#39FF14]"/> CRM Hub</h3>
                   <div className="flex gap-4">
                     <button onClick={() => setShowScannerModal(true)} className="bg-black text-[#39FF14] px-6 py-4 rounded-xl font-black text-[10px] uppercase shadow-lg hover:scale-105 transition flex items-center gap-2 tracking-widest">
                        <Sparkles size={16}/> Scanner la base (IA)
                     </button>
                     <button onClick={() => setShowAddClientModal(true)} className="bg-zinc-100 border border-zinc-200 text-black px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white transition">
                        Ajouter Contact
                     </button>
                   </div>
                </div>

                {/* LES 4 KPI CLIQUABLES */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  <div onClick={() => setCrmFilter('top')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'top' ? 'bg-black text-[#39FF14] border-black shadow-lg' : 'bg-white border-zinc-200 hover:border-black'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Target size={14}/> Top Clients VIP</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>14</p>
                  </div>
                  <div onClick={() => setCrmFilter('dormant')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'dormant' ? 'bg-zinc-800 text-white border-zinc-600 shadow-lg' : 'bg-white border-zinc-200 hover:border-zinc-800'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><MessageSquare size={14}/> Clients Dormants</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>28</p>
                  </div>
                  <div onClick={() => setCrmFilter('expire')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'expire' ? 'bg-red-50 text-red-600 border-red-200 shadow-lg' : 'bg-white border-zinc-200 hover:border-red-400'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><CalendarClock size={14}/> Expirations (J-7)</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>12</p>
                  </div>
                  <div onClick={() => setCrmFilter('relance')} className={`p-6 rounded-[2rem] border cursor-pointer transition ${crmFilter === 'relance' ? 'bg-[#39FF14]/20 text-green-800 border-[#39FF14] shadow-lg' : 'bg-white border-zinc-200 hover:border-[#39FF14]'}`}>
                     <p className="text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2"><PhoneCall size={14}/> À Relancer</p>
                     <p className={`${spaceGrotesk.className} text-4xl font-black`}>8</p>
                  </div>
                </div>

                {/* LISTE DES CLIENTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((u) => (
                    <div key={u.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm hover:border-black transition flex flex-col justify-between relative overflow-hidden group">
                      {u.is_partner && <div className="absolute top-0 right-0 bg-[#39FF14] text-black px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl"><ShieldCheck size={10} className="inline mr-1"/> Partenaire</div>}
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <img src={u.avatar_url || `https://ui-avatars.com/api/?name=${u.full_name}`} className="w-14 h-14 rounded-full object-cover border-2 border-zinc-100" alt="" />
                          <button onClick={() => generatePassword(u)} className="text-[9px] font-black uppercase tracking-widest bg-zinc-100 text-zinc-500 px-3 py-1.5 rounded-lg hover:bg-black hover:text-white transition flex items-center gap-1">
                             <Key size={10}/> Accès SaaS
                          </button>
                        </div>
                        <p className="font-black text-xl mb-1 uppercase tracking-tight">{u.full_name}</p>
                        <p className="text-xs font-bold text-zinc-400 mb-4 flex items-center gap-1"><Mail size={12}/> {u.contact}</p>
                        
                        <div className="bg-zinc-50 p-4 rounded-2xl mb-4 border border-zinc-100">
                          <div className="flex justify-between items-center mb-2"><span className="text-[10px] font-black uppercase text-zinc-500">SaaS Actif</span><span className="text-[10px] font-black">{u.saas}</span></div>
                          <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-zinc-500">Statut</span><span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${u.expire?.includes('Expire') ? 'bg-red-100 text-red-600' : 'bg-[#39FF14]/20 text-green-700'}`}>{u.expire}</span></div>
                        </div>
                      </div>
                      
                      {!u.is_partner && (
                         <button onClick={() => convertToPartner(u)} className="w-full text-center py-2 mt-2 border border-dashed border-zinc-300 text-zinc-400 rounded-xl text-[10px] font-black uppercase hover:border-[#39FF14] hover:text-[#39FF14] transition">
                            Convertir en Partenaire
                         </button>
                      )}
                    </div>
                  ))}
                </div>
             </div>
          )}

          {/* ================= 4. AUTOMATISATIONS & SÉQUENCES ================= */}
          {activeTab === 'marketing' && !selectedSaaS && (
             <div className="animate-in fade-in space-y-8">
                {/* Séquences Auto */}
                <div className="bg-black text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden">
                   <div className="absolute right-0 top-0 p-10 opacity-5"><CalendarClock size={200}/></div>
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-3xl tracking-tighter mb-8 relative z-10 flex items-center gap-3`}><Sparkles className="text-[#39FF14]"/> Séquences Automatiques (Essais Gratuits)</h3>
                   <div className="grid md:grid-cols-3 gap-6 relative z-10">
                      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                         <span className="bg-white text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">J0 - Inscription</span>
                         <p className="font-bold text-sm mb-2">Message de Bienvenue + Tuto Vidéo</p>
                         <p className="text-xs text-zinc-400">Pousse l'utilisateur à configurer son catalogue immédiatement pour créer l'effet "Wahou".</p>
                      </div>
                      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl relative">
                         <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">J+7 - Milieu Essai</span>
                         <p className="font-bold text-sm mb-2">Relance "Comment ça se passe ?"</p>
                         <p className="text-xs text-zinc-400">Demande si le client a des blocages. Propose un appel gratuit de 10 min avec un expert.</p>
                      </div>
                      <div className="bg-[#39FF14]/10 border border-[#39FF14] p-6 rounded-2xl relative">
                         <span className="bg-[#39FF14] text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4 inline-block">J-1 - Expiration</span>
                         <p className="font-bold text-sm mb-2 text-white">Offre Irrésistible (-20%)</p>
                         <p className="text-xs text-zinc-300">"Votre essai expire demain. Ne perdez pas vos données de vente, voici un code promo..."</p>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* ================= 5. PARTENAIRES & FORMULAIRES ================= */}
          {activeTab === 'partners' && !selectedSaaS && (
             <div className="animate-in fade-in">
                <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-200 mb-8">
                   <h3 className={`${spaceGrotesk.className} font-black uppercase text-2xl tracking-tighter`}>Validation Partenaires</h3>
                </div>
                
                <div className="grid gap-6">
                   {partnersList.length === 0 && <p className="text-zinc-500 font-bold uppercase text-sm">Aucun formulaire reçu.</p>}
                   {partnersList.map(partner => (
                      <div key={partner.id} className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                         <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                               <h4 className={`${spaceGrotesk.className} font-black text-2xl uppercase`}>{partner.full_name}</h4>
                               <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-black uppercase">{partner.activity}</span>
                            </div>
                            <p className="text-xs font-bold text-zinc-500 mb-4 flex gap-4">
                               <span>📞 {partner.contact}</span> <span>📍 {partner.city}</span>
                            </p>
                            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 text-xs">
                               <p className="font-bold text-black mb-1">Objectif : <span className="font-medium text-zinc-600">{partner.objective || "Non précisé"}</span></p>
                               <p className="font-bold text-black">Prospection : <span className="font-medium text-zinc-600">{partner.prospection || "Non précisé"}</span></p>
                            </div>
                         </div>
                         <div className="flex flex-col gap-3 w-full md:w-auto">
                            {partner.status === 'En attente' ? (
                               <button className="bg-black text-[#39FF14] px-8 py-4 rounded-xl text-xs font-black uppercase hover:scale-105 transition shadow-xl">Approuver & Créer Accès</button>
                            ) : (
                               <span className="text-green-700 bg-green-50 px-6 py-4 rounded-xl font-black uppercase text-xs flex items-center justify-center gap-2 border border-green-200"><ShieldCheck size={16}/> Compte Actif</span>
                            )}
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          )}

        </div>
      </main>

      {/* --- MODALE : SCANNER IA --- */}
      {showScannerModal && (
         <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
           <div className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in">
             <button onClick={() => setShowScannerModal(false)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"><X size={16}/></button>
             <h2 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 tracking-tighter flex items-center gap-2`}><Sparkles className="text-[#39FF14]"/> Rapport IA CRM</h2>
             <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-8">L'IA a scanné votre base et trouvé 3 opportunités.</p>
             
             <div className="space-y-4">
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex justify-between items-center">
                   <div>
                      <p className="font-black uppercase text-sm">Boutique Chez Fatou</p>
                      <p className="text-xs text-zinc-500 font-medium">L'essai expire dans 24h. Fort usage du catalogue.</p>
                   </div>
                   <button className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Offre -20% (WhatsApp)</button>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex justify-between items-center">
                   <div>
                      <p className="font-black uppercase text-sm">Restaurant Le Dakar</p>
                      <p className="text-xs text-zinc-500 font-medium">Utilise Menu QR. N'a pas de logiciel RH.</p>
                   </div>
                   <button className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Upsell Onyx Staff</button>
                </div>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 mx-2 rounded-2xl transition-all font-bold text-sm ${active ? 'bg-black text-[#39FF14] shadow-md' : 'text-zinc-500 hover:bg-zinc-100 hover:text-black'}`}>
      <div className={`${active ? 'text-[#39FF14]' : 'text-zinc-400'}`}>{icon}</div>{label}
    </button>
  );
}
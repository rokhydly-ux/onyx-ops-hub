"use client";

import React, { useState, useEffect } from 'react';
import { 
  Copy, CheckCircle, Users, DollarSign, TrendingUp, 
  LogOut, Link as LinkIcon, Info, ShieldCheck, 
  ChevronDown, Package, Zap, ArrowRight, X,
  MessageCircle, Trash2, Trophy, Settings,
  Sun, Moon, Medal, Target, Download, FileText, Image as ImageIcon, Facebook, Twitter, Video,
  Clock, ShoppingBag
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const spaceGrotesk = { className: "font-sans" };

// --- CATALOGUE DE TOUS LES PRODUITS ---
const PRODUCTS_CATALOG = [
  { category: "📦 Packs SaaS (30% / 10%)", items: [
    { name: "Pack Tekki", price: 22900, type: "saas" },
    { name: "OnyxTekki (Resto)", price: 22900, type: "saas" },
    { name: "Pack Tekki Pro", price: 27900, type: "saas" },
    { name: "Onyx CRM", price: 29900, type: "saas" },
    { name: "Pack Onyx Gold", price: 59900, type: "saas" },
  ]},
  { category: "🧩 Modules Individuels (30% / 10%)", items: [
    { name: "Onyx Jaay (Vente)", price: 13900, type: "saas" },
    { name: "Onyx Menu (Resto)", price: 13900, type: "saas" },
    { name: "Onyx Booking (Rdv)", price: 13900, type: "saas" },
    { name: "Onyx Staff (RH)", price: 13900, type: "saas" },
    { name: "Onyx Stock (Inventaire)", price: 13900, type: "saas" },
    { name: "Onyx Tiak (Livreurs)", price: 13900, type: "saas" },
    { name: "Onyx Tontine", price: 6900, type: "saas" },
    { name: "Onyx Formation", price: 9900, type: "saas" },
  ]},
  { category: "🚀 Options & High-Ticket (15% / 5%)", items: [
    { name: "Option CM & Pub", price: 49900, type: "service" },
    { name: "Onyx Boost (Agence)", price: 150000, type: "service" },
    { name: "Onyx Modernize (One-Shot)", price: 300000, type: "oneshot" },
  ]}
];

export default function AmbassadorHub() {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [showCatalog, setShowCatalog] = useState(false);
  const [isDark, setIsDark] = useState(true);
  
  // État de la modale de retrait
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({ phone: '', method: 'Wave', amount: '' });
  
  // Définition de base pour prospects (à alimenter depuis Supabase dans votre intégration finale)
  const [prospects, setProspects] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [topAmbassadors, setTopAmbassadors] = useState<any[]>([]);
  const [ambassadorData, setAmbassadorData] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [marketingMaterials, setMarketingMaterials] = useState<any[]>([]);

  const ambassadorLink = ambassadorData?.id 
    ? `https://onyxops.com/ref/${ambassadorData.id}` 
    : "Chargement du lien...";

  // Styles dynamiques Dark/Light
  const themeBg = isDark ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-black';
  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';
  const textMuted = isDark ? 'text-zinc-400' : 'text-zinc-500';

  const handleCopy = () => {
    navigator.clipboard.writeText(ambassadorLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem('onyx_ambassador_session');
    router.push('/ambassadeurs/login');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      const sessionStr = localStorage.getItem('onyx_ambassador_session');
      if (sessionStr) {
        try {
          const parsedData = JSON.parse(sessionStr);
          
          // 1. On récupère les VRAIES données Supabase du Ambassadeur
          const { data: freshUser } = await supabase.from('ambassadors').select('*').eq('id', parsedData.id).single();
          const finalUser = freshUser || parsedData;
          
          setAmbassadorData(finalUser);
          setEditName(finalUser.full_name || '');
          setEditAvatar(finalUser.avatar_url || '');
          if (freshUser) localStorage.setItem('onyx_ambassador_session', JSON.stringify(freshUser));

          const { data, error } = await supabase
            .from('withdrawals')
            .select('*')
            .eq('ambassador_id', parsedData.id)
            .order('created_at', { ascending: false });
          if (data) setWithdrawals(data);

          const { data: topData } = await supabase
            .from('ambassadors')
            .select('id, full_name, sales')
            .eq('status', 'Actif')
            .order('sales', { ascending: false })
            .limit(5);
          if (topData) setTopAmbassadors(topData);

          // Récupération des prospects affiliés
          const { data: leadsData } = await supabase.from('leads').select('*').eq('ambassador_id', finalUser.id);
          if (leadsData) setProspects(leadsData);

          // Récupération du matériel marketing
          const { data: materialsData } = await supabase.from('marketing_materials').select('*');
          if (materialsData) setMarketingMaterials(materialsData);
          
        } catch (e) {}
      }
    };
    fetchDashboardData();
  }, []);

  const handleShareMedia = (url: string, title: string, platform: string) => {
     const text = `Découvrez ${title} : ${url}`;
     if (platform === 'whatsapp') {
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
     } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
     } else if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
     }
  };
  const getEmbedUrl = (url: string) => {
      if (!url) return '';
      let videoId = '';
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})/);
      if (match && match[1]) { videoId = match[1]; return `https://www.youtube.com/embed/${videoId}`; }
      return url;
  };

  // Logique de calcul des commissions (Tableau des filleuls)
  const calculateCommission = (price: number, hasCM: boolean, isMonth1: boolean) => {
    const saasRate = isMonth1 ? 0.30 : 0.10;
    const cmRate = isMonth1 ? 0.15 : 0.05;
    const cmPrice = 49900;
    
    let commission = price * saasRate;
    if (hasCM) {
      commission += cmPrice * cmRate;
    }
    return Math.round(commission);
  };

  // Helper pour afficher la commission dans le catalogue
  const getCatalogCommission = (price: number, type: string) => {
    if (type === 'saas') {
      return { m1: Math.round(price * 0.30), rec: Math.round(price * 0.10) };
    } else if (type === 'service') {
      return { m1: Math.round(price * 0.15), rec: Math.round(price * 0.05) };
    } else {
      return { m1: Math.round(price * 0.15), rec: 0 }; // One-shot
    }
  };

  // Calcul des gains générés par les filleuls réels
  const totalEarnings = prospects.reduce((sum, p) => {
    if (p.status === 'Converti' || p.status === 'Actif' || p.status === 'Payé') {
       const productName = p.intent || 'Onyx Jaay';
       const price = productName.includes('Tekki Pro') ? 27900 : productName.includes('Tekki') ? 22900 : productName.includes('CRM') ? 29900 : productName.includes('Gold') ? 59900 : productName.includes('Formation') ? 9900 : productName.includes('Tontine') ? 6900 : 13900;
       return sum + calculateCommission(price, false, true);
    }
    return sum;
  }, 0);
  
  const handleWithdrawSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawForm.phone || !withdrawForm.amount) return alert("Veuillez remplir tous les champs.");
    if (parseInt(withdrawForm.amount) > totalEarnings) return alert("Le montant demandé est supérieur à vos gains disponibles.");
    
    try {
      const sessionStr = typeof window !== 'undefined' ? localStorage.getItem('onyx_ambassador_session') : null;
      const currentAmbassadorData = sessionStr ? JSON.parse(sessionStr) : ambassadorData;

      const { data, error } = await supabase.from('withdrawals').insert([{
        ambassador_id: currentAmbassadorData?.id || 'AMB-INCONNU',
        ambassador_name: currentAmbassadorData?.full_name || 'Ambassadeur Anonyme',
        phone: withdrawForm.phone,
        method: withdrawForm.method,
        amount: parseInt(withdrawForm.amount),
        status: 'En attente'
      }]).select();

      if (error) throw error;

      if (data && data.length > 0) {
         setWithdrawals([data[0], ...withdrawals]);
      } else {
         setWithdrawals([{
            id: Date.now(),
            method: withdrawForm.method,
            phone: withdrawForm.phone,
            amount: parseInt(withdrawForm.amount),
            status: 'En attente',
            created_at: new Date().toISOString()
         }, ...withdrawals]);
      }

      alert(`✅ Demande envoyée ! Votre retrait de ${parseInt(withdrawForm.amount).toLocaleString()} F CFA via ${withdrawForm.method} sur le numéro ${withdrawForm.phone} est en cours de traitement (24h à 48h).`);
      setShowWithdrawModal(false);
      setWithdrawForm({ phone: '', method: 'Wave', amount: '' });
    } catch (err: any) {
      alert("Erreur lors de la demande de retrait : " + err.message);
    }
  };

  const handleDeleteWithdrawal = async (id: string | number) => {
    if (!confirm("Voulez-vous vraiment annuler cette demande de retrait ?")) return;
    try {
      const { error } = await supabase.from('withdrawals').delete().eq('id', id);
      if (error) throw error;
      setWithdrawals(prev => prev.filter(w => w.id !== id));
      alert("Demande annulée avec succès.");
    } catch (e: any) {
      alert("Erreur lors de l'annulation: " + e.message);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalNewPin = ambassadorData.password_temp;
      if (newPin || oldPin) {
         if (!oldPin) return alert("Veuillez saisir l'ancien PIN.");
         if (newPin.length !== 4) return alert("Le nouveau PIN doit faire 4 chiffres.");
         const submittedOld = oldPin === "0000" ? "central2026" : oldPin + "00";
         if (ambassadorData.password_temp !== submittedOld && ambassadorData.password_temp !== "central2026") return alert("Ancien PIN incorrect.");
         finalNewPin = newPin + "00";
      }
      const { error } = await supabase.from('ambassadors').update({ full_name: editName, avatar_url: editAvatar, password_temp: finalNewPin }).eq('id', ambassadorData.id);
      if(error) throw error;
      
      alert("Profil mis à jour avec succès !");
      const updatedData = {...ambassadorData, full_name: editName, avatar_url: editAvatar, password_temp: finalNewPin};
      setAmbassadorData(updatedData);
      localStorage.setItem('onyx_ambassador_session', JSON.stringify(updatedData));
      setShowSettings(false);
      setOldPin(''); setNewPin('');
    } catch(err:any) {
      alert("Erreur: " + err.message);
    }
  };

  const isTopSeller = topAmbassadors.length > 0 && ambassadorData && topAmbassadors[0].id === ambassadorData.id;

  // GAMIFICATION (Niveau & Badges)
  const sales = ambassadorData?.sales || 0;
  let badgeName = "Bronze";
  let nextBadge = "Silver";
  let goal = 5;
  let badgeColor = "text-orange-400 bg-orange-400/10 border-orange-400/30";
  if (sales >= 15) { badgeName = "Gold"; nextBadge = "Platinum"; goal = 50; badgeColor = "text-yellow-400 bg-yellow-400/10 border-yellow-400/30"; }
  else if (sales >= 5) { badgeName = "Silver"; nextBadge = "Gold"; goal = 15; badgeColor = "text-zinc-400 bg-zinc-400/10 border-zinc-400/30"; }
  const progress = Math.min(100, (sales / goal) * 100);

  return (
    <div className={`min-h-screen ${themeBg} font-sans pb-20 selection:bg-[#39FF14] selection:text-black transition-colors duration-300`}>
      
      {/* HEADER NAVBAR */}
      <header className={`${isDark ? 'bg-black/50 border-zinc-800' : 'bg-white/80 border-zinc-200'} backdrop-blur-md border-b sticky top-0 z-50 transition-colors`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
        {ambassadorData?.avatar_url ? (
           <img src={ambassadorData.avatar_url} alt="Avatar" className="w-10 h-10 rounded-xl border border-[#39FF14] object-cover shadow-sm" />
        ) : (
           <div className="w-10 h-10 bg-[#39FF14] rounded-xl flex items-center justify-center shadow-lg">
             <Trophy size={20} className="text-black" />
           </div>
        )}
          <div className="flex flex-col">
             <h1 className="text-xl font-black uppercase tracking-tighter text-[#39FF14] leading-tight hidden sm:block">
               Onyx Ambassadeurs
             </h1>
             <p className={`text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>
               Bienvenue, {ambassadorData?.full_name?.split(' ')[0] || "Partenaire"}
             </p>
          </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full border ${isDark ? 'border-zinc-700 hover:bg-zinc-800 text-yellow-400' : 'border-zinc-200 hover:bg-zinc-100 text-zinc-600'} transition-all`}>
               {isDark ? <Sun size={16} /> : <Moon size={16} />}
             </button>
             <button onClick={() => setShowSettings(true)} className={`flex items-center gap-2 text-xs font-bold ${textMuted} hover:text-[#39FF14] transition-colors`}>
               <Settings size={16} /> <span className="hidden md:inline">Paramètres</span>
             </button>
             <button onClick={handleLogout} className={`flex items-center gap-2 text-xs font-bold ${textMuted} hover:text-red-500 transition-colors`}>
               <LogOut size={16} /> <span className="hidden sm:inline">Quitter</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-10">
        
        {/* MESSAGE BIENVENUE & LIEN D'AFFILIATION */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className={`lg:col-span-2 ${cardBg} border p-8 rounded-[2rem] relative overflow-hidden shadow-sm transition-colors`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#39FF14]/10 rounded-full blur-[80px] pointer-events-none"></div>
            
            <h1 className={`${spaceGrotesk.className} text-3xl font-black uppercase mb-2 relative z-10 flex flex-wrap items-center gap-3`}>
               Votre Espace Personnel
               {isTopSeller && <span className="bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-pulse flex items-center gap-1"><Trophy size={14}/> Top Vendeur</span>}
            </h1>
            <p className={`${textMuted} font-medium mb-8 relative z-10`}>Voici votre lien unique. Partagez-le à votre réseau pour générer votre rente passive sur <span className={isDark ? 'text-white font-bold' : 'text-black font-bold'}>tous nos produits</span>.</p>
            
            <div className="bg-black border border-zinc-700 p-2 pl-6 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-4 relative z-10">
              <span className="text-sm font-bold text-white truncate w-full sm:w-auto flex-1">{ambassadorLink}</span>
              <button 
                onClick={handleCopy}
                className="w-full sm:w-auto bg-[#39FF14] text-black px-6 py-3 rounded-lg text-xs font-black uppercase hover:bg-white transition-all flex justify-center items-center gap-2 flex-shrink-0"
              >
                {copied ? <><CheckCircle size={16} /> Copié !</> : <><Copy size={16} /> Copier le lien</>}
              </button>
            </div>
          </div>

          {/* KPI RAPIDE */}
          <div className="bg-[#39FF14] text-black p-8 rounded-[2rem] shadow-[0_10px_40px_rgba(57,255,20,0.15)] flex flex-col justify-center hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2 mb-4 opacity-80">
              <DollarSign size={20} />
              <h3 className="font-black uppercase text-xs tracking-widest">Gains Disponibles</h3>
            </div>
          <p className={`${spaceGrotesk.className} text-5xl font-black tracking-tighter`}>{totalEarnings.toLocaleString()} F</p>
            <button onClick={() => setShowWithdrawModal(true)} className="mt-6 bg-black text-[#39FF14] w-full py-3 rounded-xl font-black text-xs uppercase hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
              Demander un retrait
            </button>
          </div>
        </div>

        {/* GAMIFICATION : BADGES & MISSIONS */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
           {/* BADGES */}
           <div className={`${cardBg} rounded-[2rem] p-6 shadow-sm relative overflow-hidden group hover:border-[#39FF14]/50 transition-colors`}>
              <h2 className={`flex items-center gap-3 text-lg font-black uppercase mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                 <Medal size={22} className="text-[#39FF14]" /> Mon Niveau & Badges
              </h2>
              <div className="flex items-center gap-5 mb-6 relative z-10">
                 <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-lg ${badgeColor}`}>
                    <Medal size={36} />
                 </div>
                 <div>
                    <p className={`text-[10px] font-bold uppercase tracking-widest ${textMuted}`}>Statut Ambassadeur</p>
                    <p className={`text-3xl font-black uppercase ${isDark ? 'text-white' : 'text-black'}`}>{badgeName}</p>
                 </div>
              </div>
              <div className={`w-full ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'} rounded-full h-3 mb-2 overflow-hidden shadow-inner relative z-10`}>
                 <div className="bg-[#39FF14] h-full transition-all duration-1000 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
              <p className={`text-xs font-bold ${textMuted} relative z-10`}>Plus que <span className="text-[#39FF14]">{goal - sales} ventes</span> pour débloquer le rang {nextBadge}.</p>
           </div>

           {/* MISSIONS FLASH */}
           <div className={`${cardBg} rounded-[2rem] p-6 shadow-sm relative overflow-hidden group hover:border-[#39FF14]/50 transition-colors`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-3xl pointer-events-none"></div>
              <h2 className="flex items-center gap-3 text-lg font-black uppercase mb-4 text-[#39FF14]">
                 <Target size={22} /> Missions Flash
              </h2>
              <div className={`p-5 rounded-[1.5rem] border ${isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'} relative z-10`}>
                 <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Défi de la semaine</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-1 bg-red-500/10 px-2 py-0.5 rounded animate-pulse"><Clock size={12}/> 48h restantes</span>
                 </div>
                 <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-black'} mb-1`}>Vendez 1 Pack Tekki Resto</p>
                 <p className="text-[#39FF14] font-black text-xl mb-5">+ 5.000 F CFA de Bonus</p>
                 <button onClick={() => alert("Mission acceptée ! Bonne prospection 🚀")} className="w-full py-3 bg-[#39FF14] text-black font-black text-xs uppercase rounded-xl hover:scale-105 transition-transform shadow-[0_10px_20px_rgba(57,255,20,0.2)]">Accepter la mission</button>
              </div>
           </div>
        </div>

        {/* BLOC EXPLICATIF DES TAUX */}
        <div className={`${cardBg} rounded-[2rem] p-8 mb-10 shadow-sm transition-colors`}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <Info className="text-[#00E5FF]" size={24} />
              <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase ${isDark ? 'text-white' : 'text-black'}`}>Règles de Rémunération</h2>
            </div>
            <button 
              onClick={() => setShowCatalog(!showCatalog)} 
              className={`${isDark ? 'bg-zinc-900 text-white hover:bg-zinc-800' : 'bg-zinc-100 text-black hover:bg-zinc-200'} px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-2`}
            >
              <Package size={14}/> {showCatalog ? "Masquer le catalogue" : "Voir tout le catalogue"}
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Règle SaaS */}
            <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:border-[#39FF14]/50 transition-colors`}>
              <div className="absolute top-0 right-0 w-1 h-full bg-[#39FF14]"></div>
              <h3 className={`font-black uppercase ${isDark ? 'text-white' : 'text-black'} mb-2 flex items-center gap-2`}>
                <ShieldCheck size={18} className="text-[#39FF14]" /> SaaS (Logiciels)
              </h3>
              <p className={`text-xs ${textMuted} mb-4 font-medium`}>S'applique sur tous les modules (Jaay, Menu, Tontine...) et Packs.</p>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Le 1er Mois (M1)</p>
                  <p className="text-2xl font-black text-[#39FF14]">30%</p>
                </div>
                <div className={`h-8 w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Récurrent à vie</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>10%</p>
                </div>
              </div>
            </div>

            {/* Règle Service CM */}
            <div className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border p-6 rounded-2xl flex flex-col justify-center relative overflow-hidden group hover:border-[#00E5FF]/50 transition-colors`}>
              <div className="absolute top-0 right-0 w-1 h-full bg-[#00E5FF]"></div>
              <h3 className={`font-black uppercase ${isDark ? 'text-white' : 'text-black'} mb-2 flex items-center gap-2`}>
                <TrendingUp size={18} className="text-[#00E5FF]" /> Option CM / High-Ticket
              </h3>
              <p className={`text-xs ${textMuted} mb-4 font-medium`}>S'applique sur l'Option CM, Onyx Boost et Modernize.</p>
              <div className="flex items-end gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Le 1er Mois (M1)</p>
                  <p className="text-2xl font-black text-[#00E5FF]">15%</p>
                </div>
                <div className={`h-8 w-px ${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}`}></div>
                <div>
                  <p className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-1">Récurrent à vie</p>
                  <p className={`text-2xl font-black ${isDark ? 'text-white' : 'text-black'}`}>5% <span className="text-[9px] text-zinc-500">(0% sur One-Shot)</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* CATALOGUE DÉPLIABLE DES COMMISSIONS */}
          {showCatalog && (
            <div className={`mt-8 pt-8 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-200'} animate-in slide-in-from-top-4 fade-in`}>
              <h3 className="font-black uppercase text-sm tracking-widest text-zinc-400 mb-6">Catalogue des Gains par Produit</h3>
              <div className="grid md:grid-cols-3 gap-8">
                {PRODUCTS_CATALOG.map((section, idx) => (
                  <div key={idx}>
                    <h4 className="font-bold text-[#39FF14] text-xs mb-4 uppercase tracking-widest">{section.category}</h4>
                    <ul className="space-y-3">
                      {section.items.map((item, i) => {
                        const comms = getCatalogCommission(item.price, item.type);
                        return (
                          <li key={i} className={`${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border p-3 rounded-xl flex flex-col gap-1`}>
                            <div className="flex justify-between items-center">
                              <span className={`font-black text-xs ${isDark ? 'text-white' : 'text-black'}`}>{item.name}</span>
                              <span className="text-[10px] font-bold text-zinc-500">{item.price.toLocaleString()} F</span>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <span className="text-[10px] font-bold text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.5 rounded">M1: +{comms.m1.toLocaleString()} F</span>
                              {comms.rec > 0 && <span className="text-[10px] font-bold text-zinc-400">Réc: +{comms.rec.toLocaleString()} F</span>}
                            </div>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* LEADERBOARD (CLASSEMENT) */}
        <div className="mb-10">
          <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
          <Trophy className="text-yellow-500" size={24} /> Classement des Ambassadeurs
          </h2>
          <div className={`${cardBg} rounded-[2rem] p-6 shadow-sm transition-colors`}>
             <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {topAmbassadors.map((amb, index) => (
                   <div key={amb.id} className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-transform hover:scale-105 ${index === 0 ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.2)] z-10' : index === 1 ? 'bg-zinc-300/10 border-zinc-300/30' : index === 2 ? 'bg-orange-500/10 border-orange-500/30' : isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'} ${amb.id === ambassadorData?.id ? 'ring-2 ring-[#39FF14]' : ''}`}>
                      <div className="relative mb-3">
                         <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg border-2 ${isDark ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-200 text-black'}`}>{amb.full_name?.charAt(0)}</div>
                         {index < 3 && <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg ${index === 0 ? 'bg-yellow-500 text-black' : index === 1 ? 'bg-zinc-300 text-black' : 'bg-orange-500 text-black'}`}>{index + 1}</div>}
                         {index === 0 && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-yellow-500 text-black text-[8px] font-black uppercase px-2 py-0.5 rounded-full shadow-md whitespace-nowrap z-20">Top Vendeur</div>}
                      </div>
                      <p className={`font-black text-sm uppercase truncate w-full text-center ${amb.id === ambassadorData?.id ? 'text-[#39FF14]' : (isDark ? 'text-white' : 'text-black')}`}>{amb.id === ambassadorData?.id ? 'Vous' : amb.full_name}</p>
                      <p className="text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest">{amb.sales || 0} Ventes</p>
                   </div>
                ))}
                {topAmbassadors.length === 0 && <p className="text-sm text-zinc-500 font-bold col-span-5 text-center">Aucun ambassadeur classé pour le moment.</p>}
             </div>
          </div>
        </div>

        {/* Section "Matériel Marketing" (Dynamique) */}
        <section className={`${cardBg} rounded-[2rem] p-6 shadow-sm mb-10 transition-colors`}>
          <h2 className="flex items-center gap-3 text-lg font-black uppercase text-[#39FF14] mb-6">
            <ShoppingBag size={22} /> Boîte à Outils Marketing
          </h2>
          
          {(() => {
            const defaultMaterials = [
              { id: 'd1', title: 'Démo Onyx Jaay - Vente WhatsApp', type: 'Vidéo', url: 'https://www.youtube.com/watch?v=acFsObjm2E0' },
              { id: 'd2', title: 'Présentation Onyx Tiak - Logistique', type: 'Vidéo', url: 'https://www.youtube.com/watch?v=acFsObjm2E0' },
              { id: 'd3', title: 'Affiche Promo Pack Tekki', type: 'Image', url: 'https://images.unsplash.com/photo-1557821552-17105176677c?q=80&w=800&auto=format&fit=crop' },
              { id: 'd4', title: 'Visuel Onyx CRM', type: 'Image', url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop' },
            ];

            const displayedMaterials = marketingMaterials.length > 0 ? marketingMaterials : defaultMaterials;
            const videos = displayedMaterials.filter((m: any) => m.type === 'Vidéo');
            const photos = displayedMaterials.filter((m: any) => m.type !== 'Vidéo');

            return (
               <div className="space-y-8">
                  {videos.length > 0 && (
                     <div>
                        <h3 className={`flex items-center gap-2 text-xl font-black uppercase mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                           <Video className="text-[#39FF14]" size={20} /> Vidéos de Démo
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {videos.map((material: any) => (
                              <div key={material.id} className={`${cardBg} rounded-[2rem] overflow-hidden shadow-sm border flex flex-col transition-transform hover:scale-[1.02] group`}>
                                 <div className="h-48 bg-zinc-800 relative overflow-hidden">
                                    {getEmbedUrl(material.url) ? (
                                       <iframe src={getEmbedUrl(material.url)} className="w-full h-full border-0" allowFullScreen></iframe>
                                    ) : (
                                       <img src={`https://img.youtube.com/vi/${material.url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`} alt={material.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e:any) => e.target.src = 'https://placehold.co/600x400/111/39FF14?text=Vidéo'} />
                                    )}
                                    <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#39FF14]/30 flex items-center gap-1">
                                       <Video size={12}/> Vidéo
                                    </span>
                                 </div>
                                 <div className="p-5 flex flex-col gap-4">
                                    <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-black'}`}>{material.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                       <button onClick={() => handleShareMedia(material.url, material.title, 'whatsapp')} className="p-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebd58] transition" title="WhatsApp"><MessageCircle size={16}/></button>
                                       <button onClick={() => handleShareMedia(material.url, material.title, 'facebook')} className="p-2 bg-[#1877F2] text-white rounded-lg hover:opacity-80 transition" title="Facebook"><Facebook size={16}/></button>
                                       <button onClick={() => handleShareMedia(material.url, material.title, 'twitter')} className="p-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition" title="X (Twitter)"><Twitter size={16}/></button>
                                       <button onClick={() => { navigator.clipboard.writeText(material.url); alert("Lien copié !"); }} className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"><LinkIcon size={14}/> Copier Lien</button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {photos.length > 0 && (
                     <div>
                        <h3 className={`flex items-center gap-2 text-xl font-black uppercase mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
                           <ImageIcon className="text-[#39FF14]" size={20} /> Visuels & Affiches
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                           {photos.map((material: any) => (
                              <div key={material.id} className={`${cardBg} rounded-[2rem] overflow-hidden shadow-sm border flex flex-col transition-transform hover:scale-[1.02] group`}>
                                 <div className="h-48 bg-zinc-800 relative overflow-hidden">
                                    <img src={material.url} alt={material.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" onError={(e:any) => e.target.src = 'https://placehold.co/600x400/111/39FF14?text=Image'} />
                                    <span className="absolute top-4 left-4 bg-black/80 backdrop-blur-md text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase border border-[#39FF14]/30 flex items-center gap-1">
                                       <ImageIcon size={12}/> Image
                                    </span>
                                 </div>
                                 <div className="p-5 flex flex-col gap-4">
                                    <h3 className={`font-black text-lg ${isDark ? 'text-white' : 'text-black'}`}>{material.title}</h3>
                                    <div className="flex flex-wrap items-center gap-2">
                                       <button onClick={() => handleShareMedia(material.url, material.title, 'whatsapp')} className="p-2 bg-[#25D366] text-white rounded-lg hover:bg-[#1ebd58] transition" title="WhatsApp"><MessageCircle size={16}/></button>
                                       <button onClick={() => handleShareMedia(material.url, material.title, 'facebook')} className="p-2 bg-[#1877F2] text-white rounded-lg hover:opacity-80 transition" title="Facebook"><Facebook size={16}/></button>
                                       <button onClick={() => handleShareMedia(material.url, material.title, 'twitter')} className="p-2 bg-black text-white rounded-lg hover:bg-zinc-800 transition" title="X (Twitter)"><Twitter size={16}/></button>
                                       <button onClick={() => { navigator.clipboard.writeText(material.url); alert("Lien copié !"); }} className="flex-1 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition"><LinkIcon size={14}/> Copier Lien</button>
                                    </div>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {marketingMaterials.length === 0 && (
                     <div className="mt-8 text-center p-6 border border-dashed border-zinc-500/50 rounded-2xl">
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Affichage de démonstration</p>
                        <p className="text-zinc-600 text-xs mt-2">L'administrateur n'a pas encore ajouté de contenu réel. Ces médias sont des exemples.</p>
                     </div>
                  )}
               </div>
            );
          })()}
        </section>

        {/* TABLEAU DES FILLEULS */}
        <div>
          <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
          <LinkIcon className="text-[#39FF14]" size={24} /> Suivi de vos Filleuls
          </h2>
          
          <div className={`${cardBg} rounded-[2rem] overflow-hidden shadow-sm transition-colors`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`${isDark ? 'bg-black/50 border-zinc-800' : 'bg-zinc-100 border-zinc-200'} border-b text-[10px] font-black uppercase tracking-widest ${textMuted}`}>
                    <th className="p-6 whitespace-nowrap">Date d'inscription</th>
                    <th className="p-6 whitespace-nowrap">Boutique</th>
                    <th className="p-6 whitespace-nowrap">Produit Principal</th>
                    <th className="p-6 whitespace-nowrap text-center">Add-on CM (+49.9k)</th>
                    <th className="p-6 whitespace-nowrap">Statut / Période</th>
                    <th className="p-6 whitespace-nowrap text-right">Commission (Est.)</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-zinc-800' : 'divide-zinc-200'}`}>
                  {prospects.map((prospect, index) => {
                    const productName = prospect.intent || 'Onyx Jaay';
                    const price = productName.includes('Tekki Pro') ? 27900 : productName.includes('Tekki') ? 22900 : productName.includes('CRM') ? 29900 : productName.includes('Gold') ? 59900 : productName.includes('Formation') ? 9900 : productName.includes('Tontine') ? 6900 : 13900;
                    const hasCM = productName.includes('CM');
                    const commission = calculateCommission(price, hasCM, true);
                    
                    return (
                      <tr key={prospect.id || index} className={`${isDark ? 'hover:bg-zinc-800/30' : 'hover:bg-zinc-50'} transition-colors`}>
                        <td className="p-6 text-sm font-bold text-zinc-400">{prospect.created_at ? new Date(prospect.created_at).toLocaleDateString('fr-FR') : "Aujourd'hui"}</td>
                        <td className={`p-6 text-sm font-black ${isDark ? 'text-white' : 'text-black'}`}>{prospect.full_name || 'Client Anonyme'}</td>
                        <td className="p-6">
                          <span className={`${isDark ? 'bg-zinc-800 text-white border-zinc-700' : 'bg-white text-black border-zinc-300'} px-3 py-1 rounded-md text-xs font-bold border`}>
                            {productName}
                          </span>
                        </td>
                        <td className="p-6 text-center">
                          <span className="text-zinc-600 text-sm font-bold">{hasCM ? 'Oui' : '-'}</span>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-col">
                          <span className={`text-xs font-black uppercase flex items-center gap-1 ${prospect.status === 'Converti' || prospect.status === 'Actif' || prospect.status === 'Payé' ? 'text-[#39FF14]' : 'text-yellow-500'}`}>
                            {(prospect.status === 'Converti' || prospect.status === 'Actif' || prospect.status === 'Payé') && <CheckCircle size={12} />}
                            {prospect.status || 'Nouveau'}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                            Mois 1 (30%)
                            </span>
                          </div>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex flex-col items-end gap-2">
                            <span className={`${spaceGrotesk.className} text-lg font-black text-[#39FF14]`}>
                              {commission.toLocaleString()} F
                            </span>
                            <button onClick={() => window.open(`https://wa.me/${(prospect.phone || prospect.contact || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Bonjour " + (prospect.full_name || "cher client") + ", c'est votre conseiller Onyx. Comment puis-je vous aider à finaliser votre démarche ?")}`, '_blank')} className="text-[9px] font-black uppercase tracking-widest text-black bg-white px-3 py-1.5 rounded-lg hover:bg-[#39FF14] transition-all flex items-center gap-1.5 active:scale-95">
                               <MessageCircle size={12} />
                               Relancer
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Empty State Fallback */}
            {prospects.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center">
                <Users size={48} className="text-zinc-700 mb-4" />
                <p className="text-zinc-400 font-bold text-lg mb-2">Aucun filleul pour le moment.</p>
                <p className="text-zinc-600 text-sm mb-6">Partagez votre lien pour commencer à gagner des commissions.</p>
                <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="bg-white text-black px-6 py-2 rounded-lg font-black text-xs uppercase hover:bg-[#39FF14] transition-colors">
                  Copier mon lien
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- HISTORIQUE DES RETRAITS --- */}
        <div className="mt-12">
          <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-6 flex items-center gap-3 ${isDark ? 'text-white' : 'text-black'}`}>
          <DollarSign className="text-[#39FF14]" size={24} /> Historique des Retraits
          </h2>
          
          <div className={`${cardBg} rounded-[2rem] p-6 shadow-sm transition-colors`}>
            {withdrawals.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign size={40} className="text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400 font-bold">Aucune demande de retrait pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {withdrawals.map((w, index) => (
                  <div key={w.id || index} className={`flex justify-between items-center p-5 rounded-2xl border ${isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                     <div>
                       <p className={`font-black uppercase text-sm ${isDark ? 'text-white' : 'text-black'}`}>{w.method} - {w.phone}</p>
                       <p className="text-xs text-zinc-500 mt-1 font-bold">{w.created_at ? new Date(w.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : "Récemment"}</p>
                     </div>
                     <div className="text-right">
                       <p className="font-black text-[#39FF14] text-lg">{w.amount?.toLocaleString()} F</p>
                       <div className="flex items-center gap-2 justify-end mt-2">
                         <span className={`inline-block text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${w.status === 'Payé' ? 'bg-[#39FF14]/20 text-[#39FF14]' : w.status === 'Rejeté' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                           {w.status || 'En attente'}
                         </span>
                         {(w.status === 'En attente' || !w.status) && (
                           <button onClick={() => handleDeleteWithdrawal(w.id)} className="text-zinc-500 hover:text-red-500 transition-colors p-1" title="Annuler la demande"><Trash2 size={14}/></button>
                         )}
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className={`mt-20 py-12 border-t relative z-10 ${isDark ? 'bg-black text-white border-zinc-900' : 'bg-white text-black border-zinc-200'}`}>
         <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-zinc-800"><span className="text-[#39FF14] font-black text-xl">O</span></div>
                  <span className="font-sans font-black tracking-tighter text-2xl">ONYX OPS</span>
               </div>
               <p className={`text-sm max-w-sm mb-6 ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  Le premier écosystème digital tout-en-un pour les entreprises au Sénégal. Gagnez du temps, augmentez vos ventes et dominez votre marché grâce à l'automatisation WhatsApp.
               </p>
            </div>
            
           <div>
               <h4 className={`font-black uppercase text-sm tracking-widest mb-6 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Solutions</h4>
               <ul className={`space-y-4 text-sm font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  <li><a href="/jaay" className="hover:text-[#39FF14] transition">Onyx Jaay</a></li>
                  <li><a href="/solutions/onyx-tiak" className="hover:text-[#39FF14] transition">Onyx Tiak</a></li>
                  <li><a href="/solutions/onyx-menu" className="hover:text-[#39FF14] transition">Onyx Menu</a></li>
                  <li><a href="/" className="hover:text-[#39FF14] transition">Pack Trio</a></li>
               </ul>
            </div>

            <div>
               <h4 className={`font-black uppercase text-sm tracking-widest mb-6 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Entreprise</h4>
               <ul className={`space-y-4 text-sm font-bold ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
                  <li><a href="/" className="hover:text-[#39FF14] transition">Tarifs</a></li>
                  <li><a href="/ambassadeurs/login" className="hover:text-[#39FF14] transition">Programme Ambassadeur</a></li>
                  <li><a href="/" className="hover:text-[#39FF14] transition">Le Blog</a></li>
                  <li><a href="/login" className="hover:text-[#39FF14] transition">Connexion Hub</a></li>
               </ul>
            </div>
         </div>
         
         <div className={`max-w-7xl mx-auto px-6 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 ${isDark ? 'border-zinc-900' : 'border-zinc-200'}`}>
            <p className="text-xs text-zinc-500 font-bold">© 2026 OnyxOps Elite. Tous droits réservés. Dakar, Sénégal.</p>
            <div className="flex gap-4 text-xs font-bold text-zinc-500">
               <button className="hover:text-[#39FF14] transition">CGV</button>
               <button className="hover:text-[#39FF14] transition">Confidentialités</button>
            </div>
         </div>
      </footer>

      {/* MODALE DE DEMANDE DE RETRAIT */}
      {showWithdrawModal && (
        <div id="withdraw-modal-overlay" onClick={(e: any) => e.target.id === 'withdraw-modal-overlay' && setShowWithdrawModal(false)} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-zinc-900 border border-zinc-800 p-6 sm:p-8 rounded-3xl w-full max-w-md relative shadow-2xl animate-in zoom-in-95">
              <button onClick={() => setShowWithdrawModal(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white transition-colors"><X size={20}/></button>
              <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase mb-2 text-white`}>Demande de Retrait</h2>
              <p className="text-zinc-400 text-sm font-bold mb-6">Solde disponible : <span className="text-[#39FF14]">{totalEarnings.toLocaleString()} F</span></p>
              
              <form onSubmit={handleWithdrawSubmit} className="space-y-4">
                 <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block ml-2">Moyen de paiement</label>
                    <select value={withdrawForm.method} onChange={e => setWithdrawForm({...withdrawForm, method: e.target.value})} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl text-white font-bold outline-none focus:border-[#39FF14] cursor-pointer appearance-none transition-colors">
                       <option value="Wave">Wave</option>
                       <option value="Orange Money">Orange Money</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block ml-2">Numéro de réception</label>
                    <input type="tel" required value={withdrawForm.phone} onChange={e => setWithdrawForm({...withdrawForm, phone: e.target.value})} placeholder="7X XXX XX XX" className="w-full p-4 bg-black border border-zinc-800 rounded-2xl text-white font-bold outline-none focus:border-[#39FF14] transition-colors" />
                 </div>
                 <div>
                    <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest mb-2 block ml-2">Montant (F CFA)</label>
                    <input type="number" required max={totalEarnings} value={withdrawForm.amount} onChange={e => setWithdrawForm({...withdrawForm, amount: e.target.value})} placeholder={`Ex: ${totalEarnings}`} className="w-full p-4 bg-black border border-zinc-800 rounded-2xl text-white font-bold outline-none focus:border-[#39FF14] transition-colors" />
                 </div>
                 <button type="submit" className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-sm mt-4 hover:scale-[1.02] shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-transform active:scale-95 flex justify-center items-center gap-2">
                   <DollarSign size={18}/> Confirmer le retrait
                 </button>
              </form>
           </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-zinc-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative border border-zinc-800">
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white"><X size={20}/></button>
              <h2 className="text-xl font-black mb-6 text-white uppercase tracking-tighter"><Settings className="inline mr-2 text-[#39FF14]"/> Mon Profil</h2>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Nom Complet</label>
                  <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-black border border-zinc-800 text-white rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14]" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Photo de profil (URL)</label>
                  <input type="url" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} className="w-full bg-black border border-zinc-800 text-white rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14]" placeholder="https://..." />
                </div>
                <hr className="border-zinc-800 my-4"/>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Ancien Code PIN (Si modification)</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={oldPin} onChange={e => setOldPin(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-black border border-zinc-800 text-white rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] tracking-widest text-center text-xl" placeholder="••••" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Nouveau Code PIN (4 chiffres)</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))} className="w-full bg-black border border-zinc-800 text-white rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] tracking-widest text-center text-xl" placeholder="••••" />
                </div>
                <button type="submit" className="w-full bg-[#39FF14] text-black font-black py-4 rounded-xl uppercase text-xs mt-4">Sauvegarder</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
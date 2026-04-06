"use client";

import React, { useState, useEffect } from 'react';
import { UserPlus, Activity, CheckCircle, Clock, AlertTriangle, Send, LogOut, Settings, X, Trophy, Target, Star, Medal, Sun, Moon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CommercialHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('nouveau');
  const [addCm, setAddCm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [topCommercials, setTopCommercials] = useState<any[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [myClients, setMyClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    product: ''
  });

  const [theme, setTheme] = useState('dark');
  useEffect(() => {
    const savedTheme = localStorage.getItem('onyx_commercial_theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') document.documentElement.classList.add('dark');
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('onyx_commercial_theme', newTheme);
  };

  useEffect(() => {
    const session = localStorage.getItem('onyx_commercial_session');
    if(session) {
      const data = JSON.parse(session);
      setCurrentUser(data);
      setEditName(data.full_name || '');
      setEditAvatar(data.avatar_url || '');
      fetchMyActivity(data.id, data.full_name);
      fetchLeaderboard(data.id);
    }
  }, []);

  const fetchLeaderboard = async (currentId: string) => {
      const { data: allComms } = await supabase.from('commercials').select('*').eq('status', 'Actif');
      const { data: allClients } = await supabase.from('clients').select('commercial_id, type');
      
      if (allComms && allClients) {
          const commsWithSales = allComms.map(c => {
              const sales = allClients.filter(client => 
                  ((client.commercial_id && String(client.commercial_id) === String(c.id))) 
                  && client.type?.trim().toLowerCase() === 'client'
              ).length;
              return { ...c, sales };
          }).sort((a, b) => b.sales - a.sales);
          
          setTopCommercials(commsWithSales);
          const myRank = commsWithSales.findIndex(c => String(c.id) === String(currentId)) + 1;
          setUserRank(myRank > 0 ? myRank : null);
      }
  };

  const fetchMyActivity = async (commercialId: string, fullName: string) => {
    if (!commercialId && !fullName) return;
    let orQuery = [];
    if (commercialId) orQuery.push(`commercial_id.eq.${commercialId}`);
    if (fullName) orQuery.push(`assigned_to.eq."${fullName}"`);
    
    const { data } = await supabase.from('clients').select('*').or(orQuery.join(','));
    if (data) {
        const sorted = data.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        setMyClients(sorted);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let finalNewPin = currentUser.password_temp;
      if (newPin || oldPin) {
         if (!oldPin) return alert("Veuillez saisir l'ancien PIN.");
         if (newPin.length !== 4) return alert("Le nouveau PIN doit faire 4 chiffres.");
         const submittedOld = oldPin === "0000" ? "central2026" : oldPin + "00";
         if (currentUser.password_temp !== submittedOld && currentUser.password_temp !== "central2026") return alert("Ancien PIN incorrect.");
         finalNewPin = newPin + "00";
      }
      const { error } = await supabase.from('commercials').update({ full_name: editName, avatar_url: editAvatar, password_temp: finalNewPin }).eq('id', currentUser.id);
      if(error) throw error;
      
      alert("Profil mis à jour avec succès !");
      const updatedData = {...currentUser, full_name: editName, avatar_url: editAvatar, password_temp: finalNewPin};
      setCurrentUser(updatedData);
      localStorage.setItem('onyx_commercial_session', JSON.stringify(updatedData));
      setShowSettings(false);
      setOldPin(''); setNewPin('');
    } catch(err:any) {
      alert("Erreur: " + err.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shopName || !formData.phone || !formData.product) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    try {
      let cleanPhone = formData.phone.replace(/\s+/g, '');
      if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
          cleanPhone = `+221${cleanPhone}`;
      } else if (!cleanPhone.startsWith('+')) {
          cleanPhone = `+${cleanPhone}`;
      }

      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 1);
      const trialEndDateStr = trialEndDate.toISOString().split('T')[0];
      const saasName = formData.product + (addCm ? ' + Add-on CM Pub' : '');

      // Vraie insertion dans la base de données
      const { error } = await supabase.from('clients').insert([{
        full_name: formData.shopName,
        phone: cleanPhone,
        saas: saasName,
        active_saas: [saasName],
        saas_expiration_dates: { [saasName]: trialEndDateStr },
        type: 'Prospect',
        status: 'Nouveau',
        source: 'Terrain / Commercial',
        commercial_id: currentUser?.id, // Liaison avec le VRAI commercial connecté
        assigned_to: currentUser?.full_name,
        password_temp: 'central2026',
        expiration_date: trialEndDateStr
      }]);

      if (error) throw error;

      alert(`Succès ! Le client ${formData.shopName} a bien été enregistré sur votre compte.`);
      
      setFormData({ shopName: '', phone: '', product: '' });
      setAddCm(false);
      
      if (currentUser?.id) fetchMyActivity(currentUser.id, currentUser.full_name);
      setActiveTab('activite');
    } catch (err: any) {
      alert("Erreur lors de la création : " + err.message);
    }
  };

  // --- VARIABLES DYNAMIQUES POUR THÈME ---
  const isDark = theme === 'dark';
  const themeBg = isDark ? 'bg-[#050505] text-white' : 'bg-zinc-50 text-black';
  const headerBg = isDark ? 'bg-black border-zinc-800' : 'bg-white border-zinc-200';
  const cardBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200';
  const inputBg = isDark ? 'bg-black border-zinc-800 text-white' : 'bg-zinc-50 border-zinc-200 text-black';
  const textMuted = isDark ? 'text-zinc-400' : 'text-zinc-500';
  const iconBtnBg = isDark ? 'bg-zinc-900 text-zinc-500 hover:text-white' : 'bg-zinc-100 text-zinc-500 hover:text-black';

  // --- CALCULS POUR L'ACTIVITÉ ---
  const convertedClients = myClients.filter(c => c.type?.trim().toLowerCase() === 'client');
  const convertedCount = convertedClients.length;
  const goal = currentUser?.objective || 20;
  const progress = Math.min(100, (convertedCount / goal) * 100);
  const getSaasPrice = (saasName: string) => {
     if (!saasName) return 0;
     if (saasName.includes('Gold')) return 59900;
     if (saasName.includes('CRM')) return 39900;
     if (saasName.includes('Tekki Pro')) return 27900;
     if (saasName.includes('Tekki')) return 22900;
     if (saasName.includes('Tontine')) return 6900;
     if (saasName.includes('Jaay') || saasName.includes('Solo')) return 13900;
     if (saasName.includes('Menu') || saasName.includes('Booking') || saasName.includes('Staff') || saasName.includes('Stock') || saasName.includes('Tiak')) return 13900;
     if (saasName.includes('Add-on CM Pub')) return 49900;
     if (saasName.includes('Boost')) return 150000;
     if (saasName.includes('Modernize')) return 300000;
     return 0;
  };
  const totalCA = convertedClients.reduce((acc, c) => acc + getSaasPrice(c.saas || ''), 0);
  let prime = 0;
  if (totalCA >= 1000000) prime = 100000;
  else if (totalCA >= 500000) prime = 50000;
  else if (totalCA >= 250000) prime = 20000;

  const urgentProspects = myClients.filter(c => {
     if (c.type !== 'Prospect' || !c.expiration_date) return false;
     const daysLeft = Math.ceil((new Date(c.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
     return daysLeft <= 5 && daysLeft >= 0;
  });
  const getNextMission = () => {
      const total = myClients.length;
      if (total === 0) return { title: "Démarrage", desc: "Enregistrez votre premier prospect sur le terrain.", reward: "1er Prospect" };
      if (convertedCount === 0) return { title: "Première Victoire", desc: "Convertissez votre 1er prospect en client payant.", reward: "Badge Vendeur" };
      if (convertedCount < 5) return { title: "Lancement", desc: `Atteignez 5 ventes validées (${convertedCount}/5).`, reward: "Bonus Confiance" };
      if (convertedCount < Math.ceil(goal / 2)) return { title: "Mi-parcours", desc: `Atteignez la moitié de votre objectif (${convertedCount}/${Math.ceil(goal/2)}).`, reward: "Badge Intermédiaire" };
      if (convertedCount < goal) return { title: "Sprint Final", desc: `Atteignez votre objectif mensuel de ${goal} ventes.`, reward: "Prime Objectif" };
      return { title: "Explosion des scores", desc: `Dépassez votre objectif ! Vos commissions s'envolent.`, reward: "Super Prime" };
  };
  const mission = getNextMission();

  return (
    <div className={`min-h-screen ${themeBg} flex flex-col font-sans pb-20 transition-colors`}>
      
      {/* En-tête */}
      <header className={`${headerBg} border-b p-6 shadow-md sticky top-0 z-40 transition-colors`}>
        <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
         {currentUser?.avatar_url && <img src={currentUser.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-zinc-800 object-cover hidden sm:block" />}
         <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Portail <span className="text-[#39FF14]">Commercial</span></h1>
            <p className={`${textMuted} text-xs font-bold mt-1`}>Agent : {currentUser?.full_name || 'Inconnu'} • Objectif : {convertedCount}/{currentUser?.objective || 20}</p>
         </div>
      </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className={`${iconBtnBg} transition p-2 rounded-full`}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setShowSettings(true)} className={`${iconBtnBg} transition p-2 rounded-full`}>
              <Settings size={16} />
            </button>
            <button onClick={() => router.push('/')} className={`${iconBtnBg} transition p-2 rounded-full`}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 p-6">
        {activeTab === 'nouveau' ? (
          <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-black uppercase tracking-tight">Nouveau <span className="text-[#39FF14]">Client</span></h2>
              <p className="text-sm font-bold text-zinc-500">Activez le 1er mois offert en 30 secondes.</p>
            </div>

            <form onSubmit={handleSubmit} className={`${cardBg} p-6 rounded-[2rem] shadow-2xl border space-y-5`}>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Nom de la Boutique / Entreprise *</label>
                <input 
                  type="text" 
                  required
                  value={formData.shopName}
                  onChange={e => setFormData({...formData, shopName: e.target.value})}
                  placeholder="Ex: Resto Chez Fatou" 
                  className={`w-full ${inputBg} rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] transition`}
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Numéro WhatsApp (Gérant) *</label>
                <div className="flex">
                  <span className={`${isDark ? 'bg-zinc-800 border-zinc-800 text-zinc-400' : 'bg-zinc-100 border-zinc-200 text-zinc-500'} border-r-0 px-4 rounded-l-xl flex items-center justify-center font-black text-sm`}>
                    +221
                  </span>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="77 000 00 00" 
                    className={`w-full ${inputBg} rounded-r-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] transition`}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Offre Vendue (Logiciel) *</label>
                <select 
                  required
                  value={formData.product}
                  onChange={e => setFormData({...formData, product: e.target.value})}
                  className={`w-full ${inputBg} rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] transition cursor-pointer appearance-none`}
                >
                  <option value="" disabled>Sélectionner le produit...</option>
                  
                  <optgroup label="📦 LES PACKS SAAS (Les plus rentables)" className={`${isDark ? 'bg-zinc-900' : 'bg-white'} text-[#39FF14] font-black`}>
                    <option value="Pack Tekki">Pack Tekki (Boutique) - 22.900 F</option>
                    <option value="OnyxTekki (Resto)">OnyxTekki (Resto) - 22.900 F</option>
                    <option value="Pack Tekki Pro">Pack Tekki Pro (La totale PME) - 27.900 F</option>
                    <option value="Onyx CRM">Onyx CRM (Devis, Marges, Leads B2B) - 29.900 F</option>
                    <option value="Pack Onyx Gold">Pack Onyx Gold (VIP Multi-Business) - 59.900 F</option>
                  </optgroup>

                  <optgroup label="🧩 MODULES INDIVIDUELS (Produits d'appel)" className={`${isDark ? 'bg-zinc-900 text-white' : 'bg-white text-black'} font-bold`}>
                    <option value="Onyx Jaay">Onyx Jaay (Boutique WhatsApp) - 13.900 F</option>
                    <option value="Onyx Menu">Onyx Menu (Restos & Fast-Food) - 13.900 F</option>
                    <option value="Onyx Booking">Onyx Booking (Rdv & Services) - 13.900 F</option>
                    <option value="Onyx Staff">Onyx Staff (RH & Pointage) - 13.900 F</option>
                    <option value="Onyx Stock">Onyx Stock (Inventaire Seul) - 13.900 F</option>
                    <option value="Onyx Tiak">Onyx Tiak (Logistique Seule) - 13.900 F</option>
                    <option value="Onyx Tontine">Onyx Tontine (Finance) - 6.900 F</option>
                  </optgroup>

                  <optgroup label="🚀 OFFRES HIGH-TICKET (Agence)" className={`${isDark ? 'bg-zinc-900' : 'bg-white'} text-[#00E5FF] font-black`}>
                    <option value="Onyx Boost">Onyx Boost (Agence Croissance) - Dès 150.000 F</option>
                    <option value="Onyx Modernize">Onyx Modernize (Setup VIP One-Shot) - Dès 300.000 F</option>
                  </optgroup>
                </select>
              </div>
              
              {/* UPSELL SECTION */}
              <div className={`p-4 rounded-xl border-2 transition-colors ${addCm ? 'bg-[#39FF14]/10 border-[#39FF14]' : isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center justify-center mt-1">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={addCm}
                      onChange={(e) => setAddCm(e.target.checked)}
                    />
                    <div className={`w-6 h-6 ${isDark ? 'bg-zinc-800 border-zinc-600' : 'bg-white border-zinc-300'} border-2 rounded flex items-center justify-center peer-checked:bg-[#39FF14] peer-checked:border-[#39FF14] transition`}>
                      {addCm && <CheckCircle size={16} className="text-black" />}
                    </div>
                  </div>
                  <div>
                    <span className="font-black uppercase text-sm block mb-1">
                      ➕ Ajouter l'Option CM & Pub
                    </span>
                    <span className={`text-xs ${textMuted} font-bold block mb-2`}>
                      Nous gérons ses pubs Meta (3 campagnes) et ses posts. Facturé <span className={addCm ? "text-[#39FF14]" : (isDark ? "text-white" : "text-black")}>+49.900 F / mois</span>.
                    </span>
                  </div>
                </label>

                {/* ALERTE DYNAMIQUE SI CHECKÉ */}
                {addCm && (
                  <div className={`mt-3 ${isDark ? 'bg-black border-red-500/30' : 'bg-red-50 border-red-200'} border p-3 rounded-lg flex items-start gap-2 animate-in zoom-in`}>
                    <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest leading-relaxed">
                      Attention : Rappelez au client qu'il devra fournir son propre budget pub (min. 30 000F) sur sa carte bancaire Meta.
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" className="w-full mt-6 bg-[#39FF14] text-black font-black uppercase text-sm tracking-widest py-5 rounded-xl shadow-[0_10px_30px_rgba(57,255,20,0.2)] hover:bg-white transition-all flex justify-center items-center gap-2">
                <Send size={18} /> Générer l'accès client
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Mon <span className="text-[#39FF14]">Activité</span></h2>
            
            {/* ALERTE 25 JOURS (J-5 AVANT EXPIRATION) */}
            {urgentProspects.length > 0 && (
               <div className={`${isDark ? 'bg-orange-500/10 border-orange-500/30' : 'bg-orange-50 border-orange-200'} border p-5 rounded-[1.5rem] shadow-sm relative overflow-hidden group`}>
                  <div className="flex items-start gap-3 relative z-10">
                     <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={24} />
                     <div>
                        <h4 className="text-orange-500 font-black uppercase tracking-widest text-xs mb-1">Alerte Conversion (Essai &gt; 25 jours)</h4>
                        <p className={`text-xs ${isDark ? 'text-orange-400/80' : 'text-orange-600'} font-bold leading-relaxed mb-3`}>
                           Vous avez {urgentProspects.length} prospect(s) dont l'essai expire dans moins de 5 jours. Relancez-les maintenant pour valider vos commissions !
                        </p>
                        <div className="flex flex-wrap gap-2">
                           {urgentProspects.map(p => (
                              <button key={p.id} onClick={() => window.open(`https://wa.me/${p.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${p.full_name}, votre période d'essai OnyxOps se termine bientôt. Souhaitez-vous l'activer définitivement ?`)}`, '_blank')} className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase px-3 py-1.5 rounded-lg hover:bg-orange-500 hover:text-black transition-colors flex items-center gap-1.5">
                                 <Send size={14} /> {p.full_name}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* MISSION DYNAMIQUE */}
            <div className={`${cardBg} border rounded-[2rem] p-6 shadow-sm mt-6`}>
              <h3 className="flex items-center gap-2 text-lg font-black uppercase mb-3 text-[#00E5FF]">
                 <Target size={20} /> Mission Actuelle
              </h3>
              <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-black'} mb-1`}>{mission.title}</p>
              <p className={`text-xs ${textMuted} mb-4`}>{mission.desc}</p>
              <div className="inline-flex items-center gap-2 bg-[#00E5FF]/10 text-[#00E5FF] px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border border-[#00E5FF]/30 shadow-sm">
                 <Star size={14} /> Récompense : {mission.reward}
              </div>
            </div>

            {/* GAMIFICATION WIDGET */}
            <div className={`${cardBg} border rounded-[2rem] p-6 shadow-sm relative overflow-hidden group`}>
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-3xl pointer-events-none"></div>
               <h3 className="flex items-center gap-2 text-lg font-black uppercase mb-4 text-[#39FF14]">
                  <Trophy size={20} /> Progression Objectif
               </h3>
               <div className="flex justify-between items-end mb-2 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ventes Converties</span>
                  <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{convertedCount} <span className="text-sm text-zinc-400">/ {goal}</span></span>
               </div>
               <div className={`w-full ${isDark ? 'bg-black border-zinc-800' : 'bg-zinc-100 border-zinc-200'} border rounded-full h-3 mb-3 overflow-hidden shadow-inner relative z-10`}>
                  <div className="bg-[#39FF14] h-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                     <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"></div>
                  </div>
               </div>
               <p className={`text-xs font-bold ${isDark ? 'text-zinc-400' : 'text-zinc-500'} relative z-10`}>
                  {convertedCount >= goal ? '🎯 Objectif atteint ! Excellent travail.' : `Allez ! Plus que ${goal - convertedCount} ventes pour atteindre votre objectif et votre prime.`}
               </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className={`${cardBg} p-6 rounded-[2rem] border shadow-sm flex flex-col items-center justify-center text-center`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Comptes Ouverts</p>
                <p className={`text-4xl font-black ${isDark ? 'text-white' : 'text-black'}`}>{myClients.length}</p>
              </div>
              <div className={`${cardBg} p-6 rounded-[2rem] border border-[#39FF14]/30 shadow-[0_0_30px_rgba(57,255,20,0.1)] flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Commissions Fixes</p>
                <p className="text-2xl font-black text-[#39FF14]">{(convertedCount * 5000).toLocaleString()} F</p>
              </div>
              <div className={`${cardBg} p-6 rounded-[2rem] border border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)] flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">CA Généré</p>
                <p className="text-2xl font-black text-blue-500">{totalCA.toLocaleString()} F</p>
              </div>
              <div className={`${cardBg} p-6 rounded-[2rem] border border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.1)] flex flex-col items-center justify-center text-center relative overflow-hidden`}>
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400 mb-2">Prime sur CA</p>
                <p className="text-2xl font-black text-yellow-500">+{prime.toLocaleString()} F</p>
              </div>
            </div>
            <div className="mt-2 text-center text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
               Paliers de Prime : 250k = +20k | 500k = +50k | 1M = +100k
            </div>

            {/* PODIUM GAMIFICATION */}
            {topCommercials.length > 0 && (
              <div className={`${cardBg} border rounded-[2rem] p-6 shadow-sm mt-6`}>
                <h3 className={`flex items-center gap-2 text-lg font-black uppercase mb-6 ${isDark ? 'text-white' : 'text-black'}`}>
                   <Medal size={20} className="text-yellow-500" /> Classement Équipe
                </h3>
                {topCommercials.length >= 3 && (
                    <div className="flex items-end justify-center gap-4 mb-8 px-2">
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-zinc-300 border-zinc-400' : 'bg-zinc-200 border-zinc-300'} flex items-center justify-center font-black text-black mb-2 border-2`}>{topCommercials[1].full_name.charAt(0)}</div>
                            <div className={`${isDark ? 'bg-zinc-800 border-zinc-400' : 'bg-zinc-100 border-zinc-300'} w-20 sm:w-24 h-24 rounded-t-2xl flex flex-col items-center justify-start pt-3 border-t-4`}>
                                <span className={`text-xl font-black ${isDark ? 'text-zinc-400' : 'text-zinc-500'}`}>2</span>
                                <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-500'}`}>{topCommercials[1].sales} ventes</span>
                            </div>
                            <p className={`text-[10px] font-black uppercase mt-2 ${isDark ? 'text-zinc-400' : 'text-zinc-600'} truncate max-w-[80px]`}>{topCommercials[1].full_name.split(' ')[0]}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`w-14 h-14 rounded-full ${isDark ? 'bg-yellow-400 border-yellow-200' : 'bg-yellow-400 border-yellow-300'} flex items-center justify-center font-black text-2xl mb-2 border-4 shadow-[0_0_20px_rgba(250,204,21,0.4)] text-yellow-900`}>{topCommercials[0].full_name.charAt(0)}</div>
                            <div className={`bg-gradient-to-t from-yellow-500/20 to-yellow-500/40 w-24 sm:w-28 h-32 rounded-t-2xl flex flex-col items-center justify-start pt-3 border-t-4 border-yellow-400`}>
                                <span className="text-2xl font-black text-yellow-500">1</span>
                                <span className="text-xs font-black mt-1 text-yellow-500">{topCommercials[0].sales} ventes</span>
                            </div>
                            <p className={`text-[10px] font-black uppercase mt-2 text-yellow-500 truncate max-w-[80px]`}>{topCommercials[0].full_name.split(' ')[0]}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full ${isDark ? 'bg-orange-400 border-orange-300' : 'bg-orange-300 border-orange-200'} flex items-center justify-center font-black text-white mb-2 border-2`}>{topCommercials[2].full_name.charAt(0)}</div>
                            <div className={`${isDark ? 'bg-orange-900/50 border-orange-500' : 'bg-orange-50 border-orange-400'} w-20 sm:w-24 h-20 rounded-t-2xl flex flex-col items-center justify-start pt-3 border-t-4`}>
                                <span className={`text-xl font-black ${isDark ? 'text-orange-500' : 'text-orange-400'}`}>3</span>
                                <span className={`text-[10px] font-bold mt-1 ${isDark ? 'text-orange-400' : 'text-orange-500'}`}>{topCommercials[2].sales} ventes</span>
                            </div>
                            <p className={`text-[10px] font-black uppercase mt-2 ${isDark ? 'text-orange-400' : 'text-orange-600'} truncate max-w-[80px]`}>{topCommercials[2].full_name.split(' ')[0]}</p>
                        </div>
                    </div>
                )}
                <div className={`${isDark ? 'bg-black border-zinc-800' : 'bg-zinc-50 border-zinc-200'} border p-4 rounded-xl flex justify-between items-center`}>
                   <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Votre Classement</span>
                   <span className="text-lg font-black text-[#39FF14]">#{userRank || '-'}</span>
                </div>
              </div>
            )}

            <div className="mt-8 pb-10">
              <h3 className="font-black uppercase text-sm tracking-widest text-zinc-400 mb-4">Historique Complet d'Acquisition ({myClients.length})</h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                
                {myClients.map(client => (
                  <div key={client.id} className={`${cardBg} p-4 rounded-2xl border flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0 ${isDark ? 'hover:border-zinc-700' : 'hover:border-zinc-300'} transition-colors`}>
                    <div>
                      <p className={`font-black ${isDark ? 'text-white' : 'text-black'} text-sm`}>{client.full_name}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{client.saas}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className={`flex items-center justify-end gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-md mb-1 ${client.type?.trim().toLowerCase() === 'client' ? 'bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14]' : 'bg-orange-500/10 border border-orange-500/30 text-orange-500'}`}>
                        {client.type?.trim().toLowerCase() === 'client' ? <CheckCircle size={12} /> : <Clock size={12} />} {client.type?.trim().toLowerCase() === 'client' ? 'Converti' : 'En essai'}
                      </span>
                      <p className="text-[9px] text-zinc-500">{new Date(client.created_at || Date.now()).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))}
                {myClients.length === 0 && (
                  <p className="text-zinc-500 text-xs text-center py-4 italic">Aucun client enregistré pour le moment.</p>
                )}

              </div>
              {(currentUser?.manual_commission > 0) && (
                 <div className={`${cardBg} p-6 rounded-[2rem] border border-purple-500/30 shadow-[0_0_30px_rgba(168,85,247,0.1)] flex flex-col items-center justify-center text-center relative overflow-hidden col-span-2`}>
                   <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-2">Primes Manuelles & Bonus</p>
                   <p className="text-2xl font-black text-purple-500">+{currentUser.manual_commission.toLocaleString()} F</p>
                 </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Navigation Bas (Mobile) avec animation fluide */}
      <nav className={`fixed bottom-0 w-full ${headerBg} border-t flex relative z-50 pb-safe sm:hidden overflow-hidden`}>
        {/* Background animé (Pillule) */}
        <div 
           className="absolute top-0 bottom-0 w-1/2 p-2 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none" 
           style={{ transform: activeTab === 'nouveau' ? 'translateX(0%)' : 'translateX(100%)' }}
        >
           <div className={`w-full h-full ${isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'} border rounded-[1.25rem] shadow-sm`}></div>
        </div>
        
        <button 
          onClick={() => setActiveTab('nouveau')}
          className={`flex-1 flex flex-col items-center py-3.5 gap-1.5 transition-all duration-500 relative z-10 ${activeTab === 'nouveau' ? (isDark ? 'text-[#39FF14]' : 'text-black') : 'text-zinc-400 hover:text-zinc-500'}`}
        >
          <UserPlus size={24} className={`transition-transform duration-500 ${activeTab === 'nouveau' ? 'scale-110' : 'scale-100'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Nouveau Client</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('activite')}
          className={`flex-1 flex flex-col items-center py-3.5 gap-1.5 transition-all duration-500 relative z-10 ${activeTab === 'activite' ? (isDark ? 'text-[#39FF14]' : 'text-black') : 'text-zinc-400 hover:text-zinc-500'}`}
        >
          <Activity size={24} className={`transition-transform duration-500 ${activeTab === 'activite' ? 'scale-110' : 'scale-100'}`} />
          <span className="text-[10px] font-black uppercase tracking-widest">Mon Activité</span>
        </button>
      </nav>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
         <div className={`${cardBg} rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative border`}>
              <button onClick={() => setShowSettings(false)} className="absolute top-6 right-6 text-zinc-400 hover:text-white"><X size={20}/></button>
        <h2 className={`text-xl font-black mb-6 ${isDark ? 'text-white' : 'text-black'} uppercase tracking-tighter`}><Settings className="inline mr-2 text-[#39FF14]"/> Mon Profil</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Nom Complet</label>
            <input type="text" required value={editName} onChange={e => setEditName(e.target.value)} className={`w-full ${inputBg} rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14]`} />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Photo de profil (URL)</label>
            <input type="url" value={editAvatar} onChange={e => setEditAvatar(e.target.value)} className={`w-full ${inputBg} rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14]`} placeholder="https://..." />
            </div>
          <hr className={`${isDark ? 'border-zinc-800' : 'border-zinc-200'} my-4`}/>
                <div>
              <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Ancien Code PIN (Si modification)</label>
            <input type="password" inputMode="numeric" maxLength={4} value={oldPin} onChange={e => setOldPin(e.target.value.replace(/[^0-9]/g, ''))} className={`w-full ${inputBg} rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] tracking-widest text-center text-xl`} placeholder="••••" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-zinc-500 mb-2">Nouveau Code PIN (4 chiffres)</label>
            <input type="password" inputMode="numeric" maxLength={4} value={newPin} onChange={e => setNewPin(e.target.value.replace(/[^0-9]/g, ''))} className={`w-full ${inputBg} rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] tracking-widest text-center text-xl`} placeholder="••••" />
                </div>
                <button type="submit" className="w-full bg-[#39FF14] text-black font-black py-4 rounded-xl uppercase text-xs mt-4">Sauvegarder</button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
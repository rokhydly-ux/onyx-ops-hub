"use client";

import React, { useState, useEffect } from 'react';
import { UserPlus, Activity, CheckCircle, Clock, AlertTriangle, Send, LogOut, Settings, X, Trophy } from 'lucide-react';
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
  const [myClients, setMyClients] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    product: ''
  });

  useEffect(() => {
    const session = localStorage.getItem('onyx_commercial_session');
    if(session) {
      const data = JSON.parse(session);
      setCurrentUser(data);
      setEditName(data.full_name || '');
      setEditAvatar(data.avatar_url || '');
      fetchMyActivity(data.id);
    }
  }, []);

  const fetchMyActivity = async (commercialId: string) => {
    const { data } = await supabase.from('clients')
      .select('*')
      .eq('commercial_id', commercialId);
    if (data) setMyClients(data);
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

      // Vraie insertion dans la base de données
      const { error } = await supabase.from('clients').insert([{
        full_name: formData.shopName,
        phone: cleanPhone,
        saas: formData.product + (addCm ? ' + Add-on CM Pub' : ''),
        type: 'Prospect',
        status: 'Nouveau',
        source: 'Terrain / Commercial',
        commercial_id: currentUser?.id, // Liaison avec le VRAI commercial connecté
        assigned_to: currentUser?.full_name,
        password_temp: 'central2026',
        expiration_date: trialEndDate.toISOString().split('T')[0]
      }]);

      if (error) throw error;

      alert(`Succès ! Le client ${formData.shopName} a bien été enregistré sur votre compte.`);
      
      setFormData({ shopName: '', phone: '', product: '' });
      setAddCm(false);
      
      if (currentUser?.id) fetchMyActivity(currentUser.id);
      setActiveTab('activite');
    } catch (err: any) {
      alert("Erreur lors de la création : " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans pb-20">
      
      {/* En-tête */}
      <header className="bg-black border-b border-zinc-800 p-6 shadow-md sticky top-0 z-40">
        <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
         {currentUser?.avatar_url && <img src={currentUser.avatar_url} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-zinc-800 object-cover hidden sm:block" />}
         <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Portail <span className="text-[#39FF14]">Commercial</span></h1>
            <p className="text-zinc-400 text-xs font-bold mt-1">Agent : {currentUser?.full_name || 'Inconnu'} • Objectif : {myClients.filter(c => c.type?.trim().toLowerCase() === 'client').length}/{currentUser?.objective || 20}</p>
         </div>
      </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} className="text-zinc-500 hover:text-white transition p-2 bg-zinc-900 rounded-full">
              <Settings size={16} />
            </button>
            <button onClick={() => router.push('/')} className="text-zinc-500 hover:text-white transition p-2 bg-zinc-900 rounded-full">
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

            <form onSubmit={handleSubmit} className="bg-zinc-900 p-6 rounded-[2rem] shadow-2xl border border-zinc-800 space-y-5">
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Nom de la Boutique / Entreprise *</label>
                <input 
                  type="text" 
                  required
                  value={formData.shopName}
                  onChange={e => setFormData({...formData, shopName: e.target.value})}
                  placeholder="Ex: Resto Chez Fatou" 
                  className="w-full bg-black border border-zinc-800 text-white rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] transition" 
                />
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Numéro WhatsApp (Gérant) *</label>
                <div className="flex">
                  <span className="bg-zinc-800 border border-zinc-800 border-r-0 text-zinc-400 px-4 rounded-l-xl flex items-center justify-center font-black text-sm">
                    +221
                  </span>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    placeholder="77 000 00 00" 
                    className="w-full bg-black border border-zinc-800 text-white rounded-r-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] transition" 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Offre Vendue (Logiciel) *</label>
                <select 
                  required
                  value={formData.product}
                  onChange={e => setFormData({...formData, product: e.target.value})}
                  className="w-full bg-black border border-zinc-800 text-white rounded-xl p-4 font-bold focus:outline-none focus:border-[#39FF14] transition cursor-pointer appearance-none"
                >
                  <option value="" disabled>Sélectionner le produit...</option>
                  
                  <optgroup label="📦 LES PACKS SAAS (Les plus rentables)" className="bg-zinc-900 text-[#39FF14] font-black">
                    <option value="Pack Tekki">Pack Tekki (Boutique) - 22.900 F</option>
                    <option value="OnyxTekki (Resto)">OnyxTekki (Resto) - 22.900 F</option>
                    <option value="Pack Tekki Pro">Pack Tekki Pro (La totale PME) - 27.900 F</option>
                    <option value="Onyx CRM">Onyx CRM (Devis, Marges, Leads B2B) - 29.900 F</option>
                    <option value="Pack Onyx Gold">Pack Onyx Gold (VIP Multi-Business) - 59.900 F</option>
                  </optgroup>

                  <optgroup label="🧩 MODULES INDIVIDUELS (Produits d'appel)" className="bg-zinc-900 text-white font-bold">
                    <option value="Onyx Jaay">Onyx Jaay (Boutique WhatsApp) - 13.900 F</option>
                    <option value="Onyx Menu">Onyx Menu (Restos & Fast-Food) - 13.900 F</option>
                    <option value="Onyx Booking">Onyx Booking (Rdv & Services) - 13.900 F</option>
                    <option value="Onyx Staff">Onyx Staff (RH & Pointage) - 13.900 F</option>
                    <option value="Onyx Stock">Onyx Stock (Inventaire Seul) - 13.900 F</option>
                    <option value="Onyx Tiak">Onyx Tiak (Logistique Seule) - 13.900 F</option>
                    <option value="Onyx Tontine">Onyx Tontine (Finance) - 6.900 F</option>
                  </optgroup>

                  <optgroup label="🚀 OFFRES HIGH-TICKET (Agence)" className="bg-zinc-900 text-[#00E5FF] font-black">
                    <option value="Onyx Boost">Onyx Boost (Agence Croissance) - Dès 150.000 F</option>
                    <option value="Onyx Modernize">Onyx Modernize (Setup VIP One-Shot) - Dès 300.000 F</option>
                  </optgroup>
                </select>
              </div>
              
              {/* UPSELL SECTION */}
              <div className={`p-4 rounded-xl border-2 transition-colors ${addCm ? 'bg-[#39FF14]/10 border-[#39FF14]' : 'bg-black border-zinc-800'}`}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="relative flex items-center justify-center mt-1">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={addCm}
                      onChange={(e) => setAddCm(e.target.checked)}
                    />
                    <div className="w-6 h-6 bg-zinc-800 border-2 border-zinc-600 rounded flex items-center justify-center peer-checked:bg-[#39FF14] peer-checked:border-[#39FF14] transition">
                      {addCm && <CheckCircle size={16} className="text-black" />}
                    </div>
                  </div>
                  <div>
                    <span className="font-black uppercase text-sm block mb-1">
                      ➕ Ajouter l'Option CM & Pub
                    </span>
                    <span className="text-xs text-zinc-400 font-bold block mb-2">
                      Nous gérons ses pubs Meta (3 campagnes) et ses posts. Facturé <span className={addCm ? "text-[#39FF14]" : "text-white"}>+49.900 F / mois</span>.
                    </span>
                  </div>
                </label>

                {/* ALERTE DYNAMIQUE SI CHECKÉ */}
                {addCm && (
                  <div className="mt-3 bg-black border border-red-500/30 p-3 rounded-lg flex items-start gap-2 animate-in zoom-in">
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
          (() => {
            const convertedCount = myClients.filter(c => c.type?.trim().toLowerCase() === 'client').length;
            const goal = currentUser?.objective || 20;
            const progress = Math.min(100, (convertedCount / goal) * 100);
            return (
          <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Mon <span className="text-[#39FF14]">Activité</span></h2>
            
            {/* GAMIFICATION WIDGET */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#39FF14]/10 rounded-full blur-3xl pointer-events-none"></div>
               <h3 className="flex items-center gap-2 text-lg font-black uppercase mb-4 text-[#39FF14]">
                  <Trophy size={20} /> Progression Objectif
               </h3>
               <div className="flex justify-between items-end mb-2 relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Ventes Converties</span>
                  <span className="text-xl font-black text-white">{convertedCount} <span className="text-sm text-zinc-500">/ {goal}</span></span>
               </div>
               <div className="w-full bg-black rounded-full h-3 mb-3 overflow-hidden shadow-inner relative z-10 border border-zinc-800">
                  <div className="bg-[#39FF14] h-full transition-all duration-1000 ease-out relative" style={{ width: `${progress}%` }}>
                     <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"></div>
                  </div>
               </div>
               <p className="text-xs font-bold text-zinc-400 relative z-10">
                  {convertedCount >= goal ? '🎯 Objectif atteint ! Excellent travail.' : `Allez ! Plus que ${goal - convertedCount} ventes pour atteindre votre objectif et votre prime.`}
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 shadow-lg flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Comptes Ouverts (Essais)</p>
                <p className="text-4xl font-black text-white">{myClients.length}</p>
              </div>
              <div className="bg-zinc-900 p-6 rounded-[2rem] border border-[#39FF14]/30 shadow-[0_0_30px_rgba(57,255,20,0.1)] flex flex-col items-center justify-center text-center relative overflow-hidden">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Commissions (Ventes)</p>
                <p className="text-2xl font-black text-[#39FF14]">{(convertedCount * 5000).toLocaleString()} F</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-black uppercase text-sm tracking-widest text-zinc-400 mb-4">Derniers Comptes Ouverts</h3>
              <div className="space-y-3">
                
                {myClients.slice(0, 5).map(client => (
                  <div key={client.id} className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
                    <div>
                      <p className="font-black text-white text-sm">{client.full_name}</p>
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">{client.saas}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-md ${client.type === 'Client' ? 'bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14]' : 'bg-orange-500/10 border border-orange-500/30 text-orange-500'}`}>
                      {client.type === 'Client' ? <CheckCircle size={12} /> : <Clock size={12} />} {client.type === 'Client' ? 'Converti' : 'En essai'}
                    </span>
                  </div>
                ))}
                {myClients.length === 0 && (
                  <p className="text-zinc-500 text-xs text-center py-4">Aucun client enregistré pour le moment.</p>
                )}

              </div>
            </div>
          </div>
          );
          })()
        )}
      </main>

      {/* Navigation Bas (Mobile) */}
      <nav className="fixed bottom-0 w-full bg-black border-t border-zinc-800 flex justify-around p-4 z-50 pb-safe">
        <button 
          onClick={() => setActiveTab('nouveau')}
          className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'nouveau' ? 'text-[#39FF14]' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          <UserPlus size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Nouveau Client</span>
        </button>
        <button 
          onClick={() => setActiveTab('activite')}
          className={`flex flex-col items-center gap-1.5 transition-colors ${activeTab === 'activite' ? 'text-[#39FF14]' : 'text-zinc-600 hover:text-zinc-400'}`}
        >
          <Activity size={24} />
          <span className="text-[10px] font-black uppercase tracking-widest">Mon Activité</span>
        </button>
      </nav>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
           <div className="bg-zinc-900 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative border border-zinc-800">
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
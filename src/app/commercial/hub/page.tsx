"use client";

import React, { useState } from 'react';
import { UserPlus, Activity, CheckCircle, Clock, AlertTriangle, Send, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CommercialHub() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('nouveau');
  const [addCm, setAddCm] = useState(false);
  const [formData, setFormData] = useState({
    shopName: '',
    phone: '',
    product: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.shopName || !formData.phone || !formData.product) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Simulation d'envoi
    alert(`Succès ! Le lien d'activation a été envoyé sur le WhatsApp de ${formData.shopName} pour l'offre ${formData.product} ${addCm ? '(Avec Option CM)' : ''}.`);
    
    // Reset form
    setFormData({ shopName: '', phone: '', product: '' });
    setAddCm(false);
    setActiveTab('activite');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans pb-20">
      
      {/* En-tête */}
      <header className="bg-black border-b border-zinc-800 p-6 shadow-md sticky top-0 z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter">Portail <span className="text-[#39FF14]">Commercial</span></h1>
            <p className="text-zinc-400 text-xs font-bold mt-1">Agent : Moussa D. • Objectif : 12/20</p>
          </div>
          <button onClick={() => router.push('/')} className="text-zinc-500 hover:text-white transition p-2 bg-zinc-900 rounded-full">
            <LogOut size={16} />
          </button>
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
                    <option value="Pack Tekki">Pack Tekki (Vente, Stock, Livreurs) - 22.900 F</option>
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

              {/* Champ caché pour identifier le commercial */}
              <input type="hidden" name="commercialId" value="COM-Moussa-D" />

              <button type="submit" className="w-full mt-6 bg-[#39FF14] text-black font-black uppercase text-sm tracking-widest py-5 rounded-xl shadow-[0_10px_30px_rgba(57,255,20,0.2)] hover:bg-white transition-all flex justify-center items-center gap-2">
                <Send size={18} /> Générer l'accès client
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black uppercase tracking-tight mb-6">Mon <span className="text-[#39FF14]">Activité</span></h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800 shadow-lg flex flex-col items-center justify-center text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Comptes ce mois</p>
                <p className="text-4xl font-black text-white">12</p>
              </div>
              <div className="bg-zinc-900 p-6 rounded-[2rem] border border-[#39FF14]/30 shadow-[0_0_30px_rgba(57,255,20,0.1)] flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#39FF14]/20 blur-xl rounded-full"></div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Commissions</p>
                <p className="text-2xl font-black text-[#39FF14]">142 500 F</p>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="font-black uppercase text-sm tracking-widest text-zinc-400 mb-4">Derniers Comptes Ouverts</h3>
              <div className="space-y-3">
                
                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="font-black text-white text-sm">Boutique Fanta</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Pack Tekki</p>
                  </div>
                  <span className="flex items-center gap-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 text-[10px] font-black uppercase px-2 py-1 rounded-md">
                    <Clock size={12} /> Essai 30J
                  </span>
                </div>

                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="font-black text-white text-sm">Resto La Teranga</p>
                    <div className="flex gap-2 mt-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Onyx CRM</p>
                      <span className="text-[10px] font-black text-[#00E5FF] uppercase tracking-widest bg-[#00E5FF]/10 px-1 rounded">+ CM</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-1 bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-black uppercase px-2 py-1 rounded-md">
                    <CheckCircle size={12} /> Abonné
                  </span>
                </div>

                <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="font-black text-white text-sm">Salon Coiffure Pro</p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Onyx Booking</p>
                  </div>
                  <span className="flex items-center gap-1 bg-[#39FF14]/10 border border-[#39FF14]/30 text-[#39FF14] text-[10px] font-black uppercase px-2 py-1 rounded-md">
                    <CheckCircle size={12} /> Abonné
                  </span>
                </div>

              </div>
            </div>
          </div>
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
    </div>
  );
}
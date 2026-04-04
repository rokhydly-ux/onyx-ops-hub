"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Wallet, Trophy, Link2, Copy, Check, ShoppingBag, Users, LogOut, FileText, Image as ImageIcon, MessageCircle, X, Settings } from "lucide-react";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AmbassadeursPage() {
  const [id, setId] = useState("+221762237425");
  const [pin, setPin] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [ambassadorData, setAmbassadorData] = useState<any>(null);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [editName, setEditName] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  // States for dynamic data
  const [prospects, setProspects] = useState<any[]>([]);
  const [marketingMaterials, setMarketingMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${ambassadorData?.id}`;

  // Maintenir la session au rechargement
  useEffect(() => {
    const session = localStorage.getItem('onyx_ambassador_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        setAmbassadorData(data);
        setEditName(data.full_name || '');
        setEditAvatar(data.avatar_url || '');
        setIsLoggedIn(true);
      } catch (e) {}
    }
  }, []);

  // Fetch data on login
  useEffect(() => {
    if (isLoggedIn && ambassadorData) {
      const fetchData = async () => {
        setIsLoading(true);

        // Fetch prospects assigned to the ambassador
        const { data: leadsData, error: leadsError } = await supabase
          .from('leads')
          .select('*')
          .eq('ambassador_id', ambassadorData.id);

        if (leadsError) {
          console.error("Error fetching prospects:", leadsError.message);
        } else {
          setProspects(leadsData || []);
        }

        // Fetch marketing materials
        const { data: materialsData, error: materialsError } = await supabase
          .from('marketing_materials')
          .select('*');

        if (materialsError) {
          console.error("Error fetching marketing materials:", materialsError.message);
        } else {
          setMarketingMaterials(materialsData || []);
        }
        
        setIsLoading(false);
      };

      fetchData();
    }
  }, [isLoggedIn, ambassadorData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    // Nettoyage du numéro de téléphone
    let rawPhone = id.replace(/[^0-9+]/g, '');
    const p1 = rawPhone;
    const p2 = rawPhone.startsWith('+') ? rawPhone.substring(1) : `+${rawPhone}`;
    const p3 = rawPhone.length === 9 ? `+221${rawPhone}` : rawPhone;
    const p4 = rawPhone.length === 9 ? `221${rawPhone}` : rawPhone;
    const p5 = rawPhone.startsWith('+221') ? rawPhone.substring(4) : rawPhone;
    const p6 = rawPhone.startsWith('221') ? rawPhone.substring(3) : rawPhone;

    const uniquePhones = Array.from(new Set([p1, p2, p3, p4, p5, p6]));
    const orConditions = uniquePhones.map(p => `contact.eq.${p},phone.eq.${p}`).join(',');

    try {
      // Vérification dans la table des ambassadeurs
      const { data: membersList, error: fetchErr } = await supabase
        .from('ambassadors')
        .select('*')
        .or(orConditions);

      if (fetchErr || !membersList || membersList.length === 0) {
        throw new Error("Identifiant introuvable.");
      }
      const data = membersList[0];

      const submittedPin = pin === "0000" ? "central2026" : pin + "00";
      if (data.password_temp !== submittedPin && data.password_temp !== "central2026") {
        throw new Error("Code PIN incorrect.");
      }

      if (data.status !== 'Actif') {
         throw new Error("Votre compte n'est pas encore validé par l'administrateur.");
      }

      setAmbassadorData(data);
      setEditName(data.full_name || '');
      setEditAvatar(data.avatar_url || '');
      setIsLoggedIn(true);
      localStorage.setItem('onyx_ambassador_session', JSON.stringify(data));
    } catch (err: any) {
      setError(err.message || "Erreur de connexion.");
    } finally {
      setAuthLoading(false);
    }
  };
  
  const handleContactProspect = (prospect: any) => {
    // Ensure prospect.phone and prospect.name exist to avoid errors
    if (!prospect.phone || !prospect.full_name) {
      alert("Informations de contact du prospect manquantes.");
      return;
    }
    const message = `Bonjour ${prospect.full_name}, je suis votre conseiller OnyxOps. J'ai vu que vous étiez intéressé par nos solutions. Comment puis-je vous aider aujourd'hui ?`;
    const whatsappUrl = `https://wa.me/${prospect.phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAmbassadorData(null);
    localStorage.removeItem('onyx_ambassador_session');
    setId("");
    setPin("");
    setProspects([]);
    setMarketingMaterials([]);
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

  // Login Form Component
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-[#39FF14]/30 shadow-[0_0_80px_rgba(57,255,20,0.15)] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#39FF14]/20 rounded-2xl flex items-center justify-center text-[#39FF14] mx-auto mb-4 border border-[#39FF14]/50">
              <Trophy size={32} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Espace Ambassadeur</h1>
            <p className="text-sm text-zinc-400 mt-1">Connectez-vous pour accéder à votre tableau de bord.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="tel" 
              placeholder="Votre ID Ambassadeur" 
              value={id} 
              onChange={(e) => setId(e.target.value)} 
              required 
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#39FF14] placeholder:text-zinc-500" 
            />
            <input 
              type="password" 
              inputMode="numeric"
              maxLength={4}
              placeholder="Code PIN (4 chiffres)" 
              value={pin} 
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))} 
              required 
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#39FF14] placeholder:text-zinc-500 tracking-widest text-center text-xl" 
            />
            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
            <button 
              type="submit" 
              disabled={authLoading} 
              className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:scale-[1.02] transition-transform duration-200 disabled:opacity-50 disabled:scale-100 shadow-[0_0_30px_rgba(57,255,20,0.3)]"
            >
              {authLoading ? "Connexion en cours..." : "Accéder à mon Hub"}
            </button>
          </form>
          <div className="text-center mt-6">
             <button onClick={() => setShowForgot(true)} className="text-sm font-bold text-zinc-500 hover:text-[#39FF14] transition-colors">Code PIN oublié ?</button>
          </div>
        </div>
        
        {showForgot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
             <div className="bg-zinc-900 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-zinc-800">
                <button onClick={() => setShowForgot(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X size={20}/></button>
                <h2 className="text-xl font-bold mb-4 text-white">Code PIN oublié ?</h2>
                <p className="text-sm text-zinc-400 mb-6">Entrez votre numéro WhatsApp. L'administrateur sera notifié pour réinitialiser votre code PIN à 0000.</p>
                <input type="tel" placeholder="Votre numéro" value={forgotPhone} onChange={e => setForgotPhone(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg mb-4 text-white outline-none focus:border-[#39FF14]" />
                <button onClick={() => { alert("L'Administrateur a été notifié pour réinitialiser votre PIN à 0000."); setShowForgot(false); setForgotPhone(''); }} className="w-full bg-[#39FF14] text-black font-bold py-3 rounded-lg uppercase text-xs">Demander la réinitialisation</button>
             </div>
          </div>
        )}
      </div>
    );
  }

  // Ambassador Dashboard Component
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4">
           {ambassadorData?.avatar_url && <img src={ambassadorData.avatar_url} alt="Avatar" className="w-10 h-10 rounded-full border border-[#39FF14] object-cover" />}
           <h1 className="text-xl font-black uppercase tracking-tighter text-[#39FF14]">
             Bienvenue, {ambassadorData?.full_name}
           </h1>
        </div>
        <div className="flex items-center gap-4">
           <button onClick={() => setShowSettings(true)} className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-[#39FF14] transition-colors">
             <Settings size={14} /> Paramètres
           </button>
           <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors">
             <LogOut size={14} /> Déconnexion
           </button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex items-center justify-center h-[60vh]">
            <div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <main className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Section "Mes Revenus" */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
           <h2 className="flex items-center gap-3 text-lg font-black uppercase text-[#39FF14] mb-4">
            <Wallet size={22} /> Mes Revenus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-1">CA total généré</p>
              <p className="text-2xl font-bold text-white">{((ambassadorData?.sales || 0) * 13900).toLocaleString()} F CFA</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-1">Commissions en attente</p>
              <p className="text-2xl font-bold text-[#39FF14]">{((ambassadorData?.sales || 0) * 5000).toLocaleString()} F CFA</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-1">Nombre de filleuls</p>
              <p className="text-2xl font-bold text-[#00E5FF]">{prospects.length} Filleul(s)</p>
            </div>
          </div>
        </section>

        {/* Section "Lien de Parrainage" */}
        <section className="bg-black border-2 border-[#39FF14] rounded-2xl p-6 shadow-[0_0_50px_rgba(57,255,20,0.25)]">
          <h2 className="flex items-center gap-3 text-lg font-black uppercase text-[#39FF14] mb-4">
            <Link2 size={22} /> Mon Lien de Parrainage Unique
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              readOnly 
              value={referralLink} 
              className="flex-1 p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-mono text-zinc-300 select-all" 
            />
            <button 
              onClick={handleCopy} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform duration-200"
            >
              {copied ? <><Check size={18} /> Copié !</> : <><Copy size={18} /> Copier le lien</>}
            </button>
          </div>
        </section>

        {/* Section "Mes Prospects" (Dynamique) */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-3 text-lg font-black uppercase text-[#39FF14]">
              <Users size={22} /> Mes Filleuls
            </h2>
            <span className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-xs font-black border border-[#39FF14]/30">
               {prospects.length} Total
            </span>
          </div>
          {prospects.length === 0 ? (
            <p className="text-zinc-500 text-sm">Aucun filleul assigné pour le moment. Partagez votre lien !</p>
          ) : (
            <div className="space-y-3">
              {prospects.map((prospect) => (
                <div key={prospect.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-800 rounded-xl gap-4">
                  <div>
                    <p className="font-bold text-white">{prospect.full_name}</p>
                    <p className="text-xs text-zinc-400">{prospect.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-zinc-700 text-zinc-300">
                      {prospect.status || 'Nouveau'}
                    </span>
                    <button onClick={() => handleContactProspect(prospect)} className="p-2 bg-[#25D366] text-white rounded-full hover:scale-110 transition-transform">
                      <MessageCircle size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Section "Matériel Marketing" (Dynamique) */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="flex items-center gap-3 text-lg font-black uppercase text-[#39FF14] mb-4">
            <ShoppingBag size={22} /> Matériel Marketing
          </h2>
          <p className="text-zinc-400 text-sm mb-4">Ressources pour booster vos ventes et présenter Onyx.</p>
          {marketingMaterials.length === 0 ? (
             <p className="text-zinc-500 text-sm">Aucun matériel marketing disponible pour le moment.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {marketingMaterials.map((material) => (
                 <a 
                   key={material.id}
                   href={material.url} 
                   target="_blank" 
                   rel="noopener noreferrer" 
                   className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-[#39FF14] hover:text-black text-white px-5 py-3 rounded-xl font-black uppercase text-xs transition-colors"
                 >
                  {material.type.toLowerCase() === 'canva' ? <ImageIcon size={14}/> : <FileText size={14}/>}
                  {material.type.toLowerCase() === 'canva' ? 'Ouvrir Canva' : 'Télécharger le PDF'}
                </a>
              ))}
            </div>
          )}
        </section>
      </main>
      )}

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

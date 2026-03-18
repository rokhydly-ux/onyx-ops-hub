"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import { BarChart2, Settings, History, User, LogOut, Sparkles, AlertTriangle } from "lucide-react";

// Définition de l'interface pour le profil utilisateur
interface UserProfile {
  id: string;
  full_name?: string;
  expiry_date?: string;
  expiration_date?: string;
  active_modules?: string[] | string;
  active_saas?: string[] | string;
  saas_expiration_dates?: Record<string, string>;
  saas?: string;
  role?: string;
  ia_credits?: number;
}

// Composant pour la carte SaaS
const SaasCard = ({ name, href, isActive }: { name: string; href: string; isActive: boolean }) => (
  <Link href={isActive ? href : "#"} className="block">
    <div
      className={`p-4 bg-white rounded-2xl border flex justify-between items-center transition-all duration-300 ${
        isActive ? "border-green-500 hover:shadow-lg" : "border-zinc-100 opacity-50 cursor-not-allowed"
      }`}
    >
      <span className="font-bold text-sm">{name}</span>
      {isActive ? (
        <span className="text-[10px] font-black text-green-500 uppercase">Activé</span>
      ) : (
        <span className="text-[10px] font-black text-zinc-400 uppercase">Non activé 🔒</span>
      )}
    </div>
  </Link>
);

export default function Dashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [view, setView] = useState<'home' | 'profile'>('home');
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session?.user) {
          const user = session.user;
          const { data: clientData } = await supabase.from("clients").select("*").eq("id", user.id).maybeSingle();
          if (clientData) {
            setProfile(clientData);
            return;
          }
          const { data: leadData } = await supabase.from("leads").select("*").eq("id", user.id).maybeSingle();
          if (leadData) {
            setProfile(leadData);
            return;
          }
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
          if (profileData) {
            setProfile(profileData);
            return;
          }
      } else {
          // Vérification de la session personnalisée CRM
          const customSession = localStorage.getItem('onyx_custom_session');
          if (customSession) {
              try {
                  const parsedSession = JSON.parse(customSession);
                  const { data } = await supabase.from('clients').select('*').eq('id', parsedSession.id).maybeSingle();
                  if (data) {
                      setProfile(data);
                      localStorage.setItem('onyx_custom_session', JSON.stringify(data));
                  } else {
                      setProfile(parsedSession);
                  }
                  return;
              } catch (e) {}
          }
          
          window.location.href = '/login';
      }
    };
    getUserProfile();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('onyx_custom_session');
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }
    if (newPassword.length < 6) {
      alert("Le mot de passe doit faire au moins 6 caractères");
      return;
    }
    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setIsUpdating(false);
    
    if (error) {
      alert("Erreur lors de la mise à jour: " + error.message);
    } else {
      alert("Mot de passe mis à jour avec succès !");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const expiryStatus = (() => {
    let expDate;
    if (profile?.expiry_date) {
        expDate = new Date(profile.expiry_date);
    } else if ((profile as any)?.created_at) {
        // Pour les clients existants sans expiry_date, on calcule 7 jours après la création
        expDate = new Date((profile as any).created_at);
        expDate.setDate(expDate.getDate() + 7);
    } else {
        return null;
    }

    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { expired: true, days: Math.abs(diffDays) };
    if (diffDays <= 3) return { expired: false, days: diffDays };
    return null;
  })();
  
  const isModuleActive = (moduleName: string) => {
    let moduleId = moduleName.toLowerCase();
    if (moduleId.includes('jaay')) moduleId = 'vente';
    else if (moduleId.includes('tiak')) moduleId = 'tiak';
    else if (moduleId.includes('stock')) moduleId = 'stock';
    else if (moduleId.includes('menu')) moduleId = 'menu';
    else if (moduleId.includes('formation')) moduleId = 'formation';

    let expDate = null;
    if (profile?.saas_expiration_dates && profile.saas_expiration_dates[moduleId]) {
        expDate = new Date(profile.saas_expiration_dates[moduleId]);
    } else if (profile?.expiration_date) {
        expDate = new Date(profile.expiration_date);
    } else if (profile?.expiry_date) {
        expDate = new Date(profile.expiry_date);
    }

    if (expDate) {
        const today = new Date();
        const diffTime = expDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < 0) return false; // Bloqué car expiré !
    }
    
    const modules = profile?.active_modules || profile?.active_saas;
    const saas = profile?.saas;
    
    let isActive = false;
    if (Array.isArray(modules)) {
      isActive = modules.some(m => m.toLowerCase() === moduleId || m.toLowerCase() === moduleName.toLowerCase());
    } else if (typeof modules === 'string') {
      isActive = modules.toLowerCase().includes(moduleId) || modules.toLowerCase().includes(moduleName.toLowerCase());
    }
    
    if (!isActive && saas) {
        const saasLower = saas.toLowerCase();
            if (saasLower.includes('trio')) {
                isActive = ['vente', 'tiak', 'stock'].includes(moduleId);
            } else if (saasLower.includes('duo')) {
                isActive = ['vente', 'tiak'].includes(moduleId);
            } else if (saasLower.includes('solo')) {
                isActive = ['vente'].includes(moduleId);
            } else {
                isActive = saasLower.includes(moduleId) || saasLower.includes(moduleName.toLowerCase());
            }
    }
    
    return isActive;
  };

  const handleRenewSubscription = () => {
    const adminPhone = "221785338417"; // Numéro du support/admin OnyxOps
    const message = `Bonjour, je suis ${profile?.full_name || 'un client'}. Je souhaite prolonger mon abonnement OnyxOps (qui se termine le ${formatDate(profile?.expiry_date)}). Pouvons-nous procéder au renouvellement ?`;
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (!profile) return <div className="p-20 text-center font-bold">Chargement de votre empire...</div>;

  const onyxJaayActive = isModuleActive("onyxjaay") || isModuleActive("jaay");
  const onyxTiakActive = isModuleActive("onyxtiak") || isModuleActive("tiak");
  const onyxStockActive = isModuleActive("onyxstock") || isModuleActive("stock");
  const onyxMenuActive = isModuleActive("onyxmenu") || isModuleActive("menu");

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div>
            <h1>Bienvenue, {profile.full_name || "Cher Partenaire"}</h1>
            <p className="text-sm text-gray-600 mt-2">
              Date de fin d'abonnement / d'essai :{" "}
              <span className="font-bold">{formatDate(profile.expiry_date)}</span>
            </p>
            <p className="text-[#39FF14] font-bold bg-black inline-block px-3 py-1 rounded-full text-[10px] mt-2 uppercase tracking-widest">
              Rôle : {profile.role || 'user'}
            </p>
            <p className="text-purple-500 font-bold bg-purple-500/10 border border-purple-500/20 inline-flex px-3 py-1 rounded-full text-[10px] mt-2 ml-2 uppercase tracking-widest items-center gap-1 w-max">
              <Sparkles size={12} /> {profile.ia_credits !== undefined ? profile.ia_credits : 100} Crédits IA
            </p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setView(view === 'home' ? 'profile' : 'home')}
              className="px-5 py-2.5 bg-black text-white rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-zinc-800 transition"
            >
              {view === 'home' ? <><User size={16} /> Mon Profil</> : "Retour au Dashboard"}
            </button>
            <button 
              onClick={handleLogout}
              className="px-5 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-xl font-bold text-xs uppercase flex items-center gap-2 hover:bg-red-500 hover:text-white transition"
            >
              <LogOut size={16} /> Déconnexion
            </button>
          </div>
        </header>

        {expiryStatus && (
          <div className="mb-8 bg-red-50 border-l-4 border-red-500 p-4 sm:p-6 rounded-r-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-xl text-red-500 shrink-0">
              <AlertTriangle size={24} />
            </div>
            <div>
              <p className="font-black text-red-800 text-sm sm:text-base uppercase tracking-tight mb-1">
                {expiryStatus.expired ? "Votre accès a expiré" : `Attention,votre accès expire dans ${expiryStatus.days} jour${expiryStatus.days > 1 ? 's' : ''}`}
              </p>
              <p className="text-xs sm:text-sm text-red-600 font-medium">
                {expiryStatus.expired ? "Veuillez renouveler votre abonnement pour continuer à utiliser vos outils sans interruption." : "Pensez à prolonger votre abonnement rapidement pour éviter toute coupure de vos services."}
              </p>
            </div>
            </div>
            <button onClick={handleRenewSubscription} className="w-full sm:w-auto bg-red-500 text-white px-6 py-3 rounded-xl font-black text-[10px] sm:text-xs uppercase hover:bg-red-600 transition-colors shadow-lg shrink-0">
               {expiryStatus.expired ? "Renouveler l'accès" : "Prolonger maintenant"}
            </button>
          </div>
        )}

        {view === 'profile' ? (
          <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm max-w-xl">
             <h3 className="font-black uppercase mb-6 text-xl">Sécurité & Mot de passe</h3>
             <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Nouveau mot de passe</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-green-500" />
                </div>
                <div>
                  <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Confirmer le mot de passe</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-xl outline-none focus:border-green-500" />
                </div>
                <button type="submit" disabled={isUpdating} className="w-full py-4 bg-black text-[#39FF14] rounded-xl font-black text-xs uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 mt-4">
                  {isUpdating ? 'Mise à jour....' : 'Enregistrer le nouveau mot de passe'}
                </button>
             </form>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-200">
              <h3 className="font-black uppercase mb-6">Mes Solutions Pro</h3>
              <div className="space-y-4">
                <SaasCard name="Onyx Jaay" href="/vente" isActive={onyxJaayActive} />
                <SaasCard name="Onyx Tiak" href="/tiak" isActive={onyxTiakActive} />
                <SaasCard name="Onyx Stock" href="/stock" isActive={onyxStockActive} />
                <SaasCard name="Onyx Menu" href="/menu" isActive={onyxMenuActive} />
                <button onClick={handleRenewSubscription} className="w-full mt-4 py-3 bg-black text-[#39FF14] rounded-xl font-black text-xs uppercase hover:bg-zinc-800 transition-colors shadow-lg shadow-[#39FF14]/10">
                  Prolonger mon abonnement
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-sm flex flex-col justify-between">
              <div>
                  <h3 className="font-black uppercase mb-2">Performances</h3>
                  <p className="text-xs text-zinc-500 mb-6">Suivez vos ventes et la croissance de votre boutique.</p>
              </div>
              <Link href="/dashboard/stats" className="w-full py-4 bg-zinc-100 hover:bg-black hover:text-[#39FF14] text-black rounded-xl font-black text-xs uppercase transition-colors flex items-center justify-center gap-2">
                  <BarChart2 size={16} /> Voir mes statistiques
              </Link>
              <Link href="/dashboard/orders" className="w-full mt-3 py-4 bg-zinc-100 hover:bg-black hover:text-[#39FF14] text-black rounded-xl font-black text-xs uppercase transition-colors flex items-center justify-center gap-2">
                  <History size={16} /> Historique Commandes
              </Link>
              <Link href="/dashboard/account" className="w-full mt-3 py-4 bg-white border-2 border-zinc-100 hover:border-black text-black rounded-xl font-black text-xs uppercase transition-colors flex items-center justify-center gap-2">
                  <Settings size={16} /> Configurer ma boutique
              </Link>
            </div>

            {(profile.role === "partner" || profile.role === "admin") ? (
              <div className="bg-[#39FF14]/5 p-8 rounded-[2.5rem] border-2 border-[#39FF14]">
                <h3 className="font-black uppercase mb-2">Espace Ambassadeur</h3>
                <p className="text-[10px] text-[#39FF14] font-bold mb-6 uppercase">Statut : Actif</p>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-xl">
                    <p className="text-[10px] font-bold text-zinc-400">MON LIEN DE VENTE</p>
                    <code className="text-xs font-bold break-all">onyxops.com/ref/{profile.id.slice(0,5)}</code>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 text-white p-8 rounded-[2.5rem]">
                <h3 className="font-black uppercase mb-4">Devenir Partenaire</h3>
                <p className="text-xs text-zinc-400 mb-6 leading-relaxed">Gagnez 30% de commission en recommandant OnyxOps. Avantage Client : +5% de bonus immédiat.</p>
                <button className="w-full py-4 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase">Postuler maintenant</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

// Définition de l'interface pour le profil utilisateur
interface UserProfile {
  id: string;
  full_name?: string;
  expiry_date?: string;
  active_modules?: string[] | string;
  role?: string;
}

// Composant pour la carte SaaS
const SaasCard = ({ name, href, isActive }: { name: string; href: string; isActive: boolean }) => (
  <Link href={isActive ? href : "#"} passHref>
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

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Récupérer depuis la table 'leads' comme demandé
        const { data } = await supabase
          .from("leads")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile(data);
        } else {
          // Fallback sur la table 'profiles' si 'leads' ne retourne rien
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (profileData) setProfile(profileData);
        }
      }
    };
    getUserProfile();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Non définie";
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  
  const isModuleActive = (moduleName: string) => {
    if (!profile?.active_modules) return false;
    const modules = profile.active_modules;
    const lowerCaseModuleName = moduleName.toLowerCase();
    
    if (Array.isArray(modules)) {
      return modules.some(m => m.toLowerCase().includes(lowerCaseModuleName));
    }
    if (typeof modules === 'string') {
      return modules.toLowerCase().includes(lowerCaseModuleName);
    }
    return false;
  };

  if (!profile) return <div className="p-20 text-center font-bold">Chargement de votre empire...</div>;

  const onyxJaayActive = isModuleActive("onyxjaay") || isModuleActive("jaay");

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1>Bienvenue, {profile.full_name || "Cher Partenaire"}</h1>
          <p className="text-sm text-gray-600 mt-2">
            Date de fin d'abonnement / d'essai :{" "}
            <span className="font-bold">{formatDate(profile.expiry_date)}</span>
          </p>
          <p className="text-[#39FF14] font-bold bg-black inline-block px-3 py-1 rounded-full text-[10px] mt-2 uppercase tracking-widest">
            Rôle : {profile.role || 'user'}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-200">
            <h3 className="font-black uppercase mb-6">Mes Solutions</h3>
            <div className="space-y-4">
              <SaasCard name="Onyx Jaay" href="/jaay" isActive={onyxJaayActive} />
              {/* Vous pouvez ajouter d'autres SaaS ici sur le même modèle */}
              <button className="w-full mt-4 py-3 bg-black text-[#39FF14] rounded-xl font-bold text-xs uppercase">Acheter ou gérer un pack</button>
            </div>
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
      </div>
    </div>
  );
}
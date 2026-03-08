"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function Dashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [role, setRole] = useState<string>("user");

  useEffect(() => {
    const getUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (data) {
          setProfile(data);
          setRole(data.role);
        }
      }
    };
    getUserProfile();
  }, []);

  if (!profile) return <div className="p-20 text-center font-bold">Chargement de votre empire...</div>;

  return (
    <div className="min-h-screen bg-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12">
          <h1>Bienvenue, {profile.full_name || "Cher Partenaire"}</h1>
          <p className="text-[#39FF14] font-bold bg-black inline-block px-3 py-1 rounded-full text-[10px] mt-2 uppercase tracking-widest">
            Rôle : {role}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* SECTION 1 : MES SAAS (Pour tous les clients) */}
          <div className="bg-zinc-50 p-8 rounded-[2.5rem] border border-zinc-200">
            <h3 className="font-black uppercase mb-6">Mes Solutions</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-2xl border border-zinc-100 flex justify-between items-center">
                <span className="font-bold text-sm">Onyx Jaay</span>
                <span className="text-[10px] font-black text-zinc-400 uppercase">Non activé</span>
              </div>
              <button className="w-full py-3 bg-black text-[#39FF14] rounded-xl font-bold text-xs uppercase">Acheter un pack</button>
            </div>
          </div>

          {/* SECTION 2 : ESPACE PARTENAIRE (Visible si partenaire ou si client veut le devenir) */}
          {(role === "partner" || role === "admin") ? (
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
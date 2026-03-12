"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl) {
      console.warn(
        "⚠️ AVERTISSEMENT: La variable d'environnement NEXT_PUBLIC_SUPABASE_URL n'est pas définie."
      );
    }

    if (!supabaseAnonKey) {
      console.warn(
        "⚠️ AVERTISSEMENT: La variable d'environnement NEXT_PUBLIC_SUPABASE_ANON_KEY n'est pas définie."
      );
    }

    if (supabaseUrl && supabaseAnonKey) {
      console.log(
        "✅ Variables d'environnement Supabase chargées correctement côté client."
      );
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Nettoyage du numéro
      const onlyDigits = phone.replace(/[^0-9]/g, "");
      const localNumber = onlyDigits.slice(-9);
      console.log("Recherche des chiffres locaux :", localNumber);

      // 2. On cherche D'ABORD dans la table 'clients' (Membres validés / Admin)
      let { data, error } = await supabase
        .from("clients")
        .select("*")
        .ilike("phone", `%${localNumber}%`)
        .eq("password_temp", password.trim()) // ⚠️ La colonne s'appelle password_temp ici !
        .limit(1);

      if (error) throw new Error(`Erreur DB Clients: ${error.message}`);

      // 3. Si introuvable, on cherche dans la table 'leads' (Nouveaux inscrits site web)
      if (!data || data.length === 0) {
        console.log("Non trouvé dans clients, recherche dans leads...");
        const { data: leadsData, error: leadsError } = await supabase
          .from("leads")
          .select("*")
          .ilike("phone", `%${localNumber}%`)
          .eq("password", password.trim()) // ⚠️ La colonne s'appelle password ici !
          .limit(1);

        if (leadsError) throw new Error(`Erreur DB Leads: ${leadsError.message}`);
        data = leadsData; // On remplace par le résultat des leads
      }

      // 4. Verdict final
      if (!data || data.length === 0) {
        console.error("❌ AUCUNE DATA TROUVÉE (Ni dans clients, ni dans leads)");
        throw new Error("Identifiants incorrects ou compte inexistant.");
      }

      // Succès !
      console.log("✅ Connexion réussie :", data[0].full_name);
      login(data[0]);

    } catch (err: any) {
      console.error("❌ ERREUR GLOBALE LOGIN:", err);
      alert(err.message || "Erreur de connexion : Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    const message =
      "Bonjour, j'ai oublié le mot de passe de mon compte OnyxOps. Pouvez-vous me le réinitialiser ? Voici mon numéro : ";
    if (typeof window !== "undefined") {
      window.open(
        `https://wa.me/221785338417?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6 font-sans">
      <div className="max-w-md w-full bg-black rounded-[3rem] border border-zinc-800 p-10 shadow-[0_30px_80px_rgba(0,0,0,0.8)]">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#39FF14] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(57,255,20,0.7)]">
            <span className="font-black text-black text-xl tracking-tighter">
              OX
            </span>
          </div>
          <h1 className="text-3xl font-black uppercase text-white tracking-tighter">
            Onyx Hub Client
          </h1>
          <p className="text-[10px] font-bold text-zinc-500 mt-2 uppercase tracking-[0.3em]">
            Accès 100 sécurisé à vos applications
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
              Numéro WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="+221 7x xxx xx xx"
              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl font-bold text-sm text-white outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/40 placeholder:text-zinc-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-zinc-400 tracking-widest ml-1">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full p-4 bg-zinc-900 border border-zinc-800 rounded-2xl font-bold text-sm text-white outline-none focus:border-[#39FF14] focus:ring-2 focus:ring-[#39FF14]/40 placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={handleForgotPassword}
              className="mt-1 text-[11px] font-bold text-zinc-400 hover:text-[#39FF14] underline-offset-4 hover:underline text-right w-full"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-bold">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-zinc-600 bg-zinc-900 accent-[#39FF14]"
              />
              <span className="uppercase tracking-[0.2em]">
                Rester connecté
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Entrer dans le Hub"}
          </button>
        </form>

        <p className="mt-8 text-[9px] text-zinc-500 text-center uppercase font-bold tracking-[0.3em]">
          Gestion Centralisée OnyxOps • Dakar Hub
        </p>
      </div>
    </div>
  );
}
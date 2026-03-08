"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function ClientLoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const phoneClean = phone.replace(/\s+/g, "");
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("phone", phoneClean)
        .eq("password_temp", password.trim())
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        alert(
          "Identifiants incorrects. Vérifiez votre numéro et le mot de passe fourni par Onyx."
        );
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("onyx_client_session", JSON.stringify(data));
      }
      router.push("/hub");
    } catch (err: any) {
      alert(
        "Erreur de connexion : " + (err?.message || "Veuillez réessayer plus tard.")
      );
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
            Accès sécurisé à vos applications
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#39FF14] text-black py-4 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Connexion..." : "Entrer dans le Hub"}
          </button>
        </form>

        <p className="mt-8 text-[9px] text-zinc-500 text-center uppercase font-bold tracking-[0.3em]">
          Gestion centralisée OnyxOps • Dakar Hub
        </p>
      </div>
    </div>
  );
}
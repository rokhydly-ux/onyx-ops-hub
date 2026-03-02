"use client";
import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGitHubLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { 
        // window.location.origin détecte automatiquement si tu es sur localhost ou Vercel
        redirectTo: `${window.location.origin}/auth/callback` 
      }
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-6">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-xl border border-zinc-200">
        <h1 className="text-3xl font-black uppercase mb-2 text-center">Onyx Hub</h1>
        <p className="text-zinc-500 text-center mb-8 font-medium">Accédez à vos SaaS et votre espace partenaire.</p>
        
        <button 
          onClick={handleGitHubLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition disabled:opacity-50"
        >
          {loading ? "Chargement..." : "Continuer avec GitHub"}
        </button>

        <p className="mt-8 text-[10px] text-zinc-400 text-center uppercase font-bold">
          Sécurisé par Supabase Auth
        </p>
      </div>
    </div>
  );
}
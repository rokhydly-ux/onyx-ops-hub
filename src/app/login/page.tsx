"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    // Nettoyage du numéro de téléphone (enlève les espaces et assure la présence du +)
    const formattedPhone = phone.replace(/\s+/g, '').startsWith('+') ? phone.replace(/\s+/g, '') : `+${phone.replace(/\s+/g, '')}`;

    // Utilisation de l'API d'authentification officielle Supabase avec le numéro
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: formattedPhone,
      password: password,
    });

    if (error) {
      console.error("Erreur de connexion:", error.message);
      setErrorMsg("Numéro de téléphone ou mot de passe incorrect.");
      setIsLoading(false);
      return;
    }

    if (data.session) {
      // Succès ! Redirection vers le tableau de bord vendeur
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-center mb-6">
           <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" className="h-[40px] w-auto object-contain dark:invert" />
        </div>
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-6 text-center text-black dark:text-white">
          Connexion Vendeur
        </h2>
        
        {errorMsg && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-500 p-4 rounded-xl mb-6 text-sm font-bold text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">
              Numéro WhatsApp (ex: +221778000012)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-sm text-black dark:text-white transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">
              Mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-sm text-black dark:text-white transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 bg-[#39FF14] text-black rounded-xl font-black text-xs uppercase hover:bg-black hover:text-[#39FF14] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? "Vérification..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}
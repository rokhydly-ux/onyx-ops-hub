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

    // Nettoyage pour trouver le cœur du numéro (ex: 778000012)
    const cleanPhone = phone.replace(/\s+/g, '').replace('+', '');
    const corePhone = cleanPhone.length >= 9 ? cleanPhone.slice(-9) : cleanPhone;

    // 1. Tenter la connexion via la base de données CRM (Clients confirmés)
    const { data: clients, error: errC } = await supabase.from('clients')
        .select('*')
        .ilike('phone', `%${corePhone}%`);

    const validClient = clients?.find(c => 
        c.password === password || 
        c.password_temp === password || 
        (c.password && c.password.toLowerCase() === password.toLowerCase()) || 
        (c.password_temp && c.password_temp.toLowerCase() === password.toLowerCase())
    );

    if (validClient) {
        localStorage.setItem('onyx_custom_session', JSON.stringify(validClient));
        router.push('/dashboard');
        return;
    }

    // 2. Tenter la connexion via la base Leads (Nouveaux inscrits)
    const { data: leads, error: errL } = await supabase.from('leads')
        .select('*')
        .ilike('phone', `%${corePhone}%`);
        
    const validLead = leads?.find(l => 
        l.password === password || 
        l.password_temp === password || 
        (l.password && l.password.toLowerCase() === password.toLowerCase()) || 
        (l.password_temp && l.password_temp.toLowerCase() === password.toLowerCase())
    );

    if (validLead) {
        localStorage.setItem('onyx_custom_session', JSON.stringify(validLead));
        router.push('/dashboard');
        return;
    }

    // 3. Fallback Auth Supabase officiel (au cas où)
    const phoneWithPlus = `+${cleanPhone}`;
    const { data } = await supabase.auth.signInWithPassword({ phone: phoneWithPlus, password: password });
    if (data?.session) {
        router.push('/dashboard');
        return;
    }

    setErrorMsg("Numéro de téléphone ou mot de passe incorrect.");
    setIsLoading(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-center mb-6">
           <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Onyx Logo" className="h-[40px] w-auto object-contain dark:invert" />
        </div>
        <h2 className="font-sans text-3xl font-black uppercase tracking-tighter mb-6 text-center text-black dark:text-white">
          Connexion au Hub
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
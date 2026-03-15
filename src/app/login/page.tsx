"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      // Nettoyage pour trouver le cœur du numéro (ex: 778000012)
      const cleanPhone = phone.replace(/\s+/g, '').replace('+', '');
      const corePhone = cleanPhone.length >= 9 ? cleanPhone.slice(-9) : cleanPhone;

      // 1. Tenter la connexion via la base de données CRM (Clients confirmés)
      const { data: clients } = await supabase.from('clients')
          .select('*')
          .ilike('phone', `%${corePhone}%`);

      const validClient = clients?.find(c => 
          String(c.password) === String(password) || 
          String(c.password_temp) === String(password) || 
          (c.password && String(c.password).toLowerCase() === String(password).toLowerCase()) || 
          (c.password_temp && String(c.password_temp).toLowerCase() === String(password).toLowerCase())
      );

      if (validClient) {
          localStorage.setItem('onyx_custom_session', JSON.stringify(validClient));
          window.location.href = '/hub';
          return; // Laisse isLoading à true pendant la redirection
      }

      // 2. Tenter la connexion via la base Leads (Nouveaux inscrits)
      const { data: leads } = await supabase.from('leads')
          .select('*')
          .ilike('phone', `%${corePhone}%`);
          
      const validLead = leads?.find(l => 
          String(l.password) === String(password) || 
          String(l.password_temp) === String(password) || 
          (l.password && String(l.password).toLowerCase() === String(password).toLowerCase()) || 
          (l.password_temp && String(l.password_temp).toLowerCase() === String(password).toLowerCase())
      );

      if (validLead) {
          localStorage.setItem('onyx_custom_session', JSON.stringify(validLead));
          window.location.href = '/hub';
          return;
      }

      // 3. Fallback Auth Supabase officiel (au cas où)
      const phoneWithPlus = `+${cleanPhone}`;
      const { data } = await supabase.auth.signInWithPassword({ phone: phoneWithPlus, password: password });
      if (data?.session) {
          window.location.href = '/hub';
          return;
      }

      setErrorMsg("Numéro de téléphone ou mot de passe incorrect.");
      setIsLoading(false);
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setErrorMsg("Une erreur technique est survenue. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!phone) {
      alert("Veuillez d'abord saisir votre numéro WhatsApp dans le champ ci-dessus.");
      return;
    }
    const adminPhone = "221785338417"; // Numéro du support OnyxOps
    const message = `🚨 *Demande de réinitialisation*\n\nBonjour le support OnyxOps,\nJe n'arrive plus à me connecter à mon Hub.\nMon numéro de compte est : ${phone}\n\nPouvez-vous me réinitialiser mon mot de passe ?`;
    window.open(`https://wa.me/${adminPhone}?text=${encodeURIComponent(message)}`, '_blank');
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
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs font-bold text-zinc-500 uppercase block">
                Mot de passe
              </label>
              <button 
                type="button" 
                onClick={handleForgotPassword}
                className="text-[10px] font-bold text-zinc-400 hover:text-[#39FF14] transition-colors"
              >
                Oublié ?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 pr-12 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl outline-none focus:border-[#39FF14] text-sm text-black dark:text-white transition-colors"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#39FF14] transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
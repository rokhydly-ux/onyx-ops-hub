"use client";
import { useEffect } from "react";
import { supabase } from "../../../lib/supabaseClient"; // On remonte 3 fois
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // Supabase récupère automatiquement le "ticket" dans l'URL
      const { data, error } = await supabase.auth.getSession();
      
      if (data?.session) {
        // Succès ! On l'envoie vers son espace personnel
        router.push("/dashboard");
      } else {
        // Échec (ou ticket expiré), on le renvoie au login
        console.error("Erreur d'authentification:", error);
        router.push("/login");
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-black border-t-[#39FF14] rounded-full animate-spin mb-4"></div>
      <p className="font-black uppercase text-[10px] tracking-widest animate-pulse">
        Vérification de votre accès Onyx...
      </p>
    </div>
  );
}
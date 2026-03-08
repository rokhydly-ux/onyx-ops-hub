"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { ChevronDown, LogOut, KeyRound, Settings } from "lucide-react";

type GlobalHeaderProps = {
  client: any;
  title: string;
  subtitle?: string;
  showBackToHub?: boolean;
};

export function GlobalHeader({
  client,
  title,
  subtitle,
  showBackToHub = true,
}: GlobalHeaderProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("onyx_client_session");
      sessionStorage.removeItem("onyx_client_session");
    }
    router.push("/");
  };

  const handleChangePassword = async () => {
    if (!client?.id) return;
    const next = window.prompt(
      "Nouveau mot de passe pour votre compte Onyx :"
    );
    if (!next) return;
    try {
      const { error } = await supabase
        .from("clients")
        .update({ password_temp: next, updated_at: new Date().toISOString() })
        .eq("id", client.id);
      if (error) {
        console.error("Erreur maj mot de passe client:", error);
        alert("Erreur lors de la mise à jour du mot de passe.");
      } else {
        alert("Mot de passe mis à jour avec succès.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Erreur inattendue lors de la mise à jour du mot de passe.");
    }
  };

  return (
    <header className="bg-black text-white px-6 py-4 flex items-center justify-between shadow-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <div
          onClick={() => router.push("/hub")}
          className="w-9 h-9 bg-[#39FF14] rounded-xl flex items-center justify-center text-black font-black text-xs cursor-pointer shadow-[0_0_15px_rgba(57,255,20,0.5)]"
        >
          OX
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-black uppercase tracking-tighter">
              {title}
            </h1>
            {showBackToHub && (
              <button
                onClick={() => router.push("/hub")}
                className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-white text-black hover:bg-[#39FF14] transition"
              >
                Retour Hub
              </button>
            )}
          </div>
          {subtitle && (
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.25em]">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-3 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-700 hover:border-[#39FF14] transition-all"
        >
          <div className="w-7 h-7 rounded-full bg-zinc-800 overflow-hidden border border-zinc-600 flex items-center justify-center text-[10px] font-black uppercase">
            {client?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={client.avatar_url}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              (client?.full_name || "?").charAt(0)
            )}
          </div>
          <span className="text-[11px] font-bold uppercase hidden sm:block">
            {client?.full_name || "Compte Client"}
          </span>
          <ChevronDown size={14} className="text-zinc-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50">
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase hover:bg-zinc-50"
              onClick={() => {
                setMenuOpen(false);
                alert(
                  "Paramètres du compte à venir (profil, coordonnées, etc.)."
                );
              }}
            >
              <Settings size={14} /> Paramètres du compte
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase hover:bg-zinc-50"
              onClick={() => {
                setMenuOpen(false);
                handleChangePassword();
              }}
            >
              <KeyRound size={14} /> Modifier le mot de passe
            </button>
            <button
              className="w-full flex items-center gap-3 px-4 py-3 text-[11px] font-black uppercase text-red-600 hover:bg-red-50"
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              <LogOut size={14} /> Déconnexion
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


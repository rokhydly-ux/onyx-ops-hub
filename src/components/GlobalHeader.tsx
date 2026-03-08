"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import { ChevronDown, LogOut, KeyRound, Settings, X, CheckCircle } from "lucide-react";

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
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("onyx_client_session");
      sessionStorage.removeItem("onyx_client_session");
    }
    router.push("/");
  };

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?.id) return;
    if (newPassword.length < 4) {
      alert("Le mot de passe doit faire au moins 4 caractères.");
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("clients")
        .update({ password_temp: newPassword, updated_at: new Date().toISOString() })
        .eq("id", client.id);

      if (error) {
        console.error("Erreur maj mot de passe client:", error);
        alert("Erreur lors de la mise à jour du mot de passe.");
      } else {
        alert("Mot de passe mis à jour avec succès.");
        setShowPasswordModal(false);
        setNewPassword("");
      }
    } catch (err: any) {
      console.error(err);
      alert("Erreur inattendue lors de la mise à jour.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
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
            <div className="absolute right-0 mt-2 w-56 bg-white text-black rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
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
                  setShowPasswordModal(true);
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

      {/* MODALE DE CHANGEMENT DE MOT DE PASSE */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 relative animate-in zoom-in text-black shadow-2xl">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-5 right-5 p-2 bg-zinc-100 rounded-full hover:bg-black hover:text-white transition"
            >
              <X size={16} />
            </button>
            <div className="w-12 h-12 bg-black text-[#39FF14] rounded-xl flex items-center justify-center mb-4">
              <KeyRound size={24} />
            </div>
            <h2 className="text-xl font-black uppercase mb-2">Sécurité</h2>
            <p className="text-xs font-bold text-zinc-500 mb-6">
              Définissez un nouveau mot de passe pour votre compte.
            </p>
            <form onSubmit={submitNewPassword} className="space-y-4">
              <input
                type="text"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                className="w-full p-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-bold outline-none focus:border-black transition"
              />
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-black text-[#39FF14] py-4 rounded-2xl font-black uppercase text-xs hover:scale-105 transition flex justify-center items-center gap-2"
              >
                {isUpdating ? "Mise à jour..." : <><CheckCircle size={16} /> Confirmer</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
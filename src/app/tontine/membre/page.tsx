"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  CheckCircle, AlertCircle, Wallet, Calendar,
  History, Users, X, ChevronRight, ShieldCheck,
  ArrowRight, Lock, Bell, LogOut, Shuffle, Trophy, Medal, MessageCircle,
  Camera, Save, Loader2, Phone, KeyRound, Monitor
} from "lucide-react";

// ─── Windows 2000 Design Tokens ───────────────────────────────────────────────
// Palette: #D4D0C8 (win-grey), #000080 (win-navy), #FFFFFF, #808080

// ─── Reusable Win2000 Components ─────────────────────────────────────────────

function WinWindow({
  title,
  icon,
  children,
  className = "",
  active = false,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex flex-col ${className}`}
      style={{
        border: "2px solid",
        borderColor: "#FFFFFF #808080 #808080 #FFFFFF",
        background: "#D4D0C8",
        boxShadow: "1px 1px 0 0 #000",
      }}
    >
      {/* Title Bar */}
      <div
        className="flex items-center justify-between px-2 py-1 select-none"
        style={{
          background: active
            ? "linear-gradient(to right, #000080, #1084D0)"
            : "linear-gradient(to right, #7B7B7B, #A0A0A0)",
          minHeight: "22px",
        }}
      >
        <div className="flex items-center gap-1.5">
          {icon && <span className="text-white" style={{ fontSize: "12px" }}>{icon}</span>}
          <span className="text-white font-bold text-xs" style={{ fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif", fontSize: "11px" }}>
            {title}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {["_", "□", "✕"].map((sym, i) => (
            <button
              key={i}
              className="w-4 h-4 flex items-center justify-center text-black"
              style={{
                background: "#D4D0C8",
                border: "1px solid",
                borderColor: "#FFFFFF #808080 #808080 #FFFFFF",
                fontSize: "8px",
                fontFamily: "Tahoma",
                lineHeight: 1,
              }}
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="flex-1">{children}</div>
    </div>
  );
}

function WinButton({
  children,
  onClick,
  disabled = false,
  type = "button",
  variant = "default",
  className = "",
  style = {},
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  variant?: "default" | "primary";
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-1 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-none ${className}`}
      style={{
        background: "#D4D0C8",
        border: "2px solid",
        borderColor: "#FFFFFF #808080 #808080 #FFFFFF",
        boxShadow: "1px 1px 0 0 #000",
        fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif",
        fontSize: "11px",
        fontWeight: "bold",
        color: disabled ? "#808080" : "#000000",
        cursor: disabled ? "not-allowed" : "pointer",
        minWidth: "75px",
        minHeight: "23px",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

function WinInput({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled = false,
  inputMode,
  maxLength,
}: {
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  inputMode?: any;
  maxLength?: number;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      inputMode={inputMode}
      maxLength={maxLength}
      style={{
        background: disabled ? "#D4D0C8" : "#FFFFFF",
        border: "2px solid",
        borderColor: "#808080 #FFFFFF #FFFFFF #808080",
        fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif",
        fontSize: "11px",
        padding: "2px 4px",
        color: "#000000",
        outline: "none",
        width: "100%",
      }}
    />
  );
}

function WinTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "#D4D0C8" : "#B8B4AC",
        border: "2px solid",
        borderColor: active ? "#FFFFFF #D4D0C8 transparent #808080" : "#FFFFFF #808080 #808080 #FFFFFF",
        fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif",
        fontSize: "11px",
        fontWeight: active ? "bold" : "normal",
        color: "#000",
        padding: "4px 12px",
        marginBottom: active ? "-2px" : "0",
        position: "relative",
        zIndex: active ? 1 : 0,
        cursor: "pointer",
        marginRight: "2px",
      }}
    >
      {label}
    </button>
  );
}

function WinProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const blocks = Math.floor(pct / 5);
  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "2px solid",
        borderColor: "#808080 #FFFFFF #FFFFFF #808080",
        height: "20px",
        display: "flex",
        alignItems: "center",
        padding: "2px",
        gap: "2px",
      }}
    >
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "8px",
            height: "14px",
            background: i < blocks ? "#000080" : "transparent",
          }}
        />
      ))}
    </div>
  );
}

function WinStatusBar({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        borderTop: "1px solid #808080",
        background: "#D4D0C8",
        display: "flex",
        alignItems: "center",
        padding: "2px 6px",
        gap: "4px",
        fontFamily: "Tahoma, 'MS Sans Serif', Arial, sans-serif",
        fontSize: "11px",
        color: "#000",
      }}
    >
      {children}
    </div>
  );
}

function WinDivider() {
  return (
    <div style={{ borderTop: "1px solid #808080", borderBottom: "1px solid #FFFFFF", margin: "4px 0" }} />
  );
}

// ─── Win2000 CSS injected once ────────────────────────────────────────────────
const win2kStyle = `
  .win2k-root {
    font-family: Tahoma, 'MS Sans Serif', Arial, sans-serif;
    font-size: 11px;
    background: #008080;
    min-height: 100vh;
  }
  .win2k-root * {
    font-family: Tahoma, 'MS Sans Serif', Arial, sans-serif;
  }
  .win2k-field-label {
    font-size: 11px;
    font-weight: bold;
    color: #000;
    margin-bottom: 2px;
    display: block;
  }
  .win2k-badge-green {
    background: #008000;
    color: #FFF;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: bold;
    border: 1px solid #004000;
  }
  .win2k-badge-red {
    background: #800000;
    color: #FFF;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: bold;
    border: 1px solid #400000;
  }
  .win2k-badge-yellow {
    background: #808000;
    color: #FFF;
    padding: 1px 6px;
    font-size: 10px;
    font-weight: bold;
    border: 1px solid #404000;
  }
  .win2k-list-row {
    padding: 3px 6px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: default;
  }
  .win2k-list-row:nth-child(even) {
    background: #E8E4DC;
  }
  .win2k-list-row:hover {
    background: #000080;
    color: #FFFFFF;
  }
  .win2k-sunken {
    border: 2px solid;
    border-color: #808080 #FFFFFF #FFFFFF #808080;
    background: #FFFFFF;
    padding: 6px;
  }
  .win2k-raised {
    border: 2px solid;
    border-color: #FFFFFF #808080 #808080 #FFFFFF;
    background: #D4D0C8;
    padding: 6px;
  }
  .win2k-taskbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 30px;
    background: #D4D0C8;
    border-top: 2px solid #FFFFFF;
    display: flex;
    align-items: center;
    padding: 0 4px;
    gap: 4px;
    z-index: 50;
  }
  .win2k-start-btn {
    background: #D4D0C8;
    border: 2px solid;
    border-color: #FFFFFF #808080 #808080 #FFFFFF;
    padding: 2px 8px;
    font-weight: bold;
    font-size: 11px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  @keyframes confetti-fall {
    0% { transform: translateY(0) rotate(0deg); opacity: 1; }
    100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
  }
  @keyframes win-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .win-loading {
    display: inline-block;
    width: 14px; height: 14px;
    border: 2px solid #808080;
    border-top-color: #000080;
    border-radius: 50%;
    animation: win-spin 0.8s linear infinite;
  }
`;

// ─── Main Page Export ─────────────────────────────────────────────────────────
function TontineMembrePage() {
  return (
    <Suspense
      fallback={
        <div className="win2k-root flex items-center justify-center" style={{ minHeight: "100vh" }}>
          <style>{win2kStyle}</style>
          <WinWindow title="Chargement..." active>
            <div style={{ padding: "24px", textAlign: "center", background: "#D4D0C8" }}>
              <div className="win-loading" style={{ width: 32, height: 32, margin: "0 auto 8px" }} />
              <p style={{ fontSize: 11 }}>Veuillez patienter...</p>
            </div>
          </WinWindow>
        </div>
      }
    >
      <TontineMembreDashboard />
    </Suspense>
  );
}

function TontineMembreDashboard() {
  const searchParams = useSearchParams();
  const tontineId = searchParams.get("id") || searchParams.get("tontine_id");

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [tontine, setTontine] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [cotisations, setCotisations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"historique" | "attente" | "gerance">("historique");
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinName, setSpinName] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [editPhotoUrl, setEditPhotoUrl] = useState("");
  const [editDateNaissance, setEditDateNaissance] = useState("");
  const [editPin, setEditPin] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [showPhotoInput, setShowPhotoInput] = useState(false);
  const [togglingPaymentFor, setTogglingPaymentFor] = useState<string | null>(null);
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const checkSessionAndFetchData = async () => {
      if (!tontineId) { setIsCheckingSession(false); return; }
      const { data: tData, error: tError } = await supabase.from("tontines").select("*").eq("id", tontineId).single();
      if (tError || !tData) { setTontine(null); setIsCheckingSession(false); return; }
      setTontine(tData);
      const savedMemberId = localStorage.getItem(`tontine_session_${tontineId}`);
      if (savedMemberId) {
        const { data: memberData, error: memberError } = await supabase.from("tontine_members").select("*").eq("id", savedMemberId).single();
        if (memberData && !memberError) { await fetchDashboardData(memberData, tData); }
        else { localStorage.removeItem(`tontine_session_${tontineId}`); setCurrentUser(null); }
      }
      setIsCheckingSession(false);
    };
    checkSessionAndFetchData();
  }, [tontineId]);

  const fetchDashboardData = async (member: any, tontineData: any) => {
    setEditPhotoUrl(member.photo_url || "");
    setEditDateNaissance(member.date_naissance || "");
    const { data: allMembersData, error: membersError } = await supabase.from("tontine_members").select("*").eq("tontine_id", tontineData.id);
    const { data: allCotisationsData } = await supabase.from("cotisations").select("*");
    if (membersError) { setMembers([]); }
    else {
      const freshCurrentUser = allMembersData?.find((m) => m.id === member.id);
      setCurrentUser(freshCurrentUser || member);
      setMembers(allMembersData || []);
    }
    setCotisations(allCotisationsData || []);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      if (!tontineId) throw new Error("Lien de tontine invalide.");
      let cleanPhoneUser = phone.replace(/[^0-9]/g, "");
      if (cleanPhoneUser.startsWith("221")) cleanPhoneUser = cleanPhoneUser.slice(3);
      if (cleanPhoneUser.startsWith("00221")) cleanPhoneUser = cleanPhoneUser.slice(5);
      const cleanPinUser = pin.trim();
      if (!cleanPhoneUser || !cleanPinUser) throw new Error("Veuillez remplir tous les champs.");
      const { data: membersList, error: fetchErr } = await supabase.from("tontine_members").select("*").eq("tontine_id", tontineId);
      if (fetchErr) throw fetchErr;
      if (!membersList || membersList.length === 0) throw new Error("Aucun membre trouvé dans cette tontine.");
      let debugDbPhone = "Aucun";
      let debugDbPin = "Aucun";
      const matchedMember = membersList.find((m) => {
        let rawPhone = String(m.telephone || "").split(".")[0];
        let dbPhone = rawPhone.replace(/[^0-9]/g, "");
        if (dbPhone.startsWith("221")) dbPhone = dbPhone.slice(3);
        if (dbPhone.startsWith("00221")) dbPhone = dbPhone.slice(5);
        let rawPin = String(m.code_secret || "").trim();
        let dbPin = rawPin === "" || rawPin.toLowerCase() === "null" || rawPin.toLowerCase() === "undefined" ? "0000" : rawPin;
        if (dbPhone === cleanPhoneUser || dbPhone.includes(cleanPhoneUser)) { debugDbPhone = dbPhone; debugDbPin = rawPin === "" || rawPin.toLowerCase() === "null" ? "VIDE (Auto-remplacé par 0000)" : dbPin; }
        return dbPhone === cleanPhoneUser && dbPin === cleanPinUser;
      });
      if (!matchedMember) {
        if (debugDbPhone !== "Aucun") throw new Error(`Numéro BDD: "${debugDbPhone}", PIN BDD: "${debugDbPin}". PIN saisi: "${cleanPinUser}"`);
        else throw new Error("Numéro de téléphone ou code PIN incorrect.");
      }
      localStorage.setItem(`tontine_session_${tontineId}`, matchedMember.id);
      await fetchDashboardData(matchedMember, tontine);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    if (tontineId) localStorage.removeItem(`tontine_session_${tontineId}`);
    setCurrentUser(null); setPhone(""); setPin(""); setLoginError(null);
  };

  const totalMembres = members.length;
  const totalGagnantsMois = tontine?.gagnants_par_mois || 2;
  const moisEcoules = Math.floor(members.filter((m) => m.a_gagne).length / totalGagnantsMois);
  const currentMonth = moisEcoules + 1;
  let endDateText: string | null = null;
  let remainingMonths: number | null = null;
  if (tontine?.date_debut && tontine?.duree_mois) {
    const startDate = new Date(tontine.date_debut);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + tontine.duree_mois);
    endDateText = endDate.toLocaleDateString("fr-FR", { year: "numeric", month: "long" });
    remainingMonths = tontine.duree_mois - moisEcoules;
  }
  const caisseMensuelle = members.reduce((sum, m) => sum + (m.cotisation_individuelle || tontine?.montant_mensuel || 20000), 0);
  const cotisationsCeMois = cotisations.filter((c) => c.mois_numero === currentMonth && c.statut === "Payé");
  const actuelCaisse = cotisationsCeMois.reduce((acc, c) => acc + c.montant, 0);
  const progressPercentage = caisseMensuelle > 0 ? (actuelCaisse / caisseMensuelle) * 100 : 0;
  const isUserUpToDate = cotisationsCeMois.some((c) => c.membre_id === currentUser?.id);
  const winnersHistoryRaw = members.filter((m) => m.a_gagne).reduce((acc: any, m: any) => {
    const mois = m.mois_victoire;
    if (!acc[mois]) acc[mois] = [];
    acc[mois].push({ nom: m.prenom_nom, photo: m.photo_url, is_admin: m.is_admin });
    return acc;
  }, {});
  const winnersHistory = Object.keys(winnersHistoryRaw).map((mois) => ({
    mois: Number(mois), date: `Mois ${mois}`, winners: winnersHistoryRaw[mois], amount: caisseMensuelle,
  })).sort((a, b) => b.mois - a.mois);
  const waitingList = members.filter((m) => !m.a_gagne);
  const maxMoisVictoire = Math.max(0, ...members.map((m) => m.mois_victoire || 0));
  const recentWinners = members.filter((m) => m.a_gagne && m.mois_victoire === maxMoisVictoire);
  const montantParGagnant = tontine?.gagnants_par_mois ? caisseMensuelle / tontine.gagnants_par_mois : caisseMensuelle / 2;

  const handleReveal = () => {
    setIsSpinning(true);
    const eligible = members.length > 0 ? members : [{ prenom_nom: "Mélange..." }];
    const spinInterval = setInterval(() => {
      const random = eligible[Math.floor(Math.random() * eligible.length)].prenom_nom;
      setSpinName(random);
    }, 100);
    setTimeout(() => {
      clearInterval(spinInterval);
      setIsSpinning(false);
      setRevealed(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3");
      audio.volume = 0.4;
      audio.play().catch(() => {});
    }, 2500);
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const payload: any = {};
      if (editPhotoUrl !== (currentUser.photo_url || "")) payload.photo_url = editPhotoUrl;
      if (editDateNaissance !== (currentUser.date_naissance || "")) { payload.date_naissance = editDateNaissance; payload.date_naissance_modifiee = true; }
      if (editPin.trim().length > 0) {
        if (editPin.trim().length < 4) throw new Error("Le code PIN doit contenir exactement 4 chiffres.");
        payload.code_secret = editPin.trim();
      }
      if (Object.keys(payload).length > 0) {
        const { data, error } = await supabase.from("tontine_members").update(payload).eq("id", currentUser.id).select();
        if (error) throw error;
        if (!data || data.length === 0) throw new Error("Sécurité Supabase : Enregistrement bloqué.");
        setCurrentUser({ ...currentUser, ...payload });
        setEditPin("");
        const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3");
        audio.volume = 0.4;
        audio.play().catch(() => {});
      }
    } catch (e: any) {
      alert(e.message || "Erreur lors de la mise à jour.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleTogglePaiement = async (membreId: string, moisEnCours: number) => {
    if (!tontine) return;
    try {
      const { data: existingCotisation, error: searchErr } = await supabase.from("cotisations").select("id").eq("membre_id", membreId).eq("mois_numero", moisEnCours).eq("statut", "Payé").single();
      if (searchErr && searchErr.code !== "PGRST116") throw searchErr;
      if (existingCotisation && !window.confirm("Êtes-vous sûr de vouloir annuler ce paiement ?")) return;
      setTogglingPaymentFor(membreId);
      if (existingCotisation) {
        const { error: deleteErr } = await supabase.from("cotisations").delete().eq("id", existingCotisation.id);
        if (deleteErr) throw deleteErr;
      } else {
        const { error: insertErr } = await supabase.from("cotisations").insert([{ tontine_id: tontine.id, membre_id: membreId, mois_numero: moisEnCours, montant: tontine.montant_mensuel || 0, statut: "Payé" }]);
        if (insertErr) throw insertErr;
      }
      const { data: freshCots } = await supabase.from("cotisations").select("*").eq("tontine_id", tontine.id);
      setCotisations(freshCots || []);
    } catch (error: any) {
      alert("Impossible d'enregistrer le paiement : " + error.message);
    } finally {
      setTogglingPaymentFor(null);
    }
  };

  // ─── RENDER GUARDS ──────────────────────────────────────────────────────────
  if (isCheckingSession) {
    return (
      <div className="win2k-root flex items-center justify-center" style={{ minHeight: "100vh" }}>
        <style>{win2kStyle}</style>
        <WinWindow title="Onyx Tontine — Chargement" active>
          <div style={{ padding: "32px 48px", textAlign: "center", background: "#D4D0C8" }}>
            <div className="win-loading" style={{ width: 32, height: 32, margin: "0 auto 12px" }} />
            <p>Vérification de session en cours...</p>
          </div>
        </WinWindow>
      </div>
    );
  }

  if (!tontineId || !tontine) {
    return (
      <div className="win2k-root flex items-center justify-center" style={{ minHeight: "100vh" }}>
        <style>{win2kStyle}</style>
        <WinWindow title="Erreur — Lien Invalide" active style={{ maxWidth: 400, width: "100%" }}>
          <div style={{ padding: "24px", background: "#D4D0C8", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🚫</div>
            <p style={{ fontWeight: "bold", fontSize: 13, marginBottom: 6 }}>Lien Invalide</p>
            <p style={{ color: "#444" }}>L&apos;identifiant de la tontine est manquant ou incorrect.</p>
          </div>
          <WinStatusBar><span>Erreur</span></WinStatusBar>
        </WinWindow>
      </div>
    );
  }

  // ─── LOGIN SCREEN ───────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div
        className="win2k-root flex items-center justify-center p-4"
        style={{ minHeight: "100vh", background: "#008080" }}
      >
        <style>{win2kStyle}</style>

        {/* Desktop icon top-left */}
        <div style={{ position: "absolute", top: 16, left: 16, textAlign: "center", cursor: "pointer" }}>
          <div style={{ fontSize: 32 }}>💼</div>
          <p style={{ color: "#fff", fontSize: 10, textShadow: "1px 1px 2px #000", marginTop: 2 }}>Ma Tontine</p>
        </div>

        <WinWindow
          title={`${tontine.nom} — Connexion`}
          active
          style={{ width: "100%", maxWidth: 360 }}
          icon={<Users size={12} />}
        >
          <div style={{ padding: "16px", background: "#D4D0C8" }}>
            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div
                style={{
                  width: 64, height: 64, margin: "0 auto 8px",
                  border: "2px solid", borderColor: "#808080 #FFFFFF #FFFFFF #808080",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  overflow: "hidden", background: "#000",
                }}
              >
                {tontine.logo_url
                  ? <img src={tontine.logo_url} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <Users size={28} style={{ color: tontine.theme_color || "#39FF14" }} />
                }
              </div>
              <p style={{ fontWeight: "bold", fontSize: 13 }}>{tontine.nom}</p>
              <p style={{ fontSize: 10, color: "#444" }}>Accédez à votre espace membre</p>
            </div>

            <WinDivider />

            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 10 }}>
              <div>
                <label className="win2k-field-label">Numéro de téléphone :</label>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Phone size={12} style={{ color: "#444", flexShrink: 0 }} />
                  <WinInput
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 77 000 00 00"
                  />
                </div>
              </div>

              <div>
                <label className="win2k-field-label">Code PIN :</label>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <KeyRound size={12} style={{ color: "#444", flexShrink: 0 }} />
                  <WinInput
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="••••  (défaut: 0000)"
                  />
                </div>
              </div>

              {loginError && (
                <div
                  style={{
                    background: "#FFFFC0",
                    border: "1px solid #808080",
                    padding: "4px 8px",
                    fontSize: 10,
                    color: "#800000",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 4,
                  }}
                >
                  <AlertCircle size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                  {loginError}
                </div>
              )}

              <WinDivider />

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                <WinButton type="submit" disabled={isLoggingIn}>
                  {isLoggingIn ? <><div className="win-loading" style={{ width: 12, height: 12 }} /> Connexion...</> : "Se connecter"}
                </WinButton>
                <WinButton type="button" onClick={() => { setPhone(""); setPin(""); setLoginError(null); }}>
                  Annuler
                </WinButton>
              </div>
            </form>
          </div>
          <WinStatusBar>
            <Monitor size={12} />
            <span>Prêt</span>
          </WinStatusBar>
        </WinWindow>

        {/* Windows 2000 Taskbar */}
        <div className="win2k-taskbar">
          <button className="win2k-start-btn">
            <span>🪟</span> Démarrer
          </button>
          <div style={{ width: "1px", height: "22px", borderLeft: "1px solid #808080", borderRight: "1px solid #FFFFFF" }} />
          <div
            style={{
              marginLeft: "auto", padding: "2px 8px",
              borderLeft: "1px solid #808080", borderRight: "1px solid #FFFFFF",
              fontSize: 11, color: "#000",
            }}
          >
            {clock.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ──────────────────────────────────────────────────────────────
  const paidCount = members.filter((m) => cotisations.some((c) => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === "Payé")).length;
  const toPayCount = members.length - paidCount;

  return (
    <div
      className="win2k-root"
      style={{ background: "#008080", minHeight: "100vh", paddingBottom: 34 }}
    >
      <style>{win2kStyle}</style>

      {/* Confetti */}
      {showConfetti && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, pointerEvents: "none", overflow: "hidden" }}>
          {[...Array(80)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute", top: "-10%", opacity: 0,
                left: `${Math.random() * 100}%`,
                width: `${Math.random() * 10 + 6}px`, height: `${Math.random() * 10 + 6}px`,
                backgroundColor: i % 3 === 0 ? "#ffffff" : "#000080",
                animation: `confetti-fall ${2 + Math.random() * 3}s linear forwards`,
                animationDelay: `${Math.random() * 1.5}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Top Menubar ── */}
      <div
        style={{
          background: "#D4D0C8",
          borderBottom: "2px solid",
          borderColor: "#808080 #FFFFFF #FFFFFF #808080",
          padding: "2px 8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 40,
        }}
      >
        {/* Left: Logo + name */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 24, height: 24, overflow: "hidden",
              border: "1px solid #808080",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "#000",
            }}
          >
            {tontine.logo_url
              ? <img src={tontine.logo_url} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              : <Users size={14} style={{ color: tontine.theme_color || "#39FF14" }} />
            }
          </div>
          <div>
            <span style={{ fontWeight: "bold", fontSize: 12 }}>{tontine.nom}</span>
            <span style={{ color: "#444", fontSize: 10, marginLeft: 8 }}>— Espace Membre</span>
          </div>
        </div>

        {/* Right: User + Logout */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 22, height: 22, borderRadius: "50%", overflow: "hidden",
                border: "1px solid #808080",
                background: "#000", display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: "bold", color: "#fff",
              }}
            >
              {currentUser.photo_url
                ? <img src={currentUser.photo_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : currentUser.prenom_nom.substring(0, 2).toUpperCase()
              }
            </div>
            <span style={{ fontWeight: "bold", fontSize: 11 }}>{currentUser.prenom_nom.split(" ")[0]}</span>
            {currentUser.is_admin && <ShieldCheck size={12} style={{ color: "#808000" }} title="Administrateur" />}
          </div>
          <WinButton onClick={handleLogout} style={{ minWidth: 0, padding: "1px 6px" }}>
            <LogOut size={10} /> Déconn.
          </WinButton>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "8px", display: "flex", flexDirection: "column", gap: 8 }}>

        {/* Row 1: Profile + Status + Caisse */}
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 8 }}>

          {/* ── Profile Panel ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <WinWindow title="Profil Membre" active icon={<Users size={10} />}>
              <div style={{ padding: 12, background: "#D4D0C8" }}>
                {/* Avatar */}
                <div style={{ textAlign: "center", marginBottom: 10 }}>
                  <div
                    style={{
                      width: 72, height: 72, margin: "0 auto 6px",
                      border: "2px solid",
                      borderColor: "#808080 #FFFFFF #FFFFFF #808080",
                      overflow: "hidden", background: "#000",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 28, fontWeight: "bold", color: tontine.theme_color || "#39FF14",
                      cursor: "pointer",
                    }}
                    onClick={() => setShowPhotoInput(!showPhotoInput)}
                    title="Changer la photo"
                  >
                    {currentUser.photo_url
                      ? <img src={currentUser.photo_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : currentUser.prenom_nom.charAt(0)
                    }
                  </div>
                  <p style={{ fontWeight: "bold", fontSize: 12 }}>{currentUser.prenom_nom}</p>
                  {currentUser.poste && (
                    <p style={{ fontSize: 10, color: "#444", marginTop: 2 }}>{currentUser.poste}</p>
                  )}
                  <p style={{ fontSize: 10, color: "#666" }}>{currentUser.telephone}</p>
                </div>

                {/* Badges */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10, justifyContent: "center" }}>
                  {currentUser.a_gagne && (
                    <span className="win2k-badge-yellow">🎉 A GAGNÉ — Mois {currentUser.mois_victoire}</span>
                  )}
                  {isUserUpToDate
                    ? <span className="win2k-badge-green">✓ À JOUR</span>
                    : <span className="win2k-badge-red">⚠ À PAYER</span>
                  }
                </div>

                <WinDivider />

                {/* Photo URL */}
                {showPhotoInput && (
                  <div style={{ marginBottom: 8 }}>
                    <label className="win2k-field-label">URL de la photo :</label>
                    <WinInput
                      type="url"
                      value={editPhotoUrl}
                      onChange={(e) => setEditPhotoUrl(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>
                )}

                {/* Date de naissance */}
                <div style={{ marginBottom: 8 }}>
                  <label className="win2k-field-label">Date de naissance :</label>
                  {currentUser.date_naissance_modifiee ? (
                    <div>
                      <WinInput type="date" value={currentUser.date_naissance || ""} disabled />
                      <p style={{ fontSize: 9, color: "#800000", marginTop: 2 }}>
                        <AlertCircle size={9} style={{ display: "inline", marginRight: 2 }} />
                        Date verrouillée. Contactez l&apos;admin.
                      </p>
                    </div>
                  ) : (
                    <WinInput
                      type="date"
                      value={editDateNaissance}
                      onChange={(e) => setEditDateNaissance(e.target.value)}
                    />
                  )}
                </div>

                {/* PIN */}
                <div style={{ marginBottom: 10 }}>
                  <label className="win2k-field-label">
                    Nouveau code PIN :
                    {(!currentUser.code_secret || currentUser.code_secret === "0000") && (
                      <span style={{ color: "#800000", marginLeft: 4, fontWeight: "bold" }}>⚠ Non sécurisé !</span>
                    )}
                  </label>
                  <WinInput
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={editPin}
                    onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ""); setEditPin(v); }}
                    placeholder="Laisser vide pour conserver"
                  />
                </div>

                <WinButton
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile || (editDateNaissance === (currentUser.date_naissance || "") && editPhotoUrl === (currentUser.photo_url || "") && editPin === "")}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {isSavingProfile ? <><div className="win-loading" style={{ width: 10, height: 10 }} /> Sauvegarde...</> : <><Save size={11} /> Mettre à jour</>}
                </WinButton>
              </div>
              <WinStatusBar>
                <span>Profil</span>
                <span style={{ marginLeft: "auto" }}>
                  Cotisation : {(currentUser.cotisation_individuelle || tontine.montant_mensuel || 0).toLocaleString()} F
                </span>
              </WinStatusBar>
            </WinWindow>

            {/* ── Statut Panel ── */}
            <WinWindow title="Votre Statut" icon={<Calendar size={10} />}>
              <div style={{ padding: "8px 12px", background: "#D4D0C8", display: "flex", flexDirection: "column", gap: 6 }}>
                <div className="win2k-raised" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 9, color: "#444", textTransform: "uppercase" }}>Mois restants</p>
                    <p style={{ fontWeight: "bold", fontSize: 16 }}>{remainingMonths ?? tontine.duree_mois}</p>
                    <p style={{ fontSize: 9, color: "#666" }}>/ {tontine.duree_mois}</p>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 9, color: "#444", textTransform: "uppercase" }}>Durée totale</p>
                    <p style={{ fontWeight: "bold", fontSize: 16 }}>{tontine.duree_mois}</p>
                    <p style={{ fontSize: 9, color: "#666" }}>mois</p>
                  </div>
                </div>
                {endDateText && (
                  <p style={{ fontSize: 10, color: "#444", textAlign: "center" }}>
                    Fin prévue : <strong>{endDateText}</strong>
                  </p>
                )}
              </div>
            </WinWindow>
          </div>

          {/* ── Right Column ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

            {/* ── Caisse Globale ── */}
            <WinWindow title={`Situation de la Caisse — Mois ${currentMonth}`} active icon={<Wallet size={10} />}>
              <div style={{ padding: 12, background: "#D4D0C8" }}>
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 10, color: "#444", marginBottom: 4 }}>Cotisations collectées :</p>
                  <p style={{ fontWeight: "bold", fontSize: 22, color: "#000080" }}>
                    {actuelCaisse.toLocaleString()} F
                    <span style={{ fontWeight: "normal", fontSize: 12, color: "#666", marginLeft: 6 }}>
                      / {caisseMensuelle.toLocaleString()} F CFA
                    </span>
                  </p>
                </div>

                <WinProgressBar value={actuelCaisse} max={caisseMensuelle} color="#000080" />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <p style={{ fontSize: 10 }}>
                    <strong>{cotisationsCeMois.length}</strong> membre{cotisationsCeMois.length > 1 ? "s" : ""} sur{" "}
                    <strong>{totalMembres}</strong> ont payé ({Math.round(progressPercentage)}%)
                  </p>
                  <div
                    style={{
                      background: "#000080", color: "#FFF",
                      padding: "2px 8px", fontSize: 10, fontWeight: "bold",
                      display: "flex", alignItems: "center", gap: 4,
                    }}
                  >
                    <Calendar size={10} /> Tirage : 05 du mois
                  </div>
                </div>
              </div>
              <WinStatusBar>
                <span>Tontine : {tontine.nom}</span>
                <span style={{ marginLeft: "auto" }}>{totalMembres} membres</span>
              </WinStatusBar>
            </WinWindow>

            {/* ── Tirage ── */}
            <WinWindow title={`Tirage au Sort — Mois ${maxMoisVictoire > 0 ? maxMoisVictoire : 1}`} icon={<Shuffle size={10} />}>
              <div style={{ padding: 16, background: "#D4D0C8", textAlign: "center", minHeight: 140 }}>
                {maxMoisVictoire === 0 ? (
                  <div style={{ padding: "20px 0" }}>
                    <Trophy size={32} style={{ margin: "0 auto 8px", color: "#808080" }} />
                    <p style={{ fontWeight: "bold", fontSize: 12 }}>Aucun tirage effectué pour le moment</p>
                    <p style={{ fontSize: 10, color: "#666", marginTop: 4 }}>Le premier tirage n&apos;a pas encore été effectué.</p>
                  </div>
                ) : !revealed ? (
                  isSpinning ? (
                    <div style={{ padding: "16px 0" }}>
                      <div className="win-loading" style={{ width: 40, height: 40, margin: "0 auto 12px" }} />
                      <p style={{ fontWeight: "bold", fontSize: 16, color: "#000080" }}>{spinName || "Mélange..."}</p>
                      <p style={{ fontSize: 10, color: "#666", marginTop: 6 }}>Sélection du gagnant en cours...</p>
                    </div>
                  ) : (
                    <div style={{ padding: "16px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                      <Trophy size={32} style={{ color: "#808000" }} />
                      <p style={{ fontWeight: "bold", fontSize: 13 }}>Les gagnants ont été tirés !</p>
                      <WinButton onClick={handleReveal}>
                        <Trophy size={11} /> Découvrir les gagnants
                      </WinButton>
                    </div>
                  )
                ) : (
                  <div>
                    <p style={{ fontWeight: "bold", fontSize: 13, marginBottom: 10, color: "#000080" }}>Félicitations !</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 6 }}>
                      {recentWinners.map((winner: any) => (
                        <div
                          key={winner.id}
                          className="win2k-raised"
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px" }}
                        >
                          <Medal size={22} style={{ color: "#808000", flexShrink: 0 }} />
                          <div style={{ textAlign: "left" }}>
                            <p style={{ fontWeight: "bold", fontSize: 11 }}>{winner.prenom_nom}</p>
                            <p style={{ fontSize: 10, color: "#000080", fontWeight: "bold" }}>
                              {montantParGagnant.toLocaleString()} F CFA
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </WinWindow>
          </div>
        </div>

        {/* ── Tabs Section ── */}
        <div>
          {/* Tab headers */}
          <div style={{ display: "flex", paddingLeft: 2 }}>
            <WinTab label="Historique Gagnants" active={activeTab === "historique"} onClick={() => setActiveTab("historique")} />
            <WinTab label={`En Attente (${waitingList.length})`} active={activeTab === "attente"} onClick={() => setActiveTab("attente")} />
            {currentUser.is_admin && (
              <WinTab label="Gérance 👑" active={activeTab === "gerance"} onClick={() => setActiveTab("gerance")} />
            )}
          </div>

          {/* Tab content */}
          <div
            style={{
              background: "#D4D0C8",
              border: "2px solid",
              borderColor: activeTab === "historique" ? "#FFFFFF #808080 #808080 #808080" : "#FFFFFF #808080 #808080 #808080",
              padding: 12,
            }}
          >
            {/* HISTORIQUE */}
            {activeTab === "historique" && (
              <div>
                {/* Guarantee notice */}
                <div
                  className="win2k-sunken"
                  style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 10, background: "#FFFFC0" }}
                >
                  <ShieldCheck size={14} style={{ color: "#000080", flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p style={{ fontWeight: "bold", fontSize: 11 }}>Zéro Magouille garantie.</p>
                    <p style={{ fontSize: 10, color: "#444" }}>
                      Les tirages sont effectués automatiquement par le système et enregistrés en toute transparence.
                    </p>
                  </div>
                </div>

                {/* Winners list */}
                <div
                  className="win2k-sunken"
                  style={{ padding: 0, maxHeight: 300, overflowY: "auto" }}
                >
                  {winnersHistory.length === 0 ? (
                    <p style={{ padding: 12, fontSize: 11, color: "#666", textAlign: "center" }}>Aucun tirage enregistré.</p>
                  ) : (
                    winnersHistory.map((h: any, i: number) => (
                      <div
                        key={i}
                        className="win2k-list-row"
                        style={{ borderBottom: "1px solid #E0DDD5", flexWrap: "wrap" }}
                      >
                        <span
                          style={{
                            background: "#000080", color: "#FFF",
                            padding: "1px 6px", fontSize: 10, fontWeight: "bold",
                            minWidth: 70, textAlign: "center",
                          }}
                        >
                          Mois {h.mois}
                        </span>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1 }}>
                          {h.winners.map((w: any, wIdx: number) => (
                            <span key={wIdx} style={{ fontWeight: "bold", fontSize: 11, display: "flex", alignItems: "center", gap: 3 }}>
                              {w.nom}
                              {w.is_admin && <ShieldCheck size={11} style={{ color: "#808000" }} />}
                              {wIdx < h.winners.length - 1 && <span style={{ color: "#808080" }}> &</span>}
                            </span>
                          ))}
                        </div>
                        <span style={{ fontSize: 10, fontWeight: "bold", color: "#008000", whiteSpace: "nowrap" }}>
                          {h.amount.toLocaleString()} F
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ATTENTE */}
            {activeTab === "attente" && (
              <div>
                <p style={{ fontSize: 10, color: "#444", marginBottom: 8 }}>
                  Ces membres participeront aux prochains tirages au sort mensuels.
                </p>
                <div
                  className="win2k-sunken"
                  style={{ padding: 0, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 0 }}
                >
                  {waitingList.map((m: any, i: number) => (
                    <div
                      key={i}
                      className="win2k-list-row"
                      style={{
                        background: m.id === currentUser.id ? "#000080" : undefined,
                        color: m.id === currentUser.id ? "#FFFFFF" : undefined,
                        fontWeight: m.id === currentUser.id ? "bold" : undefined,
                      }}
                    >
                      <Lock size={10} style={{ color: m.id === currentUser.id ? "#FFF" : "#808080", flexShrink: 0 }} />
                      <span style={{ fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {m.prenom_nom.split(" ")[0]}
                        {m.id === currentUser.id && " (Vous)"}
                        {m.is_admin && <ShieldCheck size={10} style={{ display: "inline", marginLeft: 3, color: "#808000" }} />}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* GÉRANCE */}
            {activeTab === "gerance" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <Wallet size={14} style={{ color: "#000080" }} />
                  <div>
                    <p style={{ fontWeight: "bold", fontSize: 12 }}>Pointage des Cotisations — Mois {currentMonth}</p>
                    <p style={{ fontSize: 10, color: "#444" }}>Cochez les membres qui ont payé leur cotisation.</p>
                  </div>
                </div>

                {/* Stats row */}
                <div className="win2k-raised" style={{ display: "flex", gap: 16, marginBottom: 10 }}>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 20, fontWeight: "bold", color: "#008000" }}>{paidCount}</p>
                    <p style={{ fontSize: 9, textTransform: "uppercase", color: "#444" }}>À Jour</p>
                  </div>
                  <div style={{ width: 1, background: "#808080" }} />
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 20, fontWeight: "bold", color: "#800000" }}>{toPayCount}</p>
                    <p style={{ fontSize: 9, textTransform: "uppercase", color: "#444" }}>À Payer</p>
                  </div>
                </div>

                {/* Members table */}
                <div className="win2k-sunken" style={{ padding: 0 }}>
                  {/* Table header */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto auto",
                      padding: "3px 6px",
                      background: "#000080",
                      color: "#FFF",
                      fontSize: 10,
                      fontWeight: "bold",
                      gap: 8,
                    }}
                  >
                    <span>Membre</span>
                    <span>WhatsApp</span>
                    <span>Statut</span>
                  </div>

                  {members.map((m: any) => {
                    const hasPaid = cotisations.some((c) => c.membre_id === m.id && c.mois_numero === currentMonth && c.statut === "Payé");
                    const isToggling = togglingPaymentFor === m.id;
                    const relanceMessage = `Bonjour ${m.prenom_nom}, petit rappel pour la cotisation de la tontine "${tontine?.nom}" de ce mois. Merci de régulariser au plus vite !`;
                    return (
                      <div
                        key={m.id}
                        className="win2k-list-row"
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr auto auto",
                          gap: 8,
                          borderBottom: "1px solid #E0DDD5",
                          background: hasPaid ? "#E8FFE8" : undefined,
                          alignItems: "center",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, overflow: "hidden" }}>
                          <img
                            src={m.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.prenom_nom)}&background=random`}
                            alt={m.prenom_nom}
                            style={{ width: 20, height: 20, borderRadius: "50%", border: "1px solid #808080", flexShrink: 0 }}
                          />
                          <div style={{ overflow: "hidden" }}>
                            <p style={{ fontWeight: "bold", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {m.prenom_nom}
                            </p>
                            <p style={{ fontSize: 9, color: "#666" }}>{m.telephone}</p>
                          </div>
                        </div>
                        {!hasPaid ? (
                          <a
                            href={`https://wa.me/221${m.telephone}?text=${encodeURIComponent(relanceMessage)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <WinButton style={{ minWidth: 0, padding: "1px 6px", fontSize: 10 }}>
                              <MessageCircle size={10} /> Relancer
                            </WinButton>
                          </a>
                        ) : (
                          <span style={{ width: 64 }} />
                        )}
                        <WinButton
                          onClick={() => handleTogglePaiement(m.id, currentMonth)}
                          disabled={isToggling}
                          style={{
                            minWidth: 0,
                            padding: "1px 8px",
                            background: hasPaid ? "#008000" : "#D4D0C8",
                            color: hasPaid ? "#FFFFFF" : "#000",
                          }}
                        >
                          {isToggling
                            ? <div className="win-loading" style={{ width: 10, height: 10 }} />
                            : hasPaid
                              ? <><CheckCircle size={10} /> Payé</>
                              : "Pointer"
                          }
                        </WinButton>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Windows Taskbar ── */}
      <div className="win2k-taskbar">
        <button className="win2k-start-btn">
          <span>🪟</span> Démarrer
        </button>
        <div style={{ width: 1, height: 22, borderLeft: "1px solid #808080", borderRight: "1px solid #FFFFFF" }} />
        {/* Active window chip */}
        <div
          style={{
            background: "#000080", color: "#FFF",
            border: "2px solid",
            borderColor: "#808080 #FFFFFF #FFFFFF #808080",
            padding: "1px 10px",
            fontSize: 11, fontWeight: "bold",
            display: "flex", alignItems: "center", gap: 4,
          }}
        >
          <Users size={10} /> {tontine.nom} — Espace Membre
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <Bell size={12} />
          <div
            style={{
              borderLeft: "1px solid #808080",
              paddingLeft: 8,
              fontSize: 11,
            }}
          >
            {clock.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TontineMembrePage;

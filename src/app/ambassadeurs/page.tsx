"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Wallet, Trophy, Link2, Copy, Check, ShoppingBag, PlayCircle, Users, LogOut } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AmbassadeursPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [partner, setPartner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [myClients, setMyClients] = useState<any[]>([]);

  const refLink = typeof window !== "undefined" ? `${window.location.origin}/?ref=${partner?.id || "amb"}` : "https://onyxops.com/?ref=amb";

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("ambassadeur_phone") : null;
    if (stored) {
      supabase.from("partners").select("*").eq("contact", stored).maybeSingle().then(({ data }) => {
        setPartner(data || null);
        setLoading(false);
      });
    } else setLoading(false);
  }, []);

  useEffect(() => {
    if (partner?.id) {
      supabase.from("clients").select("*").ilike("source", "%ambassadeur%").then(({ data }) => setMyClients(data || []));
    }
  }, [partner?.id]);

  const handleLogin = async () => {
    const { data, error } = await supabase
    .from('partners')
    .select('*')
    .or(`contact.eq.${phone.trim()},contact.eq.${phone.replace(/\s+/g, '')}`) // Cherche avec ou sans espaces
    .eq('password_temp', password.trim())
    .maybeSingle();
  
    if (data) {
      // Connexion réussie
      localStorage.setItem('onyx_session', JSON.stringify(data));
      window.location.href = '/ambassadeurs/dashboard';
    } else {
      alert("Identifiants incorrects ou compte non encore approuvé.");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#39FF14] border-t-transparent rounded-full animate-spin" />
      </div>
    );

  if (!partner) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-[#39FF14]/30 shadow-[0_0_60px_rgba(57,255,20,0.1)] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#39FF14]/20 rounded-2xl flex items-center justify-center text-[#39FF14] mx-auto mb-4 border border-[#39FF14]/50">
              <Trophy size={32} />
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tighter text-white">Portail Ambassadeur</h1>
            <p className="text-sm text-zinc-400 mt-1">Connectez-vous pour accéder à votre hub</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="tel" placeholder="Numéro de téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#39FF14] placeholder:text-zinc-500" />
            <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#39FF14] placeholder:text-zinc-500" />
            <button type="submit" disabled={authLoading} className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:scale-[1.02] transition disabled:opacity-50 shadow-[0_0_30px_rgba(57,255,20,0.3)]">
              {authLoading ? "Connexion..." : "Se connecter"}
            </button>
            <div className="flex justify-between items-center mt-6 px-4">
  <label className="flex items-center gap-2 cursor-pointer">
    <input type="checkbox" className="accent-[#39FF14] w-4 h-4" />
    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Rester connecté</span>
  </label>
  <button className="text-[10px] text-[#39FF14] font-black uppercase tracking-widest hover:underline">
    Mot de passe oublié ?
  </button>
</div>
          </form>
        </div>
      </div>
    );
  }

  const gainsJour = 12500;
  const gainsMois = 142500;
  const gainsAnnee = 1850000;
  const rank = 3;
  const ventes = partner.sales ?? 12;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900/50">
        <h1 className="text-xl font-black uppercase tracking-tighter text-[#39FF14]">Hub Ambassadeur</h1>
        <button onClick={() => { setPartner(null); localStorage.removeItem("ambassadeur_phone"); }} className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-[#39FF14] transition">
          <LogOut size={14} /> Déconnexion
        </button>
      </header>

      <main className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Wallet Néon - Gains */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-[#39FF14]/40 rounded-2xl p-6 shadow-[0_0_40px_rgba(57,255,20,0.15)] hover:shadow-[0_0_60px_rgba(57,255,20,0.2)] transition-all cursor-pointer animate-pulse">
            <p className="text-[10px] font-black uppercase text-[#39FF14] tracking-widest mb-1">Gains du jour</p>
            <p className="text-3xl font-black text-white">{gainsJour.toLocaleString()} F</p>
          </div>
          <div className="bg-zinc-900 border border-[#39FF14]/30 rounded-2xl p-6 hover:border-[#39FF14]/50 transition-all cursor-pointer">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Ce mois</p>
            <p className="text-3xl font-black text-[#39FF14]">{gainsMois.toLocaleString()} F</p>
          </div>
          <div className="bg-zinc-900 border border-[#39FF14]/30 rounded-2xl p-6 hover:border-[#39FF14]/50 transition-all cursor-pointer">
            <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">Cette année</p>
            <p className="text-3xl font-black text-[#39FF14]">{gainsAnnee.toLocaleString()} F</p>
          </div>
        </section>

        {/* Leaderboard */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase text-[#39FF14] mb-4">
            <Trophy size={22} /> Classement
          </h2>
          <p className="text-white font-bold">Tu es <span className="text-[#39FF14]">{rank}ème</span> à Dakar ce mois-ci — encore 2 ventes pour le bonus !</p>
        </section>

        {/* Lien de parrainage */}
        <section className="bg-black border-2 border-[#39FF14] rounded-2xl p-6 shadow-[0_0_50px_rgba(57,255,20,0.2)]">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase text-[#39FF14] mb-4">
            <Link2 size={22} /> Mon lien de parrainage
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input readOnly value={refLink} className="flex-1 p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-mono text-zinc-300" />
            <button onClick={handleCopy} className="flex items-center justify-center gap-2 bg-[#39FF14] text-black px-8 py-4 rounded-xl font-black uppercase text-sm hover:scale-105 transition">
              {copied ? <><Check size={18} /> Copié</> : <><Copy size={18} /> Copier mon lien</>}
            </button>
          </div>
        </section>

        {/* Trousseau Ambassadeur */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-black uppercase text-[#39FF14] mb-4">Trousseau de l&apos;Ambassadeur</h2>
          <p className="text-zinc-400 text-sm mb-4">Félicitations ! Votre candidature est bien reçue. 🚀 Voici votre Trousseau de Démarrage (PDF) pour commencer à générer des commissions dès aujourd&apos;hui. Kit PDF et outils de démarchage.</p>
          <div className="flex flex-wrap gap-3">
            <a href="#" className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-[#39FF14] hover:text-black text-white px-5 py-3 rounded-xl font-black uppercase text-xs transition">Télécharger le Kit PDF</a>
            <a href="#" className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-[#39FF14] hover:text-black text-white px-5 py-3 rounded-xl font-black uppercase text-xs transition">Scripts de vente</a>
          </div>
        </section>

        {/* Boutique -30% */}
        <section className="bg-gradient-to-br from-zinc-900 to-black border border-[#39FF14]/40 rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase text-[#39FF14] mb-2">
            <ShoppingBag size={22} /> La Boutique Ambassadeur
          </h2>
          <p className="text-zinc-400 text-sm mb-4">Tu veux Onyx Jaay pour toi ? <span className="text-[#39FF14] font-black">-30% automatique</span> pour les ambassadeurs.</p>
          <a href="/vente" className="inline-flex items-center gap-2 bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-sm hover:scale-105 transition">Accéder à Onyx Jaay -30%</a>
        </section>

        {/* Module Formation */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase text-[#39FF14] mb-4">
            <PlayCircle size={22} /> Module Formation
          </h2>
          <p className="text-zinc-400 text-sm mb-4">Micro-vidéos : &quot;Comment vendre Onyx à un restaurateur&quot; et plus.</p>
          <a href="/formation" className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-[#39FF14] hover:text-black text-white px-5 py-3 rounded-xl font-black uppercase text-xs transition">Accéder aux vidéos</a>
        </section>

        {/* Mes Clients */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="flex items-center gap-2 text-lg font-black uppercase text-[#39FF14] mb-4">
            <Users size={22} /> Mes clients
          </h2>
          {myClients.length === 0 ? (
            <p className="text-zinc-500 text-sm">Aucun abonné recruté pour le moment. Partage ton lien de parrainage !</p>
          ) : (
            <ul className="space-y-3">
              {myClients.map((c) => (
                <li key={c.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl">
                  <span className="font-bold">{c.full_name}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-[#39FF14]/20 text-[#39FF14]">{c.status || "Actif"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}

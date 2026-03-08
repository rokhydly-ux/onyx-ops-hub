"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { Wallet, Trophy, Link2, Copy, Check, ShoppingBag, PlayCircle, Users, LogOut, FileText, Image as ImageIcon } from "lucide-react";

// Mock Supabase client for this page
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function AmbassadeursPage() {
  const [id, setId] = useState("+221762237425");
  const [password, setPassword] = useState("central2026");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Mock data for a logged-in ambassador
  const ambassador = {
    id: "amb_12345",
    name: "Onyx Alpha",
    referralCode: "ONYXALPHA26",
    revenue: {
      generatedTurnover: 785000, // CA généré
      pendingCommissions: 117750, // Commissions en attente
    },
    prospects: [
      { id: 1, name: "Boutique de Mode 'Chic'", status: "En négociation" },
      { id: 2, name: "Restaurant 'Le Délice'", status: "Démo planifiée" },
      { id: 3, name: "Salon de Coiffure 'Élégance'", status: "Converti" },
      { id: 4, name: "Épicerie 'Le Panier Frais'", status: "Contacté" },
    ],
    marketingMaterials: {
      canvaVisuals: "https://www.canva.com/design/DAF-1a2b3c/view",
      productSheets: "https://www.dropbox.com/scl/fi/abcde12345/Onyx-Fiches-Produits.pdf?rlkey=fedcba54321",
    },
  };

  const referralLink = `${typeof window !== "undefined" ? window.location.origin : ""}/?ref=${ambassador.referralCode}`;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    // The setTimeout was likely causing a race condition or an issue with the render update.
    // Removing it to make the state update synchronous with the event handler.
    if (id === "+221762237425" && password === "central2026") {
      setIsLoggedIn(true);
    } else {
      setError("Identifiant ou mot de passe incorrect.");
      setAuthLoading(false); // Only set loading to false on error, as success will unmount the form.
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleLogout = () => {
    setIsLoggedIn(false);
    // Reset credentials for security, even if they are pre-filled for demo
    setId("+221762237425");
    setPassword("central2026");
  };

  // Login Form Component
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-zinc-900 rounded-3xl border border-[#39FF14]/30 shadow-[0_0_80px_rgba(57,255,20,0.15)] p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#39FF14]/20 rounded-2xl flex items-center justify-center text-[#39FF14] mx-auto mb-4 border border-[#39FF14]/50">
              <Trophy size={32} />
            </div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-white">Espace Ambassadeur</h1>
            <p className="text-sm text-zinc-400 mt-1">Connectez-vous pour accéder à votre tableau de bord.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="tel" 
              placeholder="Votre ID Ambassadeur" 
              value={id} 
              onChange={(e) => setId(e.target.value)} 
              required 
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#39FF14] placeholder:text-zinc-500" 
            />
            <input 
              type="password" 
              placeholder="Mot de passe" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="w-full p-4 bg-zinc-800 border border-zinc-700 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-[#39FF14] placeholder:text-zinc-500" 
            />
            {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
            <button 
              type="submit" 
              disabled={authLoading} 
              className="w-full bg-[#39FF14] text-black py-4 rounded-xl font-black uppercase text-sm hover:scale-[1.02] transition-transform duration-200 disabled:opacity-50 disabled:scale-100 shadow-[0_0_30px_rgba(57,255,20,0.3)]"
            >
              {authLoading ? "Connexion en cours..." : "Accéder à mon Hub"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Ambassador Dashboard Component
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="text-xl font-black uppercase tracking-tighter text-[#39FF14]">
          Bienvenue, {ambassador.name}
        </h1>
        <button onClick={handleLogout} className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors">
          <LogOut size={14} /> Déconnexion
        </button>
      </header>

      <main className="max-w-5xl mx-auto p-6 space-y-8">

        {/* Section "Mes Revenus" */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
           <h2 className="flex items-center gap-3 text-lg font-black uppercase text-[#39FF14] mb-4">
            <Wallet size={22} /> Mes Revenus
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-1">CA total généré</p>
              <p className="text-2xl font-bold text-white">{ambassador.revenue.generatedTurnover.toLocaleString()} F CFA</p>
            </div>
            <div className="bg-zinc-800/50 rounded-xl p-4">
              <p className="text-sm text-zinc-400 mb-1">Commissions en attente</p>
              <p className="text-2xl font-bold text-[#39FF14]">{ambassador.revenue.pendingCommissions.toLocaleString()} F CFA</p>
            </div>
          </div>
        </section>

        {/* Section "Lien de Parrainage" */}
        <section className="bg-black border-2 border-[#39FF14] rounded-2xl p-6 shadow-[0_0_50px_rgba(57,255,20,0.25)]">
          <h2 className="flex items-center gap-3 text-lg font-black uppercase text-[#39FF14] mb-4">
            <Link2 size={22} /> Mon Lien de Parrainage Unique
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input 
              readOnly 
              value={referralLink} 
              className="flex-1 p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-sm font-mono text-zinc-300 select-all" 
            />
            <button 
              onClick={handleCopy} 
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-sm hover:scale-105 transition-transform duration-200"
            >
              {copied ? <><Check size={18} /> Copié !</> : <><Copy size={18} /> Copier le lien</>}
            </button>
          </div>
        </section>

        {/* Section "Mes Prospects" */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="flex items-center gap-3 text-lg font-black uppercase text-[#39FF14] mb-4">
            <Users size={22} /> Mes Prospects
          </h2>
          {ambassador.prospects.length === 0 ? (
            <p className="text-zinc-500 text-sm">Aucun prospect pour le moment. Partagez votre lien !</p>
          ) : (
            <div className="space-y-3">
              {ambassador.prospects.map((prospect) => (
                <div key={prospect.id} className="flex items-center justify-between p-3 bg-zinc-800 rounded-xl">
                  <span className="font-bold text-white">{prospect.name}</span>
                  <span 
                     className={`text-[10px] font-black uppercase px-2 py-1 rounded-md 
                      ${prospect.status === "Converti" ? "bg-green-500/20 text-green-400" : 
                       prospect.status === "Démo planifiée" ? "bg-blue-500/20 text-blue-400" :
                       prospect.status === "En négociation" ? "bg-yellow-500/20 text-yellow-400" : "bg-zinc-700 text-zinc-300"}`}
                  >
                    {prospect.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Section "Matériel Marketing" */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="flex items-center gap-3 text-lg font-black uppercase text-[#39FF14] mb-4">
            <ShoppingBag size={22} /> Matériel Marketing
          </h2>
          <p className="text-zinc-400 text-sm mb-4">Ressources pour booster vos ventes et présenter Onyx.</p>
          <div className="flex flex-wrap gap-3">
             <a href={ambassador.marketingMaterials.canvaVisuals} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-[#39FF14] hover:text-black text-white px-5 py-3 rounded-xl font-black uppercase text-xs transition-colors">
              <ImageIcon size={14}/> Visuels (Canva)
            </a>
            <a href={ambassador.marketingMaterials.productSheets} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-zinc-800 hover:bg-[#39FF14] hover:text-black text-white px-5 py-3 rounded-xl font-black uppercase text-xs transition-colors">
              <FileText size={14}/> Fiches Produits (PDF)
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Truck, ArrowLeft, Package } from "lucide-react";

export default function PackTrioLanding() {
  // INITIALISATION DU ROUTEUR
  const router = useRouter();

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      {/* BOUTON RETOUR SIMPLIFIÉ */}
      <button 
        onClick={() => router.push('/')} 
        className="absolute top-6 left-6 flex items-center gap-2 text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <Truck size={64} className="text-[#39FF14] mb-6" />
      
      <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
        Pack <span className="text-[#39FF14]">Trio</span>
      </h1>
      <p className="text-zinc-400 max-w-lg mb-8">
        La solution ultime : Vente + Stock + Logistique intégrée. Suivez vos livreurs et encaissements en temps réel.
      </p>
    </main>
  );
}
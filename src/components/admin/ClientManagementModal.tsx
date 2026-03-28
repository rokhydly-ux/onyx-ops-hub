"use client";

import React, { useState, useMemo } from 'react';
import { X, Zap, ChevronDown, Loader2 } from 'lucide-react';
import { Client } from './SaasAdminTemplate';
import { supabase } from '@/lib/supabaseClient';

interface ClientManagementModalProps {
  client: Client | null;
  currentPlanPrice: number;
  isOpen: boolean;
  onClose: () => void;
}

const PLANS = [
  { name: "Onyx Tekki", price: 22900 },
  { name: "Onyx Tekki Pro", price: 27900 },
  { name: "Onyx CRM", price: 39900 },
  { name: "Onyx Gold", price: 59900 },
];

const calculateProrata = (oldPrice: number, newPrice: number, daysRemaining: number): number => {
  if (daysRemaining <= 0 || daysRemaining > 30) return newPrice - oldPrice;
  const dailyOldPrice = oldPrice / 30;
  const dailyNewPrice = newPrice / 30;
  const remainingCostOld = dailyOldPrice * daysRemaining;
  const remainingCostNew = dailyNewPrice * daysRemaining;
  return Math.round(remainingCostNew - remainingCostOld);
};

export default function ClientManagementModal({ client, currentPlanPrice, isOpen, onClose }: ClientManagementModalProps) {
  const [selectedNewPrice, setSelectedNewPrice] = useState<number>(currentPlanPrice);
  const [isSyncing, setIsSyncing] = useState(false);
  const [daysRemaining] = useState(15); // Donnée mockée, peut être rendue dynamique

  const prorata = useMemo(() => {
    return calculateProrata(currentPlanPrice, selectedNewPrice, daysRemaining);
  }, [currentPlanPrice, selectedNewPrice, daysRemaining]);

  if (!isOpen || !client) return null;

  const newPlan = PLANS.find(p => p.price === selectedNewPrice);

  const handleForceSync = async () => {
    if (!client || !newPlan) return;
    setIsSyncing(true);
    try {
      const { error } = await supabase
        .from('clients')
        .update({ saas: newPlan.name })
        .eq('id', client.id);

      if (error) throw error;
      alert(`Succès ! Le forfait du client a été mis à jour vers ${newPlan.name}.`);
      onClose();
      window.location.reload(); // Recharge la page pour mettre à jour le tableau
    } catch (err: any) {
      alert("Erreur lors de la synchronisation : " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div 
      id="modal-overlay"
      onClick={(e) => { if ((e.target as HTMLElement).id === "modal-overlay") onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
    >
      <div className="bg-[#1a1a1a]/80 backdrop-blur-lg border border-zinc-700 rounded-3xl w-full max-w-2xl text-white shadow-2xl shadow-black/50 animate-in zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">{client.shopName}</h2>
            <p className="text-xs text-zinc-400 font-mono">{client.ownerId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-400 uppercase text-xs tracking-widest">Mise à niveau</h3>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
              <label htmlFor="plan-select" className="text-xs font-medium text-zinc-400">Nouvel Abonnement</label>
              <div className="relative mt-1">
                <select
                  id="plan-select"
                  value={selectedNewPrice}
                  onChange={(e) => setSelectedNewPrice(Number(e.target.value))}
                  className="w-full appearance-none bg-zinc-800 border border-zinc-700 rounded-lg p-3 font-bold text-white outline-none focus:border-[#00FF00] transition"
                >
                  {PLANS.map(plan => (
                    <option key={plan.name} value={plan.price}>{plan.name}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              </div>
            </div>

            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-3 text-sm">
              <div className="flex justify-between items-center"><span className="text-zinc-400">Abonnement actuel:</span><span className="font-mono font-bold">{currentPlanPrice.toLocaleString()} F</span></div>
              <div className="flex justify-between items-center"><span className="text-zinc-400">Nouvel abonnement:</span><span className="font-mono font-bold">{newPlan?.price.toLocaleString()} F</span></div>
              <div className="border-t border-dashed border-zinc-700 my-2"></div>
              <div className="flex justify-between items-center text-base">
                <span className={`font-bold ${prorata > 0 ? 'text-amber-400' : 'text-green-400'}`}>{prorata > 0 ? 'À facturer' : 'Crédit'} (prorata):</span>
                <span className={`font-mono font-black ${prorata > 0 ? 'text-amber-400' : 'text-green-400'}`}>{Math.abs(prorata).toLocaleString()} F</span>
              </div>
               <p className="text-[10px] text-zinc-500 text-center pt-2">Calcul basé sur {daysRemaining} jours restants sur 30.</p>
            </div>
          </div>

          <div className="space-y-4">
             <h3 className="font-bold text-zinc-400 uppercase text-xs tracking-widest">Informations Client</h3>
             <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 space-y-2 text-sm">
                <p><strong className="text-zinc-400 w-28 inline-block">Statut:</strong> <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${client.status === 'Actif' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{client.status}</span></p>
                <p><strong className="text-zinc-400 w-28 inline-block">Création:</strong> <span className="font-mono">{new Date(client.creationDate).toLocaleDateString('fr-FR')}</span></p>
                <p><strong className="text-zinc-400 w-28 inline-block">ID Client:</strong> <span className="font-mono">{client.id}</span></p>
                <p><strong className="text-zinc-400 w-28 inline-block">Lien:</strong> <a href={client.shopUrl} target="_blank" rel="noopener noreferrer" className="text-[#00FF00] hover:underline truncate">{client.shopUrl}</a></p>
             </div>
          </div>
        </div>

        <div className="p-6 border-t border-zinc-800">
          <button onClick={handleForceSync} disabled={isSyncing} className="w-full bg-[#00FF00] text-black py-3 rounded-lg font-black uppercase text-sm flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-[0_0_20px_rgba(0,255,0,0.2)] disabled:opacity-50">
            {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
            {isSyncing ? 'Synchronisation...' : 'Forcer la synchronisation'}
          </button>
        </div>
      </div>
    </div>
  );
}
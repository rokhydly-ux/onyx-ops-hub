"use client";
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function ClientManagementModal({ client, currentPrice, onClose }: any) {
  const [selectedPlan, setSelectedPlan] = useState(client.plan);
  const [newPrice, setNewPrice] = useState(currentPrice);
  const [prorata, setProrata] = useState(0);

  const plans: Record<string, number> = {
    "Onyx Tekki": 22900,
    "Onyx Tekki Pro": 27900,
    "Onyx CRM": 39900,
    "Onyx Gold": 59900,
  };

  useEffect(() => {
    const targetPrice = plans[selectedPlan] || currentPrice;
    setNewPrice(targetPrice);
    
    // Logique Prorata (simulée sur 15 jours restants)
    const daysRemaining = 15;
    const dailyOld = currentPrice / 30;
    const dailyNew = targetPrice / 30;
    const credit = dailyOld * daysRemaining;
    const cost = dailyNew * daysRemaining;
    setProrata(Math.max(0, cost - credit));
  }, [selectedPlan]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111] border border-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Gérer {client.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X /></button>
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-2">Upgrade / Downgrade Plan</label>
          <select 
            className="w-full bg-black border border-gray-700 text-white rounded-lg p-3 focus:outline-none focus:border-green-500"
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
          >
            {Object.keys(plans).map(plan => (
              <option key={plan} value={plan}>{plan} - {plans[plan]} F</option>
            ))}
          </select>
        </div>

        <div className="bg-black p-4 rounded-lg mb-6 border border-gray-800">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Jours restants (cycle) :</span>
            <span className="text-white">15 jours</span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Nouveau Tarif :</span>
            <span className="text-white">{newPrice} F/mois</span>
          </div>
          <div className="flex justify-between font-bold text-green-500 mt-4 pt-4 border-t border-gray-800">
            <span>À facturer aujourd'hui (Prorata) :</span>
            <span>{prorata.toFixed(0)} F</span>
          </div>
        </div>

        <button className="w-full bg-[#00FF00] hover:bg-green-400 text-black font-bold py-3 rounded-lg transition-colors">
          FORCER LA SYNCHRONISATION
        </button>
      </div>
    </div>
  );
}
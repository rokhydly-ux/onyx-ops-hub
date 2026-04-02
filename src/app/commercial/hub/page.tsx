"use client";

import React, { useState } from 'react';
import { UserPlus, Activity, CheckCircle, Clock } from 'lucide-react';

export default function CommercialHub() {
  const [activeTab, setActiveTab] = useState('nouveau');

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* En-tête */}
      <header className="bg-[#0a0a0a] text-white p-6 rounded-b-2xl shadow-md">
        <h1 className="text-2xl font-bold tracking-tight">Portail Commercial</h1>
        <p className="text-gray-400 text-sm mt-1">Bonjour Moussa • Objectif : 12/20</p>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 p-6 pb-24">
        {activeTab === 'nouveau' ? (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Ouvrir un compte</h2>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la Boutique</label>
                  <input type="text" placeholder="Ex: Boutique Fall" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00FF00]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Numéro WhatsApp</label>
                  <input type="tel" placeholder="+221 7X XXX XX XX" className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00FF00]" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pack Choisi (1er Mois Offert)</label>
                  <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#00FF00]">
                    <option>Onyx Jaay (13 900 F)</option>
                    <option>Onyx Stock (13 900 F)</option>
                    <option>Pack Tekki (22 900 F)</option>
                    <option>Pack Tekki Pro (27 900 F)</option>
                    <option>Onyx CRM (39 900 F)</option>
                  </select>
                </div>
                
                {/* Champ caché pour le tracking du commercial */}
                <input type="hidden" name="commercialName" value="Moussa" />

                <button className="w-full mt-4 bg-[#00FF00] hover:bg-green-500 text-black font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95">
                  Activer la Boutique
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Mon Activité</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500">Activés ce mois</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <p className="text-sm text-gray-500">Commissions</p>
                <p className="text-xl font-bold text-[#00FF00]">83 400 F</p>
              </div>
            </div>

            <h3 className="font-semibold text-gray-700 mt-6 mb-3">Dernières ouvertures</h3>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">Resto Dakar</p>
                  <p className="text-xs text-gray-500">Pack Tekki</p>
                </div>
                <span className="flex items-center gap-1 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full font-medium">
                  <Clock size={12} /> Essai en cours
                </span>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-900">Keur Yaay</p>
                  <p className="text-xs text-gray-500">Onyx Jaay</p>
                </div>
                <span className="flex items-center gap-1 bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                  <CheckCircle size={12} /> Payé
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Navigation Bas (Mobile) */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 pb-safe">
        <button 
          onClick={() => setActiveTab('nouveau')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'nouveau' ? 'text-black' : 'text-gray-400'}`}
        >
          <UserPlus size={24} className={activeTab === 'nouveau' ? 'text-[#00FF00]' : ''} />
          <span className="text-xs font-medium">Nouveau Client</span>
        </button>
        <button 
          onClick={() => setActiveTab('activite')}
          className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === 'activite' ? 'text-black' : 'text-gray-400'}`}
        >
          <Activity size={24} className={activeTab === 'activite' ? 'text-[#00FF00]' : ''} />
          <span className="text-xs font-medium">Mon Activité</span>
        </button>
      </nav>
    </div>
  );
}
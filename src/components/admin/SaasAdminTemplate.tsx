"use client";

import React, { useState } from 'react';
import { BarChart2, Users, DollarSign, ExternalLink } from 'lucide-react';
import ClientManagementModal from './ClientManagementModal';

export interface Client {
  id: string;
  shopName: string;
  shopUrl: string;
  ownerId: string;
  creationDate: string;
  status: 'Actif' | 'Suspendu';
}

interface SaasAdminTemplateProps {
  title: string;
  price: number;
  activeClients: Client[];
}

export default function SaasAdminTemplate({ title, price, activeClients }: SaasAdminTemplateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const mrr = activeClients.length * price;

  const handleManageClick = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 bg-[#0d0d0d] min-h-screen text-white font-sans">
      <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">{title}</h1>
      <p className="text-zinc-500 mb-8">Tableau de bord de l'offre <span className="font-bold text-zinc-400">{title}</span>.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/50 shadow-lg">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-zinc-400">Boutiques Déployées</p>
            <BarChart2 className="text-[#00FF00]" size={20} />
          </div>
          <p className="text-4xl font-black mt-2">{activeClients.length}</p>
        </div>
        <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/50 shadow-lg">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-zinc-400">Clients Actifs</p>
            <Users className="text-[#00FF00]" size={20} />
          </div>
          <p className="text-4xl font-black mt-2">{activeClients.length}</p>
        </div>
        <div className="bg-[#111111] p-6 rounded-2xl border border-zinc-800/50 shadow-lg">
          <div className="flex justify-between items-start">
            <p className="text-sm font-semibold text-zinc-400">MRR Estimé</p>
            <DollarSign className="text-[#00FF00]" size={20} />
          </div>
          <p className="text-4xl font-black mt-2">{mrr.toLocaleString()}<span className="text-2xl text-zinc-500"> F</span></p>
        </div>
      </div>

      <div className="bg-[#111111] rounded-2xl border border-zinc-800/50 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/50">
              <tr>
                <th scope="col" className="px-6 py-3">Boutique & Lien</th>
                <th scope="col" className="px-6 py-3">Date de création</th>
                <th scope="col" className="px-6 py-3">ID Propriétaire</th>
                <th scope="col" className="px-6 py-3">Statut</th>
                <th scope="col" className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeClients.map((client) => (
                <tr key={client.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                  <th scope="row" className="px-6 py-4 font-medium text-white whitespace-nowrap"><a href={client.shopUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[#00FF00]">{client.shopName}<ExternalLink size={14} className="opacity-50" /></a></th>
                  <td className="px-6 py-4 text-zinc-400 font-mono">{new Date(client.creationDate).toLocaleDateString('fr-FR')}</td>
                  <td className="px-6 py-4 text-zinc-400 font-mono">{client.ownerId}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${client.status === 'Actif' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{client.status}</span></td>
                  <td className="px-6 py-4 text-right"><button onClick={() => handleManageClick(client)} className="font-medium text-white bg-zinc-700 hover:bg-[#00FF00] hover:text-black px-4 py-2 rounded-lg text-xs transition">Gérer</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ClientManagementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} client={selectedClient} currentPlanPrice={price} />
    </div>
  );
}
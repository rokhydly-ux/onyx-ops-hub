"use client";
import React, { useState } from 'react';
import { Users, CreditCard, Box, Settings, Power, Trash2 } from 'lucide-react';
import ClientManagementModal from './ClientManagementModal';

interface Client {
  id: string;
  name: string;
  url: string;
  date: string;
  status: 'Actif' | 'Suspendu';
  plan: string;
}

interface SaasAdminTemplateProps {
  title: string;
  price: number;
}

export default function SaasAdminTemplate({ title, price }: SaasAdminTemplateProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Mock Data pour la démo
  const mockClients: Client[] = [
    { id: "1", name: "Boutique de Rina", url: "/rina", date: "28/03/2026", status: "Actif", plan: title },
    { id: "2", name: "Resto Dakar", url: "/resto-dk", date: "25/03/2026", status: "Actif", plan: title },
  ];

  const mrr = mockClients.length * price;

  const handleManage = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  return (
    <div className="p-8 bg-[#0a0a0a] min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-8 text-white uppercase tracking-wider">{title} <span className="text-green-500 text-sm ml-2">SUPER-ADMIN</span></h1>
      
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Instances Déployées</p>
            <p className="text-3xl font-bold">{mockClients.length}</p>
          </div>
          <Box className="text-green-500 w-10 h-10" />
        </div>
        <div className="bg-[#111] border border-gray-800 p-6 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Clients Actifs</p>
            <p className="text-3xl font-bold">{mockClients.filter(c => c.status === 'Actif').length}</p>
          </div>
          <Users className="text-blue-500 w-10 h-10" />
        </div>
        <div className="bg-[#111] border border-[#00FF00]/30 p-6 rounded-xl flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-green-500/5 blur-xl"></div>
          <div className="relative z-10">
            <p className="text-gray-400 text-sm">MRR Estimé</p>
            <p className="text-3xl font-bold text-[#00FF00]">{mrr.toLocaleString()} F</p>
          </div>
          <CreditCard className="text-[#00FF00] w-10 h-10 relative z-10" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#111] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Clients {title}</h2>
          <input type="text" placeholder="Rechercher..." className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500" />
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0a0a0a] text-gray-400 text-sm uppercase tracking-wider border-b border-gray-800">
              <th className="p-4 font-medium">Boutique & Lien</th>
              <th className="p-4 font-medium">Création</th>
              <th className="p-4 font-medium">Statut SaaS</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockClients.map((client) => (
              <tr key={client.id} className="border-b border-gray-800 hover:bg-[#1a1a1a] transition-colors cursor-pointer" onClick={() => handleManage(client)}>
                <td className="p-4">
                  <p className="font-semibold">{client.name}</p>
                  <p className="text-sm text-blue-400">{client.url}</p>
                </td>
                <td className="p-4 text-gray-400">{client.date}</td>
                <td className="p-4">
                  <span className="bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-medium">
                    {client.status}
                  </span>
                </td>
                <td className="p-4 flex justify-end gap-3">
                  <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition-colors">
                    <Power size={18} />
                  </button>
                  <button className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedClient && (
        <ClientManagementModal 
          client={selectedClient} 
          currentPrice={price}
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
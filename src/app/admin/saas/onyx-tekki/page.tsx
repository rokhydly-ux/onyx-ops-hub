import SaasAdminTemplate, { Client } from '@/components/admin/SaasAdminTemplate';
import React from 'react';

const MOCK_CLIENTS: Client[] = [
  { id: 'cl_1a2b3c', shopName: 'Boutique de Fanta', shopUrl: 'https://fanta.onyx.app', ownerId: 'user_x7y8z9', creationDate: '2024-01-15T10:00:00Z', status: 'Actif' },
  { id: 'cl_4d5e6f', shopName: 'Dakar Deals', shopUrl: 'https://dakar-deals.onyx.app', ownerId: 'user_a1b2c3', creationDate: '2024-02-20T14:30:00Z', status: 'Actif' },
  { id: 'cl_7g8h9i', shopName: 'Senegal Style', shopUrl: 'https://senegalstyle.com', ownerId: 'user_d4e5f6', creationDate: '2023-11-05T09:00:00Z', status: 'Suspendu' },
  { id: 'cl_j1k2l3', shopName: 'Le Coin du Geek', shopUrl: 'https://coingeek.sn', ownerId: 'user_g7h8i9', creationDate: '2024-03-10T18:00:00Z', status: 'Actif' },
];

export default function OnyxTekkiAdminPage() {
  return (
    <SaasAdminTemplate
      title="Onyx Tekki"
      price={22900}
      activeClients={MOCK_CLIENTS}
    />
  );
}
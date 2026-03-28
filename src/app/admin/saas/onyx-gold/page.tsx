import SaasAdminTemplate, { Client } from '@/components/admin/SaasAdminTemplate';
import React from 'react';

const MOCK_CLIENTS: Client[] = [
  { id: 'cl_gold_1', shopName: 'Gold Standard Inc.', shopUrl: 'https://gold.onyx.app', ownerId: 'user_gold_1', creationDate: '2024-02-10T10:00:00Z', status: 'Actif' },
];

export default function OnyxGoldAdminPage() {
  return (
    <SaasAdminTemplate
      title="Onyx Gold"
      price={59900}
      activeClients={MOCK_CLIENTS}
    />
  );
}
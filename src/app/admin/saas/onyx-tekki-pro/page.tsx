import SaasAdminTemplate, { Client } from '@/components/admin/SaasAdminTemplate';
import React from 'react';

const MOCK_CLIENTS: Client[] = [
  { id: 'cl_pro_1', shopName: 'Pro Business Solutions', shopUrl: 'https://pro-biz.onyx.app', ownerId: 'user_pro_1', creationDate: '2024-03-01T11:00:00Z', status: 'Actif' },
  { id: 'cl_pro_2', shopName: 'Digital Growth SN', shopUrl: 'https://growth.sn', ownerId: 'user_pro_2', creationDate: '2024-01-25T16:00:00Z', status: 'Actif' },
];

export default function OnyxTekkiProAdminPage() {
  return (
    <SaasAdminTemplate
      title="Onyx Tekki Pro"
      price={27900}
      activeClients={MOCK_CLIENTS}
    />
  );
}
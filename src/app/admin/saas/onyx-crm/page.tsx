import SaasAdminTemplate, { Client } from '@/components/admin/SaasAdminTemplate';
import React from 'react';

const MOCK_CLIENTS: Client[] = [
  { id: 'cl_crm_1', shopName: 'CRM Innovate', shopUrl: 'https://crm-innovate.onyx.app', ownerId: 'user_crm_1', creationDate: '2024-02-18T12:00:00Z', status: 'Actif' },
  { id: 'cl_crm_2', shopName: 'Lead Gen Experts', shopUrl: 'https://leadgen.sn', ownerId: 'user_crm_2', creationDate: '2023-12-10T08:00:00Z', status: 'Actif' },
  { id: 'cl_crm_3', shopName: 'Client First Co.', shopUrl: 'https://clientfirst.com', ownerId: 'user_crm_3', creationDate: '2024-03-12T15:00:00Z', status: 'Actif' },
];

export default function OnyxCrmPage() {
  return (
    <SaasAdminTemplate
      title="Onyx CRM"
      price={39900}
      activeClients={MOCK_CLIENTS}
    />
  );
}
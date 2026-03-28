"use client";

import React, { useEffect, useState } from 'react';
import SaasAdminTemplate, { Client } from '@/components/admin/SaasAdminTemplate';
import { supabase } from '@/lib/supabaseClient';

export default function OnyxCrmPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        // Récupération des vrais clients depuis la table Supabase
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('saas', 'Onyx CRM');

        if (error) throw error;

        if (data) {
          // Formatage des données pour correspondre à notre SaasAdminTemplate
          const formattedClients: Client[] = data.map((c: any) => ({
            id: c.id,
            shopName: c.full_name || 'Boutique Inconnue',
            shopUrl: 'https://onyxops.com/login', // Lien par défaut 
            ownerId: c.phone || 'Aucun contact',
            creationDate: c.created_at,
            status: c.status === 'Actif' ? 'Actif' : 'Suspendu',
          }));
          setClients(formattedClients);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des clients:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClients();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center text-[#39FF14] text-xs font-black tracking-widest uppercase">Chargement des données...</div>;
  }

  return (
    <SaasAdminTemplate
      title="Onyx CRM"
      price={39900}
      activeClients={clients}
    />
  );
}
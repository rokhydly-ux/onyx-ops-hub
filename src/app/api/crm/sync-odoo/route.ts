import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: 'Le numéro de téléphone est requis pour la synchronisation Odoo.' }, 
        { status: 400 }
      );
    }

    // 1. On cherche le contact existant dans la base via son numéro de téléphone
    const { data: contact, error: contactError } = await supabase
      .from('crm_contacts')
      .select('id, tenant_id')
      .eq('phone', phone)
      .maybeSingle();

    // Si aucun contact n'est trouvé, on ne peut pas lier la clé étrangère
    if (contactError || !contact) {
      return NextResponse.json({ 
        success: true, 
        orders: [], 
        message: 'Aucun contact trouvé pour ce numéro, impossible de lier les commandes.' 
      });
    }

    // 2. Récupération des commandes depuis Odoo 
    // (Ici on simule la réponse de l'API Odoo pour l'exemple)
    // const odooResponse = await fetch(`https://ton-odoo.com/api/orders?phone=${phone}`);
    // const odooData = await odooResponse.json();
    
    const mockOdooOrders = [
      {
        id: `ORD-ODOO-${Math.floor(Math.random() * 1000)}`,
        contact_id: contact.id, // LE MAPPING CRUCIAL DE LA CLÉ ÉTRANGÈRE EST ICI
        tenant_id: contact.tenant_id,
        date: new Date().toISOString(),
        total: Math.floor(Math.random() * 500000) + 50000,
        status: 'Livré',
        items: 'Équipement Pro (Import Odoo)'
      }
    ];

    // 3. Upsert des commandes dans `crm_orders`
    const { data: insertedOrders, error: insertError } = await supabase
      .from('crm_orders')
      .upsert(mockOdooOrders, { onConflict: 'id' }) // Évite les doublons si on relance la synchro
      .select();

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, orders: insertedOrders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
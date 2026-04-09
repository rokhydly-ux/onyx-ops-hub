import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { phone, email } = await request.json();
    
    // Configuration Odoo depuis les variables d'environnement
    const ODOO_URL = process.env.ODOO_URL || 'https://votre-instance.odoo.com';
    const ODOO_DB = process.env.ODOO_DB || 'db_name';
    const ODOO_USERNAME = process.env.ODOO_USERNAME || 'admin';
    const ODOO_PASSWORD = process.env.ODOO_PASSWORD || 'password';

    // 1. Authentification JSON-RPC Odoo pour récupérer l'UID (User ID)
    const authResponse = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "common",
          method: "login",
          args: [ODOO_DB, ODOO_USERNAME, ODOO_PASSWORD]
        }
      })
    });
    const authData = await authResponse.json();
    const uid = authData.result;
    
    if (!uid) {
      throw new Error("L'authentification à l'API Odoo a échoué.");
    }

    // 2. Recherche des commandes ('sale.order') correspondant au client
    // On utilise le numéro de téléphone pour faire le matching
    const searchResponse = await fetch(`${ODOO_URL}/jsonrpc`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "call",
        params: {
          service: "object",
          method: "execute_kw",
          args: [
            ODOO_DB, uid, ODOO_PASSWORD,
            'sale.order',
            'search_read',
            [[['partner_id.phone', '=', phone]]], // Domaine de recherche Odoo
            { fields: ['name', 'amount_total', 'state', 'date_order'], limit: 5 } // Champs à retourner
          ]
        }
      })
    });
    const searchData = await searchResponse.json();
    return NextResponse.json({ success: true, orders: searchData.result || [] }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
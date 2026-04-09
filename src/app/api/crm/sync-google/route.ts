import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { spreadsheetId, accessToken, startDate, endDate, tenantId } = await request.json();
    
    // Optimisation : On bloque si la date du jour est en dehors de la campagne
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate && new Date(startDate) > today) {
      return NextResponse.json({ message: "Synchronisation annulée : La campagne n'a pas encore commencé." });
    }
    if (endDate && new Date(endDate) < today) {
      return NextResponse.json({ message: "Synchronisation annulée : La campagne est terminée." });
    }

    // Récupération des données depuis l'API Google Sheets (drive.readonly)
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:Z5000`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    if (!response.ok) throw new Error("Erreur de récupération Google Sheets");
    
    const data = await response.json();
    if (!data.values || data.values.length === 0) {
      return NextResponse.json({ error: "Aucune donnée dans le fichier Sheets." }, { status: 400 });
    }

    // Nettoyage et mapping (On suppose que l'entête contient 'Téléphone' ou 'Phone' et 'Nom' ou 'Name')
    const headers: string[] = data.values[0].map((h: string) => h.toLowerCase());
    const rows = data.values.slice(1);

    const phoneIdx = headers.findIndex(h => h.includes('téléphone') || h.includes('phone') || h.includes('numéro'));
    const nameIdx = headers.findIndex(h => h.includes('nom') || h.includes('name'));

    if (phoneIdx === -1) return NextResponse.json({ error: "Colonne Téléphone introuvable." }, { status: 400 });

    const leadsToInsert = rows.filter((r: any[]) => r[phoneIdx]).map((row: any[]) => ({
      user_id: tenantId,
      full_name: nameIdx !== -1 ? row[nameIdx] : 'Client Google Sheets',
      phone: row[phoneIdx].replace(/\s+/g, ''),
      source: 'Google Sheets',
      status: 'Nouveau'
    }));

    // Upsert batch vers Supabase basé sur le numéro
    const { error } = await supabase.from('leads').upsert(leadsToInsert, { onConflict: 'phone' });
    if (error) throw error;

    return NextResponse.json({ success: true, count: leadsToInsert.length, message: "Synchronisation réussie" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
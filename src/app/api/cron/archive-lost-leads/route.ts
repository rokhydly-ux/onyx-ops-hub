import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

// On utilise la clé SERVICE_ROLE pour avoir accès à toutes les données, 
// car cette route est appelée par un robot (sans utilisateur connecté).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  // Sécurité : On vérifie que c'est bien Vercel qui appelle cette route
  const authHeader = request.headers.get('Authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    // 1. Récupérer tous les leads au statut "Perdu"
    const { data: lostLeads, error: fetchError } = await supabase
      .from('crm_leads')
      .select('*')
      .eq('status', 'Perdu');

    if (fetchError) throw fetchError;
    if (!lostLeads || lostLeads.length === 0) {
      return NextResponse.json({ message: 'Aucun lead perdu à archiver ce mois-ci.' });
    }

    // 2. Convertir les données JSON en CSV
    const csv = Papa.unparse(lostLeads);
    const fileName = `leads_perdus_${new Date().toISOString().split('T')[0]}.csv`;

    // 3. Sauvegarder le CSV dans un bucket Supabase nommé "archives"
    const { error: uploadError } = await supabase.storage
      .from('archives') 
      .upload(fileName, csv, { contentType: 'text/csv' });
    if (uploadError) throw uploadError;

    // 4. Supprimer les leads de la table principale pour nettoyer le CRM
    const idsToDelete = lostLeads.map(l => l.id);
    const { error: deleteError } = await supabase.from('crm_leads').delete().in('id', idsToDelete);
    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: `${lostLeads.length} leads archivés avec succès.` });
  } catch (error: any) {
    console.error('Erreur CRON Archivage:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
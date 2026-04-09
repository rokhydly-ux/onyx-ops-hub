import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Jeton défini dans l'app Meta pour les Webhooks
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN || 'onyx_secure_token_2026';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
    // Facebook exige de retourner le challenge en texte brut (status 200)
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Vérification de la signature de l'objet de page Facebook
    if (body.object !== 'page') {
      return new NextResponse('Not a page event', { status: 404 });
    }

    for (const entry of body.entry) {
      for (const change of entry.changes) {
        if (change.field === 'leadgen') {
          const leadData = change.value;
          const campaignId = leadData.campaign_id;
          
          // Normalement on fetch l'API Graph Meta avec leadData.leadgen_id
          // Ici on parse les informations directement issues de la forme structurée
          const phone = leadData.phone || '+221000000000';
          const fullName = leadData.full_name || 'Nouveau Lead FB';

          // Upsert Intelligent : Insert "Nouveau", ou met à jour la source s'il existe (via onConflict)
          const { error } = await supabase.from('leads').upsert(
            {
              phone: phone, // Clé d'upsert principale (si définie dans Supabase comme unique)
              full_name: fullName,
              source: `Facebook Ads (Campagne ${campaignId})`,
              status: 'Nouveau', // kanban_status
            },
            { onConflict: 'phone' } // Assurez-vous que la colonne phone est UNIQUE sur DB Supabase
          );
          if (error) console.error("Erreur Webhook FB :", error.message);
        }
      }
    }
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 });
  }
}
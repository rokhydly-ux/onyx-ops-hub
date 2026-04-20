import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  // 🔒 1. VERROU DE SÉCURITÉ : Vérification du Token dans l'URL
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token');

  if (token !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json(
      { success: false, error: 'Accès refusé : Token invalide ou manquant' }, 
      { status: 401 }
    );
  }

  try {
    // 2. Récupération des données envoyées par Make
    const body = await req.json();
    const { full_name, phone, ad_name, campaign_name, intent, tenant_id, assigned_to } = body;

    // 3. Nettoyage strict du numéro de téléphone
    let cleanedPhone = String(phone || '').replace(/['"\s\u00A0]/g, '').replace(/[^0-9+]/g, '');
    if (cleanedPhone.length === 9 && cleanedPhone.startsWith('7')) {
        cleanedPhone = '+221' + cleanedPhone;
    } else if (cleanedPhone.startsWith('221') && cleanedPhone.length === 12) {
        cleanedPhone = '+' + cleanedPhone;
    }

    // 4. Gestion de l'assignation (Priorité Make > Aléatoire)
    let finalAssignedTo = assigned_to || null; 
    let commercialPhone = null;

    if (!finalAssignedTo) {
        // Fallback : Si Make n'envoie pas de commercial, on tire au sort
        const { data: commercials } = await supabase
          .from('commercials')
          .select('full_name, phone')
          .eq('tenant_id', tenant_id)
          .eq('status', 'Actif');

        if (commercials && commercials.length > 0) {
          const randomCommercial = commercials[Math.floor(Math.random() * commercials.length)];
          finalAssignedTo = randomCommercial.full_name;
          commercialPhone = randomCommercial.phone;
        }
    }

    // 5. Préparation de la carte pour le Kanban OnyxCRM
    const payload = {
      tenant_id,
      full_name: full_name || 'Lead Facebook',
      phone: cleanedPhone,
      ad_name: ad_name || 'Publicité Inconnue',
      campaign_name: campaign_name || 'Campagne FB',
      intent: intent || 'Non spécifié',
      source: 'Facebook Ads',
      lead_score: 'Chaud',
      status: 'Nouveaux Leads',
      assigned_to: finalAssignedTo
    };

    // 6. Insertion dans la base de données (Contourne RLS grâce à la Service Key)
    const { data: newLead, error } = await supabase
      .from('crm_leads')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, lead: newLead });

  } catch (error: any) {
    console.error('Erreur Webhook FB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
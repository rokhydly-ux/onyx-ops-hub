import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // 💡 CORRECTION : On extrait bien "assigned_to" du body envoyé par Make
    const { full_name, phone, ad_name, campaign_name, intent, tenant_id, assigned_to } = body;

    // 1. Nettoyage strict du numéro de téléphone
    let cleanedPhone = String(phone || '').replace(/['"\s\u00A0]/g, '').replace(/[^0-9+]/g, '');
    if (cleanedPhone.length === 9 && cleanedPhone.startsWith('7')) {
        cleanedPhone = '+221' + cleanedPhone;
    } else if (cleanedPhone.startsWith('221') && cleanedPhone.length === 12) {
        cleanedPhone = '+' + cleanedPhone;
    }

    // 💡 CORRECTION : On utilise l'assignation de Make par défaut
    let finalAssignedTo = assigned_to || null; 
    let commercialPhone = null;

    // 2. Si Make n'a envoyé aucun commercial, on fait l'auto-assignation aléatoire
    if (!finalAssignedTo) {
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

    // 3. Préparation des données du Lead
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
      assigned_to: finalAssignedTo // Utilise Maty, Awa, etc. provenant de Make !
    };

    // 4. Insertion dans la base de données
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
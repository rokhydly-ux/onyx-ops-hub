import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ⚠️ ATTENTION : Pour un Webhook, on doit utiliser la clé "Service Role" 
// pour contourner les règles de sécurité (RLS) car l'appel vient de Make.com, pas d'un utilisateur connecté.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; 
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { full_name, phone, ad_name, campaign_name, intent, tenant_id } = body;

    // 1. Nettoyage strict du numéro de téléphone
    let cleanedPhone = String(phone || '').replace(/['"\s\u00A0]/g, '').replace(/[^0-9+]/g, '');
    if (cleanedPhone.length === 9 && cleanedPhone.startsWith('7')) {
        cleanedPhone = '+221' + cleanedPhone;
    } else if (cleanedPhone.startsWith('221') && cleanedPhone.length === 12) {
        cleanedPhone = '+' + cleanedPhone;
    }

    // 2. Recherche d'un commercial disponible pour l'auto-assignation
    const { data: commercials } = await supabase
      .from('commercials')
      .select('full_name, phone')
      .eq('tenant_id', tenant_id)
      .eq('status', 'Actif');

    let assignedTo = null;
    let commercialPhone = null;

    if (commercials && commercials.length > 0) {
      // Assigne aléatoirement à un commercial actif pour lisser la charge
      const randomCommercial = commercials[Math.floor(Math.random() * commercials.length)];
      assignedTo = randomCommercial.full_name;
      commercialPhone = randomCommercial.phone;
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
      lead_score: 'Chaud', // Par défaut, un lead entrant est chaud
      status: 'Nouveaux Leads',
      assigned_to: assignedTo
    };

    // 4. Insertion dans la base de données
    const { data: newLead, error } = await supabase
      .from('crm_leads')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // 5. Envoi de la notification WhatsApp au commercial (Optionnel)
    if (commercialPhone) {
        // Ici, tu pourras appeler ton API WhatsApp (Twilio, UltraMsg, Wati...)
        console.log(`🔔 Notification à envoyer à ${assignedTo} au ${commercialPhone}`);
    }

    return NextResponse.json({ success: true, lead: newLead });

  } catch (error: any) {
    console.error('Erreur Webhook FB:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
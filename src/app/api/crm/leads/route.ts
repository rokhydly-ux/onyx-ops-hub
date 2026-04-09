import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Helper pour récupérer l'utilisateur via l'entête d'autorisation ou la session locale
const getUserFromRequest = async (request: Request) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader ? authHeader.split(' ')[1] : undefined;
  const { data: { user }, error } = await supabase.auth.getUser(token);
  return { user, error };
};

// GET : Récupérer tous les leads pour le Kanban
export async function GET(request: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Multi-Tenancy : on filtre STRICTEMENT par tenant_id
    const { data, error } = await supabase
      .from('crm_leads')
      .select(`
        id,
        amount,
        status,
        category,
        crm_contacts ( full_name, whatsapp_number ),
        users ( full_name, color_badge )
      `)
      .eq('tenant_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Formatage pour correspondre au composant React
    const formattedLeads = data.map((l: any) => ({
      id: l.id,
      amount: l.amount,
      status: l.status,
      category: l.category,
      name: l.crm_contacts?.full_name,
      whatsapp_number: l.crm_contacts?.whatsapp_number,
      assignee: l.users?.full_name,
      avatarColor: l.users?.color_badge
    }));

    return NextResponse.json({ leads: formattedLeads }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur GET Leads:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH : Mettre à jour le statut du lead (Drag & Drop)
export async function PATCH(request: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: "L'id et le statut sont requis." }, { status: 400 });
    }
    
    // Update avec vérification Multi-Tenant
    const { data, error } = await supabase
      .from('crm_leads')
      .update({ status })
      .eq('id', id)
      .eq('tenant_id', user.id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, lead: data }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur PATCH Lead:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST : Création manuelle d'un nouveau lead (Transaction SQL)
export async function POST(request: Request) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { full_name, whatsapp_number, amount, category, assignee_id } = body;
    
    if (!full_name || !whatsapp_number) {
      return NextResponse.json({ error: "Le nom et le numéro WhatsApp sont requis." }, { status: 400 });
    }
    
    // Multi-tenant : on ajoute le tenant_id
    const { data: contact, error: contactError } = await supabase
      .from('crm_contacts')
      .upsert(
        { tenant_id: user.id, full_name, whatsapp_number },
        { onConflict: 'whatsapp_number' }
      )
      .select('id')
      .single();
      
    if (contactError) throw contactError;
    
    const { data: lead, error: leadError } = await supabase
      .from('crm_leads')
      .insert([{
        tenant_id: user.id,
        contact_id: contact.id,
        amount: amount || 0,
        category: category || 'Général',
        assignee_id: assignee_id || null,
        status: 'Nouveau'
      }])
      .select()
      .single();

    if (leadError) throw leadError;

    return NextResponse.json({ success: true, lead }, { status: 201 });
  } catch (error: any) {
    console.error("Erreur POST Lead:", error.message);
    return NextResponse.json({ error: "Erreur lors de la création du lead." }, { status: 500 });
  }
}
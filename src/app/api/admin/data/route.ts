import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Ce client a les privilèges administrateur globaux (Bypass absolu du RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET(request: Request) {
  try {
    // 1. Vérification de l'identité via le token de session du frontend
    const authHeader = request.headers.get('Authorization');
    const token = authHeader ? authHeader.split(' ')[1] : undefined;

    if (!token) {
      return NextResponse.json({ error: "Token d'autorisation manquant." }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Session invalide ou expirée." }, { status: 401 });
    }

    // 2. Vérification stricte du rôle Super Admin
    const isSuperAdmin = user.email === 'rokhydly@gmail.com' || user.user_metadata?.role === 'superadmin';
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Accès refusé. Rôle Super Admin requis." }, { status: 403 });
    }

    // 3. Récupération globale de toutes les tables en contournant le RLS
    const [
      { data: clients },
      { data: leads },
      { data: ambassadors },
      { data: marketing_materials },
      { data: withdrawals },
      { data: commercials },
      { data: hardware_stock },
      { data: admin_settings },
      { data: actions_ia },
      { data: marketing_articles }
    ] = await Promise.all([
      supabaseAdmin.from('clients').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('leads').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('ambassadors').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('marketing_materials').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('withdrawals').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('commercials').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('hardware_stock').select('*').order('name', { ascending: true }),
      supabaseAdmin.from('admin_settings').select('*').eq('id', 1).maybeSingle(),
      supabaseAdmin.from('actions_ia').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('marketing_articles').select('*').order('created_at', { ascending: false })
    ]);

    return NextResponse.json({ success: true, data: { clients, leads, ambassadors, marketing_materials, withdrawals, commercials, hardware_stock, admin_settings, actions_ia, marketing_articles } }, { status: 200 });

  } catch (error: any) {
    console.error("Erreur API Admin Data:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

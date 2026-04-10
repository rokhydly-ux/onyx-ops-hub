import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic'; // IMPORTANT : Désactive le cache statique de Next.js

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    if (!supabaseServiceKey || supabaseServiceKey === '') {
      return NextResponse.json({ error: "LA CLÉ SUPABASE_SERVICE_ROLE_KEY EST MANQUANTE DANS LE FICHIER .env" }, { status: 500 });
    }
    
    // Utilisation de supabaseAdmin pour contourner le RLS et récupérer toutes les données sans exception
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
      supabaseAdmin.from('clients').select('*'),
      supabaseAdmin.from('leads').select('*'),
      supabaseAdmin.from('ambassadors').select('*'),
      supabaseAdmin.from('marketing_materials').select('*'),
      supabaseAdmin.from('withdrawals').select('*'),
      supabaseAdmin.from('commercials').select('*'),
      supabaseAdmin.from('hardware_stock').select('*'),
      supabaseAdmin.from('admin_settings').select('*').single(),
      supabaseAdmin.from('actions_ia').select('*'),
      supabaseAdmin.from('marketing_articles').select('*')
    ]);

    const data = { clients, leads, ambassadors, marketing_materials, withdrawals, commercials, hardware_stock, admin_settings, actions_ia, marketing_articles };

    return NextResponse.json({ data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
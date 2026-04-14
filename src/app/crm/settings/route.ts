import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, phone, objective, objective_period, status, password_temp, tenant_id } = body;

    // Création de l'email fantôme
    const cleanPhone = phone.replace(/\s+/g, '');
    const phantomEmail = `${cleanPhone}@clients.onyxcrm.com`;

    // 1. Création du compte (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: phantomEmail,
      password: password_temp || '0000',
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData?.user?.id;

    // 2. Insertion dans la table commercials
    const { error: insertError } = await supabase.from('commercials').insert([{
      id: userId,
      full_name,
      phone: cleanPhone,
      objective,
      objective_period,
      status,
      password_temp,
      tenant_id
    }]);

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur interne du serveur" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, full_name, phone, objective, status, password_temp, tenant_id } = body;

    const { error } = await supabase.from('commercials').update({
      full_name, phone, objective, status, password_temp
    }).eq('id', id).eq('tenant_id', tenant_id);

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, tenant_id } = await request.json();
    const { error } = await supabase.from('commercials').delete().eq('id', id).eq('tenant_id', tenant_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}
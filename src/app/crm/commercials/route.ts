import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialisation du client Supabase Admin (Bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// POST: Ajouter un nouveau commercial
export async function POST(request: Request) {
  try {
    const { full_name, phone, password_temp, objective, tenant_id } = await request.json();

    if (!full_name || !phone || !password_temp || !tenant_id) {
      return NextResponse.json({ error: 'Champs manquants' }, { status: 400 });
    }

    // Nettoyage et formatage du numéro
    let cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
      cleanPhone = `+221${cleanPhone}`;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`;
    }

    // Création de l'email fantôme pour l'authentification
    const authEmail = `${cleanPhone}@clients.onyxcrm.com`;
    const authPassword = password_temp === "0000" ? "central2026" : (password_temp.length === 4 ? password_temp + "00" : password_temp);

    // 1. Création de l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password: authPassword,
      email_confirm: true,
      user_metadata: { full_name: full_name, role: 'commercial', tenant_id: tenant_id }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
         return NextResponse.json({ error: 'Ce numéro de téléphone est déjà utilisé par un autre utilisateur.' }, { status: 409 });
      }
      throw authError;
    }

    // 2. Insertion dans la table publique 'commercials'
    const { error: dbError } = await supabaseAdmin.from('commercials').insert({
      id: authData.user.id,
      full_name,
      phone: cleanPhone,
      objective,
      tenant_id,
      status: 'Actif'
    });

    if (dbError) {
      // Rollback: Si l'insertion échoue, on supprime le compte Auth créé
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      throw dbError;
    }

    return NextResponse.json({ message: 'Commercial créé avec succès' }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Mettre à jour un commercial existant
export async function PUT(request: Request) {
  try {
    const { id, full_name, phone, password_temp, objective, status, tenant_id } = await request.json();
    
    if (!id || !full_name || !phone || !tenant_id) {
      return NextResponse.json({ error: 'Champs manquants pour la mise à jour' }, { status: 400 });
    }

    const { error: dbError } = await supabaseAdmin.from('commercials').update({ full_name, phone, objective, status }).eq('id', id).eq('tenant_id', tenant_id);
    if (dbError) throw dbError;

    if (password_temp && password_temp !== '••••') {
      const authPassword = password_temp === "0000" ? "central2026" : (password_temp.length === 4 ? password_temp + "00" : password_temp);
      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, { password: authPassword, user_metadata: { full_name: full_name } });
      if (authError) throw authError;
    }
    return NextResponse.json({ message: 'Commercial mis à jour avec succès' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Supprimer un commercial
export async function DELETE(request: Request) {
  try {
    const { id, tenant_id } = await request.json();
    if (!id || !tenant_id) return NextResponse.json({ error: 'ID manquant pour la suppression' }, { status: 400 });

    const { error: dbError } = await supabaseAdmin.from('commercials').delete().eq('id', id).eq('tenant_id', tenant_id);
    if (dbError) throw dbError;

    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);
    if (authError && !authError.message.includes('User not found')) throw authError;

    return NextResponse.json({ message: 'Commercial supprimé avec succès' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
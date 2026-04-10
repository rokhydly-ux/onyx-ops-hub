import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// La clé secrète Service Role permet de bypasser les RLS et de créer des users admin
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: Request) {
  try {
    // Vérification de sécurité des variables d'environnement
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "La clé secrète Supabase Service Role est manquante sur le serveur." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { phone, role, fullName, objective, password, saas } = body;
    const finalPassword = password || '000000'; // Mot de passe fourni par l'admin ou par défaut

    if (!phone || !role || !fullName) {
      return NextResponse.json(
        { error: 'Champs manquants : phone, role, ou fullName.' },
        { status: 400 }
      );
    }

    // 1. Nettoyage et formatage du numéro de téléphone
    let cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone.length === 9 && /^(7[05678]\d{7})$/.test(cleanPhone)) {
      cleanPhone = `+221${cleanPhone}`;
    } else if (!cleanPhone.startsWith('+')) {
      cleanPhone = `+${cleanPhone}`;
    }

    // 2. Création de l'utilisateur dans Supabase Auth
    const authEmail = `${cleanPhone}@https://www.google.com/url?sa=E&source=gmail&q=clients.onyxcrm.com`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password: finalPassword,
      email_confirm: true, // Permet la connexion immédiate sans confirmation
      user_metadata: {
        full_name: fullName,
        role: role,
      },
    });

    if (authError) {
      throw authError;
    }

    const userId = authData.user.id;

    // 3. Création de l'entrée dans la table 'profiles' globale
    const { error: profileError } = await supabaseAdmin.from('profiles').insert([
      {
        id: userId,
        full_name: fullName,
        phone: cleanPhone,
        role: role,
        status: 'Actif',
        password_temp: finalPassword,
      },
    ]);

    if (profileError) {
      throw profileError;
    }

    // 4. (Optionnel) Synchronisation avec vos tables spécifiques
    if (role.toLowerCase() === 'commercial') {
      await supabaseAdmin.from('commercials').upsert([{ id: userId, full_name: fullName, phone: cleanPhone, status: 'Actif', password_temp: finalPassword, objective: objective || 20 }]);
    } else if (role.toLowerCase() === 'ambassadeur' || role.toLowerCase() === 'ambassador') {
      await supabaseAdmin.from('ambassadors').upsert([{ id: userId, full_name: fullName, contact: cleanPhone, phone: cleanPhone, status: 'Actif', password_temp: finalPassword }]);
    } else if (role.toLowerCase() === 'client') {
      const trialEndDate = new Date();
      trialEndDate.setMonth(trialEndDate.getMonth() + 1);
      await supabaseAdmin.from('clients').upsert([{ 
         id: userId, 
         full_name: fullName, 
         phone: cleanPhone, 
         status: 'Compte Créé', 
         password_temp: finalPassword,
         type: 'Client',
         saas: saas || '',
         active_saas: saas ? [saas] : [],
         expiration_date: trialEndDate.toISOString().split('T')[0]
      }], { onConflict: 'phone' });
    }

    return NextResponse.json({ success: true, user: authData.user }, { status: 200 });
  } catch (error: any) {
    console.error('Erreur API create-user:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
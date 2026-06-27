import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: Request) {
    try {
        // Validation basique pour s'assurer que la clé est bien configurée côté serveur
        if (!supabaseServiceKey) {
            return NextResponse.json({ error: 'Configuration serveur invalide' }, { status: 500 });
        }

        const token = req.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Créer un client avec le token de l'utilisateur pour vérifier son authentification
        const authClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
            global: { headers: { Authorization: `Bearer ${token}` } }
        });

        const { data: { user }, error: authError } = await authClient.auth.getUser();

        if (authError || !user) {
             return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        // Note: Pour une véritable application de production, vérifiez également si 'user' a le rôle ADMIN.
        // ex: if (user.user_metadata.role !== 'admin') throw Error...

        const { action, payload, id } = await req.json();

        if (action === 'insert') {
            const { error } = await supabaseAdmin.from('nutrition_fitness_courses').insert(payload);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'update') {
            const { error } = await supabaseAdmin.from('nutrition_fitness_courses').update(payload).eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        if (action === 'delete') {
            const { error } = await supabaseAdmin.from('nutrition_fitness_courses').delete().eq('id', id);
            if (error) throw error;
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

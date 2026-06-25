import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function POST(req: Request) {
    try {
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

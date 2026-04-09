import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// PATCH : Mettre à jour une note d'observation existante
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { note_id, new_note } = body;
    
    if (!note_id || !new_note) {
      return NextResponse.json({ error: "L'ID de la note et le nouveau texte sont requis." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('lead_notes')
      .update({ note: new_note })
      .eq('id', note_id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE : Supprimer une note
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const note_id = searchParams.get('id');
    
    if (!note_id) return NextResponse.json({ error: "L'ID de la note est requis." }, { status: 400 });

    const { error } = await supabase.from('lead_notes').delete().eq('id', note_id);
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
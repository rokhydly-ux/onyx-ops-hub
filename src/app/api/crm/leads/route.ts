import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET : Récupérer tous les leads pour le Kanban
export async function GET() {
  try {
    const sql = `
      SELECT 
        l.id,
        l.amount,
        l.status,
        l.category,
        c.full_name as name,
        c.whatsapp_number,
        u.full_name as assignee,
        u.color_badge as "avatarColor"
      FROM crm_leads l
      JOIN crm_contacts c ON l.contact_id = c.id
      LEFT JOIN users u ON l.assignee_id = u.id
      ORDER BY l.created_at DESC
    `;
    
    const result = await query(sql);
    
    return NextResponse.json({ leads: result.rows }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur GET Leads:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH : Mettre à jour le statut du lead (Drag & Drop)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ error: "L'id et le statut sont requis." }, { status: 400 });
    }
    
    const sql = `UPDATE crm_leads SET status = $1 WHERE id = $2 RETURNING *`;
    const result = await query(sql, [status, id]);
    
    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Lead introuvable." }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, lead: result.rows[0] }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur PATCH Lead:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST : Création manuelle d'un nouveau lead (Transaction SQL)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { full_name, whatsapp_number, amount, category, assignee_id } = body;
    
    if (!full_name || !whatsapp_number) {
      return NextResponse.json({ error: "Le nom et le numéro WhatsApp sont requis." }, { status: 400 });
    }
    
    await query('BEGIN'); // Début de la transaction
    
    const contactSql = `INSERT INTO crm_contacts (full_name, whatsapp_number) VALUES ($1, $2) RETURNING id`;
    const contactResult = await query(contactSql, [full_name, whatsapp_number]);
    const contactId = contactResult.rows[0].id;
    
    const leadSql = `INSERT INTO crm_leads (contact_id, amount, category, assignee_id, status) VALUES ($1, $2, $3, $4, 'Nouveau') RETURNING *`;
    const leadResult = await query(leadSql, [contactId, amount || 0, category || 'Général', assignee_id || null]);
    
    await query('COMMIT'); // Validation de la transaction
    return NextResponse.json({ success: true, lead: leadResult.rows[0] }, { status: 201 });
  } catch (error: any) {
    await query('ROLLBACK'); // Annulation en cas d'erreur
    console.error("Erreur POST Lead:", error.message);
    return NextResponse.json({ error: "Erreur lors de la création du lead." }, { status: 500 });
  }
}
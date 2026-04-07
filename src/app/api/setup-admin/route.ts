import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    const email = 'rokhydly@gmail.com';

    // 1. Vérifier si le Super Admin existe déjà
    const checkUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return NextResponse.json(
        { message: "Le compte Super Admin Rokhy Ly existe déjà." }, 
        { status: 400 }
      );
    }

    // Début de la transaction
    await query('BEGIN');

    // 2. Insérer le Tenant (Espace de travail principal)
    const tenantResult = await query(
      "INSERT INTO tenants (company_name) VALUES ('OnyxOps HQ') RETURNING id"
    );
    const tenantId = tenantResult.rows[0].id;

    // 3. Hashage sécurisé du mot de passe
    const saltRounds = 10;
    const plainPassword = 'OnyxBoss2026!'; // Mot de passe initial
    const passwordHash = await bcrypt.hash(plainPassword, saltRounds);

    // 4. Insérer le Super Admin dans le Tenant
    const insertUserQuery = `
      INSERT INTO users (tenant_id, full_name, email, password_hash, role, color_badge)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await query(insertUserQuery, [tenantId, 'Rokhy Ly', email, passwordHash, 'SUPER_ADMIN', '#FF0000']);

    // Validation de la transaction
    await query('COMMIT');

    return NextResponse.json({ message: "Compte Super Admin Rokhy Ly créé avec succès !" }, { status: 201 });
  } catch (error: any) {
    await query('ROLLBACK');
    console.error("Erreur de Setup Admin :", error.message);
    return NextResponse.json({ error: "Une erreur est survenue lors de l'initialisation du Super Admin." }, { status: 500 });
  }
}
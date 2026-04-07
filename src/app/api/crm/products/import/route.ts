import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import Papa from 'papaparse';

export async function POST(request: Request) {
  try {
    // 1. Récupérer le fichier depuis le FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
    }

    // 2. Lire le contenu du fichier CSV
    const text = await file.text();

    // 3. Parser le CSV avec PapaParse
    const parsed = Papa.parse(text, { 
      header: true, 
      skipEmptyLines: true,
      dynamicTyping: true // Convertit automatiquement les nombres
    });
    
    const rows = parsed.data as any[];
    let processedCount = 0;

    // 4. S'assurer que les tables et la contrainte UNIQUE existent pour l'UPSERT
    await query(`
      CREATE TABLE IF NOT EXISTS crm_product_categories (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      )
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS crm_products (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        odoo_reference TEXT UNIQUE,
        name TEXT NOT NULL,
        category TEXT,
        price_ttc NUMERIC DEFAULT 0,
        stock_quantity INTEGER DEFAULT 0,
        stock_status TEXT DEFAULT 'Normal',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
      )
    `);

    // 5. Début de la transaction SQL
    await query('BEGIN');

    for (const row of rows) {
      const odooRef = row['Référence'] || row['odoo_reference'] || row['id'] || '';
      const name = row['Nom'] || row['name'] || 'Produit Inconnu';
      const categoryName = row['Catégorie'] || row['category'] || 'Général';
      const price = parseFloat(row['Prix TTC'] || row['price_ttc'] || row['price'] || '0');
      const stock = parseInt(row['Stock'] || row['stock_quantity'] || row['stock'] || '0', 10);

      if (!odooRef) continue; // On ignore les lignes sans référence unique

      // A. Gérer l'insertion de la catégorie (ignore si elle existe déjà grâce au ON CONFLICT)
      await query(`INSERT INTO crm_product_categories (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`, [categoryName]);

      // B. UPSERT du Produit
      const stockStatus = stock > 5 ? 'Normal' : stock > 0 ? 'Faible' : 'Dormant';

      await query(`
        INSERT INTO crm_products (odoo_reference, name, category, price_ttc, stock_quantity, stock_status)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (odoo_reference) DO UPDATE 
        SET name = EXCLUDED.name, category = EXCLUDED.category, price_ttc = EXCLUDED.price_ttc, stock_quantity = EXCLUDED.stock_quantity, stock_status = EXCLUDED.stock_status
      `, [odooRef, name, categoryName, price, stock, stockStatus]);

      processedCount++;
    }

    // Validation de la transaction
    await query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: `Import terminé. ${processedCount} produits ajoutés/mis à jour.` 
    }, { status: 200 });

  } catch (error: any) {
    // Annulation en cas de crash
    await query('ROLLBACK');
    console.error("Erreur lors de l'import CSV:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
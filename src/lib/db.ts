import { Pool } from 'pg';

// On vérifie si la variable existe, sinon on affiche une erreur dans les logs Vercel
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL est manquante dans l'environnement !");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // 🛡️ INDISPENSABLE pour Supabase en production
  ssl: {
    rejectUnauthorized: false 
  }
});

export const query = async (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export default pool;
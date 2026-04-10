import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Si les clés sont invisibles, on déclenche une alerte claire dans le terminal
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 ALERTE : Les clés Supabase sont introuvables. Vérifie ton fichier .env.local et redémarre le terminal !");
}

// On force TypeScript à accepter la variable avec "as string"
export const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string);
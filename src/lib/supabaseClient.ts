import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Exportation du client pour pouvoir le réutiliser dans n'importe quel composant
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
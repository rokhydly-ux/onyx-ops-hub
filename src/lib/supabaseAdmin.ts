import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.warn("⚠️ Attention : La clé Service Role n'est pas détectée. Le Super Admin ne fonctionnera pas.");
}

// On n'initialise le client Admin QUE si on a bien trouvé la clé secrète
export const supabaseAdmin = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;
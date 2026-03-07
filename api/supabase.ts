import { createClient } from '@supabase/supabase-js';

// Di Vercel, process.env sudah tersedia secara native, 
// jadi kita tidak wajib memanggil dotenv.config() di sini.
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  // Gunakan throw error agar Vercel Logs mencatat kegagalan ini dengan jelas
  throw new Error("Missing Supabase URL or Key. Check Vercel Environment Variables.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js';

// Catatan: process.env di Vercel sudah tersedia secara native.
const supabaseUrl = process.env.SUPABASE_URL || '';
// Gunakan SERVICE_ROLE_KEY untuk akses admin (bypass RLS) jika diperlukan di backend
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  // Peringatan K3: Sistem tidak akan berjalan tanpa koneksi database yang valid
  throw new Error("Missing Supabase URL or Key. Check Vercel Environment Variables.");
}

/**
 * Inisialisasi Client Supabase.
 * Client ini akan digunakan oleh semua rute di api/routes/ untuk operasi CRUD.
 */
export const supabase = createClient(supabaseUrl, supabaseKey);

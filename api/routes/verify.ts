import express from "express";
// REVISI: Menambahkan ekstensi .js agar modul dapat ditemukan oleh Node.js di Vercel
import { supabase } from "../supabase.js"; 

const router = express.Router();

/**
 * Endpoint untuk memverifikasi keabsahan tanda tangan digital melalui QR Code.
 * Data diambil dari tabel 'log_signatures' berdasarkan hash_code yang unik.
 */
router.get("/:hash", async (req, res) => {
  const { data: sig, error } = await supabase
    .from('log_signatures')
    .select('*, users(jabatan)')
    .eq('hash_code', req.params.hash)
    .single();

  // Jika data tidak ditemukan atau ada error, kembalikan status valid: false
  if (error || !sig) {
    return res.json({ valid: false });
  }

  // Menggabungkan data tanda tangan dengan jabatan user dari relasi tabel 'users'
  const result = {
    ...sig,
    jabatan: (sig as any).users?.jabatan || sig.jabatan
  };

  res.json({ valid: true, data: result });
});

export default router;

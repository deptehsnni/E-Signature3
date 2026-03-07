import express from "express";
import { supabase } from "../supabase"; // REVISI: Jalur diperpendek karena file sejajar di folder api

const router = express.Router();

// Mendapatkan data verifikasi berdasarkan kode hash unik
router.get("/:hash", async (req, res) => {
  const { data: sig, error } = await supabase
    .from('log_signatures')
    .select('*, users(jabatan)')
    .eq('hash_code', req.params.hash)
    .single();

  if (error || !sig) {
    return res.json({ valid: false });
  }

  const result = {
    ...sig,
    jabatan: (sig as any).users?.jabatan || sig.jabatan
  };

  res.json({ valid: true, data: result });
});

export default router;

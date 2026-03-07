import express from "express";
import { supabase } from "../../supabase";

const router = express.Router();

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

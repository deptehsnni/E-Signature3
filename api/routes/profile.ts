import express from "express";
import { supabase } from "../supabase.js"; 
import { hashPassword } from "./utils.js"; // ✅ DIPERBAIKI

const router = express.Router();

router.post("/update", async (req, res) => {
  const { id_karyawan, nama_lengkap, jabatan, qr_logo } = req.body;
  const { error } = await supabase
    .from('users')
    .update({ nama_lengkap, jabatan, qr_logo })
    .eq('id_karyawan', id_karyawan);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

router.post("/change-password", async (req, res) => {
  const { id_karyawan, oldPassword, newPassword } = req.body;
  const oldHash = hashPassword(oldPassword);
  
  const { data: user, error: findError } = await supabase
    .from('users')
    .select('*')
    .eq('id_karyawan', id_karyawan)
    .eq('password_hash', oldHash)
    .single();
  
  if (findError || !user) {
    return res.status(401).json({ error: "Password lama salah" });
  }

  const newHash = hashPassword(newPassword);
  await supabase
    .from('users')
    .update({ password_hash: newHash })
    .eq('id_karyawan', id_karyawan);
  
  res.json({ success: true });
});

export default router;

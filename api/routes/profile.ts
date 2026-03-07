import express from "express";
import { supabase } from "../supabase"; // REVISI: Jalur diperpendek karena file sejajar di folder api
import { hashPassword } from "../../server/utils"; // REVISI: Mengarah ke folder server di luar folder api

const router = express.Router();

// Memperbarui informasi profil pengguna
router.post("/update", async (req, res) => {
  const { id_karyawan, nama_lengkap, jabatan, qr_logo } = req.body;
  const { error } = await supabase
    .from('users')
    .update({ nama_lengkap, jabatan, qr_logo })
    .eq('id_karyawan', id_karyawan);
  
  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true });
});

// Mengubah password pengguna
router.post("/change-password", async (req, res) => {
  const { id_karyawan, oldPassword, newPassword } = req.body;
  
  // Hash password lama untuk verifikasi
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

  // Hash password baru dan simpan ke database
  const newHash = hashPassword(newPassword);
  await supabase
    .from('users')
    .update({ password_hash: newHash })
    .eq('id_karyawan', id_karyawan);
  
  res.json({ success: true });
});

export default router;

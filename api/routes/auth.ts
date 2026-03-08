import express from "express";
// REVISI: Menambahkan ekstensi .js untuk kompatibilitas ES Modules di Vercel
import { supabase } from "../supabase.js"; 
import { hashPassword, SECRET_SALT } from "../utils.js"; 

const router = express.Router();

// Endpoint darurat untuk mereset akun Admin
router.get("/emergency-reset-admin", async (req, res) => {
  const password = "Admin99";
  const hash = hashPassword(password);
  
  const { error } = await supabase
    .from('users')
    .upsert({
      id_karyawan: 'Admin',
      nama_lengkap: 'Administrator',
      jabatan: 'System Admin',
      password_hash: hash,
      status: 'Active'
    }, { onConflict: 'id_karyawan' });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ success: true, message: "Admin account has been reset to ID: Admin, Password: Admin99", salt_used: SECRET_SALT });
});

// Endpoint Login
router.post("/login", async (req, res) => {
  let { id_karyawan, password } = req.body;
  const hash = hashPassword(password);
  
  // Normalisasi ID Admin
  if (id_karyawan.toLowerCase() === 'admin') {
    id_karyawan = 'Admin';
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id_karyawan', id_karyawan)
    .single();
  
  if (error || !user) {
    return res.status(401).json({ error: "ID Karyawan tidak ditemukan" });
  }

  if (user.password_hash !== hash) {
    if (id_karyawan === 'Admin') {
      return res.status(401).json({ 
        error: "Password salah untuk Admin", 
        debug: { 
          expected: user.password_hash, 
          received: hash,
          salt: SECRET_SALT
        } 
      });
    }
    return res.status(401).json({ error: "ID atau Password salah" });
  }
  
  if (user.status !== 'Active' && id_karyawan.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: "Akun Anda masih dalam status Pending. Silakan hubungi Admin." });
  }
  
  res.json(user);
});

// Lupa Password - Meminta reset ke Admin
router.post("/forgot-password", async (req, res) => {
  const { id_karyawan } = req.body;
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id_karyawan', id_karyawan)
    .single();

  if (error || !user) return res.status(404).json({ error: "ID Karyawan tidak ditemukan" });
  
  await supabase
    .from('users')
    .update({ reset_status: 'Requested' })
    .eq('id_karyawan', id_karyawan);

  res.json({ success: true });
});

// Mengecek apakah permintaan reset sudah disetujui
router.get("/check-reset-status/:id", async (req, res) => {
  const { data: user, error } = await supabase
    .from('users')
    .select('reset_status')
    .eq('id_karyawan', req.params.id)
    .single();

  if (error || !user) return res.status(404).json({ error: "User not found" });
  res.json({ reset_status: user.reset_status });
});

// Eksekusi reset password setelah disetujui Admin
router.post("/reset-password", async (req, res) => {
  const { id_karyawan, new_password } = req.body;
  const { data: user, error } = await supabase
    .from('users')
    .select('reset_status')
    .eq('id_karyawan', id_karyawan)
    .single();
  
  if (error || !user || user.reset_status !== 'Approved') {
    return res.status(403).json({ error: "Permintaan reset belum disetujui oleh Admin" });
  }
  
  const hash = hashPassword(new_password);
  await supabase
    .from('users')
    .update({ password_hash: hash, reset_status: 'None' })
    .eq('id_karyawan', id_karyawan);
  
  res.json({ success: true });
});

// Pendaftaran User Baru (Status awal: Pending)
router.post("/register", async (req, res) => {
  const { id_karyawan, nama_lengkap, jabatan, password } = req.body;
  const hash = hashPassword(password);
  
  const { error } = await supabase
    .from('users')
    .insert([{ id_karyawan, nama_lengkap, jabatan, password_hash: hash, status: 'Pending' }]);

  if (error) {
    return res.status(400).json({ error: "ID Karyawan sudah terdaftar" });
  }
  res.json({ success: true });
});

export default router;

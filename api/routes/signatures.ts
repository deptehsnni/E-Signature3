import express from "express";
import { supabase } from "../supabase.js"; 
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import axios from "axios";
import { hashPassword, SECRET_SALT } from "./utils.js"; // ✅ DIPERBAIKI

const router = express.Router();

router.post("/create", async (req, res) => {
  const { id_karyawan, password, jenis_dokumen, nomor_dokumen } = req.body;
  const passHash = hashPassword(password);
  
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id_karyawan', id_karyawan)
    .eq('password_hash', passHash)
    .single();
  
  if (error || !user) {
    return res.status(401).json({ error: "Konfirmasi password gagal" });
  }

  const waktu_ttd = new Date().toISOString();
  const signature_id = uuidv4();
  
  const rawData = `${id_karyawan}${user.nama_lengkap}${jenis_dokumen}${nomor_dokumen}${waktu_ttd}${SECRET_SALT}`;
  const hash_code = crypto.createHash('sha256').update(rawData).digest('hex');
  
  const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  const verificationUrl = `${appUrl}/?verify=${hash_code}`;
  const qr_link = `https://quickchart.io/qr?text=${encodeURIComponent(verificationUrl)}&ecLevel=M&size=300`;

  await supabase
    .from('log_signatures')
    .insert([{
      signature_id,
      id_karyawan,
      nama_karyawan: user.nama_lengkap,
      jenis_dokumen,
      nomor_dokumen,
      waktu_ttd,
      hash_code,
      qr_link
    }]);

  res.json({ success: true, signature_id, hash_code, qr_link });
});

router.get("/user/:id", async (req, res) => {
  const { data: sigs, error } = await supabase
    .from('log_signatures')
    .select('*')
    .eq('id_karyawan', req.params.id)
    .order('waktu_ttd', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(sigs);
});

router.delete("/:id", async (req, res) => {
  const { id_karyawan } = req.body;
  const { data: sig, error: findError } = await supabase
    .from('log_signatures')
    .select('*')
    .eq('signature_id', req.params.id)
    .single();
  
  if (findError || !sig) {
    return res.status(404).json({ error: "Data tidak ditemukan" });
  }
  
  if (sig.id_karyawan !== id_karyawan && id_karyawan.toLowerCase() !== 'admin') {
    return res.status(403).json({ error: "Anda tidak memiliki akses" });
  }

  await supabase
    .from('log_signatures')
    .delete()
    .eq('signature_id', req.params.id);

  res.json({ success: true });
});

export default router;

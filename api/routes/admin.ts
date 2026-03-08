import express from "express";
// REVISI: Menambahkan ekstensi .js untuk kompatibilitas ES Modules di Vercel
import { supabase } from "../supabase.js"; 
import path from "path";
import fs from "fs";
import archiver from "archiver";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Mendapatkan semua log tanda tangan dari database
router.get("/all-signatures", async (req, res) => {
  const { data: sigs, error } = await supabase
    .from('log_signatures')
    .select('*')
    .order('waktu_ttd', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(sigs);
});

// Mendapatkan daftar user yang menunggu persetujuan Admin (Status: Pending)
router.get("/pending-users", async (req, res) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('status', 'Pending');

  if (error) return res.status(500).json({ error: error.message });
  res.json(users);
});

// Mendapatkan daftar permintaan reset password dari karyawan
router.get("/reset-requests", async (req, res) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('reset_status', 'Requested');

  if (error) return res.status(500).json({ error: error.message });
  res.json(users);
});

// Prosedur menyetujui pendaftaran user baru agar bisa login
router.post("/approve-user", async (req, res) => {
  const { id_karyawan } = req.body;
  await supabase
    .from('users')
    .update({ status: 'Active' })
    .eq('id_karyawan', id_karyawan);
  res.json({ success: true });
});

// Prosedur menyetujui permintaan reset password karyawan
router.post("/approve-reset", async (req, res) => {
  const { id_karyawan } = req.body;
  await supabase
    .from('users')
    .update({ reset_status: 'Approved' })
    .eq('id_karyawan', id_karyawan);
  res.json({ success: true });
});

// Fitur Bulk Generate QR Code untuk dokumen K3 massal
router.post("/bulk-generate", async (req, res) => {
  const { id_karyawan, nama_dokumen, start_num, end_num, static_part } = req.body;
  const start = parseInt(start_num);
  const end = parseInt(end_num);
  
  // Menggunakan folder /tmp karena Vercel hanya mengizinkan penulisan file di folder tersebut
  const tempDir = path.join('/tmp', 'qr_' + uuidv4());
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

  try {
    const zipPath = path.join(tempDir, 'qr_codes.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    archive.pipe(output);

    for (let i = start; i <= end; i++) {
      const docNum = static_part ? `${static_part}${i}` : `${i}`;
      const signatureId = uuidv4();
      const hashCode = uuidv4().replace(/-/g, '');
      const qrLink = `https://${req.get('host')}/verify/${hashCode}`;

      // Simpan metadata ke log_signatures
      await supabase.from('log_signatures').insert([{
        signature_id: signatureId,
        id_karyawan,
        nama_karyawan: 'Administrator (Bulk)',
        jenis_dokumen: nama_dokumen,
        nomor_dokumen: docNum,
        hash_code: hashCode,
        qr_link: qrLink
      }]);

      // Mengambil QR code dari API eksternal
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrLink)}`;
      const response = await axios.get(qrApiUrl, { responseType: 'arraybuffer' });
      archive.append(Buffer.from(response.data), { name: `QR_${docNum}.png` });
    }

    await archive.finalize();

    output.on('close', () => {
      res.download(zipPath, 'Bulk_QR.zip', () => {
        try {
          // Cleanup folder temp setelah download selesai
          fs.rmSync(tempDir, { recursive: true, force: true });
        } catch (e) {
          console.error("Gagal menghapus folder temp:", e);
        }
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal generate bulk QR" });
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
});

export default router;

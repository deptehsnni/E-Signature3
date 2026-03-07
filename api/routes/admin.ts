import express from "express";
import { supabase } from "../supabase"; // REVISI: Jalur diperpendek karena folder sejajar
import path from "path";
import fs from "fs";
import archiver from "archiver";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// Mendapatkan semua log tanda tangan
router.get("/all-signatures", async (req, res) => {
  const { data: sigs, error } = await supabase
    .from('log_signatures')
    .select('*')
    .order('waktu_ttd', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(sigs);
});

// Mendapatkan daftar user yang menunggu persetujuan (Pending)
router.get("/pending-users", async (req, res) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('status', 'Pending');

  if (error) return res.status(500).json({ error: error.message });
  res.json(users);
});

// Mendapatkan daftar permintaan reset password
router.get("/reset-requests", async (req, res) => {
  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .eq('reset_status', 'Requested');

  if (error) return res.status(500).json({ error: error.message });
  res.json(users);
});

// Menyetujui pendaftaran user baru
router.post("/approve-user", async (req, res) => {
  const { id_karyawan } = req.body;
  await supabase
    .from('users')
    .update({ status: 'Active' })
    .eq('id_karyawan', id_karyawan);
  res.json({ success: true });
});

// Menyetujui permintaan reset password
router.post("/approve-reset", async (req, res) => {
  const { id_karyawan } = req.body;
  await supabase
    .from('users')
    .update({ reset_status: 'Approved' })
    .eq('id_karyawan', id_karyawan);
  res.json({ success: true });
});

// Membuat QR Code secara masal (Bulk Generate)
router.post("/bulk-generate", async (req, res) => {
  const { id_karyawan, nama_dokumen, start_num, end_num, static_part } = req.body;
  const start = parseInt(start_num);
  const end = parseInt(end_num);
  
  // Menggunakan folder temp yang aman untuk lingkungan serverless
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

      await supabase.from('log_signatures').insert([{
        signature_id: signatureId,
        id_karyawan,
        nama_karyawan: 'Administrator (Bulk)',
        jenis_dokumen: nama_dokumen,
        nomor_dokumen: docNum,
        hash_code: hashCode,
        qr_link: qrLink
      }]);

      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrLink)}`;
      const response = await axios.get(qrApiUrl, { responseType: 'arraybuffer' });
      archive.append(Buffer.from(response.data), { name: `QR_${docNum}.png` });
    }

    await archive.finalize();

    output.on('close', () => {
      res.download(zipPath, 'Bulk_QR.zip', () => {
        try {
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

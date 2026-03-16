import { Router } from 'express';
import { supabase } from '../supabase.js';
import { nanoid } from 'nanoid';

const router = Router();

// ============================================
// GENERATE ID BATCH
// ============================================
const generateBatchId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const random = nanoid(6).toUpperCase();
  return `SEAL-${year}${month}-${random}`;
};

// ============================================
// CREATE BATCH SEAL
// POST /api/seal/create-batch
// ============================================
router.post('/create-batch', async (req, res) => {
  try {
    const { nama_batch, jenis_dokumen, nama_org, kolom_custom, dibuat_oleh, documents } = req.body;

    if (!nama_batch || !jenis_dokumen || !nama_org || !kolom_custom || !dibuat_oleh || !documents) {
      return res.status(400).json({ error: 'Semua field wajib diisi' });
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'Minimal 1 dokumen harus dimasukkan' });
    }

    // Validasi setiap dokumen punya nomor_dokumen
    for (const doc of documents) {
      if (!doc.nomor_dokumen || String(doc.nomor_dokumen).trim() === '') {
        return res.status(400).json({ error: 'Setiap dokumen harus memiliki nomor_dokumen' });
      }
    }

    const id_batch = generateBatchId();
    const qr_link = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(`${process.env.BASE_URL || 'https://e-signature3.vercel.app'}/?seal=${id_batch}`)}`;

    // Simpan batch
    const { error: batchError } = await supabase
      .from('seal_batches')
      .insert({
        id_batch,
        nama_batch,
        jenis_dokumen,
        nama_org,
        kolom_custom,
        dibuat_oleh,
        qr_link
      });

    if (batchError) throw batchError;

    // Simpan semua dokumen
    const docsToInsert = documents.map((doc: any) => ({
      id_dokumen: `DOC-${id_batch}-${nanoid(8).toUpperCase()}`,
      id_batch,
      nomor_dokumen: String(doc.nomor_dokumen).trim().toUpperCase(),
      data_json: doc
    }));

    const { error: docsError } = await supabase
      .from('seal_documents')
      .insert(docsToInsert);

    if (docsError) throw docsError;

    res.json({ 
      success: true, 
      id_batch, 
      qr_link,
      total_dokumen: docsToInsert.length
    });

  } catch (error: any) {
    console.error('Create batch error:', error);
    res.status(500).json({ error: error.message || 'Gagal membuat batch seal' });
  }
});

// ============================================
// GET ALL BATCHES (Admin)
// GET /api/seal/batches
// ============================================
router.get('/batches', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('seal_batches')
      .select('*')
      .order('dibuat_pada', { ascending: false });

    if (error) throw error;

    // Hitung jumlah dokumen per batch
    const batchesWithCount = await Promise.all(
      (data || []).map(async (batch) => {
        const { count } = await supabase
          .from('seal_documents')
          .select('*', { count: 'exact', head: true })
          .eq('id_batch', batch.id_batch);
        
        return { ...batch, total_dokumen: count || 0 };
      })
    );

    res.json(batchesWithCount);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal mengambil data batch' });
  }
});

// ============================================
// GET BATCH DETAIL + DOCUMENTS
// GET /api/seal/batch/:id_batch
// ============================================
router.get('/batch/:id_batch', async (req, res) => {
  try {
    const { id_batch } = req.params;

    const { data: batch, error: batchError } = await supabase
      .from('seal_batches')
      .select('*')
      .eq('id_batch', id_batch)
      .single();

    if (batchError || !batch) {
      return res.status(404).json({ error: 'Batch tidak ditemukan' });
    }

    const { data: documents, error: docsError } = await supabase
      .from('seal_documents')
      .select('*')
      .eq('id_batch', id_batch)
      .order('nomor_dokumen', { ascending: true });

    if (docsError) throw docsError;

    res.json({ ...batch, documents: documents || [] });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal mengambil detail batch' });
  }
});

// ============================================
// VERIFY SEAL DOCUMENT (Publik)
// POST /api/seal/verify
// ============================================
router.post('/verify', async (req, res) => {
  try {
    const { id_batch, nomor_dokumen } = req.body;

    if (!id_batch || !nomor_dokumen) {
      return res.status(400).json({ error: 'id_batch dan nomor_dokumen wajib diisi' });
    }

    // Cek batch ada
    const { data: batch, error: batchError } = await supabase
      .from('seal_batches')
      .select('*')
      .eq('id_batch', id_batch)
      .single();

    if (batchError || !batch) {
      return res.status(404).json({ valid: false, error: 'Batch seal tidak ditemukan' });
    }

    // Cari dokumen (case-insensitive)
    const { data: doc, error: docError } = await supabase
      .from('seal_documents')
      .select('*')
      .eq('id_batch', id_batch)
      .ilike('nomor_dokumen', nomor_dokumen.trim())
      .single();

    if (docError || !doc) {
      return res.json({ valid: false });
    }

    res.json({
      valid: true,
      batch: {
        id_batch: batch.id_batch,
        nama_batch: batch.nama_batch,
        jenis_dokumen: batch.jenis_dokumen,
        nama_org: batch.nama_org,
        kolom_custom: batch.kolom_custom,
        dibuat_pada: batch.dibuat_pada
      },
      document: {
        nomor_dokumen: doc.nomor_dokumen,
        data: doc.data_json
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal memverifikasi dokumen' });
  }
});

// ============================================
// DELETE BATCH
// DELETE /api/seal/batch/:id_batch
// ============================================
router.delete('/batch/:id_batch', async (req, res) => {
  try {
    const { id_batch } = req.params;
    const { id_karyawan } = req.body;

    if (!id_karyawan || id_karyawan.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Hanya admin yang dapat menghapus batch' });
    }

    // Hapus dokumen dulu (cascade harusnya otomatis, tapi eksplisit lebih aman)
    await supabase.from('seal_documents').delete().eq('id_batch', id_batch);

    const { error } = await supabase
      .from('seal_batches')
      .delete()
      .eq('id_batch', id_batch);

    if (error) throw error;

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal menghapus batch' });
  }
});

// ============================================
// ADD DOCUMENTS TO EXISTING BATCH
// POST /api/seal/batch/:id_batch/add-documents
// ============================================
router.post('/batch/:id_batch/add-documents', async (req, res) => {
  try {
    const { id_batch } = req.params;
    const { documents, id_karyawan } = req.body;

    if (!id_karyawan || id_karyawan.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Hanya admin yang dapat menambah dokumen' });
    }

    if (!Array.isArray(documents) || documents.length === 0) {
      return res.status(400).json({ error: 'Minimal 1 dokumen harus dimasukkan' });
    }

    // Cek batch ada
    const { data: batch } = await supabase
      .from('seal_batches')
      .select('id_batch')
      .eq('id_batch', id_batch)
      .single();

    if (!batch) {
      return res.status(404).json({ error: 'Batch tidak ditemukan' });
    }

    const docsToInsert = documents.map((doc: any) => ({
      id_dokumen: `DOC-${id_batch}-${nanoid(8).toUpperCase()}`,
      id_batch,
      nomor_dokumen: String(doc.nomor_dokumen).trim().toUpperCase(),
      data_json: doc
    }));

    const { error } = await supabase
      .from('seal_documents')
      .insert(docsToInsert);

    if (error) throw error;

    res.json({ success: true, added: docsToInsert.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Gagal menambah dokumen' });
  }
});

export default router;

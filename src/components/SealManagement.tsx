import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Plus, Trash2, Download, Eye, Upload, X,
  FileText, ChevronRight, QrCode, Building2, Calendar,
  Search, AlertTriangle, CheckCircle2, Loader2, ArrowLeft,
  Table, PlusCircle, Hash, FilePlus
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { cn, formatDate } from '../lib/utils';

interface SealBatch {
  id_batch: string;
  nama_batch: string;
  jenis_dokumen: string;
  nama_org: string;
  kolom_custom: string[];
  dibuat_pada: string;
  qr_link: string;
  total_dokumen: number;
}

interface SealDocument {
  id_dokumen: string;
  nomor_dokumen: string;
  data_json: Record<string, any>;
}

interface SealManagementProps {
  idKaryawan: string;
  onBack: () => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  onDownloadQR: (url: string, filename: string) => void;
}

export const SealManagement = ({ idKaryawan, onBack, showToast, onDownloadQR }: SealManagementProps) => {
  const [page, setPage] = useState<'list' | 'create' | 'detail' | 'add-data'>('list');
  const [batches, setBatches] = useState<SealBatch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<SealBatch & { documents: SealDocument[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state (create batch)
  const [formNamaBatch, setFormNamaBatch] = useState('');
  const [formJenisDokumen, setFormJenisDokumen] = useState('');
  const [formNamaOrg, setFormNamaOrg] = useState('PT. NNI System');
  const [kolomCustom, setKolomCustom] = useState<string[]>(['Nama Pemegang', 'Kompetensi', 'Tanggal']);
  const [kolomBaru, setKolomBaru] = useState('');
  const [dokumenRows, setDokumenRows] = useState<Record<string, string>[]>([{}]);

  // ✅ BARU: State untuk Add Data
  const [addMode, setAddMode] = useState<'manual' | 'upload'>('manual');
  const [addRows, setAddRows] = useState<Record<string, string>[]>([{}]);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // ============================================
  // FETCH BATCHES
  // ============================================
  const fetchBatches = async () => {
    setLoadingList(true);
    try {
      const res = await fetch('/api/seal/batches');
      const data = await res.json();
      setBatches(data);
    } catch (e) {
      showToast('Gagal mengambil data seal', 'error');
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => { fetchBatches(); }, []);

  // ============================================
  // FETCH BATCH DETAIL
  // ============================================
  const fetchBatchDetail = async (id_batch: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/seal/batch/${id_batch}`);
      const data = await res.json();
      setSelectedBatch(data);
      setPage('detail');
    } catch (e) {
      showToast('Gagal mengambil detail batch', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // KOLOM CUSTOM MANAGEMENT
  // ============================================
  const tambahKolom = () => {
    if (!kolomBaru.trim()) return;
    if (kolomCustom.includes(kolomBaru.trim())) {
      showToast('Kolom sudah ada', 'error');
      return;
    }
    setKolomCustom([...kolomCustom, kolomBaru.trim()]);
    setKolomBaru('');
  };

  const hapusKolom = (kolom: string) => {
    setKolomCustom(kolomCustom.filter(k => k !== kolom));
    setDokumenRows(dokumenRows.map(row => {
      const newRow = { ...row };
      delete newRow[kolom];
      return newRow;
    }));
  };

  // ============================================
  // DOKUMEN ROWS MANAGEMENT (Create)
  // ============================================
  const tambahBaris = () => setDokumenRows([...dokumenRows, {}]);
  const hapusBaris = (index: number) => setDokumenRows(dokumenRows.filter((_, i) => i !== index));
  const updateBaris = (index: number, kolom: string, value: string) => {
    const updated = [...dokumenRows];
    updated[index] = { ...updated[index], [kolom]: value };
    setDokumenRows(updated);
  };

  // ============================================
  // ADD DATA ROWS MANAGEMENT
  // ============================================
  const tambahAddBaris = () => setAddRows([...addRows, {}]);
  const hapusAddBaris = (index: number) => setAddRows(addRows.filter((_, i) => i !== index));
  const updateAddBaris = (index: number, kolom: string, value: string) => {
    const updated = [...addRows];
    updated[index] = { ...updated[index], [kolom]: value };
    setAddRows(updated);
  };

  // ============================================
  // UPLOAD EXCEL (Create Batch)
  // ============================================
  const handleUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (jsonData.length === 0) { showToast('File Excel kosong', 'error'); return; }
        const headers = Object.keys(jsonData[0]).filter(h => h !== 'nomor_dokumen');
        if (!Object.keys(jsonData[0]).includes('nomor_dokumen')) {
          showToast('Kolom "nomor_dokumen" wajib ada di Excel', 'error'); return;
        }
        setKolomCustom(headers);
        const rows = jsonData.map(row => {
          const newRow: Record<string, string> = { nomor_dokumen: String(row.nomor_dokumen) };
          headers.forEach(h => { newRow[h] = String(row[h] || ''); });
          return newRow;
        });
        setDokumenRows(rows);
        showToast(`${rows.length} baris berhasil diimport dari Excel`, 'success');
      } catch (err) {
        showToast('Gagal membaca file Excel', 'error');
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // ============================================
  // ✅ BARU: UPLOAD EXCEL (Add Data)
  // ============================================
  const handleUploadAddExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBatch) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const wb = XLSX.read(event.target?.result, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (jsonData.length === 0) { showToast('File Excel kosong', 'error'); return; }
        if (!Object.keys(jsonData[0]).includes('nomor_dokumen')) {
          showToast('Kolom "nomor_dokumen" wajib ada di Excel', 'error'); return;
        }
        const rows = jsonData.map(row => {
          const newRow: Record<string, string> = { nomor_dokumen: String(row.nomor_dokumen) };
          selectedBatch.kolom_custom.forEach(k => { newRow[k] = String(row[k] || ''); });
          return newRow;
        });
        setAddRows(rows);
        showToast(`${rows.length} baris berhasil diimport dari Excel`, 'success');
      } catch (err) {
        showToast('Gagal membaca file Excel', 'error');
      } finally {
        if (addFileInputRef.current) addFileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  // ============================================
  // DOWNLOAD TEMPLATE EXCEL
  // ============================================
  const downloadTemplate = () => {
    const headers = ['nomor_dokumen', ...kolomCustom];
    const ws = XLSX.utils.aoa_to_sheet([
      headers,
      headers.map((h, i) => i === 0 ? 'SERT-001' : `Contoh ${h}`)
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `Template_Seal_${formNamaBatch || 'Batch'}.xlsx`);
  };

  // ✅ BARU: Download template untuk Add Data
  const downloadAddTemplate = () => {
    if (!selectedBatch) return;
    const headers = ['nomor_dokumen', ...selectedBatch.kolom_custom];
    const ws = XLSX.utils.aoa_to_sheet([
      headers,
      headers.map((h, i) => i === 0 ? 'SERT-006' : `Contoh ${h}`)
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, `Template_TambahData_${selectedBatch.nama_batch.replace(/\s+/g, '_')}.xlsx`);
  };

  // ============================================
  // CREATE BATCH
  // ============================================
  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNamaBatch || !formJenisDokumen || !formNamaOrg) {
      showToast('Nama batch, jenis dokumen, dan nama organisasi wajib diisi', 'error'); return;
    }
    if (kolomCustom.length === 0) {
      showToast('Minimal 1 kolom custom harus ditambahkan', 'error'); return;
    }
    const validRows = dokumenRows.filter(row => row.nomor_dokumen?.trim());
    if (validRows.length === 0) {
      showToast('Minimal 1 dokumen harus dimasukkan', 'error'); return;
    }
    setLoading(true);
    try {
      const documents = validRows.map(row => ({
        nomor_dokumen: row.nomor_dokumen,
        ...kolomCustom.reduce((acc, kolom) => ({ ...acc, [kolom]: row[kolom] || '' }), {})
      }));
      const res = await fetch('/api/seal/create-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama_batch: formNamaBatch,
          jenis_dokumen: formJenisDokumen,
          nama_org: formNamaOrg,
          kolom_custom: kolomCustom,
          dibuat_oleh: idKaryawan,
          documents
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Batch "${formNamaBatch}" berhasil dibuat dengan ${validRows.length} dokumen!`, 'success');
        resetForm();
        fetchBatches();
        setPage('list');
      } else {
        showToast(data.error || 'Gagal membuat batch', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormNamaBatch('');
    setFormJenisDokumen('');
    setFormNamaOrg('PT. NNI System');
    setKolomCustom(['Nama Pemegang', 'Kompetensi', 'Tanggal']);
    setKolomBaru('');
    setDokumenRows([{}]);
  };

  // ============================================
  // ✅ BARU: SUBMIT ADD DATA
  // ============================================
  const handleAddData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatch) return;

    const validRows = addRows.filter(row => row.nomor_dokumen?.trim());
    if (validRows.length === 0) {
      showToast('Minimal 1 dokumen harus dimasukkan', 'error');
      return;
    }

    setLoading(true);
    try {
      const documents = validRows.map(row => ({
        nomor_dokumen: row.nomor_dokumen,
        ...selectedBatch.kolom_custom.reduce((acc, kolom) => ({
          ...acc,
          [kolom]: row[kolom] || ''
        }), {})
      }));

      const res = await fetch(`/api/seal/batch/${selectedBatch.id_batch}/add-documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_karyawan: idKaryawan,
          documents
        })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`${validRows.length} dokumen berhasil ditambahkan!`, 'success');
        setAddRows([{}]);
        setAddMode('manual');
        // Refresh detail batch
        await fetchBatchDetail(selectedBatch.id_batch);
        fetchBatches();
      } else {
        showToast(data.error || 'Gagal menambahkan dokumen', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan koneksi', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // DELETE BATCH
  // ============================================
  const handleDeleteBatch = async (id_batch: string, nama_batch: string) => {
    if (!confirm(`Hapus batch "${nama_batch}"? Semua dokumen di dalamnya akan ikut terhapus.`)) return;
    try {
      const res = await fetch(`/api/seal/batch/${id_batch}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_karyawan: idKaryawan })
      });
      if (res.ok) {
        showToast('Batch berhasil dihapus', 'success');
        fetchBatches();
        if (page === 'detail' || page === 'add-data') setPage('list');
      } else {
        showToast('Gagal menghapus batch', 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan koneksi', 'error');
    }
  };

  const filteredBatches = batches.filter(b =>
    b.nama_batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.jenis_dokumen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================
  // RENDER: LIST
  // ============================================
  const renderList = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input
            className="pl-10"
            placeholder="Cari batch seal..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => { resetForm(); setPage('create'); }} className="flex items-center gap-2 whitespace-nowrap">
          <Plus size={18} /> Buat Batch Baru
        </Button>
      </div>

      {loadingList ? (
        <div className="text-center py-20">
          <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-400">Memuat data...</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <Shield size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Belum ada batch seal</p>
          <p className="text-gray-400 text-sm mt-1">Klik "Buat Batch Baru" untuk memulai</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBatches.map(batch => (
            <Card key={batch.id_batch} className="p-5 flex flex-col md:flex-row gap-4 items-start md:items-center group">
              <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex-shrink-0 relative group/qr overflow-hidden">
                <img src={batch.qr_link} alt="QR" className="w-20 h-20" />
                <button
                  onClick={() => onDownloadQR(batch.qr_link, `Seal_${batch.nama_batch.replace(/\s+/g, '_')}`)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white cursor-pointer"
                >
                  <Download size={18} />
                </button>
              </div>
              <div className="flex-grow space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900">{batch.nama_batch}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold">
                    {batch.jenis_dokumen}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1"><Building2 size={12} /> {batch.nama_org}</span>
                  <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(batch.dibuat_pada)}</span>
                  <span className="flex items-center gap-1"><FileText size={12} /> {batch.total_dokumen} dokumen</span>
                  <span className="flex items-center gap-1 font-mono"><Hash size={12} /> {batch.id_batch}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Button variant="secondary" onClick={() => fetchBatchDetail(batch.id_batch)} className="text-sm py-2 px-4">
                  <Eye size={15} className="mr-1" /> Detail
                </Button>
                <button
                  onClick={() => handleDeleteBatch(batch.id_batch, batch.nama_batch)}
                  className="p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  // ============================================
  // RENDER: CREATE
  // ============================================
  const renderCreate = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => setPage('list')} className="text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600">
        <ArrowLeft size={15} /> Kembali ke Daftar
      </button>
      <form onSubmit={handleCreateBatch} className="space-y-6">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Informasi Batch</h3>
              <p className="text-sm text-gray-500">Detail identitas batch seal ini</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nama Batch *</label>
              <Input required placeholder="Contoh: Sertifikat Kompetensi Batch Jan 2025" value={formNamaBatch} onChange={e => setFormNamaBatch(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Jenis Dokumen *</label>
              <Input required placeholder="Contoh: Sertifikat Kompetensi" value={formJenisDokumen} onChange={e => setFormJenisDokumen(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nama Organisasi *</label>
              <Input required placeholder="Contoh: PT. NNI System" value={formNamaOrg} onChange={e => setFormNamaOrg(e.target.value)} />
            </div>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Table size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Kolom Data</h3>
              <p className="text-sm text-gray-500">Tentukan kolom yang akan ditampilkan saat verifikasi</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-mono font-bold">nomor_dokumen</span>
            {kolomCustom.map(kolom => (
              <div key={kolom} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 text-sm font-semibold">
                {kolom}
                <button type="button" onClick={() => hapusKolom(kolom)} className="ml-1 hover:text-red-500 transition-colors">
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            <Input
              placeholder="Nama kolom baru (contoh: Kompetensi)"
              value={kolomBaru}
              onChange={e => setKolomBaru(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); tambahKolom(); } }}
              className="flex-grow"
            />
            <Button type="button" variant="secondary" onClick={tambahKolom} className="flex-shrink-0">
              <PlusCircle size={16} className="mr-2" /> Tambah
            </Button>
          </div>
        </Card>

        <Card className="p-8">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Data Dokumen</h3>
                <p className="text-sm text-gray-500">{dokumenRows.filter(r => r.nomor_dokumen).length} dokumen diinput</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={downloadTemplate} className="text-sm py-2 px-4">
                <Download size={15} className="mr-2" /> Template Excel
              </Button>
              <Button type="button" variant="secondary" onClick={() => fileInputRef.current?.click()} className="text-sm py-2 px-4">
                <Upload size={15} className="mr-2" /> Upload Excel
              </Button>
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadExcel} />
            </div>
          </div>
          <div className="bg-blue-50 rounded-2xl p-3 mb-5 flex gap-2">
            <AlertTriangle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700">
              Kolom pertama Excel wajib <span className="font-mono font-bold">nomor_dokumen</span>, diikuti kolom sesuai yang telah ditentukan di atas.
            </p>
          </div>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase w-8">#</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">nomor_dokumen *</th>
                  {kolomCustom.map(kolom => (
                    <th key={kolom} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">{kolom}</th>
                  ))}
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {dokumenRows.map((row, index) => (
                  <tr key={index} className="border-t border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-2 text-gray-300 text-xs font-mono">{index + 1}</td>
                    <td className="px-2 py-2">
                      <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 bg-white min-w-[120px]" placeholder="SERT-001" value={row.nomor_dokumen || ''} onChange={e => updateBaris(index, 'nomor_dokumen', e.target.value)} />
                    </td>
                    {kolomCustom.map(kolom => (
                      <td key={kolom} className="px-2 py-2">
                        <input type="text" className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 bg-white min-w-[120px]" placeholder={kolom} value={row[kolom] || ''} onChange={e => updateBaris(index, kolom, e.target.value)} />
                      </td>
                    ))}
                    <td className="px-2 py-2">
                      <button type="button" onClick={() => hapusBaris(index)} className="p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-all" disabled={dokumenRows.length === 1}>
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={tambahBaris} className="mt-4 w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all text-sm font-semibold flex items-center justify-center gap-2">
            <Plus size={16} /> Tambah Baris
          </button>
        </Card>

        <Button type="submit" className="w-full py-5 text-base" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2"><Loader2 size={20} className="animate-spin" /> Membuat Batch Seal...</span>
          ) : (
            <span className="flex items-center justify-center gap-2"><Shield size={20} /> Generate Batch Seal</span>
          )}
        </Button>
      </form>
    </div>
  );

  // ============================================
  // ✅ BARU: RENDER ADD DATA
  // ============================================
  const renderAddData = () => {
    if (!selectedBatch) return null;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back button */}
        <button
          onClick={() => { setPage('detail'); setAddRows([{}]); setAddMode('manual'); }}
          className="text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600"
        >
          <ArrowLeft size={15} /> Kembali ke Detail Batch
        </button>

        {/* Header */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <FilePlus size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Tambah Data ke Batch</h3>
              <p className="text-sm text-indigo-600 font-semibold">{selectedBatch.nama_batch}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Kolom: <span className="font-mono">nomor_dokumen</span>
                {selectedBatch.kolom_custom.map(k => (
                  <span key={k}>, <span className="font-mono">{k}</span></span>
                ))}
              </p>
            </div>
          </div>
        </Card>

        {/* Mode Selector */}
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <button
            onClick={() => { setAddMode('manual'); setAddRows([{}]); }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              addMode === 'manual' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <PlusCircle size={16} /> Input Manual
          </button>
          <button
            onClick={() => { setAddMode('upload'); setAddRows([{}]); }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              addMode === 'upload' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Upload size={16} /> Upload Excel
          </button>
        </div>

        <form onSubmit={handleAddData}>
          {/* ── MANUAL MODE ── */}
          {addMode === 'manual' && (
            <Card className="p-8 space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <p className="text-sm text-gray-500">
                  Masukkan data dokumen baru secara manual. <span className="font-bold text-gray-700">{addRows.filter(r => r.nomor_dokumen?.trim()).length}</span> dokumen siap ditambahkan.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-gray-100">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase w-8">#</th>
                      <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">nomor_dokumen *</th>
                      {selectedBatch.kolom_custom.map(kolom => (
                        <th key={kolom} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">{kolom}</th>
                      ))}
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {addRows.map((row, index) => (
                      <tr key={index} className="border-t border-gray-50 hover:bg-gray-50/50">
                        <td className="px-4 py-2 text-gray-300 text-xs font-mono">{index + 1}</td>
                        <td className="px-2 py-2">
                          <input
                            type="text"
                            className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 bg-white min-w-[120px]"
                            placeholder="SERT-006"
                            value={row.nomor_dokumen || ''}
                            onChange={e => updateAddBaris(index, 'nomor_dokumen', e.target.value)}
                          />
                        </td>
                        {selectedBatch.kolom_custom.map(kolom => (
                          <td key={kolom} className="px-2 py-2">
                            <input
                              type="text"
                              className="w-full px-3 py-2 rounded-xl border border-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 bg-white min-w-[120px]"
                              placeholder={kolom}
                              value={row[kolom] || ''}
                              onChange={e => updateAddBaris(index, kolom, e.target.value)}
                            />
                          </td>
                        ))}
                        <td className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() => hapusAddBaris(index)}
                            className="p-1.5 rounded-lg text-red-300 hover:text-red-500 hover:bg-red-50 transition-all"
                            disabled={addRows.length === 1}
                          >
                            <X size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <button
                type="button"
                onClick={tambahAddBaris}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 transition-all text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Tambah Baris
              </button>
            </Card>
          )}

          {/* ── UPLOAD MODE ── */}
          {addMode === 'upload' && (
            <Card className="p-8 space-y-5">
              {/* Tombol aksi */}
              <div className="flex gap-3 flex-wrap">
                <Button type="button" variant="secondary" onClick={downloadAddTemplate} className="text-sm py-2 px-4">
                  <Download size={15} className="mr-2" /> Download Template Excel
                </Button>
                <Button type="button" variant="secondary" onClick={() => addFileInputRef.current?.click()} className="text-sm py-2 px-4">
                  <Upload size={15} className="mr-2" /> Pilih File Excel
                </Button>
                <input ref={addFileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUploadAddExcel} />
              </div>

              {/* Info */}
              <div className="bg-blue-50 rounded-2xl p-4 flex gap-3">
                <AlertTriangle size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700 space-y-1">
                  <p>Kolom pertama Excel wajib <span className="font-mono font-bold">nomor_dokumen</span>, diikuti kolom:</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedBatch.kolom_custom.map(k => (
                      <span key={k} className="px-2 py-0.5 bg-blue-100 rounded-lg font-mono font-bold">{k}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Preview data yang sudah diupload */}
              {addRows.some(r => r.nomor_dokumen?.trim()) && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <p className="text-sm font-bold text-emerald-700">
                      {addRows.filter(r => r.nomor_dokumen?.trim()).length} baris siap ditambahkan
                    </p>
                  </div>
                  <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">No</th>
                          <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Nomor Dokumen</th>
                          {selectedBatch.kolom_custom.map(k => (
                            <th key={k} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {addRows.filter(r => r.nomor_dokumen?.trim()).map((row, index) => (
                          <tr key={index} className="border-t border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-gray-400 text-xs">{index + 1}</td>
                            <td className="px-4 py-3 font-mono font-bold text-gray-900">{row.nomor_dokumen}</td>
                            {selectedBatch.kolom_custom.map(k => (
                              <td key={k} className="px-4 py-3 text-gray-700">{row[k] || '-'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAddRows([{}])}
                    className="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                  >
                    <X size={12} /> Hapus data ini
                  </button>
                </div>
              )}

              {/* Empty state */}
              {!addRows.some(r => r.nomor_dokumen?.trim()) && (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                  onClick={() => addFileInputRef.current?.click()}
                >
                  <Upload size={36} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500 font-semibold">Klik untuk memilih file Excel</p>
                  <p className="text-gray-400 text-xs mt-1">Format: .xlsx atau .xls</p>
                </div>
              )}
            </Card>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full py-5 text-base mt-6"
            disabled={loading || !addRows.some(r => r.nomor_dokumen?.trim())}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={20} className="animate-spin" /> Menyimpan Data...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <FilePlus size={20} /> Tambahkan {addRows.filter(r => r.nomor_dokumen?.trim()).length} Dokumen ke Batch
              </span>
            )}
          </Button>
        </form>
      </div>
    );
  };

  // ============================================
  // RENDER: DETAIL
  // ============================================
  const renderDetail = () => {
    if (!selectedBatch) return null;
    return (
      <div className="space-y-6">
        <button onClick={() => setPage('list')} className="text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600">
          <ArrowLeft size={15} /> Kembali ke Daftar
        </button>

        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm relative group/qr overflow-hidden">
                <img src={selectedBatch.qr_link} alt="QR Seal" className="w-36 h-36" />
                <button
                  onClick={() => onDownloadQR(selectedBatch.qr_link, `Seal_${selectedBatch.nama_batch.replace(/\s+/g, '_')}`)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr:opacity-100 transition-opacity flex flex-col items-center justify-center rounded-2xl text-white cursor-pointer gap-1"
                >
                  <Download size={24} />
                  <span className="text-xs font-bold">Download QR</span>
                </button>
              </div>
              <p className="text-xs text-center text-gray-400 mt-2">Hover untuk download</p>
            </div>

            <div className="flex-grow space-y-3">
              <div>
                <h2 className="text-2xl font-black text-gray-900">{selectedBatch.nama_batch}</h2>
                <span className="text-sm px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 font-semibold inline-block mt-1">
                  {selectedBatch.jenis_dokumen}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Organisasi</p>
                  <p className="font-bold text-gray-900">{selectedBatch.nama_org}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Diterbitkan</p>
                  <p className="font-bold text-gray-900">{formatDate(selectedBatch.dibuat_pada)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">Total Dokumen</p>
                  <p className="font-bold text-gray-900">{selectedBatch.documents?.length || 0} dokumen</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">ID Batch</p>
                  <p className="font-mono text-xs text-gray-700">{selectedBatch.id_batch}</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold mb-2">Kolom Data</p>
                <div className="flex flex-wrap gap-2">
                  {selectedBatch.kolom_custom.map(k => (
                    <span key={k} className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold">{k}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-shrink-0 flex flex-col gap-2">
              {/* ✅ BARU: Tombol Tambah Data */}
              <button
                onClick={() => { setAddRows([{}]); setAddMode('manual'); setPage('add-data'); }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all text-sm font-bold border border-emerald-200"
              >
                <FilePlus size={15} /> Tambah Data
              </button>
              <button
                onClick={() => handleDeleteBatch(selectedBatch.id_batch, selectedBatch.nama_batch)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all text-sm font-bold border border-red-100"
              >
                <Trash2 size={15} /> Hapus Batch
              </button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h3 className="font-bold text-gray-900 text-lg">Daftar Dokumen ({selectedBatch.documents?.length || 0})</h3>
            {/* ✅ BARU: Shortcut tambah data dari tabel */}
            <Button
              variant="secondary"
              onClick={() => { setAddRows([{}]); setAddMode('manual'); setPage('add-data'); }}
              className="text-sm py-2 px-4 text-emerald-600 border-emerald-100 hover:bg-emerald-50"
            >
              <FilePlus size={15} className="mr-2" /> Tambah Data
            </Button>
          </div>
          {selectedBatch.documents?.length === 0 ? (
            <div className="text-center py-10 text-gray-400">Tidak ada dokumen</div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">No</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase">Nomor Dokumen</th>
                    {selectedBatch.kolom_custom.map(k => (
                      <th key={k} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase whitespace-nowrap">{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {selectedBatch.documents.map((doc, index) => (
                    <tr key={doc.id_dokumen} className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-400 text-xs">{index + 1}</td>
                      <td className="px-4 py-3 font-mono font-bold text-gray-900">{doc.nomor_dokumen}</td>
                      {selectedBatch.kolom_custom.map(k => (
                        <td key={k} className="px-4 py-3 text-gray-700">{doc.data_json[k] || '-'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================
  return (
    <div className="space-y-8">
      <div>
        <button onClick={onBack} className="mb-2 text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600">
          <X size={16} /> Kembali ke Admin Panel
        </button>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Seal Management</h2>
        <p className="text-gray-500 font-medium">Kelola cap / seal digital untuk dokumen resmi</p>
      </div>

      {page !== 'create' && page !== 'add-data' && (
        <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
          <button
            onClick={() => setPage('list')}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all",
              page === 'list' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            <Shield size={16} /> Daftar Batch
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {page === 'list'     && renderList()}
          {page === 'create'   && renderCreate()}
          {page === 'detail'   && renderDetail()}
          {page === 'add-data' && renderAddData()} {/* ✅ BARU */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

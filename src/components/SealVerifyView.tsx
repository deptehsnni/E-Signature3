import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Search, CheckCircle2, XCircle, Calendar, Building2, FileText, Hash, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { cn, formatDate } from '../lib/utils';

interface SealBatch {
  id_batch: string;
  nama_batch: string;
  jenis_dokumen: string;
  nama_org: string;
  kolom_custom: string[];
  dibuat_pada: string;
}

interface SealVerifyResult {
  valid: boolean;
  batch?: SealBatch;
  document?: {
    nomor_dokumen: string;
    data: Record<string, any>;
  };
}

interface SealVerifyViewProps {
  id_batch: string;
  onSwitchLogin?: () => void;
}

export const SealVerifyView = ({ id_batch, onSwitchLogin }: SealVerifyViewProps) => {
  const [nomorDokumen, setNomorDokumen] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(true);
  const [result, setResult] = useState<SealVerifyResult | null>(null);
  const [batch, setBatch] = useState<SealBatch | null>(null);
  const [batchNotFound, setBatchNotFound] = useState(false);

  // Ambil info batch saat komponen dimuat
  useEffect(() => {
    const fetchBatch = async () => {
      try {
        const res = await fetch(`/api/seal/batch/${id_batch}`);
        if (res.ok) {
          const data = await res.json();
          setBatch(data);
        } else {
          setBatchNotFound(true);
        }
      } catch (e) {
        setBatchNotFound(true);
      } finally {
        setLoadingBatch(false);
      }
    };
    if (id_batch) fetchBatch();
  }, [id_batch]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorDokumen.trim()) return;

    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/seal/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_batch, nomor_dokumen: nomorDokumen.trim() })
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setResult({ valid: false });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setNomorDokumen('');
  };

  // Loading batch info
  if (loadingBatch) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat informasi dokumen...</p>
        </div>
      </div>
    );
  }

  // Batch tidak ditemukan
  if (batchNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl border border-red-100 p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-6">
            <XCircle size={40} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Seal Tidak Ditemukan</h2>
          <p className="text-gray-500 mb-6">QR Code ini tidak valid atau batch seal tidak terdaftar dalam sistem.</p>
          {onSwitchLogin && (
            <Button onClick={onSwitchLogin} variant="secondary" className="w-full">
              <ArrowLeft size={16} className="mr-2" /> Kembali ke Login
            </Button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
        >
          {/* Logo & Org */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
              <Shield size={32} />
            </div>
            <div>
              <h1 className="text-xl font-black text-gray-900">{batch?.nama_org}</h1>
              <p className="text-sm text-indigo-600 font-semibold">{batch?.jenis_dokumen}</p>
            </div>
          </div>

          {/* Batch Info */}
          <div className="bg-indigo-50 rounded-2xl p-4 mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <FileText size={14} className="text-indigo-500 flex-shrink-0" />
              <span className="text-gray-500">Nama Batch:</span>
              <span className="font-bold text-gray-900">{batch?.nama_batch}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar size={14} className="text-indigo-500 flex-shrink-0" />
              <span className="text-gray-500">Diterbitkan:</span>
              <span className="font-bold text-gray-900">{batch ? formatDate(batch.dibuat_pada) : '-'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Hash size={14} className="text-indigo-500 flex-shrink-0" />
              <span className="text-gray-500">ID Batch:</span>
              <span className="font-mono text-xs text-gray-700">{batch?.id_batch}</span>
            </div>
          </div>

          {/* Form Verifikasi */}
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-sm text-gray-500 mb-4 text-center">
                  Masukkan nomor dokumen yang tertera pada dokumen Anda untuk memverifikasi keasliannya.
                </p>
                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                      Nomor Dokumen
                    </label>
                    <Input
                      placeholder="Contoh: 001/xx/Cert-EHS/xx-xx"
                      value={nomorDokumen}
                      onChange={e => setNomorDokumen(e.target.value)}
                      className="text-center font-mono text-lg py-4"
                      required
                      autoFocus
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full py-4"
                    disabled={loading || !nomorDokumen.trim()}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 size={18} className="animate-spin" /> Memverifikasi...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Search size={18} /> Verifikasi Dokumen
                      </span>
                    )}
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                {result.valid ? (
                  /* ✅ VALID */
                  <div className="space-y-4">
                    {/* Status Banner */}
                    <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <p className="font-black text-emerald-700 text-sm uppercase tracking-wider">✅ Dokumen Terautentikasi</p>
                        <p className="text-xs text-emerald-600">Dokumen ini sah dan terdaftar dalam sistem</p>
                      </div>
                    </div>

                    {/* Detail Dokumen */}
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
                      {/* Nomor Dokumen */}
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Nomor Dokumen</span>
                        <span className="font-mono font-bold text-gray-900 text-sm">{result.document?.nomor_dokumen}</span>
                      </div>

                      {/* Kolom Custom */}
                      {result.batch?.kolom_custom.map((kolom) => {
                        const value = result.document?.data[kolom];
                        if (!value || kolom === 'nomor_dokumen') return null;
                        return (
                          <div key={kolom} className="flex justify-between items-start py-2 border-b border-gray-100 last:border-0">
                            <span className="text-xs font-semibold text-gray-400 uppercase flex-shrink-0 mr-4">{kolom}</span>
                            <span className="font-semibold text-gray-900 text-sm text-right">{String(value)}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-1">
                      <Shield size={12} className="text-indigo-400" />
                      <span>Dikeluarkan oleh <span className="font-bold text-indigo-500">{result.batch?.nama_org}</span></span>
                    </div>

                    {/* Tombol Verifikasi Lagi */}
                    <Button variant="secondary" onClick={handleReset} className="w-full">
                      <Search size={16} className="mr-2" /> Verifikasi Nomor Lain
                    </Button>
                  </div>
                ) : (
                  /* ❌ TIDAK VALID */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl p-4">
                      <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center flex-shrink-0">
                        <XCircle size={22} />
                      </div>
                      <div>
                        <p className="font-black text-red-700 text-sm uppercase tracking-wider">❌ Dokumen Tidak Valid</p>
                        <p className="text-xs text-red-500">Nomor dokumen tidak ditemukan dalam sistem</p>
                      </div>
                    </div>

                    <div className="bg-red-50/50 rounded-2xl p-4 text-center border border-red-100">
                      <p className="text-sm text-red-700 font-medium mb-1">Nomor yang dimasukkan:</p>
                      <p className="font-mono font-bold text-red-900">"{nomorDokumen}"</p>
                      <p className="text-xs text-red-500 mt-2">Pastikan nomor dokumen sesuai dengan yang tertera pada dokumen fisik Anda.</p>
                    </div>

                    <Button variant="secondary" onClick={handleReset} className="w-full border-red-100 text-red-600 hover:bg-red-50">
                      <Search size={16} className="mr-2" /> Coba Nomor Lain
                    </Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Sistem Verifikasi Digital · {batch?.nama_org} · {new Date().getFullYear()}
        </p>

        {onSwitchLogin && (
          <div className="text-center">
            <button onClick={onSwitchLogin} className="text-xs text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1 mx-auto">
              <ArrowLeft size={12} /> Masuk ke sistem
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

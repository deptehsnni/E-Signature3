import React from 'react';
import { 
  Users, 
  ShieldAlert, 
  Database, 
  QrCode, 
  Search, 
  Download, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  X, 
  Plus, 
  FileText, 
  Lock, 
  RefreshCw, 
  Key, 
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { PendingUsersList, ResetRequestsList } from './AdminLists';
import { Signature, UserData } from '../types';
import { cn, formatDate } from '../lib/utils';

interface AdminPanelProps {
  adminPage: string;
  setAdminPage: (page: any) => void;
  pendingUsers: UserData[];
  resetRequests: any[];
  onApproveUser: (id: string) => void;
  onRejectUser: (id: string) => void;
  onApproveReset: (id: string) => void;
  onRejectReset: (id: string) => void;
  bulkForm: { name: string; start: string; end: string; static: string };
  setBulkForm: (form: any) => void;
  onBulkGenerate: (e: React.FormEvent) => void;
  loading: boolean;
  onEmergencyReset: () => void;
  onClearDatabase: () => void;
  onBack: () => void;
  signatures: Signature[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onDeleteSignature: (id: string) => void;
  onCopyHash: (hash: string) => void;
  onDownloadQR: (url: string, filename: string) => void;
}

export const AdminPanel = ({
  adminPage,
  setAdminPage,
  pendingUsers,
  resetRequests,
  onApproveUser,
  onRejectUser,
  onApproveReset,
  onRejectReset,
  bulkForm,
  setBulkForm,
  onBulkGenerate,
  loading,
  onEmergencyReset,
  onClearDatabase,
  onBack,
  signatures,
  searchTerm,
  setSearchTerm,
  onDeleteSignature,
  onCopyHash,
  onDownloadQR
}: AdminPanelProps) => {
  const renderBulkGenerate = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <QrCode size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bulk Generate QR</h2>
            <p className="text-sm text-gray-500">Generate banyak QR signature sekaligus</p>
          </div>
        </div>
        <form onSubmit={onBulkGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nama Dokumen</label>
              <Input 
                required
                placeholder="Contoh: Surat Keputusan Direksi"
                value={bulkForm.name}
                onChange={e => setBulkForm({ ...bulkForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nomor Awal</label>
              <Input 
                required
                placeholder="Contoh: 001"
                value={bulkForm.start}
                onChange={e => setBulkForm({ ...bulkForm, start: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nomor Akhir</label>
              <Input 
                required
                placeholder="Contoh: 005"
                value={bulkForm.end}
                onChange={e => setBulkForm({ ...bulkForm, end: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Bagian Statis (Akhir)</label>
              <Input 
                required
                placeholder="Contoh: /SK-DIR/NNI/2024"
                value={bulkForm.static}
                onChange={e => setBulkForm({ ...bulkForm, static: e.target.value })}
              />
            </div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <p className="text-xs text-indigo-700 leading-relaxed">
              <span className="font-bold">Preview Format:</span> {bulkForm.start || '001'}{bulkForm.static || '/XXX/XXX'} sampai {bulkForm.end || '005'}{bulkForm.static || '/XXX/XXX'}
            </p>
          </div>
          <Button type="submit" className="w-full py-6" disabled={loading}>
            {loading ? 'Sedang Memproses...' : 'Generate & Download ZIP'}
          </Button>
        </form>
      </Card>
      <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
        <AlertTriangle size={20} className="text-blue-600 flex-shrink-0" />
        <p className="text-xs text-blue-700 leading-relaxed">
          QR yang digenerate akan otomatis di-zip dan didownload. Pastikan pop-up browser Anda diizinkan.
        </p>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-8 border-red-100">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Security & Emergency</h2>
            <p className="text-sm text-gray-500">Tindakan darurat untuk keamanan sistem</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-2">Reset Akun Admin</h3>
            <p className="text-sm text-gray-500 mb-4">Kembalikan password admin ke default jika terjadi masalah login.</p>
            <Button variant="secondary" onClick={onEmergencyReset} className="w-full text-red-600 border-red-100 hover:bg-red-50">
              <RefreshCw size={18} className="mr-2" /> Jalankan Emergency Reset
            </Button>
          </div>
          <div className="p-6 rounded-2xl bg-red-50/50 border border-red-100">
            <h3 className="font-bold text-red-900 mb-2">Hapus Seluruh Database</h3>
            <p className="text-sm text-red-700 mb-4">PERINGATAN: Tindakan ini akan menghapus seluruh data signature secara permanen.</p>
            <Button variant="ghost" onClick={onClearDatabase} className="w-full bg-red-600 text-white hover:bg-red-700">
              <Trash2 size={18} className="mr-2" /> Kosongkan Database Signature
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderVerification = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <PendingUsersList 
          users={pendingUsers} 
          onApprove={onApproveUser} 
          onReject={onRejectUser} 
        />
        <ResetRequestsList 
          requests={resetRequests} 
          onApprove={onApproveReset} 
          onReject={onRejectReset} 
        />
      </div>
    </div>
  );

  const renderDatabase = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            className="pl-10 py-6 text-lg"
            placeholder="Cari berdasarkan jenis, nomor dokumen, atau hash..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-4">
        {signatures.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <Search size={48} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500">Tidak ada dokumen yang ditemukan.</p>
          </div>
        ) : (
          signatures.map((sig) => (
            <Card key={sig.signature_id} className="p-5 flex flex-col md:flex-row gap-6 items-start md:items-center group relative">
              <div className="bg-white p-2 rounded-xl border border-gray-100 shadow-sm flex-shrink-0 relative group/qr overflow-hidden">
                <img src={sig.qr_link} alt="QR Code" className="w-24 h-24" referrerPolicy="no-referrer" />
                <button 
                  onClick={() => onDownloadQR(sig.qr_link, `QR_${sig.nomor_dokumen.replace(/\//g, '_')}`)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center rounded-xl text-white cursor-pointer z-10"
                >
                  <Download size={20} />
                </button>
              </div>
              <div className="flex-grow space-y-1 z-10">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900">{sig.jenis_dokumen}</h3>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs font-mono text-gray-500">{sig.nomor_dokumen}</span>
                </div>
                <p className="text-sm text-gray-500">Divalidasi pada {formatDate(sig.waktu_ttd)}</p>
                <div className="pt-2 flex flex-wrap gap-4">
                  <a href={`/?verify=${sig.hash_code}`} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline">Detail</a>
                  <button onClick={() => onCopyHash(sig.hash_code)} className="text-xs font-bold text-gray-500 hover:text-gray-700">Salin Hash</button>
                  <button onClick={() => onDownloadQR(sig.qr_link, `QR_${sig.nomor_dokumen.replace(/\//g, '_')}`)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Download QR</button>
                  <button onClick={() => onDeleteSignature(sig.signature_id)} className="text-xs font-bold text-red-50 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all">Hapus Validasi</button>
                </div>
              </div>
              <div className="flex-shrink-0 ml-auto">
                <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck size={12} /> Verified
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button onClick={onBack} className="mb-2 text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600">
            <X size={16} /> Kembali
          </button>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Admin Control Center</h2>
          <p className="text-gray-500 font-medium">Manajemen sistem dan keamanan tingkat tinggi</p>
        </div>
      </div>

      <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {[
          { id: 'bulk', label: 'Bulk Generate', icon: <QrCode size={18} /> },
          { id: 'verification', label: 'User Approval', icon: <UserPlus size={18} /> },
          { id: 'security', label: 'Security', icon: <ShieldAlert size={18} /> },
          { id: 'database', label: 'Database', icon: <Database size={18} /> },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setAdminPage(item.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              adminPage === item.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-500 hover:bg-gray-50"
            )}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={adminPage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {adminPage === 'bulk' && renderBulkGenerate()}
          {adminPage === 'verification' && renderVerification()}
          {adminPage === 'security' && renderSecurity()}
          {adminPage === 'database' && renderDatabase()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

import React from 'react';
import { 
  Plus, 
  FileText, 
  QrCode, 
  Settings, 
  History, 
  Search, 
  Download, 
  CheckCircle2, 
  X, 
  Lock, 
  User, 
  Shield,
  XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Signature, UserData } from '../types';
import { cn, formatDate } from '../lib/utils';

interface HomePageProps {
  user: UserData | null;
  signatures: Signature[];
  setDashboardPage: (page: any) => void;
}

export const HomePage = ({ user, signatures, setDashboardPage }: HomePageProps) => (
  <div className="space-y-8">
    <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-3xl font-bold mb-2">Halo, {user?.nama_lengkap}!</h2>
        <p className="opacity-80">Selamat datang di Sistem E-Signature QR. Apa yang ingin Anda lakukan hari ini?</p>
      </div>
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { id: 'sign', label: 'Tanda Tangan', icon: <Plus size={28} />, color: 'bg-blue-500' },
        { id: 'database', label: 'Database', icon: <FileText size={28} />, color: 'bg-emerald-500' },
        { id: 'verify', label: 'Validasi QR', icon: <QrCode size={28} />, color: 'bg-purple-500' },
        { id: 'settings', label: 'Pengaturan', icon: <Settings size={28} />, color: 'bg-orange-500' },
      ].map((item) => (
        <button
          key={item.id}
          onClick={() => setDashboardPage(item.id as any)}
          className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all text-center flex flex-col items-center gap-4"
        >
          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110", item.color)}>
            {item.icon}
          </div>
          <span className="font-bold text-gray-700">{item.label}</span>
        </button>
      ))}
    </div>

    <div className="space-y-4">
      <h3 className="font-bold text-gray-900 flex items-center gap-2">
        <History size={18} className="text-gray-400" />
        Aktivitas Terbaru
      </h3>
      <div className="space-y-3">
        {signatures.slice(0, 3).map(sig => (
          <div key={sig.signature_id} className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                <FileText size={20} />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{sig.jenis_dokumen}</p>
                <p className="text-xs text-gray-500">{formatDate(sig.waktu_ttd)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-mono text-gray-400 block">{sig.nomor_dokumen}</span>
              <span className="text-[10px] text-emerald-600 font-bold uppercase">Verified</span>
            </div>
          </div>
        ))}
        {signatures.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm italic">Belum ada aktivitas tanda tangan.</div>
        )}
        {signatures.length > 0 && (
          <button onClick={() => setDashboardPage('database')} className="w-full py-2 text-sm text-indigo-600 font-medium hover:underline">
            Lihat Semua Riwayat
          </button>
        )}
      </div>
    </div>
  </div>
);

interface SignPageProps {
  form: any;
  setForm: any;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  onBack: () => void;
}

export const SignPage = ({ form, setForm, onSubmit, loading, error, onBack }: SignPageProps) => (
  <div className="max-w-2xl mx-auto">
    <button onClick={onBack} className="mb-6 text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600">
      <X size={16} /> Kembali ke Beranda
    </button>
    <Card className="p-8">
      <div className="flex items-center gap-3 mb-6 text-indigo-600">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
          <Plus size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Buat Tanda Tangan Digital</h2>
          <p className="text-sm text-gray-500">Generate QR Code untuk dokumen baru</p>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Jenis Dokumen</label>
            <Input 
              required
              placeholder="Contoh: Surat Keputusan"
              value={form.type}
              onChange={e => setForm({ ...form, type: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nomor Dokumen</label>
            <Input 
              required
              placeholder="Contoh: 001/SK/2024"
              value={form.number}
              onChange={e => setForm({ ...form, number: e.target.value })}
            />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
            <Lock size={12} /> Konfirmasi Password Akun
          </label>
          <Input 
            required
            type="password"
            placeholder="Masukkan password Anda untuk verifikasi"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <p className="text-[10px] text-gray-400 mt-2 italic">
            * Dengan memasukkan password, Anda secara sadar memberikan tanda tangan digital pada dokumen ini.
          </p>
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
            <XCircle size={16} />
            {error}
          </div>
        )}
        <Button type="submit" className="w-full py-6 text-lg" disabled={loading}>
          {loading ? 'Sedang Memproses...' : 'Generate QR Signature'}
        </Button>
      </form>
    </Card>
  </div>
);

interface DatabasePageProps {
  signatures: Signature[];
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  dbFilter: string;
  setDbFilter: (v: string) => void;
  user: UserData | null;
  onExport: () => void;
  onBack: () => void;
  onDelete: (id: string) => void;
  onCopy: (text: string) => void;
  onDownload: (url: string, filename: string) => void;
}

export const DatabasePage = ({
  signatures,
  searchTerm,
  setSearchTerm,
  dbFilter,
  setDbFilter,
  user,
  onExport,
  onBack,
  onDelete,
  onCopy,
  onDownload
}: DatabasePageProps) => (
  <div className="space-y-6">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <button onClick={onBack} className="mb-2 text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600">
          <X size={16} /> Kembali
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Database Dokumen</h2>
        <p className="text-sm text-gray-500">Daftar semua dokumen yang telah divalidasi</p>
      </div>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onExport} className="flex gap-2 bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100">
          <FileText size={18} /> Export Excel
        </Button>
      </div>
    </div>

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
      {user?.id_karyawan.toLowerCase() === 'admin' && (
        <div className="flex bg-white rounded-xl border border-gray-200 p-1 shadow-sm w-full md:w-auto">
          {['all', 'admin', 'user'].map(f => (
            <button 
              key={f}
              onClick={() => setDbFilter(f)}
              className={cn(
                "flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize",
                dbFilter === f ? "bg-indigo-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {f === 'all' ? 'Semua' : f}
            </button>
          ))}
        </div>
      )}
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
                onClick={() => onDownload(sig.qr_link, `QR_${sig.nomor_dokumen.replace(/\//g, '_')}`)}
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
                <button onClick={() => onCopy(sig.hash_code)} className="text-xs font-bold text-gray-500 hover:text-gray-700">Salin Hash</button>
                <button onClick={() => onDownload(sig.qr_link, `QR_${sig.nomor_dokumen.replace(/\//g, '_')}`)} className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Download QR</button>
                <button onClick={() => onDelete(sig.signature_id)} className="text-xs font-bold text-red-50 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition-all">Hapus Validasi</button>
              </div>
            </div>
            <div className="flex-shrink-0 ml-auto">
              <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                <CheckCircle2 size={12} /> Verified
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  </div>
);

interface SettingsPageProps {
  settingsPage: 'profile' | 'privacy';
  setSettingsPage: (v: 'profile' | 'privacy') => void;
  user: UserData | null;
  profileForm: any;
  setProfileForm: any;
  changePasswordForm: any;
  setChangePasswordForm: any;
  onUpdateProfile: (e: React.FormEvent) => void;
  onChangePassword: (e: React.FormEvent) => void;
  onBack: () => void;
  loading: boolean;
}

export const SettingsPage = ({
  settingsPage,
  setSettingsPage,
  user,
  profileForm,
  setProfileForm,
  changePasswordForm,
  setChangePasswordForm,
  onUpdateProfile,
  onChangePassword,
  onBack,
  loading
}: SettingsPageProps) => (
  <div className="max-w-4xl mx-auto">
    <button onClick={onBack} className="mb-6 text-sm text-gray-500 flex items-center gap-1 hover:text-indigo-600">
      <X size={16} /> Kembali
    </button>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="p-4 h-fit">
        <div className="space-y-1">
          {[
            { id: 'profile', label: 'Profil', icon: <User size={18} /> },
            { id: 'privacy', label: 'Privasi', icon: <Shield size={18} /> },
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setSettingsPage(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                settingsPage === item.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "text-gray-500 hover:bg-gray-50"
              )}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </div>
      </Card>

      <div className="md:col-span-2">
        <AnimatePresence mode="wait">
          {settingsPage === 'profile' ? (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center"><User size={32} /></div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Pengaturan Profil</h2>
                    <p className="text-sm text-gray-500">Kelola informasi publik Anda</p>
                  </div>
                </div>
                <form onSubmit={onUpdateProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">ID Karyawan</label>
                      <Input disabled value={user?.id_karyawan} className="bg-gray-50" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Status Akun</label>
                      <div className="h-10 flex items-center px-3 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm border border-emerald-100">Active</div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Nama Lengkap</label>
                      <Input value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value.toUpperCase() })} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Jabatan</label>
                      <Input value={profileForm.role} onChange={e => setProfileForm({ ...profileForm, role: e.target.value.toUpperCase() })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full py-6" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Perubahan'}</Button>
                </form>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="privacy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <Card className="p-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center"><Shield size={32} /></div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Keamanan & Privasi</h2>
                    <p className="text-sm text-gray-500">Perbarui kata sandi akun Anda</p>
                  </div>
                </div>
                <form onSubmit={onChangePassword} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Password Lama</label>
                      <Input required type="password" placeholder="••••••••" value={changePasswordForm.oldPassword} onChange={e => setChangePasswordForm({ ...changePasswordForm, oldPassword: e.target.value })} />
                    </div>
                    <div className="pt-4 border-t border-gray-50">
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Password Baru</label>
                      <Input required type="password" placeholder="••••••••" value={changePasswordForm.newPassword} onChange={e => setChangePasswordForm({ ...changePasswordForm, newPassword: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Konfirmasi Password Baru</label>
                      <Input required type="password" placeholder="••••••••" value={changePasswordForm.confirmPassword} onChange={e => setChangePasswordForm({ ...changePasswordForm, confirmPassword: e.target.value })} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full py-6" disabled={loading}>{loading ? 'Memproses...' : 'Ubah Password'}</Button>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  </div>
);

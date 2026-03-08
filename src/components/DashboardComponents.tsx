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
  XCircle,
  ShieldAlert
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

    {/* TOMBOL ADMIN CONTROL CENTER - Hanya muncul untuk Admin */}
    {user?.id_karyawan?.toLowerCase() === 'admin' && (
      <button
        onClick={() => setDashboardPage('admin')}
        className="group w-full bg-gradient-to-r from-indigo-600 to-purple-600 p-5 rounded-3xl shadow-lg hover:shadow-xl transition-all flex items-center justify-between text-white"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center transition-transform group-hover:scale-110">
            <ShieldAlert size={24} />
          </div>
          <div className="text-left">
            <p className="font-black text-lg">Admin Control Center</p>
            <p className="text-white/70 text-sm">Manajemen sistem dan keamanan tingkat tinggi</p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <X size={16} className="rotate-45" />
        </div>
      </button>
    )}

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
      <X size={16} /> Kemb

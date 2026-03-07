import React from 'react';
import { ShieldCheck, XCircle, Lock } from 'lucide-react';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';

interface LoginViewProps {
  form: any;
  setForm: any;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  onSwitchRegister: () => void;
  onSwitchForgotPassword: () => void;
  onSwitchVerify: () => void;
}

export const LoginView = ({
  form,
  setForm,
  onSubmit,
  loading,
  error,
  onSwitchRegister,
  onSwitchForgotPassword,
  onSwitchVerify
}: LoginViewProps) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-indigo-600 text-white mb-4 shadow-lg shadow-indigo-100">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">E-Signature QR</h1>
        <p className="text-gray-500 mt-1">Masuk ke akun Anda</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">ID Karyawan</label>
          <Input 
            required
            placeholder="Masukkan ID Karyawan"
            value={form.id}
            onChange={e => setForm({ ...form, id: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Password</label>
          <Input 
            required
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
            <XCircle size={16} />
            {error}
          </div>
        )}
        <Button type="submit" className="w-full py-6" disabled={loading}>
          {loading ? 'Masuk...' : 'Masuk Sekarang'}
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-gray-100 text-center space-y-4">
        <p className="text-sm text-gray-500">
          Belum punya akun?{' '}
          <button onClick={onSwitchRegister} className="text-indigo-600 font-bold hover:underline">Daftar</button>
        </p>
        <button onClick={onSwitchForgotPassword} className="text-sm text-gray-400 hover:text-indigo-600 transition-colors">
          Lupa Password?
        </button>
        <div className="pt-2">
          <button onClick={onSwitchVerify} className="text-xs text-gray-400 hover:text-indigo-600 transition-colors">
            Validasi QR Tanpa Login
          </button>
        </div>
      </div>
    </Card>
  </div>
);

interface RegisterViewProps {
  form: any;
  setForm: any;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  onSwitchLogin: () => void;
}

export const RegisterView = ({
  form,
  setForm,
  onSubmit,
  loading,
  error,
  onSwitchLogin
}: RegisterViewProps) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Daftar Akun</h1>
        <p className="text-gray-500 mt-1">Buat akun E-Signature baru</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">ID Karyawan</label>
          <Input 
            required
            placeholder="ID Karyawan"
            value={form.id}
            onChange={e => setForm({ ...form, id: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Nama Lengkap</label>
          <Input 
            required
            placeholder="Nama Lengkap"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value.toUpperCase() })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Jabatan</label>
          <Input 
            required
            placeholder="Jabatan"
            value={form.role}
            onChange={e => setForm({ ...form, role: e.target.value.toUpperCase() })}
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Password</label>
          <Input 
            required
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
            <XCircle size={16} />
            {error}
          </div>
        )}
        <Button type="submit" className="w-full py-6" disabled={loading}>
          {loading ? 'Mendaftar...' : 'Daftar Akun'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <button onClick={onSwitchLogin} className="text-sm text-gray-500 hover:text-indigo-600">
          Sudah punya akun? <span className="font-bold">Masuk</span>
        </button>
      </div>
    </Card>
  </div>
);

interface ForgotPasswordViewProps {
  forgotId: string;
  setForgotId: (id: string) => void;
  newPassword: string;
  setNewPassword: (pw: string) => void;
  resetStatus: string;
  onForgotSubmit: (e: React.FormEvent) => void;
  onResetSubmit: (e: React.FormEvent) => void;
  onCheckStatus: () => void;
  onSwitchLogin: () => void;
  loading: boolean;
  error: string | null;
}

export const ForgotPasswordView = ({
  forgotId,
  setForgotId,
  newPassword,
  setNewPassword,
  resetStatus,
  onForgotSubmit,
  onResetSubmit,
  onCheckStatus,
  onSwitchLogin,
  loading,
  error
}: ForgotPasswordViewProps) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    <Card className="w-full max-w-md p-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 mb-4">
          <Lock size={32} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Lupa Password</h1>
        <p className="text-gray-500 mt-1">Reset password akun Anda</p>
      </div>

      {resetStatus === 'Approved' ? (
        <form onSubmit={onResetSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">Password Baru</label>
            <Input 
              required
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full py-6" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
          </Button>
        </form>
      ) : (
        <form onSubmit={onForgotSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">ID Karyawan</label>
            <Input 
              required
              placeholder="Masukkan ID Karyawan"
              value={forgotId}
              onChange={e => setForgotId(e.target.value)}
            />
          </div>
          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-600 text-sm flex items-center gap-2">
              <XCircle size={16} />
              {error}
            </div>
          )}
          <Button type="submit" className="w-full py-6" disabled={loading || resetStatus === 'Requested'}>
            {resetStatus === 'Requested' ? 'Menunggu Admin...' : 'Minta Reset Password'}
          </Button>
          {resetStatus === 'Requested' && (
            <Button variant="secondary" type="button" className="w-full py-4 text-xs" onClick={onCheckStatus}>
              Cek Status Persetujuan Admin
            </Button>
          )}
        </form>
      )}

      <div className="mt-6 text-center">
        <button onClick={onSwitchLogin} className="text-sm text-gray-500 hover:text-indigo-600">
          Kembali ke <span className="font-bold">Login</span>
        </button>
      </div>
    </Card>
  </div>
);

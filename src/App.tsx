/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import jsQR from 'jsqr';
import { 
  LogOut, 
  Menu,
  X,
  LayoutDashboard,
  ShieldCheck,
  Database,
  Settings,
  Plus,
  FileText,
  QrCode,
  History,
  Lock,
  XCircle,
  CheckCircle2,
  Search,
  Download,
  Camera,
  Upload,
  User,
  Shield,
  UserPlus,
  ChevronRight
} from 'lucide-react';

import { UserData, Signature } from './types';
import { Button } from './components/Button';
import { Input } from './components/Input';
import { Toast } from './components/Toast';
import { Card } from './components/Card';
import { VerificationResultDisplay } from './components/VerificationResultDisplay';
import { LoginView, RegisterView, ForgotPasswordView } from './components/AuthViews';
import { VerifyView } from './components/VerifyView';
import { HomePage, SignPage, DatabasePage, SettingsPage } from './components/DashboardComponents';
import { AdminPanel } from './components/AdminPanel';
import { ConfirmationModal } from './components/ConfirmationModal';
import { PendingUsersList, ResetRequestsList } from './components/AdminLists';
import { api } from './services/api';
import { cn, formatDate } from './lib/utils';

export default function App() {
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const [user, setUser] = useState<UserData | null>(null);
  const [view, setView] = useState<'login' | 'register' | 'dashboard' | 'admin' | 'verify' | 'forgot-password'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('verify') || window.location.pathname.startsWith('/verify/')) {
        return 'verify';
      }
    }
    return 'login';
  });

  // ✅ DIPERBAIKI: Tambahkan 'admin' ke tipe dashboardPage
  const [dashboardPage, setDashboardPage] = useState<'home' | 'sign' | 'database' | 'verify' | 'settings' | 'admin'>('home');
  const [adminPage, setAdminPage] = useState<'home' | 'bulk' | 'users' | 'security' | 'database' | 'verify' | 'verification'>('bulk');
  const [dbFilter, setDbFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [settingsPage, setSettingsPage] = useState<'profile' | 'privacy'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationResult, setVerificationResult] = useState<{ valid: boolean; data?: Signature } | null>(null);
  
  // Forms
  const [loginForm, setLoginForm] = useState({ id: '', password: '' });
  const [regForm, setRegForm] = useState({ id: '', name: '', role: '', password: '' });
  const [sigForm, setSigForm] = useState({ type: '', number: '', password: '' });
  const [bulkForm, setBulkForm] = useState({ name: '', start: '', end: '', static: '' });
  const [profileForm, setProfileForm] = useState({ name: '', role: '' });
  const [changePasswordForm, setChangePasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    action: () => void;
    type: 'danger' | 'primary' | 'success';
  }>({
    show: false,
    title: '',
    message: '',
    action: () => {},
    type: 'primary'
  });
  const [verifyHash, setVerifyHash] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const isScanningRef = React.useRef(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [forgotId, setForgotId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStatus, setResetStatus] = useState<'None' | 'Requested' | 'Approved'>('None');

  const [pendingUsers, setPendingUsers] = useState<UserData[]>([]);
  const [resetRequests, setResetRequests] = useState<UserData[]>([]);

  const fetchPendingUsers = async () => {
    try {
      const data = await api.admin.getPendingUsers();
      setPendingUsers(data);
    } catch (e) {
      showToast("Gagal mengambil data pending", "error");
    }
  };

  const fetchResetRequests = async () => {
    try {
      const data = await api.admin.getResetRequests();
      setResetRequests(data);
    } catch (e) {
      showToast("Gagal mengambil data reset", "error");
    }
  };

  useEffect(() => {
    if (user?.id_karyawan.toLowerCase() === 'admin' && adminPage === 'verification') {
      fetchPendingUsers();
      fetchResetRequests();
    }
  }, [user, adminPage]);

  const handleApproveUser = async (id: string) => {
    try {
      await api.admin.approveUser(id);
      showToast("User berhasil disetujui", "success");
      fetchPendingUsers();
    } catch (e: any) {
      showToast(e.message || "Gagal menyetujui user", "error");
    }
  };

  const handleRejectUser = async (id: string) => {
    try {
      await api.admin.rejectUser(id);
      showToast("User berhasil ditolak", "success");
      fetchPendingUsers();
    } catch (e: any) {
      showToast(e.message || "Gagal menolak user", "error");
    }
  };

  const handleApproveReset = async (id: string) => {
    try {
      await api.admin.approveReset(id);
      showToast("Reset password disetujui", "success");
      fetchResetRequests();
    } catch (e: any) {
      showToast(e.message || "Gagal menyetujui reset", "error");
    }
  };

  const handleRejectReset = async (id: string) => {
    try {
      await api.admin.rejectReset(id);
      showToast("Reset password ditolak", "success");
      fetchResetRequests();
    } catch (e: any) {
      showToast(e.message || "Gagal menolak reset", "error");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const verifyParam = params.get('verify');
    if (verifyParam) {
      handleVerify(verifyParam);
      return;
    }

    const path = window.location.pathname;
    if (path.startsWith('/verify/')) {
      const hash = path.split('/')[2];
      if (hash) {
        handleVerify(hash);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSignatures();
      setProfileForm({ name: user.nama_lengkap, role: user.jabatan });
    }
  }, [user]);

  useEffect(() => {
    if (user?.id_karyawan.toLowerCase() === 'admin' && (adminPage === 'database' || dashboardPage === 'database' || dashboardPage === 'admin')) {
      fetchAllSignatures();
    } else if (user) {
      fetchSignatures();
    }
  }, [adminPage, dashboardPage, user]);

  const fetchSignatures = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/signatures/user/${user.id_karyawan}`);
      const data = await res.json();
      setSignatures(data);
    } catch (e) {
      console.error("Failed to fetch signatures", e);
    }
  };

  const fetchAllSignatures = async () => {
    if (!user || user.id_karyawan.toLowerCase() !== 'admin') return;
    try {
      const res = await fetch('/api/admin/all-signatures');
      const data = await res.json();
      setSignatures(data);
    } catch (e) {
      console.error("Failed to fetch all signatures", e);
    }
  };

  useEffect(() => {
    if (dashboardPage !== 'verify') {
      stopScanning();
    }
    return () => stopScanning();
  }, [dashboardPage]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_karyawan: loginForm.id, password: loginForm.password })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        showToast(`Selamat datang, ${data.nama_lengkap}!`, "success");
        if (loginForm.id.toLowerCase() === 'admin') {
          setView('admin');
        } else {
          setView('dashboard');
        }
      } else {
        setError(data.error || "Login gagal");
        showToast(data.error || "Login gagal", "error");
      }
    } catch (e) {
      setError("Terjadi kesalahan koneksi");
      showToast("Terjadi kesalahan koneksi ke server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotId) {
      showToast("Masukkan ID Karyawan", "error");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_karyawan: forgotId })
      });
      if (res.ok) {
        setResetStatus('Requested');
        showToast("Permintaan reset password telah dikirim ke Admin", "info");
      } else {
        const data = await res.json();
        setError(data.error);
        showToast(data.error, "error");
      }
    } catch (e) {
      setError("Gagal mengirim permintaan");
      showToast("Gagal mengirim permintaan reset", "error");
    } finally {
      setLoading(false);
    }
  };

  const checkResetStatus = async () => {
    if (!forgotId) {
      showToast("Masukkan ID Karyawan terlebih dahulu", "info");
      return;
    }
    try {
      const res = await fetch(`/api/auth/check-reset-status/${forgotId}`);
      const data = await res.json();
      setResetStatus(data.reset_status);
      if (data.reset_status === 'Approved') {
        showToast("Admin telah menyetujui reset password", "success");
      } else if (data.reset_status === 'Requested') {
        showToast("Permintaan masih menunggu persetujuan Admin", "info");
      } else {
        showToast("Belum ada permintaan reset untuk ID ini", "info");
      }
    } catch (e) {
      showToast("Gagal mengecek status reset", "error");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      showToast("Masukkan password baru", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_karyawan: forgotId, new_password: newPassword })
      });
      if (res.ok) {
        showToast("Password berhasil diperbarui! Silakan login.", "success");
        setView('login');
        setForgotId('');
        setNewPassword('');
        setResetStatus('None');
      } else {
        const data = await res.json();
        showToast(data.error, "error");
      }
    } catch (e) {
      showToast("Gagal mereset password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.id || !regForm.name || !regForm.role || !regForm.password) {
      showToast("Semua field registrasi harus diisi", "error");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_karyawan: regForm.id,
          nama_lengkap: regForm.name,
          jabatan: regForm.role,
          password: regForm.password
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Registrasi berhasil! Menunggu persetujuan Admin.", "success");
        setView('login');
      } else {
        setError(data.error || "Registrasi gagal");
        showToast(data.error || "Registrasi gagal", "error");
      }
    } catch (e) {
      setError("Terjadi kesalahan koneksi");
      showToast("Terjadi kesalahan koneksi saat registrasi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (!sigForm.type || !sigForm.number || !sigForm.password) {
      showToast("Semua field harus diisi", "error");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/signatures/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_karyawan: user.id_karyawan,
          password: sigForm.password,
          jenis_dokumen: sigForm.type,
          nomor_dokumen: sigForm.number
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSigForm({ type: '', number: '', password: '' });
        fetchSignatures();
        setDashboardPage('database');
        showToast("Tanda tangan digital berhasil dibuat!", "success");
      } else {
        setError(data.error || "Gagal membuat tanda tangan");
        showToast(data.error || "Gagal membuat tanda tangan", "error");
      }
    } catch (e) {
      setError("Terjadi kesalahan koneksi");
      showToast("Terjadi kesalahan koneksi ke server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.id_karyawan.toLowerCase() !== 'admin') return;
    
    if (!bulkForm.name || !bulkForm.start || !bulkForm.end) {
      showToast("Nama dokumen, nomor awal, dan nomor akhir harus diisi", "error");
      return;
    }

    const start = parseInt(bulkForm.start);
    const end = parseInt(bulkForm.end);

    if (isNaN(start) || isNaN(end) || start > end) {
      showToast("Range nomor tidak valid", "error");
      return;
    }

    if (end - start > 100) {
      showToast("Maksimal 100 dokumen sekaligus", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/admin/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_karyawan: user.id_karyawan,
          nama_dokumen: bulkForm.name,
          start_num: bulkForm.start,
          end_num: bulkForm.end,
          static_part: bulkForm.static
        })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Bulk_QR_${bulkForm.name.replace(/\s+/g, '_')}.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        setBulkForm({ name: '', start: '', end: '', static: '' });
        showToast("Bulk QR berhasil digenerate dan didownload!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal generate bulk QR", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan koneksi saat generate bulk QR", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (hash: string) => {
    if (!hash || hash.trim().length < 8) {
      showToast("Hash tidak valid atau terlalu pendek", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/verify/${hash}`);
      const data = await res.json();
      if (data.valid) {
        setVerificationResult({ valid: true, data: data.data });
        showToast("Verifikasi Berhasil: Dokumen Valid", "success");
      } else {
        setVerificationResult({ valid: false });
        showToast("Verifikasi Gagal: Dokumen Tidak Ditemukan", "error");
      }
    } catch (e) {
      setVerificationResult({ valid: false });
      showToast("Gagal melakukan verifikasi. Cek koneksi Anda.", "error");
    } finally {
      setLoading(false);
    }
  };

  const getHashFromQR = (data: string) => {
    const trimmedData = data.trim();
    if (trimmedData.includes('?verify=')) {
      const parts = trimmedData.split('?verify=');
      const hashPart = parts[parts.length - 1];
      return hashPart.split('&')[0].replace(/\/$/, '');
    }
    if (trimmedData.includes('/verify/')) {
      const parts = trimmedData.split('/verify/');
      const hashPart = parts[parts.length - 1];
      return hashPart.split('?')[0].split('#')[0].replace(/\/$/, '');
    }
    return trimmedData;
  };

  const processQRFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast("File harus berupa gambar (PNG, JPG, etc.)", "error");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("Ukuran file terlalu besar (maksimal 10MB)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      showToast("Gagal membaca file gambar", "error");
    };

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => {
        showToast("Gagal memproses gambar", "error");
      };

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) {
            showToast("Gagal menginisialisasi canvas pemrosesan", "error");
            return;
          }
          canvas.width = img.width;
          canvas.height = img.height;
          context.drawImage(img, 0, 0);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            const hash = getHashFromQR(code.data);
            if (hash) {
              setVerifyHash(hash);
              handleVerify(hash);
            } else {
              showToast("QR Code valid tapi tidak berisi hash verifikasi yang dikenali", "error");
            }
          } else {
            showToast("QR Code tidak terdeteksi dalam gambar. Pastikan QR Code terlihat jelas.", "error");
          }
        } catch (err) {
          console.error("QR Processing Error:", err);
          showToast("Terjadi kesalahan saat memproses QR Code", "error");
        } finally {
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUploadQR = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processQRFile(file);
  };

  const [isOverDropZone, setIsOverDropZone] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOverDropZone(false);
    
    let file: File | null = null;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      file = e.dataTransfer.files[0];
    } else if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0];
      if (item.kind === 'file') {
        file = item.getAsFile();
      }
    }

    if (file && file.type.startsWith('image/')) {
      processQRFile(file);
    }
  };

  const handlePaste = (e: ClipboardEvent) => {
    if (dashboardPage !== 'verify' && view !== 'verify') return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) processQRFile(file);
        break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [dashboardPage, view]);

  const startScanning = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Browser Anda tidak mendukung akses kamera atau tidak berada dalam konteks aman (HTTPS).");
      return;
    }

    setIsScanning(true);
    isScanningRef.current = true;
    
    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: { ideal: 'environment' } } 
        });
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.play();
        requestAnimationFrame(scanFrame);
      }
    } catch (err) {
      console.error("Camera error:", err);
      let msg = "Gagal mengakses kamera.";
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') msg = "Izin kamera ditolak. Silakan berikan izin di pengaturan browser.";
        else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') msg = "Kamera tidak ditemukan pada perangkat ini.";
        else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') msg = "Kamera sedang digunakan oleh aplikasi lain.";
        else if (err.name === 'OverconstrainedError') msg = "Kamera tidak mendukung spesifikasi yang diminta.";
      }
      alert(msg);
      setIsScanning(false);
      isScanningRef.current = false;
    }
  };

  const stopScanning = () => {
    setIsScanning(false);
    isScanningRef.current = false;
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const scanFrame = () => {
    if (!isScanningRef.current) return;
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code) {
            const hash = getHashFromQR(code.data);
            setVerifyHash(hash);
            handleVerify(hash);
            stopScanning();
            return;
          }
        }
      }
    }
    requestAnimationFrame(scanFrame);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      showToast("Konfirmasi password baru tidak cocok", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/profile/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_karyawan: user.id_karyawan,
          old_password: changePasswordForm.oldPassword,
          new_password: changePasswordForm.newPassword
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        showToast("Password berhasil diubah", "success");
        setChangePasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        showToast(data.error || "Gagal mengubah password", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan koneksi saat ubah password", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_karyawan: user.id_karyawan,
          nama_lengkap: profileForm.name,
          jabatan: profileForm.role
        })
      });
      if (res.ok) {
        setUser({ ...user, nama_lengkap: profileForm.name, jabatan: profileForm.role });
        showToast("Profil berhasil diperbarui", "success");
      } else {
        showToast("Gagal memperbarui profil", "error");
      }
    } catch (e) {
      showToast("Gagal memperbarui profil. Cek koneksi Anda.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSignature = async (id: string) => {
    if (!user) {
      showToast("Sesi berakhir, silakan login kembali", "error");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/signatures/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_karyawan: user.id_karyawan })
      });
      
      if (res.ok) {
        showToast("Data berhasil dihapus", "success");
        if (user.id_karyawan.toLowerCase() === 'admin') {
          fetchAllSignatures();
        } else {
          fetchSignatures();
        }
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal menghapus data", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan saat menghapus data", "error");
    } finally {
      setLoading(false);
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  const downloadQR = async (url: string, filename: string) => {
    try {
      const proxyUrl = `/api/proxy-qr?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) throw new Error("Gagal mengunduh file");
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      showToast("QR Code berhasil diunduh", "success");
    } catch (error) {
      showToast("Gagal mengunduh QR Code", "error");
    } finally {
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        showToast("Hash disalin ke clipboard!", "success");
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast("Hash disalin ke clipboard!", "success");
      }
    } catch (err) {
      showToast("Gagal menyalin hash", "error");
    } finally {
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  const exportToExcel = () => {
    const dataToExport = filteredSignatures.map(sig => ({
      'ID Signature': sig.signature_id,
      'ID Karyawan': sig.id_karyawan,
      'Nama Karyawan': sig.nama_karyawan,
      'Jenis Dokumen': sig.jenis_dokumen,
      'Nomor Dokumen': sig.nomor_dokumen,
      'Waktu TTD': formatDate(sig.waktu_ttd),
      'Hash Code': sig.hash_code
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Signatures");
    XLSX.writeFile(workbook, `Database_Dokumen_${user?.id_karyawan}.xlsx`);
  };

  const filteredSignatures = signatures.filter(sig => {
    const matchesSearch = 
      sig.jenis_dokumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.nomor_dokumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sig.hash_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    if (user?.id_karyawan.toLowerCase() === 'admin') {
      if (dbFilter === 'admin') return sig.id_karyawan.toLowerCase() === 'admin';
      if (dbFilter === 'user') return sig.id_karyawan.toLowerCase() !== 'admin';
    }
    
    return true;
  });

  const handleEmergencyReset = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/emergency-reset-admin', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        showToast("Emergency reset berhasil! Password admin kembali ke default.", "success");
      } else {
        showToast(data.error || "Gagal melakukan emergency reset", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/clear-database', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_karyawan: user?.id_karyawan })
      });
      if (res.ok) {
        showToast("Database berhasil dikosongkan", "success");
        fetchAllSignatures();
      } else {
        const data = await res.json();
        showToast(data.error || "Gagal mengosongkan database", "error");
      }
    } catch (e) {
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setLoading(false);
      setConfirmModal({ ...confirmModal, show: false });
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('login');
    setDashboardPage('home');
    setVerificationResult(null);
    window.history.pushState({}, '', '/');
    setConfirmModal({ ...confirmModal, show: false });
  };

  const confirmAction = (title: string, message: string, type: 'danger' | 'success' | 'info', action: () => void) => {
    setConfirmModal({
      show: true,
      title,
      message,
      type,
      action
    });
  };

  if (view === 'login') {
    return (
      <LoginView 
        form={loginForm}
        setForm={setLoginForm}
        onSubmit={handleLogin}
        onSwitchRegister={() => setView('register')}
        onSwitchForgotPassword={() => setView('forgot-password')}
        onSwitchVerify={() => setView('verify')}
        loading={loading}
        error={error}
      />
    );
  }

  if (view === 'register') {
    return (
      <RegisterView 
        form={regForm}
        setForm={setRegForm}
        onSubmit={handleRegister}
        onSwitchLogin={() => setView('login')}
        loading={loading}
        error={error}
      />
    );
  }

  if (view === 'verify') {
    return (
      <VerifyView 
        verifyHash={verifyHash}
        setVerifyHash={setVerifyHash}
        onVerify={handleVerify}
        verificationResult={verificationResult}
        setVerificationResult={setVerificationResult}
        loading={loading}
        onSwitchLogin={() => setView('login')}
        isOverDropZone={isOverDropZone}
        setIsOverDropZone={setIsOverDropZone}
        onDrop={handleDrop}
        handleUploadQR={handleUploadQR}
        fileInputRef={fileInputRef}
        isScanning={isScanning}
        stopScanning={stopScanning}
        startScanning={startScanning}
        videoRef={videoRef}
        canvasRef={canvasRef}
      />
    );
  }

  if (view === 'forgot-password') {
    return (
      <ForgotPasswordView 
        forgotId={forgotId}
        setForgotId={setForgotId}
        newPassword={newPassword}
        setNewPassword={setNewPassword}
        resetStatus={resetStatus}
        onForgotSubmit={handleForgotPassword}
        onResetSubmit={handleResetPassword}
        onCheckStatus={checkResetStatus}
        onSwitchLogin={() => setView('login')}
        loading={loading}
        error={error}
      />
    );
  }

  if (view === 'admin') {
    return (
      <>
        <div className="min-h-screen bg-gray-50">
          <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setAdminPage('bulk')}>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <Shield size={24} />
              </div>
              <div className="hidden sm:block">
                <h1 className="font-bold text-lg text-gray-900 leading-tight">Admin Panel</h1>
                <p className="text-xs text-gray-500">PT. NNI System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => confirmAction(
                'Keluar dari Akun?',
                'Apakah Anda yakin ingin keluar dari sistem?',
                'danger',
                handleLogout
              )} className="flex gap-2 text-red-500 hover:bg-red-50 hover:text-red-600">
                <LogOut size={18} /> <span className="hidden sm:inline">Keluar</span>
              </Button>
            </div>
          </nav>

          <main className="max-w-6xl mx-auto p-6">
            <AdminPanel 
              adminPage={adminPage}
              setAdminPage={setAdminPage}
              pendingUsers={pendingUsers}
              resetRequests={resetRequests}
              onApproveUser={handleApproveUser}
              onRejectUser={handleRejectUser}
              onApproveReset={handleApproveReset}
              onRejectReset={handleRejectReset}
              bulkForm={bulkForm}
              setBulkForm={setBulkForm}
              onBulkGenerate={handleBulkGenerate}
              loading={loading}
              onEmergencyReset={() => confirmAction(
                'Jalankan Emergency Reset?',
                'Apakah Anda yakin ingin mereset password admin ke default?',
                'danger',
                handleEmergencyReset
              )}
              onClearDatabase={() => setConfirmModal({
                show: true,
                title: 'Hapus Seluruh Database?',
                message: 'Apakah Anda yakin ingin menghapus seluruh database signature? Tindakan ini tidak dapat dibatalkan.',
                type: 'danger',
                action: handleClearDatabase
              })}
              onBack={() => {
                setView('dashboard');
                setDashboardPage('home');
              }}
              signatures={filteredSignatures}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onDeleteSignature={(id) => confirmAction(
                'Hapus Validasi?',
                'Apakah Anda yakin ingin menghapus data tanda tangan ini?',
                'danger',
                () => handleDeleteSignature(id)
              )}
              onCopyHash={(hash) => confirmAction(
                'Salin Hash?',
                'Salin kode hash dokumen ini ke clipboard?',
                'info',
                () => copyToClipboard(hash)
              )}
              onDownloadQR={(url, filename) => confirmAction(
                'Download QR Code?',
                'Unduh gambar QR Code untuk dokumen ini?',
                'success',
                () => downloadQR(url, filename)
              )}
            />
          </main>
        </div>
        <AnimatePresence>
          {confirmModal.show && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto",
                  confirmModal.type === 'danger' ? "bg-red-50 text-red-600" : 
                  confirmModal.type === 'success' ? "bg-emerald-50 text-emerald-600" : 
                  "bg-indigo-50 text-indigo-600"
                )}>
                  {confirmModal.type === 'danger' ? <XCircle size={32} /> : 
                   confirmModal.type === 'success' ? <Download size={32} /> : 
                   <FileText size={32} />}
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{confirmModal.title}</h3>
                <p className="text-gray-500 text-center mb-8">{confirmModal.message}</p>
                <div className="flex gap-3">
                  <button 
                    className="flex-1 py-4 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                    disabled={loading}
                  >
                    Batal
                  </button>
                  <button 
                    className={cn(
                      "flex-1 py-4 px-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95",
                      confirmModal.type === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-100" : 
                      confirmModal.type === 'success' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : 
                      "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                    )}
                    onClick={confirmModal.action}
                    disabled={loading}
                  >
                    {loading ? 'Memproses...' : 'Ya, Lanjutkan'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {confirmModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100"
            >
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto",
                confirmModal.type === 'danger' ? "bg-red-50 text-red-600" : 
                confirmModal.type === 'success' ? "bg-emerald-50 text-emerald-600" : 
                "bg-indigo-50 text-indigo-600"
              )}>
                {confirmModal.type === 'danger' ? <XCircle size={32} /> : 
                 confirmModal.type === 'success' ? <Download size={32} /> : 
                 <FileText size={32} />}
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">{confirmModal.title}</h3>
              <p className="text-gray-500 text-center mb-8">{confirmModal.message}</p>
              <div className="flex gap-3">
                <button 
                  className="flex-1 py-4 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                  onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                  disabled={loading}
                >
                  Batal
                </button>
                <button 
                  className={cn(
                    "flex-1 py-4 px-4 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95",
                    confirmModal.type === 'danger' ? "bg-red-600 hover:bg-red-700 shadow-red-100" : 
                    confirmModal.type === 'success' ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : 
                    "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                  )}
                  onClick={confirmModal.action}
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : 'Ya, Lanjutkan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setDashboardPage('home')}>
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-bold text-lg text-gray-900 leading-tight">E-Signature</h1>
            <p className="text-xs text-gray-500">PT. NNI System</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-6 mr-6">
            {[
              { id: 'home', label: 'Beranda' },
              { id: 'sign', label: 'Tanda Tangan' },
              { id: 'database', label: 'Database' },
              { id: 'verify', label: 'Validasi' },
              { id: 'settings', label: 'Pengaturan' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setDashboardPage(item.id as any)}
                className={cn(
                  "text-sm font-bold transition-colors flex items-center gap-1",
                  dashboardPage === item.id ? "text-indigo-600" : "text-gray-400 hover:text-gray-600"
                )}
              >
                {item.id === 'settings' && <Settings size={14} />}
                {item.label}
              </button>
            ))}
          </div>
          <Button variant="ghost" onClick={() => confirmAction(
            'Keluar dari Akun?',
            'Apakah Anda yakin ingin keluar dari sistem?',
            'danger',
            handleLogout
          )} className="flex gap-2 text-red-500 hover:bg-red-50 hover:text-red-600">
            <LogOut size={18} /> <span className="hidden sm:inline">Keluar</span>
          </Button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={dashboardPage}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {dashboardPage === 'home' && (
              <HomePage 
                user={user} 
                signatures={signatures} 
                setDashboardPage={setDashboardPage} 
              />
            )}
            {dashboardPage === 'sign' && (
              <SignPage 
                form={sigForm}
                setForm={setSigForm}
                onSubmit={handleCreateSignature}
                onBack={() => setDashboardPage('home')}
                loading={loading}
                error={error}
              />
            )}
            {dashboardPage === 'database' && (
              <DatabasePage 
                signatures={filteredSignatures}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                dbFilter={dbFilter}
                setDbFilter={setDbFilter}
                user={user}
                onExport={exportToExcel}
                onDelete={(id) => confirmAction(
                  'Hapus Validasi?',
                  'Apakah Anda yakin ingin menghapus data tanda tangan ini?',
                  'danger',
                  () => handleDeleteSignature(id)
                )}
                onCopy={(hash) => confirmAction(
                  'Salin Hash?',
                  'Salin kode hash dokumen ini ke clipboard?',
                  'info',
                  () => copyToClipboard(hash)
                )}
                onDownload={(url, filename) => confirmAction(
                  'Download QR Code?',
                  'Unduh gambar QR Code untuk dokumen ini?',
                  'success',
                  () => downloadQR(url, filename)
                )}
                onBack={() => setDashboardPage('home')}
              />
            )}
            {dashboardPage === 'verify' && (
              <VerifyView 
                verifyHash={verifyHash}
                setVerifyHash={setVerifyHash}
                onVerify={handleVerify}
                verificationResult={verificationResult}
                setVerificationResult={setVerificationResult}
                loading={loading}
                onSwitchLogin={() => setDashboardPage('home')}
                isOverDropZone={isOverDropZone}
                setIsOverDropZone={setIsOverDropZone}
                onDrop={handleDrop}
                handleUploadQR={handleUploadQR}
                fileInputRef={fileInputRef}
                isScanning={isScanning}
                stopScanning={stopScanning}
                startScanning={startScanning}
                videoRef={videoRef}
                canvasRef={canvasRef}
              />
            )}
            {dashboardPage === 'settings' && (
              <SettingsPage 
                settingsPage={settingsPage}
                setSettingsPage={setSettingsPage}
                user={user}
                profileForm={profileForm}
                setProfileForm={setProfileForm}
                onUpdateProfile={handleUpdateProfile}
                changePasswordForm={changePasswordForm}
                setChangePasswordForm={setChangePasswordForm}
                onChangePassword={handleChangePassword}
                loading={loading}
                onBack={() => setDashboardPage('home')}
              />
            )}
            {/* ✅ DITAMBAHKAN: Handler untuk Admin Control Center dari dashboard */}
            {dashboardPage === 'admin' && (
              <AdminPanel 
                adminPage={adminPage}
                setAdminPage={setAdminPage}
                pendingUsers={pendingUsers}
                resetRequests={resetRequests}
                onApproveUser={handleApproveUser}
                onRejectUser={handleRejectUser}
                onApproveReset={handleApproveReset}
                onRejectReset={handleRejectReset}
                bulkForm={bulkForm}
                setBulkForm={setBulkForm}
                onBulkGenerate={handleBulkGenerate}
                loading={loading}
                onEmergencyReset={() => confirmAction(
                  'Jalankan Emergency Reset?',
                  'Apakah Anda yakin ingin mereset password admin ke default?',
                  'danger',
                  handleEmergencyReset
                )}
                onClearDatabase={() => setConfirmModal({
                  show: true,
                  title: 'Hapus Seluruh Database?',
                  message: 'Apakah Anda yakin ingin menghapus seluruh database signature? Tindakan ini tidak dapat dibatalkan.',
                  type: 'danger',
                  action: handleClearDatabase
                })}
                onBack={() => setDashboardPage('home')}
                signatures={filteredSignatures}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onDeleteSignature={(id) => confirmAction(
                  'Hapus Validasi?',
                  'Apakah Anda yakin ingin menghapus data tanda tangan ini?',
                  'danger',
                  () => handleDeleteSignature(id)
                )}
                onCopyHash={(hash) => confirmAction(
                  'Salin Hash?',
                  'Salin kode hash dokumen ini ke clipboard?',
                  'info',
                  () => copyToClipboard(hash)
                )}
                onDownloadQR={(url, filename) => confirmAction(
                  'Download QR Code?',
                  'Unduh gambar QR Code untuk dokumen ini?',
                  'success',
                  () => downloadQR(url, filename)
                )}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

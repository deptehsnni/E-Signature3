import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ChevronRight, Search, Upload, Camera, X } from 'lucide-react';
import { Card } from './Card';
import { Input } from './Input';
import { Button } from './Button';
import { VerificationResultDisplay } from './VerificationResultDisplay';
import { cn } from '../lib/utils';
import { Signature } from '../types';

interface VerifyViewProps {
  verifyHash: string;
  setVerifyHash: (h: string) => void;
  onVerify: (h: string) => void;
  loading: boolean;
  verificationResult: { valid: boolean; data?: Signature } | null;
  setVerificationResult: (r: any) => void;
  isScanning: boolean;
  stopScanning: () => void;
  startScanning: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleUploadQR: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDrop: (e: React.DragEvent) => void;
  isOverDropZone: boolean;
  setIsOverDropZone: (v: boolean) => void;
  onSwitchLogin: () => void;
}

export const VerifyView = ({
  verifyHash,
  setVerifyHash,
  onVerify,
  loading,
  verificationResult,
  setVerificationResult,
  isScanning,
  stopScanning,
  startScanning,
  videoRef,
  canvasRef,
  fileInputRef,
  handleUploadQR,
  onDrop,
  isOverDropZone,
  setIsOverDropZone,
  onSwitchLogin
}: VerifyViewProps) => (
  <div className="min-h-screen bg-[#f8fafc] relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600 pointer-events-none">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f8fafc] to-transparent"></div>
    </div>

    <div className="relative z-10 max-w-3xl mx-auto px-6 pt-12 pb-24">
      <div className="flex flex-col items-center text-center mb-12">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-16 h-16 rounded-2xl bg-white shadow-xl flex items-center justify-center text-indigo-600 mb-6"
        >
          <ShieldCheck size={32} />
        </motion.div>
        <motion.h1 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-black text-white md:text-gray-900 tracking-tight"
        >
          E-Signature Validator
        </motion.h1>
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-indigo-100 md:text-gray-500 mt-2 font-medium"
        >
          Sistem Verifikasi Keaslian Dokumen Digital
        </motion.p>
      </div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card 
          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsOverDropZone(true); }}
          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsOverDropZone(true); }}
          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsOverDropZone(false); }}
          onDrop={onDrop}
          className={cn(
            "p-1 md:p-2 bg-white/80 backdrop-blur-xl border-white shadow-2xl rounded-[2.5rem] transition-all duration-300",
            isOverDropZone && "ring-4 ring-indigo-500/30 border-indigo-500 bg-indigo-50/50 scale-[1.02]"
          )}
        >
          <div className="p-6 md:p-8">
            {loading && !verificationResult ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                    <ShieldCheck size={24} className="animate-pulse" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900">Memverifikasi Dokumen</h3>
                  <p className="text-sm text-gray-500 mt-1">Menghubungkan ke database keamanan...</p>
                </div>
              </div>
            ) : !verificationResult ? (
              <div className="space-y-8">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900">Cek Validitas</h2>
                  <p className="text-sm text-gray-500 mt-1">Masukkan kode hash SHA-256 dokumen Anda</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                      <Search size={18} />
                    </div>
                    <Input 
                      placeholder="Tempel kode hash di sini..."
                      value={verifyHash}
                      onChange={e => setVerifyHash(e.target.value)}
                      className="pl-12 py-7 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white transition-all text-base"
                    />
                  </div>
                  <Button 
                    onClick={() => onVerify(verifyHash)} 
                    disabled={loading || !verifyHash} 
                    className="px-10 py-7 rounded-2xl shadow-lg shadow-indigo-100 font-bold text-base"
                  >
                    {loading ? 'Mengecek...' : 'Verifikasi'}
                  </Button>
                </div>

                <AnimatePresence>
                  {isScanning && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="relative rounded-3xl overflow-hidden bg-black aspect-video">
                        <video ref={videoRef} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 border-2 border-indigo-500/50 flex items-center justify-center pointer-events-none">
                          <div className="w-48 h-48 border-2 border-white rounded-2xl shadow-[0_0_0_1000px_rgba(0,0,0,0.5)]"></div>
                        </div>
                        <Button 
                          variant="ghost" 
                          className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70 rounded-full w-10 h-10 p-0"
                          onClick={stopScanning}
                        >
                          <X size={20} />
                        </Button>
                        <div className="absolute bottom-4 left-0 right-0 text-center">
                          <span className="bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                            Arahkan kamera ke QR Code
                          </span>
                        </div>
                      </div>
                      <canvas ref={canvasRef} className="hidden" />
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <div className="pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
                  <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Atau Scan QR Code</p>
                  <div className="flex gap-4">
                    <Button variant="secondary" className="rounded-xl px-6" onClick={() => fileInputRef.current?.click()}>
                      <Upload size={18} className="mr-2" /> Upload Gambar
                    </Button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadQR} />
                    <Button variant="secondary" className="rounded-xl px-6" onClick={isScanning ? stopScanning : startScanning}>
                      <Camera size={18} className="mr-2" /> {isScanning ? 'Stop Kamera' : 'Buka Kamera'}
                    </Button>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium">
                    Tips: <span className="font-bold">Drag & Drop</span> gambar ke sini atau <span className="font-bold">Paste (Ctrl+V)</span>
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <VerificationResultDisplay 
                  result={verificationResult} 
                  onClear={() => {
                    setVerificationResult(null);
                    setVerifyHash('');
                  }} 
                />
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      <div className="mt-12 text-center">
        <button 
          onClick={onSwitchLogin} 
          className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-indigo-600 transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-indigo-50 transition-all">
            <ChevronRight size={16} className="rotate-180" />
          </div>
          Kembali ke Halaman Login
        </button>
      </div>
    </div>
    
    <div className="absolute bottom-8 left-0 right-0 text-center">
      <p className="text-[10px] text-gray-400 font-medium uppercase tracking-[0.2em]">
        &copy; 2024 E-Signature Security Protocol &bull; SHA-256 Encrypted
      </p>
    </div>
  </div>
);

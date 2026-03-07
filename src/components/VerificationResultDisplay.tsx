import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  User, 
  IdCard, 
  FileText, 
  Lock, 
  History, 
  Download 
} from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './Button';
import { Signature } from '../types';
import { formatDate } from '../lib/utils';

export const VerificationResultDisplay = ({ result, onClear }: { result: { valid: boolean; data?: Signature }; onClear?: () => void }) => {
  if (!result.valid) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-3xl p-8 text-center shadow-sm">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 text-red-500 mb-4">
          <XCircle size={48} />
        </div>
        <h3 className="text-xl font-bold text-red-700 uppercase tracking-tight">Data Tidak Valid</h3>
        <p className="text-sm text-red-600 mt-2 max-w-xs mx-auto">
          Hash tidak ditemukan dalam database kami atau data dokumen telah dimodifikasi secara ilegal.
        </p>
        {onClear && (
          <Button variant="ghost" className="mt-6 text-red-600 hover:bg-red-100" onClick={onClear}>
            Coba Lagi
          </Button>
        )}
      </div>
    );
  }

  const { data } = result;
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Silakan izinkan popup untuk mencetak sertifikat.");
      return;
    }

    const styles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('');
        } catch (e) {
          return '';
        }
      })
      .join('');

    const content = document.getElementById('certificate-to-print');
    if (!content) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Sertifikat Digital - ${data?.nomor_dokumen}</title>
          <style>
            ${styles}
            body { background: white !important; padding: 40px !important; }
            .no-print { display: none !important; }
            .certificate-card { 
              box-shadow: none !important; 
              border: 2px solid #e2e8f0 !important;
              max-width: 800px;
              margin: 0 auto;
              background: white !important;
            }
          </style>
        </head>
        <body>
          <div class="certificate-card bg-white border-2 border-emerald-500/20 rounded-[2rem] p-8 overflow-hidden relative">
            ${content.innerHTML}
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="relative">
      <div id="certificate-to-print" className="bg-white border-2 border-emerald-500/20 rounded-[2rem] p-8 shadow-2xl shadow-emerald-500/5 overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-gray-100">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                <CheckCircle2 size={48} />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md">
                <ShieldCheck size={24} className="text-indigo-600" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-2">
                Dokumen Otentik
              </div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight">TERVERIFIKASI</h3>
              <p className="text-gray-500 text-sm">Dokumen ini sah dan terdaftar secara resmi</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <User size={12} className="text-indigo-500" /> Penandatangan
              </label>
              <p className="text-lg font-bold text-gray-900 leading-tight">{data?.nama_karyawan}</p>
              <p className="text-sm text-gray-500 font-medium">{data?.jabatan}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <IdCard size={12} className="text-indigo-500" /> ID Karyawan
              </label>
              <p className="text-lg font-bold text-gray-900 leading-tight">{data?.id_karyawan}</p>
              <p className="text-xs text-gray-500 font-medium">Identitas Terverifikasi</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={12} className="text-indigo-500" /> Jenis Dokumen
              </label>
              <p className="text-lg font-bold text-gray-900 leading-tight">{data?.jenis_dokumen}</p>
              <p className="text-xs text-gray-500 font-medium">Rekaman Resmi</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock size={12} className="text-indigo-500" /> Nomor Dokumen
              </label>
              <p className="text-base font-bold text-gray-900 font-mono tracking-tight">{data?.nomor_dokumen}</p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <History size={12} className="text-indigo-500" /> Tanggal TTD
              </label>
              <p className="text-base font-bold text-gray-900">{formatDate(data?.waktu_ttd || '')}</p>
            </div>

            <div className="md:col-span-2 pt-4">
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Sidik Jari Digital SHA-256</label>
                <p className="text-[10px] font-mono text-gray-500 break-all bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                  {data?.hash_code ? `${data.hash_code.slice(0, -3)}***` : ''}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 no-print">
            <Button className="flex-1 py-6 rounded-2xl shadow-lg shadow-indigo-100" onClick={handlePrint}>
              <Download size={18} className="mr-2" /> Cetak Sertifikat
            </Button>
            {onClear && (
              <Button variant="ghost" className="flex-1 py-6 rounded-2xl hover:bg-gray-100" onClick={onClear}>
                Verifikasi Lainnya
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <div className="absolute -bottom-6 -right-6 w-32 h-32 opacity-10 pointer-events-none rotate-12">
        <ShieldCheck size={128} />
      </div>
    </div>
  );
};

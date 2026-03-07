export interface UserData {
  id_karyawan: string;
  nama_lengkap: string;
  jabatan: string;
  status: string;
}

export interface Signature {
  signature_id: string;
  id_karyawan: string;
  nama_karyawan: string;
  jenis_dokumen: string;
  nomor_dokumen: string;
  waktu_ttd: string;
  hash_code: string;
  qr_link: string;
  jabatan?: string;
}

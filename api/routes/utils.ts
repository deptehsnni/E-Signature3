import crypto from "crypto";

/**
 * SECRET_SALT digunakan untuk memperkuat keamanan hash password.
 * Penting: Jika nilai ini berubah di Environment Variables Vercel, 
 * password lama di database tidak akan bisa digunakan lagi.
 */
export const SECRET_SALT: string = process.env.SECRET_SALT || "EHS_PT_NNI";

/**
 * Fungsi untuk melakukan hashing password menggunakan algoritma SHA-256.
 * Digunakan untuk keamanan akun dan verifikasi integritas dokumen K3.
 * @param password - String mentah yang akan di-hash
 * @returns string - Hasil hash format hexadecimal
 */
export function hashPassword(password: string): string {
  if (!password) return "";
  return crypto
    .createHash('sha256')
    .update(password + SECRET_SALT)
    .digest('hex');
}

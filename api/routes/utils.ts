import crypto from "crypto";

/**
 * SECRET_SALT digunakan untuk memperkuat keamanan hash password.
 * Di produksi, pastikan Anda menambahkan SECRET_SALT di Environment Variables Vercel.
 */
export const SECRET_SALT: string = process.env.SECRET_SALT || "EHS_PT_NNI";

/**
 * Fungsi untuk melakukan hashing password menggunakan algoritma SHA-256.
 * @param password - Password mentah dari input user
 * @returns string - Hasil hash dalam format hexadecimal
 */
export function hashPassword(password: string): string {
  if (!password) return "";
  return crypto
    .createHash('sha256')
    .update(password + SECRET_SALT)
    .digest('hex');
}

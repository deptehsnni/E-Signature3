import crypto from "crypto";

export const SECRET_SALT = process.env.SECRET_SALT || "EHS_PT_NNI";

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + SECRET_SALT).digest('hex');
}

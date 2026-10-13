import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";

const PASSWORD_MIN = 10;

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function passwordIssue(password: string) {
  if (password.length < PASSWORD_MIN) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`;
  }
  if (!/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/.test(password) || !/\d/.test(password)) {
    return "Incluye al menos una letra y un número.";
  }
  return null;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function randomToken() {
  return randomBytes(24).toString("base64url");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

export function secretsEqual(a: string, b: string) {
  if (!a || !b) return false;
  const left = sha256(a);
  const right = sha256(b);
  return timingSafeEqual(left, right);
}

export function newId() {
  return randomBytes(12).toString("hex");
}

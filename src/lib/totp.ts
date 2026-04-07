import { TOTP, Secret } from 'otpauth';
import QRCode from 'qrcode';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ISSUER = 'SIGEP';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const hex = process.env.TOTP_ENCRYPTION_KEY;
  if (!hex || hex.length !== 64) {
    throw new Error(
      'TOTP_ENCRYPTION_KEY debe ser una cadena hexadecimal de 64 caracteres (32 bytes)'
    );
  }
  return Buffer.from(hex, 'hex');
}

// ============================================
// Cifrado / descifrado de secretos TOTP
// ============================================

export function encryptSecret(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  // formato: iv:authTag:ciphertext (todo en hex)
  return [
    iv.toString('hex'),
    authTag.toString('hex'),
    encrypted.toString('hex'),
  ].join(':');
}

export function decryptSecret(ciphertext: string): string {
  const key = getEncryptionKey();
  const parts = ciphertext.split(':');
  if (parts.length !== 3) {
    throw new Error('Formato de secreto cifrado inválido');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = Buffer.from(parts[2], 'hex');

  if (iv.length !== IV_LENGTH || authTag.length !== AUTH_TAG_LENGTH) {
    throw new Error('Datos de cifrado corruptos');
  }

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

// ============================================
// Generación y verificación TOTP
// ============================================

export function generateTotpSecret(username: string) {
  const secret = new Secret({ size: 20 });

  const totp = new TOTP({
    issuer: ISSUER,
    label: username,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });

  return {
    secret: secret.base32,
    uri: totp.toString(),
  };
}

export async function generateQrDataUrl(otpauthUri: string): Promise<string> {
  return QRCode.toDataURL(otpauthUri, {
    width: 256,
    margin: 2,
    color: { dark: '#1e3a5f', light: '#ffffff' },
  });
}

export function verifyTotpCode(base32Secret: string, code: string): boolean {
  const totp = new TOTP({
    issuer: ISSUER,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: Secret.fromBase32(base32Secret),
  });

  // delta=null means invalid; window=1 allows +/- 1 period (30 seconds)
  const delta = totp.validate({ token: code, window: 1 });
  return delta !== null;
}

// ============================================
// Rate limiting en memoria para verificación TOTP
// ============================================

interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 5 * 60 * 1000; // 5 minutos

export function checkTotpRateLimit(key: string): {
  allowed: boolean;
  remaining: number;
} {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { attempts: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1 };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0 };
  }

  entry.attempts += 1;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.attempts };
}

export function resetTotpRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

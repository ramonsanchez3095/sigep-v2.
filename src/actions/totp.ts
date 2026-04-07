'use server';

import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth, signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import {
  generateTotpSecret,
  generateQrDataUrl,
  verifyTotpCode,
  encryptSecret,
  decryptSecret,
  checkTotpRateLimit,
  resetTotpRateLimit,
} from '@/lib/totp';
import {
  totpCodeSchema,
  verifyTotpLoginSchema,
  parseOrThrow,
} from '@/lib/action-schemas';
import { revalidatePath } from 'next/cache';

// ============================================
// Configuración inicial de 2FA (usuario autenticado sin 2FA)
// ============================================

export async function initTotpSetup() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('No autenticado');

  const [user] = await db
    .select({ totpEnabled: usuarios.totpEnabled })
    .from(usuarios)
    .where(eq(usuarios.id, session.user.id))
    .limit(1);

  if (!user) throw new Error('Usuario no encontrado');
  if (user.totpEnabled) throw new Error('2FA ya está configurado');

  const { secret, uri } = generateTotpSecret(session.user.username);
  const qrDataUrl = await generateQrDataUrl(uri);

  // Guardar secreto cifrado en BD (aún no activado)
  const encrypted = encryptSecret(secret);
  await db
    .update(usuarios)
    .set({ totpSecret: encrypted, updatedAt: new Date() })
    .where(eq(usuarios.id, session.user.id));

  return { qrDataUrl, manualKey: secret };
}

export async function confirmTotpSetup(code: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('No autenticado');

  const parsed = parseOrThrow(totpCodeSchema, code);

  const rateLimit = checkTotpRateLimit(`setup:${session.user.id}`);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'Demasiados intentos. Espere 5 minutos.',
    };
  }

  const [user] = await db
    .select({ totpSecret: usuarios.totpSecret, totpEnabled: usuarios.totpEnabled })
    .from(usuarios)
    .where(eq(usuarios.id, session.user.id))
    .limit(1);

  if (!user || !user.totpSecret) {
    return { success: false, error: 'Primero debe generar el código QR' };
  }
  if (user.totpEnabled) {
    return { success: false, error: '2FA ya está configurado' };
  }

  const secret = decryptSecret(user.totpSecret);
  const valid = verifyTotpCode(secret, parsed);

  if (!valid) {
    return {
      success: false,
      error: `Código incorrecto. Intentos restantes: ${rateLimit.remaining}`,
    };
  }

  // Activar 2FA
  await db
    .update(usuarios)
    .set({ totpEnabled: true, updatedAt: new Date() })
    .where(eq(usuarios.id, session.user.id));

  resetTotpRateLimit(`setup:${session.user.id}`);

  return { success: true };
}

// ============================================
// Verificación TOTP durante login
// ============================================

export async function verifyTotpLogin(
  userId: string,
  code: string,
  username: string,
  password: string
) {
  const parsed = parseOrThrow(verifyTotpLoginSchema, { userId, code });

  const rateLimit = checkTotpRateLimit(`login:${parsed.userId}`);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'Demasiados intentos. Espere 5 minutos.',
    };
  }

  const [user] = await db
    .select({
      totpSecret: usuarios.totpSecret,
      totpEnabled: usuarios.totpEnabled,
    })
    .from(usuarios)
    .where(eq(usuarios.id, parsed.userId))
    .limit(1);

  if (!user || !user.totpSecret || !user.totpEnabled) {
    return { success: false, error: 'Configuración 2FA no encontrada' };
  }

  const secret = decryptSecret(user.totpSecret);
  const valid = verifyTotpCode(secret, parsed.code);

  if (!valid) {
    return {
      success: false,
      error: `Código incorrecto. Intentos restantes: ${rateLimit.remaining}`,
    };
  }

  resetTotpRateLimit(`login:${parsed.userId}`);

  // Código válido: crear sesión
  try {
    await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Error al iniciar sesión' };
    }
    throw error;
  }
}

// ============================================
// Reset de 2FA por admin
// ============================================

export async function resetTotpUsuario(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id || session.user.rol !== 'ADMIN') {
    throw new Error('Sin permisos');
  }

  const parsed = parseOrThrow(
    verifyTotpLoginSchema.shape.userId,
    targetUserId
  );

  const [target] = await db
    .select({ id: usuarios.id })
    .from(usuarios)
    .where(eq(usuarios.id, parsed))
    .limit(1);

  if (!target) throw new Error('Usuario no encontrado');

  await db
    .update(usuarios)
    .set({ totpSecret: null, totpEnabled: false, updatedAt: new Date() })
    .where(eq(usuarios.id, parsed));

  revalidatePath('/configuracion');
}

'use server';

import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth, signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';
import bcrypt from 'bcryptjs';
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
  loginActionSchema,
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

  // Si no podemos actualizar el JWT de NextAuth de forma segura en una 
  // server action (puede fallar), lo más seguro es forzar el logout 
  // para que vuelva a iniciar sesión con 2FA habilitado.
  // Pero NextAuth v5 permite auth() o update(). Vamos a importar `update` si podemos.
  // En su defecto, indicamos éxito y el cliente mostrará un mensaje.
  return { success: true, requireRelogin: true };
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
// Recuperación local visible de 2FA
// ============================================

export async function recoverTotpAccess(username: string, password: string) {
  const recoveryAllowed =
    process.env.NODE_ENV !== 'production' ||
    process.env.ENABLE_TOTP_LOCAL_RECOVERY === 'true';

  if (!recoveryAllowed) {
    return {
      success: false as const,
      error: 'La recuperación visible de 2FA no está habilitada en este entorno.',
    };
  }

  const parsed = parseOrThrow(loginActionSchema, { username, password });

  const [user] = await db
    .select({
      id: usuarios.id,
      activo: usuarios.activo,
      passwordHash: usuarios.passwordHash,
      totpEnabled: usuarios.totpEnabled,
    })
    .from(usuarios)
    .where(eq(usuarios.username, parsed.username))
    .limit(1);

  if (!user || !user.activo) {
    return {
      success: false as const,
      error: 'Usuario o contraseña incorrectos.',
    };
  }

  const passwordMatch = await bcrypt.compare(parsed.password, user.passwordHash);
  if (!passwordMatch) {
    return {
      success: false as const,
      error: 'Usuario o contraseña incorrectos.',
    };
  }

  await db
    .update(usuarios)
    .set({
      totpEnabled: false,
      totpSecret: null,
      updatedAt: new Date(),
    })
    .where(eq(usuarios.id, user.id));

  resetTotpRateLimit(`login:${user.id}`);
  resetTotpRateLimit(`setup:${user.id}`);

  try {
    await signIn('credentials', {
      username: parsed.username,
      password: parsed.password,
      redirect: false,
    });

    return {
      success: true as const,
      redirectTo: '/configurar-2fa',
    };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false as const,
        error: 'No se pudo restablecer la sesión luego de recuperar el 2FA.',
      };
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

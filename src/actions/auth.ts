'use server';

import { signIn } from '@/lib/auth';
import { loginActionSchema } from '../lib/action-schemas';
import { AuthError } from 'next-auth';
import { db } from '@/db';
import { usuarios } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function loginAction(username: string, password: string) {
  const parsed = loginActionSchema.safeParse({ username, password });

  if (!parsed.success) {
    return {
      success: false as const,
      error: parsed.error.issues[0]?.message ?? 'Datos inválidos',
    };
  }

  // Verificar credenciales manualmente primero para detectar si requiere 2FA
  const [user] = await db
    .select({
      id: usuarios.id,
      passwordHash: usuarios.passwordHash,
      activo: usuarios.activo,
      totpEnabled: usuarios.totpEnabled,
    })
    .from(usuarios)
    .where(eq(usuarios.username, parsed.data.username))
    .limit(1);

  if (!user || !user.activo) {
    return { success: false as const, error: 'Usuario o contraseña incorrectos' };
  }

  const passwordMatch = await bcrypt.compare(
    parsed.data.password,
    user.passwordHash
  );
  if (!passwordMatch) {
    return { success: false as const, error: 'Usuario o contraseña incorrectos' };
  }

  // Si tiene 2FA habilitado, NO crear sesión todavía — pedir código TOTP
  if (user.totpEnabled) {
    return {
      success: false as const,
      requires2fa: true,
      userId: user.id,
    };
  }

  // Sin 2FA configurado: crear sesión normalmente
  try {
    await signIn('credentials', {
      username: parsed.data.username,
      password: parsed.data.password,
      redirect: false,
    });
    return { success: true as const, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false as const, error: 'Usuario o contraseña incorrectos' };
    }
    throw error;
  }
}

'use server';

import { signIn } from '@/lib/auth';
import { AuthError } from 'next-auth';

export async function loginAction(username: string, password: string) {
  try {
    await signIn('credentials', {
      username,
      password,
      redirect: false,
    });
    return { success: true, error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: 'Usuario o contraseña incorrectos' };
    }
    throw error;
  }
}

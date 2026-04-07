import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getAuthRedirectPath } from '@/lib/auth-utils';

const SETUP_2FA_PATH = '/configurar-2fa';

// Usa getToken (ligero, compatible con edge runtime) en lugar de auth
// para evitar importar bcryptjs/pg que requieren Node.js crypto
export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  const redirectPath = getAuthRedirectPath(pathname, !!token);

  if (!redirectPath) {
    // Usuario autenticado en ruta protegida: verificar si necesita configurar 2FA
    if (token && !token.totpEnabled && pathname !== SETUP_2FA_PATH) {
      return NextResponse.redirect(
        new URL(SETUP_2FA_PATH, request.url)
      );
    }
    // Usuario con 2FA configurado intentando acceder a /configurar-2fa → dashboard
    if (token && token.totpEnabled && pathname === SETUP_2FA_PATH) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL(redirectPath, request.url));
}

export const config = {
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};

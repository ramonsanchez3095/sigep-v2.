import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { db } from '@/db';
import { usuarios, permisos } from '@/db/schema';
import {
  applyTokenToSession,
  applyUserToToken,
  getAuthRedirectPath,
} from '@/lib/auth-utils';
import { eq } from 'drizzle-orm';

// NOTA: DrizzleAdapter se eliminó porque el provider Credentials de NextAuth v5
// no soporta session strategy "database". Los datos de usuario ya se persisten
// en las tablas personalizadas (usuarios, permisos, refreshTokens).
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 horas
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Usuario', type: 'text' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const username = credentials.username as string;
        const password = credentials.password as string;

        const [user] = await db
          .select()
          .from(usuarios)
          .where(eq(usuarios.username, username))
          .limit(1);

        if (!user || !user.activo) return null;

        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatch) return null;

        const userPermisos = await db
          .select()
          .from(permisos)
          .where(eq(permisos.usuarioId, user.id));

        return {
          id: user.id,
          name: user.nombre,
          email: user.username, // NextAuth requires email field
          username: user.username,
          nombre: user.nombre,
          rol: user.rol,
          color: user.color,
          departamentoId: user.departamentoId,
          permisos: userPermisos.map(p => p.tipo),
          totpEnabled: user.totpEnabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      return applyUserToToken(token, user);
    },
    async session({ session, token }) {
      return applyTokenToSession(session, token);
    },
    async authorized({ auth, request }) {
      const redirectPath = getAuthRedirectPath(
        request.nextUrl.pathname,
        !!auth?.user
      );

      if (redirectPath === '/dashboard') {
        return Response.redirect(new URL(redirectPath, request.nextUrl));
      }

      return redirectPath === null;
    },
  },
});

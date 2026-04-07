import type { Session, User } from 'next-auth';
import type { JWT } from 'next-auth/jwt';

type AppUser = Pick<User, 'id' | 'name' | 'email'> & {
  username?: string;
  nombre?: string;
  rol?: string;
  color?: string;
  departamentoId?: string | null;
  permisos?: string[];
  totpEnabled?: boolean;
};

type AppToken = Partial<JWT> & {
  id?: string;
  username?: string;
  nombre?: string;
  rol?: string;
  color?: string;
  departamentoId?: string | null;
  permisos?: string[];
  totpEnabled?: boolean;
};

export function getAuthRedirectPath(pathname: string, isLoggedIn: boolean) {
  const isOnLogin = pathname === '/login';

  if (isOnLogin) {
    return isLoggedIn ? '/dashboard' : null;
  }

  return isLoggedIn ? null : '/login';
}

export function applyUserToToken(token: AppToken, user?: AppUser): JWT {
  if (!user) {
    return token as JWT;
  }

  return {
    ...token,
    id: user.id,
    username: user.username ?? '',
    nombre: user.nombre ?? user.name ?? '',
    rol: user.rol ?? 'VIEWER',
    color: user.color ?? '#1e3a5f',
    departamentoId: user.departamentoId ?? null,
    permisos: user.permisos ?? [],
    totpEnabled: user.totpEnabled ?? false,
  } as JWT;
}

export function applyTokenToSession(session: Session, token: AppToken): Session {
  if (!session.user) {
    return session;
  }

  return {
    ...session,
    user: {
      ...session.user,
      id: token.id ?? '',
      username: token.username ?? '',
      nombre: token.nombre ?? session.user.name ?? '',
      rol: (token.rol ?? 'VIEWER') as 'ADMIN' | 'EDITOR' | 'VIEWER',
      color: token.color ?? '#1e3a5f',
      departamentoId: token.departamentoId ?? null,
      permisos: token.permisos ?? [],
      totpEnabled: token.totpEnabled ?? false,
    },
  };
}
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      nombre: string;
      rol: 'ADMIN' | 'EDITOR' | 'VIEWER';
      color: string;
      departamentoId: string | null;
      permisos: string[];
      totpEnabled: boolean;
    } & DefaultSession['user'];
  }

  interface User {
    username?: string;
    nombre?: string;
    rol?: string;
    color?: string;
    departamentoId?: string | null;
    permisos?: string[];
    totpEnabled?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    nombre: string;
    rol: string;
    color: string;
    departamentoId: string | null;
    permisos: string[];
    totpEnabled: boolean;
  }
}

'use server';

import type { DB } from '@/db';
import { configPeriodos, configGlobal, usuarios } from '../db/schema';
import {
  activarPeriodoSchema,
  type CrearPeriodoInput,
  crearPeriodoSchema,
  crearUsuarioSchema,
  parseOrThrow,
  toggleUsuarioActivoSchema,
} from '../lib/action-schemas';
import { eq, desc } from 'drizzle-orm';

const monthFormatter = new Intl.DateTimeFormat('es-AR', {
  month: 'long',
  year: 'numeric',
});

function buildStatisticalMonthPeriod(mes: number, anio: number) {
  const inicio = new Date(anio, mes - 1, 1);
  const fin = new Date(anio, mes, 0, 23, 59, 59, 999);
  const fechaEtiqueta = new Date(anio, mes - 1, 1);
  const label = `Mes estadístico ${monthFormatter.format(fechaEtiqueta)}`;

  return {
    inicio,
    fin,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  };
}

interface SessionLike {
  user?: {
    id: string;
    rol?: string;
  };
}

interface ConfigActionDeps {
  database: DB;
  getSession: () => Promise<SessionLike | null>;
  revalidate: (path: string, type?: 'layout' | 'page') => void;
  hashPassword: (password: string) => Promise<string>;
}

async function getConfigActionDeps(): Promise<ConfigActionDeps> {
  const [{ db }, { auth }, { revalidatePath }, bcrypt] = await Promise.all([
    import('../db'),
    import('../lib/auth'),
    import('next/cache'),
    import('bcryptjs'),
  ]);

  return {
    database: db,
    getSession: auth,
    revalidate: revalidatePath,
    hashPassword: password => bcrypt.hash(password, 12),
  };
}

async function requireAdminSession(getSession: ConfigActionDeps['getSession']) {
  const session = await getSession();
  if (!session || session.user?.rol !== 'ADMIN') throw new Error('Sin permisos');
  return session;
}

export async function obtenerPeriodos() {
  const deps = await getConfigActionDeps();
  return deps.database
    .select()
    .from(configPeriodos)
    .orderBy(desc(configPeriodos.createdAt));
}

export async function crearPeriodoWithDeps(
  deps: ConfigActionDeps,
  data: CrearPeriodoInput
) {
  await requireAdminSession(deps.getSession);
  const parsed = parseOrThrow(crearPeriodoSchema, data);

  // Desactivar todos los períodos anteriores
  await deps.database.update(configPeriodos).set({ activo: false });

  const periodo =
    parsed.modo === 'mes-estadistico'
      ? {
          anterior: buildStatisticalMonthPeriod(
            parsed.anteriorMes,
            parsed.anteriorAnio
          ),
          actual: buildStatisticalMonthPeriod(parsed.actualMes, parsed.actualAnio),
        }
      : {
          anterior: {
            inicio: new Date(),
            fin: new Date(),
            label: parsed.periodoAnterior,
          },
          actual: {
            inicio: new Date(),
            fin: new Date(),
            label: parsed.periodoActual,
          },
        };

  // Crear nuevo período activo
  await deps.database.insert(configPeriodos).values({
    anteriorLabel: periodo.anterior.label,
    actualLabel: periodo.actual.label,
    anteriorInicio: periodo.anterior.inicio,
    anteriorFin: periodo.anterior.fin,
    actualInicio: periodo.actual.inicio,
    actualFin: periodo.actual.fin,
    activo: true,
  });

  deps.revalidate('/', 'layout');
}

export async function crearPeriodo(data: CrearPeriodoInput) {
  const deps = await getConfigActionDeps();
  return crearPeriodoWithDeps(deps, data);
}

export async function activarPeriodoWithDeps(deps: ConfigActionDeps, id: string) {
  await requireAdminSession(deps.getSession);
  const parsed = parseOrThrow(activarPeriodoSchema, { id });

  const [periodoObjetivo] = await deps.database
    .select({ id: configPeriodos.id })
    .from(configPeriodos)
    .where(eq(configPeriodos.id, parsed.id))
    .limit(1);

  if (!periodoObjetivo) {
    throw new Error('Periodo no encontrado');
  }

  await deps.database.update(configPeriodos).set({ activo: false });
  await deps.database
    .update(configPeriodos)
    .set({ activo: true })
    .where(eq(configPeriodos.id, parsed.id));

  deps.revalidate('/', 'layout');
}

export async function activarPeriodo(id: string) {
  const deps = await getConfigActionDeps();
  return activarPeriodoWithDeps(deps, id);
}

export async function obtenerUsuarios() {
  const deps = await getConfigActionDeps();
  return deps.database
    .select({
      id: usuarios.id,
      username: usuarios.username,
      nombre: usuarios.nombre,
      rol: usuarios.rol,
      departamentoId: usuarios.departamentoId,
      activo: usuarios.activo,
      totpEnabled: usuarios.totpEnabled,
      createdAt: usuarios.createdAt,
    })
    .from(usuarios)
    .orderBy(usuarios.nombre);
}

export async function crearUsuarioWithDeps(
  deps: ConfigActionDeps,
  data: {
  username: string;
  password: string;
  nombre: string;
  rol: 'ADMIN' | 'EDITOR' | 'VIEWER';
  departamentoId?: string;
}
) {
  await requireAdminSession(deps.getSession);
  const parsed = parseOrThrow(crearUsuarioSchema, data);

  const hash = await deps.hashPassword(parsed.password);

  await deps.database.insert(usuarios).values({
    username: parsed.username,
    passwordHash: hash,
    nombre: parsed.nombre,
    rol: parsed.rol,
    departamentoId: parsed.departamentoId ?? null,
  });

  deps.revalidate('/configuracion');
}

export async function crearUsuario(data: {
  username: string;
  password: string;
  nombre: string;
  rol: 'ADMIN' | 'EDITOR' | 'VIEWER';
  departamentoId?: string;
}) {
  const deps = await getConfigActionDeps();
  return crearUsuarioWithDeps(deps, data);
}

export async function toggleUsuarioActivoWithDeps(
  deps: ConfigActionDeps,
  id: string,
  activo: boolean
) {
  await requireAdminSession(deps.getSession);

  const parsed = parseOrThrow(toggleUsuarioActivoSchema, { id, activo });

  await deps.database
    .update(usuarios)
    .set({ activo: parsed.activo })
    .where(eq(usuarios.id, parsed.id));

  deps.revalidate('/configuracion');
}

export async function toggleUsuarioActivo(id: string, activo: boolean) {
  const deps = await getConfigActionDeps();
  return toggleUsuarioActivoWithDeps(deps, id, activo);
}

export async function obtenerConfigGlobal() {
  const deps = await getConfigActionDeps();
  const configs = await deps.database.select().from(configGlobal);
  if (configs.length === 0) return { edicionHabilitada: false };
  return { edicionHabilitada: configs[0].edicionHabilitada };
}

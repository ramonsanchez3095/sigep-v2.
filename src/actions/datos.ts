'use server';

import type { DB } from '@/db';
import {
  datosComparativos,
  tablasConfig,
  historialCambios,
  departamentos,
} from '../db/schema';
import {
  departamentoCodigoSchema,
  guardarDatosComparativosSchema,
  parseOrThrow,
} from '../lib/action-schemas';
import { eq, and } from 'drizzle-orm';

export interface DatosComparativosInput {
  filaId: string;
  label: string;
  periodoAnterior: string;
  periodoActual: string;
}

interface SessionLike {
  user?: {
    id: string;
    rol?: string;
  };
}

interface DatosActionDeps {
  database: DB;
  getSession: () => Promise<SessionLike | null>;
  revalidate: (path: string, type?: 'layout' | 'page') => void;
}

async function getDatosActionDeps(): Promise<DatosActionDeps> {
  const [{ db }, { auth }, { revalidatePath }] = await Promise.all([
    import('../db'),
    import('../lib/auth'),
    import('next/cache'),
  ]);

  return {
    database: db,
    getSession: auth,
    revalidate: revalidatePath,
  };
}

/** Obtener todas las tablas con datos de un departamento por código */
export async function obtenerTablasDelDepartamentoWithDb(
  database: DB,
  codigoDept: string
) {
  const codigoNormalizado = parseOrThrow(departamentoCodigoSchema, codigoDept);

  const [dept] = await database
    .select()
    .from(departamentos)
    .where(eq(departamentos.codigo, codigoNormalizado))
    .limit(1);

  if (!dept) return { departamento: null, tablas: [] };

  const tablas = await database
    .select()
    .from(tablasConfig)
    .where(eq(tablasConfig.departamentoId, dept.id))
    .orderBy(tablasConfig.orden);

  const tablasConDatos = await Promise.all(
    tablas.map(async tabla => {
      const datos = await database
        .select()
        .from(datosComparativos)
        .where(eq(datosComparativos.tablaConfigId, tabla.id))
        .orderBy(datosComparativos.orden);

      return {
        id: tabla.id,
        tablaId: tabla.tablaId,
        nombre: tabla.nombre,
        orden: tabla.orden,
        datos: datos.map(d => ({
          id: d.filaId,
          label: d.label,
          periodoAnterior: parseFloat(d.periodoAnterior),
          periodoActual: parseFloat(d.periodoActual),
        })),
      };
    })
  );

  return { departamento: dept, tablas: tablasConDatos };
}

export async function obtenerTablasDelDepartamento(codigoDept: string) {
  const deps = await getDatosActionDeps();
  return obtenerTablasDelDepartamentoWithDb(deps.database, codigoDept);
}

/** Guardar datos comparativos editados */
export async function guardarDatosComparativosWithDeps(
  deps: DatosActionDeps,
  tablaConfigId: string,
  filas: DatosComparativosInput[]
) {
  const session = await deps.getSession();
  if (!session?.user) throw new Error('No autorizado');

  const parsed = parseOrThrow(guardarDatosComparativosSchema, {
    tablaConfigId,
    filas,
  });

  const [tabla] = await deps.database
    .select()
    .from(tablasConfig)
    .where(eq(tablasConfig.id, parsed.tablaConfigId))
    .limit(1);

  if (!tabla) throw new Error('Tabla no encontrada');

  for (const fila of parsed.filas) {
    // Obtener dato anterior para historial
    const [datoAnterior] = await deps.database
      .select()
      .from(datosComparativos)
      .where(
        and(
          eq(datosComparativos.tablaConfigId, parsed.tablaConfigId),
          eq(datosComparativos.filaId, fila.filaId)
        )
      )
      .limit(1);

    if (datoAnterior) {
      // Registrar cambios en período anterior
      if (datoAnterior.periodoAnterior !== fila.periodoAnterior) {
        await deps.database.insert(historialCambios).values({
          tablaConfigId: parsed.tablaConfigId,
          campo: 'PERIODO_ANTERIOR',
          valorAnterior: datoAnterior.periodoAnterior,
          valorNuevo: fila.periodoAnterior,
          filaId: fila.filaId,
          filaLabel: fila.label,
          usuarioId: session.user.id,
        });
      }

      // Registrar cambios en período actual
      if (datoAnterior.periodoActual !== fila.periodoActual) {
        await deps.database.insert(historialCambios).values({
          tablaConfigId: parsed.tablaConfigId,
          campo: 'PERIODO_ACTUAL',
          valorAnterior: datoAnterior.periodoActual,
          valorNuevo: fila.periodoActual,
          filaId: fila.filaId,
          filaLabel: fila.label,
          usuarioId: session.user.id,
        });
      }

      // Actualizar dato
      await deps.database
        .update(datosComparativos)
        .set({
          periodoAnterior: fila.periodoAnterior,
          periodoActual: fila.periodoActual,
          label: fila.label,
          updatedAt: new Date(),
        })
        .where(eq(datosComparativos.id, datoAnterior.id));
    }
  }

  deps.revalidate('/');
}

export async function guardarDatosComparativos(
  tablaConfigId: string,
  filas: DatosComparativosInput[]
) {
  const deps = await getDatosActionDeps();
  return guardarDatosComparativosWithDeps(deps, tablaConfigId, filas);
}

/** Obtener todos los departamentos */
export async function obtenerDepartamentos() {
  const deps = await getDatosActionDeps();
  return deps.database
    .select()
    .from(departamentos)
    .orderBy(departamentos.orden);
}

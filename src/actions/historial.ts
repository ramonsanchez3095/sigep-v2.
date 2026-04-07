'use server';

import type { DB } from '@/db';
import { historialCambios, tablasConfig, usuarios } from '../db/schema';
import { historialLimitSchema, parseOrThrow } from '../lib/action-schemas';
import { desc, eq } from 'drizzle-orm';

export async function obtenerHistorialWithDb(database: DB, limit = 50) {
  const parsedLimit = parseOrThrow(historialLimitSchema, limit);

  const cambios = await database
    .select({
      id: historialCambios.id,
      campo: historialCambios.campo,
      valorAnterior: historialCambios.valorAnterior,
      valorNuevo: historialCambios.valorNuevo,
      fecha: historialCambios.timestamp,
      tablaConfigId: historialCambios.tablaConfigId,
      tablaNombre: tablasConfig.nombre,
      tablaTablaId: tablasConfig.tablaId,
      usuarioId: historialCambios.usuarioId,
      usuarioNombre: usuarios.nombre,
    })
    .from(historialCambios)
    .leftJoin(tablasConfig, eq(historialCambios.tablaConfigId, tablasConfig.id))
    .leftJoin(usuarios, eq(historialCambios.usuarioId, usuarios.id))
    .orderBy(desc(historialCambios.timestamp))
    .limit(parsedLimit);

  return cambios;
}

export async function obtenerHistorial(limit = 50) {
  const [{ db }] = await Promise.all([import('../db')]);
  return obtenerHistorialWithDb(db, limit);
}

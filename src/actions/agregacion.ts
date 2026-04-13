'use server';

import type { DB } from '@/db';
import {
  datosComparativos,
  estadisticasDiarias,
  estadisticasMensuales,
  estadisticasAnuales,
  tablasConfig,
} from '@/db/schema';
import { eq, and, gte, lte, sql } from 'drizzle-orm';
import { calcularTendencia } from '@/lib/estadisticas-utils';

// ============================================
// AGREGACIÓN DIARIA
// ============================================

/** Calcula totales actuales de datosComparativos y upsert en estadisticas_diarias */
export async function agregarEstadisticaDiaria(
  database: DB,
  departamentoId: string,
  tablaConfigId: string
) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Sumar totales de la tabla
  const [totales] = await database
    .select({
      totalAnterior: sql<string>`COALESCE(SUM(${datosComparativos.periodoAnterior}::numeric), 0)`,
      totalActual: sql<string>`COALESCE(SUM(${datosComparativos.periodoActual}::numeric), 0)`,
    })
    .from(datosComparativos)
    .where(eq(datosComparativos.tablaConfigId, tablaConfigId));

  // Contar cambios del día
  const [cambios] = await database
    .select({
      count: sql<number>`COUNT(*)::int`,
    })
    .from(sql`historial_cambios`)
    .where(
      sql`tabla_config_id = ${tablaConfigId} AND timestamp::date = ${hoy.toISOString().split('T')[0]}::date`
    );

  // Upsert: insertar o actualizar si ya existe para esta tabla+fecha
  await database
    .insert(estadisticasDiarias)
    .values({
      departamentoId,
      tablaConfigId,
      fecha: hoy,
      totalPeriodoAnterior: totales?.totalAnterior ?? '0',
      totalPeriodoActual: totales?.totalActual ?? '0',
      cantidadCambios: cambios?.count ?? 0,
    })
    .onConflictDoUpdate({
      target: [estadisticasDiarias.tablaConfigId, estadisticasDiarias.fecha],
      set: {
        totalPeriodoAnterior: totales?.totalAnterior ?? '0',
        totalPeriodoActual: totales?.totalActual ?? '0',
        cantidadCambios: cambios?.count ?? 0,
      },
    });
}

// ============================================
// ROLLUP MENSUAL
// ============================================

/** Agrega desde estadisticas_diarias → mensual */
export async function rollupMensual(
  database: DB,
  departamentoId: string,
  tablaConfigId: string,
  mes: number,
  anio: number
) {
  const fechaDesde = new Date(anio, mes - 1, 1);
  const fechaHasta = new Date(anio, mes, 0, 23, 59, 59);

  const filas = await database
    .select()
    .from(estadisticasDiarias)
    .where(
      and(
        eq(estadisticasDiarias.tablaConfigId, tablaConfigId),
        gte(estadisticasDiarias.fecha, fechaDesde),
        lte(estadisticasDiarias.fecha, fechaHasta)
      )
    );

  if (filas.length === 0) return;

  const valores = filas.map(f => parseFloat(f.totalPeriodoActual));
  const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
  const pMax = Math.max(...valores);
  const pMin = Math.min(...valores);
  const totalCambios = filas.reduce((a, f) => a + f.cantidadCambios, 0);

  await database
    .insert(estadisticasMensuales)
    .values({
      departamentoId,
      tablaConfigId,
      mes,
      anio,
      promedioDiario: promedio.toFixed(2),
      picoMaximo: pMax.toFixed(2),
      picoMinimo: pMin.toFixed(2),
      totalCambios,
      snapshotData: {
        diasConDatos: filas.length,
        ultimoValor: valores[valores.length - 1],
      },
    })
    .onConflictDoUpdate({
      target: [
        estadisticasMensuales.tablaConfigId,
        estadisticasMensuales.mes,
        estadisticasMensuales.anio,
      ],
      set: {
        promedioDiario: promedio.toFixed(2),
        picoMaximo: pMax.toFixed(2),
        picoMinimo: pMin.toFixed(2),
        totalCambios,
        snapshotData: {
          diasConDatos: filas.length,
          ultimoValor: valores[valores.length - 1],
        },
      },
    });
}

// ============================================
// ROLLUP ANUAL
// ============================================

/** Agrega desde estadisticas_mensuales → anual con regresión lineal */
export async function rollupAnual(
  database: DB,
  departamentoId: string,
  tablaConfigId: string,
  anio: number
) {
  const filas = await database
    .select()
    .from(estadisticasMensuales)
    .where(
      and(
        eq(estadisticasMensuales.tablaConfigId, tablaConfigId),
        eq(estadisticasMensuales.anio, anio)
      )
    );

  if (filas.length === 0) return;

  // Sumar totales del año desde datos diarios
  const [totalesAnuales] = await database
    .select({
      totalAnterior: sql<string>`COALESCE(SUM(${estadisticasDiarias.totalPeriodoAnterior}::numeric), 0)`,
      totalActual: sql<string>`COALESCE(SUM(${estadisticasDiarias.totalPeriodoActual}::numeric), 0)`,
    })
    .from(estadisticasDiarias)
    .where(
      and(
        eq(estadisticasDiarias.tablaConfigId, tablaConfigId),
        gte(estadisticasDiarias.fecha, new Date(anio, 0, 1)),
        lte(estadisticasDiarias.fecha, new Date(anio, 11, 31, 23, 59, 59))
      )
    );

  const promedioMensual =
    filas.reduce((a, f) => a + parseFloat(f.promedioDiario), 0) / filas.length;

  // Regresión lineal simple: Y = a + b*X donde X = mes (1-12)
  const tendencia = calcularTendencia(
    filas.map(f => ({ x: f.mes, y: parseFloat(f.promedioDiario) }))
  );

  await database
    .insert(estadisticasAnuales)
    .values({
      departamentoId,
      tablaConfigId,
      anio,
      totalAnualAnterior: totalesAnuales?.totalAnterior ?? '0',
      totalAnualActual: totalesAnuales?.totalActual ?? '0',
      promedioMensual: promedioMensual.toFixed(2),
      tendencia: tendencia.toFixed(6),
    })
    .onConflictDoUpdate({
      target: [estadisticasAnuales.tablaConfigId, estadisticasAnuales.anio],
      set: {
        totalAnualAnterior: totalesAnuales?.totalAnterior ?? '0',
        totalAnualActual: totalesAnuales?.totalActual ?? '0',
        promedioMensual: promedioMensual.toFixed(2),
        tendencia: tendencia.toFixed(6),
      },
    });
}

// ============================================
// ROLLUP COMPLETO (para botón admin / cron)
// ============================================

/** Ejecuta rollup mensual y anual para todas las tablas */
export async function ejecutarRollupCompleto(database: DB) {
  const tablas = await database
    .select({
      id: tablasConfig.id,
      departamentoId: tablasConfig.departamentoId,
    })
    .from(tablasConfig);

  const ahora = new Date();
  const mesActual = ahora.getMonth() + 1;
  const anioActual = ahora.getFullYear();

  for (const tabla of tablas) {
    // Primero agregar estadística diaria actual
    await agregarEstadisticaDiaria(database, tabla.departamentoId, tabla.id);

    // Rollup del mes actual
    await rollupMensual(database, tabla.departamentoId, tabla.id, mesActual, anioActual);

    // Rollup de meses anteriores del año
    for (let m = 1; m < mesActual; m++) {
      await rollupMensual(database, tabla.departamentoId, tabla.id, m, anioActual);
    }

    // Rollup anual
    await rollupAnual(database, tabla.departamentoId, tabla.id, anioActual);

    // Rollup del año anterior (para YoY)
    await rollupAnual(database, tabla.departamentoId, tabla.id, anioActual - 1);
  }
}


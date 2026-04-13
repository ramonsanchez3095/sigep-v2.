import { db } from '@/db';
import {
  departamentos,
  datosComparativos,
  tablasConfig,
  configPeriodos,
} from '@/db/schema';
import { and, eq, sql } from 'drizzle-orm';
import { DashboardContent } from './DashboardContent';
import { D1_CANONICAL_TOTAL } from '@/lib/d1-definition';

export const metadata = { title: 'Dashboard - SIGEP' };

export default async function DashboardPage() {
  // Obtener todos los departamentos con sus totales
  const depts = await db
    .select()
    .from(departamentos)
    .orderBy(departamentos.orden);

  const deptsConTotales = await Promise.all(
    depts.map(async dept => {
      const tablas = await db
        .select({ id: tablasConfig.id })
        .from(tablasConfig)
        .where(eq(tablasConfig.departamentoId, dept.id));

      let totalAnterior = 0;
      let totalActual = 0;
      let tieneTotalCanonicoD1 = false;

      if (dept.codigo === 'd1') {
        const [tablaCanonica] = await db
          .select({ id: tablasConfig.id })
          .from(tablasConfig)
          .where(
            and(
              eq(tablasConfig.departamentoId, dept.id),
              eq(tablasConfig.tablaId, D1_CANONICAL_TOTAL.tableId)
            )
          )
          .limit(1);

        if (tablaCanonica) {
          tieneTotalCanonicoD1 = true;

          const [rowCanonica] = await db
            .select({
              periodoAnterior: datosComparativos.periodoAnterior,
              periodoActual: datosComparativos.periodoActual,
            })
            .from(datosComparativos)
            .where(
              and(
                eq(datosComparativos.tablaConfigId, tablaCanonica.id),
                eq(datosComparativos.filaId, D1_CANONICAL_TOTAL.rowId)
              )
            )
            .limit(1);

          totalAnterior = parseFloat(rowCanonica?.periodoAnterior ?? '0') || 0;
          totalActual = parseFloat(rowCanonica?.periodoActual ?? '0') || 0;
        }
      }

      if (dept.codigo !== 'd1' || !tieneTotalCanonicoD1) {
        totalAnterior = 0;
        totalActual = 0;

        for (const tabla of tablas) {
          const [result] = await db
            .select({
              sumAnterior: sql<string>`COALESCE(SUM(CAST(${datosComparativos.periodoAnterior} AS DECIMAL)), 0)`,
              sumActual: sql<string>`COALESCE(SUM(CAST(${datosComparativos.periodoActual} AS DECIMAL)), 0)`,
            })
            .from(datosComparativos)
            .where(eq(datosComparativos.tablaConfigId, tabla.id));

          totalAnterior += parseFloat(result.sumAnterior) || 0;
          totalActual += parseFloat(result.sumActual) || 0;
        }
      }

      const porcentaje =
        totalAnterior === 0
          ? 0
          : Math.round(((totalActual - totalAnterior) / totalAnterior) * 100);

      return {
        ...dept,
        totalAnterior,
        totalActual,
        porcentaje,
        cantidadTablas: tablas.length,
      };
    })
  );

  const [periodo] = await db
    .select()
    .from(configPeriodos)
    .where(eq(configPeriodos.activo, true))
    .limit(1);

  return (
    <DashboardContent
      departamentos={deptsConTotales}
      periodoAnteriorLabel={periodo?.anteriorLabel ?? 'Período Anterior'}
      periodoActualLabel={periodo?.actualLabel ?? 'Período Actual'}
    />
  );
}

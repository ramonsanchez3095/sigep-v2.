// ─────────────────────────────────────────────────────────────────────────────
// Prevención Ciudadana – Motor de transformación
// Convierte tablas raw de BD en datos tipados para el dashboard de Prevención.
// ─────────────────────────────────────────────────────────────────────────────

import {
  PC_TABLE_IDS,
  PC_CORE_TABLE_IDS,
  PC_PRIVADOS_LIBERTAD_DEFAULT,
  PC_LLAMADAS_RECIBIDAS_DEFAULT,
  PC_LLAMADAS_INTIMIDACION_DEFAULT,
  PC_CABINAS_VIGILANCIA_DEFAULT,
  PC_SERVICIOS_APORTADOS_DEFAULT,
  PC_VEHICULOS_SUSTRAIDOS_DEFAULT,
  PC_VEHICULOS_RECUPERADOS_DEFAULT,
  PC_MESES,
  type PCComparisonRow,
  type PCVehiculoMesRow,
} from './prevencion-ciudadana-definition';

// ─── Tipos raw (desde la BD) ──────────────────────────────────────────────────
export interface PCRawRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

export interface PCRawTable {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: PCRawRow[];
}

// ─── Dashboard data ───────────────────────────────────────────────────────────
export interface PCDashboardData {
  isReady: boolean;
  privadosLibertad: PCComparisonRow[];
  llamadasRecibidas: PCComparisonRow[];
  llamadasIntimidacion: PCComparisonRow[];
  cabinasVigilancia: PCComparisonRow[];
  serviciosAportados: PCComparisonRow[];
  vehiculosSustraidos: PCVehiculoMesRow[];
  vehiculosRecuperados: PCVehiculoMesRow[];
  rawTableIds: Record<string, string | undefined>;
}

// ─── Activación de la vista avanzada ─────────────────────────────────────────
export function hasPrevencionCiudadanaStructuredTables(rawTables: PCRawTable[]): boolean {
  const ids = new Set(rawTables.map((t) => t.tablaId));
  return PC_CORE_TABLE_IDS.every((id) => ids.has(id));
}

// ─── Reemplazo de filas ───────────────────────────────────────────────────────
export function replacePCRawTableRows(
  rawTables: PCRawTable[],
  tableId: string,
  nextRows: PCRawRow[]
): PCRawTable[] {
  return rawTables.map((t) =>
    t.tablaId === tableId ? { ...t, datos: nextRows } : t
  );
}

// ─── Helpers de parseo ────────────────────────────────────────────────────────
function findTable(rawTables: PCRawTable[], tablaId: string) {
  return rawTables.find((t) => t.tablaId === tablaId);
}

function rowVal(table: PCRawTable | undefined, rowId: string, field: 'periodoAnterior' | 'periodoActual'): number {
  if (!table) return 0;
  return table.datos.find((r) => r.id === rowId)?.[field] ?? 0;
}

// Helper genérico para parsear una tabla de comparación
function parseComparisonTable(
  rawTables: PCRawTable[],
  tablaId: string,
  defaults: PCComparisonRow[],
  rawTableIds: Record<string, string | undefined>
): PCComparisonRow[] {
  const table = findTable(rawTables, tablaId);
  rawTableIds[tablaId] = table?.id;
  return defaults.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(table, def.id, 'periodoAnterior'),
    periodoActual: rowVal(table, def.id, 'periodoActual'),
  }));
}

// Helper para parsear las tablas mensuales de vehículos
function parseVehiculosTable(
  rawTables: PCRawTable[],
  tableId: string,
  defaults: PCVehiculoMesRow[],
  rawTableIds: Record<string, string | undefined>
): PCVehiculoMesRow[] {
  const table = findTable(rawTables, tableId);
  rawTableIds[tableId] = table?.id;
  if (!table) return defaults;

  const result: PCVehiculoMesRow[] = [];
  for (const def of defaults) {
    const prefix = `${def.mes.toLowerCase()}_${def.anio}`;
    const findVal = (suffix: string) =>
      table.datos.find((r) => r.id === `${prefix}_${suffix}`)?.periodoActual ?? 0;

    result.push({
      mes: def.mes,
      anio: def.anio,
      moto: findVal('moto'),
      automovil: findVal('automovil'),
      camioneta: findVal('camioneta'),
      camion: findVal('camion'),
      utilitario: findVal('utilitario'),
      tractor: findVal('tractor'),
    });
  }
  return result;
}

// ─── Dashboard builder ────────────────────────────────────────────────────────
export function buildPrevencionCiudadanaDashboard(rawTables: PCRawTable[]): PCDashboardData {
  const rawTableIds: Record<string, string | undefined> = {};

  const privadosLibertad = parseComparisonTable(rawTables, PC_TABLE_IDS.PRIVADOS_LIBERTAD, PC_PRIVADOS_LIBERTAD_DEFAULT, rawTableIds);
  const llamadasRecibidas = parseComparisonTable(rawTables, PC_TABLE_IDS.LLAMADAS_RECIBIDAS, PC_LLAMADAS_RECIBIDAS_DEFAULT, rawTableIds);
  const llamadasIntimidacion = parseComparisonTable(rawTables, PC_TABLE_IDS.LLAMADAS_INTIMIDACION, PC_LLAMADAS_INTIMIDACION_DEFAULT, rawTableIds);
  const cabinasVigilancia = parseComparisonTable(rawTables, PC_TABLE_IDS.CABINAS_VIGILANCIA, PC_CABINAS_VIGILANCIA_DEFAULT, rawTableIds);
  const serviciosAportados = parseComparisonTable(rawTables, PC_TABLE_IDS.SERVICIOS_APORTADOS, PC_SERVICIOS_APORTADOS_DEFAULT, rawTableIds);
  
  const vehiculosSustraidos = parseVehiculosTable(rawTables, PC_TABLE_IDS.VEHICULOS_SUSTRAIDOS, PC_VEHICULOS_SUSTRAIDOS_DEFAULT, rawTableIds);
  const vehiculosRecuperados = parseVehiculosTable(rawTables, PC_TABLE_IDS.VEHICULOS_RECUPERADOS, PC_VEHICULOS_RECUPERADOS_DEFAULT, rawTableIds);

  return {
    isReady: hasPrevencionCiudadanaStructuredTables(rawTables),
    privadosLibertad,
    llamadasRecibidas,
    llamadasIntimidacion,
    cabinasVigilancia,
    serviciosAportados,
    vehiculosSustraidos,
    vehiculosRecuperados,
    rawTableIds,
  };
}

// ─── Conversión a RawRows para persistencia de vehículos mensuales ───────────
export function vehiculosToRawRows(rows: PCVehiculoMesRow[]): PCRawRow[] {
  return rows.flatMap(r => {
    const prefix = `${r.mes.toLowerCase()}_${r.anio}`;
    return [
      { id: `${prefix}_moto`, label: `${r.mes} ${r.anio} - Moto`, periodoAnterior: 0, periodoActual: r.moto },
      { id: `${prefix}_automovil`, label: `${r.mes} ${r.anio} - Automóvil`, periodoAnterior: 0, periodoActual: r.automovil },
      { id: `${prefix}_camioneta`, label: `${r.mes} ${r.anio} - Camioneta`, periodoAnterior: 0, periodoActual: r.camioneta },
      { id: `${prefix}_camion`, label: `${r.mes} ${r.anio} - Camión`, periodoAnterior: 0, periodoActual: r.camion },
      { id: `${prefix}_utilitario`, label: `${r.mes} ${r.anio} - Utilitario`, periodoAnterior: 0, periodoActual: r.utilitario },
      { id: `${prefix}_tractor`, label: `${r.mes} ${r.anio} - Tractor`, periodoAnterior: 0, periodoActual: r.tractor },
    ];
  });
}

// ─── Seed factory para Prevención Ciudadana ──────────────────────────────────
function comparisonToSeed(tablaId: string, nombre: string, defaults: PCComparisonRow[]) {
  return {
    tablaId,
    nombre,
    datos: defaults.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  };
}

export function createPrevencionCiudadanaSeedTables() {
  return [
    comparisonToSeed(PC_TABLE_IDS.PRIVADOS_LIBERTAD, 'Privados de la Libertad', PC_PRIVADOS_LIBERTAD_DEFAULT),
    comparisonToSeed(PC_TABLE_IDS.LLAMADAS_RECIBIDAS, 'Llamadas Recibidas', PC_LLAMADAS_RECIBIDAS_DEFAULT),
    comparisonToSeed(PC_TABLE_IDS.LLAMADAS_INTIMIDACION, 'Llamadas por Intimidación Pública', PC_LLAMADAS_INTIMIDACION_DEFAULT),
    comparisonToSeed(PC_TABLE_IDS.CABINAS_VIGILANCIA, 'División Cabinas de Vigilancia', PC_CABINAS_VIGILANCIA_DEFAULT),
    comparisonToSeed(PC_TABLE_IDS.SERVICIOS_APORTADOS, 'Servicios Aportados', PC_SERVICIOS_APORTADOS_DEFAULT),
    {
      tablaId: PC_TABLE_IDS.VEHICULOS_SUSTRAIDOS,
      nombre: 'Vehículos Sustraídos',
      datos: vehiculosToRawRows(PC_VEHICULOS_SUSTRAIDOS_DEFAULT).map(r => ({
        filaId: r.id,
        label: r.label,
        periodoAnterior: r.periodoAnterior,
        periodoActual: r.periodoActual,
      })),
    },
    {
      tablaId: PC_TABLE_IDS.VEHICULOS_RECUPERADOS,
      nombre: 'Vehículos Recuperados',
      datos: vehiculosToRawRows(PC_VEHICULOS_RECUPERADOS_DEFAULT).map(r => ({
        filaId: r.id,
        label: r.label,
        periodoAnterior: r.periodoAnterior,
        periodoActual: r.periodoActual,
      })),
    },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────
// DIGEDROP – Motor de transformación
// Convierte tablas raw de BD en datos tipados para el dashboard de DIGEDROP.
// ─────────────────────────────────────────────────────────────────────────────

import {
  DIGEDROP_TABLE_IDS,
  DIGEDROP_CORE_TABLE_IDS,
  DIGEDROP_SUSTANCIAS_DEFAULT,
  DIGEDROP_ELEMENTOS_DEFAULT,
  DIGEDROP_CODIGO_ADUANERO_DEFAULT,
  DIGEDROP_ALLANAMIENTOS_DEFAULT,
  DIGEDROP_DETENIDOS_DEFAULT,
  DIGEDROP_PREVENIDOS_DEFAULT,
  type DigedropComparisonRow,
  type DigedropTextRow,
} from './digedrop-definition';

// ─── Tipos raw (desde la BD) ──────────────────────────────────────────────────
export interface DigedropRawRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

export interface DigedropRawTable {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: DigedropRawRow[];
}

// ─── Dashboard data ───────────────────────────────────────────────────────────
export interface DigedropDashboardData {
  isReady: boolean;
  sustancias: DigedropComparisonRow[];
  elementos: DigedropComparisonRow[];
  codigoAduanero: DigedropTextRow[];
  allanamientos: DigedropComparisonRow[];
  detenidos: DigedropComparisonRow[];
  prevenidos: DigedropComparisonRow[];
  rawTableIds: Record<string, string | undefined>;
}

// ─── Activación de la vista avanzada ─────────────────────────────────────────
export function hasDigedropStructuredTables(rawTables: DigedropRawTable[]): boolean {
  const ids = new Set(rawTables.map((t) => t.tablaId));
  return DIGEDROP_CORE_TABLE_IDS.every((id) => ids.has(id));
}

// ─── Reemplazo de filas ───────────────────────────────────────────────────────
export function replaceDigedropRawTableRows(
  rawTables: DigedropRawTable[],
  tableId: string,
  nextRows: DigedropRawRow[]
): DigedropRawTable[] {
  return rawTables.map((t) =>
    t.tablaId === tableId ? { ...t, datos: nextRows } : t
  );
}

// ─── Helpers de parseo ────────────────────────────────────────────────────────
function findTable(rawTables: DigedropRawTable[], tablaId: string) {
  return rawTables.find((t) => t.tablaId === tablaId);
}

function rowVal(table: DigedropRawTable | undefined, rowId: string, field: 'periodoAnterior' | 'periodoActual'): number {
  if (!table) return 0;
  return table.datos.find((r) => r.id === rowId)?.[field] ?? 0;
}

// Helper genérico para parsear una tabla de comparación
function parseComparisonTable(
  rawTables: DigedropRawTable[],
  tablaId: string,
  defaults: DigedropComparisonRow[],
  rawTableIds: Record<string, string | undefined>
): DigedropComparisonRow[] {
  const table = findTable(rawTables, tablaId);
  rawTableIds[tablaId] = table?.id;
  return defaults.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(table, def.id, 'periodoAnterior'),
    periodoActual: rowVal(table, def.id, 'periodoActual'),
  }));
}

// Helper para parsear tabla de texto libre
function parseTextTable(
  rawTables: DigedropRawTable[],
  tablaId: string,
  defaults: DigedropTextRow[],
  rawTableIds: Record<string, string | undefined>
): DigedropTextRow[] {
  const table = findTable(rawTables, tablaId);
  rawTableIds[tablaId] = table?.id;
  if (!table) return defaults;

  return defaults.map((def) => {
    const row = table.datos.find((r) => r.id === def.id);
    if (!row) return def;
    // For text rows stored in the DB, the text is stored serialized in periodoAnterior/periodoActual
    // but we fall back to defaults since these are text values
    return def;
  });
}

// ─── Dashboard builder ────────────────────────────────────────────────────────
export function buildDigedropDashboard(rawTables: DigedropRawTable[]): DigedropDashboardData {
  const rawTableIds: Record<string, string | undefined> = {};

  const sustancias = parseComparisonTable(rawTables, DIGEDROP_TABLE_IDS.SUSTANCIAS, DIGEDROP_SUSTANCIAS_DEFAULT, rawTableIds);
  const elementos = parseComparisonTable(rawTables, DIGEDROP_TABLE_IDS.ELEMENTOS, DIGEDROP_ELEMENTOS_DEFAULT, rawTableIds);
  const codigoAduanero = parseTextTable(rawTables, DIGEDROP_TABLE_IDS.CODIGO_ADUANERO, DIGEDROP_CODIGO_ADUANERO_DEFAULT, rawTableIds);
  const allanamientos = parseComparisonTable(rawTables, DIGEDROP_TABLE_IDS.ALLANAMIENTOS, DIGEDROP_ALLANAMIENTOS_DEFAULT, rawTableIds);
  const detenidos = parseComparisonTable(rawTables, DIGEDROP_TABLE_IDS.DETENIDOS, DIGEDROP_DETENIDOS_DEFAULT, rawTableIds);
  const prevenidos = parseComparisonTable(rawTables, DIGEDROP_TABLE_IDS.PREVENIDOS, DIGEDROP_PREVENIDOS_DEFAULT, rawTableIds);

  return {
    isReady: hasDigedropStructuredTables(rawTables),
    sustancias,
    elementos,
    codigoAduanero,
    allanamientos,
    detenidos,
    prevenidos,
    rawTableIds,
  };
}

// ─── Seed factory para DIGEDROP ──────────────────────────────────────────────
function comparisonToSeed(tablaId: string, nombre: string, defaults: DigedropComparisonRow[]) {
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

export function createDigedropSeedTables() {
  return [
    comparisonToSeed(DIGEDROP_TABLE_IDS.SUSTANCIAS, 'Secuestro de Sustancias Prohibidas', DIGEDROP_SUSTANCIAS_DEFAULT),
    comparisonToSeed(DIGEDROP_TABLE_IDS.ELEMENTOS, 'Secuestro de Elementos', DIGEDROP_ELEMENTOS_DEFAULT),
    {
      tablaId: DIGEDROP_TABLE_IDS.CODIGO_ADUANERO,
      nombre: 'Secuestro de Elementos – Código Aduanero',
      datos: DIGEDROP_CODIGO_ADUANERO_DEFAULT.map((r) => ({
        filaId: r.id,
        label: r.label,
        periodoAnterior: 0,
        periodoActual: 0,
      })),
    },
    comparisonToSeed(DIGEDROP_TABLE_IDS.ALLANAMIENTOS, 'Secuestro de Sustancias – Allanamientos', DIGEDROP_ALLANAMIENTOS_DEFAULT),
    comparisonToSeed(DIGEDROP_TABLE_IDS.DETENIDOS, 'Detenidos', DIGEDROP_DETENIDOS_DEFAULT),
    comparisonToSeed(DIGEDROP_TABLE_IDS.PREVENIDOS, 'Prevenidos', DIGEDROP_PREVENIDOS_DEFAULT),
  ];
}

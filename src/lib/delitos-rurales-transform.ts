// ─────────────────────────────────────────────────────────────────────────────
// Delitos Rurales – Motor de transformación
// Convierte tablas raw de BD en datos tipados para el dashboard de Delitos Rurales.
// ─────────────────────────────────────────────────────────────────────────────

import {
  DR_TABLE_IDS,
  DR_CORE_TABLE_IDS,
  DR_PRIV_LIBERTAD_DEFAULT,
  DR_PROCEDIMIENTOS_DEFAULT,
  DR_ALLANAMIENTOS_DEFAULT,
  DR_VEHICULOS_DEFAULT,
  DR_ANIMALES_SECUESTRADOS_DEFAULT,
  DR_ARMAS_FUEGO_DEFAULT,
  DR_CARTUCHOS_DEFAULT,
  DR_ARMA_BLANCA_DEFAULT,
  DR_OTROS_SECUESTROS_DEFAULT,
  DR_SECUESTRO_DEFAULT,
  type DRComparisonRow,
} from './delitos-rurales-definition';

// ─── Tipos raw (desde la BD) ──────────────────────────────────────────────────
export interface DRRawRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

export interface DRRawTable {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: DRRawRow[];
}

// ─── Dashboard data ───────────────────────────────────────────────────────────
export interface DRDashboardData {
  isReady: boolean;
  privLibertad: DRComparisonRow[];
  procedimientos: DRComparisonRow[];
  allanamientos: DRComparisonRow[];
  vehiculos: DRComparisonRow[];
  animalesSecuestrados: DRComparisonRow[];
  armasFuego: DRComparisonRow[];
  cartuchos: DRComparisonRow[];
  armaBlanca: DRComparisonRow[];
  otrosSecuestros: DRComparisonRow[];
  secuestro: DRComparisonRow[];
  rawTableIds: Record<string, string | undefined>;
}

// ─── Activación de la vista avanzada ─────────────────────────────────────────
export function hasDelitosRuralesStructuredTables(rawTables: DRRawTable[]): boolean {
  const ids = new Set(rawTables.map((t) => t.tablaId));
  return DR_CORE_TABLE_IDS.every((id) => ids.has(id));
}

// ─── Reemplazo de filas ───────────────────────────────────────────────────────
export function replaceDRRawTableRows(
  rawTables: DRRawTable[],
  tableId: string,
  nextRows: DRRawRow[]
): DRRawTable[] {
  return rawTables.map((t) =>
    t.tablaId === tableId ? { ...t, datos: nextRows } : t
  );
}

// ─── Helpers de parseo ────────────────────────────────────────────────────────
function findTable(rawTables: DRRawTable[], tablaId: string) {
  return rawTables.find((t) => t.tablaId === tablaId);
}

function rowVal(table: DRRawTable | undefined, rowId: string, field: 'periodoAnterior' | 'periodoActual'): number {
  if (!table) return 0;
  return table.datos.find((r) => r.id === rowId)?.[field] ?? 0;
}

// Helper genérico para parsear una tabla de comparación
function parseComparisonTable(
  rawTables: DRRawTable[],
  tablaId: string,
  defaults: DRComparisonRow[],
  rawTableIds: Record<string, string | undefined>
): DRComparisonRow[] {
  const table = findTable(rawTables, tablaId);
  rawTableIds[tablaId] = table?.id;
  return defaults.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(table, def.id, 'periodoAnterior'),
    periodoActual: rowVal(table, def.id, 'periodoActual'),
  }));
}

// ─── Dashboard builder ────────────────────────────────────────────────────────
export function buildDelitosRuralesDashboard(rawTables: DRRawTable[]): DRDashboardData {
  const rawTableIds: Record<string, string | undefined> = {};

  const privLibertad = parseComparisonTable(rawTables, DR_TABLE_IDS.PRIV_LIBERTAD, DR_PRIV_LIBERTAD_DEFAULT, rawTableIds);
  const procedimientos = parseComparisonTable(rawTables, DR_TABLE_IDS.PROCEDIMIENTOS, DR_PROCEDIMIENTOS_DEFAULT, rawTableIds);
  const allanamientos = parseComparisonTable(rawTables, DR_TABLE_IDS.ALLANAMIENTOS, DR_ALLANAMIENTOS_DEFAULT, rawTableIds);
  const vehiculos = parseComparisonTable(rawTables, DR_TABLE_IDS.VEHICULOS, DR_VEHICULOS_DEFAULT, rawTableIds);
  const animalesSecuestrados = parseComparisonTable(rawTables, DR_TABLE_IDS.ANIMALES_SECUESTRADOS, DR_ANIMALES_SECUESTRADOS_DEFAULT, rawTableIds);
  const armasFuego = parseComparisonTable(rawTables, DR_TABLE_IDS.ARMAS_FUEGO, DR_ARMAS_FUEGO_DEFAULT, rawTableIds);
  const cartuchos = parseComparisonTable(rawTables, DR_TABLE_IDS.CARTUCHOS, DR_CARTUCHOS_DEFAULT, rawTableIds);
  const armaBlanca = parseComparisonTable(rawTables, DR_TABLE_IDS.ARMA_BLANCA, DR_ARMA_BLANCA_DEFAULT, rawTableIds);
  const otrosSecuestros = parseComparisonTable(rawTables, DR_TABLE_IDS.OTROS_SECUESTROS, DR_OTROS_SECUESTROS_DEFAULT, rawTableIds);
  const secuestro = parseComparisonTable(rawTables, DR_TABLE_IDS.SECUESTRO, DR_SECUESTRO_DEFAULT, rawTableIds);

  return {
    isReady: hasDelitosRuralesStructuredTables(rawTables),
    privLibertad,
    procedimientos,
    allanamientos,
    vehiculos,
    animalesSecuestrados,
    armasFuego,
    cartuchos,
    armaBlanca,
    otrosSecuestros,
    secuestro,
    rawTableIds,
  };
}

// ─── Seed factory para Delitos Rurales ───────────────────────────────────────
function comparisonToSeed(tablaId: string, nombre: string, defaults: DRComparisonRow[]) {
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

export function createDelitosRuralesSeedTables() {
  return [
    comparisonToSeed(DR_TABLE_IDS.PRIV_LIBERTAD, 'Privados de Libertad', DR_PRIV_LIBERTAD_DEFAULT),
    comparisonToSeed(DR_TABLE_IDS.PROCEDIMIENTOS, 'Procedimientos', DR_PROCEDIMIENTOS_DEFAULT),
    comparisonToSeed(DR_TABLE_IDS.ALLANAMIENTOS, 'Allanamientos', DR_ALLANAMIENTOS_DEFAULT),
    comparisonToSeed(DR_TABLE_IDS.VEHICULOS, 'Vehículos', DR_VEHICULOS_DEFAULT),
    comparisonToSeed(DR_TABLE_IDS.ANIMALES_SECUESTRADOS, 'Animales Secuestrados', DR_ANIMALES_SECUESTRADOS_DEFAULT),
    comparisonToSeed(DR_TABLE_IDS.ARMAS_FUEGO, 'Armas de Fuego (Causa e Infracción)', DR_ARMAS_FUEGO_DEFAULT),
    comparisonToSeed(DR_TABLE_IDS.CARTUCHOS, 'Cartuchos', DR_CARTUCHOS_DEFAULT),
    comparisonToSeed(DR_TABLE_IDS.ARMA_BLANCA, 'Arma Blanca', DR_ARMA_BLANCA_DEFAULT),
    comparisonToSeed(DR_TABLE_IDS.OTROS_SECUESTROS, 'Otros Secuestros', DR_OTROS_SECUESTROS_DEFAULT),
    comparisonToSeed(DR_TABLE_IDS.SECUESTRO, 'Secuestro', DR_SECUESTRO_DEFAULT),
  ];
}

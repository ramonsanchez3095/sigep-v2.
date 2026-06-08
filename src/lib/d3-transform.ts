// ─────────────────────────────────────────────────────────────────────────────
// D3 – Motor de transformación (análogo a d1-transform.ts)
// ─────────────────────────────────────────────────────────────────────────────

import {
  D3_BAR_METRICS,
  D3_CORE_TABLE_IDS,
  D3_PIE_METRICS,
  D3_SECTIONS,
  D3_SUMMARY_METRICS,
  D3_TABLES,
  type D3DisplayRowDefinition,
  type D3RowEmphasis,
  type D3RowRef,
  type D3TableDefinition,
  type D3TableVariant,
  type D3ValueFormat,
} from './d3-definition';

// ─── Tipos de datos raw (desde la BD) ────────────────────────────────────────
export interface D3RawRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

export interface D3RawTable {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: D3RawRow[];
}

// ─── Tipos de datos renderizados ─────────────────────────────────────────────
export interface D3RenderedRow {
  rowId: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
  diferencia: number;
  variacion: number;
  shareAnterior?: number;
  shareActual?: number;
  format: D3ValueFormat;
  emphasis: D3RowEmphasis;
  editable: boolean;
}

export interface D3RenderedTable {
  tableId: string;
  title: string;
  description?: string;
  variant: D3TableVariant;
  shareLabel?: string;
  rawTableConfigId?: string;
  sourceTableId?: string;
  canEdit: boolean;
  rows: D3RenderedRow[];
}

export interface D3RenderedSection {
  id: string;
  title: string;
  description?: string;
  tables: D3RenderedTable[];
}

export interface D3DashboardMetric {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
  variacion: number;
  format: D3ValueFormat;
}

export interface D3DashboardData {
  isReady: boolean;
  sections: D3RenderedSection[];
  tablesById: Record<string, D3RenderedTable>;
  summaryMetrics: D3DashboardMetric[];
  barData: Array<{ nombre: string; anterior: number; actual: number }>;
  pieData: Array<{ nombre: string; valor: number; color: string }>;
}

type D3ResolvedValue = {
  periodoAnterior: number;
  periodoActual: number;
  format: D3ValueFormat;
};

// ─── Utilidades ───────────────────────────────────────────────────────────────
const tableMap = new Map(D3_TABLES.map(t => [t.tableId, t]));
const numberKey = (tableId: string, rowId: string) => `${tableId}::${rowId}`;
const roundValue = (value: number, precision = 0) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};
const calculateVariation = (anterior: number, actual: number) => {
  if (anterior === 0) return actual > 0 ? 100 : 0;
  return roundValue(((actual - anterior) / anterior) * 100, 1);
};

// ─── Activación de la vista avanzada ─────────────────────────────────────────
export function hasD3StructuredTables(rawTables: D3RawTable[]): boolean {
  const ids = new Set(rawTables.map(t => t.tablaId));
  return D3_CORE_TABLE_IDS.every(id => ids.has(id));
}

// ─── Reemplazo de filas (para previsualización en edición) ───────────────────
export function replaceD3RawTableRows(
  rawTables: D3RawTable[],
  tableId: string,
  nextRows: D3RawRow[]
): D3RawTable[] {
  return rawTables.map(t =>
    t.tablaId === tableId ? { ...t, datos: nextRows } : t
  );
}

// ─── Dashboard builder ────────────────────────────────────────────────────────
export function buildD3Dashboard(rawTables: D3RawTable[]): D3DashboardData {
  const rawTableMap = new Map(rawTables.map(t => [t.tablaId, t]));
  const rawRowMap = new Map<string, D3ResolvedValue>();

  for (const table of rawTables) {
    for (const row of table.datos) {
      rawRowMap.set(numberKey(table.tablaId, row.id), {
        periodoAnterior: row.periodoAnterior,
        periodoActual: row.periodoActual,
        format: 'integer',
      });
    }
  }

  const memo = new Map<string, D3ResolvedValue>();

  const evaluateRowDefinition = (
    table: D3TableDefinition,
    row: D3DisplayRowDefinition
  ): D3ResolvedValue => {
    const cacheKey = numberKey(table.tableId, row.rowId);
    const cached = memo.get(cacheKey);
    if (cached) return cached;

    if (row.kind === 'editable') {
      const raw = rawRowMap.get(cacheKey) ?? {
        periodoAnterior: 0,
        periodoActual: 0,
        format: row.format ?? ('integer' as D3ValueFormat),
      };
      const resolved: D3ResolvedValue = { ...raw, format: row.format ?? raw.format ?? 'integer' };
      memo.set(cacheKey, resolved);
      return resolved;
    }

    let periodoAnterior = 0;
    let periodoActual = 0;

    if (row.formula.type === 'sum') {
      for (const r of row.formula.refs) {
        const v = evaluateRef(r);
        periodoAnterior += v.periodoAnterior;
        periodoActual += v.periodoActual;
      }
      const precision = row.formula.precision ?? 0;
      periodoAnterior = roundValue(periodoAnterior, precision);
      periodoActual = roundValue(periodoActual, precision);
    }

    if (row.formula.type === 'ratio') {
      const num = evaluateRef(row.formula.numerator);
      const den = evaluateRef(row.formula.denominator);
      const factor = row.formula.factor ?? 1;
      const precision = row.formula.precision ?? 2;
      periodoAnterior = den.periodoAnterior > 0
        ? roundValue((num.periodoAnterior / den.periodoAnterior) * factor, precision)
        : 0;
      periodoActual = den.periodoActual > 0
        ? roundValue((num.periodoActual / den.periodoActual) * factor, precision)
        : 0;
    }

    const resolved: D3ResolvedValue = { periodoAnterior, periodoActual, format: row.format ?? 'integer' };
    memo.set(cacheKey, resolved);
    return resolved;
  };

  const evaluateRef = (ref: D3RowRef): D3ResolvedValue => {
    const raw = rawRowMap.get(numberKey(ref.tableId, ref.rowId));
    if (raw) return raw;

    const table = tableMap.get(ref.tableId);
    const row = table?.rows.find(r => r.rowId === ref.rowId);
    if (!table || !row) return { periodoAnterior: 0, periodoActual: 0, format: 'integer' };

    return evaluateRowDefinition(table, row);
  };

  const renderedTables = D3_TABLES.map(table => {
    const rawTable = rawTableMap.get(table.tableId);
    const shareBase = table.shareBase ? evaluateRef(table.shareBase) : undefined;

    const rows = table.rows.map(row => {
      const resolved = evaluateRowDefinition(table, row);
      const shareAnterior =
        shareBase && shareBase.periodoAnterior > 0
          ? roundValue((resolved.periodoAnterior / shareBase.periodoAnterior) * 100, 1)
          : undefined;
      const shareActual =
        shareBase && shareBase.periodoActual > 0
          ? roundValue((resolved.periodoActual / shareBase.periodoActual) * 100, 1)
          : undefined;

      return {
        rowId: row.rowId,
        label: row.label,
        periodoAnterior: resolved.periodoAnterior,
        periodoActual: resolved.periodoActual,
        diferencia: roundValue(resolved.periodoActual - resolved.periodoAnterior, 2),
        variacion: calculateVariation(resolved.periodoAnterior, resolved.periodoActual),
        shareAnterior,
        shareActual,
        format: resolved.format,
        emphasis: row.emphasis ?? 'normal',
        editable: row.kind === 'editable',
      } satisfies D3RenderedRow;
    });

    const renderedTable: D3RenderedTable = {
      tableId: table.tableId,
      title: table.title,
      description: table.description,
      variant: table.variant ?? 'comparison',
      shareLabel: table.shareLabel,
      rawTableConfigId: rawTable?.id,
      sourceTableId: rawTable ? rawTable.tablaId : undefined,
      canEdit: Boolean(rawTable) && table.rows.some(r => r.kind === 'editable'),
      rows,
    };

    return renderedTable;
  });

  const tablesById = Object.fromEntries(
    renderedTables.map(t => [t.tableId, t])
  ) as Record<string, D3RenderedTable>;

  const sections = D3_SECTIONS.map(section => ({
    ...section,
    tables: renderedTables.filter(t => {
      const def = tableMap.get(t.tableId);
      return def?.sectionId === section.id;
    }),
  }));

  const summaryMetrics = D3_SUMMARY_METRICS.map(metric => {
    const value = evaluateRef(metric.ref);
    return {
      id: metric.id,
      label: metric.label,
      periodoAnterior: value.periodoAnterior,
      periodoActual: value.periodoActual,
      variacion: calculateVariation(value.periodoAnterior, value.periodoActual),
      format: metric.format,
    };
  });

  const barData = D3_BAR_METRICS.map(metric => {
    const value = evaluateRef(metric.ref);
    return { nombre: metric.label, anterior: value.periodoAnterior, actual: value.periodoActual };
  });

  const pieData = D3_PIE_METRICS.map(metric => {
    const value = evaluateRef(metric.ref);
    return { nombre: metric.label, valor: value.periodoActual, color: metric.color };
  }).filter(item => item.valor > 0);

  return {
    isReady: hasD3StructuredTables(rawTables),
    sections,
    tablesById,
    summaryMetrics,
    barData,
    pieData,
  };
}

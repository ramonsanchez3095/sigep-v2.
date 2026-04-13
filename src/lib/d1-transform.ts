import {
  D1_BAR_METRICS,
  D1_CANONICAL_TOTAL,
  D1_PIE_METRICS,
  D1_REQUIRED_TABLE_IDS,
  D1_SECTIONS,
  D1_SUMMARY_METRICS,
  D1_TABLES,
  type D1DisplayRowDefinition,
  type D1RowEmphasis,
  type D1RowRef,
  type D1TableDefinition,
  type D1TableVariant,
  type D1ValueFormat,
} from './d1-definition';

export interface D1RawRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

export interface D1RawTable {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: D1RawRow[];
}

export interface D1RenderedRow {
  rowId: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
  diferencia: number;
  variacion: number;
  shareAnterior?: number;
  shareActual?: number;
  format: D1ValueFormat;
  emphasis: D1RowEmphasis;
  editable: boolean;
}

export interface D1RenderedTable {
  tableId: string;
  title: string;
  description?: string;
  variant: D1TableVariant;
  shareLabel?: string;
  rawTableConfigId?: string;
  sourceTableId?: string;
  canEdit: boolean;
  rows: D1RenderedRow[];
}

export interface D1RenderedSection {
  id: string;
  title: string;
  description?: string;
  tables: D1RenderedTable[];
}

export interface D1DashboardMetric {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
  variacion: number;
  format: D1ValueFormat;
}

export interface D1DashboardData {
  isReady: boolean;
  sections: D1RenderedSection[];
  tablesById: Record<string, D1RenderedTable>;
  summaryMetrics: D1DashboardMetric[];
  barData: Array<{ nombre: string; anterior: number; actual: number }>;
  pieData: Array<{ nombre: string; valor: number; color: string }>;
  trendTableConfigId?: string;
}

type D1ResolvedValue = {
  periodoAnterior: number;
  periodoActual: number;
  format: D1ValueFormat;
};

const tableMap = new Map(D1_TABLES.map(table => [table.tableId, table]));

const numberKey = (tableId: string, rowId: string) => `${tableId}::${rowId}`;

const roundValue = (value: number, precision = 0) => {
  const factor = 10 ** precision;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const calculateVariation = (periodoAnterior: number, periodoActual: number) => {
  if (periodoAnterior === 0) {
    return periodoActual > 0 ? 100 : 0;
  }

  return roundValue(
    ((periodoActual - periodoAnterior) / periodoAnterior) * 100,
    1
  );
};

export function hasD1StructuredTables(rawTables: D1RawTable[]) {
  const ids = new Set(rawTables.map(table => table.tablaId));
  return D1_REQUIRED_TABLE_IDS.every(tableId => ids.has(tableId));
}

export function replaceD1RawTableRows(
  rawTables: D1RawTable[],
  tableId: string,
  nextRows: D1RawRow[]
) {
  return rawTables.map(table =>
    table.tablaId === tableId ? { ...table, datos: nextRows } : table
  );
}

export function buildD1Dashboard(rawTables: D1RawTable[]): D1DashboardData {
  const rawTableMap = new Map(rawTables.map(table => [table.tablaId, table]));
  const rawRowMap = new Map<string, D1ResolvedValue>();

  for (const table of rawTables) {
    for (const row of table.datos) {
      rawRowMap.set(numberKey(table.tablaId, row.id), {
        periodoAnterior: row.periodoAnterior,
        periodoActual: row.periodoActual,
        format: 'integer',
      });
    }
  }

  const memo = new Map<string, D1ResolvedValue>();

  const evaluateRowDefinition = (
    table: D1TableDefinition,
    row: D1DisplayRowDefinition
  ): D1ResolvedValue => {
    const cacheKey = numberKey(table.tableId, row.rowId);
    const cached = memo.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (row.kind === 'editable') {
      const raw =
        rawRowMap.get(cacheKey) ??
        ({ periodoAnterior: 0, periodoActual: 0, format: row.format ?? 'integer' } satisfies D1ResolvedValue);
      const resolved = {
        ...raw,
        format: row.format ?? raw.format ?? 'integer',
      };
      memo.set(cacheKey, resolved);
      return resolved;
    }

    let periodoAnterior = 0;
    let periodoActual = 0;

    if (row.formula.type === 'sum') {
      for (const ref of row.formula.refs) {
        const resolved = evaluateRef(ref);
        periodoAnterior += resolved.periodoAnterior;
        periodoActual += resolved.periodoActual;
      }
      const precision = row.formula.precision ?? 0;
      periodoAnterior = roundValue(periodoAnterior, precision);
      periodoActual = roundValue(periodoActual, precision);
    }

    if (row.formula.type === 'ratio') {
      const numerator = evaluateRef(row.formula.numerator);
      const denominator = evaluateRef(row.formula.denominator);
      const factor = row.formula.factor ?? 1;
      const precision = row.formula.precision ?? 2;

      periodoAnterior =
        denominator.periodoAnterior > 0
          ? roundValue(
              (numerator.periodoAnterior / denominator.periodoAnterior) * factor,
              precision
            )
          : 0;

      periodoActual =
        denominator.periodoActual > 0
          ? roundValue(
              (numerator.periodoActual / denominator.periodoActual) * factor,
              precision
            )
          : 0;
    }

    const resolved = {
      periodoAnterior,
      periodoActual,
      format: row.format ?? 'integer',
    };

    memo.set(cacheKey, resolved);
    return resolved;
  };

  const evaluateRef = (ref: D1RowRef): D1ResolvedValue => {
    const raw = rawRowMap.get(numberKey(ref.tableId, ref.rowId));
    if (raw) {
      return raw;
    }

    const table = tableMap.get(ref.tableId);
    const row = table?.rows.find(candidate => candidate.rowId === ref.rowId);

    if (!table || !row) {
      return { periodoAnterior: 0, periodoActual: 0, format: 'integer' };
    }

    return evaluateRowDefinition(table, row);
  };

  const renderedTables = D1_TABLES.map(table => {
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
        variacion: calculateVariation(
          resolved.periodoAnterior,
          resolved.periodoActual
        ),
        shareAnterior,
        shareActual,
        format: resolved.format,
        emphasis: row.emphasis ?? 'normal',
        editable: row.kind === 'editable',
      } satisfies D1RenderedRow;
    });

    const renderedTable: D1RenderedTable = {
      tableId: table.tableId,
      title: table.title,
      description: table.description,
      variant: table.variant ?? 'comparison',
      shareLabel: table.shareLabel,
      rawTableConfigId: rawTable?.id,
      sourceTableId: rawTable ? rawTable.tablaId : undefined,
      canEdit:
        Boolean(rawTable) && table.rows.some(row => row.kind === 'editable'),
      rows,
    };

    return renderedTable;
  });

  const tablesById = Object.fromEntries(
    renderedTables.map(table => [table.tableId, table])
  ) as Record<string, D1RenderedTable>;

  const sections = D1_SECTIONS.map(section => ({
    ...section,
    tables: renderedTables.filter(table => {
      const definition = tableMap.get(table.tableId);
      return definition?.sectionId === section.id;
    }),
  }));

  const summaryMetrics = D1_SUMMARY_METRICS.map(metric => {
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

  const barData = D1_BAR_METRICS.map(metric => {
    const value = evaluateRef(metric.ref);
    return {
      nombre: metric.label,
      anterior: value.periodoAnterior,
      actual: value.periodoActual,
    };
  });

  const pieData = D1_PIE_METRICS.map(metric => {
    const value = evaluateRef(metric.ref);
    return {
      nombre: metric.label,
      valor: value.periodoActual,
      color: metric.color,
    };
  }).filter(item => item.valor > 0);

  const trendTableConfigId = rawTableMap.get(D1_CANONICAL_TOTAL.tableId)?.id;

  return {
    isReady: hasD1StructuredTables(rawTables),
    sections,
    tablesById,
    summaryMetrics,
    barData,
    pieData,
    trendTableConfigId,
  };
}
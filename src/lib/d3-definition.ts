// ─────────────────────────────────────────────────────────────────────────────
// D3 – Departamento de Operaciones Policiales
// Definición de secciones y tablas estructuradas para el dashboard avanzado.
// ─────────────────────────────────────────────────────────────────────────────

export type D3ValueFormat = 'integer' | 'decimal';
export type D3RowEmphasis = 'normal' | 'subtotal' | 'total';
export type D3TableVariant = 'comparison' | 'comparison-share';

export interface D3RowRef {
  tableId: string;
  rowId: string;
}

export interface D3SectionDefinition {
  id: string;
  title: string;
  description?: string;
}

export interface D3EditableRowDefinition {
  kind: 'editable';
  rowId: string;
  label: string;
  format?: D3ValueFormat;
  emphasis?: D3RowEmphasis;
}

export interface D3ComputedRowDefinition {
  kind: 'computed';
  rowId: string;
  label: string;
  format?: D3ValueFormat;
  emphasis?: D3RowEmphasis;
  formula:
    | { type: 'sum'; refs: D3RowRef[]; precision?: number }
    | { type: 'ratio'; numerator: D3RowRef; denominator: D3RowRef; factor?: number; precision?: number };
}

export type D3DisplayRowDefinition = D3EditableRowDefinition | D3ComputedRowDefinition;

export interface D3TableDefinition {
  tableId: string;
  title: string;
  sectionId: string;
  description?: string;
  variant?: D3TableVariant;
  shareBase?: D3RowRef;
  shareLabel?: string;
  rows: D3DisplayRowDefinition[];
}

export interface D3SeedTableData {
  tablaId: string;
  nombre: string;
  datos: Array<{
    filaId: string;
    label: string;
    periodoAnterior: number;
    periodoActual: number;
  }>;
}

const ref = (tableId: string, rowId: string): D3RowRef => ({ tableId, rowId });

// ─────────────────────────────────────────────────────────────────────────────
// SECCIONES
// ─────────────────────────────────────────────────────────────────────────────
export const D3_SECTIONS: D3SectionDefinition[] = [
  {
    id: 'delitos-propiedad',
    title: 'Delitos contra la propiedad',
    description: 'Comparativo de delitos contra la propiedad por unidad regional y ámbito provincial.',
  },
  {
    id: 'suicidios',
    title: 'Suicidios',
    description: 'Estadísticas comparativas de suicidios: total provincial, distribución por sexo y modalidades.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS
// ─────────────────────────────────────────────────────────────────────────────
export const D3_TABLES: D3TableDefinition[] = [
  // ── Sección: Delitos contra la propiedad ──────────────────────────────────
  {
    tableId: 'd3-delitos-propiedad-uurr',
    title: 'Delitos contra la propiedad',
    sectionId: 'delitos-propiedad',
    description: 'Delitos contra la propiedad desagregados por Unidad Regional.',
    rows: [
      { kind: 'editable', rowId: 'urc', label: 'U.R.C' },
      { kind: 'editable', rowId: 'urn', label: 'U.R.N' },
      { kind: 'editable', rowId: 'urs', label: 'U.R.S' },
      { kind: 'editable', rowId: 'ure', label: 'U.R.E' },
      { kind: 'editable', rowId: 'uro', label: 'U.R.O' },
      {
        kind: 'computed',
        rowId: 'ambito_provincial',
        label: 'ÁMBITO PROVINCIAL',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d3-delitos-propiedad-uurr', 'urc'),
            ref('d3-delitos-propiedad-uurr', 'urn'),
            ref('d3-delitos-propiedad-uurr', 'urs'),
            ref('d3-delitos-propiedad-uurr', 'ure'),
            ref('d3-delitos-propiedad-uurr', 'uro'),
          ],
        },
      },
    ],
  },

  // ── Sección: Suicidios ────────────────────────────────────────────────────
  {
    tableId: 'd3-suicidios-total',
    title: 'Total provincial',
    sectionId: 'suicidios',
    description: 'Totales de suicidios a nivel provincial por período comparativo.',
    rows: [
      {
        kind: 'editable',
        rowId: 'total_provincial',
        label: 'TOTAL PROVINCIAL',
        emphasis: 'total',
      },
    ],
  },
  {
    tableId: 'd3-suicidios-sexo',
    title: 'Sexo / Género',
    sectionId: 'suicidios',
    description: 'Distribución de suicidios por sexo/género.',
    variant: 'comparison-share',
    shareBase: ref('d3-suicidios-sexo', 'total_sexo'),
    shareLabel: '% sobre total',
    rows: [
      { kind: 'editable', rowId: 'masculino', label: 'MASCULINO' },
      { kind: 'editable', rowId: 'femenino', label: 'FEMENINO' },
      {
        kind: 'computed',
        rowId: 'total_sexo',
        label: 'TOTAL',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d3-suicidios-sexo', 'masculino'),
            ref('d3-suicidios-sexo', 'femenino'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd3-suicidios-modalidades',
    title: 'Modalidades de suicidios',
    sectionId: 'suicidios',
    description: 'Distribución de suicidios según modalidad empleada.',
    variant: 'comparison-share',
    shareBase: ref('d3-suicidios-modalidades', 'total_modalidades'),
    shareLabel: '% sobre total',
    rows: [
      { kind: 'editable', rowId: 'ahorcamiento', label: 'AHORCAMIENTO' },
      { kind: 'editable', rowId: 'arma_fuego', label: 'ARMA DE FUEGO' },
      { kind: 'editable', rowId: 'arma_blanca', label: 'ARMA BLANCA' },
      { kind: 'editable', rowId: 'quemaduras', label: 'QUEMADURAS' },
      { kind: 'editable', rowId: 'envenenamiento', label: 'ENVENENAMIENTO' },
      { kind: 'editable', rowId: 'otros', label: 'OTROS' },
      {
        kind: 'computed',
        rowId: 'total_modalidades',
        label: 'TOTAL',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d3-suicidios-modalidades', 'ahorcamiento'),
            ref('d3-suicidios-modalidades', 'arma_fuego'),
            ref('d3-suicidios-modalidades', 'arma_blanca'),
            ref('d3-suicidios-modalidades', 'quemaduras'),
            ref('d3-suicidios-modalidades', 'envenenamiento'),
            ref('d3-suicidios-modalidades', 'otros'),
          ],
        },
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MÉTRICAS DE RESUMEN (cards superiores)
// ─────────────────────────────────────────────────────────────────────────────
export const D3_SUMMARY_METRICS = [
  {
    id: 'total_delitos_propiedad',
    label: 'Delitos contra la propiedad',
    ref: ref('d3-delitos-propiedad-uurr', 'ambito_provincial'),
    format: 'integer' as const,
  },
  {
    id: 'total_suicidios',
    label: 'Total de suicidios',
    ref: ref('d3-suicidios-total', 'total_provincial'),
    format: 'integer' as const,
  },
  {
    id: 'suicidios_masculino',
    label: 'Suicidios masculinos',
    ref: ref('d3-suicidios-sexo', 'masculino'),
    format: 'integer' as const,
  },
  {
    id: 'suicidios_femenino',
    label: 'Suicidios femeninos',
    ref: ref('d3-suicidios-sexo', 'femenino'),
    format: 'integer' as const,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// MÉTRICAS DE GRÁFICO DE BARRAS
// ─────────────────────────────────────────────────────────────────────────────
export const D3_BAR_METRICS = [
  { label: 'U.R.C', ref: ref('d3-delitos-propiedad-uurr', 'urc') },
  { label: 'U.R.N', ref: ref('d3-delitos-propiedad-uurr', 'urn') },
  { label: 'U.R.S', ref: ref('d3-delitos-propiedad-uurr', 'urs') },
  { label: 'U.R.E', ref: ref('d3-delitos-propiedad-uurr', 'ure') },
  { label: 'U.R.O', ref: ref('d3-delitos-propiedad-uurr', 'uro') },
];

// ─────────────────────────────────────────────────────────────────────────────
// MÉTRICAS DE GRÁFICO DE TORTA (suicidios por modalidad)
// ─────────────────────────────────────────────────────────────────────────────
export const D3_PIE_METRICS = [
  { label: 'Ahorcamiento',   color: '#1e3a5f', ref: ref('d3-suicidios-modalidades', 'ahorcamiento') },
  { label: 'Arma de fuego',  color: '#ef4444', ref: ref('d3-suicidios-modalidades', 'arma_fuego') },
  { label: 'Arma blanca',    color: '#f59e0b', ref: ref('d3-suicidios-modalidades', 'arma_blanca') },
  { label: 'Quemaduras',     color: '#8b5cf6', ref: ref('d3-suicidios-modalidades', 'quemaduras') },
  { label: 'Envenenamiento', color: '#06b6d4', ref: ref('d3-suicidios-modalidades', 'envenenamiento') },
  { label: 'Otros',          color: '#94a3b8', ref: ref('d3-suicidios-modalidades', 'otros') },
];

// ─────────────────────────────────────────────────────────────────────────────
// IDs de tablas requeridas para activar la vista D3 avanzada
// ─────────────────────────────────────────────────────────────────────────────
export const D3_CORE_TABLE_IDS = [
  'd3-delitos-propiedad-uurr',
];

// ─────────────────────────────────────────────────────────────────────────────
// SEED FACTORY
// ─────────────────────────────────────────────────────────────────────────────
export function createD3SeedTables(): D3SeedTableData[] {
  return D3_TABLES.filter(table =>
    table.rows.some(row => row.kind === 'editable')
  ).map(table => ({
    tablaId: table.tableId,
    nombre: table.title,
    datos: table.rows
      .filter((row): row is D3EditableRowDefinition => row.kind === 'editable')
      .map(row => ({
        filaId: row.rowId,
        label: row.label,
        periodoAnterior: 0,
        periodoActual: 0,
      })),
  }));
}

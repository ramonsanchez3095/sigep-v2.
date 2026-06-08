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
  {
    id: 'homicidios',
    title: 'Homicidios Dolosos',
    description: 'Estadísticas comparativas de homicidios dolosos por ámbito/situación y móvil de crimen.',
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

  // ── Sección: Homicidios Dolosos ───────────────────────────────────────────
  {
    tableId: 'd3-homicidios-ambito',
    title: 'Ámbito / Situación',
    sectionId: 'homicidios',
    description: 'Homicidios dolosos por ámbito/situación de los hechos.',
    rows: [
      { kind: 'editable', rowId: 'ambito_publico_urc', label: 'ÁMBITO PÚBLICO - U.R.C' },
      { kind: 'editable', rowId: 'ambito_publico_urn', label: 'ÁMBITO PÚBLICO - U.R.N' },
      { kind: 'editable', rowId: 'ambito_publico_urs', label: 'ÁMBITO PÚBLICO - U.R.S' },
      { kind: 'editable', rowId: 'ambito_publico_ure', label: 'ÁMBITO PÚBLICO - U.R.E' },
      { kind: 'editable', rowId: 'ambito_publico_uro', label: 'ÁMBITO PÚBLICO - U.R.O' },

      { kind: 'editable', rowId: 'ambito_privado_urc', label: 'ÁMBITO PRIVADO - U.R.C' },
      { kind: 'editable', rowId: 'ambito_privado_urn', label: 'ÁMBITO PRIVADO - U.R.N' },
      { kind: 'editable', rowId: 'ambito_privado_urs', label: 'ÁMBITO PRIVADO - U.R.S' },
      { kind: 'editable', rowId: 'ambito_privado_ure', label: 'ÁMBITO PRIVADO - U.R.E' },
      { kind: 'editable', rowId: 'ambito_privado_uro', label: 'ÁMBITO PRIVADO - U.R.O' },

      { kind: 'editable', rowId: 'vivienda_urc', label: 'VIVIENDA PARTICULAR - U.R.C' },
      { kind: 'editable', rowId: 'vivienda_urn', label: 'VIVIENDA PARTICULAR - U.R.N' },
      { kind: 'editable', rowId: 'vivienda_urs', label: 'VIVIENDA PARTICULAR - U.R.S' },
      { kind: 'editable', rowId: 'vivienda_ure', label: 'VIVIENDA PARTICULAR - U.R.E' },
      { kind: 'editable', rowId: 'vivienda_uro', label: 'VIVIENDA PARTICULAR - U.R.O' },

      { kind: 'editable', rowId: 'encierro_urc', label: 'CONTEXTO DE ENCIERRO - U.R.C' },
      { kind: 'editable', rowId: 'encierro_urn', label: 'CONTEXTO DE ENCIERRO - U.R.N' },
      { kind: 'editable', rowId: 'encierro_urs', label: 'CONTEXTO DE ENCIERRO - U.R.S' },
      { kind: 'editable', rowId: 'encierro_ure', label: 'CONTEXTO DE ENCIERRO - U.R.E' },
      { kind: 'editable', rowId: 'encierro_uro', label: 'CONTEXTO DE ENCIERRO - U.R.O' },
    ],
  },
  {
    tableId: 'd3-homicidios-movil',
    title: 'Crimen por Móvil de Crimen',
    sectionId: 'homicidios',
    description: 'Homicidios dolosos distribuidos por el móvil o motivo del crimen.',
    rows: [
      { kind: 'editable', rowId: 'movil_interpersonal_urc', label: 'VIOLENCIA INTERPERSONAL - U.R.C' },
      { kind: 'editable', rowId: 'movil_interpersonal_urn', label: 'VIOLENCIA INTERPERSONAL - U.R.N' },
      { kind: 'editable', rowId: 'movil_interpersonal_urs', label: 'VIOLENCIA INTERPERSONAL - U.R.S' },
      { kind: 'editable', rowId: 'movil_interpersonal_ure', label: 'VIOLENCIA INTERPERSONAL - U.R.E' },
      { kind: 'editable', rowId: 'movil_interpersonal_uro', label: 'VIOLENCIA INTERPERSONAL - U.R.O' },

      { kind: 'editable', rowId: 'movil_intrafamiliar_urc', label: 'VIOLENCIA INTRAFAMILIAR - U.R.C' },
      { kind: 'editable', rowId: 'movil_intrafamiliar_urn', label: 'VIOLENCIA INTRAFAMILIAR - U.R.N' },
      { kind: 'editable', rowId: 'movil_intrafamiliar_urs', label: 'VIOLENCIA INTRAFAMILIAR - U.R.S' },
      { kind: 'editable', rowId: 'movil_intrafamiliar_ure', label: 'VIOLENCIA INTRAFAMILIAR - U.R.E' },
      { kind: 'editable', rowId: 'movil_intrafamiliar_uro', label: 'VIOLENCIA INTRAFAMILIAR - U.R.O' },

      { kind: 'editable', rowId: 'movil_defensa_urc', label: 'LEGITIMA DEFENSA - U.R.C' },
      { kind: 'editable', rowId: 'movil_defensa_urn', label: 'LEGITIMA DEFENSA - U.R.N' },
      { kind: 'editable', rowId: 'movil_defensa_urs', label: 'LEGITIMA DEFENSA - U.R.S' },
      { kind: 'editable', rowId: 'movil_defensa_ure', label: 'LEGITIMA DEFENSA - U.R.E' },
      { kind: 'editable', rowId: 'movil_defensa_uro', label: 'LEGITIMA DEFENSA - U.R.O' },

      { kind: 'editable', rowId: 'movil_robo_urc', label: 'OCASION DE ROBO - U.R.C' },
      { kind: 'editable', rowId: 'movil_robo_urn', label: 'OCASION DE ROBO - U.R.N' },
      { kind: 'editable', rowId: 'movil_robo_urs', label: 'OCASION DE ROBO - U.R.S' },
      { kind: 'editable', rowId: 'movil_robo_ure', label: 'OCASION DE ROBO - U.R.E' },
      { kind: 'editable', rowId: 'movil_robo_uro', label: 'OCASION DE ROBO - U.R.O' },

      { kind: 'editable', rowId: 'movil_policial_urc', label: 'INTERVENCION POLICIAL - U.R.C' },
      { kind: 'editable', rowId: 'movil_policial_urn', label: 'INTERVENCION POLICIAL - U.R.N' },
      { kind: 'editable', rowId: 'movil_policial_urs', label: 'INTERVENCION POLICIAL - U.R.S' },
      { kind: 'editable', rowId: 'movil_policial_ure', label: 'INTERVENCION POLICIAL - U.R.E' },
      { kind: 'editable', rowId: 'movil_policial_uro', label: 'INTERVENCION POLICIAL - U.R.O' },

      { kind: 'editable', rowId: 'movil_ajuste_urc', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.C' },
      { kind: 'editable', rowId: 'movil_ajuste_urn', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.N' },
      { kind: 'editable', rowId: 'movil_ajuste_urs', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.S' },
      { kind: 'editable', rowId: 'movil_ajuste_ure', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.E' },
      { kind: 'editable', rowId: 'movil_ajuste_uro', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.O' },

      { kind: 'editable', rowId: 'movil_femicidio_urc', label: 'FEMICIDIO - U.R.C' },
      { kind: 'editable', rowId: 'movil_femicidio_urn', label: 'FEMICIDIO - U.R.N' },
      { kind: 'editable', rowId: 'movil_femicidio_urs', label: 'FEMICIDIO - U.R.S' },
      { kind: 'editable', rowId: 'movil_femicidio_ure', label: 'FEMICIDIO - U.R.E' },
      { kind: 'editable', rowId: 'movil_femicidio_uro', label: 'FEMICIDIO - U.R.O' },

      { kind: 'editable', rowId: 'movil_pasional_urc', label: 'CONFLICTO PASIONAL - U.R.C' },
      { kind: 'editable', rowId: 'movil_pasional_urn', label: 'CONFLICTO PASIONAL - U.R.N' },
      { kind: 'editable', rowId: 'movil_pasional_urs', label: 'CONFLICTO PASIONAL - U.R.S' },
      { kind: 'editable', rowId: 'movil_pasional_ure', label: 'CONFLICTO PASIONAL - U.R.E' },
      { kind: 'editable', rowId: 'movil_pasional_uro', label: 'CONFLICTO PASIONAL - U.R.O' },

      { kind: 'editable', rowId: 'movil_rina_urc', label: 'RIÑA - U.R.C' },
      { kind: 'editable', rowId: 'movil_rina_urn', label: 'RIÑA - U.R.N' },
      { kind: 'editable', rowId: 'movil_rina_urs', label: 'RIÑA - U.R.S' },
      { kind: 'editable', rowId: 'movil_rina_ure', label: 'RIÑA - U.R.E' },
      { kind: 'editable', rowId: 'movil_rina_uro', label: 'RIÑA - U.R.O' },

      { kind: 'editable', rowId: 'movil_encierro_urc', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.C' },
      { kind: 'editable', rowId: 'movil_encierro_urn', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.N' },
      { kind: 'editable', rowId: 'movil_encierro_urs', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.S' },
      { kind: 'editable', rowId: 'movil_encierro_ure', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.E' },
      { kind: 'editable', rowId: 'movil_encierro_uro', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.O' },

      { kind: 'editable', rowId: 'movil_preterintencional_urc', label: 'PRETERINTENCIONAL - U.R.C' },
      { kind: 'editable', rowId: 'movil_preterintencional_urn', label: 'PRETERINTENCIONAL - U.R.N' },
      { kind: 'editable', rowId: 'movil_preterintencional_urs', label: 'PRETERINTENCIONAL - U.R.S' },
      { kind: 'editable', rowId: 'movil_preterintencional_ure', label: 'PRETERINTENCIONAL - U.R.E' },
      { kind: 'editable', rowId: 'movil_preterintencional_uro', label: 'PRETERINTENCIONAL - U.R.O' },

      { kind: 'editable', rowId: 'movil_culposo_urc', label: 'CULPOSO (POR OTROS HECHOS) - U.R.C' },
      { kind: 'editable', rowId: 'movil_culposo_urn', label: 'CULPOSO (POR OTROS HECHOS) - U.R.N' },
      { kind: 'editable', rowId: 'movil_culposo_urs', label: 'CULPOSO (POR OTROS HECHOS) - U.R.S' },
      { kind: 'editable', rowId: 'movil_culposo_ure', label: 'CULPOSO (POR OTROS HECHOS) - U.R.E' },
      { kind: 'editable', rowId: 'movil_culposo_uro', label: 'CULPOSO (POR OTROS HECHOS) - U.R.O' },

      { kind: 'editable', rowId: 'movil_sin_factor_urc', label: 'SIN FACTOR DE INCIDENCIA - U.R.C' },
      { kind: 'editable', rowId: 'movil_sin_factor_urn', label: 'SIN FACTOR DE INCIDENCIA - U.R.N' },
      { kind: 'editable', rowId: 'movil_sin_factor_urs', label: 'SIN FACTOR DE INCIDENCIA - U.R.S' },
      { kind: 'editable', rowId: 'movil_sin_factor_ure', label: 'SIN FACTOR DE INCIDENCIA - U.R.E' },
      { kind: 'editable', rowId: 'movil_sin_factor_uro', label: 'SIN FACTOR DE INCIDENCIA - U.R.O' },

      {
        kind: 'computed',
        rowId: 'totales_urc',
        label: 'TOTALES POR REGIONAL - U.R.C',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d3-homicidios-movil', 'movil_interpersonal_urc'),
            ref('d3-homicidios-movil', 'movil_intrafamiliar_urc'),
            ref('d3-homicidios-movil', 'movil_defensa_urc'),
            ref('d3-homicidios-movil', 'movil_robo_urc'),
            ref('d3-homicidios-movil', 'movil_policial_urc'),
            ref('d3-homicidios-movil', 'movil_ajuste_urc'),
            ref('d3-homicidios-movil', 'movil_femicidio_urc'),
            ref('d3-homicidios-movil', 'movil_pasional_urc'),
            ref('d3-homicidios-movil', 'movil_rina_urc'),
            ref('d3-homicidios-movil', 'movil_encierro_urc'),
            ref('d3-homicidios-movil', 'movil_preterintencional_urc'),
            ref('d3-homicidios-movil', 'movil_culposo_urc'),
            ref('d3-homicidios-movil', 'movil_sin_factor_urc'),
          ],
        },
      },
      {
        kind: 'computed',
        rowId: 'totales_urn',
        label: 'TOTALES POR REGIONAL - U.R.N',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d3-homicidios-movil', 'movil_interpersonal_urn'),
            ref('d3-homicidios-movil', 'movil_intrafamiliar_urn'),
            ref('d3-homicidios-movil', 'movil_defensa_urn'),
            ref('d3-homicidios-movil', 'movil_robo_urn'),
            ref('d3-homicidios-movil', 'movil_policial_urn'),
            ref('d3-homicidios-movil', 'movil_ajuste_urn'),
            ref('d3-homicidios-movil', 'movil_femicidio_urn'),
            ref('d3-homicidios-movil', 'movil_pasional_urn'),
            ref('d3-homicidios-movil', 'movil_rina_urn'),
            ref('d3-homicidios-movil', 'movil_encierro_urn'),
            ref('d3-homicidios-movil', 'movil_preterintencional_urn'),
            ref('d3-homicidios-movil', 'movil_culposo_urn'),
            ref('d3-homicidios-movil', 'movil_sin_factor_urn'),
          ],
        },
      },
      {
        kind: 'computed',
        rowId: 'totales_urs',
        label: 'TOTALES POR REGIONAL - U.R.S',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d3-homicidios-movil', 'movil_interpersonal_urs'),
            ref('d3-homicidios-movil', 'movil_intrafamiliar_urs'),
            ref('d3-homicidios-movil', 'movil_defensa_urs'),
            ref('d3-homicidios-movil', 'movil_robo_urs'),
            ref('d3-homicidios-movil', 'movil_policial_urs'),
            ref('d3-homicidios-movil', 'movil_ajuste_urs'),
            ref('d3-homicidios-movil', 'movil_femicidio_urs'),
            ref('d3-homicidios-movil', 'movil_pasional_urs'),
            ref('d3-homicidios-movil', 'movil_rina_urs'),
            ref('d3-homicidios-movil', 'movil_encierro_urs'),
            ref('d3-homicidios-movil', 'movil_preterintencional_urs'),
            ref('d3-homicidios-movil', 'movil_culposo_urs'),
            ref('d3-homicidios-movil', 'movil_sin_factor_urs'),
          ],
        },
      },
      {
        kind: 'computed',
        rowId: 'totales_ure',
        label: 'TOTALES POR REGIONAL - U.R.E',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d3-homicidios-movil', 'movil_interpersonal_ure'),
            ref('d3-homicidios-movil', 'movil_intrafamiliar_ure'),
            ref('d3-homicidios-movil', 'movil_defensa_ure'),
            ref('d3-homicidios-movil', 'movil_robo_ure'),
            ref('d3-homicidios-movil', 'movil_policial_ure'),
            ref('d3-homicidios-movil', 'movil_ajuste_ure'),
            ref('d3-homicidios-movil', 'movil_femicidio_ure'),
            ref('d3-homicidios-movil', 'movil_pasional_ure'),
            ref('d3-homicidios-movil', 'movil_rina_ure'),
            ref('d3-homicidios-movil', 'movil_encierro_ure'),
            ref('d3-homicidios-movil', 'movil_preterintencional_ure'),
            ref('d3-homicidios-movil', 'movil_culposo_ure'),
            ref('d3-homicidios-movil', 'movil_sin_factor_ure'),
          ],
        },
      },
      {
        kind: 'computed',
        rowId: 'totales_uro',
        label: 'TOTALES POR REGIONAL - U.R.O',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d3-homicidios-movil', 'movil_interpersonal_uro'),
            ref('d3-homicidios-movil', 'movil_intrafamiliar_uro'),
            ref('d3-homicidios-movil', 'movil_defensa_uro'),
            ref('d3-homicidios-movil', 'movil_robo_uro'),
            ref('d3-homicidios-movil', 'movil_policial_uro'),
            ref('d3-homicidios-movil', 'movil_ajuste_uro'),
            ref('d3-homicidios-movil', 'movil_femicidio_uro'),
            ref('d3-homicidios-movil', 'movil_pasional_uro'),
            ref('d3-homicidios-movil', 'movil_rina_uro'),
            ref('d3-homicidios-movil', 'movil_encierro_uro'),
            ref('d3-homicidios-movil', 'movil_preterintencional_uro'),
            ref('d3-homicidios-movil', 'movil_culposo_uro'),
            ref('d3-homicidios-movil', 'movil_sin_factor_uro'),
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

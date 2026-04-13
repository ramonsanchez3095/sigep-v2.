export type D1ValueFormat = 'integer' | 'decimal';

export type D1TableVariant = 'comparison' | 'comparison-share';

export type D1RowEmphasis = 'normal' | 'subtotal' | 'total';

export interface D1RowRef {
  tableId: string;
  rowId: string;
}

export interface D1SectionDefinition {
  id: string;
  title: string;
  description?: string;
}

export interface D1EditableRowDefinition {
  kind: 'editable';
  rowId: string;
  label: string;
  format?: D1ValueFormat;
  emphasis?: D1RowEmphasis;
}

export interface D1ComputedRowDefinition {
  kind: 'computed';
  rowId: string;
  label: string;
  format?: D1ValueFormat;
  emphasis?: D1RowEmphasis;
  formula:
    | {
        type: 'sum';
        refs: D1RowRef[];
        precision?: number;
      }
    | {
        type: 'ratio';
        numerator: D1RowRef;
        denominator: D1RowRef;
        factor?: number;
        precision?: number;
      };
}

export type D1DisplayRowDefinition =
  | D1EditableRowDefinition
  | D1ComputedRowDefinition;

export interface D1TableDefinition {
  tableId: string;
  title: string;
  sectionId: string;
  description?: string;
  variant?: D1TableVariant;
  shareBase?: D1RowRef;
  shareLabel?: string;
  rows: D1DisplayRowDefinition[];
}

export interface D1SeedTableData {
  tablaId: string;
  nombre: string;
  datos: Array<{
    filaId: string;
    label: string;
    periodoAnterior: number;
    periodoActual: number;
  }>;
}

const ref = (tableId: string, rowId: string): D1RowRef => ({
  tableId,
  rowId,
});

export const D1_SECTIONS: D1SectionDefinition[] = [
  {
    id: 'fuerza-efectiva',
    title: 'Fuerza efectiva',
    description:
      'Base general del personal policial, desagregada por tipo y genero con indicadores de densidad.',
  },
  {
    id: 'cuadros-jerarquicos',
    title: 'Cuadros jerarquicos',
    description:
      'Detalle por escalafon para oficiales y suboficiales, con un resumen consolidado de jerarquias.',
  },
  {
    id: 'distribucion-funcional',
    title: 'Distribucion funcional',
    description:
      'Distribucion del personal en dependencias, direcciones generales, divisiones y UURR.',
  },
  {
    id: 'situaciones-administrativas',
    title: 'Situaciones administrativas',
    description:
      'Control de situaciones particulares, renuncias, otras novedades y ascensos.',
  },
];

export const D1_TABLES: D1TableDefinition[] = [
  {
    tableId: 'd1-total-personal-policial',
    title: 'Total de personal policial',
    sectionId: 'fuerza-efectiva',
    rows: [
      {
        kind: 'editable',
        rowId: 'fuerza_efectiva',
        label: 'FUERZA EFECTIVA',
      },
      {
        kind: 'editable',
        rowId: 'poblacion_censo',
        label: 'POBLACION SEGUN CENSO 2022',
      },
      {
        kind: 'computed',
        rowId: 'densidad_policial',
        label: 'DENSIDAD POLICIAL POR 1.000 HAB.',
        format: 'decimal',
        emphasis: 'total',
        formula: {
          type: 'ratio',
          numerator: ref('d1-total-personal-policial', 'fuerza_efectiva'),
          denominator: ref('d1-total-personal-policial', 'poblacion_censo'),
          factor: 1000,
          precision: 2,
        },
      },
    ],
  },
  {
    tableId: 'd1-personal-por-tipo',
    title: 'Personal por tipo',
    sectionId: 'fuerza-efectiva',
    variant: 'comparison-share',
    shareBase: ref('d1-personal-por-tipo', 'total_personal_tipo'),
    shareLabel: '% sobre total',
    rows: [
      {
        kind: 'editable',
        rowId: 'personal_superior',
        label: 'PERSONAL SUPERIOR',
      },
      {
        kind: 'editable',
        rowId: 'personal_subalterno',
        label: 'PERSONAL SUBALTERNO',
      },
      {
        kind: 'computed',
        rowId: 'total_personal_tipo',
        label: 'TOTAL PERSONAL POLICIAL',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-personal-por-tipo', 'personal_superior'),
            ref('d1-personal-por-tipo', 'personal_subalterno'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-personal-por-genero',
    title: 'Personal por genero',
    sectionId: 'fuerza-efectiva',
    variant: 'comparison-share',
    shareBase: ref('d1-personal-por-genero', 'total_personal_genero'),
    shareLabel: '% sobre total',
    rows: [
      {
        kind: 'editable',
        rowId: 'masculino',
        label: 'MASCULINO',
      },
      {
        kind: 'editable',
        rowId: 'femenino',
        label: 'FEMENINO',
      },
      {
        kind: 'computed',
        rowId: 'total_personal_genero',
        label: 'TOTAL PERSONAL POLICIAL',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-personal-por-genero', 'masculino'),
            ref('d1-personal-por-genero', 'femenino'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-oficiales-superiores',
    title: 'Oficiales superiores',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-oficiales-superiores', 'total_oficiales_superiores'),
    shareLabel: '% interno',
    rows: [
      { kind: 'editable', rowId: 'comisario_general', label: 'COMISARIO GENERAL' },
      { kind: 'editable', rowId: 'comisario_mayor', label: 'COMISARIO MAYOR' },
      {
        kind: 'editable',
        rowId: 'comisario_inspector',
        label: 'COMISARIO INSPECTOR',
      },
      {
        kind: 'computed',
        rowId: 'total_oficiales_superiores',
        label: 'TOTAL OFICIALES SUPERIORES',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-oficiales-superiores', 'comisario_general'),
            ref('d1-oficiales-superiores', 'comisario_mayor'),
            ref('d1-oficiales-superiores', 'comisario_inspector'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-oficiales-jefes',
    title: 'Oficiales jefes',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-oficiales-jefes', 'total_oficiales_jefes'),
    shareLabel: '% interno',
    rows: [
      { kind: 'editable', rowId: 'comisario', label: 'COMISARIO' },
      { kind: 'editable', rowId: 'subcomisario', label: 'SUBCOMISARIO' },
      {
        kind: 'computed',
        rowId: 'total_oficiales_jefes',
        label: 'TOTAL OFICIALES JEFES',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-oficiales-jefes', 'comisario'),
            ref('d1-oficiales-jefes', 'subcomisario'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-oficiales-subalternos',
    title: 'Oficiales subalternos',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-oficiales-subalternos', 'total_oficiales_subalternos'),
    shareLabel: '% interno',
    rows: [
      {
        kind: 'editable',
        rowId: 'oficial_principal',
        label: 'OFICIAL PRINCIPAL',
      },
      { kind: 'editable', rowId: 'inspector', label: 'INSPECTOR' },
      {
        kind: 'editable',
        rowId: 'oficial_subinspector',
        label: 'OFICIAL SUBINSPECTOR',
      },
      {
        kind: 'editable',
        rowId: 'oficial_ayudante',
        label: 'OFICIAL AYUDANTE',
      },
      {
        kind: 'editable',
        rowId: 'oficial_subayudante',
        label: 'OFICIAL SUBAYUDANTE',
      },
      { kind: 'editable', rowId: 'cadete', label: 'CADETE' },
      {
        kind: 'computed',
        rowId: 'total_oficiales_subalternos',
        label: 'TOTAL OFICIALES SUBALTERNOS',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-oficiales-subalternos', 'oficial_principal'),
            ref('d1-oficiales-subalternos', 'inspector'),
            ref('d1-oficiales-subalternos', 'oficial_subinspector'),
            ref('d1-oficiales-subalternos', 'oficial_ayudante'),
            ref('d1-oficiales-subalternos', 'oficial_subayudante'),
            ref('d1-oficiales-subalternos', 'cadete'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-suboficiales-y-agentes',
    title: 'Suboficiales y agentes',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-suboficiales-y-agentes', 'total_suboficiales'),
    shareLabel: '% interno',
    rows: [
      {
        kind: 'editable',
        rowId: 'suboficial_mayor',
        label: 'SUBOFICIAL MAYOR',
      },
      {
        kind: 'editable',
        rowId: 'suboficial_principal',
        label: 'SUBOFICIAL PRINCIPAL',
      },
      {
        kind: 'editable',
        rowId: 'sargento_ayudante',
        label: 'SARGENTO AYUDANTE',
      },
      {
        kind: 'editable',
        rowId: 'sargento_primero',
        label: 'SARGENTO PRIMERO',
      },
      { kind: 'editable', rowId: 'sargento', label: 'SARGENTO' },
      { kind: 'editable', rowId: 'cabo', label: 'CABO' },
      { kind: 'editable', rowId: 'agente', label: 'AGENTE' },
      {
        kind: 'computed',
        rowId: 'total_suboficiales',
        label: 'TOTAL SUBOFICIALES Y AGENTES',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-suboficiales-y-agentes', 'suboficial_mayor'),
            ref('d1-suboficiales-y-agentes', 'suboficial_principal'),
            ref('d1-suboficiales-y-agentes', 'sargento_ayudante'),
            ref('d1-suboficiales-y-agentes', 'sargento_primero'),
            ref('d1-suboficiales-y-agentes', 'sargento'),
            ref('d1-suboficiales-y-agentes', 'cabo'),
            ref('d1-suboficiales-y-agentes', 'agente'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-resumen-jerarquia',
    title: 'Resumen por jerarquia',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-resumen-jerarquia', 'total_jerarquia'),
    shareLabel: '% sobre fuerza',
    rows: [
      {
        kind: 'computed',
        rowId: 'total_oficiales',
        label: 'TOTAL OFICIALES',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-oficiales-superiores', 'total_oficiales_superiores'),
            ref('d1-oficiales-jefes', 'total_oficiales_jefes'),
            ref('d1-oficiales-subalternos', 'total_oficiales_subalternos'),
          ],
        },
      },
      {
        kind: 'computed',
        rowId: 'total_suboficiales_resumen',
        label: 'TOTAL SUBOFICIALES Y AGENTES',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [ref('d1-suboficiales-y-agentes', 'total_suboficiales')],
        },
      },
      {
        kind: 'computed',
        rowId: 'total_jerarquia',
        label: 'TOTAL GENERAL',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-resumen-jerarquia', 'total_oficiales'),
            ref('d1-resumen-jerarquia', 'total_suboficiales_resumen'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-dependencias-ddgg',
    title: 'Dependencias DD.GG.',
    sectionId: 'distribucion-funcional',
    variant: 'comparison-share',
    shareBase: ref('d1-dependencias-ddgg', 'total_dependencias_ddgg'),
    shareLabel: '% sobre total',
    rows: [
      { kind: 'editable', rowId: 'jefatura_policia', label: 'JEFATURA DE POLICIA' },
      { kind: 'editable', rowId: 'subjefatura', label: 'SUBJEFATURA' },
      {
        kind: 'editable',
        rowId: 'departamento_personal',
        label: 'DEPARTAMENTO PERSONAL (D-1)',
      },
      {
        kind: 'editable',
        rowId: 'departamento_inteligencia',
        label: 'DEPARTAMENTO INTELIGENCIA CRIMINAL (D-2)',
      },
      {
        kind: 'editable',
        rowId: 'departamento_operaciones',
        label: 'DEPARTAMENTO OPERACIONES POLICIALES (D-3)',
      },
      {
        kind: 'editable',
        rowId: 'departamento_logistica',
        label: 'DEPARTAMENTO LOGISTICA (D-4)',
      },
      {
        kind: 'editable',
        rowId: 'departamento_judicial',
        label: 'DEPARTAMENTO JUDICIAL (D-5)',
      },
      {
        kind: 'editable',
        rowId: 'direccion_prevencion',
        label: 'DIRECCION GENERAL DE PREVENCION CIUDADANA',
      },
      {
        kind: 'editable',
        rowId: 'direccion_unidades_especiales',
        label: 'DIRECCION GENERAL DE UNIDADES ESPECIALES',
      },
      {
        kind: 'editable',
        rowId: 'direccion_delitos_rurales',
        label: 'DIRECCION GENERAL DE DELITOS RURALES',
      },
      {
        kind: 'editable',
        rowId: 'direccion_digedrop',
        label: 'DIRECCION GENERAL DE DROGAS PELIGROSAS',
      },
      {
        kind: 'computed',
        rowId: 'total_dependencias_ddgg',
        label: 'TOTAL DD.GG.',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-dependencias-ddgg', 'jefatura_policia'),
            ref('d1-dependencias-ddgg', 'subjefatura'),
            ref('d1-dependencias-ddgg', 'departamento_personal'),
            ref('d1-dependencias-ddgg', 'departamento_inteligencia'),
            ref('d1-dependencias-ddgg', 'departamento_operaciones'),
            ref('d1-dependencias-ddgg', 'departamento_logistica'),
            ref('d1-dependencias-ddgg', 'departamento_judicial'),
            ref('d1-dependencias-ddgg', 'direccion_prevencion'),
            ref('d1-dependencias-ddgg', 'direccion_unidades_especiales'),
            ref('d1-dependencias-ddgg', 'direccion_delitos_rurales'),
            ref('d1-dependencias-ddgg', 'direccion_digedrop'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-dependencias-divisiones-uurr',
    title: 'Dependencias divisiones y UURR',
    sectionId: 'distribucion-funcional',
    variant: 'comparison-share',
    shareBase: ref('d1-dependencias-divisiones-uurr', 'total_dependencias_uurr'),
    shareLabel: '% sobre total',
    rows: [
      { kind: 'editable', rowId: 'casa_central', label: 'CASA CENTRAL' },
      { kind: 'editable', rowId: 'urr_capital', label: 'URR CAPITAL' },
      { kind: 'editable', rowId: 'urr_norte', label: 'URR NORTE' },
      { kind: 'editable', rowId: 'urr_sur', label: 'URR SUR' },
      { kind: 'editable', rowId: 'urr_este', label: 'URR ESTE' },
      { kind: 'editable', rowId: 'urr_oeste', label: 'URR OESTE' },
      {
        kind: 'editable',
        rowId: 'institutos_instruccion',
        label: 'INSTITUTOS E INSTRUCCION',
      },
      { kind: 'editable', rowId: 'otras_divisiones', label: 'OTRAS DIVISIONES' },
      {
        kind: 'computed',
        rowId: 'total_dependencias_uurr',
        label: 'TOTAL DIVISIONES Y UURR',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-dependencias-divisiones-uurr', 'casa_central'),
            ref('d1-dependencias-divisiones-uurr', 'urr_capital'),
            ref('d1-dependencias-divisiones-uurr', 'urr_norte'),
            ref('d1-dependencias-divisiones-uurr', 'urr_sur'),
            ref('d1-dependencias-divisiones-uurr', 'urr_este'),
            ref('d1-dependencias-divisiones-uurr', 'urr_oeste'),
            ref('d1-dependencias-divisiones-uurr', 'institutos_instruccion'),
            ref('d1-dependencias-divisiones-uurr', 'otras_divisiones'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-situacion-particular',
    title: 'Situacion particular',
    sectionId: 'situaciones-administrativas',
    variant: 'comparison-share',
    shareBase: ref('d1-situacion-particular', 'total_situacion_particular'),
    shareLabel: '% interno',
    rows: [
      { kind: 'editable', rowId: 'disponibilidad', label: 'DISPONIBILIDAD' },
      {
        kind: 'editable',
        rowId: 'licencia_largo_tratamiento',
        label: 'LICENCIA LARGO TRATAMIENTO',
      },
      { kind: 'editable', rowId: 'pasiva_servicio', label: 'PASIVA POR SERVICIO' },
      {
        kind: 'editable',
        rowId: 'comision_otro_organismo',
        label: 'COMISION EN OTRO ORGANISMO',
      },
      { kind: 'editable', rowId: 'suspendidos', label: 'SUSPENDIDOS' },
      {
        kind: 'computed',
        rowId: 'total_situacion_particular',
        label: 'TOTAL SITUACION PARTICULAR',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-situacion-particular', 'disponibilidad'),
            ref('d1-situacion-particular', 'licencia_largo_tratamiento'),
            ref('d1-situacion-particular', 'pasiva_servicio'),
            ref('d1-situacion-particular', 'comision_otro_organismo'),
            ref('d1-situacion-particular', 'suspendidos'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-renuncias-aceptadas',
    title: 'Renuncias aceptadas',
    sectionId: 'situaciones-administrativas',
    rows: [
      {
        kind: 'editable',
        rowId: 'renuncias_personal_superior',
        label: 'RENUNCIAS PERSONAL SUPERIOR',
      },
      {
        kind: 'editable',
        rowId: 'renuncias_personal_subalterno',
        label: 'RENUNCIAS PERSONAL SUBALTERNO',
      },
      {
        kind: 'computed',
        rowId: 'total_renuncias',
        label: 'TOTAL RENUNCIAS',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-renuncias-aceptadas', 'renuncias_personal_superior'),
            ref('d1-renuncias-aceptadas', 'renuncias_personal_subalterno'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-otras-situaciones',
    title: 'Otras situaciones',
    sectionId: 'situaciones-administrativas',
    rows: [
      { kind: 'editable', rowId: 'retiros', label: 'RETIROS' },
      { kind: 'editable', rowId: 'fallecimientos', label: 'FALLECIMIENTOS' },
      {
        kind: 'editable',
        rowId: 'bajas_administrativas',
        label: 'BAJAS ADMINISTRATIVAS',
      },
      {
        kind: 'computed',
        rowId: 'total_otras_situaciones',
        label: 'TOTAL OTRAS SITUACIONES',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-otras-situaciones', 'retiros'),
            ref('d1-otras-situaciones', 'fallecimientos'),
            ref('d1-otras-situaciones', 'bajas_administrativas'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-ascensos',
    title: 'Ascensos',
    sectionId: 'situaciones-administrativas',
    rows: [
      { kind: 'editable', rowId: 'ascensos_oficiales', label: 'ASCENSOS OFICIALES' },
      {
        kind: 'editable',
        rowId: 'ascensos_suboficiales',
        label: 'ASCENSOS SUBOFICIALES',
      },
      {
        kind: 'computed',
        rowId: 'total_ascensos',
        label: 'TOTAL ASCENSOS',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-ascensos', 'ascensos_oficiales'),
            ref('d1-ascensos', 'ascensos_suboficiales'),
          ],
        },
      },
    ],
  },
];

export const D1_CANONICAL_TOTAL = ref(
  'd1-total-personal-policial',
  'fuerza_efectiva'
);

export const D1_REQUIRED_TABLE_IDS = D1_TABLES.filter(table =>
  table.rows.some(row => row.kind === 'editable')
).map(table => table.tableId);

export const D1_SUMMARY_METRICS = [
  {
    id: 'fuerza_efectiva',
    label: 'Fuerza efectiva',
    ref: ref('d1-total-personal-policial', 'fuerza_efectiva'),
    format: 'integer' as const,
  },
  {
    id: 'densidad_policial',
    label: 'Densidad policial',
    ref: ref('d1-total-personal-policial', 'densidad_policial'),
    format: 'decimal' as const,
  },
  {
    id: 'personal_superior',
    label: 'Personal superior',
    ref: ref('d1-personal-por-tipo', 'personal_superior'),
    format: 'integer' as const,
  },
  {
    id: 'personal_femenino',
    label: 'Personal femenino',
    ref: ref('d1-personal-por-genero', 'femenino'),
    format: 'integer' as const,
  },
];

export const D1_BAR_METRICS = [
  {
    label: 'Fuerza efectiva',
    ref: ref('d1-total-personal-policial', 'fuerza_efectiva'),
  },
  {
    label: 'Oficiales',
    ref: ref('d1-resumen-jerarquia', 'total_oficiales'),
  },
  {
    label: 'Suboficiales',
    ref: ref('d1-resumen-jerarquia', 'total_suboficiales_resumen'),
  },
  {
    label: 'Situacion particular',
    ref: ref('d1-situacion-particular', 'total_situacion_particular'),
  },
];

export const D1_PIE_METRICS = [
  {
    label: 'Masculino',
    color: '#1e3a5f',
    ref: ref('d1-personal-por-genero', 'masculino'),
  },
  {
    label: 'Femenino',
    color: '#d946ef',
    ref: ref('d1-personal-por-genero', 'femenino'),
  },
];

export function createD1SeedTables(): D1SeedTableData[] {
  return D1_TABLES.filter(table =>
    table.rows.some(row => row.kind === 'editable')
  ).map(table => ({
    tablaId: table.tableId,
    nombre: table.title,
    datos: table.rows
      .filter(
        (row): row is D1EditableRowDefinition => row.kind === 'editable'
      )
      .map(row => ({
        filaId: row.rowId,
        label: row.label,
        periodoAnterior: 0,
        periodoActual: 0,
      })),
  }));
}
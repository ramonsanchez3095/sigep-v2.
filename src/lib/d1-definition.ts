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
    id: 'situacion-particular',
    title: 'Situación particular',
    description:
      'Control de situaciones particulares y estado de revista especial.',
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
      { kind: 'editable', rowId: 'comisario_principal', label: 'COMISARIO PRINCIPAL' },
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
            ref('d1-oficiales-jefes', 'comisario_principal'),
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
      { kind: 'editable', rowId: 'oficial_auxiliar', label: 'OFICIAL AUXILIAR' },
      // { kind: 'editable', rowId: 'inspector', label: 'INSPECTOR' },
      // {
      //   kind: 'editable',
      //   rowId: 'oficial_subinspector',
      //   label: 'OFICIAL SUBINSPECTOR',
      // },
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
      // { kind: 'editable', rowId: 'cadete', label: 'CADETE' },
      {
        kind: 'computed',
        rowId: 'total_oficiales_subalternos',
        label: 'TOTAL OFICIALES SUBALTERNOS',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-oficiales-subalternos', 'oficial_principal'),
            ref('d1-oficiales-subalternos', 'oficial_auxiliar'),
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
    tableId: 'd1-suboficiales-superiores',
    title: 'Suboficiales superiores',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-suboficiales-superiores', 'total_suboficiales_superiores'),
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
      {
        kind: 'computed',
        rowId: 'total_suboficiales_superiores',
        label: 'TOTAL SUBOFICIALES SUPERIORES',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-suboficiales-superiores', 'suboficial_mayor'),
            ref('d1-suboficiales-superiores', 'suboficial_principal'),
            ref('d1-suboficiales-superiores', 'sargento_ayudante'),
            ref('d1-suboficiales-superiores', 'sargento_primero'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-suboficiales-subalternos',
    title: 'Suboficiales subalternos',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-suboficiales-subalternos', 'total_suboficiales_subalternos'),
    shareLabel: '% interno',
    rows: [
      { kind: 'editable', rowId: 'sargento', label: 'SARGENTO' },
      { kind: 'editable', rowId: 'cabo_primero', label: 'CABO PRIMERO' },
      { kind: 'editable', rowId: 'cabo', label: 'CABO' },
      {
        kind: 'computed',
        rowId: 'total_suboficiales_subalternos',
        label: 'TOTAL SUBOFICIALES SUBALTERNOS',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-suboficiales-subalternos', 'sargento'),
            ref('d1-suboficiales-subalternos', 'cabo_primero'),
            ref('d1-suboficiales-subalternos', 'cabo'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-tropa',
    title: 'Tropa',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-tropa', 'total_tropa'),
    shareLabel: '% interno',
    rows: [
      { kind: 'editable', rowId: 'agente', label: 'AGENTE' },
      {
        kind: 'computed',
        rowId: 'total_tropa',
        label: 'TOTAL TROPA',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [ref('d1-tropa', 'agente')],
        },
      },
    ],
  },
  {
    tableId: 'd1-transitorio',
    title: 'Transitorio',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-transitorio', 'total_transitorio'),
    shareLabel: '% interno',
    rows: [
      { kind: 'editable', rowId: 'P.T.P', label: 'P.T.P' },
      {
        kind: 'computed',
        rowId: 'total_transitorio',
        label: 'TOTAL TRANSITORIO',
        emphasis: 'subtotal',
        formula: {
          type: 'sum',
          refs: [ref('d1-transitorio', 'P.T.P')],
        },
      },
    ],
  },
  {
    tableId: 'd1-cuadro-oficiales',
    title: 'Cuadro de oficiales',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-cuadro-oficiales', 'total_oficiales_cuadro'),
    shareLabel: '% sobre fuerza',
    rows: [
      {
        kind: 'computed',
        rowId: 'oficiales_superiores',
        label: 'OFICIALES SUPERIORES',
        formula: {
          type: 'sum',
          refs: [ref('d1-oficiales-superiores', 'total_oficiales_superiores')],
        },
      },
      {
        kind: 'computed',
        rowId: 'oficiales_jefes',
        label: 'OFICIALES JEFES',
        formula: {
          type: 'sum',
          refs: [ref('d1-oficiales-jefes', 'total_oficiales_jefes')],
        },
      },
      {
        kind: 'computed',
        rowId: 'oficiales_subalternos',
        label: 'OFICIALES SUBALTERNOS',
        formula: {
          type: 'sum',
          refs: [ref('d1-oficiales-subalternos', 'total_oficiales_subalternos')],
        },
      },
      {
        kind: 'computed',
        rowId: 'total_oficiales_cuadro',
        label: 'TOTAL',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-cuadro-oficiales', 'oficiales_superiores'),
            ref('d1-cuadro-oficiales', 'oficiales_jefes'),
            ref('d1-cuadro-oficiales', 'oficiales_subalternos'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-cuadro-suboficiales',
    title: 'Cuadro de suboficiales',
    sectionId: 'cuadros-jerarquicos',
    variant: 'comparison-share',
    shareBase: ref('d1-cuadro-suboficiales', 'total_suboficiales_cuadro'),
    shareLabel: '% sobre fuerza',
    rows: [
      {
        kind: 'computed',
        rowId: 'suboficiales_superiores',
        label: 'SUBOFICIALES SUPERIORES',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-suboficiales-superiores', 'total_suboficiales_superiores'),
          ],
        },
      },
      {
        kind: 'computed',
        rowId: 'suboficiales_subalternos',
        label: 'SUBOFICIALES SUBALTERNOS',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-suboficiales-subalternos', 'total_suboficiales_subalternos'),
          ],
        },
      },
      {
        kind: 'computed',
        rowId: 'tropa',
        label: 'TROPA',
        formula: {
          type: 'sum',
          refs: [ref('d1-tropa', 'total_tropa')],
        },
      },
      {
        kind: 'computed',
        rowId: 'ptp',
        label: 'PTP',
        formula: {
          type: 'sum',
          refs: [ref('d1-transitorio', 'total_transitorio')],
        },
      },
      {
        kind: 'computed',
        rowId: 'total_suboficiales_cuadro',
        label: 'TOTAL',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-cuadro-suboficiales', 'suboficiales_superiores'),
            ref('d1-cuadro-suboficiales', 'suboficiales_subalternos'),
            ref('d1-cuadro-suboficiales', 'tropa'),
            ref('d1-cuadro-suboficiales', 'ptp'),
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
          refs: [
            ref('d1-suboficiales-superiores', 'total_suboficiales_superiores'),
            ref('d1-suboficiales-subalternos', 'total_suboficiales_subalternos'),
            ref('d1-tropa', 'total_tropa'),
            ref('d1-transitorio', 'total_transitorio'),
          ],
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
      { kind: 'editable', rowId: 'departamento_central', label: 'DEPARTAMENTO CENTRAL' },
      { kind: 'editable', rowId: 'departamento_personal', label: 'DEPARTAMENTO PERSONAL (D-1)' },
      { kind: 'editable', rowId: 'departamento_inteligencia', label: 'DEPARTAMENTO INTELIGENCIA CRIMINAL (D-2)' },
      { kind: 'editable', rowId: 'departamento_operaciones', label: 'DEPARTAMENTO OPERACIONES POLICIALES (D-3)' },
      { kind: 'editable', rowId: 'departamento_logistica', label: 'DEPARTAMENTO LOGISTICA (D-4)' },
      { kind: 'editable', rowId: 'departamento_judicial', label: 'DEPARTAMENTO JUDICIAL (D-5)' },
      { kind: 'editable', rowId: 'direccion_general_policia_adicional', label: 'DIRECCION GENERAL POLICIA ADICIONAL' },
      { kind: 'editable', rowId: 'direccion_asuntos_internos', label: 'DIRECCION GENERAL ASUNTOS INTERNOS POLICIALES' },
      { kind: 'editable', rowId: 'direccion_relaciones_policiales', label: 'DIRECCION GENERAL RELACIONES POLICIALES E INSTITUCIONES' },
      { kind: 'editable', rowId: 'direccion_institutos_instruccion', label: 'DIRECCION GENERAL INSTITUTOS E INSTRUCCION' },
      { kind: 'editable', rowId: 'direccion_investigacion_criminal', label: 'DIRECCION GENERAL INVESTIGACION CRIMINAL Y DELITOS COMPLEJOS' },
      { kind: 'editable', rowId: 'direccion_trata_personas_violencia_genero', label: 'DIRECCION GENERAL TRATA DE PERSONAS Y VIOLENCIA DE GENERO' },
      { kind: 'editable', rowId: 'direccion_seguridad_poder_judicial', label: 'DIRECCION GENERAL SEGURIDAD PODER JUDICIAL' },
      { kind: 'editable', rowId: 'direccion_drogas_peligrosas', label: 'DIRECCION GENERAL DROGAS PELIGROSAS' },
      { kind: 'editable', rowId: 'direccion_delitos_rurales_ambientales', label: 'DIRECCION GENERAL DELITOS RURALES Y AMBIENTALES' },
      { kind: 'editable', rowId: 'direccion_bomberos', label: 'DIRECCION GENERAL BOMBEROS' },
      { kind: 'editable', rowId: 'direccion_policia_cientifica', label: 'DIRECCION GENERAL POLICIA CIENTIFICA' },
      { kind: 'editable', rowId: 'direccion_prevencion', label: 'DIRECCION GENERAL PREVENCION CIUDADANA' },
      { kind: 'editable', rowId: 'direccion_unidades_especiales', label: 'DIRECCION GENERAL UNIDADES ESPECIALES' },
      { kind: 'editable', rowId: 'direccion_fuerzas_especiales', label: 'DIRECCION FUERZAS ESPECIALES' },
      { kind: 'editable', rowId: 'direccion_seguridad_vial', label: 'DIRECCION SEGURIDAD VIAL' },
      {
        kind: 'computed',
        rowId: 'total_dependencias_ddgg',
        label: 'TOTAL DD.GG.',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-dependencias-ddgg', 'departamento_central'),
            ref('d1-dependencias-ddgg', 'departamento_personal'),
            ref('d1-dependencias-ddgg', 'departamento_inteligencia'),
            ref('d1-dependencias-ddgg', 'departamento_operaciones'),
            ref('d1-dependencias-ddgg', 'departamento_logistica'),
            ref('d1-dependencias-ddgg', 'departamento_judicial'),
            ref('d1-dependencias-ddgg', 'direccion_general_policia_adicional'),
            ref('d1-dependencias-ddgg', 'direccion_asuntos_internos'),
            ref('d1-dependencias-ddgg', 'direccion_relaciones_policiales'),
            ref('d1-dependencias-ddgg', 'direccion_institutos_instruccion'),
            ref('d1-dependencias-ddgg', 'direccion_investigacion_criminal'),
            ref('d1-dependencias-ddgg', 'direccion_trata_personas_violencia_genero'),
            ref('d1-dependencias-ddgg', 'direccion_seguridad_poder_judicial'),
            ref('d1-dependencias-ddgg', 'direccion_drogas_peligrosas'),
            ref('d1-dependencias-ddgg', 'direccion_delitos_rurales_ambientales'),
            ref('d1-dependencias-ddgg', 'direccion_bomberos'),
            ref('d1-dependencias-ddgg', 'direccion_policia_cientifica'),
            ref('d1-dependencias-ddgg', 'direccion_prevencion'),
            ref('d1-dependencias-ddgg', 'direccion_unidades_especiales'),
            ref('d1-dependencias-ddgg', 'direccion_fuerzas_especiales'),
            ref('d1-dependencias-ddgg', 'direccion_seguridad_vial'),
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
      { kind: 'editable', rowId: 'division_seguridad_vial', label: 'DIVISION POLICIA SEGURIDAD VIAL' },
      { kind: 'editable', rowId: 'division_canes', label: 'DIVISION CANES' },
      { kind: 'editable', rowId: 'division_operaciones_enduro_rescate', label: 'DIVISION OPERACIONES ENDURO Y RESCATE' },
      { kind: 'editable', rowId: 'division_operaciones_motorizadas', label: 'DIVISION OPERACIONES MOTORIZADAS' },
      { kind: 'editable', rowId: 'division_equinos', label: 'DIVISION EQUINOS' },
      { kind: 'editable', rowId: 'cuerpo_especial_rescate_operaciones', label: 'CUERPO ESPECIAL RESCATE Y OPERACIONES' },
      { kind: 'editable', rowId: 'destacamentos_fronterizos', label: 'DESTACAMENTOS FRONTERIZOS' },
      { kind: 'editable', rowId: 'puesto_control_chorrillos', label: 'PUESTO CONTROL CHORRILLOS' },
      { kind: 'editable', rowId: 'urr_capital', label: 'URR CAPITAL' },
      { kind: 'editable', rowId: 'urr_norte', label: 'URR NORTE' },
      { kind: 'editable', rowId: 'urr_sur', label: 'URR SUR' },
      { kind: 'editable', rowId: 'urr_este', label: 'URR ESTE' },
      { kind: 'editable', rowId: 'urr_oeste', label: 'URR OESTE' },
      { kind: 'editable', rowId: 'situaciones_especiales', label: 'SITUACIONES ESPECIALES' },
      {
        kind: 'computed',
        rowId: 'total_dependencias_uurr',
        label: 'TOTAL DIVISIONES Y UURR',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-dependencias-divisiones-uurr', 'division_seguridad_vial'),
            ref('d1-dependencias-divisiones-uurr', 'division_canes'),
            ref('d1-dependencias-divisiones-uurr', 'division_operaciones_enduro_rescate'),
            ref('d1-dependencias-divisiones-uurr', 'division_operaciones_motorizadas'),
            ref('d1-dependencias-divisiones-uurr', 'division_equinos'),
            ref('d1-dependencias-divisiones-uurr', 'cuerpo_especial_rescate_operaciones'),
            ref('d1-dependencias-divisiones-uurr', 'destacamentos_fronterizos'),
            ref('d1-dependencias-divisiones-uurr', 'puesto_control_chorrillos'),
            ref('d1-dependencias-divisiones-uurr', 'urr_capital'),
            ref('d1-dependencias-divisiones-uurr', 'urr_norte'),
            ref('d1-dependencias-divisiones-uurr', 'urr_sur'),
            ref('d1-dependencias-divisiones-uurr', 'urr_este'),
            ref('d1-dependencias-divisiones-uurr', 'urr_oeste'),
            ref('d1-dependencias-divisiones-uurr', 'situaciones_especiales'),
          ],
        },
      },
    ],
  },
  {
    tableId: 'd1-situacion-particular',
    title: 'SITUACION PARTICULAR DE PERSONAL POLICIAL',
    sectionId: 'situacion-particular',
    variant: 'comparison-share',
    shareBase: ref('d1-situacion-particular', 'total_situacion_particular'),
    shareLabel: '% interno',
    rows: [
      { kind: 'editable', rowId: 'abandono_servicio', label: 'Abandono de servicio' },
      { kind: 'editable', rowId: 'abandono_servicio_pasivo_proceso', label: 'Aband. Serv. // Pasiv. Proceso' },
      { kind: 'editable', rowId: 'disponible_art_114_inc_1', label: 'Disponible Art. 114 inc. 1 ley 3823' },
      { kind: 'editable', rowId: 'disponible_art_203_inc_a', label: 'Disponible Art. 203 inc. A ley 3823' },
      { kind: 'editable', rowId: 'disponible_art_203_inc_b', label: 'Disponible Art. 203 inc. B ley 3823' },
      { kind: 'editable', rowId: 'disponible_por_enf_art_114_inc_2', label: 'Disponible por Enf. Art. 114 inc. 2 Ley 3823' },
      { kind: 'editable', rowId: 'disponible_por_enf_art_114_inc_2_art', label: 'Disponible por Enf. Art. 114 inc. 2 Ley 3823 ART' },
      { kind: 'editable', rowId: 'licencia_especial_sin_goce', label: 'Licencia especial sin goce de sueldo' },
      { kind: 'editable', rowId: 'pasivo_por_enf_art_116', label: 'Pasivo por Enf. Art. 116 Ley 3823' },
      { kind: 'editable', rowId: 'pasivo_por_enf_art_116_art', label: 'Pasivo por Enf. Art. 116 Ley 3823 ART' },
      { kind: 'editable', rowId: 'pasivo_por_enf_art_119_inc_1', label: 'Pasivo por Enf. Art. 119 inc. 1 Ley 3823' },
      { kind: 'editable', rowId: 'pasivo_por_enf_art_119_inc_1_art', label: 'Pasivo por Enf. Art. 119 inc. 1 Ley 3823 ART' },
      { kind: 'editable', rowId: 'pasivo_por_enf_art_119_inc_5', label: 'Pasivo por Enf. Art. 119 inc. 5 Ley 3823' },
      { kind: 'editable', rowId: 'pasivo_por_enf_art_119_inc_6', label: 'Pasivo por Enf. Art. 119 inc. 6 Ley 3823' },
      { kind: 'editable', rowId: 'renuncia_en_tramite', label: 'Renuncia en trámite' },
      { kind: 'editable', rowId: 'serv_efect_enfermedad_art_111_inc_2', label: 'Serv. Efect. Enfermedad Art. 111 inc. 2 Ley 3823' },
      { kind: 'editable', rowId: 'baja_laboral_art', label: 'Baja laboral ART' },
      { kind: 'editable', rowId: 'desafectacion_ptp', label: 'Desafectación de PTP' },
      { kind: 'editable', rowId: 'desvinculacion_ptp', label: 'Desvinculación PTP' },
      {
        kind: 'computed',
        rowId: 'total_situacion_particular',
        label: 'TOTAL',
        emphasis: 'total',
        formula: {
          type: 'sum',
          refs: [
            ref('d1-situacion-particular', 'abandono_servicio'),
            ref('d1-situacion-particular', 'abandono_servicio_pasivo_proceso'),
            ref('d1-situacion-particular', 'disponible_art_114_inc_1'),
            ref('d1-situacion-particular', 'disponible_art_203_inc_a'),
            ref('d1-situacion-particular', 'disponible_art_203_inc_b'),
            ref('d1-situacion-particular', 'disponible_por_enf_art_114_inc_2'),
            ref('d1-situacion-particular', 'disponible_por_enf_art_114_inc_2_art'),
            ref('d1-situacion-particular', 'licencia_especial_sin_goce'),
            ref('d1-situacion-particular', 'pasivo_por_enf_art_116'),
            ref('d1-situacion-particular', 'pasivo_por_enf_art_116_art'),
            ref('d1-situacion-particular', 'pasivo_por_enf_art_119_inc_1'),
            ref('d1-situacion-particular', 'pasivo_por_enf_art_119_inc_1_art'),
            ref('d1-situacion-particular', 'pasivo_por_enf_art_119_inc_5'),
            ref('d1-situacion-particular', 'pasivo_por_enf_art_119_inc_6'),
            ref('d1-situacion-particular', 'renuncia_en_tramite'),
            ref('d1-situacion-particular', 'serv_efect_enfermedad_art_111_inc_2'),
            ref('d1-situacion-particular', 'baja_laboral_art'),
            ref('d1-situacion-particular', 'desafectacion_ptp'),
            ref('d1-situacion-particular', 'desvinculacion_ptp'),
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
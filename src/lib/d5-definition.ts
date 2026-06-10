// ─────────────────────────────────────────────────────────────────────────────
// D5 – Departamento Judicial
// Definición de tablas estructuradas para el dashboard judicial.
// ─────────────────────────────────────────────────────────────────────────────

export const D5_CORE_TABLE_IDS = [
  'd5-detenidos-procesales',
  'd5-detenidos-pendientes',
];

export const D5_MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO',
  'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
] as const;

export type D5Mes = typeof D5_MESES[number];

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS SIMPLE COMPARACIÓN (1, 3, 6, 7)
// ─────────────────────────────────────────────────────────────────────────────
export interface D5ComparisonRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

// 1. Detenidos Procesales
export const D5_DETENIDOS_PROCESALES_DEFAULT: D5ComparisonRow[] = [
  { id: 'regional_capital', label: 'REGIONAL CAPITAL', periodoAnterior: 1534, periodoActual: 1004 },
  { id: 'regional_sur', label: 'REGIONAL SUR', periodoAnterior: 291, periodoActual: 332 },
  { id: 'regional_norte', label: 'REGIONAL NORTE', periodoAnterior: 961, periodoActual: 835 },
  { id: 'regional_este', label: 'REGIONAL ESTE', periodoAnterior: 458, periodoActual: 286 },
  { id: 'regional_oeste', label: 'REGIONAL OESTE', periodoAnterior: 184, periodoActual: 189 },
  { id: 'uic_dc', label: 'U.I.C Y D.C.', periodoAnterior: 329, periodoActual: 298 },
  { id: 'd2', label: 'D-2', periodoAnterior: 22, periodoActual: 18 },
  { id: 'digedrop', label: 'DIGEDROP', periodoAnterior: 136, periodoActual: 160 },
  { id: 'delitos_rurales', label: 'DELITOS RURALES', periodoAnterior: 27, periodoActual: 24 },
  { id: 'viol_genero', label: 'DIR. VIOL. GEN. Y TRATA DE PERSONA', periodoAnterior: 51, periodoActual: 20 },
  { id: 'gendarmeria', label: 'GENDARMERIA', periodoAnterior: 8, periodoActual: 15 },
];

// 3. Consignas Regionales
export const D5_CONSIGNAS_REGIONALES_DEFAULT: D5ComparisonRow[] = [
  { id: 'regional_capital', label: 'REGIONAL CAPITAL', periodoAnterior: 365, periodoActual: 259 },
  { id: 'regional_sur', label: 'REGIONAL SUR', periodoAnterior: 3, periodoActual: 7 },
  { id: 'regional_norte', label: 'REGIONAL NORTE', periodoAnterior: 129, periodoActual: 79 },
  { id: 'regional_este', label: 'REGIONAL ESTE', periodoAnterior: 138, periodoActual: 55 },
  { id: 'regional_oeste', label: 'REGIONAL OESTE', periodoAnterior: 29, periodoActual: 22 },
];

// 6. Servicio Penitenciario
export const D5_SERVICIO_PENITENCIARIO_DEFAULT: D5ComparisonRow[] = [
  { id: 'villa_urquiza', label: 'VILLA URQUIZA', periodoAnterior: 64, periodoActual: 41 },
  { id: 'benjamin_paz', label: 'BENJAMIN PAZ', periodoAnterior: 0, periodoActual: 405 },
  { id: 'unidad_3_concepcion', label: 'UNIDAD Nº 3 CONCEPCION', periodoAnterior: 11, periodoActual: 10 },
  { id: 'unidad_4_mujeres', label: 'UNIDAD Nº 4 (MUJERES)', periodoAnterior: 4, periodoActual: 0 },
  { id: 'delfin_gallo_mujeres', label: 'DELIN GALLO (MUJERES)', periodoAnterior: 0, periodoActual: 54 },
];

// 7. Armas de Fuego Secuestradas
export const D5_ARMAS_SECUESTRADAS_DEFAULT: D5ComparisonRow[] = [
  { id: 'regional_capital', label: 'UNIDAD REGIONAL CAPITAL', periodoAnterior: 81, periodoActual: 135 },
  { id: 'regional_este', label: 'UNIDAD REGIONAL ESTE', periodoAnterior: 87, periodoActual: 94 },
  { id: 'regional_norte', label: 'UNIDAD REGIONAL NORTE', periodoAnterior: 32, periodoActual: 26 },
  { id: 'regional_oeste', label: 'UNIDAD REGIONAL OESTE', periodoAnterior: 17, periodoActual: 20 },
  { id: 'regional_sur', label: 'UNIDAD REGIONAL SUR', periodoAnterior: 27, periodoActual: 46 },
  { id: 'uic_dc', label: 'U.I.C. Y D.C.', periodoAnterior: 65, periodoActual: 76 },
  { id: 'd2', label: 'D-2', periodoAnterior: 5, periodoActual: 4 },
  { id: 'delitos_rurales', label: 'DELITOS RURALES', periodoAnterior: 46, periodoActual: 39 },
  { id: 'digedrop', label: 'DIGEDROP', periodoAnterior: 8, periodoActual: 6 },
  { id: 'uuee', label: 'DIR. GRAL. DE UU.EE.', periodoAnterior: 8, periodoActual: 4 },
  { id: 'viol_genero', label: 'VIOLENCIA DE GENERO Y TRATA DE PERSONA', periodoAnterior: 6, periodoActual: 4 },
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS MENSUALES
// ─────────────────────────────────────────────────────────────────────────────

export interface D5MonthlyInputRow {
  concept: string;
  label: string;
  mes: D5Mes;
  anio: 2024 | 2025;
  valor: number;
}

// 2. Detenidos con Pendientes (Capturas)
export interface D5DetenidosPendientesRow {
  concept: 'ley5140' | 'busqueda';
  label: string;
  mes: D5Mes;
  anio: 2024 | 2025;
  valor: number;
}

export const D5_PENDIENTES_CONCEPTS = [
  { id: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140' },
  { id: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS' },
] as const;

export const D5_DETENIDOS_PENDIENTES_DEFAULT: D5DetenidosPendientesRow[] = [
  // LEY 5140 - 2024
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'ENERO', anio: 2024, valor: 25 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'FEBRERO', anio: 2024, valor: 15 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'MARZO', anio: 2024, valor: 14 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'ABRIL', anio: 2024, valor: 7 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'MAYO', anio: 2024, valor: 12 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'JUNIO', anio: 2024, valor: 14 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'JULIO', anio: 2024, valor: 1 },
  // LEY 5140 - 2025
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'ENERO', anio: 2025, valor: 13 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'FEBRERO', anio: 2025, valor: 5 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'MARZO', anio: 2025, valor: 8 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'ABRIL', anio: 2025, valor: 2 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'MAYO', anio: 2025, valor: 1 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'JUNIO', anio: 2025, valor: 1 },
  { concept: 'ley5140', label: 'DETENIDOS INFRAC. LEY 5140', mes: 'JULIO', anio: 2025, valor: 0 },

  // BUSQUEDA - 2024
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'ENERO', anio: 2024, valor: 5 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'FEBRERO', anio: 2024, valor: 5 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'MARZO', anio: 2024, valor: 15 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'ABRIL', anio: 2024, valor: 17 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'MAYO', anio: 2024, valor: 16 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'JUNIO', anio: 2024, valor: 18 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'JULIO', anio: 2024, valor: 11 },
  // BUSQUEDA - 2025
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'ENERO', anio: 2025, valor: 6 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'FEBRERO', anio: 2025, valor: 5 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'MARZO', anio: 2025, valor: 14 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'ABRIL', anio: 2025, valor: 22 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'MAYO', anio: 2025, valor: 19 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'JUNIO', anio: 2025, valor: 23 },
  { concept: 'busqueda', label: 'DIV. BUSQUEDA Y CAPTURA DE PROFUGOS', mes: 'JULIO', anio: 2025, valor: 13 },
];

// 4. Detenidos Contravencionales
export interface D5DetenidosContravencionalesRow {
  concept: string; // regional_capital, regional_sur, etc.
  label: string;
  mes: D5Mes;
  anio: 2024 | 2025;
  valor: number;
}

export const D5_CONTRAVENCIONALES_CONCEPTS = [
  { id: 'regional_capital', label: 'REGIONAL CAPITAL' },
  { id: 'regional_sur', label: 'REGIONAL SUR' },
  { id: 'regional_norte', label: 'REGIONAL NORTE' },
  { id: 'regional_este', label: 'REGIONAL ESTE' },
  { id: 'regional_oeste', label: 'REGIONAL OESTE' },
  { id: 'di_cy_dc', label: 'DI Cy DC' },
  { id: 'd2', label: 'D-2' },
  { id: 'digedrop', label: 'DIGEDROP' },
  { id: 'dgpc', label: 'DGPC' },
  { id: 'dgt_pyvg', label: 'DGT PyVG' },
  { id: 'delitos_rurales', label: 'DELITOS RURALES' },
] as const;

// Helper function to fill rest of months as 0
const rawContravencionalesSeeded: Record<string, Record<2024 | 2025, number[]>> = {
  regional_capital: {
    2024: [355, 224, 307, 311, 396, 854, 605],
    2025: [805, 323, 364, 181, 3, 0, 0],
  },
  regional_sur: {
    2024: [147, 108, 61, 30, 33, 101, 51],
    2025: [0, 0, 1, 0, 0, 0, 0],
  },
  regional_norte: {
    2024: [349, 299, 157, 131, 192, 164, 147],
    2025: [77, 5, 32, 11, 35, 7, 2],
  },
  regional_este: {
    2024: [179, 148, 70, 69, 156, 87, 50],
    2025: [0, 8, 0, 0, 1, 0, 0],
  },
  regional_oeste: {
    2024: [174, 122, 99, 74, 82, 71, 43],
    2025: [0, 0, 1, 0, 0, 0, 1],
  },
  di_cy_dc: {
    2024: [43, 39, 52, 42, 29, 15, 13],
    2025: [162, 235, 259, 148, 139, 45, 30],
  },
  d2: {
    2024: [0, 0, 2, 0, 0, 0, 0],
    2025: [0, 0, 0, 0, 0, 0, 0],
  },
  digedrop: {
    2024: [1, 1, 0, 0, 1, 9, 23],
    2025: [17, 13, 35, 23, 18, 30, 19],
  },
  dgpc: {
    2024: [250, 183, 32, 21, 9, 8, 5],
    2025: [0, 0, 0, 0, 0, 0, 0],
  },
  dgt_pyvg: {
    2024: [0, 0, 0, 0, 0, 0, 0],
    2025: [0, 0, 0, 0, 0, 0, 0],
  },
  delitos_rurales: {
    2024: [0, 2, 0, 0, 0, 3, 1],
    2025: [0, 0, 0, 3, 7, 1, 0],
  },
};

export const D5_DETENIDOS_CONTRAVENCIONALES_DEFAULT: D5DetenidosContravencionalesRow[] = (() => {
  const rows: D5DetenidosContravencionalesRow[] = [];
  for (const concept of D5_CONTRAVENCIONALES_CONCEPTS) {
    const data = rawContravencionalesSeeded[concept.id] || {
      2024: [0, 0, 0, 0, 0, 0, 0],
      2025: [0, 0, 0, 0, 0, 0, 0],
    };
    for (const anio of [2024, 2025] as const) {
      const vals = data[anio];
      for (let i = 0; i < D5_MESES.length; i++) {
        const mes = D5_MESES[i];
        const valor = vals[i] ?? 0;
        rows.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }
  return rows;
})();

// 5. Recursos Habeas Corpus (simple table structured by month rows)
export const D5_RECURSOS_HABEAS_CORPUS_DEFAULT: D5ComparisonRow[] = [
  { id: 'enero', label: 'ENERO', periodoAnterior: 4, periodoActual: 17 },
  { id: 'febrero', label: 'FEBRERO', periodoAnterior: 8, periodoActual: 21 },
  { id: 'marzo', label: 'MARZO', periodoAnterior: 7, periodoActual: 39 },
  { id: 'abril', label: 'ABRIL', periodoAnterior: 20, periodoActual: 20 },
  { id: 'mayo', label: 'MAYO', periodoAnterior: 53, periodoActual: 30 },
  { id: 'junio', label: 'JUNIO', periodoAnterior: 58, periodoActual: 28 },
  { id: 'julio', label: 'JULIO', periodoAnterior: 42, periodoActual: 32 },
  { id: 'agosto', label: 'AGOSTO', periodoAnterior: 0, periodoActual: 0 },
  { id: 'septiembre', label: 'SEPTIEMBRE', periodoAnterior: 0, periodoActual: 0 },
  { id: 'octubre', label: 'OCTUBRE', periodoAnterior: 0, periodoActual: 0 },
  { id: 'noviembre', label: 'NOVIEMBRE', periodoAnterior: 0, periodoActual: 0 },
  { id: 'diciembre', label: 'DICIEMBRE', periodoAnterior: 0, periodoActual: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// Raw table IDs in database
// ─────────────────────────────────────────────────────────────────────────────
export const D5_TABLE_IDS = {
  PROCESALES: 'd5-detenidos-procesales',
  PENDIENTES: 'd5-detenidos-pendientes',
  CONSIGNAS: 'd5-consignas-regionales',
  CONTRAVENCIONALES: 'd5-detenidos-contravencionales',
  HABEAS_CORPUS: 'd5-recursos-habeas-corpus',
  SERVICIO_PENITENCIARIO: 'd5-detenidos-servicio-penitenciario',
  ARMAS_SECUESTRADAS: 'd5-armas-secuestradas',
  PERSONAL_POLICIAL_DETENIDO: 'd5-personal-policial-detenido',
  DETENIDOS_LIBERADOS: 'd5-detenidos-liberados',
  LLAMADAS_ANTECEDENTES: 'd5-llamadas-antecedentes',
} as const;

// 8. Personal Policial Detenido (simple table)
export const D5_PERSONAL_POLICIAL_DETENIDO_DEFAULT: D5ComparisonRow[] = [
  { id: 'regional_capital', label: 'UNIDAD REGIONAL CAPITAL', periodoAnterior: 19, periodoActual: 2 },
  { id: 'regional_este', label: 'UNIDAD REGIONAL ESTE', periodoAnterior: 4, periodoActual: 2 },
  { id: 'regional_norte', label: 'UNIDAD REGIONAL NORTE', periodoAnterior: 1, periodoActual: 0 },
  { id: 'regional_oeste', label: 'UNIDAD REGIONAL OESTE', periodoAnterior: 6, periodoActual: 0 },
  { id: 'regional_sur', label: 'UNIDAD REGIONAL SUR', periodoAnterior: 4, periodoActual: 1 },
  { id: 'uic_dc', label: 'U.I.C. Y D.C.', periodoAnterior: 1, periodoActual: 5 },
  { id: 'd2', label: 'D-2', periodoAnterior: 0, periodoActual: 2 },
  { id: 'viol_genero', label: 'VIOLENCIA DE GENERO Y TRATA DE PERSONA', periodoAnterior: 0, periodoActual: 1 },
];

// 9. Detenidos Procesales Liberados
export const D5_LIBERADOS_CONCEPTS = [
  { id: 'dependencias', label: 'DEPENDENCIA POLICIALES' },
  { id: 'penal', label: 'PENAL' },
] as const;

const rawLiberadosSeeded: Record<string, Record<2024 | 2025, number[]>> = {
  dependencias: {
    2024: [287, 364, 394, 363, 348, 312, 349],
    2025: [263, 503, 525, 432, 396, 472, 192],
  },
  penal: {
    2024: [12, 26, 24, 13, 16, 25, 25],
    2025: [4, 14, 23, 25, 20, 18, 25],
  },
};

export const D5_DETENIDOS_LIBERADOS_DEFAULT: D5MonthlyInputRow[] = (() => {
  const rows: D5MonthlyInputRow[] = [];
  for (const concept of D5_LIBERADOS_CONCEPTS) {
    const data = rawLiberadosSeeded[concept.id] || {
      2024: [0, 0, 0, 0, 0, 0, 0],
      2025: [0, 0, 0, 0, 0, 0, 0],
    };
    for (const anio of [2024, 2025] as const) {
      const vals = data[anio];
      for (let i = 0; i < D5_MESES.length; i++) {
        const mes = D5_MESES[i];
        const valor = vals[i] ?? 0;
        rows.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }
  return rows;
})();

// 10. Estadísticas de Llamadas sobre Antecedentes - Periodo 2025 (simple monthly year data)
export const D5_LLAMADAS_CONCEPTS = [
  { id: 'con_novedad', label: 'CON NOVEDAD' },
  { id: 'sin_novedad', label: 'SIN NOVEDAD' },
] as const;

const rawLlamadasSeeded: Record<string, number[]> = {
  con_novedad: [0, 0, 2, 5, 31, 14, 1], // Ene, Feb, Mar, Abr, May, Jun, Jul
  sin_novedad: [0, 0, 57, 286, 213, 138, 51],
};

export const D5_LLAMADAS_ANTECEDENTES_DEFAULT: D5MonthlyInputRow[] = (() => {
  const rows: D5MonthlyInputRow[] = [];
  for (const concept of D5_LLAMADAS_CONCEPTS) {
    const vals = rawLlamadasSeeded[concept.id] || [0, 0, 0, 0, 0, 0, 0];
    for (const anio of [2024, 2025] as const) {
      for (let i = 0; i < D5_MESES.length; i++) {
        const mes = D5_MESES[i];
        // En 2024 es 0, en 2025 tiene los valores reales
        const valor = anio === 2025 ? (vals[i] ?? 0) : 0;
        rows.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }
  return rows;
})();


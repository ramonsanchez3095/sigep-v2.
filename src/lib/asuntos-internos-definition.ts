// ─────────────────────────────────────────────────────────────────────────────
// Asuntos Internos – Dirección General de Asuntos Internos
// Definición de tablas estructuradas para el dashboard de Asuntos Internos.
// ─────────────────────────────────────────────────────────────────────────────

export const AI_CORE_TABLE_IDS = [
  'ai-denuncias-resumen',
  'ai-denuncias-tipos',
];

export const AI_MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO',
  'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
] as const;

export type AIMes = typeof AI_MESES[number];

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS SIMPLE COMPARACIÓN
// ─────────────────────────────────────────────────────────────────────────────
export interface AIComparisonRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

// 1. Denuncias Recibidas (Simple table)
export const AI_DENUNCIAS_DEFAULT: AIComparisonRow[] = [
  { id: 'abuso_autoridad', label: 'ABUSO DE AUTORIDAD', periodoAnterior: 45, periodoActual: 38 },
  { id: 'negligencia', label: 'NEGLIGENCIA', periodoAnterior: 67, periodoActual: 54 },
  { id: 'abandono', label: 'ABANDONO DE SERVICIO', periodoAnterior: 23, periodoActual: 19 },
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS MENSUALES
// ─────────────────────────────────────────────────────────────────────────────

export interface AIMonthlyInputRow {
  concept: string;
  label: string;
  mes: AIMes;
  anio: 2024 | 2025;
  valor: number;
}

// Raw table IDs in database
export const AI_TABLE_IDS = {
  DENUNCIAS: 'ai-denuncias',
  DENUNCIAS_TIPOS: 'ai-denuncias-tipos',
  DENUNCIAS_SUPERIOR: 'ai-denuncias-superior',
  DENUNCIAS_SUBOFICIAL: 'ai-denuncias-suboficial',
  DENUNCIAS_RESUMEN: 'ai-denuncias-resumen',
  ACTUACIONES_REDES: 'ai-actuaciones-redes',
  ACTUACIONES_ARMAS: 'ai-actuaciones-armas',
} as const;

// 2. Tipos de Denuncias realizadas a Personal Policial
export const AI_DENUNCIAS_TIPOS_CONCEPTS = [
  { id: 'violencia_genero', label: 'VIOLENCIA DE GENERO Y/O FAMILIAR' },
  { id: 'amenazas', label: 'AMENAZAS, AMENAZAS AGRAV.' },
  { id: 'robo_hurto_armas', label: 'ROBO - HURTO DE ARMAS' },
  { id: 'perdida_extravio', label: 'PERDIDA Y/O EXTRAVIO DE BIENES DE LA REPART. POL.' },
  { id: 'evasion', label: 'EVASION' },
  { id: 'abuso_autoridad', label: 'ABUSO DE AUTORIDAD E INCUMPL. DEB FUNC. PUBL.' },
  { id: 'cohecho', label: 'COHECHO' },
  { id: 'su_denuncia', label: 'SU DENUNCIA' },
  { id: 'lesiones', label: 'LESIONES' },
  { id: 'sedicion', label: 'DELITOS DE INSTIGACION PUBLICA (SEDICION)' },
] as const;

const rawDenunciasTiposSeeded: Record<string, Record<2024 | 2025, number[]>> = {
  violencia_genero: {
    2024: [6, 5, 7, 6, 5, 6, 5],
    2025: [5, 4, 5, 5, 4, 5, 4],
  },
  amenazas: {
    2024: [5, 4, 5, 5, 4, 5, 4],
    2025: [3, 2, 3, 3, 2, 3, 3],
  },
  robo_hurto_armas: {
    2024: [1, 2, 1, 2, 1, 2, 1],
    2025: [2, 1, 2, 1, 2, 1, 1],
  },
  perdida_extravio: {
    2024: [1, 0, 1, 0, 0, 0, 0],
    2025: [2, 2, 2, 1, 2, 2, 1],
  },
  evasion: {
    2024: [1, 1, 1, 1, 1, 1, 1],
    2025: [1, 1, 1, 1, 1, 1, 1],
  },
  abuso_autoridad: {
    2024: [20, 18, 22, 17, 19, 18, 18],
    2025: [6, 5, 6, 5, 6, 5, 5],
  },
  cohecho: {
    2024: [1, 0, 0, 1, 0, 0, 0],
    2025: [0, 1, 0, 0, 1, 0, 0],
  },
  su_denuncia: {
    2024: [11, 10, 12, 10, 11, 10, 10],
    2025: [9, 9, 10, 9, 9, 9, 8],
  },
  lesiones: {
    2024: [8, 7, 8, 7, 8, 7, 6],
    2025: [4, 4, 5, 4, 4, 5, 4],
  },
  sedicion: {
    2024: [1, 0, 0, 0, 0, 0, 0],
    2025: [0, 0, 0, 0, 0, 0, 0],
  },
};

export const AI_DENUNCIAS_TIPOS_DEFAULT: AIMonthlyInputRow[] = (() => {
  const rows: AIMonthlyInputRow[] = [];
  for (const concept of AI_DENUNCIAS_TIPOS_CONCEPTS) {
    const data = rawDenunciasTiposSeeded[concept.id] || {
      2024: [0, 0, 0, 0, 0, 0, 0],
      2025: [0, 0, 0, 0, 0, 0, 0],
    };
    for (const anio of [2024, 2025] as const) {
      const vals = data[anio];
      for (let i = 0; i < AI_MESES.length; i++) {
        const mes = AI_MESES[i];
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

// 3. Personal Policial Superior Denunciado
export const AI_DENUNCIAS_SUPERIOR_CONCEPTS = [
  { id: 'comisario_inspector', label: 'COMISARIO INSPECTOR' },
  { id: 'comisario_principal', label: 'COMISARIO PRINCIPAL' },
  { id: 'comisario', label: 'COMISARIO' },
  { id: 'subcomisario', label: 'SUBCOMISARIO' },
  { id: 'of_principal', label: 'OF. PRINCIPAL' },
  { id: 'of_auxiliar', label: 'OF. AUXILIAR' },
  { id: 'of_ayudante', label: 'OF. AYUDANTE' },
  { id: 'of_subayudante', label: 'OF. SUBAYUDANTE' },
] as const;

const rawDenunciasSuperiorSeeded: Record<string, Record<2024 | 2025, number[]>> = {
  comisario_inspector: {
    2024: [1, 0, 0, 0, 0, 0, 0],
    2025: [0, 0, 0, 0, 0, 0, 0],
  },
  comisario_principal: {
    2024: [1, 1, 1, 0, 0, 0, 0],
    2025: [1, 1, 1, 1, 1, 1, 1],
  },
  comisario: {
    2024: [1, 1, 1, 1, 0, 0, 0],
    2025: [1, 1, 1, 1, 0, 0, 0],
  },
  subcomisario: {
    2024: [1, 1, 1, 1, 1, 0, 0],
    2025: [1, 1, 1, 0, 0, 0, 0],
  },
  of_principal: {
    2024: [3, 3, 3, 3, 3, 3, 2],
    2025: [1, 1, 1, 1, 1, 1, 0],
  },
  of_auxiliar: {
    2024: [1, 1, 1, 1, 1, 1, 1],
    2025: [2, 1, 2, 1, 2, 1, 1],
  },
  of_ayudante: {
    2024: [2, 2, 2, 1, 2, 1, 1],
    2025: [1, 1, 1, 1, 1, 1, 0],
  },
  of_subayudante: {
    2024: [2, 2, 2, 2, 2, 2, 2],
    2025: [1, 1, 1, 1, 1, 1, 0],
  },
};

export const AI_DENUNCIAS_SUPERIOR_DEFAULT: AIMonthlyInputRow[] = (() => {
  const rows: AIMonthlyInputRow[] = [];
  for (const concept of AI_DENUNCIAS_SUPERIOR_CONCEPTS) {
    const data = rawDenunciasSuperiorSeeded[concept.id] || {
      2024: [0, 0, 0, 0, 0, 0, 0],
      2025: [0, 0, 0, 0, 0, 0, 0],
    };
    for (const anio of [2024, 2025] as const) {
      const vals = data[anio];
      for (let i = 0; i < AI_MESES.length; i++) {
        const mes = AI_MESES[i];
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

// 4. Personal Policial Suboficial Denunciado
export const AI_DENUNCIAS_SUBOFICIAL_CONCEPTS = [
  { id: 'subofic_mayor', label: 'SUBOFIC. MAYOR' },
  { id: 'subofic_principal', label: 'SUBOFIC. PRINCIPAL' },
  { id: 'sargento_ayudante', label: 'SARGENTO AYUDANTE' },
  { id: 'sargento_1', label: 'SARGENTO 1°' },
  { id: 'sargento', label: 'SARGENTO' },
  { id: 'cabo_1', label: 'CABO 1°' },
  { id: 'cabo', label: 'CABO' },
  { id: 'agente', label: 'AGENTE' },
  { id: 'pers_transitorio', label: 'PERS. TRANSITORIO POLICIAL' },
] as const;

const rawDenunciasSuboficialSeeded: Record<string, Record<2024 | 2025, number[]>> = {
  subofic_mayor: {
    2024: [1, 1, 1, 1, 0, 0, 0],
    2025: [1, 1, 0, 0, 0, 0, 0],
  },
  subofic_principal: {
    2024: [1, 0, 0, 0, 0, 0, 0],
    2025: [1, 0, 0, 0, 0, 0, 0],
  },
  sargento_ayudante: {
    2024: [2, 1, 2, 1, 2, 1, 1],
    2025: [1, 1, 1, 0, 0, 0, 0],
  },
  sargento_1: {
    2024: [4, 4, 4, 4, 4, 4, 3],
    2025: [2, 2, 2, 2, 2, 2, 2],
  },
  sargento: {
    2024: [7, 6, 7, 6, 7, 7, 6],
    2025: [2, 2, 2, 2, 2, 2, 1],
  },
  cabo_1: {
    2024: [9, 8, 9, 8, 9, 8, 8],
    2025: [10, 9, 10, 9, 9, 9, 9],
  },
  cabo: {
    2024: [12, 11, 12, 11, 11, 11, 11],
    2025: [8, 7, 8, 7, 8, 7, 7],
  },
  agente: {
    2024: [8, 8, 8, 8, 8, 8, 7],
    2025: [6, 5, 6, 5, 5, 5, 5],
  },
  pers_transitorio: {
    2024: [12, 11, 12, 11, 11, 11, 11],
    2025: [8, 7, 8, 7, 7, 7, 7],
  },
};

export const AI_DENUNCIAS_SUBOFICIAL_DEFAULT: AIMonthlyInputRow[] = (() => {
  const rows: AIMonthlyInputRow[] = [];
  for (const concept of AI_DENUNCIAS_SUBOFICIAL_CONCEPTS) {
    const data = rawDenunciasSuboficialSeeded[concept.id] || {
      2024: [0, 0, 0, 0, 0, 0, 0],
      2025: [0, 0, 0, 0, 0, 0, 0],
    };
    for (const anio of [2024, 2025] as const) {
      const vals = data[anio];
      for (let i = 0; i < AI_MESES.length; i++) {
        const mes = AI_MESES[i];
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

// 5. Personal Policial Denunciado (Resumen)
export const AI_DENUNCIAS_RESUMEN_CONCEPTS = [
  { id: 'personal_superior', label: 'PERSONAL SUPERIOR' },
  { id: 'personal_suboficial', label: 'PERSONAL SUBOFICIAL' },
] as const;

const rawDenunciasResumenSeeded: Record<string, Record<2024 | 2025, number[]>> = {
  personal_superior: {
    2024: [11, 10, 11, 9, 8, 8, 8],
    2025: [7, 6, 7, 6, 6, 6, 4],
  },
  personal_suboficial: {
    2024: [56, 51, 53, 50, 43, 40, 67],
    2025: [39, 34, 35, 32, 33, 32, 33],
  },
};

export const AI_DENUNCIAS_RESUMEN_DEFAULT: AIMonthlyInputRow[] = (() => {
  const rows: AIMonthlyInputRow[] = [];
  for (const concept of AI_DENUNCIAS_RESUMEN_CONCEPTS) {
    const data = rawDenunciasResumenSeeded[concept.id] || {
      2024: [0, 0, 0, 0, 0, 0, 0],
      2025: [0, 0, 0, 0, 0, 0, 0],
    };
    for (const anio of [2024, 2025] as const) {
      const vals = data[anio];
      for (let i = 0; i < AI_MESES.length; i++) {
        const mes = AI_MESES[i];
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

// 6. Actuaciones Redes
export const AI_ACTUACIONES_REDES_CONCEPTS = [
  { id: 'deriv_public_redes', label: 'DERIV PUBLIC. REDES SOCIALES EN TRAMITE' },
] as const;

const rawActuacionesRedesSeeded: Record<string, Record<2024 | 2025, number[]>> = {
  deriv_public_redes: {
    2024: [1, 1, 1, 1, 1, 1, 0],
    2025: [5, 4, 5, 5, 4, 4, 4],
  },
};

export const AI_ACTUACIONES_REDES_DEFAULT: AIMonthlyInputRow[] = (() => {
  const rows: AIMonthlyInputRow[] = [];
  for (const concept of AI_ACTUACIONES_REDES_CONCEPTS) {
    const data = rawActuacionesRedesSeeded[concept.id] || {
      2024: [0, 0, 0, 0, 0, 0, 0],
      2025: [0, 0, 0, 0, 0, 0, 0],
    };
    for (const anio of [2024, 2025] as const) {
      const vals = data[anio];
      for (let i = 0; i < AI_MESES.length; i++) {
        const mes = AI_MESES[i];
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

// 7. Actuaciones Armas
export const AI_ACTUACIONES_ARMAS_CONCEPTS = [
  { id: 'robo_hurto_arma', label: 'ROBO Y/O HURTO DE ARMA REGLAMENTARIA' },
  { id: 'extravio_arma', label: 'EXTRAVIO DE ARMA REGLAMENTARIA' },
] as const;

const rawActuacionesArmasSeeded: Record<string, Record<2024 | 2025, number[]>> = {
  robo_hurto_arma: {
    2024: [2, 1, 2, 1, 2, 1, 1],
    2025: [1, 2, 1, 2, 1, 2, 1],
  },
  extravio_arma: {
    2024: [0, 0, 0, 0, 0, 0, 0],
    2025: [0, 0, 0, 0, 0, 0, 0],
  },
};

export const AI_ACTUACIONES_ARMAS_DEFAULT: AIMonthlyInputRow[] = (() => {
  const rows: AIMonthlyInputRow[] = [];
  for (const concept of AI_ACTUACIONES_ARMAS_CONCEPTS) {
    const data = rawActuacionesArmasSeeded[concept.id] || {
      2024: [0, 0, 0, 0, 0, 0, 0],
      2025: [0, 0, 0, 0, 0, 0, 0],
    };
    for (const anio of [2024, 2025] as const) {
      const vals = data[anio];
      for (let i = 0; i < AI_MESES.length; i++) {
        const mes = AI_MESES[i];
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

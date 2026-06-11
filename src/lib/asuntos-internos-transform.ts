// ─────────────────────────────────────────────────────────────────────────────
// Asuntos Internos – Motor de transformación
// Convierte tablas raw de BD en datos tipados para el dashboard de Asuntos Internos.
// ─────────────────────────────────────────────────────────────────────────────

import {
  AI_TABLE_IDS,
  AI_CORE_TABLE_IDS,
  AI_MESES,
  AI_DENUNCIAS_DEFAULT,
  AI_DENUNCIAS_TIPOS_DEFAULT,
  AI_DENUNCIAS_SUPERIOR_DEFAULT,
  AI_DENUNCIAS_SUBOFICIAL_DEFAULT,
  AI_DENUNCIAS_RESUMEN_DEFAULT,
  AI_ACTUACIONES_REDES_DEFAULT,
  AI_ACTUACIONES_ARMAS_DEFAULT,
  AI_DENUNCIAS_TIPOS_CONCEPTS,
  AI_DENUNCIAS_SUPERIOR_CONCEPTS,
  AI_DENUNCIAS_SUBOFICIAL_CONCEPTS,
  AI_DENUNCIAS_RESUMEN_CONCEPTS,
  AI_ACTUACIONES_REDES_CONCEPTS,
  AI_ACTUACIONES_ARMAS_CONCEPTS,
  type AIComparisonRow,
  type AIMonthlyInputRow,
  type AIMes,
} from './asuntos-internos-definition';

// ─── Tipos raw (desde la BD) ──────────────────────────────────────────────────
export interface AIRawRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

export interface AIRawTable {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: AIRawRow[];
}

// ─── Dashboard data ───────────────────────────────────────────────────────────
export interface AIDashboardData {
  isReady: boolean;
  denunciasRecibidas: AIComparisonRow[];
  denunciasTipos: AIMonthlyInputRow[];
  denunciasSuperior: AIMonthlyInputRow[];
  denunciasSuboficial: AIMonthlyInputRow[];
  denunciasResumen: AIMonthlyInputRow[];
  actuacionesRedes: AIMonthlyInputRow[];
  actuacionesArmas: AIMonthlyInputRow[];
  rawTableIds: Record<string, string | undefined>; // tablaId → table db id
}

// ─── Activación de la vista avanzada ─────────────────────────────────────────
export function hasAsuntosInternosStructuredTables(rawTables: AIRawTable[]): boolean {
  const ids = new Set(rawTables.map((t) => t.tablaId));
  return AI_CORE_TABLE_IDS.every((id) => ids.has(id));
}

// ─── Reemplazo de filas ───────────────────────────────────────────────────────
export function replaceAIRawTableRows(
  rawTables: AIRawTable[],
  tableId: string,
  nextRows: AIRawRow[]
): AIRawTable[] {
  return rawTables.map((t) =>
    t.tablaId === tableId ? { ...t, datos: nextRows } : t
  );
}

// ─── Helpers de parseo ────────────────────────────────────────────────────────
function findTable(rawTables: AIRawTable[], tablaId: string) {
  return rawTables.find((t) => t.tablaId === tablaId);
}

function rowVal(table: AIRawTable | undefined, rowId: string, field: 'periodoAnterior' | 'periodoActual'): number {
  if (!table) return 0;
  return table.datos.find((r) => r.id === rowId)?.[field] ?? 0;
}

// ─── Dashboard builder ────────────────────────────────────────────────────────
export function buildAsuntosInternosDashboard(rawTables: AIRawTable[]): AIDashboardData {
  const rawTableIds: Record<string, string | undefined> = {};

  // 1. Denuncias Recibidas (Simple table)
  const denunciasTable = findTable(rawTables, AI_TABLE_IDS.DENUNCIAS);
  rawTableIds[AI_TABLE_IDS.DENUNCIAS] = denunciasTable?.id;
  const denunciasRecibidas: AIComparisonRow[] = AI_DENUNCIAS_DEFAULT.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(denunciasTable, def.id, 'periodoAnterior'),
    periodoActual: rowVal(denunciasTable, def.id, 'periodoActual'),
  }));

  // 2. Tipos de Denuncias
  const denunciasTiposTable = findTable(rawTables, AI_TABLE_IDS.DENUNCIAS_TIPOS);
  rawTableIds[AI_TABLE_IDS.DENUNCIAS_TIPOS] = denunciasTiposTable?.id;
  const denunciasTipos: AIMonthlyInputRow[] = [];
  for (const concept of AI_DENUNCIAS_TIPOS_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of AI_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = denunciasTiposTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        denunciasTipos.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  // 3. Personal Superior Denunciado
  const denunciasSuperiorTable = findTable(rawTables, AI_TABLE_IDS.DENUNCIAS_SUPERIOR);
  rawTableIds[AI_TABLE_IDS.DENUNCIAS_SUPERIOR] = denunciasSuperiorTable?.id;
  const denunciasSuperior: AIMonthlyInputRow[] = [];
  for (const concept of AI_DENUNCIAS_SUPERIOR_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of AI_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = denunciasSuperiorTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        denunciasSuperior.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  // 4. Personal Suboficial Denunciado
  const denunciasSuboficialTable = findTable(rawTables, AI_TABLE_IDS.DENUNCIAS_SUBOFICIAL);
  rawTableIds[AI_TABLE_IDS.DENUNCIAS_SUBOFICIAL] = denunciasSuboficialTable?.id;
  const denunciasSuboficial: AIMonthlyInputRow[] = [];
  for (const concept of AI_DENUNCIAS_SUBOFICIAL_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of AI_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = denunciasSuboficialTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        denunciasSuboficial.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  // 5. Personal Policial Denunciado (Resumen)
  const denunciasResumenTable = findTable(rawTables, AI_TABLE_IDS.DENUNCIAS_RESUMEN);
  rawTableIds[AI_TABLE_IDS.DENUNCIAS_RESUMEN] = denunciasResumenTable?.id;
  const denunciasResumen: AIMonthlyInputRow[] = [];
  for (const concept of AI_DENUNCIAS_RESUMEN_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of AI_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = denunciasResumenTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        denunciasResumen.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  // 6. Actuaciones Redes
  const actuacionesRedesTable = findTable(rawTables, AI_TABLE_IDS.ACTUACIONES_REDES);
  rawTableIds[AI_TABLE_IDS.ACTUACIONES_REDES] = actuacionesRedesTable?.id;
  const actuacionesRedes: AIMonthlyInputRow[] = [];
  for (const concept of AI_ACTUACIONES_REDES_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of AI_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = actuacionesRedesTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        actuacionesRedes.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  // 7. Actuaciones Armas
  const actuacionesArmasTable = findTable(rawTables, AI_TABLE_IDS.ACTUACIONES_ARMAS);
  rawTableIds[AI_TABLE_IDS.ACTUACIONES_ARMAS] = actuacionesArmasTable?.id;
  const actuacionesArmas: AIMonthlyInputRow[] = [];
  for (const concept of AI_ACTUACIONES_ARMAS_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of AI_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = actuacionesArmasTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        actuacionesArmas.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  return {
    isReady: hasAsuntosInternosStructuredTables(rawTables),
    denunciasRecibidas,
    denunciasTipos,
    denunciasSuperior,
    denunciasSuboficial,
    denunciasResumen,
    actuacionesRedes,
    actuacionesArmas,
    rawTableIds,
  };
}

// ─── Seed factory para Asuntos Internos ──────────────────────────────────────────
export function createAsuntosInternosSeedTables() {
  const tables = [];

  // 1. Denuncias Recibidas (Simple table)
  tables.push({
    tablaId: AI_TABLE_IDS.DENUNCIAS,
    nombre: 'Denuncias Recibidas',
    datos: AI_DENUNCIAS_DEFAULT.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  });

  // 2. Tipos de Denuncias realizadas a Personal Policial
  const denunciasTiposDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of AI_DENUNCIAS_TIPOS_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    denunciasTiposDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: AI_TABLE_IDS.DENUNCIAS_TIPOS,
    nombre: 'Tipos de Denuncias realizadas a Personal Policial',
    datos: denunciasTiposDatos,
  });

  // 3. Personal Policial Superior Denunciado
  const denunciasSuperiorDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of AI_DENUNCIAS_SUPERIOR_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    denunciasSuperiorDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: AI_TABLE_IDS.DENUNCIAS_SUPERIOR,
    nombre: 'Personal Policial Superior Denunciado',
    datos: denunciasSuperiorDatos,
  });

  // 4. Personal Policial Suboficial Denunciado
  const denunciasSuboficialDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of AI_DENUNCIAS_SUBOFICIAL_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    denunciasSuboficialDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: AI_TABLE_IDS.DENUNCIAS_SUBOFICIAL,
    nombre: 'Personal Policial Suboficial Denunciado',
    datos: denunciasSuboficialDatos,
  });

  // 5. Personal Policial Denunciado (Resumen)
  const denunciasResumenDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of AI_DENUNCIAS_RESUMEN_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    denunciasResumenDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: AI_TABLE_IDS.DENUNCIAS_RESUMEN,
    nombre: 'Personal Policial Denunciado',
    datos: denunciasResumenDatos,
  });

  // 6. Actuaciones Redes
  const actuacionesRedesDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of AI_ACTUACIONES_REDES_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    actuacionesRedesDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: AI_TABLE_IDS.ACTUACIONES_REDES,
    nombre: 'Actuaciones Administrativas Iniciadas por Publicaciones en Redes Sociales',
    datos: actuacionesRedesDatos,
  });

  // 7. Actuaciones Armas
  const actuacionesArmasDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of AI_ACTUACIONES_ARMAS_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    actuacionesArmasDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: AI_TABLE_IDS.ACTUACIONES_ARMAS,
    nombre: 'Actuaciones Administrativas Derivadas de Robo y/o Hurto de Armas Reglamentarias',
    datos: actuacionesArmasDatos,
  });

  return tables;
}

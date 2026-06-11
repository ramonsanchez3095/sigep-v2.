// ─────────────────────────────────────────────────────────────────────────────
// D5 – Motor de transformación
// Convierte tablas raw de BD en datos tipados para el dashboard judicial.
// ─────────────────────────────────────────────────────────────────────────────

import {
  D5_TABLE_IDS,
  D5_CORE_TABLE_IDS,
  D5_MESES,
  D5_DETENIDOS_PROCESALES_DEFAULT,
  D5_CONSIGNAS_REGIONALES_DEFAULT,
  D5_SERVICIO_PENITENCIARIO_DEFAULT,
  D5_ARMAS_SECUESTRADAS_DEFAULT,
  D5_DETENIDOS_PENDIENTES_DEFAULT,
  D5_DETENIDOS_CONTRAVENCIONALES_DEFAULT,
  D5_RECURSOS_HABEAS_CORPUS_DEFAULT,
  D5_PERSONAL_POLICIAL_DETENIDO_DEFAULT,
  D5_DETENIDOS_LIBERADOS_DEFAULT,
  D5_LLAMADAS_ANTECEDENTES_DEFAULT,
  D5_PENDIENTES_CONCEPTS,
  D5_CONTRAVENCIONALES_CONCEPTS,
  D5_LIBERADOS_CONCEPTS,
  D5_LLAMADAS_CONCEPTS,
  // Nuevos defaults y conceptos
  D5_DENUNCIAS_TIPOS_DEFAULT,
  D5_DENUNCIAS_SUPERIOR_DEFAULT,
  D5_DENUNCIAS_SUBOFICIAL_DEFAULT,
  D5_DENUNCIAS_RESUMEN_DEFAULT,
  D5_ACTUACIONES_REDES_DEFAULT,
  D5_ACTUACIONES_ARMAS_DEFAULT,
  D5_DENUNCIAS_TIPOS_CONCEPTS,
  D5_DENUNCIAS_SUPERIOR_CONCEPTS,
  D5_DENUNCIAS_SUBOFICIAL_CONCEPTS,
  D5_DENUNCIAS_RESUMEN_CONCEPTS,
  D5_ACTUACIONES_REDES_CONCEPTS,
  D5_ACTUACIONES_ARMAS_CONCEPTS,
  type D5ComparisonRow,
  type D5DetenidosPendientesRow,
  type D5DetenidosContravencionalesRow,
  type D5MonthlyInputRow,
  type D5Mes,
} from './d5-definition';

// ─── Tipos raw (desde la BD) ──────────────────────────────────────────────────
export interface D5RawRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

export interface D5RawTable {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: D5RawRow[];
}

// ─── Dashboard data ───────────────────────────────────────────────────────────
export interface D5DashboardData {
  isReady: boolean;
  detenidosProcesales: D5ComparisonRow[];
  detenidosPendientes: D5DetenidosPendientesRow[];
  consignasRegionales: D5ComparisonRow[];
  detenidosContravencionales: D5DetenidosContravencionalesRow[];
  recursosHabeasCorpus: D5ComparisonRow[];
  detenidosServicioPenitenciario: D5ComparisonRow[];
  armasSecuestradas: D5ComparisonRow[];
  personalPolicialDetenido: D5ComparisonRow[];
  detenidosLiberados: D5MonthlyInputRow[];
  llamadasAntecedentes: D5MonthlyInputRow[];
  // Nuevas tablas
  denunciasTipos: D5MonthlyInputRow[];
  denunciasSuperior: D5MonthlyInputRow[];
  denunciasSuboficial: D5MonthlyInputRow[];
  denunciasResumen: D5MonthlyInputRow[];
  actuacionesRedes: D5MonthlyInputRow[];
  actuacionesArmas: D5MonthlyInputRow[];
  rawTableIds: Record<string, string | undefined>; // tablaId → table db id
}

// ─── Activación de la vista avanzada ─────────────────────────────────────────
export function hasD5StructuredTables(rawTables: D5RawTable[]): boolean {
  const ids = new Set(rawTables.map((t) => t.tablaId));
  return D5_CORE_TABLE_IDS.every((id) => ids.has(id));
}

// ─── Reemplazo de filas ───────────────────────────────────────────────────────
export function replaceD5RawTableRows(
  rawTables: D5RawTable[],
  tableId: string,
  nextRows: D5RawRow[]
): D5RawTable[] {
  return rawTables.map((t) =>
    t.tablaId === tableId ? { ...t, datos: nextRows } : t
  );
}

// ─── Helpers de parseo ────────────────────────────────────────────────────────
function findTable(rawTables: D5RawTable[], tablaId: string) {
  return rawTables.find((t) => t.tablaId === tablaId);
}

function rowVal(table: D5RawTable | undefined, rowId: string, field: 'periodoAnterior' | 'periodoActual'): number {
  if (!table) return 0;
  return table.datos.find((r) => r.id === rowId)?.[field] ?? 0;
}

// ─── Dashboard builder ────────────────────────────────────────────────────────
export function buildD5Dashboard(rawTables: D5RawTable[]): D5DashboardData {
  const rawTableIds: Record<string, string | undefined> = {};

  // 1. Detenidos Procesales
  const procesalesTable = findTable(rawTables, D5_TABLE_IDS.PROCESALES);
  rawTableIds[D5_TABLE_IDS.PROCESALES] = procesalesTable?.id;
  const detenidosProcesales: D5ComparisonRow[] = D5_DETENIDOS_PROCESALES_DEFAULT.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(procesalesTable, def.id, 'periodoAnterior'),
    periodoActual: rowVal(procesalesTable, def.id, 'periodoActual'),
  }));

  // 2. Detenidos con Pendientes
  const pendientesTable = findTable(rawTables, D5_TABLE_IDS.PENDIENTES);
  rawTableIds[D5_TABLE_IDS.PENDIENTES] = pendientesTable?.id;
  const detenidosPendientes: D5DetenidosPendientesRow[] = [];
  for (const concept of D5_PENDIENTES_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = pendientesTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        detenidosPendientes.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  // 3. Consignas Regionales
  const consignasTable = findTable(rawTables, D5_TABLE_IDS.CONSIGNAS);
  rawTableIds[D5_TABLE_IDS.CONSIGNAS] = consignasTable?.id;
  const consignasRegionales: D5ComparisonRow[] = D5_CONSIGNAS_REGIONALES_DEFAULT.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(consignasTable, def.id, 'periodoAnterior'),
    periodoActual: rowVal(consignasTable, def.id, 'periodoActual'),
  }));

  // 4. Detenidos Contravencionales
  const contravencionalesTable = findTable(rawTables, D5_TABLE_IDS.CONTRAVENCIONALES);
  rawTableIds[D5_TABLE_IDS.CONTRAVENCIONALES] = contravencionalesTable?.id;
  const detenidosContravencionales: D5DetenidosContravencionalesRow[] = [];
  for (const concept of D5_CONTRAVENCIONALES_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = contravencionalesTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        detenidosContravencionales.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  // 5. Recursos Habeas Corpus
  const habeasTable = findTable(rawTables, D5_TABLE_IDS.HABEAS_CORPUS);
  rawTableIds[D5_TABLE_IDS.HABEAS_CORPUS] = habeasTable?.id;
  const recursosHabeasCorpus: D5ComparisonRow[] = D5_RECURSOS_HABEAS_CORPUS_DEFAULT.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(habeasTable, def.id, 'periodoAnterior'),
    periodoActual: rowVal(habeasTable, def.id, 'periodoActual'),
  }));

  // 6. Servicio Penitenciario
  const spTable = findTable(rawTables, D5_TABLE_IDS.SERVICIO_PENITENCIARIO);
  rawTableIds[D5_TABLE_IDS.SERVICIO_PENITENCIARIO] = spTable?.id;
  const detenidosServicioPenitenciario: D5ComparisonRow[] = D5_SERVICIO_PENITENCIARIO_DEFAULT.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(spTable, def.id, 'periodoAnterior'),
    periodoActual: rowVal(spTable, def.id, 'periodoActual'),
  }));

  // 7. Armas Secuestradas
  const armasTable = findTable(rawTables, D5_TABLE_IDS.ARMAS_SECUESTRADAS);
  rawTableIds[D5_TABLE_IDS.ARMAS_SECUESTRADAS] = armasTable?.id;
  const armasSecuestradas: D5ComparisonRow[] = D5_ARMAS_SECUESTRADAS_DEFAULT.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(armasTable, def.id, 'periodoAnterior'),
    periodoActual: rowVal(armasTable, def.id, 'periodoActual'),
  }));

  // 8. Personal Policial Detenido
  const polDetenidoTable = findTable(rawTables, D5_TABLE_IDS.PERSONAL_POLICIAL_DETENIDO);
  rawTableIds[D5_TABLE_IDS.PERSONAL_POLICIAL_DETENIDO] = polDetenidoTable?.id;
  const personalPolicialDetenido: D5ComparisonRow[] = D5_PERSONAL_POLICIAL_DETENIDO_DEFAULT.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(polDetenidoTable, def.id, 'periodoAnterior'),
    periodoActual: rowVal(polDetenidoTable, def.id, 'periodoActual'),
  }));

  // 9. Detenidos Procesales Liberados
  const liberadosTable = findTable(rawTables, D5_TABLE_IDS.DETENIDOS_LIBERADOS);
  rawTableIds[D5_TABLE_IDS.DETENIDOS_LIBERADOS] = liberadosTable?.id;
  const detenidosLiberados: D5MonthlyInputRow[] = [];
  for (const concept of D5_LIBERADOS_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = liberadosTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        detenidosLiberados.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  // 10. Estadísticas de Llamadas sobre Antecedentes
  const llamadasTable = findTable(rawTables, D5_TABLE_IDS.LLAMADAS_ANTECEDENTES);
  rawTableIds[D5_TABLE_IDS.LLAMADAS_ANTECEDENTES] = llamadasTable?.id;
  const llamadasAntecedentes: D5MonthlyInputRow[] = [];
  for (const concept of D5_LLAMADAS_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
        const prefix = `${concept.id}_${mes.toLowerCase()}_${anio}`;
        const valor = llamadasTable?.datos.find((r) => r.id === prefix)?.periodoActual ?? 0;
        llamadasAntecedentes.push({
          concept: concept.id,
          label: concept.label,
          mes,
          anio,
          valor,
        });
      }
    }
  }

  // 11. Tipos de Denuncias realizadas a Personal Policial
  const denunciasTiposTable = findTable(rawTables, D5_TABLE_IDS.DENUNCIAS_TIPOS);
  rawTableIds[D5_TABLE_IDS.DENUNCIAS_TIPOS] = denunciasTiposTable?.id;
  const denunciasTipos: D5MonthlyInputRow[] = [];
  for (const concept of D5_DENUNCIAS_TIPOS_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
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

  // 12. Personal Policial Superior Denunciado
  const denunciasSuperiorTable = findTable(rawTables, D5_TABLE_IDS.DENUNCIAS_SUPERIOR);
  rawTableIds[D5_TABLE_IDS.DENUNCIAS_SUPERIOR] = denunciasSuperiorTable?.id;
  const denunciasSuperior: D5MonthlyInputRow[] = [];
  for (const concept of D5_DENUNCIAS_SUPERIOR_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
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

  // 13. Personal Policial Suboficial Denunciado
  const denunciasSuboficialTable = findTable(rawTables, D5_TABLE_IDS.DENUNCIAS_SUBOFICIAL);
  rawTableIds[D5_TABLE_IDS.DENUNCIAS_SUBOFICIAL] = denunciasSuboficialTable?.id;
  const denunciasSuboficial: D5MonthlyInputRow[] = [];
  for (const concept of D5_DENUNCIAS_SUBOFICIAL_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
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

  // 14. Personal Policial Denunciado (Resumen)
  const denunciasResumenTable = findTable(rawTables, D5_TABLE_IDS.DENUNCIAS_RESUMEN);
  rawTableIds[D5_TABLE_IDS.DENUNCIAS_RESUMEN] = denunciasResumenTable?.id;
  const denunciasResumen: D5MonthlyInputRow[] = [];
  for (const concept of D5_DENUNCIAS_RESUMEN_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
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

  // 15. Actuaciones Redes
  const actuacionesRedesTable = findTable(rawTables, D5_TABLE_IDS.ACTUACIONES_REDES);
  rawTableIds[D5_TABLE_IDS.ACTUACIONES_REDES] = actuacionesRedesTable?.id;
  const actuacionesRedes: D5MonthlyInputRow[] = [];
  for (const concept of D5_ACTUACIONES_REDES_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
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

  // 16. Actuaciones Armas
  const actuacionesArmasTable = findTable(rawTables, D5_TABLE_IDS.ACTUACIONES_ARMAS);
  rawTableIds[D5_TABLE_IDS.ACTUACIONES_ARMAS] = actuacionesArmasTable?.id;
  const actuacionesArmas: D5MonthlyInputRow[] = [];
  for (const concept of D5_ACTUACIONES_ARMAS_CONCEPTS) {
    for (const anio of [2024, 2025] as const) {
      for (const mes of D5_MESES) {
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
    isReady: hasD5StructuredTables(rawTables),
    detenidosProcesales,
    detenidosPendientes,
    consignasRegionales,
    detenidosContravencionales,
    recursosHabeasCorpus,
    detenidosServicioPenitenciario,
    armasSecuestradas,
    personalPolicialDetenido,
    detenidosLiberados,
    llamadasAntecedentes,
    // Nuevas tablas
    denunciasTipos,
    denunciasSuperior,
    denunciasSuboficial,
    denunciasResumen,
    actuacionesRedes,
    actuacionesArmas,
    rawTableIds,
  };
}

// ─── Seed factory para D5 ─────────────────────────────────────────────────────
export function createD5SeedTables() {
  const tables = [];

  // 1. Detenidos Procesales
  tables.push({
    tablaId: D5_TABLE_IDS.PROCESALES,
    nombre: 'Detenidos Procesales',
    datos: D5_DETENIDOS_PROCESALES_DEFAULT.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  });

  // 2. Detenidos con Pendientes
  const pendientesDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_DETENIDOS_PENDIENTES_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    pendientesDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  // Fill in rest of D5_MESES for ley5140 and busqueda if missing, just in case
  const existsLey5140 = new Set(D5_DETENIDOS_PENDIENTES_DEFAULT.filter(r => r.concept === 'ley5140').map(r => `${r.mes.toLowerCase()}_${r.anio}`));
  const existsBusqueda = new Set(D5_DETENIDOS_PENDIENTES_DEFAULT.filter(r => r.concept === 'busqueda').map(r => `${r.mes.toLowerCase()}_${r.anio}`));

  for (const mes of D5_MESES) {
    for (const anio of [2024, 2025] as const) {
      const key = `${mes.toLowerCase()}_${anio}`;
      if (!existsLey5140.has(key)) {
        pendientesDatos.push({
          filaId: `ley5140_${key}`,
          label: `DETENIDOS INFRAC. LEY 5140 - ${mes} ${anio}`,
          periodoAnterior: 0,
          periodoActual: 0,
        });
      }
      if (!existsBusqueda.has(key)) {
        pendientesDatos.push({
          filaId: `busqueda_${key}`,
          label: `DIV. BUSQUEDA Y CAPTURA DE PROFUGOS - ${mes} ${anio}`,
          periodoAnterior: 0,
          periodoActual: 0,
        });
      }
    }
  }

  tables.push({
    tablaId: D5_TABLE_IDS.PENDIENTES,
    nombre: 'Detenidos con Pendientes (Capturas)',
    datos: pendientesDatos,
  });

  // 3. Consignas Regionales
  tables.push({
    tablaId: D5_TABLE_IDS.CONSIGNAS,
    nombre: 'Consignas Cubiertas por las Unidades Regionales',
    datos: D5_CONSIGNAS_REGIONALES_DEFAULT.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  });

  // 4. Detenidos Contravencionales
  const contravencionalesDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_DETENIDOS_CONTRAVENCIONALES_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    contravencionalesDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: D5_TABLE_IDS.CONTRAVENCIONALES,
    nombre: 'Detenidos Contravencionales',
    datos: contravencionalesDatos,
  });

  // 5. Recursos Habeas Corpus
  tables.push({
    tablaId: D5_TABLE_IDS.HABEAS_CORPUS,
    nombre: 'Recursos Presentados por Abogados Habeas Corpus',
    datos: D5_RECURSOS_HABEAS_CORPUS_DEFAULT.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  });

  // 6. Servicio Penitenciario
  tables.push({
    tablaId: D5_TABLE_IDS.SERVICIO_PENITENCIARIO,
    nombre: 'Detenidos Trasladados al Servicio Penitenciario',
    datos: D5_SERVICIO_PENITENCIARIO_DEFAULT.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  });

  // 7. Armas Secuestradas
  tables.push({
    tablaId: D5_TABLE_IDS.ARMAS_SECUESTRADAS,
    nombre: 'Armas de Fuego Secuestradas',
    datos: D5_ARMAS_SECUESTRADAS_DEFAULT.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  });

  // 8. Personal Policial Detenido
  tables.push({
    tablaId: D5_TABLE_IDS.PERSONAL_POLICIAL_DETENIDO,
    nombre: 'Personal Policial Detenido',
    datos: D5_PERSONAL_POLICIAL_DETENIDO_DEFAULT.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  });

  // 9. Detenidos Procesales Liberados
  const liberadosDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_DETENIDOS_LIBERADOS_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    liberadosDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: D5_TABLE_IDS.DETENIDOS_LIBERADOS,
    nombre: 'Detenidos Procesales Liberados',
    datos: liberadosDatos,
  });

  // 10. Estadísticas de Llamadas sobre Antecedentes
  const llamadasDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_LLAMADAS_ANTECEDENTES_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    llamadasDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: D5_TABLE_IDS.LLAMADAS_ANTECEDENTES,
    nombre: 'Estadísticas de Llamadas Telefónicas sobre Antecedentes - Período 2025',
    datos: llamadasDatos,
  });

  // 11. Tipos de Denuncias realizadas a Personal Policial
  const denunciasTiposDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_DENUNCIAS_TIPOS_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    denunciasTiposDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: D5_TABLE_IDS.DENUNCIAS_TIPOS,
    nombre: 'Tipos de Denuncias realizadas a Personal Policial',
    datos: denunciasTiposDatos,
  });

  // 12. Personal Policial Superior Denunciado
  const denunciasSuperiorDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_DENUNCIAS_SUPERIOR_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    denunciasSuperiorDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: D5_TABLE_IDS.DENUNCIAS_SUPERIOR,
    nombre: 'Personal Policial Superior Denunciado',
    datos: denunciasSuperiorDatos,
  });

  // 13. Personal Policial Suboficial Denunciado
  const denunciasSuboficialDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_DENUNCIAS_SUBOFICIAL_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    denunciasSuboficialDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: D5_TABLE_IDS.DENUNCIAS_SUBOFICIAL,
    nombre: 'Personal Policial Suboficial Denunciado',
    datos: denunciasSuboficialDatos,
  });

  // 14. Personal Policial Denunciado (Resumen)
  const denunciasResumenDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_DENUNCIAS_RESUMEN_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    denunciasResumenDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: D5_TABLE_IDS.DENUNCIAS_RESUMEN,
    nombre: 'Personal Policial Denunciado',
    datos: denunciasResumenDatos,
  });

  // 15. Actuaciones Redes
  const actuacionesRedesDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_ACTUACIONES_REDES_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    actuacionesRedesDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: D5_TABLE_IDS.ACTUACIONES_REDES,
    nombre: 'Actuaciones Administrativas Iniciadas por Publicaciones en Redes Sociales',
    datos: actuacionesRedesDatos,
  });

  // 16. Actuaciones Armas
  const actuacionesArmasDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const r of D5_ACTUACIONES_ARMAS_DEFAULT) {
    const prefix = `${r.concept}_${r.mes.toLowerCase()}_${r.anio}`;
    actuacionesArmasDatos.push({
      filaId: prefix,
      label: `${r.label} - ${r.mes} ${r.anio}`,
      periodoAnterior: 0,
      periodoActual: r.valor,
    });
  }
  tables.push({
    tablaId: D5_TABLE_IDS.ACTUACIONES_ARMAS,
    nombre: 'Actuaciones Administrativas Derivadas de Robo y/o Hurto de Armas Reglamentarias',
    datos: actuacionesArmasDatos,
  });

  return tables;
}

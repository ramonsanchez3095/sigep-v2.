// ─────────────────────────────────────────────────────────────────────────────
// D4 – Motor de transformación
// Convierte tablas raw de BD en datos tipados para el dashboard de logística.
// ─────────────────────────────────────────────────────────────────────────────

import {
  D4_TABLE_IDS,
  D4_CORE_TABLE_IDS,
  D4_ARMAMENTO_ROWS,
  D4_PROYECCIONES_ROWS,
  D4_ADQUISICION_DEFAULT,
  D4_VEHICULOS_POLICIA_DEFAULT,
  D4_VEHICULOS_MINISTERIO_DEFAULT,
  D4_MESES,
  type D4ArmamentoRow,
  type D4AdquisicionRow,
  type D4VehiculoRow,
  type D4RastreoMesRow,
  type D4Mes,
} from './d4-definition';

// ─── Tipos raw (desde la BD) ──────────────────────────────────────────────────
export interface D4RawRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

export interface D4RawTable {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: D4RawRow[];
}

// ─── Dashboard data ───────────────────────────────────────────────────────────
export interface D4DashboardData {
  isReady: boolean;
  armamento: D4ArmamentoRow[];
  proyecciones: D4ArmamentoRow[];
  adquisicion: D4AdquisicionRow[];
  vehiculosPolicia: D4VehiculoRow[];
  vehiculosMinisterio: D4VehiculoRow[];
  rastreo: D4RastreoMesRow[];
  rawTableIds: Record<string, string | undefined>; // tablaId → table db id
}

// ─── Activación de la vista avanzada ─────────────────────────────────────────
export function hasD4StructuredTables(rawTables: D4RawTable[]): boolean {
  const ids = new Set(rawTables.map((t) => t.tablaId));
  return D4_CORE_TABLE_IDS.every((id) => ids.has(id));
}

// ─── Reemplazo de filas ───────────────────────────────────────────────────────
export function replaceD4RawTableRows(
  rawTables: D4RawTable[],
  tableId: string,
  nextRows: D4RawRow[]
): D4RawTable[] {
  return rawTables.map((t) =>
    t.tablaId === tableId ? { ...t, datos: nextRows } : t
  );
}

// ─── Helpers de parseo ────────────────────────────────────────────────────────
function findTable(rawTables: D4RawTable[], tablaId: string) {
  return rawTables.find((t) => t.tablaId === tablaId);
}

function rowVal(table: D4RawTable | undefined, rowId: string, field: 'periodoAnterior' | 'periodoActual'): number {
  if (!table) return 0;
  return table.datos.find((r) => r.id === rowId)?.[field] ?? 0;
}

// ─── Dashboard builder ────────────────────────────────────────────────────────
export function buildD4Dashboard(rawTables: D4RawTable[]): D4DashboardData {
  const rawTableIds: Record<string, string | undefined> = {};

  // ── Armamento ───────────────────────────────────────────────────────────────
  const armTable = findTable(rawTables, D4_TABLE_IDS.ARMAMENTO);
  rawTableIds[D4_TABLE_IDS.ARMAMENTO] = armTable?.id;

  const armamento: D4ArmamentoRow[] = D4_ARMAMENTO_ROWS.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(armTable, def.id, 'periodoAnterior'),
    periodoActual: rowVal(armTable, def.id, 'periodoActual'),
  }));

  // ── Proyecciones ────────────────────────────────────────────────────────────
  const projTable = findTable(rawTables, D4_TABLE_IDS.PROYECCIONES);
  rawTableIds[D4_TABLE_IDS.PROYECCIONES] = projTable?.id;

  const proyecciones: D4ArmamentoRow[] = D4_PROYECCIONES_ROWS.map((def) => ({
    id: def.id,
    label: def.label,
    periodoAnterior: rowVal(projTable, def.id, 'periodoAnterior'),
    periodoActual: rowVal(projTable, def.id, 'periodoActual'),
  }));

  // ── Adquisición ─────────────────────────────────────────────────────────────
  const adqTable = findTable(rawTables, D4_TABLE_IDS.ADQUISICION);
  rawTableIds[D4_TABLE_IDS.ADQUISICION] = adqTable?.id;

  const adquisicion: D4AdquisicionRow[] = adqTable
    ? adqTable.datos.map((row) => {
        // label format: "2024|Característica|Cantidad|Marca|Obs|Fecha"
        const parts = row.label.split('|');
        return {
          id: row.id,
          anio: (parseInt(parts[0] ?? '2024', 10) as 2024 | 2025),
          caracteristica: parts[1] ?? '',
          cantidad: row.periodoActual,
          marca: parts[2] ?? '',
          obs: parts[3] ?? '',
          fecha: parts[4] ?? '',
        };
      })
    : D4_ADQUISICION_DEFAULT;

  // ── Vehículos Policía ───────────────────────────────────────────────────────
  const vehPolTable = findTable(rawTables, D4_TABLE_IDS.VEHICULOS_POLICIA);
  rawTableIds[D4_TABLE_IDS.VEHICULOS_POLICIA] = vehPolTable?.id;

  const vehiculosPolicia: D4VehiculoRow[] = vehPolTable
    ? D4_VEHICULOS_POLICIA_DEFAULT.map((def) => {
        const r2024_serv = vehPolTable.datos.find((r) => r.id === `${def.id}_2024_serv`);
        const r2024_fuera = vehPolTable.datos.find((r) => r.id === `${def.id}_2024_fuera`);
        const r2025_serv = vehPolTable.datos.find((r) => r.id === `${def.id}_2025_serv`);
        const r2025_fuera = vehPolTable.datos.find((r) => r.id === `${def.id}_2025_fuera`);
        return {
          id: def.id,
          tipo: def.tipo,
          enServicio2024: r2024_serv?.periodoActual ?? 0,
          fueraServicio2024: r2024_fuera?.periodoActual ?? 0,
          enServicio2025: r2025_serv?.periodoActual ?? 0,
          fueraServicio2025: r2025_fuera?.periodoActual ?? 0,
        };
      })
    : D4_VEHICULOS_POLICIA_DEFAULT;

  // ── Vehículos Ministerio ─────────────────────────────────────────────────────
  const vehMinTable = findTable(rawTables, D4_TABLE_IDS.VEHICULOS_MINISTERIO);
  rawTableIds[D4_TABLE_IDS.VEHICULOS_MINISTERIO] = vehMinTable?.id;

  const vehiculosMinisterio: D4VehiculoRow[] = vehMinTable
    ? D4_VEHICULOS_MINISTERIO_DEFAULT.map((def) => {
        const r2024_serv = vehMinTable.datos.find((r) => r.id === `${def.id}_2024_serv`);
        const r2024_fuera = vehMinTable.datos.find((r) => r.id === `${def.id}_2024_fuera`);
        const r2025_serv = vehMinTable.datos.find((r) => r.id === `${def.id}_2025_serv`);
        const r2025_fuera = vehMinTable.datos.find((r) => r.id === `${def.id}_2025_fuera`);
        return {
          id: def.id,
          tipo: def.tipo,
          enServicio2024: r2024_serv?.periodoActual ?? 0,
          fueraServicio2024: r2024_fuera?.periodoActual ?? 0,
          enServicio2025: r2025_serv?.periodoActual ?? 0,
          fueraServicio2025: r2025_fuera?.periodoActual ?? 0,
        };
      })
    : D4_VEHICULOS_MINISTERIO_DEFAULT;

  // ── Rastreo mensual ─────────────────────────────────────────────────────────
  const rastreoTable = findTable(rawTables, D4_TABLE_IDS.RASTREO);
  rawTableIds[D4_TABLE_IDS.RASTREO] = rastreoTable?.id;

  const rastreo: D4RastreoMesRow[] = [];
  for (const mes of D4_MESES) {
    for (const anio of [2024, 2025] as const) {
      const prefix = `${mes.toLowerCase()}_${anio}`;
      const findVal = (suffix: string) =>
        rastreoTable?.datos.find((r) => r.id === `${prefix}_${suffix}`)?.periodoActual ?? 0;

      rastreo.push({
        mes,
        anio,
        camionetaFurgon: findVal('camioneta_furgon'),
        motos: findVal('motos'),
        autos: findVal('autos'),
        camion: findVal('camion'),
        totalFacturado: findVal('total_facturado'),
        totalParque: findVal('total_parque'),
      });
    }
  }

  return {
    isReady: hasD4StructuredTables(rawTables),
    armamento,
    proyecciones,
    adquisicion,
    vehiculosPolicia,
    vehiculosMinisterio,
    rastreo,
    rawTableIds,
  };
}

// ─── Seed factory para D4 ─────────────────────────────────────────────────────
export function createD4SeedTables() {
  const tables = [];

  // Armamento
  tables.push({
    tablaId: D4_TABLE_IDS.ARMAMENTO,
    nombre: 'Cantidad Total de Armamento',
    datos: D4_ARMAMENTO_ROWS.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  });

  // Proyecciones
  tables.push({
    tablaId: D4_TABLE_IDS.PROYECCIONES,
    nombre: 'Proyecciones de Compras',
    datos: D4_PROYECCIONES_ROWS.map((r) => ({
      filaId: r.id,
      label: r.label,
      periodoAnterior: r.periodoAnterior,
      periodoActual: r.periodoActual,
    })),
  });

  // Adquisición (encode metadata in label field: "anio|caracteristica|marca|obs|fecha")
  tables.push({
    tablaId: D4_TABLE_IDS.ADQUISICION,
    nombre: 'Adquisición de Armamento',
    datos: D4_ADQUISICION_DEFAULT.map((r) => ({
      filaId: r.id,
      label: `${r.anio}|${r.caracteristica}|${r.marca}|${r.obs ?? ''}|${r.fecha ?? ''}`,
      periodoAnterior: 0,
      periodoActual: r.cantidad,
    })),
  });

  // Vehículos Policía
  const vehPolDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const v of D4_VEHICULOS_POLICIA_DEFAULT) {
    vehPolDatos.push({ filaId: `${v.id}_2024_serv`, label: `${v.tipo} - 2024 - En Servicio`, periodoAnterior: 0, periodoActual: v.enServicio2024 });
    vehPolDatos.push({ filaId: `${v.id}_2024_fuera`, label: `${v.tipo} - 2024 - Fuera de Servicio`, periodoAnterior: 0, periodoActual: v.fueraServicio2024 });
    vehPolDatos.push({ filaId: `${v.id}_2025_serv`, label: `${v.tipo} - 2025 - En Servicio`, periodoAnterior: 0, periodoActual: v.enServicio2025 });
    vehPolDatos.push({ filaId: `${v.id}_2025_fuera`, label: `${v.tipo} - 2025 - Fuera de Servicio`, periodoAnterior: 0, periodoActual: v.fueraServicio2025 });
  }
  tables.push({
    tablaId: D4_TABLE_IDS.VEHICULOS_POLICIA,
    nombre: 'Vehículos Policiales',
    datos: vehPolDatos,
  });

  // Vehículos Ministerio
  const vehMinDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const v of D4_VEHICULOS_MINISTERIO_DEFAULT) {
    vehMinDatos.push({ filaId: `${v.id}_2024_serv`, label: `${v.tipo} - 2024 - En Servicio`, periodoAnterior: 0, periodoActual: v.enServicio2024 });
    vehMinDatos.push({ filaId: `${v.id}_2024_fuera`, label: `${v.tipo} - 2024 - Fuera de Servicio`, periodoAnterior: 0, periodoActual: v.fueraServicio2024 });
    vehMinDatos.push({ filaId: `${v.id}_2025_serv`, label: `${v.tipo} - 2025 - En Servicio`, periodoAnterior: 0, periodoActual: v.enServicio2025 });
    vehMinDatos.push({ filaId: `${v.id}_2025_fuera`, label: `${v.tipo} - 2025 - Fuera de Servicio`, periodoAnterior: 0, periodoActual: v.fueraServicio2025 });
  }
  tables.push({
    tablaId: D4_TABLE_IDS.VEHICULOS_MINISTERIO,
    nombre: 'Vehículos del Ministerio de Seguridad',
    datos: vehMinDatos,
  });

  // Rastreo mensual
  const rastDatos: Array<{ filaId: string; label: string; periodoAnterior: number; periodoActual: number }> = [];
  for (const mes of D4_MESES) {
    for (const anio of [2024, 2025] as const) {
      const prefix = `${mes.toLowerCase()}_${anio}`;
      rastDatos.push({ filaId: `${prefix}_camioneta_furgon`, label: `${mes} ${anio} - Camioneta/Furgón`, periodoAnterior: 0, periodoActual: 0 });
      rastDatos.push({ filaId: `${prefix}_motos`, label: `${mes} ${anio} - Motos`, periodoAnterior: 0, periodoActual: 0 });
      rastDatos.push({ filaId: `${prefix}_autos`, label: `${mes} ${anio} - Autos`, periodoAnterior: 0, periodoActual: 0 });
      rastDatos.push({ filaId: `${prefix}_camion`, label: `${mes} ${anio} - Camión`, periodoAnterior: 0, periodoActual: 0 });
      rastDatos.push({ filaId: `${prefix}_total_facturado`, label: `${mes} ${anio} - Total Facturado`, periodoAnterior: 0, periodoActual: 0 });
      rastDatos.push({ filaId: `${prefix}_total_parque`, label: `${mes} ${anio} - Total Parque`, periodoAnterior: 0, periodoActual: 0 });
    }
  }
  tables.push({
    tablaId: D4_TABLE_IDS.RASTREO,
    nombre: 'Móviles con Sistema de Rastreo Instalado',
    datos: rastDatos,
  });

  return tables;
}

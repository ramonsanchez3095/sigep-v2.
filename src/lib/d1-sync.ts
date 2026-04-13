import { and, eq } from 'drizzle-orm';
import type { DB } from '../db';
import { datosComparativos, departamentos, tablasConfig } from '../db/schema';
import { createD1SeedTables } from './d1-definition';

export interface D1ExistingRow {
  filaId: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
  orden: number;
}

export interface D1ExistingTable {
  id: string;
  tablaId: string;
  nombre: string;
  orden: number;
  datos: D1ExistingRow[];
}

export interface D1SyncPlannedRow {
  filaId: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
  orden: number;
  sourceFilaId?: string;
  sourceReason?: 'exact' | 'alias' | 'label' | 'heuristic';
  existsWithCanonicalId: boolean;
}

export interface D1SyncPlannedTable {
  tablaId: string;
  nombre: string;
  orden: number;
  exists: boolean;
  rows: D1SyncPlannedRow[];
  legacyRows: D1ExistingRow[];
}

export interface D1SyncPlan {
  tables: D1SyncPlannedTable[];
  summary: {
    tablesToCreate: number;
    rowsToInsert: number;
    rowsToUpdate: number;
    legacyRowsDetected: number;
  };
}

export interface D1SyncResult {
  summary: D1SyncPlan['summary'];
  tables: Array<{
    tablaId: string;
    nombre: string;
    legacyRows: string[];
  }>;
}

const LEGACY_ROW_ALIASES: Record<string, string[]> = {
  poblacion_censo: ['poblacion'],
  personal_superior: ['superior'],
  personal_subalterno: ['subalterno'],
};

function normalizeLabel(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase();
}

function hasValue(row: Pick<D1ExistingRow, 'periodoAnterior' | 'periodoActual'>) {
  return row.periodoAnterior !== 0 || row.periodoActual !== 0;
}

function chooseCandidate<T extends D1ExistingRow>(
  matches: Array<{ row: T; reason: D1SyncPlannedRow['sourceReason'] }>
) {
  if (matches.length === 0) {
    return null;
  }

  return matches.find(candidate => hasValue(candidate.row)) ?? matches[0];
}

function inferForceEffective(existingTables: D1ExistingTable[]) {
  const table = existingTables.find(candidate => candidate.tablaId === 'd1-personal-por-tipo');

  if (!table) {
    return null;
  }

  const superior = table.datos.find(row =>
    row.filaId === 'personal_superior' || row.filaId === 'superior'
  );
  const subalterno = table.datos.find(row =>
    row.filaId === 'personal_subalterno' || row.filaId === 'subalterno'
  );

  if (!superior && !subalterno) {
    return null;
  }

  return {
    filaId: 'fuerza_efectiva_inferida',
    label: 'FUERZA EFECTIVA',
    periodoAnterior:
      (superior?.periodoAnterior ?? 0) + (subalterno?.periodoAnterior ?? 0),
    periodoActual: (superior?.periodoActual ?? 0) + (subalterno?.periodoActual ?? 0),
    orden: 0,
  } satisfies D1ExistingRow;
}

function findMatchingRow(
  seedTableId: string,
  seedRow: { filaId: string; label: string },
  currentRows: D1ExistingRow[],
  existingTables: D1ExistingTable[]
) {
  const matches: Array<{
    row: D1ExistingRow;
    reason: D1SyncPlannedRow['sourceReason'];
  }> = [];

  const exactMatches = currentRows
    .filter(row => row.filaId === seedRow.filaId)
    .map(row => ({ row, reason: 'exact' as const }));

  matches.push(...exactMatches);

  for (const alias of LEGACY_ROW_ALIASES[seedRow.filaId] ?? []) {
    const aliasMatches = currentRows
      .filter(row => row.filaId === alias)
      .map(row => ({ row, reason: 'alias' as const }));
    matches.push(...aliasMatches);
  }

  const normalizedTargetLabel = normalizeLabel(seedRow.label);
  const labelMatches = currentRows
    .filter(row => normalizeLabel(row.label) === normalizedTargetLabel)
    .map(row => ({ row, reason: 'label' as const }));

  matches.push(...labelMatches);

  const selected = chooseCandidate(matches);

  if (selected) {
    return selected;
  }

  if (seedTableId === 'd1-total-personal-policial' && seedRow.filaId === 'fuerza_efectiva') {
    const inferred = inferForceEffective(existingTables);
    if (inferred && hasValue(inferred)) {
      return {
        row: inferred,
        reason: 'heuristic' as const,
      };
    }
  }

  return null;
}

export function buildD1SyncPlan(existingTables: D1ExistingTable[]): D1SyncPlan {
  const seedTables = createD1SeedTables();

  const tables = seedTables.map((seedTable, tableIndex) => {
    const currentTable = existingTables.find(table => table.tablaId === seedTable.tablaId);

    const rows = seedTable.datos.map((seedRow, rowIndex) => {
      const selected = findMatchingRow(
        seedTable.tablaId,
        seedRow,
        currentTable?.datos ?? [],
        existingTables
      );

      const canonicalExists = currentTable?.datos.some(
        row => row.filaId === seedRow.filaId
      ) ?? false;

      return {
        filaId: seedRow.filaId,
        label: seedRow.label,
        periodoAnterior: selected?.row.periodoAnterior ?? seedRow.periodoAnterior,
        periodoActual: selected?.row.periodoActual ?? seedRow.periodoActual,
        orden: rowIndex,
        sourceFilaId: selected?.row.filaId,
        sourceReason: selected?.reason,
        existsWithCanonicalId: canonicalExists,
      } satisfies D1SyncPlannedRow;
    });

    const legacyRows = currentTable?.datos.filter(
      row => !rows.some(candidate => candidate.filaId === row.filaId)
    ) ?? [];

    return {
      tablaId: seedTable.tablaId,
      nombre: seedTable.nombre,
      orden: tableIndex,
      exists: Boolean(currentTable),
      rows,
      legacyRows,
    } satisfies D1SyncPlannedTable;
  });

  return {
    tables,
    summary: {
      tablesToCreate: tables.filter(table => !table.exists).length,
      rowsToInsert: tables.reduce(
        (acc, table) => acc + table.rows.filter(row => !row.existsWithCanonicalId).length,
        0
      ),
      rowsToUpdate: tables.reduce(
        (acc, table) => acc + table.rows.filter(row => row.existsWithCanonicalId).length,
        0
      ),
      legacyRowsDetected: tables.reduce(
        (acc, table) => acc + table.legacyRows.length,
        0
      ),
    },
  };
}

export async function readCurrentD1Tables(database: DB) {
  const [department] = await database
    .select({ id: departamentos.id })
    .from(departamentos)
    .where(eq(departamentos.codigo, 'd1'))
    .limit(1);

  if (!department) {
    throw new Error('No existe el departamento D1 en la base.');
  }

  const tables = await database
    .select({
      id: tablasConfig.id,
      tablaId: tablasConfig.tablaId,
      nombre: tablasConfig.nombre,
      orden: tablasConfig.orden,
    })
    .from(tablasConfig)
    .where(and(eq(tablasConfig.departamentoId, department.id), eq(tablasConfig.activo, true)))
    .orderBy(tablasConfig.orden, tablasConfig.tablaId);

  const tablesWithRows = await Promise.all(
    tables.map(async table => {
      const rows = await database
        .select({
          filaId: datosComparativos.filaId,
          label: datosComparativos.label,
          periodoAnterior: datosComparativos.periodoAnterior,
          periodoActual: datosComparativos.periodoActual,
          orden: datosComparativos.orden,
        })
        .from(datosComparativos)
        .where(eq(datosComparativos.tablaConfigId, table.id))
        .orderBy(datosComparativos.orden, datosComparativos.filaId);

      return {
        ...table,
        datos: rows.map(row => ({
          filaId: row.filaId,
          label: row.label,
          periodoAnterior: Number(row.periodoAnterior),
          periodoActual: Number(row.periodoActual),
          orden: row.orden,
        })),
      } satisfies D1ExistingTable;
    })
  );

  return {
    departmentId: department.id,
    tables: tablesWithRows,
  };
}

export async function syncD1StructureWithDb(database: DB): Promise<D1SyncResult> {
  const { departmentId, tables: currentTables } = await readCurrentD1Tables(database);
  const plan = buildD1SyncPlan(currentTables);

  await database.transaction(async tx => {
    for (const table of plan.tables) {
      const [upsertedTable] = await tx
        .insert(tablasConfig)
        .values({
          tablaId: table.tablaId,
          nombre: table.nombre,
          orden: table.orden,
          activo: true,
          departamentoId: departmentId,
        })
        .onConflictDoUpdate({
          target: tablasConfig.tablaId,
          set: {
            nombre: table.nombre,
            orden: table.orden,
            activo: true,
            departamentoId: departmentId,
            updatedAt: new Date(),
          },
        })
        .returning({ id: tablasConfig.id });

      for (const row of table.rows) {
        await tx
          .insert(datosComparativos)
          .values({
            filaId: row.filaId,
            label: row.label,
            periodoAnterior: row.periodoAnterior.toFixed(2),
            periodoActual: row.periodoActual.toFixed(2),
            editable: true,
            orden: row.orden,
            tablaConfigId: upsertedTable.id,
          })
          .onConflictDoUpdate({
            target: [datosComparativos.tablaConfigId, datosComparativos.filaId],
            set: {
              label: row.label,
              periodoAnterior: row.periodoAnterior.toFixed(2),
              periodoActual: row.periodoActual.toFixed(2),
              editable: true,
              orden: row.orden,
              updatedAt: new Date(),
            },
          });
      }
    }
  });

  return {
    summary: plan.summary,
    tables: plan.tables.map(table => ({
      tablaId: table.tablaId,
      nombre: table.nombre,
      legacyRows: table.legacyRows.map(row => row.filaId),
    })),
  };
}
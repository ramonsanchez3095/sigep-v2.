import 'dotenv/config';
import { db } from '../src/db';
import { syncD1StructureWithDb } from '../src/lib/d1-sync';

async function main() {
  const result = await syncD1StructureWithDb(db);

  console.log('Sincronizacion D1 completada.');
  console.log(
    `Tablas creadas: ${result.summary.tablesToCreate} | Filas insertadas: ${result.summary.rowsToInsert} | Filas actualizadas: ${result.summary.rowsToUpdate} | Filas legacy detectadas: ${result.summary.legacyRowsDetected}`
  );

  for (const table of result.tables) {
    if (table.legacyRows.length === 0) {
      continue;
    }

    console.log(`${table.tablaId}: filas legacy preservadas -> ${table.legacyRows.join(', ')}`);
  }
}

main().catch(error => {
  console.error('No se pudo sincronizar D1:', error);
  process.exit(1);
});
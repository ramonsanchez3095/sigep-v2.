import assert from 'node:assert/strict';
import test from 'node:test';
import { buildD1Dashboard } from '../../src/lib/d1-transform';
import type { D1RawTable } from '../../src/lib/d1-transform';
import { createD1SeedTables } from '../../src/lib/d1-definition';

function buildRawTables(): D1RawTable[] {
  const seedTables = createD1SeedTables();
  const rawTables: D1RawTable[] = [];

  for (let tableIndex = 0; tableIndex < seedTables.length; tableIndex += 1) {
    const table = seedTables[tableIndex];
    const rows = table.datos.map((row, rowIndex) => ({
      id: row.filaId,
      label: row.label,
      periodoAnterior: rowIndex + 1,
      periodoActual: (rowIndex + 1) * 2,
    }));

    rawTables.push({
      id: `cfg-${tableIndex + 1}`,
      tablaId: table.tablaId,
      nombre: table.nombre,
      orden: tableIndex,
      datos: rows,
    });
  }

  return rawTables;
}

test('d1 transform marca la estructura como lista cuando existen todas las tablas base', () => {
  const dashboard = buildD1Dashboard(buildRawTables());

  assert.equal(dashboard.isReady, true);
  assert.ok(dashboard.trendTableConfigId);
});

test('d1 transform calcula densidad, totales y porcentajes derivados', () => {
  const tables = buildRawTables();

  for (const table of tables) {
    if (table.tablaId === 'd1-total-personal-policial') {
      table.datos = [
        {
          id: 'fuerza_efectiva',
          label: 'FUERZA EFECTIVA',
          periodoAnterior: 1000,
          periodoActual: 1200,
        },
        {
          id: 'poblacion_censo',
          label: 'POBLACION SEGUN CENSO 2022',
          periodoAnterior: 500000,
          periodoActual: 600000,
        },
      ];
    }

    if (table.tablaId === 'd1-personal-por-genero') {
      table.datos = [
        {
          id: 'masculino',
          label: 'MASCULINO',
          periodoAnterior: 800,
          periodoActual: 900,
        },
        {
          id: 'femenino',
          label: 'FEMENINO',
          periodoAnterior: 200,
          periodoActual: 300,
        },
      ];
    }

    if (table.tablaId === 'd1-personal-por-tipo') {
      table.datos = [
        {
          id: 'personal_superior',
          label: 'PERSONAL SUPERIOR',
          periodoAnterior: 100,
          periodoActual: 120,
        },
        {
          id: 'personal_subalterno',
          label: 'PERSONAL SUBALTERNO',
          periodoAnterior: 900,
          periodoActual: 1080,
        },
      ];
    }
  }

  const dashboard = buildD1Dashboard(tables);
  const densidad = dashboard.tablesById['d1-total-personal-policial'].rows.find(
    row => row.rowId === 'densidad_policial'
  );
  const totalGenero = dashboard.tablesById['d1-personal-por-genero'].rows.find(
    row => row.rowId === 'total_personal_genero'
  );
  const femenino = dashboard.tablesById['d1-personal-por-genero'].rows.find(
    row => row.rowId === 'femenino'
  );

  assert.equal(densidad?.periodoAnterior, 2);
  assert.equal(densidad?.periodoActual, 2);
  assert.equal(totalGenero?.periodoAnterior, 1000);
  assert.equal(totalGenero?.periodoActual, 1200);
  assert.equal(femenino?.shareAnterior, 20);
  assert.equal(femenino?.shareActual, 25);
});
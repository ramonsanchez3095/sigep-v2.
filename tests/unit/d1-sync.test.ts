import assert from 'node:assert/strict';
import test from 'node:test';
import { buildD1SyncPlan, type D1ExistingTable } from '../../src/lib/d1-sync';

test('d1 sync conserva valores legacy y completa tablas faltantes', () => {
  const existingTables: D1ExistingTable[] = [
    {
      id: 'cfg-total',
      tablaId: 'd1-total-personal-policial',
      nombre: 'Total de Personal Policial',
      orden: 0,
      datos: [
        {
          filaId: 'fuerza_efectiva',
          label: 'FUERZA EFECTIVA',
          periodoAnterior: 1200,
          periodoActual: 1400,
          orden: 0,
        },
        {
          filaId: 'poblacion',
          label: 'POBLACION SEGUN CENSO 2022',
          periodoAnterior: 600000,
          periodoActual: 650000,
          orden: 1,
        },
        {
          filaId: 'densidad',
          label: 'DENSIDAD POLICIAL',
          periodoAnterior: 2,
          periodoActual: 2.2,
          orden: 2,
        },
      ],
    },
    {
      id: 'cfg-tipo',
      tablaId: 'd1-personal-por-tipo',
      nombre: 'Personal por Tipo',
      orden: 1,
      datos: [
        {
          filaId: 'superior',
          label: 'PERSONAL SUPERIOR',
          periodoAnterior: 150,
          periodoActual: 170,
          orden: 0,
        },
        {
          filaId: 'subalterno',
          label: 'PERSONAL SUBALTERNO',
          periodoAnterior: 1050,
          periodoActual: 1230,
          orden: 1,
        },
      ],
    },
  ];

  const plan = buildD1SyncPlan(existingTables);
  const total = plan.tables.find(table => table.tablaId === 'd1-total-personal-policial');
  const tipo = plan.tables.find(table => table.tablaId === 'd1-personal-por-tipo');

  assert.ok(total);
  assert.ok(tipo);
  assert.equal(total?.rows.find(row => row.filaId === 'poblacion_censo')?.periodoActual, 650000);
  assert.equal(total?.rows.find(row => row.filaId === 'poblacion_censo')?.sourceFilaId, 'poblacion');
  assert.equal(tipo?.rows.find(row => row.filaId === 'personal_superior')?.periodoActual, 170);
  assert.equal(tipo?.rows.find(row => row.filaId === 'personal_superior')?.sourceFilaId, 'superior');
  assert.equal(plan.summary.tablesToCreate > 0, true);
  assert.equal(total?.legacyRows.some(row => row.filaId === 'densidad'), true);
});
import assert from 'node:assert/strict';
import test from 'node:test';
import { buildD1Dashboard } from '../../src/lib/d1-transform';
import { createD1SeedTables } from '../../src/lib/d1-definition';
import { buildD1ExcelSheets, buildD1PdfTable } from '../../src/lib/d1-export';

function buildDashboard() {
  const rawTables = createD1SeedTables().map((table, tableIndex) => ({
    id: `cfg-${tableIndex}`,
    tablaId: table.tablaId,
    nombre: table.nombre,
    orden: tableIndex,
    datos: table.datos.map((row, rowIndex) => ({
      id: row.filaId,
      label: row.label,
      periodoAnterior: rowIndex + 10,
      periodoActual: rowIndex + 20,
    })),
  }));

  return buildD1Dashboard(rawTables);
}

test('d1 export arma hojas por resumen y seccion', () => {
  const dashboard = buildDashboard();
  const sheets = buildD1ExcelSheets(
    {
      titulo: 'Departamento Personal (D-1)',
      departamento: 'Departamento Personal (D-1)',
      periodo: 'Marzo 2026 vs Abril 2026',
      periodoAnteriorLabel: 'Marzo 2026',
      periodoActualLabel: 'Abril 2026',
      generatedAt: new Date('2026-04-13T00:00:00.000Z'),
    },
    dashboard,
    [{ nombre: '1', valor: 20 }]
  );

  assert.equal(sheets[0].nombre, '01 Resumen D1');
  assert.equal(sheets[0].datos[0][0], 'SIGEP - Sistema de Gestion Estadistica Policial');
  assert.equal(sheets.length, dashboard.sections.length + 1);
});

test('d1 export arma columnas de porcentaje cuando la tabla lo requiere', () => {
  const dashboard = buildDashboard();
  const table = dashboard.tablesById['d1-personal-por-genero'];
  const pdfTable = buildD1PdfTable(table, {
    titulo: 'Departamento Personal (D-1)',
    departamento: 'Departamento Personal (D-1)',
    periodo: 'Marzo 2026 vs Abril 2026',
    periodoAnteriorLabel: 'Marzo 2026',
    periodoActualLabel: 'Abril 2026',
  });

  assert.equal(pdfTable.head[0].length, 7);
  assert.equal(pdfTable.body[0].length, 7);
});
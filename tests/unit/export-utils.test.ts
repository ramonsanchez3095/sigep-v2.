import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildExcelSheetData,
  buildExportFilename,
  buildPdfTableData,
  calculateComparisonMetrics,
} from '../../src/lib/export-utils';

const filas = [
  {
    id: 'fila-1',
    label: 'Hechos',
    periodoAnterior: 10,
    periodoActual: 25,
  },
  {
    id: 'fila-2',
    label: 'Detenciones',
    periodoAnterior: 0,
    periodoActual: 5,
  },
];

describe('export utils', () => {
  it('calcula diferencia y porcentaje por fila', () => {
    assert.deepEqual(calculateComparisonMetrics(filas[0]), {
      diferencia: 15,
      porcentaje: 150,
    });

    assert.deepEqual(calculateComparisonMetrics(filas[1]), {
      diferencia: 5,
      porcentaje: 100,
    });
  });

  it('arma las filas del PDF incluyendo total', () => {
    const rows = buildPdfTableData(filas);

    assert.equal(rows.length, 3);
    assert.deepEqual(rows[0], ['Hechos', '10', '25', '+15', '+150%']);
    assert.deepEqual(rows[1], ['Detenciones', '0', '5', '+5', '+100%']);
    assert.deepEqual(rows[2], ['TOTAL', '10', '30', '+20', '+200%']);
  });

  it('arma la hoja de Excel con encabezado y total', () => {
    const rows = buildExcelSheetData(
      {
        titulo: 'Tabla Principal',
        departamento: 'Departamento 1',
        periodo: '2024 vs 2025',
        generatedAt: new Date('2026-04-06T00:00:00.000Z'),
      },
      filas
    );

    assert.equal(rows[0][0], 'SIGEP - Sistema de Gestión Estadística Policial');
    assert.equal(rows[2][0], 'Departamento 1');
    assert.equal(rows[3][0], 'Tabla Principal');
    assert.deepEqual(rows[8], ['Hechos', 10, 25, 15, '150%']);
    assert.deepEqual(rows[9], ['Detenciones', 0, 5, 5, '100%']);
    assert.deepEqual(rows[10], ['TOTAL', 10, 30, 20, '200%']);
  });

  it('genera nombres de archivo estables', () => {
    const filename = buildExportFilename(
      'Tabla Principal',
      'xlsx',
      new Date('2026-04-06T00:00:00.000Z')
    );

    assert.equal(filename, 'Tabla_Principal_2026-04-06.xlsx');
  });
});
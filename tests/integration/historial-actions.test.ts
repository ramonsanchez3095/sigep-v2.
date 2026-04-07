import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { obtenerHistorialWithDb } from '../../src/actions/historial';
import {
  departamentos,
  historialCambios,
  tablasConfig,
  usuarios,
} from '../../src/db/schema';
import { createTestDb, type TestDb } from '../helpers/postgres-test-db';

const DEPARTAMENTO_ID = '10000000-0000-0000-0000-000000000001';
const TABLA_ID = '10000000-0000-0000-0000-000000000002';
const USUARIO_ID = '10000000-0000-0000-0000-000000000003';

describe('historial actions integration', () => {
  let testDb: TestDb;

  beforeEach(async () => {
    testDb = await createTestDb();

    await testDb.db.insert(departamentos).values({
      id: DEPARTAMENTO_ID,
      codigo: 'd1',
      nombre: 'Departamento 1',
      orden: 1,
      color: '#123456',
    });

    await testDb.db.insert(usuarios).values({
      id: USUARIO_ID,
      username: 'admin',
      passwordHash: 'hash',
      nombre: 'Administrador',
      rol: 'ADMIN',
      departamentoId: DEPARTAMENTO_ID,
    });

    await testDb.db.insert(tablasConfig).values({
      id: TABLA_ID,
      tablaId: 'tabla-historial',
      nombre: 'Tabla Historial',
      orden: 1,
      departamentoId: DEPARTAMENTO_ID,
    });
  });

  afterEach(async () => {
    await testDb.close();
  });

  it('devuelve historial vacio cuando no existen cambios', async () => {
    const result = await obtenerHistorialWithDb(testDb.db, 10);

    assert.deepEqual(result, []);
  });

  it('ordena descendentemente y respeta el limite', async () => {
    await testDb.db.insert(historialCambios).values([
      {
        campo: 'PERIODO_ACTUAL',
        valorAnterior: '10.00',
        valorNuevo: '11.00',
        filaId: 'fila-1',
        filaLabel: 'Fila 1',
        usuarioId: USUARIO_ID,
        tablaConfigId: TABLA_ID,
        timestamp: new Date('2025-01-01T08:00:00.000Z'),
      },
      {
        campo: 'PERIODO_ACTUAL',
        valorAnterior: '11.00',
        valorNuevo: '12.00',
        filaId: 'fila-2',
        filaLabel: 'Fila 2',
        usuarioId: USUARIO_ID,
        tablaConfigId: TABLA_ID,
        timestamp: new Date('2025-01-02T08:00:00.000Z'),
      },
      {
        campo: 'PERIODO_ANTERIOR',
        valorAnterior: '5.00',
        valorNuevo: '6.00',
        filaId: 'fila-3',
        filaLabel: 'Fila 3',
        usuarioId: USUARIO_ID,
        tablaConfigId: TABLA_ID,
        timestamp: new Date('2025-01-03T08:00:00.000Z'),
      },
    ]);

    const result = await obtenerHistorialWithDb(testDb.db, 2);

    assert.equal(result.length, 2);
    assert.equal(result[0].valorNuevo, '6.00');
    assert.equal(result[0].tablaNombre, 'Tabla Historial');
    assert.equal(result[0].usuarioNombre, 'Administrador');
    assert.equal(result[1].valorNuevo, '12.00');
    assert.ok(new Date(result[0].fecha) > new Date(result[1].fecha));
  });

  it('rechaza limites fuera de rango', async () => {
    await assert.rejects(
      () => obtenerHistorialWithDb(testDb.db, 0),
      /El límite debe estar entre 1 y 200/
    );

    await assert.rejects(
      () => obtenerHistorialWithDb(testDb.db, 999),
      /El límite debe estar entre 1 y 200/
    );
  });
});
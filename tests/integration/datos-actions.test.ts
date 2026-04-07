import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { eq } from 'drizzle-orm';
import {
  guardarDatosComparativosWithDeps,
  obtenerTablasDelDepartamentoWithDb,
} from '../../src/actions/datos';
import { obtenerHistorialWithDb } from '../../src/actions/historial';
import {
  datosComparativos,
  departamentos,
  historialCambios,
  tablasConfig,
  usuarios,
} from '../../src/db/schema';
import { createTestDb, type TestDb } from '../helpers/postgres-test-db';

const DEPARTAMENTO_ID = '00000000-0000-0000-0000-000000000001';
const TABLA_ID = '00000000-0000-0000-0000-000000000002';
const USUARIO_ID = '00000000-0000-0000-0000-000000000003';
const DATO_ID = '00000000-0000-0000-0000-000000000004';

describe('datos actions integration', () => {
  let testDb: TestDb;

  beforeEach(async () => {
    testDb = await createTestDb();

    await testDb.db.insert(departamentos).values({
      id: DEPARTAMENTO_ID,
      codigo: 'd1',
      nombre: 'Departamento 1',
      color: '#123456',
      orden: 1,
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
      tablaId: 'tabla-principal',
      nombre: 'Tabla principal',
      orden: 1,
      departamentoId: DEPARTAMENTO_ID,
    });

    await testDb.db.insert(datosComparativos).values({
      id: DATO_ID,
      filaId: 'fila-1',
      label: 'Hechos',
      periodoAnterior: '10.50',
      periodoActual: '20.00',
      orden: 1,
      tablaConfigId: TABLA_ID,
    });
  });

  afterEach(async () => {
    await testDb.close();
  });

  it('obtiene tablas del departamento con decimales convertidos', async () => {
    const result = await obtenerTablasDelDepartamentoWithDb(testDb.db, 'd1');

    assert.equal(result.departamento?.id, DEPARTAMENTO_ID);
    assert.equal(result.tablas.length, 1);
    assert.deepEqual(result.tablas[0], {
      id: TABLA_ID,
      tablaId: 'tabla-principal',
      nombre: 'Tabla principal',
      orden: 1,
      datos: [
        {
          id: 'fila-1',
          label: 'Hechos',
          periodoAnterior: 10.5,
          periodoActual: 20,
        },
      ],
    });
  });

  it('devuelve departamento nulo para un codigo inexistente', async () => {
    const result = await obtenerTablasDelDepartamentoWithDb(
      testDb.db,
      'departamento-inexistente'
    );

    assert.equal(result.departamento, null);
    assert.deepEqual(result.tablas, []);
  });

  it('guarda cambios, revalida y registra historial', async () => {
    const revalidateCalls: Array<[string, 'layout' | 'page' | undefined]> = [];

    await guardarDatosComparativosWithDeps(
      {
        database: testDb.db,
        getSession: async () => ({ user: { id: USUARIO_ID, rol: 'ADMIN' } }),
        revalidate: (path, type) => {
          revalidateCalls.push([path, type]);
        },
      },
      TABLA_ID,
      [
        {
          filaId: 'fila-1',
          label: 'Hechos actualizados',
          periodoAnterior: '11.00',
          periodoActual: '22.00',
        },
      ]
    );

    const [updatedRow] = await testDb.db
      .select()
      .from(datosComparativos)
      .where(eq(datosComparativos.id, DATO_ID));

    assert.equal(updatedRow.label, 'Hechos actualizados');
    assert.equal(updatedRow.periodoAnterior, '11.00');
    assert.equal(updatedRow.periodoActual, '22.00');

    const historyRows = await testDb.db.select().from(historialCambios);
    assert.equal(historyRows.length, 2);

    const history = await obtenerHistorialWithDb(testDb.db, 10);
    assert.equal(history.length, 2);
    assert.deepEqual(
      [...history.map(item => item.campo)].sort(),
      ['PERIODO_ACTUAL', 'PERIODO_ANTERIOR']
    );
    assert.deepEqual(
      [...history.map(item => item.valorNuevo)].sort(),
      ['11.00', '22.00']
    );
    assert.ok(history.every(item => item.usuarioNombre === 'Administrador'));
    assert.ok(history.every(item => item.tablaNombre === 'Tabla principal'));
    assert.deepEqual(revalidateCalls, [['/', undefined]]);
  });

  it('rechaza guardar datos sin sesion', async () => {
    await assert.rejects(
      () =>
        guardarDatosComparativosWithDeps(
          {
            database: testDb.db,
            getSession: async () => null,
            revalidate: () => {},
          },
          TABLA_ID,
          []
        ),
      /No autorizado/
    );
  });

  it('rechaza guardar datos para una tabla inexistente', async () => {
    await assert.rejects(
      () =>
        guardarDatosComparativosWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: USUARIO_ID, rol: 'ADMIN' } }),
            revalidate: () => {},
          },
          '00000000-0000-0000-0000-999999999999',
          [
            {
              filaId: 'fila-1',
              label: 'Hechos',
              periodoAnterior: '10.00',
              periodoActual: '20.00',
            },
          ]
        ),
      /Tabla no encontrada/
    );
  });

  it('rechaza filas con valores negativos', async () => {
    await assert.rejects(
      () =>
        guardarDatosComparativosWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: USUARIO_ID, rol: 'ADMIN' } }),
            revalidate: () => {},
          },
          TABLA_ID,
          [
            {
              filaId: 'fila-1',
              label: 'Hechos',
              periodoAnterior: '-1',
              periodoActual: '20.00',
            },
          ]
        ),
      /El valor no puede ser negativo/
    );
  });

  it('rechaza guardar sin filas', async () => {
    await assert.rejects(
      () =>
        guardarDatosComparativosWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: USUARIO_ID, rol: 'ADMIN' } }),
            revalidate: () => {},
          },
          TABLA_ID,
          []
        ),
      /Debe enviar al menos una fila/
    );
  });
});
import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, it } from 'node:test';
import { eq } from 'drizzle-orm';
import {
  activarPeriodoWithDeps,
  crearPeriodoWithDeps,
  crearUsuarioWithDeps,
  toggleUsuarioActivoWithDeps,
} from '../../src/actions/configuracion';
import { configPeriodos, usuarios } from '../../src/db/schema';
import { createTestDb, type TestDb } from '../helpers/postgres-test-db';

const ADMIN_ID = '00000000-0000-0000-0000-000000000011';
const EDITOR_ID = '00000000-0000-0000-0000-000000000012';
const USUARIO_ACTIVO_ID = '00000000-0000-0000-0000-000000000013';

describe('configuracion actions integration', () => {
  let testDb: TestDb;

  beforeEach(async () => {
    testDb = await createTestDb();

    await testDb.db.insert(usuarios).values([
      {
        id: ADMIN_ID,
        username: 'admin',
        passwordHash: 'hash-admin',
        nombre: 'Admin',
        rol: 'ADMIN',
      },
      {
        id: EDITOR_ID,
        username: 'editor',
        passwordHash: 'hash-editor',
        nombre: 'Editor',
        rol: 'EDITOR',
      },
      {
        id: USUARIO_ACTIVO_ID,
        username: 'activo',
        passwordHash: 'hash-activo',
        nombre: 'Usuario Activo',
        rol: 'VIEWER',
      },
    ]);

    await testDb.db.insert(configPeriodos).values({
      id: '00000000-0000-0000-0000-000000000021',
      anteriorInicio: new Date('2024-01-01T00:00:00.000Z'),
      anteriorFin: new Date('2024-01-31T23:59:59.000Z'),
      anteriorLabel: 'Enero 2024',
      actualInicio: new Date('2025-01-01T00:00:00.000Z'),
      actualFin: new Date('2025-01-31T23:59:59.000Z'),
      actualLabel: 'Enero 2025',
      activo: true,
    });
  });

  afterEach(async () => {
    await testDb.close();
  });

  it('crea un periodo nuevo solo para ADMIN y desactiva el anterior', async () => {
    const revalidateCalls: Array<[string, 'layout' | 'page' | undefined]> = [];

    await crearPeriodoWithDeps(
      {
        database: testDb.db,
        getSession: async () => ({ user: { id: ADMIN_ID, rol: 'ADMIN' } }),
        revalidate: (path, type) => {
          revalidateCalls.push([path, type]);
        },
        hashPassword: async password => `hash:${password}`,
      },
      {
        modo: 'manual',
        periodoAnterior: 'Febrero 2024',
        periodoActual: 'Febrero 2025',
      }
    );

    const periodos = await testDb.db.select().from(configPeriodos);
    assert.equal(periodos.length, 2);
    assert.equal(periodos.filter(periodo => periodo.activo).length, 1);

    const activePeriodo = periodos.find(periodo => periodo.activo);
    assert.equal(activePeriodo?.anteriorLabel, 'Febrero 2024');
    assert.equal(activePeriodo?.actualLabel, 'Febrero 2025');
    assert.deepEqual(revalidateCalls, [['/', 'layout']]);

    await assert.rejects(
      () =>
        crearPeriodoWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: EDITOR_ID, rol: 'EDITOR' } }),
            revalidate: () => {},
            hashPassword: async password => `hash:${password}`,
          },
          {
            modo: 'manual',
            periodoAnterior: 'Marzo 2024',
            periodoActual: 'Marzo 2025',
          }
        ),
      /Sin permisos/
    );
  });

  it('crea un periodo desde mes estadístico con fechas y etiquetas automáticas', async () => {
    await crearPeriodoWithDeps(
      {
        database: testDb.db,
        getSession: async () => ({ user: { id: ADMIN_ID, rol: 'ADMIN' } }),
        revalidate: () => {},
        hashPassword: async password => `hash:${password}`,
      },
      {
        modo: 'mes-estadistico',
        anteriorMes: 3,
        anteriorAnio: 2025,
        actualMes: 4,
        actualAnio: 2026,
      }
    );

    const periodos = await testDb.db.select().from(configPeriodos);
    const activePeriodo = periodos.find(periodo => periodo.activo);

    assert.equal(activePeriodo?.anteriorLabel, 'Mes estadístico marzo de 2025');
    assert.equal(activePeriodo?.actualLabel, 'Mes estadístico abril de 2026');
    assert.equal(activePeriodo?.anteriorInicio.toISOString().slice(0, 10), '2025-03-01');
    assert.equal(activePeriodo?.actualInicio.toISOString().slice(0, 10), '2026-04-01');
  });

  it('crea usuarios y alterna estado solo para ADMIN', async () => {
    const revalidateCalls: Array<[string, 'layout' | 'page' | undefined]> = [];

    await crearUsuarioWithDeps(
      {
        database: testDb.db,
        getSession: async () => ({ user: { id: ADMIN_ID, rol: 'ADMIN' } }),
        revalidate: (path, type) => {
          revalidateCalls.push([path, type]);
        },
        hashPassword: async password => `hash:${password}`,
      },
      {
        username: 'nuevo.usuario',
        password: 'secreto123',
        nombre: 'Nuevo Usuario',
        rol: 'VIEWER',
      }
    );

    const [createdUser] = await testDb.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.username, 'nuevo.usuario'));

    assert.equal(createdUser.nombre, 'Nuevo Usuario');
    assert.equal(createdUser.rol, 'VIEWER');
    assert.equal(createdUser.passwordHash, 'hash:secreto123');

    await toggleUsuarioActivoWithDeps(
      {
        database: testDb.db,
        getSession: async () => ({ user: { id: ADMIN_ID, rol: 'ADMIN' } }),
        revalidate: (path, type) => {
          revalidateCalls.push([path, type]);
        },
        hashPassword: async password => `hash:${password}`,
      },
      USUARIO_ACTIVO_ID,
      false
    );

    const [updatedUser] = await testDb.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.id, USUARIO_ACTIVO_ID));

    assert.equal(updatedUser.activo, false);
    assert.deepEqual(revalidateCalls, [
      ['/configuracion', undefined],
      ['/configuracion', undefined],
    ]);

    await assert.rejects(
      () =>
        toggleUsuarioActivoWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: EDITOR_ID, rol: 'EDITOR' } }),
            revalidate: () => {},
            hashPassword: async password => `hash:${password}`,
          },
          USUARIO_ACTIVO_ID,
          true
        ),
      /Sin permisos/
    );
  });

  it('activa un periodo existente y rechaza ids invalidos sin desactivar el actual', async () => {
    const revalidateCalls: Array<[string, 'layout' | 'page' | undefined]> = [];

    await testDb.db.insert(configPeriodos).values({
      id: '00000000-0000-0000-0000-000000000022',
      anteriorInicio: new Date('2024-02-01T00:00:00.000Z'),
      anteriorFin: new Date('2024-02-28T23:59:59.000Z'),
      anteriorLabel: 'Febrero 2024',
      actualInicio: new Date('2025-02-01T00:00:00.000Z'),
      actualFin: new Date('2025-02-28T23:59:59.000Z'),
      actualLabel: 'Febrero 2025',
      activo: false,
    });

    await activarPeriodoWithDeps(
      {
        database: testDb.db,
        getSession: async () => ({ user: { id: ADMIN_ID, rol: 'ADMIN' } }),
        revalidate: (path, type) => {
          revalidateCalls.push([path, type]);
        },
        hashPassword: async password => `hash:${password}`,
      },
      '00000000-0000-0000-0000-000000000022'
    );

    let activos = await testDb.db.select().from(configPeriodos);
    assert.equal(activos.filter(periodo => periodo.activo).length, 1);
    assert.equal(
      activos.find(periodo => periodo.activo)?.id,
      '00000000-0000-0000-0000-000000000022'
    );

    await assert.rejects(
      () =>
        activarPeriodoWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: ADMIN_ID, rol: 'ADMIN' } }),
            revalidate: () => {},
            hashPassword: async password => `hash:${password}`,
          },
          '00000000-0000-0000-0000-999999999999'
        ),
      /Periodo no encontrado/
    );

    activos = await testDb.db.select().from(configPeriodos);
    assert.equal(activos.filter(periodo => periodo.activo).length, 1);
    assert.equal(
      activos.find(periodo => periodo.activo)?.id,
      '00000000-0000-0000-0000-000000000022'
    );
    assert.deepEqual(revalidateCalls, [['/', 'layout']]);

    await assert.rejects(
      () =>
        activarPeriodoWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: EDITOR_ID, rol: 'EDITOR' } }),
            revalidate: () => {},
            hashPassword: async password => `hash:${password}`,
          },
          '00000000-0000-0000-0000-000000000022'
        ),
      /Sin permisos/
    );
  });

  it('rechaza usuarios con password corta o username inválido', async () => {
    await assert.rejects(
      () =>
        crearUsuarioWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: ADMIN_ID, rol: 'ADMIN' } }),
            revalidate: () => {},
            hashPassword: async password => `hash:${password}`,
          },
          {
            username: 'usuario invalido',
            password: '123',
            nombre: 'Usuario Inválido',
            rol: 'VIEWER',
          }
        ),
      /El usuario solo puede contener|La contraseña debe tener al menos 8 caracteres/
    );
  });

  it('rechaza periodos duplicados o ids malformados', async () => {
    await assert.rejects(
      () =>
        crearPeriodoWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: ADMIN_ID, rol: 'ADMIN' } }),
            revalidate: () => {},
            hashPassword: async password => `hash:${password}`,
          },
          {
            modo: 'manual',
            periodoAnterior: 'Mismo período',
            periodoActual: 'Mismo período',
          }
        ),
      /Los períodos deben ser distintos/
    );

    await assert.rejects(
      () =>
        activarPeriodoWithDeps(
          {
            database: testDb.db,
            getSession: async () => ({ user: { id: ADMIN_ID, rol: 'ADMIN' } }),
            revalidate: () => {},
            hashPassword: async password => `hash:${password}`,
          },
          'periodo-invalido'
        ),
      /Id inválido/
    );
  });
});
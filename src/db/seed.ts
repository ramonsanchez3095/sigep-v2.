import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import * as schema from './schema';
import { createD1SeedTables } from '../lib/d1-definition';

const DATABASE_URL = process.env.DATABASE_URL!;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

const departamentosData = [
  {
    codigo: 'd1',
    nombre: 'Departamento Personal (D-1)',
    color: '#1e3a5f',
    orden: 1,
  },
  {
    codigo: 'd2',
    nombre: 'Departamento Inteligencia Criminal (D-2)',
    color: '#0ea5e9',
    orden: 2,
  },
  {
    codigo: 'd3',
    nombre: 'Departamento Operaciones Policiales (D-3)',
    color: '#ef4444',
    orden: 3,
  },
  {
    codigo: 'd4',
    nombre: 'Departamento Logística (D-4)',
    color: '#f59e0b',
    orden: 4,
  },
  {
    codigo: 'd5',
    nombre: 'Departamento Judicial (D-5)',
    color: '#8b5cf6',
    orden: 5,
  },
  {
    codigo: 'asuntos_internos',
    nombre: 'Dirección General de Asuntos Internos',
    color: '#374151',
    orden: 6,
  },
  {
    codigo: 'delitos_rurales',
    nombre: 'Dirección General de Delitos Rurales',
    color: '#22c55e',
    orden: 7,
  },
  {
    codigo: 'digedrop',
    nombre: 'Dirección General de Drogas Peligrosas',
    color: '#dc2626',
    orden: 8,
  },
  {
    codigo: 'prevencion_ciudadana',
    nombre: 'Dirección General de Prevención Ciudadana',
    color: '#06b6d4',
    orden: 9,
  },
  {
    codigo: 'unidades_especiales',
    nombre: 'Dirección General de Unidades Especiales',
    color: '#ea580c',
    orden: 10,
  },
  {
    codigo: 'institutos',
    nombre: 'Dirección General de Institutos e Instrucción',
    color: '#2563eb',
    orden: 11,
  },
  {
    codigo: 'unidades_regionales',
    nombre: 'Unidades Regionales',
    color: '#7c3aed',
    orden: 12,
  },
];

const usuariosData = [
  {
    username: 'superadmin',
    password: 'SIGEP_Admin#2024!',
    nombre: 'Super Administrador',
    rol: 'ADMIN' as const,
    color: '#1e3a5f',
    departamento: null,
    permisos: ['all', 'read', 'write', 'export', 'admin'],
  },
  {
    username: 'd1_admin',
    password: 'D1_Admin#2024!!',
    nombre: 'Administrador D-1',
    rol: 'ADMIN' as const,
    color: '#1e3a5f',
    departamento: 'd1',
    permisos: ['d1', 'read', 'write', 'export'],
  },
  {
    username: 'd2_admin',
    password: 'D2_Admin#2024!!',
    nombre: 'Administrador D-2',
    rol: 'ADMIN' as const,
    color: '#0ea5e9',
    departamento: 'd2',
    permisos: ['d2', 'read', 'write', 'export'],
  },
  {
    username: 'd3_admin',
    password: 'D3_Admin#2024!!',
    nombre: 'Administrador D-3',
    rol: 'ADMIN' as const,
    color: '#ef4444',
    departamento: 'd3',
    permisos: ['d3', 'read', 'write', 'export'],
  },
  {
    username: 'd4_admin',
    password: 'D4_Admin#2024!!',
    nombre: 'Administrador D-4',
    rol: 'ADMIN' as const,
    color: '#f59e0b',
    departamento: 'd4',
    permisos: ['d4', 'read', 'write', 'export'],
  },
  {
    username: 'd5_admin',
    password: 'D5_Admin#2024!!',
    nombre: 'Administrador D-5',
    rol: 'ADMIN' as const,
    color: '#8b5cf6',
    departamento: 'd5',
    permisos: ['d5', 'read', 'write', 'export'],
  },
  {
    username: 'asuntos_admin',
    password: 'Asuntos_Admin#24!',
    nombre: 'Administrador Asuntos Internos',
    rol: 'ADMIN' as const,
    color: '#374151',
    departamento: 'asuntos_internos',
    permisos: ['asuntos_internos', 'read', 'write', 'export'],
  },
  {
    username: 'rurales_admin',
    password: 'Rurales_Admin#24!',
    nombre: 'Administrador Delitos Rurales',
    rol: 'ADMIN' as const,
    color: '#22c55e',
    departamento: 'delitos_rurales',
    permisos: ['delitos_rurales', 'read', 'write', 'export'],
  },
  {
    username: 'digedrop_admin',
    password: 'Digedrop_Adm#24!',
    nombre: 'Administrador DIGEDROP',
    rol: 'ADMIN' as const,
    color: '#dc2626',
    departamento: 'digedrop',
    permisos: ['digedrop', 'read', 'write', 'export'],
  },
  {
    username: 'prevencion_admin',
    password: 'Prevencion_Ad#24!',
    nombre: 'Administrador Prevención',
    rol: 'ADMIN' as const,
    color: '#06b6d4',
    departamento: 'prevencion_ciudadana',
    permisos: ['prevencion_ciudadana', 'read', 'write', 'export'],
  },
  {
    username: 'especiales_admin',
    password: 'Especiales_Ad#24!',
    nombre: 'Administrador Unidades Especiales',
    rol: 'ADMIN' as const,
    color: '#ea580c',
    departamento: 'unidades_especiales',
    permisos: ['unidades_especiales', 'read', 'write', 'export'],
  },
  {
    username: 'institutos_admin',
    password: 'Institutos_Ad#24!',
    nombre: 'Administrador Institutos',
    rol: 'ADMIN' as const,
    color: '#2563eb',
    departamento: 'institutos',
    permisos: ['institutos', 'read', 'write', 'export'],
  },
  {
    username: 'regionales_admin',
    password: 'Regionales_Ad#24!',
    nombre: 'Administrador Unidades Regionales',
    rol: 'ADMIN' as const,
    color: '#7c3aed',
    departamento: 'unidades_regionales',
    permisos: ['unidades_regionales', 'read', 'write', 'export'],
  },
];

type TablaData = {
  tablaId: string;
  nombre: string;
  datos: {
    filaId: string;
    label: string;
    periodoAnterior: number;
    periodoActual: number;
  }[];
};

const allTablas: Record<string, TablaData[]> = {
  d1: createD1SeedTables(),
  d3: [
    {
      tablaId: 'd3-delitos-propiedad',
      nombre: 'Delitos Contra la Propiedad',
      datos: [
        {
          filaId: 'hurto',
          label: 'HURTO',
          periodoAnterior: 3245,
          periodoActual: 2987,
        },
        {
          filaId: 'robo',
          label: 'ROBO',
          periodoAnterior: 1876,
          periodoActual: 1654,
        },
        {
          filaId: 'robo_agravado',
          label: 'ROBO AGRAVADO',
          periodoAnterior: 543,
          periodoActual: 489,
        },
      ],
    },
    {
      tablaId: 'd3-homicidios',
      nombre: 'Homicidios',
      datos: [
        {
          filaId: 'doloso',
          label: 'HOMICIDIO DOLOSO',
          periodoAnterior: 45,
          periodoActual: 38,
        },
        {
          filaId: 'culposo',
          label: 'HOMICIDIO CULPOSO',
          periodoAnterior: 123,
          periodoActual: 98,
        },
      ],
    },
  ],
  d4: [
    {
      tablaId: 'd4-armamento',
      nombre: 'Armamento Total',
      datos: [
        {
          filaId: 'pistolas',
          label: 'PISTOLAS 9MM',
          periodoAnterior: 8500,
          periodoActual: 9200,
        },
        {
          filaId: 'escopetas',
          label: 'ESCOPETAS',
          periodoAnterior: 1200,
          periodoActual: 1350,
        },
        {
          filaId: 'chalecos',
          label: 'CHALECOS ANTIBALAS',
          periodoAnterior: 5600,
          periodoActual: 6100,
        },
      ],
    },
    {
      tablaId: 'd4-vehiculos',
      nombre: 'Vehículos',
      datos: [
        {
          filaId: 'patrulleros',
          label: 'PATRULLEROS',
          periodoAnterior: 450,
          periodoActual: 520,
        },
        {
          filaId: 'motos',
          label: 'MOTOCICLETAS',
          periodoAnterior: 380,
          periodoActual: 420,
        },
        {
          filaId: 'otros',
          label: 'OTROS VEHÍCULOS',
          periodoAnterior: 120,
          periodoActual: 145,
        },
      ],
    },
  ],
  d2: [
    {
      tablaId: 'd2-privados-libertad',
      nombre: 'Privados de Libertad',
      datos: [
        {
          filaId: 'total',
          label: 'TOTAL PRIVADOS DE LIBERTAD',
          periodoAnterior: 2345,
          periodoActual: 2567,
        },
        {
          filaId: 'procesados',
          label: 'PROCESADOS',
          periodoAnterior: 1234,
          periodoActual: 1456,
        },
        {
          filaId: 'condenados',
          label: 'CONDENADOS',
          periodoAnterior: 1111,
          periodoActual: 1111,
        },
      ],
    },
  ],
  d5: [
    {
      tablaId: 'd5-detenidos-procesales',
      nombre: 'Detenidos Procesales',
      datos: [
        {
          filaId: 'total_detenidos',
          label: 'TOTAL DETENIDOS',
          periodoAnterior: 3456,
          periodoActual: 3789,
        },
        {
          filaId: 'con_pendientes',
          label: 'CON PENDIENTES',
          periodoAnterior: 567,
          periodoActual: 623,
        },
      ],
    },
  ],
  asuntos_internos: [
    {
      tablaId: 'ai-denuncias',
      nombre: 'Denuncias Recibidas',
      datos: [
        {
          filaId: 'abuso_autoridad',
          label: 'ABUSO DE AUTORIDAD',
          periodoAnterior: 45,
          periodoActual: 38,
        },
        {
          filaId: 'negligencia',
          label: 'NEGLIGENCIA',
          periodoAnterior: 67,
          periodoActual: 54,
        },
        {
          filaId: 'abandono',
          label: 'ABANDONO DE SERVICIO',
          periodoAnterior: 23,
          periodoActual: 19,
        },
      ],
    },
  ],
  delitos_rurales: [
    {
      tablaId: 'dr-delitos-tipo',
      nombre: 'Delitos por Tipo',
      datos: [
        {
          filaId: 'abigeato',
          label: 'ABIGEATO',
          periodoAnterior: 234,
          periodoActual: 198,
        },
        {
          filaId: 'robo_maquinaria',
          label: 'ROBO DE MAQUINARIA',
          periodoAnterior: 56,
          periodoActual: 43,
        },
      ],
    },
  ],
  digedrop: [
    {
      tablaId: 'digedrop-sustancias',
      nombre: 'Sustancias Secuestradas',
      datos: [
        {
          filaId: 'cocaina',
          label: 'COCAÍNA (kg)',
          periodoAnterior: 156.5,
          periodoActual: 189.3,
        },
        {
          filaId: 'marihuana',
          label: 'MARIHUANA (kg)',
          periodoAnterior: 2345.8,
          periodoActual: 2890.4,
        },
        {
          filaId: 'pasta_base',
          label: 'PASTA BASE (kg)',
          periodoAnterior: 45.2,
          periodoActual: 67.8,
        },
      ],
    },
    {
      tablaId: 'digedrop-operativos',
      nombre: 'Operativos Realizados',
      datos: [
        {
          filaId: 'allanamientos',
          label: 'ALLANAMIENTOS',
          periodoAnterior: 234,
          periodoActual: 287,
        },
        {
          filaId: 'detenidos',
          label: 'DETENIDOS',
          periodoAnterior: 456,
          periodoActual: 534,
        },
      ],
    },
  ],
  prevencion_ciudadana: [
    {
      tablaId: 'pc-operativos',
      nombre: 'Operativos de Prevención',
      datos: [
        {
          filaId: 'operativos',
          label: 'OPERATIVOS REALIZADOS',
          periodoAnterior: 1234,
          periodoActual: 1567,
        },
        {
          filaId: 'personas',
          label: 'PERSONAS IDENTIFICADAS',
          periodoAnterior: 5678,
          periodoActual: 6789,
        },
      ],
    },
  ],
  unidades_especiales: [
    {
      tablaId: 'ue-intervenciones',
      nombre: 'Intervenciones',
      datos: [
        {
          filaId: 'goe',
          label: 'GOE',
          periodoAnterior: 89,
          periodoActual: 102,
        },
        {
          filaId: 'bomberos',
          label: 'BOMBEROS',
          periodoAnterior: 345,
          periodoActual: 398,
        },
        {
          filaId: 'canes',
          label: 'CANES',
          periodoAnterior: 123,
          periodoActual: 156,
        },
      ],
    },
  ],
  institutos: [
    {
      tablaId: 'inst-formacion',
      nombre: 'Formación',
      datos: [
        {
          filaId: 'aspirantes',
          label: 'ASPIRANTES EN FORMACIÓN',
          periodoAnterior: 456,
          periodoActual: 523,
        },
        {
          filaId: 'egresados',
          label: 'EGRESADOS',
          periodoAnterior: 234,
          periodoActual: 267,
        },
      ],
    },
  ],
  unidades_regionales: [
    {
      tablaId: 'ur-resumen',
      nombre: 'Resumen por Regional',
      datos: [
        {
          filaId: 'ur_capital',
          label: 'UR CAPITAL',
          periodoAnterior: 2345,
          periodoActual: 2567,
        },
        {
          filaId: 'ur_norte',
          label: 'UR NORTE',
          periodoAnterior: 1234,
          periodoActual: 1456,
        },
        {
          filaId: 'ur_sur',
          label: 'UR SUR',
          periodoAnterior: 987,
          periodoActual: 1023,
        },
        {
          filaId: 'ur_este',
          label: 'UR ESTE',
          periodoAnterior: 756,
          periodoActual: 834,
        },
        {
          filaId: 'ur_oeste',
          label: 'UR OESTE',
          periodoAnterior: 654,
          periodoActual: 723,
        },
      ],
    },
  ],
};

const tablasInicialesEnCero: Record<string, TablaData[]> = Object.fromEntries(
  Object.entries(allTablas).map(([deptCodigo, tablas]) => [
    deptCodigo,
    tablas.map(tabla => ({
      ...tabla,
      datos: tabla.datos.map(dato => ({
        ...dato,
        periodoAnterior: 0,
        periodoActual: 0,
      })),
    })),
  ])
);

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, { schema });
  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const anioAnterior = anioActual - 1;
  const periodoInicial = {
    anteriorInicio: new Date(anioAnterior, 0, 1),
    anteriorFin: new Date(anioAnterior, 11, 31, 23, 59, 59),
    anteriorLabel: `Período anterior ${anioAnterior}`,
    actualInicio: new Date(anioActual, 0, 1),
    actualFin: new Date(anioActual, 11, 31, 23, 59, 59),
    actualLabel: `Período actual ${anioActual}`,
    activo: true,
  };

  console.log('🌱 Iniciando seed de la base de datos SIGEP v2...\n');

  try {
    // Limpiar tablas en orden correcto
    console.log('🧹 Limpiando datos existentes...');
    await pool.query('DELETE FROM estadisticas_anuales');
    await pool.query('DELETE FROM estadisticas_mensuales');
    await pool.query('DELETE FROM estadisticas_diarias');
    await pool.query('DELETE FROM historial_cambios');
    await pool.query('DELETE FROM snapshots');
    await pool.query('DELETE FROM datos_comparativos');
    await pool.query('DELETE FROM tablas_config');
    await pool.query('DELETE FROM permisos');
    await pool.query('DELETE FROM refresh_tokens');
    await pool.query('DELETE FROM usuarios');
    await pool.query('DELETE FROM departamentos');
    await pool.query('DELETE FROM config_global');
    await pool.query('DELETE FROM config_periodos');

    // Config global
    console.log('⚙️ Creando configuración global...');
    await db.insert(schema.configGlobal).values({ edicionHabilitada: false });
    await db.insert(schema.configPeriodos).values(periodoInicial);

    // Departamentos
    console.log('🏢 Creando departamentos...');
    const deptMap = new Map<string, string>();
    for (const dept of departamentosData) {
      const [created] = await db
        .insert(schema.departamentos)
        .values(dept)
        .returning({ id: schema.departamentos.id });
      deptMap.set(dept.codigo, created.id);
      console.log(`   ✓ ${dept.nombre}`);
    }

    // Usuarios
    console.log('\n👥 Creando usuarios...');
    for (const userData of usuariosData) {
      const passwordHash = await hashPassword(userData.password);
      const departamentoId = userData.departamento
        ? deptMap.get(userData.departamento) || null
        : null;

      const [user] = await db
        .insert(schema.usuarios)
        .values({
          username: userData.username,
          passwordHash,
          nombre: userData.nombre,
          rol: userData.rol,
          color: userData.color,
          departamentoId,
        })
        .returning({ id: schema.usuarios.id });

      for (const tipo of userData.permisos) {
        await db.insert(schema.permisos).values({
          usuarioId: user.id,
          tipo,
        });
      }
      console.log(
        `   ✓ ${userData.username} (${userData.permisos.join(', ')})`
      );
    }

    // Tablas y datos comparativos por departamento
    for (const [deptCodigo, tablas] of Object.entries(tablasInicialesEnCero)) {
      const deptId = deptMap.get(deptCodigo);
      if (!deptId) continue;
      console.log(`\n📊 Creando tablas ${deptCodigo}...`);

      for (let i = 0; i < tablas.length; i++) {
        const tabla = tablas[i];
        const [tablaConfig] = await db
          .insert(schema.tablasConfig)
          .values({
            tablaId: tabla.tablaId,
            nombre: tabla.nombre,
            departamentoId: deptId,
            orden: i,
          })
          .returning({ id: schema.tablasConfig.id });

        for (let j = 0; j < tabla.datos.length; j++) {
          const dato = tabla.datos[j];
          await db.insert(schema.datosComparativos).values({
            tablaConfigId: tablaConfig.id,
            filaId: dato.filaId,
            label: dato.label,
            periodoAnterior: String(dato.periodoAnterior),
            periodoActual: String(dato.periodoActual),
            orden: j,
          });
        }
        console.log(`   ✓ ${tabla.nombre}`);
      }
    }

    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n🔑 Credenciales de superadmin:');
    console.log('   Usuario: superadmin');
    console.log('   Contraseña: SIGEP_Admin#2024!');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();

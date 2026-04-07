import { randomUUID } from 'node:crypto';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../src/db/schema';

const baseConnectionString =
  process.env.INTEGRATION_DATABASE_URL ??
  'postgres://sigep_user:sigep_password_2024@127.0.0.1:5433/sigep_v2';

const statements = [
  "create type rol as enum ('ADMIN', 'EDITOR', 'VIEWER')",
  "create type campo as enum ('PERIODO_ANTERIOR', 'PERIODO_ACTUAL')",
  `create table departamentos (
    id uuid primary key default gen_random_uuid(),
    codigo varchar(50) not null unique,
    nombre varchar(255) not null,
    color varchar(20) not null default '#1e3a5f',
    orden integer not null default 0,
    activo boolean not null default true,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
  )`,
  `create table usuarios (
    id uuid primary key default gen_random_uuid(),
    username varchar(255) not null unique,
    password_hash varchar(255) not null,
    nombre varchar(255) not null,
    rol rol not null default 'EDITOR',
    color varchar(20) not null default '#1e3a5f',
    activo boolean not null default true,
    departamento_id uuid references departamentos(id),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
  )`,
  `create table tablas_config (
    id uuid primary key default gen_random_uuid(),
    tabla_id varchar(255) not null unique,
    nombre varchar(255) not null,
    orden integer not null default 0,
    activo boolean not null default true,
    departamento_id uuid not null references departamentos(id),
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
  )`,
  `create table datos_comparativos (
    id uuid primary key default gen_random_uuid(),
    fila_id varchar(255) not null,
    label varchar(500) not null,
    periodo_anterior decimal(15, 2) not null default 0,
    periodo_actual decimal(15, 2) not null default 0,
    editable boolean not null default true,
    orden integer not null default 0,
    tabla_config_id uuid not null references tablas_config(id) on delete cascade,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    unique(tabla_config_id, fila_id)
  )`,
  `create table historial_cambios (
    id uuid primary key default gen_random_uuid(),
    timestamp timestamp not null default now(),
    campo campo not null,
    valor_anterior decimal(15, 2) not null,
    valor_nuevo decimal(15, 2) not null,
    fila_id varchar(255) not null,
    fila_label varchar(500) not null,
    usuario_id uuid not null references usuarios(id),
    tabla_config_id uuid not null references tablas_config(id),
    created_at timestamp not null default now()
  )`,
  `create table config_periodos (
    id uuid primary key default gen_random_uuid(),
    anterior_inicio timestamp not null,
    anterior_fin timestamp not null,
    anterior_label varchar(100) not null,
    actual_inicio timestamp not null,
    actual_fin timestamp not null,
    actual_label varchar(100) not null,
    activo boolean not null default true,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
  )`,
  `create table config_global (
    id uuid primary key default gen_random_uuid(),
    edicion_habilitada boolean not null default false,
    updated_at timestamp not null default now(),
    updated_by varchar(255)
  )`,
];

function buildSchemaConnectionString(schemaName: string) {
  const url = new URL(baseConnectionString);
  url.searchParams.set('options', `-c search_path=${schemaName}`);
  return url.toString();
}

export async function createTestDb() {
  const schemaName = `test_${randomUUID().replace(/-/g, '')}`;
  const adminPool = new Pool({ connectionString: baseConnectionString });

  try {
    await adminPool.query('create extension if not exists pgcrypto');
  } catch (error) {
    const pgError = error as { code?: string };
    if (pgError.code !== '23505') {
      throw error;
    }
  }

  await adminPool.query(`create schema if not exists "${schemaName}"`);

  const pool = new Pool({
    connectionString: buildSchemaConnectionString(schemaName),
  });

  for (const statement of statements) {
    await pool.query(statement);
  }

  const db = drizzle(pool, { schema });

  return {
    db,
    async close() {
      await pool.end();
      await adminPool.query(`drop schema if exists "${schemaName}" cascade`);
      await adminPool.end();
    },
  };
}

export type TestDb = Awaited<ReturnType<typeof createTestDb>>;
import { spawnSync } from 'node:child_process';

const containerName = 'sigep_v2_postgres';
const databaseUser = 'sigep_user';
const databaseName = 'sigep_v2';

const sql = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO departamentos (codigo, nombre, color, orden, activo)
VALUES ('d1', 'Departamento Personal (D-1)', '#1e3a5f', 1, true)
ON CONFLICT (codigo) DO UPDATE
SET nombre = EXCLUDED.nombre,
    color = EXCLUDED.color,
    orden = EXCLUDED.orden,
    activo = true,
    updated_at = NOW();

WITH superadmin_upsert AS (
  INSERT INTO usuarios (
    username,
    password_hash,
    nombre,
    rol,
    color,
    activo,
    departamento_id
  )
  VALUES (
    'superadmin',
    crypt('SIGEP_Admin#2024!', gen_salt('bf', 12)),
    'Super Administrador',
    'ADMIN',
    '#1e3a5f',
    true,
    NULL
  )
  ON CONFLICT (username) DO UPDATE
  SET password_hash = crypt('SIGEP_Admin#2024!', gen_salt('bf', 12)),
      nombre = EXCLUDED.nombre,
      rol = EXCLUDED.rol,
      color = EXCLUDED.color,
      activo = true,
      departamento_id = NULL,
      totp_enabled = false,
      totp_secret = NULL,
      updated_at = NOW()
  RETURNING id
), superadmin_row AS (
  SELECT id FROM superadmin_upsert
  UNION ALL
  SELECT id FROM usuarios WHERE username = 'superadmin'
  LIMIT 1
), permisos_seed AS (
  INSERT INTO permisos (tipo, usuario_id)
  SELECT permiso.tipo, superadmin_row.id
  FROM superadmin_row
  CROSS JOIN (VALUES ('all'), ('read'), ('write'), ('export'), ('admin')) AS permiso(tipo)
  ON CONFLICT (usuario_id, tipo) DO NOTHING
  RETURNING 1
)
SELECT 1;

UPDATE config_periodos SET activo = false;

INSERT INTO config_periodos (
  anterior_inicio,
  anterior_fin,
  anterior_label,
  actual_inicio,
  actual_fin,
  actual_label,
  activo
)
SELECT
  TIMESTAMP '2024-01-01 00:00:00',
  TIMESTAMP '2024-12-31 23:59:59',
  'Año 2024',
  TIMESTAMP '2025-01-01 00:00:00',
  TIMESTAMP '2025-12-31 23:59:59',
  'Año 2025',
  true
WHERE NOT EXISTS (
  SELECT 1
  FROM config_periodos
  WHERE anterior_label = 'Año 2024'
    AND actual_label = 'Año 2025'
);

UPDATE config_periodos
SET activo = true,
    updated_at = NOW()
WHERE id = (
  SELECT id
  FROM config_periodos
  WHERE anterior_label = 'Año 2024'
    AND actual_label = 'Año 2025'
  ORDER BY created_at DESC
  LIMIT 1
);

WITH dept AS (
  SELECT id
  FROM departamentos
  WHERE codigo = 'd1'
  LIMIT 1
)
INSERT INTO tablas_config (
  tabla_id,
  nombre,
  orden,
  activo,
  departamento_id
)
SELECT
  'd1-smoke-tabla',
  'Tabla principal smoke',
  1,
  true,
  dept.id
FROM dept
ON CONFLICT (tabla_id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    orden = EXCLUDED.orden,
    activo = true,
    departamento_id = EXCLUDED.departamento_id,
    updated_at = NOW();

WITH tabla AS (
  SELECT id
  FROM tablas_config
  WHERE tabla_id = 'd1-smoke-tabla'
  LIMIT 1
)
INSERT INTO datos_comparativos (
  fila_id,
  label,
  periodo_anterior,
  periodo_actual,
  editable,
  orden,
  tabla_config_id
)
SELECT
  'fila-smoke-1',
  'Hechos',
  '100.00',
  '200.00',
  true,
  1,
  tabla.id
FROM tabla
ON CONFLICT (tabla_config_id, fila_id) DO UPDATE
SET label = EXCLUDED.label,
    periodo_anterior = EXCLUDED.periodo_anterior,
    periodo_actual = EXCLUDED.periodo_actual,
    editable = true,
    orden = EXCLUDED.orden,
    updated_at = NOW();
`;

const result = spawnSync(
  'docker',
  ['exec', '-i', containerName, 'psql', '-v', 'ON_ERROR_STOP=1', '-U', databaseUser, '-d', databaseName],
  {
    encoding: 'utf8',
    input: sql,
    shell: false,
  }
);

if (result.status !== 0) {
  console.error(result.stderr || 'No se pudo ejecutar el seed de recuperación E2E.');
  process.exit(result.status ?? 1);
}

console.log('Seed de recuperación E2E aplicado correctamente.');
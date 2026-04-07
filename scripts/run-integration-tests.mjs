import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { Client } from 'pg';

const baseConnectionString =
  process.env.INTEGRATION_DATABASE_URL ??
  'postgres://sigep_user:sigep_password_2024@127.0.0.1:5433/sigep_v2';

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

async function waitForDatabase() {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const client = new Client({ connectionString: baseConnectionString });

    try {
      await client.connect();
      await client.query('select 1');
      await client.end();
      return;
    } catch {
      try {
        await client.end();
      } catch {
        // Ignorar errores de cierre durante la espera inicial.
      }
      await delay(2_000);
    }
  }

  throw new Error('No se pudo establecer conexion con PostgreSQL para tests de integracion.');
}

run('docker', ['compose', 'up', '-d', 'postgres']);
await waitForDatabase();

const tsxCommand = process.platform === 'win32'
  ? '.\\node_modules\\.bin\\tsx.cmd'
  : './node_modules/.bin/tsx';

run(tsxCommand, [
  '--test',
  '--test-concurrency=1',
  'tests/integration/datos-actions.test.ts',
  'tests/integration/configuracion-actions.test.ts',
  'tests/integration/historial-actions.test.ts',
]);
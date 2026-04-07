import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const cwd = process.cwd();
const isOneDrive = cwd.toLowerCase().includes('onedrive');
const allowOneDrive = process.env.ALLOW_ONEDRIVE_E2E === '1';
const envFilePath = path.join(cwd, '.env');
const playwrightRoot = path.join(os.homedir(), 'AppData', 'Local', 'ms-playwright');
const containerName = 'sigep_v2_postgres';

const results = [];
let hasFailure = false;

function addResult(status, title, detail) {
  results.push({ status, title, detail });
  if (status === 'FAIL') {
    hasFailure = true;
  }
}

function hasPlaywrightChromium() {
  if (!fs.existsSync(playwrightRoot)) {
    return false;
  }

  return fs
    .readdirSync(playwrightRoot, { withFileTypes: true })
    .some(entry => entry.isDirectory() && entry.name.startsWith('chromium-'));
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
  });

  return {
    status: result.status ?? 1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    env[key] = rawValue.replace(/^['\"]|['\"]$/g, '');
  }

  return env;
}

function checkDatabaseSeed() {
  const userQuery = runCommand('docker', [
    'exec',
    containerName,
    'psql',
    '-U',
    'sigep_user',
    '-d',
    'sigep_v2',
    '-t',
    '-A',
    '-c',
    "select exists(select 1 from usuarios where username = 'superadmin' and activo = true);",
  ]);

  if (userQuery.status !== 0) {
    addResult('FAIL', 'Usuario E2E', userQuery.stderr.trim() || 'No se pudo consultar la base de datos.');
    return;
  }

  const deptQuery = runCommand('docker', [
    'exec',
    containerName,
    'psql',
    '-U',
    'sigep_user',
    '-d',
    'sigep_v2',
    '-t',
    '-A',
    '-c',
    "select exists(select 1 from departamentos where codigo = 'd1');",
  ]);

  if (userQuery.stdout.trim() === 't') {
    addResult('PASS', 'Usuario E2E', 'Existe superadmin activo para el smoke.');
  } else {
    addResult('FAIL', 'Usuario E2E', 'No existe superadmin activo en la base.');
  }

  if (deptQuery.status !== 0) {
    addResult('FAIL', 'Departamento E2E', deptQuery.stderr.trim() || 'No se pudo consultar el departamento d1.');
    return;
  }

  if (deptQuery.stdout.trim() === 't') {
    addResult('PASS', 'Departamento E2E', 'Existe el departamento d1 para el smoke.');
  } else {
    addResult('FAIL', 'Departamento E2E', 'No existe el departamento d1 en la base.');
  }
}

const envValues = {
  ...readEnvFile(envFilePath),
  ...process.env,
};

for (const key of ['DATABASE_URL', 'AUTH_SECRET', 'NEXTAUTH_URL']) {
  if (envValues[key]) {
    addResult('PASS', `Env ${key}`, 'Definida.');
  } else {
    addResult('FAIL', `Env ${key}`, 'No está definida en .env ni en el entorno actual.');
  }
}

if (isOneDrive && !allowOneDrive) {
  addResult(
    'FAIL',
    'Ubicación del repo',
    'El repo está dentro de OneDrive. Para E2E moverlo fuera de OneDrive o usar ALLOW_ONEDRIVE_E2E=1 bajo tu propio riesgo.'
  );
} else if (isOneDrive) {
  addResult(
    'WARN',
    'Ubicación del repo',
    'El repo sigue dentro de OneDrive. El doctor continúa porque ALLOW_ONEDRIVE_E2E=1 está definido.'
  );
} else {
  addResult('PASS', 'Ubicación del repo', 'El repo está fuera de OneDrive.');
}

if (hasPlaywrightChromium()) {
  addResult('PASS', 'Playwright Chromium', 'Chromium está instalado.');
} else {
  addResult('FAIL', 'Playwright Chromium', 'Falta Chromium. Ejecutar: npx playwright install chromium');
}

const dockerInfo = runCommand('docker', ['info']);
if (dockerInfo.status === 0) {
  addResult('PASS', 'Docker Engine', 'Docker responde correctamente.');
} else {
  addResult('FAIL', 'Docker Engine', dockerInfo.stderr.trim() || 'Docker no respondió.');
}

const dockerCompose = runCommand('docker', ['compose', 'ps', 'postgres']);
if (dockerCompose.status === 0) {
  addResult('PASS', 'Docker Compose', 'docker compose puede consultar el servicio postgres.');
  checkDatabaseSeed();
} else {
  addResult('WARN', 'Docker Compose', dockerCompose.stderr.trim() || 'No se pudo consultar el servicio postgres.');
}

console.log('\nE2E Doctor\n');
for (const result of results) {
  console.log(`[${result.status}] ${result.title}: ${result.detail}`);
}

if (hasFailure) {
  console.log('\nResultado: hay bloqueos para E2E. Revisar docs/e2e-recovery.md.');
  process.exit(1);
}

console.log('\nResultado: entorno apto para ejecutar el smoke E2E.');
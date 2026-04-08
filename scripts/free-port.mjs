import { spawnSync } from 'node:child_process';
import process from 'node:process';

function run(command, args) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

function parsePidsFromText(text) {
  if (!text) return [];
  return [...new Set(text
    .trim()
    .split(/[\s,]+/)
    .map(value => Number.parseInt(value, 10))
    .filter(value => Number.isInteger(value) && value > 0))];
}

function getListeningPidsWindows(port) {
  const psCommand = [
    `$conns = Get-NetTCPConnection -LocalPort ${port} -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique`,
    'if ($conns) { $conns -join "," }',
  ].join('; ');

  const result = run('powershell', ['-NoProfile', '-Command', psCommand]);
  if (result.status === 0) {
    return parsePidsFromText(result.stdout);
  }

  return [];
}

function getListeningPidsUnix(port) {
  const lsof = run('lsof', ['-ti', `tcp:${port}`, '-sTCP:LISTEN']);
  if (lsof.status === 0) {
    return parsePidsFromText(lsof.stdout);
  }

  const ss = run('ss', ['-ltnp']);
  if (ss.status !== 0) return [];

  const pids = [];
  const lines = ss.stdout.split(/\r?\n/);
  for (const line of lines) {
    if (!line.includes(`:${port}`)) continue;

    const matches = line.match(/pid=(\d+)/g) ?? [];
    for (const match of matches) {
      const pid = Number.parseInt(match.replace('pid=', ''), 10);
      if (Number.isInteger(pid) && pid > 0) pids.push(pid);
    }
  }

  return [...new Set(pids)];
}

function killPid(pid) {
  if (process.platform === 'win32') {
    const result = run('taskkill', ['/PID', String(pid), '/F']);
    return result.status === 0;
  }

  const result = run('kill', ['-9', String(pid)]);
  return result.status === 0;
}

const portArg = process.argv[2] ?? '3000';
const port = Number.parseInt(portArg, 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`[free-port] Puerto inválido: ${portArg}`);
  process.exit(1);
}

const pids = process.platform === 'win32'
  ? getListeningPidsWindows(port)
  : getListeningPidsUnix(port);

if (pids.length === 0) {
  console.log(`[free-port] Puerto ${port} libre.`);
  process.exit(0);
}

const currentPid = process.pid;
const targetPids = pids.filter(pid => pid !== currentPid);

if (targetPids.length === 0) {
  console.log(`[free-port] Puerto ${port} libre.`);
  process.exit(0);
}

let failed = false;
for (const pid of targetPids) {
  const ok = killPid(pid);
  if (ok) {
    console.log(`[free-port] Proceso ${pid} finalizado para liberar ${port}.`);
  } else {
    failed = true;
    console.error(`[free-port] No se pudo finalizar el proceso ${pid}.`);
  }
}

if (failed) {
  process.exit(1);
}

process.exit(0);

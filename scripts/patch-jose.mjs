#!/usr/bin/env node
/**
 * patch-jose.mjs
 *
 * Repara automáticamente archivos faltantes en jose/dist/webapi/lib/
 * que OneDrive corrompe o no sincroniza correctamente.
 *
 * Se ejecuta automáticamente como script `postinstall` de npm.
 * También puede ejecutarse manualmente: node ./scripts/patch-jose.mjs
 */

import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const JOSE_LIB = join(ROOT, 'node_modules', 'jose', 'dist', 'webapi', 'lib');

// Archivos que deben existir y su contenido esperado si están ausentes
const REQUIRED_FILES = {
  'encrypt.js': `// Auto-generado por scripts/patch-jose.mjs (postinstall)
// Reexporta 'encrypt' desde content_encryption.js
// Este archivo fue separado en versiones recientes de jose pero falta
// en instalaciones OneDrive por corrupción de sincronización.
export { encrypt } from './content_encryption.js';
`,
  'decrypt.js': `// Auto-generado por scripts/patch-jose.mjs (postinstall)
// Reexporta 'decrypt' desde content_encryption.js
// Este archivo fue separado en versiones recientes de jose pero falta
// en instalaciones OneDrive por corrupción de sincronización.
export { decrypt } from './content_encryption.js';
`,
};

// Archivos cuyo contenido debe ser validado (no vacíos / corruptos)
const VALIDATE_FILES = [
  'content_encryption.js',
  'aesgcmkw.js',
  'key_management.js',
  'signing.js',
];

let fixed = 0;
let warnings = 0;

// 1. Verificar que jose está instalado
if (!existsSync(JOSE_LIB)) {
  console.log('[patch-jose] jose no está instalado todavía — omitiendo patch.');
  process.exit(0);
}

// 2. Crear archivos faltantes
for (const [filename, content] of Object.entries(REQUIRED_FILES)) {
  const filePath = join(JOSE_LIB, filename);
  if (!existsSync(filePath)) {
    writeFileSync(filePath, content, 'utf8');
    console.log(`[patch-jose] ✓ Creado archivo faltante: ${filename}`);
    fixed++;
  } else {
    // Verificar que el archivo no está vacío o corrupto
    const existing = readFileSync(filePath, 'utf8').trim();
    if (existing.length < 10) {
      writeFileSync(filePath, content, 'utf8');
      console.log(`[patch-jose] ✓ Reemplazado archivo corrupto: ${filename}`);
      fixed++;
    }
  }
}

// 3. Validar archivos críticos (no vacíos)
for (const filename of VALIDATE_FILES) {
  const filePath = join(JOSE_LIB, filename);
  if (!existsSync(filePath)) {
    console.warn(`[patch-jose] ⚠ Archivo crítico ausente: ${filename} — puede ser necesario reinstalar jose`);
    warnings++;
    continue;
  }
  const content = readFileSync(filePath, 'utf8').trim();
  if (content.length < 20) {
    console.warn(`[patch-jose] ⚠ Archivo posiblemente corrupto (muy pequeño): ${filename}`);
    warnings++;
  }
}

// 4. Limpiar artefactos de OneDrive (archivos con sufijos aleatorios)
import { readdirSync, unlinkSync } from 'node:fs';
try {
  const files = readdirSync(JOSE_LIB);
  for (const file of files) {
    // OneDrive crea archivos como "aesgcmkw-PCBASCARY.js" (GUID aleatorio)
    if (/^[a-z_]+-[A-Z0-9]{6,}\.js$/.test(file)) {
      unlinkSync(join(JOSE_LIB, file));
      console.log(`[patch-jose] 🗑 Eliminado artefacto OneDrive: ${file}`);
      fixed++;
    }
  }
} catch {
  // No crítico
}

// Resumen
if (fixed === 0 && warnings === 0) {
  console.log('[patch-jose] ✓ jose OK — no se necesitaron correcciones.');
} else {
  if (fixed > 0) console.log(`[patch-jose] ✓ ${fixed} archivo(s) reparado(s).`);
  if (warnings > 0) console.log(`[patch-jose] ⚠ ${warnings} advertencia(s). Ejecuta 'npm install jose --force' si hay errores.`);
}

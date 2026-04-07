# Recuperación Local para E2E

## Objetivo

Dejar el entorno listo para ejecutar el smoke E2E de login, edición e historial con Playwright.

## Requisitos mínimos

1. Docker Desktop funcionando.
2. PostgreSQL del proyecto levantado por docker compose.
3. Chromium instalado para Playwright.
4. Base con datos semilla y usuario superadmin activo.
5. Repo fuera de OneDrive o, si no es posible, carpeta marcada como siempre disponible localmente.

## Ruta recomendada

1. Mover el repo fuera de OneDrive.
2. Borrar node_modules y .next.
3. Reinstalar dependencias con npm install.
4. Instalar Chromium con npx playwright install chromium.
5. Levantar PostgreSQL con docker compose up -d postgres.
6. Ejecutar el seed si la base está vacía: primero intentar npx tsx src/db/seed.ts.
7. Si el seed TypeScript falla por lecturas UNKNOWN read en OneDrive, usar npm run e2e:seed:recovery.
8. Verificar el entorno con npm run e2e:doctor.
9. Levantar la app con npm run dev:e2e.
10. Ejecutar el smoke con variables de entorno:

```powershell
$env:E2E_ADMIN_USERNAME='superadmin'
$env:E2E_ADMIN_PASSWORD='SIGEP_Admin#2024!'
$env:E2E_DEPARTAMENTO_PATH='/d1'
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:3000'
npm run test:e2e:smoke
```

## Si el repo debe seguir en OneDrive

1. Marcar la carpeta del proyecto y node_modules como siempre disponible localmente.
2. Cerrar servidores y procesos Node abiertos.
3. Borrar node_modules y .next.
4. Ejecutar npm install.
5. Reinstalar dependencias dañadas si aparecen errores UNKNOWN read en el server:

```powershell
Remove-Item -Recurse -Force .\node_modules\next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\node_modules\jose -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .\node_modules\@swc\helpers -ErrorAction SilentlyContinue
npm install next@16.1.6 jose @swc/helpers --no-save
```

6. Si además falta la semilla E2E, correr npm run e2e:seed:recovery.
7. Volver a correr npm run e2e:doctor.

## Síntomas conocidos

1. UNKNOWN read al compilar /login: suele venir de dependencias cacheadas en OneDrive, no del test.
2. browserType.launch executable doesn't exist: falta ejecutar npx playwright install chromium.
3. Docker engine no responde: abrir Docker Desktop y esperar a que docker info responda.

## Datos E2E validados

1. Usuario: superadmin
2. Contraseña: SIGEP_Admin#2024!
3. Ruta de departamento: /d1

## Scripts útiles

1. npm run e2e:doctor
2. npm run e2e:prepare
3. npm run e2e:seed:recovery
4. npm run dev:e2e
5. npm run test:e2e:smoke
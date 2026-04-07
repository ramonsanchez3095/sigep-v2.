# ============================================================
#  SIGEP v2 - Script de arranque
#  Uso: .\start.ps1            (arranca todo)
#       .\start.ps1 -SkipSeed  (omite el seed de la BD)
#       .\start.ps1 -Prod      (arranca en modo produccion)
# ============================================================
param(
    [switch]$SkipSeed,
    [switch]$Prod
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok($msg)   { Write-Host "   [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "   [!] $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "   [X] $msg" -ForegroundColor Red; exit 1 }

# ─── 1. Verificar prerequisitos ─────────────────────────────
Write-Step "Verificando prerequisitos..."

# Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Fail "Node.js no esta instalado. Descargalo en https://nodejs.org"
}
$nodeVersion = (node -v)
Write-Ok "Node.js $nodeVersion"

# npm
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Fail "npm no esta instalado."
}
Write-Ok "npm $(npm -v)"

# Docker
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Fail "Docker no esta instalado. Descargalo en https://www.docker.com"
}
Write-Ok "Docker $(docker --version)"

# ─── 2. Crear archivo .env si no existe ─────────────────────
Write-Step "Verificando archivo .env..."

if (-not (Test-Path ".env")) {
    Write-Warn "No se encontro .env, creando uno con valores por defecto..."

    # Generar AUTH_SECRET aleatorio
    $bytes = New-Object byte[] 32
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $authSecret = [Convert]::ToBase64String($bytes)

    $envContent = @"
# === Base de datos (PostgreSQL via Docker Compose) ===
DATABASE_URL=postgresql://sigep_user:sigep_password_2024@localhost:5433/sigep_v2

# === NextAuth / Auth.js ===
AUTH_SECRET=$authSecret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
"@
    Set-Content -Path ".env" -Value $envContent -Encoding UTF8
    Write-Ok "Archivo .env creado. Revisa los valores si necesitas ajustar algo."
} else {
    Write-Ok "Archivo .env encontrado."
}

# ─── 3. Instalar dependencias ───────────────────────────────
Write-Step "Instalando dependencias de npm..."
npm install
if ($LASTEXITCODE -ne 0) { Write-Fail "Error al instalar dependencias." }
Write-Ok "Dependencias instaladas."

# ─── 4. Levantar PostgreSQL con Docker Compose ──────────────
Write-Step "Levantando PostgreSQL con Docker Compose..."
docker compose up -d
if ($LASTEXITCODE -ne 0) { Write-Fail "Error al levantar Docker Compose." }

# Esperar a que PostgreSQL este listo
Write-Host "   Esperando a que PostgreSQL este listo..." -NoNewline
$maxRetries = 30
$retries = 0
do {
    Start-Sleep -Seconds 1
    $retries++
    Write-Host "." -NoNewline
    $health = docker inspect --format='{{.State.Health.Status}}' sigep_v2_postgres 2>$null
} while ($health -ne "healthy" -and $retries -lt $maxRetries)

Write-Host ""
if ($health -eq "healthy") {
    Write-Ok "PostgreSQL listo (puerto 5433)."
} else {
    Write-Fail "PostgreSQL no respondio despues de $maxRetries segundos."
}

# ─── 5. Ejecutar migraciones de Drizzle ─────────────────────
Write-Step "Ejecutando migraciones de base de datos..."
npx drizzle-kit push
if ($LASTEXITCODE -ne 0) { Write-Fail "Error al ejecutar migraciones." }
Write-Ok "Migraciones aplicadas."

# ─── 6. Seed de la base de datos ────────────────────────────
if (-not $SkipSeed) {
    Write-Step "Ejecutando seed de datos iniciales..."
    npx tsx src/db/seed.ts
    if ($LASTEXITCODE -ne 0) {
        Write-Warn "El seed fallo (puede que los datos ya existan). Continuando..."
    } else {
        Write-Ok "Seed completado."
    }
} else {
    Write-Step "Seed omitido (flag -SkipSeed)."
}

# ─── 7. Arrancar la aplicacion ──────────────────────────────
if ($Prod) {
    Write-Step "Compilando aplicacion para produccion..."
    npm run build
    if ($LASTEXITCODE -ne 0) { Write-Fail "Error en el build." }
    Write-Ok "Build completado."

    Write-Step "Arrancando SIGEP v2 en modo PRODUCCION..."
    Write-Host ""
    Write-Host "  ==========================================" -ForegroundColor Green
    Write-Host "   SIGEP v2 corriendo en http://localhost:3000" -ForegroundColor Green
    Write-Host "   Usuario: superadmin" -ForegroundColor Green
    Write-Host "   Contrasena: SIGEP_Admin#2024!" -ForegroundColor Green
    Write-Host "  ==========================================" -ForegroundColor Green
    Write-Host ""
    npm run start
} else {
    Write-Step "Arrancando SIGEP v2 en modo DESARROLLO..."
    Write-Host ""
    Write-Host "  ==========================================" -ForegroundColor Green
    Write-Host "   SIGEP v2 corriendo en http://localhost:3000" -ForegroundColor Green
    Write-Host "   Usuario: superadmin" -ForegroundColor Green
    Write-Host "   Contrasena: SIGEP_Admin#2024!" -ForegroundColor Green
    Write-Host "  ==========================================" -ForegroundColor Green
    Write-Host ""
    npm run dev
}

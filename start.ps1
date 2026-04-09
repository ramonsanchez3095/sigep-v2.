# ============================================================
# SIGEP v2 - Script de arranque
# Uso: .\start.ps1               (arranca todo)
#      .\start.ps1 -SkipSeed     (omite seed)
#      .\start.ps1 -SkipInstall  (omite npm install)
#      .\start.ps1 -ForceInstall (fuerza npm install)
#      .\start.ps1 -Prod         (arranca en produccion)
#      .\start.ps1 -NoStart      (solo prepara entorno)
# ============================================================
param(
    [switch]$SkipSeed,
    [switch]$SkipInstall,
    [switch]$ForceInstall,
    [switch]$Prod,
    [switch]$NoStart
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

function Write-Step($msg) { Write-Host "`n>> $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "   [OK] $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "   [!] $msg" -ForegroundColor Yellow }
function Write-Fail($msg) { Write-Host "   [X] $msg" -ForegroundColor Red; exit 1 }

$script:UseComposeV2 = $false
$script:IsOneDrivePath = $PSScriptRoot.ToLower().Contains("onedrive")
$script:DevScript = "dev"

if ($script:IsOneDrivePath -and -not $Prod) {
    $script:DevScript = "dev:e2e"
}

function Invoke-Compose {
    param([string[]]$ComposeArgs)
    if ($script:UseComposeV2) {
        & docker compose @ComposeArgs
    }
    else {
        & docker-compose @ComposeArgs
    }
}

function New-AuthSecret {
    $bytes = New-Object byte[] 32
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::Create()
    try {
        $rng.GetBytes($bytes)
    }
    finally {
        if ($null -ne $rng) {
            $rng.Dispose()
        }
    }
    return [Convert]::ToBase64String($bytes)
}

function Test-PortInUse {
    param([int]$Port)

    try {
        if (Get-Command Get-NetTCPConnection -ErrorAction SilentlyContinue) {
            $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
            return ($null -ne $conn)
        }

        $netstatResult = netstat -ano | Select-String -Pattern (":" + $Port + "\s")
        return ($null -ne $netstatResult)
    }
    catch {
        return $false
    }
}

function Get-PortOwnerInfo {
    param([int]$Port)

    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($null -eq $conn) {
            return $null
        }

        $owningProcess = $conn.OwningProcess
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $owningProcess" -ErrorAction SilentlyContinue
        if ($null -eq $proc) {
            return [pscustomobject]@{
                Port = $Port
                ProcessId = $owningProcess
                Name = "UNKNOWN"
                CommandLine = ""
            }
        }

        return [pscustomobject]@{
            Port = $Port
            ProcessId = $owningProcess
            Name = $proc.Name
            CommandLine = $proc.CommandLine
        }
    }
    catch {
        return $null
    }
}

function Test-SigepNextProcess {
    param($ProcessInfo)

    if ($null -eq $ProcessInfo) {
        return $false
    }

    if ($ProcessInfo.Name -ne "node.exe") {
        return $false
    }

    if ([string]::IsNullOrWhiteSpace($ProcessInfo.CommandLine)) {
        return $false
    }

    $commandLine = $ProcessInfo.CommandLine.ToLower()
    $workspacePath = $PSScriptRoot.ToLower()

    return $commandLine.Contains($workspacePath) -and $commandLine.Contains("next")
}

# 1) Verificar prerequisitos
Write-Step "Verificando prerequisitos..."

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Fail "Node.js no esta instalado. Descargalo en https://nodejs.org"
}
Write-Ok "Node.js $(node -v)"

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Fail "npm no esta instalado."
}
Write-Ok "npm $(npm -v)"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Fail "Docker no esta instalado. Descargalo en https://www.docker.com"
}
Write-Ok "Docker $(docker --version)"

& docker info *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Docker Engine no responde. Abri Docker Desktop y espera a que termine de iniciar."
}
Write-Ok "Docker Engine disponible."

& docker compose version *> $null
if ($LASTEXITCODE -eq 0) {
    $script:UseComposeV2 = $true
    Write-Ok "Compose detectado: docker compose"
}
elseif (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    $script:UseComposeV2 = $false
    Write-Ok "Compose detectado: docker-compose"
}
else {
    Write-Fail "No se encontro Docker Compose (docker compose ni docker-compose)."
}

if ($script:IsOneDrivePath) {
    Write-Warn "Repositorio dentro de OneDrive detectado. Se habilita modo compatible (seed de recuperacion y webpack en desarrollo)."
}

# 2) Crear archivo .env si no existe
Write-Step "Verificando archivo .env..."

if (-not (Test-Path ".env")) {
    Write-Warn "No se encontro .env, creando uno con valores por defecto..."

    $authSecret = New-AuthSecret
    $envContent = @"
# === Base de datos (PostgreSQL via Docker Compose) ===
DATABASE_URL=postgresql://sigep_user:sigep_password_2024@localhost:5433/sigep_v2

# === NextAuth / Auth.js ===
AUTH_SECRET=$authSecret
NEXTAUTH_URL=http://localhost:3000
AUTH_TRUST_HOST=true
"@

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText((Join-Path $PSScriptRoot ".env"), $envContent.TrimStart("`r", "`n"), $utf8NoBom)
    Write-Ok "Archivo .env creado."
}
else {
    Write-Ok "Archivo .env encontrado."
}

# 3) Instalar dependencias
if (-not $SkipInstall) {
    if ((Test-Path "node_modules") -and (-not $ForceInstall)) {
        Write-Step "Instalacion omitida: node_modules ya existe (usa -ForceInstall para reinstalar)."
    }
    else {
        Write-Step "Instalando dependencias de npm..."
        npm install --no-audit --no-fund --loglevel=error
        if ($LASTEXITCODE -ne 0) {
            Write-Fail "Error al instalar dependencias."
        }
        Write-Ok "Dependencias instaladas."
    }
}
else {
    Write-Step "Instalacion omitida (flag -SkipInstall)."
}

# 3b) Reparar archivos de jose corruptos/faltantes (problema OneDrive)
Write-Step "Verificando integridad de modulos (patch-jose)..."
node ./scripts/patch-jose.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Warn "patch-jose.mjs fallo, continuando de todas formas..."
} else {
    Write-Ok "Modulos verificados."
}

# 4) Levantar PostgreSQL
Write-Step "Levantando PostgreSQL con Docker Compose..."
Invoke-Compose -ComposeArgs @("up", "-d", "postgres")
if ($LASTEXITCODE -ne 0) {
    Write-Fail "Error al levantar PostgreSQL con Compose."
}

Write-Host "   Esperando a que PostgreSQL este listo..." -NoNewline
$maxRetries = 60
$retries = 0
$health = ""

do {
    Start-Sleep -Seconds 1
    $retries++
    Write-Host "." -NoNewline
    $healthRaw = & docker inspect "--format={{.State.Health.Status}}" sigep_v2_postgres 2>$null
    if ($healthRaw) {
        $health = ($healthRaw | Select-Object -First 1).ToString().Trim()
    }
}
while ($health -ne "healthy" -and $retries -lt $maxRetries)

Write-Host ""
if ($health -eq "healthy") {
    Write-Ok "PostgreSQL listo (puerto 5433)."
}
else {
    Write-Fail "PostgreSQL no respondio despues de $maxRetries segundos."
}

# 5) Migraciones
Write-Step "Aplicando migraciones de base de datos..."
npx drizzle-kit migrate
if ($LASTEXITCODE -ne 0) {
    Write-Warn "drizzle-kit migrate fallo. Intentando drizzle-kit push --force..."
    npx drizzle-kit push --force
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Error al ejecutar migraciones."
    }
}
Write-Ok "Migraciones aplicadas."

# 6) Seed
if (-not $SkipSeed) {
    if ($script:IsOneDrivePath) {
        Write-Step "Ejecutando seed de recuperacion (modo OneDrive)..."
        npm run e2e:seed:recovery
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "No se pudo aplicar seed de recuperacion. La app puede arrancar sin datos semilla."
        }
        else {
            Write-Ok "Seed de recuperacion aplicado."
        }
    }
    else {
        Write-Step "Ejecutando seed de datos iniciales..."
        npx tsx src/db/seed.ts
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "Seed TypeScript fallo. Intentando seed de recuperacion..."
            npm run e2e:seed:recovery
            if ($LASTEXITCODE -ne 0) {
                Write-Warn "No se pudo aplicar seed automatico. La app puede arrancar sin datos semilla."
            }
            else {
                Write-Ok "Seed de recuperacion aplicado."
            }
        }
        else {
            Write-Ok "Seed completado."
        }
    }
}
else {
    Write-Step "Seed omitido (flag -SkipSeed)."
}

if ($NoStart) {
    Write-Step "Preparacion completada. No se arranca la app por flag -NoStart."
    exit 0
}

# 7) Arrancar aplicacion
if ($Prod) {
    Write-Step "Compilando aplicacion para produccion..."
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Error en el build."
    }
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
}
else {
    if ($script:IsOneDrivePath) {
        $env:NEXT_DISABLE_TURBOPACK = "1"
        Write-Step "Arrancando SIGEP v2 en modo DESARROLLO (webpack por OneDrive)..."
    }
    else {
        Write-Step "Arrancando SIGEP v2 en modo DESARROLLO..."
    }
    Write-Host ""
    Write-Host "  ==========================================" -ForegroundColor Green
    Write-Host "   SIGEP v2 corriendo en http://localhost:3000" -ForegroundColor Green
    Write-Host "   Usuario: superadmin" -ForegroundColor Green
    Write-Host "   Contrasena: SIGEP_Admin#2024!" -ForegroundColor Green
    Write-Host "  ==========================================" -ForegroundColor Green
    Write-Host ""

    $portOwner = Get-PortOwnerInfo -Port 3000
    if ($null -ne $portOwner) {
        if (Test-SigepNextProcess -ProcessInfo $portOwner) {
            Write-Warn "Se detecto una instancia previa de SIGEP en el puerto 3000. Reiniciando proceso..."
            Stop-Process -Id $portOwner.ProcessId -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
        else {
            Write-Fail "El puerto 3000 ya esta en uso por $($portOwner.Name) (PID $($portOwner.ProcessId)). Liberalo y volve a ejecutar start.cmd."
        }
    }

    $nextLockPath = Join-Path $PSScriptRoot ".next\dev\lock"
    if (Test-Path $nextLockPath) {
        Write-Warn "Se detecto lock previo de Next.js. Eliminando lock huerfano..."
        Remove-Item $nextLockPath -Force -ErrorAction SilentlyContinue
    }

    npm run $script:DevScript
}

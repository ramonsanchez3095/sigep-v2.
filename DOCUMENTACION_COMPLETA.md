# 📋 SIGEP v2 — Documentación Técnica Completa

> **Sistema de Gestión Estadística Policial** — Policía de Tucumán
>
> Última actualización: Julio 2026

---

## 📑 Índice

1. [Descripción General](#1-descripción-general)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Requisitos Previos](#3-requisitos-previos)
4. [Instalación y Arranque Rápido](#4-instalación-y-arranque-rápido)
5. [Variables de Entorno y Credenciales](#5-variables-de-entorno-y-credenciales)
6. [Base de Datos](#6-base-de-datos)
7. [Arquitectura del Proyecto](#7-arquitectura-del-proyecto)
8. [Sistema de Autenticación](#8-sistema-de-autenticación)
9. [Usuarios Predefinidos (Seed)](#9-usuarios-predefinidos-seed)
10. [Departamentos del Sistema](#10-departamentos-del-sistema)
11. [Rutas y Páginas](#11-rutas-y-páginas)
12. [Server Actions](#12-server-actions)
13. [Componentes Principales](#13-componentes-principales)
14. [Sistema de Estadísticas](#14-sistema-de-estadísticas)
15. [Exportación de Datos](#15-exportación-de-datos)
16. [Autenticación de Dos Factores (2FA)](#16-autenticación-de-dos-factores-2fa)
17. [Cron Jobs](#17-cron-jobs)
18. [Testing](#18-testing)
19. [Deploy en Vercel](#19-deploy-en-vercel)
20. [Scripts Útiles](#20-scripts-útiles)
21. [Solución de Problemas](#21-solución-de-problemas)
22. [Guía para Modificar el Sistema](#22-guía-para-modificar-el-sistema)

---

## 1. Descripción General

**SIGEP v2** es un sistema web interno para la gestión y comparación de estadísticas policiales de la Policía de Tucumán. Permite:

- **Cargar datos estadísticos** por departamento (período anterior vs. período actual).
- **Comparar períodos** con cálculos automáticos de diferencias y porcentajes.
- **Visualizar estadísticas** con gráficos interactivos (Recharts).
- **Exportar datos** a PDF y Excel (XLSX).
- **Gestionar usuarios** con roles (ADMIN, EDITOR, VIEWER) y permisos por departamento.
- **Auditoría completa** con historial de cambios.
- **Snapshots mensuales** para preservar estados históricos de datos.
- **Autenticación 2FA** con TOTP (Google Authenticator, etc.).
- **Cron automático** para rollup diario de estadísticas.

---

## 2. Stack Tecnológico

| Categoría           | Tecnología                                    |
|---------------------|-----------------------------------------------|
| **Framework**       | Next.js 16.1.6 (App Router)                   |
| **Lenguaje**        | TypeScript 5.x                                |
| **React**           | React 19.2.3                                  |
| **Base de Datos**   | PostgreSQL 16 (Docker)                         |
| **ORM**             | Drizzle ORM 0.45.x + Drizzle Kit 0.31.x       |
| **Autenticación**   | NextAuth.js v5 (Auth.js) con Credentials       |
| **Estilos**         | TailwindCSS 4.x + PostCSS                     |
| **State Management**| Zustand 5.x                                   |
| **Formularios**     | React Hook Form 7.x + Zod 4.x                 |
| **Gráficos**        | Recharts 3.x                                  |
| **PDF**             | jsPDF + jspdf-autotable                        |
| **Excel**           | SheetJS (xlsx)                                 |
| **2FA/TOTP**        | otpauth + qrcode                               |
| **Hashing**         | bcryptjs                                       |
| **Iconos**          | Lucide React                                   |
| **Testing**         | Playwright (E2E) + tsx (Unit) + pg-mem (Integ.) |
| **Contenedor**      | Docker Compose (PostgreSQL)                    |
| **Deploy**          | Vercel                                         |

---

## 3. Requisitos Previos

Antes de ejecutar el proyecto, asegurate de tener instalado:

| Software       | Versión Mínima | Descarga                                  |
|----------------|----------------|-------------------------------------------|
| **Node.js**    | 18.x o superior | https://nodejs.org                        |
| **npm**        | 9.x o superior  | Incluido con Node.js                      |
| **Docker Desktop** | 4.x        | https://www.docker.com/products/docker-desktop |
| **Git**        | 2.x             | https://git-scm.com                       |

> ⚠️ **Docker Desktop** debe estar iniciado y corriendo antes de ejecutar el proyecto. Si el puerto 5433 ya tiene PostgreSQL escuchando, Docker no es necesario.

---

## 4. Instalación y Arranque Rápido

### Opción A: Script Automático (Recomendado) ⚡

El script `start.ps1` automatiza todo el proceso: verifica prerequisitos, levanta Docker, crea `.env`, instala dependencias, ejecuta migraciones, seed y arranca la app.

```powershell
# Desde la raíz del proyecto:
.\start.cmd

# O directamente con PowerShell:
.\start.ps1
```

**Flags disponibles del script:**

| Flag             | Descripción                                        |
|------------------|----------------------------------------------------|
| `-SkipSeed`      | Omite la carga de datos iniciales                  |
| `-SkipInstall`   | Omite `npm install`                                |
| `-ForceInstall`  | Fuerza reinstalación de `node_modules`             |
| `-Prod`          | Compila y arranca en modo producción               |
| `-NoStart`       | Solo prepara el entorno (no arranca la app)        |

```powershell
# Ejemplo: solo preparar sin arrancar
.\start.ps1 -NoStart

# Ejemplo: arrancar sin re-hacer seed
.\start.ps1 -SkipSeed
```

### Opción B: Manual Paso a Paso

```powershell
# 1. Clonar el repositorio
git clone <URL_DEL_REPO>
cd sigep-v2

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env (copiar de ejemplo)
copy .env.example .env
# → Editar .env con los valores correctos (ver sección 5)

# 4. Levantar PostgreSQL con Docker
docker compose up -d postgres

# 5. Esperar a que PostgreSQL esté listo
docker inspect --format="{{.State.Health.Status}}" sigep_v2_postgres
# → Debe decir "healthy"

# 6. Ejecutar migraciones
npx drizzle-kit migrate

# 7. Cargar datos iniciales (seed)
npm run db:seed

# 8. Arrancar en modo desarrollo
npm run dev
```

### Resultado

La aplicación estará disponible en: **http://localhost:3000**

---

## 5. Variables de Entorno y Credenciales

### Archivo `.env` (desarrollo local)

```env
# ╔══════════════════════════════════════════════╗
# ║    BASE DE DATOS (PostgreSQL via Docker)     ║
# ╚══════════════════════════════════════════════╝
DATABASE_URL="postgresql://sigep_user:sigep_password_2024@localhost:5433/sigep_v2"

# ╔══════════════════════════════════════════════╗
# ║         AUTH.JS / NEXTAUTH                   ║
# ╚══════════════════════════════════════════════╝
AUTH_SECRET="k8X2pLm9Qr5tVw3yAzBnCdEfGhJkMnPqRsTuWxYz01="
NEXTAUTH_URL="http://localhost:3000"

# ╔══════════════════════════════════════════════╗
# ║         CRON JOB SECRET                     ║
# ╚══════════════════════════════════════════════╝
CRON_SECRET="dfUIPpiZZfCWE5tuf+wGZDJStv1ZrZa+0yTkb9w74lLaDHEezIqiCPGb+nRMFuIA"

# ╔══════════════════════════════════════════════╗
# ║         ENTORNO                              ║
# ╚══════════════════════════════════════════════╝
NODE_ENV="development"

# ╔══════════════════════════════════════════════╗
# ║         SEGURIDAD 2FA (TOTP)                ║
# ╚══════════════════════════════════════════════╝
TOTP_ENCRYPTION_KEY="0ca75d67f92b7d10e9f93b846a8edee1b0645327016dda5c6534e321dfb8756f"
```

### Descripción de cada variable

| Variable              | Descripción                                                                                          |
|-----------------------|------------------------------------------------------------------------------------------------------|
| `DATABASE_URL`        | Connection string de PostgreSQL. Puerto `5433` (mapeado desde Docker). Usuario: `sigep_user`, Password: `sigep_password_2024`, BD: `sigep_v2` |
| `AUTH_SECRET`         | Secreto para firmar los JWT de NextAuth. Debe ser un string aleatorio largo en Base64.                |
| `NEXTAUTH_URL`        | URL base de la aplicación. En desarrollo: `http://localhost:3000`. En producción: la URL de Vercel.   |
| `CRON_SECRET`         | Token Bearer para proteger el endpoint del cron job (`/api/cron/estadisticas`).                      |
| `NODE_ENV`            | `development` en local, `production` en deploy.                                                       |
| `TOTP_ENCRYPTION_KEY` | Clave hexadecimal de 64 caracteres (32 bytes) para cifrar los secretos TOTP con AES-256-GCM.         |

### Credenciales de la Base de Datos (Docker)

| Campo           | Valor                      |
|-----------------|----------------------------|
| **Host**        | `localhost`                |
| **Puerto**      | `5433` (mapeado desde 5432)|
| **Usuario**     | `sigep_user`               |
| **Contraseña**  | `sigep_password_2024`      |
| **Base de Datos**| `sigep_v2`                |
| **Contenedor**  | `sigep_v2_postgres`        |

> 💡 El puerto es **5433** (no 5432) para evitar conflictos con otras instancias de PostgreSQL locales.

### Generar nuevos secretos (producción)

```powershell
# Generar AUTH_SECRET (Base64, 32 bytes)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Generar TOTP_ENCRYPTION_KEY (hex, 32 bytes)
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Minimum 0 -Maximum 256) })

# Generar CRON_SECRET (Base64, 48 bytes)
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

---

## 6. Base de Datos

### Docker Compose

El archivo `docker-compose.yml` define un servicio PostgreSQL 16 Alpine:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: sigep_v2_postgres
    restart: unless-stopped
    ports:
      - '5433:5432'      # Puerto host:contenedor
    environment:
      POSTGRES_USER: sigep_user
      POSTGRES_PASSWORD: sigep_password_2024
      POSTGRES_DB: sigep_v2
    volumes:
      - sigep_v2_pgdata:/var/lib/postgresql/data   # Datos persistentes
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U sigep_user -d sigep_v2']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  sigep_v2_pgdata:   # Volumen nombrado → datos persisten entre reinicios
```

### Comandos de Docker

```powershell
# Levantar PostgreSQL
docker compose up -d postgres

# Ver estado
docker compose ps

# Ver logs
docker compose logs postgres

# Detener
docker compose down

# Detener Y borrar datos (¡CUIDADO!)
docker compose down -v
```

### Schema de la Base de Datos (Drizzle ORM)

El schema completo está en `src/db/schema.ts`. Las tablas principales son:

```
┌─────────────────────────────────────────────────────────────────┐
│                        TABLAS PRINCIPALES                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  usuarios              → Usuarios del sistema                   │
│  permisos              → Permisos por usuario (tipo + usuario)  │
│  refresh_tokens        → Tokens de refresco JWT                 │
│  departamentos         → Departamentos policiales               │
│  tablas_config         → Configuración de tablas por depto.     │
│  datos_comparativos    → Datos período anterior vs actual       │
│  historial_cambios     → Auditoría de modificaciones            │
│  snapshots             → Snapshots mensuales de datos           │
│  config_periodos       → Configuración de períodos              │
│  config_global         → Configuración global (edición on/off)  │
│  estadisticas_diarias  → Rollup diario pre-agregado             │
│  estadisticas_mensuales→ Rollup mensual pre-agregado            │
│  estadisticas_anuales  → Rollup anual pre-agregado              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Diagrama de Relaciones

```
usuarios ──┬── permisos
            ├── refresh_tokens
            ├── historial_cambios
            └── snapshots

departamentos ──┬── usuarios (departamentoId)
                ├── tablas_config
                ├── estadisticas_diarias
                ├── estadisticas_mensuales
                └── estadisticas_anuales

tablas_config ──┬── datos_comparativos
                ├── historial_cambios
                ├── estadisticas_diarias
                ├── estadisticas_mensuales
                └── estadisticas_anuales
```

### Enums de la BD

| Enum    | Valores                                   |
|---------|-------------------------------------------|
| `rol`   | `ADMIN`, `EDITOR`, `VIEWER`               |
| `campo` | `PERIODO_ANTERIOR`, `PERIODO_ACTUAL`      |

### Migraciones

Las migraciones están en el directorio `drizzle/`:

```
drizzle/
├── 0000_secret_jackpot.sql    → Migración inicial (todas las tablas)
├── 0001_add_totp_fields.sql   → Campos TOTP para 2FA
├── 0002_new_famine.sql        → Tablas de estadísticas pre-agregadas
└── meta/                      → Metadata de Drizzle Kit
```

```powershell
# Aplicar migraciones pendientes
npx drizzle-kit migrate

# Generar nueva migración (después de modificar schema.ts)
npx drizzle-kit generate

# Push directo (sin migración, útil en dev)
npx drizzle-kit push --force

# Ver estado del schema vs DB
npx drizzle-kit check
```

### Conexión a la BD

Archivo: `src/db/index.ts`

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
```

---

## 7. Arquitectura del Proyecto

### Estructura de Directorios

```
sigep-v2/
│
├── 📁 src/                          # Código fuente principal
│   ├── 📁 app/                      # App Router de Next.js
│   │   ├── 📁 (dashboard)/          # Grupo de rutas del dashboard
│   │   │   ├── 📁 [departamento]/   # Ruta dinámica por departamento
│   │   │   │   ├── page.tsx                            # Página del departamento
│   │   │   │   ├── DepartamentoContent.tsx             # Lógica del contenido
│   │   │   │   ├── D1DepartamentoView.tsx              # Vista D-1 Personal
│   │   │   │   ├── D3DepartamentoView.tsx              # Vista D-3 Operaciones
│   │   │   │   ├── D4DepartamentoView.tsx              # Vista D-4 Logística
│   │   │   │   ├── D5DepartamentoView.tsx              # Vista D-5 Judicial
│   │   │   │   ├── AsuntosInternosDepartamentoView.tsx # Vista Asuntos Internos
│   │   │   │   ├── DelitosRuralesDepartamentoView.tsx  # Vista Delitos Rurales
│   │   │   │   ├── DigedropDepartamentoView.tsx        # Vista DIGEDROP
│   │   │   │   └── PrevencionCiudadanaDepartamentoView.tsx
│   │   │   ├── 📁 configuracion/    # Página de configuración
│   │   │   ├── 📁 configurar-2fa/   # Configuración de 2FA
│   │   │   ├── 📁 dashboard/        # Página principal del dashboard
│   │   │   ├── 📁 estadisticas/     # Página de estadísticas
│   │   │   ├── 📁 historial/        # Página de historial de cambios
│   │   │   └── layout.tsx           # Layout del dashboard (sidebar+header)
│   │   ├── 📁 api/
│   │   │   ├── 📁 auth/[...nextauth]/ # NextAuth API routes
│   │   │   └── 📁 cron/estadisticas/  # Cron endpoint de estadísticas
│   │   ├── 📁 login/               # Página de login
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Página raíz (redirect)
│   │   └── globals.css             # Estilos globales
│   │
│   ├── 📁 actions/                 # Server Actions de Next.js
│   │   ├── agregacion.ts           # Lógica de agregación de estadísticas
│   │   ├── auth.ts                 # Acciones de autenticación
│   │   ├── configuracion.ts        # Acciones de configuración
│   │   ├── datos.ts                # CRUD de datos comparativos
│   │   ├── estadisticas.ts         # Acciones de estadísticas
│   │   ├── historial.ts            # Consultas de historial
│   │   └── totp.ts                 # Acciones de 2FA/TOTP
│   │
│   ├── 📁 components/              # Componentes React reutilizables
│   │   ├── 📁 branding/            # Logos y branding
│   │   ├── 📁 charts/              # Gráficos (Recharts)
│   │   │   ├── Charts.tsx          # Gráficos comparativos
│   │   │   └── TrendChart.tsx      # Gráfico de tendencias
│   │   ├── 📁 export/              # Exportación PDF/Excel
│   │   │   ├── ExportButtons.tsx   # Botones de exportación genéricos
│   │   │   └── D1ExportButtons.tsx # Exportación específica D-1
│   │   ├── 📁 layout/              # Componentes de layout
│   │   │   ├── DashboardShell.tsx  # Wrapper del contenido principal
│   │   │   ├── Header.tsx          # Barra superior
│   │   │   └── Sidebar.tsx         # Barra lateral de navegación
│   │   ├── 📁 tables/              # Tablas de datos por departamento
│   │   │   ├── TablaComparativa.tsx         # Tabla comparativa genérica
│   │   │   ├── D1AdvancedTable.tsx          # Tabla avanzada D-1
│   │   │   ├── D3HomicidiosTable.tsx        # Tabla D-3 homicidios
│   │   │   ├── D4LogisticaTables.tsx        # Tablas D-4 logística
│   │   │   ├── D5JudicialTables.tsx         # Tablas D-5 judicial
│   │   │   ├── AsuntosInternosTables.tsx    # Tablas Asuntos Internos
│   │   │   ├── DelitosRuralesTables.tsx     # Tablas Delitos Rurales
│   │   │   ├── DigedropTables.tsx           # Tablas DIGEDROP
│   │   │   └── PrevencionCiudadanaTables.tsx# Tablas Prevención Ciudadana
│   │   └── 📁 ui/                  # Componentes UI base
│   │       ├── FilterBar.tsx       # Barra de filtros
│   │       ├── PageHeader.tsx      # Encabezado de página
│   │       ├── StatCard.tsx        # Tarjeta de estadísticas
│   │       └── TimeScaleSelector.tsx # Selector de escala temporal
│   │
│   ├── 📁 db/                      # Base de datos
│   │   ├── index.ts                # Conexión a PostgreSQL (pool)
│   │   ├── schema.ts               # Schema Drizzle ORM (TODAS las tablas)
│   │   └── seed.ts                 # Datos iniciales del sistema
│   │
│   ├── 📁 lib/                     # Librerías y utilidades
│   │   ├── auth.ts                 # Configuración NextAuth
│   │   ├── auth-utils.ts           # Utilidades de auth (JWT, session)
│   │   ├── totp.ts                 # Cifrado/verificación TOTP
│   │   ├── action-schemas.ts       # Schemas Zod para validación
│   │   ├── export-utils.ts         # Utilidades de exportación
│   │   ├── estadisticas-utils.ts   # Utilidades de estadísticas
│   │   ├── d1-definition.ts        # Definición tablas D-1
│   │   ├── d1-transform.ts         # Transformaciones D-1
│   │   ├── d1-defaults.ts          # Valores por defecto D-1
│   │   ├── d1-sync.ts              # Sincronización D-1
│   │   ├── d1-export.ts            # Exportación D-1
│   │   ├── d3-definition.ts        # Definición tablas D-3
│   │   ├── d3-transform.ts         # Transformaciones D-3
│   │   ├── d4-definition.ts        # Definición tablas D-4
│   │   ├── d4-transform.ts         # Transformaciones D-4
│   │   ├── d5-definition.ts        # Definición tablas D-5
│   │   ├── d5-transform.ts         # Transformaciones D-5
│   │   ├── asuntos-internos-definition.ts  # Definición Asuntos Internos
│   │   ├── asuntos-internos-transform.ts   # Transformaciones AI
│   │   ├── delitos-rurales-definition.ts   # Definición Delitos Rurales
│   │   ├── delitos-rurales-transform.ts    # Transformaciones DR
│   │   ├── digedrop-definition.ts          # Definición DIGEDROP
│   │   ├── digedrop-transform.ts           # Transformaciones DIGEDROP
│   │   ├── prevencion-ciudadana-definition.ts # Definición Prevención
│   │   └── prevencion-ciudadana-transform.ts  # Transformaciones Prevención
│   │
│   ├── 📁 store/                   # State management (Zustand)
│   │   ├── index.ts                # Re-exports
│   │   ├── appStore.ts             # Store global (sidebar, edición)
│   │   └── estadisticasStore.ts    # Store de estadísticas
│   │
│   ├── 📁 types/                   # TypeScript types
│   │   └── next-auth.d.ts          # Extensión de tipos NextAuth
│   │
│   └── middleware.ts               # Middleware de autenticación/2FA
│
├── 📁 drizzle/                     # Migraciones SQL
├── 📁 scripts/                     # Scripts auxiliares
├── 📁 tests/                       # Tests (unit, integration, e2e)
├── 📁 docs/                        # Documentación adicional
├── 📁 public/                      # Archivos estáticos
│
├── .env                            # Variables de entorno (NO commitear)
├── .env.example                    # Plantilla de variables
├── docker-compose.yml              # Configuración Docker
├── drizzle.config.ts               # Configuración Drizzle Kit
├── next.config.ts                  # Configuración Next.js
├── package.json                    # Dependencias y scripts
├── tsconfig.json                   # Configuración TypeScript
├── vercel.json                     # Configuración de deploy Vercel
├── start.ps1                       # Script de arranque PowerShell
├── start.cmd                       # Wrapper CMD para start.ps1
└── playwright.config.mjs           # Configuración Playwright (E2E)
```

---

## 8. Sistema de Autenticación

### Resumen

- **Proveedor**: NextAuth.js v5 (Auth.js) con `Credentials` provider.
- **Estrategia de sesión**: JWT (no base de datos).
- **Duración del JWT**: 8 horas.
- **Hashing de contraseñas**: bcryptjs con 12 rondas de salt.
- **Middleware**: Protege todas las rutas excepto `/login`, `/api/auth/*` y archivos estáticos.

### Flujo de Autenticación

```
1. Usuario ingresa credenciales en /login
2. NextAuth llama a authorize() en src/lib/auth.ts
3. Se busca el usuario en la tabla "usuarios"
4. Se verifica la contraseña con bcrypt.compare()
5. Se cargan los permisos del usuario
6. Si tiene 2FA habilitado → verificación TOTP
7. Si NO tiene 2FA configurado → redirige a /configurar-2fa
8. Token JWT generado con datos del usuario
9. Redireccion a /dashboard
```

### Middleware (`src/middleware.ts`)

El middleware se ejecuta en TODAS las rutas y verifica:
1. Si el usuario está autenticado (JWT válido).
2. Si el usuario tiene 2FA configurado; si no, redirige a `/configurar-2fa`.
3. Si el usuario ya configuró 2FA, no puede volver a `/configurar-2fa`.

**Rutas excluidas del middleware**: `/api/auth/*`, `/_next/static/*`, `/_next/image/*`, `/favicon.ico`.

### Roles y Permisos

| Rol      | Descripción                                     |
|----------|-------------------------------------------------|
| `ADMIN`  | Acceso total. Puede gestionar usuarios y config. |
| `EDITOR` | Puede editar datos de su departamento.           |
| `VIEWER` | Solo lectura.                                    |

**Permisos disponibles**: `all`, `read`, `write`, `export`, `admin`, `d1`, `d2`, `d3`, `d4`, `d5`, `asuntos_internos`, `delitos_rurales`, `digedrop`, `prevencion_ciudadana`, `unidades_especiales`, `institutos`, `unidades_regionales`.

---

## 9. Usuarios Predefinidos (Seed)

Estos usuarios se crean automáticamente al ejecutar `npm run db:seed`:

| Usuario              | Contraseña              | Rol     | Departamento                | Permisos                             |
|----------------------|-------------------------|---------|-----------------------------|--------------------------------------|
| `superadmin`         | `SIGEP_Admin#2024!`     | ADMIN   | Todos (sin departamento)    | `all, read, write, export, admin`    |
| `d1_admin`           | `D1_Admin#2024!!`       | ADMIN   | D-1 Personal                | `d1, read, write, export`            |
| `d2_admin`           | `D2_Admin#2024!!`       | ADMIN   | D-2 Inteligencia Criminal   | `d2, read, write, export`            |
| `d3_admin`           | `D3_Admin#2024!!`       | ADMIN   | D-3 Operaciones Policiales  | `d3, read, write, export`            |
| `d4_admin`           | `D4_Admin#2024!!`       | ADMIN   | D-4 Logística               | `d4, read, write, export`            |
| `d5_admin`           | `D5_Admin#2024!!`       | ADMIN   | D-5 Judicial                | `d5, read, write, export`            |
| `asuntos_admin`      | `Asuntos_Admin#24!`     | ADMIN   | Asuntos Internos            | `asuntos_internos, read, write, export` |
| `rurales_admin`      | `Rurales_Admin#24!`     | ADMIN   | Delitos Rurales             | `delitos_rurales, read, write, export`  |
| `digedrop_admin`     | `Digedrop_Adm#24!`      | ADMIN   | DIGEDROP                    | `digedrop, read, write, export`         |
| `prevencion_admin`   | `Prevencion_Ad#24!`     | ADMIN   | Prevención Ciudadana        | `prevencion_ciudadana, read, write, export` |
| `especiales_admin`   | `Especiales_Ad#24!`     | ADMIN   | Unidades Especiales         | `unidades_especiales, read, write, export`  |
| `institutos_admin`   | `Institutos_Ad#24!`     | ADMIN   | Institutos e Instrucción    | `institutos, read, write, export`           |
| `regionales_admin`   | `Regionales_Ad#24!`     | ADMIN   | Unidades Regionales         | `unidades_regionales, read, write, export`  |

> ⚠️ **IMPORTANTE**: En el primer login, cada usuario deberá configurar 2FA (TOTP). El sistema redirige automáticamente a `/configurar-2fa`.

---

## 10. Departamentos del Sistema

| Código                 | Nombre Completo                              | Color     | Orden |
|------------------------|----------------------------------------------|-----------|-------|
| `d1`                   | Departamento Personal (D-1)                  | `#1e3a5f` | 1     |
| `d2`                   | Departamento Inteligencia Criminal (D-2)     | `#0ea5e9` | 2     |
| `d3`                   | Departamento Operaciones Policiales (D-3)    | `#ef4444` | 3     |
| `d4`                   | Departamento Logística (D-4)                 | `#f59e0b` | 4     |
| `d5`                   | Departamento Judicial (D-5)                  | `#8b5cf6` | 5     |
| `asuntos_internos`     | Dirección General de Asuntos Internos        | `#374151` | 6     |
| `delitos_rurales`      | Dirección General de Delitos Rurales         | `#22c55e` | 7     |
| `digedrop`             | Dirección General de Drogas Peligrosas       | `#dc2626` | 8     |
| `prevencion_ciudadana` | Dirección General de Prevención Ciudadana    | `#06b6d4` | 9     |
| `unidades_especiales`  | Dirección General de Unidades Especiales     | `#ea580c` | 10    |
| `institutos`           | Dirección General de Institutos e Instrucción| `#2563eb` | 11    |
| `unidades_regionales`  | Unidades Regionales                          | `#7c3aed` | 12    |

Cada departamento tiene **tablas de datos propias** definidas en archivos `*-definition.ts` y `*-transform.ts` dentro de `src/lib/`.

---

## 11. Rutas y Páginas

| Ruta                          | Descripción                                      | Acceso           |
|-------------------------------|--------------------------------------------------|------------------|
| `/`                           | Redirect a `/dashboard` o `/login`               | Público          |
| `/login`                      | Página de inicio de sesión                       | Público          |
| `/dashboard`                  | Dashboard principal con resumen general          | Autenticado      |
| `/configurar-2fa`             | Configuración de autenticación 2FA               | Autenticado (sin 2FA) |
| `/configuracion`              | Panel de configuración (usuarios, períodos, etc.) | ADMIN            |
| `/estadisticas`               | Visualización de estadísticas con gráficos       | Autenticado      |
| `/historial`                  | Historial de cambios (auditoría)                 | Autenticado      |
| `/[departamento]`             | Vista de datos del departamento (ej: `/d1`)      | Autenticado + permisos |
| `/api/auth/[...nextauth]`     | Endpoints de NextAuth                            | Sistema          |
| `/api/cron/estadisticas`      | Cron job de rollup de estadísticas               | Bearer Token     |

---

## 12. Server Actions

Los Server Actions son funciones del lado del servidor invocadas directamente desde componentes React.

| Archivo                    | Funciones Principales                                               |
|----------------------------|---------------------------------------------------------------------|
| `actions/datos.ts`         | `obtenerDatos()`, `guardarDatosComparativos()` — CRUD datos por depto |
| `actions/auth.ts`          | Acciones de login/logout                                             |
| `actions/configuracion.ts` | Gestión de usuarios, períodos, config global                         |
| `actions/estadisticas.ts`  | Consultas y rollup de estadísticas                                    |
| `actions/historial.ts`     | Consultas al historial de cambios                                     |
| `actions/agregacion.ts`    | Lógica de agregación de datos estadísticos                            |
| `actions/totp.ts`          | Setup y verificación 2FA (generar secreto, verificar código)          |

### Patrón de Server Actions

Cada action sigue este patrón:
1. Declara `'use server'` al inicio del archivo.
2. Usa inyección de dependencias para facilitar testing.
3. Valida inputs con Zod schemas.
4. Verifica la sesión del usuario.
5. Ejecuta la operación en la BD.
6. Revalida las páginas afectadas con `revalidatePath()`.

---

## 13. Componentes Principales

### Layout

- **`Sidebar`** — Navegación lateral con links a departamentos y secciones.
- **`Header`** — Barra superior con info del usuario, períodos activos y toggle de edición.
- **`DashboardShell`** — Wrapper que ajusta el contenido al sidebar.

### Tablas

- **`TablaComparativa`** — Componente genérico para mostrar datos comparativos (anterior vs actual) con cálculos de diferencia y porcentaje.
- **Tablas específicas** (`D1AdvancedTable`, `D3HomicidiosTable`, etc.) — Implementaciones especializadas para cada departamento con columnas y lógica custom.

### Gráficos

- **`Charts`** — Gráficos de barras comparativos usando Recharts.
- **`TrendChart`** — Gráfico de líneas para tendencias temporales.

### Exportación

- **`ExportButtons`** — Botones para exportar a PDF y Excel.
- **`D1ExportButtons`** — Exportación específica para D-1 con formato personalizado.

### UI Base

- **`StatCard`** — Tarjeta de estadísticas con indicadores.
- **`FilterBar`** — Barra de filtros para tablas.
- **`PageHeader`** — Encabezado estándar de páginas.
- **`TimeScaleSelector`** — Selector de escala temporal (diario/mensual/anual).

---

## 14. Sistema de Estadísticas

### Modelo de datos pre-agregados

El sistema usa un **rollup en tres niveles** para optimizar consultas de estadísticas:

```
datos_comparativos (datos crudos)
        ↓ Cron diario
estadisticas_diarias (totales por tabla por día)
        ↓ Agregación
estadisticas_mensuales (promedios, picos, totales por mes)
        ↓ Agregación
estadisticas_anuales (totales anuales, tendencias)
```

### Cron Job

- **Endpoint**: `GET /api/cron/estadisticas`
- **Autenticación**: Header `Authorization: Bearer <CRON_SECRET>`
- **Programación**: Diariamente a las 03:00 UTC (configurado en `vercel.json`)
- **Función**: Recorre todas las tablas de datos y genera/actualiza los rollups.

---

## 15. Exportación de Datos

| Formato | Librería               | Funcionalidad                          |
|---------|------------------------|----------------------------------------|
| PDF     | jsPDF + jspdf-autotable | Generación de tablas comparativas en PDF |
| Excel   | SheetJS (xlsx)          | Exportación de datos a hojas de cálculo  |

Las utilidades de exportación están en `src/lib/export-utils.ts` y `src/lib/d1-export.ts`.

---

## 16. Autenticación de Dos Factores (2FA)

### Cómo funciona

1. **Primer login** → El middleware detecta que `totpEnabled = false` → redirige a `/configurar-2fa`.
2. **En `/configurar-2fa`** → Se genera un secreto TOTP, se muestra QR code.
3. **El usuario escanea el QR** con Google Authenticator, Authy, etc.
4. **Verifica un código** → Si es correcto, se cifra el secreto con AES-256-GCM y se guarda en la BD.
5. **Logins posteriores** → Se pide el código TOTP después del usuario/contraseña.

### Seguridad

- Los secretos TOTP se cifran con **AES-256-GCM** antes de guardarse en la BD.
- La clave de cifrado se almacena en la variable `TOTP_ENCRYPTION_KEY`.
- **Rate limiting** en memoria: máximo 5 intentos cada 5 minutos.

---

## 17. Cron Jobs

### Rollup de Estadísticas

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/estadisticas",
      "schedule": "0 3 * * *"   // Todos los días a las 03:00 UTC
    }
  ]
}
```

Para producción, definir `CRON_SECRET` en Vercel con el mismo valor del `.env`.

### Ejecutar manualmente

```powershell
# Desde PowerShell:
Invoke-WebRequest -Uri "http://localhost:3000/api/cron/estadisticas" `
  -Headers @{ "Authorization" = "Bearer dfUIPpiZZfCWE5tuf+wGZDJStv1ZrZa+0yTkb9w74lLaDHEezIqiCPGb+nRMFuIA" }
```

---

## 18. Testing

### Tipos de Tests

| Tipo         | Comando                        | Descripción                               |
|--------------|--------------------------------|-------------------------------------------|
| Unit         | `npm run test:unit`            | Tests unitarios con tsx/node:test          |
| Integration  | `npm run test:integration`     | Tests de integración con pg-mem            |
| E2E          | `npm run test:e2e`             | Tests end-to-end con Playwright            |
| E2E Smoke    | `npm run test:e2e:smoke`       | Test smoke de auth + edición + historial   |

### Estructura de Tests

```
tests/
├── e2e/              # Tests E2E (Playwright)
├── helpers/           # Helpers compartidos
├── integration/       # Tests de integración
├── setup/             # Setup de tests
└── unit/              # Tests unitarios
```

### Comandos de preparación E2E

```powershell
# Verificar que todo esté listo para E2E
npm run e2e:doctor

# Seed de recuperación para E2E
npm run e2e:seed:recovery

# Instalar browser para Playwright
npm run e2e:prepare
```

---

## 19. Deploy en Vercel

### Pasos

1. Conectar el repositorio a Vercel.
2. Configurar las variables de entorno en Vercel:

| Variable             | Valor de Producción                          |
|----------------------|----------------------------------------------|
| `DATABASE_URL`       | Connection string de PostgreSQL de producción |
| `AUTH_SECRET`        | Secreto generado nuevo (no el de dev)         |
| `NEXTAUTH_URL`       | URL del deploy (ej: `https://sigep.vercel.app`) |
| `CRON_SECRET`        | Secreto generado nuevo para el cron           |
| `NODE_ENV`           | `production`                                  |
| `TOTP_ENCRYPTION_KEY`| Clave hex de 64 chars generada nueva          |

3. Vercel ejecutará `npm run build` automáticamente.
4. El cron job se programa automáticamente desde `vercel.json`.

### Base de datos en producción

Opciones recomendadas:
- **Neon** (`@neondatabase/serverless` ya está como dependencia)
- **Supabase**
- **Railway**

---

## 20. Scripts Útiles

```powershell
# === DESARROLLO ===
npm run dev                    # Arrancar en modo desarrollo
npm run build                  # Compilar para producción
npm run start                  # Arrancar build de producción
npm run lint                   # Verificar linting
npm run typecheck              # Verificar tipos TypeScript

# === BASE DE DATOS ===
npm run db:seed                # Ejecutar seed de datos
npm run d1:sync                # Sincronizar estructura D1
npx drizzle-kit migrate        # Aplicar migraciones
npx drizzle-kit generate       # Generar nueva migración
npx drizzle-kit push --force   # Push directo del schema
npx drizzle-kit studio         # Abrir Drizzle Studio (GUI de BD)

# === TESTING ===
npm run test                   # Unit + Integration
npm run test:unit              # Solo unit tests
npm run test:integration       # Solo integration tests
npm run test:e2e               # E2E tests
npm run test:e2e:smoke         # Smoke test E2E
npm run e2e:doctor             # Diagnóstico E2E
npm run e2e:seed:recovery      # Seed de recuperación E2E
npm run e2e:prepare            # Instalar Playwright + diagnóstico

# === SETUP ===
npm run setup:start            # Script completo de arranque
npm run setup:start:no-start   # Setup sin arrancar la app
```

---

## 21. Solución de Problemas

### ❌ "Docker Engine no responde"
→ Abrir Docker Desktop y esperar a que termine de iniciar.

### ❌ "Puerto 5433 en uso"
→ Ya hay un PostgreSQL corriendo. El script detecta esto automáticamente y omite Docker.

### ❌ "Puerto 3000 en uso"
→ El script detecta si es una instancia previa de SIGEP y la reinicia. Si es otro proceso, hay que liberarlo manualmente.

### ❌ "Error en migraciones"
```powershell
npx drizzle-kit push --force   # Forzar sincronización directa
```

### ❌ "Problemas con OneDrive"
→ El script `start.ps1` detecta si el proyecto está dentro de OneDrive y:
  - Crea un junction link de `.next/` fuera de OneDrive (`%LOCALAPPDATA%\SIGEP-v2\next-dev-cache`).
  - Usa webpack en lugar de turbopack.
  - Usa seed de recuperación.

### ❌ "Error con jose/bcryptjs en Edge"
→ El middleware usa `getToken` de `next-auth/jwt` (compatible con Edge) en lugar de `auth()` que requiere Node.js. Si hay errores con `jose`, ejecutar:
```powershell
node ./scripts/patch-jose.mjs
```

### ❌ "2FA no funciona"
→ Verificar que `TOTP_ENCRYPTION_KEY` esté configurada correctamente (64 caracteres hex). Sin esta variable, el cifrado/descifrado de secretos TOTP falla.

---

## 22. Guía para Modificar el Sistema

### Agregar un nuevo departamento

1. **Agregar al seed** en `src/db/seed.ts` → array `departamentosData`.
2. **Crear archivos de definición** en `src/lib/`:
   - `nuevo-depto-definition.ts` → Definir las tablas y filas del departamento.
   - `nuevo-depto-transform.ts` → Función `createNuevoDeptSeedTables()`.
3. **Crear vista** en `src/app/(dashboard)/[departamento]/NuevoDeptDepartamentoView.tsx`.
4. **Agregar al switch** en `src/app/(dashboard)/[departamento]/DepartamentoContent.tsx`.
5. **Crear tabla personalizada** (opcional) en `src/components/tables/NuevoDeptTables.tsx`.
6. **Agregar al seed** el import del transform en `src/db/seed.ts`.
7. **Crear usuario admin** en el array `usuariosData` del seed.
8. **Ejecutar** `npm run db:seed` para cargar los datos.

### Agregar una nueva tabla a un departamento existente

1. Editar el archivo `*-definition.ts` del departamento.
2. Agregar la nueva tabla con sus filas al array de definición.
3. Ejecutar `npm run db:seed` (el seed es idempotente).

### Agregar un nuevo campo a la tabla de usuarios

1. Editar `src/db/schema.ts` → tabla `usuarios`.
2. Generar migración: `npx drizzle-kit generate`.
3. Aplicar migración: `npx drizzle-kit migrate`.
4. Actualizar `src/types/next-auth.d.ts` si afecta la sesión.
5. Actualizar `src/lib/auth-utils.ts` para incluir el campo en token/session.
6. Actualizar `src/lib/auth.ts` → función `authorize()`.

### Agregar una nueva página

1. Crear directorio en `src/app/(dashboard)/nueva-pagina/`.
2. Crear `page.tsx` (Server Component).
3. Crear `NuevaPaginaContent.tsx` (Client Component si necesita interactividad).
4. Agregar link en `src/components/layout/Sidebar.tsx`.

### Agregar un nuevo Server Action

1. Crear o editar archivo en `src/actions/`.
2. Marcar con `'use server'` al inicio.
3. Validar inputs con Zod (schemas en `src/lib/action-schemas.ts`).
4. Verificar sesión antes de ejecutar.
5. Llamar `revalidatePath()` si modifica datos.

### Modificar el schema de la BD

1. Editar `src/db/schema.ts`.
2. Ejecutar: `npx drizzle-kit generate` → Genera archivo SQL en `drizzle/`.
3. Ejecutar: `npx drizzle-kit migrate` → Aplica la migración.
4. Actualizar el seed si es necesario.

### Conectar con una BD externa (no Docker)

1. Cambiar `DATABASE_URL` en `.env` a la connection string de la BD externa.
2. Asegurarse de que la BD sea PostgreSQL 15+.
3. Ejecutar migraciones: `npx drizzle-kit migrate`.
4. Ejecutar seed: `npm run db:seed`.

---

## 📌 Resumen de Acceso Rápido

```
🌐 URL Local:           http://localhost:3000
👤 Super Admin:          superadmin / SIGEP_Admin#2024!
🗄️ PostgreSQL:           localhost:5433 / sigep_user / sigep_password_2024 / sigep_v2
📦 Arranque rápido:      .\start.cmd
🔧 Solo preparar:        .\start.ps1 -NoStart
📊 Seed datos:           npm run db:seed
🔄 Migraciones:          npx drizzle-kit migrate
🧪 Tests:                npm run test
🚀 Build producción:     npm run build && npm run start
```

---

> 📝 **Nota para desarrolladores**: Este archivo contiene credenciales de desarrollo local. Para producción, **SIEMPRE** generar nuevos secretos y nunca reutilizar los de desarrollo.

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import * as schema from './schema';
import { createD1SeedTables } from '../lib/d1-definition';

const DATABASE_URL = process.env.DATABASE_URL!;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

const departamentosData = [
  {
    codigo: 'd1',
    nombre: 'Departamento Personal (D-1)',
    color: '#1e3a5f',
    orden: 1,
  },
  {
    codigo: 'd2',
    nombre: 'Departamento Inteligencia Criminal (D-2)',
    color: '#0ea5e9',
    orden: 2,
  },
  {
    codigo: 'd3',
    nombre: 'Departamento Operaciones Policiales (D-3)',
    color: '#ef4444',
    orden: 3,
  },
  {
    codigo: 'd4',
    nombre: 'Departamento Logística (D-4)',
    color: '#f59e0b',
    orden: 4,
  },
  {
    codigo: 'd5',
    nombre: 'Departamento Judicial (D-5)',
    color: '#8b5cf6',
    orden: 5,
  },
  {
    codigo: 'asuntos_internos',
    nombre: 'Dirección General de Asuntos Internos',
    color: '#374151',
    orden: 6,
  },
  {
    codigo: 'delitos_rurales',
    nombre: 'Dirección General de Delitos Rurales',
    color: '#22c55e',
    orden: 7,
  },
  {
    codigo: 'digedrop',
    nombre: 'Dirección General de Drogas Peligrosas',
    color: '#dc2626',
    orden: 8,
  },
  {
    codigo: 'prevencion_ciudadana',
    nombre: 'Dirección General de Prevención Ciudadana',
    color: '#06b6d4',
    orden: 9,
  },
  {
    codigo: 'unidades_especiales',
    nombre: 'Dirección General de Unidades Especiales',
    color: '#ea580c',
    orden: 10,
  },
  {
    codigo: 'institutos',
    nombre: 'Dirección General de Institutos e Instrucción',
    color: '#2563eb',
    orden: 11,
  },
  {
    codigo: 'unidades_regionales',
    nombre: 'Unidades Regionales',
    color: '#7c3aed',
    orden: 12,
  },
];

const usuariosData = [
  {
    username: 'superadmin',
    password: 'SIGEP_Admin#2024!',
    nombre: 'Super Administrador',
    rol: 'ADMIN' as const,
    color: '#1e3a5f',
    departamento: null,
    permisos: ['all', 'read', 'write', 'export', 'admin'],
  },
  {
    username: 'd1_admin',
    password: 'D1_Admin#2024!!',
    nombre: 'Administrador D-1',
    rol: 'ADMIN' as const,
    color: '#1e3a5f',
    departamento: 'd1',
    permisos: ['d1', 'read', 'write', 'export'],
  },
  {
    username: 'd2_admin',
    password: 'D2_Admin#2024!!',
    nombre: 'Administrador D-2',
    rol: 'ADMIN' as const,
    color: '#0ea5e9',
    departamento: 'd2',
    permisos: ['d2', 'read', 'write', 'export'],
  },
  {
    username: 'd3_admin',
    password: 'D3_Admin#2024!!',
    nombre: 'Administrador D-3',
    rol: 'ADMIN' as const,
    color: '#ef4444',
    departamento: 'd3',
    permisos: ['d3', 'read', 'write', 'export'],
  },
  {
    username: 'd4_admin',
    password: 'D4_Admin#2024!!',
    nombre: 'Administrador D-4',
    rol: 'ADMIN' as const,
    color: '#f59e0b',
    departamento: 'd4',
    permisos: ['d4', 'read', 'write', 'export'],
  },
  {
    username: 'd5_admin',
    password: 'D5_Admin#2024!!',
    nombre: 'Administrador D-5',
    rol: 'ADMIN' as const,
    color: '#8b5cf6',
    departamento: 'd5',
    permisos: ['d5', 'read', 'write', 'export'],
  },
  {
    username: 'asuntos_admin',
    password: 'Asuntos_Admin#24!',
    nombre: 'Administrador Asuntos Internos',
    rol: 'ADMIN' as const,
    color: '#374151',
    departamento: 'asuntos_internos',
    permisos: ['asuntos_internos', 'read', 'write', 'export'],
  },
  {
    username: 'rurales_admin',
    password: 'Rurales_Admin#24!',
    nombre: 'Administrador Delitos Rurales',
    rol: 'ADMIN' as const,
    color: '#22c55e',
    departamento: 'delitos_rurales',
    permisos: ['delitos_rurales', 'read', 'write', 'export'],
  },
  {
    username: 'digedrop_admin',
    password: 'Digedrop_Adm#24!',
    nombre: 'Administrador DIGEDROP',
    rol: 'ADMIN' as const,
    color: '#dc2626',
    departamento: 'digedrop',
    permisos: ['digedrop', 'read', 'write', 'export'],
  },
  {
    username: 'prevencion_admin',
    password: 'Prevencion_Ad#24!',
    nombre: 'Administrador Prevención',
    rol: 'ADMIN' as const,
    color: '#06b6d4',
    departamento: 'prevencion_ciudadana',
    permisos: ['prevencion_ciudadana', 'read', 'write', 'export'],
  },
  {
    username: 'especiales_admin',
    password: 'Especiales_Ad#24!',
    nombre: 'Administrador Unidades Especiales',
    rol: 'ADMIN' as const,
    color: '#ea580c',
    departamento: 'unidades_especiales',
    permisos: ['unidades_especiales', 'read', 'write', 'export'],
  },
  {
    username: 'institutos_admin',
    password: 'Institutos_Ad#24!',
    nombre: 'Administrador Institutos',
    rol: 'ADMIN' as const,
    color: '#2563eb',
    departamento: 'institutos',
    permisos: ['institutos', 'read', 'write', 'export'],
  },
  {
    username: 'regionales_admin',
    password: 'Regionales_Ad#24!',
    nombre: 'Administrador Unidades Regionales',
    rol: 'ADMIN' as const,
    color: '#7c3aed',
    departamento: 'unidades_regionales',
    permisos: ['unidades_regionales', 'read', 'write', 'export'],
  },
];

type TablaData = {
  tablaId: string;
  nombre: string;
  datos: {
    filaId: string;
    label: string;
    periodoAnterior: number;
    periodoActual: number;
  }[];
};

const d1Seed = createD1SeedTables();
const modifiedD1Seed = d1Seed.map(table =>
  table.tablaId !== 'd1-situacion-particular'
    ? table
    : {
      ...table,
      datos: [
        { filaId: 'abandono_servicio', label: 'ABANDONO DE SERVICIO', periodoAnterior: 38, periodoActual: 45 },
        { filaId: 'abandono_servicio_pasivo_proceso', label: 'ABAND. SERV. // PASIV. PROCESO', periodoAnterior: 1, periodoActual: 4 },
        { filaId: 'disponible_art_114_inc_1', label: 'DISPONIBLE ART. 114 INC. 1 LEY 3823', periodoAnterior: 1, periodoActual: 3 },
        { filaId: 'disponible_art_203_inc_a', label: 'DISPONIBLE ART. 203 INC. A LEY 3823', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'disponible_art_203_inc_b', label: 'DISPONIBLE ART. 203 INC. B LEY 3823', periodoAnterior: 5, periodoActual: 8 },
        { filaId: 'disponible_por_enf_art_114_inc_2', label: 'DISPONIBLE POR ENF. ART. 114 INC. 2 LEY 3823', periodoAnterior: 35, periodoActual: 31 },
        { filaId: 'disponible_por_enf_art_114_inc_2_art', label: 'DISPONIBLE POR ENF. ART. 114 INC. 2 LEY 3823 ART', periodoAnterior: 16, periodoActual: 9 },
        { filaId: 'licencia_especial_sin_goce', label: 'LICENCIA ESPECIAL SIN GOCE DE SUELDO', periodoAnterior: 10, periodoActual: 9 },
        { filaId: 'pasivo_por_enf_art_116', label: 'PASIVO POR ENF. ART. 116 LEY 3823', periodoAnterior: 7, periodoActual: 7 },
        { filaId: 'pasivo_por_enf_art_116_art', label: 'PASIVO POR ENF. ART. 116 LEY 3823 ART', periodoAnterior: 1, periodoActual: 2 },
        { filaId: 'pasivo_por_enf_art_119_inc_1', label: 'PASIVO POR ENF. ART. 119 INC. 1 LEY 3823', periodoAnterior: 37, periodoActual: 33 },
        { filaId: 'pasivo_por_enf_art_119_inc_1_art', label: 'PASIVO POR ENF. ART. 119 INC. 1 LEY 3823 ART', periodoAnterior: 3, periodoActual: 3 },
        { filaId: 'pasivo_por_enf_art_119_inc_5', label: 'PASIVO POR ENF. ART. 119 INC. 5 LEY 3823', periodoAnterior: 66, periodoActual: 52 },
        { filaId: 'pasivo_por_enf_art_119_inc_6', label: 'PASIVO POR ENF. ART. 119 INC. 6 LEY 3823', periodoAnterior: 3, periodoActual: 3 },
        { filaId: 'renuncia_en_tramite', label: 'RENUNCIA EN TRAMITE', periodoAnterior: 13, periodoActual: 14 },
        { filaId: 'serv_efect_enfermedad_art_111_inc_2', label: 'SERV. EFECT. ENFERMEDAD ART. 111 INC. 2 LEY 3823', periodoAnterior: 26, periodoActual: 46 },
        { filaId: 'baja_laboral_art', label: 'BAJA LABORAL ART', periodoAnterior: 73, periodoActual: 72 },
        { filaId: 'desafectacion_ptp', label: 'DESAFECTACION DE PTP', periodoAnterior: 13, periodoActual: 2 },
        { filaId: 'desvinculacion_ptp', label: 'DESVINCULACION PTP', periodoAnterior: 2, periodoActual: 0 },
      ],
    }
);

const allTablas: Record<string, TablaData[]> = {
  d1: modifiedD1Seed,
  d3: [
    // ─── DELITOS CONTRA LA PROPIEDAD (por Regional) ───────────────────────
    {
      tablaId: 'd3-delitos-propiedad',
      nombre: 'Delitos Contra la Propiedad — Por Regional',
      datos: [
        { filaId: 'urc', label: 'U.R.C', periodoAnterior: 9059, periodoActual: 8915 },
        { filaId: 'urn', label: 'U.R.N', periodoAnterior: 2722, periodoActual: 2247 },
        { filaId: 'urs', label: 'U.R.S', periodoAnterior: 1714, periodoActual: 955 },
        { filaId: 'ure', label: 'U.R.E', periodoAnterior: 2271, periodoActual: 1820 },
        { filaId: 'uro', label: 'U.R.O', periodoAnterior: 1618, periodoActual: 1458 },
        { filaId: 'ambito_provincial', label: 'ÁMBITO PROVINCIAL', periodoAnterior: 17384, periodoActual: 15395 },
      ],
    },

    // ─── SUICIDIOS — TOTAL PROVINCIAL ─────────────────────────────────────
    {
      tablaId: 'd3-suicidios-total',
      nombre: 'Suicidios — Total Provincial',
      datos: [
        { filaId: 'total_provincial_2024_2025', label: 'TOTAL PROVINCIAL', periodoAnterior: 100, periodoActual: 117 },
      ],
    },

    // ─── SUICIDIOS — SEXO / GÉNERO ─────────────────────────────────────────
    {
      tablaId: 'd3-suicidios-sexo',
      nombre: 'Suicidios — Sexo / Género',
      datos: [
        { filaId: 'masculino', label: 'MASCULINO', periodoAnterior: 71, periodoActual: 95 },
        { filaId: 'femenino', label: 'FEMENINO', periodoAnterior: 29, periodoActual: 22 },
      ],
    },

    // ─── SUICIDIOS — MODALIDADES ───────────────────────────────────────────
    {
      tablaId: 'd3-suicidios-modalidades',
      nombre: 'Suicidios — Modalidades',
      datos: [
        { filaId: 'ahorcamiento', label: 'AHORCAMIENTO', periodoAnterior: 84, periodoActual: 100 },
        { filaId: 'arma_fuego', label: 'ARMA DE FUEGO', periodoAnterior: 12, periodoActual: 13 },
        { filaId: 'arma_blanca', label: 'ARMA BLANCA', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'quemaduras', label: 'QUEMADURAS', periodoAnterior: 1, periodoActual: 3 },
        { filaId: 'envenenamiento', label: 'ENVENENAMIENTO', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'otros_suicidio', label: 'OTROS', periodoAnterior: 2, periodoActual: 0 },
      ],
    },

    // ─── HOMICIDIOS DOLOSOS — POR ÁMBITO/SITUACIÓN Y MÓVIL DE CRIMEN ─────
    {
      tablaId: 'd3-homicidios-ambito-movil',
      nombre: 'Víctimas de Homicidios Dolosos — Por Ámbito/Situación y Móvil de Crimen',
      datos: [
        // — Hechos por ámbito/situación —
        // ÁMBITO PÚBLICO
        { filaId: 'ambito_publico_hechos_urc', label: 'ÁMBITO PÚBLICO — Hechos U.R.C', periodoAnterior: 19, periodoActual: 8 },
        { filaId: 'ambito_publico_hechos_urn', label: 'ÁMBITO PÚBLICO — Hechos U.R.N', periodoAnterior: 3, periodoActual: 2 },
        { filaId: 'ambito_publico_hechos_urs', label: 'ÁMBITO PÚBLICO — Hechos U.R.S', periodoAnterior: 3, periodoActual: 1 },
        { filaId: 'ambito_publico_hechos_ure', label: 'ÁMBITO PÚBLICO — Hechos U.R.E', periodoAnterior: 1, periodoActual: 1 },
        { filaId: 'ambito_publico_hechos_uro', label: 'ÁMBITO PÚBLICO — Hechos U.R.O', periodoAnterior: 1, periodoActual: 1 },

        // ÁMBITO PRIVADO
        { filaId: 'ambito_privado_hechos_urc', label: 'ÁMBITO PRIVADO — Hechos U.R.C', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'ambito_privado_hechos_urn', label: 'ÁMBITO PRIVADO — Hechos U.R.N', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'ambito_privado_hechos_urs', label: 'ÁMBITO PRIVADO — Hechos U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'ambito_privado_hechos_ure', label: 'ÁMBITO PRIVADO — Hechos U.R.E', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'ambito_privado_hechos_uro', label: 'ÁMBITO PRIVADO — Hechos U.R.O', periodoAnterior: 1, periodoActual: 0 },

        // VIVIENDA PARTICULAR
        { filaId: 'vivienda_particular_hechos_urc', label: 'VIVIENDA PARTICULAR — Hechos U.R.C', periodoAnterior: 2, periodoActual: 5 },
        { filaId: 'vivienda_particular_hechos_urn', label: 'VIVIENDA PARTICULAR — Hechos U.R.N', periodoAnterior: 3, periodoActual: 0 },
        { filaId: 'vivienda_particular_hechos_urs', label: 'VIVIENDA PARTICULAR — Hechos U.R.S', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'vivienda_particular_hechos_ure', label: 'VIVIENDA PARTICULAR — Hechos U.R.E', periodoAnterior: 2, periodoActual: 0 },
        { filaId: 'vivienda_particular_hechos_uro', label: 'VIVIENDA PARTICULAR — Hechos U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // CONTEXTO DE ENCIERRO
        { filaId: 'contexto_encierro_hechos_urc', label: 'CONTEXTO DE ENCIERRO — Hechos U.R.C', periodoAnterior: 2, periodoActual: 0 },
        { filaId: 'contexto_encierro_hechos_urn', label: 'CONTEXTO DE ENCIERRO — Hechos U.R.N', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'contexto_encierro_hechos_urs', label: 'CONTEXTO DE ENCIERRO — Hechos U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'contexto_encierro_hechos_ure', label: 'CONTEXTO DE ENCIERRO — Hechos U.R.E', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'contexto_encierro_hechos_uro', label: 'CONTEXTO DE ENCIERRO — Hechos U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // — Hechos por móvil de crimen —
        // VIOLENCIA INTERVECINAL
        { filaId: 'violencia_intervecinal_urc', label: 'VIOLENCIA INTERVECINAL — U.R.C', periodoAnterior: 6, periodoActual: 1 },
        { filaId: 'violencia_intervecinal_urn', label: 'VIOLENCIA INTERVECINAL — U.R.N', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'violencia_intervecinal_urs', label: 'VIOLENCIA INTERVECINAL — U.R.S', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'violencia_intervecinal_ure', label: 'VIOLENCIA INTERVECINAL — U.R.E', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'violencia_intervecinal_uro', label: 'VIOLENCIA INTERVECINAL — U.R.O', periodoAnterior: 1, periodoActual: 0 },

        // VIOLENCIA INTRAFAMILIAR
        { filaId: 'violencia_intrafamiliar_urc', label: 'VIOLENCIA INTRAFAMILIAR — U.R.C', periodoAnterior: 1, periodoActual: 2 },
        { filaId: 'violencia_intrafamiliar_urn', label: 'VIOLENCIA INTRAFAMILIAR — U.R.N', periodoAnterior: 2, periodoActual: 0 },
        { filaId: 'violencia_intrafamiliar_urs', label: 'VIOLENCIA INTRAFAMILIAR — U.R.S', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'violencia_intrafamiliar_ure', label: 'VIOLENCIA INTRAFAMILIAR — U.R.E', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'violencia_intrafamiliar_uro', label: 'VIOLENCIA INTRAFAMILIAR — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // LEGÍTIMA DEFENSA
        { filaId: 'legitima_defensa_urc', label: 'LEGÍTIMA DEFENSA — U.R.C', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'legitima_defensa_urn', label: 'LEGÍTIMA DEFENSA — U.R.N', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'legitima_defensa_urs', label: 'LEGÍTIMA DEFENSA — U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'legitima_defensa_ure', label: 'LEGÍTIMA DEFENSA — U.R.E', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'legitima_defensa_uro', label: 'LEGÍTIMA DEFENSA — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // OCASIÓN DE ROBO
        { filaId: 'ocasion_robo_urc', label: 'OCASIÓN DE ROBO — U.R.C', periodoAnterior: 5, periodoActual: 2 },
        { filaId: 'ocasion_robo_urn', label: 'OCASIÓN DE ROBO — U.R.N', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'ocasion_robo_urs', label: 'OCASIÓN DE ROBO — U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'ocasion_robo_ure', label: 'OCASIÓN DE ROBO — U.R.E', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'ocasion_robo_uro', label: 'OCASIÓN DE ROBO — U.R.O', periodoAnterior: 1, periodoActual: 0 },

        // INTERVENCIÓN POLICIAL
        { filaId: 'intervencion_policial_urc', label: 'INTERVENCIÓN POLICIAL — U.R.C', periodoAnterior: 3, periodoActual: 1 },
        { filaId: 'intervencion_policial_urn', label: 'INTERVENCIÓN POLICIAL — U.R.N', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'intervencion_policial_urs', label: 'INTERVENCIÓN POLICIAL — U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'intervencion_policial_ure', label: 'INTERVENCIÓN POLICIAL — U.R.E', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'intervencion_policial_uro', label: 'INTERVENCIÓN POLICIAL — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // POSIBLE AJUSTE DE CUENTA
        { filaId: 'ajuste_cuenta_urc', label: 'POSIBLE AJUSTE DE CUENTA — U.R.C', periodoAnterior: 3, periodoActual: 1 },
        { filaId: 'ajuste_cuenta_urn', label: 'POSIBLE AJUSTE DE CUENTA — U.R.N', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'ajuste_cuenta_urs', label: 'POSIBLE AJUSTE DE CUENTA — U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'ajuste_cuenta_ure', label: 'POSIBLE AJUSTE DE CUENTA — U.R.E', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'ajuste_cuenta_uro', label: 'POSIBLE AJUSTE DE CUENTA — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // FEMICIDIO
        { filaId: 'femicidio_urc', label: 'FEMICIDIO — U.R.C', periodoAnterior: 1, periodoActual: 6 },
        { filaId: 'femicidio_urn', label: 'FEMICIDIO — U.R.N', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'femicidio_urs', label: 'FEMICIDIO — U.R.S', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'femicidio_ure', label: 'FEMICIDIO — U.R.E', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'femicidio_uro', label: 'FEMICIDIO — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // CONFLICTO PASIONAL
        { filaId: 'conflicto_pasional_urc', label: 'CONFLICTO PASIONAL — U.R.C', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'conflicto_pasional_urn', label: 'CONFLICTO PASIONAL — U.R.N', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'conflicto_pasional_urs', label: 'CONFLICTO PASIONAL — U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'conflicto_pasional_ure', label: 'CONFLICTO PASIONAL — U.R.E', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'conflicto_pasional_uro', label: 'CONFLICTO PASIONAL — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // RIÑA (V/PÚBLICA Y/O V/PARTICULAR)
        { filaId: 'rina_publica_particular_urc', label: 'RIÑA (V/PÚBLICA Y/O V/PARTICULAR) — U.R.C', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'rina_publica_particular_urn', label: 'RIÑA (V/PÚBLICA Y/O V/PARTICULAR) — U.R.N', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'rina_publica_particular_urs', label: 'RIÑA (V/PÚBLICA Y/O V/PARTICULAR) — U.R.S', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'rina_publica_particular_ure', label: 'RIÑA (V/PÚBLICA Y/O V/PARTICULAR) — U.R.E', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'rina_publica_particular_uro', label: 'RIÑA (V/PÚBLICA Y/O V/PARTICULAR) — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // CONFLICTO EN CONTEXTO DE ENCIERRO
        { filaId: 'conflicto_encierro_urc', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO — U.R.C', periodoAnterior: 2, periodoActual: 0 },
        { filaId: 'conflicto_encierro_urn', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO — U.R.N', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'conflicto_encierro_urs', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO — U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'conflicto_encierro_ure', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO — U.R.E', periodoAnterior: 0, periodoActual: 1 },
        { filaId: 'conflicto_encierro_uro', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // PRETERINTENCIONAL
        { filaId: 'preterintencional_urc', label: 'PRETERINTENCIONAL — U.R.C', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'preterintencional_urn', label: 'PRETERINTENCIONAL — U.R.N', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'preterintencional_urs', label: 'PRETERINTENCIONAL — U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'preterintencional_ure', label: 'PRETERINTENCIONAL — U.R.E', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'preterintencional_uro', label: 'PRETERINTENCIONAL — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // CULPOSO (POR OTROS HECHOS)
        { filaId: 'culposo_otros_hechos_urc', label: 'CULPOSO (POR OTROS HECHOS) — U.R.C', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'culposo_otros_hechos_urn', label: 'CULPOSO (POR OTROS HECHOS) — U.R.N', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'culposo_otros_hechos_urs', label: 'CULPOSO (POR OTROS HECHOS) — U.R.S', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'culposo_otros_hechos_ure', label: 'CULPOSO (POR OTROS HECHOS) — U.R.E', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'culposo_otros_hechos_uro', label: 'CULPOSO (POR OTROS HECHOS) — U.R.O', periodoAnterior: 0, periodoActual: 0 },

        // SIN FACTOR DE INCIDENCIA (P/INVEST.)
        { filaId: 'sin_factor_incidencia_urc', label: 'SIN FACTOR DE INCIDENCIA (P/INVEST.) — U.R.C', periodoAnterior: 1, periodoActual: 1 },
        { filaId: 'sin_factor_incidencia_urn', label: 'SIN FACTOR DE INCIDENCIA (P/INVEST.) — U.R.N', periodoAnterior: 2, periodoActual: 0 },
        { filaId: 'sin_factor_incidencia_urs', label: 'SIN FACTOR DE INCIDENCIA (P/INVEST.) — U.R.S', periodoAnterior: 0, periodoActual: 0 },
        { filaId: 'sin_factor_incidencia_ure', label: 'SIN FACTOR DE INCIDENCIA (P/INVEST.) — U.R.E', periodoAnterior: 1, periodoActual: 0 },
        { filaId: 'sin_factor_incidencia_uro', label: 'SIN FACTOR DE INCIDENCIA (P/INVEST.) — U.R.O', periodoAnterior: 0, periodoActual: 1 },

        // — Víctimas por ámbito/situación —
        { filaId: 'ambito_publico_victimas',      label: 'ÁMBITO PÚBLICO — Víctimas',       periodoAnterior: 29, periodoActual: 13 },
        { filaId: 'ambito_privado_victimas',      label: 'ÁMBITO PRIVADO — Víctimas',       periodoAnterior: 2,  periodoActual: 1  },
        { filaId: 'vivienda_particular_victimas', label: 'VIVIENDA PARTICULAR — Víctimas',  periodoAnterior: 8,  periodoActual: 5  },
        { filaId: 'contexto_encierro_victimas',   label: 'CONTEXTO DE ENCIERRO — Víctimas', periodoAnterior: 2,  periodoActual: 2  },
        // — Total víctimas —
        { filaId: 'total_victimas',               label: 'TOTALES — Víctimas',               periodoAnterior: 41, periodoActual: 21 },
      ],
    },

    // ─── HECHOS DE HOMICIDIOS DOLOSOS — POR UNIDAD REGIONAL ──────────────
    // Desagregación territorial del total de hechos (39 → 21) del cuadro anterior
    {
      tablaId: 'd3-homicidios-hechos-ur',
      nombre: 'Hechos de Homicidios Dolosos — Por Unidad Regional',
      datos: [
        { filaId: 'urc', label: 'U.R.C', periodoAnterior: 23, periodoActual: 14 },
        { filaId: 'urn', label: 'U.R.N', periodoAnterior: 7, periodoActual: 3 },
        { filaId: 'urs', label: 'U.R.S', periodoAnterior: 4, periodoActual: 1 },
        { filaId: 'ure', label: 'U.R.E', periodoAnterior: 3, periodoActual: 2 },
        { filaId: 'uro', label: 'U.R.O', periodoAnterior: 2, periodoActual: 1 },
      ],
    },

    // ─── TOTAL DE HOMICIDIOS — RESUMEN ────────────────────────────────────
    {
      tablaId: 'd3-homicidios-total',
      nombre: 'Total de Homicidios',
      datos: [
        { filaId: 'total_homicidios', label: 'TOTAL DE HOMICIDIOS', periodoAnterior: 41, periodoActual: 21 },
      ],
    },

    // ─── VÍCTIMAS DE HOMICIDIOS DOLOSOS — POR UNIDAD REGIONAL ────────────
    // Desagregación territorial del total de víctimas (41 → 21) del cuadro anterior
    {
      tablaId: 'd3-homicidios-victimas-ur',
      nombre: 'Víctimas de Homicidios Dolosos — Por Unidad Regional',
      datos: [
        { filaId: 'urc', label: 'U.R.C', periodoAnterior: 25, periodoActual: 14 },
        { filaId: 'urn', label: 'U.R.N', periodoAnterior: 7, periodoActual: 3 },
        { filaId: 'urs', label: 'U.R.S', periodoAnterior: 4, periodoActual: 1 },
        { filaId: 'ure', label: 'U.R.E', periodoAnterior: 3, periodoActual: 2 },
        { filaId: 'uro', label: 'U.R.O', periodoAnterior: 2, periodoActual: 1 },
      ],
    },

  ],
  d4: [
    {
      tablaId: 'd4-armamento',
      nombre: 'Armamento Total',
      datos: [
        {
          filaId: 'pistolas',
          label: 'PISTOLAS 9MM',
          periodoAnterior: 8500,
          periodoActual: 9200,
        },
        {
          filaId: 'escopetas',
          label: 'ESCOPETAS',
          periodoAnterior: 1200,
          periodoActual: 1350,
        },
        {
          filaId: 'chalecos',
          label: 'CHALECOS ANTIBALAS',
          periodoAnterior: 5600,
          periodoActual: 6100,
        },
      ],
    },
    {
      tablaId: 'd4-vehiculos',
      nombre: 'Vehículos',
      datos: [
        {
          filaId: 'patrulleros',
          label: 'PATRULLEROS',
          periodoAnterior: 450,
          periodoActual: 520,
        },
        {
          filaId: 'motos',
          label: 'MOTOCICLETAS',
          periodoAnterior: 380,
          periodoActual: 420,
        },
        {
          filaId: 'otros',
          label: 'OTROS VEHÍCULOS',
          periodoAnterior: 120,
          periodoActual: 145,
        },
      ],
    },
  ],
  d2: [
    {
      tablaId: 'd2-privados-libertad',
      nombre: 'Privados de Libertad',
      datos: [
        {
          filaId: 'procesal',
          label: 'PROCESAL',
          periodoAnterior: 0,
          periodoActual: 0,
        },
        {
          filaId: 'contravencional',
          label: 'CONTRAVENCIONAL',
          periodoAnterior: 0,
          periodoActual: 0,
        },
      ],
    },
    {
      tablaId: 'd2-procedimientos',
      nombre: 'Procedimientos',
      datos: [
        {
          filaId: 'allanamientos_positivos',
          label: 'ALLANAMIENTOS POSITIVOS',
          periodoAnterior: 0,
          periodoActual: 0,
        },
        {
          filaId: 'allanamientos_negativos',
          label: 'ALLANAMIENTOS NEGATIVOS',
          periodoAnterior: 0,
          periodoActual: 0,
        },
      ],
    },
    {
      tablaId: 'd2-secuestros',
      nombre: 'Secuestros',
      datos: [
        {
          filaId: 'vehiculos',
          label: 'VEHÍCULOS',
          periodoAnterior: 0,
          periodoActual: 0,
        },
        {
          filaId: 'motocicletas',
          label: 'MOTOCICLETAS',
          periodoAnterior: 0,
          periodoActual: 0,
        },
        {
          filaId: 'armas_fuego',
          label: 'ARMAS DE FUEGO',
          periodoAnterior: 0,
          periodoActual: 0,
        },
        {
          filaId: 'celulares',
          label: 'CELULARES',
          periodoAnterior: 0,
          periodoActual: 0,
        },
        {
          filaId: 'dispositivos_electronicos',
          label: 'DISPOSITIVOS ELECTRÓNICOS',
          periodoAnterior: 0,
          periodoActual: 0,
        },
        {
          filaId: 'otros',
          label: 'OTROS',
          periodoAnterior: 0,
          periodoActual: 0,
        },
      ],
    },
  ],
  d5: [
    {
      tablaId: 'd5-detenidos-procesales',
      nombre: 'Detenidos Procesales',
      datos: [
        {
          filaId: 'total_detenidos',
          label: 'TOTAL DETENIDOS',
          periodoAnterior: 3456,
          periodoActual: 3789,
        },
        {
          filaId: 'con_pendientes',
          label: 'CON PENDIENTES',
          periodoAnterior: 567,
          periodoActual: 623,
        },
      ],
    },
  ],
  asuntos_internos: [
    {
      tablaId: 'ai-denuncias',
      nombre: 'Denuncias Recibidas',
      datos: [
        {
          filaId: 'abuso_autoridad',
          label: 'ABUSO DE AUTORIDAD',
          periodoAnterior: 45,
          periodoActual: 38,
        },
        {
          filaId: 'negligencia',
          label: 'NEGLIGENCIA',
          periodoAnterior: 67,
          periodoActual: 54,
        },
        {
          filaId: 'abandono',
          label: 'ABANDONO DE SERVICIO',
          periodoAnterior: 23,
          periodoActual: 19,
        },
      ],
    },
  ],
  delitos_rurales: [
    {
      tablaId: 'dr-delitos-tipo',
      nombre: 'Delitos por Tipo',
      datos: [
        {
          filaId: 'abigeato',
          label: 'ABIGEATO',
          periodoAnterior: 234,
          periodoActual: 198,
        },
        {
          filaId: 'robo_maquinaria',
          label: 'ROBO DE MAQUINARIA',
          periodoAnterior: 56,
          periodoActual: 43,
        },
      ],
    },
  ],
  digedrop: [
    {
      tablaId: 'digedrop-sustancias',
      nombre: 'Sustancias Secuestradas',
      datos: [
        {
          filaId: 'cocaina',
          label: 'COCAÍNA (kg)',
          periodoAnterior: 156.5,
          periodoActual: 189.3,
        },
        {
          filaId: 'marihuana',
          label: 'MARIHUANA (kg)',
          periodoAnterior: 2345.8,
          periodoActual: 2890.4,
        },
        {
          filaId: 'pasta_base',
          label: 'PASTA BASE (kg)',
          periodoAnterior: 45.2,
          periodoActual: 67.8,
        },
      ],
    },
    {
      tablaId: 'digedrop-operativos',
      nombre: 'Operativos Realizados',
      datos: [
        {
          filaId: 'allanamientos',
          label: 'ALLANAMIENTOS',
          periodoAnterior: 234,
          periodoActual: 287,
        },
        {
          filaId: 'detenidos',
          label: 'DETENIDOS',
          periodoAnterior: 456,
          periodoActual: 534,
        },
      ],
    },
  ],
  prevencion_ciudadana: [
    {
      tablaId: 'pc-operativos',
      nombre: 'Operativos de Prevención',
      datos: [
        {
          filaId: 'operativos',
          label: 'OPERATIVOS REALIZADOS',
          periodoAnterior: 1234,
          periodoActual: 1567,
        },
        {
          filaId: 'personas',
          label: 'PERSONAS IDENTIFICADAS',
          periodoAnterior: 5678,
          periodoActual: 6789,
        },
      ],
    },
  ],
  unidades_especiales: [
    {
      tablaId: 'ue-intervenciones',
      nombre: 'Intervenciones',
      datos: [
        {
          filaId: 'goe',
          label: 'GOE',
          periodoAnterior: 89,
          periodoActual: 102,
        },
        {
          filaId: 'bomberos',
          label: 'BOMBEROS',
          periodoAnterior: 345,
          periodoActual: 398,
        },
        {
          filaId: 'canes',
          label: 'CANES',
          periodoAnterior: 123,
          periodoActual: 156,
        },
      ],
    },
  ],
  institutos: [
    {
      tablaId: 'inst-formacion',
      nombre: 'Formación',
      datos: [
        {
          filaId: 'aspirantes',
          label: 'ASPIRANTES EN FORMACIÓN',
          periodoAnterior: 456,
          periodoActual: 523,
        },
        {
          filaId: 'egresados',
          label: 'EGRESADOS',
          periodoAnterior: 234,
          periodoActual: 267,
        },
      ],
    },
  ],
  unidades_regionales: [
    {
      tablaId: 'ur-resumen',
      nombre: 'Resumen por Regional',
      datos: [
        {
          filaId: 'ur_capital',
          label: 'UR CAPITAL',
          periodoAnterior: 2345,
          periodoActual: 2567,
        },
        {
          filaId: 'ur_norte',
          label: 'UR NORTE',
          periodoAnterior: 1234,
          periodoActual: 1456,
        },
        {
          filaId: 'ur_sur',
          label: 'UR SUR',
          periodoAnterior: 987,
          periodoActual: 1023,
        },
        {
          filaId: 'ur_este',
          label: 'UR ESTE',
          periodoAnterior: 756,
          periodoActual: 834,
        },
        {
          filaId: 'ur_oeste',
          label: 'UR OESTE',
          periodoAnterior: 654,
          periodoActual: 723,
        },
      ],
    },
  ],
};

const tablasInicialesEnCero: Record<string, TablaData[]> = Object.fromEntries(
  Object.entries(allTablas).map(([deptCodigo, tablas]) => [
    deptCodigo,
    // Conservar los valores para D1 y D3 (tablas con datos reales transcritos), cero para los demás
    deptCodigo === 'd1' || deptCodigo === 'd3'
      ? tablas
      : tablas.map(tabla => ({
        ...tabla,
        datos: tabla.datos.map(dato => ({
          ...dato,
          periodoAnterior: 0,
          periodoActual: 0,
        })),
      })),
  ])
);

async function seed() {
  const pool = new Pool({ connectionString: DATABASE_URL });
  const db = drizzle(pool, { schema });
  const ahora = new Date();
  const anioActual = ahora.getFullYear();
  const anioAnterior = anioActual - 1;
  const periodoInicial = {
    anteriorInicio: new Date(anioAnterior, 0, 1),
    anteriorFin: new Date(anioAnterior, 11, 31, 23, 59, 59),
    anteriorLabel: `Período anterior ${anioAnterior}`,
    actualInicio: new Date(anioActual, 0, 1),
    actualFin: new Date(anioActual, 11, 31, 23, 59, 59),
    actualLabel: `Período actual ${anioActual}`,
    activo: true,
  };

  console.log('🌱 Iniciando seed de la base de datos SIGEP v2...\n');

  try {
    // Limpiar tablas en orden correcto
    console.log('🧹 Limpiando datos existentes...');
    await pool.query('DELETE FROM estadisticas_anuales');
    await pool.query('DELETE FROM estadisticas_mensuales');
    await pool.query('DELETE FROM estadisticas_diarias');
    await pool.query('DELETE FROM historial_cambios');
    await pool.query('DELETE FROM snapshots');
    await pool.query('DELETE FROM datos_comparativos');
    await pool.query('DELETE FROM tablas_config');
    await pool.query('DELETE FROM permisos');
    await pool.query('DELETE FROM refresh_tokens');
    await pool.query('DELETE FROM usuarios');
    await pool.query('DELETE FROM departamentos');
    await pool.query('DELETE FROM config_global');
    await pool.query('DELETE FROM config_periodos');

    // Config global
    console.log('⚙️ Creando configuración global...');
    await db.insert(schema.configGlobal).values({ edicionHabilitada: false });
    await db.insert(schema.configPeriodos).values(periodoInicial);

    // Departamentos
    console.log('🏢 Creando departamentos...');
    const deptMap = new Map<string, string>();
    for (const dept of departamentosData) {
      const [created] = await db
        .insert(schema.departamentos)
        .values(dept)
        .returning({ id: schema.departamentos.id });
      deptMap.set(dept.codigo, created.id);
      console.log(`   ✓ ${dept.nombre}`);
    }

    // Usuarios
    console.log('\n👥 Creando usuarios...');
    for (const userData of usuariosData) {
      const passwordHash = await hashPassword(userData.password);
      const departamentoId = userData.departamento
        ? deptMap.get(userData.departamento) || null
        : null;

      const [user] = await db
        .insert(schema.usuarios)
        .values({
          username: userData.username,
          passwordHash,
          nombre: userData.nombre,
          rol: userData.rol,
          color: userData.color,
          departamentoId,
        })
        .returning({ id: schema.usuarios.id });

      for (const tipo of userData.permisos) {
        await db.insert(schema.permisos).values({
          usuarioId: user.id,
          tipo,
        });
      }
      console.log(
        `   ✓ ${userData.username} (${userData.permisos.join(', ')})`
      );
    }

    // Tablas y datos comparativos por departamento
    for (const [deptCodigo, tablas] of Object.entries(tablasInicialesEnCero)) {
      const deptId = deptMap.get(deptCodigo);
      if (!deptId) continue;
      console.log(`\n📊 Creando tablas ${deptCodigo}...`);

      for (let i = 0; i < tablas.length; i++) {
        const tabla = tablas[i];
        const [tablaConfig] = await db
          .insert(schema.tablasConfig)
          .values({
            tablaId: tabla.tablaId,
            nombre: tabla.nombre,
            departamentoId: deptId,
            orden: i,
          })
          .returning({ id: schema.tablasConfig.id });

        for (let j = 0; j < tabla.datos.length; j++) {
          const dato = tabla.datos[j];
          await db.insert(schema.datosComparativos).values({
            tablaConfigId: tablaConfig.id,
            filaId: dato.filaId,
            label: dato.label,
            periodoAnterior: String(dato.periodoAnterior),
            periodoActual: String(dato.periodoActual),
            orden: j,
          });
        }
        console.log(`   ✓ ${tabla.nombre}`);
      }
    }

    console.log('\n✅ Seed completado exitosamente!');
    console.log('\n🔑 Credenciales de superadmin:');
    console.log('   Usuario: superadmin');
    console.log('   Contraseña: SIGEP_Admin#2024!');
  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seed();

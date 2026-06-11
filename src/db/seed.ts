import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import * as schema from './schema';
import { createD1SeedTables } from '../lib/d1-definition';
import { createD3SeedTables } from '../lib/d3-definition';
import { createD4SeedTables } from '../lib/d4-transform';
import { createD5SeedTables } from '../lib/d5-transform';
import { createAsuntosInternosSeedTables } from '../lib/asuntos-internos-transform';

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
          { filaId: 'abandono_servicio', label: 'Abandono de servicio', periodoAnterior: 38, periodoActual: 45 },
          { filaId: 'abandono_servicio_pasivo_proceso', label: 'Aband. Serv. // Pasiv. Proceso', periodoAnterior: 1, periodoActual: 4 },
          { filaId: 'disponible_art_114_inc_1', label: 'Disponible Art. 114 inc. 1 ley 3823', periodoAnterior: 1, periodoActual: 3 },
          { filaId: 'disponible_art_203_inc_a', label: 'Disponible Art. 203 inc. A ley 3823', periodoAnterior: 1, periodoActual: 0 },
          { filaId: 'disponible_art_203_inc_b', label: 'Disponible Art. 203 inc. B ley 3823', periodoAnterior: 5, periodoActual: 8 },
          { filaId: 'disponible_por_enf_art_114_inc_2', label: 'Disponible por Enf. Art. 114 inc. 2 Ley 3823', periodoAnterior: 35, periodoActual: 31 },
          { filaId: 'disponible_por_enf_art_114_inc_2_art', label: 'Disponible por Enf. Art. 114 inc. 2 Ley 3823 ART', periodoAnterior: 16, periodoActual: 9 },
          { filaId: 'licencia_especial_sin_goce', label: 'Licencia especial sin goce de sueldo', periodoAnterior: 10, periodoActual: 9 },
          { filaId: 'pasivo_por_enf_art_116', label: 'Pasivo por Enf. Art. 116 Ley 3823', periodoAnterior: 7, periodoActual: 7 },
          { filaId: 'pasivo_por_enf_art_116_art', label: 'Pasivo por Enf. Art. 116 Ley 3823 ART', periodoAnterior: 1, periodoActual: 2 },
          { filaId: 'pasivo_por_enf_art_119_inc_1', label: 'Pasivo por Enf. Art. 119 inc. 1 Ley 3823', periodoAnterior: 37, periodoActual: 33 },
          { filaId: 'pasivo_por_enf_art_119_inc_1_art', label: 'Pasivo por Enf. Art. 119 inc. 1 Ley 3823 ART', periodoAnterior: 1, periodoActual: 5 },
          { filaId: 'pasivo_por_enf_art_119_inc_5', label: 'Pasivo por Enf. Art. 119 inc. 5 Ley 3823', periodoAnterior: 66, periodoActual: 52 },
          { filaId: 'pasivo_por_enf_art_119_inc_6', label: 'Pasivo por Enf. Art. 119 inc. 6 Ley 3823', periodoAnterior: 3, periodoActual: 3 },
          { filaId: 'renuncia_en_tramite', label: 'Renuncia en trámite', periodoAnterior: 13, periodoActual: 14 },
          { filaId: 'serv_efect_enfermedad_art_111_inc_2', label: 'Serv. Efect. Enfermedad Art. 111 inc. 2 Ley 3823', periodoAnterior: 26, periodoActual: 46 },
          { filaId: 'baja_laboral_art', label: 'Baja laboral ART', periodoAnterior: 73, periodoActual: 72 },
          { filaId: 'desafectacion_ptp', label: 'Desafectación de PTP', periodoAnterior: 13, periodoActual: 2 },
          { filaId: 'desvinculacion_ptp', label: 'Desvinculación PTP', periodoAnterior: 2, periodoActual: 0 },
        ],
      }
);

const d3SeedBase = createD3SeedTables();
const d3Seed = d3SeedBase.map(table => {
  if (table.tablaId === 'd3-delitos-propiedad-uurr') {
    return {
      ...table,
      datos: [
        { filaId: 'urc', label: 'U.R.C', periodoAnterior: 9059, periodoActual: 8915 },
        { filaId: 'urn', label: 'U.R.N', periodoAnterior: 2722, periodoActual: 2247 },
        { filaId: 'urs', label: 'U.R.S', periodoAnterior: 1714, periodoActual: 955 },
        { filaId: 'ure', label: 'U.R.E', periodoAnterior: 2271, periodoActual: 1820 },
        { filaId: 'uro', label: 'U.R.O', periodoAnterior: 1618, periodoActual: 1458 },
      ],
    };
  }
  if (table.tablaId === 'd3-suicidios-total') {
    return {
      ...table,
      datos: [
        { filaId: 'total_provincial', label: 'TOTAL PROVINCIAL', periodoAnterior: 100, periodoActual: 117 },
      ],
    };
  }
  if (table.tablaId === 'd3-suicidios-sexo') {
    return {
      ...table,
      datos: [
        { filaId: 'masculino', label: 'MASCULINO', periodoAnterior: 71, periodoActual: 95 },
        { filaId: 'femenino', label: 'FEMENINO', periodoAnterior: 29, periodoActual: 22 },
      ],
    };
  }
  if (table.tablaId === 'd3-suicidios-modalidades') {
    return {
      ...table,
      datos: [
        { filaId: 'ahorcamiento',   label: 'AHORCAMIENTO',   periodoAnterior: 84, periodoActual: 100 },
        { filaId: 'arma_fuego',     label: 'ARMA DE FUEGO',  periodoAnterior: 12, periodoActual: 13 },
        { filaId: 'arma_blanca',    label: 'ARMA BLANCA',    periodoAnterior: 1,  periodoActual: 0 },
        { filaId: 'quemaduras',     label: 'QUEMADURAS',     periodoAnterior: 1,  periodoActual: 3 },
        { filaId: 'envenenamiento', label: 'ENVENENAMIENTO', periodoAnterior: 0,  periodoActual: 1 },
        { filaId: 'otros',          label: 'OTROS',          periodoAnterior: 2,  periodoActual: 0 },
      ],
    };
  }
  if (table.tablaId === 'd3-homicidios-dolosos' || table.tablaId === 'd3-homicidios-victimas') {
    const homicidiosDolososDatos = [
      { filaId: 'ambito_publico_urc', label: 'ÁMBITO PÚBLICO - U.R.C', periodoAnterior: 19, periodoActual: 8 },
      { filaId: 'ambito_publico_urn', label: 'ÁMBITO PÚBLICO - U.R.N', periodoAnterior: 3, periodoActual: 2 },
      { filaId: 'ambito_publico_urs', label: 'ÁMBITO PÚBLICO - U.R.S', periodoAnterior: 3, periodoActual: 1 },
      { filaId: 'ambito_publico_ure', label: 'ÁMBITO PÚBLICO - U.R.E', periodoAnterior: 1, periodoActual: 1 },
      { filaId: 'ambito_publico_uro', label: 'ÁMBITO PÚBLICO - U.R.O', periodoAnterior: 1, periodoActual: 1 },

      { filaId: 'ambito_privado_urc', label: 'ÁMBITO PRIVADO - U.R.C', periodoAnterior: 0, periodoActual: 1 },
      { filaId: 'ambito_privado_urn', label: 'ÁMBITO PRIVADO - U.R.N', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'ambito_privado_urs', label: 'ÁMBITO PRIVADO - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'ambito_privado_ure', label: 'ÁMBITO PRIVADO - U.R.E', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'ambito_privado_uro', label: 'ÁMBITO PRIVADO - U.R.O', periodoAnterior: 1, periodoActual: 0 },

      { filaId: 'vivienda_urc', label: 'VIVIENDA PARTICULAR - U.R.C', periodoAnterior: 2, periodoActual: 5 },
      { filaId: 'vivienda_urn', label: 'VIVIENDA PARTICULAR - U.R.N', periodoAnterior: 3, periodoActual: 0 },
      { filaId: 'vivienda_urs', label: 'VIVIENDA PARTICULAR - U.R.S', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'vivienda_ure', label: 'VIVIENDA PARTICULAR - U.R.E', periodoAnterior: 2, periodoActual: 0 },
      { filaId: 'vivienda_uro', label: 'VIVIENDA PARTICULAR - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'encierro_urc', label: 'CONTEXTO DE ENCIERRO - U.R.C', periodoAnterior: 2, periodoActual: 0 },
      { filaId: 'encierro_urn', label: 'CONTEXTO DE ENCIERRO - U.R.N', periodoAnterior: 0, periodoActual: 1 },
      { filaId: 'encierro_urs', label: 'CONTEXTO DE ENCIERRO - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'encierro_ure', label: 'CONTEXTO DE ENCIERRO - U.R.E', periodoAnterior: 0, periodoActual: 1 },
      { filaId: 'encierro_uro', label: 'CONTEXTO DE ENCIERRO - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_interpersonal_urc', label: 'VIOLENCIA INTERPERSONAL - U.R.C', periodoAnterior: 6, periodoActual: 1 },
      { filaId: 'movil_interpersonal_urn', label: 'VIOLENCIA INTERPERSONAL - U.R.N', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_interpersonal_urs', label: 'VIOLENCIA INTERPERSONAL - U.R.S', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_interpersonal_ure', label: 'VIOLENCIA INTERPERSONAL - U.R.E', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_interpersonal_uro', label: 'VIOLENCIA INTERPERSONAL - U.R.O', periodoAnterior: 1, periodoActual: 0 },

      { filaId: 'movil_intrafamiliar_urc', label: 'VIOLENCIA INTRAFAMILIAR - U.R.C', periodoAnterior: 1, periodoActual: 2 },
      { filaId: 'movil_intrafamiliar_urn', label: 'VIOLENCIA INTRAFAMILIAR - U.R.N', periodoAnterior: 2, periodoActual: 0 },
      { filaId: 'movil_intrafamiliar_urs', label: 'VIOLENCIA INTRAFAMILIAR - U.R.S', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_intrafamiliar_ure', label: 'VIOLENCIA INTRAFAMILIAR - U.R.E', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_intrafamiliar_uro', label: 'VIOLENCIA INTRAFAMILIAR - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_defensa_urc', label: 'LEGITIMA DEFENSA - U.R.C', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_defensa_urn', label: 'LEGITIMA DEFENSA - U.R.N', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_defensa_urs', label: 'LEGITIMA DEFENSA - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_defensa_ure', label: 'LEGITIMA DEFENSA - U.R.E', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_defensa_uro', label: 'LEGITIMA DEFENSA - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_robo_urc', label: 'OCASION DE ROBO - U.R.C', periodoAnterior: 5, periodoActual: 2 },
      { filaId: 'movil_robo_urn', label: 'OCASION DE ROBO - U.R.N', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_robo_urs', label: 'OCASION DE ROBO - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_robo_ure', label: 'OCASION DE ROBO - U.R.E', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_robo_uro', label: 'OCASION DE ROBO - U.R.O', periodoAnterior: 1, periodoActual: 0 },

      { filaId: 'movil_policial_urc', label: 'INTERVENCION POLICIAL - U.R.C', periodoAnterior: 3, periodoActual: 1 },
      { filaId: 'movil_policial_urn', label: 'INTERVENCION POLICIAL - U.R.N', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_policial_urs', label: 'INTERVENCION POLICIAL - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_policial_ure', label: 'INTERVENCION POLICIAL - U.R.E', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_policial_uro', label: 'INTERVENCION POLICIAL - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_ajuste_urc', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.C', periodoAnterior: 3, periodoActual: 1 },
      { filaId: 'movil_ajuste_urn', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.N', periodoAnterior: 0, periodoActual: 1 },
      { filaId: 'movil_ajuste_urs', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_ajuste_ure', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.E', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_ajuste_uro', label: 'POSIBLE AJUSTE DE CUENTAS - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_femicidio_urc', label: 'FEMICIDIO - U.R.C', periodoAnterior: 1, periodoActual: 6 },
      { filaId: 'movil_femicidio_urn', label: 'FEMICIDIO - U.R.N', periodoAnterior: 0, periodoActual: 1 },
      { filaId: 'movil_femicidio_urs', label: 'FEMICIDIO - U.R.S', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_femicidio_ure', label: 'FEMICIDIO - U.R.E', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_femicidio_uro', label: 'FEMICIDIO - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_pasional_urc', label: 'CONFLICTO PASIONAL - U.R.C', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_pasional_urn', label: 'CONFLICTO PASIONAL - U.R.N', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_pasional_urs', label: 'CONFLICTO PASIONAL - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_pasional_ure', label: 'CONFLICTO PASIONAL - U.R.E', periodoAnterior: 0, periodoActual: 1 },
      { filaId: 'movil_pasional_uro', label: 'CONFLICTO PASIONAL - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_rina_urc', label: 'RIÑA - U.R.C', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_rina_urn', label: 'RIÑA - U.R.N', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_rina_urs', label: 'RIÑA - U.R.S', periodoAnterior: 0, periodoActual: 1 },
      { filaId: 'movil_rina_ure', label: 'RIÑA - U.R.E', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_rina_uro', label: 'RIÑA - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_encierro_urc', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.C', periodoAnterior: 2, periodoActual: 0 },
      { filaId: 'movil_encierro_urn', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.N', periodoAnterior: 0, periodoActual: 1 },
      { filaId: 'movil_encierro_urs', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_encierro_ure', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.E', periodoAnterior: 0, periodoActual: 1 },
      { filaId: 'movil_encierro_uro', label: 'CONFLICTO EN CONTEXTO DE ENCIERRO - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_preterintencional_urc', label: 'PRETERINTENCIONAL - U.R.C', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_preterintencional_urn', label: 'PRETERINTENCIONAL - U.R.N', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_preterintencional_urs', label: 'PRETERINTENCIONAL - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_preterintencional_ure', label: 'PRETERINTENCIONAL - U.R.E', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_preterintencional_uro', label: 'PRETERINTENCIONAL - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_culposo_urc', label: 'CULPOSO (POR OTROS HECHOS) - U.R.C', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_culposo_urn', label: 'CULPOSO (POR OTROS HECHOS) - U.R.N', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_culposo_urs', label: 'CULPOSO (POR OTROS HECHOS) - U.R.S', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_culposo_ure', label: 'CULPOSO (POR OTROS HECHOS) - U.R.E', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_culposo_uro', label: 'CULPOSO (POR OTROS HECHOS) - U.R.O', periodoAnterior: 0, periodoActual: 0 },

      { filaId: 'movil_sin_factor_urc', label: 'SIN FACTOR DE INCIDENCIA - U.R.C', periodoAnterior: 1, periodoActual: 1 },
      { filaId: 'movil_sin_factor_urn', label: 'SIN FACTOR DE INCIDENCIA - U.R.N', periodoAnterior: 2, periodoActual: 0 },
      { filaId: 'movil_sin_factor_urs', label: 'SIN FACTOR DE INCIDENCIA - U.R.S', periodoAnterior: 0, periodoActual: 0 },
      { filaId: 'movil_sin_factor_ure', label: 'SIN FACTOR DE INCIDENCIA - U.R.E', periodoAnterior: 1, periodoActual: 0 },
      { filaId: 'movil_sin_factor_uro', label: 'SIN FACTOR DE INCIDENCIA - U.R.O', periodoAnterior: 0, periodoActual: 1 },
    ];
    return {
      ...table,
      datos: homicidiosDolososDatos,
    };
  }
  return table;
});

const allTablas: Record<string, TablaData[]> = {
  d1: modifiedD1Seed,
  d3: d3Seed,
  d4: createD4SeedTables().map(t => ({
    tablaId: t.tablaId,
    nombre: t.nombre,
    datos: t.datos.map(d => ({
      filaId: d.filaId,
      label: d.label,
      periodoAnterior: d.periodoAnterior,
      periodoActual: d.periodoActual,
    })),
  })),
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
  d5: createD5SeedTables().map(t => ({
    tablaId: t.tablaId,
    nombre: t.nombre,
    datos: t.datos.map(d => ({
      filaId: d.filaId,
      label: d.label,
      periodoAnterior: d.periodoAnterior,
      periodoActual: d.periodoActual,
    })),
  })),
  asuntos_internos: createAsuntosInternosSeedTables().map(t => ({
    tablaId: t.tablaId,
    nombre: t.nombre,
    datos: t.datos.map(d => ({
      filaId: d.filaId,
      label: d.label,
      periodoAnterior: d.periodoAnterior,
      periodoActual: d.periodoActual,
    })),
  })),
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
    // Conservar los valores para D1, D3, D4, D5 y Asuntos Internos (tablas con datos transcritos reales), cero para los demás
    deptCodigo === 'd1' || deptCodigo === 'd3' || deptCodigo === 'd4' || deptCodigo === 'd5' || deptCodigo === 'asuntos_internos'
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

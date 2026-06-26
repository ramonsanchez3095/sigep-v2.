// ─────────────────────────────────────────────────────────────────────────────
// Prevención Ciudadana – Dirección General de Prevención Ciudadana
// Definición de tablas estructuradas para el dashboard de Prevención Ciudadana.
// ─────────────────────────────────────────────────────────────────────────────

export const PC_CORE_TABLE_IDS = [
  'pc-privados-libertad',
  'pc-llamadas-recibidas',
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS SIMPLE COMPARACIÓN
// ─────────────────────────────────────────────────────────────────────────────
export interface PCComparisonRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw table IDs in database
// ─────────────────────────────────────────────────────────────────────────────
export const PC_TABLE_IDS = {
  PRIVADOS_LIBERTAD: 'pc-privados-libertad',
  LLAMADAS_RECIBIDAS: 'pc-llamadas-recibidas',
  LLAMADAS_INTIMIDACION: 'pc-llamadas-intimidacion',
  CABINAS_VIGILANCIA: 'pc-cabinas-vigilancia',
  SERVICIOS_APORTADOS: 'pc-servicios-aportados',
  VEHICULOS_SUSTRAIDOS: 'pc-vehiculos-sustraidos',
  VEHICULOS_RECUPERADOS: 'pc-vehiculos-recuperados',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Privados de la Libertad
// ─────────────────────────────────────────────────────────────────────────────
export const PC_PRIVADOS_LIBERTAD_DEFAULT: PCComparisonRow[] = [
  { id: 'causas_procesales', label: 'CAUSAS PROCESALES', periodoAnterior: 3935, periodoActual: 7126 },
  { id: 'causas_violencia', label: 'CAUSAS VIOLENCIA', periodoAnterior: 678, periodoActual: 442 },
  { id: 'contravenciones', label: 'CONTRAVENCIONES', periodoAnterior: 2926, periodoActual: 7 },
  { id: 'estupefacientes', label: 'ESTUPEFACIENTES', periodoAnterior: 228, periodoActual: 583 },
  { id: 'recapturados', label: 'RECAPTURADOS', periodoAnterior: 357, periodoActual: 418 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. Llamadas Recibidas
// ─────────────────────────────────────────────────────────────────────────────
export const PC_LLAMADAS_RECIBIDAS_DEFAULT: PCComparisonRow[] = [
  { id: 'total_llamadas_recibidas', label: 'TOTAL', periodoAnterior: 273339, periodoActual: 226030 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. Llamadas por Intimidación Pública
// ─────────────────────────────────────────────────────────────────────────────
export const PC_LLAMADAS_INTIMIDACION_DEFAULT: PCComparisonRow[] = [
  { id: 'total_llamadas_intimidacion', label: 'TOTAL', periodoAnterior: 6, periodoActual: 2 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. División Cabinas de Vigilancia
// ─────────────────────────────────────────────────────────────────────────────
export const PC_CABINAS_VIGILANCIA_DEFAULT: PCComparisonRow[] = [
  { id: 'trailers', label: 'TRAILERS', periodoAnterior: 7, periodoActual: 20 },
  { id: 'cabinas', label: 'CABINAS', periodoAnterior: 51, periodoActual: 87 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. Servicios Aportados
// ─────────────────────────────────────────────────────────────────────────────
export const PC_SERVICIOS_APORTADOS_DEFAULT: PCComparisonRow[] = [
  { id: 'llamadas_improcedentes', label: 'LLAMADAS IMPROCEDENTES', periodoAnterior: 109996, periodoActual: 76566 },
  { id: 'llamadas_reiteradas', label: 'LLAMADAS REITERADAS', periodoAnterior: 37414, periodoActual: 36750 },
  { id: 'accidente_transito_victima', label: 'ACCIDENTE DE TRANSITO CON VICTIMA', periodoAnterior: 2392, periodoActual: 2512 },
  { id: 'accidente_transito_sin_victima', label: 'ACCIDENTE DE TRANSITO SIN VICTIMA', periodoAnterior: 685, periodoActual: 1006 },
  { id: 'apoyo_policial_persecucion', label: 'APOYO A PERSONAL POLICIAL / PERSECUSION', periodoAnterior: 491, periodoActual: 388 },
  { id: 'danos', label: 'DAÑOS', periodoAnterior: 1942, periodoActual: 2107 },
  { id: 'heridos', label: 'HERIDOS', periodoAnterior: 352, periodoActual: 423 },
  { id: 'lesiones', label: 'LESIONES', periodoAnterior: 1062, periodoActual: 1022 },
  { id: 'musica_alto_volumen', label: 'MUSICA A ALTO VOLUMEN', periodoAnterior: 4378, periodoActual: 5203 },
  { id: 'patrullaje_preventivo', label: 'PATRULLAJE PREVENTIVO', periodoAnterior: 1856, periodoActual: 2268 },
  { id: 'pedido_auxilio', label: 'PEDIDO DE AUXILIO', periodoAnterior: 1266, periodoActual: 907 },
  { id: 'robo', label: 'ROBO', periodoAnterior: 6241, periodoActual: 4526 },
  { id: 'robo_en_proceso', label: 'ROBO EN PROCESO', periodoAnterior: 3882, periodoActual: 2991 },
  { id: 'sospechosos', label: 'SOSPECHOSOS', periodoAnterior: 5237, periodoActual: 4631 },
  { id: 'tentativa_robo', label: 'TENTATIVA DE ROBO', periodoAnterior: 2812, periodoActual: 2344 },
  { id: 'tiroteo', label: 'TIROTEO', periodoAnterior: 1090, periodoActual: 1151 },
  { id: 'violencia_genero', label: 'VIOLENCIA DE GENERO', periodoAnterior: 6913, periodoActual: 6791 },
  { id: 'violencia_familiar', label: 'VIOLENCIA FAMILIAR', periodoAnterior: 8512, periodoActual: 8875 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. Vehículos Sustraídos / Recuperados (mensual)
// ─────────────────────────────────────────────────────────────────────────────

export const PC_MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO',
  'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
] as const;

export type PCMes = typeof PC_MESES[number];

export interface PCVehiculoMesRow {
  mes: PCMes;
  anio: 2024 | 2025;
  moto: number;
  automovil: number;
  camioneta: number;
  camion: number;
  utilitario: number;
  tractor: number;
}

export const PC_VEHICULOS_SUSTRAIDOS_DEFAULT: PCVehiculoMesRow[] = [
  { mes: 'ENERO', anio: 2024, moto: 222, automovil: 11, camioneta: 7, camion: 0, utilitario: 3, tractor: 0 },
  { mes: 'ENERO', anio: 2025, moto: 134, automovil: 6, camioneta: 3, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'FEBRERO', anio: 2024, moto: 248, automovil: 10, camioneta: 7, camion: 0, utilitario: 3, tractor: 0 },
  { mes: 'FEBRERO', anio: 2025, moto: 121, automovil: 7, camioneta: 3, camion: 0, utilitario: 0, tractor: 1 },
  { mes: 'MARZO', anio: 2024, moto: 213, automovil: 11, camioneta: 5, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'MARZO', anio: 2025, moto: 142, automovil: 10, camioneta: 5, camion: 0, utilitario: 1, tractor: 0 },
  { mes: 'ABRIL', anio: 2024, moto: 195, automovil: 11, camioneta: 3, camion: 1, utilitario: 0, tractor: 0 },
  { mes: 'ABRIL', anio: 2025, moto: 148, automovil: 7, camioneta: 1, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'MAYO', anio: 2024, moto: 198, automovil: 10, camioneta: 0, camion: 0, utilitario: 1, tractor: 0 },
  { mes: 'MAYO', anio: 2025, moto: 154, automovil: 5, camioneta: 1, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'JUNIO', anio: 2024, moto: 189, automovil: 5, camioneta: 1, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'JUNIO', anio: 2025, moto: 159, automovil: 10, camioneta: 3, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'JULIO', anio: 2024, moto: 220, automovil: 7, camioneta: 5, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'JULIO', anio: 2025, moto: 151, automovil: 5, camioneta: 1, camion: 0, utilitario: 3, tractor: 0 },
  // Resto del año en cero
  { mes: 'AGOSTO', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'AGOSTO', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'SEPTIEMBRE', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'SEPTIEMBRE', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'OCTUBRE', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'OCTUBRE', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'NOVIEMBRE', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'NOVIEMBRE', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'DICIEMBRE', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'DICIEMBRE', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
];

export const PC_VEHICULOS_RECUPERADOS_DEFAULT: PCVehiculoMesRow[] = [
  { mes: 'ENERO', anio: 2024, moto: 81, automovil: 10, camioneta: 6, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'ENERO', anio: 2025, moto: 105, automovil: 8, camioneta: 3, camion: 1, utilitario: 0, tractor: 0 },
  { mes: 'FEBRERO', anio: 2024, moto: 111, automovil: 17, camioneta: 10, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'FEBRERO', anio: 2025, moto: 105, automovil: 4, camioneta: 1, camion: 1, utilitario: 0, tractor: 0 },
  { mes: 'MARZO', anio: 2024, moto: 92, automovil: 10, camioneta: 3, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'MARZO', anio: 2025, moto: 114, automovil: 9, camioneta: 8, camion: 2, utilitario: 0, tractor: 0 },
  { mes: 'ABRIL', anio: 2024, moto: 197, automovil: 9, camioneta: 3, camion: 1, utilitario: 0, tractor: 0 },
  { mes: 'ABRIL', anio: 2025, moto: 102, automovil: 8, camioneta: 3, camion: 1, utilitario: 0, tractor: 0 },
  { mes: 'MAYO', anio: 2024, moto: 203, automovil: 12, camioneta: 3, camion: 1, utilitario: 0, tractor: 0 },
  { mes: 'MAYO', anio: 2025, moto: 120, automovil: 16, camioneta: 5, camion: 1, utilitario: 0, tractor: 0 },
  { mes: 'JUNIO', anio: 2024, moto: 172, automovil: 7, camioneta: 5, camion: 3, utilitario: 0, tractor: 0 },
  { mes: 'JUNIO', anio: 2025, moto: 101, automovil: 17, camioneta: 6, camion: 0, utilitario: 1, tractor: 1 },
  { mes: 'JULIO', anio: 2024, moto: 148, automovil: 4, camioneta: 2, camion: 1, utilitario: 0, tractor: 0 },
  { mes: 'JULIO', anio: 2025, moto: 123, automovil: 7, camioneta: 8, camion: 1, utilitario: 2, tractor: 0 },
  // Resto del año en cero
  { mes: 'AGOSTO', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'AGOSTO', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'SEPTIEMBRE', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'SEPTIEMBRE', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'OCTUBRE', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'OCTUBRE', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'NOVIEMBRE', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'NOVIEMBRE', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'DICIEMBRE', anio: 2024, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
  { mes: 'DICIEMBRE', anio: 2025, moto: 0, automovil: 0, camioneta: 0, camion: 0, utilitario: 0, tractor: 0 },
];

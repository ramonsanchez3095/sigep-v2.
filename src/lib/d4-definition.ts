// ─────────────────────────────────────────────────────────────────────────────
// D4 – Departamento de Logística
// Definición de tablas estructuradas para el dashboard de logística.
// ─────────────────────────────────────────────────────────────────────────────

export const D4_CORE_TABLE_IDS = [
  'd4-armamento-total',
  'd4-vehiculos-policia',
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLA 1 – Cantidad Total de Armamento (comparativa con diferencia y %)
// ─────────────────────────────────────────────────────────────────────────────
export interface D4ArmamentoRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

export const D4_ARMAMENTO_ROWS: D4ArmamentoRow[] = [
  { id: 'escopetas_12_70', label: 'ESCOPETAS 12/70', periodoAnterior: 0, periodoActual: 0 },
  { id: 'chalecos_balisticos', label: 'CHALECOS BALÍSTICOS', periodoAnterior: 0, periodoActual: 0 },
  { id: 'pistolas_9mm', label: 'PISTOLAS CAL. 9MM', periodoAnterior: 0, periodoActual: 0 },
  { id: 'armas_menos_letales', label: 'ARMAS MENOS LETALES', periodoAnterior: 0, periodoActual: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLA 2 – Proyecciones de Compras (comparativa con diferencia y %)
// ─────────────────────────────────────────────────────────────────────────────
export const D4_PROYECCIONES_ROWS: D4ArmamentoRow[] = [
  { id: 'escopetas_12_70', label: 'ESCOPETAS 12/70', periodoAnterior: 0, periodoActual: 0 },
  { id: 'chalecos_balisticos', label: 'CHALECOS BALÍSTICOS', periodoAnterior: 0, periodoActual: 0 },
  { id: 'pistolas_9mm', label: 'PISTOLAS CAL. 9MM', periodoAnterior: 0, periodoActual: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLA 3 – Adquisición Año (listado con Características, Cantidad, Marca)
// ─────────────────────────────────────────────────────────────────────────────
export interface D4AdquisicionRow {
  id: string;
  caracteristica: string;
  cantidad: number;
  marca: string;
  obs?: string;
  fecha?: string;
  anio: 2024 | 2025;
}

export const D4_ADQUISICION_DEFAULT: D4AdquisicionRow[] = [
  { id: 'adq_2024_chalecos', caracteristica: 'CHALECOS BALÍSTICOS', cantidad: 0, marca: '', anio: 2024 },
  { id: 'adq_2024_escopetas', caracteristica: 'ESCOPETAS 12/70', cantidad: 0, marca: '', anio: 2024 },
  { id: 'adq_2024_pistolas', caracteristica: 'PISTOLAS CAL. 9MM', cantidad: 0, marca: '', anio: 2024 },
  { id: 'adq_2025_armas_1', caracteristica: 'ARMAS MENOS LETALES', cantidad: 0, marca: '', obs: '', fecha: '', anio: 2025 },
  { id: 'adq_2025_armas_2', caracteristica: 'ARMAS MENOS LETALES', cantidad: 0, marca: '', obs: '', fecha: '', anio: 2025 },
  { id: 'adq_2025_armas_3', caracteristica: 'ARMAS MENOS LETALES', cantidad: 0, marca: '', obs: '', fecha: '', anio: 2025 },
  { id: 'adq_2025_pistolas', caracteristica: 'PISTOLAS CAL. 9MM', cantidad: 0, marca: '', obs: '', fecha: '', anio: 2025 },
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLA 4a – Vehículos Policiales (período 01/01 al 31/07 2024/2025)
// ─────────────────────────────────────────────────────────────────────────────
export interface D4VehiculoRow {
  id: string;
  tipo: string;
  enServicio2024: number;
  fueraServicio2024: number;
  enServicio2025: number;
  fueraServicio2025: number;
}

export const D4_VEHICULOS_POLICIA_DEFAULT: D4VehiculoRow[] = [
  { id: 'autobomba', tipo: 'AUTOBOMBA', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
  { id: 'automovil', tipo: 'AUTOMÓVIL', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
  { id: 'camion', tipo: 'CAMIÓN', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
  { id: 'camion_guinche', tipo: 'CAMIÓN GUINCHE', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
  { id: 'camioneta', tipo: 'CAMIONETA', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
  { id: 'cuatri', tipo: 'CUATRI', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
  { id: 'furgon', tipo: 'FURGÓN', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
  { id: 'motocicleta', tipo: 'MOTOCICLETA', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLA 4b – Vehículos del Ministerio de Seguridad
// ─────────────────────────────────────────────────────────────────────────────
export const D4_VEHICULOS_MINISTERIO_DEFAULT: D4VehiculoRow[] = [
  { id: 'camioneta', tipo: 'CAMIONETA', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
  { id: 'motocicleta', tipo: 'MOTOCICLETA', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
  { id: 'autos', tipo: 'AUTOS', enServicio2024: 0, fueraServicio2024: 0, enServicio2025: 0, fueraServicio2025: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLA 5 – Móviles con Sistema de Rastreo Instalado (mensual)
// ─────────────────────────────────────────────────────────────────────────────

export const D4_MESES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO',
  'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
] as const;

export type D4Mes = typeof D4_MESES[number];

export interface D4RastreoMesRow {
  mes: D4Mes;
  anio: 2024 | 2025;
  camionetaFurgon: number;
  motos: number;
  autos: number;
  camion: number;
  totalFacturado: number;
  totalParque: number;
}

export function createEmptyRastreoRows(): D4RastreoMesRow[] {
  const rows: D4RastreoMesRow[] = [];
  for (const mes of D4_MESES) {
    rows.push({ mes, anio: 2024, camionetaFurgon: 0, motos: 0, autos: 0, camion: 0, totalFacturado: 0, totalParque: 0 });
    rows.push({ mes, anio: 2025, camionetaFurgon: 0, motos: 0, autos: 0, camion: 0, totalFacturado: 0, totalParque: 0 });
  }
  return rows;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw table IDs used in the database as tablaId
// ─────────────────────────────────────────────────────────────────────────────
export const D4_TABLE_IDS = {
  ARMAMENTO: 'd4-armamento-total',
  PROYECCIONES: 'd4-proyecciones-compras',
  ADQUISICION: 'd4-adquisicion',
  VEHICULOS_POLICIA: 'd4-vehiculos-policia',
  VEHICULOS_MINISTERIO: 'd4-vehiculos-ministerio',
  RASTREO: 'd4-rastreo-moviles',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// DIGEDROP – Dirección General de Drogas Peligrosas
// Definición de tablas estructuradas para el dashboard de DIGEDROP.
// ─────────────────────────────────────────────────────────────────────────────

export const DIGEDROP_CORE_TABLE_IDS = [
  'digedrop-sustancias',
  'digedrop-elementos',
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS SIMPLE COMPARACIÓN
// ─────────────────────────────────────────────────────────────────────────────
export interface DigedropComparisonRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// TABLA TEXTO LIBRE (Código Aduanero)
// ─────────────────────────────────────────────────────────────────────────────
export interface DigedropTextRow {
  id: string;
  label: string;
  textoAnterior: string;
  textoActual: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw table IDs in database
// ─────────────────────────────────────────────────────────────────────────────
export const DIGEDROP_TABLE_IDS = {
  SUSTANCIAS: 'digedrop-sustancias',
  ELEMENTOS: 'digedrop-elementos',
  CODIGO_ADUANERO: 'digedrop-codigo-aduanero',
  ALLANAMIENTOS: 'digedrop-allanamientos',
  DETENIDOS: 'digedrop-detenidos',
  PREVENIDOS: 'digedrop-prevenidos',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Secuestro de Sustancias Prohibidas
// ─────────────────────────────────────────────────────────────────────────────
export const DIGEDROP_SUSTANCIAS_DEFAULT: DigedropComparisonRow[] = [
  { id: 'cocaina_kg', label: 'COCAÍNA (KG)', periodoAnterior: 14417, periodoActual: 37300 },
  { id: 'marihuana_kg', label: 'MARIHUANA (KG)', periodoAnterior: 161737, periodoActual: 297123 },
  { id: 'plantas_marihuana', label: 'PLANTAS DE MARIHUANA (UNIDADES)', periodoAnterior: 1145, periodoActual: 1822 },
  { id: 'semillas_marihuana', label: 'SEMILLAS DE MARIHUANA', periodoAnterior: 17273, periodoActual: 1005151 },
  { id: 'hongos_alucinogenos', label: 'HONGOS ALUCINÓGENOS (UNIDADES)', periodoAnterior: 0, periodoActual: 12 },
  { id: 'troqueles_lsd', label: 'TROQUELES LSD', periodoAnterior: 3, periodoActual: 0 },
  { id: 'pastillas', label: 'PASTILLAS (UNIDADES)', periodoAnterior: 7104, periodoActual: 7903 },
  { id: 'pastillas_extasis', label: 'PASTILLAS ÉXTASIS (UNIDADES)', periodoAnterior: 0, periodoActual: 9 },
  { id: 'cocaina_rosa_tusi', label: 'COCAÍNA ROSA (TUSI) (GRS)', periodoAnterior: 0, periodoActual: 1 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. Secuestro de Elementos
// ─────────────────────────────────────────────────────────────────────────────
export const DIGEDROP_ELEMENTOS_DEFAULT: DigedropComparisonRow[] = [
  { id: 'celulares', label: 'CELULARES (UNIDADES)', periodoAnterior: 604, periodoActual: 708 },
  { id: 'dispositivos_electronicos', label: 'DISPOSITIVOS ELECTRÓNICOS (UNIDADES)', periodoAnterior: 54, periodoActual: 4 },
  { id: 'balanza', label: 'BALANZA (UNIDADES)', periodoAnterior: 114, periodoActual: 163 },
  { id: 'pesos_argentinos', label: 'PESOS ARGENTINOS', periodoAnterior: 33620420, periodoActual: 49779790 },
  { id: 'dolares', label: 'DÓLARES', periodoAnterior: 200, periodoActual: 749 },
  { id: 'vehiculos_secuestrados', label: 'VEHÍCULOS SECUESTRADOS', periodoAnterior: 86, periodoActual: 84 },
  { id: 'vehiculos_inf_ley', label: 'VEHÍCULOS INF. LEY 24.449', periodoAnterior: 28, periodoActual: 87 },
  { id: 'armas', label: 'ARMAS (UNIDADES)', periodoAnterior: 9, periodoActual: 7 },
  { id: 'cartuchos', label: 'CARTUCHOS (UNIDADES)', periodoAnterior: 140, periodoActual: 96 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. Secuestro de Elementos – Código Aduanero (texto libre)
// ─────────────────────────────────────────────────────────────────────────────
export const DIGEDROP_CODIGO_ADUANERO_DEFAULT: DigedropTextRow[] = [
  {
    id: 'inf_codigo_aduanero',
    label: 'INF. CÓDIGO ADUANERO',
    textoAnterior: '436.000 KG H. COCA\n13 ATADOS DE CIGARRILLOS\n404 CUBIERTAS',
    textoActual: '332.042 KG H. COCA\n25 CAJAS DE CIGARRILLOS\n163',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. Secuestro de Sustancias – Allanamientos y Procedimientos
// ─────────────────────────────────────────────────────────────────────────────
export const DIGEDROP_ALLANAMIENTOS_DEFAULT: DigedropComparisonRow[] = [
  { id: 'allanamientos_j_federal', label: 'ALLANAMIENTOS OTORGADOS J. FEDERAL', periodoAnterior: 3, periodoActual: 2 },
  { id: 'allanamientos_j_ordinaria', label: 'ALLANAMIENTOS JUSTICIA ORDINARIA', periodoAnterior: 294, periodoActual: 387 },
  { id: 'total_procedimientos', label: 'TOTAL DE PROCEDIMIENTOS', periodoAnterior: 1084, periodoActual: 2072 },
  { id: 'detenidos_contravencionales', label: 'DETENIDOS CONTRAVENCIONALES', periodoAnterior: 62, periodoActual: 238 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. Detenidos
// ─────────────────────────────────────────────────────────────────────────────
export const DIGEDROP_DETENIDOS_DEFAULT: DigedropComparisonRow[] = [
  { id: 'varones', label: 'VARONES', periodoAnterior: 795, periodoActual: 1445 },
  { id: 'mujeres', label: 'MUJERES', periodoAnterior: 217, periodoActual: 292 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. Prevenidos
// ─────────────────────────────────────────────────────────────────────────────
export const DIGEDROP_PREVENIDOS_DEFAULT: DigedropComparisonRow[] = [
  { id: 'varones', label: 'VARONES', periodoAnterior: 120, periodoActual: 271 },
  { id: 'mujeres', label: 'MUJERES', periodoAnterior: 39, periodoActual: 55 },
];

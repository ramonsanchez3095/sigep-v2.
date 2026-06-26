// ─────────────────────────────────────────────────────────────────────────────
// Delitos Rurales – Dirección General de Delitos Rurales
// Definición de tablas estructuradas para el dashboard de Delitos Rurales.
// ─────────────────────────────────────────────────────────────────────────────

export const DR_CORE_TABLE_IDS = [
  'dr-priv-libertad',
  'dr-procedimientos',
];

// ─────────────────────────────────────────────────────────────────────────────
// TABLAS SIMPLE COMPARACIÓN
// ─────────────────────────────────────────────────────────────────────────────
export interface DRComparisonRow {
  id: string;
  label: string;
  periodoAnterior: number;
  periodoActual: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Raw table IDs in database
// ─────────────────────────────────────────────────────────────────────────────
export const DR_TABLE_IDS = {
  PRIV_LIBERTAD: 'dr-priv-libertad',
  PROCEDIMIENTOS: 'dr-procedimientos',
  ALLANAMIENTOS: 'dr-allanamientos',
  VEHICULOS: 'dr-vehiculos',
  ANIMALES_SECUESTRADOS: 'dr-animales-secuestrados',
  ARMAS_FUEGO: 'dr-armas-fuego',
  CARTUCHOS: 'dr-cartuchos',
  ARMA_BLANCA: 'dr-arma-blanca',
  OTROS_SECUESTROS: 'dr-otros-secuestros',
  SECUESTRO: 'dr-secuestro',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 1. Privados de Libertad
// ─────────────────────────────────────────────────────────────────────────────
export const DR_PRIV_LIBERTAD_DEFAULT: DRComparisonRow[] = [
  { id: 'procesal', label: 'PROCESAL', periodoAnterior: 93, periodoActual: 157 },
  { id: 'contravencional', label: 'CONTRAVENCIONAL', periodoAnterior: 7, periodoActual: 14 },
  { id: 'demorado', label: 'DEMORADO', periodoAnterior: 8, periodoActual: 621 },
  { id: 'capturas', label: 'CAPTURAS', periodoAnterior: 35, periodoActual: 57 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 2. Procedimientos
// ─────────────────────────────────────────────────────────────────────────────
export const DR_PROCEDIMIENTOS_DEFAULT: DRComparisonRow[] = [
  { id: 'causas', label: 'CAUSAS', periodoAnterior: 279, periodoActual: 648 },
  { id: 'infraccion', label: 'INFRACCIÓN', periodoAnterior: 370, periodoActual: 1516 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 3. Allanamientos
// ─────────────────────────────────────────────────────────────────────────────
export const DR_ALLANAMIENTOS_DEFAULT: DRComparisonRow[] = [
  { id: 'positivos', label: 'POSITIVOS', periodoAnterior: 97, periodoActual: 81 },
  { id: 'negativos', label: 'NEGATIVOS', periodoAnterior: 26, periodoActual: 44 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4. Vehículos
// ─────────────────────────────────────────────────────────────────────────────
export const DR_VEHICULOS_DEFAULT: DRComparisonRow[] = [
  { id: 'procesal', label: 'PROCESAL', periodoAnterior: 39, periodoActual: 47 },
  { id: 'art289', label: '(ART.289)', periodoAnterior: 34, periodoActual: 56 },
  { id: 'deposito', label: 'DEPÓSITO', periodoAnterior: 0, periodoActual: 201 },
  { id: 'infraccion', label: 'INFRACCIÓN', periodoAnterior: 177, periodoActual: 635 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 5. Animales Secuestrados
// ─────────────────────────────────────────────────────────────────────────────
export const DR_ANIMALES_SECUESTRADOS_DEFAULT: DRComparisonRow[] = [
  { id: 'procesal', label: 'PROCESAL', periodoAnterior: 141, periodoActual: 324 },
  { id: 'infraccion', label: 'INFRACCIÓN', periodoAnterior: 183, periodoActual: 2076 },
  { id: 'aves', label: 'AVES', periodoAnterior: 1227, periodoActual: 1645 },
  { id: 'jaulas_tramperas', label: 'JAULAS/TRAMPERAS', periodoAnterior: 694, periodoActual: 1508 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 6. Armas de Fuego (Causa e Infracción)
// ─────────────────────────────────────────────────────────────────────────────
export const DR_ARMAS_FUEGO_DEFAULT: DRComparisonRow[] = [
  { id: 'procesal', label: 'PROCESAL', periodoAnterior: 53, periodoActual: 39 },
  { id: 'infraccion', label: 'INFRACCIÓN', periodoAnterior: 13, periodoActual: 21 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 7. Cartuchos
// ─────────────────────────────────────────────────────────────────────────────
export const DR_CARTUCHOS_DEFAULT: DRComparisonRow[] = [
  { id: 'causa', label: 'CAUSA', periodoAnterior: 990, periodoActual: 287 },
  { id: 'infraccion', label: 'INFRACCIÓN', periodoAnterior: 112, periodoActual: 260 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8. Arma Blanca
// ─────────────────────────────────────────────────────────────────────────────
export const DR_ARMA_BLANCA_DEFAULT: DRComparisonRow[] = [
  { id: 'procesal', label: 'PROCESAL', periodoAnterior: 97, periodoActual: 69 },
  { id: 'infraccion', label: 'INFRACCIÓN', periodoAnterior: 4, periodoActual: 11 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 9. Otros Secuestros
// ─────────────────────────────────────────────────────────────────────────────
export const DR_OTROS_SECUESTROS_DEFAULT: DRComparisonRow[] = [
  { id: 'animales_rescatados', label: 'ANIMALES RESCATADOS', periodoAnterior: 37, periodoActual: 55 },
  { id: 'peces', label: 'PECES', periodoAnterior: 253, periodoActual: 157 },
  { id: 'redes_trasmallos', label: 'REDES Y TRASMALLOS', periodoAnterior: 74, periodoActual: 191 },
  { id: 'reptiles', label: 'REPTILES', periodoAnterior: 12, periodoActual: 24 },
  { id: 'celulares', label: 'CELULARES', periodoAnterior: 35, periodoActual: 58 },
  { id: 'azo_cuero_montura', label: 'AZO DE CUERO/MONTURA', periodoAnterior: 156, periodoActual: 288 },
  { id: 'herramientas', label: 'HERRAMIENTAS', periodoAnterior: 108, periodoActual: 116 },
  { id: 'cubiertas', label: 'CUBIERTAS', periodoAnterior: 23, periodoActual: 0 },
];

// ─────────────────────────────────────────────────────────────────────────────
// 10. Secuestro
// ─────────────────────────────────────────────────────────────────────────────
export const DR_SECUESTRO_DEFAULT: DRComparisonRow[] = [
  { id: 'procesal', label: 'PROCESAL', periodoAnterior: 8, periodoActual: 1 },
  { id: 'infraccion', label: 'INFRACCIÓN', periodoAnterior: 0, periodoActual: 28 },
];

import type { FilaComparativa } from '../components/tables/TablaComparativa';

export interface ExportContext {
  titulo: string;
  departamento: string;
  periodo: string;
  generatedAt?: Date;
}

export function buildExportFilename(
  titulo: string,
  extension: 'pdf' | 'xlsx',
  generatedAt: Date = new Date()
) {
  const safeTitle = titulo.trim().replace(/\s+/g, '_');
  const datePart = generatedAt.toISOString().split('T')[0];
  return `${safeTitle}_${datePart}.${extension}`;
}

export function calculateComparisonMetrics(fila: FilaComparativa) {
  const diferencia = fila.periodoActual - fila.periodoAnterior;
  const porcentaje =
    fila.periodoAnterior === 0
      ? fila.periodoActual > 0
        ? 100
        : 0
      : Math.round(
          ((fila.periodoActual - fila.periodoAnterior) / fila.periodoAnterior) * 100
        );

  return { diferencia, porcentaje };
}

export function buildPdfTableData(datos: FilaComparativa[]) {
  const rows = datos.map(fila => {
    const { diferencia, porcentaje } = calculateComparisonMetrics(fila);
    return [
      fila.label,
      fila.periodoAnterior.toLocaleString('es-AR'),
      fila.periodoActual.toLocaleString('es-AR'),
      `${diferencia > 0 ? '+' : ''}${diferencia.toLocaleString('es-AR')}`,
      `${porcentaje > 0 ? '+' : ''}${porcentaje}%`,
    ];
  });

  const totalAnterior = datos.reduce((acc, fila) => acc + fila.periodoAnterior, 0);
  const totalActual = datos.reduce((acc, fila) => acc + fila.periodoActual, 0);
  const totalDif = totalActual - totalAnterior;
  const totalPct =
    totalAnterior === 0
      ? totalActual > 0
        ? 100
        : 0
      : Math.round(((totalActual - totalAnterior) / totalAnterior) * 100);

  rows.push([
    'TOTAL',
    totalAnterior.toLocaleString('es-AR'),
    totalActual.toLocaleString('es-AR'),
    `${totalDif > 0 ? '+' : ''}${totalDif.toLocaleString('es-AR')}`,
    `${totalPct > 0 ? '+' : ''}${totalPct}%`,
  ]);

  return rows;
}

export function buildExcelSheetData(
  context: ExportContext,
  datos: FilaComparativa[]
): Array<Array<string | number>> {
  const generatedAt = context.generatedAt ?? new Date();
  const rows: Array<Array<string | number>> = [
    ['SIGEP - Sistema de Gestión Estadística Policial'],
    ['Policía de Tucumán'],
    [context.departamento],
    [context.titulo],
    [`Período: ${context.periodo}`],
    [`Fecha de generación: ${generatedAt.toLocaleDateString('es-AR')}`],
    [],
    ['Detalle', 'Período Anterior', 'Período Actual', 'Diferencia', 'Porcentaje'],
  ];

  for (const fila of datos) {
    const { diferencia, porcentaje } = calculateComparisonMetrics(fila);
    rows.push([
      fila.label,
      fila.periodoAnterior,
      fila.periodoActual,
      diferencia,
      `${porcentaje}%`,
    ]);
  }

  const totalAnterior = datos.reduce((acc, fila) => acc + fila.periodoAnterior, 0);
  const totalActual = datos.reduce((acc, fila) => acc + fila.periodoActual, 0);
  const totalDif = totalActual - totalAnterior;
  const totalPct =
    totalAnterior === 0
      ? totalActual > 0
        ? 100
        : 0
      : Math.round(((totalActual - totalAnterior) / totalAnterior) * 100);

  rows.push(['TOTAL', totalAnterior, totalActual, totalDif, `${totalPct}%`]);

  return rows;
}

// ============================================
// ESTADÍSTICAS — Exportación
// ============================================

export interface EstadisticasExportContext {
  escala: string;
  filtros: string;
  generatedAt?: Date;
}

export interface EstadisticasFila {
  nombre: string;
  [key: string]: string | number;
}

export function buildEstadisticasPdfData(
  datos: EstadisticasFila[],
  columnas: string[]
): string[][] {
  return datos.map(fila =>
    columnas.map(col => {
      const val = fila[col];
      if (val == null) return '-';
      if (typeof val === 'number') {
        return new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 }).format(val);
      }
      return String(val);
    })
  );
}

export interface EstadisticasExcelSheet {
  nombre: string;
  datos: Array<Array<string | number>>;
}

export function buildEstadisticasExcelData(
  context: EstadisticasExportContext,
  datos: EstadisticasFila[],
  columnas: string[],
  kpis?: Record<string, string | number>,
  yoyDatos?: EstadisticasFila[],
  yoyColumnas?: string[],
  proyeccionDatos?: EstadisticasFila[]
): EstadisticasExcelSheet[] {
  const generatedAt = context.generatedAt ?? new Date();
  const sheets: EstadisticasExcelSheet[] = [];

  // Hoja 1: Resumen KPIs
  if (kpis) {
    const resumenRows: Array<Array<string | number>> = [
      ['SIGEP - Estadísticas'],
      [`Escala: ${context.escala}`],
      [`Filtros: ${context.filtros || 'Ninguno'}`],
      [`Generado: ${generatedAt.toLocaleDateString('es-AR')}`],
      [],
      ['Indicador', 'Valor'],
    ];
    for (const [key, val] of Object.entries(kpis)) {
      resumenRows.push([key, val]);
    }
    sheets.push({ nombre: 'Resumen', datos: resumenRows });
  }

  // Hoja 2: Datos según escala
  const datosRows: Array<Array<string | number>> = [columnas];
  for (const fila of datos) {
    datosRows.push(
      columnas.map(col => {
        const val = fila[col];
        return val != null ? val : '';
      })
    );
  }
  sheets.push({ nombre: 'Datos', datos: datosRows });

  // Hoja 3: YoY (si aplica)
  if (yoyDatos && yoyColumnas) {
    const yoyRows: Array<Array<string | number>> = [yoyColumnas];
    for (const fila of yoyDatos) {
      yoyRows.push(
        yoyColumnas.map(col => {
          const val = fila[col];
          return val != null ? val : '';
        })
      );
    }
    sheets.push({ nombre: 'Comparativa YoY', datos: yoyRows });
  }

  // Hoja 4: Proyección (si aplica)
  if (proyeccionDatos) {
    const proyRows: Array<Array<string | number>> = [
      ['Período', 'Valor', 'Tipo'],
    ];
    for (const fila of proyeccionDatos) {
      proyRows.push([
        fila.nombre,
        typeof fila.valor === 'number' ? fila.valor : 0,
        String(fila.tipo ?? ''),
      ]);
    }
    sheets.push({ nombre: 'Proyección', datos: proyRows });
  }

  return sheets;
}
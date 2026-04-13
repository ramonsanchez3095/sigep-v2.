import type {
  D1DashboardData,
  D1RenderedTable,
} from './d1-transform';
import type { D1ValueFormat } from './d1-definition';

export interface D1ExportContext {
  titulo: string;
  departamento: string;
  periodo: string;
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  generatedAt?: Date;
}

export interface D1TrendRow {
  nombre: string;
  valor: number;
}

export interface D1WorkbookSheet {
  nombre: string;
  datos: Array<Array<string | number>>;
}

function formatNumber(value: number, format: D1ValueFormat) {
  return new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: format === 'decimal' ? 2 : 0,
    maximumFractionDigits: format === 'decimal' ? 2 : 0,
  }).format(value);
}

function formatSignedValue(value: number, format: D1ValueFormat) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${formatNumber(value, format)}`;
}

function formatVariation(value: number) {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

function formatShare(value?: number) {
  if (value == null) {
    return '-';
  }

  return `${value.toFixed(1)}%`;
}

function buildSheetName(index: number, title: string) {
  const safe = `${String(index).padStart(2, '0')} ${title}`;
  return safe.slice(0, 31);
}

export function buildD1SummaryRows(dashboard: D1DashboardData) {
  return dashboard.summaryMetrics.map(metric => [
    metric.label,
    formatNumber(metric.periodoAnterior, metric.format),
    formatNumber(metric.periodoActual, metric.format),
    formatVariation(metric.variacion),
  ]);
}

export function buildD1PdfTable(table: D1RenderedTable, context: D1ExportContext) {
  const showShare = table.variant === 'comparison-share';
  const head = [
    [
      'Detalle',
      context.periodoAnteriorLabel,
      ...(showShare ? ['%'] : []),
      context.periodoActualLabel,
      ...(showShare ? ['%'] : []),
      'Diferencia',
      'Variacion',
    ],
  ];

  const body = table.rows.map(row => [
    row.label,
    formatNumber(row.periodoAnterior, row.format),
    ...(showShare ? [formatShare(row.shareAnterior)] : []),
    formatNumber(row.periodoActual, row.format),
    ...(showShare ? [formatShare(row.shareActual)] : []),
    formatSignedValue(row.diferencia, row.format),
    formatVariation(row.variacion),
  ]);

  return { head, body };
}

export function buildD1ExcelSheets(
  context: D1ExportContext,
  dashboard: D1DashboardData,
  trendRows: D1TrendRow[] = []
): D1WorkbookSheet[] {
  const generatedAt = context.generatedAt ?? new Date();
  const sheets: D1WorkbookSheet[] = [];

  const resumen: Array<Array<string | number>> = [
    ['SIGEP - Sistema de Gestion Estadistica Policial'],
    ['Policia de Tucuman'],
    [context.departamento],
    [context.titulo],
    [`Periodo: ${context.periodo}`],
    [`Fecha de generacion: ${generatedAt.toLocaleDateString('es-AR')}`],
    [],
    ['Indicador', context.periodoAnteriorLabel, context.periodoActualLabel, 'Variacion'],
    ...buildD1SummaryRows(dashboard),
    [],
    ['Comparativa de bloques principales'],
    ['Bloque', context.periodoAnteriorLabel, context.periodoActualLabel],
    ...dashboard.barData.map(item => [item.nombre, item.anterior, item.actual]),
  ];

  if (dashboard.pieData.length > 0) {
    resumen.push([]);
    resumen.push(['Distribucion actual por genero']);
    resumen.push(['Genero', context.periodoActualLabel]);
    for (const item of dashboard.pieData) {
      resumen.push([item.nombre, item.valor]);
    }
  }

  if (trendRows.length > 0) {
    resumen.push([]);
    resumen.push(['Evolucion mensual del bloque principal']);
    resumen.push(['Periodo', 'Total']);
    for (const row of trendRows) {
      resumen.push([row.nombre, row.valor]);
    }
  }

  sheets.push({ nombre: '01 Resumen D1', datos: resumen });

  dashboard.sections.forEach((section, sectionIndex) => {
    const rows: Array<Array<string | number>> = [[section.title]];

    if (section.description) {
      rows.push([section.description]);
    }

    rows.push([]);

    for (const table of section.tables) {
      const showShare = table.variant === 'comparison-share';
      rows.push([table.title]);
      if (table.description) {
        rows.push([table.description]);
      }
      rows.push([
        'Detalle',
        context.periodoAnteriorLabel,
        ...(showShare ? ['%'] : []),
        context.periodoActualLabel,
        ...(showShare ? ['%'] : []),
        'Diferencia',
        'Variacion',
      ]);

      for (const row of table.rows) {
        rows.push([
          row.label,
          row.periodoAnterior,
          ...(showShare ? [formatShare(row.shareAnterior)] : []),
          row.periodoActual,
          ...(showShare ? [formatShare(row.shareActual)] : []),
          row.diferencia,
          formatVariation(row.variacion),
        ]);
      }

      rows.push([]);
    }

    sheets.push({
      nombre: buildSheetName(sectionIndex + 2, section.title),
      datos: rows,
    });
  });

  return sheets;
}
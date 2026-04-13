'use client';

import { useState } from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { obtenerEstadisticasMensuales } from '@/actions/estadisticas';
import {
  buildD1ExcelSheets,
  buildD1PdfTable,
  buildD1SummaryRows,
  type D1ExportContext,
  type D1TrendRow,
} from '@/lib/d1-export';
import type { D1DashboardData } from '@/lib/d1-transform';
import { buildExportFilename } from '@/lib/export-utils';

interface D1ExportButtonsProps {
  titulo: string;
  departamento: string;
  departamentoId: string;
  periodo: string;
  periodoAnteriorLabel: string;
  periodoActualLabel: string;
  dashboard: D1DashboardData;
}

function getLastAutoTableY(doc: jsPDF) {
  return (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 60;
}

function ensurePdfCursor(doc: jsPDF, desiredY: number, remainingSpace = 28) {
  if (desiredY <= doc.internal.pageSize.height - remainingSpace) {
    return desiredY;
  }

  doc.addPage();
  return 20;
}

function buildColumnWidths(columnCount: number) {
  return Array.from({ length: columnCount }, (_, index) => ({
    wch: index === 0 ? 36 : 18,
  }));
}

export function D1ExportButtons({
  titulo,
  departamento,
  departamentoId,
  periodo,
  periodoAnteriorLabel,
  periodoActualLabel,
  dashboard,
}: D1ExportButtonsProps) {
  const [exporting, setExporting] = useState<'pdf' | 'xlsx' | null>(null);

  const context: D1ExportContext = {
    titulo,
    departamento,
    periodo,
    periodoAnteriorLabel,
    periodoActualLabel,
  };

  async function loadTrendRows(): Promise<D1TrendRow[]> {
    if (!dashboard.trendTableConfigId) {
      return [];
    }

    try {
      const trendData = await obtenerEstadisticasMensuales({
        escala: 'mensual',
        departamentoId,
        tablaConfigId: dashboard.trendTableConfigId,
      });

      return trendData.datosGrafico
        .filter(item => item.valor > 0)
        .map(item => ({ nombre: item.nombre, valor: item.valor }));
    } catch {
      return [];
    }
  }

  async function exportToPdf() {
    const generatedAt = new Date();
    setExporting('pdf');

    try {
      const trendRows = await loadTrendRows();
      const doc = new jsPDF();

      doc.setFillColor(17, 35, 60);
      doc.rect(0, 0, 210, 34, 'F');
      doc.setFillColor(201, 169, 78);
      doc.rect(0, 34, 210, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.text('SIGEP - Policia de Tucuman', 105, 15, { align: 'center' });
      doc.setFontSize(11);
      doc.text('Departamento Personal (D-1) - Exportacion avanzada', 105, 24, {
        align: 'center',
      });

      doc.setTextColor(31, 41, 55);
      doc.setFontSize(10);
      doc.text(`Departamento: ${departamento}`, 14, 47);
      doc.text(`Periodo: ${periodo}`, 14, 53);
      doc.text(
        `Fecha de generacion: ${generatedAt.toLocaleDateString('es-AR')}`,
        14,
        59
      );

      autoTable(doc, {
        head: [['Indicador', periodoAnteriorLabel, periodoActualLabel, 'Variacion']],
        body: buildD1SummaryRows(dashboard),
        startY: 66,
        headStyles: {
          fillColor: [30, 58, 95],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [248, 246, 241] },
        styles: { fontSize: 9, cellPadding: 3 },
      });

      autoTable(doc, {
        head: [['Bloque', periodoAnteriorLabel, periodoActualLabel]],
        body: dashboard.barData.map(item => [item.nombre, item.anterior, item.actual]),
        startY: getLastAutoTableY(doc) + 8,
        headStyles: {
          fillColor: [201, 169, 78],
          textColor: 17,
          fontStyle: 'bold',
        },
        alternateRowStyles: { fillColor: [252, 245, 227] },
        styles: { fontSize: 8.5, cellPadding: 3 },
      });

      if (dashboard.pieData.length > 0) {
        autoTable(doc, {
          head: [['Genero', periodoActualLabel]],
          body: dashboard.pieData.map(item => [item.nombre, item.valor]),
          startY: getLastAutoTableY(doc) + 8,
          headStyles: {
            fillColor: [91, 33, 182],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: { fillColor: [245, 243, 255] },
          styles: { fontSize: 8.5, cellPadding: 3 },
        });
      }

      if (trendRows.length > 0) {
        autoTable(doc, {
          head: [['Periodo', 'Total']],
          body: trendRows.map(row => [row.nombre, row.valor]),
          startY: getLastAutoTableY(doc) + 8,
          headStyles: {
            fillColor: [14, 165, 233],
            textColor: 255,
            fontStyle: 'bold',
          },
          alternateRowStyles: { fillColor: [240, 249, 255] },
          styles: { fontSize: 8.5, cellPadding: 3 },
        });
      }

      for (const section of dashboard.sections) {
        let sectionY = ensurePdfCursor(doc, getLastAutoTableY(doc) + 12, 36);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.setTextColor(17, 35, 60);
        doc.text(section.title, 14, sectionY);

        let cursorY = sectionY + 4;

        if (section.description) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(100, 116, 139);
          const descriptionLines = doc.splitTextToSize(section.description, 182);
          doc.text(descriptionLines, 14, sectionY + 5);
          cursorY = sectionY + 5 + descriptionLines.length * 4;
        }

        for (const table of section.tables) {
          let tableY = ensurePdfCursor(doc, Math.max(getLastAutoTableY(doc) + 10, cursorY + 6), 42);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.setTextColor(31, 41, 55);
          doc.text(table.title, 14, tableY);

          const matrix = buildD1PdfTable(table, context);

          autoTable(doc, {
            head: matrix.head,
            body: matrix.body,
            startY: tableY + 3,
            headStyles: {
              fillColor: [30, 58, 95],
              textColor: 255,
              fontStyle: 'bold',
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 8, cellPadding: 2.8 },
            didParseCell(data) {
              const row = table.rows[data.row.index];

              if (!row || data.section !== 'body') {
                return;
              }

              if (row.emphasis === 'subtotal') {
                data.cell.styles.fillColor = [252, 245, 227];
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = 92;
              }

              if (row.emphasis === 'total') {
                data.cell.styles.fillColor = [17, 35, 60];
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = 255;
              }
            },
          });

          cursorY = getLastAutoTableY(doc);
        }
      }

      const pageCount = doc.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        doc.setPage(page);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Pagina ${page} de ${pageCount} - SIGEP D1`,
          105,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      doc.save(buildExportFilename(`${titulo}_D1_avanzado`, 'pdf', generatedAt));
    } finally {
      setExporting(null);
    }
  }

  async function exportToExcel() {
    const generatedAt = new Date();
    setExporting('xlsx');

    try {
      const trendRows = await loadTrendRows();
      const workbook = XLSX.utils.book_new();

      const sheets = buildD1ExcelSheets(
        {
          ...context,
          generatedAt,
        },
        dashboard,
        trendRows
      );

      for (const sheet of sheets) {
        const worksheet = XLSX.utils.aoa_to_sheet(sheet.datos);
        const maxColumns = Math.max(...sheet.datos.map(row => row.length), 1);
        worksheet['!cols'] = buildColumnWidths(maxColumns);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheet.nombre);
      }

      XLSX.writeFile(
        workbook,
        buildExportFilename(`${titulo}_D1_avanzado`, 'xlsx', generatedAt)
      );
    } finally {
      setExporting(null);
    }
  }

  const disabled = exporting !== null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          void exportToPdf();
        }}
        disabled={disabled}
        className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileText size={18} />
        {exporting === 'pdf' ? 'Generando PDF...' : 'PDF D1'}
      </button>
      <button
        onClick={() => {
          void exportToExcel();
        }}
        disabled={disabled}
        className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <FileSpreadsheet size={18} />
        {exporting === 'xlsx' ? 'Generando Excel...' : 'Excel D1'}
      </button>
    </div>
  );
}
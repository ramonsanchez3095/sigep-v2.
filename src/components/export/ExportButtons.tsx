'use client';

import { FileSpreadsheet, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { FilaComparativa } from '../tables/TablaComparativa';
import {
  buildExcelSheetData,
  buildExportFilename,
  buildPdfTableData,
} from '../../lib/export-utils';

interface ExportButtonsProps {
  titulo: string;
  datos: FilaComparativa[];
  departamento: string;
  periodo: string;
}

export function ExportButtons({
  titulo,
  datos,
  departamento,
  periodo,
}: ExportButtonsProps) {
  const exportToPDF = () => {
    const doc = new jsPDF();
    const generatedAt = new Date();

    doc.setFillColor(30, 58, 95);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('SIGEP - Policía de Tucumán', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(departamento, 105, 25, { align: 'center' });
    doc.text(titulo, 105, 33, { align: 'center' });

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Período: ${periodo}`, 14, 50);
    doc.text(
      `Fecha de generación: ${generatedAt.toLocaleDateString('es-AR')}`,
      14,
      56
    );

    const tableData = buildPdfTableData(datos);

    autoTable(doc, {
      head: [
        [
          'Detalle',
          'Período Anterior',
          'Período Actual',
          'Diferencia',
          'Porcentaje',
        ],
      ],
      body: tableData,
      startY: 65,
      headStyles: {
        fillColor: [30, 58, 95],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      styles: { fontSize: 9, cellPadding: 4 },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
      },
      didParseCell(data) {
        if (data.row.index === tableData.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [229, 231, 235];
        }
      },
    });

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Página ${i} de ${pageCount} - Generado por SIGEP`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    doc.save(
      buildExportFilename(titulo, 'pdf', generatedAt)
    );
  };

  const exportToExcel = () => {
    const generatedAt = new Date();
    const wsData = buildExcelSheetData(
      {
        titulo,
        departamento,
        periodo,
        generatedAt,
      },
      datos
    );

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    ws['!cols'] = [
      { wch: 30 },
      { wch: 18 },
      { wch: 18 },
      { wch: 15 },
      { wch: 12 },
    ];
    XLSX.writeFile(
      wb,
      buildExportFilename(titulo, 'xlsx', generatedAt)
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={exportToPDF}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
      >
        <FileText size={18} /> Exportar PDF
      </button>
      <button
        onClick={exportToExcel}
        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
      >
        <FileSpreadsheet size={18} /> Exportar Excel
      </button>
    </div>
  );
}

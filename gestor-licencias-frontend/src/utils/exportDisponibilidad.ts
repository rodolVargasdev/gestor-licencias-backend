import { utils as XLSXUtils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DisponibilidadTrabajador } from '../types/disponibilidad';

interface ExportDisponibilidad {
  codigo: string;
  trabajador: string;
  tipo_licencia: string;
  periodo: string;
  dias_disponibles: string;
  dias_usados: string;
  dias_restantes: string;
  estado: string;
}

const exportColumns = [
  { header: 'Código', key: 'codigo' },
  { header: 'Trabajador', key: 'trabajador' },
  { header: 'Tipo de Licencia', key: 'tipo_licencia' },
  { header: 'Período', key: 'periodo' },
  { header: 'Días Disponibles', key: 'dias_disponibles' },
  { header: 'Días Usados', key: 'dias_usados' },
  { header: 'Días Restantes', key: 'dias_restantes' },
  { header: 'Estado', key: 'estado' },
];

function mapDisponibilidadToExport(row: DisponibilidadTrabajador): ExportDisponibilidad {
  return {
    codigo: row.trabajador?.codigo || '',
    trabajador: row.trabajador?.nombre_completo || '',
    tipo_licencia: row.tipo_licencia?.nombre || '',
    periodo: row.tipo_licencia?.periodo_renovacion === 'MENSUAL' ? 'Mensual' : 'Anual',
    dias_disponibles: `${row.dias_disponibles} días (${row.dias_disponibles * 8} horas)`,
    dias_usados: `${row.dias_usados} días (${row.dias_usados * 8} horas)`,
    dias_restantes: `${row.dias_restantes} días (${row.dias_restantes * 8} horas)`,
    estado: row.activo ? 'ACTIVO' : 'INACTIVO',
  };
}

export function exportDisponibilidadToExcel(data: DisponibilidadTrabajador[], fileName: string) {
  const exportData = data.map(mapDisponibilidadToExport);
  const fechaReporte = `Fecha de creación del reporte: ${new Date().toLocaleString()}`;
  const headerRow: Record<string, string> = { [exportColumns[0].header]: fechaReporte };
  exportColumns.forEach(col => { if (!(col.header in headerRow)) headerRow[col.header] = ''; });
  const emptyRow: Record<string, string> = {};
  exportColumns.forEach(col => { emptyRow[col.header] = ''; });
  const finalData = [headerRow, emptyRow, ...exportData.map(row => {
    const r: Record<string, string> = {};
    exportColumns.forEach(col => { r[col.header] = row[col.key as keyof ExportDisponibilidad]; });
    return r;
  })];
  const ws = XLSXUtils.json_to_sheet(finalData, { skipHeader: false });
  const wb = XLSXUtils.book_new();
  XLSXUtils.book_append_sheet(wb, ws, 'Disponibilidad');
  writeFile(wb, `${fileName}.xlsx`);
}

export function exportDisponibilidadToPDF(data: DisponibilidadTrabajador[], fileName: string) {
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text('Disponibilidad de Trabajadores', 14, 15);
  const fechaReporte = `Generado el: ${new Date().toLocaleString()}`;
  doc.setFontSize(10);
  doc.text(fechaReporte, 14, 22);
  const tableData = data.map(row => {
    const mapped = mapDisponibilidadToExport(row);
    return exportColumns.map(col => mapped[col.key as keyof ExportDisponibilidad]);
  });
  autoTable(doc, {
    head: [exportColumns.map(col => col.header)],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] as [number, number, number] },
  });
  doc.save(`${fileName}.pdf`);
} 
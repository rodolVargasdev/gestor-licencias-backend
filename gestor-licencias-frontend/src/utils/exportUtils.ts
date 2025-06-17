import { utils as XLSXUtils, writeFile } from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Trabajador } from '../types/trabajador';

interface ExportData extends Trabajador {
  departamento_nombre: string;
  puesto_nombre: string;
  fecha_ingreso_formateada: string;
}

interface Column {
  header: string;
  dataKey: keyof ExportData | string;
}

interface AutoTableOptions {
  head: string[][];
  body: string[][];
  startY: number;
  styles: {
    fontSize: number;
  };
  headStyles: {
    fillColor: [number, number, number];
  };
}

const exportColumns: Column[] = [
  { header: 'Código', dataKey: 'codigo' },
  { header: 'Nombre Completo', dataKey: 'nombre_completo' },
  { header: 'Email', dataKey: 'email' },
  { header: 'Teléfono', dataKey: 'telefono' },
  { header: 'Departamento', dataKey: 'departamento_nombre' },
  { header: 'Puesto', dataKey: 'puesto_nombre' },
  { header: 'Tipo', dataKey: 'tipo_personal' },
  { header: 'Fecha Ingreso', dataKey: 'fecha_ingreso_formateada' },
  { header: 'Estado', dataKey: 'activo' },
];

export const exportToExcel = (data: ExportData[], fileName: string): void => {
  // Solo los campos planos relevantes
  const exportData = data.map(item => {
    const row: Record<string, string> = {};
    exportColumns.forEach(col => {
      let value = item[col.dataKey as keyof ExportData];
      if (col.dataKey === 'activo') {
        value = value ? 'ACTIVO' : 'INACTIVO';
      }
      row[col.header] = value === null || value === undefined ? '' : String(value);
    });
    return row;
  });

  // Agregar la fecha de creación del reporte como primera fila
  const fechaReporte = `Fecha de creación del reporte: ${new Date().toLocaleString()}`;
  const headerRow = { [exportColumns[0].header]: fechaReporte };
  const emptyRow: Record<string, string> = {};
  exportColumns.forEach(col => { if (!(col.header in headerRow)) headerRow[col.header] = ''; emptyRow[col.header] = ''; });
  const finalData = [headerRow, emptyRow, ...exportData];

  // Crear hoja y libro
  const ws = XLSXUtils.json_to_sheet(finalData, { skipHeader: false });
  const wb = XLSXUtils.book_new();
  XLSXUtils.book_append_sheet(wb, ws, 'Trabajadores');
  writeFile(wb, `${fileName}.xlsx`);
};

export const exportToPDF = (data: ExportData[], fileName: string): void => {
  // Create new PDF document
  const doc = new jsPDF();
  
  // Add title
  doc.setFontSize(16);
  doc.text('Lista de Trabajadores', 14, 15);
  
  // Add date
  const fechaReporte = `Generado el: ${new Date().toLocaleString()}`;
  doc.setFontSize(10);
  doc.text(fechaReporte, 14, 22);
  
  // Convert data to string values for the table
  const tableData = data.map(item => 
    exportColumns.map(col => {
      let value = item[col.dataKey as keyof ExportData];
      if (col.dataKey === 'activo') {
        value = value ? 'ACTIVO' : 'INACTIVO';
      }
      return value === null || value === undefined ? '' : String(value);
    })
  );
  
  // Add table
  const options: AutoTableOptions = {
    head: [exportColumns.map(col => col.header)],
    body: tableData,
    startY: 30,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [41, 128, 185] }
  };
  autoTable(doc, options);
  
  // Save PDF
  doc.save(`${fileName}.pdf`);
}; 
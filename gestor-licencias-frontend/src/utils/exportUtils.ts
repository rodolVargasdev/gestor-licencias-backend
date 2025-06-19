import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipo genérico para datos exportables
export interface ExportableData {
  [key: string]: string | number | boolean | null | undefined;
}

// Función genérica para exportar a PDF
export const exportToPDF = (data: ExportableData[], title: string = 'Reporte') => {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  const doc = new jsPDF();
  
  // Título del documento
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 32);
  
  // Obtener las columnas del primer objeto
  const firstItem = data[0];
  const columns = Object.keys(firstItem).filter(key => 
    key !== 'id' && 
    !key.includes('_id') && 
    typeof firstItem[key] !== 'object'
  );
  
  // Preparar los datos de la tabla
  const tableData = data.map(item => 
    columns.map(col => {
      const value = item[col];
      if (value === null || value === undefined) return 'N/A';
      if (typeof value === 'boolean') return value ? 'Sí' : 'No';
      if (typeof value === 'string' && value.length > 30) {
        return value.substring(0, 30) + '...';
      }
      return String(value);
    })
  );

  // Crear headers legibles
  const headers = columns.map(col => {
    return col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\b(nombre|codigo|email|telefono|fecha|estado|activo)\b/gi, (match) => {
        const translations: { [key: string]: string } = {
          'nombre': 'Nombre',
          'codigo': 'Código',
          'email': 'Email',
          'telefono': 'Teléfono',
          'fecha': 'Fecha',
          'estado': 'Estado',
          'activo': 'Activo'
        };
        return translations[match.toLowerCase()] || match;
      });
  });

  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 40 },
  });

  // Guardar el PDF
  const fileName = `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
  doc.save(fileName);
};

// Función genérica para exportar a Excel
export const exportToExcel = (data: ExportableData[], title: string = 'Reporte') => {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Crear el workbook
  const wb = XLSX.utils.book_new();
  
  // Obtener las columnas del primer objeto
  const firstItem = data[0];
  const columns = Object.keys(firstItem).filter(key => 
    key !== 'id' && 
    !key.includes('_id') && 
    typeof firstItem[key] !== 'object'
  );
  
  // Preparar los datos para Excel
  const excelData = data.map(item => {
    const row: Record<string, string | number | boolean> = {};
    columns.forEach(col => {
      const value = item[col];
      if (value === null || value === undefined) {
        row[col] = 'N/A';
      } else if (typeof value === 'boolean') {
        row[col] = value ? 'Sí' : 'No';
      } else {
        row[col] = value;
      }
    });
    return row;
  });

  // Crear headers legibles
  const headers: { [key: string]: string } = {};
  columns.forEach(col => {
    const headerName = col
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/\b(nombre|codigo|email|telefono|fecha|estado|activo)\b/gi, (match) => {
        const translations: { [key: string]: string } = {
          'nombre': 'Nombre',
          'codigo': 'Código',
          'email': 'Email',
          'telefono': 'Teléfono',
          'fecha': 'Fecha',
          'estado': 'Estado',
          'activo': 'Activo'
        };
        return translations[match.toLowerCase()] || match;
      });
    headers[col] = headerName;
  });

  // Renombrar las columnas en los datos
  const renamedData = excelData.map(row => {
    const newRow: Record<string, string | number | boolean> = {};
    Object.keys(row).forEach(key => {
      newRow[headers[key]] = row[key];
    });
    return newRow;
  });

  // Crear la hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(renamedData);
  
  // Configurar el ancho de las columnas
  const columnWidths = Object.keys(headers).map(key => {
    const maxLength = Math.max(
      headers[key].length,
      ...excelData.map(row => String(row[key] || '').length)
    );
    return { wch: Math.min(Math.max(maxLength + 2, 10), 50) };
  });
  ws['!cols'] = columnWidths;

  // Agregar la hoja al workbook
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31)); // Excel sheet names limited to 31 chars
  
  // Generar el archivo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Guardar el archivo
  const fileName = `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
  saveAs(blob, fileName);
}; 
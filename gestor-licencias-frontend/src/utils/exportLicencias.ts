import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para los datos de licencias
export interface LicenciaExportData {
  id: number;
  trabajador: string;
  codigoTrabajador: string;
  tipoLicencia: string;
  codigoTipoLicencia: string;
  fechaInicio: string;
  fechaFin: string;
  duracion: string;
  estado: string;
  motivo: string;
}

// Función para exportar a PDF
export const exportToPDF = (data: LicenciaExportData[], title: string = 'Reporte de Licencias') => {
  const doc = new jsPDF();
  
  // Título del documento
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 32);
  
  // Configurar la tabla
  const tableData = data.map(item => [
    item.id.toString(),
    item.trabajador,
    item.codigoTrabajador,
    item.tipoLicencia,
    item.fechaInicio,
    item.fechaFin,
    item.duracion,
    item.estado,
    item.motivo
  ]);

  autoTable(doc, {
    head: [['ID', 'Trabajador', 'Código', 'Tipo Licencia', 'Inicio', 'Fin', 'Duración', 'Estado', 'Motivo']],
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
    columnStyles: {
      0: { cellWidth: 15 }, // ID
      1: { cellWidth: 35 }, // Trabajador
      2: { cellWidth: 20 }, // Código
      3: { cellWidth: 30 }, // Tipo Licencia
      4: { cellWidth: 20 }, // Inicio
      5: { cellWidth: 20 }, // Fin
      6: { cellWidth: 20 }, // Duración
      7: { cellWidth: 20 }, // Estado
      8: { cellWidth: 'auto' }, // Motivo
    },
    margin: { top: 40 },
  });

  // Guardar el PDF
  const fileName = `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
  doc.save(fileName);
};

// Función para exportar a Excel
export const exportToExcel = (data: LicenciaExportData[], title: string = 'Reporte de Licencias') => {
  // Crear el workbook
  const wb = XLSX.utils.book_new();
  
  // Preparar los datos para Excel
  const excelData = data.map(item => ({
    'ID': item.id,
    'Trabajador': item.trabajador,
    'Código Trabajador': item.codigoTrabajador,
    'Tipo de Licencia': item.tipoLicencia,
    'Código Tipo': item.codigoTipoLicencia,
    'Fecha Inicio': item.fechaInicio,
    'Fecha Fin': item.fechaFin,
    'Duración': item.duracion,
    'Estado': item.estado,
    'Motivo': item.motivo,
  }));

  // Crear la hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Configurar el ancho de las columnas
  const columnWidths = [
    { wch: 8 },  // ID
    { wch: 30 }, // Trabajador
    { wch: 15 }, // Código Trabajador
    { wch: 25 }, // Tipo de Licencia
    { wch: 15 }, // Código Tipo
    { wch: 12 }, // Fecha Inicio
    { wch: 12 }, // Fecha Fin
    { wch: 12 }, // Duración
    { wch: 12 }, // Estado
    { wch: 40 }, // Motivo
  ];
  ws['!cols'] = columnWidths;

  // Agregar la hoja al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Licencias');
  
  // Generar el archivo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Guardar el archivo
  const fileName = `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
  saveAs(blob, fileName);
};

// Función para formatear datos de licencias para exportación
export const formatLicenciasForExport = (
  solicitudes: any[],
  trabajadores: any[],
  tiposLicencias: any[],
  licencias: any[]
): LicenciaExportData[] => {
  return solicitudes.map(solicitud => {
    const trabajador = trabajadores.find(t => t.id === solicitud.trabajador_id);
    const tipoLicencia = tiposLicencias.find(t => t.id === solicitud.tipo_licencia_id);
    const licencia = licencias.find(l => l.solicitud_id === solicitud.id);
    
    // Calcular duración
    let duracion = '-';
    if (licencia && tipoLicencia?.unidad_control === 'horas') {
      duracion = licencia.horas_totales !== undefined ? `${Number(licencia.horas_totales)} horas` : '-';
    } else if (solicitud.fecha_inicio && solicitud.fecha_fin) {
      const inicio = new Date(solicitud.fecha_inicio).getTime();
      const fin = new Date(solicitud.fecha_fin).getTime();
      const dias = Math.floor((fin - inicio) / (1000 * 60 * 60 * 24)) + 1;
      duracion = `${dias} días`;
    }

    return {
      id: solicitud.id || 0,
      trabajador: trabajador?.nombre_completo || 'N/A',
      codigoTrabajador: trabajador?.codigo || 'N/A',
      tipoLicencia: tipoLicencia?.nombre || 'N/A',
      codigoTipoLicencia: tipoLicencia?.codigo || 'N/A',
      fechaInicio: solicitud.fecha_inicio ? format(new Date(solicitud.fecha_inicio), 'dd/MM/yyyy', { locale: es }) : '-',
      fechaFin: solicitud.fecha_fin ? format(new Date(solicitud.fecha_fin), 'dd/MM/yyyy', { locale: es }) : '-',
      duracion,
      estado: solicitud.estado || 'N/A',
      motivo: solicitud.motivo || '-',
    };
  });
}; 
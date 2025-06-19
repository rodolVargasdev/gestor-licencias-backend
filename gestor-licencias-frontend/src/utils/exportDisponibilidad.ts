import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { DisponibilidadTrabajador } from '../types/disponibilidad';

// Tipos para los datos de disponibilidad
export interface DisponibilidadExportData {
  codigo: string;
  trabajador: string;
  tipoLicencia: string;
  codigoTipoLicencia: string;
  unidadControl: string;
  periodoControl: string;
  duracionMaxima: string;
  disponible: string;
  usado: string;
  restante: string;
  cantidadRegistros: string;
  estado: string;
}

// Función para exportar a PDF
export const exportDisponibilidadToPDF = (data: DisponibilidadTrabajador[], title: string = 'Reporte de Disponibilidad') => {
  const doc = new jsPDF();
  
  // Título del documento
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado el: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}`, 14, 32);
  
  // Configurar la tabla
  const tableData = data.map(item => {
    const mapped = formatDisponibilidadForExport(item);
    return [
      mapped.codigo,
      mapped.trabajador,
      mapped.tipoLicencia,
      mapped.unidadControl,
      mapped.periodoControl,
      mapped.duracionMaxima,
      mapped.disponible,
      mapped.usado,
      mapped.restante,
      mapped.estado
    ];
  });

  autoTable(doc, {
    head: [['Código', 'Trabajador', 'Tipo Licencia', 'Unidad', 'Período', 'Máximo', 'Disponible', 'Usado', 'Restante', 'Estado']],
    body: tableData,
    startY: 40,
    styles: {
      fontSize: 7,
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
      0: { cellWidth: 20 }, // Código
      1: { cellWidth: 35 }, // Trabajador
      2: { cellWidth: 25 }, // Tipo Licencia
      3: { cellWidth: 15 }, // Unidad
      4: { cellWidth: 15 }, // Período
      5: { cellWidth: 15 }, // Máximo
      6: { cellWidth: 15 }, // Disponible
      7: { cellWidth: 15 }, // Usado
      8: { cellWidth: 15 }, // Restante
      9: { cellWidth: 15 }, // Estado
    },
    margin: { top: 40 },
  });

  // Guardar el PDF
  const fileName = `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.pdf`;
  doc.save(fileName);
};

// Función para exportar a Excel
export const exportDisponibilidadToExcel = (data: DisponibilidadTrabajador[], title: string = 'Reporte de Disponibilidad') => {
  // Crear el workbook
  const wb = XLSX.utils.book_new();
  
  // Preparar los datos para Excel
  const excelData = data.map(item => {
    const mapped = formatDisponibilidadForExport(item);
    return {
      'Código': mapped.codigo,
      'Trabajador': mapped.trabajador,
      'Tipo de Licencia': mapped.tipoLicencia,
      'Código Tipo': mapped.codigoTipoLicencia,
      'Unidad de Control': mapped.unidadControl,
      'Período de Control': mapped.periodoControl,
      'Duración Máxima': mapped.duracionMaxima,
      'Disponible': mapped.disponible,
      'Usado': mapped.usado,
      'Restante': mapped.restante,
      'Cantidad Registros': mapped.cantidadRegistros,
      'Estado': mapped.estado,
    };
  });

  // Crear la hoja de trabajo
  const ws = XLSX.utils.json_to_sheet(excelData);
  
  // Configurar el ancho de las columnas
  const columnWidths = [
    { wch: 12 }, // Código
    { wch: 30 }, // Trabajador
    { wch: 25 }, // Tipo de Licencia
    { wch: 15 }, // Código Tipo
    { wch: 18 }, // Unidad de Control
    { wch: 18 }, // Período de Control
    { wch: 15 }, // Duración Máxima
    { wch: 15 }, // Disponible
    { wch: 12 }, // Usado
    { wch: 12 }, // Restante
    { wch: 18 }, // Cantidad Registros
    { wch: 12 }, // Estado
  ];
  ws['!cols'] = columnWidths;

  // Agregar la hoja al workbook
  XLSX.utils.book_append_sheet(wb, ws, 'Disponibilidad');
  
  // Generar el archivo
  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Guardar el archivo
  const fileName = `${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyy-MM-dd_HH-mm')}.xlsx`;
  saveAs(blob, fileName);
};

// Función para formatear datos de disponibilidad para exportación
export const formatDisponibilidadForExport = (item: DisponibilidadTrabajador): DisponibilidadExportData => {
  const unidad = item.tipo_licencia?.unidad_control;
  const periodo = item.tipo_licencia?.periodo_control;
  const duracion = item.tipo_licencia?.duracion_maxima;

  // Formatear unidad de control
  let unidadControl = '-';
  switch (unidad) {
    case 'días':
      unidadControl = 'Por días';
      break;
    case 'horas':
      unidadControl = 'Por horas';
      break;
    case 'ninguno':
      unidadControl = 'Solo registro';
      break;
  }

  // Formatear período de control
  let periodoControl = '-';
  switch (periodo) {
    case 'mes':
      periodoControl = 'Mensual';
      break;
    case 'año':
      periodoControl = 'Anual';
      break;
    case 'ninguno':
      periodoControl = 'Sin período';
      break;
  }

  // Formatear duración máxima
  let duracionMaxima = '-';
  if (duracion && unidad !== 'ninguno') {
    duracionMaxima = `${duracion} ${unidad}`;
  }

  // Formatear disponible
  let disponible = '-';
  if (periodo === 'ninguno' && duracion === 0) {
    disponible = 'Sin límite';
  } else if (unidad === 'horas') {
    disponible = `${item.dias_disponibles} horas`;
  } else if (unidad === 'días') {
    disponible = `${item.dias_disponibles} días`;
  }

  // Formatear usado
  let usado = '-';
  if (periodo === 'ninguno') {
    const registros = item.cantidad_registros !== undefined ? ` en ${item.cantidad_registros} registros` : '';
    usado = `Sin límite, usados: ${item.dias_usados} días${registros}`;
  } else if (unidad === 'horas') {
    usado = `${item.dias_usados} horas`;
  } else if (unidad === 'días') {
    usado = `${item.dias_usados} días`;
  }

  // Formatear restante
  let restante = '-';
  if (periodo === 'ninguno' && duracion === 0) {
    restante = 'Sin límite';
  } else if (unidad === 'horas') {
    restante = `${item.dias_restantes} horas`;
  } else if (unidad === 'días') {
    restante = `${item.dias_restantes} días`;
  }

  // Formatear cantidad de registros
  let cantidadRegistros = '-';
  if (item.cantidad_registros !== undefined) {
    cantidadRegistros = item.cantidad_registros.toString();
  }

  return {
    codigo: item.trabajador?.codigo || 'N/A',
    trabajador: item.trabajador?.nombre_completo || 'N/A',
    tipoLicencia: item.tipo_licencia?.nombre || 'N/A',
    codigoTipoLicencia: item.tipo_licencia?.codigo || 'N/A',
    unidadControl,
    periodoControl,
    duracionMaxima,
    disponible,
    usado,
    restante,
    cantidadRegistros,
    estado: item.activo ? 'Activo' : 'Inactivo',
  };
}; 
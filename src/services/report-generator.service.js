const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportGenerator {
    static async generateExcel(data, options) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(options.sheetName || 'Reporte');

        // Configurar estilos
        const headerStyle = {
            font: { bold: true, color: { argb: 'FFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '4472C4' } },
            alignment: { horizontal: 'center' }
        };

        // Agregar encabezados
        worksheet.columns = options.columns.map(col => ({
            header: col.header,
            key: col.key,
            width: col.width || 15
        }));

        // Aplicar estilo a los encabezados
        worksheet.getRow(1).eachCell(cell => {
            cell.style = headerStyle;
        });

        // Agregar datos
        data.forEach(row => {
            worksheet.addRow(row);
        });

        // Aplicar estilos a los datos
        worksheet.getRows(2, data.length)?.forEach(row => {
            row.eachCell(cell => {
                cell.style = {
                    alignment: { horizontal: 'left' },
                    border: {
                        top: { style: 'thin' },
                        left: { style: 'thin' },
                        bottom: { style: 'thin' },
                        right: { style: 'thin' }
                    }
                };
            });
        });

        // Generar archivo
        const fileName = `${options.fileName || 'reporte'}_${Date.now()}.xlsx`;
        const filePath = path.join(__dirname, '../../temp', fileName);
        
        // Asegurar que el directorio temp existe
        if (!fs.existsSync(path.join(__dirname, '../../temp'))) {
            fs.mkdirSync(path.join(__dirname, '../../temp'), { recursive: true });
        }

        await workbook.xlsx.writeFile(filePath);
        return { fileName, filePath };
    }

    static async generatePDF(data, options) {
        const fileName = `${options.fileName || 'reporte'}_${Date.now()}.pdf`;
        const filePath = path.join(__dirname, '../../temp', fileName);
        
        // Asegurar que el directorio temp existe
        if (!fs.existsSync(path.join(__dirname, '../../temp'))) {
            fs.mkdirSync(path.join(__dirname, '../../temp'), { recursive: true });
        }

        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ size: 'A4', margin: 50 });
            const stream = fs.createWriteStream(filePath);

            doc.pipe(stream);

            // Título
            doc.fontSize(20)
               .text(options.title || 'Reporte', { align: 'center' })
               .moveDown();

            // Subtítulo
            if (options.subtitle) {
                doc.fontSize(12)
                   .text(options.subtitle, { align: 'center' })
                   .moveDown();
            }

            // Fecha de generación
            doc.fontSize(10)
               .text(`Generado el: ${new Date().toLocaleString()}`, { align: 'right' })
               .moveDown();

            // Tabla de datos
            const tableTop = 150;
            const tableLeft = 50;
            const rowHeight = 30;
            const colWidth = (doc.page.width - 100) / options.columns.length;

            // Encabezados
            doc.fontSize(10);
            options.columns.forEach((col, i) => {
                doc.text(col.header, 
                    tableLeft + (i * colWidth), 
                    tableTop, 
                    { width: colWidth, align: 'left' }
                );
            });

            // Línea separadora
            doc.moveTo(tableLeft, tableTop + 20)
               .lineTo(doc.page.width - 50, tableTop + 20)
               .stroke();

            // Datos
            data.forEach((row, rowIndex) => {
                const y = tableTop + 20 + (rowIndex * rowHeight);
                
                options.columns.forEach((col, colIndex) => {
                    doc.text(String(row[col.key] || ''), 
                        tableLeft + (colIndex * colWidth), 
                        y, 
                        { width: colWidth, align: 'left' }
                    );
                });

                // Línea separadora entre filas
                doc.moveTo(tableLeft, y + rowHeight)
                   .lineTo(doc.page.width - 50, y + rowHeight)
                   .stroke();
            });

            // Pie de página
            doc.fontSize(10)
               .text(
                   `Página ${doc.page.pageNumber} de ${doc.page.pageCount}`,
                   50,
                   doc.page.height - 50,
                   { align: 'center' }
               );

            doc.end();

            stream.on('finish', () => {
                resolve({ fileName, filePath });
            });

            stream.on('error', reject);
        });
    }

    static getColumnConfig(type) {
        const configs = {
            disponibilidad: [
                { header: 'Código Trabajador', key: 'codigo_trabajador', width: 15 },
                { header: 'Nombre', key: 'nombre_completo', width: 30 },
                { header: 'Tipo Licencia', key: 'tipo_licencia', width: 20 },
                { header: 'Días Disponibles', key: 'dias_anuales', width: 15 },
                { header: 'Horas Disponibles', key: 'horas_anuales', width: 15 },
                { header: 'Días Usados', key: 'dias_usados', width: 15 },
                { header: 'Horas Usadas', key: 'horas_usadas', width: 15 },
                { header: 'Disponibilidad Restante', key: 'disponibilidad_restante', width: 20 }
            ],
            departamento: [
                { header: 'Departamento', key: 'departamento', width: 20 },
                { header: 'Tipo Licencia', key: 'tipo_licencia', width: 20 },
                { header: 'Total Solicitudes', key: 'total_solicitudes', width: 15 },
                { header: 'Aprobadas', key: 'solicitudes_aprobadas', width: 15 },
                { header: 'Rechazadas', key: 'solicitudes_rechazadas', width: 15 },
                { header: 'Pendientes', key: 'solicitudes_pendientes', width: 15 },
                { header: 'Días Utilizados', key: 'total_dias_utilizados', width: 15 },
                { header: 'Horas Utilizadas', key: 'total_horas_utilizadas', width: 15 }
            ],
            trabajador: [
                { header: 'Código', key: 'codigo_trabajador', width: 15 },
                { header: 'Nombre', key: 'nombre_completo', width: 30 },
                { header: 'Tipo Licencia', key: 'tipo_licencia', width: 20 },
                { header: 'Total Solicitudes', key: 'total_solicitudes', width: 15 },
                { header: 'Aprobadas', key: 'solicitudes_aprobadas', width: 15 },
                { header: 'Rechazadas', key: 'solicitudes_rechazadas', width: 15 },
                { header: 'Días Usados', key: 'total_dias_utilizados', width: 15 },
                { header: 'Horas Usadas', key: 'total_horas_utilizadas', width: 15 }
            ]
        };

        return configs[type] || [];
    }
}

module.exports = ReportGenerator; 
const Reportes = require('../models/reportes.model');
const ReportGenerator = require('../services/report-generator.service');
const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const reportesService = require('../services/reportes.service');

class ReportesController {
    // Obtener disponibilidad por código de trabajador
    async getDisponibilidadByCodigoTrabajador(req, res) {
        try {
            const { codigo_trabajador, tipo_licencia_id, year, month } = req.query;

            if (!codigo_trabajador || !tipo_licencia_id || !year || !month) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos'
                });
            }

            const disponibilidad = await Reportes.getDisponibilidadByCodigoTrabajador(
                codigo_trabajador,
                tipo_licencia_id,
                year,
                month
            );

            res.json({
                success: true,
                data: disponibilidad
            });
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener disponibilidad'
            });
        }
    }

    // Generar reporte por departamento
    async getReportePorDepartamento(req, res) {
        try {
            const { departamento_id, fecha_inicio, fecha_fin, formato } = req.query;

            if (!departamento_id || !fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos'
                });
            }

            const reporte = await Reportes.getReportePorDepartamento(
                departamento_id,
                fecha_inicio,
                fecha_fin
            );

            if (formato === 'excel' || formato === 'pdf') {
                const columns = ReportGenerator.getColumnConfig('departamento');
                const options = {
                    fileName: `reporte_departamento_${departamento_id}`,
                    sheetName: 'Reporte por Departamento',
                    title: 'Reporte de Licencias por Departamento',
                    subtitle: `Período: ${fecha_inicio} al ${fecha_fin}`,
                    columns
                };

                let file;
                if (formato === 'excel') {
                    file = await ReportGenerator.generateExcel(reporte, options);
                } else {
                    file = await ReportGenerator.generatePDF(reporte, options);
                }

                res.download(file.filePath, file.fileName, (err) => {
                    if (err) {
                        console.error('Error al descargar archivo:', err);
                    }
                    fs.unlink(file.filePath, (unlinkErr) => {
                        if (unlinkErr) console.error('Error al eliminar archivo temporal:', unlinkErr);
                    });
                });
            } else {
                res.json({
                    success: true,
                    data: reporte
                });
            }
        } catch (error) {
            console.error('Error al generar reporte por departamento:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte'
            });
        }
    }

    // Generar reporte por tipo de licencia
    async getReportePorTipoLicencia(req, res) {
        try {
            const { tipo_licencia_id, fecha_inicio, fecha_fin, formato } = req.query;

            if (!tipo_licencia_id || !fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos'
                });
            }

            const reporte = await Reportes.getReportePorTipoLicencia(
                tipo_licencia_id,
                fecha_inicio,
                fecha_fin
            );

            if (formato === 'excel' || formato === 'pdf') {
                const columns = ReportGenerator.getColumnConfig('tipo_licencia');
                const options = {
                    fileName: `reporte_tipo_licencia_${tipo_licencia_id}`,
                    sheetName: 'Reporte por Tipo de Licencia',
                    title: 'Reporte de Licencias por Tipo',
                    subtitle: `Período: ${fecha_inicio} al ${fecha_fin}`,
                    columns
                };

                let file;
                if (formato === 'excel') {
                    file = await ReportGenerator.generateExcel(reporte, options);
                } else {
                    file = await ReportGenerator.generatePDF(reporte, options);
                }

                res.download(file.filePath, file.fileName, (err) => {
                    if (err) {
                        console.error('Error al descargar archivo:', err);
                    }
                    fs.unlink(file.filePath, (unlinkErr) => {
                        if (unlinkErr) console.error('Error al eliminar archivo temporal:', unlinkErr);
                    });
                });
            } else {
                res.json({
                    success: true,
                    data: reporte
                });
            }
        } catch (error) {
            console.error('Error al generar reporte por tipo de licencia:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte'
            });
        }
    }

    // Generar reporte por trabajador
    async getReportePorTrabajador(req, res) {
        try {
            const { trabajador_id, fecha_inicio, fecha_fin, formato } = req.query;

            if (!trabajador_id || !fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos'
                });
            }

            const reporte = await Reportes.getReportePorTrabajador(
                trabajador_id,
                fecha_inicio,
                fecha_fin
            );

            if (formato === 'excel' || formato === 'pdf') {
                const columns = ReportGenerator.getColumnConfig('trabajador');
                const options = {
                    fileName: `reporte_trabajador_${trabajador_id}`,
                    sheetName: 'Reporte por Trabajador',
                    title: 'Reporte de Licencias por Trabajador',
                    subtitle: `Período: ${fecha_inicio} al ${fecha_fin}`,
                    columns
                };

                let file;
                if (formato === 'excel') {
                    file = await ReportGenerator.generateExcel(reporte, options);
                } else {
                    file = await ReportGenerator.generatePDF(reporte, options);
                }

                res.download(file.filePath, file.fileName, (err) => {
                    if (err) {
                        console.error('Error al descargar archivo:', err);
                    }
                    fs.unlink(file.filePath, (unlinkErr) => {
                        if (unlinkErr) console.error('Error al eliminar archivo temporal:', unlinkErr);
                    });
                });
            } else {
                res.json({
                    success: true,
                    data: reporte
                });
            }
        } catch (error) {
            console.error('Error al generar reporte por trabajador:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte'
            });
        }
    }

    // Generar reporte de tendencias
    async getReporteTendencias(req, res) {
        try {
            const { fecha_inicio, fecha_fin, formato } = req.query;

            if (!fecha_inicio || !fecha_fin) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos'
                });
            }

            const reporte = await Reportes.getReporteTendencias(fecha_inicio, fecha_fin);

            if (formato === 'excel' || formato === 'pdf') {
                const columns = [
                    { header: 'Mes', key: 'mes', width: 15 },
                    { header: 'Total Solicitudes', key: 'total_solicitudes', width: 15 },
                    { header: 'Aprobadas', key: 'solicitudes_aprobadas', width: 15 },
                    { header: 'Rechazadas', key: 'solicitudes_rechazadas', width: 15 },
                    { header: 'Tiempo Promedio Respuesta', key: 'tiempo_promedio_respuesta', width: 25 }
                ];

                const options = {
                    fileName: 'reporte_tendencias',
                    sheetName: 'Reporte de Tendencias',
                    title: 'Reporte de Tendencias de Licencias',
                    subtitle: `Período: ${fecha_inicio} al ${fecha_fin}`,
                    columns
                };

                let file;
                if (formato === 'excel') {
                    file = await ReportGenerator.generateExcel(reporte, options);
                } else {
                    file = await ReportGenerator.generatePDF(reporte, options);
                }

                res.download(file.filePath, file.fileName, (err) => {
                    if (err) {
                        console.error('Error al descargar archivo:', err);
                    }
                    fs.unlink(file.filePath, (unlinkErr) => {
                        if (unlinkErr) console.error('Error al eliminar archivo temporal:', unlinkErr);
                    });
                });
            } else {
                res.json({
                    success: true,
                    data: reporte
                });
            }
        } catch (error) {
            console.error('Error al generar reporte de tendencias:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte'
            });
        }
    }

    // Generar reporte de disponibilidad global
    async getReporteDisponibilidadGlobal(req, res) {
        try {
            const { year, month, formato } = req.query;

            if (!year || !month) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan parámetros requeridos'
                });
            }

            const reporte = await Reportes.getReporteDisponibilidadGlobal(year, month);

            if (formato === 'excel' || formato === 'pdf') {
                const columns = ReportGenerator.getColumnConfig('disponibilidad');
                const options = {
                    fileName: 'reporte_disponibilidad_global',
                    sheetName: 'Reporte de Disponibilidad Global',
                    title: 'Reporte de Disponibilidad Global de Licencias',
                    subtitle: `Período: ${month}/${year}`,
                    columns
                };

                let file;
                if (formato === 'excel') {
                    file = await ReportGenerator.generateExcel(reporte, options);
                } else {
                    file = await ReportGenerator.generatePDF(reporte, options);
                }

                res.download(file.filePath, file.fileName, (err) => {
                    if (err) {
                        console.error('Error al descargar archivo:', err);
                    }
                    fs.unlink(file.filePath, (unlinkErr) => {
                        if (unlinkErr) console.error('Error al eliminar archivo temporal:', unlinkErr);
                    });
                });
            } else {
                res.json({
                    success: true,
                    data: reporte
                });
            }
        } catch (error) {
            console.error('Error al generar reporte de disponibilidad global:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar reporte'
            });
        }
    }

    // Obtener disponibilidad por código de trabajador (versión SQL)
    async getDisponibilidadPorCodigoTrabajador(req, res) {
        const { codigo } = req.params;
        if (!codigo) {
            return res.status(400).json({ status: 'error', message: 'Código de trabajador requerido' });
        }
        try {
            const result = await pool.query(`
                SELECT
                  tl.id AS tipo_licencia_id,
                  tl.nombre AS tipo_licencia,
                  tl.limite_anual_horas,
                  tl.limite_mensual_horas,
                  COALESCE(SUM(
                    CASE
                      WHEN EXTRACT(YEAR FROM sl.fecha_hora_inicio_permiso) = EXTRACT(YEAR FROM CURRENT_DATE)
                      THEN sl.cantidad_horas ELSE 0 END
                  ), 0) AS usado_anual,
                  COALESCE(SUM(
                    CASE
                      WHEN EXTRACT(YEAR FROM sl.fecha_hora_inicio_permiso) = EXTRACT(YEAR FROM CURRENT_DATE)
                       AND EXTRACT(MONTH FROM sl.fecha_hora_inicio_permiso) = EXTRACT(MONTH FROM CURRENT_DATE)
                      THEN sl.cantidad_horas ELSE 0 END
                  ), 0) AS usado_mensual
                FROM tipos_licencias tl
                LEFT JOIN solicitudes_licencias sl
                  ON tl.id = sl.tipo_licencia_id
                  AND sl.trabajador_id = (SELECT id FROM trabajadores WHERE codigo_trabajador = $1)
                  AND sl.estado = 'APROBADA'
                GROUP BY tl.id, tl.nombre, tl.limite_anual_horas, tl.limite_mensual_horas
                ORDER BY tl.nombre;
            `, [codigo]);
            res.json({ status: 'success', data: result.rows });
        } catch (error) {
            console.error('Error al obtener disponibilidad:', error);
            res.status(500).json({ status: 'error', message: 'Error al obtener la disponibilidad' });
        }
    }

    // Reporte de licencias por período
    async reporteLicenciasPorPeriodo(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const reporte = await reportesService.reporteLicenciasPorPeriodo(fechaInicio, fechaFin);
            res.json(reporte);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Reporte de solicitudes por estado
    async reporteSolicitudesPorEstado(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const reporte = await reportesService.reporteSolicitudesPorEstado(fechaInicio, fechaFin);
            res.json(reporte);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Reporte de disponibilidad por período
    async reporteDisponibilidadPorPeriodo(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const reporte = await reportesService.reporteDisponibilidadPorPeriodo(fechaInicio, fechaFin);
            res.json(reporte);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    // Reporte de límites por tipo de licencia
    async reporteLímitesPorTipoLicencia(req, res) {
        try {
            const { anio } = req.query;
            const reporte = await reportesService.reporteLímitesPorTipoLicencia(anio);
            res.json(reporte);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

// Exportar una única instancia del controlador
module.exports = new ReportesController(); 
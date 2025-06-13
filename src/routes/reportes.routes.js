const express = require('express');
const router = express.Router();
const reportesController = require('../controllers/reportes.controller');

// Ruta raíz que devuelve la lista de reportes disponibles
router.get('/', (req, res) => {
    res.json({
        success: true,
        data: {
            reportes: [
                {
                    nombre: 'Reporte por Departamento',
                    endpoint: '/api/reportes/departamento',
                    parametros: ['departamento_id', 'fecha_inicio', 'fecha_fin', 'formato']
                },
                {
                    nombre: 'Reporte por Tipo de Licencia',
                    endpoint: '/api/reportes/tipo-licencia',
                    parametros: ['tipo_licencia_id', 'fecha_inicio', 'fecha_fin', 'formato']
                },
                {
                    nombre: 'Reporte de Tendencias',
                    endpoint: '/api/reportes/tendencias',
                    parametros: ['fecha_inicio', 'fecha_fin', 'formato']
                },
                {
                    nombre: 'Reporte de Licencias por Período',
                    endpoint: '/api/reportes/licencias-periodo',
                    parametros: ['fechaInicio', 'fechaFin']
                },
                {
                    nombre: 'Reporte de Solicitudes por Estado',
                    endpoint: '/api/reportes/solicitudes-estado',
                    parametros: ['fechaInicio', 'fechaFin']
                },
                {
                    nombre: 'Reporte de Límites por Tipo de Licencia',
                    endpoint: '/api/reportes/limites-tipo-licencia',
                    parametros: ['anio']
                }
            ]
        }
    });
});

// ==========================================
// Rutas de Disponibilidad
// ==========================================

// Obtener disponibilidad por código de trabajador (query params)
router.get('/disponibilidad', reportesController.getDisponibilidadByCodigoTrabajador);

// Obtener disponibilidad por código de trabajador (path params)
router.get('/disponibilidad/:codigo', reportesController.getDisponibilidadPorCodigoTrabajador);

// Obtener disponibilidad global
router.get('/disponibilidad-global', reportesController.getReporteDisponibilidadGlobal);

// Obtener disponibilidad por período
router.get('/disponibilidad-periodo', reportesController.reporteDisponibilidadPorPeriodo);

// ==========================================
// Rutas de Reportes por Entidad
// ==========================================

// Reportes por departamento
router.get('/departamento', reportesController.getReportePorDepartamento);

// Reportes por tipo de licencia
router.get('/tipo-licencia', reportesController.getReportePorTipoLicencia);

// Reportes por trabajador
router.get('/trabajador', reportesController.getReportePorTrabajador);

// ==========================================
// Rutas de Reportes Especializados
// ==========================================

// Reporte de tendencias
router.get('/tendencias', reportesController.getReporteTendencias);

// Reporte de licencias por período
router.get('/licencias-periodo', reportesController.reporteLicenciasPorPeriodo);

// Reporte de solicitudes por estado
router.get('/solicitudes-estado', reportesController.reporteSolicitudesPorEstado);

// Reporte de límites por tipo de licencia
router.get('/limites-tipo-licencia', reportesController.reporteLímitesPorTipoLicencia);

module.exports = router; 
const express = require('express');
const router = express.Router();
const licenciasController = require('../controllers/licencias.controller');

// ENDPOINT PRINCIPAL PARA LICENCIAS
// Este endpoint maneja la creación directa de licencias
// Para solicitudes, usar /api/solicitudes

// Rutas básicas CRUD
router.post('/', licenciasController.create);
router.get('/', licenciasController.findAll);
router.get('/:id', licenciasController.findById);
router.put('/:id', licenciasController.update);
router.delete('/:id', licenciasController.delete);

// Rutas adicionales
router.get('/trabajador/:trabajadorId', licenciasController.findByTrabajador);
router.get('/tipo-licencia/:tipoLicenciaId', licenciasController.findByTipoLicencia);
router.get('/estado/:estado', licenciasController.findByEstado);
router.get('/solicitud/:solicitudId', licenciasController.findBySolicitud);
router.get('/fecha', licenciasController.findByFecha);

module.exports = router; 
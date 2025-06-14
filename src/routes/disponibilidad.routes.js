const express = require('express');
const router = express.Router();
const disponibilidadController = require('../controllers/disponibilidad.controller');

// Rutas básicas CRUD
router.post('/', disponibilidadController.create);
router.get('/', disponibilidadController.findAll);
router.get('/:id', disponibilidadController.findById);
router.put('/:id', disponibilidadController.update);
router.delete('/:id', disponibilidadController.delete);

// Rutas adicionales
router.get('/trabajador/:trabajadorId', disponibilidadController.findByTrabajador);
router.get('/fecha/:fecha', disponibilidadController.findByFecha);
router.get('/rango-fechas', disponibilidadController.findByRangoFechas);
router.get('/estado/:disponible', disponibilidadController.findByDisponibilidad);
router.get('/verificar', disponibilidadController.verificarDisponibilidad);
router.get('/anio/:anio', disponibilidadController.findByAnio);
router.get('/codigo/:codigo', disponibilidadController.findByCodigoTrabajador);

module.exports = router; 
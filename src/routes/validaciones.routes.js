const express = require('express');
const router = express.Router();
const validacionesController = require('../controllers/validaciones.controller');

// Rutas básicas CRUD
router.post('/', validacionesController.create);
router.get('/', validacionesController.findAll);
router.get('/:id', validacionesController.findById);
router.put('/:id', validacionesController.update);
router.delete('/:id', validacionesController.delete);

// Rutas adicionales
router.get('/solicitud/:solicitudId', validacionesController.findBySolicitud);
router.get('/validador/:validadorId', validacionesController.findByValidador);
router.get('/estado/:estado', validacionesController.findByEstado);

module.exports = router; 
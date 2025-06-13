const express = require('express');
const router = express.Router();
const puestosController = require('../controllers/puestos.controller');

// Rutas para puestos
router.get('/', puestosController.getAllPuestos);
router.get('/:id', puestosController.getPuestoById);
router.post('/', puestosController.createPuesto);
router.put('/:id', puestosController.updatePuesto);
router.delete('/:id', puestosController.deletePuesto);

module.exports = router; 
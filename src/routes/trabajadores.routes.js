const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadores.controller');

// Rutas básicas CRUD
router.post('/', trabajadoresController.create);
router.get('/', trabajadoresController.findAll);
router.get('/:id', trabajadoresController.findById);
router.put('/:id', trabajadoresController.update);
router.delete('/:id', trabajadoresController.delete);

// Rutas adicionales
router.get('/tipo/:tipoPersonal', trabajadoresController.findByTipoPersonal);
router.get('/departamento/:departamentoId', trabajadoresController.findByDepartamento);
router.get('/:id/licencias/activas', trabajadoresController.getLicenciasActivas);
router.get('/:id/licencias/periodo', trabajadoresController.getLicenciasPorPeriodo);

module.exports = router; 
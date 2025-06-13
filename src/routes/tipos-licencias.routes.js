const express = require('express');
const { TiposLicenciasController } = require('../controllers/tipos-licencias.controller');

const router = express.Router();
const controller = new TiposLicenciasController();

// CRUD básico
router.post('/', controller.create.bind(controller));
router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.put('/:id', controller.update.bind(controller));
router.delete('/:id', controller.delete.bind(controller));

// Rutas adicionales
router.get('/departamento/:departamentoId', controller.findByDepartamento.bind(controller));
router.get('/cargo/:cargoId', controller.findByCargo.bind(controller));
router.get('/tipo-personal/:tipoPersonalId', controller.findByTipoPersonal.bind(controller));

module.exports = router; 
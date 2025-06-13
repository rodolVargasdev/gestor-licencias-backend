const express = require('express');
const router = express.Router();
const solicitudesController = require('../controllers/solicitudes.controller');

// Rutas básicas CRUD
router.post('/', solicitudesController.create);
router.get('/', solicitudesController.findAll);
router.get('/:id', solicitudesController.findById);
router.put('/:id', solicitudesController.update);
router.delete('/:id', solicitudesController.delete);

// Rutas adicionales
router.get('/trabajador/:trabajadorId', solicitudesController.findByTrabajador);
router.get('/tipo-licencia/:tipoLicenciaId', solicitudesController.findByTipoLicencia);
router.get('/estado/:estado', solicitudesController.findByEstado);

module.exports = router; 
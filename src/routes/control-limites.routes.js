const express = require('express');
const router = express.Router();
const controlLimitesController = require('../controllers/control-limites.controller');

// Rutas básicas CRUD
router.post('/', controlLimitesController.create);
router.get('/', controlLimitesController.findAll);
router.get('/:id', controlLimitesController.findById);
router.put('/:id', controlLimitesController.update);
router.delete('/:id', controlLimitesController.delete);

// Rutas adicionales
router.get('/trabajador/:trabajadorId', controlLimitesController.findByTrabajador);
router.get('/tipo-licencia/:tipoLicenciaId', controlLimitesController.findByTipoLicencia);
router.get('/anio/:anio', controlLimitesController.findByAnio);

module.exports = router; 
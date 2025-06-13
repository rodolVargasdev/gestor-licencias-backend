const express = require('express');
const router = express.Router();
const auditoriaController = require('../controllers/auditoria.controller');

// Rutas para auditoría
router.get('/', auditoriaController.getAuditoria);
router.get('/resumen', auditoriaController.getResumenAuditoria);
router.post('/', auditoriaController.registrarAccion);

module.exports = router; 
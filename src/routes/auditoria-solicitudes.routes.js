const express = require('express');
const router = express.Router();
const auditoriaSolicitudesController = require('../controllers/auditoria-solicitudes.controller');

// Rutas básicas CRUD
router.post('/', auditoriaSolicitudesController.create);
router.get('/', auditoriaSolicitudesController.findAll);
router.get('/:id', auditoriaSolicitudesController.findById);

// Rutas adicionales
router.get('/solicitud/:solicitudId', auditoriaSolicitudesController.findBySolicitud);
router.get('/usuario/:usuarioId', auditoriaSolicitudesController.findByUsuario);
router.get('/estado/:estado', auditoriaSolicitudesController.findByEstado);
router.get('/fecha', auditoriaSolicitudesController.findByFecha);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const departamentosController = require('../controllers/departamentos.controller');

// Validaciones
const validarDepartamento = [
  body('nombre').notEmpty().withMessage('El nombre es requerido'),
  body('descripcion').optional(),
  body('activo').isBoolean().withMessage('El campo activo debe ser booleano')
];

// Rutas
router.get('/', departamentosController.getAllDepartamentos);
router.get('/:id', departamentosController.getDepartamentoById);
router.post('/', validarDepartamento, departamentosController.createDepartamento);
router.put('/:id', validarDepartamento, departamentosController.updateDepartamento);
router.delete('/:id', departamentosController.deleteDepartamento);

module.exports = router; 
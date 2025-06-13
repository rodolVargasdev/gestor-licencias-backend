const { AppDataSource } = require('../config/database');
const { validationResult } = require('express-validator');

// Obtener el repositorio de Departamento
const getRepo = () => AppDataSource.getRepository('Departamento');

// Obtener todos los departamentos
exports.getAllDepartamentos = async (req, res) => {
  try {
    const repo = getRepo();
    const departamentos = await repo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
    res.json({ status: 'success', data: departamentos });
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener los departamentos' });
  }
};

// Obtener un departamento por ID
exports.getDepartamentoById = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = getRepo();
    const departamento = await repo.findOneBy({ id: parseInt(id) });
    if (!departamento) {
      return res.status(404).json({ status: 'error', message: 'Departamento no encontrado' });
    }
    res.json({ status: 'success', data: departamento });
  } catch (error) {
    console.error('Error al obtener departamento:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener el departamento' });
  }
};

// Crear un nuevo departamento
exports.createDepartamento = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    const { nombre, descripcion, activo = true } = req.body;
    const repo = getRepo();
    const nuevo = repo.create({ nombre, descripcion, activo });
    const saved = await repo.save(nuevo);
    res.status(201).json({ status: 'success', data: saved });
  } catch (error) {
    console.error('Error al crear departamento:', error);
    res.status(500).json({ status: 'error', message: 'Error al crear el departamento' });
  }
};

// Actualizar un departamento
exports.updateDepartamento = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    const repo = getRepo();
    let departamento = await repo.findOneBy({ id: parseInt(id) });
    if (!departamento) {
      return res.status(404).json({ status: 'error', message: 'Departamento no encontrado' });
    }
    departamento.nombre = nombre;
    departamento.descripcion = descripcion;
    departamento.activo = activo;
    const updated = await repo.save(departamento);
    res.json({ status: 'success', data: updated });
  } catch (error) {
    console.error('Error al actualizar departamento:', error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar el departamento' });
  }
};

// Eliminar un departamento (soft delete)
exports.deleteDepartamento = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = getRepo();
    let departamento = await repo.findOneBy({ id: parseInt(id) });
    if (!departamento) {
      return res.status(404).json({ status: 'error', message: 'Departamento no encontrado' });
    }
    departamento.activo = false;
    await repo.save(departamento);
    res.json({ status: 'success', message: 'Departamento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar departamento:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar el departamento' });
  }
}; 
const { AppDataSource } = require('../config/database');

const getRepo = () => AppDataSource.getRepository('Puesto');

// Obtener todos los puestos
exports.getAllPuestos = async (req, res) => {
  try {
    const repo = getRepo();
    const puestos = await repo.find({ where: { activo: true }, order: { nombre: 'ASC' } });
    res.json({ status: 'success', data: puestos });
  } catch (error) {
    console.error('Error al obtener puestos:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener los puestos' });
  }
};

// Obtener un puesto por ID
exports.getPuestoById = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = getRepo();
    const puesto = await repo.findOneBy({ id: parseInt(id) });
    if (!puesto) {
      return res.status(404).json({ status: 'error', message: 'Puesto no encontrado' });
    }
    res.json({ status: 'success', data: puesto });
  } catch (error) {
    console.error('Error al obtener puesto:', error);
    res.status(500).json({ status: 'error', message: 'Error al obtener el puesto' });
  }
};

// Crear un nuevo puesto
exports.createPuesto = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    const repo = getRepo();
    const nuevo = repo.create({ nombre, descripcion, activo: true });
    const saved = await repo.save(nuevo);
    res.status(201).json({ status: 'success', data: saved });
  } catch (error) {
    console.error('Error al crear puesto:', error);
    res.status(500).json({ status: 'error', message: 'Error al crear el puesto' });
  }
};

// Actualizar un puesto
exports.updatePuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, activo } = req.body;
    const repo = getRepo();
    let puesto = await repo.findOneBy({ id: parseInt(id) });
    if (!puesto) {
      return res.status(404).json({ status: 'error', message: 'Puesto no encontrado' });
    }
    puesto.nombre = nombre;
    puesto.descripcion = descripcion;
    puesto.activo = activo;
    const updated = await repo.save(puesto);
    res.json({ status: 'success', data: updated });
  } catch (error) {
    console.error('Error al actualizar puesto:', error);
    res.status(500).json({ status: 'error', message: 'Error al actualizar el puesto' });
  }
};

// Eliminar un puesto (soft delete)
exports.deletePuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const repo = getRepo();
    let puesto = await repo.findOneBy({ id: parseInt(id) });
    if (!puesto) {
      return res.status(404).json({ status: 'error', message: 'Puesto no encontrado' });
    }
    puesto.activo = false;
    await repo.save(puesto);
    res.json({ status: 'success', message: 'Puesto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar puesto:', error);
    res.status(500).json({ status: 'error', message: 'Error al eliminar el puesto' });
  }
}; 
const validacionesService = require('../services/validaciones.service');

class ValidacionesController {
    async create(req, res) {
        try {
            const validacion = await validacionesService.create(req.body);
            res.status(201).json(validacion);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const validaciones = await validacionesService.findAll();
            res.json(validaciones);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req, res) {
        try {
            const validacion = await validacionesService.findById(req.params.id);
            res.json(validacion);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const validacion = await validacionesService.update(req.params.id, req.body);
            res.json(validacion);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await validacionesService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findBySolicitud(req, res) {
        try {
            const validaciones = await validacionesService.findBySolicitud(req.params.solicitudId);
            res.json(validaciones);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByValidador(req, res) {
        try {
            const validaciones = await validacionesService.findByValidador(req.params.validadorId);
            res.json(validaciones);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByEstado(req, res) {
        try {
            const validaciones = await validacionesService.findByEstado(req.params.estado);
            res.json(validaciones);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ValidacionesController(); 
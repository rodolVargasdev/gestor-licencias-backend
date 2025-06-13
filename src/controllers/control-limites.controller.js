const controlLimitesService = require('../services/control-limites.service');

class ControlLimitesController {
    async create(req, res) {
        try {
            const controlLimite = await controlLimitesService.create(req.body);
            res.status(201).json(controlLimite);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const controlLimites = await controlLimitesService.findAll();
            res.json(controlLimites);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req, res) {
        try {
            const controlLimite = await controlLimitesService.findById(req.params.id);
            res.json(controlLimite);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const controlLimite = await controlLimitesService.update(req.params.id, req.body);
            res.json(controlLimite);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await controlLimitesService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByTrabajador(req, res) {
        try {
            const controlLimites = await controlLimitesService.findByTrabajador(req.params.trabajadorId);
            res.json(controlLimites);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByTipoLicencia(req, res) {
        try {
            const controlLimites = await controlLimitesService.findByTipoLicencia(req.params.tipoLicenciaId);
            res.json(controlLimites);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByAnio(req, res) {
        try {
            const controlLimites = await controlLimitesService.findByAnio(req.params.anio);
            res.json(controlLimites);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new ControlLimitesController(); 
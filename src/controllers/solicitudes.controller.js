const solicitudesService = require('../services/solicitudes.service');

class SolicitudesController {
    async create(req, res) {
        try {
            const solicitud = await solicitudesService.create(req.body);
            res.status(201).json(solicitud);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const solicitudes = await solicitudesService.findAll();
            res.json(solicitudes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req, res) {
        try {
            const solicitud = await solicitudesService.findById(req.params.id);
            res.json(solicitud);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const solicitud = await solicitudesService.update(req.params.id, req.body);
            res.json(solicitud);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await solicitudesService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByTrabajador(req, res) {
        try {
            const solicitudes = await solicitudesService.findByTrabajador(req.params.trabajadorId);
            res.json(solicitudes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByTipoLicencia(req, res) {
        try {
            const solicitudes = await solicitudesService.findByTipoLicencia(req.params.tipoLicenciaId);
            res.json(solicitudes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByEstado(req, res) {
        try {
            const solicitudes = await solicitudesService.findByEstado(req.params.estado);
            res.json(solicitudes);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = new SolicitudesController(); 
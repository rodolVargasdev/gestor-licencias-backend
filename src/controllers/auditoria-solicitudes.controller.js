const auditoriaSolicitudesService = require('../services/auditoria-solicitudes.service');

class AuditoriaSolicitudesController {
    async create(req, res) {
        try {
            const auditoria = await auditoriaSolicitudesService.create(req.body);
            res.status(201).json(auditoria);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const auditorias = await auditoriaSolicitudesService.findAll();
            res.json(auditorias);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req, res) {
        try {
            const auditoria = await auditoriaSolicitudesService.findById(req.params.id);
            res.json(auditoria);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async findBySolicitud(req, res) {
        try {
            const auditorias = await auditoriaSolicitudesService.findBySolicitud(req.params.solicitudId);
            res.json(auditorias);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByUsuario(req, res) {
        try {
            const auditorias = await auditoriaSolicitudesService.findByUsuario(req.params.usuarioId);
            res.json(auditorias);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByEstado(req, res) {
        try {
            const auditorias = await auditoriaSolicitudesService.findByEstado(req.params.estado);
            res.json(auditorias);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByFecha(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const auditorias = await auditoriaSolicitudesService.findByFecha(fechaInicio, fechaFin);
            res.json(auditorias);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new AuditoriaSolicitudesController(); 
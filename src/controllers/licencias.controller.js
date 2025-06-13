const licenciasService = require('../services/licencias.service');

class LicenciasController {
    async create(req, res) {
        try {
            const licencia = await licenciasService.create(req.body);
            res.status(201).json(licencia);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const licencias = await licenciasService.findAll();
            res.json(licencias);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req, res) {
        try {
            const licencia = await licenciasService.findById(req.params.id);
            res.json(licencia);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const licencia = await licenciasService.update(req.params.id, req.body);
            res.json(licencia);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await licenciasService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByTrabajador(req, res) {
        try {
            const licencias = await licenciasService.findByTrabajador(req.params.trabajadorId);
            res.json(licencias);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByTipoLicencia(req, res) {
        try {
            const licencias = await licenciasService.findByTipoLicencia(req.params.tipoLicenciaId);
            res.json(licencias);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByEstado(req, res) {
        try {
            const licencias = await licenciasService.findByEstado(req.params.estado);
            res.json(licencias);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findBySolicitud(req, res) {
        try {
            const licencia = await licenciasService.findBySolicitud(req.params.solicitudId);
            res.json(licencia);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByFecha(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const licencias = await licenciasService.findByFecha(fechaInicio, fechaFin);
            res.json(licencias);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new LicenciasController(); 
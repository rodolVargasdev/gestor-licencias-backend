const disponibilidadService = require('../services/disponibilidad.service');

class DisponibilidadController {
    async create(req, res) {
        try {
            const disponibilidad = await disponibilidadService.create(req.body);
            res.status(201).json(disponibilidad);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const disponibilidades = await disponibilidadService.findAll();
            res.json(disponibilidades);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req, res) {
        try {
            const disponibilidad = await disponibilidadService.findById(req.params.id);
            res.json(disponibilidad);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            const disponibilidad = await disponibilidadService.update(req.params.id, req.body);
            res.json(disponibilidad);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            await disponibilidadService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByTrabajador(req, res) {
        try {
            const disponibilidades = await disponibilidadService.findByTrabajador(req.params.trabajadorId);
            res.json(disponibilidades);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByFecha(req, res) {
        try {
            const disponibilidades = await disponibilidadService.findByFecha(req.params.fecha);
            res.json(disponibilidades);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByRangoFechas(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const disponibilidades = await disponibilidadService.findByRangoFechas(fechaInicio, fechaFin);
            res.json(disponibilidades);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findByDisponibilidad(req, res) {
        try {
            const disponibilidades = await disponibilidadService.findByDisponibilidad(req.params.disponible === 'true');
            res.json(disponibilidades);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async verificarDisponibilidad(req, res) {
        try {
            const { trabajadorId, fecha } = req.query;
            const disponible = await disponibilidadService.verificarDisponibilidad(trabajadorId, fecha);
            res.json({ disponible });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new DisponibilidadController(); 
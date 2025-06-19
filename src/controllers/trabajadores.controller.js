const trabajadoresService = require('../services/trabajadores.service');

class TrabajadoresController {
    async create(req, res) {
        try {
            const trabajador = await trabajadoresService.create(req.body);
            res.status(201).json(trabajador);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async findAll(req, res) {
        try {
            if (req.query.codigo) {
                const trabajador = await trabajadoresService.findByCodigo(req.query.codigo);
                if (trabajador) {
                    res.json([trabajador]);
                } else {
                    res.json([]);
                }
            } else {
                const trabajadores = await trabajadoresService.findAll();
                res.json(trabajadores);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findById(req, res) {
        try {
            const trabajador = await trabajadoresService.findById(req.params.id);
            res.json(trabajador);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const trabajador = await trabajadoresService.update(req.params.id, req.body);
            res.json(trabajador);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req, res) {
        try {
            await trabajadoresService.delete(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async findByTipoPersonal(req, res) {
        try {
            const trabajadores = await trabajadoresService.findByTipoPersonal(req.params.tipoPersonal);
            res.json(trabajadores);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async findByDepartamento(req, res) {
        try {
            const trabajadores = await trabajadoresService.findByDepartamento(req.params.departamentoId);
            res.json(trabajadores);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getLicenciasActivas(req, res) {
        try {
            const licencias = await trabajadoresService.getLicenciasActivas(req.params.id);
            res.json(licencias);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async getLicenciasPorPeriodo(req, res) {
        try {
            const { fechaInicio, fechaFin } = req.query;
            const licencias = await trabajadoresService.getLicenciasPorPeriodo(
                req.params.id,
                fechaInicio,
                fechaFin
            );
            res.json(licencias);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    }

    async importFromExcel(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ 
                    error: 'No se ha proporcionado ningún archivo' 
                });
            }

            const results = await trabajadoresService.importFromExcel(req.file.buffer);
            
            res.json({
                success: true,
                message: `Importación completada. ${results.success} trabajadores importados exitosamente de ${results.total} totales.`,
                data: results
            });
        } catch (error) {
            res.status(400).json({ 
                error: error.message,
                success: false 
            });
        }
    }
}

module.exports = new TrabajadoresController(); 
const { TipoLicenciaService } = require('../services/tipos-licencias.service');

class TiposLicenciasController {
    constructor() {
        this.tipoLicenciaService = new TipoLicenciaService();
    }

    async create(req, res) {
        try {
            const tipoLicencia = await this.tipoLicenciaService.create(req.body);
            res.status(201).json(tipoLicencia);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async findAll(req, res) {
        try {
            const tiposLicencias = await this.tipoLicenciaService.findAll();
            res.json(tiposLicencias);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findById(req, res) {
        try {
            const tipoLicencia = await this.tipoLicenciaService.findById(req.params.id);
            if (!tipoLicencia) {
                return res.status(404).json({ message: 'Tipo de licencia no encontrado' });
            }
            res.json(tipoLicencia);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByCodigo(req, res) {
        try {
            const tipoLicencia = await this.tipoLicenciaService.findByCodigo(req.params.codigo);
            res.json(tipoLicencia);
        } catch (error) {
            res.status(404).json({ error: error.message });
        }
    }

    async findByPersonalOperativo(req, res) {
        try {
            const tiposLicencias = await this.tipoLicenciaService.findByPersonalOperativo();
            res.json(tiposLicencias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findByPersonalAdministrativo(req, res) {
        try {
            const tiposLicencias = await this.tipoLicenciaService.findByPersonalAdministrativo();
            res.json(tiposLicencias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async findByGoceSalario(req, res) {
        try {
            const tiposLicencias = await this.tipoLicenciaService.findByGoceSalario();
            res.json(tiposLicencias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    async update(req, res) {
        try {
            const tipoLicencia = await this.tipoLicenciaService.update(req.params.id, req.body);
            if (!tipoLicencia) {
                return res.status(404).json({ message: 'Tipo de licencia no encontrado' });
            }
            res.json(tipoLicencia);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            const result = await this.tipoLicenciaService.delete(req.params.id);
            if (!result) {
                return res.status(404).json({ message: 'Tipo de licencia no encontrado' });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByDepartamento(req, res) {
        try {
            const tiposLicencias = await this.tipoLicenciaService.findByDepartamento(req.params.departamentoId);
            res.json(tiposLicencias);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByCargo(req, res) {
        try {
            const tiposLicencias = await this.tipoLicenciaService.findByCargo(req.params.cargoId);
            res.json(tiposLicencias);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    async findByTipoPersonal(req, res) {
        try {
            const tiposLicencias = await this.tipoLicenciaService.findByTipoPersonal(req.params.tipoPersonalId);
            res.json(tiposLicencias);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

module.exports = { TiposLicenciasController }; 
const express = require('express');
const router = express.Router();
const trabajadoresController = require('../controllers/trabajadores.controller');
const multer = require('multer');

// Configurar multer para manejo de archivos
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB máximo
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel' ||
            file.originalname.endsWith('.xlsx') ||
            file.originalname.endsWith('.xls')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
        }
    }
});

// Rutas básicas CRUD
router.post('/', trabajadoresController.create);
router.get('/', trabajadoresController.findAll);
router.get('/:id', trabajadoresController.findById);
router.put('/:id', trabajadoresController.update);
router.delete('/:id', trabajadoresController.delete);

// Ruta de importación
router.post('/import', upload.single('file'), trabajadoresController.importFromExcel);

// Rutas adicionales
router.get('/tipo/:tipoPersonal', trabajadoresController.findByTipoPersonal);
router.get('/departamento/:departamentoId', trabajadoresController.findByDepartamento);
router.get('/:id/licencias/activas', trabajadoresController.getLicenciasActivas);
router.get('/:id/licencias/periodo', trabajadoresController.getLicenciasPorPeriodo);

module.exports = router; 
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
        console.log('Archivo recibido:', {
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
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

// Middleware para manejar errores de multer
const handleMulterError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'El archivo es demasiado grande. Máximo 5MB permitido.',
                success: false 
            });
        }
        return res.status(400).json({ 
            error: `Error al procesar el archivo: ${error.message}`,
            success: false 
        });
    } else if (error) {
        return res.status(400).json({ 
            error: error.message,
            success: false 
        });
    }
    next();
};

// Rutas básicas CRUD
router.post('/', trabajadoresController.create);
router.get('/', trabajadoresController.findAll);
router.get('/:id', trabajadoresController.findById);
router.put('/:id', trabajadoresController.update);
router.delete('/:id', trabajadoresController.delete);

// Ruta de importación con manejo de errores
router.post('/import', upload.single('file'), handleMulterError, trabajadoresController.importFromExcel);

// Rutas adicionales
router.get('/tipo/:tipoPersonal', trabajadoresController.findByTipoPersonal);
router.get('/departamento/:departamentoId', trabajadoresController.findByDepartamento);
router.get('/:id/licencias/activas', trabajadoresController.getLicenciasActivas);
router.get('/:id/licencias/periodo', trabajadoresController.getLicenciasPorPeriodo);

module.exports = router; 
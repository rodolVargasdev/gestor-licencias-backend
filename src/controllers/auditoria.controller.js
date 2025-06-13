const Auditoria = require('../models/auditoria.model');

class AuditoriaController {
  static async getAuditoria(req, res) {
    try {
      const filtros = {
        usuarioId: req.query.usuarioId,
        accion: req.query.accion,
        tabla: req.query.tabla,
        registroId: req.query.registroId,
        fechaInicio: req.query.fechaInicio,
        fechaFin: req.query.fechaFin,
        limit: parseInt(req.query.limit) || 100,
        offset: parseInt(req.query.offset) || 0
      };

      const registros = await Auditoria.getAuditoria(filtros);
      res.json({
        status: 'success',
        data: registros
      });
    } catch (error) {
      console.error('Error al obtener registros de auditoría:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener los registros de auditoría'
      });
    }
  }

  static async getResumenAuditoria(req, res) {
    try {
      const resumen = await Auditoria.getResumenAuditoria();
      res.json({
        status: 'success',
        data: resumen
      });
    } catch (error) {
      console.error('Error al obtener resumen de auditoría:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al obtener el resumen de auditoría'
      });
    }
  }

  static async registrarAccion(req, res) {
    try {
      const { usuarioId, accion, tabla, registroId, detalles } = req.body;

      if (!usuarioId || !accion || !tabla) {
        return res.status(400).json({
          status: 'error',
          message: 'Faltan campos requeridos'
        });
      }

      const registro = await Auditoria.registrarAccion(
        usuarioId,
        accion,
        tabla,
        registroId,
        detalles
      );

      res.status(201).json({
        status: 'success',
        data: registro
      });
    } catch (error) {
      console.error('Error al registrar acción en auditoría:', error);
      res.status(500).json({
        status: 'error',
        message: 'Error al registrar la acción en auditoría'
      });
    }
  }
}

module.exports = AuditoriaController; 
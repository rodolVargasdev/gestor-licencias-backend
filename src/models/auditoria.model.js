const pool = require('../config/database');

class Auditoria {
  static async registrarAccion(usuarioId, accion, tabla, registroId, detalles) {
    try {
      const query = `
        INSERT INTO auditoria (
          usuario_id,
          accion,
          tabla,
          registro_id,
          detalles,
          fecha
        ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
      const values = [usuarioId, accion, tabla, registroId, detalles];
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getAuditoria(filtros = {}) {
    try {
      let query = `
        SELECT 
          a.*,
          u.nombre || ' ' || u.apellido as usuario_nombre
        FROM auditoria a
        LEFT JOIN usuarios u ON u.id = a.usuario_id
        WHERE 1=1
      `;
      const values = [];
      let paramIndex = 1;

      if (filtros.usuarioId) {
        query += ` AND a.usuario_id = $${paramIndex}`;
        values.push(filtros.usuarioId);
        paramIndex++;
      }

      if (filtros.accion) {
        query += ` AND a.accion = $${paramIndex}`;
        values.push(filtros.accion);
        paramIndex++;
      }

      if (filtros.tabla) {
        query += ` AND a.tabla = $${paramIndex}`;
        values.push(filtros.tabla);
        paramIndex++;
      }

      if (filtros.registroId) {
        query += ` AND a.registro_id = $${paramIndex}`;
        values.push(filtros.registroId);
        paramIndex++;
      }

      if (filtros.fechaInicio) {
        query += ` AND a.fecha >= $${paramIndex}`;
        values.push(filtros.fechaInicio);
        paramIndex++;
      }

      if (filtros.fechaFin) {
        query += ` AND a.fecha <= $${paramIndex}`;
        values.push(filtros.fechaFin);
        paramIndex++;
      }

      query += ` ORDER BY a.fecha DESC`;

      if (filtros.limit) {
        query += ` LIMIT $${paramIndex}`;
        values.push(filtros.limit);
        paramIndex++;
      }

      if (filtros.offset) {
        query += ` OFFSET $${paramIndex}`;
        values.push(filtros.offset);
      }

      const result = await pool.query(query, values);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getResumenAuditoria() {
    try {
      const query = `
        SELECT 
          accion,
          tabla,
          COUNT(*) as total,
          MIN(fecha) as primera_accion,
          MAX(fecha) as ultima_accion
        FROM auditoria
        GROUP BY accion, tabla
        ORDER BY tabla, accion;
      `;
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Auditoria; 
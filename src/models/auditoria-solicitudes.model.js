const pool = require('../config/database');

class AuditoriaSolicitudes {
    static async create(auditoriaData) {
        const {
            solicitud_id,
            usuario_id,
            accion,
            estado_anterior,
            estado_nuevo,
            comentario,
            ip_usuario,
            user_agent,
            fecha_limite_presentacion
        } = auditoriaData;

        const query = `
            INSERT INTO auditoria_solicitudes (
                solicitud_id, usuario_id, fecha_hora_accion,
                accion, estado_anterior, estado_nuevo,
                comentario, ip_usuario, user_agent,
                fecha_limite_presentacion
            ) VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;

        const values = [
            solicitud_id,
            usuario_id,
            accion,
            estado_anterior,
            estado_nuevo,
            comentario,
            ip_usuario,
            user_agent,
            fecha_limite_presentacion
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async findBySolicitud(solicitudId) {
        const query = `
            SELECT 
                a.*,
                u.nombre as usuario_nombre
            FROM auditoria_solicitudes a
            LEFT JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.solicitud_id = $1
            ORDER BY a.fecha_hora_accion DESC
        `;
        const { rows } = await pool.query(query, [solicitudId]);
        return rows;
    }

    static async findByUsuario(usuarioId) {
        const query = `
            SELECT 
                a.*,
                s.estado as solicitud_estado,
                s.fecha_hora_solicitud
            FROM auditoria_solicitudes a
            LEFT JOIN solicitudes_licencias s ON a.solicitud_id = s.id
            WHERE a.usuario_id = $1
            ORDER BY a.fecha_hora_accion DESC
        `;
        const { rows } = await pool.query(query, [usuarioId]);
        return rows;
    }

    static async findByFecha(fechaInicio, fechaFin) {
        const query = `
            SELECT 
                a.*,
                s.estado as solicitud_estado,
                s.fecha_hora_solicitud,
                u.nombre as usuario_nombre
            FROM auditoria_solicitudes a
            LEFT JOIN solicitudes_licencias s ON a.solicitud_id = s.id
            LEFT JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.fecha_hora_accion BETWEEN $1 AND $2
            ORDER BY a.fecha_hora_accion DESC
        `;
        const { rows } = await pool.query(query, [fechaInicio, fechaFin]);
        return rows;
    }

    static async findByAccion(accion) {
        const query = `
            SELECT 
                a.*,
                s.estado as solicitud_estado,
                s.fecha_hora_solicitud,
                u.nombre as usuario_nombre
            FROM auditoria_solicitudes a
            LEFT JOIN solicitudes_licencias s ON a.solicitud_id = s.id
            LEFT JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.accion = $1
            ORDER BY a.fecha_hora_accion DESC
        `;
        const { rows } = await pool.query(query, [accion]);
        return rows;
    }
}

module.exports = AuditoriaSolicitudes; 
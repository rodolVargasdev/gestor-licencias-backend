const pool = require('../config/database');

class ControlLimites {
    static async findByTrabajador(trabajadorId, tipoLicenciaId, anio, mes) {
        const query = `
            SELECT * FROM control_limites 
            WHERE trabajador_id = $1 
            AND tipo_licencia_id = $2 
            AND anio = $3 
            AND mes = $4
        `;
        const { rows } = await pool.query(query, [trabajadorId, tipoLicenciaId, anio, mes]);
        return rows[0];
    }

    static async create(controlData) {
        const {
            trabajador_id,
            tipo_licencia_id,
            anio,
            mes,
            dias_utilizados,
            horas_utilizadas,
            cantidad_utilizada
        } = controlData;

        const query = `
            INSERT INTO control_limites (
                trabajador_id, tipo_licencia_id, anio, mes,
                dias_utilizados, horas_utilizadas, cantidad_utilizada
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const values = [
            trabajador_id,
            tipo_licencia_id,
            anio,
            mes,
            dias_utilizados || 0,
            horas_utilizadas || 0,
            cantidad_utilizada || 0
        ];

        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async update(id, controlData) {
        const {
            dias_utilizados,
            horas_utilizadas,
            cantidad_utilizada
        } = controlData;

        const query = `
            UPDATE control_limites SET 
                dias_utilizados = $1,
                horas_utilizadas = $2,
                cantidad_utilizada = $3
            WHERE id = $4
            RETURNING *
        `;

        const { rows } = await pool.query(query, [
            dias_utilizados,
            horas_utilizadas,
            cantidad_utilizada,
            id
        ]);
        return rows[0];
    }

    static async getResumenAnual(trabajadorId, tipoLicenciaId, anio) {
        const query = `
            SELECT 
                SUM(dias_utilizados) as total_dias,
                SUM(horas_utilizadas) as total_horas,
                SUM(cantidad_utilizada) as total_cantidad
            FROM control_limites 
            WHERE trabajador_id = $1 
            AND tipo_licencia_id = $2 
            AND anio = $3
        `;
        const { rows } = await pool.query(query, [trabajadorId, tipoLicenciaId, anio]);
        return rows[0];
    }

    static async getResumenMensual(trabajadorId, tipoLicenciaId, anio, mes) {
        const query = `
            SELECT 
                dias_utilizados,
                horas_utilizadas,
                cantidad_utilizada
            FROM control_limites 
            WHERE trabajador_id = $1 
            AND tipo_licencia_id = $2 
            AND anio = $3 
            AND mes = $4
        `;
        const { rows } = await pool.query(query, [trabajadorId, tipoLicenciaId, anio, mes]);
        return rows[0];
    }

    static async getLimitesByTrabajador(trabajadorId) {
        try {
            const query = `
                SELECT 
                    tl.id as tipo_licencia_id,
                    tl.nombre as tipo_licencia,
                    tl.limite_dias,
                    tl.limite_horas,
                    COALESCE(SUM(
                        CASE 
                            WHEN s.estado = 'aprobada' 
                            THEN EXTRACT(EPOCH FROM (s.fecha_fin - s.fecha_inicio))/86400 
                            ELSE 0 
                        END
                    ), 0) as dias_usados,
                    COALESCE(SUM(
                        CASE 
                            WHEN s.estado = 'aprobada' 
                            THEN EXTRACT(EPOCH FROM (s.fecha_fin - s.fecha_inicio))/3600 
                            ELSE 0 
                        END
                    ), 0) as horas_usadas
                FROM tipos_licencias tl
                LEFT JOIN solicitudes s ON s.tipo_licencia_id = tl.id 
                    AND s.trabajador_id = $1
                    AND EXTRACT(YEAR FROM s.fecha_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)
                GROUP BY tl.id, tl.nombre, tl.limite_dias, tl.limite_horas
                ORDER BY tl.nombre;
            `;
            const result = await pool.query(query, [trabajadorId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getLimitesByDepartamento(departamentoId) {
        try {
            const query = `
                SELECT 
                    t.id as trabajador_id,
                    t.codigo as trabajador_codigo,
                    t.nombre || ' ' || t.apellido as trabajador_nombre,
                    tl.id as tipo_licencia_id,
                    tl.nombre as tipo_licencia,
                    tl.limite_dias,
                    tl.limite_horas,
                    COALESCE(SUM(
                        CASE 
                            WHEN s.estado = 'aprobada' 
                            THEN EXTRACT(EPOCH FROM (s.fecha_fin - s.fecha_inicio))/86400 
                            ELSE 0 
                        END
                    ), 0) as dias_usados,
                    COALESCE(SUM(
                        CASE 
                            WHEN s.estado = 'aprobada' 
                            THEN EXTRACT(EPOCH FROM (s.fecha_fin - s.fecha_inicio))/3600 
                            ELSE 0 
                        END
                    ), 0) as horas_usadas
                FROM trabajadores t
                JOIN tipos_licencias tl ON true
                LEFT JOIN solicitudes s ON s.trabajador_id = t.id 
                    AND s.tipo_licencia_id = tl.id
                    AND EXTRACT(YEAR FROM s.fecha_inicio) = EXTRACT(YEAR FROM CURRENT_DATE)
                WHERE t.departamento_id = $1
                GROUP BY t.id, t.codigo, t.nombre, t.apellido, tl.id, tl.nombre, tl.limite_dias, tl.limite_horas
                ORDER BY t.nombre, tl.nombre;
            `;
            const result = await pool.query(query, [departamentoId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async verificarDisponibilidad(trabajadorId, tipoLicenciaId, fechaInicio, fechaFin) {
        try {
            const query = `
                WITH dias_solicitados AS (
                    SELECT EXTRACT(EPOCH FROM ($3::date - $2::date))/86400 as dias
                ),
                horas_solicitadas AS (
                    SELECT EXTRACT(EPOCH FROM ($3::date - $2::date))/3600 as horas
                ),
                uso_actual AS (
                    SELECT 
                        COALESCE(SUM(
                            CASE 
                                WHEN s.estado = 'aprobada' 
                                THEN EXTRACT(EPOCH FROM (s.fecha_fin - s.fecha_inicio))/86400 
                                ELSE 0 
                            END
                        ), 0) as dias_usados,
                        COALESCE(SUM(
                            CASE 
                                WHEN s.estado = 'aprobada' 
                                THEN EXTRACT(EPOCH FROM (s.fecha_fin - s.fecha_inicio))/3600 
                                ELSE 0 
                            END
                        ), 0) as horas_usadas
                    FROM solicitudes s
                    WHERE s.trabajador_id = $1
                        AND s.tipo_licencia_id = $4
                        AND EXTRACT(YEAR FROM s.fecha_inicio) = EXTRACT(YEAR FROM $2::date)
                )
                SELECT 
                    tl.limite_dias,
                    tl.limite_horas,
                    ua.dias_usados,
                    ua.horas_usadas,
                    ds.dias as dias_solicitados,
                    hs.horas as horas_solicitadas,
                    CASE 
                        WHEN tl.limite_dias IS NOT NULL 
                        THEN tl.limite_dias - (ua.dias_usados + ds.dias)
                        ELSE NULL 
                    END as dias_disponibles,
                    CASE 
                        WHEN tl.limite_horas IS NOT NULL 
                        THEN tl.limite_horas - (ua.horas_usadas + hs.horas)
                        ELSE NULL 
                    END as horas_disponibles
                FROM tipos_licencias tl
                CROSS JOIN dias_solicitados ds
                CROSS JOIN horas_solicitadas hs
                CROSS JOIN uso_actual ua
                WHERE tl.id = $4;
            `;
            const result = await pool.query(query, [trabajadorId, fechaInicio, fechaFin, tipoLicenciaId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = ControlLimites; 
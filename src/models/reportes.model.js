const { AppDataSource } = require('../config/database');

class Reportes {
    // Calcular disponibilidad por código de trabajador
    static async getDisponibilidadByCodigoTrabajador(codigoTrabajador, tipoLicenciaId, anio, mes) {
        const queryBuilder = AppDataSource.createQueryBuilder()
            .select([
                't.codigo_trabajador',
                't.nombre_completo',
                'tl.nombre as tipo_licencia',
                'tl.periodo_renovacion',
                'tl.dias_anuales',
                'tl.horas_anuales',
                'tl.dias_por_evento',
                'tl.unidad_tiempo',
                'COALESCE(SUM(cl.dias_utilizados), 0) as dias_usados',
                'COALESCE(SUM(cl.horas_utilizadas), 0) as horas_usadas',
                'COALESCE(SUM(cl.cantidad_utilizada), 0) as cantidad_usada'
            ])
            .from('trabajadores', 't')
            .innerJoin('tipos_licencias', 'tl', 'tl.id = :tipoLicenciaId', { tipoLicenciaId })
            .leftJoin('control_limites', 'cl', 'cl.trabajador_id = t.id AND cl.tipo_licencia_id = tl.id AND cl.anio = :anio AND (:mes IS NULL OR cl.mes = :mes)', { anio, mes })
            .where('t.codigo_trabajador = :codigoTrabajador', { codigoTrabajador })
            .groupBy('t.codigo_trabajador, t.nombre_completo, tl.nombre, tl.periodo_renovacion, tl.dias_anuales, tl.horas_anuales, tl.dias_por_evento, tl.unidad_tiempo');

        const result = await queryBuilder.getRawOne();
        if (result) {
            result.disponibilidad_restante = result.unidad_tiempo === 'DIAS' 
                ? result.dias_anuales - result.dias_usados
                : result.unidad_tiempo === 'HORAS'
                    ? result.horas_anuales - result.horas_usadas
                    : result.dias_por_evento - result.cantidad_usada;
        }
        return result;
    }

    // Reporte de uso de licencias por departamento
    static async getReportePorDepartamento(departamentoId, fechaInicio, fechaFin) {
        const queryBuilder = AppDataSource.createQueryBuilder()
            .select([
                'd.nombre as departamento',
                'tl.nombre as tipo_licencia',
                'COUNT(s.id) as total_solicitudes',
                'SUM(CASE WHEN s.estado = :estadoAprobado THEN 1 ELSE 0 END) as solicitudes_aprobadas',
                'SUM(CASE WHEN s.estado = :estadoRechazado THEN 1 ELSE 0 END) as solicitudes_rechazadas',
                'SUM(CASE WHEN s.estado = :estadoPendiente THEN 1 ELSE 0 END) as solicitudes_pendientes',
                'SUM(cl.dias_utilizados) as total_dias_utilizados',
                'SUM(cl.horas_utilizadas) as total_horas_utilizadas'
            ])
            .from('departamentos', 'd')
            .innerJoin('trabajadores', 't', 't.departamento_id = d.id')
            .innerJoin('solicitudes', 's', 's.trabajador_id = t.id')
            .innerJoin('tipos_licencias', 'tl', 's.tipo_licencia_id = tl.id')
            .leftJoin('control_limites', 'cl', 'cl.trabajador_id = t.id AND cl.tipo_licencia_id = tl.id AND EXTRACT(YEAR FROM s.fecha_creacion) = cl.anio AND EXTRACT(MONTH FROM s.fecha_creacion) = cl.mes')
            .where('d.id = :departamentoId', { departamentoId })
            .andWhere('s.fecha_creacion BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .groupBy('d.nombre, tl.nombre')
            .orderBy('d.nombre, tl.nombre')
            .setParameter('estadoAprobado', 'APROBADA')
            .setParameter('estadoRechazado', 'RECHAZADA')
            .setParameter('estadoPendiente', 'PENDIENTE');

        return await queryBuilder.getRawMany();
    }

    // Reporte de uso de licencias por tipo
    static async getReportePorTipoLicencia(tipoLicenciaId, fechaInicio, fechaFin) {
        const queryBuilder = AppDataSource.createQueryBuilder()
            .select([
                'tl.nombre as tipo_licencia',
                'd.nombre as departamento',
                'COUNT(s.id) as total_solicitudes',
                'SUM(CASE WHEN s.estado = :estadoAprobado THEN 1 ELSE 0 END) as solicitudes_aprobadas',
                'SUM(CASE WHEN s.estado = :estadoRechazado THEN 1 ELSE 0 END) as solicitudes_rechazadas',
                'SUM(CASE WHEN s.estado = :estadoPendiente THEN 1 ELSE 0 END) as solicitudes_pendientes',
                'SUM(cl.dias_utilizados) as total_dias_utilizados',
                'SUM(cl.horas_utilizadas) as total_horas_utilizadas',
                'AVG(EXTRACT(EPOCH FROM (s.fecha_decision - s.fecha_creacion))/3600) as tiempo_promedio_respuesta_horas'
            ])
            .from('tipos_licencias', 'tl')
            .innerJoin('solicitudes', 's', 's.tipo_licencia_id = tl.id')
            .innerJoin('trabajadores', 't', 's.trabajador_id = t.id')
            .innerJoin('departamentos', 'd', 't.departamento_id = d.id')
            .leftJoin('control_limites', 'cl', 'cl.trabajador_id = t.id AND cl.tipo_licencia_id = tl.id AND EXTRACT(YEAR FROM s.fecha_creacion) = cl.anio AND EXTRACT(MONTH FROM s.fecha_creacion) = cl.mes')
            .where('tl.id = :tipoLicenciaId', { tipoLicenciaId })
            .andWhere('s.fecha_creacion BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .groupBy('tl.nombre, d.nombre')
            .orderBy('d.nombre')
            .setParameter('estadoAprobado', 'APROBADA')
            .setParameter('estadoRechazado', 'RECHAZADA')
            .setParameter('estadoPendiente', 'PENDIENTE');

        return await queryBuilder.getRawMany();
    }

    // Reporte de uso de licencias por trabajador
    static async getReportePorTrabajador(trabajadorId, fechaInicio, fechaFin) {
        const queryBuilder = AppDataSource.createQueryBuilder()
            .select([
                't.codigo_trabajador',
                't.nombre_completo',
                'tl.nombre as tipo_licencia',
                'COUNT(s.id) as total_solicitudes',
                'SUM(CASE WHEN s.estado = :estadoAprobado THEN 1 ELSE 0 END) as solicitudes_aprobadas',
                'SUM(CASE WHEN s.estado = :estadoRechazado THEN 1 ELSE 0 END) as solicitudes_rechazadas',
                'SUM(CASE WHEN s.estado = :estadoPendiente THEN 1 ELSE 0 END) as solicitudes_pendientes',
                'SUM(cl.dias_utilizados) as total_dias_utilizados',
                'SUM(cl.horas_utilizadas) as total_horas_utilizadas',
                'STRING_AGG(DISTINCT s.motivo_rechazo, \';\') as motivos_rechazo'
            ])
            .from('trabajadores', 't')
            .innerJoin('solicitudes', 's', 's.trabajador_id = t.id')
            .innerJoin('tipos_licencias', 'tl', 's.tipo_licencia_id = tl.id')
            .leftJoin('control_limites', 'cl', 'cl.trabajador_id = t.id AND cl.tipo_licencia_id = tl.id AND EXTRACT(YEAR FROM s.fecha_creacion) = cl.anio AND EXTRACT(MONTH FROM s.fecha_creacion) = cl.mes')
            .where('t.id = :trabajadorId', { trabajadorId })
            .andWhere('s.fecha_creacion BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .groupBy('t.codigo_trabajador, t.nombre_completo, tl.nombre')
            .orderBy('tl.nombre')
            .setParameter('estadoAprobado', 'APROBADA')
            .setParameter('estadoRechazado', 'RECHAZADA')
            .setParameter('estadoPendiente', 'PENDIENTE');

        return await queryBuilder.getRawMany();
    }

    // Reporte de tendencias de uso
    static async getReporteTendencias(fechaInicio, fechaFin) {
        const queryBuilder = AppDataSource.createQueryBuilder()
            .select([
                'DATE_TRUNC(\'month\', s.fecha_creacion) as mes',
                'tl.nombre as tipo_licencia',
                'COUNT(s.id) as total_solicitudes',
                'SUM(CASE WHEN s.estado = :estadoAprobado THEN 1 ELSE 0 END) as solicitudes_aprobadas',
                'SUM(CASE WHEN s.estado = :estadoRechazado THEN 1 ELSE 0 END) as solicitudes_rechazadas',
                'SUM(cl.dias_utilizados) as total_dias_utilizados',
                'SUM(cl.horas_utilizadas) as total_horas_utilizadas',
                'AVG(EXTRACT(EPOCH FROM (s.fecha_decision - s.fecha_creacion))/3600) as tiempo_promedio_respuesta_horas'
            ])
            .from('solicitudes', 's')
            .innerJoin('tipos_licencias', 'tl', 's.tipo_licencia_id = tl.id')
            .leftJoin('control_limites', 'cl', 'cl.trabajador_id = s.trabajador_id AND cl.tipo_licencia_id = tl.id AND EXTRACT(YEAR FROM s.fecha_creacion) = cl.anio AND EXTRACT(MONTH FROM s.fecha_creacion) = cl.mes')
            .where('s.fecha_creacion BETWEEN :fechaInicio AND :fechaFin', { fechaInicio, fechaFin })
            .groupBy('DATE_TRUNC(\'month\', s.fecha_creacion), tl.nombre')
            .orderBy('mes, tl.nombre')
            .setParameter('estadoAprobado', 'APROBADA')
            .setParameter('estadoRechazado', 'RECHAZADA');

        return await queryBuilder.getRawMany();
    }

    // Reporte de disponibilidad global
    static async getReporteDisponibilidadGlobal(anio, mes) {
        const queryBuilder = AppDataSource.createQueryBuilder()
            .select([
                't.codigo_trabajador',
                't.nombre_completo',
                'd.nombre as departamento',
                'tl.nombre as tipo_licencia',
                'tl.periodo_renovacion',
                'tl.dias_anuales',
                'tl.horas_anuales',
                'tl.dias_por_evento',
                'tl.unidad_tiempo',
                'COALESCE(SUM(cl.dias_utilizados), 0) as dias_usados',
                'COALESCE(SUM(cl.horas_utilizadas), 0) as horas_usadas',
                'COALESCE(SUM(cl.cantidad_utilizada), 0) as cantidad_usada'
            ])
            .from('trabajadores', 't')
            .innerJoin('departamentos', 'd', 't.departamento_id = d.id')
            .innerJoin('tipos_licencias', 'tl', 'tl.activo = true')
            .leftJoin('control_limites', 'cl', 'cl.trabajador_id = t.id AND cl.tipo_licencia_id = tl.id AND cl.anio = :anio AND (:mes IS NULL OR cl.mes = :mes)', { anio, mes })
            .groupBy('t.codigo_trabajador, t.nombre_completo, d.nombre, tl.nombre, tl.periodo_renovacion, tl.dias_anuales, tl.horas_anuales, tl.dias_por_evento, tl.unidad_tiempo')
            .orderBy('d.nombre, t.nombre_completo, tl.nombre');

        const results = await queryBuilder.getRawMany();
        return results.map(result => ({
            ...result,
            disponibilidad_restante: result.unidad_tiempo === 'DIAS'
                ? result.dias_anuales - result.dias_usados
                : result.unidad_tiempo === 'HORAS'
                    ? result.horas_anuales - result.horas_usadas
                    : result.dias_por_evento - result.cantidad_usada
        }));
    }
}

module.exports = Reportes; 
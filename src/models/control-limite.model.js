const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'ControlLimite',
    tableName: 'control_limites',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        trabajador_id: {
            type: 'int'
        },
        tipo_licencia_id: {
            type: 'int'
        },
        anio: {
            type: 'int'
        },
        mes: {
            type: 'int',
            nullable: true
        },
        dias_totales: {
            type: 'int'
        },
        dias_utilizados: {
            type: 'int',
            default: 0
        },
        dias_disponibles: {
            type: 'int'
        },
        horas_utilizadas: {
            type: 'int',
            default: 0
        },
        cantidad_utilizada: {
            type: 'int',
            default: 0
        },
        activo: {
            type: 'boolean',
            default: true
        },
        fecha_creacion: {
            type: 'timestamp',
            createDate: true
        },
        fecha_actualizacion: {
            type: 'timestamp',
            updateDate: true
        }
    },
    relations: {
        trabajador: {
            type: 'many-to-one',
            target: 'Trabajador',
            joinColumn: { name: 'trabajador_id' }
        },
        tipo_licencia: {
            type: 'many-to-one',
            target: 'TipoLicencia',
            joinColumn: { name: 'tipo_licencia_id' }
        }
    }
}); 
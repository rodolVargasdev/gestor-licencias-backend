const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Solicitud',
    tableName: 'solicitudes',
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
        fecha_inicio: {
            type: 'date'
        },
        fecha_fin: {
            type: 'date'
        },
        motivo: {
            type: 'text'
        },
        estado: {
            type: 'enum',
            enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA']
        },
        dias_solicitados: {
            type: 'int'
        },
        dias_habiles: {
            type: 'int'
        },
        dias_calendario: {
            type: 'int'
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
        },
        fecha_decision: {
            type: 'timestamp',
            nullable: true
        },
        tipo_olvido_marcacion: {
            type: 'enum',
            enum: ['ENTRADA', 'SALIDA'],
            nullable: true
        }
    },
    relations: {
        trabajador: {
            type: 'many-to-one',
            target: 'Trabajador',
            joinColumn: {
                name: 'trabajador_id'
            }
        },
        tipo_licencia: {
            type: 'many-to-one',
            target: 'TipoLicencia',
            joinColumn: {
                name: 'tipo_licencia_id'
            }
        },
        validaciones: {
            type: 'one-to-many',
            target: 'Validacion',
            inverseSide: 'solicitud'
        },
        licencia: {
            type: 'one-to-one',
            target: 'Licencia',
            inverseSide: 'solicitud'
        }
    }
}); 
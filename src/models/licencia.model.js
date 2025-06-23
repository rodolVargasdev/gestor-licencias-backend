const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Licencia',
    tableName: 'licencias',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        solicitud_id: {
            type: 'int',
            unique: true
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
        dias_totales: {
            type: 'int'
        },
        dias_habiles: {
            type: 'int'
        },
        dias_calendario: {
            type: 'int'
        },
        horas_totales: {
            type: 'decimal',
            precision: 10,
            scale: 2,
            default: 0
        },
        estado: {
            type: 'enum',
            enum: ['ACTIVA', 'FINALIZADA', 'CANCELADA']
        },
        motivo_cancelacion: {
            type: 'text',
            nullable: true
        },
        fecha_cancelacion: {
            type: 'timestamp',
            nullable: true
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
        fecha_no_asiste: {
            type: 'date',
            nullable: true
        },
        fecha_si_asiste: {
            type: 'date',
            nullable: true
        },
        trabajador_cambio_id: {
            type: 'int',
            nullable: true
        },
        tipo_olvido_marcacion: {
            type: 'enum',
            enum: ['ENTRADA', 'SALIDA'],
            nullable: true
        },
        afecta_disponibilidad: {
            type: 'boolean',
            default: true,
            comment: 'Indica si la licencia debe afectar el cómputo de disponibilidad del período actual. Se establece en FALSE para licencias retroactivas.'
        }
    },
    relations: {
        solicitud: {
            type: 'one-to-one',
            target: 'Solicitud',
            joinColumn: {
                name: 'solicitud_id'
            }
        },
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
        }
    }
}); 
const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Validacion',
    tableName: 'validaciones',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        solicitud_id: {
            type: 'int'
        },
        validado_por: {
            type: 'int'
        },
        estado: {
            type: 'enum',
            enum: ['PENDIENTE', 'APROBADO', 'RECHAZADO']
        },
        observaciones: {
            type: 'text',
            nullable: true
        },
        fecha_validacion: {
            type: 'timestamp',
            nullable: true
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
        solicitud: {
            type: 'many-to-one',
            target: 'Solicitud',
            joinColumn: {
                name: 'solicitud_id'
            }
        },
        validador: {
            type: 'many-to-one',
            target: 'Trabajador',
            joinColumn: {
                name: 'validado_por'
            }
        }
    }
}); 
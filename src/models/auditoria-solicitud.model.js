const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'AuditoriaSolicitud',
    tableName: 'auditoria_solicitudes',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        solicitud_id: {
            type: 'int'
        },
        estado_anterior: {
            type: 'enum',
            enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA'],
            nullable: true
        },
        estado_nuevo: {
            type: 'enum',
            enum: ['PENDIENTE', 'APROBADA', 'RECHAZADA', 'CANCELADA']
        },
        motivo_cambio: {
            type: 'varchar',
            length: 500,
            nullable: true
        },
        usuario_id: {
            type: 'int',
            nullable: true
        },
        fecha_cambio: {
            type: 'timestamp',
            createDate: true
        },
        detalles_cambio: {
            type: 'json',
            nullable: true
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
        usuario: {
            type: 'many-to-one',
            target: 'Usuario',
            joinColumn: {
                name: 'usuario_id'
            }
        }
    }
}); 
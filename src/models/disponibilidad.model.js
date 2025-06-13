const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Disponibilidad',
    tableName: 'disponibilidad',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        trabajador_id: {
            type: 'int'
        },
        fecha: {
            type: 'date'
        },
        disponible: {
            type: 'boolean',
            default: true
        },
        motivo_no_disponible: {
            type: 'varchar',
            length: 500,
            nullable: true
        },
        licencia_id: {
            type: 'int',
            nullable: true
        },
        solicitud_id: {
            type: 'int',
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
        trabajador: {
            type: 'many-to-one',
            target: 'Trabajador',
            joinColumn: {
                name: 'trabajador_id'
            }
        },
        licencia: {
            type: 'many-to-one',
            target: 'Licencia',
            joinColumn: {
                name: 'licencia_id'
            }
        },
        solicitud: {
            type: 'many-to-one',
            target: 'Solicitud',
            joinColumn: {
                name: 'solicitud_id'
            }
        }
    }
}); 
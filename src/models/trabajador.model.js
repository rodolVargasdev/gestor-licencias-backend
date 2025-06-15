const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Trabajador',
    tableName: 'trabajadores',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        codigo: {
            type: 'varchar',
            length: 50,
            unique: true
        },
        nombre_completo: {
            type: 'varchar',
            length: 255
        },
        email: {
            type: 'varchar',
            length: 255,
            unique: true
        },
        telefono: {
            type: 'varchar',
            length: 20,
            nullable: true
        },
        departamento_id: {
            type: 'int',
            nullable: true
        },
        puesto_id: {
            type: 'int',
            nullable: true
        },
        tipo_personal: {
            type: 'enum',
            enum: ['OPERATIVO', 'ADMINISTRATIVO']
        },
        fecha_ingreso: {
            type: 'date'
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
        departamento: {
            type: 'many-to-one',
            target: 'Departamento',
            joinColumn: {
                name: 'departamento_id'
            }
        },
        puesto: {
            type: 'many-to-one',
            target: 'Puesto',
            joinColumn: {
                name: 'puesto_id'
            }
        },
        licencias: {
            type: 'one-to-many',
            target: 'Licencia',
            inverseSide: 'trabajador'
        },
        solicitudes: {
            type: 'one-to-many',
            target: 'Solicitud',
            inverseSide: 'trabajador'
        }
    }
}); 
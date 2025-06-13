const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Departamento',
    tableName: 'departamentos',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        nombre: {
            type: 'varchar',
            length: 100
        },
        descripcion: {
            type: 'text',
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
        }
    },
    relations: {
        usuarios: {
            type: 'one-to-many',
            target: 'Usuario',
            inverseSide: 'departamento'
        }
    }
}); 
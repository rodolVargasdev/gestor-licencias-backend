const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Usuario',
    tableName: 'usuarios',
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
        nombre: {
            type: 'varchar',
            length: 100
        },
        apellido: {
            type: 'varchar',
            length: 100
        },
        email: {
            type: 'varchar',
            length: 100,
            unique: true
        },
        password: {
            type: 'varchar',
            length: 255
        },
        departamento_id: {
            type: 'int',
            nullable: true
        },
        puesto_id: {
            type: 'int',
            nullable: true
        },
        rol: {
            type: 'varchar',
            length: 50
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
        }
    }
}); 
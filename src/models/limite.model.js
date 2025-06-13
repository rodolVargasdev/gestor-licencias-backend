const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
    name: 'Limite',
    tableName: 'limites',
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
        dias_disponibles: {
            type: 'int'
        },
        dias_utilizados: {
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
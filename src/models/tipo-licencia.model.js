const { EntitySchema } = require('typeorm');

const TipoLicencia = new EntitySchema({
    name: 'TipoLicencia',
    tableName: 'tipos_licencias',
    columns: {
        id: {
            primary: true,
            type: 'int',
            generated: true
        },
        codigo: {
            type: 'varchar',
            length: 10,
            nullable: false,
            unique: true
        },
        nombre: {
            type: 'varchar',
            length: 100,
            nullable: false
        },
        descripcion: {
            type: 'text',
            nullable: true
        },
        tipo_duracion: {
            type: 'enum',
            enum: ['DIAS', 'HORAS', 'CANTIDAD'],
            default: 'DIAS',
            nullable: false
        },
        periodo_renovacion: {
            type: 'enum',
            enum: ['MENSUAL', 'ANUAL'],
            default: 'ANUAL',
            nullable: false
        },
        duracion_maxima: {
            type: 'int',
            default: 0,
            nullable: false
        },
        requiere_justificacion: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        requiere_aprobacion_especial: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        requiere_documentacion: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        pago_haberes: {
            type: 'boolean',
            default: true,
            nullable: false
        },
        acumulable: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        transferible: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        aplica_genero: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        genero_aplicable: {
            type: 'enum',
            enum: ['M', 'F', 'A'],
            default: 'A',
            nullable: false
        },
        aplica_antiguedad: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        antiguedad_minima: {
            type: 'int',
            nullable: true
        },
        aplica_edad: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        edad_minima: {
            type: 'int',
            nullable: true
        },
        edad_maxima: {
            type: 'int',
            nullable: true
        },
        aplica_departamento: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        departamentos_aplicables: {
            type: 'text',
            nullable: true
        },
        aplica_cargo: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        cargos_aplicables: {
            type: 'text',
            nullable: true
        },
        aplica_tipo_personal: {
            type: 'boolean',
            default: false,
            nullable: false
        },
        tipos_personal_aplicables: {
            type: 'text',
            nullable: true
        },
        activo: {
            type: 'boolean',
            default: true,
            nullable: false
        },
        created_at: {
            type: 'timestamp',
            createDate: true,
            nullable: false
        },
        updated_at: {
            type: 'timestamp',
            updateDate: true,
            nullable: false
        }
    },
    relations: {
        licencias: {
            type: 'one-to-many',
            target: 'Licencia',
            inverseSide: 'tipo_licencia'
        }
    }
});

module.exports = TipoLicencia; 
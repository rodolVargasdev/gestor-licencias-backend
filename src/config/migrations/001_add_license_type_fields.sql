-- Add new fields to tipos_licencias table
ALTER TABLE tipos_licencias
ADD COLUMN tipo_permiso VARCHAR(50),
ADD COLUMN requiere_justificacion BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_rrhh BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_director BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_gerente BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_subdirector BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_coordinador BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_supervisor BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_encargado BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_departamento BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_area BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_seccion BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_unidad BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_servicio BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_turno BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_guardia BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_equipo BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_proyecto BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_programa BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_actividad BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_funcion BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_cargo BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_puesto BOOLEAN DEFAULT false,
ADD COLUMN requiere_aprobacion_jefe_rol BOOLEAN DEFAULT false;

-- Insert the 15 types of permissions
INSERT INTO tipos_licencias (
    nombre, descripcion, codigo, con_goce_salario,
    requiere_certificacion, requiere_documento_soporte,
    dias_anuales, horas_anuales, dias_por_evento,
    unidad_tiempo, requiere_parentesco, grado_parentesco,
    dias_anticipacion, dias_maximos, anticipacion_requerida,
    limite_mensual, aplica_personal_operativo,
    aplica_personal_administrativo, observaciones, activo,
    tipo_permiso, requiere_justificacion,
    requiere_aprobacion_jefe, requiere_aprobacion_rrhh
) VALUES
-- 1. Permiso personal con goce de salario
('Permiso personal con goce de salario', 'Permiso personal con goce de salario', 'PPGS', true,
false, true, 5, 0, 1, 'DIAS', false, null,
0, 5, 0, 5, true, true,
'Se concederán a discreción de la jefatura inmediata, siendo requisito indispensable para la autorización que el servicio no quede descubierto.', true,
'PERSONAL_CON_GOCE', true, true, true),

-- 2. Permiso personal sin goce de salario
('Permiso personal sin goce de salario', 'Permiso personal sin goce de salario', 'PPSG', false,
false, true, 60, 0, 1, 'DIAS', false, null,
5, 60, 5, 60, true, true,
'Se concederán a discreción de la jefatura inmediata, siendo requisito indispensable para la autorización que el servicio no quede descubierto.', true,
'PERSONAL_SIN_GOCE', true, true, true),

-- 3. Licencia por enfermedad
('Licencia por enfermedad', 'Licencia por enfermedad con certificación médica', 'LE', true,
true, true, 0, 0, 3, 'DIAS', false, null,
0, 3, 0, 3, true, true,
'De 1 a 3 días con goce y del 4to día en adelante sin goce de salario.', true,
'ENFERMEDAD', true, true, true),

-- 4. Licencia por enfermedad gravísima de pariente
('Licencia por enfermedad gravísima de pariente', 'Licencia por enfermedad gravísima de pariente', 'LEGP', true,
true, true, 17, 0, 17, 'DIAS', true, 'PRIMER_GRADO',
0, 17, 0, 17, true, true,
'Procederán únicamente parientes en primer grado de afinidad (mamá, papá, esposa/o, hijas/os).', true,
'ENFERMEDAD_PARIENTE', true, true, true),

-- 5. Licencia por duelo
('Licencia por duelo', 'Licencia por duelo', 'LD', true,
true, true, 0, 0, 3, 'DIAS', true, 'PRIMER_GRADO',
0, 3, 0, 3, true, true,
'Procederán únicamente parientes en primer grado de afinidad (mamá, papá, esposa/o, hijas/os).', true,
'DUELO', true, true, true),

-- 6. Licencia por maternidad
('Licencia por maternidad', 'Licencia por maternidad', 'LM', true,
true, true, 0, 0, 112, 'DIAS', false, null,
30, 112, 30, 112, true, true,
'Toda empleada puede gozar de licencia con goce de sueldo por maternidad.', true,
'MATERNIDAD', true, true, true),

-- 7. Licencia por lactancia materna
('Licencia por lactancia materna', 'Licencia por lactancia materna', 'LLM', true,
true, true, 0, 180, 1, 'HORAS', false, null,
0, 180, 0, 180, true, true,
'Toda empleada gozará del beneficio de ausentarse de su jornada laboral ordinaria hasta por una hora diaria.', true,
'LACTANCIA', true, true, true),

-- 8. Licencia por paternidad
('Licencia por paternidad', 'Licencia por paternidad, nacimiento o adopción', 'LP', true,
true, true, 0, 0, 3, 'DIAS', false, null,
0, 3, 0, 3, true, true,
'Todo trabajador en caso de paternidad por nacimiento o en caso de adopción tendrá derecho a una licencia de tres días hábiles.', true,
'PATERNIDAD', true, true, true),

-- 9. Permiso por matrimonio
('Permiso por matrimonio', 'Permiso por matrimonio', 'PM', true,
true, true, 0, 0, 3, 'DIAS', false, null,
0, 3, 0, 3, true, true,
'Cuando el personal contrajere matrimonio civil o religioso.', true,
'MATRIMONIO', true, true, true),

-- 10. Licencia por vacaciones anuales
('Licencia por vacaciones anuales', 'Licencia por vacaciones anuales', 'LVA', true,
false, true, 15, 0, 15, 'DIAS', false, null,
0, 15, 0, 15, true, true,
'Los trabajadores con un año continuo de servicio tienen derecho a 15 días de vacaciones remuneradas.', true,
'VACACIONES', true, true, true),

-- 11. Permiso por juntas receptoras de votos
('Permiso por juntas receptoras de votos', 'Permiso por haberse conferido un cargo o nombramiento en las juntas receptoras de votos', 'PJRV', true,
true, true, 0, 0, 0, 'DIAS', false, null,
0, 0, 0, 0, true, true,
'Los trabajadores que sean seleccionados y conferido un cargo o nombramiento en un organismo electoral.', true,
'JUNTAS_RECEPTORAS', true, true, true),

-- 12. Permiso por jurado
('Permiso por jurado', 'Permiso por ser llamado a conformar jurado', 'PJ', true,
true, true, 0, 0, 0, 'HORAS', false, null,
0, 0, 0, 0, true, true,
'Los trabajadores que sean llamados a conformar jurados.', true,
'JURADO', true, true, true),

-- 13. Olvidos por falta de marcación
('Olvidos por falta de marcación', 'Olvidos por falta de marcación', 'OFM', true,
false, true, 0, 0, 2, 'DIAS', false, null,
0, 2, 0, 2, true, true,
'Cuando un empleado no registre la hora de entrada o salida a sus labores por actos involuntarios.', true,
'OLVIDO_MARCACION', true, true, true),

-- 14. Cambios de turno
('Cambios de turno', 'Cambios de turno', 'CT', true,
false, true, 0, 0, 3, 'DIAS', false, null,
0, 3, 0, 3, true, true,
'El jefe inmediato podrá autorizar el cambio de turno, cuando un empleado lo solicite, sin exceder de tres en el mes.', true,
'CAMBIO_TURNO', true, true, true),

-- 15. Movimientos de recurso humano
('Movimientos de recurso humano', 'Movimientos de recurso humano en plan de trabajo mensual', 'MRH', true,
false, true, 0, 0, 0, 'DIAS', false, null,
0, 0, 0, 0, true, true,
'La Jefatura Inmediata debe reportar oportunamente en forma escrita, a la Jefatura de Talento Humano, todo cambio realizado en la programación de horario de trabajo mensual.', true,
'MOVIMIENTO_RH', true, true, true); 
-- Crear tabla de auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    accion VARCHAR(50) NOT NULL,
    tabla VARCHAR(50) NOT NULL,
    registro_id INTEGER,
    detalles JSONB,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_auditoria_usuario_id ON auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria(fecha);
CREATE INDEX IF NOT EXISTS idx_auditoria_tabla ON auditoria(tabla);
CREATE INDEX IF NOT EXISTS idx_auditoria_accion ON auditoria(accion);
CREATE INDEX IF NOT EXISTS idx_auditoria_registro_id ON auditoria(registro_id);

-- Comentarios de la tabla
COMMENT ON TABLE auditoria IS 'Registro de acciones realizadas en el sistema';
COMMENT ON COLUMN auditoria.id IS 'Identificador único del registro de auditoría';
COMMENT ON COLUMN auditoria.usuario_id IS 'ID del usuario que realizó la acción';
COMMENT ON COLUMN auditoria.accion IS 'Tipo de acción realizada (crear, actualizar, eliminar, etc.)';
COMMENT ON COLUMN auditoria.tabla IS 'Nombre de la tabla afectada';
COMMENT ON COLUMN auditoria.registro_id IS 'ID del registro afectado';
COMMENT ON COLUMN auditoria.detalles IS 'Detalles adicionales de la acción en formato JSON';
COMMENT ON COLUMN auditoria.fecha IS 'Fecha y hora de la acción'; 
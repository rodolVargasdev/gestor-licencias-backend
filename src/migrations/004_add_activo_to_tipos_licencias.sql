-- Agregar columna activo a la tabla tipos_licencias
ALTER TABLE tipos_licencias ADD COLUMN IF NOT EXISTS activo BOOLEAN NOT NULL DEFAULT true;

-- Actualizar registros existentes
UPDATE tipos_licencias SET activo = true WHERE activo IS NULL; 
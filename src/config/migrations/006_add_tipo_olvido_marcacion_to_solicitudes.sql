-- Agregar columna tipo_olvido_marcacion a la tabla solicitudes
ALTER TABLE solicitudes 
ADD COLUMN tipo_olvido_marcacion VARCHAR(10) CHECK (tipo_olvido_marcacion IN ('ENTRADA', 'SALIDA')); 
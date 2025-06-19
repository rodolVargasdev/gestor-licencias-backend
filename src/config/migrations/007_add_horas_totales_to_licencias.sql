-- Agregar campo horas_totales a la tabla licencias
ALTER TABLE licencias 
ADD COLUMN horas_totales DECIMAL(10,2) DEFAULT 0.00;

-- Comentario para documentar el campo
COMMENT ON COLUMN licencias.horas_totales IS 'Total de horas de la licencia (para licencias por horas)'; 
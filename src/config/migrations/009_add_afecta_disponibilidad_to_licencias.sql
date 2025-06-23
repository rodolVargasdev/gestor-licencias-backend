-- Añade la columna para controlar si una licencia afecta la disponibilidad del período actual.
ALTER TABLE licencias
ADD COLUMN afecta_disponibilidad BOOLEAN NOT NULL DEFAULT TRUE;

-- Comentario en la columna para explicar su propósito
COMMENT ON COLUMN licencias.afecta_disponibilidad IS 'Indica si la licencia debe afectar el cómputo de disponibilidad del período actual. Se establece en FALSE para licencias retroactivas.'; 
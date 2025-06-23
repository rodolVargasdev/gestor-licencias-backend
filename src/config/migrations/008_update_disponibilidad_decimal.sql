-- Migración para cambiar campos de disponibilidad de int a decimal
-- Esto permite soportar valores fraccionarios para licencias por horas

-- Cambiar dias_disponibles
ALTER TABLE disponibilidad 
ALTER COLUMN dias_disponibles TYPE DECIMAL(10,2) USING dias_disponibles::DECIMAL(10,2);

-- Cambiar dias_usados
ALTER TABLE disponibilidad 
ALTER COLUMN dias_usados TYPE DECIMAL(10,2) USING dias_usados::DECIMAL(10,2);

-- Cambiar dias_restantes
ALTER TABLE disponibilidad 
ALTER COLUMN dias_restantes TYPE DECIMAL(10,2) USING dias_restantes::DECIMAL(10,2);

-- Establecer valores por defecto
ALTER TABLE disponibilidad 
ALTER COLUMN dias_disponibles SET DEFAULT 0.00;

ALTER TABLE disponibilidad 
ALTER COLUMN dias_usados SET DEFAULT 0.00;

ALTER TABLE disponibilidad 
ALTER COLUMN dias_restantes SET DEFAULT 0.00; 
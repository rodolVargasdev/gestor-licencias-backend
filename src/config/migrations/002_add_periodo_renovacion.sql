-- Agregar columna periodo_renovacion a la tabla tipos_licencias
ALTER TABLE tipos_licencias
ADD COLUMN periodo_renovacion VARCHAR(10) NOT NULL DEFAULT 'ANUAL' CHECK (periodo_renovacion IN ('MENSUAL', 'ANUAL'));

-- Actualizar tipos de licencia existentes
UPDATE tipos_licencias
SET periodo_renovacion = 'MENSUAL'
WHERE codigo IN ('OLVIDO-ENTRADA', 'OLVIDO-SALIDA', 'CAMBIO-TURNO');

UPDATE tipos_licencias
SET periodo_renovacion = 'ANUAL'
WHERE codigo IN ('PER-GOCE', 'PER-SIN-GOCE', 'VACACIONES', 'ENFERMEDAD', 'ENF-GRAVE-PAR', 'DUELO', 'MATERNIDAD', 'LACTANCIA', 'PATERNIDAD', 'MATRIMONIO', 'JRV', 'JURADO', 'MOV-PLAN-TRABAJO'); 
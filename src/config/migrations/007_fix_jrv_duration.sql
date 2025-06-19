-- Fix JRV license type duration
UPDATE tipos_licencias
SET duracion_maxima = 30,
    dias_anuales = 30,
    dias_por_evento = 30
WHERE codigo IN ('PJRV', 'JRV')
AND duracion_maxima = 0; 
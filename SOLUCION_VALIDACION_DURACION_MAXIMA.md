# Solución: Validación de Duración Máxima para Licencias con Período de Control "Sin Periodo"

## Problema Identificado

El sistema no validaba correctamente la duración máxima de las licencias cuando el tipo de licencia tenía `periodo_control = 'ninguno'`. Esto permitía solicitar licencias con duraciones que excedían el límite especificado en `duracion_maxima`.

### Casos Específicos:

1. **Licencias con `duracion_maxima > 0` y `periodo_control = 'ninguno'`**: No se validaba el límite de duración por solicitud.
2. **Licencias con `duracion_maxima = 0` y `periodo_control = 'ninguno'`**: Funcionaban correctamente (como "Permiso por cargo en juntas receptoras de votos").

## Solución Implementada

### 1. Backend (`src/services/licencias.service.js`)

Se agregó una validación específica para licencias con `periodo_control = 'ninguno'` que tengan `duracion_maxima > 0`:

```javascript
// Validación de duración máxima para licencias con periodo_control 'ninguno' y duracion_maxima > 0
if (tipoLicencia.periodo_control === 'ninguno' && tipoLicencia.duracion_maxima > 0 && consumo > tipoLicencia.duracion_maxima) {
    throw new Error(`No puede solicitar más de ${tipoLicencia.duracion_maxima} ${tipoLicencia.unidad_control === 'horas' ? 'horas' : 'días'} para este permiso.`);
}
```

### 2. Frontend - Crear Licencia (`gestor-licencias-frontend/src/pages/Licencias/CreateLicenciaPage.tsx`)

#### Validaciones en el formulario:
```javascript
// Para licencias por días
if (selectedTipoLicencia.periodo_control === 'ninguno' && selectedTipoLicencia.duracion_maxima > 0 && dias > selectedTipoLicencia.duracion_maxima) {
    errorMsg = `No puede solicitar más de ${selectedTipoLicencia.duracion_maxima} días para este permiso.`;
}

// Para licencias por horas
if (selectedTipoLicencia.periodo_control === 'ninguno' && selectedTipoLicencia.duracion_maxima > 0 && horas > selectedTipoLicencia.duracion_maxima) {
    errorMsg = `No puede solicitar más de ${selectedTipoLicencia.duracion_maxima} horas para este permiso.`;
}
```

#### Información en la interfaz:
Se agregó un Alert que muestra información específica para licencias con `periodo_control = 'ninguno'`:

- **Si `duracion_maxima > 0`**: Muestra el límite y advertencia
- **Si `duracion_maxima = 0`**: Indica que la duración es variable según necesidad

### 3. Frontend - Editar Licencia y Solicitudes

Se aplicaron las mismas validaciones en:
- `gestor-licencias-frontend/src/pages/Licencias/EditLicenciaPage.tsx`
- `gestor-licencias-frontend/src/pages/Solicitudes/EditSolicitudPage.tsx`

## Comportamiento Esperado

### Caso 1: Licencia con `duracion_maxima > 0` y `periodo_control = 'ninguno'`
- ✅ **Permitido**: Solicitar múltiples veces
- ✅ **Validado**: No exceder `duracion_maxima` por solicitud
- ❌ **Rechazado**: Solicitudes que excedan el límite

### Caso 2: Licencia con `duracion_maxima = 0` y `periodo_control = 'ninguno'` (como JRV)
- ✅ **Permitido**: Solicitar múltiples veces
- ✅ **Permitido**: Duración variable según necesidad
- ✅ **Sin límite**: No hay restricción de duración por solicitud

## Archivos Modificados

### Backend:
- `src/services/licencias.service.js` - Validación en creación de licencias

### Frontend:
- `gestor-licencias-frontend/src/pages/Licencias/CreateLicenciaPage.tsx` - Validación e interfaz
- `gestor-licencias-frontend/src/pages/Licencias/EditLicenciaPage.tsx` - Validación en edición
- `gestor-licencias-frontend/src/pages/Solicitudes/EditSolicitudPage.tsx` - Validación en solicitudes

### Pruebas:
- `test-validacion-duracion-maxima.js` - Script de prueba para verificar funcionalidad

## Cómo Probar

1. **Ejecutar el script de prueba**:
   ```bash
   node test-validacion-duracion-maxima.js
   ```

2. **Probar manualmente en el frontend**:
   - Crear un tipo de licencia con `periodo_control = 'ninguno'` y `duracion_maxima = 5`
   - Intentar crear una licencia de 7 días → Debe ser rechazada
   - Crear una licencia de 3 días → Debe ser aceptada

3. **Verificar el caso JRV**:
   - El tipo "Permiso por cargo en juntas receptoras de votos" debe permitir duraciones variables
   - No debe mostrar restricciones de duración en la interfaz

## Resultado

✅ **Problema resuelto**: Las licencias con `periodo_control = 'ninguno'` ahora respetan correctamente la `duracion_maxima` cuando es mayor a 0.

✅ **Caso especial mantenido**: Las licencias como JRV (con `duracion_maxima = 0`) siguen permitiendo duración variable según necesidad.

✅ **Interfaz mejorada**: Los usuarios ven claramente las restricciones aplicables según el tipo de licencia. 
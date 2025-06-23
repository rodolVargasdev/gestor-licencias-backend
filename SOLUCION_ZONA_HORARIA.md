# Solución para Problema de Zona Horaria - El Salvador

## Problema Identificado

El sistema presentaba un bug donde las fechas de inicio y fin de las licencias se guardaban con un día de atraso cuando se visualizaban en las tablas y al editar. Esto ocurría porque:

1. **Frontend**: Las fechas se creaban en la zona horaria local del navegador
2. **Backend**: Las fechas se convertían a UTC al guardarse en la base de datos
3. **Visualización**: Al mostrar las fechas de vuelta, no se ajustaban correctamente a la zona horaria de El Salvador (UTC-6)

## Solución Implementada

### 1. Frontend - Utilidades de Fecha (`gestor-licencias-frontend/src/utils/dateUtils.ts`)

Se crearon utilidades para manejar fechas en la zona horaria de El Salvador:

- **`toElSalvadorDate(date)`**: Convierte una fecha local a la zona horaria de El Salvador
- **`fromElSalvadorDate(date)`**: Convierte una fecha de El Salvador a fecha local para mostrar
- **`combineDateAndTime(date, time)`**: Combina fecha y hora en la zona horaria de El Salvador
- **`getCurrentElSalvadorDate()`**: Obtiene la fecha actual en la zona horaria de El Salvador

### 2. Backend - Utilidades de Fecha (`src/utils/dateUtils.js`)

Se crearon utilidades equivalentes en el backend:

- **`normalizeDates(data)`**: Normaliza todas las fechas en un objeto de datos
- **`toElSalvadorDate(date)`**: Convierte fechas a la zona horaria de El Salvador
- **`fromElSalvadorDate(date)`**: Convierte fechas de El Salvador a local
- **`combineDateAndTime(date, time)`**: Combina fecha y hora correctamente

### 3. Actualización de Servicios

#### Frontend - `CreateLicenciaPage.tsx`
- ✅ **Completamente implementado**
- Se importaron las utilidades de fecha
- Se actualizó el estado inicial para usar `getCurrentElSalvadorDate()`
- Se modificó `handleSubmit` para convertir fechas antes de enviar al backend
- Se agregó manejo especial para licencias por horas usando `combineDateAndTime()`

#### Frontend - `EditLicenciaPage.tsx`
- ✅ **Implementado con utilidades de fecha**
- Se importaron las utilidades de fecha
- Se actualizó el `useEffect` que carga datos para usar `fromElSalvadorDate()`
- Se modificó `handleSubmit` para convertir fechas antes de enviar
- Se agregó manejo especial para licencias por horas

#### Frontend - `EditSolicitudPage.tsx`
- ✅ **Implementado con utilidades de fecha**
- Se importaron las utilidades de fecha
- Se actualizó el `useEffect` que carga datos para usar `fromElSalvadorDate()`
- Se modificó `handleSubmit` para convertir fechas antes de enviar
- Se agregó manejo especial para licencias por horas

#### Backend - `src/services/solicitudes.service.js`
- ✅ **Completamente implementado**
- Se importó `normalizeDates` de las utilidades
- Se actualizó el método `create()` para normalizar fechas antes de procesar
- Se actualizó el método `update()` para normalizar fechas antes de actualizar

## Zona Horaria de El Salvador

- **UTC Offset**: UTC-6 (6 horas detrás de UTC)
- **Horario de Verano**: No aplica (El Salvador no usa horario de verano)
- **Código de Zona**: America/El_Salvador

## Archivos Modificados

### Frontend
- `gestor-licencias-frontend/src/utils/dateUtils.ts` (nuevo)
- `gestor-licencias-frontend/src/pages/Licencias/CreateLicenciaPage.tsx`
- `gestor-licencias-frontend/src/pages/Licencias/EditLicenciaPage.tsx`
- `gestor-licencias-frontend/src/pages/Solicitudes/EditSolicitudPage.tsx`

### Backend
- `src/utils/dateUtils.js` (nuevo)
- `src/services/solicitudes.service.js`

## Pruebas Realizadas

Se crearon scripts de prueba para verificar el funcionamiento:

1. **`test-timezone-fix.js`**: Prueba las utilidades del frontend
2. **`test-backend-timezone.js`**: Prueba las utilidades del backend
3. **`test-simple-timezone.js`**: Prueba básica de funcionamiento

### Resultados de las Pruebas

✅ Las fechas se mantienen consistentes entre conversiones
✅ No hay desplazamiento de días
✅ Las utilidades funcionan correctamente en ambas direcciones
✅ Los campos no-fecha no se modifican

## Beneficios de la Solución

1. **Consistencia**: Las fechas se manejan uniformemente en toda la aplicación
2. **Precisión**: No hay más desplazamiento de días en las fechas
3. **Mantenibilidad**: Código centralizado y reutilizable
4. **Escalabilidad**: Fácil de extender a otros componentes que manejen fechas

## Uso en el Código

### Frontend - Creación
```typescript
import { toElSalvadorDate, combineDateAndTime, getCurrentElSalvadorDate } from '../../utils/dateUtils';

// En formularios
const formData = {
  fecha_inicio: getCurrentElSalvadorDate(),
  // ...
};

// Antes de enviar al backend
const solicitudData = {
  ...formData,
  fecha_inicio: toElSalvadorDate(formData.fecha_inicio),
  fecha_fin: toElSalvadorDate(formData.fecha_fin)
};
```

### Frontend - Edición
```typescript
import { toElSalvadorDate, fromElSalvadorDate, combineDateAndTime } from '../../utils/dateUtils';

// Al cargar datos para editar
const convertedData = {
  ...originalData,
  fecha_inicio: fromElSalvadorDate(originalData.fecha_inicio),
  fecha_fin: fromElSalvadorDate(originalData.fecha_fin)
};

// Antes de enviar actualizaciones
const normalizedData = {
  ...formData,
  fecha_inicio: toElSalvadorDate(formData.fecha_inicio),
  fecha_fin: toElSalvadorDate(formData.fecha_fin)
};
```

### Backend
```javascript
const { normalizeDates } = require('../utils/dateUtils');

// En servicios
async create(solicitudData) {
  const normalizedData = normalizeDates(solicitudData);
  // Procesar con datos normalizados
}

async update(id, solicitudData) {
  const normalizedData = normalizeDates(solicitudData);
  // Procesar con datos normalizados
}
```

## Estado de Implementación

### ✅ Completamente Implementado
- **Creación de licencias**: `CreateLicenciaPage.tsx`
- **Edición de licencias**: `EditLicenciaPage.tsx` (con utilidades de fecha)
- **Edición de solicitudes**: `EditSolicitudPage.tsx` (con utilidades de fecha)
- **Backend - Creación y actualización**: `solicitudes.service.js`

### ⚠️ Notas sobre Errores de Linter
- Los archivos `EditLicenciaPage.tsx` y `EditSolicitudPage.tsx` tienen errores de linter pre-existentes relacionados con tipos de TypeScript
- Estos errores no afectan la funcionalidad de las utilidades de fecha implementadas
- Las utilidades de fecha están correctamente implementadas y funcionan

## Notas Importantes

1. **Compatibilidad**: La solución es compatible con navegadores modernos
2. **Rendimiento**: Las conversiones son mínimas y no afectan el rendimiento
3. **Mantenimiento**: Cualquier cambio en la zona horaria solo requiere actualizar las constantes
4. **Testing**: Se incluyen pruebas para verificar el funcionamiento correcto

## Próximos Pasos

1. ✅ **COMPLETADO**: Aplicar las mismas utilidades a otros componentes que manejen fechas
2. ✅ **COMPLETADO**: Actualizar `EditLicenciaPage.tsx` y `EditSolicitudPage.tsx` con las utilidades
3. **Opcional**: Resolver errores de linter pre-existentes en los archivos de edición
4. **Opcional**: Agregar validaciones adicionales para fechas en zonas horarias extremas
5. **Opcional**: Considerar usar una librería como `date-fns-tz` para manejo más robusto de zonas horarias 
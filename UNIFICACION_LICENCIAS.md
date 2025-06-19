# Unificación de Servicios de Licencias

## Resumen
Se ha unificado la lógica de licencias eliminando la duplicación entre `licencias.service.js` y `licencia.service.js`.

## Cambios Realizados

### 1. Archivos Eliminados
- `src/services/licencia.service.js` ❌
- `src/controllers/licencia.controller.js` ❌

### 2. Servicio Unificado
- `src/services/licencias.service.js` ✅ (Mantiene toda la lógica)
- `src/controllers/licencias.controller.js` ✅ (Mantiene toda la lógica)

### 3. Endpoint Único
- `/api/licencias` ✅ (Endpoint principal)
- `/api/licencia` ❌ (Eliminado)

## Beneficios de la Unificación

### ✅ Ventajas
1. **Lógica consistente:** Solo un lugar para manejar licencias
2. **Mantenimiento simplificado:** Cambios en un solo archivo
3. **Menos confusión:** Un solo endpoint para usar
4. **Mejor rendimiento:** No hay duplicación de código
5. **Lógica completa:** Incluye manejo de `periodo_control: 'ninguno'`

### 🔧 Funcionalidades Mantenidas
- Creación directa de licencias
- Validaciones por tipo de licencia
- Manejo de disponibilidad
- Soporte para tipos con `periodo_control: 'ninguno'`
- Cálculo de días/horas
- Validaciones especiales por código

## Uso del Endpoint Unificado

### Crear Licencia
```bash
POST /api/licencias
```

**Campos requeridos:**
```json
{
  "trabajador_id": 1,
  "tipo_licencia_id": 1,
  "fecha_inicio": "2024-01-15",
  "fecha_fin": "2024-01-20",
  "dias_totales": 6,
  "dias_habiles": 6,
  "dias_calendario": 6,
  "estado": "ACTIVA",
  "activo": true
}
```

### Obtener Licencias
```bash
GET /api/licencias
GET /api/licencias/:id
GET /api/licencias/trabajador/:trabajadorId
GET /api/licencias/tipo-licencia/:tipoLicenciaId
GET /api/licencias/estado/:estado
```

## Compatibilidad

### Frontend
- ✅ No requiere cambios
- ✅ Usa `/api/licencias` (ya correcto)
- ✅ Todas las funcionalidades mantienen

### Scripts de Prueba
- ✅ Actualizados para usar campos correctos
- ✅ Eliminados campos de solicitud de licencias

## Verificación

Para verificar que la unificación funciona:

```bash
# Ejecutar script de prueba
node test-licencia-tiempo-indefinido.js

# Verificar endpoints
curl http://localhost:3000/api/licencias
```

## Conclusión

La unificación simplifica significativamente el código base, elimina la duplicación y asegura que toda la lógica de licencias esté en un solo lugar. Esto facilita el mantenimiento y reduce la posibilidad de bugs por inconsistencias entre servicios. 
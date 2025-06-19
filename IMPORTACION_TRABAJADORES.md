# Importación Masiva de Trabajadores

## Descripción
Esta funcionalidad permite importar trabajadores de manera masiva desde un archivo Excel, facilitando la carga inicial de datos o actualizaciones en lote.

## Características

### ✅ Funcionalidades Implementadas
- **Importación desde Excel**: Soporte para archivos .xlsx y .xls
- **Validación de datos**: Verificación de campos obligatorios y formatos
- **Manejo de errores**: Reporte detallado de errores por fila
- **Prevención de duplicados**: Verificación automática de códigos existentes
- **Template descargable**: Archivo Excel de ejemplo con formato correcto
- **Drag & Drop**: Interfaz intuitiva para subir archivos
- **Procesamiento en lote**: Transacciones para garantizar consistencia
- **Inicialización automática**: Creación automática de disponibilidad de licencias

### 📋 Campos Requeridos
| Campo | Tipo | Obligatorio | Descripción |
|-------|------|-------------|-------------|
| Código | Texto | ✅ | Código único del trabajador |
| Nombre Completo | Texto | ✅ | Nombre completo del trabajador |
| Email | Texto | ✅ | Correo electrónico |
| Teléfono | Texto | ❌ | Número de teléfono |
| Departamento | Texto | ❌ | Nombre del departamento (debe existir) |
| Puesto | Texto | ❌ | Nombre del puesto (debe existir) |
| Tipo Personal | Texto | ✅ | OPERATIVO o ADMINISTRATIVO |
| Fecha Ingreso | Fecha | ✅ | Formato: YYYY-MM-DD |
| Activo | Texto | ✅ | Sí/No, True/False, 1/0 |

### 🔧 Validaciones Implementadas
- **Campos obligatorios**: Código, nombre completo, email
- **Formato de email**: Validación básica de formato
- **Tipo personal**: Solo OPERATIVO o ADMINISTRATIVO
- **Fecha de ingreso**: Formato YYYY-MM-DD
- **Códigos únicos**: Prevención de duplicados
- **Departamentos y puestos**: Verificación de existencia en BD
- **Tamaño de archivo**: Máximo 5MB
- **Tipo de archivo**: Solo Excel (.xlsx, .xls)

## Uso

### 1. Acceso a la Funcionalidad
- Navegar a la página de Trabajadores
- Hacer clic en el botón "Importar" (icono de nube)

### 2. Preparación del Archivo
- Descargar el template desde el modal
- Completar los datos siguiendo el formato
- Guardar como archivo Excel (.xlsx)

### 3. Importación
- Arrastrar y soltar el archivo o hacer clic para seleccionar
- Revisar la validación previa
- Hacer clic en "Importar"
- Revisar el reporte de resultados

### 4. Resultados
- **Éxitos**: Número de trabajadores importados correctamente
- **Errores**: Lista detallada de errores por fila
- **Duplicados**: Códigos que ya existían en el sistema

## Estructura del Backend

### Endpoint
```
POST /api/trabajadores/import
Content-Type: multipart/form-data
```

### Parámetros
- `file`: Archivo Excel (.xlsx, .xls)

### Respuesta
```json
{
  "success": true,
  "message": "Importación completada. X trabajadores importados exitosamente de Y totales.",
  "data": {
    "total": 10,
    "success": 8,
    "errors": [
      {
        "row": 3,
        "error": "El código EMP001 ya existe"
      }
    ],
    "duplicates": 1
  }
}
```

## Archivos Modificados/Creados

### Backend
- `src/services/trabajadores.service.js` - Método `importFromExcel`
- `src/controllers/trabajadores.controller.js` - Método `importFromExcel`
- `src/routes/trabajadores.routes.js` - Ruta de importación con multer

### Frontend
- `src/constants/api.ts` - Ruta de importación
- `src/services/trabajadores.service.ts` - Método de importación
- `src/pages/Trabajadores/components/ImportTrabajadoresModal.tsx` - Componente modal
- `src/pages/Trabajadores/TrabajadoresPage.tsx` - Integración del botón

## Dependencias Agregadas
- `multer` - Manejo de archivos en el backend

## Consideraciones Técnicas

### Seguridad
- Validación de tipo de archivo
- Límite de tamaño (5MB)
- Sanitización de datos
- Transacciones para consistencia

### Rendimiento
- Procesamiento en memoria
- Transacciones por lote
- Validación previa de datos

### Usabilidad
- Interfaz drag & drop
- Feedback visual en tiempo real
- Reporte detallado de errores
- Template descargable

## Ejemplo de Archivo Excel

| Código | Nombre Completo | Email | Teléfono | Departamento | Puesto | Tipo Personal | Fecha Ingreso | Activo |
|--------|----------------|-------|----------|--------------|--------|---------------|---------------|--------|
| EMP001 | Juan Pérez | juan.perez@empresa.com | 123456789 | RRHH | Analista | ADMINISTRATIVO | 2024-01-15 | Sí |
| EMP002 | María García | maria.garcia@empresa.com | 987654321 | IT | Desarrollador | OPERATIVO | 2024-02-01 | Sí |

## Troubleshooting

### Errores Comunes
1. **"Faltan encabezados"**: Verificar que el archivo tenga las columnas correctas
2. **"Código ya existe"**: El trabajador ya está registrado en el sistema
3. **"Departamento no encontrado"**: El departamento debe existir previamente
4. **"Tipo personal inválido"**: Solo OPERATIVO o ADMINISTRATIVO
5. **"Archivo muy grande"**: Máximo 5MB permitido

### Soluciones
1. Usar el template proporcionado
2. Verificar datos antes de importar
3. Crear departamentos/puestos previamente
4. Revisar formato de fechas
5. Comprimir archivo si es necesario 
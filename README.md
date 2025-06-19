# Gestor de Licencias - Sistema Completo

Sistema completo de gestión de licencias que incluye una API REST (backend) y una aplicación web (frontend) para administrar licencias de empleados, departamentos, puestos y solicitudes.

## Estructura del Proyecto

```
gestor-licencias-api/
├── src/                    # Backend API (Node.js + Express)
│   ├── controllers/        # Controladores de la API
│   ├── models/            # Modelos de datos
│   ├── routes/            # Rutas de la API
│   ├── services/          # Servicios de negocio
│   ├── config/            # Configuración (DB, migraciones)
│   └── app.js             # Punto de entrada del servidor
├── gestor-licencias-frontend/  # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── services/      # Servicios de API
│   │   ├── store/         # Redux store
│   │   └── types/         # Tipos TypeScript
│   └── package.json
└── README.md
```

## Características Principales

### Backend (API)
- **Framework**: Node.js + Express
- **Base de Datos**: PostgreSQL con TypeORM
- **Autenticación**: JWT
- **Validación**: Express-validator
- **Documentación**: Postman Collection incluida
- **Reportes**: Generación de PDF y Excel

### Frontend (Web App)
- **Framework**: React 19 + TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Charts**: Recharts para gráficos

## Módulos del Sistema

- **Gestión de Trabajadores**: CRUD completo de empleados
- **Departamentos**: Administración de departamentos
- **Puestos**: Gestión de puestos de trabajo
- **Tipos de Licencias**: Configuración de tipos de licencias
- **Solicitudes**: Proceso de solicitud y aprobación
- **Licencias**: Gestión de licencias aprobadas
- **Disponibilidad**: Control de días disponibles
- **Validaciones**: Sistema de validaciones
- **Reportes**: Generación de reportes y estadísticas
- **Auditoría**: Seguimiento de cambios

## Instalación y Configuración

### Prerrequisitos
- Node.js (v18 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/gestor-licencias-api.git
cd gestor-licencias-api
```

### 2. Configurar el Backend

```bash
# Instalar dependencias del backend
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de base de datos
```

Variables de entorno necesarias (`.env`):
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=gestor_licencias
JWT_SECRET=tu_jwt_secret
PORT=3001
```

### 3. Configurar la Base de Datos

```bash
# Ejecutar migraciones
npm run migration:run

# (Opcional) Ejecutar seeds para datos de prueba
node scripts/seed-departamentos-puestos.js
node scripts/seed-tipos-licencias.js
node scripts/seed-trabajadores.js
```

### 4. Configurar el Frontend

```bash
# Navegar al directorio del frontend
cd gestor-licencias-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de tu API
```

Variables de entorno del frontend (`.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

## Ejecutar el Proyecto

### Backend
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

### Frontend
```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build
```

## Documentación

- [Documentación Detallada](./DOCUMENTACION_DETALLADA.md)
- [Guía de Implementación Frontend](./GUIA_IMPLEMENTACION_FRONTEND.md)
- [Importación de Trabajadores](./IMPORTACION_TRABAJADORES.md)
- [Solución Licencias Tiempo Indefinido](./SOLUCION_LICENCIAS_TIEMPO_INDEFINIDO.md)

## Testing

El proyecto incluye archivos de prueba para verificar la funcionalidad:
- `test-get-endpoints.js` - Prueba de endpoints
- `test-licencia-horas-completo.js` - Prueba de licencias por horas
- `test-licencia-tiempo-indefinido.js` - Prueba de licencias indefinidas

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión

### Trabajadores
- `GET /api/trabajadores` - Listar trabajadores
- `POST /api/trabajadores` - Crear trabajador
- `PUT /api/trabajadores/:id` - Actualizar trabajador
- `DELETE /api/trabajadores/:id` - Eliminar trabajador

### Departamentos
- `GET /api/departamentos` - Listar departamentos
- `POST /api/departamentos` - Crear departamento
- `PUT /api/departamentos/:id` - Actualizar departamento
- `DELETE /api/departamentos/:id` - Eliminar departamento

### Tipos de Licencias
- `GET /api/tipos-licencias` - Listar tipos de licencias
- `POST /api/tipos-licencias` - Crear tipo de licencia
- `PUT /api/tipos-licencias/:id` - Actualizar tipo de licencia
- `DELETE /api/tipos-licencias/:id` - Eliminar tipo de licencia

### Solicitudes
- `GET /api/solicitudes` - Listar solicitudes
- `POST /api/solicitudes` - Crear solicitud
- `PUT /api/solicitudes/:id` - Actualizar solicitud
- `DELETE /api/solicitudes/:id` - Eliminar solicitud

### Reportes
- `GET /api/reportes/departamento` - Reporte por departamento
- `GET /api/reportes/trabajador` - Reporte por trabajador
- `GET /api/reportes/tendencias` - Reporte de tendencias
- `GET /api/reportes/tipo-licencia` - Reporte por tipo de licencia

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia ISC. Ver el archivo `LICENSE` para más detalles.

## Autores

- Rodolfovargasdev

## Agradecimientos

- Material-UI por los componentes de UI
- TypeORM por el ORM
- Express.js por el framework web
- React por el framework de frontend

---

**Nota**: Asegúrate de configurar correctamente las variables de entorno y la base de datos antes de ejecutar el proyecto. 

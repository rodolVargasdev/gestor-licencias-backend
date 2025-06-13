# Sistema de Gestión de Licencias

Sistema completo para la gestión de licencias, desarrollado con una arquitectura moderna y tecnologías actuales.

## 🏗️ Arquitectura

El proyecto está dividido en dos partes principales:

### Backend (API REST)
- **Tecnologías**: Node.js, Express, TypeScript, TypeORM, PostgreSQL
- **Patrón**: Arquitectura en capas (Controllers, Services, Repositories)
- **Características**:
  - API RESTful
  - Autenticación JWT
  - Validación de datos
  - Manejo de errores centralizado
  - Migraciones de base de datos
  - Documentación con Postman

### Frontend (SPA)
- **Tecnologías**: React, TypeScript, Material-UI, Redux Toolkit
- **Patrón**: Arquitectura basada en componentes
- **Características**:
  - Diseño responsivo
  - Estado global con Redux
  - Formularios con Formik y Yup
  - Navegación con React Router
  - UI moderna con Material-UI
  - Gráficos con Recharts

## 📦 Módulos del Sistema

### 1. Tipos de Licencias
- Gestión de diferentes tipos de licencias
- Configuración de duración y requisitos
- Validación de límites y restricciones

### 2. Control de Límites
- Control de días disponibles por tipo de licencia
- Historial de uso
- Alertas de límites

### 3. Trabajadores
- Gestión de información de trabajadores
- Historial de licencias
- Documentación personal

### 4. Validaciones
- Proceso de validación de licencias
- Estados: Pendiente, Aprobada, Rechazada, Cancelada
- Filtros y búsquedas avanzadas

## 🚀 Características Técnicas

### Backend
- **Seguridad**:
  - Autenticación JWT
  - Encriptación de contraseñas
  - Middleware de autorización
  - Protección contra ataques comunes

- **Base de Datos**:
  - PostgreSQL como motor principal
  - TypeORM para ORM
  - Migraciones automáticas
  - Relaciones y restricciones

- **API**:
  - Endpoints RESTful
  - Validación de datos
  - Manejo de errores
  - Respuestas estandarizadas

### Frontend
- **Estado**:
  - Redux Toolkit para gestión de estado
  - Slices por módulo
  - Thunks para operaciones asíncronas

- **UI/UX**:
  - Material-UI para componentes
  - Temas personalizables
  - Diseño responsivo
  - Feedback visual

- **Formularios**:
  - Formik para gestión
  - Yup para validación
  - Campos personalizados
  - Mensajes de error

## 🛠️ Instalación

### Requisitos Previos
- Node.js (v16+)
- PostgreSQL (v12+)
- npm o yarn

### Backend
```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Ejecutar migraciones
npm run migration:run

# Iniciar servidor de desarrollo
npm run dev
```

### Frontend
```bash
# Navegar al directorio
cd gestor-licencias-frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de la API

# Iniciar servidor de desarrollo
npm run dev
```

## 📚 Documentación

### API
- Colección de Postman incluida
- Documentación de endpoints
- Ejemplos de uso

### Frontend
- Guía de implementación
- Estructura de componentes
- Patrones de diseño

## 🔧 Scripts Disponibles

### Backend
```bash
npm run dev          # Inicia servidor de desarrollo
npm run build        # Compila TypeScript
npm run migration:run    # Ejecuta migraciones
npm run migration:revert # Revierte última migración
```

### Frontend
```bash
npm run dev     # Inicia servidor de desarrollo
npm run build   # Compila para producción
npm run lint    # Ejecuta linter
npm run preview # Vista previa de producción
```

## 🧪 Pruebas

### Backend
- Pruebas de integración
- Pruebas de endpoints
- Validación de datos

### Frontend
- Pruebas de componentes
- Pruebas de integración
- Pruebas de estado

## 📦 Estructura de Directorios

```
gestor-licencias/
├── src/                    # Backend
│   ├── controllers/       # Controladores
│   ├── services/         # Lógica de negocio
│   ├── repositories/     # Acceso a datos
│   ├── middlewares/      # Middlewares
│   ├── config/          # Configuraciones
│   └── utils/           # Utilidades
│
└── gestor-licencias-frontend/  # Frontend
    ├── src/
    │   ├── components/   # Componentes reutilizables
    │   ├── pages/       # Páginas
    │   ├── store/       # Estado Redux
    │   ├── services/    # Servicios API
    │   └── utils/       # Utilidades
    └── public/          # Archivos estáticos
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de características
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- Tu Nombre - Desarrollo inicial

## 🙏 Agradecimientos

- Material-UI por los componentes
- TypeORM por el ORM
- La comunidad de código abierto 
# 🚀 Guía Rápida: Despliegue en Render

## ⚡ Despliegue Rápido en Render (5 minutos)

### Paso 1: Crear cuenta en Render
1. Ve a [render.com](https://render.com)
2. Regístrate con tu cuenta de GitHub
3. Crea un nuevo proyecto

### Paso 2: Desplegar la Base de Datos

1. **En Render Dashboard**:
   - Haz clic en "New" → "PostgreSQL"
   - Dale un nombre: `gestor-licencias-db`
   - Selecciona el plan gratuito
   - Haz clic en "Create Database"

2. **Configurar variables**:
   - Render generará automáticamente las credenciales
   - Copia la "Internal Database URL"

### Paso 3: Desplegar el Backend

1. **Crear Web Service**:
   - Haz clic en "New" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Selecciona `gestor-licencias-api`

2. **Configurar el servicio**:
   - **Name**: `gestor-licencias-backend`
   - **Environment**: `Docker`
   - **Region**: El más cercano a ti
   - **Branch**: `main`
   - **Root Directory**: `/` (dejar vacío)

3. **Variables de entorno**:
   ```env
   DB_HOST=tu-postgres-host.render.com
   DB_PORT=5432
   DB_USER=gestor_licencias_user
   DB_PASSWORD=tu-password-de-render
   DB_NAME=gestor_licencias_db
   JWT_SECRET=tu-jwt-secret-super-seguro-de-64-caracteres
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend-url.onrender.com
   PORT=3000
   ```

4. **Configuración avanzada**:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`

### Paso 4: Desplegar el Frontend

1. **Crear Static Site**:
   - Haz clic en "New" → "Static Site"
   - Conecta tu repositorio de GitHub
   - Selecciona `gestor-licencias-api`

2. **Configurar el servicio**:
   - **Name**: `gestor-licencias-frontend`
   - **Root Directory**: `gestor-licencias-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Variables de entorno**:
   ```env
   VITE_API_URL=https://tu-backend-url.onrender.com/api
   VITE_APP_NAME=Gestor de Licencias
   VITE_APP_VERSION=1.0.0
   ```

### Paso 5: Configurar Dominios

1. **Backend**:
   - Render te dará una URL como: `https://tu-backend.onrender.com`
   - Puedes configurar un dominio personalizado en "Settings"

2. **Frontend**:
   - Render te dará una URL como: `https://tu-frontend.onrender.com`
   - Puedes configurar un dominio personalizado en "Settings"

3. **Actualizar CORS**:
   - Ve al backend → Environment
   - Actualiza `CORS_ORIGIN` con la URL del frontend

### Paso 6: Ejecutar Migraciones

1. **Conectar a la base de datos**:
   - Ve a tu servicio de base de datos en Render
   - Haz clic en "Connect" → "External Database URL"
   - Usa un cliente como pgAdmin o DBeaver

2. **Ejecutar migraciones**:
   ```sql
   -- Copia y pega el contenido de backup.sql
   -- O ejecuta las migraciones manualmente
   ```

## 🔧 Configuración Avanzada

### Variables de Entorno Recomendadas

**Backend**:
```env
DB_HOST=tu-postgres-host.render.com
DB_PORT=5432
DB_USER=gestor_licencias_user
DB_PASSWORD=tu-password-de-render
DB_NAME=gestor_licencias_db
JWT_SECRET=tu-jwt-secret-super-seguro-de-64-caracteres
NODE_ENV=production
CORS_ORIGIN=https://tu-frontend-url.onrender.com
PORT=3000
LOG_LEVEL=info
```

**Frontend**:
```env
VITE_API_URL=https://tu-backend-url.onrender.com/api
VITE_APP_NAME=Gestor de Licencias
VITE_APP_VERSION=1.0.0
```

### Monitoreo

1. **Logs**: Render muestra logs en tiempo real
2. **Métricas**: CPU, memoria automáticamente
3. **Health Checks**: Automático con `/api/health`

## 🚨 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica las variables de entorno del backend
- Asegúrate de que la base de datos esté desplegada
- Verifica que la URL de conexión sea correcta

### Error: "CORS error"
- Verifica que `CORS_ORIGIN` apunte a la URL correcta del frontend
- Incluye el protocolo `https://`
- Asegúrate de que no haya espacios extra

### Error: "Build failed"
- Verifica que el Dockerfile esté correcto
- Revisa los logs de build en Render
- Asegúrate de que todas las dependencias estén en package.json

### Error: "Health check failed"
- Verifica que el endpoint `/api/health` esté funcionando
- Revisa los logs del backend
- Asegúrate de que el puerto sea correcto

### Error: "Static site build failed"
- Verifica que el comando de build sea correcto
- Asegúrate de que el directorio de publicación sea `dist`
- Revisa los logs de build

## 📊 Verificación Final

Después del despliegue, verifica:

- ✅ [ ] Backend responde en: `https://tu-backend.onrender.com/api/health`
- ✅ [ ] Frontend carga en: `https://tu-frontend.onrender.com`
- ✅ [ ] La base de datos está conectada
- ✅ [ ] No hay errores CORS
- ✅ [ ] Los logs no muestran errores

## 💰 Costos

- **Render**: Gratis para proyectos personales
- **Base de datos**: Gratis (PostgreSQL)
- **Dominios**: Incluidos automáticamente
- **Límites gratuitos**:
  - 750 horas/mes de runtime
  - 512MB RAM
  - 1GB almacenamiento

## 🔄 Actualizaciones

Para actualizar tu aplicación:

1. Haz push a tu repositorio de GitHub
2. Render detectará los cambios automáticamente
3. Desplegará la nueva versión

## ⚠️ Limitaciones del Plan Gratuito

- **Sleep mode**: Los servicios se "duermen" después de 15 minutos de inactividad
- **Cold starts**: La primera petición puede ser lenta
- **Límites de ancho de banda**: 100GB/mes

---

¡Listo! 🎉 Tu aplicación estará funcionando en Render en menos de 5 minutos. 
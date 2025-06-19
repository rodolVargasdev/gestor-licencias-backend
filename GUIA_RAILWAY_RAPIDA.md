# 🚀 Guía Rápida: Despliegue en Railway

## ⚡ Despliegue Rápido en Railway (5 minutos)

### Paso 1: Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Regístrate con tu cuenta de GitHub
3. Crea un nuevo proyecto

### Paso 2: Desplegar la Base de Datos

1. **En Railway Dashboard**:
   - Haz clic en "New Service"
   - Selecciona "Database" → "PostgreSQL"
   - Dale un nombre: `gestor-licencias-db`

2. **Configurar variables**:
   - Railway generará automáticamente las credenciales
   - Copia la URL de conexión

### Paso 3: Desplegar el Backend

1. **Conectar repositorio**:
   - Haz clic en "New Service" → "GitHub Repo"
   - Selecciona tu repositorio `gestor-licencias-api`

2. **Configurar variables de entorno**:
   ```env
   DB_HOST=tu-postgres-host.railway.app
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu-password-de-railway
   DB_NAME=railway
   JWT_SECRET=tu-jwt-secret-super-seguro
   NODE_ENV=production
   CORS_ORIGIN=https://tu-frontend-url.railway.app
   ```

3. **Railway detectará automáticamente**:
   - El Dockerfile
   - El comando de inicio (`npm start`)
   - El puerto (3000)

### Paso 4: Desplegar el Frontend

1. **Crear nuevo servicio**:
   - Haz clic en "New Service" → "GitHub Repo"
   - Selecciona tu repositorio `gestor-licencias-api`
   - En "Root Directory" pon: `gestor-licencias-frontend`

2. **Configurar variables**:
   ```env
   VITE_API_URL=https://tu-backend-url.railway.app/api
   ```

3. **Railway usará**:
   - El Dockerfile del frontend
   - Nginx para servir la aplicación

### Paso 5: Configurar Dominios

1. **Backend**:
   - Ve a tu servicio backend
   - Haz clic en "Settings" → "Domains"
   - Railway te dará una URL como: `https://tu-backend.railway.app`

2. **Frontend**:
   - Ve a tu servicio frontend
   - Haz clic en "Settings" → "Domains"
   - Railway te dará una URL como: `https://tu-frontend.railway.app`

3. **Actualizar CORS**:
   - Ve al backend → Variables de entorno
   - Actualiza `CORS_ORIGIN` con la URL del frontend

### Paso 6: Ejecutar Migraciones

1. **Conectar a la base de datos**:
   ```bash
   # En Railway, ve a tu servicio de base de datos
   # Haz clic en "Connect" → "psql"
   ```

2. **Ejecutar migraciones**:
   ```sql
   -- Copia y pega el contenido de backup.sql
   -- O ejecuta las migraciones manualmente
   ```

## 🔧 Configuración Avanzada

### Variables de Entorno Recomendadas

**Backend**:
```env
DB_HOST=tu-postgres-host.railway.app
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu-password-de-railway
DB_NAME=railway
JWT_SECRET=tu-jwt-secret-super-seguro-de-64-caracteres
NODE_ENV=production
CORS_ORIGIN=https://tu-frontend-url.railway.app
PORT=3000
LOG_LEVEL=info
```

**Frontend**:
```env
VITE_API_URL=https://tu-backend-url.railway.app/api
VITE_APP_NAME=Gestor de Licencias
VITE_APP_VERSION=1.0.0
```

### Monitoreo

1. **Logs**: Railway muestra logs en tiempo real
2. **Métricas**: CPU, memoria, red automáticamente
3. **Health Checks**: Automático con `/api/health`

## 🚨 Solución de Problemas

### Error: "Cannot connect to database"
- Verifica las variables de entorno del backend
- Asegúrate de que la base de datos esté desplegada

### Error: "CORS error"
- Verifica que `CORS_ORIGIN` apunte a la URL correcta del frontend
- Incluye el protocolo `https://`

### Error: "Build failed"
- Verifica que el Dockerfile esté correcto
- Revisa los logs de build en Railway

### Error: "Health check failed"
- Verifica que el endpoint `/api/health` esté funcionando
- Revisa los logs del backend

## 📊 Verificación Final

Después del despliegue, verifica:

- ✅ [ ] Backend responde en: `https://tu-backend.railway.app/api/health`
- ✅ [ ] Frontend carga en: `https://tu-frontend.railway.app`
- ✅ [ ] La base de datos está conectada
- ✅ [ ] No hay errores CORS
- ✅ [ ] Los logs no muestran errores

## 💰 Costos

- **Railway**: $5/mes por servicio (primeros $5 gratis)
- **Base de datos**: Incluida en el plan
- **Dominios**: Incluidos automáticamente

## 🔄 Actualizaciones

Para actualizar tu aplicación:

1. Haz push a tu repositorio de GitHub
2. Railway detectará los cambios automáticamente
3. Desplegará la nueva versión

---

¡Listo! 🎉 Tu aplicación estará funcionando en Railway en menos de 5 minutos. 
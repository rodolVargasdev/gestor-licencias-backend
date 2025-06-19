# 🚀 Guía de Despliegue en Render

Esta guía te ayudará a desplegar tu aplicación de Gestor de Licencias en Render de manera sencilla, sin Docker.

## 📋 Prerrequisitos

1. **Cuenta en GitHub** con tu código subido
2. **Cuenta en Render.com** (gratuita)
3. **Base de datos PostgreSQL** (puedes usar la de Render)

## 🗄️ Paso 1: Crear Base de Datos en Render

1. Ve a [render.com](https://render.com) y crea una cuenta
2. En el dashboard, haz clic en "New +"
3. Selecciona "PostgreSQL"
4. Configura:
   - **Name**: `gestor-licencias-db`
   - **Database**: `gestor_licencias`
   - **User**: `gestor_licencias_user`
   - **Plan**: Free
5. Haz clic en "Create Database"
6. **Guarda la URL de conexión** que te proporciona Render

## 🔧 Paso 2: Desplegar el Backend (API)

1. En Render, haz clic en "New +"
2. Selecciona "Web Service"
3. Conecta tu repositorio de GitHub
4. Configura el servicio:

### Configuración Básica:
- **Name**: `gestor-licencias-api`
- **Environment**: `Node`
- **Region**: El más cercano a ti
- **Branch**: `main` (o tu rama principal)
- **Root Directory**: `/` (dejar vacío)
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Variables de Entorno:
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://usuario:password@host:puerto/database
JWT_SECRET=tu_jwt_secret_super_seguro_aqui
CORS_ORIGIN=https://gestor-licencias-frontend.onrender.com
```

### Notas importantes:
- Reemplaza `DATABASE_URL` con la URL que te dio Render en el Paso 1
- Para `JWT_SECRET`, genera un string aleatorio (puedes usar un generador online)
- El `CORS_ORIGIN` lo actualizarás después de crear el frontend

4. Haz clic en "Create Web Service"

## 🎨 Paso 3: Desplegar el Frontend

1. En Render, haz clic en "New +"
2. Selecciona "Static Site"
3. Conecta el mismo repositorio de GitHub
4. Configura:

### Configuración:
- **Name**: `gestor-licencias-frontend`
- **Branch**: `main` (o tu rama principal)
- **Root Directory**: `/` (dejar vacío)
- **Build Command**: `cd gestor-licencias-frontend && npm install && npm run build`
- **Publish Directory**: `gestor-licencias-frontend/dist`

### Variables de Entorno:
```
VITE_API_URL=https://gestor-licencias-api.onrender.com
```

5. Haz clic en "Create Static Site"

## 🔄 Paso 4: Actualizar CORS

Una vez que tengas la URL del frontend:

1. Ve al servicio del backend en Render
2. En "Environment", actualiza `CORS_ORIGIN` con la URL del frontend
3. Haz clic en "Save Changes"
4. El servicio se reiniciará automáticamente

## 🗃️ Paso 5: Configurar la Base de Datos

1. Ve a tu base de datos en Render
2. Haz clic en "Connect"
3. Usa pgAdmin o cualquier cliente PostgreSQL
4. Ejecuta el script SQL que tienes en `backup_modified.sql`

### Alternativa usando la consola de Render:
1. Ve a tu base de datos
2. Haz clic en "Shell"
3. Ejecuta: `psql -d gestor_licencias -f backup_modified.sql`

## ✅ Paso 6: Verificar el Despliegue

1. **Backend**: Visita `https://tu-api.onrender.com/api/health`
2. **Frontend**: Visita `https://tu-frontend.onrender.com`

## 🔧 Solución de Problemas

### Error de CORS:
- Verifica que `CORS_ORIGIN` apunte a la URL correcta del frontend
- Asegúrate de que no tenga una barra final

### Error de Base de Datos:
- Verifica que `DATABASE_URL` sea correcta
- Asegúrate de que la base de datos esté activa en Render

### Error de Build:
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Render

### Error de Variables de Entorno:
- Asegúrate de que todas las variables estén configuradas
- Verifica que no haya espacios extra

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render
2. Verifica la configuración de variables de entorno
3. Asegúrate de que la base de datos esté funcionando

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
- **Frontend**: `https://tu-frontend.onrender.com`
- **Backend**: `https://tu-api.onrender.com`
- **Base de Datos**: PostgreSQL en Render

¡Disfruta tu aplicación desplegada! 🚀 
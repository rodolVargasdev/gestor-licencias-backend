#!/bin/bash

echo "🚀 Iniciando despliegue en Render..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
npm install --production

# Verificar que el frontend existe
if [ -d "gestor-licencias-frontend" ]; then
    echo "📦 Instalando dependencias del frontend..."
    cd gestor-licencias-frontend
    npm install
    
    echo "🔨 Construyendo el frontend..."
    npm run build
    
    cd ..
else
    echo "⚠️  No se encontró el directorio del frontend"
fi

echo "✅ Despliegue completado!"
echo ""
echo "📋 Pasos para desplegar en Render:"
echo "1. Sube este código a GitHub"
echo "2. Ve a render.com y crea una nueva cuenta"
echo "3. Conecta tu repositorio de GitHub"
echo "4. Crea un nuevo Web Service"
echo "5. Configura las variables de entorno:"
echo "   - NODE_ENV=production"
echo "   - PORT=10000"
echo "   - DATABASE_URL=(URL de tu base de datos PostgreSQL)"
echo "   - JWT_SECRET=(un string aleatorio)"
echo "   - CORS_ORIGIN=https://tu-frontend.onrender.com"
echo ""
echo "6. Para el frontend, crea un Static Site"
echo "7. Configura Build Command: cd gestor-licencias-frontend && npm install && npm run build"
echo "8. Configura Publish Directory: gestor-licencias-frontend/dist" 
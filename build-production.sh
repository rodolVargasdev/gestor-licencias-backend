#!/bin/bash

echo "🔨 Generando builds de producción..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto."
    exit 1
fi

# Build del Backend
echo "📦 Preparando backend..."
npm install --production

# Verificar que el frontend existe
if [ -d "gestor-licencias-frontend" ]; then
    echo "📦 Generando build del frontend..."
    cd gestor-licencias-frontend
    
    # Verificar si node_modules existe
    if [ ! -d "node_modules" ]; then
        echo "📦 Instalando dependencias del frontend..."
        npm install
    fi
    
    # Generar build
    echo "🔨 Ejecutando build del frontend..."
    npm run build
    
    # Verificar si se generó la carpeta dist
    if [ -d "dist" ]; then
        echo "✅ Build del frontend generado exitosamente en: gestor-licencias-frontend/dist"
        echo "📁 Contenido de la carpeta dist:"
        ls -la dist/
    else
        echo "❌ Error: No se generó la carpeta dist"
        exit 1
    fi
    
    cd ..
else
    echo "⚠️  No se encontró el directorio del frontend"
fi

echo ""
echo "🎉 ¡Builds completados!"
echo ""
echo "📁 Estructura de archivos generados:"
echo "   - Backend: node_modules/ (dependencias de producción)"
echo "   - Frontend: gestor-licencias-frontend/dist/ (archivos estáticos)"
echo ""
echo "🚀 Listo para desplegar en Render!" 
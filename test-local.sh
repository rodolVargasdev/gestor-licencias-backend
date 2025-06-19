#!/bin/bash

echo "🧪 Probando la aplicación localmente..."

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json"
    exit 1
fi

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
npm install

# Verificar que el frontend existe
if [ -d "gestor-licencias-frontend" ]; then
    echo "📦 Instalando dependencias del frontend..."
    cd gestor-licencias-frontend
    npm install
    cd ..
else
    echo "⚠️  No se encontró el directorio del frontend"
fi

echo "✅ Instalación completada!"
echo ""
echo "🚀 Para iniciar la aplicación:"
echo ""
echo "1. Inicia el backend:"
echo "   npm start"
echo ""
echo "2. En otra terminal, inicia el frontend:"
echo "   cd gestor-licencias-frontend"
echo "   npm run dev"
echo ""
echo "3. Abre tu navegador en:"
echo "   http://localhost:5173"
echo ""
echo "4. El backend estará en:"
echo "   http://localhost:3000" 
#!/bin/bash

# Script de despliegue para Gestor de Licencias
# Uso: ./deploy.sh [development|production]

set -e

ENVIRONMENT=${1:-development}
echo "🚀 Desplegando en modo: $ENVIRONMENT"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar que Docker esté instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar que Docker Compose esté instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

print_message "Verificando archivos de configuración..."

# Verificar archivo .env
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado. Creando desde env.example..."
    if [ -f env.example ]; then
        cp env.example .env
        print_message "Archivo .env creado. Por favor edítalo con tus configuraciones."
    else
        print_error "Archivo env.example no encontrado."
        exit 1
    fi
fi

# Verificar archivo .env del frontend
if [ ! -f gestor-licencias-frontend/.env ]; then
    print_warning "Archivo .env del frontend no encontrado. Creando desde env.example..."
    if [ -f gestor-licencias-frontend/env.example ]; then
        cp gestor-licencias-frontend/env.example gestor-licencias-frontend/.env
        print_message "Archivo .env del frontend creado."
    fi
fi

print_message "Deteniendo contenedores existentes..."
docker-compose down

print_message "Limpiando imágenes anteriores..."
docker-compose down --rmi all

print_message "Construyendo y levantando contenedores..."
if [ "$ENVIRONMENT" = "production" ]; then
    docker-compose -f docker-compose.yml up --build -d
else
    docker-compose up --build -d
fi

print_message "Esperando a que los servicios estén listos..."
sleep 30

# Verificar que los servicios estén funcionando
print_message "Verificando estado de los servicios..."

if docker-compose ps | grep -q "Up"; then
    print_message "✅ Todos los servicios están funcionando correctamente!"
    print_message "🌐 Frontend disponible en: http://localhost"
    print_message "🔧 Backend API disponible en: http://localhost:3001"
    print_message "🗄️  Base de datos PostgreSQL en: localhost:5432"
else
    print_error "❌ Algunos servicios no están funcionando correctamente."
    print_message "Revisa los logs con: docker-compose logs"
    exit 1
fi

print_message "🎉 ¡Despliegue completado exitosamente!"
print_message "Para ver los logs: docker-compose logs -f"
print_message "Para detener: docker-compose down" 
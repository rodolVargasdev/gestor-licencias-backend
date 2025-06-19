# Script de despliegue para Gestor de Licencias (PowerShell)
# Uso: .\deploy.ps1 [development|production]

param(
    [string]$Environment = "development"
)

Write-Host "🚀 Desplegando en modo: $Environment" -ForegroundColor Green

# Función para imprimir mensajes
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar que Docker esté instalado
try {
    docker --version | Out-Null
} catch {
    Write-Error "Docker no está instalado. Por favor instala Docker Desktop primero."
    exit 1
}

# Verificar que Docker Compose esté instalado
try {
    docker-compose --version | Out-Null
} catch {
    Write-Error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
}

Write-Info "Verificando archivos de configuración..."

# Verificar archivo .env
if (-not (Test-Path ".env")) {
    Write-Warning "Archivo .env no encontrado. Creando desde env.example..."
    if (Test-Path "env.example") {
        Copy-Item "env.example" ".env"
        Write-Info "Archivo .env creado. Por favor edítalo con tus configuraciones."
    } else {
        Write-Error "Archivo env.example no encontrado."
        exit 1
    }
}

# Verificar archivo .env del frontend
if (-not (Test-Path "gestor-licencias-frontend\.env")) {
    Write-Warning "Archivo .env del frontend no encontrado. Creando desde env.example..."
    if (Test-Path "gestor-licencias-frontend\env.example") {
        Copy-Item "gestor-licencias-frontend\env.example" "gestor-licencias-frontend\.env"
        Write-Info "Archivo .env del frontend creado."
    }
}

Write-Info "Deteniendo contenedores existentes..."
docker-compose down

Write-Info "Limpiando imágenes anteriores..."
docker-compose down --rmi all

Write-Info "Construyendo y levantando contenedores..."
if ($Environment -eq "production") {
    docker-compose -f docker-compose.yml up --build -d
} else {
    docker-compose up --build -d
}

Write-Info "Esperando a que los servicios estén listos..."
Start-Sleep -Seconds 30

# Verificar que los servicios estén funcionando
Write-Info "Verificando estado de los servicios..."

$services = docker-compose ps
if ($services -match "Up") {
    Write-Info "✅ Todos los servicios están funcionando correctamente!"
    Write-Info "🌐 Frontend disponible en: http://localhost"
    Write-Info "🔧 Backend API disponible en: http://localhost:3001"
    Write-Info "🗄️  Base de datos PostgreSQL en: localhost:5432"
} else {
    Write-Error "❌ Algunos servicios no están funcionando correctamente."
    Write-Info "Revisa los logs con: docker-compose logs"
    exit 1
}

Write-Info "🎉 ¡Despliegue completado exitosamente!"
Write-Info "Para ver los logs: docker-compose logs -f"
Write-Info "Para detener: docker-compose down" 
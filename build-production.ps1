# Script de PowerShell para generar builds de producción

Write-Host "🔨 Generando builds de producción..." -ForegroundColor Green

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto." -ForegroundColor Red
    exit 1
}

# Build del Backend
Write-Host "📦 Preparando backend..." -ForegroundColor Yellow
npm install --production

# Verificar que el frontend existe
if (Test-Path "gestor-licencias-frontend") {
    Write-Host "📦 Generando build del frontend..." -ForegroundColor Yellow
    Set-Location "gestor-licencias-frontend"
    
    # Verificar si node_modules existe
    if (-not (Test-Path "node_modules")) {
        Write-Host "📦 Instalando dependencias del frontend..." -ForegroundColor Yellow
        npm install
    }
    
    # Generar build
    Write-Host "🔨 Ejecutando build del frontend..." -ForegroundColor Yellow
    npm run build
    
    # Verificar si se generó la carpeta dist
    if (Test-Path "dist") {
        Write-Host "✅ Build del frontend generado exitosamente en: gestor-licencias-frontend/dist" -ForegroundColor Green
        Write-Host "📁 Contenido de la carpeta dist:" -ForegroundColor Cyan
        Get-ChildItem "dist" | Format-Table Name, Length, LastWriteTime
    } else {
        Write-Host "❌ Error: No se generó la carpeta dist" -ForegroundColor Red
        exit 1
    }
    
    Set-Location ".."
} else {
    Write-Host "⚠️  No se encontró el directorio del frontend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 ¡Builds completados!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Estructura de archivos generados:" -ForegroundColor Cyan
Write-Host "   - Backend: node_modules/ (dependencias de producción)" -ForegroundColor White
Write-Host "   - Frontend: gestor-licencias-frontend/dist/ (archivos estáticos)" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Listo para desplegar en Render!" -ForegroundColor Green 
# Script para verificar si todo está listo para hacer push

Write-Host "🔍 Verificando estado del repositorio..." -ForegroundColor Cyan

# Verificar si estamos en un repositorio Git
if (-not (Test-Path ".git")) {
    Write-Host "❌ Error: No se encontró un repositorio Git" -ForegroundColor Red
    exit 1
}

# Verificar archivos que NO deberían subirse
Write-Host "📋 Verificando archivos que NO deben subirse:" -ForegroundColor Yellow

$problematicFiles = @()

# Verificar node_modules
if (Test-Path "node_modules") {
    Write-Host "⚠️  node_modules/ encontrado en el directorio raíz" -ForegroundColor Yellow
    $problematicFiles += "node_modules/"
}

if (Test-Path "gestor-licencias-frontend/node_modules") {
    Write-Host "⚠️  gestor-licencias-frontend/node_modules/ encontrado" -ForegroundColor Yellow
    $problematicFiles += "gestor-licencias-frontend/node_modules/"
}

# Verificar archivos .env
if (Test-Path ".env") {
    Write-Host "❌ .env encontrado - NO debe subirse!" -ForegroundColor Red
    $problematicFiles += ".env"
}

if (Test-Path "gestor-licencias-frontend/.env") {
    Write-Host "❌ gestor-licencias-frontend/.env encontrado - NO debe subirse!" -ForegroundColor Red
    $problematicFiles += "gestor-licencias-frontend/.env"
}

# Verificar carpeta dist
if (Test-Path "gestor-licencias-frontend/dist") {
    Write-Host "⚠️  gestor-licencias-frontend/dist/ encontrado" -ForegroundColor Yellow
    $problematicFiles += "gestor-licencias-frontend/dist/"
}

# Verificar archivos de backup
if (Test-Path "backup.sql") {
    Write-Host "⚠️  backup.sql encontrado - Considera si debe subirse" -ForegroundColor Yellow
}

# Verificar estado de Git
Write-Host "`n📊 Estado de Git:" -ForegroundColor Cyan

try {
    $gitStatus = git status --porcelain 2>$null
    if ($gitStatus) {
        Write-Host "📝 Archivos modificados/agregados:" -ForegroundColor Green
        $gitStatus | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
    } else {
        Write-Host "✅ No hay cambios pendientes" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  No se pudo obtener el estado de Git" -ForegroundColor Yellow
}

# Verificar archivos importantes
Write-Host "`n📁 Verificando archivos importantes:" -ForegroundColor Cyan

$importantFiles = @(
    "package.json",
    "env.example",
    "render.yaml",
    "gestor-licencias-frontend/package.json",
    "gestor-licencias-frontend/env.example",
    "gestor-licencias-frontend/vite.config.ts",
    "src/app.js",
    "src/config/database.js"
)

foreach ($file in $importantFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file - FALTANTE!" -ForegroundColor Red
    }
}

# Resumen
Write-Host "`n📋 RESUMEN:" -ForegroundColor Cyan

if ($problematicFiles.Count -eq 0) {
    Write-Host "✅ Todo está listo para hacer push!" -ForegroundColor Green
    Write-Host "`n🚀 Puedes proceder con:" -ForegroundColor Cyan
    Write-Host "   git add ." -ForegroundColor White
    Write-Host "   git commit -m 'Preparar para despliegue en Render'" -ForegroundColor White
    Write-Host "   git push origin main" -ForegroundColor White
} else {
    Write-Host "❌ Hay archivos que deben ser limpiados antes del push:" -ForegroundColor Red
    foreach ($file in $problematicFiles) {
        Write-Host "   - $file" -ForegroundColor Red
    }
    Write-Host "`n🧹 Recomendaciones:" -ForegroundColor Yellow
    Write-Host "   1. Elimina las carpetas node_modules/" -ForegroundColor White
    Write-Host "   2. Elimina los archivos .env" -ForegroundColor White
    Write-Host "   3. Elimina la carpeta dist/ del frontend" -ForegroundColor White
    Write-Host "   4. Verifica que .gitignore esté configurado correctamente" -ForegroundColor White
} 
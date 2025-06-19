Write-Host "🔧 Solucionando problema de configuración de Render..." -ForegroundColor Cyan

Write-Host "`n📋 Problema detectado:" -ForegroundColor Yellow
Write-Host "Render está intentando usar Docker en lugar de Node.js" -ForegroundColor Red
Write-Host "Esto causa el error: '/scripts': not found" -ForegroundColor Red

Write-Host "`n🛠️ Soluciones disponibles:" -ForegroundColor Yellow
Write-Host "1. Renombrar Dockerfile para que Render use Node.js" -ForegroundColor White
Write-Host "2. Verificar configuración en Render" -ForegroundColor White
Write-Host "3. Crear archivo render.yaml específico" -ForegroundColor White

Write-Host "`n🚀 Aplicando solución..." -ForegroundColor Green

# Renombrar Dockerfile para evitar que Render lo use
if (Test-Path "Dockerfile") {
    Rename-Item "Dockerfile" "Dockerfile.backup"
    Write-Host "✅ Dockerfile renombrado a Dockerfile.backup" -ForegroundColor Green
}

# Renombrar docker-compose.yml también
if (Test-Path "docker-compose.yml") {
    Rename-Item "docker-compose.yml" "docker-compose.yml.backup"
    Write-Host "✅ docker-compose.yml renombrado a docker-compose.yml.backup" -ForegroundColor Green
}

Write-Host "`n📋 Configuración correcta para Render:" -ForegroundColor Cyan
Write-Host "Environment: Node" -ForegroundColor White
Write-Host "Build Command: npm install" -ForegroundColor White
Write-Host "Start Command: npm start" -ForegroundColor White

Write-Host "`n📝 Variables de entorno necesarias:" -ForegroundColor Cyan
Write-Host "NODE_ENV=production" -ForegroundColor White
Write-Host "PORT=10000" -ForegroundColor White
Write-Host "DATABASE_URL=postgresql://..." -ForegroundColor White
Write-Host "JWT_SECRET=tu_secret_aqui" -ForegroundColor White
Write-Host "CORS_ORIGIN=https://tu-frontend.onrender.com" -ForegroundColor White

Write-Host "`n✅ Cambios aplicados. Ahora:" -ForegroundColor Green
Write-Host "1. Haz commit y push de estos cambios" -ForegroundColor White
Write-Host "2. En Render, verifica que Environment sea 'Node'" -ForegroundColor White
Write-Host "3. Render debería reconstruir automáticamente" -ForegroundColor White

Write-Host "`n🚀 Comandos para aplicar cambios:" -ForegroundColor Cyan
Write-Host "git add ." -ForegroundColor White
Write-Host "git commit -m 'Fix: Remove Docker config for Render deployment'" -ForegroundColor White
Write-Host "git push origin main" -ForegroundColor White 
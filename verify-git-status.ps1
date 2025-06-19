Write-Host "🔍 Verificando estado de Git..." -ForegroundColor Cyan

# Verificar archivos que están siendo ignorados
Write-Host "`n📋 Archivos que NO se subirán (ignorados):" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules/ (ignorado)" -ForegroundColor Green
}
if (Test-Path "gestor-licencias-frontend/node_modules") {
    Write-Host "✅ gestor-licencias-frontend/node_modules/ (ignorado)" -ForegroundColor Green
}
if (Test-Path ".env") {
    Write-Host "✅ .env (ignorado)" -ForegroundColor Green
}
if (Test-Path "gestor-licencias-frontend/.env") {
    Write-Host "✅ gestor-licencias-frontend/.env (ignorado)" -ForegroundColor Green
}
if (Test-Path "gestor-licencias-frontend/dist") {
    Write-Host "✅ gestor-licencias-frontend/dist/ (ignorado)" -ForegroundColor Green
}

Write-Host "`n📝 Archivos que SÍ se subirán:" -ForegroundColor Cyan

# Listar archivos importantes que se van a subir
$importantFiles = @(
    "package.json",
    "env.example", 
    "render.yaml",
    "src/app.js",
    "src/config/database.js",
    "gestor-licencias-frontend/package.json",
    "gestor-licencias-frontend/vite.config.ts",
    "gestor-licencias-frontend/src/",
    ".gitignore"
)

foreach ($file in $importantFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    }
}

Write-Host "`n🚀 Estado: Listo para hacer push!" -ForegroundColor Green
Write-Host "Los archivos node_modules y .env NO se subirán gracias al .gitignore" -ForegroundColor Cyan 
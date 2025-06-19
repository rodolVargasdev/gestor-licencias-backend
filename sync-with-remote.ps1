Write-Host "🔄 Sincronizando con el repositorio remoto..." -ForegroundColor Cyan

Write-Host "`n📋 Opciones disponibles:" -ForegroundColor Yellow
Write-Host "1. Pull y merge (recomendado)" -ForegroundColor White
Write-Host "2. Force push (cuidado: sobrescribe el remoto)" -ForegroundColor Red
Write-Host "3. Ver estado actual" -ForegroundColor White

Write-Host "`n💡 Recomendación: Opción 1 - Pull y merge" -ForegroundColor Green
Write-Host "Esto descargará los cambios del remoto y los combinará con tus cambios locales." -ForegroundColor Cyan

Write-Host "`n🚀 Ejecutando git pull..." -ForegroundColor Yellow

try {
    # Intentar pull con --allow-unrelated-histories
    git pull origin main --allow-unrelated-histories
    
    Write-Host "`n✅ Pull exitoso!" -ForegroundColor Green
    Write-Host "Ahora puedes hacer push:" -ForegroundColor Cyan
    Write-Host "   git push origin main" -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Error en el pull. Posibles opciones:" -ForegroundColor Red
    Write-Host "1. Si hay conflictos, resuélvelos manualmente" -ForegroundColor Yellow
    Write-Host "2. Si quieres sobrescribir el remoto: git push --force origin main" -ForegroundColor Red
    Write-Host "3. Ver estado: git status" -ForegroundColor White
}

Write-Host "`n📊 Estado actual:" -ForegroundColor Cyan
git status 
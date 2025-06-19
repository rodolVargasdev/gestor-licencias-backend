# 🚀 Guía Completa de Despliegue a Producción

Esta guía te ayudará a desplegar tu proyecto de Gestor de Licencias en un entorno de producción profesional.

## 📋 Opciones de Despliegue

### 1. **VPS/Servidor Dedicado** (Recomendado)
- **Ventajas**: Control total, costo efectivo, escalable
- **Proveedores**: DigitalOcean, AWS EC2, Google Cloud, Azure, Linode
- **Costo**: $5-20/mes

### 2. **Plataformas Cloud**
- **Heroku**: Fácil de usar, pero más costoso
- **Railway**: Alternativa moderna a Heroku
- **Render**: Buena opción gratuita
- **Vercel**: Excelente para frontend

### 3. **Servicios Gestionados**
- **AWS ECS/Fargate**: Escalable pero complejo
- **Google Cloud Run**: Serverless, fácil de usar
- **Azure Container Instances**: Similar a Cloud Run

## 🏗️ Despliegue en VPS (Opción Recomendada)

### Paso 1: Preparar el Servidor

#### 1.1 Elegir un VPS
Recomendaciones:
- **DigitalOcean**: Droplet $5/mes (1GB RAM, 1 CPU)
- **Linode**: Nanode $5/mes (1GB RAM, 1 CPU)
- **Vultr**: Cloud Compute $5/mes (1GB RAM, 1 CPU)

#### 1.2 Configurar el Servidor
```bash
# Conectar al servidor
ssh root@tu-servidor.com

# Actualizar el sistema
apt update && apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Crear usuario no-root
adduser gestor
usermod -aG docker gestor
```

### Paso 2: Preparar el Proyecto Localmente

#### 2.1 Ejecutar el Script de Producción
```bash
# En Windows (PowerShell)
.\deploy-production.ps1 "tu-servidor.com" "tu-dominio.com"

# En Linux/Mac
./deploy-production.sh "tu-servidor.com" "tu-dominio.com"
```

#### 2.2 Verificar Archivos Creados
- ✅ `docker-compose.prod.yml`
- ✅ `.env.production`
- ✅ `nginx/nginx.conf`
- ✅ `nginx/ssl/` (directorio)
- ✅ `nginx/logs/` (directorio)

### Paso 3: Subir el Proyecto al Servidor

#### 3.1 Usando Git (Recomendado)
```bash
# En tu servidor
git clone https://github.com/TU_USUARIO/gestor-licencias-api.git
cd gestor-licencias-api

# Copiar archivos de configuración
cp docker-compose.prod.yml docker-compose.yml
cp .env.production .env
```

#### 3.2 Usando SCP/SFTP
```bash
# Desde tu máquina local
scp -r ./* root@tu-servidor.com:/root/gestor-licencias/
```

### Paso 4: Configurar Dominio y SSL

#### 4.1 Configurar DNS
En tu proveedor de dominio, apunta tu dominio al IP del servidor:
```
A    tu-dominio.com    ->    IP_DEL_SERVIDOR
A    www.tu-dominio.com    ->    IP_DEL_SERVIDOR
```

#### 4.2 Instalar Certbot (Let's Encrypt)
```bash
# En el servidor
apt install certbot -y

# Obtener certificado SSL
certbot certonly --standalone -d tu-dominio.com

# Copiar certificados
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/
```

### Paso 5: Desplegar la Aplicación

#### 5.1 Ejecutar Docker Compose
```bash
# En el servidor
docker-compose -f docker-compose.prod.yml up -d

# Verificar que todo esté funcionando
docker-compose ps
docker-compose logs -f
```

#### 5.2 Verificar el Despliegue
```bash
# Verificar que los servicios estén corriendo
curl https://tu-dominio.com/api/health

# Verificar logs
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx
```

## 🔧 Configuración de Seguridad

### Firewall (UFW)
```bash
# Instalar UFW
apt install ufw -y

# Configurar reglas
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80
ufw allow 443

# Activar firewall
ufw enable
```

### Actualizaciones Automáticas
```bash
# Instalar unattended-upgrades
apt install unattended-upgrades -y

# Configurar
dpkg-reconfigure -plow unattended-upgrades
```

### Monitoreo
```bash
# Instalar herramientas de monitoreo
apt install htop iotop nethogs -y

# Verificar uso de recursos
htop
df -h
free -h
```

## 📊 Monitoreo y Mantenimiento

### Logs
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Ver logs específicos
docker-compose logs backend
docker-compose logs frontend
docker-compose logs nginx

# Ver logs del sistema
journalctl -u docker
```

### Backups
```bash
# Crear script de backup
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Backup de la base de datos
docker-compose exec -T postgres pg_dump -U gestor_licencias gestor_licencias_prod > $BACKUP_DIR/db_backup_$DATE.sql

# Backup de archivos
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz uploads/ logs/

# Mantener solo los últimos 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Agregar a crontab (backup diario a las 2 AM)
echo "0 2 * * * /root/gestor-licencias/backup.sh" | crontab -
```

### Actualizaciones
```bash
# Script de actualización
cat > update.sh << 'EOF'
#!/bin/bash
cd /root/gestor-licencias

# Hacer backup antes de actualizar
./backup.sh

# Obtener cambios del repositorio
git pull origin main

# Reconstruir y reiniciar
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

echo "Actualización completada"
EOF

chmod +x update.sh
```

## 🚨 Solución de Problemas

### Problemas Comunes

#### 1. La aplicación no inicia
```bash
# Verificar logs
docker-compose logs

# Verificar variables de entorno
cat .env

# Verificar puertos
netstat -tulpn | grep :80
netstat -tulpn | grep :443
```

#### 2. Error de SSL
```bash
# Renovar certificado SSL
certbot renew

# Copiar nuevos certificados
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/

# Reiniciar nginx
docker-compose restart nginx
```

#### 3. Problemas de base de datos
```bash
# Verificar conexión a la base de datos
docker-compose exec postgres psql -U gestor_licencias -d gestor_licencias_prod

# Verificar logs de PostgreSQL
docker-compose logs postgres
```

#### 4. Problemas de memoria
```bash
# Verificar uso de memoria
free -h

# Limpiar Docker
docker system prune -a

# Reiniciar servicios
docker-compose restart
```

## 📈 Escalabilidad

### Para más tráfico
1. **Aumentar recursos del VPS**
2. **Configurar balanceador de carga**
3. **Usar CDN para archivos estáticos**
4. **Implementar caché Redis**

### Para alta disponibilidad
1. **Múltiples servidores**
2. **Base de datos replicada**
3. **Load balancer**
4. **Monitoreo automático**

## 🔍 Verificación Final

Después del despliegue, verifica:

- ✅ [ ] La aplicación es accesible en https://tu-dominio.com
- ✅ [ ] El certificado SSL está funcionando
- ✅ [ ] Los logs no muestran errores
- ✅ [ ] La base de datos está funcionando
- ✅ [ ] Los backups se están ejecutando
- ✅ [ ] El firewall está configurado
- ✅ [ ] Las actualizaciones automáticas están activas

## 📞 Soporte

Si tienes problemas:

1. **Revisa los logs**: `docker-compose logs -f`
2. **Verifica la conectividad**: `curl -I https://tu-dominio.com`
3. **Comprueba los recursos**: `htop`, `df -h`
4. **Revisa el firewall**: `ufw status`

---

¡Felicidades! 🎉 Tu aplicación está ahora en producción y lista para ser usada por usuarios reales. 
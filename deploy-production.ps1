# Script de Despliegue a Producción - Gestor de Licencias (PowerShell)
# Uso: .\deploy-production.ps1 [VPS_IP] [DOMAIN]

param(
    [string]$VPS_IP = "tu-servidor.com",
    [string]$DOMAIN = "tu-dominio.com"
)

Write-Host "🚀 Desplegando Gestor de Licencias a PRODUCCIÓN" -ForegroundColor Green
Write-Host "📍 Servidor: $VPS_IP" -ForegroundColor Cyan
Write-Host "🌐 Dominio: $DOMAIN" -ForegroundColor Cyan

# Función para imprimir mensajes
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Verificar prerrequisitos
Write-Info "Verificando prerrequisitos..."

try {
    docker --version | Out-Null
} catch {
    Write-Error "Docker no está instalado. Instala Docker Desktop primero."
    exit 1
}

try {
    docker-compose --version | Out-Null
} catch {
    Write-Error "Docker Compose no está instalado."
    exit 1
}

# Generar contraseñas seguras
Write-Info "Generando contraseñas seguras..."
$DB_PASSWORD = -join ((33..126) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$JWT_SECRET = -join ((33..126) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# Crear archivo de configuración de producción
Write-Info "Configurando variables de entorno para producción..."

$envContent = @"
# Configuración de Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_USER=gestor_licencias
DB_PASSWORD=$DB_PASSWORD
DB_NAME=gestor_licencias_prod

# Configuración del Servidor
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://$DOMAIN

# Logs
LOG_LEVEL=info

# SSL/TLS
SSL_ENABLED=true
SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN/privkey.pem
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8

# Crear docker-compose para producción
Write-Info "Creando docker-compose para producción..."

$dockerComposeContent = @"
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:13-alpine
    container_name: gestor_licencias_db_prod
    environment:
      POSTGRES_DB: gestor_licencias_prod
      POSTGRES_USER: gestor_licencias
      POSTGRES_PASSWORD: $DB_PASSWORD
    volumes:
      - postgres_data_prod:/var/lib/postgresql/data
      - ./backup.sql:/docker-entrypoint-initdb.d/backup.sql
    networks:
      - gestor_licencias_network_prod
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gestor_licencias"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Backend API
  backend:
    build: .
    container_name: gestor_licencias_backend_prod
    env_file:
      - .env.production
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - gestor_licencias_network_prod
    restart: unless-stopped
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3001/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend con Nginx
  frontend:
    build: ./gestor-licencias-frontend
    container_name: gestor_licencias_frontend_prod
    environment:
      VITE_API_URL: https://$DOMAIN/api
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - gestor_licencias_network_prod
    restart: unless-stopped
    volumes:
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: gestor_licencias_nginx_prod
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - frontend
      - backend
    networks:
      - gestor_licencias_network_prod
    restart: unless-stopped

volumes:
  postgres_data_prod:

networks:
  gestor_licencias_network_prod:
    driver: bridge
"@

$dockerComposeContent | Out-File -FilePath "docker-compose.prod.yml" -Encoding UTF8

# Crear configuración de Nginx para producción
Write-Info "Configurando Nginx para producción..."

# Crear directorios
if (-not (Test-Path "nginx")) {
    New-Item -ItemType Directory -Path "nginx"
}
if (-not (Test-Path "nginx/ssl")) {
    New-Item -ItemType Directory -Path "nginx/ssl"
}
if (-not (Test-Path "nginx/logs")) {
    New-Item -ItemType Directory -Path "nginx/logs"
}

$nginxConfig = @"
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # Configuración de logs
    log_format main '\$remote_addr - \$remote_user [\$time_local] "\$request" '
                    '\$status \$body_bytes_sent "\$http_referer" '
                    '"\$http_user_agent" "\$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log;

    # Configuración de gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

    # Upstream servers
    upstream backend {
        server backend:3001;
    }

    upstream frontend {
        server frontend:80;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name $DOMAIN;
        return 301 https://\$server_name\$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        # SSL configuration
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' https: data: blob: 'unsafe-inline'" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API routes
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend/api/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        # Frontend routes
        location / {
            proxy_pass http://frontend/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }

        # Static files
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://frontend;
        }
    }
}
"@

$nginxConfig | Out-File -FilePath "nginx/nginx.conf" -Encoding UTF8

Write-Success "Configuración de producción creada exitosamente!"

Write-Info "Para completar el despliegue:"
Write-Info "1. Copia estos archivos a tu servidor:"
Write-Info "   - docker-compose.prod.yml"
Write-Info "   - .env.production"
Write-Info "   - nginx/nginx.conf"
Write-Info "   - Todo el código del proyecto"

Write-Info "2. En tu servidor, ejecuta:"
Write-Info "   docker-compose -f docker-compose.prod.yml up -d"

Write-Info "3. Configura SSL con Let's Encrypt:"
Write-Info "   certbot certonly --webroot -w /var/www/html -d $DOMAIN"

Write-Info "4. Copia los certificados SSL a nginx/ssl/"

Write-Success "¡Configuración de producción lista!" 
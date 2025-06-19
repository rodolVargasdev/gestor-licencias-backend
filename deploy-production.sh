#!/bin/bash

# Script de Despliegue a Producción - Gestor de Licencias
# Uso: ./deploy-production.sh [VPS_IP] [DOMAIN]

set -e

VPS_IP=${1:-"tu-servidor.com"}
DOMAIN=${2:-"tu-dominio.com"}

echo "🚀 Desplegando Gestor de Licencias a PRODUCCIÓN"
echo "📍 Servidor: $VPS_IP"
echo "🌐 Dominio: $DOMAIN"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar prerrequisitos
print_info "Verificando prerrequisitos..."

if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
    exit 1
fi

# Crear archivo de configuración de producción
print_info "Configurando variables de entorno para producción..."

cat > .env.production << EOF
# Configuración de Base de Datos
DB_HOST=postgres
DB_PORT=5432
DB_USER=gestor_licencias
DB_PASSWORD=\$(openssl rand -base64 32)
DB_NAME=gestor_licencias_prod

# Configuración del Servidor
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=\$(openssl rand -base64 64)
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://$DOMAIN

# Logs
LOG_LEVEL=info

# SSL/TLS
SSL_ENABLED=true
SSL_CERT_PATH=/etc/letsencrypt/live/$DOMAIN/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/$DOMAIN/privkey.pem
EOF

# Crear docker-compose para producción
print_info "Creando docker-compose para producción..."

cat > docker-compose.prod.yml << EOF
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:13-alpine
    container_name: gestor_licencias_db_prod
    environment:
      POSTGRES_DB: gestor_licencias_prod
      POSTGRES_USER: gestor_licencias
      POSTGRES_PASSWORD: \$(grep DB_PASSWORD .env.production | cut -d '=' -f2)
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
EOF

# Crear configuración de Nginx para producción
print_info "Configurando Nginx para producción..."

mkdir -p nginx/ssl nginx/logs

cat > nginx/nginx.conf << EOF
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
EOF

print_success "Configuración de producción creada exitosamente!"

print_info "Para completar el despliegue:"
print_info "1. Copia estos archivos a tu servidor:"
print_info "   - docker-compose.prod.yml"
print_info "   - .env.production"
print_info "   - nginx/nginx.conf"
print_info "   - Todo el código del proyecto"

print_info "2. En tu servidor, ejecuta:"
print_info "   docker-compose -f docker-compose.prod.yml up -d"

print_info "3. Configura SSL con Let's Encrypt:"
print_info "   certbot certonly --webroot -w /var/www/html -d $DOMAIN"

print_info "4. Copia los certificados SSL a nginx/ssl/"

print_success "¡Configuración de producción lista!" 
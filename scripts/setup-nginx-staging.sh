#!/bin/bash

# Script para configurar Nginx para ambiente de staging
# Usage: ./setup-nginx-staging.sh

set -e

echo "🔧 Configurando Nginx para Staging..."

# Criar configuração para API staging
sudo tee /etc/nginx/sites-available/api-dev.arquivamaispenedo.online > /dev/null << 'EOF'
server {
    listen 80;
    server_name api-dev.arquivamaispenedo.online;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' 'https://dev.arquivamaispenedo.online' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type' always;
        add_header 'Access-Control-Allow-Credentials' 'true' always;
        
        if ($request_method = 'OPTIONS') {
            return 204;
        }
    }
}
EOF

# Criar configuração para Frontend staging
sudo tee /etc/nginx/sites-available/dev.arquivamaispenedo.online > /dev/null << 'EOF'
server {
    listen 80;
    server_name dev.arquivamaispenedo.online;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

# Habilitar sites
sudo ln -sf /etc/nginx/sites-available/api-dev.arquivamaispenedo.online /etc/nginx/sites-enabled/
sudo ln -sf /etc/nginx/sites-available/dev.arquivamaispenedo.online /etc/nginx/sites-enabled/

# Testar configuração
echo "🧪 Testando configuração do Nginx..."
sudo nginx -t

# Recarregar Nginx
echo "🔄 Recarregando Nginx..."
sudo systemctl reload nginx

echo ""
echo "✅ Nginx configurado para staging!"
echo ""
echo "📝 Próximos passos:"
echo "   1. Adicionar registros DNS:"
echo "      - api-dev.arquivamaispenedo.online → 67.205.138.215"
echo "      - dev.arquivamaispenedo.online → 67.205.138.215"
echo ""
echo "   2. Instalar certificados SSL:"
echo "      sudo certbot --nginx -d api-dev.arquivamaispenedo.online -d dev.arquivamaispenedo.online"
echo ""

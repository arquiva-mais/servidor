#!/bin/bash

echo "🌐 Configurando Nginx para arquivamaispenedo.online..."

# Instalar Nginx
apt install -y nginx

# Criar configuração do Nginx
cat > /etc/nginx/sites-available/arquivamais << 'NGINX_EOF'
# API Backend
server {
    listen 80;
    server_name api.arquivamaispenedo.online;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Frontend
server {
    listen 80;
    server_name arquivamaispenedo.online www.arquivamaispenedo.online;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINX_EOF

# Ativar site
ln -sf /etc/nginx/sites-available/arquivamais /etc/nginx/sites-enabled/

# Remover site padrão
rm -f /etc/nginx/sites-enabled/default

# Testar configuração
nginx -t

# Recarregar Nginx
systemctl reload nginx

echo "✅ Nginx configurado!"
echo ""
echo "📝 Configure seu DNS:"
echo "  Tipo A: arquivamaispenedo.online → 67.205.138.215"
echo "  Tipo A: www.arquivamaispenedo.online → 67.205.138.215"
echo "  Tipo A: api.arquivamaispenedo.online → 67.205.138.215"

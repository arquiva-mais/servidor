#!/bin/bash

echo "🔒 Configurando SSL com Certbot..."

# Instalar Certbot
apt install -y certbot python3-certbot-nginx

# Gerar certificados SSL
certbot --nginx \
  -d arquivamaispenedo.online \
  -d www.arquivamaispenedo.online \
  -d api.arquivamaispenedo.online \
  --non-interactive \
  --agree-tos \
  --email admin@arquivamaispenedo.online \
  --redirect

echo "✅ SSL configurado!"
echo ""
echo "🌐 URLs com HTTPS:"
echo "  Frontend: https://arquivamaispenedo.online"
echo "  API: https://api.arquivamaispenedo.online"

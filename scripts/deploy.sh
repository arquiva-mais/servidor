#!/bin/bash

echo "🚀 Iniciando deploy do ArquivaMais..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se .env.production existe
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ Arquivo .env.production não encontrado!${NC}"
    echo "Copie .env.example para .env.production e configure as variáveis."
    exit 1
fi

# Usar .env.production
cp .env.production .env

echo -e "${YELLOW}📦 Parando containers antigos...${NC}"
docker-compose down

echo -e "${YELLOW}🔨 Fazendo build das imagens...${NC}"
docker-compose build --no-cache

echo -e "${YELLOW}🚢 Subindo containers...${NC}"
docker-compose up -d

echo -e "${YELLOW}⏳ Aguardando PostgreSQL inicializar...${NC}"
sleep 10

echo -e "${YELLOW}📊 Rodando migrations...${NC}"
docker-compose exec app npm run migrate

echo -e "${YELLOW}🌱 Rodando seeds (se necessário)...${NC}"
docker-compose exec app npm run seed || echo "Seeds já executados ou não necessários"

echo -e "${YELLOW}📋 Status dos containers:${NC}"
docker-compose ps

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo ""
echo "🌐 API disponível em: http://localhost:3001"
echo "📊 Logs: docker-compose logs -f app"

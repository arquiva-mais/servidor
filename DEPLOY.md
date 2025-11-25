# 🚀 Deploy do Backend - ArquivaMais

## 📋 Pré-requisitos na VPS

- Docker
- Docker Compose
- Git

## 🔧 Primeira Instalação na VPS

### 1. Instalar Docker

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo apt install docker-compose -y

# Verificar instalação
docker --version
docker-compose --version
```

### 2. Clonar Repositório

```bash
cd /opt
git clone https://github.com/arquiva-mais/servidor.git
cd servidor
```

### 3. Configurar Variáveis de Ambiente

```bash
# Copiar exemplo
cp .env.example .env.production

# Editar com suas configurações
nano .env.production
```

**Configurações importantes:**

```env
DB_NAME=arquivamais_db
DB_USER=arquiva
DB_PASS=SuaSenhaForteAqui123!
DB_HOST=postgres
DB_PORT=5432

PORT=3001
NODE_ENV=production

# GERE NOVOS SECRETS!
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

FRONTEND_URL=http://67.205.138.215:3000
```

### 4. Executar Deploy

```bash
# Dar permissão aos scripts
chmod +x scripts/*.sh

# Fazer deploy
./scripts/deploy.sh
```

## 📊 Comandos Úteis

```bash
# Ver status
./scripts/status.sh
docker-compose ps
docker-compose logs -f app

# Fazer backup
./scripts/backup.sh

# Restaurar backup
./scripts/restore.sh backups/backup_20250125_120000.sql.gz

# Atualizar código
git pull origin master
./scripts/deploy.sh

# Reiniciar serviços
docker-compose restart app

# Ver logs em tempo real
docker-compose logs -f

# Acessar container
docker-compose exec app sh

# Rodar migrations manualmente
docker-compose exec app npm run migrate

# Rodar seeds
docker-compose exec app npm run seed
```

## 🔄 Processo de Atualização

```bash
# 1. Fazer backup
./scripts/backup.sh

# 2. Puxar alterações
git pull origin master

# 3. Rebuild e restart
docker-compose down
docker-compose up -d --build

# 4. Rodar migrations (se houver novas)
docker-compose exec app npm run migrate
```

## 🐛 Troubleshooting

### Container não inicia

```bash
# Ver logs
docker-compose logs app

# Verificar variáveis de ambiente
docker-compose exec app env | grep DB
```

### Erro de conexão com banco

```bash
# Verificar se postgres está rodando
docker-compose ps postgres

# Ver logs do postgres
docker-compose logs postgres

# Testar conexão
docker-compose exec postgres psql -U arquiva -d arquivamais_db
```

### Espaço em disco

```bash
# Ver uso
df -h

# Limpar volumes não usados
docker system prune -a --volumes
```

## 📁 Estrutura de Arquivos

```
servidor/
├── src/                    # Código fonte
├── scripts/                # Scripts de deploy
│   ├── deploy.sh          # Deploy completo
│   ├── backup.sh          # Backup do banco
│   ├── restore.sh         # Restaurar backup
│   └── status.sh          # Ver status
├── .env.production        # Variáveis de produção
├── .env.example           # Exemplo de configuração
├── Dockerfile             # Build da imagem
└── docker-compose.yml     # Orquestração
```

## 🔐 Segurança

- ✅ Nunca commitar arquivos `.env`
- ✅ Usar senhas fortes
- ✅ Gerar novos JWT secrets
- ✅ Configurar CORS corretamente
- ✅ Fazer backups regulares
- ✅ Usar HTTPS em produção

## 🌐 URLs

- **API**: http://67.205.138.215:3001
- **Health Check**: http://67.205.138.215:3001/

## 📝 Notas

- O PostgreSQL roda na porta interna 5432 (não exposta)
- PgAdmin foi removido em produção por segurança
- Backups são mantidos por 7 dias automaticamente
- Logs são gerenciados pelo Docker

#!/bin/bash

if [ -z "$1" ]; then
    echo "❌ Uso: ./restore.sh caminho/do/backup.sql.gz"
    exit 1
fi

BACKUP_FILE=$1

echo "🔄 Restaurando backup de $BACKUP_FILE..."

# Descomprimir se necessário
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE > /tmp/restore.sql
    BACKUP_FILE=/tmp/restore.sql
fi

# Parar aplicação
echo "⏸️  Parando aplicação..."
docker-compose stop app

# Recriar banco
echo "🗑️  Recriando banco de dados..."
docker-compose exec postgres psql -U arquiva -c "DROP DATABASE IF EXISTS arquivamais_db;"
docker-compose exec postgres psql -U arquiva -c "CREATE DATABASE arquivamais_db;"

# Restaurar
echo "📥 Restaurando dados..."
docker-compose exec -T postgres psql -U arquiva -d arquivamais_db < $BACKUP_FILE

# Reiniciar aplicação
echo "▶️  Reiniciando aplicação..."
docker-compose start app

echo "✅ Restore concluído!"

# Limpar arquivo temporário
rm -f /tmp/restore.sql

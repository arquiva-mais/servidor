#!/bin/bash

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

mkdir -p $BACKUP_DIR

echo "🔄 Criando backup do banco de dados..."

docker-compose exec -T postgres pg_dump -U arquiva arquivamais_db > $BACKUP_FILE

if [ $? -eq 0 ]; then
    gzip $BACKUP_FILE
    echo "✅ Backup criado: ${BACKUP_FILE}.gz"
    
    # Manter apenas últimos 7 backups
    find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
    echo "🧹 Backups antigos removidos (mantidos últimos 7 dias)"
else
    echo "❌ Erro ao criar backup!"
    exit 1
fi

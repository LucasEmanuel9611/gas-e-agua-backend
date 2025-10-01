#!/bin/bash

# Script de backup do banco de dados antes de migrations
# Uso: ./scripts/backup-db.sh [dev|prd]

set -e

ENV=${1:-dev}
BACKUP_DIR="/home/deploy/backups/mysql"
DATE=$(date +%Y%m%d-%H%M%S)

if [ "$ENV" = "dev" ]; then
  CONTAINER="gas-e-agua-mysql-dev"
  ENV_FILE="/home/deploy/gas-e-agua-backend/.env.dev"
  BACKUP_FILE="${BACKUP_DIR}/dev-backup-${DATE}.sql"
elif [ "$ENV" = "prd" ]; then
  CONTAINER="gas-e-agua-mysql"
  ENV_FILE="/home/deploy/gas-e-agua-backend/.env"
  BACKUP_FILE="${BACKUP_DIR}/prd-backup-${DATE}.sql"
else
  echo "Uso: $0 [dev|prd]"
  exit 1
fi

DATABASE=$(grep MYSQL_DATABASE "$ENV_FILE" | cut -d'=' -f2)
USER=$(grep MYSQL_USER "$ENV_FILE" | cut -d'=' -f2)
PASSWORD=$(grep MYSQL_ROOT_PASSWORD "$ENV_FILE" | cut -d'=' -f2)

mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup of $ENV database..."
docker exec "$CONTAINER" mysqldump -u"$USER" -p"$PASSWORD" "$DATABASE" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup created: $BACKUP_FILE"
  
  find "$BACKUP_DIR" -name "${ENV}-backup-*.sql" -mtime +7 -delete
  echo "🗑️ Old backups (>7 days) cleaned"
else
  echo "❌ Backup failed!"
  exit 1
fi


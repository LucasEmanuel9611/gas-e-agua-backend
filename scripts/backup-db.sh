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

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ Arquivo de ambiente não encontrado: $ENV_FILE"
  exit 1
fi

source "$ENV_FILE"

if [ -z "$MYSQL_DATABASE" ]; then
  echo "❌ MYSQL_DATABASE não encontrado no arquivo $ENV_FILE"
  exit 1
fi

if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
  echo "❌ MYSQL_ROOT_PASSWORD não encontrado no arquivo $ENV_FILE"
  exit 1
fi

if ! docker ps | grep -q "$CONTAINER"; then
  echo "❌ Container $CONTAINER não está em execução"
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup of $ENV database..."
echo "🔍 Container: $CONTAINER"
echo "🔍 Database: $MYSQL_DATABASE"
echo "🔍 User: root"
echo "🔍 Password length: ${#MYSQL_ROOT_PASSWORD} caracteres"

docker exec "$CONTAINER" mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup created: $BACKUP_FILE"
  
  find "$BACKUP_DIR" -name "${ENV}-backup-*.sql" -mtime +7 -delete
  echo "🗑️ Old backups (>7 days) cleaned"
else
  echo "❌ Backup failed!"
  exit 1
fi


#!/bin/bash

set -e

ENV=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_BASE_DIR="$(dirname "$PROJECT_DIR")/backups"
DATE=$(date +%Y%m%d-%H%M%S)

if [ "$ENV" = "dev" ]; then
  CONTAINER="gas-e-agua-mysql-dev"
  ENV_FILE="$PROJECT_DIR/.env.dev"
  BACKUP_DIR="$BACKUP_BASE_DIR/dev"
  BACKUP_FILE="${BACKUP_DIR}/backup-${DATE}.sql"
elif [ "$ENV" = "prd" ]; then
  CONTAINER="gas-e-agua-mysql"
  ENV_FILE="$PROJECT_DIR/.env"
  BACKUP_DIR="$BACKUP_BASE_DIR/prd"
  BACKUP_FILE="${BACKUP_DIR}/backup-${DATE}.sql"
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

echo "📁 Creating backup directory: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "❌ Falha ao criar diretório de backup: $BACKUP_DIR"
  exit 1
fi

echo "📦 Creating backup of $ENV database..."
echo "🔍 Container: $CONTAINER"
echo "🔍 Database: $MYSQL_DATABASE"
echo "🔍 Backup file: $BACKUP_FILE"

echo "🔌 Testing MySQL connection..."
unset MYSQL_USER
if ! docker exec "$CONTAINER" mysql --user=root --password="$MYSQL_ROOT_PASSWORD" -e "USE $MYSQL_DATABASE; SELECT 1;" > /dev/null 2>&1; then
  echo "❌ Falha ao conectar no banco $MYSQL_DATABASE"
  echo "💡 Verifique se o banco existe: docker exec $CONTAINER mysql -uroot -p'$MYSQL_ROOT_PASSWORD' -e 'SHOW DATABASES;'"
  exit 1
fi

echo "✅ Conexão com banco OK"
echo "📤 Executando backup..."

docker exec "$CONTAINER" mysqldump --user=root --password="$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" > "$BACKUP_FILE"

if [ $? -eq 0 ] && [ -f "$BACKUP_FILE" ] && [ -s "$BACKUP_FILE" ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup created: $BACKUP_FILE ($BACKUP_SIZE)"
  
  find "$BACKUP_DIR" -name "backup-*.sql" -mtime +7 -delete
  echo "🗑️ Old backups (>7 days) cleaned"
else
  echo "❌ Backup failed!"
  if [ ! -f "$BACKUP_FILE" ]; then
    echo "   Arquivo não foi criado: $BACKUP_FILE"
  elif [ ! -s "$BACKUP_FILE" ]; then
    echo "   Arquivo criado mas está vazio: $BACKUP_FILE"
  fi
  exit 1
fi


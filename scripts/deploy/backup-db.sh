#!/bin/bash

set -e

if [ "${GITHUB_ACTIONS}" = "true" ] || [ "${DEBUG}" = "1" ]; then
  set -x 
fi

ENV=${1:-dev}
SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
BACKUP_BASE_DIR="$(dirname "$PROJECT_DIR")/backups"
DATE=$(date +%Y%m%d-%H%M%S)

echo "🔍 Debug Info:"
echo "   SCRIPT_DIR: $SCRIPT_DIR"
echo "   PROJECT_DIR: $PROJECT_DIR"
echo "   ENV_FILE: será definido como $PROJECT_DIR/.env.$ENV ou $PROJECT_DIR/.env"
echo ""

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

if [ -n "${MYSQL_ROOT_PASSWORD:-}" ] && [ -n "${MYSQL_DATABASE:-}" ]; then
  echo "📄 Credenciais carregadas das variáveis de ambiente"
elif [ -f "$ENV_FILE" ]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  echo "📄 Credenciais carregadas de: $ENV_FILE"
else
  echo "❌ Arquivo de ambiente não encontrado: $ENV_FILE"
  echo "   E MYSQL_ROOT_PASSWORD/MYSQL_DATABASE também não estão definidos no ambiente"
  exit 1
fi

if [ -z "${MYSQL_DATABASE:-}" ]; then
  echo "❌ MYSQL_DATABASE não encontrado"
  exit 1
fi

if [ -z "${MYSQL_ROOT_PASSWORD:-}" ]; then
  echo "❌ MYSQL_ROOT_PASSWORD não encontrado"
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
  echo "✅ Backup created successfully!"
  echo "📁 File: $BACKUP_FILE"
  echo "📊 Size: $BACKUP_SIZE"
  
  find "$BACKUP_DIR" -name "backup-*.sql" -mtime +7 -delete
  echo "🗑️ Old backups (>7 days) cleaned"
  
  echo ""
  echo "BACKUP_SUCCESS=true"
  echo "BACKUP_FILE_PATH=$BACKUP_FILE"
  
  exit 0
else
  echo "❌ Backup failed!"
  if [ ! -f "$BACKUP_FILE" ]; then
    echo "   Arquivo não foi criado: $BACKUP_FILE"
  elif [ ! -s "$BACKUP_FILE" ]; then
    echo "   Arquivo criado mas está vazio: $BACKUP_FILE"
  fi
  
  echo ""
  echo "BACKUP_SUCCESS=false"
  
  exit 1
fi


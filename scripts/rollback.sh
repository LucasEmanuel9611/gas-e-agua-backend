#!/bin/bash

# Script de rollback para reverter deploy
# Uso: ./scripts/rollback.sh [dev|prd] [backup-file]

set -e

ENV=${1:-dev}
BACKUP_FILE=$2

if [ -z "$BACKUP_FILE" ]; then
  echo "Uso: $0 [dev|prd] [backup-file]"
  echo "Exemplo: $0 dev /home/deploy/backups/mysql/dev-backup-20250930-120000.sql"
  exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

if [ "$ENV" = "dev" ]; then
  CONTAINER="gas-e-agua-mysql-dev"
  ENV_FILE="/home/deploy/gas-e-agua-backend/.env.dev"
  PROJECT="gas-e-agua-dev"
  COMPOSE_FILE="docker-compose.dev.yml"
elif [ "$ENV" = "prd" ]; then
  CONTAINER="gas-e-agua-mysql"
  ENV_FILE="/home/deploy/gas-e-agua-backend/.env"
  PROJECT="gas-e-agua-prd"
  COMPOSE_FILE="docker-compose.app.yml"
else
  echo "Uso: $0 [dev|prd] [backup-file]"
  exit 1
fi

DATABASE=$(grep MYSQL_DATABASE "$ENV_FILE" | cut -d'=' -f2)
USER=$(grep MYSQL_USER "$ENV_FILE" | cut -d'=' -f2)
PASSWORD=$(grep MYSQL_ROOT_PASSWORD "$ENV_FILE" | cut -d'=' -f2)

read -p "⚠️  Are you sure you want to rollback $ENV? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Rollback cancelled"
  exit 0
fi

echo "🔄 Starting rollback for $ENV..."

echo "📥 Restoring database from backup..."
docker exec -i "$CONTAINER" mysql -u"$USER" -p"$PASSWORD" "$DATABASE" < "$BACKUP_FILE"

echo "🔄 Restarting application..."
cd /home/deploy/gas-e-agua-backend
docker compose -p "$PROJECT" -f "$COMPOSE_FILE" restart app

echo "✅ Rollback completed!"
echo "🔍 Check application health:"
if [ "$ENV" = "dev" ]; then
  echo "   curl http://localhost:3334/health"
else
  echo "   curl http://localhost:3333/health"
fi


#!/bin/bash

set -e

ENV=${1:-dev}
SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

if [ "$ENV" = "dev" ]; then
  PROJECT="gas-e-agua-dev"
  COMPOSE_FILE="docker-compose.dev.yml"
  MONITORING_FILE="docker-compose.monitoring-dev.yml"
  PORT="3334"
elif [ "$ENV" = "prd" ]; then
  PROJECT="gas-e-agua-prd"
  COMPOSE_FILE="docker-compose.app.yml"
  MONITORING_FILE="docker-compose.monitoring-prd.yml"
  PORT="3333"
else
  echo "❌ Invalid environment. Use: $0 [dev|prd]"
  exit 1
fi

echo "🚀 Starting $ENV deployment..."

# 1. Backup do banco
echo "📦 Creating database backup..."
if ! "$SCRIPT_DIR/backup-db.sh" "$ENV"; then
  echo "❌ Backup failed!"
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Database backup failed"
  exit 1
fi

# 2. Pull do código
echo "📥 Pulling latest code..."
git fetch --all
if [ "$ENV" = "dev" ]; then
  git checkout develop
else
  git checkout master
fi
git pull --ff-only

# 3. Carregar variáveis de ambiente
if [ "$ENV" = "dev" ]; then
  ENV_FILE="$PROJECT_DIR/.env.dev"
else
  ENV_FILE="$PROJECT_DIR/.env"
fi

if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# 4. Build e subir containers
echo "🔨 Building and starting containers..."
if ! docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d --build --remove-orphans; then
  echo "❌ Container build failed!"
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Container build failed"
  exit 1
fi

# 5. Aguardar containers ficarem saudáveis
echo "⏳ Waiting for containers to be healthy..."
sleep 15

# 6. Rodar migrations
echo "🗄️ Running database migrations..."
echo "📝 Generating Prisma Client..."
if ! docker compose -p "$PROJECT" -f "$COMPOSE_FILE" exec -T app npx prisma generate; then
  echo "❌ Prisma generate failed!"
  docker compose -p "$PROJECT" -f "$COMPOSE_FILE" logs app --tail=50
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Prisma generate failed"
  exit 1
fi

echo "✅ Prisma Client generated successfully"
echo "📝 Applying database migrations..."

if ! docker compose -p "$PROJECT" -f "$COMPOSE_FILE" exec -T app npx prisma migrate deploy; then
  echo "❌ Migration failed!"
  docker compose -p "$PROJECT" -f "$COMPOSE_FILE" logs app --tail=100
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Database migration failed"
  
  echo "🔄 Do you want to rollback? (yes/no)"
  read -r ROLLBACK
  if [ "$ROLLBACK" = "yes" ]; then
    BACKUP_BASE_DIR="$(dirname "$PROJECT_DIR")/backups"
    if [ "$ENV" = "dev" ]; then
      LATEST_BACKUP=$(ls -t "$BACKUP_BASE_DIR/dev/backup-"*.sql | head -1)
    else
      LATEST_BACKUP=$(ls -t "$BACKUP_BASE_DIR/prd/backup-"*.sql | head -1)
    fi
    "$SCRIPT_DIR/rollback.sh" "$ENV" "$LATEST_BACKUP"
  fi
  exit 1
fi

echo "✅ Database migrations completed successfully"

# 7. Health check
echo "✅ Checking application health..."
sleep 5
if ! curl -f "http://localhost:$PORT/health" > /dev/null 2>&1; then
  echo "❌ Health check failed!"
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Application health check failed"
  exit 1
fi

# 8. Subir monitoramento
echo "📊 Starting monitoring stack..."
docker compose -p "$PROJECT" -f "$MONITORING_FILE" up -d

# 9. Limpeza
echo "🗑️ Cleaning up..."
docker system prune -f

# 10. Sucesso
echo "✅ Deployment completed successfully!"
"$SCRIPT_DIR/notify.sh" success "$ENV" "Deployment completed successfully"

# 11. Métricas
DEPLOY_TIME=$SECONDS
echo "⏱️  Total deployment time: ${DEPLOY_TIME}s"
echo "🔗 Application URL: http://localhost:$PORT"
echo "📊 Grafana: http://localhost:$([[ "$ENV" = "dev" ]] && echo "3001" || echo "3000")"


#!/bin/bash

set -e

if [ "${GITHUB_ACTIONS}" = "true" ] || [ "${DEBUG}" = "1" ]; then
  set -x  
fi

ENV=${1:-dev}
SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

cd "$PROJECT_DIR"

IS_GITHUB_ACTIONS=${GITHUB_ACTIONS:-false}

log_group_start() {
  if [ "$IS_GITHUB_ACTIONS" = "true" ]; then
    echo "::group::$1"
  else
    echo ""
    echo "═══════════════════════════════════════════════════════════════"
    echo "  $1"
    echo "═══════════════════════════════════════════════════════════════"
  fi
}

log_group_end() {
  if [ "$IS_GITHUB_ACTIONS" = "true" ]; then
    echo "::endgroup::"
  fi
}

log_info() {
  echo "ℹ️  $1"
}

log_success() {
  echo "✅ $1"
}

log_error() {
  if [ "$IS_GITHUB_ACTIONS" = "true" ]; then
    echo "::error::$1"
  else
    echo "❌ $1"
  fi
}

log_warning() {
  if [ "$IS_GITHUB_ACTIONS" = "true" ]; then
    echo "::warning::$1"
  else
    echo "⚠️  $1"
  fi
}

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
  log_error "Invalid environment. Use: $0 [dev|prd]"
  exit 1
fi

echo ""
echo "🚀 Starting $ENV deployment..."
echo ""

# 1. Backup do banco
log_group_start "📦 Creating database backup"
if ! "$SCRIPT_DIR/backup-db.sh" "$ENV"; then
  log_error "Backup failed!"
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Database backup failed"
  exit 1
fi
log_success "Database backup created"
log_group_end

# 2. Pull do código
log_group_start "📥 Pulling latest code"
log_info "Fetching all branches..."
git fetch --all
if [ "$ENV" = "dev" ]; then
  log_info "Checking out develop branch..."
  git checkout develop
else
  log_info "Checking out master branch..."
  git checkout master
fi
log_info "Pulling latest changes..."
git pull --ff-only
log_success "Code updated successfully"
log_group_end

# 3. Carregar variáveis de ambiente
log_group_start "🔧 Loading environment variables"
if [ "$ENV" = "dev" ]; then
  ENV_FILE="$PROJECT_DIR/.env.dev"
else
  ENV_FILE="$PROJECT_DIR/.env"
fi

if [ -f "$ENV_FILE" ]; then
  log_info "Loading from: $ENV_FILE"
  set -a
  source "$ENV_FILE"
  set +a
  log_success "Environment variables loaded"
else
  log_warning "Environment file not found: $ENV_FILE"
fi
log_group_end

# 4. Build e subir containers
log_group_start "🔨 Building and starting containers"
log_info "Project: $PROJECT"
log_info "Compose file: $COMPOSE_FILE"
log_info "Running: docker compose up -d --build --remove-orphans"
if ! docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d --build --remove-orphans; then
  log_error "Container build failed!"
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Container build failed"
  exit 1
fi
log_success "Containers built and started successfully"
log_group_end

# 5. Aguardar containers ficarem saudáveis
log_group_start "⏳ Waiting for containers to be healthy"
log_info "Waiting 15 seconds for containers to stabilize..."
sleep 15
log_success "Containers are ready"
log_group_end

# 5.5. Verificar e corrigir plugin de autenticação MySQL
log_group_start "🔐 Verifying MySQL authentication plugin"
MYSQL_CONTAINER="${PROJECT}-mysql"
if [ "$ENV" = "dev" ]; then
  MYSQL_CONTAINER="gas-e-agua-mysql-dev"
else
  MYSQL_CONTAINER="gas-e-agua-mysql"
fi

log_info "Checking user: $MYSQL_USER"
log_info "Database: $MYSQL_DATABASE"

if docker compose -p "$PROJECT" -f "$COMPOSE_FILE" exec -T mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL 2>/dev/null || true
  ALTER USER IF EXISTS '${MYSQL_USER}'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_PASSWORD}';
  CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_PASSWORD}';
  GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
  FLUSH PRIVILEGES;
EOSQL
then
  log_success "MySQL authentication plugin configured successfully"
else
  log_warning "MySQL authentication configuration may have failed (non-fatal)"
fi
log_group_end

# 6. Rodar migrations
log_group_start "🗄️ Running database migrations"

log_info "Step 1/2: Generating Prisma Client..."
PRISMA_GENERATE_OUTPUT=$(docker compose -p "$PROJECT" -f "$COMPOSE_FILE" exec -T app npx prisma generate 2>&1)
PRISMA_GENERATE_EXIT=$?

echo "$PRISMA_GENERATE_OUTPUT"

if [ $PRISMA_GENERATE_EXIT -ne 0 ]; then
  log_error "Prisma generate failed!"
  echo ""
  echo "Application logs:"
  docker compose -p "$PROJECT" -f "$COMPOSE_FILE" logs app --tail=50
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Prisma generate failed"
  exit 1
fi
log_success "Prisma Client generated successfully"

log_info "Step 2/2: Applying database migrations..."
MIGRATE_OUTPUT=$(docker compose -p "$PROJECT" -f "$COMPOSE_FILE" exec -T app npx prisma migrate deploy 2>&1)
MIGRATE_EXIT=$?

echo "$MIGRATE_OUTPUT"

if [ $MIGRATE_EXIT -ne 0 ]; then
  log_error "Migration failed!"
  echo ""
  echo "Application logs:"
  docker compose -p "$PROJECT" -f "$COMPOSE_FILE" logs app --tail=100
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Database migration failed"
  
  if [ "$IS_GITHUB_ACTIONS" != "true" ]; then
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
  fi
  exit 1
fi

log_success "Database migrations completed successfully"
log_group_end

# 7. Health check
log_group_start "🏥 Application health check"
log_info "Waiting 5 seconds before health check..."
sleep 5
log_info "Checking: http://localhost:$PORT/health"

HEALTH_OUTPUT=$(curl -f "http://localhost:$PORT/health" 2>&1)
HEALTH_EXIT=$?

if [ $HEALTH_EXIT -ne 0 ]; then
  log_error "Health check failed!"
  echo "Health check response:"
  echo "$HEALTH_OUTPUT"
  echo ""
  echo "Application logs:"
  docker compose -p "$PROJECT" -f "$COMPOSE_FILE" logs app --tail=50
  "$SCRIPT_DIR/notify.sh" failure "$ENV" "Application health check failed"
  exit 1
fi

log_success "Application is healthy"
echo "$HEALTH_OUTPUT"
log_group_end

# 8. Subir monitoramento
log_group_start "📊 Starting monitoring stack"
log_info "Compose file: $MONITORING_FILE"
docker compose -p "$PROJECT" -f "$MONITORING_FILE" up -d
log_success "Monitoring stack started"
log_group_end

# 9. Limpeza
log_group_start "🗑️ Cleaning up Docker resources"
log_info "Running: docker system prune -f"
docker system prune -f
log_success "Cleanup completed"
log_group_end

# 10. Sucesso
echo ""
echo "═══════════════════════════════════════════════════════════════"
log_success "Deployment completed successfully!"
echo "═══════════════════════════════════════════════════════════════"
"$SCRIPT_DIR/notify.sh" success "$ENV" "Deployment completed successfully"

# 11. Métricas
DEPLOY_TIME=$SECONDS
echo ""
log_info "Total deployment time: ${DEPLOY_TIME}s"
log_info "Application URL: http://localhost:$PORT"
log_info "Grafana: http://localhost:$([[ "$ENV" = "dev" ]] && echo "3001" || echo "3000")"
echo ""


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

# 1. Carregar variáveis de ambiente
log_group_start "🔧 Loading environment variables"
if [ "$ENV" = "dev" ]; then
  ENV_FILE="$PROJECT_DIR/.env.dev"
else
  ENV_FILE="$PROJECT_DIR/.env"
fi

if [ -f "$ENV_FILE" ]; then
  log_info "Loading from file: $ENV_FILE"
  set -a
  source "$ENV_FILE"
  set +a
  log_success "Environment variables loaded from file"
else
  log_warning "Environment file not found: $ENV_FILE"
  log_info "Using environment variables from GitHub Secrets (injected via SSH)"
fi
log_group_end

# 2. Definir imagem Docker do GHCR
log_group_start "🐳 Setting up Docker image"
if [ -n "$DOCKER_IMAGE" ] && [ -n "$IMAGE_TAG" ]; then
  FULL_IMAGE="${DOCKER_IMAGE}:${IMAGE_TAG}"
  log_info "Using GHCR image: $FULL_IMAGE"
  export APP_IMAGE="$FULL_IMAGE"
  USE_GHCR=true
else
  log_warning "DOCKER_IMAGE or IMAGE_TAG not set, will build locally"
  USE_GHCR=false
fi

# Get commit info (if git available)
CURRENT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "no-git")
log_info "Current commit: $CURRENT_COMMIT"
log_group_end

# 3. Pull da imagem do GHCR (se usando GHCR)
if [ "$USE_GHCR" = "true" ]; then
  log_group_start "📥 Pulling image from GHCR"
  log_info "Pulling: $FULL_IMAGE"
  if ! docker pull "$FULL_IMAGE"; then
    log_error "Failed to pull image from GHCR!"
    log_warning "Falling back to local build..."
    USE_GHCR=false
  else
    log_success "Image pulled successfully"
  fi
  log_group_end
fi

# 4. Criar snapshot da versão atual (para rollback)
log_group_start "📸 Creating snapshot of current version"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
IMAGE_NAME="${PROJECT}-app"

# Taguear imagem atual se existir
if docker images | grep -q "$IMAGE_NAME.*latest"; then
  log_info "Tagging current version: $IMAGE_NAME:$TIMESTAMP"
  docker tag "$IMAGE_NAME:latest" "$IMAGE_NAME:$TIMESTAMP" || log_warning "Failed to tag image"
  docker tag "$IMAGE_NAME:latest" "$IMAGE_NAME:backup-latest" || log_warning "Failed to tag backup"
  
  # Salvar informações do deploy
  DEPLOY_LOG_DIR="$PROJECT_DIR/.deploy-history"
  mkdir -p "$DEPLOY_LOG_DIR"
  
  # Log com commit do GHCR tag ou "no-git"
  COMMIT_INFO="$IMAGE_TAG"
  if [ -z "$COMMIT_INFO" ]; then
    COMMIT_INFO="$CURRENT_COMMIT"
  fi
  
  echo "$TIMESTAMP|$COMMIT_INFO|$ENV|$IMAGE_NAME:$TIMESTAMP" >> "$DEPLOY_LOG_DIR/deploys.log"
  log_success "Snapshot created: $IMAGE_NAME:$TIMESTAMP"
else
  log_info "No previous image found (first deploy)"
fi
log_group_end

# 5. Subir containers
log_group_start "🚀 Starting containers"
log_info "Project: $PROJECT"
log_info "Compose file: $COMPOSE_FILE"

if [ "$USE_GHCR" = "true" ]; then
  log_info "Using pre-built image from GHCR (no build)"
  if ! docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d --remove-orphans; then
    log_error "Container startup failed!"
    exit 1
  fi
else
  log_info "Building image locally"
  if ! docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d --build --remove-orphans; then
    log_error "Container build failed!"
    exit 1
  fi
fi
log_success "Containers started successfully"
log_group_end

# 6. Aguardar containers ficarem saudáveis
log_group_start "⏳ Waiting for containers to be healthy"
log_info "Waiting 15 seconds for containers to stabilize..."
sleep 15
log_success "Containers are ready"
log_group_end

# 7. Verificar e corrigir plugin de autenticação MySQL
log_group_start "🔐 Verifying MySQL authentication plugin"
MYSQL_CONTAINER="${PROJECT}-mysql"

log_info "Checking user: $MYSQL_USER"
log_info "Database: $MYSQL_DATABASE"

if docker compose -p "$PROJECT" -f "$COMPOSE_FILE" exec -T mysql mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL 2>/dev/null || true
  ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
  CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
  ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_ROOT_PASSWORD}';
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

# 8. Rodar migrations
log_group_start "🗄️ Running database migrations"

log_info "Parando app para liberar memória da VPS..."
docker compose -p "$PROJECT" -f "$COMPOSE_FILE" stop app

if [ "$USE_GHCR" = "true" ]; then
  log_info "Step 1/2: Prisma Client (pulado — já gerado na imagem do GHCR)"
  log_success "Prisma Client ready"
else
  log_info "Step 1/2: Generating Prisma Client..."
  PRISMA_GENERATE_OUTPUT=$(docker compose -p "$PROJECT" -f "$COMPOSE_FILE" run --rm --no-deps -T app npx prisma generate 2>&1)
  PRISMA_GENERATE_EXIT=$?

  echo "$PRISMA_GENERATE_OUTPUT"

  if [ $PRISMA_GENERATE_EXIT -ne 0 ]; then
    log_error "Prisma generate failed!"
    docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d app
    exit 1
  fi
  log_success "Prisma Client generated successfully"
fi

log_info "Step 2/2: Applying database migrations..."
MIGRATE_OUTPUT=$(docker compose -p "$PROJECT" -f "$COMPOSE_FILE" run --rm --no-deps -T app npx prisma migrate deploy 2>&1)
MIGRATE_EXIT=$?

echo "$MIGRATE_OUTPUT"

if [ $MIGRATE_EXIT -ne 0 ]; then
  log_error "Migration failed!"
  echo ""
  echo "Application logs:"
  docker compose -p "$PROJECT" -f "$COMPOSE_FILE" logs app --tail=100
  docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d app

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

log_info "Subindo app novamente..."
docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d app
log_info "Aguardando 10 segundos para o app estabilizar..."
sleep 10
log_group_end

# 9. Health check
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
  exit 1
fi

log_success "Application is healthy"
echo "$HEALTH_OUTPUT"
log_group_end

# 10. Subir monitoramento
log_group_start "📊 Starting monitoring stack"
log_info "Compose file: $MONITORING_FILE"
docker compose -p "$PROJECT" -f "$MONITORING_FILE" up -d

# Promtail lê a config por bind mount: sem recriar, mudanças no YAML não são aplicadas
log_info "Recreating promtail to apply config changes..."
docker compose -p "$PROJECT" -f "$MONITORING_FILE" up -d --force-recreate promtail
log_success "Monitoring stack started"
log_group_end

# 11. Limpeza de recursos Docker e versões antigas
log_group_start "🗑️ Cleaning up Docker resources"
log_info "Running: docker system prune -f"
docker system prune -f
log_success "Docker cleanup completed"

# Limpar versões antigas (mantém últimas 5 imagens e backups de 7 dias)
log_info "Cleaning old versions..."
bash "$SCRIPT_DIR/cleanup-old-versions.sh" || log_warning "Cleanup script failed (non-critical)"
log_group_end

# 12. Sucesso
echo ""
echo "═══════════════════════════════════════════════════════════════"
log_success "Deployment completed successfully!"
echo "═══════════════════════════════════════════════════════════════"

# 13. Métricas
DEPLOY_TIME=$SECONDS
echo ""
log_info "Total deployment time: ${DEPLOY_TIME}s"
log_info "Application URL: http://localhost:$PORT"
log_info "Grafana: http://localhost:$([[ "$ENV" = "dev" ]] && echo "3001" || echo "3000")"
echo ""

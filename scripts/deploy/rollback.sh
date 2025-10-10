#!/bin/bash

set -e

# Ativa modo verbose se estiver no GitHub Actions ou se DEBUG=1
if [ "${GITHUB_ACTIONS}" = "true" ] || [ "${DEBUG}" = "1" ]; then
  set -x
fi

ENV=${1:-dev}
SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"
DEPLOY_LOG_DIR="$PROJECT_DIR/.deploy-history"

cd "$PROJECT_DIR"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           🔄 ROLLBACK SYSTEM - Gas e Água Backend            ║${NC}"
echo -e "${BLUE}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}Environment: $ENV${NC}"
echo ""

# Definir variáveis do ambiente
if [ "$ENV" = "dev" ]; then
  PROJECT="gas-e-agua-dev"
  COMPOSE_FILE="docker-compose.dev.yml"
  IMAGE_NAME="gas-e-agua-dev-app"
  ENV_FILE="$PROJECT_DIR/.env.dev"
  BACKUP_DIR="$(dirname "$PROJECT_DIR")/backups/dev"
elif [ "$ENV" = "prd" ]; then
  PROJECT="gas-e-agua"
  COMPOSE_FILE="docker-compose.app.yml"
  IMAGE_NAME="gas-e-agua-app"
  ENV_FILE="$PROJECT_DIR/.env"
  BACKUP_DIR="$(dirname "$PROJECT_DIR")/backups/prd"
else
  echo -e "${RED}❌ Invalid environment. Use: dev or prd${NC}"
  exit 1
fi

# Carregar variáveis de ambiente
if [ -f "$ENV_FILE" ]; then
  set -a
  source "$ENV_FILE"
  set +a
fi

# Menu principal
echo -e "${BLUE}Select rollback type:${NC}"
echo "1) 🐳 Docker Image (fast - keeps database)"
echo "2) 🗄️  Database only (restore from backup)"
echo "3) 🔄 Full rollback (image + database)"
echo "4) 📜 View deploy history"
echo "5) ❌ Cancel"
echo ""
read -p "Choose option (1-5): " ROLLBACK_TYPE

case $ROLLBACK_TYPE in
  1)
    echo -e "\n${BLUE}═══ Docker Image Rollback ═══${NC}\n"
    
    # Listar versões disponíveis
    echo "Available versions:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | grep "$IMAGE_NAME" | grep -v latest || {
      echo -e "${RED}No previous versions found!${NC}"
      exit 1
    }
    echo ""
    
    # Menu de escolha
    echo "Quick options:"
    echo "1) Latest backup (backup-latest)"
    echo "2) Choose specific version"
    read -p "Choose (1-2): " VERSION_CHOICE
    
    if [ "$VERSION_CHOICE" = "1" ]; then
      SELECTED_TAG="backup-latest"
    else
      read -p "Enter tag (format: YYYYMMDD-HHMMSS): " SELECTED_TAG
    fi
    
    # Verificar se tag existe
    if ! docker images --format "{{.Repository}}:{{.Tag}}" | grep -q "$IMAGE_NAME:$SELECTED_TAG"; then
      echo -e "${RED}❌ Tag not found: $IMAGE_NAME:$SELECTED_TAG${NC}"
      exit 1
    fi
    
    echo -e "\n${YELLOW}⚠️  This will rollback application to: $SELECTED_TAG${NC}"
    echo -e "${YELLOW}⚠️  Database will NOT be changed${NC}"
    read -p "Continue? (yes/no): " CONFIRM
    
    if [ "$CONFIRM" != "yes" ]; then
      echo "Rollback cancelled"
      exit 0
    fi
    
    echo -e "\n${BLUE}Starting rollback...${NC}"
    
    # Parar container
    echo "Stopping current container..."
    docker compose -p "$PROJECT" -f "$COMPOSE_FILE" stop app
    
    # Taguear versão atual como rollback-temp (para poder voltar)
    if docker images | grep -q "$IMAGE_NAME.*latest"; then
      docker tag "$IMAGE_NAME:latest" "$IMAGE_NAME:rollback-temp-$(date +%Y%m%d-%H%M%S)"
    fi
    
    # Aplicar tag escolhida
    echo "Applying version: $SELECTED_TAG"
    docker tag "$IMAGE_NAME:$SELECTED_TAG" "$IMAGE_NAME:latest"
    
    # Reiniciar container
    echo "Starting container..."
    docker compose -p "$PROJECT" -f "$COMPOSE_FILE" up -d app
    
    # Aguardar container ficar saudável
    echo "Waiting for container to be healthy..."
    sleep 10
    
    # Verificar saúde
    if docker compose -p "$PROJECT" -f "$COMPOSE_FILE" ps app | grep -q "healthy\|Up"; then
      echo -e "\n${GREEN}✅ Rollback completed successfully!${NC}"
      echo -e "${GREEN}Application version: $SELECTED_TAG${NC}"
    else
      echo -e "\n${RED}❌ Container is not healthy! Check logs:${NC}"
      echo "docker compose -p $PROJECT -f $COMPOSE_FILE logs app --tail 50"
      exit 1
    fi
    ;;
    
  2)
    echo -e "\n${BLUE}═══ Database Rollback ═══${NC}\n"
    
    # Listar backups disponíveis
    if [ ! -d "$BACKUP_DIR" ]; then
      echo -e "${RED}❌ Backup directory not found: $BACKUP_DIR${NC}"
      exit 1
    fi
    
    echo "Available backups:"
    ls -lht "$BACKUP_DIR"/*.sql 2>/dev/null || {
      echo -e "${RED}No backups found!${NC}"
      exit 1
    }
    echo ""
    
    read -p "Enter backup filename (e.g., backup-20251009-120000.sql): " BACKUP_FILE
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_FILE"
    
    if [ ! -f "$BACKUP_PATH" ]; then
      echo -e "${RED}❌ Backup file not found: $BACKUP_PATH${NC}"
      exit 1
    fi
    
    echo -e "\n${YELLOW}⚠️  This will RESTORE database from: $BACKUP_FILE${NC}"
    echo -e "${RED}⚠️  ALL CURRENT DATA WILL BE LOST!${NC}"
    read -p "Type 'RESTORE' to confirm: " CONFIRM
    
    if [ "$CONFIRM" != "RESTORE" ]; then
      echo "Rollback cancelled"
      exit 0
    fi
    
    echo -e "\n${BLUE}Starting database restore...${NC}"
    
    # Determinar container MySQL
    MYSQL_CONTAINER="${PROJECT}-mysql"
    if [ "$ENV" = "dev" ]; then
      MYSQL_CONTAINER="gas-e-agua-mysql-dev"
    else
      MYSQL_CONTAINER="gas-e-agua-mysql"
    fi
    
    # Criar backup de segurança antes de restaurar
    SAFETY_BACKUP="$BACKUP_DIR/safety-backup-$(date +%Y%m%d-%H%M%S).sql"
    echo "Creating safety backup: $SAFETY_BACKUP"
    docker exec "$MYSQL_CONTAINER" mysqldump --user=root --password="$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" > "$SAFETY_BACKUP" || {
      echo -e "${YELLOW}⚠️  Safety backup failed, continuing...${NC}"
    }
    
    # Restaurar backup
    echo "Restoring database..."
    docker exec -i "$MYSQL_CONTAINER" mysql --user=root --password="$MYSQL_ROOT_PASSWORD" "$MYSQL_DATABASE" < "$BACKUP_PATH"
    
    if [ $? -eq 0 ]; then
      echo -e "\n${GREEN}✅ Database restored successfully!${NC}"
      echo -e "${GREEN}Restored from: $BACKUP_FILE${NC}"
      echo -e "${BLUE}Safety backup saved at: $SAFETY_BACKUP${NC}"
    else
      echo -e "\n${RED}❌ Database restore failed!${NC}"
      exit 1
    fi
    ;;
    
  3)
    echo -e "\n${BLUE}═══ Full Rollback (Image + Database) ═══${NC}\n"
    echo -e "${RED}⚠️  This will rollback BOTH application and database!${NC}"
    echo -e "${RED}⚠️  ALL CURRENT DATA WILL BE LOST!${NC}"
    echo ""
    read -p "Type 'FULL ROLLBACK' to confirm: " CONFIRM
    
    if [ "$CONFIRM" != "FULL ROLLBACK" ]; then
      echo "Rollback cancelled"
      exit 0
    fi
    
    # Executar rollback de imagem primeiro
    echo -e "\n${BLUE}Step 1/2: Rolling back Docker image...${NC}"
    bash "$0" "$ENV" <<EOF
1
2
$(ls -t "$DEPLOY_LOG_DIR"/*.sql 2>/dev/null | head -1 | xargs basename)
yes
EOF
    
    # Depois rollback de database
    echo -e "\n${BLUE}Step 2/2: Rolling back database...${NC}"
    # (usuário precisará escolher o backup manualmente)
    ;;
    
  4)
    echo -e "\n${BLUE}═══ Deploy History ═══${NC}\n"
    
    if [ -f "$DEPLOY_LOG_DIR/deploys.log" ]; then
      echo -e "${BLUE}Recent deploys:${NC}"
      echo "----------------------------------------"
      tail -20 "$DEPLOY_LOG_DIR/deploys.log" | tac | while IFS='|' read -r timestamp commit env image; do
        echo -e "${GREEN}$timestamp${NC} | Commit: ${YELLOW}$commit${NC} | Env: $env"
      done
      echo "----------------------------------------"
    else
      echo "No deploy history found"
    fi
    
    echo ""
    echo -e "${BLUE}Available Docker images:${NC}"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.CreatedAt}}\t{{.Size}}" | grep "$IMAGE_NAME" || echo "No images found"
    
    echo ""
    echo -e "${BLUE}Available database backups:${NC}"
    ls -lht "$BACKUP_DIR"/*.sql 2>/dev/null | head -10 || echo "No backups found"
    ;;
    
  5)
    echo "Cancelled"
    exit 0
    ;;
    
  *)
    echo -e "${RED}Invalid option${NC}"
    exit 1
    ;;
esac

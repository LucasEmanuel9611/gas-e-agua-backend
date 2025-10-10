#!/bin/bash

set -e

# Script para limpar versões antigas de imagens Docker e backups
# Mantém apenas as N versões mais recentes

SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "$SCRIPT_PATH")" && pwd)"
PROJECT_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Configurações
KEEP_IMAGES=5          # Manter últimas 5 imagens
KEEP_BACKUPS_DAYS=7    # Manter backups dos últimos 7 dias
DRY_RUN=${DRY_RUN:-false}  # Se true, apenas mostra o que seria removido

echo "🧹 Cleanup Script - Gas e Água Backend"
echo "======================================"
echo ""

if [ "$DRY_RUN" = "true" ]; then
  echo "⚠️  DRY RUN MODE - No files will be deleted"
  echo ""
fi

# 1. Limpar imagens Docker antigas
echo "📦 Cleaning old Docker images..."
echo "Keeping last $KEEP_IMAGES versions of each image"
echo ""

for image_name in "gas-e-agua-app" "gas-e-agua-dev-app"; do
  echo "Processing: $image_name"
  
  # Listar todas as tags exceto latest e backup-latest
  TAGS=$(docker images --format "{{.Tag}}" "$image_name" | \
    grep -E '^[0-9]{8}-[0-9]{6}$' | \
    sort -r || true)
  
  if [ -z "$TAGS" ]; then
    echo "  No timestamped versions found"
    continue
  fi
  
  # Contar tags
  TAG_COUNT=$(echo "$TAGS" | wc -l)
  echo "  Found $TAG_COUNT versions"
  
  if [ "$TAG_COUNT" -le "$KEEP_IMAGES" ]; then
    echo "  Nothing to clean (within limit)"
    continue
  fi
  
  # Remover tags antigas (manter apenas as N mais recentes)
  TO_REMOVE=$(echo "$TAGS" | tail -n +$((KEEP_IMAGES + 1)))
  REMOVE_COUNT=$(echo "$TO_REMOVE" | wc -l)
  
  echo "  Removing $REMOVE_COUNT old versions..."
  
  echo "$TO_REMOVE" | while read -r tag; do
    if [ "$DRY_RUN" = "true" ]; then
      echo "    [DRY RUN] Would remove: $image_name:$tag"
    else
      echo "    Removing: $image_name:$tag"
      docker rmi "$image_name:$tag" 2>/dev/null || echo "    Failed to remove $tag"
    fi
  done
done

echo ""

# 2. Limpar backups de banco de dados antigos
echo "🗄️  Cleaning old database backups..."
echo "Keeping backups from last $KEEP_BACKUPS_DAYS days"
echo ""

for backup_dir in "$(dirname "$PROJECT_DIR")/backups/dev" "$(dirname "$PROJECT_DIR")/backups/prd"; do
  if [ ! -d "$backup_dir" ]; then
    continue
  fi
  
  ENV_NAME=$(basename "$(dirname "$backup_dir")")/$(basename "$backup_dir")
  echo "Processing: $ENV_NAME"
  
  # Contar backups atuais
  BACKUP_COUNT=$(find "$backup_dir" -name "backup-*.sql" -type f 2>/dev/null | wc -l)
  echo "  Found $BACKUP_COUNT backups"
  
  # Encontrar backups antigos (> KEEP_BACKUPS_DAYS dias)
  OLD_BACKUPS=$(find "$backup_dir" -name "backup-*.sql" -type f -mtime +"$KEEP_BACKUPS_DAYS" 2>/dev/null || true)
  
  if [ -z "$OLD_BACKUPS" ]; then
    echo "  No old backups to remove"
    continue
  fi
  
  OLD_COUNT=$(echo "$OLD_BACKUPS" | wc -l)
  echo "  Removing $OLD_COUNT old backups..."
  
  echo "$OLD_BACKUPS" | while read -r backup_file; do
    BACKUP_NAME=$(basename "$backup_file")
    if [ "$DRY_RUN" = "true" ]; then
      echo "    [DRY RUN] Would remove: $BACKUP_NAME"
    else
      echo "    Removing: $BACKUP_NAME"
      rm -f "$backup_file"
    fi
  done
done

echo ""

# 3. Limpar imagens Docker não utilizadas (dangling)
echo "🗑️  Cleaning dangling Docker images..."
DANGLING=$(docker images -f "dangling=true" -q 2>/dev/null | wc -l)
echo "Found $DANGLING dangling images"

if [ "$DANGLING" -gt 0 ]; then
  if [ "$DRY_RUN" = "true" ]; then
    echo "[DRY RUN] Would remove $DANGLING dangling images"
  else
    docker image prune -f
    echo "✅ Removed dangling images"
  fi
else
  echo "No dangling images to remove"
fi

echo ""

# 4. Resumo de espaço
echo "💾 Storage Summary:"
echo "=================="
docker system df
echo ""

echo "✅ Cleanup completed!"
echo ""
echo "To run in dry-run mode: DRY_RUN=true bash $0"


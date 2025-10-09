#!/bin/bash

# Script de Backup do Sistema de Monitoramento
# Gas e Água Backend

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Configurações
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="monitoring_backup_$DATE"

# Criar diretório de backup
mkdir -p "$BACKUP_DIR"

print_status "🔄 Iniciando backup do sistema de monitoramento..."

# 1. Backup das configurações
print_status "Fazendo backup das configurações..."
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_configs.tar.gz" \
    monitoring/ \
    docker-compose*.yml \
    env.monitoring.example \
    monitoring-setup.sh \
    deploy-monitoring.sh \
    2>/dev/null || true

# 2. Backup dos dashboards do Grafana
print_status "Fazendo backup dos dashboards do Grafana..."
if docker exec grafana grafana-cli admin export-dashboard 2>/dev/null; then
    docker exec grafana grafana-cli admin export-dashboard > "$BACKUP_DIR/${BACKUP_NAME}_dashboards.json" 2>/dev/null || true
fi

# 3. Backup dos dados do Prometheus (últimos 7 dias)
print_status "Fazendo backup dos dados do Prometheus..."
if [ -d "./monitoring/data/prometheus" ]; then
    find ./monitoring/data/prometheus -name "*.db" -mtime -7 -exec tar -czf "$BACKUP_DIR/${BACKUP_NAME}_prometheus_data.tar.gz" {} + 2>/dev/null || true
fi

# 4. Backup dos logs
print_status "Fazendo backup dos logs..."
if [ -d "./logs" ]; then
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_logs.tar.gz" logs/ 2>/dev/null || true
fi

# 5. Criar arquivo de informações do backup
print_status "Criando arquivo de informações..."
cat > "$BACKUP_DIR/${BACKUP_NAME}_info.txt" << EOF
Backup do Sistema de Monitoramento - Gas e Água Backend
Data: $(date)
Hostname: $(hostname)
Versão Docker: $(docker --version)
Status dos Serviços:
$(docker compose -f docker-compose.monitoring.yml ps 2>/dev/null || echo "Serviços não estão rodando")

Arquivos incluídos:
- Configurações: ${BACKUP_NAME}_configs.tar.gz
- Dashboards: ${BACKUP_NAME}_dashboards.json
- Dados Prometheus: ${BACKUP_NAME}_prometheus_data.tar.gz
- Logs: ${BACKUP_NAME}_logs.tar.gz
EOF

# 6. Limpar backups antigos (manter apenas os últimos 10)
print_status "Limpando backups antigos..."
ls -t "$BACKUP_DIR"/monitoring_backup_* 2>/dev/null | tail -n +11 | xargs -r rm -f

# 7. Mostrar resumo
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
print_status "✅ Backup concluído!"
echo ""
echo "📁 Localização: $BACKUP_DIR"
echo "📊 Tamanho total: $BACKUP_SIZE"
echo "📋 Arquivos criados:"
ls -la "$BACKUP_DIR"/*$DATE* 2>/dev/null || true

# 8. Opcional: Enviar backup para armazenamento remoto
if [ ! -z "$BACKUP_REMOTE_PATH" ]; then
    print_status "Enviando backup para armazenamento remoto..."
    rsync -avz "$BACKUP_DIR"/*$DATE* "$BACKUP_REMOTE_PATH/" || print_warning "Falha ao enviar backup remoto"
fi

print_status "🎉 Backup finalizado com sucesso!"

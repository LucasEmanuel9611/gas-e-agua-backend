#!/bin/bash

# Script para gerenciar o sistema de monitoramento
# Gas e Água Backend - Observabilidade

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker não está instalado!"
        exit 1
    fi

    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose não está instalado!"
        exit 1
    fi
}

start_monitoring() {
    print_status "Iniciando sistema de monitoramento..."
    
    # Criar diretórios necessários
    mkdir -p logs
    
    # Iniciar serviços
    docker compose -f docker-compose.monitoring.yml up -d
    
    print_status "Aguardando serviços ficarem prontos..."
    sleep 30
    
    print_status "Sistema de monitoramento iniciado com sucesso!"
    print_status "Acessos disponíveis:"
    echo "  - Grafana: http://localhost:3000 (admin/admin123)"
    echo "  - Prometheus: http://localhost:9090"
    echo "  - Loki: http://localhost:3100"
    echo "  - Métricas da aplicação: http://localhost:4000/metrics"
    echo "  - Health check: http://localhost:4000/health"
}

stop_monitoring() {
    print_status "Parando sistema de monitoramento..."
    docker compose -f docker-compose.monitoring.yml down
    print_status "Sistema de monitoramento parado!"
}

restart_monitoring() {
    print_status "Reiniciando sistema de monitoramento..."
    stop_monitoring
    start_monitoring
}

show_logs() {
    local service=${1:-""}
    if [ -z "$service" ]; then
        print_status "Logs de todos os serviços:"
        docker compose -f docker-compose.monitoring.yml logs -f
    else
        print_status "Logs do serviço: $service"
        docker compose -f docker-compose.monitoring.yml logs -f "$service"
    fi
}

show_status() {
    print_status "Status dos serviços de monitoramento:"
    docker compose -f docker-compose.monitoring.yml ps
}

cleanup() {
    print_warning "Removendo volumes e dados do sistema de monitoramento..."
    read -p "Tem certeza? Esta ação é irreversível (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose -f docker-compose.monitoring.yml down -v
        docker volume prune -f
        print_status "Limpeza concluída!"
    else
        print_status "Operação cancelada."
    fi
}

show_help() {
    echo "Sistema de Monitoramento - Gas e Água Backend"
    echo ""
    echo "Uso: $0 [COMANDO]"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start     - Iniciar sistema de monitoramento"
    echo "  stop      - Parar sistema de monitoramento"
    echo "  restart   - Reiniciar sistema de monitoramento"
    echo "  status    - Mostrar status dos serviços"
    echo "  logs      - Mostrar logs de todos os serviços"
    echo "  logs [service] - Mostrar logs de um serviço específico"
    echo "  cleanup   - Remover volumes e dados (CUIDADO!)"
    echo "  help      - Mostrar esta ajuda"
    echo ""
    echo "Serviços disponíveis: prometheus, loki, promtail, grafana, node-exporter, cadvisor"
}

# Verificar se Docker está disponível
check_docker

# Processar comandos
case "${1:-help}" in
    start)
        start_monitoring
        ;;
    stop)
        stop_monitoring
        ;;
    restart)
        restart_monitoring
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs "$2"
        ;;
    cleanup)
        cleanup
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Comando inválido: $1"
        echo ""
        show_help
        exit 1
        ;;
esac

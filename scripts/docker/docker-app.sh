#!/bin/bash

# Script para gerenciar a aplicação dockerizada
# Uso: ./docker-app.sh [comando]

set -e

COMPOSE_FILE="docker-compose.app.yml"
ENV_FILE="env.docker.example"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para mostrar ajuda
show_help() {
    echo -e "${BLUE}🐳 Gas e Água - Docker App Manager${NC}"
    echo ""
    echo "Comandos disponíveis:"
    echo "  start     - Iniciar aplicação (build + up)"
    echo "  stop      - Parar aplicação"
    echo "  restart   - Reiniciar aplicação"
    echo "  build     - Fazer build da imagem"
    echo "  logs      - Ver logs da aplicação"
    echo "  logs-db   - Ver logs do MySQL"
    echo "  status    - Status dos containers"
    echo "  migrate   - Executar migrações do Prisma"
    echo "  shell     - Acessar shell do container da app"
    echo "  db-shell  - Acessar MySQL"
    echo "  clean     - Limpar containers e volumes"
    echo "  help      - Mostrar esta ajuda"
    echo ""
    echo "Exemplos:"
    echo "  ./docker-app.sh start"
    echo "  ./docker-app.sh logs -f"
    echo "  ./docker-app.sh migrate"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}❌ Docker não está instalado!${NC}"
        exit 1
    fi
    
    if ! command -v docker compose &> /dev/null; then
        echo -e "${RED}❌ Docker Compose não está instalado!${NC}"
        exit 1
    fi
}

# Verificar se arquivo .env existe
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  Arquivo .env não encontrado!${NC}"
        echo -e "${BLUE}💡 Copiando env.docker.example para .env...${NC}"
        cp env.docker.example .env
        echo -e "${GREEN}✅ Arquivo .env criado! Edite as variáveis se necessário.${NC}"
    fi
}

# Função para iniciar
start_app() {
    echo -e "${BLUE}🚀 Iniciando aplicação...${NC}"
    check_docker
    check_env
    
    echo -e "${YELLOW}🔨 Fazendo build da imagem...${NC}"
    docker compose -f $COMPOSE_FILE build --no-cache
    
    echo -e "${YELLOW}⬆️  Subindo containers...${NC}"
    docker compose -f $COMPOSE_FILE up -d
    
    echo -e "${GREEN}✅ Aplicação iniciada!${NC}"
    echo -e "${BLUE}📊 Status:${NC}"
    docker compose -f $COMPOSE_FILE ps
    
    echo ""
    echo -e "${GREEN}🌐 Aplicação disponível em:${NC}"
    echo -e "   • API: http://localhost:3333"
    echo -e "   • Health: http://localhost:3333/health"
    echo -e "   • Metrics: http://localhost:3333/metrics"
    echo ""
    echo -e "${BLUE}💡 Para ver logs: ./docker-app.sh logs${NC}"
}

# Função para parar
stop_app() {
    echo -e "${YELLOW}🛑 Parando aplicação...${NC}"
    docker compose -f $COMPOSE_FILE down
    echo -e "${GREEN}✅ Aplicação parada!${NC}"
}

# Função para reiniciar
restart_app() {
    echo -e "${YELLOW}🔄 Reiniciando aplicação...${NC}"
    stop_app
    start_app
}

# Função para build
build_app() {
    echo -e "${BLUE}🔨 Fazendo build da aplicação...${NC}"
    docker compose -f $COMPOSE_FILE build --no-cache
    echo -e "${GREEN}✅ Build concluído!${NC}"
}

# Função para logs
show_logs() {
    echo -e "${BLUE}📋 Logs da aplicação:${NC}"
    docker compose -f $COMPOSE_FILE logs "$@"
}

# Função para logs do banco
show_db_logs() {
    echo -e "${BLUE}📋 Logs do MySQL:${NC}"
    docker compose -f $COMPOSE_FILE logs mysql "$@"
}

# Função para status
show_status() {
    echo -e "${BLUE}📊 Status dos containers:${NC}"
    docker compose -f $COMPOSE_FILE ps
    echo ""
    echo -e "${BLUE}💾 Uso de recursos:${NC}"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Função para migrar
migrate_db() {
    echo -e "${BLUE}🔄 Executando migrações...${NC}"
    docker compose -f $COMPOSE_FILE exec app /bin/bash -c "npx prisma db push"
    echo -e "${GREEN}✅ Migrações executadas!${NC}"
}

# Função para shell da app
app_shell() {
    echo -e "${BLUE}🐚 Acessando shell da aplicação...${NC}"
    docker compose -f $COMPOSE_FILE exec app /bin/sh
}

# Função para shell do banco
db_shell() {
    echo -e "${BLUE}🐚 Acessando MySQL...${NC}"
    docker compose -f $COMPOSE_FILE exec mysql mysql -u gas_e_agua -p gas_e_agua
}

# Função para limpar
clean_all() {
    echo -e "${RED}🧹 Limpando containers e volumes...${NC}"
    read -p "Tem certeza? Isso vai apagar todos os dados! (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose -f $COMPOSE_FILE down -v --remove-orphans
        docker system prune -f
        echo -e "${GREEN}✅ Limpeza concluída!${NC}"
    else
        echo -e "${YELLOW}❌ Operação cancelada.${NC}"
    fi
}

# Main
case "${1:-help}" in
    start)
        start_app
        ;;
    stop)
        stop_app
        ;;
    restart)
        restart_app
        ;;
    build)
        build_app
        ;;
    logs)
        shift
        show_logs "$@"
        ;;
    logs-db)
        shift
        show_db_logs "$@"
        ;;
    status)
        show_status
        ;;
    migrate)
        migrate_db
        ;;
    shell)
        app_shell
        ;;
    db-shell)
        db_shell
        ;;
    clean)
        clean_all
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}❌ Comando desconhecido: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac

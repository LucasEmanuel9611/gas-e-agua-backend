#!/bin/bash

# Script de Deploy do Sistema de Monitoramento para Produção
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

# Verificar se está rodando como root ou com sudo
if [[ $EUID -eq 0 ]]; then
   print_error "Não execute este script como root!"
   exit 1
fi

print_status "🚀 Iniciando deploy do sistema de monitoramento..."

# 1. Verificar dependências
print_status "Verificando dependências..."
if ! command -v docker &> /dev/null; then
    print_error "Docker não está instalado!"
    exit 1
fi

if ! docker compose version &> /dev/null; then
    print_error "Docker Compose não está instalado!"
    exit 1
fi

# 2. Criar diretórios necessários
print_status "Criando estrutura de diretórios..."
mkdir -p logs
mkdir -p monitoring/data/{prometheus,grafana,loki,alertmanager}
sudo chown -R $USER:$USER monitoring/data

# 3. Configurar variáveis de ambiente
print_status "Configurando variáveis de ambiente..."
if [ ! -f .env.monitoring ]; then
    cp env.monitoring.example .env.monitoring
    print_warning "Arquivo .env.monitoring criado. CONFIGURE AS VARIÁVEIS antes de continuar!"
    print_warning "Edite o arquivo .env.monitoring com suas configurações específicas."
    read -p "Pressione Enter após configurar o arquivo .env.monitoring..."
fi

# 4. Verificar se a aplicação está rodando
print_status "Verificando se a aplicação está rodando..."
if ! curl -s http://localhost:3333/health > /dev/null; then
    print_warning "Aplicação não está rodando na porta 3333!"
    print_warning "Certifique-se de que sua aplicação Node.js esteja rodando antes de continuar."
    read -p "Pressione Enter quando a aplicação estiver rodando..."
fi

# 5. Parar serviços existentes (se houver)
print_status "Parando serviços existentes..."
docker compose -f docker-compose.monitoring.yml down 2>/dev/null || true

# 6. Iniciar serviços de monitoramento
print_status "Iniciando serviços de monitoramento..."
docker compose -f docker-compose.monitoring.yml up -d

# 7. Aguardar serviços ficarem prontos
print_status "Aguardando serviços ficarem prontos..."
sleep 30

# 8. Verificar saúde dos serviços
print_status "Verificando saúde dos serviços..."
services=("prometheus:9090" "grafana:3000" "loki:3100")
failed_services=()

for service in "${services[@]}"; do
    name=$(echo $service | cut -d':' -f1)
    port=$(echo $service | cut -d':' -f2)
    
    if curl -s -f "http://localhost:$port" > /dev/null; then
        print_status "✅ $name está rodando"
    else
        print_error "❌ $name não está respondendo"
        failed_services+=($name)
    fi
done

if [ ${#failed_services[@]} -gt 0 ]; then
    print_error "Alguns serviços falharam: ${failed_services[*]}"
    print_error "Verifique os logs com: ./monitoring-setup.sh logs"
    exit 1
fi

# 9. Configurar firewall (se necessário)
if command -v ufw &> /dev/null; then
    print_status "Configurando firewall..."
    sudo ufw allow 3000/tcp comment "Grafana"
    sudo ufw allow 9090/tcp comment "Prometheus"
fi

# 10. Criar backup inicial
print_status "Criando backup inicial..."
mkdir -p backups
docker exec grafana grafana-cli admin export-dashboard > "backups/dashboards-$(date +%Y%m%d).json" 2>/dev/null || true

print_status "🎉 Deploy concluído com sucesso!"
echo ""
echo "📊 Acessos disponíveis:"
echo "  - Grafana: http://$(hostname -I | awk '{print $1}'):3000 (admin/admin123)"
echo "  - Prometheus: http://$(hostname -I | awk '{print $1}'):9090"
echo ""
echo "📋 Próximos passos:"
echo "  1. Acesse o Grafana e altere a senha padrão"
echo "  2. Configure alertas no Alertmanager"
echo "  3. Configure backup automático"
echo "  4. Configure HTTPS (recomendado para produção)"
echo ""
print_status "Para gerenciar o sistema, use: ./monitoring-setup.sh [start|stop|status|logs]"

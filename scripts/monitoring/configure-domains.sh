#!/bin/bash

# Script para configurar domínios personalizados
# Gas e Água Backend - Sistema de Monitoramento

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

print_status "🌐 Configurando domínios personalizados..."
echo ""

echo "Escolha uma opção:"
echo "1) Usar domínio próprio (recomendado)"
echo "2) Usar apenas IP (sem SSL)"
echo "3) Manter configuração atual"
echo ""
read -p "Digite sua escolha (1-3): " choice

case $choice in
    1)
        print_status "Configuração com domínio próprio"
        read -p "Digite seu domínio principal (ex: meusite.com): " main_domain
        
        if [ -z "$main_domain" ]; then
            print_error "Domínio não pode estar vazio!"
            exit 1
        fi
        
        grafana_domain="monitoring.$main_domain"
        prometheus_domain="prometheus.$main_domain"
        
        print_status "Configurando:"
        echo "  - Grafana: https://$grafana_domain"
        echo "  - Prometheus: https://$prometheus_domain"
        
        # Fazer backup da configuração atual
        cp nginx-monitoring.conf nginx-monitoring.conf.backup
        
        # Substituir domínios
        sed -i "s/monitoring\.gas-e-agua\.com/$grafana_domain/g" nginx-monitoring.conf
        sed -i "s/prometheus\.gas-e-agua\.com/$prometheus_domain/g" nginx-monitoring.conf
        
        print_status "✅ Configuração atualizada!"
        echo ""
        print_warning "IMPORTANTE: Configure os DNS records:"
        echo "  $grafana_domain A $IP_DA_SUA_VPS"
        echo "  $prometheus_domain A $IP_DA_SUA_VPS"
        ;;
        
    2)
        print_status "Configuração apenas com IP"
        read -p "Digite o IP da sua VPS: " vps_ip
        
        if [ -z "$vps_ip" ]; then
            print_error "IP não pode estar vazio!"
            exit 1
        fi
        
        # Criar configuração simples sem SSL
        cat > nginx-monitoring-ip.conf << EOF
# Configuração Nginx para Sistema de Monitoramento (IP Only)
# Gas e Água Backend

# Grafana
server {
    listen 80;
    server_name $vps_ip;

    # Rate Limiting
    limit_req_zone \$binary_remote_addr zone=monitoring:10m rate=10r/m;
    limit_req zone=monitoring burst=5 nodelay;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # WebSocket support for Grafana
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /prometheus/ {
        # Acesso restrito ao Prometheus
        allow 192.168.1.0/24;
        deny all;
        
        auth_basic "Prometheus Access";
        auth_basic_user_file /etc/nginx/.htpasswd;
        
        proxy_pass http://127.0.0.1:9090/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    }
}
EOF
        
        print_status "✅ Configuração IP criada!"
        echo ""
        echo "Acessos:"
        echo "  - Grafana: http://$vps_ip"
        echo "  - Prometheus: http://$vps_ip/prometheus/"
        ;;
        
    3)
        print_status "Mantendo configuração atual"
        echo "Domínios atuais:"
        echo "  - Grafana: https://monitoring.gas-e-agua.com"
        echo "  - Prometheus: https://prometheus.gas-e-agua.com"
        ;;
        
    *)
        print_error "Opção inválida!"
        exit 1
        ;;
esac

echo ""
print_status "🔧 Próximos passos:"
if [ "$choice" == "1" ]; then
    echo "1. Configure os DNS records para apontar para sua VPS"
    echo "2. Execute: ./setup-security.sh"
    echo "3. Copie a configuração para o Nginx:"
    echo "   sudo cp nginx-monitoring.conf /etc/nginx/sites-available/monitoring"
elif [ "$choice" == "2" ]; then
    echo "1. Execute: sudo apt install apache2-utils"
    echo "2. Execute: sudo htpasswd -c /etc/nginx/.htpasswd admin"
    echo "3. Copie a configuração para o Nginx:"
    echo "   sudo cp nginx-monitoring-ip.conf /etc/nginx/sites-available/monitoring"
fi
echo "4. Ative o site: sudo ln -s /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/"
echo "5. Teste: sudo nginx -t"
echo "6. Reinicie: sudo systemctl restart nginx"

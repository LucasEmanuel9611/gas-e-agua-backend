#!/bin/bash

# Script de Configuração de Segurança
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

print_status "🔒 Configurando segurança do sistema de monitoramento..."

# 1. Configurar firewall
print_status "Configurando firewall..."
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # SSH
    sudo ufw allow ssh
    
    # Aplicação
    sudo ufw allow 3333/tcp comment "Gas e Agua Backend"
    
    # Monitoramento (apenas para IPs específicos)
    read -p "Digite o IP/range que pode acessar o monitoramento (ex: 192.168.1.0/24): " ALLOWED_IP
    if [ ! -z "$ALLOWED_IP" ]; then
        sudo ufw allow from $ALLOWED_IP to any port 3000 comment "Grafana"
        sudo ufw allow from $ALLOWED_IP to any port 9090 comment "Prometheus"
    fi
    
    sudo ufw reload
    print_status "Firewall configurado!"
else
    print_warning "UFW não encontrado. Configure o firewall manualmente."
fi

# 2. Configurar autenticação básica para Nginx
print_status "Configurando autenticação básica..."
if command -v htpasswd &> /dev/null; then
    sudo mkdir -p /etc/nginx
    read -p "Digite o usuário para acesso ao monitoramento: " AUTH_USER
    sudo htpasswd -c /etc/nginx/.htpasswd $AUTH_USER
    print_status "Arquivo de autenticação criado!"
else
    print_warning "htpasswd não encontrado. Instale: sudo apt install apache2-utils"
fi

# 3. Configurar SSL com Let's Encrypt
print_status "Configurando SSL..."
if command -v certbot &> /dev/null; then
    read -p "Digite o domínio para o Grafana (ex: monitoring.gas-e-agua.com): " GRAFANA_DOMAIN
    read -p "Digite o domínio para o Prometheus (ex: prometheus.gas-e-agua.com): " PROMETHEUS_DOMAIN
    
    if [ ! -z "$GRAFANA_DOMAIN" ]; then
        sudo certbot certonly --standalone -d $GRAFANA_DOMAIN
    fi
    
    if [ ! -z "$PROMETHEUS_DOMAIN" ]; then
        sudo certbot certonly --standalone -d $PROMETHEUS_DOMAIN
    fi
    
    # Configurar renovação automática
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
    print_status "SSL configurado!"
else
    print_warning "Certbot não encontrado. Instale: sudo apt install certbot"
fi

# 4. Configurar backup automático
print_status "Configurando backup automático..."
# Backup diário às 2h da manhã
echo "0 2 * * * cd $(pwd) && ./backup-monitoring.sh" | crontab -
print_status "Backup automático configurado!"

# 5. Configurar logrotate
print_status "Configurando rotação de logs..."
sudo tee /etc/logrotate.d/gas-e-agua-monitoring > /dev/null << EOF
$(pwd)/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}
EOF

# 6. Configurar monitoramento do próprio sistema de monitoramento
print_status "Configurando watchdog..."
sudo tee /etc/systemd/system/monitoring-watchdog.service > /dev/null << EOF
[Unit]
Description=Gas e Agua Monitoring Watchdog
After=network.target

[Service]
Type=oneshot
ExecStart=$(pwd)/monitoring-setup.sh status
User=$USER
WorkingDirectory=$(pwd)

[Install]
WantedBy=multi-user.target
EOF

sudo tee /etc/systemd/system/monitoring-watchdog.timer > /dev/null << EOF
[Unit]
Description=Run monitoring watchdog every 5 minutes
Requires=monitoring-watchdog.service

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable monitoring-watchdog.timer
sudo systemctl start monitoring-watchdog.timer

# 7. Criar arquivo de configuração de segurança
print_status "Criando arquivo de configuração..."
cat > security-config.txt << EOF
Configurações de Segurança - Gas e Água Monitoring
Data: $(date)

Firewall: $(sudo ufw status | head -1)
SSL: $(ls /etc/letsencrypt/live/ 2>/dev/null || echo "Não configurado")
Auth: $([ -f /etc/nginx/.htpasswd ] && echo "Configurado" || echo "Não configurado")
Backup: $(crontab -l | grep backup || echo "Não configurado")

Portas abertas:
$(sudo ufw status numbered | grep ALLOW || echo "Nenhuma regra específica")

Próximos passos:
1. Configure o Nginx com o arquivo nginx-monitoring.conf
2. Teste o acesso HTTPS
3. Configure alertas no Slack/Email
4. Teste o backup automático
EOF

print_status "✅ Configuração de segurança concluída!"
echo ""
echo "📋 Resumo das configurações:"
cat security-config.txt
echo ""
print_warning "Lembre-se de:"
echo "1. Configurar o Nginx com o arquivo nginx-monitoring.conf"
echo "2. Alterar as senhas padrão do Grafana"
echo "3. Testar os alertas"
echo "4. Verificar os backups"

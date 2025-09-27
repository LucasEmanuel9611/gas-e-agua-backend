Deploy manual: execute `docker compose -f docker-compose.production.yml up -d`
Deploy com scripts: execute `./deploy-monitoring.sh`

# Deploy do Sistema de Monitoramento (Grafana + Loki + Prometheus)

Sumário
- Seção A: Deploy Manual
- Seção B: Deploy com Scripts
- Troubleshooting

## Seção A: Deploy Manual

1) Pré-requisitos
```bash
docker --version
docker compose version
curl -f http://localhost:3333/health | cat
```
- Docker e Docker Compose instalados
- App rodando em 3333
- (Opcional) Domínios para HTTPS via Nginx

2) Clonar projeto e preparar estrutura
```bash
git clone <SEU_REPO_GIT>
cd gas-e-agua-backend
mkdir -p monitoring/data/{prometheus,loki,grafana,alertmanager} logs
cp env.monitoring.example .env.monitoring
```
Edite `.env.monitoring` (GRAFANA_ADMIN_PASSWORD, SMTP, etc.).

3) Subir a aplicação (se necessário)
```bash
pm2 start ecosystem.config.js --only gas-e-agua-api
pm2 status
```

4) Subir a stack de monitoramento
```bash
docker compose -f docker-compose.production.yml up -d
```
Portas esperadas: Grafana 3000, Prometheus 9090, Loki 3100, Alertmanager 9093, Node Exporter 9100, cAdvisor 8080.

5) Verificar serviços
```bash
docker compose -f docker-compose.production.yml ps
curl -f http://localhost:3000 | head -n1
curl -f http://localhost:9090/-/ready | cat
curl -f http://localhost:3100/ready | cat
```

6) Acessar Grafana
- http://SEU_IP:3000 (admin/admin123 ou `.env.monitoring`)
- Datasources provisionados: Prometheus (uid: prometheus), Loki (uid: loki)
- Dashboards: Monitoramento e Logs

7) Nginx + HTTPS (opcional)
```bash
sudo cp nginx-monitoring.conf /etc/nginx/sites-available/monitoring
sudo ln -s /etc/nginx/sites-available/monitoring /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```
(Certificados: rode previamente `./setup-security.sh` para emitir via Certbot.)

8) Alertas
```bash
nano monitoring/alertmanager/alertmanager-production.yml
docker compose -f docker-compose.production.yml restart alertmanager prometheus
```
Verifique em: Prometheus → /alerts, /rules.

9) Backups
```bash
./backup-monitoring.sh
ls -la monitoring/data/{prometheus,loki,grafana,alertmanager}
```

10) Operação diária
```bash
docker compose -f docker-compose.production.yml ps
docker compose -f docker-compose.production.yml logs -f grafana
docker compose -f docker-compose.production.yml restart prometheus
```

## Seção B: Deploy com Scripts

1) Preparação automática
```bash
./deploy-monitoring.sh
```
O script cria pastas, valida Docker/Compose, sobe a stack, aguarda readiness e mostra acessos.

2) Segurança e HTTPS (opcional)
```bash
./setup-security.sh
```
Configura UFW, Basic Auth, Certbot, logrotate e watchdog.

3) Gestão local (dev) da stack
```bash
./monitoring-setup.sh start
./monitoring-setup.sh status
./monitoring-setup.sh logs
./monitoring-setup.sh stop
```

4) Backup de dashboards
```bash
./backup-monitoring.sh
```

5) Ajuste de domínios Nginx
```bash
./configure-domains.sh
```

## Troubleshooting
- Grafana não vê Prometheus: datasource `http://prometheus:9090` e ambos na rede `monitoring`.
- Prometheus não scrapeia a API: target `host.docker.internal:3333` e `extra_hosts: ["host.docker.internal:host-gateway"]` no serviço `prometheus`.
- Logs “somem” no Grafana: ajuste range/refresh; datasource Loki com `maxLines`/`timeout` altos.
- Loki “too many outstanding requests”: reduza período da query; filtre por labels antes de `| json`.



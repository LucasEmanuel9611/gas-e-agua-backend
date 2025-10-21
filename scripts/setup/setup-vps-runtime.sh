#!/bin/bash

set -e

echo "🚀 Setup VPS Runtime-Only (Sem Código-Fonte)"
echo "=============================================="
echo ""

VPS_USER=${1:-deploy}
VPS_HOST=${2}

if [ -z "$VPS_HOST" ]; then
  echo "❌ Erro: VPS_HOST não fornecido"
  echo ""
  echo "Uso: $0 [usuario] <vps-host>"
  echo "Exemplo: $0 deploy 69.62.89.65"
  exit 1
fi

echo "📋 Configuração:"
echo "  - Usuário: $VPS_USER"
echo "  - Host: $VPS_HOST"
echo ""

read -p "Continuar? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Cancelado"
  exit 0
fi

echo ""
echo "🔧 Criando estrutura de diretórios na VPS..."

ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
  set -e
  
  # Criar diretórios
  mkdir -p ~/gas-e-agua-backend/{scripts/deploy,monitoring/data/{prometheus,loki,grafana,alertmanager},logs}
  mkdir -p ~/backups/{dev,prd}
  
  echo "✅ Diretórios criados"
EOF

echo ""
echo "📦 Copiando arquivos de configuração..."

# Copiar docker-compose files
scp docker-compose.dev.yml ${VPS_USER}@${VPS_HOST}:~/gas-e-agua-backend/
scp docker-compose.app.yml ${VPS_USER}@${VPS_HOST}:~/gas-e-agua-backend/
scp docker-compose.monitoring-dev.yml ${VPS_USER}@${VPS_HOST}:~/gas-e-agua-backend/
scp docker-compose.monitoring-prd.yml ${VPS_USER}@${VPS_HOST}:~/gas-e-agua-backend/

echo "✅ Docker Compose files copiados"

# Copiar scripts essenciais
scp scripts/deploy/deploy.sh ${VPS_USER}@${VPS_HOST}:~/gas-e-agua-backend/scripts/deploy/
scp scripts/deploy/backup-db.sh ${VPS_USER}@${VPS_HOST}:~/gas-e-agua-backend/scripts/deploy/
scp scripts/deploy/rollback.sh ${VPS_USER}@${VPS_HOST}:~/gas-e-agua-backend/scripts/deploy/
scp scripts/deploy/cleanup-old-versions.sh ${VPS_USER}@${VPS_HOST}:~/gas-e-agua-backend/scripts/deploy/

echo "✅ Scripts essenciais copiados"

# Copiar arquivos Prisma (necessários para migrations)
scp -r prisma ${VPS_USER}@${VPS_HOST}:~/gas-e-agua-backend/

echo "✅ Prisma schema copiado"

# Dar permissão de execução
ssh ${VPS_USER}@${VPS_HOST} << 'EOF'
  chmod +x ~/gas-e-agua-backend/scripts/deploy/*.sh
  echo "✅ Permissões configuradas"
EOF

echo ""
echo "⚙️  PRÓXIMO PASSO: Configurar variáveis de ambiente"
echo ""
echo "Na VPS, crie os arquivos:"
echo "  - ~/gas-e-agua-backend/.env.dev"
echo "  - ~/gas-e-agua-backend/.env"
echo ""
echo "Você pode copiar dos exemplos ou editar manualmente:"
echo "  ssh ${VPS_USER}@${VPS_HOST}"
echo "  cd ~/gas-e-agua-backend"
echo "  nano .env.dev"
echo "  nano .env"
echo ""
echo "✅ Setup inicial concluído!"
echo ""
echo "🚀 Próximo: Configure secrets no GitHub e rode o deploy via GitHub Actions"


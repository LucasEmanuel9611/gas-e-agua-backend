#!/bin/bash

set -e

echo "🔐 Secrets Rotation Tool"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "⚠️  Este script ajuda a gerar novos secrets fortes."
echo "    Você precisará atualizar manualmente no GitHub:"
echo "    Settings > Secrets and variables > Actions"
echo ""

ENV=${1:-dev}

if [ "$ENV" != "dev" ] && [ "$ENV" != "prd" ]; then
  echo "❌ Ambiente inválido. Use: dev ou prd"
  exit 1
fi

echo "📋 Rotacionando secrets para: $ENV"
echo ""

read -p "Continuar? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
  echo "❌ Cancelado"
  exit 0
fi

echo ""
echo "🔑 Gerando novos secrets..."
echo ""

# Função para gerar senha forte
generate_password() {
  openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Função para gerar JWT secret
generate_jwt() {
  openssl rand -hex 64
}

# Gerar secrets
MYSQL_ROOT_PASSWORD=$(generate_password)
MYSQL_PASSWORD=$(generate_password)
JWT_SECRET=$(generate_jwt)
GRAFANA_ADMIN_PASSWORD=$(generate_password)
GRAFANA_SECRET_KEY=$(generate_password)

# Exibir secrets gerados
ENV_SUFFIX=$(echo "$ENV" | tr '[:lower:]' '[:upper:]')

echo "════════════════════════════════════════════════════════════"
echo "  Novos Secrets Gerados para $ENV_SUFFIX"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "📋 Adicione estes secrets no GitHub:"
echo "   Settings > Secrets and variables > Actions > New secret"
echo ""
echo "MYSQL_ROOT_PASSWORD_${ENV_SUFFIX}:"
echo "  $MYSQL_ROOT_PASSWORD"
echo ""
echo "MYSQL_PASSWORD_${ENV_SUFFIX}:"
echo "  $MYSQL_PASSWORD"
echo ""
echo "JWT_SECRET_${ENV_SUFFIX}:"
echo "  $JWT_SECRET"
echo ""
echo "GRAFANA_ADMIN_PASSWORD_${ENV_SUFFIX}:"
echo "  $GRAFANA_ADMIN_PASSWORD"
echo ""
echo "GRAFANA_SECRET_KEY_${ENV_SUFFIX}:"
echo "  $GRAFANA_SECRET_KEY"
echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Salvar em arquivo temporário (para copiar/colar)
TEMP_FILE="/tmp/secrets-${ENV}-$(date +%Y%m%d-%H%M%S).txt"
cat > "$TEMP_FILE" << EOF
# Secrets gerados em $(date)
# Ambiente: $ENV

MYSQL_ROOT_PASSWORD_${ENV_SUFFIX}=$MYSQL_ROOT_PASSWORD
MYSQL_PASSWORD_${ENV_SUFFIX}=$MYSQL_PASSWORD
JWT_SECRET_${ENV_SUFFIX}=$JWT_SECRET
GRAFANA_ADMIN_PASSWORD_${ENV_SUFFIX}=$GRAFANA_ADMIN_PASSWORD
GRAFANA_SECRET_KEY_${ENV_SUFFIX}=$GRAFANA_SECRET_KEY

# Próximos passos:
# 1. Adicionar cada secret no GitHub (Settings > Secrets)
# 2. Fazer deploy para aplicar
# 3. Deletar este arquivo: rm $TEMP_FILE
EOF

echo "💾 Secrets salvos em: $TEMP_FILE"
echo ""
echo "📝 Próximos passos:"
echo ""
echo "1. Adicionar secrets no GitHub:"
echo "   https://github.com/\$OWNER/\$REPO/settings/secrets/actions"
echo ""
echo "2. Fazer deploy:"
echo "   - Actions > Deploy to VPS ($ENV_SUFFIX) > Run workflow"
echo ""
echo "3. Verificar health:"
echo "   curl http://\$VPS_IP:\$PORT/health"
echo ""
echo "4. Deletar arquivo temporário:"
echo "   rm $TEMP_FILE"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   - JWT_SECRET: Invalida todas as sessões ativas"
echo "   - MYSQL_PASSWORD: Requer recriar usuário no banco"
echo ""
echo "✅ Rotação de secrets concluída!"


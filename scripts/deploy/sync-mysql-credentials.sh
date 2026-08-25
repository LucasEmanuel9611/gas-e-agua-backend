#!/bin/bash

set -euo pipefail

ENV=${1:-}

if [ -z "$ENV" ]; then
  echo "Uso: $0 [dev|prd]"
  echo "Variáveis obrigatórias:"
  echo "  MYSQL_ROOT_PASSWORD_CURRENT  senha root atual no MySQL"
  echo "  MYSQL_ROOT_PASSWORD_NEW      nova senha root"
  echo "  MYSQL_PASSWORD_NEW           nova senha do usuário da aplicação"
  echo "  MYSQL_USER                   usuário da aplicação"
  echo "  MYSQL_DATABASE               nome do banco"
  exit 1
fi

if [ "$ENV" = "dev" ]; then
  MYSQL_CONTAINER="gas-e-agua-mysql-dev"
elif [ "$ENV" = "prd" ]; then
  MYSQL_CONTAINER="gas-e-agua-mysql"
else
  echo "❌ Ambiente inválido: $ENV (use dev ou prd)"
  exit 1
fi

required_variables=(
  MYSQL_ROOT_PASSWORD_CURRENT
  MYSQL_ROOT_PASSWORD_NEW
  MYSQL_PASSWORD_NEW
  MYSQL_USER
  MYSQL_DATABASE
)

for variable_name in "${required_variables[@]}"; do
  if [ -z "${!variable_name:-}" ]; then
    echo "❌ Variável obrigatória ausente: $variable_name"
    exit 1
  fi
done

escape_sql_literal() {
  printf "%s" "$1" | sed "s/'/''/g"
}

escaped_root_password_new=$(escape_sql_literal "$MYSQL_ROOT_PASSWORD_NEW")
escaped_app_password_new=$(escape_sql_literal "$MYSQL_PASSWORD_NEW")
escaped_mysql_user=$(escape_sql_literal "$MYSQL_USER")
escaped_mysql_database=$(escape_sql_literal "$MYSQL_DATABASE")

if ! docker ps --format '{{.Names}}' | grep -qx "$MYSQL_CONTAINER"; then
  echo "❌ Container $MYSQL_CONTAINER não está em execução"
  exit 1
fi

echo "🔐 Sincronizando credenciais MySQL no ambiente: $ENV"
echo "   Container: $MYSQL_CONTAINER"
echo "   Usuário app: $MYSQL_USER"
echo "   Database: $MYSQL_DATABASE"

echo "🔌 Validando senha root atual..."
if ! docker exec "$MYSQL_CONTAINER" mysql \
  --user=root \
  --password="$MYSQL_ROOT_PASSWORD_CURRENT" \
  -e "SELECT 1;" > /dev/null 2>&1; then
  echo "❌ Senha root atual inválida para $MYSQL_CONTAINER"
  exit 1
fi

echo "📤 Aplicando novas senhas (root + usuário da app)..."
docker exec -i "$MYSQL_CONTAINER" mysql \
  --user=root \
  --password="$MYSQL_ROOT_PASSWORD_CURRENT" <<SQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '${escaped_root_password_new}';
CREATE USER IF NOT EXISTS 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${escaped_root_password_new}';
ALTER USER 'root'@'%' IDENTIFIED WITH mysql_native_password BY '${escaped_root_password_new}';
ALTER USER IF EXISTS '${escaped_mysql_user}'@'%' IDENTIFIED WITH mysql_native_password BY '${escaped_app_password_new}';
CREATE USER IF NOT EXISTS '${escaped_mysql_user}'@'%' IDENTIFIED WITH mysql_native_password BY '${escaped_app_password_new}';
GRANT ALL PRIVILEGES ON \`${escaped_mysql_database}\`.* TO '${escaped_mysql_user}'@'%';
FLUSH PRIVILEGES;
SQL

echo "🔌 Validando nova senha root..."
if ! docker exec "$MYSQL_CONTAINER" mysql \
  --user=root \
  --password="$MYSQL_ROOT_PASSWORD_NEW" \
  -e "USE \`${MYSQL_DATABASE}\`; SELECT 1;" > /dev/null 2>&1; then
  echo "❌ Falha ao validar nova senha root após sync"
  exit 1
fi

echo "✅ Credenciais MySQL sincronizadas com sucesso"

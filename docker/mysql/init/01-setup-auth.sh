#!/bin/bash
set -e

echo "🔐 Configurando autenticação do MySQL..."

if [ -z "$MYSQL_USER" ] || [ -z "$MYSQL_PASSWORD" ]; then
  echo "⚠️  MYSQL_USER ou MYSQL_PASSWORD não definidos, pulando configuração"
  exit 0
fi

mysql -uroot -p"$MYSQL_ROOT_PASSWORD" <<-EOSQL
  ALTER USER IF EXISTS '${MYSQL_USER}'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_PASSWORD}';
  CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%' IDENTIFIED WITH mysql_native_password BY '${MYSQL_PASSWORD}';
  GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
  FLUSH PRIVILEGES;
  SELECT User, Host, plugin FROM mysql.user WHERE User = '${MYSQL_USER}';
EOSQL

echo "✅ Usuário ${MYSQL_USER} configurado com mysql_native_password"

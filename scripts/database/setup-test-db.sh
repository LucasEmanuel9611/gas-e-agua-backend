#!/bin/bash

set -e

if [ -f ".env.test" ]; then
  set -a
  source .env.test
  set +a
fi

TEST_DATABASE_NAME="${TEST_DATABASE_NAME:-gas_e_agua_test}"
MYSQL_HOST="${MYSQL_HOST:-127.0.0.1}"
MYSQL_PORT="${MYSQL_PORT:-3308}"
MYSQL_ROOT_PASSWORD="${MYSQL_ROOT_PASSWORD:-root123}"
MYSQL_USER="${MYSQL_USER:-gas_e_agua}"

echo "Creating test database ${TEST_DATABASE_NAME} if needed..."

mysql -h "${MYSQL_HOST}" -P "${MYSQL_PORT}" -u root -p"${MYSQL_ROOT_PASSWORD}" <<-EOSQL
  CREATE DATABASE IF NOT EXISTS \`${TEST_DATABASE_NAME}\`;
  GRANT ALL PRIVILEGES ON \`${TEST_DATABASE_NAME}\`.* TO '${MYSQL_USER}'@'%';
  FLUSH PRIVILEGES;
EOSQL

echo "Test database ${TEST_DATABASE_NAME} is ready"

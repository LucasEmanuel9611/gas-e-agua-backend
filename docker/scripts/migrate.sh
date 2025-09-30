#!/bin/bash

# Script para executar migrações do Prisma no container
echo "🔄 Executando migrações do Prisma..."

# Aguardar o banco estar disponível
echo "⏳ Aguardando MySQL estar disponível..."
until npx prisma db push --accept-data-loss; do
  echo "MySQL não está disponível ainda - aguardando..."
  sleep 2
done

echo "✅ Migrações executadas com sucesso!"
echo "🌱 Executando seed do banco..."

# Executar seed se existir
if [ -f "src/shared/infra/database/seed.ts" ]; then
  npm run prisma:seed
  echo "✅ Seed executado com sucesso!"
else
  echo "ℹ️  Nenhum seed encontrado, pulando..."
fi

echo "🎉 Setup do banco concluído!"

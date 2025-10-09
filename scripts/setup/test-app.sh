#!/bin/bash

echo "🔍 Verificando status dos containers..."
docker compose -f docker-compose.app.yml --env-file .env.docker ps

echo ""
echo "🔍 Testando aplicação..."
curl -s http://localhost:3333/health || echo "❌ Aplicação não está respondendo"

echo ""
echo "🔍 Logs da aplicação (últimas 10 linhas)..."
docker logs gas-e-agua-app --tail=10 2>/dev/null || echo "❌ Container não encontrado"

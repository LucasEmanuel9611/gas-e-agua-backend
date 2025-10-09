#!/bin/bash

set -e

if [ -f "dist/shared/infra/database/seed.js" ]; then
  echo "🌱 Running seed (production mode)..."
  node dist/shared/infra/database/seed.js
elif [ -f "src/shared/infra/database/seed.ts" ]; then
  echo "🌱 Running seed (development mode)..."
  npx ts-node src/shared/infra/database/seed.ts
else
  echo "❌ Seed file not found!"
  exit 1
fi


#!/bin/sh
set -e

echo "→ Applying database migrations..."
npx prisma migrate deploy

if [ "$SEED_ON_START" = "true" ]; then
  echo "→ Seeding demo data (SEED_ON_START=true)..."
  npx prisma db seed || echo "⚠ Seed skipped/failed (continuing)"
fi

echo "→ Starting Cloud PMS API..."
exec node dist/main.js

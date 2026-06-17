#!/usr/bin/env bash
# =============================================================================
# Cloud PMS — remote deploy script (runs ON the DigitalOcean droplet).
#
# Invoked by .github/workflows/deploy.yml after the repository has been rsynced
# to /opt/cloud-pms. Idempotent and safe to run on every deploy.
#
# It will, in order:
#   1. Create a swapfile on small droplets so the build doesn't OOM.
#   2. Install Docker Engine + Compose plugin if missing.
#   3. Generate a strong .env with random secrets on the FIRST deploy only,
#      then reuse it (so secrets stay stable across deploys).
#   4. Build and (re)start the whole stack behind the Caddy reverse proxy.
#   5. Smoke-test the API through the proxy.
# =============================================================================
set -euo pipefail

APP_DIR="/opt/cloud-pms"
COMPOSE_FILE="docker-compose.prod.yml"
PUBLIC_URL="${PUBLIC_URL:-http://168.144.41.111}"

cd "$APP_DIR"

log() { printf '\n\033[1;34m▶ %s\033[0m\n' "$*"; }

# --- 1. Ensure some swap so building Next.js/Nest won't OOM on a small droplet
if [ "$(awk '/SwapTotal/{print $2}' /proc/meminfo)" = "0" ]; then
  MEM_KB=$(awk '/MemTotal/{print $2}' /proc/meminfo)
  if [ "${MEM_KB:-0}" -lt 2097152 ]; then
    log "Low memory and no swap detected — creating a 2G swapfile"
    fallocate -l 2G /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  fi
fi

# --- 2. Ensure Docker + Compose plugin are installed and running
if ! command -v docker >/dev/null 2>&1; then
  log "Installing Docker Engine"
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker >/dev/null 2>&1 || true
if ! docker compose version >/dev/null 2>&1; then
  echo "ERROR: Docker Compose plugin is not available on this host." >&2
  exit 1
fi

# --- 3. Generate .env with strong secrets on first deploy; reuse it afterwards
FIRST_RUN=0
if [ ! -f .env ]; then
  log "First deploy — generating .env with random production secrets"
  FIRST_RUN=1
  umask 077
  cat > .env <<EOF
# Cloud PMS production secrets — generated $(date -u +%FT%TZ). Keep this private.
POSTGRES_USER=pms
POSTGRES_PASSWORD=$(openssl rand -hex 24)
POSTGRES_DB=cloudpms
JWT_ACCESS_SECRET=$(openssl rand -hex 32)
JWT_REFRESH_SECRET=$(openssl rand -hex 32)
JWT_ACCESS_TTL=900
JWT_REFRESH_TTL=604800
ENCRYPTION_KEY=$(openssl rand -hex 32)
PUBLIC_URL=${PUBLIC_URL}
NEXT_PUBLIC_API_URL=${PUBLIC_URL}
CORS_ORIGINS=${PUBLIC_URL}
# Seed demo data on the very first boot so the system is browsable immediately.
SEED_ON_START=true
EOF
fi

# --- 4. Build and (re)start the stack
log "Building and starting containers"
docker compose -f "$COMPOSE_FILE" --env-file .env up -d --build --remove-orphans

# --- 5. After a successful first run, stop re-seeding on later deploys
if [ "$FIRST_RUN" = "1" ]; then
  sed -i 's/^SEED_ON_START=true/SEED_ON_START=false/' .env
fi

# --- 6. Tidy up dangling images
docker image prune -f >/dev/null 2>&1 || true

log "Container status"
docker compose -f "$COMPOSE_FILE" ps

# --- 7. Smoke test through the proxy
log "Waiting for the API to report healthy (through Caddy on :80)…"
for i in $(seq 1 40); do
  if curl -fsS "http://localhost/health/live" >/dev/null 2>&1; then
    echo "✅ API healthy and reachable through the proxy."
    break
  fi
  sleep 3
  if [ "$i" = "40" ]; then
    echo "⚠ API did not report healthy within the timeout."
    echo "  Check logs with: docker compose -f $COMPOSE_FILE logs --tail=100 api"
  fi
done

log "Deploy complete → ${PUBLIC_URL}"

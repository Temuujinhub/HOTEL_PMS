# Deploy to DigitalOcean via GitHub Actions

This repo ships a one-click (and automatic) deploy to a DigitalOcean droplet.
The **Deploy** workflow copies the code to the server over SSH, builds the
Docker images there, and starts the whole stack behind a Caddy reverse proxy on
port **80**.

```
Browser ──80──▶ Caddy ──┬─▶ web  (Next.js)        http://SERVER/
                        └─▶ api  (NestJS)         http://SERVER/api/*  ·  /api/docs
                              │
                        Postgres + Redis  (internal Docker network only)
```

Only ports **22** (SSH) and **80** (HTTP) are exposed. Postgres, Redis, the API
and the web app are never published to the internet.

---

## What you need to do once (≈5 minutes)

### 1. Create an SSH key for deploys and put it on the droplet

On your laptop:

```bash
# 1. Generate a dedicated keypair (no passphrase, so CI can use it)
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ./cloudpms_deploy -N ""

# 2. Install the PUBLIC key on the droplet (you'll be asked for the root password)
ssh-copy-id -i ./cloudpms_deploy.pub root@168.144.41.111
#   …or manually:
#   ssh root@168.144.41.111 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys" < ./cloudpms_deploy.pub
```

### 2. Add the PRIVATE key as a GitHub secret

GitHub repo → **Settings → Secrets and variables → Actions → New repository secret**

| Name | Value |
|------|-------|
| `DEPLOY_SSH_KEY` | the **entire** contents of the `cloudpms_deploy` file (the private key, including the `-----BEGIN/END OPENSSH PRIVATE KEY-----` lines) |

```bash
cat ./cloudpms_deploy   # copy this whole output into the secret
```

That is the **only** secret you must add. All application secrets (DB password,
JWT secrets, encryption key) are generated automatically on the server the first
time it deploys, and reused afterwards.

### 3. (Optional) Override defaults with repository *variables*

Defaults are already correct for your server, so you can skip this. To change
them: **Settings → Secrets and variables → Actions → Variables**.

| Variable | Default | Meaning |
|----------|---------|---------|
| `DEPLOY_HOST` | `168.144.41.111` | droplet IP or hostname |
| `DEPLOY_USER` | `root` | SSH user |
| `DEPLOY_SSH_PORT` | `22` | SSH port |

---

## Run the deploy

- **Manually:** GitHub repo → **Actions → Deploy → Run workflow**.
- **Automatically:** every push to `main` (e.g. when you merge a PR) triggers it.

The job will: install Docker on the droplet if needed → sync the code → build
the images → run database migrations → seed the two demo tenants on first boot →
start everything → smoke-test the API. First run takes a few minutes (image
builds); later runs are faster.

When it finishes, open:

- **App:** http://168.144.41.111
- **API docs (Swagger):** http://168.144.41.111/api/docs

### Demo logins (seeded on first deploy, password `Passw0rd!`)

| Email | Business (tenant) | Role |
|-------|-------------------|------|
| `owner@demo.cloudpms.app` | Grand Aurora Hotel | Owner |
| `frontdesk@demo.cloudpms.app` | Grand Aurora Hotel | Front Desk |
| `owner@seaside.cloudpms.app` | Seaside Boutique Inn | Owner |

The two separate businesses demonstrate multi-tenant isolation: each only sees
its own data. New businesses can self-register from the sign-up page.

---

## Day-2 operations

SSH in with `ssh -i ./cloudpms_deploy root@168.144.41.111`, then:

```bash
cd /opt/cloud-pms

# Logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web

# Status / restart
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml restart api

# The generated secrets live here (keep private):
cat .env
```

### Add a domain + HTTPS later

1. Point an A record at `168.144.41.111`.
2. In `deploy/Caddyfile`, replace the `:80 { … }` block's address `:80` with
   `your-domain.com` and remove `auto_https off`.
3. In `/opt/cloud-pms/.env` set `PUBLIC_URL`, `NEXT_PUBLIC_API_URL` and
   `CORS_ORIGINS` to `https://your-domain.com`.
4. Open port 443 and re-run the Deploy workflow. Caddy will obtain a Let's
   Encrypt certificate automatically.

### Reset / re-seed demo data

```bash
cd /opt/cloud-pms
# wipe the database volume and re-seed on next boot
docker compose -f docker-compose.prod.yml down
docker volume rm cloudpms_pgdata
sed -i 's/^SEED_ON_START=false/SEED_ON_START=true/' .env
docker compose -f docker-compose.prod.yml --env-file .env up -d --build
```

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Workflow fails at *Configure SSH key* | The `DEPLOY_SSH_KEY` secret is missing or not the full private key. |
| `Permission denied (publickey)` | The matching **public** key isn't in the droplet's `~/.ssh/authorized_keys`, or `DEPLOY_USER` is wrong. |
| Build killed / OOM on a 1 GB droplet | The script auto-creates a 2 GB swapfile; if it still fails, resize the droplet to ≥ 2 GB RAM. |
| Site loads but API calls fail | Check `docker compose -f docker-compose.prod.yml logs api`; ensure `.env` has the secrets (regenerated automatically if you delete it). |

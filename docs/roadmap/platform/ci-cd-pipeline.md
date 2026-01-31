# CI/CD Pipeline & Development Environment

> **Status:** 📋 Planned
> **Priority:** High - Required for MVP development and deployment
> **Category:** Platform Infrastructure

---

## Dependencies

- **Requires:**
  - GitHub repository
  - Node.js 18+
  - Docker (for local PostgreSQL)

- **Enables:**
  - Automated testing
  - Preview deployments
  - Production deployments
  - Team collaboration

---

## Roadmap Position

- **Tier:** 1 (MVP Completion)
- **Phase:** MVP
- **Category:** Platform Infrastructure

---

## Overview

A phased approach to CI/CD that starts fully local ($0) and scales to cloud as needed.

```
PHASE 1: LOCAL           PHASE 2: FREE CLOUD      PHASE 3: PAID CLOUD
($0)                     ($0)                      ($5+/mo)

┌─────────────┐          ┌─────────────┐          ┌─────────────┐
│ PostgreSQL  │          │ Neon        │          │ Neon/Railway│
│ (Docker)    │    →     │ (free tier) │    →     │ (paid)      │
├─────────────┤          ├─────────────┤          ├─────────────┤
│ Backend     │          │ Render      │          │ Railway     │
│ (localhost) │    →     │ (free tier) │    →     │ ($5/mo)     │
├─────────────┤          ├─────────────┤          ├─────────────┤
│ Frontends   │          │ Vercel      │          │ Vercel      │
│ (localhost) │    →     │ (free tier) │    →     │ (free/paid) │
├─────────────┤          ├─────────────┤          ├─────────────┤
│ Git hooks   │          │ GitHub      │          │ GitHub      │
│ (Husky)     │    →     │ Actions     │    →     │ Actions     │
└─────────────┘          └─────────────┘          └─────────────┘

Solo dev, demos         External testers        Real users
```

---

## Phase 1: Local Development ($0)

### Architecture

```
YOUR MACHINE
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─────────────────┐     ┌─────────────────┐                       │
│  │   PostgreSQL    │     │     Backend     │                       │
│  │   (Docker)      │◄───►│   Express API   │                       │
│  │   Port 5432     │     │   Port 3000     │                       │
│  └─────────────────┘     └────────┬────────┘                       │
│                                   │                                 │
│              ┌────────────────────┼────────────────────┐           │
│              │                    │                    │           │
│              ▼                    ▼                    ▼           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐    │
│  │  customer-app   │  │   staff-app     │  │   admin-app     │    │
│  │   Port 5173     │  │   Port 5174     │  │   Port 5175     │    │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘    │
│                                                                     │
│  Git Hooks (Husky):                                                │
│  • pre-commit: lint + typecheck                                    │
│  • pre-push: run tests                                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Docker Compose Setup

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: lootly-postgres
    environment:
      POSTGRES_USER: lootly
      POSTGRES_PASSWORD: lootly_dev_password
      POSTGRES_DB: lootly
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U lootly"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Optional: Redis for sessions/caching (add when needed)
  # redis:
  #   image: redis:7-alpine
  #   container_name: lootly-redis
  #   ports:
  #     - "6379:6379"

volumes:
  postgres_data:
```

### Environment Files

Create `.env.example` (committed to git):

```bash
# Database
DATABASE_URL=postgresql://lootly:lootly_dev_password@localhost:5432/lootly

# Backend
PORT=3000
NODE_ENV=development
JWT_SECRET=dev-secret-change-in-production

# SMS (use test mode locally)
SMS_PROVIDER=console  # Logs to console instead of sending
# SMS_PROVIDER=twilio
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=

# AI Services (optional for local dev)
# OPENAI_API_KEY=

# Frontend URLs
CUSTOMER_APP_URL=http://localhost:5173
STAFF_APP_URL=http://localhost:5174
ADMIN_APP_URL=http://localhost:5175
```

Create `.env` (not committed, copy from .env.example):

```bash
cp .env.example .env
# Edit with your local values
```

### Git Hooks Setup (Local CI)

Install and configure Husky:

```bash
# Install dependencies
npm install -D husky lint-staged

# Initialize Husky
npx husky init
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged (only on staged files)
npx lint-staged
```

Create `.husky/pre-push`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "Running tests before push..."
npm test

if [ $? -ne 0 ]; then
  echo "Tests failed. Push aborted."
  exit 1
fi

echo "All tests passed!"
```

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write"
    ]
  },
  "scripts": {
    "dev": "npm-run-all --parallel dev:*",
    "dev:backend": "cd backend && npm run dev",
    "dev:customer": "cd customer-app && npm run dev",
    "dev:staff": "cd staff-app && npm run dev",
    "dev:admin": "cd admin-app && npm run dev",
    "test": "npm-run-all test:*",
    "test:backend": "cd backend && npm test",
    "lint": "npm-run-all lint:*",
    "lint:backend": "cd backend && npm run lint",
    "lint:customer": "cd customer-app && npm run lint",
    "lint:staff": "cd staff-app && npm run lint",
    "lint:admin": "cd admin-app && npm run lint",
    "typecheck": "npm-run-all typecheck:*",
    "typecheck:backend": "cd backend && npm run typecheck",
    "build": "npm-run-all build:*",
    "build:backend": "cd backend && npm run build",
    "build:customer": "cd customer-app && npm run build",
    "build:staff": "cd staff-app && npm run build",
    "build:admin": "cd admin-app && npm run build",
    "db:start": "docker-compose up -d postgres",
    "db:stop": "docker-compose down",
    "db:reset": "docker-compose down -v && docker-compose up -d postgres",
    "db:push": "cd backend && npm run db:push",
    "db:seed": "cd backend && npm run seed"
  }
}
```

### Development Workflow

```bash
# 1. Start database
npm run db:start

# 2. Push schema (first time or after changes)
npm run db:push

# 3. Seed data (optional)
npm run db:seed

# 4. Start all apps
npm run dev

# Apps running at:
# - Backend:      http://localhost:3000
# - Customer:     http://localhost:5173
# - Staff:        http://localhost:5174
# - Admin:        http://localhost:5175

# 5. Make changes, commit (hooks run automatically)
git add .
git commit -m "Your message"  # Runs lint + typecheck

# 6. Push (runs tests)
git push  # Runs full test suite
```

### Quick Commands Reference

```bash
# Database
npm run db:start          # Start PostgreSQL container
npm run db:stop           # Stop container (keeps data)
npm run db:reset          # Reset database (lose data)
npm run db:push           # Push schema changes
npm run db:seed           # Seed test data

# Development
npm run dev               # Start everything
npm run dev:backend       # Backend only
npm run dev:customer      # Customer app only

# Quality
npm run lint              # Lint all projects
npm run typecheck         # TypeScript check all
npm run test              # Run all tests

# Build
npm run build             # Build all for production
```

---

## Phase 2: Free Cloud Tiers ($0)

When you need external access (demos, testers, staging).

### Architecture

```
GITHUB                           FREE CLOUD SERVICES
┌──────────────────┐            ┌──────────────────────────────────┐
│                  │            │                                  │
│  Push to PR      │───────────►│  Vercel (auto-preview)          │
│                  │            │  └── customer-app preview URL    │
│                  │            │  └── staff-app preview URL       │
│                  │            │  └── admin-app preview URL       │
│                  │            │                                  │
│  Merge to main   │───────────►│  Vercel (production)            │
│                  │            │  └── customer.yourapp.com        │
│                  │            │  └── staff.yourapp.com           │
│                  │            │  └── admin.yourapp.com           │
│                  │            │                                  │
│  GitHub Actions  │───────────►│  Render (backend)               │
│  (2000 min/mo)   │            │  └── api.yourapp.com             │
│                  │            │  └── Sleeps after 15min idle     │
│                  │            │                                  │
│                  │            │  Neon (database)                 │
│                  │            │  └── PostgreSQL serverless       │
│                  │            │  └── Auto-suspend when idle      │
│                  │            │                                  │
└──────────────────┘            └──────────────────────────────────┘
```

### Service Setup

#### 1. Neon (PostgreSQL)

```
1. Go to https://neon.tech
2. Sign up with GitHub
3. Create project "lootly"
4. Copy connection string
5. Add to GitHub Secrets as DATABASE_URL
```

#### 2. Vercel (Frontends)

```
1. Go to https://vercel.com
2. Sign up with GitHub
3. Import repository
4. Configure 3 projects:
   - customer-app (Root: customer-app)
   - staff-app (Root: staff-app)
   - admin-app (Root: admin-app)
5. Environment variables (per project):
   - VITE_API_URL: https://your-backend.onrender.com
```

Vercel settings per app:

```
Project: lootly-customer
├── Framework: Vite
├── Root Directory: customer-app
├── Build Command: npm run build
├── Output Directory: dist
└── Install Command: npm install

Project: lootly-staff
├── Root Directory: staff-app
└── (same settings)

Project: lootly-admin
├── Root Directory: admin-app
└── (same settings)
```

#### 3. Render (Backend)

```
1. Go to https://render.com
2. Sign up with GitHub
3. New Web Service
4. Connect repository
5. Configure:
   - Name: lootly-api
   - Root Directory: backend
   - Build Command: npm install && npm run build
   - Start Command: npm start
6. Environment variables:
   - DATABASE_URL: (from Neon)
   - NODE_ENV: production
   - JWT_SECRET: (generate secure random)
   - (other secrets)
```

### GitHub Actions Workflows

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install workspace dependencies
        run: |
          cd backend && npm ci
          cd ../customer-app && npm ci
          cd ../staff-app && npm ci
          cd ../admin-app && npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: lootly
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: lootly_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci

      - name: Run migrations
        run: cd backend && npm run db:push
        env:
          DATABASE_URL: postgresql://lootly:test_password@localhost:5432/lootly_test

      - name: Run tests
        run: npm run test
        env:
          DATABASE_URL: postgresql://lootly:test_password@localhost:5432/lootly_test
          NODE_ENV: test
          JWT_SECRET: test-secret

  build:
    runs-on: ubuntu-latest
    needs: test

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci
          cd ../customer-app && npm ci
          cd ../staff-app && npm ci
          cd ../admin-app && npm ci

      - name: Build all
        run: npm run build

      - name: Upload backend build
        uses: actions/upload-artifact@v4
        with:
          name: backend-build
          path: backend/dist

      - name: Upload frontend builds
        uses: actions/upload-artifact@v4
        with:
          name: frontend-builds
          path: |
            customer-app/dist
            staff-app/dist
            admin-app/dist
```

Create `.github/workflows/deploy-production.yml`:

```yaml
name: Deploy Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Render Deploy
        run: |
          curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}

  # Vercel auto-deploys on push to main, but you can add notification
  notify:
    runs-on: ubuntu-latest
    needs: deploy-backend
    steps:
      - name: Deployment notification
        run: |
          echo "Production deployment triggered!"
          # Add Slack/Discord notification here if desired
```

### Environment Variables Management

GitHub Secrets to configure:

```
Repository Settings → Secrets and variables → Actions

Secrets:
├── DATABASE_URL          # Neon connection string
├── JWT_SECRET            # Production JWT secret
├── RENDER_DEPLOY_HOOK    # Render deploy webhook URL
├── TWILIO_ACCOUNT_SID    # SMS provider
├── TWILIO_AUTH_TOKEN
├── TWILIO_PHONE_NUMBER
├── OPENAI_API_KEY        # For AI features
└── ...
```

### Free Tier Limitations

| Service | Free Limit | Impact | Solution |
|---------|------------|--------|----------|
| **Render** | Sleeps after 15min | First request slow (~30s) | Upgrade to $7/mo or use Railway |
| **Neon** | 0.5GB storage | Enough for MVP | Upgrade when needed |
| **Vercel** | 100GB bandwidth | Plenty for MVP | Monitor usage |
| **GitHub Actions** | 2000 min/month | Run tests locally with hooks | Use `act` for local runs |

---

## Phase 3: Paid Cloud ($5+/mo)

When you have real users who can't wait for cold starts.

### Upgrade Path

```
FREE                          PAID
────────────────────────────────────────────────────────
Render (free)          →      Railway ($5/mo)
└── Sleeps                    └── Always on
                              └── Better DX
                              └── Built-in Postgres option

Neon (free)            →      Neon Pro ($19/mo) or Railway Postgres
└── 0.5GB                     └── More storage
└── Auto-suspend              └── Always on

Vercel (free)          →      Vercel Pro ($20/mo) if needed
└── Usually fine              └── More bandwidth
                              └── Team features
```

### Railway Setup (Recommended for Backend)

```
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select backend directory
5. Railway auto-detects Node.js
6. Add environment variables
7. Railway provides:
   - Auto-deploy on push
   - Built-in PostgreSQL option
   - Always-on (no cold starts)
   - Logs and monitoring
```

Railway `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### Production Checklist

```
Before going live:

Security:
├── [ ] All secrets in environment variables (not code)
├── [ ] JWT_SECRET is cryptographically random
├── [ ] HTTPS only (Vercel/Railway handle this)
├── [ ] Rate limiting on API
├── [ ] CORS configured correctly

Database:
├── [ ] Connection pooling enabled
├── [ ] Backups configured
├── [ ] Indexes on frequently queried columns

Monitoring:
├── [ ] Error tracking (Sentry free tier)
├── [ ] Uptime monitoring (UptimeRobot free)
├── [ ] Log aggregation (Railway/Render built-in)

Performance:
├── [ ] Frontend assets cached (Vercel handles)
├── [ ] API responses cached where appropriate
├── [ ] Database queries optimized
```

---

## Branch Strategy

```
main (production)
  │
  ├── Auto-deploys to production
  │
develop (staging) [optional]
  │
  ├── Auto-deploys to staging environment
  │
feature/xyz
  │
  ├── Preview deployments on Vercel
  ├── CI runs tests
  └── Merge via PR to develop/main
```

### For Solo Developer (MVP)

Keep it simple:

```
main
  │
  ├── Everything merges here via PR
  ├── Auto-deploys to production
  ├── CI runs on every PR
  └── Local development branches
```

### When You Add Team Members

Add develop branch:

```
main (production)
  ↑
develop (staging)
  ↑
feature branches
```

---

## Database Migrations

### Development (Local)

```bash
# Make schema changes in backend/db/schema.ts

# Push to local database
npm run db:push

# Generate migration (when ready)
cd backend
npx drizzle-kit generate:pg
```

### Production

```bash
# Option 1: Push directly (simple, fine for MVP)
DATABASE_URL=production_url npm run db:push

# Option 2: Run migration files (safer for team)
DATABASE_URL=production_url npx drizzle-kit migrate
```

### In GitHub Actions

```yaml
- name: Run database migrations
  run: cd backend && npm run db:push
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

---

## Local CI with Act (Optional)

Run GitHub Actions locally to save minutes:

### Installation

```bash
# Windows (chocolatey)
choco install act-cli

# Windows (winget)
winget install nektos.act

# macOS
brew install act

# Linux
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash
```

### Usage

```bash
# Run all workflows
act push

# Run specific workflow
act -W .github/workflows/ci.yml

# Run specific job
act -j test

# Use specific event
act pull_request

# With secrets
act --secret-file .secrets
```

Create `.secrets` (not committed):

```
DATABASE_URL=postgresql://lootly:password@localhost:5432/lootly_test
JWT_SECRET=test-secret
```

### `.actrc` Configuration

```
-P ubuntu-latest=ghcr.io/catthehacker/ubuntu:act-latest
--container-architecture linux/amd64
```

---

## Quick Start Commands

### Initial Setup

```bash
# 1. Clone and install
git clone <your-repo>
cd lootly
npm install

# 2. Setup git hooks
npx husky init

# 3. Start local database
npm run db:start

# 4. Create env file
cp .env.example .env

# 5. Push database schema
npm run db:push

# 6. Seed test data
npm run db:seed

# 7. Start development
npm run dev
```

### Daily Development

```bash
# Start everything
npm run db:start && npm run dev

# Run tests
npm test

# Commit (hooks run automatically)
git add . && git commit -m "message"

# Push (tests run)
git push
```

### Deploying

```bash
# Phase 1: Local demo
# Just share your localhost via ngrok/localtunnel

# Phase 2: Free cloud
# Push to main, everything auto-deploys

# Phase 3: Paid
# Same as Phase 2, just faster
```

---

## Implementation Checklist

### Phase 1: Local Setup

- [ ] Create docker-compose.yml
- [ ] Create .env.example
- [ ] Add .env to .gitignore
- [ ] Install Husky and lint-staged
- [ ] Create pre-commit hook (lint + typecheck)
- [ ] Create pre-push hook (tests)
- [ ] Add root package.json scripts
- [ ] Test full local workflow

### Phase 2: Free Cloud

- [ ] Create Neon account and database
- [ ] Create Vercel account
- [ ] Deploy 3 frontend apps to Vercel
- [ ] Create Render account
- [ ] Deploy backend to Render
- [ ] Create GitHub Actions workflows
- [ ] Configure GitHub Secrets
- [ ] Test full CI/CD pipeline
- [ ] Document preview URL patterns

### Phase 3: Paid Upgrade (When Needed)

- [ ] Migrate backend to Railway
- [ ] Upgrade Neon if storage needed
- [ ] Set up error tracking (Sentry)
- [ ] Set up uptime monitoring
- [ ] Configure alerting

---

## Cost Summary

| Phase | Monthly Cost | When to Use |
|-------|--------------|-------------|
| Phase 1 | $0 | Solo development, demos from localhost |
| Phase 2 | $0 | External testers, staging, light production |
| Phase 3 | $5-25 | Real users, can't have cold starts |

---

## Cross-References

- [Multi-Tenant Support](./multi-tenant-support.md) - Environment per tenant
- [Architecture](../../ARCHITECTURE.md) - System design

---

*Last updated: January 2025*

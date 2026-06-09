# cj-test-harness

Controlled test environment for [codeJung](https://github.com/beardfaceguy/codeJung).

A minimal task-tracking app with a TypeScript/React frontend, Python/FastAPI backend, and PostgreSQL via Prisma.

## Stack
- **Frontend**: TypeScript + React + Vite (`frontend/`)
- **Backend**: Python + FastAPI + prisma-client-py (`api/`)
- **Database**: PostgreSQL (local via Docker Compose)
- **Schema**: `schema.prisma` (repo root — shared between Prisma CLI and Python client)

## Quick start

```bash
# 1. Start Postgres
docker compose up -d

# 2. Configure environment
#    Prisma CLI reads from root .env; FastAPI reads from api/.env
cp .env.example .env          # for Prisma CLI (runs from repo root)
cp .env.example api/.env      # for FastAPI runtime — fill in SECRET_KEY

# 3. Generate Prisma client and push schema
prisma generate --schema=schema.prisma
prisma db push --schema=schema.prisma

# 4. Start the API
cd api
pip install -r requirements.txt
uvicorn app.main:app --reload

# 5. Start the frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Known design trade-offs (not bugs)
- JWT stored in `localStorage` (XSS risk accepted for demo simplicity)
- Task assignees are not restricted to project members
- Email uniqueness uses a check-then-insert pattern (TOCTOU race on concurrent register)
- bcrypt silently truncates passwords beyond 72 bytes
- Postgres credentials hardcoded in docker-compose for local dev only

## Purpose
This repo exists to test codeJung. The `master` branch is the **clean baseline** (no intentional bugs).
Bug-seeded branches are created separately so we can verify codeJung detects them.

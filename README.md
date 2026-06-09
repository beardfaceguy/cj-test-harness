# cj-test-harness

Controlled test environment for [codeJung](https://github.com/beardfaceguy/codeJung).

A minimal task-tracking app with a TypeScript/React frontend, Python/FastAPI backend, and PostgreSQL via Prisma.

## Stack
- **Frontend**: TypeScript + React + Vite (`frontend/`)
- **Backend**: Python + FastAPI + prisma-client-py (`api/`)
- **Database**: PostgreSQL (local via Docker Compose)
- **Schema**: `schema.prisma` (shared root)

## Quick start

```bash
# 1. Start Postgres
docker compose up -d

# 2. Set up the API
cd api
cp .env.example .env
pip install -r requirements.txt
prisma db push --schema=../schema.prisma
uvicorn app.main:app --reload

# 3. Start the frontend (new terminal)
cd frontend
npm install
npm run dev
```

## Purpose
This repo exists to test codeJung. The `main` branch is the **clean baseline** (no intentional bugs).
Bug-seeded branches are created separately so we can verify codeJung detects them.

# OKR + Project Management Platform

Full-stack starter: NestJS + PostgreSQL + Redis (backend) and Next.js App Router (frontend) with shared workspace setup.

## Getting Started

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and adjust secrets/URLs.
3. Start databases: `docker compose up -d`
4. (Optional) Generate Prisma client: `npm run prisma:generate`
5. Run apps (backend + frontend): `npm run dev`

## Frontend API URL

- The web app defaults to `http://localhost:3001/api`.
- Override by setting `NEXT_PUBLIC_API_BASE_URL` in your frontend env if needed.

## Implemented MVP Slice

- Create/list Objective from `/okr` page.
- Create/list KR from Objective detail page.
- KR detail check-in form persists weekly updates.
- Check-in updates recalculate KR progress and Objective cached progress.
- API endpoints are now backed by PostgreSQL instead of static mocks for:
  - `/api/okr/cycles`
  - `/api/objectives`
  - `/api/key-results`
  - `/api/checkins`
  - `/api/alignments`

## Services

- Backend: NestJS API at `apps/api` (port 3001 default)
- Frontend: Next.js at `apps/web` (port 3000 default)
- Datastores: PostgreSQL + Redis via docker-compose

## Notes

- RBAC, OKR/Project/Task/KR models align with PE manufacturing use cases.
- If `prisma generate` fails in corporate network, configure TLS cert chain or use internal mirror.

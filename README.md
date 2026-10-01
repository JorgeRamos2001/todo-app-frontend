# Todo App — Frontend

Trello-style kanban SPA that consumes the Spring Boot `todo-app` REST API: boards, columns, tasks
with drag & drop, subtasks, comments, roles, email invitations, activity log and realtime updates.

## Stack

React 19 · TypeScript (strict) · Vite · Tailwind CSS 4 · shadcn/ui · TanStack Query v5 · Zustand ·
react-hook-form + zod · dnd-kit · STOMP/SockJS · Vitest + Testing Library.

## Requirements

- Node 22+
- The backend running on `http://localhost:8080` (dev profile) with PostgreSQL:
  `docker compose up -d` and `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` in the
  `todo-app` repository.
- Demo account (dev seed): `demo@example.com` / `password123`.

## Getting started

```bash
npm install
cp .env.example .env   # VITE_API_BASE_URL stays empty: everything goes through the dev proxy
npm run dev            # http://localhost:3000
```

Keep the port at **3000**: the backend OAuth2 redirect (`/oauth2/callback`) and the invitation
emails point there.

## Scripts

| Script                 | Purpose                                    |
| ---------------------- | ------------------------------------------ |
| `npm run dev`          | Vite dev server on port 3000 with proxy    |
| `npm run build`        | Type-check and production build to `dist/` |
| `npm run preview`      | Serve the production build                 |
| `npm run lint`         | ESLint (flat config)                       |
| `npm run typecheck`    | `tsc -b`                                   |
| `npm test`             | Vitest (run once)                          |
| `npm run test:watch`   | Vitest in watch mode                       |
| `npm run format`       | Prettier write                             |
| `npm run format:check` | Prettier check                             |

## How it talks to the API

- The backend has no CORS, so all requests use relative paths through the Vite dev proxy:
  `/api`, `/oauth2/authorization`, `/login/oauth2` and `/ws` (WebSocket).
- Auth: JWT access token (memory) + refresh token (localStorage) with single-use rotation. The 401
  interceptor refreshes once (single-flight) and retries; auth endpoints are excluded. No `/me`
  endpoint: the user is decoded from the access token claims.
- Realtime: STOMP over SockJS on `/ws`, authenticated with the `Authorization` header in CONNECT,
  subscribed to `/topic/boards/{id}`; events invalidate the relevant queries and a reconnect
  refetches the board.

## Project structure

```
src/
├── api/          HTTP client (ProblemDetail-aware) and one file per resource
├── auth/         Zustand session store, refresh interceptor, guards, schemas
├── realtime/     STOMP client, event → query invalidation mapping, hook
├── features/     boards, columns, tasks, invitations (components + hooks + helpers)
├── components/   app shell, shared components and shadcn/ui primitives
├── routes/       router and pages
└── lib/          utils, formatters, query keys, permissions
```

## Design

The visual direction lives in `interfaz.pen` (pen.dev canvas): sidebar shell, orange accent,
Sora/Manrope typography and light/dark themes. Tokens are implemented as CSS variables in
`src/index.css`; the theme toggle (light/dark/system) lives in the sidebar and the profile page.

## Testing and CI

- Vitest covers critical pieces: JWT decoding, refresh singleton, zod schemas, permission matrix,
  board cache moves, realtime invalidation mapping, invitation error mapping and the error boundary.
- GitHub Actions (`.github/workflows/ci.yaml`) runs `lint`, `typecheck` and `test` on every PR to
  `develop`/`main`. Branch protection requires the `ci` check; merges go through PRs.

## Workflow

`feature/*` branches from `develop` → PR to `develop` → PR `develop` → `main`. Commits follow
Conventional Commits.

## Status

Phases 0–5 of `development-plan.md` are implemented (setup, auth, boards, kanban, realtime,
invitations) plus the final polish (error boundary, 404, responsive pass). Interactive extras such
as comment editing or task unassignment are not supported by the backend and are intentionally
absent.

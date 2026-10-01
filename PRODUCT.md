# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary user: the developer/owner building the project, working locally against the real backend.
Secondary users: small teams (2–10 people) collaborating on boards. They know kanban tools
(Trello/Jira/Linear) and expect standard board interactions with clear roles and live updates.

## Product Purpose

A Trello-style kanban SPA that consumes the existing Spring Boot `todo-app` REST API. It gives
teams a focused place to organize work (boards → columns → tasks with subtasks, comments and
assignees) and doubles as a complete, production-quality frontend project.

## Positioning

A faithful client for a real API instead of a mock: realtime collaboration over STOMP, role-aware
permissions and email invitations are first-class, not demo stubs.

## Operating Context

- Backend on `localhost:8080`; SPA on `localhost:3000` behind the Vite dev proxy (no CORS).
- Auth: JWT with single-use refresh rotation, plus Google OAuth2. Demo: `demo@example.com / password123`.
- UI copy in English (backend ProblemDetail messages are English).
- Development follows `development-plan.md` phase by phase; design is validated on the pen.dev canvas
  (`interfaz.pen`) before implementation.

## Capabilities and Constraints

- Capabilities: boards (personal/collaborative), column and task drag & drop, subtasks, comments,
  assignees, roles (owner/admin/member), email invitations, activity log, realtime events.
- API gaps that shape UX: no `/me`, no server-side logout, no role change, no unassign, no comment
  editing; descriptions are cleared by sending `""`; moving without `position` appends at the end.
- Stack: React 19 + TypeScript strict + Vite, Tailwind 4 + shadcn/ui, TanStack Query, dnd-kit,
  STOMP/SockJS. Vitest for tests.

## Brand Commitments

- Name: "Todo App" (working title).
- The first visual direction (neutral shadcn look, Inter, blue accent) was rejected as generic,
  flat and without hierarchy. The user provides visual references; the replacement visual world is
  decided on the pen.dev canvas before code changes.

## Evidence on Hand

- `development-plan.md`: API reference and phase plan (product truth for behavior).
- Backend source: `/home/jorge/Escritorio/Projects/todo-app` (API source of truth).
- `interfaz.pen`: canvas where screens are designed and approved; `design-references/` holds the
  user's reference screenshots.

## Product Principles

1. The board is the product: the kanban view is the primary surface and must feel alive.
2. Never hide system state: loading, empty, error, permission and realtime status are visible.
3. Permission-aware, never broken: actions follow the role matrix, and backend 403s degrade into
   clear feedback instead of dead ends.
4. Progressive disclosure: detail (task, members, invitations) opens on demand in dialogs/sheets.
5. Craft over decoration: hierarchy, spacing and typography quality come before ornaments.

## Accessibility & Inclusion

- Basic requirements only: keyboard operability (including DnD), visible focus and sufficient
  contrast, inherited from shadcn/ui and kept intact.

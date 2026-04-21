# Architecture Overview

## Goal

Build a ServiceNow-inspired IT ticket management system that demonstrates a production-minded architecture while remaining small

## Frontend Design

The frontend is organized around route-level pages, reusable components, isolated services, hooks, and Zustand stores.

Key decisions:

- React Query owns server data, cache invalidation, optimistic updates, and rollback.
- Zustand owns lightweight client/session/filter state.
- Automation and permission rules are isolated into services so they can be tested without rendering React.
- Pages compose features but avoid owning business rules directly.
- Components remain reusable and mostly presentational.

## Backend Design

The backend is an Express API with a repository layer backed by SQLite via `sql.js`.

Key decisions:

- `server/app.ts` owns routes, validation, auth middleware, and RBAC middleware.
- `server/store.ts` exposes persistence operations through a stable repository interface.
- `server/db.ts` owns SQLite schema creation, seeding, file persistence, and reset behavior for tests.
- Server-side automation mirrors frontend automation to ensure trusted business logic runs on the backend.

## Data Flow

```text
React Page -> Custom Hook -> Service/Repository -> API Client -> Express Route -> Store -> SQLite
```

For optimistic updates:

```text
User action -> React Query onMutate -> Cache update -> API call -> success revalidate OR error rollback
```

## Roles

- `ADMIN`: full access, including delete.
- `AGENT`: create, edit, and move tickets.
- `VIEWER`: read-only access.

RBAC is enforced in both the UI and backend API.

## Persistence

SQLite data is stored locally in:

```text
server/data/smart-it.db
```

This file is intentionally ignored by Git because it is local runtime state.

## Testing Strategy

The test suite is layered:

- Pure service unit tests for automation, permissions, metrics, and optimistic helpers.
- Component/integration tests for login, routes, dashboard, ticket forms, delete confirmations, and kanban permissions.
- Hook tests for optimistic rollback.
- Backend API contract tests with Supertest.
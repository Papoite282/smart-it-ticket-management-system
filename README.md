# Smart IT Ticket Management System

A production-minded, ServiceNow-inspired IT ticket management system built for modern service desk workflows. The project demonstrates frontend architecture, backend API design, role-based access control, smart automation, optimistic updates, SQLite persistence, and automated testing.

## Why This Project Exists

This project was built as a technical case study for an IT Service Management context. It shows how a ServiceNow-style incident workflow can be designed with clean separation between UI, state management, business rules, API contracts, permissions, and persistence.

## Highlights

- Ticket CRUD with title, description, priority, status, and assignee.
- Workflow statuses: `OPEN -> IN_PROGRESS -> RESOLVED`.
- Smart automation: urgent/critical keywords escalate priority to `HIGH`.
- Auto-assignment: `HIGH` priority tickets are assigned to `Admin`.
- Dashboard with ticket metrics, status breakdown, priority breakdown, and average resolution time.
- Kanban board with drag-and-drop status movement.
- Search and filters by text, priority, status, and assignee.
- Authentication and role-based access control.
- Optimistic UI updates with rollback on failed mutations.
- Backend API with Express, validation, RBAC, and SQLite persistence.
- Automated tests for services, auth, routes, dashboard, tickets, kanban, optimistic rollback, and API contracts.

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- TailwindCSS
- React Router
- TanStack React Query
- Zustand
- Recharts
- dnd-kit
- Testing Library
- Vitest

### Backend

- Node.js
- Express
- TypeScript
- Zod validation
- SQLite persistence through `sql.js`
- Supertest API contract tests

## Architecture

```text
src/
  components/       Reusable UI and page components
  hooks/            React Query and auth hooks
  pages/            Route-level screens
  services/         API clients, automation, permissions, metrics, optimistic helpers
  store/            Zustand stores
  types/            Shared frontend types

server/
  app.ts            Express API routes and middleware
  db.ts             SQLite initialization, schema creation, persistence, seeding
  store.ts          Database-backed repository abstraction
  services/         Backend automation and metrics rules
  app.test.ts       API contract and RBAC tests

docs/
  backend-contract.md
  architecture.md
  interview-guide.md
  linkedin-post.md
  production-checklist.md
```

## Local Setup

```bash
npm install
```

Create `.env` from `.env.example`:

```bash
VITE_DATA_SOURCE=mock
VITE_API_BASE_URL=http://localhost:4000/api
PORT=4000
```

## Run The App

Open two terminals.

Terminal 1, backend:

```bash
npm run dev:server
```

Terminal 2, frontend:

```bash
npm run dev
```

URLs:

- Frontend: `http://localhost:5173`
- Backend landing page: `http://localhost:4000`
- Backend health check: `http://localhost:4000/api/health`

## Demo Accounts

| Role | Email | Password | Permissions |
| --- | --- | --- | --- |
| Admin | `admin@smartit.local` | `admin123` | Full access, including delete |
| Agent | `agent@smartit.local` | `agent123` | Create, edit, move tickets |
| Viewer | `viewer@smartit.local` | `viewer123` | Read-only access |

## Environment Modes

Use mock mode when you want the frontend to run without the backend:

```bash
VITE_DATA_SOURCE=mock
```

Use API mode when connecting the frontend to the Express backend:

```bash
VITE_DATA_SOURCE=api
VITE_API_BASE_URL=http://localhost:4000/api
```

## API Contract

The backend exposes:

- `GET /api/health`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/tickets`
- `POST /api/tickets`
- `PUT /api/tickets/:id`
- `PATCH /api/tickets/:id/status`
- `DELETE /api/tickets/:id`
- `GET /api/dashboard/metrics`

See [docs/backend-contract.md](docs/backend-contract.md) for payload and response details.

## Tests And Quality Checks

Run all tests:

```bash
npm run test:run
```

Run backend contract tests only:

```bash
npm run test:server
```

Run production validation:

```bash
npm run check
```

The current suite covers:

- Smart automation rules
- Permission rules
- Auth and protected routing
- Dashboard loading/error/success states
- Ticket create/edit/delete UI flows
- Delete confirmations
- Kanban movement permissions
- Optimistic update rollback
- Backend auth, RBAC, automation, status transitions, and metrics contract

## Production Readiness Notes

This project is for portfolio and structured for production evolution. Before a real deployment, the next recommended improvements are:

- Hash passwords instead of storing demo plaintext credentials.
- Add expiring sessions or JWT refresh-token flow.
- Add structured logging and request tracing.
- Add rate limiting and security headers.
- Move to a server-grade database for multi-user deployment if needed.
- Add CI/CD with build and test gates.


## License

MIT. See [LICENSE](LICENSE).

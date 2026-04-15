# Interview Guide

## 60-Second Pitch

I built a Smart IT Ticket Management System inspired by ServiceNow. It covers incident creation, prioritization, assignment, dashboard metrics, kanban workflow, role-based access, smart automation, optimistic UI updates, a backend API, SQLite persistence, and automated tests. The main goal was to show how I think about clean architecture, production readiness, and service management workflows.

## Problem It Solves

IT support teams need a structured way to receive, prioritize, assign, track, and resolve incidents. This project simulates that workflow with automation and permissions similar to what would exist in a real ITSM tool.

## Key Features To Demonstrate

1. Login with the three roles: Admin, Agent, Viewer.
2. Create a ticket containing the word `urgent` and show that priority becomes `HIGH` and assignee becomes `Admin`.
3. Use filters/search on the ticket list.
4. Move tickets through the kanban board.
5. Show the dashboard metrics and charts.
6. Explain backend RBAC and API contract tests.

## Technical Decisions

- React Query for server state because ticket data is asynchronous and cacheable.
- Zustand for small local state such as filters and auth session.
- Service layer for automation and permissions to avoid mixing business rules with UI.
- Express backend because it is lightweight and clear for API contract demonstration.
- SQLite through `sql.js` for local persistence without requiring an external DB server.
- Tests across services, UI behavior, hooks, and API endpoints.

## Tradeoffs

- Passwords are demo plaintext values; in production they should be hashed.
- SQLite is great for local/demo persistence; production multi-user deployment could move to Postgres.
- Auth uses simple bearer sessions; production should add expiration, refresh, and secure storage strategy.
- The UI is SaaS-dashboard style, not a full ServiceNow clone.

## What I Would Improve Next

- Password hashing with bcrypt/argon2.
- Session expiration and logout invalidation endpoint.
- Audit trail for every ticket change.
- SLA timers and breach alerts.
- CI/CD pipeline with test/build gates.
- Docker setup for reproducible deployment.

## Questions I Can Answer Well

- How is RBAC enforced?
- Where does automation live?
- How do optimistic updates work and rollback?
- How does frontend state differ from server state?
- How are API contracts tested?
- How would I move this to a real production deployment?
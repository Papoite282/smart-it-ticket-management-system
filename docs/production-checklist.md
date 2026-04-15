# Production Checklist

## Ready For GitHub

- [x] Source code organized by frontend/backend responsibility.
- [x] `.gitignore` excludes local env files, logs, dependencies, build output, and SQLite runtime DB.
- [x] `.env.example` and `.env.production.example` included.
- [x] README explains setup, architecture, roles, tests, and run commands.
- [x] API contract documented.
- [x] Tests pass locally.
- [x] GitHub Actions CI validates tests and production builds.

## Before Real Public Deployment

- [ ] Hash passwords with bcrypt or argon2.
- [ ] Add session expiration and logout invalidation endpoint.
- [ ] Add security headers and rate limiting.
- [ ] Add structured backend logging.
- [ ] Add Dockerfile and deployment instructions.
- [ ] Add production database backup strategy.
- [ ] Add audit log for ticket changes.

## Demo Checklist

1. Start backend: `npm run dev:server`.
2. Start frontend: `npm run dev`.
3. Open `http://localhost:5173`.
4. Login as Agent.
5. Create an urgent ticket and show automation.
6. Move ticket on kanban.
7. Login as Viewer and show read-only behavior.
8. Login as Admin and show delete permission.
9. Show tests with `npm run test:run`.
10. Explain architecture from `docs/architecture.md`.
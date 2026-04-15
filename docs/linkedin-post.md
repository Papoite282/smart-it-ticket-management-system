# LinkedIn Post Draft

I recently built a Smart IT Ticket Management System inspired by ServiceNow as a full-stack technical project.

The goal was not just to create a ticket CRUD app, but to design something closer to a real IT Service Management workflow:

- Ticket lifecycle: Open -> In Progress -> Resolved
- Smart automation for urgent/critical tickets
- Auto-assignment of high-priority incidents
- Role-based access control for Admin, Agent, and Viewer
- Dashboard metrics and charts
- Kanban workflow with drag-and-drop
- Search and filtering
- Optimistic UI updates with rollback
- Express API with SQLite persistence
- API contract tests and frontend integration tests

Tech stack:
React, TypeScript, Vite, TailwindCSS, Zustand, TanStack React Query, React Router, Recharts, dnd-kit, Express, SQLite, Zod, Vitest, Testing Library, and Supertest.

What I focused on most:
Clean architecture, separation of concerns, testability, and production-minded decisions. Business rules such as automation and permissions are isolated in service layers, and backend RBAC ensures permissions are enforced beyond the UI.

This project helped me practice the kind of thinking required in enterprise IT platforms: workflow design, access control, service reliability, and maintainable architecture.

#React #TypeScript #ServiceNow #ITSM #FrontendDevelopment #FullStackDevelopment #SoftwareEngineering #Thales
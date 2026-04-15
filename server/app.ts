import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { computeDashboardMetrics } from './services/metrics';
import { store } from './store';
import { SessionUser, TicketInput, TicketStatus, UserRole } from './types';

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

const ticketInputSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
  assignee: z.string().trim().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const statusSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED']),
});

const roleRank: Record<UserRole, number> = {
  VIEWER: 1,
  AGENT: 2,
  ADMIN: 3,
};

function sanitizeUser(user: { id: string; name: string; email: string; role: UserRole; avatar: string }): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
  };
}

function hasRequiredRole(currentRole: UserRole, requiredRole: UserRole) {
  return roleRank[currentRole] >= roleRank[requiredRole];
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authorization = req.header('authorization');
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  const user = await store.getUserByToken(token);
  if (!user) {
    res.status(401).json({ message: 'Invalid session' });
    return;
  }

  req.user = sanitizeUser(user);
  next();
}

function requireRole(requiredRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    if (!hasRequiredRole(req.user.role, requiredRole)) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
}

function validateStatusTransition(currentStatus: TicketStatus, nextStatus: TicketStatus) {
  const allowed: Record<TicketStatus, TicketStatus[]> = {
    OPEN: ['OPEN', 'IN_PROGRESS'],
    IN_PROGRESS: ['IN_PROGRESS', 'RESOLVED'],
    RESOLVED: ['RESOLVED'],
  };

  return allowed[currentStatus].includes(nextStatus);
}

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.type('html').send(`
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Smart IT Backend</title>
          <style>
            body {
              margin: 0;
              font-family: Arial, sans-serif;
              background: #0f172a;
              color: #e2e8f0;
              display: grid;
              place-items: center;
              min-height: 100vh;
            }
            main {
              max-width: 720px;
              padding: 32px;
              border: 1px solid #334155;
              border-radius: 20px;
              background: #111827;
              box-shadow: 0 20px 45px -28px rgba(15, 23, 42, 0.45);
            }
            h1 {
              margin-top: 0;
              font-size: 2rem;
            }
            code {
              background: #1e293b;
              padding: 2px 8px;
              border-radius: 999px;
            }
            a {
              color: #93c5fd;
            }
            ul {
              padding-left: 20px;
            }
          </style>
        </head>
        <body>
          <main>
            <h1>Smart IT Backend Running</h1>
            <p>This server exposes the API for the Smart IT Ticket Management System.</p>
            <ul>
              <li>Health check: <a href="/api/health"><code>/api/health</code></a></li>
              <li>API base URL: <code>/api</code></li>
              <li>Frontend dev server: <code>http://localhost:5173</code></li>
            </ul>
            <p>If you want the app UI, open <code>http://localhost:5173</code>. Port <code>4000</code> is the backend API.</p>
          </main>
        </body>
      </html>
    `);
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/auth/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid login payload' });
      return;
    }

    const user = (await store.getUsers()).find(
      (candidate) => candidate.email.toLowerCase() === parsed.data.email.toLowerCase() && candidate.password === parsed.data.password,
    );

    if (!user) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = await store.createSession(user.id);
    res.json({ data: { token, user: sanitizeUser(user) } });
  });

  app.get('/api/auth/me', requireAuth, (req, res) => {
    res.json({ data: req.user });
  });

  app.get('/api/tickets', requireAuth, async (_req, res) => {
    res.json({ data: await store.getTickets() });
  });

  app.post('/api/tickets', requireAuth, requireRole('AGENT'), async (req, res) => {
    const parsed = ticketInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid ticket payload' });
      return;
    }

    if (parsed.data.status === 'RESOLVED') {
      res.status(400).json({ message: 'New tickets cannot start as resolved' });
      return;
    }

    const ticket = await store.createTicket(parsed.data as TicketInput);
    res.status(201).json({ data: ticket });
  });

  app.put('/api/tickets/:id', requireAuth, requireRole('AGENT'), async (req, res) => {
    const parsed = ticketInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid ticket payload' });
      return;
    }

    const existing = await store.findTicket(String(req.params.id));
    if (!existing) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    if (!validateStatusTransition(existing.status, parsed.data.status)) {
      res.status(400).json({ message: 'Invalid status transition' });
      return;
    }

    const updated = await store.updateTicket(String(req.params.id), parsed.data as TicketInput);
    res.json({ data: updated });
  });

  app.patch('/api/tickets/:id/status', requireAuth, requireRole('AGENT'), async (req, res) => {
    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: 'Invalid status payload' });
      return;
    }

    const existing = await store.findTicket(String(req.params.id));
    if (!existing) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    if (!validateStatusTransition(existing.status, parsed.data.status)) {
      res.status(400).json({ message: 'Invalid status transition' });
      return;
    }

    const updated = await store.updateTicketStatus(String(req.params.id), parsed.data.status);
    res.json({ data: updated });
  });

  app.delete('/api/tickets/:id', requireAuth, requireRole('ADMIN'), async (req, res) => {
    const deleted = await store.deleteTicket(String(req.params.id));
    if (!deleted) {
      res.status(404).json({ message: 'Ticket not found' });
      return;
    }

    res.json({ success: true });
  });

  app.get('/api/dashboard/metrics', requireAuth, async (_req, res) => {
    res.json({ data: computeDashboardMetrics(await store.getTickets()) });
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
}
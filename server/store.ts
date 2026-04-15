import { differenceInHours, parseISO } from 'date-fns';
import { applyTicketAutomation } from './services/automation';
import { execute, initDatabase, queryAll, queryOne, resetDatabase } from './db';
import { Ticket, TicketInput, TicketStatus, User } from './types';

function buildResolutionTime(createdAt: string, status: TicketStatus, resolvedAt?: string) {
  if (status !== 'RESOLVED' || !resolvedAt) {
    return 0;
  }

  return Math.max(1, differenceInHours(parseISO(resolvedAt), parseISO(createdAt)));
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    password: String(row.password),
    role: row.role as User['role'],
    avatar: String(row.avatar),
  };
}

function mapTicket(row: Record<string, unknown>): Ticket {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    priority: row.priority as Ticket['priority'],
    status: row.status as Ticket['status'],
    assignee: String(row.assignee),
    createdAt: String(row.createdAt),
    updatedAt: String(row.updatedAt),
    resolvedAt: row.resolvedAt ? String(row.resolvedAt) : undefined,
    resolutionTimeHours: Number(row.resolutionTimeHours),
  };
}

export const store = {
  async init() {
    await initDatabase();
  },

  async reset() {
    await resetDatabase();
  },

  async getUsers() {
    const rows = await queryAll<Record<string, unknown>>('SELECT * FROM users ORDER BY email ASC');
    return rows.map(mapUser);
  },

  async getTickets() {
    const rows = await queryAll<Record<string, unknown>>('SELECT * FROM tickets ORDER BY createdAt DESC');
    return rows.map(mapTicket);
  },

  async findTicket(id: string) {
    const row = await queryOne<Record<string, unknown>>('SELECT * FROM tickets WHERE id = ?', [id]);
    return row ? mapTicket(row) : null;
  },

  async createTicket(payload: TicketInput) {
    const automatedPayload = applyTicketAutomation(payload);
    const now = new Date().toISOString();
    const resolvedAt = automatedPayload.status === 'RESOLVED' ? now : null;
    const ticket: Ticket = {
      id: crypto.randomUUID(),
      ...automatedPayload,
      createdAt: now,
      updatedAt: now,
      resolvedAt: resolvedAt ?? undefined,
      resolutionTimeHours: buildResolutionTime(now, automatedPayload.status, resolvedAt ?? undefined),
    };

    await execute(
      'INSERT INTO tickets (id, title, description, priority, status, assignee, createdAt, updatedAt, resolvedAt, resolutionTimeHours) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        ticket.id,
        ticket.title,
        ticket.description,
        ticket.priority,
        ticket.status,
        ticket.assignee,
        ticket.createdAt,
        ticket.updatedAt,
        ticket.resolvedAt ?? null,
        ticket.resolutionTimeHours,
      ],
    );

    return ticket;
  },

  async updateTicket(id: string, payload: TicketInput) {
    const existing = await this.findTicket(id);
    if (!existing) {
      return null;
    }

    const automatedPayload = applyTicketAutomation(payload);
    const updatedAt = new Date().toISOString();
    const resolvedAt = automatedPayload.status === 'RESOLVED' ? existing.resolvedAt ?? updatedAt : undefined;

    const updated: Ticket = {
      ...existing,
      ...automatedPayload,
      updatedAt,
      resolvedAt,
      resolutionTimeHours: buildResolutionTime(existing.createdAt, automatedPayload.status, resolvedAt),
    };

    await execute(
      'UPDATE tickets SET title = ?, description = ?, priority = ?, status = ?, assignee = ?, updatedAt = ?, resolvedAt = ?, resolutionTimeHours = ? WHERE id = ?',
      [
        updated.title,
        updated.description,
        updated.priority,
        updated.status,
        updated.assignee,
        updated.updatedAt,
        updated.resolvedAt ?? null,
        updated.resolutionTimeHours,
        id,
      ],
    );

    return updated;
  },

  async updateTicketStatus(id: string, status: TicketStatus) {
    const existing = await this.findTicket(id);
    if (!existing) {
      return null;
    }

    return this.updateTicket(id, {
      title: existing.title,
      description: existing.description,
      priority: existing.priority,
      status,
      assignee: existing.assignee,
    });
  },

  async deleteTicket(id: string) {
    const existing = await this.findTicket(id);
    if (!existing) {
      return false;
    }

    await execute('DELETE FROM tickets WHERE id = ?', [id]);
    return true;
  },

  async createSession(userId: string) {
    const token = `mock-token-${crypto.randomUUID()}`;
    await execute('INSERT INTO sessions (token, userId) VALUES (?, ?)', [token, userId]);
    return token;
  },

  async getUserByToken(token: string) {
    const row = await queryOne<Record<string, unknown>>(
      `SELECT users.*
       FROM sessions
       INNER JOIN users ON users.id = sessions.userId
       WHERE sessions.token = ?`,
      [token],
    );

    return row ? mapUser(row) : null;
  },
};
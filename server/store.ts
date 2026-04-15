import { differenceInHours, parseISO } from 'date-fns';
import { applyTicketAutomation } from './services/automation';
import { buildSlaDueAt, getSlaHours, getSlaStatus } from './services/sla';
import { execute, initDatabase, queryAll, queryOne, resetDatabase } from './db';
import { Ticket, TicketAuditEvent, TicketInput, TicketStatus, User } from './types';

function buildResolutionTime(createdAt: string, status: TicketStatus, resolvedAt?: string) {
  if (status !== 'RESOLVED' || !resolvedAt) {
    return 0;
  }

  return Math.max(1, differenceInHours(parseISO(resolvedAt), parseISO(createdAt)));
}

function buildTicketSla(ticket: Omit<Ticket, 'slaHours' | 'slaDueAt' | 'slaStatus'>): Pick<Ticket, 'slaHours' | 'slaDueAt' | 'slaStatus'> {
  const slaHours = getSlaHours(ticket.priority);
  const slaDueAt = buildSlaDueAt(ticket.createdAt, ticket.priority);

  return {
    slaHours,
    slaDueAt,
    slaStatus: getSlaStatus({ status: ticket.status, resolvedAt: ticket.resolvedAt, slaDueAt }),
  };
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
  const base = {
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
  const sla = buildTicketSla(base);

  return {
    ...base,
    slaHours: Number(row.slaHours || sla.slaHours),
    slaDueAt: row.slaDueAt ? String(row.slaDueAt) : sla.slaDueAt,
    slaStatus: getSlaStatus({ ...base, slaDueAt: row.slaDueAt ? String(row.slaDueAt) : sla.slaDueAt }),
  };
}

function mapAuditEvent(row: Record<string, unknown>): TicketAuditEvent {
  return {
    id: String(row.id),
    ticketId: String(row.ticketId),
    actor: String(row.actor),
    action: row.action as TicketAuditEvent['action'],
    message: String(row.message),
    createdAt: String(row.createdAt),
  };
}

async function logAudit(ticketId: string, action: TicketAuditEvent['action'], message: string, actor = 'System') {
  await execute(
    'INSERT INTO audit_events (id, ticketId, actor, action, message, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
    [crypto.randomUUID(), ticketId, actor, action, message, new Date().toISOString()],
  );
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

  async getTicketAudit(ticketId: string) {
    const rows = await queryAll<Record<string, unknown>>(
      'SELECT * FROM audit_events WHERE ticketId = ? ORDER BY createdAt DESC',
      [ticketId],
    );

    return rows.map(mapAuditEvent);
  },

  async createTicket(payload: TicketInput, actor = 'System') {
    const automatedPayload = applyTicketAutomation(payload);
    const now = new Date().toISOString();
    const resolvedAt = automatedPayload.status === 'RESOLVED' ? now : undefined;
    const base = {
      id: crypto.randomUUID(),
      ...automatedPayload,
      createdAt: now,
      updatedAt: now,
      resolvedAt,
      resolutionTimeHours: buildResolutionTime(now, automatedPayload.status, resolvedAt),
    };
    const ticket: Ticket = {
      ...base,
      ...buildTicketSla(base),
    };

    await execute(
      'INSERT INTO tickets (id, title, description, priority, status, assignee, createdAt, updatedAt, resolvedAt, resolutionTimeHours, slaHours, slaDueAt, slaStatus) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
        ticket.slaHours,
        ticket.slaDueAt,
        ticket.slaStatus,
      ],
    );
    await logAudit(ticket.id, 'CREATED', `Ticket created with ${ticket.priority} priority and ${ticket.slaHours}h SLA.`, actor);

    return ticket;
  },

  async updateTicket(id: string, payload: TicketInput, actor = 'System') {
    const existing = await this.findTicket(id);
    if (!existing) {
      return null;
    }

    const automatedPayload = applyTicketAutomation(payload);
    const updatedAt = new Date().toISOString();
    const resolvedAt = automatedPayload.status === 'RESOLVED' ? existing.resolvedAt ?? updatedAt : undefined;
    const base = {
      ...existing,
      ...automatedPayload,
      updatedAt,
      resolvedAt,
      resolutionTimeHours: buildResolutionTime(existing.createdAt, automatedPayload.status, resolvedAt),
    };
    const updated: Ticket = {
      ...base,
      ...buildTicketSla(base),
    };

    await execute(
      'UPDATE tickets SET title = ?, description = ?, priority = ?, status = ?, assignee = ?, updatedAt = ?, resolvedAt = ?, resolutionTimeHours = ?, slaHours = ?, slaDueAt = ?, slaStatus = ? WHERE id = ?',
      [
        updated.title,
        updated.description,
        updated.priority,
        updated.status,
        updated.assignee,
        updated.updatedAt,
        updated.resolvedAt ?? null,
        updated.resolutionTimeHours,
        updated.slaHours,
        updated.slaDueAt,
        updated.slaStatus,
        id,
      ],
    );

    const statusChanged = existing.status !== updated.status;
    await logAudit(
      id,
      statusChanged ? 'STATUS_CHANGED' : 'UPDATED',
      statusChanged ? `Status changed from ${existing.status} to ${updated.status}.` : 'Ticket details updated.',
      actor,
    );

    return updated;
  },

  async updateTicketStatus(id: string, status: TicketStatus, actor = 'System') {
    const existing = await this.findTicket(id);
    if (!existing) {
      return null;
    }

    return this.updateTicket(
      id,
      {
        title: existing.title,
        description: existing.description,
        priority: existing.priority,
        status,
        assignee: existing.assignee,
      },
      actor,
    );
  },

  async deleteTicket(id: string, actor = 'System') {
    const existing = await this.findTicket(id);
    if (!existing) {
      return false;
    }

    await logAudit(id, 'DELETED', `Ticket deleted: ${existing.title}.`, actor);
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

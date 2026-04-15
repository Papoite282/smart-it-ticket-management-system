import { differenceInHours, parseISO } from 'date-fns';
import { Ticket, TicketAuditEvent, TicketInput, TicketStatus } from '../types/ticket';
import { applyTicketAutomation } from './automationService';
import { computeDashboardMetrics } from './ticketMetrics';
import { buildSlaDueAt, getSlaHours, getSlaStatus } from './slaService';

const STORAGE_KEY = 'smart-it-ticket-system';
const AUDIT_STORAGE_KEY = 'smart-it-ticket-audit-events';
const NETWORK_DELAY_MS = 650;

function withSla(ticket: Omit<Ticket, 'slaHours' | 'slaDueAt' | 'slaStatus'>): Ticket {
  const slaHours = getSlaHours(ticket.priority);
  const slaDueAt = buildSlaDueAt(ticket.createdAt, ticket.priority);

  return {
    ...ticket,
    slaHours,
    slaDueAt,
    slaStatus: getSlaStatus({ status: ticket.status, resolvedAt: ticket.resolvedAt, slaDueAt }),
  };
}

const seedTickets: Ticket[] = [
  withSla({
    id: crypto.randomUUID(),
    title: 'VPN access failing for remote finance team',
    description: 'Several users report intermittent VPN disconnects during payroll processing.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignee: 'Admin',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    resolutionTimeHours: 11,
  }),
  withSla({
    id: crypto.randomUUID(),
    title: 'Laptop camera driver update',
    description: 'Prepare the latest camera driver package for onboarding devices.',
    priority: 'LOW',
    status: 'OPEN',
    assignee: 'Mia',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 32).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    resolutionTimeHours: 0,
  }),
  withSla({
    id: crypto.randomUUID(),
    title: 'Urgent email delivery delay in shared mailbox',
    description: 'Messages to support@ are delayed by over 10 minutes and need immediate attention.',
    priority: 'HIGH',
    status: 'RESOLVED',
    assignee: 'Admin',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 54).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    resolvedAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    resolutionTimeHours: 42,
  }),
  withSla({
    id: crypto.randomUUID(),
    title: 'Password reset workflow review',
    description: 'Audit self-service password reset flow for newly joined contractors.',
    priority: 'MEDIUM',
    status: 'OPEN',
    assignee: 'Leo',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 1).toISOString(),
    resolutionTimeHours: 0,
  }),
];

function delay<T>(value: T, ms = NETWORK_DELAY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function readTickets(): Ticket[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTickets));
    return seedTickets;
  }

  try {
    return (JSON.parse(stored) as Ticket[]).map((ticket) => withSla(ticket));
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTickets));
    return seedTickets;
  }
}

function writeTickets(tickets: Ticket[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function readAuditEvents(): TicketAuditEvent[] {
  const stored = localStorage.getItem(AUDIT_STORAGE_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as TicketAuditEvent[];
  } catch {
    return [];
  }
}

function writeAuditEvents(events: TicketAuditEvent[]) {
  localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(events));
}

function addAuditEvent(ticketId: string, action: TicketAuditEvent['action'], message: string, actor = 'Demo User') {
  const event: TicketAuditEvent = {
    id: crypto.randomUUID(),
    ticketId,
    action,
    message,
    actor,
    createdAt: new Date().toISOString(),
  };
  writeAuditEvents([event, ...readAuditEvents()]);
}

function buildResolutionTime(createdAt: string, status: TicketStatus, resolvedAt?: string) {
  if (status !== 'RESOLVED' || !resolvedAt) {
    return 0;
  }

  return Math.max(1, differenceInHours(parseISO(resolvedAt), parseISO(createdAt)));
}

export const mockApi = {
  async getTickets() {
    return delay(readTickets());
  },

  async getTicketAudit(ticketId: string) {
    return delay(readAuditEvents().filter((event) => event.ticketId === ticketId));
  },

  async createTicket(payload: TicketInput) {
    const automatedPayload = applyTicketAutomation(payload);
    const now = new Date().toISOString();
    const resolvedAt = automatedPayload.status === 'RESOLVED' ? now : undefined;

    const ticket = withSla({
      id: crypto.randomUUID(),
      ...automatedPayload,
      createdAt: now,
      updatedAt: now,
      resolvedAt,
      resolutionTimeHours: buildResolutionTime(now, automatedPayload.status, resolvedAt),
    });

    const tickets = [ticket, ...readTickets()];
    writeTickets(tickets);
    addAuditEvent(ticket.id, 'CREATED', `Ticket created with ${ticket.priority} priority and ${ticket.slaHours}h SLA.`);
    return delay(ticket);
  },

  async updateTicket(id: string, payload: TicketInput) {
    const automatedPayload = applyTicketAutomation(payload);
    const tickets = readTickets();
    const existing = tickets.find((ticket) => ticket.id === id);

    if (!existing) {
      throw new Error('Ticket not found');
    }

    const updatedAt = new Date().toISOString();
    const resolvedAt = automatedPayload.status === 'RESOLVED' ? existing.resolvedAt ?? updatedAt : undefined;

    const updatedTicket = withSla({
      ...existing,
      ...automatedPayload,
      updatedAt,
      resolvedAt,
      resolutionTimeHours: buildResolutionTime(existing.createdAt, automatedPayload.status, resolvedAt),
    });

    const updatedTickets = tickets.map((ticket) => (ticket.id === id ? updatedTicket : ticket));
    writeTickets(updatedTickets);
    addAuditEvent(
      id,
      existing.status !== updatedTicket.status ? 'STATUS_CHANGED' : 'UPDATED',
      existing.status !== updatedTicket.status
        ? `Status changed from ${existing.status} to ${updatedTicket.status}.`
        : 'Ticket details updated.',
    );
    return delay(updatedTicket);
  },

  async updateTicketStatus(id: string, status: TicketStatus) {
    const tickets = readTickets();
    const existing = tickets.find((ticket) => ticket.id === id);

    if (!existing) {
      throw new Error('Ticket not found');
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
    const tickets = readTickets();
    const existing = tickets.find((ticket) => ticket.id === id);

    if (!existing) {
      throw new Error('Ticket not found');
    }

    addAuditEvent(id, 'DELETED', `Ticket deleted: ${existing.title}.`);
    writeTickets(tickets.filter((ticket) => ticket.id !== id));
    return delay({ success: true });
  },

  async getDashboardMetrics() {
    return delay(computeDashboardMetrics(readTickets()));
  },
};

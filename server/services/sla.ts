import { differenceInMinutes, parseISO } from 'date-fns';
import { Ticket, TicketPriority, TicketSlaStatus } from '../types';

const slaHoursByPriority: Record<TicketPriority, number> = {
  HIGH: 8,
  MEDIUM: 24,
  LOW: 72,
};

export function getSlaHours(priority: TicketPriority) {
  return slaHoursByPriority[priority];
}

export function buildSlaDueAt(createdAt: string, priority: TicketPriority) {
  return new Date(parseISO(createdAt).getTime() + getSlaHours(priority) * 60 * 60 * 1000).toISOString();
}

export function getSlaStatus(ticket: Pick<Ticket, 'status' | 'resolvedAt' | 'slaDueAt'>, now = new Date()): TicketSlaStatus {
  const dueAt = parseISO(ticket.slaDueAt);

  if (ticket.status === 'RESOLVED') {
    return ticket.resolvedAt && parseISO(ticket.resolvedAt) <= dueAt ? 'MET' : 'BREACHED';
  }

  const minutesRemaining = differenceInMinutes(dueAt, now);
  if (minutesRemaining <= 0) {
    return 'BREACHED';
  }

  return minutesRemaining <= 120 ? 'AT_RISK' : 'ON_TRACK';
}

export function applySla(ticket: Omit<Ticket, 'slaHours' | 'slaDueAt' | 'slaStatus'>): Ticket {
  const slaHours = getSlaHours(ticket.priority);
  const slaDueAt = buildSlaDueAt(ticket.createdAt, ticket.priority);

  return {
    ...ticket,
    slaHours,
    slaDueAt,
    slaStatus: getSlaStatus({ ...ticket, slaDueAt }),
  };
}

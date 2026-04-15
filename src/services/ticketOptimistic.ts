import { differenceInHours, parseISO } from 'date-fns';
import { Ticket, TicketInput, TicketStatus } from '../types/ticket';
import { applyTicketAutomation } from './automationService';

function buildResolutionTime(createdAt: string, status: TicketStatus, resolvedAt?: string) {
  if (status !== 'RESOLVED' || !resolvedAt) {
    return 0;
  }

  return Math.max(1, differenceInHours(parseISO(resolvedAt), parseISO(createdAt)));
}

export function createOptimisticTicket(payload: TicketInput, now = new Date().toISOString()): Ticket {
  const automatedPayload = applyTicketAutomation(payload);
  const resolvedAt = automatedPayload.status === 'RESOLVED' ? now : undefined;

  return {
    id: `temp-${crypto.randomUUID()}`,
    ...automatedPayload,
    createdAt: now,
    updatedAt: now,
    resolvedAt,
    resolutionTimeHours: buildResolutionTime(now, automatedPayload.status, resolvedAt),
  };
}

export function mergeUpdatedTicket(existing: Ticket, payload: TicketInput, now = new Date().toISOString()): Ticket {
  const automatedPayload = applyTicketAutomation(payload);
  const resolvedAt = automatedPayload.status === 'RESOLVED' ? existing.resolvedAt ?? now : undefined;

  return {
    ...existing,
    ...automatedPayload,
    updatedAt: now,
    resolvedAt,
    resolutionTimeHours: buildResolutionTime(existing.createdAt, automatedPayload.status, resolvedAt),
  };
}

export function mergeStatusUpdate(existing: Ticket, status: TicketStatus, now = new Date().toISOString()) {
  return mergeUpdatedTicket(
    existing,
    {
      title: existing.title,
      description: existing.description,
      priority: existing.priority,
      status,
      assignee: existing.assignee,
    },
    now,
  );
}
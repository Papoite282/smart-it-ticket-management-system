import { describe, expect, it } from 'vitest';
import { Ticket } from '../types/ticket';
import { computeDashboardMetrics } from './ticketMetrics';
import { createOptimisticTicket, mergeStatusUpdate, mergeUpdatedTicket } from './ticketOptimistic';

const baseTicket: Ticket = {
  id: 'ticket-1',
  title: 'Email delivery issue',
  description: 'Messages are delayed by 20 minutes',
  priority: 'MEDIUM',
  status: 'OPEN',
  assignee: 'Mia',
  createdAt: '2026-04-07T08:00:00.000Z',
  updatedAt: '2026-04-07T08:00:00.000Z',
  resolutionTimeHours: 0,
};

describe('ticketOptimistic', () => {
  it('creates an optimistic ticket with automation applied', () => {
    const result = createOptimisticTicket(
      {
        title: 'Urgent identity provider outage',
        description: 'critical login disruption',
        priority: 'LOW',
        status: 'OPEN',
        assignee: 'Leo',
      },
      '2026-04-07T09:00:00.000Z',
    );

    expect(result.id.startsWith('temp-')).toBe(true);
    expect(result.priority).toBe('HIGH');
    expect(result.assignee).toBe('Admin');
    expect(result.createdAt).toBe('2026-04-07T09:00:00.000Z');
  });

  it('merges updates while preserving createdAt and recalculating resolution data', () => {
    const result = mergeUpdatedTicket(
      baseTicket,
      {
        title: 'Urgent email delivery issue',
        description: 'critical mailbox disruption',
        priority: 'MEDIUM',
        status: 'RESOLVED',
        assignee: 'Mia',
      },
      '2026-04-07T12:00:00.000Z',
    );

    expect(result.createdAt).toBe(baseTicket.createdAt);
    expect(result.updatedAt).toBe('2026-04-07T12:00:00.000Z');
    expect(result.priority).toBe('HIGH');
    expect(result.assignee).toBe('Admin');
    expect(result.resolvedAt).toBe('2026-04-07T12:00:00.000Z');
    expect(result.resolutionTimeHours).toBe(4);
  });

  it('updates status optimistically and recomputes dashboard metrics', () => {
    const resolvedTicket = mergeStatusUpdate(baseTicket, 'RESOLVED', '2026-04-07T10:00:00.000Z');
    const metrics = computeDashboardMetrics([resolvedTicket]);

    expect(resolvedTicket.status).toBe('RESOLVED');
    expect(metrics.totalTickets).toBe(1);
    expect(metrics.resolvedTickets).toBe(1);
    expect(metrics.averageResolutionTime).toBe(2);
  });
});
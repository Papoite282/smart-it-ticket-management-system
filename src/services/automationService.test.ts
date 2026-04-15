import { describe, expect, it } from 'vitest';
import { applyTicketAutomation } from './automationService';

describe('applyTicketAutomation', () => {
  it('escalates urgent tickets to high priority and assigns Admin', () => {
    const result = applyTicketAutomation({
      title: 'Urgent VPN outage',
      description: 'Multiple users are blocked from working',
      priority: 'MEDIUM',
      status: 'OPEN',
      assignee: 'Mia',
    });

    expect(result.priority).toBe('HIGH');
    expect(result.assignee).toBe('Admin');
  });

  it('keeps non-urgent tickets unchanged when priority is not high', () => {
    const result = applyTicketAutomation({
      title: 'Printer toner replacement',
      description: 'Replace toner for the second-floor printer',
      priority: 'LOW',
      status: 'OPEN',
      assignee: 'Leo',
    });

    expect(result.priority).toBe('LOW');
    expect(result.assignee).toBe('Leo');
  });

  it('assigns Admin to manually high-priority tickets even without keywords', () => {
    const result = applyTicketAutomation({
      title: 'Executive laptop issue',
      description: 'Display flickering during presentations',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      assignee: 'Marco',
    });

    expect(result.priority).toBe('HIGH');
    expect(result.assignee).toBe('Admin');
  });
});
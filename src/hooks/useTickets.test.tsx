import { ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { useTickets } from './useTickets';
import { createTestQueryClient } from '../test/renderWithProviders';
import { computeDashboardMetrics } from '../services/ticketMetrics';
import { Ticket } from '../types/ticket';

vi.mock('../services/ticketRepository', () => ({
  ticketRepository: {
    getTickets: vi.fn(),
    createTicket: vi.fn(),
    updateTicket: vi.fn(),
    updateTicketStatus: vi.fn(),
    deleteTicket: vi.fn(),
    getDashboardMetrics: vi.fn(),
  },
}));

import { ticketRepository } from '../services/ticketRepository';

const repository = vi.mocked(ticketRepository);

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

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('useTickets optimistic rollback', () => {
  it('rolls back an optimistic status update when the mutation fails', async () => {
    const queryClient = createTestQueryClient();
    const metrics = computeDashboardMetrics([baseTicket]);
    const pending = deferred<Ticket>();

    repository.getTickets.mockResolvedValue([baseTicket]);
    repository.getDashboardMetrics.mockResolvedValue(metrics);
    repository.updateTicketStatus.mockReturnValue(pending.promise);

    queryClient.setQueryData(['tickets'], [baseTicket]);
    queryClient.setQueryData(['dashboard-metrics'], metrics);

    function wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => useTickets(), { wrapper });

    await waitFor(() => {
      expect(result.current.tickets).toHaveLength(1);
    });

    let mutationPromise: Promise<unknown> | undefined;

    await act(async () => {
      mutationPromise = result.current.updateTicketStatus({ id: 'ticket-1', status: 'RESOLVED' }).catch(() => undefined);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect((queryClient.getQueryData(['tickets']) as Ticket[])[0].status).toBe('RESOLVED');
    });
    expect(queryClient.getQueryData(['dashboard-metrics'])).toMatchObject({
      resolvedTickets: 1,
    });

    pending.reject(new Error('Update failed'));
    await act(async () => {
      await mutationPromise;
    });

    expect((queryClient.getQueryData(['tickets']) as Ticket[])[0].status).toBe('OPEN');
    expect(queryClient.getQueryData(['dashboard-metrics'])).toMatchObject({
      resolvedTickets: 0,
    });
  });
});
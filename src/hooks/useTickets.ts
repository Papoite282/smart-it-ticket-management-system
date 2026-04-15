import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ticketRepository } from '../services/ticketRepository';
import { createOptimisticTicket, mergeStatusUpdate, mergeUpdatedTicket } from '../services/ticketOptimistic';
import { computeDashboardMetrics } from '../services/ticketMetrics';
import { useTicketFiltersStore } from '../store/ticketFiltersStore';
import { DashboardMetrics, Ticket, TicketInput } from '../types/ticket';

const TICKETS_QUERY_KEY = ['tickets'];
const DASHBOARD_QUERY_KEY = ['dashboard-metrics'];

interface TicketsMutationContext {
  previousTickets?: Ticket[];
  previousMetrics?: DashboardMetrics;
}

function matchesSearch(ticket: Ticket, search: string) {
  const normalized = search.toLowerCase();
  return [ticket.title, ticket.description, ticket.assignee].some((value) =>
    value.toLowerCase().includes(normalized),
  );
}

export function useTickets() {
  const queryClient = useQueryClient();
  const filters = useTicketFiltersStore();

  const ticketsQuery = useQuery({
    queryKey: TICKETS_QUERY_KEY,
    queryFn: () => ticketRepository.getTickets(),
  });

  function snapshotState(): TicketsMutationContext {
    return {
      previousTickets: queryClient.getQueryData<Ticket[]>(TICKETS_QUERY_KEY),
      previousMetrics: queryClient.getQueryData<DashboardMetrics>(DASHBOARD_QUERY_KEY),
    };
  }

  function applyOptimisticState(tickets: Ticket[]) {
    queryClient.setQueryData(TICKETS_QUERY_KEY, tickets);
    queryClient.setQueryData(DASHBOARD_QUERY_KEY, computeDashboardMetrics(tickets));
  }

  function rollbackState(context?: TicketsMutationContext) {
    queryClient.setQueryData(TICKETS_QUERY_KEY, context?.previousTickets);
    queryClient.setQueryData(DASHBOARD_QUERY_KEY, context?.previousMetrics);
  }

  const createTicketMutation = useMutation({
    mutationFn: (payload: TicketInput) => ticketRepository.createTicket(payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: TICKETS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: DASHBOARD_QUERY_KEY });

      const context = snapshotState();
      const nextTickets = [createOptimisticTicket(payload), ...(context.previousTickets ?? [])];
      applyOptimisticState(nextTickets);

      return context;
    },
    onError: (_error, _payload, context) => {
      rollbackState(context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TicketInput }) => ticketRepository.updateTicket(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: TICKETS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: DASHBOARD_QUERY_KEY });

      const context = snapshotState();
      const nextTickets = (context.previousTickets ?? []).map((ticket) =>
        ticket.id === id ? mergeUpdatedTicket(ticket, payload) : ticket,
      );
      applyOptimisticState(nextTickets);

      return context;
    },
    onError: (_error, _variables, context) => {
      rollbackState(context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Ticket['status'] }) =>
      ticketRepository.updateTicketStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: TICKETS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: DASHBOARD_QUERY_KEY });

      const context = snapshotState();
      const nextTickets = (context.previousTickets ?? []).map((ticket) =>
        ticket.id === id ? mergeStatusUpdate(ticket, status) : ticket,
      );
      applyOptimisticState(nextTickets);

      return context;
    },
    onError: (_error, _variables, context) => {
      rollbackState(context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (id: string) => ticketRepository.deleteTicket(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TICKETS_QUERY_KEY });
      await queryClient.cancelQueries({ queryKey: DASHBOARD_QUERY_KEY });

      const context = snapshotState();
      const nextTickets = (context.previousTickets ?? []).filter((ticket) => ticket.id !== id);
      applyOptimisticState(nextTickets);

      return context;
    },
    onError: (_error, _id, context) => {
      rollbackState(context);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TICKETS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });

  const filteredTickets = useMemo(() => {
    const tickets = ticketsQuery.data ?? [];

    return tickets.filter((ticket) => {
      const searchMatch = !filters.search || matchesSearch(ticket, filters.search);
      const statusMatch = filters.status === 'ALL' || ticket.status === filters.status;
      const priorityMatch = filters.priority === 'ALL' || ticket.priority === filters.priority;
      const assigneeMatch = filters.assignee === 'ALL' || ticket.assignee === filters.assignee;

      return searchMatch && statusMatch && priorityMatch && assigneeMatch;
    });
  }, [filters, ticketsQuery.data]);

  const assignees = useMemo(() => {
    const source = ticketsQuery.data ?? [];
    return Array.from(new Set(source.map((ticket) => ticket.assignee))).sort();
  }, [ticketsQuery.data]);

  return {
    ...ticketsQuery,
    tickets: ticketsQuery.data ?? [],
    filteredTickets,
    assignees,
    createTicket: createTicketMutation.mutateAsync,
    updateTicket: updateTicketMutation.mutateAsync,
    updateTicketStatus: updateStatusMutation.mutateAsync,
    deleteTicket: deleteTicketMutation.mutateAsync,
    isMutating:
      createTicketMutation.isPending ||
      updateTicketMutation.isPending ||
      updateStatusMutation.isPending ||
      deleteTicketMutation.isPending,
    mutationError:
      createTicketMutation.error ??
      updateTicketMutation.error ??
      updateStatusMutation.error ??
      deleteTicketMutation.error,
  };
}

export function useDashboardMetrics() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: () => ticketRepository.getDashboardMetrics(),
  });
}
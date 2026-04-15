import { DashboardMetrics, Ticket } from '../types';

export function computeDashboardMetrics(tickets: Ticket[]): DashboardMetrics {
  const totalTickets = tickets.length;
  const openTickets = tickets.filter((ticket) => ticket.status === 'OPEN').length;
  const inProgressTickets = tickets.filter((ticket) => ticket.status === 'IN_PROGRESS').length;
  const resolvedTickets = tickets.filter((ticket) => ticket.status === 'RESOLVED').length;
  const resolved = tickets.filter((ticket) => ticket.status === 'RESOLVED');

  const averageResolutionTime =
    resolved.length > 0
      ? Math.round((resolved.reduce((sum, ticket) => sum + ticket.resolutionTimeHours, 0) / resolved.length) * 10) / 10
      : 0;

  return {
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    averageResolutionTime,
    statusDistribution: [
      { name: 'Open', value: openTickets },
      { name: 'In Progress', value: inProgressTickets },
      { name: 'Resolved', value: resolvedTickets },
    ],
    priorityDistribution: [
      { name: 'High', value: tickets.filter((ticket) => ticket.priority === 'HIGH').length },
      { name: 'Medium', value: tickets.filter((ticket) => ticket.priority === 'MEDIUM').length },
      { name: 'Low', value: tickets.filter((ticket) => ticket.priority === 'LOW').length },
    ],
  };
}
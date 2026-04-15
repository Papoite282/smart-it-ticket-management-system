import { DashboardMetrics, Ticket, TicketAuditEvent } from '../types/ticket';
import { buildSlaDueAt, getSlaHours, getSlaStatus } from './slaService';

export const appConfig = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL?.trim() || '',
  dataSource: import.meta.env.VITE_DATA_SOURCE?.trim().toLowerCase() || 'mock',
};

export function shouldUseApiBackend() {
  return appConfig.dataSource === 'api' && Boolean(appConfig.apiBaseUrl);
}

export function normalizeTicket(raw: Ticket): Ticket {
  return {
    ...raw,
    resolvedAt: raw.resolvedAt || undefined,
    resolutionTimeHours: Number(raw.resolutionTimeHours ?? 0),
  };
}

export function normalizeDashboardMetrics(raw: DashboardMetrics): DashboardMetrics {
  return {
    ...raw,
    totalTickets: Number(raw.totalTickets ?? 0),
    openTickets: Number(raw.openTickets ?? 0),
    inProgressTickets: Number(raw.inProgressTickets ?? 0),
    resolvedTickets: Number(raw.resolvedTickets ?? 0),
    averageResolutionTime: Number(raw.averageResolutionTime ?? 0),
    statusDistribution: raw.statusDistribution ?? [],
    priorityDistribution: raw.priorityDistribution ?? [],
  };
}

export function normalizeAuditEvent(raw: TicketAuditEvent): TicketAuditEvent {
  return {
    ...raw,
    createdAt: raw.createdAt,
  };
}

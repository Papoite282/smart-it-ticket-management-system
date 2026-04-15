import {
  ApiDeleteResponse,
  ApiListResponse,
  ApiResourceResponse,
  DashboardMetrics,
  Ticket,
  TicketInput,
  TicketStatus,
  TicketAuditEvent,
} from '../types/ticket';
import { appConfig, normalizeAuditEvent, normalizeDashboardMetrics, normalizeTicket } from './config';
import { authService } from './authService';

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const token = authService.getAuthToken();
  const response = await fetch(`${appConfig.apiBaseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorBody = (await response.json()) as { message?: string };
      if (errorBody.message) {
        message = errorBody.message;
      }
    } catch {
      // Preserve the default message when the response body is not JSON.
    }

    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  async getTickets() {
    const response = await request<ApiListResponse<Ticket>>('/tickets');
    return response.data.map(normalizeTicket);
  },

  async getTicketAudit(ticketId: string) {
    const response = await request<ApiListResponse<TicketAuditEvent>>(`/tickets/${ticketId}/audit`);
    return response.data.map(normalizeAuditEvent);
  },

  async createTicket(payload: TicketInput) {
    const response = await request<ApiResourceResponse<Ticket>>('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return normalizeTicket(response.data);
  },

  async updateTicket(id: string, payload: TicketInput) {
    const response = await request<ApiResourceResponse<Ticket>>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    return normalizeTicket(response.data);
  },

  async updateTicketStatus(id: string, status: TicketStatus) {
    const response = await request<ApiResourceResponse<Ticket>>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    return normalizeTicket(response.data);
  },

  async deleteTicket(id: string) {
    return request<ApiDeleteResponse>(`/tickets/${id}`, {
      method: 'DELETE',
    });
  },

  async getDashboardMetrics() {
    const response = await request<ApiResourceResponse<DashboardMetrics>>('/dashboard/metrics');
    return normalizeDashboardMetrics(response.data);
  },
};

export { ApiError };
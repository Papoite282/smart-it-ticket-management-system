export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
export type UserRole = 'ADMIN' | 'AGENT' | 'VIEWER';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionTimeHours: number;
}

export interface TicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignee: string;
}

export interface DashboardMetrics {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number;
  statusDistribution: Array<{ name: string; value: number }>;
  priorityDistribution: Array<{ name: string; value: number }>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}
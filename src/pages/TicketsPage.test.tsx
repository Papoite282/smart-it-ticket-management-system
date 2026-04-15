import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TicketsPage from './TicketsPage';
import { renderWithProviders } from '../test/renderWithProviders';
import { useAuthStore } from '../store/authStore';
import { Ticket } from '../types/ticket';

vi.mock('../hooks/useTickets', () => ({
  useTickets: vi.fn(),
}));

import { useTickets } from '../hooks/useTickets';

const mockedUseTickets = vi.mocked(useTickets);

const tickets: Ticket[] = [
  {
    id: 'ticket-1',
    title: 'VPN access issue',
    description: 'Remote employees cannot connect.',
    priority: 'HIGH',
    status: 'OPEN',
    assignee: 'Admin',
    createdAt: '2026-04-07T08:00:00.000Z',
    updatedAt: '2026-04-07T08:00:00.000Z',
    resolutionTimeHours: 0,
  },
];

const createTicket = vi.fn();
const updateTicket = vi.fn();
const deleteTicket = vi.fn();
const refetch = vi.fn();

function setRole(role: 'ADMIN' | 'AGENT' | 'VIEWER') {
  useAuthStore.setState({
    user: {
      id: `${role.toLowerCase()}-1`,
      name: `${role} User`,
      email: `${role.toLowerCase()}@smartit.local`,
      role,
      avatar: role.slice(0, 2),
    },
    token: 'token',
    hydrated: true,
  });
}

describe('TicketsPage RBAC and CRUD flows', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseTickets.mockReturnValue({
      filteredTickets: tickets,
      assignees: ['Admin'],
      isLoading: false,
      isError: false,
      refetch,
      createTicket,
      updateTicket,
      deleteTicket,
      isMutating: false,
      mutationError: null,
      tickets,
      data: tickets,
    } as never);
  });

  it('keeps viewers read-only', () => {
    setRole('VIEWER');
    renderWithProviders(<TicketsPage />);

    expect(screen.queryByRole('button', { name: 'New Ticket' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
    expect(screen.getByText(/VIEWER access is read-only/i)).toBeInTheDocument();
  });

  it('allows agents to create and edit but not delete', () => {
    setRole('AGENT');
    renderWithProviders(<TicketsPage />);

    expect(screen.getByRole('button', { name: 'New Ticket' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('allows admins to delete tickets', () => {
    setRole('ADMIN');
    renderWithProviders(<TicketsPage />);

    expect(screen.getByRole('button', { name: 'New Ticket' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
  });

  it('opens the create modal and submits a new ticket', async () => {
    const user = userEvent.setup();
    createTicket.mockResolvedValue(undefined);
    setRole('AGENT');
    renderWithProviders(<TicketsPage />);

    await user.click(screen.getByRole('button', { name: 'New Ticket' }));

    expect(screen.getByText('Log a new IT issue')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Title'), 'New laptop request');
    await user.type(screen.getByLabelText('Description'), 'Need a high-spec laptop for development');
    await user.selectOptions(screen.getByLabelText('Priority'), 'MEDIUM');
    await user.selectOptions(screen.getByLabelText('Status'), 'OPEN');
    await user.type(screen.getByLabelText('Assignee'), 'Marco');
    await user.click(screen.getByRole('button', { name: 'Create Ticket' }));

    await waitFor(() => {
      expect(createTicket).toHaveBeenCalledWith({
        title: 'New laptop request',
        description: 'Need a high-spec laptop for development',
        priority: 'MEDIUM',
        status: 'OPEN',
        assignee: 'Marco',
      });
    });

    expect(screen.queryByText('Log a new IT issue')).not.toBeInTheDocument();
  });

  it('opens the edit modal with existing values and submits changes', async () => {
    const user = userEvent.setup();
    updateTicket.mockResolvedValue(undefined);
    setRole('AGENT');
    renderWithProviders(<TicketsPage />);

    await user.click(screen.getByRole('button', { name: 'Edit' }));

    expect(screen.getByText('Update incident details')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toHaveValue('VPN access issue');
    expect(screen.getByLabelText('Assignee')).toHaveValue('Admin');

    await user.clear(screen.getByLabelText('Title'));
    await user.type(screen.getByLabelText('Title'), 'VPN access issue resolved');
    await user.selectOptions(screen.getByLabelText('Status'), 'RESOLVED');
    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(updateTicket).toHaveBeenCalledWith({
        id: 'ticket-1',
        payload: {
          title: 'VPN access issue resolved',
          description: 'Remote employees cannot connect.',
          priority: 'HIGH',
          status: 'RESOLVED',
          assignee: 'Admin',
        },
      });
    });

    expect(screen.queryByText('Update incident details')).not.toBeInTheDocument();
  });

  it('deletes a ticket only after confirmation', async () => {
    const user = userEvent.setup();
    deleteTicket.mockResolvedValue(undefined);
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
    setRole('ADMIN');
    renderWithProviders(<TicketsPage />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(confirmSpy).toHaveBeenCalledWith('Delete ticket "VPN access issue"?');
    await waitFor(() => {
      expect(deleteTicket).toHaveBeenCalledWith('ticket-1');
    });
  });

  it('does not delete a ticket when confirmation is canceled', async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    setRole('ADMIN');
    renderWithProviders(<TicketsPage />);

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(confirmSpy).toHaveBeenCalledWith('Delete ticket "VPN access issue"?');
    expect(deleteTicket).not.toHaveBeenCalled();
  });
});
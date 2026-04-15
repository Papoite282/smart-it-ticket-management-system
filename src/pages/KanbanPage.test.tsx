import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KanbanPage from './KanbanPage';
import { renderWithProviders } from '../test/renderWithProviders';
import { useAuthStore } from '../store/authStore';
import { Ticket } from '../types/ticket';

vi.mock('../hooks/useTickets', () => ({
  useTickets: vi.fn(),
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragEnd }: any) => (
    <div>
      <button
        type="button"
        onClick={() => {
          const ticket = (globalThis as any).__KANBAN_TEST_TICKET__;
          onDragStart?.({ active: { data: { current: ticket } } });
          onDragEnd?.({
            active: { data: { current: ticket } },
            over: { id: 'IN_PROGRESS' },
          });
        }}
      >
        Simulate Drag
      </button>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: any) => <div>{children}</div>,
  PointerSensor: function PointerSensor() {
    return null;
  },
  useSensor: () => ({}),
  useSensors: (...args: any[]) => args,
  useDraggable: ({ disabled, data }: any) => ({
    attributes: {},
    listeners: disabled ? {} : { 'data-draggable': 'true' },
    setNodeRef: () => undefined,
    transform: null,
    isDragging: false,
    data,
  }),
  useDroppable: () => ({
    setNodeRef: () => undefined,
    isOver: false,
  }),
}));

import { useTickets } from '../hooks/useTickets';

const mockedUseTickets = vi.mocked(useTickets);

const openTicket: Ticket = {
  id: 'ticket-1',
  title: 'VPN access issue',
  description: 'Remote employees cannot connect.',
  priority: 'HIGH',
  status: 'OPEN',
  assignee: 'Admin',
  createdAt: '2026-04-07T08:00:00.000Z',
  updatedAt: '2026-04-07T08:00:00.000Z',
  resolutionTimeHours: 0,
};

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

describe('KanbanPage', () => {
  beforeEach(() => {
    (globalThis as any).__KANBAN_TEST_TICKET__ = openTicket;
    mockedUseTickets.mockReturnValue({
      filteredTickets: [openTicket],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      updateTicketStatus: vi.fn().mockResolvedValue(undefined),
      updateTicket: vi.fn(),
      deleteTicket: vi.fn(),
      isMutating: false,
    } as never);
  });

  it('allows agents to move tickets through the kanban workflow', async () => {
    const user = userEvent.setup();
    setRole('AGENT');
    renderWithProviders(<KanbanPage />);

    await user.click(screen.getByRole('button', { name: 'Simulate Drag' }));

    expect(mockedUseTickets.mock.results[0].value.updateTicketStatus).toHaveBeenCalledWith({
      id: 'ticket-1',
      status: 'IN_PROGRESS',
    });
  });

  it('prevents viewers from moving tickets and shows the permission warning', async () => {
    const user = userEvent.setup();
    setRole('VIEWER');
    renderWithProviders(<KanbanPage />);

    await user.click(screen.getByRole('button', { name: 'Simulate Drag' }));

    expect(screen.getByText(/VIEWER access can view board progress/i)).toBeInTheDocument();
    expect(mockedUseTickets.mock.results[0].value.updateTicketStatus).not.toHaveBeenCalled();
  });
});
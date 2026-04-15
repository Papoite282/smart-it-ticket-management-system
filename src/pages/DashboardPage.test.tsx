import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './DashboardPage';
import { renderWithProviders } from '../test/renderWithProviders';

vi.mock('../hooks/useTickets', () => ({
  useDashboardMetrics: vi.fn(),
}));

vi.mock('../components/tickets/DashboardCharts', () => ({
  default: ({ metrics }: any) => (
    <div>
      <div>Charts Rendered</div>
      <div>Total Status Buckets: {metrics.statusDistribution.length}</div>
      <div>Total Priority Buckets: {metrics.priorityDistribution.length}</div>
    </div>
  ),
}));

import { useDashboardMetrics } from '../hooks/useTickets';

const mockedUseDashboardMetrics = vi.mocked(useDashboardMetrics);

describe('DashboardPage', () => {
  it('shows the loading state', () => {
    mockedUseDashboardMetrics.mockReturnValue({
      isLoading: true,
      isError: false,
      data: undefined,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Loading dashboard metrics...')).toBeInTheDocument();
  });

  it('shows the error state and retries when requested', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn();

    mockedUseDashboardMetrics.mockReturnValue({
      isLoading: false,
      isError: true,
      data: undefined,
      refetch,
    } as never);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('renders metrics and chart sections on success', () => {
    mockedUseDashboardMetrics.mockReturnValue({
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      data: {
        totalTickets: 12,
        openTickets: 5,
        inProgressTickets: 4,
        resolvedTickets: 3,
        averageResolutionTime: 6.5,
        statusDistribution: [
          { name: 'Open', value: 5 },
          { name: 'In Progress', value: 4 },
          { name: 'Resolved', value: 3 },
        ],
        priorityDistribution: [
          { name: 'High', value: 4 },
          { name: 'Medium', value: 5 },
          { name: 'Low', value: 3 },
        ],
      },
    } as never);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('Smart IT Command Center')).toBeInTheDocument();
    expect(screen.getByText('Total Tickets')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Open Tickets')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('Avg. Resolution')).toBeInTheDocument();
    expect(screen.getByText('6.5h')).toBeInTheDocument();
    expect(screen.getByText('Charts Rendered')).toBeInTheDocument();
    expect(screen.getByText('Total Status Buckets: 3')).toBeInTheDocument();
    expect(screen.getByText('Total Priority Buckets: 3')).toBeInTheDocument();
  });

  it('renders zero-state metric values without crashing', () => {
    mockedUseDashboardMetrics.mockReturnValue({
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
      data: {
        totalTickets: 0,
        openTickets: 0,
        inProgressTickets: 0,
        resolvedTickets: 0,
        averageResolutionTime: 0,
        statusDistribution: [],
        priorityDistribution: [],
      },
    } as never);

    renderWithProviders(<DashboardPage />);

    expect(screen.getByText('0h')).toBeInTheDocument();
    expect(screen.getByText('Total Status Buckets: 0')).toBeInTheDocument();
    expect(screen.getByText('Total Priority Buckets: 0')).toBeInTheDocument();
  });
});
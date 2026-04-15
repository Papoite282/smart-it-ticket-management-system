import { Activity, Clock9, FolderKanban, ShieldAlert } from 'lucide-react';
import ErrorState from '../components/common/ErrorState';
import LoadingState from '../components/common/LoadingState';
import SectionHeading from '../components/common/SectionHeading';
import DashboardCharts from '../components/tickets/DashboardCharts';
import MetricCard from '../components/tickets/MetricCard';
import { useDashboardMetrics } from '../hooks/useTickets';

function DashboardPage() {
  const metricsQuery = useDashboardMetrics();

  if (metricsQuery.isLoading) {
    return <LoadingState label="Loading dashboard metrics..." />;
  }

  if (metricsQuery.isError || !metricsQuery.data) {
    return <ErrorState onRetry={() => metricsQuery.refetch()} />;
  }

  const metrics = metricsQuery.data;

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Operations"
        title="Smart IT Command Center"
        description="A ServiceNow-inspired dashboard for monitoring ticket flow, prioritization, and service performance."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total Tickets"
          value={metrics.totalTickets}
          caption="All incidents currently stored in the system."
          icon={FolderKanban}
        />
        <MetricCard
          title="Open Tickets"
          value={metrics.openTickets}
          caption="Requests still awaiting triage or first action."
          icon={ShieldAlert}
        />
        <MetricCard
          title="In Progress"
          value={metrics.inProgressTickets}
          caption="Active incidents being worked on by the team."
          icon={Activity}
        />
        <MetricCard
          title="Avg. Resolution"
          value={`${metrics.averageResolutionTime}h`}
          caption="Mocked average time taken to resolve completed issues."
          icon={Clock9}
        />
      </div>

      <DashboardCharts metrics={metrics} />
    </div>
  );
}

export default DashboardPage;

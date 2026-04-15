import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { DashboardMetrics } from '../../types/ticket';

const PIE_COLORS = ['#30363d', '#806037', '#b09c76'];
const BAR_COLORS = ['#30363d', '#806037', '#b09c76'];

function DashboardCharts({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="glass-panel rounded-3xl border border-coffee-400/45 p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-coffee-950">Ticket Status Overview</h3>
          <p className="mt-1 text-sm text-coffee-500">Track how work is distributed across the delivery pipeline.</p>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={metrics.statusDistribution}
                dataKey="value"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
              >
                {metrics.statusDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f4eedc',
                  border: '1px solid #c8b999',
                  borderRadius: '16px',
                  color: '#251d19',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="glass-panel rounded-3xl border border-coffee-400/45 p-6">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-coffee-950">Priority Distribution</h3>
          <p className="mt-1 text-sm text-coffee-500">Monitor ticket urgency and workload pressure at a glance.</p>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.priorityDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#d1c6aa" />
              <XAxis dataKey="name" stroke="#4e3b2f" />
              <YAxis allowDecimals={false} stroke="#4e3b2f" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#f4eedc',
                  border: '1px solid #c8b999',
                  borderRadius: '16px',
                  color: '#251d19',
                }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {metrics.priorityDistribution.map((entry, index) => (
                  <Cell key={entry.name} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default DashboardCharts;

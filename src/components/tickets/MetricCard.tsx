import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  caption: string;
  icon: LucideIcon;
}

function MetricCard({ title, value, caption, icon: Icon }: MetricCardProps) {
  return (
    <div className="glass-panel rounded-3xl border border-coffee-500/45 p-5 shadow-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-coffee-500">{title}</p>
          <p className="mt-3 text-3xl font-bold text-coffee-950">{value}</p>
        </div>
        <div className="rounded-2xl bg-graphite-700/10 p-3 text-graphite-800">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-coffee-500">{caption}</p>
    </div>
  );
}

export default MetricCard;

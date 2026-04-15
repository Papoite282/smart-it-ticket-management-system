import { TicketStatus } from '../../types/ticket';

const statusStyles: Record<TicketStatus, string> = {
  OPEN: 'bg-cream-100 text-coffee-700 border-coffee-400/45',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 border-amber-200',
  RESOLVED: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[status]}`}>
      {statusLabels[status]}
    </span>
  );
}

export default StatusBadge;

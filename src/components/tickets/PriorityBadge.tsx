import { TicketPriority } from '../../types/ticket';

const priorityStyles: Record<TicketPriority, string> = {
  LOW: 'bg-cream-100 text-coffee-600 border border-coffee-400/45',
  MEDIUM: 'bg-brand-100 text-brand-800 border border-brand-200',
  HIGH: 'bg-rose-100 text-rose-800 border border-rose-200',
};

function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${priorityStyles[priority]}`}>{priority}</span>;
}

export default PriorityBadge;

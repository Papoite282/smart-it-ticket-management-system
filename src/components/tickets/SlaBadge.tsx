import { formatDistanceToNow } from 'date-fns';
import { Ticket } from '../../types/ticket';

const slaStyles: Record<Ticket['slaStatus'], string> = {
  ON_TRACK: 'border-emerald-200 bg-emerald-100 text-emerald-800',
  AT_RISK: 'border-amber-200 bg-amber-100 text-amber-800',
  BREACHED: 'border-rose-200 bg-rose-100 text-rose-800',
  MET: 'border-coffee-400/35 bg-cream-100 text-coffee-700',
};

const slaLabels: Record<Ticket['slaStatus'], string> = {
  ON_TRACK: 'SLA on track',
  AT_RISK: 'SLA at risk',
  BREACHED: 'SLA breached',
  MET: 'SLA met',
};

function SlaBadge({ ticket }: { ticket: Ticket }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${slaStyles[ticket.slaStatus]}`}>
      {slaLabels[ticket.slaStatus]} · {ticket.status === 'RESOLVED' ? 'resolved' : `due ${formatDistanceToNow(new Date(ticket.slaDueAt), { addSuffix: true })}`}
    </span>
  );
}

export default SlaBadge;

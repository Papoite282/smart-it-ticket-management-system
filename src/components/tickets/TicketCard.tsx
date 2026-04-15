import { Clock3, Pencil, Trash2, UserCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Ticket } from '../../types/ticket';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';
import SlaBadge from './SlaBadge';

interface TicketCardProps {
  ticket: Ticket;
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (ticket: Ticket) => void;
  compact?: boolean;
}

function TicketCard({ ticket, onEdit, onDelete, compact = false }: TicketCardProps) {
  return (
    <article className="rounded-3xl border border-coffee-500/45 bg-cream-50/82 p-5 interactive-lift transition hover:border-coffee-600/70 hover:bg-cream-50 hover:shadow-card">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={ticket.status} />
        <PriorityBadge priority={ticket.priority} />
      </div>

      <div className="mt-4">
        <h3 className="text-lg font-semibold text-coffee-950">{ticket.title}</h3>
        <p className={`mt-2 overflow-hidden text-sm text-coffee-500 ${compact ? 'max-h-11' : 'max-h-16'}`}>
          {ticket.description}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-sm text-coffee-500">
        <span className="inline-flex items-center gap-2">
          <UserCircle2 className="h-4 w-4" />
          {ticket.assignee}
        </span>
        <span className="inline-flex items-center gap-2">
          <Clock3 className="h-4 w-4" />
          Updated {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
        </span>
      </div>

      {(onEdit || onDelete) && (
        <div className="mt-5 flex items-center gap-3">
          {onEdit ? (
            <button
              type="button"
              onClick={() => onEdit(ticket)}
              className="inline-flex items-center gap-2 rounded-xl border border-coffee-400/45 px-3 py-2 text-sm text-coffee-700 interactive-lift transition hover:border-graphite-700 hover:bg-graphite-700 hover:text-cream-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          ) : null}
          {onDelete ? (
            <button
              type="button"
              onClick={() => onDelete(ticket)}
              className="inline-flex items-center gap-2 rounded-xl border border-rose-500/30 px-3 py-2 text-sm text-rose-700 interactive-lift transition hover:border-rose-600 hover:bg-rose-600 hover:text-cream-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          ) : null}
        </div>
      )}
    </article>
  );
}

export default TicketCard;

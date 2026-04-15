import type { ReactNode } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Ticket, TicketStatus } from '../../types/ticket';
import EmptyState from '../common/EmptyState';

interface KanbanColumnProps {
  title: string;
  status: TicketStatus;
  tickets: Ticket[];
  children?: ReactNode;
}

function KanbanColumn({ title, status, tickets, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <section
      ref={setNodeRef}
      className={`glass-panel min-h-[360px] rounded-3xl border p-5 transition ${
        isOver ? 'border-brand-400 bg-brand-500/10' : 'border-coffee-400/45'
      }`}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-coffee-950">{title}</h3>
          <p className="text-sm text-coffee-500">{tickets.length} tickets</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <EmptyState
          title="No tickets here"
          description="Drag a ticket into this lane or update its workflow status."
        />
      ) : (
        <div className="space-y-4">{children}</div>
      )}
    </section>
  );
}

export default KanbanColumn;

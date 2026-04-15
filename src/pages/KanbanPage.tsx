import { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Lock } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import LoadingState from '../components/common/LoadingState';
import SectionHeading from '../components/common/SectionHeading';
import KanbanColumn from '../components/tickets/KanbanColumn';
import TicketCard from '../components/tickets/TicketCard';
import TicketFormModal from '../components/tickets/TicketFormModal';
import { useAuth } from '../hooks/useAuth';
import { useTickets } from '../hooks/useTickets';
import { Ticket, TicketInput, TicketStatus } from '../types/ticket';

const columns: Array<{ title: string; status: TicketStatus }> = [
  { title: 'Open', status: 'OPEN' },
  { title: 'In Progress', status: 'IN_PROGRESS' },
  { title: 'Resolved', status: 'RESOLVED' },
];

function DraggableTicketCard({
  ticket,
  onEdit,
  onDelete,
  draggable,
}: {
  ticket: Ticket;
  onEdit?: (ticket: Ticket) => void;
  onDelete?: (ticket: Ticket) => void;
  draggable: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ticket.id,
    data: ticket,
    disabled: !draggable,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? 'opacity-60' : ''} {...listeners} {...attributes}>
      <TicketCard ticket={ticket} onEdit={onEdit} onDelete={onDelete} compact />
    </div>
  );
}

function KanbanPage() {
  const { filteredTickets, isLoading, isError, refetch, updateTicketStatus, updateTicket, deleteTicket, isMutating } =
    useTickets();
  const { user, canEditTickets, canDeleteTickets, canMoveTickets } = useAuth();
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function handleDragStart(event: DragStartEvent) {
    if (!canMoveTickets) {
      return;
    }

    setActiveTicket(event.active.data.current as Ticket);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveTicket(null);

    if (!canMoveTickets) {
      return;
    }

    const targetStatus = event.over?.id as TicketStatus | undefined;
    const draggedTicket = event.active.data.current as Ticket | undefined;

    if (!targetStatus || !draggedTicket || targetStatus === draggedTicket.status) {
      return;
    }

    await updateTicketStatus({ id: draggedTicket.id, status: targetStatus });
  }

  function handleEdit(ticket: Ticket) {
    if (!canEditTickets) {
      return;
    }

    setSelectedTicket(ticket);
    setIsModalOpen(true);
  }

  async function handleSubmit(payload: TicketInput, ticketId?: string) {
    if (!ticketId) {
      return;
    }

    await updateTicket({ id: ticketId, payload });
  }

  async function handleDelete(ticket: Ticket) {
    if (!canDeleteTickets) {
      return;
    }

    const confirmed = window.confirm(`Delete ticket "${ticket.title}"?`);
    if (!confirmed) {
      return;
    }

    await deleteTicket(ticket.id);
  }

  if (isLoading) {
    return <LoadingState label="Loading kanban board..." />;
  }

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  if (filteredTickets.length === 0) {
    return (
      <div className="space-y-6">
        <SectionHeading
          eyebrow="Execution"
          title="Kanban Workflow"
          description="Drag tickets across statuses to keep delivery progress visible to the team."
        />
        <EmptyState
          title="No tickets available for the board"
          description="Create or unfilter tickets from the Tickets view to populate the kanban board."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Execution"
        title="Kanban Workflow"
        description="Move tickets through Open, In Progress, and Resolved using drag and drop."
      />

      {!canMoveTickets ? (
        <div className="glass-panel flex items-center gap-3 rounded-3xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-900">
          <Lock className="h-4 w-4 text-amber-700" />
          <span>{user?.role} access can view board progress, but only agents and admins can move tickets between statuses.</span>
        </div>
      ) : null}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid gap-6 xl:grid-cols-3">
          {columns.map((column) => {
            const items = filteredTickets.filter((ticket) => ticket.status === column.status);

            return (
              <KanbanColumn key={column.status} title={column.title} status={column.status} tickets={items}>
                {items.map((ticket) => (
                  <DraggableTicketCard
                    key={ticket.id}
                    ticket={ticket}
                    onEdit={canEditTickets ? handleEdit : undefined}
                    onDelete={canDeleteTickets ? handleDelete : undefined}
                    draggable={canMoveTickets}
                  />
                ))}
              </KanbanColumn>
            );
          })}
        </div>
        <DragOverlay>{activeTicket ? <TicketCard ticket={activeTicket} compact /> : null}</DragOverlay>
      </DndContext>

      {isMutating ? <p className="text-sm text-coffee-500">Updating ticket workflow...</p> : null}

      <TicketFormModal
        isOpen={isModalOpen}
        initialTicket={selectedTicket}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        isSubmitting={isMutating}
      />
    </div>
  );
}

export default KanbanPage;
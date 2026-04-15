import { useState } from 'react';
import { Lock, Plus } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import LoadingState from '../components/common/LoadingState';
import SectionHeading from '../components/common/SectionHeading';
import TicketCard from '../components/tickets/TicketCard';
import TicketFilters from '../components/tickets/TicketFilters';
import TicketFormModal from '../components/tickets/TicketFormModal';
import { useAuth } from '../hooks/useAuth';
import { useTicketAudit, useTickets } from '../hooks/useTickets';
import { Ticket, TicketInput } from '../types/ticket';

function TicketsPage() {
  const {
    filteredTickets,
    assignees,
    isLoading,
    isError,
    refetch,
    createTicket,
    updateTicket,
    deleteTicket,
    isMutating,
    mutationError,
  } = useTickets();
  const { user, canCreateTickets, canEditTickets, canDeleteTickets } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const auditQuery = useTicketAudit(selectedTicket?.id);

  function handleCreateClick() {
    if (!canCreateTickets) {
      return;
    }

    setSelectedTicket(null);
    setIsModalOpen(true);
  }

  function handleEditClick(ticket: Ticket) {
    if (!canEditTickets) {
      return;
    }

    setSelectedTicket(ticket);
    setIsModalOpen(true);
  }

  async function handleSubmit(payload: TicketInput, ticketId?: string) {
    if (ticketId) {
      await updateTicket({ id: ticketId, payload });
      return;
    }

    await createTicket(payload);
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

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Workflow"
        title="Ticket Lifecycle Management"
        description="Create, edit, filter, and resolve incidents with automation-aware workflows and responsive operator tooling."
        action={
          canCreateTickets ? (
            <button
              type="button"
              onClick={handleCreateClick}
              className="inline-flex items-center gap-2 rounded-2xl border border-coffee-400/35 bg-cream-50 px-4 py-3 text-sm font-semibold text-coffee-950 interactive-lift transition hover:border-coffee-950 hover:bg-coffee-900 hover:text-cream-50"
            >
              <Plus className="h-4 w-4" />
              New Ticket
            </button>
          ) : null
        }
      />

      {!canCreateTickets ? (
        <div className="glass-panel flex items-center gap-3 rounded-3xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-900">
          <Lock className="h-4 w-4 text-amber-700" />
          <span>{user?.role} access is read-only. Agents and admins can create and edit tickets. Only admins can delete them.</span>
        </div>
      ) : null}

      <TicketFilters assignees={assignees} />

      {mutationError ? (
        <ErrorState
          title="Action failed"
          description={(mutationError as Error).message || 'We could not persist your ticket changes.'}
        />
      ) : null}

      {isLoading ? <LoadingState label="Loading tickets..." /> : null}
      {isError ? <ErrorState onRetry={() => refetch()} /> : null}

      {!isLoading && !isError && filteredTickets.length === 0 ? (
        <EmptyState
          title="No tickets match the current filters"
          description="Adjust your filters or create a new ticket to start tracking operational work."
          actionLabel={canCreateTickets ? 'Create Ticket' : undefined}
          onAction={canCreateTickets ? handleCreateClick : undefined}
        />
      ) : null}

      {!isLoading && !isError && filteredTickets.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onEdit={canEditTickets ? handleEditClick : undefined}
              onDelete={canDeleteTickets ? handleDelete : undefined}
            />
          ))}
        </div>
      ) : null}

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

export default TicketsPage;
import { useEffect, useState } from 'react';
import { Ticket, TicketInput } from '../../types/ticket';

interface TicketFormModalProps {
  isOpen: boolean;
  initialTicket?: Ticket | null;
  onClose: () => void;
  onSubmit: (payload: TicketInput, ticketId?: string) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultState: TicketInput = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'OPEN',
  assignee: '',
};

function TicketFormModal({
  isOpen,
  initialTicket,
  onClose,
  onSubmit,
  isSubmitting = false,
}: TicketFormModalProps) {
  const [formState, setFormState] = useState<TicketInput>(defaultState);

  useEffect(() => {
    if (initialTicket) {
      setFormState({
        title: initialTicket.title,
        description: initialTicket.description,
        priority: initialTicket.priority,
        status: initialTicket.status,
        assignee: initialTicket.assignee,
      });
      return;
    }

    setFormState(defaultState);
  }, [initialTicket, isOpen]);

  if (!isOpen) {
    return null;
  }

  const isEditMode = Boolean(initialTicket);
  const isInvalid = !formState.title.trim() || !formState.description.trim() || !formState.assignee.trim();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isInvalid) {
      return;
    }

    await onSubmit(
      {
        ...formState,
        title: formState.title.trim(),
        description: formState.description.trim(),
        assignee: formState.assignee.trim(),
      },
      initialTicket?.id,
    );

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-coffee-950/45 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl rounded-[32px] border border-coffee-400/45 p-6 shadow-card">
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.28em] text-coffee-600">
            {isEditMode ? 'Edit Ticket' : 'Create Ticket'}
          </p>
          <h3 className="mt-2 font-display text-3xl font-semibold text-coffee-900">
            {isEditMode ? 'Update incident details' : 'Log a new IT issue'}
          </h3>
          <p className="mt-2 text-sm text-coffee-500">
            Smart automation will escalate urgent requests and assign high-priority tickets to Admin.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-coffee-600">Title</span>
              <input
                value={formState.title}
                onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
                placeholder="Describe the issue"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-coffee-600">Description</span>
              <textarea
                value={formState.description}
                onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                rows={5}
                className="w-full rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
                placeholder="Add technical context, symptoms, and business impact"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-coffee-600">Priority</span>
              <select
                value={formState.priority}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, priority: event.target.value as TicketInput['priority'] }))
                }
                className="w-full rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm text-coffee-600">Status</span>
              <select
                value={formState.status}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, status: event.target.value as TicketInput['status'] }))
                }
                className="w-full rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
              </select>
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm text-coffee-600">Assignee</span>
              <input
                value={formState.assignee}
                onChange={(event) => setFormState((prev) => ({ ...prev, assignee: event.target.value }))}
                className="w-full rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
                placeholder="e.g. Admin, Mia, Leo"
              />
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-coffee-400/45 px-4 py-3 text-sm font-medium text-coffee-700 interactive-lift transition hover:border-graphite-700 hover:bg-graphite-700 hover:text-cream-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isInvalid || isSubmitting}
              className="rounded-2xl bg-graphite-800 px-4 py-3 text-sm font-semibold text-cream-50 interactive-lift transition hover:bg-coffee-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TicketFormModal;

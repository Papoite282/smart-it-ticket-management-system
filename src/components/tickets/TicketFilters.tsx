import { Search, X } from 'lucide-react';
import { useTicketFiltersStore } from '../../store/ticketFiltersStore';
import { TicketPriority, TicketStatus } from '../../types/ticket';

interface TicketFiltersProps {
  assignees: string[];
}

const statusOptions: Array<TicketStatus | 'ALL'> = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'];
const priorityOptions: Array<TicketPriority | 'ALL'> = ['ALL', 'LOW', 'MEDIUM', 'HIGH'];

function TicketFilters({ assignees }: TicketFiltersProps) {
  const { search, status, priority, assignee, setSearch, setStatus, setPriority, setAssignee, reset } =
    useTicketFiltersStore();

  return (
    <div className="glass-panel rounded-3xl border border-coffee-500/45 p-5">
      <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-coffee-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tickets, descriptions, or assignees"
            className="w-full rounded-2xl border border-coffee-400/45 bg-cream-50 py-3 pl-11 pr-4 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
          />
        </label>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as TicketStatus | 'ALL')}
          className="rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
        >
          {statusOptions.map((item) => (
            <option key={item} value={item}>
              {item === 'ALL' ? 'All Statuses' : item.replace('_', ' ')}
            </option>
          ))}
        </select>

        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value as TicketPriority | 'ALL')}
          className="rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
        >
          {priorityOptions.map((item) => (
            <option key={item} value={item}>
              {item === 'ALL' ? 'All Priorities' : item}
            </option>
          ))}
        </select>

        <div className="flex gap-3">
          <select
            value={assignee}
            onChange={(event) => setAssignee(event.target.value)}
            className="min-w-0 flex-1 rounded-2xl border border-coffee-400/45 bg-cream-50 px-4 py-3 text-sm text-coffee-950 outline-none transition focus:border-brand-500"
          >
            <option value="ALL">All Assignees</option>
            {assignees.map((person) => (
              <option key={person} value={person}>
                {person}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-2xl border border-coffee-400/45 px-4 py-3 text-sm text-coffee-700 interactive-lift transition hover:border-graphite-700 hover:bg-graphite-700 hover:text-cream-50"
          >
            <X className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}

export default TicketFilters;

import { create } from 'zustand';
import { TicketFilters } from '../types/ticket';

interface TicketFiltersState extends TicketFilters {
  setSearch: (search: string) => void;
  setStatus: (status: TicketFilters['status']) => void;
  setPriority: (priority: TicketFilters['priority']) => void;
  setAssignee: (assignee: TicketFilters['assignee']) => void;
  reset: () => void;
}

const initialState: TicketFilters = {
  search: '',
  status: 'ALL',
  priority: 'ALL',
  assignee: 'ALL',
};

export const useTicketFiltersStore = create<TicketFiltersState>((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setStatus: (status) => set({ status }),
  setPriority: (priority) => set({ priority }),
  setAssignee: (assignee) => set({ assignee }),
  reset: () => set(initialState),
}));

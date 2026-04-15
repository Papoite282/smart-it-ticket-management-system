import { TicketInput } from '../types';

const URGENT_KEYWORDS = ['urgent', 'immediately', 'asap', 'critical', 'sev1'];

export function applyTicketAutomation(input: TicketInput): TicketInput {
  const searchableContent = `${input.title} ${input.description}`.toLowerCase();
  const containsUrgentKeyword = URGENT_KEYWORDS.some((keyword) => searchableContent.includes(keyword));
  const normalizedPriority = containsUrgentKeyword ? 'HIGH' : input.priority;
  const normalizedAssignee = normalizedPriority === 'HIGH' ? 'Admin' : input.assignee;

  return {
    ...input,
    priority: normalizedPriority,
    assignee: normalizedAssignee,
  };
}
import { apiClient } from './apiClient';
import { shouldUseApiBackend } from './config';
import { mockApi } from './mockApi';

export const ticketRepository = shouldUseApiBackend() ? apiClient : mockApi;

export function getActiveDataSourceLabel() {
  return shouldUseApiBackend() ? 'API backend' : 'Mock backend';
}

import { describe, expect, it } from 'vitest';
import { getRoleCapabilities, hasRequiredRole } from './permissionService';

describe('permissionService', () => {
  it('grants admins the highest level of access', () => {
    expect(hasRequiredRole('ADMIN', 'AGENT')).toBe(true);
    expect(hasRequiredRole('ADMIN', 'VIEWER')).toBe(true);
    expect(getRoleCapabilities('ADMIN')).toEqual({
      canCreateTickets: true,
      canEditTickets: true,
      canDeleteTickets: true,
      canMoveTickets: true,
    });
  });

  it('allows agents to create, edit, and move but not delete', () => {
    expect(hasRequiredRole('AGENT', 'VIEWER')).toBe(true);
    expect(hasRequiredRole('AGENT', 'ADMIN')).toBe(false);
    expect(getRoleCapabilities('AGENT')).toEqual({
      canCreateTickets: true,
      canEditTickets: true,
      canDeleteTickets: false,
      canMoveTickets: true,
    });
  });

  it('keeps viewers read-only', () => {
    expect(hasRequiredRole('VIEWER', 'AGENT')).toBe(false);
    expect(getRoleCapabilities('VIEWER')).toEqual({
      canCreateTickets: false,
      canEditTickets: false,
      canDeleteTickets: false,
      canMoveTickets: false,
    });
  });
});
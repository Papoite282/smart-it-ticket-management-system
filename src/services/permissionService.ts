import { UserRole } from '../types/auth';

export const roleRank: Record<UserRole, number> = {
  VIEWER: 1,
  AGENT: 2,
  ADMIN: 3,
};

export function hasRequiredRole(currentRole: UserRole | null | undefined, requiredRole: UserRole) {
  if (!currentRole) {
    return false;
  }

  return roleRank[currentRole] >= roleRank[requiredRole];
}

export function getRoleCapabilities(role: UserRole | null | undefined) {
  return {
    canCreateTickets: hasRequiredRole(role, 'AGENT'),
    canEditTickets: hasRequiredRole(role, 'AGENT'),
    canDeleteTickets: hasRequiredRole(role, 'ADMIN'),
    canMoveTickets: hasRequiredRole(role, 'AGENT'),
  };
}
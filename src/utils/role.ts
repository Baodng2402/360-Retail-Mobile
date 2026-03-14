import type { UserProfile } from '@/src/types';

type RawRole = UserProfile['role'] | string[] | string | null | undefined;

function toRoleArray(rawRole: RawRole): string[] {
  if (Array.isArray(rawRole)) {
    return rawRole
      .flatMap((r) => String(r).split(','))
      .map((r) => r.trim())
      .filter(Boolean);
  }

  if (typeof rawRole === 'string') {
    return rawRole
      .split(',')
      .map((r) => r.trim())
      .filter(Boolean);
  }

  return [];
}

export function normalizeRoles(rawRole: RawRole): string[] {
  const roleSet = new Set(toRoleArray(rawRole).map((r) => r.toLowerCase()));
  return Array.from(roleSet);
}

export function hasRole(rawRole: RawRole, role: string): boolean {
  return normalizeRoles(rawRole).includes(role.toLowerCase());
}

export function hasAnyRole(rawRole: RawRole, roles: string[]): boolean {
  if (roles.length === 0) return true;
  const normalized = normalizeRoles(rawRole);
  return roles.some((role) => normalized.includes(role.toLowerCase()));
}

export function getPrimaryRole(rawRole: RawRole): string {
  const normalized = normalizeRoles(rawRole);
  return normalized[0] ?? '';
}

export function isManagerOrOwner(rawRole: RawRole): boolean {
  return hasAnyRole(rawRole, ['Manager', 'StoreOwner']);
}

export function isStoreOwner(rawRole: RawRole): boolean {
  return hasRole(rawRole, 'StoreOwner');
}

export function isStaff(rawRole: RawRole): boolean {
  return hasRole(rawRole, 'Staff');
}

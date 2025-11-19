import { Role } from '@prisma/client'

/**
 * RBAC (Role-Based Access Control) utility functions
 *
 * Role hierarchy (from highest to lowest privilege):
 * 1. INCUBATOR_ADMIN - Full access to all portfolio startups
 * 2. STARTUP_ADMIN - Full access to their own startup
 * 3. STARTUP_USER - Limited access (read + upload) to their startup
 * 4. INVESTOR_VIEWER - Read-only access to granted startups
 */

export { Role }

export type Permission =
  | 'read'
  | 'create'
  | 'update'
  | 'delete'
  | 'verify'
  | 'invite'
  | 'manage_roles'
  | 'view_portfolio'

export type Resource =
  | 'documents'
  | 'one_pager'
  | 'assessment'
  | 'team'
  | 'investors'
  | 'settings'
  | 'portfolio'

/**
 * Check if a user role has permission to perform an action on a resource
 */
export function checkPermission(
  userRole: Role,
  permission: Permission,
  resource: Resource,
  options?: {
    isOwner?: boolean // User is the owner of the specific resource
    isStartupAdmin?: boolean // User is admin of the startup
  }
): boolean {
  const { isOwner = false, isStartupAdmin = false } = options || {}

  // INCUBATOR_ADMIN can do anything
  if (userRole === Role.INCUBATOR_ADMIN) {
    return true
  }

  // STARTUP_ADMIN has full access to their startup
  if (userRole === Role.STARTUP_ADMIN || isStartupAdmin) {
    // Can't access portfolio view
    if (resource === 'portfolio') return false
    return true
  }

  // STARTUP_USER has limited permissions
  if (userRole === Role.STARTUP_USER) {
    // Can read most things
    if (permission === 'read') {
      return ['documents', 'one_pager', 'assessment', 'team'].includes(resource)
    }

    // Can create/upload documents and edit one-pager
    if (permission === 'create') {
      return ['documents', 'one_pager'].includes(resource)
    }

    // Can update their own uploads or one-pager
    if (permission === 'update' && isOwner) {
      return ['documents', 'one_pager'].includes(resource)
    }

    // Can delete their own uploads
    if (permission === 'delete' && isOwner) {
      return resource === 'documents'
    }

    return false
  }

  // INVESTOR_VIEWER can only read
  if (userRole === Role.INVESTOR_VIEWER) {
    if (permission === 'read') {
      return ['documents', 'one_pager', 'assessment'].includes(resource)
    }
    return false
  }

  return false
}

/**
 * Get all allowed actions for a role on a specific resource
 */
export function getAllowedActions(
  userRole: Role,
  resource: Resource,
  isOwner = false
): Permission[] {
  const permissions: Permission[] = ['read', 'create', 'update', 'delete', 'verify', 'invite', 'manage_roles', 'view_portfolio']

  return permissions.filter(permission =>
    checkPermission(userRole, permission, resource, { isOwner })
  )
}

/**
 * Check if user can access startup data
 */
export function canAccessStartup(
  userRole: Role,
  hasStartupAccess: boolean
): boolean {
  // Incubator admin can access all startups
  if (userRole === Role.INCUBATOR_ADMIN) {
    return true
  }

  // Others need explicit access via StartupUser or InvestorGrant
  return hasStartupAccess
}

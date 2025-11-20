import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import type { Startup } from '@prisma/client'

/**
 * Multi-tenancy utilities
 *
 * DueRify uses a tenant-per-row pattern where every data table includes
 * a startupId foreign key for data isolation.
 */

/**
 * Get all startups the current user has access to
 * For investors, this returns startups they have been granted access to
 */
export async function getUserStartups(): Promise<Startup[]> {
  const session = await auth()
  if (!session?.user?.id) {
    return []
  }

  // For investors, get startups via investor grants
  if (session.user.role === 'INVESTOR_VIEWER') {
    const investorGrants = await prisma.investorGrant.findMany({
      where: { investorId: session.user.id },
      include: { startup: true }
    })
    return investorGrants.map(ig => ig.startup)
  }

  // For regular users, get startups via startup users
  const startupUsers = await prisma.startupUser.findMany({
    where: { userId: session.user.id },
    include: { startup: true }
  })

  return startupUsers.map(su => su.startup)
}

/**
 * Get the current startup context
 * Returns the first startup the user has access to
 * In a real app, this would check session/cookie for last selected startup
 */
export async function getCurrentStartup(): Promise<Startup | null> {
  const startups = await getUserStartups()
  return startups[0] || null
}

/**
 * Check if a user has access to a specific startup
 * Handles both regular users and investors
 */
export async function checkUserStartupAccess(
  userId: string,
  startupId: string
): Promise<boolean> {
  // Check regular user access
  const startupUser = await prisma.startupUser.findUnique({
    where: {
      userId_startupId: { userId, startupId }
    }
  })

  if (startupUser) {
    return true
  }

  // Check investor access
  const investorGrant = await prisma.investorGrant.findUnique({
    where: {
      investorId_startupId: { investorId: userId, startupId }
    }
  })

  return investorGrant !== null
}

/**
 * Get user's role in a specific startup
 */
export async function getUserRoleInStartup(
  userId: string,
  startupId: string
) {
  const startupUser = await prisma.startupUser.findUnique({
    where: {
      userId_startupId: { userId, startupId }
    }
  })

  return startupUser?.role || null
}

/**
 * Check if investor has access to a startup
 */
export async function checkInvestorAccess(
  investorId: string,
  startupId: string
): Promise<boolean> {
  const grant = await prisma.investorGrant.findUnique({
    where: {
      investorId_startupId: { investorId, startupId }
    }
  })

  return grant !== null
}

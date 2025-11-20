import { auth } from '@/lib/auth'
import { getCurrentStartup, getUserStartups } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { InvestorsPageClient } from './page-client'
import prisma from '@/lib/prisma'

export default async function InvestorsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Check if user has admin access
  const userRole = session.user.role
  if (userRole !== 'STARTUP_ADMIN' && userRole !== 'INCUBATOR_ADMIN') {
    redirect('/dashboard')
  }

  const currentStartup = await getCurrentStartup()

  if (!currentStartup && userRole === 'STARTUP_ADMIN') {
    redirect('/dashboard')
  }

  // For incubator admins, get all startups
  let availableStartups: { id: string; name: string }[] = []
  if (userRole === 'INCUBATOR_ADMIN') {
    const allStartups = await getUserStartups()
    availableStartups = allStartups.map((startup) => ({
      id: startup.id,
      name: startup.name,
    }))
  } else if (currentStartup) {
    availableStartups = [
      {
        id: currentStartup.id,
        name: currentStartup.name,
      },
    ]
  }

  // Fetch investor grants
  const investorGrants = await prisma.investorGrant.findMany({
    where: userRole === 'INCUBATOR_ADMIN'
      ? {}
      : { startupId: currentStartup?.id },
    include: {
      investor: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
      startup: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <InvestorsPageClient
      investorGrants={investorGrants}
      availableStartups={availableStartups}
      userRole={userRole}
      currentUserId={session.user.id}
    />
  )
}

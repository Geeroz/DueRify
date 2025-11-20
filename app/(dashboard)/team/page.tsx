import { auth } from '@/lib/auth'
import { getCurrentStartup } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { TeamPageClient } from './page-client'
import prisma from '@/lib/prisma'

export default async function TeamPage() {
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

  if (!currentStartup) {
    redirect('/dashboard')
  }

  // Fetch team members for the current startup
  const teamMembers = await prisma.startupUser.findMany({
    where: { startupId: currentStartup.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Fetch pending invitations
  const pendingInvitations = await prisma.invitation.findMany({
    where: {
      startupId: currentStartup.id,
      expires: { gte: new Date() }, // Only non-expired invitations
    },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <TeamPageClient
      teamMembers={teamMembers}
      pendingInvitations={pendingInvitations}
      currentUserId={session.user.id}
      userRole={userRole}
      startupId={currentStartup.id}
      startupName={currentStartup.name}
    />
  )
}

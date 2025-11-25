import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { LandingPageListClient } from './page-client'

export const metadata = {
  title: 'Landing Pages | DueRify',
  description: 'Create and manage landing pages for your startup',
}

export default async function LandingPagesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get user's first startup
  const userStartup = await prisma.startupUser.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      startup: true,
      user: true,
    },
  })

  if (!userStartup) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">No Startup Access</h2>
          <p className="text-muted-foreground">
            You don't have access to any startups. Contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  // Get all landing pages for the startup
  const landingPages = await prisma.landingPage.findMany({
    where: {
      startupId: userStartup.startupId,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  return (
    <LandingPageListClient
      startupId={userStartup.startupId}
      startupName={userStartup.startup.name}
      userRole={userStartup.user.role}
      landingPages={landingPages}
    />
  )
}

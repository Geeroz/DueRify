import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { OnePagerPageClient } from './page-client'

export const metadata = {
  title: 'One-Pager | DueRify',
  description: 'Create and manage your startup one-pager',
}

export default async function OnePagerPage() {
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

  // Get existing one-pager if it exists
  const existingOnePager = await prisma.onePager.findFirst({
    where: {
      startupId: userStartup.startupId,
    },
  })

  return (
    <OnePagerPageClient
      startupId={userStartup.startupId}
      startupName={userStartup.startup.name}
      userRole={userStartup.user.role}
      existingOnePager={existingOnePager}
    />
  )
}

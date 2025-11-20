import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DocumentsPageClient } from './page-client'

export const metadata = {
  title: 'Documents | DueRify',
  description: 'Manage your due diligence documents',
}

export default async function DocumentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get user's first startup (in a real app, this would be from a tenant selector)
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

  return (
    <DocumentsPageClient
      startupId={userStartup.startupId}
      userRole={userStartup.user.role}
      userId={session.user.id}
    />
  )
}

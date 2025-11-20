import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { AssessmentPageClient } from './page-client'

export const metadata = {
  title: 'IDE Assessment | DueRify',
  description: 'Assess your startup readiness across TRL, MRL, CRL, and BRL dimensions',
}

export default async function AssessmentPage() {
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

  // Get existing assessment if it exists
  const existingAssessment = await prisma.assessment.findFirst({
    where: {
      startupId: userStartup.startupId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return (
    <AssessmentPageClient
      startupId={userStartup.startupId}
      startupName={userStartup.startup.name}
      userRole={userStartup.user.role}
      existingAssessment={existingAssessment}
    />
  )
}

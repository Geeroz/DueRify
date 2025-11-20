import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { SettingsPageClient } from './page-client'

export const metadata = {
  title: 'Settings | DueRify',
  description: 'Manage your account and company settings',
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get user with full details
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  })

  // Get user's first startup for company settings
  const userStartup = await prisma.startupUser.findFirst({
    where: {
      userId: session.user.id,
    },
    include: {
      startup: true,
    },
  })

  return (
    <SettingsPageClient
      user={user}
      startup={userStartup?.startup || null}
      userRole={user?.role || 'STARTUP_USER'}
    />
  )
}

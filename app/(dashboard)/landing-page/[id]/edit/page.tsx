import { redirect, notFound } from 'next/navigation'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { LandingPageEditorClient } from './page-client'

export const metadata = {
  title: 'Edit Landing Page | DueRify',
  description: 'Edit your landing page with the visual editor',
}

interface EditLandingPageProps {
  params: Promise<{ id: string }>
}

export default async function EditLandingPage({ params }: EditLandingPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  // Get the landing page
  const landingPage = await prisma.landingPage.findUnique({
    where: { id },
    include: {
      startup: true,
    },
  })

  if (!landingPage) {
    notFound()
  }

  // Verify user has access to this startup
  const userStartup = await prisma.startupUser.findFirst({
    where: {
      userId: session.user.id,
      startupId: landingPage.startupId,
    },
  })

  if (!userStartup) {
    redirect('/landing-page')
  }

  return (
    <LandingPageEditorClient
      landingPage={{
        id: landingPage.id,
        title: landingPage.title,
        slug: landingPage.slug,
        isPublished: landingPage.isPublished,
        data: landingPage.data as any,
      }}
      startupName={landingPage.startup.name}
    />
  )
}

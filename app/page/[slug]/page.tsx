import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { LandingPageRenderer } from './renderer'

interface PublicLandingPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PublicLandingPageProps): Promise<Metadata> {
  const { slug } = await params

  const landingPage = await prisma.landingPage.findUnique({
    where: { slug },
    include: { startup: true },
  })

  if (!landingPage || !landingPage.isPublished) {
    return {
      title: 'Page Not Found | DueRify',
    }
  }

  return {
    title: `${landingPage.title} | ${landingPage.startup.name}`,
    description: `Landing page for ${landingPage.startup.name}`,
    openGraph: {
      title: landingPage.title,
      description: `Landing page for ${landingPage.startup.name}`,
      type: 'website',
    },
  }
}

export default async function PublicLandingPage({ params }: PublicLandingPageProps) {
  const { slug } = await params

  const landingPage = await prisma.landingPage.findUnique({
    where: { slug },
    include: { startup: true },
  })

  // Only show published pages
  if (!landingPage || !landingPage.isPublished) {
    notFound()
  }

  return (
    <LandingPageRenderer
      data={landingPage.data as any}
      title={landingPage.title}
      startupName={landingPage.startup.name}
    />
  )
}

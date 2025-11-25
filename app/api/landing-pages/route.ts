import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createLandingPageSchema = z.object({
  startupId: z.string(),
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
})

// GET /api/landing-pages - List landing pages for a startup
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startupId = searchParams.get('startupId')

    if (!startupId) {
      return NextResponse.json({ error: 'startupId is required' }, { status: 400 })
    }

    // Verify user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const landingPages = await prisma.landingPage.findMany({
      where: { startupId },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(landingPages)
  } catch (error) {
    console.error('Error fetching landing pages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/landing-pages - Create a new landing page
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = createLandingPageSchema.parse(body)

    // Verify user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: validated.startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if slug is already taken
    const existingPage = await prisma.landingPage.findUnique({
      where: { slug: validated.slug },
    })

    if (existingPage) {
      return NextResponse.json({ error: 'This slug is already in use. Please choose a different one.' }, { status: 400 })
    }

    // Create the landing page
    const landingPage = await prisma.landingPage.create({
      data: {
        startupId: validated.startupId,
        title: validated.title,
        slug: validated.slug,
        isPublished: false,
        data: { content: [], root: {} }, // Initial Puck data
      },
    })

    return NextResponse.json(landingPage, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Error creating landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

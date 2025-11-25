import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateLandingPageSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional(),
  isPublished: z.boolean().optional(),
  data: z.any().optional(),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/landing-pages/[id] - Get a single landing page
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      include: { startup: true },
    })

    if (!landingPage) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 })
    }

    // Verify user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: landingPage.startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    return NextResponse.json(landingPage)
  } catch (error) {
    console.error('Error fetching landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/landing-pages/[id] - Update a landing page
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
    })

    if (!landingPage) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 })
    }

    // Verify user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: landingPage.startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const body = await request.json()
    const validated = updateLandingPageSchema.parse(body)

    // If slug is being changed, check it's not taken
    if (validated.slug && validated.slug !== landingPage.slug) {
      const existingPage = await prisma.landingPage.findUnique({
        where: { slug: validated.slug },
      })

      if (existingPage) {
        return NextResponse.json({ error: 'This slug is already in use' }, { status: 400 })
      }
    }

    // Update the landing page
    const updatedPage = await prisma.landingPage.update({
      where: { id },
      data: {
        ...(validated.title && { title: validated.title }),
        ...(validated.slug && { slug: validated.slug }),
        ...(typeof validated.isPublished === 'boolean' && { isPublished: validated.isPublished }),
        ...(validated.data && { data: validated.data }),
      },
    })

    return NextResponse.json(updatedPage)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    console.error('Error updating landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/landing-pages/[id] - Delete a landing page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
    })

    if (!landingPage) {
      return NextResponse.json({ error: 'Landing page not found' }, { status: 404 })
    }

    // Verify user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: landingPage.startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Delete the landing page
    await prisma.landingPage.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting landing page:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createStartupSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  domain: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
})

// GET /api/startups - List all startups (for incubator admins)
export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check if user is INCUBATOR_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== 'INCUBATOR_ADMIN') {
      return NextResponse.json(
        { error: 'Only incubator admins can access portfolio' },
        { status: 403 }
      )
    }

    // 3. Fetch all startups with aggregated metrics
    const startups = await prisma.startup.findMany({
      include: {
        _count: {
          select: {
            documents: true,
            users: true,
          },
        },
        documents: {
          where: {
            verificationStatus: 'VERIFIED',
          },
          select: {
            id: true,
          },
        },
        assessments: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          select: {
            overallScore: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    // 4. Transform data to include computed metrics
    const startupsWithMetrics = startups.map((startup) => ({
      id: startup.id,
      name: startup.name,
      domain: startup.domain,
      industry: startup.industry,
      description: startup.description,
      logoUrl: startup.logoUrl,
      website: startup.website,
      createdAt: startup.createdAt,
      updatedAt: startup.updatedAt,
      metrics: {
        totalDocuments: startup._count.documents,
        verifiedDocuments: startup.documents.length,
        totalUsers: startup._count.users,
        readinessScore: startup.assessments[0]?.overallScore || null,
        lastActivity: startup.updatedAt,
      },
    }))

    return NextResponse.json({ data: startupsWithMetrics })
  } catch (error) {
    console.error('Startups listing error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch startups' },
      { status: 500 }
    )
  }
}

// POST /api/startups - Create new startup
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Check if user is INCUBATOR_ADMIN
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user || user.role !== 'INCUBATOR_ADMIN') {
      return NextResponse.json(
        { error: 'Only incubator admins can add startups' },
        { status: 403 }
      )
    }

    // 3. Parse and validate request body
    const body = await request.json()
    const validated = createStartupSchema.parse(body)

    // 4. Check for duplicate domain
    if (validated.domain) {
      const existingStartup = await prisma.startup.findUnique({
        where: { domain: validated.domain },
      })

      if (existingStartup) {
        return NextResponse.json(
          { error: 'A startup with this domain already exists' },
          { status: 409 }
        )
      }
    }

    // 5. Create startup and associate with current user
    const startup = await prisma.startup.create({
      data: {
        name: validated.name,
        domain: validated.domain,
        industry: validated.industry,
        description: validated.description,
        logoUrl: validated.logoUrl,
        website: validated.website,
        users: {
          create: {
            userId: session.user.id,
          },
        },
      },
      include: {
        _count: {
          select: {
            documents: true,
            users: true,
          },
        },
      },
    })

    // 6. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'STARTUP_CREATE',
        resource: 'startup',
        resourceId: startup.id,
        startupId: startup.id,
      },
    })

    return NextResponse.json({ data: startup }, { status: 201 })
  } catch (error) {
    console.error('Startup creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create startup' },
      { status: 500 }
    )
  }
}

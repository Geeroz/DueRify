import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const onePagerSchema = z.object({
  startupId: z.string().cuid(),
  companyName: z.string().min(1, 'Company name is required'),
  problemSection: z.string().optional(),
  solutionSection: z.string().optional(),
  productSection: z.string().optional(),
  teamSection: z.string().optional(),
  contactInfo: z.string().optional(),
  isPublic: z.boolean().default(true),
})

// Generate URL-friendly slug from company name
function generateSlug(companyName: string): string {
  const baseSlug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8)
  return `${baseSlug}-${randomSuffix}`
}

// GET /api/one-pagers - Get one-pager for current startup
export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Get startupId from query params
    const { searchParams } = new URL(request.url)
    const startupId = searchParams.get('startupId')

    if (!startupId) {
      return NextResponse.json({ error: 'startupId is required' }, { status: 400 })
    }

    // 3. Check user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied to this startup' }, { status: 403 })
    }

    // 4. Fetch one-pager
    const onePager = await prisma.onePager.findFirst({
      where: { startupId },
    })

    return NextResponse.json({ data: onePager })
  } catch (error) {
    console.error('One-pager fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch one-pager' },
      { status: 500 }
    )
  }
}

// POST /api/one-pagers - Create new one-pager
export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const validated = onePagerSchema.parse(body)

    // 3. Check user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: validated.startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied to this startup' }, { status: 403 })
    }

    // 4. Check if one-pager already exists for this startup
    const existing = await prisma.onePager.findFirst({
      where: { startupId: validated.startupId },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'One-pager already exists for this startup' },
        { status: 409 }
      )
    }

    // 5. Generate unique slug
    const slug = generateSlug(validated.companyName)

    // 6. Create one-pager
    const onePager = await prisma.onePager.create({
      data: {
        startupId: validated.startupId,
        slug,
        companyName: validated.companyName,
        problemSection: validated.problemSection,
        solutionSection: validated.solutionSection,
        productSection: validated.productSection,
        teamSection: validated.teamSection,
        contactInfo: validated.contactInfo,
        isPublic: validated.isPublic,
      },
    })

    // 7. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'ONEPAGER_CREATE',
        resource: 'one_pager',
        resourceId: onePager.id,
        startupId: validated.startupId,
      },
    })

    return NextResponse.json({ data: onePager }, { status: 201 })
  } catch (error) {
    console.error('One-pager creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create one-pager' },
      { status: 500 }
    )
  }
}

// PUT /api/one-pagers - Update one-pager
export async function PUT(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse and validate request body
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    // 3. Fetch existing one-pager
    const existing = await prisma.onePager.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'One-pager not found' }, { status: 404 })
    }

    // 4. Check user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: existing.startupId,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied to this startup' }, { status: 403 })
    }

    // 5. Update one-pager
    const onePager = await prisma.onePager.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ data: onePager })
  } catch (error) {
    console.error('One-pager update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update one-pager' },
      { status: 500 }
    )
  }
}

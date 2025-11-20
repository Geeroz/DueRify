import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const listSchema = z.object({
  startupId: z.string().nullable().transform(val => {
    if (!val || val === 'null' || val === 'undefined') {
      throw new Error('Startup ID is required')
    }
    return val
  }),
  category: z.string().optional(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'filename', 'fileSize']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
})

export async function GET(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url)
    const params = {
      startupId: searchParams.get('startupId'),
      category: searchParams.get('category') || undefined,
      verificationStatus: searchParams.get('verificationStatus') || undefined,
      search: searchParams.get('search') || undefined,
      sortBy: searchParams.get('sortBy') || 'createdAt',
      sortOrder: searchParams.get('sortOrder') || 'desc',
    }

    console.log('Documents API - Received params:', params)

    // 3. Validate input
    const validated = listSchema.parse(params)

    // 4. Check user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: validated.startupId,
      },
      include: {
        user: true,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied to this startup' }, { status: 403 })
    }

    // 5. Build where clause with filters
    const where: any = {
      startupId: validated.startupId,
    }

    if (validated.category) {
      where.category = validated.category
    }

    if (validated.verificationStatus) {
      where.verificationStatus = validated.verificationStatus
    }

    if (validated.search) {
      where.filename = {
        contains: validated.search,
        mode: 'insensitive',
      }
    }

    // 6. Fetch documents with filters and sorting
    const documents = await prisma.document.findMany({
      where,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        [validated.sortBy]: validated.sortOrder,
      },
    })

    // 7. Get summary statistics
    const stats = await prisma.document.groupBy({
      by: ['verificationStatus'],
      where: {
        startupId: validated.startupId,
      },
      _count: true,
    })

    const summary = {
      total: documents.length,
      pending: stats.find((s) => s.verificationStatus === 'PENDING')?._count || 0,
      verified: stats.find((s) => s.verificationStatus === 'VERIFIED')?._count || 0,
      rejected: stats.find((s) => s.verificationStatus === 'REJECTED')?._count || 0,
    }

    return NextResponse.json({ data: documents, summary })
  } catch (error) {
    console.error('Document listing error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

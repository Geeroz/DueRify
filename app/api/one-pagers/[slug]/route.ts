import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/one-pagers/[slug] - Get public one-pager by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Fetch one-pager with startup info
    const onePager = await prisma.onePager.findUnique({
      where: { slug },
      include: {
        startup: {
          select: {
            name: true,
            logoUrl: true,
            website: true,
            industry: true,
          },
        },
      },
    })

    if (!onePager) {
      return NextResponse.json({ error: 'One-pager not found' }, { status: 404 })
    }

    // Check if public
    if (!onePager.isPublic) {
      return NextResponse.json(
        { error: 'This one-pager is not public' },
        { status: 403 }
      )
    }

    return NextResponse.json({ data: onePager })
  } catch (error) {
    console.error('One-pager fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch one-pager' },
      { status: 500 }
    )
  }
}

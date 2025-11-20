import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// POST /api/one-pagers/[slug]/view - Track view
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    // Get client info
    const viewerIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const viewerAgent = request.headers.get('user-agent') || 'unknown'
    const referrer = request.headers.get('referer') || 'direct'

    // Find one-pager
    const onePager = await prisma.onePager.findUnique({
      where: { slug },
    })

    if (!onePager) {
      return NextResponse.json({ error: 'One-pager not found' }, { status: 404 })
    }

    // Create view record and increment total views in a transaction
    await prisma.$transaction([
      prisma.onePagerView.create({
        data: {
          onePagerId: onePager.id,
          viewerIp,
          viewerAgent,
          referrer,
        },
      }),
      prisma.onePager.update({
        where: { id: onePager.id },
        data: {
          totalViews: {
            increment: 1,
          },
        },
      }),
    ])

    return NextResponse.json({ message: 'View tracked' })
  } catch (error) {
    console.error('View tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}

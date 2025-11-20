import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

// DELETE /api/startups/[id] - Delete startup and all related data
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: 'Only incubator admins can delete startups' },
        { status: 403 }
      )
    }

    // 3. Await params and fetch startup
    const { id } = await params
    const startup = await prisma.startup.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
      },
    })

    if (!startup) {
      return NextResponse.json({ error: 'Startup not found' }, { status: 404 })
    }

    // 4. Delete startup (cascade will handle related records)
    await prisma.startup.delete({
      where: { id },
    })

    // 5. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'STARTUP_DELETE',
        resource: 'startup',
        resourceId: startup.id,
      },
    })

    return NextResponse.json({
      message: 'Startup deleted successfully',
      data: { name: startup.name },
    })
  } catch (error) {
    console.error('Startup deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete startup' },
      { status: 500 }
    )
  }
}

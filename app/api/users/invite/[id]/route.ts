import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: invitationId } = await params

    // Find the invitation
    const invitation = await prisma.invitation.findUnique({
      where: { id: invitationId },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to cancel this invitation
    const userStartup = await prisma.startupUser.findUnique({
      where: {
        userId_startupId: {
          userId: session.user.id,
          startupId: invitation.startupId,
        },
      },
    })

    if (
      !userStartup ||
      (session.user.role !== 'INCUBATOR_ADMIN' &&
        userStartup.role !== 'STARTUP_ADMIN')
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to cancel this invitation' },
        { status: 403 }
      )
    }

    // Delete the invitation
    await prisma.invitation.delete({
      where: { id: invitationId },
    })

    return NextResponse.json({
      data: { message: 'Invitation cancelled successfully' },
    })
  } catch (error) {
    console.error('Cancel invitation error:', error)
    return NextResponse.json(
      { error: 'Failed to cancel invitation' },
      { status: 500 }
    )
  }
}

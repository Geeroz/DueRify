import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateRoleSchema = z.object({
  role: z.enum(['STARTUP_ADMIN', 'STARTUP_USER']),
})

// Update team member role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: memberId } = await params
    const body = await request.json()
    const validated = updateRoleSchema.parse(body)

    // Find the team member
    const teamMember = await prisma.startupUser.findUnique({
      where: { id: memberId },
      include: { user: true },
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Prevent self-role change
    if (teamMember.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      )
    }

    // Check if current user has admin access to this startup
    const currentUserStartup = await prisma.startupUser.findUnique({
      where: {
        userId_startupId: {
          userId: session.user.id,
          startupId: teamMember.startupId,
        },
      },
    })

    if (
      !currentUserStartup ||
      (session.user.role !== 'INCUBATOR_ADMIN' &&
        currentUserStartup.role !== 'STARTUP_ADMIN')
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to change roles' },
        { status: 403 }
      )
    }

    // Update the role
    const updatedMember = await prisma.startupUser.update({
      where: { id: memberId },
      data: { role: validated.role },
      include: { user: true },
    })

    // Log the role change in audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'update_role',
        resource: 'team_member',
        resourceId: memberId,
        startupId: teamMember.startupId,
      },
    })

    return NextResponse.json({
      data: updatedMember,
    })
  } catch (error) {
    console.error('Update role error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update role' },
      { status: 500 }
    )
  }
}

// Remove team member
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: memberId } = await params

    // Find the team member
    const teamMember = await prisma.startupUser.findUnique({
      where: { id: memberId },
      include: { user: true },
    })

    if (!teamMember) {
      return NextResponse.json(
        { error: 'Team member not found' },
        { status: 404 }
      )
    }

    // Prevent self-removal
    if (teamMember.userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot remove yourself from the team' },
        { status: 400 }
      )
    }

    // Check if current user has admin access to this startup
    const currentUserStartup = await prisma.startupUser.findUnique({
      where: {
        userId_startupId: {
          userId: session.user.id,
          startupId: teamMember.startupId,
        },
      },
    })

    if (
      !currentUserStartup ||
      (session.user.role !== 'INCUBATOR_ADMIN' &&
        currentUserStartup.role !== 'STARTUP_ADMIN')
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to remove team members' },
        { status: 403 }
      )
    }

    // Remove the team member
    await prisma.startupUser.delete({
      where: { id: memberId },
    })

    // Log the removal in audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'remove_member',
        resource: 'team_member',
        resourceId: memberId,
        startupId: teamMember.startupId,
      },
    })

    return NextResponse.json({
      data: { message: 'Team member removed successfully' },
    })
  } catch (error) {
    console.error('Remove member error:', error)
    return NextResponse.json(
      { error: 'Failed to remove team member' },
      { status: 500 }
    )
  }
}

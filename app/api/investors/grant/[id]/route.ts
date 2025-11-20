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

    const { id: grantId } = await params

    // Find the grant
    const grant = await prisma.investorGrant.findUnique({
      where: { id: grantId },
    })

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to revoke this grant
    if (session.user.role === 'INCUBATOR_ADMIN') {
      // Incubator admin can revoke any grant
    } else {
      // Startup admin can only revoke grants for their own startup
      const userStartup = await prisma.startupUser.findUnique({
        where: {
          userId_startupId: {
            userId: session.user.id,
            startupId: grant.startupId,
          },
        },
      })

      if (!userStartup || userStartup.role !== 'STARTUP_ADMIN') {
        return NextResponse.json(
          { error: 'You do not have permission to revoke this access' },
          { status: 403 }
        )
      }
    }

    // Delete the grant
    await prisma.investorGrant.delete({
      where: { id: grantId },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'revoke_investor_access',
        resource: 'investor_grant',
        resourceId: grantId,
        startupId: grant.startupId,
      },
    })

    return NextResponse.json({
      data: { message: 'Access revoked successfully' },
    })
  } catch (error) {
    console.error('Revoke access error:', error)
    return NextResponse.json(
      { error: 'Failed to revoke access' },
      { status: 500 }
    )
  }
}

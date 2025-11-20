import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { randomBytes } from 'crypto'

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  startupId: z.string(),
  role: z.enum(['STARTUP_ADMIN', 'STARTUP_USER']),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = inviteSchema.parse(body)

    // Check if user has admin access to this startup
    const userStartup = await prisma.startupUser.findUnique({
      where: {
        userId_startupId: {
          userId: session.user.id,
          startupId: validated.startupId,
        },
      },
      include: {
        startup: true,
      },
    })

    if (
      !userStartup ||
      (session.user.role !== 'INCUBATOR_ADMIN' &&
        userStartup.role !== 'STARTUP_ADMIN')
    ) {
      return NextResponse.json(
        { error: 'You do not have permission to invite team members' },
        { status: 403 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    // If user exists, check if they're already part of this startup
    if (existingUser) {
      const existingMembership = await prisma.startupUser.findUnique({
        where: {
          userId_startupId: {
            userId: existingUser.id,
            startupId: validated.startupId,
          },
        },
      })

      if (existingMembership) {
        return NextResponse.json(
          { error: 'This user is already a member of your team' },
          { status: 400 }
        )
      }

      // Add existing user to startup
      await prisma.startupUser.create({
        data: {
          userId: existingUser.id,
          startupId: validated.startupId,
          role: validated.role,
        },
      })

      // TODO: Send notification email to existing user
      // await sendTeamAddedEmail(existingUser.email, userStartup.startup.name)

      return NextResponse.json({
        data: {
          message: 'User added to team successfully',
          userExists: true,
        },
      })
    }

    // Check if there's already a pending invitation
    const existingInvitation = await prisma.invitation.findFirst({
      where: {
        email: validated.email,
        startupId: validated.startupId,
        expires: { gte: new Date() },
      },
    })

    if (existingInvitation) {
      return NextResponse.json(
        { error: 'An invitation has already been sent to this email' },
        { status: 400 }
      )
    }

    // Generate invitation token
    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

    // Create invitation
    const invitation = await prisma.invitation.create({
      data: {
        email: validated.email,
        startupId: validated.startupId,
        role: validated.role,
        token,
        expires: expiresAt,
      },
    })

    // TODO: Send invitation email
    // const inviteLink = `${process.env.NEXTAUTH_URL}/accept-invite?token=${token}`
    // await sendInvitationEmail(validated.email, userStartup.startup.name, inviteLink, validated.role)

    console.log('Invitation created:', {
      email: validated.email,
      token,
      inviteLink: `${process.env.NEXTAUTH_URL}/accept-invite?token=${token}`,
    })

    return NextResponse.json({
      data: invitation,
    })
  } catch (error) {
    console.error('Invitation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}

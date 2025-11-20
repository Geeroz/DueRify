import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const grantAccessSchema = z.object({
  email: z.string().email('Invalid email address'),
  startupId: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = grantAccessSchema.parse(body)

    // Check if user has admin access to grant investor access
    if (session.user.role === 'INCUBATOR_ADMIN') {
      // Incubator admin can grant access to any startup
      const startup = await prisma.startup.findUnique({
        where: { id: validated.startupId },
      })

      if (!startup) {
        return NextResponse.json(
          { error: 'Startup not found' },
          { status: 404 }
        )
      }
    } else {
      // Startup admin can only grant access to their own startup
      const userStartup = await prisma.startupUser.findUnique({
        where: {
          userId_startupId: {
            userId: session.user.id,
            startupId: validated.startupId,
          },
        },
      })

      if (!userStartup || userStartup.role !== 'STARTUP_ADMIN') {
        return NextResponse.json(
          { error: 'You do not have permission to grant access to this startup' },
          { status: 403 }
        )
      }
    }

    // Check if investor user exists
    let investor = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    // If investor doesn't exist, create them with INVESTOR_VIEWER role
    if (!investor) {
      investor = await prisma.user.create({
        data: {
          email: validated.email,
          role: 'INVESTOR_VIEWER',
        },
      })

      // TODO: Send email invitation to create password/complete profile
      console.log('New investor created, send invitation email:', {
        email: validated.email,
        inviteLink: `${process.env.NEXTAUTH_URL}/login`,
      })
    } else if (investor.role !== 'INVESTOR_VIEWER') {
      // If user exists but not as investor, don't allow granting access
      return NextResponse.json(
        { error: 'This email is already registered with a different role' },
        { status: 400 }
      )
    }

    // Check if grant already exists
    const existingGrant = await prisma.investorGrant.findUnique({
      where: {
        investorId_startupId: {
          investorId: investor.id,
          startupId: validated.startupId,
        },
      },
    })

    if (existingGrant) {
      return NextResponse.json(
        { error: 'This investor already has access to this startup' },
        { status: 400 }
      )
    }

    // Create investor grant
    const grant = await prisma.investorGrant.create({
      data: {
        investorId: investor.id,
        startupId: validated.startupId,
        grantedBy: session.user.id,
      },
      include: {
        investor: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        startup: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'grant_investor_access',
        resource: 'investor_grant',
        resourceId: grant.id,
        startupId: validated.startupId,
      },
    })

    // TODO: Send notification email to investor
    // await sendInvestorAccessGrantedEmail(investor.email, grant.startup.name)

    return NextResponse.json({
      data: grant,
    })
  } catch (error) {
    console.error('Grant access error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to grant access' },
      { status: 500 }
    )
  }
}

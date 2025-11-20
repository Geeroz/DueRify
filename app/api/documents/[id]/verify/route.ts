import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { checkPermission } from '@/lib/rbac'
import { z } from 'zod'

const verifySchema = z.object({
  status: z.enum(['VERIFIED', 'REJECTED']),
  notes: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await request.json()
    const validated = verifySchema.parse(body)

    // 3. Await params and fetch document to verify access
    const { id } = await params
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        startup: true,
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // 4. Check user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: document.startupId,
      },
      include: {
        user: true,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied to this startup' }, { status: 403 })
    }

    // 5. Check permissions - only admins can verify documents
    if (!checkPermission(userStartup.user.role, 'verify', 'documents')) {
      return NextResponse.json(
        { error: 'You do not have permission to verify documents' },
        { status: 403 }
      )
    }

    // 6. Update document verification status
    const updatedDocument = await prisma.document.update({
      where: { id },
      data: {
        verificationStatus: validated.status,
        verificationNotes: validated.notes,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // 7. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: validated.status === 'VERIFIED' ? 'DOCUMENT_VERIFY' : 'DOCUMENT_REJECT',
        resource: 'documents',
        resourceId: document.id,
        startupId: document.startupId,
      },
    })

    return NextResponse.json({ data: updatedDocument })
  } catch (error) {
    console.error('Document verification error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    )
  }
}

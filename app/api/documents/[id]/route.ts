import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { del } from '@vercel/blob'
import { checkPermission } from '@/lib/rbac'

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

    // 2. Await params and fetch document to verify access and get blob URL
    const { id } = await params
    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        startup: true,
        uploadedBy: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    // 3. Check user has access to this startup
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

    // 4. Check permissions - only admins or the uploader can delete
    const canDelete =
      checkPermission(userStartup.user.role, 'delete', 'documents') ||
      document.uploadedById === session.user.id

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this document' },
        { status: 403 }
      )
    }

    // 5. Delete from Vercel Blob
    try {
      await del(document.blobUrl)
    } catch (blobError) {
      console.error('Failed to delete blob:', blobError)
      // Continue with database deletion even if blob deletion fails
    }

    // 6. Delete from database
    await prisma.document.delete({
      where: { id },
    })

    // 7. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DOCUMENT_DELETE',
        resource: 'documents',
        resourceId: document.id,
        startupId: document.startupId,
      },
    })

    return NextResponse.json({ message: 'Document deleted successfully' })
  } catch (error) {
    console.error('Document deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}

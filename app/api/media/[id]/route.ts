import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { deleteFile, getFileInfo } from '@/lib/storage'

const updateFileSchema = z.object({
  originalName: z.string().min(1).max(255).optional(),
  folder: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(10).optional(),
  description: z.string().max(500).optional(),
})

// GET /api/media/[id] - Get file information
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find file in database
    const fileRecord = await prisma.uploadedFile.findUnique({
      where: { id },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    if (!fileRecord) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Get additional file info from storage
    const fileInfo = await getFileInfo(fileRecord.url)

    return NextResponse.json({
      ...fileRecord,
      storageInfo: fileInfo
    })
  } catch (error) {
    console.error('Get file error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/media/[id] - Update file metadata
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateFileSchema.parse(body)

    // Check if file exists and user has permission
    const existingFile = await prisma.uploadedFile.findUnique({
      where: { id }
    })

    if (!existingFile) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Check if user owns the file or is admin
    const userRole = session.user.role
    const canEdit = existingFile.uploadedById === session.user.id ||
                   userRole === 'INCUBATOR_ADMIN' ||
                   userRole === 'STARTUP_ADMIN'

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this file' },
        { status: 403 }
      )
    }

    // Update file metadata
    const updatedFile = await prisma.uploadedFile.update({
      where: { id },
      data: {
        ...(validatedData.originalName && { originalName: validatedData.originalName }),
        ...(validatedData.folder !== undefined && { folder: validatedData.folder }),
        ...(validatedData.tags !== undefined && { tags: validatedData.tags }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({
      message: 'File updated successfully',
      file: updatedFile
    })
  } catch (error) {
    console.error('Update file error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/media/[id] - Delete a file
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find file in database
    const fileRecord = await prisma.uploadedFile.findUnique({
      where: { id }
    })

    if (!fileRecord) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Check if user owns the file or is admin
    const userRole = session.user.role
    const canDelete = fileRecord.uploadedById === session.user.id ||
                    userRole === 'INCUBATOR_ADMIN' ||
                    userRole === 'STARTUP_ADMIN'

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this file' },
        { status: 403 }
      )
    }

    // Delete from storage
    try {
      await deleteFile(fileRecord.url)
    } catch (storageError) {
      console.error('Delete from storage error:', storageError)
      // Continue with database deletion even if storage deletion fails
    }

    // Delete thumbnail if exists
    if (fileRecord.thumbnailUrl) {
      try {
        await deleteFile(fileRecord.thumbnailUrl)
      } catch (thumbError) {
        console.error('Delete thumbnail error:', thumbError)
      }
    }

    // Delete from database
    await prisma.uploadedFile.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'File deleted successfully',
      file: {
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        url: fileRecord.url
      }
    })
  } catch (error) {
    console.error('Delete file error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

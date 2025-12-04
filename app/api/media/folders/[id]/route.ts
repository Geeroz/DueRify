import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const updateFolderSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
})

// GET /api/media/folders/[id] - Get folder details
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

    // Find folder
    const folder = await prisma.mediaFolder.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Get file count
    const fileCount = await prisma.uploadedFile.count({
      where: { folder: folder.slug }
    })

    return NextResponse.json({
      ...folder,
      fileCount
    })
  } catch (error) {
    console.error('Get folder error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/media/folders/[id] - Update folder
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
    const validatedData = updateFolderSchema.parse(body)

    // Check if folder exists
    const existingFolder = await prisma.mediaFolder.findUnique({
      where: { id }
    })

    if (!existingFolder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to edit
    const userRole = session.user.role
    const canEdit = existingFolder.createdById === session.user.id ||
                   userRole === 'INCUBATOR_ADMIN' ||
                   userRole === 'STARTUP_ADMIN'

    if (!canEdit) {
      return NextResponse.json(
        { error: 'Insufficient permissions to edit this folder' },
        { status: 403 }
      )
    }

    // If name is being changed, update slug and update files
    let newSlug = existingFolder.slug
    if (validatedData.name && validatedData.name !== existingFolder.name) {
      newSlug = validatedData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      // Check if new name/slug conflicts
      const conflictingFolder = await prisma.mediaFolder.findFirst({
        where: {
          OR: [
            { name: validatedData.name },
            { slug: newSlug }
          ],
          NOT: { id }
        }
      })

      if (conflictingFolder) {
        return NextResponse.json(
          { error: 'A folder with this name already exists' },
          { status: 400 }
        )
      }

      // Update all files in this folder to use new slug
      await prisma.uploadedFile.updateMany({
        where: { folder: existingFolder.slug },
        data: { folder: newSlug }
      })
    }

    // Update folder
    const updatedFolder = await prisma.mediaFolder.update({
      where: { id },
      data: {
        ...(validatedData.name && { name: validatedData.name, slug: newSlug }),
        ...(validatedData.description !== undefined && { description: validatedData.description }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    // Get file count
    const fileCount = await prisma.uploadedFile.count({
      where: { folder: updatedFolder.slug }
    })

    return NextResponse.json({
      message: 'Folder updated successfully',
      folder: {
        ...updatedFolder,
        fileCount
      }
    })
  } catch (error) {
    console.error('Update folder error:', error)

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

// DELETE /api/media/folders/[id] - Delete folder
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

    // Check if folder exists
    const folder = await prisma.mediaFolder.findUnique({
      where: { id }
    })

    if (!folder) {
      return NextResponse.json(
        { error: 'Folder not found' },
        { status: 404 }
      )
    }

    // Check if user has permission to delete
    const userRole = session.user.role
    const canDelete = folder.createdById === session.user.id ||
                     userRole === 'INCUBATOR_ADMIN' ||
                     userRole === 'STARTUP_ADMIN'

    if (!canDelete) {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete this folder' },
        { status: 403 }
      )
    }

    // Move files in this folder to uncategorized (set folder to null)
    await prisma.uploadedFile.updateMany({
      where: { folder: folder.slug },
      data: { folder: null }
    })

    // Delete folder
    await prisma.mediaFolder.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Folder deleted successfully',
      folder: {
        id: folder.id,
        name: folder.name,
        slug: folder.slug
      }
    })
  } catch (error) {
    console.error('Delete folder error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

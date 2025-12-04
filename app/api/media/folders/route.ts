import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const createFolderSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

// GET /api/media/folders - List all folders
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get all folders
    const folders = await prisma.mediaFolder.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    // Get file counts for each folder
    const foldersWithCounts = await Promise.all(
      folders.map(async (folder) => {
        const fileCount = await prisma.uploadedFile.count({
          where: { folder: folder.slug }
        })
        return {
          ...folder,
          fileCount
        }
      })
    )

    // Also get count of files without a folder
    const uncategorizedCount = await prisma.uploadedFile.count({
      where: { folder: null }
    })

    return NextResponse.json({
      folders: foldersWithCounts,
      uncategorizedCount
    })
  } catch (error) {
    console.error('List folders error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/media/folders - Create a new folder
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createFolderSchema.parse(body)

    // Generate slug from name
    const slug = validatedData.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if folder with same name or slug exists
    const existingFolder = await prisma.mediaFolder.findFirst({
      where: {
        OR: [
          { name: validatedData.name },
          { slug }
        ]
      }
    })

    if (existingFolder) {
      return NextResponse.json(
        { error: 'A folder with this name already exists' },
        { status: 400 }
      )
    }

    // Create folder
    const folder = await prisma.mediaFolder.create({
      data: {
        name: validatedData.name,
        slug,
        description: validatedData.description || null,
        createdById: session.user.id,
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

    return NextResponse.json({
      message: 'Folder created successfully',
      folder: {
        ...folder,
        fileCount: 0
      }
    })
  } catch (error) {
    console.error('Create folder error:', error)

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

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'

const moveFilesSchema = z.object({
  fileIds: z.array(z.string()).min(1),
  destinationFolder: z.string().nullable(),
})

// POST /api/media/move - Move files to a folder
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
    const { fileIds, destinationFolder } = moveFilesSchema.parse(body)

    // If destinationFolder is provided (not null), verify it exists
    if (destinationFolder) {
      const folder = await prisma.mediaFolder.findUnique({
        where: { slug: destinationFolder }
      })

      if (!folder) {
        return NextResponse.json(
          { error: 'Destination folder not found' },
          { status: 404 }
        )
      }
    }

    // Update all files
    const result = await prisma.uploadedFile.updateMany({
      where: {
        id: { in: fileIds }
      },
      data: {
        folder: destinationFolder
      }
    })

    return NextResponse.json({
      message: `Successfully moved ${result.count} file(s)`,
      movedCount: result.count
    })
  } catch (error) {
    console.error('Move files error:', error)

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

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { z } from 'zod'
import { uploadFile, deleteFile } from '@/lib/storage'
import { validateMultipleFiles, getValidationErrorMessage } from '@/lib/file-validation'

const listFilesSchema = z.object({
  folder: z.string().optional(),
  limit: z.number().min(1).max(100).optional(),
  offset: z.number().min(0).optional(),
  search: z.string().optional(),
  type: z.enum(['image', 'video', 'audio', 'document']).optional(),
})

// GET /api/media - List files with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const typeParam = searchParams.get('type')
    const validTypes = ['image', 'video', 'audio', 'document']

    const query = {
      folder: searchParams.get('folder') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined,
      search: searchParams.get('search') || undefined,
      type: typeParam && validTypes.includes(typeParam) ? typeParam as 'image' | 'video' | 'audio' | 'document' : undefined,
    }

    const validatedQuery = listFilesSchema.parse(query)

    // Build database query filters
    const whereClause: any = {}

    // Filter by folder
    if (validatedQuery.folder !== undefined) {
      whereClause.folder = validatedQuery.folder
    }

    // Filter by type (mimeType)
    if (validatedQuery.type) {
      switch (validatedQuery.type) {
        case 'image':
          whereClause.mimeType = { startsWith: 'image/' }
          break
        case 'video':
          whereClause.mimeType = { startsWith: 'video/' }
          break
        case 'audio':
          whereClause.mimeType = { startsWith: 'audio/' }
          break
        case 'document':
          whereClause.mimeType = {
            contains: 'pdf',
            mode: 'insensitive'
          }
          break
      }
    }

    // Filter by search term
    if (validatedQuery.search) {
      whereClause.OR = [
        { originalName: { contains: validatedQuery.search, mode: 'insensitive' } },
        { filename: { contains: validatedQuery.search, mode: 'insensitive' } },
        { mimeType: { contains: validatedQuery.search, mode: 'insensitive' } },
      ]
    }

    // Get total count
    const total = await prisma.uploadedFile.count({ where: whereClause })

    // Get files from database with pagination
    const fileRecords = await prisma.uploadedFile.findMany({
      where: whereClause,
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: validatedQuery.offset || 0,
      take: validatedQuery.limit || undefined,
    })

    // Map to response format
    const filesWithMetadata = fileRecords.map(record => ({
      id: record.id,
      filename: record.filename,
      originalName: record.originalName,
      mimeType: record.mimeType,
      size: record.size,
      url: record.url,
      thumbnailUrl: record.thumbnailUrl,
      folder: record.folder,
      tags: record.tags,
      description: record.description,
      uploadedAt: record.createdAt.toISOString(),
      uploadedBy: record.uploadedBy,
    }))

    return NextResponse.json({
      files: filesWithMetadata,
      pagination: {
        total,
        limit: validatedQuery.limit || total,
        offset: validatedQuery.offset || 0,
        hasMore: (validatedQuery.offset || 0) + filesWithMetadata.length < total
      }
    })
  } catch (error) {
    console.error('List files error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/media - Upload files
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      )
    }

    const options = {
      folder: formData.get('folder') as string || undefined,
      allowedTypes: formData.get('allowedTypes') ?
        (formData.get('allowedTypes') as string).split(',') : undefined,
      maxSize: formData.get('maxSize') ?
        parseInt(formData.get('maxSize') as string) : undefined,
    }

    // Validate files
    const validation = validateMultipleFiles(files, options)
    if (!validation.valid) {
      return NextResponse.json(
        {
          error: getValidationErrorMessage(validation.errors),
          details: validation.errors
        },
        { status: 400 }
      )
    }

    const uploadResults = []
    const errors = []

    // Upload files
    for (const file of files) {
      try {
        console.log(`Uploading file: ${file.name}, type: ${file.type}, size: ${file.size}`)

        const uploadResult = await uploadFile(file, file.name, {
          folder: options.folder || 'media',
          access: 'public'
        })

        console.log(`Upload result:`, uploadResult)

        // Save file record to database
        const fileRecord = await prisma.uploadedFile.create({
          data: {
            filename: uploadResult.pathname,
            originalName: file.name,
            mimeType: file.type,
            size: uploadResult.size,
            url: uploadResult.url,
            thumbnailUrl: null,
            folder: options.folder || null,
            uploadedById: session.user.id,
          },
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        })

        uploadResults.push({
          ...uploadResult,
          id: fileRecord.id,
          originalName: file.name,
          folder: options.folder || null,
          uploadedBy: fileRecord.uploadedBy,
        })
      } catch (error) {
        console.error('Upload file error:', error)
        errors.push({
          filename: file.name,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    if (uploadResults.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload any files', details: errors },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: `Successfully uploaded ${uploadResults.length} file(s)`,
      files: uploadResults,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Upload files error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/media - Delete multiple files
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const userRole = session.user.role
    if (userRole !== 'INCUBATOR_ADMIN' && userRole !== 'STARTUP_ADMIN') {
      return NextResponse.json(
        { error: 'Insufficient permissions to delete files' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { fileUrls } = body

    if (!Array.isArray(fileUrls) || fileUrls.length === 0) {
      return NextResponse.json(
        { error: 'Invalid file URLs provided' },
        { status: 400 }
      )
    }

    const deletedFiles = []
    const errors = []

    for (const fileUrl of fileUrls) {
      try {
        // Get file record from database to find thumbnail URL
        const fileRecord = await prisma.uploadedFile.findFirst({
          where: { url: fileUrl }
        })

        // Delete original file from Vercel Blob
        await deleteFile(fileUrl)

        // Delete thumbnail if it exists
        if (fileRecord?.thumbnailUrl) {
          try {
            await deleteFile(fileRecord.thumbnailUrl)
          } catch (thumbError) {
            console.error('Error deleting thumbnail:', thumbError)
            // Continue even if thumbnail deletion fails
          }
        }

        // Delete from database
        const deletedRecord = await prisma.uploadedFile.deleteMany({
          where: { url: fileUrl }
        })

        if (deletedRecord.count > 0) {
          deletedFiles.push(fileUrl)
        }
      } catch (error) {
        console.error('Delete file error:', error)
        errors.push({
          url: fileUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json({
      message: `Successfully deleted ${deletedFiles.length} file(s)`,
      deletedFiles,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Delete files error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

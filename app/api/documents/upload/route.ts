import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { put } from '@vercel/blob'
import { z } from 'zod'

const uploadSchema = z.object({
  startupId: z.string().cuid(),
  category: z.enum(['Financial', 'Legal', 'Product', 'Team', 'Market Research', 'Custom']),
  customCategory: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const startupId = formData.get('startupId') as string
    const category = formData.get('category') as string
    const customCategory = formData.get('customCategory') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 3. Validate input
    const validated = uploadSchema.parse({
      startupId,
      category,
      customCategory: customCategory || undefined,
    })

    // 4. Check user has access to this startup
    const userStartup = await prisma.startupUser.findFirst({
      where: {
        userId: session.user.id,
        startupId: validated.startupId,
      },
      include: {
        user: true,
      },
    })

    if (!userStartup) {
      return NextResponse.json({ error: 'Access denied to this startup' }, { status: 403 })
    }

    // 5. Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 50MB limit' }, { status: 400 })
    }

    // 6. Validate MIME type (allow common document types)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'text/csv',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    // 7. Upload to Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
      addRandomSuffix: true,
    })

    // 8. Save metadata to database
    const document = await prisma.document.create({
      data: {
        startupId: validated.startupId,
        filename: file.name,
        blobUrl: blob.url,
        blobKey: blob.url.split('/').pop()!, // Extract key from URL
        fileSize: file.size,
        mimeType: file.type,
        category: validated.category,
        customCategory: validated.customCategory,
        verificationStatus: 'PENDING',
        uploadedById: session.user.id,
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

    // 9. Create audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'DOCUMENT_UPLOAD',
        resource: 'documents',
        resourceId: document.id,
        startupId: validated.startupId,
      },
    })

    return NextResponse.json({ data: document }, { status: 201 })
  } catch (error) {
    console.error('Document upload error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

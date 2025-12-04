import { put, del, list, head } from '@vercel/blob'

export interface UploadFileOptions {
  folder?: string
  access?: 'public'
  cacheControlMaxAge?: number
  token?: string
  multipart?: boolean
}

export interface FileUploadResult {
  url: string
  downloadUrl: string
  size: number
  uploadedAt: Date
  pathname: string
  contentType: string
}

export interface FileInfo {
  url: string
  size: number
  uploadedAt: Date
  pathname: string
  contentType: string
  cacheControl: string | null
}

/**
 * Upload a file to Vercel Blob storage
 */
export async function uploadFile(
  file: File | ArrayBuffer,
  filename: string,
  options: UploadFileOptions = {}
): Promise<FileUploadResult> {
  const {
    folder = '',
    access = 'public',
    cacheControlMaxAge = 31536000, // 1 year
    token = process.env.BLOB_READ_WRITE_TOKEN,
    multipart = false
  } = options

  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set')
  }

  // Generate unique filename with folder prefix
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = filename.includes('.') ? `.${filename.split('.').pop()}` : ''
  const baseName = filename.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-')
  const uniqueFilename = folder
    ? `${folder}/${timestamp}-${randomString}-${baseName}${extension}`
    : `${timestamp}-${randomString}-${baseName}${extension}`

  try {
    const blob = await put(uniqueFilename, file, {
      access,
      token,
      cacheControlMaxAge,
      multipart,
    })

    return {
      url: blob.url,
      downloadUrl: blob.url, // Vercel Blob uses same URL for both
      size: file instanceof File ? file.size : 0,
      uploadedAt: new Date(),
      pathname: blob.pathname,
      contentType: file instanceof File ? file.type : 'application/octet-stream'
    }
  } catch (error) {
    console.error('File upload error:', error)
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Delete a file from Vercel Blob storage
 */
export async function deleteFile(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set')
  }

  try {
    await del(url, { token })
  } catch (error) {
    console.error('File deletion error:', error)
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * List files in a folder or with a specific prefix
 */
export async function listFiles(prefix: string = ''): Promise<FileInfo[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set')
  }

  try {
    const { blobs } = await list({ prefix, token })

    return blobs.map(blob => ({
      url: blob.url,
      size: 0,
      uploadedAt: new Date(),
      pathname: blob.pathname,
      contentType: 'application/octet-stream',
      cacheControl: null
    }))
  } catch (error) {
    console.error('File list error:', error)
    throw new Error(`Failed to list files: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Get file information (head) without downloading the content
 */
export async function getFileInfo(url: string): Promise<FileInfo | null> {
  const token = process.env.BLOB_READ_WRITE_TOKEN

  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set')
  }

  try {
    const blob = await head(url, { token })

    if (!blob) {
      return null
    }

    return {
      url: blob.url,
      size: 0,
      uploadedAt: new Date(),
      pathname: blob.pathname,
      contentType: 'application/octet-stream',
      cacheControl: null
    }
  } catch (error) {
    console.error('Get file info error:', error)
    return null
  }
}

/**
 * Validate file type and size
 */
export function validateFile(file: File, options: {
  maxSize?: number // in bytes
  allowedTypes?: string[]
} = {}): { valid: boolean; error?: string } {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB default
    allowedTypes = [
      // Images
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/avif',
      'image/svg+xml',
      // Documents
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      // Videos
      'video/mp4',
      'video/webm',
      'video/ogg',
      // Audio
      'audio/mpeg',
      'audio/wav',
      'audio/ogg',
      'audio/webm'
    ]
  } = options

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`
    }
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`
    }
  }

  return { valid: true }
}

/**
 * Format file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Get file extension from filename or content type
 */
export function getFileExtension(file: File): string {
  if (file.name.includes('.')) {
    return file.name.split('.').pop()?.toLowerCase() || ''
  }

  // Try to get extension from content type
  const typeToExtension: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav'
  }

  return typeToExtension[file.type] || ''
}

/**
 * Generate a secure filename
 */
export function generateSecureFilename(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.includes('.') ? `.${originalName.split('.').pop()}` : ''
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-')

  return `${timestamp}-${randomString}-${baseName}${extension}`
}

/**
 * Check if a file is an image
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

/**
 * Check if a file is a video
 */
export function isVideoFile(file: File): boolean {
  return file.type.startsWith('video/')
}

/**
 * Check if a file is a document
 */
export function isDocumentFile(file: File): boolean {
  const documentTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ]

  return documentTypes.includes(file.type)
}

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('sheet') || mimeType.includes('presentation')) {
    return 'document'
  }
  return 'other'
}

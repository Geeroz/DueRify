import { z } from 'zod'

// Allowed file types
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/avif',
  'image/svg+xml'
] as const

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
] as const

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime'
] as const

export const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/aac'
] as const

export const ALLOWED_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_DOCUMENT_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_AUDIO_TYPES
] as const

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  image: 10 * 1024 * 1024, // 10MB
  video: 100 * 1024 * 1024, // 100MB
  audio: 20 * 1024 * 1024, // 20MB
  document: 50 * 1024 * 1024, // 50MB
  default: 50 * 1024 * 1024 // 50MB
} as const

export interface FileValidationOptions {
  maxSize?: number
  allowedTypes?: string[]
  allowMultiple?: boolean
  maxFiles?: number
  requireImage?: boolean
  requireDocument?: boolean
}

export interface FileValidationError {
  code: 'INVALID_TYPE' | 'FILE_TOO_LARGE' | 'TOO_MANY_FILES' | 'REQUIRED_TYPE_MISSING' | 'INVALID_FILENAME'
  message: string
  file?: string
}

export interface FileValidationResult {
  valid: boolean
  errors: FileValidationError[]
}

/**
 * Validate a single file
 */
export function validateFile(
  file: File,
  options: FileValidationOptions = {}
): FileValidationResult {
  const {
    maxSize,
    allowedTypes = ALLOWED_FILE_TYPES,
    requireImage = false,
    requireDocument = false
  } = options

  const errors: FileValidationError[] = []

  // Check file type with wildcard support
  const isTypeAllowed = allowedTypes.some(allowedType => {
    // Support wildcard patterns like 'image/*', 'video/*'
    if (allowedType.endsWith('/*')) {
      const category = allowedType.slice(0, -2) // Remove '/*'
      return file.type.startsWith(category + '/')
    }
    // Exact match
    return file.type === allowedType
  })

  if (!isTypeAllowed) {
    errors.push({
      code: 'INVALID_TYPE',
      message: `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`,
      file: file.name
    })
  }

  // Check file size
  const effectiveMaxSize = maxSize || getDefaultMaxSize(file.type)
  if (file.size > effectiveMaxSize) {
    errors.push({
      code: 'FILE_TOO_LARGE',
      message: `File "${file.name}" is too large. Maximum size: ${formatFileSize(effectiveMaxSize)}`,
      file: file.name
    })
  }

  // Check if image is required
  if (requireImage && !file.type.startsWith('image/')) {
    errors.push({
      code: 'REQUIRED_TYPE_MISSING',
      message: `An image file is required, but "${file.name}" is not an image`,
      file: file.name
    })
  }

  // Check if document is required
  if (requireDocument && !isDocumentType(file.type)) {
    errors.push({
      code: 'REQUIRED_TYPE_MISSING',
      message: `A document file is required, but "${file.name}" is not a document`,
      file: file.name
    })
  }

  // Check filename
  if (!isValidFilename(file.name)) {
    errors.push({
      code: 'INVALID_FILENAME',
      message: `Filename "${file.name}" contains invalid characters`,
      file: file.name
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Validate multiple files
 */
export function validateMultipleFiles(
  files: File[],
  options: FileValidationOptions = {}
): FileValidationResult {
  const {
    allowMultiple = true,
    maxFiles = 10
  } = options

  const errors: FileValidationError[] = []

  // Check if multiple files are allowed
  if (!allowMultiple && files.length > 1) {
    errors.push({
      code: 'TOO_MANY_FILES',
      message: 'Only one file is allowed'
    })
  }

  // Check maximum number of files
  if (files.length > maxFiles) {
    errors.push({
      code: 'TOO_MANY_FILES',
      message: `Maximum ${maxFiles} files allowed, but ${files.length} files were provided`
    })
  }

  // Validate each file
  files.forEach(file => {
    const validation = validateFile(file, options)
    errors.push(...validation.errors)
  })

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * Check if a file type is a document
 */
export function isDocumentType(mimeType: string): boolean {
  return (ALLOWED_DOCUMENT_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Check if a file type is an image
 */
export function isImageType(mimeType: string): boolean {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Check if a file type is a video
 */
export function isVideoType(mimeType: string): boolean {
  return (ALLOWED_VIDEO_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Check if a file type is audio
 */
export function isAudioType(mimeType: string): boolean {
  return (ALLOWED_AUDIO_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Get default max file size for a given file type
 */
export function getDefaultMaxSize(mimeType: string): number {
  if (mimeType.startsWith('image/')) return FILE_SIZE_LIMITS.image
  if (mimeType.startsWith('video/')) return FILE_SIZE_LIMITS.video
  if (mimeType.startsWith('audio/')) return FILE_SIZE_LIMITS.audio
  if (isDocumentType(mimeType)) return FILE_SIZE_LIMITS.document
  return FILE_SIZE_LIMITS.default
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
 * Check if filename is valid
 */
export function isValidFilename(filename: string): boolean {
  // Check for empty filename
  if (!filename || filename.trim().length === 0) {
    return false
  }

  // Check for invalid characters
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/
  if (invalidChars.test(filename)) {
    return false
  }

  // Check for reserved names (Windows)
  const reservedNames = [
    'CON', 'PRN', 'AUX', 'NUL',
    'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
    'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
  ]

  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '').toUpperCase()
  if (reservedNames.includes(nameWithoutExt)) {
    return false
  }

  // Check length (255 characters is typical limit)
  if (filename.length > 255) {
    return false
  }

  return true
}

/**
 * Get file category from MIME type
 */
export function getFileCategory(mimeType: string): 'image' | 'video' | 'audio' | 'document' | 'other' {
  if (isImageType(mimeType)) return 'image'
  if (isVideoType(mimeType)) return 'video'
  if (isAudioType(mimeType)) return 'audio'
  if (isDocumentType(mimeType)) return 'document'
  return 'other'
}

/**
 * Sanitize filename by removing invalid characters
 */
export function sanitizeFilename(filename: string): string {
  // Remove invalid characters
  let sanitized = filename.replace(/[<>:"/\\|?*\x00-\x1f]/g, '')

  // Replace spaces with hyphens
  sanitized = sanitized.replace(/\s+/g, '-')

  // Remove leading/trailing dots and spaces
  sanitized = sanitized.replace(/^[\s.]+|[\s.]+$/g, '')

  // Ensure it's not empty
  if (!sanitized) {
    sanitized = 'file'
  }

  // Truncate if too long
  if (sanitized.length > 200) {
    const extension = sanitized.includes('.') ? '.' + sanitized.split('.').pop() : ''
    const nameWithoutExt = sanitized.substring(0, 200 - extension.length)
    sanitized = nameWithoutExt + extension
  }

  return sanitized
}

// Zod schemas for validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File),
  folder: z.string().optional(),
  maxSize: z.number().optional(),
  allowedTypes: z.array(z.string()).optional()
})

export const multipleFileUploadSchema = z.object({
  files: z.array(z.instanceof(File)),
  folder: z.string().optional(),
  maxFiles: z.number().min(1).max(50).optional(),
  maxSize: z.number().optional(),
  allowedTypes: z.array(z.string()).optional()
})

/**
 * Get a user-friendly error message from validation errors
 */
export function getValidationErrorMessage(errors: FileValidationError[]): string {
  if (errors.length === 0) return ''

  // Group errors by code
  const errorsByCode = errors.reduce((acc, error) => {
    if (!acc[error.code]) {
      acc[error.code] = []
    }
    acc[error.code].push(error)
    return acc
  }, {} as Record<string, FileValidationError[]>)

  // Build error message
  const messages: string[] = []

  if (errorsByCode.INVALID_TYPE) {
    messages.push('Some file types are not allowed')
  }

  if (errorsByCode.FILE_TOO_LARGE) {
    messages.push('Some files are too large')
  }

  if (errorsByCode.TOO_MANY_FILES) {
    messages.push(errorsByCode.TOO_MANY_FILES[0].message)
  }

  if (errorsByCode.REQUIRED_TYPE_MISSING) {
    messages.push('Required file type is missing')
  }

  if (errorsByCode.INVALID_FILENAME) {
    messages.push('Some filenames contain invalid characters')
  }

  return messages.join('. ')
}

/**
 * Create validation options based on file category
 */
export function createValidationOptionsForCategory(
  category: 'image' | 'video' | 'audio' | 'document' | 'all',
  customOptions: Partial<FileValidationOptions> = {}
): FileValidationOptions {
  const baseOptions: FileValidationOptions = {
    allowMultiple: true,
    maxFiles: 10
  }

  switch (category) {
    case 'image':
      return {
        ...baseOptions,
        allowedTypes: [...ALLOWED_IMAGE_TYPES],
        maxSize: FILE_SIZE_LIMITS.image,
        requireImage: true,
        ...customOptions
      }

    case 'video':
      return {
        ...baseOptions,
        allowedTypes: [...ALLOWED_VIDEO_TYPES],
        maxSize: FILE_SIZE_LIMITS.video,
        ...customOptions
      }

    case 'audio':
      return {
        ...baseOptions,
        allowedTypes: [...ALLOWED_AUDIO_TYPES],
        maxSize: FILE_SIZE_LIMITS.audio,
        ...customOptions
      }

    case 'document':
      return {
        ...baseOptions,
        allowedTypes: [...ALLOWED_DOCUMENT_TYPES],
        maxSize: FILE_SIZE_LIMITS.document,
        requireDocument: true,
        ...customOptions
      }

    case 'all':
    default:
      return {
        ...baseOptions,
        allowedTypes: [...ALLOWED_FILE_TYPES],
        maxSize: FILE_SIZE_LIMITS.default,
        ...customOptions
      }
  }
}

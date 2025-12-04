'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, File, Image, Video, Music, FileText, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { validateFile, getValidationErrorMessage, formatFileSize, getFileCategory } from '@/lib/file-validation'

interface FileUploadItem {
  file: File
  id: string
  status: 'pending' | 'uploading' | 'success' | 'error'
  progress: number
  error?: string
  url?: string
  uploadedId?: string
}

interface FileDropzoneProps {
  onUpload?: (files: FileUploadItem[]) => void
  maxFiles?: number
  maxSize?: number
  allowedTypes?: string[]
  folder?: string
  disabled?: boolean
  className?: string
  showPreview?: boolean
  showButtons?: boolean
  onClearAll?: () => void
  onUploadClick?: () => void
}

export function FileDropzone({
  onUpload,
  maxFiles = 10,
  maxSize,
  allowedTypes,
  folder,
  disabled = false,
  className = '',
  showPreview = true,
  showButtons = true,
  onClearAll,
  onUploadClick
}: FileDropzoneProps) {
  const [files, setFiles] = useState<FileUploadItem[]>([])
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(({ file, errors }) => {
        console.error(`File rejected: ${file.name}`, errors)
      })
    }

    // Validate and add accepted files
    const validFiles: FileUploadItem[] = []
    const errors: string[] = []

    acceptedFiles.forEach(file => {
      const validation = validateFile(file, { maxSize, allowedTypes })

      if (validation.valid) {
        validFiles.push({
          file,
          id: Math.random().toString(36).substring(7),
          status: 'pending',
          progress: 0
        })
      } else {
        errors.push(`${file.name}: ${getValidationErrorMessage(validation.errors)}`)
      }
    })

    // Show errors if any
    if (errors.length > 0) {
      console.error('Validation errors:', errors)
    }

    // Check max files limit
    const currentFileCount = files.filter(f => f.status !== 'error').length
    const availableSlots = maxFiles - currentFileCount

    if (validFiles.length > availableSlots) {
      console.warn(`Only ${availableSlots} more files allowed (max: ${maxFiles})`)
      validFiles.splice(availableSlots)
    }

    setFiles(prev => [...prev, ...validFiles])
  }, [files.length, maxFiles, maxSize, allowedTypes])

  const acceptObject = allowedTypes?.reduce((acc, type) => {
    acc[type] = []
    return acc
  }, {} as Record<string, string[]>)

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: disabled || uploading,
    maxFiles: maxFiles - files.filter(f => f.status !== 'error').length,
    maxSize,
    accept: acceptObject
  })

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const clearAll = () => {
    setFiles([])
  }

  const uploadFiles = async () => {
    if (files.length === 0) return

    setUploading(true)

    const uploadPromises = files.map(async (fileItem) => {
      if (fileItem.status === 'success' || fileItem.status === 'uploading') return fileItem

      setFiles(prev => prev.map(f =>
        f.id === fileItem.id ? { ...f, status: 'uploading', progress: 0 } : f
      ))

      try {
        const formData = new FormData()
        formData.append('files', fileItem.file)
        if (folder) formData.append('folder', folder)
        if (allowedTypes) formData.append('allowedTypes', allowedTypes.join(','))
        if (maxSize) formData.append('maxSize', maxSize.toString())

        const response = await fetch('/api/media', {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()

        // Update file with success
        const updatedFile = {
          ...fileItem,
          status: 'success' as const,
          progress: 100,
          url: result.files[0]?.url,
          uploadedId: result.files[0]?.id
        }

        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? updatedFile : f
        ))

        return updatedFile
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'

        setFiles(prev => prev.map(f =>
          f.id === fileItem.id ? { ...f, status: 'error', error: errorMessage } : f
        ))

        return { ...fileItem, status: 'error' as const, error: errorMessage }
      }
    })

    const results = await Promise.all(uploadPromises)
    setUploading(false)

    if (onUpload) {
      onUpload(results)
    }
  }

  const getFileIcon = (file: File) => {
    const category = getFileCategory(file.type)

    switch (category) {
      case 'image':
        return <Image className="h-4 w-4" />
      case 'video':
        return <Video className="h-4 w-4" />
      case 'audio':
        return <Music className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: FileUploadItem['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Ready</Badge>
      case 'uploading':
        return <Badge variant="default">Uploading</Badge>
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Uploaded</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
    }
  }

  const hasErrors = files.some(f => f.status === 'error')
  const hasPending = files.some(f => f.status === 'pending')
  const canUpload = hasPending && !uploading

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Dropzone */}
      <Card className="border-2 border-dashed transition-colors hover:border-primary/50">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`
              text-center cursor-pointer
              ${isDragActive ? 'bg-primary/5' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              {isDragActive ? 'Drop files here' : 'Upload files'}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to select files
            </p>
            <div className="text-xs text-muted-foreground">
              <p>Maximum {maxFiles} files</p>
              {maxSize && <p>Maximum file size: {formatFileSize(maxSize)}</p>}
              {allowedTypes && allowedTypes.length > 0 && (
                <p>Allowed types: {allowedTypes.join(', ')}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some files failed to upload. Please check the error messages below and try again.
          </AlertDescription>
        </Alert>
      )}

      {/* Files List */}
      {files.length > 0 && showPreview && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                Files ({files.length}/{maxFiles})
              </h3>
              {showButtons && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onClearAll || clearAll}
                    disabled={uploading}
                  >
                    Clear All
                  </Button>
                  {canUpload && (
                    <Button
                      onClick={onUploadClick || uploadFiles}
                      disabled={uploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Files'}
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-3">
              {files.map((fileItem) => (
                <div
                  key={fileItem.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getFileIcon(fileItem.file)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {fileItem.file.name}
                      </p>
                      {getStatusBadge(fileItem.status)}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{formatFileSize(fileItem.file.size)}</span>
                      <span>{fileItem.file.type}</span>
                    </div>

                    {fileItem.status === 'uploading' && (
                      <Progress value={fileItem.progress} className="mt-2" />
                    )}

                    {fileItem.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">
                        {fileItem.error}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(fileItem.id)}
                    disabled={fileItem.status === 'uploading'}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileDropzone } from '@/components/media/file-dropzone'
import { formatFileSize, getFileCategory } from '@/lib/file-validation'
import {
  Search,
  Grid,
  List,
  Check,
  Image as ImageIcon,
  File,
  Video,
  Music,
  FileText,
  Loader2
} from 'lucide-react'

interface UploadedFile {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  thumbnailUrl?: string
  folder?: string
  tags: string[]
  description?: string
}

interface MediaPickerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (files: UploadedFile[]) => void
  multiple?: boolean
  accept?: string // e.g., "image/*"
  maxFiles?: number
  maxSize?: number // in bytes
}

export function MediaPickerModal({
  open,
  onClose,
  onSelect,
  multiple = false,
  accept,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState('browse')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [folders, setFolders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      fetchFiles()
      fetchFolders()
    } else {
      // Reset state when closing
      setSelectedFiles([])
      setSearchTerm('')
      setSelectedType('all')
      setSelectedFolder('')
      setActiveTab('browse')
    }
  }, [open])

  useEffect(() => {
    if (open && activeTab === 'browse') {
      fetchFiles()
    }
  }, [searchTerm, selectedType, selectedFolder, activeTab])

  const fetchFiles = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedType !== 'all') params.append('type', selectedType)
      if (selectedFolder) params.append('folder', selectedFolder)

      const response = await fetch(`/api/media?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()

        // Filter by accept type if provided
        let filteredFiles = data.files || []
        if (accept) {
          filteredFiles = filteredFiles.filter((file: UploadedFile) => {
            if (!file.mimeType) return false
            if (accept === 'image/*') return file.mimeType.startsWith('image/')
            if (accept === 'video/*') return file.mimeType.startsWith('video/')
            if (accept === 'audio/*') return file.mimeType.startsWith('audio/')
            return true
          })
        }

        setFiles(filteredFiles)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/media/folders')
      if (response.ok) {
        const data = await response.json()
        setFolders(data.folders || [])
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
    }
  }

  const handleSelectFile = (fileId: string) => {
    if (multiple) {
      setSelectedFiles(prev =>
        prev.includes(fileId)
          ? prev.filter(id => id !== fileId)
          : maxFiles && prev.length >= maxFiles
          ? prev
          : [...prev, fileId]
      )
    } else {
      setSelectedFiles([fileId])
    }
  }

  const handleConfirmSelection = () => {
    const selected = files.filter(f => selectedFiles.includes(f.id))
    onSelect(selected)
    onClose()
  }

  const handleUploadComplete = (results: any[]) => {
    setActiveTab('browse')
    fetchFiles()

    // Auto-select uploaded files if within limit
    const successfulUploads = results.filter(r => r.status === 'success' && r.uploadedId)
    if (successfulUploads.length > 0) {
      const uploadedIds = successfulUploads.map(r => r.uploadedId)
      if (multiple) {
        setSelectedFiles(prev => {
          const newSelection = [...prev, ...uploadedIds]
          return maxFiles ? newSelection.slice(0, maxFiles) : newSelection
        })
      } else {
        setSelectedFiles([uploadedIds[0]])
      }
    }
  }

  const getFileIcon = (mimeType: string) => {
    const category = getFileCategory(mimeType)
    switch (category) {
      case 'image':
        return <ImageIcon className="h-4 w-4" />
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

  const isImage = (mimeType: string) => mimeType?.startsWith('image/') || false

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Media</DialogTitle>
          <DialogDescription>
            {multiple
              ? `Choose up to ${maxFiles} file${maxFiles > 1 ? 's' : ''} from your library or upload new ones`
              : 'Choose a file from your library or upload a new one'
            }
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">Browse Library</TabsTrigger>
            <TabsTrigger value="upload">Upload New</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col overflow-hidden mt-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="flex gap-2">
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="File type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="image">Images</SelectItem>
                    <SelectItem value="video">Videos</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="document">Documents</SelectItem>
                  </SelectContent>
                </Select>

                {folders.length > 0 && (
                  <Select
                    value={selectedFolder || '__all__'}
                    onValueChange={(val) => setSelectedFolder(val === '__all__' ? '' : val)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">All Folders</SelectItem>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.slug}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Files Display */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No files found. Try adjusting your filters or upload new files.
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`relative border rounded-lg overflow-hidden cursor-pointer transition-all ${
                        selectedFiles.includes(file.id)
                          ? 'ring-2 ring-primary'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleSelectFile(file.id)}
                    >
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        {isImage(file.mimeType) ? (
                          <img
                            src={file.thumbnailUrl || file.url}
                            alt={file.originalName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            {getFileIcon(file.mimeType)}
                          </div>
                        )}
                      </div>

                      {selectedFiles.includes(file.id) && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}

                      <div className="p-2">
                        <p className="text-xs font-medium truncate">{file.originalName}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center gap-4 p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedFiles.includes(file.id)
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handleSelectFile(file.id)}
                    >
                      <div className="flex-shrink-0">
                        {isImage(file.mimeType) ? (
                          <img
                            src={file.thumbnailUrl || file.url}
                            alt={file.originalName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                            {getFileIcon(file.mimeType)}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{file.originalName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {getFileCategory(file.mimeType)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                        </div>
                      </div>

                      {selectedFiles.includes(file.id) && (
                        <div className="bg-primary text-primary-foreground rounded-full p-1">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="upload" className="flex-1 flex flex-col mt-4">
            <FileDropzone
              onUpload={handleUploadComplete}
              maxFiles={multiple ? maxFiles : 1}
              maxSize={maxSize}
              folder={selectedFolder || undefined}
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <div className="flex items-center justify-between w-full">
            <div className="text-sm text-muted-foreground">
              {selectedFiles.length > 0 && (
                <span>
                  {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmSelection}
                disabled={selectedFiles.length === 0}
              >
                Select {selectedFiles.length > 0 && `(${selectedFiles.length})`}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

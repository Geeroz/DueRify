'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { FileDropzone } from '@/components/media/file-dropzone'
import { formatFileSize, getFileCategory } from '@/lib/file-validation'
import {
  Search,
  Grid,
  List,
  Trash2,
  MoreHorizontal,
  Image as ImageIcon,
  File,
  Video,
  Music,
  FileText,
  Folder,
  FolderPlus,
  FolderInput,
  Upload,
  Loader2,
  Copy,
  Download,
  Check,
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
  uploadedAt: string
  uploadedBy?: {
    id: string
    name: string
    email: string
  }
}

interface MediaFolder {
  id: string
  name: string
  slug: string
  description?: string
  fileCount: number
}

export function MediaPageClient() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [folders, setFolders] = useState<MediaFolder[]>([])
  const [uncategorizedCount, setUncategorizedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedFolder, setSelectedFolder] = useState<string>('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Multi-select state
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])

  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [isDeleteMultipleOpen, setIsDeleteMultipleOpen] = useState(false)
  const [isMoveOpen, setIsMoveOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [newFolderDescription, setNewFolderDescription] = useState('')
  const [isCreatingFolder, setIsCreatingFolder] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeletingMultiple, setIsDeletingMultiple] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  const [destinationFolder, setDestinationFolder] = useState<string>('')

  useEffect(() => {
    fetchFiles()
    fetchFolders()
  }, [])

  useEffect(() => {
    fetchFiles()
    // Clear selection when filters change
    setSelectedFiles([])
  }, [searchTerm, selectedType, selectedFolder])

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
        setFiles(data.files || [])
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
        setUncategorizedCount(data.uncategorizedCount || 0)
      }
    } catch (error) {
      console.error('Error fetching folders:', error)
    }
  }

  const handleUploadComplete = () => {
    setIsUploadOpen(false)
    fetchFiles()
    fetchFolders()
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return

    setIsCreatingFolder(true)
    try {
      const response = await fetch('/api/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          description: newFolderDescription || undefined,
        }),
      })

      if (response.ok) {
        setIsCreateFolderOpen(false)
        setNewFolderName('')
        setNewFolderDescription('')
        fetchFolders()
        toast.success('Folder created successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create folder')
      }
    } catch (error) {
      toast.error('Failed to create folder')
    } finally {
      setIsCreatingFolder(false)
    }
  }

  const handleDeleteFile = async () => {
    if (!selectedFile) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/media/${selectedFile.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setIsDeleteOpen(false)
        setSelectedFile(null)
        fetchFiles()
        fetchFolders()
        toast.success('File deleted successfully')
      } else {
        toast.error('Failed to delete file')
      }
    } catch (error) {
      toast.error('Failed to delete file')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteMultiple = async () => {
    if (selectedFiles.length === 0) return

    setIsDeletingMultiple(true)
    try {
      const filesToDelete = files
        .filter(f => selectedFiles.includes(f.id))
        .map(f => f.url)

      const response = await fetch('/api/media', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrls: filesToDelete }),
      })

      if (response.ok) {
        setIsDeleteMultipleOpen(false)
        setSelectedFiles([])
        fetchFiles()
        fetchFolders()
        toast.success(`Successfully deleted ${selectedFiles.length} file(s)`)
      } else {
        toast.error('Failed to delete files')
      }
    } catch (error) {
      toast.error('Failed to delete files')
    } finally {
      setIsDeletingMultiple(false)
    }
  }

  const handleMoveFiles = async () => {
    if (selectedFiles.length === 0) return

    setIsMoving(true)
    try {
      const response = await fetch('/api/media/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileIds: selectedFiles,
          destinationFolder: destinationFolder === '__root__' ? null : destinationFolder,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setIsMoveOpen(false)
        setSelectedFiles([])
        setDestinationFolder('')
        fetchFiles()
        fetchFolders()
        toast.success(`Successfully moved ${result.movedCount} file(s)`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to move files')
      }
    } catch (error) {
      toast.error('Failed to move files')
    } finally {
      setIsMoving(false)
    }
  }

  const handleSelectFile = (fileId: string) => {
    setSelectedFiles(prev =>
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    )
  }

  const handleSelectAll = () => {
    if (selectedFiles.length === files.length) {
      setSelectedFiles([])
    } else {
      setSelectedFiles(files.map(f => f.id))
    }
  }

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url)
    toast.success('URL copied to clipboard')
  }

  const getFileIcon = (mimeType: string) => {
    const category = getFileCategory(mimeType)
    switch (category) {
      case 'image':
        return <ImageIcon className="h-8 w-8" />
      case 'video':
        return <Video className="h-8 w-8" />
      case 'audio':
        return <Music className="h-8 w-8" />
      case 'document':
        return <FileText className="h-8 w-8" />
      default:
        return <File className="h-8 w-8" />
    }
  }

  const isImage = (mimeType: string) => mimeType?.startsWith('image/') || false

  // Calculate total files count for "All Files"
  const totalFilesCount = folders.reduce((acc, f) => acc + f.fileCount, 0) + uncategorizedCount

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Media</h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Upload and manage your media files
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Create a folder to organize your media files.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="folderName">Folder Name</Label>
                  <Input
                    id="folderName"
                    placeholder="e.g., Product Images"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folderDescription">Description (optional)</Label>
                  <Textarea
                    id="folderDescription"
                    placeholder="What will this folder contain?"
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFolder}
                  disabled={isCreatingFolder || !newFolderName.trim()}
                >
                  {isCreatingFolder ? 'Creating...' : 'Create Folder'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  Upload files to your media library. Max 50MB per file.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <FileDropzone
                  onUpload={handleUploadComplete}
                  maxFiles={10}
                  folder={selectedFolder || undefined}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Mobile Folder Selector */}
      <div className="md:hidden">
        <Select value={selectedFolder || '__all__'} onValueChange={(val) => setSelectedFolder(val === '__all__' ? '' : val)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select folder" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                All Files ({totalFilesCount})
              </div>
            </SelectItem>
            {folders.map((folder) => (
              <SelectItem key={folder.id} value={folder.slug}>
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4 text-blue-500" />
                  {folder.name} ({folder.fileCount})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Main content with sidebar */}
      <div className="flex gap-6">
        {/* Folder Sidebar */}
        <div className="w-56 flex-shrink-0 hidden md:block">
          <div className="sticky top-6">
            <div className="bg-white dark:bg-card rounded-lg border shadow-sm p-3">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                Folders
              </div>
              <div className="space-y-1">
                {/* All Files */}
                <button
                  onClick={() => setSelectedFolder('')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                    selectedFolder === ''
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground'
                  }`}
                >
                  <Folder className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate flex-1 text-left">All Files</span>
                  <span className={`text-xs ${selectedFolder === '' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {totalFilesCount}
                  </span>
                </button>

                {/* Separator */}
                {folders.length > 0 && (
                  <div className="my-2 border-t border-border" />
                )}

                {/* Folder list */}
                {folders.map((folder) => (
                  <button
                    key={folder.id}
                    onClick={() => setSelectedFolder(folder.slug)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedFolder === folder.slug
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <Folder className={`h-4 w-4 flex-shrink-0 ${selectedFolder === folder.slug ? '' : 'text-blue-500'}`} />
                    <span className="truncate flex-1 text-left">{folder.name}</span>
                    <span className={`text-xs ${selectedFolder === folder.slug ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {folder.fileCount}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Files Area */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
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

          {/* Selection Actions Bar */}
          {selectedFiles.length > 0 && (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CardContent className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedFiles([])}
                    >
                      Clear selection
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsMoveOpen(true)}
                    >
                      <FolderInput className="h-4 w-4 mr-2" />
                      Move
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setIsDeleteMultipleOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Select All */}
          {files.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="select-all"
                checked={selectedFiles.length === files.length && files.length > 0}
                onCheckedChange={handleSelectAll}
              />
              <Label htmlFor="select-all" className="text-sm text-muted-foreground cursor-pointer">
                Select all ({files.length} files)
              </Label>
            </div>
          )}

          {/* Files */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : files.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Files Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Upload your first file to get started.
            </p>
            <Button onClick={() => setIsUploadOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Files
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {files.map((file) => (
            <Card
              key={file.id}
              className={`overflow-hidden group relative ${
                selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''
              }`}
            >
              {/* Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => handleSelectFile(file.id)}
                  className="bg-white border-2"
                />
              </div>

              {/* Selected indicator */}
              {selectedFiles.includes(file.id) && (
                <div className="absolute top-2 right-2 z-10 bg-primary text-primary-foreground rounded-full p-1">
                  <Check className="h-3 w-3" />
                </div>
              )}

              <div className="aspect-square bg-muted flex items-center justify-center relative">
                {isImage(file.mimeType) ? (
                  <img
                    src={file.thumbnailUrl || file.url}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-muted-foreground">
                    {getFileIcon(file.mimeType)}
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      copyToClipboard(file.url)
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(file.url, '_blank')
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFile(file)
                      setIsDeleteOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate">{file.originalName}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {files.map((file) => (
            <Card
              key={file.id}
              className={selectedFiles.includes(file.id) ? 'ring-2 ring-primary' : ''}
            >
              <CardContent className="flex items-center gap-4 p-4">
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onCheckedChange={() => handleSelectFile(file.id)}
                />

                <div className="flex-shrink-0">
                  {isImage(file.mimeType) ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.originalName}
                      className="w-12 h-12 object-cover rounded"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground">
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
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    {file.folder && (
                      <span className="text-xs text-muted-foreground">
                        in {file.folder}
                      </span>
                    )}
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => copyToClipboard(file.url)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(file.url, '_blank')}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedFile(file)
                        setIsDeleteOpen(true)
                      }}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </div>
      </div>

      {/* Delete Single File Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{selectedFile?.originalName}&quot;? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFile} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Multiple Files Dialog */}
      <Dialog open={isDeleteMultipleOpen} onOpenChange={setIsDeleteMultipleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Files</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteMultipleOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMultiple} disabled={isDeletingMultiple}>
              {isDeletingMultiple ? 'Deleting...' : `Delete ${selectedFiles.length} file${selectedFiles.length !== 1 ? 's' : ''}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Files Dialog */}
      <Dialog open={isMoveOpen} onOpenChange={setIsMoveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Files</DialogTitle>
            <DialogDescription>
              Select a destination folder for {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="destination-folder">Destination Folder</Label>
              <Select
                value={destinationFolder}
                onValueChange={setDestinationFolder}
              >
                <SelectTrigger id="destination-folder">
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__root__">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      Root (No folder)
                    </div>
                  </SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.slug}>
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4" />
                        {folder.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsMoveOpen(false)
                setDestinationFolder('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleMoveFiles} disabled={isMoving || !destinationFolder}>
              {isMoving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Moving...
                </>
              ) : (
                'Move Files'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Download, Trash2, Eye, CheckCircle, XCircle, Clock, FileText, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'

interface Document {
  id: string
  filename: string
  blobUrl: string
  fileSize: number
  mimeType: string
  category: string
  customCategory?: string
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED'
  verificationNotes?: string
  uploadedBy: {
    id: string
    name: string | null
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface DocumentListProps {
  startupId: string
  refreshTrigger?: number
  userRole?: string
  isInvestor?: boolean
}

export function DocumentList({ startupId, refreshTrigger, userRole, isInvestor = false }: DocumentListProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false)
  const [verifyDoc, setVerifyDoc] = useState<Document | null>(null)
  const [verifyNotes, setVerifyNotes] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [startupId, refreshTrigger])

  const fetchDocuments = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({ startupId })
      if (categoryFilter !== 'all') params.append('category', categoryFilter)
      if (statusFilter !== 'all') params.append('verificationStatus', statusFilter)
      if (search) params.append('search', search)

      const response = await fetch(`/api/documents?${params}`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('API Error:', response.status, errorData)
        throw new Error(errorData.error || 'Failed to fetch documents')
      }

      const result = await response.json()
      setDocuments(result.data)
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete document')

      toast.success('Document deleted successfully')
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete document')
    }
  }

  const handleVerify = async (status: 'VERIFIED' | 'REJECTED') => {
    if (!verifyDoc) return

    try {
      const response = await fetch(`/api/documents/${verifyDoc.id}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          notes: verifyNotes || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to verify document')

      const result = await response.json()
      toast.success(`Document ${status.toLowerCase()} successfully`)

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === verifyDoc.id ? result.data : doc))
      )

      setVerifyDialogOpen(false)
      setVerifyDoc(null)
      setVerifyNotes('')
    } catch (error) {
      console.error('Verify error:', error)
      toast.error('Failed to verify document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircle className="h-4 w-4" />
      case 'REJECTED':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' => {
    switch (status) {
      case 'VERIFIED':
        return 'default'
      case 'REJECTED':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  const canDelete = (doc: Document, currentUserId?: string) => {
    if (isInvestor) return false
    return userRole === 'INCUBATOR_ADMIN' || userRole === 'STARTUP_ADMIN' || doc.uploadedBy.id === currentUserId
  }

  const canVerify = () => {
    if (isInvestor) return false
    return userRole === 'INCUBATOR_ADMIN' || userRole === 'STARTUP_ADMIN'
  }

  const filteredDocuments = documents

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          Manage and organize your due diligence documents
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchDocuments()}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Financial">Financial</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Product">Product</SelectItem>
              <SelectItem value="Team">Team</SelectItem>
              <SelectItem value="Market Research">Market Research</SelectItem>
              <SelectItem value="Custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="VERIFIED">Verified</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchDocuments}>Search</Button>
        </div>

        {/* Document List */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : filteredDocuments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No documents found. Upload your first document to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate">{doc.filename}</h4>
                      <Badge variant={getStatusVariant(doc.verificationStatus)} className="shrink-0">
                        <span className="flex items-center gap-1">
                          {getStatusIcon(doc.verificationStatus)}
                          {doc.verificationStatus}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{doc.category}</span>
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>{format(new Date(doc.createdAt), 'MMM d, yyyy')}</span>
                      <span>by {doc.uploadedBy.name || doc.uploadedBy.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(doc.blobUrl, '_blank')}
                    title="View document"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const link = document.createElement('a')
                      link.href = doc.blobUrl
                      link.download = doc.filename
                      link.click()
                    }}
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  {canVerify() && doc.verificationStatus === 'PENDING' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setVerifyDoc(doc)
                        setVerifyDialogOpen(true)
                      }}
                      title="Verify document"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete(doc) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteId(doc.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && handleDelete(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Verification Dialog */}
      <AlertDialog open={verifyDialogOpen} onOpenChange={setVerifyDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Verify Document</AlertDialogTitle>
            <AlertDialogDescription>
              Review and verify or reject this document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Input
              placeholder="Add notes (optional)"
              value={verifyNotes}
              onChange={(e) => setVerifyNotes(e.target.value)}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button variant="destructive" onClick={() => handleVerify('REJECTED')}>
              Reject
            </Button>
            <AlertDialogAction onClick={() => handleVerify('VERIFIED')}>
              Verify
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

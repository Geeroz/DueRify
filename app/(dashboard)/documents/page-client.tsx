'use client'

import { useState } from 'react'
import { DocumentUpload } from '@/components/documents/document-upload'
import { DocumentList } from '@/components/documents/document-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface DocumentsPageClientProps {
  startupId: string
  userRole: string
  userId: string
  isInvestor?: boolean
}

export function DocumentsPageClient({ startupId, userRole, userId, isInvestor = false }: DocumentsPageClientProps) {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1)
  }

  // Investor view (read-only)
  if (isInvestor) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <p className="text-muted-foreground">
              View and download verified documents
            </p>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2">
            <Eye className="h-3 w-3" />
            Read-Only Access
          </Badge>
        </div>

        <DocumentList
          startupId={startupId}
          refreshTrigger={refreshTrigger}
          userRole={userRole}
          isInvestor={true}
        />
      </div>
    )
  }

  // Regular user view
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
        <p className="text-muted-foreground">
          Upload and manage your due diligence documents
        </p>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document List
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-6">
          <DocumentList
            startupId={startupId}
            refreshTrigger={refreshTrigger}
            userRole={userRole}
            isInvestor={false}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-6">
          <DocumentUpload
            startupId={startupId}
            onUploadComplete={handleUploadComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

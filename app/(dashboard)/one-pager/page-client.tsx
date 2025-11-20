'use client'

import { useState } from 'react'
import { OnePagerEditor } from '@/components/one-pager/one-pager-editor'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Eye, Share2, BarChart3 } from 'lucide-react'

interface OnePagerPageClientProps {
  startupId: string
  startupName: string
  userRole: string
  existingOnePager: any | null
}

export function OnePagerPageClient({
  startupId,
  startupName,
  userRole,
  existingOnePager,
}: OnePagerPageClientProps) {
  const [activeTab, setActiveTab] = useState('editor')

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          One-Pager
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Create and manage your startup's one-pager for {startupName}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Editor</span>
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Preview</span>
          </TabsTrigger>
          <TabsTrigger value="share" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            <span className="hidden sm:inline">Share</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <OnePagerEditor
            startupId={startupId}
            existingData={existingOnePager}
          />
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          {existingOnePager ? (
            <div className="rounded-lg border bg-card p-6 space-y-6">
              <div>
                <h2 className="text-2xl font-bold">{existingOnePager.companyName}</h2>
                <p className="text-muted-foreground mt-1">{existingOnePager.tagline}</p>
              </div>

              {existingOnePager.problemSection && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Problem</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {existingOnePager.problemSection}
                  </p>
                </div>
              )}

              {existingOnePager.solutionSection && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Solution</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {existingOnePager.solutionSection}
                  </p>
                </div>
              )}

              {existingOnePager.marketSection && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Market</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {existingOnePager.marketSection}
                  </p>
                </div>
              )}

              {existingOnePager.productSection && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Product</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {existingOnePager.productSection}
                  </p>
                </div>
              )}

              {existingOnePager.teamSection && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Team</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {existingOnePager.teamSection}
                  </p>
                </div>
              )}

              {existingOnePager.contactInfo && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Contact</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {existingOnePager.contactInfo}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground">
                No one-pager created yet. Start editing to create your one-pager.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="share" className="mt-6">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Share Your One-Pager</h3>
            {existingOnePager?.slug ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Public URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${window.location.origin}/one-pager/${existingOnePager.slug}`}
                      className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/one-pager/${existingOnePager.slug}`
                        )
                      }}
                      className="rounded-md border bg-background px-4 py-2 text-sm hover:bg-accent"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Status: {existingOnePager.isPublic ? 'Public' : 'Private'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Views: {existingOnePager.viewCount || 0}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Save your one-pager first to generate a shareable link.
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-semibold">Analytics</h3>
            {existingOnePager ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Total Views</p>
                    <p className="text-2xl font-bold">{existingOnePager.viewCount || 0}</p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold">
                      {existingOnePager.isPublic ? 'Public' : 'Private'}
                    </p>
                  </div>
                  <div className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="text-sm font-medium">
                      {new Date(existingOnePager.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detailed view history coming soon...
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No analytics available yet. Create your one-pager to start tracking views.
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Puck, type Data } from '@measured/puck'
import { config, initialData } from '@/lib/puck/config'
import { ArrowLeft, Save, Eye, EyeOff, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import '@measured/puck/puck.css'

interface LandingPageEditorClientProps {
  landingPage: {
    id: string
    title: string
    slug: string
    isPublished: boolean
    data: Data | null
  }
  startupName: string
}

export function LandingPageEditorClient({
  landingPage,
  startupName,
}: LandingPageEditorClientProps) {
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isPublished, setIsPublished] = useState(landingPage.isPublished)
  const [currentData, setCurrentData] = useState<Data>(landingPage.data || initialData)

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/landing-pages/${landingPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: currentData }),
      })

      if (response.ok) {
        setLastSaved(new Date())
      } else {
        alert('Failed to save changes')
      }
    } catch (error) {
      alert('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }, [landingPage.id, currentData])

  const handlePublishToggle = useCallback(async () => {
    setIsPublishing(true)
    try {
      const response = await fetch(`/api/landing-pages/${landingPage.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !isPublished }),
      })

      if (response.ok) {
        setIsPublished(!isPublished)
      } else {
        alert('Failed to update publish status')
      }
    } catch (error) {
      alert('Failed to update publish status')
    } finally {
      setIsPublishing(false)
    }
  }, [landingPage.id, isPublished])

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col -m-4 md:-m-6">
      {/* Header - Title and Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/landing-page')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="font-semibold">{landingPage.title}</h1>
            <p className="text-xs text-muted-foreground">{startupName}</p>
          </div>
          <Badge variant={isPublished ? 'default' : 'secondary'}>
            {isPublished ? 'Published' : 'Draft'}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground">
          {lastSaved ? (
            <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
          ) : (
            <span>Not saved yet</span>
          )}
        </div>
      </div>

      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        <Puck
          config={config}
          data={currentData}
          onChange={setCurrentData}
          overrides={{
            headerActions: ({ children }) => (
              <>
                {children}
                <Button
                  variant={isPublished ? 'outline' : 'secondary'}
                  size="sm"
                  onClick={handlePublishToggle}
                  disabled={isPublishing}
                >
                  {isPublished ? (
                    <>
                      <EyeOff className="mr-2 h-4 w-4" />
                      {isPublishing ? 'Unpublishing...' : 'Unpublish'}
                    </>
                  ) : (
                    <>
                      <Eye className="mr-2 h-4 w-4" />
                      {isPublishing ? 'Publishing...' : 'Publish'}
                    </>
                  )}
                </Button>
                {isPublished && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/page/${landingPage.slug}`, '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Live
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </>
            ),
          }}
        />
      </div>
    </div>
  )
}

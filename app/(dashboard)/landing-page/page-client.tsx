'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, ExternalLink, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface LandingPage {
  id: string
  title: string
  slug: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

interface LandingPageListClientProps {
  startupId: string
  startupName: string
  userRole: string
  landingPages: LandingPage[]
}

export function LandingPageListClient({
  startupId,
  startupName,
  userRole,
  landingPages: initialPages,
}: LandingPageListClientProps) {
  const router = useRouter()
  const [landingPages, setLandingPages] = useState(initialPages)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedPage, setSelectedPage] = useState<LandingPage | null>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newSlug, setNewSlug] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleTitleChange = (title: string) => {
    setNewTitle(title)
    setNewSlug(generateSlug(title))
  }

  const handleCreate = async () => {
    if (!newTitle.trim() || !newSlug.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId,
          title: newTitle,
          slug: newSlug,
        }),
      })

      if (response.ok) {
        const newPage = await response.json()
        router.push(`/landing-page/${newPage.id}/edit`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create landing page')
      }
    } catch (error) {
      alert('Failed to create landing page')
    } finally {
      setIsLoading(false)
      setIsCreateOpen(false)
      setNewTitle('')
      setNewSlug('')
    }
  }

  const handleDelete = async () => {
    if (!selectedPage) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/landing-pages/${selectedPage.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLandingPages(landingPages.filter(p => p.id !== selectedPage.id))
      } else {
        alert('Failed to delete landing page')
      }
    } catch (error) {
      alert('Failed to delete landing page')
    } finally {
      setIsLoading(false)
      setIsDeleteOpen(false)
      setSelectedPage(null)
    }
  }

  const togglePublish = async (page: LandingPage) => {
    try {
      const response = await fetch(`/api/landing-pages/${page.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isPublished: !page.isPublished,
        }),
      })

      if (response.ok) {
        setLandingPages(
          landingPages.map(p =>
            p.id === page.id ? { ...p, isPublished: !p.isPublished } : p
          )
        )
      }
    } catch (error) {
      alert('Failed to update landing page')
    }
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Landing Pages
          </h1>
          <p className="mt-2 text-sm md:text-base text-muted-foreground">
            Create and manage landing pages for {startupName}
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Landing Page</DialogTitle>
              <DialogDescription>
                Enter a title and URL slug for your new landing page.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  placeholder="My Awesome Product"
                  value={newTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug</Label>
                <Input
                  id="slug"
                  placeholder="my-awesome-product"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Your page will be available at: /p/{newSlug || 'your-slug'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate} disabled={isLoading || !newTitle.trim() || !newSlug.trim()}>
                {isLoading ? 'Creating...' : 'Create Page'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {landingPages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Landing Pages Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first landing page to showcase your startup.
            </p>
            <Button onClick={() => setIsCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {landingPages.map((page) => (
            <Card key={page.id} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{page.title}</CardTitle>
                    <CardDescription className="mt-1">
                      /p/{page.slug}
                    </CardDescription>
                  </div>
                  <Badge variant={page.isPublished ? 'default' : 'secondary'}>
                    {page.isPublished ? 'Published' : 'Draft'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/landing-page/${page.id}/edit`)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => togglePublish(page)}
                  >
                    {page.isPublished ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Publish
                      </>
                    )}
                  </Button>
                  {page.isPublished && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/p/${page.slug}`, '_blank')}
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => {
                      setSelectedPage(page)
                      setIsDeleteOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Updated {new Date(page.updatedAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Landing Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedPage?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

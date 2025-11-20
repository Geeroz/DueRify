'use client'

import { useState, useEffect } from 'react'
import { StartupCard } from './startup-card'
import { AddStartupModal } from './add-startup-modal'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Building2 } from 'lucide-react'
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

interface Startup {
  id: string
  name: string
  domain?: string | null
  industry?: string | null
  description?: string | null
  logoUrl?: string | null
  website?: string | null
  metrics: {
    totalDocuments: number
    verifiedDocuments: number
    totalUsers: number
    readinessScore: number | null
    lastActivity: Date
  }
}

export function PortfolioGrid() {
  const [startups, setStartups] = useState<Startup[]>([])
  const [filteredStartups, setFilteredStartups] = useState<Startup[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [industryFilter, setIndustryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('recent')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  useEffect(() => {
    fetchStartups()
  }, [])

  useEffect(() => {
    filterAndSortStartups()
  }, [startups, search, industryFilter, sortBy])

  const fetchStartups = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/startups')
      if (!response.ok) throw new Error('Failed to fetch startups')

      const result = await response.json()
      setStartups(result.data)
    } catch (error) {
      console.error('Fetch error:', error)
      toast.error('Failed to load startups')
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortStartups = () => {
    let filtered = [...startups]

    // Search filter
    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.industry?.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter((s) => s.industry === industryFilter)
    }

    // Sort
    switch (sortBy) {
      case 'recent':
        filtered.sort(
          (a, b) =>
            new Date(b.metrics.lastActivity).getTime() -
            new Date(a.metrics.lastActivity).getTime()
        )
        break
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'readiness':
        filtered.sort((a, b) => {
          const scoreA = a.metrics.readinessScore ?? -1
          const scoreB = b.metrics.readinessScore ?? -1
          return scoreB - scoreA
        })
        break
      case 'documents':
        filtered.sort(
          (a, b) => b.metrics.totalDocuments - a.metrics.totalDocuments
        )
        break
    }

    setFilteredStartups(filtered)
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/startups/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete startup')

      const result = await response.json()
      toast.success(`${result.data.name} deleted successfully`)
      setStartups((prev) => prev.filter((s) => s.id !== id))
      setDeleteId(null)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete startup')
    }
  }

  const industries = Array.from(new Set(startups.map((s) => s.industry).filter(Boolean))) as string[]

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Portfolio</h1>
          <p className="text-muted-foreground">
            Manage your incubator portfolio ({startups.length} startups)
          </p>
        </div>
        <AddStartupModal onSuccess={fetchStartups} />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search startups..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            {industries.map((industry) => (
              <SelectItem key={industry} value={industry}>
                {industry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recent Activity</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="readiness">Readiness Score</SelectItem>
            <SelectItem value="documents">Document Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading startups...</div>
      ) : filteredStartups.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No startups found</h3>
          <p className="text-muted-foreground mb-4">
            {startups.length === 0
              ? 'Add your first startup to get started'
              : 'Try adjusting your search or filters'}
          </p>
          {startups.length === 0 && <AddStartupModal onSuccess={fetchStartups} />}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStartups.map((startup) => (
            <StartupCard
              key={startup.id}
              startup={startup}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Startup</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this startup? This will permanently delete all
              associated data including documents, assessments, and user access. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

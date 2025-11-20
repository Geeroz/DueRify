'use client'

import { Building2, FileText, Users, TrendingUp, MoreVertical, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import Link from 'next/link'

interface StartupCardProps {
  startup: {
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
  onDelete: (id: string) => void
}

export function StartupCard({ startup, onDelete }: StartupCardProps) {
  const getReadinessColor = (score: number | null) => {
    if (score === null) return 'secondary'
    if (score >= 75) return 'default'
    if (score >= 50) return 'secondary'
    return 'destructive'
  }

  const getReadinessLabel = (score: number | null) => {
    if (score === null) return 'Not Assessed'
    if (score >= 75) return 'High Readiness'
    if (score >= 50) return 'Medium Readiness'
    return 'Low Readiness'
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group relative">
      <Link href={`/dashboard?startupId=${startup.id}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {startup.logoUrl ? (
                <img
                  src={startup.logoUrl}
                  alt={`${startup.name} logo`}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg truncate">{startup.name}</CardTitle>
                {startup.industry && (
                  <CardDescription className="truncate">{startup.industry}</CardDescription>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => {
                    e.preventDefault()
                    onDelete(startup.id)
                  }}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Startup
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
      </Link>

      <CardContent className="space-y-4">
        {/* Readiness Score */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Readiness</span>
          <Badge variant={getReadinessColor(startup.metrics.readinessScore)}>
            {startup.metrics.readinessScore !== null
              ? `${startup.metrics.readinessScore}%`
              : 'N/A'}
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col items-center p-2 rounded-lg bg-muted">
            <FileText className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold">
              {startup.metrics.verifiedDocuments}/{startup.metrics.totalDocuments}
            </span>
            <span className="text-xs text-muted-foreground">Docs</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-muted">
            <Users className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold">{startup.metrics.totalUsers}</span>
            <span className="text-xs text-muted-foreground">Users</span>
          </div>

          <div className="flex flex-col items-center p-2 rounded-lg bg-muted">
            <TrendingUp className="h-4 w-4 text-muted-foreground mb-1" />
            <span className="text-lg font-semibold">
              {startup.metrics.readinessScore !== null
                ? `${startup.metrics.readinessScore}%`
                : '-'}
            </span>
            <span className="text-xs text-muted-foreground">Score</span>
          </div>
        </div>

        {/* Last Activity */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t">
          Last activity{' '}
          {formatDistanceToNow(new Date(startup.metrics.lastActivity), { addSuffix: true })}
        </div>
      </CardContent>
    </Card>
  )
}

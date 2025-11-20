import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle, Upload, FileCheck, TrendingUp } from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'document_uploaded' | 'document_verified' | 'assessment_completed' | 'one_pager_updated'
  title: string
  description: string
  timestamp: Date
}

interface ActivityFeedProps {
  activities: ActivityItem[]
}

function getActivityIcon(type: ActivityItem['type']) {
  switch (type) {
    case 'document_uploaded':
      return <Upload className="h-4 w-4 text-blue-600" />
    case 'document_verified':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'assessment_completed':
      return <TrendingUp className="h-4 w-4 text-purple-600" />
    case 'one_pager_updated':
      return <FileCheck className="h-4 w-4 text-orange-600" />
    default:
      return <FileText className="h-4 w-4 text-muted-foreground" />
  }
}

function getActivityBadge(type: ActivityItem['type']) {
  switch (type) {
    case 'document_uploaded':
      return <Badge variant="outline" className="text-blue-600 border-blue-200">Upload</Badge>
    case 'document_verified':
      return <Badge variant="outline" className="text-green-600 border-green-200">Verified</Badge>
    case 'assessment_completed':
      return <Badge variant="outline" className="text-purple-600 border-purple-200">Assessment</Badge>
    case 'one_pager_updated':
      return <Badge variant="outline" className="text-orange-600 border-orange-200">One-Pager</Badge>
    default:
      return <Badge variant="outline">Activity</Badge>
  }
}

function formatTimestamp(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest actions and updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start by uploading documents or completing assessments
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest actions and updates</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium leading-none">
                    {activity.title}
                  </h4>
                  {getActivityBadge(activity.type)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {activity.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatTimestamp(activity.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

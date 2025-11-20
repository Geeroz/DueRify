import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react'

interface StatsCardsProps {
  totalDocuments: number
  verifiedDocuments: number
  pendingDocuments: number
  overallScore?: number | null
}

export function StatsCards({
  totalDocuments,
  verifiedDocuments,
  pendingDocuments,
  overallScore,
}: StatsCardsProps) {
  const verificationRate = totalDocuments > 0
    ? Math.round((verifiedDocuments / totalDocuments) * 100)
    : 0

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalDocuments}</div>
          <p className="text-xs text-muted-foreground">
            {verificationRate}% verified
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Verified</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{verifiedDocuments}</div>
          <p className="text-xs text-muted-foreground">
            Approved documents
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          <AlertCircle className="h-4 w-4 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingDocuments}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting verification
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Readiness Score</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {overallScore !== null && overallScore !== undefined
              ? `${overallScore.toFixed(0)}`
              : '—'}
          </div>
          <p className="text-xs text-muted-foreground">
            {overallScore !== null && overallScore !== undefined
              ? 'IDE Assessment'
              : 'Not completed'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

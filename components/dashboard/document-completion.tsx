import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FileText, CheckCircle2, Circle } from 'lucide-react'

interface DocumentCompletionProps {
  categories: {
    name: string
    count: number
    required: boolean
  }[]
  totalDocuments: number
  verifiedDocuments: number
}

export function DocumentCompletion({
  categories,
  totalDocuments,
  verifiedDocuments,
}: DocumentCompletionProps) {
  const requiredCategories = categories.filter((c) => c.required)
  const completedCategories = requiredCategories.filter((c) => c.count > 0)
  const completionPercentage = requiredCategories.length > 0
    ? Math.round((completedCategories.length / requiredCategories.length) * 100)
    : 0

  const verificationPercentage = totalDocuments > 0
    ? Math.round((verifiedDocuments / totalDocuments) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Document Completion</CardTitle>
        <CardDescription>
          Track your progress across required document categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedCategories.length} / {requiredCategories.length} categories
            </span>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{completionPercentage}% complete</span>
            {completionPercentage === 100 && (
              <Badge variant="default" className="text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>
        </div>

        {/* Verification Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Verification Status</span>
            <span className="text-sm text-muted-foreground">
              {verifiedDocuments} / {totalDocuments} verified
            </span>
          </div>
          <Progress value={verificationPercentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {verificationPercentage}% of documents verified
          </p>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Required Categories</h4>
          <div className="space-y-2">
            {requiredCategories.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3">
                  {category.count > 0 ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className="text-sm">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {category.count} {category.count === 1 ? 'doc' : 'docs'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Categories */}
        {categories.filter((c) => !c.required).length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Optional Categories
            </h4>
            <div className="space-y-2">
              {categories
                .filter((c) => !c.required)
                .map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {category.name}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {category.count} {category.count === 1 ? 'doc' : 'docs'}
                    </Badge>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

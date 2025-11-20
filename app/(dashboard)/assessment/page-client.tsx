'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AssessmentQuestionnaire } from '@/components/assessment/assessment-questionnaire'
import { AssessmentRadarChart } from '@/components/assessment/assessment-radar-chart'
import {
  TRL_QUESTIONS,
  MRL_QUESTIONS,
  CRL_QUESTIONS,
  BRL_QUESTIONS,
  normalizeScore
} from '@/lib/assessment-questions'
import { CheckCircle2, Circle, Lightbulb, TrendingUp } from 'lucide-react'
import { toast } from 'sonner'

interface AssessmentPageClientProps {
  startupId: string
  startupName: string
  userRole: string
  existingAssessment: any | null
}

type DimensionType = 'TRL' | 'MRL' | 'CRL' | 'BRL'

export function AssessmentPageClient({
  startupId,
  startupName,
  userRole,
  existingAssessment: initialAssessment,
}: AssessmentPageClientProps) {
  const [assessment, setAssessment] = useState(initialAssessment)
  const [activeDialog, setActiveDialog] = useState<DimensionType | null>(null)
  const [saving, setSaving] = useState(false)

  const dimensions = [
    {
      id: 'TRL' as DimensionType,
      title: 'Technology Readiness Level',
      description: 'Technical maturity from basic research to proven operational system',
      questions: TRL_QUESTIONS,
      maxLevel: 9,
      score: assessment?.trlScore,
      data: assessment?.trlData,
      icon: '🔬',
    },
    {
      id: 'MRL' as DimensionType,
      title: 'Manufacturing Readiness Level',
      description: 'Production capability and scalability assessment',
      questions: MRL_QUESTIONS,
      maxLevel: 10,
      score: assessment?.mrlScore,
      data: assessment?.mrlData,
      icon: '🏭',
    },
    {
      id: 'CRL' as DimensionType,
      title: 'Commercial Readiness Level',
      description: 'Market readiness and commercial viability evaluation',
      questions: CRL_QUESTIONS,
      maxLevel: 6,
      score: assessment?.crlScore,
      data: assessment?.crlData,
      icon: '💼',
    },
    {
      id: 'BRL' as DimensionType,
      title: 'Business Readiness Level',
      description: 'Business infrastructure and operational maturity',
      questions: BRL_QUESTIONS,
      maxLevel: 10,
      score: assessment?.brlScore,
      data: assessment?.brlData,
      icon: '📊',
    },
  ]

  const handleSaveAssessment = async (dimension: DimensionType, level: number) => {
    try {
      setSaving(true)
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupId,
          dimension,
          level,
          data: { level },
        }),
      })

      if (!response.ok) throw new Error('Failed to save assessment')

      const result = await response.json()
      setAssessment(result.data)
      setActiveDialog(null)
      toast.success(`${dimension} assessment saved successfully`)
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save assessment')
    } finally {
      setSaving(false)
    }
  }

  const getCompletionStatus = () => {
    const completed = dimensions.filter((d) => d.score !== null && d.score !== undefined).length
    return `${completed}/${dimensions.length}`
  }

  const recommendations = assessment?.recommendations as string[] | undefined

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          IDE Readiness Assessment
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Evaluate your startup's readiness across four critical dimensions for {startupName}
        </p>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Assessment Progress</span>
            <Badge variant="secondary">{getCompletionStatus()} Completed</Badge>
          </CardTitle>
          <CardDescription>
            Complete all four dimensions to get your comprehensive readiness score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {dimensions.map((dim) => (
              <div
                key={dim.id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center gap-3">
                  {dim.score !== null && dim.score !== undefined ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{dim.id}</p>
                    <p className="text-xs text-muted-foreground">
                      {dim.score !== null && dim.score !== undefined
                        ? `${dim.score.toFixed(1)}/100`
                        : 'Not completed'}
                    </p>
                  </div>
                </div>
                <span className="text-2xl">{dim.icon}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radar Chart */}
      <AssessmentRadarChart
        trlScore={assessment?.trlScore}
        mrlScore={assessment?.mrlScore}
        crlScore={assessment?.crlScore}
        brlScore={assessment?.brlScore}
        overallScore={assessment?.overallScore}
      />

      {/* Assessment Dimensions */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {dimensions.map((dim) => (
          <Card key={dim.id} className="hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>{dim.icon}</span>
                    {dim.title}
                  </CardTitle>
                  <CardDescription className="text-sm">{dim.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {dim.score !== null && dim.score !== undefined ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current Score</span>
                    <Badge variant="secondary" className="text-lg font-bold">
                      {dim.score.toFixed(1)}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Level</span>
                    <span className="text-sm font-medium">
                      {dim.id} {dim.data?.level || '—'}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Complete this assessment to evaluate your readiness in this dimension
                </p>
              )}
              <Button
                onClick={() => setActiveDialog(dim.id)}
                variant={dim.score !== null && dim.score !== undefined ? 'outline' : 'default'}
                className="w-full"
              >
                {dim.score !== null && dim.score !== undefined ? 'Update Assessment' : 'Start Assessment'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Recommendations
            </CardTitle>
            <CardDescription>
              Based on your assessment scores, here are suggested areas for improvement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recommendations.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-muted">
                  <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Assessment Dialogs */}
      {dimensions.map((dim) => (
        <Dialog
          key={dim.id}
          open={activeDialog === dim.id}
          onOpenChange={(open) => !open && setActiveDialog(null)}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span>{dim.icon}</span>
                {dim.title}
              </DialogTitle>
            </DialogHeader>
            <AssessmentQuestionnaire
              dimension={dim.id}
              title={dim.title}
              description={dim.description}
              questions={dim.questions}
              currentLevel={dim.data?.level}
              onComplete={(level) => handleSaveAssessment(dim.id, level)}
            />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}

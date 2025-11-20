'use client'

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AssessmentRadarChartProps {
  trlScore?: number | null
  mrlScore?: number | null
  crlScore?: number | null
  brlScore?: number | null
  overallScore?: number | null
}

export function AssessmentRadarChart({
  trlScore,
  mrlScore,
  crlScore,
  brlScore,
  overallScore,
}: AssessmentRadarChartProps) {
  const data = [
    {
      dimension: 'TRL',
      score: trlScore || 0,
      fullMark: 100,
    },
    {
      dimension: 'MRL',
      score: mrlScore || 0,
      fullMark: 100,
    },
    {
      dimension: 'CRL',
      score: crlScore || 0,
      fullMark: 100,
    },
    {
      dimension: 'BRL',
      score: brlScore || 0,
      fullMark: 100,
    },
  ]

  const hasAnyScore = data.some((d) => d.score > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness Radar</CardTitle>
        <CardDescription>
          Visual representation of your readiness across all four dimensions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasAnyScore ? (
          <div className="space-y-4">
            <div className="w-full h-[300px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={data}>
                  <PolarGrid strokeDasharray="3 3" />
                  <PolarAngleAxis dataKey="dimension" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar
                    name="Readiness Score"
                    dataKey="score"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary))"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {overallScore !== null && overallScore !== undefined && (
              <div className="text-center p-4 rounded-lg bg-primary/10 border border-primary/20">
                <p className="text-sm text-muted-foreground">Overall Readiness Score</p>
                <p className="text-4xl font-bold text-primary mt-1">
                  {overallScore.toFixed(1)}
                  <span className="text-lg text-muted-foreground">/100</span>
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">TRL</p>
                <p className="text-xl font-semibold">{trlScore?.toFixed(1) || '—'}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">MRL</p>
                <p className="text-xl font-semibold">{mrlScore?.toFixed(1) || '—'}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">CRL</p>
                <p className="text-xl font-semibold">{crlScore?.toFixed(1) || '—'}</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted">
                <p className="text-xs text-muted-foreground">BRL</p>
                <p className="text-xl font-semibold">{brlScore?.toFixed(1) || '—'}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              Complete at least one assessment to see your readiness radar chart
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

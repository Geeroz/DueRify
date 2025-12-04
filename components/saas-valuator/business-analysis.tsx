'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  FileText,
  TrendingUp,
  AlertCircle,
  Target,
  Zap,
  Globe,
  Settings,
  Loader2,
  BrainCircuit,
  Calendar,
} from 'lucide-react'
import type { FinancialModel } from '@/types/saas-valuator'

interface BusinessAnalysisProps {
  model: FinancialModel
}

interface AnalysisResponse {
  analysis: string
  generatedAt: string
  model: string
}

export function BusinessAnalysis({ model }: BusinessAnalysisProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateAnalysis = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/saas-valuator/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate analysis')
      }

      const data = await response.json()
      setAnalysisData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getIconForSection = (title: string) => {
    const lowerTitle = title.toLowerCase()
    if (lowerTitle.includes('executive') || lowerTitle.includes('summary')) {
      return <FileText className="h-5 w-5 mr-2 text-primary" />
    }
    if (lowerTitle.includes('financial') || lowerTitle.includes('performance')) {
      return <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
    }
    if (lowerTitle.includes('risk')) {
      return <AlertCircle className="h-5 w-5 mr-2 text-destructive" />
    }
    if (lowerTitle.includes('strategic') || lowerTitle.includes('recommendation')) {
      return <Target className="h-5 w-5 mr-2 text-primary" />
    }
    if (lowerTitle.includes('market') || lowerTitle.includes('position')) {
      return <Globe className="h-5 w-5 mr-2 text-green-500" />
    }
    if (lowerTitle.includes('operational')) {
      return <Settings className="h-5 w-5 mr-2 text-muted-foreground" />
    }
    return <Zap className="h-5 w-5 mr-2 text-primary" />
  }

  const formatAnalysis = (content: string) => {
    // Split by headers (lines starting with # or numbers)
    const sections = content.split(/\n(?=#{1,3}\s|\d+\.\s)/)

    return sections.map((section, index) => {
      const lines = section.split('\n')
      const firstLine = lines[0] || ''

      // Check if it's a header
      const isMainHeader = firstLine.startsWith('#')
      const headerText = firstLine.replace(/^#{1,3}\s*/, '').replace(/^\d+\.\s*/, '')

      return (
        <div key={index} className="mb-6">
          {(isMainHeader || firstLine.match(/^\d+\./)) && (
            <>
              <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                {getIconForSection(headerText)}
                {headerText}
              </h3>
              {index > 0 && <Separator className="my-4" />}
            </>
          )}
          <div className="text-sm leading-relaxed text-muted-foreground space-y-2">
            {lines.slice(isMainHeader || firstLine.match(/^\d+\./) ? 1 : 0).map((line, lineIndex) => {
              const trimmedLine = line.trim()
              if (!trimmedLine) return null

              // Handle bullet points
              if (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || trimmedLine.startsWith('*')) {
                return (
                  <li key={lineIndex} className="ml-4 list-disc">
                    {trimmedLine.replace(/^[-•*]\s*/, '')}
                  </li>
                )
              }

              // Handle bold text
              const formattedLine = trimmedLine.replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="text-foreground">$1</strong>'
              )

              return (
                <p
                  key={lineIndex}
                  dangerouslySetInnerHTML={{ __html: formattedLine }}
                />
              )
            })}
          </div>
        </div>
      )
    })
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <BrainCircuit className="mr-2 text-primary" />
              AI Business Analysis
            </CardTitle>
            <CardDescription className="mt-2">
              Professional insights and strategic recommendations powered by AI,
              following Big 4 consulting firm methodologies
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {analysisData && (
              <Badge variant="outline" className="text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(analysisData.generatedAt).toLocaleDateString()}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs">
              {model.businessType === 'saas' ? 'SaaS Model' : 'CPG Model'}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {!analysisData ? (
          <div className="text-center py-12">
            <BrainCircuit className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Generate Professional Business Analysis
            </h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Get comprehensive insights and strategic recommendations based on your financial model,
              following the analytical frameworks used by PwC, EY, Deloitte, and KPMG.
            </p>
            <Button onClick={generateAnalysis} disabled={isLoading} className="relative">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Financial Model...
                </>
              ) : (
                <>
                  <BrainCircuit className="mr-2 h-4 w-4" />
                  Generate Analysis Report
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <Badge variant="default" className="text-xs">
                <BrainCircuit className="h-3 w-3 mr-1" />
                Analysis Complete
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={generateAnalysis}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="mr-2 h-3 w-3" />
                    Regenerate Analysis
                  </>
                )}
              </Button>
            </div>

            <div className="prose prose-sm max-w-none">{formatAnalysis(analysisData.analysis)}</div>

            <div className="mt-8 p-4 bg-accent rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Professional Disclaimer</p>
                  <p>
                    This analysis is generated by AI based on financial modeling best practices
                    and consulting methodologies. It should be used as a supplementary tool
                    alongside professional judgment and should not replace comprehensive due
                    diligence or professional advisory services.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div className="text-sm text-destructive">
                <p className="font-medium mb-1">Error Generating Analysis</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

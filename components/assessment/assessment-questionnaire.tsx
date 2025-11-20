'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle } from 'lucide-react'
import { AssessmentQuestion } from '@/lib/assessment-questions'

interface AssessmentQuestionnaireProps {
  dimension: 'TRL' | 'MRL' | 'CRL' | 'BRL'
  title: string
  description: string
  questions: AssessmentQuestion[]
  currentLevel?: number
  onComplete: (level: number) => void
}

export function AssessmentQuestionnaire({
  dimension,
  title,
  description,
  questions,
  currentLevel,
  onComplete,
}: AssessmentQuestionnaireProps) {
  const [selectedLevel, setSelectedLevel] = useState<number>(currentLevel || 0)

  const handleLevelSelect = (level: number) => {
    setSelectedLevel(level)
  }

  const handleSave = () => {
    onComplete(selectedLevel)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
        <p className="text-sm md:text-base text-muted-foreground mt-2">{description}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Your Current Level</CardTitle>
          <CardDescription>
            Choose the level that best describes your current status. Be honest - this helps generate accurate recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {questions.map((question) => (
            <div
              key={question.id}
              onClick={() => handleLevelSelect(question.level)}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                selectedLevel === question.level
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-accent/50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {selectedLevel === question.level ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{dimension} {question.level}</Badge>
                    <h3 className="font-semibold text-sm md:text-base">{question.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{question.description}</p>
                  {question.examples && question.examples.length > 0 && (
                    <div className="pt-2">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Examples:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {question.examples.map((example, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          {selectedLevel > 0 && (
            <p className="text-sm text-muted-foreground">
              Selected Level: <span className="font-semibold">{dimension} {selectedLevel}</span>
            </p>
          )}
        </div>
        <Button onClick={handleSave} disabled={selectedLevel === 0} size="lg">
          Save Assessment
        </Button>
      </div>
    </div>
  )
}

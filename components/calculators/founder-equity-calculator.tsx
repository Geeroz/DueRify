'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Plus, X, Users, Calculator, Edit2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { saveToLocalStorage, loadFromLocalStorage } from '@/lib/local-storage'

interface Founder {
  id: string
  name: string
  equity: number
}

interface Question {
  id: string
  text: string
  weight: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC0CB', '#A0522D']

const ASSESSMENT_QUESTIONS: Question[] = [
  { id: 'ceo', text: 'Who is the CEO?', weight: 5 },
  { id: 'coding', text: 'Which founders are coding most of the codebase?', weight: 7 },
  { id: 'idea', text: 'Who had the original idea and told the others?', weight: 3 },
  { id: 'manager', text: 'If you could magically hire a few developers, would one of the founders become their manager, and if so, who?', weight: 5 },
  { id: 'parttime', text: 'Which founders are working part-time and will join full-time once you get funding?', weight: -3 },
  { id: 'funding_impact', text: 'If this founder left, it would severely impact your chances of raising funding', weight: 6 },
  { id: 'dev_impact', text: 'If this founder left, your development schedule would be severely impacted', weight: 7 },
  { id: 'launch_impact', text: 'If this founder left, it would compromise your launch or initial traction', weight: 6 },
  { id: 'revenue_impact', text: 'If this founder left, it would probably prevent us from generating revenue quickly', weight: 6 },
  { id: 'marketing', text: 'Who writes the blog and the marketing copy that goes on the site?', weight: 4 },
  { id: 'features', text: 'Who comes up with most of the features?', weight: 5 },
  { id: 'budget', text: 'Who has a spreadsheet with budget estimates or simulations?', weight: 3 },
  { id: 'expenses', text: 'So far, who pays for basic business expenses like printing business cards, web hosting?', weight: 2 },
  { id: 'pitches', text: 'Who pitches investors?', weight: 5 },
  { id: 'connected', text: 'Who is well connected with your target industry, providing introductions to potential customers, journalists and influencers?', weight: 4 }
]

const STORAGE_KEY = 'duerify-founder-equity-data'

interface SavedData {
  founders: Founder[]
  mode: 'manual' | 'assessment'
  answers: Record<string, string[]>
}

export default function FounderEquityCalculator() {
  const [founders, setFounders] = useState<Founder[]>([
    { id: '1', name: 'Founder A', equity: 50 },
    { id: '2', name: 'Founder B', equity: 50 }
  ])
  const [mode, setMode] = useState<'manual' | 'assessment'>('manual')
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const saved = loadFromLocalStorage<SavedData | null>(STORAGE_KEY, null)
    if (saved) {
      setFounders(saved.founders)
      setMode(saved.mode)
      setAnswers(saved.answers)
    }
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (mounted) {
      saveToLocalStorage<SavedData>(STORAGE_KEY, { founders, mode, answers })
    }
  }, [founders, mode, answers, mounted])

  const addFounder = () => {
    if (founders.length >= 4) return

    const newFounder: Founder = {
      id: Date.now().toString(),
      name: `Founder ${String.fromCharCode(65 + founders.length)}`,
      equity: 0
    }
    setFounders([...founders, newFounder])

    // Auto-normalize equity
    normalizeEquity([...founders, newFounder])
  }

  const removeFounder = (id: string) => {
    if (founders.length <= 2) return

    const updatedFounders = founders.filter(f => f.id !== id)
    setFounders(updatedFounders)
    normalizeEquity(updatedFounders)

    // Clean up answers
    const updatedAnswers = { ...answers }
    Object.keys(updatedAnswers).forEach(questionId => {
      updatedAnswers[questionId] = updatedAnswers[questionId].filter(founderId => founderId !== id)
    })
    setAnswers(updatedAnswers)
  }

  const updateFounderName = (id: string, name: string) => {
    setFounders(founders.map(f =>
      f.id === id ? { ...f, name } : f
    ))
  }

  const updateFounderEquity = (id: string, equity: number) => {
    setFounders(founders.map(f =>
      f.id === id ? { ...f, equity } : f
    ))
  }

  const normalizeEquity = (foundersToNormalize?: Founder[]) => {
    const targetFounders = foundersToNormalize || founders
    const equalEquity = 100 / targetFounders.length

    if (foundersToNormalize) {
      setFounders(targetFounders.map(f => ({ ...f, equity: equalEquity })))
    } else {
      setFounders(founders.map(f => ({ ...f, equity: equalEquity })))
    }
  }

  const handleAnswerChange = (questionId: string, founderId: string, checked: boolean) => {
    setAnswers(prev => {
      const current = prev[questionId] || []
      if (checked) {
        return { ...prev, [questionId]: [...current, founderId] }
      } else {
        return { ...prev, [questionId]: current.filter(id => id !== founderId) }
      }
    })
  }

  const calculateSuggestedEquity = () => {
    const scores: Record<string, number> = {}
    founders.forEach(f => scores[f.id] = 0)

    ASSESSMENT_QUESTIONS.forEach(question => {
      const selectedFounders = answers[question.id] || []
      if (selectedFounders.length > 0) {
        const scorePerFounder = question.weight / selectedFounders.length
        selectedFounders.forEach(founderId => {
          scores[founderId] += scorePerFounder
        })
      }
    })

    // Normalize scores to ensure minimum equity of 10%
    const minScore = Math.min(...Object.values(scores))
    const adjustedScores: Record<string, number> = {}
    Object.keys(scores).forEach(id => {
      adjustedScores[id] = scores[id] - minScore + 10
    })

    // Calculate total and convert to percentages
    const total = Object.values(adjustedScores).reduce((sum, score) => sum + score, 0)

    setFounders(founders.map(f => ({
      ...f,
      equity: (adjustedScores[f.id] / total) * 100
    })))
  }

  const totalEquity = founders.reduce((sum, f) => sum + f.equity, 0)

  const chartData = founders.map(f => ({
    name: f.name,
    value: f.equity
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Founder Equity Split Calculator
        </CardTitle>
        <CardDescription>
          Calculate equity distribution based on contributions or set manually
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Mode Toggle */}
          <div className="flex gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={mode === 'manual' ? 'default' : 'ghost'}
              onClick={() => setMode('manual')}
              className="flex-1"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Manual Entry
            </Button>
            <Button
              variant={mode === 'assessment' ? 'default' : 'ghost'}
              onClick={() => setMode('assessment')}
              className="flex-1"
            >
              <Calculator className="h-4 w-4 mr-2" />
              Contribution Assessment
            </Button>
          </div>

          {/* The Team */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">The Team</h3>
              <Button
                onClick={addFounder}
                disabled={founders.length >= 4}
                variant="outline"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Founder
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {founders.map((founder) => (
                <div key={founder.id} className="flex items-center gap-2 p-3 border rounded-lg">
                  <Input
                    value={founder.name}
                    onChange={(e) => updateFounderName(founder.id, e.target.value)}
                    className="flex-1"
                  />
                  {founders.length > 2 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFounder(founder.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {mode === 'manual' ? (
            <>
              {/* Manual Equity Entry */}
              <div className="space-y-4">
                {founders.map((founder) => (
                  <div key={founder.id} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <Label className="font-medium">{founder.name}</Label>
                      <span className="text-sm font-medium">{founder.equity.toFixed(1)}%</span>
                    </div>
                    <Slider
                      value={[founder.equity]}
                      onValueChange={(value) => updateFounderEquity(founder.id, value[0])}
                      max={100}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>

              <Button
                onClick={() => normalizeEquity()}
                variant="outline"
                className="w-full"
              >
                Auto-Normalize to 100%
              </Button>
            </>
          ) : (
            <>
              {/* Contribution Assessment Questions */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">The Questions</h3>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {ASSESSMENT_QUESTIONS.map((question, index) => (
                    <div key={question.id} className="space-y-3 p-4 border rounded-lg">
                      <p className="font-medium text-sm">
                        {index + 1}. {question.text}
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {founders.map((founder) => (
                          <label
                            key={founder.id}
                            className="flex items-center space-x-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={(answers[question.id] || []).includes(founder.id)}
                              onChange={(e) => handleAnswerChange(question.id, founder.id, e.target.checked)}
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm">{founder.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                onClick={calculateSuggestedEquity}
                className="w-full"
              >
                Calculate Suggested Equity
              </Button>
            </>
          )}

          {/* Total Equity Display */}
          <div className={`p-4 rounded-lg text-center ${
            Math.abs(totalEquity - 100) < 0.01 ? 'bg-green-50 dark:bg-green-950/20' : 'bg-yellow-50 dark:bg-yellow-950/20'
          }`}>
            <p className="text-sm text-muted-foreground">Total Equity</p>
            <p className={`text-2xl font-bold ${
              Math.abs(totalEquity - 100) < 0.01 ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'
            }`}>
              {totalEquity.toFixed(1)}%
            </p>
            {Math.abs(totalEquity - 100) >= 0.01 && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                Equity should total 100%
              </p>
            )}
          </div>

          {/* Suggested Equity Display */}
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">{mode === 'assessment' ? 'Suggested' : 'Current'} Equity</h3>
            <div className="space-y-2">
              {founders.map((founder) => (
                <div key={founder.id} className="flex justify-between items-center">
                  <span className="font-medium">{founder.name}</span>
                  <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{founder.equity.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

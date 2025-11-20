'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Save, Eye, Share2, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { debounce } from 'lodash'

const onePagerSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  problemSection: z.string().optional(),
  solutionSection: z.string().optional(),
  productSection: z.string().optional(),
  teamSection: z.string().optional(),
  contactInfo: z.string().optional(),
  isPublic: z.boolean(),
})

type OnePagerFormData = z.infer<typeof onePagerSchema>

interface OnePagerEditorProps {
  startupId: string
  existingData?: any | null
}

export function OnePagerEditor({ startupId, existingData }: OnePagerEditorProps) {
  const [onePagerId, setOnePagerId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const form = useForm<OnePagerFormData>({
    resolver: zodResolver(onePagerSchema),
    defaultValues: {
      companyName: '',
      problemSection: '',
      solutionSection: '',
      productSection: '',
      teamSection: '',
      contactInfo: '',
      isPublic: true,
    },
  })

  // Initialize with existing data
  useEffect(() => {
    if (existingData) {
      setOnePagerId(existingData.id)
      form.reset({
        companyName: existingData.companyName || '',
        problemSection: existingData.problemSection || '',
        solutionSection: existingData.solutionSection || '',
        productSection: existingData.productSection || '',
        teamSection: existingData.teamSection || '',
        contactInfo: existingData.contactInfo || '',
        isPublic: existingData.isPublic ?? true,
      })
      setLoading(false)
    } else {
      fetchOnePager()
    }
  }, [startupId, existingData])

  const fetchOnePager = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/one-pagers?startupId=${startupId}`)
      if (!response.ok) throw new Error('Failed to fetch one-pager')

      const result = await response.json()
      if (result.data) {
        setOnePagerId(result.data.id)
        form.reset({
          companyName: result.data.companyName || '',
          problemSection: result.data.problemSection || '',
          solutionSection: result.data.solutionSection || '',
          productSection: result.data.productSection || '',
          teamSection: result.data.teamSection || '',
          contactInfo: result.data.contactInfo || '',
          isPublic: result.data.isPublic ?? true,
        })
      }
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-save function (debounced)
  const autoSave = useCallback(
    debounce(async (data: OnePagerFormData) => {
      try {
        setSaving(true)

        if (onePagerId) {
          // Update existing
          const response = await fetch('/api/one-pagers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: onePagerId, ...data }),
          })

          if (!response.ok) throw new Error('Failed to update')
        } else {
          // Create new
          const response = await fetch('/api/one-pagers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startupId, ...data }),
          })

          if (!response.ok) throw new Error('Failed to create')

          const result = await response.json()
          setOnePagerId(result.data.id)
        }

        setLastSaved(new Date())
      } catch (error) {
        console.error('Auto-save error:', error)
        toast.error('Failed to save changes')
      } finally {
        setSaving(false)
      }
    }, 1000),
    [onePagerId, startupId]
  )

  // Watch form changes for auto-save
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (!loading && data.companyName) {
        autoSave(data as OnePagerFormData)
      }
    })
    return () => subscription.unsubscribe()
  }, [form.watch, autoSave, loading])

  const getSaveStatus = () => {
    if (saving) return <><Loader2 className="h-3 w-3 animate-spin mr-1" />Saving...</>
    if (lastSaved) return <>Saved {lastSaved.toLocaleTimeString()}</>
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">One-Pager</h1>
          <p className="text-muted-foreground">
            Create a professional one-page overview of your startup
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {getSaveStatus()}
          </Badge>
        </div>
      </div>

      <Form {...form}>
        <Tabs defaultValue="company" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="problem">Problem</TabsTrigger>
            <TabsTrigger value="solution">Solution</TabsTrigger>
            <TabsTrigger value="product">Product</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          {/* Company & Settings */}
          <TabsContent value="company" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                  Basic information about your company
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Inc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Information</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Email, phone, website, social media links..."
                          rows={4}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        How investors can reach you
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Make Public</FormLabel>
                        <FormDescription>
                          Allow anyone with the link to view this one-pager
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Problem Section */}
          <TabsContent value="problem">
            <Card>
              <CardHeader>
                <CardTitle>Problem Statement</CardTitle>
                <CardDescription>
                  What problem are you solving? Why does it matter?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="problemSection"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the problem your startup is addressing..."
                          rows={12}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Clearly articulate the pain point and market need
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Solution Section */}
          <TabsContent value="solution">
            <Card>
              <CardHeader>
                <CardTitle>Solution & Market</CardTitle>
                <CardDescription>
                  How are you solving the problem? What's your unique approach?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="solutionSection"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your solution, value proposition, and target market..."
                          rows={12}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Explain your approach and market opportunity
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Product Section */}
          <TabsContent value="product">
            <Card>
              <CardHeader>
                <CardTitle>Product/Service</CardTitle>
                <CardDescription>
                  What are you building? What's your technology or offering?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="productSection"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your product, technology, features, and competitive advantages..."
                          rows={12}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Detail what makes your product unique
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Section */}
          <TabsContent value="team">
            <Card>
              <CardHeader>
                <CardTitle>Team</CardTitle>
                <CardDescription>
                  Who's behind the company? What's your expertise?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="teamSection"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Introduce your founding team, key members, and relevant experience..."
                          rows={12}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Highlight your team's strengths and backgrounds
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Form>
    </div>
  )
}

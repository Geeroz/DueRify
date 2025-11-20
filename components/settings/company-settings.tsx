'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

const companySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  domain: z.string().optional(),
  industry: z.string().optional(),
  description: z.string().optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanySettingsProps {
  startup: any
  canEdit: boolean
}

export function CompanySettings({ startup, canEdit }: CompanySettingsProps) {
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: startup?.name || '',
      domain: startup?.domain || '',
      industry: startup?.industry || '',
      description: startup?.description || '',
      website: startup?.website || '',
    },
  })

  const onSubmit = async (data: CompanyFormData) => {
    try {
      setSaving(true)
      const response = await fetch(`/api/startups/${startup.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to update company')

      toast.success('Company information updated successfully')
    } catch (error) {
      console.error('Update error:', error)
      toast.error('Failed to update company information')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company Information</CardTitle>
        <CardDescription>
          {canEdit
            ? 'Update your company details and information'
            : 'View your company information (read-only)'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Your Company Name"
              disabled={!canEdit}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              {...register('domain')}
              placeholder="yourcompany.com"
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              {...register('industry')}
              placeholder="e.g., FinTech, HealthTech, AI"
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              {...register('website')}
              placeholder="https://yourcompany.com"
              disabled={!canEdit}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Brief description of your company..."
              rows={4}
              disabled={!canEdit}
            />
          </div>

          {canEdit && (
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}

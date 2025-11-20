'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Eye, Building2 } from 'lucide-react'
import { toast } from 'sonner'

const grantAccessSchema = z.object({
  email: z.string().email('Invalid email address'),
  startupId: z.string().min(1, 'Please select a startup'),
})

type GrantAccessFormData = z.infer<typeof grantAccessSchema>

interface Startup {
  id: string
  name: string
}

interface GrantAccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableStartups: Startup[]
  onSuccess: (grant: any) => void
}

export function GrantAccessModal({
  open,
  onOpenChange,
  availableStartups,
  onSuccess,
}: GrantAccessModalProps) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GrantAccessFormData>({
    resolver: zodResolver(grantAccessSchema),
    defaultValues: {
      startupId: availableStartups.length === 1 ? availableStartups[0].id : '',
    },
  })

  const selectedStartupId = watch('startupId')

  const onSubmit = async (data: GrantAccessFormData) => {
    try {
      setSubmitting(true)

      const response = await fetch('/api/investors/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to grant access')
      }

      const result = await response.json()

      reset()
      onSuccess(result.data)
      onOpenChange(false)
    } catch (error: any) {
      console.error('Grant access error:', error)
      toast.error(error.message || 'Failed to grant access')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Grant Investor Access
          </DialogTitle>
          <DialogDescription>
            Give an investor read-only access to startup data
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Investor Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="investor@example.com"
              {...register('email')}
              disabled={submitting}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              If they don't have an account, they'll be invited to create one
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="startupId">Startup</Label>
            <Select
              value={selectedStartupId}
              onValueChange={(value) => setValue('startupId', value)}
              disabled={submitting || availableStartups.length === 1}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a startup" />
              </SelectTrigger>
              <SelectContent>
                {availableStartups.map((startup) => (
                  <SelectItem key={startup.id} value={startup.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {startup.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.startupId && (
              <p className="text-sm text-destructive">
                {errors.startupId.message}
              </p>
            )}
            {availableStartups.length === 1 && (
              <p className="text-xs text-muted-foreground">
                Granting access to your startup
              </p>
            )}
          </div>

          <div className="rounded-lg bg-muted p-4">
            <h4 className="text-sm font-medium mb-2">Investor Permissions</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>✓ View verified documents and download them</li>
              <li>✓ View one-pager and assessment scores</li>
              <li>✓ Export startup data as PDF</li>
              <li>✗ Cannot upload, edit, or delete anything</li>
              <li>✗ Cannot invite team members or change settings</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset()
                onOpenChange(false)
              }}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Grant Access
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

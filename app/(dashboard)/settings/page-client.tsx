'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { User, Building2, CreditCard, HelpCircle } from 'lucide-react'
import { ProfileSettings } from '@/components/settings/profile-settings'
import { CompanySettings } from '@/components/settings/company-settings'
import { BillingSettings } from '@/components/settings/billing-settings'
import { HelpSupport } from '@/components/settings/help-support'

interface SettingsPageClientProps {
  user: any
  startup: any | null
  userRole: string
}

export function SettingsPageClient({ user, startup, userRole }: SettingsPageClientProps) {
  const [activeTab, setActiveTab] = useState('profile')

  const canEditCompany = userRole === 'INCUBATOR_ADMIN' || userRole === 'STARTUP_ADMIN'

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          {startup && (
            <TabsTrigger value="company" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Company</span>
            </TabsTrigger>
          )}
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="help" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Help</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings user={user} />
        </TabsContent>

        {startup && (
          <TabsContent value="company" className="mt-6">
            <CompanySettings startup={startup} canEdit={canEditCompany} />
          </TabsContent>
        )}

        <TabsContent value="billing" className="mt-6">
          <BillingSettings user={user} />
        </TabsContent>

        <TabsContent value="help" className="mt-6">
          <HelpSupport />
        </TabsContent>
      </Tabs>
    </div>
  )
}

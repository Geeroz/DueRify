'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CreditCard, Download } from 'lucide-react'

interface BillingSettingsProps {
  user: any
}

export function BillingSettings({ user }: BillingSettingsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>Manage your subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">Free Plan</h3>
                <Badge variant="secondary">Current Plan</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Basic features for startups getting started
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">per month</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Plan Features</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Unlimited document uploads
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                One-pager creation
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                IDE readiness assessment
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Team collaboration
              </li>
              <li className="flex items-center gap-2">
                <span className="text-primary">✓</span>
                Investor access portal
              </li>
            </ul>
          </div>

          <Button variant="outline" className="w-full" disabled>
            Upgrade to Pro (Coming Soon)
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-12 border rounded-lg bg-muted/50">
            <div className="text-center space-y-2">
              <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No payment method on file
              </p>
              <p className="text-xs text-muted-foreground">
                Payment methods will be available with paid plans
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View and download past invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-12 border rounded-lg bg-muted/50">
            <div className="text-center space-y-2">
              <Download className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No billing history available
              </p>
              <p className="text-xs text-muted-foreground">
                Invoices will appear here once you upgrade to a paid plan
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

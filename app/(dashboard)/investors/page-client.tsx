'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { GrantAccessModal } from '@/components/investors/grant-access-modal'
import { RevokeAccessDialog } from '@/components/investors/revoke-access-dialog'
import { UserPlus, Search, Eye, Building2, Mail } from 'lucide-react'
import { toast } from 'sonner'

interface InvestorGrant {
  id: string
  startupId: string
  investor: {
    id: string
    name: string | null
    email: string
    createdAt: Date
  }
  startup: {
    id: string
    name: string
  }
  createdAt: Date
}

interface Startup {
  id: string
  name: string
}

interface InvestorsPageClientProps {
  investorGrants: InvestorGrant[]
  availableStartups: Startup[]
  userRole: string
  currentUserId: string
}

export function InvestorsPageClient({
  investorGrants: initialGrants,
  availableStartups,
  userRole,
  currentUserId,
}: InvestorsPageClientProps) {
  const [investorGrants, setInvestorGrants] = useState(initialGrants)
  const [searchQuery, setSearchQuery] = useState('')
  const [grantModalOpen, setGrantModalOpen] = useState(false)

  // Filter grants
  const filteredGrants = investorGrants.filter((grant) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      grant.investor.name?.toLowerCase().includes(searchLower) ||
      grant.investor.email.toLowerCase().includes(searchLower) ||
      grant.startup.name.toLowerCase().includes(searchLower)
    )
  })

  // Group by investor
  const investorMap = new Map<string, InvestorGrant[]>()
  filteredGrants.forEach((grant) => {
    const email = grant.investor.email
    if (!investorMap.has(email)) {
      investorMap.set(email, [])
    }
    investorMap.get(email)!.push(grant)
  })

  const handleGrantSuccess = (newGrant: InvestorGrant) => {
    setInvestorGrants([newGrant, ...investorGrants])
    setGrantModalOpen(false)
    toast.success('Investor access granted successfully')
  }

  const handleRevokeAccess = async (grantId: string) => {
    try {
      const response = await fetch(`/api/investors/grant/${grantId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to revoke access')
      }

      // Update local state
      setInvestorGrants(investorGrants.filter((grant) => grant.id !== grantId))

      toast.success('Investor access revoked')
    } catch (error: any) {
      console.error('Revoke access error:', error)
      toast.error(error.message || 'Failed to revoke access')
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Investor Access Management
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Grant and manage investor access to startup data
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {investorMap.size} {investorMap.size === 1 ? 'Investor' : 'Investors'}
          </Badge>
          <Badge variant="outline" className="text-sm">
            {investorGrants.length} {investorGrants.length === 1 ? 'Grant' : 'Grants'}
          </Badge>
        </div>

        <Button onClick={() => setGrantModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Grant Access
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by investor name, email, or startup..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Investor List */}
      {investorMap.size === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Eye className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              {searchQuery
                ? 'No investors found matching your search'
                : 'No investors have been granted access yet'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setGrantModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Grant Access to First Investor
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Array.from(investorMap.entries()).map(([email, grants]) => {
            const investor = grants[0].investor

            return (
              <Card key={email}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Eye className="h-5 w-5 text-primary" />
                        {investor.name || 'No name set'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Mail className="h-3 w-3" />
                        {investor.email}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground">
                        First granted {formatDate(investor.createdAt)}
                      </p>
                    </div>
                    <Badge className="bg-blue-600">Investor</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        Access to {grants.length}{' '}
                        {grants.length === 1 ? 'startup' : 'startups'}:
                      </span>
                    </div>

                    <div className="space-y-2">
                      {grants.map((grant) => (
                        <div
                          key={grant.id}
                          className="flex items-center justify-between p-3 rounded-lg border bg-card"
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium">{grant.startup.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Granted {formatDate(grant.createdAt)}
                              </p>
                            </div>
                          </div>

                          <RevokeAccessDialog
                            investorName={investor.name || investor.email}
                            startupName={grant.startup.name}
                            onConfirm={() => handleRevokeAccess(grant.id)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Grant Access Modal */}
      <GrantAccessModal
        open={grantModalOpen}
        onOpenChange={setGrantModalOpen}
        availableStartups={availableStartups}
        onSuccess={handleGrantSuccess}
      />
    </div>
  )
}

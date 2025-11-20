'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { InviteMemberModal } from '@/components/team/invite-member-modal'
import { ChangeRoleDropdown } from '@/components/team/change-role-dropdown'
import { RemoveMemberDialog } from '@/components/team/remove-member-dialog'
import { UserPlus, Search, Mail, User, Clock, Shield } from 'lucide-react'
import { toast } from 'sonner'

interface TeamMember {
  id: string
  role: string
  user: {
    id: string
    name: string | null
    email: string
    createdAt: Date
    updatedAt: Date
  }
  createdAt: Date
}

interface PendingInvitation {
  id: string
  email: string
  role: string
  expires: Date
  createdAt: Date
}

interface TeamPageClientProps {
  teamMembers: TeamMember[]
  pendingInvitations: PendingInvitation[]
  currentUserId: string
  userRole: string
  startupId: string
  startupName: string
}

export function TeamPageClient({
  teamMembers: initialTeamMembers,
  pendingInvitations: initialInvitations,
  currentUserId,
  userRole,
  startupId,
  startupName,
}: TeamPageClientProps) {
  const [teamMembers, setTeamMembers] = useState(initialTeamMembers)
  const [pendingInvitations, setPendingInvitations] = useState(initialInvitations)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string | null>(null)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)

  // Filter team members
  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch =
      member.user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter ? member.role === roleFilter : true
    return matchesSearch && matchesRole
  })

  const handleInviteSuccess = (invitation: PendingInvitation) => {
    setPendingInvitations([invitation, ...pendingInvitations])
    setInviteModalOpen(false)
    toast.success('Invitation sent successfully')
  }

  const handleRoleChange = async (memberId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      // Update local state
      setTeamMembers(
        teamMembers.map((member) =>
          member.id === memberId ? { ...member, role: newRole } : member
        )
      )

      toast.success('Role updated successfully')
    } catch (error: any) {
      console.error('Role change error:', error)
      toast.error(error.message || 'Failed to update role')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove member')
      }

      // Update local state
      setTeamMembers(teamMembers.filter((member) => member.id !== memberId))

      toast.success('Team member removed successfully')
    } catch (error: any) {
      console.error('Remove member error:', error)
      toast.error(error.message || 'Failed to remove member')
    }
  }

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/users/invite/${invitationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel invitation')
      }

      // Update local state
      setPendingInvitations(
        pendingInvitations.filter((inv) => inv.id !== invitationId)
      )

      toast.success('Invitation cancelled')
    } catch (error: any) {
      console.error('Cancel invitation error:', error)
      toast.error(error.message || 'Failed to cancel invitation')
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'STARTUP_ADMIN':
        return <Badge className="bg-purple-600">Admin</Badge>
      case 'STARTUP_USER':
        return <Badge variant="secondary">Member</Badge>
      case 'INCUBATOR_ADMIN':
        return <Badge className="bg-blue-600">Incubator Admin</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return formatDate(date)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Team Management
        </h1>
        <p className="mt-2 text-sm md:text-base text-muted-foreground">
          Manage team members for {startupName}
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={roleFilter === null ? 'default' : 'outline'}
            onClick={() => setRoleFilter(null)}
            size="sm"
          >
            All ({teamMembers.length})
          </Button>
          <Button
            variant={roleFilter === 'STARTUP_ADMIN' ? 'default' : 'outline'}
            onClick={() => setRoleFilter('STARTUP_ADMIN')}
            size="sm"
          >
            Admins ({teamMembers.filter((m) => m.role === 'STARTUP_ADMIN').length})
          </Button>
          <Button
            variant={roleFilter === 'STARTUP_USER' ? 'default' : 'outline'}
            onClick={() => setRoleFilter('STARTUP_USER')}
            size="sm"
          >
            Members ({teamMembers.filter((m) => m.role === 'STARTUP_USER').length})
          </Button>
        </div>

        <Button onClick={() => setInviteModalOpen(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Pending Invitations */}
      {pendingInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Pending Invitations ({pendingInvitations.length})
            </CardTitle>
            <CardDescription>
              Email invitations that haven't been accepted yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <p className="text-xs text-muted-foreground">
                        Invited {formatDate(invitation.createdAt)} • Expires{' '}
                        {formatDate(invitation.expires)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(invitation.role)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Members List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Team Members ({filteredMembers.length})
          </CardTitle>
          <CardDescription>
            Active members with access to {startupName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredMembers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                No team members found matching your search
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMembers.map((member) => {
                const isCurrentUser = member.user.id === currentUserId

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {member.user.name || 'No name set'}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Joined {formatDate(member.createdAt)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            Last active {getTimeAgo(member.user.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCurrentUser ? (
                        getRoleBadge(member.role)
                      ) : (
                        <ChangeRoleDropdown
                          currentRole={member.role}
                          onRoleChange={(newRole) =>
                            handleRoleChange(member.id, newRole)
                          }
                        />
                      )}

                      {!isCurrentUser && (
                        <RemoveMemberDialog
                          memberName={member.user.name || member.user.email}
                          onConfirm={() => handleRemoveMember(member.id)}
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite Modal */}
      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
        startupId={startupId}
        onSuccess={handleInviteSuccess}
      />
    </div>
  )
}

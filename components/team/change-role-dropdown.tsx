'use client'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, Shield, User } from 'lucide-react'

interface ChangeRoleDropdownProps {
  currentRole: string
  onRoleChange: (newRole: string) => void
}

export function ChangeRoleDropdown({
  currentRole,
  onRoleChange,
}: ChangeRoleDropdownProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'STARTUP_ADMIN':
        return (
          <Badge className="bg-purple-600">
            <Shield className="h-3 w-3 mr-1" />
            Admin
          </Badge>
        )
      case 'STARTUP_USER':
        return (
          <Badge variant="secondary">
            <User className="h-3 w-3 mr-1" />
            Member
          </Badge>
        )
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8">
          {getRoleBadge(currentRole)}
          <ChevronDown className="h-3 w-3 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Change Role</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => onRoleChange('STARTUP_ADMIN')}
          disabled={currentRole === 'STARTUP_ADMIN'}
        >
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Admin</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              Full access to manage team and settings
            </span>
          </div>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => onRoleChange('STARTUP_USER')}
          disabled={currentRole === 'STARTUP_USER'}
        >
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Member</span>
            </div>
            <span className="text-xs text-muted-foreground mt-1">
              Can upload documents and take assessments
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

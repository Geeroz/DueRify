'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'

interface MobileSidebarProps {
  isIncubatorAdmin: boolean
}

export function MobileSidebar({ isIncubatorAdmin }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', show: true },
    { href: '/portfolio', label: 'Portfolio', show: isIncubatorAdmin },
    { href: '/documents', label: 'Documents', show: true },
    { href: '/one-pager', label: 'One-Pager', show: true },
    { href: '/landing-page', label: 'Landing Page', show: true },
    { href: '/media', label: 'Media', show: true },
    { href: '/assessment', label: 'Assessment', show: true },
    { href: '/settings', label: 'Settings', show: true },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0">
        <SheetHeader className="border-b border-zinc-200 dark:border-zinc-800 p-6">
          <SheetTitle>
            <Link href="/dashboard" onClick={() => setOpen(false)}>
              DueRify
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="space-y-1 p-4">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              >
                {item.label}
              </Link>
            ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}

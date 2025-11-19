'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/duerify-logo-transparent.png"
              alt="DueRify"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link href="/calculator" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="hidden md:inline">Calculator</span>
              </Link>
            </Button>

            <ThemeToggle />

            <Button variant="default" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

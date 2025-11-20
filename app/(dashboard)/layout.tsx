import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileSidebar } from '@/components/layout/mobile-sidebar'
import prisma from '@/lib/prisma'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  // Get user role for conditional navigation
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  })

  const isIncubatorAdmin = user?.role === 'INCUBATOR_ADMIN'

  return (
    <div className="flex min-h-screen">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden md:flex w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex-col">
        <div className="flex h-16 items-center border-b border-zinc-200 dark:border-zinc-800 px-6">
          <Link href="/dashboard" className="text-xl font-bold">
            DueRify
          </Link>
        </div>

        <nav className="space-y-1 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Dashboard
          </Link>
          {isIncubatorAdmin && (
            <Link
              href="/portfolio"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Portfolio
            </Link>
          )}
          <Link
            href="/documents"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Documents
          </Link>
          <Link
            href="/one-pager"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            One-Pager
          </Link>
          <Link
            href="/assessment"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Assessment
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 md:px-6">
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <MobileSidebar isIncubatorAdmin={isIncubatorAdmin} />

            {/* Logo on mobile, welcome message on desktop */}
            <div className="flex items-center gap-2">
              <Link href="/dashboard" className="text-xl font-bold md:hidden">
                DueRify
              </Link>
              <h2 className="hidden md:block text-sm text-zinc-600 dark:text-zinc-400">
                Welcome back, {session.user.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <span className="hidden sm:inline text-sm text-zinc-600 dark:text-zinc-400 truncate max-w-[150px] md:max-w-none">
              {session.user.email}
            </span>
            <form action="/api/auth/signout" method="POST">
              <Button type="submit" variant="outline" size="sm">
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Out</span>
              </Button>
            </form>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

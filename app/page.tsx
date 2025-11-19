import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <main className="container mx-auto px-4 py-16 text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-6xl">
              DueRify
            </h1>
            <p className="text-xl text-zinc-600 dark:text-zinc-400">
              Startup Portfolio Management Platform
            </p>
          </div>

          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-zinc-700 dark:text-zinc-300">
            A comprehensive portfolio management platform built for startup incubators.
            Track progress, manage documents, assess readiness, and present a unified view to investors.
          </p>

          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Document Management
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Secure document storage with verification status tracking
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Readiness Assessment
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                IDE methodology (TRL, MRL, CRL, BRL) tracking
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
              <h3 className="mb-2 font-semibold text-zinc-900 dark:text-zinc-50">
                Portfolio Dashboard
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Track all startups and share with investors
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">DueRify</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Startup Portfolio Management Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}

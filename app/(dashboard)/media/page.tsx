import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { MediaPageClient } from './page-client'

export default async function MediaPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return <MediaPageClient />
}

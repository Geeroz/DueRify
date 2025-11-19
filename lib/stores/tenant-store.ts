import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Client-side tenant context store
 *
 * This store manages the current startup context on the client side.
 * It persists the user's last selected startup across sessions.
 */

interface Startup {
  id: string
  name: string
  logoUrl: string | null
  industry: string | null
}

interface TenantState {
  currentStartupId: string | null
  startups: Startup[]

  // Actions
  setCurrentStartup: (startupId: string) => void
  setStartups: (startups: Startup[]) => void
  clearTenant: () => void
}

export const useTenantStore = create<TenantState>()(
  persist(
    (set) => ({
      currentStartupId: null,
      startups: [],

      setCurrentStartup: (startupId) => {
        set({ currentStartupId: startupId })
      },

      setStartups: (startups) => {
        set({
          startups,
          // Auto-select first startup if none selected
          currentStartupId: startups.length > 0 ? startups[0].id : null
        })
      },

      clearTenant: () => {
        set({
          currentStartupId: null,
          startups: []
        })
      },
    }),
    {
      name: 'tenant-storage',
    }
  )
)

/**
 * Get current startup from store
 */
export function getCurrentStartupFromStore(): Startup | null {
  const { currentStartupId, startups } = useTenantStore.getState()
  return startups.find(s => s.id === currentStartupId) || null
}

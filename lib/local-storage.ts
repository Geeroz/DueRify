/**
 * Local Storage Utility Functions
 * Provides type-safe helpers for saving and loading data from localStorage
 */

export function saveToLocalStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return

  try {
    const serialized = JSON.stringify(data)
    window.localStorage.setItem(key, serialized)
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded')
    } else {
      console.error('Error saving to localStorage:', error)
    }
  }
}

export function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue

  try {
    const item = window.localStorage.getItem(key)
    if (item === null) {
      return defaultValue
    }
    return JSON.parse(item) as T
  } catch (error) {
    console.error('Error loading from localStorage:', error)
    return defaultValue
  }
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  oxygenLevel: number
}

interface AuthStore {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  logout: () => void
  updateOxygen: (level: number) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      updateOxygen: (level) =>
        set((s) => ({ user: s.user ? { ...s.user, oxygenLevel: level } : null })),
    }),
    { name: 'wg-auth' },
  ),
)

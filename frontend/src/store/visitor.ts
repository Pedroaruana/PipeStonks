import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface VisitorTask {
  id: string
  title: string
  description?: string
  stage: 'SEED' | 'SPROUT' | 'SAPLING' | 'TREE' | 'FRUIT'
  progress: number
  createdAt: string
  completedAt?: string
  lastWateredAt?: string | null
  diedAt?: string
}

const HOURS_24 = 24 * 60 * 60 * 1000
const DEATH_PENALTY = 10

export function isVisitorTaskDead(t: VisitorTask): boolean {
  if (t.diedAt || t.completedAt) return false
  const ref = t.lastWateredAt ?? t.createdAt
  return Date.now() - new Date(ref).getTime() > HOURS_24
}

function progressToStage(p: number): VisitorTask['stage'] {
  if (p >= 100) return 'FRUIT'
  if (p >= 75) return 'TREE'
  if (p >= 50) return 'SAPLING'
  if (p >= 20) return 'SPROUT'
  return 'SEED'
}

interface VisitorStore {
  tasks: VisitorTask[]
  oxygenLevel: number
  addTask: (title: string, description: string) => void
  waterTask: (id: string) => void
  harvestTask: (id: string) => void
  pruneTask: (id: string) => void
  purgeDead: () => number
}

export const useVisitorStore = create<VisitorStore>()(
  persist(
    (set) => ({
      tasks: [],
      oxygenLevel: 0,

      addTask: (title, description) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: crypto.randomUUID(),
              title,
              description,
              stage: 'SEED',
              progress: 0,
              createdAt: new Date().toISOString(),
            },
          ],
        })),

      waterTask: (id) =>
        set((s) => {
          const tasks = s.tasks.map((t) => {
            if (t.id !== id) return t
            const progress = Math.min(100, t.progress + 20)
            return { ...t, progress, stage: progressToStage(progress), lastWateredAt: new Date().toISOString() }
          })
          const gained = tasks.find((t) => t.id === id)?.stage !== s.tasks.find((t) => t.id === id)?.stage ? 3 : 0
          return { tasks, oxygenLevel: s.oxygenLevel + gained }
        }),

      harvestTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, stage: 'FRUIT', progress: 100, completedAt: new Date().toISOString() } : t
          ),
          oxygenLevel: s.oxygenLevel + 20,
        })),

      pruneTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      purgeDead: () => {
        let killed = 0
        set((s) => {
          const now = new Date().toISOString()
          const tasks = s.tasks.map((t) => {
            if (isVisitorTaskDead(t)) {
              killed++
              return { ...t, diedAt: now }
            }
            return t
          })
          return {
            tasks,
            oxygenLevel: Math.max(0, s.oxygenLevel - killed * DEATH_PENALTY),
          }
        })
        return killed
      },
    }),
    { name: 'wg-visitor' },
  ),
)

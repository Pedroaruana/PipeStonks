import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface VisitorTask {
  id: string
  title: string
  description?: string
  stage: 'SEED' | 'SPROUT' | 'SAPLING' | 'TREE' | 'FRUIT'
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  progress: number
  createdAt: string
  completedAt?: string
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
  addTask: (title: string, description: string, difficulty: VisitorTask['difficulty']) => void
  waterTask: (id: string) => void
  harvestTask: (id: string) => void
  pruneTask: (id: string) => void
}

export const useVisitorStore = create<VisitorStore>()(
  persist(
    (set) => ({
      tasks: [],
      oxygenLevel: 0,

      addTask: (title, description, difficulty) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            {
              id: crypto.randomUUID(),
              title,
              description,
              difficulty,
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
            return { ...t, progress, stage: progressToStage(progress) }
          })
          const gained = tasks.find((t) => t.id === id)?.stage !== s.tasks.find((t) => t.id === id)?.stage ? 3 : 0
          return { tasks, oxygenLevel: s.oxygenLevel + gained }
        }),

      harvestTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, stage: 'FRUIT', progress: 100, completedAt: new Date().toISOString() } : t
          ),
          oxygenLevel: s.oxygenLevel + 15,
        })),

      pruneTask: (id) =>
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),
    }),
    { name: 'wg-visitor' },
  ),
)

import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  categoryId: z.string().cuid().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>

const HOURS_12 = 12 * 60 * 60 * 1000
const HOURS_24 = 24 * 60 * 60 * 1000

export const DEATH_OXYGEN_PENALTY = 10

export function canWater(lastWateredAt: Date | null): boolean {
  if (!lastWateredAt) return true
  return Date.now() - lastWateredAt.getTime() >= HOURS_12
}

export function isDead(lastWateredAt: Date | null, plantedAt: Date): boolean {
  const reference = lastWateredAt ?? plantedAt
  return Date.now() - reference.getTime() > HOURS_24
}

export function daysToStage(plantedAt: Date): 'SEED' | 'SPROUT' | 'SAPLING' | 'TREE' | 'FRUIT' {
  const days = (Date.now() - plantedAt.getTime()) / (1000 * 60 * 60 * 24)
  if (days >= 7) return 'FRUIT'
  if (days >= 5) return 'TREE'
  if (days >= 3) return 'SAPLING'
  if (days >= 1) return 'SPROUT'
  return 'SEED'
}

export const OXYGEN_BY_STAGE: Record<string, number> = {
  SEED: 1,
  SPROUT: 3,
  SAPLING: 6,
  TREE: 10,
  FRUIT: 15,
}

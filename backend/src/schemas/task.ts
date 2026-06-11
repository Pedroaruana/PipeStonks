import { z } from 'zod'

export const createTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  dueDate: z.string().datetime().optional(),
  categoryId: z.string().cuid().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  dueDate: z.string().datetime().optional(),
  categoryId: z.string().cuid().optional(),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

export const STAGE_THRESHOLDS = {
  SEED: 0,
  SPROUT: 20,
  SAPLING: 50,
  TREE: 75,
  FRUIT: 100,
} as const

export function progressToStage(progress: number): 'SEED' | 'SPROUT' | 'SAPLING' | 'TREE' | 'FRUIT' {
  if (progress >= 100) return 'FRUIT'
  if (progress >= 75) return 'TREE'
  if (progress >= 50) return 'SAPLING'
  if (progress >= 20) return 'SPROUT'
  return 'SEED'
}

export const OXYGEN_BY_STAGE: Record<string, number> = {
  SEED: 1,
  SPROUT: 3,
  SAPLING: 6,
  TREE: 10,
  FRUIT: 15,
}

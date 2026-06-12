import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/authenticate.js'
import { createTaskSchema, updateTaskSchema, progressToStage, OXYGEN_BY_STAGE } from '../schemas/task.js'

const prisma = new PrismaClient()

export async function taskRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.get('/', async (request) => {
    const userId = (request.user as { sub: string }).sub
    return prisma.task.findMany({
      where: { userId, completedAt: null },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
  })

  app.post('/', async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const result = createTaskSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: result.error.flatten() })
    }

    const task = await prisma.task.create({
      data: { ...result.data, userId, dueDate: result.data.dueDate ? new Date(result.data.dueDate) : undefined },
      include: { category: true },
    })

    await prisma.history.create({ data: { action: 'PLANTED', taskId: task.id, userId } })

    return reply.status(201).send(task)
  })

  app.patch('/:id/water', async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const { id } = request.params as { id: string }
    const result = updateTaskSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: result.error.flatten() })
    }

    const task = await prisma.task.findFirst({ where: { id, userId } })
    if (!task) return reply.status(404).send({ error: 'Tarefa não encontrada' })

    const newProgress = Math.min(100, result.data.progress ?? task.progress)
    const newStage = progressToStage(newProgress)

    const updated = await prisma.task.update({
      where: { id },
      data: { ...result.data, progress: newProgress, stage: newStage },
      include: { category: true },
    })

    await prisma.history.create({ data: { action: 'WATERED', taskId: id, userId } })

    if (newStage !== task.stage) {
      const oxygenGain = OXYGEN_BY_STAGE[newStage] - OXYGEN_BY_STAGE[task.stage]
      await prisma.user.update({ where: { id: userId }, data: { oxygenLevel: { increment: oxygenGain } } })
    }

    return updated
  })

  app.patch('/:id/harvest', async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const { id } = request.params as { id: string }

    const task = await prisma.task.findFirst({ where: { id, userId } })
    if (!task) return reply.status(404).send({ error: 'Tarefa não encontrada' })

    const harvested = await prisma.task.update({
      where: { id },
      data: { completedAt: new Date(), stage: 'FRUIT', progress: 100 },
    })

    await prisma.history.create({ data: { action: 'HARVESTED', taskId: id, userId } })
    await prisma.user.update({ where: { id: userId }, data: { oxygenLevel: { increment: 15 } } })

    return harvested
  })

  app.delete('/:id', async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const { id } = request.params as { id: string }

    const task = await prisma.task.findFirst({ where: { id, userId } })
    if (!task) return reply.status(404).send({ error: 'Tarefa não encontrada' })

    await prisma.history.create({ data: { action: 'PRUNED', taskId: id, userId } })
    await prisma.task.delete({ where: { id } })

    return reply.status(204).send()
  })
}

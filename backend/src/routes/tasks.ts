import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/authenticate.js'
import { createTaskSchema, canWater, daysToStage, OXYGEN_BY_STAGE } from '../schemas/task.js'

const prisma = new PrismaClient()

export async function taskRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.get('/', async (request) => {
    const userId = (request.user as { sub: string }).sub
    const tasks = await prisma.task.findMany({
      where: { userId, completedAt: null },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })
    return tasks.map((t) => ({ ...t, stage: daysToStage(t.plantedAt) }))
  })

  app.post('/', async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const result = createTaskSchema.safeParse(request.body)
    if (!result.success) {
      return reply.status(400).send({ error: result.error.flatten() })
    }

    const task = await prisma.task.create({
      data: { ...result.data, userId },
      include: { category: true },
    })

    await prisma.history.create({ data: { action: 'PLANTED', taskId: task.id, userId } })
    return reply.status(201).send({ ...task, stage: daysToStage(task.plantedAt) })
  })

  app.patch('/:id/water', async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const { id } = request.params as { id: string }

    const task = await prisma.task.findFirst({ where: { id, userId } })
    if (!task) return reply.status(404).send({ error: 'Tarefa não encontrada' })

    if (!canWater(task.lastWateredAt)) {
      const nextWater = new Date(task.lastWateredAt!.getTime() + 12 * 60 * 60 * 1000)
      return reply.status(429).send({ error: 'Aguarde 12 horas para regar novamente', nextWaterAt: nextWater })
    }

    const updated = await prisma.task.update({
      where: { id },
      data: { lastWateredAt: new Date() },
      include: { category: true },
    })

    await prisma.history.create({ data: { action: 'WATERED', taskId: id, userId } })

    const stage = daysToStage(updated.plantedAt)
    const prevStage = daysToStage(task.plantedAt)
    if (stage !== prevStage) {
      const gain = OXYGEN_BY_STAGE[stage] - OXYGEN_BY_STAGE[prevStage]
      if (gain > 0) await prisma.user.update({ where: { id: userId }, data: { oxygenLevel: { increment: gain } } })
    }

    return { ...updated, stage }
  })

  app.patch('/:id/harvest', async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const { id } = request.params as { id: string }

    const task = await prisma.task.findFirst({ where: { id, userId } })
    if (!task) return reply.status(404).send({ error: 'Tarefa não encontrada' })

    const harvested = await prisma.task.update({
      where: { id },
      data: { completedAt: new Date(), stage: 'FRUIT' },
    })

    await prisma.history.create({ data: { action: 'HARVESTED', taskId: id, userId } })
    await prisma.user.update({ where: { id: userId }, data: { oxygenLevel: { increment: 20 } } })

    return { ...harvested, stage: 'FRUIT' }
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

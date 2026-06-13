import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/authenticate.js'

const prisma = new PrismaClient()

export async function historyRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.get('/', async (request) => {
    const userId = (request.user as { sub: string }).sub
    return prisma.history.findMany({
      where: { userId },
      include: { task: { select: { title: true, stage: true } } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  })

  app.get('/harvested', async (request) => {
    const userId = (request.user as { sub: string }).sub
    return prisma.task.findMany({
      where: { userId, completedAt: { not: null } },
      include: { category: true },
      orderBy: { completedAt: 'desc' },
    })
  })
}

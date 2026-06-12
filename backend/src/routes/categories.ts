import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { authenticate } from '../middleware/authenticate.js'

const prisma = new PrismaClient()

const categorySchema = z.object({
  name: z.string().min(1).max(30),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#86efac'),
})

export async function categoryRoutes(app: FastifyInstance) {
  app.addHook('onRequest', authenticate)

  app.get('/', async (request) => {
    const userId = (request.user as { sub: string }).sub
    return prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } })
  })

  app.post('/', async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const result = categorySchema.safeParse(request.body)
    if (!result.success) return reply.status(400).send({ error: result.error.flatten() })

    const category = await prisma.category.create({ data: { ...result.data, userId } })
    return reply.status(201).send(category)
  })

  app.delete('/:id', async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const { id } = request.params as { id: string }

    const category = await prisma.category.findFirst({ where: { id, userId } })
    if (!category) return reply.status(404).send({ error: 'Categoria não encontrada' })

    await prisma.category.delete({ where: { id } })
    return reply.status(204).send()
  })
}

import type { FastifyInstance } from 'fastify'
import { PrismaClient } from '@prisma/client'
import { google } from 'googleapis'
import { authenticate } from '../middleware/authenticate.js'

const prisma = new PrismaClient()

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  )
}

export async function googleRoutes(app: FastifyInstance) {
  app.get('/auth/google', async (request, reply) => {
    const oauth2Client = getOAuthClient()
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/tasks.readonly'],
      state: (request.query as { token?: string }).token ?? '',
    })
    return reply.redirect(url)
  })

  app.get('/auth/google/callback', async (request, reply) => {
    const { code, state } = request.query as { code: string; state: string }
    const oauth2Client = getOAuthClient()

    const { tokens } = await oauth2Client.getToken(code)

    if (state) {
      try {
        const payload = app.jwt.verify<{ sub: string }>(state)
        await prisma.user.update({
          where: { id: payload.sub },
          data: {
            googleAccessToken: tokens.access_token,
            googleRefreshToken: tokens.refresh_token ?? undefined,
          },
        })
      } catch {}
    }

    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:5173'
    return reply.redirect(`${frontendUrl}/garden?google=connected`)
  })

  app.get('/google-tasks', { onRequest: [authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const user = await prisma.user.findUnique({ where: { id: userId } })

    if (!user?.googleAccessToken) {
      return reply.status(401).send({ error: 'Google não conectado' })
    }

    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken ?? undefined,
    })

    const tasks = google.tasks({ version: 'v1', auth: oauth2Client })

    const lists = await tasks.tasklists.list({ maxResults: 10 })
    const listId = lists.data.items?.[0]?.id ?? '@default'

    const result = await tasks.tasks.list({
      tasklist: listId,
      showCompleted: false,
      maxResults: 20,
    })

    return (result.data.items ?? []).map((t) => ({
      id: t.id,
      title: t.title,
      notes: t.notes,
    }))
  })

  app.post('/google-tasks/import', { onRequest: [authenticate] }, async (request, reply) => {
    const userId = (request.user as { sub: string }).sub
    const { taskIds } = request.body as { taskIds: string[] }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user?.googleAccessToken) {
      return reply.status(401).send({ error: 'Google não conectado' })
    }

    const oauth2Client = getOAuthClient()
    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken ?? undefined,
    })

    const tasks = google.tasks({ version: 'v1', auth: oauth2Client })
    const lists = await tasks.tasklists.list({ maxResults: 1 })
    const listId = lists.data.items?.[0]?.id ?? '@default'

    const imported = []
    for (const gTaskId of taskIds) {
      const existing = await prisma.task.findFirst({ where: { userId, googleTaskId: gTaskId } })
      if (existing) continue

      const gTask = await tasks.tasks.get({ tasklist: listId, task: gTaskId })
      const task = await prisma.task.create({
        data: {
          title: gTask.data.title ?? 'Tarefa Google',
          description: gTask.data.notes ?? undefined,
          userId,
          googleTaskId: gTaskId,
        },
      })
      await prisma.history.create({ data: { action: 'PLANTED', taskId: task.id, userId } })
      imported.push(task)
    }

    return reply.status(201).send(imported)
  })
}

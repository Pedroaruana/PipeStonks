import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import { authRoutes } from './routes/auth.js'
import { taskRoutes } from './routes/tasks.js'
import { categoryRoutes } from './routes/categories.js'
import { historyRoutes } from './routes/history.js'

const app = Fastify({ logger: true })

await app.register(cors, {
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
})

await app.register(jwt, {
  secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
})

app.register(authRoutes, { prefix: '/auth' })
app.register(taskRoutes, { prefix: '/tasks' })
app.register(categoryRoutes, { prefix: '/categories' })
app.register(historyRoutes, { prefix: '/history' })

app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }))

const port = Number(process.env.PORT) || 3333
await app.listen({ port, host: '0.0.0.0' })

import fastify from 'fastify'
import { TasksRoutes } from './modules/tasks/tasks.routes'
import { errorHandling } from './middlewares/error-handling'

export const app = fastify()

app.register(TasksRoutes)

errorHandling(app)

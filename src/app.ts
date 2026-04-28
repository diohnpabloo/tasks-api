import fastify from 'fastify'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import { TasksRoutes } from './modules/tasks/tasks.routes'
import { errorHandling } from './middlewares/error-handling'

export const app = fastify({
    ajv: {
        customOptions: {
            strict: 'log',
            keywords: ['example'],
        },
    },
})

app.addSchema({
    $id: 'taskSchema',
    type: 'object',
    properties: {
        id: { type: 'string', format: 'uuid' },
        title: { type: 'string' },
        description: { type: 'string' },
        completed_at: { type: 'string', format: 'date-time', nullable: true },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' },
    },
})

app.addSchema({
    $id: 'errorMessageSchema',
    type: 'object',
    properties: {
        message: { type: 'string' },
    },
})

app.addSchema({
    $id: 'validationErrorSchema',
    type: 'object',
    properties: {
        errors: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    path: { type: 'array', items: { type: 'string' } },
                },
            },
        },
    },
})

if (process.env.NODE_ENV !== 'production') {
    await app.register(fastifySwagger, {
        openapi: {
            openapi: '3.0.0',
            info: {
                title: 'Tasks API',
                description:
                    'API RESTful para gerenciamento de tarefas. Permite criar, listar, atualizar, concluir e deletar tarefas.',
                version: '1.0.0',
            },
            tags: [{ name: 'Tasks', description: 'Operações relacionadas às tarefas' }],
        },
    })

    await app.register(fastifySwaggerUi, {
        routePrefix: '/docs',
        uiConfig: {
            docExpansion: 'list',
            deepLinking: true,
            defaultModelsExpandDepth: 2,
        },
        staticCSP: true,
    })
}

app.register(TasksRoutes)

errorHandling(app)
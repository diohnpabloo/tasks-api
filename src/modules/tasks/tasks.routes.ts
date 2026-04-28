import { FastifyInstance } from 'fastify'
import {
    createTaskSchema,
    listTasksQuerySchema,
    taskIdParamsSchema,
    updateTaskSchema,
} from './tasks.schema'
import {
    CompleteTaskUseCase,
    CreateTaskUseCase,
    DeleteTaskUseCase,
    ListTasksUseCase,
    UpdateTaskUseCase,
} from './tasks.service'
import { PrismaTasksRepository } from '@/repositories/tasks-repositories/prisma-tasks-repository'
import { AppError } from '@/utils/AppError'

type UpdateTaskRouteParams = {
    id: string
}

// $ref no formato do Fastify — resolve em runtime e no Swagger
const TaskRef = { $ref: 'taskSchema#' }
const ErrorRef = { $ref: 'errorMessageSchema#' }
const ValidationErrorRef = { $ref: 'validationErrorSchema#' }

const uuidParam = {
    type: 'object',
    required: ['id'],
    properties: {
        id: {
            type: 'string',
            format: 'uuid',
            description: 'ID único da tarefa',
        },
    },
} as const

export function TasksRoutes(app: FastifyInstance) {
    app.post('/tasks', {
        schema: {
            tags: ['Tasks'],
            summary: 'Criar uma nova tarefa',
            description: 'Cria uma nova tarefa com título e descrição obrigatórios.',
            body: {
                type: 'object',
                required: ['title', 'description'],
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1,
                        description: 'Título da tarefa',
                    },
                    description: {
                        type: 'string',
                        minLength: 1,
                        description: 'Descrição detalhada da tarefa',
                    },
                },
            },
            response: {
                201: { description: 'Tarefa criada com sucesso', ...TaskRef },
                400: { description: 'Dados inválidos', ...ErrorRef },
            },
        },
    }, async (request, reply) => {
        const taskParsed = createTaskSchema.parse(request.body)

        if (!taskParsed.title || !taskParsed.description) {
            throw new AppError('Title e description são obrigatórios', 400)
        }

        const prismaTasksRepository = new PrismaTasksRepository()
        const createTask = new CreateTaskUseCase(prismaTasksRepository)
        const { createdTask } = await createTask.execute(taskParsed)

        return reply.status(201).send(createdTask)
    })

    app.get('/tasks', {
        schema: {
            tags: ['Tasks'],
            summary: 'Listar tarefas',
            description:
                'Retorna todas as tarefas. Filtre por título e/ou descrição usando query params.',
            querystring: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        description: 'Filtra tarefas que contenham o texto no título',
                    },
                    description: {
                        type: 'string',
                        description: 'Filtra tarefas que contenham o texto na descrição',
                    },
                },
            },
            response: {
                200: {
                    description: 'Lista de tarefas retornada com sucesso',
                    type: 'array',
                    items: TaskRef,
                },
            },
        },
    }, async (request, reply) => {
        const listTasksQueryParsed = listTasksQuerySchema.parse(request.query)

        const prismaTasksRepository = new PrismaTasksRepository()
        const listTasks = new ListTasksUseCase(prismaTasksRepository)
        const { tasks } = await listTasks.execute(listTasksQueryParsed)

        return reply.send(tasks)
    })

    app.put<{ Params: UpdateTaskRouteParams }>('/tasks/:id', {
        schema: {
            tags: ['Tasks'],
            summary: 'Atualizar uma tarefa',
            description:
                'Atualiza título e/ou descrição de uma tarefa. Pelo menos um campo deve ser informado.',
            params: uuidParam,
            body: {
                type: 'object',
                properties: {
                    title: {
                        type: 'string',
                        minLength: 1,
                        description: 'Novo título da tarefa',
                    },
                    description: {
                        type: 'string',
                        minLength: 1,
                        description: 'Nova descrição da tarefa',
                    },
                },
            },
            response: {
                200: { description: 'Tarefa atualizada com sucesso', ...TaskRef },
                400: { description: 'Nenhum campo fornecido', ...ErrorRef },
                404: { description: 'Tarefa não encontrada', ...ErrorRef },
            },
        },
    }, async (request, reply) => {
        const { id } = taskIdParamsSchema.parse(request.params)
        const updateTaskQueryParsed = updateTaskSchema.parse(request.body)

        if (!updateTaskQueryParsed.title && !updateTaskQueryParsed.description) {
            throw new AppError(
                'Pelo menos um campo (title ou description) deve ser fornecido para atualização',
                400,
            )
        }

        const prismaTasksRepository = new PrismaTasksRepository()
        const taskExists = await prismaTasksRepository.findById(id)

        if (!taskExists) {
            throw new AppError('Tarefa não encontrada', 404)
        }

        const updateTask = new UpdateTaskUseCase(prismaTasksRepository)
        const { updatedTask } = await updateTask.execute(id, updateTaskQueryParsed)

        return reply.send(updatedTask)
    })

    app.patch<{ Params: UpdateTaskRouteParams }>('/tasks/:id/complete', {
        schema: {
            tags: ['Tasks'],
            summary: 'Concluir uma tarefa',
            description:
                'Marca uma tarefa como concluída, preenchendo `completed_at` com a data/hora atual. Não é possível concluir uma tarefa já concluída.',
            params: uuidParam,
            response: {
                200: { description: 'Tarefa concluída com sucesso', ...TaskRef },
                400: { description: 'Tarefa já concluída', ...ErrorRef },
                404: { description: 'Tarefa não encontrada', ...ErrorRef },
            },
        },
    }, async (request, reply) => {
        const { id } = taskIdParamsSchema.parse(request.params)

        const prismaTasksRepository = new PrismaTasksRepository()
        const completeTask = new CompleteTaskUseCase(prismaTasksRepository)
        const { updatedTask } = await completeTask.execute(id)

        return reply.send(updatedTask)
    })

    app.delete<{ Params: UpdateTaskRouteParams }>('/tasks/:id', {
        schema: {
            tags: ['Tasks'],
            summary: 'Deletar uma tarefa',
            description: 'Remove permanentemente uma tarefa pelo seu ID.',
            params: uuidParam,
            response: {
                204: { description: 'Tarefa deletada com sucesso', type: 'null' },
                404: { description: 'Tarefa não encontrada', ...ErrorRef },
            },
        },
    }, async (request, reply) => {
        const { id } = taskIdParamsSchema.parse(request.params)

        const prismaTasksRepository = new PrismaTasksRepository()
        const taskExists = await prismaTasksRepository.findById(id)

        if (!taskExists) {
            throw new AppError('Tarefa não encontrada', 404)
        }

        const deleteTask = new DeleteTaskUseCase(prismaTasksRepository)
        await deleteTask.execute(id)

        return reply.status(204).send()
    })
}
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

export function TasksRoutes(app: FastifyInstance) {
    app.post('/tasks', async (request, reply) => {
        const taskParsed = createTaskSchema.parse(request.body)

        if(!taskParsed.title || !taskParsed.description) {
            throw new AppError('Title e description são obrigatórios', 400)
        }

        const prismaTasksRepository = new PrismaTasksRepository()
        const createTask = new CreateTaskUseCase(prismaTasksRepository)

        const { createdTask } = await createTask.execute(taskParsed)

        return reply.status(201).send(createdTask)
    })

    app.get('/tasks', async (request, reply) => {
        const listTasksQueryParsed = listTasksQuerySchema.parse(request.query)

        const prismaTasksRepository = new PrismaTasksRepository()
        const listTasks = new ListTasksUseCase(prismaTasksRepository)

        const { tasks } = await listTasks.execute(listTasksQueryParsed)

        return reply.send(tasks)
    })

    app.put<{ Params: UpdateTaskRouteParams }>(
        '/tasks/:id',
        async (request, reply) => {
            const { id } = taskIdParamsSchema.parse(request.params)
            const updateTaskQueryParsed = updateTaskSchema.parse(request.body)

            if(!updateTaskQueryParsed.title && !updateTaskQueryParsed.description) {
                throw new AppError('Pelo menos um campo (title ou description) deve ser fornecido para atualização', 400)
            }

            const prismaTasksRepository = new PrismaTasksRepository()
            const taskExists = await prismaTasksRepository.findById(id)

            if (!taskExists) {
                throw new AppError('Tarefa não encontrada', 404)
            }

            const updateTask = new UpdateTaskUseCase(prismaTasksRepository)

            const { updatedTask } = await updateTask.execute(
                id,
                updateTaskQueryParsed,
            )

            return reply.send(updatedTask)
        },
    )

    app.patch<{ Params: UpdateTaskRouteParams }>(
        '/tasks/:id/complete',
        async (request, reply) => {
            const { id } = taskIdParamsSchema.parse(request.params)

            const prismaTasksRepository = new PrismaTasksRepository()
            const completeTask = new CompleteTaskUseCase(prismaTasksRepository)

            const { updatedTask } = await completeTask.execute(id)

            return reply.send(updatedTask)
        },
    )

    app.delete<{ Params: UpdateTaskRouteParams }>(
        '/tasks/:id',
        async (request, reply) => {
            const { id } = taskIdParamsSchema.parse(request.params)

            const prismaTasksRepository = new PrismaTasksRepository()
            const taskExists = await prismaTasksRepository.findById(id)

            if (!taskExists) {
                throw new AppError('Tarefa não encontrada', 404)
            }

            const deleteTask = new DeleteTaskUseCase(prismaTasksRepository)

            await deleteTask.execute(id)

            return reply.status(204).send()
        },
    )
}

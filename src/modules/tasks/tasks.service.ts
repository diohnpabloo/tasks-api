import { TasksRepository } from '@/repositories/tasks-repositories/tasks-repository'
import { createTaskInput, listTasksQueryInput } from './tasks.schema'
import { AppError } from '@/utils/AppError'

export class CreateTaskUseCase {
    constructor(private prismaTasksRepository: TasksRepository) {}

    async execute(task: createTaskInput) {
        const createdTask = await this.prismaTasksRepository.create(task)
        return { createdTask }
    }
}

export class ListTasksUseCase {
    constructor(private prismaTasksRepository: TasksRepository) {}

    async execute(filters?: listTasksQueryInput) {
        const tasks = await this.prismaTasksRepository.list(filters)
        return { tasks }
    }
}

export class UpdateTaskUseCase {
    constructor(private prismaTasksRepository: TasksRepository) {}

    async execute(id: string, data: Partial<createTaskInput>) {
        const taskExists = await this.prismaTasksRepository.findById(id)

        if (!taskExists) {
            throw new AppError('Tarefa não encontrada', 404)
        }

        const updatedTask = await this.prismaTasksRepository.update(id, data)
        return { updatedTask }
    }
}

export class DeleteTaskUseCase {
    constructor(private prismaTasksRepository: TasksRepository) {}

    async execute(id: string) {
        const taskExists = await this.prismaTasksRepository.findById(id)

        if (!taskExists) {
            throw new AppError('Tarefa não encontrada', 404)
        }

        await this.prismaTasksRepository.delete(id)
    }
}

export class CompleteTaskUseCase {
    constructor(private prismaTasksRepository: TasksRepository) {}

    async execute(id: string) {
        const taskExists = await this.prismaTasksRepository.findById(id)

        if (!taskExists) {
            throw new AppError('Tarefa não encontrada', 404)
        }
        if (taskExists.completed_at) {
            throw new AppError('Tarefa já foi concluída', 400)
        }
        const updatedTask = await this.prismaTasksRepository.complete(id)
        return { updatedTask }
    }
}

import { prisma } from '../../../lib/prisma'
import type { Prisma, Task } from '../../../generated/prisma/client'
import type { TaskCreateInput } from '../../../generated/prisma/models/Task'
import { TasksRepository } from './tasks-repository'
import type { listTasksQueryInput } from '@/modules/tasks/tasks.schema'

export class PrismaTasksRepository implements TasksRepository {
    async findById(id: string): Promise<Task | null> {
        const task = await prisma.task.findUnique({
            where: { id },
        })

        return task
    }
    async update(
        id: string,
        data: Partial<TaskCreateInput>,
    ): Promise<Task | null> {
        const task = await prisma.task.update({
            where: { id },
            data: {
                ...('title' in data && { title: data.title }),
                ...('description' in data && { description: data.description }),
                updated_at: new Date(),
            },
        })

        return task
    }
    async create(data: TaskCreateInput) {
        const task = await prisma.task.create({
            data,
        })

        return task
    }

    async list(filters?: listTasksQueryInput) {
        const title = filters?.title?.trim()
        const description = filters?.description?.trim()

        const conditions: Prisma.TaskWhereInput[] = []

        if (title) {
            conditions.push({
                title: {
                    contains: title,
                    mode: 'insensitive',
                },
            })
        }

        if (description) {
            conditions.push({
                description: {
                    contains: description,
                    mode: 'insensitive',
                },
            })
        }

        const tasks = await prisma.task.findMany(
            conditions.length > 0 ? { where: { OR: conditions } } : undefined,
        )

        return tasks
    }

    async delete(id: string): Promise<void> {
        await prisma.task.delete({
            where: { id },
        })
    }

    async complete(id: string): Promise<Task | null> {
        const task = await prisma.task.update({
            where: { id },
            data: { completed_at: new Date() },
        })
        return task
    }
}

import { randomUUID } from 'node:crypto'
import { Prisma, Task } from '../../../generated/prisma/client'
import { TasksRepository } from '../tasks-repositories/tasks-repository'
import { listTasksQueryInput } from '@/modules/tasks/tasks.schema'

export class InMemoryTasksRepository implements TasksRepository {
    private tasks: Task[] = []

    async create(data: Prisma.TaskCreateInput) {
        const task = {
            id: randomUUID(),
            title: data.title,
            description: data.description,
            completed_at: null,
            created_at: new Date(),
            updated_at: new Date(),
        }
        this.tasks.push(task)
        return task
    }

    async list(filters?: listTasksQueryInput) {
        const title = filters?.title?.trim().toLowerCase()
        const description = filters?.description?.trim().toLowerCase()

        if (!title && !description) {
            return this.tasks
        }

        return this.tasks.filter((task) => {
            const matchesTitle = title
                ? task.title.toLowerCase().includes(title)
                : false

            const matchesDescription = description
                ? task.description.toLowerCase().includes(description)
                : false

            return matchesTitle || matchesDescription
        })
    }

    async findById(id: string) {
        return this.tasks.find((task) => task.id === id) || null
    }

    async update(id: string, data: Partial<Prisma.TaskCreateInput>) {
        const taskIndex = this.tasks.findIndex((task) => task.id === id)

        if (taskIndex === -1) {
            return null
        }

        const task = this.tasks[taskIndex]

        this.tasks[taskIndex] = {
            ...task,
            ...('title' in data && { title: data.title }),
            ...('description' in data && { description: data.description }),
            updated_at: new Date(),
        }

        return this.tasks[taskIndex]
    }

    async delete(id: string) {
        const taskIndex = this.tasks.findIndex((task) => task.id === id)

        if (taskIndex === -1) {
            return
        }

        this.tasks.splice(taskIndex, 1)
    }

    async complete(id: string) {
        const taskIndex = this.tasks.findIndex((task) => task.id === id)

        if (taskIndex === -1) {
            return null
        }

        this.tasks[taskIndex] = {...this.tasks[taskIndex], completed_at: new Date(), updated_at: new Date()}
        return this.tasks[taskIndex]
    }
}

import { Task } from '../../../generated/prisma/client'
import type { TaskCreateInput } from '../../../generated/prisma/models/Task'
import { listTasksQueryInput } from '@/modules/tasks/tasks.schema'

export interface TasksRepository{
    create(data: TaskCreateInput): Promise<Task>

    list(filters?: listTasksQueryInput): Promise<Task[]>

    findById(id: string): Promise<Task | null>
    update(id: string, data: Partial<TaskCreateInput>): Promise<Task | null>
    delete(id: string): Promise<void>
    complete(id: string): Promise<Task | null>
}

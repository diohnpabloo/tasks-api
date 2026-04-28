import { describe, expect, it } from 'vitest'
import { InMemoryTasksRepository } from '@/repositories/in-memory/in-memory-tasks-repository'
import {
    CompleteTaskUseCase,
    CreateTaskUseCase,
    DeleteTaskUseCase,
    ListTasksUseCase,
    UpdateTaskUseCase,
} from './tasks.service'

describe('Task Use Case', () => {
    it('should be able to create a task', async () => {
        const tasksRepository = new InMemoryTasksRepository()
        const createTaskUseCase = new CreateTaskUseCase(tasksRepository)

        const { createdTask } = await createTaskUseCase.execute({
            title: 'Test Task',
            description: 'This is a test task',
        })

        expect(createdTask.title).toEqual('Test Task')
        expect(createdTask.description).toEqual('This is a test task')
    })

    it('should be able to list tasks', async () => {
        const tasksRepository = new InMemoryTasksRepository()
        const createTaskUseCase = new CreateTaskUseCase(tasksRepository)
        const listTasksUseCase = new ListTasksUseCase(tasksRepository)

        await createTaskUseCase.execute({
            title: 'Clean House',
            description: 'Clean the house',
        })
        await createTaskUseCase.execute({
            title: 'Buy groceries',
            description: 'Milk, eggs and bread',
        })
        const { tasks } = await listTasksUseCase.execute()
        expect(tasks.length).toEqual(2)

        const { tasks: tasksByTitle } = await listTasksUseCase.execute({
            title: 'Clean',
        })
        expect(tasksByTitle).toHaveLength(1)
        expect(tasksByTitle[0].title).toEqual('Clean House')

        const { tasks: tasksByDescription } = await listTasksUseCase.execute({
            description: 'Milk',
        })
        expect(tasksByDescription).toHaveLength(1)
        expect(tasksByDescription[0].description).toEqual(
            'Milk, eggs and bread',
        )

        const { tasks: noTasks } = await listTasksUseCase.execute({
            title: 'Non existing task',
        })
        expect(noTasks).toHaveLength(0)
    })
    it('should be able to update a task', async () => {
        const tasksRepository = new InMemoryTasksRepository()
        const createTaskUseCase = new CreateTaskUseCase(tasksRepository)
        const updateTaskUseCase = new UpdateTaskUseCase(tasksRepository)

        const { createdTask } = await createTaskUseCase.execute({
            title: 'Test Task',
            description: 'This is a test task',
        })

        const { updatedTask } = await updateTaskUseCase.execute(
            createdTask.id,
            {
                title: 'Updated Task',
            },
        )
        expect(updatedTask?.id).toEqual(createdTask.id)
        expect(updatedTask?.title).toEqual('Updated Task')
        expect(updatedTask?.description).toEqual('This is a test task')
    })

    it('should be able to delete a task', async () => {
        const tasksRepository = new InMemoryTasksRepository()
        const createTaskUseCase = new CreateTaskUseCase(tasksRepository)
        const deleteTaskUseCase = new DeleteTaskUseCase(tasksRepository)

        const { createdTask } = await createTaskUseCase.execute({
            title: 'Test Task',
            description: 'This is a test task',
        })

        await deleteTaskUseCase.execute(createdTask.id)

        const foundTask = await tasksRepository.findById(createdTask.id)
        expect(foundTask).toBeNull()
    })

    it('should be able to complete a task', async () => {
        const tasksRepository = new InMemoryTasksRepository()
        const createTaskUseCase = new CreateTaskUseCase(tasksRepository)
        const completeTaskUseCase = new CompleteTaskUseCase(tasksRepository)

        const { createdTask } = await createTaskUseCase.execute({
            title: 'Test Task',
            description: 'This is a test task',
        })

        await completeTaskUseCase.execute(createdTask.id)

        const foundTask = await tasksRepository.findById(createdTask.id)
        expect(foundTask).not.toBeNull()
        expect(foundTask?.completed_at).toBeInstanceOf(Date)
    })
})

import z from 'zod'

export const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
})

export const listTasksQuerySchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
})

export const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
})

export const taskIdParamsSchema = z.object({
    id: z.string().min(1),
})

export type createTaskInput = z.infer<typeof createTaskSchema>
export type listTasksQueryInput = z.infer<typeof listTasksQuerySchema>
export type updateTaskInput = z.infer<typeof updateTaskSchema>
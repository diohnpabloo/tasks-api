import { FastifyInstance } from 'fastify'
import { AppError } from '@/utils/AppError'
import { ZodError } from 'zod'

export function errorHandling(app: FastifyInstance) {
    app.setErrorHandler((error, request, reply) => {
        if (error instanceof AppError) {
            return reply.status(error.statusCode).send({
                message: error.message,
            })
        }
        else if(error instanceof ZodError) {
            return reply.status(400).send({
                errors: error.issues.map((issue) => ({
                    message: issue.message,
                    path: issue.path,
                }))
            })
        }
        else {
            return reply.status(500).send({
                message: 'Erro interno no servidor.',
            })
        }
    })
}

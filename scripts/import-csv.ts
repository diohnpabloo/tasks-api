import fs from 'node:fs'
import path from 'node:path'
import { parse } from 'csv-parse'

const API_BASE_URL = 'http://localhost:3333'
const CSV_PATH = path.resolve(process.cwd(), 'scripts', 'tasks.csv')

async function importTasks() {
    const parser = fs.createReadStream(CSV_PATH).pipe(
        parse({
            from_line: 2, // skip header
            skip_empty_lines: true,
            trim: true,
        }),
    )

    let lineNumber = 1

    for await (const record of parser) {
        lineNumber += 1

        const [title, description] = record as string[]

        if (!title || !description) {
            throw new Error(`Linha ${lineNumber} invalida: title/description obrigatorios.`)
        }

        const response = await fetch(`${API_BASE_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, description }),
        })

        if (!response.ok) {
            const errorBody = await response.text()
            throw new Error(
                `Falha na linha ${lineNumber} (${response.status}): ${errorBody}`,
            )
        }

        console.log(`Linha ${lineNumber}: tarefa criada -> ${title}`)
    }

    console.log('Importacao finalizada com sucesso.')
}

importTasks().catch((error) => {
    console.error('Erro ao importar CSV:', error)
    process.exit(1)
})

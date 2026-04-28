import { parse } from 'csv-parse'
import fs from 'node:fs'

// 1. Cria o stream de leitura do arquivo CSV
const csvPath = new URL('./tasks.csv', import.meta.url)

const stream = fs.createReadStream(csvPath)

// 2. Configura o parser
const csvParse = parse({
  delimiter: ',',
})

// 3. Conecta o stream ao parser
const parser = stream.pipe(csvParse)

// 4. Itera sobre cada linha com for await
for await (const row of parser) {

  // 5. Pula a primeira linha (cabeçalho)
  if (row[0] === 'title') continue

  const [title, description] = row

  // 6. Faz a requisição POST para a rota /tasks
  const response = await fetch('http://localhost:3333/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title,
      description,
    }),
  })

  if(!response.ok) {
    console.error(`❌ Erro ao criar tarefa "${title}": ${response.status}`)
    continue
  }

  console.log(`✅ Tarefa criada: ${title}`)
}